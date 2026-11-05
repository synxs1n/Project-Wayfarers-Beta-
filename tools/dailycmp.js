// Daily Trial must be identical: same plan and the same hero stats as before this build
const fs=require('fs');function load(dir){process.env.V3DIR=dir;delete require.cache[require.resolve('./v3sim.js')];return require('./v3sim.js').A;}
const O=load('v3_pre_031'),N=load('v3');
for(const key of ['2026-10-28','2026-11-02','2027-01-15']){
  const a=O.dailyPlan(key),b=N.dailyPlan(key);const same=JSON.stringify(a)===JSON.stringify(b);
  const st=(A,P)=>{A.G={daily:{}};A.META.cfg.autoStats=false;return P.ids.map(id=>{const c=A.newChar(id,25,4);return Math.round(c.S.mhp)+'/'+Math.round(c.S.atk)+'/'+Math.round(c.S.mag)+'/'+Math.round(c.S.healP);}).join(' ');};
  const sa=st(O,a),sb=st(N,b);console.log(key,'plan same:',same,'| hero stats same:',sa===sb,sa===sb?'':('\n  old '+sa+'\n  new '+sb));}
// full start: same foes, same hero stats in battle
for(const [nm,A] of [['old',O],['new',N]]){A.META.cfg.autoStats=false;}
const run=A=>{A.G=null;try{A.newGame(['brann','mira','sable']);}catch(e){}const r=A.startDaily();const B=A.B;return JSON.stringify({w:B.weather,front:B.front.concat(B.back).map(c=>[c.id,Math.round(c.S.mhp),Math.round(c.S.atk),Math.round(c.S.mag),Math.round(c.S.def),Math.round(c.S.res),Math.round(c.S.spd),Math.round(c.S.healP)]),foes:B.en.map(e=>[e.name,e.lv,Math.round(e.S.mhp)])});};
const ra=run(O),rb=run(N);console.log('startDaily identical:',ra===rb);if(ra!==rb){console.log(ra);console.log(rb);}
