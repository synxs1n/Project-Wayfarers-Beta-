// ===== mats11.js (v0.16.x): distinct material sprites =====
// 1) Menu icons (16x16): every crafting material has its own colour and silhouette (each ore, log, herb and monster part), drawn with the
//    PG grid + icPaint pipeline of icons.js (bevel from the upper left, outline, glint). icMatDraw is wrapped; the realm relics keep their
//    older icons except Kiln Ore and Verdant Moss. Guardian shards (es_*) are untouched.
// 2) Overworld gather nodes show the material they hold: the node's material is fixed per spot (hash of seed, stage, tile) with the same
//    odds gatherAt always used (healroot 40%, bluecap 30%, the tier herb 30%; ore and wood follow the stage tier), gatherAt is wrapped so the
//    first Math.random() it draws selects exactly that herb, and drawNode (2D) and hdBill (HD-2D, the node card) swap the generic bush/rock/log
//    for a small lit pile: ore glints on a rock, a stack of logs, the herb's own plant. Footprint, position and gather logic are unchanged.
// Keys in the grids: R rock, M/C ore tones, B bark, W wood end, G leaf, E glow, S white glint, X dark inset; lowercase = darker step.
const M11={art:{},node:{},pal:{},IDS:[]};
{
  const A=(id,pal,rows,x,y)=>{M11.art[id]={pal,rows,x:x||0,y:y||0};};
  // ---------------------------------------------------------------- menu icons ----------------------------------------------------------------
  A('copper',{R:'#8a7468',C:'#e8894a',V:'#4fb894'},[
    '.....RRRR.......','...RRRRRRRR.....','..RRRRCCRRRR....','.RRRRCCCCCRRRR..','.RRRRRCCCRRRRRR.','RRCCRRRRRRRRCCR.',
    'RRCCCRRRRRRCCCRR','RRRCRRRRRRRRCRRR','RRRRRRRVVRRRRRRR','.RRRRRRVVVRRRRR.','..RRRRRRVRRRRR..','...RRRRRRRRRR...'],0,2);
  A('iron',{R:'#4a5266',M:'#c0ccdf',T:'#b0562c'},[
    '..........MM....','....RR...MMMM...','...RRRR.MMMMMM..','..RRRRRRMMMMMMM.','.RRRRRRRRMMMMMM.','.RRRTRRRRRMMMMR.',
    'RRRRTTRRRRRRRRRR','RRRRRRRRRTRRRRRR','RRTRRRRRRTTRRRRR','.RRRRRRRRRRRRRR.','..RRRRRRRRRRRR..'],0,3);
  A('mythril',{R:'#6d7690',C:'#6fd0ff',W:'#e4f8ff'},[
    '......C.........','.....CWC....C...','.....CWCC..CWC..','....CCWCC.CCWCC.','.C..CCCCCCCCCCC.','.CWCCCCCCCCCCCC.',
    '.CCCCCCCCCCCCCC.','CCCCCCCCCCCCCCCC','RRRRRRRRRRRRRRRR','.RRRRRRRRRRRRRR.','..RRRRRRRRRRRR..'],0,3);
  A('oak',{B:'#8a5a2c',W:'#e2bc80',G:'#58b04a'},[
    '..........GG....','.........GGGG...','....BBBBBBBGG...','..BBBBBBBBBBWWW.','.BBBBBBBBBBWWbWW','.BBBBBBBBBBWbWbW',
    '.BBBBBBBBBBWWbWW','..BBBBBBBBBBWWW.','...BBBBBBBBBBB..'],0,3);
  A('ash',{B:'#c4bdae',W:'#f6ecd2',X:'#4a463a'},[
    '..BBBBBBBBBBWWW.','..BXBBBBBXBBWXW.','..BBBBBBBBBBWWW.','...BBBBBBBBBBWWW','...BXBBBBBXBBWXW','...BBBBBBBBBBWWW',
    '..BBBBBBBBBBWWW.','..BBXBBBBBBBWXW.','..BBBBBBBBBBWWW.'],0,4);
  A('elder',{B:'#4c3a56',W:'#7a5a96',E:'#c8a2ff',G:'#4c9a54'},[
    '..G.........G...','..GG..BBBB.GG...','...BBBBBBBBBB...','..BBBEBBBBBBBWW.','.BBBBEEBBBBBWEWW','.BBBBBBBBBBBWEEW',
    '.BBBBBBBEBBBWEWW','..BBBBBBBBBBBWW.','..GGBBBBBBBBGG..','...GGGGBBBGGG...'],0,3);
  A('healroot',{R:'#e8c49c',G:'#58b84a',T:'#c8503c'},[
    '....G..G..G.....','...GGG.GG.GG....','....GGGGGGG.....','.....GGGGG......','....RRRRRR......','...RRRRRRRR.....',
    '...RRTRRRRR.....','....RRRTRRR.....','....RRRRRR......','.....RRRRR......','....R.RR.R......','...R...R..R.....'],0,2);
  A('bluecap',{C:'#4f84ee',W:'#f2ecd8',G:'#58b84a'},[
    '................','....CCCCCCC.....','..CCCCWCCCCCC...','.CCCWWCCCCWCCC..','CCCCWWCCCCCCCCC.','CCCCCCCCCCCCCCC.',
    '.WWWWWWWWWWWWW..','.....WWWWW......','.....WWWWW......','....WWWWWWW.....','..GG.WWWWW.GG...','...GGGGGGGGG....'],0,2);
  A('sunpetal',{Y:'#ffd23c',C:'#8a5a20',G:'#58b84a'},[
    '.....YY..YY.....','....YYYYYYYY....','...YYYYCCYYYY...','..YYYYCCCCYYYY..','..YYYYCCCCYYYY..','...YYYYCCYYYY...',
    '....YYYYYYYY....','.....YY.GY......','........G.......','....GG..G.......','...GGGG.GG......','.....G..G.......'],0,2);
  A('starbloom',{V:'#e2cfff',Y:'#fff0a8',G:'#4aa86a'},[
    '.......V........','.......V........','......VVV.......','VV....VVV....VV.','.VVVVVVYVVVVVV..','..VVVVYYYVVVV...',
    '....VVVYVVV.....','....VVV.VVV.....','...VV..G..VV....','.......G........','....GG.G.GG.....','.....GGGGG......'],0,2);
  A('hide',{C:'#a8784a',T:'#e8d2a8'},[
    '..CC......CC....','.CCCC....CCCC...','.CCCCCCCCCCCC...','CCCCCCCCCCCCCC..','.CCCCCCTCCCCCC..','.CCCCTCCCTCCCC..',
    'CCCCCCCCCCCCCCC.','.CCCCCTCCTCCCC..','..CCCCCCCCCCC...','.CCCCC..CCCCC...','.CC..C..C..CC...','CC..........CC..'],0,2);
  A('ichor',{G:'#6ff0d0',V:'#bfeedd',X:'#3a4a58'},[
    '.....XXXX.......','.....XVVX.......','......VV........','.....XVVX.......','....XGGGGX......','...XGGGSGGX.....',
    '..XGGGGGGGGX....','..XGGGGGGGGX....','..XGGGGGGGGX....','...XGGGGGGX.....','....XXXXXX......'],0,2);
  A('grit',{R:'#b09c78',D:'#7a6a52',W:'#e2d4b0'},[
    '................','.......RR.......','......RRRR......','.....RRWRRR.....','..RR.RRRRRRR....','.RRRRRRRRRRRRR..',
    'RRRWRRRRRRRRRR..','RRRRRRRDRRRRRRR.','RRRRRDDRRRRWRRR.','.RRRRRRRRRRRRR..','..RRRRRRRRRR....'],0,3);
  A('ore',{R:'#4a3a3c',E:'#ff8a3a',Y:'#ffd070'},[
    '....RRRRRR......','..RRRRRRRRRR....','.RRRERRRRRERR...','.RRRERRRRREERR..','RRRRREERRRERRRR.','RRERRREERREERRR.',
    'RRERRRRYERRRRRR.','RREERRRREEERRRR.','.RRERRRRRERRRR..','.RRRRRRRRRRRR...','..RRRRRRRRRR....'],0,2);
  A('moss',{G:'#5aa840',D:'#3a7a2c',R:'#7a6a58'},[
    '................','....G.......G...','...GGG..G..GG...','..GGGGGGGGGGG...','.GGGGDGGGGGDGG..','GGGDGGGGGGGGGGG.',
    'GGGGGGGGDGGGGGG.','.GGGGGGGGGGGGG..','..RRRRRRRRRRRR..','...RRRRRRRRRR...'],0,3);
  M11.IDS=Object.keys(M11.art);
  // ---------------------------------------------------------------- overworld node piles ----------------------------------------------------------------
  // each is a 16x16 tile; the shadow and sparkle are drawn by the code below
  const N=(id,pal,rows,sp)=>{M11.node[id]={pal,rows,sp};};
  N('copper',{R:'#86706a',C:'#f09450',V:'#4fb894'},[
    '................','................','................','......RRRR......','....RRRRRRRR....','...RRCCRRRRRR...','..RRRCCCRRRCCR..',
    '.RRRRRCRRRRCCCR.','.RRRRRRRRRRRCRRR','RRCCRRRRVVRRRRRR','RRCCCRRRVVVRRRR.','.RRRRRRRRRRRRR..'],[[5,6],[12,8]]);
  N('iron',{R:'#4e566c',M:'#d4dce8',T:'#b0562c'},[
    '................','................','................','.........MM.....','....RR..MMMM....','...RRRRRMMMMM...','..RRRRRRRMMMMM..',
    '.RRRRTRRRRMMMR..','RRRRRTTRRRRRRRR.','RRRRRRRRRTRRRRRR','RRTRRRRRRRTRRRR.','.RRRRRRRRRRRRR..'],[[10,4],[12,6]]);
  N('mythril',{R:'#646c86',C:'#70d2ff',W:'#eafaff'},[
    '................','................','.....C..........','....CWC....C....','....CWCC..CWC...','...CCWCC.CCWCC..','..CCCCCCCCCCCC..',
    '.CCCCCCCCCCCCC..','.RRRRRRRRRRRRRR.','RRRRRRRRRRRRRRR.','.RRRRRRRRRRRR...','................'],[[6,3],[11,3]]);
  N('sunpetal',{Y:'#ffd23c',C:'#8a5a20',G:'#58b84a'},[
    '................','................','...YY.......YY..','..YYYY.....YYYY.','.YYYCCY...YYCCYY','.YYCCCY...YCCCYY','..YYYY.....YYYY.',
    '...G.GG....G....','...GG.G...GG....','..GGGGGGGGGGGG..','...GGGGGGGGGG...','................'],[[4,2],[12,2]]);
  N('starbloom',{V:'#e2cfff',Y:'#fff0a8',G:'#4aa86a'},[
    '................','................','......V.........','.....VVV....V...','..V.VVYVV..VVV..','.VVVVYYYVVVVYVV.','..VVVVYVVV.VVV..',
    '...VV.VVV...V...','....G..G....G...','..G.GGGG.GGG....','...GGGGGGGGG....','................'],[[7,2],[11,3],[3,5]]);
  // log stacks seen end on: bark ring, pale wood, dark core (E glow for elder)
  const logs=(ck)=>{const g=Array.from({length:16},()=>Array(16).fill('.'));
    [[7.5,4.5],[4.5,9],[10.5,9]].forEach(([cx,cy])=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.hypot(x+.5-cx-.5,y+.5-cy-.5);if(d<=3.1)g[y][x]=d<=.9?ck:d<=1.7?'W':'B';}});
    return g.map(r=>r.join(''));};
  N('oak',{B:'#8a5a2c',W:'#e2bc80',X:'#a8743a'},logs('X'),[[7,3]]);
  N('ash',{B:'#c4bdae',W:'#f6ecd2',X:'#6a6454'},logs('X'),[[7,3]]);
  N('elder',{B:'#4c3a56',W:'#6a4a86',E:'#d2b2ff',G:'#4c9a54'},logs('E').map((r,j)=>j===8||j===3?r.replace(/B(?=.{0,0}$)/,'B'):r),[[7,3],[3,8]]);
  N('healroot',{R:'#e8c49c',G:'#58b84a',T:'#c8503c'},[
    '................','................','.....G...G......','..G..GG..GG.G...','..GG.GGG.GG.GG..','...GGGGGGGGGG...','....GGGGGGGG....',
    '....GRRRRRRG....','...GRRRTRRRRG...','....RRRRTRRR....','.....RRRRRR.....','......R..R......'],[[12,4]]);
  N('bluecap',{C:'#4f84ee',W:'#f2ecd8',G:'#58b84a'},[
    '................','................','.....CCCCC......','...CCCCWWCCC....','..CCWWCCCCCCC...','..CCCCCCCCCCC...','...WWWWWWWWW....',
    '......WWW.......','......WWW..CCC..','.CCC..WWW.CWCCC.','CCWCC.WWW.WWWWW.','.WWW..WWW...WW..','GGGGGGGGGGGGGGG.'],[[8,3],[13,9]]);
  // node palettes for every other material: a crate (parts) or a plinth (relics) holding the material colour
  M11.crate=['................','................','................','................','................','................','................',
    '....CCCCCCCC....','...CCCCCCCCCC...','..BBBBBBBBBBBB..','..BKKBBBBBBKKB..','..BBBKKBBKKBBB..','..BBBBBBBBBBBB..','..BKKBBBBBBKKB..','..BBBBBBBBBBBB..'];
}
const m11PartCol={hide:'#a8784a',fang:'#ece2c8',scale:'#4aa08a',ichor:'#6ff0d0',grit:'#b09c78'};
// ---------------------------------------------------------------- painting ----------------------------------------------------------------
function m11Pal(pal){const P=icPal(1);Object.keys(pal).forEach(k=>{P[k]=pal[k];});return P;}
function m11Buf(spec){const b=icBuf();spec.rows.forEach((s,j)=>{for(let i=0;i<s.length;i++){const c=s[i];if(c!=='.'&&c!==' ')icSet(b,(spec.x||0)+i,(spec.y||0)+j,c);}});return b;}
function m11IconDraw(x,id){const sp=M11.art[id],P=m11Pal(sp.pal),b=m11Buf(sp);P.S='#ffffff';
  // a white glint on the upper left of the main mass
  const g={copper:[5,6],iron:[11,5],mythril:[7,6],oak:[4,6],ash:[4,6],elder:[5,7],healroot:[5,10],bluecap:[5,6],sunpetal:[8,6],starbloom:[8,7],hide:[4,6],ichor:[6,9],grit:[4,10],ore:[6,5],moss:[4,6]}[id];
  const o={};if(id==='ore'){o.aura='#ff7a2a';o.auraA=.3;}if(id==='mythril'){o.aura='#7ad8ff';o.auraA=.25;}if(id==='starbloom'){o.aura='#e2cfff';o.auraA=.25;}if(id==='elder'){o.aura='#b48aff';o.auraA=.18;}
  if(id==='ichor'){o.aura='#7af0d0';o.auraA=.22;}
  icPaint(x,b,P,o);if(g){x.fillStyle='#ffffff';x.fillRect(g[0],g[1],1,1);}}
