// Playwright harness (replaces puppeteer+sparticuz in this workspace). Usage: const {open,chk,done}=require('./pw');
const fs=require('fs');const path=require('path');
const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const MOCK=(()=>{const s=fs.readFileSync(__dirname+'/beta.js','utf8');const a=s.indexOf('const MOCK=`')+12;return s.slice(a,s.indexOf('`;',a));})();
let fails=0,errs=[];
async function open(opt={}){
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:opt.w||390,height:opt.h||844},isMobile:!!opt.mobile,hasTouch:!!opt.mobile,deviceScaleFactor:opt.dpr||1});
  const page=await ctx.newPage();page.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message,(e.stack||'').split('\n').slice(0,4).join(' | '));});
  const html=opt.html||fs.readFileSync(process.env.PWHTML||__dirname+'/../out/aurelis3.html','utf8');
  const P=path.join(opt.dir||'/tmp','pw_page_'+process.pid+'.html');
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script>'+(opt.pre||'localStorage.clear();')+'</script>'+MOCK+html+'</body></html>');
  await page.goto('file://'+P,{waitUntil:'load'});
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const ev=(f,a)=>page.evaluate(f,a);
  const shot=async n=>{await wait(250);await page.screenshot({path:(opt.out||'/tmp')+'/pw_'+n+'.png'});};
  return {browser,ctx,page,wait,ev,shot};
}
const chk=(n,c)=>{console.log((c===true?'PASS ':'FAIL ')+n+(c===true?'':' -> '+c));if(c!==true)fails++;};
async function done(h){await h.browser.close();console.log(fails||errs.length?`FAILS ${fails} PAGEERRS ${errs.length}`:'ALL PASS');process.exit(fails||errs.length?1:0);}
module.exports={open,chk,done};
