// ===== worldfx.js (v0.6.3): world pass: ambience in world space, opened chests vanish =====
// Until v0.6.2 the drifting ambience of the world (relit field sparkles, snow, wind streaks, butterflies, sea spray, void motes, dungeon
// dust, Phase 6 leaves, birds, dusk fireflies and dawn dew, festival lanterns) was drawn at screen positions: walking slid the whole lot
// along with the hero, and on the HD-2D view it sat on the 2D canvas over the GL frame, so a butterfly could park on the hero's face.
// Now every particle has a world position (x east, z south, h above the ground, art px): a base point on a lattice of cells about one
// view in size, plus its own motion, wrapped to the copy nearest the camera. The 2D renderer draws it at (x - cam.x, z - h - cam.y);
// the HD-2D renderer puts the same particles into its GL scene (hd2d.js hdWfx), lit and depth tested. Nothing is drawn over the hero.
// Weather and the cave and dungeon theme layers stay full screen effects but scroll with the world (wfxTiled).
// Tunables: config.js WFX. No game state is read or written apart from G.cleared, the weather and the clock (Daily Trial untouched).
const WFXC={};// css colour -> [r,g,b,a]
function wfxRgb(c){let v=WFXC[c];if(v)return v;const m=/rgba?\(([^)]+)\)/.exec(c);if(m){const a=m[1].split(',').map(Number);v=[a[0],a[1],a[2],a[3]==null?1:a[3]];}else{const h=hx(c);v=[h[0],h[1],h[2],1];}return WFXC[c]=v;}
function wfxH(i,k){let h=(i*374761393+k*668265263)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296;}
// the copy of a lattice coordinate nearest the centre c (period P)
function wfxW(v,c,P){return v+P*Math.round((c-v)/P);}
// lattice period for a view of w x h art px: whole cells, at least the view plus a margin (so wrapping happens off screen)
function wfxP(w,h,o){const C=WFX.cell,M=WFX.margin;o[0]=Math.ceil((w+M*2)/C)*C;o[1]=Math.ceil((h+M*2)/C)*C;return o;}
const WFXP=[0,0];
function wfxWind(m){try{return g6WindNow(m);}catch(e){return .35;}}
function wfxPhase(){try{return phaseProg().ph;}catch(e){return 'day';}}
// every particle of a set: emit(x, z, h, w, hh, colour, alpha, glow). Sets: 'amb' (theme ambience), 'leaf' (Phase 6 leaves and dust),
// 'day' (dusk fireflies, dawn dew). t in ms (0 under reduced motion: a still frame).
function wfxRun(set,m,ts,cxc,czc,Px,Pz,emit){if(!m||m.archive)return;const t=ts/1000,A=Px*Pz/WFX.ref,dun=m.kind==='dungeon',N=WFX.n,cnt=k=>Math.min(WFX.maxN,Math.round(k*A));
  const put=(x,z,h,w,hh,c,a,g)=>emit(wfxW(x,cxc,Px),wfxW(z,czc,Pz),h,w,hh,c,a,g);
  if(set==='amb'){
    if(m.kind==='field'&&G.cleared&&G.cleared[m.s]){const n=cnt(N.spark);for(let i=0;i<n;i++){const bx=wfxH(i,11)*Px,bz=wfxH(i,12)*Pz,tw=Math.floor(ts/200+i)%3===0;
      put(bx+t*22,bz-t*11+Math.sin(t/.7+i)*10,6+wfxH(i,13)*22,tw?3:1,1,i%3?'#fff2a0':'#ffd04a',1,1);}}
    if(!dun){const th=m.theme;
      if(th==='snow'){const n=cnt(N.snow);for(let i=0;i<n;i++){const H0=64,bx=wfxH(i,21)*Px,bz=wfxH(i,22)*Pz,sp=40*(1+(i%2)),h=H0-((t*sp+wfxH(i,23)*H0)%H0);
        put(bx+t*25*(1+i%3)*.4+Math.sin(t+i)*3,bz,h,1+(i%5===0?1:0),1,'#ffffff',h<4?h/4:1,0);}}
      if(th==='heights'){const n=cnt(N.wind);for(let i=0;i<n;i++)put(wfxH(i,31)*Px+t*83,wfxH(i,32)*Pz,18+wfxH(i,33)*30,10,1,'#ffffff',.5,0);}
      if(th==='meadow'){const n=cnt(N.fly),C=['#f6e06a','#ffffff','#f08ab0'];for(let i=0;i<n;i++){const bx=wfxH(i,41)*Px,bz=wfxH(i,42)*Pz,x=bx+Math.sin(t*.31+i*2.1)*46+Math.sin(t*1.3+i)*4,z=bz+Math.cos(t*.23+i*1.7)*30,h=7+Math.sin(t*1.9+i)*3+wfxH(i,43)*6,c=C[i%3];
        put(x,z,h,2,1,c,1,0);if(Math.floor(ts/120+i)%2){put(x-1.5,z,h+1,1,1,c,1,0);put(x+1.5,z,h+1,1,1,c,1,0);}}}
      if(th==='coast'){const n=cnt(N.spray);for(let i=0;i<n;i++)put(wfxH(i,51)*Px+t*45,wfxH(i,52)*Pz,3+wfxH(i,53)*10,6,1,'#ffffff',.35,0);}
      if(th==='void'){const n=cnt(N.mote);for(let i=0;i<n;i++){const H0=56,h=(t*25+wfxH(i,63)*H0)%H0;put(wfxH(i,61)*Px+t*20,wfxH(i,62)*Pz,h,1,1,i%2?'#c8a0ff':'#5fc9a0',Math.min(1,(H0-h)/10),1);}}}
    else{const n=cnt(N.dust),c=(DTHEME[m.theme]||DTHEME.meadow).acc;for(let i=0;i<n;i++){const H0=40,h=(t*16+wfxH(i,73)*H0)%H0;put(wfxH(i,71)*Px+t*12,wfxH(i,72)*Pz,h,1,1,c,.5*Math.min(1,(H0-h)/8),1);}}
    if(m.kind==='town'&&G.cleared&&G.cleared[m.s]){const n=cnt(N.lantern);for(let i=0;i<n;i++){const p=(ts/9000+i*.37)%1,h=p*150;
      put(wfxH(i,81)*Px+Math.sin(ts/1500+i)*8,wfxH(i,82)*Pz,h,3,4,'#ffb04a',Math.min(1,(1-p)*2),1);put(wfxH(i,81)*Px+Math.sin(ts/1500+i)*8,wfxH(i,82)*Pz-.01,h+1,1,2,'#fff0a0',Math.min(1,(1-p)*2),1);}}
    return;}
  if(set==='leaf'){const q=GFX.q;if(!q||!q.amb)return;const wind=wfxWind(m),key=dun||m.cave?'dun':m.theme,cols=G6W.amb[key]||G6W.amb.meadow,snow=m.theme==='snow',n0=dun||m.cave?Math.ceil(q.amb/2):snow?0:q.amb,n=cnt(n0);
    for(let i=0;i<n;i++){const bx=wfxH(i,91)*Px,bz=wfxH(i,92)*Pz;
      if(dun||m.cave){const H0=36,h=(t*(1+(i%3)*.6)*4+wfxH(i,93)*H0)%H0;put(bx+t*(2+i%3)+Math.sin(t*.8+i)*4,bz,h,1,1,cols[i%3],.45*Math.min(1,(H0-h)/6),0);continue;}
      const H0=52,vx=(6+(i%5)*3)*(.35+wind),vy=4+(i%4)*2+wind*2,h=H0-((t*vy+wfxH(i,93)*H0)%H0),flip=Math.floor(t*3+i)%2,coast=key==='coast';
      put(bx+t*vx+Math.sin(t*.8+i)*6,bz+Math.cos(t*.6+i*1.3)*3,h,coast?1:flip?2:1,coast?1:flip?1:2,cols[i%3],.85*Math.min(1,h/3),0);}return;}
  if(set==='day'){if(dun||m.cave)return;const ph=WFXD.ph||wfxPhase();
    if(ph==='dusk'){let q=WFXD.ph?WFXD.pq:0;if(!WFXD.ph)try{q=phaseProg().p;}catch(e){}
      if(ts&&q<.7)for(let i=0;i<3;i++){const x=wfxH(i,104)*Px+t*(22+i*5),z=wfxH(i,105)*Pz+Math.sin(ts/400+i)*4,h=96+i*10,f=Math.sin(ts/90+i*2)>0?1:0,c='rgba(30,20,40,.55)';
        put(x,z,h,2,1,c,1,0);put(x-2,z,h+1-f,2,1,c,1,0);put(x+2,z,h+1-f,2,1,c,1,0);}
      const n=cnt(Math.round(N.firefly*(.4+.6*q)));for(let i=0;i<n;i++){const a=ts===0?.45:Math.max(0,Math.sin(ts/650+i*1.3))*.8;if(a<.02)continue;
      const x=wfxH(i,101)*Px+Math.sin(ts/1700+i*1.9)*14,z=wfxH(i,102)*Pz+Math.cos(ts/2300+i*2.7)*10,h=3+wfxH(i,103)*9;put(x,z,h,4,4,'#ffec8c',a*.35,1);put(x,z+.01,h+1,2,2,'#fffac8',a,1);}}
    else if(ph==='dawn'){const n=cnt(N.dew);for(let i=0;i<n;i++){const a=ts===0?.35:Math.max(0,Math.sin(ts/900+i*2.1))*.6;if(a<.02)continue;put(wfxH(i,111)*Px,wfxH(i,112)*Pz,1,1,1,'#ffffff',a,1);}}}}
