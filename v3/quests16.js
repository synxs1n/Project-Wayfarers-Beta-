// ===== quests16.js: the owner's quest, guild and goals notes after 0.21.0 (test tools/chrome/v187a.js) =====
// 1) The guilds are locked until the first realm's Scourge falls: no ranks, missions, perks to claim, guild shop or guild notices, and
//    nothing done before then counts. When the lock lifts on a journey that saw it (G.g16 1 -> 2), every guild counter and every
//    guild's standing is taken as the zero point (G.fac.base {c:{counter:n}, r:{guild:standing}}), so ranks and mission progress start
//    from that moment. A save that is already past the first realm when it first loads here (no G.g16) keeps everything it has.
//    Guild missions open with the guilds (PACE.at.guilds 2 -> 1; they used to wait for the third realm on a new journey).
// 2) Personal quests need PERSONAL_BT (config.js, now 50) battles together. When a wayfarer gets there, a popup offers the quest once,
//    after the victory screen (never in a battle), with Accept and Later (G.pqOff {hero:1}); it stays in Quests > Personal as before.
// 3) Every kind of notice is taken and handed in at the town Notice Board: the board has its Guilds tab back (missions, guild notices,
//    ranks), guild missions and guild notices are handed in at any Notice Board or Guild Hall, and the Notices list shows the personal
//    quests too. Realm quests and bounties still go back to the board that posted them (handin9.js).
// 4) "Sign the guild ledger" and "First blood in the pit" could not be handed in anywhere: since v0.16.1 they claim only inside the
//    Guild Hall popup (handin9.js canHandIn), but since v0.10.6 the Guild Hall lists no quests (guild7.js took Quests off its tabs), so
//    the only Claim button was the greyed one on the board. The Guild Hall's Guilds tab now lists the guild notices with their buttons,
//    and the board takes them too. They are marked global, so every town's board and hall shows them.
// 5) Next goals: a row with a progress tag ("1/5 hunted") was a flex row, so the tag took its width out of an already narrow column and
//    the text broke anywhere, a few letters a line. The text now uses the full row and the tag sits right aligned on the last line when
//    it fits there, else on a line of its own; words are never split.
const Q16={busy:0,fc0:null,fr0:null};
// ---------- 1. the guild lock ----------
function g16Open(){try{if(!G||G.daily)return true;if(G.won||(G.run&&G.run.cycle>0))return true;return !!((G.cleared&&G.cleared[0])||(G.stage|0)>=1);}catch(e){return true;}}
function g16Note(){let n='';try{const d=guardianDef(bossKeyFor(0));if(d&&d.n)n=' ('+d.n+')';}catch(e){}
  return `<p class="note pclock g16lock"><b>Locked.</b> The guilds open once the first realm's Scourge${esc(n)} falls: ranks and perks, guild missions and guild notices. Nothing counts toward them before then.</p>`;}
