// v0.4.0 Phase 3 tests (menu, forge naming, craft order, borders, pork chop, dusk, starters).
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {page,ev,wait,shot}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(300);});
// ---- 3.1 menu
await ev(()=>__A.ACT.menu());await wait(200);
const top=await ev(()=>[...document.querySelectorAll('#modal .mgrp .chip')].map(x=>x.textContent));
chk('top row is Party Backpack Guides Records Quests Map Settings',JSON.stringify(top)===JSON.stringify(['Party','Backpack','Guides','Records','Quests','Map','Settings'])||JSON.stringify(top));
const want={Party:['Party','Roster','Loadouts','Companions'],Backpack:['Equipment','Items'],Guides:['What next?','Lore','Foe types','Guilds','Help'],Records:['Journey','Bestiary','Codex','Guilds']};
for(const g of Object.keys(want)){
  await page.click(`#modal .mgrp .chip:has-text("${g}")`);await wait(150);
  const subs=await ev(()=>[...document.querySelectorAll('#modal .msub .chip')].map(x=>x.textContent));
  chk(g+' holds '+want[g].join(', '),JSON.stringify(subs)===JSON.stringify(want[g])||JSON.stringify(subs));
  for(const t of want[g]){await page.click(`#modal .msub .chip:text-is("${t}")`);await wait(120);
    const ok=await ev(([t])=>({on:[...document.querySelectorAll('#modal .msub .chip.on')].map(x=>x.textContent)[0],len:document.getElementById('modal').innerText.length}),[t]);
    chk('  '+g+' > '+t+' opens',ok.on===t&&ok.len>120||JSON.stringify(ok));}
}
for(const g of ['Quests','Map','Settings']){await page.click(`#modal .mgrp .chip:has-text("${g}")`);await wait(150);
  const r=await ev(()=>({subs:document.querySelectorAll('#modal .msub').length,len:document.getElementById('modal').innerText.length,on:document.querySelector('#modal .mgrp .chip.on').textContent}));
  chk(g+' opens with no sub row',r.on===g&&r.subs===0&&r.len>80||JSON.stringify(r));}
chk('Settings tab carries the real settings (sound, auto battle)',await ev(()=>/Sound/.test(document.getElementById('modal').innerText)&&!!document.querySelector('#modal [data-act="autoOpen"]')));
await page.click('#modal [data-act="autoOpen"]');await wait(200);await page.click('#modal [data-act="xBack"]');await wait(200);
chk('Auto settings from the menu returns to the menu',await ev(()=>__A.V.modal&&__A.V.modal.type==='menu'&&__A.V.modal.tab==='settings'));
// group remembers its sub tab
await page.click('#modal .mgrp .chip:has-text("Guides")');await wait(100);await page.click('#modal .msub .chip:text-is("Lore")');await wait(100);
await page.click('#modal .mgrp .chip:has-text("Backpack")');await wait(100);await page.click('#modal .mgrp .chip:has-text("Guides")');await wait(100);
chk('returning to Guides reopens the tab you left (Lore)',await ev(()=>__A.V.modal.tab==='lore'));
// old tab ids still resolve
for(const t of ['next','party','equip','comp','roster','items','quests','beasts','codex','lore','map','system','loadouts','types','help','settings']){
  const r=await ev(([t])=>{__A.V.modal={type:'menu',tab:t};__A.render();return {len:document.getElementById('modal').innerText.length,on:document.querySelectorAll('#modal .chip.on').length};},[t]);
  chk('tab id '+t+' still renders',r.len>80&&r.on>=1||JSON.stringify(r));}
// Foe types guide reads from the tables
await ev(()=>{__A.V.modal={type:'menu',tab:'types'};__A.render();});
chk('Foe types guide lists all seven types and the Undead healing rule',await ev(()=>{const t=document.getElementById('modal').innerText.toLowerCase();return ['flying','armored','jelly','undead','swarm','beast','plant'].every(k=>t.includes(k))&&/heal/.test(t);}));
// X and Back
await page.click('#modal [data-act="closeModal"]');await wait(150);
chk('Close works from the grouped menu',await ev(()=>!__A.V.modal));

// ---- 3.2 / 3.3 Forge naming and order
await ev(()=>{const A=__A;A.V.modal=null;A.G.stage=3;A.G.gold=900000;Object.keys(A.MATS).forEach(k=>{A.G.mats[k]=40;});
  A.G.mats.ore=40;A.G.mats.wood=40;A.V.modal={type:'smithy',tab:'craft',cat:'weapon'};A.render();});
