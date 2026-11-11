// ===== records12.js (v0.18.7): Records > Completion, one account play time, one Notice Board list, the Breach description =====
// 1. Records > Completion (was Realms): above the realm list an Echo Rift section (only once the Rift is open) with the Echoes beaten and
//    the Riftkeeper as "Secret boss: ???" until beaten; per realm EVERY tracker the realm has (field chests, Den, Lair, Sanctum, beacon,
//    Echo, quests, bounties, taming), a Den or Sanctum the realm was not given says so. Cause of the missing Den: worldPlan() gives a Den
//    to only 3 to 5 of a journey's 5 realms, and REALM_DONE listed a Den only for those, so the other realms showed no Den row at all
//    (once in about 1500 maps the planned Den is not placed and the old row could never be finished). The Den and Sanctum rows now read
//    the map (getMap, cached) when it has been visited and say "None in this realm" otherwise.
// 2. Account play time: the account total now adds the journeys' own play time (a ledger META.stats.credit by journey) instead of counting
//    its own ticks, so a journey played before v0.10.1, on another device or while a save was only copied in is counted, and a Daily Trial
//    still counts by its own ticks. Both times are shown in Account totals.
// 3. One Notice Board list: "Notices" tab (board and Menu > Quests) with quests, bounties and guild missions, one Accept all and one
//    Claim all that hands in everything that may be handed in at this place and names what waits elsewhere.
// 4. The Meridian Breach has a one time description (the area banner and the Den, Lair and Sanctum tags moved to titles12.js).
// New optional fields: META.stats.credit {journey: ms}, META.stats.pl12 (seeded flag), G.breachLook (the description was shown).
const R12_BREACH_TEXT='Every realm bleeds through into this field, and the ground never settles. The fiercest foes of all the realms gather here, and the strongest wayfarers come to test themselves against them. Nothing in the Breach is kind, and nothing in it is wasted.';

// ---------- 2. account play time ----------
function r12Jid(st,run){return (st&&+st.start||0)+':'+((run&&+run.seed)||0);}
function r12Seed(){const S=ms();if(S.pl12)return;S.credit=(S.credit&&typeof S.credit==='object')?S.credit:{};
  const add=(st,run)=>{if(!st)return;const id=r12Jid(st,run);S.credit[id]=Math.max(S.credit[id]||0,+st.play||0);};
  try{for(let s=0;s<3;s++){const o=loadRaw(s);if(o)add(o.stats,o.run);}}catch(e){}
  try{if(G&&G.stats&&!G.daily)add(G.stats,G.run);}catch(e){}
  const sum=Object.keys(S.credit).reduce((a,k)=>a+S.credit[k],0);
  if(S.play<sum)S.play=sum;   // the old total only counted from v0.10.1: never less than the journeys on this device add up to
  S.pl12=1;msSave();}
let R12_SCAN=0;
function r12Sync(all){try{const S=ms();r12Seed();if(!S.credit||typeof S.credit!=='object')S.credit={};let add=0;
  const one=(st,run)=>{if(!st)return;const id=r12Jid(st,run),p=+st.play||0,c=S.credit[id]||0;if(p>c){add+=p-c;S.credit[id]=p;}};
  if(G&&G.stats&&!G.daily)one(G.stats,G.run);
  if(all&&Date.now()-R12_SCAN>30000){R12_SCAN=Date.now();for(let s=0;s<3;s++){const o=loadRaw(s);if(o)one(o.stats,o.run);}}
  if(add){if(!S.first)S.first=Date.now();S.play+=add;}
  if(add&&Date.now()-MS_SAVED>=60000)msSave();}catch(e){}}
let R12_N=0;
HOOK.wrap('msTick','records12','a journey adds its own play time to the account (the ledger), a Daily Trial counts its ticks',function(next,...a){
  try{if(G&&G.stats&&!G.daily){r12Sync(++R12_N%20===0);return;}}catch(e){}return next(...a);});
