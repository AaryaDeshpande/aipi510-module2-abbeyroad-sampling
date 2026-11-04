'use strict';
let queue=Promise.resolve();
const allowed=sender=>sender.id===browser.runtime.id&&((sender.tab&&/^https:\/\/(www\.)?abbeyroad\.com\/crossing\/?(?:[?#]|$)/.test(sender.tab.url||''))||sender.url?.startsWith(browser.runtime.getURL('storage.html')));
async function syncDisk(state){const disk=state?await AbbeyDisk.sync(state):{ok:false,error:'Firefox has no experiment state yet. Open Abbey Road first.'};await browser.storage.local.set({disk_status:disk});return disk;}
browser.runtime.onMessage.addListener((message,sender)=>{
 if(!allowed(sender))return;
 if(message.type==='AR_CONNECT_DISK')return browser.tabs.create({url:browser.runtime.getURL('storage.html')}).then(()=>({ok:true}));
 if(!['AR_LOAD','AR_SAVE','AR_SYNC_DISK'].includes(message.type))return;
 const operation=queue.catch(()=>{}).then(async()=>{
  const current=(await browser.storage.local.get('experiment')).experiment||null;
  if(message.type==='AR_LOAD')return {ok:true,state:current,disk:(await browser.storage.local.get('disk_status')).disk_status};
  if(message.type==='AR_SYNC_DISK'){
   const disk=await syncDisk(current);
   for(const tab of await browser.tabs.query({url:['https://www.abbeyroad.com/crossing*','https://abbeyroad.com/crossing*']}))try{await browser.tabs.sendMessage(tab.id,{type:'AR_DISK_STATUS',disk});}catch{}
   return {ok:true,disk};
  }
  if((current?.revision||0)!==message.expectedRevision)return {ok:false,conflict:true,error:'Another Firefox counting tab saved newer data. Export a backup, then reload this tab. Use one counting tab.'};
  const state=message.state;
  if(!state||state.protocolSha256!==AbbeyProtocolSha256||!state.records)throw Error('Invalid state or protocol. Existing observations protected.');
  if(current&&current.protocolSha256!==state.protocolSha256)throw Error('Protocol differs; existing observations protected.');
  state.revision=(current?.revision||0)+1;await browser.storage.local.set({experiment:state});
  const disk=await syncDisk(state);return {ok:true,revision:state.revision,disk};
 });
 queue=operation.catch(()=>{});return operation.catch(error=>({ok:false,error:String(error.message||error)}));
});
browser.action.onClicked.addListener(async tab=>{
 if(!/^https:\/\/(www\.)?abbeyroad\.com\/crossing\/?(?:[?#]|$)/.test(tab.url||'')){await browser.tabs.create({url:'https://www.abbeyroad.com/crossing'});return;}
 try{await browser.tabs.sendMessage(tab.id,{type:'AR_TOGGLE'});}catch{
  await browser.scripting.executeScript({target:{tabId:tab.id},world:'MAIN',files:['player-bridge.js']});
  await browser.scripting.executeScript({target:{tabId:tab.id},files:['protocol-data.js','core.js','workbook-template.js','workbook.js','counter.js']});
 }
});