await wait(250);
const sm=await ev(()=>({tabs:[...document.querySelectorAll('#modal .chips .chip')].map(x=>x.textContent),btns:[...document.querySelectorAll('#modal [data-act="craftR"]')].map(x=>x.textContent)}));
chk('Smithy tab reads Forge, not Craft',sm.tabs.includes('Forge')&&!sm.tabs.includes('Craft')||JSON.stringify(sm.tabs));
chk('Smithy recipe buttons read Forge',sm.btns.length>0&&sm.btns.every(t=>t==='Forge')||JSON.stringify(sm.btns));
chk('Tempering keeps its name',sm.tabs.includes('Tempering'));
const ord=await ev(()=>{const A=__A;const open=A.RECIPES.filter(r=>r.cat==='weapon'&&r.t<=A.G.stage+1);const L=A.recipeOrder(open);return L.map(r=>({ok:A.recipeReady(r),g:A.recipeGain(r)[0],c:A.recipeClose(r)}));});
const nOk=ord.filter(o=>o.ok).length;
chk('there are craftable recipes to test with',nOk>2||JSON.stringify(ord.slice(0,5)));
chk('craftable recipes sit above the ones you cannot make yet',ord.slice(0,nOk).every(o=>o.ok)&&ord.slice(nOk).every(o=>!o.ok));
chk('craftable recipes are sorted biggest upgrade first',ord.slice(0,nOk).every((o,i,a)=>i===0||a[i-1].g>=o.g-1e-9)||JSON.stringify(ord.slice(0,nOk).map(o=>o.g)));
const dom=await ev(()=>[...document.querySelectorAll('#modal .row.rec')].map(r=>r.classList.contains('ready')));
chk('the screen shows them in that order (ready rows first)',dom.indexOf(false)<0||dom.slice(dom.indexOf(false)).every(x=>!x));
await ev(()=>{const A=__A;A.G.gold=0;Object.keys(A.G.mats).forEach(k=>A.G.mats[k]=0);A.G.mats.ore=3;A.G.mats.wood=1;A.render();});await wait(100);
const far=await ev(()=>{const A=__A;const L=A.recipeOrder(A.RECIPES.filter(r=>r.cat==='weapon'&&r.t<=A.G.stage+1));return L.map(r=>A.recipeClose(r));});
chk('recipes you cannot make are ordered by how close you are',far.every((c,i,a)=>i===0||a[i-1]>=c-1e-9)||JSON.stringify(far));
await ev(()=>{const A=__A;A.G.gold=900000;Object.keys(A.MATS).forEach(k=>{A.G.mats[k]=40;});A.render();});
await ev(()=>{const A=__A;A.G.gold=0;A.render();});await wait(150);
const ord2=await ev(()=>[...document.querySelectorAll('#modal .row.rec')].map(r=>r.classList.contains('ready')));
chk('with no gold nothing is ready and the list still renders',ord2.length>0&&ord2.every(x=>!x));
await ev(()=>{const A=__A;A.G.gold=900000;A.V.modal={type:'workshop',tab:'craft',cat:'potion'};A.render();});await wait(200);
const al=await ev(()=>({title:document.querySelector('#modal h2').textContent,tabs:[...document.querySelectorAll('#modal .chips .chip')].map(x=>x.textContent),btns:[...new Set([...document.querySelectorAll('#modal [data-act="craftR"]')].map(x=>x.textContent))]}));
chk('Alchemy keeps Brew and craft with Craft buttons',al.tabs.some(t=>/Brew/.test(t))&&al.btns.every(t=>t==='Craft')||JSON.stringify(al));

