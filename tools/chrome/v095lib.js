// Beta v0.9.5 battle clarity: the shared scene for the v095b*.js tests and screenshots.
// scene(H,opt): a battle (v063lib battle()) with every foe type known (hit, scanned, studied, element weaknesses learned), the first
// foe primed with an element the party can detonate, the second a Charger wound up at the acting hero (its next move is a telegraphed
// Crushing Charge), the third a Hexer with a stacked Hex on a hero. opt.expert sets the Settings toggle, opt.plain skips the roles.
const {battle}=require('./v063lib');
async function scene(H,opt){opt=opt||{};const b=await battle(H,{heroes:opt.heroes||3,foes:opt.foes||3,seed:opt.seed||5,lv:opt.lv||22,fly:opt.fly||0});
  const r=await H.ev(o=>{const A=__A,B=A.B,G=A.G,M=A.META.best=A.META.best||{};A.META.cfg.expertBattle=!!o.expert;
    B.en.forEach(e=>{const b=M[e.base]=M[e.base]||{};b.seen=1;b.hit=1;b.scan=1;b.kills=b.kills||0;b.known=b.known||{};Object.keys(A.EL).forEach(el=>{try{if(A.effOf(el,e)!==1)b.known[el]=1;}catch(x){}});});
    const a=B.cur;
    if(!o.plain){
      // a prime on foe 0 that one of the heroes can detonate (the first detonator skill of the party)
      const ks=B.front.flatMap(c=>A.known(c).map(s=>({c,s}))),det=ks.find(x=>x.s.role==='det'&&A.skEls(x.s).length);
      if(det){const d=A.skEls(det.s)[0],p=Object.keys(A.EL).find(p=>A.TW.get('reactFor')(p,d));if(p&&B.en[0])B.en[0].primed={el:p,t:2,by:'Mira'};}
      if(B.en[1]){const e=B.en[1];e.role='charge';e.st=e.st||{};e.st.charge={t:2};e.b4slot=B.front.indexOf(a);e.next=a.next+1;}
      if(B.en[2]){const e=B.en[2];e.role='hex';const h=B.front[B.front.length-1];h.st=h.st||{};h.st.hex={t:99,v:2};}
    }
    A.render();return {cur:a&&a.name,mode:B.mode};},opt);
  await H.wait(250);return Object.assign(b,r);}
module.exports={scene};
