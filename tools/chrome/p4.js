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
const wait=ms=>new Promise(r=>setTimeout(r,ms));const chk=(n,c)=>console.log((c?'PASS ':'FAIL ')+n+(c&&c!==true?' '+c:''));
const P=__dirname+'/p4_page.html';
fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script>localStorage.clear();</script>'+MOCK+fs.readFileSync(__dirname+'/../out/aurelis3.html','utf8')+'</body></html>');
const page=await browser.newPage();const errs=[];page.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});
await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});await page.goto('file://'+P,{waitUntil:'load'});
const ev=(f,a)=>page.evaluate(f,a);const shot=async n=>{await wait(300);await page.screenshot({path:__dirname+'/p4_'+n+'.png'});};
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(400);
// ---- A1 timings
chk('A1 timings 1x 2.2s, 2x 1.3s',await ev(()=>{const A=__A;A.META.cfg.speed=1;const a=A.numDur();A.META.cfg.speed=2;const b=A.numDur(),c=A.fxDur({txt:'Melt',cls:'react'});A.META.cfg.speed=1;return Math.abs(a-2.2)<.01&&Math.abs(b-1.3)<.01&&c>=1.9?`1x ${a}s, 2x ${b}s, react at 2x ${c}s`:false;}));
// ---- A2 learn toast outside battle + New badge
const ln=await ev(async()=>{const A=__A,c=A.G.roster.mira;A.learnScanAll();A.addXp(c,200000);A.render();await new Promise(r=>setTimeout(r,500));const t=document.querySelector('#lnq .lnn');const txt=t?t.innerText:'';
  A.ACT.openChar?A.ACT.openChar('mira'):(A.V.modal={type:'char',char:'mira'});A.render();const badges=document.querySelectorAll('#modal .newb').length;A.V.modal=null;A.render();A.V.modal={type:'char',char:'mira'};A.render();const after=document.querySelectorAll('#modal .newb').length;A.V.modal=null;A.render();
  return {txt:txt.slice(0,80),badges,after,lv:c.lv};});
console.log('learn',JSON.stringify(ln));chk('A2 toast "learned" outside battle',/learned/.test(ln.txt));chk('A2 New badge then cleared after viewing',ln.badges>0&&ln.after===0);
// ---- A3 companion text
const cp=await ev(()=>{const A=__A,G=A.G;G.tamed.push({id:'tmx1',mon:'frostwolf',name:'Fang',cls:'warrior',trait:'keen',with:'oren'});return {t:A.compBonusText(G.tamed[0]),crit:A.calcStats(G.roster.oren).crit};});
console.log('comp',JSON.stringify(cp));chk('A3 bonus text lists stats and the perk',/\+4% HP/.test(cp.t)&&/Pack Instinct/.test(cp.t));
// ---- A1 layer + B2 auto cut + learn rows on result
await ev(()=>{const A=__A;A.V.modal=null;A.G.party.forEach(id=>{const h=A.G.roster[id];h.hp=h.S.mhp;});A.startBattle({stage:0,kind:'field'});});
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:20000}).catch(()=>{});
const lay=await ev(()=>{const A=__A,B=A.B;const e=B.en[0];['128','Super effective!','Burn','Weakened','Steam Burst'].forEach((t,i)=>A.fx(e,t,i?'stat effx up':'dmg crit'));A.render();
  const st=document.getElementById('bstage').getBoundingClientRect(),R=[...document.querySelectorAll('.fx2')].map(x=>x.getBoundingClientRect());let ov=0,out=0;
  R.forEach((a,i)=>{if(a.left<st.left-1||a.right>st.right+1||a.top<st.top-1)out++;R.forEach((b,j)=>{if(j>i&&a.left<b.right&&a.right>b.left&&a.top<b.bottom-1&&a.bottom-1>b.top)ov++;});});return {n:R.length,ov,out,h:Math.round(R[0]&&R[0].height)};});
