// Scourge and Calamity win rates with auto battle, same parties for both builds. Usage: V3DIR=dir node bossim.js N
const {A,run,party}=require('./v3sim.js');
const N=+process.argv[2]||6;let seed=12345;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const pool=A.RAW.filter(r=>r[6]!=='L'&&r[6]!=='x'&&A.TPL[r[0]]).map(r=>r[0]);
const pickParty=()=>{const p=[];while(p.length<6){const id=pool[Math.floor(R()*pool.length)];if(!p.includes(id))p.push(id);}return p;};
const out=[];let tot=0,totw=0;
for(let s=0;s<5;s++){const keys=s<4?A.GPOOL:A.FPOOL;let w=0,n=0,turns=0;
  keys.forEach(k=>{for(let i=0;i<(s<4?N:N*3);i++){const p=pickParty();party(p,A.STAGE_BOSS_LV[s]-1,Math.min(5,s));A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);
    if(s<4)A.G.run.bosses[s]=k;else A.G.run.final=k;
    let r=null;try{r=run({stage:s,kind:'boss'});}catch(e){console.log('ERR',e.message);continue;}
    if(!r)continue;n++;if(r.res==='win')w++;turns+=r.t;}});
  tot+=n;totw+=w;out.push(`stage ${s+1} (${s<4?'Scourges':'Calamities'}, party lv ${A.STAGE_BOSS_LV[s]-1}): ${w}/${n} = ${(100*w/n).toFixed(0)}%`);}
console.log((process.env.V3DIR||'v3')+'\n'+out.join('\n')+`\noverall ${(100*totw/tot).toFixed(0)}%`);
