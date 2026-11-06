// ===== pacing.js (v0.7.2): pacing spread: when each system first unlocks =====
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
{const vm0=vFacMissions;vFacMissions=function(){const h=vm0.apply(this,arguments);if(pcFirstBoss()||!G)return h;return `<p class="note pclock">Guild missions ${PC_LOCK}. Your standing with each faction already counts from what you do on the road.</p>`+h;};}
// 2. tempering
function pcTemperOpen(){return pcFirstBoss()||pcHasTempered();}
{const vt0=vTemper;vTemper=function(opt){if(G&&!G.daily&&!pcTemperOpen())return `<p class="note pclock">The smith will temper your gear once the first Scourge falls. Until then, forge and buy what you need.</p>`;return vt0.apply(this,arguments);};}
// 3. the Tamer's Stick quest on the second realm's board
{const gq0=genQuests;genQuests=function(s){const r=gq0.apply(this,arguments);try{const q=G&&G.quests&&G.quests.find(q=>q.id==='tamer');if(q&&q.state==='open'&&q.stage===0)q.stage=1;}catch(e){}return r;};}
// 4. personal quests: the lock text follows PERSONAL_REALM
{const ord=n=>['first','second','third','fourth','fifth'][n]||('realm '+(n+1));
  const lt0=personalLockText;personalLockText=function(c){return lt0.apply(this,arguments).replace('Unlocks in the second realm','Unlocks in the '+ord(PERSONAL_REALM)+' realm');};}
