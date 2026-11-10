// ===== art3.js (base): the 60x60 guardian sprites =====
// BOSSART-A-BEGIN
// ===== v0.14.1: the boss redesign toolkit (every Scourge, Calamity and the Riftkeeper are drawn from scratch with it) =====
// bT4 gives one material four tones under four keys (highlight, base, shade, deep); bsh paints a mask of shape ops with those four keys, lit from the top left
// (each pixel's tone comes from how far it sits from the upper left and the lower right edge of its own shape, so any shape gets a rounded, lit look);
// bpath/btube/bbands are smooth tapering tubes (necks, tails, limbs, tentacles) and the cross bands that wrap them. All pure functions of the frame f:
// F.b is idle frame B (the tell part moves: crown, maw, core, wings), F.atk the roar pose (monCanvas(art,{t:'atk'})); battle.js does not draw it yet.
function bT4(k,c,o){o=o||{};const w=o.warm||'#fff0c8',cl=o.cool||'#2a1450',r={};r[k[0]]=mix(tint(c,.34),w,.2);r[k[1]]=c;r[k[2]]=mix(shade(c,.7),cl,.16);r[k[3]]=mix(shade(c,.46),cl,.3);return r;}
function bpath(P,r0,r1,step){const n=P.length,rs=Array.isArray(r0)?r0:P.map((_,i)=>r0+(r1-r0)*(n>1?i/(n-1):0)),at=i=>P[Math.max(0,Math.min(n-1,i))],out=[];step=step||.5;
  for(let i=0;i<n-1;i++){const p0=at(i-1),p1=at(i),p2=at(i+1),p3=at(i+2),len=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),N=Math.max(2,Math.ceil(len/step));
    for(let j=(i?1:0);j<=N;j++){const u=j/N,u2=u*u,u3=u2*u,f=(a,b,c,d)=>.5*(2*b+(-a+c)*u+(2*a-5*b+4*c-d)*u2+(-a+3*b-3*c+d)*u3);
      const x=f(p0[0],p1[0],p2[0],p3[0]),y=f(p0[1],p1[1],p2[1],p3[1]),dx=f(p0[0],p1[0],p2[0],p3[0]+.01)-x||p2[0]-p1[0],dy=p2[1]-p1[1];
      const l=Math.hypot(p2[0]-p1[0],p2[1]-p1[1])||1;out.push({x,y,r:rs[i]+(rs[i+1]-rs[i])*u,dx:(p2[0]-p1[0])/l,dy:(p2[1]-p1[1])/l});}}
  return out;}
function btube(t,P,r0,r1,k){bpath(P,r0,r1,.5).forEach(s=>t.ell(s.x,s.y,Math.max(.9,s.r),Math.max(.9,s.r),k||1));}
// spike: a triangle from base centre (x0,y0) to tip (x1,y1), width w at the base
function bspike(t,x0,y0,x1,y1,w,k){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,px=-dy/l*w/2,py=dx/l*w/2;t.poly([[x0+px,y0+py],[x1,y1],[x0-px,y0-py]],k||1);}
function bop(t,o){const c=o[0];
  if(c==='e')t.ell(o[1],o[2],o[3],o[4],1);else if(c==='p')t.poly(o[1],1);else if(c==='r')t.rect(o[1],o[2],o[3],o[4],1);
  else if(c==='l')t.line(o[1],o[2],o[3],o[4],1,o[5]);else if(c==='t')btube(t,o[1],o[2],o[3]);else if(c==='k')bspike(t,o[1],o[2],o[3],o[4],o[5]);
  else if(c==='c')o[1].forEach(q=>t.ell(q[0],q[1],q[2],q[2],1));}
// bsh(g, ops, K, opt): ops are ['e',cx,cy,rx,ry] ellipse, ['p',[[x,y]..]] polygon, ['r',x,y,w,h], ['l',x0,y0,x1,y1,thick], ['t',pts,r0,r1] tube, ['k',x0,y0,x1,y1,w] spike,
// ['c',[[x,y,r]..]] circles; K the four keys (hi, base, shade, deep); opt.bias shifts the light, opt.cap the probe length.
function bsh(g,ops,K,o){o=o||{};const W=g.w,H=g.h,t=new PG(W,H,0,0),cap=o.cap||12,bias=o.bias||0;ops.forEach(p=>bop(t,p));const A=t.a;
  const dep=(x,y,dx,dy)=>{let n=0;while(n<cap&&t.g(x+dx*(n+1),y+dy*(n+1)))n++;return n;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!A[y*W+x])continue;const u=dep(x,y,-1,-1),d=dep(x,y,1,1),s=(u+.5)/(u+d+1)+bias;
    g.s(x,y,s<.2?K[0]:s<.6?K[1]:s<.84?K[2]:K[3]);}
  return g;}
// bbands: short cross bands over a tube (key k only where the grid already holds one of the keys in `over`), every `step` px along the path, on the lit or shaded side
function bbands(g,P,r0,r1,step,k,over,side){const S=bpath(P,r0,r1,step);S.forEach((s,i)=>{const nx=-s.dy,ny=s.dx;
  for(let a=-s.r*.9;a<=s.r*.9;a+=.6){if(side&&(side>0?a<0:a>0))continue;const x=Math.round(s.x+nx*a),y=Math.round(s.y+ny*a);if(over.includes(g.g(x,y)))g.s(x,y,k);}});}
