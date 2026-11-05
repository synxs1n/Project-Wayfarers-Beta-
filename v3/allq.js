// ===== Beta v0.4.3: Accept all and Claim all on every quest list (Quest Board, Guild bounties, faction missions) =====
function qVisible(){return (G.quests||[]).filter(q=>q.stage<=G.stage);}
function allBar(acc,cl,nA,nC){if(!nA&&!nC)return '';return `<div class="btnrow allq">${nA?`<button class="btn sm" data-act="${acc}">Accept all (${nA})</button>`:''}${nC?`<button class="btn sm gold" data-act="${cl}">Claim all (${nC})</button>`:''}</div>`;}
Object.assign(ACT,{
  qAcceptAll(){const L=qVisible().filter(q=>q.state==='open');L.forEach(q=>{q.state='active';});saveGame();if(L.length)toast(`Accepted ${L.length} quest${L.length>1?'s':''}.`);render();},
  qClaimAll(){const L=qVisible().filter(q=>q.state==='active'&&questReady(q));let n=0;const mt=V.modal&&V.modal.type;
    for(const q of L){ACT.qClaim(q.id);n++;if(V.modal&&V.modal.type!==mt)break;}if(n>1&&V.modal&&V.modal.type===mt)toast(`Claimed ${n} rewards.`);render();},
  bountyAll(){const L=(G.bounties||[]).filter(b=>b.stage<=G.stage&&b.state==='open');L.forEach(b=>{b.state='active';});saveGame();if(L.length)toast(`Accepted ${L.length} bount${L.length>1?'ies':'y'}. The marked beasts now roam their fields.`);render();},
  facAcceptAll(){const f=facInit();let n=0;FAC.forEach(F=>facMissionList(F.id).forEach(m=>{if(f.acc[m.id]==null&&!f.done[m.id]){f.acc[m.id]=facCount(m.k);n++;}}));saveGame();if(n)toast(`Accepted ${n} mission${n>1?'s':''}.`);render();},
  facClaimAll(){const f=facInit();let n=0;FAC.forEach(F=>facMissionList(F.id).forEach(m=>{if(f.acc[m.id]!=null&&!f.done[m.id]&&facProg(m)>=m.n){ACT.facClaim(m.id);n++;}}));if(n>1)toast(`Claimed ${n} missions.`);render();}});
{const mb0=mBoard;mBoard=function(){const h=mb0.apply(this,arguments);try{const Q=qVisible(),bar=allBar('qAcceptAll','qClaimAll',Q.filter(q=>q.state==='open').length,Q.filter(q=>q.state==='active'&&questReady(q)).length);return h.replace('<div class="rows">',bar+'<div class="rows">');}catch(e){return h;}};}
{const vf0=vFacMissions;vFacMissions=function(){const h=vf0.apply(this,arguments);try{const f=facInit();let a=0,c=0;FAC.forEach(F=>facMissionList(F.id).forEach(m=>{if(f.acc[m.id]==null)a++;else if(!f.done[m.id]&&facProg(m)>=m.n)c++;}));
  return allBar('facAcceptAll','facClaimAll',a,c)+h;}catch(e){return h;}};}
{const vF0=vFactions;vFactions=function(){const h=vF0.apply(this,arguments);try{if(!G)return h;const f=facInit();let a=0,c=0;FAC.forEach(F=>facMissionList(F.id).forEach(m=>{if(f.acc[m.id]==null)a++;else if(!f.done[m.id]&&facProg(m)>=m.n)c++;}));return allBar('facAcceptAll','facClaimAll',a,c)+h;}catch(e){return h;}};}
