// ===== Beta v0.4.3: capes, a fourth equipment slot ('k') =====
// Every class can wear a cape. Capes add HP, resistance and a little speed, about a quarter of what armor gives at the same tier,
// and they show on the hero (a cape in the tier's colour). Sold at the Smithy beside armor, tempered like garb (logs and hide).
// Old saves simply have no cape equipped.

SLOTN.k='Cape';
const CAPE_N=['Traveler\'s Cloak','Woolen Cape','Ranger\'s Mantle','Silk Cloak','Royal Mantle','Mythweave Cape'];
const CAPE_ST=[[25,4,0],[45,8,1],[70,13,2],[100,19,3],[140,26,4],[190,34,5]],CAPE_PRICE=[60,120,240,420,700,1000];
const CAPE_COL=['#8a6a4a','#5fa86a','#4a7ad8','#9a5ae0','#e0b030','#d84a3a'];
CAPE_N.forEach((n,t)=>{const [hp,res,spd]=CAPE_ST[t];addGear('k_cape_'+t,{n,slot:'k',tier:t,fam:'cape',hp,res,spd:spd||undefined,price:CAPE_PRICE[t]});});
if(typeof GICON!=='undefined')GICON.cape=[[5,2,6,2],[4,4,8,9],[3,9,2,4],[11,9,2,4]];
if(typeof GROLE!=='undefined')GROLE.cape='xccc';
if(typeof FAM_RAW!=='undefined'){FAM_RAW.cape='wood';FAM_PART.cape='hide';}
{const ss0=shopStock;shopStock=function(tab){const r=ss0.apply(this,arguments);if(tab==='armor'&&G){const tiers=[Math.min(5,G.stage)];if(G.stage>0)tiers.unshift(G.stage-1);tiers.forEach(t=>r.push('k_cape_'+t));}return r;};}
// the cape shows on the hero in its tier colour
{const hl0=heroLook;heroLook=function(id){const L=hl0.apply(this,arguments);try{const c=G&&G.roster[id],g=c&&c.eq&&gearOf(c.eq.k);if(L&&g){const o=Object.assign({},L);o.back=(L.back||[]).includes('cape')?L.back:(L.back||[]).concat('cape');o.pal=Object.assign({},L.pal||{},{Y:CAPE_COL[Math.min(5,g.tier||0)]});return o;}}catch(e){}return L;};}
{const hs0=hasSignature;hasSignature=function(id){if(hs0.apply(this,arguments))return true;try{const c=G&&G.roster[id];return !!(c&&c.eq&&c.eq.k);}catch(e){return false;}};}
