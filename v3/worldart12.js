// ===== worldart12.js (v0.19.2): exits on land, entrances with volume, sanctum carpets, weather in world space, pickups in the world's palette, the Mimic as a chest =====
// Owner's six requests after v0.19.1 (docs/v0192-worldart12.md):
//  1 a field's exit sits on land: the mouth of the lane that leaves a field (and the one back to town) had void ('~') beside and under it in the
//    realms that have void, a 3 wide strip of ground with a cliff drop at its sides ("some land is missing in the path to the next area"). Every exit now has
//    an apron of ground, 11 wide and 7 deep (void turned to plain ground only, nothing else moves); drawAudit reports what is left in `exitLand`.
//  2 den, dungeon (lair) and cave entrances are rebuilt with volume in both renderers (see section 2)
//  3 the Sanctum's side carpets are their own panels (border, weave, fringe and a seam against the runner) that fill the floor to the pillars
//  4 weather and ambience stay where they are when the hero walks: every parallax in WX7 is 1 (the far layer lagged the camera by 18% and the near
//    one led it by 35%, so rain and snow slid past the hero), so each particle is anchored in the world on every tier, in 2D and in the HD-2D overlay
//  5 gather nodes (herbs, ore, wood) are drawn like the world's props (lit from the upper left, three tone, outlined, a small shadow, a slow sparkle)
//    instead of the inventory icon pasted on the ground
//  6 the Mimic is a chest first (lid, planks, bands, lock) with teeth top and bottom in the open mouth and a tongue
// Nothing here touches a save, the Daily Trial, game state or the random numbers. Tests: tools/chrome/v174a.js.
const WA12={n:{exit:0,node:0,carpet:0,den:0,lair:0},off:false,err:[]};
function wa12Err(w,e){if(WA12.err.length<20)WA12.err.push(w+': '+(e&&e.message||e));}
// ---------- 1. exits on land ----------
const WA12_APRON={d:7,q:5};
function wa12ExitGroups(m){const g=m&&m.t;if(!g||!m.exits||!m.exits.length)return [];const H=g.length,W=g[0].length,by={};
  m.exits.forEach(e=>{const edge=e.y===0?'n':e.y===H-1?'s':e.x===0?'w':e.x===W-1?'e':'';if(!edge)return;const k=edge+':'+(e.to&&e.to.g||'')+':'+(e.to&&e.to.m||'');(by[k]=by[k]||[]).push(e);});
  return Object.keys(by).map(k=>{const edge=k[0],list=by[k],h=edge==='n'||edge==='s',key=e=>h?e.x:e.y;list.sort((a,b)=>key(a)-key(b));const mid=list[Math.floor(list.length/2)];
    return {edge,e:mid,n:edge==='n'?[0,1]:edge==='s'?[0,-1]:edge==='w'?[1,0]:[-1,0],l:h?[1,0]:[0,1]};});}
// the tiles of the apron: d rows in from the edge, q tiles either side of the exit's middle
function wa12Apron(m,G,fn){const g=m.t,H=g.length,W=g[0].length,A=WA12_APRON;
  for(let d=0;d<A.d;d++)for(let q=-A.q;q<=A.q;q++){const x=G.e.x+G.n[0]*d+G.l[0]*q,y=G.e.y+G.n[1]*d+G.l[1]*q;if(x<0||y<0||x>=W||y>=H)continue;fn(x,y,d,q);}}
function wa12ExitIssues(m){const out=[];try{if(!m||m.kind!=='field')return out;wa12ExitGroups(m).forEach(G=>wa12Apron(m,G,(x,y,d,q)=>{if(m.t[y][x]==='~')out.push({x,y,why:'void in the apron of the exit at '+G.e.x+','+G.e.y});}));}catch(e){wa12Err('exitIssues',e);}return out;}
function wa12ExitLand(m){let n=0;try{if(!m||m.kind!=='field'||WA12.off)return 0;
  wa12ExitGroups(m).forEach(G=>wa12Apron(m,G,(x,y)=>{if(m.t[y][x]==='~'){m.t[y][x]='.';n++;}}));
  if(n){m.exitLand=(m.exitLand||0)+n;WA12.n.exit+=n;if(m.tl)m.tl=null;}}catch(e){wa12Err('exitLand',e);}return n;}
