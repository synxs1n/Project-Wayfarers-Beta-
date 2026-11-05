// =================== EQUIPMENT LOGIC (Beta v0.3.3) ===================
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
function planGear(heroIds,takeIds,fair){
  const heroes=heroIds.map(id=>G.roster[id]).filter(Boolean),hs=new Set(heroes.map(c=>c.id)),pool=[];
  G.gear.forEach(id=>pool.push({id,from:null}));
  heroes.forEach(c=>GSLOTS.forEach(sl=>{if(c.eq[sl])pool.push({id:c.eq[sl],from:c.id,sl});}));
  (takeIds||[]).forEach(hid=>{const c=G.roster[hid];if(!c||hs.has(hid))return;GSLOTS.forEach(sl=>{if(c.eq[sl])pool.push({id:c.eq[sl],from:hid,sl});});});
  const eq={},cur={},memo={},used=[];heroes.forEach(c=>{eq[c.id]={};cur[c.id]=scoreEq(c,{});});
  const val=(c,sl,id)=>{const k=c.id+'|'+sl+'|'+id+'|'+GSLOTS.map(s=>eq[c.id][s]||'').join(',');return memo[k]!=null?memo[k]:(memo[k]=scoreEq(c,Object.assign({},eq[c.id],{[sl]:id}))-cur[c.id]);};
  for(let it=0;it<500;it++){
    const ids=[...new Set(pool.map(e=>e.id))],mean=heroes.reduce((a,c)=>a+cur[c.id],0)/Math.max(1,heroes.length)||1;let best=null;
    heroes.forEach(c=>{const w=fair?(G.party.includes(c.id)?1.35:1)/(.35+cur[c.id]/mean):1;
      GSLOTS.forEach(sl=>{if(eq[c.id][sl])return;ids.forEach(id=>{if(!slotOk(c,sl,id))return;const v=val(c,sl,id);if(v<=.01)return;const s=v*w;if(!best||s>best.s)best={c,sl,id,s};});});});
    if(!best)break;
    const rk=e=>!e.from||hs.has(e.from)?0:1,pick=pool.map((e,i)=>({e,i})).filter(o=>o.e.id===best.id).sort((a,b)=>rk(a.e)-rk(b.e))[0];
    pool.splice(pick.i,1);used.push({hid:best.c.id,sl:best.sl,id:best.id,from:rk(pick.e)?pick.e.from:null,fromSl:pick.e.sl});
    eq[best.c.id][best.sl]=best.id;cur[best.c.id]=scoreEq(best.c,eq[best.c.id]);
  }
  return {heroes,eq,used};
}
function applyGear(plan){
  const pack=G.gear.slice();
  plan.heroes.forEach(c=>GSLOTS.forEach(sl=>{if(c.eq[sl]){pack.push(c.eq[sl]);c.eq[sl]=null;}}));
  plan.used.forEach(u=>{if(u.from){const o=G.roster[u.from];if(o&&o.eq[u.fromSl]===u.id)o.eq[u.fromSl]=null;}else{const i=pack.indexOf(u.id);if(i>=0)pack.splice(i,1);}});
  plan.heroes.forEach(c=>GSLOTS.forEach(sl=>{c.eq[sl]=plan.eq[c.id][sl]||null;}));
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
// one hero: pack only, and a companion nobody else is using
function autoOne(c){
  GSLOTS.forEach(sl=>{let best=null,bs=scoreEq(c,c.eq);
    [...new Set(G.gear.filter(id=>slotOk(c,sl,id)))].forEach(id=>{const v=scoreEq(c,Object.assign({},c.eq,{[sl]:id}));if(v>bs*1.005+.01){bs=v;best=id;}});
    if(best)equipGear(c,best);});
  const cur=compOf(c);let bo=cur,bg=cur?compGainFor(cur,c):0;
  G.tamed.forEach(o=>{if(o.with&&o.with!==c.id)return;const g=compGainFor(o,c);if(g>bg+.01){bg=g;bo=o;}});
  if(bo&&bo!==cur){G.tamed.forEach(x=>{if(x.with===c.id)x.with=null;});bo.with=c.id;}
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
function mAutoEq(m){const rows=m.rows||[],ttl={party:'Auto best gear: party',all:'Equip best for everyone',one:'Auto best gear'}[m.mode]||'Auto best gear';
  const a=rows.reduce((s,r)=>s+r.pw0,0),b=rows.reduce((s,r)=>s+r.pw1,0),pct=a>0?Math.round((b-a)/a*100):0;
  const body=rows.length?`<p class="note">${rows.length} hero${rows.length>1?'es':''} changed, combined gear power ${pct>=0?'+':''}${pct}%. Undo puts everything back exactly.</p><div class="rows">${rows.map(r=>{const d=r.pw0>0?Math.round((r.pw1-r.pw0)/r.pw0*100):0;
    return `<div class="row">${port(r.id,'sm')}<div class="grow"><b>${esc(r.name)}</b>${r.inParty?'':' <small>(roster)</small>'} <span class="${d>=0?'up':'dn'}">${d>=0?'▲':'▼'} ${Math.abs(d)}%</span>
      ${r.ch.map(x=>`<small>${SLOTN[x.sl]}: ${x.from?esc(gearOf(x.from).n):'nothing'} → <span class="${x.to?'up':'dn'}">${x.to?esc(gearOf(x.to).n):'nothing'}</span></small>`).join('')}
      ${r.comp?`<small>Companion: ${compName(r.comp.from)} → <span class="up">${compName(r.comp.to)}</span></small>`:''}</div></div>`;}).join('')}</div>`
    :'<p>Everyone already has the best gear and companion you own for their class.</p>';
  return box(ttl,body,`${rows.length?'<button class="btn" data-act="autoEqUndo">Undo</button>':''}<button class="btn gold" data-act="xBack">OK</button>`);}
// ----- "Best for": every party member who would gain, ranked, with arrows for each -----
function gainersFor(id,all){const k='g'+(all?'a':'p')+id;if(FITC&&FITC[k])return FITC[k];
  const L=(all?Object.keys(G.roster):G.party).map(h=>G.roster[h]).filter(Boolean),
    r=L.map(c=>({c,g:gainFor(c,id)})).filter(o=>o.g&&o.g.d>.01&&o.g.pct>=.005).sort((a,b)=>b.g.pct-a.g.pct||b.g.d-a.g.d);
  if(FITC)FITC[k]=r;return r;}
const pctTxt=o=>'+'+Math.max(1,Math.round(o.g.pct*100))+'%';
function bestTag(id){const L=gainersFor(id);
  // v0.4.0 3.5: the headline is about your active party. Heroes waiting in the roster get one smaller, quieter line.
  const R=gainersFor(id,true).filter(o=>!G.party.includes(o.c.id)).slice(0,4);
  const side=R.length?`<small class="bestside">Also helps in your roster: ${R.map(o=>`${esc(o.c.name)} <em class="up">${pctTxt(o)}</em>`).join(', ')}.</small>`:'';
  if(!L.length)return `<span class="best none">Would not help anyone in your active party.</span>${side}`;
  return `<div class="bestl"><b>Helps your party:</b>${L.slice(0,6).map(o=>`<div class="bestr">${port(o.c.id,'sm')}<b>${esc(o.c.name)}</b> <em class="up">${pctTxt(o)}</em> <span>${deltaHtml(o.c,id)}</span></div>`).join('')}</div>${side}`;}
function cmpPanel(id){if(V.cmp!==id)return `<button class="btn sm cmpb" data-act="cmpT" data-arg="${id}">Compare</button>`;
  const L=G.party.map(h=>G.roster[h]).filter(c=>c&&canEquip(c,id));
  return `<button class="btn sm cmpb on" data-act="cmpT" data-arg="${id}">Hide</button><div class="cmpp">${L.map(c=>`<div class="cmpr">${port(c.id,'sm')}<b>${esc(c.name)}</b><span>${deltaHtml(c,id)}</span></div>`).join('')||'<small>Nobody in your party can use this.</small>'}</div>`;}
function mEquipNow(m){const id=m.id,g=gearOf(id);
  if(!g||!G.gear.includes(id))return box('Equip this now?','<p>That item is no longer in your pack.</p>','<button class="btn gold" data-act="eqNowNo">OK</button>');
  const P=gainersFor(id),R=gainersFor(id,true).filter(o=>!G.party.includes(o.c.id)),F=P.concat(R).slice(0,7);
  const rowOf=(o,i)=>`<div class="row ${i===0?'upg':''}">${port(o.c.id,'sm')}<div class="grow"><b>${esc(o.c.name)}</b>${G.party.includes(o.c.id)?'':' <small>(roster)</small>'}${i===0?' <span class="best">Best fit</span>':''}<small>Now: ${o.c.eq[g.slot]?esc(gearOf(o.c.eq[g.slot]).n):'nothing'} · ${vsMark(o.c,id)}</small><small>${deltaHtml(o.c,id)}</small></div><button class="btn sm ${i===0?'gold':''}" data-act="eqNowOn" data-arg="${o.c.id}">Equip</button></div>`;
  return box('Equip this now?',`<div class="row eqcur">${gearIcon(id)}<div class="grow"><b>${esc(g.n)}</b> ${tierChip(g)}<small>${gearDesc(id)}</small></div></div>${F.length?`<div class="rows">${F.map(rowOf).join('')}</div>`:'<p class="note">It would not help anyone right now.</p>'}`,
    '<button class="btn" data-act="eqNowNo">No, keep it in the pack</button>');}
Object.assign(ACT,{autoEqOne(id){autoRun('one',id||V.modal.char);},autoEqParty(){autoRun('party');},autoEqAll(){autoRun('all');}});
