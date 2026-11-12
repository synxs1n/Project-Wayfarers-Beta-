// ===== chars13.js (v0.19.7): the characters pass: one outline rule, idle life, stage depth, damage text =====
// Owner: "Some sprites have a dark outline, some don't, and the repainted foes sit sharper than heroes. Heroes stand dead still in the
// world and in battle. The HD battle backdrop is a painted band. Damage numbers..." Four parts, all of them hooks on the owners' functions
// (nothing here edits a renderer's body):
//  1. OUTLINE RULE (c13Outline, a result hook on paintHD): every HD painted sprite (hero rig, companion, townsperson, foe, boss, pose frame,
//     the battle repaint of a foe on its PGP grid) gets the same post-pass on its own 2x bitmap, so whole-pixel scaling (battle11 apx, res11
//     density, hd2d hdSmall) keeps it crisp: a one-pixel dark outline all round the silhouette in the sprite's own darkest painted tone (the
//     darkest body tone, eyes left out, mixed C13.ink toward the ink colour; before this the line art was per part and 40% lighter on the lit
//     side, and dark foes had a light "rim" outline instead), the old second pixel on the shadow side kept as a faint drop edge at one alpha,
//     and a one-pixel rim light on the lit side (the paint's light comes from the upper left: silhouette pixels whose upper or left neighbour
//     is empty are lifted C13.rim toward a warm white). The pass also keeps the sprite's key grid kinds (c._k13: body, eye, hair, cloth, skin)
//     for part 2. tools/chrome/v178a.js audits every rig and foe: the share of silhouette edge pixels that are dark.
//  2. IDLE LIFE (c13Frame): two-frame idles built once per sprite canvas (a WeakMap of at most 8 frames, keyed by a bit code; no allocation
//     per frame): breath (the band from the shoulders to the hips rises one logical pixel), blink (the eye rows below the lid take the skin
//     tone next to them, 140 ms every 4.3 s), sway (the hair below the chin and the cape, scarf and tail pixels hang one pixel further back).
//     Driven from the frame clocks: battleFrame and worldDraw note their `now` (C13.t), and the result hooks on walkerCanvas (the world: hero,
//     townsfolk, wanderers, legends in 2D and HD-2D through the one canvas every consumer reads) and spriteOf (battle heroes at rest) hand back
//     the frame the clock asks for, each character offset by a hash of its key so none sync. Battle heroes keep drawUnit's breathing squash
//     (a drawUnit hook moves each unit's phase by that hash, so the three heroes no longer breathe together) and add blink and sway; foes get
//     a slow idle per family: plants and the undead sway (the upper half leans a pixel), jellies pulse (the middle bulges a pixel each side),
//     beasts, armour and the rest breathe (the existing squash), flyers hover (b.hov); bosses and guardians a heavier breath (bossIdle's frame B
//     exhales two pixels instead of one: the BIDLE entry is pre-built here). Nothing moves under reduced motion (gfxStill), and a frame
//     limiter at rest (perf12) still draws 30 fps: the idle reads the clock, it never marks the battle busy.
//  3. STAGE DEPTH: a mid-ground layer of two or three silhouettes per backdrop kind (rocks, trees, pillars, dunes, ice spires, ruins, cave
//     teeth, Breach shards; c13Mid), standing on the ground band at the stage's side margins where no unit slot is, drawn in depth order with
//     the units (a drawUnit hook draws each silhouette before the first unit whose feet are further down), so a hero in front covers it and a
//     foe behind is covered; they shift a pixel or two against the camera punch (gfx6battle CAM) for parallax. On the Medium 'under' stage they
//     take the bake's tint; on the High stage they ride the unit layer and are lit with it. The 2D ground plane gets a soft dithered haze
//     toward the horizon (a result hook on bgStatic, once per cached backdrop; the HD stage already fogs its floor with distance, hdstage
//     uFog). Every unit on the plain 2D stage gets a soft contact shadow (BV.glShadow, the hook drawUnit reads; the GL stages keep theirs).
//  4. DAMAGE TEXT: the chunky pixel display face for the floating numbers with a solid dark outline; colour by kind and element (a result hook
//     on fx tags each damage entry with its element as a class: physical white, weak amber, each element its colour, heal green, crit gold with
//     a scale pop and a white flash, misses grey and small); the reaction chips and the reaction banner in the fantasy face (--ffan, sized to
//     the box the layout measured in Nunito). Boxes still come from b3FxRects / b9BanBox, so every text stays inside the stage and off faces.
const C13={on:true,ink:.5,rim:.4,breathMs:1300,swayMs:1700,blinkEvery:4.3,blinkMs:.14,t:0,live:0,fr:new WeakMap(),mid:{},n:{built:0,frames:0,mid:0},parax:2,hazeK:.35};
const C13_WARM=[255,244,208];
function c13Still(){return typeof gfxStill==='function'&&gfxStill();}
function c13Hash(s){return (hashS(String(s))%1000)/1000;}
// ---------- 1. the outline rule ----------
// kinds of the doubled key grid: 1 body, 2 eye, 3 hair, 4 cloth that sways, 5 skin
const C13_HAIR={H:1,T:1,h:1,l:1},C13_EYE={E:1,1:1,2:1,3:1,9:1},C13_CLOTH={Y:1,z:1,Q:1,U:1,u:1},C13_SKIN={S:1,e:1,4:1};
function c13Mask(g,pal,opt){const W0=g.w,H0=g.h,W=W0*2,H=H0*2,KC=epx(g.a,W0,H0);if(opt&&opt.detail)opt.detail(KC,W,H);
  const M=new Uint8Array(W*H),hero=!!(opt&&opt.hero);let top=H,bot=-1,eyeT=H,eyeB=-1;
  for(let i=0;i<W*H;i++){const c=KC[i];if(!c||!pal[c])continue;let k=1;
    if(C13_EYE[c])k=2;else if(hero&&C13_HAIR[c])k=3;else if(hero&&C13_CLOTH[c])k=4;else if(hero&&C13_SKIN[c])k=5;
    M[i]=k;const y=(i/W)|0;if(y<top)top=y;if(y>bot)bot=y;if(k===2){if(y<eyeT)eyeT=y;if(y>eyeB)eyeB=y;}}
  return {m:M,W,H,hero,top,bot,eyeT,eyeB,flat:(opt&&opt.flat)||''};}
