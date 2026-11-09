// v0.13.7: four new Scourges (The Locust Choir, Ironmaw Tortoise, Candleking Moth, Brinehag Matriarch), the fifth Calamity (The Hollow Sun)
// and its realm (The Ashglass Reach). Data and sprites (foes.js, art3.js, realmdata.js, bosstheme.js, lore9.js), wiring (bosses9.js), the
// Sanctum's two rows of gates (sanctum.js) and the Riftkeeper's count of every Echo (riftkeeper9.js, dynamic through echoKeys()).
// Usage: PWHTML=../../out/aurelis3.html node v138a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false}}));`;
const NEWG=['locustchoir','ironmaw','candlemoth','brinehag'],NEWF=['hollowsun'],NEW=NEWG.concat(NEWF);
(async()=>{const H=await open({w:430,h:800,mobile:true,pre:PRE});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(250);

// ---- 1. the definitions ----
let r=await ev(([G4,F1])=>{const A=__A,T=A.TW.get,GU=T('GUARDIANS'),FI=T('FINALS'),o={};
  o.gp=T('GPOOL').length;o.fp=T('FPOOL').length;o.gk=G4.every(k=>GU[k])&&G4.every(k=>T('GPOOL').includes(k));o.fk=F1.every(k=>FI[k]&&T('FPOOL').includes(k));
  const bad=[];[...G4,...F1].forEach(k=>{const d=T('guardianDef')(k);if(!d){bad.push(k+' missing');return;}
    ['n','art','el','hp','atk','def','mag','res','spd','sk','phase','intro'].forEach(f=>{if(d[f]==null)bad.push(k+'.'+f);});
    if(!(d.sk.length>=3&&d.sk.length<=4))bad.push(k+' skills '+d.sk.length);
    d.sk.forEach(s=>{if(!(typeof s[0]==='string'&&T('EL')[s[1]]&&typeof s[2]==='number'&&['one','all','self'].includes(s[3])&&['phys','mag','buff'].includes(s[4])))bad.push(k+' skill '+s[0]);});
    if(!(d.el.length===2&&d.el.every(e=>T('EL')[e])))bad.push(k+' el');
    if(d.phase&&d.phase.summon&&!T('MON')[d.phase.summon])bad.push(k+' phase summon');
    if(!T('BIG_ART').includes(d.art)||!T('MART')[d.art]||!T('MART')['echo_'+d.art]||!T('BIG_ART').includes('echo_'+d.art))bad.push(k+' art');
    if(!T('BOSS_TY')[k])bad.push(k+' BOSS_TY');if(!T('BTHEME')[k]||!T('BTHEME')[k].omen||!(T('BTHEME')[k].npc||[]).length)bad.push(k+' BTHEME');
    const g=T('BOSS_GIM').def[k];if(!g||!g.n||!g.d||!g.tell||!g.hit)bad.push(k+' gimmick');else if(g.fx==='summon'&&!T('MON')[g.mon])bad.push(k+' gimmick mon');
    const bv=T('BOV')[k];if(!bv||!T('MON')[bv.mon[0]]||!T('MON')[bv.mon[0]].ov===k&&0)bad.push(k+' BOV');
    if(T('bossClass')(k)!==(F1.includes(k)?'Calamity':'Scourge'))bad.push(k+' class');
    if(T('MATS')['es_'+k]==null)bad.push(k+' shard');});
  o.bad=bad;o.fx=!!T('CAL_FX').hollowsun&&!!T('CAL_FX').hollowsun.el;
  o.types={locustchoir:T('BOSS_TY').locustchoir,ironmaw:T('BOSS_TY').ironmaw,candlemoth:T('BOSS_TY').candlemoth};
  o.elems=[...G4,...F1].map(k=>k+':'+T('guardianDef')(k).el.join('/'));
  o.gim=[...G4,...F1].map(k=>k+':'+T('BOSS_GIM').def[k].t);return o;},[NEWG,NEWF]);
console.log(JSON.stringify(r));
chk('16 Scourges and 5 Calamities, the new ones in GUARDIANS/GPOOL and FINALS/FPOOL',r.gp===16&&r.fp===5&&r.gk&&r.fk||JSON.stringify(r));
chk('every new boss: stats, 3 to 4 skills in the usual shape, a phase, intro, sprite and Echo sprite, archetype, gimmick, overlay, theme, shard',r.bad.length===0||JSON.stringify(r.bad));
chk('archetypes: Locust Choir swarm, Ironmaw armored, Candleking flying; Calamity effect Hollow glare',r.types.locustchoir[0]==='swarm'&&r.types.ironmaw[0]==='armored'&&r.types.candlemoth[0]==='flying'&&r.fx||JSON.stringify(r));

// ---- 2. the sprites ----
r=await ev(([NEW])=>{const A=__A,T=A.TW.get,o={};const mask=c=>{const x=c.getContext('2d').getImageData(0,0,c.width,c.height).data,m=[];for(let i=3;i<x.length;i+=4)m.push(x[i]>20?1:0);return m;};
  const others=T('BIG_ART').filter(a=>!/^echo_|^riftkeeper|^o_/.test(a)&&!NEW.includes(a)&&T('MART')[a]);const om=others.map(a=>({a,m:mask(A.monCanvas(a))}));
  o.sizes={};o.err=[];o.minDiff=1;o.closest='';const bidle=T('bossIdle');
  NEW.forEach(k=>{try{const art=T('guardianDef')(k).art,c=A.monCanvas(art),m=mask(c),n=m.reduce((a,b)=>a+b,0);o.sizes[k]=[c.width,c.height,n];
    const f1=bidle(c,0,760,760),f0=bidle(c,0,0,760);if(f0===f1)o.err.push(k+' no idle frame');
    const cx=document.createElement('canvas');cx.width=cx.height=120;cx.getContext('2d').drawImage(f1,0,0,120,120);
    const ec=A.monCanvas('echo_'+art);if(ec.width!==c.width)o.err.push(k+' echo size');
    if(typeof A.monURL==='function'&&!/^data:image/.test(A.monURL(art)))o.err.push(k+' monURL');
    om.concat(NEW.filter(q=>q!==k&&q<k).map(q=>({a:q,m:mask(A.monCanvas(T('guardianDef')(q).art))}))).forEach(({a,m:m2})=>{if(m2.length!==m.length)return;let d=0;for(let i=0;i<m.length;i++)if(m[i]!==m2[i])d++;const fr=d/Math.max(n,1);if(fr<o.minDiff){o.minDiff=fr;o.closest=k+' vs '+a;}});
  }catch(e){o.err.push(k+': '+e.message);}});return o;},[NEW]);
console.log(JSON.stringify(r));
chk('each new boss sprite is 60x60, solid, has a second idle frame, and its Echo form and the boss canvas render without errors',!r.err.length&&NEW.every(k=>r.sizes[k]&&r.sizes[k][0]===60&&r.sizes[k][1]===60&&r.sizes[k][2]>900)||JSON.stringify(r));
chk('silhouettes are unique: no new sprite is within 12% of another boss sprite (silhouette pixels that differ, as a share of its own)',r.minDiff>.12||JSON.stringify(r));

// ---- 3. the realm ----
r=await ev(()=>{const A=__A,T=A.TW.get,R=T('REALMS'),cal=R.filter(x=>x.cal),n=cal.find(x=>x.key==='ashglass'),ref=cal.find(x=>x.key==='ashen'),o={};
  o.cals=cal.map(x=>x.key);o.missing=n?Object.keys(ref).filter(k=>!(k in n)&&k!=='quest').concat(Object.keys(ref.lean).filter(k=>!(k in n.lean)).map(k=>'lean.'+k)):['no entry'];
  if(n){o.idx=n.idx;o.inCal=T('REALM_CAL').includes(n.idx);o.nCal=T('REALM_CAL').length;o.inZones=T('ZONES')[n.idx]===n;o.wx=!!T('WX_TABLE')[n.wxk]&&!!T('SUPER_TABLE')[n.wxk];
    o.facts=[n.n,n.town,n.dungeon,n.mat,n.theme,n.els.join('/'),n.npc.length,n.quests.length,n.pool.length,n.favor.join('/')];
    o.pool=n.pool.filter(k=>!T('MON')[k]);o.wxk=n.wx.map(w=>w[0]).filter(w=>!(w in (T('WX_TABLE').rlm_ashglass?{}:{}))&&false);
    o.intro=n.intro.length>120&&n.win.length>60;o.mat=!!T('MATS')[n.mat];o.theme=!!T('THEME')[n.theme];o.quest=n.quests.every(q=>q.t&&q.d&&(q.mon?T('MON')[q.mon]:q.mat));
    o.lore=T('LORE_REALM').ashglass;o.bov=Object.keys(T('BOV')).length;o.looks=!!T('LOOK9').ashglass&&!!T('D8_REALM').ashglass;o.stdN=T('REALM_STD').length;}
  return o;});
console.log(JSON.stringify(r).slice(0,900));
chk('The Ashglass Reach is a Calamity realm with every field of the others and in REALM_CAL (5 of them)',r.cals&&r.cals.length===5&&!r.missing.length&&r.inCal&&r.nCal===5&&r.inZones&&r.wx||JSON.stringify(r));
chk('its town, dungeon, material, theme, elements, 3 townsfolk lines, 2 quests, pool of 5 known foes, intro and win text',r.facts&&r.facts[0]==='The Ashglass Reach'&&r.facts[1]==='Saltwick'&&r.facts[2]==='The Glass Cathedral'&&r.facts[3]==='dust'&&r.facts[6]===3&&r.facts[7]===2&&r.facts[8]===5&&!r.pool.length&&r.intro&&r.mat&&r.theme&&r.quest||JSON.stringify(r));
chk('a Lore entry (history, customs, folk) and a dungeon and ground look exist for it; 12 standard realms unchanged',r.lore&&r.lore.hist&&r.lore.custom&&r.lore.folk&&r.looks&&r.stdN===12||JSON.stringify(r));

// ---- 4. new journeys draw the new realm and bosses ----
r=await ev(([NEW])=>{const A=__A,T=A.TW.get,STD=T('REALM_STD'),CAL=T('REALM_CAL'),FP=T('FPOOL'),GP=T('GPOOL'),NR=T('newRun'),asIdx=T('REALMS').find(x=>x.key==='ashglass').idx,o={boss:{},cal:{},bad:[],n:600};
  NEW.forEach(k=>o.boss[k]=0);CAL.forEach(i=>o.cal[i]=0);const dn=Date.now;
  try{for(let k=0;k<o.n;k++){Date.now=()=>1700000000000+k*86400003;const r=NR(0);
    if(r.order.length!==5||new Set(r.order).size!==5||!r.order.slice(0,4).every(i=>STD.includes(i))||!CAL.includes(r.order[4])||r.bosses.length!==4||new Set(r.bosses).size!==4||!r.bosses.every(b=>GP.includes(b))||!FP.includes(r.final)){if(o.bad.length<3)o.bad.push(JSON.stringify(r));}
    r.bosses.concat([r.final]).forEach(b=>{if(b in o.boss)o.boss[b]++;});o.cal[r.order[4]]++;}}finally{Date.now=dn;}
  o.asIdx=asIdx;return o;},[NEW]);
console.log(JSON.stringify(r));
chk(`${r.n} seeded journeys: every one valid (5 distinct realms, 4 standard then 1 Calamity realm, 4 Scourges, 1 Calamity)`,!r.bad.length||JSON.stringify(r));
chk('each new Scourge and the Hollow Sun is drawn at least once, and every Calamity realm including The Ashglass Reach',NEW.every(k=>r.boss[k]>0)&&Object.values(r.cal).every(n=>n>0)&&r.cal[r.asIdx]>0||JSON.stringify(r));

// ---- 5. old saves and gates that count Scourges ----
r=await ev(()=>{const A=__A,T=A.TW.get,G=A.G,o={},run0=JSON.parse(JSON.stringify(G.run)),st0=G.stage;
  const ashen=T('REALMS').find(x=>x.key==='ashen').idx;
  G.run=Object.assign({},run0,{order:[0,1,2,3,ashen],bosses:['thornwarden','drake','cinderking','hoarwyrm'],final:'dimmer',rv:2,lay3:1});G.stage=4;
  try{T('syncPools')();o.zs=T('ZS')(4).key;o.fin=T('bossKeyFor')(4);o.b0=T('bossKeyFor')(0);o.pool=T('ZS')(4).pool.every(k=>T('MON')[k]);
    o.calfx=!!(T('calFxAt')(4)&&T('calFxAt')(4).key==='dimmer');o.bov=!!T('bovAt')(0);}catch(e){o.err=e.message;}
  o.arena=T('ARENA').map(a=>a.min);G.run=run0;G.stage=st0;
  const allPools=T('REALMS').every(R=>R.pool.every(k=>T('MON')[k]));o.allPools=allPools;return o;});
console.log(JSON.stringify(r));
chk('a journey drawn before keeps its order, bosses and Calamity effect (no new boss or realm appears in it)',!r.err&&r.zs==='ashen'&&r.fin==='dimmer'&&r.b0==='thornwarden'&&r.pool&&r.calfx&&r.bov||JSON.stringify(r));
chk('Scourge-count gates still reachable (Arena tiers need at most 5 cleared) and every realm foe pool is made of known foes',r.arena.every(n=>n<=5)&&r.allPools||JSON.stringify(r));

// ---- 6. the Realms tracker, Lore book, Bestiary ----
r=await ev(([NEW])=>{const A=__A,T=A.TW.get,G=A.G,o={},run0=JSON.parse(JSON.stringify(G.run)),st0=G.stage;
  const idx=T('REALMS').find(x=>x.key==='ashglass').idx;G.run=Object.assign({},run0,{order:[0,1,2,3,idx],bosses:['locustchoir','ironmaw','candlemoth','brinehag'],final:'hollowsun',rv:2});G.stage=4;
  try{T('syncPools')();const lore=T('vLoreBook')();o.lore=/The Ashglass Reach/.test(lore)&&/Saltwick/.test(lore)&&/Glass Cathedral/.test(lore)&&/hollow/i.test(lore);
    const rl=T('vRealms')();o.realms=/Ashglass Reach/.test(rl);o.names=[0,1,2,3,4].map(s=>T('guardianDef')(T('bossKeyFor')(s)).n).join('|');
    const ba=T('bestAll')(),ks=ba.map(x=>x.k);o.best=NEW.every(k=>ks.includes(k)&&ks.includes('echo_'+k));o.ov=NEW.every(k=>ks.includes(T('BOV')[k].mon[0]));
    const m=T('mBeast')({k:'hollowsun'});o.beast=typeof m==='string'&&/Hollow Sun/.test(m);
    G.mats=G.mats||{};o.zone=T('ZS')(4).n;o.cal=(T('calFxAt')(4)||{}).n;o.shot=T('bossClass')('hollowsun');}catch(e){o.err=e.message;}
  G.run=run0;G.stage=st0;T('syncPools')();return o;},[NEW]);
console.log(JSON.stringify(r));
chk('Lore book has The Ashglass Reach (town, dungeon, history); the Realms tracker lists it',!r.err&&r.lore&&r.realms||JSON.stringify(r));
chk('Bestiary lists the five bosses, their Echoes and their overlay foes; the beast card renders; the Calamity effect shows',!r.err&&r.best&&r.ov&&r.beast&&r.cal==='Hollow glare'||JSON.stringify(r));

// ---- 7. the Echo Sanctum and the Riftkeeper ----
r=await ev(()=>{const A=__A,T=A.TW.get,G=A.G,META=A.META,o={};G.won=true;G.echoStory={0:1,1:1,2:1,3:1,4:1};
  const total=T('echoKeys')().length;o.total=total;A.resetMaps&&0;const m=T('buildSanctum')();
  const gates=m.npcs.filter(n=>n.portal&&!n.forge&&n.key!=='__riftkeeper');o.gates=gates.length;o.keys=new Set(gates.map(n=>n.key)).size;
  o.all=T('GPOOL').concat(T('FPOOL')).every(k=>gates.some(n=>n.key===k));o.cal=gates.filter(n=>n.cal).length;
  const pos=new Set(m.npcs.map(n=>n.x+','+n.y));o.overlap=m.npcs.length-pos.size;
  const rk=m.npcs.find(n=>n.key==='__riftkeeper');o.rk=!!rk;
  // reachability: every gate has a walkable approach tile
  A.getMap&&0;const W=m.w,Hh=m.h,solid=(x,y)=>{const c=m.t[y][x];return c==='#'||m.npcs.some(n=>n.x===x&&n.y===y)||c==='v'||c==='P';};
  const seen=m.t.map(r=>r.map(()=>false)),Q=[m.start.slice()];seen[m.start[1]][m.start[0]]=true;for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=Hh||seen[ny][nx]||solid(nx,ny))continue;seen[ny][nx]=true;Q.push([nx,ny]);}}
  o.reach=m.npcs.filter(n=>n.portal).every(n=>seen[n.y<9?n.y+1:n.y-1][n.x]);
  // the Riftkeeper's card counts every Echo
  const b0=JSON.stringify(META.best||{});META.best=META.best||{};const ks=T('echoKeys')();
  ks.slice(0,total-1).forEach(k=>{META.best['Echo '+T('guardianDef')(k).n]={seen:1,kills:1,scan:0,known:{}};});
  o.have1=T('rkUnlocked')();o.txt1=T('mRiftkeeper')().replace(/<[^>]+>/g,' ');
  META.best['Echo '+T('guardianDef')(ks[total-1]).n]={seen:1,kills:1,scan:0,known:{}};
  o.have2=T('rkUnlocked')();o.txt2=T('mRiftkeeper')().replace(/<[^>]+>/g,' ');o.dis2=/disabled/.test(T('mRiftkeeper')());
  META.best=JSON.parse(b0);return o;});
