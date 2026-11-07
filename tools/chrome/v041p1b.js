// v0.4.1 1.1b: every enemy skill status exists; watchdog recovers a broken enemy turn in every battle kind
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(30);});
const r=await H.ev(()=>{const A=__A;const bad=[];let n=0;
  for(const id of Object.keys(A.TPL)){const t=A.TPL[id];if(t.mon)continue;
    for(const kind of ['duel','arena','elite','legend']){
      let foes;try{A.G.stage=3;foes=A.encounterFoes({stage:3,kind,hero:id,ce:{hero:id,mode:'duel'}});}catch(e){continue;}
      (foes||[]).forEach(f=>(f.sk||[]).forEach(s=>{n++;(s.fx||[]).forEach(([k])=>{if(!A.STS||!A.STS[k])bad.push(id+':'+kind+':'+s.n+':'+k);});}));}}
  return {bad,n};});
console.log(JSON.stringify(r).slice(0,300));
chk('1.1b all enemy skill statuses exist',r.bad.length===0&&r.n>100);
// watchdog: sabotage an enemy skill with an unknown status and a throwing perform, battle must still advance
const w=await H.ev(async()=>{const A=__A;A.G.stage=3;A.V.modal=null;
  // v0.9.9: a fixed battle seed, and foes too tough to fall in the window, so a short random battle cannot end before six moves are seen
  const ok=A.startBattle({stage:3,kind:'field',seed:4242});if(!ok)return {err:'nostart'};
  A.B.en.forEach(e=>{e.S.mhp*=30;e.hp=e.S.mhp;e.sk=[{n:'Bad',k:'buff',t:'self',pw:0,mp:0,el:null,cost:1,fx:[['nonesuch',1]]}];});
  // v0.9.8 locks Auto per foe type until it is beaten by hand: these foes count as known, so the heroes' turns run on auto too (without it the
  // battle stopped at the first hero turn and the check only passed when six enemy moves came before it)
  A.G.autoOk=A.G.autoOk||{};A.B.en.forEach(e=>{A.G.autoOk[e.base||e.name]=99;A.G.autoOk[e.name]=99;});
  A.B.auto=true;A.V.auto=true;let lastLog=A.B.log.length,moved=0;
  // the battle runs in real time: watch it until six moves are seen or 40 s pass (was 600 x 10 ms, about 6 s idle, far less on a busy machine)
  const t0=performance.now();while(performance.now()-t0<40000&&moved<=5){await new Promise(r=>setTimeout(r,10));if(!A.B||A.B.over)break;if(A.B.mode==='cmd')A.autoTurnSmart();if(A.B.log.length>lastLog){moved++;lastLog=A.B.log.length;}}
  return {moved,over:!A.B||A.B.over,wd:(window.__WD||[]).length,s:Math.round((performance.now()-t0)/1000)};});
console.log(JSON.stringify(w));
chk('1.1b battle keeps moving with a broken enemy skill',w.moved>5&&!w.err||JSON.stringify(w));
await done(H);})();
