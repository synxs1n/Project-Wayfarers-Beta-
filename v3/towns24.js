// ===== towns24.js (v0.22.21): new town plans: every building in clear view at the old camera, a clear road from the centre to every gate =====
// Owner on 0.22.20 (a steeper camera in town, the towns14 layouts stretched): "higher town angle is awkward, go back to old angle and ensure
// buildings are separate enough that they are in clear view. there should always be a clear path from the center of towns to its gates. towns
// barely changed layouts at all, they are exactly the same, i want entire reworks of where buildings are".
// So: the camera is 40 everywhere again (towns23.js is gone), and the town plans are new. towns14.js keeps the building families (what a
// house is made of), its kit (t14T, t14Frame, t14Link, t14Deco, t14Check) and stays as the fallback; its nineteen hand placed plans are no
// longer used while a towns24 plan passes its checks.
//
// THE RULES every plan is built on and checked against (t24Check, three tries with other seeds, else the towns14 plan):
//  1 In view. At pitch 40 a 4 deep building hides the ground for 4.8 tiles north of its front, a 5 deep one 5.9. So no building stands within
//    T24.need(h) rows (5, or 6 for a 5 deep one) SOUTH of another building's front in its columns (one column of margin). Buildings are 4 deep
//    (the guild hall and the chapel 5), not 5 and 6 as before, which is half of why they hid each other.
//  2 A clear road. The main road runs straight from the west edge to the east edge through the plaza, and an avenue straight from the north
//    edge to the south edge through the plaza; no building, prop or water on either. A gate cut into the north or south wall away from the
//    avenue gets a lane along the inside of that wall to the avenue (t24GateLane, after getMap has placed the gates).
//  3 The waystone and the board stand on the plaza, off the road and the avenue.
//  4 Footprints by role (T24_SZ): the guild hall 8 x 5, the inn 7 x 4, the tavern 6 x 4, the smithy 5 x 4, the alchemist 4 x 4, the chapel
//    5 x 5, houses 3, 4 or 5 wide. Which slot of a plan a service takes is drawn per town, so two towns on one plan differ.
//
// THE PLANS (TA24), each a list of slots (centre column, front row) on its own ground:
//   cross     a market cross: a square plaza, a row of buildings in each quarter, all facing the road
//   street    a long high street: the services in one row north of a paved walk, houses in a row south of it
//   crescent  an arc of buildings round a big oval green north of the road, a short row south of it
//   bricks    three terraces, each row shifted half a house against the next, the plaza on the road below them
//   lakeside  two shifted rows above a paved quay, piers into the water south of the road
//   twin      two plazas on the road, a small arc of buildings north of each, a park between them
//   steps     a stair of buildings climbing away from the road on each side, ledges under them
//   ring      a round plaza, buildings on a wide oval round it
//   court     a walled court: the hall at the head, a stack of buildings down each side, the court open in the middle
// A realm's plan, mirror and frame come from T24_TAB (20 realms and the six base zones); an unknown key takes a plan by its theme.
// T24.off: the towns14 plans again.
const T24={off:false,n:{made:0,fallback:0,lane:0},tab:{},need:h=>h>=5?6:5};
const T24_SZ={inn:[7,4],tavern:[6,4],smithy:[5,4],workshop:[4,4],guild:[8,5],chapel:[5,5],house:[[4,4],[3,4],[5,4]]};
const TA24={};
// ---------- the kit ----------
function t24Size(k,i){const s=T24_SZ[k];return k==='house'?s[i%s.length]:s;}
// place the kinds on the slots: slots are {x: centre column, y: front (bottom) row, w: the widest building the slot takes}
function t24Fill(T,slots,kinds){let hi=0;slots.forEach((s,i)=>{const k=kinds[i];if(!k)return;let [w,h]=t24Size(k,hi);if(k==='house')hi++;if(s.w&&w>s.w){if(k==='house'){[w,h]=[Math.min(w,s.w),4];}else w=s.w;}
    const x=Math.round(s.x-w/2),y=s.y-h+1;T.B(k,x,y,w,h);});}
// which kind goes in which slot: the services first on the slots the plan ranks first (slot.p, low first), their order drawn by R
function t24Kinds(slots,R){const svc=['guild','inn','tavern','smithy','chapel','workshop'],rank=slots.map((s,i)=>({i,p:(s.p||0)+R()*2.5})).sort((a,b)=>a.p-b.p),out=new Array(slots.length).fill(null);
  svc.forEach(k=>{const [w,h]=t24Size(k,0),q=rank.find(o=>!out[o.i]&&(slots[o.i].w||9)>=w&&(slots[o.i].h||5)>=h);if(q)out[q.i]=k;});/* slot.h 4: no 5 deep building here (it would hide the row behind it) */rank.forEach(o=>{if(!out[o.i])out[o.i]='house';});return out;}