function c13Outline(c,K){const W=K.W,H=K.H,M=K.m;let im;try{im=c.getContext('2d').getImageData(0,0,W,H);}catch(e){return;}const d=im.data,N=W*H;
  // the sprite's own darkest tone (eyes left out: every hero's lid is near black)
  let dk=1e9,dr=0,dg=0,db=0;for(let i=0;i<N;i++){const k=M[i];if(!k||k===2)continue;const j=i*4,l=d[j]*.3+d[j+1]*.59+d[j+2]*.11;if(l<dk){dk=l;dr=d[j];dg=d[j+1];db=d[j+2];}}
  if(dk===1e9)return;const O=hx(OUTC),q=C13.ink,ol=[dr+(O[0]-dr)*q,dg+(O[1]-dg)*q,db+(O[2]-db)*q];
  const R1=new Uint8Array(N);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(M[i])continue;
    if((y>0&&M[i-W])||(y<H-1&&M[i+W])||(x>0&&M[i-1])||(x<W-1&&M[i+1])){R1[i]=1;const j=i*4;d[j]=ol[0];d[j+1]=ol[1];d[j+2]=ol[2];d[j+3]=255;}}
  // the old second pixel on the bottom and right (and a rim outline's) becomes one faint drop edge in the same tone; glow pixels stay
  for(let i=0;i<N;i++){if(M[i]||R1[i])continue;const j=i*4;if(d[j+3]>=190){d[j]=ol[0];d[j+1]=ol[1];d[j+2]=ol[2];d[j+3]=150;}}
  // rim light on the lit side: body pixels whose upper or left neighbour is outside the silhouette
  const r=C13.rim;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,k=M[i];if(!k||k===2)continue;
    if((y>0&&M[i-W])&&(x>0&&M[i-1]))continue;const j=i*4;d[j]+=(C13_WARM[0]-d[j])*r;d[j+1]+=(C13_WARM[1]-d[j+1])*r;d[j+2]+=(C13_WARM[2]-d[j+2])*r;}
  c.getContext('2d').putImageData(im,0,0);}
{// the owners HOOK.def these (sprhd.js, battle.js, bg.js, engine.js); later raw wrappers (npcart9, fxkind11, gfx6, insight, fx2) sit outside the chain
  HOOK.xform('paintHD','chars13','one outline rule and the key grid kinds on every HD sprite',function(c,g,pal,opt){try{if(!C13.on||!c||c._k13)return c;const K=c13Mask(g,pal,opt);c._k13=K;c13Outline(c,K);}catch(e){}return c;});}
// ---------- 2. idle life ----------
// the frame of canvas c for a bit code (1 breath, 2 blink, 4 sway, 8 lean right, 16 pulse): built once, kept per canvas
function c13Frame(c,code){if(!code||!c||!c.width)return c;let m=C13.fr.get(c);if(!m){m=new Map();C13.fr.set(c,m);}let f=m.get(code);if(f)return f;
  try{f=c13Build(c,code);}catch(e){f=c;}m.set(code,f);C13.n.frames++;return f;}
