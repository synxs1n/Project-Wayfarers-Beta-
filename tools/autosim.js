// v0.4.1 2.5: auto (simple AI) vs competent manual play (the careful old brain), regular field fights. node autosim.js N [partySize]
const {A,run,party,Q,resetQ}=require('./v3sim.js');
const N=+process.argv[2]||60,SZ=+process.argv[3]||3;if(process.env.NERF)Object.assign(A.AUTO_NERF,JSON.parse(process.env.NERF));
let seed=4242;const R=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const pool=A.RAW.filter(r=>r[6]!=='L'&&r[6]!=='x'&&A.TPL[r[0]]).map(r=>r[0]);
const pick=n=>{const p=[];while(p.length<n){const id=pool[Math.floor(R()*pool.length)];if(!p.includes(id))p.push(id);}return p;};
const LV=[[4,7],[9,13],[15,19],[21,25],[27,31]];
function fight(s,ids,mode){
  const L=Math.round((LV[s][0]+LV[s][1])/2);party(ids,L,Math.min(5,s+1));A.G.stage=s;
  const Gp=A.G;Gp.cleared=[0,1,2,3,4].map(x=>x<s);
  A.V.auto=true;A.META.best={};A.setSmart(mode!=='auto');
  // run manually so HP and turns can be read before the battle is cleaned up
  resetQ();
  if(!A.startBattle({stage:s,kind:'field',weather:'clear'}))return null;
  const B0=A.B,all=B0.front.concat(B0.back),mhp=all.map(c=>c.S.mhp);let it=0;
  while(it++<200000){if(A.V.modal&&(A.V.modal.type==='result'||A.V.modal.type==='lose'))break;
    if(!Q().length){if(A.B&&A.B.mode==='cmd')(mode==='auto'?A.autoTurn:A.autoTurnSmart)();else if(A.B&&!A.B.over)A.advance();if(!Q().length)break;}
    Q().shift()();}
  const win=A.V.modal&&A.V.modal.type==='result';
  const lost=all.reduce((q,c,i)=>q+(mhp[i]-Math.max(0,c.hp))/mhp[i],0)/all.length;
  const turns=A.B?(A.B.pturns||0):0;
  A.V.modal=null;if(A.B)A.finishBattle('x');
  return {win,lost,turns};
}
const out={};
const modes=process.env.SKIPSMART?['auto']:process.env.SKIPAUTO?['smart']:['smart','auto'];for(const mode of modes){out[mode]=[];
  for(let s=0;s<5;s++){let n=0,w=0,lost=0,turns=0;seed=1000+s;
    for(let i=0;i<N;i++){const r=fight(s,pick(SZ),mode);if(!r)continue;n++;if(r.win)w++;lost+=r.lost;turns+=r.turns;}
    out[mode].push({s,n,win:(w/n*100).toFixed(0)+'%',hpLoss:(lost/n*100).toFixed(1)+'%',turns:(turns/n).toFixed(1)});}}
console.log('party size',SZ);
for(let s=0;s<5;s++){const a=out.smart[s],b=out.auto?out.auto[s]:{win:'-',hpLoss:'1',turns:'1'};
  console.log('stage',s+1,'manual: win',a.win,'loss',a.hpLoss,'turns',a.turns,'| auto: win',b.win,'loss',b.hpLoss,'turns',b.turns,'| turns x'+(b.turns/a.turns).toFixed(2),'hp loss x'+(parseFloat(b.hpLoss)/parseFloat(a.hpLoss)).toFixed(2));}
