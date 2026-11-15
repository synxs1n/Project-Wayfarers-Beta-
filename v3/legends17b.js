// ===== legends17b.js (after 0.21.8): the three first Legendaries reworked: Nikaris the Hunter, Kaevan the Sniper, Jace the Weatherwright =====
// The owner: "from a design perspective the legendaries are like upgraded versions of current classes with their special abilities ... Nick and
// Kevin are archers with unique abilities, Jason is a mage the same way". Hero ids, class keys (druid, sniper, archmage), elements, stat lines and
// signature traits do not change, so saves keep working; a reworked skill keeps its id where the role is the same. Loads last.
// 1) Kits (L17.kit): 14 skills each on roster17's levels (R17.lv: 1,1,6,11,14,18,21,25,28,31,35,38,42,45; three known at level 10), two marked the
//    hero's own. A skill the rework drops stays with every saved hero who knew it (L17.legacy, c.keep, `known`); G.l17k marks a migrated save.
//    NIKARIS  Quiver Run (four arrows at one foe), Snare Line (the one trap: Thornwhisper, Tangleroot and Bramble Prison merged at the stronger
//             numbers), Hawk's Watch (his hawk circles for three of his turns and dives after every attack his side makes), Moonless Volley as an
//             arrow rain in three falls, Split Arrow (leaps between foes). Beast calls, heals, Beastbond, Invoke, the Limit and the 0.21.4 trim stay.
//    KAEVAN   Steady Draw (a fast action: the next shot +40% and it cannot miss), Stillwind Bolt (the stopping shot: Stun and Slow; was Hobbling
//             Bolt), Longshot pierces, Shadowstorm heavier and slower, and the capstone is one bolt, Horizon Shot (pierce; against a boss it never
//             takes more than L17.kae.cap of its max HP). After 0.22.1 ("bring kevin down in line with the others"): 15% less ATK (L17.kae.atk),
//             Steady Draw +40% (was 60), Longshot 1.6 at 20 MP, Shadowstorm 4.0, Horizon Shot 5.4, the quarrels 1.4 and 1.75. Mount, Hoofbeat Charge, Parthian Shot, Feigned Retreat and the horde Limit stay.
//    JACE     (hero id jaeson; "Jace Vael, the Weatherwright") a Mage who makes weather and feeds on it:
//             - Call Thunderstorm / Call Blizzard: in battle a fast action that sets the battle's weather for L17.jace.wxTurns of his turns (then the
//               sky the fight began under returns); on the field (Field skills) they set the realm's weather for L17.jace.fieldSteps steps through
//               the game's own weather (G.weather, G.wx), shown in the weather chip. Indoors there is no sky to call, and a sky something else
//               holds still (a legend's storm, G.wxSave) cannot be moved.
//             - Storm strikes (the Thunderstorm's stray bolts, engine2.js weatherEvent): with Jace standing in the Vanguard bolts come more often
//               and one meant for an ally bends to him. A bolt that hits him does no damage: he heals L17.jace.heal of max HP and gains a stack of
//               Stormfed (+magic and +speed per stack, capped).
//             - Lightning Rod: for three turns most bolts find him, and every enemy Lightning attack (single target or area) is drawn to him and
//               absorbed the same way. Foe intents name him as the target and the Guard cue counts the hit as nothing.
//             - Blizzard and Snowfall: his Ice spells hit harder and may Slow or freeze (Stun), he takes less damage (Snowveil), and the party is
//               not slowed by the snow while he stands.
//             - Six spells on every foe (Static Field, Glacial Tempest, Thunderhead, Hoarfrost Field, Whiteout, Zero Point); alone against one foe
//               they focus (L17.jace.lone). Wellspring Mantle stays (roster17.js). Sleetstep is the self blink. Quicken (Haste an ally) is the ally
//               support skill that stays; Prism Ward and Frost Mail are legacy skills (kept by saved heroes who knew them).
//             - Limit: Hailfall (three waves) and Absolute Tempest (four): Lightning in a thunderstorm, Ice in snow, else both in turn and weaker.
// 2) Looks (section 6): new key-grid parts painted by the game's own pipeline (hero rig, heroTone, paintHD): a hunter with a quiver and a hawk on the
//    shoulder, a hooded sniper with a scarf and a sighted arbalest on a redrawn horse, a blue haired archmage in thin round glasses.
// 3) Unlocking (section 7): each keeps his redeem code (legends.js, hashes untouched) and gains a board quest that needs no code (a "trail":
//    win fights in the realm, one fight of his own, then his old meeting; Nikaris joins right after his fight, legends18.js). Joining him unlocks him
//    on the account.
// Test: tools/chrome/v195a.js. Balance tool: tools/chrome/legbal.js.
const L17={
  nik:{watchTurns:3,dive:.55,diveBlind:.2,diveMax:12},
  kae:{steady:1.4,cap:0.18,atk:0.85},
  jace:{wxTurns:5,fieldSteps:160,fieldMp:14,heal:.1,fedMag:.04,fedSpd:.03,fedMax:5,strike:.16,strikeRod:.45,rodPull:.85,rodTurns:3,
    ice:1.15,iceFx:[['slow',.3],['stun',.12]],veil:.8,lone:1.1,limMix:.9},
  C:{},old:{},legacy:{},perf:0,
  // the kits in learn order: [id, changes to the skill that has this id today (null = as it is), a new skill when no skill has this id]
  kit:{
   nikaris:[['s1a'],['hawk'],['wolf'],
     ['l17_quiver',null,{n:'Quiver Run',k:'phys',pw:.75,hits:4,mp:7,dl:'ranged',d:'Empties half the quiver at one foe: four arrows as fast as he can nock them.'}],
     ['r_sap'],['s1b'],
     ['thorn',{n:'Snare Line',mp:9,fx:[['root',.7],['slow',.6]],d:'A hidden line of snares springs under every foe. Likely Roots and Slows.'}],
     ['l17_watch',null,{n:"Hawk's Watch",k:'status',t:'self',mp:10,fx:[['l17watch',1]],own:1,d:''}],
     ['pack'],['wildmend'],
     ['s3a',{pw:.55,hits:3,d:'Three falls of arrows out of a moonless sky on every foe.'}],
     ['s2_nikaris'],
     ['l17_split',null,{n:'Split Arrow',k:'phys',t:'chain',pw:2.6,mp:10,el:'shadow',role:'primer',dl:'ranged',d:'An arrow that splits in flight and may leap from foe to foe.'}],
     ['oldwood']],
   kaevan:[['s1a',{pw:1.4}],['s1b',{pw:1.75}],['charge',{pw:1.8}],
     ['l17_steady',null,{n:'Steady Draw',k:'status',t:'self',mp:5,cost:.7,fx:[['l17steady',1]],own:1,d:''}],
     ['wheel'],
     ['combo',{pw:1.6,mp:20,pierce:1,d:'A bolt loosed at full gallop with Shadow and Lightning that ignores half of defense. Likely Breaks.'}],
     ['khan'],
     ['r_hobble',{n:'Stillwind Bolt',pw:1.2,mp:9,el:'lightning',fx:[['stun',.45],['slow',1]],d:'The stopping shot: a Lightning bolt that Slows what it hits and may Stun it.'}],
     ['r_flash'],['s2_kaevan'],
     ['s3a',{pw:4.0,cost:1.4,d:'His namesake shot. Very slow to draw, high crit.'}],
     ['stormmark'],['eclipse',{pw:2.8}],
     ['tenk',{n:'Horizon Shot',t:'one',hits:1,pw:5.4,pierce:1,crit:.2,mp:32,cost:1.5,fx:null,d:''}]],
   jaeson:[['s1a'],['s1b'],
     ['l17_static',null,{n:'Static Field',k:'mag',t:'all',pw:.9,mp:8,el:'lightning',role:'primer',d:'Charges the air over every foe with Lightning.'}],
     ['l17_storm',null,{n:'Call Thunderstorm',k:'status',t:'self',mp:8,cost:.5,l17wx:'storm',d:''}],
     ['mantle'],
     ['l17_bliz',null,{n:'Call Blizzard',k:'status',t:'self',mp:8,cost:.5,l17wx:'blizzard',d:''}],
     ['quick'],
     ['l17_rod',null,{n:'Lightning Rod',k:'status',t:'self',mp:8,cost:.6,fx:[['l17rod',1]],own:1,d:''}],
     ['s2a',{pw:1.2,mp:11,fx:[['slow',.4]],d:'Hail and lightning on every foe. May Slow.'}],
     ['l17_blink',null,{n:'Sleetstep',k:'status',t:'self',mp:6,cost:.5,fx:[['ward',1],['haste',1]],own:1,d:'Steps sideways through the sleet: the next hit aimed at him finds nothing, and he is Hasted. A fast action.'}],
     ['lattice',{n:'Thunderhead',pw:1.5,mp:16,cost:1.2,fx:[['stun',.2]],d:'A whole thunderhead breaks over every foe. May Stun.'}],
     ['hoarfield'],
     ['l17_white',null,{n:'Whiteout',k:'mag',t:'all',pw:1.4,mp:16,el:'ice',role:'det',fx:[['blind',.5]],d:'The world goes white: Ice on every foe. May Blind.'}],
     ['zeropoint']]},
  quest:{}};
const l17P=v=>Math.round(v*100)+'%';

// ---------- 1. statuses ----------
try{
  STS.l17steady={n:'Steady',a:'STD',t:3,c:'#f2d24a',d:`The next shot deals ${l17P(L17.kae.steady-1)} more and cannot miss.`};
  STS.l17watch={n:"Hawk's Watch",a:'HWK',t:L17.nik.watchTurns+1,c:'#c9a26a',d:'His hawk circles overhead and dives after every attack your side makes.'};
  STS.l17rod={n:'Lightning Rod',a:'ROD',t:L17.jace.rodTurns+1,c:'#ffe14a',d:'Storm bolts find him, and every enemy Lightning attack is drawn to him. What strikes him heals him and feeds his magic.'};
  STS.l17fed={n:'Stormfed',a:'FED',t:99,c:'#9fd8ff',d:`Fed by lightning: +${l17P(L17.jace.fedMag)} magic and +${l17P(L17.jace.fedSpd)} speed for each bolt taken in (up to ${L17.jace.fedMax}), until the fight ends.`};
  if(typeof FK_SH!=='undefined'){FK_SH.l17steady='reticle';FK_SH.l17watch='speed';FK_SH.l17rod='gather';FK_SH.l17fed='gather';}
  if(typeof ST_SYM!=='undefined'){ST_SYM.l17steady='<path d="M5 .6v2.2M5 7.2v2.2M.6 5h2.2M7.2 5h2.2" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="5" cy="5" r="1.3"/>';
    ST_SYM.l17watch='<path d="M.6 4.2 3.6 3 5 5.4 6.4 3l3 1.2L7 5.4 5 8.8 3 5.4Z"/>';
    ST_SYM.l17rod='<path d="M4.4 .5h1.2v3.2H7.6L4.6 9.5V5.6H2.6Z"/>';ST_SYM.l17fed='<path d="M5.8 .5 2.4 5.2h2L3.6 9.5 7.6 4.2H5.4Z"/>';}
}catch(e){}

