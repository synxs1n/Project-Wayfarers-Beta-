// ===== offline.js (v0.3.3): offline play: queued feedback and the service worker =====
// The page is fully self contained (fonts are embedded, no external scripts or images), so once loaded the game plays with no
// connection. Saves, loadouts and the local bestiary/codex cache live in localStorage and never needed the network.
// Account writes queue locally while offline and go out when the connection returns:
//   META.q = {prof:1, fb:[reports]} (new optional field in the meta cache).
//   prof: the profile doc (bestiary, codex, flags) is re-synced by the same union merge as always: read the remote doc, take max counts,
//         OR the known elements and flags, write only if something differs. It can only ever add.
//   fb:   feedback reports keep their unique ids and are written only if no doc with that id exists, so nothing is overwritten.
// A service worker (sw.js, published next to the page) is registered only where the host allows it, so a reload also works offline.
const OFF={online:typeof navigator==='undefined'||navigator.onLine!==false,busy:false,sw:'unsupported',cached:false};
function offQ(){const q=META.q=META.q||{};q.fb=Array.isArray(q.fb)?q.fb:[];return q;}
function offPending(){const q=offQ();return q.fb.length+(q.prof?1:0);}
function offPaint(){let el=document.getElementById('offl');if(!el){el=document.createElement('div');el.id='offl';el.setAttribute('role','status');document.body.appendChild(el);}
  const n=offPending();el.className='offl'+(OFF.online?(n?' wait':' hide'):' off');
  el.textContent=OFF.online?(n?`Syncing ${n} item${n>1?'s':''}…`:''):('Offline'+(n?`, ${n} waiting to sync`:', saving on this device'));
  el.title=OFF.online?'':'No connection. Your journey keeps saving on this device. Account progress and reports sync when you are back online.';}
function offQueueFb(rep){if(OFF.online)return false;const q=offQ();q.fb.push(rep);saveMeta();FB.lastSent=Date.now();V.fbSent=Object.assign({},rep,{queued:1});V.fb={cat:rep.category,title:'',desc:'',repro:'',name:rep.name};
  if(V.modal&&V.modal.type==='feedback')V.modal.tab='sent';offPaint();render();return true;}
async function offFlush(){
  if(OFF.busy||!OFF.online)return;OFF.busy=true;
  try{const q=offQ();
    if(q.fb.length){const id=await fbIdentity();
      if(id.db&&id.uid){const keep=[];let wrote=false;
        for(const rep of q.fb){try{const ref=id.db.doc('feedback/'+id.uid+'/reports/'+rep.id),s=await ref.get();if(!s.exists){await ref.set(rep);wrote=true;}}catch(e){keep.push(rep);}}
        if(wrote){try{await id.db.doc('feedback/'+id.uid).set({uid:id.uid,last:Date.now()});}catch(e){}}
        q.fb=keep;saveMeta();}}
    if(q.prof||PROFILE.status==='offline'||PROFILE.status==='error')await profileSync();
  }catch(e){}finally{OFF.busy=false;offPaint();}}
// profile sync: never started while offline, remembered, and retried
{const ps0=profileSync;profileSync=async function(){
  if(!OFF.online){offQ().prof=1;saveMeta();PROFILE.status='offline';offPaint();if(V.modal&&V.modal.type==='menu'&&(V.modal.tab==='beasts'||V.modal.tab==='codex'))render();return;}
  const r=await ps0.apply(this,arguments);
  if(PROFILE.status==='error'){offQ().prof=1;saveMeta();}else if(PROFILE.status==='synced'||PROFILE.status==='local'){const q=offQ();if(q.prof){delete q.prof;saveMeta();}}
  offPaint();return r;};}
{const sn0=syncNote;syncNote=function(){if(PROFILE.status==='offline')return '<p class="sync local">Offline. Bestiary and Codex progress is saved on this device and will sync to your account when you reconnect.</p>';return sn0.apply(this,arguments);};}
window.addEventListener('offline',()=>{OFF.online=false;offPaint();try{toast('You are offline. The game keeps working and saving on this device.');}catch(e){}});
window.addEventListener('online',()=>{OFF.online=true;offPaint();try{toast('Back online. Syncing.');}catch(e){}offFlush();});
setInterval(()=>{if(OFF.online&&offPending())offFlush();},60000);
// ----- service worker: only where the host serves sw.js from the same origin and allows registration -----
function offSW(){try{if(!('serviceWorker' in navigator)||!/^https:|^http:\/\/localhost|^http:\/\/127\./.test(location.href)){OFF.sw='unsupported';return;}
  navigator.serviceWorker.register('sw.js').then(reg=>{OFF.sw='registered';return navigator.serviceWorker.ready;}).then(()=>{OFF.sw='active';
    if(window.caches)caches.open('aurelis-offline-v1').then(c=>c.add(location.href)).then(()=>{OFF.cached=true;}).catch(()=>{});}).catch(()=>{OFF.sw='blocked';});}catch(e){OFF.sw='blocked';}}
try{offSW();}catch(e){}
document.addEventListener('DOMContentLoaded',offPaint);try{offPaint();}catch(e){}