function t24Edge(T,th,wall){const W=T.W,H=T.H;if(wall)t14Frame(T,'Z',1);else if(th==='cave'||th==='void')t14Frame(T,'#',0,2);else if(th==='heights')t14Frame(T,'#',0,1);else if(th==='snow')t14Frame(T,'Z',1);else if(th==='coast')t14Frame(T,'Z',1);else t14Frame(T,'T',0,2);}
function t24Avenue(T,cx){for(let y=1;y<T.H-1;y++)if(T.get(cx,y)!=='=')T.put(cx,y,'=');}
function t24Plaza(T,cx,r,rx,ry,round){if(round)t14Ell(T,cx,r,rx,ry,':',['.',',','f','t']);else for(let y=r-ry;y<=r+ry;y++)for(let x=cx-rx;x<=cx+rx;x++)if('.,ft'.includes(T.get(x,y)))T.put(x,y,':');
  T.put(cx-2,r-2,'W');T.put(cx+2,r-2,'q');}
// ---------- the plans ----------
TA24.cross=(R,th,o)=>{const W=54,H=30,r=15,cx=27,T=t14T(W,H,r,th);t24Edge(T,th,o.wall);t24Avenue(T,cx);t24Plaza(T,cx,r,5,4);
  const n=r-6,s=r+9,slots=[{x:20,y:n,w:8,p:0},{x:11,y:n,w:7,p:2},{x:35,y:n,w:8,p:1},{x:45,y:n,w:7,p:3},{x:6,y:s,w:5,p:6},{x:14,y:s,w:6,p:4},{x:21,y:s,w:5,p:7},{x:33,y:s,w:6,p:5},{x:41,y:s,w:5,p:8},{x:48,y:s,w:5,p:9}];
  t14Put(T,[[cx-5,r-4],[cx+5,r-4],[cx-5,r+4],[cx+5,r+4]],'L');t14Put(T,[[cx-4,r+3],[cx+4,r+3]],'m');T.slots=slots;return T;};
TA24.street=(R,th,o)=>{const W=62,H=26,r=12,cx=31,T=t14T(W,H,r,th);t24Edge(T,th,o.wall);t24Avenue(T,cx);T.rect(3,r-1,W-6,1,':');T.rect(3,r+1,W-6,1,':');t24Plaza(T,cx,r,4,3,1);
  const n=r-4,s=r+9,slots=[];[7,17,26,37,46,55].forEach((x,i)=>slots.push({x,y:n,w:i===2||i===3?8:7,p:Math.abs(i-2.5)}));[8,16,24,38,46,54].forEach((x,i)=>slots.push({x,y:s,w:5,p:6+i}));
  t14Put(T,[[12,r+1],[21,r+1],[42,r+1],[51,r+1]],'m');T.slots=slots;return T;};
TA24.crescent=(R,th,o)=>{const W=68,H=36,r=24,cx=34,T=t14T(W,H,r,th);t24Edge(T,th,o.wall);t24Avenue(T,cx);t14Ell(T,cx,r-7,16,6,':',['.']);t14Ell(T,cx,r-7,13,4,',',[':']);
  for(let y=r-13;y<=r;y++)T.put(cx,y,'=');t24Plaza(T,cx,r,5,2);
  const slots=[];[-27,-18,-8,8,18,27].forEach((d,i)=>{const t=Math.abs(d)/27;slots.push({x:cx+Math.round(d),y:Math.round(r-17+11*t*t),w:Math.abs(d)<9?8:Math.abs(d)<20?7:6,p:Math.abs(d)/8});});
  slots.push({x:cx-24,y:r+8,w:5,p:7},{x:cx-12,y:r+8,w:5,p:8},{x:cx+12,y:r+8,w:5,p:9},{x:cx+24,y:r+8,w:5,p:10});
  if(o.pond){t14Ell(T,cx-7,r-7,4,2,'~',[',']);t14Ell(T,cx+7,r-7,4,2,'~',[',']);}t14Put(T,[[cx-14,r-2],[cx+14,r-2]],'L');T.slots=slots;return T;};
