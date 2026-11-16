// smooth19.js: the battle screen's stage fit reads its hidden copies in one layout (owner: "Lot of frame drops on the battle screen").
//  1 the same layout: at six screen sizes (the tall phone layout never asks; there smooth19 must make no batch) (wide, Full HD, the 1000x560 test size, a short landscape phone, a tall phone, a tablet) and in four
//    battle states (a hero's top menu, auto running, a boss with its bar, six heroes) render() gives the same stage scale, the same classes,
//    the same column widths and bottom room, and b8HAt keeps the same heights (B._b8h) with smooth19 on as with it off (S19.off)
//  2 every question b3WideSc asks is answered from a batch (no miss) in those states (a second fit in the same task with the same panels
//    reuses the first batch; one whose panels changed makes a new one)
//  3 render() on the wide battle screen is faster than the old path (median of 9 renders, each in its own task, with six heroes at 1366x768): the old path laid out every
//    copy on its own (19 layouts); the bound is the old path's own time on this machine at the same moment, so it does not depend on load
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v198a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v198a ran over 300 s');process.exit(1);},300000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
const SIZES=[{w:1366,h:768},{w:1920,h:1080},{w:1000,h:560},{w:844,h:390,mobile:true},{w:390,h:844,mobile:true},{w:1180,h:820}];
const begin=(ev,six)=>ev(six=>{const A=__A;A.ACT.new();const ids=six?['mira','lumen','oren','kael','sera','bram']:['mira','lumen','oren'];ids.forEach(id=>{try{A.ACT.pickS(id);}catch(e){}});A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();},six);
// the layout render() settles on, measured from a clean slate (the heights only grow within a battle, so both paths start from none)
// st: the battle state set again before each snapshot (the game's own timers may have moved it since the last one)
const SNAP=`(off,st)=>{const A=__A,T=A.TW.get,S=T('S19'),B=A.B;B.front.forEach(c=>{if(c.hp<=0)c.hp=1;});B.en.forEach(e=>{if(e.hp<=0)e.hp=1;});S.off=!!off;A.V.modal=null;B.auto=!!st.auto;A.V.auto=!!st.auto;B.over=false;B.swapAsk=null;B.pend=null;B.mode=st.auto?'wait':'cmd';B.cur=B.front.find(c=>c.hp>0);B.menu='root';B._b8h={};B._b8ce={};B._b8fit=0;B._b8vh=0;A.BL.fitH=0;const bat=document.querySelector('.battle.b3');if(bat)bat.classList.remove('b8tight');
  A.render();A.render();const b=document.querySelector('.battle.b3');const cs=b?getComputedStyle(b):null;
  const o={sc:A.BL.sc,mode:A.BL.mode,cls:b?b.className:'',w3:b?b.style.getPropertyValue('--b3w'):'',bot:b?b.style.getPropertyValue('--b3bot'):'',cols:cs?cs.gridTemplateColumns:'',h:JSON.stringify(Object.keys(B._b8h||{}).sort().map(k=>k+'='+B._b8h[k]))};S.off=false;return o;}`;
async function states(H,tag){const {ev,wait}=H,out=[];
  // each path renders once before the compared snapshot, so both start from the classes their own layout leaves (not the other path's)
  const snap=async(name,st={})=>{const S=JSON.stringify(st);await ev(`(${SNAP})(true,${S})`);const a=await ev(`(${SNAP})(true,${S})`);await ev(`(${SNAP})(false,${S})`);
    const n0=await ev(()=>Object.assign({},__A.TW.get('S19').n)),b=await ev(`(${SNAP})(false,${S})`),n1=await ev(()=>__A.TW.get('S19').n);
    const same=['sc','mode','cls','w3','bot','cols','h'].filter(k=>a[k]!==b[k]);
    if(a.mode!=='wide'){chk(`${tag} ${name}: ${a.mode} stage, smooth19 not involved (the stage fit with hidden copies is the wide layout's; ${n1.batch-n0.batch} batches)`,n1.batch===n0.batch);return;}
    chk(`${tag} ${name}: ${a.mode} stage x${a.sc}, the same layout with smooth19 on and off${same.length?' (differs: '+same.map(k=>k+' '+a[k]+' / '+b[k]).join('; ')+')':''}`,same.length===0);
    if(a.mode==='wide')chk(`${tag} ${name}: every b8HAt question answered from the batch (${n1.hit-n0.hit} answers, ${n1.miss-n0.miss} misses, ${n1.batch-n0.batch} batches and ${n1.reuse-n0.reuse} reused for 2 renders)`,n1.miss===n0.miss&&n1.batch-n0.batch>=1&&n1.hit>n0.hit);};
  // a hero's top level menu
  await ev(()=>{__A.startBattle({stage:1,kind:'field',seed:7});});await wait(1600);
  await ev(()=>{const A=__A;A.V.modal=null;A.B.mode='cmd';A.B.cur=A.B.front.find(c=>c.hp>0);A.B.menu='root';});await snap('hero menu');
  // auto running (the command panel shows the auto row)
  await ev(()=>{const A=__A;A.B.auto=true;A.V.auto=true;A.B.mode='wait';});await snap('auto',{auto:true});
  await ev(()=>{const A=__A;A.B.auto=false;A.V.auto=false;A.B.over=true;A.V.screen='world';A.B=null;A.render();});
  // a boss (the boss bar row)
  await ev(()=>{__A.startBattle({stage:2,kind:'boss'});});await wait(1600);
  await ev(()=>{const A=__A;A.V.modal=null;A.B.mode='cmd';A.B.cur=A.B.front.find(c=>c.hp>0);A.B.menu='root';});await snap('boss');
  await ev(()=>{const A=__A;A.B.over=true;A.V.screen='world';A.B=null;A.render();});
  return out;}
(async()=>{
  for(const s of SIZES){const H=await open(Object.assign({pre:META,tag:'s'+s.w},s));await begin(H.ev,false);await H.wait(800);await states(H,`${s.w}x${s.h}`);await H.browser.close();}
  // six heroes, then the timing
  const H=await open({w:1366,h:768,pre:META,tag:'t'});const {ev,wait}=H;await begin(ev,true);await wait(800);
  await ev(()=>{__A.startBattle({stage:1,kind:'boss'});});await wait(1800);
  await ev(()=>{const A=__A;A.V.modal=null;A.B.mode='cmd';A.B.cur=A.B.front.find(c=>c.hp>0);A.B.menu='root';});
  await ev(`(${SNAP})(true,{})`);const six=await ev(`(${SNAP})(true,{})`);await ev(`(${SNAP})(false,{})`);const six2=await ev(`(${SNAP})(false,{})`);
  chk(`six heroes at 1366x768: the same layout on and off (x${six.sc} ${six.cls})`,JSON.stringify(six)===JSON.stringify(six2));
  await ev(()=>{window.requestAnimationFrame=()=>0;});await wait(200);
  // each render in its own task, as the game's turns are (both paths keep their same-task memos, which a loop in one task would hit every time)
  const time=async off=>{const t=[];for(let i=0;i<9;i++){t.push(await ev(off=>{const A=__A,S=A.TW.get('S19');S.off=off;const a=performance.now();A.render();const d=performance.now()-a;S.off=false;return d;},off));}t.sort((a,b)=>a-b);return t[4];};
  let old=0,neu=0;for(let r=0;r<3;r++){old+=await time(true);neu+=await time(false);}old/=3;neu/=3;
  chk(`render() on the wide battle screen, six heroes: ${neu.toFixed(1)} ms with smooth19, ${old.toFixed(1)} ms on the old path (at most 75% of it)`,neu<=old*.75);
  await done(H);})();
