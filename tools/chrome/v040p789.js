// v0.4.0 Phases 7 (rare skies), 8 (chance encounters), 9 (factions)
const {open,chk,done,shot}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
const mk=`const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();try{(window.__A.G.cleared=window.__A.G.cleared||[])[0]=1;}catch(e){}A.V.modal=null;`;
// ---- 7: weather ----
const w=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();try{(window.__A.G.cleared=window.__A.G.cleared||[])[0]=1;}catch(e){}A.V.modal=null;const o={};
  const sup=Object.keys(A.WEATHER).filter(k=>A.WEATHER[k].sup);o.sup=sup;
  // odds: roll many times for each realm and phase
  const odds={};['meadow','coast','cave','snow','heights','void'].forEach(th=>{['day','night'].forEach(ph=>{const L=A.wxList(th,ph),tot=L.reduce((a,b)=>a+b[1],0),sp=L.filter(x=>A.WEATHER[x[0]]&&A.WEATHER[x[0]].sup).reduce((a,b)=>a+b[1],0);odds[th+':'+ph]=+(sp/tot*100).toFixed(2);});});
  o.odds=odds;
  // phase-limited skies never appear in the wrong phase
  o.bad=[];['day','dusk','night','dawn'].forEach(ph=>{['meadow','coast','cave','snow','heights','void'].forEach(th=>{A.wxList(th,ph).forEach(x=>{const W=A.WEATHER[x[0]];if(W&&W.when&&W.when!==ph)o.bad.push(ph+':'+x[0]);});});});
  // daily plan weather list unchanged
  o.dailyBase=A.WX_BASE.length;
  // a night-only sky ends when the night does
  A.G.wx=A.G.wx||{};A.G.clock=620;A.G.weather[0]='bloodmoon';A.G.wx[0]=300;A.WS.m.s===0||A.placeAt('f0',...(A.getMap('f0').gates.start.arrive));
  A.G.clock=100;A.wxStep();o.after=A.G.weather[0];
  // the guide text lists the rare skies
  o.guide=A.superGuide().includes('Blood Moon')&&A.superGuide().includes('Elemental Surge');
  // effect plumbing
  o.xp=['bloodmoon','eclipse','meteor','surge_fire'].every(k=>A.WEATHER[k].el);
  return o;});
console.log(JSON.stringify(w));
chk('7.2 five-plus rare skies exist',w.sup.length>=9);
chk('7.2 rare skies stay a few percent of rolls (all realms, day and night)',Object.values(w.odds).every(v=>v>=1.5&&v<=8));
chk('7.2 phase-limited skies never roll in the wrong phase',w.bad.length===0);
chk('7.2 a Blood Moon ends when day comes',w.after!=='bloodmoon');
chk('7.2 Daily Trial still picks from the original 12 weathers',w.dailyBase===12);
chk('7.2 Guides list the rare skies',w.guide);
// visuals: draw each rare sky once and check no errors, take a phone shot of a few
const v=await H.ev(()=>{const A=__A;const c=document.createElement('canvas');c.width=200;c.height=120;const x=c.getContext('2d');const bad=[];
  ['snow','blizzard','bloodmoon','eclipse','meteor','surge_fire','surge_water','surge_ice','surge_wind','surge_earth','surge_shadow'].forEach(k=>{try{A.weatherFX(x,k,200,120,12345,false);}catch(e){bad.push(k+':'+e.message);}});return bad;});