HOOK.wrap('getMap','worldart12','a field exit sits on land (no void in its apron)',function(next,...a){const had=!!MAPS[a[0]];const m=next(...a);try{if(!had&&m&&m.kind==='field'&&!m.__wa12x){m.__wa12x=1;wa12ExitLand(m);}}catch(e){wa12Err('getMap',e);}return m;});
HOOK.xform('drawAudit','worldart12','exit aprons: no void beside or under an exit',function(out,m){try{if(out)out.exitLand=wa12ExitIssues(m);}catch(e){wa12Err('audit',e);}return out;});
// ---------- 4. weather in world space ----------
// WX7.par and WX7.fogPar scale how far each layer scrolls against the camera (1 = exactly with the ground). They were [.82,1,1.35] and [.96,1,1.05]
WX7.par.fill(1);WX7.fogPar.fill(1);
// ---------- 3. the Sanctum's side carpets ----------
// The garden between the colonnades was a lawn (upper half) and raked gravel (lower half) laid against the runner with a curb only where it met a path, and in the
// hall the floor beside the runner was bare flagstone: the runner looked as if it lay over everything. Now each side of the aisle is a set of panels: a flagstone seam
// (2 px, shaded) round every panel, then its own dark edge, a two tone gold border, a woven border band and a diamond weave in the field, fringe where it ends at a
// path. The garden panels fill the nave to the pillars (the pillars stand on their outer column); the hall gets a panel each side of the candles.
function wa12Cloth(D,kind){const cl=D.cloth||['#7444bc','#b080ff'],base=shade(cl[0],.8);return {fld:kind===1?lerpHex(base,cl[1],.14):base,pat:lerpHex(base,cl[1],.5),band:lerpHex(cl[0],shade(cl[0],.45),.42),dark:shade(cl[0],.42),dot:lerpHex(cl[1],'#f0dc98',.5)};}
function wa12Panel(f,D,P,cn,has,end,kind){const C=wa12Cloth(D,kind),E={L:!has(-1,0),R:!has(1,0),T:!has(0,-1),B:!has(0,1)},GUT=2;
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=Math.min(E.L?x:99,E.R?15-x:99),dy=Math.min(E.T?y:99,E.B?15-y:99),e=Math.min(dx,dy);
    if(e<GUT){if(e===GUT-1&&e<99)f('rgba(26,18,30,.3)',x,y,1,1);continue;}
    if(dx<GUT+2&&dy<GUT+2&&dx+dy<GUT*2+1)continue;// the corner is rounded off
    const s=e-GUT;let col;
    if(s===0)col=C.dark;else if(s===1)col='#f0dc98';else if(s===2)col='#8a7030';
    else if(s===3||s===4)col=((x+y)%4===0)?C.dot:C.band;
    else if(s===5)col='#c8a848';
    else{col=C.fld;if(((x+y)%8===1)||(((x-y)+16)%8===6))col=C.pat;}
    f(col,x,y,1,1);}
  // the weave's small flower in the middle of an open tile (mirrored tiles share a canonical position, so a pair is dressed alike)
  if(!E.L&&!E.R&&!E.T&&!E.B&&((cn[0]*29+cn[1]*53)%7)<2){const b=P.bloom||['#fff4c8','#f2a8c8'];f(b[0],7,7,2,2);f(b[1],7,8,1,1);}
  // fringe in the seam where the panel ends at a path (tassels of gold thread)
  const tas=side=>{for(let i=0;i<16;i+=2){if(side==='T'){f('#e8c860',i,0,1,1);f('#8a7030',i+1,1,1,1);}else if(side==='B'){f('#e8c860',i,15,1,1);f('#8a7030',i+1,14,1,1);}
    else if(side==='L'){f('#e8c860',0,i,1,1);f('#8a7030',1,i+1,1,1);}else{f('#e8c860',15,i,1,1);f('#8a7030',14,i+1,1,1);}}};
  ['T','B','L','R'].forEach(sd=>{if(E[sd]&&end[sd])tas(sd);});
  WA12.n.carpet++;}
HOOK.wrap('sncYard','worldart12','the garden: side carpets as panels',function(next,f,R,D,P,x,y,m,o,L,px,py,cc){
  try{if(!WA12.off&&o&&o.ok){const k=sncYK(o,x,y);if(k==='grass'||k==='gravel'){const pan=(a,b)=>{const q=sncYK(o,x+a,y+b);return q==='grass'||q==='gravel';},path=(a,b)=>sncYK(o,x+a,y+b)==='path',cn=sncCanon(m,x,y);
      wa12Panel(f,D,P,cn,pan,{T:path(0,-1),B:path(0,1),L:path(-1,0),R:path(1,0)},k==='gravel'?1:0);return;}}}catch(e){wa12Err('yard',e);}
  return next(f,R,D,P,x,y,m,o,L,px,py,cc);});