function c13Build(c,code){const k=c.hd||1,W=c._rw||c.width,H=c._rh||c.height,K=c._k13||null,M=K&&K.W===W&&K.H===H?K.m:null;
  const src=c.getContext('2d').getImageData(0,0,W,H).data,im=new ImageData(W,H),d=im.data;d.set(src);C13.n.built++;
  const px=Math.max(1,Math.round(k)),A=i=>src[i*4+3],solid=i=>M?M[i]>0:A(i)>=250;
  let top=H,bot=-1;if(M){top=K.top;bot=K.bot;}else{for(let i=0;i<W*H;i++)if(A(i)>=250){const y=(i/W)|0;if(y<top)top=y;if(y>bot)bot=y;}}
  if(bot<0)return c;const h=bot-top+1,eyeB=M&&K.eyeB>=0?K.eyeB:top+Math.round(h*.22);
  const cp=(si,di)=>{const a=si*4,b=di*4;d[b]=src[a];d[b+1]=src[a+1];d[b+2]=src[a+2];d[b+3]=src[a+3];};
  if(code&1){// breath: the band from the shoulders to the hips rises one logical pixel; the hip row is repeated under it (the torso stretches)
    const y0=Math.min(H-1,eyeB+4*px),y1=Math.min(H-1,top+Math.round(h*.6));if(y1>y0+px){
      for(let y=y0;y<=y1;y++)for(let x=0;x<W;x++){const sy=Math.min(y1,y+px);cp(sy*W+x,y*W+x);}
      // the rows the band left (its old top) take the row above (the head stays), the outline above the shoulders follows with it
      for(let y=y0-px;y<y0;y++)if(y>=0)for(let x=0;x<W;x++)cp((y+px)*W+x,y*W+x);}}
  if((code&2)&&M&&K.eyeT<K.eyeB){// blink: below the lid row of each eye the skin tone next to the eye; the lid row stays as the closed eye
    for(let y=K.eyeT+1;y<=K.eyeB;y++)for(let x=0;x<W;x++){const i=y*W+x;if(M[i]!==2)continue;let s=-1;
      for(let dx=1;dx<8&&s<0;dx++){if(x-dx>=0&&M[i-dx]===5)s=i-dx;else if(x+dx<W&&M[i+dx]===5)s=i+dx;}
      if(s<0)for(let dy=1;dy<6&&s<0;dy++){const j=i+dy*W;if(j<W*H&&M[j]===5)s=j;}
      if(s>=0)cp(s,i);}}
  if((code&4)&&M){// sway: hair below the chin and cloth hang one pixel further back (the back of the side rig is its left); new edge pixels get the outline tone
    const o=c13OutlineTone(src,M,W,H);for(let y=Math.max(0,K.eyeB+2);y<=bot;y++)for(let x=1;x<W;x++){const i=y*W+x,kk=M[i];if(!(kk===4||(kk===3&&y>K.eyeB+2)))continue;
      const j=i-1;if(M[j]&&M[j]!==kk)continue;cp(i,j);if(x-2>=0&&!M[j-1]&&d[(j-1)*4+3]<250){const b=(j-1)*4;d[b]=o[0];d[b+1]=o[1];d[b+2]=o[2];d[b+3]=255;}}}
  if(code&8){// lean (plants, undead): the upper half leans one pixel to the right
    const y1=top+Math.round(h*.5);for(let y=top;y<y1;y++)for(let x=W-1;x>=0;x--){const i=y*W+x;if(x>=px)cp(i-px,i);else{const b=i*4;d[b+3]=0;}}}
  if(code&16){// pulse (jellies): the middle third bulges one pixel outward on each side
    const y0=top+Math.round(h*.33),y1=top+Math.round(h*.66),cx=W>>1;for(let y=y0;y<y1;y++){for(let x=W-1;x>cx;x--){const i=y*W+x;if(x-px>cx)cp(i-px,i);}for(let x=0;x<cx;x++){const i=y*W+x;if(x+px<cx)cp(i+px,i);}}}
  const o=c.hd?hdCv(c.width,c.height,c.hd):mkCv(c.width,c.height);o.getContext('2d').putImageData(im,0,0);o._k13=K;o._c13f=code;
  try{if(typeof BART!=='undefined'&&BART.has(c))BART.set(o,BART.get(c));if(c._s11){o._s11=c._s11;o._s11s=c._s11s;}}catch(e){}return o;}
function c13OutlineTone(src,M,W,H){for(let i=0;i<W*H;i++)if(!M[i]&&src[i*4+3]===255)return [src[i*4],src[i*4+1],src[i*4+2]];return hx(OUTC);}
// the bit code the clock asks for: breath on a slow cycle, a blink now and then, the sway on its own beat, each offset by the character's hash
function c13Code(key,parts){if(c13Still()||!C13.on)return 0;const t=C13.t||performance.now(),o=c13Hash(key);let code=0;
  if((parts&1)&&Math.floor(t/C13.breathMs+o)%2===1)code|=1;
  if((parts&2)&&((t/1000+o*7)%C13.blinkEvery)<C13.blinkMs)code|=2;
  if((parts&4)&&Math.floor(t/C13.swayMs+o*3+.5)%2===1)code|=4;
  if((parts&8)&&Math.floor(t/C13.swayMs+o*3)%2===1)code|=8;
  if((parts&16)&&Math.floor(t/C13.breathMs+o)%2===1)code|=16;
  return code;}
