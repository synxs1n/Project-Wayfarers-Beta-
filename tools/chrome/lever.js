const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const fs=require('fs');
const MOCK=`<script>(()=>{const S=new Map();const mk=(p,d)=>({id:p.split('/').pop(),exists:!!d,data:()=>d?JSON.parse(JSON.stringify(d)):undefined,metadata:{}});
const q=(cp,o)=>({orderBy:(f,dir)=>q(cp,Object.assign({},o,{f,dir})),limit:n=>q(cp,Object.assign({},o,{n})),where:()=>q(cp,o),
 get:async()=>{let docs=[...S.entries()].filter(([k])=>k.startsWith(cp+'/')&&k.slice(cp.length+1).split('/').length===1).map(([k,v])=>mk(k,v));
  if(o.f)docs.sort((a,b)=>(a.data()[o.f]-b.data()[o.f])*(o.dir==='desc'?-1:1));if(o.n)docs=docs.slice(0,o.n);return {docs,size:docs.length,empty:!docs.length};},
 doc:id=>D(cp+'/'+id)});
const D=p=>({id:p.split('/').pop(),path:p,get:async()=>mk(p,S.get(p)),set:async d=>{if(window.__VIEWONLY)throw {code:'invalid_argument'};S.set(p,JSON.parse(JSON.stringify(d)));},update:async d=>{if(!S.has(p))throw {code:'invalid_argument'};S.set(p,Object.assign(S.get(p),d));},collection:c=>q(p+'/'+c,{})});
const db={doc:D,collection:p=>q(p,{})};window.__S=S;
const user={me:async()=>({id:'u_test',name:'Tess Tester',isOwner:true,canEdit:true}),id:async()=>'u_test',isOwner:async()=>true,can:async()=>window.__VIEWONLY?false:true,profiles:async()=>({})};
window.claude={use:async n=>n==='db'?db:n==='user'?user:null};})();</script>`;

(async()=>{const browser=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:'shell'});
const page=await browser.newPage();const errs=[];page.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});
await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
const P='/tmp/claude-0/-home-claude/3e20b335-222a-5034-a09c-ede6c0dc9aa3/scratchpad/chrome/leg_page.html';
fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script>localStorage.clear();</script>'+MOCK+fs.readFileSync(__dirname+'/../out/aurelis3.html','utf8')+'</body></html>');
await page.goto('file://'+P,{waitUntil:'load'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));const ev=(f,a)=>page.evaluate(f,a);const shot=async n=>{await wait(350);await page.screenshot({path:__dirname+'/lg_'+n+'.png'});};

await ev(()=>{__A.ACT.new();['brann','mira','lumen'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();__A.META.cfg.enc='off';});await wait(300);
const r=await ev(()=>{const m=__A.getMap('d0');let L=null,K=null;m.t.forEach((row,y)=>row.forEach((c,x)=>{if(c==='l')L=[x,y];if(c==='K')K=[x,y];}));
  // stand below/left/right/up of lever on a floor tile
  const opts=[[0,1,'u'],[0,-1,'d'],[1,0,'l'],[-1,0,'r']];let at=null;for(const [dx,dy,f] of opts){const x=L[0]+dx,y=L[1]+dy;if(m.t[y][x]==='.'){at=[x,y,f];break;}}
  __A.placeAt('d0',at[0],at[1],at[2]);__A.WS.dir=at[2];__A.interact();return {L,K,at,lever:!!__A.G.levers['d0'],dlg:__A.WS.dlg&&__A.WS.dlg.text.slice(0,40)};});
console.log('lever',JSON.stringify(r));
await ev(()=>{__A.ACT.talk&&0;__A.WS.dlg=null;});
// diagonal tap-walk across the dungeon toward the start
const t=await ev(()=>{const m=__A.WS.m;__A.WS.target=[m.start[0],m.start[1]];return m.start;});await wait(6000);
console.log('walk to start',t,await ev(()=>[__A.WS.x,__A.WS.y]));
console.log('errs',errs.length);await browser.close();})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
