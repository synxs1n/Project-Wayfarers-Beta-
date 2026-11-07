// ===== onboard.js (v0.7.0): onboarding: one tip card the first time each system appears =====
// v0.9.5 (docs/v095-nudges.md): battle cards are one line actions with a reason; expert cards (x: Reactions in depth, Tempering, Echoforge,
// guild ranks, New Game+ modifiers) wait until the player has opened that system once (META.tips.u "o:..." keys, set by obOpened).
// One short card (two lines at most, plain words) the first time the player really meets a system: the first primed foe, the
// first shield, the first tame offer, the first time Alchemy sells Camp Supplies, and so on. It reuses the 2.7 hint card
// (p2world.js: the #p2hint element, its look and hintPlace) with "Got it" and "More" (More opens Guides > How it works at that
// system). One card at a time: the rest wait in a queue, and a queued card is dropped (not marked seen) when its moment passes,
// so it comes back the next time that moment does. Nothing shows during a boss's first turn, in the Daily Trial, or while a story
// or a campfire talk is on screen. Content gates are untouched: this only teaches.
// Settings: "Tips" (META.cfg.tips; an old save that turned hints off starts with tips off too) and "Reset tips". The existing
// first realm hints follow the Tips switch as well (they still have their own Hints switch).
// New optional field: META.tips = {s:{id:1} cards seen, u:{id:1} systems used}. Save keys, slot keys and the profile doc are unchanged
// (META.tips stays in local storage; the cloud profile only carries best, codex, legends, facBest and archivist).
// Guides > What next? gains "Not tried yet": systems met but never used (Camp Supplies carried but no camp made, and so on).
// Battle: the card is placed on the stage on a free spot found from the b3Lay boxes (battle3.js: sprite bodies and every stage
// label) and the DOM cards, so it never covers a face, a foe card or the commands. hintPlace is replaced with that search, so the
// first realm hints get it too.

const OB={q:[],cur:null,curCtx:null,last:0,tick:null,hide:null,el:null,shownAt:0};
const OB_GAP=1100,OB_HIDE=18000,OB_TICK=400;
function obM(){META.tips=META.tips&&typeof META.tips==='object'?META.tips:{};META.tips.s=META.tips.s||{};META.tips.u=META.tips.u||{};return META.tips;}
function tipsOn(){const c=META.cfg||{};return c.tips!=null?c.tips!==false:c.hints!==false;}
function tipSeen(id){return !!obM().s[id];}
function tipUsed(id){return !!obM().u[id];}
function tipUse(id){try{if(!G||G.daily)return;const M=obM();if(!M.u[id]){M.u[id]=1;saveMeta();}}catch(e){}}
const obLive=()=>!!(G&&G.run&&!G.daily);
// contexts: a battle in progress with the commands up at least once, the world with no window open, a given window
function obBat(){return !!(obLive()&&V.screen==='battle'&&B&&!B.over&&!V.modal&&(B.pturns||0)>=1&&!(B.spec&&B.spec.kind==='daily'));}
function obWorld(){return !!(obLive()&&V.screen==='world'&&!V.modal&&!B);}
function obModal(t){return !!(obLive()&&V.modal&&V.modal.type===t);}
function obTab(){const m=V.modal||{};return m.tab||m.gtab||'';}
// a boss's first turn: from the start of a boss fight until the boss has acted once and the party has had a turn after it
function obBossHold(){try{if(!B||!B.boss||B.over||V.screen!=='battle')return false;const bs=B.en.filter(e=>e.boss);return !(bs.some(e=>(e.turns||0)>=1)&&(B.pturns||0)>=2);}catch(e){return false;}}
const obFront=()=>B?B.front.filter(c=>c&&c.hp>0):[];
const obFoes=()=>B?B.en.filter(e=>e&&e.hp>0):[];
function obCharm(id){const g=gearOf(id);return !!(g&&g.slot==='c');}
function obReserves(){return G?Object.keys(G.roster).filter(id=>!G.party.includes(id)):[];}

// v0.9.5 battle cards are one line actions with a reason. A primed foe names the hero and skill that sets it off, when the party has one.
function obPrimedTip(e){const pe=e.primed.el;let best=null;
  try{obFront().forEach(c=>{if(best)return;known(c).forEach(s=>{if(best||s.role!=='det'||(s.mp||0)>c.mp)return;const x=skEls(s).find(el=>reactFor(pe,el));if(x)best={c,s,R:reactFor(pe,x)};});});}catch(err){}
  if(best)return `Primed with ${EL[pe]}: try ${p2Nm(best.c)}'s ${best.s.n} on ${e.name}.`;
  const ds=Object.values(REACT).filter(R=>R.p===pe).map(R=>EL[R.d]);
  return `${e.name} is primed with ${EL[pe]}. Try a ${ds[0]} Detonator on it.`;}
function obReactFx(R){const W={blind:'blinds',stun:'stuns',slow:'slows',burn:'burns',root:'roots',break:'breaks armor',weaken:'weakens',bleed:'makes it bleed'};
  const L=(R.fx||[]).map(f=>W[f[0]]).filter(Boolean);if(R.splash)L.push('splashes nearby foes');if(R.strip)L.push('strips buffs');if(R.selfFx)L.push('wards the caster');if(R.allyFx)L.push('heals your Vanguard over time');
  return L.length?L[0]:'hits harder than most';}
