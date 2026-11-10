// ===== comp2.js (v0.3.2): companion family perks =====
// Each monster family adds one small perk on top of the base companion bonus. Pure stat hooks so the sims can use them.
const COMP_FAM={
  beast:{n:'Pack Instinct',d:'+5% crit chance',crit:.05},
  flyer:{n:'Tailwind',d:'+6% speed',spd:.06},
  spirit:{n:'Warding Glow',d:'25% chance to shrug off a new ailment',ward:.25},
  shell:{n:'Spiked Hide',d:'Physical attackers take 8% of the damage back',thorns:.08},
  ooze:{n:'Mending Moss',d:'Recover 2% of max HP after each of your turns',mend:.02},
  scourge:{n:'Dread Presence',d:'+3% crit chance and +3% speed',crit:.03,spd:.03}};
const FAM_OF={cinderpup:'beast',frostwolf:'beast',yeti:'beast',stareater:'beast',gustimp:'flyer',gull:'flyer',cavebat:'flyer',snowharpy:'flyer',thunderhawk:'flyer',cloudray:'flyer',
  tidewisp:'spirit',ashwraith:'spirit',stormling:'spirit',eclipsewraith:'spirit',voidspawn:'spirit',crawler:'shell',shellguard:'shell',slaggolem:'shell',iceknight:'shell',gargoyle:'shell',huskguard:'shell',
  mossling:'ooze',dewtoad:'ooze',magmaslime:'ooze',mimic:'shell'};
function compFamily(o){if(!o)return null;if(o.scourge)return 'scourge';const k=String(o.mon||'').replace(/^n_/,'');return FAM_OF[k]||(MON[k]?'beast':'scourge');}
function compPerk(o){return COMP_FAM[compFamily(o)]||null;}
// adds the perk to a stat block (called by the companion stat hook)
function applyCompPerk(S,o){const P=compPerk(o);if(!P)return S;if(P.crit)S.crit=(S.crit||0)+P.crit;if(P.spd)S.spd*=1+P.spd;if(P.ward)S.ward=P.ward;if(P.thorns)S.thorns=P.thorns;if(P.mend)S.mend=P.mend;S.perk=P.n;return S;}
// Warding Glow: a chance to shrug off a new ailment
HOOK.before('addSt','comp2','a pet wards off a status',function(t,k,src,silent){if(t&&t.side==='p'&&t.S&&t.S.ward&&STS[k]&&STS[k].bad&&!(t.st||{})[k]&&t.hp>0&&RNG()<t.S.ward){fx(t,'Warded','stat good effx imm');if(!silent)log(`${t.name}'s companion wards off ${STS[k].n}.`);return HOOK.stop(false);}});
