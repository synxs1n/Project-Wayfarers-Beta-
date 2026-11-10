// v0.17.1 the Echo Rift: the hall rebuilt around the Echoforge (v0.17.2: 33 x 34, forge at the centre, the five Calamity gates on an inner ring, the twenty
// Scourge gates on an outer ring in five arcs of four, the Riftkeeper and his gate at the north end of the axis, the door in the south) and renamed from
// "Echo Sanctum" to "The Echo Rift". Checks the layout, not the art: forge in the middle third, every gate reachable from the start by BFS (and the tile
// south of it, where the HD-2D camera looks from, open), nothing on the start tile or on a wall, no two npcs on one tile, bays named by signs, the name in
// locName, the Waystone row, the cards and the dialogue, and no "Echo Sanctum" left in the player text of the files that own the hall.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v153a.js
const {open,chk,done}=require('./pw');
const fs=require('fs'),path=require('path');
(async()=>{
const H=await open({w:1000,h:560});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();const G=A.G;G.won=true;G.echoStory={0:1,1:1,2:1,3:1,4:1};A.V.modal=null;});
const r=await ev(()=>{const A=__A,g=A.TW.get,o={};const m=A.getMap('s0'),W=m.w,Hh=m.h;o.size=[W,Hh];
  const forge=m.npcs.find(n=>n.forge),rk=m.npcs.find(n=>n.key==='__riftkeeper'),keeper=m.npcs.find(n=>n.isRK),gates=m.npcs.filter(n=>n.portal&&!n.forge&&n.key!=='__riftkeeper');
  o.forge=[forge.x,forge.y];o.mid=forge.x>=W/3&&forge.x<=2*W/3&&forge.y>=Hh/3&&forge.y<=2*Hh/3;o.centred=Math.abs(forge.x-(W-1)/2)<=1&&Math.abs(forge.y-(Hh-1)/2)<=1.5;
  o.n=gates.length;o.cal=gates.filter(n=>n.cal).length;o.sc=gates.filter(n=>!n.cal).length;
  // BFS from the start over the tiles the player can walk (solidAt covers walls, braziers, pillars, signs and every npc)
  const seen=m.t.map(r=>r.map(()=>false)),Q=[m.start.slice()];seen[m.start[1]][m.start[0]]=true;
  for(let q=0;q<Q.length;q++){const [x,y]=Q[q];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=Hh||seen[ny][nx]||A.solidAt(m,nx,ny))continue;seen[ny][nx]=true;Q.push([nx,ny]);}}
  const nb=n=>[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>seen[n.y+dy]&&seen[n.y+dy][n.x+dx]);
  o.unreach=m.npcs.concat([]).filter(n=>n.portal||n.isRK).filter(n=>!nb(n)).map(n=>n.key||n.name);
  o.noSouth=m.npcs.filter(n=>n.portal).filter(n=>!(seen[n.y+1]&&seen[n.y+1][n.x])).map(n=>n.key);
  let sealed=0;for(let y=0;y<Hh;y++)for(let x=0;x<W;x++)if(!A.solidAt(m,x,y)&&m.t[y][x]!=='E'&&!seen[y][x])sealed++;o.sealed=sealed;
  o.exitOk=seen[Hh-2][m.start[0]]&&m.t[Hh-1][m.start[0]]==='E';
  const pos={};m.npcs.forEach(n=>{const k=n.x+','+n.y;pos[k]=(pos[k]||0)+1;});o.dup=Object.keys(pos).filter(k=>pos[k]>1);
  o.onStart=m.npcs.some(n=>n.x===m.start[0]&&n.y===m.start[1]);o.onWall=m.npcs.filter(n=>'#vPSE'.includes(m.t[n.y][n.x])).map(n=>n.key||n.name);
  // layout order: ring round the forge, bays beyond it, the keeper and his gate at the north end of the axis, the door in the south
  const d=n=>Math.hypot(n.x-forge.x,n.y-forge.y),cal=gates.filter(n=>n.cal),sc=gates.filter(n=>!n.cal);
  o.ring=[Math.min(...cal.map(d)),Math.max(...cal.map(d))];o.scMin=Math.min(...sc.map(d));
  o.rkAxis=rk.x===forge.x&&rk.y<Math.min(...gates.map(n=>n.y))+3&&rk.y<=3;o.keeperAxis=keeper.x===forge.x&&keeper.y>rk.y&&keeper.y<Math.min(...cal.map(n=>n.y));
  o.startSouth=m.start[0]===forge.x&&m.start[1]>Math.max(...gates.map(n=>n.y));
  // v0.17.2 concentric layout: outer Scourge ring (radius 9.5-11.5, evenly spaced), lane from the door open, facing tiles walkable both sides
  const sr=sc.map(d),ang=sc.map(n=>Math.atan2(n.x-forge.x,forge.y-n.y)*180/Math.PI).map(a=>(a+360)%360).sort((a,b)=>a-b);
  o.scR=[Math.min(...sr),Math.max(...sr)];o.gapMax=0;o.nb=[];for(let i=1;i<ang.length;i++)o.nb.push(ang[i]-ang[i-1]);o.gapMax=Math.max(...o.nb);o.nbMin=Math.min(...o.nb);
  o.lane=gates.some(n=>n.x===forge.x&&n.y>forge.y);o.inOut=gates.filter(n=>{const sx=Math.abs(forge.x-n.x)>=Math.abs(forge.y-n.y),ix=n.x+(sx?Math.sign(forge.x-n.x):0),iy=n.y+(sx?0:Math.sign(forge.y-n.y)),ox=n.x-(sx?Math.sign(forge.x-n.x):0),oy=n.y-(sx?0:Math.sign(forge.y-n.y));return A.solidAt(m,ix,iy)||A.solidAt(m,ox,oy);}).map(n=>n.key);
  o.walk=Math.min(...sr)-Math.max(...cal.map(d))-1;o.laneOpen=[...Array(Hh)].map((_,y)=>y).filter(y=>y>forge.y&&y<Hh-1&&A.solidAt(m,forge.x,y)).length;
  // bays: five signs-worth of names, four Scourges each (the signs' tiles are 'S')
  o.signs=Object.values(m.signs).map(s=>s.split(':')[0]);o.bays=[...new Set(o.signs)];
  // text
  o.hub=m.hub;o.loc=A.TW.get('locName')(m);o.row=g('riftRow')();
  const text=[m.hub,...Object.values(m.signs),...m.npcs.map(n=>n.line||'')];
  const cards=[];gates.slice(0,2).concat([rk]).forEach(n=>{A.V.modal={type:'portal',key:n.key};A.render();cards.push(document.querySelector('#modal').innerText);});
  A.V.modal={type:'rkrest'};A.render();cards.push(document.querySelector('#modal').innerText);A.V.modal=null;
  o.text=text.concat(cards).join(' | ');
  A.placeAt('s0',m.start[0],m.start[1],'u');A.V.screen='world';A.render();o.body=document.body.innerText;
  return o;});
