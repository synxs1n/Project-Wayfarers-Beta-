// ===== light13.js (v0.19.7): light and shadow on the ground, night and interior light pools, world particles, screen transitions =====
// The owner asked for four things (docs/light13.md):
//  1 SHADOWS   trees, buildings, cliffs, town walls, the landmark and every entrance cast long soft shadows on the ground in both renderers, from one
//              sun and one shadow function: l13ShadowW gives the weights of the three baked sun directions (day, dusk, dawn, HD2D.suns: the sun stands
//              north-west by day and low in the west at dusk, the east at dawn, so shadows fall to the lower right as the props are lit) from the hour
//              (a day's first and last quarter lean to the long dawn and dusk shadows). HD-2D already bakes a heightfield march (hdBakeShadow); it
//              now takes these weights (hdLook hook) and its sun is warmer and its ambient cooler by day (a warm key, a cool fill). The 2D renderer
//              marches the same heightfield (blocks, buildings by kind, trees and rocks, the entrances of worldart13, the landmark) into three masks per
//              map (l13Masks, cached on the map) and lays them under the actors (townDecorActors hook) with the same weights.
//  2 NIGHT     the flat renderer's night was one blue wash: now the view darkens further between the lights (a view sized layer with soft holes at
//              every lamp, window, brazier, torch, fountain, waystone and glowing prop) and every light pools warm light on the ground (additive, a
//              ground ellipse with a soft falloff from LIGHTC, cached sprites per light kind, fire kinds flicker by a hash of time). Interiors (dens,
//              lairs, dungeons, the halls) get the same pools over their own darkness. HD-2D keeps its light map; at night its ambient drops and the
//              lamps weigh more (hdLook hook), so the pools stand out of the dark.
//  3 PARTICLES one hook on wfxRun (worldfx.js, both renderers, world anchored like the weather, nothing over the hero, no random draw): fireflies at
//              night in meadow realms, pollen by day in grass realms, ash and embers in Cinderhollow and over every brazier, dust in sandstone (the
//              mesa, sand dungeons), frost sparkle in the tundra, spores in the Breach, void motes in the Echo Rift. Their clock stops under a menu.
//  4 TRANSITIONS the battle start is a horizontal shatter in the realm's colour (nine shards racing in from alternating sides, the two white flashes
//              kept, 460 ms as before), a doorway is an iris closing on the hero (230 ms) and opening again (280 ms), the return from a won battle is
//              a soft bloom; reduced motion keeps the plain fades. Timings are unchanged, so every test that waits on them still holds.
// Look only: no tile, collision, save field, game number or random draw changes. window.__L13 is the test hook; tools/chrome/v177a.js.
const L13={n:{sh:0,shDraw:0,lt:0,pt:0,tr:0,em:0},off:false,err:[],off2:0,pauseT:0,pauseOff:0,tr:{flash:0,fade:0,fadeIn:0},bloom:0,shK:.72,
  key:{k:1},night:{k:1,dark:.34,pool:.55},suns:{day:[-.6,.75,-.14],dusk:[-.92,.34,-.12],dawn:[.92,.34,-.12]}};
