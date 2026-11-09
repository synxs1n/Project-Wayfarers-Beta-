// ===== breach10.js (v0.15.4): the Meridian Breach is its own place =====
// The owner after 0.15.3: "Meridian Breach just leads me back to the last field, it should be its own distinct area." Until now the
// Breach (map 'x0', endgame10.js) was the Calamity realm's long field laid out again from another seed, so in a void realm it looked
// like the field you had just left. It is now built here: islands of broken ground afloat in the void sea, joined by bridges.
//  - a landing in the west where the broken seal lets you in (the gate back to the Calamity field, and the Waystone's arrival spot);
//  - a hub island in the middle with the Breach Waystone in a ring of standing stones and rift crystals;
//  - five outer islands (north, south, east, north west, south west), each carrying a landmark from one of the realms you crossed
//    (the realms "bleeding through"): a tower, graves, a ruin, a stone circle, crystals, a camp, a wreck. Tall grass on every island
//    hides the Breach's fights (endgame10 picks the foes from every visited realm); the bridges and the road are safe.
// Same id, same hooks (foes, roamers, purse, Waystone row, locName) as before; only the ground changed. Seeded from the journey seed,
// so a save rebuilds the same Breach. No save fields.
const BR10={W:84,H:44,pick:['tower','graves','ruin','stones','crystals','camp','wreck']};
function breachVisitedThemes(){const out=[];try{(G.visited||[]).forEach(st=>{const Z=ZS(st);if(Z&&Z.theme&&!out.includes(Z.theme))out.push(Z.theme);});}catch(e){}if(!out.length)out.push('void');return out;}
function buildBreach(){
  const W=BR10.W,H=BR10.H,R=mulberry(((G.run&&G.run.seed)||1)+424242>>>0),g=Array.from({length:H},()=>Array(W).fill('~'));
  const at=(x,y)=>y>=0&&y<H&&x>=0&&x<W?g[y][x]:'~',put=(x,y,c)=>{if(y>=0&&y<H&&x>=0&&x<W)g[y][x]=c;};
  // an island: an ellipse with a frayed edge, tall grass in a loose ring inside the shore
  const island=(cx,cy,rx,ry,grass)=>{const cells=[];for(let y=cy-ry-1;y<=cy+ry+1;y++)for(let x=cx-rx-1;x<=cx+rx+1;x++){const d=Math.hypot((x-cx)/rx,(y-cy)/ry);
      if(d<=.82||(d<=1&&R()<.75)){put(x,y,grass&&d>.3&&R()<.82?',':'.');cells.push([x,y]);}}return cells;};// v0.15.5: a training ground, so most of an island is grass
  const land=island(6,22,4,3,false),hub=island(42,22,11,8,true),N=island(42,7,8,4,true),S=island(42,37,8,4,true),E=island(72,22,7,6,true),NW=island(20,8,6,4,true),SW=island(20,36,6,4,true);
  // bridges: straight planks over the void, the tiles they land on cleared
  const bridge=(x0,y0,x1,y1)=>{const dx=Math.sign(x1-x0),dy=Math.sign(y1-y0);let x=x0,y=y0;for(;;){if(at(x,y)==='~')put(x,y,'B');else if(at(x,y)===',')put(x,y,'.');if(x===x1&&y===y1)break;x+=dx;y+=dy;}};
  bridge(8,22,33,22);bridge(42,15,42,10);bridge(42,29,42,34);bridge(51,22,66,22);bridge(25,7,35,7);bridge(25,37,35,37);
  // the road in from the seal: the west edge, three tiles wide like every field gate, and a path to the first bridge
  for(let y=21;y<=23;y++){put(0,y,'=');put(1,y,'=');}for(let x=2;x<=8;x++)put(x,22,'=');put(2,21,'.');put(2,23,'.');
  // the hub: Waystone in a ring of standing stones, rift crystals about
  put(42,19,'W');[[38,18],[46,18],[36,22],[48,22],[38,26],[46,26],[40,16],[44,16],[40,28],[44,28]].forEach(([x,y])=>put(x,y,'N'));
  for(let i=0;i<14;i++){const x=42+Math.round((R()-.5)*18),y=22+Math.round((R()-.5)*12);if(at(x,y)==='.'&&Math.abs(x-42)>1&&Math.abs(y-22)>1)put(x,y,'P');}
  // outer islands: a landmark from each realm you crossed (its stamp, no chest), tall grass round it
  const themes=breachVisitedThemes(),isles=[[N,42,7],[E,72,22],[S,42,37],[NW,20,8],[SW,20,36]],used=[];
  isles.forEach(([cells,cx,cy],i)=>{const th=themes[i%themes.length],names=(LANDMARKS[th]||LANDMARKS.void).filter(n=>BR10.pick.includes(n)&&!used.includes(n));
    const name=names.length?names[Math.floor(R()*names.length)]:BR10.pick.find(n=>!used.includes(n))||'ruin';used.push(name);const S=STAMPS[name],sh=S.length,sw=S[0].length,x0=cx-Math.floor(sw/2),y0=cy-Math.floor(sh/2);
    for(let j=0;j<sh;j++)for(let k=0;k<sw;k++){const c=S[j][k];if(c==='.')continue;if(!'.,'.includes(at(x0+k,y0+j)))continue;put(x0+k,y0+j,c==='C'?'.':c);}});
  // nothing solid may sit on a bridge end or the road
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]==='B'){[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const c=at(x+a,y+b);if(c!=='~'&&c!=='B'&&c!=='='&&SOLID.includes(c))put(x+a,y+b,'.');});}
  const m={id:'x0',z:4,s:4,kind:'field',theme:'void',breach:1,name:BREACH.n,exits:[],npcs:[],bld:[],signs:{},chests:[],caves:[],fortAt:null,ent:null,entOut:null,part:3,sy:null,ey:null,bx:null};
  m.t=g;m.w=W;m.h=H;m.bld=stampBuildings(g);
  const back={m:'f4',g:'breach'};for(let y=21;y<=23;y++)m.exits.push({x:0,y,to:back});
  m.gates={start:{side:'w',x:0,y:22,arrive:[2,22,'r'],label:'w',cells:[[0,21],[0,22],[0,23]],to:back}};
  m.signs['3,21']='The Meridian Breach. Every realm you crossed bleeds through here. The bridges are safe; the grass is not.';
  m.signs['42,17']='The Breach Waystone. The void below has no bottom; keep to the stones.';
  // open spots for legends, nodes and roamers: ground or grass well away from the gate, the Waystone and the bridges
  const free=[];for(let y=2;y<H-2;y++)for(let x=12;x<W-2;x++){const c=g[y][x];if(c!=='.'&&c!==',')continue;if(Math.abs(x-42)<=2&&Math.abs(y-19)<=2)continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>at(x+a,y+b)==='B'))continue;if((x+y)%2===0)free.push([x,y]);}
  m.free=free;breachTurn(m);try{placeNodes(m);}catch(e){}m.tone=valueNoise(mulberry(31+4*7+2+424242),m.w,m.h,6);return m;}
