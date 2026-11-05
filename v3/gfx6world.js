// =================== Beta v0.5.0 Phase 6: the world feels alive (6.1 lighting and depth, 6.3 life, 6.4 townsfolk) ===================
// Three passes, all added around the existing renderer without changing it:
//  1. baked once per map: soft contact shading (ambient occlusion) under cliffs, dungeon walls and building fronts (buildMapCanvas wrapper).
//  2. inside the depth sort (townDecorActors hook, so they sit under the night tint and dusk grade): a ground layer (water glints, swaying
//     grass, soft shadows under townsfolk, critters, bird shadows) and a sky layer (drifting leaves or dust, birds, townsfolk gestures).
//  3. after everything (outermost worldDraw wrapper): bloom around every lamp, torch, window and brazier with its own flicker, and a vignette.
// Counts come from GFX.q (config.js GFX_Q). No arrays, gradients or closures are made per frame except the two actor entries.
// Wind (WX_WIND) follows the weather: leaves, grass and birds all lean with it. Reduced motion draws one still frame (time 0).
const WX_WIND={clear:.35,rain:.8,storm:1.7,fog:.15,snow:.45,blizzard:1.9,gale:2.4,sand:1.5,heat:.2,ashfall:.4,aurora:.3,starfall:.3};
const G6W={amb:{meadow:['#e8a23a','#c8642a','#9ac850'],heights:['#b8d070','#e0c060','#ffffff'],coast:['#f0e0b0','#e8d4a0','#ffffff'],cave:['#ffb070','#d0a090','#ff8a3a'],void:['#c8a0ff','#7fe0c0','#ffffff'],snow:['#ffffff','#e0f0ff','#c8dcf0'],dun:['#e6d6c0','#c8b8a8','#a89888']},
  bubbles:['dots','note','bang','heart']};
function g6WindNow(m){if(!m||m.kind==='dungeon'||m.cave)return .1;const w=G.weather&&G.weather[m.s];return WX_WIND[w]!=null?WX_WIND[w]:.35;}
function g6Hash(x,y){let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return ((h^(h>>>16))>>>0)/4294967296;}
function g6Day(){try{if(typeof phaseProg!=='function'||!G)return 'day';return phaseProg().ph;}catch(e){return 'day';}}
// ----- 1. ambient occlusion, baked -----
let G6AO=null;
function g6AoSprites(){if(G6AO)return G6AO;const top=mkCv(16,6),tx=top.getContext('2d'),g=tx.createLinearGradient(0,0,0,6);g.addColorStop(0,'rgba(8,4,16,.26)');g.addColorStop(1,'rgba(8,4,16,0)');tx.fillStyle=g;tx.fillRect(0,0,16,6);
  const side=mkCv(4,16),sx=side.getContext('2d'),g2=sx.createLinearGradient(0,0,4,0);g2.addColorStop(0,'rgba(8,4,16,.2)');g2.addColorStop(1,'rgba(8,4,16,0)');sx.fillStyle=g2;sx.fillRect(0,0,4,16);
  return G6AO={top,side};}
function g6BakeAO(ctx,m){const A=g6AoSprites(),wall=(x,y)=>tileAt(m,x,y)==='#';
  for(let y=1;y<m.h;y++)for(let x=0;x<m.w;x++){if(wall(x,y)||solidAt(m,x,y))continue;
    if(wall(x,y-1))ctx.drawImage(A.top,x*TS,y*TS);
    if(wall(x-1,y))ctx.drawImage(A.side,x*TS,y*TS);
    if(wall(x+1,y)){ctx.save();ctx.translate(x*TS+16,y*TS);ctx.scale(-1,1);ctx.drawImage(A.side,0,0);ctx.restore();}}
  (m.bld||[]).forEach(b=>{const y=(b.y+b.h)*TS;for(let x=b.x;x<b.x+b.w;x++)ctx.drawImage(A.top,x*TS,y,16,4);});}
{const bm0=buildMapCanvas;buildMapCanvas=function(m,fr){const c=bm0.apply(this,arguments);try{if(GFX.q.ao&&m&&c&&c.getContext&&!m.archive)g6BakeAO(c.getContext('2d'),m);}catch(e){}return c;};}
// ----- 2a. ground layer -----
function g6Ground(ctx,m,cx,cy,vw,vh,ts){const q=GFX.q,T=m.kind==='dungeon'?null:THM(m),wind=g6WindNow(m);
  const x0=Math.max(0,Math.floor(cx/TS)),x1=Math.min(m.w-1,Math.ceil((cx+vw)/TS)),y0=Math.max(0,Math.floor(cy/TS)),y1=Math.min(m.h-1,Math.ceil((cy+vh)/TS));
  if(T&&(q.water||q.grass)){
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const c=tileAt(m,x,y),px=x*TS-cx,py=y*TS-cy;
      if(q.water&&(c==='~'||c==='o')){const h=g6Hash(x,y),ph=(ts/1400+h)%1;if(ph<.55){const a=Math.sin(ph/.55*Math.PI);ctx.globalAlpha=.55*a;ctx.fillStyle=T.w[2];
          const gx=px+2+Math.floor(h*9),gy=py+3+Math.floor(h*97)%9,s=Math.round(ph*4*(wind+.5));ctx.fillRect(gx+s,gy,3,1);if(h>.5)ctx.fillRect(gx+s+5,gy+3,2,1);}}
      else if(q.grass&&c===','&&!(x===WS.x&&y===WS.y)){const h=g6Hash(x,y),sw=Math.sin(ts/(520-wind*80)+x*.8+y*.35+h*3)*(.6+wind*.9),s=Math.max(-2,Math.min(2,Math.round(sw)));
        ctx.globalAlpha=1;ctx.fillStyle=T.tg[1];ctx.fillRect(px+3+Math.floor(h*3),py+9,1,3);ctx.fillRect(px+10+Math.floor(h*4),py+4,1,3);
        ctx.fillStyle=T.tg[2];ctx.fillRect(px+3+Math.floor(h*3)+s,py+8,1,1);ctx.fillRect(px+10+Math.floor(h*4)+s,py+3,1,1);}}
    ctx.globalAlpha=1;}
  if(q.critters&&m.kind==='field')g6Critters(ctx,m,cx,cy,vw,vh,ts);
  if(q.birds&&g6BirdsOn(m))g6Birds(ctx,vw,vh,ts,true,wind);}
