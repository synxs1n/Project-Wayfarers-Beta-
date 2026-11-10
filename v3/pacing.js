// ===== pacing.js (v0.7.2): pacing spread: when each system first unlocks (v0.9.5: by realm, pcUnlocked) =====
// =================== Beta v0.7.2: pacing spread (owner approved the docs/v063-progression.md proposals) ===================
// Realm 1 used to introduce almost every system at once, and levels 15 to 30 got little new. Four gates move later:
//  1. Guild missions open after the first Scourge falls (ranks from other sources keep counting; accepted missions stay).
//  2. Tempering at the Smithy opens after the first Scourge falls (unless the journey already has tempered gear, so old saves keep it).
//  3. The Tamer's Stick quest goes up on the second realm's board (an accepted quest in an old save stays where it is).
//  4. Personal quests open in the third realm (PERSONAL_REALM=2 in config.js).
// Nothing changes in the Daily Trial.
function pcFirstBoss(){return !!(G&&(G.daily||(G.cleared&&G.cleared[0])||(G.stage|0)>=1));}
function pcHasTempered(){try{return G.gear.some(id=>plusOf(id)>0)||Object.values(G.roster).some(c=>EQSL.some(sl=>c.eq[sl]&&plusOf(c.eq[sl])>0));}catch(e){return false;}}
const PC_LOCK='opens after the first Scourge falls';
// 1. guild missions
{const fl0=facMissionList;facMissionList=function(id){const L=fl0.apply(this,arguments);if(pcFirstBoss())return L;const f=facInit();return L.filter(m=>f.acc[m.id]!=null);};}
{const fa0=ACT.facAccept;ACT.facAccept=function(id){if(!pcFirstBoss()){toast('Guild missions '+PC_LOCK+'.');return;}return fa0.apply(this,arguments);};}
HOOK.xform('vFacMissions','pacing','guild missions lock note',function(h){if(pcFirstBoss()||!G)return h;return `<p class="note pclock">Guild missions ${PC_LOCK}. Your standing with each faction already counts from what you do on the road.</p>`+h;});
// 2. tempering
function pcTemperOpen(){return pcFirstBoss()||pcHasTempered();}
{const vt0=vTemper;vTemper=function(opt){if(G&&!G.daily&&!pcTemperOpen())return `<p class="note pclock">The smith will temper your gear once the first Scourge falls. Until then, forge and buy what you need.</p>`;return vt0.apply(this,arguments);};}
// 3. the Tamer's Stick quest on the second realm's board
HOOK.after('genQuests','pacing','Tamer quest step for the pacing',function(r,s){try{const q=G&&G.quests&&G.quests.find(q=>q.id==='tamer');if(q&&q.state==='open'&&q.stage===0)q.stage=1;}catch(e){}});
// 4. personal quests: the lock text follows PERSONAL_REALM
{const ord=n=>['first','second','third','fourth','fifth'][n]||('realm '+(n+1));
  const lt0=personalLockText;personalLockText=function(c){return lt0.apply(this,arguments).replace('Unlocks in the second realm','Unlocks in the '+ord(PERSONAL_REALM)+' realm');};}

// =================== Beta v0.9.5: depth unlocks by realm (owner approved) ===================
// PACE (config.js) says in which realm each system opens on a new journey: realm 1 elements, basic combat and taming; realm 2 reactions,
// gear upgrades (Tempering still waits for the first Scourge, above) and bonds; realm 3 camp and guild missions; realm 4 the endgame extras
// (the Echoforge, the arena's Golden Coliseum, a New Game+ teaser). Gating only hides or holds back; it never removes anything:
//  - a journey started before v0.9.5 (no G.pcV) keeps every system it had (only the v0.7.2 gates above apply to it),
//  - a New Game+ cycle and the Daily Trial have everything open.
// pcUnlocked(system) is the one test (systems: PACE.at keys); other modules (onboarding tips, What next?) should ask it before
// pointing the player at a system. pcRealm() is the realm index the journey has reached (0 = the first realm).
function pcRealm(){return G?Math.max(G.stage|0,(G.cleared||[]).filter(Boolean).length):0;}
function pcGated(){return !!(G&&!G.daily&&G.pcV);}
function pcUnlocked(sys){if(!G||!pcGated())return true;const at=PACE.at[sys];if(at==null)return true;if(sys==='echoforge'&&G.won)return true;return pcRealm()>=at;}
function pcOrd(n){return ['first','second','third','fourth','fifth'][n]||('realm '+(n+1));}
function pcLockText(sys){return `opens in the ${pcOrd(PACE.at[sys]||0)} realm`;}
// new journeys get the gates (an NG+ cycle does not)
HOOK.after('newGame','pacing','pacing version on a new journey',function(r,ids,cycle){try{if(G&&!cycle)G.pcV=1;}catch(e){}});
// reactions: in a gated first realm a primer skill is a plain hit (it marks nothing, so nothing detonates)
HOOK.wrap('perform','pacing','primers are plain hits until reactions open',function(next,...args){let a=args[0],sk=args[1],tgts=args[2];if(sk&&sk.role==='primer'&&a&&a.side==='p'&&!pcUnlocked('reactions')){
    try{G.pcN=G.pcN||{};if(!G.pcN.react){G.pcN.react=1;log('Elemental reactions awaken in the second realm. Until then a primer is a plain hit.');}}catch(e){}
    return next(a,Object.assign({},sk,{role:null}),tgts);}
  return next(...args);});