// the frame clocks
HOOK.before('battleFrame','chars13','the idle clock',function(now){C13.t=+now||performance.now();C13.live=1;});
HOOK.after('battleFrame','chars13','the idle clock',function(){C13.live=0;});
HOOK.before('worldDraw','chars13','the idle clock',function(now){C13.t=+now||performance.now();C13.live=1;});
HOOK.after('worldDraw','chars13','the idle clock',function(){C13.live=0;});
// the world: every standing walker (frame 0) through the one canvas its consumers read, in 2D and HD-2D
{HOOK.xform('walkerCanvas','chars13','idle life: breath, blink and sway on standing walkers',function(c,key,L,els,id,view,frame){
    try{if(!C13.live||frame||!c||!c._k13||typeof key!=='string')return c;const code=c13Code(key,7);return code?c13Frame(c,code):c;}catch(e){return c;}});}
// battle: heroes at rest blink and sway (the breath is drawUnit's squash, desynced below); foes idle by family; bosses breathe heavier
function c13Fam(art){try{const T=monFam(art);if(T.includes('plant')||T.includes('undead'))return 8;if(T.includes('jelly'))return 16;}catch(e){}return 0;}
HOOK.xform('spriteOf','chars13','idle life on the battle stage',function(c,u,walk){try{
  if(!C13.live||!c||!u||walk||u.hp<=0||!B||B.wipe)return c;const T=Date.now(),a=T-(u.actT||0),h=T-(u.hitT||0)-IMPACT;if(a<520||(h>=0&&h<320))return c;
  if(u.side==='p'&&!u.isSum){if(u.heroArt||u.isComp)return c;const t=TPL[u.id];if(!t||t.mon)return c;
    const base=imgOf('bh:'+u.id+lookKey(u.id),()=>heroCanvas(u.id,false));if(!base||!base._k13)return c;
    const sm=typeof B8HC!=='undefined'?B8HC.get(base):null;if(c!==base&&c!==sm)return c;// a pose frame (heropose9): left as it is
    const code=c13Code(u.id,6);if(!code)return c;const f=c13Frame(base,code);return c===base?f:(typeof b8Small==='function'?b8Small(f):f);}
  if(!u.art)return c;
  if(typeof bossHasIdle==='function'&&bossHasIdle(u)){if(typeof BIDLE!=='undefined'&&!BIDLE.has(c))BIDLE.set(c,c13Heavy(c));return c;}
  if(typeof monHasFrames==='function'&&monHasFrames(u.art))return c;
  const fam=c13Fam(u.art);if(!fam)return c;const code=c13Code(u.art+(u.name||''),fam);return code?c13Frame(c,code):c;}catch(e){return c;}});
// the boss exhale, two logical pixels deep (art3.js bossFrame1 does one), from the art's own frame B when it has one
function c13Heavy(c){const w=c.width,h=c.height,cut=Math.floor(h*.55),src=typeof bossFrameSrc==='function'?bossFrameSrc(c):c,f=c.hd?hdCv(w,h,c.hd):mkCv(w,h),x=f.getContext('2d');x.imageSmoothingEnabled=false;
  x.drawImage(src,0,cut,w,h-cut,0,cut,w,h-cut);x.drawImage(src,0,0,w,cut,0,2,w,cut);x.globalCompositeOperation='source-atop';x.globalAlpha=.06;x.fillStyle='#fff2d0';x.fillRect(0,0,w,h);return f;}// .06: with the darker outline a .08 glow put the darkest bosses a hair over v160a's 16 luma bound
// ---------- 3. stage depth ----------
// the silhouettes of a backdrop key: {cv,x,y} with feet at y on the ground band, at the side margins (no unit slot is within 8% of the stage edge)
function c13MidKind(key){const k=String(key||'');if(/^breach|^void|_void$|^d_void|^c_void|^boss_void/.test(k))return 'shard';if(/^d_|^boss_|arena/.test(k))return 'pillar';if(/^c_|cave/.test(k))return 'tooth';
  if(/snow/.test(k))return 'spire';if(/coast/.test(k))return 'dune';if(/heights/.test(k))return 'ruin';if(/forest/.test(k))return 'tree';return 'rock';}
// the silhouettes take the backdrop's own ground tone (sampled from the cached 2D bake just under the horizon) so they belong to the stage
function c13MidPal(key,W,H){let info=null;try{info=hbInfo(key);}catch(e){}const D=(info&&info.D)||DTHEME[info&&info.base]||DTHEME.meadow;let md=D.f[0];
  try{const cv=bgStatic(key,W,H),gy=bgGY(H),d=cv.getContext('2d').getImageData(0,gy+2,W,2).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){if(d[i+3]>200){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}}if(n)md=rh([r/n,g/n,b/n]);}catch(e){}
  // a silhouette reads darker and greyer than the ground it stands on (rocks and pillars stone grey; trees, dunes, ice and shards keep their own tones in c13Sil)
  const kind=c13MidKind(key),g=hx(md),l=g[0]*.3+g[1]*.59+g[2]*.11,grey=rh([l,l,l]),stone=kind==='rock'||kind==='pillar'||kind==='ruin'||kind==='tooth'?mix(md,grey,.7):mix(md,grey,.35),base=shade(stone,.62);
  let lt2=tint(base,.22);{const q=hx(lt2),lq=q[0]*.3+q[1]*.59+q[2]*.11;if(lq>l*.92)lt2=shade(lt2,Math.max(.5,l*.92/lq));}// the lit face stays under the ground's own luma, so the shapes sit back
  const w=[shade(base,.7),base,lt2,shade(base,.4)];return {w,f:D.f,acc:D.acc,base:info?info.base:'meadow',kind:info?info.kind:'field'};}
