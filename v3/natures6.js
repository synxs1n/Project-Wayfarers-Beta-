// ===== natures6.js (v0.10.6): natures as sub-roles, single element mastery rework =====
// Natures: every class has three natures that push it into a sub-role (a tank-ish, a damage-ish and a tempo or support take) with
// stat swings of about 10 to 15% in both directions and one small perk. The old natures stay defined (saves and templates keep
// them, the Guild Hall still rerolls inside the class pool), the class pools now hold the three new ones. Perks beyond the stat keys
// calcStats already reads (hp mp atk def mag res agi crit eva tempo heal) are applied by the calcStats wrapper below: critDmg
// (added), acc (added), mpEff (spell MP cost cut), guardM (damage taken while guarding, a multiplier on the usual half), low (bonus
// damage below half HP), chi (chi heals), lowHp... All are read off S by the battle code or by the small hooks here.
// Mastery (single element heroes): every mastery now gives +25% damage with the element (MASTERY_BONUS), the status proc, 10% more
// MP, and a quarter less damage taken from the hero's own element. Light's healing bonus (it did nothing for a Light warrior) is
// replaced by +15% against undead and shadow foes; Shadow keeps its drain.
const NAT6={
 // warrior
 bulwark6:{n:'Bulwark',sub:'Tank',d:'+15% defense, +10% max HP, -6% attack. Guarding cuts damage by 60% instead of 50%.',fx:{def:1.15,hp:1.1,atk:.94,guardM:.8}},
 berserk6:{n:'Berserker',sub:'Damage',d:'+15% attack, +6% crit, -10% defense. +12% damage below half HP.',fx:{atk:1.15,crit:.06,def:.9,low:.12}},
 vanguard6:{n:'Vanguard',sub:'Tempo',d:'+6% attack and defense, actions take 5% less time.',fx:{atk:1.06,def:1.06,tempo:.95}},
 // knight
 sentinel6:{n:'Sentinel',sub:'Tank',d:'+15% defense, +10% resistance, -8% attack. Guarding cuts damage by 60%.',fx:{def:1.15,res:1.1,atk:.92,guardM:.8}},
 crusader6:{n:'Crusader',sub:'Damage',d:'+12% attack, +8% crit damage, -8% resistance.',fx:{atk:1.12,critDmg:.08,res:.92}},
 warden6:{n:'Warden',sub:'Support',d:'+12% max HP, +12% resistance, -5% attack.',fx:{hp:1.12,res:1.12,atk:.95}},
 // mage
 evoker6:{n:'Evoker',sub:'Damage',d:'+15% magic, -8% resistance, -8% max HP.',fx:{mag:1.15,res:.92,hp:.92}},
 sage6:{n:'Sage',sub:'Support',d:'+12% resistance, +15% MP, -4% magic. Spells cost 10% less MP.',fx:{res:1.12,mp:1.15,mag:.96,mpEff:.1}},
 channeler6:{n:'Channeler',sub:'Tempo',d:'+8% magic, actions take 6% less time, -6% max HP.',fx:{mag:1.08,tempo:.94,hp:.94}},
 // healer (priest)
 mender6:{n:'Mender',sub:'Support',d:'+18% healing, -5% magic.',fx:{heal:1.18,mag:.95}},
 oracle6:{n:'Oracle',sub:'Damage',d:'+12% magic, +10% resistance, -6% healing.',fx:{mag:1.12,res:1.1,heal:.94}},
 devout6:{n:'Devout',sub:'Tank',d:'+12% max HP, +12% resistance, -4% magic.',fx:{hp:1.12,res:1.12,mag:.96}},
 // thief
 shadow6:{n:'Shadow',sub:'Damage',d:'+10% crit, +5% evasion, -8% max HP.',fx:{crit:.1,eva:.05,hp:.92}},
 duelist6:{n:'Duelist',sub:'Tempo',d:'+12% attack, +6% agility, -3% evasion.',fx:{atk:1.12,agi:1.06,eva:-.03}},
 trickster6:{n:'Trickster',sub:'Support',d:'+10% agility, actions take 6% less time, -5% attack.',fx:{agi:1.1,tempo:.94,atk:.95}},
 // archer
 marksman6:{n:'Marksman',sub:'Damage',d:'+8% crit, +15% crit damage, -6% max HP.',fx:{crit:.08,critDmg:.15,hp:.94}},
 ranger6:{n:'Ranger',sub:'Tempo',d:'+10% attack, +8% agility.',fx:{atk:1.1,agi:1.08}},
 hawk6:{n:'Hawk',sub:'Support',d:'+8% accuracy, actions take 5% less time, -4% attack.',fx:{acc:.08,tempo:.95,atk:.96}},
 // monk
 ironfist6:{n:'Ironfist',sub:'Damage',d:'+12% attack, +8% max HP, -8% resistance.',fx:{atk:1.12,hp:1.08,res:.92}},
 stillwater6:{n:'Stillwater',sub:'Tank',d:'+12% defense and resistance, -6% attack. Chi heals 15% stronger.',fx:{def:1.12,res:1.12,atk:.94,chi:.15}},
 tempest6:{n:'Tempest',sub:'Tempo',d:'+8% agility, actions take 10% less time, -6% defense.',fx:{agi:1.08,tempo:.9,def:.94}},
 // bard
 virtuoso6:{n:'Virtuoso',sub:'Damage',d:'+12% magic, +10% MP, -6% max HP.',fx:{mag:1.12,mp:1.1,hp:.94}},
 herald6:{n:'Herald',sub:'Tank',d:'+10% resistance, +10% max HP.',fx:{res:1.1,hp:1.1}},
 minstrel6:{n:'Minstrel',sub:'Tempo',d:'+8% agility, actions take 8% less time, -5% magic.',fx:{agi:1.08,tempo:.92,mag:.95}}};
