// Expected hero level through a normal campaign (no grinding): per realm F field fights and D dungeon fights
// (2.15 foes average), quests' boss XP, then the boss. Front-line share. Usage: node xpcurve.js F D
const F=+process.argv[2]||14,D=+process.argv[3]||8;
const STAGE_LV=[[2,7],[8,14],[15,22],[23,30],[31,38]],BOSS=[8,16,24,32,40];
const variants={old:{need:lv=>Math.round(11*Math.pow(lv,1.55)),brake:false,cap:60},new:{need:lv=>Math.round(11*Math.pow(lv,1.55)),brake:true,cap:50}};
const xpFor=(lv,m)=>Math.round((1.55*Math.pow(lv,1.55)+5)*m);
for(const [k,V] of Object.entries(variants)){let lv=1,xp=0;const at=[];
  const gain=(x,flv)=>{const mul=V.brake&&lv>40?Math.max(.25,Math.min(1,1-.08*(lv-flv-2))):1;xp+=Math.round(x*mul);while(lv<V.cap&&xp>=V.need(lv)){xp-=V.need(lv);lv++;}};
  for(let s=0;s<5;s++){const [lo,hi]=STAGE_LV[s];
    for(let i=0;i<F;i++){const f=lo+(hi-lo)*i/F;gain(2.15*xpFor(f,1),f);}
    for(let i=0;i<D;i++){const f=lo+1+(hi-lo)*i/D;gain(2.15*xpFor(f,1),f);}
    at.push(lv);gain(xpFor(BOSS[s],4)+(s>=2&&s<4?xpFor(hi-1,1):0),BOSS[s]);}
  // post game: how many lv 50 echo wins (4x) or lv 36 field fights to go from the end level to 50
  let l2=lv,x2=xp,fights=0;while(l2<50&&fights<5000){fights++;const flv=36,mul=V.brake&&l2>40?Math.max(.25,Math.min(1,1-.08*(l2-flv-2))):1;x2+=Math.round(2.15*xpFor(flv,1)*mul);while(l2<V.cap&&x2>=V.need(l2)){x2-=V.need(l2);l2++;}}
  console.log(`${k}: level entering each boss fight ${at.join(', ')}; after the Calamity ${lv}. Field fights vs lv 36 foes to reach 50: ${fights}`);}
console.log('need(lv): '+[10,20,30,35,40,45,49].map(l=>`${l}:${Math.round(11*Math.pow(l,1.55))}`).join(' '));
