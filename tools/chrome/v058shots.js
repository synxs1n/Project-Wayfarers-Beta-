// v0.5.8 sprites in the HD-2D scenes: screenshots of the world (town by day and night, a dungeon next to a wall torch, a cave) and of
// battles (a field, a cave, a boss stage) on Medium and High, portrait 390x844 and the Galaxy Z Fold open 933x705.
// Writes PNGs to tools/chrome/shots-v058/ (not committed). TAG names the build (before / after).
// Usage: PWHTML=../../out/aurelis3.html TAG=after node v058shots.js   (SIZES=port,fold  ONLY=town_day,b_field  TIERS=medium,high)
const {open,chk}=require('./pw');const fs=require('fs');const path=require('path');
const OUT=path.join(__dirname,'shots-v058');fs.mkdirSync(OUT,{recursive:true});
const TAG=process.env.TAG||'after',ONLY=process.env.ONLY?process.env.ONLY.split(','):null;
const SIZES=[['port',390,844],['fold',933,705]].filter(s=>!process.env.SIZES||process.env.SIZES.split(',').includes(s[0]));
const TIERS=(process.env.TIERS||'medium,high').split(',');
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false}}));(()=>{let s=7;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const WORLD={
  town_day:A=>{A.G.clock=120;A.G.weather[0]='clear';const m=A.getMap('t0');let best=null,bd=1e9;for(let y=2;y<m.h-3;y++)for(let x=2;x<m.w-2;x++){if(A.tileAt(m,x,y)!=='L')continue;
      for(const [dx,dy] of [[1,1],[-1,1],[1,0],[-1,0]]){const tx=x+dx,ty=y+dy;if(A.solidAt(m,tx,ty)||A.solidAt(m,tx,ty+1)||A.solidAt(m,tx,ty+2))continue;const d=Math.abs(tx-m.w/2)+Math.abs(ty-m.h/2);if(d<bd){bd=d;best=[tx,ty];}}}
    if(best)A.placeAt('t0',best[0],best[1],'d');A.render();},
  town_night:A=>{A.G.clock=700;A.G.weather[0]='clear';A.render();},
  field_day:A=>{const G=A.G;G.clock=150;G.weather[0]='clear';const m=A.getMap('f0');const a=Object.values(m.gates)[0].arrive;A.placeAt('f0',a[0],a[1],'r');A.render();},
  dungeon_torch:A=>{A.enterDungeon(0);A.render();const m=A.WS.m,T=(m.lights||[]).filter(L=>L[3]==='torch');let best=null,bd=1e9;
    T.forEach(L=>{const tx=Math.floor(L[0]/16)+1,ty=Math.floor(L[1]/16)+1;if(A.solidAt(m,tx,ty)||A.solidAt(m,tx,ty+1)||A.tileAt(m,tx,ty)==='E')return;const d=Math.abs(tx-A.WS.x)+Math.abs(ty-A.WS.y);if(d<bd){bd=d;best=[tx,ty];}});
    if(best)A.placeAt(m.id,best[0],best[1],'d');A.render();},
  cave:A=>{const f=A.getMap('f0');const cv=(f.caves||[]).find(c=>c.kind!=='fort');if(cv){A.placeAt('f0',cv.out[0],cv.out[1],'d');A.enterCave(cv,0);}else A.enterDungeon(1);A.render();}};
const BATTLE=[['b_field',{th:'meadow',k:'field',g:'grass'},150,'clear','field'],['b_field_night',{th:'meadow',k:'field',g:'forest'},700,'clear','field'],
  ['b_cave',{th:'cave',k:'cave'},300,'clear','field'],['b_boss',null,300,'clear','boss',2]];
(async()=>{let n=0;
  for(const [sz,w,h] of SIZES)for(const tier of TIERS){
    const H=await open({w,h,mobile:true,dpr:2,pre:META(tier)});const {ev,wait,page}=H;const errs=[];page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource/.test(m.text()))errs.push(m.text());});
    await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(600);
    for(const [name,fn] of Object.entries(WORLD)){if(ONLY&&!ONLY.includes(name))continue;
      await ev(`(${fn.toString()})(__A)`);await ev(()=>{__A.TR.ph=null;__A.TR.wx.key=null;});await wait(900);
      const el=await page.$('.wview');if(el){await el.screenshot({path:path.join(OUT,`${TAG}_${name}_${sz}_${tier}.png`)});n++;}}
    for(const sc of BATTLE){const [name,bg,clock,wx,kind,stage]=sc;if(ONLY&&!ONLY.includes(name))continue;
      await ev(([bg,clock,wx,kind,stage])=>{const A=__A;A.V.modal=null;A.G.clock=clock;Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;});
        const sp={stage:stage||0,kind,weather:wx};if(bg)sp.bg=bg;if(kind==='field')sp.foes=['gull','mossling','frostwolf'].map(id=>A.makeEnemy(A.MON[id],5));
        try{A.startBattle(sp);const B=A.B;if(B)B.en.concat(B.front,B.back).forEach(u=>{u.S.mhp=u.hp=99999;});}catch(e){return String(e.stack).slice(0,300);}},[bg,clock,wx,kind,stage]);
      await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});await wait(500);
      await page.screenshot({path:path.join(OUT,`${TAG}_${name}_${sz}_${tier}.png`)});n++;
      await ev(()=>{try{__A.finishBattle('x');}catch(e){}__A.V.modal=null;__A.render();});await wait(300);}
    chk(`${sz} ${tier}: no console errors (${errs.slice(0,3).join(' | ')})`,errs.length===0);
    await H.browser.close();}
  chk('screenshots written ('+n+')',n>0);console.log('shots in',OUT);process.exit(0);})();