console.log(JSON.stringify(r).slice(0,700));
chk(`the Sanctum has one gate per Echo (${r.total}): ${r.gates} gates, ${r.keys} distinct, every Scourge and Calamity present, none overlapping, all reachable`,r.total===21&&r.gates===21&&r.keys===21&&r.all&&r.cal===5&&r.overlap===0&&r.reach&&r.rk||JSON.stringify(r));
chk('the Riftkeeper gate counts every Echo dynamically: sealed at 20 of 21, open at 21 of 21',!r.have1&&/20 of 21 Echoes beaten/.test(r.txt1)&&r.have2&&!r.dis2||JSON.stringify([r.have1,r.have2,r.dis2,r.txt1.slice(0,300)]));

// ---- 8. every new boss can be fought (story spec, then the Echo spec) ----
for(const k of NEW){
  const fin=NEWF.includes(k),s=fin?4:1;
  r=await ev(([k,s,fin])=>{const A=__A,T=A.TW.get,G=A.G,o={};
    G.party.forEach(id=>{const c=G.roster[id];c.lv=40;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
    if(fin)G.run.final=k;else G.run.bosses[s]=k;G.stage=s;A.setPause(40);
    const ok=A.startBattle({stage:s,kind:'boss'});const B=A.B;o.ok=!!ok&&!!B;if(!B)return o;
    const e=B.en[0];o.key=e.key;o.boss=!!e.boss;o.art=e.art;o.name=e.name;o.mhp=e.S.mhp;o.fin=!!e.final;o.gim=!!(A.B4.gim()&&A.B4.gim().D);
    A.render();o.drawn=!!document.querySelector('#app')&&document.querySelector('#app').innerHTML.length>500;
    B.en[0].S.mhp=B.en[0].hp=Math.max(B.en[0].hp,6000);G.bossWon=G.bossWon||{};G.bossWon[T('bossFightKey')(B.spec)]=1;
    A.V.auto=true;B.auto=true;B.mode='wait';T('advance')();return o;},[k,s,fin]);
  await wait(4500);
  const q=await ev(()=>{const A=__A,B=A.B,e=B&&B.en&&B.en[0];const o={turns:e?e.turns:-1,over:B&&B.over,log:B?B.log.length:0};A.setPause(999999);if(B&&!B.over){B.auto=false;A.V.auto=false;}try{A.finishBattle('x');}catch(x){o.fin=x.message;}A.V.modal=null;A.V.auto=false;return o;});
  console.log(k,JSON.stringify(r),JSON.stringify(q));
  chk(`${k}: starts as a boss fight through the story spec with its own sprite and name`,r.ok&&r.key===k&&r.boss&&r.art===(k==='hollowsun'?'hollowsun':k)&&r.mhp>0&&r.drawn||JSON.stringify(r));
  chk(`${k}: auto turns run (boss turns ${q.turns}), gimmick wired: ${r.gim}`,q.turns>=2&&r.gim||q.over&&r.gim||JSON.stringify(q));
  const e2=await ev(([k])=>{const A=__A,T=A.TW.get;A.G.party.forEach(id=>{const c=A.G.roster[id];c.hp=c.S.mhp;c.mp=c.S.mmp;c.st={};});A.setPause(999999);
    const ok=A.startBattle(T('riftSpec')(k));const B=A.B,e=B&&B.en[0];const o={ok:!!ok&&!!B,echo:e&&e.echo,art:e&&e.art,name:e&&e.name,sk:e&&e.sk.length};if(B){A.render();o.drawn=document.querySelector('#app').innerHTML.length>500;try{A.finishBattle('x');}catch(x){o.fin=x.message;}A.V.modal=null;}return o;},[k]);
  chk(`${k}: its Echo can be fought (rift spec): Echo ${k} with the violet sprite and an extra skill`,e2.ok&&e2.echo&&/^echo_/.test(e2.art)&&/^Echo /.test(e2.name)&&e2.drawn||JSON.stringify(e2));
}
// ---- 9. the realm's own maps build and draw (town, field, dungeon, caves) under the new look ----
r=await ev(()=>{const A=__A,T=A.TW.get,G=A.G,o={err:[],maps:[]},idx=T('REALMS').find(x=>x.key==='ashglass').idx,run0=JSON.parse(JSON.stringify(G.run)),st0=G.stage;
  G.run=Object.assign({},run0,{order:[0,1,2,3,idx],bosses:['locustchoir','ironmaw','candlemoth','brinehag'],final:'hollowsun',rv:2,lay3:1,tv:2});G.stage=4;A.resetMaps();T('syncPools')();
  try{const f=A.getMap('f4');const ids=['t4','f4','d4'].concat((f.caves||[]).map(c=>c.id));
    ids.forEach(id=>{try{const m=A.getMap(id);o.maps.push(id+':'+m.kind+':'+(m.theme||''));if(!m.t||!m.t.length)o.err.push(id+' empty');}catch(e){o.err.push(id+': '+e.message);}});
    o.zone=T('ZS')(4).town;const k=T('guardianDef')(T('bossKeyFor')(4));o.boss=k.n;o.look=T('realmVariant')(T('ZS')(4).theme,T('ZS')(4));o.wx=T('WX_TABLE')[T('ZS')(4).wxk].length;}catch(e){o.err.push(e.message);}
  A.placeAt&&A.placeAt('t4',10,10,'d');o.drawn=true;try{A.render();}catch(e){o.err.push('render '+e.message);}
  return o;});
await wait(400);
console.log(JSON.stringify(r));
chk('The Ashglass Reach town, field, dungeon and caves build and draw (the new look, Saltwick, its boss overlay)',!r.err.length&&r.maps.length>=3&&r.zone==='Saltwick'&&r.boss==='The Hollow Sun'||JSON.stringify(r));
await done(H);})();
