// ===== towns23.js (v0.22.20): towns you can see: a steeper camera in town, layouts spread out =====
// Owner: "you should be able to see them all clearly", then, shown the same town at pitch 40 and 52: "You can tilt it more but we still
// want layouts spread out generally more."
// Measured before: a 5 tile deep building stands about 79 world units tall in HD-2D; at pitch 40 it hides the ground for 5.9 tiles north of
// its front, and the layouts keep 2 to 4 rows between building rows, so the doors and signs of the back rows were behind roofs.
//  1 The camera: HD2D.pitch is 52 in a town (HD2D.pitchTown), 40 everywhere else (config.js makes pitch a getter on the map the party is on).
//    At 52 the same building hides 3.9 tiles.
//  2 The layouts are stretched after towns14 has made and checked them (a townGen wrap, outermost). Rows and columns that no building stands
//    in are doubled where room is missing:
//      - a building with another one to its south in its columns gets at least T23.needR (5) clear rows in front of it,
//      - two buildings side by side get at least T23.needC (3) columns between them,
//      - and every band of open rows or columns between buildings gets T23.spread (1) more, so a town is roomier everywhere,
//    up to T23.maxR more rows and T23.maxC more columns. A doubled row copies only what runs straight through it (a path, a wall, a
//    fence, water, a bridge that continues on both sides); everything else in the copy is open ground, so nothing is made twice (a
//    waystone, a board, a lamp, a crate) and no road gets wider. The road row, the rows beside it and the map's edges are never doubled, so
//    the gates and the town sign stay where getMap expects them. Buildings, doors and the road row move with the grid. The stretched town is
//    checked again (t14Check); if it fails, the town stays as towns14 made it (T23.n.kept).
// T23.off: the layouts as towns14 made them (the camera is HD2D.pitchTown either way; set it to 40 for the old view).
const T23={off:false,needR:5,needC:3,spread:1,maxR:10,maxC:10,per:3,n:{made:0,kept:0,rows:0,cols:0}};
const T23_RUN='=:#F~BTZ,';// what continues through a doubled line when it stands on both sides of it (paths, walls, the town wall, fences, water, bridges, the tree line)
function t23Plan(t){const g=t.g,H=g.length,W=g[0].length,B=t.bld,road=t.road;
  const rowFree=y=>y>1&&y<H-2&&Math.abs(y-road)>1&&!g[y].includes('H'),colFree=x=>{if(x<4||x>W-5)return false;for(let y=0;y<H;y++)if(g[y][x]==='H')return false;return true;};
  const open=r=>{let n=0;for(const c of r)if(c==='.'||c===',')n++;return n;};
  const dupR={},dupC={},sumR=(a,b)=>{let n=0;for(let y=a;y<=b;y++)n+=dupR[y]||0;return n;},sumC=(a,b)=>{let n=0;for(let x=a;x<=b;x++)n+=dupC[x]||0;return n;};
  let tr=0,tc=0;
  const addR=(a,b,need)=>{const rows=[];for(let y=a;y<=b;y++)if(rowFree(y))rows.push(y);rows.sort((p,q)=>open(g[q])-open(g[p])||p-q);let guard=0;
    while(need>0&&rows.length&&tr<T23.maxR&&guard++<40){const y=rows.find(y=>(dupR[y]||0)<T23.per);if(y==null)break;dupR[y]=(dupR[y]||0)+1;tr++;need--;rows.push(rows.shift());}};
  const colOpen=x=>{let n=0;for(let y=0;y<H;y++){const c=g[y][x];if(c==='.'||c===',')n++;}return n;};
  const addC=(a,b,need)=>{const cols=[];for(let x=a;x<=b;x++)if(colFree(x))cols.push(x);cols.sort((p,q)=>colOpen(q)-colOpen(p)||p-q);let guard=0;
    while(need>0&&cols.length&&tc<T23.maxC&&guard++<40){const x=cols.find(x=>(dupC[x]||0)<T23.per);if(x==null)break;dupC[x]=(dupC[x]||0)+1;tc++;need--;cols.push(cols.shift());}};
  // rows in front of a building that has another one south of it in its columns
  const pairsR=[];B.forEach(b=>B.forEach(c=>{if(b===c||c.y<b.y+b.h)return;if(c.x<b.x+b.w+1&&b.x<c.x+c.w+1)pairsR.push([b,c,c.y-(b.y+b.h)]);}));
  pairsR.sort((p,q)=>p[2]-q[2]).forEach(([b,c,gap])=>{if(gap>=T23.needR+2)return;const a=b.y+b.h,e=c.y-1,need=T23.needR-gap-sumR(a,e);if(need>0)addR(a,e,need);});
  const pairsC=[];B.forEach(b=>B.forEach(c=>{if(b===c||c.x<b.x+b.w)return;if(c.y<b.y+b.h&&b.y<c.y+c.h)pairsC.push([b,c,c.x-(b.x+b.w)]);}));
  pairsC.sort((p,q)=>p[2]-q[2]).forEach(([b,c,gap])=>{const a=b.x+b.w,e=c.x-1,need=T23.needC-gap-sumC(a,e);if(need>0)addC(a,e,need);});
  // roomier everywhere: one more line in every open band that lies between buildings and has had none yet
  if(T23.spread>0){const ys=B.map(b=>b.y),ye=B.map(b=>b.y+b.h-1),y0=Math.min(...ys),y1=Math.max(...ye);let a=null;
    for(let y=y0;y<=y1+1;y++){const fr=y<=y1&&rowFree(y);if(fr&&a==null)a=y;if(!fr&&a!=null){if(!sumR(a,y-1))addR(a,y-1,T23.spread);a=null;}}
    const xs=B.map(b=>b.x),xe=B.map(b=>b.x+b.w-1),x0=Math.min(...xs),x1=Math.max(...xe);a=null;
    for(let x=x0;x<=x1+1;x++){const fr=x<=x1&&colFree(x);if(fr&&a==null)a=x;if(!fr&&a!=null){if(!sumC(a,x-1))addC(a,x-1,T23.spread);a=null;}}}
  return {dupR,dupC,tr,tc};}
