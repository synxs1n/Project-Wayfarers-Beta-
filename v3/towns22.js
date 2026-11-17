// ===== towns22.js (v0.22.16): props that mark a building's role =====
// Owner (after towns21): the towns that exist should gain character in the real game, no reworks. The next step on his list: "props that
// mark a role". Until now the only role marks were the sign and a 14 px item painted on the facade beside the door (towngfx.js); the ground
// round every building was the same few random crates and barrels (towns14.js t14Deco).
// Now every service building has its own things standing on the ground in front of it or at its side:
//   tavern   a stack of kegs, a table with two mugs, a barrel        smithy   an anvil, a weapon rack, a grindstone
//   inn      a bench with a flower pot, a washing line, flowers      alchemy  a cauldron on its fire, a table of flasks, herbs
//   guild    a training dummy, an archery target, a weapon rack      chapel   a candle shrine, a grave, flowers
//   houses   one of a woodpile, a flower box, a wash tub or hay (three houses in four)
// How: a fresh town (getMap) is given the props on plain ground tiles ('.') that touch the building: the row in front of the facade, two
// or more tiles from the door, then the tiles at its sides. A tile is taken only when the walkable reach loses nothing but that tile and
// mapIssues does not grow, never on a door apron, beside an NPC, near an exit or right behind another building (HD-2D would hide it).
// The tile itself becomes a crate tile ('x': solid, known to the minimap, the shadows and the HD-2D card strip); m.rp says what is drawn
// there. drawObjects is wrapped: the row is drawn without those crates, then the prop's own sprite (objCanvas kinds 'rp_*' registered in
// worldgfx2's P2K, so the shaded prop pass, the outline and the realm tint of cohere15 apply). HD-2D cuts its cards from drawObjects, so
// both renderers show the same props. Placement is a pure function of the map (no random numbers): a town is the same on every load.
// T22.off: new towns get none, and the ones already placed draw as crates.
const T22={off:false,n:{placed:0,towns:0},max:{svc:3,house:1},
  set:{tavern:['rp_kegs','rp_table','barrel'],smithy:['anvil','rp_rack','rp_grind'],inn:['rp_bench','rp_laundry','rp_flowers'],workshop:['rp_cauldron','rp_bottles','rp_flowers'],
    guild:['rp_dummy','rp_target','rp_rack'],chapel:['rp_candles','grave','rp_flowers'],house:['rp_woodpile','rp_flowers','rp_tub','hay']}};
