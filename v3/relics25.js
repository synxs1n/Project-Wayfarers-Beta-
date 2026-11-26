// ===== relics25.js (v0.22.25): personal relics reworked: Legendary rarity, five kinds, class bonuses, a skill of their own =====
// Owner: "Personal relics should be best in slot for their character, around the strength of echo forged equipment, with bonuses that help
// their character, maybe it even gives them an extra skill when equipped. they should also be their own rarity of 'Legendary'. Rework these
// entirely as we have new forms of equipment so I want a better mix of what types of equipment are personal relics. They should also be
// called 'Jace's whatever it's called' no need to mention its a relic in the title."
// Before (engine2.js registerSignatures, econ11.js relicBuild): a weapon for 40% of the wayfarers, an "Oathmantle" for 30%, a "Token" for 30%;
// named "X's Relic ..."; shown in the rarity of the journey's best shop gear; stats 1.08 x the old +3 factor over the best shop piece of the
// realm (already about Echoforged: at the top, 5% over it); no bonus beyond one attribute and the element.
// Now:
//  1 KINDS. Five kinds: weapon, armor, charm, boots, shield (shields only for Warriors and Knights). r25Kind gives every wayfarer one by a
//    fixed order of their ids through the pattern R25.mix, so the roster is about 30% weapons, 20% each armor, charms and boots, and the
//    shield bearers among the Warriors and Knights. Legendary wayfarers keep their weapon (their kits and looks hang on it). Ids: u_ weapon,
//    ua_ armor, uc_ charm, uk_ boots, us_ shield + the hero's id. A relic a save already holds stays what it is and gets everything below.
//  2 NAMES. "Mira's Prism", "Oren's Vow Shield": R25.names by kind and class, no "Relic" in the title.
//  3 RARITY. ITEM_TIERS gains index 7, Legendary; gTierIdx answers 7 for a relic.
//  4 STRENGTH. As before for weapons and armor (best in slot at every stage, 5% over Echoforged at the top). Boots and shields are built the
//    same way from the boots of the class's weight and the shield of the journey's tier; charms get their old scaling x R25.charmK (1.5), which puts them over the best shop charm at +3.
//  5 BONUSES. R25.perk by class, applied in calcStats from whatever relic the hero wears: critical chance and damage, armor pierce, spell
//    power, healing, MP saved, evasion, accuracy, max HP, DEF, a faster turn.
//  6 A SKILL. While the relic is worn its owner knows one more skill: a signature move per class (R25.skill), shaped by the hero's element and
//    by the kind of gear the relic is, named for the hero ("Brann's Reckoning"). skillKnown answers for it by what is equipped. (0.22.26)
// R25.off: the relics as they were before this version.
const R25={off:false,charmK:1.5,mix:['w','k','c','a','s','w','c','k','a','w'],
  names:{
    a:{warrior:'Battle Harness',knight:'Vigil Plate',mage:'Starwoven Robe',healer:'Lamplight Vestment',thief:'Nightrunner Coat',archer:"Fletcher's Jerkin",monk:"Master's Gi",bard:"Troubadour's Coat",chronicler:"Archivist's Mantle",sniper:'Steppe Coat',druid:'Wildhide',archmage:'Stormcloak',bloodcaller:'Howl-hide',chief:"Bandit King's Coat",_:'Oathmantle'},
    c:{warrior:'Whetstone',knight:'Oath Ring',mage:'Prism',healer:'Prayer Beads',thief:'Lucky Coin',archer:'Hawk Feather',monk:'Prayer Cord',bard:'Tuning Fork',chronicler:'Inkwell',sniper:'Wind Gauge',druid:'Wolf Fang',archmage:'Storm Bottle',bloodcaller:'Blood Vial',chief:'Loaded Dice',_:'Keepsake'},
    k:{warrior:'Marching Boots',knight:'Vigil Greaves',mage:'Tower Slippers',healer:'Pilgrim Sandals',thief:'Soft Soles',archer:'Stalker Boots',monk:'Wind Steps',bard:'Dancing Shoes',chronicler:"Wanderer's Boots",sniper:'Stirrup Boots',druid:'Trail Boots',archmage:'Cloudwalkers',bloodcaller:'Packrunners',chief:'Getaway Boots',_:'Wayfarer Boots'},
    s:{warrior:'Battered Buckler',knight:'Vow Shield',_:'Shield'}},
  // what the relic adds for its class (shares are added; tempo, hpM and defM multiply)
  perk:{warrior:{critDmg:.2,pierce:.1},knight:{hpM:1.08,defM:1.08},mage:{spellPow:.12,mpEff:.15},healer:{healUp:.2,mpEff:.15},thief:{crit:.08,eva:.04},archer:{crit:.06,acc:.05},
    monk:{tempo:.94,crit:.04},bard:{mpEff:.2,healUp:.1},chronicler:{spellPow:.1,healUp:.1},sniper:{critDmg:.2,acc:.05},druid:{crit:.05,healUp:.1},archmage:{spellPow:.12,mpEff:.15},
    bloodcaller:{spellPow:.1,hpM:1.06},chief:{crit:.06,eva:.04},_:{crit:.05}},
  perkTxt:{crit:v=>`+${Math.round(v*100)}% critical chance`,critDmg:v=>`+${Math.round(v*100)}% critical damage`,pierce:v=>`ignores ${Math.round(v*100)}% DEF`,spellPow:v=>`+${Math.round(v*100)}% spell damage`,
    healUp:v=>`+${Math.round(v*100)}% healing`,mpEff:v=>`skills cost ${Math.round(v*100)}% less MP`,eva:v=>`+${Math.round(v*100)}% evasion`,acc:v=>`+${Math.round(v*100)}% accuracy`,
    tempo:v=>`acts ${Math.round((1-v)*100)}% sooner`,hpM:v=>`+${Math.round((v-1)*100)}% max HP`,defM:v=>`+${Math.round((v-1)*100)}% DEF`},
  group:{warrior:'phys',knight:'phys',thief:'phys',archer:'phys',monk:'phys',sniper:'phys',druid:'phys',chief:'phys',mage:'mag',archmage:'mag',chronicler:'mag',bloodcaller:'mag',healer:'heal',bard:'heal'},
  // 0.22.26: one signature move per class (never a copy of a kit skill), then shaped by the hero's element (R25.elFx) and by what kind of
  // gear the relic is (R25.kindFx), and named for the hero. Asked: "vanguard heals with regen is too common to make a relic skill, these
  // should be super special and unique".
  // 0.22.36 ("skills given by Legendary relics are bit too strong"): about a fifth off every power, smaller riders, 2 MP more
  skill:{warrior:{n:'Reckoning',k:'phys',pw:1.35,t:'all',mp:24,execute:.25,drain:.15,self:[['might',1]],what:'Cleaves every foe, hits wounded foes twice as hard, heals the wielder for part of the damage and grants them Might'},
    knight:{n:'Unbroken Line',k:'phys',pw:1.9,t:'one',mp:22,shieldChip:3,self:[['taunt',1],['ward',1]],allyFx:[['bulwark',1]],what:'A shield breaking blow, and the wielder draws every attack behind a Ward while the vanguard gains Bulwark'},
    thief:{n:'Thousand Cuts',k:'phys',pw:.6,t:'rand',hits:5,mp:22,crit:.2,strip:1,self:[['focus',1]],what:'Five cuts across the foes that tear away their boons, and leaves the wielder Focused'},
    archer:{n:'Skyfall',k:'phys',pw:1.3,t:'all',mp:24,pierce:1,fx:[['break',.4]],what:'A volley on every foe that ignores half their defense and can Break them'},
    sniper:{n:'Final Mark',k:'phys',pw:2.7,t:'one',mp:26,pierce:1,crit:.25,execute:.35,what:'One shot through armor, doubled against a foe under a third of its health'},
    monk:{n:'Hundred Fists',k:'phys',pw:.52,t:'rand',hits:6,mp:22,drain:.2,self:[['might',1],['haste',1]],what:'Six blows across the foes that feed the wielder, who gains Might and Haste'},
    druid:{n:'Wild Hunt',k:'phys',pw:1.2,t:'all',mp:24,drain:.25,fx:[['root',.6],['poison',.6]],allyFx:[['bulwark',1]],what:'The wild falls on every foe, Rooting and Poisoning them, healing the wielder and granting the vanguard Bulwark'},
    chief:{n:'Rallying Tide',k:'phys',pw:1.15,t:'all',mp:24,lbParty:15,allyFx:[['might',1],['haste',1]],what:'Strikes every foe, fills the limit gauges of the party and grants the vanguard Might and Haste'},
    mage:{n:'Unmaking',k:'mag',pw:1.5,t:'all',mp:28,strip:1,fx:[['break',.35]],what:'Magic on every foe that tears away their boons and can Break them'},
    archmage:{n:'Twin Tempest',k:'mag',pw:.68,t:'rand',hits:6,mp:28,strip:1,self:[['focus',1]],what:'Six bolts across the foes that tear away their boons, and leaves the wielder Focused'},
    chronicler:{n:'Stopped Hour',k:'mag',pw:1.2,t:'all',mp:26,fx:[['slow',1],['stun',.25]],allyFx:[['haste',1]],what:'Time buckles: every foe is Slowed and may be Stunned while the vanguard gains Haste'},
    bloodcaller:{n:'Red Covenant',k:'mag',pw:1.35,t:'all',mp:26,drain:.3,execute:.2,fx:[['bleed',.9]],what:'Bleeds every foe, hits the wounded twice as hard and returns part of the damage as health'},
    healer:{n:'Second Dawn',k:'heal',pw:1.3,t:'allyAll',mp:30,revive:.3,cleanse:1,fx:[['ward',1]],what:'Raises the fallen at a third of their health, heals and cures the vanguard and Wards each of them against the next hit'},
    bard:{n:'Encore',k:'heal',pw:.9,t:'allyAll',mp:26,cleanse:1,fx:[['might',1],['focus',1]],what:'Heals and cures the vanguard, and grants each of them Might and a guaranteed critical hit'}},
  // the hero's first element shapes it: a status on the foes for a strike, a boon for a mend
  elFx:{fire:['burn',.8],water:['weaken',.7],ice:['slow',.8],lightning:['stun',.35],earth:['root',.8],wind:['blind',.8],shadow:['poison',.8],light:['weaken',.7]},
  elBoon:{fire:'might',lightning:'haste',wind:'haste',ice:'bulwark',earth:'bulwark',water:'regen',light:'focus',shadow:'focus'},
  // and what the relic is: a weapon hits harder, armour and shields protect the wielder, boots quicken them, a charm fills limit gauges
  kindFx:{w:{pwM:1.08,txt:'It is stronger for being a weapon'},a:{self:'bulwark',txt:'The wielder gains Bulwark'},s:{self:'ward',txt:'The wielder gains Ward'},k:{self:'haste',txt:'The wielder gains Haste'},c:{lb:10,pwM:1.04,txt:'The limit gauges of the party fill'}}};