// expert cards (x): only after the player has opened that system once (META.tips.u), so a newcomer meets the basics first
// ----- the systems: id, Guides section, the moment (returns the card text, or null when it is not the moment), the longer Guides text -----
// t: card text. g: Guides text. sec: Guides group. more: the Guides tab "More" opens ('sysg' by default). go: a button on the Guides entry.
const TIPS=[
 // battle
 {id:'weak',n:'Elements',sec:'Battle',more:'types',go:['menuTab','types','Foe types'],
  t:()=>obBat()&&B.hitWeak?'Weak spot! Aim where the tag says Weak: more damage, and shields crack.':null,
  g:'Every hero and foe has one or two elements (fire, water, earth and so on). Hitting a weakness deals extra damage and cracks a shield; a resisted hit does less. The tag over a foe while you aim tells you which before you strike. Guides > Foe types has the full chart.'},
 {id:'types',n:'Foe types',sec:'Battle',more:'types',go:['menuTab','types','Foe types'],
  t:()=>{if(!obBat())return null;const e=obFoes().find(x=>x.ty&&x.ty.length&&ARCH[x.ty[0]]);return e?`${e.name} is ${ARCH[e.ty[0]].n}. Tap it to see which kinds of hits it fears, then use those.`:null;},
  g:'Many foes have a type such as Flying, Armored, Jelly, Undead, Swarm, Beast or Plant. The type decides which kinds of hits work best against it. Tap a foe in battle, or open Guides > Foe types, to read what each type fears.'},
 {id:'deliver',n:'Kinds of hits',sec:'Battle',more:'types',
  t:()=>{if(!obBat())return null;const e=B.en.find(x=>(x.fx||[]).some(f=>/effx/.test(f.cls||'')));return e?'▲ over a foe: this kind of hit suits it, keep using that hero. ▼: try another hero.':null;},
  g:'Every attack has a kind: Slash, Blunt, Piercing, Ranged or Magic (heals count as Heal). Against a foe with a type, some kinds hit harder (▲ over the foe) and some glance off (▼). Weapons decide the kind of a plain Attack, so a mixed party has an answer for every type.'},
 {id:'shield',n:'Shields and Break',sec:'Battle',
  t:()=>{if(!obBat())return null;const e=obFoes().find(x=>x.maxShield>0);return e?`${e.name} has a shield. Hit its weakness or set off a reaction on it to Break it.`:null;},
  g:'Elites, Scourges and Calamities carry a shield, shown as diamonds beside their HP bar. Hits on a weakness crack one diamond and reactions crack three. When the last one goes the foe Breaks: it loses its next turn and takes more damage until it recovers.'},
 {id:'primed',n:'Primers',sec:'Battle',
  t:()=>{if(!obBat())return null;const e=obFoes().find(x=>x.primed&&EL[x.primed.el]);return e?obPrimedTip(e):null;},
  g:'A Primer skill marks a foe with its element for two turns (the small element badge with a number). While it lasts, a Detonator skill of a different element sets it off. Primers and Detonators are role skills that wayfarers learn with levels; the skill list says which is which.'},
 {id:'react',n:'Reactions and Detonators',sec:'Battle',
  t:()=>{if(!obBat()||!(B.nDet>0))return null;const e=B.en.find(x=>x.reactN);return `${e?e.reactN+'! ':''}Primer then Detonator hits hard and cracks shields. Prime the next foe too.`;},
  g:'When a Detonator hits a Primed foe, the two elements react: Melt, Overload, Shatter and many more, each with its own extra effect. A reaction hits hard and cracks three shield diamonds. While you aim a Detonator, the foes it would set off glow and name the reaction.'},
 // v0.9.5: an expert card, only once the player has opened Lore (in battle or the menu)
 {id:'react2',n:'Reactions in depth',sec:'Battle',x:'o:lore',go:['cmdLoreOb','','Lore'],
  t:()=>{if(!obBat()||!(B.nDet>0))return null;const e=B.en.find(x=>x.reactN&&x.reactP&&x.reactEl);if(!e)return null;const R=REACT[reactKey(e.reactP,e.reactEl)];if(!R)return null;
   return `${R.n} also ${obReactFx(R)}. Every element pair reacts its own way; Lore lists all ${Object.keys(REACT).length}.`;},
  g:'Every pair of elements makes its own reaction, and each adds something besides the big hit: Steam and Sandblast blind, Conduct and Freeze stun, Mire and Permafrost root, Wildfire and Overload splash onto other foes, Purge strips a foe\'s buffs, Melt and Eclipse simply hit hardest. The primer element is the one marked on the foe; the detonator is the skill you hit it with. Lore in battle lists them all.'},
 {id:'status',n:'Statuses',sec:'Battle',go:['cmdLoreOb','','Lore'],
  t:()=>{if(!obBat())return null;const u=obFront().concat(obFoes()).find(x=>Object.keys(x.st||{}).some(k=>STS[k]&&STS[k].bad));return u?`${u.name} has a status. Tap them to read the icon; a Remedy cures the bad ones.`:null;},
  g:'Statuses are small icons next to a unit: poison, burn, slow, stun and others hurt, while haste, might and ward help. They wear off after a few turns. Tap a hero or foe to read them, use a Remedy from Items to cure a hero, and open Lore in battle for the full list.'},
 {id:'limit',n:'Limit',sec:'Battle',
  t:()=>{if(!obBat()||B.mode!=='cmd'||!B.cur||B.cur.side!=='p'||!lbReady(B.cur))return null;return `${p2Nm(B.cur)}'s Limit is full. Tap the gold Limit button now for their biggest move.`;},
  g:'Heroes fill a Limit bar (the thin gold bar under their HP) by taking hits and when allies fall. When it is full, a gold Limit button appears at the top of that hero\'s commands. Limit moves are each class\'s strongest; at higher levels they grow into a stronger second tier.'},
 {id:'switch',n:'Switching',sec:'Battle',
  t:()=>{if(!obBat()||B.mode!=='cmd'||!B.cur||B.cur.side!=='p'||!canSwap())return null;const c=B.cur;return c.hp<c.S.mhp*.4?`${p2Nm(c)} is hurt. Switch them out: a Rearguard hero comes in and acts at once.`:null;},
  g:'The front three of your party are the Vanguard and the back three the Rearguard. On a Vanguard hero\'s turn, Switch trades that hero for one of them, and the newcomer acts at once. The hero who steps back sheds their statuses. When a Vanguard hero falls, the next Rearguard hero steps in by themselves.'},
 {id:'scan',n:'Scan and Lore',sec:'Battle',go:['menuTab','beasts','Bestiary'],
  t:()=>{if(!obBat()||B.mode!=='cmd')return null;const e=obFoes().find(x=>x.boss||x.elite);if(!e)return null;const b=(META.best||{})[e.base]||{};return b.scan?null:`Scan ${e.name} first: its exact stats and hidden quirk show, for half a turn.`;},
  g:'Scan, under the main commands, reads one foe\'s exact HP and stats, its hidden quirk and a boss\'s turning point, for half a turn. What you learn stays in the Bestiary. Lore pauses the fight and lists elements, reactions and statuses.'},
 {id:'summon',n:'Summons',sec:'Creatures',
  t:()=>{if(!obBat()||B.mode!=='cmd'||!B.cur||!canSummon(B.cur))return null;const o=compOf(B.cur);return o?`${p2Nm(B.cur)} can Summon ${o.name}: call it in to fight for a few turns.`:null;},
  g:'A hero paired with a companion gets a Summon command. The companion takes the hero\'s place for a few turns, once per battle, then the hero comes back. Companions never fight in the Daily Trial.'},
 {id:'echo',n:'Echoes',sec:'Later',
  t:()=>{if(!obBat())return null;const e=obFoes().find(x=>/^Echo /.test(x.name||''));return e?`${e.name} is an Echo, a stronger form of a beaten boss. Its shards forge rare weapons.`:null;},
  g:'After a Scourge or Calamity falls, its Echo lingers: a stronger form with an extra phase. Echoes drop Echo Shards and Essence, which the Smithy\'s Echoforge turns into the six Echoforged weapons.'},
 // creatures
 {id:'tame',n:'Taming',sec:'Creatures',go:['obBeasts','tame','Taming log'],
  t:()=>{if(!obModal('result'))return null;const i=V.modal.info;return i&&i.tame&&!i.tamed?`${i.tame.name} wants to join you! Tame it, then pair it with a hero who can summon it.`:null;},
  g:'Beaten bounty beasts, and now and then a wild monster or a lesser Scourge, may ask to join you on the rewards screen. Up to 8 can follow you. Records > Bestiary > Taming log shows what can be tamed and where it roams.'},
 {id:'comp',n:'Companions',sec:'Creatures',go:['menuTab','comp','Companions'],
  t:()=>{if(!obWorld())return null;const o=(G.tamed||[]).find(x=>!x.with);return o?`${o.name} needs a partner. Pair it with a hero in Party > Companions.`:null;},
  g:'Each tamed creature can be paired with one hero in Party > Companions. The hero gets a stat bonus from it, and a Summon command in battle. You can change pairs any time.'},
 {id:'stick',n:"The Tamer's Stick",sec:'Creatures',
  t:()=>{if(!obModal('board'))return null;const q=(G.quests||[]).find(x=>x.type==='tamer'&&(x.state==='open'||x.state==='active'));return q?`Wren's Tamer's Stick grows with every Bestiary entry. Log ${q.n||6} creatures to earn it.`:null;},
  g:"Old Wren's quest on the first Quest Board: log enough creatures in your Bestiary and she gives you her stick. Any hero can wield it, and it grows stronger with every Bestiary entry until it rivals any blade."},
 // party
 {id:'bond',n:'Bonds and campfire talks',sec:'Party',go:['bondsOpen','','Bonds'],
  t:()=>{if(!obWorld())return null;const k=Object.keys(G.bonds||{}).find(k=>(G.bonds[k]||0)>=1&&BONDMAP[k]&&G.roster[BONDMAP[k].a]&&G.roster[BONDMAP[k].b]);if(!k)return null;const b=BONDMAP[k];
   return `${p2Nm(G.roster[b.a])} and ${p2Nm(G.roster[b.b])} won side by side. More wins bring a campfire talk, then a joint tech.`;},
  g:'Some pairs of wayfarers share a bond. Every win with both of them standing in the Vanguard counts. After enough wins they share a campfire talk, then learn a joint tech, then a second talk. The Party tab\'s Bonds page shows how close each pair is.'},
 {id:'camp',n:'Make camp and boons',sec:'Party',
  t:()=>{if(!obLive())return null;const have=(G.inv.campkit||0)>0;
   if(obModal('workshop')&&alchStock().includes('campkit'))return 'New here: Camp Supplies. In the field, Make camp from the Party tab for a heal and a boon.';
   return obWorld()&&have?'You carry Camp Supplies. In the field, Make camp from the Party tab for a heal and a boon.':null;},
  g:'Camp Supplies are sold at Alchemy from the third realm. In a field or dungeon (not in town or next to a guardian), Make camp from the Party tab: standing heroes get back a quarter of their HP and MP, and you pick one boon for the next 3 battles (Whetstone, Watch fire, Early rise or Forager\'s luck).'},
 {id:'reserves',n:'Reserves and spare gear',sec:'Party',go:['menuTab','party','Party'],
  t:()=>{if(!obWorld())return null;const r=obReserves();return r.length?`${p2Nm(G.roster[r[0]])} is a Reserve, outside the party. Swap heroes in town from the Party tab.`:null;},
  g:'Heroes outside the party are your Reserves. They still earn some XP. In town you can swap them into the party from the Party tab, and a wayfarer met on the road can step in on the spot. Equip Best gears your six; a reserve\'s own sheet has an Auto button for spare gear.'},
 {id:'bestparty',n:'Build Party and Training team',sec:'Party',go:['bpOpen','','Build Party'],
  t:()=>{if(!obModal('menu')||obTab()!=='party')return null;return obReserves().length?'Build Party suggests parties for this area. Training team helps heroes who fell behind.':null;},
  g:'Build Party (Party tab) looks at your roster, the foes of this area and its boss, and suggests a Vanguard and Rearguard in formations: Balanced, Boss ready, Area answer, Fresh mix, Rotation. Training team puts heroes who fell behind beside a strong tank and healer, so the XP catch up bonus lifts them quickly.'},
 // town
 {id:'guild',n:'Guilds and guild missions',sec:'Town',x:'o:guild',go:['menuTab','fmis','Guild missions'],
  t:()=>{if(!obWorld()||typeof facRank!=='function')return null;const F=FAC.find(f=>facRank(f.id)>=2);return F?`New rank with the ${F.n}! Each rank adds a perk; Notice Board missions raise it faster.`:null;},
  g:'Five guilds watch what you do anyway: wins and bounties, forging and tempering, brewing, taming, and knowledge. Each rank brings a perk (cheaper inns, gold, XP, unique charms). Guild missions in the Quests menu add extra standing. Ranks are per journey.'},
 {id:'personal',n:'Personal quests',sec:'Town',
  t:()=>{if(!obWorld())return null;const c=partyOf().find(c=>personalEligible(c)&&!(G.personal&&G.personal[c.id]&&G.personal[c.id].state!=='open'));return c?`${p2Nm(c)} has a personal quest! Start it at the Guild Hall for a reward of their own.`:null;},
  g:'After about 40 battles together, from the second realm on, a wayfarer asks for help with something of their own. Start it in the Guild Hall (Quests > Personal quests). The reward is a unique item bound to that hero.'},
 {id:'bounty',n:'Bounties',sec:'Town',
  t:()=>{if(!obModal('guild')||V.modal.char)return null;return (G.bounties||[]).some(b=>b.state==='open')?'Bounties are elite beasts in the fields. Beat one for gold and a charm, maybe a tame.':null;},
  g:'The Guild Hall posts bounties (Quests > Bounties): named elite monsters that roam a realm, with a shield and a nasty trait. Accept one, find it on the map, and beat it for gold, a stat charm and materials. A beaten bounty beast may ask to be tamed.'},
 {id:'arena',n:'Arena',sec:'Town',
  t:()=>{if(!obModal('guild')||V.modal.char)return null;const cl=(G.cleared||[]).filter(Boolean).length;return ARENA.some((A,i)=>A.min<=cl&&!(G.arena||{})[i])?'The Arena is open: waves of foes back to back for prizes. No fleeing, no rest.':null;},
  g:'The Guild Hall\'s Arena opens Bronze after the first Scourge, Silver after the second and Gold after the third. Waves come back to back with no rest and no fleeing; each tier pays gold and materials the first time.'},
 {id:'temper',n:'Tempering',sec:'Town',x:'o:temper',
  t:()=>{if(!obModal('smithy'))return null;const ok=partyOf().some(c=>EQSL.some(sl=>{const id=c.eq[sl];const f=id&&forgeCost(id);return f&&G.gold>=f.gold&&hasMats(f.m);}));return ok?'Temper what your best hitter holds first. Past +1 needs the realm relic, later a Dread Core.':null;},
  g:'At the Smithy\'s Tempering tab, parts from monsters and gold raise a weapon, armor, cape or charm by +1. The list puts ready upgrades first. Going past +1 needs the realm\'s relic and, later, a Dread Core.'},
 {id:'craft',n:'Crafting',sec:'Town',
  t:()=>{const sm=obModal('smithy'),al=obModal('workshop');if(!sm&&!al)return null;const can=RECIPES.some(r=>recipeOpen(r)&&(sm?SMITH_CATS.includes(r.cat):!SMITH_CATS.includes(r.cat))&&G.gold>=r.g&&hasMats(recipeMats(r)));
   return can?(sm?'Your materials can become gear here. Open the Forge tab to see what you can make.':'Your herbs and parts can be brewed here. Open Brew & craft to see what you can make.'):null;},
  g:'Herbs, ore, logs and monster parts you gather turn into things. Alchemy (Brew & craft) makes potions, charms and travel gear; the Smithy (Forge) makes weapons and armor. Recipes open realm by realm, and What next? tells you when you can craft something.'},
 {id:'charm',n:'Charms',sec:'Town',go:['menuTab','equip','Equipment'],
  t:()=>{if(!obWorld())return null;return (G.gear||[]).some(obCharm)?'You found a charm! Each hero has one charm slot. Equip it in Backpack > Equipment.':null;},
  g:'Charms fill the fourth gear slot of each hero: a small stat boost or a special effect. Bounties drop stat charms, Alchemy sells and brews them (Shop > Charms), and guild ranks give unique ones. They can be tempered too.'},
 // later
 {id:'echoforge',n:'Echoforge',sec:'Later',x:'o:echo',
  t:()=>{if(!obModal('smithy')||typeof efTabOn!=='function'||!efTabOn())return null;return 'Each Echo\'s shards forge a different weapon. Read the Echoforge list, then pick which Echo to hunt.';},
  g:'Once you hold Echo Shards (or the journey is won), the Smithy shows an Echoforge tab. It turns Shards and Essence from Echoes into six Echoforged weapons, each the strongest of its family.'},
 {id:'legend',n:'Legends',sec:'Later',
  t:()=>{if(!obModal('board'))return null;return (G.quests||[]).some(q=>q.type==='legend'&&(q.state==='open'||q.state==='active'))?'A legend quest! Follow its steps to meet a Legendary wayfarer who may join you.':null;},
  g:'From the second realm, a Quest Board may post a legend quest. Its steps lead to a Legendary wayfarer, a hand made hero with a unique class and trait. Accept it, follow the steps shown in Quests, and they may join you.'},
 {id:'ngplus',n:'New Game+ modifiers',sec:'Later',x:'o:ng',
  t:()=>{if(V.screen!=='starter'||!((V.ngCycle||0)>0)||typeof TWISTS==='undefined'||!TWISTS.on||V.modal)return null;return `Modifiers last this whole cycle: each risk pays more XP or gold. Pick up to ${TWISTS.ng.max}, or none.`;},
  g:'When you start a New Game+ cycle you may pick a few modifiers (on the hero picking screen). Each adds a risk, such as tougher foes or heroes who stay down, and a gain, such as more XP or gold. They last for the whole cycle and show on the save card.'},
 {id:'twist',n:'Daily Trial twist',sec:'Later',always:1,
  t:()=>null,
  g:'Every week the Daily Trial has a twist, such as halved healing or doubled fire reactions. It shows on the trial\'s entry screen and as a chip in its battles (tap it to read it). Everyone playing the trial that week has the same twist.'}
];
const TIPMAP={};TIPS.forEach(t=>{TIPMAP[t.id]=t;});
const OB_SECS=['Battle','Creatures','Party','Town','Later'];

