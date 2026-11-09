// ===== heropose9.js: hero pose frames for the battle stage =====
// Heroes used to slide (anim.js animPose offsets) with one fixed sprite. Here every hero gets real pose frames: swing, thrust, smash, shoot, cast,
// pray, guard, cheer, hit (2-frame cycles: frame 0 wind-up, frame 1 release; hit has one) and an idle B frame (docs/art-style.md, Animation).
// HOW IT IS BUILT. heroGridSide() already gives the finished side grid (race, flair, accessories, body size, HD stretch). For a pose we ask it for the
// same hero with NO weapon and with the arm and hand replaced by marker keys ('#' at the arm's origin, '!' for the hand rect). The markers survive
// every later pass (toTall, applySize, stretchHero) so they give the shoulder joint and the rest hand in final coordinates, whatever the body size.
// We erase them, bend the body (lean, crouch, head down: whole rows shift), then draw the sleeve, hands and the weapon at the pose's angle ourselves.
// Weapons are drawn from small local-coordinate recipes (u along the weapon, v across), so one recipe serves every angle.
// Painting goes through heroCanvas(), so the HD painter, legends mounts and pets are all honoured. Walkers, portraits and the sheet never call this.
const HPO={list:['swing','thrust','smash','shoot','cast','pray','guard','cheer','hit'],n:0};
let HPW=null;// {pose,frame,walk} read once by the heroGridSide wrapper below
// ---------- pixel helpers (corner-space points: cell i spans [i,i+1)) ----------
function hpStamp(g,x,y,k,t){
  if(t>=2){const x0=Math.round(x)-1,y0=Math.round(y)-1;for(let j=0;j<2;j++)for(let i=0;i<2;i++)hpPut(g,x0+i,y0+j,k);}
  else hpPut(g,Math.floor(x),Math.floor(y),k);
}
function hpPut(g,x,y,k,soft){if(x<0||y<0||x>=g.w||y>=g.h)return;const i=y*g.w+x;if(soft&&g.a[i])return;g.a[i]=k;}
function hpLine(g,a,b,k,t){const n=Math.ceil(Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]),1)*2);for(let i=0;i<=n;i++)hpStamp(g,a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,k,t||1);}
function hpRows(g,fromY,toY,dx){// shift rows fromY..toY sideways
  for(let y=fromY;y<=toY&&y<g.h;y++){if(y<0)continue;const r=g.a.slice(y*g.w,(y+1)*g.w);for(let x=0;x<g.w;x++){const sx=x-dx;g.a[y*g.w+x]=sx>=0&&sx<g.w?r[sx]:0;}}
}
function hpDropTop(g,y1){// move rows 0..y1 down one pixel; the row below only takes non-empty pixels (the head sinks into the shoulders)
  for(let y=y1+1;y>=1;y--)for(let x=0;x<g.w;x++){const s=g.a[(y-1)*g.w+x];if(y===y1+1){if(s)g.a[y*g.w+x]=s;}else g.a[y*g.w+x]=s;}
  for(let x=0;x<g.w;x++)g.a[x]=0;
}
// ---------- weapon recipes: u runs along the weapon from the grip, v across it (v>0 is the cutting or front side) ----------
const HPWD={
 sword(d){d.bar(1,13,0,2,'M');d.bar(2,12,-0.6,1,'c');d.dot(14,-0.5,'M');d.cross(1,-3,3,'G');d.dot(-2,0,'G');},
 greatsword(d){d.bar(1,17,0,2,'M');d.bar(2,16,-0.6,1,'c');d.bar(1,16,1,1,'M');d.bar(3,15,0,1,'N');d.dot(18,0,'M');d.cross(1,-4,4,'G');d.dot(-2,0,'G');},
 katana(d){d.bar(1,15,0,1,'M');d.bar(2,14,1,1,'c');d.cross(1,-2,2,'G');d.bar(-3,1,0,1,'K');},
 dagger(d){d.bar(1,6,0,2,'M');d.bar(2,5,-0.6,1,'c');d.cross(1,-2,2,'G');},
 axe(d){d.bar(-4,13,0,1,'W');d.poly([[8,0],[8,6],[12,7],[13,3],[12,0]],'M');d.bar(12,13,3,1,'N');d.bar(10,12,6.5,1,'c');d.poly([[9,0],[9,-3],[7,0]],'N');},
 hammer(d){d.bar(-5,12,0,1,'W');d.poly([[9,-4],[9,4],[15,4],[15,-4]],'M');d.cross(10,-4,4,'G');d.cross(14,-4,4,'N');},
 mace(d){d.bar(-4,9,0,1,'W');d.orb(11.5,0,3,'M');d.dot(11.5,-4,'N');d.dot(11.5,4,'N');d.dot(15.5,0,'N');d.cross(9,-2,2,'G');},
 spear(d){d.bar(-9,16,0,1,'W');d.poly([[16,-1.5],[21,0],[16,1.5]],'M');d.bar(16,19,0,1,'M');d.dot(14,1,'J');d.dot(13,2,'J');},
 trident(d){d.bar(-9,16,0,1,'W');d.cross(14,-3,3,'G');d.bar(14,19,-3,1,'M');d.bar(14,20,0,1,'M');d.bar(14,19,3,1,'M');},
 scythe(d){d.bar(-8,15,0,1,'W');d.ln(15,0,16,4,'M',2);d.ln(16,4,12,8,'M',2);d.ln(12,8,7,9,'M',1);},
 staff(d,w){d.bar(-11,13,0,1,w==='staff_sun'?'G':'W');
   if(w==='staff_crook'){d.ln(13,0,15,0,'W',1);d.ln(15,0,16,2,'W',1);d.ln(16,2,14,4,'W',1);d.dot(14,2,'C');}
   else if(w==='staff_crystal'){d.poly([[13,0],[16,-2],[20,0],[16,2]],'C');d.dot(13,-2,'G');d.dot(13,2,'G');}
   else if(w==='staff_sun'){d.orb(15.5,0,3,'G');d.orb(15.5,0,1.5,'C');d.dot(20,0,'G');d.dot(15.5,-5,'G');d.dot(15.5,5,'G');}
   else{d.orb(15.5,0,2.5,'C');d.dot(13,-2,'G');d.dot(13,2,'G');}},
 rod(d){d.bar(-1,7,0,1,'G');d.orb(9.5,0,2,'C');d.cross(7,-1,1,'G');},
 tome(d){d.poly([[0,-3],[0,3],[7,3],[7,-3]],'J');d.poly([[1,-2],[1,2],[6,2],[6,-2]],'w');d.bar(1,6,0,1,'L');},
 grimoire(d){d.poly([[0,-4],[0,4],[9,4],[9,-4]],'J');d.poly([[1,-3],[1,3],[8,3],[8,-3]],'w');d.bar(1,8,0,1,'J');d.dot(0,-4,'G');d.dot(8,-4,'G');d.dot(0,3,'G');d.dot(8,3,'G');d.dot(3,-2,'C');d.dot(5,2,'C');},
 lute(d){d.bar(0,10,0,1,'W');d.dot(11,0,'L');d.orb(-3,0,3.6,'L');d.dot(-3,0,'K');},
 harp(d){d.ln(-1,-9,4,-9,'G',1);d.ln(4,-9,5,-4,'G',1);d.ln(5,-4,4,4,'G',1);d.ln(4,4,0,8,'G',1);d.ln(-1,-9,-1,8,'G',1);d.ln(1,-8,1,6,'w',1);d.ln(3,-7,3,3,'w',1);},
 fan(d){for(let a=-60;a<=60;a+=15){const r=a*Math.PI/180;d.ln(0,0,Math.cos(r)*8,Math.sin(r)*8,a%30?'Q':'G',1);}d.ln(0,0,8,-6,'Q',1);},
 fists(d){d.cross(1,-1,1,'G');},
 claws(d){d.ln(1,-2,6,-3,'M',1);d.ln(1,0,7,0,'M',1);d.ln(1,2,6,3,'M',1);},
 bow(d,w,o){const L=w==='longbow'?11:9;
   d.ln(-0.5,-L,1.5,-L*.66,'W',1);d.ln(1.5,-L*.66,2.5,-3,'W',1);d.ln(2.5,-3,3,0,'W',1);d.ln(3,0,2.5,3,'W',1);d.ln(2.5,3,1.5,L*.66,'W',1);d.ln(1.5,L*.66,-0.5,L,'W',1);
   d.dot(-0.5,-L,'G');d.dot(-0.5,L,'G');
   const p=o&&o.pull!=null?o.pull:-0.5;d.ln(-0.5,-L,p,0,'w',1);d.ln(p,0,-0.5,L,'w',1);
   if(o&&o.arrow){d.ln(p,0,5,0,'W',1);d.dot(6,0,'M');d.dot(7,0,'M');d.dot(p,-1,'R');d.dot(p+1,1,'R');}},
 crossbow(d,w,o){d.bar(-7,9,0,2,'W');d.ln(7,-6,8,-3,'M',1);d.ln(8,-3,8,3,'M',1);d.ln(8,3,7,6,'M',1);d.dot(7,-6,'G');d.dot(7,6,'G');
   const p=o&&o.fired?9:5;d.ln(7,-6,p,0,'w',1);d.ln(p,0,7,6,'w',1);if(!(o&&o.fired))d.bar(0,10,-0.5,1,'M');}
};
HPWD.longbow=HPWD.bow;
const HPL={sword:14,greatsword:18,katana:15,dagger:7,axe:13,hammer:15,mace:15,spear:21,trident:20,scythe:16,staff:19,rod:11,tome:7,grimoire:9,lute:11,harp:8,fan:8,fists:2,claws:7,bow:10,longbow:12,crossbow:10};
const HPA0={sword:-90,greatsword:-90,katana:-90,axe:-90,hammer:-90,mace:-90,spear:-90,trident:-90,scythe:-90,staff:-90,rod:-90,bow:0,longbow:0,crossbow:0,dagger:0,claws:0,fists:0,fan:0,harp:0,lute:-35,tome:0,grimoire:0};
function hpFam(w){if(w==='twindagger')return 'dagger';return HPWD[w]?w:(/^staff/.test(w)?'staff':w==='none'||!w?'none':'staff');}
function hpWeapon(c,w,gx,gy,ang,o){
  const f=hpFam(w);if(f==='none')return null;o=o||{};const g=c.g,tk=c.tk;
  let L=HPL[f]||14,sc=o.sc||1;
  // keep the tip on the canvas: shrink the weapon along its axis when the pose would push it off
  const r0=ang*Math.PI/180,tx=gx+L*Math.cos(r0),ty=gy+L*Math.sin(r0);
  if(!o.free){const lim=(v,lo,hi,from,dv)=>dv>0&&v>hi?(hi-from)/dv:dv<0&&v<lo?(lo-from)/dv:1;
    const s=Math.min(lim(tx,1,g.w-2,gx,tx-gx),lim(ty,1,g.h-2,gy,ty-gy));if(s<1)sc=Math.max(.55,sc*s);}
  const dx=Math.cos(r0),dy=Math.sin(r0),nx=-dy,ny=dx;
  const P=(u,v)=>[gx+u*sc*dx+v*nx,gy+u*sc*dy+v*ny];
  const d={P,
    ln:(u0,v0,u1,v1,k,t)=>hpLine(g,P(u0,v0),P(u1,v1),tk(k),t||1),
    bar:(u0,u1,v,t,k)=>hpLine(g,P(u0,v),P(u1,v),tk(k),t||1),
    cross:(u,v0,v1,k,t)=>hpLine(g,P(u,v0),P(u,v1),tk(k),t||1),
    dot:(u,v,k)=>{const p=P(u,v);hpStamp(g,p[0],p[1],tk(k),1);},
    poly:(pts,k)=>g.poly(pts.map(p=>P(p[0],p[1])),tk(k)),
    orb:(u,v,r,k)=>{const p=P(u,v);g.ell(p[0],p[1],r,r,tk(k));}};
  HPWD[f](d,w,o);
  return {P,tip:P(L,0),sc,dx,dy};
}
// ---------- the pose builder ----------
function hpSleeve(B){const cnt={},hk=B.hand;B.arm[2].forEach(r=>{for(const ch of r)if(ch!=='.'&&ch!==' '&&ch!==hk)cnt[ch]=(cnt[ch]||0)+1;});let best=hk,n=0;for(const k in cnt)if(cnt[k]>n){n=cnt[k];best=k;}return best;}
function hpBare(L,id,walk,keepShield){
  const B=HP.body[L.b],ar=B.arm,ax=B.armX,hk=B.hand;
  const L2=Object.assign({},L,{wpn:'none'});if(!keepShield)L2.sh=undefined;
  let o;
  B.arm=[ar[0],ar[1],['#']];B.armX=B.arm;B.hand='!';
  try{o=heroGridSide(L2,walk,id);}finally{B.arm=ar;B.armX=ax;B.hand=hk;}
  return o;
}
function hpMarks(o){let S=null,H=null;for(let y=0;y<o.h;y++)for(let x=0;x<o.w;x++){const i=y*o.w+x,k=o.a[i];if(k==='#'){if(!S)S={x,y};o.a[i]=0;}else if(k==='!'){if(!H||y<H.y||(y===H.y&&x<H.x))H={x,y};o.a[i]=0;}}return {S,H};}
function hpFeet(o){for(let y=o.h-1;y>=0;y--)for(let x=0;x<o.w;x++)if(o.a[y*o.w+x])return y;return o.h-1;}
function hpEyes(o){for(let i=0;i<o.a.length;i++)if(o.a[i]==='E'||o.a[i]==='9')o.a[i]='K';}
const HPFAM_AIM={sword:1,greatsword:1,katana:1,axe:1,hammer:1,mace:1,spear:1,trident:1,scythe:1,staff:1,rod:1};
// pose table: lean = sideways shift of everything above the hips, crouch = rows removed from the legs, drop = head sinks 1px
const HPT={
 swing:[{lean:-1},{lean:1}],thrust:[{lean:0},{lean:1}],smash:[{lean:-1},{lean:1}],shoot:[{lean:0},{lean:-1}],
 cast:[{lean:0},{lean:0}],pray:[{drop:1},{drop:1}],guard:[{crouch:1,lean:0},{crouch:1,lean:1}],cheer:[{lean:0},{lean:0}],hit:[{lean:-1,eyes:1}]};