// ---------- 2. kits ----------
function l17Kit(t,L){const spec=L17.kit[t.id],by={};
  L.forEach(s=>{if(s.lvS==null)s.lvS=s.lv;by[s.id]=s;});
  try{((typeof S12FULL!=='undefined'&&S12FULL[t.id])||[]).forEach(s=>{if(!by[s.id])by[s.id]=s;});}catch(e){}
  const out=[];
  spec.forEach(([id,chg,def],i)=>{let s=by[id];
    if(s){if(chg)Object.assign(s,chg);}
    else if(def){s=Object.assign({cost:1,hits:1,t:'one',mp:0,el:null},def,{id,l17n:1,r17a:1});
      if(!s.rl)s.rl=t.cls==='archmage'?'magic':'ranged';
      try{if((s.k==='phys'||s.k==='mag')&&!s.dl&&typeof dlFor==='function'){const d=dlFor(t.cls,s);if(d)s.dl=d;}}catch(e){}}
    else return;
    s.lv=R17.lv[Math.min(i,R17.lv.length-1)];if(s.lv0==null)s.lv0=s.lv;out.push(s);});
  const ids=new Set(out.map(s=>s.id));
  L17.old[t.id]=L.slice();L17.legacy[t.id]=L.filter(s=>!ids.has(s.id));L17.legacy[t.id].forEach(s=>{s.l17old=1;});
  l17Texts(t,out);return out;}
// the descriptions that quote the numbers above
function l17Texts(t,K){const J=L17.jace,f=id=>K.find(s=>s.id===id),set=(id,d)=>{const s=f(id);if(s)s.d=d;};
  if(t.id==='nikaris'){set('l17_watch',`His hawk circles overhead for ${L17.nik.watchTurns} of his turns and dives after every attack your side makes. Each dive may Blind.`);}
  if(t.id==='kaevan'){set('l17_steady',`Holds his breath. A fast action: his next shot deals ${l17P(L17.kae.steady-1)} more and cannot miss.`);
    set('tenk',`One bolt at the horizon, through anything in the way: ignores half of defense, high crit. A boss never loses more than ${l17P(L17.kae.cap)} of its max HP to it.`);}
  if(t.id==='jaeson'){
    set('l17_storm',`Calls a Thunderstorm over the battle for ${J.wxTurns} of his turns (Lightning +20%). Bolts that strike him heal him and feed his magic. A fast action. On the field: the realm's sky for ${J.fieldSteps} steps.`);
    set('l17_bliz',`Calls a Blizzard over the battle for ${J.wxTurns} of his turns (Ice +25%). In the snow his Ice bites deeper and may freeze, he takes ${l17P(1-J.veil)} less damage and the party is not slowed. A fast action. On the field: the realm's sky for ${J.fieldSteps} steps.`);
    set('l17_rod',`For ${J.rodTurns} turns storm bolts find him and every enemy Lightning attack is drawn to him. Each one heals him for ${l17P(J.heal)} of max HP and feeds his magic and speed.`);}
  K.forEach(s=>{if(s.own&&!/Only [A-Z][a-z]+ has this skill\.$/.test(s.d||''))s.d=(s.d||'')+` Only ${t.n} has this skill.`;});}
HOOK.xform('classSkills','legends17b','the reworked kits of Nikaris, Kaevan and Jace (14 skills on the roster17 levels)',function(L,t){
  if(!L||!t||!L17.kit[t.id]||t.mon)return L;const c=L17.C[t.id];if(c&&c.L===L){try{l17Re(t,c.out);}catch(e){}return c.out;}
  let out=L;try{out=l17Kit(t,L);}catch(e){console.error('legends17b kit',t.id,e);out=L;}L17.C[t.id]={L,out};return out;});
// kits12.js writes the names and descriptions of slot skills again on every call: the changes are laid over them each time (the same values)
function l17Re(t,K){const by={};K.forEach(s=>{by[s.id]=s;});L17.kit[t.id].forEach(([id,chg])=>{if(chg&&by[id]&&!by[id].l17n)Object.assign(by[id],chg);});l17Texts(t,K);}
// a skill the rework dropped stays with a hero who knew it (c.keep holds its id)
{const kn0=known;known=function(c){const L=kn0.apply(this,arguments);try{const X=c&&L17.kit[c.id]&&L17.legacy[c.id];
    if(X&&c.keep&&c.keep.length)X.forEach(s=>{if(c.keep.includes(s.id)&&!L.some(x=>x.id===s.id))L.push(s);});}catch(e){}return L;};}
// old saves: under the levels the save was written with (lv12, lvP, lvQ, lvR, or roster17's lvS), every skill a legend knew stays known
function l17Keep(g){if(!g||g.daily||g.l17k)return 0;let n=0;const was=g.m14lv>=4?'lvS':g.m14lv===3?'lvR':g.m14lv===2?'lvQ':g.m14lv===1?'lvP':'lv12';
  Object.keys(L17.kit).forEach(id=>{const c=g.roster&&g.roster[id],t=TPL[id];if(!c||!t)return;const K=classSkills(t),old=L17.old[id]||[];
    old.forEach(s=>{const lv0=s[was]!=null?s[was]:(was==='lvS'?s.lv:null),knew=(lv0!=null&&lv0<=c.lv)||(c.keep&&c.keep.includes(s.id));if(!knew)return;
      const now=K.find(x=>x.id===s.id);if(now&&now.lv<=c.lv)return;if(!(c.keep&&c.keep.includes(s.id))){c.keep=(c.keep||[]).concat(s.id);n++;}});
    try{const seen=g.skSeen&&g.skSeen[id];if(seen){const nw=K.filter(s=>s.l17n&&skillKnown(c,s)&&!seen.includes(s.id)).map(s=>s.id);
      if(nw.length){g.skSeen[id]=seen.concat(nw);g.skNew=g.skNew||{};g.skNew[id]=(g.skNew[id]||[]).concat(nw.filter(x=>!(g.skNew[id]||[]).includes(x)));}}}catch(e){}});
  g.l17k=1;return n;}
{const mk1=m14Keep;m14Keep=function(g){try{l17Keep(g);}catch(e){console.error('legends17b keep',e);}return mk1.apply(this,arguments);};}
HOOK.after('newGame','legends17b','a new journey starts on the reworked kits',function(){try{if(G)G.l17k=1;}catch(e){}});

// ---------- 3. texts: Jace, and what the three are now ----------
try{const T=TPL.jaeson;T.n='Jace';T.title='Jace Vael, the Weatherwright';
  T.bio="Jace Vael, the Weatherwright. An archmage with storm-blue hair and round glasses who does not wait for weather: he makes it, stands in it, and comes out stronger.";
  const r=RAW.find(x=>x[0]==='jaeson');if(r){r[1]=T.n;r[5]=T.bio;}
  TPL.nikaris.bio="Nikaris Thornwhisper, the Beastwarden. A hunter with a longbow, a full quiver and a hawk on his shoulder, who talks to wolves and swears they answer.";
  TPL.kaevan.bio="Kaevan Temur, the Shadowstorm. A hooded sniper off the endless steppe who shoots a sighted arbalest from the saddle and rides in front of thunderheads on purpose. His mustache has its own reputation.";
  [['nikaris'],['kaevan']].forEach(([id])=>{const q=RAW.find(x=>x[0]===id);if(q)q[5]=TPL[id].bio;});
  SIG.jaeson.d='Every damaging spell is followed by a second spell of his other element at 30% power, and his spells cost about 30% less MP. Weather feeds him: lightning that strikes him heals him and raises his magic and speed, and in snow his Ice bites deeper and he is harder to hurt.';
  CLS.archmage.role='Legendary weatherwright. Ice and lightning on every foe, storms and blizzards at his call, and lightning that feeds him.';
  CLS.druid.n='Hunter';CLS.druid.role='Legendary hunter. A longbow that never rests, a snare, a hawk overhead, and a way with wild things.';
  CLS.sniper.role='Legendary mounted sniper. One steadied bolt of shadow and storm that goes through anything, and he shoots back when struck.';
  LIMIT.archmage=Object.assign(LIMIT.archmage,{n:'Hailfall',pw:.95,hits:3,l17waves:3,fx:[['slow',.6],['stun',.25]],d:'The sky comes down in three waves on every foe: Lightning in a thunderstorm, Ice in snow, both in turn (and weaker) under any other sky.'});
  LIMIT2.archmage=Object.assign(LIMIT2.archmage,{n:'Absolute Tempest',pw:.92,hits:4,l17waves:4,fx:[['slow',.8],['stun',.35]],shieldChip:2,d:'Four waves of the worst weather there is on every foe: Lightning in a thunderstorm, Ice in snow, both in turn (and weaker) otherwise. Chips 2 shield pips.'});
}catch(e){console.error('legends17b texts',e);}

// ---------- 4. battle ----------
const l17Front=id=>{try{return (B&&B.front||[]).find(u=>u&&u.id===id&&u.hp>0&&u.side==='p'&&!u.isSum&&!u.isComp)||null;}catch(e){return null;}};
const l17Jace=()=>l17Front('jaeson');
const l17RodOn=()=>{const j=l17Jace();return j&&has(j,'l17rod')?j:null;};
const l17Wx=()=>(B&&B.weather)||'clear';
const l17Snowy=()=>{const w=l17Wx();return w==='blizzard'||w==='snow';};
const l17Bolt=sk=>!!sk&&(sk.k==='phys'||sk.k==='mag')&&skEls(sk).includes('lightning');
// a bolt taken in: no damage, a heal and a stack of Stormfed
function l17Absorb(j,why){const J=L17.jace,n=Math.min(j.S.mhp-j.hp,Math.max(1,Math.round(j.S.mhp*J.heal)));j.hp+=n;j.healT=Date.now();j.l17absT=Date.now();
  const had=j.l17fed||0;j.l17fed=Math.min(J.fedMax,had+1);j.st.l17fed={t:STS.l17fed.t,v:j.l17fed};
  j.fxEl='lightning';j.fxT=Date.now();if(n>0)fx(j,'+'+n,'heal');fx(j,'Stormfed'+(j.l17fed>1?' x'+j.l17fed:''),'stat good');
  log(`${why} ${j.name} drinks it in: +${n} HP, Stormfed ${j.l17fed} of ${J.fedMax}${j.l17fed===had?' (full)':''}.`);
  try{lbAdd(j,6);}catch(e){}try{if(typeof sfx==='function')sfx('react');}catch(e){}
  if(B){B.l17abs=(B.l17abs||0)+1;B.l17last={t:Date.now(),why};}try{l17FxAbsorb(j);}catch(e){}return n;}