// the hall: a panel each side of the aisle, three tiles from the runner out to six (the candles stand in the seam), from the door end to two tiles before the dais
function wa12HallPan(o,m,x,y){if(!o||!o.ok||!o.hall)return false;const c=o.carpet;if(c&&c.has(x+','+y))return false;const q=o.inv(x,y),u=q[0],v=q[1],a=Math.abs(u-o.cx),h=o.hall;
  if(a<3||a>6||v<h.v0+1||v>o.gv-2||u<h.u0||u>h.u1)return false;const t=tileAt(m,x,y);return t==='.'||t===','||t==='P';}
HOOK.after('sncHall','worldart12','the hall: side carpets',function(r,f,R,D,P,x,y,m,o,L,px,py,ctx){try{if(WA12.off||!wa12HallPan(o,m,x,y))return;
  wa12Panel(f,D,P,sncCanon(m,x,y),(a,b)=>wa12HallPan(o,m,x+a,y+b),{T:false,B:false,L:false,R:false},0);}catch(e){wa12Err('hall',e);}});

// test hooks
try{window.__WA12=WA12;WA12.api={exitIssues:wa12ExitIssues,exitLand:wa12ExitLand,exitGroups:wa12ExitGroups};}catch(e){}
// ---------- 6. the Mimic: a chest first ----------
// Same frame API and anchors as art.js (idle A and B, the lunge, the slam), the same wood, lid and gold as the chest in the realm (worldgfx.js 'chest': W, L, G, K): a
// planked body with a gold band at each end and a lock plate, a lid with its own planks and bands, four claw feet. The mouth is the gap between lid and body: teeth hang
// from the lid and stand on the body across the whole width, with a tongue over the lip; the lunge opens it wide, a hit slams it shut with only the corners showing.
MART.mimic=function(g,f){const F=mfr(f);
  let gap=F.atk?13:F.b?8:6,fy=0;if(F.hit){gap=0;fy=1;}
  const x0=5,w=30,top=23+fy,bh=11,lh=10,lid=top-gap-lh,ly=lid+(F.hit?0:0);
  // claw feet
  g.rect(x0-1,top+bh-1,5,3,'W');g.rect(x0+w-4,top+bh-1,5,3,'W');g.px([[x0-1,top+bh+2],[x0+1,top+bh+2],[x0+3,top+bh+2],[x0+w-3,top+bh+2],[x0+w-1,top+bh+2],[x0+w+1,top+bh+2]],'T');
  // the body: planks, a band at each end, the lock plate
  g.rect(x0,top,w,bh,'W');for(let y=top+3;y<top+bh-1;y+=3)g.rect(x0+5,y,w-10,1,'w');g.rect(x0,top+bh-1,w,1,'w');
  g.rect(x0,top,4,bh,'G');g.rect(x0+w-4,top,4,bh,'G');g.rect(x0+3,top,1,bh,'w');g.rect(x0+w-4,top,1,bh,'w');g.px([[x0+1,top+2],[x0+1,top+bh-3],[x0+w-2,top+2],[x0+w-2,top+bh-3]],'Y');
  g.rect(x0+12,top+(gap>0?0:-1),6,7,'G');g.rect(x0+14,top+(gap>0?2:1),2,3,'K');g.px([[x0+12,top+(gap>0?0:-1)],[x0+13,top+(gap>0?0:-1)]],'Y');
  // the mouth: teeth top and bottom across the whole width, and the tongue over the lip
  if(gap>0){g.rect(x0+1,top-gap,w-2,gap+1,'K');if(F.atk)g.rect(x0+4,top-gap+1,w-8,2,'M');
    const tl=F.atk?5:Math.min(4,gap-2),bl=tl;
    for(let x=x0+4;x<x0+w-6;x+=4){g.poly([[x,top-gap],[x+1.8,top-gap+tl],[x+3.6,top-gap]],'T');g.poly([[x+2,top],[x+3.8,top-bl],[x+5.6,top]],'T');}
    const tn=F.atk?10:3;g.poly([[x0+11,top-1],[x0+19,top-1],[x0+18,top+tn],[x0+12,top+tn+1]],'R');g.line(x0+15,top,x0+15,top+tn-1,'M');}
  else g.px([[x0+6,top-1],[x0+8,top-1],[x0+10,top-1],[x0+20,top-1],[x0+22,top-1],[x0+24,top-1]],'T');
  // the lid: rounded, planked, banded like the body
  g.rect(x0,ly+2,w,lh-2,'L');g.rect(x0+2,ly,w-4,2,'L');g.rect(x0+1,ly+1,w-2,1,'L');
  g.rect(x0+4,ly+4,w-8,1,'w');g.rect(x0+4,ly+7,w-8,1,'w');g.rect(x0,ly+lh-1,w,1,'w');
  g.rect(x0,ly+1,4,lh-1,'G');g.rect(x0+w-4,ly+1,4,lh-1,'G');g.rect(x0+3,ly+1,1,lh-1,'w');g.rect(x0+w-4,ly+1,1,lh-1,'w');g.px([[x0+1,ly+3],[x0+1,ly+lh-3],[x0+w-2,ly+3],[x0+w-2,ly+lh-3]],'Y');
  g.rect(x0+12,ly+lh-3,6,3,'G');g.px([[x0+13,ly+lh-3]],'Y');
  eye(g,x0+9,ly+2,F,'E');eye(g,x0+19,ly+2,F,'E');
  if(F.hit)g.px([[x0+2,lid-3],[x0+w-3,lid-3],[x0+w/2,lid-5]],'T');
  return {pal:{W:'#8a5a2a',L:'#a8703a',w:'#4e3216',G:'#f0c050',Y:'#fff4b0',K:'#1a0a10',T:'#fffaec',R:'#e0346a',M:'#5a1024',E:'#ff5a3a'},flat:'KTREYM',a:{cx:20,cy:29,top:lid,gap}};};
