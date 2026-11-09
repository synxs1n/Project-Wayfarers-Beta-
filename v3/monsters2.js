// ===== monsters2.js (v0.4.0): six new foes (Undead, Jelly, Swarm) and their sprites =====
// Register order matters: this file runs after data.js and art.js, so the shared tables exist.
// Add a new monster by copying one block: MON entry, MART sprite, drops, family, and the realm pool at the bottom.

Object.assign(MON,{
 gnatswarm:{n:'Gnat Swarm',art:'gnatswarm',el:['wind'],hp:.7,atk:.85,def:.6,mag:.7,res:.7,spd:1.4,sk:[['Biting Cloud','wind',.9,'all','phys',[['poison',.25]]]]},
 barrowbones:{n:'Barrow Bones',art:'barrowbones',el:['shadow'],hp:.95,atk:1.05,def:.9,mag:.7,res:.8,spd:.85,sk:[['Rusty Cleave','shadow',1.2,'one','phys',[['bleed',.3]]]]},
 drownedsailor:{n:'Drowned Sailor',art:'drownedsailor',el:['water','shadow'],hp:1.1,atk:1.1,def:1,mag:.8,res:.9,spd:.8,sk:[['Hook Drag','water',1.35,'one','phys',[['root',.25]]],['Drowned Dirge','shadow',1,'all','mag',[['slow',.3]]]]},
 brinejelly:{n:'Brine Jelly',art:'brinejelly',el:['water'],hp:1.3,atk:.8,def:1.2,mag:1,res:.9,spd:.7,sk:[['Stinging Wrap','water',1.2,'one','mag',[['poison',.4]]]]},
 rimewight:{n:'Rime Wight',art:'rimewight',el:['ice','shadow'],hp:1.2,atk:.9,def:1,mag:1.25,res:1.1,spd:.8,sk:[['Grave Chill','ice',1.25,'one','mag',[['slow',.4]]],['Frost Shroud','ice',0,'self','buff',[['ward',1]]]]},
 galephantom:{n:'Gale Phantom',art:'galephantom',el:['wind','shadow'],hp:.8,atk:.9,def:.7,mag:1.25,res:1.2,spd:1.25,sk:[['Keening Gale','wind',1,'all','mag',[['blind',.3]]]]}
});
Object.assign(MON_DROPS,{gnatswarm:['ichor','healroot'],barrowbones:['grit','ichor'],drownedsailor:['scale','ichor'],brinejelly:['scale','bluecap'],rimewight:['ichor','bluecap'],galephantom:['ichor','bluecap']});

