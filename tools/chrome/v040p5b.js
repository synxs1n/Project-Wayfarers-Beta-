const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
  // walk through the first stages' maps so the world map has something to show
  [['t0'],['f0'],['t1'],['f1'],['t2'],['f2']].forEach(([id])=>{const m=A.getMap(id);A.placeAt(id,m.gates?m.gates[m.kind==='town'?'next':'start'].arrive[0]:2,m.gates?m.gates[m.kind==='town'?'next':'start'].arrive[1]:2,'r');});
  A.G.cleared[0]=true;A.G.cleared[1]=true;
  const f0=A.getMap('f0');A.placeAt('f0',f0.entOut[0],f0.entOut[1],'d');
  A.V.modal=null;A.render();});
await H.wait(300);
await H.ev(()=>{__A.ACT.map();});await H.shot('p5_map');
await H.ev(()=>{__A.ACT.worldMap();});await H.wait(300);await H.shot('p5_world');
const t=await H.ev(()=>({m:__A.V.modal&&__A.V.modal.type,g:JSON.stringify(__A.worldGraph().nodes.map(n=>n.id+'@'+n.x+','+n.y))}));
console.log(JSON.stringify(t));
chk('world map opens',t.m==='worldmap'||t.m==='bigmap');
await done(H);
})();
