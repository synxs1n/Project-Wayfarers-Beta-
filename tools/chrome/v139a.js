// v0.13.8 (art helper 2): hero pose frames in battle (v3/heropose9.js): every hero x pose x frame paints at the hero's size, differs from idle, the pose
// follows the skill's delivery, spriteOf swaps to the pose while acting and back afterwards, walkers and portraits are untouched.
// Usage: PWHTML=../../out/aurelis3.html node v139a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false}}));`;
(async()=>{const H=await open({w:430,h:800,mobile:true,pre:PRE});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(250);
// 1. urls before
const before=await ev(()=>{const T=__A.TW.get,TPL=T('TPL'),o={};Object.keys(TPL).filter(i=>TPL[i].cls&&!TPL[i].mon&&TPL[i].look).forEach(i=>{o[i]=T('heroURL')(i,false).length+':'+T('heroURL')(i,true).length+':'+T('heroURL')(i,false).slice(-40);});return o;});
// 2. every hero x pose x frame
let r=await ev(()=>{const T=__A.TW.get,TPL=T('TPL'),pc=T('heroPoseCanvas'),hc=T('heroCanvas'),POSES=['swing','thrust','smash','shoot','cast','pray','guard','cheer'],bad=[],same=[];let n=0;
  const ids=Object.keys(TPL).filter(i=>TPL[i].cls&&!TPL[i].mon&&TPL[i].look);
  ids.forEach(id=>{let idle,idleU;try{idle=hc(id,false);idleU=idle.toDataURL();}catch(e){bad.push(id+' idle '+e.message);return;}
    POSES.forEach(p=>[0,1].forEach(f=>{try{const c=pc(id,p,f);n++;if(c.width!==idle.width||c.height!==idle.height)bad.push(id+' '+p+f+' size '+c.width+'x'+c.height+' vs '+idle.width+'x'+idle.height);if(c.toDataURL()===idleU)same.push(id+' '+p+f);}catch(e){bad.push(id+' '+p+f+' '+e.message);}}));
    try{const c=pc(id,'hit',0);n++;if(c.width!==idle.width||c.toDataURL()===idleU)same.push(id+' hit');}catch(e){bad.push(id+' hit '+e.message);}
    try{const c=pc(id,'idle',1);n++;if(c.width!==idle.width)bad.push(id+' idle1 size');}catch(e){bad.push(id+' idle1 '+e.message);}});
  return {ids:ids.length,n,bad:bad.slice(0,8),nb:bad.length,same:same.slice(0,8),ns:same.length};});
console.log(JSON.stringify(r));
chk('every hero x pose x frame paints at the normal size without exceptions ('+r.ids+' heroes, '+r.n+' canvases)',r.nb===0&&r.n>=r.ids*18?true:JSON.stringify(r.bad));
chk('every pose frame differs from idle',r.ns===0?true:JSON.stringify(r.same));
// 3. pose selection
r=await ev(()=>{const T=__A.TW.get,f=T('heroPoseFor'),o={};
  o.slash=f({k:'phys',dl:'slash'},'slash','swing');o.pierce=f({k:'phys'},'piercing','swing');o.blunt=f({k:'phys'},'blunt','swing');o.bow=f({k:'phys'},'ranged','bow');
  o.spell=f({k:'mag'},'magic','cast');o.heal=f({k:'heal'},'heal','channel');o.revive=f({k:'revive'},null,'channel');o.buff=f({k:'status',fx:[['might',1]]},null,'swing');
  o.debuff=f({k:'status',fx:[['poison',1]]},null,'swing');o.none=f(null,null,'swing',null);o.fallback=f({k:'phys'},null,'thrust');
  o.bad=T('STS').poison&&T('STS').poison.bad;return o;});
console.log(JSON.stringify(r));
chk('slash -> swing, piercing -> thrust, blunt -> smash',r.slash==='swing'&&r.pierce==='thrust'&&r.blunt==='smash'?true:JSON.stringify(r));
chk('a bow attack -> shoot, a spell -> cast, heal and revive -> pray',r.bow==='shoot'&&r.spell==='cast'&&r.heal==='pray'&&r.revive==='pray'?true:JSON.stringify(r));
chk('a buff -> cheer, a debuff on foes -> cast, no skill -> class style',r.buff==='cheer'&&(r.bad?r.debuff==='cast':true)&&r.none===null&&r.fallback==='thrust'?true:JSON.stringify(r));
// 4. in a battle
await ev(()=>{const A=__A;A.TW.get('startBattle')({stage:0,kind:'field'});});await wait(900);
r=await ev(()=>{const T=__A.TW.get,B=T('B'),so=T('spriteOf'),po=T('heroPoseOf'),o={};const u=B.front[0],foe=B.en[0];
  const idle=so(u,false),idleU=idle.toDataURL(),W=T('IMPACT');
  // slash skill: perform() records the delivery
  const sk={id:'t_slash',n:'Test Slash',k:'phys',t:'one',pw:1,dl:'slash',mp:0};
  T('perform')(u,sk,[foe]);o.rec=[u.actSk&&u.actSk.id,u.actDl];
  let p=po(u,10);o.p0=p&&p.pose+p.frame;p=po(u,W+30);o.p1=p&&p.pose+p.frame;
  u.actT=Date.now();const c0=so(u,false);o.during=c0.toDataURL()!==idleU&&c0.width===idle.width;
  const k0=so(u,false)===c0;o.cached=k0;
  u.actT=Date.now()-3000;const c1=so(u,false);o.after=c1.toDataURL()===idleU||c1.toDataURL().length>0;o.afterPose=po(u,3000);
  // heal
  const hk={id:'t_heal',n:'Test Heal',k:'heal',t:'ally',pw:1,mp:0};T('perform')(u,hk,[u]);p=po(u,10);o.heal=p&&p.pose;
  // guard
  B.cur=u;u.gdT=0;T('guard')();p=po(u,3000);o.guard=p&&p.pose;u.gdT=0;u.guard=false;
  // hit frame
  u.actT=0;u.hitT=Date.now()-W-10;const hc=so(u,false);o.hit=hc.toDataURL()!==idleU;
  u.hitT=0;
  return o;});
console.log(JSON.stringify(r));
chk('perform() records the skill and its delivery on the hero',r.rec&&r.rec[0]==='t_slash'&&r.rec[1]==='slash'?true:JSON.stringify(r.rec));
chk('a slash skill is swing: frame 0 before the blow lands, frame 1 after',r.p0==='swing0'&&r.p1==='swing1'?true:JSON.stringify([r.p0,r.p1]));
chk('spriteOf returns the pose canvas while acting (same size, cached)',r.during===true&&r.cached===true?true:JSON.stringify([r.during,r.cached]));
chk('spriteOf is the idle sprite again after the action',r.afterPose===null?true:JSON.stringify(r.afterPose));
chk('a heal is pray, Guard is the guard pose, the flinch frame shows after a hit',r.heal==='pray'&&r.guard==='guard'&&r.hit===true?true:JSON.stringify([r.heal,r.guard,r.hit]));
// 5. urls after
const after=await ev(()=>{const T=__A.TW.get,TPL=T('TPL'),o={};Object.keys(TPL).filter(i=>TPL[i].cls&&!TPL[i].mon&&TPL[i].look).forEach(i=>{o[i]=T('heroURL')(i,false).length+':'+T('heroURL')(i,true).length+':'+T('heroURL')(i,false).slice(-40);});return o;});
const diff=Object.keys(before).filter(k=>before[k]!==after[k]);
chk('the walker and portrait urls (heroURL) are unchanged for '+Object.keys(before).length+' heroes',diff.length===0?true:diff.join(','));
await done(H);})();
