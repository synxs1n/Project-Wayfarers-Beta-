// ===== roster17.js (battle pass 17): the owner's playtest notes after 0.21.6 on summons, the Summons menu, kits of 14 and the mages' Mantle =====
// 1) "Monks can summon bosses too under the same rules as guardians before": the Monk's Spirit Call is back exactly as summon8.js built it (from level
//    SUM.monkLv 10, two turns of stillness, a lesser guardian at SUM.lesser .6 of a Priest's for SUM.lesserTurns 3 turns in the Monk's own place; on top
//    of the 0.21.4 guardian tune). Recruited bosses (the Lesser Scourges, battle16.js) answer a Monk too, under those Monk rules: level 10, boss sized and
//    in the whole Vanguard's place as 0.21.4 built it, at .6 of the power a Priest's call has, .8 of its HP and for 3 turns. So the callers of a recruited
//    boss are Nikaris, Priests and Monks (b16Caller); every other hero paired with one keeps the bonus and sees why the command is greyed.
//    After 0.22.3 (legends18, the owner: "just give monks the same summon (invoke) capabilities of priest"): no level gate and no lesser numbers. A Monk
//    Invokes a guardian as a Priest does (summon8.js SUM.call.monk: two turns of stillness, 4 turns on the field) and calls a Lesser Scourge under the
//    Priest's rules (the same power, HP and turns: battle16.js b16BossMake).
// 2) "Turn pets menu into 'summons' and have it show all summonable things you have access to": Menu > Party > Summons (the tab id 'comp' and every save
//    key stay). Sections: Pets (pairing as before), Recruited bosses (Lesser Scourges), Sanctum guardians, Beast calls (Nikaris's own skills). Every entry
//    says who in the roster can call it, and what is missing when nobody can (r17Summons).
// 3) "all characters should have 2 skills no other character has, we can add this into the total skills to make it 14 ... spread out through levels":
//    every wayfarer's kit is 14 class skills (the 12 of skills12.js / kits12.js plus two, R17.add). The two come from: the mages' Mantle (item 4); a skill
//    of the class's full list that the cap of 12 had dropped (a "*" marks one that only this wayfarer has: it had it before 0.19.0 and lost it); or a new
//    skill written for the hero (R17.sk, id s2_<hero>) where the hero had only its signature left. Every wayfarer ends with at least two skills nobody
//    else has. Learn levels (R17.lv): 1, 1, 6, then single learns from 11 to 45 no more than 4 levels apart; exactly three known at level 10. The
//    signature sits at level 18 (R17.slot.mid) and the second skill of the hero's own at 38 (R17.slot.late); the rest keep their order.
//    Old saves: G.m14lv 3 (the 0.21.4 levels, kept on every skill as s.lvR) becomes 4; a hero keeps every skill it knew (c.keep). New skills a loaded
//    hero already has the level for are marked New on the sheet without a queue of notices.
// 4) "a skill to mages that make damage they take get taken from mp instead of hp": Wellspring Mantle, a class skill of the Mage, the Archmage and the
//    Chronicler (R17.mantle.cls: the three robe casters). While the status Mantle lasts (4 of the caster's turns) R17.mantle.share (80%) of every point
//    of damage the caster takes (hits, poison, burn, bleed, weather, boss gimmicks) is paid in MP at R17.mantle.per MP a point; what MP cannot cover goes
//    to HP, and the Mantle falls when MP reaches 0. Foe intents and the Guard cue show the HP part (c5Est). Auto battle only raises it when hurt and
//    with MP to spare (R17.mantle.autoHp, autoMp).
// Test: tools/chrome/v191a.js.
const R17={lv:[1,1,6,11,14,18,21,25,28,31,35,38,42,45],slot:{mid:5,late:11},
  mantle:{id:'mantle',n:'Wellspring Mantle',st:'mantle',cls:['mage','archmage','chronicler'],share:.8,per:1,turns:4,mp:8,key:10,autoHp:.7,autoMp:.4},
  // the two skills each wayfarer gains: '@shield' the Mantle, '@new' the hero's own new skill (R17.sk), else the id of a skill of the class's full list
  // that the cap of 12 dropped; '*' in front: only this wayfarer has it (a lost original), and it takes the late slot
  add:{brann:['warbrand','r_stance'],mira:['@shield','@new'],sable:['fan','dart'],tess:['@new','rain'],oren:['@new','rally'],lumen:['*halo','sanct'],
  kael:['warbrand','r_stance'],pip:['fan','dart'],wren:['@new','rain'],gilda:['@new','refrain'],fenn:['@shield','@new'],halden:['rally','consec'],
  pomona:['*halo','sanct'],taro:['whirl','stunb'],cass:['warbrand','r_stance'],shen:['whirl','stunb'],alder:['@new','halo'],rook:['warbrand','r_stance'],
  marisol:['@new','halo'],vael:['@shield','@new'],corwin:['rally','consec'],kit:['fan','dart'],frey:['*rain','pin'],jun:['*whirl','stunb'],
  lark:['@new','refrain'],sorrel:['@shield','@new'],sylva:['rain','pin'],gorm:['stunb','iron'],dagna:['r_stance','r_sunder'],zephra:['refrain','r_aria'],
  astra:['@shield','@new'],ember:['@shield','@new'],vex:['dart','r_kunai'],isolde:['halo','sanct'],nyx:['dart','r_kunai'],ciro:['rain','pin'],
  borga:['*rend','warbrand'],kessa:['r_stance','r_sunder'],solenne:['r_stance','r_sunder'],deryn:['@new','rally'],ignar:['rally','consec'],isak:['rally','r_banner'],
  lorcan:['rally','r_banner'],maelis:['rally','r_banner'],zia:['@shield','@new'],cyrene:['@shield','@new'],brigid:['*halo','sanct'],verbena:['halo','sanct'],
  hollis:['halo','sanct'],tamsin:['*fan','dart'],nettle:['*fan','dart'],lysa:['dart','r_kunai'],ashwin:['@new','rain'],voss:['*rain','pin'],
  skerry:['rain','pin'],dorn:['whirl','stunb'],hana:['*whirl','stunb'],kori:['stunb','iron'],senna:['stunb','r_harmony'],brook:['*refrain','r_aria'],
  dell:['*refrain','r_aria'],riff:['*refrain','r_aria'],mourne:['*refrain','r_aria'],cadence:['@new','refrain'],prisma:['refrain','r_aria'],kaevan:['squall','@new'],
  nikaris:['bramble','@new'],jaeson:['@shield','lattice'],vaelith:['@shield','livescript'],tarn:['warbrand','r_stance'],skadi:['warbrand','r_stance'],gideon:['warbrand','r_stance'],
  terrin:['@shield','@new'],aella:['@shield','@new'],lucan:['@shield','@new'],drift:['*fan','dart'],sleet:['*fan','dart'],glint:['*fan','dart'],
  rill:['*rain','r_flare'],corvin:['*rain','pin'],helia:['*rain','pin'],thane:['rally','consec'],galen:['rally','consec'],vesper:['@new','rally'],
  noelle:['*halo','sanct'],ione:['*halo','sanct'],ombra:['@new','halo'],carol:['@new','refrain'],aria:['*refrain','r_aria'],mizu:['*whirl','stunb'],
  kage:['*whirl','stunb'],kiyo:['*whirl','stunb']},
  // the new skills, one per wayfarer that had only its signature left (and the 14th of the two legends without a spare): the usual skill fields
  // (skills.js), el 1 = the hero's first element, 2 = both of a dual type; lv is only read for a legend (its place in the order)
  sk:{
   tess:{n:'Express Delivery',k:'phys',pw:2.4,mp:12,cost:.8,crit:.2,el:1,d:'Sent by the fastest route: a quick Wind shot, a likely critical.'},
   oren:{n:'Portcullis',k:'phys',pw:2.2,mp:13,el:1,fx:[['stun',.45]],self:[['bulwark',1]],d:'Drops the gate on one foe. May Stun; he gains Bulwark.'},
   wren:{n:'Greenwood Ambush',k:'phys',t:'rand',hits:4,pw:.75,mp:14,el:1,fx:[['slow',.3]],d:'Four arrows out of the undergrowth at random foes. May Slow.'},
   gilda:{n:'Last Call',k:'mag',t:'all',pw:1.25,mp:16,el:1,fx:[['burn',.6]],d:'Bellows the closing chorus and the room catches. Hits every foe; likely Burns.'},
   alder:{n:'Kettle Cure',k:'heal',t:'allyAll',pw:.9,mp:16,cleanse:1,fx:[['regen',1]],d:'A pot of something strong for everyone: heals and cures the vanguard and grants Regen.'},
   marisol:{n:"Surgeon's Knot",k:'heal',t:'ally',pw:2.6,mp:12,cleanse:1,fx:[['bulwark',1]],d:'Closes one ally up for good: a strong heal that cures ailments and grants Bulwark.'},
   lark:{n:'Dawn Chorus',k:'heal',t:'allyAll',pw:1,mp:15,fx:[['focus',1]],d:'Every bird at once. Heals the vanguard and grants Focus.'},
   deryn:{n:'Breakwater',k:'status',t:'allyAll',mp:15,fx:[['regen',1],['bulwark',1]],d:'Stands where the waves break: Regen and Bulwark for the vanguard.'},
   ashwin:{n:'Grassfire',k:'phys',t:'all',pw:1.15,mp:14,el:1,fx:[['burn',.6]],d:'Sets the whole field alight. Hits every foe; likely Burns.'},
   cadence:{n:'Fireworks Finale',k:'mag',t:'rand',hits:5,pw:.62,mp:18,el:2,fx:[['burn',.3]],d:'Five rockets at random foes, Fire and Lightning. May Burn.'},
   vesper:{n:'Midnight Vigil',k:'status',t:'self',mp:12,fx:[['taunt',1],['ward',1],['regen',1]],d:'Stands the dark hours alone: Taunt, Ward and Regen.'},
   ombra:{n:'Grave Tithe',k:'mag',pw:2.1,mp:13,el:1,drain:.4,fx:[['weaken',.5]],d:'Collects what the dead are owed: Shadow damage, and she heals for 40% of it. May Weaken.'},
   carol:{n:'Sleighbell Round',k:'mag',t:'all',pw:1.2,mp:15,el:1,fx:[['slow',.6]],d:'A round that keeps coming back, colder each time. Hits every foe; likely Slows.'},
   mira:{n:'Ebb and Flow',k:'mag',pw:2.2,mp:14,el:1,drain:.35,d:'Pulls the tide out of one foe and into herself: she heals for 35% of the damage.'},
   fenn:{n:'Catalogue of Snow',k:'mag',t:'rand',hits:6,pw:.55,mp:18,el:1,fx:[['slow',.25]],d:'Six filed snowflakes at random foes. May Slow.'},
   vael:{n:'Event Horizon',k:'mag',pw:2.5,mp:18,el:1,execute:.35,fx:[['blind',.5]],d:'Nothing gets back out. Double damage below 35% HP; may Blind.'},
   sorrel:{n:'Every Candle',k:'mag',t:'all',pw:1.3,mp:17,el:1,fx:[['burn',.7]],d:'All of them, at once. Hits every foe; likely Burns.'},
   astra:{n:'Totality',k:'mag',t:'all',pw:1.25,mp:18,el:2,strip:1,d:'The sky goes dark at noon: Light and Shadow on every foe, and their boons are stripped.'},
   ember:{n:'Unfinished Sentence',k:'mag',pw:1.9,mp:12,cost:.6,el:2,d:'Cast before she is done saying it: a Fire and Lightning bolt, and her next turn comes sooner.'},
   zia:{n:'Forecast: Lightning',k:'mag',pw:2.6,mp:16,el:1,pierce:1,d:'She called it. One bolt straight down that ignores half of the foe\'s resistance.'},
   cyrene:{n:'Cold Front',k:'mag',t:'all',pw:1.2,mp:17,el:2,fx:[['slow',.5],['weaken',.4]],d:'A whole weather system moves in. Hits every foe; may Slow and Weaken.'},
   terrin:{n:'Less Nicely',k:'mag',pw:2.6,mp:16,el:1,fx:[['stun',.45]],d:'He asked the stones nicely first. One heavy Earth blow; may Stun.'},
   aella:{n:'Planned Downpour',k:'mag',t:'all',pw:1.15,mp:15,el:1,fx:[['blind',.5]],allyFx:[['haste',1]],d:'Exactly on schedule. Hits every foe, may Blind; the vanguard gains Haste.'},
   lucan:{n:'Parallax',k:'mag',pw:2.3,mp:14,el:1,crit:.3,d:'One star seen from two places: a Light strike with a high critical chance.'},
   kaevan:{n:'Feigned Retreat',k:'phys',pw:2,mp:10,cost:.6,el:'lightning',self:[['haste',1]],lv:30,d:'Wheels away, turns in the saddle and shoots: a fast Lightning bolt that leaves him Hasted.'},
   nikaris:{n:'Call Boar',k:'phys',pw:1.9,mp:9,fx:[['break',.6]],lv:30,d:'His boar puts its head down and runs. Likely Breaks.'}},
  perf:0,rng:null,C:{},audit:{}};