// ----- the card -----
function obEl(){let d=OB.el&&OB.el.isConnected?OB.el:document.getElementById('p2hint');if(!d){d=OB.el||document.createElement('div');d.id='p2hint';d.setAttribute('role','status');}
  if(!d.isConnected)document.body.appendChild(d);OB.el=d;return d;}
// where a card sits: inside the open window (top of the panel, under its title), or before the modifier panel on the starter screen
function obAnchor(){try{if(V.screen==='starter'){const p=document.querySelector('.ngpick');if(p)return {parent:p.parentNode,before:p};}
  if(V.modal){const b=document.querySelector('#modal .panel.box')||document.querySelector('#modal .panel');if(b){const h=b.querySelector(':scope > h2');return {parent:b,before:h?h.nextSibling:b.firstChild};}}}catch(e){}return null;}
function obMount(){const d=OB.el;if(!d||!OB.cur)return;const a=obAnchor();
  if(a){if(d.parentNode!==a.parent||(a.before&&d.nextSibling!==a.before&&d!==a.before)){a.parent.insertBefore(d,a.before&&a.before!==d?a.before:null);}d.classList.add('inl');d.classList.remove('bat','slim');d.style.top=d.style.left=d.style.bottom=d.style.width=d.style.maxWidth='';return;}
  if(d.parentNode!==document.body)document.body.appendChild(d);d.classList.remove('inl');d.classList.toggle('bat',V.screen==='battle');hintPlace(d);}
