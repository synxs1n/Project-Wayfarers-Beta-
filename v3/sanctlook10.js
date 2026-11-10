// ===== sanctlook10.js (v0.14.x): the side Sanctums become sacred places, rooted in their realm =====
// The owner: "Sanctums need a rework of their look outside and inside, they should look more like sacred places that are part of the land."
// Before: a grey walled keep with crimson banners, a squat white gatehouse on the field. Now (look only; rooms, start, prize, guardAt, chests, the 'U' and
// 'E' tiles of the 3 x 2 gate and every collision are exactly as sites.js lays them out; this module only wraps drawing):
//  OUTSIDE  a shrine gate of the realm: two stone pillars under a stepped lintel, a tie beam with a rope, cloth ribbons and a bell, a plaque with the
//           sanctum sigil, a glowing door of light behind a worn stair of three steps, two stone lanterns that light at dusk, a ring of lighter ground and a
//           path of flat stones. The realm shows on the stone: moss and flowers (meadow), salt crust (coast), ember cracks (caves), snow caps and icicles
//           (snow), gilt (heights), star dust (void). 2D paints it into the base layer; HD-2D stands it up as geometry (two pillars, a lintel, a beam,
//           the door, three treads, two lanterns, ribbons and a bell as cards) from a small code drawn sheet.
//  INSIDE   pale bone and warm grey stone (DTHEME 'theme#fort%sanct') with the realm's accent instead of crimson: moss green, kelp teal, ember orange, frost
//           blue, gold, violet. The courtyard is a cloister garden (colonnade, grass and flowers, a raked gravel garden, stepping stones, flagstone
//           paths), pillars are carved columns with capitals, banners are hanging prayer cloths and some walls hold stained glass (with a light shaft and
//           a patch of coloured light on the floor), braziers are stone lanterns, the keep is a hall with a long runner carpet up to the rune circle,
//           candles along the aisle, and slow golden motes drift ('sanctmotes' replaces the 'flecks' ambience). The rune circle keeps its glow.
//  MUSIC    MOODS.fort and MTRACK.fort are a slow, sacred piece (harp, choir, organ, celesta) instead of the Iron Muster march. The key stays 'fort'.
// Same single wrap style as the other look modules: siteVariant/applyBossTheme/getMap set the palette, drawDTile and hdStructCanvas paint walls and floors,
// objCanvas swaps the pillar and the brazier, themeFX draws the motes, drawShrineRing/drawShrineFront/hdGatePart/hdGateGeo make the gate.
const SNC_ST={f:['#d0c7b5','#c3baa7','#ded6c6','#a0978a'],w:['#b4aa97','#9f9684','#cfc6b4','#3f382f'],top:'#3a342d',s:['#f1ebdb','#d8cfbb','#b3a995','#857c69','#5a5346']};
const SNC={
 meadow:{acc:'#78b840',acc2:'#d2ec92',cloth:['#4f8a38','#86c458'],glass:['#8fe07a','#f6eb8e'],lg:'#c4e892',gr:['#6aa048','#7cb858','#4e8a38'],bloom:['#fff4c8','#f2a8c8'],cap:'moss',tone:'#d8e8b0'},
 coast:{acc:'#3fc0ae',acc2:'#b0f4e4',cloth:['#2b9488','#68d6c6'],glass:['#5fe0d0','#c4f6ff'],lg:'#eadfb4',gr:['#7ab89a','#92ccae','#5e9c80'],bloom:['#fff0e8','#f4a8b8'],cap:'salt',tone:'#c8e4dc'},
 cave:{acc:'#ff8a3a',acc2:'#ffd070',cloth:['#b8501c','#ff8a3a'],glass:['#ff9a40','#ffdc80'],lg:'#bba48c',gr:['#6a5a44','#7e6a50','#524436'],bloom:['#ff8a3a','#ffd070'],cap:'ember',tone:'#e8d0b0'},
 snow:{acc:'#8fd0ff',acc2:'#e8f8ff',cloth:['#4a86cc','#8fd0ff'],glass:['#8fd0ff','#eaf8ff'],lg:'#f4faff',gr:['#c9d9e8','#e2edf6','#9fb6cc'],bloom:['#bfe6ff','#ffffff'],cap:'snow',tone:'#d4e6f6'},
 heights:{acc:'#f2c93a',acc2:'#fff2a8',cloth:['#bd9020','#f2c93a'],glass:['#ffd860','#fff6c8'],lg:'#e8e0a8',gr:['#a8a068','#bcb27a','#8c8452'],bloom:['#fff2a8','#f2c93a'],cap:'gold',tone:'#f0e4b8'},
 void:{acc:'#b080ff',acc2:'#e2ccff',cloth:['#7444bc','#b080ff'],glass:['#b080ff','#8ae6d4'],lg:'#d6c8ff',gr:['#5a4c8a','#6e5ea0','#463a70'],bloom:['#e2ccff','#8ae6d4'],cap:'star',tone:'#d8ccf0'}};
const SNC_P=th=>SNC[th]||SNC.meadow;
const SNCX={dm:null,fm:null};
// the realm tinted stone ramp (light .. dark) used by the gate, the columns and the lanterns
function sncStone(P){return SNC_ST.s.map(c=>lerpHex(c,P.acc,.07));}
// the key keeps the '#fort' kind and ends in the material ('%sanct'), like every site look since v0.8.2 (dungeon8.js d8Var makes the same id)
function sncVariant(theme){const id=theme+'#fort%sanct';if(DTHEME[id]&&DTHEME[id].cloth)return id;const P=SNC_P(theme);
  DTHEME[id]={f:SNC_ST.f.map(c=>lerpHex(c,P.acc,.06)),w:SNC_ST.w.map(c=>lerpHex(c,P.acc,.07)),top:lerpHex(SNC_ST.top,P.acc,.05),acc:P.acc,acc2:P.acc2,name:'sanct',
    cloth:P.cloth,glass:P.glass,lg:P.lg,gr:P.gr,bloom:P.bloom,cap:P.cap};
  if(!THEME[id])THEME[id]=THEME[theme]||THEME.meadow;return id;}
// a neutral entry so the battle backdrop of a fight in the Sanctum (spec.d8) is pale stone, not the keep's crimson banners
if(typeof D8M!=='undefined'&&!D8M.sanct)D8M.sanct={n:'Sanctum',f:SNC_ST.f.slice(),w:SNC_ST.w.slice(),top:SNC_ST.top,acc:'#f2c93a',acc2:'#fff0a0',lt:'torch',dark:'rgba(34,26,30,.5)',hero:'rgba(255,226,170,.2)'};
function sncApply(m){if(!m||!m.fort||!m.cave)return;const th=m.theme,P=SNC_P(th);
  m.thv=sncVariant(th);m.amb='sanctmotes';m.btint='rgba('+hx(P.acc).join(',')+',.035)';m.motif=null;
  if(typeof D8M!=='undefined'&&D8M.sanct){m.d8='sanct';m.d8org=0;}
  m.d8dark='rgba(30,24,30,.46)';m.d8hero='rgba(255,230,180,.22)';}
HOOK.after('applyBossTheme','sanctlook10','sanctum look',function(r,m){try{sncApply(m);}catch(e){}});
HOOK.wrap('getMap','sanctlook10','sanctum look (after the dungeon material is set)',function(next,...a){const m=next(...a);try{if(m&&m.fort&&!m.__snc){m.__snc=1;sncApply(m);}}catch(e){}return m;});

// ---------- where things are in the Sanctum (v0.14.5: the layout is a symmetric temple on one axis, turned to the way in; sites.js buildFort) ----------
// m.fo holds the canonical frame (u across, v along, the player walks toward +v) and its facing; sncGeo derives the converters, the carpet and the candles.
function sncGeo(m){if(m.__sg)return m.__sg;const g=m.fo,o={ok:false};
  try{if(g&&m.start&&m.prize){const dir=g.dir,inv=fortInv(dir,g.B,g.L),xf=fortXf(dir,g.B,g.L),cx=g.cx;
    Object.assign(o,{g,dir,inv,xf,cx,gate:g.gate,yard:g.nave,hall:g.hall,gv:g.gv});o.ok=tileAt(m,m.start[0],m.start[1])!=='#';
    if(o.ok){const C=new Set(),add=(u,v)=>{const p=xf(u,v);if(!'#PvXCE'.includes(tileAt(m,p[0],p[1])||'#'))C.add(p[0]+','+p[1]);};
      for(let v=g.gate.v0+1;v<g.gv;v++)for(let u=cx-1;u<=cx+1;u++)add(u,v);o.carpet=C;// the runner: from the start tile straight up the axis to the rune circle
      const cd=new Set();for(let v=g.hall.v0+2;v<g.gv-1;v+=2)[cx-2,cx+2].forEach(u=>{const p=xf(u,v);if(tileAt(m,p[0],p[1])==='.')cd.add(p[0]+','+p[1]);});o.candles=cd;}}}catch(e){o.ok=false;}
  return m.__sg=o;}
