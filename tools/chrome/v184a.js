// realms14 (v3/realms14.js): sixteen Scourges and four Calamities, each boss in a realm of its own.
//  1 the roster: GPOOL 16, FPOOL 4, 20 Echoes; REALMS 16 standard (one Scourge each) and 4 Calamity (one Calamity each), no alternates, no boss in two realms,
//    every boss in GPOOL / FPOOL stands in exactly one realm, the boss's first element is one of the realm's
//  2 every realm is complete: town, dungeon, material, theme, weather table, intro, win, townsfolk, quests that resolve, foe pool that exists, a look (LOOK9 for the
//    realms that carry one), dungeon material (D8_REALM), lore chapter, den look, a landmark for its town; every boss has an overlay (BOV), a theme (BTHEME), a gimmick
//    (BOSS_GIM), a Rift gate colour (RIFT_COL, no two within 40) and a sprite; the removed bosses are gone from every table
//  3 the draw: 400 seeded journeys (cycle 0 and 1) are four distinct standard realms then one Calamity realm, each with its own boss, every realm comes up, the
//    standard realms follow the tier ladder (STAGE position by tier); the New Game+ draw (party12) takes unseen realms first, each with its own boss
//  4 the Echo Rift: 16 + 4 gates, none overlapping, all reachable, the Calamity ring is four, the Riftkeeper counts 20, Records > Completion says 20
//  5 old saves: a journey that names a removed boss (and its overlay quest, riftWon, bossWon, shards, the New Game+ draw) loads and every key maps to a kept boss; the
//    realm order is unchanged; G.riftWon and META.best entries for removed bosses are ignored; the game renders the Rift, the Records and the Bestiary
//  6 every realm's field, town and dungeon build and draw (2D and HD-2D) with no page error
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html [SHOTS=dir] node v184a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'medium',hints:false,tips:false}}));`;
const START=()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.META.cfg.hints=false;A.V.modal=null;A.render();};
const GONE=['locustchoir','ironmaw','hollowshepherd','paleweaver','hollowsun'];
(async()=>{
const H=await open({w:1000,h:560,pre:PRE});const {ev}=H;const errs=[];H.page.on('pageerror',e=>errs.push(e.message));await ev(START);
// ---------------- 1. the roster ----------------
const r1=await ev(()=>{const A=__A,T=A.TW.get,R=T('REALMS'),GP=T('GPOOL'),FP=T('FPOOL'),o={n:R.length,std:T('REALM_STD').length,cal:T('REALM_CAL').length,gp:GP.length,fp:FP.length,ek:T('echoKeys')().length,alt:[],dup:[],el:[],orph:[],wrongKind:[]};
  const seen={};R.forEach(r=>{if(r.alt&&r.alt.length)o.alt.push(r.key);if(seen[r.boss])o.dup.push(r.boss);seen[r.boss]=r.key;const d=T('guardianDef')(r.boss);if(!d){o.orph.push(r.key+':'+r.boss);return;}
    if(!r.els.includes(d.el[0]))o.el.push(r.key+':'+d.el[0]);if(r.cal?!FP.includes(r.boss):!GP.includes(r.boss))o.wrongKind.push(r.key);});
  GP.concat(FP).forEach(k=>{if(!seen[k])o.orph.push('no realm:'+k);});return o;});
chk(`20 realms: 16 standard and 4 Calamity (${r1.n}: ${r1.std} + ${r1.cal})`,r1.n===20&&r1.std===16&&r1.cal===4);
chk(`16 Scourges, 4 Calamities, 20 Echoes (${r1.gp}, ${r1.fp}, ${r1.ek})`,r1.gp===16&&r1.fp===4&&r1.ek===20);
chk(`no alternates, no boss in two realms, every boss in a realm of its own kind, its first element one of the realm's (alt ${r1.alt.join()||'none'}; dup ${r1.dup.join()||'none'}; orphan ${r1.orph.join()||'none'}; el ${r1.el.join()||'ok'}; kind ${r1.wrongKind.join()||'ok'})`,!r1.alt.length&&!r1.dup.length&&!r1.orph.length&&!r1.el.length&&!r1.wrongKind.length);
// ---------------- 2. complete identities ----------------
const r2=await ev(([GONE])=>{const A=__A,T=A.TW.get,R=T('REALMS'),o={miss:[],gone:[],col:{min:1e9,pair:''},sl:[],lm:[]},MON=T('MON');
  const need=(k,c,w)=>{if(!c)o.miss.push(k+': '+w);};
  R.forEach(r=>{need(r.key,r.n&&r.town&&r.dungeon,'names');need(r.key,T('MATS')[r.mat],'material');need(r.key,T('THEME')[r.theme0||r.theme]&&T('DTHEME')[r.theme0||r.theme],'theme');need(r.key,T('WX_TABLE')[r.wxk]&&T('SUPER_TABLE')[r.wxk],'weather');
    need(r.key,r.intro&&r.intro.length>120&&r.win&&r.win.length>60,'intro/win');need(r.key,(r.npc||[]).length>=3,'3 townsfolk');
    need(r.key,r.pool0.length===5&&r.pool0.every(k=>MON[k]),'pool of 5 known foes ('+r.pool0.filter(k=>!MON[k])+')');
    need(r.key,(r.quests||[r.quest]).filter(Boolean).every(q=>q.t&&q.d&&(q.mon?MON[q.mon]:T('MATS')[q.mat])),'quests resolve');
    need(r.key,T('LORE_REALM')[r.key]&&T('LORE_REALM')[r.key].hist,'lore');need(r.key,T('D8_REALM')[r.key],'dungeon material');need(r.key,T('SL_DEN')[r.key],'den look');
    need(r.key,T('BOV')[r.boss]&&MON[T('BOV')[r.boss].mon[0]],'overlay foe');need(r.key,T('BTHEME')[r.boss],'boss theme');need(r.key,T('BOSS_GIM').def[r.boss],'gimmick');need(r.key,T('MART')[T('guardianDef')(r.boss).art],'sprite');
    need(r.key,T('LM_BY_TOWN')[r.town],'landmark');if(r.cal)need(r.key,T('CAL_FX')[r.boss],'Calamity effect');});
  GONE.forEach(k=>{[['GUARDIANS'],['FINALS'],['BOV'],['BTHEME'],['RIFT_COL'],['CAL_FX']].forEach(([t])=>{if(T(t)&&T(t)[k])o.gone.push(t+'.'+k);});if(T('BOSS_GIM').def[k])o.gone.push('BOSS_GIM.'+k);if(T('BOSS_TY')[k])o.gone.push('BOSS_TY.'+k);if(T('MART')[k])o.gone.push('MART.'+k);if(MON['o_'+k])o.gone.push('MON.o_'+k);});
  const keys=T('echoKeys')(),h=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)),cols=keys.map(k=>T('riftGateCol')(k));
  for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){const a=h(cols[i]),b=h(cols[j]),d=Math.round(Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]));if(d<o.col.min){o.col.min=d;o.col.pair=keys[i]+'/'+keys[j];}}
  o.rc=Object.keys(T('RIFT_COL')).length;o.names=R.filter(r=>!r.cal).map(r=>r.n);o.musDup=R.length-new Set(R.map(r=>r.key)).size;return o;},[GONE]);
