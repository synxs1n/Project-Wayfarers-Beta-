// ===== menus9.js (v0.12.6): the main menu regrouped by what you do, plus a Bonds tab =====
// Party: Party, Roster, Loadouts, Pets, Bonds. Backpack: Equipment, Items, Materials. Quests: Quests, Bounties, Guilds, Arena.
// World: Map, Journey (realm progress, time, stats). Records: Bestiary, Codex, Lore, Music Room. Guides: What next?, How it works, the
// Charts, Ailments, Boons, Boss gimmicks, Foe types, Hints, Help. Settings. Runs last in MODS, after every module that spliced its own tab in.
(function(){try{
  const G9=[['party','Party',['party','roster','loadouts','comp','bonds']],['gear','Backpack',['equip','items','pouch']],['quests','Quests',['quests','qbounty','factions','qarena']],
    ['map','Map',['map']],['records','Records',['realms','system','beasts','codex','lore','music']],['guides','Guides',['next','sysg','charts','ailments','boons','gimmicks','types','hints','help']],['settings','Settings',['settings']]];
  const have=new Set(MENU_GROUPS.flatMap(g=>g[2]));// a tab another module added that is not placed above keeps its old group's slot: Records
  const placed=new Set(G9.flatMap(g=>g[2]));have.forEach(t=>{if(!placed.has(t)){const old=MENU_GROUPS.find(g=>g[2].includes(t)),dst=G9.find(g=>g[0]===(old&&old[0]))||G9.find(g=>g[0]==='records');dst[2].push(t);}});
  G9.forEach(g=>{g[2]=g[2].filter(t=>have.has(t)||t==='bonds'||t==='realms');});
  MENU_GROUPS.splice(0,MENU_GROUPS.length,...G9.filter(g=>g[2].length));MENU_SUB.bonds='Bonds';MENU_SUB.system='Journey';MENU_SUB.realms='Realms';MENU_SUB.map='Map';
}catch(e){}})();
// the Bonds tab body (vBonds from v063prog.js / bonds9.js)
{const nb0=typeof nbMenuBody==='function'?nbMenuBody:null;nbMenuBody=function(m){/* the realms tab (Completion) moved to records12.js */if(m&&m.tab==='bonds'&&G)return `<p class="note">Who grows closer to whom, and what each bond unlocks.</p>${vBonds()}`;return nb0?nb0.apply(this,arguments):null;};}
// Records opens on the Realms tab (the 100% tracker); Map is its own group with a World map button
{const mg0=ACT.menuGrp;ACT.menuGrp=function(g){if(g==='records'){const G0=MENU_GROUPS.find(x=>x[0]==='records');const t=(V.menuSub||{}).records;ACT.menuTab(t&&G0&&G0[2].includes(t)?t:'realms');return;}return mg0.apply(this,arguments);};}
ACT.mapWorld=function(){if(!G||V.screen!=='world')return;V.modal={type:'worldmap',from:{type:'menu',tab:'map'}};render();};
HOOK.before('modalBack','menus9','world map opened from the menu goes back to it',function(m){if(m&&m.type==='worldmap'&&m.from&&m.from.type==='menu')return HOOK.stop(()=>{V.modal={type:'menu',tab:'map'};});});
