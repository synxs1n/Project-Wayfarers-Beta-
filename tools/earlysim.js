// v0.4.3: the first realm with a fresh party of 3 (level L, starter gear). node earlysim.js N level
const {A,run,party}=require('./v3sim.js');
const N=+process.argv[2]||60,L=+process.argv[3]||3;const st=A.RAW.filter(r=>r[6]==='s').map(r=>r[0]);let seed=7;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
for(const mode of ['careful','auto']){let w=0,n=0,loss=0;
  for(let i=0;i<N;i++){const ids=[];while(ids.length<3){const id=st[Math.floor(R()*st.length)];if(!ids.includes(id))ids.push(id);}party(ids,L,0);A.G.stage=0;A.setSmart(mode==='careful');
    const all=A.G.party.map(id=>A.G.roster[id]),mhp=all.map(c=>c.S.mhp);const r=run({stage:0,kind:'field',weather:'clear'});if(!r)continue;n++;if(r.res==='win')w++;loss+=all.reduce((q,c,k)=>q+(mhp[k]-Math.max(0,c.hp))/mhp[k],0)/all.length;}
  console.log(`${mode}: party 3 at lv ${L}: win ${(100*w/n).toFixed(0)}% | HP lost ${(100*loss/n).toFixed(0)}%`);}