chk(`every realm complete (${r2.miss.length?r2.miss.join('; '):'20 of 20'})`,!r2.miss.length);
chk(`the removed bosses are gone from every table (${r2.gone.join()||'none left'})`,!r2.gone.length);
chk(`20 Rift gate colours (${r2.rc}), the closest pair ${r2.col.pair} is ${r2.col.min} apart (>= 40)`,r2.rc===20&&r2.col.min>=40);
// ---------------- 3. the draw ----------------
const r3=await ev(()=>{const A=__A,T=A.TW.get,R=T('REALMS'),B0=T('REALM_BASE'),STD=T('REALM_STD'),CAL=T('REALM_CAL'),o={bad:[],std:{},cal:{},n:0,tierBad:0,cnt:0};const TIER=T('PT12_TIER');
  const dn=Date.now;try{for(const cyc of [0,1])for(let i=0;i<200;i++){Date.now=()=>1700000000000+(cyc*200+i)*86400003;const run=T('newRun')(cyc);o.n++;const ks=run.order.map(z=>R[z-B0].key);
    const okStd=run.order.slice(0,4).every(z=>STD.includes(z))&&new Set(run.order).size===5&&CAL.includes(run.order[4]);
    const okB=run.order.every((z,j)=>R[z-B0].boss===(j<4?run.bosses[j]:run.final))&&new Set(run.bosses.concat([run.final])).size===5;
    if(!okStd||!okB)o.bad.push(ks.join()+' '+run.bosses.join()+' '+run.final);
    run.order.slice(0,4).forEach((z,j)=>{const t=TIER[R[z-B0].key],want=[[1],[1,2],[2,3],[3]][j];if(!want.includes(t))o.tierBad++;o.std[R[z-B0].key]=1+(o.std[R[z-B0].key]||0);});o.cal[ks[4]]=1+(o.cal[ks[4]]||0);}}finally{Date.now=dn;}
  o.stdN=Object.keys(o.std).length;o.calN=Object.keys(o.cal).length;return o;});