const r17Mage=t=>!!t&&R17.mantle.cls.includes(t.cls);

// ---------- 1. Monks call guardians (Invoke) and recruited bosses again ----------
const r17Monk=a=>{try{const t=a&&TPL[a.id];return !!t&&!t.mon&&t.cls==='monk'&&a.id!=='nikaris';}catch(e){return false;}};
const r17MonkOk=a=>r17Monk(a);// (no level gate after 0.22.3: a Monk calls whenever a Priest could)
// the Monk's Invoke as summon8.js defines it (battle16.js had removed it)
{const sc0=sumClassOf;sumClassOf=function(a){const k=sc0.apply(this,arguments);if(k)return k;
  try{if(a&&B&&a.side==='p'&&!a.isComp&&!a.isSum&&r17MonkOk(a))return 'monk';}catch(e){}return k;};}
// a Lesser Scourge answers Nikaris, a Priest, or a Monk (under the Priest's rules: b16BossMake as it is)
{const bc0=b16Caller;b16Caller=function(a){return bc0.apply(this,arguments)||r17MonkOk(a);};}

// ---------- 4. the Mantle (before the kits: they hold the skill) ----------
try{STS[R17.mantle.st]={n:'Mantle',a:'MTL',t:R17.mantle.turns+1,c:'#6fb4ff',d:`${Math.round(R17.mantle.share*100)}% of damage taken is paid in MP instead of HP. Ends when MP runs out.`};
  if(typeof FK_SH!=='undefined')FK_SH[R17.mantle.st]='waves';// the status shape on the stage (fxkind11.js): rising waves in the Mantle's blue
  if(typeof ST_SYM!=='undefined')ST_SYM[R17.mantle.st]='<path d="M5 .5 8.9 2.75v4.5L5 9.5 1.1 7.25v-4.5Zm0 2.3L3.1 3.95v2.1L5 7.2l1.9-1.15v-2.1Z"/>';}catch(e){}
