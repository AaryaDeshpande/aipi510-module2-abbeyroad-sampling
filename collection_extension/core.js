(function(root) {
  'use strict';
  const seconds = text => {
    if (!/^\d{2}:\d{2}:\d{2}$/.test(text)) throw new Error('Invalid GMT timestamp: '+text);
    const [h,m,s]=text.split(':').map(Number);
    if(h>23||m>59||s>59) throw new Error('Invalid GMT timestamp: '+text);
    return h*3600+m*60+s;
  };
  function buttonStart(text) {
    const m=text.trim().match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    if(!m || +m[1]<1 || +m[1]>12 || +m[2]>59) throw new Error('Invalid archive button');
    return ((+m[1]%12)+(m[3].toUpperCase()==='PM'?12:0))*3600+(+m[2])*60;
  }
  function identity(source) {
    const m=String(source).match(/\/abbeyroad_archives\/(\d{4})\/(\d{2})\/(\d{2})\/(\d{2})(\d{2})\.mp4(?:\/|$)/i);
    if(!m) return null;
    const url=new URL(source);
    if(url.protocol!=='https:' || !/(^|\.)earthcam\.com$/.test(url.hostname)) return null;
    return {date:`${m[1]}-${m[2]}-${m[3]}`,startSeconds:(+m[4])*3600+(+m[5])*60,hour:+m[4],minute:+m[5],source};
  }
  function mapping(obs,source,duration) {
    const id=identity(source);
    if(!id) throw new Error('Cannot verify a dated archive source. Click the indicated archive manually, then retry. Live and unidentified sources are blocked.');
    if(id.date!==obs.date || id.startSeconds!==buttonStart(obs.archive_button)) throw new Error(`Wrong archive: loaded ${id.date} ${format(id.startSeconds)}, expected ${obs.date} ${obs.archive_button}. No substitution is allowed.`);
    const start=seconds(obs.start_GMT)-id.startSeconds, end=start+300;
    if(start<0 || !Number.isFinite(duration) || duration+0.001<end) throw new Error(`Archive is not ready or too short: this window needs media ${format(start)}–${format(end)}; loaded duration ${Number.isFinite(duration)?duration.toFixed(3):'unknown'} s.`);
    return {...id,mediaStart:start,mediaEnd:end,duration,clockBasis:'Official archive button data-time and dated Video.js source filename; media zero is the declared archive start, not always HH:00.'};
  }
  function validate(p) {
    const errors=[],seen=new Set(); let prior=-1;
    if(p.observations?.length!==36) errors.push('Expected exactly 36 observations');
    for(const o of p.observations || []) {
      const tag=`Recording ${o.id}`;
      try {
        if(seen.has(o.id)) throw new Error('Duplicate ID'); seen.add(o.id);
        if(o.date!=='2026-11-03' || o.timezone!=='Europe/London') throw new Error('Unexpected date/time zone');
        const a=seconds(o.start_GMT),b=seconds(o.end_GMT);
        if(b-a!==300 || a<prior) throw new Error('Windows overlap or are not 300 seconds'); prior=b;
        if(o.A_duration_seconds!==60 || ![0,60,120,180,240].includes(o.A_start_offset_seconds)) throw new Error('A is not one of the five fixed 60-second blocks');
        if(o.B_duration_each_seconds!==10 || o.B_start_offsets_seconds?.length!==6) throw new Error('B must have six 10-second intervals');
        o.B_start_offsets_seconds.forEach((s,i)=>{if(!Number.isInteger(s)||s%10!==0||s<i*50||s>i*50+40)throw new Error('B offset outside its stratum');});
        if(buttonStart(o.archive_button)>a) throw new Error('Observation precedes archive');
        if(o.hour_cluster!==Math.floor(a/3600)) throw new Error('Hour cluster mismatch');
      } catch(e) { errors.push(tag+': '+e.message); }
    }
    return errors;
  }
  function effective(e) { return e.corrected_relative_seconds ?? e.relative_time_seconds; }
  function derive(obs,record) {
    const events=(record?.events || []).filter(e=>!e.deleted && effective(e)>=0 && effective(e)<300);
    const A=events.filter(e=>effective(e)>=obs.A_start_offset_seconds && effective(e)<obs.A_start_offset_seconds+60).length;
    const B=events.filter(e=>obs.B_start_offsets_seconds.some(s=>effective(e)>=s && effective(e)<s+10)).length;
    const full=events.length;
    return {full_count:full,A_count:A,B_count:B,estimate_A:A*5,estimate_B:B*5,absolute_error_A:Math.abs(A*5-full),absolute_error_B:Math.abs(B*5-full)};
  }
  function observationData(o,r={}) {
    if(r.collectionMode==='manual') {
      const m=r.manual||{},complete=!!m.confirmed&&['full_count','A_count','B_count'].every(k=>Number.isInteger(m[k])&&m[k]>=0);
      const d={full_count:m.full_count,A_count:m.A_count,B_count:m.B_count};
      return {complete,counts:{...d,estimate_A:d.A_count*5,estimate_B:d.B_count*5,absolute_error_A:Math.abs(d.A_count*5-d.full_count),absolute_error_B:Math.abs(d.B_count*5-d.full_count)},verified:false,mode:'manual_separate_intervals'};
    }
    return {complete:!!r.completedAt&&covered(r),counts:derive(o,r),verified:!!r.clockVerified&&!!r.source&&r.source.date===o.date&&r.source.startSeconds===buttonStart(o.archive_button),mode:'video_timestamp_events'};
  }
  function recoveryConflict(r={}){return !r.completedAt&&(r.events||[]).some(e=>!e.deleted&&e.input_method!=='manual_review_timestamp'&&effective(e)>(r.cursor||0)+1.5);}
  function precise(t){if(!Number.isFinite(t))return '--:--:--.---';const ms=Math.max(0,Math.round(t*1000));return format(Math.floor(ms/1000))+'.'+String(ms%1000).padStart(3,'0');}
  function mergeRanges(ranges,range) {
    const sorted=[...ranges,range].filter(([a,b])=>b>a).map(([a,b])=>[Math.max(0,a),Math.min(300,b)]).sort((a,b)=>a[0]-b[0]);
    const out=[];
    for(const [a,b] of sorted){ const last=out.at(-1); if(last&&a<=last[1]+0.12)last[1]=Math.max(last[1],b);else out.push([a,b]); }
    return out;
  }
  function covered(record) { const r=record?.coverage || [];return r.length===1&&r[0][0]<=0.12&&r[0][1]>=299.999; }
  function format(t) { if(!Number.isFinite(t))return '--:--';const s=Math.max(0,t);return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(Math.floor(s)%60).padStart(2,'0')}`; }
  function csv(rows,headers) {
    const cell=x=>{const s=x==null?'':String(x); const safe=/^[=+@]/.test(s)?"'"+s:s;return /[",\r\n]/.test(safe)?'"'+safe.replaceAll('"','""')+'"':safe;};
    return [headers,...rows.map(r=>headers.map(h=>r[h]))].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
  }
  function exports(p,state,sha) {
    const counts=[],results=[],events=[];
    for(const o of p.observations) {
      const r=state.records[o.id] || {},data=observationData(o,r),done=data.complete,d=data.counts;
      const base={clip_id:o.id,date:o.date,timezone:o.timezone,archive_button:o.archive_button,start_GMT:o.start_GMT,end_GMT:o.end_GMT};
      counts.push({...base,full_count:done?d.full_count:'',A_count:done?d.A_count:'',B_count:done?d.B_count:'',validity:r.validity||'',notes:r.notes||'',collection_mode:data.mode,clock_verified:data.verified,collection_status:done?'recorded':(r.events?.length||r.cursor?'incomplete':'not_started')});
      results.push({...base,...Object.fromEntries(Object.entries(d).map(([k,v])=>[k,done?v:''])),included_in_primary_analysis:done&&data.verified&&r.validity==='valid',collection_status:counts.at(-1).collection_status});
      for(const e of r.events || [])events.push({clip_id:o.id,event_id:e.id,original_media_time_seconds:e.media_time_seconds,original_relative_time_seconds:e.relative_time_seconds,corrected_relative_seconds:e.corrected_relative_seconds??'',effective_relative_seconds:effective(e),deleted:!!e.deleted,in_full:!e.deleted&&effective(e)>=0&&effective(e)<300,in_A:!e.deleted&&effective(e)>=o.A_start_offset_seconds&&effective(e)<o.A_start_offset_seconds+60,in_B:!e.deleted&&o.B_start_offsets_seconds.some(s=>effective(e)>=s&&effective(e)<s+10),created_at:e.created_at,input_method:e.input_method,corrections_json:JSON.stringify(e.corrections||[])});
    }
    const eventHeaders=['clip_id','event_id','original_media_time_seconds','original_relative_time_seconds','corrected_relative_seconds','effective_relative_seconds','deleted','in_full','in_A','in_B','created_at','input_method','corrections_json'];
    return {'experiment_protocol.json':JSON.stringify(p,null,2)+'\n','pedestrian_counts.csv':csv(counts,Object.keys(counts[0])), 'crossing_events.csv':csv(events,eventHeaders),'experiment_results.csv':csv(results,Object.keys(results[0])),
      'experiment_metadata.json':JSON.stringify({schema_version:1,source_url:'https://www.abbeyroad.com/crossing',exported_at:new Date().toISOString(),protocol_sha256:sha,original_protocol:p,random_seed:p.seed,provenance:'Each event is a manual +1 action. Timestamp = HTMLVideoElement.currentTime, relative to the verified archive/window mapping. No media captured or uploaded.',boundary_rule:'Half-open [start,end). Raw timestamps retained alongside any manual corrections/deletions.',incomplete_observations:counts.filter(r=>r.collection_status!=='recorded').map(r=>r.clip_id),unreviewed_or_invalid:counts.filter(r=>r.validity!=='valid').map(r=>r.clip_id),state},null,2)};
  }
  function zip(files) {
    const enc=new TextEncoder(),chunks=[],directory=[];let position=0;
    const table=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
    const header=(n)=>new Uint8Array(n),put=(a,off,value,size=4)=>{const v=new DataView(a.buffer);size===2?v.setUint16(off,value,true):v.setUint32(off,value,true);};
    for(const [name,text] of Object.entries(files)) {
      const fn=enc.encode(name),data=text instanceof Uint8Array?text:enc.encode(text);let crc=0xffffffff;for(const b of data)crc=table[(crc^b)&255]^(crc>>>8);crc=(crc^0xffffffff)>>>0;
      const local=header(30);put(local,0,0x04034b50);put(local,4,20,2);put(local,14,crc);put(local,18,data.length);put(local,22,data.length);put(local,26,fn.length,2);
      chunks.push(local,fn,data);
      const cent=header(46);put(cent,0,0x02014b50);put(cent,4,20,2);put(cent,6,20,2);put(cent,16,crc);put(cent,20,data.length);put(cent,24,data.length);put(cent,28,fn.length,2);put(cent,42,position);directory.push(cent,fn);position+=local.length+fn.length+data.length;
    }
    const size=directory.reduce((n,a)=>n+a.length,0),end=header(22);put(end,0,0x06054b50);put(end,8,Object.keys(files).length,2);put(end,10,Object.keys(files).length,2);put(end,12,size);put(end,16,position);
    const all=[...chunks,...directory,end],out=new Uint8Array(all.reduce((n,a)=>n+a.length,0));let at=0;for(const part of all){out.set(part,at);at+=part.length;}return out;
  }
  const api={seconds,buttonStart,identity,mapping,validate,effective,derive,observationData,recoveryConflict,mergeRanges,covered,format,precise,csv,exports,zip};
  root.AbbeyCore=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
