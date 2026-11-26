// ===== equip2.js (v0.3.3): equipment logic: the three Auto gear buttons, companion plans, undo =====
// Three auto buttons, one rule set:
//   Party    : party heroes first. May take gear and companions from heroes who are not in the party.
//   Everyone : balances the whole roster (weaker heroes get a boost) while still favouring the party.
//   One hero : best gear in the pack only, plus a companion nobody is using. Never takes from another hero.
// All of them handle companions, show a before/after summary, and Undo restores gear, pack and companions exactly.
// "Best for" lists every party member an item would help, ranked, with the stat arrows for each.
const GSLOTS=EQSL;
const scoreEq=(c,eq)=>loadoutScore(c,calcStats(Object.assign({},c,{eq})));
const slotOk=(c,sl,id)=>{const g=gearOf(id);return !!g&&g.slot===sl&&canEquip(c,id)&&(!g.only||g.only===c.id);};
// pure planner: the equipment each hero should end with, and which items come from heroes outside the plan
// 0.22.46 (gear46.js, "one engine"): Equip Best is the walk of free steps from the pack. Nobody is stripped first, a hero keeps what they wear
// unless a spare is a gain today, and the spare that ENDS best at max temper comes first (p3Ult, then the bigger gain today, then the id).
// It may still take pieces from heroes outside the party (takeIds); heroes in the plan no longer trade pieces among themselves. Before
// 0.22.46 this stripped the party and dealt every piece out again by today's stats (fair weighted the weaker heroes; it is not used now).
const gp46Cmp=(a,b)=>p3UltCmp(a,b)||(b.d-a.d)||(a.id<b.id?-1:a.id>b.id?1:0);
function planGear(heroIds,takeIds,fair,slots){const SL=slots||GSLOTS;
  const heroes=heroIds.map(id=>G.roster[id]).filter(Boolean),hs=new Set(heroes.map(c=>c.id)),pool=[];
  G.gear.forEach(id=>pool.push({id,from:null}));
  (takeIds||[]).forEach(hid=>{const c=G.roster[hid];if(!c||hs.has(hid))return;GSLOTS.forEach(sl=>{if(SL.includes(sl)&&c.eq[sl])pool.push({id:c.eq[sl],from:hid,sl});});});
  const eq={},sc={},src={};heroes.forEach(c=>{eq[c.id]=Object.assign({},c.eq);src[c.id]={};sc[c.id]=scoreEq(c,eq[c.id]);});
  for(let it=0;it<400;it++){const ids=[...new Set(pool.map(e=>e.id))].sort();let best=null;
    heroes.forEach((c,hi)=>{const real=c.eq;c.eq=eq[c.id];/* a shield is only allowed beside the weapon the plan has given so far (canEquip reads c.eq) */try{SL.forEach((sl,si)=>{const cur=eq[c.id][sl]||null;if(typeof f38Own==='function'&&f38Own(c,cur))return;let top=null;
      ids.forEach(id=>{if(id===cur||!slotOk(c,sl,id))return;const d=scoreEq(c,Object.assign({},eq[c.id],{[sl]:id}))-sc[c.id];if(d<=.01)return;
        const o={id,d,pct:sc[c.id]>0?d/sc[c.id]:0,u:p3Ult(c,sl,id)};if(!top||gp46Cmp(o,top)<0)top=o;});
      if(top&&(!best||top.pct>best.pct+1e-9||(Math.abs(top.pct-best.pct)<=1e-9&&(hi<best.hi||(hi===best.hi&&si<best.si)))))best=Object.assign({c,sl,hi,si},top);});}finally{c.eq=real;}});
    if(!best)break;
    const pick=pool.map((e,i)=>({e,i})).filter(o=>o.e.id===best.id).sort((a,b)=>(a.e.from?1:0)-(b.e.from?1:0))[0];pool.splice(pick.i,1);
    const c=best.c,old=eq[c.id][best.sl],was=src[c.id][best.sl];if(old)pool.push(was||{id:old,from:null});
    eq[c.id][best.sl]=best.id;src[c.id][best.sl]=pick.e.from?pick.e:null;
    // a weapon that leaves no hand for the shield puts the shield back (shields20.js)
    if(typeof sh20Ok==='function'&&eq[c.id].s){const real=c.eq;let ok=true;try{c.eq=eq[c.id];ok=sh20Ok(c);}catch(e){}finally{c.eq=real;}if(!ok){pool.push(src[c.id].s||{id:eq[c.id].s,from:null});eq[c.id].s=null;src[c.id].s=null;}}
    sc[c.id]=scoreEq(c,eq[c.id]);}
  const used=[];heroes.forEach(c=>SL.forEach(sl=>{const id=eq[c.id][sl];if(!id)return;const e=src[c.id][sl];used.push({hid:c.id,sl,id,from:e?e.from:null,fromSl:e?e.sl:undefined});}));
  return {heroes,eq,used,slots:SL};}