HOOK.xform('metaBlock','records12','both play times in the account block',function(h){try{r12Sync(true);const S=ms(),inJ=G&&G.stats&&!G.daily,row=(b,s)=>`<div class="row"><div class="grow"><b>${b}</b></div><span class="m nums">${s}</span></div>`;
  const rows=(inJ?row('Play time, this journey',G.stats.play?durText(G.stats.play):'Counting from now'):'')+row('Play time, account',S.play?durText(S.play):'Counting from now')+`<p class="note r12pt">The account total adds every journey you have played and the Daily Trials.</p>`;
  return h.replace(/<div class="row"><div class="grow"><b>Play time<\/b><\/div><span class="m nums">[^<]*<\/span><\/div>/,rows);}catch(e){return h;}});
try{setTimeout(()=>r12Sync(true),3000);}catch(e){}
try{const keep=()=>{try{r12Sync(false);msSave();}catch(e){}};addEventListener('pagehide',keep);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')keep();});}catch(e){}

// ---------- 1. Records > Completion ----------
// does realm s have this site? 'k' Den, 'o' Sanctum. A visited field answers from its map; otherwise from the plan
function r12HasSite(pfx,s){try{const mid='f'+s,m=MAPS[mid]||(G.been&&G.been[mid]?getMap(mid):null);
    if(m&&Array.isArray(m.caves))return m.caves.some(c=>c.id===pfx+s);}catch(e){}
  try{return pfx==='k'?!!caveStage(s):!!fortWanted(s);}catch(e){return false;}}
HOOK.xform('REALM_DONE','records12','Den and Sanctum rows follow the map, a Den the map has but the plan lacks is listed',function(L,s){
  try{if(!G||G.daily)return L;const out=L.filter(x=>!(x.k==='den'&&!r12HasSite('k',s))&&!(x.k==='sanctum'&&!r12HasSite('o',s)));
    const at=k=>{const i=out.findIndex(x=>x.k===k);return i<0?out.length-1:i;};
    if(!out.some(x=>x.k==='den')&&r12HasSite('k',s))out.splice(at('sanctum'),0,{k:'den',n:CAVE_NAMES[s],done:denDone(s)});
    if(!out.some(x=>x.k==='sanctum')&&r12HasSite('o',s))out.splice(at('boss'),0,{k:'sanctum',n:(typeof FORT_NAMES!=='undefined'&&FORT_NAMES[s])||'Sanctum',done:fortDoneS(s)});
    return out;}catch(e){return L;}});
let R12_CH={key:'',m:{}};
// chests of one map: {d: opened, n: total}, only for a map the journey has been to (nothing is generated for a place not yet seen)
function r12Chests(mid){try{if(!(G.been||{})[mid]&&!MAPS[mid])return null;const key=G.run.seed+':'+(G.dunRev|0);if(R12_CH.key!==key)R12_CH={key,m:{}};
  const m=MAPS[mid]||getMap(mid);if(!m||!m.chests)return null;const n=m.chests.length,d=m.chests.filter(([x,y])=>(G.chests||{})[mid+':'+x+','+y]).length;return {d,n};}catch(e){return null;}}
function r12Trackers(s,tm){const Z=ZS(s),R=REALM_DONE(s),T=[];
  const mk=k=>R.filter(x=>x.k===k),cnt=a=>({d:a.filter(x=>x.done).length,n:a.length});
  const add=(id,label,d,n,note)=>T.push({id,label,d,n,note:note||''});
  const f=r12Chests('f'+s);if(f)add('field','Field chests',f.d,f.n,Z.n);else add('field','Field chests',0,1,'Not explored yet');
  const hasDen=r12HasSite('k',s);
  if(hasDen)add('den','Den',denDone(s)?1:0,1,CAVE_NAMES[s]);else add('den','Den',0,0,'None in this realm');
  const l=r12Chests('d'+s),vault=(G.vaults||{})[s]?1:0;
  if(l)add('lair','Lair',l.d+vault,l.n+1,`${Z.dungeon}: chests and the vault`);else add('lair','Lair',0,1,'Not explored yet');
  const hasS=r12HasSite('o',s);
  if(hasS)add('sanctum','Sanctum',fortDoneS(s)?1:0,1,(typeof FORT_NAMES!=='undefined'&&FORT_NAMES[s])||'Sanctum');else add('sanctum','Sanctum',0,0,'None in this realm');
  add('beacon',s<4?'Scourge beacon':'Calamity beacon',lairDone(s)?1:0,1,'');
  if(typeof sanctumOpen==='function'&&sanctumOpen()){try{const k=bossKeyFor(s),d=guardianDef(k);add('echo','Echo',(G.riftWon||{})[k]?1:0,1,d?(typeof echoName==='function'?echoName(d):'Echo '+String(d.n||d.name||'').replace(/^the /i,'')):'');}catch(e){}}
  const q=cnt(mk('quest'));if(q.n)add('quests','Quests',q.d,q.n,'');else add('quests','Quests',0,0,'None posted yet');
  const b=cnt(mk('bounty'));if(b.n)add('bounties','Bounties',b.d,b.n,'');else add('bounties','Bounties',0,0,'None posted yet');
  const t=tm[realmOf(s)]||{d:0,n:0};if(t.n)add('taming','Taming',t.d,t.n,'Creatures of this realm');else add('taming','Taming',0,0,'Nothing to tame here');
  return T;}
function r12TameByZone(){const out={};try{const L=tameList(),S=tamedSet();L.forEach(x=>{const z=x.o&&x.o.zone;if(z==null||z<0)return;const o=out[z]||(out[z]={d:0,n:0});o.n++;if(S.has(x.n))o.d++;});}catch(e){}return out;}
function r12Row(x){const none=!x.n,ok=!none&&x.d>=x.n,val=none?'None':ok?`✓ ${x.d} / ${x.n}`:`${x.d} / ${x.n}`;
  return `<div class="row r12t ${ok?'up':''} ${none?'none':''}"><div class="grow"><b>${esc(x.label)}</b>${x.note?`<small>${esc(x.note)}</small>`:''}</div><span class="m nums">${val}</span></div>`;}
function r12RiftBlock(){try{if(!G||G.daily||typeof sanctumOpen!=='function'||!sanctumOpen())return '';
  const K=echoKeys(),n=K.filter(k=>(G.riftWon||{})[k]).length,rk=!!META.riftkeeper;
  return `<h4>Echo Rift</h4><div class="rows compact r12rift"><div class="row ${n>=K.length?'up':''}"><div class="grow"><b>Echoes defeated</b><small>Every Scourge and Calamity answers again in the Rift.</small></div><span class="m nums">${n>=K.length?'✓ ':''}${n} / ${K.length}</span></div>
    <div class="row ${rk?'up':''}"><div class="grow"><b>${rk?'The Riftkeeper':'Secret boss'}</b></div><span class="m nums">${rk?'✓ Beaten':'???'}</span></div></div>`;}catch(e){return '';}}
function vCompletion(){try{if(!G)return '';if(G.daily)return '<p class="note">Completion is tracked on a journey, not in the Daily Trial.</p>';
  const tm=r12TameByZone(),cards=[];
  for(let s=0;s<=Math.min(4,G.stage);s++){const T=r12Trackers(s,tm),C=T.filter(x=>x.n>0),done=C.filter(x=>x.d>=x.n).length,all=C.length&&done===C.length,pct=C.length?Math.round(done*100/C.length):0;
    cards.push(`<div class="r12realm"><div class="row r12head ${all?'up':''}"><div class="grow"><b>Realm ${s+1}: ${esc(ZS(s).n)}</b><small>${done} of ${C.length} trackers complete</small></div><span class="m nums">${all?'100% ✓':pct+'%'}</span></div><div class="rows compact r12trk">${T.map(r12Row).join('')}</div></div>`);}
  return `${r12RiftBlock()}<h4>Realms</h4>${cards.join('')}`;}catch(e){return '<p class="note">Completion could not be read.</p>';}}
HOOK.before('nbMenuBody','records12','Records > Completion',function(m){if(m&&m.tab==='realms'&&G)return HOOK.stop(`<p class="note">Everything each realm holds, and how much of it you have done. A tracker is complete when every part of it is.</p>${vCompletion()}`);});
try{MENU_SUB.realms='Completion';}catch(e){}

// ---------- 3. one Notice Board list ----------
try{NB_MENU.nball='all';MENU_SUB.nball='Notices';const QG=MENU_GROUPS.find(g=>g[0]==='quests');if(QG&&!QG[2].includes('nball'))QG[2].unshift('nball');M3_HOME.board='all';}catch(e){}
function r12Items(){const out=[];
  try{m3Quests().forEach(q=>out.push({k:'q',st:nbQState(q),o:q}));}catch(e){}
  try{nbBountyList().forEach(b=>out.push({k:'b',st:nbBState(b),o:b}));}catch(e){}
  try{if(typeof facMisAll==='function'){if(typeof facSync==='function')facSync(true);facMisAll().forEach(m=>out.push({k:'m',st:facMisState(m),o:m}));}}catch(e){}
  return out;}
function r12BountyRow(b){const st=nbBState(b),mo=MON[b.mon],md=ELITE_MODS.find(x=>x.k===b.mod)||{n:'Elite',d:''},here=typeof atBoardOf==='function'&&atBoardOf(b.stage);
  if(st==='ready')return `<div class="row"><img class="mimg" src="${monURL(mo.art)}" alt=""><div class="grow"><b>${esc(b.name)}</b> <em class="qtag">Beaten</em><small>${fmt(econG(b.reward.gold))} gold, ${gearOf(b.reward.charm).n}, ${b.reward.mat} x ${MATS[ZS(b.stage).mat]}.</small>${here?'':`<small class="handwhere">Claim it at the ${esc(ZS(b.stage).town)} Notice Board.</small>`}</div><button class="btn sm gold" data-act="bountyClaim" data-arg="${b.id}" ${here?'':'disabled'}>Claim</button></div>`;
  return `<div class="row"><img class="mimg" src="${monURL(mo.art)}" alt=""><div class="grow"><b>${esc(b.name)}</b><small>${md.n}: ${md.d} Level ${b.lv}. Roams ${esc(ZS(b.stage).n)}.</small><small>${fmt(b.reward.gold)} gold, ${gearOf(b.reward.charm).n}</small></div>${st==='open'?`<button class="btn sm gold" data-act="bounty" data-arg="${b.id}">Accept</button>`:st==='active'?'<span class="m">Hunting</span>':'<span class="m up">Done</span>'}</div>`;}
function r12Row2(it){const kind=it.k==='b'?'Bounty':it.k==='m'?'Guild mission':(it.o.type==='guild'||it.o.type==='arena')?'Guild notice':'Quest';
  const h=it.k==='q'?nbQuestRow(it.o):it.k==='b'?r12BountyRow(it.o):facMisRow(it.o);
  return h.replace('<div class="grow">',`<div class="grow"><span class="r12kind">${kind}</span>`);}
// what may be handed in right here, and what has to wait for another place
function r12Ready(){const out=[];
  r12Items().forEach(it=>{if(it.st!=='ready')return;
    if(it.k==='q')out.push({t:'q',id:it.o.id,here:typeof canHandIn!=='function'||canHandIn(it.o),where:typeof handWhere==='function'?handWhere(it.o):''});
    else if(it.k==='b')out.push({t:'b',id:it.o.id,here:typeof atBoardOf==='function'&&atBoardOf(it.o.stage),where:`Claim it at the ${ZS(it.o.stage).town} Notice Board.`});
    else out.push({t:'m',id:it.o.id,here:typeof facCanHand!=='function'||facCanHand(it.o.id),where:'Hand in at any Guild Hall.'});});
  return out;}
function r12AllBody(sec,menu){sec=sec||'all';const I=r12Items(),R=r12Ready(),here=R.filter(x=>x.here).length,away=R.filter(x=>!x.here),nOpen=I.filter(x=>x.st==='open').length;
  const L=I.filter(x=>sec==='all'||x.st===sec).sort((a,b)=>NB_ORD[a.st]-NB_ORD[b.st]);
  const places=[...new Set(away.map(x=>x.where).filter(Boolean))].join(' ');
  const bar=typeof allBar==='function'?allBar('nbAcceptAll','nbClaimAll',nOpen,here):'';
  const note=away.length?`<p class="note r12away">${away.length} ready notice${away.length>1?'s':''} can't be handed in ${menu?'from the Menu':'here'}. ${esc(places)}</p>`:'';
  return `<p class="note">Every notice in one list: quests, bounties and guild missions. Accept what you like, do the deed, then hand it in. Claim all takes everything that may be handed in at this place.</p>${bar}${note}`+
    m3Rows(L.map(r12Row2).join(''),{ready:'Nothing is ready to hand in yet.',active:'Nothing under way.',open:'No new notices. More go up as your journey goes on.',done:'Nothing finished yet.'}[sec]||'No notices yet.');}
HOOK.xform('nbSecs','records12','all-notices tab sections',function(r,tab){if(tab!=='all')return r;const I=r12Items(),c=s=>I.filter(x=>x.st===s).length;
  return [['all','All',I.length],['ready','Ready',c('ready')],['active','Active',c('active')],['open','Open',c('open')],['done','Done',c('done')]];});
HOOK.before('nbBody','records12','all-notices tab body',function(tab,sec,menu){if(tab==='all')return HOOK.stop(r12AllBody(sec,menu));});
Object.assign(ACT,{
  nbClaimAll(){const L=r12Ready().filter(x=>x.here);let n=0;
    L.forEach(x=>{try{if(x.t==='q'){ACT.qClaim(x.id);const q=G.quests.find(y=>y.id===x.id);if(q&&q.state==='claimed')n++;}
      else if(x.t==='b'){ACT.bountyClaim(x.id);const b=G.bounties.find(y=>y.id===x.id);if(b&&b.state==='done')n++;}
      else{ACT.facClaim(x.id);if(facInit().done[x.id])n++;}}catch(e){}});
    toast(n?`Handed in ${n} notice${n>1?'s':''}.`:'Nothing could be handed in here.');render();},
  nbAcceptAll(){let n=0;
    try{m3Quests().filter(q=>q.state==='open').forEach(q=>{q.state='active';n++;try{if(typeof handFree==='function'&&!handFree(Object.assign({},q,{hand:1})))q.hand='board';}catch(e){}});}catch(e){}
    try{nbBountyList().filter(b=>b.state==='open').forEach(b=>{b.state='active';b.hand='board';n++;});}catch(e){}
    try{facMisAll().filter(m=>facMisState(m)==='open').forEach(m=>{ACT.facAccept(m.id);if(facMisState(m)!=='open')n++;});}catch(e){}
    saveGame();if(n)toast(`Accepted ${n} notice${n>1?'s':''}.`);render();}});

// ---------- 4. the Breach description ----------
HOOK.after('showLocation','records12','the Meridian Breach first-visit description (the banner itself is titles12.js)',function(){try{const m=WS.m;if(!m||!G||G.daily)return;
  if(m.breach){
    if(!G.breachLook){setTimeout(()=>{try{if(G&&!G.breachLook&&V.screen==='world'&&WS.m&&WS.m.breach&&!V.modal&&!B&&!WS.dlg){G.breachLook=1;say('The Meridian Breach',R12_BREACH_TEXT);saveGame();}}catch(e){}},1200);}
    return;}
  }catch(e){}});