// a flock crossing now and then by day: each crossing has a world path (wrapped like the particles); emit(x, z, h, flap, shadowOnly)
function wfxBirds(m,ts,cxc,czc,Px,Pz,emit){const q=GFX.q;if(!q||!q.birds)return;let on=false;try{on=g6BirdsOn(m);}catch(e){}if(!on)return;
  const B=WFX.bird,c=Math.floor(ts/B.period),tt=ts-c*B.period;if(tt>B.dur)return;const p=tt/B.dur,wind=wfxWind(m),n=q.birds;
  const x0=wfxH(c,121)*Px-B.span/2,z0=wfxH(c,122)*Pz,dz=(wfxH(c,123)-.5)*120;
  for(let i=0;i<n;i++){const x=x0+p*B.span*(1+wind*.15)-(i%2?i*5:i*4),z=z0+p*dz+(i%2?-1:1)*Math.ceil(i/2)*4+Math.sin(ts/700+i)*2,f=Math.sin(ts/110+i*1.7)>0?1:0;
    emit(wfxW(x,cxc,Px),wfxW(z,czc,Pz),B.h,f);}}
// is a particle at (x, z, h) on screen over the hero (2D view: screen row z - h)?
function wfxOnHero(x,z,h){const H=WFX.hero,hx=Math.round(WS.px)+8,hz=Math.round(WS.py)+16,y=z-h;return Math.abs(x-hx)<H[0]&&y>hz-H[1]&&y<hz+H[2];}
// ----- the 2D view -----
const WFXD={ctx:null,cx:0,cy:0,vw:0,vh:0,n:0,ph:null,pq:0,sh:false};
function wfxEmit2D(x,z,h,w,hh,c,a){const D=WFXD,sx=Math.round(x-D.cx-w/2),sy=Math.round(z-h-D.cy-hh);if(sx<-w||sy<-hh||sx>D.vw||sy>D.vh)return;if(wfxOnHero(x,z,h))return;
  D.ctx.globalAlpha=a;D.ctx.fillStyle=c;D.ctx.fillRect(sx,sy,w,hh);D.n++;}
