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

await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
console.log('pool stage0',await ev(()=>__A.tavernPool().join(',')));
console.log('needs',await ev(()=>JSON.stringify(__A.partyNeeds())));
console.log('offers',await ev(()=>__A.tavernOffers().map(id=>id+'('+__A.recruitFit(id).w.toFixed(1)+': '+__A.recruitFit(id).why.join('; ')+')').join(' | ')));
// offer frequency over many rolls
console.log('freq',await ev(()=>{const c={};for(let i=0;i<400;i++){__A.G.tavRoll=i;__A.tavernOffers().forEach(id=>c[id]=(c[id]||0)+1);}__A.G.tavRoll=0;return JSON.stringify(c);}));
await ev(()=>{__A.V.modal={type:'tavern'};__A.render();});await shot('tavern');
await ev(()=>{__A.V.modal={type:'guild',tab:'recruit'};__A.render();});await shot('guild');
await ev(()=>{__A.ACT.chAccept('cass');});
// simulate 4 field wins with weakness hits
for(let i=0;i<4;i++){await ev(()=>{__A.V.modal=null;__A.setPause(0);__A.startBattle({stage:0,kind:'field'});__A.B.hitWeak=1;__A.B.en.forEach(e=>{e.hp=0;});__A.advance&&0;});
  await ev(()=>{const B=__A.B;B.over=false;});await ev(()=>{/* force win */});
  await ev(()=>{const B=__A.B;B.en.forEach(e=>e.hp=0);});await wait(50);await ev(()=>{__A.advance();});await page.waitForFunction(()=>__A.V.modal&&__A.V.modal.type==='result',{timeout:20000}).catch(()=>{});
  await ev(()=>{__A.ACT.resultOk();});await wait(100);}
console.log('cass',await ev(()=>JSON.stringify(__A.G.chall.cass)));
await ev(()=>{__A.V.modal={type:'guild',tab:'recruit'};__A.render();});await shot('guild2');
await ev(()=>__A.ACT.chClaim('cass'));console.log('roster',await ev(()=>Object.keys(__A.G.roster).join(',')));
await ev(()=>{__A.G.stats.battles=13;__A.V.modal=null;});console.log('pool after 13 battles',await ev(()=>__A.tavernPool().join(',')));
await ev(()=>{__A.ACT.menu();__A.ACT.menuTab('next');});await shot('next');
await page.evaluate(()=>{document.querySelector('#modal .panel').scrollTop=9999;});await shot('next2');
console.log('errs',errs.length);await browser.close();})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