const sncTvRaw=(x,y)=>((x*7+y*13)%4+4)%4;
// a map tile in the canonical frame, folded across the axis (so a tile and its mirror image give the same answer)
function sncCanon(m,x,y){const o=m&&m.fo?sncGeo(m):null;if(!o||!o.ok)return [x,y];const p=o.inv(x,y);return [Math.min(p[0],o.g.B-1-p[0]),p[1]];}
// the wall face variant: 2 = prayer cloth, 3 = window. In 2D it is symmetric about the axis; HD-2D picks it with its own hash (hd2d.js tv), so match that there
function sncTv(x,y,m){try{if(typeof HD!=='undefined'&&HD.live&&HD.S&&HD.S.m===m)return sncTvRaw(x,y);}catch(e){}const p=sncCanon(m,x,y);return sncTvRaw(p[0],p[1]);}

// the realm's weathering on a horizontal stone surface: a strip along y of width w (f paints relative to the tile or the sprite)
function sncCap(f,x,y,w,P,R,thick){const k=P.cap;
  for(let i=0;i<w;i++){const r=R();
    if(k==='moss'){if(r<.75){f(r<.45?'#4e8a34':'#76b44c',x+i,y-1-(r<.2?1:0),1,2);}if(r>.96)f('#fff4c8',x+i,y-2,1,1);}
    else if(k==='snow'){f('#ffffff',x+i,y-1-((i>>1)%3===0?1:0),1,2);if(i%3===1)f('#c6dcee',x+i,y+1,1,1);if(i%6===2)f('#e4f4ff',x+i,y+2,1,1+(r<.5?2:1));}
    else if(k==='salt'){if(r<.6)f(r<.3?'#f4f8f4':'#bfe8e0',x+i,y-1,1,1);if(r>.9)f('#d8d0c0',x+i,y-1,2,1);if(i%7===3)f('#5cc8b8',x+i,y+1,1,2);}
    else if(k==='ember'){if(r<.5)f('#2a2420',x+i,y-1,1,1);if(i%6===2){f('#ff8a3a',x+i,y,1,1);f('#ffd070',x+i,y,1,1);}}
    else if(k==='gold'){f('#f2c93a',x+i,y,1,1);if(r>.8)f('#fff6c0',x+i,y,1,1);}
    else{if(r<.4)f(r<.15?'#ffffff':r<.28?'#e2ccff':'#b080ff',x+i,y-1,1,1);}}}

// ---------- walls: a pale ashlar face with a cornice, a plinth, prayer cloths and stained glass ----------
function sncFace(f,R,D,H,v,x,y,m,L,px,py){const W=D.w;
  f(W[0],0,0,16,H);
  for(let r=2;r<H-2;r+=4){const off=(r/4+x)%2?0:4;for(let i=-off;i<16;i+=8){const col=R()<.22?W[2]:R()<.5?W[0]:shade(W[0],.96),a=Math.max(0,i),w=Math.min(7,16-a);f(col,a,r,w,3);f(tint(col,.22),a,r,w,1);}f(W[1],0,r+3,16,1);}
  f(tint(W[0],.4),0,0,16,2);f(W[2],0,2,16,1);f('rgba(60,48,36,.35)',0,3,16,1);// cornice
  f(W[1],0,H-4,16,3);f(W[2],0,H-4,16,1);f(W[3],0,H-1,16,1);f('rgba(0,0,0,.14)',0,H-3,16,2);// plinth
  const t0=4,t1=H-6;
  if(v===2&&(x*3+y*5)%7!==0){// a prayer cloth on a rod: the realm's cloth, a gold sigil, a swallow tail and fringe
    f('#6a5a3a',3,t0-1,10,1);f('#e8c860',3,t0-1,1,1);f('#e8c860',12,t0-1,1,1);f(D.cloth[0],4,t0,8,t1-t0-2);f(D.cloth[1],5,t0,2,t1-t0-2);f(shade(D.cloth[0],.78),10,t0,2,t1-t0-2);
    f('#f0dc98',4,t0+1,8,1);const sy=t0+Math.max(3,Math.floor((t1-t0)*.35));f('#f6e8b0',7,sy,2,2);f('#f6e8b0',6,sy+1,4,1);f('#f6e8b0',7,sy+3,2,1);
    f(D.cloth[0],4,t1-2,3,2);f(D.cloth[0],9,t1-2,3,2);f(shade(D.cloth[0],.7),7,t1-2,2,1);for(let i=4;i<12;i+=2)f('#e8c860',i,t1,1,1);}
  else if(v===3){// stained glass in an arched window, lead lines, a deep reveal and a sill; the light is added by the caller
    const wy=Math.max(2,t0-1),wh=Math.max(10,t1-wy-1);f(W[3],4,wy,8,wh);f(W[1],3,wy+1,10,wh);f(W[3],4,wy+1,8,wh-1);
    const g=D.glass;for(let j=0;j<wh-2;j++){const k=j/(wh-2);f(lerpHex(g[1],g[0],k*.85),5,wy+1+j,6,1);}
    f(lerpHex(g[0],'#ffffff',.5),6,wy+3,2,3);f(g[1],8,wy+wh-6,2,3);
    f(W[3],4,wy,2,1);f(W[3],10,wy,2,1);f('#3a3024',7,wy+1,2,wh-2);f('#3a3024',5,wy+Math.floor(wh/2),6,1);
    f(W[2],3,wy+wh,10,1);f(W[1],3,wy+wh+1,10,1);
    if(L&&(x+y)%2===0)L.push([px+8,py+Math.floor(wy+wh/2),22,'day']);}
  else if((x*5+y*3)%9===0){// a carved sigil in a shallow roundel
    f(W[1],5,t0+1,6,6);f(W[0],6,t0+2,4,4);f(D.acc,7,t0+3,2,2);f(D.acc2,7,t0+3,1,1);}
}
function sncTop(f,R,D){f(D.top,0,0,16,16);for(let i=0;i<4;i++)f(shade(D.w[3],1.4),Math.floor(R()*14),Math.floor(R()*14),2,1);for(let i=0;i<2;i++)f(tint(D.top,.07),Math.floor(R()*13),Math.floor(R()*13),3,1);}

