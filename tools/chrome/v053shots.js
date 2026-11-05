// Beta v0.5.3 HD-2D world: screenshots of the world maps at phone portrait (390x844 @2x) and landscape (844x390 @2x).
// Writes PNGs to tools/chrome/shots-v053/ (not committed). Usage: PWHTML=../../out/aurelis3.html node v053shots.js [tier] [only]
const {open,chk,done}=require('./pw');const fs=require('fs');const path=require('path');
const OUT=path.join(__dirname,'shots-v053');fs.mkdirSync(OUT,{recursive:true});
const TIER=process.argv[2]||'high',ONLY=process.argv[3]||'';
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false}}));(()=>{let s=7;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const SCENES={
  town_day:A=>{A.G.clock=120;A.G.weather[0]='clear';A.render();},
  town_night:A=>{A.G.clock=700;A.render();},
  town_dusk:A=>{A.G.clock=540;A.render();},
  field_rain:A=>{const G=A.G;G.clock=200;G.weather[0]='rain';const m=A.getMap('f0');const a=Object.values(m.gates)[0].arrive;let best=null;
    for(let y=2;y<m.h-2&&!best;y++)for(let x=Math.floor(m.w/3);x<m.w-2;x++){if(A.tileAt(m,x,y)===','&&!A.solidAt(m,x,y)){best=[x,y];break;}}
    if(!best)best=a;A.placeAt('f0',best[0],best[1],'d');A.render();},
  field_day:A=>{const G=A.G;G.clock=150;G.weather[0]='clear';const m=A.getMap('f0');const a=Object.values(m.gates)[0].arrive;A.placeAt('f0',a[0],a[1],'r');A.render();},
  dungeon:A=>{A.enterDungeon(0);A.render();},
  cave:A=>{const f=A.getMap('f0');const cv=(f.caves||[]).find(c=>c.kind!=='fort');if(cv){A.placeAt('f0',cv.out[0],cv.out[1],'d');A.enterCave(cv,0);}else A.enterDungeon(1);A.render();}};
(async()=>{
  for(const [w,h,tag] of [[390,844,'port'],[844,390,'land']]){
    const H=await open({w,h,mobile:true,dpr:2,pre:META(TIER)});const {ev,wait,page}=H;const errs=[];page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
    await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(600);
    for(const [name,fn] of Object.entries(SCENES)){if(ONLY&&!name.includes(ONLY))continue;
      await ev(`(${fn.toString()})(__A)`);await ev(()=>{__A.TR.ph=null;__A.TR.wx.key=null;});await wait(900);
      const st=await ev(()=>({live:__A.HD.live,why:__A.HD.why,bake:Math.round(__A.HD.bakeMs),m:__A.WS.m.id,th:__A.WS.m.theme,x:__A.WS.x,y:__A.WS.y,ph:__A.TR.ph,w:__A.G.weather[__A.WS.m.s],sc:__A.WS.scale,vw:__A.WS.vw,vh:__A.WS.vh}));
      const el=await page.$('.wview');await el.screenshot({path:path.join(OUT,`${name}_${tag}_${TIER}.png`)});
      console.log(name,tag,JSON.stringify(st));}
    chk(`${tag}: no console errors (${errs.slice(0,3).join(' | ')})`,errs.length===0);
    await H.browser.close();}
  console.log('shots in',OUT);process.exit(0);
})();
