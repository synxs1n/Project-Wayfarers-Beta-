// ===== charms9.js (v0.13.5): charms above Rare: Epic and Heroic charms you can buy, craft and find =====
// Until now every charm you could buy or craft was Common to Rare; only guild signatures and Medals went higher. Six Epic (tier 3) and
// four Heroic (tier 4) charms join the game: Alchemy sells Epic from the third realm and Heroic from the fifth, both have recipes (Dread
// Cores and tiered materials), bounties from the third realm on sometimes post one as the reward, the first fall of an Echo may leave one,
// and the top two arena tiers add one to their purse now and then. Ids: c_ep0..5, c_hr0..3. No save fields.
const CHARMS9_EPIC=[['c_ep0','Titan Charm',{hp:150,atk:14,def:10}],['c_ep1','Oracle Charm',{mp:80,mag:14,res:10}],['c_ep2','Zephyr Charm',{spd:12,hp:80,attr:{agi:6}}],
  ['c_ep3','Bulwark Charm',{def:16,res:12,hp:100}],['c_ep4','Marksman Charm',{atk:12,spd:6,attr:{dex:8}}],['c_ep5','Fortune Charm',{luk:14,hp:60,attr:{luk:6}}]];
const CHARMS9_HEROIC=[['c_hr0','Colossus Charm',{hp:260,atk:20,def:16}],['c_hr1','Archon Charm',{mp:140,mag:22,res:16}],['c_hr2','Tempest Charm',{spd:18,atk:14,mag:14}],['c_hr3','Aegis Charm',{def:24,res:20,hp:160}]];
CHARMS9_EPIC.forEach(([id,n,st],i)=>addGear(id,Object.assign({n,slot:'c',tier:3,price:1100+i*50,d:'An Epic charm. Alchemy sells and makes these from the third realm on.'},st)));
CHARMS9_HEROIC.forEach(([id,n,st],i)=>addGear(id,Object.assign({n,slot:'c',tier:4,price:2600+i*100,d:'A Heroic charm. Alchemy sells and makes these from the fifth realm on.'},st)));
try{CHARMS9_EPIC.forEach(([id],i)=>RECIPES.push({cat:'charm',id,m:{core:1,$rel:3,[['iron','ash','sunpetal'][i%3]]:2},g:420,t:1}));
  CHARMS9_HEROIC.forEach(([id],i)=>RECIPES.push({cat:'charm',id,m:{core:2,$rel:4,[['mythril','elder','starbloom','grit'][i%4]]:2},g:980,t:2}));}catch(e){}
const CH9_EPIC=CHARMS9_EPIC.map(x=>x[0]),CH9_HEROIC=CHARMS9_HEROIC.map(x=>x[0]);
{const ss0=shopStock;shopStock=function(tab){const o=ss0.apply(this,arguments);try{if(tab==='charms'&&G&&!G.daily){if(G.stage>=2)o.push(...CH9_EPIC);if(G.stage>=4)o.push(...CH9_HEROIC);}}catch(e){}return o;};}
// bounties: from the third realm on, about one in three posts an Epic charm; in the fifth realm one in four posts a Heroic one
{const gb0=genBounties;genBounties=function(s){const before=(G&&G.bounties||[]).length,r=gb0.apply(this,arguments);try{(G.bounties||[]).slice(before).forEach(b=>{if(b.stage!==s||!b.reward||!b.reward.charm)return;
  const x=Math.random();if(s>=4&&x<.25)b.reward.charm=pick(CH9_HEROIC);else if(s>=2&&x<.58)b.reward.charm=pick(CH9_EPIC);});}catch(e){}return r;};}
// Echoes and the top arena tiers
HOOK.after('win','charms9','Epic and Heroic charms from Echoes and the arena',function(){try{const sp=B&&B.spec;if(!sp||!G||G.daily)return;const info=(B&&B.result)||(V.modal&&V.modal.info)||{};info.notes=info.notes||[];
  let id=null;if(sp.kind==='echoBoss'&&!sp.rift&&info.gear&&Math.random()<.5)id=pick(CH9_HEROIC);
  else if(sp.kind==='arena'&&(sp.tier|0)>=3&&Math.random()<(sp.tier>=4?.3:.4))id=pick(sp.tier>=4?CH9_HEROIC:CH9_EPIC);
  if(id){G.gear.push(id);info.notes.push(`${gearOf(id).n} (${ITEM_TIERS[gTierIdx(gearOf(id))].n}) is in your gear.`);}}catch(e){}});