function heroPoseGrid(L,pose,frame,id,walk){
  frame=frame?1:0;walk=!!walk;
  if(pose==='idle'){const o=heroGridSide(L,false,id);if(frame){// B: cloth, tail and hair below the chin hang 1px longer
      const src=o.a.slice(),W=o.w,top=hpFeet(o)-22;
      for(let y=Math.max(0,top);y<o.h-1;y++)for(let x=0;x<W;x++){const k=src[y*W+x];if((k==='Y'||k==='T'||k==='U'||k==='u'||(k==='H'&&y>=top+4))&&!src[(y+1)*W+x]&&!o.a[(y+1)*W+x])o.a[(y+1)*W+x]=k;}}
    return o;}
  const spec=(HPT[pose]||HPT.cast)[frame]||HPT[pose][0],w=L.wpn||'none',fam=hpFam(w);
  const o=hpBare(L,id,walk,pose!=='guard');
  const F=hpFeet(o);
  if(spec.crouch)for(let n=0;n<spec.crouch;n++)hpCut(o,F-4);
  if(spec.lean)hpRows(o,0,F-10,spec.lean);
  if(spec.eyes)hpEyes(o);
  // markers: after the body is bent
  const m=hpMarks(o);let S=m.S,H=m.H;
  if(!S&&H){const ar=HP.body[L.b].arm;S={x:H.x-(20-ar[0]),y:H.y-(17-ar[1])};}// a later pass painted over the marker: place the shoulder from the hand
  if(!S)return heroGridSide(L,walk,id);// no arm marker (an odd body): fall back to the plain grid
  if(spec.drop)hpDropTop(o,Math.round(S.y)-2);
  const J=[S.x+1.5,S.y+1.5],R=H?[H.x+1-J[0],H.y+1-J[1]]:[5,4];
  const B=HP.body[L.b],sl=hpSleeve(B);
  const wh=(w==='fists')?'w':B.hand;
  const tintOn=typeof accOf==='function'&&!!accOf(id),TK={M:'v',N:'x',W:'y'};
  const c={g:o,tk:k=>tintOn&&TK[k]?TK[k]:k,J,R,sl};
  const a0=HPA0[fam]!==undefined?HPA0[fam]:-90;
  // arm: shoulder -> elbow -> hand centre (all relative to J); the hand is a 2x2 block (3x3 glove for fists)
  c.arm=(ex,ey,hx,hy,col)=>{const e=[J[0]+ex,J[1]+ey],h=[J[0]+hx,J[1]+hy];hpLine(o,[J[0],J[1]],e,col||sl,2);hpLine(o,e,h,col||sl,2);};
  c.hand=(hx,hy)=>{const x=Math.round(J[0]+hx),y=Math.round(J[1]+hy);if(w==='fists'){for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)hpPut(o,x+i,y+j,'w');hpPut(o,x+1,y,'G');hpPut(o,x+1,y-1,'G');}else for(let j=-1;j<=0;j++)for(let i=-1;i<=0;i++)hpPut(o,x+i,y+j,wh);};
  c.wp=(hx,hy,ang,opt)=>hpWeapon(c,w,J[0]+hx,J[1]+hy,ang,opt);
  c.px=(x,y,k)=>hpPut(o,Math.round(J[0]+x),Math.round(J[1]+y),k,true);
  c.orb=(x,y,r,k)=>o.ell(J[0]+x,J[1]+y,r,r,k);
  c.glint=(x,y)=>{c.px(x,y,'D');c.px(x-1,y,'D');c.px(x+1,y,'D');c.px(x,y-1,'D');c.px(x,y+1,'D');};
  hpPose(c,pose,frame,w,fam,a0,L);
  return o;
}
function hpCut(o,from){const W=o.w;for(let y=from;y>=1;y--)for(let x=0;x<W;x++)o.a[y*W+x]=o.a[(y-1)*W+x];for(let x=0;x<W;x++)o.a[x]=0;}
// smear: dots in the air where the weapon just passed (only on empty cells)
function hpTrail(c,hx,hy,a0,a1,len){const g=c.g;for(let a=a0;a<=a1;a+=5){const r=a*Math.PI/180;hpPut(g,Math.floor(c.J[0]+hx+Math.cos(r)*len),Math.floor(c.J[1]+hy+Math.sin(r)*len),'D',true);}}
function hpPose(c,pose,f,w,fam,a0,L){
  const R=c.R,g=c.g,aim=!!HPFAM_AIM[fam],ln=HPL[fam]||12;
  const rest=()=>{c.arm(R[0]*.5-1,R[1]*.6,R[0],R[1]);c.wp(R[0],R[1],a0);c.hand(R[0],R[1]);};
  if(pose==='swing'){
    if(f===0){c.arm(-5,-6,-5,-12);c.wp(-5,-12,-150);c.hand(-5,-12);}
    else{c.arm(5,-3,7,2);c.wp(7,2,55);c.hand(7,2);hpTrail(c,7,2,-100,25,Math.min(ln*.85,12));}
  }else if(pose==='thrust'){
    if(f===0){c.arm(-2,3,0,3);c.wp(0,3,-8);c.hand(0,3);}
    else{c.arm(4,3,8,1);c.wp(8,1,-3);c.hand(8,1);if(aim||fam==='dagger'||fam==='claws')hpTrail(c,8,1,-24,8,0);}
  }else if(pose==='smash'){
    const a=f?58:-100,hx=f?7:3,hy=f?2:-9;
    c.arm(f?5:5,f?-2:-4,hx,hy);const t=c.wp(hx,hy,a);
    // second hand lower on the haft
    if(t){const p=t.P(-4,0),qx=p[0]-c.J[0],qy=p[1]-c.J[1];c.arm((qx)*.5-1,qy*.5+1,qx,qy);c.hand(qx,qy);}
    c.hand(hx,hy);
    if(f)hpTrail(c,hx,hy,-95,35,Math.min(ln*.85,12));
  }else if(pose==='shoot'){
    if(fam==='bow'||fam==='longbow'){
      c.arm(5,-3,10,-3);
      if(f===0){c.wp(10,-3,-3,{pull:-9,arrow:1});c.hand(10,-3);c.arm(0,-2,1,-4);c.hand(1,-4);}
      else{c.wp(10,-3,0,{pull:-0.5});c.hand(10,-3);c.arm(-3,-1,-3,-3);c.hand(-3,-3);}
    }else if(fam==='crossbow'){
      c.arm(4,0,9,-2);
      if(f===0){c.wp(9,-2,-4,{});c.hand(9,-2);c.arm(2,0,5,0);c.hand(5,0);}
      else{c.wp(9,-2,-11,{fired:1});c.hand(9,-2);c.arm(2,0,5,-1);c.hand(5,-1);}
    }else{// thrown or other ranged weapon: cocked back, then released forward
      if(f===0){c.arm(-3,-5,-2,-10);c.wp(-2,-10,-45);c.hand(-2,-10);}
      else{c.arm(4,-3,9,-3);c.wp(9,-3,-8);c.hand(9,-3);}
    }
  }else if(pose==='cast'){
    rest();
    const hx=f?12:11,hy=f?-10:-8;
    c.arm(6,-4,hx,hy);c.hand(hx,hy);
    if(f===0){c.orb(hx+1,hy-3,1.5,'C');[[-3,-3],[5,-4],[4,2],[-2,1]].forEach(p=>c.px(hx+1+p[0],hy-3+p[1],'C'));}
    else{c.orb(hx+1.5,hy-3.5,3.2,'C');c.orb(hx+1.5,hy-3.5,1.5,'D');[[-5,-3],[6,-7],[7,0],[-4,-8]].forEach(p=>c.px(hx+1+p[0],hy-3+p[1],'D'));}
  }else if(pose==='pray'){
    const t=c.wp(7,-1,fam==='tome'||fam==='grimoire'||fam==='harp'||fam==='lute'||fam==='fan'?a0:(aim&&fam!=='rod'&&fam!=='staff'?90:(fam==='staff'?-90:90)),{free:1});
    c.arm(3,3,7,-1);c.arm(1,2,5,1);c.hand(5,1);c.hand(7,-1);
    if(f)c.glint(11,-5);else c.px(10,-4,'D');
  }else if(pose==='guard'){
    const sh=L.sh&&SHIELD[L.sh];
    if(sh){
      const hx=5,hy=-2;c.arm(3,2,hx,hy);c.wp(hx-1,hy-2,-88,{free:1});c.hand(hx,hy);
      const rows=sh[0][2],x0=Math.round(c.J[0])+2+f,y0=Math.round(c.J[1])-4;
      g.rows(x0,y0,rows);
    }else if(fam==='fists'){c.arm(3,-1,6,-5);c.hand(6,-5);c.arm(1,0,4,-2);c.hand(4,-2);}
    else{const hx=f?5:4,hy=f?1:2,ang=f?-62:-48;c.arm(2,2,hx,hy);c.wp(hx,hy,HPFAM_AIM[fam]||fam==='dagger'?ang:(fam==='bow'||fam==='longbow'||fam==='crossbow'?-30:a0));c.hand(hx,hy);}
  }else if(pose==='cheer'){
    const hx=7,hy=f?-13:-10,ang=HPFAM_AIM[fam]?(f?-76:-90):(fam==='bow'||fam==='longbow'||fam==='crossbow'||fam==='dagger'||fam==='claws'||fam==='fan'?-45:a0);
    c.arm(6,-3,hx,hy);c.wp(hx,hy,ang);c.hand(hx,hy);
    if(f){c.px(hx+5,hy-3,'D');c.px(hx-6,hy-2,'D');c.px(hx+1,hy-8,'D');}
  }else if(pose==='hit'){
    c.arm(R[0]*.5-2,R[1]*.6,R[0]-2,R[1]+1);c.wp(R[0]-2,R[1]+1,a0+(a0<=-60?-18:22));c.hand(R[0]-2,R[1]+1);
  }
}
// ---------- wiring ----------
{const hg9=heroGridSide;heroGridSide=function(L,walk,id){if(HPW){const w=HPW;HPW=null;return heroPoseGrid(L,w.pose,w.frame,id,w.walk);}return hg9.apply(this,arguments);};}
function heroPoseCanvas(id,pose,frame,walk){HPW={pose,frame,walk:!!walk};try{return heroCanvas(id,false);}finally{HPW=null;}}
function heroPoseImg(id,pose,frame,walk){return imgOf('bp9:'+id+':'+pose+(frame?1:0)+(walk?'w':'')+lookKey(id),()=>heroPoseCanvas(id,pose,frame,walk));}
// which skill a hero is using: recorded when the action starts (perform) or the Guard command runs
{const pf0=perform;perform=function(a,sk,tgts){try{if(a&&sk&&a.side==='p'){a.actSk=sk;a.actSkT=Date.now();a.actDl=typeof deliveryOf==='function'?deliveryOf(a,sk):null;}}catch(e){}return pf0.apply(this,arguments);};}
{const gd0=guard;guard=function(){const a=B&&B.cur;const r=gd0.apply(this,arguments);try{if(a){a.gdT=Date.now();}}catch(e){}return r;};}
const HPD={slash:'swing',piercing:'thrust',blunt:'smash',ranged:'shoot',magic:'cast',heal:'pray'};
const HPC={swing:'swing',thrust:'thrust',jab:'thrust',dash:'swing',bow:'shoot',crossbow:'shoot',cast:'cast',channel:'pray',play:'cheer'};
// the pose for skill sk (delivery dl) of a hero whose animation class style is st; null = no pose
function heroPoseFor(sk,dl,st,kind){
  const k=sk?sk.k:kind;
  if(k==='heal'||k==='revive'||k==='mpself')return 'pray';
  if(k==='mag')return 'cast';
  if(k==='status'||k==='buff'){const bad=sk&&sk.fx&&sk.fx[0]&&typeof STS!=='undefined'&&STS[sk.fx[0][0]]&&STS[sk.fx[0][0]].bad;return bad?'cast':'cheer';}
  if(k==='phys'||(!k&&dl))return HPD[dl]||HPC[st]||'swing';
  return null;
}
// heroPoseOf(u,a): {pose,frame} for a hero u, a ms into its action, or null for idle
function heroPoseOf(u,a){
  const T=Date.now();
  if(u.gdT&&T-u.gdT<520)return {pose:'guard',frame:T-u.gdT<190?0:1};
  if(u.actT&&a>=0&&a<520){
    const known=u.actSk&&Math.abs((u.actSkT||0)-u.actT)<80,st=typeof animStyle==='function'?animStyle(u):'swing';
    const p=known?heroPoseFor(u.actSk,u.actDl,st):heroPoseFor(null,null,st,u.actKind);
    if(p)return {pose:p,frame:a<IMPACT?0:1};
  }
  if(u.guard&&u.hp>0)return {pose:'guard',frame:1};
  return null;
}
const HPS={on:true};
{const so9=spriteOf;spriteOf=function(u,walk){const c=so9.apply(this,arguments);
  try{
    if(!HPS.on||!u||u.side!=='p'||u.heroArt||u.isComp||u.hp<=0||(typeof B!=='undefined'&&B&&B.wipe))return c;
    const t=TPL[u.id];if(!t||t.mon||!t.look||t.scourge)return c;
    const T=Date.now(),a=T-(u.actT||0),still=typeof gfxStill==='function'&&gfxStill();
    let pf=heroPoseOf(u,a);
    if(!pf){const h=T-(u.hitT||0)-IMPACT;if(h>=0&&h<180)pf={pose:'hit',frame:0};}
    if(pf)return b8Small(heroPoseImg(u.id,pf.pose,pf.frame,walk));
    // idle A is the normal sprite; B hangs cloth and hair 1px lower (same 620 ms beat as the breathing in drawUnit)
    if(!still&&!walk&&a>520){const i=(typeof B!=='undefined'&&B&&B.front?B.front.indexOf(u):0)||0;if(Math.floor(performance.now()/620+i*.5)%2===1)return b8Small(heroPoseImg(u.id,'idle',1,false));}
  }catch(e){}
  return c;};}
// the prayer and the spell already raise the hands: soften the hop animPose adds on top
if(typeof animPose==='function'){const ap9=animPose;animPose=function(u,a,dir,b){const r=ap9.apply(this,arguments);try{if(r&&r.dy&&u.side==='p'&&!u.isComp){const pf=heroPoseOf(u,a);if(pf&&(pf.pose==='pray'||pf.pose==='cast'))return Object.assign({},r,{dy:Math.round(r.dy*.5)});}}catch(e){}return r;};}
