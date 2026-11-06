// ===== natures.js (v0.3.5): natures and the nature service =====
// Guild Hall, Nature tab: pay gold to reroll a hero's nature inside its pool, or pay more to pick one. Prices scale with level and rerolls.
// Saved per hero as c.nat (nature id) and c.nrr (rerolls bought). Heroes without c.nat keep the nature of their template. Pools of one are fixed.
const natRerollCost=c=>Math.round((80+c.lv*40)*(1+.5*(c.nrr||0)));
const natChooseCost=c=>Math.round((400+c.lv*120)*(1+.25*(c.nrr||0)));
function vNature(m){
  const ids=Object.keys(G.roster).filter(id=>natPool(id).length>1&&!G.daily);
  if(m.nat&&G.roster[m.nat]&&natPool(m.nat).length>1){
    const id=m.nat,c=G.roster[id],cur=natOf(c),P=natPool(id),rc=natRerollCost(c),pc=natChooseCost(c);
    return `<button class="btn sm" data-act="natBack">‹ All heroes</button><div class="row"><div class="pbig">${port(id)}</div><div class="grow"><b>${esc(c.name)}</b><small>Level ${c.lv}. Current nature: <b>${esc(natInfo(cur).n)}</b>, ${esc(natInfo(cur).d)}. Rerolls bought: ${c.nrr||0}.</small></div></div>
      <div class="rows">${P.map(k=>`<div class="row ${k===cur?'sel':''}"><div class="grow"><b>${esc(natInfo(k).n)}</b>${k===cur?' <em class="cyc">Current</em>':''}<small>${esc(natInfo(k).d)}</small></div><button class="btn sm" data-act="natChoose" data-arg="${k}" ${k===cur||G.gold<pc?'disabled':''}>Choose ${fmt(pc)}g</button></div>`).join('')}</div>
      <div class="btnrow"><button class="btn gold" data-act="natReroll" ${G.gold<rc?'disabled':''}>Reroll within the pool: ${fmt(rc)} gold</button></div>
      <p class="note">A reroll picks a different nature at random from this hero's pool. Each reroll makes the next one cost more. Picking one yourself costs ${fmt(pc)} gold.</p>`;}
  return `<p>Natures shape how a hero grows. Every wayfarer has a pool of three to five that suit their class, and one is rolled when they join. Pay here to reroll inside the pool, or to choose.</p><p class="note nums">You have ${fmt(G.gold)} gold.</p>
    <div class="rows compact">${ids.map(id=>{const c=G.roster[id],k=natOf(c);return `<div class="row">${port(id)}<div class="grow"><b>${esc(c.name)}</b> <small>Lv ${c.lv}</small><small>${esc(natInfo(k).n)}: ${esc(natInfo(k).d)}</small></div><button class="btn sm" data-act="natPick" data-arg="${id}">Change</button></div>`;}).join('')||'<p class="note">No one on your roster has a changeable nature yet.</p>'}</div>`;}
Object.assign(ACT,{
  natPick(id){V.modal=Object.assign({},V.modal,{type:'guild',tab:'nature',nat:id,char:null});render();},
  natBack(){V.modal=Object.assign({},V.modal,{nat:null});render();},
  natReroll(){const id=V.modal&&V.modal.nat,c=G.roster[id];if(!c)return;const cost=natRerollCost(c);if(G.gold<cost)return;
    const P=natPool(id).filter(k=>k!==natOf(c));if(!P.length)return;const k=P[Math.floor(Math.random()*P.length)];
    G.gold-=cost;c.nat=k;c.nrr=(c.nrr||0)+1;refresh(c);saveGame();try{sfx('buy');}catch(e){}toast(`${c.name} is now ${natInfo(k).n}.`);render();},
  natChoose(k){const id=V.modal&&V.modal.nat,c=G.roster[id];if(!c||!natPool(id).includes(k)||k===natOf(c))return;const cost=natChooseCost(c);if(G.gold<cost)return;
    G.gold-=cost;c.nat=k;refresh(c);saveGame();try{sfx('buy');}catch(e){}toast(`${c.name} is now ${natInfo(k).n}.`);render();}
});
