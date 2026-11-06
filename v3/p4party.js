// ===== p4party.js (v0.5.0): party, guilds and quests: personal quests by realm, guild text, the boss's lingering energy =====
// 4.1 personal quests: no level gate. PERSONAL_BT battles together (per hero bt, old saves keep the estimate in btOf) and the party in the
//     second realm (PERSONAL_REALM). Before both are met the quest stays out of sight: no row in the Guild Hall, no hint in What next?.
//     Started or finished quests (G.personal) are never touched.
// 4.2 Factions are called Guilds in every player facing text. Save fields (G.fac, META.facBest), tab ids ('factions', 'fmis') and
//     function names stay. The Steady Hand is the Steady Hand Guild. Guild Hall gets a Guilds tab (ranks, perks, missions); Records keeps one.
// 4.3 result screen line for the XP catch up (p4xp.js).
// 4.4 after a base boss falls, a message in the story's voice says its energy lingers and the stronger Echo waits after you leave.

// ---------- 4.1 personal quests ----------
function realmReached(n){return !!(G&&(G.daily||(G.stage||0)>=n||(n>0&&G.cleared&&G.cleared[n-1])));}
function personalEligible(c){return !!c&&!!TPL[c.id]&&!TPL[c.id].mon&&realmReached(PERSONAL_REALM)&&btOf(c)>=PERSONAL_BT;}
function personalLockText(c){return !realmReached(PERSONAL_REALM)?'Unlocks in the second realm':`Battles together: ${btOf(c)} of ${PERSONAL_BT}`;}
function pqShown(c){const q=G.personal&&G.personal[c.id];return !!(q&&q.state&&q.state!=='open')||personalEligible(c);}
function vPersonal(){
  const list=Object.values(G.roster).filter(c=>!TPL[c.id].mon&&pqShown(c)).sort((a,b)=>b.lv-a.lv);
  const intro=`<p>Every wayfarer has unfinished business. Once your party reaches the third realm, a hero who has fought ${PERSONAL_BT} battles beside you can take up their personal quest: accept it and a rival roams the current realm's field. Bring that hero in your six to face it and win their signature item: a weapon, armor or accessory bound to that hero, which changes how they look.</p>`;
  if(!list.length)return intro+`<p class="note">${realmReached(PERSONAL_REALM)?`No wayfarer is ready yet. Each hero's sheet shows their battles together (${PERSONAL_BT} needed).`:'Personal quests open in the third realm.'}</p>`;
  return intro+`<div class="rows">${list.map(c=>{const q=G.personal[c.id],t=TPL[c.id],w=gearOf(sigGid(c.id))||gearOf('u_'+c.id);
    const st=!q||q.state==='open'?`<button class="btn sm gold" data-act="personal" data-arg="${c.id}">Accept</button>`:q.state==='active'?'<span class="m">Rival roaming</span>':'<span class="m up">Done</span>';
    return `<div class="row">${port(c.id)}<div class="grow"><b>${esc(t.n)}: ${esc(w.n)}</b><small>${q&&q.text?esc(q.text)+(q.state==='active'?` It prowls ${esc(ZS(q.stage).n)}.`+(rivalNeed(q)?` <b class="rgneed">${esc(rivalNeedShort(q))}.</b>`:''):''):esc(gearDesc(w))}</small></div>${st}</div>`;}).join('')}</div>`;}
function pqSheetLine(c){const q=G&&G.personal&&G.personal[c.id];let s=`Battles together: ${btOf(c)} of ${PERSONAL_BT}`;
  if(q&&q.state==='done')s+='. Personal quest done';else if(q&&q.state==='active')s+='. Personal quest under way';
  else if(TPL[c.id]&&TPL[c.id].mon){}else if(!realmReached(PERSONAL_REALM))s+='. Unlocks in the '+(['first','second','third','fourth','fifth'][PERSONAL_REALM]||'later')+' realm';else if(personalEligible(c))s+='. Personal quest ready at the Guild Hall';
  return s;}
{const mc0=mChar;mChar=function(id){let h=mc0.apply(this,arguments);try{const c=G&&G.roster[id];if(c&&typeof h==='string')h=h.replace(/(<p class="note nums">)Battles together: \d+ of \d+(<\/p>)/,(a,p1,p2)=>p1+esc(pqSheetLine(c))+p2);}catch(e){}return h;};}