function m11Canvas(id){const c=mkCv(16,16);icMatDraw(c.getContext('2d'),id);return c;}
// the 24 guardian shards share 16 (shape, glyph) pairs and some differ by only a few pixels: from the 9th on a white bar on a dark base along the bottom edge keeps them apart
{const f0=icMatDraw;icMatDraw=function(x,id){if(M11.art[id]){try{return m11IconDraw(x,id);}catch(e){}}
  const r=f0.apply(this,arguments);try{if(/^es_/.test(id)&&typeof IC_ESI!=='undefined'&&IC_ESI){const i=IC_ESI[id]||0,k=Math.floor(i/8);if(k>0){x.fillStyle='#150b17';x.fillRect(3,k>1?12:13,10,k>1?4:3);x.fillStyle='#ffffff';x.fillRect(4,14,8,1);if(k>1)x.fillRect(4,13,8,1);}}}catch(e){}return r;};}
// node sprite for any material id (gatherable ones have a pile, the rest a crate with the material's colour on top)
function m11NodeDraw(ctx,id,px,py,tw){
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(px+2,py+13,12,2);ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(px+1,py+13,14,1);
  let sp=M11.node[id];
  if(!sp){const fam=MAT_OF[id]||{},col=m11PartCol[id]||fam.c||'#c4b28c';sp={pal:{C:col,B:'#7a4a24',K:'#5a3418'},rows:M11.crate,sp:[[7,6]]};}
  const P=m11Pal(sp.pal),b=icBuf();sp.rows.forEach((s,j)=>{for(let i=0;i<s.length;i++){const c=s[i];if(c!=='.'&&c!==' ')icSet(b,i,j,c);}});
  const cv=mkCv(16,16),cx=cv.getContext('2d');icPaint(cx,b,P,{});ctx.drawImage(cv,px,py);
  const s=(sp.sp||[[7,6]])[Math.abs(Math.floor(tw||0))%((sp.sp||[[1]]).length)||0]||[7,6];
  if(tw===0){ctx.fillStyle='#ffffff';ctx.fillRect(px+s[0],py+s[1]-1,1,3);ctx.fillRect(px+s[0]-1,py+s[1],3,1);}else if(tw===1){ctx.fillStyle='#fff6c0';ctx.fillRect(px+s[0],py+s[1],1,1);}}
