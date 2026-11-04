(() => {
  'use strict';
  if (globalThis.__AbbeyCounter) { globalThis.__AbbeyCounter.toggle(); return; }
  const C=globalThis.AbbeyCore,P=globalThis.AbbeyProtocol,SHA=globalThis.AbbeyProtocolSha256;
  const protocolErrors=C.validate(P);
  let ready=false;
  let state={schema:1,revision:0,protocolSha256:SHA,selectedId:'01',records:{}},revision=0,saveQueue=Promise.resolve(),saveFailed=false;
  let video=null,active=false,preparing=false,internalSeek=0,reviewing=false,blocked=false,previous=null,lastSaveMedia=0,lastRender=0,loadEpoch=0;
  let diskStatus=null,loadFailed=false;
  let sourceInfo=null,nativeSource='',practice=null,finishPending=false,prepared=false,lastMessage='Ready. Start verifies the dated archive before counting.';
  const root=document.createElement('div');root.id='aipi-abbey-counter';
  root.style.cssText='position:fixed;right:16px;top:72px;width:356px;z-index:2147483647;';
  const shadow=root.attachShadow({mode:'open'});document.documentElement.append(root);
  shadow.innerHTML=`<style>
:host{all:initial;color-scheme:light;font:13px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#182b37}*{box-sizing:border-box}button,input,select,textarea{font:inherit}button{cursor:pointer;border:1px solid #dce2e5;border-radius:9px;background:#fff;color:#233746;padding:9px}button:hover{background:#f2f5f7}button:disabled{cursor:default;opacity:.4}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #70b3ff;outline-offset:1px}[hidden]{display:none!important}.panel{background:#fff;border:1px solid #d9e1e6;border-radius:16px;box-shadow:0 8px 32px #14263622;overflow:hidden}.head{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;background:#f6f8fa;border-bottom:1px solid #e5eaee;cursor:move}.head strong{font-size:13px}.head button{border:0;padding:0 5px;background:none}.body{padding:12px;max-height:calc(100vh - 128px);overflow:auto}.row{display:flex;gap:7px;align-items:center;margin:7px 0}.row>*{flex:1;min-width:0}.title{font-size:18px;font-weight:750}.sub{font-size:11px;color:#647583}select,input{width:100%;border:1px solid #dce2e5;border-radius:8px;padding:7px;background:white;color:#233746}.clockrow{display:flex;justify-content:space-between;align-items:baseline;margin-top:9px}.clock{font-size:32px;font-weight:750;letter-spacing:-1px;font-variant-numeric:tabular-nums}.clock small{font-size:14px;color:#7b8995;letter-spacing:0}.big{width:100%;background:#1268d3;color:white;border:0;font-weight:700;font-size:21px;padding:15px}.big:hover{background:#095bbf}.primary{background:#172f42;color:white;border-color:#172f42}.primary:hover{background:#24465f}.danger{color:#a74435}.message{font-size:11px;color:#536977;background:#f3f6f8;border-radius:8px;padding:7px 9px;margin:7px 0}.error{background:#fff0e9;color:#94421c}.saved{font-size:11px;color:#167052;margin-top:5px}.counts{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.counts>div{border:1px solid #e5eaee;border-radius:9px;padding:7px 9px;display:flex;justify-content:space-between;align-items:center}.counts b{font-size:20px}.counts span{font-size:11px;color:#637782}.counts>div:nth-child(2){background:#eff5ff}.counts>div:nth-child(3){background:#eefaf7}.progress{height:5px;background:#e9edf0;border-radius:4px;overflow:hidden;margin:7px 0}.progress>div{height:100%;background:#17a184}.clipgrid{display:grid;grid-template-columns:repeat(12,1fr);gap:3px;margin:7px 0}.clipgrid button{padding:3px 0;border-radius:4px;font-size:9px;background:#f0f3f5;border:1px solid transparent}.clipgrid button.current{border-color:#1268d3;box-shadow:0 0 0 1px #1268d3}.clipgrid button.partial{background:#fff0cb}.clipgrid button.done{background:#bcf0dc}.clipgrid button.bad{background:#ffd9d0}.timeline{margin-top:8px;background:#f8fafc;border-radius:9px;padding:8px}.barrow{display:grid;grid-template-columns:30px 1fr 26px;gap:6px;align-items:center;font-size:10px;margin:5px 0}.track{position:relative;height:9px;border-radius:3px;background:#e4eaf0;overflow:hidden}.segment{position:absolute;height:100%;border-radius:2px}.cursor{position:absolute;top:0;bottom:0;width:2px;background:#e05b2c;z-index:2}.times{display:flex;justify-content:space-between;font-size:10px;color:#657987}.stats{font-size:11px;color:#435b6c}.tiny{font-size:10px;padding:4px}.check{display:flex;align-items:center;gap:5px;font-size:11px}.check input{width:auto}.minimized .body{display:none}details{margin:8px 0;font-size:11px}summary{cursor:pointer;color:#617989}label{display:block;font-size:11px;margin:6px 0 3px}textarea{width:100%}.eventlist{max-height:220px;overflow:auto}table{width:100%;font-size:10px;border-collapse:collapse}td{padding:3px;border-bottom:1px solid #e4eaf0}td input{min-width:58px}.near{background:#fff0bb}.deleted{opacity:.4}p{margin:5px 0}
</style><section class="panel"><header class="head"><strong>Abbey Road · Firefox 1.3</strong><span><button id="minimize" title="Collapse">−</button><button id="hide" title="Hide and pause">×</button></span></header><div class="body">
<div class="row"><div id="recordTitle" class="title">01 / 36</div><select id="choose" aria-label="Choose recording"></select></div>
<div id="archive" class="sub"></div><div id="window" style="font-size:15px;font-weight:650;margin-top:3px"></div>
<div class="clockrow"><div class="clock"><span id="clock">00:00</span><small> / 05:00</small></div><div id="remaining" class="sub"></div></div><div id="media" class="sub"></div>
<div id="visual" class="timeline"><div id="timeline"></div><div id="blockNow" class="sub"></div></div>
<div class="counts"><div><span>FULL</span><b id="fullLive">0</b></div><div><span>A</span><b id="aLive">0</b></div><div><span>B</span><b id="bLive">0</b></div></div>
<div class="row"><button id="start" class="primary">Start 5 minutes</button><button id="pause">Pause</button></div>
<button id="count" class="big" disabled>+1 Pedestrian <span id="tally" hidden>0</span></button>
<div class="row"><button id="undo">Undo</button><button id="restart" class="danger">Restart</button></div>
<div id="message" class="message" role="status"></div><div id="practiceBanner" class="message error" hidden>Practice only — not experiment data</div>
<div class="row"><button id="prev">← Previous</button><select id="validity" aria-label="Recording validity"><option value="">Not reviewed</option><option value="valid">Valid</option><option value="uncertain">Review</option><option value="invalid">Invalid</option></select><button id="next">Next →</button></div>
<div id="progressText" class="sub"></div><div class="progress"><div id="progressBar"></div></div><div id="clipgrid" class="clipgrid"></div>
<div id="saved" class="saved">Loading saved progress…</div><div id="diskSaved" class="saved">Live file not connected</div>
<div class="row"><button id="connect">Connect live folder</button><button id="export">Export backup ZIP</button></div>
<div id="derived" class="stats" hidden></div>
<details id="advanced"><summary>Event corrections / tools</summary><label class="check"><input type="checkbox" id="keys" checked> Space counts when panel is focused</label><textarea id="notes" hidden></textarea><details id="manual"><summary>Manual fallback — separate Full / A / B viewing</summary><p>Use only when the archive clock cannot be verified. These are separately entered observations, never inferred events. Manual mode cannot be marked video-clock verified.</p><label class="check"><input type="checkbox" id="manualMode"> Use manual separate-interval counts for this recording</label><div id="manualIntervals"></div><div class="row"><input id="manualFull" type="number" min="0" step="1" placeholder="Full count" aria-label="Manual Full count"><input id="manualA" type="number" min="0" step="1" placeholder="A count" aria-label="Manual A count"><input id="manualB" type="number" min="0" step="1" placeholder="B count" aria-label="Manual B count"></div><label class="check"><input type="checkbox" id="manualConfirmed"> I separately watched every listed Full, A and B interval</label></details><details id="review"><summary>Review / correct crossing events</summary><p>Yellow rows are within 0.5 s of an A/B boundary. Pauses and review seeks never advance a stopwatch. Corrections retain original timestamps.</p><div id="intervals"></div><div class="eventlist"><table><thead><tr><th>Relative seconds</th><th>Review</th><th>Correct</th><th>Remove</th></tr></thead><tbody id="events"></tbody></table></div><label>Add a missed crossing after reviewing its frame</label><div class="row"><input id="manualTime" type="number" min="0" max="299.999999" step="0.001" placeholder="Relative seconds" aria-label="Missed event relative seconds"><button id="manualAdd" class="tiny">Add manually</button></div></details>
  <details><summary>Player details</summary><p id="source">No dated archive verified yet.</p><p>9:06 AM starts at 09:06, so 09:15 is media 00:09:00. Missing or wrong-date sources are blocked. If automatic selection fails, click the specified archive yourself, wait for it to load, and click Start again.</p><p>One counting tab at a time. Click native player controls to return Space to the website; click +1 to focus counting again. Keep this tab visible during collection.</p></details>
  <div class="row"><button id="practice">10-second practice</button><button id="exitPractice" hidden>Exit practice</button></div><div class="row"><button id="backup" title="Save recoverable metadata JSON">Backup JSON</button></div>
  <label class="sub">Restore exported experiment_metadata.json<input id="restore" type="file" accept="application/json,.json"></label>
</details></div></section>`;
  const $=id=>shadow.getElementById(id),obs=()=>P.observations.find(o=>o.id===state.selectedId),record=()=>state.records[state.selectedId] ||= {events:[],coverage:[],cursor:0,status:'not_started',validity:'',notes:'',audits:[]};
  const audit=(type,detail={})=>record().audits.push({type,at:new Date().toISOString(),...detail});
  const message=(text,error=false)=>{lastMessage=text;$('message').textContent=text;$('message').classList.toggle('error',error);};
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function save() {
    if(saveFailed||!ready)return Promise.resolve();
    const snapshot=structuredClone(state);$('saved').textContent='Saving locally…';
    saveQueue=saveQueue.then(async()=>{
      if(saveFailed)return;
      const response=await browser.runtime.sendMessage({type:'AR_SAVE',expectedRevision:revision,state:snapshot});
      if(!response?.ok)throw new Error(response?.error || 'Local storage did not confirm the save');
      revision=response.revision;state.revision=revision;diskStatus=response.disk||diskStatus;$('saved').textContent='✓ Firefox saved '+new Date().toLocaleTimeString()+' · revision '+revision;renderDisk();
    }).catch(error=>{saveFailed=true;active=false;blocked=true;video?.pause();message('SAVE FAILED. Export a backup before reloading. '+error.message,true);$('saved').textContent='Unsaved changes remain in this panel';});
    return saveQueue;
  }
  function bridge(retrySource=null,requestArchives=false) {
    return new Promise(resolve=>{
      const requestId=crypto.randomUUID();
      const listener=e=>{if(e.source===window&&e.origin===location.origin&&e.data?.type==='AR_PLAYER_RESPONSE'&&e.data.requestId===requestId){cleanup();resolve(e.data);}};
      const timer=setTimeout(()=>{cleanup();resolve(null);},requestArchives?9000:350);
      function cleanup(){clearTimeout(timer);window.removeEventListener('message',listener);}
      window.addEventListener('message',listener);window.postMessage({type:'AR_PLAYER_REQUEST',requestId,retrySource,requestArchives},location.origin);
    });
  }
  function renderDisk(){ $('diskSaved').textContent=diskStatus?.ok?'✓ Live files saved '+new Date(diskStatus.savedAt).toLocaleTimeString()+' · revision '+diskStatus.revision:(diskStatus?.error||'Live file not connected'); $('connect').textContent=diskStatus?.ok?'Live folder ✓':'Connect live folder'; }
  function getVideo(){return document.querySelector('#video1 video') || document.querySelector('video');}
  async function currentSource(){const v=getVideo(),owned=globalThis.AbbeyStream?.source(v);if(owned)return owned;const b=await bridge();return b?.source || v?.currentSrc || v?.src || '';}
  function checkpointTail(){
    if(!active||!video||!sourceInfo||previous==null||video.seeking||nativeSource!==video.currentSrc)return;
    const t=video.currentTime,step=t-previous;
    if(step>=0&&step<=1.5){record().coverage=C.mergeRanges(record().coverage,[previous-sourceInfo.mediaStart,Math.min(t-sourceInfo.mediaStart,300)]);record().cursor=Math.max(record().cursor||0,Math.min(300,t-sourceInfo.mediaStart));}
  }
  function blockSeek(){
    if(internalSeek||preparing||!sourceInfo)return;
    previous=null;blocked=true;prepared=false;
    if(practice){video.pause();message('Practice seek detected. Pause / Resume re-verifies and returns to the saved practice position.',true);persistPractice();return;}
    record().needsSeekConfirmation=true;audit('external_seek',{media_time:video.currentTime});
    pause('Seek detected. Counting is paused. Resume requires confirmation and returns to the last safely viewed point.');
  }
  function bindVideo() {
    const next=getVideo();if(!next||next===video)return;video=next;
    video.addEventListener('loadstart',()=>{loadEpoch++;if(!preparing){blocked=true;prepared=false;if(active)pause('Archive changed. Start / Resume must re-verify its date.');}});
    video.addEventListener('seeking',blockSeek);
    video.addEventListener('play',()=>{
      if(preparing||internalSeek||practice||active)return;
      const r=record(),t=video.currentTime,rel=t-(sourceInfo?.mediaStart||0);
      if(sourceInfo&&!blocked&&nativeSource===video.currentSrc&&r.startedAt&&!r.completedAt&&rel>=0&&rel<300&&Math.abs(rel-(r.cursor||0))<.3){active=true;previous=t;r.status='recording';message('Counting · Space or +1 for every crossing.');save();render();}
      else {video.pause();message(r.completedAt?'Finished. Review validity, then Next.':'Use Start / Resume here so timing stays tracked.',true);}
    });
    video.addEventListener('pause',()=>{if(active&&!internalSeek&&!preparing){checkpointTail();active=false;record().status='paused';previous=null;message('Paused at '+C.precise(record().cursor||0).slice(3)+'. Resume continues here.');save();render();}});
    video.addEventListener('waiting',()=>{checkpointTail();previous=null;});
    video.addEventListener('abbey-stream-failed',event=>{blocked=true;prepared=false;loadFailed=true;pause(event.detail+' Use Resume / Retry to reload the same recording.');});
    video.addEventListener('error',()=>{blocked=true;prepared=false;if(active)pause('Playback error. Counts are saved; observation is incomplete.');});
    video.addEventListener('timeupdate',tick);
    video.addEventListener('ended',()=>{if(active&&video.currentTime<(sourceInfo?.mediaEnd||Infinity)){blocked=true;pause('Source ended before the window completed. No footage was substituted.');}});
  }
  async function ensureArchive() {
    const o=obs(),expected=C.buttonStart(o.archive_button),beforeSource=await currentSource();bindVideo();
    const existing=C.identity(beforeSource);
    if(existing?.date===o.date&&existing.startSeconds===expected&&video?.readyState>=2) return C.mapping(o,beforeSource,video.duration);
    if(globalThis.AbbeyStream?.supported()){
      let identified=existing?.date===o.date&&existing.startSeconds===expected?beforeSource:null;
      const cached=record().source?.source,cachedId=C.identity(cached);
      if(!identified&&cachedId?.date===o.date&&cachedId.startSeconds===expected)identified=cached;
      if(!identified){const data=await bridge(null,true);if(data?.archiveError)throw new Error(data.archiveError+'; counts are safe.');identified=data?.archives?.find(url=>{const id=C.identity(url);return id?.date===o.date&&id.startSeconds===expected;});}
      if(identified){message('Loading the verified archive with the streaming compatibility engine…');await globalThis.AbbeyStream.prepare(video,identified,C.seconds(o.start_GMT)-expected);return C.mapping(o,identified,video.duration);}
    }

    const key=String(Math.floor(expected/3600)).padStart(2,'0')+String(Math.floor(expected/60)%60).padStart(2,'0');
    const button=[...document.querySelectorAll('a[data-time],button[data-time],a,button')].find(a=>String(a.getAttribute('data-time')||'').replace(':','').padStart(4,'0')===key || (()=>{const m=a.textContent.replace(/\u00a0/g,' ').trim().match(/^(\d{1,2}):(\d{2})\s*([ap]m)$/i);return m&&C.buttonStart(m[1]+':'+m[2]+' '+m[3])===expected;})());
    if(!button)throw new Error('Cannot find the '+o.archive_button+' archive control. Click that hour on the website, then Retry video.');
    const oldNative=video?.currentSrc,oldEpoch=loadEpoch;
    const cached=record().source?.source,cachedId=C.identity(cached);
    if(video?.error&&cachedId?.date===o.date&&cachedId.startSeconds===expected)await bridge(cached);
    else button.click();
    const until=Date.now()+8500;let last='';
    while(Date.now()<until){
      await delay(250);bindVideo();if(video?.error)throw new Error('Video unavailable in the official player. Retry video, or reload the page. Counts are saved.');const source=await currentSource(),id=C.identity(source);
      last=source;
      if(id?.date===o.date&&id.startSeconds===expected&&video?.readyState>=2&&((video.currentSrc!==oldNative)||loadEpoch>oldEpoch)) {
        const nativeId=C.identity(video.currentSrc);
        if(nativeId&&(nativeId.date!==id.date||nativeId.startSeconds!==id.startSeconds))continue;
        return C.mapping(o,source,video.duration);
      }
    }
    throw new Error('Video unavailable or its date cannot be verified. Click '+o.archive_button+' on the website, then Retry video. Counts are saved.');
  }
  async function seek(target) {
    internalSeek++;previous=null;video.pause();
    try {
      if(Math.abs(video.currentTime-target)>.001){await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>{clean();reject(new Error('Seek timed out. No counting started.'));},12000);
        const done=()=>{clean();resolve();};function clean(){clearTimeout(timer);video.removeEventListener('seeked',done);}
        video.addEventListener('seeked',done);video.currentTime=target;
      });}
      if(Math.abs(video.currentTime-target)>.075)throw new Error('The player did not seek accurately: requested '+target+', got '+video.currentTime);
    } finally {internalSeek--;}
  }
  async function prepareSelection(){
    if(!ready||preparing||practice||record().collectionMode==='manual')return;
    preparing=true;blocked=true;prepared=false;sourceInfo=null;render();message('Loading the required dated archive; playback will remain paused…');
    try{sourceInfo=await ensureArchive();nativeSource=video.currentSrc;record().source=sourceInfo;
      const cursor=record().completedAt?300:Math.max(0,Math.min(record().cursor||0,300));
      await seek(sourceInfo.mediaStart+cursor);prepared=true;blocked=false;
      message(record().requiresRestart?'Video ready. Restart this recording because the earlier playback had a timing gap.':cursor>0?'Paused at saved elapsed '+C.precise(cursor)+'. Resume continues; Restart returns to zero.':'Ready at elapsed 00:00.000. Click Start when ready.');save();
    }catch(e){sourceInfo=null;blocked=true;loadFailed=true;message(e.message,true);}
    finally{preparing=false;render();}
  }
  async function start() {
    if(!ready||preparing||saveFailed||practice||record().collectionMode==='manual')return;
    if(active){pause();return;}
    if(record().requiresRestart){message('Earlier playback was not fully tracked. Use Restart for this recording. Original events are preserved.',true);return;}
    if(record().needsSeekConfirmation&&!confirm('A seek interrupted recording '+state.selectedId+'. Resume will return to its last safely viewed timestamp. Keep existing events and continue? Choose Cancel to remain paused, or use Restart.'))return;
    if(protocolErrors.length){message('Protocol validation failed: '+protocolErrors.join('; '),true);return;}
    if(record().completedAt&&C.covered(record())){message('This recording is already complete. Use Review to correct events, or Restart to collect it again.');return;}
    preparing=true;active=false;blocked=true;reviewing=false;loadFailed=false;render();
    message('Verifying the dated archive and seeking…');
    try {
      sourceInfo=await ensureArchive();nativeSource=video.currentSrc;prepared=true;
      record().source=sourceInfo;const resume=Math.max(0,Math.min(record().cursor||0,299.99));
      if(Math.abs(video.currentTime-(sourceInfo.mediaStart+resume))>.075)await seek(sourceInfo.mediaStart+resume);
      video.playbackRate=1;record().clockVerified=true;record().needsSeekConfirmation=false;record().startedAt ||=new Date().toISOString();record().status='recording';
      active=true;blocked=false;previous=video.currentTime;lastSaveMedia=resume;
      audit('start_or_continue',{relative_seconds:resume,mapping:sourceInfo});
      await video.play();message('Counting active. One press per pedestrian at the crossing midpoint.');$('count').focus();save();
    } catch(e){active=false;blocked=true;loadFailed=true;record().status=record().startedAt?'paused':'not_started';message(e.message,true);save();}
    finally{preparing=false;render();}
  }
  function pause(reason='Paused. Resume continues at this video position.') {
    checkpointTail();active=false;previous=null;if(record().startedAt&&!record().completedAt)record().status='paused';video?.pause();message(reason);save();render();
  }
  async function finish() {
    if(!active||finishPending)return;finishPending=true;checkpointTail();active=false;previous=null;video.pause();
    const actual=video.currentTime,r=record();r.cursor=300;
    try{await seek(sourceInfo.mediaEnd);prepared=true;
      if(C.covered(r)&&r.clockVerified){r.completedAt=new Date().toISOString();r.status='recorded';message('300 video seconds complete. Review validity, then Next.');}
      else{r.status='incomplete';message('The end was reached with missing viewed-media coverage. Restart before marking valid.',true);}
      audit('automatic_stop',{actual_media_time:actual,requested_media_end:sourceInfo.mediaEnd,overshoot_seconds:Math.max(0,actual-sourceInfo.mediaEnd),coverage:r.coverage});
    }catch(e){r.status='incomplete';blocked=true;message('End seek could not be verified: '+e.message,true);}
    finally{finishPending=false;await save();render();}
  }
  function tick() {
    bindVideo();
    if(practice&&video&&nativeSource&&video.currentSrc===nativeSource){
      practice.cursor=Math.max(0,Math.min(10,video.currentTime-practice.mediaStart));
      if(!practice.finished&&video.currentTime>=practice.mediaEnd){practice.finished=true;video.pause();practice.cursor=10;internalSeek++;video.currentTime=practice.mediaEnd;setTimeout(()=>internalSeek--,300);persistPractice();message('Practice stopped automatically at 10 seconds. Test events are separate; Exit practice to collect real observations.');render();}
    }
    if(active&&video&&sourceInfo&&!preparing&&!internalSeek&&!video.seeking){
      if(nativeSource!==video.currentSrc){blocked=true;pause('Source changed; archive re-verification is required.');return;}
      const t=video.currentTime,relative=t-sourceInfo.mediaStart;
      if(!video.paused&&video.readyState>=2){
        if(previous!=null){const step=t-previous;
          if(step<-.04||step>1.5){blocked=true;record().needsSeekConfirmation=true;pause('Playback jumped. Resume asks before returning to the last tracked point; Restart for a fresh observation.');return;}
          if(step>0){record().coverage=C.mergeRanges(record().coverage,[(previous-sourceInfo.mediaStart),Math.min(relative,300)]);record().cursor=Math.min(300,Math.max(record().cursor||0,relative));}
        }
        previous=t;
      }
      if(relative>=300){finish();return;}
      if(relative-lastSaveMedia>=2){lastSaveMedia=relative;save();}
    }
    if(performance.now()-lastRender>100){lastRender=performance.now();renderClock();}
  }
  function canCount() {return record().collectionMode!=='manual'&&!!video&&!!sourceInfo&&!blocked&&!reviewing&&!preparing&&!saveFailed&&nativeSource===video.currentSrc&&video.readyState>=2&&!video.seeking&&(practice?!practice.finished:(!record().completedAt&&!!record().startedAt));}
  function addCount(method='button') {
    if(!canCount()){message('Counting is not armed for a verified window. Start / Continue first.',true);return;}
    tick();if(!canCount())return;const t=video.currentTime,relative=t-(practice?practice.mediaStart:sourceInfo.mediaStart);
    if(practice){if(relative<0||relative>=10||practice.finished)return;practice.events.push({media_time_seconds:t,relative_time_seconds:relative,input_method:method});persistPractice();renderCounts();$('count').focus();return;}
    if(relative<0||relative>=300){message('Outside the half-open [0,300) observation. No event added.',true);return;}
    if(video.paused&&previous!=null&&t>=previous&&t-previous<.25){record().coverage=C.mergeRanges(record().coverage,[previous-sourceInfo.mediaStart,relative]);record().cursor=Math.max(record().cursor||0,relative);}
    record().events.push({id:crypto.randomUUID(),media_time_seconds:t,relative_time_seconds:relative,created_at:new Date().toISOString(),input_method:method,corrections:[]});
    save();renderCounts();$('count').focus();
  }
  function undo(){if(practice){practice.events.pop();persistPractice();renderCounts();return;}const e=[...record().events].reverse().find(e=>!e.deleted);if(!e)return;e.deleted=true;e.corrections.push({type:'undo',at:new Date().toISOString()});save();renderCounts();}
  function boundaries(){return [0,300,obs().A_start_offset_seconds,obs().A_start_offset_seconds+60,...obs().B_start_offsets_seconds.flatMap(s=>[s,s+10])];}
  function renderEvents(){
    $('events').replaceChildren();
    for(const e of record().events){
      const row=document.createElement('tr');row.className='eventrow'+(boundaries().some(b=>Math.abs(C.effective(e)-b)<=.5)?' near':'')+(e.deleted?' deleted':'');
      const td=()=>{const x=document.createElement('td');row.append(x);return x;};
      const input=document.createElement('input');input.type='number';input.min='0';input.max='299.999999';input.step='.001';input.value=C.effective(e).toFixed(6);input.title='Original: '+e.relative_time_seconds.toFixed(6)+' s';td().append(input);
      const jump=document.createElement('button');jump.textContent='Seek';jump.className='tiny';jump.onclick=async()=>{pause('Review mode. Use correction controls; Continue returns to the collection cursor.');reviewing=true;blocked=true;try{sourceInfo=await ensureArchive();await seek(sourceInfo.mediaStart+C.effective(e));render();}catch(err){message(err.message,true);}};td().append(jump);
      const apply=document.createElement('button');apply.textContent='Apply';apply.className='tiny';apply.onclick=()=>{const t=Number(input.value);if(input.value.trim()===''||!Number.isFinite(t)||t<0||t>=300){message('Correction must be in [0,300) seconds.',true);return;}e.corrections.push({type:'timestamp_correction',from:C.effective(e),to:t,at:new Date().toISOString()});e.corrected_relative_seconds=t;save();renderCounts();};td().append(apply);
      const del=document.createElement('button');del.textContent=e.deleted?'Restore':'Delete';del.className='tiny';del.onclick=()=>{e.deleted=!e.deleted;e.corrections.push({type:e.deleted?'delete':'restore',at:new Date().toISOString()});save();renderCounts();};td().append(del);
      $('events').append(row);
    }
  }
  function renderCounts(){const data=C.observationData(obs(),record()),d=data.counts;$('tally').textContent=practice?practice.events.length:(d.full_count??'—');
    $('fullLive').textContent=d.full_count??'—';$('aLive').textContent=d.A_count??'—';$('bLive').textContent=d.B_count??'—';$('derived').hidden=!data.complete;
    if(data.complete)$('derived').textContent=`Full ${d.full_count} · A ${d.A_count} · B ${d.B_count}\nEstimates A ${d.estimate_A}, B ${d.estimate_B} · absolute errors A ${d.absolute_error_A}, B ${d.absolute_error_B}`;
    if($('review').open)renderEvents();
    const done=P.observations.filter(o=>state.records[o.id]?.completedAt&&C.covered(state.records[o.id])).length;
    $('progressText').textContent=`${done} recorded · ${36-done} remaining · ${P.observations.filter(o=>state.records[o.id]?.validity==='valid').length} marked valid`;
    $('progressBar').style.width=(done/36*100)+'%';
    $('clipgrid').replaceChildren();for(const o of P.observations){const r=state.records[o.id]||{},b=document.createElement('button');b.textContent=o.id;b.className=(o.id===state.selectedId?'current ':'')+(r.validity==='invalid'?'bad':r.completedAt&&C.covered(r)?'done':r.startedAt||r.events?.length?'partial':'');b.title=o.start_GMT+' · '+(r.completedAt?'finished':r.startedAt?'in progress':'pending');b.onclick=()=>change(o.id);$('clipgrid').append(b);}

  }
  function renderClock(){
    const verified=!!video&&!!sourceInfo&&nativeSource===video.currentSrc&&!blocked&&!preparing&&!video.seeking;
    const raw=verified?video.currentTime-(practice?practice.mediaStart:sourceInfo.mediaStart):(practice?practice.cursor:record().cursor||0);
    const rel=Math.max(0,Math.min(practice?10:300,raw));
    $('clock').textContent=C.format(rel).slice(3);
    $('remaining').textContent=Math.ceil((practice?10:300)-rel)+'s left'+(practice?' · PRACTICE':'');
    $('media').textContent=verified?`London ${C.precise(C.seconds(obs().start_GMT)+rel)} · ${video.paused?'PAUSED':video.readyState<3?'BUFFERING':'PLAYING'}`:`Saved position ${C.format(rel).slice(3)} · ${preparing?'loading video…':'press Resume / Start'}`;
    $('count').disabled=!canCount();
    if(true){$('blockNow').textContent=`Now: Full${rel>=obs().A_start_offset_seconds&&rel<obs().A_start_offset_seconds+60?' + A':''}${obs().B_start_offsets_seconds.some(s=>rel>=s&&rel<s+10)?' + B':''} · elapsed ${C.precise(rel)}`;
      for(const cursor of ($('timeline').querySelectorAll?.('[data-cursor]')||[]))cursor.style.left=(rel/3)+'%';}
  }
  function renderTimeline(){const o=obs(),from=C.seconds(o.start_GMT),seg=(x,w,color)=>`<span class="segment" style="left:${x/3}%;width:${w/3}%;background:${color}"></span>`,bar=(name,blocks,color,total)=>`<div class="barrow"><b>${name}</b><div class="track">${blocks.map(([x,w])=>seg(x,w,color)).join('')}<span class="cursor" data-cursor></span></div><span>${total}s</span></div>`;
    $('timeline').innerHTML=`<div class="times"><span>${o.start_GMT}</span><span>${o.end_GMT}</span></div>${bar('Full',[[0,300]],'#95a9bc',300)}${bar('A',[[o.A_start_offset_seconds,60]],'#4385e1',60)}${bar('B',o.B_start_offsets_seconds.map(x=>[x,10]),'#21a58b',60)}`;
    $('timeline').title='A '+C.format(from+o.A_start_offset_seconds)+'–'+C.format(from+o.A_start_offset_seconds+60)+'; B '+o.B_start_offsets_seconds.map(x=>C.format(from+x)+'–'+C.format(from+x+10)).join(', ');
  }
  function render(){const o=obs();$('recordTitle').textContent=o.id+' / 36';$('choose').value=o.id;
    $('archive').textContent='Archive '+o.archive_button+' · '+o.date+' GMT';$('window').textContent=o.start_GMT+'–'+o.end_GMT+' London';
    $('validity').value=record().validity||'';if(shadow.activeElement!==$('notes'))$('notes').value=record().notes||'';
    $('practiceBanner').hidden=!practice;$('exitPractice').hidden=!practice;
    $('start').textContent=preparing?'Loading video…':active?'Playing':record().completedAt?'Finished':record().requiresRestart?'Restart needed':loadFailed?'Retry video':record().startedAt?'Resume':'Start 5 minutes';$('pause').textContent='Pause';
    $('start').disabled=!!record().requiresRestart||active||!ready||preparing||saveFailed||!!practice||!!record().completedAt||record().collectionMode==='manual';$('choose').disabled=!!practice||preparing;$('prev').disabled=o.id==='01'||preparing||!!practice;$('next').disabled=o.id==='36'||preparing||!!practice;
    $('validity').disabled=!!practice;$('restart').disabled=preparing||saveFailed;$('pause').disabled=(!active&&!practice)||preparing||finishPending;$('notes').disabled=!!practice;$('manualAdd').disabled=!!practice;$('manual').hidden=!!practice;
    $('source').textContent=record().source?`${record().source.date} · media zero ${C.format(record().source.startSeconds)} GMT · window media ${C.format(record().source.mediaStart)}–${C.format(record().source.mediaEnd)} · source duration ${record().source.duration.toFixed(3)} s. ${record().source.source}`:'No dated archive verified yet.';
    $('intervals').textContent=`A [${o.A_start_offset_seconds},${o.A_start_offset_seconds+60}); B ${o.B_start_offsets_seconds.map(s=>`[${s},${s+10})`).join(' ')} seconds.`;
    renderTimeline();const startGMT=C.seconds(o.start_GMT);$('manualIntervals').textContent=`Full ${o.start_GMT}–${o.end_GMT}; A ${C.format(startGMT+o.A_start_offset_seconds)}–${C.format(startGMT+o.A_start_offset_seconds+60)}; B ${o.B_start_offsets_seconds.map(t=>C.format(startGMT+t)+'–'+C.format(startGMT+t+10)).join('; ')} GMT. Ends excluded.`;
    $('manualMode').checked=record().collectionMode==='manual';
    for(const [id,key] of [['manualFull','full_count'],['manualA','A_count'],['manualB','B_count']])if(shadow.activeElement!==$(id))$(id).value=record().manual?.[key]??'';
    $('manualConfirmed').checked=!!record().manual?.confirmed;
    renderCounts();renderClock();
  }
  async function change(id){if(!ready||preparing||finishPending)return;pause();state.selectedId=id;sourceInfo=null;prepared=false;reviewing=false;blocked=true;record();await save();render();await prepareSelection();}
  function download(name,data,type){const blob=new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;shadow.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  function exportAll(){const files=C.exports(P,state,SHA);files['Abbey_Road_Audited_Final_Counting_Sheet.xlsx']=globalThis.AbbeyWorkbook.xlsx(P,state);download('AbbeyRoad_FIREFOX_2026-11-03_results_'+new Date().toISOString().replace(/[:.]/g,'-')+'.zip',C.zip(files),'application/zip');}
  $('start').onclick=start;$('pause').onclick=async()=>{if(practice){if(video.paused&&!practice.finished){try{sourceInfo=await ensureArchive();nativeSource=video.currentSrc;await seek(practice.mediaStart+practice.cursor);blocked=false;await video.play();message('Practice running; elapsed follows the video clock.');}catch(e){message(e.message,true);}}else{video.pause();message(practice.finished?'Practice complete. Restart or Exit practice.':'Practice paused at '+C.precise(practice.cursor)+'. Resume continues here.');}persistPractice();render();}else return active?pause():start();};$('count').onclick=()=>addCount();$('undo').onclick=undo;
  $('prev').onclick=()=>change(String(+state.selectedId-1).padStart(2,'0'));$('next').onclick=()=>change(String(+state.selectedId+1).padStart(2,'0'));$('choose').onchange=()=>change($('choose').value);$('choose').onpointerdown=()=>{if(active)pause('Paused while choosing a recording.');};
  $('connect').onclick=()=>browser.runtime.sendMessage({type:'AR_CONNECT_DISK'});
  $('notes').oninput=()=>{record().notes=$('notes').value;save();};
  $('validity').onchange=()=>{if($('validity').value==='valid'&&(!C.observationData(obs(),record()).complete||!C.observationData(obs(),record()).verified)){$('validity').value=record().validity||'';message('Valid requires complete viewed coverage and a verified archive date/media clock. Manual or unverified records must remain requiring review or invalid.',true);return;}record().validity=$('validity').value;save();renderCounts();};
  $('review').ontoggle=()=>{if($('review').open){if(active)pause('Paused for event review.');renderEvents();}};
  $('manualAdd').onclick=()=>{const t=Number($('manualTime').value);if(!record().startedAt||$('manualTime').value.trim()===''||!Number.isFinite(t)||t<0||t>=300){message('Review a started recording and enter an explicit relative time in [0,300).',true);return;}
    record().events.push({id:crypto.randomUUID(),media_time_seconds:(record().source?.mediaStart||0)+t,relative_time_seconds:t,created_at:new Date().toISOString(),input_method:'manual_review_timestamp',corrections:[]});save();renderCounts();};
  $('restart').onclick=async()=>{
    if(preparing||finishPending)return;pause('Paused for restart confirmation.');
    if(practice){if(practice.events.length&&!confirm('Clear these isolated practice events and restart practice?'))return;
      try{preparing=true;sourceInfo=await ensureArchive();nativeSource=video.currentSrc;await seek(practice.mediaStart);practice.events=[];practice.cursor=0;practice.finished=false;blocked=false;prepared=true;await persistPractice();message('Practice reset to 00:00 and paused. Use Pause / Resume to run it.');}catch(e){blocked=true;message(e.message,true);}finally{preparing=false;render();}return;}
    const r=record();if((r.events.some(e=>!e.deleted)||r.cursor||r.completedAt||r.manual)&&!confirm('Restart ONLY recording '+state.selectedId+'? Its earlier events remain in the raw audit log as deleted. All other recordings and every sampling offset are preserved.'))return;
    preparing=true;blocked=true;render();
    try{sourceInfo=await ensureArchive();nativeSource=video.currentSrc;await seek(sourceInfo.mediaStart);
      for(const e of r.events){if(!e.deleted){e.deleted=true;e.corrections.push({type:'restart',at:new Date().toISOString()});}}
      if(r.manual){r.manualHistory||=[];r.manualHistory.push(structuredClone(r.manual));delete r.manual;}
      r.requiresRestart=false;r.collectionMode='auto';r.coverage=[];r.cursor=0;r.status='not_started';r.validity='';r.clockVerified=false;r.needsSeekConfirmation=false;delete r.completedAt;delete r.startedAt;
      r.source=sourceInfo;prepared=true;reviewing=false;blocked=false;audit('restart_paused');await save();message('Restarted at elapsed 00:00.000 and PAUSED. Click Start when ready.');
    }catch(e){prepared=false;blocked=true;message('Restart could not verify the start. Existing observations were retained. '+e.message,true);}
    finally{preparing=false;render();}
  };
  $('manualMode').onchange=()=>{pause();record().collectionMode=$('manualMode').checked?'manual':'auto';record().validity=record().validity==='valid'?'uncertain':record().validity;save();render();message('Manual fallback uses separately entered counts. Timestamped events are preserved separately.');};
  function saveManual(){const r=record();r.manual||={};for(const [id,key] of [['manualFull','full_count'],['manualA','A_count'],['manualB','B_count']]){const v=$(id).value;r.manual[key]=v.trim()===''?null:Number(v);}r.manual.confirmed=$('manualConfirmed').checked;save();renderCounts();}
  for(const id of ['manualFull','manualA','manualB'])$(id).oninput=saveManual;$('manualConfirmed').onchange=saveManual;
  $('export').onclick=exportAll;$('backup').onclick=()=>download('experiment_metadata_FIREFOX.json',C.exports(P,state,SHA)['experiment_metadata.json'],'application/json');
  async function persistPractice(){if(!practice)return;try{await browser.storage.local.set({practice_only:{...structuredClone(practice),source:sourceInfo,selectedId:state.selectedId,protocolSha256:SHA}});$('saved').textContent='Practice saved separately · real observations unchanged';}catch(e){message('Practice save failed: '+e.message,true);}}
  $('practice').onclick=async()=>{if(!ready||preparing)return;pause();preparing=true;blocked=true;try{sourceInfo=await ensureArchive();nativeSource=video.currentSrc;await seek(sourceInfo.mediaStart);practice={mediaStart:sourceInfo.mediaStart,mediaEnd:sourceInfo.mediaStart+10,cursor:0,events:[],finished:false};blocked=false;reviewing=false;await video.play();message('10-second practice only. Test +1, rapid counts, Undo, Pause/Resume and automatic stop.');$('count').focus();persistPractice();}catch(e){message(e.message,true);}finally{preparing=false;render();}};
  $('exitPractice').onclick=()=>{video?.pause();practice=null;sourceInfo=null;blocked=true;browser.storage.local.remove('practice_only');message('Practice exited. Real observations are unchanged. Click Start when ready.');render();};
  $('restore').onchange=async()=>{try{const f=$('restore').files[0];if(!f)return;const backup=JSON.parse(await f.text());if(backup.protocol_sha256!==SHA||backup.state?.protocolSha256!==SHA)throw new Error('Backup belongs to a different protocol.');
    if(!confirm('Restore this backup and replace the current local state? Export the current state first if it contains counts you need.'))return;
    pause();const originalRevision=revision;state=backup.state;state.revision=originalRevision;for(const r of Object.values(state.records))if(r.status==='recording')r.status='paused';sourceInfo=null;active=false;reviewing=false;blocked=true;await save();render();await prepareSelection();
    }catch(e){message(e.message,true);}finally{$('restore').value='';}};
  function toggle(){if(root.hidden){root.hidden=false;}else{pause('Paused while the panel is hidden. Click the extension icon to reopen.');root.hidden=true;}}
  $('hide').onclick=toggle;$('minimize').onclick=()=>shadow.querySelector('.panel').classList.toggle('minimized');
  shadow.querySelector('.head').onpointerdown=e=>{if(e.target.closest('button'))return;const rect=root.getBoundingClientRect(),dx=e.clientX-rect.left,dy=e.clientY-rect.top;
    const move=x=>{root.style.left=Math.max(0,Math.min(innerWidth-120,x.clientX-dx))+'px';root.style.top=Math.max(0,Math.min(innerHeight-40,x.clientY-dy))+'px';root.style.right='auto';};
    const up=()=>{document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);};document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);};
  document.addEventListener('keydown',e=>{if(e.code!=='Space'||e.repeat||e.altKey||e.ctrlKey||e.metaKey||!$('keys').checked||document.activeElement!==root)return;
    const focus=shadow.activeElement;if(focus&&/^(INPUT|TEXTAREA|SELECT)$/.test(focus.tagName))return;
    if(canCount()){e.preventDefault();e.stopImmediatePropagation();addCount('space');}
  },true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&(active||(practice&&video&&!video.paused))){if(practice){video.pause();persistPractice();}else pause('Tab hidden: paused automatically. Resume when you can watch.');}});
  document.addEventListener('fullscreenchange',()=>{const destination=document.fullscreenElement;if(destination&&destination.tagName!=='VIDEO')destination.append(root);else if(!destination)document.documentElement.append(root);});
  browser.runtime.onMessage.addListener(m=>{if(m.type==='AR_TOGGLE')toggle();if(m.type==='AR_DISK_STATUS'){diskStatus=m.disk;renderDisk();}});
  for(const o of P.observations){const option=document.createElement('option');option.value=o.id;option.textContent=o.id+' · '+o.start_GMT;$('choose').append(option);}
  globalThis.__AbbeyCounter={toggle};
  render();
  browser.runtime.sendMessage({type:'AR_LOAD'}).then(async response=>{
    if(!response?.ok)throw new Error(response?.error||'Local storage unavailable');
    if(response.state){if(response.state.protocolSha256!==SHA)throw new Error('Stored data belongs to a different protocol. Export it before using this build.');state=response.state;revision=state.revision;}
    for(const r of Object.values(state.records)){if(r.status==='recording')r.status='paused';if(C.recoveryConflict(r)){r.requiresRestart=true;r.status='incomplete';r.validity='uncertain';}}
    const recovered=(await browser.storage.local.get('practice_only')).practice_only;
    if(false&&recovered?.protocolSha256===SHA){state.selectedId=recovered.selectedId;practice=recovered;sourceInfo=recovered.source;nativeSource='';blocked=true;lastMessage='Recovered practice separately. Pause / Resume re-verifies the source; real observations are unchanged.';}
    diskStatus=response.disk;ready=true;record();bindVideo();renderDisk();render();$('saved').textContent='Local recovery ready · revision '+revision;
    if(protocolErrors.length){blocked=true;message(protocolErrors.join('; '),true);}else{if(record().requiresRestart){message('Earlier video continued beyond the saved position. Restart this recording; original events are retained.',true);save();}else message('Ready. Start / Resume loads the selected footage.');}
  }).catch(e=>{saveFailed=true;blocked=true;message(e.message,true);render();});
  function frame(){tick();requestAnimationFrame(frame);}requestAnimationFrame(frame);
})();
