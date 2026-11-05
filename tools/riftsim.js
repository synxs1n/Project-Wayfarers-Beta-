// Rift echoes (post game, echoSpec scaling) vs parties at 40/45/50 with tier 6 gear. Usage: node riftsim.js N
process.env.SIMEXTRA='v3/echocore.js';
const {A,run,party}=require('./v3sim.js');const N=+process.argv[2]||2;let seed=777;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const pool=A.RAW.filter(r=>r[6]!=='L'&&r[6]!=='x'&&A.TPL[r[0]]).map(r=>r[0]);const pickParty=()=>{const p=[];while(p.length<6){const id=pool[Math.floor(R()*pool.length)];if(!p.includes(id))p.push(id);}return p;};
for(const [lv,plus] of [[40,1],[45,2],[50,3]]){const row=[`party lv ${lv} (tier 6 +${plus})`];for(const fin of [0,1]){let w=0,n=0,elv=0;const keys=fin?A.FPOOL:A.GPOOL;
  keys.forEach(k=>{for(let i=0;i<(fin?N*3:N);i++){party(pickParty(),lv,5);Object.values(A.G.roster).forEach(c=>{['w','a'].forEach(sl=>{if(c.eq[sl])c.eq[sl]=c.eq[sl]+'+'+plus;});c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
    A.G.stage=4;A.G.cleared=[1,1,1,1,1].map(Boolean);A.G.won=true;const sp=Object.assign(A.echoSpec(k),{rift:1});elv=sp.lv;let r=null;try{r=run(sp);}catch(e){console.log('ERR',e.message);continue;}if(!r)continue;n++;if(r.res==='win')w++;}});
  row.push(`${fin?'Calamity':'Scourge'} echoes lv ${elv}: ${(100*w/n).toFixed(0)}% (${w}/${n})`);}console.log(row.join(' | '));}