const R25_PRE={w:'u_',a:'ua_',c:'uc_',k:'uk_',s:'us_'},R25_RE=/^u[acks]?_/;
const r25Heroes=()=>Object.keys(TPL).filter(id=>TPL[id]&&!TPL[id].mon&&CLS[TPL[id].cls]);
const r25Legend=id=>{try{const t=TPL[id];return !!(t&&(t.legend||(CLS[t.cls]&&CLS[t.cls].legend)||(typeof LEGEND_IDS!=='undefined'&&LEGEND_IDS.includes(id))));}catch(e){return false;}};
// ---------- 1. kinds ----------
let R25K=null;
function r25Kind(id){if(!R25K){R25K={};const ids=r25Heroes().filter(i=>!r25Legend(i)).sort((a,b)=>hashS('rk25'+a)-hashS('rk25'+b)||(a<b?-1:1));let n=0;
    ids.forEach(i=>{const cls=TPL[i].cls;let k=R25.mix[n++%R25.mix.length];if(k==='s'&&!['warrior','knight'].includes(cls)){k=R25.mix[n++%R25.mix.length];if(k==='s')k='c';}R25K[i]=k;});
    r25Heroes().filter(r25Legend).forEach(i=>{R25K[i]='w';});}
  return R25K[id]||'w';}
{const sk0=sigKind;sigKind=function(id){return R25.off?sk0.apply(this,arguments):r25Kind(id);};}
{const sg0=sigGid;sigGid=function(id){if(R25.off)return sg0.apply(this,arguments);return R25_PRE[r25Kind(id)]+id;};}
// the gear entries for the new kinds (and an armor or charm entry for a wayfarer whose old kind was another one)
function r25Name(sl,id){const t=TPL[id],N=R25.names[sl];if(sl==='w'){const w=(typeof SIGW!=='undefined'&&SIGW[t.cls])||'Heirloom';return `${t.n}'s ${w}`;}return `${t.n}'s ${(N&&(N[t.cls]||N._))||'Keepsake'}`;}
function r25Register(){r25Heroes().forEach(id=>{const t=TPL[id],sl=r25Kind(id),gid=R25_PRE[sl]+id;if(GEAR[gid])return;const pref=CLS[t.cls].pref[0],base={n:r25Name(sl,id),slot:sl,tier:4,only:id,bound:1,relic:1,price:3200,attr:{[pref]:4}};
    if(sl==='a'){const b=GEAR['a_'+ARM_FAM[CLS_ARM[t.cls]||'medium']+'_4'];if(!b)return;base.fam=b.fam;base.weight=b.weight;ST.forEach(q=>{if(b[q])base[q]=Math.round(b[q]*(b[q]>0?1.08:1));});}
    else if(sl==='c'){const main=CLS_ARM[t.cls]==='light'?'mag':'atk';base.hp=130;base[main]=15;base.spd=6;}
    else if(sl==='k'||sl==='s'){const b=GEAR[r25BaseId(t.cls,sl,4)];if(!b)return;ST.forEach(q=>{if(b[q]>0)base[q]=Math.round(b[q]*1.08);});if(b.fam)base.fam=b.fam;}
    else return;
    addGear(gid,base);});}