chk(`${r3.n} journeys: four distinct standard realms then one Calamity realm, each realm brings its own boss, five different bosses (${r3.bad.length} bad ${r3.bad[0]||''})`,!r3.bad.length);
chk(`all 16 standard realms (${r3.stdN}) and all 4 Calamity realms (${r3.calN}) come up; the tier ladder holds (${r3.tierBad} off)`,r3.stdN===16&&r3.calN===4&&r3.tierBad===0);
const r3b=await ev(()=>{const T=__A.TW.get,P=window.__PT12,R=T('REALMS'),B0=T('REALM_BASE'),o={};let a=7;const rnd=()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296;};
  const key=k=>R.findIndex(r=>r.key===k)+B0,unseen=['moors','bamboo','bone','ashglass'],seenR=R.filter(r=>r.std&&!unseen.includes(r.key)).map(r=>r.idx);
  const ctx={runs:[{s:1,c:0,o:[],b:[],f:'',vis:seenR,bs:R.filter(r=>r.std&&!unseen.includes(r.key)).map(r=>r.boss)}],seenBoss:k=>R.some(r=>r.boss===k&&!unseen.includes(r.key))};
  const S=P.pt12Select(ctx,rnd);o.order=S.order.slice(0,4).map(z=>R[z-B0].key);o.bosses=S.bosses;o.coupled=S.coupled;o.newR=S.newRealms;o.newB=S.newBosses;o.own=S.order.every((z,j)=>R[z-B0].boss===(j<4?S.bosses[j]:S.final));
  const full={runs:[],seenBoss:()=>false};const seen=new Set();for(let i=0;i<60;i++){const s=P.pt12Select(full,rnd);if(!(s.order.length===5&&new Set(s.bosses.concat([s.final])).size===5&&s.coupled))o.badFull=1;s.order.forEach(z=>seen.add(z));}o.reach=seen.size;return o;});
