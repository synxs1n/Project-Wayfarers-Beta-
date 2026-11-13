// ===== roster14.js (roster pass 14): a sixteen wayfarer starter pool, permanent recruits that pile up, a starter screen that shows both =====
// The owner's notes after 0.20.5 (items 2 and 3; item 1, the learn levels to level 45, is in menus14.js):
// 3) "Starter pool should be very limited, 16 wayfarers, 2 of each element and 2 of each class, balanced mixe each time you start a new journey": a new journey
//    offers exactly 16 wayfarers, two of each of the 8 base classes (STARTERS' classes: warrior, knight, mage, healer, thief, archer, monk, bard) and two of
//    each of the 8 elements (a hero's first element), drawn from a seed out of the whole roster of non-legend wayfarers of those classes (88 of the 92:
//    never a Legendary, never the Archivist, never a permanent recruit, who is offered on top). The draw is a randomised search over the shuffled roster
//    that keeps a class and an element at two and prunes what cannot be filled, so every draw is exact (ro14Draw). The screen groups the 16 by class (two
//    cards under each class heading, the elements sorted) under a strip that shows the balance. starterDraw (starter.js, now a hook point) answers with it.
// 2) "permament recruit pool grows each time you beat the game ... both picks from my previous playthroughs should be starter options, also let's allow all
//    people to pick as many permanent recruits as they like": the pool is the account's META.legacy (what the game always called Legacy heroes: the old
//    accounts keep every pick). Beating the game opens a "choose any number" list of the journey's wayfarers (mLegacy, one tap each, Select all, Clear); the
//    ones you tick are added together (ro14Add: the pool only grows, a victory counts one NG+ cycle however many you add, and Menu > Journey keeps an Add
//    button for more after that). EVERY recruit in the pool is offered on the starter screen of every later journey in a "Your permanent recruits" section,
//    on top of the sixteen. The rule for how many you start with is the old one: three heroes in all; a permanent recruit you bring (up to two) joins at
//    level 5 with veteran stats and takes one of the three places, so at least one place is a pick from the sixteen.
//    The pool syncs with the cloud profile the way the codex does: profile/<uid>.flags.legacy (a sorted list, merged as a union) and flags.cycles (the larger),
//    through the profileOf and applyRemote hooks (account.js).
// New behaviour only; no new save fields (META.legacy and META.cycles are the old ones). Numbers: RO14. Test: tools/chrome/v185a.js.
const RO14={per:2,budget:30000,max:2,syncCycles:true};
const RO14_ORDER=['warrior','knight','mage','healer','thief','archer','monk','bard'];

// ---------- 3. the sixteen ----------
// the base classes (the ones the starters come in) and the heroes a draw may use
function ro14Classes(){const s=new Set(STARTERS.map(id=>TPL[id].cls));return RO14_ORDER.filter(c=>s.has(c)).concat([...s].filter(c=>!RO14_ORDER.includes(c)));}
function ro14Pool(){const C=ro14Classes();return Object.keys(TPL).filter(id=>{const t=TPL[id];return t&&!t.mon&&C.includes(t.cls)&&t.el&&t.el.length&&!LEGEND_IDS.includes(id);});}
// 2 per class and 2 per main element out of pool (the ids), seeded; null when there is no such draw (a pool too small)
function ro14Pick(pool,R){const C=ro14Classes(),E=Object.keys(EL),per=RO14.per,P=pool.map(id=>TPL[id]);
  for(let i=P.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[P[i],P[j]]=[P[j],P[i]];}
  const n=P.length,sc=[],se=[];// suffix counts: heroes from i on, per class and per element
  for(let i=n;i>=0;i--){const c={},e={};if(i<n){Object.assign(c,sc[i+1]);Object.assign(e,se[i+1]);c[P[i].cls]=(c[P[i].cls]||0)+1;e[P[i].el[0]]=(e[P[i].el[0]]||0)+1;}sc[i]=c;se[i]=e;}
  const cc={},ce={},out=[];let nodes=0;
  const need=(cnt,suf,keys)=>keys.every(k=>per-(cnt[k]||0)<=(suf[k]||0));
  const go=i=>{if(out.length===per*C.length)return true;if(i>=n||++nodes>RO14.budget)return false;
    if(!need(cc,sc[i],C)||!need(ce,se[i],E))return false;
    const t=P[i],e=t.el[0];
    if((cc[t.cls]||0)<per&&(ce[e]||0)<per){cc[t.cls]=(cc[t.cls]||0)+1;ce[e]=(ce[e]||0)+1;out.push(t.id);if(go(i+1))return true;out.pop();cc[t.cls]--;ce[e]--;}
    return go(i+1);};
  return go(0)?out:null;}
