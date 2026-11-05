// Android live update check (v0.4.6): pretends to be the native app, serves a "newer" build as the live site, and checks that
// the app downloads it, swaps it in on restart with saves intact, ignores it once a newer APK is installed, and falls back from a broken build.
const path=require('path'),http=require('http'),fs=require('fs');
let chromium;try{({chromium}=require('playwright'));}catch(e){({chromium}=require('/opt/npm-tools/node_modules/playwright'));}
const ROOT=path.join(__dirname,'..','..');const TY={'.html':'text/html','.js':'text/javascript','.json':'application/json','.ogg':'audio/ogg','.mp3':'audio/mpeg','.png':'image/png'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':TY[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
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
  await browser.close();srv.close();console.log(fails?`FAILS ${fails}`:'ALL PASS');process.exit(fails?1:0);})();
