// ===== towns37.js (v0.22.37): the land under the town plans: isles and bridges, canals, terraces =====
// Asked: "some towns lost a lot of their character in the last update, some had higher land or were islands connected by bridges, now
// everything is flatland with a crossroad, it's on for exits to not be perfectly in the middle we just want them visible and a clear path to
// them, like the road in the town leads to the exits".
// The towns24 plans kept every building in view and every gate on a road, but all nine stood on one flat lawn; the towns14 plans they
// replaced had lake towns on islands, sky ledges on rope bridges, canal towns and terraced hillsides. This gives the land back without
// giving up either rule: t24Make calls t37Dress after the buildings are placed and before the doors are linked, so the links cross water as
// boardwalks and the checks (t14Check, t24Check: buildings in view, road and avenue unbroken) still decide whether the town is accepted.
//   isles    the ground is water (or open sky in the heights) except a pad round each building and the plaza; the road, the avenue and every
//            door path cross it as bridges. Mire, Peaks, Drowned, Shattered and the fifth base zone, the towns that were islands.
//   canal    two canals run north to south between the buildings, bridged where the road and the door paths cross. Lakes, Bamboo.
//   terrace  rock ledges run across the town between the building rows, with stairs on the avenue and at a few other points: the town
//            climbs away from the road. Grotto, Mesa, Mines, Starless and the third base zone.
// T37.off: flat again. Which realm gets which is T37.land (by realm key).
const T37={off:false,n:{isles:0,canal:0,terrace:0},land:{mire:'isles',peaks:'isles',drowned:'isles',shattered:'isles',base4:'isles',lakes:'canal',bamboo:'canal',grotto:'terrace',mesa:'terrace',mines:'terrace',starless:'terrace',base2:'terrace'}};
function t37Near(T,x,y,pad){return T.bld.some(b=>x>=b.x-pad&&x<b.x+b.w+pad&&y>=b.y-pad&&y<b.y+b.h+pad+1);}
function t37Isles(T){const W=T.W,H=T.H,g=T.g,keep=new Set(),K=(x,y)=>keep.add(x+','+y);
  T.bld.forEach(b=>{const cx=b.x+b.w/2-.5,cy=b.y+b.h/2,rx=b.w/2+2.6,ry=b.h/2+2.8;for(let y=Math.floor(cy-ry);y<=cy+ry+1;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/(ry+.5))**2<=1)K(x,y);});
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(g[y][x]===':'||g[y][x]==='W'||g[y][x]==='q')for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)K(x+a,y+b);
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(keep.has(x+','+y))continue;const c=g[y][x];if(c==='.'||c===','||c==='f'||c==='t')g[y][x]='~';else if(c==='=')g[y][x]='B';}
  T.wet=1;}
// a canal column: 2 wide if a clear 2 wide strip exists, else 1 wide; it may pass a building's side but never under one or its door step
function t37Canal(T){const W=T.W,H=T.H,g=T.g,cx=W>>1,free=(x,w)=>{if(x<3||x+w>W-3||Math.abs(x-cx)<4)return false;for(let y=2;y<H-2;y++)for(let xx=x;xx<x+w;xx++){const c=g[y][xx];if(!'.,ft=:mLo'.includes(c)||t37Near(T,xx,y,0))return false;}return true;};
  let n=0;const cut=(x,w)=>{for(let y=2;y<H-2;y++)for(let xx=x;xx<x+w;xx++){const c=g[y][xx];g[y][xx]=c==='='||c===':'?'B':'~';}n++;};
  [Math.round(W*.28),Math.round(W*.72)].forEach(x0=>{for(const w of [2,1])for(let d=0;d<12;d++)for(const x of [x0+d,x0-d])if(free(x,w)){cut(x,w);return;}});
  if(n)T.wet=1;return n;}
function t37Terrace(T){const W=T.W,H=T.H,g=T.g,r=T.road,cx=W>>1,free=y=>{if(Math.abs(y-r)<3)return false;for(let x=1;x<W-1;x++){if(t37Near(T,x,y,0))return false;}return !T.bld.some(b=>y===b.y+b.h||y===b.y+b.h+1||y===b.y-1);};
  let last=-9,n=0;for(let y=4;y<H-4;y++){if(y-last<6||!free(y))continue;last=y;n++;const st=new Set([cx,cx-1,cx+1].concat([.18,.36,.64,.82].map(k=>Math.round(W*k))));
    for(let x=1;x<W-1;x++){const c=g[y][x];if(!'.,ft'.includes(c))continue;/* a road, the avenue or the plaza passes through the ledge as it is */g[y][x]=st.has(x)?'s':'#';}}
  return n;}
function t37Dress(T,R,th,o){if(T37.off||!o||!o.land)return;const k=o.land;if(k==='isles'){t37Isles(T);T37.n.isles++;}else if(k==='canal'){if(t37Canal(T))T37.n.canal++;}else if(k==='terrace'){if(t37Terrace(T))T37.n.terrace++;}T.land=k;}
try{Object.keys(T37.land).forEach(k=>{if(T24_TAB[k])T24_TAB[k][2]=Object.assign({},T24_TAB[k][2],{land:T37.land[k]});});}catch(e){}
try{window.__T37=T37;}catch(e){}
