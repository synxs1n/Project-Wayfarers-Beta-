// ===== weather7.js (v0.7.7): the weather drawn in layers (2D, HD-2D, battle stage) =====
// Every weather of the game in the world view (2D renderer and the HD-2D overlay), inside the HD-2D scene, and on the battle stage:
//  - far, mid and near layers: far particles are small, dim and slow and lag the camera (parallax), near ones are large, soft and fast and
//    lead it; the layer that touches the ground (puddles, ripples, splashes, settling flakes and ash) moves exactly with the ground.
//  - HD-2D: rain streaks, flakes, grains, ash, embers, wind streaks, fog and dust banks are quads in the GL scene (world positions, lit,
//    depth tested, smaller with distance); puddles, ripples and splashes lie on the ground; wet ground is darker and glossier (grade);
//    a lightning flash lights the scene; heat shimmers through the composite pass. The 2D overlay keeps only what is near the lens or in
//    the sky (near streaks, gusts, bolts, the flash, starfall, aurora).
//  - smooth blends: each weather of Phase 5's blend (TR.wx) is drawn at its own weight (no offscreen layers).
// Rules kept: nothing is drawn over the hero (2D: his box is skipped, HD-2D: hdWfxEmit's box test, the shimmer starts above his head);
// battle labels are DOM over the canvas and unit HUD is drawn after the weather (v0.5.8); reduced motion shows a still frame (t = 0, no
// flashes, no gusts); no game RNG or Math.random is used (positions come from a hash of the index and the time, the fog bank sprites
// from their own seeded mulberry), so the Daily Trial and every seeded test are untouched. Low keeps a cheap version (WX7.tier.low).
// The rare skies Blood Moon, Solar Eclipse and the Elemental Surges keep their v0.4.0 look (world3.js), now anchored like before.
const W7={stats:{mode:'',w:'',n:0,layers:[0,0,0],ground:0,banks:0,shimmer:0,flash:0,bolt:0,gl:0,glG:0},force:0,spr:{},pud:new Map(),pudMap:null,err:null,heat:0,log:null};
const W7R=mulberry(7707);// visual only: shapes of the fog and gust bank sprites
const W7M=(v,P)=>((v%P)+P)%P;
const w7H=(i,k)=>wfxH(i,k);
function w7Q(){let t='medium';try{t=GFX.tier||gfxTier();}catch(e){}return WX7.tier[t]||WX7.tier.medium;}
function w7Still(){try{return gfxStill();}catch(e){return false;}}
// ----- sprites (drawn once) -----
function w7Spr(key,w,h,fn){let c=W7.spr[key];if(!c){c=W7.spr[key]=mkCv(w,h);fn(c.getContext('2d'),w,h);}return c;}
// a slanted streak, bright at its head (bottom), fading toward its tail; wid 1 to 3 (outer columns soft)
function w7Streak(len,wid,s,rgb,a){return w7Spr(`st${len}:${wid}:${s}:${rgb}:${a}`,Math.ceil(len*Math.abs(s))+wid+2,len+2,(c)=>{const x0=s<0?Math.ceil(len*-s)+1:1;
  for(let y=0;y<len;y++){const k=Math.pow((y+1)/len,.9)*a,x=Math.round(x0+y*s);c.fillStyle=`rgba(${rgb},${k.toFixed(3)})`;c.fillRect(x,y+1,1,1);
    if(wid>1){c.fillStyle=`rgba(${rgb},${(k*.32).toFixed(3)})`;c.fillRect(x-1,y+1,1,1);if(wid>2)c.fillRect(x+1,y+1,1,1);}}});}
