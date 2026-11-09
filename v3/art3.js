// ===== art3.js (base): the 60x60 guardian sprites =====
Object.assign(MART,{
 bonecolossus(g){
  g.ell(30,57,24,3,'D');
  g.path([[22,40],[20,48],[18,57]],'A',5);g.path([[36,40],[38,48],[40,57]],'A',5);g.ell(20,48,3,2.5,'B');g.ell(38,48,3,2.5,'B');
  g.rect(14,55,9,3,'A');g.rect(36,55,9,3,'A');
  g.ell(29,39,11,4.5,'A');g.ell(29,39,6,2,'K');
  g.path([[29,39],[30,28],[31,18]],'A',3);
  for(let i=0;i<5;i++){const y=21+i*3.6,w=11-i*.8;g.path([[31-w,y+3],[30-w*.5,y],[31,y-1],[32+w*.5,y],[32+w,y+3]],'A',2);}
  g.path([[20,20],[14,30],[10,40]],'A',4);g.ell(10,41,3,3,'A');
  g.path([[40,20],[47,27],[50,19]],'A',4);g.path([[50,22],[54,2]],'S',5);g.ell(54,4,5,4,'S');g.px([[52,2],[56,5],[53,7]],'M');
  g.ell(32,18,11,3,'A');
  g.ell(37,10,9.5,8.5,'A');g.rect(32,15,12,5,'A');g.rect(33,18,10,1,'K');for(let x=33;x<44;x+=2)g.s(x,17,'B');
  g.ell(34,9,2.6,2.6,'K');g.ell(41,9,2.6,2.6,'K');g.rect(34,9,1,1,'E');g.rect(41,9,1,1,'E');g.poly([[37,12],[38,15],[36,15]],'K');
  g.px([[30,4],[44,6],[18,26],[44,32]],'M');g.ell(26,44,2,1.5,'M');
  return {pal:{A:'#e8dcc0',B:'#b8a888',K:'#1a1020',E:'#c890ff',S:'#7a6a5a',M:'#5a8a3a',D:'#3a2a3a'},flat:'KE',rim:'#2a1a2a'};
 },
 queenmantis(g){
  g.ell(30,57,20,3,'D');
  g.path([[24,44],[18,52],[14,57]],'B',2);g.path([[30,44],[30,52],[28,57]],'B',2);g.path([[34,42],[40,50],[44,57]],'B',2);
  g.ell(22,40,13,6,'A');g.poly([[10,38],[2,44],[8,40]],'A');for(let i=0;i<4;i++)g.line(14+i*5,36,14+i*5,45,'B');
  g.poly([[22,34],[2,12],[6,8],[24,30]],'W');g.poly([[26,34],[12,6],[18,4],[28,30]],'W');g.line(4,11,22,32,'w');g.line(15,6,26,30,'w');
  g.path([[30,38],[34,26],[36,18]],'A',5);
  g.path([[36,22],[44,26],[48,18]],'A',3);g.poly([[48,18],[52,4],[56,2],[50,20]],'M');g.path([[49,16],[53,5]],'w');
  g.path([[34,24],[40,32],[46,30]],'B',3);g.poly([[46,30],[56,24],[58,26],[47,33]],'M');
  g.poly([[32,16],[38,4],[46,8],[44,16],[38,19]],'A');g.ell(42,9,3.2,3.6,'E');g.ell(35,10,2.6,3,'E');g.px([[43,8],[36,9]],'K');
  g.path([[38,4],[34,-2]],'B');g.path([[42,5],[46,-2]],'B');g.rows(36,2,["G.G.G","GGGGG"]);
  g.poly([[44,15],[47,17],[44,18]],'B');
  return {pal:{A:'#6ab84a',B:'#3a7a34',W:'#c8f0a0',w:'#8ac870',M:'#e8f0d0',E:'#f2d43a',K:'#1a1020',G:'#f0c050',D:'#1e3a1e'},flat:'EKG'};
 },
 gloomcap(g){
  g.ell(30,57,24,3,'D');
  g.poly([[22,56],[22,34],[38,34],[39,56]],'S');g.ell(30,56,10,2,'S');g.line(25,36,25,54,'s');g.line(35,36,35,54,'s');
  g.ell(26,44,2,2.5,'E');g.ell(34,44,2,2.5,'E');g.ell(30,50,3,1.4,'K');
  g.ell(30,22,27,15,'C');g.rect(3,26,54,8,'C');g.ell(30,34,26,3,'I');for(let x=6;x<56;x+=3)g.line(x,32,30+(x-30)*.6,36,'i');
  [[14,16,4],[30,10,5],[44,18,4],[22,26,3],[40,28,3],[8,28,2.5],[52,27,2.5],[36,20,2]].forEach(([x,y,r])=>g.ell(x,y,r,r*.8,'Y'));
  g.ell(8,52,4,3,'C');g.rect(7,52,3,5,'S');g.ell(51,53,3.5,2.5,'C');g.rect(50,53,2,4,'S');g.px([[7,51],[50,52]],'Y');
  g.px([[4,8],[56,6],[12,2],[48,0],[2,40],[58,42]],'Y');
  return {pal:{C:'#5a3a8a',I:'#8a6aa8',i:'#6a4a88',S:'#d8c8b0',s:'#b8a890',E:'#7af0d0',K:'#2a1a2a',Y:'#7af0d0',D:'#1e1430'},flat:'EYK',glow:'#3ad0b0'};
 },
 ironsentinel(g){
  g.ell(30,57,22,3,'D');
  g.rect(18,44,8,12,'A');g.rect(34,44,8,12,'A');g.rect(16,54,12,4,'B');g.rect(32,54,12,4,'B');g.rect(19,46,6,2,'C');g.rect(35,46,6,2,'C');
  g.rect(14,20,32,26,'A');g.rect(14,20,32,3,'L');g.rect(14,43,32,3,'B');
  g.rect(22,27,16,12,'B');g.rect(24,29,12,8,'F');g.rect(26,31,8,4,'Y');for(let x=24;x<36;x+=3)g.rect(x,29,1,8,'B');
  [[16,23],[43,23],[16,41],[43,41],[30,24]].forEach(([x,y])=>g.s(x,y,'L'));
  g.rect(4,22,10,10,'A');g.rect(2,32,9,14,'A');g.rect(0,44,12,7,'B');g.rect(3,46,6,3,'C');
  g.rect(46,22,10,10,'A');g.rect(48,32,9,14,'A');g.rect(46,44,13,7,'B');g.rect(49,46,7,3,'C');
  g.path([[10,20],[8,12],[12,8]],'C',2);g.path([[50,20],[52,12],[48,8]],'C',2);g.ell(12,7,2,2,'Z');g.ell(48,7,2,2,'Z');
  g.rect(24,9,14,11,'A');g.rect(24,9,14,2,'L');g.rect(27,13,11,3,'K');g.rect(32,14,5,1,'Z');g.rect(28,5,2,4,'C');g.ell(29,4,2,1.5,'Z');
  g.px([[6,12],[4,16],[54,13],[56,17],[30,0]],'Z');
  return {pal:{A:'#6a6a7a',B:'#3e3e4c',L:'#9a9aaa',C:'#c87a3a',F:'#ff6a1a',Y:'#ffe08a',K:'#141018',Z:'#7af0ff',D:'#24202c'},flat:'FYZK'};
 },
 siren(g){
  g.ell(30,57,20,3,'D');
  g.path([[24,40],[22,48],[28,54],[40,55],[48,50]],'T',8);g.path([[48,50],[52,44]],'T',5);g.poly([[50,46],[58,38],[56,46],[59,52],[51,50]],'F');
  for(let i=0;i<5;i++)g.ell(25+i*4,46+i*1.5,1.6,1,'t');
  g.poly([[18,24],[30,22],[30,42],[20,42]],'S');g.ell(26,32,4,3,'P');
  g.path([[20,26],[12,34],[14,42]],'S',3);g.path([[30,26],[38,30],[42,24]],'S',3);
  g.line(42,30,46,4,'G');g.ell(46.5,4,3,3,'P');
  g.ell(26,16,7,8,'S');g.ell(23,14,8,10,'H');g.poly([[18,10],[10,30],[14,40],[20,24]],'H');g.rect(26,14,7,10,'S');
  g.rect(29,16,2,1,'E');g.s(31,20,'m');g.rows(20,5,["P.P.P.P","PPPPPPP"]);
  g.px([[6,10],[10,4],[52,8],[56,20]],'P');
  return {pal:{S:'#a8d8d0',H:'#3a6ac8',T:'#2b8a9a',t:'#5ac0c0',F:'#7ae0f0',P:'#f4f0ff',G:'#f0c050',E:'#f4f0ff',m:'#3a6a7a',D:'#16324a'},flat:'EP'};
 },
 ashwyvern(g){
  g.ell(30,57,24,3,'D');
  g.poly([[24,26],[2,6],[4,18],[0,28],[8,30],[6,38],[20,34]],'W');g.path([[24,26],[2,6]],'A',2);g.line(4,18,20,30,'w');g.line(6,32,20,32,'w');
  g.path([[14,40],[8,46],[2,44]],'A',4);g.poly([[2,44],[0,40],[4,42]],'E');
  g.ell(24,38,12,8,'A');g.ell(26,42,8,4,'B');
  g.path([[20,44],[18,52],[16,57]],'A',4);g.path([[30,44],[32,52],[34,57]],'A',4);g.rect(12,55,7,3,'B');g.rect(31,55,7,3,'B');
  g.path([[30,32],[38,22],[42,14]],'A',6);
  g.poly([[36,26],[58,4],[56,16],[60,26],[52,28],[54,36],[40,32]],'W');g.path([[36,26],[58,4]],'A',2);g.line(56,16,40,30,'w');
  g.ell(46,12,7,5,'A');g.poly([[48,10],[60,13],[59,16],[49,17]],'A');g.px([[52,15],[55,15],[58,15]],'K');g.rect(47,10,2,2,'E');g.poly([[40,9],[36,2],[43,7]],'B');
  [[22,36],[28,40],[18,40],[34,24],[44,16],[24,46]].forEach(([x,y])=>{g.s(x,y,'E');g.s(x+1,y,'Y');});
  g.px([[10,4],[20,2],[54,40],[50,46]],'Y');
  return {pal:{A:'#5a5058',B:'#3a343c',W:'#8a5a4a',w:'#6a443a',E:'#ff6a2a',Y:'#ffd04a',K:'#140c10',D:'#24181a'},flat:'EYK'};
 },
 frostlich(g){
  g.ell(30,57,16,2.5,'D');
  g.poly([[18,24],[42,24],[46,52],[38,48],[30,54],[22,48],[14,52]],'R');g.poly([[22,24],[30,22],[38,24],[34,50],[30,52],[26,50]],'r');g.line(30,26,30,50,'T');g.line(18,24,14,52,'T');g.line(42,24,46,52,'T');
  g.path([[20,28],[12,36],[14,42]],'R',4);g.ell(14,43,2.5,2,'B');
  g.path([[40,28],[46,34],[48,30]],'R',4);g.rect(44,24,9,7,'K');g.rect(45,25,7,5,'P');g.line(48,25,48,29,'K');
  g.ell(30,15,7,7.5,'B');g.rect(26,19,8,4,'B');g.ell(27,14,2,2,'K');g.ell(33,14,2,2,'K');g.s(27,14,'E');g.s(33,14,'E');g.rect(27,21,6,1,'K');
  g.poly([[22,9],[24,0],[26,7],[28,-2],[30,6],[32,-1],[34,7],[36,0],[38,9]],'I');
  g.poly([[23,12],[30,6],[37,12],[38,20],[22,20]],'R');g.ell(30,15,6,6.5,'B');g.ell(27,14,2,2,'K');g.ell(33,14,2,2,'K');g.s(27,14,'E');g.s(33,14,'E');
  [[6,14],[54,10],[8,48],[52,46],[4,30]].forEach(([x,y])=>g.poly([[x,y-3],[x+2,y],[x,y+3],[x-2,y]],'I'));
  return {pal:{R:'#2a3a5a',r:'#1e2a44',T:'#8fdcf0',B:'#e8eef8',K:'#0c1424',E:'#7af0ff',P:'#d8e4f0',I:'#bfefff',D:'#0c1830'},flat:'EK',glow:'#5ab0e0'};
 },
 nidhra(g){
  g.ell(28,22,20,20,'O');g.ell(28,22,17,17,0);
  g.ell(30,57,26,3,'D');
  g.poly([[22,30],[0,8],[4,22],[0,34],[10,34],[8,44],[22,40]],'W');g.path([[22,30],[0,8]],'A',2);g.line(4,22,20,36,'w');g.line(8,40,20,38,'w');
  g.path([[8,52],[14,48],[24,50],[36,54],[50,52]],'A',6);g.poly([[50,52],[58,48],[56,54]],'F');
  g.ell(28,42,13,9,'A');g.ell(30,46,9,4,'B');for(let i=0;i<4;i++)g.rect(24+i*3,44,2,5,'b');
  g.path([[22,48],[20,57]],'A',4);g.path([[34,48],[36,57]],'A',4);g.rect(16,55,7,3,'b');g.rect(33,55,7,3,'b');
  g.path([[34,36],[42,26],[46,16]],'A',7);
  g.ell(48,12,8,6,'A');g.poly([[50,10],[60,13],[59,18],[50,18]],'A');g.px([[53,17],[56,17],[59,17]],'w');
  g.ell(49,10,2.2,2.2,'E');g.s(50,10,'K');g.poly([[42,8],[38,0],[46,5]],'B');g.poly([[46,6],[48,-1],[50,5]],'B');
  [[26,38],[30,42],[34,40],[20,44],[40,30],[44,20]].forEach(([x,y])=>g.s(x,y,'F'));
  g.px([[56,4],[4,50],[58,30]],'F');
  return {pal:{A:'#2a1e38',B:'#3e2a5a',b:'#1a1226',W:'#4a2a5a',w:'#6a3a7a',F:'#ff5a2a',E:'#ffd04a',K:'#140810',O:'#f6e7a8',D:'#120a1a'},flat:'FEKO',rim:'#140a1e'};
 },
 hollowking(g){
  g.ell(30,57,20,3,'D');
  g.poly([[18,20],[8,56],[50,56],[40,20]],'C');g.poly([[22,20],[16,56],[24,56],[26,24]],'c');
  g.rect(20,40,7,16,'A');g.rect(32,40,7,16,'A');g.rect(18,53,10,4,'B');g.rect(31,53,10,4,'B');
  g.rect(18,22,22,20,'A');g.rect(18,22,22,3,'L');g.rect(24,26,10,10,'K');g.rect(18,38,22,3,'G');g.px([[28,30],[30,32]],'Z');
  g.ell(16,23,5,4,'A');g.ell(42,23,5,4,'A');g.rect(12,26,6,14,'A');g.rect(40,26,6,10,'A');
  g.path([[44,34],[48,30]],'A',4);g.rect(46,-2,4,36,'M');g.rect(47,0,2,30,'m');g.rect(42,32,12,3,'G');g.rect(46,35,4,6,'B');g.poly([[46,-2],[48,-6],[50,-2]],'M');
  g.ell(29,13,8,8,'A');g.rect(21,13,16,7,'A');g.rect(24,12,11,3,'K');g.rect(28,15,2,6,'K');
  g.rows(21,1,["G..G..G..G..G..G","GG.GG.GG.GG.GG.G","GGGGGGGGGGGGGGGG","GGZGGGGZGGGGZGGG"]);
  g.px([[2,10],[6,4],[4,20],[56,48],[58,40]],'Z');g.path([[4,4],[8,10],[5,14],[9,20]],'Z');
  return {pal:{A:'#3a3a4a',B:'#242430',L:'#5a5a6e',K:'#05030a',C:'#5a1a2a',c:'#3a0e1a',G:'#c8a050',M:'#9a9aaa',m:'#d8d8e8',Z:'#f2c93a',D:'#140e18'},flat:'KZ',rim:'#0a0610'};
 },
 seraph(g){
  g.ell(30,57,18,3,'D');
  const wing=(pts,k)=>g.poly(pts,k);
  wing([[26,24],[2,2],[6,14],[0,20],[10,24]],'W');wing([[26,28],[0,22],[4,32],[0,38],[14,34]],'X');wing([[26,32],[4,42],[10,46],[8,52],[20,42]],'Y');
  wing([[34,24],[58,2],[54,14],[60,20],[50,24]],'W');wing([[34,28],[60,22],[56,32],[60,38],[46,34]],'X');wing([[34,32],[56,42],[50,46],[52,52],[40,42]],'Y');
  g.poly([[24,22],[36,22],[42,56],[18,56]],'R');g.poly([[28,22],[32,22],[34,56],[26,56]],'r');g.rect(22,34,16,2,'G');
  g.path([[24,24],[18,32],[20,38]],'S',3);g.path([[36,24],[42,30],[46,26]],'S',3);g.line(46,58,46,0,'G');g.poly([[44,4],[46,-4],[48,4],[46,8]],'L');
  g.ell(30,15,6,7,'S');g.ell(29,12,7,6,'H');g.rect(31,13,5,6,'S');g.rect(33,15,2,1,'E');g.poly([[22,12],[18,26],[24,20]],'H');
  g.ell(30,5,10,3,'O');g.ell(30,5,7,1.6,0);
  [[8,8],[52,6],[4,30],[56,30],[10,50],[50,50]].forEach(([x,y])=>g.s(x,y,'L'));
  return {pal:{W:'#e8c060',X:'#c89048',Y:'#5a5050',R:'#f2ead2',r:'#d8ccb0',G:'#f0c050',S:'#f0d8c0',H:'#f4ecd4',E:'#ff8a2a',O:'#ffe27a',L:'#fff6c8',D:'#2a1e14'},flat:'EOL',glow:'#ffcf70'};
 }
});
Object.assign(MEXTRA,{
 bonecolossus(g,p){g.px([[24,30],[36,28],[22,22]],'E');},
 queenmantis(g,p){g.px([[16,40],[26,42]],'Y');p.Y='#c8e04a';},
 gloomcap(g,p){},ironsentinel(g,p){},siren(g,p){},ashwyvern(g,p){},frostlich(g,p){},nidhra(g,p){},hollowking(g,p){},seraph(g,p){}
});
// ===== v0.12.6: the frame API for guardians and bosses: a 2-frame idle =====
// bossHasIdle(u): a foe that is a 60x60 guardian (BIG_ART, summons keep the '~s' suffix) or a boss. bossIdle(c,seed,now): frame 0 is the sprite
// itself, frame 1 an exhale (the upper body one pixel lower) with a soft brightening, baked once per sprite (silhouette unchanged except the
// breath). The frames alternate every 760 ms (battle, drawUnit) and 840 ms (the Sanctum guardian on the map, through imgOf 'mapboss:' keys).
// Nothing changes under reduced motion.
const BIDLE=new WeakMap();
function bigArtOn(art){try{return typeof BIG_ART!=='undefined'&&BIG_ART.includes(String(art||'').replace(/~s$/,''));}catch(e){return false;}}
function bossHasIdle(u){return !!u&&u.side!=='p'&&!!(u.boss||bigArtOn(u.art));}
function bossFrame1(c){let f=BIDLE.get(c);if(f)return f;const w=c.width,h=c.height,cut=Math.floor(h*.55);
  f=c.hd?hdCv(w,h,c.hd):mkCv(w,h);const x=f.getContext('2d');x.imageSmoothingEnabled=false;
  x.drawImage(c,0,cut,w,h-cut,0,cut,w,h-cut);x.drawImage(c,0,0,w,cut,0,1,w,cut);
  x.globalCompositeOperation='source-atop';x.globalAlpha=.2;x.fillStyle='#fff2d0';x.fillRect(0,0,w,h);BIDLE.set(c,f);return f;}
