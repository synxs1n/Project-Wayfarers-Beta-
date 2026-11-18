// v0.22.38 (fix38.js): a hero's own relic comes first in upgrade suggestions.
// The reported loop (a regular piece suggested, then the relic right after) was NOT reproduced: on 0.22.37 this test already passes for all
// 94 wayfarers at the fifth realm, and a scan of every realm found no hero whose relic was not first. fix38.js is a guard for the one way the
// ranking could do it (a shop piece's +3 end outranking a relic); this test keeps the rule.
//  1 for every wayfarer (level 45, fifth realm, plenty of gold and materials) with their relic in the pack, the best upgrade for the
//    relic's slot is the relic
//  2 once the relic is worn nothing is suggested for that slot
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v221a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v221a ran over 200 s');process.exit(1);},200000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:META,tag:'v221a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(300);
  const r=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,out=[];G.stage=4;G.cleared=[1,1,1,1,0];G.pcV=1;G.gold=999999;Object.keys(g('MATS')).forEach(k=>{G.mats[k]=99;});
    // every wayfarer in turn: in the six at level 45, their relic in the pack
    for(const h of window.__R25.heroes()){if(!G.roster[h])G.roster[h]=g('newChar')(h,45,4);const c=G.roster[h];c.lv=45;G.party=[h];c.S=g('calcStats')(c);
      const rid=window.__R25.gid(h),sl=g('gearOf')(rid).slot,o={h,sl,rid};G.gear=[rid];const B=g('upgBest')(c,sl);o.best=B.best&&B.best.id;o.n=B.all.length;
      G.gear=[];if(c.eq[sl])G.gear.push(c.eq[sl]);c.eq[sl]=rid;c.S=g('calcStats')(c);o.after=g('upgOpts')(c,sl).length;out.push(o);}
    return out;});
  const notFirst=r.filter(o=>o.best!==o.rid),still=r.filter(o=>o.after>0);
  chk(`1 for all ${r.length} wayfarers their own relic is the best upgrade for its slot (${notFirst.length} where something else came first)`,(r.length>=90&&!notFirst.length)||JSON.stringify(notFirst.slice(0,8).map(o=>o.h+' '+o.sl+' '+o.best)));
  chk(`2 with the relic worn nothing is suggested for that slot (${still.length} heroes still got a suggestion)`,!still.length||JSON.stringify(still.slice(0,8).map(o=>o.h+' '+o.sl+' '+o.after)));
  await done(H);})();