function r25BaseId(cls,sl,t){if(sl==='s')return 's_shield_'+t;const w=CLS_ARM[cls]||'medium';return (w==='light'?'k_bootl_':w==='heavy'?'k_booth_':'k_cape_')+t;}
try{r25Register();}catch(e){R25.err=String(e&&e.message||e);}
// worn signature slots: every slot now
{const hs0=hasSignature;hasSignature=function(id){if(R25.off)return hs0.apply(this,arguments);const c=G&&G.roster[id];return !!(c&&c.eq&&Object.keys(c.eq).some(sl=>R25_RE.test(String(c.eq[sl]||''))&&baseIdOf(String(c.eq[sl])).endsWith('_'+id)));};}
{const ss0=sigSlots;sigSlots=function(id){if(R25.off)return ss0.apply(this,arguments);const c=G&&G.roster[id],o={};if(c&&c.eq)Object.keys(c.eq).forEach(sl=>{if(R25_RE.test(String(c.eq[sl]||''))&&baseIdOf(String(c.eq[sl])).endsWith('_'+id))o[sl]=1;});return o;};}
// ---------- 2 to 5. the piece itself ----------
{const rb0=relicBuild;relicBuild=function(id,t){const b=GEAR[id];if(R25.off||!b||!b.only||!TPL[b.only])return rb0.apply(this,arguments);const tp=TPL[b.only],cls=tp.cls;let o;
    if(b.slot==='k'||b.slot==='s'){o=Object.assign({},b);const base=GEAR[r25BaseId(cls,b.slot,t)],k=ECON11.relicEdge*ECON11.relicTemper;if(base)ST.forEach(s=>{if(base[s]>0)o[s]=Math.max(b[s]||0,Math.round(base[s]*k));});
      if(b.attr)o.attr=Object.fromEntries(Object.keys(b.attr).map(a=>[a,b.attr[a]+(t>=4?6:t>=3?4:2)]));o.tier=Math.max(b.tier||0,Math.min(5,t));o.relic=1;o.plus=0;}
    else{o=Object.assign({},rb0.apply(this,arguments));if(b.slot==='c')ST.forEach(q=>{if(o[q]>0)o[q]=Math.round(o[q]*R25.charmK);});/* a charm relic scored level with the best shop charm at +3 for some healers (v209a) */}
    o.n=r25Name(b.slot,b.only);o.leg25=1;o.rp=R25.perk[cls]||R25.perk._;o.rsk='relic_'+b.only;if(!o.el&&tp.el&&tp.el[0])o.el=tp.el[0];return o;};}
