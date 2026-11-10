// ===== breachlook11.js (v0.17.x): the Meridian Breach has its own look =====
// The owner: "When entering a battle in the Breach it doesn't show its own area in the background; also the Breach should have its own look apart
// from all the realms. I like the star approach it has now, it just looks a bit too identical to another realm."
// Nothing here edits another module's table or function: it registers and wraps.
//  - a 'breach' entry in THEME and DTHEME (the void's keys, new colours). The map keeps theme 'void' (music, weather, daylight, sites and every
//    reader of THEME[m.theme] are untouched) and takes the new palette through m.thv = 'breach' (what THM(m)/DTH(m) read: both renderers, the HD-2D bake).
//  - drawTile / drawObjects are wrapped: cracked obsidian ground with rift-light veins and pale fractured plateau edges, the void sea keeps its
//    stars and gains slow aurora bands and a few floating shards, bridges are pale rift-glass, tall grass gets glowing spores (the tufts stay,
//    so ',' still reads as encounter ground), standing stones carry glowing runes, 'P' is a rift shard cluster. The Waystone sprite is not touched.
//  - HD-2D: hdLook takes a deep indigo fog and a teal grade (voidsky10's star test still sees THEME.breach.stars); 2D overlay: an aurora ribbon
//    in the sky band above the map edge beside voidsky10's stars.
//  - the battle backdrop: battleTheme answers 'breach' for a fight begun in the Breach (spec.breach from endgame10, or spec.bg.br, set here for
//    roamers, which endgame10 leaves alone). BG.breach (2D) and, for the HD stage, hbInfo / hbFloorTile / hbProps / hbLook know the key.
// No save fields. No change to encounters, roamers, gates or the Waystone.
const BRL={dm:null,oc:{},aur:null};
THEME.breach=Object.assign({},THEME.void,{
  g:['#17111f','#0f0a17','#221a30','#09060f'],tg:['#0c3a3a','#17806f','#6fe0c8'],p:['#5c5a84','#46446a','#8e8cba'],
  cb:['#4a4462','#3a3450','#5e5878','#26203a'],w:['#05040f','#0b0a22','#e6f6ff','#020208'],cl:['#463e6c','#5a5088','#a698d6','#1a1430'],
  stone:['#4a4262','#382f52','#6c628c','#1e1930'],dec:['#3fe0c8','#9a6aff','#e8e0ff','#5fe8d0'],lip:'#9a8cd0',breach:1});
DTHEME.breach=Object.assign({},DTHEME.void,{f:['#1c1528','#150f20','#261d36','#0c0814'],w:['#2c2548','#221c3c','#4e4478','#0a0714'],top:'#04030a',acc:'#9a6aff',acc2:'#3fe0c8',name:'breach'});
if(typeof BG_NATURAL!=='undefined')BG_NATURAL.breach='void';
if(typeof BG_GPAL!=='undefined'&&BG_GPAL.void)BG_GPAL.breach=[['#1c1528','#150f20','#100b19','#0a0710'],'#3b2e66'];
if(typeof PARA_SPLIT!=='undefined')PARA_SPLIT.breach=.45;
const brIs=m=>!!(m&&m.breach&&m.kind!=='dungeon');
const brH=(x,y,k)=>{let h=(x*374761393+y*668265263+k*2246822519)>>>0;h=((h^(h>>>13))*1274126177)>>>0;return (h^(h>>>16))>>>0;};
const brLerp=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
// the palette on the map: m.thv wins over the realm and boss variants (liftOverlay re-runs applyBossTheme on every map of the realm)
function brApply(m){if(!m||!m.breach)return m;m.thv='breach';m.motif=null;m.bkey=null;return m;}
HOOK.wrap('getMap','breachlook11','the Breach palette (m.thv)',function(next,...a){const m=next(...a);try{if(a[0]==='x0')brApply(m);}catch(e){}return m;});
{const ab0=applyBossTheme;applyBossTheme=function(m){const r=ab0.apply(this,arguments);try{brApply(m);}catch(e){}return r;};}

