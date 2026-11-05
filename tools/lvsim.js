// Win rates vs the stage-4 Scourges (level 32) and the Calamities at fixed party levels. Usage: V3DIR=dir node lvsim.js N
const {A,run,party}=require('./v3sim.js');
const N=+process.argv[2]||6;let seed=999;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const pool=A.RAW.filter(r=>r[6]!=='L'&&r[6]!=='x'&&A.TPL[r[0]]).map(r=>r[0]);
const pickParty=()=>{const p=[];while(p.length<6){const id=pool[Math.floor(R()*pool.length)];if(!p.includes(id))p.push(id);}return p;};
const LV=[[30,4,0],[35,5,0],[40,5,1],[45,5,2]];// party level, gear tier, tempering
const res=[];
for(const [lv,tier,plus] of LV){const row=[`party lv ${lv} (tier ${tier+1} gear${plus?' +'+plus:''})`];
  for(const s of [3,4]){let w=0,n=0,blv=0;const keys=s<4?A.GPOOL:A.FPOOL;
    keys.forEach(k=>{for(let i=0;i<(s<4?N:N*3);i++){party(pickParty(),lv,tier);if(plus)Object.values(A.G.roster).forEach(c=>{['w','a'].forEach(sl=>{if(c.eq[sl])c.eq[sl]=c.eq[sl]+'+'+plus;});c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
      A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);if(s<4)A.G.run.bosses[s]=k;else A.G.run.final=k;
      let r=null;try{r=run({stage:s,kind:'boss'});}catch(e){console.log('ERR',e.message);continue;}if(!r)continue;n++;if(r.res==='win')w++;}});
    blv=A.bossLvFor?A.bossLvFor(s):A.STAGE_BOSS_LV[s];row.push(`${s<4?'Scourge':'Calamity'} lv ${blv}: ${(100*w/n).toFixed(0)}% (${w}/${n})`);}
  res.push(row.join(' | '));}
console.log((process.env.V3DIR||'v3')+'\n'+res.join('\n'));
