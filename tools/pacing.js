// 3.6 pacing: play F regular fights per stage plus the stage boss with the careful brain and report the party level after each stage.
// node pacing.js [partySize] [maxFightsPerStage] [runs]  (fights until the highest hero is at boss base -1)
const {A,run,party}=require('./v3sim.js');
const SZ=+process.argv[2]||3,F=+process.argv[3]||30,RUNS=+process.argv[4]||3;
let seed=31;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const pool=A.RAW.filter(r=>r[6]!=='L'&&r[6]!=='x'&&A.TPL[r[0]]).map(r=>r[0]);
const pickParty=()=>{const p=[];while(p.length<SZ){const id=pool[Math.floor(R()*pool.length)];if(!p.includes(id))p.push(id);}return p;};
const heal=()=>Object.values(A.G.roster).forEach(c=>{c.ail={};c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
const res=[];
for(let r=0;r<RUNS;r++){
  const ids=pickParty();party(ids,3,0);heal();
  const row=[],fightsNeeded=[];let losses=0,bossLoss=0;
  for(let s=0;s<5;s++){A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);
    const goal=A.STAGE_BOSS_LV[s]-1;let nf=0;const hiLv=()=>Math.max(...A.G.party.map(id=>A.G.roster[id].lv));
    while(hiLv()<goal&&nf<F){const out=run({stage:s,kind:'field',weather:'clear'});nf++;if(!out)heal();if(out&&out.res==='lose')losses++;if(nf%3===0||out&&out.res!=='win')heal();}
    fightsNeeded[s]=nf;
    let tries=0,w=false;while(!w&&tries<3){tries++;heal();const k=A.G.run;if(s<4)k.bosses[s]=k.bosses[s]||A.GPOOL[0];else k.final=k.final||A.FPOOL[0];const o=run({stage:s,kind:'boss'});w=o&&o.res==='win';if(!w)bossLoss++;}
    A.G.cleared[s]=true;
    const lvs=A.G.party.map(id=>A.G.roster[id].lv);row.push(Math.max(...lvs)+'/'+Math.round(lvs.reduce((a,b)=>a+b,0)/lvs.length));}
  res.push({row,losses,bossLoss,fightsNeeded});}
console.log(`party ${SZ}, ${F} fights per stage, careful brain. highest/average level after each stage (boss levels 8/16/24/32/40):`);
res.forEach(r=>console.log('levels',r.row.join('  '),'| fights to be ready per stage',r.fightsNeeded.join(','),'(total '+r.fightsNeeded.reduce((a,b)=>a+b,0)+') | field losses',r.losses,'boss losses',r.bossLoss));