// ---------- tiles ----------
// the aurora: slow bands of rift colour (violet to teal) over the void sea, a function of the map pixel so it runs across tiles
const BR_AUR=(()=>{const V=[154,90,255],Tl=[47,224,192],o=[];for(let ci=0;ci<6;ci++){const c=brLerp(V,Tl,ci/5);o.push([.035,.07,.11].map(a=>`rgba(${c[0]},${c[1]},${c[2]},${a})`));}return o;})();
function brTile(ctx,m,x,y,frame){const c0=tileAt(m,x,y),c=c0==='G'?'=':c0==='o'?'~':c0,px=x*TS,py=y*TS,T=THM(m);
  const f=(col,a,b,w,h)=>{ctx.fillStyle=col;ctx.fillRect(px+a,py+b,w,h);};
  const R=mulberry(brH(x,y,5)),wet=(dx,dy)=>{const n=tileAt(m,x+dx,y+dy);return n==='~'||n==='o';},fr=frame?1:0;
  if(c==='~'){const up=tileAt(m,x,y-1),landUp=up!=='~'&&up!=='B'&&up!=='o'&&up!=='#';
    if(landUp){// the cliff under an island: pale fractured face, a few veins of rift light in it
      f('#cdc4f4',0,1,16,1);for(let i=0;i<16;i+=2)if(R()<.4)f('#7a6cb0',i,1,2,1);
      for(let i=0;i<3;i++){const vx=1+Math.floor(R()*14),vy=2+Math.floor(R()*5),col=R()<.5?'#3fe0c8':'#9a6aff';f('#0a0618',vx-1,vy,3,1);f(col,vx,vy,1,3);}
      return;}
    const ph=fr*.35;
    for(let j=0;j<16;j++)for(let s=0;s<4;s++){const X=px+s*4+2,Y=py+j,v=Math.sin(Y*.021+Math.sin(X*.013+ph)*2.6+Math.sin(X*.031+Y*.009)*.9),a=1-Math.abs(v)*1.7;if(a<=0)continue;
      const lv=a>.7?2:a>.4?1:0,ci=Math.max(0,Math.min(5,Math.floor((Math.sin(X*.011-Y*.005+ph*.5)*.5+.5)*5.99)));ctx.fillStyle=BR_AUR[ci][lv];ctx.fillRect(px+s*4,py+j,4,1);}
    const dn=tileAt(m,x,y+1);
    if(brH(x,y,9)%23===3&&wet(0,-1)&&(dn==='~'||dn==='o')){// a floating shard of broken ground, bobbing a pixel between the two frames
      const sx=3+brH(x,y,10)%6,sy=4+fr;f('#cdc4f4',sx+1,sy,4,1);f('#3a3258',sx,sy+1,6,2);f('#241d3e',sx+1,sy+3,4,1);f('#120e22',sx+2,sy+4,2,1);f('rgba(154,106,255,.32)',sx-1,sy+6,8,1);f('#3fe0c8',sx+2,sy+2,1,1);}
    if(wet(-1,0)===false&&tileAt(m,x-1,y)!=='B')f('rgba(63,224,200,.5)',0,0,1,16);
    if(wet(1,0)===false&&tileAt(m,x+1,y)!=='B')f('rgba(63,224,200,.5)',15,0,1,16);
    return;}
  if(c==='B'){const vert=wet(-1,0)&&wet(1,0);
    f('#05040f',0,0,16,16);
    if(vert){f('rgba(154,106,255,.28)',1,0,1,16);f('rgba(154,106,255,.28)',14,0,1,16);f('#3a5878',13,0,2,16);f('#8cc0e0',2,0,11,16);f('#cdeeff',2,0,1,16);f('#a8d4ee',3,0,1,16);for(let j=3;j<16;j+=4)f('#7ab0d0',3,j,10,1);
      f('rgba(63,224,200,.3)',5,0,2,16);f('rgba(154,106,255,.3)',9,0,2,16);for(let i=0;i<3;i++)f('#ffffff',3+Math.floor(R()*9),Math.floor(R()*16),1,1);}
    else{f('rgba(154,106,255,.28)',0,13,16,1);f('rgba(154,106,255,.28)',0,15,16,1);f('#3a5878',0,13,16,2);f('#8cc0e0',0,2,16,11);f('#cdeeff',0,2,16,1);f('#a8d4ee',0,3,16,1);for(let i=0;i<16;i+=4)f('#7ab0d0',i,3,1,10);
      f('rgba(63,224,200,.3)',0,5,16,2);f('rgba(154,106,255,.3)',0,9,16,2);for(let i=0;i<3;i++)f('#ffffff',Math.floor(R()*16),3+Math.floor(R()*9),1,1);}
    return;}
  if(!(c==='.'||c===','||c==='N'||c==='P'||c==='W'||c==='T'||c==='t'||c==='R'||c==='f'||c==='g'||c==='S'||c==='C'||c==='c'))return;
  // cracked obsidian: a vein of rift light in a crack (dark shoulders), and a plain crack or two
  const walk=(n,glow,col)=>{let cx=2+Math.floor(R()*12),cy=1+Math.floor(R()*13);for(let k=0;k<n;k++){f('#030207',cx+1,cy,1,1);f('#030207',cx,cy+1,1,1);if(glow)f(col,cx,cy,1,1);else f('#030207',cx,cy,1,1);
      cx+=R()<.5?1:-1;cy+=R()<.6?1:0;if(cx<0||cx>15||cy>15)break;}};
  const tv=brH(x,y,3)%3===0?'#3fe0c8':'#9a6aff';
  if(R()<.62)walk(5+Math.floor(R()*6),true,tv);
  if(R()<.4)walk(4+Math.floor(R()*5),false);
  if(c===','){// glowing spores over the tufts: the tufts themselves stay, so the tile still reads as grass and encounter ground
    for(let i=0;i<5;i++){const sx=1+Math.floor(R()*14),sy=1+Math.floor(R()*13);f('rgba(63,224,200,.22)',sx-1,sy-1,3,3);f(R()<.65?'#c8fff4':'#d0b8ff',sx,sy,1,1);}}
  // the plateau's pale, fractured rim where the ground meets the void
  if(wet(0,1)){for(let i=0;i<16;i++){const h=1+Math.floor(R()*3);f(i%2?'#b3a6e0':'#8f82c4',i,16-h,1,h);}f('#d8d0ff',0,13,16,1);for(let i=0;i<16;i+=5)f('#3a2f60',i,13,2,1);}
  if(wet(0,-1)){for(let i=0;i<16;i++)if(R()<.8)f(i%2?'#a898d8':'#7a6cb0',i,0,1,1+(R()<.4?1:0));}
  if(wet(-1,0))for(let j=0;j<16;j++)if(R()<.8)f('#9486c8',0,j,1+(R()<.3?1:0),1);
  if(wet(1,0))for(let j=0;j<16;j++)if(R()<.8)f('#9486c8',15-(R()<.3?1:0),j,2,1);}
{const dt0=drawTile;drawTile=function(ctx,m,x,y,frame){const r=dt0.apply(this,arguments);try{if(brIs(m))brTile(ctx,m,x,y,frame);}catch(e){}return r;};}

