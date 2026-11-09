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
