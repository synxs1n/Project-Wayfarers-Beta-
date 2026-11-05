// v0.4.3: a fresh party of 3 walking the first field: fights in a row with no rest (HP, MP and KOs carry over). node chainsim.js runs
const {A,run,party}=require('./v3sim.js');
const RUNS=+process.argv[2]||40,ST=+process.argv[3]||0,LV=+process.argv[4]||3,TIER=+process.argv[5]||0;const st=A.RAW.filter(r=>r[6]==='s').map(r=>r[0]).slice(0,16);let seed=11;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
let tot=0,wins=0,fights=0,lvs=0;const hist=[];
for(let r=0;r<RUNS;r++){const ids=[];while(ids.length<3){const id=st[Math.floor(R()*st.length)];if(!ids.includes(id))ids.push(id);}party(ids,LV,TIER);A.G.stage=ST;A.G.cleared=[0,1,2,3,4].map(x=>x<ST);
  let n=0;for(;n<12;n++){const alive=A.G.party.map(id=>A.G.roster[id]).filter(c=>c.hp>0);if(!alive.length)break;const x=run({stage:ST,kind:'field',weather:'clear'});if(!x||x.res!=='win')break;wins++;}
  hist.push(n);fights+=n;lvs+=Math.max(...A.G.party.map(id=>A.G.roster[id].lv));}
hist.sort((a,b)=>a-b);console.log(`party 3 from lv ${LV}, stage ${ST+1} field, no rest: fights won before a wipe: avg ${(fights/RUNS).toFixed(1)}, median ${hist[RUNS>>1]}, min ${hist[0]}, 12+ in ${hist.filter(x=>x>=12).length}/${RUNS} | top level after ${(lvs/RUNS).toFixed(1)}`);
