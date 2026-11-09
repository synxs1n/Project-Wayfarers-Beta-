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
// FAMILY1-BEGIN
// =================== FOE FRAME API + FAMILY 1 (v0.13 art pass, docs/art-style.md) ===================
// A MART drawing may take a second argument f = {t:'idle'|'atk'|'hit', i:0|1}; monCanvas(art,f) paints that frame and caches it per art+frame
// (key art+'#'+t+i). No f means idle 0, the old look. Wrappers that call MART[base](g) without f (night, realm, echo, pet recolours) still get the
// right frame: monCanvas sets MFR while it draws, and mfr() falls back to it. A drawing marked .fr (MFRAME below) has real frames; battle.js
// drawUnit only swaps frames for those. Frames are functions of f only: no Math.random in sprite code.
let MFR=null;
const MFRAME=new Set();
function mfr(f){f=f||MFR||{};const t=f.t==='atk'||f.t==='hit'?f.t:'idle',i=f.i?1:0;return {t,i,atk:t==='atk',hit:t==='hit',b:t==='idle'&&i===1};}
function monHasFrames(art){return MFRAME.has(art)||!!(MART[art]&&MART[art].fr);}
const MFCACHE={};
function monFrameKey(art,f){f=f||{};return art+'#'+(f.t==='atk'||f.t==='hit'?f.t:'idle')+(f.i?1:0);}
function monFramed(art,f,make){const k=monFrameKey(art,f);if(MFCACHE[k])return MFCACHE[k];const was=MFR;MFR=f||null;try{return MFCACHE[k]=make();}finally{MFR=was;}}
// a body mass in two hand blocked tones: shade key k everywhere, light key K on the top left (rule 2)
function sph(g,cx,cy,rx,ry,K,k){g.ell(cx,cy,rx,ry,k);g.ell(cx-rx*.2,cy-ry*.24,rx*.76,ry*.68,K);}
// an ellipse k drawn only where it is also inside the ellipse b (moss, plates, caps that follow a body's contour)
function ellIn(g,cx,cy,rx,ry,bx,by,brx,bry,k){for(let y=Math.floor(cy-ry-1);y<=Math.ceil(cy+ry+1);y++)for(let x=Math.floor(cx-rx-1);x<=Math.ceil(cx+rx+1);x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry,ex=(x+.5-bx)/brx,ey=(y+.5-by)/bry;if(dx*dx+dy*dy<=1&&ex*ex+ey*ey<=.97)g.s(x,y,k);}}
// a muzzle: upper jaw, lower jaw (drops by op in a lunge, over a dark gape with tongue and fangs). x,y = top of the snout base, L = length
function maw(g,x,y,L,op,kU,kL){
  if(op){g.poly([[x,y+3.2],[x+L,y+3],[x+L-.6,y+3.4+op],[x,y+5.4]],'K');g.rect(Math.round(x+1),Math.round(y+3.6+op*.5),Math.round(L-3),1,'R');}
  g.poly([[x,y+3.4+(op?op*.2:0)],[x+L-.7,y+3.6+op],[x+L-1.8,y+5+op],[x,y+5.6+(op?op*.2:0)]],kL);
  g.poly([[x,y],[x+L,y+1.3],[x+L-.6,y+3.4],[x,y+3.6]],kU);g.rect(Math.round(x+L-1.4),Math.round(y+.4),2,2,'K');
  if(op){g.px([[x+L-3,y+3.8],[x+L-5,y+3.8],[x+L-3.5,y+2.6+op]],'W');}
}
function clr(g,x,y,w,h){return g.rect(x,y,w,h,0);}
function limb(g,x0,y0,x1,y1,k,t,paw){g.path([[x0,y0],[x1,y1]],k,t);if(paw)g.rect(Math.round(x1)-1,Math.round(y1),3,1,paw);}
// family 2 helpers: wing() is a feathered or membrane wing (shoulder S, tip T, rear root R, n feathers, lit leading edge kl); returns the feather tips.
// tend() is a wavy tendril from (x,y) hanging len px, swaying amp with phase ph and drifting by dr, thick t0 then 1.
function lerp2(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}
function wing(g,S,T,R,k,kl,n,notch){n=n||4;notch=notch===undefined?2.4:notch;
  if(typeof R==='number'){const dx=T[0]-S[0],dy=T[1]-S[1],l=Math.hypot(dx,dy)||1;let px=-dy/l,py=dx/l;if(py<0){px=-px;py=-py;}R=[S[0]+px*R,S[1]+py*R];}// a number = wing width: the root sits that far from S, perpendicular to S-T on the lower side
  const mid=[(S[0]+T[0])/2+(T[1]-S[1])*.08,(S[1]+T[1])/2-1.5],P=[S,mid,T],tips=[T];
  for(let j=1;j<=n;j++){const q=lerp2(T,R,(j-.5)/n),dx=S[0]-q[0],dy=S[1]-q[1],l=Math.hypot(dx,dy)||1;P.push([q[0]+dx/l*notch,q[1]+dy/l*notch]);const t=lerp2(T,R,j/n);P.push(t);tips.push(t);}
  g.poly(P,k);g.path([S,mid,T],kl,1.5);return tips;}
function tend(g,x,y,len,amp,ph,k,t0,dr){const P=[];for(let i=0;i<=5;i++){const u=i/5;P.push([x+(dr||0)*u+Math.sin(u*4.2+ph)*amp*u,y+len*u]);}
  for(let i=0;i<5;i++)g.line(P[i][0],P[i][1],P[i+1][0],P[i+1][1],k,i<2?t0:1);return P[5];}
// family 3 helpers: slab() is a plated block (lit key K top left, shade key k right and bottom); spear() a 2px shaft with a leaf head (returns the tip)
function slab(g,x,y,w,h,K,k){g.rect(x,y,w,h,k);if(w>2&&h>2)g.rect(x,y,w-1,h-1,K);return g;}
function spear(g,x0,y0,x1,y1,k,hk,hl){hl=hl||5;const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,px=-uy,py=ux;g.line(x0,y0,x1,y1,k,2);
  g.poly([[x1+px*1.9,y1+py*1.9],[x1+ux*hl*.55+px*2,y1+uy*hl*.55+py*2],[x1+ux*hl,y1+uy*hl],[x1+ux*hl*.55-px*2,y1+uy*hl*.55-py*2],[x1-px*1.9,y1-py*1.9]],hk);return [Math.round(x1+ux*hl),Math.round(y1+uy*hl)];}
// family 4 helpers: eye() the standard foe eye (a 2x2 lamp k with a white glint; a closed 3x1 line K when hit); bolt() a zigzag lightning path from (x,y) down len px
// (dx = how far it kinks); core() a flat glow disc (ring kO, middle kI, white when hit); anchor() an iron anchor from its ring (x0,y0) to its flukes (x1,y1);
// blade() a straight sword from the hilt (x0,y0) to the tip (x1,y1) with a cross guard. Each returns its far point.
function eye(g,x,y,F,k){x=Math.round(x);y=Math.round(y);if(F&&F.hit){g.rect(x,y+1,3,1,'K');return;}g.rect(x,y,2,2,k||'E');g.s(x,y,'W');}
function bolt(g,x,y,len,dx,k,t){const P=[[x,y],[x+dx,y+len*.34],[x-dx*.4,y+len*.46],[x+dx*.7,y+len]];g.path(P,k,t||2);return P[3];}
function core(g,cx,cy,rx,ry,kO,kI,hit){g.ell(cx,cy,rx,ry,kO);g.ell(cx,cy,Math.max(.8,rx-1.5),Math.max(.8,ry-1.5),hit?'W':kI);}
function anchor(g,x0,y0,x1,y1,k,kl){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,px=-uy,py=ux,at=(t,o)=>[x0+dx*t+px*o,y0+dy*t+py*o];
  g.ell(x0,y0,1.8,1.8,k);g.ell(x0,y0,.8,.8,0);g.line(x0+ux*1.6,y0+uy*1.6,x1,y1,k,2);
  const a=at(.2,-4.5),b=at(.2,4.5);g.line(a[0],a[1],b[0],b[1],k,2);g.s(Math.round(a[0]),Math.round(a[1])-1,kl);g.s(Math.round(b[0]),Math.round(b[1])+1,kl);
  const f1=at(1,-5.5),f2=at(1,5.5),c1=at(.86,-6.2),c2=at(.86,6.2);g.path([[x1,y1],f1,c1],k,2);g.path([[x1,y1],f2,c2],k,2);
  g.poly([[c1[0]+px*1.5,c1[1]+py*1.5],[c1[0]-ux*2.6-px*.5,c1[1]-uy*2.6-py*.5],[c1[0]-px*1.2,c1[1]-py*1.2]],k);g.poly([[c2[0]-px*1.5,c2[1]-py*1.5],[c2[0]-ux*2.6+px*.5,c2[1]-uy*2.6+py*.5],[c2[0]+px*1.2,c2[1]+py*1.2]],k);
  g.line(a[0],a[1],b[0],b[1],kl,1);return [Math.round(x1),Math.round(y1)];}
function blade(g,x0,y0,x1,y1,k,kl,kg){const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,px=-uy,py=ux;
  g.poly([[x0+ux*3+px*1.7,y0+uy*3+py*1.7],[x1-ux*3+px*1.7,y1-uy*3+py*1.7],[x1,y1],[x1-ux*3-px*1.7,y1-uy*3-py*1.7],[x0+ux*3-px*1.7,y0+uy*3-py*1.7]],k);
  g.line(x0+ux*4-px*.7,y0+uy*4-py*.7,x1-ux*2-px*.7,y1-uy*2-py*.7,kl);g.line(x0-px*4,y0-py*4,x0+px*4,y0+py*4,kg,2);g.line(x0-ux*3,y0-uy*3,x0,y0,kg,2);return [Math.round(x1),Math.round(y1)];}