// ---------- floors ----------
const SNC_CAPCOL={moss:['#6a9a44','#8cc060'],salt:['#f0f6f2','#a8dcd0'],ember:['#3a2a22','#ff8a3a'],snow:['#ffffff','#cfe4f4'],gold:['#f2c93a','#fff0a0'],star:['#b080ff','#e8d8ff']};
function sncFloor(f,R,D,P,x,y,m,L,px,py,ctx){const F=D.f,o=sncGeo(m);let reg='room';
  if(o.ok){const q=o.inv(x,y),u=q[0],v=q[1],k=o.hall,yd=o.yard;if(u>=k.u0&&u<=k.u1&&v>=k.v0&&v<=k.v1)reg='hall';else if(u>=yd.u0&&u<=yd.u1&&v>=yd.v0&&v<=yd.v1)reg='yard';}
  // flagstones
  f(F[0],0,0,16,16);
  if(reg==='hall'){for(let j=0;j<2;j++){const off=((x+y+j)%2)?4:0;for(let i=-off;i<16;i+=12){const a=Math.max(0,i),w=Math.min(11,16-a),col=R()<.3?F[2]:R()<.5?F[0]:F[1];f(col,a,j*8,w,7);f(tint(col,.16),a,j*8,w,1);}f(F[3],0,j*8+7,16,1);}
    for(let j=0;j<2;j++){const off=((x+y+j)%2)?4:0;f(F[3],(off+11)%16,j*8,1,8);}}
  else{for(let j=0;j<2;j++)for(let i=0;i<2;i++){const col=R()<.3?F[2]:R()<.5?F[0]:F[1];f(col,i*8,j*8,7,7);f(tint(col,.14),i*8,j*8,7,1);}
    f(F[3],7,0,1,16);f(F[3],15,0,1,16);f(F[3],0,7,16,1);f(F[3],0,15,16,1);if(R()<.18){const cx=Math.floor(R()*12)+2,cy=Math.floor(R()*12)+2;f(F[3],cx,cy,3,1);f(F[3],cx+2,cy+1,1,2);}}
  const cc=SNC_CAPCOL[P.cap]||SNC_CAPCOL.moss;
  const wall=(dx,dy)=>tileAt(m,x+dx,y+dy)==='#';
  // the realm settles into the joints, more where it is wet and old (by walls and in the yard)
  const wet=(wall(0,-1)||wall(-1,0)||wall(1,0)||wall(0,1))?.22:.07;
  if(R()<wet){const a=Math.floor(R()*12)+1;for(let i=0;i<3+Math.floor(R()*3);i++){f(R()<.5?cc[0]:cc[1],a+i,(i%2?7:15),1,1);}}
  if(reg==='yard')sncYard(f,R,D,P,x,y,m,o,L,px,py,cc);
  else if(reg==='hall')sncHall(f,R,D,P,x,y,m,o,L,px,py,ctx);
  if(o.ok&&o.carpet.has(x+','+y))sncCarpet(f,D,o,x,y);// the runner lies over the flagstones, the garden path and the hall alike
  // light from a window above (the nearest wall north of this floor tile within three tiles is stained glass): a patch of coloured light
  for(let k=1;k<=3;k++){const t=tileAt(m,x,y-k);if(t==='#'){if(sncTv(x,y-k,m)===3){const q=(4-k)/4;ctx.fillStyle='rgba('+hx(D.glass[1]).join(',')+','+(.2*q).toFixed(2)+')';ctx.fillRect(px+1,py,14,16);ctx.fillStyle='rgba('+hx(D.glass[0]).join(',')+','+(.16*q).toFixed(2)+')';ctx.fillRect(px+4,py+1,8,13);}break;}}
  if(wall(0,-1)){ctx.fillStyle='rgba(40,28,20,.30)';ctx.fillRect(px,py,16,3);}
  if(wall(-1,0)){ctx.fillStyle='rgba(40,28,20,.16)';ctx.fillRect(px,py,2,16);}
}
// the nave: a cloister garden between a colonnade each side of the axis, in the canonical frame (u across, v along). kind: path, grass, gravel, walk (the covered walk) or out
function sncYKind(o,u,v){const n=o.yard;if(u<n.u0||u>n.u1||v<n.v0||v>n.v1)return 'out';
  if(Math.abs(u-o.cx)<=1||o.g.rows.includes(v))return 'path';
  if(u<n.u0+2||u>n.u1-2||v<n.v0+2||v>n.v1-2)return 'walk';
  return v<(n.v0+n.v1)/2?'grass':'gravel';}
const sncYK=(o,x,y)=>{const q=o.inv(x,y);return sncYKind(o,q[0],q[1]);};
function sncYard(f,R,D,P,x,y,m,o,L,px,py,cc){if(!o.ok)return;const k=sncYK(o,x,y),g=P.gr,F=D.f,cn=sncCanon(m,x,y),hx0=cn[0],hy0=cn[1];
  if(k==='grass'){f(g[0],0,0,16,16);for(let i=0;i<14;i++){const gx=Math.floor(R()*15),gy=Math.floor(R()*13)+2;f(R()<.5?g[1]:g[2],gx,gy,1,2+(R()<.3?1:0));}
    for(let i=0;i<3;i++)f(g[1],Math.floor(R()*13),Math.floor(R()*14),2,1);
    const h=((hx0*29+hy0*53)%7);if(h<3){const bx=2+Math.floor(R()*10),by=3+Math.floor(R()*9);for(let i=0;i<3;i++){const c=P.bloom[(i+h)%2];f(c,bx+(i*3)%6,by+(i*2)%5,2,2);f('#ffffff',bx+(i*3)%6,by+(i*2)%5,1,1);}}}
  else if(k==='gravel'){f(lerpHex(F[2],'#ffffff',.25),0,0,16,16);for(let j=0;j<4;j++){const yy=j*4+1,ph=(hx0*5+j*3)%6;f(F[3],0,yy,16,1);f(F[0],0,yy+1,16,1);for(let i=0;i<16;i+=1){const w=Math.round(Math.sin((i+ph)/2.2));if(w>0)f(F[1],i,yy+(w?0:0),1,1);}}
    for(let i=0;i<6;i++)f(R()<.5?F[0]:F[3],Math.floor(R()*15),Math.floor(R()*15),1,1);
    if((hx0*13+hy0*7)%9===0){const sx=3+Math.floor(R()*6),sy=4+Math.floor(R()*6);f('rgba(60,50,40,.28)',sx+1,sy+3,8,2);f(shade(F[0],.9),sx,sy,8,4);f(tint(F[0],.35),sx+1,sy,6,1);f(F[3],sx,sy+3,8,1);if(P.cap==='moss')f('#6aa044',sx+1,sy-1,4,1);}}
  else if(k==='path'){f(lerpHex(F[1],P.gr[0],.18),0,0,16,16);for(let i=0;i<3;i++){const sx=((i*5+hx0*3+hy0)%7),sy=i*5;f('rgba(60,50,40,.3)',sx+1,sy+3,8,2);f(F[0],sx,sy+1,8,4);f(tint(F[2],.3),sx+1,sy+1,6,1);f(F[3],sx,sy+4,8,1);}}
  // a curb where garden meets path or walk
  if(k==='grass'||k==='gravel'){const nb=(dx,dy)=>{const q=sncYK(o,x+dx,y+dy);return q==='path'||q==='walk'||q==='out';};
    if(nb(0,-1)){f(F[3],0,0,16,1);f(tint(F[2],.4),0,1,16,1);}if(nb(0,1)){f(F[3],0,15,16,1);}if(nb(-1,0)){f(F[3],0,0,1,16);}if(nb(1,0)){f(F[3],15,0,1,16);}}}
// the runner carpet with gold trim and fringe: a long strip from the start tile up the axis to the rune circle (the edges of its set decide the trim)
function sncCarpet(f,D,o,x,y){const C=o.carpet,has=(dx,dy)=>C.has((x+dx)+','+(y+dy)),cl=D.cloth,vert=o.dir==='n'||o.dir==='s';
  const st=(e,d,t,col)=>e==='T'?f(col,0,d,16,t):e==='B'?f(col,0,16-d-t,16,t):e==='L'?f(col,d,0,t,16):f(col,16-d-t,0,t,16);
  f(cl[0],0,0,16,16);f(shade(cl[0],.9),0,0,16,16);f(cl[0],1,1,14,14);
  f(cl[1],7,5,2,6);f(cl[1],5,7,6,2);f(shade(cl[0],.7),7,7,2,2);// a diamond motif
  const E={T:!has(0,-1),B:!has(0,1),L:!has(-1,0),R:!has(1,0)};
  if(vert&&!E.T&&!E.B){f(tint(cl[0],.12),3,0,1,16);f(tint(cl[0],.12),12,0,1,16);}
  if(!vert&&!E.L&&!E.R){f(tint(cl[0],.12),0,3,16,1);f(tint(cl[0],.12),0,12,16,1);}
  Object.keys(E).forEach(e=>{if(!E[e])return;const end=vert?(e==='T'||e==='B'):(e==='L'||e==='R');
    if(end){st(e,0,1,'#2a2018');st(e,1,2,'#f0dc98');st(e,3,1,'#8a7030');}
    else{st(e,0,2,'#f0dc98');st(e,2,1,'#8a7030');for(let j=0;j<16;j+=2){if(e==='L')f('#e8c860',0,j,1,1);else if(e==='R')f('#e8c860',15,j,1,1);else if(e==='T')f('#e8c860',j,0,1,1);else f('#e8c860',j,15,1,1);}}});}