// the sixteen for a seed, in the order they are shown: by class, then element
function ro14Draw(seed){const R=seeded((seed>>>0)||1),E=Object.keys(EL),all=ro14Pool(),perm=new Set(META.legacy||[]);
  let out=null;for(let a=0;a<30&&!out;a++)out=ro14Pick(all.filter(id=>!perm.has(id)),R);
  for(let a=0;a<30&&!out;a++)out=ro14Pick(all,R);
  if(!out)return STARTERS.slice(0,16);
  const C=ro14Classes();return out.sort((a,b)=>C.indexOf(TPL[a].cls)-C.indexOf(TPL[b].cls)||E.indexOf(TPL[a].el[0])-E.indexOf(TPL[b].el[0])||(a<b?-1:1));}
HOOK.before('starterDraw','roster14','16 wayfarers: 2 of each class and 2 of each element, from the whole roster',function(seed){try{const o=ro14Draw(seed);if(o&&o.length)return HOOK.stop(o);}catch(e){console.error(e);}});

// ---------- 2. the permanent recruits ----------
const ro14Perm=()=>(META.legacy||[]).filter(id=>TPL[id]&&!TPL[id].mon);
// add a list of wayfarers to the account's pool (never fewer, never twice); a victory counts one cycle however many are added
function ro14Add(ids){META.legacy=Array.isArray(META.legacy)?META.legacy:[];let n=0;
  (ids||[]).forEach(id=>{if(TPL[id]&&!TPL[id].mon&&!META.legacy.includes(id)){META.legacy.push(id);n++;}});
  if(n&&G&&!G.legacyChosen){META.cycles=(META.cycles||0)+1;G.legacyChosen=ids.find(id=>META.legacy.includes(id))||true;}
  else if(n&&G&&G.legacyChosen===true)G.legacyChosen=ids[0];
  saveMeta();try{profileDirty();}catch(e){}return n;}
// the choose any number list after the last Calamity (and from Menu > Journey)
HOOK.before('mLegacy','roster14','choose any number of permanent recruits',function(){
  const m=V.modal||{},have=ro14Perm(),ids=Object.keys(G.roster).filter(id=>!have.includes(id)&&TPL[id]&&!TPL[id].mon),sel=(m.sel||[]).filter(id=>ids.includes(id));
  const cards=ids.map(id=>{const c=G.roster[id],on=sel.includes(id);return `<button class="mini ${on?'in':''}" data-act="legToggle" data-arg="${id}" aria-pressed="${on}"><img src="${heroURL(id)}" alt=""><b>${esc(c.name)}</b><small>${on?'Permanent: ':''}Lv ${c.lv} ${CLS[TPL[id].cls].n}</small><span class="els">${c.el.map(ico).join('')}</span></button>`;}).join('');
  return HOOK.stop(box('Choose permanent recruits',`<p class="story">The Meridian burns again. Choose the wayfarers who will be offered at the start of every journey from now on, as many as you like. You can add more after any later victory too.</p>
    <p class="note">Every permanent recruit is offered on the starter screen next to the sixteen. You bring up to two of them per journey: they join at level 5 with veteran stats and take places among your three.${have.length?` Already permanent: ${have.map(id=>esc(TPL[id].n)).join(', ')}.`:''}</p>
    ${ids.length?`<p class="ro14sel"><button class="btn sm" data-act="legAll">Select all</button> <button class="btn sm" data-act="legNone" ${sel.length?'':'disabled'}>Clear</button> <span class="note">${sel.length} chosen of ${ids.length}</span></p><div class="grid mini">${cards}</div>`:'<p class="note">Everyone in this journey is already one of your permanent recruits.</p>'}`,
    `<button class="btn" data-act="closeModal">Decide later</button><button class="btn gold" data-act="legConfirm" ${sel.length?'':'disabled'}>Add ${sel.length||''} to my permanent recruits</button>`,true));});
