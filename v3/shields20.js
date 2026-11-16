// ===== shields20.js (v0.22.12): shields for Warriors and Knights =====
// Owner: "Add shields. Warriors and Knights can equip one when using a one-handed weapon."
// A fifth equipment slot, s (Shield), shown only for classes that can hold one (SH20.cls: warrior, knight). A shield adds defense and some
// resistance (SH20.def, SH20.res per tier, about a quarter of heavy armor's defense) and counts only while the weapon in hand is one-handed
// (SH20.one: sword, axe, mace, lance; a signature weapon by its family). Two-handed: greatsword, warhammer, standard.
// - Equipping a two-handed weapon puts the shield back in the pack (equipGear, and Equip best: the weapon is chosen first, then the shield).
// - Anything that leaves a shield beside a two-handed weapon (an old path, a swap) keeps it on the hero but it gives nothing (calcStats wrap)
//   and the sheet says why.
// - Sold at the Smithy (Armor > Shields, the two newest tiers) once a Warrior or Knight is in the roster; tempered like armor (ore and hide).
const SH20={cls:['warrior','knight'],one:['blade','axe','mace','lance','shortsword','dagger'],
  n:['Wooden Buckler','Iron Heater','Steel Kite Shield','Tower Aegis','Royal Bulwark','Mythsteel Aegis'],
  def:[5,10,16,24,34,47],res:[2,4,7,11,15,21],price:[70,170,420,820,1500,2600],n2:{}};
SLOTN.s='Shield';
if(!EQSL.includes('s'))EQSL.push('s');
SH20.n.forEach((n,t)=>addGear('s_shield_'+t,{n,slot:'s',tier:t,fam:'shield',def:SH20.def[t],res:SH20.res[t],price:SH20.price[t]}));
if(typeof FAM_RAW!=='undefined'){FAM_RAW.shield='ore';FAM_PART.shield='hide';}
const sh20Cls=c=>{const t=c&&TPL[c.id];return !!(t&&SH20.cls.includes(t.cls));};
// the weapon in hand is one-handed (no weapon counts as a free hand)
function sh20OneHand(c,wid){const id=wid===undefined?c&&c.eq&&c.eq.w:wid;if(!id)return true;const g=gearOf(id);if(!g)return true;if(g.stick)return true;return SH20.one.includes(g.fam||g.wt);}
const sh20Ok=c=>sh20Cls(c)&&sh20OneHand(c);
// the slots a hero's sheet shows
function eqSlotsOf(c){return EQSL.filter(sl=>sl!=='s'||sh20Cls(c));}
{const ce0=canEquip;canEquip=function(c,id){const g=gearOf(id);if(g&&g.slot==='s')return sh20Ok(c);return ce0.apply(this,arguments);};}
{const ew0=equipWhy;equipWhy=function(c,id){const g=gearOf(id),t=c&&TPL[c.id];if(g&&g.slot==='s'&&t){if(!sh20Cls(c))return 'Only Warriors and Knights carry shields.';
  return 'A shield needs a one-handed weapon (sword, axe, mace or lance).';}return ew0.apply(this,arguments);};}
// stats: a shield beside a two-handed weapon gives nothing
HOOK.wrap('calcStats','shields20','a shield counts only beside a one-handed weapon',function(next,c){if(!c||!c.eq||!c.eq.s||sh20Ok(c))return next(c);
  const s=c.eq.s;c.eq.s=null;try{return next(c);}finally{c.eq.s=s;}});
// a two-handed weapon puts the shield back in the pack
function sh20Drop(c){try{if(c&&c.eq&&c.eq.s&&!sh20Ok(c)&&G&&!G.daily){G.gear.push(c.eq.s);c.eq.s=null;return true;}}catch(e){}return false;}
{const eg0=equipGear;equipGear=function(c,id){const r=eg0.apply(this,arguments);if(sh20Drop(c))try{refresh(c);}catch(e){}return r;};}
// the Smithy's upgrade plan (p3shop.js): a shield is not planned for a hero whose planned weapon is two-handed, and a hero's weapon is
// applied before their shield
{const pp0=p3SmithPlan;p3SmithPlan=function(){const P=pp0.apply(this,arguments);try{if(!P||!P.picks||!P.picks.some(p=>p.sl==='s'))return P;
  const two=new Set(P.picks.filter(p=>p.sl==='w'&&!sh20OneHand(G.roster[p.cid],p.id)).map(p=>p.cid));
  P.picks=P.picks.filter(p=>!(p.sl==='s'&&two.has(p.cid)));
  P.picks.sort((a,b)=>a.cid===b.cid?(a.sl==='s')-(b.sl==='s'):0);P.total=P.picks.reduce((a,p)=>a+p.gold,0);}catch(e){}return P;};}
// the Smithy
{const ss0=shopStock;shopStock=function(tab){const r=ss0.apply(this,arguments);try{if(tab==='armor'&&G&&Object.values(G.roster).some(c=>sh20Cls(c))){const tiers=[Math.min(5,G.stage)];if(G.stage>0)tiers.unshift(G.stage-1);
  tiers.forEach(t=>r.push('s_shield_'+t));}}catch(e){}return r;};}
// the item text
HOOK.xform('gearDesc','shields20','shields say what they need',function(s,id){try{const g=typeof id==='string'?gearOf(id):id;if(g&&g.slot==='s'&&s.indexOf('One-handed')<0)return 'Shield (Warriors, Knights; with a one-handed weapon)'+(s?', '+s:'');}catch(e){}return s;});
// the icon: a heater shield in the tier's metal, a boss and a trim that grow with the tier
if(typeof ICF!=='undefined')ICF.shield=(b,t,P)=>{const o={};
  icArt(b,3,1,['MMMMMMMMMM','MTTTTTTTTM','MT......TM','MT......TM','MT......TM','MT......TM','.MT....TM.','.MT....TM.','..MT..TM..','..MT..TM..','...MTTM...','....MM....'],t<2?{T:'W'}:null);
  icRect(b,5,3,6,4,t<2?'W':'C');icRect(b,6,7,4,2,t<2?'W':'C');icRect(b,7,9,2,2,t<2?'W':'C');
  if(t===0){icRect(b,7,3,1,8,'L');}
  if(t===1){icSet(b,7,5,'M');icSet(b,8,5,'M');}
  if(t>=2){icArt(b,6,4,['.MM.','MGGM','.MM.']);}
  if(t===3){icSet(b,4,2,'G');icSet(b,11,2,'G');}
  if(t===4){icSet(b,4,2,'G');icSet(b,11,2,'G');icRect(b,6,8,4,1,'T');o.spark=[[14,1]];}
  if(t===5){icSet(b,4,2,'S');icSet(b,11,2,'S');icRect(b,6,8,4,1,'T');icSet(b,7,10,'S');o.aura=TIER_GEM[5];}
  return o;};
// tests
try{window.__SH20={SH20,ok:c=>sh20Ok(c),one:(c,w)=>sh20OneHand(c,w),slots:c=>eqSlotsOf(c)};}catch(e){}