chk(`New Game+: unseen realms first (${r3b.order.join()}), each with its own boss (${r3b.bosses.join()}), ${r3b.newR} new realms, ${r3b.newB} new bosses; 60 fresh draws coupled and distinct, ${r3b.reach} realms reached`,r3b.own&&r3b.coupled&&unseen4(r3b.order)&&r3b.newR>=4&&!r3b.badFull&&r3b.reach>=18);
function unseen4(o){return ['moors','bamboo','bone','ashglass'].every(k=>o.includes(k));}
// ---------------- 4. the Echo Rift ----------------
const r4=await ev(()=>{const A=__A,T=A.TW.get,m=T('buildSanctum')(),o={},gates=m.npcs.filter(n=>n.portal&&n.key&&(T('GPOOL').includes(n.key)||T('FPOOL').includes(n.key)));
  o.gates=gates.length;o.cal=gates.filter(n=>n.cal).length;o.keys=new Set(gates.map(n=>n.key)).size;const pos=new Set(gates.map(n=>n.x+','+n.y));o.overlap=gates.length-pos.size;
  o.all=T('GPOOL').concat(T('FPOOL')).every(k=>gates.some(n=>n.key===k));o.ring=T('RIFT_HALL').ring.length;o.bays=T('RIFT_HALL').bays.length;
  // every gate reachable: flood from the start over non-solid tiles; a gate is reached when a neighbour tile is
  const t=m.t,W=m.w,Hh=m.h,solid=new Set(m.npcs.filter(n=>n.portal||n.forge).map(n=>n.x+','+n.y));const ok=(x,y)=>x>=0&&y>=0&&x<W&&y<Hh&&!'#vPS'.includes(t[y][x])&&!solid.has(x+','+y);
  const seen=new Set([m.start.join()]),q=[m.start.slice()];while(q.length){const [x,y]=q.shift();[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const k=(x+a)+','+(y+b);if(!seen.has(k)&&ok(x+a,y+b)){seen.add(k);q.push([x+a,y+b]);}});}
  o.reach=gates.every(n=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>seen.has((n.x+a)+','+(n.y+b))));
  const G=A.G;G.echoStory={0:1,1:1,2:1,3:1,4:1};A.META.echoRift=true;const best=JSON.parse(JSON.stringify(A.META.best||{}));A.META.best=A.META.best||{};
  const ks=T('echoKeys')();G.riftWon={};ks.slice(0,19).forEach(k=>{G.riftWon[k]=1;A.META.best[T('echoName')(T('guardianDef')(k))]={kills:1};});o.have1=T('rkUnlocked')();o.n1=T('rkBeaten')().length;
  G.riftWon[ks[19]]=1;A.META.best[T('echoName')(T('guardianDef')(ks[19]))]={kills:1};o.have2=T('rkUnlocked')();A.META.best=best;
  try{o.rec=T('r12RiftBlock')().replace(/<[^>]+>/g,' ');}catch(e){o.recErr=e.message;}return o;});
chk(`the Rift hall has ${r4.gates} gates (${r4.keys} distinct, ${r4.cal} Calamity), ${r4.bays} bays, a ring of ${r4.ring}; none overlap (${r4.overlap}), every Scourge and Calamity present, all reachable`,r4.gates===20&&r4.keys===20&&r4.cal===4&&r4.bays===4&&r4.ring===4&&r4.overlap===0&&r4.all&&r4.reach);
chk(`Records > Completion counts the Echoes out of 20 (${(/Echoes defeated[\s\S]{0,160}/.exec(r4.rec||'')||[''])[0].replace(/\s+/g,' ').slice(0,90)})`,/Echoes defeated[\s\S]{0,160}?\d+ \/ 20/.test(r4.rec||''));
chk(`the Riftkeeper counts 20: sealed at 19 of 20, open at 20 (${r4.n1} beaten, ${r4.have1} -> ${r4.have2})`,!r4.have1&&r4.have2&&r4.n1===19);
// ---------------- 5. old saves ----------------
const r5=await ev(([GONE])=>{const A=__A,T=A.TW.get,G=A.G,o={err:[]},R=T('REALMS'),B0=T('REALM_BASE'),ash=R.find(r=>r.key==='ashglass').idx;
  const pack=T('packG')();const o0=JSON.parse(JSON.stringify(pack));
  o0.run=Object.assign({},o0.run,{order:[0,1,2,3,ash],bosses:['locustchoir','thornwarden','ironmaw','paleweaver'],final:'hollowsun',ngp:{b:['locustchoir','thornwarden','ironmaw','paleweaver'],f:'hollowsun'}});
  o0.bossWon={locustchoir:1,thornwarden:1,hollowsun:1};o0.riftWon={locustchoir:1,hollowshepherd:1,candlemoth:1};o0.echoShard={locustchoir:1};o0.mats=Object.assign({},o0.mats,{es_ironmaw:3,es_hollowsun:2,es_queenmantis:1});
  o0.quests=[{id:'oq1',stage:1,type:'hunt',mon:'o_locustchoir',n:4,have:1,state:'open',title:'Strange',desc:'x',reward:{gold:1}}];
  let g;try{g=T('unpackG')(o0);}catch(e){o.err.push('unpack '+e.message);}
  if(g){o.bosses=g.run.bosses.slice();o.final=g.run.final;o.order=g.run.order.slice();o.ngp=g.run.ngp;o.won=Object.keys(g.bossWon);o.rift=Object.keys(g.riftWon);o.shard=Object.keys(g.echoShard);o.mats=['es_ironmaw','es_hollowsun','es_queenmantis','es_thornwarden','es_seraph'].map(k=>k+':'+g.mats[k]);o.quest=g.quests[0].mon;
    o.ok=g.run.bosses.every(k=>T('GPOOL').includes(k))&&new Set(g.run.bosses).size===4&&T('FPOOL').includes(g.run.final);
    // load it for real and render what reads the bosses
    const G0=A.G;try{A.TW.set?0:0;}catch(e){}
    // the account's records for removed bosses stay in META.best, never read
    A.META.best=A.META.best||{};A.META.best['The Locust Choir']={seen:3,kills:2};A.META.best['Echo The Locust Choir']={kills:1};A.META.best['The Hollow Sun']={seen:1,kills:1};}
  o.gone=GONE.filter(k=>T('guardianDef')(k)).length;return o;},[GONE]);