// bonds: in a gated first realm wins side by side do not count yet
HOOK.wrap('win','pacing','bonds stay closed until their realm',function(next,...a){if(!G||pcUnlocked('bonds'))return next(...a);const b0=JSON.stringify(G.bonds||{}),t0=(G.talks||[]).length;const r=next(...a);
  try{G.bonds=JSON.parse(b0);if(G.talks)G.talks.length=Math.min(G.talks.length,t0);const i=V.modal&&V.modal.info;if(i&&i.bonds)i.bonds=[];}catch(e){}return r;});
if(typeof bondSheet==='function'){const bs0=bondSheet;bondSheet=function(){if(!pcUnlocked('bonds'))return '';return bs0.apply(this,arguments);};}
if(typeof vBonds==='function'){const vb0=vBonds;vBonds=function(){if(!pcUnlocked('bonds'))return `<p class="note pclock">Bonds ${pcLockText('bonds').replace('opens','open')}: from then on, heroes who win side by side in the Vanguard grow closer, with campfire talks and joint techs.</p>`;return vb0.apply(this,arguments);};}
// guild missions: the third realm on a new journey (the v0.7.2 first Scourge rule above still holds for older journeys)
function pcGuildOpen(){return pcGated()?pcUnlocked('guilds'):pcFirstBoss();}
{const fl1=facMissionList;facMissionList=function(id){if(!pcGated()||pcGuildOpen())return fl1.apply(this,arguments);const f=facInit();return fl1.apply(this,arguments).filter(m=>f.acc[m.id]!=null);};}
{const fa1=ACT.facAccept;ACT.facAccept=function(id){if(pcGated()&&!pcGuildOpen()){toast('Guild missions '+pcLockText('guilds')+'.');return;}return fa1.apply(this,arguments);};}
HOOK.xform('vFacMissions','pacing','guild missions lock note (gated pacing)',function(h){if(!G||!pcGated()||pcGuildOpen())return h;const t=`Guild missions ${pcLockText('guilds')}.`;
  return h.includes(`Guild missions ${PC_LOCK}.`)?h.replace(`Guild missions ${PC_LOCK}.`,t):`<p class="note pclock">${t} Your standing with each faction already counts from what you do on the road.</p>`+h;});
// the Echoforge: the fourth realm (or once the journey is won)
if(typeof efTabOn==='function'){const ef0=efTabOn;efTabOn=function(){return ef0.apply(this,arguments)&&pcUnlocked('echoforge');};}
// the arena's top tiers: the Golden Coliseum needs the fourth realm (ARENA min already asks for three Scourges)
// one notice per realm when it opens something new (and the New Game+ teaser in the fourth)
const PC_NEWS={1:'New in this realm: elemental reactions (a primer marks a foe, a detonator sets it off) and bonds between heroes who win side by side.',
  2:'New in this realm: guild missions at the Guild Hall, and Camp Supplies at Alchemy for making camp on the road.',
  3:'New in this realm: the Echoforge at the Smithy and the Golden Coliseum. Beyond the last Calamity waits New Game+: keep your heroes, face harder foes, add modifiers.'};
function pcNews(){try{if(!pcGated())return;const r=Math.min(3,pcRealm());G.pcN=G.pcN||{};for(let k=1;k<=r;k++){if(G.pcN['r'+k])continue;G.pcN['r'+k]=1;if(k===r&&PC_NEWS[k])toast(PC_NEWS[k]);}}catch(e){}}
HOOK.after('showLocation','pacing','news on arriving in town',function(){try{if(WS.m&&WS.m.kind==='town')pcNews();}catch(e){}});
try{window.__P95={pcUnlocked,pcRealm,pcGated,pcLockText,pcNews,pcGuildOpen,get PACE(){return PACE;}};}catch(e){}