// ----- critters: rabbits on grass, crabs on sand; they hop about and duck away when you come close -----
function g6CritterSpots(m){if(m._g6cr)return m._g6cr;const out=[],R=mulberry(m.w*31+m.h*7+(m.s||0)*101),th=m.theme;
  if(th!=='meadow'&&th!=='heights'&&th!=='coast'){return m._g6cr=out;}
  for(let k=0;k<400&&out.length<6;k++){const x=1+Math.floor(R()*(m.w-2)),y=1+Math.floor(R()*(m.h-2)),c=tileAt(m,x,y);if((c==='.'||c===',')&&!solidAt(m,x,y))out.push([x,y,R()]);}
  return m._g6cr=out;}
function g6Critters(ctx,m,cx,cy,vw,vh,ts){const sp=g6CritterSpots(m),n=Math.min(sp.length,GFX.q.critters),crab=m.theme==='coast';
  for(let i=0;i<n;i++){const s=sp[i];if(Math.abs(s[0]-WS.x)+Math.abs(s[1]-WS.y)<4)continue;// hides when you come close
    const cyc=(ts/(2600+s[2]*1800)+s[2])%1,hop=cyc<.18?Math.round(Math.sin(cyc/.18*Math.PI)*3):0,step=Math.floor(ts/(2600+s[2]*1800)+s[2])%6,dx=(step<3?step:6-step)*2;
    const x=s[0]*TS+4+dx-cx,y=s[1]*TS+11-cy;if(x<-8||y<-8||x>vw+8||y>vh+8)continue;
    ctx.fillStyle='rgba(10,6,24,.22)';ctx.fillRect(x,y+3,5,1);
    if(crab){ctx.fillStyle='#d8503a';ctx.fillRect(x,y+1-hop,5,2);ctx.fillRect(x-1,y-hop,1,1);ctx.fillRect(x+5,y-hop,1,1);ctx.fillStyle='#1a0a0a';ctx.fillRect(x+1,y-hop,1,1);ctx.fillRect(x+3,y-hop,1,1);}
    else{const fl=(step%2)?1:0;ctx.fillStyle='#c8b498';ctx.fillRect(x,y-hop,4,3);ctx.fillRect(x+(fl?-1:3),y-1-hop,2,2);ctx.fillStyle='#e8dcc8';ctx.fillRect(x+(fl?-1:4),y-3-hop,1,2);ctx.fillStyle='#ffffff';ctx.fillRect(x+(fl?4:-1),y-hop,1,1);}}}
// ----- birds: a small flock crosses now and then by day; their shadows slide over the ground -----
function g6BirdsOn(m){if(m.kind==='dungeon'||m.cave||m.archive||m.theme==='cave'||m.theme==='void')return false;const w=G.weather&&G.weather[m.s];if(w&&/rain|storm|blizzard|sand|ashfall/.test(w))return false;const d=g6Day();return d==='day'||d==='dawn';}
function g6Birds(ctx,vw,vh,ts,shadow,wind){const P=26000,t=ts%P,dur=11000;if(t>dur)return;const p=t/dur,n=GFX.q.birds;
  for(let i=0;i<n;i++){const bx=Math.round(-24+p*(vw+48)*(1+wind*.15)-(i%2?i*5:i*4)),by=Math.round(vh*.16+(i%2?-1:1)*Math.ceil(i/2)*4+Math.sin(ts/700+i)*2);
    if(shadow){ctx.fillStyle='rgba(10,6,24,.14)';ctx.fillRect(bx+14,by+Math.round(vh*.45),3,1);continue;}
    const f=Math.sin(ts/110+i*1.7)>0?1:0;ctx.fillStyle='rgba(28,22,36,.85)';ctx.fillRect(bx,by,1,1);ctx.fillRect(bx-2,by-1+f,2,1);ctx.fillRect(bx+1,by-1+f,2,1);}}