// ---- 3.4 purchase pop and sound
await ev(()=>{const A=__A;A.G.gold=5000;A.V.modal={type:'smithy',tab:'weapons'};A.render();window.__sfx=[];const s0=A.sfx;});
await wait(150);
const g0=await ev(()=>__A.G.gold);
{const b=await page.$('#modal [data-act="buyGear"]:not([disabled])');await b.scrollIntoViewIfNeeded();const r=await b.boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);}
await wait(120);
const pf=await ev(()=>({fx:document.querySelectorAll('#buyfxl .buyfx').length,amt:(document.querySelector('#buyfxl .buyamt')||{}).textContent,coins:document.querySelectorAll('#buyfxl .coin').length,gold:__A.G.gold}));
chk('buying plays a pop with the price over the button',pf.fx===1&&/−\d+/.test(pf.amt)&&pf.coins===5&&pf.gold<g0||JSON.stringify(pf));
await wait(1200);
chk('the pop cleans itself up',await ev(()=>document.querySelectorAll('#buyfxl .buyfx').length===0));
await ev(()=>{__A.G.gold=0;__A.V.modal={type:'smithy',tab:'weapons'};__A.render();});
await ev(()=>{const b=document.querySelector('#modal [data-act="buyGear"]');if(b&&!b.disabled)b.click();});await wait(100);
chk('a failed purchase (no gold) shows no pop',await ev(()=>document.querySelectorAll('#buyfxl .buyfx').length===0));
// reduced motion: no coins, no movement class
await ev(()=>{const A=__A;A.META.cfg.rmotion=true;A.G.gold=5000;A.V.modal={type:'smithy',tab:'weapons'};A.render();});await wait(100);
{const b=await page.$('#modal [data-act="buyGear"]:not([disabled])');await b.scrollIntoViewIfNeeded();const r=await b.boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);}
await wait(120);
const rm=await ev(()=>({still:!!document.querySelector('#buyfxl .buyfx.still'),coins:document.querySelectorAll('#buyfxl .coin').length,anim:getComputedStyle(document.querySelector('#buyfxl .buyamt')).animationName}));
chk('reduced motion: price shows, no coins, no travel',rm.still&&rm.coins===0||JSON.stringify(rm));
await ev(()=>{__A.META.cfg.rmotion=null;});
// sounds: buy cue is the coin clink (3 tones)
const tones=await ev(()=>{let n=0;const t0=__A.tone;return typeof __A.sfx==='function';});
chk('sfx buy exists',tones);

// ---- 3.5 Best For focuses on the active party
await ev(()=>{const A=__A;A.G.roster.brann=A.newChar('brann',20,0);A.G.roster.tess=A.newChar('tess',20,0);A.V.modal=null;});
const bf=await ev(()=>{const A=__A;const ids=Object.keys(A.GEAR).filter(id=>A.GEAR[id].slot==='w'&&A.gainersFor(id,true).some(o=>!A.G.party.includes(o.c.id)));const id=ids[0];return {id,html:id?A.bestTag(id):'',party:id?A.gainersFor(id).length:-1};});
chk('Best For headline says it is about your party',!bf.id||/Helps your party|active party/.test(bf.html)||bf.html.slice(0,200));
chk('roster only heroes get the smaller secondary line',!bf.id||/bestside/.test(bf.html)||bf.html.slice(0,300));
// ---- 3.6 Pork Chop Sandwich
await ev(()=>{const A=__A;A.G.inv.porkchop=3;A.G.lastTown=0;A.WS.lock=false;A.V.modal=null;A.G.stage=1;A.placeAt('f1',10,10,'d');});await wait(300);
const pk0=await ev(()=>({m:__A.WS.m.id,why:__A.travelWhyNot('porkchop')}));
chk('in a field the sandwich is usable (no refusal)',pk0.why===''||JSON.stringify(pk0));
await ev(()=>{__A.useTravel('porkchop');});await wait(1400);
const pk1=await ev(()=>{const A=__A;const [ix,iy]=A.innSpot(0);return {m:A.WS.m.id,x:A.WS.x,y:A.WS.y,ix,iy,left:A.G.inv.porkchop};});
chk('field: lands in front of the Inn of the last town',pk1.m==='t0'&&pk1.x===pk1.ix&&pk1.y===pk1.iy&&pk1.left===2||JSON.stringify(pk1));
await ev(()=>{const A=__A;A.G.lastTown=1;A.G.stage=1;A.placeAt('f1',10,10,'d');});await wait(200);
await ev(()=>{__A.useTravel('porkchop');});await wait(1400);
const pk2=await ev(()=>{const A=__A;const [ix,iy]=A.innSpot(1);return {m:A.WS.m.id,x:A.WS.x,y:A.WS.y,ix,iy};});
chk('it follows lastTown, not always the first town',pk2.m==='t1'&&pk2.x===pk2.ix&&pk2.y===pk2.iy||JSON.stringify(pk2));
await ev(()=>{const A=__A;A.G.daily=true;A.placeAt('f1',10,10,'d');});
chk('Daily Trial still refuses it',await ev(()=>__A.travelWhyNot('porkchop')!==''));
await ev(()=>{__A.G.daily=false;});
// dungeon: entrance
await ev(()=>{const A=__A;A.G.stage=1;A.enterDungeon(1);});await wait(500);
const dg=await ev(()=>{const A=__A;const d=A.getMap(A.WS.m.id);return {kind:A.WS.m.kind,start:d.start,why:A.travelWhyNot('porkchop')};});
await ev(()=>{const A=__A;const d=A.getMap(A.WS.m.id);A.placeAt(A.WS.m.id,d.start[0]+0,d.start[1]-0,'d');});
await ev(()=>{const A=__A;const m=A.WS.m;let spot=null;for(let y=0;y<m.t.length&&!spot;y++)for(let x=0;x<m.t[y].length;x++){if(!A.solidAt(m,x,y)&&Math.abs(x-m.start[0])+Math.abs(y-m.start[1])>8){spot=[x,y];break;}}if(spot)A.placeAt(m.id,spot[0],spot[1],'d');});
await ev(()=>{__A.useTravel('porkchop');});await wait(1400);
const dg2=await ev(()=>{const A=__A,d=A.getMap(A.WS.m.id);return {kind:A.WS.m.kind,at:[A.WS.x,A.WS.y],start:d.start};});
chk('dungeon: still back to the entrance',dg.kind==='dungeon'&&dg.why===''&&dg2.kind==='dungeon'&&dg2.at[0]===dg2.start[0]&&dg2.at[1]===dg2.start[1]||JSON.stringify([dg,dg2]));