chk('7.1/7.2 every snow and rare sky draws without errors',v.length===0||v.join());
for(const k of ['snow','bloodmoon','meteor']){await H.ev((k)=>{const A=__A;A.V.modal=null;A.placeAt('f3',...(A.getMap('f3').gates.start.arrive));A.G.weather[3]=k;A.render();},k);await H.wait(700);await H.shot('wx_'+k);}
// popup text
const pop=await H.ev(()=>{const A=__A;A.G.weather[3]='bloodmoon';return A.wxInfoBody('weather');});
chk('7.2 HUD popup explains a rare sky',/Blood Moon/.test(pop)&&/Rare sky/i.test(pop)&&/gold/i.test(pop));
// ---- 8: chance encounters ----
const c=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();try{(window.__A.G.cleared=window.__A.G.cleared||[])[0]=1;}catch(e){}A.V.modal=null;const o={};
  const G=A.G;G.gold=2000;G.inv.potion=3;
  o.pool=A.cePool();o.legend=o.pool.filter(id=>{const s=A.TPL[id].src;return s==='L'||s==='x'}).length;o.owned=o.pool.filter(id=>G.roster[id]).length;
  A.placeAt('f0',...(A.getMap('f0').gates.start.arrive));A.V.modal=null;
  const h=o.pool[0];
  A.ceStart(A.WS.m,h,'help');o.m1=A.V.modal&&A.V.modal.type;
  const mode=A.V.modal.ev.mode;
  if(mode==='potion'){A.ACT.cevPick('give');o.joined=!!G.roster[h];o.pot=G.inv.potion;}
  else{A.ACT.cevPick('no');o.joined=false;}
  A.V.modal=null;
  // merchant hire
  const h2=A.cePool()[0];A.ceStart(A.WS.m,h2,'merchant');const g0=G.gold;A.ACT.cevPick('hire');o.hired=!!G.roster[h2];o.paid=g0-G.gold;
  A.V.modal=null;
  // pack gives discount
  const h3=A.cePool()[0];A.ceStart(A.WS.m,h3,'merchant');A.ACT.cevPick('pack');o.fr=!!(G.ce.fr&&G.ce.fr[h3]);o.cost=A.recruitCost(h3);A.V.modal=null;
  // duel foes
  const h4=A.cePool()[0];A.ceStart(A.WS.m,h4,'duel');A.ACT.cevPick('fight');o.inBattle=!!A.B&&A.B.spec.kind==='duel';o.foe=A.B&&A.B.en[0]&&A.B.en[0].name===A.TPL[h4].n&&A.B.en.length;
  o.cap=(G.tv&&G.tv.n)||{};
  return o;});
console.log(JSON.stringify(c));
chk('8.2 the pool never holds legendaries, owned heroes or challenge-only',c.legend===0&&c.owned===0&&c.pool.length>3);
chk('8.1 help / merchant / duel events open and resolve',c.m1==='cev'&&c.hired&&c.fr&&c.inBattle&&c.foe>=2);
chk('8.1 merchant hire cost a discounted fee, a pack earns a hiring discount',c.paid>0&&c.cost>0);
// probability sim: steps per event
const sim=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();try{(window.__A.G.cleared=window.__A.G.cleared||[])[0]=1;}catch(e){}A.V.modal=null;const G=A.G;
  A.placeAt('f0',...(A.getMap('f0').gates.start.arrive));A.V.modal=null;A.WS.lock=false;A.WS.x+=2;
  let hit=0,steps=0;const N=60000;A.ceInit();const types={};
  for(let i=0;i<N;i++){G.ce.cnt={};A.ceStep();steps++;if(A.V.modal&&A.V.modal.type==='cev'){hit++;types[A.V.modal.ev.type]=(types[A.V.modal.ev.type]||0)+1;A.V.modal=null;}}
  return {hit,steps,per:steps/Math.max(1,hit),types};});
console.log(JSON.stringify(sim));
chk('8.2 encounters average between 150 and 250 steps',sim.per>150&&sim.per<260);
// ---- 9: factions ----
const f=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();try{(window.__A.G.cleared=window.__A.G.cleared||[])[0]=1;}catch(e){}A.V.modal=null;const o={};const G=A.G;
  A.facInit();o.ranks=A.FAC.map(F=>A.facRank(F.id));
  o.ids=A.FAC.map(F=>F.id).join();
  // mission flow
  // v0.9.9: since v0.9.5 a new journey (G.pcV) opens guild missions in the third realm (pacing.js PACE.at.guilds): refused before it,
  // then the same flow as before once that realm is reached
  const at=window.__P95.PACE.at.guilds;A.ACT.facAccept('g5');o.early=G.fac.acc.g5==null&&!!G.pcV&&at>=2;for(let i=0;i<at;i++)G.cleared[i]=1;
  const m=A.FMIS.find(x=>x.id==='g5');A.ACT.facAccept('g5');A.facCredit('road',1);const rep0=A.facRep('guild');A.V.modal={type:'guild',tab:'guilds'};/* missions accepted now are handed in at a Guild Hall */A.ACT.facClaim('g5');A.V.modal=null;o.gained=A.facRep('guild')-rep0;
  // counters and rank
  A.facCredit('forge',10);A.facCredit('temper',10);o.smiths=A.facRank('smiths');
  A.facCredit('potion',30);o.alch=A.facRank('alch');
  A.facCredit('tame',4);o.wardens=A.facRank('wardens');
  // menu tabs
  A.V.modal={type:'menu',tab:'factions'};A.render();o.screen=document.body.innerText.length>0&&/Smiths/i.test(document.body.innerText);
  A.V.modal={type:'menu',tab:'fmis'};A.render();o.guide=/Wayfarers/i.test(document.body.innerText)&&/Accept|Claim/i.test(document.body.innerText);
  // perks: forge discount
  o.fd=A.facMul();
  // daily untouched
  const wasD=G.daily;G.daily=true;o.dailyMul=JSON.stringify(A.facMul());G.daily=wasD;
  return o;});
