// v0.22.32: five small asks.
//  1 a Pork Chop Sandwich eaten in a dungeon ends on the field outside its door (not inside the dungeon)
//  2 the Riftkeeper is not "beaten" on a journey that has not beaten him, even when the account has (META.riftkeeper); G.rkWon makes it so
//  3 Legendary relics are gold yellow (#ffd23d); Heroic gear has a colour of its own
//  4 in the battle skill list nothing but element icons stands before a skill's name (no delivery icon)
//  5 the Smithy shows no "at max temper" line
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v216a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v216a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:META,tag:'v216a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.gold=4000;A.render();});await wait(700);
  const a0=await ev(()=>{const A=__A,g=A.TW.get,G=A.G;g('enterDungeon')(0);G.inv.porkchop=2;const m=g('WS').m;A.V.modal=null;const ok=g('useTravel')('porkchop');return {in:m.id,kind:m.kind,ok};});await wait(1800);
  const a=await ev(()=>{const g=__A.TW.get,WS=g('WS'),f=g('getMap')('f0'),o=f.entOut||[f.ent[0],f.ent[1]+1];return {id:WS.m.id,at:[WS.x,WS.y],out:o,left:__A.G.inv.porkchop};});
  chk(`1 the sandwich: from ${a0.in} to ${a.id} at ${a.at} (the door's outside tile ${a.out})`,(a0.kind==='dungeon'&&a0.ok&&a.id==='f0'&&a.at[0]===a.out[0]&&a.at[1]===a.out[1]&&a.left===1)||JSON.stringify([a0,a]));
  const b=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,M=g('META'),o={};M.riftkeeper=1;o.j0=g('rkJ')();o.rec0=String(g('vJourney')?g('vJourney')():'');const box=g('mRiftkeeper')();o.box0=/no fleeing · beaten/.test(box);
    G.rkWon=1;o.j1=g('rkJ')();o.box1=/beaten on this journey/.test(g('mRiftkeeper')());delete G.rkWon;delete M.riftkeeper;o.rec=/Secret boss/.test(o.rec0)&&!/The Riftkeeper<\/b>/.test(o.rec0);delete o.rec0;return o;});
  chk(`2 the Riftkeeper on a new journey of an account that beat him: not beaten (then beaten once G.rkWon is set)`,(b.j0===false&&!b.box0&&b.j1===true&&b.box1)||JSON.stringify(b));
  const c=await ev(()=>{const T=__A.TW.get('ITEM_TIERS');return {h:T[4].c,l:T[7]&&T[7].c,n:T[7]&&T[7].n,all:T.map(t=>t.c)};});
  chk(`3 Legendary ${c.l}, Heroic ${c.h}, no two rarities one colour`,(c.n==='Legendary'&&c.l==='#ffd23d'&&c.h!==c.l&&new Set(c.all).size===c.all.length)||JSON.stringify(c));
  await ev(()=>{const A=__A;A.TW.get('startBattle')({stage:0,kind:'wild'});A.render();});
  for(let i=0;i<40;i++){await wait(400);if(await ev(()=>{const B=__A.B;return !!(B&&B.cur&&B.cur.side==='p'&&B.mode==='cmd'&&document.querySelector('#bcmd [data-arg="skills"]'));}))break;}
  await ev(()=>document.querySelector('#bcmd [data-arg="skills"]').click());await wait(500);
  const d=await ev(()=>{const L=[...document.querySelectorAll('#bcmd .menu.list .mi .n')];return {n:L.length,dl:L.filter(e=>{const f=e.firstElementChild;return f&&f.classList.contains('dli');}).length,any:L.filter(e=>e.querySelector(':scope>.dli')).length};});
  chk(`4 ${d.n} skills listed, none with a delivery icon before its name`,(d.n>=2&&d.dl===0&&d.any===0)||JSON.stringify(d));
  await ev(()=>{const A=__A;A.B.over=true;A.V.screen='world';A.V.modal={type:'smithy',tab:'shop'};A.render();});await wait(600);
  const e=await ev(()=>{const L=[...document.querySelectorAll('#modal .mxt')];return {n:L.length,vis:L.filter(x=>x.getBoundingClientRect().height>0).length,txt:/at max temper/i.test(document.querySelector('#modal .panel').innerText)};});
  chk(`5 the Smithy shows no max temper line (${e.vis} of ${e.n} in the page are visible)`,(e.vis===0&&!e.txt)||JSON.stringify(e));
  await done(H);})();
