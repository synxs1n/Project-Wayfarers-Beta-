// Playwright harness (replaces puppeteer+sparticuz in this workspace). Usage: const {open,chk,done}=require('./pw');
// Helpers for tests that must not depend on machine load (v0.9.9, docs/v099-tests.md):
//   open({freeze:true}) installs a controllable clock before the game loads (Date.now runs from a fixed epoch, 2026-01-01,
//                       never backwards; new Date() keeps the real date); needed by H.det.
//   H.det(fn,arg,seed)  evaluate fn with Math.random seeded and Date.now pinned to a fixed instant (the k-th call of a page
//                       gets the k-th instant), so journey (realm) draws, map picks and particles are the same on every run.
//                       PWFREEZE=0 turns it into a plain evaluate (the real clock and Math.random), to run a test unfrozen.
//   H.frames(n)         wait n animation frames of the page (real frames, not a fixed sleep)
//   H.until(fn,arg,o)   poll fn in the page every frame until it returns something truthy (o.timeout ms, default 10000); returns that
//                       value, or {timeout:true,last} so a check can show what it saw
//   H.settle(fn,arg,o)  wait until fn's result (any JSON) is the same for o.frames frames in a row (default 3; o.timeout default 5000):
//                       layout stable, an entrance animation over, a camera at rest
//   H.cpu()             load factor of the machine right now: a fixed JS loop timed in the page against CPU_REF (>= 1; 1 = idle)
//   frameFactor(browser) how starved frames are right now: an empty page's p95 frame interval / 17 ms (>= 1), for frame rate checks
//   perfChk(H,name,ms,limit)  a time limit check scaled by the load factor: passes under limit x factor, and says so in the name
const fs=require('fs');const path=require('path');
const {chromium}=require('playwright');
const MOCK=(()=>{const s=fs.readFileSync(__dirname+'/beta.js','utf8');const a=s.indexOf('const MOCK=`')+12;return s.slice(a,s.indexOf('`;',a));})();
const FREEZE=process.env.PWFREEZE!=='0';
// the frozen clock: Date.now runs from a fixed epoch (never backwards); a pin holds it at EPOCH + k x 10^7 ms (k = pin count).
// new Date() keeps the real clock
const CLOCK=`(()=>{const RD=Date,rn=RD.now.bind(RD),pn=()=>performance.now(),EPOCH=1767225600000;let base=EPOCH,at=pn(),pinned=null,k=0;
  const now=()=>pinned!=null?pinned:Math.floor(base+pn()-at);
  RD.now=now;/* not __pwClock: Playwright reads that name for its own fake clock, and page.waitForFunction then broke */window.__pwFreeze={pin(){k++;pinned=EPOCH+k*1e7;return pinned;},unpin(){if(pinned==null)return;base=pinned;at=pn();pinned=null;},real:rn};})();`;
let fails=0,errs=[];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// machine speed: the best of 3 runs of a fixed loop (ms) on this container when idle; H.cpu() divides by it
const CPU_REF=+process.env.PWCPUREF||12;
const CAL=()=>{let best=1e9;for(let r=0;r<3;r++){const t=performance.now();let x=0;for(let i=0;i<3e6;i++)x=(x*31+i)%1000003;if(x<0)console.log(x);best=Math.min(best,performance.now()-t);}return best;};
async function loadFactor(page){const ms=await page.evaluate(`(${CAL})()`);return Math.max(1,ms/CPU_REF,require('os').loadavg()[0]/require('os').cpus().length);}
// frame pacing of an empty page in the same browser (its own context): p95 frame interval / 17 ms, at least 1. Frame rate checks use it
// as their baseline measured in the same run: when even a blank page cannot get its frames, the compositor or the GPU process is starved
// by other work on the machine, not by the game
async function frameFactor(browser){const c=await browser.newContext({viewport:{width:390,height:844}});try{const p=await c.newPage();await p.setContent('<body style="background:#123"></body>');
  const t=await p.evaluate(()=>new Promise(ok=>{const t=[];let last=performance.now();const f=n=>{t.push(n-last);last=n;if(t.length<90)requestAnimationFrame(f);else{t.sort((a,b)=>a-b);ok(t[85]);}};requestAnimationFrame(f);}));
  return Math.max(1,t/17);}finally{await c.close();}}