// the Thunderstorm's stray bolts with Jace in the Vanguard: more of them, never on an ally, and the Rod takes most
{const we0=weatherEvent;weatherEvent=function(){const W=WX(),j=l17Jace();if(!W.strike||!j||!B)return we0.apply(this,arguments);
  const st0=W.strike;let stop=false;W.strike=0;
  try{const rod=has(j,'l17rod'),J=L17.jace;
    if(B.pturns>=1&&RNG()<(rod?J.strikeRod:J.strike)){let t;
      if(rod&&RNG()<J.rodPull)t=j;else{const pool=liveUnits().filter(u=>u!==B.lastStrike||u===j);t=pool.length?pick(pool):j;if(t.side==='p'&&t!==j)t=j;}
      B.lastStrike=t;B.l17strikes=(B.l17strikes||0)+1;banner('Lightning strike!','#f2c93a');
      if(t===j)l17Absorb(j,'Lightning strikes '+j.name+'.');
      else{const d=Math.min(t.hp-1,Math.max(1,Math.round(t.S.mhp*W.strikeDmg)));t.fxEl='lightning';t.fxT=Date.now();if(t.side==='e'&&!t.primed){t.primed={el:'lightning',t:2};t.primeT=Date.now();}
        if(d>0){log(`Lightning strikes ${t.name} for ${d}!`);fx(t,String(d),'dmg');hurt(t,d);}else log(`Lightning crackles around ${t.name} but misses.`);try{l17FxStrike(t);}catch(e){}}
      if(B.cur.hp<=0||checkEnd()){render();if(!B.over)later(advance,PAUSE*.6);stop=true;}}
    if(stop)return true;return we0.apply(this,arguments);}
  finally{W.strike=st0;}};}
// the weather he calls in battle
function l17Call(a,k){const W=WEATHER[k];if(!B||!W)return;const cur=B.l17wx;B.l17wx={k,left:L17.jace.wxTurns,prev:cur?cur.prev:B.weather||'clear',by:a.id,fresh:1,t:Date.now()};
  B.weather=k;banner(W.n+'!',k==='storm'?'#f2c93a':'#bfe6ff');log(`${a.name} calls the sky down. ${W.n}: ${W.d}`);fx(a,W.n,'stat good');try{l17FxCall(a,k);}catch(e){}}
{const en1=endTurn;endTurn=function(u,cost){try{const X=B&&B.l17wx;if(X&&u&&u.id===X.by&&u.side==='p'){if(X.fresh)X.fresh=0;else if(--X.left<=0){B.weather=X.prev;B.l17wx=null;
      log(`The ${WEATHER[X.k].n.toLowerCase()} ${u.name} called blows itself out.`);banner(WEATHER[X.prev]?WEATHER[X.prev].n:'Clear skies','#cfd8e8');}}}catch(e){}
  return en1.apply(this,arguments);};}
// Stormfed speed; the party is not slowed by snow while Jace stands
{const dl0=delayOf;delayOf=function(u,cost){let d=dl0.apply(this,arguments);try{if(u&&u.l17fed&&B)d/=1+L17.jace.fedSpd*u.l17fed;
    if(B&&u&&u.side==='p'&&WX().spd&&WX().spd<1&&l17Snowy()&&l17Jace())d*=WX().spd;}catch(e){}return d;};}
HOOK.after('startBattle','legends17b','a fresh fight: no Stormfed, no called sky, no hawk',function(r){try{if(B)allParty().forEach(c=>{delete c.l17fed;delete c.l17absT;delete c.l17dives;});}catch(e){}});
HOOK.after('calcStats','legends17b','Kaevan: a little less ATK (in line with the other Legendaries)',function(S,c){try{if(S&&c&&c.id==='kaevan'&&!(G&&G.daily))S.atk*=L17.kae.atk;}catch(e){}});
// damage rules (through the bonus argument, so the Mantle and every preview see the finished number)
HOOK.wrap('calcDamage','legends17b','Steady Draw, Stormfed, snow on Jace and his Ice, the focused area spell, the Horizon Shot cap',function(next,a,sk,t,bonus){
  let m=1;const J=L17.jace;
  try{if(a&&sk&&t){
    if(a.id==='kaevan'&&a.side==='p'&&sk.k==='phys'&&sk.id!=='parthian'&&has(a,'l17steady'))m*=L17.kae.steady;
    if(a.id==='jaeson'&&a.side==='p'&&sk.k==='mag'){if(a.l17fed)m*=1+J.fedMag*a.l17fed;
      if(l17Snowy()&&skEls(sk).includes('ice'))m*=J.ice;
      if(sk.t==='all'&&B&&B.en.filter(e=>e.hp>0).length===1)m*=J.lone;}
    if(t.id==='jaeson'&&t.side==='p'&&a.side==='e'&&l17Snowy()&&B&&B.front.includes(t))m*=J.veil;}}catch(e){}
  const r=next(a,sk,t,m===1?bonus:(bonus||1)*m);
  try{if(r&&a&&a.id==='kaevan'&&sk&&sk.id==='tenk'&&t&&t.boss&&t.S)r.dmg=Math.max(1,Math.min(r.dmg,Math.round(t.S.mhp*L17.kae.cap)));}catch(e){}
  return r;});
const L17_DIVE={id:'l17_dive',n:'Hawk Dive',k:'phys',pw:L17.nik.dive,t:'one',hits:1,mp:0,cost:1,el:null,dl:'piercing',fx:[['blind',L17.nik.diveBlind]],l17:1};
// the per hero parts of an action; the hawk follows below
function l17Act(next,a,sk,tgts){
  // an enemy Lightning attack with the Rod up: all of it goes to Jace and is absorbed
  if(a.side==='e'&&l17Bolt(sk)){const j=l17RodOn();if(j){B.actN=(B.actN||0)+1;a.prevAct=a.lastAct||0;a.lastAct=B.actN;const now=Date.now();
      a.actT=now;a.actKind=sk.k;a.actEl='lightning';a.actName=sk.n;log(`${a.name} uses ${sk.n}!`);
      const n=(tgts||[]).length;B.l17redir=(B.l17redir||0)+1;fx(j,'Lightning Rod','stat good');
      try{l17FxBend(a,j);}catch(e){}l17Absorb(j,`Lightning Rod! ${sk.n} bends to ${j.name}${n>1?' and spares the others':''}.`);return;}}
  if(a.side!=='p')return next(a,sk,tgts);
  // Jace: the weather calls, the Limit in waves, Ice in the snow
  if(a.id==='jaeson'){
    if(sk.l17wx){const r=next(a,sk,tgts);l17Call(a,sk.l17wx);return r;}
    if(sk.l17waves&&sk.limit){const w=l17Wx(),els=w==='storm'?['lightning']:l17Snowy()?['ice']:['lightning','ice'],mix=els.length>1;
      for(let i=0;i<sk.l17waves;i++){const live=B.en.filter(e=>e.hp>0);if(!live.length)break;const el=els[i%els.length];
        next(a,Object.assign({},sk,{hits:1,el,pw:+(sk.pw*(mix?L17.jace.limMix:1)).toFixed(3),n:sk.n+' ('+(i+1)+')',shieldChip:i===sk.l17waves-1?sk.shieldChip:0,l17wave:i}),live);try{l17FxWave(a,el,i,sk.l17waves);}catch(e){}}
      a.actName=sk.n;B.l17waves=(B.l17waves||0)+sk.l17waves;return;}
    if(sk.k==='mag'&&l17Snowy()&&skEls(sk).includes('ice')&&!sk.l17ice)sk=Object.assign({},sk,{l17ice:1,fx:(sk.fx||[]).concat(L17.jace.iceFx.filter(f=>!(sk.fx||[]).some(g=>g[0]===f[0])))});
    return next(a,sk,tgts);}
  // Kaevan: the steadied shot cannot miss (accuracy at its ceiling of 99%, Blind set aside, and the roll kept under it), and spends the breath
  if(a.id==='kaevan'&&sk.k==='phys'&&has(a,'l17steady')){const r0=RNG,acc=a.S.acc,bl=a.st.blind;RNG=()=>r0()*.989;a.S.acc=9;delete a.st.blind;
    B.l17steady=(B.l17steady||0)+1;a.l17shotT=Date.now();try{l17FxShot(a,sk,tgts);}catch(e){}
    try{return next(a,sk,tgts);}finally{RNG=r0;a.S.acc=acc;if(bl&&a.st)a.st.blind=bl;delete a.st.l17steady;try{fx(a,'Steady spent','stat');}catch(e){}}}
  if(a.id==='kaevan'&&sk.id==='tenk'){try{l17FxShot(a,sk,tgts);}catch(e){}}
  return next(a,sk,tgts);}
HOOK.wrap('perform','legends17b','Lightning Rod, Steady Draw, the called sky, the weather Limit in waves, the hawk',function(next,a,sk,tgts){
  if(!B||!a||!sk)return next(a,sk,tgts);
  const r=l17Act(next,a,sk,tgts);
  // the hawk dives after an attack by his side
  try{if(a.side==='p'&&(sk.k==='phys'||sk.k==='mag')&&!sk.l17&&B&&!B.over&&!L17.perf){const nk=allParty().find(c=>c.id==='nikaris'&&c.hp>0&&has(c,'l17watch'));
    if(nk&&(nk.l17dives||0)<L17.nik.diveMax){const live=B.en.filter(e=>e.hp>0),t=(tgts||[]).find(e=>e&&e.side==='e'&&e.hp>0)||(live.length?live[Math.floor(RNG()*live.length)]:null);
      if(t){nk.l17dives=(nk.l17dives||0)+1;B.l17dives=(B.l17dives||0)+1;L17.perf++;try{log(`${nk.name}'s hawk dives!`);const aT=nk.actT,aK=nk.actKind,aE=nk.actEl,aN=nk.actName,f1=nk.fk11,f2=nk.fk11T,s1=nk.actSk,s2=nk.actSkT;
          perform(nk,L17_DIVE,[t]);if(nk!==a){nk.actT=aT;nk.actKind=aK;nk.actEl=aE;nk.actName=aN;nk.fk11=f1;nk.fk11T=f2;nk.actSk=s1;nk.actSkT=s2;}try{l17FxDive(nk,t);}catch(e){}}finally{L17.perf--;}}}}}catch(e){console.error('legends17b hawk',e);}
  return r;});