const G16_KEYS=['wins','tame','echo','scourge','road','temper','elite','dwins','manual','forge','potion'];
function g16Sync(){if(!G||G.daily||Q16.busy)return;
  if(!g16Open()){if(G.g16!==1)G.g16=1;return;}
  if(G.g16===2)return;const fresh=G.g16===1;G.g16=2;if(!fresh)return;// an older journey already past the first realm keeps its standing
  Q16.busy=1;try{const f=facInit(),c={},r={};new Set(G16_KEYS.concat(Object.keys(f.ctr))).forEach(k=>{const v=Q16.fc0(k);if(v>0)c[k]=v;});
    f.base={c,r};FAC.forEach(F=>{const v=Q16.fr0(F.id);if(v>0)r[F.id]=v;});
    if(!(G.quests||[]).some(q=>q.id==='gh0'&&q.state==='claimed'))delete G.guildSeen;facDirty();}catch(e){}finally{Q16.busy=0;}
  try{toast('The guilds have opened: ranks, missions and guild notices, at the Guild Hall and on the Notice Board.');}catch(e){}}
{const fc0=facCount;Q16.fc0=fc0;facCount=function(k){const v=fc0.apply(this,arguments);if(!G||G.daily)return v;g16Sync();if(!g16Open())return 0;const b=G.fac&&G.fac.base;return b&&b.c?Math.max(0,v-(b.c[k]||0)):v;};}
{const fr0=facRaw;Q16.fr0=fr0;facRaw=function(id){const v=fr0.apply(this,arguments);if(!G||G.daily)return v;g16Sync();if(!g16Open())return 0;const b=G.fac&&G.fac.base;return b&&b.r?Math.max(0,v-(b.r[id]||0)):v;};}
try{PACE.at.guilds=1;PC_NEWS[2]='New in this realm: Camp Supplies at Alchemy for making camp on the road.';}catch(e){}
HOOK.after('newGame','quests16','the guild lock on a new journey',function(){try{g16Sync();}catch(e){}});
{const fl0=facMissionList;facMissionList=function(){if(!g16Open())return [];return fl0.apply(this,arguments);};}
['facAccept','facClaim','facPerk','facBuy'].forEach(k=>{const a0=ACT[k];if(typeof a0!=='function')return;ACT[k]=function(){if(!g16Open()){try{toast("The guilds open once the first realm's Scourge falls.");sfx('deny');}catch(e){}return;}return a0.apply(this,arguments);};});
{const vf0=vFactions;vFactions=function(){if(!g16Open())return g16Note();return vf0.apply(this,arguments);};}
HOOK.xform('vFacMissions','quests16','no missions while the guilds are locked',function(h){return g16Open()?h:g16Note();});
HOOK.before('nbBody','quests16','the Guilds tab is a locked note until the first realm is beaten',function(tab){if(tab==='guilds'&&!g16Open())return HOOK.stop(g16Note());});
HOOK.xform('vModal','quests16','no guild rank strip on the shops while the guilds are locked',function(h){try{if(typeof h==='string'&&!g16Open()&&h.indexOf('class="note facrank"')>=0)h=h.replace(/<p class="note facrank"[\s\S]*?<\/p>/,'');}catch(e){}return h;});
// the ledger is not signed by looking at a locked hall
{const mg0=m3Guild;m3Guild=function(m){const had=!!(G&&G.guildSeen);const h=mg0.apply(this,arguments);try{if(G&&!had&&G.guildSeen&&!g16Open())delete G.guildSeen;}catch(e){}return h;};}
// guild notices go up with the guilds, on every town's board and hall
const q16Guild=q=>!!q&&(q.type==='guild'||q.type==='arena');
HOOK.after('genQuests','quests16','guild notices wait for the first realm, then show in every town',function(r,s){try{if(s!==0||!G||G.daily)return;const open=g16Open();
  for(let i=G.quests.length-1;i>=0;i--){const q=G.quests[i];if(!q16Guild(q))continue;if(!open&&q.state==='open')G.quests.splice(i,1);else q.global=1;}}catch(e){}});
{const qr0=questReady;questReady=function(q){if(q16Guild(q)&&!g16Open())return false;return qr0.apply(this,arguments);};}

// ---------- 3 and 4. every kind of notice at the Notice Board; guild notices listed where they are handed in ----------
function q16AtDesk(){try{const t=V.modal&&V.modal.type;return t==='guild'||(t==='board'&&inTown());}catch(e){return false;}}
const Q16_WHERE='Hand in at any Guild Hall or Notice Board.';
{const c0=canHandIn;canHandIn=function(q){if(q16Guild(q))return g16Open()&&q16AtDesk();return c0.apply(this,arguments);};}
{const h0=handWhere;handWhere=function(q){if(q16Guild(q))return Q16_WHERE;return h0.apply(this,arguments);};}
{const g0=qgHand;qgHand=function(q){if(q16Guild(q))return Q16_WHERE;return g0.apply(this,arguments);};}
facAtHall=function(){return q16AtDesk();};
{const t0=m3Tabs;m3Tabs=function(t){const T=t0.apply(this,arguments);try{if(t==='board'&&!T.some(x=>x[0]==='guilds')){const i=T.findIndex(x=>x[0]==='bounties');T.splice(i<0?T.length:i,0,['guilds','Guilds']);}}catch(e){}return T;};}
function q16Notices(){try{return m3Quests().filter(q=>q16Guild(q)&&q.state!=='claimed');}catch(e){return [];}}
{const ng0=nbGuilds;nbGuilds=function(sec){let h=ng0.apply(this,arguments);try{const s=sec||'all',L=q16Notices().filter(q=>s==='all'||nbQState(q)===s).sort((a,b)=>NB_ORD[nbQState(a)]-NB_ORD[nbQState(b)]);
  if(L.length)h=m3H('Guild notices')+`<div class="rows q16gn">${L.map(q=>nbQuestRow(q)).join('')}</div>`+m3H('Guild missions')+h;}catch(e){}return h;};}
