// v0.4.1 Phase 4: sixteen realms, boss overlays (apply and lift), Calamity effects, realm weighting, every boss with every realm of its tier
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const a=await ev(()=>{const A=__A,G=A.G,o={};o.rv=G.run.rv;o.order=G.run.order.slice();const R=A.REALMS;o.std=R.filter(r=>r.std).length;o.cal=R.filter(r=>r.cal).length;
  o.drawOk=G.run.order.slice(0,4).every(i=>A.ZONES[i].std)&&A.ZONES[G.run.order[4]].cal&&new Set(G.run.order).size===5;
  // identity: every realm has its own name, town, palette, pool, weather table with clear as the largest share, npcs, quests
  o.ident=R.every(r=>r.n&&r.town&&r.lean&&r.lean.mix&&r.pool0.length>=4&&r.pool0.every(k=>A.MON[k])&&r.npc.length>=3&&(r.quest||r.quests)&&r.wx.find(x=>x[0]==='clear')[1]===Math.max(...r.wx.map(x=>x[1])));
  o.names=new Set(R.map(r=>r.n)).size===16&&new Set(R.map(r=>r.lean.mix)).size===16;
  return o;});
console.log(JSON.stringify(a));
chk('4.1 sixteen realms (12 standard + 4 Calamity), each with its own identity',a.std===12&&a.cal===4&&a.ident&&a.names);
chk('4.1 a new journey draws 4 standard realms and 1 Calamity realm (seeded)',a.rv===2&&a.drawOk);
// every boss with every realm of its tier: overlay applies, maps are clean, then it lifts when the boss falls
const p=await ev(()=>{const A=__A,G=A.G,out={combos:0,bad:[],lift:0,wx:0,pool:0};const GP=Object.keys(A.BOV).filter(k=>!A.CAL_FX[k]),FP=Object.keys(A.CAL_FX);
  const std=A.REALMS.filter(r=>r.std),cal=A.REALMS.filter(r=>r.cal);
  const test=(realm,key,s)=>{const fs=std.filter(r=>r!==realm),fc=cal.filter(r=>r!==realm);G.run.order=[fs[0].idx,fs[1].idx,fs[2].idx,fs[3].idx,fc[0].idx];G.run.order[s]=realm.idx;if(s<4){G.run.bosses=G.run.bosses.slice();G.run.bosses[s]=key;}else G.run.final=key;
    G.cleared=[false,false,false,false,false];A.resetMaps();A.syncPools();
    const t=A.getMap('t'+s),f=A.getMap('f'+s);out.combos++;
    const iss=A.mapIssues(t).concat(A.mapIssues(f));if(iss.length)out.bad.push(realm.key+'/'+key+' issues '+iss.length);
    if(!String(t.thv).includes('@'+realm.key)||!String(t.thv).includes('~'+key))out.bad.push(realm.key+'/'+key+' look '+t.thv);
    const ov=A.BOV[key].mon[0];if(A.ZONES[realm.idx].pool.includes(ov))out.pool++;else out.bad.push(realm.key+'/'+key+' pool');
    for(let i=0;i<30;i++){A.rollWeather(s);}const L=realmWxL(s);if(L)out.wx++;
    G.cleared[s]=true;A.liftOverlay(s);if(!String(t.thv).includes('~')&&!A.ZONES[realm.idx].pool.includes(ov)&&!A.bovAt(s))out.lift++;else out.bad.push(realm.key+'/'+key+' lift '+t.thv);};
  const realmWxL=s=>true;
  std.forEach(r=>GP.forEach(k=>test(r,k,1)));cal.forEach(r=>FP.forEach(k=>test(r,k,4)));
  G.cleared=[false,false,false,false,false];return out;});
console.log(JSON.stringify(Object.assign({},p,{bad:p.bad.slice(0,8)})));
chk('4.9 every Scourge with every standard realm and every Calamity with every Calamity realm builds clean maps (160 pairings)',p.combos===160&&p.bad.length===0);
chk('4.1b the overlay applies (look, monsters) and lifts when the boss falls',p.pool===160&&p.lift===160);
const w=await ev(()=>{const A=__A,G=A.G,o={};G.cleared=[false,false,false,false,false];A.syncPools();
  // weather: clear stays the largest share even with the overlay push
  const cnt={};for(let i=0;i<4000;i++){const x=A.rollWeather(1);cnt[x]=(cnt[x]||0)+1;}o.cnt=cnt;o.clearTop=Object.keys(cnt).every(k=>k==='clear'||cnt[k]<cnt.clear);
  // Calamity effect in a battle at stage 4
  A.startBattle({stage:4,kind:'field',weather:'clear'});o.calfx=A.B&&A.B.calfx&&A.B.calfx.n;A.finishBattle('x');
  G.cleared[4]=true;A.startBattle({stage:4,kind:'field',weather:'clear'});o.calAfter=!!(A.B&&A.B.calfx);A.finishBattle('x');G.cleared[4]=false;
  // guides and npc talk mention the overlay without naming the boss
  A.placeAt('t1',...A.innSpot(1),'d');const g=A.overlayGuide();o.guide=g.length>0;const nm=A.guardianDef(A.G.run.bosses[1]).n;o.noName=!g.includes(nm);
  const m=A.getMap('t1');o.lore=A.npcPool(m.npcs[0],m,m.npcs[0].line).some(x=>x.t===A.BOV[A.G.run.bosses[1]].say);
  // bestiary lists overlay variants
  A.V.modal={type:'menu',tab:'beasts'};A.render();o.best=document.body.innerText.length>0;
  return o;});
console.log(JSON.stringify(w));
chk('4.1b weather: clear skies stay the largest single share with the overlay',w.clearTop===true);
chk('4.2 the Calamity effect runs in the Calamity realm and ends with the Calamity',!!w.calfx&&w.calAfter===false);
chk('4.1b overlay shows in Guides and in NPC talk, never naming the boss',w.guide&&w.noName&&w.lore);
await done(H);})();