HOOK.after('addSt','legends17b','a new watch starts the count of dives again',function(r,t,k){try{if(r&&k==='l17watch'&&t)t.l17dives=0;}catch(e){}});
// Jace's Limit: the wave fields ride on the Limit skill
{const ls0=limitSkill;limitSkill=function(c){const o=ls0.apply(this,arguments);try{if(c&&c.id==='jaeson'&&o&&o.l17waves){const w=l17Wx();o.el=w==='storm'?'lightning':l17Snowy()?'ice':['ice','lightning'];}}catch(e){}return o;};}
// foe intents and the Guard cue: a planned Lightning attack names Jace while the Rod is up, and counts for nothing
{const fp1=foePlan;foePlan=function(u){const p=fp1.apply(this,arguments);try{if(p){const j=l17RodOn(),lt=l17Bolt(p.sk);
    if(j&&lt){if(!p.l17r){p.l17r=1;p.l17t0=p.tgt;}p.tgt=j;}else if(p.l17r){p.tgt=p.l17t0;p.l17r=0;}}}catch(e){}return p;};}
{const ce1=c5Est;c5Est=function(u,sk,t){try{if(t&&u&&u.side==='e'&&l17Bolt(sk)&&l17RodOn()===t)return 0;}catch(e){}return ce1.apply(this,arguments);};}
// auto battle: the signature moves are used the way a careful player would
function l17Auto(a,foes){const K=known(a),can=id=>{const s=K.find(x=>x.id===id);return s&&a.mp>=Math.round((s.mp||0)*(1-((a.S&&a.S.mpEff)||0)))?s:null;},tough=B.boss||foes.length>1||foes.some(e=>e.elite);
  if(!tough)return null;
  if(a.id==='jaeson'){const w=l17Wx(),mine=w==='storm'||l17Snowy();
    if(!mine){const st=can('l17_storm'),bz=can('l17_bliz');if(st||bz){const av=el=>foes.reduce((q,e)=>q+effOf(el,e),0)/foes.length;return [bz&&(!st||av('ice')>av('lightning')+.05)?bz:st||bz,[a]];}}
    const rod=can('l17_rod');if(rod&&!has(a,'l17rod')&&(w==='storm'||foes.some(e=>(e.sk||[]).some(l17Bolt)))&&(w!=='storm'||a.hp<a.S.mhp*.8||(a.l17fed||0)<L17.jace.fedMax))return [rod,[a]];
    return null;}
  if(a.id==='kaevan'){const shots=K.filter(s=>s.k==='phys'&&s.t!=='all'&&s.t!=='rand'&&(s.pw||0)*(s.hits||1)>=2&&a.mp>=Math.round((s.mp||0)*(1-((a.S&&a.S.mpEff)||0))));
    // the breath is held: the heaviest shot he can pay for, at the foe with the most HP left (a primed foe his detonator sets off first)
    if(has(a,'l17steady')&&shots.length){const s=shots.slice().sort((x,y)=>(y.pw||0)*(y.hits||1)-(x.pw||0)*(x.hits||1))[0];return [s,[foes.slice().sort((x,y)=>y.hp-x.hp)[0]]];}
    const st=can('l17_steady');if(st&&!has(a,'l17steady')){const big=K.filter(s=>s.k==='phys'&&s.t!=='all'&&(s.pw||0)*(s.hits||1)>=2&&a.mp>=(s.mp||0)+(st.mp||0));if(big.length)return [st,[a]];}return null;}
  if(a.id==='nikaris'){const w=can('l17_watch');if(w&&!has(a,'l17watch')&&B.front.filter(c=>c.hp>0).length>=2)return [w,[a]];return null;}
  return null;}
{const as2=autoTurnSmart;autoTurnSmart=function(){try{const a=B&&B.cur;if(B&&!B.over&&B.mode==='cmd'&&B.auto&&a&&a.side==='p'&&L17.kit[a.id]&&!lbReady(a)){
      const foes=B.en.filter(e=>e.hp>0),hurt=B.front.some(c=>c.hp>0&&c.hp<c.S.mhp*.45);
      if(foes.length&&!hurt){const pk=l17Auto(a,foes);if(pk)return exec(pk[0],pk[1]);}
      // the careful auto casts any self boon it lacks on a coin: the Rod only where l17Auto wanted it
      if(a.id==='jaeson'&&!a.st.l17rod){a.st.l17rod={t:99,fake:1};try{return as2.apply(this,arguments);}finally{if(a.st&&a.st.l17rod&&a.st.l17rod.fake)delete a.st.l17rod;}}}}catch(e){console.error('legends17b auto',e);}
  return as2.apply(this,arguments);};}
HOOK.before('render','legends17b','no stand-in status is ever drawn',function(){try{if(B)allParty().forEach(c=>{const f=c&&c.st&&c.st.l17rod;if(f&&f.fake)delete c.st.l17rod;});}catch(e){}});
// effects are filled in by section 6 (no battle state in them)
let l17FxAbsorb=function(){},l17FxStrike=function(){},l17FxCall=function(){},l17FxWave=function(){},l17FxDive=function(){};

// ---------- 5. Jace's weather on the field ----------
const L17_FLD=[{id:'l17f_storm',sk:'l17_storm',k:'storm',n:'Call Thunderstorm'},{id:'l17f_bliz',sk:'l17_bliz',k:'blizzard',n:'Call Blizzard'}];
function l17FldOf(c){if(!c||c.id!=='jaeson'||!G||G.daily)return [];const K=classSkills(TPL.jaeson),J=L17.jace;
  return L17_FLD.filter(f=>{const s=K.find(x=>x.id===f.sk);return s&&skillKnown(c,s);}).map(f=>({id:f.id,n:f.n,k:'field',t:'self',mp:J.fieldMp,fld:'l17'+f.k,l17wx:f.k,el:f.k==='storm'?'lightning':'ice',
    d:`Turns this realm's sky to a ${WEATHER[f.k].n} for ${J.fieldSteps} steps. ${WEATHER[f.k].d} Not indoors, and not where something else holds the sky.`}));}
{const fs1=fsSkills;fsSkills=function(c){const L=fs1.apply(this,arguments);try{return L.concat(l17FldOf(c));}catch(e){return L;}};}
// why a sky cannot be called here (null: it can)
function l17FldBlock(k){const m=WS&&WS.m;if(!m||!G)return 'There is no sky to call here.';
  if((typeof mapIndoor==='function'&&mapIndoor(m))||!(m.kind==='field'||m.kind==='town'))return 'There is no sky in here to call.';
  if((G.wxSave||{})[m.s]!=null)return 'Something stronger holds this sky still.';
  if(G.weather[m.s]===k)return `It is already a ${WEATHER[k].n.toLowerCase()} here.`;return null;}
{const fc1=fsCast;fsCast=function(cid,sid,tid){const c=G&&G.roster[cid],s=c&&l17FldOf(c).find(x=>x.id===sid);if(!s)return fc1.apply(this,arguments);
  const say=t=>{toast(t);if(V.modal&&V.modal.type==='field')V.modal.msg=t;};
  if(c.hp<=0)return say(`${c.name} is knocked out.`);if(c.mp<s.mp)return say(`${c.name} needs ${s.mp} MP.`);
  const why=l17FldBlock(s.l17wx);if(why)return say(why);
  const m=WS.m,k=s.l17wx;G.weather[m.s]=k;G.wx=G.wx||{};G.wx[m.s]=L17.jace.fieldSteps;G.l17wx={s:m.s,k};c.mp-=s.mp;saveGame();
  try{sfx('blip');}catch(e){}try{WS.wT=performance.now();}catch(e){}try{wkwUpdate();}catch(e){}try{if(typeof showLocation==='function')showLocation();}catch(e){}
  say(`${c.name} calls the sky down: ${WEATHER[k].n} over ${ZS(m.s).n} for ${L17.jace.fieldSteps} steps.`);};}
HOOK.after('wkwUpdate','legends17b','the called sky beside the weather chip',function(r){try{const wk=$('wkw'),X=G&&G.l17wx,m=WS.m;if(!wk)return r;wk.querySelectorAll('.l17chip').forEach(e=>e.remove());
  if(!X||!m||m.s!==X.s||(typeof mapIndoor==='function'&&mapIndoor(m)))return r;
  if(G.weather[X.s]!==X.k){delete G.l17wx;return r;}
  wk.insertAdjacentHTML('beforeend',`<span class="wchip fschip l17chip" title="${esc(TPL.jaeson.n)} called this ${esc(WEATHER[X.k].n.toLowerCase())}">${WEATHER[X.k].i} Called <b class="nums">${(G.wx||{})[X.s]||0}</b></span>`);}catch(e){}return r;});
HOOK.after('arrive','legends17b','the called sky counts down on the chip',function(){try{if(G&&G.l17wx)wkwUpdate();}catch(e){}});

// ---------- 6. looks ----------
// The three looks are look records for the hero rig (art.js) plus a few parts of their own, drawn as keys on the rig's grid before the tone pass and
// the HD paint, so every view, walk frame, battle pose, portrait and card gets them from the same drawing:
//   Nikaris  a hunter: feathered cap, hair tied back so the quiver shows, a grey pelt collar, a bracer, his hawk on the shoulder (keys f g: feathers)
//   Kaevan   a sniper: hood up, a long scarf, the mustache, a heavy arbalest with a sight on the stock, and a horse drawn as a key grid (l17Horse)
//   Jace     an archmage: storm-blue hair and eyes, thin round glasses (a wire ring round each eye, the eyes left open), a deep blue mantle with a
//            gold clasp over the pale robe, the crystal staff
// L17.art names the hero whose grid is being built (the weapon drawers read it for the arbalest).
L17.art=null;L17.looks={
  nikaris:{b:'light',hair:'short',hat:'feathercap',fur:1,wpn:'longbow',sk:1,eyes:'#b48ae0',l17:'hunter',
    pal:{H:'#2a1f30',P:'#3a2a48',Q:'#9a7ab8',J:'#4a3560',K:'#2a2234',B:'#4a3424',L:'#6a4a2c',R:'#b48ae0',W:'#8b5a2b'}},
  kaevan:{b:'light',hair:'short',hat:'hood',face:['handlebar'],back:['scarf'],wpn:'crossbow',sk:0,mount:1,eyes:'#f2d24a',l17:'sniper',
    pal:{H:'#1a1210',P:'#2a2740',Q:'#f2d24a',J:'#403c68',Y:'#e2b93a',M:'#6a6878',N:'#3a3848',G:'#f2d24a',Z:'#2a2638',K:'#221f2c',B:'#2a2018',W:'#5a3a26'}},
  jaeson:{b:'robe',hair:'swept',wpn:'staff_crystal',sk:0,eyes:'#2f9aff',l17:'weather',
    pal:{H:'#2f6fe0',P:'#86bfe2',Q:'#ffe14a',J:'#2c58a8',Y:'#2c58a8',C:'#c8f4ff',M:'#2a2a3a',G:'#ffe14a',W:'#b9a070'}}};
try{Object.keys(L17.looks).forEach(id=>{TPL[id].look=L17.looks[id];const r=RAW.find(x=>x[0]===id);if(r)r[7]=L17.looks[id];});}catch(e){console.error('legends17b looks',e);}
{const hp1=heroPal;heroPal=function(L,els,id){const p=hp1.apply(this,arguments);try{if(L&&L.l17==='hunter'){p.F='#8a8a98';p.f='#8a5e3c';p.g='#f0e2c0';p.i='#3a2618';}
    if(L&&L.l17==='weather'){p.E=L.eyes||'#2f9aff';}}catch(e){}return p;};}
