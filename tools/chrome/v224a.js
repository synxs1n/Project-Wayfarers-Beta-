// v0.22.42 / v0.22.43: prime and detonate from the first battle of a new journey.
//  1 every hero knows a Primer and a Detonator at level 1 (but for a late finisher: Nikaris, Dist); levels only went down (s.lv43 >= s.lv)
//  2 a new journey, first realm, the starting party as it is: a Primer primes a foe, the badge shows on the stage, a Detonator of
//    another element from a different hero sets it off
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v224a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v224a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:2,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false,goals:false}}));`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:META,tag:'v224a'});const {ev,wait}=H;
  const a=await ev(()=>{const g=__A.TW.get,TPL=g('TPL'),CLS=g('CLS'),cs=g('classSkills'),hit=g('skHitsFoe'),o={n:0,noP:[],noD:[],up:[],unsorted:[]};
    for(const id in TPL){const t=TPL[id];if(t.mon||!CLS[t.cls])continue;o.n++;const L=cs(t).filter(s=>!s.relic);
      if(!L.some(s=>s.lv<=1&&(s.role==='primer'||s.combo)&&hit(s)))o.noP.push(id);if(!L.some(s=>s.lv<=1&&(s.role==='det'||s.combo)&&hit(s)))o.noD.push(id);
      L.forEach((s,i)=>{if(s.lv43!=null&&s.lv43<s.lv)o.up.push(id+' '+s.n);if(i&&L[i-1].lv>s.lv)o.unsorted.push(id);});}
    return o;});
  chk(`1 ${a.n} heroes: a Primer at level 1 (missing: ${a.noP.join(',')||'none'}), a Detonator at level 1 (missing: ${a.noD.join(',')||'none'}); no level went up; lists stay in level order`,
    a.n>80&&!a.noP.length&&a.noD.every(id=>id==='nikaris'||id==='dist')&&a.noD.length<=2&&!a.up.length&&!a.unsorted.length||JSON.stringify(a));
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(1500);
  const b=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,o={pcV:G.pcV,stage:G.stage,lv:Object.values(G.roster).map(c=>c.lv)};A.setPause(999999);g('startBattle')({stage:0,kind:'wild'});const B=A.B,e=B.en[0];e.hp=e.S.mhp=99999;e.S.eva=0;
    const known=g('known');let pr=null,dt=null;B.front.forEach(c=>known(c).forEach(s=>{if(s.role==='primer'&&!pr)pr=[c,s];}));if(!pr)return o;B.cur=pr[0];B.nPrime=0;A.perform(pr[0],pr[1],[e]);o.primed=e.primed&&e.primed.el;o.np=B.nPrime;
    window.__t={pr,e};return o;});
  await wait(900);
  const c=await ev(()=>{const A=__A,g=A.TW.get,B=A.B,known=g('known'),pr=window.__t.pr,e=window.__t.e,o={};let dt=null;try{g('renderBattle')();}catch(x){}
    const el=document.querySelector('#bstage .primed');o.badge=!!el&&el.getBoundingClientRect().width>8;
    B.front.forEach(c=>known(c).forEach(s=>{if(c!==pr[0]&&s.role==='det'&&!dt&&[].concat(s.el).some(x=>x!==e.primed.el))dt=[c,s];}));if(!dt)return o;
    B.nDet=0;B.cur=dt[0];A.perform(dt[0],dt[1],[e]);o.det=B.nDet;o.left=e.primed;o.who=pr[0].id+' '+pr[1].n+' then '+dt[0].id+' '+dt[1].n;B.over=true;A.V.modal=null;A.finishBattle('x');return o;});Object.assign(b,c);
  chk(`2 new journey (pcV ${b.pcV}), realm ${b.stage+1}, levels ${b.lv}: ${b.who}: primed ${b.primed}, badge on the stage ${b.badge}, ${b.det} detonation`,
    b.pcV===1&&b.stage===0&&!!b.primed&&b.np===1&&b.badge&&b.det===1&&b.left===null||JSON.stringify(b));
  await done(H);})();
