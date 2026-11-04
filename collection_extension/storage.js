'use strict';
const status=document.getElementById('status');
document.getElementById('connect').onclick=async()=>{
 status.textContent='Writing the latest Firefox observations…';
 try{const result=await browser.runtime.sendMessage({type:'AR_SYNC_DISK'});status.textContent=result.disk?.ok?'✓ Firefox live files saved · revision '+result.disk.revision+'. Return to Abbey Road.':result.disk?.error||result.error;}catch(e){status.textContent='Not connected: '+e.message;}
};