// the parts on the body (side view: drawn on the bare figure, before the near arm and the weapon; the poses bend them with the body)
function l17Hawk(g,x,y,face){// a perched hawk, about 9 wide and 13 tall, its feet at (x,y); face 1 looks right, -1 left, 0 shows its back
  const X=a=>face<0?x-a:x+a,P=L=>L.map(p=>[X(p[0]),y+p[1]]);
  g.px(P([[-3,-1],[-3,0],[-4,1],[-3,1],[-4,2],[-3,2],[-4,3]]),'i');                                   // tail
  g.ell(x+.5,y-5,3,4.2,'f');g.ell(X(1.5)+(face<0?-.5:.5),y-10,2.2,2.1,'f');                          // body, head
  if(face){g.ell(X(1.4)+(face<0?-.5:.5),y-4.6,1.5,3,'g');g.px(P([[2,-7],[1,-3],[2,-2]]),'f');         // pale breast with two bars
    g.px(P([[-2,-7],[-2,-6],[-3,-5],[-3,-4],[-3,-3],[-2,-2]]),'i');                                    // the folded wing's dark edge
    g.px(P([[2,-10],[3,-11]]),'g');g.px(P([[4,-10]]),'G');g.px(P([[4,-9]]),'G');g.px(P([[2,-11]]),'b');}// cheek, beak, eye
  else{g.px(P([[0,-8],[0,-6],[0,-4],[0,-2],[-1,-5],[1,-5],[-1,-3],[1,-3]]),'i');g.px(P([[0,1],[0,2],[1,2],[-1,2]]),'i');}
  g.px(P([[-1,0],[1,0]]),'G');}                                                                         // talons
function l17Body(g,L,view){const k=L.l17;
  if(k==='hunter'){
    if(view==='side'){l17Hawk(g,10,19,1);}
    else if(view==='front'){g.rect(11,27,3,2,'L');g.rect(26,27,3,2,'L');l17Hawk(g,27,18,-1);}
    else{g.rect(11,27,3,2,'L');g.rect(26,27,3,2,'L');l17Hawk(g,12,18,0);}}
  if(k==='sniper'){
    if(view==='side'){g.rect(16,29,9,1,'L');g.rect(20,29,2,1,'G');g.rect(17,30,2,3,'L');}// belt, buckle, a bolt case at the hip
    else if(view==='front'){g.rect(14,29,12,1,'L');g.rect(19,29,2,1,'G');g.rect(24,30,3,4,'L');g.px([[24,30],[26,30]],'M');}
    else{g.rect(14,29,12,1,'L');g.rect(13,30,3,4,'L');}}
  if(k==='weather'){const zig=(x,y0,y1,k2)=>{for(let y=y0;y<=y1;y++)g.s(x+[0,1,1,0,-1,-1][(y-y0)%6],y,k2||'Q');};
    if(view==='side'){g.poly([[15,17.4],[24.6,17.2],[26.4,20.4],[25,22.6],[14.4,22.8],[13.6,20]],'J');g.rect(14,22,12,1,'Q');g.px([[22,18],[23,19],[22,19],[23,20],[22,21]],'Q');
      g.rect(16,29,9,1,'Q');zig(24,32,45);g.rect(13,45,15,2,'Q');g.px([[14,43],[16,42],[18,43],[20,42],[22,43]],'Q');}
    else if(view==='front'){g.poly([[15,16.6],[25,16.6],[29,19.4],[29,22.6],[11,22.6],[11,19.4]],'J');g.rect(11,22,18,1,'Q');g.px([[20,17],[19,18],[20,18],[19,19],[20,19],[19,20],[18,20]],'Q');
      g.rect(14,28,12,1,'Q');zig(19,31,44);zig(20,31,44);g.rect(11,45,18,2,'Q');g.px([[12,43],[14,42],[16,43],[23,43],[25,42],[27,43]],'Q');
      g.rect(10,30,4,1,'Q');g.rect(26,30,4,1,'Q');}
    else{g.poly([[15,16.6],[25,16.6],[29,19.4],[29,23.6],[11,23.6],[11,19.4]],'J');g.rect(11,23,18,1,'Q');g.px([[21,17],[20,18],[19,19],[20,19],[21,19],[20,20],[19,21],[18,22]],'Q');
      g.rect(14,28,12,1,'Q');g.rect(11,45,18,2,'Q');g.px([[12,43],[14,42],[16,43],[18,42],[20,43],[22,42],[24,43],[26,42]],'Q');g.rect(10,30,4,1,'Q');g.rect(26,30,4,1,'Q');}}}
// the parts on the head (after everything else)
{const hgs3=heroGridSide,hgv3=heroGridView;
// where the near arm and the weapon are on a finished side figure: the cells that differ from the bare figure
function l17ArmMask(L,walk,id,g){const M=new Uint8Array(g.a.length);try{const a0=L17.art;L17.art=null;let b;const L2=Object.assign({},L,{wpn:'none',l17:null});HRIG.bare=true;
    try{b=hgs3(L2,walk,id);}finally{HRIG.bare=false;L17.art=a0;}
    for(let i=0;i<M.length;i++)if(g.a[i]&&g.a[i]!==b.a[i]&&b.a[i]!=='#'&&b.a[i]!=='!')M[i]=1;}catch(e){}return M;}
  heroGridSide=function(L,walk,id){const k=L&&L.l17;if(!k)return hgs3.apply(this,arguments);const pose=!!(typeof HPW!=='undefined'&&HPW),bare=HRIG.bare,a0=L17.art;L17.art={id,k};let g;
    try{g=hgs3.apply(this,arguments);}finally{L17.art=a0;}
    try{if(!pose){if(bare){l17Body(g,L,'side');}else{const t=hcopy(g);l17Body(t,L,'side');
          // on the finished figure the parts go under the near arm and the weapon: only where the body, the hair or nothing is
          const A=l17ArmMask(L,walk,id,g);for(let i=0;i<g.a.length;i++)if(t.a[i]&&!A[i])g.a[i]=t.a[i];}
        l17Face(g,L,'side',walk?1:0);}}catch(e){console.error('legends17b side',e);}
    return g;};
  heroGridView=function(L,view,frame,id){const k=L&&L.l17;if(!k||view==='side')return hgv3.apply(this,arguments);const a0=L17.art;L17.art={id,k};let g;
    try{g=hgv3.apply(this,arguments);}finally{L17.art=a0;}
    try{l17Body(g,L,view);l17Face(g,L,view,frame>0?1:0);}catch(e){console.error('legends17b view',e);}return g;};}
// the arbalest: the crossbow drawers add a butt, a heavier prod and a sight while a sniper's grid is built
{const cb0=WPN.crossbow.draw;WPN.crossbow.draw=function(g,x,y){cb0.apply(this,arguments);if(!L17.art||L17.art.k!=='sniper')return;const c=x+1;
    g.rect(c-14,y-1,3,5,'W');g.rect(c-14,y+3,2,1,'L');g.px([[c+4,y-9],[c+4,y+11]],'M');g.s(c+4,y-10,'G');g.s(c+4,y+12,'G');
    g.rect(c-8,y-4,9,2,'N');g.rect(c-8,y-4,9,1,'c');g.s(c+1,y-4,'G');g.s(c+1,y-3,'G');g.s(c-9,y-4,'N');g.px([[c-6,y-1],[c-1,y-1]],'N');g.px([[c+9,y],[c+9,y+2],[c+10,y+1]],'N');};
  const hw0=HPWD.crossbow;HPWD.crossbow=function(d,w,o){hw0.apply(this,arguments);if(!L17.art||L17.art.k!=='sniper')return;
    d.bar(-10,-7,0,3,'W');d.dot(7,-7,'M');d.dot(7,7,'M');d.dot(6.4,-8,'G');d.dot(6.4,8,'G');
    d.bar(-5,3,-2.4,1,'N');d.bar(-5,3,-3.4,1,'c');d.dot(4,-3,'G');d.dot(-6,-3,'N');};
  const wf1=weaponFB;weaponFB=function(g,L,view){wf1.apply(this,arguments);if(!L||L.l17!=='sniper')return;
    if(view==='front'){g.rect(7,30,2,9,'M');g.rect(10,31,7,1,'N');g.s(16,31,'G');g.rect(18,33,2,4,'W');}
    else{g.rect(12,20,16,1,'M');g.rect(16,26,7,1,'N');g.s(22,26,'G');}};}
// the horse: a key grid painted like every other sprite (the old one was plain rectangles). 54 x 48, facing right, hooves on the last row.
function l17HorseGrid(frame){const g=new PG(54,48,0,0);
  // tail, far legs
  g.path([[8,28],[5,31],[4,37],[5,43]],'m',3);g.px([[5,44],[4,45]],'m');
  [[13,37,12,46],[38,37,39,46]].forEach(q=>{g.line(q[0],q[1],q[2],q[3],'d',3);g.rect(q[2]-1,46,3,2,'h');});
  // body: hindquarters, barrel, chest
  g.ell(13.5,32.5,6.4,6,'o');g.ell(24,33.4,12,5.4,'o');g.ell(35,32,5.6,6.2,'o');
  g.ell(22,37.2,10,1.8,'d');g.px([[9,30],[10,29],[11,28]],'O');g.rect(14,28,18,1,'O');
  // near legs
  [[10,36,9,41,10,46],[34,36,35,41,34,46]].forEach(q=>{g.line(q[0],q[1],q[2],q[3],'o',3);g.line(q[2],q[3],q[4],q[5],'o',2.4);g.rect(q[4]-1,45,3,1,'d');g.rect(q[4]-1,46,3,2,'h');});
  // neck and head
  g.poly([[32,27],[39,27.6],[45.5,17.5],[41,13.6],[36,19]],'o');g.poly([[40.6,11.6],[46,11],[51.6,16.6],[51.4,19.4],[47.6,20.4],[42.6,17.6]],'o');
  g.rect(49,18,3,2,'d');g.s(51,18,'h');g.s(46,14,'e');g.s(46,13,'O');g.poly([[41.6,12],[42.4,8.4],[44.4,11.4]],'o');g.s(43,10,'d');
  g.px([[44,18],[45,19],[46,20]],'d');
  // mane
  g.path([[41,11.4],[38,15],[35.4,20],[33.4,25]],'m',2.6);g.px([[43,10],[44,11],[45,12]],'m');
  // bridle and reins
  g.line(47,12,48.6,19.6,'l');g.line(44,16,50,17,'l');g.line(48,19,32,27,'l');
  // saddle cloth with the lightning trim, saddle, girth, stirrup
  g.poly([[17,27.4],[31.4,27.4],[32.4,35.4],[16,35.4]],'n');g.rect(16,35,17,1,'y');g.px([[21,29],[22,30],[21,31],[22,32],[23,33]],'y');g.px([[27,29],[28,30],[27,31]],'y');
  g.poly([[19,26],[30,26],[31,28.4],[18,28.4]],'l');g.rect(18,26,2,2,'l');g.rect(29,25,2,2,'l');
  if(frame){g.s(5,45,0);g.s(3,44,'m');}
  return g;}
