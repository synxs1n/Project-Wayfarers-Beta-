// Phase 10: win rates at fixed party levels vs the late bosses. Usage: node balance10.js N [kind]
const {A,run,party}=require('./v3sim.js');
const N=+process.argv[2]||4;let seed=909;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const pool=A.RAW.filter(r=>r[6]!=='L'&&r[6]!=='x'&&A.TPL[r[0]]).map(r=>r[0]);
const pickParty=()=>{const p=[];while(p.length<6){const id=pool[Math.floor(R()*pool.length)];if(!p.includes(id))p.push(id);}return p;};
const tierFor=L=>L>=40?5:L>=35?4:3;
for(const L of [30,35,40,45]){const out=[];
  for(const [s,kind,label] of [[3,'boss','Scourge 4'],[4,'boss','Calamity'],[3,'storyEcho','Echo 4'],[4,'storyEcho','Echo Calamity']]){
    const keys=s<4?A.GPOOL:A.FPOOL;let w=0,n=0,turns=0;
    keys.forEach(k=>{for(let i=0;i<(s<4?N:N*3);i++){party(pickParty(),L,tierFor(L));A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<(kind==='boss'?s:s+1));
      if(s<4)A.G.run.bosses[s]=k;else A.G.run.final=k;const spec=kind==='boss'?{stage:s,kind:'boss'}:{stage:s,kind:'storyEcho',key:k};
      let r=null;try{r=run(spec);}catch(e){continue;}if(!r)continue;n++;if(r.res==='win')w++;turns+=r.t||0;}});
    out.push(`${label} ${w}/${n}=${(100*w/Math.max(1,n)).toFixed(0)}%`);}
  console.log(`party lv ${L} tier ${tierFor(L)}: `+out.join(' | '));}