function applyGear(plan){
  const pack=G.gear.slice(),SL=plan.slots||GSLOTS;
  plan.heroes.forEach(c=>SL.forEach(sl=>{if(c.eq[sl]){pack.push(c.eq[sl]);c.eq[sl]=null;}}));
  plan.used.forEach(u=>{if(u.from){const o=G.roster[u.from];if(o&&o.eq[u.fromSl]===u.id)o.eq[u.fromSl]=null;}else{const i=pack.indexOf(u.id);if(i>=0)pack.splice(i,1);}});
  plan.heroes.forEach(c=>SL.forEach(sl=>{c.eq[sl]=plan.eq[c.id][sl]||null;}));
  G.gear=pack;
}
function snapAuto(){return {party:G.party.slice(),gear:G.gear.slice(),eq:Object.fromEntries(Object.values(G.roster).map(c=>[c.id,Object.assign({},c.eq)])),comp:(G.tamed||[]).map(o=>[o.id,o.with||null])};}
function undoAuto(s){G.gear=s.gear.slice();if(s.party)G.party=s.party.filter(id=>G.roster[id]);Object.keys(s.eq).forEach(id=>{const c=G.roster[id];if(c)c.eq=Object.assign({},s.eq[id]);});
  (s.comp||[]).forEach(([id,w])=>{const o=(G.tamed||[]).find(x=>x.id===id);if(o)o.with=w;});Object.values(G.roster).forEach(refresh);saveGame();}
// companions: score a pairing with the real stat code, with only that companion attached
function compGainFor(o,c){const w=(G.tamed||[]).map(x=>x.with);G.tamed.forEach(x=>{if(x.with===c.id)x.with=null;});
  const base=loadoutScore(c,calcStats(c));o.with=c.id;const s=loadoutScore(c,calcStats(c));G.tamed.forEach((x,i)=>{x.with=w[i];});return s-base;}
function planComp(heroIds,fair){
  const comps=G.tamed||[],heroes=heroIds.map(id=>G.roster[id]).filter(Boolean),hs=new Set(heroes.map(c=>c.id)),pairs=[];
  comps.forEach(o=>heroes.forEach(c=>pairs.push({o,c,g:compGainFor(o,c)*(fair&&G.party.includes(c.id)?1.3:1)})));
  const dO=new Set(),dC=new Set(),out=new Map();
  pairs.sort((a,b)=>b.g-a.g).forEach(p=>{if(p.g<=.01||dO.has(p.o.id)||dC.has(p.c.id))return;dO.add(p.o.id);dC.add(p.c.id);out.set(p.o.id,p.c.id);});
  return out;
}
function applyComp(map,heroIds){const hs=new Set(heroIds),old=new Map((G.tamed||[]).map(o=>[o.id,o.with||null]));
  G.tamed.forEach(o=>{if(map.has(o.id))o.with=map.get(o.id);else if(o.with&&hs.has(o.with))o.with=null;});
  // a freed companion goes back to its old hero if that hero is still outside the plan and has none
  G.tamed.forEach(o=>{const h=old.get(o.id);if(!o.with&&h&&G.roster[h]&&!hs.has(h)&&!compOf(G.roster[h]))o.with=h;});}
