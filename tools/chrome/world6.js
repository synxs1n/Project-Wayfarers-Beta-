// v0.3.5 Phase 6: two fields per town, themed worlds, old saves keep their old map
const fs=require('fs');const {open,chk,done}=require('./pw');
const OLD=fs.readFileSync(__dirname+'/../out/aurelis.html','utf8');
(async()=>{
const H0=await open({w:430,h:800,mobile:true,html:OLD});
const base=await H0.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.G.gold=321;A.saveGame();
  const k=Object.keys(localStorage).find(x=>x.startsWith('aurelis-wayfarers-v3'));return {key:k,save:localStorage.getItem(k),meta:localStorage.getItem('aurelis-meta-v1')};});
await H0.browser.close();
const H=await open({w:430,h:800,mobile:true});
const r=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();const o={};
  o.wv=A.G.wv>=2?2:A.G.wv;A.G.wv=2;A.resetMaps&&A.resetMaps();// v0.4.0: this file tests the v0.3.5 (wv2) world, so force it
  // walk the graph with enterVia: t0 -> g0 -> f0 -> g0 -> t0
  const seq=[];const go=(to)=>{A.enterVia(to);seq.push(A.WS?A.WS.m.id:'?');};
  const t=A.getMap('t0'),g=A.getMap('g0'),f=A.getMap('f0');
  const u=m=>[...new Set(m.exits.map(e=>e.to&&e.to.m))];o.exits={t:u(t),g:u(g),f:u(f)};
  o.kinds=[t.kind,g.kind,f.kind];o.parts=[g.part,f.part];o.sizes=[g.w+'x'+g.h,f.w+'x'+f.h];
  // every exit target exists and comes back
  const bad=[];for(let s=0;s<5;s++){['t','g','f'].forEach(p=>{const m=A.getMap(p+s);m.exits.forEach(e=>{if(!e.to)return;const n=A.getMap(e.to.m);if(!n.exits.some(x=>x.to&&x.to.m===m.id))bad.push(m.id+'->'+e.to.m);});});}
  o.bad=bad;
  // themes
  o.theme=[g.thv,t.thv,A.getMap('d0').thv,!!g.motif,!!t.btint];
  o.hint=Object.values(t.signs).join(' ').length>40&&t.npcs.filter(n=>n.themed).length;
  // legend and bounty NPC duplicates: only the second field hosts them
  A.enterVia({m:'g0',side:'w'});o.at=A.WS.m.id;A.enterVia({m:'f0',side:'w'});o.at2=A.WS.m.id;
  // the dungeon entrance lives only in the second field
  o.ent=[!!g.ent,!!f.ent,g.t.some(r=>r.includes('E')),f.t.some(r=>r.includes('E'))];
  // different bosses give different palettes
  const keys=Object.keys(A.BTHEME);o.nThemes=keys.length;
  return o;});
console.log(JSON.stringify(r));
chk('new journeys are world v2',r.wv===2);
chk('t0 east -> g0 -> f0, f0 west -> g0, g0 west -> t0',JSON.stringify(r.exits)===JSON.stringify({t:[null,'g0'],g:['t0','f0'],f:['g0','t1']})||JSON.stringify(r.exits));
chk('exit graph consistent for all stages',r.bad.length===0||r.bad.join());
chk('both are fields; sizes grew',r.kinds[1]==='field'&&r.kinds[2]==='field'&&r.parts.join()==='1,2'&&r.sizes.join()==='56x34,64x38'||JSON.stringify([r.kinds,r.parts,r.sizes]));
chk('dungeon entrance only in the second field',r.ent.join()==='false,true,false,true'||r.ent.join());
chk('boss theme applied to town, field and dungeon, with hints',r.theme[0].includes('~')&&r.theme[1].includes('~')&&r.theme[2].includes('~')&&r.theme[3]&&r.theme[4]&&r.hint>0||JSON.stringify(r.theme)+r.hint);
chk('16 boss themes',r.nThemes===16);
chk('entering via exits lands in the right maps',r.at==='g0'&&r.at2==='f0'||JSON.stringify([r.at,r.at2]));
// old save keeps its old map
const H2=await open({w:430,h:800,mobile:true,pre:`localStorage.clear();localStorage.setItem(${JSON.stringify(base.key)},${JSON.stringify(base.save)});localStorage.setItem('aurelis-meta-v1',${JSON.stringify(base.meta)});`});
const r2=await H2.ev(()=>{const A=__A;A.ACT.cont();const o={wv:A.G.wv,gold:A.G.gold};const t=A.getMap('t0'),f=A.getMap('f0');o.east=t.exits[1].to.m;o.size=f.w+'x'+f.h;o.west=f.exits[0].to.m;o.ent=!!f.ent;o.themed=!!f.thv&&f.thv.includes('~');return o;});
console.log(JSON.stringify(r2));
chk('old save: single field, same size, same exits',r2.wv==null&&r2.east==='f0'&&r2.size==='48x30'&&r2.west==='t0'&&r2.ent&&r2.gold===321||JSON.stringify(r2));
chk('old save still gets boss theme',r2.themed);
await H2.browser.close();await done(H);})();