function wfxDraw2D(ctx,set,m,cx,cy,vw,vh,ts){const D=WFXD;D.ctx=ctx;D.cx=cx;D.cy=cy;D.vw=vw;D.vh=vh;wfxP(vw,vh,WFXP);
  try{wfxRun(set,m,ts,cx+vw/2,cy+vh/2,WFXP[0],WFXP[1],wfxEmit2D);}finally{ctx.globalAlpha=1;}}
function wfxBird2D(x,z,h,f){const D=WFXD,bx=Math.round(x-D.cx),by=Math.round(z-h-D.cy);if(D.sh){const sy=Math.round(z-D.cy);if(bx<-4||sy<-2||bx>D.vw+4||sy>D.vh+2)return;D.ctx.fillStyle='rgba(10,6,24,.14)';D.ctx.fillRect(bx-1,sy,3,1);return;}
  if(bx<-4||by<-4||bx>D.vw+4||by>D.vh+4||wfxOnHero(x,z,h))return;D.ctx.fillStyle='rgba(28,22,36,.85)';D.ctx.fillRect(bx,by,1,1);D.ctx.fillRect(bx-2,by-1+f,2,1);D.ctx.fillRect(bx+1,by-1+f,2,1);}
function wfxBirds2D(ctx,m,cx,cy,vw,vh,ts,shadow){const D=WFXD;D.ctx=ctx;D.cx=cx;D.cy=cy;D.vw=vw;D.vh=vh;D.sh=!!shadow;wfxP(vw,vh,WFXP);try{wfxBirds(m,ts,cx+vw/2,cy+vh/2,WFXP[0],WFXP[1],wfxBird2D);}finally{D.sh=false;}}
// full screen layers that should still scroll with the world (weather, cave drips, embers, spores...): drawn once into a view sized
// layer, then laid as four tiles offset by the camera (mod the view size). Their particles are already periodic in the view size, so the
// tiles join up; tints cover every pixel exactly once.
const WFXT={cv:null};
function wfxTiled(ctx,vw,vh,ox,oy,fn){let L=WFXT.cv;if(!L||L.width!==vw||L.height!==vh){L=WFXT.cv=mkCv(vw,vh);}const lc=L.getContext('2d');lc.setTransform(1,0,0,1,0,0);lc.globalAlpha=1;lc.globalCompositeOperation='source-over';lc.clearRect(0,0,vw,vh);
  fn(lc);const dx=-(((Math.round(ox)%vw)+vw)%vw),dy=-(((Math.round(oy)%vh)+vh)%vh);ctx.drawImage(L,dx,dy);if(dx)ctx.drawImage(L,dx+vw,dy);if(dy)ctx.drawImage(L,dx,dy+vh);if(dx&&dy)ctx.drawImage(L,dx+vw,dy+vh);}