const L17_HORSE={o:'#4c4046',O:'#6a5a60',d:'#342a30',h:'#15121a',m:'#17131c',e:'#f4f0e0',l:'#7a5632',n:'#403c68',y:'#f2d24a'};
function l17Horse(frame){try{const g=l17HorseGrid(frame),opt={flat:'ey',rim:null};return typeof paintHD==='function'&&typeof SPRITE_HD!=='undefined'&&SPRITE_HD?paintHD(g,L17_HORSE,opt):paint(g,L17_HORSE,opt);}catch(e){console.error('legends17b horse',e);return null;}}
// the rider on the horse: the horse, then the rider down to the hips, then his near leg and the stirrup over the saddle cloth
{const mc0=mountCanvas;mountCanvas=function(c){try{const hd=!!c.hd,W=54,H=48,o=hd?hdCv(W,H):mkCv(W,H),x=o.getContext('2d');x.imageSmoothingEnabled=false;
    const h=imgOf('l17horse',()=>l17Horse(0));if(!h)return mc0.apply(this,arguments);
    const k=c.width/40,rw=Math.round(40*k),rh=Math.round(34*k),dx=Math.round(27-20*k),dy=Math.round(30-33*k);
    x.drawImage(h,0,0);x.drawImage(c,0,0,rw,rh,dx,dy,rw,rh);
    const f=(col,a,b,w,hh)=>{x.fillStyle=col;x.fillRect(a,b,w,hh);};
    // the near leg: thigh along the saddle, shin down the flank, boot in the stirrup
    f('#14101a',23,29,8,5);f('#2e2a3c',24,30,6,3);f('#3c3850',24,30,5,1);f('#14101a',27,32,5,8);f('#2e2a3c',28,33,3,6);f('#3c3850',28,33,1,5);
    f('#14101a',27,39,7,4);f('#4a3424',28,40,5,2);f('#6a4a30',28,40,4,1);f('#c9a23a',27,42,7,1);f('#9a9aa8',33,38,1,4);
    return o;}catch(e){console.error('legends17b mount',e);return mc0.apply(this,arguments);}};}
// Nikaris no longer brings the block pup and hawk of petCanvas (his hawk is on his shoulder); look.pets is gone with the old look

// ---------- 6c. Jace's head and his lightning yellow (after 0.22.1) ----------
// The owner: "i like l17a, just forget the glasses, also doesnt have enough yellow accents to denote lightning typing". Hair: one short cut of his
// own (l17a, a side part with the fringe across the brow) drawn with the rig's hair shading. No glasses. Yellow (#ffe14a, the game's lightning
// accent, flat key Q) on the mantle's edge and bolt clasp, the cuffs, the sash, a zigzag down the robe's front and along the hem, a bolt on the back
// of the mantle, and a core and a charm on the staff: Ice in the cloth and the crystal, Lightning in the trim.
L17.hair={
 l17a(g,v){
  if(v==='side'){hsh(g,t=>t.poly([[26.8,11.4],[27,9.6],[25.6,7.6],[23,6.6],[19,6.6],[16.4,7.6],[15.2,9.6],[15,12.2],[15.8,14.2],[17.3,13.6],[17.5,11.6],[19.4,10.5],[22.8,10.7],[25.4,11.6]],'x'),HAIRK,{cap:6});
    g.px([[19,7],[20,7],[21,7],[22,8]],'h');}
  else if(v==='back'){hsh(g,t=>t.poly(hairMirror([[20,6.6],[17.6,6.7],[15.8,8],[15.1,10],[15,12.8],[15.6,15],[17.2,16],[20,16.2]]),'x'),HAIRK,{cap:6});g.px([[22,8],[22,9],[23,10]],'l');g.px([[18,7],[19,7]],'h');}
  else{hsh(g,t=>t.poly([[20,6.6],[17.6,6.7],[15.8,8],[15.1,10],[15,12.2],[15.6,13.6],[16.3,12.2],[16.6,10.4],[17.6,9.6],[20.4,10.2],[23.4,11.4],[23.7,12.4],[24.4,13.6],[25,12.2],[24.9,10],[24.2,8],[22.4,6.7]],'x'),HAIRK,{cap:6});
    g.px([[17,8],[18,9]],'l');g.px([[19,7],[20,7],[21,8],[22,8]],'h');}}};
try{Object.keys(L17.hair).forEach(k=>{HAIR_STYLE[k]=L17.hair[k];HP.hair[k]={ear:1};});L17.looks.jaeson.hair='l17a';}catch(e){console.error('legends17b hair',e);}
// no glasses (the owner: "just forget the glasses"): a plain face, the blue eyes open
function l17Face(g,L,view,dy){}
// lightning yellow on the staff: a core in the crystal and a small bolt charm under it (the staff drawers add it while Jace's grid is built)
{const sc0=WPN.staff_crystal.draw;WPN.staff_crystal.draw=function(g,x,y){sc0.apply(this,arguments);if(!L17.art||L17.art.k!=='weather')return;const c=x+1;
    g.px([[c,y-26],[c,y-25],[c+1,y-25],[c,y-24]],'Q');g.px([[c+2,y-17],[c+3,y-16],[c+2,y-15],[c+3,y-14]],'Q');g.rect(c-1,y-18,3,1,'Q');};
  const hs0=HPWD.staff;HPWD.staff=function(d,w,o){hs0.apply(this,arguments);if(!L17.art||L17.art.k!=='weather')return;d.dot(16,0,'Q');d.dot(17,0,'Q');d.bar(11,12,0,3,'Q');d.dot(10,2,'Q');d.dot(9,3,'Q');};
  const wf2=weaponFB;weaponFB=function(g,L,view){wf2.apply(this,arguments);if(!L||L.l17!=='weather'||view==='front')return;g.px([[28,5],[29,6],[28,6]],'Q');g.px([[25,9],[26,8]],'Q');};}

// ---------- 6b. battle effects of the signatures (drawing only: no battle state, no battle RNG; nothing under reduced motion) ----------
// One particle kind 'l17' drawn after the others (both stages draw BV.P through drawParts), plus two things that last: the hawk circling over the
// party while Hawk's Watch is up, and the rod of light over Jace while Lightning Rod is up.
const l17Still=()=>{try{return typeof gfxStill==='function'&&gfxStill();}catch(e){return false;}};
const l17C=u=>{try{return centerOf(u);}catch(e){return null;}};
const L17_BIRD={col:{i:'#3a2618',f:'#9a6a42',g:'#f0e2c0',G:'#f2d24a'},
  up:['i...........i..','if.........fi..','.ff.......ff...','..fff...fff....','...ffffffffgG..','..iiffffff.....','.ii............'],
  down:['...............','...............','...ffffffffgG..','..iifffffff....','.ii.ff...ff....','....f.....f....','....i.....i....'],
  stoop:['...............','...............','..iiffffffgG...','.iifffffff.....','ii..ff.........','...............','...............']};
// the hawk in flight, 15 x 7 around (x,y), with a dark edge so it reads over any stage; mode 0 wings up, 1 wings down, 2 stooping
function l17Bird(ctx,x,y,dir,mode,a){x=Math.round(x)-7;y=Math.round(y)-4;const rows=mode===2?L17_BIRD.stoop:mode?L17_BIRD.down:L17_BIRD.up,C=L17_BIRD.col;
  for(let pass=0;pass<2;pass++){ctx.globalAlpha=(a==null?1:a)*(pass?1:.75);for(let j=0;j<rows.length;j++)for(let i=0;i<15;i++){const k=rows[j][dir<0?14-i:i];if(k==='.')continue;
      if(pass){ctx.fillStyle=C[k];ctx.fillRect(x+i,y+j,1,1);}else{ctx.fillStyle='#120a14';ctx.fillRect(x+i-1,y+j,3,1);ctx.fillRect(x+i,y+j-1,1,3);}}}
  ctx.globalAlpha=1;}
// where the circling hawk is at time now (above the middle of the Vanguard)
function l17Circle(now){let x=0,y=1e9,n=0;try{B.front.forEach(u=>{const c=l17C(u);if(c&&u.hp>0){x+=c.x;y=Math.min(y,c.y);n++;}});}catch(e){}if(!n)return null;const a=now/620;
  return {x:x/n+Math.cos(a)*30,y:y-26+Math.sin(a)*7,dir:Math.sin(a)>0?-1:1,flap:Math.floor(now/190)%2};}