// the rarity
try{if(!ITEM_TIERS[7])ITEM_TIERS[7]={n:'Legendary',c:'#ffd23d',c2:'#fff1b8',pip:'♛'};}catch(e){}
{const gt0=gTierIdx;gTierIdx=function(g){if(!R25.off&&g&&g.relic&&g.only)return 7;return gt0.apply(this,arguments);};}
// the bonuses
const r25Worn=c=>{try{if(!c||!c.eq)return null;for(const sl of Object.keys(c.eq)){const id=c.eq[sl];if(id&&R25_RE.test(String(id))){const g=gearOf(id);if(g&&g.relic&&g.only===c.id&&g.rp)return g;}}}catch(e){}return null;};
HOOK.xform('calcStats','relics25','the bonuses of the personal relic the hero wears',function(S,c){try{if(R25.off||!S||(G&&G.daily))return S;const g=r25Worn(c);if(!g)return S;const P=g.rp;
    if(P.crit)S.crit=(S.crit||0)+P.crit;if(P.critDmg)S.critDmg=(S.critDmg||1.5)+P.critDmg;if(P.acc)S.acc=(S.acc||.97)+P.acc;if(P.eva)S.eva=Math.min(.3,(S.eva||0)+P.eva);
    if(P.pierce)S.pierce=Math.max(S.pierce||0,0)+P.pierce;if(P.spellPow)S.spellPow=(S.spellPow||0)+P.spellPow;if(P.healUp)S.healUp=(S.healUp||0)+P.healUp;if(P.mpEff)S.mpEff=Math.max(S.mpEff||0,P.mpEff);
    if(P.tempo)S.tempo=(S.tempo||1)*P.tempo;if(P.hpM)S.mhp=Math.round(S.mhp*P.hpM);if(P.defM)S.def=S.def*P.defM;S.relic25=g.rsk;}catch(e){R25.err=String(e&&e.message||e);}return S;});