window.__L13=L13;
function l13Err(w,e){if(L13.err.length<20)L13.err.push(w+': '+(e&&e.message||e));}
function l13Still(){return typeof gfxStill==='function'&&gfxStill();}
function l13Out(m){return !!m&&!(typeof mapIndoor==='function'?mapIndoor(m):m.kind==='dungeon');}
function l13HD(){return typeof hdActive==='function'&&hdActive();}
function l13PhW(ph){try{if(typeof trPhW==='function')return trPhW(ph);}catch(e){}try{return phaseProg().ph===ph?1:0;}catch(e){return ph==='day'?1:0;}}
// ---------- 1. one sun, one shadow ----------
try{Object.assign(HD2D.suns,L13.suns);}catch(e){l13Err('suns',e);}
// weights of the three baked shadow directions (day, dusk, dawn) right now: the time of day blend (trPhW), the hour within a phase (a day's first
// quarter leans to the dawn shadow, its last to the dusk shadow, so shadows are long at both ends of the day), late dusk and early dawn lean
// to the faint moon shadow like the HD-2D presets, and a clouded sky softens all of them
const L13_SW=[0,0,0];
function l13ShadowW(m){const o=L13_SW;o[0]=o[1]=o[2]=0;if(!l13Out(m)||!G||typeof HD2D==='undefined'||!HD2D.look)return o;
  try{const pp=phaseProg(),P=HD2D.look,NS=(P.night.sh||[0,0,0])[0];
    ['day','dusk','night','dawn'].forEach(ph=>{const w=l13PhW(ph);if(w<=0)return;const sh=(P[ph]&&P[ph].sh)||[0,0,0];
      const pr=ph===pp.ph?pp.p:(typeof TR!=='undefined'&&TR.from===ph?TR.fromP:1);
      if(ph==='day'){const kd=Math.max(0,.28-pr)/.28,ke=Math.max(0,pr-.72)/.28,k=Math.max(kd,ke);o[0]+=sh[0]*w*(1-.8*k);o[2]+=(P.dawn.sh||[0,0,.58])[2]*w*kd;o[1]+=(P.dusk.sh||[0,.62,0])[1]*w*ke;}
      else{const q=ph==='dusk'?pr:ph==='dawn'?1-pr:0,k=ph==='night'?0:Math.max(0,q-.45)*.7;for(let i=0;i<3;i++)o[i]+=sh[i]*w*(1-k);if(k>0)o[0]+=NS*w*k;}});
    const out=m.kind==='field'||m.kind==='town';if(out&&G.weather&&HD2D.weather){// a clouded sky softens the shadow, blended like the weather fade (p5trans), so a change starts from the old look
      const X=typeof TR!=='undefined'?TR.wx:null,cur=G.weather[m.s]||'clear';let wl=[[cur,1]];if(X&&X.from&&X.k<1){const e=trEase(X.k);wl=[[X.cur||cur,e],[X.from,1-e]];}
      let k=0;wl.forEach(([w,q])=>{const M=HD2D.weather[w]||HD2D.weather.clear;k+=(.35+.65*(M.sun==null?1:M.sun))*q;});for(let i=0;i<3;i++)o[i]*=k;}}
  catch(e){l13Err('shadowW',e);}return o;}
// HD-2D: the baked shadow takes the hour's weights; by day a warm key and a cool fill; at night the ambient drops and the lamps weigh more
HOOK.after('hdLook','light13','sun shadow by the hour, warm key and cool fill, darker nights',function(o,m){try{if(L13.off||!o||!l13Out(m))return;
  const w=l13ShadowW(m);o.shW[0]=w[0];o.shW[1]=w[1];o.shW[2]=w[2];
  const d=l13PhW('day')*L13.key.k;if(d>0){o.sun[0]*=1+.1*d;o.sun[1]*=1+.02*d;o.sun[2]*=1-.14*d;o.amb[0]*=1-.07*d;o.amb[1]*=1-.02*d;o.amb[2]*=1+.08*d;}
  const n=l13PhW('night')*L13.night.k;if(n>0){o.amb[0]*=1-.2*n;o.amb[1]*=1-.18*n;o.amb[2]*=1-.1*n;o.lamp=Math.min(1.4,o.lamp*(1+.3*n));}}catch(e){l13Err('hdLook',e);}});
// ---------- the 2D cast shadows: the HD-2D heightfield march, into three masks per map ----------
const L13_OB={T:[7,26],t:[6,10],R:[6,8],Y:[9,34],P:[4,24],N:[4,22],e:[8,14],W:[4,20],k:[7,10],x:[5,10],b:[4,10],h:[6,8]};// as hdBakeShadow
const L13_BH={keep:46,tower:58,gate:34,card:18,roof:34};
function l13Field(m){const k=4,MW=Math.ceil(m.w*TS/k),MH=Math.ceil(m.h*TS/k),HF=new Float32Array(MW*MH),V=hdV();let any=false;
  const hOf=kd=>kd===1?HD2D.wall.dungeon*V:kd===2?HD2D.wall.cliff*V:kd===3?HD2D.wall.town*V:0;
  const fill=(x0,y0,x1,y1,h)=>{for(let y=Math.max(0,y0);y<Math.min(MH,y1);y++)for(let x=Math.max(0,x0);x<Math.min(MW,x1);x++)if(HF[y*MW+x]<h)HF[y*MW+x]=h;any=true;};
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const c=tileAt(m,x,y);let h=hOf(hdKind(m,c));if(c==='j')h=28*V;if(h>0)fill(x*4,y*4,x*4+4,y*4+4,h);
    const o=L13_OB[c];if(!o)continue;const cx=(x*TS+8)/k,cz=(y*TS+11)/k,r=o[0]/k,hh=o[1]*V;any=true;
    for(let j=Math.floor(cz-r);j<=Math.ceil(cz+r);j++)for(let i=Math.floor(cx-r);i<=Math.ceil(cx+r);i++){if(i<0||j<0||i>=MW||j>=MH)continue;const d=((i-cx)**2+(j-cz)**2)/(r*r);if(d<=1)HF[j*MW+i]=Math.max(HF[j*MW+i],hh*(1-.35*d));}}
  (m.bld||[]).forEach(b=>{let kind='roof';try{kind=hdBldKind(m,b);}catch(e){}fill(b.x*4,b.y*4,(b.x+b.w)*4,(b.y+b.h)*4,(L13_BH[kind]||L13_BH.roof)*V);});
  try{if(typeof wa13Sites==='function')wa13Sites(m).forEach(s=>{const h=s.kind==='gate'?34*V:Math.max(12,(s.sh-9))*V;fill((s.ex-1)*4,(s.ey-1)*4,(s.ex+2)*4,(s.ey+1)*4,h);});}catch(e){}
  if(!any)return null;let mx=0;for(let i=0;i<HF.length;i++)if(HF[i]>mx)mx=HF[i];return {MW,MH,HF,mx,k};}