MART.mimic.fr=1;
// ---------- 5. gather nodes in the world's palette ----------
// mats11.js drew each node as a 16 x 16 icon pile (the inventory's bevel and outline, a flat glint). They are props now: painted with the world's own painter (PG, pDiag, paintP:
// lit from the upper left in three tones, an outline, a cool rim on the shaded edge), on the realm's own stone and ground, standing in a small contact shadow, with a slow
// sparkle. Same 16 x 16 footprint and the same twinkle steps as before (tw 0 a cross, 1 a dot), so the HD-2D card and the 2D draw swap one for the other.
const WA12_NODE={
  copper:g=>{wa12Outcrop(g);g.ell(5.5,8.5,2,1.7,'C');g.ell(10.5,9,2.3,1.8,'C');g.ell(8,6.5,1.8,1.5,'C');g.px([[4,8],[5,7],[9,8],[10,8],[7,6]],'c');g.px([[7,10],[11,10],[3,10]],'V');return {C:'#e0904a',c:'#ffc888',V:'#4fb894'};},
  iron:g=>{wa12Outcrop(g);g.poly([[3.5,10],[5.5,6],[8.5,6.5],[8.5,10.5]],'C');g.poly([[8.5,9.5],[10.5,5.5],[13.5,8],[12.5,10.5]],'C');g.px([[5,7],[6,7],[10,6],[11,6]],'c');g.px([[7,10],[9,10],[12,10],[4,10]],'V');return {C:'#a8b4c8',c:'#f2f6ff',V:'#b0562c'};},
  mythril:g=>{wa12Outcrop(g,1);g.poly([[3,11],[4.5,6],[6.5,11]],'C');g.poly([[5.5,11],[8,2],[10.5,11]],'C');g.poly([[9.5,11],[11.5,4.5],[13.5,11]],'C');g.rect(7,4,1,5,'W');g.px([[4,8],[11,7]],'W');return {C:'#4cbdf0',W:'#e6faff',flat:'W'};},
  oak:g=>wa12Logs(g,{B:'#8a5a2c',l:'#b07a42',b:'#5e3a1a',W:'#e2bc80',X:'#a8743a'},0),
  ash:g=>wa12Logs(g,{B:'#bdb6a6',l:'#e2dccb',b:'#8e8676',W:'#f6ecd2',X:'#7a7464'},1),
  elder:g=>wa12Logs(g,{B:'#5a4468',l:'#7e62a0',b:'#34263e',W:'#8a66b0',X:'#e2c8ff',flat:'X'},2),
  healroot:g=>{wa12Tuft(g,7);g.ell(8,10,2.6,2.1,'R');g.px([[7,9],[8,8]],'r');g.px([[8,11],[7,11],[9,11]],'t');return {R:'#e0705a',r:'#ffb098',t:'#8e3426'};},
  bluecap:g=>{wa12Tuft(g,3);g.rect(4,9,2,4,'S');g.ell(5,8.2,3.4,2.4,'C');g.rect(10,7.5,2,5.5,'S');g.ell(11,6.6,4.2,3,'C');g.px([[4,7],[6,8],[10,5],[12,6],[11,4]],'c');g.px([[4,13],[10,13]],'s');return {S:'#f2ecd8',s:'#bdb49a',C:'#4f84ee',c:'#c4dcff',flat:'c'};},
  sunpetal:g=>{wa12Tuft(g,5);g.rect(8,6,1,7,'A');for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.ell(8.5+Math.cos(a)*3.2,4.2+Math.sin(a)*2.6,1.6,1.4,'Y');}g.ell(8.5,4.2,2,1.7,'D');g.px([[7,3],[10,3]],'y');return {Y:'#ffd23c',y:'#fff2a0',D:'#8a5a20'};},
  starbloom:g=>{wa12Tuft(g,4);g.rect(8,7,1,6,'A');g.poly([[8.5,0.5],[10,4],[13.5,4.5],[10.8,6.8],[11.8,10.5],[8.5,8.4],[5.2,10.5],[6.2,6.8],[3.5,4.5],[7,4]],'V');g.ell(8.5,5.6,1.5,1.4,'Z');g.px([[3,2],[13,2],[14,8]],'Z');return {V:'#b890ff',Z:'#fff4b8',flat:'Z'};}};