m11NodeDraw=HOOK.def('m11NodeDraw',m11NodeDraw);// v0.19.2: worldart12.js draws the gather nodes in the world's palette
// ---------------------------------------------------------------- which material a node holds ----------------------------------------------------------------
function m11Hash(m,n){let h=(Math.imul(n.x+1,73856093)^Math.imul(n.y+7,19349663)^Math.imul((m.s|0)+3,83492791)^Math.imul((G&&G.run&&G.run.seed|0)+11,2654435761))>>>0;h=Math.imul(h^(h>>>15),2246822519)>>>0;h=(h^(h>>>13))>>>0;return (h%1000)/1000;}
function m11NodeMat(m,n){if(n.mat)return n.mat;const t=matTier(m.s|0);let id;
  if(n.k==='herb'){const r=m11Hash(m,n);id=r<.4?'healroot':r<.7?'bluecap':TIERED.herb[t];n.mr=r<.4?.2:r<.7?.55:.85;}else id=(TIERED[n.k]||[])[t];
  if(id)n.mat=id;return n.mat;}
{const p0=placeNodes;placeNodes=function(m){const r=p0.apply(this,arguments);try{(m.nodes||[]).forEach(n=>m11NodeMat(m,n));}catch(e){}return r;};}
{const g0=gatherAt;gatherAt=function(m,x,y){const n=(m&&m.nodes||[]).find(q=>q.x===x&&q.y===y);
  if(!n||n.k!=='herb'||!m11NodeMat(m,n)||(G.gath&&G.gath[m.id+':'+x+','+y]))return g0.apply(this,arguments);
  const real=Math.random;let first=true;Math.random=function(){if(first){first=false;return n.mr;}return real.apply(Math,arguments);};
  try{return g0.apply(this,arguments);}finally{Math.random=real;}};}
{const d0=drawNode;drawNode=function(ctx,n,px,py,now){let id=n&&n.mat;
  if(!id&&n&&n.k&&typeof WS!=='undefined'&&WS.m&&(WS.m.nodes||[]).includes(n)){try{id=m11NodeMat(WS.m,n);}catch(e){}}
  if(id&&M11.node[id]){const tw=Math.floor(now/260+n.x*3+n.y)%9;m11NodeDraw(ctx,id,px,py,tw<2?tw:2);return;}
  return d0.apply(this,arguments);};}
