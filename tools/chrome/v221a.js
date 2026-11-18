// v0.22.38 (fix38.js): a hero's own relic comes first in upgrade suggestions.
// The reported loop: a shop piece whose +3 end outranks the relic was suggested, then the relic, then the shop piece's chain again.
//  1 with the relic in the pack and richer shop gear on offer (fifth realm, plenty of gold), the best upgrade for the relic's slot is the relic
//  2 once the relic is worn nothing is suggested for that slot, and Upgrade whole party does not replace it
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v221a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v221a ran over 200 s');process.exit(1);},200000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:META,tag:'v221a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(300);
  const r=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,out=[];G.stage=4;G.cleared=[1,1,1,1,0];G.pcV=1;G.gold=999999;Object.keys(g('MATS')).forEach(k=>{G.mats[k]=99;});
    Object.values(G.roster).forEach(c=>{c.lv=45;c.S=g('calcStats')(c);});
    for(const h of ['mira','oren','lumen']){const c=G.roster[h],rid=window.__R25.gid(h),sl=g('gearOf')(rid).slot,o={h,sl,rid};
      const before=g('upgOpts')(c,sl).length;G.gear.push(rid);const B=g('upgBest')(c,sl);o.before=before;o.best=B.best&&B.best.id;o.n=B.all.length;
      // wear it
      const i=G.gear.indexOf(rid);G.gear.splice(i,1);if(c.eq[sl])G.gear.push(c.eq[sl]);c.eq[sl]=rid;c.S=g('calcStats')(c);
      o.after=g('upgOpts')(c,sl).length;const P=g('p3SmithPlan')();o.plan=((P&&(P.steps||P.rows||P.list))||[]).filter(s=>s&&(s.cid===h||s.c===h)&&(s.sl===sl||s.slot===sl)).length;o.worn=c.eq[sl];out.push(o);}
    return out;});
  chk(`1 the relic is the best upgrade for its slot: ${r.map(o=>o.h+' '+o.sl+' '+(o.best===o.rid?'relic':o.best)+' of '+o.n).join(', ')}`,r.every(o=>o.best===o.rid&&o.n>1)||JSON.stringify(r));
  chk(`2 with the relic worn nothing is suggested for that slot (${r.map(o=>o.after).join(', ')}), and the party plan leaves it (${r.map(o=>o.plan).join(', ')})`,r.every(o=>o.after===0&&o.plan===0&&o.worn===o.rid&&o.before>0)||JSON.stringify(r));
  await done(H);})();
