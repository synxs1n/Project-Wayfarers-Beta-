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
const wait=ms=>new Promise(r=>setTimeout(r,ms));const ev=(f,a)=>page.evaluate(f,a);const shot=async n=>{await wait(350);await page.screenshot({path:__dirname+'/bt_'+n+'.png'});};
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
const chk=(n,c)=>console.log((c?'PASS ':'FAIL ')+n);
// version
chk('version const',await ev(()=>/^Beta v0\.\d+\.\d+$/.test(__A.GAME_VERSION)));
chk('fb context version',await ev(()=>{try{return __A.fbContext().version===__A.GAME_VERSION;}catch(e){return 'err '+e.message;}}));
// shops
await ev(()=>{__A.G.gold=5000;__A.V.modal={type:'smithy'};__A.render();});await shot('smithy');
chk('smithy title',await ev(()=>document.querySelector('#modal').innerText.includes('The Smithy')));
await ev(()=>{__A.V.modal.tab='craft';__A.render();});await shot('smithy_craft');
chk('smithy craft has only gear chips',await ev(()=>{const t=document.querySelector('#modal').innerText;return t.includes('Weapons')&&!t.includes('Brew')&&!t.includes('Travel');}));
await ev(()=>{__A.V.modal.tab='mats';__A.render();});await shot('smithy_mats');
for(let i=0;i<4;i++)await ev(()=>__A.ACT.buyPart('fang,1'));
chk('part limit 3',await ev(()=>__A.G.mats.fang===3&&__A.partLeft('fang')===0));
await ev(()=>{__A.V.modal={type:'workshop'};__A.render();});await shot('alch');
chk('alchemy title + stock',await ev(()=>{const t=document.querySelector('#modal').innerText;return t.includes('Alchemy')&&t.includes('Holy Water')&&t.includes('Tent')&&t.includes('Vital Charm');}));
await ev(()=>{__A.V.modal.tab='craft';__A.V.modal.cat='item';__A.render();});await shot('alch_craft');
await ev(()=>{__A.ACT.buyItem('holywater');__A.ACT.buyItem('tent');__A.ACT.buyItem('tent');});
await ev(()=>{__A.V.modal={type:'tavern'};__A.render();});await page.evaluate(()=>{document.querySelector('#modal .panel').scrollTop=9999;});await shot('tavern');
await ev(()=>{__A.ACT.buyItem('porkchop');__A.ACT.buyItem('porkchop');__A.V.modal=null;__A.render();});
chk('inv',await ev(()=>JSON.stringify({h:__A.G.inv.holywater,t:__A.G.inv.tent,p:__A.G.inv.porkchop}))==='{"h":1,"t":2,"p":2}');
// in town: tent and sandwich blocked
chk('tent blocked in town',await ev(()=>/town/i.test(__A.travelWhyNot('tent'))));
// go to field 0
await ev(()=>{const f=__A.getMap('f0');__A.placeAt('f0',f.ent[0],f.ent[1]+1,'d');});await wait(200);
chk('pork usable in a field since v0.4.0 (returns to the town inn)',await ev(()=>!__A.travelWhyNot('porkchop')));
// find a road (benign) tile and grass tile
const tiles=await ev(()=>{const m=__A.WS.m;let road=null,grass=null;for(let y=0;y<m.t.length;y++)for(let x=0;x<m.t[0].length;x++){if(!road&&!__A.encTile(m,x,y)&&m.t[y][x]!=='#'&&!'TtW~^'.includes(m.t[y][x])&&m.free&&m.free[y]&&m.free[y][x])road=[x,y];if(!grass&&__A.encTile(m,x,y))grass=[x,y];}return {road,grass,start:[__A.WS.x,__A.WS.y],c:m.t[__A.WS.y][__A.WS.x],benign:__A.encTile(m,__A.WS.x,__A.WS.y)};});
console.log('tiles',JSON.stringify(tiles));
// holy water: 150 steps, refresh not stack, skips encounters
await ev(()=>{__A.useTravel('holywater');});await wait(100);
chk('ward set',await ev(()=>__A.G.ward===150&&document.querySelector('#wkw').innerText.includes('150')));
await shot('ward');
const enc=await ev(()=>{const m=__A.WS.m;let n=0;const st=__A.startBattle;let fights=0;
  // stand on grass, call arrive repeatedly with steps forced high and a rate of 1
  const g=__A.G;__A.META.cfg.enc='high';for(let i=0;i<100;i++){__A.WS.steps=50;__A.arrive();}return {ward:g.ward,B:!!__A.B};});
console.log('after 100 steps',JSON.stringify(enc));
chk('ward decremented, no battle',enc.ward===50&&!enc.B);
await ev(()=>{__A.G.inv.holywater=1;__A.useTravel('holywater');});chk('refresh not stack',await ev(()=>__A.G.ward===150));
// tent on benign: never ambushed; heal happens
const benign=await ev((r)=>{__A.placeAt('f0',r[0],r[1],'d');const P=__A.G.party.map(id=>__A.G.roster[id]);P[0].hp=0;P[1].hp=1;P[1].mp=0;let amb=0;for(let i=0;i<40;i++){__A.G.inv.tent=2;__A.WS.lock=false;__A.useTravel('tent');}
  return {hp0:P[0].hp,m0:P[0].S.mhp,hp1:P[1].hp,mhp1:P[1].S.mhp,mp1:P[1].mp,lock:__A.WS.lock,c:__A.encTile(__A.WS.m,r[0],r[1])};},tiles.road);
