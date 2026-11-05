// v0.4.1 1.2: a slain mimic and its chest vanish and drop the better reward; old saves with the opened chest standing heal on load
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(30);});
const r=await H.ev(()=>{const A=__A;const G=A.G;
  let m=null,mc=null;
  for(let seed=1;seed<60&&!mc;seed++){G.run.seed=seed*7919;A.resetMaps();const d=A.getMap('d0');mc=(d.chests||[]).find(c=>c[2]!=='vault'&&A.isMimic(d,c[0],c[1]));if(mc)m=d;}
  if(!mc)return {err:'no mimic found'};
  A.WS.m=m;const [x,y]=mc,key=m.id+':'+x+','+y;
  const before={tile:m.t[y][x],gear:G.gear.length,chests:m.chests.length};
  A.mimicReward(x,y,100);
  return {before,after:{tile:m.t[y][x],gear:G.gear.length,chests:m.chests.length,flag:G.chests[key]},x,y,id:m.id,seed:G.run.seed};});
console.log(JSON.stringify(r));
chk('1.2 mimic found',!r.err);
chk('1.2 chest tile is gone after the mimic dies',r.after&&r.after.tile!=='C'&&r.after.chests===r.before.chests-1);
chk('1.2 better reward (2 items)',r.after&&r.after.gear===r.before.gear+2);
// old save: the chest stays flagged opened (1) from the pre 0.4.1 flow; reloading the map must drop it
const o=await H.ev((p)=>{const A=__A,G=A.G;G.run.seed=p.seed;delete G.chests[p.id+':'+p.x+','+p.y];A.resetMaps();const d0=A.getMap(p.id);const still0=d0.t[p.y][p.x];
  G.chests[p.id+':'+p.x+','+p.y]=1;A.resetMaps();const d=A.getMap(p.id);return {still0,tile:d.t[p.y][p.x],issues:A.mapIssues(d).length};},r);
console.log(JSON.stringify(o));
chk('1.2 old save: opened mimic chest is cleared on map load',o.still0==='C'&&o.tile!=='C'&&o.issues===0);
await done(H);})();