// one hero (the hero sheet's Auto best gear): the same walk for that hero, pack only, and a companion nobody else is using
function autoOne(c){
  applyGear(planGear([c.id],[],false));refresh(c);
  try{const cur=compOf(c);let bo=cur,bg=cur?compGainFor(cur,c):0;(G.tamed||[]).forEach(o=>{if(o.with&&o.with!==c.id)return;const g=compGainFor(o,c);if(g>bg+.01){bg=g;bo=o;}});
    if(bo&&bo!==cur){G.tamed.forEach(x=>{if(x.with===c.id)x.with=null;});bo.with=c.id;}}catch(e){}
  Object.values(G.roster).forEach(refresh);
}
function autoRun(mode,oneId){
  if(!G||G.daily)return;
  const snap=snapAuto(),party=G.party.slice(),rest=Object.keys(G.roster).filter(id=>!party.includes(id)),before={};
  Object.values(G.roster).forEach(c=>{before[c.id]={eq:Object.assign({},c.eq),comp:(compOf(c)||{}).id||null,pw:loadoutScore(c,c.S)};});
  if(mode==='one'){const c=G.roster[oneId];if(c)autoOne(c);}
  else{const ids=mode==='party'?party:party.concat(rest);applyGear(planGear(ids,mode==='party'?rest:[],mode==='all'));
    Object.values(G.roster).forEach(refresh);applyComp(planComp(ids,mode==='all'),ids);}
  Object.values(G.roster).forEach(refresh);
  const rows=[];Object.values(G.roster).forEach(c=>{const b=before[c.id],ch=[];
    GSLOTS.forEach(sl=>{if((b.eq[sl]||null)!==(c.eq[sl]||null))ch.push({sl,from:b.eq[sl]||null,to:c.eq[sl]||null});});
    const nc=(compOf(c)||{}).id||null;
    if(ch.length||nc!==b.comp)rows.push({id:c.id,name:c.name,inParty:party.includes(c.id),ch,comp:nc!==b.comp?{from:b.comp,to:nc}:null,pw0:b.pw,pw1:loadoutScore(c,c.S)});});
  saveGame();sfx('equip');V.modal={type:'autoEq',rows,snap,mode,from:V.modal};render();
}
const compName=id=>{const o=(G.tamed||[]).find(x=>x.id===id);return o?esc(o.name):'none';};
function mAutoEq(m){const rows=m.rows||[],ttl={party:'Equip Best',all:'Equip best for everyone',one:'Auto best gear'}[m.mode]||'Auto best gear';
  const a=rows.reduce((s,r)=>s+r.pw0,0),b=rows.reduce((s,r)=>s+r.pw1,0),pct=a>0?Math.round((b-a)/a*100):0;
  const body=rows.length?`<p class="note">${rows.length} hero${rows.length>1?'es':''} changed, combined gear power ${pct>=0?'+':''}${pct}%. Undo puts everything back exactly.</p><div class="rows">${rows.map(r=>{const d=r.pw0>0?Math.round((r.pw1-r.pw0)/r.pw0*100):0;
    return `<div class="row">${port(r.id,'sm')}<div class="grow"><b>${esc(r.name)}</b>${r.inParty?'':' <small>(roster)</small>'} <span class="${d>=0?'up':'dn'}">${d>=0?'▲':'▼'} ${Math.abs(d)}%</span>
      ${r.ch.map(x=>`<small>${SLOTN[x.sl]}: ${x.from?esc(gearOf(x.from).n):'nothing'} → <span class="${x.to?'up':'dn'}">${x.to?esc(gearOf(x.to).n):'nothing'}</span></small>`).join('')}
      ${r.comp?`<small>Pet: ${compName(r.comp.from)} → <span class="up">${compName(r.comp.to)}</span></small>`:''}</div></div>`;}).join('')}</div>`
    :'<p>Everyone already has the best gear and pet you own for their class.</p>';
  return box(ttl,body,`${rows.length?'<button class="btn" data-act="autoEqUndo">Undo</button>':''}<button class="btn gold" data-act="xBack">OK</button>`);}
// ----- "Best for": every party member who would gain, ranked, with arrows for each -----
function gainersFor(id,all){const k='g'+(all?'a':'p')+id;if(FITC&&FITC[k])return FITC[k];
  const L=(all?Object.keys(G.roster):G.party).map(h=>G.roster[h]).filter(Boolean),
    r=L.map(c=>({c,g:gainFor(c,id)})).filter(o=>o.g&&o.g.d>.01&&o.g.pct>=.005).sort((a,b)=>b.g.pct-a.g.pct||b.g.d-a.g.d);
  if(FITC)FITC[k]=r;return r;}