// one silhouette drawn into its own canvas (feet on its bottom row): irregular outlines drawn pixel by pixel from the seeded R, a lit face
// on the upper left, a one-pixel outline ring in the darkest tone. Tones come from c13MidPal: darker and greyer than the ground.
function c13Sil(kind,P,R,s){const w=Math.max(8,Math.round(13*s)),hh=Math.round((kind==='pillar'||kind==='tree'||kind==='spire'?24:kind==='dune'?7:kind==='ruin'?16:12)*s),cv=mkCv(w+2,hh+3),x=cv.getContext('2d');
  const f=(c,a,b,ww,h)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),Math.max(1,Math.round(ww)),Math.max(1,Math.round(h)));},px=(c,a,b)=>f(c,a,b,1,1);
  const dk=P.w[0],md=P.w[1],lt=P.w[2],ol=P.w[3],H=hh+1,cx=1+w/2,wob=n=>Math.round((R()-.5)*n);
  // a profile: top y per column from a seeded walk, then columns filled down to the feet; the lit face is the left third near the top edge
  const mound=(w0,top,k)=>{let y=top+Math.round(hh*.25);const pr=[];for(let i=0;i<=w0;i++){y+=wob(2.4);y=Math.max(top,Math.min(H-3,y));pr.push(y);}
    for(let i=0;i<w0;i++){const t=pr[i];f(md,1+i,t,1,H-t);f(i<w0*.45?lt:md,1+i,t,1,i<w0*.45?2+(i%3===0?1:0):1);if(i>w0*.62&&(i+k)%2)f(dk,1+i,t+3,1,H-t-3);}
    return pr;};
  if(kind==='rock'){const pr=mound(w,Math.round(hh*.35),3);const cy=pr[Math.round(w*.5)]+Math.round(hh*.3);for(let i=0;i<Math.round(w*.5);i++)px(dk,cx-w*.2+i,cy+Math.round(Math.sin(i*.8))); // a crack
    const w2=Math.round(w*.5),t2=Math.round(hh*.55);for(let i=0;i<w2;i++){const t=t2+wob(2);f(i<w2*.4?lt:md,1+Math.round(w*.5)+i,t,1,H-t);} // a second stone leaning on the first
  }
  else if(kind==='tooth'){const bw=Math.round(w*.55);for(let i=0;i<hh;i++){const ww=Math.max(1,bw*(i/hh)+wob(1.2)),xo=cx-ww/2+wob(1);f(md,xo,H-hh+i,ww,1);if(i>2)f(lt,xo,H-hh+i,Math.max(1,ww*.3),1);}
    for(let i=0;i<Math.round(hh*.6);i++){const ww=Math.max(1,bw*.5*(i/(hh*.6))+wob(1));f(dk,cx+w*.28-ww/2,H-Math.round(hh*.6)+i,ww,1);}}
  else if(kind==='pillar'){const pw=Math.round(w*.42),xo=cx-pw/2;f(md,xo,2,pw,H-2);f(lt,xo,2,Math.max(1,pw*.3),H-2);f(dk,xo+pw*.72,2,Math.max(1,pw*.28),H-2);
    f(md,xo-2,0,pw+4,2);f(lt,xo-2,0,pw+4,1);f(md,xo-2,H-3,pw+4,3);f(dk,xo-2,H-1,pw+4,1);const cy=Math.round(H*.4)+wob(6);for(let i=0;i<4;i++)px(dk,xo+i+wob(1),cy+i);if(R()<.5)f(ol,xo+pw-2,H*.2,2,3);/* a chip */}
  else if(kind==='tree'){const tw=Math.max(2,Math.round(w*.18)),ty=H-Math.round(hh*.42);f(dk,cx-tw/2,ty,tw,H-ty);f(ol,cx-tw/2-1,H-2,tw+2,2);
    const blobs=[[cx-w*.25,ty-hh*.12,w*.3,md],[cx+w*.22,ty-hh*.08,w*.28,md],[cx,ty-hh*.3,w*.34,md],[cx-w*.14,ty-hh*.38,w*.22,lt]];
    blobs.forEach(([bx,by,r,c])=>{const rr=Math.max(2,Math.round(r));for(let yy=-rr;yy<=rr;yy++){const ww=Math.floor(Math.sqrt(rr*rr-yy*yy))-(R()<.3?1:0);if(ww<0)continue;f(c,bx-ww,by+yy,ww*2+1,1);}});
    for(let i=0;i<4;i++)px(dk,cx+wob(w*.5),ty-hh*.1+wob(hh*.25));}
  else if(kind==='spire'){const bw=Math.round(w*.5);for(let i=0;i<hh;i++){const ww=Math.max(1,bw*(i/hh)+wob(1.4)),xo=cx-ww/2+wob(1.2);f(md,xo,H-hh+i,ww,1);f(lt,xo,H-hh+i,Math.max(1,ww*.35),1);}
    const h2=Math.round(hh*.55);for(let i=0;i<h2;i++){const ww=Math.max(1,bw*.6*(i/h2)+wob(1));f(dk,cx+w*.3-ww/2,H-h2+i,ww,1);}}
  else if(kind==='dune'){for(let i=0;i<w;i++){const t=H-Math.round(hh*(.35+.65*Math.sin(Math.PI*(i+1)/(w+1))))+wob(1);f(i<w*.5?lt:md,1+i,t,1,H-t);if(i>w*.55)f(dk,1+i,t+2,1,Math.max(0,H-t-2));}
    for(let i=0;i<3;i++)f(dk,1+wob(w),H-1-i,2,1);}
  else if(kind==='ruin'){const pw=Math.round(w*.34),xo=cx-w*.3;const top=Math.round(hh*.15)+wob(3);for(let i=0;i<pw;i++){const t=top+wob(3);f(i<pw*.4?lt:md,xo+i,t,1,H-t);}f(dk,xo+pw*.7,top+4,Math.max(1,pw*.3),H-top-4);
    f(md,xo-2,H-3,pw+4,3);f(dk,xo-2,H-1,pw+4,1);const sw=Math.round(w*.3),sx=cx+w*.1;f(md,sx,H-4,sw,4);f(lt,sx,H-4,sw*.5,1);f(dk,sx+sw*.6,H-3,sw*.4,3);}
  else{// Breach shards: leaning crystals with the realm's accent on the facet
    const ac=P.acc||'#b080ff',bw=Math.round(w*.4);for(let i=0;i<hh;i++){const ww=Math.max(1,bw*(i/hh)+wob(1)),dx=(hh-i)*.22;f(md,cx-ww/2+dx,H-hh+i,ww,1);f(i%4===0?ac:lt,cx-ww/2+dx,H-hh+i,1,1);}
    const h2=Math.round(hh*.5);for(let i=0;i<h2;i++){const ww=Math.max(1,bw*.6*(i/h2));f(dk,cx-w*.25-ww/2-(h2-i)*.15,H-h2+i,ww,1);if(i%5===0)px(ac,cx-w*.25-(h2-i)*.15,H-h2+i);}}
  c13Ring(cv,ol);return {cv,w:cv.width,h:cv.height};}