HOOK.xform('nbSecs','quests16','guild notices counted on the Guilds tab; no sections while locked',function(r,tab){try{if(tab!=='guilds')return r;if(!g16Open())return [];
  const L=q16Notices();if(!L.length)return r;return r.map(x=>[x[0],x[1],(x[2]|0)+L.filter(q=>x[0]==='all'||nbQState(q)===x[0]).length]);}catch(e){return r;}});
HOOK.xform('nbBody','quests16','personal quests in the Notices list; hand-in place names the board',function(h,tab,sec){try{if(typeof h!=='string')return h;
  if(tab==='all'&&(!sec||sec==='all')&&nbPersonal().length)h+=m3H('Personal quests')+vPersonal();
  h=h.replace(/Hand in at any Guild Hall(?! or)/g,'Hand in at any Guild Hall or Notice Board');}catch(e){}return h;});

// ---------- 2. the personal quest offer ----------
function pq16List(){try{if(!G||G.daily)return [];const off=G.pqOff||{};return Object.values(G.roster).filter(c=>TPL[c.id]&&!TPL[c.id].mon&&!off[c.id]&&personalEligible(c)&&!(G.personal&&G.personal[c.id]&&G.personal[c.id].state&&G.personal[c.id].state!=='open'));}catch(e){return [];}}
HOOK.before('finishBattle','quests16','a personal quest may be offered after this fight',function(how){try{if(how==='win'&&G&&!G.daily)V.pq16=1;}catch(e){}});
HOOK.after('finishBattle','quests16','the offer shows once the world is back',function(){try{if(V.pq16&&!B&&!V.modal&&V.screen==='world'&&pq16List().length)render();}catch(e){}});
// outside p4party's render hook (the boss energy popup goes first), and only on the world screen with nothing else open
HOOK.before('render','quests16','personal quest offer popup',function(){try{if(!V.pq16||B||V.screen!=='world'||!G||G.daily||V.modal||WS.dlg||V.bossEnergy!=null||(V.gearQueue&&V.gearQueue.length))return;
  V.pq16=0;const L=pq16List();if(!L.length)return;G.pqOff=G.pqOff||{};L.forEach(c=>{G.pqOff[c.id]=1;});V.modal={type:'pqoffer',ids:L.map(c=>c.id)};saveGame();}catch(e){}});
function pq16Row(id,one){const c=G.roster[id],t=TPL[id];if(!c||!t)return '';const q=G.personal&&G.personal[id],w=gearOf(sigGid(id))||gearOf('u_'+id)||{n:'a signature item'};
  const on=q&&q.state&&q.state!=='open',st=on?'<span class="m up">Accepted</span>':one?'':`<button class="btn sm gold" data-act="pq16Accept" data-arg="${id}">Accept</button>`;
  return `<div class="row">${port(id)}<div class="grow"><b>${esc(t.n)}: ${esc(w.n)}</b><small>${on&&q.text?esc(q.text)+` It prowls ${esc(ZS(q.stage).n)}.`:esc(gearDesc(w))}</small></div>${st}</div>`;}
HOOK.before('vModal','quests16','personal quest offer popup',function(m){if(!m||m.type!=='pqoffer'||!G)return;try{const ids=(m.ids||[]).filter(id=>G.roster[id]),one=ids.length===1;
  const left=ids.filter(id=>!(G.personal[id]&&G.personal[id].state&&G.personal[id].state!=='open'));
  const who=one?esc(TPL[ids[0]].n)+' has':'These wayfarers have';
  return HOOK.stop(box(one?'A personal quest':'Personal quests',`<p class="story">${who} fought ${PERSONAL_BT} battles beside you, and unfinished business of their own.</p>
    <div class="rows pq16">${ids.map(id=>pq16Row(id,one)).join('')}</div>
    <p class="note">Accept and a rival roams ${esc(ZS(G.stage).n)}. Bring that wayfarer in your six to face it and win their signature item. Not now? It waits at any Notice Board, under Quests &gt; Personal.</p>`,
    `<button class="btn" data-act="closeModal">${left.length?'Later':'Done'}</button>${one&&left.length?`<button class="btn gold" data-act="pq16Accept" data-arg="${ids[0]}">Accept</button>`:''}`));}catch(e){}});
ACT.pq16Accept=function(id){if(!G)return;const q=startPersonal(id);try{if(q){toast(`${q.name} now prowls ${ZS(q.stage).n}.`);sfx('chest');}}catch(e){}
  const m=V.modal;if(m&&m.type==='pqoffer'){const left=(m.ids||[]).filter(x=>G.roster[x]&&!(G.personal[x]&&G.personal[x].state&&G.personal[x].state!=='open'));if(!left.length||m.ids.length===1)V.modal=null;}
  render();};