async function open(opt={}){
  // opt.browser: share one browser (each open still gets its own context, so its own localStorage: a second "device")
  // opt.mock: a script (no <script> tag) used instead of the default window.claude MOCK; opt.before(page): runs before the page loads
  const browser=opt.browser||await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:opt.w||390,height:opt.h||844},isMobile:!!opt.mobile,hasTouch:!!opt.mobile,deviceScaleFactor:opt.dpr||1});
  const page=await ctx.newPage();page.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',(opt.tag?opt.tag+' ':'')+e.message,(e.stack||'').split('\n').slice(0,4).join(' | '));});
  if(opt.before)await opt.before(page,ctx);
  const html=opt.html||fs.readFileSync(process.env.PWHTML||__dirname+'/../out/aurelis3.html','utf8');
  const P=path.join(opt.dir||'/tmp','pw_page_'+process.pid+(opt.tag?'_'+opt.tag:'')+'.html');
  const clock=FREEZE&&opt.freeze?'<script>'+CLOCK+'</script>':'';
  // v0.11.4: timed hits are on by default in the game; tests keep them off unless a test sets META.cfg.timedHits=true (battle5.js b5TimedOn)
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script>window.__PWTEST=1</script>'+clock+'<script>'+(opt.pre||'localStorage.clear();')+'</script>'+(opt.mock!=null?'<script>'+opt.mock+'</script>':MOCK)+html+'</body></html>');
  await page.goto('file://'+P,{waitUntil:'load'});
  const ev=(f,a)=>page.evaluate(f,a);
  const shot=async n=>{await wait(250);await page.screenshot({path:(opt.out||'/tmp')+'/pw_'+n+'.png'});};
  const det=(f,a,seed)=>page.evaluate(async([src,a,seed])=>{const c=window.__pwFreeze;if(!c)return (0,eval)('('+src+')')(a);
    const mr=Math.random;let s=(seed>>>0)||1;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};c.pin();
    try{return await (0,eval)('('+src+')')(a);}finally{Math.random=mr;c.unpin();}},[f.toString(),a,seed||1]);
  const frames=n=>page.evaluate(n=>new Promise(r=>{let k=0;const f=()=>{if(++k>=n)r(k);else requestAnimationFrame(f);};requestAnimationFrame(f);}),n||1);
  const until=(f,a,o={})=>page.evaluate(([src,a,T])=>new Promise(res=>{const fn=(0,eval)('('+src+')'),t0=performance.now();let last;
    const step=()=>{try{last=fn(a);}catch(e){last='error: '+e.message;}if(last&&!(typeof last==='string'&&last.startsWith('error: ')))return res(last);
      if(performance.now()-t0>T)return res({timeout:true,last});requestAnimationFrame(step);};step();}),[f.toString(),a,o.timeout||10000]);
  const settle=(f,a,o={})=>page.evaluate(([src,a,N,T])=>new Promise(res=>{const fn=(0,eval)('('+src+')'),t0=performance.now();let prev=null,same=0;
    const step=()=>{let v;try{v=JSON.stringify(fn(a));}catch(e){v='error: '+e.message;}same=v===prev?same+1:0;prev=v;
      if(same>=N)return res({ok:true,ms:Math.round(performance.now()-t0),v:JSON.parse(v)});if(performance.now()-t0>T)return res({ok:false,ms:Math.round(performance.now()-t0),v:prev});
      requestAnimationFrame(step);};step();}),[f.toString(),a,o.frames||3,o.timeout||5000]);
  // the larger of the page's calibration loop against CPU_REF and the 1 minute load average per CPU (a busy machine slows the GPU process
  // and the compositor too, which one loop on the main thread does not see)
  const cpu=()=>loadFactor(page);
  return {browser,ctx,page,wait,ev,shot,det,frames,until,settle,cpu};
}
const chk=(n,c)=>{console.log((c===true?'PASS ':'FAIL ')+n+(c===true?'':' -> '+c));if(c!==true)fails++;};
// a time limit that follows the machine: limit x the load factor measured now (the raw number is always printed)
async function perfChk(H,name,ms,limit){if(ms<limit)return chk(`${name}: ${ms} ms (limit ${limit})`,true);
  const f=await H.cpu();const lim=Math.round(limit*f);
  chk(`${name}: ${ms} ms (limit ${limit}, x${f.toFixed(2)} for the machine's load now = ${lim})`,ms<lim||`${ms} ms over ${lim} ms`);}
async function done(h){await h.browser.close();console.log(fails||errs.length?`FAILS ${fails} PAGEERRS ${errs.length}`:'ALL PASS');process.exit(fails||errs.length?1:0);}
module.exports={open,chk,done,perfChk,wait,loadFactor,frameFactor,CLOCK,CAL};
