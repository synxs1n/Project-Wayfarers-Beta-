// Beta v0.5.0 Phase 6: screenshots at phone sizes (portrait and landscape) for every tier: title, town by day and night, a field in rain,
// a dungeon, a battle with an element hit and the camera push, and a menu over the world. Saved under tools/chrome/shots-v050p6/ (not committed).
// Also fails on any page error. Usage: PWHTML=../../out/aurelis3.html node v050p6shots.js [tier ...]
const {open,chk,done}=require('./pw');const fs=require('fs');const OUT=__dirname+'/shots-v050p6';fs.mkdirSync(OUT,{recursive:true});
const tiers=process.argv.slice(2).length?process.argv.slice(2):['low','medium','high'];
(async()=>{let H;for(const [n,w,h] of [['port',390,844],['land',844,390]])for(const tier of tiers){
  H=await open({w,h,mobile:true,dpr:2,pre:`(()=>{let s=${+(process.env.SEED||2)};Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${tier}',rmotion:false}}));`});
  const {ev,wait,page}=H;const shot=async k=>{await wait(350);await page.screenshot({path:`${OUT}/${n}_${tier}_${k}.png`});};
  await wait(400);await shot('title');
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.clock=100;A.render();});
  await shot('town_day');
  await ev(()=>{const A=__A;A.G.clock=700;A.render();});await shot('town_night');
  await ev(()=>{const A=__A;A.G.clock=540;A.render();});await shot('town_dusk');
  await ev(()=>{const A=__A,G=A.G;G.clock=100;G.weather[0]='rain';const m=A.getMap('f0');let best=null;for(let y=2;y<m.h-2&&!best;y++)for(let x=Math.floor(m.w/2);x<m.w-2;x++){if(A.tileAt(m,x,y)===','&&!A.solidAt(m,x,y)){best=[x,y];break;}}
    if(!best)best=m.gates?Object.values(m.gates)[0].arrive:[5,5];A.placeAt('f0',best[0],best[1],'d');A.render();});
  await shot('field_rain');
  await ev(()=>{const A=__A,G=A.G;G.weather[0]='clear';A.render();});await shot('field_clear');
  await ev(()=>{const A=__A;A.enterDungeon(0);A.render();});await shot('dungeon');
  await ev(()=>{const A=__A;A.V.modal={type:'settings'};A.render();});await shot('menu');
  await ev(()=>{const A=__A;A.V.modal=null;A.render();A.startBattle({stage:0,kind:'field',weather:'clear'});});
  await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
  await shot('battle');
  await ev(()=>{const A=__A,B=A.B,e=B.en[0];if(!A.onFx)return;e.fxEl='fire';A.onFx(e,'123','dmg crit');const e2=B.en[1]||e;e2.fxEl='ice';A.onFx(e2,'40','dmg');});
  await wait(205);await page.screenshot({path:`${OUT}/${n}_${tier}_battle_hit.png`});
  await H.browser.close();}
  chk('screenshots written',fs.readdirSync(OUT).filter(f=>f.endsWith('.png')).length>=tiers.length*2*10);
  process.exit(0);})();