function bossIdle(c,seed,now,ms){if(typeof gfxStill==='function'&&gfxStill())return c;return Math.floor(now/(ms||760)+(seed||0)*.5)%2?bossFrame1(c):c;}
{const io0=imgOf;imgOf=function(key,fn){const c=io0.apply(this,arguments);try{if(typeof key==='string'&&key.charCodeAt(0)===109&&key.startsWith('mapboss:'))return bossIdle(c,0,performance.now(),840);}catch(e){}return c;};}
// ===== v0.12.13: the Riftkeeper, the ultimate boss (60x60; foes.js RIFTKEEPER, riftkeeper9.js) =====
// A tall hooded keeper: a peaked hood over a robe woven of rift light, a lantern cage at the chest, keys at the belt and on a ring in one
// hand, a giant key for a staff in the other, and two small doors drifting beside it. Silhouette: a narrow spire (hood and staff) over a
// wide mantle, flaring to the hem. The lantern core is the one flat accent colour: the battle swaps the sprite for riftkeeper_<element>
// so the flame shows the element it burns this turn (riftkeeper9.js). Idle: the shared 2 frame bossIdle (an exhale and a soft glow) applies
// to every boss sprite; the telegraph pose is the existing swell (anim.js bossTele).
function rkArt(g,core){
  g.ell(30,57,19,2.6,'D');
  // robe: flares from the shoulders to the hem; lit left, shaded right, thin woven threads across it
  g.poly([[21,21],[39,21],[47,56],[13,56]],'R');g.poly([[21,21],[26,21],[19,56],[13,56]],'L');g.poly([[36,23],[39,21],[47,56],[38,56]],'r');
  for(let i=0;i<5;i++){const y=26+i*6;g.line(21-i*1.6,y+4,38+i*1.6,y-2,'W');}
  for(let i=0;i<4;i++){const y=30+i*6;g.line(38+i*1.7,y+4,22-i*1.7,y-1,'w');}
  g.px([[15,57],[19,58],[24,57],[29,58],[34,57],[39,58],[44,57]],'W');
  // belt and the keys on it
  g.rect(19,43,22,2,'B');g.rect(29,43,2,2,'G');
  [[20,45],[23,45],[37,45],[40,45]].forEach(([x,y],i)=>{g.line(x,y,x,y+6,'G');g.px([[x+1,y+5],[x+1,y+3]],'g');g.s(x,y+7,'g');});
  // mantle and arms
  g.ell(30,23,12,4,'M');g.rect(19,23,22,3,'M');
  g.path([[20,24],[14,32],[12,39]],'M',4);g.path([[40,24],[45,29],[47,25]],'M',4);
  // left hand with a ring of keys
  g.ell(12,41,3,3,'F');g.ell(10,47,4.5,4.5,'G');g.ell(10,47,2.4,2.4,0);
  [[7,52],[10,53],[13,52]].forEach(([x,y])=>{g.line(x,y,x,y+5,'G');g.px([[x+1,y+4],[x+1,y+2]],'g');});
  // the giant key: bow (ring) on top, shaft, bit with teeth; held in the right hand
  g.ell(49.5,7,5,5,'G');g.ell(49.5,7,2.4,2.4,0);g.px([[45,5],[46,3]],'S');
  g.rect(48,11,3,45,'S');g.rect(48,11,1,45,'G');
  g.rect(51,14,5,2,'G');g.rect(51,18,3,2,'G');g.rect(51,22,5,2,'G');g.rect(46,52,7,4,'G');
  g.ell(49.5,27,3.2,3.2,'F');
  // hood: a tall peak, a dark face with two narrow eyes, thread fray along the edge
  g.poly([[30,1],[38,12],[41,23],[19,23],[22,12]],'H');g.poly([[30,1],[26,10],[21,23],[19,23],[22,12]],'L');
  g.ell(30,15,5.2,6.5,'K');g.rect(27,13,2,2,'E');g.rect(32,13,2,2,'E');g.s(27,13,'W');g.s(32,13,'W');
  g.px([[41,15],[42,19],[18,18],[17,22],[30,0]],'W');
  // lantern cage at the chest: gold frame, glass, the flame, bars across it
  g.rect(29,26,2,3,'G');g.poly([[25,29],[35,29],[34,27],[26,27]],'G');
  g.rect(25,29,10,13,'G');g.rect(26,30,8,11,'K');g.ell(30,35.5,3.2,3.8,'C');g.ell(30,35.5,1.4,1.8,'c');
  g.rect(28,30,1,11,'G');g.rect(32,30,1,11,'G');g.rect(25,35,10,1,'g');g.rect(25,41,10,2,'G');
  // two doors drifting beside it (arch frames with a glow inside)
  g.rows(4,4,[".GGGGGG.","GGccccGG","Gcc..ccG","Gc....cG","Gc....cG","Gc....cG","Gc....cG","Gc....cG","GGGGGGGG"]);
  g.rows(52,36,["..GGGG..",".GccccG.","Gcc..ccG","Gc....cG","Gc....cG","Gc....cG","GGGGGGGG"]);
  g.px([[3,17],[14,2],[56,34],[58,46],[55,3]],'W');
  return {pal:{R:'#2c2556',r:'#1a1538',L:'#4a4390',H:'#38326e',M:'#473f84',K:'#06030e',E:'#eef6ff',C:core,c:mix(core,'#ffffff',.55),G:'#d4b464',g:'#8e7034',S:'#b9a266',W:'#a9e6ff',w:'#6fa6d8',F:'#9a92c4',B:'#5a4a30',D:'#0c0816'},flat:'KECcW',glow:core,rim:'#0a0618'};}