HOOK.xform('vModal','roster14','the New Game+ card names every permanent recruit just added',function(h,m){
  try{if(!m||m.type!=='ngplus'||typeof h!=='string')return h;const ids=(m.ids||[m.id]).filter(id=>TPL[id]),nm=ids.map(id=>esc(TPL[id].n));if(!nm.length)return h;
    const who=nm.length>1?nm.slice(0,-1).join(', ')+' and '+nm[nm.length-1]:nm[0];
    return h.replace(/<p class="story">Aurelis is bright again\.[^<]*<\/p>/,`<p class="story">Aurelis is bright again. ${who} ${nm.length>1?'are':'is'} now ${nm.length>1?'permanent recruits':'a permanent recruit'}, offered at the start of every journey from now on.</p>`);}catch(e){return h;}});
Object.assign(ACT,{
  legToggle(id){const m=V.modal;if(!m||m.type!=='legacy'||!G||!G.roster[id])return;const s=m.sel=m.sel||[],i=s.indexOf(id);if(i>=0)s.splice(i,1);else s.push(id);render();},
  legAll(){const m=V.modal;if(!m||m.type!=='legacy')return;m.sel=Object.keys(G.roster).filter(id=>!ro14Perm().includes(id)&&TPL[id]&&!TPL[id].mon);render();},
  legNone(){const m=V.modal;if(m&&m.type==='legacy'){m.sel=[];render();}},
  legConfirm(){const m=V.modal;if(!m||m.type!=='legacy'||!G)return;const ids=(m.sel||[]).filter(id=>G.roster[id]);if(!ids.length)return;
    if(!ro14Add(ids))return;V.modal={type:'ngplus',id:ids[0],ids};saveGame();render();}
});
// Menu > Journey: after a victory the button stays, so more can be added later
HOOK.xform('vJourney','roster14','permanent recruits can be added after the first choice',function(h){
  try{if(typeof h!=='string'||!G||!G.won)return h;
    if(G.legacyChosen)return h.replace('<button class="btn" data-act="startNG">','<button class="btn gold" data-act="pickLegacy">Add permanent recruits</button><button class="btn" data-act="startNG">');
    return h.replace('>Choose a Legacy</button>','>Choose permanent recruits</button>');}catch(e){return h;}});
// the cloud profile carries the pool: a sorted list (so two devices write the same document) merged as a union, and the cycle count (the larger)
HOOK.xform('profileOf','roster14','the permanent recruits and the cycle count go to the profile',function(p,meta){
  try{p.flags.legacy=(meta.legacy||[]).filter(id=>typeof id==='string').slice().sort();if(RO14.syncCycles)p.flags.cycles=meta.cycles||0;}catch(e){}return p;});
HOOK.after('applyRemote','roster14','permanent recruits from the profile (a union), cycles take the larger',function(r,rm){
  try{const f=rm&&rm.flags;if(!f)return;let ch=false;
    if(Array.isArray(f.legacy)){META.legacy=Array.isArray(META.legacy)?META.legacy:[];f.legacy.forEach(id=>{if(typeof id==='string'&&TPL[id]&&!TPL[id].mon&&!META.legacy.includes(id)){META.legacy.push(id);ch=true;}});}
    if(RO14.syncCycles&&(+f.cycles||0)>(META.cycles||0)){META.cycles=+f.cycles;ch=true;}
    if(ch)saveMeta();}catch(e){}});

// ---------- the starter screen ----------
const ro14Word=n=>n===3?'three':n===2?'two':'one';
function ro14Strip(opts){const C=ro14Classes(),E=Object.keys(EL),cn={},en={};opts.forEach(id=>{cn[TPL[id].cls]=(cn[TPL[id].cls]||0)+1;en[TPL[id].el[0]]=(en[TPL[id].el[0]]||0)+1;});
  return `<div class="ro14bal" aria-label="The mix: two of each class and two of each element"><div class="ro14row">${C.map(c=>`<span class="ro14chip">${esc(CLS[c].n)} <b>${cn[c]||0}</b></span>`).join('')}</div>
    <div class="ro14row">${E.map(e=>`<span class="el" style="--c:${ELC[e]}">${ico(e)}${EL[e]} <b>${en[e]||0}</b></span>`).join('')}</div></div>`;}