function w7Dot(key,r,rgb,a){const n=Math.ceil(r*2)+2;return w7Spr('dot'+key,n,n,(c)=>{const g=c.createRadialGradient(n/2,n/2,0,n/2,n/2,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(.45,`rgba(${rgb},${a*.6})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(0,0,n,n);});}
// a soft cloud bank: many faint puffs in an elongated heap (fog, dust, blizzard gusts); tinted copies with source-in.
// v0.8.0: every puff stays inside the sprite and the heap is feathered by an elliptical mask (alpha 0 well before every edge), so a bank
// never shows the straight edge of its own rectangle (the "boxes" the v0.7.7 banks drew where they overlapped, often around units)
function w7Bank(flat){return w7Spr('bank'+flat,192,flat?48:80,(c,w,h)=>{const R=W7R,sx=flat?2.2:1.35;for(let i=0;i<52;i++){const x=40+R()*112,e=1-Math.abs(x-96)/70,y=h/2+(R()-.5)*h*.22*e;
    let r=(flat?9:12)+R()*(flat?10:16)*e;r=Math.min(r,(x-4)/sx,(w-4-x)/sx,y-3,h-3-y);if(r<3)continue;
    c.save();c.translate(x,y);c.scale(sx,1);const g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'rgba(255,255,255,.24)');g.addColorStop(.55,'rgba(255,255,255,.1)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(-r,-r,r*2,r*2);c.restore();}
  c.save();c.globalCompositeOperation='destination-in';c.translate(w/2,h/2);c.scale(w/2,h/2);const m=c.createRadialGradient(0,0,0,0,0,1);m.addColorStop(0,'rgba(0,0,0,1)');m.addColorStop(.45,'rgba(0,0,0,.92)');m.addColorStop(.8,'rgba(0,0,0,.3)');m.addColorStop(.97,'rgba(0,0,0,0)');m.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=m;c.fillRect(-1,-1,2,2);c.restore();});}
function w7BankT(flat,col){return w7Spr(`bankT${flat}:${col}`,192,flat?48:80,(c,w,h)=>{c.drawImage(w7Bank(flat),0,0);c.globalCompositeOperation='source-in';c.fillStyle=col;c.fillRect(0,0,w,h);});}
function w7Puddle(){return w7Spr('pud',32,12,(c)=>{c.fillStyle='rgba(34,50,84,.46)';c.beginPath();c.ellipse(16,6,15,5.2,0,0,7);c.fill();
  c.fillStyle='rgba(130,160,210,.22)';c.beginPath();c.ellipse(13,5,9,2.6,0,0,7);c.fill();c.strokeStyle='rgba(215,228,255,.5)';c.lineWidth=1;c.beginPath();c.ellipse(16,6,14,4.6,0,Math.PI*1.08,Math.PI*1.92);c.stroke();
  c.fillStyle='rgba(255,255,255,.55)';c.fillRect(9,3,4,1);});}
function w7Ripple(){return w7Spr('rip',20,8,(c)=>{c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=1;c.beginPath();c.ellipse(10,4,9,3.2,0,0,7);c.stroke();});}
function w7Spec(){return w7Spr('spec',16,6,(c)=>{const g=c.createRadialGradient(8,3,0,8,3,8);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.save();c.scale(1,.38);c.fillRect(0,0,16,16);c.restore();});}
function w7Ribbon(col){return w7Spr('aur'+col,4,64,(c)=>{const g=c.createLinearGradient(0,0,0,64);g.addColorStop(0,`rgba(${col},0)`);g.addColorStop(.3,`rgba(${col},.85)`);g.addColorStop(.62,`rgba(${col},.32)`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.fillRect(0,0,4,64);});}
// ----- lightning: strikes on a fixed schedule from a hash of the strike index (no RNG). Each strike flashes at most twice, briefly, and
// strikes are at least WX7.bolt.gap[0] ms apart, so there are never more than 2 flashes in any second. Reduced motion: no strikes.
const W7S={k:0,dt:0,f:0,far:false,x:0};
function w7FlashAt(dt,mul){let f=0;for(const p of WX7.bolt.pulses){if(dt>=p[0]&&dt<p[0]+p[1]){const u=(dt-p[0])/p[1];f=p[2]*Math.pow(1-u,1.6);}}return f*mul;}
function w7Strike(ms){const B=WX7.bolt,S=W7S;S.f=0;S.k=-1;if(w7Still())return S;
  if(W7.force&&(W7.hold||ms>=W7.force&&ms-W7.force<B.life)){S.k=7;S.dt=W7.hold?30:ms-W7.force;S.far=false;S.x=.62;S.f=w7FlashAt(S.dt,1);return S;}
  const P=B.gap[1],j=B.gap[1]-B.gap[0],k0=Math.floor(ms/P);
  for(let k=k0;k>=k0-1;k--){const T=k*P+w7H(k,301)*j,dt=ms-T;if(dt>=0&&dt<B.life){S.k=k;S.dt=dt;S.far=W7M(k,3)===1;S.x=.12+.76*w7H(k,302);S.f=w7FlashAt(dt,S.far?.35:1);return S;}}
  return S;}
// a soft periodic gust, 0 to 1 (blizzard whiteouts, sand and gale bands); 0 under reduced motion (t = 0)
function w7Gust(t){if(!t)return 0;const g=Math.max(0,Math.sin(t*1.15+Math.sin(t*.37)*1.6));return g*g*g;}
// the weathers to draw now and their weights (Phase 5's blend)
const W7L=[];
function w7List(m){W7L.length=0;if(!m||!G||!G.weather)return W7L;const cur=G.weather[m.s]||'clear',X=typeof TR!=='undefined'?TR.wx:null;
  if(X&&X.from&&X.k<1&&X.cur===cur&&X.from!==cur){const e=trEase(X.k);if(X.from!=='clear')W7L.push([X.from,1-e]);if(cur!=='clear')W7L.push([cur,e]);}
  else if(cur!=='clear')W7L.push([cur,1]);return W7L;}
const W7_OWN={rain:1,storm:1,snow:1,blizzard:1,fog:1,gale:1,sand:1,heat:1,ashfall:1,aurora:1,starfall:1,meteor:1};
// v0.9.9: a phase being blended out keeps the progress it had (TR.fromP, as hdLook does); with the new phase's progress the old dusk or dawn
// jumped at the phase change (dusk > night started from no night at all, dawn > day from 0.3 night: fog and banks on Low, v050p5c)
function w7Night(){try{const p=phaseProg();if(typeof trPhW==='function'&&TR.inDraw){const pr=ph=>ph===p.ph?p.p:TR.from===ph?TR.fromP:1;
    return Math.min(1,trPhW('night')+trPhW('dusk')*.35*pr('dusk')+trPhW('dawn')*.3*(1-pr('dawn')));}
  return p.ph==='night'?1:p.ph==='dusk'?.35*p.p:p.ph==='dawn'?.3*(1-p.p):0;}catch(e){return 0;}}
// a colour between day (c0) and night (c1), in 8 steps (tinted sprites are cached per colour)
function w7Rgb(c0,c1,t){const q=Math.round(Math.max(0,Math.min(1,t))*8)/8;return `${Math.round(c0[0]+(c1[0]-c0[0])*q)},${Math.round(c0[1]+(c1[1]-c0[1])*q)},${Math.round(c0[2]+(c1[2]-c0[2])*q)}`;}
const w7Col=(c0,c1,t)=>`rgb(${w7Rgb(c0,c1,t)})`;
// ----- the 2D painter. V: mode ('w2d' world 2D, 'ov' HD-2D overlay, 'bt' battle), W, H, ox, oy (camera, px), gy (battle floor line),
// t (s), ms, q (tier), hero box hx0..hy1, night (0..1), gr (draw the ground layer), m (map) -----
const W7V={air:true,mode:'',W:0,H:0,ox:0,oy:0,gy:0,t:0,ms:0,q:null,hx0:0,hy0:0,hx1:0,hy1:0,night:0,gr:true,m:null,area:1};
const W7F={s:0,vx:0,vy:0,par:1,mg:12,w:1,h:1,spr:null,col:'#fff',a:1,hero:false,sway:0,swayF:1,flip:false,top:0};
function w7F(o){W7F.s=0;W7F.vx=0;W7F.vy=0;W7F.par=1;W7F.mg=12;W7F.w=1;W7F.h=1;W7F.spr=null;W7F.col='#fff';W7F.a=1;W7F.hero=true;W7F.sway=0;W7F.swayF=1;W7F.flip=false;W7F.top=0;return Object.assign(W7F,o);}
// one falling layer of n particles; returns how many were drawn
function w7Fall(ctx,V,n,o,k,L){if(n<=0||o.a*k<.01)return 0;const W=V.W,H=V.H,mg=o.mg,PW=W+mg*2,top=o.top?Math.min(H,o.top):H,PH=top+mg*2,t=V.t,ox=V.ox*o.par,oy=V.oy*o.par,sp=o.spr;
  ctx.globalAlpha=o.a*k;if(!sp)ctx.fillStyle=o.col;let d=0;const hm=o.hero&&V.frx>0,w=sp?sp.width:o.w,h=sp?sp.height:o.h;
  for(let i=0;i<n;i++){const r=1+.35*w7H(i,o.s+2);let x=W7M(w7H(i,o.s)*PW+t*o.vx*r-ox,PW)-mg,y=W7M(w7H(i,o.s+1)*PH+t*o.vy*r-oy,PH)-mg;
    if(o.sway)x+=Math.sin(t*o.swayF+i*1.7)*o.sway;
    let ww=w,hh=h;if(o.flip&&Math.floor(t*3+i)%2){ww=h;hh=w;}
    if(x<-ww||y<-hh||x>W||y>top)continue;const fa=hm?w7Soft(V,x+ww/2,y+hh/2,0):1;if(fa<.03)continue;if(fa<1)ctx.globalAlpha=o.a*k*fa;
    if(sp)ctx.drawImage(sp,Math.round(x),Math.round(y));else ctx.fillRect(Math.round(x),Math.round(y),ww,hh);if(fa<1)ctx.globalAlpha=o.a*k;d++;}
  V.n+=d;W7.stats.layers[L]+=d;return d;}
function w7Tint(ctx,V,col,a){if(a<.004)return;ctx.globalAlpha=a;ctx.fillStyle=col;ctx.fillRect(0,0,V.W,V.H);}
const W7GC=new Map();
function w7Grad(ctx,V,y0,y1,c0,c1,a){if(a<.004)return;const key=ctx.canvas.width+':'+(y0|0)+':'+(y1|0)+c0+c1;let g=W7GC.get(key);if(!g){if(W7GC.size>64)W7GC.clear();g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,c0);g.addColorStop(1,c1);W7GC.set(key,g);}ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fillRect(0,Math.min(y0,y1),V.W,Math.abs(y1-y0));}
const w7Cnt=(V,n)=>Math.round(n*V.area);
// ground spots: world 2D moves them with the ground (par 1); battle puts them on the floor with perspective; returns [x, y, scale]
const W7G=[0,0,1];
function w7Spot(V,a,b){if(V.mode==='bt'){const fl=V.H-V.gy-6,y=V.gy+5+b*fl;W7G[0]=a*V.W;W7G[1]=y;W7G[2]=.45+.6*(y-V.gy)/Math.max(1,V.H-V.gy);return W7G;}
  const mg=16,PW=V.W+mg*2,PH=V.H+mg*2;W7G[0]=W7M(a*PW-V.ox,PW)-mg;W7G[1]=W7M(b*PH-V.oy,PH)-mg;W7G[2]=1;return W7G;}
// v0.8.0: readability around the hero is a soft shaped falloff, not a rectangle with nothing in it (v0.7.7 skipped every particle in
// his padded box, which left a clear box in dense rain, snow and fog that followed him). w7Soft returns an alpha factor 0..1: mode 0 is a
// feathered ellipse around his face (air layers: nothing sits on the face, the rest of him is in the weather like the ground around
// him); mode 1 a feathered ellipse around his whole body (ground layer: puddles, splashes and settling flakes fade out under him instead
// of popping). The factor is 0 only near the centre and rises smoothly (smoothstep in the squared elliptical distance) to 1 at the rim.
function w7Soft(V,x,y,body){if(!(V.frx>0))return 1;const F=WX7.face,dx=(x-(body?V.bx:V.fx))/(body?V.brx:V.frx),dy=(y-(body?V.by:V.fy))/(body?V.bry:V.fry),d=dx*dx+dy*dy;
  if(d>=1)return 1;const u=Math.max(0,(d-F.core)/(1-F.core));return u*u*(3-2*u);}
const w7HeroK=(V,x,y,w,h,body)=>body?Math.min(w7Soft(V,x+w/2,y+h/2,1),w7Soft(V,x+w/2,y+h/2,0)):w7Soft(V,x+w/2,y+h/2,0);
// splashes with a ripple ring (rain)
function w7Splash(ctx,V,n,k){const rip=w7Ripple();let d=0;ctx.fillStyle='rgba(225,236,255,.9)';
  for(let j=0;j<n;j++){const L=.36,ph=V.t/L+w7H(j,401),c=Math.floor(ph),a=ph-c;if(a>.62)continue;const P=w7Spot(V,w7H(c*13+j,402),w7H(c*17+j,403)),x=P[0],y=P[1],s=P[2];
    const rw=(3+a*13)*s,rh=rw*.38,hk=Math.min(w7HeroK(V,x-rw/2,y-6*s,rw,6*s+rh,1),w7Soft(V,x,y-4*s,0));if(hk<.03)continue;
    ctx.globalAlpha=(1-a/.62)*.55*k*hk;ctx.drawImage(rip,x-rw/2,y-rh/2,rw,rh);
    // v0.9.9: each droplet fades by the face at its own place (they jump up to 9 px above the splash, into the face: v077wa)
    if(a<.26){const u=a*30*s,ga=(1-a/.26)*.8*k*hk,dot=(px,py)=>{const f=w7Soft(V,px+.5,py+.5,0);if(f<.03)return;ctx.globalAlpha=ga*f;ctx.fillRect(px,py,1,1);};
      dot(Math.round(x-1-u*.4),Math.round(y-u*.5));dot(Math.round(x+1+u*.4),Math.round(y-u*.45));dot(Math.round(x),Math.round(y-u*.7));}d++;}
  V.n+=d;W7.stats.ground+=d;}
// puddles on open ground with rings from the drops (world 2D: cached per map cell; battle: a few on the floor)
function w7PudAt(m,cx,cy){if(W7.pudMap!==m){W7.pud.clear();W7.pudMap=m;}const key=cx*4096+cy;let p=W7.pud.get(key);if(p!==undefined)return p;p=null;
  const C=44,h=w7H(cx*7919+cy*104729,411+m.s);if(h<.3){const x=cx*C+8+w7H(cx*31+cy,412)*28,y=cy*C+8+w7H(cx+cy*37,413)*28,tx=Math.floor(x/TS),ty=Math.floor(y/TS),ok=(X,Y)=>{const r=m.t&&m.t[Y];const ch=r&&r[X];return !!ch&&ch!=='~'&&ch!=='B'&&SOLID.indexOf(ch)<0;};
    if(ok(tx,ty)&&ok(Math.floor((x-10)/TS),ty)&&ok(Math.floor((x+10)/TS),ty))p=[x,y,.7+w7H(cx*3+cy*5,414)*.7];}W7.pud.set(key,p);return p;}
function w7Puddles(ctx,V,k){const pd=w7Puddle(),rip=w7Ripple();let d=0;
  const one=(x,y,s,id)=>{const w=32*s,h=12*s;if(x<-w||y<-h||x>V.W+w||y>V.H+h)return;const hk=w7HeroK(V,x-w/2,y-h/2,w,h,1);if(hk<.03)return;ctx.globalAlpha=.8*k*hk;ctx.drawImage(pd,x-w/2,y-h/2,w,h);
    for(let r=0;r<2;r++){const L=.95,ph=V.t/L+w7H(id*3+r,415),a=ph-Math.floor(ph),c=Math.floor(ph),rx=x+(w7H(c*7+id+r,416)-.5)*w*.45,ry=y+(w7H(c*5+id+r,417)-.5)*h*.35,rw=(2+a*10)*s,rh=rw*.38;
      // v0.9.9: each ring fades by its own place too (the puddle's centre can sit outside the face while a ring lands on it; the 2D weather
      // layer is drawn after the characters, so the ring painted over his face: v077wa)
      const rk=Math.min(hk,w7HeroK(V,rx-rw/2,ry-rh/2,rw,rh,1));if(rk<.03)continue;
      ctx.globalAlpha=(1-a)*.5*k*rk;ctx.drawImage(rip,rx-rw/2,ry-rh/2,rw,rh);}d++;};
  if(V.mode==='bt'){for(let j=0;j<5;j++){const y=V.gy+(.2+.75*w7H(j,422))*(V.H-V.gy),s=(.7+.9*(y-V.gy)/Math.max(1,V.H-V.gy))*(1+w7H(j,423)*.6);one((.06+.88*w7H(j,421))*V.W,y,s,j);}}
  else if(V.m){const C=44,x0=Math.floor(V.ox/C)-1,x1=Math.floor((V.ox+V.W)/C)+1,y0=Math.floor(V.oy/C)-1,y1=Math.floor((V.oy+V.H)/C)+1;
    for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){const p=w7PudAt(V.m,cx,cy);if(p)one(p[0]-V.ox,p[1]-V.oy,p[2],cx*101+cy);}}
  V.n+=d;W7.stats.ground+=d;}
// settling flakes or ash: land, rest a moment, fade
function w7Settle(ctx,V,n,k,col,life){let d=0;ctx.fillStyle=col;for(let j=0;j<n;j++){const ph=V.t/life+w7H(j,431),c=Math.floor(ph),a=ph-c,P=w7Spot(V,w7H(c*11+j,432),w7H(c*19+j,433));
  const hk=w7HeroK(V,P[0]-1,P[1]-1,3,3,1);if(hk<.03)continue;ctx.globalAlpha=(a<.08?a/.08:1-(a-.08)/.92)*.85*k*hk;ctx.fillRect(Math.round(P[0]),Math.round(P[1]),j%3?1:2,1);d++;}V.n+=d;W7.stats.ground+=d;}
// lightning bolt: a jagged line from the top of the view down toward the horizon, with a glow and a branch
function w7Bolt(ctx,V,S,k){const life=WX7.bolt.life;if(S.k<0||S.dt>=life)return;const fade=1-S.dt/life,W=V.W,top=V.mode==='bt'?V.gy*.92:V.mode==='ov'?V.H*.36:V.H*(.32+.22*w7H(S.k,303));
  const x0=S.x*W,len=S.far?top*.55:top,pts=[];let x=x0,y=-4;const n=8;for(let i=0;i<=n;i++){pts.push(x,y);y+=len/n;x+=(w7H(S.k*31+i,304)-.5)*(S.far?10:22);}
  const line=(lw,col,a,from,to)=>{ctx.globalAlpha=a*k;ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(pts[from*2],pts[from*2+1]);for(let i=from+1;i<=to;i++)ctx.lineTo(pts[i*2],pts[i*2+1]);ctx.stroke();};
  ctx.lineJoin='round';const fl=S.dt<50||(S.dt>150&&S.dt<200)?1:.55;
  line(S.far?4:8,'rgba(150,170,255,1)',.18*fade*fl,0,n);line(S.far?2:3.5,'rgba(200,210,255,1)',.35*fade*fl,0,n);line(S.far?1:1.8,'#f8f9ff',fade*fl,0,n);
  if(!S.far){const b=3,bx=[pts[b*2],pts[b*2+1]];ctx.globalAlpha=.6*fade*fl*k;ctx.lineWidth=1;ctx.strokeStyle='#e8ecff';ctx.beginPath();ctx.moveTo(bx[0],bx[1]);
    let X=bx[0],Y=bx[1];for(let i=0;i<3;i++){X+=8+w7H(S.k*7+i,305)*10;Y+=len/n*.9;ctx.lineTo(X,Y);}ctx.stroke();}
  W7.stats.bolt++;}
// heat shimmer on a 2D canvas: rows of the band are shifted sideways by a slow wave (the canvas is drawn onto itself)
function w7Shimmer(ctx,V,y0,y1,amp){if(!(y1>y0)||amp<.2)return;const cv=ctx.canvas,sc=cv.width/Math.max(1,V.W),t=V.t,step=3;let d=0;
  for(let y=Math.max(0,Math.floor(y0));y<Math.min(V.H,y1);y+=step){const e=Math.sin((y-y0)/(y1-y0)*Math.PI),off=Math.sin(y*.23+t*5.1)*amp*e+Math.sin(y*.07-t*2.3)*amp*.4*e;if(Math.abs(off)<.25)continue;
    ctx.globalAlpha=1;const sy=Math.round(y*sc),sh=Math.round(step*sc);
    if(V.frx>0&&y+step>V.hy0-6&&y<V.hy1){const a0=Math.max(0,Math.floor(V.hx0-6)),a1=Math.min(V.W,Math.ceil(V.hx1+6));// v0.8.0: the hero's columns stay still, the rest of the row still shimmers (was: the whole row skipped, a still band)
      if(a0>0)ctx.drawImage(cv,0,sy,Math.round(a0*sc),sh,off,y,a0,step);if(a1<V.W)ctx.drawImage(cv,Math.round(a1*sc),sy,cv.width-Math.round(a1*sc),sh,a1+off,y,V.W-a1,step);d++;continue;}
    ctx.drawImage(cv,0,sy,cv.width,sh,off,y,V.W,step);d++;}W7.stats.shimmer+=d;}
// fog and dust banks: three layers that drift at their own speed and parallax; near banks fade around the hero
// v0.8.0: banks that lie on the ground (fog) move with it (o.par close to 1) instead of the falling particles' strong parallax; a near
// bank over the hero's face thins to WX7.face.bank of its alpha (smoothly, by the face's distance inside the bank), never to nothing
function w7Banks(ctx,V,k,ns,col,o){const sp=w7BankT(o.flat?1:0,col),bw=sp.width,bh=sp.height;let d=0;
  for(let L=0;L<3;L++){const n=ns[L];if(!n)continue;const sc=Math.min(o.sc[L],V.W*1.15/bw),w=bw*sc,h=bh*sc,par=(o.par||WX7.par)[L],PW=V.W+w,y0=o.y0!=null?o.y0:-h*.3,y1=o.y1!=null?o.y1:V.H+h*.1,PH=Math.max(8,y1-y0);
    for(let i=0;i<n;i++){let x=W7M(w7H(i,441+L*5)*PW+V.t*o.v[L]*(1+.3*w7H(i,442+L*5))-V.ox*par,PW)-w*.75,y=y0+W7M(w7H(i,443+L*5)*PH-V.oy*par*(V.mode==='bt'?0:1),PH)-h/2;
      let a=o.a[L]*(.78+.22*Math.sin(V.t*.31+i*2.1));if(L===2&&V.frx>0){const dx=(V.fx-x-w/2)/(w*.42),dy=(V.fy-y-h/2)/(h*.36),dd=dx*dx+dy*dy;if(dd<1){const u=1-dd,f=WX7.face.bank;a*=1-(1-f)*u*u*(3-2*u);}}
      if(a*k<.01)continue;ctx.globalAlpha=a*k;ctx.drawImage(sp,x,y,w,h);d++;}}
  V.n+=d;W7.stats.banks+=d;}
// ----- one weather at weight k. V.gr: the ground layer (puddles, ripples, splashes, settling, back banks, shimmer); V.air: the tint and
// everything in the air. The world draws both at once; battles draw the ground under the units and the air over them -----
function w7Paint(ctx,w,k,V){const q=V.q,t=V.t,W=V.W,H=V.H,nt=V.night,ov=V.mode==='ov',bt=V.mode==='bt',gr=V.gr&&q.ground>0&&!ov,soft=q.soft>0,air=V.air,c=(n)=>w7Cnt(V,n);
  if(w==='rain'||w==='storm'){const st=w==='storm',R=q.rain,sl=st?.34:.16,m=st?1.35:1;
    if(gr){if(bt){w7Grad(ctx,V,V.gy-2,H,'rgba(60,90,140,0)','rgba(150,180,225,1)',.14*k);ctx.fillStyle='rgba(210,222,245,1)';for(let i=0;i<3;i++){const y=Math.round(V.gy+3+i*(i+2)*2);ctx.globalAlpha=.035*k;ctx.fillRect(0,y-1,W,3);ctx.globalAlpha=.035*k;ctx.fillRect(0,y,W,1);}}// v0.8.0: soft sheen bands (were hard 1 px lines across the stage)
      w7Puddles(ctx,V,k);w7Splash(ctx,V,Math.round(c(q.ground>1?40:24)*(st?1.3:1)),k);}
    if(!air)return;
    w7Tint(ctx,V,st?'rgb(16,20,44)':'rgb(26,36,64)',(ov?.12:st?.28:.17)*k);if(soft&&!bt)w7Grad(ctx,V,0,H*.5,'rgba(150,165,195,1)','rgba(150,165,195,0)',(ov?.12:.18)*k);
    const fc=w7Col([184,199,224],[122,137,168],nt),rgb=w7Rgb([205,222,250],[150,165,200],nt);
    if(!ov){w7Fall(ctx,V,c(R[0]*m),w7F({s:211,vx:420*sl,vy:420,par:WX7.par[0],w:1,h:4,col:fc,a:.42}),k,0);
      w7Fall(ctx,V,c(R[1]*m),w7F({s:214,vx:640*sl,vy:640,par:1,spr:w7Streak(9,1,sl,rgb,.95),a:.7}),k,1);}
    if(soft)w7Fall(ctx,V,c(R[2]*m),w7F({s:217,vx:1000*sl,vy:1000,par:WX7.par[2],mg:30,spr:w7Streak(q.soft>1?24:20,3,sl,rgb,.8),a:ov?.38:.42}),k,2);
    if(st){const S=w7Strike(V.ms);W7.stats.flash=Math.max(W7.stats.flash,S.f*k);if(S.k>=0){w7Bolt(ctx,V,S,k);if(S.f>0)w7Tint(ctx,V,'rgb(226,232,255)',S.f*k*(ov?.6:1));}}
    return;}
  if(w==='snow'||w==='blizzard'){const bz=w==='blizzard',S=q.snow,m=bz?1.6:1,g=bz?w7Gust(t):0,wind=bz?150+g*120:14;
    if(gr)w7Settle(ctx,V,c(q.ground>1?40:26),k,w7Col([255,255,255],[184,200,232],nt),2.4);
    if(!air)return;
    w7Tint(ctx,V,bz?'rgb(226,236,252)':'rgb(208,226,255)',(bz?(ov?.1:.16)+g*.12:(ov?.05:.08))*k);
    const fc=w7Col([242,247,255],[196,210,238],nt),rgb=w7Rgb([255,255,255],[200,214,240],nt);
    if(!ov){w7Fall(ctx,V,c(S[0]*m),w7F({s:221,vx:wind*.7,vy:bz?70:16,par:WX7.par[0],w:1,h:1,col:fc,a:.6,sway:bz?1:3,swayF:.9}),k,0);
      w7Fall(ctx,V,c(S[1]*m),w7F({s:224,vx:wind,vy:bz?100:28,par:1,spr:soft?w7Dot('sm'+rgb,1.8,rgb,.95):null,w:2,h:2,col:fc,a:.9,sway:bz?2:5,swayF:1.3}),k,1);}
    if(soft)w7Fall(ctx,V,c(S[2]*m),w7F({s:227,vx:wind*1.5,vy:bz?150:52,par:WX7.par[2],mg:24,spr:w7Dot('sn'+rgb,q.soft>1?4.5:3.6,rgb,.75),a:.6,sway:bz?3:8,swayF:.8}),k,2);
    if(bz&&soft)w7Banks(ctx,V,k*(.5+g*.8),[0,2,3],w7Col([244,248,255],[190,205,235],nt),{flat:1,sc:[1,1.7,2.6],v:[0,240,420],a:[0,.7,.6],y0:bt?V.gy-60:null,y1:bt?H:null});
    return;}
  if(w==='fog'){// v0.8.0: ground fog. Banks lie on the ground (fogPar), the colour follows the time of day smoothly (darker and less dense by
    // night, so it never washes a night scene out), feathered banks (no box edges). In the HD-2D overlay only a faint even veil: the
    // GL scene has the lit banks and the distance fog, a 2D bank sliding over the 3D ground would not belong to it.
    const col=w7Col([222,227,236],[86,98,128],nt),B=q.banks,par=WX7.fogPar,dn=1-.3*nt;
    if(V.gr&&!ov&&soft)w7Banks(ctx,V,k*dn,[B[0],B[1],0],col,{par,sc:[.9,1.25,1],v:[4,8,0],a:[.36,.4,0],y0:bt?V.gy-46:null,y1:bt?V.gy+30:null});
    if(!air)return;
    if(!soft){for(let i=0;i<B[0];i++){const x=Math.floor(W7M(t*6+i*90-V.ox,W+160)-80),y=Math.floor(H*(.15+i*.14)-W7M(V.oy,H*.14));ctx.globalAlpha=k;ctx.drawImage(fogSprite(),x-70,y-70);}V.n+=B[0];W7.stats.banks+=B[0];}
    w7Tint(ctx,V,col,(ov?.035:soft?.1:.18)*k*dn);
    if(soft&&!ov)w7Banks(ctx,V,k*dn,[0,0,B[2]],col,{par,sc:[1,1,bt?2.2:1.9],v:[0,0,14],a:[0,0,.34],y0:bt?V.gy:null,y1:bt?H+30:null});
    return;}
  if(w==='gale'){const Wd=q.wind,g=w7Gust(t);if(!air)return;
    if(!ov){w7Fall(ctx,V,c(Wd[0]),w7F({s:231,vx:300,vy:0,par:WX7.par[0],w:6,h:1,col:'#ffffff',a:.32,sway:2,swayF:3}),k,0);
      w7Fall(ctx,V,c(Wd[1]),w7F({s:234,vx:460,vy:12,par:1,spr:w7Spr('gw',16,1,(x)=>{const gg=x.createLinearGradient(0,0,16,0);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(1,'rgba(255,255,255,.9)');x.fillStyle=gg;x.fillRect(0,0,16,1);}),a:.55,sway:3,swayF:2.6}),k,1);
      w7Fall(ctx,V,c(6),w7F({s:237,vx:230,vy:30,par:1,w:2,h:1,col:'#7aa040',a:1,sway:10,swayF:4,flip:true}),k,1);w7Fall(ctx,V,c(4),w7F({s:240,vx:200,vy:26,par:1,w:2,h:1,col:'#a8863a',a:1,sway:12,swayF:3.4,flip:true}),k,1);}
    if(soft)w7Fall(ctx,V,c(Wd[2]),w7F({s:243,vx:760,vy:20,par:WX7.par[2],mg:40,spr:w7Spr('gwn',34,2,(x)=>{const gg=x.createLinearGradient(0,0,34,0);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(.8,'rgba(255,255,255,.7)');gg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gg;x.fillRect(0,0,34,2);}),a:.28+g*.25,sway:4,swayF:2}),k,2);
    return;}
  if(w==='sand'){const S=q.sand,g=w7Gust(t);if(!air)return;
    w7Grad(ctx,V,0,H,'rgba(214,170,100,1)','rgba(200,150,90,1)',(ov?.12:.2)*k+g*.08*k);
    if(!ov){w7Fall(ctx,V,c(S[0]),w7F({s:251,vx:260,vy:18,par:WX7.par[0],w:1,h:1,col:'#e6c890',a:.55,sway:3,swayF:2.2}),k,0);
      w7Fall(ctx,V,c(S[1]),w7F({s:254,vx:360,vy:26,par:1,w:2,h:1,col:'#f2d8a2',a:.75,sway:5,swayF:1.9}),k,1);}
    if(soft){w7Fall(ctx,V,c(S[2]),w7F({s:257,vx:560,vy:40,par:WX7.par[2],mg:20,spr:w7Dot('gr',2.6,'236,200,140',.7),a:.55,sway:6,swayF:1.4}),k,2);
      w7Banks(ctx,V,k*(.3+g*.9),[0,2,2],'rgb(222,180,116)',{flat:1,sc:[1,1.5,2.2],v:[0,200,380],a:[0,.6,.5],y0:bt?V.gy-50:null,y1:bt?H:null});}
    return;}
  if(w==='heat'){
    if(V.gr&&!ov&&q.shimmer&&soft&&!V.still){const y0=bt?V.gy-34:0,y1=bt?V.gy+10:H*.42;w7Shimmer(ctx,V,y0,y1,.7*k);/* v0.10.0: half the sway, it was disorienting */}
    if(V.gr&&bt){ctx.globalAlpha=.16*k;ctx.fillStyle='rgba(255,236,200,1)';for(let i=0;i<3;i++){const y=V.gy-6-i*7;for(let x=0;x<W;x+=6)ctx.fillRect(x,Math.round(y+Math.sin(x*.09+t*3+i)*1.5),6,1);}}
    if(!air)return;
    w7Grad(ctx,V,bt?V.gy-40:0,H,bt?'rgba(255,200,120,0)':'rgba(255,200,120,1)','rgba(255,140,60,1)',(ov?.04:.07)*k);// v0.8.0: in battle it fades in (was a hard line at gy-40)
    w7Fall(ctx,V,c(soft?18:10),w7F({s:261,vx:0,vy:-14,par:1,w:1,h:3,col:'rgba(255,226,190,1)',a:.28,sway:2,swayF:3,top:bt?V.gy:0}),k,1);
    return;}
  if(w==='ashfall'){const A=q.ash;
    if(gr)w7Settle(ctx,V,c(20),k,'#7a7070',3.2);
    if(!air)return;
    w7Tint(ctx,V,'rgb(58,48,46)',(ov?.08:.15)*k);
    if(!ov){w7Fall(ctx,V,c(A[0]),w7F({s:271,vx:6,vy:12,par:WX7.par[0],w:1,h:1,col:'#5e5656',a:.7,sway:4,swayF:.8}),k,0);
      w7Fall(ctx,V,c(A[1]),w7F({s:274,vx:9,vy:20,par:1,w:2,h:1,col:'#9a9090',a:.85,sway:7,swayF:1.1,flip:true}),k,1);}
    const ec=c(soft?(q.soft>1?14:9):5),emb=soft?w7Dot('emb',3,'255,150,60',.9):null;
    ctx.globalCompositeOperation='lighter';w7Fall(ctx,V,ec,w7F({s:277,vx:8,vy:-10,par:1,spr:emb,w:1,h:1,col:'#ff7a3a',a:.55+.35*Math.sin(t*7),sway:9,swayF:1.7}),k,1);ctx.globalCompositeOperation='source-over';
    if(soft)w7Fall(ctx,V,c(A[2]),w7F({s:280,vx:14,vy:34,par:WX7.par[2],mg:20,spr:w7Dot('ash',3.4,'150,140,138',.75),a:.55,sway:10,swayF:.7}),k,2);
    return;}
  if(w==='aurora'){if(!air)return;const top=bt?V.gy*.9:ov?H*.42:H*.4,cols=['90,255,170','140,120,255','90,220,255'],st=soft?3:4;
    w7Grad(ctx,V,0,top,'rgba(40,120,110,1)','rgba(40,120,110,0)',.16*k);
    for(let L=0;L<3;L++){const rb=w7Ribbon(cols[L]),ox=V.ox*(.4+L*.1);for(let x=-st;x<W+st;x+=st){const u=x+ox,y=top*.05+L*top*.12+Math.sin(u/26+t*.5+L)*top*.1+Math.sin(u/9+t*1.3)*2,h=top*(.5+.18*Math.sin(u/40+t*.7+L*2));
      const hk=Math.min(w7Soft(V,x,y+h*.35,0),w7Soft(V,x,y+h*.6,0));if(hk<.03)continue;ctx.globalAlpha=k*hk*(.34+.22*Math.sin(u/34+t*.9+L*1.7))*(L===1?.75:1);ctx.drawImage(rb,x,y,st,h);}V.n++;W7.stats.rib=(W7.stats.rib||0)+Math.ceil(W/st);}
    return;}
  if(w==='starfall'||w==='meteor'){if(!air)return;const mt=w==='meteor',top=bt?V.gy*.95:ov?H*.45:H;
    w7Tint(ctx,V,mt?'rgb(20,14,40)':'rgb(18,16,60)',.1*k);
    const tw=w7Cnt(V,q.stars);for(let i=0;i<tw;i++){const x=W7M(w7H(i,291)*(W+20)-V.ox*.5,W+20)-10,y=W7M(w7H(i,292)*top-V.oy*.5,top),a=.35+.5*Math.max(0,Math.sin(t*(1.3+w7H(i,293))+i*2.3));
      const hk=w7Soft(V,x,y,0);if(hk<.03)continue;ctx.globalAlpha=a*k*hk;ctx.fillStyle=i%5?'#e8e6ff':'#fff2c0';ctx.fillRect(Math.round(x),Math.round(y),1,1);}V.n+=tw;
    const n=mt?6:8,head=w7Dot(mt?'mh':'sh',mt?3.4:2.4,mt?'255,236,180':'255,250,230',1);let d=0;
    for(let j=0;j<n;j++){const P=(mt?3.4:2.6)+w7H(j,294)*2,ph=t/P+w7H(j,295),c=Math.floor(ph),a=ph-c,life=mt?.42:.3;if(a>life||!t)continue;const u=a/life;
      const ang=(mt?.75:.5)+w7H(c*7+j,296)*.35,dx=Math.cos(ang),dy=Math.sin(ang),trav=(mt?140:180)*(.7+.5*w7H(c+j,297)),len=(mt?60:40)*(.6+.6*w7H(c*3+j,298));
      const x=w7H(c*13+j,299)*W*1.2-W*.1+dx*trav*u,y=w7H(c*11+j,300)*top*.6+dy*trav*u;if(y>top+20)continue;
      const hk=Math.min(w7Soft(V,x,y,0),w7Soft(V,x-dx*len*.5,y-dy*len*.5,0));if(hk<.03)continue;
      const fa=Math.sin(u*Math.PI)*k*hk,gx=ctx.createLinearGradient(x,y,x-dx*len,y-dy*len);gx.addColorStop(0,mt?'rgba(255,220,150,.95)':'rgba(255,250,225,.95)');gx.addColorStop(.35,mt?'rgba(255,130,50,.6)':'rgba(200,160,255,.45)');gx.addColorStop(1,'rgba(160,120,255,0)');
      ctx.globalAlpha=fa;ctx.strokeStyle=gx;ctx.lineWidth=mt?2.2:1.3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-dx*len,y-dy*len);ctx.stroke();
      ctx.globalCompositeOperation='lighter';ctx.drawImage(head,x-head.width/2,y-head.height/2);ctx.globalCompositeOperation='source-over';d++;}V.n+=d;W7.stats.layers[2]+=d;
    return;}
}
// the rare skies kept from v0.4.0 (world3.js), drawn like before (a view sized layer that scrolls with the world), faded by k
const W7_OLD={cv:null};
function w7Legacy(ctx,w,k,V,now){if(!V.air)return;const f=W7.old;if(!f)return;
  if(V.mode==='bt'){if(k>=.999)return f(ctx,w,V.W,V.H,now,true);}
  let c=W7_OLD.cv;if(!c||c.width!==V.W||c.height!==V.H)c=W7_OLD.cv=mkCv(V.W,V.H);const o=c.getContext('2d');o.setTransform(1,0,0,1,0,0);o.globalAlpha=1;o.globalCompositeOperation='source-over';o.clearRect(0,0,V.W,V.H);
  if(V.mode==='bt')f(o,w,V.W,V.H,now,true);else wfxTiled(o,V.W,V.H,V.ox,V.oy,cc=>f(cc,w,V.W,V.H,now,false));ctx.globalAlpha=k;ctx.drawImage(c,0,0);
  // the surge's edge glow belongs to the view, not to the scrolling layer
  const sw=typeof WEATHER!=='undefined'&&WEATHER[w]&&WEATHER[w].surge;if(sw&&V.mode!=='bt'&&typeof surgeGlow==='function'){const C={earth:'90,220,90',water:'80,170,255',fire:'255,120,50',ice:'170,230,255',wind:'220,255,230',shadow:'170,90,255'}[sw];if(C)surgeGlow(ctx,C,V.W,V.H,(.12+(Math.sin(now/1000*1.6)+1)/2*.14)*k);}}
function w7Begin(mode,W,H,ox,oy,ms){const V=W7V,S=W7.stats,still=w7Still();V.mode=mode;V.W=W;V.H=H;V.ox=ox;V.oy=oy;V.ms=still?0:ms;V.t=V.ms/1000;V.still=still;V.q=w7Q();V.n=0;V.gr=true;V.air=true;V.hx0=V.hx1=0;V.frx=0;V.gy=0;
  V.area=Math.max(.55,Math.min(1.8,W*H/(420*320)));S.mode=mode;S.n=0;S.layers[0]=S.layers[1]=S.layers[2]=0;S.ground=S.banks=S.shimmer=S.bolt=0;S.flash=0;return V;}
function w7Run(ctx,V,L,now){ctx.save();try{ctx.globalCompositeOperation='source-over';for(const [w,k] of L){if(k<=.002)continue;if(W7_OWN[w])w7Paint(ctx,w,k,V);else w7Legacy(ctx,w,k,V,now);}}
  finally{ctx.restore();}W7.stats.n=Math.min(V.n,1e6);W7.stats.w=L.map(x=>x[0]).join('+');}
// the face and body ellipses from the hero's box (top of the box = top of his head)
function w7FaceOf(V){const F=WX7.face,w=V.hx1-V.hx0,h=V.hy1-V.hy0;V.fx=(V.hx0+V.hx1)/2;V.fy=V.hy0+h*F.y;V.frx=Math.max(6,w*F.rx);V.fry=Math.max(6,h*F.ry);
  V.bx=V.fx;V.by=V.hy0+h*.55;V.brx=Math.max(8,w*.7);V.bry=Math.max(8,h*.62);}
// ----- the world: 2D renderer (mode 'w2d', camera cx, cy) and the HD-2D overlay (mode 'ov', ox, oy: the ground's screen motion) -----
function w7World(ctx,mode,m,ox,oy,vw,vh,now){if(!WX7.on)return false;if(W7.rec)W7.rec(true);try{const L=w7List(m);const V=w7Begin(mode,vw,vh,ox,oy,now);V.m=m;V.night=w7Night();
    if(mode==='w2d'){const hx=Math.round(WS.px)+8-ox,hy=Math.round(WS.py)+16-oy,P=WX7.heroPad,H=WFX.hero;V.hx0=hx-H[0]-P;V.hx1=hx+H[0]+P;V.hy0=hy-H[1]-P;V.hy1=hy+H[2]+P;}
    else if(typeof HW!=='undefined'&&HW.b){const B=HW.b,P=WX7.heroPad;V.hx0=(B[0]+1)/2*vw-P;V.hx1=(B[2]+1)/2*vw+P;V.hy0=(1-B[3])/2*vh-P;V.hy1=(1-B[1])/2*vh+P;}
    if(V.hx1>V.hx0)w7FaceOf(V);W7.stats.face=V.frx>0?[V.fx,V.fy,V.frx,V.fry,WX7.face.core]:null;// tests: the face ellipse (view px)
    // fewer particles in a blend so the sum stays near one weather's count
    if(L.length)w7Run(ctx,V,L,now);else{W7.stats.n=0;W7.stats.w='';}return true;}catch(e){W7.err=String(e&&e.stack||e).slice(0,300);return false;}finally{if(W7.rec)W7.rec(false);}}
// ----- battle: the ground layer under the units (battle.js), everything else after them (weatherFX) -----
function w7BattleV(W,H,now){const V=w7Begin('bt',W,H,0,0,now);V.gy=bgGY(H);V.area=Math.min(V.area,.9);// the battle canvas redraws all of its units every frame: a lighter share
  let out=true;try{out=!(typeof battleIndoors==='function'&&battleIndoors());}catch(e){}
  V.night=0;if(out){try{const p=clockPhase();V.night=p==='night'?1:p==='dusk'?.35:p==='dawn'?.25:0;}catch(e){}}return V;}
function w7BattleGround(ctx,W,H,now){if(!WX7.on||!B||!B.weather||B.weather==='clear')return;try{const V=w7BattleV(W,H,now);V.gr=true;V.air=false;W7.bL=[[B.weather,1]];w7Run(ctx,V,W7.bL,now);W7.stats.btGround=W7.stats.ground;}catch(e){W7.err=String(e&&e.stack||e).slice(0,300);}}
// ----- hooks -----
{const f0=weatherFX;W7.old=f0;weatherFX=function(ctx,w,W,H,now,battle){if(!battle||!WX7.on)return f0.apply(this,arguments);
  try{const V=w7BattleV(W,H,now);V.gr=false;V.air=true;W7.bL=[[w,1]];w7Run(ctx,V,W7.bL,now);return;}catch(e){W7.err=String(e&&e.stack||e).slice(0,300);}return f0.apply(this,arguments);};}
// ----- HD-2D: weather inside the GL scene (world positions, lit, depth tested), the wet grade, the lightning light, the heat shimmer -----
// v0.8.0: hdWfxEmit fades a quad by the feathered ellipse around the hero's face (hdFaceK) instead of dropping every quad in his box;
// the test counter (W7.dbg) counts quads drawn inside the ellipse's core (there must be none) and quads drawn over the rest of his box
function w7Emit(x,z,h,w,hh,c,a,g){const n=HW.n;hdWfxEmit(x,z,h,w,hh,c,a,g);
  if(W7.dbg&&HW.n>n&&Math.abs(x-HW.hx)<44&&z>HW.hz-8){const p=HW.p;h2Proj(p,HD.mats.vp,x,(h+hh/2)*HD.S.V,z);if(hdFaceK(p[0],p[1])<.02)W7.dbg.hits++;else if(w7HdHero(x,z,h+hh/2))W7.dbg.body=(W7.dbg.body||0)+1;}}
function w7HdHero(x,z,h){const p=HW.p,Bx=HW.b;h2Proj(p,HD.mats.vp,x,h*HD.S.V,z);return p[0]>Bx[0]&&p[0]<Bx[2]&&p[1]>Bx[1]&&p[1]<Bx[3];}
// ground decals fade out under the hero's feet (a soft disc in world units, the GL depth test does the rest), never a box
function w7Dec(bt,key,cv,x,z,w,d,r,g,b,a,y){const R=HD.lmR;if(x<R[0]||x>R[0]+R[2]||z<R[1]||z>R[1]+R[3])return;{const e=Math.hypot(x-HW.hx,(z-HW.hz)*1.6)/16;if(e<1)a*=e*e*(3-2*e);}if(a<3)return;hdDecal(bt,key,cv,x,z,w,d,r,g,b,Math.min(255,a|0),y);W7.stats.glG++;}
function w7Bill(key,cv,x,h,z,sc,r,g,b,a){const R=HD.lmR;if(x<R[0]-120||x>R[0]+R[2]+120||z<R[1]||z>R[1]+R[3]+40)return;if(a<3)return;hdBill(HD.dynB,key,cv,x,h,z,false,sc,r,g,b,Math.min(255,a|0),0);W7.stats.gl++;}
// a bank (billboard, bw x bh world px) in front of the hero thins where it covers his face: by the face's distance inside the bank's
// footprint on screen, down to WX7.face.bank of its alpha. v0.7.7 faded every bank by its centre's distance to him (to nothing within
// a quarter of the view), which carried a clear bubble around him wherever he walked; banks behind him are hidden by his sprite anyway
function w7BankFade(x,h,z,bw,bh){if(z<HW.hz-2)return 1;const p=HW.p,Bx=HW.b,V=HD.S.V,yc=(h+bh*.5)*V;h2Proj(p,HD.mats.vp,x,yc,z);const px=p[0],py=p[1];h2Proj(p,HD.mats.vp,x+bw*.5,yc,z);
  const rx=Math.max(.02,Math.abs(p[0]-px)*.8),ry=rx*(HD.asp||1)*(bh/bw)*1.1,fx=(Bx[0]+Bx[2])/2,fy=Bx[3]-(Bx[3]-Bx[1])*WX7.face.y,dx=(fx-px)/rx,dy=(fy-py)/ry,dd=dx*dx+dy*dy;
  if(dd>=1)return 1;const u=1-dd;return 1-(1-WX7.face.bank)*u*u*(3-2*u);}
function w7Gl(m,ts){const q=w7Q();W7.stats.gl=0;W7.stats.glG=0;W7.heat=0;if(!WX7.on||!q.gl||!m||mapIndoor(m))return;const L=w7List(m);if(!L.length)return;
  const R=HD.lmR,C=WFX.cell,Px=Math.ceil(R[2]/C)*C+C,Pz=Math.ceil((WFX.hdZ[0]+WFX.hdZ[1])/C)*C,cx=HD.cam.x,cz=HD.cam.z-(WFX.hdZ[0]-WFX.hdZ[1])/2,t=ts/1000,A=Px*Pz/WX7.glRef*q.glN,G7=WX7.gl,o=H2L;
  const lum=Math.min(1,.3+((o.amb[0]+o.amb[1]+o.amb[2])/3+(o.sun[0]+o.sun[1]+o.sun[2])/3)*.75),n0=HW.n;let budget=q.glCap;
  const cnt=v=>{const n=Math.min(budget,Math.round(v*A));budget-=n;return n;};
  const put=(x,z,h,w,hh,c,a,g)=>w7Emit(wfxW(x,cx,Px),wfxW(z,cz,Pz),h,w,hh,c,a,g);
  const rip=w7Ripple(),pud=w7Puddle(),spec=w7Spec();
  for(const [w,k] of L){
    if(w==='rain'||w==='storm'){const st=w==='storm',n=cnt(st?G7.storm:G7.rain),H0=84,sp=st?380:300,wx=st?.3:.12,lq=Math.max(.5,Math.round(lum*8)/8),col=`rgb(${190*lq|0},${206*lq|0},${236*lq|0})`;
      for(let i=0;i<n;i++){const ph=t*sp/H0+w7H(i,501),c=Math.floor(ph),f=ph-c,bx=w7H(i*131+c,502)*Px,bz=w7H(i*137+c,503)*Pz,h=H0*(1-f);
        put(bx-wx*h,bz,h,1,9,col,.6*k,1);
        if(f<.14&&q.ground){const px=w7H(i*131+c-1,502)*Px,pz=w7H(i*137+c-1,503)*Pz,a=f/.14,X=wfxW(px,cx,Px),Z=wfxW(pz,cz,Pz);
          w7Dec(HD.dynB,'w7rip',rip,X,Z,3+a*9,(3+a*9)*.42,220*lum,232*lum,255*lum,(1-a)*150*k,.5);if(a<.6){put(px-1-a*3,pz,a*4,1,1,'#dce8ff',(1-a)*.7*k,0);put(px+1+a*3,pz,a*3.5,1,1,'#dce8ff',(1-a)*.7*k,0);}}}
      // puddles with a sky glint and rings from the drops, on open ground near the camera
      if(q.ground){const Cc=44,x0=Math.floor(R[0]/Cc),x1=Math.floor((R[0]+R[2])/Cc),z0=Math.floor(R[1]/Cc),z1=Math.floor((R[1]+R[3])/Cc);let np=0;
        for(let gz=z0;gz<=z1;gz++)for(let gx=x0;gx<=x1;gx++){const p=w7PudAt(m,gx,gz);if(!p||np>60)continue;np++;const s=p[2];
          w7Dec(HD.dynB,'w7pud',pud,p[0],p[1],32*s,12*s,255*Math.max(.45,lum),255*Math.max(.45,lum),255*Math.max(.5,lum),210*k,.45);
          w7Dec(HD.dynA,'w7spec',spec,p[0]-4*s,p[1]-1.5*s,14*s,4*s,200*lum,215*lum,255*lum,90*k*lum,.55);
          for(let r=0;r<2;r++){const ph=t/.95+w7H(gx*3+gz*7+r,505),a=ph-Math.floor(ph),c=Math.floor(ph),rx=p[0]+(w7H(c*7+gx+r,506)-.5)*12*s,rz=p[1]+(w7H(c*5+gz+r,507)-.5)*3*s,rw=2+a*9*s;
            w7Dec(HD.dynB,'w7rip',rip,rx,rz,rw,rw*.4,230*lum,238*lum,255*lum,(1-a)*170*k,.5);}}}
      if(st){const S=w7Strike(ts||0);if(S.f>0)W7.stats.flash=Math.max(W7.stats.flash,S.f*k);}
      continue;}
    if(w==='snow'||w==='blizzard'){const bz=w==='blizzard',n=cnt(bz?G7.blizzard:G7.snow),H0=70,sp=bz?70:26,g=bz?w7Gust(t):0,wx=bz?2.2+g:.25,col=lum<.55?'#aab8d8':'#ffffff';
      for(let i=0;i<n;i++){const ph=t*sp*(1+.3*w7H(i,511))/H0+w7H(i,512),c=Math.floor(ph),f=ph-c,bx=w7H(i*131+c,513)*Px,bz2=w7H(i*137+c,514)*Pz,h=H0*(1-f),sw=Math.sin(t*1.3+i*1.9)*(bz?2:5);
        put(bx-wx*h+sw,bz2,h,bz?(i%3?2:3):(i%4?1:2),bz?.8:(i%4?.8:1.5),col,(bz?.75:.95)*k,0);
        if(q.ground&&f<.45&&!bz){const px=w7H(i*131+c-1,513)*Px,pz=w7H(i*137+c-1,514)*Pz;put(px+Math.sin(t*1.3+i*1.9)*5,pz,.15,1,1,col,(1-f/.45)*.8*k,0);}}
      if(bz){const nb=cnt(14*G7.bank);for(let i=0;i<nb;i++){const x=w7H(i,515)*Px+t*(160+g*140),z=w7H(i,516)*Pz,h=4+w7H(i,517)*26,X=wfxW(x,cx,Px),Z=wfxW(z,cz,Pz),sc=1.1+w7H(i,518)*.8,cv=w7Bank(1),fd=w7BankFade(X,h,Z,cv.width*sc,cv.height*sc);
        w7Bill('w7gust',cv,X,h,Z,sc,240,246,255,(70+g*110)*k*fd);}}
      continue;}
    if(w==='fog'||w==='sand'){const fog=w==='fog',nb=cnt((fog?16:14)*G7.bank*(q.banks[2]>2?1.05:1)),g=fog?0:w7Gust(t),sp=fog?7:150+g*120,cv=w7Bank(fog?0:1);
      for(let i=0;i<nb;i++){const x=w7H(i,521)*Px+t*sp*(1+.25*w7H(i,522)),z=w7H(i,523)*Pz,h=fog?-2+w7H(i,524)*14:1+w7H(i,524)*24,X=wfxW(x,cx,Px),Z=wfxW(z,cz,Pz),sc=fog?1.4+w7H(i,525)*1.1:1.3+w7H(i,525)*.9,fd=w7BankFade(X,h,Z,cv.width*sc,cv.height*sc);
        const br=Math.sin(t*.3+i*2.1)*.15+.85;w7Bill(fog?'w7fog':'w7gust',cv,X,h,Z,sc,fog?235:240,fog?238:206,fog?244:150,(fog?150:120+g*110)*br*k*fd);}
      if(!fog){const n=cnt(G7.sand);for(let i=0;i<n;i++){const x=w7H(i,526)*Px+t*(280+g*160)*(1+.4*w7H(i,527)),z=w7H(i,528)*Pz,h=1+w7H(i,529)*26+Math.sin(t*2+i)*2;put(x,z,h,i%3?3:5,.8,i%2?'#f6e2b4':'#e6c48a',.9*k,0);}}
      continue;}
    if(w==='gale'){const n=cnt(G7.gale),g=w7Gust(t);for(let i=0;i<n;i++){const x=w7H(i,531)*Px+t*(320+g*200),z=w7H(i,532)*Pz,h=8+w7H(i,533)*44+Math.sin(t*3+i)*2;put(x,z,h,10+(i%4)*3,1,'#ffffff',.32*k,0);}
      const nl=cnt(G7.leaf);for(let i=0;i<nl;i++){const x=w7H(i,534)*Px+t*240+Math.sin(t*4+i)*10,z=w7H(i,535)*Pz+Math.cos(t*2+i)*6,h=3+w7H(i,536)*28+Math.sin(t*5+i)*4,fl=Math.floor(t*4+i)%2;put(x,z,h,fl?2:1,fl?1:2,i%3?'#7aa040':'#a8863a',k,0);}
      continue;}
    if(w==='ashfall'){const n=cnt(G7.ash);for(let i=0;i<n;i++){const H0=64,ph=t*14*(1+.4*w7H(i,541))/H0+w7H(i,542),c=Math.floor(ph),f=ph-c,fl=Math.floor(t*2.5+i)%2;
        put(w7H(i*131+c,543)*Px+Math.sin(t*.9+i)*7,w7H(i*137+c,544)*Pz,H0*(1-f),fl?2:1,fl?1:2,i%5?'#8a8080':'#5a5252',.85*k,0);}
      const ne=cnt(G7.ember);for(let i=0;i<ne;i++){const H0=50,h=(t*9*(1+.5*w7H(i,545))+w7H(i,546)*H0)%H0,a=.5+.45*Math.sin(t*7+i*3);put(w7H(i,547)*Px+Math.sin(t*1.7+i)*9,w7H(i,548)*Pz,h,1,1,i%3?'#ff8a3a':'#ffd070',a*Math.min(1,(H0-h)/10)*k,1);}
      continue;}
    if(w==='heat'){W7.heat=Math.max(W7.heat,k*q.shimmer);const n=cnt(G7.heat);for(let i=0;i<n;i++){const H0=26,h=(t*10*(1+.5*w7H(i,551))+w7H(i,552)*H0)%H0;put(w7H(i,553)*Px+Math.sin(t*3+i)*2,w7H(i,554)*Pz,h,1,4,'#ffe6c0',.18*Math.sin(h/H0*Math.PI)*k,1);}
      continue;}}
  W7.stats.gl+=HW.n-n0;}
{const w0=hdWfx;hdWfx=function(m,ts){w0.apply(this,arguments);try{w7Gl(m,ts);}catch(e){W7.err=String(e&&e.stack||e).slice(0,300);}};}
// the wet grade (rain), the lightning light (storm) on the HD-2D scene
function w7Look(o,m,now){if(!WX7.on||!m||mapIndoor(m))return;const L=w7List(m);let wet=0,f=0;
  for(const [w,k] of L){if(w==='rain'||w==='storm')wet+=k*(w==='storm'?1.2:1);if(w==='storm'){const S=w7Strike(w7Still()?0:now);f=Math.max(f,S.f*k);}}
  if(wet>0){o.sat*=1-.1*wet;o.con*=1+.07*wet;o.exp*=1-.05*wet;o.bloom+=.15*wet;}
  if(f>0){const b=WX7.bolt.light*f;o.amb[0]+=b*.85;o.amb[1]+=b*.9;o.amb[2]+=b;o.exp*=1+f*.25;}W7.stats.hdFlash=f;}
HOOK.after('hdLook','weather7','weather grade',function(o,m,now){try{w7Look(o,m,now);}catch(e){}});
// heat shimmer in the composite pass (hd2d.js reads it): strength, and where it starts (above the hero's head, toward the far ground)
function w7HeatGL(){return WX7.on&&!w7Still()?W7.heat:0;}