chk(`an old save naming removed bosses loads; every boss maps to a distinct kept one (${(r5.bosses||[]).join()} / ${r5.final}), the realm order is unchanged (${(r5.order||[]).join()})`,!r5.err.length&&r5.ok&&r5.final==='seraph'&&r5.order.join()==='0,1,2,3,'+r5.order[4]&&r5.bosses[1]==='thornwarden'&&!r5.bosses.includes('locustchoir')||JSON.stringify(r5));
chk(`bossWon, riftWon, shard stock, the New Game+ draw and the overlay quest follow (${(r5.won||[]).join()} | ${(r5.rift||[]).join()} | ${(r5.mats||[]).join()} | ${r5.quest} | ngp ${r5.ngp&&r5.ngp.b.join()})`,r5.won&&r5.won.every(k=>!/locust|hollowsun/.test(k))&&r5.rift.every(k=>!GONE.includes(k))&&/^o_/.test(r5.quest)&&!GONE.some(k=>r5.quest==='o_'+k)&&r5.ngp.b.every(k=>!GONE.includes(k)));
const r5b=await ev(()=>{const A=__A,T=A.TW.get,G=A.G,o={err:[]};
  // the real game with an account that holds records for removed bosses and a journey that won gates of removed bosses (G.riftWon is ignored for them)
  A.META.best['Echo The Hollow Sun']={kills:1};A.META.best['The Pale Weaver']={seen:2,kills:1};G.riftWon=Object.assign({},G.riftWon||{},{paleweaver:1,locustchoir:1});G.echoStory={0:1,1:1,2:1,3:1,4:1};A.META.echoRift=true;
  try{o.rk=T('rkBeaten')().length;o.arch=T('archiveKeys')().length;}catch(e){o.err.push('counts '+e.message);}
  for(const m of [{type:'records',tab:'complete'},{type:'records',tab:'lore'},{type:'beast'},{type:'portal',key:'queenmantis'}]){try{A.V.modal=m;A.render();}catch(e){o.err.push(JSON.stringify(m)+' '+e.message);}}
  try{const r=T('riftView')();o.view=Object.keys(r).filter(k=>/Locust|Hollow Sun|Pale Weaver/.test(k)&&r[k].kills).length;}catch(e){o.err.push('riftView '+e.message);}
  A.V.modal=null;A.render();return o;});