// the hall: a polished floor, candles on the floor along the aisle, a pale dais under the rune circle
function sncHall(f,R,D,P,x,y,m,o,L,px,py,ctx){if(!o.ok)return;const key=x+','+y;
  if(!o.carpet.has(key)&&o.candles&&o.candles.has(key)){// a candle in a dish, lit
    const cx=5+Math.floor(R()*5);f('rgba(40,30,20,.3)',cx-1,12,6,2);f('#8a8070',cx-1,11,5,2);f('#cfc6b3',cx,11,3,1);f('#f6f0e0',cx+1,6,2,5);f('#fff6d0',cx+1,6,1,2);f('#ffd870',cx+1,4,2,2);f('#fff8e0',cx+1,4,1,1);
    L.push([px+cx+1,py+7,14,'lamp']);}
  // the dais ring under the rune circle: a paler step round the guardian's tile (its edges follow the axis, whichever way the hall faces)
  const q=o.inv(x,y),u=q[0],v=q[1];
  if(Math.abs(u-o.cx)<=1&&v>=o.gv&&v<=o.gv+2){const edge=(du,dv,col,th)=>{const a=o.xf(u,v),b=o.xf(u+du,v+dv),dx=b[0]-a[0],dy=b[1]-a[1];if(dx<0)f(col,0,0,th,16);else if(dx>0)f(col,16-th,0,th,16);else if(dy<0)f(col,0,0,16,th);else f(col,0,16-th,16,th);};
    if(u===o.cx-1)edge(-1,0,tint(D.f[2],.3),1);if(u===o.cx+1)edge(1,0,tint(D.f[2],.3),1);if(v===o.gv)edge(0,-1,tint(D.f[2],.3),1);}
}
// the stairs out (the start room's door): three pale steps in warm light. The art is drawn with the way out at the top (you walk south in); turned for the other facings
function sncDoor(f0,D,L,px,py,dir){dir=dir||'s';
  const f=dir==='n'?(c,a,b,w,h)=>f0(c,a,16-b-h,w,h):dir==='e'?(c,a,b,w,h)=>f0(c,b,a,h,w):dir==='w'?(c,a,b,w,h)=>f0(c,16-b-h,a,h,w):f0;
  f('#3a3028',0,0,16,16);for(let i=0;i<5;i++){const yy=12-i*3;f(tint(D.f[0],.3),1+i,yy,14-i*2,2);f(shade(D.f[0],.82),1+i,yy+2,14-i*2,1);}f('#fff6d0',4,0,8,3);f('#ffe9a0',1,0,1,16);f('#ffe9a0',14,0,1,16);
  L.push(dir==='n'?[px+8,py+14,46,'day']:dir==='e'?[px+2,py+8,46,'day']:dir==='w'?[px+14,py+8,46,'day']:[px+8,py+2,46,'day']);}
// the rune circle tile (X): a faint accent ring on the floor; sites.js drawHallRunes adds the big glow around it
function sncRune(f,ctx,D){ctx.globalAlpha=.7;for(let a=0;a<24;a++){const t=a/24*Math.PI*2;f(D.acc,8+Math.round(Math.cos(t)*7),8+Math.round(Math.sin(t)*5),1,1);}ctx.globalAlpha=1;}
function sncTile(ctx,m,x,y,frame){const D=DTH(m),P=SNC_P(m.theme),c=tileAt(m,x,y),px=x*TS,py=y*TS,cn=sncCanon(m,x,y),R=mulberry(cn[0]*5113+cn[1]*2671+m.s*7),L=m.lights=m.lights||[];/* cn: the tile folded across the axis, so a tile and its mirror image are dressed alike */
  const f=(col,a,b,w,h)=>{ctx.fillStyle=col;ctx.fillRect(px+a,py+b,w,h);};const isW=(dx,dy)=>tileAt(m,x+dx,y+dy)==='#';
  if(c==='#'){
    if(!isW(0,1)){sncFace(f,R,D,16,sncTv(x,y,m),cn[0],cn[1],m,L,px,py);
      if(sncTv(x,y,m)===0&&(cn[0]*3+cn[1]*5)%11===0&&tileAt(m,x,y+1)!=='~'){f('#6a5a3a',7,5,2,1);f('#e8c860',6,6,4,5);f('#fff0b0',7,7,2,3);L.push([px+8,py+6,22,'torch']);m.torches=m.torches||[];m.torches.push([px+8,py+6]);}}// a wall lamp: a small gilt oil lamp
    else{sncTop(f,R,D);if(!isW(-1,0))f(D.w[1],0,0,2,16);if(!isW(1,0))f(D.w[1],14,0,2,16);if(!isW(0,-1))f(D.w[1],0,0,16,2);}
    return;}
  sncFloor(f,R,D,P,x,y,m,L,px,py,ctx);
  if(c==='E')sncDoor(f,D,L,px,py,m.fo&&m.fo.dir);
  if(c==='X'||(c==='.'&&m.bossAt&&x===m.bossAt[0]&&y===m.bossAt[1]))sncRune(f,ctx,D);
}
{const dt0=drawDTile;drawDTile=function(ctx,m,x,y,frame){if(m&&m.fort&&m.kind==='dungeon'&&!m.archive)return sncTile(ctx,m,x,y,frame);return dt0.apply(this,arguments);};}
// HD-2D: the block faces (band A) and tops (band C) of the struct strip, redrawn after the dungeon material has painted them
{const hs0=hdStructCanvas;hdStructCanvas=function(m,S){const cv=hs0.apply(this,arguments);try{if(m&&m.kind==='dungeon'&&m.fort&&!m.archive){const c=cv.getContext('2d'),D=DTH(m),HA=S.hArt;
    for(let v=0;v<4;v++){const x0=v*16,R=mulberry(v*997+m.s*31+7),f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x0+x,y,w,h);};c.clearRect(x0,0,16,HA);sncFace(f,R,D,HA,v,v+3,v*2+1,m,null,0,0);f('rgba(0,0,0,.14)',0,HA-4,16,3);
      const R2=mulberry(v*71+m.s+3),g=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x0+x,80+y,w,h);};c.clearRect(x0,80,16,16);sncTop(g,R2,D);}}}catch(e){}return cv;};}

// ---------- props: carved columns and stone lanterns ----------
function sncPillarCv(D){const key='pil'+D.acc+D.w[0];if(SNCX[key])return SNCX[key];const P=Object.values(SNC).find(p=>p.acc===D.acc)||SNC.meadow,S=sncStone(P),cv=mkCv(14,30),c=cv.getContext('2d'),f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},R=mulberry(77);
  f(S[3],1,29,12,1);f(S[1],1,27,12,2);f(S[0],1,27,12,1);f(S[3],2,28,11,1);f(S[2],2,25,10,2);f(S[0],2,25,9,1);// plinth and torus
  f(S[1],3,6,8,19);f(S[0],3,6,2,19);f(S[2],9,6,2,19);f(S[3],10,6,1,19);f(S[2],6,6,1,19);f(S[2],8,6,1,19);// shaft with flutes
  f(S[3],3,24,8,1);f(S[3],3,6,8,1);
  f(P.acc,3,22,8,1);f(P.acc2,4,22,2,1);// a glowing band
  f(S[2],3,5,8,1);f(S[1],2,3,10,2);f(S[0],2,3,10,1);f(S[3],2,5,10,1);// necking and echinus
  f(S[1],1,0,12,3);f(S[0],1,0,12,1);f(S[3],1,2,12,1);// abacus
  f(S[2],1,3,2,3);f(S[3],1,3,1,3);f(S[2],11,3,2,3);f(S[3],12,3,1,3);f(S[0],2,3,1,1);f(S[0],11,3,1,1);// volutes
  f(P.acc,6,3,2,2);f(P.acc2,6,3,1,1);
  sncCap((col,x,y,w,h)=>f(col,x,y,w,h),1,0,12,P,R);
  if(P.cap==='moss'||P.cap==='salt')sncCap((col,x,y,w,h)=>f(col,x,y,w,h),1,28,12,P,R);
  return SNCX[key]=cv;}
function sncLanternCv(D,v){const key='lan'+D.acc+D.w[0]+v;if(SNCX[key])return SNCX[key];const P=Object.values(SNC).find(p=>p.acc===D.acc)||SNC.meadow,S=sncStone(P),cv=mkCv(16,22),c=cv.getContext('2d'),f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},R=mulberry(91);
  const g=c.createRadialGradient(8,10,1,8,10,8);g.addColorStop(0,'rgba(255,214,120,.5)');g.addColorStop(1,'rgba(255,214,120,0)');c.fillStyle=g;c.fillRect(0,2,16,16);
  f(S[3],4,21,8,1);f(S[1],4,18,8,3);f(S[0],4,18,8,1);f(S[3],4,20,8,1);// foot
  f(S[1],6,12,4,6);f(S[0],6,12,1,6);f(S[3],9,12,1,6);// post
  f(S[2],4,11,8,2);f(S[0],4,11,8,1);// ring
  f(S[1],4,6,8,5);f(S[0],4,6,8,1);f(S[3],4,10,8,1);f(S[2],4,6,1,5);f(S[3],11,6,1,5);// firebox
  f('#3a2c1c',6,7,4,3);f('#ff9a30',6+(v?0:1),8-(v?1:0),3,2+(v?1:0));f('#ffd870',7,8-(v?1:0),2,2);f('#fffbe6',7+(v?0:0),9,1,1);// the flame in the window
  f(S[3],3,5,10,1);f(S[1],2,4,12,1);f(S[0],3,3,10,1);f(S[1],4,2,8,1);f(S[0],5,1,6,1);f(S[2],2,5,12,1);// roof
  f(S[3],7,0,2,1);f(P.acc,7,0,2,1);f(P.acc2,7,0,1,1);
  sncCap((col,x,y,w,h)=>f(col,x,y,w,h),4,1,8,P,R);
  return SNCX[key]=cv;}
