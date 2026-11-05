// Android live update check (v0.4.6, build IDs v0.5.1): pretends to be the native app, serves a "newer" build as the live site, and checks that
// the app downloads it, swaps it in on restart with saves intact, ignores it once a newer APK is installed, and falls back from a broken build.
const path=require('path'),http=require('http'),fs=require('fs');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/npm-tools/node_modules/playwright'));}
const ROOT=path.join(__dirname,'..','..');const TY={'.html':'text/html','.js':'text/javascript','.json':'application/json','.ogg':'audio/ogg','.mp3':'audio/mpeg','.png':'image/png'};
let PACKED=null;const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/__packed.html'&&PACKED){r.writeHead(200,{'content-type':'text/html'});r.end(PACKED);return;}if(p==='/')p='/index.html';const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':TY[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
let fails=0;const chk=(n,c)=>{console.log((c===true?'PASS ':'FAIL ')+n+(c===true?'':' -> '+c));if(c!==true)fails++;};
const base=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'),cur=(base.match(/const APP_VER="([\d.]+)"/)||[])[1];
const bump=v=>v.split('.').map((n,i,a)=>i===a.length-1?+n+1:n).join('.');const NEXT=bump(cur);
let liveHtml=base.split(`const APP_VER="${cur}"`).join(`const APP_VER="${NEXT}"`),liveVer=NEXT;
(async()=>{await new Promise(ok=>srv.listen(0,ok));const url=`http://localhost:${srv.address().port}/index.html`;
  const browser=await chromium.launch();const ctx=await browser.newContext({viewport:{width:390,height:844}});
  await ctx.addInitScript(()=>{window.androidBridge={postMessage(){}};});
  await ctx.route('https://synxs1n.github.io/**',route=>{const u=route.request().url();
    if(/version\.json/.test(u))return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({version:liveVer})});
    if(/index\.html/.test(u))return route.fulfill({status:200,contentType:'text/html',headers:{'access-control-allow-origin':'*'},body:liveHtml});
    return route.fulfill({status:404,body:''});});
  const page=await ctx.newPage();const errs=[];page.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});
  const ev=f=>page.evaluate(f),wait=ms=>page.waitForTimeout(ms);
  await page.goto(url);await wait(800);
  chk('packed build runs first',await ev(()=>window.__LIVE.running)===cur);
  await ev(()=>{localStorage.setItem('liveupd-test-save','keep me');});
  await page.waitForSelector('#updbar',{timeout:15000}).catch(()=>{});
  chk('newer build downloads in the background and offers a restart',await ev(()=>!!document.getElementById('updbar')&&localStorage.getItem('aur-live-ver'))===NEXT||await ev(()=>localStorage.getItem('aur-live-ver')));
  await page.reload();await wait(2500);
  chk('restart runs the downloaded build',await ev(()=>window.__LIVE.running+' '+window.__LIVE.source)===NEXT+' download'||await ev(()=>JSON.stringify(window.__LIVE)));
  chk('the game draws its title screen',await ev(()=>document.getElementById('screen').children.length>0));
  chk('only one copy of the game ran',await ev(()=>document.querySelectorAll('#app').length===1&&typeof window.__A==='object'));
  chk('saves are untouched',await ev(()=>localStorage.getItem('liveupd-test-save'))==='keep me');
  chk('the build is marked good',await ev(()=>localStorage.getItem('aur-live-ok'))===NEXT);
  await page.reload();await wait(2500);chk('it keeps running after another restart',await ev(()=>window.__LIVE.running)===NEXT);
  // a newer APK than the download: the APK wins
  await ev(()=>{localStorage.setItem('aur-live-ver','0.0.1');});liveVer='0.0.1';await page.reload();await wait(1500);
  chk('a newer APK beats an older download',await ev(()=>window.__LIVE.running+' '+window.__LIVE.source)===cur+' apk');
  // a broken download falls back to the packed build and is not tried again
  const BAD=bump(NEXT);liveVer=BAD;liveHtml=base.split(`const APP_VER="${cur}"`).join(`const APP_VER="${BAD}"`).replace("if(window.__SKIPMAIN){window.__SKIPMAIN=0;return;}","if(window.__SKIPMAIN){window.__SKIPMAIN=0;return;}throw new Error('broken build');");
  await ev(()=>{localStorage.removeItem('aur-live-ver');document.getElementById('updbar')&&document.getElementById('updbar').remove();document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>localStorage.getItem('aur-live-ver'),null,{timeout:15000}).catch(()=>{});
  errs.length=0;await page.reload();await wait(13000);
  chk('a broken download is marked bad and the packed build runs',await ev(()=>window.__LIVE.running+' '+localStorage.getItem('aur-live-bad'))===cur+' '+BAD||await ev(()=>window.__LIVE.running+' bad='+localStorage.getItem('aur-live-bad')));
  chk('the packed build draws after the fallback',await ev(()=>document.getElementById('screen').children.length>0));
  // the website (not native) never swaps
  const p2=await browser.newPage();await p2.goto(url);await p2.waitForTimeout(800);chk('the website ignores live builds',await p2.evaluate(()=>window.__LIVE.native===false&&window.__LIVE.source==='apk'));
  // ===== v0.5.1: build IDs =====
  errs.length=0;// the broken build above threw on purpose
  const curB=(base.match(/const APP_BUILD="([0-9a-f]+)"/)||[])[1];chk('the page carries a build ID',!!curB||'none');
  const withBuild=(h,v,b)=>h.split(`const APP_VER="${cur}";const APP_BUILD="${curB}";`).join(`const APP_VER="${v}";const APP_BUILD="${b}";`);
  const OLDBOOT=fs.readFileSync(path.join(__dirname,'liveboot-v046.js'),'utf8'),NEWBOOT=fs.readFileSync(path.join(ROOT,'v3','liveboot.js'),'utf8');
  // an APK whose boot script only knows version numbers (0.4.6 to 0.5.0), packing version pv
  const oldApk=pv=>base.split(`const APP_VER="${cur}";const APP_BUILD="${curB}";`).join(`const APP_VER="${pv}";`).split(NEWBOOT).join(OLDBOOT);
  async function scen(packed,live){PACKED=packed;let L=live;const c=await browser.newContext({viewport:{width:390,height:844}});
    await c.addInitScript(()=>{window.androidBridge={postMessage(){}};});
    await c.route('https://synxs1n.github.io/**',route=>{const u=route.request().url();
      if(/version\.json/.test(u))return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(L.j)});
      if(/index\.html/.test(u))return route.fulfill({status:200,contentType:'text/html',headers:{'access-control-allow-origin':'*'},body:L.html});
      return route.fulfill({status:404,body:''});});
    const pg=await c.newPage();pg.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});
    const u=url.replace('/index.html',packed?'/__packed.html':'/index.html');await pg.goto(u);await pg.waitForTimeout(800);
    const E=f=>pg.evaluate(f);
    return {pg,E,set:x=>{L=x;},kick:async()=>{await E(()=>{const b=document.getElementById('updbar');if(b)b.remove();document.dispatchEvent(new Event('visibilitychange'));});},
      waitCache:async(v,b)=>{await pg.waitForFunction(([v,b])=>localStorage.getItem('aur-live-ver')===v&&(!b||localStorage.getItem('aur-live-build')===b),[v,b],{timeout:15000}).catch(()=>{});return E(()=>localStorage.getItem('aur-live-ver')+'#'+localStorage.getItem('aur-live-build'));},
      restart:async()=>{await pg.reload();await pg.waitForTimeout(2800);return E(()=>window.__LIVE.running+'#'+(window.__LIVE.build||'')+' '+window.__LIVE.source+' games='+document.querySelectorAll('#app').length);},close:()=>c.close()};}
  // 1. same version, new build ID: downloaded and applied on restart
  {const NB='feedbeef0001',S=await scen(null,{j:{version:cur,build:NB},html:withBuild(base,cur,NB)});
   chk('same version rebuild: downloaded in the background',(await S.waitCache(cur,NB))===cur+'#'+NB);
   chk('same version rebuild: applied on restart',(await S.restart())===`${cur}#${NB} download games=1`||await S.E(()=>JSON.stringify(window.__LIVE)));
   chk('same version rebuild: marked good',await S.E(()=>localStorage.getItem('aur-live-ok'))===cur+'#'+NB);
   // the live site goes back to what the APK packs: the cached rebuild is not taken over the APK's own build again
   S.set({j:{version:cur,build:curB},html:base});
   chk('a rebuild download never replaces itself with the same build',(await S.restart()).startsWith(cur+'#'));
   await S.close();}
  // 2. an older version is never downloaded or applied
  {const S=await scen(null,{j:{version:'0.4.9',build:'0ld0ld0ld0ld'},html:withBuild(base,'0.4.9','0ld0ld0ld0ld')});await S.kick();await S.pg.waitForTimeout(6500);
   chk('an older live version is not downloaded',await S.E(()=>localStorage.getItem('aur-live-ver'))===null);
   await S.E(()=>{localStorage.setItem('aur-live-ver','0.4.9');localStorage.setItem('aur-live-build','0ld0ld0ld0ld');});
   chk('an older cached version is never applied',(await S.restart())===`${cur}#${curB} apk games=1`);await S.close();}
  // 3. an APK on 0.5.0 (version-only boot script) picks up the new build
  {const S=await scen(oldApk('0.5.0'),{j:{version:cur,build:curB},html:base});
   chk('0.5.0 APK: runs its packed build first',await S.E(()=>window.__LIVE.running)==='0.5.0');
   chk('0.5.0 APK: downloads the new build',(await S.waitCache(cur))===cur+'#'+'null'||await S.E(()=>localStorage.getItem('aur-live-ver')));
   chk('0.5.0 APK: runs the new build after a restart',(await S.restart())===`${cur}#${curB} download games=1`||await S.E(()=>JSON.stringify(window.__LIVE)));
   await S.close();}
  // 4. an old 0.4.6 APK running a swapped build still picks up a same version rebuild
  {const S=await scen(oldApk('0.4.6'),{j:{version:cur,build:curB},html:base});await S.waitCache(cur);
   chk('0.4.6 APK: swaps in the current build',(await S.restart())===`${cur}#${curB} download games=1`||await S.E(()=>JSON.stringify(window.__LIVE)));
   const NB='c0ffee000002';S.set({j:{version:cur,build:NB},html:withBuild(base,cur,NB)});await S.kick();
   chk('0.4.6 APK on a swapped build: the build ID check downloads the rebuild',(await S.waitCache(cur,NB))===cur+'#'+NB);
   chk('0.4.6 APK: runs the rebuild after a restart, once',(await S.restart())===`${cur}#${NB} download games=1`||await S.E(()=>JSON.stringify(window.__LIVE)));
   chk('0.4.6 APK: the game draws',await S.E(()=>document.getElementById('screen').children.length>0));
   await S.close();}
  // the website: a different build ID shows the update bar
  {const c=await browser.newContext();await c.route(/version\.json/,r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({version:cur,build:'0123456789ab'})}));
   const p3=await c.newPage();await p3.goto(url);await p3.waitForSelector('#updbar',{timeout:9000}).catch(()=>{});chk('website: a new build ID shows the update bar',await p3.evaluate(()=>!!document.getElementById('updbar')));
   await c.route(/version\.json/,r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({version:cur,build:curB})}));
   const p4=await c.newPage();await p4.goto(url);await p4.waitForTimeout(5500);chk('website: the same build shows no bar',await p4.evaluate(()=>!document.getElementById('updbar')));await c.close();}
  chk('no page errors',errs.length===0||errs.slice(0,3).join(' | '));
  await browser.close();srv.close();console.log(fails?`FAILS ${fails}`:'ALL PASS');process.exit(fails?1:0);})();