// ----- 2b. sky layer: drifting leaves or dust, birds, townsfolk gestures -----
function g6Sky(ctx,m,cx,cy,vw,vh,ts,still){const q=GFX.q,wind=g6WindNow(m),dun=m.kind==='dungeon';
  if(q.amb){const key=dun||m.cave?'dun':m.theme,cols=G6W.amb[key]||G6W.amb.meadow,snow=m.theme==='snow',n=dun||m.cave?Math.ceil(q.amb/2):snow?0:q.amb,t=ts/1000;
    for(let i=0;i<n;i++){const vx=dun?2+i%3:(6+(i%5)*3)*(.35+wind),vy=dun?-1-(i%3)*.6:4+(i%4)*2+wind*2;
      const x=Math.floor((((i*97.3+t*vx+Math.sin(t*.8+i)*6)%(vw+20))+vw+20)%(vw+20))-10,y=Math.floor((((i*53.1+t*vy+Math.cos(t*.6+i*1.3)*3)%(vh+10))+vh+10)%(vh+10))-5;
      ctx.fillStyle=cols[i%3];ctx.globalAlpha=dun?.45:.85;if(dun||key==='coast')ctx.fillRect(x,y,1,1);else{const flip=Math.floor(t*3+i)%2;ctx.fillRect(x,y,flip?2:1,flip?1:2);}}
    ctx.globalAlpha=1;}
  if(q.birds&&g6BirdsOn(m))g6Birds(ctx,vw,vh,ts,false,wind);
  if(q.gest&&!still&&m.kind==='town')g6Gestures(ctx,m,cx,cy,vw,vh,ts);}
function g6Gestures(ctx,m,cx,cy,vw,vh,ts){for(let i=0;i<m.npcs.length;i++){const n=m.npcs[i];if(n.portal||n.mv)continue;
  const per=8000+(i%5)*1700,c=Math.floor((ts+i*2300)/per),ph=((ts+i*2300)%per)/per;if(ph>.16||(c+i)%3)continue;
  const x=n.x*TS+12-cx,y=n.y*TS-14-cy+(ph<.03?1:0);if(x<-10||y<-10||x>vw+10||y>vh+10)continue;
  ctx.fillStyle='#150b17';ctx.fillRect(x-1,y-1,11,8);ctx.fillStyle='#fff8e8';ctx.fillRect(x,y,9,6);ctx.fillRect(x+1,y+6,2,1);ctx.fillStyle='#150b17';ctx.fillRect(x+1,y+7,1,1);
  const k=G6W.bubbles[(c+i)%4];ctx.fillStyle=k==='heart'?'#e04a6a':k==='bang'?'#e0a020':'#3a2a4a';
  if(k==='dots'){ctx.fillRect(x+2,y+3,1,1);ctx.fillRect(x+4,y+3,1,1);ctx.fillRect(x+6,y+3,1,1);}
  else if(k==='note'){ctx.fillRect(x+3,y+4,2,1);ctx.fillRect(x+4,y+1,1,3);ctx.fillRect(x+5,y+1,2,1);}
  else if(k==='bang'){ctx.fillRect(x+4,y+1,1,3);ctx.fillRect(x+4,y+5-1,1,1);}
  else{ctx.fillRect(x+2,y+2,2,1);ctx.fillRect(x+5,y+2,2,1);ctx.fillRect(x+2,y+3,5,1);ctx.fillRect(x+3,y+4,3,1);ctx.fillRect(x+4,y+5,1,1);}}}
// hook into the depth sort: a ground entry drawn before every actor and a sky entry after them (both under the tint and grade)
const G6A={g:{y:-1e9,deco:'gfx6:ground',draw:null},s:{y:1e9,deco:'gfx6:sky',draw:null},a:null};
G6A.g.draw=()=>{const a=G6A.a;if(a)try{g6Ground(a.ctx,a.m,a.cx,a.cy,a.vw,a.vh,a.ts);}catch(e){}};
G6A.s.draw=()=>{const a=G6A.a;if(a)try{g6Sky(a.ctx,a.m,a.cx,a.cy,a.vw,a.vh,a.ts,a.still);}catch(e){}};
const G6ARGS={ctx:null,m:null,cx:0,cy:0,vw:0,vh:0,ts:0,still:false};
{const td0=townDecorActors;townDecorActors=function(actors,now,cx,cy){td0.apply(this,arguments);const m=WS.m;if(!m||m.archive||GFX.off)return;
  const still=gfxStill(),A=G6ARGS;A.ctx=WS.ctx;A.m=m;A.cx=cx;A.cy=cy;A.vw=WS.vw;A.vh=WS.vh;A.ts=still?0:now;A.still=still;G6A.a=A;actors.push(G6A.g,G6A.s);
  if(GFX.q.shadows)g6NpcShadows(actors,m,now,cx,cy);};}