// ---------- props ----------
function brProp(kind){if(BRL.oc[kind])return BRL.oc[kind];const P=(w,h)=>new PG(w+2,h+2,1,1);let g,pal,opt={};
  if(kind==='pillar'){// a cluster of rift shards, teal and violet, lit from inside
    g=P(18,28);g.poly([[5,27],[8,3],[11,27]],'A');g.poly([[9,27],[12,11],[16,27]],'B');g.poly([[1,27],[3,17],[6,27]],'B');g.poly([[8,3],[9,12],[8,27],[7,12]],'C');g.px([[8,6],[8,9],[12,15],[3,21]],'D');
    pal={A:'#2fc7b0',B:'#7a4ad8',C:'#8af4e4',D:'#f2fffb'};opt.flat='D';opt.glow='#3fe0c8';}
  else if(kind==='standing'){// an obsidian monolith with glowing runes
    g=P(12,26);g.poly([[2,25],[3,4],[6,0],[9,3],[10,25]],'A');g.poly([[6,0],[9,3],[10,25],[7,25]],'B');
    g.px([[5,6],[6,6],[5,7],[4,9],[5,9],[6,9],[6,10],[5,12],[6,12],[7,12],[5,13],[5,15],[6,16],[5,17],[4,17]],'C');g.px([[7,20],[6,21],[7,22]],'D');
    pal={A:'#2a2340',B:'#1a1430',C:'#6af4dc',D:'#b48aff'};opt.flat='CD';opt.glow='#3fe0c8';}
  else if(kind==='bush'){g=P(16,14);g.ell(8,8,7.5,5.5,'A');g.ell(5,6,3,2.5,'B');g.ell(11,7,2.5,2,'B');g.px([[4,6],[11,6],[8,9],[13,9]],'C');pal={A:'#0f2d34',B:'#17525a',C:'#8af4e4'};opt.flat='C';}
  else return null;
  return BRL.oc[kind]=paint(g,pal,opt);}
{const oc0=objCanvas;objCanvas=function(theme,kind,v){try{if(BRL.dm&&theme==='void'&&kind!=='waystone'){const c=brProp(kind);return c||oc0.call(this,'breach',kind,v);}}catch(e){}return oc0.apply(this,arguments);};}
{const do0=drawObjects;drawObjects=function(ctx,m,y){const was=BRL.dm;BRL.dm=brIs(m)?m:null;try{return do0.apply(this,arguments);}finally{BRL.dm=was;}};}