// ---------- the sprites (key grids for paintP; light from the upper left) ----------
Object.assign(P2K,{
 rp_kegs:()=>{const g=new PG(20,19,1,1),keg=(cx,cy)=>{g.ell(cx,cy,4.6,4.6,'D');g.ell(cx,cy,3.6,3.6,'W');g.ell(cx,cy,2.2,2.2,'T');g.rect(cx-3,Math.floor(cy),7,1,'S');g.px([[Math.floor(cx),Math.floor(cy)+1]],'N');};
  keg(4.5,12);keg(13.5,12);keg(9,5);return [g,{W:'#9a6a3a',D:'#5e3c1e',T:'#c4914e',S:'#7c5028',N:'#d8d8e4'},{flat:'N'}];},
 rp_table:()=>{const g=new PG(18,17,1,1);g.rect(7,8,2,6,'D');g.rect(4,14,8,1,'D');g.ell(8,7,7.5,2.6,'D');g.ell(8,6,7.5,2.6,'T');
  g.rect(3,2,3,4,'Y');g.rect(3,2,3,1,'F');g.px([[6,3],[6,4]],'Y');g.rect(10,3,3,3,'Y');g.rect(10,3,3,1,'F');
  return [g,{T:'#b8844a',D:'#6a4424',Y:'#9a9aaa',F:'#fff6e0'},{flat:'F'}];},
 rp_rack:()=>{const g=new PG(18,19,1,1);g.rect(0,3,2,14,'W');g.rect(14,3,2,14,'W');g.rect(0,5,16,1,'D');g.rect(0,12,16,1,'D');
  g.rect(4,3,1,11,'M');g.rect(3,3,3,1,'G');g.px([[4,2],[4,1]],'G');g.rect(8,1,1,14,'S');g.rect(9,2,3,4,'M');g.px([[11,3],[11,4]],'H');g.rect(12,8,1,7,'S');g.ell(12.5,9.5,2.4,2.8,'R');g.px([[12,9]],'G');
  return [g,{W:'#8a5a2e',D:'#5e3c1e',M:'#9a9aaa',H:'#e8e8f6',G:'#e0b040',S:'#7c5028',R:'#a83a2a'},{flat:'H'}];},
 rp_grind:()=>{const g=new PG(18,18,1,1);g.rect(3,9,2,7,'W');g.rect(11,9,2,7,'W');g.rect(2,13,12,2,'D');g.ell(8,7,6.2,6.2,'S');g.ell(8,7,4.4,4.4,'T');g.rect(7,6,2,2,'N');
  g.line(8,7,14,4,'N');g.px([[14,3],[15,3]],'W');pOver(g,'T','U',(x,y)=>x+y>=17);return [g,{W:'#8a5a2e',D:'#5e3c1e',S:'#7e7e8a',T:'#a8a8b4',U:'#8e8e9a',N:'#3a3a44'}];},
 rp_bench:()=>{const g=new PG(20,14,1,1);g.rect(1,2,1,10,'D');g.rect(16,2,1,10,'D');g.rect(1,2,16,2,'W');g.rect(1,5,16,1,'W');g.rect(0,7,18,2,'L');g.rect(2,9,1,3,'D');g.rect(15,9,1,3,'D');
  g.rect(11,4,4,3,'P');g.rect(12,2,2,2,'G');g.px([[11,1],[13,0],[14,2]],'R');g.px([[12,1]],'Y');return [g,{W:'#8a5a2e',L:'#b8844a',D:'#5e3c1e',P:'#b0603a',G:'#3f8a3a',R:'#e0485a',Y:'#ffd860'},{flat:'RY'}];},
 rp_flowers:()=>{const g=new PG(18,14,1,1);g.ell(8,6,7,2.6,'G');g.rect(1,7,14,5,'W');g.rect(1,7,14,1,'L');g.rect(1,11,14,1,'D');g.px([[2,4],[5,5],[9,5],[12,4],[7,3]],'g');
  g.px([[3,3],[10,3],[14,5]],'R');g.px([[6,2],[12,2],[1,5]],'Y');g.px([[8,4],[4,5],[11,5]],'P');return [g,{W:'#8a5a2e',L:'#b8844a',D:'#5e3c1e',G:'#3f8a3a',g:'#6cc05a',R:'#e0485a',Y:'#ffd860',P:'#c88af0'},{flat:'RYPg'}];},
 rp_laundry:()=>{const g=new PG(20,24,1,1);g.rect(1,1,1,21,'W');g.rect(16,1,1,21,'W');g.rect(0,21,3,1,'D');g.rect(15,21,3,1,'D');g.rect(2,3,14,1,'S');
  g.rect(3,4,4,8,'A');g.rect(8,4,3,5,'B');g.rect(12,4,3,9,'R');g.px([[3,3],[6,3],[8,3],[10,3],[12,3],[14,3]],'D');return [g,{W:'#8a5a2e',D:'#5e3c1e',S:'#cdbf9a',A:'#f1eee4',B:'#4a7ad0',R:'#c8483a'},{flat:'S'}];},
 rp_cauldron:()=>{const g=new PG(18,18,1,1);g.rect(3,12,2,4,'K');g.rect(11,12,2,4,'K');g.px([[6,15],[9,15],[7,14]],'F');g.px([[7,15],[8,15],[8,14]],'Y');g.ell(8,9,6.6,5.4,'K');pOver(g,'K','Q',(x,y)=>x<=3&&y>=6&&y<=11);
  g.ell(8,5,6.6,2.1,'Q');g.ell(8,5,5,1.3,'G');g.px([[6,5],[10,4]],'g');g.px([[5,2],[9,0],[11,2],[8,2]],'g');return [g,{K:'#2e2e3a',Q:'#62627a',G:'#3fb060',g:'#9affb8',F:'#ff7a2a',Y:'#ffd870'},{flat:'GgFY'}];},
 rp_bottles:()=>{const g=new PG(18,17,1,1),fl=(x,y,h,k)=>{g.rect(x,y+2,3,h,k);g.px([[x+1,y],[x+1,y+1]],'N');g.px([[x,y+2]],'H');};g.rect(1,10,2,6,'D');g.rect(13,10,2,6,'D');g.rect(1,13,14,1,'D');g.rect(0,8,16,2,'L');
  fl(2,3,3,'R');fl(7,1,5,'B');fl(11,4,2,'G');return [g,{L:'#b8844a',D:'#5e3c1e',R:'#e0485a',B:'#5a9af0',G:'#5ad07a',N:'#d8e8f0',H:'#ffffff'},{flat:'RBGNH'}];},
 rp_dummy:()=>{const g=new PG(18,22,1,1);g.rect(4,19,8,1,'D');g.rect(7,8,2,11,'W');g.rect(2,8,12,2,'W');g.ell(8,12,3.7,4.2,'H');g.ell(8,3.5,3.1,3.1,'H');g.rect(5,7,6,1,'S');
  g.px([[7,3],[9,3],[8,5]],'S');g.px([[7,11],[9,11],[8,10],[8,12],[7,13],[9,13]],'R');g.px([[8,11]],'Y');return [g,{W:'#8a5a2e',D:'#5e3c1e',H:'#d8b866',S:'#7c5028',R:'#c8382a',Y:'#fff0a0'},{flat:'RY'}];},
 rp_target:()=>{const g=new PG(18,20,1,1);g.line(3,18,6,10,'W');g.line(13,18,10,10,'W');g.rect(8,11,1,7,'D');g.ell(8,7,6.6,6.6,'A');g.ell(8,7,4.9,4.9,'R');g.ell(8,7,3.2,3.2,'A');g.ell(8,7,1.5,1.5,'R');
  g.line(9,6,13,2,'S');g.px([[14,1],[14,2],[13,1]],'F');return [g,{W:'#8a5a2e',D:'#5e3c1e',A:'#efe6d0',R:'#c8382a',S:'#5e3c1e',F:'#f6f6ff'},{flat:'RF'}];},
 rp_candles:()=>{const g=new PG(16,17,1,1);g.rect(2,9,10,6,'S');g.rect(1,8,12,2,'T');g.rect(1,14,12,1,'T');g.rect(6,10,2,4,'G');g.rect(5,11,4,1,'G');
  g.rect(3,5,2,3,'C');g.rect(6,3,2,5,'C');g.rect(9,6,2,2,'C');g.px([[3,4],[6,2],[9,5]],'F');g.px([[4,3],[7,1],[10,4]],'Y');return [g,{S:'#8a8a98',T:'#b4b4c2',G:'#e0b040',C:'#f4ecd8',F:'#ff9a3a',Y:'#fff0a0'},{flat:'GFY'}];},
 rp_woodpile:()=>{const g=new PG(19,14,1,1),lg=(cx,cy)=>{g.ell(cx,cy,2.3,2.3,'W');g.ell(cx,cy,1.3,1.3,'L');g.px([[Math.floor(cx),Math.floor(cy)]],'D');};
  [2.5,6.5,10.5,14.5].forEach(x=>lg(x,10));[4.5,8.5,12.5].forEach(x=>lg(x,6.5));[6.5,10.5].forEach(x=>lg(x,3));return [g,{W:'#7a5028',L:'#d0a468',D:'#8a5e30'}];},
 rp_tub:()=>{const g=new PG(18,15,1,1);g.rect(11,0,4,7,'S');g.px([[12,1],[13,1],[12,3],[13,3],[12,5],[13,5]],'N');g.ell(8,9,7,4,'W');g.rect(1,10,14,1,'M');g.ell(8,6,7,2.6,'L');g.ell(8,6,5.6,1.7,'B');
  g.px([[5,5],[8,6],[6,6],[10,5]],'H');g.rect(1,5,3,4,'A');return [g,{W:'#8a5a2e',L:'#b8844a',M:'#5a5a62',B:'#6ab8e8',H:'#ffffff',S:'#a8783a',N:'#6a4624',A:'#f1eee4'},{flat:'BH'}];}
});
// ---------- placement ----------
const t22H=b=>((b.x*73856093)^(b.y*19349663)^((b.w||1)*83492791))>>>0;
function t22Reach(m){try{const s=mapEntry(m);if(!s)return -1;const R=healReach(m,s,true,true);let n=0;for(const r of R)for(const v of r)if(v)n++;return n;}catch(e){return -1;}}
function t22Iss(m){try{return mapIssues(m).length;}catch(e){return 0;}}
function t22Place(m){if(!m||m.kind!=='town'||m.archive||m.rp!==undefined||!m.t||!m.bld)return;m.rp=null;if(T22.off)return;
  const g=m.t,H=g.length,W=g[0].length,no=new Set(),K=(x,y)=>x+','+y,at=(x,y)=>(g[y]||[])[x];
  m.bld.forEach(b=>{if(!b.door)return;for(let a=-1;a<=1;a++)for(let d=1;d<=2;d++)no.add(K(b.door[0]+a,b.door[1]+d));});
  (m.npcs||[]).forEach(n=>[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,c])=>{no.add(K(n.x+a,n.y+c));if(n.hx!=null)no.add(K(n.hx+a,n.hy+c));}));
  const ex=(m.exits||[]).map(e=>[e.x,e.y]);if(m.gates)Object.values(m.gates).forEach(q=>{if(q&&q.arrive)ex.push(q.arrive);});
  ex.forEach(([x,y])=>{for(let a=-3;a<=3;a++)for(let c=-3;c<=3;c++)no.add(K(x+a,y+c));});
  const tall=c=>c==='H'||c==='#'||c==='Y',free=(x,y)=>x>1&&y>1&&x<W-2&&y<H-2&&at(x,y)==='.'&&!no.has(K(x,y))&&!tall(at(x,y+1))&&!tall(at(x,y+2));
  let reach=t22Reach(m),iss=t22Iss(m);if(reach<0)return;const rp={};let n=0;
  m.bld.forEach(b=>{const list=T22.set[b.k];if(!list||!b.door)return;const h=t22H(b),house=b.k==='house';if(house&&h%4===3)return;
    const fy=b.y+b.h,dx=b.door[0],spots=[];
    for(let x=b.x;x<b.x+b.w;x++)if(Math.abs(x-dx)>=2)spots.push([x,fy,Math.abs(x-dx)]);
    spots.sort((p,q)=>p[2]-q[2]||((h>>>2)%2?p[0]-q[0]:q[0]-p[0]));
    const sy=b.y+b.h-1;((h>>>4)%2?[[b.x-1,sy],[b.x+b.w,sy]]:[[b.x+b.w,sy],[b.x-1,sy]]).forEach(p=>spots.push(p));
    const kinds=house?[list[(h>>>6)%list.length]]:list;let k=0;
    for(const [x,y] of spots){if(k>=Math.min(kinds.length,house?T22.max.house:T22.max.svc))break;if(!free(x,y))continue;
      g[y][x]='x';const r2=t22Reach(m),i2=t22Iss(m);
      if(r2>=reach-1&&i2<=iss){rp[K(x,y)]=kinds[k++];reach=r2;iss=i2;n++;no.add(K(x,y));}else g[y][x]='.';}});
  if(!n)return;const rows={};Object.keys(rp).forEach(key=>{const [x,y]=key.split(',').map(Number);(rows[y]=rows[y]||[]).push({x,k:rp[key]});});
  m.rp={at:rp,rows,n};m.tl=null;T22.n.placed+=n;T22.n.towns++;}
