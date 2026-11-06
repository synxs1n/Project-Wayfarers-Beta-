// Beta v0.7.1 world pass: the owner's stuck spot. Hearthholm (Glacier Teeth, snow) as the third town, at night: the hero stands at the
// Alchemy shop's front right corner (14,26) and walks left toward its door step (12,26).
// Old build (path guard and v0.7.1 fixes off): a bush on (13,26), the town wall south of it hides it in HD-2D, the hero does not move (and drawAudit flags the tile). Now: the apron is clear, the hero reaches the step and
// every apron tile is open. Then the rule the guard uses (pgHides) against a real HD-2D frame (Medium, 933x705): a bush put back on
// (13,26) leaves the picture as it was (the town wall south of it hides it whole), a bush on open street changes it.
// Usage: PWHTML=../../out/aurelis3.html node v071wb.js
const {open,chk,done}=require('./pw');
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'medium',rmotion:false,hints:false}}));`;
const PROJ=`(x,y,z)=>{const M=__A.HD.mats.vp,X=M[0]*x+M[4]*y+M[8]*z+M[12],Y=M[1]*x+M[5]*y+M[9]*z+M[13],W=M[3]*x+M[7]*y+M[11]*z+M[15],r=__A.WS.cv.getBoundingClientRect();return [r.left+(X/W*.5+.5)*r.width,r.top+(1-(Y/W*.5+.5))*r.height];}`;
(async()=>{
const H=await open({w:933,h:705,mobile:true,pre:META});const {ev,wait,page}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
const setup=old=>ev(old=>{const A=__A,G=A.G;window.__PGOFF=old;window.__W71OFF=old;
  G.run.seed=101;G.run.order[2]=A.ZONES.findIndex(z=>z.town==='Hearthholm');G.stage=2;G.clock=700;A.resetMaps();A.placeAt('t2',14,26,'l');A.render();
  const m=A.WS.m,b=m.bld.find(b=>b.k==='workshop'),a=A.W71.drawAudit(m);
  return {town:A.ZS(2).town,theme:m.theme,night:A.G.clock>=585&&A.G.clock<810,door:b.door,row:m.t[26].join(''),t13:m.t[26][13],hidden:a.hidden.filter(q=>q.y>=24),apron:a.apron.filter(q=>q.b==='workshop')};},old);
const walk=async()=>{await page.keyboard.down('ArrowLeft');await wait(900);await page.keyboard.up('ArrowLeft');await wait(250);return ev(()=>({x:__A.WS.x,y:__A.WS.y}));};
// ---- old ----
let s=await setup(true);console.log('old:',JSON.stringify(s));
chk('the scene: Hearthholm, snow, night, Alchemy door at 12,25',s.town==='Hearthholm'&&s.theme==='snow'&&s.night&&s.door+''==='12,25'||JSON.stringify(s));
chk('old build: a bush on the street right of the Alchemy step (13,26), hidden behind the town wall in HD-2D',s.t13==='t'&&s.hidden.some(q=>q.x===13&&q.y===26&&/HD-2D/.test(q.why))&&s.apron.some(q=>q.x===13&&q.side==='right')||JSON.stringify(s));
let p=await walk();chk('old build: the hero cannot walk left from the shop corner (bug reproduced)',p.x===14&&p.y===26||JSON.stringify(p));
// ---- now ----
s=await setup(false);console.log('now:',JSON.stringify(s));
chk('now: the Alchemy apron is clear and nothing on the street is hidden',s.t13!=='t'&&!s.hidden.length&&!s.apron.length||JSON.stringify(s));
p=await walk();chk('now: walking left from the shop corner reaches the door step (12,26)',p.x<=12&&p.y===26||JSON.stringify(p));
const ap=await ev(()=>{const A=__A,m=A.WS.m,b=m.bld.find(b=>b.k==='workshop'),[dx,dy]=b.door;return [[dx-1,dy+1],[dx+1,dy+1],[dx,dy+2]].map(([x,y])=>[x,y,A.solidAt(m,x,y),A.tileAt(m,x,y)]);});
chk('now: the step can be reached from the left, the right and below (below is the town wall)',!ap[0][2]&&!ap[1][2]&&ap[2][3]==='Z'||JSON.stringify(ap));
// ---- the renderer: what pgHides predicts is what a real HD-2D frame shows ----
const live=await ev(()=>!!__A.HD.live);chk('HD-2D live',live);
// decode both screenshots in the page and count the pixels that changed
const diff=(a,b)=>ev(async([a,b])=>{const load=u=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+u;});const [A,B]=[await load(a),await load(b)];
  const px=i=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,i.width,i.height).data;};
  const d1=px(A),d2=px(B);let n=0;for(let i=0;i<d1.length;i+=4)if(Math.abs(d1[i]-d2[i])+Math.abs(d1[i+1]-d2[i+1])+Math.abs(d1[i+2]-d2[i+2])>40)n++;return n;},[a.toString('base64'),b.toString('base64')]);
// the screen box over a tile, up to 16 art px above the ground
const box=(x,y)=>ev(`(()=>{const P=${PROJ};return [P(${x}*16+1,0,${y+1}*16),P(${x}*16+15,16,${y+1}*16)];})()`).then(c=>({x:Math.round(Math.min(c[0][0],c[1][0])),y:Math.round(Math.min(c[0][1],c[1][1])),width:Math.max(4,Math.round(Math.abs(c[1][0]-c[0][0]))),height:Math.max(4,Math.round(Math.abs(c[1][1]-c[0][1])))}));
const frame=async(x,y,on)=>{await ev(([x,y,on])=>{const A=__A,m=A.WS.m;A.G.clock=0;A.G.weather[2]='clear';A.META.cfg.rmotion=true;m.t[y][x]=on?'t':'.';m.tl=null;A.placeAt('t2',16,22,'d');A.hdBake(m);A.render();},[x,y,on]);
  for(let i=0;i<3;i++){await ev(()=>{__A.worldDraw2(performance.now());});await wait(120);}return page.screenshot({clip:await box(x,y)});};
const R={};for(const [x,y] of [[13,26],[17,23]]){const a=await frame(x,y,false),b=await frame(x,y,true);R[x+','+y]={px:await diff(a,b),hides:await ev(([x,y])=>__A.W71.pgHides(__A.WS.m,x,y,'t'),[x,y])};await frame(x,y,false);}
console.log('a bush put on a tile, changed pixels in a real HD-2D frame:',JSON.stringify(R));
chk('HD-2D frame: a bush on the last row before the town wall (13,26) does not show at all, as pgHides says',R['13,26'].px===0&&R['13,26'].hides===true||JSON.stringify(R));
chk('HD-2D frame: a bush on open street (17,23) shows, as pgHides says',R['17,23'].px>20&&R['17,23'].hides===false||JSON.stringify(R));
// the same rule in a dungeon: a chest on the row north of a wall (22 px) is hidden whole, one with open floor south of it shows
const D=await ev(()=>{const A=__A,m=A.getMap('d0');let a=null,b=null;
  for(let y=4;y<m.h-4;y++)for(let x=4;x<m.w-4;x++){if(m.t[y][x]!=='.'||m.t[y-1][x]!=='.'||m.t[y-2][x]!=='.')continue;
    if(!a&&m.t[y+1][x]==='#'&&m.t[y][x-1]==='.'&&m.t[y][x+1]==='.')a=[x,y];
    if(!b&&m.t[y+1][x]==='.'&&m.t[y+2][x]==='.'&&m.t[y+3][x]==='.'&&m.t[y][x-1]==='.'&&m.t[y][x+1]==='.')b=[x,y];}
  return {a,b};});
const dframe=async(p,on)=>{await ev(([p,on])=>{const A=__A,m=A.getMap('d0');m.t[p[1]][p[0]]=on?'C':'.';m.tl=null;A.placeAt('d0',p[0],p[1]-2,'d');A.hdBake(m);A.render();},[p,on]);
  for(let i=0;i<3;i++){await ev(()=>{__A.worldDraw2(performance.now());});await wait(120);}return page.screenshot({clip:await box(p[0],p[1])});};
const DR={};for(const k of ['a','b']){const p=D[k];const a=await dframe(p,false),b=await dframe(p,true);DR[k]={at:p,px:await diff(a,b),hides:await ev(p=>__A.W71.pgHides(__A.getMap('d0'),p[0],p[1],'C'),p)};await dframe(p,false);}
console.log('a chest put on a dungeon tile, changed pixels:',JSON.stringify(DR));
chk('HD-2D dungeon: a chest just north of a wall does not show, as pgHides says',DR.a.px===0&&DR.a.hides===true||JSON.stringify(DR));
chk('HD-2D dungeon: a chest with open floor south of it shows, as pgHides says',DR.b.px>20&&DR.b.hides===false||JSON.stringify(DR));
await ev(()=>{window.__PGOFF=false;window.__W71OFF=false;});
await done(H);})();