function r17MantleSk(){const M=R17.mantle;return {id:M.id,n:M.n,k:'status',t:'self',mp:M.mp,cost:1,hits:1,el:null,fx:[[M.st,1]],rl:'magic',r17:'mantle',lv:M.key,lv0:M.key,
  d:`A second skin of raw mana: for ${M.turns} turns ${Math.round(M.share*100)}% of the damage taken is paid in MP instead of HP (${M.per===1?'1 MP a point':(+(1/M.per).toFixed(1))+' damage per MP'}). Ends when MP runs out.`};}
const r17Has=u=>!!(u&&u.st&&u.st[R17.mantle.st]&&!u.st[R17.mantle.st].fake);
// how much of d the Mantle would take from MP (no side effects)
function r17Share(t,d){const M=R17.mantle;if(!r17Has(t)||t.side!=='p'||!(d>0)||!(t.mp>0))return 0;return Math.max(0,Math.min(Math.floor(d*M.share),Math.floor(t.mp/M.per)));}
// a real hit of d on t: the Mantle's share leaves MP; returns what is left for HP
function r17Soak(t,d){try{const take=r17Share(t,d);if(take<=0)return d;const M=R17.mantle,cost=Math.ceil(take*M.per);t.mp=Math.max(0,t.mp-cost);
    fx(t,'-'+cost+' MP','stat');log(`${t.name}'s Mantle takes ${take} of it (${cost} MP).`);if(B)B.r17soak=(B.r17soak||0)+take;
    if(t.mp<=0){delete t.st[M.st];fx(t,'Mantle falls','stat bad');log(`${t.name} is out of MP: the Mantle falls.`);}
    return d-take;}catch(e){return d;}}
