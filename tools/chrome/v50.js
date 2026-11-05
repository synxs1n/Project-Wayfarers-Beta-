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

await ev(()=>{__A.META.legends={kaevan:1,nikaris:1,jaeson:1};__A.ACT.new();['brann','mira','lumen'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(400);
await ev(()=>{__A.legendJoin('kaevan');__A.legendJoin('jaeson');__A.V.modal=null;__A.recruit('kael',true);__A.G.gear.push('w_blade_1','a_mail_1');Object.values(__A.G.roster).forEach(c=>{c.pts=3;});__A.render();});
// diagonal keyboard move in town
const p0=await ev(()=>[__A.WS.x,__A.WS.y]);
await page.keyboard.down('ArrowRight');await page.keyboard.down('ArrowDown');await wait(1300);await page.keyboard.up('ArrowRight');await page.keyboard.up('ArrowDown');await wait(400);
const p1=await ev(()=>[__A.WS.x,__A.WS.y,__A.WS.dir,__A.WS.face]);console.log('diag',p0,'->',p1);
// corner rule: find a spot with a solid tile right and down-right free? test diagOk directly
console.log('diagOk sample',await ev(()=>{const m=__A.WS.m;let ok=0,bad=0;for(let y=1;y<m.t.length-1;y++)for(let x=1;x<m.t[0].length-1;x++){const sx=__A.solidAt?0:0;}return 'n/a';}));
// walk out of the east gate diagonally from road+1 row
const gate=await ev(()=>{const m=__A.WS.m,W=m.t[0].length,y=m.road;__A.placeAt(m.id,W-3,y+1,'r');return [W,y,m.exits.length];});
await page.keyboard.down('ArrowRight');await page.keyboard.down('ArrowUp');await wait(900);await page.keyboard.up('ArrowRight');await page.keyboard.up('ArrowUp');await wait(800);
console.log('gate',gate,'now in',await ev(()=>__A.WS.m.id+' '+__A.WS.x+','+__A.WS.y));
// back to town, menu party -> char sheet
await ev(()=>{const [x,y]=__A.innSpot(0);__A.placeAt('t0',x,y,'d');__A.ACT.menu();});await wait(300);
await page.click('#modal [data-act="viewChar"]');await wait(300);await shot('sheet');
console.log('sheet',await ev(()=>[__A.V.modal.type,__A.V.modal.char,(__A.V.modal.list||[]).length]));
await ev(()=>__A.ACT.addPt('str'));await ev(()=>__A.ACT.gearSlot('w'));await shot('gear');await ev(()=>{const b=document.querySelector('#modal [data-act="equip"]');if(b)b.click();});
console.log('after equip',await ev(()=>JSON.stringify(__A.G.roster[__A.V.modal.char].eq)),'pts',await ev(()=>__A.G.roster[__A.V.modal.char].pts));
await page.keyboard.press('ArrowRight');await wait(200);console.log('next',await ev(()=>__A.V.modal.char));
await page.keyboard.press('ArrowLeft');await wait(200);console.log('prev',await ev(()=>__A.V.modal.char));
// swipe
const box=await ev(()=>{const r=document.querySelector('#modal .panel').getBoundingClientRect();return [r.left+r.width/2,r.top+300];});
await page.touchscreen.touchStart(box[0]+80,box[1]);await page.touchscreen.touchMove(box[0]-60,box[1]+5);await page.touchscreen.touchEnd();await wait(300);console.log('swipe',await ev(()=>__A.V.modal.char));
await ev(()=>{document.querySelector('#modal').scrollTop=2000;const p=document.querySelector('#modal .panel');p.scrollTop=2000;});await shot('sheet_scrolled');
console.log('X visible',await ev(()=>{const b=document.querySelector('#modal .mclose').getBoundingClientRect();return [Math.round(b.top),Math.round(b.bottom),innerHeight];}));
await page.keyboard.press('Escape');await wait(200);console.log('esc closes',await ev(()=>__A.V.modal));
// roster legend chip and codex
await ev(()=>{__A.ACT.menu();__A.ACT.menuTab('roster');__A.ACT.flt('legend');});await shot('roster_leg');
console.log('roster legend list',await ev(()=>__A.V.charList.join(',')));
await ev(()=>{__A.ACT.menuTab('codex');});await shot('codex');
// auto battle panel
await ev(()=>{__A.V.modal=null;__A.setPause(500);__A.V.auto=true;__A.startBattle({stage:0,kind:'field'});});await wait(3500);await shot('auto1');
console.log('autoLast',await ev(()=>JSON.stringify(__A.B&&__A.B.autoLast)));
const h1=await ev(()=>document.getElementById('bcmd')?document.getElementById('bcmd').offsetHeight:document.querySelector('.autop').offsetHeight);await wait(1500);
const h2=await ev(()=>document.querySelector('.autop')?document.querySelector('.autop').offsetHeight:-1);console.log('auto panel heights',h1,h2);await shot('auto2');
await ev(()=>{__A.ACT.auto();});await wait(400);
// X on result
await page.waitForFunction(()=>__A.B&&(__A.B.mode==='cmd'||__A.B.over),{timeout:30000});
console.log('errs',errs.length);await browser.close();})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