function bpts(g,L,k){L.forEach(p=>g.s(p[0],p[1],k));}
function beye(g,x,y,k,w){g.rect(x,y,2,2,k);g.s(x,y,w||'W');}
Object.assign(MART,{
 thornwarden(g,f){const F=mfr(f),B=F.b?1:0,R=F.atk?1:0,sw=B?1:0;
  const bk='abcd',lf='efgh',th='ijkl';
  g.ell(30,57,25,2.6,'D');
  // root legs flaring into toes along the ground
  bsh(g,[['t',[[23,36],[20,46],[17,54]],6.5,5.5],['t',[[19,52],[10,55],[3,57]],2.6,1],['t',[[17,54],[13,57]],2,1],['t',[[20,55],[27,57]],2,1]],bk);
  bsh(g,[['t',[[37,36],[40,46],[43,54]],6.5,5.5],['t',[[41,52],[50,55],[57,57]],2.6,1],['t',[[43,54],[47,57]],2,1],['t',[[40,55],[33,57]],2,1]],bk);
  // trunk: a broad hunched mass, shoulders wider than the waist
  bsh(g,[['p',[[10,20],[16,12],[44,12],[50,20],[46,34],[40,44],[20,44],[14,34]]],['e',30,30,16,13]],bk,{cap:14});
  // bark grooves and knots
  [[18,22,16,40],[23,16,21,42],[37,16,39,42],[42,22,44,38]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'c'));
  [[26,24,22,34],[34,22,36,32],[30,34,29,42],[14,30,16,36],[46,28,45,34]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'d'));
  g.ell(21,37,2.4,3.4,'d');g.ell(21,37,1.4,2.2,'K');g.ell(40,36,2,3,'d');g.ell(40,36,1,2,'K');
  // moss across the shoulders and a green mantle on the left
  bsh(g,[['e',20,15,9,4],['e',38,14,8,3.4],['e',13,22,4,3],['e',47,22,4,3]],lf);
  g.px([[12,24],[13,26],[47,24],[46,26],[24,19],[34,18]],'g');
  // glowing sap: a crack down the chest into a heart-knot, drips
  g.path([[30,24],[28,28],[31,32],[29,37]],'x',1);g.path([[30,24],[33,27]],'x');g.path([[28,28],[24,30]],'x');
  g.ell(30,33,3.6,3.6,'c');g.ell(30,33,2.6,2.6,'x');g.ell(29.5,32.5,1.2,1.2,'y');
  g.px([[29,39],[29,41],[22,40],[40,38]],'x');
  // hanging arm on the left, dragging a thorn-knuckled fist
  bsh(g,[['t',[[13,18],[6,27],[5,37],[8,45]],5.5,4.2],['e',9,47,6.2,5.4]],bk);
  g.line(7,24,5,36,'c');g.line(8,38,8,42,'d');
  [[5,44,0,40],[3,48,-1,51],[7,52,4,57],[13,46,16,41],[11,51,13,56]].forEach(q=>{const t=new PG(60,60,0,0);bspike(t,q[0],q[1],q[2],q[3],3.4,1);t.a.forEach((v,i)=>{if(v)g.s(i%60,Math.floor(i/60),'j');});});
  // the raised arm on the right: a club of root and thorn
  bsh(g,[['t',[[47,18],[55,23],[57,16],[55,12]],5.5,4.4],['e',54,10,6,5.4]],bk);
  g.line(54,22,56,16,'c');
  [[52,6,48,2],[56,5,57,2],[59,10,60,8],[56,15,59,18],[50,10,47,8]].forEach(q=>{const t=new PG(60,60,0,0);bspike(t,q[0],q[1],q[2],q[3],3.2,1);t.a.forEach((v,i)=>{if(v)g.s(i%60,Math.floor(i/60),'j');});});
  // shoulder thorns (bone pale, lit tips)
  bsh(g,[['k',17,15,10,5,5],['k',24,12,20,3,4.5],['k',36,12,40,3,4.5],['k',43,15,49,8,4.5]],th);
  // head: a low, scowling bark mask under the crown
  bsh(g,[['e',30,19,9,7.4],['r',22,22,16,4]],bk);
  g.rect(22,15,16,2,'c');g.rect(23,14,5,1,'d');g.rect(33,14,5,1,'d');
  g.rect(24,17,3,3,'K');g.rect(33,17,3,3,'K');g.rect(25,18,2,2,'x');g.rect(34,18,2,2,'x');g.s(25,18,'y');g.s(34,18,'y');
  g.rect(25,23,10,3,'K');for(let x=25;x<35;x+=2)g.poly([[x,23],[x+1.6,23],[x+.8,25.4]],'i');for(let x=26;x<35;x+=3)g.poly([[x,26],[x+1.6,26],[x+.8,24]],'j');
  g.path([[27,27],[25,32]],'g',1);g.path([[33,27],[35,33]],'g',1);
  // the bramble crown: thorn branches rising and curling, roses at the tips
  const tip=(a,b)=>[a+sw*b,0];
  [[[24,12],[18,8],[13+sw,3.5]],[[27,11],[23,6],[21+sw,2.5]],[[30,10],[30,5],[31+sw,2.2]],[[33,11],[38,6],[40-sw,2.5]],[[36,12],[43,8],[47-sw,4]],[[21,13],[14,12],[8+sw,8]]].forEach(P=>{
    bsh(g,[['t',P,2.2,.9]],bk);const e=P[2];g.ell(e[0],e[1],1.8,1.6,'r');g.s(e[0],e[1],'y');});
  bsh(g,[['e',30,11,8,2.4]],lf);
  [[17,7],[24,5],[37,5],[44,9],[12,11]].forEach(p=>g.s(p[0],p[1],'j'));
  return {pal:Object.assign({},bT4(bk,'#6a4a2c'),bT4(lf,'#5f9440'),bT4(th,'#d8c698'),{x:'#ffb22e',y:'#fff0b0',r:'#e8506e',g:'#7fae4e',D:'#160d08',K:'#0c0604'}),flat:'xyrKg',rim:'#1a0e08'};
 }
});
Object.assign(MART,{
 drake(g,f){const F=mfr(f),B=F.b?1:0,R=F.atk?1:0,sc='abcd',fn='efgh',cr='ijkl',wt='mnop',hy=3;
  // the swell it coils out of
  bsh(g,[['e',28,56,23,3.4],['e',11,54,7,3],['e',46,54,7,3.2]],wt);
  g.px([[8,52],[12,51],[19,55],[38,55],[45,52],[49,53],[26,56],[33,55]],'w');
  const P=[[4,41],[6,50],[15,56],[27,54],[38,48],[42,37],[37,27],[29,23],[26,15],[29,11]],r=[1.2,3,5.2,6.6,7,6.4,5.8,5.4,5.2,4.8];
  // dorsal fin: a sail of spikes on the outer edge of every bend
  bpath(P,r,0,3.2).forEach((s,i)=>{if(i<2||i>bpath(P,r,0,3.2).length-3)return;let nx=-s.dy,ny=s.dx;const ox=s.x-30,oy=s.y-38;if(nx*ox+ny*oy<0){nx=-nx;ny=-ny;}
    const L=3+((i*7)%3)+s.r*.3+B*(i%2?1:0);bsh(g,[['k',s.x+nx*s.r*.5,s.y+ny*s.r*.5,s.x+nx*(s.r+L),s.y+ny*(s.r+L)-1,3.4]],fn);});
  bsh(g,[['t',P,r,0]],sc,{cap:10});
  bbands(g,P,r,0,2.6,'c','bcd',1);
  // lit belly scutes on the inside of the coil
  bbands(g,P,r.map(v=>v*.55),0,2.6,'f','abcd',-1);
  // fins on the tail
  bsh(g,[['p',[[4,41],[2,34],[7,38],[5,31],[10,39],[7,45]]]],fn);
  // scale rows on the flank
  [[38,50,44,43],[40,36,36,29],[22,52,30,50]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'d'));
  // head: a long jaw, wide open, lightning held between the teeth
  const j=B?1:0,X=x=>Math.round((28+(x-28)*.86)*10)/10;
  g.poly([[X(30),10+hy],[X(52),10+hy],[X(53),15+hy+j],[X(40),13+hy],[X(30),13+hy]],'K');
  bsh(g,[['p',[[X(27),4+hy],[X(36),2+hy],[X(47),4+hy],[X(55),8+hy],[X(53),10.5+hy],[X(40),10.5+hy],[X(29),11+hy]]],['e',X(35),6+hy,4.2,3.4]],sc);
  bsh(g,[['p',[[X(29),12+hy],[X(40),13+hy],[X(52),16+hy+j],[X(50),19+hy+j],[X(38),17.5+hy],[X(29),16+hy]]]],sc);
  g.px([[X(37),11+hy],[X(41),11+hy],[X(45),11+hy],[X(49),11+hy],[X(39),13+hy],[X(44),14+hy+j],[X(48),15+hy+j]],'W');
  g.line(48,10+hy,53,9+hy,'c');g.px([[X(53),9+hy],[X(52),9+hy]],'K');
  g.path(B?[[X(38),11+hy],[X(41),14+hy],[X(44),11.5+hy],[X(48),15+hy+j]]:[[X(39),11+hy],[X(42),13.5+hy],[X(45),12+hy],[X(48),14+hy+j]],'x',1);g.px([[X(44),11+hy],[X(46),15+hy+j]],'y');
  g.rect(Math.round(X(35)),5+hy,3,2,'x');g.s(Math.round(X(36)),6+hy,'K');g.s(Math.round(X(35)),5+hy,'y');g.line(32,3+hy,Math.round(X(38)),3+hy,'c');
  // the storm crest: three gold horns swept back, a barbel off the chin
  [[[X(31),5+hy],[25,2+hy+B],[18,3+hy+B]],[[X(34),4+hy],[X(30),1+hy+B],[25,.5+hy+B]],[[X(28),8+hy],[22,7+hy],[17,10+hy-B]]].forEach(Q=>bsh(g,[['t',Q,2.2,.7]],cr));
  g.path([[X(34),19+hy],[X(30),23+hy],[26,22+hy+B]],'j',1);
  // lightning crackling off the coils
  bolt(g,10,12,16,3,'x',1);bolt(g,50,22,16,-3,'x',1);bolt(g,8,28,10,2,'x',1);
  g.px(B?[[14,10],[5,20],[56,20],[54,34],[12,26]]:[[4,16],[13,22],[58,26],[50,32],[10,10]],'y');
  return {pal:Object.assign({},bT4(sc,'#2f6cb0'),bT4(fn,'#a8e4f0'),bT4(cr,'#e8bc3c'),bT4(wt,'#3aa0c4'),{x:'#ffe84a',y:'#fffbd0',w:'#f4ffff',W:'#f4f0e0',K:'#0a1020'}),flat:'xywWK',glow:'#6ad0ff',rim:'#0e1a3a'};
 },
 cinderking(g,f){const F=mfr(f),B=F.b?1:0,sl='abcd',fe='efgh';
  g.ell(30,57,24,2.6,'D');
  // legs and heavy boots of cooling slag
  bsh(g,[['p',[[17,38],[27,38],[26,53],[28,57],[13,57],[15,53]]],['p',[[33,38],[43,38],[45,53],[47,57],[32,57],[34,53]]]],sl);
  g.line(21,42,22,50,'x');g.line(39,41,38,49,'x');g.px([[20,43],[23,47],[40,44],[37,50]],'y');
  g.rect(14,54,13,2,'f');g.rect(33,54,13,2,'f');
  // the great torso, wide at the shoulders
  bsh(g,[['p',[[9,21],[16,13],[44,13],[51,21],[47,33],[42,43],[18,43],[13,33]]]],sl,{cap:14});
  [[16,22,20,40],[44,22,40,40],[24,16,23,30],[36,16,37,30]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'c'));
  // magma veins
  g.path([[16,22],[20,27],[18,34],[22,40]],'x');g.path([[44,22],[39,26],[42,33],[37,40]],'x');g.path([[24,17],[26,22]],'x');g.path([[36,17],[34,23]],'x');
  // belt of iron and the furnace behind a grate
  bsh(g,[['r',17,38,26,4]],fe);
  bsh(g,[['e',30,29,7.4,7.4]],fe);g.ell(30,29,5.4,5.4,'K');g.ell(30,29,4.6,4.6,B?'y':'x');g.ell(30,29,2.6,2.6,B?'W':'y');
  for(let i=-1;i<=1;i++)g.line(30+i*3,24,30+i*3,34,'e');g.line(25,29,35,29,'f');
  // pauldrons: iron domes with horns, one each side
  bsh(g,[['e',11,20,9,7.4],['k',7,15,3,6,5],['k',13,14,12,5,5]],fe);bsh(g,[['e',49,20,9,7.4],['k',53,15,57,6,5],['k',47,14,48,5,5]],fe);
  g.px([[8,19],[14,22],[46,22],[52,19]],'f');g.s(7,20,'x');g.s(53,20,'x');
  // left arm hangs to a slag fist
  bsh(g,[['t',[[10,25],[6,34],[7,43]],5.4,4.6],['e',8,46,6.4,5.6]],sl);
  g.line(7,48,12,47,'c');g.px([[4,44],[10,49]],'x');
  // right arm raised: a maul of slag and iron
  bsh(g,[['t',[[50,25],[56,28],[54,25]],4.6,4.6],['e',54,25,4.6,4.4]],sl);
  bsh(g,[['r',52,8,4,32]],fe);bsh(g,[['p',[[43,1],[59,1],[60,12],[42,12]]]],fe);g.rect(44,6,15,1,'x');g.rect(43,11,17,1,'f');g.px([[46,3],[51,3],[56,3]],'f');
  // the head: a black iron helm with two ember eyes, and a crown of cooling spikes
  bsh(g,[['r',23,6,14,10],['p',[[23,15],[37,15],[34,20],[26,20]]]],fe);
  g.rect(25,10,10,3,'K');g.rect(26,10,3,2,B?'y':'x');g.rect(31,10,3,2,B?'y':'x');g.line(25,17,35,17,'f');g.px([[27,18],[30,18],[33,18]],'K');
  bsh(g,[['k',24,6,21,-1,4.4],['k',28,6,27,-2,4.4],['k',32,6,33,-3,4.4],['k',36,6,40,-2,4.4]].map(o=>o),fe);
  g.rect(23,6,14,1,'x');g.px([[22,3],[27,0],[33,-1],[39,1]].map(p=>[p[0],p[1]+3+B]),'y');
  // embers
  g.px(B?[[4,12],[56,40],[2,36],[44,52]]:[[3,14],[57,42],[1,38],[46,50]],'x');
  return {pal:Object.assign({},bT4(sl,'#5a4640',{cool:'#2a1020'}),bT4(fe,'#7a8094'),{x:'#ff7a1e',y:'#ffd860',W:'#fff4c8',K:'#0e0608',D:'#1a0e0c'}),flat:'xyWK',glow:'#ff7a2a',rim:'#1a0a08'};
 },
 hoarwyrm(g,f){const F=mfr(f),B=F.b?1:0,ic='abcd',gl='efgh',bn='ijkl',m=x=>60-x;
  g.ell(30,57,22,2,'D');
  // ice crags at the foot
  bsh(g,[['p',[[2,57],[6,46],[11,57]]],['p',[[9,57],[14,49],[19,57]]],['p',[[m(2),57],[m(6),46],[m(11),57]]],['p',[[m(9),57],[m(14),49],[m(19),57]]],['p',[[19,57],[23,51],[26,57]]],['p',[[m(19),57],[m(23),51],[m(26),57]]]],gl);
  // wings of glass: bone arm, fingers, a pane between them and an icicle fringe
  [1,-1].forEach(sd=>{const X=x=>sd>0?x:m(x),w=B?1:0;
    bsh(g,[['p',[[X(25),28],[X(15),18],[X(5),7-w],[X(3),19],[X(6),27],[X(9),34],[X(14),37],[X(20),34]]]],gl);
    [[X(15),18,X(3),19],[X(15),18,X(6),27],[X(15),18,X(9),34],[X(18),20,X(14),37]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'f'));
    g.line(X(24),27,X(14),19,'h');g.line(X(21),30,X(11),24,'h');
    bsh(g,[['k',X(3),19,X(0),26,3.4],['k',X(6),27,X(3),35,3.4],['k',X(9),34,X(7),42,3.4],['k',X(14),37,X(13),44,3.4]],gl);
    bsh(g,[['t',[[X(25),28],[X(15),18],[X(5),7-w]],1.8,1]],gl);g.s(X(5),6-w,'y');});
  // the coil: a thick neck, a ridge of ice along it, the tail curling under
  const P=[[30,20],[30,28],[30,36],[27,44],[21,49],[25,55],[35,55],[41,51]],r=[4.6,6.4,6.4,5.6,4.6,3.8,3,1.4];
  bsh(g,[['t',P,r,0]],ic,{cap:10});
  bbands(g,P,r.map(v=>v*.5),0,2.4,'b','abcd',0);bbands(g,P,r,0,2.4,'c','bcd',1);
  [[24,26],[36,26],[24,34],[36,34],[25,42],[34,42]].forEach(([x,y],i)=>bsh(g,[['k',x,y,x+(x<30?-4:4),y-3,4]],gl));
  bsh(g,[['k',41,51,47,46,4],['k',41,51,48,52,3.4],['k',40,52,44,57,3.4]],gl);
  // the head: a pale wedge of a skull under branching antlers of ice
  [1,-1].forEach(sd=>{const X=x=>sd>0?x:m(x);
    bsh(g,[['t',[[X(25),9],[X(19),5],[X(14),3]],2.2,.8],['t',[[X(21),6],[X(18),2.5]],1.4,.6],['t',[[X(19),5],[X(13),7]],1.4,.6]],gl);});
  bsh(g,[['p',[[23,9],[30,5],[37,9],[35,17],[30,22],[25,17]]],['e',30,10,7,4]],ic);
  g.rect(25,11,3,2,'E');g.rect(33,11,3,2,'E');g.s(25,11,'w');g.s(33,11,'w');g.line(26,9,29,10,'c');g.line(35,9,32,10,'c');
  g.px([[29,15],[31,15]],'K');g.rect(27,18,6,2,'K');g.px([[27,20],[29,20],[31,20],[33,20]],'W');g.px([[28,17],[32,17]],'W');
  // frost breath rolling off the jaw
  g.ell(30,24+B,2,1.2,'w');g.px(B?[[24,24],[36,25],[21,28],[39,29],[28,27],[33,28]]:[[25,23],[35,24],[22,27],[38,28],[29,27],[32,29]],'w');
  g.px([[7,13],[50,12],[3,30],[56,30],[13,8],[46,6]],'w');
  return {pal:Object.assign({},bT4(ic,'#a6cfe8',{cool:'#1a2e66'}),bT4(gl,'#cfeefa',{cool:'#2a3e88'}),bT4(bn,'#6a86b4'),{E:'#3ce6ff',w:'#ffffff',W:'#e8f8ff',y:'#e8fbff',K:'#08122a',D:'#14284a'}),flat:'EwWyK',glow:'#8ae0ff',rim:'#1c3868'};
 }
});
['thornwarden','drake','cinderking','hoarwyrm'].forEach(k=>{MEXTRA[k]=()=>{};});
Object.assign(MART,{
 ysolde(g,f){const F=mfr(f),B=F.b?1:0,rb='abcd',sk='efgh',hr='ijkl',cl='mnop',m=x=>60-x;
  // a thundercloud she hangs above; the robe frays into it
  bsh(g,[['e',13,52,9,4.6],['e',26,54,10,3.8],['e',40,53,10,4.4],['e',50,50,6.5,4],['e',31,50,12,4.2]],cl);
  g.px([[11,55],[20,57],[34,57],[44,56],[8,51]],'o');
  // a long robe: narrow at the shoulders, flaring into trumpet folds, hem torn into points
  bsh(g,[['p',[[24,23],[36,23],[41,36],[47,50],[40,47],[36,52],[31,47],[26,53],[22,47],[14,51],[19,36]]]],rb,{cap:14});
  [[28,26,24,46],[32,26,34,46],[30,30,30,48],[24,28,19,46],[36,28,41,46]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'c'));
  g.line(26,36,34,36,'x');g.rect(26,34,8,2,'x');g.px([[30,35]],'y');g.path([[19,47],[24,44],[31,46],[37,44],[42,47]],'x');
  g.px([[26,40],[34,41],[29,44],[22,43],[38,43]],'y');
  // sleeves thrown wide: one hand cups a ball of lightning, the other draws down a bolt
  bsh(g,[['t',[[26,25],[17,24],[11,17],[9,11]],4.2,2.6],['p',[[10,10],[6,18],[14,22],[15,16]]]],rb);
  bsh(g,[['t',[[34,25],[43,24],[49,17],[51,12]],4.2,2.6],['p',[[50,11],[54,19],[46,23],[45,17]]]],rb);
  g.ell(9.5,9,2.4,2.4,'f');g.ell(51,10,2.4,2.4,'f');
  g.ell(51,6+B*0,3.6+B*.6,3.6+B*.6,'x');g.ell(51,6,2.2,2.2,'y');
  bolt(g,7,0,10,2,'x',1);g.path(B?[[10,2],[7,6],[11,8]]:[[9,2],[12,5],[8,8]],'x');
  // hair: a mane of forked lightning flaring up and out, long strands behind the shoulders
  [[[27,10],[21,6],[16,2+B]],[[29,8],[26,3],[25,1+B]],[[31,8],[34,3],[37,1+B]],[[33,10],[39,6],[44,2+B]],[[25,13],[18,12],[12,9]],[[35,13],[42,12],[48,9]]].forEach(Q=>bsh(g,[['t',Q,2.4,.8]],hr));
  bsh(g,[['t',[[25,13],[21,22],[23,30],[21,36]],3.2,1],['t',[[35,13],[39,22],[37,30],[39,36]],3.2,1]],hr);
  // collar, face, circlet
  bsh(g,[['p',[[22,24],[38,24],[41,15],[30,18],[19,15]]]],rb);
  bsh(g,[['e',30,14.5,5.4,6.4]],sk);g.line(25,9,35,9,'x');g.px([[30,8]],'y');
  g.rect(26,13,3,1,'W');g.rect(32,13,3,1,'W');g.px([[26,12],[34,12]],'E');g.px([[29,12],[31,12]],'o');
  g.line(29,18,31,18,'e');g.px([[30,15]],'f');
  g.px(B?[[4,24],[56,32],[3,40],[57,18],[14,6],[48,5]]:[[3,28],[57,26],[4,36],[56,14],[12,4],[45,3]],'y');
  return {pal:Object.assign({},bT4(rb,'#38407e'),bT4(sk,'#f0d8c8',{cool:'#6a4a7a'}),bT4(hr,'#fff0a0'),bT4(cl,'#7a7ab0',{cool:'#241a5a'}),{x:'#ffd83a',y:'#fffbe0',W:'#ffffff',E:'#4ae0ff',o:'#cfe8ff',K:'#0a0820',D:'#1a1840'}),flat:'xyWEoK',glow:'#fff2a8',rim:'#14123a'};
 },
 dimmer(g,f){const F=mfr(f),B=F.b?1:0,rb='abcd',m=x=>60-x;
  // a tattered hem that bleeds into the floor
  bsh(g,[['p',[[22,21],[38,21],[43,34],[52,57],[46,53],[43,58],[38,54],[34,58],[30,53],[25,58],[21,54],[16,58],[13,53],[8,57],[17,34]]]],rb,{cap:16});
  [[28,22,22,50],[32,22,34,50],[25,26,16,52],[36,26,45,52],[30,24,30,52]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'c'));
  // the hollow: a figure shaped void with every swallowed light still inside it
  bsh(g,[['p',[[26,22],[34,22],[37,32],[35,46],[30,52],[25,46],[23,32]]]],'KKKK');
  g.px([[28,28],[32,30],[29,36],[33,40],[27,43],[31,47],[30,26],[34,35]],'A');
  g.px([[28,32],[31,38],[29,48],[32,44]],B?'D':'F');g.px([[30,33],[28,40]],B?'F':'C');g.px([[32,27],[26,36]],'H');
  // arms: long, thin, dragging past the hem, the hands spidery
  [1,-1].forEach(sd=>{const X=x=>sd>0?x:m(x);
    bsh(g,[['t',[[X(23),20],[X(14),30],[X(9),42],[X(8),53]],3.6,1.3]],rb);
    [[8,53,4,57],[8,53,8,58],[8,53,12,57],[9,50,13,53]].forEach(q=>g.line(X(q[0]),q[1],X(q[2]),q[3],'b'));g.line(X(8),53,X(5),50,'b');});
  // shoulders hunched, a hood without a face
  bsh(g,[['e',30,22,10,4.4],['p',[[21,20],[24,9],[30,5],[36,9],[39,20]]]],rb);
  bsh(g,[['e',30,14,6,8.4]],rb);
  g.ell(30,14,4.4,6.4,'K');g.rect(27,13,1,1,'W');g.rect(33,13,1,1,'W');g.px([[26,13],[28,13],[32,13],[34,13]],B?'A':'K');
  // the stolen lights: a broken halo of five lanterns
  [[15,14,'C'],[19,7,'D'],[30,3.5,'F'],[41,7,'H'],[45,14,'I']].forEach(([x,y,k],i)=>{g.ell(x,y,2.2,2.2,k);g.s(x,y,'W');if((i+B)%2)g.px([[x-3,y],[x+3,y],[x,y-3]],k);});
  g.px([[10,22],[50,24],[12,40],[48,42],[5,34],[55,34]],'A');
  return {pal:Object.assign({},bT4(rb,'#241c44'),{K:'#05030a',W:'#ffffff',A:'#e8e0ff',C:'#e8553a',D:'#5fc9a0',F:'#f6e7a8',H:'#3f8fe0',I:'#f2c93a',b:'#38306a'}),flat:'KWACDFHI',rim:'#6a4aa8',glow:'#8b5fd0'};
 },
 bonecolossus(g,f){const F=mfr(f),B=F.b?1:0,bn='abcd',ir='efgh';
  g.ell(30,57,24,2.6,'D');
  // legs: two columns of leg bones with kneecaps, wide flat feet
  bsh(g,[['t',[[24,38],[21,47],[20,54]],4.2,3.6],['e',21,47,3.8,3.4],['r',14,54,13,3]],bn);bsh(g,[['t',[[36,38],[39,47],[40,54]],4.2,3.6],['e',39,47,3.8,3.4],['r',33,54,13,3]],bn);
  g.line(19,56,26,56,'c');g.line(34,56,41,56,'c');
  // pelvis and the spine up through a barrel of ribs
  bsh(g,[['e',30,39,11,4.4]],bn);g.ell(30,39,3,2.4,'K');
  g.ell(30,28,13.5,11.5,'K');g.ell(30,27,6,7,'x');g.ell(30,27,3,4,B?'W':'y');
  bsh(g,[['t',[[30,40],[30,16]],2.4,2.4]],bn);
  for(let i=0;i<5;i++){const y=19.5+i*3.7,w=13-i*.9;[1,-1].forEach(sd=>bsh(g,[['t',[[30,y],[30+sd*w*.6,y-1.6],[30+sd*w,y+2.6]],1.5,1.1]],bn));}
  // a broken sword still lodged in the ribs
  bsh(g,[['l',20,38,38,16,2]],ir);g.rect(36,13,6,2,'f');g.line(37,12,41,15,'e');
  // great skulls for pauldrons
  [[12,18],[48,18]].forEach(([x,y],i)=>{bsh(g,[['e',x,y,6.4,5.6],['r',x-3,y+3,6,4]],bn);g.ell(x-2,y-.5,1.8,2,'K');g.ell(x+2,y-.5,1.8,2,'K');g.s(x-2,y,'x');g.s(x+2,y,'x');g.line(x-2,y+5,x+2,y+5,'K');g.px([[x-1,y+3],[x+1,y+3],[x,y+3]],'K');});
  // left arm: bone, resting on a knuckled fist
  bsh(g,[['t',[[14,23],[9,33],[8,42]],3.6,3],['e',8,46,6,5],['e',3.5,43,1.8,2.2]],bn);g.line(5,47,11,47,'c');g.px([[6,45],[9,45]],'c');
  // right arm: raised, swinging a femur
  bsh(g,[['t',[[46,23],[52,19],[53,12]],3.6,3],['e',53,15,3.8,3.6]],bn);
  bsh(g,[['t',[[53,16],[53,6]],2.6,2.4],['e',51,4.4,2.4,2.4],['e',55.4,4.4,2.4,2.4],['e',51,19,2.2,2.2],['e',55,19,2.2,2.2]],bn);
  // the head: a horned skull, jaw hung open, two violet lamps
  bsh(g,[['e',30,10,9,8],['p',[[23,14],[37,14],[35,22],[25,22]]]],bn);
  bsh(g,[['t',[[22,8],[16,5+B],[15,11]],2.6,1],['t',[[38,8],[44,5+B],[45,11]],2.6,1]],ir);
  g.ell(26,9,2.8,3,'K');g.ell(34,9,2.8,3,'K');g.rect(25,8,2,2,B?'y':'x');g.rect(33,8,2,2,B?'y':'x');g.poly([[29,12],[31,12],[30,15]],'K');
  g.rect(25,17,11,3,'K');for(let x=26;x<36;x+=2)g.rect(x,17,1,3,'a');g.line(27,22,34,22,'c');
  g.px([[20,24],[40,26],[36,36],[24,36]],'e');g.px([[10,2],[50,2],[3,30],[57,34]],'x');
  return {pal:Object.assign({},bT4(bn,'#d8c8a2',{cool:'#3a2a50'}),bT4(ir,'#8a6a58'),{x:'#b070ff',y:'#f0d0ff',W:'#ffffff',K:'#120a1c',D:'#2a1c34'}),flat:'xyWK',glow:'#8a50d0',rim:'#2a1a30'};
 },
 queenmantis(g,f){const F=mfr(f),B=F.b?1:0,ch='abcd',bl='efgh',gd='ijkl',wg='mnop';
  g.ell(28,57,19,2.4,'D');
  // gauze wings spread behind her like a train
  bsh(g,[['p',[[26,30],[6,12],[2,28],[7,42],[22,46]]],['p',[[28,28],[14,8],[22,6],[36,22]]]],wg);
  [[26,30,6,12],[26,32,3,28],[25,36,7,42],[28,28,14,8],[24,31,10,18]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'n'));
  // abdomen: long and segmented, curling down behind
  const A=[[30,36],[24,43],[17,50],[13,56]],ar=[5.6,5.4,4,1.6];bsh(g,[['t',A,ar,0]],ch);bbands(g,A,ar,0,2.2,'c','abcd',1);bbands(g,A,ar.map(v=>v*.5),0,2.2,'b','abcd',-1);
  bsh(g,[['k',13,56,8,59,2.6],['k',14,55,18,59,2.6]],ch);
  // hind legs
  bsh(g,[['t',[[28,42],[35,47],[38,56]],2.2,1.4],['t',[[25,45],[22,51],[24,57]],2.2,1.4]],ch);g.px([[38,57],[24,58]],'c');
  // thorax and a spiked collar
  bsh(g,[['t',[[30,38],[32,30],[34,22]],5,3.4]],ch);bbands(g,[[30,38],[32,30],[34,22]],5,3.4,2.5,'c','abcd',1);
  bsh(g,[['p',[[26,24],[42,24],[44,20],[37,26],[34,29],[28,26],[24,20]]],['k',25,24,21,20,3],['k',43,24,47,20,3]],gd);
  // the far scythe, behind the head; the near scythe, swept out in front
  const sc=(P,r0)=>{bsh(g,[['t',P,r0,1]],bl);bpath(P,r0,1,2.4).forEach((s,i)=>{if(i>1)bsh(g,[['k',s.x-s.dy*s.r*.6,s.y+s.dx*s.r*.6,s.x+s.dy*3.6-s.dx*1.4,s.y-s.dx*3.6-s.dy*1.4,2.6]],bl);});};
  sc([[36,25],[44,19],[49,9],[47,3-B]],2.8);
  sc([[32,27],[38,32],[48,30],[54,20],[55,9-B]],3.2);
  bsh(g,[['e',33,27,3.4,3.2]],ch);
  // the head: an inverted triangle with two great eyes, a gold tiara and long antennae
  bsh(g,[['p',[[31,10],[47,10],[44,17],[40,23],[35,17]]]],ch);
  bsh(g,[['e',34.5,13.5,3.4,4],['e',44,13.5,3,3.8]],bl);g.ell(34.5,13.5,2.4,3,'E');g.ell(44,13.5,2,2.8,'E');g.s(34,12,'W');g.s(43,12,'W');g.px([[35,14],[44,14]],'K');
  g.line(37,19,41,19,'K');g.px([[36,21],[40,21]],'c');
  bsh(g,[['k',33,10,31,3,2.8],['k',37,9,37,1.5,2.8],['k',41,9,42,1.5,2.8],['k',45,10,48,3,2.8]],gd);g.rect(32,9,15,2,'i');
  bsh(g,[['t',[[35,9],[30,5],[24,3+B]],1.4,.6],['t',[[43,9],[48,5],[54,4-B]],1.4,.6]],ch);
  g.px([[3,20],[56,38],[8,52],[50,50]],'y');
  return {pal:Object.assign({},bT4(ch,'#52ac3c'),bT4(bl,'#d8f0a8',{cool:'#2a6a34'}),bT4(gd,'#f0c850'),bT4(wg,'#b8e8a0',{cool:'#2a7a50'}),{E:'#f6dc3a',y:'#f0e8a0',W:'#fff8d0',K:'#10160a',D:'#18331a'}),flat:'EyWK',rim:'#12301a'};
 }
});
['ysolde','dimmer','bonecolossus','queenmantis'].forEach(k=>{MEXTRA[k]=()=>{};});
Object.assign(MART,{
 gloomcap(g,f){const F=mfr(f),B=F.b?1:0,cp='abcd',gl='efgh',st='ijkl';
  g.ell(30,57,25,2.4,'D');
  // mycelium roots creeping out of the stem, tipped with buds
  [[[24,53],[15,56],[6,55]],[[36,53],[45,56],[54,55]],[[22,48],[12,52],[5,49]]].forEach(Q=>bsh(g,[['t',Q,2.6,.8]],st));
  g.px([[5,48],[6,54],[54,54]],'x');
  // two small caps at its feet
  [[8,52,3.4],[52,53,3]].forEach(([x,y,r])=>{bsh(g,[['e',x,y,r,r*.7],['r',x-1,y,2,4]],st);bsh(g,[['e',x,y-1,r,r*.7]],cp);g.s(x-1,y-2,'x');});
  // the stem, with a torn skirt hanging from its ring
  bsh(g,[['p',[[23,30],[37,30],[39,42],[42,56],[18,56],[21,42]]]],st,{cap:14});
  [[26,34,25,52],[34,34,36,52],[30,36,30,54]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'k'));
  bsh(g,[['e',30,42,14,3.2],['p',[[16,43],[44,43],[47,50],[43,48],[40,52],[36,48],[31,52],[26,48],[21,52],[18,48],[14,50]]]],gl,{cap:8});
  g.line(18,43,42,43,'g');g.px([[20,46],[26,46],[32,47],[38,46]],'h');
  // gill dark under the cap with two old eyes in it
  bsh(g,[['e',30,31,26,4.6]],'ijkl'.replace(/./g,'q'));
  g.ell(30,32,24.6,3.8,'K');
  for(let x=7;x<54;x+=3)g.line(x,29,30+(x-30)*.78,34,'j');
  g.ell(23,33,2.8,2,'x');g.ell(37,33,2.8,2,'x');g.rect(22,32,2,2,'y');g.rect(36,32,2,2,'y');g.px([[23,33],[37,33]],'K');
  // the great cap: a purple dome, lit left, with glowing spots
  bsh(g,[['p',[[3,30],[4,23],[9,14],[17,8],[30,4],[43,8],[51,14],[56,23],[57,28],[44,29],[30,29.5],[16,29],[3,28]]]],cp,{cap:16});
  [[14,15,4,1],[30,10,5,1],[44,16,4,1],[21,24,3,1],[39,25,3,0],[9,25,2.4,0],[51,24,2.4,0],[35,17,2,0],[24,15,1.6,0]].forEach(([x,y,r,s],i)=>{const rr=r+(B&&i%2?.6:0);g.ell(x,y,rr,rr*.8,'x');g.ell(x-.5,y-.4,rr*.5,rr*.4,'y');});
  // spores drifting up
  g.px(B?[[4,6],[56,5],[11,2],[49,2],[2,40],[58,42],[30,1]]:[[4,9],[56,8],[12,4],[48,4],[2,36],[58,38],[28,2]],'x');
  return {pal:Object.assign({},bT4(cp,'#68409a'),bT4(gl,'#c8b0d8',{cool:'#3a2060'}),bT4(st,'#d6c6b0',{cool:'#4a3a50'}),{q:'#2a1a40',x:'#7af0d0',y:'#e8fff8',K:'#0a0614',D:'#160c24'}),flat:'xyK',glow:'#3ad0b0',rim:'#1c1030'};
 },
 ironsentinel(g,f){const F=mfr(f),B=F.b?1:0,st='abcd',cu='efgh',dk='ijkl';
  g.ell(30,57,24,2.6,'D');
  // a cogwheel behind the shoulders
  const ct=B?Math.PI/12:0;bsh(g,[['e',30,23,16.5,16.5]].concat([...Array(10)].map((_,i)=>{const a=i*Math.PI/5+ct,x=30+Math.cos(a)*17.5,y=23+Math.sin(a)*17.5;return ['e',x,y,3,3];})),dk);g.ell(30,23,11,11,'K');
  // legs: pistons and flat feet
  bsh(g,[['r',17,44,10,10],['r',33,44,10,10],['r',12,54,18,4],['r',30,54,18,4]],st);g.rect(20,46,4,6,'j');g.rect(36,46,4,6,'j');g.line(19,45,19,53,'d');g.line(41,45,41,53,'d');
  // torso: riveted plate with the furnace window
  bsh(g,[['p',[[11,20],[49,20],[47,44],[13,44]]]],st);g.rect(11,20,38,3,'a');g.rect(13,41,34,3,'c');
  bsh(g,[['r',23,26,14,12]],dk);g.rect(24,27,12,10,'K');g.rect(25,28,10,8,B?'y':'x');g.rect(27,31,6,4,B?'W':'y');for(let x=26;x<35;x+=3)g.rect(x,27,1,10,'j');
  [[13,23],[46,23],[14,41],[45,41],[30,24],[24,40],[36,40]].forEach(p=>g.s(p[0],p[1],'a'));
  bsh(g,[['r',17,38,26,2]],cu);
  // shoulder blocks with chimneys venting steam
  bsh(g,[['r',2,16,12,12],['r',46,16,12,12],['r',4,3,6,14],['r',50,3,6,14]],st);g.rect(3,3,8,2,'f');g.rect(49,3,8,2,'f');g.rect(5,17,4,10,'j');g.rect(51,17,4,10,'j');
  g.px([[3,19],[12,19],[3,26],[12,26],[47,19],[56,19],[47,26],[56,26]],'a');
  g.px(B?[[6,1],[4,0],[53,1],[56,0]]:[[7,1],[8,0],[52,1],[50,0]],'w');
  // arms: piston upper arms and crusher claws
  bsh(g,[['r',4,28,8,12],['r',48,28,8,12],['p',[[1,40],[14,40],[13,52],[9,52],[8,46],[7,52],[2,52]]],['p',[[46,40],[59,40],[58,52],[53,52],[52,46],[51,52],[47,52]]]],st);
  g.line(8,29,8,39,'j');g.line(52,29,52,39,'j');g.rect(2,40,12,2,'a');g.rect(46,40,13,2,'a');
  // head: a blocky helm, one cyan slit, two lightning rods
  bsh(g,[['r',23,7,14,13],['r',21,18,18,3]],st);g.rect(25,12,10,3,'K');g.rect(26,12,8,2,B?'W':'z');g.rect(23,7,14,2,'a');
  bsh(g,[['r',28,0,1,7],['r',32,1,1,6]],dk);g.px([[28,0],[32,1]],B?'W':'z');
  g.px(B?[[24,2],[38,3],[16,12],[44,10]]:[[26,3],[36,2],[15,10],[45,12]],'z');
  return {pal:Object.assign({},bT4(st,'#6a7288',{cool:'#1a2040'}),bT4(cu,'#c4783a'),bT4(dk,'#3a3e50'),{x:'#ff6a1a',y:'#ffd060',W:'#ffffff',z:'#6af4ff',w:'#e8eef4',K:'#0a0810',D:'#201c28'}),flat:'xyWzwK',rim:'#10101c'};
 },
 siren(g,f){const F=mfr(f),B=F.b?1:0,tl='abcd',hr='efgh',sk='ijkl',sh='mnop',wv='qrst';
  // the swell around her
  bsh(g,[['e',30,56,26,3.4],['e',10,54,8,3],['e',50,53,8,3.4]],wv);g.px([[7,52],[14,54],[46,52],[53,51],[24,55],[38,56]],'w');
  // tail: an S of scales, a crescent fan on the right
  const P=[[24,34],[31,38],[40,42],[43,49],[36,54],[27,54]],r=[6.4,6.8,6.4,5.4,4,2.4];
  bsh(g,[['t',P,r,0]],tl);bbands(g,P,r,0,2.2,'c','bcd',1);bbands(g,P,r.map(v=>v*.5),0,2.2,'a','abcd',-1);
  bsh(g,[['p',[[28,55],[20,50],[12,50],[8,44],[16,44],[12,38],[22,42],[26,48]]],['p',[[26,55],[18,58],[10,57],[17,54]]]],sh);
  [[12,48,19,52],[11,43,16,47],[14,40,20,45]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'o'));
  // hair: one long drowned-blue sweep to the left, a mass behind the head
  bsh(g,[['e',27,13,8,9.4],['t',[[23,8],[14,10],[8,20],[8,32],[12,41]],5.4,1.2],['t',[[22,14],[16,22],[15,32]],3,1]],hr);
  g.line(17,12,10,22,'g');g.line(24,8,15,11,'h');g.line(11,34,10,28,'g');
  // torso and the lifted arm with a pearl
  bsh(g,[['p',[[20,24],[31,24],[30,36],[21,36]]]],sk);g.px([[24,30],[28,31]],'j');g.line(21,26,29,26,'i');
  bsh(g,[['t',[[30,26],[38,21],[44,13]],3.4,2.2],['t',[[21,27],[17,32],[22,35]],3,2.2]],sk);
  g.ell(46.5,9,4.4,4.4,'p');g.ell(45,7.6,1.6,1.6,'W');g.s(48,12,'o');
  // face, pearl eyes, a mouth open in song, a shell crown
  bsh(g,[['e',26,15,6,7.2]],sk);g.rect(23,14,3,2,'W');g.rect(28,14,3,2,'W');g.px([[24,15],[29,15]],'o');g.ell(27,20,1.6,1.8+B*.6,'K');
  bsh(g,[['k',21,9,18,3,4],['k',24,8,23,2.4,4],['k',28,8,29,2.4,4],['k',32,9,35,3,4]],sh);g.rect(21,9,12,2,'m');g.px([[19,4],[23,3],[29,3]],'W');
  // the song as rings of foam
  [9,14].forEach(R=>{for(let a=-.8;a<=.8;a+=.22){const x=Math.round(30+Math.cos(a)*(R+B*2)),y=Math.round(20+Math.sin(a)*(R+B*2));if(x<58&&y>1)g.s(x,y,'w');}});
  return {pal:Object.assign({},bT4(tl,'#2c9aa8'),bT4(hr,'#2f56b8'),bT4(sk,'#c8ecea',{cool:'#2a4a7a'}),bT4(sh,'#f0c8d8'),bT4(wv,'#3a82b8'),{p:'#f8f4ff',o:'#bfe0ff',W:'#ffffff',w:'#e8f8ff',K:'#10243a',D:'#10304a'}),flat:'pWowK',glow:'#7ae0f0',rim:'#0e2a46'};
 },
 ashwyvern(g,f){const F=mfr(f),B=F.b?1:0,bd='abcd',wg='efgh',bl='ijkl',rk='mnop',wb=B?2:0;
  // the perch: a scorched rock with ember cracks
  bsh(g,[['p',[[6,57],[11,50],[22,46],[38,47],[48,52],[52,57]]]],rk);g.path([[16,52],[22,49],[27,52]],'x');g.path([[36,50],[42,54]],'x');
  // wing: a huge bat wing lifted behind, fingers splayed, ember at the edge
  bsh(g,[['p',[[30,31],[24,21],[15,11],[6,5],[3,17],[5,28+wb],[11,38+wb],[21,39]]]],wg);
  [[15,11,3,17],[15,11,5,28+wb],[15,11,11,38+wb],[20,20,12,36+wb]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'h'));
  g.path([[3,17],[5,28+wb],[11,38+wb]],'x');
  bsh(g,[['t',[[30,31],[24,21],[15,11],[6,5]],3,1.4]],bd);g.px([[6,4]],'y');
  bsh(g,[['k',5,28+wb,1,34+wb,3],['k',3,17,0,22,3]],bd);
  // tail with a barbed tip curling up
  bsh(g,[['t',[[19,42],[12,49],[6,50],[3,44],[5,39]],4.6,1]],bd);bsh(g,[['p',[[5,39],[1,36],[5,34],[9,37]]]],wg);g.px([[5,36]],'y');
  // body, a sloped chest rising into the neck; the lit belly
  const P=[[16,44],[24,40],[31,33],[36,25],[40,18],[42,12]],r=[3.6,6.6,7,6,4.4,3.6];
  bsh(g,[['t',P,r,0]],bd,{cap:10});bsh(g,[['t',[[22,42],[28,38],[33,31],[36,25]],3,2.4]],bl);bbands(g,P,r.map(v=>v*.7),0,2.4,'j','ijkl',1);
  [[22,36],[28,30],[34,24],[40,14]].forEach(([x,y])=>g.px([[x,y],[x+1,y+1]],'x'));
  // legs gripping the rock
  bsh(g,[['t',[[24,42],[23,47],[19,50]],3.4,2],['t',[[30,40],[32,45],[34,48]],3.2,2]],bd);g.px([[16,50],[17,51],[20,51],[34,49],[36,49],[35,50]],'W');
  // the head thrown back, jaw wide with a furnace inside
  g.poly([[42,12],[54,12],[56,19],[44,19]],'K');
  bsh(g,[['p',[[39,10],[45,5],[54,6],[57,9],[55,12],[47,12],[41,13]]],['e',44,8,5,4]],bd);
  bsh(g,[['p',[[42,14],[50,15],[56,19],[51,21],[44,18]]]],bd);
  g.rect(47,12,6,3,B?'y':'x');g.px([[49,12],[52,12],[51,17],[54,18]],'W');
  g.rect(43,6,2,2,'E');g.s(43,6,'y');
  bsh(g,[['t',[[41,7],[38,4],[33,6]],2.4,.8],['t',[[43,5],[40,2],[37,2]],1.8,.7]],bl);
  g.px(B?[[58,22],[54,24],[2,10],[52,40],[56,30],[24,3]]:[[56,23],[59,25],[3,12],[54,38],[58,32],[26,4]],'x');
  g.px([[60-3,26],[55,27],[8,2]],'y');
  return {pal:Object.assign({},bT4(bd,'#5a4e58',{cool:'#2a1020'}),bT4(wg,'#8c5a4a',{cool:'#3a1018'}),bT4(bl,'#b09a86'),bT4(rk,'#403840'),{x:'#ff6a2a',y:'#ffd860',E:'#ffb02a',W:'#f0e8d8',K:'#140a0c',D:'#201416'}),flat:'xyEWK',glow:'#ff7a30',rim:'#1c1014'};
 }
});
['gloomcap','ironsentinel','siren','ashwyvern'].forEach(k=>{MEXTRA[k]=()=>{};});
function bloc(g,x,y,s,L){// one locust facing left, about 7 px long: a banded body, a round head with a red eye, a folded wing, a jumper leg
  g.line(x-2*s,y,x+2*s,y+.6,'q',2);g.ell(x-3.4*s,y-.4,1.6*s,1.5*s,'q');g.s(x-4*s,y-1,'E');g.line(x-1.4*s,y-1.6*s,x+4*s,y-2*s,L?'v':'W',2);g.line(x+1*s,y+1,x+3.4*s,y+3.2*s,'r');g.line(x-1*s,y+1,x-1.6*s,y+3*s,'r');}