// ----- opened chests vanish (WFX.chestGone): nothing is drawn for an opened chest (the 'c' tile state), and it no longer blocks the way.
// The save keeps G.chests as before (quests, vaults, keys, chestsLeft read it); the full map shows opened chests dimmed, the minimap not.
const WFX_NONE=mkCv(1,1);
let WFX_OC0=null;
{const oc0=objCanvas;WFX_OC0=oc0;objCanvas=function(th,kind){if(kind==='chestOpen'&&WFX.chestGone)return WFX_NONE;return oc0.apply(this,arguments);};}
// v0.8.3: the opening is shown before the chest goes (the owner liked it): the lid pops open with a glint, the open chest stays while the
// loot is collected (the find text), then it fades out. Drawn on top in both renderers; the tile itself is already gone from the map.
const WFX_OPEN={};window.__WFXO=WFX_OPEN;// key -> {m,x,y,th,t0,done} (window.__WFXO for tests)
{const op0=openChest;openChest=function(x,y){const m=WS.m,key=m&&m.id+':'+x+','+y,was=!!(G&&G.chests&&key&&G.chests[key]);const r=op0.apply(this,arguments);
  try{if(!was&&key&&G.chests[key]&&WFX.chestGone)WFX_OPEN[key]={m:m.id,x,y,th:m.theme,t0:performance.now(),done:0};}catch(e){}return r;};}
function wfxChestAnims(now,draw){const T=WFX.chestAnim||{open:320,hold:250,fade:450};for(const k in WFX_OPEN){const o=WFX_OPEN[k];if(!WS.m||WS.m.id!==o.m){delete WFX_OPEN[k];continue;}
  const busy=!!(WS.dlg||V.modal),age=now-o.t0;if(!busy&&age>T.open&&!o.done)o.done=now;
  const fa=o.done?Math.max(0,1-(now-o.done-T.hold)/T.fade):1;if(fa<=0){delete WFX_OPEN[k];continue;}
  const open=age>=T.open*.45,cv=WFX_OC0(o.th,open?'chestOpen':'chest'),jig=!open&&!gfxStill()?Math.round(Math.sin(age/26)):0,glint=open&&age<T.open+260;
  draw(o,cv,fa,jig,glint);}}
HOOK.after('worldDraw','worldfx','world-space ambience',function(_,now){try{if(typeof hdActive==='function'&&hdActive())return;const ctx=WS.ctx,cx=Math.round(WS.cam.x),cy=Math.round(WS.cam.y);
  wfxChestAnims(performance.now(),(o,cv,fa,jig,glint)=>{const px=o.x*TS-cx-1+jig,py=o.y*TS-cy+16-cv.height;ctx.save();ctx.globalAlpha=fa;ctx.drawImage(cv,px,py);
    if(glint){ctx.fillStyle='rgba(255,236,160,.9)';ctx.fillRect(px+7,py-2,2,2);ctx.fillRect(px+3,py+1,1,1);ctx.fillRect(px+12,py,1,1);}ctx.restore();});}catch(e){}});
{const ha0=hdActors;hdActors=function(m,now,ts){const r=ha0.apply(this,arguments);try{const V=HD.S.V;
  wfxChestAnims(performance.now(),(o,cv,fa,jig,glint)=>{hdChar(HD.dyn,cv,o.x*TS+8+jig,0,o.y*TS+12,false,Math.round(255*fa),0,1);});}catch(e){}return r;};}
{const sa0=solidAt;solidAt=function(m,x,y){if(WFX.chestGone&&m&&m.t&&tileAt(m,x,y)==='c'){const r=m.t[y]&&m.t[y][x];if((r==='C'||r==='K')&&G&&G.chests&&G.chests[m.id+':'+x+','+y])return m.npcs.some(n=>n.x===x&&n.y===y)||dynActors(m).some(a=>a.x===x&&a.y===y);}return sa0.apply(this,arguments);};}
// the ground under a chest is painted like the ground around it (it showed as an odd pale patch once the opened chest was gone)
{const dt0=drawTile;drawTile=function(ctx,m,x,y,fr){const r=WFX.chestGone&&m&&m.t&&m.t[y]?m.t[y][x]:null;if((r==='C'||r==='K')&&typeof floorLike==='function'){m.t[y][x]=floorLike(m,x,y);try{return dt0.apply(this,arguments);}finally{m.t[y][x]=r;}}return dt0.apply(this,arguments);};}