function obShow(id,txt){const d=obEl();OB.cur=id;OB.shownAt=Date.now();OB.curCtx={scr:V.screen,bid:B&&B.id,modal:V.modal&&V.modal.type};
  const M=obM();M.s[id]=1;saveMeta();P2.hint='tip:'+id;
  d.innerHTML=`<span class="obt"><b>Tip</b>${esc(txt)}</span><div class="btnrow"><button class="btn sm gold" data-act="tipOk">Got it</button><button class="btn sm" data-act="tipMore" data-arg="${id}">More</button></div>`;
  d.className='show ob';d.dataset.tip=id;delete d.dataset.obp;obMount();
  clearTimeout(OB.hide);OB.hide=setTimeout(()=>{if(OB.cur===id)ACT.tipOk();},OB_HIDE);}
function obClose(){const id=OB.cur;OB.cur=null;OB.curCtx=null;clearTimeout(OB.hide);OB.last=Date.now();if(P2.hint==='tip:'+id)P2.hint=null;
  const d=OB.el;if(d){d.className='';delete d.dataset.tip;delete d.dataset.obp;if(d.parentNode!==document.body)document.body.appendChild(d);d.style.top=d.style.left=d.style.bottom=d.style.width=d.style.maxWidth='';}}
ACT.tipOk=function(){obClose();};
ACT.tipMore=function(id){obClose();const prev=V.modal&&V.modal.type!=='menu'?V.modal:null;V.obPrev=prev;V.modal={type:'menu',tab:'sysg',obAt:TIPMAP[id]?id:null};render();
  setTimeout(()=>{try{const e=document.getElementById('obg-'+id);if(e)e.scrollIntoView({block:'nearest'});}catch(x){}},60);};
