// v0.8.2 themed dungeons, part 2: what is drawn (docs/v082-dungeons.md).
// Low (2D) and Medium (HD-2D), 933x705: every material's dungeon draws its own tiles (render hook D8.n2d), props (D8P) and, in HD-2D, its
// own block faces (D8.hd.struct); battles fought there use the material's backdrop (organic places on the cavern stage); the lair is a
// mound raised from the field's own ground (solid rock tiles around the unchanged entrance, every target reachable), with no flat sprite
// or lettering, geometry in HD-2D and a raised hill in 2D, its own map icon and legend entry; the relit lair looks different (gold light,
// a cleared mouth); nothing of the lair is drawn over the hero; a save on a tile that is now solid (a dungeon liquid, a mound tile) loads
// on the nearest open tile, other saved tiles load where they were. Usage: PWHTML=../../out/aurelis3.html node v082db.js
const {open,chk,done}=require('./pw');
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:true,hints:false,minimap:true}}));`;
const boot=async t=>{const H=await open({w:933,h:705,pre:META(t)});await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.run.seed=424242;A.resetMaps();A.render();});await H.wait(400);return H;};
(async()=>{
for(const tier of ['low','medium']){const H=await boot(tier);const {ev,wait}=H;
  const plan=await ev(()=>{const A=__A,D=__D8,out={};A.ZONES.forEach((z,i)=>{const sv=A.G.run.order[1];A.G.run.order[1]=i;const st=D.styleFor(1,false,false);A.G.run.order[1]=sv;if(!out[st.mat])out[st.mat]={i,key:z.key||'zone'+i,org:st.org};});return out;});
  for(const [mat,P] of Object.entries(plan)){
    await ev(([i])=>{const A=__A,D=__D8.D8;A.G.run.order[1]=i;A.G.cleared[1]=0;A.resetMaps();D.n2d={};D.hd={};const d=A.getMap('d1');d.roam=[];A.V.screen='world';A.V.modal=null;A.placeAt('d1',d.start[0],d.start[1],'d');A.render();},[P.i]);await wait(tier==='low'?300:900);
    const r=await ev(([mat,org])=>{const A=__A,D=__D8,d=A.WS.m;A.worldDraw(performance.now());const hasP=d.t.some(r=>r.includes('P'));
      try{if(A.B)A.finishBattle('flee');}catch(e){}A.V.screen='world';const st=A.startBattle({stage:1,kind:'dungeon'});const th=A.battleTheme();const o={d8:d.d8,n2d:D.D8.n2d[mat]||0,other:Object.keys(D.D8.n2d).filter(k=>k!==mat),hasP,prop:D.D8P().some(k=>k.startsWith(mat+':pillar')),hd:Object.assign({},D.D8.hd),live:A.HD.live,th,bg:D.BG(th)};
      try{A.finishBattle('flee');}catch(e){}A.V.screen='world';A.V.modal=null;return o;},[mat,P.org]);
    chk(`${tier} ${mat} (${P.key}): the dungeon is ${mat}, its 2D tiles drew in the material (${r.n2d} tiles, no other material)`,r.d8===mat&&r.n2d>1000&&!r.other.length||JSON.stringify(r));
    if(r.hasP)chk(`${tier} ${mat}: decor props drawn in the material`,r.prop||JSON.stringify(r));
    if(tier==='medium')chk(`${mat}: HD-2D live with the material's block faces and tops`,r.live&&r.hd.struct===mat&&r.hd.id==='d1'||JSON.stringify(r));
    chk(`${tier} ${mat}: a battle here uses the ${P.org?'cavern':'hall'} backdrop in the material (${r.th})`,r.th===(P.org?'c_':'d_')+'d8'+mat&&r.bg||r.th);}
  // side caves: organic, in the material of their tileset
  const cv=await ev(()=>{const A=__A,out=[];for(let s=0;s<5;s++){const f=A.getMap('f'+s);(f.caves||[]).forEach(c=>{const m=A.getMap(c.id);out.push([c.id,c.kind,m.d8,m.d8org,m.d8carved]);});}return out;});
  chk(`${tier}: side caves and fortresses carry a material (${JSON.stringify(cv)})`,cv.length>0&&cv.every(q=>q[2]&&(q[1]==='fort'?q[2]==='keep'&&!q[3]:q[3]&&q[4]>0)));
  // the lair: a mound raised from the field's own ground, the entrance dug into it (journey seed 1034, stage 3: the entrance faces south)
  const L=await ev(()=>{const A=__A,G=A.G;G.run.seed=1034;G.run.order[3]=A.ZONES.findIndex(z=>z.key==='deeps');G.cleared[3]=0;A.resetMaps();const f=A.getMap('f3');let p=null;
    const o=f.entOut||[f.ent[0],f.ent[1]+1],fv=[o[0]-f.ent[0],o[1]-f.ent[1]];for(const k of [4,3,5,2])if(!p&&!A.solidAt(f,f.ent[0]+fv[0]*k,f.ent[1]+fv[1]*k))p=[f.ent[0]+fv[0]*k,f.ent[1]+fv[1]*k];
    A.V.screen='world';A.V.modal=null;A.placeAt('f3',p[0],p[1],fv[1]>0?'u':'d');A.render();return {ent:f.ent,p,fv};});await wait(tier==='low'?300:1000);
  const l1=await ev(()=>{const A=__A,D=__D8,f=A.WS.m,Lr=f.d8lair;A.worldDraw(performance.now());const mk=A.mapMarks(f).filter(o=>o.x===f.ent[0]&&o.y===f.ent[1]).map(o=>o.k),html=D.mMap();
    const solid=Lr?Lr.tiles.every(([x,y])=>f.t[y][x]==='#'&&A.solidAt(f,x,y)):false,E=A.tileAt(f,f.ent[0],f.ent[1]),out=f.entOut||[f.ent[0],f.ent[1]+1];
    return {mk,legend:/Lair/.test(html),tiles:Lr?Lr.tiles.length:0,top:Lr?Lr.top:0,solid,E,outOpen:!A.solidAt(f,out[0],out[1]),issues:A.mapIssues(f).length+A.pathAssets(f).length,
      facade:D.facade(f),last:D.D8.lair.last,fx:D.D8.lair.fx2d,hd:D.D8.lair.hd,n2d:D.D8.lair.n2d||0,south:Lr&&Lr.south};});
  chk(`${tier}: the lair is its own map icon ("lair") and legend entry`,l1.mk.includes('lair')&&l1.legend||JSON.stringify(l1));
  chk(`${tier}: the lair is a mound of ${l1.tiles} field rock tiles (solid like a cliff) around the unchanged entrance, its way in open, every target reachable`,
    l1.tiles>=9&&l1.solid&&l1.E==='E'&&l1.outOpen&&l1.issues===0||JSON.stringify(l1));
  chk(`${tier}: no flat sprite or lettering: the entrance prop draws nothing (${l1.facade}), the mound is drawn from its tiles`,l1.facade[0]===1&&l1.facade[1]===1&&l1.last&&l1.last.part==='mound'||JSON.stringify(l1));
  if(tier==='low')chk('2D: the raised hill, the light from the mouth and the plume drawn',l1.n2d>0&&!!l1.fx&&l1.fx.lit===false||JSON.stringify(l1));
  else chk(`HD-2D: the hill is geometry (${l1.hd&&l1.hd.geo} quads, ${l1.hd&&l1.hd.top} px tall) with the mouth in its south face`,!!l1.hd&&l1.hd.geo>=20&&l1.hd.top>=14&&l1.south===true||JSON.stringify(l1.hd));
  // nothing over the hero: the hero right north of the lair (behind the plume)
  const face=await ev(([ent])=>{const A=__A,D=__D8,f=A.WS.m;let p=null;for(const dy of [-3,-4,-5,-6,-7])for(const dx of [0,-1,1,-2,2])if(!p&&!A.solidAt(f,ent[0]+dx,ent[1]+dy))p=[ent[0]+dx,ent[1]+dy];if(!p)return {skip:true};
    A.placeAt('f3',p[0],p[1],'d');A.WS.cam=null;A.render();const t=performance.now();A.worldDraw(t);A.worldDraw(t);
    if(A.HD.live)return {hd:1,front:D.D8.lair.hd&&D.D8.lair.hd.front};
    const cv=A.WS.cv,sc=cv.width/A.WS.vw,cx=Math.round(A.WS.cam.x),cy=Math.round(A.WS.cam.y),hx=Math.round(A.WS.px)+8-cx,hy=Math.round(A.WS.py)-cy;
    const box=()=>Array.from(cv.getContext('2d').getImageData(Math.round((hx-7)*sc),Math.round((hy-6)*sc),Math.round(14*sc),Math.round(22*sc)).data).join(',');
    window.__D8OFF=true;A.worldDraw(t);const a=box();window.__D8OFF=false;A.worldDraw(t);const b=box();return {same:a===b};},[L.ent]);
  chk(`${tier}: no lair glow or plume over the hero's face`,face.skip||(face.hd?face.front===true:face.same)||JSON.stringify(face));
  // relit: calm gold light, no bones, banner or rubble
  const l2=await ev(([p])=>{const A=__A,D=__D8;const f0=A.getMap('f3'),s0=D.lairState(f0),t0=D.lairTex(s0);A.G.cleared[3]=1;A.resetMaps();A.placeAt('f3',p[0],p[1],'u');A.render();A.worldDraw(performance.now());
    const f=A.WS.m,mk=A.mapMarks(f).filter(o=>o.x===f.ent[0]&&o.y===f.ent[1]).map(o=>o.k),st=D.lairState(f),t1=D.lairTex(st),html=D.mMap();
    const px=(c,x,y)=>Array.from(c.getContext('2d').getImageData(x,y,1,1).data.slice(0,3));let diff=0;const a=t0.getContext('2d').getImageData(0,32,32,32).data,b=t1.getContext('2d').getImageData(0,32,32,32).data;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])diff++;
    const o={mk,lit:st.lit,glow:[s0.glow,st.glow],legend:/Lair \(relit\)/.test(html),diff,fx:D.D8.lair.fx2d};A.G.cleared[3]=0;A.resetMaps();return o;},[L.p]);
  chk(`${tier}: the relit lair changes look (light ${l2.glow[0]} -> ${l2.glow[1]}, ${l2.diff} mouth pixels differ) and icon (${l2.mk})`,l2.lit&&l2.glow[1]==='#ffd870'&&l2.glow[0]!=='#ffd870'&&l2.diff>40&&l2.mk.includes('lairlit')&&l2.legend||JSON.stringify(l2));
  // a save on a tile the mound now covers loads beside it
  const fs=await ev(()=>{const A=__A,D=__D8,G=A.G;A.resetMaps();const f=A.getMap('f3'),t=f.d8lair.tiles.find(([x,y])=>Math.abs(x-f.ent[0])===2)||f.d8lair.tiles[0];G.pos={m:'f3',x:t[0],y:t[1],f:'d'};A.saveGame();A.resetMaps();D.enterFromSave();
    return {t,at:[A.WS.m.id,A.WS.x,A.WS.y],solid:A.solidAt(A.WS.m,A.WS.x,A.WS.y)};});
  chk(`${tier}: a field save on a tile the mound now covers loads beside it (${JSON.stringify(fs.at)} from ${fs.t})`,fs.at[0]==='f3'&&!fs.solid&&Math.abs(fs.at[1]-fs.t[0])+Math.abs(fs.at[2]-fs.t[1])<=4);
  // saves inside a dungeon
  const sv=await ev(()=>{const A=__A,D=__D8,G=A.G;G.run.order[1]=A.ZONES.findIndex(z=>z.key==='strand');A.resetMaps();const d=A.getMap('d1');let pool=null,carved=null;
    for(let y=1;y<d.h-1&&!pool;y++)for(let x=1;x<d.w-1;x++)if(d.t[y][x]==='~'){pool=[x,y];break;}
    window.__D8OFF=true;A.resetMaps();const d0=A.getMap('d1');window.__D8OFF=false;A.resetMaps();const d1=A.getMap('d1');
    for(let y=1;y<d1.h-1&&!carved;y++)for(let x=1;x<d1.w-1;x++)if(d0.t[y][x]==='#'&&d1.t[y][x]==='.'){carved=[x,y];break;}
    const go=p=>{G.pos={m:'d1',x:p[0],y:p[1],f:'d'};A.saveGame();A.resetMaps();D.enterFromSave();return [A.WS.m.id,A.WS.x,A.WS.y,A.solidAt(A.WS.m,A.WS.x,A.WS.y)];};
    const a=go(pool),b=go(carved),c=go(d1.start);return {pool,carved,a,b,c};});
  chk(`${tier}: a save on a tile that is now liquid loads on the nearest open tile in the same dungeon (${JSON.stringify(sv.a)} from ${sv.pool})`,sv.a[0]==='d1'&&!sv.a[3]&&Math.abs(sv.a[1]-sv.pool[0])+Math.abs(sv.a[2]-sv.pool[1])<=3);
  chk(`${tier}: saves on carved floor and on the start load where they were`,sv.b[0]==='d1'&&sv.b[1]===sv.carved[0]&&sv.b[2]===sv.carved[1]&&!sv.b[3]&&sv.c[0]==='d1'&&!sv.c[3]||JSON.stringify(sv));
  await H.browser.close();}
await done({browser:{close:async()=>{}}});})();
