// =================== ACCOUNT-BOUND PROGRESS (v4.8) ===================
// The bestiary, the hero codex and the Archivist unlock follow the claude.ai account, not the device.
//   db doc profile/<uid> = {v:1, best:{<monster name>:{seen,kills,scan,hit?,known:{el:1}}}, codex:{<hero id>:{seen,rec,lv}}, flags:{archivist}, updatedAt}
//   rules: profile read/write owner; profile/{self} read/write interact
// META (aurelis-meta-v1) stays the local cache. Merges are a union: counts take the max, known elements are OR'd, flags stay on once set.
const PROFILE={status:'idle',uid:null,busy:false,dirty:false,timer:null,lastSync:0};
// monsters renamed in later versions: their bestiary entries move to the new name
const BEST_RENAME={'Husk Guardian':'Husk Watcher'};
function renameBest(o){if(!o)return o;let r=null;Object.keys(BEST_RENAME).forEach(k=>{if(o[k]){r=r||Object.assign({},o);const n=BEST_RENAME[k],x=o[k],y=r[n]||{};r[n]={seen:Math.max(x.seen||0,y.seen||0),kills:Math.max(x.kills||0,y.kills||0),scan:Math.max(x.scan||0,y.scan||0),hit:Math.max(x.hit||0,y.hit||0),known:Object.assign({},x.known||{},y.known||{})};delete r[k];}});return r||o;}
function mergeBest(a,b){a=renameBest(a);b=renameBest(b);const out={};new Set(Object.keys(a||{}).concat(Object.keys(b||{}))).forEach(k=>{const x=(a||{})[k]||{},y=(b||{})[k]||{};
  const known=Object.assign({},x.known||{},y.known||{});out[k]={seen:Math.max(x.seen||0,y.seen||0),kills:Math.max(x.kills||0,y.kills||0),scan:Math.max(x.scan||0,y.scan||0),known};if(x.hit||y.hit)out[k].hit=1;});return out;}
function mergeCodex(a,b){const out={};new Set(Object.keys(a||{}).concat(Object.keys(b||{}))).forEach(k=>{const x=(a||{})[k]||{},y=(b||{})[k]||{};
  const sx=x.seen||0,sy=y.seen||0;out[k]={seen:sx&&sy?Math.min(sx,sy):sx||sy,rec:Math.max(x.rec||0,y.rec||0),lv:Math.max(x.lv||0,y.lv||0)};});return out;}