console.log('benign',JSON.stringify(benign));
await wait(1200);chk('no ambush on benign tile (40 tries)',await ev(()=>!__A.B));
// Tent heal math on single use
await ev(()=>{__A.WS.lock=false;});
const heal=await ev(()=>{__A.WS.lock=false;const P=__A.G.party.map(id=>__A.G.roster[id]);P.forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;});P[0].hp=0;P[1].hp=1;P[1].mp=0;__A.G.inv.tent=1;__A.useTravel('tent');return {r0:P[0].hp/P[0].S.mhp,r1:P[1].hp/P[1].S.mhp,m1:P[1].mp/P[1].S.mmp,left:__A.G.inv.tent};});
console.log('heal',JSON.stringify(heal));chk('tent heal 30% revive / ~60%',Math.abs(heal.r0-.3)<.02&&Math.abs(heal.r1-.6)<.03&&Math.abs(heal.m1-.6)<.03&&heal.left===0);
// tent on grass: ambush rate around 30%, and ward does not stop it
let amb=0;const N=60;
for(let i=0;i<N;i++){const r=await ev((g)=>{__A.placeAt('f0',g[0],g[1],'d');__A.WS.lock=false;__A.G.inv.tent=1;__A.G.ward=150;__A.useTravel('tent');return true;},tiles.grass);await wait(800);
  const b=await ev(()=>{if(__A.B){const s=__A.B.spec.ambush;const pw=__A.B.en[0].S.atk;__A.B.over=true;__A.finishBattle('fled');return {s,pw};}return null;});if(b)amb++;if(i<5)console.log('dbg',JSON.stringify(b));}
console.log('grass ambushes',amb,'/',N);chk('grass ambush ~30%',amb>=8&&amb<=30);
// ambush stats +15%
const st=await ev(()=>{__A.RNGseed&&0;const a=__A.encounterFoes?1:0;return a;});
// battle: pork chop flee guaranteed in field fight, blocked in boss
await ev(()=>{__A.G.party.forEach(id=>{const c=__A.G.roster[id];c.hp=c.S.mhp;});__A.startBattle({stage:0,kind:'field'});});await wait(200);
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:15000}).catch(()=>{});
await ev(()=>{__A.B.menu='items';__A.render();});await shot('battle_items');
chk('battle menu hides tent/holy water',await ev(()=>{const t=document.querySelector('#screen').innerText;return t.includes('Pork Chop')&&!t.includes('Holy Water')&&!/\bTent\b/.test(t);}));
await ev(()=>__A.ACT.item('porkchop'));await wait(2500);
chk('pork flee works',await ev(()=>!__A.B&&__A.G.inv.porkchop===1));
await ev(()=>{__A.G.party.forEach(id=>{const c=__A.G.roster[id];c.hp=c.S.mhp;});__A.startBattle({stage:0,kind:'boss'});});await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:15000}).catch(()=>{});
await ev(()=>__A.ACT.item('porkchop'));await wait(500);
chk('pork blocked vs boss',await ev(()=>!!__A.B&&__A.G.inv.porkchop===1));
await ev(()=>{__A.B.over=true;__A.finishBattle('fled');});
// dungeon: pork chop returns to entrance
await ev(()=>{__A.enterDungeon(0);});await wait(400);
const d=await ev(()=>{const m=__A.WS.m;const fl=[];for(let y=0;y<m.t.length;y++)for(let x=0;x<m.t[0].length;x++)if(m.t[y][x]==='.'&&Math.abs(x-m.start[0])+Math.abs(y-m.start[1])>12)fl.push([x,y]);const p=fl[Math.floor(fl.length/2)];__A.placeAt(m.id,p[0],p[1],'d');__A.WS.lock=false;__A.useTravel('porkchop');return {start:m.start,from:p};});
console.log('d',JSON.stringify(d));await wait(800);console.log('now',await ev(()=>JSON.stringify([__A.WS.x,__A.WS.y,__A.WS.m.id,__A.G.inv.porkchop])));chk('pork returns to dungeon entrance',await ev((s)=>__A.WS.x===s[0]&&__A.WS.y===s[1]&&__A.WS.m.kind==='dungeon',d.start));
chk('tent blocked near boss',await ev(()=>{const m=__A.WS.m;__A.G.keys[m.id]=1;__A.placeAt(m.id,m.bossAt[0],m.bossAt[1]+2,'d');__A.G.inv.tent=1;return /guardian/.test(__A.travelWhyNot('tent'));}));
// items tab
await ev(()=>{__A.ACT.menu();__A.ACT.menuTab('items');});await shot('items');
await ev(()=>{__A.ACT.menuTab('next');});await page.evaluate(()=>{document.querySelector('#modal .panel').scrollTop=9999;});await shot('next');
await ev(()=>{__A.V.modal=null;__A.ACT.fbOpen();});await wait(200);await ev(()=>{__A.V.modal.tab='help';__A.render();});await page.evaluate(()=>{document.querySelector('#modal .panel').scrollTop=9999;});await shot('help');
// daily trial: no travel items
const dly=await ev(()=>{try{__A.V.modal=null;__A.ACT.daily&&0;return 'skip';}catch(e){return e.message;}});
await ev(()=>{__A.V.modal=null;__A.V.screen='title';__A.G=null;__A.render();});await shot('title');
console.log('errors',errs.length);await browser.close();})();
