// ===== look9.js (v0.11.2): realm identity, step 1: new looks for journeys started from now on =====
// Five new looks on top of the six layout tilesets: forest, marsh, volcanic, desert, mountain (plus boreal, ash wastes, sky isles and
// sunken ruins for realms that shared a look). A look is a full palette, its own tree or prop sprite (worldgfx.js objCanvas) and a
// terrain density pass on fields (more trees, rocks or pools). The layout tileset stays the realm's own, except Ironroot, which moves
// from the underground cave rules to the open heights rules (look.base).
// New journeys only: G.run.tv===2 (set in newRun). A journey started before keeps every realm exactly as it was drawn.
const LOOK9={
 orchard:{n:'forest',tree:'canopy',leaf:'#2a6a2c',leaf2:'#1e4e22',leaf3:'#4a9a40',pal:{g:['#3f7a34','#356a2c','#4f8a3e','#2c5a26'],tg:['#24521f','#3a7a2e','#7ab858'],p:['#8a6a44','#74583a','#a07e54']},lip:'#4f8a3e',dens:{T:.07,t:.03}},
 tundra:{n:'boreal',tree:'fir',snowcap:1,leaf:'#1f4a38',leaf2:'#173a2c',pal:{g:['#d8e2ea','#c4d0dc','#eef4f8','#a8b8c8'],tg:['#5a7a8a','#7a98a8','#cfe6f2']},dens:{T:.08}},
 mire:{n:'marsh',tree:'dead',trunk:'#4a4430',moss:'#6a8a4a',pal:{g:['#5a6a3a','#4e5c32','#6a7a46','#3e4a28'],tg:['#3a4a22','#56683a','#8a9a5a'],p:['#7a6a4a','#64563a','#8e7e5c'],w:['#3a5a4a','#4a6e5a','#8aa89a','#2a4436']},lip:'#6a7a46',dens:{'~':.035,T:.025,t:.03}},
 deeps:{n:'volcanic',tree:'basalt',pal:{g:['#3a3434','#2e2828','#4a4242','#221e1e'],tg:['#4a2a22','#6a3426','#ff7a2a'],p:['#5a4a44','#463a36','#6e5c54'],cl:['#2a2426','#1a1618','#3a3436','#0e0a0c']},lip:'#4a4242',dens:{R:.05}},
 mines:{n:'mountain',base:'heights',tree:'fir',leaf:'#2a4a34',leaf2:'#1e3a28',pal:{g:['#8a9078','#7a8068','#9aa088','#6a7058'],tg:['#5a6a48','#728260','#a8b88a'],p:['#a09888','#88806e','#b8b0a0'],cl:['#6a6a72','#4e4e58','#86868e','#34343c']},lip:'#9aa088',dens:{R:.06,T:.02}},
 mesa:{n:'desert',tree:'cactus',pal:{g:['#e0c088','#d0ae74','#ecd09c','#bc9a62'],tg:['#a8904a','#c0a860','#d8c47a'],p:['#c8a070','#b08a5a','#dab888'],cl:['#c0784a','#a0603a','#d8946a','#7a4428'],w:['#d8b070','#e8c888','#f8e8c0','#b89050']},lip:'#ecd09c',roofKind:'flat',dens:{R:.035,T:.015}},
 ashen:{n:'ash wastes',tree:'dead',trunk:'#2e2a28',pal:{g:['#6a6462','#5a5452','#7a7472','#4a4442'],tg:['#4a4442','#6a6260','#a89a90'],p:['#7a706a','#645a54','#8e8480']},lip:'#7a7472',dens:{T:.03,R:.02}},
 shattered:{n:'sky isles',pal:{g:['#b8b0d8','#a8a0c8','#c8c0e8','#9890b8'],tg:['#8a80b0','#a89cd0','#e0d8ff']},lip:'#c8c0e8'},
 drowned:{n:'sunken ruins',pal:{g:['#7a8a80','#6a7a70','#8a9a90','#5a6a60'],w:['#1e4a5a','#2a6070','#7aa8b0','#123a48']},lip:'#8a9a90'}
};
function lookOn(){try{return !!(G&&!G.daily&&G.run&&G.run.tv===2);}catch(e){return false;}}
{const nr0=newRun;newRun=function(){const r=nr0.apply(this,arguments);try{r.tv=2;}catch(e){}return r;};}
// the layout tileset per journey: Ironroot is heights in new journeys, cave in older ones
REALMS.forEach(R=>{R.theme0=R.theme;});
function lookSync(){const on=lookOn();REALMS.forEach(R=>{const L=LOOK9[R.key];R.theme=on&&L&&L.base?L.base:R.theme0;});}
HOOK.before('getMap','look9','realm layout tileset for this journey',function(){try{lookSync();}catch(e){}});
HOOK.before('startBattle','look9','realm layout tileset for this journey',function(){try{lookSync();}catch(e){}});
HOOK.after('newGame','look9','realm layout tileset for this journey',function(){try{lookSync();}catch(e){}});
// the palette and props
{const rv0=realmVariant;realmVariant=function(theme,R){if(!lookOn()||!R||!LOOK9[R.key])return rv0.apply(this,arguments);
  const id0=rv0.apply(this,arguments),id=id0+'~v2';if(THEME[id])return id;const L=LOOK9[R.key],V=Object.assign({},THEME[id0]);
  Object.keys(L.pal||{}).forEach(k=>{V[k]=L.pal[k].slice();});['tree','leaf','leaf2','leaf3','trunk','moss','snowcap','lip','roofKind'].forEach(k=>{if(L[k]!=null)V[k]=L[k];});
  THEME[id]=V;if(typeof DTHEME!=='undefined'&&DTHEME[id0])DTHEME[id]=DTHEME[id0];return id;};}