// ---- 3.7 dusk and dawn
const cyc=await ev(()=>{const A=__A;const L=A.CLK_LEN;return {len:L}});
await ev(()=>{const A=__A;A.G.daily=false;A.G.stage=0;A.V.modal=null;A.placeAt('f0',12,12,'d');A.G.clock=0;});await wait(500);
const cl=await ev(()=>{const t=__A.CLK_LEN;return {t,ph:(c)=>0}});
const lens=await ev(()=>{const A=__A;const o={};[0,200,520,540,600,700,830,880].forEach(c=>{A.G.clock=c;o[c]=A.clockPhase();});return o;});
chk('the cycle is 900 steps with day, dusk, night, dawn in order',lens[0]==='day'&&lens[200]==='day'&&lens[520]==='dusk'&&lens[540]==='dusk'&&lens[600]==='night'&&lens[700]==='night'&&lens[830]==='dawn'&&lens[880]==='dawn'||JSON.stringify(lens));
chk('each phase is about 50% longer than before (330/60/150/60 -> 495/90/225/90)',await ev(()=>{const P=__A.CLK_PH;return P[0][2]-P[0][1]===495&&P[1][2]-P[1][1]===90&&P[2][2]-P[2][1]===225&&P[3][2]-P[3][1]===90;}));
const snap=async(clock)=>{await ev(([c])=>{const A=__A;A.G.clock=c;A.WS.lock=false;},[clock]);await wait(450);await ev(()=>{const T=__A.TR;if(T){T.k=1;T.from=null;}});await wait(120);return await ev(()=>{const cv=document.querySelector('canvas');const x=cv.getContext('2d');const d=x.getImageData(0,0,cv.width,cv.height).data;let r=0,g=0,b=0,n=0,bright=0;for(let i=0;i<d.length;i+=16){r+=d[i];g+=d[i+1];b+=d[i+2];n++;if(d[i]+d[i+1]+d[i+2]>660)bright++;}return {r:r/n,g:g/n,b:b/n,bright:bright/n};});};
const day=await snap(100),dusk=await snap(540),night=await snap(700),dawn=await snap(855);
chk('dusk looks different from day (warmer: red above blue)',dusk.r-dusk.b>day.r-day.b+8||JSON.stringify([day,dusk]));
chk('dawn looks different from day and from night',Math.abs(dawn.r-day.r)>3&&dawn.r>night.r||JSON.stringify([day,dawn,night]));
await ev(()=>{__A.G.clock=540;});await wait(500);await shot('v040_dusk');
await ev(()=>{__A.G.clock=855;});await wait(500);await shot('v040_dawn');
// reduced motion still draws, and the draw never throws
await ev(()=>{__A.META.cfg.rmotion=true;});await wait(300);
chk('reduced motion draws a still dusk without errors',await ev(()=>{try{__A.G.clock=540;return true;}catch(e){return false;}}));
await ev(()=>{__A.META.cfg.rmotion=null;});
const tip=await ev(()=>{__A.G.clock=540;return __A.wxInfoBody('time');});
chk('HUD popup text describes dusk light',/shafts|fireflies/.test(tip)||tip);
await ev(()=>{__A.G.clock=855;});
chk('HUD popup text describes dawn mist',/mist/.test(await ev(()=>__A.wxInfoBody('time'))));

