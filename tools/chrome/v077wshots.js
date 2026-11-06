// v0.7.7 weather and old visuals pass: screenshots to tools/chrome/shots-v077w/ (ignored by git).
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v077wshots.js [tier] [only] [prefix]
// Groups (pick with `only`, a substring): kinds (every map kind at 933x705 and 390x844), wx (every weather in the world, by day and
// night), bt (the battle stage per backdrop and weather), menus (main menu tabs, results, title), wmap (world map).
const {open}=require('./pw');const fs=require('fs');const path=require('path');
const OUT=path.join(__dirname,'shots-v077w');fs.mkdirSync(OUT,{recursive:true});
const TIER=process.argv[2]||'medium',ONLY=process.argv[3]||'',PRE=process.argv[4]||'';
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false,tips:false}}));(()=>{let s=7;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const want=n=>!ONLY||ONLY.split(',').some(o=>n.includes(o)||o.startsWith(n+':'));
const SIZES=[[933,705,'fold'],[390,844,'port']];
async function boot(w,h){const H=await open({w,h,mobile:true,dpr:2,pre:META(TIER)});const errs=[];H.page.on('console',m=>{if(m.type()==='error'&&!/file:|ERR_FILE|Failed to load resource/.test(m.text()))errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await H.wait(600);return H;}
const file=n=>path.join(OUT,PRE+n+'.png');
const view=async(H,name)=>{const el=await H.page.$('.wview');if(el)await el.screenshot({path:file(name)});else await H.page.screenshot({path:file(name)});console.log('shot',name);};
const full=async(H,name)=>{await H.page.screenshot({path:file(name)});console.log('shot',name);};
// an open spot in a field of the given theme (or any field)
const FIELD=`(th,wx,clock)=>{const A=__A;let id=null;for(let s=0;s<16&&!id;s++){try{const m=A.getMap('f'+s);if(!th||m.theme===th)id='f'+s;}catch(e){}}if(!id)id='f0';const m=A.getMap(id);
  A.G.clock=clock;A.G.weather[m.s]=wx;let best=null;for(let y=6;y<m.h-6&&!best;y++)for(let x=6;x<m.w-8;x++){let ok=true;for(let j=-2;j<=2&&ok;j++)for(let i=-3;i<=3&&ok;i++)if(A.solidAt(m,x+i,y+j))ok=false;if(ok){best=[x,y];break;}}
  if(!best)best=Object.values(m.gates)[0].arrive;A.V.modal=null;A.placeAt(id,best[0],best[1],'d');A.TR.ph=null;A.TR.wx.key=null;A.render();return {id,th:m.theme};}`;
(async()=>{
  if(want('kinds'))for(const [w,h,tag] of SIZES){const H=await boot(w,h);const {ev,wait}=H;
    for(const [n,fn] of [['town',A=>{A.placeAt('t0',A.innSpot(0)[0],A.innSpot(0)[1],'d');}],['field',A=>{const m=A.getMap('f0');const g=Object.values(m.gates)[0].arrive;A.placeAt('f0',g[0],g[1],'d');}],['dungeon',A=>A.enterDungeon(0)],
        ['cave',A=>{for(let s=0;s<5;s++){const f=A.getMap('f'+s),c=(f.caves||[]).find(c=>c.kind!=='fort');if(c){A.placeAt('f'+s,c.out[0],c.out[1],'d');A.enterCave(c,s);return;}}}],
        ['fortress',A=>{for(let s=1;s<5;s++){const f=A.getMap('f'+s),c=(f.caves||[]).find(c=>c.kind==='fort');if(c){A.placeAt('f'+s,c.out[0],c.out[1],'d');A.enterCave(c,s);return;}}}],
        ['sanctum',A=>{A.getMap('s0');A.placeAt('s0',13,16,'u');}],['archive',A=>{A.getMap('a0');A.placeAt('a0',9,10,'u');}],
        ['town_night',A=>{A.placeAt('t1',A.innSpot(1)[0],A.innSpot(1)[1],'d');A.G.clock=700;}]]){
      try{await ev(`__A.V.modal=null;__A.WS.dlg=null;__A.G.clock=150;(${fn.toString()})(__A);__A.TR.ph=null;__A.V.modal=null;__A.render();`);await wait(1400);await view(H,`kind_${n}_${tag}_${TIER}`);}catch(e){console.log('kind',n,String(e).slice(0,200));}}
    if(want('kindsmini')){await ev(()=>{const A=__A;A.placeAt('t0',A.innSpot(0)[0],A.innSpot(0)[1],'d');A.render();});await wait(800);await full(H,`kind_town_full_${tag}_${TIER}`);}
    console.log('errors',H.errs.slice(0,3));await H.browser.close();}
  if(want('wx')){const L=[['rain','meadow'],['storm','meadow'],['fog','meadow'],['snow','snow'],['blizzard','snow'],['gale','heights'],['sand','coast'],['heat','cave'],['ashfall','cave'],['aurora','snow'],['starfall','void'],['meteor','cave'],['bloodmoon','meadow'],['eclipse','meadow'],['surge_water','coast'],['clear','meadow']];
    for(const [w,h,tag] of SIZES){if(tag==='port'&&!want('wxport'))continue;const H=await boot(w,h);const {ev,wait}=H;
      for(const [wx,th] of L)for(const clock of [150,700]){if(clock===700&&!['rain','storm','snow','fog','starfall','meteor','bloodmoon','aurora','clear'].includes(wx))continue;
        await ev(`(${FIELD})(${JSON.stringify(th)},${JSON.stringify(wx)},${clock})`);await wait(1500);
        if(wx==='storm'){await ev(()=>{const W=__A.W7&&__A.W7.W7;if(W){W.force=performance.now();W.hold=1;}});await wait(120);}
        await view(H,`wx_${wx}_${clock===700?'night':'day'}_${tag}_${TIER}`);await ev(()=>{const W=__A.W7&&__A.W7.W7;if(W){W.force=0;W.hold=0;}});}
      console.log('errors',H.errs.slice(0,3));await H.browser.close();}}
  if(want('bt')){const SC=[['meadow_day',{th:'meadow',k:'field',g:'grass'},100,'clear','field'],['meadow_rain',{th:'meadow',k:'field',g:'grass'},100,'rain','field'],['forest_storm_night',{th:'meadow',k:'field',g:'forest'},700,'storm','field'],
      ['coast_sand',{th:'coast',k:'field',g:'sand'},200,'sand','field'],['snow_blizzard',{th:'snow',k:'field',g:'snow'},300,'blizzard','field'],['snow_snow',{th:'snow',k:'field',g:'snow'},850,'snow','field'],
      ['heights_gale',{th:'heights',k:'field',g:'high'},300,'gale','field'],['meadow_fog',{th:'meadow',k:'field',g:'grass'},300,'fog','field'],['cave_heat',{th:'cave',k:'field',g:'ash'},300,'heat','field'],['cave_ash',{th:'cave',k:'field',g:'ash'},300,'ashfall','field'],
      ['void_starfall',{th:'void',k:'field',g:'void'},700,'starfall','field'],['snow_aurora',{th:'snow',k:'field',g:'snow'},700,'aurora','field'],['cave_cave',{th:'cave',k:'cave'},300,'clear','field'],['dungeon_meadow',{th:'meadow',k:'dungeon'},300,'clear','field'],
      ['boss_a',null,300,'clear','boss',2],['arena',null,300,'clear','arena',2]];
    for(const [w,h,tag] of SIZES){const H=await boot(w,h);const {ev,wait,page}=H;
      for(const [name,bg,clock,wx,kind,stage] of SC){if(ONLY.includes('bt:')&&!ONLY.includes(name))continue;
        await ev(([bg,clock,wx,kind,stage])=>{const A=__A;A.V.modal=null;A.G.clock=clock;const sp={stage:stage||0,kind,weather:wx};if(kind==='arena'){sp.tier=0;sp.waves=1;sp.lvs=[5,6];}if(bg)sp.bg=bg;if(kind==='field')sp.foes=['gull','mossling','frostwolf'].map(id=>A.makeEnemy(A.MON[id],5));
          try{A.startBattle(sp);}catch(e){return String(e);}},[bg,clock,wx,kind,stage]);
        await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
        await ev(()=>{const B=__A.B;if(B)B.en.concat(B.front).forEach(u=>{u.S.mhp=u.hp=Math.max(u.hp,99999);});});await wait(700);
        if(wx==='storm'){await ev(()=>{const W=__A.W7&&__A.W7.W7;if(W){W.force=performance.now();W.hold=1;}});await wait(120);}
        await full(H,`bt_${name}_${tag}_${TIER}`);await ev(()=>{const W=__A.W7&&__A.W7.W7;if(W){W.force=0;W.hold=0;}});await ev(()=>{try{__A.finishBattle('x');}catch(e){}__A.V.modal=null;});await wait(200);}
      // the results window after a win
      await ev(()=>{const A=__A;A.V.modal=null;A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON.gull,1)]});});
      await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
      await ev(()=>{const A=__A;A.B.en.forEach(e=>{e.hp=0;});A.win();});await wait(1200);await full(H,`results_${tag}_${TIER}`);
      console.log('errors',H.errs.slice(0,3));await H.browser.close();}}
  if(want('menus'))for(const [w,h,tag] of SIZES){const H=await boot(w,h);const {ev,wait}=H;
    for(const t of ['party','items','equip','map','journey','beasts','settings']){await ev(t=>{const A=__A;A.V.modal=null;if(t==='settings')A.ACT.settings();else A.ACT.menuTab(t);A.render();},t);await wait(500);await full(H,`menu_${t}_${tag}_${TIER}`);}
    await ev(()=>{__A.V.modal=null;__A.render();});await wait(300);
    console.log('errors',H.errs.slice(0,3));await H.browser.close();}
  if(want('wmap'))for(const [w,h,tag] of SIZES){const H=await boot(w,h);const {ev,wait,page}=H;
    await ev(()=>{const A=__A;A.V.modal=null;A.render();A.ACT.map();A.ACT.worldMap&&A.ACT.worldMap();});await wait(900);await full(H,`wmap_${tag}_${TIER}`);await H.browser.close();}
  console.log('shots in',OUT);process.exit(0);
})();
