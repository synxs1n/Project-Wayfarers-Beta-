// ===== rivalghost.js (v0.8.0): a personal quest rival waits, see through, until its wayfarer is in your six =====
// A personal quest rival (G.personal[id], state 'active') stands on its realm's field like a bounty elite, but only fights when that
// hero is in the party (G.party: the six, Vanguard and Rearguard alike; the same rule fightElite always used). Without them:
//  - both world renderers draw it at about 45% opacity, half desaturated, with a faint shimmer and no red aura or marker
//    (worldrt.js worldDraw for 2D, hd2d.js hdActors for HD-2D call rgGhostAlpha and rgGhostCanvas);
//  - it is not solid (worldgen.js solidAt, worldrt.js diagOk skip it), so you walk through it or around it;
//  - bumping into it once per map visit (not while tap walking), or facing it and pressing A, shows a short line naming the
//    wayfarer it waits for, with that hero's portrait (WS.dlg.por, drawn by the renderWorldUI wrapper below). Never a battle;
//  - the minimap and full map show a hollow, dimmed star ('questghost' in map.js);
//  - the Personal quests row, the Quests tab and Guides > What next? say "needs <hero> in your party".
// Nothing here reads or advances the game RNG, and no save key changes.
function rivalNeed(b){return b&&b.personal&&b.state==='active'&&G&&TPL[b.personal]&&!(G.party||[]).includes(b.personal)?b.personal:null;}
function ghostActor(a){return !!(a&&a.type==='elite'&&rivalNeed(a.b));}
function rivalNeedText(b){const n=TPL[b.personal].n;return `This one waits for ${n}. Bring ${n} in your party to face it.`;}
function rivalNeedShort(b){return `Needs ${TPL[b.personal].n} in your party`;}
function ghostTalk(a){const b=a.b;say(b.name,rivalNeedText(b));if(WS.dlg){WS.dlg.por=b.personal;if(typeof renderWorldUI==='function')renderWorldUI();}}
// test hook data: the alpha each renderer drew each ghost with on its last frame
const RG={d2:{},hd:{}};
function rgGhostAlpha(now,b){return .45+.05*Math.sin(now/320+(hashS(b.id)%7));}
// a half desaturated, slightly cool copy of the map sprite (pixels only; cached per art)
function rgGhostCanvas(src,key){return imgOf('ghost:'+key,()=>{const c=mkCv(src.width,src.height),x=c.getContext('2d');x.drawImage(src,0,0);
  try{const d=x.getImageData(0,0,c.width,c.height),p=d.data;for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;const l=p[i]*.3+p[i+1]*.59+p[i+2]*.11;
    p[i]=Math.round(p[i]*.45+l*.55*.94);p[i+1]=Math.round(p[i+1]*.45+l*.55*1.0);p[i+2]=Math.round(Math.min(255,p[i+2]*.45+l*.55*1.12));}x.putImageData(d,0,0);}catch(e){}
  return c;});}
// 2D: the ghost and its shimmer (two pale motes drifting up through it)
function rgDraw2D(ctx,a,cx,cy,now){const b=a.b,mo=MON[b.mon],src=imgOf('mapmon:'+mo.art,()=>monCanvas(mo.art)),c=rgGhostCanvas(src,mo.art);
  const bob=Math.floor(now/400)%2,X=a.x*TS+8-cx,Y=a.y*TS-cy,al=rgGhostAlpha(now,b);
  ctx.save();ctx.fillStyle='rgba(170,200,255,.10)';ctx.beginPath();ctx.ellipse(X,Y+14,11,4,0,0,7);ctx.fill();
  ctx.globalAlpha=al;drawSprite(ctx,c,X,Y+17-bob,true);
  for(let k=0;k<2;k++){const p=((now/1500+k*.5+(hashS(b.id)%5)*.1)%1);ctx.globalAlpha=.5*(1-p);ctx.fillStyle='#dcecff';ctx.fillRect(Math.round(X-5+k*9+Math.sin(p*6+k)*2),Math.round(Y+8-p*22),1,2);}
  ctx.restore();RG.d2[b.id]=al;}
// HD-2D: called from hdActors with its batches; drawn in the blended batch so the alpha holds
function rgDrawHD(a,BB,fx,fz,bob,sp,V,ts){const b=a.b,mo=MON[b.mon],src=imgOf('mapmon:'+mo.art,()=>monCanvas(mo.art)),c=rgGhostCanvas(src,mo.art),al=rgGhostAlpha(ts,b);
  hdDecal(BB,'glow',hdGlowS(),fx,fz+1,22,9,170,200,255,40);
  hdChar(BB,c,fx,(bob*.6-sp)*V,fz,true,Math.round(al*255),16);hdShadowC(fx,fz+1,.7);RG.hd[b.id]=al;}
// the needed hero's portrait beside the line
{const rw0=renderWorldUI;renderWorldUI=function(){const r=rw0.apply(this,arguments);try{const d=$('wdlg'),id=WS.dlg&&WS.dlg.por;
  if(d&&id&&TPL[id]){const bt=d.querySelector('.dlg');if(bt&&!bt.querySelector('.dlgpor')){bt.classList.add('por');bt.insertAdjacentHTML('afterbegin',`<span class="dlgpor"><img src="${heroURL(id)}" alt="${esc(TPL[id].n)}"></span>`);}}}catch(e){}return r;};}
// the bump hint shows once per rival per map visit, and never while a tap walk passes through
{const wi0=worldInputDir;worldInputDir=function(){WS.inSrc=(inputSources()[0]||[])[0]||null;return wi0.apply(this,arguments);};}
function rgBump(m,a){if(WS.rgMap!==m.id){WS.rgMap=m.id;WS.rgSaid={};}if(WS.inSrc==='tap'||WS.rgSaid[a.b.id])return false;WS.rgSaid[a.b.id]=1;WS.held=[];ghostTalk(a);return true;}
try{window.__RG={need:b=>rivalNeed(b),ghost:a=>ghostActor(a),text:b=>rivalNeedText(b),alpha:RG,actors:()=>WS.m?dynActors(WS.m):[],marks:()=>WS.m?mapMarks(WS.m):[]};}catch(e){}