Object.assign(MART,{
 frostlich(g,f){const F=mfr(f),B=F.b?1:0,rb='abcd',ic='efgh',bn='ijkl',wd='mnop';
  g.ell(30,57,17,2.2,'D');
  // the robe: a tall narrow shroud, hem torn and rimed
  bsh(g,[['p',[[24,20],[36,20],[41,34],[47,52],[41,49],[37,56],[32,50],[27,56],[22,49],[17,55],[13,52],[19,34]]]],rb,{cap:14});
  [[28,26,24,50],[32,26,35,50],[30,30,30,52],[25,28,17,50],[36,28,43,50]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'c'));
  bsh(g,[['k',14,52,12,57,4],['k',20,54,19,58,4],['k',41,52,43,57,4],['k',35,55,36,58,4]],ic);g.px([[18,46],[24,52],[38,50],[44,48]],'f');
  // a high, jagged collar
  bsh(g,[['p',[[19,24],[18,11],[24,17],[26,22]]],['p',[[41,24],[42,11],[36,17],[34,22]]]],rb);bsh(g,[['k',18,12,15,6,3.4],['k',42,12,45,6,3.4]],ic);
  // sleeves and bony hands: one holding a rimed book open, the other a staff
  bsh(g,[['p',[[22,24],[14,28],[9,38],[17,38],[23,32]]]],rb);bsh(g,[['t',[[12,36],[11,40]],1.6,1.4]],bn);
  bsh(g,[['p',[[38,24],[46,26],[50,34],[43,34],[37,30]]]],rb);
  bsh(g,[['p',[[3,34],[17,32],[19,41],[5,43]]]],wd);g.poly([[5,35],[16,34],[17,40],[6,41]],B?'W':'o');g.line(11,34,12,41,'m');g.px([[7,37],[9,38],[13,36],[15,38]],'x');
  bsh(g,[['t',[[46,34],[47,8]],1.8,1.6],['t',[[46,56],[46,34]],1.8,1.8]],wd);
  bsh(g,[['p',[[46,2],[50,7],[46,13],[42,7]]]],ic);g.px([[46,5],[46,7],[45,8]],B?'W':'x');
  bsh(g,[['e',46,36,3,3]],bn);g.px([[46,36]],'K');
  // the phylactery: a gem on a chain, the ward
  g.path([[26,22],[28,29],[30,31]],'i');g.path([[34,22],[32,29],[30,31]],'i');bsh(g,[['p',[[30,29],[33,33],[30,38],[27,33]]]],ic);g.poly([[30,30],[32,33],[30,36],[28,33]],B?'W':'x');g.s(30,32,'W');
  // the skull, hollow and grinning, under a crown of icicles
  bsh(g,[['e',30,14,6.4,7],['r',25,18,10,5]],bn);g.rect(24,13,4,4,'K');g.rect(32,13,4,4,'K');g.rect(25,14,2,2,B?'W':'E');g.rect(33,14,2,2,B?'W':'E');g.px([[29,17],[31,17]],'K');
  g.rect(26,20,8,2,'K');for(let x=27;x<34;x+=2)g.rect(x,20,1,2,'i');g.line(26,23,34,23,'k');
  bsh(g,[['p',[[23,9],[37,9],[36,7],[24,7]]],['k',24,8,22,0,3.6],['k',27,8,27,-2,3.6],['k',30,7,30,-3,3.8],['k',33,8,33,-2,3.6],['k',36,8,38,0,3.6]],ic);g.rect(23,8,14,2,'g');
  [[6,14],[54,12],[7,44],[53,42],[4,28]].forEach(([x,y],i)=>bsh(g,[['p',[[x,y-3+(i%2?B:0)],[x+2,y],[x,y+3],[x-2,y]]]],ic));
  return {pal:Object.assign({},bT4(rb,'#33487a',{cool:'#0a1430'}),bT4(ic,'#bfeaf8',{cool:'#2a4a8a'}),bT4(bn,'#e8eef4',{cool:'#304060'}),bT4(wd,'#8a6a4a'),{x:'#6af0ff',E:'#7af4ff',W:'#ffffff',o:'#d8f4ff',K:'#08101e',D:'#0c1830'}),flat:'xEWoK',glow:'#5ab0e0',rim:'#0e1a38'};
 },
 locustchoir(g,f){const F=mfr(f),B=F.b?1:0,bd='abcd',wg='efgh',lg='ijkl',m=x=>60-x;
  g.ell(30,57,15,2.2,'D');
  // the cloud: small locusts in an hourglass (wide top and bottom, narrow in the middle), the ring turning a pixel each beat
  [[9,6,1],[24,4,.9],[38,5,1],[51,8,.9],[9,17,.9],[48,20,1],[16,26,.9],[44,30,.9],[10,38,1],[50,41,1],[8,50,1.1],[22,54,1],[40,53,1.1],[53,54,.9],[3,29,.8],[56,29,.8]].forEach(([x,y,s],i)=>bloc(g,x+(B&&i%2?1:0),y+(B&&i%3?1:0),s,i%2));
  // the conductor: spread wings like two spires of glass
  bsh(g,[['p',[[27,26],[15,8],[10,14],[11,26],[17,35],[26,36]]],['p',[[33,26],[45,8],[50,14],[49,26],[43,35],[34,36]]]],wg);
  [[27,26,15,8],[27,28,11,16],[26,31,12,26],[25,34,17,35],[33,26,45,8],[33,28,49,16],[34,31,48,26],[35,34,43,35]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'h'));
  bsh(g,[['t',[[27,26],[19,15],[15,8+B]],2,1],['t',[[33,26],[41,15],[45,8+B]],2,1]],bd);
  // jumper legs folded under it, front legs lifted to conduct
  [1,-1].forEach(sd=>{const X=x=>sd>0?x:m(x);bsh(g,[['t',[[X(26),44],[X(17),40],[X(12),50],[X(14),56]],3.2,1.4]],bd);bsh(g,[['t',[[X(26),28],[X(19),24],[X(16),14+B]],1.8,1]],bd);g.px([[X(15),13+B],[X(16),12+B]],'W');});
  // body: thorax and a banded abdomen
  const P=[[30,24],[30,34],[30,44],[30,52]],r=[5,6,6,3.4];bsh(g,[['t',P,r,0]],bd);bbands(g,P,r,0,2.4,'c','bcd',1);bsh(g,[['t',[[28,26],[28,38]],2,1.6]],lg);
  // head: great red eyes, a singing maw
  bsh(g,[['e',30,17,6.4,7]],bd);g.ell(26,16,2.6,3.2,'E');g.ell(34,16,2.6,3.2,'E');g.s(25,15,'W');g.s(33,15,'W');g.px([[26,17],[34,17]],'K');
  g.ell(30,22,2.8,1.4+B,'K');g.rect(29,21,2,1,'M');
  bsh(g,[['t',[[26,11],[20,5],[15,2]],1.4,.6],['t',[[34,11],[40,5],[45,2]],1.4,.6]],bd);
  // the song as gold notes
  g.px([[4,28],[5,26],[6,24],[55,22],[56,20],[57,18],[3,52],[57,44],[30,1]].map(p=>[p[0],p[1]-B]),'y');
  return {pal:Object.assign({},bT4(bd,'#8a9c3a',{cool:'#1a2a08'}),bT4(wg,'#dccf90',{cool:'#4a4010'}),bT4(lg,'#c8d868'),{q:'#a8742a',r:'#6a4a1e',E:'#ff5a30',y:'#ffe27a',v:'#e8b040',W:'#f4ecc0',M:'#8a2a1a',K:'#1a1008',D:'#2a2814'}),flat:'EyvWMK',rim:'#1a2008'};
 },
 ironmaw(g,f){const F=mfr(f),B=F.b?1:0,sh='abcd',ir='efgh',sk='ijkl',cr='mnop';
  g.ell(30,57,26,2.6,'D');
  // stumpy legs and a short spiked tail
  bsh(g,[['r',15,44,13,12],['r',37,44,14,12],['r',12,54,17,3],['r',35,54,19,3]],sk);g.px([[14,56],[17,56],[20,56],[37,56],[41,56],[45,56]],'W');
  bsh(g,[['p',[[52,42],[60,50],[54,52]]]],sk);
  // the shell: a green dome ribbed with ship iron
  bsh(g,[['p',[[10,44],[9,31],[14,20],[23,13],[35,12],[45,17],[53,26],[57,44]]]],sh,{cap:16});
  [[16,44,24,17],[28,44,34,15],[40,44,44,18],[52,44,52,26]].forEach((q,i)=>{g.line(q[0],q[1],q[2],q[3],'e');g.line(q[0]+1,q[1],q[2]+1,q[3],'f');});
  bsh(g,[['t',[[10,36],[24,31],[36,30],[48,33],[57,39]],2.6,2.2]],ir);g.rect(10,41,47,3,'g');
  [[15,28],[22,21],[34,18],[43,22],[48,29],[19,38],[30,38],[41,38],[52,41],[28,26],[16,34]].forEach(([x,y])=>{g.s(x,y,'x');g.s(x+1,y,'y');});
  g.px([[18,22],[40,17],[46,26],[24,43],[44,43],[51,36],[12,30],[56,34]],'W');
  // a lighthouse grown out of the shell
  bsh(g,[['r',24,8,7,9]],cr);g.rect(24,10,7,2,'x');g.rect(24,14,7,2,'x');bsh(g,[['r',22,6,11,2]],ir);bsh(g,[['r',25,3,5,3]],ir);g.rect(26,4,3,2,B?'W':'y');g.px([[27,4]],'W');
  g.px(B?[[19,5],[35,4],[37,6],[17,3]]:[[20,4],[34,5],[36,3],[18,6]],'y');
  // the head: low and wide, an iron jaw hung with teeth
  bsh(g,[['e',8,41,9,7],['e',6,37,5,3]],sk);
  g.poly([[1,44],[15,44],[15,47+B],[1,46]],'K');
  bsh(g,[['p',[[1,47+B],[15,47+B],[15,53+B],[3,54+B]]],['r',0,45,2,5]],ir);
  for(let x=2;x<15;x+=3)g.poly([[x,44],[x+1.6,44],[x+.8,47]],'W');for(let x=3;x<14;x+=4)g.poly([[x,47+B],[x+1.4,47+B],[x+.7,45]],'W');
  g.px([[3,50+B],[7,50+B],[11,50+B]],'x');
  g.rect(6,34,3,3,'y');g.rect(7,35,1,1,'K');g.line(3,34,10,32,'c');
  return {pal:Object.assign({},bT4(sh,'#5e7050'),bT4(ir,'#8a92a6',{cool:'#202840'}),bT4(sk,'#788a62'),bT4(cr,'#e8e0c8',{cool:'#4a3a2a'}),{x:'#c8a85a',y:'#ffd860',W:'#eee8d4',K:'#140a0a',D:'#1a2018'}),flat:'xyWK',rim:'#101810'};
 },
 candlemoth(g,f){const F=mfr(f),B=F.b?1:0,wg='abcd',lw='efgh',fu='ijkl',wx='mnop',m=x=>60-x,fl=B?2:0;
  g.ell(30,57,12,2,'D');
  // wings: broad dusty fans, a burning eyespot on each, wax drips along the hem
  [1,-1].forEach(sd=>{const X=x=>sd>0?x:m(x);
    bsh(g,[['p',[[X(26),22],[X(2),4-fl],[X(0),22],[X(6),38],[X(24),34]]]],wg);
    bsh(g,[['p',[[X(26),30],[X(6),42+fl],[X(10),56],[X(24),46]]]],lw);
    [[6,12],[3,22],[8,34]].forEach(([x,y])=>g.line(X(25),26,X(x+1),y,'f'));g.line(X(24),34,X(10),50,'g');
    g.ell(X(13),24,6,6,'x');g.ell(X(13),24,4,4,'y');g.ell(X(13),24,1.8,2.4,'K');g.s(X(13)-1,23,'W');
    [[10,36],[8,44]].forEach(([x,y])=>{g.line(X(x),y,X(x),y+4,'n');g.s(X(x),y+5,'n');});
    g.px([[X(8),10],[X(4),18],[X(6),28],[X(16),14],[X(20),40]],'W');});
  // furred body, legs
  const P=[[30,22],[30,34],[30,46]],r=[5.2,5.8,3.6];bsh(g,[['t',P,r,0]],fu);bbands(g,P,r,0,2.2,'k','jkl',1);
  bsh(g,[['t',[[27,46],[22,52],[20,57]],1.8,1.2],['t',[[33,46],[38,52],[40,57]],1.8,1.2],['t',[[30,48],[30,57]],1.8,1.2]],fu);
  // head with ember eyes and feathered antennae
  bsh(g,[['e',30,18,5.2,5.6]],fu);g.ell(27,19,1.8,2.4,'E');g.ell(33,19,1.8,2.4,'E');g.s(26,18,'W');g.s(32,18,'W');
  bsh(g,[['t',[[27,15],[20,9],[13,5+B]],1.6,.6],['t',[[33,15],[40,9],[47,5+B]],1.6,.6]],fu);
  g.px([[18,8],[16,7],[15,5],[42,8],[44,7],[45,5],[20,10],[40,10]],'j');
  // the crown: three burning tapers on a ring of wax
  [[24,11],[30,8],[36,11]].forEach(([x,y],i)=>{bsh(g,[['r',x-1,y,3,7]],wx);g.ell(x+.5,y-2.4-(i===1?B:1-B)*.0,1.7,2.7+((i+B)%2?.6:0),'x');g.ell(x+.5,y-1.8,.9,1.6,'y');g.s(x+.5,y-1,'W');});
  bsh(g,[['r',23,16,14,2]],wx);
  g.px([[4,2],[56,2],[2,32],[58,34],[16,50],[44,52],[30,2]],'y');
  return {pal:Object.assign({},bT4(wg,'#cdbb98',{cool:'#3a2a18'}),bT4(lw,'#a8906a',{cool:'#3a2a18'}),bT4(fu,'#f0e8d0',{cool:'#5a4a3a'}),bT4(wx,'#f4ecd2'),{x:'#ff9a30',y:'#fff0a0',E:'#ff6a2a',W:'#fffbe8',K:'#2a1008',D:'#2a2018'}),flat:'xyEWK',glow:'#ffcf70',rim:'#2a1c10'};
 }
});
['frostlich','locustchoir','ironmaw','candlemoth'].forEach(k=>{MEXTRA[k]=()=>{};});
Object.assign(MART,{
 brinehag(g,f){const F=mfr(f),B=F.b?1:0,kp='abcd',cl='efgh',sk='ijkl',ht='mnop';
  g.ell(30,57,26,2.4,'D');
  // the mound she rises from: kelp, a torn net and a coil of tentacle
  bsh(g,[['e',30,51,25,8],['p',[[3,56],[8,45],[17,50],[10,58]]],['p',[[57,56],[52,45],[43,50],[50,58]]]],kp);
  bsh(g,[['t',[[7,53],[3,46],[7,41],[6,36]],3,1.4],['t',[[53,53],[57,46],[53,41],[55,36]],3,1.4]],sk);g.px([[5,45],[56,45],[6,37],[55,37]],'W');
  for(let i=0;i<5;i++)g.line(8+i*10,57,12+i*10,46,'n');for(let i=0;i<3;i++)g.line(5,49+i*3,55,48+i*3,'n');
  // the cloak: a hunched wet bell with a hump on her back
  bsh(g,[['p',[[19,24],[41,24],[48,52],[12,52]]],['e',35,27,9,6]],cl,{cap:14});
  g.path([[14,52],[18,47],[23,53],[29,47],[35,53],[41,47],[46,52]],'g',2);
  [[22,34],[34,41],[26,45],[40,34],[18,44],[30,36]].forEach(([x,y])=>{g.ell(x,y,1.6,1.2,'W');g.s(x-1,y-1,'W');});
  g.line(24,30,20,48,'g');g.line(36,30,40,48,'g');
  // the staff with a hooked top and a drowned lantern
  bsh(g,[['t',[[51,57],[50,12]],1.6,1.6],['t',[[50,12],[48,6],[53,3],[56,7]],1.6,1.2]],ht);
  bsh(g,[['r',47,9,6,8]],ht);g.rect(48,10,4,6,'K');g.rect(48,11,4,4,B?'y':'x');g.s(49,12,'W');
  // a reaching hand with claws
  bsh(g,[['t',[[21,28],[13,32],[7,34]],3.8,2.6],['e',6,34,3,2.6]],cl);g.line(4,33,1,30,'W');g.line(4,35,1,37,'W');g.line(3,34,0,34,'W');
  // seaweed hair hanging under the brim, the long face
  bsh(g,[['t',[[22,18],[16,27],[18,42]],3.2,1],['t',[[38,18],[44,27],[41,42]],3.2,1]],kp);
  bsh(g,[['e',30,22,5.8,6.4],['p',[[26,25],[34,25],[31,31],[28,30]]]],sk);bsh(g,[['p',[[26,20],[22,27],[27,26]]]],sk);
  g.rect(28,27,4,1,'K');g.px([[28,28],[30,28]],'W');
  g.rect(25,20,3,2,'E');g.rect(32,20,3,2,'E');g.px([[25,20],[32,20]],'W');
  // the wide barnacled hat
  bsh(g,[['p',[[30,1],[40,13],[49,17],[11,17],[20,13]]],['e',30,17,20,3.4]],ht);g.rect(10,16,40,2,'n');g.line(11,18,49,18,'p');
  [[22,12],[32,8],[38,14],[26,5],[16,16],[44,16],[30,16]].forEach(([x,y])=>{g.ell(x,y,1.6,1.3,'W');g.s(x,y-1,'W');});
  g.px(B?[[3,18],[57,24],[8,8],[52,5]]:[[2,20],[58,22],[9,10],[53,7]],'x');
  return {pal:Object.assign({},bT4(kp,'#3e6a34',{cool:'#0a2018'}),bT4(cl,'#2e5668',{cool:'#08141e'}),bT4(sk,'#8cae9c',{cool:'#203a4a'}),bT4(ht,'#5a5a4c'),{n:'#1a2a20',g:'#1a303e',p:'#2a2a22',W:'#f4f0e0',x:'#6affd0',y:'#e8fff4',E:'#c890ff',K:'#0a1418',D:'#101c20'}),flat:'xyWEK',glow:'#5ad0b0',rim:'#0a1418'};
 },
 hollowsun(g,f){const F=mfr(f),B=F.b?1:0,fr='abcd',gl='efgh',sl='ijkl',cx=30,cy=28;
  g.ell(30,57,20,2.2,'D');
  // salt spikes at the foot
  bsh(g,[['k',8,57,6,45,6],['k',15,57,15,50,4.5],['k',23,58,22,53,3.4],['k',37,58,38,52,3.6],['k',45,57,45,48,4.6],['k',52,57,54,43,6]],sl);
  // the corona: twelve flame prongs, the ring itself a disc of fire
  const prongs=[];for(let i=0;i<12;i++){const a=i*Math.PI/6+.2,r1=(i%2?23:28)+(B&&i%2===0?1.5:0)+(B&&i%2?-1:0),dx=Math.cos(a),dy=Math.sin(a),px=-dy,py=dx;
    prongs.push(['p',[[cx+dx*15+px*3.6,cy+dy*15+py*3.6],[cx+dx*r1,cy+dy*r1],[cx+dx*15-px*3.6,cy+dy*15-py*3.6]]]);}
  bsh(g,prongs,fr,{bias:-.05});
  bsh(g,[['e',cx,cy,19.5,19.5]],fr,{cap:16});
  [0,1,2,3,4,5,6,7].forEach(i=>{const a=i*Math.PI/4+.4;g.line(cx+Math.cos(a)*14.5,cy+Math.sin(a)*14.5,cx+Math.cos(a+.2)*19,cy+Math.sin(a+.2)*19,'c');});
  // the hollow: black, with a bright lip on the lit side and a slit of light like a pupil
  g.ell(cx,cy,14.5,14.5,'K');for(let a=Math.PI*.7;a<Math.PI*1.45;a+=.05)g.s(Math.round(cx+Math.cos(a)*14.2),Math.round(cy+Math.sin(a)*14.2),'W');
  g.ell(cx+1,cy+1,11.5,11.5,'V');g.ell(cx+2,cy+2,10.5,10.5,'K');
  const h=B?10:8;g.poly([[cx,cy-h],[cx+2.4+B,cy],[cx,cy+h],[cx-2.4-B,cy]],'y');g.poly([[cx,cy-h+3],[cx+1,cy],[cx,cy+h-3],[cx-1,cy]],'W');
  // glass shards in orbit
  [[3,10,4],[56,8,3],[2,40,3],[57,38,4],[10,52,3],[50,52,3]].forEach(([x,y,r])=>bsh(g,[['p',[[x,y-r],[x+r*.6,y],[x,y+r*1.4],[x-r*.6,y]]]],gl));
  g.px(B?[[14,3],[46,2],[0,26],[59,22],[29,0]]:[[14,2],[46,3],[0,28],[59,24],[28,1]],'W');
  return {pal:Object.assign({},bT4(fr,'#ff8a2a',{cool:'#4a0a1a'}),bT4(gl,'#cfeaf0',{cool:'#304878'}),bT4(sl,'#f0e8e8',{cool:'#6a4a6a'}),{c:'#b8401a',V:'#5a1a3a',y:'#fff0a0',W:'#fff6d0',K:'#07030a',D:'#241410'}),flat:'yWKV',glow:'#ffb040',rim:'#1a0a0a'};
 },
 nidhra(g,f){const F=mfr(f),B=F.b?1:0,bd='abcd',wg='efgh',bl='ijkl',co='mnop',wb=B?2:0;
  // the eclipse behind her: a black disc in a gold corona
  bsh(g,[['e',24,23,22,22]],co);g.ell(24,23,17.5,17.5,'K');for(let a=0;a<6.28;a+=.16)g.px([[Math.round(24+Math.cos(a)*19.5),Math.round(23+Math.sin(a)*19.5)]],'y');
  g.ell(24,23,16,16,'D');
  g.ell(30,57,26,2.4,'D');
  // wings: the far one raised over the neck, the near one a vast sail over the eclipse
  bsh(g,[['p',[[34,36],[44,18],[48,6],[56,12],[55,22],[48,30]]]],wg);g.line(48,8,50,28,'f');g.line(46,14,40,32,'f');g.path([[34,36],[44,18],[48,6]],'x');
  bsh(g,[['p',[[30,36],[18,22],[8,8-wb],[4,22],[7,34],[13,42],[20,42]]]],wg);
  [[8,8-wb,5,24],[8,8-wb,10,36],[8,8-wb,16,44],[18,22,14,44]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'f'));
  g.path([[30,36],[18,22],[8,8-wb]],'x',1);g.px([[5,22],[7,34],[13,44]],'x');
  bsh(g,[['t',[[30,36],[18,22],[8,8-wb]],3.2,1.4]],bd);
  // tail, a long curl with a spade tip
  bsh(g,[['t',[[16,48],[9,53],[4,50],[3,43],[6,39]],4.4,1]],bd);bsh(g,[['p',[[6,39],[2,36],[6,33],[10,36]]]],wg);g.px([[6,36]],'x');
  // body: a crouched barrel of a chest rising into the neck; the ember belly
  const P=[[14,48],[24,45],[33,40],[39,33],[44,27],[47,21]],r=[3.6,8.6,9.4,7.4,5.4,4.4];
  bsh(g,[['t',P,r,0]],bd,{cap:10});bsh(g,[['t',[[22,48],[30,45],[36,39]],3.4,2.6]],bl);bbands(g,P,r,0,2.8,'c','bcd',1);
  g.path([[20,48],[27,45],[33,40]],'x');[[18,44],[26,40],[32,36],[36,30],[42,22]].forEach(([x,y])=>bsh(g,[['k',x,y,x-1,y-5,3.4]],wg));
  // legs: a forearm planted, claws splayed; the haunch behind
  bsh(g,[['t',[[38,42],[41,50],[41,55]],4.6,3],['t',[[22,48],[18,54],[14,56]],4.6,2.4]],bd);g.px([[38,56],[41,57],[44,56],[11,57],[14,58],[17,57]],'W');
  // the head: an armoured wedge, a swept pair of horns, one eye burning
  g.poly([[45,24],[56,24],[58,31],[48,31]],'K');
  bsh(g,[['p',[[42,20],[49,15],[56,17],[59,22],[57,25],[48,25],[44,27]]],['e',47,20,5,4.4]],bd);
  bsh(g,[['p',[[45,27],[53,28],[58,33],[53,35],[47,32]]]],bd);
  g.px([[49,25],[52,25],[55,25],[51,29],[54,31]],'W');g.rect(48,25,6,3,B?'y':'x');
  g.ell(46,19,2.4,2.2,'x');g.rect(45,18,2,2,'y');g.s(45,18,'W');
  bsh(g,[['t',[[43,16],[38,10],[31,8+B]],2.8,.8],['t',[[47,14],[44,7],[39,4+B]],2.4,.8]],bl);
  g.px(B?[[56,14],[58,42],[2,24],[30,6],[34,52]]:[[57,12],[57,40],[3,26],[28,4],[32,53]],'x');
  return {pal:Object.assign({},bT4(bd,'#38284e',{cool:'#0a0412'}),bT4(wg,'#8a4a9c',{cool:'#14061a'}),bT4(bl,'#9a5a4a',{cool:'#2a0a10'}),bT4(co,'#f6e7a8'),{x:'#ff5a2a',y:'#ffd04a',W:'#fff0d0',K:'#06030a',D:'#18101e'}),flat:'xyWK',glow:'#ff8a3a',rim:'#140a1e'};
 }
});
['brinehag','hollowsun','nidhra'].forEach(k=>{MEXTRA[k]=()=>{};});
Object.assign(MART,{
 hollowking(g,f){const F=mfr(f),B=F.b?1:0,rb='abcd',st='efgh',cp='ijkl',gd='mnop',bl='qrst';
  g.ell(30,57,22,2.4,'D');
  // the throne behind him: a tall pointed arch of violet stone, hollow, with two horns
  bsh(g,[['p',[[16,57],[14,40],[9,29],[14,16],[23,7],[30,2],[37,7],[46,16],[51,29],[46,40],[44,57]]],['k',10,30,5,14,5],['k',50,30,55,14,5],['k',23,9,19,3,4],['k',37,9,41,3,4]],bl,{cap:16});
  g.poly([[19,57],[18,32],[21,21],[30,12],[39,21],[42,32],[41,57]],'K');
  g.line(11,30,13,38,'t');g.line(14,26,19,14,'t');g.line(23,9,30,4,'t');g.line(18,50,18,34,'r');
    // a torn crimson cloak around the shoulders and down to the floor
  bsh(g,[['p',[[19,24],[41,24],[47,56],[42,52],[39,57],[34,53],[26,57],[21,53],[17,57],[13,56]]]],cp,{cap:14});
  [[22,28,16,54],[38,28,44,54],[30,34,30,54]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'k'));
  // empty armour: greaves and sabatons, a cuirass with nothing inside
  bsh(g,[['r',22,40,7,15],['r',31,40,7,15],['p',[[20,54],[29,54],[29,58],[19,58]]],['p',[[31,54],[40,54],[41,58],[31,58]]]],st);
  g.rect(22,44,7,2,'g');g.rect(31,44,7,2,'g');g.rect(22,40,7,1,'h');g.rect(31,40,7,1,'h');
  bsh(g,[['p',[[19,23],[41,23],[39,40],[21,40]]]],st);g.rect(19,23,22,3,'e');g.rect(21,37,18,3,'g');
  g.poly([[26,27],[34,27],[36,36],[24,36]],'K');g.px([[28,30],[31,33],[29,34],[32,29]],'Z');g.line(24,40,36,40,'n');
  // pauldrons with spikes
  bsh(g,[['e',16,24,6.4,5],['e',44,24,6.4,5],['k',13,20,9,11,4],['k',47,20,51,11,4],['k',16,19,15,12,3.4],['k',44,19,45,12,3.4]],st);
  // the greatsword planted point down, both hands on the pommel
  bsh(g,[['r',28.5,34,3,23],['p',[[28.5,57],[31.5,57],[30,59]]]],gd.replace(/./g,m=>m));
  bsh(g,[['r',22,32,16,3],['r',29,24,2,8],['e',30,23,2.4,2.4]],gd);g.rect(29,36,1,20,'o');
  bsh(g,[['t',[[20,26],[20,34],[28,29]],4,3],['t',[[40,26],[40,34],[32,29]],4,3]],st);g.px([[28,28],[32,28]],'g');
  // the helm: an empty bucket with a cross visor, two small embers, a crown hung above it
  bsh(g,[['e',30,16,7.4,8],['r',23,16,14,6]],st);g.rect(24,15,12,2,'K');g.rect(29,15,2,6,'K');g.rect(25,15,2,2,'Z');g.rect(33,15,2,2,'Z');g.rect(23,22,14,1,'g');
  const cy=3+B*-0;bsh(g,[['r',23,5+B,14,3],['k',24,5+B,22,1+B,4],['k',27,5+B,27,0.5+B,4],['k',30,5+B,30,0+B,4],['k',33,5+B,33,0.5+B,4],['k',36,5+B,38,1+B,4]],gd);g.rect(23,6+B,14,1,'o');g.px([[27,6+B],[30,6+B],[33,6+B]],'Z');
  g.px(B?[[3,10],[56,50],[4,22],[57,36]]:[[2,12],[57,48],[3,24],[56,38]],'Z');
  return {pal:Object.assign({},bT4(rb,'#3a3a4a'),bT4(st,'#72778e',{cool:'#0a0a18'}),bT4(cp,'#6a1a2e',{cool:'#14040a'}),bT4(gd,'#d0a850'),bT4(bl,'#4a3e62',{cool:'#08060c'}),{s:'#241c34',t:'#8a7aa8',r:'#2a2040',n:'#c8a050',o:'#fff0b0',Z:'#f2c93a',K:'#05030a',D:'#140e18'}),flat:'ZnoK',rim:'#0a0610'};
 },
 seraph(g,f){const F=mfr(f),B=F.b?1:0,wu='abcd',wm='efgh',wl='ijkl',rb='mnop',sk='qrst',m=x=>60-x,wb=B?2:0;
  g.ell(30,57,18,2.4,'D');
  // six wings of cinder: the top pair flung up, the middle pair spread, the lowest folded under
  [1,-1].forEach(sd=>{const X=x=>sd>0?x:m(x);
    bsh(g,[['p',[[X(26),34],[X(7),44],[X(12),48],[X(10),54],[X(21),44]]]],wl);
    bsh(g,[['p',[[X(26),28],[X(1),24+wb],[X(5),32],[X(2),38],[X(15),35]]]],wm);
    bsh(g,[['p',[[X(26),24],[X(3),3-wb],[X(7),14],[X(1),19],[X(12),23]]]],wu);
    [[X(26),24,X(3),3-wb],[X(26),28,X(1),24+wb]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'c'));
    g.px([[X(3),3-wb],[X(1),24+wb],[X(7),44],[X(2),38],[X(1),19]],'x');g.path([[X(7),14],[X(1),19],[X(12),23]],'x');});
  // the gown: ash white, belted in gold, the hem burnt to embers
  bsh(g,[['p',[[24,23],[36,23],[42,56],[18,56]]]],rb);bsh(g,[['p',[[28,26],[32,26],[34,56],[26,56]]]],rb,{bias:.1});
  g.rect(22,34,16,2,'G');g.line(30,36,30,56,'m');g.px([[20,54],[25,56],[34,55],[40,54],[22,50],[38,50]],'x');
  // one arm lifts the lamplighter's pole with a burning lamp; the other opens, palm out
  g.line(47,58,47,8,'G');g.line(48,12,48,56,'g');bsh(g,[['r',44,5,7,6],['p',[[43,5],[51,5],[47,2]]]],wl);g.rect(45,6,5,4,'K');g.ell(47.5,8,1.8,2.6+B*.4,'x');g.s(47,8,'y');
  bsh(g,[['t',[[35,26],[42,26],[46,19],[47,14]],3.2,2.2],['t',[[25,26],[19,31],[15,29]],3.2,2.2]],sk);bsh(g,[['e',47,12,2.4,2.4],['e',13,28,2.4,2.4]],sk);
  // the face under a ring of fire, ash hair swept back
  bsh(g,[['e',29,11,8.4,8],['p',[[22,12],[18,28],[24,20]]],['p',[[38,12],[42,28],[36,20]]]],wl);
  bsh(g,[['e',30,16,6,7]],sk);g.rect(26,15,3,2,'E');g.rect(32,15,3,2,'E');g.px([[26,15],[32,15]],'y');g.line(29,20,32,20,'j');
  g.ell(30,5.5,10,3.2,'x');g.ell(30,5.5,7.6,1.8,0);g.ell(30,5.5,10,3.2,'x');g.ell(30,5.5,7.6,1.8,0);g.line(22,5,38,5,'y');
  g.px(B?[[4,28],[56,36],[8,50],[52,52],[16,2],[44,3]]:[[3,30],[57,34],[10,52],[50,54],[14,3],[46,2]],'x');
  return {pal:Object.assign({},bT4(wu,'#8a7a78',{cool:'#2a1018'}),bT4(wm,'#5e4e52',{cool:'#1a0a10'}),bT4(wl,'#3a3036',{cool:'#100408'}),bT4(rb,'#e8dcc4',{cool:'#4a2a30'}),bT4(sk,'#e8c8b0',{cool:'#6a3a40'}),{G:'#f0c050',g:'#a07a28',c:'#c8604a',x:'#ff7a2a',y:'#fff2b0',E:'#ff8a2a',K:'#14080a',D:'#2a1e14'}),flat:'xyEK',glow:'#ffcf70',rim:'#1a0c0c'};
 }
});
function rkArt(g,core,f){const F=mfr(f),B=F.b?1:0,rb='abcd',hd='efgh',gd='ijkl';
  g.ell(30,57,19,2.6,'D');
  // robe: flares from the shoulders to the hem, woven with threads of rift light
  bsh(g,[['p',[[21,21],[39,21],[47,56],[13,56]]]],rb,{cap:14});
  for(let i=0;i<5;i++){const y=26+i*6;g.line(21-i*1.6,y+4,38+i*1.6,y-2,'w');}
  for(let i=0;i<4;i++){const y=30+i*6;g.line(38+i*1.7,y+4,22-i*1.7,y-1,'v');}
  g.px([[15,57],[19,58],[24,57],[29,58],[34,57],[39,58],[44,57]],'W');
  // belt, the keys on it
  g.rect(19,43,22,2,'B');g.rect(29,43,2,2,'N');
  [[20,45],[23,45],[37,45],[40,45]].forEach(([x,y])=>{bsh(g,[['r',x,y,2,6]],gd);g.s(x,y+7,'j');g.s(x+2,y+4,'k');});
  // mantle and arms
  bsh(g,[['e',30,23,12,4],['r',19,23,22,3]],hd);
  bsh(g,[['t',[[20,24],[14,32],[12,39]],4,3],['t',[[40,24],[45,29],[47,25]],4,3]],hd);
  bsh(g,[['e',12,41,3,3]],'FFFF');
  // the ring of keys
  bsh(g,[['e',10,47,4.8,4.8]],gd);g.ell(10,47,2.4,2.4,0);
  [[7,52],[10,53],[13,52]].forEach(([x,y])=>{bsh(g,[['r',x,y,2,5]],gd);g.s(x+2,y+3,'j');});
  // the giant key: bow, shaft and a bit with teeth
  bsh(g,[['e',49.5,7,5.2,5.2],['r',48,11,3,45],['r',51,14,5,2],['r',51,18,3,2],['r',51,22,5,2],['r',46,52,7,4]],gd);g.ell(49.5,7,2.4,2.4,0);g.px([[45,5],[46,3]],'S');
  g.ell(49.5,27,3.2,3.2,'F');
  // the hood: a tall peak over a dark face with two narrow eyes
  bsh(g,[['p',[[30,1],[38,12],[41,23],[19,23],[22,12]]]],hd);
  g.ell(30,15,5.2,6.5,'K');g.rect(27,13,2,2,'E');g.rect(32,13,2,2,'E');g.s(27,13,'W');g.s(32,13,'W');
  g.px(B?[[41,16],[42,20],[18,17],[17,23],[30,0]]:[[41,15],[42,19],[18,18],[17,22],[30,0]],'W');
  // the lantern cage: gold frame, a glass of dark, the flame in the element's colour
  g.rect(29,26,2,3,'G');bsh(g,[['p',[[25,29],[35,29],[34,27],[26,27]]],['r',25,29,10,14]],gd);g.rect(26,30,8,11,'K');
  g.ell(30,35.5,3.2+B*.4,3.8+B*.4,'C');g.ell(30,35.5,1.4,1.8,'c');g.rect(28,30,1,11,'j');g.rect(32,30,1,11,'j');g.rect(25,35,10,1,'k');
  // two doors drifting beside it
  [[4,4],[52,36]].forEach(([x,y],i)=>{const h=i?7:9;bsh(g,[['p',[[x,y+h],[x,y+2],[x+2,y],[x+6,y],[x+8,y+2],[x+8,y+h]]]],gd);g.poly([[x+2,y+h],[x+2,y+3],[x+3.5,y+2],[x+4.5,y+2],[x+6,y+3],[x+6,y+h]],'c');g.rect(x+3,y+4,2,h-4,'C');});
  g.px([[3,17],[14,2],[56,34],[58,46],[55,3]],'W');
  return {pal:Object.assign({},bT4(rb,'#34306a',{cool:'#0a0620'}),bT4(hd,'#463e8c',{cool:'#0a0620'}),bT4(gd,'#d8b866',{cool:'#3a2a10'}),{K:'#06030e',E:'#eef6ff',C:core,c:mix(core,'#ffffff',.55),G:'#d4b464',S:'#fff0b8',W:'#a9e6ff',w:'#7ab0e0',v:'#5a7ec8',F:'#9a92c4',B:'#6a5230',N:'#d4b464',D:'#0c0816'}),flat:'KECcWG',glow:core,rim:'#0a0618'};}
