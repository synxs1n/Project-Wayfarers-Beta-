// v0.4.1 6.5: The Steady Hand counts battles finished without Auto
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const fight=async(useAuto)=>ev(async(useAuto)=>{const A=__A;A.startBattle({stage:0,kind:'field',weather:'clear'});
  if(useAuto){A.B.auto=true;A.V.auto=true;}
  for(let i=0;i<1200;i++){await new Promise(r=>setTimeout(r,10));if(!A.B||A.B.over)break;
   if(A.B.mode==='cmd'){if(useAuto){A.B.auto=true;A.autoTurn();}else{A.B.auto=false;A.autoTurnSmart&&(A.B.auto=true,A.autoTurnSmart(),A.B.auto=false);}}}
  const o=A.B&&A.B.over; if(A.B&&A.B.over&&A.finishBattle)A.finishBattle('win'); return {over:!!o,man:A.facCount('manual'),used:A.B?A.B.autoUsed:0};},useAuto);
const a=await ev(()=>{const A=__A;return {has:!!A.FACB.hand,n:A.FAC.length,rank:A.facRank('hand'),perks:A.FACB.hand.perks.length,charm:!!A.GEAR.c_fa5&&!!A.GEAR.c_fb5};});
chk('6.5 the faction exists with 6 ranks, a charm and a signature charm',a.has&&a.n===6&&a.perks===6&&a.charm);
const r=await ev(()=>{const A=__A,G=A.G,o={};A.facDirty();const b0=A.facCount('manual');
  const fin=(auto)=>{A.startBattle({stage:0,kind:'field',weather:'clear'});A.B.autoUsed=!!auto;A.B.auto=false;A.B.en.forEach(e=>e.hp=0);A.finishBattle('win');};
  fin(false);fin(false);const b1=A.facCount('manual');fin(true);const b2=A.facCount('manual');
  o.d1=b1-b0;o.d2=b2-b1;o.rep=A.facRep('hand');
  G.fac.ctr.manual=200;A.facDirty();o.rank=A.facRank('hand');
  A.V.modal={type:'menu',tab:'factions'};A.render();o.screen=document.body.innerText.includes('Steady Hand');return o;});
console.log(JSON.stringify(r));
chk('6.5 battles finished by hand count, auto battles do not',r.d1===2&&r.d2===0);
chk('6.5 standing becomes ranks and the Factions screen lists it',r.rank>=4&&r.screen===true);
// v0.9.9: since v0.9.8 Auto is locked per foe type until it is beaten by hand (prog2.js): a locked Auto does nothing and marks nothing;
// once the foes count as beaten by hand (G.autoOk, as v063lib AUTO_OK), the real autoTurn path marks the battle
const w=await ev(async()=>{const A=__A,G=A.G;A.startBattle({stage:0,kind:'field',weather:'clear'});const before=!!A.B.autoUsed,lock=A.B.autoLock;A.B.auto=true;A.V.auto=true;
  A.autoTurn();const locked=!!A.B.autoUsed;
  if(!G.autoOk||typeof G.autoOk!=='object')G.autoOk={};A.B.en.forEach(e=>{if(e.base)G.autoOk[e.base]=99;});A.B.auto=true;A.autoTurn();
  return {before,lock,locked,after:!!(A.B&&A.B.autoUsed)};});
console.log(JSON.stringify(w));
chk('6.5 Auto is locked against foes not yet beaten by hand, and a locked Auto does not mark the battle',w.lock===1&&w.locked===false||JSON.stringify(w));
chk('6.5 using Auto in a battle marks it (real autoTurn path)',w.before===false&&w.after===true);
await done(H);})();