TA24.bricks=(R,th,o)=>{const W=58,H=40,r=33,cx=29,T=t14T(W,H,r,th);t24Edge(T,th,o.wall);t24Avenue(T,cx);t24Plaza(T,cx,r,6,2);
  const rows=[7,17,27],slots=[];rows.forEach((y,j)=>{const sh=j%2?5:0;[7,18,cx+11,cx+22].forEach((x,i)=>{const xx=x+(i<2?sh:-sh);slots.push({x:xx,y,w:i===1&&j===0?8:7,h:j===0?5:4,p:(2-j)*4+Math.abs(xx-cx)/10});});});
  // a low ledge under each terrace: a line of the frame's material with a stair where the avenue and each link come through
  if(o.ledge)rows.slice(0,2).forEach(y=>{for(let x=3;x<W-3;x++)if(x%6===0&&T.get(x,y+3)==='.')T.put(x,y+3,'f');});
  T.slots=slots;return T;};
TA24.lakeside=(R,th,o)=>{const W=56,H=34,r=20,cx=28,T=t14T(W,H,r,th);for(let x=0;x<W;x++){T.put(x,0,'Z');for(let y=r+5;y<H;y++)T.put(x,y,'~');}for(let y=0;y<r+5;y++){T.put(0,y,'Z');T.put(W-1,y,'Z');}T.rect(0,r,W,1,'=');
  [[0,0],[W-1,0],[0,r-1],[0,r+1],[W-1,r-1],[W-1,r+1]].forEach(([x,y])=>T.put(x,y,'Y'));
  T.rect(1,r+1,W-2,4,':');t24Avenue(T,cx);for(let y=r+5;y<H-1;y++)T.put(cx,y,'B');[10,19,37,46].forEach(x=>{for(let y=r+5;y<r+10;y++)T.put(x,y,'B');});t24Plaza(T,cx,r,5,2);
  const slots=[];[8,19,cx+9,cx+20].forEach((x,i)=>slots.push({x,y:r-4,w:i===1?8:7,p:Math.abs(x-cx)/10}));[13,23,cx+5,cx+14,cx+23,4].forEach((x,i)=>slots.push({x,y:r-15,w:i<2?7:5,p:4+i}));
  t14Put(T,[[6,r+2],[15,r+2],[41,r+2],[50,r+2]],'m');T.slots=slots;T.wet=1;return T;};
TA24.twin=(R,th,o)=>{const W=64,H=34,r=20,cx=32,T=t14T(W,H,r,th);t24Edge(T,th,o.wall);t24Avenue(T,cx);const a=16,b=48;
  [a,b].forEach(px=>{t14Ell(T,px,r,6,3,':',['.']);for(let y=r-3;y<=r;y++)if(T.get(px,y)==='.')T.put(px,y,':');});T.put(a-2,r-2,'W');T.put(b+2,r-2,'q');
  const slots=[];[a,b].forEach((px,k)=>[-9,0,9].forEach((d,i)=>slots.push({x:px+d,y:r-(i===1?10:6),w:i===1?8:6,p:k+(i===1?0:2)})));
  [a-8,a+2,cx+6,b+4,b+12].forEach((x,i)=>slots.push({x,y:r+9,w:5,p:6+i}));
  // the park between the plazas: trees either side of the avenue
  for(let y=r-12;y<r-2;y+=3)[cx-3,cx+3].forEach(x=>{if(T.get(x,y)==='.')T.put(x,y,th==='cave'||th==='void'||th==='heights'?'P':'T');});T.slots=slots;return T;};
TA24.steps=(R,th,o)=>{const W=60,H=38,r=18,cx=30,T=t14T(W,H,r,th);t24Edge(T,th,o.wall);t24Avenue(T,cx);t24Plaza(T,cx,r,5,3);
  const slots=[];[0,1,2].forEach(i=>{slots.push({x:6+i*9,y:5+i*3,w:i===2?8:7,p:2-i});slots.push({x:W-7-i*9,y:5+i*3,w:7,p:2.5-i});});
  [0,1,2].forEach(i=>{slots.push({x:22-i*8,y:r+7+i*4,w:6,p:6+i});slots.push({x:W-23+i*8,y:r+7+i*4,w:6,p:6.5+i});});
  T.slots=slots;return T;};