function l17Draw(ctx,p,now){const t=now-p.t0;if(t<0)return;const q=t/p.life;if(q>=1)return;const R=Math.round;
  if(p.s==='dive'){// out along a curve to the target, a beat on it, and back up to the circle
    const C=l17Circle(now)||{x:p.x,y:p.y},e=q<.42?q/.42:q<.56?1:1-(q-.56)/.44,k=e*e*(3-2*e),x=C.x+(p.x2-C.x)*k,y=C.y+(p.y2-C.y)*k-Math.sin(k*Math.PI)*8*(q<.5?-1:1);
    if(q<.56)for(let j=1;j<=4;j++){const k2=Math.max(0,k-j*.07),tx=C.x+(p.x2-C.x)*k2,ty=C.y+(p.y2-C.y)*k2;ctx.globalAlpha=.5-j*.1;ctx.fillStyle='#f0e2c0';ctx.fillRect(R(tx),R(ty),2,1);}
    l17Bird(ctx,x,y,p.x2>=C.x?1:-1,q<.5?2:Math.floor(now/110)%2,1);
    if(q>.4&&q<.62){const r=R(2+5*Math.sin((q-.4)/.22*Math.PI));ctx.globalAlpha=.9;ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x2)-r,R(p.y2),r*2+1,1);ctx.fillRect(R(p.x2),R(p.y2)-r,1,r*2+1);ctx.globalAlpha=1;}}
  else if(p.s==='tracer'){// one bolt: a white core and a coloured sheath that thins out, a flare at each end
    const e=Math.min(1,q*7),al=q<.35?1:1-(q-.35)/.65,n=Math.ceil(Math.hypot(p.x2-p.x,p.y2-p.y)*e),pc=ctx.globalCompositeOperation;ctx.globalCompositeOperation='lighter';
    for(let pass=0;pass<2;pass++){const th=pass?Math.max(1,R(p.th*.4*(1-q*.6))):Math.max(1,R(p.th*(1-q*.5)));ctx.fillStyle=pass?'#ffffff':p.col;ctx.globalAlpha=al*(pass?1:.55);
      for(let i=0;i<=n;i+=1){const k=i/Math.max(1,n);ctx.fillRect(R(p.x+(p.x2-p.x)*e*k),R(p.y+(p.y2-p.y)*e*k-th/2),2,th);}}
    if(q<.5){const r=R(p.th*2.2*(1-q*2));ctx.globalAlpha=al;ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x2)-r,R(p.y2)-1,r*2+1,2);ctx.fillRect(R(p.x2)-1,R(p.y2)-r,2,r*2+1);}
    ctx.globalCompositeOperation=pc;ctx.globalAlpha=1;}
  else if(p.s==='reticle'){// Steady Draw: a sight closes on the foe he will shoot
    const r=p.r*(1.6-.6*Math.min(1,q*2.5)),al=q<.75?1:1-(q-.75)/.25;ctx.globalAlpha=al;ctx.strokeStyle=p.col;ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.stroke();
    ctx.fillStyle=p.col;[[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>ctx.fillRect(R(p.x+d[0]*r*.55)-(d[0]?2:0),R(p.y+d[1]*r*.55)-(d[1]?2:0),d[0]?5:1,d[1]?5:1));ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x),R(p.y),1,1);ctx.globalAlpha=1;}
  else if(p.s==='feed'){// a bolt taken in: light runs down him into the ground and up again as motes
    const al=1-q,pc=ctx.globalCompositeOperation;ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);g.addColorStop(0,'rgba(190,235,255,'+(.55*al).toFixed(3)+')');g.addColorStop(1,'rgba(190,235,255,0)');
    ctx.fillStyle=g;ctx.fillRect(p.x-p.r,p.y-p.r,p.r*2,p.r*2);ctx.globalCompositeOperation=pc;
    ctx.fillStyle='#fff6a0';for(let i=0;i<7;i++){const a=i/7*6.283+p.seed,rr=p.r*(.9-q*.7);ctx.globalAlpha=al;ctx.fillRect(R(p.x+Math.cos(a)*rr),R(p.y+Math.sin(a)*rr*.6-q*10),1,2);}
    ctx.globalAlpha=al;ctx.strokeStyle='#9fd8ff';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.gy,p.r*(.3+q),p.r*(.3+q)*.3,0,0,7);ctx.stroke();ctx.globalAlpha=1;}
  else if(p.s==='arc'){// an enemy bolt bent to the Rod: a jagged line from the foe to him
    const e=Math.min(1,q*3),al=1-q,n=Math.ceil(Math.hypot(p.x2-p.x,p.y2-p.y)/3*e);let px=p.x,py=p.y;ctx.globalAlpha=al;ctx.strokeStyle='#fff6a0';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px,py);
    const Rn=mulberry(Math.floor(p.seed+t/45));for(let i=1;i<=n;i++){const k=i/Math.max(1,n)*e;ctx.lineTo(p.x+(p.x2-p.x)*k+(Rn()-.5)*7,p.y+(p.y2-p.y)*k-Math.sin(k*Math.PI)*14+(Rn()-.5)*7);}ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=.6;ctx.stroke();ctx.globalAlpha=1;}
  else if(p.s==='hail'){// a wave of the Limit over one foe: ice falls as shards, lightning as a fork
    if(p.el==='ice'){for(let i=0;i<6;i++){const k=((q*1.2+i*.16)%1),x=p.x+(i-2.5)*4+k*4,y=p.y-46+k*46;ctx.globalAlpha=(1-q)*.95;ctx.fillStyle=i%2?'#ffffff':'#bfefff';ctx.fillRect(R(x),R(y),1,4);ctx.fillRect(R(x)-1,R(y)+1,3,1);}
      ctx.globalAlpha=(1-q)*.5;ctx.fillStyle='#bfefff';ctx.beginPath();ctx.ellipse(p.x,p.gy,12*Math.sqrt(q),4*Math.sqrt(q),0,0,7);ctx.fill();ctx.globalAlpha=1;}
    else{ctx.globalAlpha=1-q;ctx.fillStyle='#fff6a0';let x=p.x,y=p.y-70;const Rn=mulberry(Math.floor(p.seed+t/45));while(y<p.y){const nx=x+Math.round((Rn()-.5)*9);ctx.fillRect(Math.min(x,nx),y,Math.abs(nx-x)+2,4);if(Rn()<.25)ctx.fillRect(nx+(Rn()<.5?-6:3),y+2,5,1);x=nx;y+=4;}
      ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x)-2,R(p.y)-2,5,5);ctx.globalAlpha=1;}}
}
HOOK.after('drawParts','legends17b','hawk, tracer, sight, the fed bolt, the bent bolt, the Limit\'s waves; the circling hawk and the rod of light',function(r,ctx,now){try{if(!B||V.screen!=='battle')return;
  const P=BV.P;for(let i=0;i<P.length;i++)if(P[i].k==='l17')l17Draw(ctx,P[i],now);
  const still=l17Still(),nk=allParty().find(c=>c.id==='nikaris'&&c.hp>0&&has(c,'l17watch')&&!c.st.l17watch.fake);
  if(nk&&!P.some(p=>p.k==='l17'&&p.s==='dive'&&now>=p.t0&&now<p.t0+p.life)){const C=l17Circle(still?0:now);if(C){ctx.globalAlpha=.25;ctx.fillStyle='#000';ctx.fillRect(Math.round(C.x)-4,Math.round(C.y)+36,9,2);l17Bird(ctx,C.x,C.y,C.dir,still?0:C.flap,1);}}
  const j=l17RodOn();if(j&&!j.st.l17rod.fake){const c=l17C(j),b=unitBox(j);if(c&&b){const top=b.y-b.h-3,pc=ctx.globalCompositeOperation;ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=.55+(still?0:.25*Math.sin(now/130));ctx.fillStyle='#fff6a0';ctx.fillRect(Math.round(c.x),Math.round(top-16),1,16);ctx.fillRect(Math.round(c.x)-1,Math.round(top-18),3,2);
      if(!still){const Rn=mulberry(Math.floor(now/90));for(let i=0;i<3;i++){ctx.globalAlpha=.8;ctx.fillRect(Math.round(c.x+(Rn()-.5)*9),Math.round(top-16+Rn()*14),2,1);}}
      ctx.globalCompositeOperation=pc;ctx.globalAlpha=1;}}}catch(e){L17.fxErr=String(e&&e.stack||e);}ctx.globalAlpha=1;});
const l17P2=o=>{if(l17Still())return;o.k='l17';o.t0=o.t0||performance.now();part(o);};
l17FxDive=function(nk,t){const c=l17C(t),a=l17C(nk);if(!c||!a)return;l17P2({s:'dive',x:a.x,y:a.y-30,x2:c.x,y2:c.y,life:900,t0:performance.now()+120});};
l17FxAbsorb=function(j){const c=l17C(j),b=unitBox(j);if(!c||!b||l17Still())return;const now=performance.now();part({k:'bolt',x:c.x,y:c.y,t0:now,life:260,col:'#fff6a0',seed:Math.random()*1000});
  BV.flash={t:now,life:110,col:'rgba(255,255,220,.3)'};l17P2({s:'feed',x:c.x,y:c.y,gy:b.gy!=null?b.gy:b.y,r:22,seed:Math.random()*6,life:700,t0:now+60});try{sparkleUp(c.x,c.y+6,'#9fd8ff',now+120,10);}catch(e){}};
l17FxStrike=function(t){const c=l17C(t);if(!c||l17Still())return;const now=performance.now();part({k:'bolt',x:c.x,y:c.y,t0:now,life:220,col:'#fff6a0',seed:Math.random()*1000});BV.flash={t:now,life:90,col:'rgba(255,255,220,.3)'};};
l17FxCall=function(a,k){const c=l17C(a);if(!c||l17Still())return;const now=performance.now(),col=k==='storm'?'#fff6a0':'#bfefff';BV.flash={t:now,life:160,col:k==='storm'?'rgba(255,255,220,.32)':'rgba(215,240,255,.36)'};
  try{fkP({s:'pillar',x:c.x,y:c.y+10,w:5,col,t0:now,life:420});sparkleUp(c.x,c.y,col,now+80,12);}catch(e){}};
l17FxWave=function(a,el,i,n){if(l17Still())return;const now=performance.now()+i*230;B.en.forEach((t,ti)=>{if(t.hp<=0&&!(t.fxT&&Date.now()-t.fxT<80))return;const c=l17C(t),b=unitBox(t);if(!c||!b)return;
    l17P2({s:'hail',el,x:c.x,y:c.y,gy:b.gy!=null?b.gy:b.y,seed:Math.random()*1000,life:420,t0:now+ti*40});});
  BV.shake={t:now,life:200,amp:2+(i===n-1?2:0)};if(i===n-1)BV.flash={t:now,life:140,col:el==='ice'?'rgba(215,240,255,.4)':'rgba(255,255,220,.4)'};};
// the steadied shot and Horizon Shot: a tracer from the bow to the foe; Steady Draw itself: the sight closes on the foe he is likeliest to shoot
function l17FxShot(a,sk,tgts){if(l17Still())return;const c=l17C(a),t=(tgts||[])[0],d=t&&l17C(t);if(!c||!d)return;const big=sk.id==='tenk',now=performance.now()+140;
  l17P2({s:'tracer',x:c.x+6,y:c.y-2,x2:d.x,y2:d.y,th:big?7:4,col:big?'#c8a0ff':'#ffe08a',life:big?900:560,t0:now});if(big){BV.shake={t:now+60,life:260,amp:4};BV.flash={t:now+40,life:120,col:'rgba(230,210,255,.4)'};}}
function l17FxSteady(a){if(l17Still()||!B)return;const live=B.en.filter(e=>e.hp>0).sort((x,y)=>y.hp-x.hp)[0],d=live&&l17C(live);if(d)l17P2({s:'reticle',x:d.x,y:d.y,r:9,col:'#f2d24a',life:700});}
HOOK.after('addSt','legends17b','the sight of Steady Draw',function(r,t,k){try{if(r&&k==='l17steady'&&t&&B&&L17.perf===0)l17FxSteady(t);}catch(e){}});
function l17FxBend(u,j){if(l17Still())return;const c=l17C(u),d=l17C(j);if(!c||!d)return;l17P2({s:'arc',x:c.x,y:c.y,x2:d.x,y2:d.y,seed:Math.random()*1000,life:380});}

// ---------- 7. unlocking: a board quest that needs no code ----------
// Each of the three keeps his redeem code (legends.js LEGEND_CODES; with a code his own meeting posts on a board as before). Without a code a
// "trail" posts on the realm's board: win L.wins fights in that realm's fields, then one fight of his own on the field, then the old meeting
// (Kaevan's ride, the pup and the hawk, the frozen lake). The quest is a legend quest (type 'legend', trail:1, tstep 0..2), so the board, the
// markers, the map and the goals treat it like the others. Joining him by either road unlocks him on the account (META.legends).
// After 0.22.3 (legends18.js): Nikaris's trail ends with its own fight: he steps out, talks and joins the moment the Pack Mother is beaten.
Object.assign(L17.quest,{
 nikaris:{from:1,wins:4,title:'Tracks at the Treeline',art:'v_heathwolf',fightN:'The Pack Mother',go:'Stand your ground',
  desc:s=>`Something has been hunting the hunters of ${ZS(s).n}: arrows left in a neat row on the road, each one through a snare. Walk the fields, show whoever it is you can fight, and the tracks may lead somewhere.`,
  won:'The tracks turn off the road here. Something grey is watching from the long grass.',
  talk:'A grey she-wolf steps onto the path with two pups behind her and does not move. From the trees, a low whistle: someone wants to see how you treat her.',
  after:'She limps back to her pups and lets you pass. Somewhere ahead a wolf pup is whining.',
  foes(s,lv){const m=makeEnemy(MON.v_heathwolf,lv,{elite:true,name:'The Pack Mother',hpM:3.4+.25*s,powM:1.15+.04*s});return [m].concat([0,1].map(()=>{const p=makeEnemy(MON.v_bramblepup,Math.max(2,lv-3));p.name='Thicket Pup';return p;}));}},
 kaevan:{from:2,wins:4,title:'Feathers on the Wind',art:'mb_stormcrown',fightN:"The Rider's Stormhawk",go:'Bring it down',wx:'gale',
  desc:s=>`Black fletched bolts stand in the fence posts along the road through ${ZS(s).n}, each one a bowshot further than the last. Somebody is keeping score. Win fights in the fields and see who is counting.`,
  won:'A hawk the size of a door circles above the road, waiting for you.',
  talk:'The great hawk drops to a post and mantles, a black ribbon tied at its leg. Its master sent it to see whether you are worth stopping for.',
  after:'The hawk shrieks once and flies off toward the dusk. Hoofbeats answer it.',
  foes(s,lv){const m=makeEnemy(MON.mb_stormcrown,lv,{elite:true,name:"The Rider's Stormhawk",hpM:3.2+.25*s,powM:1.15+.04*s});return [m].concat([0,1].map(()=>{const h=makeEnemy(MON.thunderhawk,Math.max(2,lv-3));h.name='Steppe Hawk';return h;}));}},
 jaeson:{from:2,wins:4,title:'The Storm That Stays',art:'stormling',fightN:'The Eye of the Squall',go:'Walk into it',wx:'storm',
  desc:s=>`A thunderstorm has parked over ${ZS(s).n} and will not move on. Lightning keeps hitting the same spot. Fight your way across the fields toward it and find out what is standing there.`,
  won:'The air tastes of metal. The heart of the storm is close, and it has noticed you.',
  talk:'The storm has a middle, and the middle has a face: a knot of lightning that turns to look at you. Beyond it, on the lake, someone is holding the whole sky up and watching to see what you do.',
  after:'The knot of lightning comes apart. The storm does not: it settles over the lake, waiting.',
  foes(s,lv){const m=makeEnemy(MON.stormling,lv,{elite:true,name:'The Eye of the Squall',hpM:3.4+.25*s,powM:1.15+.04*s});return [m].concat([0,1].map(()=>{const h=makeEnemy(MON.o_ysolde,Math.max(2,lv-3));h.name='Squall Wisp';return h;}));}}});