ACT.obBack=function(){const p=V.obPrev;V.obPrev=null;V.modal=p||null;render();};
{const cm0=ACT.closeModal;ACT.closeModal=function(){if(V.modal&&V.modal.type==='menu'&&V.obPrev){return ACT.obBack();}return cm0.apply(this,arguments);};}
ACT.obBeasts=function(v){V.bview=v||'all';ACT.menuTab('beasts');};
ACT.cmdLoreOb=function(){if(V.screen==='battle'&&B&&!B.over){V.modal={type:'battlelore'};render();}else ACT.menuTab('lore');};
ACT.tipsReset=function(){const M=obM();M.s={};META.cfg.tips=true;saveMeta();OB.q=[];toast('Tips will show again the first time you meet each part of the game.');render();};
// a first realm hint shown with hintShow (p2world) takes the card over: this tip counts as closed
{const hs0=hintShow;hintShow=function(){if(OB.cur){OB.cur=null;OB.curCtx=null;clearTimeout(OB.hide);}const r=hs0.apply(this,arguments);try{OB.el=document.getElementById('p2hint');if(OB.el){OB.el.classList.remove('ob','inl','slim');delete OB.el.dataset.obp;if(OB.el.parentNode!==document.body)document.body.appendChild(OB.el);hintPlace(OB.el);}}catch(e){}return r;};}
{const ho0=ACT.hintOk;ACT.hintOk=function(){const r=ho0.apply(this,arguments);OB.last=Date.now();return r;};}
// the first realm hints follow Tips too, and never show in a boss's first turn
{const he0=hintEligible;hintEligible=function(){return he0.apply(this,arguments)&&tipsOn()&&!obBossHold();};}

// ----- battle placement: a free spot on the stage (bwrap), clear of every sprite and stage label (b3Lay) and of the DOM cards -----
function obRects(){const out=[];try{const st=document.getElementById('bstage'),L=typeof b3Lay==='function'?b3Lay(true):null;
  if(st&&L){const R=st.getBoundingClientRect(),k=R.width/(L.W||BL.W||1);const add=(o,body)=>out.push({l:R.left+o.x*k,t:R.top+o.y*k,r:R.left+(o.x+o.w)*k,b:R.top+(o.y+o.h)*k,body});
    L.bodies.forEach(o=>add(o.r,1));L.all.forEach(o=>add(o,0));}}catch(e){}
  try{document.querySelectorAll('#bparty .fc,#bparty .pc,#bcmd,#bbossbar,#bwrap .wchip,#bwrap .skytags').forEach(e=>{const b=e.getBoundingClientRect();if(b.width&&b.height)out.push({l:b.left,t:b.top,r:b.right,b:b.bottom,body:e.matches('.fc')?1:0});});}catch(e){}
  return out;}
