// Phase 6: the Echo Rift (was the Echo Sanctum; v0.17.1 layout: Echoforge in the middle, Calamity ring, five Scourge bays)
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});const {ev,wait,shot,page}=H;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(250);
// locked with 4 of 5
let r=await ev(()=>{const A=__A,G=A.G;A.V.modal=null;G.won=true;G.echoStory={0:1,1:1,2:1,3:1};A.V.modal={type:'travel'};A.render();const b=document.querySelector('[data-act="toSanctum"]');return {open:A.sanctumOpen(),btn:!!b,dis:b&&b.disabled,txt:document.querySelector('.riftrow')?.innerText.replace(/\n+/g,' ')};});
console.log(JSON.stringify(r));chk('Sanctum stays locked with 4 of 5 story echoes',!r.open&&r.btn&&r.dis||JSON.stringify(r));
r=await ev(()=>{const A=__A,G=A.G;G.echoStory={0:1,1:1,2:1,3:1,4:1};A.V.modal={type:'travel'};A.render();const b=document.querySelector('[data-act="toSanctum"]');return {open:A.sanctumOpen(),dis:b&&b.disabled};});
chk('Sanctum opens with all five',r.open&&r.dis===false||JSON.stringify(r));
await ev(()=>__A.ACT.toSanctum());await wait(700);
r=await ev(()=>{const A=__A,m=A.WS.m;return {id:m.id,hub:m.hub,loc:document.body.innerText.includes('The Echo Rift'),portals:m.npcs.filter(n=>n.portal&&!n.forge&&n.key!=='__riftkeeper').length,safe:m.safe,pos:[A.WS.x,A.WS.y]};});
console.log(JSON.stringify(r));chk('the hall is named The Echo Rift (hub and on screen)',r.loc&&r.hub==='The Echo Rift'||JSON.stringify(r));chk('travel lands in The Echo Rift with 25 Echo gates (20 Scourges in five bays and 5 Calamities in a ring round the forge, v0.17.1) (the Echoforge anvil and the Riftkeeper gate aside, v0.12.13)',!!(r.id==='s0'&&r.portals===25&&r.safe)||JSON.stringify(r));
await shot('sanct_hall');
// reachability + collision: every gate has a reachable approach tile, exit reachable, every walkable tile reachable
r=await ev(()=>{const A=__A,m=A.WS.m,W=m.w,Hh=m.h,seen=m.t.map(r=>r.map(()=>false)),Q=[m.start.slice()];seen[m.start[1]][m.start[0]]=true;
  for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=Hh||seen[ny][nx]||A.solidAt(m,nx,ny))continue;seen[ny][nx]=true;Q.push([nx,ny]);}}
  const approach=m.npcs.filter(n=>n.portal).map(n=>[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>seen[n.y+dy]&&seen[n.y+dy][n.x+dx]));
  let floorUnreach=0;for(let y=0;y<Hh;y++)for(let x=0;x<W;x++)if(!A.solidAt(m,x,y)&&m.t[y][x]!=='E'&&!seen[y][x])floorUnreach++;
  let exitOk=false;for(const [dx,dy] of [[0,-1]])exitOk=seen[Hh-2][16];
  return {approach:approach.every(Boolean),n:approach.length,floorUnreach,exitOk};});
r.vis=await ev(()=>{const A=__A,m=A.WS.m;return m.npcs.filter(n=>n.portal).filter(n=>n.y+1>=m.h-3||A.solidAt(m,n.x,n.y+1)||m.t[n.y+1][n.x]==='#').map(n=>n.key+'@'+n.x+','+n.y);});
chk('no gate sits in the bottom 3 rows or has a solid tile directly south (the HD-2D wall front would hide it)',r.vis.length===0||JSON.stringify(r.vis));
console.log(JSON.stringify(r));chk('every gate reachable, exit reachable, no sealed floor',r.approach&&r.floorUnreach===0&&r.exitOk||JSON.stringify(r));
// interact with a gate: north (face up) and south (face down)
// v0.17.2: Wild Bay gate at (14,6) from the south (walkway side), Tide Bay gate at (26,17) from the west, a Calamity gate in the inner ring at (13,20) from the south
for(const [gx,gy,px,py,face] of [[14,6,14,7,'u'],[26,17,25,17,'r'],[13,20,13,21,'u'],[16,2,16,3,'u']]){
  r=await ev(([gx,gy,px,py,face])=>{const A=__A;A.V.modal=null;A.placeAt('s0',px,py,face);A.WS.lock=false;A.WS.dir=face;A.interact();return {modal:A.V.modal&&A.V.modal.type,key:A.V.modal&&A.V.modal.key,txt:document.querySelector('#modal .panel')?.innerText.replace(/\n+/g,' | ').slice(0,200)};},[gx,gy,px,py,face]);
  console.log(JSON.stringify(r));chk('gate at '+gx+','+gy+' opens its card',r.modal==='portal'&&!!r.key||JSON.stringify(r));
}
await shot('sanct_gate');
r=await ev(()=>{const A=__A;const k=A.riftKeys().includes(A.V.modal.key)?A.V.modal.key:A.riftKeys()[0];A.ACT.riftFight(k);return {b:!!A.B,rift:A.B&&A.B.spec&&A.B.spec.rift,kind:A.B&&A.B.spec&&A.B.spec.kind,echo:A.B&&A.B.en&&A.B.en[0]&&A.B.en[0].echo,lv:A.B&&A.B.en[0].lv};});
console.log(JSON.stringify(r));chk('Challenge starts the Echo fight with rift scaling',!!(r.b&&r.rift&&r.kind==='echoBoss'&&r.echo)||JSON.stringify(r));
// leave battle state cleanly
// exit: a fresh game state in the Sanctum, walk down through the south door
await H.browser.close();
const H2=await open({w:430,h:800,mobile:true});
await H2.ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await H2.wait(250);
await H2.ev(()=>{const A=__A,G=A.G;G.won=true;G.echoStory={0:1,1:1,2:1,3:1,4:1};A.V.modal=null;A.getMap('s0');A.placeAt('s0',16,32,'d');A.WS.lock=false;});await H2.wait(200);
await H2.page.keyboard.down('ArrowDown');await H2.wait(500);await H2.page.keyboard.up('ArrowDown');await H2.wait(900);
const ex=await H2.ev(()=>({id:__A.WS.m.id,kind:__A.WS.m.kind}));console.log(JSON.stringify(ex));
chk('south door returns to the last town',ex.kind==='town'||JSON.stringify(ex));
// reload while standing in the Sanctum: the save resumes there
const rl=await H2.ev(()=>{const A=__A;A.getMap('s0');A.placeAt('s0',16,31,'u');A.saveGame();return JSON.stringify(A.G.pos);});
console.log(rl);
await H2.browser.close();
console.log('done');
})();