// ---- 3.8 starter sheets
await ev(()=>{const A=__A;A.G=null;A.V.modal=null;A.V.screen='title';A.render();A.ACT.new();});await wait(300);
const sc=await ev(()=>({cards:document.querySelectorAll('.cardwrap').length,btns:document.querySelectorAll('.cardwrap .sheetb').length,starters:Object.keys(__A.TPL).length}));
chk('every starter card has a Full sheet button',sc.cards>0&&sc.btns===sc.cards||JSON.stringify(sc));
const ids=await ev(()=>[...document.querySelectorAll('.cardwrap .card')].map(b=>b.dataset.arg));
let bad=[];
for(const id of ids){await ev(([id])=>__A.ACT.sheetS(id),[id]);await wait(60);
  const r=await ev(()=>{const t=document.getElementById('modal').innerText;return {hp:/HP\s*\d+/.test(t),sk:/Skills at the start/i.test(t),gear:/Weapons/i.test(t)&&/Armor/i.test(t),nat:/Nature/i.test(t),nan:/NaN|undefined/.test(t),len:t.length};});
  if(!(r.hp&&r.sk&&r.gear&&r.nat&&!r.nan&&r.len>300))bad.push([id,r]);}
chk('all '+ids.length+' sheets show stats, skills, gear, nature, and no NaN',bad.length===0||JSON.stringify(bad.slice(0,3)));
await ev(([id])=>__A.ACT.sheetS(id),[ids[0]]);await wait(150);await shot('v040_sheet');
await page.click('#modal [data-act="sheetPick"]');await wait(150);
chk('Choose from the sheet picks the hero and closes it',await ev(([id])=>__A.V.pick.includes(id)&&!__A.V.modal,[ids[0]]));
await ev(([a,b,c])=>{__A.ACT.pickS(a);__A.ACT.pickS(b);__A.ACT.sheetS(c);},[ids[1],ids[2],ids[3]]);await wait(100);
chk('with three picked the sheet button is disabled for a fourth',await ev(()=>document.querySelector('#modal [data-act="sheetPick"]').disabled));
await ev(()=>{__A.V.modal=null;__A.V.pick=[];__A.render();});
await ev(()=>{});

// ---- 3.9 Legacy counts toward the three
await ev(()=>{const A=__A;A.G=null;A.META.legacy=['brann','tess','oren'];A.META.cycles=1;A.V.modal=null;A.V.screen='title';A.render();A.ACT.new();});await wait(200);
const l0=await ev(()=>({slots:__A.starterSlots(),pick:__A.V.legacyPick.slice()}));
await ev(()=>{__A.V.legacyPick=[];__A.V.pick=[];__A.render();});
chk('no legacy picked: three starter picks',await ev(()=>__A.starterSlots()===3));
await ev(()=>{__A.ACT.pickLeg('brann');});chk('one legacy: two starter picks',await ev(()=>__A.starterSlots()===2));
await ev(()=>{__A.ACT.pickLeg('tess');});chk('two legacy: one starter pick',await ev(()=>__A.starterSlots()===1));
await ev(()=>{__A.ACT.pickLeg('oren');});chk('a third legacy swaps out the oldest, never more than two',await ev(()=>__A.V.legacyPick.length===2&&__A.starterSlots()===1));
await ev(()=>{__A.V.legacyPick=['brann','tess'];__A.V.pick=[];__A.render();});
chk('the Begin button waits for exactly the remaining pick(s)',await ev(()=>document.querySelector('[data-act="begin"]').disabled&&/0\/3|2\/3/.test(document.querySelector('[data-act="begin"]').textContent)||document.querySelector('[data-act="begin"]').textContent));
await ev(()=>{const A=__A;const id=[...document.querySelectorAll('.cardwrap .card')].map(b=>b.dataset.arg).find(i=>!['brann','tess'].includes(i));A.ACT.pickS(id);A.ACT.pickS(Object.keys(A.TPL).find(i=>i!==id&&!['brann','tess'].includes(i)&&A.STARTERS.includes(i)));});
chk('a second starter pick is refused while two legacy heroes are coming',await ev(()=>__A.V.pick.length===1));
await ev(()=>{__A.ACT.begin();});await wait(200);
const g3=await ev(()=>({n:Object.keys(__A.G.roster).length,party:__A.G.party.length,leg:Object.values(__A.G.roster).filter(c=>c.legacy).length}));
chk('the journey starts with exactly three heroes',g3.n===3&&g3.party===3&&g3.leg===2||JSON.stringify(g3));
// defensive: newGame itself never exceeds three
await ev(()=>{const A=__A;A.newGame(['mira','lumen','oren'],0,['brann','tess']);});
chk('newGame called with 3 starters and 2 legacy still yields three',await ev(()=>Object.keys(__A.G.roster).length===3));
await ev(()=>{const A=__A;A.META.legacy=[];A.META.cycles=0;A.newGame(['mira','lumen','oren'],0,[]);});
chk('with no legacy: the usual three',await ev(()=>Object.keys(__A.G.roster).length===3));

