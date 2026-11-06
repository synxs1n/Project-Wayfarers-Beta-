// =================== DESCRIPTORS (Beta v0.3.1) ===================
// Tap any stat or attribute on the hero sheet for what it does; every class has a role card on the sheet and in the Codex.
const STAT_INFO={
  hp:['HP','Health. At 0 the hero is knocked out until revived.','Raised by Vitality, levels and armor.'],
  mp:['MP','Pays for skills. Recovers a little each turn and fully at an inn.','Raised by Spirit, Intellect, Faith, staves and robes.'],
  atk:['ATK','Physical damage from attacks and physical skills.','Raised by Strength, some Dexterity, and weapons.'],
  def:['DEF','Cuts physical damage taken.','Raised by Vitality, some Strength, and armor (mail most).'],
  mag:['MAG','Damage from spells and magical skills, and part of healing power.','Raised by Intellect, some Faith, staves and tomes.'],
  res:['RES','Cuts magical damage taken.','Raised by Spirit, a little Intellect and Faith, and robes.'],
  spd:['SPD','How soon a hero acts again. Higher speed means more turns.','Raised by Agility and light gear.'],
  crit:['CRIT','Chance for a critical hit (x1.5 or more damage).','Raised by Luck and Dexterity; some skills add more.'],
  eva:['EVA','Chance to dodge a physical attack.','Raised by Agility and Luck. Capped at 22%.'],
  healP:['HEAL','Healing power for heal skills, Regen and revives.','Raised mostly by Faith, then Spirit and MAG.']};
function prefersAttr(k){return Object.keys(CLS).filter(c=>(CLS[c].pref||[]).includes(k)).map(c=>CLS[c].n);}
const CLASS_DESC={
  warrior:{role:'Vanguard damage',str:'Big single hits, sweeps that hit every foe, War Cry to draw attacks.',wpn:'Blades and mail'},
  knight:{role:'Tank and protector',str:'Taunts, Wards and Bulwark for the line; the toughest body in the game.',wpn:'Blades and mail'},
  mage:{role:'Elemental caster',str:'The strongest spells, storms that hit every foe, Haste and Hex.',wpn:'Staves (cheaper spells, +10% elemental) or tomes (more raw power), and robes'},
  healer:{role:'Healer',str:'Heals, cleanses, Regen and revives. Scales mostly on Faith.',wpn:'Staves and robes'},
  thief:{role:'Fast striker',str:'The fastest class: steals, poisons, blinds and crits.',wpn:'Daggers and light garb'},
  archer:{role:'Ranged damage',str:'Bleeds, roots and armor-piercing shots.',wpn:'Bows and light garb'},
  monk:{role:'Brawler',str:'Free multi-hit strikes, self-healing and stuns. A little Faith.',wpn:'Blades (fists wrapped in them) and garb'},
  bard:{role:'Support',str:'Party heals, Might and Haste for the line, and debuffs on every foe.',wpn:'Staves and garb'},
  sniper:{role:'Legendary horse archer',str:'Shadow and lightning bolts; shoots back when struck.',wpn:'Crossbows and garb'},
  druid:{role:'Legendary beast warden',str:'A wolf and a hawk at his call, roots and bleeds, wild medicine.',wpn:'Bows and garb'},
  archmage:{role:'Legendary spellweaver',str:'Ice and lightning, two spells a turn, cheap to cast.',wpn:'Staves (Jaeson keeps his) or tomes, and robes'},
  chronicler:{role:'Archive caster',str:'Casts the signature moves of every Scourge and Calamity you have defeated. Scales on Intellect and Faith.',wpn:'Tomes (or staves) and robes'}};
function clsGearText(cls){const w=CLS_WPN[cls];if(!w)return '';return w.map(f=>WT_NAME[f]||f).join(', ')+' · '+(ARM_NAME[CLS_ARM[cls]||'medium']);}
function classCard(cls){const C=CLS[cls],D=CLASS_DESC[cls]||{};return `<div class="clscard"><b>${esc(C.n)}: ${esc(D.role||'')}</b><small>${esc(D.str||C.role||'')}</small><small><b>Prefers</b> ${(C.pref||[]).map(k=>ATTRN[k]?ATTRN[k][0]:k).join(', ')} · <b>Gear</b> ${esc(clsGearText(cls)||D.wpn||'')}</small></div>`;}
function mStatInfo(m){const k=m.k,A=ATTRN[k],S=STAT_INFO[k];
  if(A){const fans=prefersAttr(k);return box(`${A[0]} (${k.toUpperCase()})`,`<p>${esc(A[1])}.</p>${k==='fth'?'<p class="note">Faith adds more to healing than MAG does, a little less to spell damage, and a little resistance.</p>':''}<p class="note">${fans.length?'Classes that favor it: '+fans.join(', ')+'.':'No class leans on it first, but every hero gains from it.'}</p><p class="note">Each stat point you spend adds 1 (Agility 0.6).</p>`,'<button class="btn gold" data-act="xBack">Got it</button>');}
  if(S)return box(S[0],`<p>${esc(S[1])}</p><p class="note">${esc(S[2])}</p>`,'<button class="btn gold" data-act="xBack">Got it</button>');return '';}
{const vm0=vModal;vModal=function(m){if(m&&m.type==='statInfo')return mStatInfo(m);return vm0.apply(this,arguments);};}
ACT.statInfo=function(k){V.modal={type:'statInfo',k,from:V.modal};render();};
