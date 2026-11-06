// ===== art.js (base): pixel engine (PG grids, palettes, paint), hero and monster sprites, flair, front and back views =====
// =================== PIXEL ENGINE ===================
const OUTC='#150b17';
function hx(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function rh(a){return '#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
function shade(h,f){return rh(hx(h).map(v=>v*f));}
function tint(h,f){return rh(hx(h).map(v=>v+(255-v)*f));}
function mix(a,b,t){const A=hx(a),B=hx(b);return rh(A.map((v,i)=>v+(B[i]-v)*t));}
function mkCv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function mulberry(a){return seeded(a);}// the art and map name for seeded() (engine.js): one mulberry32 generator
function hashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

class PG{
  constructor(w,h,ox,oy){this.w=w;this.h=h;this.ox=ox||0;this.oy=oy||0;this.a=new Array(w*h).fill(0);}
  s(x,y,k){x=Math.floor(x)+this.ox;y=Math.floor(y)+this.oy;if(x>=0&&y>=0&&x<this.w&&y<this.h)this.a[y*this.w+x]=k||0;return this;}
  g(x,y){return(x<0||y<0||x>=this.w||y>=this.h)?0:this.a[y*this.w+x];}
  rows(x0,y0,R){R.forEach((r,j)=>{for(let i=0;i<r.length;i++){const c=r[i];if(c==='.'||c===' ')continue;this.s(x0+i,y0+j,c==='_'?0:c);}});return this;}
  rect(x,y,w,h,k){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.s(x+i,y+j,k);return this;}
  ell(cx,cy,rx,ry,k){for(let y=Math.floor(cy-ry-1);y<=Math.ceil(cy+ry+1);y++)for(let x=Math.floor(cx-rx-1);x<=Math.ceil(cx+rx+1);x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1)this.s(x,y,k);}return this;}
  poly(P,k){let y0=1e9,y1=-1e9;P.forEach(p=>{y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);});
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const yc=y+.5,xs=[];
      for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if((a[1]<=yc&&b[1]>yc)||(b[1]<=yc&&a[1]>yc))xs.push(a[0]+(yc-a[1])/(b[1]-a[1])*(b[0]-a[0]));}
      xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2)for(let x=Math.round(xs[i]);x<Math.round(xs[i+1]);x++)this.s(x,y,k);}
    return this;}
  line(x0,y0,x1,y1,k,t){t=t||1;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1)*2;
    for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;if(t<=1)this.s(Math.round(x),Math.round(y),k);else this.ell(Math.round(x)+.5,Math.round(y)+.5,t/2+.15,t/2+.15,k);}return this;}
  path(P,k,t){for(let i=0;i+1<P.length;i++)this.line(P[i][0],P[i][1],P[i+1][0],P[i+1][1],k,t);return this;}
  px(L,k){L.forEach(p=>this.s(p[0],p[1],k));return this;}
}
const RAMP={};
function rampFor(c){if(RAMP[c])return RAMP[c];return RAMP[c]=[mix(tint(c,.3),'#fff1c4',.22),c,mix(shade(c,.74),'#2c1458',.18),mix(shade(c,.55),'#1a0c3a',.25)].map(hx);}
// Turn a key grid into a shaded, outlined canvas.
function paint(g,pal,opt){
  opt=opt||{};const W=g.w,H=g.h,cv=mkCv(W,H),ctx=cv.getContext('2d'),id=ctx.createImageData(W,H),d=id.data;
  const flat=opt.flat||'',noAO=opt.noAO||'';
  const put=(x,y,c,a)=>{const i=(y*W+x)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=a===undefined?255:a;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const k=g.g(x,y);if(!k||!pal[k])continue;const R=rampFor(pal[k]);
    if(flat.includes(k)){put(x,y,R[1]);continue;}
    const up=g.g(x,y-1),dn=g.g(x,y+1),rt=g.g(x+1,y),lf=g.g(x-1,y);
    let i=1;
    if(dn===0)i=(rt===0?3:2);
    else if(dn!==k)i=2;
    else if(up===0||(lf===0&&up===k&&g.g(x-1,y-1)===0))i=0;
    else if(rt===0)i=2;
    else if(up!==k&&!noAO.includes(k)&&!flat.includes(up))i=2;
    put(x,y,R[i]);
  }
  const oc=opt.rim?hx(opt.rim):null,OUT=hx(OUTC);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(g.g(x,y))continue;
    const n=[g.g(x,y-1),g.g(x,y+1),g.g(x-1,y),g.g(x+1,y)].filter(Boolean);
    if(!n.length)continue;
    if(oc){put(x,y,oc);continue;}
    const base=pal[n[0]]||'#000000',c=rampFor(base)[3];
    put(x,y,c.map((v,i)=>v*.45+OUT[i]*.55));
  }
  if(opt.glow){const gc=hx(opt.glow);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i+3])continue;
      if([[0,-1],[0,1],[-1,0],[1,0],[1,1],[-1,-1],[1,-1],[-1,1]].some(([a,b])=>{const xx=x+a,yy=y+b;return xx>=0&&yy>=0&&xx<W&&yy<H&&d[(yy*W+xx)*4+3]===255;}))put(x,y,gc,110);}
  }
  ctx.putImageData(id,0,0);return cv;
}
const URL_CACHE={};
function cvURL(key,fn){if(URL_CACHE[key])return URL_CACHE[key];const c=fn();return URL_CACHE[key]=c.toDataURL();}

