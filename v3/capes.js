// ===== capes.js (v0.4.3): capes, the fourth equipment slot =====
// Every class can wear a cape. Capes add HP, resistance and a little speed, about a quarter of what armor gives at the same tier.
// Sold at the Smithy beside armor, tempered like garb (logs and hide). v0.6.3: capes no longer show on the hero's sprite (only the
// weapon and the hero's own personal reward change the look); a hero's own cape from their base look stays.
// Old saves simply have no cape equipped.

SLOTN.k='Cape';
const CAPE_N=['Traveler\'s Cloak','Woolen Cape','Ranger\'s Mantle','Silk Cloak','Royal Mantle','Mythweave Cape'];
// CAPE_ST, CAPE_PRICE: in config.js
const CAPE_COL=['#8a6a4a','#5fa86a','#4a7ad8','#9a5ae0','#e0b030','#d84a3a'];
CAPE_N.forEach((n,t)=>{const [hp,res,spd]=CAPE_ST[t];addGear('k_cape_'+t,{n,slot:'k',tier:t,fam:'cape',hp,res,spd:spd||undefined,price:CAPE_PRICE[t]});});
if(typeof GICON!=='undefined')GICON.cape=[[5,2,6,2],[4,4,8,9],[3,9,2,4],[11,9,2,4]];
if(typeof FAM_RAW!=='undefined'){FAM_RAW.cape='wood';FAM_PART.cape='hide';}
{const ss0=shopStock;shopStock=function(tab){const r=ss0.apply(this,arguments);if(tab==='armor'&&G){const tiers=[Math.min(5,G.stage)];if(G.stage>0)tiers.unshift(G.stage-1);tiers.forEach(t=>r.push('k_cape_'+t));}return r;};}