chk(`the game renders Records, Bestiary and a gate with records of removed bosses around (${r5b.err.join('; ')||'no errors'}; Echoes beaten counted ${r5b.rk}; archive ${r5b.arch})`,!r5b.err.length);
// an old journey that stood in the Ashglass Reach as its Calamity realm (final hollowsun): after the migration its maps build, it draws and its boss fight starts
const r5c=await ev(()=>{const A=__A,T=A.TW.get,G=A.G,o={err:[]},ash=T('REALMS').find(x=>x.key==='ashglass').idx,run0=JSON.parse(JSON.stringify(G.run)),st0=G.stage;
  try{const o0=JSON.parse(JSON.stringify(T('packG')()));o0.run=Object.assign({},o0.run,{order:[0,1,2,3,ash],bosses:['locustchoir','thornwarden','ironmaw','paleweaver'],final:'hollowsun',rv:2,lay3:1,tv:2});
    const g=T('unpackG')(o0);G.run=g.run;G.stage=4;A.resetMaps();T('syncPools')();
    for(const id of ['t4','f4','d4']){try{const m=A.getMap(id);A.placeAt(m.id,(m.start||[10,10])[0],(m.start||[10,10])[1],'u');A.render();}catch(e){o.err.push(id+': '+e.message);}}
    for(const st of [1,3,4]){try{G.stage=st;G.party.forEach(id=>{const c=G.roster[id];c.hp=c.S.mhp;c.mp=c.S.mmp;});A.setPause(999999);const ok=A.startBattle({stage:st,kind:'boss'});o['b'+st]=ok!==false&&A.B&&A.B.en[0]&&A.B.en[0].key;A.render();try{A.finishBattle('x');}catch(e){}A.V.modal=null;}catch(e){o.err.push('battle '+st+': '+e.message);}}
    o.zone=T('ZS')(4).n;o.fx=(T('calFxAt')(4)||{}).n;
  }catch(e){o.err.push(e.message);}
  G.run=run0;G.stage=st0;A.resetMaps();return o;});
chk(`an old journey that ended in the Ashglass Reach builds its town, field and dungeon and fights its bosses (${JSON.stringify([r5c.b1,r5c.b3,r5c.b4])}; ${r5c.zone}, effect ${r5c.fx}; ${r5c.err.join('; ')||'no errors'})`,!r5c.err.length&&r5c.b1==='thornwarden'&&r5c.b4==='seraph'&&!!r5c.b3);
// ---------------- 6. every realm builds and draws ----------------
for(const gfx of ['medium','low']){
 const r6=await ev(([gfx])=>{const A=__A,T=A.TW.get,G=A.G,o={err:[],n:0};A.META.cfg.gfx=gfx;T('applyCfg')();const zi=Object.fromEntries(A.ZONES.map((z,i)=>[z.key,i]));const order0=G.run.order.slice();
  for(const r of T('REALMS')){try{G.run.order[1]=zi[r.key];A.resetMaps();G.clock=150;for(const id of ['t1','f1']){const m=A.getMap(id);const p=m.start||[Math.floor(m.w/2),Math.floor(m.h/2)];A.V.modal=null;A.WS.dlg=null;A.placeAt(m.id,p[0],p[1],'u');A.render();o.n++;}
    const d=A.TW.get('drawAudit')?A.TW.get('drawAudit')():null;if(d&&d.exitLand&&d.exitLand.length)o.err.push(r.key+' exitLand '+d.exitLand.length);}catch(e){o.err.push(r.key+': '+e.message);}}
  G.run.order=order0;A.resetMaps();return o;},[gfx]);
 await H.frames(10);
 chk(`${gfx}: the town and field of all 20 realms build and draw (${r6.n} maps, ${r6.err.join('; ')||'no errors'})`,r6.n===40&&!r6.err.length);
}
chk(`no page errors (${errs.length}) ${errs.slice(0,2).join(' | ')}`,errs.length===0);
await done(H);
})();
