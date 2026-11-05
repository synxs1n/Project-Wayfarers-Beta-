// =================== LIVE UPDATES FOR THE ANDROID APP (v0.4.6) ===================
// Runs before the game, in its own script. Only inside the native app (the website and the Windows app already load the live site).
// 1. In the background it checks the live site's version.json. When it is newer than what is running, it downloads the new
//    index.html into the app's own cache and offers a Restart (otherwise it applies on the next launch).
// 2. On launch, if a downloaded build is newer than the one packed in the APK, the packed game is skipped and the downloaded
//    one is swapped into this same page. The page keeps its origin, so saves, settings and Google sign-in are untouched.
// 3. A downloaded build that fails to start is marked bad and the packed one runs instead; a newer APK always wins over an older download.
(function(){
  const NATIVE=!!(window.androidBridge||(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()));
  window.__LIVE={native:NATIVE,running:APP_VER,bundled:APP_VER,source:'apk'};
  if(!NATIVE||window.__LIVEBOOTED)return;// a swapped-in build runs this again: nothing more to do
  window.__LIVEBOOTED=1;
  const LIVE='https://synxs1n.github.io/Project-Wayfarers-Beta-/',CACHE='aur-live-build',KEY=LIVE+'index.html';
  const ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){return null;}};
  const newer=(a,b)=>{const p=s=>String(s||'0').split('.').map(n=>+n||0);const x=p(a),y=p(b);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)>(y[i]||0);}return false;};
  const have=ls('aur-live-ver'),bad=ls('aur-live-bad');
  // a build that was tried and never reported a good start is skipped
  if(have&&ls('aur-live-try')===have&&ls('aur-live-ok')!==have){ls('aur-live-bad',have);ls('aur-live-try',null);}
  const use=have&&newer(have,APP_VER)&&ls('aur-live-bad')!==have;
  if(use){
    window.__SKIPMAIN=1;ls('aur-live-try',have);
    const swap=html=>{const d=new DOMParser().parseFromString(html,'text/html');
      document.head.innerHTML=d.head.innerHTML;document.body.innerHTML=d.body.innerHTML;
      // scripts set through innerHTML do not run; put fresh copies in, in order
      [...document.body.querySelectorAll('script')].forEach(old=>{const s=document.createElement('script');s.text=old.textContent;old.replaceWith(s);});
      window.__LIVE.running=have;window.__LIVE.source='download';
      // the new build is good once the game has drawn its first screen
      let n=0;const t=setInterval(()=>{const sc=document.getElementById('screen');if(sc&&sc.children.length){clearInterval(t);ls('aur-live-ok',have);ls('aur-live-try',null);}else if(++n>40){clearInterval(t);ls('aur-live-bad',have);location.reload();}},250);};
    const go=()=>caches.open(CACHE).then(c=>c.match(KEY)).then(r=>r?r.text():null).then(h=>{if(h&&h.length>100000)swap(h);else{ls('aur-live-ver',null);location.reload();}})
      .catch(()=>{ls('aur-live-ver',null);location.reload();});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go,{once:true});else go();
  }
  // background check for a newer build
  let busy=false;
  async function check(){if(busy||!navigator.onLine)return;busy=true;
    try{const r=await fetch(LIVE+'version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const j=await r.json(),v=j&&j.version;
      const cur=window.__LIVE.running;if(!v||!newer(v,cur))return;
      if(ls('aur-live-ver')===v&&ls('aur-live-bad')!==v){bar(v);return;}
      const h=await fetch(LIVE+'index.html?v='+encodeURIComponent(v),{cache:'no-store'});if(!h.ok)return;const html=await h.text();
      if(html.length<100000||html.indexOf('APP_VER="'+v+'"')<0)return;// only keep a complete page for exactly that version
      const c=await caches.open(CACHE);await c.put(KEY,new Response(html,{headers:{'content-type':'text/html'}}));
      ls('aur-live-ver',v);ls('aur-live-ok',null);if(ls('aur-live-bad')===v)ls('aur-live-bad',null);bar(v);
    }catch(e){}finally{busy=false;}}
  function bar(v){if(document.getElementById('updbar'))return;const b=document.createElement('div');b.id='updbar';
    b.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(12px + env(safe-area-inset-bottom));z-index:99999;background:#2a1530;color:#f3e6c4;border:2px solid #d9a441;border-radius:10px;padding:10px 14px;font:14px system-ui,sans-serif;display:flex;gap:10px;align-items:center;box-shadow:0 4px 18px #000a;max-width:92vw';
    b.innerHTML='<span>Update '+v+' is downloaded. It starts next time you open the game.</span><button style="background:#d9a441;color:#150b17;border:0;border-radius:6px;padding:6px 12px;font-weight:700;cursor:pointer">Restart now</button><button style="background:none;color:#f3e6c4;border:0;cursor:pointer;font-size:16px" title="Later">✕</button>';
    const [,go,x]=b.children;go.onclick=()=>{try{if(typeof window.__saveNow==='function')window.__saveNow();}catch(e){}location.reload();};x.onclick=()=>b.remove();document.body.appendChild(b);}
  setTimeout(check,5000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});setInterval(check,30*60*1000);
})();
