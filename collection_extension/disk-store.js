/* Firefox-only authenticated loopback file writer. No media is read or transmitted. */
(() => {
 'use strict';
 function base64(bytes){let s='';for(let offset=0;offset<bytes.length;offset+=16384)s+=String.fromCharCode(...bytes.subarray(offset,offset+16384));return btoa(s);}
 async function sync(state){
  try{
   const config=globalThis.AbbeyFirefoxHelper;
   if(!config?.token)return {ok:false,error:'Firefox saved · run START_FIREFOX_LIVE_SAVING.command once for live files'};
   const P=globalThis.AbbeyProtocol,C=globalThis.AbbeyCore,files=C.exports(P,state,globalThis.AbbeyProtocolSha256);
   const metadata=JSON.parse(files['experiment_metadata.json']);metadata.collection_client='Firefox';metadata.extension_id='abbeyroad-counter-firefox@aipi510.local';metadata.live_folder='AbbeyRoad_Firefox_LiveData';files['experiment_metadata.json']=JSON.stringify(metadata,null,2)+'\n';
   const live=P.observations.map(o=>{const r=state.records[o.id]||{},d=C.observationData(o,r),has=!!r.startedAt||!!r.events?.length||d.complete;return {clip_id:o.id,date:o.date,start_GMT:o.start_GMT,end_GMT:o.end_GMT,full_count:has?d.counts.full_count:'',A_count:has?d.counts.A_count:'',B_count:has?d.counts.B_count:'',status:r.requiresRestart?'RESTART REQUIRED / timing gap':d.complete?'complete':has?'INCOMPLETE / provisional':'not_started',elapsed_video_seconds:r.cursor||0,validity:r.validity||'',revision:state.revision,collection_client:'Firefox'};});
   files['live_pedestrian_counts.csv']=C.csv(live,Object.keys(live[0]));
   files['Abbey_Road_Audited_Final_Counting_Sheet.xlsx']=globalThis.AbbeyWorkbook.xlsx(P,state,{partial:true});
   const payload={client:'AbbeyRoadFirefox',protocolSha256:globalThis.AbbeyProtocolSha256,revision:state.revision,files:Object.fromEntries(Object.entries(files).map(([name,data])=>[name,data instanceof Uint8Array?{base64:base64(data)}:{text:data}]))};
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);
   try{
    const response=await fetch(config.url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+config.token},body:JSON.stringify(payload),signal:controller.signal,credentials:'omit',cache:'no-store'});
    const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error||'HTTP '+response.status);return result;
   }finally{clearTimeout(timer);}
  }catch(e){return {ok:false,error:'Firefox saved · live files not updated: '+(e.name==='AbortError'?'local helper timed out':e.message)+'. Keep the helper Terminal window open.'};}
 }
 globalThis.AbbeyDisk={sync};
})();