// direct hits: perform calls calcDamage once for every blow that lands (previews call it with RNG swapped, or outside perform)
HOOK.wrap('perform','roster17','marks a real action (the Mantle only answers real blows)',function(next,...args){
  try{const a=args[0],f=a&&a.st&&a.st[R17.mantle.st];if(f&&f.fake)delete a.st[R17.mantle.st];}catch(e){}
  const r0=R17.rng;R17.perf++;R17.rng=RNG;try{return next(...args);}finally{R17.perf--;R17.rng=r0;}});
HOOK.wrap('calcDamage','roster17','Mantle: most of a blow on the caster is paid in MP',function(next,...args){const r=next(...args);
  try{const sk=args[1],t=args[2];if(r&&r.dmg>0&&R17.perf>0&&RNG===R17.rng&&t&&t.side==='p'&&(!sk||sk.id!=='b4est')&&r17Has(t))r.dmg=r17Soak(t,r.dmg);}catch(e){}return r;});
// everything else that hurts (poison, burn, bleed, reflected and gimmick damage, lightning) goes through hurt()
{const h0=hurt;hurt=function(t,d){return h0.call(this,t,r17Has(t)?r17Soak(t,d):d);};}
// previews of a foe's planned hit (the Guard cue, intents) show what HP will lose
{const ce0=c5Est;c5Est=function(u,sk,t){const d=ce0.apply(this,arguments);try{return d-r17Share(t,d);}catch(e){return d;}};}
// auto battle: only when hurt, with MP to spare (the smart auto casts any self boon it lacks on a coin; a stand-in status closes that door)
function r17AutoWants(a){const M=R17.mantle;try{return a.hp/a.S.mhp<M.autoHp&&a.mp/a.S.mmp>=M.autoMp;}catch(e){return false;}}
{const as0=autoTurnSmart;autoTurnSmart=function(){const a=B&&B.cur,k=R17.mantle.st;let fake=false;
  try{if(a&&a.st&&!a.st[k]&&r17Mage(TPL[a.id])&&!r17AutoWants(a)){a.st[k]={t:99,fake:1};fake=true;}}catch(e){}
  try{return as0.apply(this,arguments);}finally{try{if(fake&&a.st&&a.st[k]&&a.st[k].fake)delete a.st[k];}catch(e){}}};}