// the outcrop in the realm's stone (A base, a light, B mid), 16 wide, standing on the ground line
function wa12Outcrop(g,tall){const h=tall?1.5:0;g.ell(8,10.4,6.8,3.6,'A');g.ell(4.5,11.2,3.4,2.2,'A');g.ell(11.6,11.2,3.4,2.2,'A');g.ell(7,8.6-h,4.4,3.3,'A');
  pDiag(g,'A','a','B',2,4,14,13,.28,.7);g.px([[6,8],[7,8],[3,10],[4,9]],'a');g.px([[12,12],[13,11],[9,13],[10,13]],'B');}
// two logs lying one over the other and a third on top, their cut ends to the right: bark with a lit top and a shaded belly, pale rings and a core
function wa12Logs(g,P,kind){const log=(x,y,w,h)=>{g.rect(x,y,w,h,'B');g.rect(x,y,w,1,'l');g.rect(x,y+h-1,w,1,'b');g.ell(x+w,y+h/2,1.8,h/2+.4,'W');g.px([[x+w,y+h/2],[x+w-.5,y+h/2]],'X');};
  log(1,9,11,4);log(3,5,11,4);g.px([[3,10],[6,11],[9,10],[5,6],[8,7],[11,6]],'b');g.rect(0,7,2,2,'B');g.px([[0,7]],'l');
  if(kind===0){g.rect(5,3,2,2,'G');g.px([[4,3],[7,3]],'G');}if(kind===2)g.px([[2,12],[7,12]],'X');
  return Object.assign({G:'#58b04a'},P);}
// a clump of n broad leaves round the base
function wa12Tuft(g,n){for(let i=0;i<n;i++){const a=Math.PI*(.1+.8*i/Math.max(1,n-1)),tx=8-Math.cos(a)*5.6,ty=11.5-Math.sin(a)*8.5;g.poly([[8,13],[tx-2,ty+2.2],[tx,ty-.5],[tx+2,ty+2.2]],i%2?'A':'a');}g.ell(8,12.2,5.5,1.7,'A');g.px([[5,12],[11,12],[8,11]],'a');}
const WA12_NC={};
function wa12NodeCv(id,th){const key=id+':'+th;if(WA12_NC[key])return WA12_NC[key];const T=(typeof THEME!=='undefined'&&THEME[th])||THEME.meadow,st=T.stone||['#a8a090','#888070','#c8c0b0','#5e584c'];
  const g=new PG(18,18,1,1),o=WA12_NODE[id](g);const ore=/copper|iron|mythril/.test(id),log=/oak|ash|elder/.test(id);
  // ore sits on the realm's stone; plants take the realm's bush green (worldgfx 'bush') pulled toward real leaf green so a herb still reads as a herb
  const bushA=th==='void'?'#4a3a6a':th==='cave'?'#5a4a48':th==='coast'?'#5a8a3a':'#3a7a34',bushC=th==='void'?'#6a5a9a':th==='cave'?'#8a7a74':'#6ab858';
  const base=ore?{A:st[0],a:st[2],B:st[1]}:{A:lerpHex(bushA,'#3f8a3a',.55),a:lerpHex(bushC,'#6ac85a',.5)};
  const P=Object.assign(base,o),opt={};if(P.flat){opt.flat=P.flat;delete P.flat;}
  return WA12_NC[key]=paintP(g,P,opt);}
