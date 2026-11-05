// =================== LIVE UPDATES FOR THE ANDROID APP (v0.4.6, build IDs in v0.5.1) ===================
// Runs before the game, in its own script. Only inside the native app (the website and the Windows app already load the live site).
// Every build carries APP_VER and APP_BUILD (a hash of the page's code, written by v3build.py); the live version.json carries both.
// An update is a live build whose version is newer, or the same version with a different build ID. An older version is never taken.
// 1. In the background it checks the live version.json. On an update it downloads the new index.html into the app's own cache
//    (only a complete page that carries exactly that version and build) and offers a Restart (otherwise it applies on next launch).
// 2. On launch, if the cached build is newer than the one packed in the APK (newer version, or same version and another build),
//    the packed game is skipped and the cached one is swapped into this same page. Same origin, so saves and sign in stay.
// 3. A cached build that fails to start is marked bad and the packed one runs instead; a newer APK always wins over an older download.
// 4. Inside a swapped-in build this script runs again. It never swaps a second time (the game must not run twice), but it does run
//    the background check with these rules, writing to the same cache and keys. That is how an APK from 0.4.6 to 0.5.0, whose own
//    boot script only understands version numbers, still picks up same version rebuilds once it is running a swapped build.
// localStorage: aur-live-ver and aur-live-build (what is cached), aur-live-try / aur-live-ok / aur-live-bad (ids: "ver" from old
// boot scripts, "ver#build" from this one).
(function(){
  const NATIVE=!!(window.androidBridge||(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()));
  const MYB=typeof APP_BUILD==='string'?APP_BUILD:'';
  const SWAPPED=!!window.__LIVEBOOTED;// this copy is running inside a build that a boot script already swapped in
  if(!SWAPPED)window.__LIVE={native:NATIVE,running:APP_VER,build:MYB,bundled:APP_VER,bundledBuild:MYB,source:'apk'};
  else if(window.__LIVE){window.__LIVE.running=APP_VER;window.__LIVE.build=MYB;window.__LIVE.source='download';}
  if(!NATIVE)return;
  if(window.__LIVECHECK)return;// one background checker per page
  window.__LIVEBOOTED=1;window.__LIVECHECK=1;
  const LIVE='https://synxs1n.github.io/Project-Wayfarers-Beta-/',CACHE='aur-live-build',KEY=LIVE+'index.html';
  const ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){return null;}};
  const newer=(a,b)=>{const p=s=>String(s||'0').split('.').map(n=>+n||0);const x=p(a),y=p(b);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)>(y[i]||0);}return false;};
  const idOf=(v,b)=>b?v+'#'+b:String(v);
  // is build (v,b) an update over (cv,cb)? newer version, or the same version with a known, different build ID
  const isUpd=(v,b,cv,cb)=>!!v&&(newer(v,cv)||(v===cv&&!!b&&b!==cb));
  if(!SWAPPED){
    const have=ls('aur-live-ver'),hb=ls('aur-live-build')||'',hid=have?idOf(have,hb):null;
    // a build that was tried and never reported a good start is skipped
    if(have&&(ls('aur-live-try')===hid||ls('aur-live-try')===have)&&ls('aur-live-ok')!==hid&&ls('aur-live-ok')!==have){ls('aur-live-bad',hid);ls('aur-live-try',null);}
    const bad=ls('aur-live-bad'),use=have&&isUpd(have,hb,APP_VER,MYB)&&bad!==hid&&!(bad===have&&!hb);
    if(use){
      window.__SKIPMAIN=1;ls('aur-live-try',hid);
      const swap=html=>{const d=new DOMParser().parseFromString(html,'text/html');
        document.head.innerHTML=d.head.innerHTML;document.body.innerHTML=d.body.innerHTML;
        // scripts set through innerHTML do not run; put fresh copies in, in order (the boot script among them runs only its check)
        window.__LIVECHECK=0;
        [...document.body.querySelectorAll('script')].forEach(old=>{const s=document.createElement('script');s.text=old.textContent;old.replaceWith(s);});
        window.__LIVE.running=have;window.__LIVE.build=hb;window.__LIVE.source='download';
        // the new build is good once the game has drawn its first screen
        let n=0;const t=setInterval(()=>{const sc=document.getElementById('screen');if(sc&&sc.children.length){clearInterval(t);ls('aur-live-ok',hid);ls('aur-live-try',null);}else if(++n>40){clearInterval(t);ls('aur-live-bad',hid);location.reload();}},250);};
      const go=()=>caches.open(CACHE).then(c=>c.match(KEY)).then(r=>r?r.text():null).then(h=>{if(h&&h.length>100000&&(!hb||h.indexOf('APP_BUILD="'+hb+'"')>=0))swap(h);else{ls('aur-live-ver',null);ls('aur-live-build',null);location.reload();}})
        .catch(()=>{ls('aur-live-ver',null);ls('aur-live-build',null);location.reload();});
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go,{once:true});else go();
      return;// the swapped build's own copy of this script runs the background check
    }
  }
  // background check for an update
  let busy=false;
  async function check(){if(busy||!navigator.onLine)return;busy=true;
    try{const r=await fetch(LIVE+'version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const j=await r.json(),v=j&&j.version,b=(j&&j.build)||'';
      const cv=window.__LIVE.running,cb=window.__LIVE.build||'';
      // the live site matches what the APK packs, and something else sits in the cache: that cached build is stale
      if(v===window.__LIVE.bundled&&b&&b===window.__LIVE.bundledBuild&&ls('aur-live-ver')===v&&(ls('aur-live-build')||'')!==b&&window.__LIVE.source==='apk'){ls('aur-live-ver',null);ls('aur-live-build',null);}
      if(!isUpd(v,b,cv,cb))return;
      const id=idOf(v,b),bad=ls('aur-live-bad');
      if(ls('aur-live-ver')===v&&(ls('aur-live-build')||'')===b&&bad!==id){bar(v);return;}
      const h=await fetch(LIVE+'index.html?v='+encodeURIComponent(v)+(b?'&b='+b:''),{cache:'no-store'});if(!h.ok)return;const html=await h.text();
      // only keep a complete page for exactly that version and build
      if(html.length<100000||html.indexOf('APP_VER="'+v+'"')<0||(b&&html.indexOf('APP_BUILD="'+b+'"')<0))return;
      const c=await caches.open(CACHE);await c.put(KEY,new Response(html,{headers:{'content-type':'text/html'}}));
      ls('aur-live-ver',v);if(b)ls('aur-live-build',b);else ls('aur-live-build',null);ls('aur-live-ok',null);if(bad===id||bad===v)ls('aur-live-bad',null);bar(v);
    }catch(e){}finally{busy=false;}}
  function bar(v){if(document.getElementById('updbar'))return;const b=document.createElement('div');b.id='updbar';
    b.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:calc(12px + env(safe-area-inset-bottom));z-index:99999;background:#2a1530;color:#f3e6c4;border:2px solid #d9a441;border-radius:10px;padding:10px 14px;font:14px system-ui,sans-serif;display:flex;gap:10px;align-items:center;box-shadow:0 4px 18px #000a;max-width:92vw';
    b.innerHTML='<span>Update '+v+' is downloaded. It starts next time you open the game.</span><button style="background:#d9a441;color:#150b17;border:0;border-radius:6px;padding:6px 12px;font-weight:700;cursor:pointer">Restart now</button><button style="background:none;color:#f3e6c4;border:0;cursor:pointer;font-size:16px" title="Later">✕</button>';
    const [,go,x]=b.children;go.onclick=()=>{try{if(typeof window.__saveNow==='function')window.__saveNow();}catch(e){}location.reload();};x.onclick=()=>b.remove();document.body.appendChild(b);}
  window.__liveCheck=check;
  setTimeout(check,5000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});setInterval(check,30*60*1000);
})();