HOOK.wrap('getMap','towns22','props that mark a building\'s role, in every new town',function(next,...a){const id=a[0],fresh=typeof id==='string'&&id[0]==='t'&&!MAPS[id];const m=next(...a);
  try{if(fresh&&m&&m.kind==='town')t22Place(m);}catch(e){T22.err=String(e&&e.message||e);try{wdLog('towns22 '+id+': '+e.message);}catch(_){}}return m;});
// ---------- drawing (2D, and through the card strip HD-2D) ----------
HOOK.wrap('drawObjects','towns22','the role props stand where their crate tiles are',function(next,ctx,m,y){const row=m&&m.rp&&m.rp.rows[y];if(!row||T22.off)return next(ctx,m,y);
  const live=row.filter(p=>m.t[y]&&m.t[y][p.x]==='x');live.forEach(p=>{m.t[y][p.x]='.';});let r;try{r=next(ctx,m,y);}finally{live.forEach(p=>{m.t[y][p.x]='x';});}
  live.forEach(p=>{try{const cv=objCanvas(m.theme,p.k);if(!cv||!cv.width)return;const px=p.x*TS,py=y*TS;shadowAt(ctx,px+8,py+14,Math.min(9,cv.width>>1),2);
    ctx.drawImage(cv,px+Math.round((TS-cv.width)/2),py+TS-cv.height+1);}catch(e){T22.err=String(e&&e.message||e);}});return r;});
// tests
try{window.__T22={T22,place:t22Place,kinds:()=>Object.keys(P2K).filter(k=>k.startsWith('rp_'))};}catch(e){}