const WA12_SP={copper:[[6,6],[11,8]],iron:[[10,5],[5,7]],mythril:[[7,3],[11,5]],oak:[[7,5]],ash:[[7,5]],elder:[[13,7],[3,9]],healroot:[[12,5]],bluecap:[[11,4],[5,6]],sunpetal:[[11,2]],starbloom:[[3,2],[13,2]]};
HOOK.before('m11NodeDraw','worldart12','gather nodes drawn as world props',function(ctx,id,px,py,tw){try{if(WA12.off||!WA12_NODE[id])return;
  const th=WA12.thm||(typeof WS!=='undefined'&&WS.m&&WS.m.theme)||'meadow';
  // a small contact shadow, wide and soft with a dark core under the foot
  ctx.fillStyle='rgba(8,6,22,.22)';ctx.fillRect(px+2,py+13,12,1);ctx.fillRect(px+3,py+14,10,1);ctx.fillStyle='rgba(8,6,22,.3)';ctx.fillRect(px+4,py+13,8,1);ctx.fillRect(px+5,py+14,6,1);
  ctx.drawImage(wa12NodeCv(id,th),px-1,py-1);
  const sp=WA12_SP[id]||[[7,5]],s=sp[Math.abs(Math.floor(tw||0))%sp.length]||sp[0];
  if(tw===0){ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(px+s[0],py+s[1]-1,1,3);ctx.fillRect(px+s[0]-1,py+s[1],3,1);ctx.fillStyle='#fff6c0';ctx.fillRect(px+s[0],py+s[1],1,1);}
  else if(tw===1){ctx.fillStyle='rgba(255,246,192,.9)';ctx.fillRect(px+s[0],py+s[1],1,1);}
  WA12.n.node++;return HOOK.stop();}catch(e){wa12Err('node',e);}});
// the HD-2D node cards are cached by material and twinkle step; they are built from the map's theme, so a new map drops them
HOOK.after('arrive','worldart12','node cards follow the realm of the map',function(){try{if(typeof M11HD!=='undefined')for(const k in M11HD)delete M11HD[k];}catch(e){}});
// ---------- 2. entrances with volume ----------
// The den mouths (sitelook10 SL_DEN) and the lair fronts (SL_LD) were drawn flat and front on: one tone per material, a dark arch cut into it, nothing standing in front.
// The old tents read best because each had two faces (a lit left, a shaded right), a hem shadow and a rope or pole beside it. The same idea now, as a pass over the finished
// sprite (so every realm keeps its own material and details, and the 2D paint and the HD-2D card, which share the sprite, both get it):
//   - the mass is shaded as a body: a lit rim along its upper left edges (the top highlight), a cool shaded rim on its right and under side, a slow lit-to-shaded sweep from left
//     to right, and ambient darkness where it meets the ground (steps of 1/8, so it stays pixel art)
//   - the mouth is found (the dark region at the foot of the front) and framed: the stone round it is lit on its left and top, shaded on its right, its inside warms toward
//     the realm's light at the sill and glows along the lit jamb; a threshold stone lies across the foot of it
//   - two props stand in front at the foot, one each side: a brazier where the realm burns (fire), a crystal lantern where it glows (ice, sea, fungus, stars), a torch otherwise,
//     each lit and with its own small halo; the ground cast shadow still comes from slCast
const WA12_LT={fire:'#ff8a3a',cyan:'#6adcf0',ice:'#9adcff',violet:'#b080ff',fungus:'#7af0d0',gold:'#ffd070',lamp:'#ffc070',torch:'#ffb050'};
const WA12_EC=new WeakMap();
function wa12Mask(d,W,H){const m=new Uint8Array(W*H);for(let i=0;i<W*H;i++){const o=i*4;m[i]=d[o+3]>100&&(d[o]*.3+d[o+1]*.59+d[o+2]*.11)>26?1:0;}return m;}
// the dark mouth: the biggest enclosed dark region near the foot of the front and the middle of the sprite
function wa12Door(d,W,H){const dark=new Uint8Array(W*H);for(let i=0;i<W*H;i++){const o=i*4;dark[i]=d[o+3]>200&&(d[o]*.3+d[o+1]*.59+d[o+2]*.11)<=26?1:0;}
  const seen=new Uint8Array(W*H);let best=null;
  for(let s=0;s<W*H;s++){if(!dark[s]||seen[s])continue;const q=[s];seen[s]=1;let x0=W,x1=0,y0=H,y1=0,n=0,edge=false;
    for(let k=0;k<q.length;k++){const p=q[k],x=p%W,y=(p/W)|0;n++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
      for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H){edge=true;continue;}const j=Y*W+X;if(d[j*4+3]<=100)edge=true;if(dark[j]&&!seen[j]){seen[j]=1;q.push(j);}}}
    const cx=(x0+x1)/2;if(n<24||y1<H*.6||Math.abs(cx-W/2)>W*.26||x1-x0<5)continue;if(!best||n>best.n)best={n,x0,x1,y0,y1,q,cx};}
  return best;}