console.log('fx layer',JSON.stringify(lay));chk('A1 five texts on one foe, inside the stage, none overlapping',lay.n===5&&!lay.ov&&!lay.out);
await shot('fx');
const ac=await ev(async()=>{const A=__A,B=A.B;B.auto=true;A.V.auto=true;A.autoTurn();for(let i=0;i<800&&A.B&&!(A.V.modal&&A.V.modal.type==='result');i++){if(A.B.mode==='cmd'&&A.B.auto)A.autoTurn();await new Promise(r=>setTimeout(r,15));}
  const t=document.querySelector('#modal')?document.querySelector('#modal').innerText:'';return {log:A.B&&A.B.log.slice(-4).join(' | '),hp:A.B&&A.B.en.map(e=>e.hp).join(','),mt:A.V.modal&&A.V.modal.type,res:A.B&&A.B.result&&A.B.result.autoCut,over:!A.B||A.B.over,cut:A.V.modal&&A.V.modal.info&&A.V.modal.info.autoCut,txt:/mostly on auto/.test(t),tA:A.B&&A.B.tA,tP:A.B&&A.B.tP};});
console.log('auto',JSON.stringify(ac));chk('B2 auto win pays 66% with a note',ac.cut===.66&&ac.txt);
await ev(()=>{__A.V.auto=false;__A.ACT.resultOk&&__A.ACT.resultOk();__A.V.modal=null;__A.render();});await wait(300);
// ---- B3 boss lock
const bl=await ev(()=>{const A=__A,G=A.G;A.V.auto=true;G.party.forEach(id=>{const h=G.roster[id];h.hp=h.S.mhp;});A.startBattle({stage:0,kind:'boss'});const B=A.B;A.render();
  const btn=document.querySelector('.autolock');const lock=A.autoLocked();A.ACT.auto();const r={lock,auto:B.auto,btn:!!btn,why:!!document.querySelector('.autowhy')};
  // pretend we won it by hand
  G.bossWon={['b:'+A.G.run.bosses[0]]:1};r.after=A.autoLocked();A.B.over=true;A.G.daily=null;return r;});
console.log('lock',JSON.stringify(bl));chk('B3 boss auto locked with reason, unlocked after a manual win',bl.lock&&!bl.auto&&bl.btn&&bl.why&&!bl.after);
const old=await ev(()=>{const A=__A;const o=A.packG();o.cleared=[true,true,false,false,false];delete o.bossWon;const g=A.unpackG(JSON.parse(JSON.stringify(o)));return Object.keys(g.bossWon);});
console.log('old bossWon',JSON.stringify(old));chk('B3 old save marks cleared bosses as won',old.length===2);
// ---- C story echo in dungeon 0
await ev(()=>{__A.V.modal=null;__A.B&&(__A.B.over=true);});
const ec=await ev(()=>{const A=__A,G=A.G;window.__B0=A.B;G.cleared[0]=true;A.resetMaps&&A.resetMaps();A.enterDungeon(0);const m=A.WS.m,[x,y]=m.bossAt;return {up:A.storyEchoUp(0),tile:A.tileAt(m,x,y)};});
console.log('echo map',JSON.stringify(ec));chk('C1 echo waits on the rune circle once the boss is beaten',ec.up&&ec.tile==='X');
const ef=await ev(async()=>{const A=__A,G=A.G;A.ACT.echoStory(0);await new Promise(r=>setTimeout(r,300));const B=A.B,e=B.en[0];const r={kind:B.spec.kind,name:e.name,base:e.base,lv:e.lv,sk:e.sk.map(s=>s.n).join(','),p2:!!e.phase2,lock:A.autoLocked()};
  B.en.forEach(x=>{x.hp=0;});A.advance();for(let i=0;i<100&&!(A.V.modal&&A.V.modal.type==='result');i++)await new Promise(r=>setTimeout(r,30));r.story=(G.echoStory||{})[0];r.shard=G.mats['es_'+G.run.bosses[0]];r.ess=G.mats.essence;r.notes=(A.V.modal&&A.V.modal.info&&A.V.modal.info.notes||[]).join(' ');return r;});
console.log('echo fight',JSON.stringify(ef));chk('C1 story echo: Echo form, new skill, 2nd phase, locked auto',/^Echo /.test(ef.base)&&/Resounding/.test(ef.sk)&&ef.p2&&ef.lock);
chk('C3 first win drops its shard and essence',ef.story===1&&ef.shard===1&&ef.ess>=3);
await shot('echo_result');
const rift=await ev(()=>{const A=__A,G=A.G;A.ACT.resultOk&&A.ACT.resultOk();A.V.modal=null;G.won=true;A.V.modal={type:'travel'};A.render();const t=document.querySelector('#modal').innerText;const k0=A.riftKeys().length;A.META.echoRift=1;const k1=A.riftKeys().length;A.META.echoRift=0;
  const t2=t;return {row:/Echo Sanctum/.test(t),k0,k1,list:/\(1\/5\)|Go/.test(t2)};});
