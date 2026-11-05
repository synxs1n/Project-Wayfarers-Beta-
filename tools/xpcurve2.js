// Beta v0.3.2 model: normal campaign (F field + D dungeon fights per realm, boss quests), with a slower curve and the auto penalty.
const F=+process.argv[2]||14,D=+process.argv[3]||8;
const STAGE_LV=[[2,7],[8,14],[15,22],[23,30],[31,38]],BOSS=[8,16,24,32,40];
const xpFor=(lv,m)=>Math.round((1.55*Math.pow(lv,1.55)+5)*m);
function sim(NEED,autoShare,autoMul){let lv=1,xp=0;const at=[];
  const gain=(x,flv,boss)=>{const am=boss?1:(1-autoShare+autoShare*autoMul);const mul=lv>40?Math.max(.25,Math.min(1,1-.08*(lv-flv-2))):1;xp+=Math.round(x*mul*am);while(lv<50&&xp>=NEED(lv)){xp-=NEED(lv);lv++;}};
  for(let s=0;s<5;s++){const [lo,hi]=STAGE_LV[s];
    for(let i=0;i<F;i++){const f=lo+(hi-lo)*i/F;gain(2.15*xpFor(f,1),f);}
    for(let i=0;i<D;i++){const f=lo+1+(hi-lo)*i/D;gain(2.15*xpFor(f,1),f);}
    at.push(lv+(xp/NEED(lv)).toFixed(1).slice(1));gain(xpFor(BOSS[s],4)+(s>=2&&s<4?xpFor(hi-1,1):0),BOSS[s],1);}
  return `bosses at ${at.join(', ')}; end ${lv}`;}
const K=+process.argv[4]||1.15;
const old=lv=>Math.round(11*Math.pow(lv,1.55)),nw=lv=>Math.round(11*K*Math.pow(lv,1.55));
console.log('old curve, manual      :',sim(old,0,1));
console.log(`new x${K} manual        :`,sim(nw,0,1));
console.log(`new x${K} half on auto  :`,sim(nw,.5,.75));
console.log(`new x${K} all on auto   :`,sim(nw,1,.75));
for(const f of [10,14,18,22])console.log(`  F=${f} D=${D} manual: `+(()=>{const g=F;return ''})());
