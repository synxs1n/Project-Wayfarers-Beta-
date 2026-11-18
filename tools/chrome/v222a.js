// v0.22.39 (auto39.js): auto battle uses the right item, and can be told to use none.
//  1 a fallen vanguard hero: Smelling Salts while there are any, a Phoenix Feather only without them
//  2 a hero at 15% HP: a Healing Draught covers a small wound, a Greater Draught a large one; the Elixir stays in the pack outside a boss fight
//  3 a hero with no MP for any skill in a hard fight drinks a Mana Tonic (auto never used one before)
//  4 a Curse gets Sacred Ash, a Wound a Bandage Roll, two ailments a Remedy
//  5 a real auto turn spends the item; with Use items off nothing is picked, the old potion and feather uses are off too, and the Auto
//    settings screen has the switch
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v222a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v222a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:META,tag:'v222a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['brann','sable','tess'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;Object.values(A.G.roster).forEach(c=>{c.lv=25;c.S=A.TW.get('calcStats')(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});/* level 25: every kit has skills that cost MP */A.TW.get('startBattle')({stage:0,kind:'wild'});A.render();});
  for(let i=0;i<40;i++){await wait(400);if(await ev(()=>{const B=__A.B;return !!(B&&B.cur&&B.cur.side==='p'&&B.mode==='cmd');}))break;}
  const r=await ev(()=>{const A=__A,g=A.TW.get,B=A.B,G=A.G,P=window.__A39.pick,o={};g('battlePaused=function(){return true;}');
    const reset=()=>{B.front.forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;c.st={};});B.back.forEach(c=>{c.hp=c.S.mhp;c.st={};});B.en.forEach(e=>{e.hp=e.S.mhp;});G.inv={};B.boss=null;},a=B.cur,other=B.front.find(c=>c!==a),id=p=>p&&p[0];
    while(B.en.length<2)B.en.push(Object.assign(Object.create(Object.getPrototypeOf(B.en[0])),JSON.parse(JSON.stringify(B.en[0]))));// a hard fight: two foes
    reset();other.hp=0;G.inv={salts:1,plume:1};o.rev1=id(P());G.inv={plume:1};o.rev2=id(P());G.inv={};o.rev3=id(P());
    reset();a.S.mhp=400;a.hp=60;G.inv={potion:2,hipotion:2,elixir:1};o.big=id(P());a.S.mhp=100;a.hp=15;o.small=id(P());G.inv={elixir:1};a.hp=28;o.elx=id(P());
    reset();a.mp=0;G.inv={ether:2,sage:1,potion:1};o.mana=id(P());o.manaT=(P()||[])[1]===a;a.mp=a.S.mmp;o.manaFull=id(P());
    reset();other.st={curse:1};G.inv={ash:1,remedy:1,bandage:1};o.curse=id(P());other.st={wound:1};o.wound=id(P());other.st={poison:1,slow:1};o.ail=id(P());other.st={slow:1};o.one=id(P());
    // off
    reset();other.hp=0;G.inv={salts:1,plume:1,potion:1};G.auto=Object.assign({},G.auto||{},{items:false});o.off=id(P());const C=g('autoCfg')();o.offCfg=[C.potion,C.reviveItem];G.auto.items=true;
    return o;});
  chk(`1 a fallen hero: ${r.rev1}, then ${r.rev2} without Salts, then ${r.rev3||'nothing'}`,(r.rev1==='salts'&&r.rev2==='plume'&&!r.rev3)||JSON.stringify(r));
  chk(`2 a large wound: ${r.big}; a small one: ${r.small}; only an Elixir in the pack, no boss, 28% HP: ${r.elx||'kept'}`,(r.big==='hipotion'&&r.small==='potion'&&!r.elx)||JSON.stringify(r));
  chk(`3 out of MP in a hard fight: ${r.mana} on itself; with a full bar: ${r.manaFull||'nothing'}`,((r.mana==='ether'||r.mana==='sage')&&r.manaT&&!r.manaFull)||JSON.stringify(r));
  chk(`4 Curse: ${r.curse}; Wound: ${r.wound}; two ailments: ${r.ail}; one mild ailment: ${r.one||'nothing'}`,(r.curse==='ash'&&r.wound==='bandage'&&r.ail==='remedy'&&!r.one)||JSON.stringify(r));
  const s=await ev(()=>{const A=__A,g=A.TW.get,B=A.B,G=A.G,a=B.cur,o={};B.front.forEach(c=>{c.hp=c.S.mhp;c.st={};});a.mp=0;G.inv={ether:2};g('autoReason=function(){return null;}');/* a new journey's first fights lock auto */B.auto=true;const mp0=a.mp;o.locked=g('autoLocked')();g('autoTurn')();o.used=G.inv.ether===1;o.mp=a.mp>mp0;B.auto=false;
    A.V.modal={type:'autoset'};A.render();const m=document.querySelector('#modal');o.row=/Use items/.test(m.innerText);o.btn=m.querySelectorAll('[data-act="autoCfg"][data-arg*="items"]').length;o.txt=!/never uses items/.test(m.innerText);return o;});
  chk(`5 a real auto turn drank the tonic; off: ${r.off||'nothing'} (potion and feather ${r.offCfg}); the settings screen has Use items (${s.btn} buttons)`,(s.used&&s.mp&&!r.off&&r.offCfg[0]===false&&r.offCfg[1]===false&&s.row&&s.btn===2&&s.txt)||JSON.stringify([r.off,r.offCfg,s]));
  await done(H);})();