// the one-pixel outline ring round the painted shape, in the darkest tone
function c13Ring(cv,ol){const W=cv.width,H=cv.height,x=cv.getContext('2d'),im=x.getImageData(0,0,W,H),d=im.data,A=i=>d[i*4+3]>60,c=hx(ol);
  const R=new Uint8Array(W*H);for(let y=0;y<H;y++)for(let xx=0;xx<W;xx++){const i=y*W+xx;if(A(i))continue;if((y>0&&A(i-W))||(y<H-1&&A(i+W))||(xx>0&&A(i-1))||(xx<W-1&&A(i+1)))R[i]=1;}
  for(let i=0;i<W*H;i++)if(R[i]){const j=i*4;d[j]=c[0];d[j+1]=c[1];d[j+2]=c[2];d[j+3]=255;}x.putImageData(im,0,0);}
// two or three per side, overlapping at different heights, the taller ones further back; sorted by their feet for the depth draw
function c13Mid(key,W,H){const id=key+'|'+W+'x'+H;let L=C13.mid[id];if(L)return L;L=[];
  try{const kind=c13MidKind(key),P=c13MidPal(key,W,H),R=mulberry(hashS(key)+W*3+H),gy=bgGY(H),band=(H-gy);
    if(P.kind==='arena')return C13.mid[id]=L;// the arena's wall and banners are its depth
    const sw=Math.min(1,W/300),mg=Math.max(1,Math.round(W*.015)),span=Math.round(W*.07);
    for(const left of [true,false]){const n=2+(R()<.5?1:0);for(let i=0;i<n;i++){const s=(.7+R()*.6)*sw,S=c13Sil(kind,P,R,s),d=R()*.1+i*.04,y=Math.round(gy+1+band*d);
      const off=Math.round(R()*Math.max(0,span-S.w*.5));const x=left?mg+off:W-mg-S.w-off;L.push({cv:S.cv,x,y:y+1,w:S.w,h:S.h});}}
    L.sort((a,b)=>a.y-b.y);}catch(e){}
  C13.n.mid++;return C13.mid[id]=L;}