HOOK.before('objCanvas','sanctlook10','sanctum pillars and lanterns',function(theme,kind,v){try{const m=SNCX.dm||(kind==='brazier'&&typeof WS!=='undefined'?WS.m:null);
  if(m&&m.fort&&m.kind==='dungeon'&&!m.archive){const D=DTH(m);if(D&&D.cloth){if(kind==='pillar')return HOOK.stop(sncPillarCv(D));if(kind==='brazier')return HOOK.stop(sncLanternCv(D,v?1:0));}}}catch(e){}});
HOOK.wrap('drawObjects','sanctlook10','sanctum prop context (SNCX.dm)',function(next,ctx,m,y){const was=SNCX.dm;SNCX.dm=m&&m.fort&&m.kind==='dungeon'?m:null;try{return next(ctx,m,y);}finally{SNCX.dm=was;}});

// ---------- the air: slow golden motes and a soft light tint ('sanctmotes' replaces the old 'flecks') ----------
{const tf0=themeFX;themeFX=function(ctx,m,vw,vh,now){if(!m||m.amb!=='sanctmotes')return tf0.apply(this,arguments);
  const still=typeof reducedMotion==='function'&&reducedMotion(),t=still?0:now/1000,P=SNC_P(m.theme);
  if(m.btint){ctx.fillStyle=m.btint;ctx.fillRect(0,0,vw,vh);}
  // two slanted shafts of soft light, swaying very slowly
  for(let i=0;i<3;i++){const x0=((i*0.37+0.12)*vw+Math.sin(t*.12+i*2)*14)%vw,w=24+i*8,g=ctx.createLinearGradient(x0,0,x0+vh*.35,vh);g.addColorStop(0,'rgba(255,238,190,.07)');g.addColorStop(1,'rgba(255,238,190,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x0,0);ctx.lineTo(x0+w,0);ctx.lineTo(x0+w+vh*.35,vh);ctx.lineTo(x0+vh*.35,vh);ctx.fill();}
  const gl=hx(P.acc2);
  for(let i=0;i<20;i++){const sx0=(i*97+13)%vw,sy0=(i*61+7)%vh,x=(sx0+Math.sin(t*.35+i*1.7)*10+vw)%vw,y=(sy0-t*(3+i%4)+vh*4)%vh,tw=.55+.45*Math.sin(t*1.1+i*2.3),a=(.35+.5*tw).toFixed(2);
    ctx.fillStyle='rgba(255,226,140,'+(.08*tw).toFixed(3)+')';ctx.fillRect(Math.floor(x)-1,Math.floor(y)-1,3,3);
    ctx.fillStyle=i%5===0?'rgba('+gl.join(',')+','+a+')':'rgba(255,230,150,'+a+')';ctx.fillRect(Math.floor(x),Math.floor(y),1,1);}};}

// ---------- the rune circle keeps its glow (warm gold and the realm's accent now) ----------
{const hr0=drawHallRunes;drawHallRunes=function(ctx,m){if(!m||!m.fort)return hr0.apply(this,arguments);const g=m.guardAt;if(!g)return;const cx=g[0]*TS+8,cy=g[1]*TS+9,D=DTH(m),col=D.acc;
  ctx.save();const gl=ctx.createRadialGradient(cx,cy,2,cx,cy,54);gl.addColorStop(0,'rgba('+hx(D.acc2).join(',')+',.42)');gl.addColorStop(.55,'rgba('+hx(col).join(',')+',.16)');gl.addColorStop(1,'rgba('+hx(col).join(',')+',0)');ctx.fillStyle=gl;ctx.fillRect(cx-58,cy-50,116,100);
  for(let ring=0;ring<2;ring++){const rx=ring?44:30,ry=ring?32:21,n=ring?60:40;ctx.globalAlpha=ring?.8:1;
    for(let a=0;a<n;a++){const t=a/n*Math.PI*2;ctx.fillStyle=(a%5===0)?'#fff8dc':col;ctx.fillRect(Math.round(cx+Math.cos(t)*rx),Math.round(cy+Math.sin(t)*ry),1,1);}}
  ctx.globalAlpha=.85;ctx.fillStyle=D.acc2;for(let a=0;a<8;a++){const t=a/8*Math.PI*2+.2,px=Math.round(cx+Math.cos(t)*37),py=Math.round(cy+Math.sin(t)*26.5);ctx.fillRect(px-1,py,3,1);ctx.fillRect(px,py-1,1,3);}
  ctx.globalAlpha=.5;ctx.fillStyle=col;for(let a=0;a<4;a++){const t=a*Math.PI/2+Math.PI/4;for(let k=0;k<18;k++){const q=k/18;ctx.fillRect(Math.round(cx+Math.cos(t)*30*q*1.1),Math.round(cy+Math.sin(t)*21*q*1.1),1,1);}}
  ctx.restore();};}

// ---------- music: slow and sacred (the key stays 'fort') ----------
if(typeof MOODS!=='undefined')MOODS.fort={bpm:62,sc:'dorian',prog:[0,5,3,4],lead:'triangle',dr:0,feel:.3,low:0};
if(typeof MTRACK!=='undefined'){const SA_A='E5h. D5q | C5h A4h | B4h. C5q | E5w | D5h. A4q | C5h A4h | A4h G#4h | A4w',SA_A_CH='Am | F | C | Am | Dm | Am | F:2 E:2 | Am',
  SA_B='C5h E5h | F5h. E5q | D5h B4h | C5w | A5h. G5q | F5h E5h | D5h. E5q | C5w',SA_B_CH='C | F | G | Am | F | Dm | E | Am';
  MTRACK.fort=o=>({name:'Sanctum: Still Hours',bpm:62,tr:o.tr||0,tonic:9,room:'cathedral',resume:1,form:['A','B','A2'],sec:{
    A:{bars:8,ch:SA_A_CH,p:[['harp',SA_A,{v:.75}],['choir','pad',{o:4,v:.2}],['organ','pedal',{o:2,v:.3}]],dr:{tri:'x'+'.'.repeat(63)}},
    B:{bars:8,ch:SA_B_CH,p:[['flute',SA_B,{v:.55}],['celesta','arp8',{o:4,v:.3}],['strings','pad',{o:3,v:.18}],['organ','pedal',{o:2,v:.3}]]},
    A2:{bars:8,ch:SA_A_CH,p:[['celesta',SA_A,{v:.6}],['harp',SA_A,{o:1,v:.3,from:4}],['choir','pad',{o:4,v:.24}],['organ','pedal',{o:2,v:.3}]],dr:{tri:'x'+'.'.repeat(63)}}}});
  if(typeof MGAIN!=='undefined')MGAIN.fort=1.15;}
// the map marker: a little shrine gate in pale stone with a lit door
if(typeof MAPICO_X!=='undefined')MAPICO_X.fort=[[0,1,10,2,'#efe8d6'],[1,3,8,1,'#b3a995'],[1,3,2,7,'#d8cfbb'],[7,3,2,7,'#d8cfbb'],[3,4,4,6,'#ffe9a0'],[4,6,2,4,'#fff8dc']];

// ---------- HD-2D light: pale stone takes a gentler grade and softer point lights than the dark dungeons ----------
HOOK.after('hdLook','sanctlook10','pale stone grade',function(o,m,now){try{if(m&&m.fort&&m.kind==='dungeon'){
  if(typeof mapIndoor==='function'&&mapIndoor(m)){o.exp=1.1;o.lamp*=.6;o.pl*=.5;o.bloom*=.5;o.vig*=.8;{const mu=(o.amb[0]+o.amb[1]+o.amb[2])/3;for(let i=0;i<3;i++)o.amb[i]=Math.min(.8,(mu+(o.amb[i]-mu)*.5)*1.85+.06);}o.gain[0]*=1.01;o.gain[2]*=.99;}
  else{o.exp=Math.min(o.exp,.97);o.bloom*=.6;}}}catch(e){}});
{const hb0=hdBakeLights;hdBakeLights=function(m,S,lights){let add=null;try{if(m&&m.kind==='field'&&m.fortAt)add=sncGateLights(m);}catch(e){}
  const L=hb0.call(this,m,S,add?sncOldGateLights(m,lights||[]).concat(add):lights);try{if(m&&m.fort&&m.kind==='dungeon'){for(let i=0;i+7<L.length;i+=8){L[i+3]*=.85;const t=L[i+7],k=Math.max(L[i+4],L[i+5],L[i+6])*(t===7?.6:.2);/* every flame glows a soft gold (pale stone turns saturated orange into pink); the window beams stay neutral */if(t===7){L[i+4]*=.6;L[i+5]*=.6;L[i+6]*=.6;}else{L[i+4]=k;L[i+5]=k*.86;L[i+6]=k*.58;}}}}catch(e){}return L;};}

// ---------- OUTSIDE: the shrine gate on the field ----------
// geometry (px, relative to the top left of the 3 x 2 footprint, 48 x 32): pillars x 7..15 and 33..41 (the 'U' columns), the door of light between
// them (x 16..32; the 'E' tile is its lower half, a stair of three steps), lanterns on the front 'U' tiles x 0..7 and 40..47, lintel above y -17..-8.
function sncOldGateLights(m,arr){const fa=m.fortAt;if(!fa||!arr)return arr;return arr.filter(L=>!(L[3]==='cyan'&&Math.abs(L[0]-(fa[0]*TS+8))<2&&Math.abs(L[1]-(fa[1]*TS+4))<2)&&!(L[3]==='lamp'&&L[2]===12&&Math.abs(L[1]-(fa[1]*TS-3))<2));}
// sncGateLights is owned by sitelook10.js now (the two lamp version here was dead)
function sncFieldM(){return SNCX.fm||(typeof WS!=='undefined'?WS.m:null);}
function sncGroundPal(P){return {lg:P.lg,path:P.cap==='snow'?'#c8d8e6':P.cap==='coast'?'#d0c8b0':'#b9b2a4'};}
// ground paint: a ring of lighter ground and a path of flat stones leading to the stair (drawn in 2D and in the HD ground texture)
function drawShrineRing(ctx,x,y){const m=sncFieldM(),P=SNC_P(m&&m.theme),S=sncStone(P),R=mulberry(((x*31+y*17)|0)+5);
  ctx.save();
  ctx.fillStyle='rgba(20,18,30,.16)';ctx.beginPath();ctx.ellipse(x+24,y+34,34,12,0,0,7);ctx.fill();
  ctx.globalAlpha=.34;ctx.fillStyle=P.lg;ctx.beginPath();ctx.ellipse(x+24,y+36,40,17,0,0,7);ctx.fill();
  ctx.globalAlpha=.3;ctx.beginPath();ctx.ellipse(x+24,y+36,29,12,0,0,7);ctx.fill();ctx.globalAlpha=1;
  // the realm's small signs round the ring: flowers, salt stones, embers, frost, dust, stars
  for(let i=0;i<16;i++){const t=Math.PI*(.05+i/15*.9),sx=Math.round(24+Math.cos(t)*38+R()*3),sy=Math.round(36+Math.sin(t)*16+R()*2);
    const k=P.cap,col=k==='moss'?(i%3?P.bloom[0]:P.bloom[1]):k==='salt'?(i%2?'#f4f8f4':'#8adccc'):k==='ember'?(i%3?'#ff8a3a':'#ffd070'):k==='snow'?(i%2?'#ffffff':'#bfe6ff'):k==='gold'?'#f2c93a':(i%2?'#e2ccff':'#b080ff');
    ctx.fillStyle=col;ctx.fillRect(x+sx,y+sy,1+(i%3===0?1:0),1);if(k==='moss'&&i%3===0){ctx.fillStyle='#4e8a34';ctx.fillRect(x+sx,y+sy+1,1,2);}}
  // flat stones in a path, narrowing toward the stair
  for(let k=0;k<6;k++){const sy=33+k*5.4,w=10-Math.min(3,k>>1)*0+0,sx=24-w/2+((k*7)%5-2)*1.2;
    ctx.fillStyle='rgba(30,26,34,.28)';ctx.fillRect(x+sx+1,y+sy+3,w,2);ctx.fillStyle=S[3];ctx.fillRect(x+sx-.5,y+sy-.5,w+1,5);ctx.fillStyle=S[1];ctx.fillRect(x+sx,y+sy,w,4);ctx.fillStyle=S[0];ctx.fillRect(x+sx+1,y+sy,w-2,1);ctx.fillStyle=S[2];ctx.fillRect(x+sx+2,y+sy+2,w-4,1);
    if(P.cap==='moss'&&k%2===0){ctx.fillStyle='#6aa044';ctx.fillRect(x+sx+w-3,y+sy+3,3,1);}if(P.cap==='snow'){ctx.fillStyle='#ffffff';ctx.fillRect(x+sx+1,y+sy-1,w-2,1);}}
  ctx.restore();}
function drawShrineFront(ctx,x,y){const m=sncFieldM(),P=SNC_P(m&&m.theme),S=sncStone(P),R=mulberry(((x*13+y*7)|0)+3),f=(c,a,b,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x+a,y+b,w,h);};
  const cap=(a,b,w)=>sncCap(f,a,b,w,P,R);
  ctx.save();
  // the door of light between the pillars: a pale recess, an arched veil of the realm's light, a bright sigil over it
  f(S[3],15,-1,18,23);f(S[2],16,0,16,22);f('#5a4c3c',17,2,14,20);
  ctx.save();
  const dv=ctx.createLinearGradient(0,y+3,0,y+24);dv.addColorStop(0,'#fff8dc');dv.addColorStop(.55,P.acc2);dv.addColorStop(1,P.acc);
  ctx.fillStyle=dv;ctx.beginPath();ctx.moveTo(x+18,y+23);ctx.lineTo(x+18,y+9);ctx.quadraticCurveTo(x+24,y+1,x+30,y+9);ctx.lineTo(x+30,y+23);ctx.fill();
  const gl=ctx.createRadialGradient(x+24,y+16,1,x+24,y+16,15);gl.addColorStop(0,'rgba(255,248,214,.55)');gl.addColorStop(1,'rgba(255,248,214,0)');ctx.fillStyle=gl;ctx.fillRect(x+12,y+2,24,28);
  f('rgba(90,70,40,.5)',24,6,1,17);// where the two leaves meet
  f('#fff8dc',23,4,2,2);f('#fff8dc',22,5,4,1);f('#fff8dc',23,7,2,1);
  ctx.restore();
  // ground shadow under the gate
  ctx.fillStyle='rgba(20,18,30,.2)';ctx.beginPath();ctx.ellipse(x+24,y+32,25,4,0,0,7);ctx.fill();
  // the three worn steps (the lowest one widest), wear in the middle, the realm at the edges
  for(let i=0;i<3;i++){const w=20+i*4,sx=24-w/2,yy=21+i*4;f(S[3],sx-1,yy,w+2,5);f(S[0],sx,yy,w,1);f(S[1],sx,yy+1,w,2);f(S[2],sx+5,yy+1,w-10,2);f(S[3],sx,yy+3,w,1);for(let k=0;k<3;k++)f(S[2],sx+2+((k*9+i*5)%(w-4)),yy+1,1,1);
    if(P.cap==='moss'){f('#5e9a3c',sx,yy+3,3,1);f('#5e9a3c',sx+w-4,yy+3,4,1);}else if(P.cap==='snow'){f('#ffffff',sx,yy,w,1);f('#c6dcee',sx+1,yy+3,w-2,1);}else if(P.cap==='ember'){f('#ff8a3a',sx+3,yy+3,2,1);}else if(P.cap==='salt'){f('#bfe8e0',sx+2,yy+3,4,1);}}
  // two pillars (hashira): lit left, shaded right, a base, a band of the realm's colour, the realm settling on the foot
  [[7],[33]].forEach(([a])=>{f(S[3],a-1,-9,10,36);f(S[1],a,-9,8,35);f(S[0],a,-9,3,35);f(S[2],a+5,-9,3,35);f(S[3],a+7,-9,1,35);f(S[2],a+3,-9,1,35);
    f(S[3],a-2,24,12,3);f(S[1],a-2,24,12,2);f(S[0],a-2,24,12,1);f(S[3],a-2,26,12,1);// base
    f(P.acc,a,3,8,1);f(P.acc2,a+1,3,2,1);f(P.acc,a,14,8,1);f(S[3],a,-9,8,1);
    f(S[2],a-1,-9,10,2);f(S[0],a-1,-9,10,1);// the cap block under the lintel
    if(P.cap==='moss'||P.cap==='salt'||P.cap==='snow')sncCap(f,a-2,24,12,P,R);if(P.cap==='moss'){f('#4e8a34',a,18,2,6);f('#76b44c',a,18,1,6);f('#4e8a34',a+6,20,2,4);}if(P.cap==='ember'){f('#ff8a3a',a+2,10,1,3);f('#ffd070',a+2,11,1,1);f('#ff8a3a',a+5,19,1,3);}});
  // the lintel (kasagi), a stepped crown that reaches past the pillars: top slab with the realm on it, a thin second beam under it
  f(S[3],-5,-18,58,10);f(S[0],-4,-17,56,2);f(S[1],-4,-15,56,4);f(S[2],-4,-11,56,2);// slab front
  f(S[3],-6,-19,3,3);f(S[0],-5,-19,2,2);f(S[3],51,-19,3,3);f(S[0],51,-19,2,2);f(S[0],-3,-18,2,1);f(S[0],49,-18,2,1);// upswept ends
  cap(-3,-18,52);
  f(S[3],-1,-8,50,4);f(S[1],0,-8,48,3);f(S[2],0,-6,48,1);f(S[3],0,-5,48,1);// the second beam (shimaki)
  // the tie beam (nuki) between the pillars with an inlaid band, and the plaque with the sanctum's sigil
  f(S[3],14,-2,20,5);f(S[1],15,-2,18,3);f(S[0],15,-2,18,1);f(S[2],15,0,18,1);f(P.acc,16,0,16,1);
  f(S[3],19,-7,10,6);f(S[1],20,-6,8,4);f(P.acc2,22,-5,4,2);f('#fff8dc',23,-5,2,1);f(P.acc,22,-3,4,1);
  // a rope across the door with cloth ribbons and a bell
  ctx.strokeStyle='#b89a5c';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+15,y+3);ctx.quadraticCurveTo(x+24,y+7,x+33,y+3);ctx.stroke();
  [[17,P.cloth[0]],[20,P.cloth[1]],[28,P.cloth[1]],[31,P.cloth[0]]].forEach(([a,c],i)=>{const h=i%2?7:9,t=Math.floor(4+(a<24?(a-15)/3:(33-a)/3));f(c,a,t,2,h);f(shade(c,.7),a+1,t,1,h);f('#f6eccb',a,t+h,1,1);f(c,a+1,t+h,1,1);});
  f('#7a5a20',24,5,1,3);f('#d8a838',22,8,5,4);f('#f6d878',22,8,2,3);f('#8a6a20',22,11,5,1);f('#fff0b0',24,12,1,1);
  // two stone lanterns on the front 'U' tiles, lit
  [[0],[40]].forEach(([a])=>{const lx=a;ctx.fillStyle='rgba(255,214,120,.22)';ctx.beginPath();ctx.arc(x+lx+4,y+20,9,0,7);ctx.fill();
    f(S[3],lx,30,8,2);f(S[1],lx+1,27,6,3);f(S[0],lx+1,27,6,1);f(S[1],lx+3,20,2,7);f(S[0],lx+3,20,1,7);f(S[2],lx+1,19,6,1);// foot, post, ring
    f(S[3],lx,14,8,5);f(S[1],lx+1,14,6,5);f(S[0],lx+1,14,6,1);f('#3a2c1c',lx+2,15,4,3);f('#ffb040',lx+3,16,2,2);f('#fff4c0',lx+3,16,1,1);// firebox and flame
    f(S[3],lx-1,13,10,1);f(S[1],lx-1,12,10,1);f(S[0],lx,11,8,1);f(S[1],lx+1,10,6,1);f(S[0],lx+2,9,4,1);f(P.acc,lx+3,8,2,1);cap(lx-1,11,10);});
  ctx.restore();}
