// Beta v0.5.0 4.3: how fast do late joiners catch up? A party of 6 at level L (stage s) with two newcomers G levels lower
// (one in the front row, one in the reserve). Fights N field battles (careful brain, healed after each) and reports the levels gained.
//   node xpcatch.js [fights]                         (old rule: x1.4 at 4+ levels behind)
//   SIMEXTRA=v3/p4xp.js node xpcatch.js [fights]     (v0.5.0 catch up)
const {A,run,party}=require('./v3sim.js');
const N=+process.argv[2]||30,RUNS=+process.env.RUNS||3;
const cases=[[1,14,3],[1,14,8],[2,21,10],[3,29,5],[4,36,6]];
const heal=()=>Object.values(A.G.roster).forEach(c=>{c.ail={};c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
const ids=['brann','mira','sable','lumen','oren','gilda'];
const need=A.need||null;
console.log((process.env.SIMEXTRA?'with v0.5.0 catch up':'old rule')+`, ${N} fights, ${RUNS} runs`);
for(const [s,L,gap] of cases){let top=0,fr=0,bk=0,cu=0;
  for(let r=0;r<RUNS;r++){party(ids,L,Math.min(5,s));A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);
    [ids[2],ids[5]].forEach(id=>{A.G.roster[id]=A.newChar(id,L-gap,Math.min(5,s));});heal();
    const lv=id=>A.G.roster[id].lv+A.G.roster[id].xp/Math.max(1,(A.need?A.need(A.G.roster[id].lv):1e9));
    const t0=lv(ids[0]),f0=lv(ids[2]),b0=lv(ids[5]);
    for(let i=0;i<N;i++){run({stage:s,kind:'field',weather:'clear'});if(A.lastInfo&&A.lastInfo.catchup)cu++;heal();}
    top+=lv(ids[0])-t0;fr+=lv(ids[2])-f0;bk+=lv(ids[5])-b0;}
  console.log(`stage ${s+1}, party lv ${L}, newcomers ${gap} behind: levels gained: top hero ${(top/RUNS).toFixed(2)}, front newcomer ${(fr/RUNS).toFixed(2)}, reserve newcomer ${(bk/RUNS).toFixed(2)} (fights showing a catch up line: ${cu})`);}