MART.riftkeeper=g=>rkArt(g,'#c9a8ff');
BIG_ART.push('riftkeeper');
ELK.forEach(el=>{MART['riftkeeper_'+el]=g=>rkArt(g,ELC[el]);BIG_ART.push('riftkeeper_'+el);});
MEXTRA.riftkeeper=(g,p)=>{};
// ===== v0.13.7: four new Scourges and the fifth Calamity (60x60; foes.js, bosses9.js) =====
// Silhouettes, each its own: the Locust Choir is a pillar of insects (a tall hourglass cloud around one great singing locust), Ironmaw
// Tortoise a wide iron-plated dome with a heavy jaw low on the left, the Candleking Moth a pair of huge dusty wings under a crown of
// three burning tapers, the Brinehag Matriarch a hunched hag under a wide barnacled hat rising from a mound of kelp and net, and the
// Hollow Sun a ring of fire around a black hollow, with glass shards in orbit and salt spikes below. Idle is the shared bossIdle.
function locust(g,x,y,s,B,b,W,E){// one small locust facing left: body, head, folded wing, two legs
  g.ell(x,y,2.4*s,1.1*s,B);g.ell(x-2.6*s,y-.2*s,1.1*s,1*s,B);g.line(x-.5*s,y-1*s,x+3.4*s,y-2.4*s,W,Math.max(1,Math.round(s*.8)));
  g.s(x-3.2*s,y-.6*s,E);g.line(x+.6*s,y+.8*s,x+2.4*s,y+3*s,b);g.line(x-1*s,y+.8*s,x-1.8*s,y+3*s,b);}
