// Beta v0.9.5 fewer, better fights (part 1): random battles per step are well down from v0.8.2 (ENC_RATE, ENC_MIN_STEPS), every realm's
// field and dungeon have visible roamers and they include each foe role of the realm's pool (also for all sixteen realm pools), a field
// roamer is drawn, starts a roamer battle when touched (a surprise round while it has not seen you) and pays the ENC reward, no page errors.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v095p1.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'normal',music:0,sfx:0,gfx:'low',hints:false}}));`;
(async()=>{const h=await open({pre:PRE});const {ev,wait}=h;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(400);
// 1) random battles per step on a field: count the encounters arrive() rolls over many steps (the battle start itself is swallowed)
const e=await ev(()=>{const A=__A,T=A.TW.get,G=A.G,WS=A.WS,m=A.getMap('f0');G.weather=G.weather||{};G.weather[0]='clear';G.ward=0;
  let spot=null;for(let y=2;y<m.h-2&&!spot;y++)for(let x=2;x<m.w-2&&!spot;x++){if(A.tileAt(m,x,y)!==','||(m.exits||[]).some(q=>Math.abs(q.x-x)+Math.abs(q.y-y)<4))continue;spot=[x,y];}
  A.placeAt('f0',spot[0],spot[1],'d');const st0=window.setTimeout,mr=Math.random;let s=12345;window.setTimeout=()=>0;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
  const arrive=T('arrive'),N=8000;let n=0;WS.steps=0;
  try{for(let i=0;i<N;i++){WS.steps++;WS.lock=false;A.V.modal=null;WS.dlg=null;arrive();if(WS.lock)n++;}}finally{window.setTimeout=st0;Math.random=mr;WS.lock=false;A.V.modal=null;WS.dlg=null;}
  const R=A.ENC_RATE.normal,gap=A.ENC_MIN_STEPS;return {n,N,spot,R,gap,newPer:gap+1/R,oldPer:7+1/.13,exp:N/(gap+1/R),old:N/(7+1/.13)};});
console.log(JSON.stringify(e));
chk(`random battles: ${e.n} in ${e.N} field steps, about one every ${(e.N/e.n).toFixed(1)} steps (v0.8.2: one every ${e.oldPer.toFixed(1)}, ${Math.round(e.old)} battles)`,e.n>0&&e.n<=e.old*.55||JSON.stringify(e));
chk(`random battles match the configured rate (expected about ${Math.round(e.exp)})`,Math.abs(e.n-e.exp)<=e.exp*.25||JSON.stringify(e));
// 2) roamers on every realm's field and in its dungeon, with the realm's roles
const r=await ev(()=>{const A=__A,T=A.TW.get,out=[];for(let s=0;s<5;s++){const f=A.getMap('f'+s),d=A.getMap('d'+s);f.roam=null;d.roam=null;
    const RF=A.roamSpawn(f),RD=A.roamSpawn(d),pool=T('ZS')(s).pool,roles=[...new Set(pool.map(k=>A.B4.roleOf(A.MON[k])).filter(Boolean))];
    out.push({s,realm:T('ZS')(s).n,nf:RF.length,nd:RD.length,roles,fr:[...new Set(RF.map(q=>q.role).filter(Boolean))],dr:[...new Set(RD.map(q=>q.role).filter(Boolean))],
      far:RF.every(q=>(f.exits||[]).every(x=>Math.abs(x.x-q.x)+Math.abs(x.y-q.y)>=A.TW.get('ROAM').field.minFromExit)),open:RF.every(q=>A.tileAt(f,q.x,q.y)===','||A.tileAt(f,q.x,q.y)==='.')});}
  // all sixteen realm pools: the role-first pick
  const pick=T('roamPick'),seeded=T('seeded'),REALMS=T('REALMS'),all=REALMS.map(R=>{const roles=[...new Set(R.pool.map(k=>A.B4.roleOf(A.MON[k])).filter(Boolean))],L=pick(seeded(7),R.pool,4);return {n:R.n,roles,got:[...new Set(L.map(k=>A.B4.roleOf(A.MON[k])).filter(Boolean))]};});
  return {out,all};});
r.out.forEach(o=>{console.log(JSON.stringify(o));
  chk(`realm ${o.s+1} (${o.realm}): ${o.nf} field roamers and ${o.nd} dungeon roamers`,o.nf>=2&&o.nd>=4||JSON.stringify(o));
  chk(`realm ${o.s+1}: its roamers include every role of the realm (${o.roles.join(', ')||'none'}): all in the dungeon, as many as fit on the field`,o.roles.every(x=>o.dr.includes(x))&&o.fr.length>=Math.min(o.nf,o.roles.length)||JSON.stringify(o));
  chk(`realm ${o.s+1}: field roamers stand on open ground away from the exits`,o.far&&o.open||JSON.stringify(o));});
chk(`all sixteen realm pools: a dungeon's roamers (4 even in the first realm) cover the pool's roles (${r.all.filter(x=>x.roles.length).length} realms have roles)`,r.all.every(x=>x.roles.every(y=>x.got.includes(y)))||JSON.stringify(r.all));
// 3) a field roamer: drawn, touched on patrol -> a roamer battle with a surprise round, and the ENC reward through facMul
const f=await ev(async()=>{const A=__A,T=A.TW.get,WS=A.WS,f=A.getMap('f0');f.roam=null;const L=A.roamSpawn(f),q=L.find(x=>!x.elite)||L[0];
  A.placeAt('f0',q.hx,q.hy+2>=f.h-1?q.hy-2:q.hy+2,'u');f.roam=L;L.forEach(x=>{x.rest=performance.now()+1e9;});await new Promise(r=>setTimeout(r,600));
  const drawn=!!document.querySelector('canvas');q.x=WS.x;q.y=WS.y;q.mode='patrol';q.rest=0;q.t=0;await new Promise(r=>setTimeout(r,1800));
  const B=A.B,o={drawn,battle:A.V.screen==='battle',roam:!!(B&&B.spec&&B.spec.roam),mid:B&&B.spec&&B.spec.roam&&B.spec.roam.mid,sur:!!(B&&B.spec&&B.spec.surprise),lead:B&&B.en[0]&&B.en[0].base,mon:A.MON[q.mon].n};
  const k=T('encRewMul')(),fm=T('facMul')(),E=T('ENC');o.k=k;o.fm=fm;o.want={xp:E.rew.xp[0]*E.roam.xp,gold:E.rew.gold*E.roam.gold};
  try{A.setPause(0);}catch(e){}if(A.B){A.B.over=true;A.V.modal=null;A.finishBattle('fled');}return o;});
console.log(JSON.stringify(f));
chk('touching a field roamer on patrol starts a roamer battle led by it',f.battle&&f.roam&&f.mid==='f0'&&f.lead===f.mon||JSON.stringify(f));
chk('it had not seen the party: surprise round',f.sur===true||JSON.stringify(f));
chk('a roamer fight pays the ENC reward (XP and gold multipliers through facMul)',!!f.k&&Math.abs(f.k.xp-f.want.xp)<1e-9&&Math.abs(f.k.gold-f.want.gold)<1e-9&&f.fm.xp>=f.want.xp-1e-9||JSON.stringify(f));
const b=await ev(()=>{const A=__A,T=A.TW.get;A.G.run.bosses[0]=A.G.run.bosses[0]||'thornwarden';A.setPause(999999);A.startBattle({stage:0,kind:'boss',weather:'clear'});const k=T('encRewMul')();A.B.over=true;A.V.modal=null;A.finishBattle('x');return k;});
chk('a boss fight is not touched by the ENC reward',b===null||JSON.stringify(b));
await done(h);})();