const l17Trail=q=>!!(q&&q.type==='legend'&&q.trail&&L17.quest[q.hero]);
function l17QuestOk(id,s){const D=L17.quest[id];if(!D||s<D.from)return false;try{if(typeof p2Dual==='function'&&p2Dual(id)&&s<DUAL_HERO_FROM)return false;}catch(e){}
  if(id==='jaeson'&&s<3&&!['snow','heights'].includes(ZS(s).theme))return false;return true;}
function l17QuestRoll(s){if(!G||G.daily)return;Object.keys(L17.quest).forEach(id=>{
    if(legendOn(id)||G.roster[id]||G.quests.some(q=>q.type==='legend'&&q.hero===id)||!l17QuestOk(id,s))return;const D=L17.quest[id];
    G.quests.push({id:'T'+id,stage:s,type:'legend',hero:id,trail:1,tstep:0,have:0,n:D.wins,state:'open',step:0,title:D.title,desc:D.desc(s),reward:{gold:0}});});}
HOOK.after('genQuests','legends17b','the trail of a Legendary nobody has a code for',function(r,s){try{l17QuestRoll(s);}catch(e){console.error('legends17b quest',e);}});
{const lp0=legendProg;legendProg=function(q){try{if(l17Trail(q)&&q.state!=='claimed'){const n=ZS(q.stage).n,D=L17.quest[q.hero];
    if((q.tstep||0)===0)return `Win fights in the fields of ${n}: ${Math.min(q.have||0,q.n)}/${q.n}`;if(q.tstep===1)return `Face ${D.fightN} in the fields of ${n}`;}}catch(e){}return lp0.apply(this,arguments);};}
// step 1: fights won in that realm's fields
HOOK.before('win','legends17b','a field fight won counts for a trail',function(){try{if(!B||!G||G.daily)return;const k=B.spec&&B.spec.kind;if(k!=='field'&&k!=='elite')return;
  G.quests.forEach(q=>{if(!l17Trail(q)||q.state!=='active'||(q.tstep||0)!==0||q.stage!==B.stage)return;q.have=(q.have||0)+1;
    if(q.have>=q.n){q.tstep=1;L17.note=`${q.title}: ${L17.quest[q.hero].won}`;}});}catch(e){}});
HOOK.after('render','legends17b','the trail moves on: one notice',function(){try{if(L17.note&&V.screen==='world'&&!V.modal){const m=L17.note;L17.note=null;toast(m);}}catch(e){}});
// step 2: the fight of his own stands on the field in place of the meeting
HOOK.xform('dynActors','legends17b','a trail shows nothing while fights are counted, then its own foe',function(out,m){try{if(!out||!out.length)return out;
  return out.filter(a=>{if(!a||a.type!=='legend'||!l17Trail(a.q))return true;const t=a.q.tstep||0;if(t===0)return false;if(t===1)a.mon=L17.quest[a.q.hero].art;return true;});}catch(e){return out;}});
HOOK.before('actorTalk','legends17b','the trail\'s own fight',function(a){try{if(a&&a.type==='legend'&&l17Trail(a.q)&&a.q.tstep===1){const D=L17.quest[a.q.hero];
  V.modal={type:'legendEvt',hero:a.q.hero,l17:1,text:D.talk,fight:D.go};render();return HOOK.stop();}}catch(e){}});
{const ml0=mLegendEvt;mLegendEvt=function(m){if(!m||!m.l17)return ml0.apply(this,arguments);const D=L17.quest[m.hero];
  return box(esc(D.fightN),`<div class="mh"><div class="pbig leg"><img src="${monURL(MON[D.art].art)}" alt=""></div><div class="grow"><p class="story">${esc(m.text)}</p><p class="note">This is a tough fight. Rest first.</p></div></div>`,
    `<button class="btn" data-act="closeModal">Not yet</button><button class="btn gold" data-act="legendFight">${esc(m.fight)}</button>`,true);};}
{const lf0=ACT.legendFight;ACT.legendFight=function(){const m=V.modal;if(!m||!m.l17)return lf0.apply(this,arguments);const q=G.quests.find(x=>l17Trail(x)&&x.hero===m.hero);if(!q)return;V.modal=null;
  const D=L17.quest[m.hero];if(!startBattle({stage:q.stage,kind:'legend',hero:m.hero,step:0,l17trail:1,weather:D.wx||undefined})){toast('Your party needs rest first.');render();}};}
HOOK.before('encounterFoes','legends17b','the foes of a trail fight',function(spec){try{if(spec&&spec.kind==='legend'&&spec.l17trail&&L17.quest[spec.hero])return HOOK.stop(L17.quest[spec.hero].foes(spec.stage,STAGE_LV[spec.stage][1]+1));}catch(e){console.error('legends17b foes',e);}});
{const lw0=legendWin;legendWin=function(spec,info){if(spec&&spec.l17trail){try{const q=G.quests.find(x=>l17Trail(x)&&x.hero===spec.hero);if(q){q.tstep=2;q.step=0;}info.legend=L17.quest[spec.hero].after;}catch(e){}return;}return lw0.apply(this,arguments);};}
// joining by either road unlocks him on the account
{const lj0=legendJoin;legendJoin=function(id,info){const r=lj0.apply(this,arguments);try{if(G&&G.roster[id]&&LEGEND_IDS.includes(id)&&L17.quest[id]&&!legendOn(id)){META.legends=META.legends||{};META.legends[id]=1;saveMeta();try{profileDirty();}catch(e){}
    L17.note=`${TPL[id].title} is unlocked on your account: on later journeys his own quest posts on a board.`;}}catch(e){}return r;};}
// Help > Redeem names the other road
{const vr0=vRedeem;vRedeem=function(){let h=vr0.apply(this,arguments);try{h=h.replace(/Needs a redeem code\./g,'Needs a redeem code, or follow the trail a Notice Board posts for him on a journey.');}catch(e){}return h;};}

// ---------- 8. summons (after 0.22.1, the owner: "make what balance changes you see fit for the summons") ----------
// 0.22.3 had the Monk's lesser guardian fight beside him. After 0.22.3 (the owner: "just give monks the same summon (invoke) capabilities of priest")
// that is gone: a Monk Invokes the full guardian in the whole Vanguard's place (summon8.js SUM.call). What stays here: any fourth unit of the
// Vanguard (none of the base game's; a guard for what may stand there) gets a place on the stage, and the Summons tab's hint.
HOOK.wrap('unitBox','legends17b','a fourth unit of the Vanguard has a place of its own',function(next,u){
  if(!u||!(B&&u.side==='p'&&B.front.indexOf(u)>2))return next(u);/* any fourth unit of the Vanguard: the base has three places */
  L17.four=(u.id||u.name)+(u.isSum?' sum':'')+(u.isComp?' comp':'');
  try{const i=B?B.front.indexOf(u):-1;if(i<0)return null;const c=spriteOf(u),w=c.width,h=c.height,W=BL.W,H=BL.H,f=typeof k12Fig==='function'?k12Fig(u):null,lo=f?(f.w/2-f.r):-w/2,hi=f?(f.w/2-f.l):w/2;
    // like a Priest's guardian (kits12.js): on the boss line, its figure clear of the heroes on its right
    let e=1e9;B.front.forEach(q=>{if(q===u||q.hp<=0||B.front.indexOf(q)>2)return;const b=next(q);if(b)e=Math.min(e,b.x-b.w/2);});
    let x=e<1e9?Math.round(e-(typeof K12!=='undefined'?K12.gap:2)-hi):Math.round(W*.55);x=Math.min(x,W-1-hi);x=Math.max(x,1-lo);
    return {x,y:Math.round(slotsFor('e',1,true)[0][1]*H),w,h,i};}catch(e){return null;}});
{const vc1=vCompanions;vCompanions=function(){let h=vc1.apply(this,arguments);try{
    if(G&&!G.daily&&!/l17sumhint/.test(h)){const i=h.indexOf('</p>');if(i>=0)h=h.slice(0,i+4)+'<p class="note l17sumhint">Sanctum guardians and Lesser Scourges are made for boss fights: in an ordinary field fight they make the fight longer.</p>'+h.slice(i+4);}}catch(e){}return h;};}

// tests
try{window.__L17={L17,kit:id=>classSkills(TPL[id]),keep:g=>l17Keep(g),absorb:(j,w)=>l17Absorb(j,w||'Test.'),call:(a,k)=>l17Call(a,k),jace:()=>l17Jace(),rodOn:()=>l17RodOn(),auto:(a,f)=>l17Auto(a,f),
  fldOf:c=>l17FldOf(c),fldBlock:k=>l17FldBlock(k),questRoll:s=>l17QuestRoll(s),questOk:(id,s)=>l17QuestOk(id,s),trail:q=>l17Trail(q),get G(){return G;},get B(){return B;},get V(){return V;},get META(){return META;},
  get WEATHER(){return WEATHER;},get RNG(){return RNG;},set RNG(f){RNG=f;},known:c=>known(c),limit:c=>limitSkill(c),perform:(a,s,t)=>perform(a,s,t),calc:(a,s,t)=>calcDamage(a,s,t),weatherEvent:()=>weatherEvent(),foePlan:u=>foePlan(u),est:(u,s,t)=>c5Est(u,s,t)};}catch(e){}