// HD-2D: the node card is built once per kind and twinkle step; swap it for the material's card (found by its position)
const M11HD={};
{const b0=hdBill;hdBill=function(bt,key,cv,fx,fy,fz,flip,sc,r,g,b,a,fl){
  if(typeof key==='string'&&key.charCodeAt(0)===110&&/^node:(wood|ore|herb):(\d)$/.test(key)){try{const m=WS.m,tx=Math.round((fx-8)/TS),ty=Math.round((fz-14)/TS),n=m&&(m.nodes||[]).find(q=>q.x===tx&&q.y===ty),id=n&&m11NodeMat(m,n);
    if(id&&M11.node[id]){const st=+key.slice(-1),k2='node11:'+id+':'+st;let c=M11HD[k2];if(!c){c=M11HD[k2]=mkCv(16,16);m11NodeDraw(c.getContext('2d'),id,0,0,st);}key=k2;cv=c;}}catch(e){}}
  return b0.call(this,bt,key,cv,fx,fy,fz,flip,sc,r,g,b,a,fl);};}
// test hooks
try{window.__M11={M11,M11HD,iconCanvas:m11Canvas,nodeCanvas:(id,st)=>{const c=mkCv(16,16);m11NodeDraw(c.getContext('2d'),id,0,0,st==null?2:st);return c;},nodeMat:m11NodeMat};}catch(e){}