function l13March(F,L){const {MW,MH,HF,mx,k}=F,lh=Math.hypot(L[0],L[2]),dx=L[0]/lh,dz=L[2]/lh,rise=L[1]/lh,tmax=mx/rise,out=new Uint8Array(MW*MH);
  for(let j=0;j<MH;j++)for(let i=0;i<MW;i++){if(HF[j*MW+i]>0)continue;
    for(let t=k;t<=tmax;t+=k){const ii=Math.floor(i+dx*t/k),jj=Math.floor(j+dz*t/k);if(ii<0||jj<0||ii>=MW||jj>=MH)break;if(HF[jj*MW+ii]>t*rise){out[j*MW+i]=255;break;}}}
  // soften: two 3x3 box passes (the long shadows of dusk and dawn should have no hard edge)
  let a=out,b=new Uint8Array(MW*MH);for(let pass=0;pass<2;pass++){for(let j=0;j<MH;j++)for(let i=0;i<MW;i++){let s=0,n=0;for(let q=-1;q<=1;q++)for(let p=-1;p<=1;p++){const ii=i+p,jj=j+q;if(ii<0||jj<0||ii>=MW||jj>=MH)continue;s+=a[jj*MW+ii];n++;}b[j*MW+i]=s/n;}const t=a;a=b;b=t;}
  return a;}
// the three masks of a map (day, dusk, dawn), cached on the map until its tall things change
function l13Masks(m){if(!m||L13.off||!l13Out(m))return null;const key=m.id+':'+(G&&G.cleared&&G.cleared[m.s]?1:0)+':'+(m.bsp||[]).length+':'+(m.bld||[]).length+':'+(m.thv||'');
  let e=m.__l13sh;if(e&&e.key===key)return e.cv;e={key,cv:null};m.__l13sh=e;
  try{const F=l13Field(m);if(F){const cv=[];[HD2D.suns.day,HD2D.suns.dusk,HD2D.suns.dawn].forEach(L=>{const a=l13March(F,L),c=mkCv(F.MW,F.MH),x=c.getContext('2d'),id=x.createImageData(F.MW,F.MH),d=id.data;
      for(let i=0;i<a.length;i++){const o=i*4;d[o]=14;d[o+1]=10;d[o+2]=38;d[o+3]=a[i];}x.putImageData(id,0,0);cv.push(c);});e.cv=cv;L13.n.sh++;}}
  catch(err){l13Err('masks',err);}return e.cv;}
// 2D: the masks go under every actor (the first entry of the depth sort), at the hour's weights, upscaled with smoothing so the edge is soft
HOOK.after('townDecorActors','light13','cast shadows on the ground (2D)',function(r,actors,now,cx,cy){try{const m=WS.m;if(!m||L13.off||!actors||l13HD()||!WS.cv||WS.ctx!==WS.cv.getContext('2d'))return;
  const w=l13ShadowW(m);if(w[0]+w[1]+w[2]<.01)return;const cv=l13Masks(m);if(!cv)return;const a0=w[0],a1=w[1],a2=w[2];
  actors.push({y:-1e9,draw:()=>{const ctx=WS.ctx;ctx.save();ctx.imageSmoothingEnabled=true;const W=[a0,a1,a2];for(let i=0;i<3;i++){if(W[i]<.01)continue;ctx.globalAlpha=Math.min(1,W[i]*L13.shK);ctx.drawImage(cv[i],-cx,-cy,cv[i].width*4,cv[i].height*4);}ctx.restore();L13.n.shDraw++;}});}
  catch(e){l13Err('shadow2d',e);}});
