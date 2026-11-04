/* Observe only the official page's already-requested public archive metadata. */
(()=>{
 if(window.__abbeyCounterBridge)return;window.__abbeyCounterBridge=true;
 let archiveUrls=[];const pending=[];
 function capture(data){
  const urls=[];const visit=x=>{if(!x||typeof x!=='object')return;for(const [key,value] of Object.entries(x)){if(key==='clip_html5'&&typeof value==='string')urls.push(value);else if(typeof value==='object')visit(value);}};visit(data);
  if(urls.length){archiveUrls=[...new Set(urls)];for(const resolve of pending.splice(0))resolve(archiveUrls);}
 }
 function inspect(script){
  if(script.tagName!=='SCRIPT'||!script.src)return;
  let url;try{url=new URL(script.src,location.href);}catch{return;}
  if(url.hostname!=='www.earthcam.com'||url.pathname!=='/scripts/net/get_archive_data.php'||url.searchParams.get('netid')!=='640258597cbc50037072712f964cf5d8')return;
  const callback=url.searchParams.get('callback'),original=window[callback];
  if(typeof original!=='function'||original.__abbeyMetadataWrapped)return;
  function observed(...args){capture(args[0]);return original.apply(this,args);}
  observed.__abbeyMetadataWrapped=true;window[callback]=observed;
 }
 // At document_start, the observer runs before external JSONP callbacks return.
 // It preserves the website's callback, arguments and return value and sends no requests.
 new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType!==1)continue;inspect(node);for(const script of node.querySelectorAll?.('script[src]')||[])inspect(script);}}).observe(document,{childList:true,subtree:true});
 async function archives(){if(archiveUrls.length)return archiveUrls;return new Promise(resolve=>{pending.push(resolve);setTimeout(()=>{const i=pending.indexOf(resolve);if(i>=0)pending.splice(i,1);resolve(archiveUrls);},6000);});}
 window.addEventListener('message',async event=>{
  if(event.source!==window||event.origin!==location.origin||event.data?.type!=='AR_PLAYER_REQUEST')return;
  const video=document.querySelector('video');let player;
  try{const v=window.videojs;player=v?.getPlayer?.('video1')||v?.getPlayers?.()?.video1||v?.players?.video1;}catch{}
  const list=event.data.requestArchives?await archives():archiveUrls;
  window.postMessage({type:'AR_PLAYER_RESPONSE',requestId:event.data.requestId,videoId:video?.id||'',source:player?.currentSrc?.()||video?.currentSrc||video?.src||'',archives:list,archiveError:event.data.requestArchives&&!list.length?'The official page archive metadata has not loaded; refresh once':''},location.origin);
 });
})();