Object.assign(MART,{
 locustchoir(g){
  g.ell(30,57,15,2.4,'D');
  // the cloud: an hourglass of small locusts (wide at the top and bottom, narrow in the middle), lit ones on the left
  [[8,6,.8],[20,3,.7],[34,4,.8],[47,7,.7],[14,12,.7],[27,9,.6],[41,13,.8],[52,16,.6],[7,20,.7],[17,22,.8],[44,24,.7],[51,30,.8],[12,33,.7],[46,38,.6],[8,44,.8],[19,47,.7],
   [41,45,.8],[50,50,.7],[12,54,.7],[30,53,.8],[46,56,.6],[22,38,.6]].forEach(([x,y,s])=>locust(g,x,y,s,'A','B','W','E'));
  // the conductor: one great locust, upright, wings spread and mouth open mid-note
  g.poly([[24,26],[8,10],[12,22],[6,32],[20,36]],'W');g.poly([[36,26],[52,10],[48,22],[54,32],[40,36]],'W');
  g.line(24,26,8,10,'w');g.line(36,26,52,10,'w');g.line(22,30,10,30,'w');g.line(38,30,50,30,'w');g.line(24,33,12,36,'w');g.line(36,33,48,36,'w');
  g.ell(30,38,6,12,'A');g.ell(30,42,4,8,'B');for(let i=0;i<5;i++)g.rect(26,32+i*4,8,1,'b');
  g.path([[26,48],[20,52],[16,57]],'B',2);g.path([[34,48],[40,52],[44,57]],'B',2);g.rect(12,56,6,2,'b');g.rect(42,56,6,2,'b');
  g.ell(30,20,6.5,7,'A');g.ell(28,17,3,3,'L');g.ell(26,20,2.5,2.5,'E');g.ell(34,20,2.5,2.5,'E');g.s(25,19,'W');g.s(33,19,'W');
  g.rect(27,25,6,4,'K');g.rect(28,26,4,2,'M');g.px([[27,25],[29,25],[31,25]],'W');
  g.path([[26,14],[20,6],[16,2]],'B',1);g.path([[34,14],[40,6],[44,2]],'B',1);
  // the song, drifting up as flat gold marks
  g.px([[4,30],[5,28],[6,26],[54,24],[55,22],[56,20],[3,52],[57,44],[30,0]],'Y');
  return {pal:{A:'#8a9a3a',B:'#566a26',b:'#3a4a1a',L:'#c0d060',W:'#d8cc8a',w:'#9a8a50',E:'#ff5a30',K:'#1a1008',M:'#8a2a1a',Y:'#ffe27a',D:'#2a2814'},flat:'EYM',rim:'#1a2008'};
 },
 ironmaw(g){
  g.ell(30,57,26,3,'D');
  // legs and tail
  g.poly([[52,42],[60,50],[54,52]],'F');
  // the dome: a green-brown shell banded with ship iron
  g.ell(33,32,22,19,'S');g.rect(11,32,45,12,'S');g.ell(33,32,22,19,'S');g.poly([[10,44],[56,44],[54,48],[12,48]],'s');
  g.ell(26,26,12,10,'H');g.ell(33,32,22,19,0);g.ell(33,32,22,19,'S');g.ell(25,25,11,9,'H');g.rect(11,40,45,4,'s');
  g.poly([[14,42],[16,30],[24,18],[33,14],[33,20],[28,30],[24,42]],'H');
  for(let i=0;i<4;i++){const x=15+i*12;g.line(x,43,x+6-i*2,17,'I',2);g.line(x+1,43,x+7-i*2,17,'J');}
  g.path([[11,36],[24,32],[34,31],[48,34],[55,38]],'I',3);g.path([[12,37],[24,33],[34,32],[48,35],[55,39]],'J');
  [[15,27],[24,20],[34,17],[43,22],[48,30],[18,38],[30,38],[42,38],[52,40]].forEach(([x,y])=>{g.s(x,y,'R');g.s(x+1,y,'r');});
  g.rect(16,46,11,10,'F');g.rect(16,46,3,10,'L');g.rect(38,46,12,10,'F');g.rect(47,48,3,8,'f');g.rect(14,54,14,3,'f');g.rect(36,54,16,3,'f');g.rect(18,51,7,1,'f');g.rect(40,51,8,1,'f');
  // a lighthouse growing out of the shell and a wet fringe of barnacles
  g.rect(31,3,6,13,'I');g.rect(31,3,2,13,'J');g.rect(30,2,8,2,'i');g.rect(32,0,4,3,'Y');g.px([[33,1]],'W');g.rect(31,7,6,1,'i');
  g.px([[17,22],[40,16],[46,26],[22,44],[44,44],[50,36]],'N');g.px([[13,34],[53,36]],'Q');
  // the head: low, wide, with an iron-plated lower jaw and teeth
  g.ell(8,41,9,7,'F');g.ell(6,38,5,3,'L');g.poly([[1,44],[15,44],[15,52],[3,53]],'I');g.rect(0,45,2,5,'I');g.poly([[0,43],[14,44],[14,46],[1,46]],'J');
  g.rect(1,45,13,3,'K');for(let x=2;x<13;x+=3){g.poly([[x,45],[x+1,45],[x+.5,48]],'W');}
  g.poly([[1,52],[13,52],[11,56],[3,56]],'i');g.rect(7,34,3,3,'Y');g.rect(8,35,1,1,'K');g.px([[2,43],[3,43]],'K');
  return {pal:{S:'#5a6a4a',s:'#3a4636',H:'#7a8a62',F:'#6a7a58',f:'#4a583e',L:'#8a9a70',I:'#8a92a0',J:'#c2cad6',i:'#4c5262',R:'#c8a85a',r:'#8a6a30',K:'#140a0a',W:'#e8e4d0',Y:'#ffd860',N:'#c8d0c0',Q:'#6ab8e8',D:'#1a2018'},flat:'YKW',rim:'#101810'};
 },
 candlemoth(g){
  g.ell(30,57,12,2,'D');
  // wings: broad dusty fans with veins, wax drips and a burning eyespot on each
  g.poly([[26,22],[2,4],[0,22],[6,38],[24,34]],'W');g.poly([[26,30],[6,42],[10,54],[24,44]],'X');
  g.poly([[34,22],[58,4],[60,22],[54,38],[36,34]],'W');g.poly([[34,30],[54,42],[50,54],[36,44]],'X');
  g.poly([[26,22],[2,4],[6,14],[24,26]],'w');g.poly([[34,22],[58,4],[54,14],[36,26]],'w');
  [[6,12],[3,22],[8,34]].forEach(([x,y])=>{g.line(25,26,x+1,y,'v');g.line(35,26,59-x,y,'v');});
  [[13,24],[47,24]].forEach(([x,y])=>{g.ell(x,y,6,6,'O');g.ell(x,y,4,4,'Y');g.ell(x,y,1.8,2.4,'K');g.s(x-1,y-1,'W');});
  [[10,36],[48,36],[8,44],[52,46]].forEach(([x,y])=>{g.line(x,y,x,y+5,'U');g.s(x,y+6,'U');});
  // furred body, legs, feathered antennae
  g.ell(30,36,5.5,13,'F');g.ell(28,32,2.5,8,'G');for(let i=0;i<5;i++)g.rect(26,38+i*3,8,1,'f');
  g.path([[27,46],[22,52],[20,57]],'f',2);g.path([[33,46],[38,52],[40,57]],'f',2);g.path([[30,48],[30,57]],'f',2);
  g.ell(30,20,5,5.5,'F');g.ell(28,18,2.5,2.5,'G');g.ell(27,20,1.8,2.4,'E');g.ell(33,20,1.8,2.4,'E');g.s(26,19,'W');g.s(32,19,'W');
  g.path([[27,16],[20,10],[14,6]],'f',1);g.path([[33,16],[40,10],[46,6]],'f',1);
  g.px([[18,8],[16,7],[15,5],[42,8],[44,7],[45,5]],'f');
  // the crown of three burning tapers
  [[25,10],[30,7],[35,10]].forEach(([x,y])=>{g.rect(x-1,y,3,7,'C');g.rect(x-1,y,1,7,'X');g.ell(x+.5,y-2.4,1.6,2.6,'O');g.ell(x+.5,y-1.8,.9,1.6,'Y');});
  g.rect(24,16,12,2,'U');
  g.px([[4,2],[56,2],[2,30],[58,32],[16,48],[44,50],[30,2]],'Y');
  return {pal:{W:'#cdbb98',w:'#e8dcc0',X:'#a8906a',v:'#8a6a4a',F:'#f0e8d0',f:'#b8a888',G:'#fff8e8',E:'#ff6a2a',C:'#f4ecd2',U:'#d8c890',O:'#ff9a30',Y:'#fff0a0',K:'#2a1008',D:'#2a2018'},flat:'EOYK',glow:'#ffcf70',rim:'#2a1c10'};
 },
 brinehag(g){
  g.ell(30,57,26,3,'D');
  // the mound she rises from: kelp, net and a coil of tentacle
  g.ell(30,50,25,9,'G');g.ell(26,48,16,6,'g');g.poly([[4,56],[10,44],[18,50],[10,58]],'G');g.poly([[56,56],[50,44],[42,50],[50,58]],'G');
  g.path([[8,52],[4,46],[8,42],[6,38]],'T',3);g.path([[52,52],[57,46],[52,42],[55,38]],'T',3);g.px([[6,38],[55,38],[4,46],[56,46]],'S');
  for(let i=0;i<5;i++){g.line(8+i*10,56,12+i*10,46,'n');}for(let i=0;i<4;i++)g.line(6,48+i*3,54,47+i*3,'n');
  // the cloak: a hunched wet bell, lit left
  g.poly([[18,20],[40,22],[48,52],[12,52]],'C');g.poly([[18,20],[24,20],[18,52],[12,52]],'L');g.poly([[40,22],[44,26],[48,52],[40,52]],'c');
  g.path([[14,52],[18,48],[22,53],[28,48],[34,53],[40,48],[46,52]],'c',2);
  [[22,34],[34,40],[26,44],[40,32],[18,44]].forEach(([x,y])=>{g.ell(x,y,1.6,1.2,'B');g.s(x,y-1,'W');});
  // the staff with a hooked top and a drowned lantern
  g.line(51,56,50,10,'P',2);g.path([[50,10],[48,4],[54,2],[56,6]],'P',2);g.rect(50,8,5,7,'K');g.rect(51,9,3,5,'Z');g.s(52,11,'W');
  // reaching hand with claws
  g.path([[20,26],[12,32],[6,34]],'C',4);g.ell(5,34,3,2.4,'S');g.line(2,33,0,31,'S');g.line(2,35,0,36,'S');g.line(3,32,2,30,'S');
  // head: a long face under a wide barnacled hat, seaweed hair hanging
  g.path([[22,22],[17,32],[19,46]],'G',3);g.path([[38,22],[44,32],[41,46]],'G',3);g.path([[21,24],[16,36]],'g',2);g.path([[39,24],[45,36]],'g',2);
  g.ell(30,20,6,6.5,'S');g.rect(26,24,8,3,'S');g.poly([[27,26],[33,26],[31,31],[28,30]],'S');g.rect(28,27,4,1,'K');g.poly([[27,20],[22,26],[27,25]],'S');g.px([[22,26],[23,26]],'s');
  g.ell(27,19,1.8,1.4,'E');g.ell(34,19,1.8,1.4,'E');g.s(26,18,'W');g.s(33,18,'W');
  g.poly([[30,0],[40,13],[48,16],[12,16],[20,13]],'H');g.poly([[30,0],[20,13],[12,16],[26,16]],'h');g.rect(14,15,32,3,'H');g.rect(14,17,32,1,'k');
  [[22,12],[32,8],[38,14],[26,5],[16,15],[44,15]].forEach(([x,y])=>{g.ell(x,y,1.6,1.3,'B');g.s(x,y-1,'W');});
  g.px([[2,18],[58,22],[8,8],[52,6]],'Z');
  return {pal:{C:'#2e4e5e',L:'#4a7088',c:'#1a303e',S:'#86a898',s:'#5a7a6c',G:'#3e6030',g:'#26401e',T:'#4a7a58',n:'#1a2a20',H:'#4a4a42',h:'#6a6a5e',k:'#22221e',B:'#d0c8ae',W:'#f4f0e0',P:'#6a5a44',K:'#0c1418',Z:'#6affd0',E:'#c890ff',D:'#101c20'},flat:'KZEW',glow:'#5ad0b0',rim:'#0a1418'};
 },
 hollowsun(g){
  g.ell(30,57,20,2.4,'D');
  // salt spikes and glass shards at the foot
  [[8,57,5,10],[16,57,3,6],[44,57,4,7],[52,57,3,11],[24,58,2,4],[36,58,2,5]].forEach(([x,y,w,h])=>{g.poly([[x-w/2,y],[x,y-h],[x+w/2,y]],'S');g.poly([[x-w/2,y],[x,y-h],[x,y]],'s');});
  // the corona: twelve flame prongs around the ring
  const cx=30,cy=28;
  for(let i=0;i<12;i++){const a=i*Math.PI/6+.2,r0=17,r1=i%2?24:29,dx=Math.cos(a),dy=Math.sin(a),px=-dy,py=dx;
    g.poly([[cx+dx*r0+px*3.4,cy+dy*r0+py*3.4],[cx+dx*r1,cy+dy*r1],[cx+dx*r0-px*3.4,cy+dy*r0-py*3.4]],i%3===0?'G':'F');}
  g.ell(cx,cy,19,19,'F');g.ell(cx,cy,19,19,'F');g.ell(cx-2,cy-2,16,16,'G');g.ell(cx,cy,19,19,0);g.ell(cx,cy,19,19,'F');
  g.poly([[10,22],[16,12],[26,8],[30,10],[20,16],[14,26]],'G');g.poly([[12,20],[18,13],[26,10],[22,15],[16,24]],'W');
  g.poly([[44,36],[40,44],[32,48],[38,40]],'f');
  // the hollow: a black disc with a thin bright rim and a slit of light, like a pupil
  g.ell(cx,cy,15,15,'K');g.ell(cx+1,cy+1,13.5,13.5,'V');g.ell(cx+2,cy+2,12,12,'K');
  g.line(cx-14,cy-4,cx-10,cy-10,'W');g.line(cx-10,cy-10,cx-4,cy-14,'W');
  g.poly([[cx,cy-8],[cx+2,cy],[cx,cy+8],[cx-2,cy]],'Y');g.poly([[cx,cy-5],[cx+1,cy],[cx,cy+5],[cx-1,cy]],'W');
  // glass shards in orbit
  [[3,10,4],[56,8,3],[2,40,3],[57,38,4],[10,52,3],[50,52,3]].forEach(([x,y,r])=>{g.poly([[x,y-r],[x+r*.6,y],[x,y+r*1.4],[x-r*.6,y]],'S');g.poly([[x,y-r],[x,y+r*1.4],[x-r*.6,y]],'s');});
  g.px([[14,2],[46,3],[0,28],[59,24],[28,0]],'W');
  return {pal:{F:'#ff8a2a',f:'#b8401a',G:'#ffd860',W:'#fff6d0',K:'#07030a',V:'#5a1a3a',Y:'#fff0a0',S:'#cfeaf0',s:'#6a9aa8',D:'#241410'},flat:'KGWY',glow:'#ffb040',rim:'#1a0a0a'};
 }
});
['locustchoir','ironmaw','candlemoth','brinehag','hollowsun'].forEach(k=>{BIG_ART.push(k);});