function wa12Torch(c,x,by,type,col){const rgb=hx(col),halo=(cx,cy,r,a)=>{const g=c.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,'rgba('+rgb.join(',')+','+a+')');g.addColorStop(1,'rgba('+rgb.join(',')+',0)');c.fillStyle=g;c.fillRect(cx-r,cy-r,r*2,r*2);};
  const f=(col2,a,b,w,h)=>{c.fillStyle=col2;c.fillRect(Math.round(a),Math.round(b),w,h);};
  if(type==='fire'){f('#120c14',x-3,by-6,7,7);f('#3a3238',x-2,by-5,5,5);f('#5a525a',x-2,by-5,2,1);f('#120c14',x-1,by-1,3,2);f('#2a2630',x-1,by,3,1);f('#120c14',x-2,by-9,5,4);f('#ff7a2a',x-1,by-8,3,3);f('#ffd04a',x,by-9,1,2);f('#fff0a8',x,by-7,1,1);halo(x,by-8,9,.38);}
  else if(type==='gem'){f('#120c14',x-1,by-8,3,9);f('#4a4250',x,by-7,1,7);f('#2a2630',x+1,by-7,1,7);f('#120c14',x-3,by-14,7,7);c.fillStyle=col;c.beginPath();c.moveTo(x,by-14);c.lineTo(x+2,by-10.5);c.lineTo(x,by-7);c.lineTo(x-2,by-10.5);c.closePath();c.fill();f('#ffffff',x-1,by-12,1,2);halo(x,by-10,10,.34);}
  else{f('#120c14',x-1,by-9,3,10);f('#6a4a2a',x,by-8,1,8);f('#3a2616',x+1,by-8,1,8);f('#120c14',x-2,by-13,5,5);f('#ff8a2a',x-1,by-12,3,3);f('#ffd04a',x,by-13,1,2);f('#fff0a8',x,by-11,1,1);f('#3a3238',x-1,by-9,3,1);halo(x,by-11,9,.36);}}