TA24.ring=(R,th,o)=>{const W=54,H=36,r=20,cx=27,T=t14T(W,H,r,th);t24Edge(T,th,o.wall);t24Avenue(T,cx);t14Ell(T,cx,r,8,6,':',['.']);T.rect(cx-9,r,19,1,'=');for(let y=r-6;y<=r+6;y++)T.put(cx,y,'=');
  T.put(cx-3,r-3,'W');T.put(cx+3,r-3,'q');if(o.pond)T.rect(cx-5,r+2,2,2,'O');
  const P=(deg,rx,ry)=>[cx+Math.round(rx*Math.cos(deg*Math.PI/180)),r+Math.round(ry*Math.sin(deg*Math.PI/180))],slots=[];
  [[208,22,12,7,3],[243,19,14,8,0],[297,19,14,7,1],[332,22,12,7,2]].forEach(([d,rx,ry,w,p])=>{const [x,y]=P(d,rx,ry);slots.push({x,y,w,p});});
  [[150,21,11,6,4],[30,21,11,6,5],[120,15,13,6,6],[60,15,13,6,7]].forEach(([d,rx,ry,w,p])=>{const [x,y]=P(d,rx,ry);slots.push({x,y,w,p});});
  T.slots=slots;return T;};
TA24.court=(R,th,o)=>{const W=50,H=40,r=33,cx=25,T=t14T(W,H,r,th);t24Edge(T,th,1);t24Avenue(T,cx);T.rect(cx-7,9,15,21,':');for(let y=9;y<r;y++)T.put(cx,y,'=');
  T.put(cx-3,20,'W');T.put(cx+3,20,'q');if(o.pond)T.rect(cx-5,24,2,2,'O');
  const slots=[{x:cx-5,y:7,w:8,p:0}];[[7,0],[W-8,0],[W-16,7]].forEach(([x,dy],c)=>[9,18,27].forEach((y,j)=>{if(c>1&&j===2)return;slots.push({x,y:y+dy,w:c<2?7:5,p:1+j+c*.3});}));
  T.slots=slots;return T;};
// ---------- checks ----------
function t24Check(t){const out=[],g=t.g,H=g.length,W=g[0].length,r=t.road,B=t.bld;
  B.forEach(b=>B.forEach(c=>{if(b===c||c.y<b.y+b.h)return;if(c.x<b.x+b.w+1&&b.x<c.x+c.w+1){const gap=c.y-(b.y+b.h);if(gap<T24.need(c.h))out.push('view '+b.k+'@'+b.x+','+b.y+' behind '+c.k+' gap '+gap);}}));
  const road=c=>c==='='||c===':'||c==='B';for(let x=1;x<W-1;x++)if(!road(g[r][x])){out.push('road cut at '+x);break;}
  const cx=t.cx;if(cx!=null)for(let y=2;y<H-2;y++)if(!road(g[y][cx])){out.push('avenue cut at '+y);break;}
  return out;}
function t24Make(arch,R,v,th,o){const T=TA24[arch](R,th,o||{}),W=T.W,cx=T.slots?null:null;t24Fill(T,T.slots,t24Kinds(T.slots,R));
  // nothing of a building on the road or the avenue
  if(v&1)t14Flip(T);
  if(T.get(W-3,T.road+1)!=='.'&&T.get(W-3,T.road+1)!==':')T.put(W-3,T.road+1,'.');T.put(W-3,T.road+1,'S');
  t14Link(T,!!T.wet);t14Deco(T,R,{crates:1,lamp:th==='cave'||th==='void'?'v':'L'});
  const t=townFinish(T,th,R,T.road);t.arch='n_'+arch;t.cx=W>>1;if(v&1&&W%2===0)t.cx=W-1-(W>>1);return t;}
// ---------- assignment ----------
// [plan, mirrored, options]
const T24_TAB={thistle:['crescent',0,{pond:1}],orchard:['street',0,{}],strand:['lakeside',0,{}],mire:['ring',0,{pond:1}],deeps:['court',0,{}],grotto:['steps',0,{}],
  tundra:['court',1,{pond:1}],glacier:['bricks',0,{ledge:1}],peaks:['steps',1,{}],mesa:['cross',0,{wall:1}],lakes:['twin',0,{}],mines:['bricks',1,{}],
  ashglass:['street',1,{wall:1}],moors:['bricks',0,{ledge:1}],bamboo:['ring',1,{}],bone:['cross',1,{}],
  ashen:['ring',0,{}],drowned:['lakeside',1,{}],starless:['crescent',1,{}],shattered:['twin',1,{}],
  base0:['cross',0,{}],base1:['lakeside',1,{}],base2:['court',0,{}],base3:['bricks',0,{}],base4:['steps',0,{}],base5:['ring',1,{}]};