// ---------- 6. the skill ----------
const R25S={};
function r25Skill(t){const K=R25.skill[t.cls]||R25.skill.warrior,kind=r25Kind(t.id),noun=kind==='w'?((typeof SIGW!=='undefined'&&SIGW[t.cls])||'Heirloom'):((R25.names[kind]||{})[t.cls]||(R25.names[kind]||{})._||'Keepsake');
  const el=(t.el&&t.el[0])||null,heal=K.k==='heal',KF=R25.kindFx[kind]||{},sn=k=>(STS[k]&&STS[k].n)||k,bits=[],can=[],van=[],and=L=>L.length<2?L.join(''):L.slice(0,-1).join(', ')+' and '+L[L.length-1],or=L=>L.length<2?L.join(''):L.slice(0,-1).join(', ')+' or '+L[L.length-1];
  const s={id:'relic_'+t.id,n:`${t.n}'s ${K.n}`,k:K.k,pw:+(K.pw*(KF.pwM||1)).toFixed(2),mp:K.mp,t:K.t,el:heal?null:el,lv:1,cost:1,hits:K.hits||1,relic:t.id};
  ['crit','execute','drain','strip','pierce','shieldChip','lbParty','revive','cleanse'].forEach(k=>{if(K[k])s[k]=K[k];});
  ['fx','self','allyFx'].forEach(k=>{if(K[k])s[k]=K[k].map(q=>q.slice());});
  const has=(L,k)=>(L||[]).some(q=>q[0]===k);
  if(el){if(heal){const b=R25.elBoon[el];if(b&&!has(s.fx,b)){(s.fx=s.fx||[]).push([b,1]);van.push(sn(b));}}
    else{(t.el||[]).slice(0,2).forEach(e=>{const f=R25.elFx[e];if(f&&!has(s.fx,f[0])){(s.fx=s.fx||[]).push(f.slice());can.push(sn(f[0]));}});}
    if(heal&&t.el[1]){const b=R25.elBoon[t.el[1]];if(b&&!has(s.fx,b)){s.fx.push([b,1]);van.push(sn(b));}}}
  if(KF.self){if(heal){if(!has(s.fx,KF.self)){s.fx.push([KF.self,1]);van.push(sn(KF.self));}}else if(!has(s.self,KF.self)){(s.self=s.self||[]).push([KF.self,1]);bits.push(KF.txt);}}
  if(KF.lb&&!heal){s.lbParty=(s.lbParty||0)+KF.lb;if(!K.lbParty)bits.push(KF.txt);}
  if(KF.pwM&&kind==='w')bits.push(KF.txt);
  // 0.22.54 text sweep: whole sentences ("...; can Slow them, can Root them, Stronger for being a weapon." read as a list of scraps)
  if(can.length)bits.unshift(`It can ${or(can)} them`);if(van.length)bits.unshift(`The vanguard gains ${and(van)}`);
  s.d=`${K.what}.${bits.map(b=>' '+b+'.').join('')} Only while ${t.n}'s ${noun} is equipped.`;
  try{if(typeof dlFor==='function'){const d=dlFor(t.cls,s);if(d)s.dl=d;}}catch(e){}return s;}