['hollowking','seraph'].forEach(k=>{MEXTRA[k]=()=>{};});
// BOSSART-A-END
// ===== v0.12.6: the frame API for guardians and bosses: a 2-frame idle =====
// bossHasIdle(u): a foe that is a 60x60 guardian (BIG_ART, summons keep the '~s' suffix) or a boss. bossIdle(c,seed,now): frame 0 is the sprite
// itself, frame 1 an exhale (the upper body one pixel lower) with a soft brightening, baked once per sprite (silhouette unchanged except the
// breath). The frames alternate every 760 ms (battle, drawUnit) and 840 ms (the Sanctum guardian on the map, through imgOf 'mapboss:' keys).
// Nothing changes under reduced motion.
const BIDLE=new WeakMap();
function bigArtOn(art){try{return typeof BIG_ART!=='undefined'&&BIG_ART.includes(String(art||'').replace(/~s$/,''));}catch(e){return false;}}
function bossHasIdle(u){return !!u&&u.side!=='p'&&!!(u.boss||bigArtOn(u.art));}
// v0.14.1: the boss sprites (the BOSSART block above) draw their own frame B (the crown, maw, core, wings or flame moves: mfr(f).b). monFramed remembers
// which art a boss canvas came from, and bossFrame1 starts from that frame B and then adds the same exhale and glow; any other canvas gets the plain exhale.
const BART=new WeakMap();
{const mf0=monFramed;monFramed=function(art,f,make){const c=mf0.apply(this,arguments);try{if(c&&!(f&&(f.t==='atk'||f.t==='hit'||f.i))&&bigArtOn(art))BART.set(c,art);}catch(e){}return c;};}
function bossFrameSrc(c){const a=BART.get(c);if(a&&MART[a]){try{const s=monCanvas(a,{t:'idle',i:1});if(s&&s!==c&&s.width===c.width&&s.height===c.height)return s;}catch(e){}}return c;}
function bossFrame1(c){let f=BIDLE.get(c);if(f)return f;const w=c.width,h=c.height,cut=Math.floor(h*.55),src=bossFrameSrc(c);
  f=c.hd?hdCv(w,h,c.hd):mkCv(w,h);const x=f.getContext('2d');x.imageSmoothingEnabled=false;
  x.drawImage(src,0,cut,w,h-cut,0,cut,w,h-cut);x.drawImage(src,0,0,w,cut,0,1,w,cut);
  x.globalCompositeOperation='source-atop';x.globalAlpha=.08;x.fillStyle='#fff2d0';/* v0.17.9: .2 lifted the whole sprite and its outline by about 30 luma every 760 ms (a flash, washed out frame 1); .08 is the soft glow */x.fillRect(0,0,w,h);BIDLE.set(c,f);return f;}
