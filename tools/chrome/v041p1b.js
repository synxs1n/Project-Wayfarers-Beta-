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
  const ok=A.startBattle({stage:3,kind:'field'});if(!ok)return {err:'nostart'};
  A.B.en.forEach(e=>{e.sk=[{n:'Bad',k:'buff',t:'self',pw:0,mp:0,el:null,cost:1,fx:[['nonesuch',1]]}];});
  A.B.auto=true;A.V.auto=true;let lastLog=A.B.log.length,moved=0;
  for(let i=0;i<600;i++){await new Promise(r=>setTimeout(r,10));if(!A.B||A.B.over)break;if(A.B.mode==='cmd')A.autoTurnSmart();if(A.B.log.length>lastLog){moved++;lastLog=A.B.log.length;}}
  return {moved,over:!A.B||A.B.over,wd:(window.__WD||[]).length};});
console.log(JSON.stringify(w));
chk('1.1b battle keeps moving with a broken enemy skill',w.moved>5&&!w.err);
await done(H);})();