Object.assign(MART,{
 // ---- Mossling: a mossy boulder slime with a sprout. Squash and stretch: A wide, B tall; lunge stretches forward and opens its mouth
 mossling(g,f){const F=mfr(f);
  let w=12,h=10,cx=19;if(F.b){w=10.8;h=11.6;}if(F.atk){w=13.4;h=9.2;cx=20.5;}if(F.hit){w=13.6;h=7.8;cx=17.5;}
  const cy=37-h,top=cy-h,my=cy-h*.38;
  sph(g,cx,cy,w,h,'D','d');
  g.px([[cx-w*.55,cy+h*.5],[cx-w*.15,cy+h*.62],[cx+w*.4,cy+h*.64],[cx-w*.75,cy+h*.2]],'r');
  ellIn(g,cx-.5,my-1,w*.98,h*.62,cx,cy,w,h,'m');ellIn(g,cx-w*.2-.5,my-h*.14-1,w*.74,h*.46,cx,cy,w,h,'M');
  [[-.78,2],[-.4,3],[.05,2],[.5,3],[.82,2]].forEach(([o,n])=>g.rect(Math.round(cx+o*w*.86),Math.round(my+h*.4)-1,2,n,'m'));
  const sx=Math.round(cx+1+(F.hit?-3:F.b?1:F.atk?2:0)),sy=Math.round(top+3),lean=F.hit?-2:F.atk?1:0;
  g.line(sx,sy,sx+lean,sy-5,'S');g.poly([[sx+lean,sy-3],[sx+lean-4,sy-5],[sx+lean-1,sy-6]],'M');g.poly([[sx+lean,sy-4],[sx+lean+4,sy-6],[sx+lean+1,sy-7]],'M');
  g.rect(sx+lean-1,sy-8,3,2,'F');g.s(sx+lean,sy-9,'F');g.s(sx+lean,sy-8,'Y');
  const mx=Math.round(cx-w*.64),my2=Math.round(cy-h*.52);
  g.rect(mx,my2,2,3,'W');g.ell(mx+1,my2-.5,3,2,'X');g.px([[mx,my2-1],[mx+2,my2-1]],'W');
  const ex=Math.round(cx+w*.3),ey=Math.round(cy+h*.02);g.ell(ex+3.5,ey+1.6,6,3.6,'f');
  if(F.hit){g.rect(ex,ey+1,3,1,'K');g.rect(ex+5,ey+1,3,1,'K');g.rect(ex+2,ey+4,3,1,'r');}
  else{g.rect(ex,ey,2,2,'K');g.s(ex,ey,'W');g.rect(ex+5,ey,2,2,'K');g.s(ex+5,ey,'W');
   if(F.atk){g.rect(ex,ey+3,8,3,'K');g.rect(ex+1,ey+5,6,1,'F');g.px([[ex+1,ey+3],[ex+6,ey+3]],'W');g.px([[ex+10,ey+2],[ex+11,ey+5],[ex+9,ey+7]],'Y');}
   else g.rect(ex+2,ey+4,3,1,'r');}
  return {pal:{f:'#c9a46a',D:'#a8824e',d:'#6a4e30',r:'#4a361e',M:'#8ccf62',m:'#4a8a3a',S:'#3f7f32',F:'#f08ab0',Y:'#ffe08a',X:'#d8403a',W:'#f4efe0',K:'#1a1020'},flat:'KWFY',a:{x:cx,y:cy,w,h,top,sx,sy,ex,ey}};
 },
 // ---- Dewtoad / Bog Toad family: wide squat toad, eye turret, throat sac. Wide A, tall B; the lunge lashes the tongue
 dewtoad(g,f){const F=mfr(f);
  let bw=13,bh=8,by=29,hx=27,hy=22,sac=1.6;
  if(F.b){bw=12.4;bh=8.9;by=28.1;hx=27;hy=20.8;sac=2.5;}if(F.atk){bw=13.8;bh=7.4;by=29.6;hx=29.4;hy=22.6;sac=.4;}if(F.hit){bw=13.8;bh=7;by=30;hx=25.6;hy=23.8;sac=.8;}
  const bx=F.hit?18:19;
  // hind leg: folded haunch, long foot (pushed out in the lunge)
  if(F.atk){limb(g,10,31,5,36,'b',4,'D');g.rect(2,36,5,1,'D');}
  sph(g,11,by+1,6.5,5.5,'B','b');g.rect(4,35,11,2,'b');g.px([[4,36],[6,36],[8,36]],'D');
  sph(g,bx,by,bw,bh,'B','b');
  g.ell(bx+3,by+3.4,8.5,4,'A');
  limb(g,hx-3,by+2,hx-1,36,'B',3);g.px([[hx-3,36],[hx-1,36],[hx+1,36]],'D');
  g.ell(hx+2.5,hy+5.4,3+sac*.6,sac+.9,'A');
  sph(g,hx,hy,8,6.5,'B','b');
  sph(g,hx-1.5,hy-6,3.7,3.4,'B','b');
  const ex=Math.round(hx-3.5),ey=Math.round(hy-8.5);
  if(F.hit){g.rect(ex,ey+1,4,1,'K');g.rect(ex,ey,4,1,'b');}
  else{g.rect(ex,ey,4,3,'W');g.rect(ex+1,ey+1,2,2,'K');g.s(ex+1,ey+1,'W');if(F.atk)g.rect(ex,ey-1,4,1,'b');}
  if(F.atk){g.poly([[hx+1,hy+2],[hx+9.5,hy-1.5],[hx+9.5,hy+6.5],[hx+1,hy+5]],'K');g.rect(hx+1,hy+4,8,1,'F');g.px([[hx+4,hy+2],[hx+7,hy+1]],'W');
   g.path([[hx+6,hy+4],[hx+9,hy+3]],'T',2);}
  else if(F.hit){g.path([[hx+1,hy+4],[hx+4,hy+3],[hx+7.5,hy+5]],'K');}
  else g.path([[hx+1,hy+3],[hx+4,hy+4],[hx+7.5,hy+2.5]],'K');
  g.ell(bx-7,by-4.5,2.1,1.5,'D');g.ell(bx-1,by-6,1.8,1.3,'D');g.ell(bx+5,by-4,1.6,1.2,'D');g.ell(bx-5,by+1,1.7,1.3,'D');
  [[-9,-4],[-3,-7],[3,-6],[8,-3]].forEach(([ox,oy])=>{g.s(bx+ox,by+oy,'Q');g.s(bx+ox,by+oy-1,'W');});
  return {pal:{B:'#4fa6a4',b:'#2f747c',A:'#cfe8d4',D:'#1f5a72',T:'#e9788a',F:'#e9788a',Q:'#4aa8ff',W:'#f4efe0',K:'#1a1020'},flat:'WKQTF',a:{bx,by,bw,bh,hx,hy,ex,ey}};
 },
 // ---- Cinder Pup: small body, big head, tall pointed ears, flame tail held up. Idle B lifts chest and head; lunge reaches the forelegs and opens the jaws
 cinderpup(g,f){const F=mfr(f),u=F.b?-1:0;
  let hx=27.5,hy=20+u,bx=16.5,by=27+(F.b?-.4:0);if(F.atk){hx=29.5,hy=22,bx=18,by=28;}if(F.hit){hx=25.5,hy=18.5,bx=16,by=27.5;}
  const r=F.atk?3:0,bk=F.atk?-2:0;
  g.path([[bx-8,by-1],[bx-12,by-5],[bx-13,by-10]],'B',3.4);g.path([[bx-7,by+.5],[bx-11,by-3]],'b',1);
  const tx=bx-13,ty=by-10,fl=F.i?[[-2,0],[0,-6],[.8,-3],[3,-8],[4.5,-2.5],[4.5,0]]:[[-3,0],[-2,-6],[-.5,-3],[1.5,-9],[3.5,-3],[4.5,0]];
  g.poly(fl.map(p=>[tx+p[0]+(F.hit?-1:0),ty+p[1]-(F.atk?1:0)]),'C');g.poly([[tx-1,ty],[tx+.5,ty-4],[tx+2,ty]],'R');g.s(tx+.5,ty-1,'Y');
  limb(g,bx-5,by+3,bx-8+bk,36,'b',3,'D');limb(g,bx+3,by+3,bx+3+r,36,'b',3,'D');
  sph(g,bx,by,8.8,5.3,'B','b');sph(g,bx+6.5,by+1,4.8,4.6,'B','b');g.ell(bx+7.5,by+2.2,2.4,2.8,'A');
  g.poly([[bx+4,by-4.5],[hx-3,hy-3.5],[hx+2.5,hy+3.5],[bx+9,by+3]],'B');
  g.px([[bx-3,by-3],[bx+1,by-4],[bx-6,by],[bx+3,by+1]],'b');
  limb(g,bx-4,by+3,bx-3+bk,36,'B',3,'D');limb(g,bx+6,by+3,bx+7+r,36,'B',3,'D');
  if(F.hit)g.poly([[hx+1,hy-4],[hx-3,hy-9],[hx+4,hy-4.5]],'b');else g.poly([[hx+1.5,hy-4.5],[hx+5.5,hy-11],[hx+6,hy-3.5]],'b');
  sph(g,hx,hy,6.2,5.6,'B','b');maw(g,hx+3,hy-1.8,6.4,F.atk?4:0,'B','b');g.ell(hx+4.5,hy+2.8,2.4,1.5,'A');
  if(F.hit){g.poly([[hx-4,hy-3.5],[hx-10,hy-5.5],[hx-3.5,hy]],'B');g.poly([[hx-4,hy-3.5],[hx-8,hy-5],[hx-3.5,hy-1.5]],'R');}
  else{g.poly([[hx-4.5,hy-3.5],[hx-4,hy-12.5],[hx+1.5,hy-4.5]],'B');g.poly([[hx-3.6,hy-4.5],[hx-3.2,hy-9.5],[hx-.2,hy-5]],'R');}
  const ex=Math.round(hx+1.5),ey=Math.round(hy-2.5);
  if(F.hit){g.rect(ex,ey+1,3,1,'K');g.s(ex+3,ey,'K');}else{g.rect(ex,ey,2,2,'E');g.s(ex+1,ey+1,'K');g.s(ex,ey,'W');}
  g.px(F.i?[[tx-1,ty-10],[tx+5,ty-7],[tx+7,ty-12]]:[[tx+1,ty-12],[tx-3,ty-8],[tx+6,ty-9]],'C');
  return {pal:{B:'#d9824c',b:'#a8522e',A:'#f2d9b0',C:'#ffd23a',R:'#ff6a2a',Y:'#fff0b0',E:'#ffc83a',K:'#1a1020',D:'#5a2a14',W:'#ffffff'},flat:'EKCRYW',a:{bx,by,hx,hy,ex,ey,tx,ty}};
 },
 // ---- Frost Wolf: long legged, lean, crystal mane along the back, bushy low tail. Lunge: jaws wide, mane flared
 frostwolf(g,f){const F=mfr(f),u=F.b?-1:0;
  let hx=28,hy=17+u,bx=16.5,by=24+(F.b?-.4:0);if(F.atk){hx=30.5,hy=19.5,bx=18,by=25;}if(F.hit){hx=26,hy=15.5,bx=15.5,by=24.5;}
  const r=F.atk?3:0,bk=F.atk?-2:0;
  g.path([[bx-9,by-1],[bx-13,by+2],[bx-14,by+8]],'B',4);g.ell(bx-14,by+9,2.2,2.6,'A');g.px([[bx-12,by+3],[bx-13,by+5]],'b');
  limb(g,bx-6,by+3,bx-8+bk,36,'b',3,'b');limb(g,bx+4,by+3,bx+4+r,36,'b',3,'b');
  g.rect(Math.round(bx-9+bk),35,4,1,'D');g.rect(Math.round(bx+3+r),35,4,1,'D');
  sph(g,bx,by,11,5.2,'B','b');sph(g,bx+8,by+1,4.6,4.8,'B','b');g.ell(bx+9.5,by+2.4,2.4,3.2,'A');g.px([[bx+10,by+1],[bx+9,by+4],[bx+11,by+5]],'A');
  g.poly([[bx+6,by-4.5],[hx-3,hy-3],[hx+2,hy+3.5],[bx+10,by+3]],'B');
  limb(g,bx-5,by+3,bx-5+bk,36,'B',3);limb(g,bx+7,by+3,bx+8+r,36,'B',3);
  g.px([[bx-5+bk,34],[bx+8+r,34]],'A');g.rect(Math.round(bx-6+bk),36,4,1,'D');g.rect(Math.round(bx+7+r),36,4,1,'D');
  [-7,-3.5,0,3.5,7].forEach((o,n)=>{const x=bx+o,top=by-5.2*Math.sqrt(1-(o/11)**2),hh=[4.5,6,7,6.5,5][n]+(F.hit?-2:F.atk?1:0)+(F.i&&n%2?1:0);
   g.poly([[x-2,top+1.8],[x+.5+(F.atk?-1.5:0)+(F.hit?-2:0),top-hh],[x+2.5,top+1.8]],'c');g.poly([[x-1.2,top+1.5],[x+.3+(F.atk?-1.2:0)+(F.hit?-1.5:0),top-hh+1],[x+.8,top+1.5]],'C');});
  if(F.hit)g.poly([[hx+1,hy-3.5],[hx-4,hy-7],[hx+4,hy-4]],'b');else g.poly([[hx+1,hy-3.5],[hx+4,hy-9],[hx+5.5,hy-3.5]],'b');
  sph(g,hx,hy,5.9,5.1,'B','b');maw(g,hx+3,hy-1.8,6.4,F.atk?4:0,'B','b');g.ell(hx+5,hy+2.2,2.8,1.2,'A');
  g.poly([[hx+.5,hy+3.5],[hx+3,hy+7.5],[hx+5.5,hy+3.5]],'A');
  if(F.hit){g.poly([[hx-3.5,hy-3],[hx-9.5,hy-4],[hx-3,hy+.5]],'B');g.poly([[hx-3.5,hy-3],[hx-7.5,hy-3.5],[hx-3,hy-1]],'c');}
  else{g.poly([[hx-3.5,hy-3],[hx-3,hy-10],[hx+1,hy-3.5]],'B');g.poly([[hx-2.6,hy-4],[hx-2.4,hy-8],[hx,hy-4]],'c');}
  const ex=Math.round(hx+1.5),ey=Math.round(hy-1.8);
  if(F.hit){g.rect(ex,ey+1,3,1,'K');}else{g.rect(ex,ey,2,2,'E');g.s(ex+1,ey+1,'K');g.s(ex,ey,'W');}
  return {pal:{B:'#d4e2ec',b:'#9ab4c8',A:'#ffffff',C:'#cfeeff',c:'#7fbcdc',E:'#3ad0ff',K:'#1a1020',W:'#ffffff',D:'#6a7e92',R:'#c0586a'},flat:'EKWC',a:{bx,by,hx,hy,ex,ey}};
 },
 // ---- Brine Crawler: wide and low, six legs in near and far pairs, eyestalks, two claws forward. Idle B shifts every other leg; lunge thrusts the claws open
 crawler(g,f){const F=mfr(f),u=F.b?-1:0;
  let bx=18,by=28.5+u,r=0,cy=0;if(F.atk){bx=19,by=29.5,r=3;}if(F.hit){bx=17,by=30,r=-3,cy=3;}
  const leg=(x,d,k,n)=>{const o=F.b&&n%2?1:0,kx=x+d*4,ky=by+.5,fx=x+d*7+o;limb(g,x,by+2.5,kx,ky,k,2);limb(g,kx,ky,fx,36,k,2);g.rect(Math.round(fx)-1,36,3,1,'D');};
  leg(bx-7,-1,'b',0);leg(bx+3,1,'b',1);leg(bx+8,1,'b',2);
  sph(g,bx,by,11,6,'B','b');g.ell(bx+.5,by+3.4,8.5,2.4,'A');
  g.poly([[bx-10.5,by-1],[bx-14,by-4.5],[bx-9.5,by-3.5]],'B');
  g.px([[bx-8,by-3],[bx-3,by-5],[bx+2,by-5],[bx-5,by-.5],[bx+4,by-.5]],'b');g.px([[bx-6,by-2],[bx,by-3],[bx+5,by-2]],'A');
  leg(bx-9,-1,'B',1);leg(bx-4,-1,'B',2);leg(bx+6,1,'B',0);
  const sh=F.hit?2:5;[[bx+3,0],[bx+6.5,1]].forEach(([x,d])=>{x=Math.round(x);g.line(x,by-5,x,by-5-sh+d,'b',1);const ey=by-7-sh+d;
   if(F.hit)g.rect(x-1,ey+1,3,1,'K');else{g.rect(x-1,ey,2,2,'K');g.s(x-1,ey,'W');}});
  const qx=Math.round(bx+12+r*.7),qy=Math.round(by-9+(F.b?-1:0)+cy*.6),op=F.atk?3.4:F.hit?0:1.4;
  const claw=(x,y,s,K,k,o)=>{g.poly([[x+1,y-1.5*s],[x+7*s,y-1.6*s-o],[x+7*s,y-.2*s-o*.7],[x+2*s,y+.9*s]],K);g.poly([[x+1,y+1.2*s],[x+7*s,y+1.3*s+o*.3],[x+6*s,y+3.2*s+o*.3],[x+1,y+3.4*s]],k);sph(g,x,y+1.2*s,3.6*s,3*s,K,k);};
  g.path([[bx+9,by+1],[qx-5,qy+8]],'b',2);claw(qx-7,qy+8,.8,'b','b',op*.5);
  g.path([[bx+8,by-1],[bx+10+r*.3,by-5+cy*.4],[qx-1,qy+2]],'B',3);
  claw(qx,qy,1.1,'B','b',op);
  g.px([[qx+8,qy-2-op],[qx+8,qy+2]],'A');
  return {pal:{B:'#3d86b8',b:'#25587f',A:'#a8e0f0',W:'#f4efe0',K:'#1a1020',D:'#173a58'},flat:'WK',a:{bx,by,qx,qy}};
 },
 // ---- Shellguard: domed plated shell with bone spikes, stout legs, a long neck. Idle B lifts the shell and the head; lunge stretches the neck and bites; a hit pulls the head in
 shellguard(g,f){const F=mfr(f);
  let cx=15.5,cy=22.5,hx=31.5,hy=24,r=0;if(F.b){cy=21.5;hy=23;}if(F.atk){cx=16.5;hx=34.2;hy=24.6;r=2;}if(F.hit){cx=14.8;cy=23;hx=28.3;hy=25.6;r=-1;}
  // head and neck first: the shell closes over the back of the neck
  sph(g,hx-3.4,hy+1.4,4.2,3.6,'X','x');sph(g,hx,hy,4.6,4,'X','x');g.poly([[hx+3,hy-1.5],[hx+7,hy+.5],[hx+6.5,hy+3.2],[hx+3,hy+3.5]],'X');
  const ex=Math.round(hx+1.5),ey=Math.round(hy-2);
  if(F.hit){g.rect(ex,ey+1,3,1,'K');}else{g.rect(ex,ey,2,2,'K');g.s(ex,ey,'W');g.rect(ex-1,ey-1,4,1,'x');}
  if(F.atk){g.poly([[hx+2,hy+1],[hx+8,hy-.5],[hx+8,hy+5.5],[hx+2.5,hy+4.5]],'K');g.rect(hx+3,hy+4,5,1,'F');g.px([[hx+4,hy+1],[hx+7,hy+.5],[hx+5,hy+4]],'W');}
  else g.path([[hx+3,hy+2.6],[hx+6.5,hy+2.2]],'K');
  g.poly([[cx-12.5,27],[cx-16,30],[cx-12,30.5]],'X');
  // shell
  sph(g,cx,cy,13.5,10.8,'B','b');clr(g,0,29,40,10);
  g.path([[cx-7,cy-7],[cx-5.5,cy+1],[cx-6.5,cy+6]],'r');g.path([[cx-.5,cy-10],[cx+.5,cy-2],[cx-1.5,cy+6]],'r');g.path([[cx+7,cy-6],[cx+5.5,cy+1],[cx+6.5,cy+6]],'r');
  g.path([[cx-11,cy-1],[cx-5.5,cy+1]],'r');g.path([[cx+.5,cy-2],[cx+5.5,cy+1],[cx+11,cy]],'r');g.path([[cx-4,cy-8],[cx+.5,cy-6],[cx+6,cy-6]],'r');
  g.ell(cx-4,cy-4,2.2,1.5,'M');g.ell(cx+3.5,cy+3,1.8,1.3,'M');g.ell(cx-8.5,cy+4,1.6,1.1,'M');g.px([[cx+9,cy-3],[cx+10,cy+3]],'L');
  [-6,0,6].forEach((o,n)=>{const x=cx+o,top=cy-10.8*Math.sqrt(1-(o/13.5)**2),hh=[4,5.5,4.5][n];g.poly([[x-2.2,top+1.8],[x+.2,top-hh],[x+2.4,top+1.8]],'w');g.poly([[x-1.4,top+1.6],[x,top-hh+1],[x+.6,top+1.6]],'W');});
  g.rect(Math.round(cx-12),28,25,2,'A');g.rect(Math.round(cx-12),30,25,1,'a');
  // legs (far pair dark), drawn over the rim
  [[cx-5,'x'],[cx+8+r,'x']].forEach(([x,k])=>{g.rect(Math.round(x),30,5,6,k);g.rect(Math.round(x)-1,35,7,2,k);});
  [[cx-10,0],[cx+5+r,r]].forEach(([x])=>{x=Math.round(x);g.rect(x,29,6,8,'x');g.rect(x,29,4,7,'X');g.rect(x-1,35,8,2,'x');g.rect(x-1,35,4,1,'X');g.px([[x,36],[x+3,36],[x+6,36]],'W');});
  return {pal:{B:'#9a8a54',b:'#5e5230',r:'#43391f',L:'#c2ae72',A:'#d8c890',a:'#a89a64',M:'#6aa04a',W:'#f2ecd6',w:'#b8b098',X:'#4f9c8c',x:'#2f6a62',F:'#e9788a',K:'#1a1020'},flat:'KWF',a:{cx,cy,hx,hy,top:cy-10.8}};
 },
 // ---- Magma Slime: an obsidian crust with a molten crater and glowing cracks. Idle A wide, B tall with a rising bubble; lunge stretches forward and erupts; a hit squashes it and flashes the cracks
 magmaslime(g,f){const F=mfr(f);
  let w=12.5,h=9.5,cx=19;if(F.b){w=11.2;h=11;}if(F.atk){w=13.6;h=8.6;cx=20.5;}if(F.hit){w=14;h=7.2;cx=18;}
  const cy=37-h,ty=cy-h+1,hot=F.hit?'W':'Y';
  sph(g,cx,cy,w,h,'B','b');
  g.px([[cx-8,cy-2],[cx-6,cy+4],[cx+6,cy+5],[cx+8,cy-3],[cx-3,cy+7]],'n');
  if(F.atk){g.poly([[cx-4,ty+2],[cx-5.5,ty-5],[cx-2,ty-1],[cx-.5,ty-8],[cx+2,ty-1],[cx+5,ty-5],[cx+4.5,ty+2]],'C');g.poly([[cx-2,ty+1],[cx-.5,ty-4],[cx+1.5,ty+1]],'Y');}
  g.ell(cx-1,ty+2,w*.55,3.1,'b');g.ell(cx-1,ty+2,w*.46,2.3,'C');g.ell(cx-1.5,ty+2,w*.28,1.3,hot);
  g.path([[cx-3,ty+4],[cx-5,cy-1],[cx-4,cy+3],[cx-7,cy+7]],F.atk||F.hit?'Y':'C');g.path([[cx+1,ty+4],[cx+2.5,cy-1],[cx+1,cy+4],[cx+3,cy+7]],F.atk||F.hit?'Y':'C');
  g.path([[cx+.5,cy+3],[cx+1,cy+8]],'R');g.px([[cx-5,cy-1],[cx+2,cy-1]],hot);
  g.rect(Math.round(cx-w*.5),Math.round(cy+h*.5),2,3,'R');g.s(Math.round(cx-w*.5),Math.round(cy+h*.5)+3,'C');
  const ex=Math.round(cx+w*.34),ey=Math.round(cy-.5);
  if(F.hit){g.rect(ex,ey+1,3,1,'W');g.rect(ex+5,ey+1,3,1,'W');}
  else{g.rect(ex,ey,2,2,'Y');g.s(ex,ey,'W');g.rect(ex+5,ey,2,2,'Y');g.s(ex+5,ey,'W');}
  if(F.atk){g.rect(ex-1,ey+3,9,3,'C');g.rect(ex,ey+4,7,1,'Y');g.px([[ex+1,ey+3],[ex+6,ey+3]],'K');}
  g.px(F.i?[[cx+1,ty-2],[cx+4,ty-5],[cx-5,ty-3]]:[[cx-2,ty-1],[cx+3,ty-3]],'Y');
  return {pal:{B:'#5a4e68',b:'#2e2538',n:'#6e6280',C:'#ff8a3a',R:'#e0501a',Y:'#ffe08a',W:'#ffffff',K:'#1a1020'},flat:'CRYWK',a:{cx,cy,w,h,ty}};
 }
});
['mossling','dewtoad','cinderpup','frostwolf','crawler','shellguard','magmaslime'].forEach(n=>{MART[n].fr=1;});
// FAMILY1-END
// FAMILY2-BEGIN
// =================== FAMILY 2 (v0.13 art pass): gull, thunderhawk, cave bat, cloud ray, tide wisp, ash wraith, eclipse wraith ===================
// Flyers show both wings (far wing dark, near wing lit) with a span wider than the body; the ray undulates; wisps and wraiths carry a flat glow core
// and trailing tendrils, wraiths one prop. All frames come from f (idle A/B, atk, hit); variants add a shape through SHP in realms.js.
Object.assign(MART,{
 // ---- Glass Gull: white seabird, wings in a V (idle A up, B spread level), lunge dives beak open with talons out, a hit throws the wings down
 gull(g,f){const F=mfr(f);
  let bx=17,by=24,hx=27,hy=18.5,nT=[7,4],fT=[30,3],op=0;
  if(F.b){by=24.8;hy=19.3;nT=[2,14];fT=[37,11];}
  if(F.atk){bx=18;by=23;hx=29.5;hy=21.5;nT=[2,8];fT=[17,2];op=1;}
  if(F.hit){bx=15;by=25;hx=24;hy=20;nT=[3,26];fT=[34,22];}
  const nS=[bx-1,by-4],fS=[bx+4,by-5];
  wing(g,fS,fT,8,'m','l',4,3);
  g.poly([[bx-7,by-2.5],[bx-16,by-.5],[bx-15.5,by+3],[bx-7,by+3]],'b');g.px([[bx-16,by+1],[bx-15,by+2],[bx-14,by+3]],'K');
  if(F.atk){limb(g,bx+5,by+4,bx+11,by+9,'F',1);g.px([[bx+12,by+9],[bx+12,by+10],[bx+10,by+10]],'K');}
  else if(F.hit){limb(g,bx+1,by+5,bx,by+9,'F',1);limb(g,bx+4,by+5,bx+5,by+9,'F',1);}
  else g.px([[bx+1,by+6],[bx+1,by+7],[bx+4,by+6],[bx+4,by+7]],'F');
  sph(g,bx,by,9.6,5.6,'B','b');g.ell(bx+1.5,by+3.2,7,2.3,'A');
  sph(g,hx,hy,4.4,4.1,'B','b');
  if(op){g.poly([[hx+3,hy-1.6],[hx+8.8,hy-.2],[hx+3,hy+.6]],'G');g.poly([[hx+3,hy+.4],[hx+8,hy+.8],[hx+3,hy+3.6]],'K');g.rect(Math.round(hx+4),Math.round(hy+2.6),3,1,'R');g.poly([[hx+3,hy+3],[hx+7.5,hy+4.6],[hx+3,hy+4.4]],'G');}
  else{g.poly([[hx+3.2,hy-1.4],[hx+10,hy+.8],[hx+3.4,hy+2.4]],'G');g.px([[hx+9,hy+1],[hx+9,hy+2]],'R');}
  const ex=Math.round(hx+.5),ey=Math.round(hy-2.6);
  if(F.hit){g.rect(ex,ey+1,3,1,'K');}else{g.rect(ex,ey,2,2,'K');g.s(ex,ey,'W');}
  const tips=wing(g,nS,nT,10,'M','L',4,3);tips.slice(0,3).forEach(t=>g.s(Math.round(t[0]),Math.round(t[1]),'K'));
  if(F.hit)g.px([[bx-12,by-8],[bx+10,by-9],[bx+6,by-12]],'W');
  return {pal:{B:'#eef2f6',b:'#a8bed4',A:'#ffffff',M:'#8fb0d0',L:'#d4e6f6',m:'#5c7a9c',l:'#7d9cc0',G:'#ffb83d',R:'#e0506a',F:'#e8863a',K:'#1a1020',W:'#ffffff'},flat:'KWGRF',a:{bx,by,hx,hy,tx:bx-15,ty:by+1,nT,fT,sx:nS[0],sy:nS[1]}};
 },
 // ---- Thunder Hawk: gold raptor, crest of three blades, hooked steel beak, blue lightning on the pinions. Same poses as the gull, harder edges
 thunderhawk(g,f){const F=mfr(f);
  let bx=17,by=23,hx=28,hy=18,nT=[6,2],fT=[28,1],op=0;
  if(F.b){by=23.8;hy=18.8;nT=[1,15];fT=[37,10];}
  if(F.atk){bx=17.5;by=22.5;hx=29.5;hy=21;nT=[2,8];fT=[18,2];op=1;}
  if(F.hit){bx=15;by=24;hx=25;hy=19.5;nT=[2,27];fT=[34,23];}
  const nS=[bx-1,by-4],fS=[bx+4,by-5];
  wing(g,fS,fT,9,'m','l',5,3.2);
  [[-16,-3,'m'],[-17,1,'b'],[-15,5,'m']].forEach(([dx,dy,k])=>{g.poly([[bx-6,by-1.5],[bx+dx,by+dy-1],[bx+dx+1,by+dy+1.5],[bx-6,by+2]],k);g.s(bx+dx,by+dy,'C');});
  if(F.atk){limb(g,bx+5,by+4,bx+12,by+9,'K',1);g.px([[bx+13,by+10],[bx+12,by+10],[bx+11,by+10]],'K');limb(g,bx+3,by+4,bx+9,by+10,'K',1);}
  else if(F.hit){limb(g,bx+1,by+5,bx-1,by+9,'K',1);limb(g,bx+4,by+5,bx+5,by+9,'K',1);}
  else g.px([[bx+1,by+6],[bx+1,by+7],[bx+4,by+6],[bx+4,by+7],[bx,by+8],[bx+3,by+8]],'K');
  sph(g,bx,by,10.4,6,'B','b');g.ell(bx+2,by+3.4,7,2.4,'A');g.poly([[bx+4,by-5],[bx+9,by-3],[bx+7,by-1]],'M');
  sph(g,hx,hy,4.6,4.3,'B','b');
  g.poly([[hx-2,hy-3.5],[hx-6,hy-11],[hx-.5,hy-5]],'B');g.poly([[hx-.5,hy-4],[hx-1.5,hy-12],[hx+2.5,hy-4]],'M');g.poly([[hx+2,hy-3.5],[hx+4,hy-10],[hx+5.5,hy-2.5]],'b');
  if(op){g.poly([[hx+3.4,hy-2],[hx+9.5,hy-.4],[hx+8.5,hy+1],[hx+3.4,hy+.6]],'S');g.poly([[hx+3.2,hy+.6],[hx+8,hy+1.2],[hx+3,hy+3.8]],'K');g.rect(Math.round(hx+4),Math.round(hy+2.6),3,1,'R');g.poly([[hx+3,hy+3],[hx+7.5,hy+4.4],[hx+3,hy+4.8]],'S');}
  else{g.poly([[hx+3.4,hy-2],[hx+10,hy+.4],[hx+9.4,hy+2.6],[hx+7,hy+1.6],[hx+3.4,hy+2.8]],'S');}
  const ex=Math.round(hx+1),ey=Math.round(hy-2);
  if(F.hit)g.rect(ex,ey+1,3,1,'K');else{g.rect(ex,ey,2,2,'E');g.s(ex,ey,'W');g.rect(ex-1,ey-1,4,1,'K');}
  const tips=wing(g,nS,nT,11,'M','L',5,3.2);tips.slice(0,3).forEach(t=>g.s(Math.round(t[0]),Math.round(t[1]),'C'));
  return {pal:{B:'#f2c93a',b:'#a8822a',A:'#fff2b8',M:'#c4902a',L:'#ffe27a',m:'#7a5a1a',l:'#b08a2a',S:'#7a8398',K:'#2a2a3a',E:'#3ad0ff',C:'#3ad0ff',R:'#e0506a',W:'#ffffff'},flat:'KECRW',a:{bx,by,hx,hy,tx:bx-14,ty:by+2,nT,fT,sx:nS[0],sy:nS[1]}};
 },
 // ---- Cave Bat: front view, the span is three times the body. Wings up on A, down on B; the lunge flares the wings and opens the jaw; a hit folds them in
 cavebat(g,f){const F=mfr(f);
  let wy=0,sp=0,hy=14,by=24,op=0;
  if(F.b){wy=7;}if(F.atk){wy=-3;sp=0;hy=16;by=25;op=1;}if(F.hit){wy=5;sp=-6;by=25;hy=15;}
  const side=s=>{const cl=s<0,k=cl?'M':'m',kb=cl?'O':'o',W=[20+s*(10+sp),9+wy],A=[20+s*(18+sp),15+wy*1.1],Bt=[20+s*(14+sp),25+wy*.9],C=[20+s*(9),28+wy*.5];
   const n1=lerp2(A,Bt,.5),n2=lerp2(Bt,C,.5),sh=[20+s*3,17];
   [n1,n2].forEach(n=>{n[0]+=(20-n[0])*.25;n[1]-=2;});
   g.poly([sh,W,A,n1,Bt,n2,C,[20+s*3,25]],k);g.path([sh,W],kb,2);[A,Bt,C].forEach(t=>g.line(W[0],W[1],t[0],t[1],kb,1));g.px([[W[0],W[1]-1]],'D');};
  side(1);side(-1);
  sph(g,20,by,5.2,6.4,'B','b');g.ell(20.5,by+1.5,3,3.8,'A');g.px([[18,by+7],[22,by+7]],'D');
  g.poly([[16,hy-2],[14.5,hy-11],[19.5,hy-4]],'B');g.poly([[24,hy-2],[26,hy-11],[20.5,hy-4]],'b');g.poly([[16.4,hy-3],[15.6,hy-8],[18.4,hy-4]],'R');g.poly([[23.6,hy-3],[24.6,hy-8],[21.6,hy-4]],'r');
  sph(g,20,hy,4.8,4.4,'B','b');g.ell(20.5,hy+2,2.6,1.8,'A');
  if(F.hit){g.rect(17,hy-1,2,1,'K');g.rect(22,hy-1,2,1,'K');}
  else{g.rect(17,hy-1,1,2,'E');g.rect(23,hy-1,1,2,'E');g.s(17,hy-1,'W');}
  if(op){g.rect(18,hy+2,5,3,'K');g.rect(19,hy+4,3,1,'R');g.px([[18,hy+2],[22,hy+2],[19,hy+4]],'W');}
  else g.px([[19,hy+3],[21,hy+3]],'W');
  return {pal:{B:'#6a5a7c',b:'#3a2e50',A:'#9a8ab0',M:'#7a4a7a',m:'#3e2646',O:'#c08ab8',o:'#6a3e6a',R:'#c86a8a',r:'#8a4a6a',E:'#ff5050',W:'#ffffff',D:'#241a2c',K:'#140a1a'},flat:'EWK',a:{hx:20,hy,by,wy,sp}};
 },
 // ---- Cloud Ray: the wing is the body. A wave runs through the fins (idle A and B in opposite phase), the head leads, a long tail streams behind and whips over the back in the lunge
 cloudray(g,f){const F=mfr(f);
  let ph=F.i?3.14:0,amp=2.4,cy=22,sq=1,x0=9,x1=33;
  if(F.atk){amp=3.4;ph=1.6;cy=24;x0=10;x1=34;}if(F.hit){amp=.7;ph=0;sq=.7;cy=25;x0=8;x1=32;}
  const prof=u=>Math.pow(u<.4?u/.4:(1-u)/.6,.85),wv=u=>Math.sin(u*5.2+ph)*amp*prof(u),L=x1-x0;
  const tail=[];for(let i=0;i<=6;i++){const u=i/6;tail.push(F.atk?[[x0,cy],[x0-3,cy-3],[x0-5,cy-8],[x0-2,cy-13],[x0+4,cy-15],[x0+9,cy-14],[x0+11,cy-11]][Math.min(i,6)]:[x0-u*(x0-1.5),cy+1+u*8+Math.sin(u*5+ph)*2.4]);}
  g.path(tail,'b',2);const te=tail[6];
  if(F.atk)g.poly([[te[0]-1,te[1]-3],[te[0]+3,te[1]+4],[te[0]+1.5,te[1]-1]],'K');else g.ell(te[0],te[1],1.6,1.4,'C');
  const edge=[];
  for(let x=x0;x<=x1;x++){const u=(x-x0)/L,h=prof(u),w=wv(u),top=Math.round(cy-8.8*h*sq+w),bot=Math.round(cy+6*h*sq+w),mid=top+(bot-top)*.5;edge.push([x,top,bot]);
   for(let y=top;y<=bot;y++)g.s(x,y,y>=bot&&bot-top>2?'A':y<=top+1&&u<.7?'L':y<mid?'B':'b');}
  [[.2,.4],[.34,.25],[.5,.5],[.62,.34],[.3,.7],[.46,.78]].forEach(([u,v])=>{const e=edge[Math.round(u*L)];if(e)g.s(e[0],Math.round(e[1]+(e[2]-e[1])*v),'d');});
  const hx=x1+.5,hy=cy-1+wv(.96);
  sph(g,hx,hy,3.6,3.2*sq+.4,'B','b');g.poly([[hx+2,hy-2],[hx+4.5,hy-4.5],[hx+4,hy-.5]],'b');g.poly([[hx+1.5,hy+2],[hx+4.5,hy+3.5],[hx+3.5,hy+.5]],'b');
  const ex=Math.round(hx-.5),ey=Math.round(hy-2);
  if(F.hit)g.rect(ex,ey+1,3,1,'K');else{g.rect(ex,ey,2,2,'K');g.s(ex,ey,'W');}
  g.px(F.atk?[[Math.round(hx+1),Math.round(hy+2)],[Math.round(hx+3),Math.round(hy+3)]]:[[Math.round(hx+1),Math.round(hy+2.5)]],'K');
  const dx=F.i?1:0;[[14+dx,cy+11,2.6],[27-dx,cy+9,2.4],[20+dx,cy+13,1.6]].forEach(([x,y,r])=>{if(y<37)g.ell(x,y,r,r*.4+.5,'C');});
  if(F.hit)g.px([[16,cy-12],[24,cy-13]],'C');
  return {pal:{B:'#62c4b2',b:'#36807f',A:'#d4f6ee',L:'#9ae6d4',d:'#2a6a68',K:'#10241f',W:'#ffffff',C:'#eafffa'},flat:'KWC',a:{cx:21,cy,hx,hy,x0,x1,L,edge}};
 },
 // ---- Tide Wisp: a glass bell with one flat glow core and an eye in it, five tendrils with bright beads; the lunge throws a bolt, a hit flattens the bell and flashes the core
 tidewisp(g,f){const F=mfr(f);
  let cx=19,cy=13,rx=11,ry=9,ph=F.i?3.14:0,spread=0;
  if(F.b){rx=10;ry=10;}if(F.atk){cx=18;rx=11.5;ry=7.8;}if(F.hit){rx=12.5;ry=6.5;cx=18;spread=3;ph=2;}
  const by=Math.round(cy+ry*.55),tp=[];
  sph(g,cx,cy,rx,ry,'A','B');g.ell(cx-rx*.35,cy-ry*.5,rx*.38,ry*.22,'W');clr(g,0,by,40,40);
  for(let x=Math.round(cx-rx+1);x<=cx+rx-1;x++){g.s(x,by-1,'b');if((x+F.i)%2===0)g.s(x,by,'b');}
  for(let n=0;n<5;n++){const x=cx-8+n*4,t=tend(g,x,by,13+(n%2?3:0)+(F.b?2:0),2.2,ph+n*1.3,'T',2,(n-2)*spread*.7+(F.atk?-3:0));tp.push(t);g.s(Math.round(t[0]),Math.round(t[1]),'C');g.s(Math.round(t[0]),Math.round(t[1])-3,'C');}
  const kx=Math.round(cx+1),ky=Math.round(cy+1);
  g.ell(kx,ky,5.8,4.4,'Y');g.ell(kx,ky,4.2,3,F.hit?'W':'G');
  if(F.hit)g.rect(kx-2,ky,3,1,'K');else{g.rect(kx,ky-1,2,2,'K');g.s(kx,ky-1,'W');}
  if(F.atk){g.poly([[cx+rx-1,cy-5],[cx+rx+4,cy-6],[cx+rx+2.5,cy-2.5],[cx+rx+7,cy-3],[cx+rx+1,cy+4],[cx+rx+2.5,cy-.5],[cx+rx-1,cy-1]],'Y');g.px([[cx+rx+1,cy-4],[cx+rx+3,cy-4]],'W');}
  return {pal:{B:'#7ab8f0',A:'#b8dcff',b:'#4a7ac8',T:'#4a7ac8',K:'#1a1040',W:'#ffffff',Y:'#fff09a',G:'#fffbe0',C:'#f2e04a'},flat:'KWYGC',glow:'#b8e0ff',a:{cx,cy,rx,ry,by,kx,ky,tp}};
 },
 // ---- Ash Wraith: a tattered hooded cloak that tapers to ribbons, an ember core in the chest, a staff with a hanging lantern. Lunge: leans in, lantern thrust; hit: reels back
 ashwraith(g,f){const F=mfr(f);
  let lean=0,sw=F.i?1:0,rise=F.b?-1:0;if(F.atk)lean=2;if(F.hit)lean=-3;
  const hx=21+lean,hy=11+rise,cx=20+lean*.4;
  const body=(k,l,r)=>g.poly([[hx-1,4+rise],[hx+7,8+rise],[30+lean*.5,19],[28,28],[26+sw,36],[24,33],[21-sw,39],[18,34],[15+sw,38],[13,31],[10,23],[11+lean*.4,15],[hx-7,8+rise]],k);
  body('b');g.poly([[hx-1,4+rise],[hx-7,8+rise],[11+lean*.4,15],[10,23],[13,31],[15+sw,38],[18,34],[20,20],[hx+1,9+rise]],'B');
  g.ell(hx,hy+.5,5,5.4,'K');g.rect(hx-3,hy-1,1,2,'E');g.rect(hx+2,hy-1,1,2,'E');g.s(hx-3,hy-1,'W');
  g.px([[hx-1,hy+3],[hx+1,hy+3]],'q');
  const kx=Math.round(cx),ky=24;g.ell(kx,ky,3.8+(F.atk?1:0),4.4+(F.atk?1:0),F.hit?'W':'R');g.ell(kx,ky,2,2.6,F.hit?'W':'Y');
  [[14,31],[20,35],[26,32]].forEach(([x,y],n)=>tend(g,x,y+2,4,1.6,sw*2+n,'b',2,(n-1)*(F.hit?2:0)));
  const sx=30+(F.atk?1:F.hit?-2:0);
  g.path([[27+lean,16],[sx-1,20]],'b',3.4);g.ell(sx,21,1.8,1.6,'H');
  g.line(sx,7,sx,37,'S',2);g.path([[sx,8],[sx,5],[sx+2,3.5],[sx+4,5]],'S',1.5);
  const lx=sx+2+(F.i?1:0)+(F.atk?1:0),ly=7+(F.hit?2:0);g.px([[sx+4,5],[sx+4,6]],'n');
  g.rect(lx,ly,5,6,'N');g.rect(lx,ly,5,1,'n');g.rect(lx,ly+5,5,1,'n');g.rect(lx+1,ly+1,3,4,'L');g.s(lx+2,ly+2,'Y');
  g.px(F.i?[[8,15],[34,9],[9,28],[36,22]]:[[8,14],[34,10],[10,27],[36,23]],'Y');
  return {pal:{B:'#5a4e52',b:'#352c32',q:'#2a2024',K:'#0e0c12',E:'#8aeaff',W:'#ffffff',R:'#ff8a3a',Y:'#ffe08a',H:'#d8cfc0',S:'#6a4a2a',N:'#8a7a6a',n:'#4a4038',L:'#ffb040'},flat:'KEWRYL',a:{hx,hy,cx,top:4+rise,lean,sx,lx,ly,by:34}};
 },
 // ---- Eclipse Wraith: a cloak split into a night half and a day half, a halo above the hood, an eclipse in the chest, a scythe. Same poses as the ash wraith
 eclipsewraith(g,f){const F=mfr(f);
  let lean=0,sw=F.i?1:0,rise=F.b?-1:0;if(F.atk)lean=2;if(F.hit)lean=-3;
  const hx=20+lean,hy=12+rise,cx=20+lean*.4;
  const shape=()=>[[hx,6+rise],[hx+7,10+rise],[29+lean*.4,22],[27,32],[28,36+sw],[24,34],[20,38-sw],[16,34],[12,36+sw],[13,32],[11,22],[hx-7,10+rise]];
  g.poly(shape(),'P');g.poly([[hx,6+rise],[hx-7,10+rise],[11,22],[13,32],[12,36+sw],[16,34],[20,38-sw],[hx,20]],'D');
  g.poly([[hx,6+rise],[hx+7,10+rise],[29+lean*.4,22],[hx+2,22],[hx,11]],'L');
  g.path([[hx+1,22],[hx+1,36]],'d');g.px([[13,26],[15,31],[12,33]],'V');g.px([[26,26],[28,31],[24,33]],'p');
  g.ell(hx+.5,hy+.5,4.6,4.6,'K');g.rect(hx-2,hy,1,2,'E');g.rect(hx+2,hy,1,2,'F');g.s(hx-2,hy,'W');
  g.ell(hx,4.4+rise,6.6,2,'G');g.ell(hx,4.4+rise,4.8,.9,0);
  const kx=Math.round(cx),ky=24,gr=F.atk?1:0;g.ell(kx,ky,4.8+gr,4.8+gr,F.hit?'W':'C');g.ell(kx,ky,3,3,'K');
  [[14,34],[20,37],[26,34]].forEach(([x,y],n)=>tend(g,x,y+1,3,1.4,sw*2+n,n===0?'D':n===1?'d':'p',2,(n-1)*(F.hit?2:0)));
  const sx=30+(F.atk?1:F.hit?-2:0),ty=F.hit?9:7;
  g.path([[27+lean,16],[sx-1,20]],'d',3.4);g.ell(sx,21,1.8,1.6,'H');
  g.line(sx,ty,sx,37,'S',2);
  g.poly([[sx-1,ty+1],[sx+2,ty-3],[sx+5.5,ty-2],[sx+7,ty+3],[sx+6,ty+8],[sx+5,ty+3],[sx+3,ty+1]],'N');g.path([[sx+2,ty-2],[sx+5.5,ty-1],[sx+6,ty+4]],'W',1);
  g.px(F.i?[[7,12],[33,16],[6,28]]:[[7,13],[33,15],[6,27]],'C');
  return {pal:{D:'#3a2a60',d:'#241a40',V:'#8a6ad0',P:'#d8d0f0',L:'#f4f0ff',p:'#a89cd0',K:'#0c0818',E:'#b48aff',F:'#fff0a0',W:'#ffffff',G:'#f0d060',C:'#fff0a0',S:'#5a4a38',N:'#b8c0d0',H:'#d8cfc0'},flat:'KEFWGC',glow:'#d8c8ff',a:{hx,hy,cx,top:6+rise,lean,sx,ty,by:36}};
 }
});
['gull','thunderhawk','cavebat','cloudray','tidewisp','ashwraith','eclipsewraith'].forEach(n=>{MART[n].fr=1;});
// FAMILY2-END
// FAMILY3-BEGIN
// =================== FAMILY 3 (v0.13 art pass): slag golem, icebound knight, husk watcher (barrow bones is in monsters2.js) ===================
// Blocky and plated, facing right. The upper body is one block that shifts: idle B breathes it 1px, the lunge (atk) pushes it 2px forward with the
// dominant mass stretched (the slam fist, the sword or spear thrust), a hit throws it 2px back with the core or visor flashing white (W).
// Variants add a shape through SHP in realms.js (anchors a: head hx,hy,top; core cx,cy; by = feet).
Object.assign(MART,{
 // ---- Slag Golem: tall and top-heavy, a small head sunk between huge pauldrons, a molten core with cracks, one giant slag fist (slams down in the lunge)
 slaggolem(g,f){const F=mfr(f);
  let L=0,dy=F.b?-1:0,fx=34,fy=29,fr=5;
  if(F.atk){L=2;dy=1;fx=35;fy=32;fr=5.6;}
  if(F.hit){L=-2;dy=1;}
  const lg=F.atk?1:0,hx=20+L,cx=20+L,cy=21+dy,H=L/2;
  slab(g,5+L,16+dy,5,12,'r','d');sph(g,7.5+L,29,3.8,3.2,'r','d');
  slab(g,12-lg,29,6,7,'R','r');slab(g,22+lg,29,6,7,'R','r');slab(g,11-lg,35,8,3,'R','d');slab(g,21+lg,35,8,3,'R','d');
  slab(g,12,26,17,4,'r','d');
  g.poly([[10+L,14+dy],[30+L,14+dy],[28+L,28],[13+H,28]],'r');g.poly([[10+L,14+dy],[29+L,14+dy],[27+L,23],[12+L,24]],'R');
  g.rect(13+H,26,15,1,'d');
  slab(g,5+L,11+dy,10,8,'R','r');slab(g,25+L,11+dy,10,8,'R','r');g.px([[7+L,13+dy],[32+L,13+dy]],'d');
  if(!F.atk&&!F.hit)g.rect(26+L,19+dy,8,1,'d');
  slab(g,15+L,3+dy,10,9,'R','r');g.rect(15+L,6+dy,10,1,'d');g.rect(17+L,10+dy,6,1,'d');
  if(F.hit){g.rect(17+L,8+dy,2,1,'E');g.rect(21+L,8+dy,2,1,'E');}else{g.rect(17+L,7+dy,2,2,'E');g.rect(21+L,7+dy,2,2,'E');g.s(17+L,7+dy,'W');g.s(21+L,7+dy,'W');}
  const cr=F.b?3.8:3.4;g.ell(cx,cy,cr,cr,'C');g.ell(cx,cy,2,2,F.hit?'W':'A');
  g.path([[cx-2,cy-2],[cx-6,cy-5],[cx-7,cy-8]],'C');g.path([[cx+2,cy-2],[cx+6,cy-4],[cx+7,cy-8]],'C');g.path([[cx-2,cy+2],[cx-5,cy+5]],'C');g.path([[cx+2,cy+2],[cx+5,cy+4],[cx+6,cy+6]],'C');
  if(F.hit){g.path([[cx,cy-3],[cx+1,cy-7],[cx-1,cy-10]],'C',2);g.path([[cx-3,cy+1],[cx-9,cy+1]],'C',2);g.path([[cx+3,cy+2],[cx+8,cy+2]],'C',2);g.px([[cx-9,cy-8],[cx+9,cy-7],[cx+10,cy+5]],'A');}
  g.px([[15-lg,31],[15-lg,32],[16-lg,33]],'C');
  slab(g,fx-2.5+(F.atk?-1:0),17+dy,6,Math.round(fy-17-dy-1),'R','r');
  sph(g,fx,fy,fr,fr-.8,'R','r');g.line(fx-fr*.6,fy+1,fx+fr*.6,fy+1,'d');
  g.px(F.b?[[fx+1,fy+fr+1],[fx+1,fy+fr+2]]:[[fx-2,fy+fr+1]],'C');
  if(F.atk)g.px([[fx+4,36],[fx+5,34],[fx-4,37],[fx+2,37]],'C');
  return {pal:{R:'#7a665c',r:'#54443c',d:'#34282a',C:'#ff7a2a',A:'#ffe08a',E:'#ffb040',W:'#ffffff'},flat:'CAEW',a:{cx,cy,hx,hy:7+dy,top:3+dy,fx,fy,fr,lx:7+L,ly:29,sx:31+L,sy:14+dy,by:37,L,dy}};
 },
 // ---- Icebound Knight: steel plate with an ice crest, a kite shield behind, a chest gem as the accent; sword upright, thrust forward in the lunge
 iceknight(g,f){const F=mfr(f);
  let L=0,dy=F.b?-1:0;if(F.atk){L=2;dy=0;}if(F.hit){L=-2;dy=1;}
  const lg=F.atk?1:0,hx=19+L,hy=9+dy,cx=19+L,cy=20+dy,H=L/2,sx=7+L;
  g.poly([[sx-1,14+dy],[sx+7,13+dy],[sx+7,28],[sx+3,34],[sx-1,28]],'N');g.poly([[sx-1,14+dy],[sx+6,14+dy],[sx+6,27],[sx+3,31],[sx-1,27]],'M');
  g.rect(sx+2,18+dy,2,9,'C');g.rect(sx,21+dy,6,2,'C');
  slab(g,13,28,5,8,'M','N');slab(g,21+lg,28,5,8,'M','N');slab(g,12,35,7,3,'N','D');slab(g,20+lg,35,7,3,'N','D');
  slab(g,12+H,25,15,5,'M','N');g.rect(12+H,24,15,1,'G');
  slab(g,12+L,14+dy,15,11,'M','N');g.rect(13+L,18+dy,13,1,'N');g.rect(13+L,22+dy,13,1,'N');
  sph(g,12+L,16+dy,4,3.4,'M','N');
  g.poly([[29+L,12+dy],[32+L,9+dy],[31+L,15+dy]],'C');
  sph(g,27+L,16+dy,4.4,3.6,'M','N');
  g.ell(cx+.5,cy+.5,2.4,2.4,'E');g.s(cx,cy-1,'W');
  sph(g,hx,hy,5.4,5.4,'M','N');
  g.rect(hx,hy,6,2,F.hit?'W':'K');if(!F.hit){g.rect(hx+1,hy,2,2,'E');g.s(hx+1,hy,'W');}
  g.poly([[hx-3,hy-4],[hx-2,hy-11-(F.b?1:0)],[hx,hy-5]],'C');g.poly([[hx-.5,hy-5],[hx+1,hy-12],[hx+2.5,hy-5]],'C');
  let sw=0;
  if(F.atk){slab(g,25+L,16,5,4,'M','N');g.path([[31,19],[39,20]],'W',3);g.line(31,20,38,21,'V');g.line(30,14,31,24,'G',2);slab(g,27+L,17,4,5,'M','N');sw=39;}
  else if(F.hit){g.line(29+L,25,27+L,4,'W',3);g.line(30+L,24,28+L,5,'V');g.rect(26+L,24,7,2,'G');g.rect(28+L,26,3,4,'L');slab(g,26+L,25,5,4,'M','N');sw=27+L;}
  else{const tx=F.b?31:30;g.line(30,24,tx,3,'W',3);g.line(31,24,tx+1,4,'V');g.rect(27,24,7,2,'G');g.rect(29,26,3,4,'L');slab(g,24,17+dy,5,4,'M','N');slab(g,28,25,5,4,'M','N');sw=tx;}
  return {pal:{M:'#8aa8c0',N:'#5a7894',D:'#3a526c',C:'#c8f0ff',K:'#10141f',E:'#5ad0ff',W:'#e8f8ff',V:'#9ab8d0',G:'#c8a050',L:'#5a3a22'},flat:'KEW',a:{cx,cy,hx,hy,top:hy-5,sx:27+L,sy:16+dy,gx:sw,by:37,L,dy}};
 },
 // ---- Husk Watcher: a hollow suit of sand-coloured plate with a tall bucket helm, an empty chest with a glowing core, a round shield behind, a vigil spear
 huskguard(g,f){const F=mfr(f);
  let L=0,dy=F.b?-1:0,lg=0;if(F.atk){L=2;dy=0;lg=1;}if(F.hit){L=-2;dy=1;}
  const hx=20+L,cx=20+L,cy=20+dy,H=L/2,shx=Math.round(9+H);
  g.ell(shx-1,22,5.4,8.4,'P');g.ell(shx-.6,21.6,4,6.8,'N');g.ell(shx-1,22,1.6,1.8,'M');g.px([[shx-1,18],[shx-1,26]],'E');
  slab(g,13-lg,28,5,9,'M','N');slab(g,22+lg,28,5,9,'M','N');slab(g,12-lg,35,7,3,'N','D');slab(g,21+lg,35,7,3,'N','D');g.px([[14-lg,31],[25+lg,31]],'E');
  slab(g,10+L,13+dy,20,15,'M','N');g.rect(11+H,26,18,2,'N');
  g.ell(cx,cy+1,4.6,5.6,'K');g.ell(cx,cy+1,F.b?2.8:2.4,F.b?2.8:2.4,F.hit?'W':'E');g.s(cx-1,cy,'W');
  slab(g,8+L,11+dy,8,6,'M','N');slab(g,24+L,11+dy,8,6,'M','N');
  slab(g,15+L,2+dy,10,11,'M','N');g.rect(16+L,7+dy,9,2,'K');g.px([[19+L,2+dy],[19+L,3+dy],[19+L,4+dy]],'N');
  if(F.hit){g.rect(17+L,8+dy,2,1,'W');g.rect(21+L,8+dy,2,1,'W');g.path([[22+L,3+dy],[21+L,7+dy]],'K');g.path([[cx+3,cy-3],[cx+6,cy+3]],'K');}
  else{g.rect(17+L,7+dy,2,2,'E');g.rect(21+L,7+dy,2,2,'E');g.s(17+L,7+dy,'W');g.s(21+L,7+dy,'W');}
  let tip;
  if(F.atk){tip=spear(g,14+L,26,32,19,'S','G',6);slab(g,27+L,18,5,4,'M','N');}
  else if(F.hit){tip=spear(g,36+L,37,31+L,12,'S','G',6);slab(g,29+L,21+dy,5,4,'M','N');}
  else{const sxp=F.b?33:32;tip=spear(g,sxp,37,sxp,9,'S','G',6);slab(g,sxp-3,19+dy,6,4,'M','N');}
  return {pal:{M:'#c8b890',N:'#8a7a5a',D:'#a89870',P:'#4e4332',K:'#0e0a16',E:'#f6e7a8',S:'#5a4a3a',G:'#f0c860',W:'#ffffff'},flat:'KEW',a:{cx,cy,hx,hy:7+dy,top:2+dy,sx:28+L,sy:11+dy,tip,by:37,L,dy}};
 }
});
['slaggolem','iceknight','huskguard'].forEach(n=>{MART[n].fr=1;});
// FAMILY3-END
// FAMILY4-BEGIN
// =================== FAMILY 4 (v0.13 art pass): imps and harpies, yeti, stormling, gargoyle, void things, mimic, drowned sailor, wights ===================
// Same frame API as families 1 to 3: f = {t:'idle'|'atk'|'hit', i:0|1}. Flyers (gust imp, snow harpy, gargoyle) show both wings with a span wider than the body;
// the yeti is tall and top-heavy; the voidspawn and the star eater are void things (a flat glow core, tendrils, a maw); the mimic is a chest whose lid opens on
// the lunge; the sailor, the rime wight and the gale phantom are undead with one prop each (anchor, frost blade, war horn). Variants add a shape through SHP.
Object.assign(MART,{
 // ---- Gust Imp: a green pot-bellied imp, bat ears, two horns, a barbed tail; wings up on A and level on B, the lunge dives claws first with the jaw open, a hit throws the wings down
 gustimp(g,f){const F=mfr(f);
  let bx=18,by=25,hx=24.5,hy=15,nT=[3,5],fT=[33,3],ar=[27,26],op=0;
  if(F.b){by=25.8;hy=15.8;nT=[1,17];fT=[36,13];ar=[26,27];}
  if(F.atk){bx=19;by=24;hx=27.5;hy=17.5;nT=[2,10];fT=[22,1];ar=[34,25];op=1;}
  if(F.hit){bx=16.5;by=26;hx=22;hy=17.5;nT=[4,27];fT=[31,24];ar=[22,32];}
  const nS=[bx-1,by-5],fS=[bx+3,by-6],tx=bx-12,ty=by+1;
  wing(g,fS,fT,11,'m','l',4,3);
  g.path([[bx-4,by+4],[bx-8,by+8],[bx-12,by+6],[bx-12,by+2]],'b',2);g.poly([[tx-2,ty+1],[tx+2,ty+1],[tx,ty-4]],'b');
  if(F.atk){limb(g,bx+1,by+5,bx+5,by+10,'B',2);g.px([[bx+5,by+11],[bx+3,by+11]],'W');}
  else{limb(g,bx-1,by+5,bx-2,by+10,'B',2);limb(g,bx+2,by+5,bx+3,by+10,'b',2);g.px([[bx-3,by+11],[bx-1,by+11],[bx+2,by+11],[bx+4,by+11]],'W');}
  sph(g,bx,by,5.8,6.6,'B','b');g.ell(bx+1.6,by+1.6,3.2,3.8,'A');
  limb(g,bx+2,by-2,ar[0],ar[1],'B',2);g.px([[ar[0]+1,ar[1]],[ar[0]+1,ar[1]+1],[ar[0],ar[1]+2]],'W');
  g.poly([[hx-4,hy-.5],[hx-11,hy-3.5],[hx-4.5,hy+3]],'b');g.poly([[hx-4,hy-.2],[hx-9,hy-2.4],[hx-4.4,hy+1.4]],'R');
  g.poly([[hx-3,hy-3.5],[hx-6.5,hy-11],[hx-.5,hy-4.8]],'b');g.poly([[hx+1,hy-4.6],[hx+3,hy-12],[hx+4.8,hy-3.8]],'B');
  sph(g,hx,hy,5.6,5,'B','b');g.ell(hx+4.2,hy+1.8,3,2.2,'B');
  if(op){g.poly([[hx+2.5,hy+1.2],[hx+9,hy+1.6],[hx+7.5,hy+6.8],[hx+3,hy+5.2]],'K');g.rect(hx+4,hy+4.6,3,1,'R');g.px([[hx+3,hy+2],[hx+6,hy+2],[hx+4,hy+5.6]],'W');}
  else{g.line(hx+2,hy+3.6,hx+7.5,hy+3.2,'K');g.px([[hx+5,hy+4.4],[hx+7,hy+4.2]],'W');}
  if(!F.hit)g.rect(Math.round(hx),Math.round(hy-3.6),5,1,'K');eye(g,hx+1.4,hy-2.4,F,'E');
  const tips=wing(g,nS,nT,12,'M','L',4,3);tips.slice(0,3).forEach(t=>g.s(Math.round(t[0]),Math.round(t[1]),'P'));
  g.px(F.i?[[3,31],[5,30],[7,31],[34,35],[36,34]]:[[2,30],[4,29],[6,30],[33,34],[35,33],[37,34]],'C');
  if(F.hit)g.px([[bx-12,by-12],[bx+12,by-12],[bx+9,by-15]],'W');
  return {pal:{B:'#5fc9a0',b:'#2f7a74',A:'#c8f4dc',M:'#8a6ad0',m:'#5a3e98',L:'#c8b0f4',l:'#8a6ad0',P:'#e04a6a',R:'#e0506a',E:'#fff06a',K:'#1a1020',W:'#ffffff',C:'#e4fff6'},flat:'EKWCP',a:{bx,by,hx,hy,tx,ty,nT,fT,sx:nS[0],sy:nS[1],ar,top:hy-12}};
 },
 // ---- Snow Harpy: a pale woman-bird, a mane of white hair, a gold beak, bare wings in a V (A up, B level), talons that lunge forward and reach in the dive
 snowharpy(g,f){const F=mfr(f);
  let bx=19,by=26,hx=22.5,hy=13.5,nT=[2,5],fT=[35,3],tl=0,op=0;
  if(F.b){by=26.8;hy=14.3;nT=[1,17];fT=[37,13];}
  if(F.atk){bx=19.5;by=25;hx=26;hy=17;nT=[2,9];fT=[19,1];tl=1;op=1;}
  if(F.hit){bx=17;by=27;hx=21;hy=17;nT=[3,28];fT=[33,25];}
  const nS=[bx-1,by-8],fS=[bx+3,by-9],sw=F.i?1:0;
  wing(g,fS,fT,13,'m','l',5,3.4);
  g.poly([[bx-3,by+5],[bx-9,by+10+sw],[bx-5,by+9],[bx-6,by+12],[bx,by+8],[bx+3,by+5]],'b');
  if(tl){limb(g,bx+3,by+5,bx+10,by+9,'G',1);limb(g,bx,by+5,bx+6,by+10,'G',1);g.px([[bx+11,by+10],[bx+10,by+11],[bx+7,by+11],[bx+6,by+11]],'W');}
  else if(F.hit){limb(g,bx,by+6,bx-1,by+10,'G',1);limb(g,bx+3,by+6,bx+4,by+10,'G',1);g.px([[bx-2,by+11],[bx+3,by+11]],'W');}
  else{limb(g,bx,by+6,bx-1,by+11,'G',1);limb(g,bx+3,by+6,bx+3,by+11,'G',1);g.px([[bx-2,by+12],[bx,by+12],[bx+2,by+12],[bx+4,by+12]],'W');}
  sph(g,bx,by,4.8,7.2,'B','b');g.ell(bx+1.5,by+1,2.8,4.6,'A');g.px([[bx-1,by-2],[bx+1,by],[bx-1,by+2],[bx+1,by+4]],'b');
  g.poly([[hx-3,hy-5],[hx+3,hy-5],[hx+4,hy+2],[hx+1,hy+9],[hx-5+sw,hy+13],[hx-9,hy+11],[hx-8,hy+3]],'h');g.poly([[hx-3,hy-5],[hx+2,hy-5.6],[hx+1,hy+1],[hx-4,hy+8],[hx-8,hy+4]],'H');
  g.path([[hx-4,hy+1],[hx-6,hy+8]],'h');
  sph(g,hx+1.5,hy,3.8,4.2,'A','a');
  if(op){g.poly([[hx+4,hy-1.2],[hx+9.5,hy-.2],[hx+4,hy+.8]],'G');g.poly([[hx+4,hy+1.4],[hx+9,hy+3.4],[hx+4,hy+3.6]],'G');g.rect(hx+5,hy+.8,3,1,'K');}
  else g.poly([[hx+4,hy-.8],[hx+10,hy+1.4],[hx+4,hy+2.6]],'G');
  eye(g,hx+.8,hy-2,F,'E');if(!F.hit)g.rect(Math.round(hx),Math.round(hy-3.4),4,1,'h');
  const tips=wing(g,nS,nT,14,'M','L',5,3.4);tips.slice(0,3).forEach(t=>g.s(Math.round(t[0]),Math.round(t[1]),'P'));
  g.px(F.i?[[8,34],[31,33],[20,36]]:[[6,33],[33,34],[24,37]],'W');
  if(F.hit)g.px([[bx-12,by-14],[bx+12,by-15],[bx+8,by-18]],'W');
  return {pal:{B:'#a8c4dc',b:'#6a8aa8',A:'#eef0f6',a:'#c8c0d4',H:'#f4f8ff',h:'#aab8d0',M:'#86aecc',m:'#4a6a8a',L:'#d4ecff',l:'#7a9cc0',G:'#e0b050',P:'#b080ff',E:'#5ae0ff',K:'#1a1020',W:'#ffffff'},flat:'KEWPG',a:{bx,by,hx,hy,tx:bx-7,ty:by+10,nT,fT,sx:nS[0],sy:nS[1],top:hy-6}};
 },
 // ---- Frostling Yeti: tall and top-heavy, huge shoulders and a small blue face sunk between them, short legs, long arms with big fists; the lunge slams the right fist down
 yeti(g,f){const F=mfr(f);
  let L=0,dy=F.b?-1:0,fx=31,fy=30;
  if(F.b){fy=31;}
  if(F.atk){L=2;dy=1;fx=36;fy=33;}
  if(F.hit){L=-2;dy=1;fx=29;fy=32;}
  const hx=23+L,hy=9+dy,cx=18+L,cy=21+dy;
  g.rect(12,31,6,6,'b');g.rect(21,31,6,6,'b');slab(g,11,35,8,3,'A','a');slab(g,20,35,8,3,'A','a');
  sph(g,6+L*.6,23+dy,3.6,8.5,'B','b');sph(g,5.4+L*.4,32,4.2,3.4,'B','b');
  g.poly([[cx-11,16+dy],[cx+11,16+dy],[cx+8,32],[cx-8,32]],'b');g.poly([[cx-11,16+dy],[cx+3,16+dy],[cx+1,32],[cx-8,32]],'B');
  [[-7,31],[-3,32],[1,31],[5,32]].forEach(([o,y])=>g.poly([[cx+o-2,y-1],[cx+o,y+3],[cx+o+2,y-1]],'b'));
  sph(g,cx,14+dy,13,6.6,'B','b');
  g.path([[cx+9,15+dy],[fx-.5,fy-4]],'b',6);g.path([[cx+8,15+dy],[fx-1.5,fy-4]],'B',5);
  sph(g,fx,fy,4.6,4,'B','b');g.px([[fx-2,fy+2],[fx,fy+3],[fx+2,fy+2]],'a');
  if(F.atk)g.px([[fx+4,36],[fx+6,34],[fx-4,37],[fx+2,37],[fx-6,36]],'W');
  sph(g,hx,hy,5.2,4.8,'S','s');g.ell(hx-.8,hy-4,5,2.4,'B');g.px([[hx-4,hy-2],[hx-2,hy-1],[hx+2,hy-1],[hx+4,hy-2]],'b');
  g.poly([[hx-2,hy-4],[hx-5,hy-9],[hx,hy-5]],'H');g.poly([[hx+2,hy-4],[hx+6,hy-9],[hx+5,hy-3]],'h');
  eye(g,hx+1.6,hy-1.4,F,'E');
  if(F.atk){g.rect(hx+1,hy+1.6,6,3,'K');g.rect(hx+2,hy+3.6,4,1,'R');g.px([[hx+1,hy+1],[hx+6,hy+1],[hx+3,hy+4.6]],'W');}
  else{g.line(hx+1,hy+3,hx+6,hy+3,'K');g.px([[hx+2,hy+4],[hx+5,hy+4]],'W');}
  [[10,18],[13,24],[20,27],[11,29],[24,21]].forEach(([x,y])=>g.px([[x+L,y+dy],[x+1+L,y+1+dy]],'b'));
  return {pal:{B:'#e4eef4',b:'#aebfd0',A:'#9ec0dc',a:'#6a8cac',S:'#6e98c4',s:'#46689a',H:'#e8e0c8',h:'#a8a088',E:'#ffe14a',K:'#1a1020',W:'#ffffff',R:'#d8506a'},flat:'EKWR',a:{hx,hy,top:hy-9,cx,cy,fx,fy,sx:cx+10,sy:14+dy,by:37,L,dy}};
 },
 // ---- Stormling: a thunderhead with one flat glow core, two eyes, hanging bolts and rain. B swells it, the lunge throws a bolt forward, a hit squashes it flat and flashes the core
 stormling(g,f){const F=mfr(f);
  let cx=20,cy=17,s=1,sq=1;
  if(F.b){s=1.06;cy=16;}if(F.atk){cx=17;s=1.04;}if(F.hit){sq=.74;cy=20;cx=19;s=1.08;}
  const P=[[12,19,7,6],[28,19,7,6],[21,13,8.5,7.5],[20,22,10,6]];
  P.forEach(([x,y,rx,ry])=>sph(g,cx+(x-20)*s,cy+(y-17)*sq+(F.b?-0:0),rx*s,ry*sq*s,'B','b'));
  g.ell(cx-3,cy-5.6*sq,3.6,1.5,'A');g.ell(cx+6,cy-.6*sq,2.4,1.1,'A');
  const kx=cx+1,ky=Math.round(cy+3*sq);
  bolt(g,kx-1,ky-1,F.hit?4:9,3,F.hit?'W':'C',2);
  const ex=cx-2,ey=cy-5*sq;
  if(F.hit){g.rect(ex,ey+1,3,1,'K');g.rect(ex+6,ey+1,3,1,'K');}else{g.rect(ex,ey,2,2,'E');g.s(ex,ey,'W');g.rect(ex+6,ey,2,2,'E');g.s(ex+6,ey,'W');g.line(ex-1,ey-2,ex+3,ey-1,'K');g.line(ex+5,ey-1,ex+9,ey-2,'K');}
  g.path([[ex+1,ey+5],[ex+3,ey+4],[ex+5,ey+5],[ex+7,ey+4]],'K');
  const by=Math.round(cy+9*sq),tips=[];
  if(F.atk){tips.push(bolt(g,cx-8,by,9,2,'C',2));tips.push(bolt(g,cx+3,by,6,-2,'C',2));
   g.path([[cx+13,cy+1],[cx+19,cy-1],[cx+16,cy+3],[cx+23,cy+2]],'C',3);g.path([[cx+13,cy+1],[cx+19,cy-1],[cx+16,cy+3],[cx+23,cy+2]],'W',1);g.px([[cx+22,cy-4],[cx+23,cy+6]],'E');}
  else{tips.push(bolt(g,cx-8,by,F.b?11:9,F.b?-3:3,'C',2));tips.push(bolt(g,cx+8,by,F.b?8:11,F.b?3:-3,'C',2));if(!F.hit)tips.push(bolt(g,cx-1,by+1,5,2,'C',1));}
  const dx=F.i?1:0;[[10+dx,34],[17-dx,36],[24+dx,35],[30-dx,34],[14,38-dx]].forEach(([x,y])=>{if(!(F.atk&&x>cx+9))g.px([[x,y],[x,y+1]],'A');});
  if(F.hit)g.px([[cx-14,cy-6],[cx+15,cy-8],[cx+12,cy+8]],'W');
  return {pal:{B:'#7a84a8',b:'#4a5478',A:'#c8d4f0',C:'#f2d43a',Y:'#c89a2a',E:'#fff6b8',K:'#141826',W:'#ffffff'},flat:'CYEKW',glow:'#f2d43a',a:{cx,cy,kx,ky,top:cy-9,by,tips,sq,s}};
 },
 // ---- Skyshaper (gargoyle): a crouched stone flyer, plated shoulders and chest, a horned head with a glowing visor slit, bat wings spread wide (A up, B level); the lunge leaps claws out, a hit folds the wings
 gargoyle(g,f){const F=mfr(f);
  let bx=18,by=26,hx=25,hy=16,nT=[3,3],fT=[34,2],cl=[27,35];
  if(F.b){by=26.8;hy=16.8;nT=[1,14];fT=[37,11];cl=[27,36];}
  if(F.atk){bx=19;by=25;hx=28;hy=18;nT=[1,9];fT=[21,0];cl=[34,30];}
  if(F.hit){bx=17;by=27;hx=23;hy=18;nT=[5,25];fT=[31,22];cl=[26,36];}
  const nS=[bx-2,by-7],fS=[bx+3,by-8];
  wing(g,fS,fT,13,'m','l',4,3.4);
  g.path([[bx-6,by+3],[bx-12,by+5],[bx-14,by+9]],'b',3);g.poly([[bx-17,by+8],[bx-12,by+7.5],[bx-13,by+13]],'b');
  slab(g,Math.round(bx-9),Math.round(by+3),7,7,'B','b');g.px([[bx-9,by+10],[bx-6,by+10],[bx-3,by+10]],'W');
  sph(g,bx,by,8,7,'B','b');slab(g,Math.round(bx-4),Math.round(by-4),9,7,'A','a');g.rect(Math.round(bx-3),Math.round(by-1),7,1,'a');g.px([[bx-3,by-3],[bx+4,by-3],[bx-3,by+1],[bx+4,by+1]],'W');
  limb(g,bx+5,by-1,cl[0],cl[1]-(F.atk?0:6),'B',3);g.px([[cl[0]-1,cl[1]],[cl[0]+1,cl[1]],[cl[0]+2,cl[1]-1]].slice(0,F.atk?3:3),'W');
  slab(g,Math.round(bx+3),Math.round(by-8),7,5,'A','a');
  g.poly([[hx-4,hy-3],[hx-8,hy-9],[hx-2,hy-5]],'a');g.poly([[hx+1,hy-4],[hx+3,hy-11],[hx+5,hy-3]],'A');
  slab(g,Math.round(hx-5),Math.round(hy-4),11,9,'A','a');
  g.rect(Math.round(hx-4),Math.round(hy-1),9,3,'K');g.rect(Math.round(hx-3),Math.round(hy-1),F.hit?7:7,F.hit?3:2,F.hit?'W':'E');if(!F.hit)g.s(Math.round(hx-3),Math.round(hy-1),'W');
  g.px(F.atk?[[hx-3,hy+4],[hx,hy+4],[hx+3,hy+4],[hx+5,hy+4]]:[[hx-2,hy+4],[hx+2,hy+4]],'W');
  const tips=wing(g,nS,nT,14,'M','L',4,3.4);tips.slice(0,3).forEach(t=>g.s(Math.round(t[0]),Math.round(t[1]),'K'));
  g.path([[bx-2,by-1],[bx-4,by+3]],'C');
  return {pal:{B:'#8a8a9c',b:'#555566',A:'#a8a8ba',a:'#6a6a7c',M:'#6e6e82',L:'#a0a0b4',m:'#44445a',l:'#707086',E:'#f2c93a',W:'#ece6d8',K:'#1a1020',C:'#f2c93a'},flat:'EWKC',a:{bx,by,hx,hy,top:hy-11,cx:bx,cy:by-1,nT,fT,sx:nS[0],sy:nS[1],tx:bx-14,ty:by+9}};
 },
 // ---- Void Spawn: a dark dome of void with stars in it, one flat glow core with a slit pupil, a maw that gapes on the lunge and five tendrils with glowing tips; a hit squashes it flat
 voidspawn(g,f){const F=mfr(f);
  let cx=19,cy=22,rx=13,ry=9.5,ph=F.i?3.14:0,sp=0;
  if(F.b){rx=12.2;ry=10.6;cy=21;}if(F.atk){cx=18;rx=14;ry=8.6;cy=23;}if(F.hit){rx=14.6;ry=7;cy=25;sp=3;ph=2;}
  const by=Math.round(cy+ry*.6),tp=[];
  for(let n=0;n<5;n++){const x=cx-9+n*4.5,t=tend(g,x,by-1,9+(n%2?3:0)+(F.b?1:0),2.2,ph+n*1.3,'b',2,(n-2)*sp*.7+(F.atk&&n>2?3:0));tp.push(t);g.s(Math.round(t[0]),Math.round(t[1]),'E');}
  sph(g,cx,cy,rx,ry,'B','b');sph(g,cx-6,cy-ry*.62,5,4.2,'B','b');sph(g,cx+4,cy-ry*.7,5.6,4.6,'B','b');
  const kx=Math.round(cx-3),ky=Math.round(cy-1);core(g,kx,ky,5.4,4.6*(F.hit?.8:1),'E','G',F.hit);
  if(F.hit)g.rect(kx-2,ky,4,1,'K');else{g.rect(kx-1,ky-2,2,4,'K');g.s(kx-1,ky-2,'W');}
  const mx=Math.round(cx+rx*.28),my=Math.round(cy+ry*.3),mo=F.atk?4:F.hit?0:1;
  if(F.hit)g.line(mx,my,mx+3,my,'K');else{g.ell(mx+4,my+1,5.2,1.2+mo*.8,'K');g.px([[mx+1,my-mo],[mx+3,my-mo],[mx+6,my-mo],[mx+2,my+2+mo],[mx+5,my+2+mo]],'W');if(F.atk)g.rect(mx+2,my+1,4,1,'R');}
  g.px(F.i?[[cx-11,cy+2],[cx+1,cy-8],[cx+9,cy+1],[cx-8,cy-6],[cx+11,cy-3]]:[[cx-10,cy+3],[cx,cy-9],[cx+10,cy],[cx-7,cy-6],[cx+12,cy-4]],'A');
  return {pal:{B:'#4a2c66',b:'#2c1c40',E:'#ff6ad0',G:'#ffc0ee',K:'#080410',W:'#f4e8ff',A:'#d8c0ff',R:'#d8305a'},flat:'EGKWAR',rim:'#5a3a8a',a:{cx,cy,rx,ry,kx,ky,mx,my,by,top:Math.round(cy-ry-3),tp}};
 },
 // ---- Star Eater: a hunched void hound with a violet back-ridge, a star clamped in its jaws and an ember star on the tail. The lunge opens the jaws wide on the star; a hit rears the head back
 stareater(g,f){const F=mfr(f);
  let bx=16,by=25,hx=29,hy=20.5,op=1.1,dy=F.b?-1:0;
  if(F.b){hy=21.5;op=1.6;}
  if(F.atk){bx=17;by=24;hx=28.5;hy=20;op=3.6;}
  if(F.hit){bx=14;by=26;hx=25.5;hy=22;op=0;}
  const tx=bx-12,ty=by-9+(F.i?1:0);
  g.path([[bx-8,by-1],[bx-12,by-3],[bx-13,by-7]],'b',3);
  g.px([[tx-1,ty],[tx,ty],[tx+1,ty],[tx,ty-1],[tx,ty+1],[tx,ty-2],[tx,ty+2]],'C');g.s(tx,ty,'A');
  limb(g,bx-5,by+4,bx-8,by+11,'b',3,'b');limb(g,bx+8,by+3,bx+10,by+11,'b',3,'b');
  sph(g,bx-5,by+3,5,4.6,'B','b');
  if(F.atk){limb(g,bx+7,by+3,hx-1,by+10,'B',3,'W');limb(g,bx+4,by+4,bx+8,by+11,'B',3,'W');}
  else{limb(g,bx+7,by+3,bx+9,by+11+(F.b?0:0),'B',3,'W');limb(g,bx+3,by+4,bx+3,by+11,'B',3,'W');}
  sph(g,bx,by+dy,11.5,6.2,'B','b');
  for(let k=0;k<4;k++){const x=bx-7+k*4.6,y=by+dy-5.2+(k==3?1.4:0);g.poly([[x-2,y+1],[x+.5,y-5.5-(k%2)],[x+3,y+1]],'D');}
  sph(g,hx-5,hy+1+dy*.5,5,5.2,'B','b');
  sph(g,hx,hy,5.8,5.2,'B','b');g.poly([[hx-3,hy-3],[hx-4,hy-8],[hx,hy-4]],'b');g.poly([[hx,hy-4],[hx+1,hy-9],[hx+3.5,hy-3]],'B');
  maw(g,hx+3,hy-1.2,7.5,op,'J','j');if(op>1)g.rect(hx+4,hy+2.4,2,Math.round(op*.8),'R');
  const sx=Math.round(hx+4+(op?2:3)),sy=Math.round(hy+(op?3.4:3.2));
  g.px([[sx,sy],[sx-1,sy],[sx+1,sy],[sx,sy-1],[sx,sy+1]],'C');if(op)g.px([[sx,sy-2],[sx,sy+2],[sx-2,sy],[sx+2,sy]],'C');g.s(sx,sy,'A');
  eye(g,hx-.4,hy-2.6,F,'E');if(!F.hit)g.rect(Math.round(hx-1),Math.round(hy-4),4,1,'K');
  g.px([[bx-6,by-1],[bx-1,by+2],[bx+3,by-2],[bx+6,by+1],[bx-9,by+2]],'A');
  return {pal:{B:'#3a3060',b:'#1e1838',D:'#8b5fd0',J:'#7a68b8',j:'#52408a',C:'#ff8a3a',R:'#ff6a3a',W:'#fff4e0',E:'#ff8a3a',K:'#0a0614',A:'#ffffff'},flat:'CRWEKA',rim:'#4a3a7a',a:{bx,by,hx,hy,tx,ty,top:hy-9,sx,sy}};
 },
 // ---- Mimic: a banded chest on stubby claw feet. Idle it sits with the lid cracked (A 2px, B 3px) and eyes in the gap; the lunge throws the lid wide with teeth and a long tongue; a hit slams it shut
 mimic(g,f){const F=mfr(f);
  let gap=F.b?4:3,fy=0;
  if(F.atk){gap=12;}if(F.hit){gap=0;fy=1;}
  const x0=6,w=28,top=24+fy,lid=top-gap-9;
  g.rect(x0,top,w,10,'w');
  slab(g,x0,top,w,10,'L','W');g.rect(x0,top+4,w,1,'w');
  g.rect(x0+6,top,2,10,'G');g.rect(x0+w-8,top,2,10,'G');g.px([[x0+6,top],[x0+w-8,top]],'Y');
  g.rect(x0-1,top+1,2,9,'w');g.rect(x0+w-1,top+1,2,9,'w');
  if(gap>0){g.rect(x0+1,top-gap,w-2,gap,'K');
   if(F.atk){g.rect(x0+2,top-gap,w-4,2,'M');}
   for(let x=x0+3;x<x0+w-3;x+=4){g.poly([[x,top-gap],[x+1.6,top-gap+(F.atk?4:2)],[x+3.2,top-gap]],'T');g.poly([[x,top],[x+1.6,top-(F.atk?4:2)],[x+3.2,top]],'T');}
   const tl=F.atk?9:2;g.poly([[x0+12,top-1],[x0+20,top-1],[x0+19,top+tl],[x0+13,top+tl+1]],'R');g.line(x0+16,top,x0+16,top+tl-1,'M');}
  slab(g,x0,lid+(F.hit?1:0),w,9,'L','W');g.rect(x0,lid+(F.hit?1:0)+6,w,1,'w');
  g.s(x0,lid+(F.hit?1:0),0);g.s(x0+w-1,lid+(F.hit?1:0),0);g.rect(x0+6,lid+(F.hit?1:0),2,9,'G');g.rect(x0+w-8,lid+(F.hit?1:0),2,9,'G');
  const ey=lid+(F.hit?1:0)+3;eye(g,x0+12,ey,F,'E');eye(g,x0+17,ey,F,'E');
  g.rect(x0+12,top+3,4,3,'G');g.rect(x0+13,top+4,2,1,'K');
  if(gap===0)g.px([[x0+9,top-1],[x0+11,top-1],[x0+13,top-1],[x0+20,top-1],[x0+22,top-1]],'T');
  g.rect(x0-2,34,6,3,'W');g.rect(x0+w-4,34,6,3,'W');g.px([[x0-2,37],[x0,37],[x0+2,37],[x0+w-3,37],[x0+w-1,37],[x0+w+1,37]],'T');
  if(F.hit)g.px([[x0+2,lid-3],[x0+w-3,lid-3],[x0+w/2,lid-5]],'T');
  return {pal:{W:'#8a5a2a',L:'#b07a3c',w:'#5a3a1a',G:'#e0b84a',Y:'#fff0a0',K:'#1a0a10',T:'#f4efe0',R:'#d8305a',M:'#6a1426',E:'#ff5a3a'},flat:'KTREY',a:{cx:20,cy:29,top:lid,gap}};
 },
 // ---- Drowned Sailor: a barnacled corpse in a tricorn and a sea-rotten coat, kelp trailing, an iron anchor for a weapon (planted on idle, swung forward in the lunge, dragged on a hit)
 drownedsailor(g,f){const F=mfr(f);
  let L=0,dy=F.b?-1:0,ring=[33,5],fl=[33,35],t=.55;
  if(F.b){ring=[34,5];}
  if(F.atk){L=2;ring=[22,2];fl=[39,30];t=.52;}
  if(F.hit){L=-2;dy=1;ring=[31,8];fl=[37,36];t=.6;}
  const hx=19+L,hy=9+dy,hand=lerp2(ring,fl,t),sw=F.i?1:0;
  g.path([[hx-4,16],[hx-7,22],[hx-8,28]],'b',3);g.px([[hx-9,29],[hx-8,30],[hx-7,29]],'B');
  g.rect(hx-5,29,3,8,'d');g.rect(hx+1,29,3,8,'d');g.rect(hx-6,36,5,2,'B');g.rect(hx,36,5,2,'B');
  g.poly([[hx-6,15],[hx+6,15],[hx+8,29],[hx+6,31],[hx+3,28],[hx,32],[hx-3,28],[hx-7,31]],'c');g.poly([[hx-6,15],[hx+3,15],[hx+3,28],[hx,31],[hx-3,28],[hx-7,30]],'C');
  g.rect(hx-6,22,13,1,'d');g.px([[hx+1,17],[hx+1,20],[hx+1,25]],'G');g.px([[hx-3,18],[hx+4,24],[hx-2,26],[hx+5,19]],'N');
  g.path([[hx-4,15],[hx-5,23],[hx-4,29]],'V');tend(g,hx-7,16,10,1.6,sw*2,'V',2,-1);tend(g,hx+6,26,7,1.4,sw*2+1,'V',1,1);
  g.poly([[hx-6,14],[hx+6,14],[hx+4,17],[hx-4,17]],'b');
  anchor(g,ring[0],ring[1],fl[0],fl[1],'S','I');
  g.path([[hx+5,16],[(hx+5+hand[0])/2+1,hand[1]-3],[hand[0],hand[1]]],'B',2);g.rect(Math.round(hand[0])-1,Math.round(hand[1])-1,3,3,'B');g.px([[hand[0]-1,hand[1]-1]],'W');
  sph(g,hx,hy,5.3,5.2,'B','b');g.poly([[hx+2,hy+2],[hx+6,hy+1],[hx+5,hy+5],[hx+2,hy+5]],'b');
  g.poly([[hx-10,hy-4],[hx-8,hy-8],[hx-3,hy-5],[hx,hy-9],[hx+3,hy-5],[hx+8,hy-8],[hx+10,hy-4],[hx+4,hy-2],[hx-4,hy-2]],'H');g.line(hx-9,hy-2.6,hx+9,hy-2.6,'h');g.px([[hx,hy-6],[hx+1,hy-6]],'G');
  eye(g,hx+1.6,hy-.4,F,'E');g.px([[hx+3,hy+3],[hx+5,hy+3],[hx+4,hy+4]],'W');
  g.px([[hx-4,hy+2],[hx-2,hy+4]],'N');
  return {pal:{B:'#9ab4a6',b:'#6a8478',C:'#4a6e80',c:'#2e4658',d:'#1e2e3c',H:'#3a4a5a',h:'#c8b060',G:'#d8c070',K:'#101a20',E:'#9affe8',S:'#8a90a4',I:'#d0d6e4',N:'#d8d4b8',V:'#3a8a4a',W:'#ffffff'},flat:'EKWG',a:{hx,hy,top:hy-9,cx:hx,cy:22,sx:Math.round(hand[0]),sy:Math.round(hand[1]),ring,fl,by:37,L,dy}};
 },
 // ---- Rime Wight: a frost-rimed hooded wraith, an icicle crown, an ice core in the chest, one prop: a rimed longsword (planted on idle, thrust in the lunge, dropped on a hit)
 rimewight(g,f){const F=mfr(f);
  let lean=0,sw=F.i?1:0,rise=F.b?-1:0,hl=[30,22],tp=[30,2];if(F.b)tp=[31,2];
  if(F.atk){lean=2;hl=[29,19];tp=[39,15];}
  if(F.hit){lean=-3;hl=[27,25];tp=[31,14];}
  const hx=20+lean,hy=11+rise,cx=20+lean*.4;
  const shape=[[hx,3+rise],[hx+7,7+rise],[30+lean*.4,18],[29,29],[30,35+sw],[25,33],[21,39-sw],[16,34],[11,36+sw],[11,29],[9,18],[hx-7,7+rise]];
  g.poly(shape,'b');g.poly([[hx,3+rise],[hx-7,7+rise],[9,18],[11,29],[11,36+sw],[16,34],[19,39-sw],[19,20],[hx+1,8+rise]],'B');
  g.px([[13,24],[15,29],[12,31],[26,26],[24,32],[28,22]],'C');g.px([[14,36+sw],[16,38],[22,38-sw],[26,35],[12,38]],'C');
  [[12,36],[17,35],[23,36],[27,34]].forEach(([x,y],n)=>g.poly([[x-1,y+sw*(n%2)],[x,y+3+n%2+sw],[x+1,y+sw*(n%2)]],'C'));
  g.ell(hx+.5,hy+.5,4.8,5,'K');g.rect(hx-2,hy,1,2,'E');g.rect(hx+2,hy,1,2,'E');g.s(hx-2,hy,'W');
  [[-5,5,4],[-3,3,8],[-1,1,5],[1,1,9],[3,3,6],[5,5,4]].forEach(([o,y,h])=>g.poly([[hx+o-1.2,3+rise+y],[hx+o,3+rise+y-h+3-(o?0:0)],[hx+o+1.2,3+rise+y]],'C'));
  const gr=F.atk?1:0;core(g,Math.round(cx),24,3.8+gr,4.4+gr,'X','C',F.hit);
  g.path([[26+lean*.5,16],[(26+hl[0])/2+1,(16+hl[1])/2],[hl[0],hl[1]]],'b',3.2);g.ell(hl[0],hl[1],1.8,1.6,'H');
  blade(g,hl[0],hl[1],tp[0],tp[1],'I','W','S');
  g.px(F.i?[[8,12],[34,10],[9,27]]:[[8,13],[34,11],[9,26]],'C');
  return {pal:{B:'#7a96c0',b:'#46608a',C:'#d4f0ff',K:'#0c1424',E:'#aaf4ff',W:'#ffffff',X:'#4ab8ff',H:'#c8dcf0',I:'#a8d0f0',S:'#5a7aa8'},flat:'EKCWX',glow:'#bfe6ff',a:{hx,hy,cx,top:3+rise,lean,sx:hl[0],sy:hl[1],tip:tp,by:36}};
 },
 // ---- Gale Phantom: a violet wind spirit, its cloak torn into streamers that blow back, a hollow hood with two lamps, one prop: a bone war horn (hung low on idle, blown in the lunge with sound rings, dropped on a hit)
 galephantom(g,f){const F=mfr(f);
  let lean=0,sw=F.i?1:0,rise=F.b?-1:0,hm=[28,24],he=[35,30],waves=0;
  if(F.b){he=[35,31];}
  if(F.atk){lean=1;hm=[25,14];he=[34,11];waves=1;}
  if(F.hit){lean=-3;hm=[26,26];he=[32,33];}
  const hx=20+lean,hy=11+rise,cx=hx;
  [[11,12,-6],[17,15,7],[24,17,-8],[31,13,6]].forEach(([y,l,ph],n)=>{const P=[];for(let i=0;i<=8;i++){const u=i/8;P.push([hx-7-u*l,y+rise*.3+Math.sin(u*6+ph+sw*1.4)*(1+u*2)+u*u*3]);}for(let i=0;i<8;i++)g.line(P[i][0],P[i][1],P[i+1][0],P[i+1][1],n%2?'b':'B',i<3?2:1);g.s(Math.round(P[8][0]),Math.round(P[8][1]),'W');});
  g.poly([[hx,3+rise],[hx+7,7+rise],[hx+9,17],[25,26],[26,32],[21,31],[18,38],[14,31],[11,30],[10,19],[hx-7,7+rise]],'b');g.poly([[hx,3+rise],[hx-7,7+rise],[10,19],[11,30],[14,31],[16,25],[hx+1,8+rise]],'B');
  g.path([[hx+1,18],[hx+2,30]],'b');g.px([[14,22],[17,29],[22,24],[20,34]],'W');
  g.ell(hx+.5,hy+.5,4.8,5,'K');g.rect(hx-2,hy,1,2,'E');g.rect(hx+2,hy,1,2,'E');g.s(hx-2,hy,'W');
  g.px([[hx-1,hy+3],[hx+1,hy+3]],'q');
  g.path([[hx+5,15],[(hx+5+hm[0])/2,(15+hm[1])/2+2],[hm[0],hm[1]]],'b',3);g.ell(hm[0],hm[1],1.7,1.6,'H');
  {const m=hm,e=he,dx=e[0]-m[0],dy=e[1]-m[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,px=-uy,py=ux;
   g.poly([[m[0]+px*.9,m[1]+py*.9],[e[0]-ux*3+px*1.8,e[1]-uy*3+py*1.8],[e[0]+px*3.4,e[1]+py*3.4],[e[0]-px*3.4,e[1]-py*3.4],[e[0]-ux*3-px*1.8,e[1]-uy*3-py*1.8],[m[0]-px*.9,m[1]-py*.9]],'N');
   g.line(e[0]+px*3.2,e[1]+py*3.2,e[0]-px*3.2,e[1]-py*3.2,'K',1);g.line(m[0]+ux*3,m[1]+uy*3,m[0]+ux*3+px*.1,m[1]+uy*3,'G',2);}
  if(waves){[[37,8],[38,11]].forEach(([x,y],n)=>g.path([[x,y-4-n],[x+1.5,y],[x,y+4+n]],'W',1));g.path([[33,4],[36,5]],'W');g.path([[34,18],[37,17]],'W');}
  g.px(F.i?[[6,14],[5,26],[8,34]]:[[7,13],[6,27],[7,35]],'W');
  return {pal:{B:'#8a88b8',b:'#54547e',K:'#0e0e22',E:'#c8a8ff',W:'#dff0ff',q:'#2a2850',N:'#e8e0c8',G:'#c8a850',H:'#c8c4e0'},flat:'EKW',glow:'#c8b8ff',a:{hx,hy,cx,top:3+rise,lean,hm,he,by:36}};
 }
});
['gustimp','snowharpy','yeti','stormling','gargoyle','voidspawn','stareater','mimic','drownedsailor','rimewight','galephantom'].forEach(n=>{MART[n].fr=1;});
// FAMILY4-END

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
 thornwarden(g,p){[[18,22],[40,20],[24,46],[44,40]].forEach(q=>{g.ell(q[0],q[1],1.6,1.6,'F');g.s(q[0],q[1],'Y');});g.ell(13,16,2.5,2,'M');g.rect(12,17,3,3,'W');Object.assign(p,{F:'#f06a8a',Y:'#ffe08a',M:'#d8403a'});},
 drake(g,p){g.px([[16,40],[20,36],[28,32],[32,24],[9,46]],'S');g.path([[36,8],[38,4]],'Y');Object.assign(p,{S:'#5ad0ff'});},
 cinderking(g,p){g.rect(22,0,15,1,'G');g.px([[23,2],[29,2],[35,2]],'R');g.rect(14,30,4,2,'G');g.rect(40,30,4,2,'G');Object.assign(p,{G:'#f0c050',R:'#e04848'});},
 hoarwyrm(g,p){g.px([[10,10],[14,14],[8,6],[46,14],[44,20]],'P');g.line(18,42,32,44,'P');Object.assign(p,{P:'#5a8ae0'});},
 ysolde(g,p){g.rect(24,30,14,2,'G');g.rect(22,44,18,2,'G');g.px([[30,24],[28,36],[34,40]],'C');},
 dimmer(g,p){g.px([[18,34],[44,44],[12,50],[36,28]],'H');g.px([[24,44],[40,36]],'D');}
};
function monURL(art){return monURL2(art);}
const monURL2=function(art){return cvURL('m2:'+art,()=>{const s=MON_SIZE(art),g=new PG(s,s,0,0),o=MART[art](g);const pal=Object.assign({},o.pal);if(MEXTRA[art])MEXTRA[art](g,pal);return paint(g,pal,{flat:(o.flat||'')+'YFWCPRSTO'.split('').filter(k=>!o.pal[k]).join(''),rim:o.rim,glow:o.glow});});};
function monCanvas(art,f){return monFramed(art,f,()=>{const s=MON_SIZE(art),g=new PG(s,s,0,0),o=MART[art](g,f);const pal=Object.assign({},o.pal);if(MEXTRA[art])MEXTRA[art](g,pal);return paint(g,pal,{flat:o.flat||'',rim:o.rim,glow:o.glow});});}
