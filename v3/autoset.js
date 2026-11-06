// ===== autoset.js (v0.4.0): auto battle settings =====
// One screen for every auto battle choice. It opens from Menu > Settings and from inside a battle (the gear next to the auto button).
// The values live in META.cfg.auto (a new optional field; missing keys fall back to AUTO_DEF in engine.js).
function mAutoSet(m){
  const c=autoCfg(),inB=!!B;
  const opt=(k,vals,lab,help)=>`<div class="row"><div class="grow"><b>${lab}</b>${help?`<small>${help}</small>`:''}</div><div class="chips">${vals.map(v=>`<button class="chip ${c[k]===v[0]?'on':''}" data-act="autoCfg" data-arg='${JSON.stringify([k,v[0]])}'>${v[1]}</button>`).join('')}</div></div>`;
  const OO=[[true,'On'],[false,'Off']];
  const sub=(k,lab,help)=>c.swap?opt(k,OO,'&nbsp;&nbsp;↳ '+lab,help):'';
  const spd=`<div class="row"><div class="grow"><b>Battle speed</b></div><div class="chips">${[[1,'1x'],[1.5,'1.5x'],[2,'2x']].map(v=>`<button class="chip ${META.cfg.speed===v[0]?'on':''}" data-act="cfg" data-arg='${JSON.stringify(['speed',v[0]])}'>${v[1]}</button>`).join('')}</div></div>`;
  return box('Auto battle settings',`<p class="note">These apply to every auto battle, including the one running right now. ${inB?'Close this to get back to the fight.':''}</p>
    <h4>What auto does</h4><div class="rows"><div class="row"><div class="grow"><b>A less careful fighter</b><small>Auto plays some turns well and some carelessly: it may swing at the first foe in line, miss a weakness, sit on a Limit Break or let a Primed foe go. It heals allies below ${AUTO_NERF.healAt}% HP, never uses items, and deals ${Math.round(AUTO_NERF.power*100)}% damage. Wins in auto pay ${Math.round(AUTO_REW*100)}% XP and gold. Elite, miniboss and challenge fights do not allow auto at all.</small></div></div></div>
    <h4>Options</h4><div class="rows">${opt('mp',[['normal','Normal'],['save','Save MP']],'MP use','Save MP keeps a quarter of the bar back for heals and leans on free attacks.')}</div>
    <h4>Pace</h4><div class="rows">${spd}</div>`,
    `<button class="btn" data-act="autoReset">Reset to default</button><button class="btn gold" data-act="xBack">Done</button>`,true);
}
{const vm0=vModal;vModal=function(m){if(m&&m.type==='autoset')return mAutoSet(m);return vm0.apply(this,arguments);};}
Object.assign(ACT,{
  autoOpen(){V.modal={type:'autoset',from:V.modal||null};render();},
  autoCfg(a){const [k,v]=JSON.parse(a);META.cfg.auto=META.cfg.auto||{};META.cfg.auto[k]=v;if(G){G.auto=G.auto||Object.assign({},META.cfg.auto);G.auto[k]=v;saveGame();}saveMeta();render();},
  autoReset(){META.cfg.auto={};if(G)G.auto={};saveMeta();if(G)saveGame();toast('Auto battle settings reset.');render();}
});