const C13F={L:null,at:0,par:0,t:-1,tint:null,last:null};
// which silhouettes this frame, in depth order; the tinted copy on the Medium 'under' stage
function c13MidFrame(now){const key=(typeof HB!=='undefined'&&HB.force)||battleTheme(),L=c13Mid(key,BL.W,BL.H);C13F.L=L;C13F.at=0;C13F.t=now;C13F.last=L.length?c13Last():null;
  let par=0;try{if(typeof CAM!=='undefined'&&CAM.on&&!c13Still()){par=-(Math.max(0,Math.min(BL.W,CAM.fx))/BL.W-.5)*2*C13.parax*g6CamEnv(now);}}catch(e){}C13F.par=par;
  C13F.tint=null;try{if(BV.glStage&&!BV.glFull&&HB.bake&&HB.bake.tint)C13F.tint=HB.bake;}catch(e){}}
function c13MidCv(o){const K=C13F.tint;if(!K)return o.cv;let m=o.tc;if(m&&m.k===K.tint.k)return m.cv;const cv=mkCv(o.cv.width,o.cv.height),x=cv.getContext('2d');x.drawImage(o.cv,0,0);x.globalCompositeOperation='multiply';x.fillStyle=K.tint.css;x.fillRect(0,0,cv.width,cv.height);
  x.globalCompositeOperation='destination-in';x.drawImage(o.cv,0,0);o.tc={k:K.tint.k,cv};return cv;}
function c13MidDraw(ctx,upto){const L=C13F.L;if(!L)return;while(C13F.at<L.length&&(upto==null||L[C13F.at].y<=upto)){const o=L[C13F.at++],x=Math.round(o.x+C13F.par);
  ctx.save();ctx.globalAlpha=.28;ctx.fillStyle='#0a0618';ctx.beginPath();ctx.ellipse(x+o.w/2,o.y+.5,o.w*.55,Math.max(1.5,o.w*.16),0,0,7);ctx.fill();ctx.restore();ctx.drawImage(c13MidCv(o),x,o.y-o.h+1);}}
// a soft contact shadow for the plain 2D stage (the GL stages draw their own)
let C13SH=null;
function c13Shadow(ctx,x,gy,b,alpha){if(!C13SH){C13SH=mkCv(64,32);const c=C13SH.getContext('2d'),im=c.createImageData(64,32),d=im.data;
    for(let y=0;y<32;y++)for(let xx=0;xx<64;xx++){const dx=(xx+.5-32)/32,dy=(y+.5-16)/16,r=Math.sqrt(dx*dx+dy*dy),t=Math.max(0,Math.min(1,r)),a=(1-t*t)*(r<.45?.42:.42*(1-(r-.45)/.55)),o=(y*64+xx)*4;d[o]=10;d[o+1]=6;d[o+2]=24;d[o+3]=Math.round(Math.max(0,a)*255);}
    c.putImageData(im,0,0);}
  const rx=Math.max(5,Math.min(b.w,40)*.5)*(b.hov?.7:1),ry=Math.max(2,rx*.34),a=(b.hov?.5:.9)*(alpha==null?1:alpha);
  ctx.save();ctx.globalAlpha=a;ctx.imageSmoothingEnabled=true;ctx.drawImage(C13SH,x-rx,gy+.5-ry,rx*2,ry*2);ctx.restore();}
HOOK.wrap('battleFrame','chars13','mid-ground layer and the 2D contact shadow',function(next,now){if(!B||!C13.on)return next(now);
  const was=BV.glShadow;try{c13MidFrame(now);}catch(e){C13F.L=null;}
  if(!was)BV.glShadow=c13Shadow;
  try{return next(now);}finally{BV.glShadow=was;C13F.L=null;}});
{HOOK.before('drawUnit','chars13','mid-ground silhouettes in depth order; each unit breathes on its own phase',function(ctx,u,b,now){
    try{if(C13F.L&&C13F.t===now){c13MidDraw(ctx,b.y);if(u===C13F.last)c13MidDraw(ctx,null);}}catch(e){}
    try{if(b&&u&&!c13Still())b.i=(b.i||0)+c13Hash(u.id||u.art||'')*2;}catch(e){}});}
