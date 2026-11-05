// 3.4: Scourge and Calamity win rates by party size, with the careful brain. node bosswin.js N size [levelOffset] [stages e.g. 0123 4]
const {A,run,party}=require('./v3sim.js');
const N=+process.argv[2]||4,SZ=+process.argv[3]||3,OFF=+(process.argv[4]!==undefined?process.argv[4]:-1),ST=(process.argv[5]||'01234').split('').map(Number);
let seed=12345;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const pool=A.RAW.filter(r=>r[6]!=='L'&&r[6]!=='x'&&A.TPL[r[0]]).map(r=>r[0]);
const pickParty=()=>{const p=[];while(p.length<SZ){const id=pool[Math.floor(R()*pool.length)];if(!p.includes(id))p.push(id);}return p;};
const out=[];
for(const s of ST){const keys=s<4?A.GPOOL:A.FPOOL;let w=0,n=0;
  keys.forEach(k=>{for(let i=0;i<(s<4?N:N*3);i++){const p=pickParty();party(p,A.STAGE_BOSS_LV[s]+OFF,Math.min(5,s));A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);
    if(s<4)A.G.run.bosses[s]=k;else A.G.run.final=k;
    let r=null;try{r=run({stage:s,kind:'boss'});}catch(e){continue;}
    if(!r)continue;n++;if(r.res==='win')w++;}});
  out.push(`stage ${s+1} ${s<4?'Scourge':'Calamity'} (party ${SZ} at lv ${A.STAGE_BOSS_LV[s]+OFF}): ${w}/${n} = ${(100*w/n).toFixed(0)}%`);}
console.log(out.join('\n'));