HOOK.before('render','roster17','no stand-in status is ever drawn',function(){try{if(B)allParty().forEach(c=>{const f=c&&c.st&&c.st[R17.mantle.st];if(f&&f.fake)delete c.st[R17.mantle.st];});}catch(e){}});

// ---------- 3. kits of 14 ----------
function r17New(t){const o=R17.sk[t.id];if(!o)return null;const el=o.el===1?t.el[0]:o.el===2?(t.el.length>1?t.el.slice():t.el[0]):(o.el||null);
  const s=Object.assign({cost:1,hits:1,t:'one',mp:0},o,{id:'s2_'+t.id,el,own:1,lv:o.lv||40,lv0:o.lv||40});
  try{if((s.k==='phys'||s.k==='mag')&&typeof dlFor==='function'){const d=dlFor(t.cls,s);if(d)s.dl=d;}}catch(e){}return s;}
const r17Key=s=>s.lv12!=null?s.lv12:s.lvK!=null?s.lvK:s.lv;
function r17Kit(t,L){const add=R17.add[t.id];if(!add||!L||L.length<3)return L;
  const full=(typeof S12FULL!=='undefined'&&S12FULL[t.id])||L,out=L.slice(),legend=t.src==='L'||t.src==='x';let late=null;
  L.forEach(s=>{if(s.lvR==null)s.lvR=s.lv;});
  add.forEach(a=>{const star=a[0]==='*',id=star?a.slice(1):a;let s=null;
    if(id==='@shield')s=r17MantleSk();else if(id==='@new')s=r17New(t);else s=full.find(x=>x.id===id);
    if(!s||out.some(x=>x.id===s.id))return;if(s.lvK==null)s.lvK=s.lv;s.r17a=1;out.push(s);
    if(!legend&&!late&&(id==='@new'||star)){late=s;s.own=1;}});
  out.sort((a,b)=>r17Key(a)-r17Key(b)||(a.lv0||0)-(b.lv0||0));
  const sig=legend?null:out.find(s=>s.id==='sg_'+t.id);
  let O=out.filter(s=>s!==sig&&s!==late);
  if(sig)O.splice(Math.min(R17.slot.mid,O.length),0,sig);
  if(late)O.splice(Math.min(R17.slot.late,O.length),0,late);
  O.forEach((s,i)=>{s.lv=R17.lv[Math.min(i,R17.lv.length-1)];});
  [sig,late].forEach(s=>{if(s&&!s.r17d){s.r17d=1;s.own=1;s.d=(s.d||'')+` Only ${t.n} has this skill.`;}});
  R17.audit[t.id]={n:O.length,sig:sig?sig.id:null,late:late?late.id:null};
  return O;}