// ---------- HD-2D: fog and grade; 2D and HD overlay: the aurora in the sky band ----------
{const hl1=hdLook;hdLook=function(m,now){const o=hl1.apply(this,arguments);try{if(brIs(m)&&!(typeof mapIndoor==='function'&&mapIndoor(m))){const C=[.02,.04,.085];for(let i=0;i<3;i++)o.fog[i]=C[i];o.fogA=Math.max(o.fogA,.7);o.gain[0]*=.95;o.gain[1]*=1.03;o.gain[2]*=1.06;}}catch(e){}return o;};}
function brRibbon(ctx,x0,x1,y0,yMax,t,k){// a wavy ribbon of aurora, fading downward: strips 3 px wide, a few steps of alpha
  const V=[154,90,255],Tl=[47,224,192];for(let x=x0;x<x1;x+=3){const u=x/Math.max(1,x1-x0),c=brLerp(V,Tl,Math.max(0,Math.min(1,.5+.5*Math.sin(u*3.1+t*.12+k)))),yc=y0+Math.sin(x/29+t*.25+k)*9+Math.sin(x/11-t*.4)*3,th=12;
    for(let s=0;s<4;s++){const yy=yc+s*th/4;if(yy>yMax)break;ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${(.16-s*.036).toFixed(3)})`;ctx.fillRect(x,Math.round(yy),3,Math.ceil(th/4)+1);}}}
HOOK.after('worldDraw','breachlook11','aurora over the Breach sky band',function(){try{const m=WS.m,ctx=WS.ctx;if(!brIs(m)||!ctx)return;const vw=WS.vw,vh=WS.vh,cy=WS.cam?WS.cam.y:0,top=Math.min(vh,Math.max(0,Math.round(-cy)));if(top<8)return;
  const still=typeof gfxStill==='function'&&gfxStill(),t=still?0:performance.now()/1000;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.beginPath();ctx.rect(0,0,vw,top);ctx.clip();
  brRibbon(ctx,0,vw,top*.42,top,t,0);brRibbon(ctx,0,vw,top*.72,top,t,2.4);ctx.restore();}catch(e){}});

// ---------- the battle backdrop ----------
function brBattle(sp){return !!(sp&&(sp.breach||(sp.bg&&sp.bg.br))&&sp.kind!=='arena'&&sp.kind!=='daily'&&!(typeof BOSS_STAGE_KINDS!=='undefined'&&BOSS_STAGE_KINDS[sp.kind]));}
HOOK.after('startBattle','breachlook11','tag a fight begun in the Breach for its backdrop (roamers too)',function(){try{if(B&&B.spec&&B.spec.bg&&WS&&WS.m&&WS.m.breach)B.spec.bg.br=1;}catch(e){}});
{const bt0=battleTheme;battleTheme=function(){const k=bt0.apply(this,arguments);try{if(B&&brBattle(B.spec)&&BG.breach)return 'breach';}catch(e){}return k;};}
const brPx=(ctx,col,x,y,w,h)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),w||1,h||1);};
function brFloatIsle(ctx,x,y,w,R,dim){// a distant broken island: flat dark top with a pale lip, a hanging underside of shards, a vein of light
  const k=dim||1;brPx(ctx,'#0d0a1a',x,y,w,3);brPx(ctx,k>.8?'#7a6cb0':'#4a4078',x+1,y,w-2,1);
  for(let i=0;i<w-2;i++){const d=Math.max(0,Math.floor((w/2-Math.abs(i-w/2))*(.5+R()*.45)));ctx.fillStyle=i%3?'#120e22':'#1a1430';ctx.fillRect(x+1+i,y+3,1,Math.min(d,14));}
  brPx(ctx,R()<.5?'#3fe0c8':'#9a6aff',x+2+Math.floor(R()*(w-5)),y+4+Math.floor(R()*3),1,2);}
BG.breach=function(ctx,W,H,R){const gy=bgGY(H);
  gradBands(ctx,0,0,W,gy,['#020108','#06041a','#0a0e2c','#10303c']);
  // stars: the overworld's density (about 2 pixels in 100), a few of them brighter and larger
  const ns=Math.floor(W*gy*.02);for(let i=0;i<ns;i++){const x=Math.floor(R()*W),y=Math.floor(R()*gy*.95),b=R();brPx(ctx,b<.12?'#b48aff':b<.4?'#9fb8e8':'#e6f6ff',x,y,1,1);if(b>.97){brPx(ctx,'#ffffff',x,y,2,2);}}
  // the aurora, baked faint (the 2D stage moves it; the HD stage keeps this still)
  for(let r=0;r<3;r++){const base=gy*(.22+r*.12),ph=r*1.9;for(let x=0;x<W;x+=2){const u=x/W,c=brLerp([154,90,255],[47,224,192],.5+.5*Math.sin(u*3.1+ph)),yc=base+Math.sin(x/29+ph)*9+Math.sin(x/11-ph)*3;
    for(let s=0;s<5;s++){ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${(.15-s*.028).toFixed(3)})`;ctx.fillRect(x,Math.round(yc+s*3),2,3);}}}
  // far broken islands, and a jagged shard horizon
  for(let i=0;i<6;i++){const w=16+Math.floor(R()*26),x=Math.floor(R()*(W-w)),y=Math.floor(gy*.34+R()*gy*.38);brFloatIsle(ctx,x,y,w,R,.6+R()*.4);}
  fillRidge(ctx,ridgeLine(R,W,gy-Math.floor(H*.05),5,5),'#0b0816',gy,'#4a3e80');
  for(let i=0;i<7;i++){const x=Math.floor(R()*W),h=8+Math.floor(R()*16),col=i%2?'#7a4ad8':'#2fc7b0';ctx.fillStyle='#0b0816';for(let k=0;k<h;k++){const w=Math.max(1,Math.floor((h-k)/4));ctx.fillRect(x-w,gy-k,w*2+1,1);}brPx(ctx,col,x,gy-h+2,1,Math.max(2,h-5));}
  // the obsidian floor with veins of rift light
  groundPlane(ctx,W,H,gy,['#1a1426','#140f1e','#100b19','#0a0710'],R,'#2a2046');
  brPx(ctx,'#8a7cc0',0,gy,W,1);brPx(ctx,'#1c1432',0,gy+1,W,1);
  for(let i=0;i<14;i++){let x=Math.floor(R()*W),y=Math.floor(gy+3+R()*(H-gy-5));const col=i%3?'#9a6aff':'#3fe0c8',n=6+Math.floor(R()*9);for(let k=0;k<n;k++){brPx(ctx,'#030207',x,y+1,2,1);brPx(ctx,col,x,y,2,1);x+=R()<.5?1:2;y+=R()<.35?1:0;if(y>=H-1)break;}}
  for(let i=0;i<W/10;i++){let x=Math.floor(R()*W),y=Math.floor(gy+3+R()*(H-gy-4));for(let k=0;k<4;k++){brPx(ctx,'#050308',x,y,1,1);x+=R()<.5?1:-1;y+=1;}}
};
{const ba0=bgAnim;bgAnim=function(ctx,theme,W,H,now){if(theme!=='breach')return ba0.apply(this,arguments);const t=now/1000,gy=bgGY(H);
  for(let r=0;r<2;r++)brRibbon(ctx,0,W,gy*(.26+r*.2),gy*.8,t,r*2.4);
  for(let i=0;i<30;i++){const x=(i*73+11)%W,y=(i*41+5)%Math.floor(gy*.9);if(Math.floor(t*1.6+i)%5===0)brPx(ctx,'#ffffff',x,y,1,1);}
  for(let i=0;i<4;i++){const x=Math.floor((i*91+t*(3+i))%(W+30))-15,y=Math.floor(gy*.3+Math.sin(t*.7+i*1.7)*5+i*9),w=5+i%3*2;brPx(ctx,'#3a3258',x,y,w,2);brPx(ctx,'#a898d8',x+1,y-1,w-2,1);brPx(ctx,'rgba(154,106,255,.4)',x,y+3,w,1);}
  for(let i=0;i<10;i++){const x=Math.floor((i*53+Math.sin(t*.6+i)*5)%W),y=Math.floor(H-((t*9+i*29)%(H-gy-2)));brPx(ctx,i%2?'#3fe0c8':'#9a6aff',x,y,1,1);}};}