// =================== HEROES ===================
// Characters are drawn facing right on a 32x32 grid (plus a 1px border for the outline).
const HP={
 head:["..SSSSSS..",".SSSSSSSS.","SSSSSSSSSS","SSSSSSSSSS","SSSSSESSES","SSSSSESSES","SSSSSSSSSS",".SSSSSSmS.","..SSSSSS.."],
 body:{
  light:{
   backArm:[10,13,[".PP","PPP","PPP","PP.","PP.","SS."]],
   legs:[12,21,[".KKK.KKK.",".KKK.KKK.",".KKK.KKK.",".KKK.KKK.",".BBB.BBB.",".BBB.BBB.",".BBB.BBB.",".BBBB.BBBB",".bbbb.bbbb"]],
   walk:[11,21,["..KKKKKKK.",".KKK..KKK.",".KKK...KKK","KKK....KKK","BBB.....BBB","BBB.....BBB","BBB.....BBB","BBBB....BBBB","bbbb....bbbb"]],
   torso:[11,12,["...QSSQ...",".PPPPPPPP.",".PPPPPPPP.",".PPPPPQPP.",".PPPPPQPP.",".LLLLLGLL.",".PPPPPPPP.","PPPPPPPPPP","QQQQQQQQQQ"]],
   arm:[15,13,["PPP....","PPP....",".PPP...",".PPPP..","..PPPSS",".....SS"]],
   armX:[15,13,["PPP......","PPPPPPP..",".PPPPPPSS","........."]],
   hand:'S'},
  robe:{
   backArm:[9,13,[".PP","PPP","PPPP","PPPP","PPPP",".SS."]],
   legs:[12,28,["BBB..BBBB","bbb..bbbbb"]],
   walk:[11,28,["BBB....BBBB","bbb....bbbbb"]],
   torso:[10,12,["....QSSQ.....","..PPPPPPPP...","..PPPPPQPP...","..PPPPPQPP...","..PPPPPQPP...","..LLLLLGLL...","..PPPPPQPP...","..PPPPPQPP...",".PPPPPPQPPP..",".PPPPPPQPPP..",".PPPPPPQPPP..",".PPPPPPPQPPP.","PPPPPPPPQPPP.","PPPPPPPPQPPPP","PPPPPPPPQPPPP","QQQQQQQQQQQQQ"]],
   arm:[15,13,["PPP....","PPPP...",".PPPP..",".PPPPP.","..QPPSS",".....SS"]],
   armX:[15,13,["PPP......","PPPPPPP..",".PPPPPQSS","........."]],
   hand:'S'},
  heavy:{
   backArm:[10,13,["MMM","MMM","NMM",".MM",".MM",".NN"]],
   legs:[12,21,[".KKK.KKK.",".KKK.KKK.",".MMM.MMM.",".MMM.MMM.",".MMM.MMM.",".MMM.MMM.",".MMM.MMM.",".MMMM.MMMM",".NNNN.NNNN"]],
   walk:[11,21,["..KKKKKKK.",".KKK..KKK.",".MMM...MMM","MMM....MMM","MMM.....MMM","MMM.....MMM","MMM.....MMM","MMMM....MMMM","NNNN....NNNN"]],
   torso:[11,12,["...NSSN...",".MMMMMMMM.","MMMMMMMMMM",".MMPPPPMM.",".MMPQQPMM.",".LLLLLGLL.",".PPPPPPPP.",".PMMPPMMP.","PMMMPPMMMP"]],
   arm:[14,12,[".MMMM...","MMMMMM..","MMMMMM..",".NMMN...","..MMMM..","...MMMNN","......NN"]],
   armX:[14,12,[".MMMM....","MMMMMM...","MMMMMMMM.",".NMMMMMNN","........."]],
   hand:'N'},
  monk:{
   backArm:[10,13,[".PP","SSS","SSS","SS.","ww.","SS."]],
   legs:[12,21,["PPPP.PPPP","PPPP.PPPP",".PPP..PPP",".PPP..PPP",".PPP..PPP",".www..www",".www..www",".SSSS.SSSS",".eeee.eeee"]],
   walk:[11,21,["..PPPPPPPP",".PPPP..PPP",".PPP...PPP","PPP....PPP","PPP.....PPP","www.....www","www.....www","SSSS....SSSS","eeee....eeee"]],
   torso:[11,12,["...SSSS...",".PPSSSPPP.",".PPPSSPPP.",".PPPPSPPP.",".PPPPPPPP.",".QQQQQQQQ.",".PPPPPPQQ.","PPPPPPPPQ.","PPPPPPPPPP"]],
   arm:[15,13,["PPP....","SSS....",".SSS...",".SSSS..","..wwwSS",".....SS"]],
   armX:[15,13,["PPP......","SSSSSSS..",".SSSSwwSS","........."]],
   hand:'S'}
 },
 hair:{
  short:{ear:1,p:[[10,1,["...HHHHHH...","..HHHHHHHHH.",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHH.HH.H.HH",".HH.........",".HH........."]]]},
  spiky:{ear:1,p:[[9,0,["...H...H..H...","..HHH.HHHHHH..",".HHHHHHHHHHHH.","HHHHHHHHHHHHHH",".HHHHHHHHHHHHH","HHHHHHHHHHHHH.","..HHH.HHH.H.HH",".HHH..........","..HH.........."]]]},
  wild:{ear:0,p:[[8,0,["....H..H..H....","...HHH.HHHHHH..","..HHHHHHHHHHHH.",".HHHHHHHHHHHHHH","HHHHHHHHHHHHHH.",".HHHHHHHHHHHHH.","HHHHHH.HHH.H.HH",".HHHH..........","HHHHH..........",".HHHH..........","..HHH.........."]]]},
  long:{ear:0,p:[[10,1,["...HHHHHH...","..HHHHHHHHH.",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHHH.HH.HHH",".HHH.......H",".HHH.......H",".HHH.......H",".HHH........",".HHHH.......",".HHHH.......","..HHH.......","..HH........"]]]},
  ponytail:{ear:1,p:[[10,1,["...HHHHHH...","..HHHHHHHHH.",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHH.HH.H.HH",".HH.........",".HH........."]],[6,3,["....HH","...HHH","..HHH.",".HHH..",".HHH..","HHH...","HH....","H....."]]],tie:[[10,4],[10,5]]},
  bun:{ear:1,p:[[10,1,["...HHHHHH...","..HHHHHHHHH.",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHH.HH.H.HH",".HH.........",".HH........."]]],bun:[12,0]},
  mohawk:{ear:1,p:[[12,-1,["..HHH...",".HHHHH..","HHHHHHH.",".HHHHHHH","..HHHHH."]]]},
  braid:{ear:1,p:[[10,1,["...HHHHHH...","..HHHHHHHHH.",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHH.HH.H.HH",".HH.........",".HH........."]],[10,9,["HH.",".HH","HH.",".HH","HH.",".HH","HH."]]],tie:[[10,16],[11,16]]},
  curly:{ear:0,curly:1},
  bob:{ear:0,p:[[10,1,["...HHHHHH...","..HHHHHHHHH.",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHHHHHHHHHH",".HHH.......H",".HHH.......H",".HHHH.....HH",".HHHH......."]]]},
  swept:{ear:1,p:[[10,1,["....HHHHH....","..HHHHHHHHH..",".HHHHHHHHHHH.",".HHHHHHHHHHHH",".HHHHHHHHHHHH",".HHH....HHHH.",".HH.......HH.",".HH.........."]]]},
  bald:{ear:1,p:[]}
 },
 hat:{
  helm:[[10,1,["...MMMMMM...","..MMMMMMMMM.",".MMMMMMMMMMM",".MMMMMMMMMMM",".NNNNNNNNNNN",".MMM.....M..",".MMM.....M..",".MMM........"]]],
  greathelm:[[10,1,["...MMMMMM....","..MMMMMMMMM..",".MMMMMMMMMMM.",".MMMMMMMMMMMM",".MMMMMMMMMMMM",".NNNNNNNNNNNN",".MMMMMKKKKKKM",".MMMMMMMMMMMM",".MMMMMMMNMNMM",".MMMMMMMMMMM.","..MMMMMMMMM.."]]],
  wizard:[[8,-1,[".JJ............","..JJJ..........","...JJJJJ.......","....JJJJJJJ....","...QQQQQQQQQ...","JJJJJJJJJJJJJJJ"]]],
  hood:[[9,1,[".....JJJJJ....","...JJJJJJJJJ..","..JJJJJJJJJJJ.",".JJJJJJJJJJJJJ",".JJJJJJJJJJJJ.","JJJJJ.......J.","JJJJ........J.","JJJJ........J.","JJJJ........J.","JJJJJ.....JJ..","JJJJJJJJJJJJ..",".JJJJJJJJJJJ.."]]],
  bandana:[[10,3,["..JJJJJJJ.",".JJJJJJJJJJ",".JJJJJJJJJJ"]],[7,5,["..J","JJ.",".JJ","J.."]]],
  circlet:[[11,5,["GGGGGGGCGG"]],[18,4,["C"]]],
  feathercap:[[10,1,["....JJJJJ...","..JJJJJJJJJ.",".JJJJJJJJJJJ",".JJJJJJJJJJJJJ"]]],
  crown:[[12,0,["G..G..G.","GG.GG.GG","GGGGGGGG","GGCGGCGG"]]],
  headband:[[11,5,["JJJJJJJJJJ"]],[8,5,["JJJ","J.J","J.."]]],
  mitre:[[13,-1,["..ww..",".wwww.",".wGGw.","wwGGww","wwwwww","GGGGGG"]]],
  beret:[[10,1,[".......J.....","...JJJJJJJ...",".JJJJJJJJJJJJ","..JJJJJJJJJJ."]]],
  goggles:[[11,5,["KKKKKKKKKK"]],[15,4,["MMMM.MMMM","MCCM.MCCM",".MM...MM."]]],
  widebrim:[[7,0,[".....JJJJJJJJ....",".....JJJJJJJJ....","....JQQQQQQQQJ...","JJJJJJJJJJJJJJJJJ"]]],
  plume:[[10,1,["...MMMMMM...","..MMMMMMMMM.",".MMMMMMMMMMM",".MMMMMMMMMMM",".NNNNNNNNNNN",".MMM.....M..",".MMM.....M..",".MMM........"]],[8,-1,["..RRRR....",".RRRRRRR..","RRR..RRR..","RR........"]]],
  horns:[[10,1,["...MMMMMM...","..MMMMMMMMM.",".MMMMMMMMMMM",".MMMMMMMMMMM",".NNNNNNNNNNN",".MMM.....M..",".MMM.....M..",".MMM........"]],[6,-1,["w.......","ww......",".ww.....","..www..."]],[20,-1,["......w","....ww.","..www..","ww....."]]]
 },
 face:{
  beard:[[12,9,["HH...HHHH.","HHHHHHmHHH",".HHHHHHHHH","..HHHHHHH.","....HHH..."]]],
  mustache:[[16,9,["HHHHH"]]],
  handlebar:[[14,9,["HHHHHHHH"]],[13,8,["H......H.H"]],[14,10,["H"]]],
  eyepatch:[[12,5,["KK......","..KKK...","....KKKK","......KK"]]],
  mask:[[15,9,["KKKKKK","KKKKKK","KKKKK."]]],
  scar:[[15,5,["..r",".r.","...","...","r.."]]],
  elfears:[[9,4,["S..","SS.",".SS"]]],
  warpaint:[[15,9,["C..C."]]],
  freckles:[[15,9,["e.e..e"]]],
  blush:[[15,9,["r....r"]]]
 },
 back:{
  cape:[[7,12,["....YYYY","...YYYYY","...YYYYY","..YYYYYY","..YYYYYY",".YYYYYYY",".YYYYYYY","YYYYYYYY","YYYYYYYY","YYYYYYY.","YYYYYY..",".YYYY...","..YY...."]]],
  scarf:[[5,11,[".YY......","YYYYYYYY.","..YYYYYYY","....YY..."]]],
  pack:[[7,13,["YYYYY","LLLLL","LLGLL","LLLLL","LLLLL"]]]
 }
};
const WPN={
 sword:{draw(g){g.rect(21,5,2,11,'M');g.s(21,4,'M');g.rect(19,16,5,1,'G');g.rect(21,19,2,1,'G');}},
 greatsword:{draw(g){g.rect(21,0,3,16,'M');g.line(22,2,22,14,'N');g.s(22,-1,'M');g.rect(18,16,8,1,'G');g.rect(21,19,2,1,'G');}},
 axe:{draw(g){g.line(21,6,21,24,'W');g.poly([[22,5],[27,3],[29,8],[28,13],[22,11]],'M');g.line(23,4,23,12,'N');g.poly([[21,7],[18,8],[21,10]],'N');}},
 hammer:{draw(g){g.line(21,8,21,25,'W');g.rect(17,2,9,6,'M');g.rect(17,4,9,1,'G');g.rect(16,3,1,3,'N');g.rect(26,3,1,3,'N');}},
 spear:{draw(g){g.line(21,3,21,28,'W');g.rows(20,-1,[".M.","MMM","MMM",".M.",".N."]);g.rows(22,4,["JJJ","JJ.","J.."]);}},
 dagger:{draw(g){g.rect(22,16,1,3,'G');g.rect(23,16,3,1,'M');g.rect(23,17,4,1,'M');}},
 twindagger:{draw(g){g.rect(22,16,1,3,'G');g.rect(23,16,3,1,'M');g.rect(23,17,4,1,'M');g.rect(9,19,3,1,'G');g.line(10,20,8,23,'M');g.line(11,20,9,23,'M');},back:1},
 bow:{x:1,before:1,draw(g){g.path([[20,4],[22,7],[23,11],[24,15],[23,20],[22,24],[20,27]],'W');g.s(20,3,'G');g.s(20,28,'G');g.line(20,4,20,27,'w');g.line(14,15,24,15,'W');g.s(25,15,'M');g.px([[13,14],[13,16]],'R');}},
 staff_orb:{draw(g){g.line(21,5,21,29,'W');g.ell(21.5,2.5,2.6,2.6,'C');g.px([[19,5],[23,5],[19,4],[23,4]],'G');}},
 staff_crook:{draw(g){g.line(21,4,21,29,'W');g.path([[21,4],[21,1],[22,0],[24,0],[25,1],[25,3],[24,4]],'W');g.s(23,2,'C');}},
 staff_crystal:{draw(g){g.line(21,6,21,29,'W');g.poly([[21.5,-1.5],[24,3],[21.5,7.5],[19,3]],'C');g.px([[19,6],[24,6],[20,7],[23,7]],'G');}},
 staff_sun:{draw(g){g.line(21,7,21,29,'G');g.ell(21.5,3,3.2,3.2,'G');g.ell(21.5,3,1.7,1.7,'C');g.px([[21,-1],[17,3],[25,3],[18,0],[24,0]],'G');}},
 rod:{draw(g){g.line(21,11,21,21,'G');g.ell(21.5,9.5,1.9,1.9,'C');g.rect(20,11,3,1,'G');}},
 tome:{draw(g){g.rect(19,14,6,5,'J');g.rect(20,15,4,3,'w');g.line(22,15,22,17,'L');}},
 lute:{draw(g){g.line(19,17,25,10,'W');g.rect(25,9,2,2,'L');g.ell(16.5,19,4.2,3.2,'L');g.s(16,19,'K');g.s(17,19,'K');},under:1},
 harp:{draw(g){g.path([[22,8],[26,8],[27,11],[26,18],[22,21],[22,8]],'G');g.line(23,9,23,19,'w');g.line(25,9,25,17,'w');}},
 fists:{hand:'w',draw(g){g.rect(20,16,3,3,'w');g.px([[22,16],[22,18]],'G');}},
 claws:{draw(g){g.line(22,16,26,13,'M');g.line(22,17,27,17,'M');g.line(22,18,26,21,'M');}},
 longbow:{x:1,before:1,draw(g){g.path([[20,1],[22,4],[23,8],[24,12],[24,16],[24,19],[23,23],[22,27],[20,30]],'W');g.s(20,0,'G');g.s(20,31,'G');g.line(20,1,20,30,'w');g.line(14,15,24,15,'W');g.s(25,15,'M');g.px([[13,14],[13,16]],'Q');}},
 grimoire:{draw(g){g.rect(23,4,8,6,'J');g.rect(24,5,6,4,'w');g.line(27,5,27,8,'J');g.px([[23,4],[30,4],[23,9],[30,9]],'G');g.px([[25,6],[28,7],[25,8]],'C');g.px([[22,11],[31,2],[26,12]],'G');}},
 none:{draw(){}}
};
const SHIELD={
 kite:[[6,13,["MMMMMMM","MZZZZZM","MZZGZZM","MZGGGZM","MZZGZZM","MZZZZZM",".MZZZM.",".MZZZM.","..MZM..","...M..."]]],
 round:[[5,14,[".MMMMM.","MZZZZZM","MZZZZZM","MZZGZZM","MZZZZZM","MZZZZZM",".MMMMM."]]]
};
const SKINS=['#f6d1b0','#efc29a','#d9a074','#b07850','#7e4e30','#5a3620'];
function heroPal(L,els){
  const p=Object.assign({H:'#4a2c1a',P:'#6a6a8a',Q:'#d8c8a0',J:'#4a3a5a',M:'#c8ccd6',N:'#6c7488',L:'#7a4f2a',K:'#3a3348',B:'#5a3a22',b:'#2c1a12',G:'#f0b848',W:'#8b5a2b',w:'#efe8d8',E:'#1a1020',m:'#8a3a3a',r:'#c8453c',R:'#c8453c'},L.pal||{});
  p.S=SKINS[L.sk||0];p.e=shade(p.S,.82);p.C=p.C||ELC[els[0]];if(!p.Y)p.Y=p.J;if(!p.Z)p.Z=p.Q;
  return p;
}
function heroGrid(L,walk){
  const g=new PG(34,34,1,1),B=HP.body[L.b],W=WPN[L.wpn||'none'],hair=HP.hair[L.hair||'short'];
  const R=(p)=>g.rows(p[0],p[1],p[2]);
  (L.back||[]).forEach(k=>HP.back[k].forEach(R));
  if(W.back)W.draw(g); // second dagger in the back hand
  R(B.backArm);
  if(L.sh)SHIELD[L.sh].forEach(R);
  R(walk?B.walk:B.legs);
  R(B.torso);
  if(W.under)W.draw(g);
  g.rows(11,3,HP.head);
  hair.p&&hair.p.forEach(R);
  if(hair.curly){g.ell(15.5,4,6.8,4.4,'H');g.ell(12,8,2.8,3.4,'H');g.ell(20,6,2,2,'H');g.rect(17,7,4,0,'H');g.px([[13,3],[16,2],[19,4],[12,7]],'h');}
  if(hair.bun)g.ell(hair.bun[0]+.5,hair.bun[1]+1.5,2.6,2.1,'H');
  if(hair.tie)g.px(hair.tie,'Q');
  if(hair.ear&&!(L.hat==='hood'||L.hat==='greathelm'))g.px([[12,7],[12,8],[13,8]],'e');
  (L.face||[]).forEach(f=>HP.face[f].forEach(R));
  if(L.hat)HP.hat[L.hat].forEach(R);
  if(L.hat==='greathelm')g.px([[16,7],[19,7]],'C');
  if(W.before&&!W.back)W.draw(g);
  R(W.x?B.armX:B.arm);
  if(!W.before&&!W.back&&!W.under)W.draw(g);
  if(W.under&&!W.before){/* instrument held under arm */}
  const hk=W.hand||B.hand;
  if(W.x)g.rect(22,15,2,2,hk);else if(L.wpn!=='lute'&&L.wpn!=='tome'&&L.wpn!=='harp'&&L.wpn!=='grimoire')g.rect(20,17,2,2,hk);
  if(L.wpn==='twindagger')g.rect(20,17,2,2,hk);
  return g;
}

// =================== MONSTERS ===================
// Every foe is drawn facing right. Normal foes on a 40x40 grid, guardians on 60x60.
const MART={
 mossling(g){
  g.ell(20,29,13,8.5,'B');g.ell(19,23,11.5,5,'b');
  g.rect(9,24,2,4,'b');g.rect(15,26,2,3,'b');g.rect(24,25,2,3,'b');g.rect(29,24,2,2,'b');
  g.ell(14,21,3.5,2,'A');g.ell(24,21,2.5,1.5,'A');
  g.line(22,19,22,14,'S');g.px([[21,12],[23,12],[22,11],[22,13],[21,13],[23,13]],'F');g.s(22,12,'Y');
  g.rect(24,27,3,4,'W');g.rect(29,27,3,4,'W');g.rect(25,28,2,3,'K');g.rect(30,28,2,3,'K');
  g.line(25,34,30,34,'K');g.px([[12,31],[16,34],[10,33],[19,35]],'D');
  return {pal:{B:'#a07c4c',b:'#5aa04a',A:'#9ad874',S:'#3f7f32',F:'#f08ab0',Y:'#ffe08a',W:'#f4efe0',K:'#1a1020',D:'#7a5c34'}};
 },
 gustimp(g){
  g.poly([[18,17],[4,7],[7,13],[1,17],[9,19],[4,24],[16,23]],'b');
  g.poly([[22,15],[33,5],[31,11],[37,11],[29,17]],'b');
  g.path([[17,26],[12,30],[10,34],[13,35]],'B',2);g.poly([[12,33],[16,33],[14,37]],'B');
  g.ell(20,22,6,7,'B');g.ell(21,25,3.5,3,'A');
  g.rect(17,28,3,5,'B');g.rect(22,28,3,5,'B');
  g.ell(24,13,6.5,5.5,'B');
  g.poly([[19,11],[12,3],[22,9]],'B');g.poly([[25,9],[29,1],[30,10]],'B');
  g.poly([[25,19],[32,23],[31,25],[24,22]],'B');g.px([[32,25],[33,23]],'W');
  g.rect(26,11,3,3,'E');g.s(28,12,'K');g.line(24,17,30,16,'K');g.px([[25,17],[28,17]],'W');
  g.path([[3,31],[7,29],[10,31],[8,33]],'C');g.path([[30,32],[34,30],[37,32]],'C');g.path([[2,4],[6,3],[8,5]],'C');
  return {pal:{B:'#5fc9a0',b:'#2f7a74',A:'#c8f4dc',E:'#fff06a',K:'#1a1020',W:'#ffffff',C:'#e4fff6'},flat:'EKWC'};
 },
 dewtoad(g){
  g.ell(11,32,6.5,5,'b');g.rect(5,35,10,2,'b');
  g.ell(19,28,13,8,'B');g.ell(22,31,9,5,'A');
  g.ell(27,22,8,6.5,'B');g.ell(27,16,3.5,3.5,'B');g.ell(20,18,2.5,2.5,'B');
  g.rect(27,14,3,3,'W');g.rect(28,15,2,2,'K');
  g.line(28,27,36,25,'K');g.ell(32,29,3,2,'A');
  g.line(28,30,31,37,'b',2);g.px([[32,37],[30,37],[33,36]],'b');
  g.ell(12,24,2,1.5,'D');g.ell(18,21,1.8,1.4,'D');g.ell(22,25,1.5,1.2,'D');
  return {pal:{B:'#3aa0b0',b:'#28707e',A:'#c8ecd8',W:'#f4efe0',K:'#1a1020',D:'#1f5a72'},flat:'WK'};
 },
 cinderpup(g){
  g.poly([[11,24],[3,14],[6,21],[1,20],[5,27],[11,28]],'C');g.poly([[10,25],[5,18],[7,24],[5,26],[10,27]],'R');
  g.rect(12,29,3,8,'b');g.rect(22,29,3,8,'b');
  g.ell(18,26,9,5,'B');g.ell(25,27,3,4,'A');
  g.rect(16,30,3,7,'B');g.rect(25,30,3,7,'B');g.rect(15,36,4,1,'D');g.rect(24,36,4,1,'D');
  g.ell(27,19,5.5,5,'B');g.poly([[30,18],[37,21],[30,24]],'B');g.ell(33,22,2.5,1.5,'A');g.s(37,21,'K');
  g.poly([[23,16],[24,7],[28,14]],'B');g.poly([[24,14],[25,10],[27,14]],'R');
  g.rect(29,18,2,2,'E');g.s(30,18,'K');
  g.px([[4,10],[8,8],[2,6],[34,12]],'C');
  return {pal:{B:'#e8743a',b:'#b04a22',A:'#fbe0b8',C:'#ffd23a',R:'#ff5a2a',E:'#fff6c8',K:'#1a1020',D:'#6a2a14'},flat:'EKCR'};
 },
 crawler(g){
  [[10,31,5,37],[14,33,11,37],[22,33,25,37],[27,31,31,37]].forEach(l=>g.path([[l[0],l[1]],[(l[0]+l[2])/2,l[1]-2],[l[2],l[3]]],'b',2));
  g.ell(9,24,3.5,2.5,'B');
  g.ell(18,27,12,7,'B');g.ell(18,30,9,3,'A');
  g.line(23,21,23,15,'b',2);g.line(27,21,28,15,'b',2);
  g.rect(22,13,3,3,'W');g.rect(27,13,3,3,'W');g.s(24,14,'K');g.s(29,14,'K');
  g.line(29,26,32,21,'B',3);
  g.ell(34,16,4.5,3.5,'B');g.ell(35,22,3.5,2.2,'B');g.rect(33,19,6,1,0);
  g.px([[13,24],[17,23],[21,24]],'A');
  return {pal:{B:'#2f7fb0',b:'#1f5480',A:'#a8e0f0',W:'#f4efe0',K:'#1a1020'},flat:'WK'};
 },
 gull(g){
  g.poly([[18,21],[22,8],[27,12],[25,21]],'X');
  g.poly([[11,21],[3,17],[4,25],[12,24]],'b');
  g.ell(20,22,9.5,5,'B');g.ell(22,24,7,3,'A');
  g.ell(29,18,4.5,4,'B');g.poly([[32,17],[39,19],[32,20]],'G');g.s(30,17,'K');
  g.poly([[13,20],[8,4],[14,8],[19,3],[21,12],[26,20]],'b');
  g.px([[11,8],[15,6],[17,10],[22,9]],'C');
  g.px([[19,27],[21,27],[20,28],[22,28]],'K');
  return {pal:{B:'#e8eef4',b:'#9ec0dc',X:'#6a8aac',A:'#ffffff',G:'#ffc24d',K:'#1a1020',C:'#fff6b0'},flat:'KC'};
 },
 tidewisp(g){
  [[12,17,11,30],[16,17,17,35],[21,17,20,36],[25,17,27,32],[29,16,31,28]].forEach(l=>g.path([[l[0],l[1]],[l[0]-1,(l[1]+l[3])/2],[l[2],l[3]]],'b'));
  g.ell(20,13,11,9,'B');g.rect(8,16,24,7,0);
  g.ell(20,11,6.5,4,'A');g.rect(9,16,23,1,'b');g.px([[10,17],[14,17],[18,17],[22,17],[26,17],[30,17]],'b');
  g.rect(22,12,2,2,'K');g.rect(27,12,2,2,'K');
  g.px([[11,25],[16,29],[21,31],[26,27],[30,24],[12,30],[19,35]],'C');
  return {pal:{B:'#7ab8f0',A:'#d8eeff',b:'#4a7ac8',K:'#1a1040',C:'#f2e04a'},flat:'KC',glow:'#b8e0ff'};
 },
 shellguard(g){
  g.ell(18,22,13,10,'B');g.rect(4,27,28,6,0);g.rect(5,26,26,2,'A');
  g.rect(9,28,5,8,'X');g.rect(24,28,5,8,'X');g.rect(8,35,7,2,'X');g.rect(23,35,7,2,'X');
  g.rect(28,22,5,5,'X');g.ell(34,23,5,4,'X');g.s(36,22,'K');g.line(36,25,39,24,'K');
  [[12,18],[19,15],[25,19],[16,23],[23,24]].forEach(p=>g.ell(p[0],p[1],3,2.4,'b'));
  [[11,12],[18,10],[25,13]].forEach(p=>g.poly([[p[0]-2,p[1]+1],[p[0],p[1]-4],[p[0]+2,p[1]+1]],'W'));
  return {pal:{B:'#7a6a3a',b:'#a08c52',A:'#d8c890',X:'#4a9a8a',W:'#e8e0c8',K:'#1a1020'},flat:'K'};
 },
 magmaslime(g){
  g.ell(20,28,13.5,9.5,'B');g.ell(20,20,8,3,'C');g.ell(20,20,5,1.6,'A');
  g.path([[10,26],[14,29],[12,33]],'C');g.path([[28,24],[31,29]],'C');g.path([[18,30],[22,33],[20,36]],'C');
  g.rect(8,33,2,4,'C');g.rect(30,33,2,3,'C');
  g.ell(11,23,2.5,2,'b');g.ell(29,30,2,1.6,'b');
  g.rect(23,25,3,3,'E');g.rect(29,25,3,3,'E');g.s(25,26,'K');g.s(31,26,'K');g.line(25,31,30,31,'C');
  g.px([[16,15],[23,14],[19,13]],'A');
  return {pal:{B:'#3a2a26',b:'#5a4234',C:'#ff7a2a',A:'#ffe08a',E:'#ffe08a',K:'#1a1020'},flat:'CAEK'};
 },
 cavebat(g){
  g.poly([[17,18],[2,9],[5,16],[0,21],[8,22],[5,28],[16,24]],'b');
  g.path([[17,18],[4,11]],'B');g.path([[16,22],[3,21]],'B');
  g.poly([[23,18],[37,8],[35,15],[40,19],[32,21],[35,27],[24,24]],'b');
  g.ell(20,21,5.5,6.5,'B');g.ell(24,14,4.5,4.5,'B');
  g.poly([[21,12],[20,3],[25,10]],'B');g.poly([[25,11],[28,4],[29,12]],'B');g.px([[21,8],[21,9],[27,8],[27,9]],'R');
  g.rect(25,13,2,2,'E');g.px([[26,18],[28,18]],'W');g.line(25,17,29,17,'K');
  g.px([[18,28],[22,28]],'K');
  return {pal:{B:'#5a4a6a',b:'#2e2440',R:'#c86a8a',E:'#ff5050',W:'#ffffff',K:'#140a1a'},flat:'EWKR'};
 },
 ashwraith(g){
  g.poly([[20,5],[28,9],[30,19],[33,34],[28,30],[24,37],[19,31],[13,36],[12,25],[14,11]],'B');
  g.poly([[14,20],[12,30],[17,26]],'b');g.poly([[24,22],[27,32],[22,28]],'b');
  g.ell(23,12,5,5,'K');g.rect(22,11,2,2,'E');g.rect(26,11,2,2,'E');
  g.line(26,18,34,23,'b',2);g.px([[35,22],[35,24],[34,25]],'W');
  g.px([[30,34],[24,36],[13,35],[33,30]],'C');g.px([[7,12],[9,7],[33,6],[36,14]],'C');
  return {pal:{B:'#544046',b:'#3a2c32',K:'#120a10',E:'#ff8a3a',C:'#ff8a3a',W:'#e8d8d0'},flat:'KEC'};
 },
 slaggolem(g){
  g.rect(6,16,5,11,'b');g.ell(8.5,28,3.5,2.5,'b');
  g.rect(12,28,6,9,'B');g.rect(22,28,6,9,'B');
  g.poly([[10,14],[29,12],[32,20],[29,29],[11,29]],'B');
  g.rect(17,5,9,8,'B');g.rect(22,8,2,2,'E');g.rect(25,8,1,2,'E');
  g.rect(28,15,5,12,'B');g.ell(31,29,4.5,3.5,'b');
  g.path([[13,17],[18,20],[16,25]],'C');g.path([[24,15],[22,21],[27,24]],'C');g.line(14,32,16,36,'C');
  g.ell(20,20,2,2,'A');
  return {pal:{B:'#5e4c44',b:'#463830',C:'#ff7a2a',A:'#ffe08a',E:'#ffb040'},flat:'CAE'};
 },
 frostwolf(g){
  g.poly([[9,22],[1,17],[3,24],[9,26]],'B');
  g.rect(10,27,3,10,'b');g.rect(21,27,3,10,'b');
  g.ell(17,24,10.5,5,'B');g.ell(19,27,6,2,'A');
  g.rect(14,27,3,10,'B');g.rect(25,27,3,10,'B');
  g.ell(28,19,5.5,4.5,'B');g.poly([[31,18],[39,21],[31,23]],'B');g.s(38,21,'K');
  g.poly([[25,16],[25,9],[29,15]],'B');
  [[9,20,11,14,14,20],[13,19,16,13,18,19],[18,19,20,14,23,20],[22,19,25,15,26,18]].forEach(t=>g.poly([[t[0],t[1]],[t[2],t[3]],[t[4],t[5]]],'C'));
  g.rect(30,18,2,2,'E');g.px([[34,23],[36,23]],'W');
  return {pal:{B:'#d4e2ec',b:'#9ab4c8',A:'#ffffff',C:'#8fdcf0',E:'#3ad0ff',K:'#1a1020',W:'#ffffff'},flat:'EKW'};
 },
 snowharpy(g){
  g.poly([[18,16],[2,5],[6,12],[1,17],[8,19],[3,25],[16,24]],'B');
  g.path([[16,17],[5,8]],'b');g.path([[16,21],[4,19]],'b');
  g.poly([[24,16],[35,7],[33,13],[38,16],[27,21]],'b');
  g.ell(21,28,4.5,4.5,'B');
  g.line(19,31,17,36,'G');g.line(23,31,25,36,'G');g.px([[16,37],[18,37],[24,37],[26,37]],'W');
  g.ell(21,20,4,6,'A');
  g.poly([[19,7],[27,6],[28,10],[18,19],[14,14]],'H');
  g.ell(24,11,4,4,'A');g.poly([[20,8],[27,7],[27,9],[21,10]],'H');g.rect(25,11,2,1,'K');g.s(27,13,'r');
  return {pal:{B:'#9ac0d8',b:'#6a92b0',A:'#e8d8dc',H:'#eef6ff',G:'#c8a050',W:'#ffffff',K:'#1a1020',r:'#b85a6a'},flat:'Kr'};
 },
 yeti(g){
  g.rect(12,31,6,6,'B');g.rect(21,31,6,6,'B');g.rect(11,35,7,2,'A');g.rect(20,35,7,2,'A');
  g.ell(19,23,11,11.5,'B');
  g.poly([[24,19],[34,25],[33,33],[28,33],[27,26]],'B');g.ell(31,34,3.5,2.5,'A');
  g.ell(9,26,3,6,'b');
  g.ell(26,15,5,4.5,'A');g.rect(27,13,2,2,'K');g.px([[30,18],[31,19],[30,19]],'W');g.line(27,17,30,17,'K');
  g.poly([[21,10],[19,5],[23,9]],'W');
  g.px([[12,18],[15,15],[17,22],[13,26],[22,28],[11,22]],'b');
  return {pal:{B:'#e4eef4',b:'#b8cad8',A:'#7ea8cc',K:'#1a1020',W:'#ffffff'},flat:'K'};
 },
 iceknight(g){
  g.ell(10,22,4.5,7,'b');
  g.rect(14,28,4,9,'M');g.rect(21,28,4,9,'M');g.rect(13,35,6,2,'N');g.rect(20,35,6,2,'N');
  g.rect(13,15,12,13,'M');g.rect(13,23,12,2,'N');
  g.ell(19.5,10,5,5,'M');g.rect(20,9,5,2,'K');g.px([[21,9],[23,9]],'E');
  g.poly([[16,6],[17,0],[19,5]],'C');g.poly([[19,5],[21,-1],[22,5]],'C');
  g.poly([[13,15],[10,12],[14,13]],'C');g.poly([[25,15],[28,11],[27,16]],'C');g.poly([[14,27],[12,31],[16,28]],'C');
  g.rect(25,17,4,8,'M');
  g.line(30,3,30,30,'W',3);g.s(30,2,'W');g.rect(26,24,9,2,'G');g.rect(29,26,3,4,'L');
  return {pal:{M:'#8aa8c0',N:'#5a7894',b:'#4a6a88',C:'#c8f0ff',K:'#10141f',E:'#5ad0ff',W:'#e8f8ff',G:'#c8a050',L:'#5a3a22'},flat:'KE'};
 },
 thunderhawk(g){
  g.poly([[12,22],[3,26],[5,29],[12,27]],'b');
  g.poly([[17,20],[22,8],[27,12],[26,20]],'X');
  g.ell(19,23,8.5,5,'B');g.ell(21,25,6,2.5,'A');
  g.ell(28,18,4.5,4.5,'B');g.poly([[31,17],[37,19],[31,21]],'K');
  g.poly([[25,15],[19,9],[23,11],[20,5],[27,12]],'C');
  g.rect(29,16,2,2,'E');
  g.poly([[14,21],[7,4],[13,8],[17,2],[21,10],[25,20]],'B');g.poly([[7,4],[10,8],[13,8]],'b');g.poly([[17,2],[19,7],[21,10]],'b');
  g.path([[18,28],[17,32],[15,33]],'K');g.path([[22,28],[23,32],[25,33]],'K');
  g.px([[4,14],[33,8],[36,26],[2,31]],'C');
  return {pal:{B:'#f2c93a',b:'#a8822a',X:'#c89a28',A:'#fff2b8',C:'#ffffff',K:'#2a2a3a',E:'#3ad0ff'},flat:'KE'};
 },
 stormling(g){
  g.path([[11,22],[6,27],[9,29],[3,35]],'C',2);g.path([[28,22],[33,26],[30,28],[37,34]],'C',2);
  g.ell(13,18,7.5,6,'B');g.ell(21,14,8.5,7.5,'B');g.ell(27,19,7,6,'B');g.ell(19,23,9,6,'B');
  g.ell(18,10,4,2,'A');g.ell(26,15,3,1.6,'A');
  g.rect(20,15,3,3,'E');g.rect(26,16,3,3,'E');g.path([[20,22],[22,21],[24,23],[26,21],[28,22]],'K');
  g.px([[12,31],[17,33],[23,32],[28,34],[15,36],[21,37]],'A');
  return {pal:{B:'#5a6488',A:'#9ab0d8',C:'#f2d43a',E:'#fff6b8',K:'#141826'},flat:'CEK',glow:'#f2d43a'};
 },
 gargoyle(g){
  g.poly([[15,18],[6,3],[11,7],[12,0],[20,12]],'b');g.poly([[19,16],[24,4],[26,10],[30,7],[26,18]],'b');
  g.ell(15,32,5.5,4,'B');g.px([[11,36],[13,36],[18,36]],'W');
  g.ell(19,25,8,7,'B');
  g.line(25,22,29,34,'B',3);g.px([[28,36],[30,36],[31,35]],'W');
  g.ell(26,15,5.5,4.5,'B');g.path([[23,12],[21,8],[23,5]],'b',2);g.path([[26,11],[27,7],[30,6]],'b',2);
  g.rect(27,14,2,2,'E');g.px([[29,18],[31,18],[30,17]],'W');g.line(28,17,31,17,'K');
  g.path([[15,22],[18,25],[16,29]],'C');g.path([[21,20],[23,24]],'C');
  return {pal:{B:'#7a7a8c',b:'#555566',E:'#f2c93a',W:'#ece6d8',K:'#1a1020',C:'#f2c93a'},flat:'EWKC'};
 },
 cloudray(g){
  g.path([[7,22],[3,27],[1,33]],'b');g.s(1,34,'C');
  g.poly([[5,21],[19,10],[33,17],[20,28]],'B');g.poly([[9,22],[20,25],[30,19],[20,26]],'A');
  g.ell(33,17,2.5,2,'B');g.poly([[33,15],[37,12],[36,16]],'b');g.poly([[33,19],[37,21],[35,19]],'b');
  g.rect(30,16,2,2,'K');g.px([[16,15],[22,14],[13,18]],'b');
  g.path([[2,12],[9,11],[13,12]],'C');g.path([[24,31],[31,30],[36,31]],'C');g.path([[24,6],[30,5]],'C');
  return {pal:{B:'#6ac8b8',b:'#3a8a84',A:'#d4f6ee',K:'#10241f',C:'#eafffa'},flat:'KC'};
 },
 voidspawn(g){
  [[9,32,7,37],[14,34,13,38],[24,34,26,38],[30,32,33,37]].forEach(l=>g.path([[l[0],l[1]],[l[2],l[3]]],'b',2));
  g.ell(20,26,13.5,10,'B');g.ell(13,18,5,4,'B');g.ell(25,17,5.5,4.5,'B');
  [[13,22,2],[20,19,2.5],[27,23,2.2],[30,18,1.6],[16,29,1.8],[23,28,1.4]].forEach(e=>{g.ell(e[0],e[1],e[2],e[2],'E');g.s(e[0],e[1],'K');});
  g.ell(26,31,4,1.8,'K');g.px([[24,30],[27,30],[25,32],[28,32]],'W');
  g.px([[9,26],[18,24],[33,27],[11,33],[30,14],[8,20]],'A');
  return {pal:{B:'#2c1c40',b:'#1a1028',E:'#ff6ad0',K:'#080410',W:'#f4e8ff',A:'#d8c0ff'},flat:'EKWA',rim:'#5a3a8a'};
 },
 eclipsewraith(g){
  g.poly([[20,6],[27,10],[29,22],[32,37],[8,37],[11,22],[13,10]],'B');
  g.poly([[20,6],[27,10],[29,22],[32,37],[20,37]],'L');
  g.ell(20,4,7,2.4,'G');g.ell(20,4,5,1.2,0);
  g.ell(21,12,4.5,4.5,'K');g.s(19,12,'E');g.s(23,12,'F');
  g.ell(31,23,2.5,2.5,'A');g.ell(9,23,2.5,2.5,'C');
  g.line(27,20,30,22,'L',2);g.line(13,20,10,22,'B',2);
  return {pal:{B:'#2a1f40',L:'#d8d0f0',G:'#f6e7a8',K:'#0a0614',E:'#f6e7a8',F:'#b080ff',A:'#fff6c8',C:'#9a6ae0'},flat:'KEFAC',glow:'#f6e7a8'};
 },
 stareater(g){
  g.path([[8,23],[3,16],[2,12]],'B',2);g.ell(2.5,11,2.6,2.6,'C');
  g.rect(10,28,3,9,'b');g.rect(20,28,3,9,'b');
  g.ell(17,25,11,6,'B');
  g.rect(14,29,3,8,'B');g.rect(24,29,3,8,'B');
  [[11,19,13,14,15,19],[16,18,18,12,20,18],[21,19,23,15,24,19]].forEach(t=>g.poly([[t[0],t[1]],[t[2],t[3]],[t[4],t[5]]],'D'));
  g.ell(29,21,6.5,5.5,'B');g.poly([[30,23],[39,21],[39,27],[31,27]],'R');g.px([[32,23],[34,23],[36,22],[33,26],[35,26]],'W');
  g.rect(30,18,2,2,'E');
  g.px([[12,23],[16,26],[20,23],[24,26],[9,26],[27,18]],'A');
  return {pal:{B:'#1e1838',b:'#141026',D:'#8b5fd0',R:'#ff6a3a',W:'#fff4e0',E:'#ff8a3a',A:'#ffffff',C:'#ff8a3a'},flat:'RWEAC',rim:'#4a3a7a'};
 },
 huskguard(g){
  g.ell(8,21,5,8,'b');g.ell(8,21,3,6,'D');
  g.rect(13,28,5,9,'M');g.rect(22,28,5,9,'M');g.rect(12,35,7,2,'N');g.rect(21,35,7,2,'N');
  g.poly([[10,13],[30,13],[28,28],[12,28]],'M');g.rect(12,22,16,2,'N');
  g.ell(20,19,3.5,4.5,'K');g.px([[20,19],[19,18],[21,20]],'C');
  g.rect(16,4,9,9,'M');g.rect(17,8,7,2,'K');g.px([[19,8],[22,8]],'E');
  g.line(31,1,31,37,'W');g.poly([[31,-1],[33,4],[31,5],[29,4]],'G');g.rect(28,17,4,4,'M');
  g.path([[14,15],[16,18],[15,21]],'K');
  return {pal:{M:'#c8b890',N:'#8a7a5a',b:'#8a7a5a',D:'#a89870',K:'#0e0a16',C:'#f6e7a8',E:'#f6e7a8',W:'#5a4a3a',G:'#f0c860'},flat:'KCE'};
 },
 // ---- guardians (60x60) ----
 thornwarden(g){
  g.path([[14,48],[8,55],[3,57]],'b',3);g.path([[38,48],[44,55],[50,57]],'b',3);
  g.poly([[16,18],[42,16],[46,34],[42,52],[18,52],[12,34]],'B');
  g.path([[14,24],[6,16],[2,8]],'B',4);g.path([[6,16],[2,18]],'B',2);g.path([[2,8],[0,4]],'B',2);
  g.path([[42,26],[50,32],[55,40],[54,48]],'B',5);g.path([[55,40],[59,38]],'B',2);
  g.ell(17,18,6,4,'A');g.ell(40,16,6,4,'A');g.ell(29,13,9,4,'A');
  g.path([[24,8],[22,2],[18,0]],'b',2);g.path([[34,8],[37,2],[41,0]],'b',2);g.ell(18,1,3,2,'A');g.ell(42,1,3,2,'A');
  g.rect(31,24,4,4,'K');g.rect(39,24,4,4,'K');g.rect(32,25,2,2,'E');g.rect(40,25,2,2,'E');
  g.poly([[31,33],[44,32],[42,38],[33,38]],'K');g.ell(37,40,6,3,'A');
  [[14,30],[22,40],[45,42],[20,46],[26,30]].forEach(p=>g.line(p[0],p[1],p[0]+3,p[1]-1,'b'));
  g.path([[12,36],[18,44],[16,50]],'V',2);g.path([[46,24],[49,30]],'V',2);
  [[13,38],[17,45],[48,28]].forEach(p=>g.px([[p[0]-1,p[1]],[p[0]+1,p[1]-1]],'W'));
  return {pal:{B:'#6e4c2c',b:'#4c321c',A:'#5aa04a',K:'#1a0f08',E:'#ffe08a',V:'#2f6a2e',W:'#e8e0c8'},flat:'KEW'};
 },
 drake(g){
  g.ell(30,54,26,4,'C');
  g.path([[10,54],[6,46],[10,38],[20,34],[26,40],[24,50],[30,54]],'B',8);
  g.path([[22,36],[28,26],[34,18]],'B',8);
  g.path([[11,52],[8,44],[12,38]],'A',3);g.path([[25,38],[30,28],[35,20]],'A',3);
  g.ell(40,14,9,7,'B');g.poly([[44,12],[58,15],[57,19],[45,20]],'B');g.poly([[45,20],[56,21],[53,25],[44,22]],'b');
  g.px([[49,19],[52,19],[55,19],[48,21],[51,22]],'W');
  g.rect(42,11,3,3,'E');g.s(44,12,'K');
  g.poly([[34,9],[30,2],[37,6],[36,0],[41,7]],'Y');g.poly([[20,32],[13,26],[22,29]],'b');g.poly([[14,42],[5,40],[13,45]],'b');
  g.px([[4,20],[8,12],[52,32],[56,40],[46,44]],'Y');
  g.px([[16,54],[30,53],[44,55]],'W');
  return {pal:{B:'#2f6aa8',b:'#1f4878',A:'#a8e0f0',C:'#8fd0f0',E:'#fff06a',K:'#1a1020',W:'#ffffff',Y:'#f2d43a'},flat:'EKWY'};
 },
 cinderking(g){
  g.rect(16,40,9,16,'B');g.rect(31,40,9,16,'B');g.rect(14,53,12,4,'b');g.rect(29,53,12,4,'b');
  g.ell(10,30,6,10,'b');g.ell(9,42,6,5,'b');
  g.poly([[12,16],[46,14],[50,28],[44,42],[14,42],[10,28]],'B');
  g.rect(22,4,15,13,'B');g.rect(27,9,3,2,'E');g.rect(32,9,3,2,'E');g.rect(26,13,9,2,'C');
  g.rows(21,0,["M.M..M..M.M","MMMMMMMMMMM","MCMMMCMMMCM"]);
  g.poly([[44,18],[54,26],[54,40],[46,38]],'B');g.ell(51,44,7,6,'b');g.path([[47,40],[50,46],[55,44]],'C');
  [[16,20,22,26,19,32],[34,20,30,28,38,34],[22,34,28,38,26,41]].forEach(p=>g.path([[p[0],p[1]],[p[2],p[3]],[p[4],p[5]]],'C'));
  g.ell(29,27,3,3,'A');
  return {pal:{B:'#4a362e',b:'#33241e',C:'#ff7a2a',A:'#ffe08a',E:'#ffd04a',M:'#9a9aa8'},flat:'CAE'};
 },
 hoarwyrm(g){
  g.poly([[18,24],[2,6],[8,12],[4,2],[16,10],[16,2],[26,18]],'b');
  g.path([[12,44],[4,48],[2,56]],'B',4);
  g.ell(24,38,15,10,'B');g.ell(26,42,10,5,'A');
  g.rect(14,44,5,12,'B');g.rect(30,44,5,12,'B');g.px([[13,56],[15,56],[17,56],[29,56],[31,56],[33,56]],'W');
  g.path([[34,32],[40,22],[44,16]],'B',7);
  g.ell(47,13,6.5,5.5,'B');g.poly([[50,11],[59,15],[52,18]],'B');g.rect(48,10,3,2,'E');
  g.path([[44,9],[41,3],[42,0]],'W',2);g.path([[48,8],[49,2],[52,0]],'W',2);
  g.poly([[30,22],[44,8],[42,18],[52,14],[40,28]],'b');
  [[16,30],[22,28],[28,29],[34,26]].forEach(p=>g.poly([[p[0]-2,p[1]+2],[p[0],p[1]-4],[p[0]+2,p[1]+2]],'C'));
  g.px([[53,17],[55,17]],'W');g.px([[56,18],[58,20],[55,21]],'C');
  return {pal:{B:'#bfe0f0',b:'#7ab0d0',A:'#ffffff',C:'#8fe0ff',W:'#f4ffff',E:'#1a5aa8'},flat:'E'};
 },
 ysolde(g){
  g.poly([[24,6],[14,8],[6,16],[10,18],[16,14],[22,16]],'Y');
  g.poly([[24,18],[36,18],[42,40],[48,56],[30,52],[14,56],[18,40]],'B');
  g.poly([[30,18],[36,18],[42,40],[48,56],[36,53]],'b');
  g.rect(26,16,8,4,'G');
  g.ell(30,10,6,6.5,'A');g.poly([[23,6],[33,3],[37,8],[24,14],[20,20]],'Y');g.rect(31,10,2,2,'E');g.rect(34,10,1,2,'E');
  g.line(36,22,46,24,'B',3);g.ell(47,24,2,2,'A');
  g.line(48,8,48,56,'G');g.ell(48.5,6,3.5,3.5,'C');g.ell(48.5,6,1.8,1.8,'Y');
  g.path([[54,14],[57,20],[54,22],[58,30]],'Y');g.path([[8,30],[4,36],[7,38],[3,46]],'Y');
  g.line(24,24,22,34,'A',2);
  return {pal:{B:'#383a72',b:'#26285a',A:'#e8cfc0',G:'#f0c860',Y:'#fff2a8',E:'#3ad0ff',C:'#f2d43a'},flat:'EY',glow:'#fff2a8'};
 },
 dimmer(g){
  g.poly([[24,12],[36,12],[42,30],[46,58],[14,58],[18,30]],'B');
  g.path([[36,20],[48,28],[54,40],[52,50]],'B',4);g.path([[24,20],[14,30],[8,40],[10,48]],'B',4);
  g.path([[52,50],[56,54]],'B',2);g.path([[52,50],[50,56]],'B',2);g.path([[10,48],[6,52]],'B',2);g.path([[10,48],[12,54]],'B',2);
  g.ell(30,10,7,8,'B');g.ell(31,11,4,5,'K');g.rect(29,10,2,2,'W');g.rect(33,10,2,2,'W');
  [[22,2,'C'],[26,0,'D'],[30,-1,'F'],[34,0,'H'],[38,2,'I']].forEach(p=>{g.ell(p[0]+.5,p[1]+1.5,1.8,1.8,p[2]);});
  [[24,30],[34,36],[20,44],[38,48],[28,52],[30,24],[42,40]].forEach(p=>g.s(p[0],p[1],'A'));
  g.ell(30,38,4,5,'K');g.px([[30,37],[29,39],[31,40]],'F');
  return {pal:{B:'#16102a',K:'#05030a',W:'#ffffff',A:'#e8e0ff',C:'#e8553a',D:'#5fc9a0',F:'#f6e7a8',H:'#3f8fe0',I:'#f2c93a'},flat:'KWACDFHI',rim:'#6a4aa8',glow:'#8b5fd0'};
 }
};
const BIG_ART=['thornwarden','drake','cinderking','hoarwyrm','ysolde','dimmer','bonecolossus','queenmantis','gloomcap','ironsentinel','siren','ashwyvern','frostlich','nidhra','hollowking','seraph'];
const MON_SIZE=n=>BIG_ART.includes(n)?60:40;

// =================== ICONS ===================
function iconURL(el){return cvURL('i:'+el,()=>elShapeCv(el));} // v0.3.5: same set as the cards (see ELSHAPE in battleui.js)
function coinURL(){return cvURL('coin',()=>{const g=new PG(10,10,1,1);g.ell(4,4,4,4,'G');g.rect(3,2,2,4,'Y');return paint(g,{G:'#f0b848',Y:'#fff0a8'},{flat:'Y'});});}

// =================== FLAIR & COLOR ===================
// Per-hero accent color (A) and small costume details so the roster reads as 36 different people.
const FLAIR={
 brann:{A:'#f0b848',f:['emblem','belt2'],K:'#4a2e22',B:'#3a2418'},mira:{A:'#7ae0ff',f:['sash','gem'],B:'#2a3a6a'},sable:{A:'#e04a8a',f:['belt2'],K:'#221a2c'},
 tess:{A:'#f2d46a',f:['sash'],K:'#5a4a2a',B:'#6a3a1e'},oren:{A:'#3aa04a',f:['emblem','trim']},lumen:{A:'#7ac8ff',f:['trim','gem'],B:'#b08a4a'},
 kael:{A:'#3ad0ff',f:['pauldron','emblem'],K:'#1e2236'},pip:{A:'#f08a3a',f:['belt2'],K:'#4a3a2a',B:'#2a4a5a'},wren:{A:'#d8503a',f:['sash'],K:'#3a3a22'},
 gilda:{A:'#3ab0a0',f:['trim','sash'],K:'#5a2a3a',B:'#3a1e1e'},fenn:{A:'#f0b848',f:['trim','gem']},halden:{A:'#e04848',f:['emblem']},
 pomona:{A:'#f06a8a',f:['apron'],B:'#6a4a2a'},taro:{A:'#5a7ae0',f:['beads'],K:'#2a2a4a'},cass:{A:'#f2d46a',f:['pauldron','sash']},
 shen:{A:'#e0503a',f:['beads']},alder:{A:'#e8c060',f:['apron']},rook:{A:'#b0e04a',f:['chain','emblem']},
 marisol:{A:'#f0a03a',f:['sash','trim']},vael:{A:'#ff5ad0',f:['trim','gem']},corwin:{A:'#3a6ae0',f:['emblem','trim']},
 kit:{A:'#3ad0ff',f:['belt2','pauldron'],K:'#2a2a3a',B:'#5a3a2a'},frey:{A:'#5a7ae0',f:['trim'],K:'#3a5a7a',B:'#e8f0f8'},jun:{A:'#f2d46a',f:['beads']},
 lark:{A:'#e0503a',f:['sash'],K:'#3a5a4a'},sorrel:{A:'#f6e06a',f:['trim','gem']},
 sylva:{A:'#c8e04a',f:['sash','belt2'],K:'#3a4a3a'},gorm:{A:'#ffd04a',f:['beads']},dagna:{A:'#ff7a5a',f:['emblem','pauldron']},
 zephra:{A:'#ff9ad0',f:['trim','sash']},astra:{A:'#b080ff',f:['trim','gem']},ember:{A:'#3ad0ff',f:['trim','gem']},
 vex:{A:'#ff4a8a',f:['belt2','pauldron'],K:'#1e3434'},isolde:{A:'#f0c860',f:['trim','gem']},nyx:{A:'#c080ff',f:['pauldron']},ciro:{A:'#3a8ae0',f:['sash','belt2']}
};
const PANTS=['#3a3348','#4a3a2a','#2e3a4a','#5a2e2e','#2e4a3a','#4a4a52','#6a5a3a','#3a2a4a'];
const BOOTS=['#5a3a22','#3a2a1e','#6a4a2a','#2a2430','#7a3a2a','#4a4a5a'];
function flairOf(id){return FLAIR[id]||{f:[],A:null};}
const _heroPal0=heroPal;
heroPal=function(L,els,id){
  const p=_heroPal0(L,els),F=id?flairOf(id):{};const h=hashS(id||JSON.stringify(L.pal||{}));
  if(!(L.pal&&L.pal.K))p.K=F.K||PANTS[h%PANTS.length];
  if(!(L.pal&&L.pal.B))p.B=F.B||BOOTS[(h>>3)%BOOTS.length];
  p.A=F.A||tint(p.C,.2);
  return p;
};
function drawFlair(g,L,id,view){
  const F=flairOf(id).f||[];const robe=L.b==='robe',heavy=L.b==='heavy';
  F.forEach(f=>{
    if(view==='side'){
      if(f==='emblem')g.rect(15,15,2,2,'A');
      if(f==='sash')g.line(13,13,18,19,'A');
      if(f==='gem'){g.px([[14,13],[17,13]],'G');g.s(15,14,'C');g.s(16,14,'C');}
      if(f==='trim'){if(robe){g.rect(10,27,13,1,'G');}else g.rect(11,20,10,1,'G');}
      if(f==='belt2'){g.rect(12,17,2,3,'L');g.s(12,18,'G');}
      if(f==='pauldron'&&!heavy){g.rows(14,12,[".MMMM.","MMMMMM",".NNNN."]);}
      if(f==='apron'){g.rect(16,15,4,6,'w');g.rect(16,15,4,1,'A');}
      if(f==='beads')g.px([[13,13],[14,14],[15,14],[16,14],[17,14],[18,13]],'A');
      if(f==='chain')g.line(12,14,19,17,'M');
    }else{
      const front=view==='front';
      if(f==='emblem'&&front){g.rect(15,15,2,2,'A');g.px([[14,15],[17,15]],'G');}
      if(f==='sash')g.line(front?11:20,13,front?20:11,20,'A');
      if(f==='gem'&&front){g.px([[13,13],[18,13]],'G');g.rect(15,13,2,2,'C');}
      if(f==='trim'){if(robe)g.rect(9,27,14,1,'G');else g.rect(11,20,10,1,'G');}
      if(f==='belt2'&&front){g.rect(12,17,2,3,'L');g.s(12,18,'G');}
      if(f==='pauldron'&&!heavy){g.rows(8,12,["MMMM","MMMM",".NN."]);}
      if(f==='apron'&&front){g.rect(13,15,6,6,'w');g.rect(13,15,6,1,'A');}
      if(f==='beads'&&front)g.px([[12,13],[13,14],[14,15],[15,15],[16,15],[17,15],[18,14],[19,13]],'A');
      if(f==='chain'&&front)g.line(11,13,20,18,'M');
    }
  });
}

// =================== FRONT & BACK VIEWS ===================
PG.prototype.sym=function(x0,y0,R){R.forEach((r,j)=>{for(let i=0;i<r.length;i++){const c=r[i];if(c==='.'||c===' ')continue;const x=x0+i;this.s(x,y0+j,c);this.s(31-x,y0+j,c);}});return this;};
function legsFB(g,L,frame){
  const b=L.b,robe=b==='robe',heavy=b==='heavy',monk=b==='monk';
  const P=monk?'P':'K',BT=monk?'S':heavy?'M':'B',SO=monk?'e':heavy?'N':'b';
  [[12,frame===1?2:0],[17,frame===2?2:0]].forEach(([x,lift])=>{
    if(robe){g.rect(x,28-lift,3,1,'B');g.rect(x,29-lift,3,1,'b');return;}
    g.rect(x,21,3,4-(lift?1:0),P);
    if(heavy)g.rect(x,23,3,1,'M');
    if(monk)g.rect(x,25-lift,3,2,'w');
    g.rect(x,(monk?27:25)-lift,3,(monk?1:3),BT);
    g.rect(x,28-lift,3,1,BT);g.rect(x,29-lift,3,1,SO);
  });
}
function torsoFB(g,L,view){
  const b=L.b,front=view==='front';
  if(b==='light'){
    g.sym(11,12,["...QS",".PPPP","PPPPP",".PPP"+(front?'Q':'P'),".PPP"+(front?'Q':'P'),".LLL"+(front?'G':'L'),".PPPP","PPPPP","QQQQQ"]);
    g.sym(9,13,[".P","PP","PP","PP","PP","SS"]);
  }else if(b==='robe'){
    g.sym(10,12,["....QS","..PPPP",".PPPP"+(front?'Q':'P'),".PPPP"+(front?'Q':'P'),".PPPP"+(front?'Q':'P'),"..LLL"+(front?'G':'L'),"..PPP"+(front?'Q':'P'),"..PPP"+(front?'Q':'P'),".PPPP"+(front?'Q':'P'),".PPPP"+(front?'Q':'P'),".PPPPP","PPPPPP","PPPPPP","PPPPPP","PPPPPP","QQQQQQ"]);
    g.sym(8,13,[".PP","PPP","PPP","PPP","PPP",".SS"]);
  }else if(b==='heavy'){
    g.sym(10,12,["....NS","..MMMM",".MMMMM","..MMP"+(front?'P':'M'),"..MMP"+(front?'Q':'M'),"..LLL"+(front?'G':'L'),"..PPPP","..MMPP",".MMMMP"]);
    g.sym(7,12,["..MMM","MMMMM","MMMM.",".MM..",".MM..",".MM..",".NN.."]);
  }else{
    g.sym(11,12,["...SS",front?".PPSS":".PPPP",front?"PPPPS":"PPPPP",".PPPP",".PPPP",".QQQQ",".PPPP","PPPPP","PPPPP"]);
    g.sym(9,13,[".P","SS","SS","SS","ww","SS"]);
  }
}
const HAIR_FB={
 short:{f:["...HHH","..HHHH",".HHHHH",".HHHHH",".HHHHH",".HH.HH",".H....",".H...."],b:9},
 spiky:{f:["..H..H","..HHHH",".HHHHH","HHHHHH",".HHHHH",".H.H.H",".H....",".H...."],b:9,spike:1},
 wild:{f:["..H..H","..HHHH",".HHHHH","HHHHHH",".HHHHH","HH.H.H","HH....","HH....","HH....","H.....","H....."],b:12,spike:1},
 long:{f:["...HHH","..HHHH",".HHHHH",".HHHHH",".HHHHH",".HHH.H","HH....","HH....","HH....","HH....","HH....","HH....","HH....","H....."],b:14},
 ponytail:{f:["...HHH","..HHHH",".HHHHH",".HHHHH",".HHHHH",".HH.HH",".H....",".H...."],b:9,tail:1},
 bun:{f:["...HHH","..HHHH",".HHHHH",".HHHHH",".HHHHH",".HH.HH",".H....",".H...."],b:9,bun:1},
 mohawk:{f:[],b:0,mohawk:1},
 braid:{f:["...HHH","..HHHH",".HHHHH",".HHHHH",".HHHHH",".HH.HH",".H....",".H...."],b:9,braid:1},
 curly:{f:["..HHHH",".HHHHH","HHHHHH","HHHHHH","HHHHHH","HHH.HH","HH....","HH....","HH....","H....."],b:11},
 bob:{f:["...HHH","..HHHH",".HHHHH",".HHHHH",".HHHHH",".HHHHH","HH....","HH....","HH....","HH...."],b:11},
 swept:{f:["...HHH","..HHHH",".HHHHH",".HHHHH",".HHHHH",".HH.HH",".H....",".H...."],b:9,swept:1},
 bald:{f:[],b:0}
};
function headFB(g,L,view){
  const front=view==='front',H=HAIR_FB[L.hair||'short'],hood=L.hat==='hood'||L.hat==='greathelm';
  g.sym(11,3,["..SSS",".SSSS","SSSSS","SSSSS",front?"SSESS":"SSSSS",front?"SSESS":"SSSSS","SSSSS",".SSSS","..SSS"]);
  if(front)g.px([[15,10],[16,10]],'m');
  if(!hood&&L.hair!=='long'&&L.hair!=='curly'&&L.hair!=='bob'){g.px([[10,7],[10,8]],'e');g.px([[21,7],[21,8]],'e');}
  if(front){
    if(H.f.length)g.sym(10,1,H.f);
    if(H.spike)g.px([[12,0],[15,0],[16,0],[19,0]],'H');
    if(H.swept)g.rows(16,6,["HHHHH","...HH"]);
    if(H.braid)g.path([[10,9],[11,10],[10,11],[11,12],[10,13],[11,14]],'H');
  }else{
    const n=H.b;if(n){const rows=[];for(let y=0;y<n;y++)rows.push(y===0?"...HHH":y===1?"..HHHH":".HHHHH");g.sym(10,1,rows);}
    if(L.hair==='long')g.sym(10,12,[".HHHHH",".HHHHH","..HHHH"]);
    if(H.tail)g.rect(15,10,2,8,'H');
    if(H.braid){for(let y=10;y<19;y+=2){g.rect(15,y,2,1,'H');g.rect(15+(y%4?1:0),y+1,1,1,'H');}}
    if(H.spike)g.px([[12,0],[15,0],[16,0],[19,0],[9,4],[22,4]],'H');
  }
  if(H.bun)g.ell(16,1,2.6,2.1,'H');
  if(H.mohawk)g.rect(14,-1,4,6,'H');
  if(L.hair==='curly'){g.ell(16,4.5,7,4.5,'H');if(front){g.rect(12,7,8,3,0);g.sym(11,7,["SSESS","SSESS"]);}else g.rect(10,7,12,4,'H');}
  if(L.hair==='curly'&&front)g.px([[12,3],[16,2],[19,4]],'h');
}
const HAT_FB={
 helm:{f:["...MMM","..MMMM",".MMMMM",".MMMMM","NNNNNN","MM....","MM...M","MM...M"],b:["...MMM","..MMMM",".MMMMM",".MMMMM","NNNNNN","MMMMMM","MMMMMM","MMMMMM"]},
 greathelm:{f:["...MMM","..MMMM",".MMMMM",".MMMMM","NNNNNN","MMMMMM","MKKKKK","MMMMMM","MMMMNM",".MMMMM","..MMMM"],b:["...MMM","..MMMM",".MMMMM",".MMMMM","NNNNNN","MMMMMM","MMMMMM","MMMMMM","MMMMMM",".MMMMM","..MMMM"]},
 wizard:{f:["......","......","....JJ","...JJJ","..JJJJ",".QQQQQ","JJJJJJ"],b:null,y:-3,x:8},
 hood:{f:["...JJJ","..JJJJ",".JJJJJ",".JJJJJ","JJJ...","JJ....","JJ....","JJ....","JJ....","JJJ...","JJJJJJ",".JJJJJ"],b:["...JJJ","..JJJJ",".JJJJJ",".JJJJJ","JJJJJJ","JJJJJJ","JJJJJJ","JJJJJJ","JJJJJJ","JJJJJJ","JJJJJJ",".JJJJJ"],x:9},
 bandana:{f:["......","..JJJJ",".JJJJJ",".JJJJJ"],b:["......","..JJJJ",".JJJJJ",".JJJJJ"],knot:1},
 circlet:{f:["......","......","......","......","GGGGGG"],b:["......","......","......","......","GGGGGG"],gem:1},
 feathercap:{f:["...JJJ","..JJJJ",".JJJJJ","JJJJJJ"],b:["...JJJ","..JJJJ",".JJJJJ","JJJJJJ"],feather:1},
 crown:{f:["..G..G","..GG.G","..GGGG","..GCGG"],b:["..G..G","..GG.G","..GGGG","..GGGG"],y:0},
 headband:{f:["......","......","......","......","JJJJJJ"],b:["......","......","......","......","JJJJJJ"],knot:1},
 mitre:{f:["....ww","...www","...wGG","...wGG","..wwww","..GGGG"],b:["....ww","...www","...www","...www","..wwww","..GGGG"],y:-1},
 beret:{f:["......","..JJJJ","JJJJJJ",".JJJJJ"],b:["......","..JJJJ","JJJJJJ",".JJJJJ"]},
 goggles:{f:["......","......","......",".MMM..","KMCMKK",".MMM.."],b:["......","......","......","......","KKKKKK"]},
 widebrim:{f:["......JJ",".....JJJ","....JJJJ","....QQQQ","JJJJJJJJ"],b:["......JJ",".....JJJ","....JJJJ","....QQQQ","JJJJJJJJ"],x:8,y:0},
 plume:{f:["...MMM","..MMMM",".MMMMM",".MMMMM","NNNNNN","MM....","MM...M","MM...M"],b:["...MMM","..MMMM",".MMMMM",".MMMMM","NNNNNN","MMMMMM","MMMMMM","MMMMMM"],plume:1},
 horns:{f:["...MMM","..MMMM",".MMMMM",".MMMMM","NNNNNN","MM....","MM...M","MM...M"],b:["...MMM","..MMMM",".MMMMM",".MMMMM","NNNNNN","MMMMMM","MMMMMM","MMMMMM"],horns:1}
};
function hatFB(g,L,view){
  const h=HAT_FB[L.hat];if(!h)return;const front=view==='front';
  const rows=front||!h.b?h.f:h.b,x0=h.x!==undefined?h.x:10,y0=h.y!==undefined?h.y:1;
  g.sym(x0,y0,rows);
  if(L.hat==='wizard'){g.px([[15,-3],[16,-3],[16,-4],[17,-4]],'J');}
  if(L.hat==='greathelm'&&front)g.px([[13,7],[18,7]],'C');
  if(h.gem&&front){g.rect(15,4,2,2,'C');}
  if(h.knot&&!front)g.rows(15,6,["JJ",".J","J."]);
  if(h.feather)g.path([[20,3],[22,1],[23,-1]],'R',2);
  if(h.plume)g.rect(14,-2,4,3,'R');
  if(h.horns){g.path([[10,4],[8,3],[7,1],[7,-1]],'w',2);g.path([[21,4],[23,3],[24,1],[24,-1]],'w',2);}
  if(L.hat==='mitre'&&front)g.rect(15,1,2,3,'G');
}
function faceFB(g,L,view){
  const front=view==='front';
  (L.face||[]).forEach(f=>{
    if(f==='elfears'){g.px([[9,6],[8,5],[7,4]],'S');g.px([[22,6],[23,5],[24,4]],'S');}
    if(!front)return;
    if(f==='beard')g.sym(11,9,["HH.HH","HHHHm","HHHHH",".HHHH","...HH"]);
    if(f==='mustache')g.rect(14,9,4,1,'H');
    if(f==='eyepatch'){g.rect(13,7,2,2,'K');g.line(11,5,13,7,'K');g.line(15,7,20,5,'K');}
    if(f==='mask')g.sym(11,9,["KKKKK","KKKKK",".KKKK"]);
    if(f==='scar')g.px([[17,6],[18,9],[19,10]],'r');
    if(f==='warpaint')g.px([[13,9],[18,9],[12,9],[19,9]],'C');
    if(f==='freckles')g.px([[12,9],[14,9],[17,9],[19,9]],'e');
    if(f==='blush')g.px([[12,9],[19,9]],'r');
  });
}
function backItemsFB(g,L,view,pass){
  // pass 'under' = drawn behind body; 'over' = drawn on top of body
  const front=view==='front';
  (L.back||[]).forEach(k=>{
    if(k==='cape'){if(front&&pass==='under'){g.rect(8,13,2,13,'Y');g.rect(22,13,2,13,'Y');}if(!front&&pass==='over'){g.sym(9,12,["..YYYY",".YYYYY",".YYYYY","YYYYYY","YYYYYY","YYYYYY","YYYYYY","YYYYYY","YYYYYY","YYYYYY","YYYYYY","YYYYYY","YYYYYY",".YYYYY"]);}}
    if(k==='scarf'&&pass==='over'){g.rect(12,12,8,2,'Y');if(front)g.rect(18,14,2,5,'Y');else g.rect(15,14,2,4,'Y');}
    if(k==='pack'){if(front&&pass==='over'){g.rect(12,13,1,5,'L');g.rect(19,13,1,5,'L');}if(!front&&pass==='over'){g.rect(11,13,10,8,'Y');g.rect(11,13,10,2,'L');g.rect(15,16,2,1,'G');}}
  });
}
function weaponFB(g,L,view){
  const w=L.wpn||'none',front=view==='front',hk=HP.body[L.b].hand;
  if(front){
    const hx=8,hy=18;
    if(['sword','greatsword'].includes(w)){g.rect(hx,hy-11,2,10,'M');g.rect(hx-1,hy-1,4,1,'G');}
    else if(w==='axe'){g.line(hx+1,hy-9,hx+1,hy+5,'W');g.poly([[hx+1,hy-10],[hx-4,hy-11],[hx-5,hy-6],[hx+1,hy-6]],'M');}
    else if(w==='hammer'){g.line(hx+1,hy-8,hx+1,hy+6,'W');g.rect(hx-2,hy-12,7,5,'M');g.rect(hx-2,hy-10,7,1,'G');}
    else if(w==='spear'){g.line(hx+1,hy-16,hx+1,hy+10,'W');g.rows(hx,hy-19,[".M.","MMM",".M."]);}
    else if(w.startsWith('staff')){g.line(hx+1,hy-13,hx+1,hy+11,w==='staff_sun'?'G':'W');g.ell(hx+1.5,hy-15,2.4,2.4,'C');g.px([[hx-1,hy-13],[hx+3,hy-13]],'G');}
    else if(w==='rod'){g.line(hx+1,hy-6,hx+1,hy+3,'G');g.ell(hx+1.5,hy-7.5,1.8,1.8,'C');}
    else if(w==='tome'){g.rect(hx-2,hy-2,5,6,'J');g.rect(hx-1,hy-1,3,4,'w');}
    else if(w==='grimoire'){g.rect(hx-4,hy-10,7,5,'J');g.rect(hx-3,hy-9,5,3,'w');g.line(hx-1,hy-9,hx-1,hy-7,'J');g.px([[hx-4,hy-10],[hx+2,hy-10],[hx-4,hy-6],[hx+2,hy-6]],'G');g.px([[hx-2,hy-8],[hx+1,hy-8]],'C');g.px([[hx-5,hy-4],[hx+3,hy-12]],'G');}
    else if(w==='dagger'||w==='twindagger'){g.rect(hx,hy+1,1,4,'M');g.s(hx,hy,'G');if(w==='twindagger'){g.rect(31-hx,hy+1,1,4,'M');g.s(31-hx,hy,'G');}}
    else if(w==='claws')g.px([[hx-1,hy+2],[hx,hy+3],[hx+1,hy+2],[hx,hy+4]],'M');
    else if(w==='lute'){g.ell(19.5,20,3.5,2.6,'L');g.line(17,18,13,13,'W');g.s(19,20,'K');}
    else if(w==='harp'){g.path([[21,13],[24,13],[24,20],[21,21],[21,13]],'G');g.line(22,14,22,19,'w');}
    else if(w==='bow'){g.path([[24,10],[25,13],[25,20],[24,23]],'W');g.line(24,10,24,23,'w');}
    if(w==='fists')g.rect(hx,hy,2,2,'w');else g.rect(hx,hy,2,2,hk);
    if(L.sh==='kite')g.rows(21,14,["MMMMMM","MZZZZM","MZGGZM","MZZZZM",".MZZM.","..MM.."]);
    if(L.sh==='round'){g.ell(23,18,3.6,3.6,'M');g.ell(23,18,2.4,2.4,'Z');g.s(23,18,'G');}
  }else{
    if(['sword','greatsword','axe','hammer','spear'].includes(w)||w.startsWith('staff'))g.line(10,7,21,26,w==='staff_sun'?'G':(['sword','greatsword'].includes(w)?'M':'W'),2);
    if(w==='axe')g.poly([[8,4],[13,4],[13,9],[8,9]],'M');
    if(w==='hammer')g.rect(7,4,6,5,'M');
    if(w.startsWith('staff'))g.ell(9.5,6,2.4,2.4,'C');
    if(['sword','greatsword'].includes(w))g.rect(18,22,4,1,'G');
    if(w==='bow'){g.path([[9,10],[12,12],[18,20],[20,25]],'W');g.line(11,9,21,24,'w');}
    if(w==='lute'||w==='harp')g.ell(20,17,3.2,4,w==='lute'?'L':'G');
    if(w==='grimoire'){g.rect(22,2,7,5,'J');g.line(25,2,25,6,'K');g.px([[22,2],[28,2],[22,6],[28,6]],'G');g.px([[21,8],[29,0]],'G');}
    if(L.sh==='kite')g.rows(12,13,["MMMMMMMM","MZZZZZZM","MZZGGZZM","MZGGGGZM","MZZGGZZM",".MZZZZM.","..MZZM..","...MM..."]);
    if(L.sh==='round'){g.ell(16,17,4.6,4.6,'M');g.ell(16,17,3.4,3.4,'Z');g.s(16,17,'G');}
  }
}
// side view with flair, via the original builder
const _heroGrid0=heroGrid;
heroGrid=function(L,walk,id){const g=_heroGrid0(L,walk);if(id)drawFlair(g,L,id,'side');return g;};

// =================== MONSTER DETAIL PASS ===================
// Extra color and pattern drawn over each base design.
const MEXTRA={
 mossling(g,p){g.ell(10,24,3,2,'X');g.rect(9,25,3,3,'W');g.px([[9,23],[11,24]],'W');g.px([[17,20],[26,20]],'Y');g.px([[16,19],[27,19]],'F');Object.assign(p,{X:'#d8403a',F:'#f6a0d0'});},
 gustimp(g,p){g.poly([[16,17],[7,10],[9,14],[5,17],[10,18],[7,22],[15,21]],'M');g.rect(29,15,2,2,'R');g.px([[18,20],[20,22],[22,20]],'C');Object.assign(p,{M:'#8a6ad0',R:'#e04a6a'});},
 dewtoad(g,p){[[12,24],[18,21],[22,25],[15,28]].forEach(q=>g.ell(q[0],q[1],1.8,1.4,'O'));g.line(14,32,28,32,'Y');Object.assign(p,{O:'#f08a3a',Y:'#f2e070'});},
 cinderpup(g,p){g.px([[2,20],[1,21]],'W');g.rect(12,35,3,2,'K');g.rect(22,35,3,2,'K');g.rect(16,35,3,2,'K');g.rect(25,35,3,2,'K');g.px([[20,22],[16,23]],'D');Object.assign(p,{W:'#ffffff'});},
 crawler(g,p){g.px([[12,22],[16,21],[20,22],[24,23]],'W');g.ell(14,23,1.3,1,'Y');g.ell(22,22,1.3,1,'Y');g.rect(37,15,2,2,'O');g.rect(37,22,2,1,'O');Object.assign(p,{Y:'#f2e070',O:'#f08a3a'});},
 gull(g,p){g.px([[10,10],[13,7],[16,9],[19,12],[12,13]],'C');g.px([[11,11],[14,8],[17,11]],'P');g.rect(3,19,3,2,'K');Object.assign(p,{P:'#5ad0ff'});},
 tidewisp(g,p){g.ell(20,12,3.5,2,'P');g.px([[14,22],[18,27],[23,29],[27,25]],'P');Object.assign(p,{P:'#ff8ad8'});},
 shellguard(g,p){g.ell(14,17,2.5,1.5,'M');g.ell(23,20,2,1.4,'M');g.px([[8,22],[9,21],[29,22],[30,21]],'R');Object.assign(p,{M:'#5aa04a',R:'#f06a6a'});},
 magmaslime(g,p){g.poly([[11,26],[14,23],[15,27]],'O');g.poly([[27,31],[30,28],[31,32]],'O');g.px([[12,24],[28,29]],'W');Object.assign(p,{O:'#2a1e2e',W:'#c8b8ff'});},
 cavebat(g,p){g.path([[16,20],[6,14]],'M');g.path([[16,23],[6,23]],'M');g.path([[24,20],[33,13]],'M');g.path([[24,22],[34,22]],'M');g.ell(20,24,2.5,3,'A');Object.assign(p,{M:'#c86aa8',A:'#8a6aa8'});},
 ashwraith(g,p){g.rows(20,9,["WWWW","W..W"]);g.px([[15,32],[19,34],[23,33],[27,31]],'C');g.px([[12,28],[29,26]],'R');Object.assign(p,{W:'#e8d8c8',R:'#ffd04a'});},
 slaggolem(g,p){g.ell(14,24,1.5,1.2,'G');g.ell(26,18,1.5,1.2,'G');g.ell(18,10,1,1,'G');g.px([[24,33],[15,33]],'G');Object.assign(p,{G:'#ffd04a'});},
 frostwolf(g,p){g.line(12,22,13,26,'S');g.line(17,21,18,26,'S');g.line(22,21,22,25,'S');g.px([[27,17],[28,17]],'S');Object.assign(p,{S:'#5a8ac8'});},
 snowharpy(g,p){g.px([[4,7],[3,13],[2,18],[5,24],[35,9],[38,16]],'P');g.path([[6,9],[3,13]],'P');g.path([[6,22],[3,25]],'P');g.px([[20,18],[22,18]],'G');Object.assign(p,{P:'#b080ff'});},
 yeti(g,p){g.poly([[22,12],[24,7],[25,12]],'H');g.poly([[27,12],[30,8],[30,13]],'H');g.px([[25,17],[26,18]],'S');Object.assign(p,{H:'#c8b090',S:'#3a6aa8'});},
 iceknight(g,p){g.rect(13,15,12,1,'G');g.rect(13,27,12,1,'G');g.rect(18,18,3,3,'C');g.px([[19,19]],'E');},
 thunderhawk(g,p){g.poly([[7,4],[9,7],[11,6]],'S');g.poly([[17,2],[18,5],[20,4]],'S');g.px([[19,25],[21,26],[23,25]],'S');Object.assign(p,{S:'#3a8ae0'});},
 stormling(g,p){g.ell(14,20,3,2,'P');g.ell(27,21,2.5,1.6,'P');g.ell(21,10,2,1,'P');Object.assign(p,{P:'#7a6aa8'});},
 gargoyle(g,p){g.ell(14,29,2.5,1.5,'M');g.ell(23,26,1.6,1,'M');g.px([[18,22],[19,23]],'C');Object.assign(p,{M:'#6a9a4a'});},
 cloudray(g,p){[[14,16],[18,19],[23,17],[26,20],[11,20]].forEach(q=>g.ell(q[0],q[1],1.2,1,'S'));g.ell(20,24,4,1,'Y');Object.assign(p,{S:'#2a6a6a',Y:'#f6e7a8'});},
 voidspawn(g,p){g.ell(9,30,2,1.5,'T');g.ell(31,30,2,1.5,'T');g.px([[12,18],[26,14],[30,22]],'T');Object.assign(p,{T:'#3ad0c0'});},
 eclipsewraith(g,p){g.rect(16,26,8,2,'G');g.px([[14,30],[25,30],[19,34]],'C');},
 stareater(g,p){g.ell(14,24,3,2,'N');g.ell(20,27,2.5,1.5,'N');g.ell(9,25,2,1.5,'P');Object.assign(p,{N:'#5a2a8a',P:'#c04a9a'});},
 huskguard(g,p){g.rect(18,14,4,2,'T');g.rect(13,30,3,1,'T');g.rect(23,30,3,1,'T');g.px([[8,20],[8,22]],'T');Object.assign(p,{T:'#3ad0c0'});},
 thornwarden(g,p){[[18,22],[40,20],[24,46],[44,40]].forEach(q=>{g.ell(q[0],q[1],1.6,1.6,'F');g.s(q[0],q[1],'Y');});g.ell(13,16,2.5,2,'M');g.rect(12,17,3,3,'W');Object.assign(p,{F:'#f06a8a',Y:'#ffe08a',M:'#d8403a'});},
 drake(g,p){g.px([[16,40],[20,36],[28,32],[32,24],[9,46]],'S');g.path([[36,8],[38,4]],'Y');Object.assign(p,{S:'#5ad0ff'});},
 cinderking(g,p){g.rect(22,0,15,1,'G');g.px([[23,2],[29,2],[35,2]],'R');g.rect(14,30,4,2,'G');g.rect(40,30,4,2,'G');Object.assign(p,{G:'#f0c050',R:'#e04848'});},
 hoarwyrm(g,p){g.px([[10,10],[14,14],[8,6],[46,14],[44,20]],'P');g.line(18,42,32,44,'P');Object.assign(p,{P:'#5a8ae0'});},
 ysolde(g,p){g.rect(24,30,14,2,'G');g.rect(22,44,18,2,'G');g.px([[30,24],[28,36],[34,40]],'C');},
 dimmer(g,p){g.px([[18,34],[44,44],[12,50],[36,28]],'H');g.px([[24,44],[40,36]],'D');}
};
function monURL(art){return monURL2(art);}
const monURL2=function(art){return cvURL('m2:'+art,()=>{const s=MON_SIZE(art),g=new PG(s,s,0,0),o=MART[art](g);const pal=Object.assign({},o.pal);if(MEXTRA[art])MEXTRA[art](g,pal);return paint(g,pal,{flat:(o.flat||'')+'YFWCPRSTO'.split('').filter(k=>!o.pal[k]).join(''),rim:o.rim,glow:o.glow});});};
function monCanvas(art){const s=MON_SIZE(art),g=new PG(s,s,0,0),o=MART[art](g);const pal=Object.assign({},o.pal);if(MEXTRA[art])MEXTRA[art](g,pal);return paint(g,pal,{flat:o.flat||'',rim:o.rim,glow:o.glow});}