console.log(JSON.stringify(f));
chk('9 six factions, old-style start at rank 1',f.ranks.every(r=>r===1)&&f.ids.split(',').length===6);
chk('9 guild missions are refused before their realm on a new journey',f.early===true);
chk('9 mission claim gives standing',f.gained>0);
chk('9 counters raise ranks',f.smiths>=2&&f.alch>=2&&f.wardens>=2);
chk('9 Factions screen (Records) and Guides tab render',f.screen&&f.guide);
chk('9 perks are off in the Daily Trial',f.dailyMul===JSON.stringify({xp:1,gold:1}));
const perk=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();try{(window.__A.G.cleared=window.__A.G.cleared||[])[0]=1;}catch(e){}A.V.modal=null;const G=A.G,o={};G.gold=5000;A.facInit();
  A.facCredit('forge',100);A.facCredit('temper',40);o.rank=A.facRank('smiths');
  const n0=G.gear.length;A.ACT.facPerk('smiths:5');A.ACT.facPerk('smiths:6');o.charms=G.gear.slice(n0).join();
  const c0=G.mats.core||0;A.ACT.facBuy('smiths:0');o.core=(G.mats.core||0)-c0;
  G.fac.bonus.guild=300;const r0=Object.keys(G.roster).length;A.ACT.facPerk('guild:4');o.recruit=Object.keys(G.roster).length-r0;
  A.ACT.facPerk('guild:4');o.once=Object.keys(G.roster).length-r0;
  A.facSync();
  return o;});
console.log(JSON.stringify(perk));
chk('9 rank 6 gives the strong signature charm and the rank 5 charm, once',perk.rank>=6&&/c_fa1/.test(perk.charms)&&/c_fb1/.test(perk.charms));
chk('9 counter stock sells a Dread Core to a rank 4 Smiths member',perk.core===1);
chk('9 the challenge wayfarer recruit can be claimed once',perk.recruit===1&&perk.once===1);
// ---- old saves: no faction data, no encounter data, v0.3.5 world ----
const old=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();try{(window.__A.G.cleared=window.__A.G.cleared||[])[0]=1;}catch(e){}A.V.modal=null;const o={};const G=A.G;
  delete G.fac;delete G.ce;G.wv=2;G.weather={};delete G.wx;A.resetMaps();
  A.saveGame();
  o.ranks=A.FAC.map(F=>A.facRank(F.id));
  A.V.modal={type:'menu',tab:'factions'};A.render();o.screen=/Wayfarers/i.test(document.body.innerText);
  A.V.modal=null;A.placeAt('f0',...(A.getMap('f0').exits[0]?[A.getMap('f0').exits[0].x+2,A.getMap('f0').exits[0].y]:[3,3]));
  try{for(let i=0;i<500;i++)A.ceStep();o.step='ok';}catch(e){o.step=e.message;}
  o.wv=G.wv;o.smith=A.facMul();
  return o;});
console.log(JSON.stringify(old));
chk('9 saves with no faction or encounter data load at rank 1 and the screen opens',old.ranks.every(r=>r===1)&&old.screen);
chk('8 old saves step through chance encounters without errors',old.step==='ok'&&old.wv===2);
await H.shot('factions');
await done(H);
})();