// daylight.js drew its own wedge behind every building at dusk and dawn; the masks cast those now
HOOK.wrap('dayFxDraw','light13','building wedges replaced by the cast shadow masks',function(next,...a){const m=WS.m;if(L13.off||!m||!m.bld||l13HD())return next(...a);const keep=m.bld;m.bld=[];try{return next(...a);}finally{m.bld=keep;}});
// ---------- 2. night and interior light pools (2D) ----------
const L13_SPR={};
function l13Spr(key,fn){let c=L13_SPR[key];if(!c){c=L13_SPR[key]=mkCv(64,64);fn(c.getContext('2d'));}return c;}
function l13Pool(col){return l13Spr('pool:'+col,c=>{const q=typeof wfxRgb==='function'?wfxRgb(col):[255,200,120,.4],g=c.createRadialGradient(32,32,1,32,32,32);
  g.addColorStop(0,`rgba(${q[0]},${q[1]},${q[2]},1)`);g.addColorStop(.3,`rgba(${q[0]},${q[1]},${q[2]},.6)`);g.addColorStop(.65,`rgba(${q[0]},${q[1]},${q[2]},.18)`);g.addColorStop(1,`rgba(${q[0]},${q[1]},${q[2]},0)`);c.fillStyle=g;c.fillRect(0,0,64,64);});}