// ---------- 5. Next goals: rows, always on screen, the player's fold, the Show goals setting ----------
// The owner: "Always keep the goals on screen, always allow minimize and maximizing them, add setting to turn it off."
// Before: the panel folded itself to two goals or a chip and hid when it would cover the hero or the area banner (menus14.js), hid
// during a dialogue and when the list was empty (goals.js). Now it is on every world screen (not in a battle or under a menu), full or
// folded to its header bar only by the player's arrow (META.cfg.goalsMin, kept across maps and reloads). It does not fold, hide or fade when
// the hero walks under it (the owner: "we want it to stay open even when walking close"). Settings > Display > Show goals (META.cfg.goals, default on) turns it off.
function q16GoalsOn(){try{return !(META.cfg&&META.cfg.goals===false);}catch(e){return true;}}
// the only spot is under the minimap, whatever lies there (after menus14's rule, which gave the spot up when the hero stood under it)
HOOK.xform('glSpot','quests16','the panel keeps its spot under the minimap',function(r,wv,w){try{const at=m14Spot(wv,w);return at||r||{x:8,y:42};}catch(e){return r;}});
{const gl0=glList;glList=function(){const L=gl0.apply(this,arguments);try{if(Q16.fill&&!L.length&&glOn())return [{id:'none',t:'No goals just now. Explore, or see Guides > What next?',sub:'',p:'',R:null,story:false}];}catch(e){}return L;};}
{const gh0=glHtml;glHtml=function(L,mode,auto){let h=gh0.call(this,L,mode,false);try{if(mode==='chip')h=h.replace('<b>Goals</b>','<b>Next goals</b>').replace(/<span class="gln">[^<]*<\/span>/,'');
  h=h.replace(/(<li class="[^"]*" data-goal="none"[^>]*?) role="button" tabindex="0" data-act="goalGuide" data-arg="none"/,'$1');}catch(e){}return h;};}
HOOK.wrap('glRender','quests16','always on the world screen; folded only by the player; Show goals setting',function(next){
  if(!q16GoalsOn()){try{const e=document.getElementById('glp');if(e)e.style.display='none';}catch(e){}return;}
  const dlg=WS.dlg;Q16.fill=1;try{if(dlg)WS.dlg=null;next();}finally{if(dlg&&!WS.dlg)WS.dlg=dlg;Q16.fill=0;}
  try{const e=document.getElementById('glp');if(!e||!e.innerHTML)return;const on=glOn()&&V.screen==='world'&&!B&&!V.modal&&!!WS.cv;if(!on)return;
    if(e.style.display==='none')e.style.display='';}catch(e){}});
{const r0=hdRow;hdRow=function(){const on=q16GoalsOn();return r0.apply(this,arguments)+`<div class="rows"><div class="row"><div><b>Show goals</b><small>The Next goals panel under the minimap. Its arrow folds it to a bar and opens it again; Off hides it completely (Guides &gt; What next? still lists the goals).</small></div><div class="chips"><button class="chip ${on?'on':''}" data-act="cfg" data-arg='["goals",true]'>On</button><button class="chip ${on?'':'on'}" data-act="cfg" data-arg='["goals",false]'>Off</button></div></div></div>`;};}
try{const st=document.createElement('style');st.textContent=`.gl .gll li{display:flow-root;overflow-wrap:break-word;word-break:normal;hyphens:manual}
.gl .gll li span{display:inline;min-width:0}.gl .gll li em{float:right;margin-left:6px;white-space:nowrap}
.wview>#glp.gl.gl.chip,.wview>#glpm.gl.gl.chip{width:var(--m14w,168px)}.gl .glhead{white-space:nowrap}
@media (pointer:coarse),(max-width:600px){.wview>#glp.gl.gl .glhead,.wview>#glpm.gl.gl .glhead{min-height:44px}}`;document.head.appendChild(st);}catch(e){}
try{window.__Q16={Q16,g16Open,g16Sync,g16Note,pq16List,q16AtDesk,q16Notices,q16GoalsOn,get G(){return G;},get V(){return V;},get B(){return B;}};}catch(e){}
try{M11_RANK.unshift(['display',2.7,/"goals",/]);}catch(e){}// menus11.js sorts the Settings rows into sections: Show goals belongs to Display