function obFree(x,y,w,h,obs,pad){for(const o of obs){if(x<o.r+pad&&x+w+pad>o.l&&y<o.b+pad&&y+h+pad>o.t)return false;}return true;}
// lines of text the card takes at its current width (tip cards only; a first realm hint has no .obt)
function obLines(d){const t=d.querySelector('.obt');if(!t)return 1;const lh=parseFloat(getComputedStyle(t).lineHeight)||15;return Math.round(t.getBoundingClientRect().height/lh);}
function obPlaceBattle(d){const wrap=document.getElementById('bwrap');if(!wrap)return false;const W=wrap.getBoundingClientRect();if(!W.width||!W.height)return false;
  const obs=obRects(),cx=W.left+W.width/2,bodies=obs.filter(o=>o.body);
  // stay put while the spot is still clear of every sprite and card (no jumping around as labels come and go)
  if(d.dataset.obp===String(B&&B.id)&&d.offsetWidth){const r=d.getBoundingClientRect(),lr=(document.getElementById('bline')||wrap).getBoundingClientRect();
    const inside=r.left>=Math.min(W.left,lr.left)-1&&r.right<=Math.max(W.right,lr.right)+1&&r.top>=W.top-1&&r.bottom<=Math.max(W.bottom,lr.bottom)+1;if(inside&&obFree(r.left,r.top,r.width,r.height,bodies,1))return true;}
  d.classList.remove('slim','tight');
  const widths=[Math.min(420,W.width-12),Math.min(340,W.width-12)].filter((v,i,a)=>v>=150&&a.indexOf(v)===i);
  const put=(x,y,w)=>{d.style.left=Math.round(x+w/2)+'px';d.style.top=Math.round(y)+'px';d.style.bottom='auto';d.dataset.obp=String(B&&B.id);return true;};
  // 1) a free spot on the stage: first clear of everything, then clear of sprites and cards (it may touch a label)
  for(const pass of [0,1]){const ob=pass?bodies:obs;
    for(const w of widths){d.style.width=w+'px';d.style.maxWidth=w+'px';const h=d.offsetHeight;if(h>W.height-8||obLines(d)>2)continue;
      let best=null;for(let y=W.top+4;y+h<=W.bottom-4&&!best;y+=4){const xs=[cx-w/2];for(let x=W.left+4;x+w<=W.right-4;x+=8)xs.push(x);
        for(const x of xs){if(x<W.left+2||x+w>W.right-2||!obFree(x,y,w,h,ob,3))continue;const s=Math.abs(x+w/2-cx);if(!best||s<best.s)best={x,y,s};}}
      if(best)return put(best.x,best.y,w);}}
  // 2) a crowded stage (short landscape screens): a slim card over the log line under the stage, the buttons beside the text
  const ln=document.getElementById('bline');if(ln){const Lr=ln.getBoundingClientRect();if(Lr.width>=200){d.classList.add('slim');const w=Lr.width;d.style.width=w+'px';d.style.maxWidth=w+'px';if(obLines(d)>2)d.classList.add('tight');/* v0.9.5: a long tip in a narrow slim card takes a smaller type, two lines at most */const h=d.offsetHeight;
    const y=Lr.bottom-h;if(obFree(Lr.left,y,w,h,bodies,1))return put(Lr.left,y,w);d.classList.remove('slim','tight');}}
  d.style.width='';d.style.maxWidth='';delete d.dataset.obp;return false;}
// replaces p2world's hintPlace: in battle the search above (falls back to the old spot at the top of the stage), elsewhere the default spot
{const hp0=hintPlace;hintPlace=function(d){d=d||document.getElementById('p2hint');if(!d)return;if(d.classList.contains('inl'))return;
  if(V.screen==='battle'&&document.getElementById('bwrap')){try{if(obPlaceBattle(d))return;}catch(e){}}d.classList.remove('slim');d.style.width='';
  return hp0.apply(this,arguments);};}

// the corner save note keeps clear of the card too
if(typeof p5Avoid==='function'){const pa1=p5Avoid;p5Avoid=function(){const r=pa1.apply(this,arguments);try{const d=document.getElementById('p2hint');if(d&&d.classList.contains('show')){const b=d.getBoundingClientRect();if(b.width)r.push(b);}}catch(e){}return r;};}

// ----- the queue -----
// v0.9.6 depth unlocks by realm (pacing.js pcUnlocked): a card about a system that is not open yet on this journey waits for it
const OB_PACE={primed:'reactions',react:'reactions',react2:'reactions',tame:'taming',comp:'taming',stick:'taming',summon:'taming',bond:'bonds',camp:'camp',guild:'guilds',temper:'gear',echoforge:'echoforge'};
const obPc=id=>!OB_PACE[id]||typeof pcUnlocked!=='function'||pcUnlocked(OB_PACE[id]);
function obEval(t){try{if(t.x&&!tipUsed(t.x))return null;if(!obPc(t.id))return null;return t.t()||null;}catch(e){return null;}}
// v0.9.5: opening a system once (for the expert cards): the Smithy's Tempering and Echoforge tabs, the Guild Hall, Lore
function obOpened(){try{if(!G||G.daily)return;const m=V.modal;if(!m)return;
  if(m.type==='smithy'&&m.tab==='forge')tipUse('o:temper');if(m.type==='smithy'&&m.tab==='echo')tipUse('o:echo');if(m.type==='guild'||(m.type==='board'&&m.tab==='guilds'))tipUse('o:guild');
  if(m.type==='battlelore'||(m.type==='menu'&&m.tab==='lore'))tipUse('o:lore');}catch(e){}}
{const ng0=ACT.ngMod;if(typeof ng0==='function')ACT.ngMod=function(){try{const M=obM();if(!M.u['o:ng']){M.u['o:ng']=1;saveMeta();}}catch(e){}return ng0.apply(this,arguments);};}
function obHold(){if(obBossHold())return true;const m=V.modal;if(m&&['story','talk','legacy','lose','boss','slots','export','import','feedback','fbcopy'].includes(m.type))return true;
  if(V.screen==='title')return true;return false;}
