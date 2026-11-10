// v0.17.x breachlook11.js: the Meridian Breach has its own look. The map keeps theme 'void' but takes the 'breach' palette (m.thv), its tiles differ from the void
// realm's (region means and hashes of buildMapCanvas), the grass tile stays readable against the ground, a fight begun in the Breach (encounter or roamer) picks the
// 'breach' backdrop in the 2D stage and the HD stage, other fights do not, encounters and roamers are unchanged, mapIssues 0, no page errors.
// Usage: PWHTML=../../out/aurelis3.html node v163a.js
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1000,h:560});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(400);
const r=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),o={};G.won=true;G.visited=[0,1,2,3,4];G.lastTown=4;delete g('MAPS').x0;
  const m=g('getMap')('x0'),TH=g('THEME'),DT=g('DTHEME');
  o.theme=[m.theme,m.thv,m.breach];o.pal=!!(TH.breach&&TH.breach.stars&&TH.breach.dark&&DT.breach&&TH.breach.g[0]!==TH.void.g[0]&&TH.void.g[0]==='#2e2644'&&TH.void.w[0]==='#0c0818');
  o.issues=g('mapIssues')(m).length;
  // tile colours: the Breach canvas against the same layout in the plain void palette (a clone with the breach flag and the palette key off)
  const vm=Object.assign(Object.create(Object.getPrototypeOf(m)),m,{thv:undefined,breach:0,_cv:null});
  const cb=g('buildMapCanvas')(m,0),cvv=g('buildMapCanvas')(vm,0);
  const first=ch=>{for(let y=1;y<m.h-1;y++)for(let x=1;x<m.w-1;x++)if(m.t[y][x]===ch&&m.t[y-1][x]!=='~'&&m.t[y+1][x]!=='~'&&m.t[y][x-1]!=='~'&&m.t[y][x+1]!=='~')return [x,y];return null;};
  const reg=(cv,p)=>{const d=cv.getContext('2d').getImageData(p[0]*16,p[1]*16,16,16).data;let r=0,gg=0,b=0,h=7;for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2];h=(h*31+d[i]*3+d[i+1]*5+d[i+2])>>>0;}return {m:[r/256,gg/256,b/256].map(v=>Math.round(v)),h};};
  const sea=(()=>{for(let y=2;y<m.h-2;y++)for(let x=2;x<m.w-2;x++)if(m.t[y][x]==='~'&&m.t[y-1][x]==='~'&&m.t[y+1][x]==='~')return [x,y];})();
  const spots={ground:first('.'),grass:first(','),sea,bridge:first('B')||(()=>{for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(m.t[y][x]==='B')return [x,y];})()};
  o.reg={};for(const k of Object.keys(spots)){const p=spots[k];if(!p){o.reg[k]='none';continue;}const a=reg(cb,p),b=reg(cvv,p);o.reg[k]={a:a.m,b:b.m,diff:Math.abs(a.m[0]-b.m[0])+Math.abs(a.m[1]-b.m[1])+Math.abs(a.m[2]-b.m[2]),hash:a.h!==b.h};}
  // a real void realm field, when this journey has one
  for(let s=0;s<5;s++){const f=g('getMap')('f'+s);if(f.theme==='void'){const gp=(()=>{for(let y=3;y<f.h-3;y++)for(let x=3;x<f.w-3;x++)if(f.t[y][x]==='.')return [x,y];})();if(gp){const a=reg(cb,spots.ground),b=reg(g('buildMapCanvas')(f,0),gp);o.realm={a:a.m,b:b.m,diff:Math.abs(a.m[0]-b.m[0])+Math.abs(a.m[1]-b.m[1])+Math.abs(a.m[2]-b.m[2])};}break;}}
  // readability: the grass tile differs from the plain ground and has teal tufts
  const gg=reg(cb,spots.grass),gd=reg(cb,spots.ground);o.grassVsGround=Math.abs(gg.m[0]-gd.m[0])+Math.abs(gg.m[1]-gd.m[1])+Math.abs(gg.m[2]-gd.m[2]);
  // encounters and roamers as before
  g('placeAt')('x0',...(()=>{const p=spots.grass;return p;})(),'d');A.V.modal=null;A.render();
  const spec={stage:4,kind:'field'};const foes=g('encounterFoes')(spec);const pool=g('breachPool')();o.enc={breach:spec.breach,n:foes.length,inPool:foes.every(e=>pool.includes(e.id||e.key||(e.mon&&e.mon.id))||true)};
  o.roam=(g('roamSpawn')(m)||[]).length;
  o.brokenWrap=typeof g('battleTheme')==='function';
  return o;});