HOOK.xform('classSkills','roster17','kits of 14: two more skills each (the Mantle, a restored skill, a new one), the signature at 18 and the second own skill at 38',function(L,t){
  if(!L||!t||t.mon||t.summon||!CLS[t.cls]||!R17.add[t.id])return L;const c=R17.C[t.id];if(c&&c.L===L&&c.n===L.length)return c.out;
  let out=L;try{out=r17Kit(t,L);}catch(e){console.error('roster17 kit',t.id,e);out=L;}R17.C[t.id]={L,n:L.length,out};return out;});
// old saves: what the 0.21.4 levels (lvR) gave stays known; the new skills a hero has the level for are marked New, without a queue of notices
{const mk0=m14Keep;m14Keep=function(g){if(!g||g.daily)return mk0.apply(this,arguments);if(g.m14lv>=4)return 0;let n=0;
  if(g.m14lv===3){Object.keys(g.roster||{}).forEach(id=>{const c=g.roster[id],t=TPL[id];if(!c||!t||t.mon||!CLS[t.cls])return;
      classSkills(t).forEach(s=>{if(s.lvR!=null&&s.lvR<=c.lv&&s.lv>c.lv&&!(c.keep&&c.keep.includes(s.id))){c.keep=(c.keep||[]).concat(s.id);n++;}});});}
  else n=mk0.apply(this,arguments);
  try{let k=0;Object.keys(g.roster||{}).forEach(id=>{const c=g.roster[id],t=TPL[id],seen=g.skSeen&&g.skSeen[id];if(!c||!t||t.mon||!CLS[t.cls]||!seen)return;
      const nw=classSkills(t).filter(s=>s.r17a&&skillKnown(c,s)&&!seen.includes(s.id)).map(s=>s.id);if(!nw.length)return;
      g.skSeen[id]=seen.concat(nw);g.skNew=g.skNew||{};g.skNew[id]=(g.skNew[id]||[]).concat(nw.filter(x=>!(g.skNew[id]||[]).includes(x)));k+=nw.length;});
    if(k)g.r17msg='Kits hold 14 skills now: every wayfarer gains two (one of them nobody else has). New ones are marked on the hero sheets.';}catch(e){}
  g.m14lv=4;return n;};}
