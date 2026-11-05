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
await ev(()=>__A.ACT.redeemOpen());await wait(300);
await page.type('#redeemIn','wrong-code');await ev(()=>__A.ACT.redeem());await wait(400);console.log('wrong',await ev(()=>__A.REDEEM.msg));
await ev(()=>{__A.REDEEM.until=0;});
for(const c of ['kaevan-placeholder',' NIKARIS-PLACEHOLDER ','JAESON-PLACEHOLDER']){await ev(()=>{document.getElementById('redeemIn').value='';});await page.type('#redeemIn',c);await ev(()=>__A.ACT.redeem());await wait(500);console.log('code',await ev(()=>__A.REDEEM.msg));}
await shot('redeem');
console.log('legends',await ev(()=>JSON.stringify(__A.META.legends)));
await wait(4500);console.log('remote flags',await ev(()=>JSON.stringify((__S.get('profile/u_test')||{}).flags)));
await ev(()=>{__A.V.modal=null;__A.ACT.new();['brann','mira','lumen'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(400);
// force quests at stage 1 (and jaeson at a snow/heights stage)
const qs=await ev(()=>{const G=__A.G;G.stage=4;G.cleared=[true,true,true,true,false];for(let s=1;s<=4;s++){G.legRoll={};}
  for(let tries=0;tries<40&&G.quests.filter(q=>q.type==='legend').length<3;tries++){G.legRoll={};for(let s=1;s<=4;s++)__A.genQuests(s);}
  G.quests.filter(q=>q.type==='legend').forEach(q=>q.state='active');Object.values(G.roster).forEach(c=>{c.lv=30;});return G.quests.filter(q=>q.type==='legend').map(q=>q.hero+'@'+q.stage);});
console.log('quests',qs);
await ev(()=>{__A.V.modal={type:'board'};__A.render();});await shot('board');
// Kaevan event field
const kq=await ev(()=>{const q=__A.G.quests.find(q=>q.hero==='kaevan');__A.V.modal=null;const m=__A.getMap('f'+q.stage);const a=__A.dynActors(m).find(a=>a.type==='legend');__A.placeAt('f'+q.stage,a.x,a.y+1,'u');__A.render();return [a.x,a.y];});
await wait(500);await shot('dusk');
await ev(()=>{__A.WS.dir='u';__A.interact();});await shot('kevt');
await ev(()=>{__A.setPause(150);__A.V.auto=true;__A.ACT.legendFight();});await page.waitForFunction(()=>__A.B&&__A.B.mode,{timeout:20000});
// v0.3.2: auto is locked on an unbeaten legend fight; the test treats it as already won by hand
await ev(()=>{const k=__A.bossFightKey(__A.B.spec);__A.G.bossWon=Object.assign(__A.G.bossWon||{},{[k]:1});__A.B.auto=true;if(__A.B.mode==='cmd')__A.autoTurn();});await wait(1500);await shot('kbattle');
await page.waitForFunction(()=>__A.V.modal&&(__A.V.modal.type==='result'||__A.V.modal.type==='lose'),{timeout:240000}).catch(()=>console.log('timeout'));
console.log('kaevan fight',await ev(()=>__A.V.modal.type),await ev(()=>__A.V.modal.info&&__A.V.modal.info.legend));await shot('kresult');
await ev(()=>{if(__A.V.modal.type==='result')__A.ACT.resultOk();else __A.ACT.loseOk();});await wait(500);
// Nikaris chain: shortcut steps
await ev(()=>{const q=__A.G.quests.find(q=>q.hero==='nikaris');q.step=2;__A.V.modal=null;const m=__A.getMap('f'+q.stage);const a=__A.dynActors(m).find(a=>a.type==='legend'&&a.q.hero==='nikaris');__A.placeAt('f'+q.stage,a.x,a.y+1,'u');__A.render();});
await wait(400);await shot('night');await ev(()=>{__A.WS.dir='u';__A.interact();});await shot('nevt');await ev(()=>__A.ACT.legendJoinBtn());await wait(300);
// Jaeson puzzle
const jq=await ev(()=>{const q=__A.G.quests.find(q=>q.hero==='jaeson');if(!q)return null;__A.V.modal=null;const m=__A.getMap('f'+q.stage);const a=__A.dynActors(m).find(a=>a.type==='legend'&&a.q.hero==='jaeson');__A.placeAt('f'+q.stage,a.x,a.y+1,'u');__A.WS.dir='u';__A.interact();return __A.G.weather[q.stage];});
console.log('jaeson weather',jq);await shot('puzzle');
// solve by brute force (2^9)
await ev(()=>{const C=__A.V.conv;const press=(c,i)=>{const x=i%3,y=Math.floor(i/3);[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<3&&ny<3)c[ny*3+nx]=!c[ny*3+nx];});};
  for(let mask=0;mask<512;mask++){const c=C.c.slice();for(let i=0;i<9;i++)if(mask>>i&1)press(c,i);if(c.every(Boolean)){for(let i=0;i<9;i++)if(mask>>i&1)__A.ACT.convPress(String(i));break;}}});
await shot('solved');await ev(()=>__A.ACT.convDone());await ev(()=>__A.ACT.legendJoinBtn());await wait(300);
console.log('roster',await ev(()=>Object.keys(__A.G.roster).join(',')));
await ev(()=>{__A.V.modal=null;__A.G.party=['kaevan','nikaris','jaeson','brann','mira','lumen'];__A.setPause(300);__A.V.auto=false;__A.startBattle({stage:1,kind:'field'});});await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000});await wait(800);await shot('party');
await ev(()=>{__A.V.modal=null;__A.ACT.toTitle&&0;__A.V.modal={type:'menu',tab:'codex'};__A.render();});await shot('codex');
await ev(()=>{__A.ACT.codex('kaevan');});await shot('codexk');
await ev(()=>{__A.ACT.codex('jaeson');});await shot('codexj');
await ev(()=>{__A.ACT.codex('nikaris');});await shot('codexn');
console.log('errs',errs.length);await browser.close();})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