const T24_BY_TH={meadow:'crescent',coast:'lakeside',cave:'court',snow:'bricks',heights:'steps',void:'ring'};
function t24Assign(Z){const k=typeof t14Key==='function'?t14Key(Z):Z.key,r=T24_TAB[k];if(r)return {arch:r[0],v:r[1],o:r[2]};return {arch:T24_BY_TH[Z.theme0||Z.theme]||'cross',v:0,o:{}};}
HOOK.wrap('townGen','towns24','the new town plans (in view at pitch 40, a clear road to every edge); the towns14 plan is the fallback',function(next,Z,s,R){
  if(T24.off||(typeof T14!=='undefined'&&T14.off)||(typeof t14On==='function'&&!t14On()))return next(Z,s,R);/* T14.off asks for the theme layouts of before 0.20.6 (v071wb's scene) */
  try{const a=t24Assign(Z),fam=(typeof t14Assign==='function'&&t14Assign(Z)||{}).fam,th=Z.theme0||Z.theme||'meadow';
    for(let k=0;k<4;k++){try{const t=t24Make(a.arch,k?mulberry(hashS('t24:'+a.arch+':'+s+':'+k)):R,a.v,th,a.o);const bad=t14Check(t).concat(t24Check(t));if(!bad.length){t.sty=fam||null;T24.n.made++;return t;}T24.last=bad;}catch(e){T24.err=String(e&&e.message||e);}}
  }catch(e){T24.err=String(e&&e.message||e);}
  T24.n.fallback++;return next(Z,s,R);});
// ---------- a gate in the north or south wall: a lane along the wall to the avenue ----------
function t24GateLane(m){if(!m||m.kind!=='town'||!m.t||!m.gates||!/^n_/.test(m.arch||''))return 0;const g=m.t,H=g.length,W=g[0].length,road=m.road;let n=0;
  const ax=(()=>{for(const x of [W>>1,W-1-(W>>1)]){let ok=0;for(let y=3;y<H-3;y++)if(g[y][x]==='='||g[y][x]===':'||g[y][x]==='B')ok++;if(ok>=H-8)return x;}return null;})();if(ax==null)return 0;
  Object.values(m.gates).forEach(q=>{if(!q||!q.arrive||(q.side!=='n'&&q.side!=='s'))return;const [gx,gy]=q.arrive;if(gx===ax)return;const d=gx<ax?1:-1;
    for(let x=gx;x!==ax+d;x+=d){const c=g[gy][x];if(c==='H'||c==='Z'||c==='Y'||c==='#')return;}
    for(let x=gx;x!==ax+d;x+=d){const c=g[gy][x];if(c!=='='&&c!==':'&&c!=='B'){g[gy][x]=c==='~'?'B':'=';n++;}}
    for(let y=Math.min(gy,road);y<=Math.max(gy,road);y++){const c=g[y][ax];if(c!=='='&&c!==':'&&c!=='B'&&c!=='H')g[y][ax]=c==='~'?'B':'=';}});
  if(n){m.tl=null;T24.n.lane+=n;
    // nobody stands on the new lane: a villager on it steps to the nearest open ground
    (m.npcs||[]).forEach(q=>{const c=(g[q.y]||[])[q.x];if(c!=='='&&c!=='B')return;for(let d=1;d<6;d++)for(const [a,b] of [[0,-d],[0,d],[-d,0],[d,0],[-d,-d],[d,-d],[-d,d],[d,d]]){const x=q.x+a,y=q.y+b,t=(g[y]||[])[x];
      if((t==='.'||t===','||t===':')&&!m.npcs.some(o=>o!==q&&o.x===x&&o.y===y)&&!m.bld.some(bb=>bb.door&&bb.door[0]===x&&Math.abs(bb.door[1]+1-y)<=1)){q.x=x;q.y=y;if(q.hx!=null){q.hx=x;q.hy=y;}return;}}});}
  return n;}
HOOK.wrap('getMap','towns24','a gate in the north or south wall gets a lane to the avenue',function(next,...a){const id=a[0],fresh=typeof id==='string'&&id[0]==='t'&&!MAPS[id];const m=next(...a);
  try{if(fresh&&m&&m.kind==='town')t24GateLane(m);}catch(e){T24.err=String(e&&e.message||e);}return m;});
// a hero saved inside what is now a building or a prop (the towns were rebuilt) stands at the town's entry instead
{const e0=enterWorldFromSave;enterWorldFromSave=function(){const r=e0.apply(this,arguments);try{const m=WS&&WS.m;if(m&&m.kind==='town'&&m.t&&(()=>{const c=(m.t[WS.y]||[])[WS.x];return c==null||SOLID.includes(c);})()){const p=mapEntry(m);if(p)placeAt(m.id,p[0],p[1],'d');}}catch(e){}return r;};}
try{window.__T24={T24,TA24,check:t24Check,assign:t24Assign,make:t24Make};}catch(e){}