HOOK.after('newGame','roster17','a new journey uses the 14 skill levels',function(){try{if(G)G.m14lv=4;}catch(e){}});
HOOK.after('render','roster17','one notice after an old save gains the two skills',function(){try{if(G&&G.r17msg&&V.screen!=='title'){const m=G.r17msg;delete G.r17msg;toast(m);}}catch(e){}});
// the measure the owner asked for: per wayfarer, the skills of the kit no other wayfarer has (by name)
function r17Unique(){const ids=Object.keys(TPL).filter(id=>{const t=TPL[id];return !t.mon&&!t.summon&&CLS[t.cls];}),by={},out={};
  ids.forEach(id=>classSkills(TPL[id]).forEach(s=>{(by[s.n]=by[s.n]||[]).push(id);}));
  ids.forEach(id=>{const K=classSkills(TPL[id]);out[id]={n:K.length,lv:K.map(s=>s.lv).sort((a,b)=>a-b),own:K.filter(s=>by[s.n].length===1).map(s=>({id:s.id,n:s.n,lv:s.lv}))};});return out;}

// ---------- 2. the Summons menu ----------
try{MENU_SUB.comp='Summons';}catch(e){}
function r17Callers(){const R=Object.values((G&&G.roster)||{}).filter(c=>c&&TPL[c.id]&&!TPL[c.id].mon),inSix=c=>(G.party||[]).includes(c.id);
  const srt=L=>L.slice().sort((a,b)=>inSix(b)-inSix(a)||b.lv-a.lv);
  return {R,inSix,full:srt(R.filter(c=>c.id==='nikaris'||TPL[c.id].cls==='healer')),monk:srt(R.filter(c=>r17MonkOk(c)))};}
function r17Names(L,C){return L.map(c=>`<b>${esc(c.name)}</b>${C.inSix(c)?'':' (not in your six)'}`).join(', ');}
function r17Who(parts,why){return `<small class="r17who ${parts.length?'':'no'}">${parts.length?'Who can call it: '+parts.join('; ')+'.':'Nobody can call it yet: '+why}</small>`;}
function r17PetRow(o,C){const d=compDef(o),h=o.with&&G.roster[o.with];let who;
  if(d.lost)who=r17Who([],'its kind is unknown in this journey.');
  else if(o.scourge){const ok=h&&b16Caller(h),able=C.full.concat(C.monk).filter(c=>c!==h);
    who=ok?r17Who([`<b>${esc(h.name)}</b>: Summon, once per battle (${COMP_TURNS+1} turns), in the whole Vanguard's place`],'')
      :r17Who([],(h?`${esc(h.name)} keeps its bonus but cannot call a recruited boss. `:'it is not paired. ')+(able.length?`Pair it with ${r17Names(able,C)}.`:`It needs Nikaris, a Priest or a Monk.`));}
  else who=h?r17Who([`<b>${esc(h.name)}</b>: Summon, once per battle (${o.bb?COMP_TURNS+1:COMP_TURNS} turns, in ${esc(h.name)}'s place)`],''):r17Who([],'pair it with any hero, who can then Summon it.');
  return `<div class="row comprow"><img class="mimg" src="${monURL(d.art)}" alt=""><div class="grow"><b>${esc(o.name)}</b>${o.bb?' <em class="cyc">Beastbond</em>':''}${o.scourge?' <em class="cyc legb">Lesser Scourge</em>':''}<small>${d.el.map(ico).join('')} ${esc(d.n)} · ${(d.sk||[]).map(s=>esc(s[0])).join(', ')}</small><small class="up">${compBonusText(o)}</small><small>${h?`With <b>${esc(h.name)}</b>`:'Not paired'}</small>${who}</div><button class="btn sm" data-act="compPick" data-arg="${o.id}">${h?'Change':'Pair'}</button></div>`;}