function obTick(){try{obOpened();
  if(!tipsOn()){if(OB.cur)obClose();OB.q=[];return;}
  if(OB.cur&&P2.hint!=='tip:'+OB.cur){OB.cur=null;OB.curCtx=null;clearTimeout(OB.hide);}// a first realm hint took the card over
  if(OB.cur){const c=OB.curCtx||{},id=OB.cur;
    const back=()=>{obClose();delete obM().s[id];saveMeta();OB.q=OB.q.filter(x=>x!==id);OB.q.unshift(id);OB.last=0;};
    if(obBossHold()){back();return;}// never during a boss's first turn: it comes back after
    // a battle card leaves with its battle (or when a window opens over it), a window card with its window, a world card when the view changes
    // v0.7.5: a window card is judged by its window first (the rewards window sits over the battle screen, which made a tame tip flash on and off)
    const gone=c.modal?(!V.modal||V.modal.type!==c.modal):c.scr==='battle'?(V.screen!=='battle'||!B||B.id!==c.bid||B.over||!!V.modal):(V.screen!==c.scr||(c.scr==='world'&&!!V.modal));
    if(gone){if(Date.now()-OB.shownAt<2500)back();else obClose();return;}// hardly seen: it shows again at the next such moment
    if(OB.el&&!OB.el.isConnected)obMount();return;}
  if(V.obPrev&&!(V.modal&&V.modal.type==='menu'))V.obPrev=null;
  if((typeof G!=='undefined'&&G&&G.daily)||(V.screen==='battle'&&B&&B.spec&&B.spec.kind==='daily')){OB.q=[];return;}
  // new moments join the queue in the order they happen; moments that passed leave it (not seen, so they come back)
  for(const t of TIPS){if(tipSeen(t.id)||OB.q.includes(t.id)||t.always)continue;if(obEval(t))OB.q.push(t.id);}
  OB.q=OB.q.filter(id=>!tipSeen(id)&&obEval(TIPMAP[id]));
  if(!OB.q.length||P2.hint||P2.hintT||obHold()||Date.now()-OB.last<OB_GAP)return;
  const id=OB.q.shift(),txt=obEval(TIPMAP[id]);if(txt)obShow(id,txt);
}catch(e){}}
OB.tick=setInterval(obTick,OB_TICK);
// keep the card in its window across re-renders, and on a free spot of the stage as the battle moves
HOOK.after('render','onboard','keep the tip card placed',function(){try{if(OB.cur&&OB.el){if(V.modal||V.screen==='starter'||!OB.el.isConnected)obMount();else if(V.screen==='battle'){OB.el.classList.remove('inl');OB.el.classList.add('bat');hintPlace(OB.el);}}}catch(e){}});

// ----- what counts as using a system (for What next?) -----
{const c0=ACT.cmd;if(c0)ACT.cmd=function(a){try{if(B&&B.mode==='cmd'&&!G.daily){if(a==='scan')tipUse('scan');if(a==='lore')tipUse('lore');if(a==='swap'&&canSwap())tipUse('switch');if(a==='limit'&&B.cur&&lbReady(B.cur))tipUse('limit');}}catch(e){}return c0.apply(this,arguments);};}
['summon','bpOpen','autoEqCamp','campPick','bondsOpen'].forEach(k=>{const f=ACT[k];if(typeof f!=='function')return;ACT[k]=function(){try{tipUse({summon:'summon',bpOpen:'bestparty',autoEqCamp:'reserves',campPick:'camp',bondsOpen:'bond'}[k]);}catch(e){}return f.apply(this,arguments);};});

// ----- Guides > What next?: met but not tried yet -----
function obUntried(){const out=[];if(!G||G.daily)return out;const add=(t,s)=>out.push([t,s]);
  try{const n=G.inv.campkit||0;if(tipSeen('camp')&&n>0&&!G.camp)add(`You have ${n} Camp Supplies: Make camp from the Party tab`,'Out in a field or dungeon: a small heal for the standing heroes and a boon for 3 battles.');}catch(e){}
  try{const o=(G.tamed||[]).find(x=>!x.with);if(o)add(`${esc(o.name)} has no partner yet`,'Pair it with a hero in Party > Companions for a bonus and a Summon in battle.');}catch(e){}
  try{if(typeof readyTalks==='function'){const L=readyTalks();if(L.length)add(`${L.length} campfire talk${L.length>1?'s are':' is'} ready`,'Open Bonds from the Party tab, or Make camp, to listen.');}}catch(e){}
  try{if(tipSeen('scan')&&!tipUsed('scan')&&!Object.values(META.best||{}).some(b=>b&&b.scan))add('Try Scan in battle','It reads a foe\'s exact stats and hidden quirk for half a turn, and keeps them in the Bestiary.');}catch(e){}
  try{if(tipSeen('switch')&&!tipUsed('switch'))add('Try Switch in battle','On a hurt hero\'s turn it brings in a Rearguard hero, who acts at once.');}catch(e){}
  try{if(tipSeen('limit')&&!tipUsed('limit'))add('Try a Limit move','When a hero\'s gold bar is full, the Limit button tops their commands.');}catch(e){}
  try{if(tipSeen('summon')&&!tipUsed('summon'))add('Try Summon in battle','A hero with a companion can call it in to fight for a few turns.');}catch(e){}
  try{if(tipSeen('guild')&&obPc('guild')&&typeof facInit==='function'){const f=facInit();if(!Object.keys(f.acc||{}).length&&!Object.keys(f.done||{}).length)add('Try a guild mission','Notice Board > Guilds: extra standing and the next perk sooner.');}}catch(e){}
  try{if(tipSeen('bestparty')&&!tipUsed('bestparty'))add('Try Build Party','Party tab: it suggests a party for this area and a Training team for heroes who fell behind.');}catch(e){}
  try{const R=obReserves();if(tipSeen('reserves')&&!tipUsed('reserves')&&R.length&&(G.gear||[]).some(id=>{const g=gearOf(id);return g&&!g.stick;}))add('Spare gear for the reserves','Party tab: open a reserve\'s sheet and press Auto for the best spare gear.');}catch(e){}
  try{if(tipSeen('charm')){const c=(G.gear||[]).filter(obCharm);const empty=partyOf().filter(h=>!h.eq.c);if(c.length&&empty.length)add(`A charm is waiting in your pack`,`${empty.slice(0,3).map(h=>esc(p2Nm(h))).join(', ')} ${empty.length>1?'have':'has'} an empty charm slot. Backpack > Equipment.`);}}catch(e){}
  return out;}
{const vn0=vNext;vNext=function(){let h=vn0.apply(this,arguments);try{const L=obUntried();if(L.length){
  const sec=`<h4>Not tried yet</h4><div class="rows compact obnt">${L.map(([t,s])=>`<div class="row nxt"><span class="nxi">•</span><div class="grow"><b>${t}</b>${s?`<small>${s}</small>`:''}</div></div>`).join('')}</div>`;
  const k=h.indexOf('<h4>Readiness');h=k<0?h+sec:h.slice(0,k)+sec+h.slice(k);}}catch(e){}return h;};}