function t23Stretch(t){const P=t23Plan(t);if(!P.tr&&!P.tc)return null;let g=t.g.map(r=>r.slice());const H0=g.length,W0=g[0].length;
  const keep=(a,b)=>{if(a===b&&T23_RUN.includes(a))return a;if('ZY'.includes(a)&&'ZY'.includes(b))return 'Z';/* a wall tower beside the town wall: the wall goes on */if('#Y'.includes(a)&&'#Y'.includes(b))return '#';if('=:B'.includes(a)&&'=:B'.includes(b))return '=';return '.';};
  // rows (from the bottom up, so the indices of the plan stay true)
  for(let y=H0-1;y>=0;y--){const n=P.dupR[y]||0;if(!n||!g[y+1])continue;const copy=g[y].map((c,x)=>keep(c,g[y+1][x]));for(let k=0;k<n;k++)g.splice(y+1,0,copy.slice());}
  for(let x=W0-1;x>=0;x--){const n=P.dupC[x]||0;if(!n)continue;g.forEach(r=>{const c=keep(r[x],r[x+1]);for(let k=0;k<n;k++)r.splice(x+1,0,c);});}
  const sy=y=>{let s=0;for(let i=0;i<y;i++)s+=P.dupR[i]||0;return y+s;},sx=x=>{let s=0;for(let i=0;i<x;i++)s+=P.dupC[i]||0;return x+s;};
  const bld=t.bld.map(b=>Object.assign({},b,{x:sx(b.x),y:sy(b.y),door:b.door?[sx(b.door[0]),sy(b.door[1])]:b.door}));
  return Object.assign({},t,{g,bld,road:sy(t.road),t23:{rows:P.tr,cols:P.tc}});}
// 3 Where no whole row is free (buildings stand staggered, one stack beside another), single buildings step apart: of a tight pair the
//   northern one moves north and the southern one south, a row at a time, onto plain ground only ('.' and ','; the door's own column may
//   cross a path), leaving a clear row beyond. A building that moved north keeps a path from its new door step down to its old one.
function t23Nudge(t){const g=t.g.map(r=>r.slice()),H=g.length,W=g[0].length,B=t.bld.map(b=>Object.assign({},b,{door:b.door?b.door.slice():b.door}));let moved=0;
  const plain=c=>c==='.'||c===','||c===':'||c==='f'||c==='t',at=(x,y)=>(g[y]||[])[x];/* open ground, plaza paving, flowers and bushes */
  const canRow=(b,y,doorCol)=>{if(y<2||y>H-3)return false;for(let x=b.x;x<b.x+b.w;x++){const c=at(x,y);if(!(plain(c)||(doorCol&&x===b.door[0]&&'=:'.includes(c))))return false;}return true;};
  const clearRow=(b,y)=>{for(let x=b.x-1;x<=b.x+b.w;x++)if(at(x,y)==='H')return false;return y>0&&y<H-1;};
  const south=b=>{const y=b.y+b.h;if(!b.door||!canRow(b,y,true)||!clearRow(b,y+1)||!clearRow(b,y+2)||Math.abs(y+1-t.road)<1||y+1===t.road)return false;const step=at(b.door[0],y+1);if(!(plain(step)||'=:'.includes(step)))return false;
    for(let x=b.x;x<b.x+b.w;x++){g[y][x]='H';g[b.y][x]='.';}b.y++;b.door[1]++;return true;};
  const north=b=>{const y=b.y-1;if(!b.door||!canRow(b,y,false)||!clearRow(b,y-1))return false;const oy=b.y+b.h-1;
    for(let x=b.x;x<b.x+b.w;x++){g[y][x]='H';g[oy][x]=x===b.door[0]?'=':'.';}b.y--;b.door[1]--;return true;};
  const pairs=[];B.forEach(b=>B.forEach(c=>{if(b!==c&&c.y>=b.y+b.h&&c.x<b.x+b.w&&b.x<c.x+c.w)pairs.push([b,c]);}));
  for(let pass=0;pass<T23.needR;pass++){let any=false;pairs.forEach(([b,c])=>{const gap=c.y-(b.y+b.h);if(gap>=T23.needR)return;if(north(b)){any=true;moved++;}else if(south(c)){any=true;moved++;}});if(!any)break;}
  return moved?Object.assign({},t,{g,bld:B,t23:Object.assign({},t.t23,{moved})}):null;}
HOOK.wrap('townGen','towns23','layouts spread out: clear rows in front of every building, room between neighbours',function(next,Z,s,R){const t=next(Z,s,R);
  try{if(T23.off||!t||!t.g||!t.bld||!t.arch)return t;const u=t23Stretch(t);
    let ok=t;if(u){if(typeof t14Check==='function'&&t14Check(u).length)T23.n.kept++;else{ok=u;T23.n.made++;T23.n.rows+=u.t23.rows;T23.n.cols+=u.t23.cols;}}
    try{const v=t23Nudge(ok);if(v&&!(typeof t14Check==='function'&&t14Check(v).length)){ok=v;T23.n.moved=(T23.n.moved||0)+v.t23.moved;}}catch(e){T23.err=String(e&&e.message||e);}
    return ok;}catch(e){T23.err=String(e&&e.message||e);return t;}});
try{window.__T23={T23,plan:t23Plan,stretch:t23Stretch};}catch(e){}
