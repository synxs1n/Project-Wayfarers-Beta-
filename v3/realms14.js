// ===== realms14.js (realms14 pass): sixteen Scourges and four Calamities, each boss in a realm of its own =====
// The data lives where it always did: foes.js (GUARDIANS 16, FINALS 4), realmdata.js (REALMS: 16 standard realms with one Scourge each, 4 Calamity realms with one
// Calamity each, no alternates; BOV, CAL_FX, RIFT_COL), look9.js, dungeon8.js, lore9.js, sitelook10.js, world12.js (landmarks), sanctum.js (the Rift hall: four
// bays of four Scourge gates, four Calamity gates on the inner ring). This module only holds what is behaviour:
//  1. save safety. Journeys saved before this pass may name a boss that no longer exists (The Locust Choir, Ironmaw Tortoise, The Hollow Shepherd, The Pale Weaver,
//     the Hollow Sun). unpackG maps each to the nearest kept boss (same elements first, never a boss already in the run), also in G.bossWon, G.riftWon,
//     G.echoShard, Echo Shard stock (G.mats es_<key>), the New Game+ draw (G.run.ngp) and any hunt quest or bounty that names the removed boss's overlay foe.
//     Account records for the removed bosses (META.best by name, META.pt12) are left alone and never read: every list is built from GPOOL and FPOOL.
//  2. R14: a small audit object for the test (tools/chrome/v184a.js).
// Realm keys never change and new realms are appended to REALMS, so every old journey keeps the realm order (G.run.order) it was drawn with.
const R14_GONE={
  locustchoir:['queenmantis','crowregent','thornwarden'],
  ironmaw:['thornwarden','drake','siren'],
  hollowshepherd:['thornwarden','candlemoth','bonecolossus'],
  paleweaver:['hoarwyrm','frostlich','ysolde'],
  hollowsun:['seraph','dimmer','nidhra']};
// the replacement for each removed boss in one saved journey: the first listed boss that exists and is not already standing in the run
function r14Plan(g){const plan={},used=new Set(),run=g&&g.run;
  const live=k=>!R14_GONE[k]&&!!guardianDef(k);
  if(run){(run.bosses||[]).concat([run.final]).forEach(k=>{if(k&&live(k))used.add(k);});}
  const pick=k=>{const l=R14_GONE[k]||[];for(const c of l){if(live(c)&&!used.has(c)){used.add(c);return c;}}return l.find(live)||l[0];};
  if(run){(run.bosses||[]).concat([run.final]).forEach(k=>{if(k&&R14_GONE[k]&&!plan[k])plan[k]=pick(k);});}
  Object.keys(R14_GONE).forEach(k=>{if(!plan[k])plan[k]=R14_GONE[k].find(live)||R14_GONE[k][0];});
  return plan;}
function r14Name(s,plan){if(typeof s!=='string')return s;
  if(plan[s])return plan[s];
  const m=/^(o_|es_|echo_)(\w+)$/.exec(s);if(m&&plan[m[2]])return m[1]+plan[m[2]];
  return s;}
// walk the save: strings and object keys that name a removed boss follow the plan (a key already present keeps its own value, counts add up)
function r14Walk(v,plan,seen){if(!v||typeof v!=='object'||seen.has(v))return v;seen.add(v);
  if(Array.isArray(v)){for(let i=0;i<v.length;i++){const x=v[i];if(typeof x==='string')v[i]=r14Name(x,plan);else r14Walk(x,plan,seen);}return v;}
  Object.keys(v).forEach(k=>{const x=v[k],nk=r14Name(k,plan);
    if(typeof x==='string')v[k]=r14Name(x,plan);else r14Walk(x,plan,seen);
    if(nk!==k){const val=v[k];delete v[k];if(!(nk in v))v[nk]=val;else if(typeof val==='number'&&typeof v[nk]==='number')v[nk]+=val;}});
  return v;}
function r14Migrate(g){try{if(!g||g.r14mig)return g;
  const text=JSON.stringify([g.run||null,g.bossWon||null,g.riftWon||null,g.echoShard||null,g.mats||null,g.quests||null,g.bounties||null]);
  if(!/locustchoir|ironmaw|hollowshepherd|paleweaver|hollowsun/.test(text)){g.r14mig=1;return g;}
  const plan=r14Plan(g),seen=new Set();
  ['run','bossWon','riftWon','echoShard','mats','quests','bounties','bountyDone','echoStory'].forEach(f=>{if(g[f]!=null){if(typeof g[f]==='string')g[f]=r14Name(g[f],plan);else r14Walk(g[f],plan,seen);}});
  g.r14mig=1;}catch(e){console.error('realms14 migrate',e);}return g;}
HOOK.after('unpackG','realms14','old saves: a removed Scourge or Calamity maps to the nearest kept one',function(r){return r14Migrate(r);});
// the audit the test reads
window.__R14={R14_GONE,r14Plan,r14Migrate,r14Name,
  get table(){return REALMS.map(R=>({key:R.key,idx:R.idx,n:R.n,theme:R.theme0||R.theme,cal:!!R.cal,std:!!R.std,boss:R.boss,alt:R.alt||[],els:R.els.slice(),town:R.town,dungeon:R.dungeon,mus:R.mus,wx:R.wx.map(w=>w[0])}));}};