// ---------- 4.2 guilds ----------
const GUILD_WORDS=[[/\bFactions\b/g,'Guilds'],[/\bfactions\b/g,'guilds'],[/\bFaction\b/g,'Guild'],[/\bfaction\b/g,'guild'],[/\bFACTIONS\b/g,'GUILDS']];
function guildText(s){if(typeof s!=='string'||!/faction/i.test(s))return s;// text outside tags only, so data-act and data-arg ids stay
  return s.split(/(<[^>]*>)/).map(p=>p.charAt(0)==='<'?p:GUILD_WORDS.reduce((a,[r,t])=>a.replace(r,t),p)).join('');}
(function(){try{FACB.hand.n='The Steady Hand Guild';FAC.forEach(F=>F.perks.forEach(p=>{if(p)p.t=guildText(p.t);}));
  MENU_SUB.factions='Guilds';MENU_SUB.fmis='Guilds';if(MJINGLE.rank)MJINGLE.rank.name='Guild rank up';}catch(e){}})();
{const v0=vFactions;vFactions=function(){return guildText(v0.apply(this,arguments));};}
{const v0=vFacMissions;vFacMissions=function(){return guildText(v0.apply(this,arguments));};}
{const vm0=vModal;vModal=function(m){return guildText(vm0.apply(this,arguments));};}
{const t0=toast;toast=function(m){return t0.apply(this,[guildText(m)].concat([].slice.call(arguments,1)));};}

// ---------- 4.4 the boss's energy lingers ----------
function bossEnergyText(s){let n='The Scourge';try{const d=guardianDef(bossKeyFor(s));if(d&&d.n)n=d.n;}catch(e){}
  const place=ZS(s).dungeon||'this place';
  return s>=4?`${n} is broken, but its energy lingers here... Something of it clings to ${place}. Leave, and when you return its Echo will be waiting, stronger than before.`
    :`${n} falls, but its energy lingers here... It clings to the rune circle in ${place}. Return after leaving this place to face the stronger Echo.`;}
{const w0=win;win=function(){let first=null;try{if(B&&G&&!G.daily&&B.spec&&B.spec.kind==='boss'&&G.cleared&&!G.cleared[B.stage])first=B.stage;}catch(e){}
  const r=w0.apply(this,arguments);try{if(first!=null&&G.cleared[first]){V.bossEnergy=first;V.bossEnergyAt=WS.m&&WS.m.id;}}catch(e){}return r;};}
// shown in that dungeon as soon as the world has no other popup (new gear popups first); dropped once you have left it. Shown (the Calamity's Legacy choice carries it as a line instead)
{const r0=render;render=function(){try{if(V.bossEnergy!=null&&!B&&V.screen==='world'&&G&&WS.m&&V.bossEnergyAt&&WS.m.id!==V.bossEnergyAt&&WS.m.kind!=='dungeon'){V.bossEnergy=null;}// left the place before it could show
  if(V.bossEnergy!=null&&!B&&V.screen==='world'&&G){if(!V.modal&&!(V.gearQueue&&V.gearQueue.length)){V.modal={type:'bossEnergy',s:V.bossEnergy};V.bossEnergy=null;}
  else if(V.modal.type==='legacy'){V.modal.energy=V.bossEnergy;V.bossEnergy=null;}}}catch(e){}return r0.apply(this,arguments);};}
{const vm1=vModal;vModal=function(m){
  if(m&&m.type==='bossEnergy')return box('Its energy lingers',`<p class="story">${esc(bossEnergyText(m.s))}</p><p class="note">The Echo is optional. The way on is already open.</p>`,'<button class="btn gold" data-act="closeModal">Onward</button>');
  let h=vm1.apply(this,arguments);try{if(m&&m.type==='legacy'&&m.energy!=null&&typeof h==='string'){const k=h.indexOf('</h2>');if(k>0)h=h.slice(0,k+5)+`<p class="story bossen">${esc(bossEnergyText(m.energy))}</p>`+h.slice(k+5);}}catch(e){}return h;};}
