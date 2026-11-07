// ===== guild7.js (v0.10.6): the board and the Guild Hall split, guild quests, town gated notices, arena Medals, Guides tabs =====
// Board: Quests and Bounties. Guild Hall: Guilds, Arena, Recruits, Natures (quests and bounties no longer show there).
// Two notices from the first town need the Guild Hall: Sign the guild ledger (open the Guilds board there) and First blood in the
// pit (win the Bronze Pit). A notice is only accepted in the town whose realm it belongs to (legend quests and any quest marked
// global show on every board; active and finished ones are listed everywhere, claiming stays open anywhere).
// Arena: the first win of each tier also awards a Medal, a charm equip (c_medal0 to c_medal4). Guides: Charts (the element chart
// and every reaction), Ailments, Boons and Boss gimmicks are their own tabs; Lore keeps the story (what you heard in the realms).
const G7_MEDALS=[['c_medal0',{n:'Bronze Medal',slot:'c',tier:1,hp:40,atk:4,price:300,medal:1,d:'Won in the Bronze Pit.'}],
 ['c_medal1',{n:'Silver Medal',slot:'c',tier:2,hp:60,atk:6,def:4,price:700,medal:1,d:'Won in the Silver Ring.'}],
 ['c_medal2',{n:'Gold Medal',slot:'c',tier:3,hp:90,atk:9,mag:9,def:5,price:1500,medal:1,d:'Won in the Golden Coliseum.'}],
 ['c_medal3',{n:"Champion's Medal",slot:'c',tier:4,hp:140,atk:12,mag:12,def:8,res:8,price:4000,medal:1,d:'Champion of Aurelis.'}],
 ['c_medal4',{n:'Eclipse Medal',slot:'c',tier:5,hp:200,atk:16,mag:16,def:10,res:10,spd:4,price:8000,medal:1,d:'Survived the Eclipse Gauntlet.'}]];
try{G7_MEDALS.forEach(([id,o])=>{if(!GEAR[id])addGear(id,o);});}catch(e){}
// ----- the buildings -----
{const t0=m3Tabs;m3Tabs=function(t){if(t==='board')return [['quests','Quests'],['bounties','Bounties']];if(t==='guild')return [['guilds','Guilds'],['arena','Arena'],['recruit','Recruits'],['nature','Natures']];return t0.apply(this,arguments);};}
try{if(M3_LEG.guild)delete M3_LEG.guild.personal;}catch(e){}
function g7TownStage(){try{if(WS.m&&WS.m.kind==='town')return WS.m.s|0;return (G.lastTown|0);}catch(e){return 0;}}
{const mq0=m3Quests;m3Quests=function(){const L=mq0.apply(this,arguments);try{const here=g7TownStage();return L.filter(q=>q.state!=='open'||q.type==='legend'||q.global||q.stage===here);}catch(e){return L;}};}
{const mg0=m3Guild;m3Guild=function(m){try{if(G&&m&&(m.tab==='guilds'||!m.tab)&&!G.guildSeen){G.guildSeen=1;saveGame();}}catch(e){}return mg0.apply(this,arguments);};}
// ----- the guild notices -----
HOOK.after('genQuests','guild7','notices that need the Guild Hall',function(r,s){try{if(s!==0||!G||G.daily)return;
  if(!G.quests.some(q=>q.id==='gh0'))G.quests.push({id:'gh0',stage:0,type:'guild',state:'open',title:'Sign the guild ledger',desc:'Call at the Guild Hall and read its Guilds board: three guilds with missions, ranks and perks.',reward:{gold:120,item:'potion'}});
  if(!G.quests.some(q=>q.id==='ga0'))G.quests.push({id:'ga0',stage:0,type:'arena',state:'open',title:'First blood in the pit',desc:"Win the Bronze Pit in the Guild Hall's arena: three waves, no fleeing, no rest between them.",reward:{gold:300,item:'hipotion'}});}catch(e){}});
{const qr0=questReady;questReady=function(q){if(q&&q.state==='active'){if(q.type==='guild')return !!G.guildSeen;if(q.type==='arena')return !!(G.arena&&G.arena[0]>0);}return qr0.apply(this,arguments);};}
{const nr0=nbQuestRow;nbQuestRow=function(q){let h=nr0.apply(this,arguments);try{if(q.state==='active'&&(q.type==='guild'||q.type==='arena')){const p=q.type==='guild'?(G.guildSeen?'Ledger signed':'Visit the Guild Hall'):(G.arena&&G.arena[0]>0?'Bronze Pit won':'Bronze Pit not yet won');h=h.replace(/<small>[^<]*\. Reward: /,'<small>'+p+'. Reward: ');}}catch(e){}return h;};}
// ----- Medals -----
HOOK.after('win','guild7','arena Medals',function(){try{const sp=B&&B.spec;if(!sp||sp.kind!=='arena'||!G||G.daily)return;const t=sp.tier|0,id='c_medal'+t;if(!GEAR[id])return;G.medals=G.medals||{};if(G.medals[t])return;G.medals[t]=1;G.gear.push(id);
  const info=(B&&B.result)||(V.modal&&V.modal.info);if(info){info.notes=info.notes||[];info.notes.push(`${GEAR[id].n}: a charm for the first ${ARENA[t].n} win. Equip it from the Backpack.`);}}catch(e){}});
{const na0=nbArena;nbArena=function(){let h=na0.apply(this,arguments);try{h=h.replace('<div class="rows">','<p class="note">The first win of each tier also awards a Medal, a charm your wayfarers can wear.</p><div class="rows">');}catch(e){}return h;};}
// ----- Guides -----
try{const g=MENU_GROUPS.find(x=>x[0]==='guides');if(g){['charts','ailments','boons','gimmicks'].forEach(k=>{if(!g[2].includes(k))g[2].splice(g[2].indexOf('types')<0?g[2].length:g[2].indexOf('types'),0,k);});}
  Object.assign(MENU_SUB,{charts:'Charts',ailments:'Ailments',boons:'Boons',gimmicks:'Boss gimmicks',fmis:'Guild missions'});}catch(e){}