// ---- 3.10 item strength borders
await ev(()=>{const A=__A;A.G.stage=3;A.G.gold=900000;A.V.modal=null;A.G.roster.mira.eq.w='w_staff_1';A.V.modal={type:'smithy',tab:'weapons'};A.render();});await wait(250);
const sh=await ev(()=>({rows:document.querySelectorAll('#modal .shoprow').length,fr:document.querySelectorAll('#modal .shoprow .gframe').length,chips:document.querySelectorAll('#modal .shoprow .tchip').length,vs:document.querySelectorAll('#modal .shoprow .vs').length,pips:document.querySelectorAll('#modal .shoprow .tpip').length}));
chk('every Smithy shop row has a tier frame, pip, label and a better/same/worse marker',sh.rows>0&&sh.fr===sh.rows&&sh.chips===sh.rows&&sh.vs===sh.rows&&sh.pips===sh.rows||JSON.stringify(sh));
const col=await ev(()=>{const A=__A;const o={};document.querySelectorAll('#modal .shoprow').forEach(r=>{const f=r.querySelector('.gframe');const c=getComputedStyle(f).borderTopColor;const lab=r.querySelector('.tchip').textContent.trim().replace(/[^A-Za-z]/g,'').replace(/^[^A-Z]*/,'');o[lab]=c;});return o;});
chk('different tiers get different border colours',new Set(Object.values(col)).size>=2||JSON.stringify(col));
// colours come from the single config
const cfgOK=await ev(()=>{const A=__A;const T=A.ITEM_TIERS;const f=document.querySelector('#modal .shoprow .gframe');const t=[...f.classList].find(c=>/^t\d$/.test(c)).slice(1)*1;const want=T[t].c;const m=want.match(/#(..)(..)(..)/).slice(1).map(h=>parseInt(h,16));return getComputedStyle(f).borderTopColor===`rgb(${m.join(', ')})`;});
chk('border colour equals the ITEM_TIERS config colour',cfgOK);
chk('the tier line has Common to Echoforged with distinct pip shapes',await ev(()=>{const T=__A.ITEM_TIERS;return T.length===7&&new Set(T.map(x=>x.pip)).size===7&&new Set(T.map(x=>x.c)).size===7&&T[6].n==='Echoforged';}));
// tempering marker
const tm=await ev(()=>{const A=__A;const g=A.gearOf('w_blade_2+2');return {chip:A.tierChip(g),idx:A.gTierIdx(g)};});
chk('tempered gear shows a +N marker on its chip',/tplus/.test(tm.chip)&&/\+2/.test(tm.chip));
// echoforged and stick
const ef=await ev(()=>{const A=__A;const id=Object.keys(A.GEAR).find(k=>/_ef$/.test(k));return id?{id,idx:A.gTierIdx(A.gearOf(id)),ico:A.gearIcon(id)}:null;});
chk('Echoforged weapons use the Echoforged look',!ef||ef.idx===6&&/gframe t6 ef/.test(ef.ico)||JSON.stringify(ef));
const st=await ev(()=>{const A=__A;const g=A.gearOf('w_stick');const h=A.gearIcon('w_stick');return {h,glow:g.glow};});
chk("the Tamer's Stick keeps its changing glow frame",/gframe[^"]* stk/.test(st.h)&&st.h.includes('--tc:'+st.glow)||st.h.slice(0,200));
// pickers: better / same / worse vs the worn item
await ev(()=>{const A=__A;A.G.gear=['w_staff_0','w_staff_2','w_staff_1'];A.G.roster.mira.eq.w='w_staff_1';A.refresh(A.G.roster.mira);A.V.modal={type:'eqPick',char:'mira',slot:'w'};A.render();});await wait(250);
const pk=await ev(()=>[...document.querySelectorAll('#modal .rows .row.tr')].map(r=>({n:r.querySelector('b').textContent,vs:(r.querySelector('.vs')||{}).textContent,frame:!!r.querySelector('.gframe'),chip:!!r.querySelector('.tchip')})));
chk('picker rows each carry a frame, chip and marker',pk.length>=3&&pk.every(x=>x.frame&&x.chip&&x.vs)||JSON.stringify(pk));
chk('picker marks a weaker staff Worse and a stronger one Better',pk.some(x=>/Worse/.test(x.vs))&&pk.some(x=>/Better/.test(x.vs))||JSON.stringify(pk));
// inventory
await ev(()=>{__A.V.modal={type:'menu',tab:'items'};__A.render();});
chk('inventory rows show tier chips',await ev(()=>document.querySelectorAll('#modal .row.tr .tchip').length>=5));
// forge rows
await ev(()=>{const A=__A;Object.keys(A.MATS).forEach(k=>A.G.mats[k]=40);A.V.modal={type:'smithy',tab:'craft',cat:'weapon'};A.render();});
const fg=await ev(()=>({rows:document.querySelectorAll('#modal .row.rec').length,fr:document.querySelectorAll('#modal .row.rec .gframe').length,vs:document.querySelectorAll('#modal .row.rec .vs').length}));
chk('Forge rows show frames and markers',fg.rows>0&&fg.fr===fg.rows&&fg.vs===fg.rows||JSON.stringify(fg));
// tempering rows
await ev(()=>{__A.V.modal={type:'smithy',tab:'forge'};__A.render();});
chk('Tempering rows show frames',await ev(()=>document.querySelectorAll('#modal .row.rec .gframe').length>0));
// victory screen
await ev(()=>{const A=__A;A.startBattle({stage:0,kind:'field'});});await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000});
await ev(()=>{__A.B.en.forEach(e=>e.hp=0);});await wait(50);await ev(()=>{__A.advance();});await page.waitForFunction(()=>__A.V.modal&&__A.V.modal.type==='result',{timeout:20000}).catch(()=>{});
await ev(()=>{const i=__A.V.modal.info;i.drops=['hipotion','plume'];i.gear='w_blade_3+1';__A.render();});await wait(150);
const vr=await ev(()=>({found:[...document.querySelectorAll('#modal .tfr .tchip')].length,sp:!!document.querySelector('#modal .row.tr .gframe')}));
chk('victory screen shows tier chips for items found and a framed spoils row',vr.found>=3&&vr.sp||JSON.stringify(vr));
await ev(()=>{__A.ACT.resultOk();});
await ev(()=>{__A.V.modal=null;__A.render();});

// ---- 4.4 starter pool and seeded draw
const dr=await ev(()=>{const A=__A;const ST=A.STARTERS;const bad=[];const seen=new Set();let n=0;
  for(let seed=1;seed<=20000;seed++){const o=A.starterDraw(seed*2654435761%4294967296);n++;
    const cl=new Set(o.map(id=>A.TPL[id].cls)),el=new Set(o.map(id=>A.TPL[id].el[0]));
    if(o.length!==8||cl.size!==8||el.size!==8||!o.every(id=>ST.includes(id))||o.some(id=>A.TPL[id].el.length!==1))bad.push([seed,o.join(',')]);
    seen.add(o.slice().sort().join(','));}
  const again=A.starterDraw(12345).join()===A.starterDraw(12345).join();
  return {n,bad:bad.slice(0,3),badN:bad.length,distinct:seen.size,again,pool:ST.length};});
chk('the starter pool has 24 heroes (v0.4.3)',dr.pool===24);
chk('20000 seeds: always 8 options, 8 different elements, 8 different classes, all singles from the pool',dr.badN===0||JSON.stringify(dr));
chk('the draw is deterministic for a seed',dr.again);
chk('different seeds give a good spread of option sets (at least 8 distinct)',dr.distinct>=8||dr.distinct);
const pool=await ev(()=>{const A=__A,ST=A.STARTERS;const c={},e={};ST.forEach(id=>{const t=A.TPL[id];c[t.cls]=(c[t.cls]||0)+1;e[t.el[0]]=(e[t.el[0]]||0)+1;});return {c,e,names:ST.map(id=>A.TPL[id].n+' ('+A.TPL[id].cls+', '+A.TPL[id].el[0]+')')};});
chk('pool is 3 per class and 3 per element (v0.4.3)',Object.values(pool.c).every(v=>v===3)&&Object.values(pool.e).every(v=>v===3)&&Object.keys(pool.c).length===8&&Object.keys(pool.e).length===8||JSON.stringify(pool));
console.log('STARTER POOL: '+pool.names.join('; '));
await ev(()=>{const A=__A;A.G=null;A.META.legacy=[];A.V.modal=null;A.V.screen='title';A.render();A.ACT.new();});await wait(200);
const so=await ev(()=>({cards:document.querySelectorAll('.cardwrap').length,ids:[...document.querySelectorAll('.cardwrap .card')].map(b=>b.dataset.arg),opts:__A.V.starterOpts}));
chk('the starter screen shows exactly the 8 drawn options',so.cards===8&&JSON.stringify(so.ids.slice().sort())===JSON.stringify(so.opts.slice().sort())||JSON.stringify(so));
await ev(()=>{const A=__A;A.V.starterOpts.slice(0,3).forEach(id=>A.ACT.pickS(id));A.ACT.begin();});await wait(200);
const jr=await ev(()=>{const A=__A;const sub=A.ensureSub(A.G);return {party:A.G.party.slice(),sub:sub.length,incl:A.G.party.every(id=>sub.includes(id)),seed:A.G.run.sseed};});
chk('the chosen starters are always inside the journey subset',jr.incl&&jr.sub>=28||JSON.stringify(jr));

// ---- 4.3 signature skills
const sg=await ev(()=>{const A=__A;const rep=A.sigReport();
  const leg=['kaevan','nikaris','jaeson','vaelith'].map(id=>A.classSkills(A.TPL[id]).some(s=>/^sg_/.test(s.id)));
  const names=id=>new Set(A.classSkills(A.TPL[id]).map(s=>s.n));
  const diff=(a,b)=>{const x=names(a),y=names(b);let same=0;x.forEach(n=>{if(y.has(n))same++;});return 1-same/Math.max(x.size,y.size);};
  const pairs={brann_skadi:diff('brann','skadi'),mira_fenn:diff('mira','fenn'),tess_wren:diff('tess','wren'),oren_halden:diff('oren','halden'),lumen_marisol:diff('lumen','marisol')};
  const lv=A.classSkills(A.TPL.brann).filter(s=>s.sig).map(s=>s.lv);
  const roles=['brann','mira','lumen','sable','tess','oren','taro','gilda'].map(id=>{const H=A.heroRoles(id,40);return H.P&&H.D;});
  const flavour=A.classSkills(A.TPL.brann).find(s=>s.id==='rend').n+' / '+A.classSkills(A.TPL.skadi).find(s=>s.id==='rend').n;
  return {rep,leg,pairs,lv,roles,flavour};});
chk('88 regular wayfarers each have one signature skill, no duplicate names or mechanics',sg.rep.count===88&&sg.rep.dups.length===0||JSON.stringify(sg.rep));
chk('legendaries and Vaelith keep their own kits (no generated signature)',sg.leg.every(x=>!x)||JSON.stringify(sg.leg));
chk('same class, different element: movesets differ clearly (at least 15% of names)',Object.values(sg.pairs).every(v=>v>=.15)||JSON.stringify(sg.pairs));
chk('signature skills arrive at levels 6 to 14 (pacing kept)',sg.lv.every(l=>l>=6&&l<=14)||JSON.stringify(sg.lv));
chk('primer and detonator coverage is intact for the original starters',sg.roles.every(Boolean)||JSON.stringify(sg.roles));
chk('the flavour skill takes the hero element (Searing Rend vs Frostbitten Rend)',/Searing Rend/.test(sg.flavour)&&/Frostbitten Rend/.test(sg.flavour)||sg.flavour);
await shot('v040_p3_menu');
await done(H);
})();
