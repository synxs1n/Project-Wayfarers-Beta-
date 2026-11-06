// v0.8.2 themed dungeons, part 2: what is drawn (docs/v082-dungeons.md).
// Low (2D) and Medium (HD-2D), 933x705: every material's dungeon draws its own tiles (render hook D8.n2d), props (D8P) and, in HD-2D, its
// own block faces (D8.hd.struct); battles fought there use the material's backdrop (organic places on the cavern stage); the lair entrance is
// its own structure (64x100 sprite, a LAIR plaque, the tower and the light column in HD-2D), its own map icon and legend entry, and the
// relit lair looks different (gold beacon and plaque); nothing of the lair is drawn over the hero; a save inside a dungeon on a tile that is
// now solid loads on the nearest open tile, other saved tiles load where they were. Usage: PWHTML=../../out/aurelis3.html node v082db.js
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
  // the lair
  const L=await ev(()=>{const A=__A,D=__D8,G=A.G;G.run.order[1]=A.ZONES.findIndex(z=>z.key==='glacier');G.cleared[1]=0;A.resetMaps();const f=A.getMap('f1');let p=null;for(const dy of [5,4,6,3,2,7,8])for(const dx of [0,1,-1,2,-2])if(!p&&!A.solidAt(f,f.ent[0]+dx,f.ent[1]+dy))p=[f.ent[0]+dx,f.ent[1]+dy];
    A.V.screen='world';A.V.modal=null;A.placeAt('f1',p[0],p[1],'u');A.render();return {ent:f.ent,p};});await wait(tier==='low'?300:1000);
  const l1=await ev(()=>{const A=__A,D=__D8,f=A.WS.m;A.worldDraw(performance.now());const mk=A.mapMarks(f).filter(o=>o.x===f.ent[0]&&o.y===f.ent[1]).map(o=>o.k),html=D.mMap();
    const st=D.lair(f).L,full=D.lairCanvas(st,'all'),px=(c,x,y)=>Array.from(c.getContext('2d').getImageData(x,y,1,1).data.slice(0,3));
    const caves=(f.caves||[]).map(c=>c.kind);return {mk,legend:/Lair/.test(html),last:D.D8.lair.last,fx:D.D8.lair.fx2d,hd:D.D8.lair.hd,w:full.width,h:full.height,plaque:px(full,22,57-11+0),beacon:px(full,29,6),caves};});
  chk(`${tier}: the lair is its own map icon ("lair") and legend entry`,l1.mk.includes('lair')&&l1.legend||JSON.stringify(l1));
  chk(`${tier}: the lair sprite is a 64x100 structure (a cave mouth is 40x30, the gatehouse 48x40)`,l1.w===64&&l1.h===100&&l1.last&&l1.last.id==='f1'||JSON.stringify(l1));
  if(tier==='low')chk('2D: the light column and braziers drawn over the lair',!!l1.fx&&l1.fx.lit===false||JSON.stringify(l1.fx));
  else chk('HD-2D: the lair gate is a card (the tower and the column are billboards)',l1.last.part==='card'&&l1.hd&&l1.hd.beam===1||JSON.stringify([l1.last,l1.hd]));
  // nothing over the hero: the hero right north of the lair (in front of the column in 2D, behind it in HD-2D)
  const face=await ev(([ent])=>{const A=__A,D=__D8,f=A.WS.m;let p=null;for(const dy of [-2,-3,-4])if(!A.solidAt(f,ent[0],ent[1]+dy)){p=[ent[0],ent[1]+dy];break;}if(!p)return {skip:1};
    A.placeAt('f1',p[0],p[1],'d');A.WS.cam=null;A.render();const t=performance.now();A.worldDraw(t);A.worldDraw(t);
    if(A.HD.live)return {hd:1,front:D.D8.lair.hd&&D.D8.lair.hd.front,beam:D.D8.lair.hd&&D.D8.lair.hd.beam};
    const cv=A.WS.cv,sc=cv.width/A.WS.vw,cx=Math.round(A.WS.cam.x),cy=Math.round(A.WS.cam.y),hx=Math.round(A.WS.px)+8-cx,hy=Math.round(A.WS.py)-cy;
    const box=()=>Array.from(cv.getContext('2d').getImageData(Math.round((hx-7)*sc),Math.round((hy-6)*sc),Math.round(14*sc),Math.round(22*sc)).data).join(',');
    window.__D8OFF=true;A.worldDraw(t);const a=box();window.__D8OFF=false;A.worldDraw(t);const b=box();return {same:a===b,fx:D.D8.lair.fx2d};},[L.ent]);
  chk(`${tier}: no lair glow or column over the hero's face`,face.skip||(face.hd?face.front===true:face.same)||JSON.stringify(face));
  // relit
  const l2=await ev(([p])=>{const A=__A,D=__D8;A.G.cleared[1]=1;A.resetMaps();A.placeAt('f1',p[0],p[1],'u');A.render();A.worldDraw(performance.now());const f=A.WS.m,mk=A.mapMarks(f).filter(o=>o.x===f.ent[0]&&o.y===f.ent[1]).map(o=>o.k);
    const st=D.lair(f).L,full=D.lairCanvas(st,'all'),px=(c,x,y)=>Array.from(c.getContext('2d').getImageData(x,y,1,1).data.slice(0,3)),html=D.mMap();const o={mk,lit:st.lit,last:D.D8.lair.last,legend:/Lair \(relit\)/.test(html),plaque:px(full,22,46),beacon:px(full,29,6)};
    A.G.cleared[1]=0;A.resetMaps();return o;},[L.p]);
  const unl={plaque:await ev(()=>{const D=__D8,A=__A,st=D.lair(A.getMap('f1')).L,c=D.lairCanvas(st,'all');return [Array.from(c.getContext('2d').getImageData(22,46,1,1).data.slice(0,3)),Array.from(c.getContext('2d').getImageData(29,6,1,1).data.slice(0,3))];})};
  chk(`${tier}: the relit lair changes look (gold beacon ${l2.beacon} against ${unl.plaque[1]}, plaque ${l2.plaque} against ${unl.plaque[0]}) and icon (${l2.mk})`,
    l2.lit&&l2.mk.includes('lairlit')&&l2.legend&&l2.beacon[0]>200&&l2.beacon[1]>180&&l2.beacon[2]<120&&unl.plaque[1][2]>150&&l2.plaque.join()!==unl.plaque[0].join()||JSON.stringify([l2,unl]));
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