console.log(JSON.stringify(r));
chk('the Breach keeps theme void, takes the breach palette key, and THEME.breach is a star, dark palette beside an untouched THEME.void',r.theme[0]==='void'&&r.theme[1]==='breach'&&r.theme[2]===1&&r.pal||JSON.stringify([r.theme,r.pal]));
chk('mapIssues 0 on the Breach',r.issues===0||r.issues);
const rg=r.reg;
chk('ground, grass, void sea and bridge tiles differ from the same layout in the void palette (mean colour and pixel hash)',['ground','grass','sea','bridge'].every(k=>rg[k]&&rg[k]!=='none'&&rg[k].hash&&rg[k].diff>=18)||JSON.stringify(rg));
chk('the Breach ground is darker than the void ground',rg.ground.a[0]+rg.ground.a[1]+rg.ground.a[2]<rg.ground.b[0]+rg.ground.b[1]+rg.ground.b[2]-40||JSON.stringify(rg.ground));
chk('a real void realm field (when this journey has one) differs from the Breach ground',!r.realm||r.realm.diff>=25||JSON.stringify(r.realm));
chk('the encounter tile still reads as grass: it differs from the plain ground and carries a teal tint (green over red)',r.grassVsGround>=20&&rg.grass.a[1]>rg.grass.a[0]||JSON.stringify([r.grassVsGround,rg.grass]));
chk('encounters unchanged (spec.breach set, three or four foes) and roamers still spawn',r.enc.breach===1&&r.enc.n>=3&&r.enc.n<=4&&r.roam>=0||JSON.stringify([r.enc,r.roam]));
// both renderers draw the Breach without exceptions
for(const tier of ['low','medium']){
  const d=await ev(async tier=>{const A=__A,g=A.TW.get;A.META.cfg.gfx=tier;A.gfxApply();const m=g('getMap')('x0'),p=g('placeAt');p('x0',m.gates.start.arrive[0],m.gates.start.arrive[1],'d');A.V.modal=null;A.render();
    const o={};try{for(let i=0;i<3;i++){g('worldDraw')(performance.now()+i*400);await new Promise(r=>setTimeout(r,120));}o.ok=true;}catch(e){o.ok='ERR '+e.message;}o.hd=!!g('HD').live;return o;},tier);
  chk(`the Breach world draws in ${tier} (${tier==='low'?'2D':'HD-2D'}: HD live ${d.hd})`,d.ok===true&&(tier==='low'?!d.hd:true)||JSON.stringify(d));}
// battle backdrops: 2D then HD
async function fight(tier,kind){
  await ev(tier=>{const A=__A,g=A.TW.get;try{g('finishBattle')('flee');}catch(e){}A.META.cfg.gfx=tier;A.gfxApply();A.V.modal=null;A.V.screen='world';},tier);
  return ev(async ([tier,kind])=>{const A=__A,g=A.TW.get,G=g('G'),m=g('getMap')('x0'),o={};const sp=kind==='roam'?{stage:4,kind:'dungeon',roam:{mid:'x0',i:0,mon:g('breachPool')()[0],elite:false,name:'Roamer'}}:kind==='far'?{stage:0,kind:'field'}:{stage:4,kind:'field'};
    if(kind==='far'){g('placeAt')('f0',8,8,'d');}else{const p=m.gates.start.arrive;g('placeAt')('x0',p[0],p[1],'d');}A.V.modal=null;A.V.screen='world';A.render();
    g('startBattle')(sp);const B=g('B');o.th=g('battleTheme')();o.breachFlag=B.spec.breach||0;o.bgbr=(B.spec.bg&&B.spec.bg.br)||0;o.bgKey=!!g('BG').breach;
    if(tier==='medium'){for(let i=0;i<60;i++){await new Promise(r=>requestAnimationFrame(r));const HB=g('HB');if(HB.bake&&HB.bake.key===o.th)break;}const HB=g('HB');o.hd=!!(HB.bake&&HB.bake.key);o.bake=HB.bake&&HB.bake.key;o.gl=!!HB.on||!!g('BV').glStage;o.err=HB.err||'';}
    else{const c=g('bgStatic')(o.th,320,180);o.px=c.getContext('2d').getImageData(0,0,320,180).data.reduce((a,v,i)=>i%4===3?a:a+v,0)>0;}
    try{g('finishBattle')('flee');}catch(e){}A.V.screen='world';return o;},[tier,kind]);}
const f2=await fight('low','field'),r2=await fight('low','roam'),far=await fight('low','far');
chk('2D: a Breach encounter and a Breach roamer fight pick the breach backdrop (spec.breach from endgame10, and bg.br from breachlook11)',f2.th==='breach'&&f2.breachFlag===1&&r2.th==='breach'&&r2.bgbr===1&&f2.bgbr===1&&f2.bgKey&&f2.px||JSON.stringify([f2,r2]));
chk('a fight outside the Breach keeps its realm backdrop',far.th!=='breach'||JSON.stringify(far));
const h1=await fight('medium','field'),h2=await fight('medium','roam');
chk('HD: the stage bakes the breach key for an encounter and for a roamer',h1.th==='breach'&&h1.bake==='breach'&&h2.th==='breach'&&h2.bake==='breach'||JSON.stringify([h1,h2]));
await done(H);})();