function drawGatehouse(ctx,x,y){drawShrineRing(ctx,x,y);drawShrineFront(ctx,x,y);}
// remember the map being painted (the ring and the front take no map argument), swap the E tile for a U tile so no cave mouth is painted under the
// gate, and replace the lights sites.js adds with ones that match the lanterns
{const bm0=buildMapCanvas;buildMapCanvas=function(m,fr){SNCX.fm=m;let fa=null,fc=null;
  try{if(m&&m.kind==='field'&&m.fortAt&&m.t[m.fortAt[1]]){fa=m.fortAt;fc=m.t[fa[1]][fa[0]];m.t[fa[1]][fa[0]]='U';}}catch(e){fa=null;}
  let c;try{c=bm0.apply(this,arguments);}finally{if(fa)m.t[fa[1]][fa[0]]=fc;}
  try{if(fa&&m.lights){m.lights=sncOldGateLights(m,m.lights);sncGateLights(m).forEach(L=>m.lights.push(L));}}catch(e){}
  return c;};}

// ---------- OUTSIDE in HD-2D: two pillars, a lintel and a beam, the door of light, three treads, two lanterns, ribbons and a bell ----------
// sheet regions (px): pillar front 0,0 8x40 | pillar side 10,0 8x40 | lintel front 20,0 58x10 | shimaki 20,12 50x4 | nuki 20,18 20x5 | plaque 44,18 10x8
// lantern head 58,18 8x8 | lantern roof 68,18 12x4 | lantern stone 82,18 4x8 | riser 60,30 20x3 | ribbons 24,28 (4 strips of 3x12) | bell 44,30 6x9 | door 0,44 20x28
function sncGateSheet(m){const th=m&&m.theme||'meadow',P=SNC_P(th),S=sncStone(P).map(c=>shade(c,.93));return hdSpr('sgate_'+th,96,72,(c)=>{const R=mulberry(11),f=(col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
  // pillars
  f(S[1],0,0,8,40);f(S[0],0,0,3,40);f(S[2],5,0,3,40);f(S[3],7,0,1,40);f(S[2],3,0,1,40);f(S[3],0,36,8,4);f(S[1],0,36,8,1);f(P.acc,0,8,8,1);f(P.acc2,1,8,2,1);f(P.acc,0,20,8,1);f(S[2],0,0,8,2);
  f(S[2],10,0,8,40);f(S[1],10,0,3,40);f(S[3],17,0,1,40);f(S[3],10,36,8,4);f(P.acc,10,8,8,1);f(P.acc,10,20,8,1);
  if(P.cap==='moss'){f('#4e8a34',0,30,2,6);f('#76b44c',0,30,1,6);f('#4e8a34',6,32,2,4);f('#4e8a34',10,30,3,6);}else if(P.cap==='ember'){f('#ff8a3a',3,12,1,3);f('#ffd070',3,13,1,1);f('#ff8a3a',5,28,1,3);}else if(P.cap==='salt'){f('#f0f6f2',0,34,8,2);f('#8adccc',2,35,1,1);}else if(P.cap==='snow'){f('#ffffff',0,34,8,2);f('#c6dcee',0,36,8,1);}
  // lintel, shimaki, nuki, plaque
  f(S[3],20,0,58,10);f(S[0],20,0,58,2);f(S[1],20,2,58,5);f(S[2],20,7,58,3);f(S[0],21,1,2,1);f(S[0],75,1,2,1);
  sncCap((col,x,y,w,h)=>f(col,x,y,w,h),20,2,58,P,R);
  f(S[3],20,12,50,4);f(S[1],20,12,50,3);f(S[2],20,14,50,1);
  f(S[3],20,18,20,5);f(S[1],20,18,20,4);f(S[0],20,18,20,1);f(P.acc,21,20,18,1);
  f(S[3],44,18,10,8);f(S[1],45,19,8,6);f(P.acc2,47,20,4,3);f('#fff8dc',48,21,2,1);f(P.acc,47,23,4,1);
  // lantern head (with flame), roof, stone
  f(S[3],58,18,8,8);f(S[1],59,19,6,6);f(S[0],59,19,6,1);f('#3a2c1c',60,20,4,4);f('#ffb040',61,21,2,3);f('#fff4c0',61,21,1,1);
  f(S[3],68,18,12,4);f(S[1],69,18,10,3);f(S[0],70,18,8,1);f(P.acc,73,18,2,1);sncCap((col,x,y,w,h)=>f(col,x,y,w,h),69,19,10,P,R);
  f(S[1],82,18,4,8);f(S[0],82,18,1,8);f(S[3],85,18,1,8);
  // riser, ribbons, bell
  f(S[3],60,30,20,3);f(S[1],60,30,20,2);f(S[0],60,30,20,1);for(let i=0;i<4;i++)f(S[2],62+i*5,31,2,1);
  [[P.cloth[0],10],[P.cloth[1],8],[P.cloth[1],8],[P.cloth[0],10]].forEach(([c0,h],i)=>{const x=24+i*4;f(c0,x,28,2,h);f(shade(c0,.7),x+1,28,1,h);f('#f6eccb',x,28+h,1,1);f(c0,x+1,28+h,1,1);});
  f('#7a5a20',46,30,1,2);f('#d8a838',44,32,5,5);f('#f6d878',44,32,2,4);f('#8a6a20',44,36,5,1);f('#fff0b0',46,37,1,1);
  // the door of light: stone jambs and lintel round an arched veil
  f(S[3],0,44,20,28);f(S[2],1,45,18,27);f('#5a4c3c',2,47,16,25);
  const dv=c.createLinearGradient(0,50,0,70);dv.addColorStop(0,'#fff8dc');dv.addColorStop(.55,P.acc2);dv.addColorStop(1,P.acc);c.fillStyle=dv;c.beginPath();c.moveTo(3,72);c.lineTo(3,56);c.quadraticCurveTo(10,46,17,56);c.lineTo(17,72);c.fill();
  const gl=c.createRadialGradient(10,64,1,10,64,10);gl.addColorStop(0,'rgba(255,248,214,.6)');gl.addColorStop(1,'rgba(255,248,214,0)');c.fillStyle=gl;c.fillRect(2,52,16,20);
  f('rgba(90,70,40,.5)',10,53,1,19);f('#fff8dc',9,50,2,2);f('#fff8dc',8,51,4,1);f('#fff8dc',9,53,2,1);});}
function sncFlat(bt,a,c,n){H2P.set(a);bt.quad(H2P,-1,0,-1,0,c[0],c[1],c[2],255,n[0],n[1],n[2],8);}
function sncGateGeo(m,S,b,Q,U,Vv,p,V,bt){const th=m&&m.theme||'meadow',P=SNC_P(th),St=sncStone(P),rgb=h=>hdRgb(h).map(v=>Math.round(v*235)),top=rgb(St[0]),side=rgb(St[2]),dark=rgb(St[3]);
  const x0=b.x*TS,x1=x0+b.w*TS,zf=(b.y+b.h)*TS,F=(sx,sy,sw,sh)=>[U(p,sx),Vv(p,sy),U(p,sx+sw),Vv(p,sy+sh)];
  // a box with a textured front; sides and top flat
  const box=(xa,xb,za,zb,ya,yb,fr,sc,tc,fl)=>{
    if(fr)Q([xa,yb,zb,xb,yb,zb,xb,ya,zb,xa,ya,zb],fr[0],fr[1],fr[2],fr[3],255,[0,0,1],fl==null?2|8:fl);
    sncFlat(bt,[xa,yb,za,xa,yb,zb,xa,ya,zb,xa,ya,za],sc,[-1,0,0]);sncFlat(bt,[xb,yb,zb,xb,yb,za,xb,ya,za,xb,ya,zb],sc,[1,0,0]);sncFlat(bt,[xa,yb,za,xb,yb,za,xb,yb,zb,xa,yb,zb],tc,[0,1,0]);};
  const hP=36*V,hS=40*V,hK=49*V,hN0=24*V,hN1=29*V;
  // the door of light, set back, with its stone jambs
  Q([x0+16,26*V,zf-17,x1-16,26*V,zf-17,x1-16,0,zf-17,x0+16,0,zf-17],...F(0,44,20,28),255,[0,0,1],2|8);
  sncFlat(bt,[x0+16,26*V,zf-17,x0+16,26*V,zf-9,x0+16,0,zf-9,x0+16,0,zf-17],dark,[1,0,0]);sncFlat(bt,[x1-16,26*V,zf-9,x1-16,26*V,zf-17,x1-16,0,zf-17,x1-16,0,zf-9],dark,[-1,0,0]);
  // three treads climbing to the door
  for(let j=0;j<3;j++){const h=(j+1)*2.2*V,za=zf-6*(j+1),zb=zf-6*j,xa=x0+11+j*2,xb=x1-11-j*2;
    Q([xa,h,zb,xb,h,zb,xb,0,zb,xa,0,zb],...F(60,30,20,3),255,[0,0,1],8);sncFlat(bt,[xa,h,za,xb,h,za,xb,h,zb,xa,h,zb],top,[0,1,0]);}
  // pillars, the tie beam, the plaque, the shimaki and the lintel
  [[x0+7,x0+15],[x1-15,x1-7]].forEach(([xa,xb])=>{const zb=zf-6,za=zf-14;
    Q([xa,hP,zb,xb,hP,zb,xb,0,zb,xa,0,zb],...F(0,0,8,40),255,[0,0,1],8);Q([xa,hP,za,xa,hP,zb,xa,0,zb,xa,0,za],...F(10,0,8,40),255,[-1,0,0],8);Q([xb,hP,zb,xb,hP,za,xb,0,za,xb,0,zb],...F(10,0,8,40),255,[1,0,0],8);
    sncFlat(bt,[xa,hP,za,xb,hP,za,xb,hP,zb,xa,hP,zb],top,[0,1,0]);});
  box(x0+15,x1-15,zf-12,zf-8,hN0,hN1,F(20,18,20,5),side,top,8);
  Q([x0+19,36*V,zf-8.2,x0+29,36*V,zf-8.2,x0+29,hN1,zf-8.2,x0+19,hN1,zf-8.2],...F(44,18,10,8),255,[0,0,1],2|8);
  box(x0-1,x1+1,zf-16,zf-6,hP,hS,F(20,12,50,4),side,top,8);
  box(x0-5,x1+5,zf-20,zf-4,hS,hK,F(20,0,58,10),side,top,8);
  [[x0-5,x0-1],[x1+1,x1+5]].forEach(([xa,xb])=>box(xa,xb,zf-20,zf-4,hK,hK+2.6*V,null,side,top));// the upswept ends of the lintel
  // ribbons and the bell hang from the rope under the beam
  [[x0+17,0],[x0+20,1],[x0+28,2],[x0+31,3]].forEach(([xa,i])=>Q([xa,hN0,zf-7.5,xa+2.6,hN0,zf-7.5,xa+2.6,hN0-11*V,zf-7.5,xa,hN0-11*V,zf-7.5],...F(24+i*4,28,3,11),255,[0,0,1],8));
  Q([x0+21.5,hN0-3*V,zf-7.4,x0+26.5,hN0-3*V,zf-7.4,x0+26.5,hN0-12*V,zf-7.4,x0+21.5,hN0-12*V,zf-7.4],...F(44,30,6,9),255,[0,0,1],2|8);
  // two stone lanterns on the front tiles: foot, post, firebox with its flame, a roof
  [x0+1,x1-7].forEach(xa=>{const cx=xa+3,zb=zf-3,za=zf-9;box(cx-3,cx+3,za,zb,0,3*V,null,side,top);box(cx-1,cx+1,zf-7,zf-5,3*V,12*V,null,side,top);
    box(cx-3,cx+3,za,zb,12*V,19*V,F(58,18,8,8),side,top);box(cx-4.5,cx+4.5,za-1.5,zb+1.5,19*V,21.5*V,F(68,18,12,4),side,top,8);});
  S.bh.push({b,h:hK});}
{const gp0=hdGatePart;hdGatePart=function(m){const r=gp0.apply(this,arguments);try{if(r&&m&&m.kind==='field')r.cv=sncGateSheet(m);}catch(e){}return r;};}
{const gg0=hdGateGeo;hdGateGeo=function(m,S,b,Q,U,Vv,p,V,bt){try{return sncGateGeo(m,S,b,Q,U,Vv,p,V,bt);}catch(e){return gg0.apply(this,arguments);}};}

// the lights the tile scan adds (lanterns, and the violet glow cave and void realms put on pillars) are softer and gold in a Sanctum
{const sl0=scanLights;scanLights=function(m){const r=sl0.apply(this,arguments);try{if(m&&m.fort&&m.tl)m.tl=m.tl.filter(L=>L[3]!=='violet').map(L=>L[3]==='fire'?[L[0],L[1]+2,22,'lamp']:L);}catch(e){}return r;};}