const NAT6_CLASS={warrior:['bulwark6','berserk6','vanguard6'],knight:['sentinel6','crusader6','warden6'],mage:['evoker6','sage6','channeler6'],
 healer:['mender6','oracle6','devout6'],thief:['shadow6','duelist6','trickster6'],archer:['marksman6','ranger6','hawk6'],monk:['ironfist6','stillwater6','tempest6'],bard:['virtuoso6','herald6','minstrel6']};
try{Object.assign(NATURES,NAT6);Object.keys(NAT6_CLASS).forEach(k=>{NAT_CLASS[k]=NAT6_CLASS[k];});}catch(e){}
// the pool: the three sub-roles of the class (plus the hero's own trait while it is the current nature of an old save)
{const np0=natPool;natPool=function(id){const t=TPL[id];if(!t||!NAT6_CLASS[t.cls]||t.src==='L'||t.src==='x'||t.mon)return np0.apply(this,arguments);
  const P=NAT6_CLASS[t.cls].slice();if(t.trait&&NATURES[t.trait]&&!P.includes(t.trait))P.push(t.trait);try{const c=G&&G.roster&&G.roster[id],cur=c&&natOf(c);if(cur&&!P.includes(cur)&&NATURES[cur])P.push(cur);}catch(e){}return P;};}
// new heroes start on a sub-role: the template's trait maps to the nearest of the three (by its stat keys), seeded by the hero id
function nat6Default(id){const t=TPL[id];if(!t||!NAT6_CLASS[t.cls])return null;const P=NAT6_CLASS[t.cls],old=NATURES[t.trait],fx=old&&old.fx||{};
  const score=k=>{const f=NATURES[k].fx;let s=0;Object.keys(fx).forEach(q=>{if(f[q]!=null)s+=(f[q]>1||(q==='crit'||q==='eva'))===(fx[q]>1||(q==='crit'||q==='eva'))?1:0;});return s;};
  let best=P[0],bs=-1;P.forEach(k=>{const s=score(k);if(s>bs){bs=s;best=k;}});return best;}
{const nc0=newChar;newChar=function(id){const c=nc0.apply(this,arguments);try{if(c&&!c.nat&&!(G&&G.daily)){const k=nat6Default(id);if(k){c.nat=k;c.S=calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;}}}catch(e){}return c;};}
// the perks past the plain stat keys, and the mastery rework
try{MASTERY.light.heal=0;MASTERY.light.vs=.15;MASTERY.light.d='Light skills deal 25% more and may Blind. +15% against undead and shadow foes.';
  Object.keys(MASTERY).forEach(k=>{MASTERY[k].d=MASTERY[k].d.replace('20% more','25% more');});}catch(e){}
const MAST6={mp:.1,res:.25};
{const cs0=calcStats;calcStats=function(c){const S=cs0.apply(this,arguments);try{if(!c||!S)return S;const NF=natInfo(natOf(c)).fx||{};
    if(NF.critDmg)S.critDmg=(S.critDmg||1.5)+NF.critDmg;if(NF.acc)S.acc=(S.acc||.97)+NF.acc;if(NF.mpEff)S.mpEff=Math.max(S.mpEff||0,NF.mpEff);
    if(NF.guardM)S.guardM=NF.guardM;if(NF.low)S.low=NF.low;if(NF.chi)S.chi=NF.chi;
    if(S.mastery&&!(G&&G.daily)){S.mmp=Math.round(S.mmp*(1+MAST6.mp));S.elRes[S.mastery]=Math.max(S.elRes[S.mastery]||0,MAST6.res);}}catch(e){}return S;};}
HOOK.xform('calcDamage','natures6','nature and mastery perks on damage',function(r,a,sk,t){try{if(!r||!a||!t||!a.S)return r;let m=1;
    if(a.S.low&&a.hp<=a.S.mhp*.5)m*=1+a.S.low;
    if(t.guard&&t.S&&t.S.guardM)m*=t.S.guardM;
    if(a.S.mastery==='light'&&MASTERY.light.vs&&skEls(sk).includes('light')&&((t.ty||[]).includes('undead')||(t.el||[]).includes('shadow')))m*=1+MASTERY.light.vs;
    if(m!==1)r.dmg=Math.max(1,Math.round(r.dmg*m));}catch(e){}return r;});
// Stillwater monks: chi heals 15% stronger (roles.js sets the chi heal power inside its own perform hook; this scales both inputs)
HOOK.wrap('perform','natures6','chi heal nature perk',function(next,...args){const a=args[0],sk=args[1];if(!(sk&&sk.chi&&a&&a.S&&a.S.chi&&typeof ROLES!=='undefined'))return next(...args);
  const k0=ROLES.w.chiK,h0=a.S.healP;try{ROLES.w.chiK=k0*(1+a.S.chi);if(h0)a.S.healP=h0*(1+a.S.chi);return next(...args);}finally{ROLES.w.chiK=k0;a.S.healP=h0;}});