console.log('rift',JSON.stringify(rift));chk('C2 (v0.3.3) Echo Sanctum row on the waystone; 1 echo now, all 25 after the account unlock',rift.row&&rift.k0===1&&rift.k1===25&&rift.list);
await shot('rift');
const fo=await ev(()=>{const A=__A,G=A.G;A.efCost('blade');Object.keys(A.efCost('blade')).forEach(k=>{G.mats[k]=10;});G.gold=99999;G.gear.push('w_blade_5+2');A.V.modal={type:'smithy',tab:'echo'};A.render();const t=document.querySelector('#modal').innerText;
  A.ACT.efForge('blade');const ok=G.gear.some(g=>g==='w_blade_ef'||g==='w_blade_ef+2')||Object.values(G.roster).some(c=>c.eq.w==='w_blade_ef'||c.eq.w==='w_blade_ef+2');/* v0.16.8: Echoforged pieces are forged at their final strength (no plus) */const g=A.gearOf('w_blade_ef'),b=A.gearOf('w_blade_5');return {tab:/Echoforged Ruinsong/.test(t),ok,atk:g.atk,base:b.atk};});
console.log('forge',JSON.stringify(fo));chk('C3 Echoforge tab and forging keeps the temper',fo.tab&&fo.ok&&fo.atk>fo.base);
// ---- C bestiary
const be=await ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'beasts'};A.render();const t=document.querySelector('#modal').innerText;return {grp:/Echoes/i.test(t),tag:document.querySelectorAll('.echot').length};});
console.log('bestiary',JSON.stringify(be));chk('C1 Echo entries in their own Bestiary group',be.grp&&be.tag>0);
// ---- D map
const mp=await ev(async()=>{const A=__A,G=A.G;A.V.modal=null;A.render();A.enterDungeon(0);await new Promise(r=>setTimeout(r,300));const m=A.WS.m;
  // walk the whole dungeon floor to reveal it
  for(let y=0;y<m.h;y+=3)for(let x=0;x<m.w;x+=3){A.WS.x=x;A.WS.y=y;A.revealAround();}A.WS.x=m.start[0];A.WS.y=m.start[1]-1;
  const marks=A.mapMarks(m),kinds=[...new Set(marks.map(o=>o.k))];A.ACT.map();await new Promise(r=>setTimeout(r,200));const cv=document.getElementById('fmap');
  const exp=(G.explored||{})[m.id]||'';const mini=document.getElementById('mmap');return {kinds,cv:cv?cv.width+'x'+cv.height:null,exp:exp.length,mini:mini?mini.style.display:'none'};});
console.log('map',JSON.stringify(mp));chk('D map draws, saves explored bits compactly',mp.cv&&mp.exp>0&&mp.exp<1200);
chk('D dungeon markers: stairs, chests, door, boss or echo',['stairs','door'].every(k=>mp.kinds.includes(k))&&mp.kinds.some(k=>/chest/.test(k))&&mp.kinds.some(k=>/echo|boss/.test(k)));
await shot('map');
const fogged=await ev(()=>{const A=__A,G=A.G;A.V.modal=null;{const m1=A.getMap('f1'),a=m1.gates&&m1.gates.start?m1.gates.start.arrive:[2,m1.sy||5,'r'];A.placeAt('f1',a[0],a[1],a[2]||'r');}const m=A.WS.m;let seen=0;for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(A.isSeen(m,x,y))seen++;return {seen,all:m.w*m.h};});
console.log('fog',JSON.stringify(fogged));chk('D fog of war: a new field is mostly hidden',fogged.seen>0&&fogged.seen<fogged.all*.2);
const pg2=await browser.newPage();pg2.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message,String(e.stack).split('\n').slice(0,5).join(' | '));});await pg2.setViewport({width:1100,height:800});await pg2.goto('file://'+P,{waitUntil:'load'});
await pg2.evaluate(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();{const m0=A.getMap('f0'),a=m0.gates&&m0.gates.start?m0.gates.start.arrive:[3,m0.sy];A.placeAt('f0',a[0],a[1],a[2]||'r');}A.render();});await wait(500);
const mm=await pg2.evaluate(()=>{const c=document.getElementById('mmap');return c?c.style.display:'missing';});chk('D minimap on by default on wide screens',mm==='block');await pg2.screenshot({path:__dirname+'/p4_mini.png'});
chk('no page errors',!errs.length);
await browser.close();})();