function wa12Entrance(src,kind,info){if(WA12.off)return src;let r=WA12_EC.get(src);if(r)return r;
  const W=src.width,H=src.height,cv=mkCv(W,H),c=cv.getContext('2d');c.drawImage(src,0,0);const id=c.getImageData(0,0,W,H),d=id.data,mass=wa12Mask(d,W,H),acc=hx(info.acc||'#ffc070'),door=wa12Door(d,W,H);
  // run lengths to the edge of the mass in the four directions
  const dl=new Uint8Array(W*H),dr=new Uint8Array(W*H),du=new Uint8Array(W*H),dd=new Uint8Array(W*H);
  for(let y=0;y<H;y++){let n=0;for(let x=0;x<W;x++){n=mass[y*W+x]?n+1:0;dl[y*W+x]=n;}n=0;for(let x=W-1;x>=0;x--){n=mass[y*W+x]?n+1:0;dr[y*W+x]=n;}}
  for(let x=0;x<W;x++){let n=0;for(let y=0;y<H;y++){n=mass[y*W+x]?n+1:0;du[y*W+x]=n;}n=0;for(let y=H-1;y>=0;y--){n=mass[y*W+x]?n+1:0;dd[y*W+x]=n;}}
  const inDoor=door?new Set(door.q):null;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x,o=p*4;if(!mass[p])continue;
    const a=Math.min(dl[p],du[p]),b=Math.min(dr[p],dd[p]);
    const sp=Math.max(-1,Math.min(1,(x-(door?door.cx:W/2))/9));let q=1+.4*Math.exp(-(a-1)/3)-.42*Math.exp(-(b-1)/3.4)-sp*.14-.04+.16*Math.max(0,1-y/(H*.5))-.36*Math.max(0,(y-(H-10))/10);
    // the frame of the mouth: lit left and top, shaded right
    if(door){const ex=x>=door.x0-3&&x<=door.x1+3&&y>=door.y0-3&&y<=door.y1+1&&!(x>=door.x0&&x<=door.x1&&y>=door.y0);
      if(ex){q+=(x<door.cx-1||y<door.y0)?.28:-.2;}}
    q=Math.max(.6,Math.min(1.34,Math.round(q*8)/8));
    for(let k=0;k<3;k++){let v=d[o+k]*q;if(q<1)v+=(k===2?58:k===1?22:20)*(1-q)*.5;else v+=(255-d[o+k])*(q-1)*.3;d[o+k]=Math.max(0,Math.min(255,v));}
    // the frame: a ring of dressed stone two px round the mouth, lit on its left and top, shaded on its right
    if(door&&!inDoor.has(p)){let near=0;for(let j=-2;j<=2&&!near;j++)for(let i=-2;i<=2;i++)if(inDoor.has((y+j)*W+x+i)){near=Math.max(Math.abs(i),Math.abs(j));break;}
      if(near){const lit=x<door.cx-1||y<door.y0-0,f=lit?[222,212,186]:[120,112,98],t=near===1?.5:.34,sh=lit?(y<door.y0?1.08:1):.82;for(let k=0;k<3;k++)d[o+k]=Math.min(255,(d[o+k]*(1-t)+f[k]*t)*sh);}}}
  // the mouth warms toward the light at the sill, and glows along its lit jamb and lintel
  if(door){const w=door.x1-door.x0+1,h=door.y1-door.y0+1;door.q.forEach(p=>{const x=p%W,y=(p/W)|0,o=p*4,t=(y-door.y0)/Math.max(1,h-1),cx=1-Math.abs(x-door.cx)/(w/2+1);
      let m=Math.pow(t,2.2)*.5*(.55+.45*cx);const lit=(x===door.x0||y===door.y0||!inDoor.has(p-1))?.3:0;m=Math.min(.7,m+lit);
      for(let k=0;k<3;k++)d[o+k]=d[o+k]*(1-m)+acc[k]*m;});}
  c.putImageData(id,0,0);
  const a0=new Uint8Array(W*H);{const d0=c.getImageData(0,0,W,H).data;for(let i=0;i<W*H;i++)a0[i]=d0[i*4+3];}
  // a threshold stone across the foot of the mouth: lit on its left half, shaded on its right, a thin warm line of the interior's light on its lip
  if(door){const tx=door.x0-2,tw=door.x1-door.x0+5,ty=H-2,hm=Math.floor(tw/2);c.fillStyle='#120c14';c.fillRect(tx-1,ty-1,tw+2,3);c.fillStyle='#a89f8c';c.fillRect(tx,ty-1,hm,1);c.fillStyle='#867e6e';c.fillRect(tx+hm,ty-1,tw-hm,1);c.fillStyle='#5e574c';c.fillRect(tx,ty,tw,1);c.fillStyle='#d8cfba';c.fillRect(tx,ty-1,2,1);
    c.globalAlpha=.5;c.fillStyle='rgb('+acc.join(',')+')';c.fillRect(door.x0+1,ty-1,Math.max(1,tw-6),1);c.globalAlpha=1;}
  // the props: one each side at the foot
  const lt=info.lt||'torch',type=lt==='fire'?'fire':(lt==='cyan'||lt==='ice'||lt==='fungus'||lt==='violet')?'gem':'torch',col=info.acc||WA12_LT[lt]||'#ffb050',cxm=door?door.cx:W/2,hw=door?(door.x1-door.x0)/2:7,by=H-1;
  [cxm-hw-8,cxm+hw+8].forEach(x=>{x=Math.max(5,Math.min(W-6,Math.round(x)));wa12Torch(c,x,by,type,col);});
  // the outline round what was added (the props and the threshold; the sprite's own outline stays one px)
  const id2=c.getImageData(0,0,W,H),e=id2.data,add=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(e[(y*W+x)*4+3]>0)continue;if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const X=x+a,Y=y+b;return X>=0&&Y>=0&&X<W&&Y<H&&e[(Y*W+X)*4+3]>140&&a0[Y*W+X]<=100;}))add.push([x,y]);}
  c.fillStyle='#120c14';add.forEach(([x,y])=>c.fillRect(x,y,1,1));
  WA12_EC.set(src,cv);WA12.n[kind]++;return cv;}
HOOK.xform('slDenByKey','worldart12','den mouths with volume',function(cv,key){try{const L=SL_DEN[key]||{};return wa12Entrance(cv,'den',{acc:L.acc,lt:L.lt});}catch(e){wa12Err('den',e);return cv;}});
HOOK.xform('slLairByKit','worldart12','lair fronts with volume',function(cv,K,lit){try{return wa12Entrance(cv,'lair',{lt:K&&K.lt,acc:WA12_LT[K&&K.lt]});}catch(e){wa12Err('lair',e);return cv;}});