// v0.15.5: the way in matches the way you walked. The canonical Breach is entered from the west walking east; if the Calamity field's
// seal is walked through northward, the whole Breach is turned so its landing is on the south edge and you arrive walking north.
function breachWalkDir(){try{const f=getMap('f4');if(f&&f.gateAt&&f.gateOut){const dx=f.gateOut[0]-f.gateAt[0],dy=f.gateOut[1]-f.gateAt[1];return Math.abs(dx)>=Math.abs(dy)?(dx>=0?'r':'l'):(dy>0?'d':'u');}}catch(e){}return 'r';}
function breachTurn(m){const want=breachWalkDir(),k={r:0,d:1,l:2,u:3}[want]||0;if(!k)return;const FACE=['r','d','l','u'];
  for(let i=0;i<k;i++){const W=m.w,H=m.h,T=([x,y])=>[H-1-y,x];// one quarter turn clockwise
    const g=Array.from({length:W},()=>Array(H).fill('~'));for(let y=0;y<H;y++)for(let x=0;x<W;x++){const [nx,ny]=T([x,y]);g[ny][nx]=m.t[y][x];}
    m.t=g;m.w=H;m.h=W;m.exits.forEach(e=>{const p=T([e.x,e.y]);e.x=p[0];e.y=p[1];});
    const s=m.gates.start,p=T([s.x,s.y]),a=T([s.arrive[0],s.arrive[1]]);s.x=p[0];s.y=p[1];s.arrive=[a[0],a[1],FACE[(FACE.indexOf(s.arrive[2])+1)%4]];s.cells=s.cells.map(T);s.side={w:'n',n:'e',e:'s',s:'w'}[s.side];s.label=s.side;
    const sg={};Object.keys(m.signs).forEach(key=>{const q=T(key.split(',').map(Number));sg[q.join()]=m.signs[key];});m.signs=sg;m.free=m.free.map(T);}
  m.bld=stampBuildings(m.t);}
HOOK.wrap('getMap','breach10','the Meridian Breach, its own islands in the void',function(next,...a){if(a[0]!=='x0')return next(...a);if(MAPS.x0)return MAPS.x0;return MAPS.x0=buildBreach();});