// soft shadows under townsfolk (the hero already has one). Each is its own depth sorted entry just before its townsperson, so whatever
// hides the townsperson (a wall, a roof) hides the shadow too. One reusable entry per townsperson, made once.
function g6NpcShadows(actors,m,now,cx,cy){for(let i=0;i<m.npcs.length;i++){const n=m.npcs[i];if(n.portal)continue;let nx=n.x*TS,ny=n.y*TS;
  if(n.mv){const p=Math.min(1,(now-n.mv.t0)/420);nx=(n.mv.fx+(n.x-n.mv.fx)*p)*TS;ny=(n.mv.fy+(n.y-n.mv.fy)*p)*TS;}
  const sx=Math.round(nx)+8-cx,sy=Math.round(ny)+15-cy;if(sx<-16||sy<-8||sx>WS.vw+16||sy>WS.vh+8)continue;
  let a=n._g6sh;if(!a){a=n._g6sh={y:0,deco:'gfx6:shadow',sx:0,sy:0,draw:null};a.draw=()=>{WS.ctx.drawImage(g6Shadow(),a.sx-9,a.sy-3,18,6);};}
  a.y=ny-.01;a.sx=sx;a.sy=sy;actors.push(a);}}
// ----- 3. bloom with per light flicker, then the vignette -----
const G6FLK={lamp:.06,fire:.14,torch:.14,gold:.05,lava:.08,cyan:.03,violet:.04,day:0};
// windows and lamps (no type) only bloom from dusk to dawn and in dark places; fires, torches and crystals always do
const G6B={ctx:null,cx:0,cy:0,vw:0,vh:0,ts:0,base:0,day:false,big:2};
function g6BloomOne(L){const B6=G6B,k=L[3]||'lamp';if(B6.day&&(k==='lamp'||k==='day'))return;const ctx=B6.ctx,x=L[0]-B6.cx,y=L[1]-B6.cy,fl=G6FLK[k]!=null?G6FLK[k]:.05;
  const w=Math.sin(B6.ts/(70+(L[0]%23))+L[1])+.6*Math.sin(B6.ts/31+L[0]),f=1+fl*w,r=Math.min(L[2]||18,30)*B6.big*f;
  if(x<-r||y<-r||x>B6.vw+r||y>B6.vh+r)return;ctx.globalAlpha=Math.max(0,Math.min(1,B6.base*(k==='day'?.3:1)*(1+.25*w*(fl>0?1:0))));ctx.drawImage(g6Glow(LIGHTC[k]||LIGHTC.lamp),x-r,y-r,r*2,r*2);}
function g6Bloom(ctx,m,cx,cy,vw,vh,ts){const ph=m.kind==='dungeon'?'night':g6Day(),T=m.kind==='dungeon'?null:THM(m),dark=m.kind==='dungeon'||m.cave||!!(T&&T.dark);
  G6B.ctx=ctx;G6B.cx=cx;G6B.cy=cy;G6B.vw=vw;G6B.vh=vh;G6B.ts=ts;G6B.day=!dark&&ph==='day';G6B.base=ph==='night'||dark?.45:ph==='dusk'||ph==='dawn'?.36:.18;G6B.big=GFX.q.bloom>1?2:1.6;
  ctx.globalCompositeOperation='lighter';
  if(m.lights)m.lights.forEach(g6BloomOne);if(m.tl)m.tl.forEach(g6BloomOne);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
{const wd0=worldDraw;worldDraw=function(now){wd0(now);try{const m=WS.m,ctx=WS.ctx;if(!m||!ctx||!WS.cam||GFX.off)return;const q=GFX.q,still=gfxStill(),ts=still?0:now,cx=Math.round(WS.cam.x),cy=Math.round(WS.cam.y);
  if(q.bloom)g6Bloom(ctx,m,cx,cy,WS.vw,WS.vh,ts);
  if(q.vignette){const ph=m.kind==='dungeon'?'night':g6Day(),a=m.kind==='dungeon'||m.cave?.5:ph==='night'?.42:ph==='day'?.26:.34;ctx.drawImage(g6Vignette(WS.vw,WS.vh,a),0,0);}}catch(e){}};}