function bossIdle(c,seed,now,ms){if(typeof gfxStill==='function'&&gfxStill())return c;return Math.floor(now/(ms||760)+(seed||0)*.5)%2?bossFrame1(c):c;}
{const io0=imgOf;imgOf=function(key,fn){const c=io0.apply(this,arguments);try{if(typeof key==='string'&&key.charCodeAt(0)===109&&key.startsWith('mapboss:'))return bossIdle(c,0,performance.now(),840);}catch(e){}return c;};}
// ===== v0.12.13: the Riftkeeper, the ultimate boss (60x60; foes.js RIFTKEEPER, riftkeeper9.js) =====
// A tall hooded keeper: a peaked hood over a robe woven of rift light, a lantern cage at the chest, keys at the belt and on a ring in one
// hand, a giant key for a staff in the other, and two small doors drifting beside it. Silhouette: a narrow spire (hood and staff) over a
// wide mantle, flaring to the hem. The lantern core is the one flat accent colour: the battle swaps the sprite for riftkeeper_<element>
// so the flame shows the element it burns this turn (riftkeeper9.js). Idle: the shared 2 frame bossIdle (an exhale and a soft glow) applies
// to every boss sprite; the telegraph pose is the existing swell (anim.js bossTele).
// (rkArt, the Riftkeeper drawing, lives in the BOSSART block at the top of this file; MART.riftkeeper and the riftkeeper_<element> lantern swaps below use it)
MART.riftkeeper=g=>rkArt(g,'#c9a8ff');
BIG_ART.push('riftkeeper');
ELK.forEach(el=>{MART['riftkeeper_'+el]=g=>rkArt(g,ELC[el]);BIG_ART.push('riftkeeper_'+el);});
MEXTRA.riftkeeper=(g,p)=>{};
// ===== v0.13.7: four new Scourges and the fifth Calamity (60x60; foes.js, bosses9.js) =====
// Silhouettes, each its own: the Locust Choir is a pillar of insects (a tall hourglass cloud around one great singing locust), Ironmaw
// Tortoise a wide iron-plated dome with a heavy jaw low on the left, the Candleking Moth a pair of huge dusty wings under a crown of
// three burning tapers, the Brinehag Matriarch a hunched hag under a wide barnacled hat rising from a mound of kelp and net, and the
// Hollow Sun a ring of fire around a black hollow, with glass shards in orbit and salt spikes below. Idle is the shared bossIdle.
// (the five sprites of this release are drawn in the BOSSART block at the top of this file)
['locustchoir','ironmaw','candlemoth','brinehag','hollowsun'].forEach(k=>{BIG_ART.push(k);});
// v0.14.x: the four Scourges added after the Hollow Sun (bosses10.js). Silhouettes: the Hollow Shepherd a tall hooded robe with a crook and a lit
// lantern (the tell) and two lambs at its hem; the Pale Weaver a spider hanging on a thread, legs fanned wide; the Crow Regent a huge crow in
// profile on a bone perch with one wing mantled; the Geyser Matron a kettle-bellied jelly with three smoking chimneys. Idle is the shared bossIdle.
Object.assign(MART,{
 hollowshepherd(g){
  g.ell(30,57,24,3,'D');
  // two lambs of moss and wool at its hem
  g.ell(9,51,6,4.5,'W');g.ell(8,49,3,2,'V');g.ell(3,52,2.6,2.4,'K');g.s(2,51,'E');g.rect(6,54,2,3,'K');g.rect(11,54,2,3,'K');g.px([[5,48],[9,47],[12,50]],'V');
  g.ell(51,54,5,3.6,'W');g.ell(55,55,2.2,2,'K');g.s(56,54,'E');g.rect(48,56,2,2,'K');g.rect(52,56,2,2,'K');
  // the robe: a tall wet bell of moss, lit on the left, hem knotted with roots
  g.poly([[22,16],[38,16],[47,53],[13,53]],'M');g.poly([[22,16],[28,16],[21,53],[13,53]],'L');g.poly([[38,16],[41,22],[47,53],[40,53]],'m');
  for(let i=0;i<5;i++)g.line(22+i*4,24+i,20+i*6,52,'m');
  for(let i=0;i<8;i++)g.path([[15+i*4.3,51],[13+i*4.6,57]],'R',2);g.rect(14,49,32,2,'r');
  g.px([[24,30],[34,36],[28,44],[40,42],[19,40],[31,26]],'L');
  // the wool scarf
  g.ell(30,19,11,3.4,'W');g.ell(27,18,5,1.6,'V');g.px([[22,21],[27,22],[33,22],[38,21]],'w');
  // arms: the left holds a brass bell, the right the crook
  g.path([[22,22],[14,29],[12,34]],'M',4);g.ell(12,35,2.6,2.6,'R');g.poly([[8,37],[16,37],[17,44],[7,44]],'B');g.rect(7,43,11,2,'N');g.rect(11,45,2,2,'K');g.px([[9,39],[9,41]],'Y');
  g.path([[38,22],[44,28],[47,31]],'M',4);g.ell(47,31,2.6,2.6,'R');
  g.line(47,56,47,9,'R',2);g.line(46,56,46,10,'r');g.path([[47,9],[47,4],[52,2],[56,6]],'R',2);
  // the lantern on the hook: the tell
  g.rect(53,7,6,9,'N');g.rect(54,8,4,7,'Y');g.rect(55,9,2,4,'W');g.rect(52,6,8,2,'N');g.rect(55,15,2,2,'N');
  // the hood and the hollow under it, a crown of twigs
  g.poly([[20,17],[23,7],[30,2],[37,7],[40,17]],'M');g.poly([[20,17],[23,7],[28,4],[26,12],[24,17]],'L');
  g.ell(30,13,6,7,'K');g.rect(26,11,2,3,'E');g.rect(33,11,2,3,'E');g.s(26,11,'W');g.s(33,11,'W');g.rect(28,18,4,1,'m');
  g.path([[25,5],[21,1],[18,2]],'R',1);g.path([[35,5],[39,1],[42,2]],'R',1);g.path([[30,3],[30,0]],'R',1);g.px([[21,0],[40,0],[18,3],[43,3]],'L');
  g.px([[4,38],[56,40],[2,26],[58,22],[14,6]],'Y');
  return {pal:{M:'#5a7a3a',m:'#3a5228',L:'#8aa85a',R:'#6a4a2a',r:'#4a3220',K:'#0e0a14',E:'#fff0a0',Y:'#ffe27a',W:'#ece8d4',w:'#a8a490',V:'#c8c8b4',B:'#c8a85a',N:'#6a5230',D:'#1a2414'},flat:'EYK',glow:'#ffe08a',rim:'#10180c'};
 },
 paleweaver(g){
  g.ell(30,58,14,2,'D');
  // the thread it hangs from and corner webs
  g.line(30,0,30,19,'V');g.path([[0,0],[14,10],[24,12]],'V');g.path([[0,8],[10,12]],'V');g.path([[60,0],[46,10],[36,12]],'V');g.path([[60,8],[50,12]],'V');
  g.path([[0,2],[3,12],[8,20]],'V');g.path([[59,2],[56,12],[52,20]],'V');
  // eight jointed legs, four a side, fanned wide
  [[[25,23],[16,7],[6,9],[3,24]],[[24,26],[10,18],[3,29],[4,45]],[[24,29],[9,33],[4,45],[6,57]],[[26,33],[16,44],[11,52],[14,59]]].forEach(L=>{
    g.path(L,'F',2);g.path(L.map(([x,y])=>[60-x,y]),'F',2);
    L.slice(1,3).forEach(([x,y])=>{g.s(x,y,'W');g.s(60-x,y,'W');});g.s(L[3][0],L[3][1],'f');g.s(60-L[3][0],L[3][1],'f');});
  // the abdomen hanging below, a hoarfrost body marked with a bolt
  g.ell(30,40,12,14,'B');g.ell(25,34,6,8,'W');g.ell(30,40,12,14,'B');g.ell(26,35,6,8,'W');g.poly([[36,30],[40,40],[36,50],[32,52],[38,40]],'b');
  g.path([[31,28],[27,35],[33,39],[28,47],[31,52]],'Y',2);
  // cephalothorax, a cluster of eyes and two fangs
  g.ell(30,24,8,6.5,'F');g.ell(27,22,4,3,'W');
  g.rect(26,20,2,2,'E');g.rect(32,20,2,2,'E');g.rect(29,19,2,2,'E');g.s(27,24,'E');g.s(32,24,'E');g.s(24,22,'E');g.s(35,22,'E');
  g.poly([[26,28],[27,34],[29,28]],'N');g.poly([[31,28],[33,34],[34,28]],'N');
  g.px([[16,36],[44,34],[8,50],[52,48],[30,2]],'Y');
  return {pal:{F:'#aebfd8',f:'#6a7a98',W:'#eaf2ff',B:'#8a9cc0',b:'#5a6a90',V:'#d8e8ff',Y:'#ffe94a',E:'#ff4a6a',N:'#2a2a40',D:'#1a1e2c'},flat:'EYN',glow:'#bfe0ff',rim:'#141a2a'};
 },
 crowregent(g){
  g.ell(30,58,22,2,'D');
  // the bone perch with knuckle ends
  g.rect(5,50,50,3,'P');g.rect(5,50,50,1,'p');g.ell(5,51,3.4,3.4,'P');g.ell(55,51,3.4,3.4,'P');g.rect(28,53,4,5,'P');g.rect(24,57,12,2,'P');
  // tail and the folded wing at the back, ragged flight feathers
  g.poly([[40,44],[46,58],[42,59],[38,50]],'a');g.poly([[44,42],[52,57],[48,58],[41,48]],'A');
  g.poly([[36,20],[50,24],[58,40],[56,52],[50,48],[48,54],[43,46],[40,50],[38,36]],'A');
  g.poly([[40,24],[50,27],[56,38],[50,36],[44,40]],'L');
  for(let i=0;i<4;i++)g.line(42+i*3,30+i*2,46+i*3,50-i,'a');
  // the near wing mantled up and out on the left
  g.poly([[26,26],[14,14],[3,12],[6,20],[1,26],[8,28],[6,34],[16,34],[22,38]],'A');g.poly([[26,26],[14,14],[8,14],[18,26]],'L');
  g.line(24,28,6,16,'a');g.line(22,31,4,26,'a');g.line(20,34,8,32,'a');
  // the body: a deep chest, a pale breast feather patch, talons on the bar
  g.ell(31,37,12,14,'A');g.ell(26,32,6,8,'L');g.poly([[24,36],[28,48],[34,46],[30,34]],'a');
  g.path([[28,48],[28,52]],'Q',2);g.path([[35,47],[36,52]],'Q',2);g.line(24,51,31,51,'Q',2);g.line(33,51,40,51,'Q',2);
  // the head: heavy, with a hooked beak and a bone crown
  g.ell(22,20,9,8,'A');g.ell(19,17,4.5,3.4,'L');g.poly([[14,17],[1,22],[14,26]],'Q');g.poly([[14,24],[3,24],[14,27]],'q');g.line(2,22,13,19,'W');
  g.ell(20,19,2.6,2.6,'E');g.s(19,18,'W');g.s(21,20,'K');
  g.poly([[14,11],[15,2],[19,10]],'C');g.poly([[19,10],[22,0],[26,10]],'C');g.poly([[26,10],[30,3],[31,12]],'C');g.rect(14,10,18,2,'C');g.px([[22,2],[15,4],[30,5]],'W');
  // the murder: small crows around it
  [[6,5],[52,5],[56,18],[8,42],[48,10]].forEach(([x,y])=>g.px([[x-2,y-1],[x-1,y],[x,y+1],[x+1,y],[x+2,y-1]],'A'));
  g.px([[3,2],[57,2],[1,36],[58,30]],'E');
  return {pal:{A:'#34344c',a:'#1c1c2c',L:'#5a5a7c',Q:'#d0b878',q:'#8a7848',E:'#ff4a4a',K:'#0a0a12',W:'#f4eed8',C:'#e8e0c8',P:'#8a7a60',p:'#b0a080',D:'#12121c'},flat:'EKW',glow:'#8a8ac0',rim:'#0a0a14'};
 },
 geysermatron(g){
  g.ell(30,57,25,3,'D');
  // the hot pool she sits in, ringed with stones
  g.ell(30,52,27,7,'T');g.ell(26,50,16,3,'B');[[4,52],[10,57],[50,57],[56,52],[22,58],[38,58]].forEach(([x,y])=>{g.ell(x,y,3.4,2.4,'S');g.s(x-1,y-1,'s');});
  // the body: a kettle-bellied dome of orange glass lit from the upper left, with a glowing core
  g.rect(8,34,44,16,'J');g.ell(30,34,22,19,'J');g.ell(30,34,22,19,'J');g.poly([[8,40],[52,40],[50,52],[10,52]],'j');
  g.ell(24,28,12,10,'H');g.ell(30,38,13,11,'G');g.ell(28,36,8,7,'Y');
  [[17,38],[44,32],[40,46],[14,46],[34,24]].forEach(([x,y])=>{g.ell(x,y,2.4,2.4,'B');g.s(x-1,y-1,'W');});
  // three chimneys on top, venting steam
  [[13,10,6,13],[27,3,6,19],[41,10,6,13]].forEach(([x,y,w,h])=>{g.rect(x,y,w,h,'S');g.rect(x,y,2,h,'U');g.rect(x-1,y-1,w+2,2,'s');});
  [[16,6,3],[13,2,2.4],[31,0,3.4],[44,6,3],[47,2,2.4]].forEach(([x,y,r])=>g.ell(x,y,r,r*.8,'W'));
  // the face: two round eyes and a wide mouth full of bubbles
  g.ell(23,33,4,4.5,'W');g.ell(24,34,1.8,2.4,'K');g.ell(37,33,4,4.5,'W');g.ell(38,34,1.8,2.4,'K');
  g.rect(22,43,17,3,'K');g.px([[24,43],[28,43],[32,43],[36,43]],'W');
  // pseudopod arms and a dripping skirt
  g.path([[9,40],[3,44],[2,51]],'J',5);g.ell(2,51,3.4,3,'J');g.path([[51,40],[57,44],[58,51]],'J',5);g.ell(58,51,3.4,3,'J');
  for(let i=0;i<6;i++)g.path([[13+i*7,50],[13+i*7,56]],'j',3);
  g.px([[2,24],[58,26],[4,10],[56,12],[30,1]],'W');
  return {pal:{J:'#e0803a',j:'#a8481a',H:'#ffc890',G:'#ffb040',Y:'#fff0a0',B:'#bfe8f0',W:'#f4fcff',K:'#1a0a0a',T:'#3a9ab0',S:'#8a8a96',s:'#4a4a58',U:'#b4b4c0',D:'#201410'},flat:'GYKW',glow:'#ffb060',rim:'#1a0a08'};
 }
});
['hollowshepherd','paleweaver','crowregent','geysermatron'].forEach(k=>{BIG_ART.push(k);});
