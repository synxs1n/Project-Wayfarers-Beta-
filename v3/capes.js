// ===== capes.js (v0.4.3, boots since v0.22.11): the fourth equipment slot =====
// v0.22.11, owner: "Change capes to boots, with light, medium and heavy variants. Bonuses like armor but simpler, usually one clear bonus."
// The fourth slot (k) is Boots. Three weights (numbers since v0.22.17; before that light was speed, medium HP, heavy defense, one stat each,
// and Equip Best put light boots on every medium armor wearer for the speed):
//   Light boots  (k_bootl_T): MAG and MP, the casters' boots. Every class can wear them.
//   Medium boots (k_cape_T, the old cape ids, so saves keep them): SPD and some HP. Classes in medium or heavy armor.
//   Heavy boots  (k_booth_T): DEF and HP. Classes in heavy armor.
// A class wears boots of its armor weight or lighter (CLS_ARM). Sold at the Smithy beside armor (the two newest tiers of each weight the party
// can wear), tempered like garb. Boots do not show on the sprite (as capes did not since v0.6.3).
// Old saves: a cape becomes medium boots of the same tier and temper; a hero who cannot wear medium boots has theirs swapped for light boots
// of the same tier and temper on load (bootsMigrate). Numbers in config.js (BOOT_ST, BOOT_PRICE).
SLOTN.k='Boots';
const BOOT_W={l:'light',m:'medium',h:'heavy'},BOOT_RANK={light:0,medium:1,heavy:2};
const BOOT_N={
 l:['Cloth Shoes','Soft Boots','Ranger\'s Treads','Silkstep Boots','Windwalkers','Mythweave Striders'],
 m:['Traveler\'s Boots','Leather Boots','Studded Boots','Wyrmhide Boots','Royal Riding Boots','Mythhide Boots'],
 h:['Iron Boots','Steel Sabatons','Knight\'s Greaves','Runed Greaves','Royal Sabatons','Mythsteel Greaves']};
const BOOT_ID={l:'k_bootl_',m:'k_cape_',h:'k_booth_'};
const CAPE_COL=['#8a6a4a','#5fa86a','#4a7ad8','#9a5ae0','#e0b030','#d84a3a'];// the tier trim colour of every boot icon
['l','m','h'].forEach(w=>BOOT_N[w].forEach((n,t)=>{const o={n,slot:'k',tier:t,fam:'boot'+w,weight:BOOT_W[w],price:BOOT_PRICE[t]};Object.keys(BOOT_ST[w]).forEach(k=>{o[k]=BOOT_ST[w][k][t];});addGear(BOOT_ID[w]+t,o);}));
if(typeof FAM_RAW!=='undefined'){FAM_RAW.bootl='wood';FAM_PART.bootl='hide';FAM_RAW.bootm='wood';FAM_PART.bootm='hide';FAM_RAW.booth='ore';FAM_PART.booth='hide';}
const bootName=w=>({light:'Light boots',medium:'Medium boots',heavy:'Heavy boots'})[w]||'Boots';
// who may wear which boots: the class's armor weight or lighter
function bootOk(c,g){const t=TPL[c.id];if(!t)return false;return BOOT_RANK[g.weight]<=BOOT_RANK[CLS_ARM[t.cls]||'medium'];}
{const ce0=canEquip;canEquip=function(c,id){const g=gearOf(id);if(g&&g.slot==='k'&&g.weight&&c&&TPL[c.id]&&!g.only)return bootOk(c,g);return ce0.apply(this,arguments);};}
{const ew0=equipWhy;equipWhy=function(c,id){const g=gearOf(id),t=c&&TPL[c.id];if(g&&g.slot==='k'&&g.weight&&t){const top=CLS_ARM[t.cls]||'medium';
  return `${CLS[t.cls].n}s wear ${top==='light'?'light boots':top==='medium'?'light or medium boots':'any boots'}.`;}return ew0.apply(this,arguments);};}
// the item text names the weight first, as armor does
HOOK.xform('gearDesc','capes','boots name their weight',function(s,id){try{const g=typeof id==='string'?gearOf(id):id;if(g&&g.slot==='k'&&g.weight&&s.indexOf(bootName(g.weight))<0)return bootName(g.weight)+(s?', '+s:'');}catch(e){}return s;});
// the Smithy: the two newest tiers of each weight somebody in the roster can wear
{const ss0=shopStock;shopStock=function(tab){const r=ss0.apply(this,arguments);if(tab==='armor'&&G){const tiers=[Math.min(5,G.stage)];if(G.stage>0)tiers.unshift(G.stage-1);
  let top=0;try{Object.values(G.roster).forEach(c=>{const t=TPL[c.id];if(t)top=Math.max(top,BOOT_RANK[CLS_ARM[t.cls]||'medium']);});}catch(e){top=2;}
  ['l','m','h'].forEach(w=>{if(BOOT_RANK[BOOT_W[w]]>top)return;tiers.forEach(t=>r.push(BOOT_ID[w]+t));});}return r;};}
// old saves: boots a hero cannot wear (a mage in old cape ids, now medium boots) become light boots of the same tier and temper
function bootsMigrate(g){g=g||G;const out=[];if(!g||g.daily||!g.roster)return out;
  Object.values(g.roster).forEach(c=>{const id=c&&c.eq&&c.eq.k;if(!id||!TPL[c.id])return;const q=gearOf(id);if(!q||q.slot!=='k'||!q.weight||bootOk(c,q))return;
    const m=String(id).match(/^k_(?:cape|bootl|booth)_(\d)(\+\d)?$/);if(!m)return;const nid='k_bootl_'+m[1]+(m[2]||'');c.eq.k=nid;out.push([c.id,id,nid]);});
  if(out.length)Object.values(g.roster).forEach(c=>{try{refresh(c);}catch(e){}});return out;}
{const e0=enterWorldFromSave;enterWorldFromSave=function(){const r=e0.apply(this,arguments);try{bootsMigrate(G);}catch(e){}return r;};}