// the terrain pass: a grass tile becomes a tree, bush, rock or pool only when all eight neighbours are open grass, so it can never
// cut a path (any way around it stays open). Seeded per journey and field.
const LOOK9_GRASS='.,f';
function look9Terrain(m){const R=realmAt(m.s),L=R&&LOOK9[R.key];if(!L||!L.dens||m.__look9)return;m.__look9=1;
  const rnd=mulberry(((G.run.seed|0)+m.s*7919+31)>>>0),T=m.t,keys=Object.keys(L.dens);let n=0;
  const busy=new Set();(m.nodes||[]).concat(m.npcs||[]).forEach(q=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)busy.add((q.x+i)+','+(q.y+j));});
  for(let y=2;y<m.h-2;y++)for(let x=2;x<m.w-2;x++){if(!LOOK9_GRASS.includes(T[y][x])||busy.has(x+','+y))continue;let open=true;
    for(let j=-1;j<=1&&open;j++)for(let i=-1;i<=1&&open;i++){if(!LOOK9_GRASS.includes(T[y+j][x+i]))open=false;}if(!open)continue;
    const r=rnd();let acc=0;for(const k of keys){acc+=L.dens[k];if(r<acc){T[y][x]=k;n++;break;}}}
  if(n&&typeof MAPCV!=='undefined')MAPCV.dirty=1;}
HOOK.wrap('getMap','look9','realm look terrain on new fields',function(next,...a){const m=next(...a);try{if(m&&m.kind==='field'&&lookOn()&&!G.daily&&typeof m.s==='number')look9Terrain(m);}catch(e){}return m;});
// props are drawn with the map's base tileset (worldgfx.js drawObjects passes m.theme): trees and bushes take the look's sprite instead
{const oc0=objCanvas;objCanvas=function(theme,kind,v){try{if((kind==='tree'||kind==='bush')&&lookOn()){const m=(typeof P2!=='undefined'&&P2.dm)||WS.m;
  if(m&&m.theme===theme&&m.thv&&m.thv.indexOf('~v2')>0&&THEME[m.thv]&&THEME[m.thv].tree!==THEME[theme].tree)return oc0.call(this,m.thv,kind,v);}}catch(e){}return oc0.apply(this,arguments);};}