Object.assign(MART,{
 // v0.13: ten gnats on a drifting ring (two in the middle), near ones bright, far ones dim. Idle B turns the ring half a step with the wings flipped;
 // the lunge pulls the ring forward and tight with stingers out; a hit scatters it. Frames come from f (art.js frame API), never from Math.random.
 gnatswarm(g,f){const F=mfr(f),N=10,ph=F.i?.314:0;
  let cx=19,cy=21,rx=12.5,ry=9.5;if(F.atk){cx=22,rx=10,ry=8;}if(F.hit){cx=17,rx=15,ry=11.5;}
  const gnat=(x,y,far,up)=>{const B=far?'b':'B',Wg=far?'w':'W';g.rect(x,y,2,2,B);if(!far)g.s(x,y,'L');
   g.px(up?[[x-1,y-1],[x+2,y-1]]:[[x-1,y],[x+2,y]],Wg);if(F.atk&&!far)g.s(x+2,y+1,'S');};
  for(let k=0;k<N;k++){const a=k/N*6.2832+ph-(F.atk?.4:0),sn=Math.sin(a);if(!F.hit)g.s(Math.round(cx+Math.cos(a+.31)*(rx+1)),Math.round(cy+Math.sin(a+.31)*(ry+1)),'D');}
  const ord=[];for(let k=0;k<N;k++){const a=k/N*6.2832+ph-(F.atk?.4:0);ord.push([Math.sin(a),Math.round(cx+Math.cos(a)*rx),Math.round(cy+Math.sin(a)*ry),k]);}
  ord.sort((p,q)=>p[0]-q[0]).forEach(([sn,x,y,k])=>gnat(x,y,sn<-.25,(k+F.i)%2===0));
  gnat(Math.round(cx-3+(F.atk?3:0)),Math.round(cy-2+(F.i?1:0)),true,F.i===0);gnat(Math.round(cx+2+(F.atk?3:0)),Math.round(cy+(F.i?-1:1)),false,F.i===1);
  return {pal:{B:'#7a7a50',L:'#c0c080',b:'#4a4a30',W:'#e3f4e6',w:'#9aa89a',S:'#ff8a3a',D:'#5a5a42'},flat:'WwSD',a:{cx,cy,rx,ry}};
 },
 // v0.13 (family 3): an armoured skeleton, facing right: a rusted kettle helm over the skull, a rusted breastplate over the lower ribs, a round wooden shield behind,
 // a short spear in front (angled up, thrust level in the lunge, knocked back on a hit). Idle B breathes the upper body 1px; the lunge opens the jaw. Frames come from f.
 barrowbones(g,f){const F=mfr(f);
  let L=0,dy=F.b?-1:0,lg=0;if(F.atk){L=2;lg=1;}if(F.hit){L=-2;dy=1;}
  const hx=20+L,hy=8+dy,H=L/2,sx=Math.round(9+H);
  g.ell(sx,26,6,7.2,'i');g.ell(sx-.4,25.6,4.8,6,'S');g.line(sx-.4,20,sx-.4,31,'s');g.line(sx+2,21,sx+2,30,'s');g.ell(sx,26,1.6,1.6,'I');
  slab(g,16-lg,29,3,8,'B','b');slab(g,23+lg,29,3,8,'B','b');slab(g,14-lg,36,6,2,'b','b');slab(g,22+lg,36,7,2,'b','b');
  slab(g,15+H,26,11,4,'B','b');g.px([[18+H,28],[22+H,28]],'K');
  slab(g,19+L,15+dy,3,12,'b','b');
  for(let j=0;j<3;j++)g.rect(15+L,16+dy+j*2,11,1,'B');
  slab(g,15+L,21+dy,11,6,'I','i');g.px([[17+L,23+dy],[23+L,22+dy],[21+L,25+dy]],'O');g.rect(15+L,26,11,1,'i');g.px([[16+L,22+dy],[24+L,25+dy]],'K');
  g.path([[14+L,17+dy],[sx+3,23]],'B',2);g.ell(14+L,16+dy,2.4,2,'B');
  sph(g,hx,hy+3,5.2,5,'B','b');
  g.rect(hx-4,hy+2,3,3,'K');g.rect(hx+1,hy+2,3,3,'K');
  if(F.hit){g.rect(hx-3,hy+3,2,1,'W');g.rect(hx+1,hy+3,2,1,'W');g.path([[hx+2,hy-1],[hx+4,hy+4]],'K');}
  else{g.px([[hx-3,hy+2],[hx-3,hy+3],[hx+2,hy+2],[hx+2,hy+3]],'E');}
  if(F.atk){g.rect(hx-3,hy+5,7,3,'K');g.px([[hx-3,hy+5],[hx-1,hy+5],[hx+1,hy+5],[hx+3,hy+5],[hx-2,hy+7],[hx+2,hy+7]],'B');}
  else{g.rect(hx-3,hy+5,7,2,'B');g.px([[hx-1,hy+6],[hx+1,hy+6]],'K');}
  g.poly([[hx-6,hy-1],[hx-5,hy-4],[hx-2,hy-6],[hx+2,hy-6],[hx+5,hy-4],[hx+6,hy-1]],'I');g.poly([[hx+1,hy-6],[hx+5,hy-4],[hx+6,hy-1],[hx+2,hy-1]],'i');
  g.rect(hx-7,hy-1,14,2,'I');g.rect(hx-7,hy,14,1,'i');g.rect(hx-1,hy+1,2,3,'i');g.s(hx-3,hy-4,'O');g.s(hx+2,hy-2,'O');
  let tip;
  if(F.atk){g.path([[26+L,18],[30,22]],'B',2);tip=spear(g,19+L,22,33,21,'S','I',5);g.rect(29,21,3,2,'B');}
  else if(F.hit){g.path([[26+L,18+dy],[28+L,23]],'B',2);tip=spear(g,22+L,35,30+L,13,'S','I',5);g.rect(27+L,22,3,2,'B');}
  else{const tx=F.b?35:34;g.path([[26+L,17+dy],[29,23]],'B',2);tip=spear(g,24,34,tx,10,'S','I',5);g.rect(28,22,3,2,'B');}
  return {pal:{B:'#d8d0b0',b:'#a09878',K:'#1a1020',E:'#7aff9a',S:'#6a4a2a',s:'#4a3018',I:'#8a8a94',i:'#585864',O:'#a8582a',W:'#ffffff'},flat:'EKW',a:{hx,hy,cx:20+L,cy:22+dy,top:2+dy,sx,tip,by:37,L,dy}};
 },
 drownedsailor(g){
  g.ell(20,10,6,6,'B');g.poly([[13,9],[27,9],[24,3],[16,3]],'H');g.rect(12,8,17,2,'H');g.rect(12,9,17,1,'h');
  g.rect(17,10,3,2,'K');g.rect(22,10,3,2,'K');g.px([[18,10],[23,10]],'E');g.line(18,15,23,15,'K');
  g.ell(20,23,8,9,'C');g.rect(13,28,15,5,'C');g.rect(16,33,3,6,'D');g.rect(22,33,3,6,'D');g.rect(14,38,5,2,'K');g.rect(21,38,5,2,'K');
  g.line(13,17,8,27,'B',2);g.line(28,17,33,23,'B',2);g.path([[33,23],[35,14],[32,10]],'S',2);g.px([[31,9],[30,10]],'S');
  g.px([[16,20],[24,22],[19,27],[26,29],[14,24]],'N');g.path([[17,17],[15,24],[18,31]],'W');g.path([[24,17],[26,25],[23,31]],'W');
  return {pal:{B:'#8aa89a',H:'#3a4a5a',h:'#c8b060',K:'#101a20',E:'#9affe8',C:'#3a5a6a',D:'#2a3a48',S:'#9a9aa8',N:'#d8d4b8',W:'#3a8a4a'},flat:'EKN'};
 },
 // v0.13: a wide glass bell with a flat glow core and two eyes in it, a frilled skirt, thick oral arms and thin stingers with beads. Idle B swells the bell tall and
 // swings the arms; the lunge lashes the arms forward to wrap; a hit flattens the bell and flashes the core. Frames come from f (art.js frame API).
 brinejelly(g,f){const F=mfr(f);
  let cx=20,cy=14,rx=14,ry=9.5,ph=F.i?3.14:0,ln=0;
  if(F.b){rx=12.8;ry=10.8;cy=13;ln=2;}if(F.atk){cx=18;rx=14;ry=8.2;cy=15;}if(F.hit){rx=15;ry=7;cy=17;ph=2;}
  const by=Math.round(cy+ry*.62);
  sph(g,cx,cy,rx,ry,'A','B');g.ell(cx-rx*.4,cy-ry*.52,rx*.34,ry*.2,'W');clr(g,0,by,40,40);
  g.ell(cx,by-1,rx+.6,2.2,'b');for(let x=Math.round(cx-rx-1);x<=cx+rx;x++)if((x+F.i)%3===0)g.rect(x,by+1,1,2,'B');
  [[-11,'b',17],[-4,'b',19],[4,'b',18],[11,'b',16]].forEach(([o,k,l],n)=>{const t=tend(g,cx+o,by+1,l-5+ln,2,ph+n*1.7,k,1,F.hit?o*.25:F.atk?-2:0);g.s(Math.round(t[0]),Math.round(t[1]),'C');g.s(Math.round(t[0]),Math.round(t[1])-4,'C');});
  [[-6,0],[0,1],[6,2]].forEach(([o,n])=>{const fwd=F.atk&&n>0;const t=tend(g,cx+o,by,fwd?7:12+ln,fwd?-3:2.4,ph+n,'O',2,fwd?9+n*2:F.hit?-o*.3:0);g.px([[Math.round(t[0])-1,Math.round(t[1])],[Math.round(t[0])+1,Math.round(t[1])-2]],'A');});
  const kx=Math.round(cx+2),ky=Math.round(cy+1);
  g.ell(kx,ky,6.4,4.6,'Y');g.ell(kx,ky,4.8,3.2,F.hit?'W':'G');
  if(F.hit)g.rect(kx-3,ky,2,1,'K'),g.rect(kx+1,ky,2,1,'K');else{g.rect(kx-2,ky-1,1,2,'K');g.rect(kx+2,ky-1,1,2,'K');g.s(kx-2,ky-1,'W');}
  [[-9,-2],[9,-3],[-5,5],[12,2]].forEach(([dx,dy])=>g.s(cx+dx,cy+dy,'L'));
  return {pal:{B:'#4aa8b8',A:'#8ad8e4',b:'#2f7f94',O:'#3a96a8',L:'#c8f4ff',K:'#10242c',W:'#ffffff',Y:'#a8f0ff',G:'#f0ffff',C:'#e8ffff'},flat:'LKWYGC',glow:'#a0e8f0',a:{cx,cy,rx,ry,by,kx,ky}};
 },
 rimewight(g){
  g.poly([[20,10],[30,14],[33,38],[26,34],[20,39],[14,34],[7,38],[10,14]],'B');g.poly([[12,22],[9,34],[15,30]],'b');g.poly([[28,22],[31,34],[25,30]],'b');
  g.ell(20,12,6,6,'K');g.rect(17,11,3,2,'E');g.rect(22,11,3,2,'E');
  g.poly([[13,8],[14,1],[17,6],[20,0],[23,6],[26,1],[27,8]],'C');
  g.line(8,18,4,28,'b',2);g.line(32,18,36,28,'b',2);g.px([[3,29],[4,30],[36,29],[37,30]],'C');
  g.path([[20,16],[20,34]],'b');g.px([[16,24],[24,26],[20,30],[12,30],[28,32]],'C');
  return {pal:{B:'#6a86b0',b:'#46608a',K:'#0c1424',E:'#aaf4ff',C:'#d4f0ff'},flat:'EKC'};
 },
 galephantom(g){
  g.poly([[20,6],[28,10],[30,20],[27,28],[31,38],[22,32],[18,39],[14,31],[8,36],[11,26],[10,16],[13,9]],'B');
  g.poly([[14,18],[10,28],[16,24]],'b');g.poly([[26,18],[30,28],[24,24]],'b');
  g.ell(20,14,5,5,'K');g.rect(17,13,2,2,'E');g.rect(22,13,2,2,'E');g.line(18,19,23,19,'K');
  g.path([[4,12],[10,10],[8,15]],'W');g.path([[36,20],[31,18],[33,24]],'W');g.path([[3,26],[9,28]],'W');g.path([[37,32],[32,31]],'W');
  return {pal:{B:'#7a7aa8',b:'#54547e',K:'#0e0e22',E:'#c8a8ff',W:'#cfe8ff'},flat:'EKW'};
 }
});
MART.gnatswarm.fr=1;MART.brinejelly.fr=1;MART.barrowbones.fr=1;

// companion families for taming
if(typeof FAM_OF!=='undefined')Object.assign(FAM_OF,{gnatswarm:'flyer',barrowbones:'spirit',drownedsailor:'spirit',brinejelly:'ooze',rimewight:'spirit',galephantom:'spirit'});

// realm pools: Undead where the story puts them (a barrow, a harbor, a mountain pass, the high wind), a Jelly and a Swarm among the living
ZONES[0].pool.push('gnatswarm','barrowbones');
ZONES[1].pool.push('drownedsailor','brinejelly');
ZONES[3].pool.push('rimewight');
ZONES[4].pool.push('galephantom');