function l13Hole(){return l13Spr('hole',c=>{const g=c.createRadialGradient(32,32,1,32,32,32);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.45,'rgba(0,0,0,.8)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,64,64);});}
const L13_FIRE={fire:1,torch:1,lava:1};
// how much night there is in the flat view (the night blend plus the late dusk and early dawn)
function l13NightW(m){if(!l13Out(m))return 1;let k=l13PhW('night');try{const pp=phaseProg();['dusk','dawn'].forEach(ph=>{const w=l13PhW(ph);if(w<=0)return;const pr=ph===pp.ph?pp.p:(typeof TR!=='undefined'&&TR.from===ph?TR.fromP:1),q=ph==='dusk'?pr:1-pr;k+=w*Math.max(0,(q-.4)/.6)*.85;});}catch(e){}
  if(m&&m.kind!=='dungeon'){try{if(THM(m).dark)k=Math.max(k,.5);}catch(e){}}return Math.min(1,k);}
// the lights of a map for the pools: m.lights and m.tl (lamps, windows, torches, braziers, waystones, crystals, lava, runes) plus the fountains
function l13Lights(m){const key=(m.lights||[]).length+':'+(m.tl||[]).length;let e=m.__l13lt;if(e&&e.key===key)return e.list;const list=(m.lights||[]).concat(m.tl||[]).filter(L=>L[3]!=='day');
  try{for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(tileAt(m,x,y)==='O'&&tileAt(m,x-1,y)!=='O'&&tileAt(m,x,y-1)!=='O')list.push([x*TS+16,y*TS+18,22,'cyan']);}catch(err){}
  m.__l13lt={key,list};L13.n.lt++;return list;}
function l13Pools(ctx,m,now,k,vw,vh,cx,cy){const dun=!l13Out(m),ts=l13Still()?0:now,list=l13Lights(m),hx=Math.round(WS.px)+8-cx,hy=Math.round(WS.py)+12-cy,N=L13.night;
  // 1. darker between the lights (outdoors; interiors draw their own darkness in worldDraw)
  if(!dun){let D=L13.dark;if(!D||D.width!==vw||D.height!==vh)D=L13.dark=mkCv(vw,vh);const dc=D.getContext('2d');dc.globalCompositeOperation='source-over';dc.globalAlpha=1;dc.clearRect(0,0,vw,vh);
    dc.fillStyle=`rgba(6,6,28,${(N.dark*k).toFixed(3)})`;dc.fillRect(0,0,vw,vh);dc.globalCompositeOperation='destination-out';const H=l13Hole();
    list.forEach(L=>{const x=L[0]-cx,y=L[1]-cy,r=(L[2]||18)*2.3;if(x+r<0||y+r<0||x-r>vw||y-r>vh)return;dc.drawImage(H,x-r,y+2-r*.8,r*2,r*1.6);});
    dc.globalAlpha=.6;dc.drawImage(H,hx-50,hy-36,100,72);dc.globalAlpha=1;dc.globalCompositeOperation='source-over';ctx.drawImage(D,0,0);}
  // 2. the pools: each light lays its colour on the ground round it, a soft ellipse, fire kinds flicker
  ctx.save();ctx.globalCompositeOperation='lighter';const base=(dun?.7:N.pool)*k;
  list.forEach((L,i)=>{const x=L[0]-cx,y=L[1]-cy,t=L[3]||'lamp';let r=(L[2]||18)*1.7;if(x+r<0||y+r<0||x-r>vw||y-r>vh)return;
    const col=LIGHTC[t]||LIGHTC.lamp,q=typeof wfxRgb==='function'?wfxRgb(col):[1,1,1,.4];let f=1;if(ts&&L13_FIRE[t])f=1+.09*Math.sin(ts/90+i*1.7+L[0])+.05*Math.sin(ts/37+i*.9);
    ctx.globalAlpha=Math.min(1,base*q[3]*2.2*f);ctx.drawImage(l13Pool(col),x-r,y+3-r*.62,r*2,r*1.24);});
  // the hero's own faint lantern light at night outdoors
  if(!dun&&k>.3){ctx.globalAlpha=.13*k;ctx.drawImage(l13Pool(LIGHTC.lamp),hx-44,hy-24,88,52);}
  ctx.restore();}
HOOK.after('worldDraw','light13','night and interior light pools (2D)',function(_,now){try{if(L13.off||l13HD())return;const m=WS.m,ctx=WS.ctx;if(!m||!ctx||!G||!WS.cam)return;
  const k=l13NightW(m);if(k<=.01)return;l13Pools(ctx,m,now,k,WS.vw,WS.vh,Math.round(WS.cam.x),Math.round(WS.cam.y));}catch(e){l13Err('pools',e);}});
// ---------- 3. particles in the world ----------
// a clock that stops under a menu (the particles hold still behind it) and is 0 under reduced motion, like the rest of the ambience
function l13T(ts){if(!ts)return 0;const P=L13;let menu=false;try{menu=!!(V&&V.modal);}catch(e){}if(menu){if(!P.pauseT)P.pauseT=ts;return P.pauseT-P.pauseOff;}if(P.pauseT){P.pauseOff+=ts-P.pauseT;P.pauseT=0;}return ts-P.pauseOff;}
function l13H(i,k){return typeof wfxH==='function'?wfxH(i,k):(((i*374761393+k*668265263)>>>0)%1000)/1000;}
function l13Realm(m){try{const R=typeof realmAt==='function'?realmAt(m.s):null;return R&&R.key||'';}catch(e){return '';}}
// the braziers of a map (embers rise from each), cached
function l13Braziers(m){if(m.__l13v)return m.__l13v;const v=[];try{for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(tileAt(m,x,y)==='v')v.push([x*TS+8,y*TS+8]);}catch(e){}return m.__l13v=v;}
const L13_N={fly:8,pollen:6,ash:7,ember:5,dust:6,frost:7,spore:7,rift:8,brazier:2};
function l13Emit(set,m,ts,cxc,czc,Px,Pz,emit){if(set!=='amb'||!m||L13.off)return;const t=l13T(ts)/1000,ts2=l13T(ts),A=Px*Pz/WFX.ref;let tk=1;try{if(gfxTier()==='low')tk=.6;}catch(e){}
  const cnt=k=>Math.min(WFX.maxN,Math.round(k*A*tk)),put=(x,z,h,w,hh,c,a,g)=>{emit(wfxW(x,cxc,Px),wfxW(z,czc,Pz),h,w,hh,c,a,g);L13.n.em++;};
  const out=l13Out(m),th=m.theme,rk=l13Realm(m),night=out?l13PhW('night'):0,day=out?l13PhW('day'):0,N=L13_N,still=ts===0;
  // fireflies at night in the meadows and forests (every meadow realm's fields and towns), a slow wander near the grass, each winking on its own
  if(out&&th==='meadow'&&night>.05&&!m.breach){const n=cnt(N.fly);for(let i=0;i<n;i++){const a=still?.5:Math.max(0,Math.sin(ts2/700+i*1.9))*.9;if(a<.03)continue;
    const x=l13H(i,201)*Px+Math.sin(t*.5+i*2.3)*16,z=l13H(i,202)*Pz+Math.cos(t*.37+i*1.1)*11,h=3+l13H(i,203)*10+Math.sin(t*1.4+i)*2;put(x,z,h,4,4,'#d8ff8c',a*night*.3,1);put(x,z+.01,h+1,2,2,'#f4ffc0',a*night,1);}}
  // pollen and seeds by day in the grass realms, drifting with the wind
  if(out&&(th==='meadow'||th==='heights')&&day>.05&&!m.breach){const n=cnt(N.pollen),wind=typeof wfxWind==='function'?wfxWind(m):.35;for(let i=0;i<n;i++){const H0=40,h=H0-((t*(5+(i%3)*2)+l13H(i,213)*H0)%H0);
    put(l13H(i,211)*Px+t*(9+(i%4)*4)*(.4+wind)+Math.sin(t*.9+i)*5,l13H(i,212)*Pz+Math.cos(t*.7+i)*3,h,1,1,i%3?'#fff6c0':'#ffffff',day*.55*Math.min(1,h/4),0);}}
  // Cinderhollow: ash drifting down and embers rising, by day and night; embers over every brazier anywhere
  if(out&&rk==='deeps'){const n=cnt(N.ash);for(let i=0;i<n;i++){const H0=60,h=H0-((t*(9+(i%3)*4)+l13H(i,221)*H0)%H0);put(l13H(i,222)*Px+t*7+Math.sin(t*.6+i)*6,l13H(i,223)*Pz,h,i%4?1:2,1,i%2?'#8a8080':'#b0a8a0',.55*Math.min(1,h/5),0);}
    const e=cnt(N.ember);for(let i=0;i<e;i++){const H0=48,h=(t*(14+(i%3)*5)+l13H(i,231)*H0)%H0,a=Math.min(1,(H0-h)/12);put(l13H(i,232)*Px+Math.sin(t*1.3+i)*4,l13H(i,233)*Pz,h,1,1,i%3?'#ff9a3a':'#ffd070',a*(still?.7:.7+.3*Math.sin(ts2/80+i)),1);}}
  l13Braziers(m).forEach(([bx,bz],j)=>{if(Math.abs(bx-cxc)>Px/2||Math.abs(bz-czc)>Pz/2)return;for(let i=0;i<N.brazier;i++){const k=j*7+i,H0=30,h=10+((t*(11+(i%2)*4)+l13H(k,241)*H0)%H0),a=Math.min(1,(H0+10-h)/10);
    emit(bx+Math.sin(t*1.7+k)*3+(l13H(k,242)-.5)*4,bz,h,1,1,i%2?'#ffb04a':'#ffe08a',a*.9,1);L13.n.em++;}});
  // dust motes in sandstone: the mesa by day, the sand dungeons always
  if((out&&rk==='mesa'&&day>.05)||(!out&&m.d8==='sand')){const n=cnt(N.dust),k=out?day:1;for(let i=0;i<n;i++){const H0=36,h=(t*3+l13H(i,251)*H0)%H0;put(l13H(i,252)*Px+t*(4+(i%3))+Math.sin(t*.5+i)*4,l13H(i,253)*Pz+Math.sin(t*.3+i*2)*2,h,1,1,i%2?'#f0d8a8':'#e8c890',k*.4*Math.min(1,(H0-h)/6),0);}}
  // frost sparkle in the tundra: tiny glints at the snow, winking
  if(out&&(rk==='tundra'||rk==='glacier')){const n=cnt(N.frost);for(let i=0;i<n;i++){const a=still?.5:Math.max(0,Math.sin(ts2/420+i*2.4))*.85;if(a<.04)continue;put(l13H(i,261)*Px,l13H(i,262)*Pz,1+l13H(i,263)*3,1,1,i%3?'#eefcff':'#d8f4ff',a,1);}}
  // spores in the Breach: slow green motes rising and sinking
  if(m.breach){const n=cnt(N.spore);for(let i=0;i<n;i++){const H0=44,h=(t*5+l13H(i,271)*H0)%H0;put(l13H(i,272)*Px+Math.sin(t*.6+i)*7,l13H(i,273)*Pz+Math.cos(t*.4+i)*4,h,i%4?1:2,i%4?1:2,i%2?'#7cf0c0':'#b8ff9a',.6*Math.sin(h/H0*Math.PI),1);}}
  // void motes in the Echo Rift
  if(m.sanctum){const n=cnt(N.rift);for(let i=0;i<n;i++){const H0=56,h=(t*18+l13H(i,281)*H0)%H0;put(l13H(i,282)*Px+t*12+Math.sin(t*.8+i)*5,l13H(i,283)*Pz,h,1,1,i%2?'#c8a0ff':'#62e8e0',Math.min(1,(H0-h)/10)*.8,1);}}}
HOOK.after('wfxRun','light13','the realm particles (fireflies, pollen, ash and embers, dust, frost, spores, void motes)',function(r,set,m,ts,cxc,czc,Px,Pz,emit){try{l13Emit(set,m,ts,cxc,czc,Px,Pz,emit);}catch(e){l13Err('emit',e);}});
// HD-2D leaves the Rift (an archive map) without ambience: its void motes go into the scene here, with the hero's box set as hdWfx sets it
HOOK.after('hdActors','light13','void motes in the Echo Rift (HD-2D)',function(r,m,now,ts){try{if(L13.off||!m||!m.sanctum||!m.archive||!HD.S)return;HW.hx=Math.round(WS.px)+8;HW.hz=WS.py+12.5;
  {const p=HW.p,B=HW.b,hw=Math.max(8,(HD.chW||14)*.6),hh=HD.heroH||24;h2Proj(p,HD.mats.vp,HW.hx-hw,0,HW.hz);B[0]=p[0];B[1]=p[1];h2Proj(p,HD.mats.vp,HW.hx+hw,hh*1.08,HW.hz);B[2]=p[0];B[3]=p[1];const px=8/Math.max(64,WS.vw);B[0]-=px;B[2]+=px;B[1]-=px;B[3]+=px;}
  const R=HD.lmR,C=WFX.cell,Px=Math.ceil(R[2]/C)*C,Pz=Math.ceil((WFX.hdZ[0]+WFX.hdZ[1])/C)*C;l13Emit('amb',m,ts,HD.cam.x,HD.cam.z-(WFX.hdZ[0]-WFX.hdZ[1])/2,Px,Pz,hdWfxEmit);}catch(e){l13Err('rift',e);}});
// ---------- 4. screen transitions ----------
// the old stamps (WS.flash, WS.fade, WS.fadeIn) are hidden from the frame (so neither renderer draws the plain fades) and drawn here after it
const L13_TM={flash:460,fade:230,fadeIn:280};
function l13TrOn(now){const T=L13.tr;return (T.flash&&now-T.flash<L13_TM.flash)||(T.fade&&now-T.fade<L13_TM.fade)||(T.fadeIn&&now-T.fadeIn<L13_TM.fadeIn);}
function l13Ease(k){return k<=0?0:k>=1?1:k*k*(3-2*k);}
function l13Col(m){try{const h=l13Out(m)?THM(m).dec[0]:DTH(m).acc,c=hx(h);return [Math.round(c[0]*.7+16),Math.round(c[1]*.7+10),Math.round(c[2]*.7+22)];}catch(e){return [40,24,60];}}
const L13_HX=[0,0];
function l13Hero(o,vw,vh){if(l13HD()&&HD.heroNdc){o[0]=(HD.heroNdc[0]+1)/2*vw;o[1]=(1-HD.heroNdc[1])/2*vh;}else{o[0]=Math.round(WS.px)+8-Math.round(WS.cam.x);o[1]=Math.round(WS.py)+8-Math.round(WS.cam.y);}return o;}
// the battle start: nine horizontal shards in the realm's colour race in from alternating sides, each a touch after the one above, with a bright
// leading edge, until they cover the view; the two white flashes stay (p = .14 to .29 and .43 to .57), the last third darkens toward the cut
function l13Battle(ctx,m,p,vw,vh,rm){const C=l13Col(m);if(rm){ctx.fillStyle=`rgba(${C[0]},${C[1]},${C[2]},${Math.min(1,p*1.2).toFixed(3)})`;ctx.fillRect(0,0,vw,vh);return;}
  const N=9,H=Math.ceil(vh/N);for(let i=0;i<N;i++){const d=i/N*.45,q=Math.max(0,Math.min(1,(p-d)/.45)),e=l13Ease(q),w=Math.round(vw*e);if(w<=0)continue;const y=i*H,fromL=i%2===0,x0=fromL?0:vw-w;
    ctx.fillStyle=`rgb(${C[0]},${C[1]},${C[2]})`;ctx.fillRect(x0,y,w,H);if(e<1){ctx.fillStyle='rgba(255,250,235,.7)';ctx.fillRect(fromL?x0+w-3:x0,y,3,H);}}
  const f=Math.floor(p*7);if(f===1||f===3){ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillRect(0,0,vw,vh);}
  if(p>.7){ctx.fillStyle=`rgba(10,6,18,${((p-.7)/.3*.92).toFixed(3)})`;ctx.fillRect(0,0,vw,vh);}}
// a doorway: the dark closes on the hero as a circle (out) and opens from him (in), with a soft rim; reduced motion keeps the plain fade
function l13Iris(ctx,vw,vh,p,out,rm){const a=out?p:1-p;if(rm){ctx.fillStyle=`rgba(8,4,2,${a.toFixed(3)})`;ctx.fillRect(0,0,vw,vh);return;}
  const o=l13Hero(L13_HX,vw,vh),hx=o[0],hy=o[1],Rm=Math.hypot(Math.max(hx,vw-hx),Math.max(hy,vh-hy))+6,R=Rm*(out?1-l13Ease(p):l13Ease(p));
  ctx.fillStyle='rgb(8,4,2)';if(R<=1){ctx.fillRect(0,0,vw,vh);return;}
  ctx.beginPath();ctx.rect(0,0,vw,vh);ctx.arc(hx,hy,R,0,Math.PI*2,true);ctx.fill('evenodd');
  const g=ctx.createRadialGradient(hx,hy,R*.78,hx,hy,R);g.addColorStop(0,'rgba(8,4,2,0)');g.addColorStop(1,'rgba(8,4,2,1)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(hx,hy,R+1,0,Math.PI*2);ctx.fill();}
// the return from a won battle: a warm bloom that clears from the hero outward
function l13Bloom(ctx,m,p,vw,vh){const e=l13Ease(p),o=l13Hero(L13_HX,vw,vh);ctx.fillStyle=`rgba(255,244,214,${((1-e)*.85).toFixed(3)})`;ctx.fillRect(0,0,vw,vh);
  const R=Math.max(vw,vh)*(.25+.75*e),g=ctx.createRadialGradient(o[0],o[1],1,o[0],o[1],R);g.addColorStop(0,`rgba(255,250,230,${((1-e)*.6).toFixed(3)})`);g.addColorStop(1,'rgba(255,250,230,0)');
  ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.fillRect(0,0,vw,vh);ctx.globalCompositeOperation='source-over';}
function l13TrDraw(now){const T=L13.tr,ctx=WS.ctx,m=WS.m,vw=WS.vw,vh=WS.vh;if(!ctx||!m||!WS.cv||!l13TrOn(now))return;const rm=l13Still(),live=l13HD();
  const k=Math.max(1,(WS.cv._rw||vw)/vw);ctx.save();ctx.setTransform(k,0,0,k,0,0);/* the real backing scale (above Low the canvas holds a 2x bitmap; battle3's identity-scaling patch covers only hdOverlay and hdBlit) */ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  try{if(T.flash&&now-T.flash<L13_TM.flash)l13Battle(ctx,m,(now-T.flash)/L13_TM.flash,vw,vh,rm);
    if(T.fade&&now-T.fade<L13_TM.fade)l13Iris(ctx,vw,vh,(now-T.fade)/L13_TM.fade,true,rm);
    else if(T.fadeIn&&now-T.fadeIn<L13_TM.fadeIn){const p=(now-T.fadeIn)/L13_TM.fadeIn;if(L13.bloom&&T.fadeIn>=L13.bloom&&T.fadeIn-L13.bloom<2000)l13Bloom(ctx,m,p,vw,vh);else l13Iris(ctx,vw,vh,p,false,rm);}}
  finally{ctx.restore();}L13.n.tr++;if(live)HD.ovClear=null;}// the overlay is cleared on the next frame (hdOverlay sees nothing busy)
HOOK.after('finishBattle','light13','the return from a won battle blooms',function(r,how){try{if(how==='win')L13.bloom=performance.now();}catch(e){}});
// the idle limiter (perf12) reads the stamps for its busy signature: a running transition keeps the frame rate up by itself
HOOK.before('worldDraw','light13','a running transition keeps the idle limiter busy',function(now){try{if(L13.off||typeof P12==='undefined')return;const t=+now||performance.now();if(l13TrOn(t))P12.w.busy=Math.max(P12.w.busy||0,t+P12.grace);}catch(e){}});
HOOK.wrap('worldDraw','light13','screen transitions: the battle shatter, the doorway iris, the victory bloom',function(next,...a){if(L13.off)return next(...a);const now=+a[0]||performance.now(),T=L13.tr;
  if(WS.flash)T.flash=WS.flash;if(WS.fade)T.fade=WS.fade;if(WS.fadeIn)T.fadeIn=WS.fadeIn;WS.flash=0;WS.fade=0;WS.fadeIn=0;
  const s0=typeof P12!=='undefined'?P12.n.wSkip:0;let r;
  try{r=next(...a);}finally{if(!WS.flash)WS.flash=T.flash;if(!WS.fade)WS.fade=T.fade;if(!WS.fadeIn)WS.fadeIn=T.fadeIn;
    try{if(!(typeof P12!=='undefined'&&P12.n.wSkip!==s0)&&WS.m&&V&&V.screen==='world')l13TrDraw(now);}catch(e){l13Err('trans',e);}}
  return r;});