HOOK.xform('classSkills','relics25','the skill a personal relic grants while it is worn',function(L,t){try{if(R25.off||!L||!t||t.mon||!CLS[t.cls]||L.some(s=>s&&s.relic))return L;const sk=R25S[t.id]||(R25S[t.id]=r25Skill(t));return L.concat([sk]);/* a copy: the class kit itself (cached per hero, 14 skills) is left as it is */}catch(e){R25.err=String(e&&e.message||e);}return L;});
{const sk0=skillKnown;skillKnown=function(c,s){if(s&&s.relic){if(R25.off)return false;const g=r25Worn(c);return !!(g&&g.only===s.relic);}return sk0.apply(this,arguments);};}
// the item text: the bonuses and the skill
HOOK.xform('gearDesc','relics25','a relic lists its bonuses and its skill',function(s,id){try{const g=typeof id==='string'?gearOf(id):id;if(R25.off||!g||!g.relic||!g.rp||!g.only)return s;
    const b=Object.keys(g.rp).map(k=>R25.perkTxt[k]?R25.perkTxt[k](g.rp[k]):'').filter(Boolean).join(', '),sk=TPL[g.only]?r25Skill(TPL[g.only]).n:'';
    const add=`${b}${sk?`; grants the skill ${sk}`:''}`;return s&&s.indexOf(add)<0?s+'. '+add:(s||add);}catch(e){return s;}});
try{window.__R25={R25,kind:r25Kind,gid:id=>sigGid(id),skill:id=>r25Skill(TPL[id]),worn:r25Worn,heroes:r25Heroes};}catch(e){}