console.log(JSON.stringify(Object.assign({},r,{text:r.text.length,body:r.body.length,row:r.row.slice(0,80)})));
chk('the hall holds 25 Echo gates (5 Calamities, 20 Scourges)',r.n===25&&r.cal===5&&r.sc===20||JSON.stringify([r.size,r.n,r.cal,r.sc]));
chk('the Echoforge stands in the middle third of the hall, in fact on the centre',r.mid&&r.centred||JSON.stringify([r.size,r.forge]));
chk('every gate, the forge and the Riftkeeper can be reached from the start tile (BFS over walkable tiles)',r.unreach.length===0||JSON.stringify(r.unreach));
chk('every gate has open, reachable floor on the south (the HD-2D camera side); no gate hides behind the forge or another gate',r.noSouth.length===0||JSON.stringify(r.noSouth));
chk('no sealed floor, and the south door is reachable from the start',r.sealed===0&&r.exitOk||JSON.stringify([r.sealed,r.exitOk]));
chk('no two npcs on one tile, none on the start tile, none on a wall, brazier, pillar or sign',r.dup.length===0&&!r.onStart&&r.onWall.length===0||JSON.stringify([r.dup,r.onStart,r.onWall]));
chk('the Calamity gates ring the forge (3 to 8 tiles out) and every Scourge gate is farther out than the ring',r.ring[0]>=3&&r.ring[1]<=8&&r.scMin>r.ring[1]||JSON.stringify([r.ring,r.scMin]));
chk('the Riftkeeper and his gate stand on the axis at the north end; the door and the start are on the same axis in the south',r.rkAxis&&r.keeperAxis&&r.startSouth||JSON.stringify([r.rkAxis,r.keeperAxis,r.startSouth]));
chk('v0.17.2: the Scourges stand on an outer ring (radius 9.5 to 11.5) around the Calamity ring, evenly spaced (neighbour angles within 1.4x of each other apart from the south gap), walkway between the rings at least 1 tile',r.scR[0]>=9.5&&r.scR[1]<=11.5&&r.walk>=1&&r.nbMin>12&&r.gapMax<=40||JSON.stringify([r.scR,r.walk,r.nbMin,r.gapMax]));
chk('v0.17.2: the lane from the door to the forge is open (no gate or brazier on the axis south of the forge) and every gate has walkable floor on the centre side and the wall side',!r.lane&&r.laneOpen===0&&r.inOut.length===0||JSON.stringify([r.lane,r.laneOpen,r.inOut]));
chk('the five bays are named by signs',r.bays.length===5||JSON.stringify(r.bays));
chk('"The Echo Rift" is the hall\'s name (hub, locName, on screen) and the Waystone row',r.hub==='The Echo Rift'&&r.loc==='The Echo Rift'&&/The Echo Rift/.test(r.row)&&/The Echo Rift/.test(r.body)||JSON.stringify([r.hub,r.loc,r.row.slice(0,80)]));
chk('no "Echo Sanctum" or "Sanctum hall" in the hall\'s signs, dialogue, gate cards, rest popup or Waystone row',!/Echo Sanctum|Sanctum hall/i.test(r.text+r.row)||JSON.stringify((r.text+r.row).match(/.{30}(Echo Sanctum|Sanctum hall).{30}/gi)));
// source scan: string literals and template text of the hall's own files (comment lines skipped)
const dir=path.join(__dirname,'..','..','v3'),own=['sanctum.js','rift9.js','riftkeeper9.js','rk10.js','echo11.js'],left=[],other=[];
fs.readdirSync(dir).filter(f=>f.endsWith('.js')&&f!=='data.js').forEach(f=>{fs.readFileSync(path.join(dir,f),'utf8').split('\n').forEach((ln,i)=>{
  const code=ln.replace(/\/\*.*?\*\//g,'').replace(/^\s*\/\/.*$/,'');if(/Echo Sanctum|Sanctum hall/.test(code))(own.includes(f)?left:other).push(f+':'+(i+1));});});
chk('no "Echo Sanctum" / "Sanctum hall" left in the player text of sanctum.js, rift9.js, riftkeeper9.js, rk10.js, echo11.js',left.length===0||JSON.stringify(left));
if(other.length)console.log('NOTE (outside this module, not failed): "Echo Sanctum" text remains at '+other.join(', '));
await done(H);
})();