function ro14Starter(){
  const slots=starterSlots(),n=V.pick.length,cyc=V.ngCycle||0,perm=ro14Perm(),L=(V.legacyPick||[]).filter(id=>perm.includes(id)).slice(0,RO14.max);
  let opts=(V.starterOpts&&V.starterOpts.length)?V.starterOpts:ro14Draw(V.starterSeed||1);
  const C=ro14Classes();
  const grid=opts.map((id,i)=>{const t=TPL[id],head=(i===0||TPL[opts[i-1]].cls!==t.cls)?`<h4 class="ro14cls">${esc(CLS[t.cls].n)} <small>${opts.filter(x=>TPL[x].cls===t.cls).map(x=>esc(TPL[x].n)).join(' and ')}</small></h4>`:'';
    return head+`<div class="cardwrap">${heroCard(id,V.pick.includes(id),'pickS')}<button class="btn sm sheetb" data-act="sheetS" data-arg="${id}" aria-label="Open ${esc(t.n)}'s full sheet">Full sheet</button></div>`;}).join('');
  const permHtml=perm.length?`<div class="panel ro14perm"><h3>Your permanent recruits <small>${perm.length} on your account</small></h3>
    <p class="note">Every wayfarer you added after beating the game is offered here, on every new journey, on top of the sixteen below. Bring up to ${RO14.max}: they join at level 5 with veteran stats and take places among your three. <b>${L.length} of ${Math.min(RO14.max,perm.length)} chosen.</b></p>
    <div class="grid mini">${perm.map(id=>`<button class="mini ${L.includes(id)?'in':''}" data-act="pickLeg" data-arg="${id}" aria-pressed="${L.includes(id)}"><img src="${heroURL(id)}" alt=""><b>${esc(TPL[id].n)}</b><small>${esc(CLS[TPL[id].cls].n)}</small><span class="els">${TPL[id].el.map(ico).join('')}</span></button>`).join('')}</div></div>`:'';
  return `<section class="stack"><div class="panel"><h2>Choose your first ${ro14Word(slots)} <small>(or fewer)</small></h2><p>${slots<3?`Your permanent recruits fill ${3-slots} of the 3 places, so you pick ${slots} more from the sixteen. A journey never begins with more than three.`:`Sixteen wayfarers answer the lamp-keepers' call, a new mix every journey: two of each class and two of each element.`} Each holds one element and its Mastery (the first one counts for the mix). Rarer heroes will cross your path later.</p>
    ${cyc?`<p class="note">New Game+ cycle ${cyc}: foes are ${cyc*12}% tougher and rewards ${cyc*10}% richer.</p>`:''}</div>
    ${permHtml}
    <div class="panel ro14base"><h3>The starter pool <small>16 wayfarers, drawn fresh for this journey</small></h3>${ro14Strip(opts)}</div>
    <div class="grid cards">${grid}</div>
    <div class="btnrow"><button class="btn" data-act="toTitle">Back</button><button class="btn gold" data-act="begin" ${n>=1&&n<=slots?'':'disabled'}>Begin with ${n+3-slots}/3</button></div></section>`;}
// (twists.js puts its modifier picker before the first <div class="grid cards">, so the marker above is kept as it was)
HOOK.xform('vStarter','roster14','permanent recruits, then the sixteen grouped by class',function(h){try{return ro14Starter();}catch(e){console.error(e);return h;}});
try{const st=document.createElement('style');st.textContent=`.ro14bal{display:flex;flex-direction:column;gap:6px;margin:.4em 0 0}.ro14row{display:flex;flex-wrap:wrap;gap:6px}
.ro14chip{display:inline-flex;align-items:center;gap:.35em;padding:.2em .6em;border:1px solid rgba(255,208,74,.35);border-radius:999px;font-size:.78rem}
.ro14chip b,.ro14bal .el b{margin-left:.15em;color:#ffd04a}.ro14cls{grid-column:1/-1;margin:.7em 0 0;padding-bottom:.25em;border-bottom:1px solid rgba(255,208,74,.3)}
.ro14cls small{font-weight:400;font-size:.7em;text-transform:none;letter-spacing:0;opacity:.7;margin-left:.6em}.ro14sel{display:flex;flex-wrap:wrap;gap:8px;align-items:center}`;document.head.appendChild(st);}catch(e){}
try{window.__RO14={RO14,pool:ro14Pool,pick:ro14Pick,draw:ro14Draw,add:ro14Add,perm:ro14Perm,classes:ro14Classes,get META(){return META;},get G(){return G;},get V(){return V;}};}catch(e){}