const pctTxt=o=>'+'+Math.max(1,Math.round(o.g.pct*100))+'%';
function bestTag(id){const L=gainersFor(id);
  // v0.4.0 3.5: the headline is about your active party. Heroes waiting in the roster get one smaller, quieter line.
  // v0.18.7: reserves keep no gear, so a piece is judged for the party only (the "Also helps in your roster" line is gone)
  const side='';
  if(!L.length)return `<span class="best none">Would not help anyone in your active party.</span>${side}`;
  return `<div class="bestl"><b>Helps your party:</b>${L.slice(0,6).map(o=>`<div class="bestr">${port(o.c.id,'sm')}<b>${esc(o.c.name)}</b> <em class="up">${pctTxt(o)}</em> <span>${deltaHtml(o.c,id)}</span></div>`).join('')}</div>${side}`;}
function cmpPanel(id){if(V.cmp!==id)return `<button class="btn sm cmpb" data-act="cmpT" data-arg="${id}">Compare</button>`;
  const L=G.party.map(h=>G.roster[h]).filter(c=>c&&canEquip(c,id));
  return `<button class="btn sm cmpb on" data-act="cmpT" data-arg="${id}">Hide</button><div class="cmpp">${L.map(c=>`<div class="cmpr">${port(c.id,'sm')}<b>${esc(c.name)}</b><span>${deltaHtml(c,id)}</span></div>`).join('')||'<small>Nobody in your party can use this.</small>'}</div>`;}
function mEquipNow(m){const id=m.id,g=gearOf(id);
  if(!g||!G.gear.includes(id))return box('Equip this now?','<p>That item is no longer in your pack.</p>','<button class="btn gold" data-act="eqNowNo">OK</button>');
  const P=gainersFor(id),F=P.slice(0,7);
  const rowOf=(o,i)=>`<div class="row ${i===0?'upg':''}">${port(o.c.id,'sm')}<div class="grow"><b>${esc(o.c.name)}</b>${G.party.includes(o.c.id)?'':' <small>(roster)</small>'}${i===0?' <span class="best">Best fit</span>':''}<small>Now: ${o.c.eq[g.slot]?esc(gearOf(o.c.eq[g.slot]).n):'nothing'} · ${vsMark(o.c,id)}</small><small>${deltaHtml(o.c,id)}</small></div><button class="btn sm ${i===0?'gold':''}" data-act="eqNowOn" data-arg="${o.c.id}">Equip</button></div>`;
  return box('Equip this now?',`<div class="row eqcur">${gearIcon(id)}<div class="grow"><b>${esc(g.n)}</b> ${tierChip(g)}<small>${gearDesc(id)}</small></div></div>${F.length?`<div class="rows">${F.map(rowOf).join('')}</div>`:'<p class="note">It would not help anyone right now.</p>'}`,
    '<button class="btn" data-act="eqNowNo">No, keep it in the pack</button>');}
// v0.9.9+: charms only, party only, owned charms only (nothing is bought); the Alchemy "Equip best charms" button
function autoCharms(){if(!G||G.daily)return 0;const party=G.party.slice(),before={};
  party.forEach(id=>{const c=G.roster[id];if(c)before[id]=c.eq.c||null;});
  applyGear(planGear(party,[],false,['c']));Object.values(G.roster).forEach(refresh);
  const n=party.filter(id=>G.roster[id]&&(G.roster[id].eq.c||null)!==before[id]).length;
  saveGame();if(n)sfx('equip');toast(n?`Equip best charms: ${n} hero${n>1?'es':''} changed charm.`:'Equip best charms: nobody has a better charm to wear.');render();return n;}
// the buttons: autoEqParty (the one "Equip Best", party only) and autoEqOne (per hero); autoEqAll stays callable but has no button
Object.assign(ACT,{autoEqOne(id){autoRun('one',id||V.modal.char);},autoEqParty(){autoRun('party');},autoEqAll(){autoRun('party');},autoEqCharms(){autoCharms();}});