// the unit battleFrame draws last (the lowest feet; a tie goes to the later one, as its stable sort does): once per frame
function c13Last(){let best=null,by=-1e9;const f=L=>{for(let i=0;i<L.length;i++){const v=L[i],b=unitBox(v);if(b&&b.y>=by){by=b.y;best=v;}}};f(B.en);f(B.front);return best;}
// the 2D ground plane: a soft dithered haze toward the horizon, once per cached backdrop
{HOOK.xform('bgStatic','chars13','a haze toward the horizon on the ground plane',function(cv,theme,W,H){try{if(!cv||cv._c13||!C13.on)return cv;cv._c13=1;const ctx=cv.getContext('2d'),gy=bgGY(H),rows=Math.max(4,Math.round((H-gy)*C13.hazeK));
    // the haze takes the far air's colour (the sky band just above the ridges), lifted toward white: atmospheric perspective, not the ridge's own shadow
    const d=ctx.getImageData(0,Math.max(0,Math.round(gy*.6)),W,2).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){if(d[i+3]>200){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}}if(!n)return cv;
    const col=mix(rh([r/n,g/n,b/n]),'#ffffff',.3);
    // dithered: a pixel is painted when its share of the haze beats the Bayer threshold (full colour, so the ground keeps hard pixels)
    const id=ctx.getImageData(0,gy,W,rows),p=id.data,C=hx(col);for(let y=0;y<rows;y++){const t=1-y/rows,a=t*t*.55;for(let x=0;x<W;x++){const th=(BAYER[y%4][x%4]+.5)/16,i=(y*W+x)*4;if(a>th){p[i]=Math.round(p[i]+(C[0]-p[i])*.6);p[i+1]=Math.round(p[i+1]+(C[1]-p[i+1])*.6);p[i+2]=Math.round(p[i+2]+(C[2]-p[i+2])*.6);}}}
    ctx.putImageData(id,0,gy);}catch(e){}return cv;});}
// ---------- 4. damage text ----------
{HOOK.after('fx','chars13','damage entries carry their element as a class',function(r,u,txt,cls){try{if(!u||!u.fx||!u.fx.length||!/dmg/.test(cls||'')||/poison|burn|bleed/.test(cls))return;const f=u.fx[u.fx.length-1];if(!f||f.cls!==cls)return;
    const el=u.fxEl;if(el&&ELC[el]&&Math.abs((u.fxT||0)-f.t)<400)f.cls+=' el-'+el;}catch(e){}});}
// the reaction banner's box was measured in Nunito 900; the fantasy face is wider, so its font size follows the width ratio
let C13_FR=0;
function c13FaceRatio(){if(C13_FR)return C13_FR;try{const x=document.createElement('canvas').getContext('2d');x.font='900 100px Nunito, system-ui, sans-serif';const a=x.measureText('Melt Shatter').width;x.font="700 100px 'Cinzel Decorative', Georgia, serif";const b=x.measureText('Melt Shatter').width;C13_FR=a>0&&b>0?Math.max(.6,Math.min(1,a/b*.98)):.76;}catch(e){C13_FR=.76;}return C13_FR;}
HOOK.xform('b9BanBox','chars13','the banner text in the fantasy face fits its measured box',function(r){try{if(r&&r.fs)r.fs=+(r.fs*c13FaceRatio()).toFixed(2);}catch(e){}return r;});
try{const el=Object.keys(ELC).map(k=>`.fxlayer .fx2.b3fx.el-${k}{color:${tint(ELC[k],k==='shadow'?.45:.3)}}`).join('');
  const st=document.createElement('style');st.id='chars13-css';st.textContent=
    `.fxlayer .fx2.b3fx{font-family:'Pixelify Sans',var(--fd),sans-serif;font-weight:700;letter-spacing:0;color:#fff;text-shadow:.5px 0 0 #0b0610,-.5px 0 0 #0b0610,0 .5px 0 #0b0610,0 -.5px 0 #0b0610,.5px .5px 0 #0b0610,-.5px -.5px 0 #0b0610,.5px -.5px 0 #0b0610,-.5px .5px 0 #0b0610,0 1px 0 #0b0610}`+
    `.fxlayer .fx2.b3fx.weak{color:#ffb060}.fxlayer .fx2.b3fx.res{color:#aab8cc}.fxlayer .fx2.b3fx.heal{color:#8dff9f}${el}`+
    `.fxlayer .fx2.b3fx.crit{color:#ffd23d;animation-name:c13crit}.fxlayer .fx2.b3fx.crit::after{content:"!"}`+
    `.fxlayer .fx2.b3fx.stat.miss{color:#9a9ca8;font-size:.78em;font-weight:400}`+
    `.fxlayer .fx2.b3fx.react b{font-family:var(--ffan);font-size:.76em;letter-spacing:.02em}.bstage .b9ban b{font-family:var(--ffan);letter-spacing:.03em}`+
    `@keyframes c13crit{0%{transform:translateY(2px) scale(.5);opacity:0;color:#fff;text-shadow:0 0 6px #fff,0 0 2px #fff}6%{transform:translateY(-1px) scale(1.35);opacity:1;color:#fff;text-shadow:0 0 5px #fff,.5px .5px 0 #0b0610}16%{transform:none;color:#ffd23d}80%{opacity:1;transform:translateY(-2px)}100%{transform:translateY(-3px);opacity:0}}`+
    `html.rm .fxlayer .fx2.b3fx.crit{animation-name:fade2!important}@media (prefers-reduced-motion:reduce){.fxlayer .fx2.b3fx.crit{animation-name:fade2!important}}`;
  document.head.appendChild(st);}catch(e){}
try{window.__C13={C13,code:c13Code,frame:c13Frame,mid:c13Mid,midKind:c13MidKind,outline:c13Outline,mask:c13Mask,heavy:c13Heavy,ratio:c13FaceRatio,shadow:c13Shadow,get F(){return C13F;}};}catch(e){}
