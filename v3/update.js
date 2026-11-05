// Update prompt: when the live site has another version or build ID than the one running, offer a one tap reload.
window.__saveNow=()=>{try{if(G&&!G.daily)saveGame();}catch(e){}};// the Android live update saves before it restarts (liveboot.js)
(function(){
  const NATIVE=!!window.androidBridge;
  const LIVE='https://synxs1n.github.io/Project-Wayfarers-Beta-/';
  const APK='https://github.com/synxs1n/Project-Wayfarers-Beta-/releases/latest/download/Wayfarers-android.apk';
  if(NATIVE||!/^https?:$/.test(location.protocol))return; // native shell: update prompt off until the Android crash is understood
  function show(v){
    if(document.getElementById('updbar'))return;
    const b=document.createElement('div');b.id='updbar';
    b.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(12px + env(safe-area-inset-bottom));z-index:99999;background:#2a1530;color:#f3e6c4;border:2px solid #d9a441;border-radius:10px;padding:10px 14px;font:14px system-ui,sans-serif;display:flex;gap:10px;align-items:center;box-shadow:0 4px 18px #000a;max-width:92vw';
    b.innerHTML='<span>Update '+v+' is ready.'+(NATIVE?' Download, then open it to install over this one.':'')+'</span><button style="background:#d9a441;color:#150b17;border:0;border-radius:6px;padding:6px 12px;font-weight:700;cursor:pointer">Update now</button><button style="background:none;color:#f3e6c4;border:0;cursor:pointer;font-size:16px" title="Later">✕</button>';
    const [,go,x]=b.children;
    go.onclick=async()=>{if(NATIVE){window.open(APK,'_blank');return;}try{const r=await navigator.serviceWorker.getRegistrations();await Promise.all(r.map(g=>g.update().catch(()=>0)));const k=await caches.keys();await Promise.all(k.map(n=>caches.delete(n)));}catch(e){}location.reload();};
    x.onclick=()=>b.remove();
    document.body.appendChild(b);
  }
  async function check(){
    try{
      const r=await fetch((NATIVE?LIVE:'')+'version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;
      const j=await r.json();
      // v0.5.1: a same version rebuild (another build ID) is an update too
      const myB=typeof APP_BUILD==='string'?APP_BUILD:'';
      if(j&&j.version&&(j.version!==APP_VER||(j.build&&myB&&j.build!==myB)))show(j.version);
    }catch(e){}
  }
  setTimeout(check,4000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
})();
