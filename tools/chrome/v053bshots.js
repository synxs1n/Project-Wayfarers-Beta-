// v0.5.3 battle stage (HD-2D): screenshots of the battle at phone sizes, portrait and landscape: several backdrops at different times of
// day, a boss stage, a dungeon hall, a cave, the arena, spells mid cast (fire, ice, lightning, water, earth, wind, light, shadow) and a
// Limit Break. Saved under tools/chrome/shots-v053b/ (not committed). Fails on any page error.
// Usage: PWHTML=../../out/aurelis3.html node v053bshots.js [tier ...]   (SHOTS=port,land to pick sizes; ONLY=key1,key2 to pick scenes)
const {open,chk}=require('./pw');const fs=require('fs');const OUT=process.env.OUT||__dirname+'/shots-v053b';fs.mkdirSync(OUT,{recursive:true});
const tiers=process.argv.slice(2).length?process.argv.slice(2):['medium'];
const SIZES=[['port',390,844],['land',844,390]].filter(s=>!process.env.SHOTS||process.env.SHOTS.split(',').includes(s[0]));
// [name, backdrop spec, clock, weather, kind]
const SCENES=[
  ['meadow_day',{th:'meadow',k:'field',g:'grass'},100,'clear','field'],
  ['meadow_road_dusk',{th:'meadow',k:'field',g:'road'},540,'clear','field'],
  ['forest_night',{th:'meadow',k:'field',g:'forest'},700,'clear','field'],
  ['coast_sand',{th:'coast',k:'field',g:'sand'},200,'clear','field'],
  ['snow_dawn',{th:'snow',k:'field',g:'snow'},850,'snow','field'],
  ['heights_rain',{th:'heights',k:'field',g:'high'},300,'rain','field'],
  ['void_field',{th:'void',k:'field',g:'void'},300,'clear','field'],
  ['cave_cave',{th:'cave',k:'cave'},300,'clear','field'],
  ['dungeon_meadow',{th:'meadow',k:'dungeon'},300,'clear','field'],
  ['boss_a',null,300,'clear','boss',2],
  ['boss_b',null,300,'clear','boss',4],
  ['arena',null,300,'clear','arena',2],
];
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null;
(async()=>{let n=0;for(const [sz,w,h] of SIZES)for(const tier of tiers){
  const H=await open({w,h,mobile:true,dpr:2,pre:`(()=>{let s=${+(process.env.SEED||2)};Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${tier}',rmotion:false,hints:false}}));`});
  const {ev,wait,page}=H;const shot=async k=>{await page.screenshot({path:`${OUT}/${sz}_${tier}_${k}.png`});n++;};
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
  await wait(300);
  const start=async(sc)=>{const [name,bg,clock,wx,kind,stage]=sc;
    await ev(([bg,clock,wx,kind,stage])=>{const A=__A;A.V.modal=null;A.G.clock=clock;Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;});
      const sp={stage:stage||0,kind,weather:wx};if(kind==='arena'){sp.tier=0;sp.waves=1;sp.lvs=[5,6];}if(bg)sp.bg=bg;if(kind==='field'){sp.foes=['gull','mossling','frostwolf'].map(id=>A.makeEnemy(A.MON[id],5));}
      try{A.startBattle(sp);const B=A.B;if(B)B.en.concat(B.front,B.back).forEach(u=>{u.S.mhp=u.hp=99999;});}catch(e){return String(e.stack).slice(0,300);}},[bg,clock,wx,kind,stage]).then(r=>{if(r)console.log('start '+name+': '+r);});
    await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
    await ev(()=>{const B=__A.B;if(B)B.en.concat(B.front).forEach(u=>{u.S.mhp=u.hp=Math.max(u.hp,99999);});});await wait(400);};
  const end=()=>ev(()=>{try{__A.finishBattle('x');}catch(e){}__A.V.modal=null;});
  for(const sc of SCENES){if(ONLY&&!ONLY.includes(sc[0]))continue;await start(sc);await shot(sc[0]);await end();}
  // spells mid cast: the first hero casts at the first foe
  const els=['fire','ice','lightning','water','earth','wind','light','shadow'];
  if(!ONLY||ONLY.includes('spells')){await start(['spell',{th:'meadow',k:'field',g:'grass'},300,'clear','field']);
  for(const el of els){
    await ev(el=>{const A=__A,B=A.B,a=B.front[0],e=B.en[0],T=Date.now();B.en.forEach(x=>{x.S.mhp=x.hp=99999;});
      a.actT=T;a.actKind='mag';a.actEl=el;e.fxT=T;e.fxEl=el;e.hitT=T;setTimeout(()=>{try{A.onFx(e,'1234','dmg weak');}catch(x){}},20);},el);
    await wait(+(process.env.CASTMS||330));await shot('spell_'+el);await wait(1300);}
  // a Limit Break push
  await ev(()=>{const A=__A,B=A.B,a=B.front[0],e=B.en[0],T=Date.now();a.actT=T;a.actKind='mag';a.actEl='light';a.actLimit=T;B.lim2T={t:T,el:'light'};e.fxT=T;e.fxEl='light';setTimeout(()=>{try{A.onFx(e,'9999','dmg crit');}catch(x){}},20);});
  await wait(420);await shot('limit');await end();}
  await H.browser.close();}
  chk('screenshots written ('+n+')',n>0);process.exit(0);})();