// ---------- the HD-2D stage knows the key ----------
{const hi0=hbInfo;hbInfo=function(key){if(key==='breach')return {key,base:'breach',kind:'field',g:'breach',out:true,D:DTHEME.breach};return hi0.apply(this,arguments);};}
{const hf0=hbFloorTile;hbFloorTile=function(info,road){if(!info||info.base!=='breach')return hf0.apply(this,arguments);
  const N=HB_TS,cv=mkCv(N,N),x=cv.getContext('2d'),R=mulberry(hashS('breachfloor')),glow=[],pk=a=>a[Math.floor(R()*a.length)];
  const px=(X,Y,w,h,col)=>{x.fillStyle=col;X=((Math.floor(X)%N)+N)%N;Y=((Math.floor(Y)%N)+N)%N;for(const ox of [0,-N])for(const oy of [0,-N])x.fillRect(X+ox,Y+oy,w,h);};
  x.fillStyle='#140f1e';x.fillRect(0,0,N,N);
  for(let i=0;i<1300;i++){const s=1+Math.floor(R()*2);px(R()*N,R()*N,s+Math.floor(R()*2),s,pk(['#1a1426','#100b19','#221a30','#0d0916']));}
  // obsidian plates with sharp seams
  for(let i=0;i<9;i++){let X=R()*N,Y=R()*N;const dx=R()<.5?1:-1,n=18+Math.floor(R()*30);for(let k=0;k<n;k++){px(X,Y,1,1,'#05030a');X+=dx;Y+=R()<.5?1:0;}}
  // veins of rift light (the emissive pixels)
  for(let i=0;i<16;i++){let X=R()*N,Y=R()*N;const col=i%3?'#9a6aff':'#3fe0c8',n=10+Math.floor(R()*18);for(let k=0;k<n;k++){px(X,Y+1,2,1,'#05030a');px(X,Y,2,1,col);glow.push([X,Y,2,1,.6]);X+=R()<.5?1:2;Y+=R()<.4?1:0;}}
  for(let i=0;i<20;i++){const X=R()*N,Y=R()*N;px(X,Y,1,1,'#c8fff4');glow.push([X,Y,1,1,.4]);}
  if(glow.length){const d=x.getImageData(0,0,N,N),a=d.data;glow.forEach(([X,Y,w,h,e])=>{for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const i=((((Math.floor(Y)+yy)%N+N)%N)*N+(((Math.floor(X)+xx)%N+N)%N))*4;a[i+3]=Math.round(255*(1-e));}});x.putImageData(d,0,0);}
  return cv;};}
{const hp0=hbProps;hbProps=function(ctx,info,BW,gy,strip,H,R,lights,night){if(!info||info.base!=='breach')return hp0.apply(this,arguments);
  const f=(col,x,y,w,h)=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),w,h);},L=(x,y,foot,r,col,int,fl)=>lights.push({x,y,foot,r,col:hbRGB(col),int,fl:fl==null?1:fl});
  const n=Math.max(4,Math.round(BW/34));for(let i=0;i<n;i++){const x=(i%2?R()*.26:.74+R()*.26)*BW,y=gy+1+Math.floor(R()*Math.max(1,strip-3)),teal=R()<.5,c1=teal?'#2fc7b0':'#7a4ad8',c2=teal?'#c8fff4':'#e0c8ff';
    if(R()<.65){f('#0b0816',x,y-8,4,8);f(c1,x+1,y-10,2,9);f(c2,x+1,y-10,1,3);f(c1,x+3,y-5,2,5);L(x+2,y-5,y,36,c1,.5,.5);}
    else{f('#1a1430',x,y-4,7,4);f('#4a3e80',x+1,y-5,5,3);f('#a898d8',x+1,y-5,4,1);}}
  L(BW*.5,gy-H*.18,gy+1,100,'#3fe0c8',.28,.3);L(BW*.22,gy-H*.1,gy+1,80,'#9a6aff',.25,.3);};}
{const hk0=hbLook;hbLook=function(info){const o=hk0.apply(this,arguments);try{if(info&&info.base==='breach'&&info.out&&HD_LOOK.night){const n=HD_LOOK.night;o.ph='night';o.night=true;o.gain=n.gain.slice();o.lift=n.lift;o.sat=n.sat;o.con=n.con;o.amb=n.amb;o.key=n.key;o.vig=n.vig;o.kp=[.5,-.1];o.kx=0;o.cloud=0;}}catch(e){}return o;};}
