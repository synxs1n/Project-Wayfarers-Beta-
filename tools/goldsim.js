// 7.1: gold earned per stage from regular fights (careful brain, party of 6) against what the shops ask. node goldsim.js N
const {A,run,party}=require('./v3sim.js');
const N=+process.argv[2]||30;const pool=A.RAW.filter(r=>r[6]!=='L'&&r[6]!=='x'&&A.TPL[r[0]]).map(r=>r[0]).slice(0,40);
const LV=[6,13,20,28,36];
for(let s=0;s<5;s++){let gold=0,n=0;party(pool.slice(s*6,s*6+6),LV[s],Math.min(5,s+1));A.G.stage=s;A.G.cleared=[0,1,2,3,4].map(x=>x<s);
  for(let i=0;i<N;i++){const g0=A.G.gold;const r=run({stage:s,kind:'field',weather:'clear'});if(r&&r.res==='win'){gold+=A.G.gold-g0;n++;}}
  const tier=Math.min(5,s+1),w=A.GEAR['w_blade_'+tier],a=A.GEAR['a_mail_'+tier];
  console.log(`stage ${s+1}: ${(gold/Math.max(1,n)).toFixed(0)} gold per won fight | tier ${tier} sword ${w&&w.price} | mail ${a&&a.price} | ok`);}
