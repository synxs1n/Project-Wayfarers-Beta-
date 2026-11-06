// Playwright harness (replaces puppeteer+sparticuz in this workspace). Usage: const {open,chk,done}=require('./pw');
const fs=require('fs');const path=require('path');
const {chromium}=require('playwright');
const MOCK=(()=>{const s=fs.readFileSync(__dirname+'/beta.js','utf8');const a=s.indexOf('const MOCK=`')+12;return s.slice(a,s.indexOf('`;',a));})();
let fails=0,errs=[];
async function open(opt={}){
  // opt.browser: share one browser (each open still gets its own context, so its own localStorage: a second "device")
  // opt.mock: a script (no <script> tag) used instead of the default window.claude MOCK; opt.before(page): runs before the page loads
  const browser=opt.browser||await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:opt.w||390,height:opt.h||844},isMobile:!!opt.mobile,hasTouch:!!opt.mobile,deviceScaleFactor:opt.dpr||1});
  const page=await ctx.newPage();page.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',(opt.tag?opt.tag+' ':'')+e.message,(e.stack||'').split('\n').slice(0,4).join(' | '));});
  if(opt.before)await opt.before(page,ctx);
  const html=opt.html||fs.readFileSync(process.env.PWHTML||__dirname+'/../out/aurelis3.html','utf8');
  const P=path.join(opt.dir||'/tmp','pw_page_'+process.pid+(opt.tag?'_'+opt.tag:'')+'.html');
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script>'+(opt.pre||'localStorage.clear();')+'</script>'+(opt.mock!=null?'<script>'+opt.mock+'</script>':MOCK)+html+'</body></html>');
  await page.goto('file://'+P,{waitUntil:'load'});
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const ev=(f,a)=>page.evaluate(f,a);
  const shot=async n=>{await wait(250);await page.screenshot({path:(opt.out||'/tmp')+'/pw_'+n+'.png'});};
  return {browser,ctx,page,wait,ev,shot};
}
const chk=(n,c)=>{console.log((c===true?'PASS ':'FAIL ')+n+(c===true?'':' -> '+c));if(c!==true)fails++;};
async function done(h){await h.browser.close();console.log(fails||errs.length?`FAILS ${fails} PAGEERRS ${errs.length}`:'ALL PASS');process.exit(fails||errs.length?1:0);}
module.exports={open,chk,done};