function profileOf(meta){return {v:1,best:meta.best||{},codex:meta.codex||{},flags:{archivist:meta.archivist?1:0,legends:Object.assign({},meta.legends||{}),fac:Object.assign({},meta.facBest||{})}};}
const stable=o=>JSON.stringify(o,Object.keys(o).sort());
function sameProfile(a,b){try{return JSON.stringify(normP(a))===JSON.stringify(normP(b));}catch(e){return false;}}
function normP(p){const s=o=>{if(!o||typeof o!=='object')return o;const r={};Object.keys(o).sort().forEach(k=>{r[k]=s(o[k]);});return r;};return s({best:p.best||{},codex:p.codex||{},flags:p.flags||{}});}
function applyRemote(r){
  META.best=mergeBest(META.best,r.best);META.codex=mergeCodex(META.codex,r.codex);
  if(r.flags&&r.flags.archivist)META.archivist=1;
  if(r.flags&&r.flags.fac){META.facBest=META.facBest||{};Object.keys(r.flags.fac).forEach(k=>{META.facBest[k]=Math.max(META.facBest[k]||0,+r.flags.fac[k]||0);});}
  if(r.flags&&r.flags.legends){META.legends=META.legends||{};Object.keys(r.flags.legends).forEach(k=>{if(r.flags.legends[k])META.legends[k]=1;});}
  saveMeta();
}
async function profileSync(){
  if(PROFILE.busy){PROFILE.dirty=true;return;}
  PROFILE.busy=true;PROFILE.dirty=false;
  try{
    const db=await capOf('db'),user=await capOf('user');let uid=null;
    if(user){try{uid=await user.id();}catch(e){}}
    if(!db||!uid){PROFILE.status='local';return;}
    PROFILE.uid=uid;const ref=db.doc('profile/'+uid);
    const snap=await ref.get(),remote=snap.exists?(snap.data()||{}):{};
    applyRemote(remote);checkArchive();
    const merged=profileOf(META);
    if(!snap.exists||!sameProfile(merged,remote)){
      try{await ref.set(Object.assign(merged,{updatedAt:Date.now()}));PROFILE.status='synced';}
      catch(e){PROFILE.status=e&&e.code==='invalid_argument'?'local':'error';}
    }else PROFILE.status='synced';
    PROFILE.lastSync=Date.now();
  }catch(e){PROFILE.status=PROFILE.status==='synced'?'synced':'error';}
  finally{PROFILE.busy=false;if(V.modal&&V.modal.type==='menu'&&(V.modal.tab==='beasts'||V.modal.tab==='codex'))render();if(PROFILE.dirty)profileDirty();}
}
function profileDirty(){clearTimeout(PROFILE.timer);PROFILE.timer=setTimeout(profileSync,3500);}
function syncNote(){
  const s=PROFILE.status;
  if(s==='synced')return '<p class="sync ok">✓ Synced to your account, so it follows you to any device.</p>';
  if(s==='local')return '<p class="sync local">Progress is saved on this device only and is not synced to your account.</p>';
  if(s==='error')return '<p class="sync local">Could not reach your account just now. Progress is kept on this device and will sync later.</p>';
  return '<p class="sync">Checking your account…</p>';
}
// ----- codex -----
function codexSee(id,o){
  const t=TPL[id];if(!t||t.mon||t.src==='tame')return;
  const cur=(META.codex=META.codex||{})[id];const nx={seen:cur&&cur.seen||Date.now(),rec:Math.max(cur&&cur.rec||0,o&&o.rec||0),lv:Math.max(cur&&cur.lv||0,o&&o.lv||0)};
  if(cur&&cur.seen===nx.seen&&cur.rec===nx.rec&&cur.lv===nx.lv)return;
  META.codex[id]=nx;saveMeta();profileDirty();
}
function codexRoster(){if(!G||G.daily)return;Object.values(G.roster||{}).forEach(c=>codexSee(c.id,{rec:1,lv:c.lv}));}
// ----- bestiary completion and the Archivist -----
const archiveTargets=()=>GPOOL.concat(FPOOL);
function archiveProgress(){const L=archiveTargets();return {n:L.filter(k=>((META.best||{})[guardianDef(k).n]||{}).seen).length,of:L.length};}
function checkArchive(){
  const p=archiveProgress();if(META.archivist||p.n<p.of)return false;
  META.archivist=1;saveMeta();profileDirty();
  if(typeof sfx==='function')sfx('archivist');
  if(V.screen==='world'&&!V.modal)V.modal={type:'story',title:'A letter in violet ink',text:'It was tucked into your pack while you slept, sealed with gold wax.\n\n"You have seen them all. Every Scourge, every Calamity. I wrote them down long before you were born, and now you have checked my work. Come and find me. Touch any waystone and ask for the Archive.\n\nV. Ashgrave, Last Archivist"',btn:'Continue'};
  else toast('The Archive has opened. Touch a waystone to visit it.');
  return true;
}
function openArchivist(){codexSee('vaelith');V.modal={type:'archivist'};render();if(typeof sfx==='function')sfx('archivist');}
function mArchivist(){
  const have=G&&G.roster&&G.roster.vaelith,moves=archiveSkills(),t=TPL.vaelith;
  return box('Vaelith Ashgrave',`<div class="mh"><div class="pbig arch"><img src="${heroURL('vaelith')}" alt=""></div><div class="grow"><b class="atitle">The Last Archivist</b><small>Chronicler · ${t.el.map(e=>EL[e]).join(' and ')}</small><div class="els">${elChips(t.el)}</div>
    <p class="story">"${have?'I am already in your roster, wayfarer. The archive travels with us now.':'Every horror that ever ate a lamp is in these books. You have met them all. I would like to meet the ending. Take me with you, and I will hand you their own worst moves.'}"</p></div></div>
    <h4>Archive moves <small>(${moves.length} of ${archiveTargets().length} learned)</small></h4><p class="note">She casts the signature move of every Scourge and Calamity your account has defeated. Defeat more to teach her more.</p>
    <div class="rows compact">${moves.map(s=>`<div class="row"><div><b>${skEls(s).map(ico).join('')}${esc(s.n)}</b><small>${esc(guardianDef(s.archive).n)} · ${s.t==='all'?'all foes':s.t==='self'?'self':'one foe'} · ${s.mp} MP</small></div></div>`).join('')||'<p class="note">None yet: defeat a Scourge or Calamity.</p>'}</div>
    <p class="note">${SIG.vaelith.n}: ${SIG.vaelith.d} She joins near your party's level, and once recruited she can be chosen as a Legacy hero. She stays unlocked on your account for every future journey.</p>`,
    have?'<button class="btn gold" data-act="closeModal">Close</button>':'<button class="btn" data-act="closeModal">Not yet</button><button class="btn gold" data-act="recruitVaelith">Recruit Vaelith</button>',true);
}
// ----- codex views -----
function codexIds(){return RAW.map(r=>r[0]).filter(id=>TPL[id]&&!TPL[id].mon&&((TPL[id].src!=='x'&&TPL[id].src!=='L')||(META.codex||{})[id]||(META.legends||{})[id]));}
function vCodex(){
  const ids=codexIds(),C=META.codex||{},seen=ids.filter(id=>C[id]).length;
  const byCls={};const cf=LC('codex'),fOn=cf.el!=='all'||cf.cl!=='all',keep=id=>C[id]?matchT('codex',TPL[id]):!fOn,rk=id=>TPL[id].n,order=a=>{const seen=a.filter(id=>C[id]),rest=a.filter(id=>!C[id]);const o={name:(x,y)=>rk(x).localeCompare(rk(y)),lv:(x,y)=>(C[y].lv||0)-(C[x].lv||0)||rk(x).localeCompare(rk(y)),el:(x,y)=>ELK.indexOf(TPL[x].el[0])-ELK.indexOf(TPL[y].el[0])||rk(x).localeCompare(rk(y))}[cf.s];return (o?seen.sort(o):seen).concat(rest);};
  order(ids.filter(keep)).forEach(id=>{const k=TPL[id].src==='L'?'_legend':TPL[id].cls;(byCls[k]=byCls[k]||[]).push(id);});
  const tile=id=>{const c=C[id];if(!c)return `<div class="btile unk"><img src="${heroURL(id)}" alt=""><b>???</b><span class="els"></span></div>`;
    return `<button class="btile ${TPL[id].src==='x'?'g':''} ${isLeg(id)?'leg':''}" data-act="codex" data-arg="${id}">${isLeg(id)?legSeal(1)+'<span class="legtag">LEGENDARY</span>':''}<img src="${heroURL(id)}" alt=""><b>${esc(TPL[id].n)}</b><span class="els">${TPL[id].el.map(ico).join('')}${c.rec?'':'<em class="nrec">Seen</em>'}</span></button>`;};
  return `${syncNote()}<p class="note">${seen} of ${ids.length} wayfarers met across all your journeys. Heroes you meet at starts, taverns and rare visits are logged even if you never hire them.</p>${filterBar('codex',true)}
    ${Object.keys(CLS).filter(k=>!CLS[k].legend).concat(['_legend']).filter(k=>byCls[k]).map(k=>`<h4>${k==='_legend'?'★ Legendary':CLS[k].n} <span class="cnt nums">${byCls[k].filter(id=>C[id]).length}/${byCls[k].length}</span></h4><div class="btiles">${byCls[k].map(tile).join('')}</div>`).join('')}`;
}
function codexStats(id){const t=TPL[id],f=CF[t.cls]||['staff','robe'],c={id,lv:20,eq:{w:'w_'+f[0]+'_3',a:'a_'+f[1]+'_3',c:null},alloc:{},vet:0};return calcStats(c);}
function mCodex(id){
  const t=TPL[id],c=(META.codex||{})[id];if(!t||!c)return '';
  const S=codexStats(id),sig=SIG[id];
  return box(esc(t.title||t.n),`${isLeg(id)?`<div class="legstrip">${legSeal()}${legBanner()}${legSeal()}</div>`:''}<div class="mh"><div class="pbig"><img src="${heroURL(id)}" alt=""></div><div class="grow"><small>${CLS[t.cls].n}${t.src==="x"?" · Special":t.src==="L"?" · Legendary":""}</small><div class="els">${elChips(t.el)}</div><span class="trait">${natPoolText(id)}</span><p class="bio">${esc(t.bio)}</p>${classCard(t.cls)}${sig?`<p class="mline"><b>${esc(sig.n)}:</b> ${esc(sig.d)}</p>`:''}
    <p class="note nums">${c.rec?`Recruited · best level ${c.lv||1}`:'Met but never recruited'}</p></div></div>
    <h4>Stats <small>(level 20, tier 4 gear, no stat points)</small></h4><div class="stats"><span>HP <b>${S.mhp}</b></span><span>MP <b>${S.mmp}</b></span><span>ATK <b>${Math.round(S.atk)}</b></span><span>DEF <b>${Math.round(S.def)}</b></span><span>MAG <b>${Math.round(S.mag)}</b></span><span>RES <b>${Math.round(S.res)}</b></span><span>SPD <b>${Math.round(S.spd)}</b></span><span>CRIT <b>${Math.round(S.crit*100)}%</b></span></div>
    ${bondCodex(id)}<h4>Limit Break</h4>${limitRows(t.cls,null)}
    <h4>Skills</h4><div class="rows compact">${classSkills(t).map(s=>`<div class="row"><div><b>${skEls(s).map(ico).join('')}${esc(s.n)}</b>${roleTag(s)}<small>${esc(s.d)}</small></div><span class="m">Lv ${s.lv}</span></div>`).join('')}${id==='vaelith'?`<div class="row"><div><b>Archive moves</b><small>${archiveSkills().length} learned from defeated Scourges and Calamities.</small></div></div>`:''}</div>`,
    '<button class="btn gold" data-act="menuTab" data-arg="codex">Back</button>',true);
}
// ----- hooks -----
{
  const hc0=heroCard;heroCard=function(id){try{codexSee(id);}catch(e){}return hc0.apply(this,arguments);};
  const r0=recruit;recruit=function(id){const ok=r0.apply(this,arguments);if(ok&&G.roster[id])codexSee(id,{rec:1,lv:G.roster[id].lv});return ok;};
  const fb0=finishBattle;finishBattle=function(){const r=fb0.apply(this,arguments);try{codexRoster();checkArchive();profileDirty();}catch(e){}return r;};
  const ng0=newGame;newGame=function(){const r=ng0.apply(this,arguments);try{codexRoster();}catch(e){}return r;};
}
Object.assign(ACT,{
  codex(id){V.modal={type:'codexEntry',id};render();},
  toArchive(){if(!META.archivist)return;V.modal=null;fadeTo(()=>{const a=getMap('a0');if(G.roster.vaelith)a.npcs=a.npcs.filter(n=>n.act!=='archivist');placeAt('a0',9,10,'u');showLocation();saveGame();});render();},
  recruitVaelith(){if(!META.archivist||!G||G.roster.vaelith)return;const c=newChar('vaelith',Math.max(5,avgLv()),gearTier());G.roster.vaelith=c;if(G.party.length<6)G.party.push('vaelith');
    codexSee('vaelith',{rec:1,lv:c.lv});const a=MAPS.a0;if(a)a.npcs=a.npcs.filter(n=>n.act!=='archivist');saveGame();sfx('level');toast('Vaelith joins your roster.'+(G.party.includes('vaelith')?' She is in your six.':' Add her to your six from the menu or a Guild Hall.'));V.modal=null;render();}
});
setTimeout(()=>{try{profileSync();}catch(e){}},1200);

{const lm0=loadMeta;loadMeta=function(){const r=lm0.apply(this,arguments);try{META.best=mergeBest(META.best||{},{});META.codex=META.codex||{};META.legends=META.legends||{};}catch(e){}return r;};}