function g7Charts(){const head=`<tr><th></th>${ELK.map(d=>`<th>${ico(d)}</th>`).join('')}</tr>`;
  const rows=ELK.map(a=>`<tr><th>${ico(a)}</th>${ELK.map(d=>{const v=CHART[a][d];return `<td class="${v>1?'s':v<1?'r':''}">${v>1?'2':v<1?'½':''}</td>`;}).join('')}</tr>`).join('');
  const reacts=ELK.map(p=>{const L=Object.keys(REACT).map(k=>REACT[k]).filter(R=>R.p===p);if(!L.length)return '';return `<div class="row"><div class="grow"><b>${ico(p)} Prime with ${EL[p]}</b>${L.map(R=>`<small>✸ ${ico(R.d)} ${EL[R.d]}: <b>${esc(R.n)}</b>, x${R.m} damage${R.splash?', splashes':''}${R.strip?', strips boons':''}${(R.fx||[]).length?', '+R.fx.map(f=>(STS[f[0]]?STS[f[0]].n:f[0])+(f[1]<1?' '+Math.round(f[1]*100)+'%':'')).join(', '):''}</small>`).join('')}</div></div>`;}).join('');
  return `<h4>Element chart</h4><p class="note">Rows attack, columns defend. 2 means double damage, ½ means half. No element is immune to anything. Against two-element foes the matchups combine.</p><div class="chartw"><table class="chart">${head}${rows}</table></div>
    <h4>Reactions</h4><p class="note">⟐ A Primer marks a foe with its element for two turns. ✸ A Detonator of any other element sets off the reaction: every prime reacts with every other element.</p><div class="rows compact">${reacts}</div>`;}
function g7Sts(bad){const ks=Object.keys(STS).filter(k=>!!STS[k].bad===bad);return `<div class="rows compact">${ks.map(k=>`<div class="row"><i class="tag sttag ${bad?'bad':'good'}" style="--c:${STS[k].c}">${stSym(k)}</i><div class="grow"><b>${esc(STS[k].n)}</b><small>${esc(STS[k].d)}</small></div></div>`).join('')}</div>`;}
function g7Gimmicks(){const D=(typeof BOSS_GIM!=='undefined'&&BOSS_GIM.def)||{};const met=k=>{try{const d=guardianDef(k);const b=d&&META.best&&META.best[d.n];return !!(b&&(b.seen||b.kills))||!!(G&&G.bossWon&&Object.keys(G.bossWon).some(x=>x.indexOf(k)>=0));}catch(e){return false;}};
  const rows=Object.keys(D).map(k=>{const g=D[k],d=guardianDef(k),seen=met(k);return `<div class="row"><div class="grow"><b>${seen?esc(d&&d.n||k):'An unmet Scourge'}: ${esc(g.n)}</b><small>${esc(g.d||'')}${g.tell?' Tell: '+esc(String(g.tell).replace('{who}','a hero'))+'.':''}${g.answer?' Answer: '+esc(g.answer)+'.':''}</small></div></div>`;}).join('');
  return `<p class="note">Every Scourge and Calamity has one realm gimmick it telegraphs a turn ahead, with a clear answer (guard, move, cleanse, or hit the right spot). Names show once you have met the boss.</p><div class="rows compact">${rows}</div>`;}
function g7Body(tab){if(tab==='charts')return g7Charts();if(tab==='ailments')return `<p class="note">Ailments hurt your heroes and foes alike. Cures, Remedies and some skills clear them; Poison, Curse and Wounds last past the fight.</p>`+g7Sts(true);
  if(tab==='boons')return `<p class="note">Boons help the one who carries them for a few turns.</p>`+g7Sts(false);if(tab==='gimmicks')return g7Gimmicks();return null;}
{const mm0=mMenu;mMenu=function(m){const b=m&&g7Body(m.tab);let h=mm0.apply(this,arguments);if(b)h=h.replace('<div class="btnrow">',b+'<div class="btnrow">');return h;};}
// Lore keeps the story: the charts and statuses moved to Guides
{const vl0=vLore;vLore=function(){let h=vl0.apply(this,arguments);try{const i=h.indexOf('<h4>Element chart</h4>');if(i>=0)h=h.slice(0,i)+`<p class="note">The element chart, every reaction, the ailments, boons and boss gimmicks are in Guides.</p>`;}catch(e){}return h;};}
