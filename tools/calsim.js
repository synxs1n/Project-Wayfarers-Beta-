// Calamity-only (and stage 4) auto sims with selected auto-swap rules off. Usage: OFF=healer,weakness node calsim.js N
const {A,run,party}=require('./v3sim.js');(process.env.OFF||'').split(',').filter(Boolean).forEach(k=>{A.ASR[k]=0;});
const N=+process.argv[2]||20;let seed=777;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const pool=A.RAW.filter(r=>r[6]!=='L'&&r[6]!=='x'&&A.TPL[r[0]]).map(r=>r[0]);
const pickParty=()=>{const p=[];while(p.length<6){const id=pool[Math.floor(R()*pool.length)];if(!p.includes(id))p.push(id);}return p;};
let out=[];for(const s of [3,4]){let w=0,n=0,sw=0;const keys=s<4?A.GPOOL:A.FPOOL;keys.forEach(k=>{for(let i=0;i<(s<4?Math.ceil(N/3):N);i++){party(pickParty(),A.STAGE_BOSS_LV[s]-1,Math.min(5,s));A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);if(s<4)A.G.run.bosses[s]=k;else A.G.run.final=k;
  const r=run({stage:s,kind:'boss'});if(!r)continue;n++;if(r.res==='win')w++;sw+=r.log.filter(l=>/^Auto: /.test(l)).length;}});out.push(`${s<4?'stage 4':'Calamity'} ${(100*w/n).toFixed(0)}% (${w}/${n}), swaps/fight ${(sw/n).toFixed(2)}`);}
console.log('off=['+(process.env.OFF||'')+'] '+out.join(' | '));