// ----- Guides > How it works -----
try{const gd=MENU_GROUPS.find(g=>g[0]==='guides');if(gd&&!gd[2].includes('sysg'))gd[2].splice(Math.max(0,gd[2].indexOf('next')+1),0,'sysg');MENU_SUB.sysg='How it works';}catch(e){}
function vSysGuide(m){const at=m&&m.obAt,met=TIPS.filter(t=>t.always||tipSeen(t.id)||t.id===at),left=TIPS.length-met.length;
  const body=OB_SECS.map(s=>{const L=met.filter(t=>t.sec===s);if(!L.length)return '';
    return `<h4>${s}</h4><div class="obg">${L.map(t=>`<details class="obgi${t.id===at?' at':''}" id="obg-${t.id}"${t.id===at?' open':''}><summary>${esc(t.n)}</summary><p class="note">${esc(t.g)}</p>${t.go?`<div class="btnrow"><button class="btn sm" data-act="${t.go[0]}" data-arg="${t.go[1]}">${esc(t.go[2])}</button></div>`:''}</details>`).join('')}</div>`;}).join('');
  return `<p class="note">Each part of the game explains itself with a short tip the first time you meet it. Every tip you have seen is here in more detail.${left?` ${left} more will show as you play.`:''} Tips are ${tipsOn()?'on':'off'} (Settings).</p>`+
    (V.obPrev?`<div class="btnrow"><button class="btn sm" data-act="obBack">Back</button></div>`:'')+(body||'<p class="note empty">No tips yet. They show the first time you meet each part of the game.</p>')+
    `<div class="btnrow"><button class="btn sm" data-act="cfg" data-arg='["tips",${tipsOn()?'false':'true'}]'>${tipsOn()?'Turn tips off':'Turn tips on'}</button><button class="btn sm" data-act="tipsReset">Reset tips</button></div>`;}
{const mm1=mMenu;mMenu=function(m){if(!m||m.tab!=='sysg')return mm1.apply(this,arguments);
  const html=mm1.apply(this,arguments),tabs=menuTabsHtml(menuGroupOf('sysg'),'sysg'),k=html.indexOf(tabs);return k<0?html:html.slice(0,k+tabs.length)+vSysGuide(m)+html.slice(k+tabs.length);};}

// ----- Settings: Tips on or off, Reset tips -----
HOOK.wrap('settingsBody','onboard','Tips row',function(next,...a){const h=next(...a),on=tipsOn();
  return h+`<div class="rows obset"><div class="row"><div class="grow"><b>Tips</b><small>A short card the first time you meet each part of the game. Read them again in Guides > How it works.</small></div><div class="chips"><button class="chip ${on?'on':''}" data-act="cfg" data-arg='["tips",true]'>On</button><button class="chip ${on?'':'on'}" data-act="cfg" data-arg='["tips",false]'>Off</button><button class="chip" data-act="tipsReset">Reset tips</button></div></div></div>`;});

try{const css=document.createElement('style');css.textContent=`#p2hint.ob{width:min(92vw,420px);display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px}#p2hint.ob .obt{flex:1 1 270px;min-width:0;overflow-wrap:anywhere}
  #p2hint.ob .btnrow{margin:2px 0 0 auto;flex:0 0 auto}#p2hint.ob.bat{font-size:11.5px;padding:5px 8px}#p2hint.ob.slim{flex-wrap:nowrap;align-items:center;font-size:11px;padding:3px 8px;line-height:1.25}#p2hint.ob.slim .obt{flex:1 1 auto}#p2hint.ob.slim.tight{font-size:9.5px;line-height:1.15}#p2hint.ob.slim.tight .btn{padding:2px 7px;min-height:24px;font-size:10px}#p2hint.ob.slim .btnrow{margin:0}
  #p2hint.inl{position:relative;left:auto;top:auto;bottom:auto;transform:none;max-width:none;width:auto;margin:4px 0 8px;z-index:1;box-shadow:0 2px 10px rgba(0,0,0,.35)}
  #p2hint.inl.show{transform:none}#p2hint.inl{transition:none}/* v0.7.5: a window card is put back after every re-render of the window; with the fade it flashed */
  .obg{display:flex;flex-direction:column;gap:4px;margin-bottom:6px}.obgi{border:1px solid rgba(255,208,74,.25);border-radius:8px;padding:6px 9px;background:rgba(255,255,255,.03)}
  .obgi summary{cursor:pointer;font-weight:800;min-height:28px;display:flex;align-items:center}.obgi.at{border-color:#ffd04a}.obgi .note{margin:4px 0}
  .obset .chips{flex-wrap:wrap}`;document.head.appendChild(css);}catch(e){}

// ----- test hook (separate from __A, so no getter there is touched) -----
try{window.__OB={OB,TIPS,TIPMAP,tipsOn,tipSeen,tipUsed,obTick,obShow,obClose,obPlaceBattle,obRects,obBossHold,obUntried,vSysGuide,obM,get G(){return G},get B(){return B},get V(){return V},get META(){return META},
  get BONDS(){return BONDS},get FAC(){return FAC},get RECIPES(){return RECIPES},forgeCost:id=>forgeCost(id),recipeMats:r=>recipeMats(r),recipeOpen:r=>recipeOpen(r),gearOf:id=>gearOf(id),facInit:()=>facInit(),facRank:id=>facRank(id),bondKey:(a,b)=>bondKey(a,b),
  canSwap:()=>canSwap(),canSummon:a=>canSummon(a),lbReady:c=>lbReady(c),b3Lay:f=>b3Lay(f),get BL(){return BL},vNext:()=>vNext(),hintPlace:d=>hintPlace(d),get P2(){return P2}};}catch(e){}