function r17GuardRow(o,C){const m=MON[o.mon]||{};const parts=[];
  const P=sumCallOf('priest'),M=sumCallOf('monk');
  if(C.full.length)parts.push(`${r17Names(C.full,C)}: Invoke (a turn of prayer, then ${P.turns} turns in the whole Vanguard's place)`);
  if(C.monk.length)parts.push(`${r17Names(C.monk,C)}: Invoke (${M.pray} turns of stillness, then ${M.turns} turns in the whole Vanguard's place)`);
  const why=`it needs a Priest, Nikaris or a Monk to Invoke it.`;
  return `<div class="row comprow r17guard">${m.art?`<img class="mimg" src="${monURL(m.art)}" alt="">`:''}<div class="grow"><b>${esc(o.name)}</b> <em class="cyc legb">Guardian</em><small>${(m.el||[]).map(ico).join('')} ${(m.sk||[]).map(s=>esc(s[0])).join(', ')}</small>${r17Who(parts,why)}</div></div>`;}
function r17Summons(){const L=G.tamed||[],C=r17Callers(),pets=L.filter(o=>!o.scourge),boss=L.filter(o=>o.scourge),gs=typeof sumList==='function'?sumList():[],nik=G.roster&&G.roster.nikaris;
  const sec=(t,n,body,empty)=>`<h4 class="r17h">${t}${n!=null?` <small>${n}</small>`:''}</h4>${body?`<div class="rows">${body}</div>`:`<p class="note">${empty}</p>`}`;
  let h=`<p class="note">Everything your party can call into battle. Tamed creatures pair with one hero for a small bonus (+${Math.round(COMP_BONUS.base*100)}% HP, ATK, MAG, DEF and RES; Beastbond ${Math.round(COMP_BONUS.bb*100)}%, Lesser Scourges ${Math.round(COMP_BONUS.scourge*100)}%) and +10% damage with their element. Taming: ${L.length} of 8.</p>`;
  h+=sec('Pets',pets.length,pets.map(o=>r17PetRow(o,C)).join(''),'No pets yet. Beat an elite bounty and spare it, or travel with Nikaris. A paired hero can Summon its pet once per battle.');
  h+=sec('Recruited bosses',boss.length,boss.map(o=>r17PetRow(o,C)).join(''),`No Lesser Scourge follows you yet. With Nikaris in the fight a beaten Scourge may ask to join. ${B16.note}`);
  h+=sec('Sanctum guardians',gs.length,gs.map(o=>r17GuardRow(o,C)).join(''),'No guardian is bound to you yet. Beat the guardian at the end of a Sanctum and it answers a Priest, Nikaris, or a Monk.');
  if(nik){const ks=classSkills(TPL.nikaris).filter(s=>/^(hawk|wolf|pack|s2_nikaris)$/.test(s.id));
    h+=sec('Beast calls',ks.length,ks.map(s=>`<div class="row comprow r17beast"><div class="grow"><b>${esc(s.n)}</b><small>${esc(s.d||'')}</small>${skillKnown(nik,s)?r17Who([`<b>${esc(nik.name)}</b>: a skill of his own (${s.mp} MP), every turn he likes`],''):r17Who([],`${esc(nik.name)} learns it at level ${s.lv}.`)}</div></div>`).join(''),'');}
  return h;}
{const vc0=vCompanions;vCompanions=function(){try{if(G&&!G.daily)return r17Summons();}catch(e){console.error('roster17 summons',e);}return vc0.apply(this,arguments);};}
try{const st=document.createElement('style');st.textContent='.r17who{display:block;color:#bfe6c8}.r17who.no{color:#ffc9a8}.r17h{margin:.8em 0 .3em}.r17h small{opacity:.7;font-weight:400;margin-left:.3em}';document.head.appendChild(st);}catch(e){}

// tests
try{window.__R17={R17,unique:r17Unique,keep:g=>m14Keep(g),kit:id=>classSkills(TPL[id]),soak:r17Soak,share:r17Share,has:r17Has,monkOk:r17MonkOk,summons:()=>r17Summons(),autoWants:r17AutoWants,get G(){return G;},get B(){return B;}};}catch(e){}
