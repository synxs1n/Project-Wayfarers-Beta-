// ===== guard21.js (v0.22.13): guardians with their own designs, big on the map =====
// Owner: "Minibosses and guardians should appear big in the overworld. Guardians should be entirely unique designs, like the summons in
// Final Fantasy." The twenty guardians (MINIS in sites.js: the Den minibosses and the Sanctum guardians, also summons, summon8.js) were the
// 40 px art of a stock foe with a new colour, enlarged 1.5x (sites.js MINI_BIG). Each now has its own 60 x 60 drawing (art-style.md:
// bsh four tone masses, light from the top left, one accent kept flat, a tell part that moves on idle B, a lunge on atk) and draws at its
// own size, so the battle stage, the Bestiary, the summon and the map all show the new design. Stats, skills and elements are unchanged
// (makeMonVariant still copies them from the base foe).
// On the map (section 2) a guardian waiting at the end of its Den or Sanctum stands a fifth bigger than before (G21.w) on a rune ring with
// a slow aura in its element colour and its name over it as the hero comes near; elite roamers stand a fifth bigger than a roamer with the
// gold ring, so the fights worth fearing read from across the field. Both renderers (2D worldDraw, HD-2D hdActors) draw them here: the core passes skip them while drawing (G21.hide) and the
// actors stay in dynActors and m.roam for walking, talking and taps.
const G21={off:false,hide:0,n:{mini:0,elite:0},last:{}};
// ---------- 1. the twenty designs ----------
const G21ART={
 // Gorehorn, Warden of the Drifts (ice, earth): a hunched mountain titan, glacier antlers, stone mantle on the shoulders
 mb_gorehorn(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?2:0,fu='abcd',st='efgh',ic='ijkl',sk='mnop';
  g.ell(30,57,25,2.4,'D');
  bsh(g,[['t',[[23,40],[22,48],[20,55]],6,5.5],['r',14,53,11,4]],fu);bsh(g,[['t',[[38,40],[39,48],[41,55]],6,5.5],['r',36,53,11,4]],fu);
  bsh(g,[['e',29,33,16,14],['e',19,25,10,8],['e',40,25,10,8]],fu,{cap:14});
  g.path([[18,30],[16,40]],'c');g.path([[28,34],[27,44]],'c');g.path([[38,32],[40,42]],'c');
  bsh(g,[['t',[[17,26],[11,38],[10,49]],5.2,4.4]],fu);bsh(g,[['e',10,50,4.2,3.4]],st);
  bsh(g,[['t',[[43,26],[50+A,36],[53+A,46]],5.2,4.4]],fu);bsh(g,[['e',53+A,47,4.4,3.6]],st);
  bsh(g,[['p',[[11,22],[22,15],[30,18],[25,27],[13,29]]],['p',[[33,18],[42,14],[51,21],[48,28],[37,27]]]],st);
  g.px([[16,22],[20,19],[40,18],[46,20],[44,24]],'h');g.line(13,27,24,25,'g');g.line(36,26,48,26,'g');
  bsh(g,[['e',33,17,7.4,6.6],['p',[[36,18],[44,20],[42,25],[35,24]]]],sk);
  beye(g,36,15,'E','W');beye(g,31,15,'E','W');g.line(37,22,42,22,'K');g.px([[38,23],[41,23]],'W');
  bsh(g,[['t',[[28,12],[22,6],[17,2-B],[12,1]],2.6,1.2],['t',[[22,6],[19,9],[15,9]],1.6,1],['t',[[38,11],[44,5],[49,1-B],[54,2]],2.6,1.2],['t',[[44,5],[47,8],[51,8]],1.6,1]],ic);
  g.px([[12,1],[54,2],[15,9],[51,8]],'X');
  g.px(B?[[4,14],[57,30],[7,36],[55,10]]:[[5,16],[56,28],[6,34],[56,12]],'X');
  return {pal:Object.assign({},bT4(fu,'#d6dfe8',{cool:'#2a3a58'}),bT4(st,'#7a6a56'),bT4(ic,'#9fe2ff',{cool:'#1a3a6a'}),bT4(sk,'#62738e',{cool:'#1a2038'}),{E:'#7af0ff',W:'#ffffff',K:'#141824',X:'#d8faff',D:'#1c2230'}),flat:'EWKX',glow:'#bfeeff',rim:'#121a28'};},
 // The Mire Queen (water, shadow): a naga empress, a coiled tail, a cobra hood of reeds and a crown of lilies, a cattail sceptre
 mb_mirequeen(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?2:0,sc='abcd',hd='efgh',sk='ijkl',lf='mnop';
  g.ell(30,57,26,2.4,'D');
  bsh(g,[['t',[[8,50],[14,56],[30,57],[46,55],[52,48],[44,42],[32,43]],4,5.5]],sc);
  g.path([[12,54],[24,56],[40,55],[49,49]],'b');[[18,55],[28,56],[38,55],[46,51]].forEach(([x,y])=>g.s(x,y-2,'a'));
  bsh(g,[['e',31,22,12,14+B*.5],['p',[[21,22],[41,22],[38,40],[24,40]]]],hd,{cap:14});
  for(let i=0;i<6;i++)g.line(22+i*3.4,12+Math.abs(i-2.5)*1.4,24+i*2.4,36,'g');
  bsh(g,[['t',[[32,44],[33,34],[32,25]],5.2,4]],sc);g.line(32,28,32,42,'c');for(let y=30;y<42;y+=3)g.line(30,y,34,y+1,'a');
  bsh(g,[['t',[[30,27],[24,33],[22+A,38]],2.4,2],['t',[[35,27],[41,32],[46+A,30]],2.4,2]],sk);
  bsh(g,[['e',33,19,4.8,5.6]],sk);beye(g,34,18,'E','W');beye(g,31,18,'E','W');g.line(32,22,34,22,'K');
  g.line(46+A,6,46+A,52,'n');g.line(47+A,8,47+A,50,'p');bsh(g,[['e',46.5+A,6,2,4]],lf);g.px([[46+A,1],[47+A,1]],'X');
  [[26,12],[30,10],[34,10],[38,12]].forEach(([x,y],i)=>{g.ell(x,y-B*(i%2),2.2,1.8,'P');g.s(x,y-B*(i%2),'Y');});
  bsh(g,[['e',12,48,3,2],['e',52,46,2.6,1.8]],lf);
  g.px(B?[[4,30],[56,20],[8,18]]:[[5,28],[55,22],[9,16]],'X');
  return {pal:Object.assign({},bT4(sc,'#3e7a5a',{cool:'#0a2028'}),bT4(hd,'#5a6a3a',{cool:'#14141e'}),bT4(sk,'#9ab8a0',{cool:'#22304a'}),bT4(lf,'#6a9a3a'),{E:'#c890ff',W:'#fff',K:'#0c1414',P:'#f0a8c8',Y:'#fff0a0',X:'#9affd8',D:'#101c1c'}),flat:'EWKPYX',glow:'#7ae8c0',rim:'#0a1414'};},
 // Slagjaw the Unquenched (fire, earth): a basalt colossus whose chest is one great molten jaw, fists of cooling rock
 mb_slagjaw(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?2:0,rk='abcd',ms='efgh';
  g.ell(30,57,25,2.6,'D');
  bsh(g,[['r',17,42,9,14],['r',34,42,9,14],['r',14,52,13,5],['r',33,52,13,5]],rk);
  bsh(g,[['p',[[12,14],[48,12],[54,30],[46,46],[14,46],[8,30]]]],rk,{cap:14});
  bsh(g,[['e',11,22,7,7],['e',49,20,7,7]],rk);
  g.poly([[18,24],[46,22],[48,30],[44,34+A],[20,34+A],[16,30]],'K');g.poly([[20,27],[44,25],[42,30+A],[22,31+A]],B?'Y':'X');
  for(let i=0;i<7;i++){g.poly([[19+i*4,24],[21+i*4,24],[20+i*4,28]],'W');g.poly([[20+i*3.6,34+A],[22+i*3.6,34+A],[21+i*3.6,30+A]],'W');}
  bsh(g,[['p',[[16,34+A],[46,34+A],[44,42+A],[20,42+A]]]],rk);
  [[14,16,20,20,18,26],[40,14,36,19,42,22],[12,38,20,40,22,46],[44,38,40,42,46,44],[28,8,30,12,28,16]].forEach(p=>g.path([[p[0],p[1]],[p[2],p[3]],[p[4],p[5]]],'x'));
  g.rect(22,12,3,2,'E');g.rect(36,11,3,2,'E');g.px([[22,12],[36,11]],'W');
  bsh(g,[['t',[[8,26],[6,38],[8,46]],5,5]],rk);bsh(g,[['e',8,48,6,5]],ms);
  bsh(g,[['t',[[52,26],[56,36],[54+A,44]],5,5]],rk);bsh(g,[['e',54+A,46,6,5]],ms);g.px([[6,50],[10,51],[52+A,48],[56+A,49]],'x');
  bsh(g,[['k',20,12,16,2,5],['k',30,11,30,0,5],['k',40,11,44,2,5]],rk);g.px([[16,2],[30,0],[44,2]],'x');
  g.px(B?[[4,10],[56,8],[30,4]]:[[5,8],[55,6],[31,3]],'Y');
  return {pal:Object.assign({},bT4(rk,'#4a3a34',{cool:'#140a14'}),bT4(ms,'#6a4030'),{x:'#ff7a2a',X:'#ff9a3a',Y:'#ffe08a',E:'#ffd04a',W:'#fff2c8',K:'#1a0806',D:'#1a1210'}),flat:'xXYEWK',glow:'#ff8a3a',rim:'#140808'};},
 // The Bell Wraith (shadow, light): a pale wraith hanging inside a cracked temple bell, a halo over the crown, chains to the dark
 mb_bellwraith(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?2:0,bl='abcd',gh='efgh';
  g.ell(30,57,20,2.2,'D');
  g.line(14,0,22,10,'c');g.line(46,0,38,10,'c');g.line(30,0,30,6,'c');
  bsh(g,[['p',[[24,6],[36,6],[40,16],[42,32],[47,42+B],[13,42+B],[18,32],[20,16]]]],bl,{cap:14});
  g.rect(13,40+B,34,3,'b');g.line(20,22,40,22,'a');g.line(19,30,41,30,'c');g.path([[34,10],[32,16],[35,20]],'d');
  g.ell(30,43+B,15,3,'K');
  bsh(g,[['p',[[22,43+B],[38,43+B],[36,52],[33,56],[30,52],[27,57],[24,52]]]],gh);
  bsh(g,[['e',30,46+B,4.5,4]],gh);g.rect(27,45+B,2,2,'E');g.rect(32,45+B,2,2,'E');g.ell(30,49+B,1.2,1.4,'K');
  bsh(g,[['t',[[22,46],[14,48],[8-A,46]],1.8,1.2],['t',[[38,46],[46,48],[52+A,46]],1.8,1.2]],gh);
  g.px([[6-A,45],[7-A,47],[54+A,45],[53+A,47]],'W');
  g.ell(30,3,9,2.2,'Y');g.ell(30,3,7,1.1,0);
  g.px(B?[[6,20],[54,26],[10,32],[50,12]]:[[7,22],[53,24],[11,30],[49,14]],'X');
  return {pal:Object.assign({},bT4(bl,'#a07a3a',{cool:'#1a1030'}),bT4(gh,'#d8dcf0',{cool:'#3a3a6a'}),{c:'#4a4a5a',E:'#9aeaff',K:'#08060e',W:'#f4f8ff',Y:'#fff2a8',X:'#c8b8ff',D:'#14101e'}),flat:'EKWYX',glow:'#c8c0ff',rim:'#0e0a18'};},
 // Pyreclaw, Kennelmaster (fire): a hound lord with a mane of fire, a broken chain collar and three burning tails
 mb_pyreclaw(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?3:0,bd='abcd',fl='efgh';
  g.ell(30,57,25,2.4,'D');
  [[0,'e'],[4,'f'],[-4,'g']].forEach(([o,k])=>{g.path([[12,36],[6,30+o],[2,22+o-B],[5,16+o]],k,3);g.px([[5,15+o]],'Y');});
  bsh(g,[['t',[[16,44],[13,52],[12,56]],3,2.6],['t',[[22,44],[22,52],[23,56]],3,2.6]],bd);
  bsh(g,[['e',26,38,15,9]],bd,{cap:14});
  bsh(g,[['t',[[36,44],[38+A,51],[40+A,56]],3.2,2.8],['t',[[42,42],[46+A,50],[48+A,56]],3.2,2.8]],bd);
  [[12,56],[23,56],[40+A,56],[48+A,56]].forEach(([x,y])=>g.rect(x-2,y,5,1,'W'));
  for(let a=0;a<11;a++){const t=-3.0+a*.5,r=14+(a%2)*4+(a%2?B:-B);g.poly([[40+A+Math.cos(t-.22)*6,25+Math.sin(t-.22)*6],[40+A+Math.cos(t)*r,25+Math.sin(t)*r],[40+A+Math.cos(t+.22)*6,25+Math.sin(t+.22)*6]],a%2?'e':'f');g.s(Math.round(40+A+Math.cos(t)*(r-1)),Math.round(25+Math.sin(t)*(r-1)),'Y');}
  bsh(g,[['e',39+A,26,8,9]],fl,{cap:10});
  bsh(g,[['e',44+A,22,6.5,5.6],['p',[[46+A,20],[57+A,23],[55+A,28],[46+A,27]]]],bd);
  g.rect(48+A,19,3,2,'E');g.s(49+A,19,'W');g.poly([[42+A,15],[44+A,8],[47+A,15]],'b');
  g.line(48+A,26,56+A,26,'K');g.px([[50+A,27],[54+A,27]],'W');
  g.rect(33+A,32,12,3,'M');g.px([[35+A,33],[39+A,33],[43+A,33]],'m');g.path([[34+A,35],[30,40],[28,38]],'M');
  g.px(B?[[20,6],[34,4],[8,8]]:[[21,8],[33,6],[9,10]],'Y');
  return {pal:Object.assign({},bT4(bd,'#5a3a34',{cool:'#180a14'}),bT4(fl,'#ff7a2a',{warm:'#fff2a8',cool:'#801a10'}),{E:'#ffe08a',W:'#fff2d8',K:'#1a0808',M:'#8a8a98',m:'#4a4a58',Y:'#ffe08a',D:'#1a1210'}),flat:'EWKYm',glow:'#ff9a4a',rim:'#140808'};},
 // Old Shellgrim (water, earth): an ancient turtle bearing a coral keep on its shell, a kelp beard
 mb_shellking(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?3:0,sh='abcd',sk='efgh',co='ijkl';
  g.ell(30,57,27,2.4,'D');
  bsh(g,[['e',14,52,5,5],['e',40,52,5,5]],sk);g.px([[10,56],[13,56],[16,56],[36,56],[39,56],[42,56]],'W');
  bsh(g,[['e',27,42,22,12]],sh,{cap:16});g.rect(5,46,44,3,'c');
  for(let i=0;i<4;i++)g.path([[10+i*10,34+Math.abs(i-1.5)*2],[14+i*10,40],[10+i*10,46]],'d');
  bsh(g,[['t',[[46,44],[52+A,38],[55+A,32]],4.6,4]],sk);bsh(g,[['e',54+A,30,5.4,4.6]],sk);
  beye(g,55+A,28,'E','W');g.line(54+A,33,58+A,33,'h');
  g.path([[52+A,34],[50+A,40-B],[52+A,44]],'p',2);g.path([[55+A,34],[55+A,42-B]],'p',2);
  bsh(g,[['p',[[14,32],[18,14],[22,14],[26,32]]],['p',[[26,32],[30,20],[34,32]]],['p',[[8,34],[10,24],[13,34]]],['p',[[34,34],[38,24],[40,34]]]],co);
  g.rect(18,12,5,3,'k');g.px([[19,11],[21,11]],'k');g.rect(19,18,3,3,'K');g.s(20,19,'Y');g.rect(29,24,2,3,'K');
  [[12,38],[22,36],[32,38],[42,40],[18,44]].forEach(([x,y])=>{g.ell(x,y,1.4,1.1,'W');});
  g.px(B?[[4,20],[46,10],[52,20]]:[[5,22],[47,12],[53,18]],'X');
  return {pal:Object.assign({},bT4(sh,'#3a6a7a',{cool:'#0a1a28'}),bT4(sk,'#7a8a6a',{cool:'#1a2a2a'}),bT4(co,'#e07a6a',{cool:'#401a30'}),{p:'#2a5a3a',E:'#ffe08a',W:'#eef4e8',K:'#0a1418',Y:'#ffe08a',X:'#8ae8ff',D:'#0e1a1e'}),flat:'EWKYXp',glow:'#7ad0e0',rim:'#0a1418'};},
 // The Gallow Crow (shadow, wind): a vast crow with a bone mask, ragged wings flung wide, a hangman's rope trailing from its talons
 mb_gallowcrow(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?2:0,wg='abcd',bd='efgh',mk='ijkl',wb=B?3:0;
  g.ell(30,57,20,2.2,'D');
  bsh(g,[['p',[[28,26],[16,14],[4,4+wb],[2,16],[6,24],[4,30],[12,32],[10,38],[22,36]]]],wg);
  bsh(g,[['p',[[34,26],[44,12],[56,2+wb],[58,14],[54,22],[57,28],[48,30],[50,36],[38,36]]]],wg);
  [[4,4+wb,14,30],[4,4+wb,22,34],[56,2+wb,46,30],[56,2+wb,40,34]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'c'));
  bsh(g,[['e',30,32,9,12],['p',[[24,42],[36,42],[38,52],[30,48],[22,52]]]],bd,{cap:14});
  bsh(g,[['e',33,20,6.4,6]],bd);bsh(g,[['p',[[30,17],[38,16],[50+A,21],[38,24],[31,23]]]],mk);g.line(38,21,48+A,21,'l');
  g.rect(34,18,2,2,'E');g.s(34,18,'W');
  g.path([[26,44],[24,50]],'M');g.path([[34,44],[36,50]],'M');
  g.path([[34,50],[35,54],[33,58]],'R');g.ell(33,55,2,2,'R');g.ell(33,55,1,1,0);
  g.px(B?[[10,44],[50,46],[20,2]]:[[11,46],[49,44],[21,4]],'X');
  return {pal:Object.assign({},bT4(wg,'#2e2a3e',{cool:'#08061a'}),bT4(bd,'#3a364a',{cool:'#0a0818'}),bT4(mk,'#e8e0cc',{cool:'#4a4060'}),{M:'#8a8070',R:'#a08a5a',E:'#c890ff',W:'#fff',X:'#b48aff',D:'#0e0c16'}),flat:'EWX',glow:'#9a7ad0',rim:'#06040c'};},
 // Glowmaw (light, fire): a floating angler leviathan, a lantern lure over a gaping, ember-lit maw
 mb_lanternmaw(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?3:0,bd='abcd',fn='efgh';
  g.ell(30,57,20,2,'D');
  bsh(g,[['p',[[10,30],[2,20],[4,32],[2,44],[12,36]]]],fn);
  bsh(g,[['e',28,32-B,19,15]],bd,{cap:16});
  bsh(g,[['p',[[22,20],[28,10],[34,20]]],['p',[[20,44],[26,52],[32,44]]]],fn);
  g.poly([[36+A,28-B],[54+A,24-B],[56+A,38-B],[38+A,42-B]],'K');g.poly([[40+A,32-B],[52+A,30-B],[52+A,36-B],[42+A,38-B]],'X');
  for(let i=0;i<5;i++){g.poly([[38+A+i*3.4,28-B],[40+A+i*3.4,28-B],[39+A+i*3.4,32-B]],'W');g.poly([[40+A+i*3,42-B],[42+A+i*3,42-B],[41+A+i*3,38-B]],'W');}
  g.rect(34,22-B,3,3,'E');g.s(34,22-B,'W');
  g.path([[30,18-B],[36,6],[46,3],[52+A,8]],'c',2);g.ell(52.5+A,11,3.4,3.4+B*.4,'Y');g.ell(52.5+A,11,1.6,1.6,'W');
  [[18,28],[22,38],[14,34],[26,42],[30,26]].forEach(([x,y])=>{g.s(x,y-B,'Y');});
  g.px(B?[[6,10],[56,20],[44,52]]:[[7,12],[55,18],[45,50]],'Y');
  return {pal:Object.assign({},bT4(bd,'#4a3a5a',{cool:'#0e0820'}),bT4(fn,'#7a5a8a',{cool:'#140a28'}),{E:'#ffe08a',W:'#fff6d8',K:'#120608',X:'#ff9a3a',Y:'#fff0a0',D:'#120e1a'}),flat:'EWKXY',glow:'#ffe08a',rim:'#0a0612'};},
 // The Rusted Knight (earth, lightning): a giant in rust-eaten plate, lightning crawling through the seams, a greatsword planted
 mb_rustknight(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?1:0,pl='abcd',cp='efgh';
  g.ell(30,57,22,2.4,'D');
  bsh(g,[['p',[[18,18],[12,40],[8,54],[22,50],[20,30]]]],cp);g.path([[10,50],[12,54],[15,51]],'h');
  bsh(g,[['r',19,40,8,15],['r',31,40,8,15],['r',17,53,11,4],['r',30,53,11,4]],pl);
  bsh(g,[['p',[[18,18],[40,18],[42,32],[38,42],[20,42],[16,32]]]],pl,{cap:14});g.line(29,20,29,40,'c');g.rect(18,34,22,2,'d');
  bsh(g,[['e',16,20,7,5],['e',42,20,7,5]],pl);g.line(10,22,22,22,'c');g.line(36,22,48,22,'c');
  bsh(g,[['r',24,5,11,13],['p',[[24,5],[29,1],[35,5]]]],pl);g.rect(25,10,10,2,'K');g.rect(26,10,8,1,'X');g.line(29,1,29,-2,'h');
  if(!A){g.line(48,12,48,54,'S');g.line(49,12,49,54,'s');g.rect(44,14,10,2,'c');bsh(g,[['t',[[42,22],[46,26],[48,18]],3,2.6]],pl);}
  else{g.line(46,2,56,40,'S');g.line(47,2,57,40,'s');bsh(g,[['t',[[42,22],[48,20],[50,14]],3,2.6]],pl);}
  bsh(g,[['t',[[16,22],[12,32],[14,40]],3,2.6]],pl);
  [[20,24,24,28,22,32],[34,26,38,30,36,36],[22,44,26,48,24,52],[14,28,10,32,13,36]].forEach(p=>g.path([[p[0],p[1]],[p[2],p[3]],[p[4],p[5]]],'Y'));
  [[24,30],[34,40],[20,22],[38,24],[30,50]].forEach(([x,y])=>{g.s(x,y,'r');g.s(x+1,y,'r');});
  g.px(B?[[44,6],[54,10],[6,14],[52,46]]:[[45,8],[55,12],[7,12],[53,44]],'Y');
  return {pal:Object.assign({},bT4(pl,'#7a5a46',{cool:'#1a1428'}),bT4(cp,'#5a2a2a',{cool:'#14081a'}),{S:'#c8ccd8',s:'#6a6a7a',r:'#b8642a',K:'#0a0a12',X:'#ffe14a',Y:'#fff07a',D:'#14121a'}),flat:'KXY',glow:'#ffe86a',rim:'#0e0a12'};},
 // Old Thunderwing (lightning, wind): a thunderbird with a crown of bolt feathers and storm wings spread to the edges
 mb_stormcrown(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?2:0,wg='abcd',bd='efgh',cr='ijkl',wb=B?3:0;
  g.ell(30,57,20,2,'D');
  bsh(g,[['p',[[26,28],[14,18],[2,10+wb],[4,20],[2,28],[8,32],[6,38],[18,38]]]],wg);
  bsh(g,[['p',[[34,28],[46,18],[58,10+wb],[56,20],[58,28],[52,32],[54,38],[42,38]]]],wg);
  for(let i=0;i<4;i++){g.line(26,30,4+i*3,14+i*7+wb*(1-i/4),'c');g.line(34,30,56-i*3,14+i*7+wb*(1-i/4),'c');}
  bsh(g,[['e',30,34,8,12]],bd,{cap:14});g.ell(30,38,4,6,'e');g.path([[27,30],[30,34],[33,30]],'h');g.path([[27,36],[30,40],[33,36]],'h');
  bsh(g,[['p',[[26,44],[34,44],[40,56],[30,52],[20,56]]]],wg);g.path([[24,50],[28,54],[26,57]],'Y');g.path([[36,50],[32,54],[35,57]],'Y');
  bsh(g,[['e',31,20,6,6]],bd);bsh(g,[['p',[[34,18],[43+A,20],[41+A,24],[34,24]]]],cr);g.line(36,22,41+A,22,'k');g.line(28,17,34,19,'K');g.rect(32,18,2,2,'E');g.s(32,18,'W');
  [[24,14,22,4,26,8,24,0],[30,13,30,3,33,6,32,-1],[36,14,40,4,38,8,42,1]].forEach(p=>{g.path([[p[0],p[1]],[p[2],p[3]-B],[p[4],p[5]-B],[p[6],p[7]-B]],'Y',2);});
  g.path([[26,46],[24,50]],'k');g.path([[34,46],[36,50]],'k');
  g.px(B?[[10,44],[50,48],[20,8],[44,6]]:[[12,46],[48,46],[18,6],[46,8]],'X');
  return {pal:Object.assign({},bT4(wg,'#3a4a8a',{cool:'#0a0a2a'}),bT4(bd,'#7a86b8',{cool:'#14163a'}),bT4(cr,'#f0c060'),{k:'#e8c060',E:'#ffe14a',W:'#fff',Y:'#ffe14a',X:'#fff8b0',D:'#10121e'}),flat:'EWYX',glow:'#ffe86a',rim:'#080a1e'};},
 // Tanglemother (earth, water): a dryad giantess grown out of an old trunk, arms of root, a canopy of leaves and blossoms for hair
 mb_rootmother(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?3:0,bk='abcd',lf='efgh',sk='ijkl';
  g.ell(30,57,26,2.4,'D');
  bsh(g,[['p',[[20,34],[40,34],[44,50],[48,56],[12,56],[16,50]]],['t',[[16,52],[8,55],[2,57]],2.6,1],['t',[[44,52],[52,55],[58,57]],2.6,1]],bk);
  for(let i=0;i<4;i++)g.line(22+i*5,36,20+i*6,54,'c');
  bsh(g,[['p',[[24,20],[36,20],[38,36],[22,36]]]],sk);g.line(30,24,30,34,'k');
  bsh(g,[['t',[[24,22],[16,28],[10-A,26],[6-A,20]],2.6,1.6],['t',[[10-A,26],[4-A,28]],1.4,1],['t',[[36,22],[44,26],[50+A,22],[54+A,16]],2.6,1.6],['t',[[50+A,22],[56+A,24]],1.4,1]],bk);
  bsh(g,[['e',30,10,16,10+B*.5],['e',16,18,8,7],['e',44,18,8,7]],lf,{cap:14});
  bsh(g,[['e',30,16,5,6]],sk);beye(g,31,15,'E','W');beye(g,27,15,'E','W');g.line(29,20,31,20,'l');
  [[18,6],[26,3],[36,4],[44,10],[14,14],[46,18],[22,12],[40,14]].forEach(([x,y],i)=>{g.ell(x,y-(i%2)*B,1.6,1.4,'P');g.s(x,y-(i%2)*B,'Y');});
  g.px(B?[[6,40],[54,38],[10,30]]:[[7,42],[53,40],[11,32]],'X');
  return {pal:Object.assign({},bT4(bk,'#6a4a32',{cool:'#14101a'}),bT4(lf,'#4a8a3a',{cool:'#0a2a20'}),bT4(sk,'#a89a72'),{E:'#8affa0',W:'#fff',P:'#f4b8d0',Y:'#fff2a0',X:'#8ad0ff',D:'#101a12'}),flat:'EWPYX',glow:'#9affb0',rim:'#0e1410'};},
 // The Mirror Widow (water, light): a veiled lady rising from a spider of glass, eight crystal legs, light caught in the facets
 mb_glasswidow(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?2:0,gl='abcd',vl='efgh',sk='ijkl';
  g.ell(30,57,26,2.2,'D');
  [[20,40,8,34,2,56],[22,42,12,44,8,56],[26,44,20,50,16,56],[28,44,30,50,28,56],[36,42,44,36,52,56],[34,44,42,46,46,56],[32,44,36,50,38,56],[38,40,48,30,57,50]].forEach(([a,b,c,d,e,h],i)=>
   bsh(g,[['t',[[a,b],[c,d-(i%2)*B],[e,h]],1.6,1]],gl));
  bsh(g,[['e',18,42,12,9]],gl,{cap:14});g.ell(18,42,5,4,'X');g.ell(18,42,2,2,'W');g.line(10,38,24,46,'c');
  bsh(g,[['e',30,42,6,5]],gl);
  bsh(g,[['p',[[30,22],[38,22],[40,40],[28,40]]]],vl);
  bsh(g,[['t',[[32,24],[38,30],[44+A,28]],1.8,1.4],['t',[[36,24],[42,20],[46+A,14]],1.8,1.4]],sk);g.px([[46+A,13],[47+A,12]],'X');
  bsh(g,[['e',34,16,5,5.6]],sk);g.rect(35,15,2,2,'E');g.s(35,15,'W');
  bsh(g,[['p',[[28,10],[40,10],[42,30],[36,22],[30,24],[26,30]]]],vl,{bias:-.1});bsh(g,[['e',34,10,6,3]],gl);g.px([[30,8],[34,6],[38,8]],'X');
  g.px(B?[[6,14],[54,10],[50,40],[10,28]]:[[7,16],[53,12],[51,38],[11,26]],'X');
  return {pal:Object.assign({},bT4(gl,'#9ad0e8',{cool:'#1a2a5a'}),bT4(vl,'#c8d4f0',{cool:'#2a2a5a'}),bT4(sk,'#e8dcd0',{cool:'#4a4060'}),{E:'#4aa8ff',W:'#fff',X:'#ffffff',D:'#10141e'}),flat:'EWX',glow:'#bff0ff',rim:'#0e1428'};},
 // The Silent Abbot (shadow): a towering hooded abbot with no face, a crown of candles, a censer swinging on its chain
 mb_hollowabbot(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?4:0,rb='abcd',tr='efgh';
  g.ell(30,57,20,2.2,'D');
  bsh(g,[['p',[[22,14],[38,14],[46,56],[14,56]]]],rb,{cap:16});
  g.path([[14,56],[18,52],[22,57],[26,52],[30,57],[34,52],[38,57],[42,52],[46,56]],'d',2);
  bsh(g,[['p',[[24,24],[36,24],[38,52],[22,52]]]],tr,{bias:.1});g.line(30,26,30,50,'h');g.rect(24,34,12,2,'G');
  bsh(g,[['e',30,13,9,10],['p',[[21,14],[30,2],[39,14]]]],rb);g.ell(31,15,5.5,6.4,'K');g.rect(29,14,2,2,'E');g.rect(33,14,2,2,'E');
  [[22,6],[26,3],[30,1],[34,3],[38,6]].forEach(([x,y],i)=>{g.rect(x,y,2,3,'W');g.s(x,y-1-((i+B)%2),'Y');g.s(x,y-2-((i+B)%2),'X');});
  bsh(g,[['t',[[38,22],[42,30],[42,36]],2.8,2.4]],rb);g.line(42,36,46+A,46,'M');bsh(g,[['e',46+A,48,3.4,3.4]],['M','M','m','m']);g.px([[45+A,47],[47+A,49]],'Y');
  g.px(B?[[48+A,42],[50+A,38],[44+A,40]]:[[49+A,44],[51+A,40],[45+A,41]],'S');
  bsh(g,[['t',[[22,22],[18,30],[22,34]],2.8,2.4]],rb);g.path([[22,34],[20,40],[24,44]],'G');
  return {pal:Object.assign({},bT4(rb,'#3a3040',{cool:'#08060e'}),bT4(tr,'#6a5a4a',{cool:'#14101a'}),{G:'#c0a050',K:'#030206',E:'#e8e0ff',W:'#e8e0c8',Y:'#ffd04a',X:'#fff4c0',M:'#8a8070',m:'#4a4038',S:'#9a90a8',D:'#0e0c14'}),flat:'KEYXW',glow:'#ffd890',rim:'#06040a'};},
 // Sootwing Elder (fire, shadow): a giant ember bat, membranes veined with fire, a ruff of soot
 mb_cinderbat(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?2:0,wg='abcd',bd='efgh',wb=B?4:0;
  g.ell(30,57,20,2,'D');
  bsh(g,[['p',[[26,26],[16,10-wb],[2,8-wb],[6,18],[2,28],[8,30],[4,40],[14,36],[18,44],[24,36]]]],wg);
  bsh(g,[['p',[[34,26],[44,10-wb],[58,8-wb],[54,18],[58,28],[52,30],[56,40],[46,36],[42,44],[36,36]]]],wg);
  [[16,10-wb,8,30],[16,10-wb,14,36],[16,10-wb,4,40],[44,10-wb,52,30],[44,10-wb,46,36],[44,10-wb,56,40]].forEach(q=>g.line(q[0],q[1],q[2],q[3],'x'));
  bsh(g,[['e',30,32,8,11]],bd,{cap:14});bsh(g,[['e',30,24,10,4]],bd,{bias:-.1});
  bsh(g,[['e',30,18,6,5.6],['p',[[24,16],[22,8],[27,13]]],['p',[[36,16],[38,8],[33,13]]]],bd);
  g.rect(26,17,3,2,'E');g.rect(32,17,3,2,'E');g.px([[26,17],[32,17]],'W');g.line(28,22,32,22,'K');g.px([[28,23],[31,23]],'W');
  g.path([[26,42],[24,48]],'h');g.path([[34,42],[36,48]],'h');
  g.px(B?[[10,48],[52,50],[30,4],[40,2]]:[[11,46],[51,48],[29,6],[41,4]],'Y');
  return {pal:Object.assign({},bT4(wg,'#4a2a2a',{cool:'#14060e'}),bT4(bd,'#3a3034',{cool:'#0a060c'}),{x:'#ff7a2a',E:'#ffd04a',W:'#fff2c8',K:'#120404',Y:'#ffb04a',D:'#140c0e'}),flat:'xEWKY',glow:'#ff8a3a',rim:'#0e0406'};},
 // Snowmother (ice): a great white she-wolf sitting tall, a mane of icicles, an aurora draped over her shoulders, a snowflake circlet
 mb_frostmother(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?3:0,fu='abcd',ic='efgh';
  g.ell(30,57,24,2.4,'D');
  bsh(g,[['t',[[30,56],[16,57],[8,54],[6,48-B]],3,1.6]],fu);
  bsh(g,[['e',22,46,13,10]],fu,{cap:14});bsh(g,[['e',14,52,6,4]],fu);
  bsh(g,[['e',34,34,10,14]],fu,{cap:14});
  bsh(g,[['t',[[34,44],[34+A,50],[34+A,56]],3,2.6],['t',[[40,42],[42+A,50],[42+A,56]],3,2.6]],fu);
  [[34+A,56],[42+A,56],[14,56]].forEach(([x,y])=>g.rect(x-2,y,5,1,'W'));
  g.path([[24,26],[30,24],[38,25],[44,30]],'A',2);g.path([[22,29],[29,27],[37,28],[43,33]],'B',2);g.path([[22,32],[28,30],[36,31]],'C',1);g.path([[20,34],[18,42],[19,46]],'A',1);
  for(let i=0;i<5;i++)bsh(g,[['k',30+i*3,24+i*.6,29+i*3,32+i*1.2+(i%2)*B,2.6]],ic);
  bsh(g,[['e',40+A*.5,15,6.4,6],['p',[[42+A*.5,13],[54+A*.5,16],[52+A*.5,21],[42+A*.5,21]]],['p',[[35+A*.5,11],[36+A*.5,1],[40+A*.5,9]]],['p',[[40+A*.5,10],[44+A*.5,1],[45+A*.5,10]]]],fu);
  g.rect(44+A*.5,13,3,2,'E');g.s(45+A*.5,13,'W');g.line(46+A*.5,19,52+A*.5,19,'K');
  g.px([[38,6],[40,4],[42,6],[40,5],[40,7],[39,5],[41,7]],'X');
  g.px(B?[[6,8],[24,4],[54,30],[10,24]]:[[7,10],[25,6],[53,28],[11,22]],'X');
  return {pal:Object.assign({},bT4(fu,'#e8eef6',{cool:'#3a4a7a'}),bT4(ic,'#9fe2ff',{cool:'#1a3a6a'}),{A:'#7affc8',B:'#7ab8ff',C:'#c88aff',E:'#4aa8ff',W:'#ffffff',K:'#1a2030',X:'#e8fcff',D:'#141c28'}),flat:'ABCEWKX',glow:'#bff0ff',rim:'#1a2440'};},
 // Tollskull Sentinel (earth, shadow): a hunched stone sentinel, a horned skull for a head, a funeral bell hung in its ribs
 mb_skullbell(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?3:0,st='abcd',bn='efgh',br='ijkl';
  g.ell(30,57,24,2.4,'D');
  bsh(g,[['p',[[18,16],[8,6],[4,18],[10,28]]],['p',[[40,16],[50,4],[56,16],[50,26]]]],st);g.line(8,6,10,26,'c');g.line(50,4,50,24,'c');
  bsh(g,[['t',[[20,42],[16,50],[14,56]],4.6,4],['t',[[38,42],[42,50],[44,56]],4.6,4]],st);
  bsh(g,[['p',[[14,18],[44,18],[46,34],[40,46],[18,46],[12,34]]]],st,{cap:14});
  g.ell(29,32,9,10,'K');for(let i=0;i<4;i++){g.line(21,26+i*4,37,26+i*4,'f');}
  g.line(29,22,29,28-B,'M');bsh(g,[['p',[[25,28-B],[33,28-B],[35,36-B],[23,36-B]]]],br);g.rect(23,35-B,12,2,'j');g.rect(28,37-B,2,2,'k');
  bsh(g,[['t',[[14,20],[8,32],[8+A,42]],3.8,3.2],['t',[[44,20],[50,32],[50+A,42]],3.8,3.2]],st);
  [[8+A,44],[50+A,44]].forEach(([x,y])=>{g.px([[x-2,y],[x,y+1],[x+2,y]],'h');});
  bsh(g,[['e',29,12,8,7.4],['p',[[24,16],[34,16],[33,22],[25,22]]]],bn);
  g.ell(26,12,2.2,2.4,'K');g.ell(32,12,2.2,2.4,'K');g.s(26,12,'X');g.s(32,12,'X');g.poly([[28,16],[30,16],[29,18]],'K');
  for(let i=0;i<4;i++)g.rect(25+i*2,20,1,2,'K');
  bsh(g,[['t',[[22,8],[16,4],[14,-1]],2.2,1],['t',[[36,8],[42,4],[44,-1]],2.2,1]],bn);
  g.px(B?[[4,36],[56,38],[30,0]]:[[5,38],[55,36],[30,1]],'X');
  return {pal:Object.assign({},bT4(st,'#6a6a60',{cool:'#14141e'}),bT4(bn,'#e0d8c0',{cool:'#4a4050'}),bT4(br,'#b08a40'),{M:'#5a5a5a',K:'#0a0808',X:'#8affc0',D:'#121214'}),flat:'KXM',glow:'#7affb0',rim:'#0a0a0e'};},
 // The Gloom Ray (wind, shadow): a manta of night sky, its wings spread with stars, a long whip tail, horns of shadow
 mb_gloomray(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?3:0,wg='abcd',bl='efgh',wb=B?3:0;
  g.ell(30,57,20,2,'D');
  g.path([[14,34],[8,40],[4,48],[2,54]],'c',2);g.px([[2,54],[3,55]],'X');
  bsh(g,[['p',[[14,32],[26,22],[34,10-wb],[38,22],[52,28],[58,34+wb],[46,36],[38,42],[26,46+wb],[24,38]]]],wg,{cap:16});
  bsh(g,[['p',[[22,34],[36,26],[48,32],[38,38],[28,40]]]],bl);
  bsh(g,[['p',[[46,28],[54+A,22],[52+A,28]]],['p',[[46,32],[56+A,34],[50+A,36]]]],wg);
  g.rect(46,29,2,2,'E');g.s(46,29,'W');g.line(44,33,48,33,'K');
  [[20,36],[26,30],[30,24],[34,18],[40,30],[50,32],[32,42],[44,36],[28,36]].forEach(([x,y],i)=>g.s(x,y+(i%3===0?wb*.3:0),i%2?'X':'Y'));
  g.px(B?[[6,10],[54,14],[12,22]]:[[7,12],[53,12],[13,20]],'X');
  return {pal:Object.assign({},bT4(wg,'#2a2a5a',{cool:'#06061e'}),bT4(bl,'#5a6aa0',{cool:'#14143a'}),{c:'#3a3a6a',E:'#c890ff',W:'#fff',K:'#060610',X:'#ffffff',Y:'#bfe0ff',D:'#0c0c18'}),flat:'EWKXY',glow:'#8a8aff',rim:'#04040e'};},
 // The Kelp Hag (water, shadow): a sea witch on a skirt of curling tentacles, coral crown, a staff topped with a black pearl
 mb_brinehag(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?3:0,tn='abcd',sk='efgh',kp='ijkl';
  g.ell(30,57,24,2.4,'D');
  [[22,40,12,50,6,54-B],[24,42,18,54,12,57],[28,42,28,54,24,57],[32,42,34,54,38,57],[36,40,44,52,50,56-B],[38,38,50,44,54,40]].forEach(([a,b,c,d,e,h])=>
   bsh(g,[['t',[[a,b],[c,d],[e,h]],3.4,1.2]],tn));
  [[14,52],[22,55],[34,54],[46,52]].forEach(([x,y])=>g.s(x,y,'W'));
  bsh(g,[['e',30,38,10,6]],tn);
  bsh(g,[['p',[[24,22],[36,22],[38,38],[22,38]]]],sk);g.rect(24,28,12,3,'C');g.px([[26,29],[30,29],[34,29]],'W');
  bsh(g,[['t',[[22,10],[16,24],[18,40]],3,1],['t',[[38,10],[44,24],[42,38]],3,1]],kp);
  bsh(g,[['e',30,15,5.6,6.4]],sk);beye(g,31,14,'E','W');beye(g,27,14,'E','W');g.line(28,19,32,19,'K');
  [[24,8],[28,5],[32,5],[36,8]].forEach(([x,y],i)=>bsh(g,[['k',x,y+3,x+(i<2?-1:1),y-2-B*(i%2),2.4]],['C','C','c','c']));
  bsh(g,[['t',[[36,26],[42,30],[46,28]],2,1.6],['t',[[24,26],[18,30],[16,34]],2,1.6]],sk);
  g.line(47+A,6,47+A,54,'n');g.ell(47.5+A,5,3,3,'K');g.s(47+A,4,'X');
  g.px(B?[[6,20],[54,16],[10,10]]:[[7,22],[53,18],[11,12]],'X');
  return {pal:Object.assign({},bT4(tn,'#3a5a6a',{cool:'#08141e'}),bT4(sk,'#8ab0a0',{cool:'#203a4a'}),bT4(kp,'#3a6a3a',{cool:'#0a2018'}),{n:'#5a4a3a',C:'#e07a6a',c:'#a04a4a',E:'#c890ff',W:'#f4f0e0',K:'#06080c',X:'#9affe8',D:'#0e1a1e'}),flat:'EWKXC',glow:'#6ad0b0',rim:'#080e12'};},
 // Scorchsand Ooze (fire, light): a living drop of the noon sun, a corona behind it, a crust of sand glass, molten drips
 mb_sunscorch(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?1:0,sl='abcd',cr='efgh';
  g.ell(30,57,24,2.4,'D');
  for(let a=0;a<12;a++){const t=a/12*6.283+(B?.13:0),r1=22,r2=27+(a%2)*2;g.poly([[30+Math.cos(t-.12)*r1,26+Math.sin(t-.12)*r1],[30+Math.cos(t)*r2,26+Math.sin(t)*r2],[30+Math.cos(t+.12)*r1,26+Math.sin(t+.12)*r1]],a%2?'X':'Y');}
  g.ell(30,26,21,21,'Y');bsh(g,[['e',30,26,19.5,19.5]],['Z','Z','z','z']);
  bsh(g,[['e',30,40-B,20+A*2,15+B],['p',[[12,44],[48,44],[50,56],[10,56]]]],sl,{cap:16});
  bsh(g,[['p',[[12,46],[20,42],[28,46],[36,42],[44,46],[48,52],[12,52]]]],cr);g.line(14,48,46,48,'h');
  [[16,30],[24,26],[36,27],[44,32]].forEach(([x,y])=>{g.ell(x,y+2-B,1.2,1.8,'W');});
  g.rect(24,34-B,3,4,'K');g.rect(34,34-B,3,4,'K');g.s(24,34-B,'W');g.s(34,34-B,'W');g.ell(30,41-B,3,1.4+A,'K');
  [[14,56],[22,57],[38,57],[46,56]].forEach(([x,y])=>{g.s(x,y,'X');g.s(x,y+1,'Y');});
  return {pal:Object.assign({},bT4(sl,'#ffa040',{warm:'#fff8d0',cool:'#8a2a10'}),bT4(cr,'#c8a060',{cool:'#3a2a1a'}),{K:'#4a1a08',W:'#fff8e0',X:'#fff0a0',Y:'#ffc84a',Z:'#e86a2a',z:'#b0401a',D:'#2a1a10'}),flat:'KWXYZz',glow:'#ffd060',rim:'#3a1a08'};},
 // The Void Cantor (shadow, lightning): a robed singer of the void, a white mask open in song, a halo of orbiting rune stars
 mb_voidcantor(g,f){const F=mfr(f),B=F.b?1:0,A=F.atk?1:0,rb='abcd',mk='efgh';
  g.ell(30,57,16,2,'D');
  for(let a=0;a<10;a++){const t=a/10*6.283+(B?.31:0);g.s(Math.round(30+Math.cos(t)*20),Math.round(18+Math.sin(t)*9),a%3?'X':'Y');}
  g.ell(30,18,22,10.5,'v');g.ell(30,18,20.6,9.2,0);
  bsh(g,[['p',[[22,14],[38,14],[44,30],[40,44],[34,52],[30,58],[26,52],[20,44],[16,30]]]],rb,{cap:16});
  g.path([[30,24],[28,32],[32,38],[29,46]],'Y');g.path([[22,28],[20,36]],'c');g.path([[38,28],[40,36]],'c');
  bsh(g,[['t',[[22,22],[12,24],[6,18-A*3]],2.6,1.6],['t',[[38,22],[48,24],[54,18-A*3]],2.6,1.6]],rb);
  g.px([[5,16-A*3],[6,15-A*3],[55,16-A*3],[54,15-A*3]],'X');
  bsh(g,[['e',30,13,7,8]],mk);g.rect(26,10,3,2,'K');g.rect(32,10,3,2,'K');g.s(27,10,'X');g.s(33,10,'X');g.ell(30,17,2,2+A+B*.5,'K');g.s(30,17,'Y');
  bsh(g,[['p',[[22,10],[30,0],[38,10],[38,6],[30,3],[22,6]]]],rb);
  g.px(B?[[8,40],[52,44],[12,50],[48,52]]:[[9,42],[51,42],[13,52],[47,50]],'Y');
  return {pal:Object.assign({},bT4(rb,'#3a2a5a',{cool:'#06041a'}),bT4(mk,'#eae6f4',{cool:'#4a4070'}),{c:'#2a1a4a',v:'#7a5ad0',K:'#06030e',X:'#e0c8ff',Y:'#ffe86a',D:'#0c0816'}),flat:'KXYv',glow:'#a07aff',rim:'#05030c'};}
};
// install: the drawing replaces the variant's recolour, frames on, drawn at its own 60 px (not the 1.5x enlargement of a 40 px foe)
Object.keys(G21ART).forEach(k=>{MART[k]=G21ART[k];MART[k].fr=1;if(typeof MEXTRA!=='undefined')MEXTRA[k]=()=>{};try{MINI_BIG.delete(k);}catch(e){}if(!BIG_ART.includes(k))BIG_ART.push(k);});
// ---------- 2. big on the map ----------
// sizes: the width on the map in world px (a tile is 16). Before: a guardian 40 (HD-2D) and its 60 px canvas (2D), a roamer 27 (HD-2D)
// and 22 (2D) whether elite or not. Now a guardian 48 in both (less only where the map's top edge leaves no room), an elite 32 (HD-2D)
// and 27 (2D): a step up from an ordinary foe, not a giant (v0.22.14; 0.22.13 had 62, 40 and 34).
G21.w={mini:48,elite:32};/* v0.22.14: the owner found 62 and 40 way too big */
const G21EL={fire:'#ff8a3a',water:'#4aa8ff',ice:'#bfe6ff',lightning:'#ffe14a',earth:'#d8a85a',wind:'#8ad0a0',light:'#fff0a0',shadow:'#b48aff'};
const g21Col=mon=>{const m=MON[mon];return (m&&m.el&&G21EL[m.el[0]])||'#ffd04a';};
const g21On=()=>!G21.off&&!(G&&G.daily);
// the idle frames of a guardian's or a roamer's art (monCanvas caches each frame)
function g21Frame(art,now,still){return monCanvas(art,{t:'idle',i:still?0:(Math.floor(now/640)%2)});}
// the actors this module draws, read with the core passes' own lists
function g21Minis(m){if(!m)return [];const h=G21.hide;G21.hide=0;let L;try{L=dynActors(m);}finally{G21.hide=h;}return L.filter(a=>a&&a.mini&&a.type==='elite'&&MON[a.b.mon]);}
function g21Elites(m){return (m&&m.roam&&(m.kind==='dungeon'||m.kind==='field'))?m.roam.filter(r=>r&&r.elite&&(!r.dead||r._g21h)&&MON[r.mon]):[];}
function g21RoamPos(r,now){let x=r.x*TS,y=r.y*TS;if(r.t0&&r.fx!=null){const p=Math.min(1,(now-r.t0)/(r.mode==='chase'?ROAM.chaseMs:ROAM.patrolMs));x=(r.fx+(r.x-r.fx)*p)*TS;y=(r.fy+(r.y-r.fy)*p)*TS;}return [x,y];}
// a guardian standing near the map's top edge is sized to fit under it (the camera stops at the edge; the back of a north-facing Sanctum hall)
function g21MiniW(a,c){const room=a.y*TS+16-14;return Math.max(40,Math.min(G21.w.mini,room*c.width/c.height));}
// the core passes skip them while drawing (the actors stay everywhere else)
HOOK.xform('dynActors','guard21','the big guardian is drawn by guard21',function(out,m){if(!G21.hide||!g21On()||!out)return out;return out.filter(a=>!(a&&a.mini));});
function g21Hide(m,fn){if(!g21On())return fn();const E=g21Elites(m).filter(r=>!r._g21h);G21.hide++;E.forEach(r=>{r._g21h=1;r.dead=true;});try{return fn();}finally{G21.hide--;E.forEach(r=>{r.dead=false;delete r._g21h;});}}
// 2D (Low, or HD-2D off): on top of the world like the roamers
function g21Draw2D(now){const m=WS.m,ctx=WS.ctx;if(!m||!ctx)return;const cx=Math.round(WS.cam.x),cy=Math.round(WS.cam.y),still=gfxStill();ctx.save();ctx.imageSmoothingEnabled=false;
  g21Minis(m).forEach(a=>{const mo=MON[a.b.mon],c=g21Frame(mo.art,now,still),W=g21MiniW(a,c),H=W*c.height/c.width,X=a.x*TS+8-cx,Y=a.y*TS+16-cy,col=g21Col(a.b.mon),p=still?.5:.5+.5*Math.sin(now/520);
    if(X<-W||Y<-H||X>WS.vw+W||Y>WS.vh+H)return;
    ctx.globalAlpha=.22+.12*p;ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(X,Y-2,W*.42,W*.15,0,0,7);ctx.fill();ctx.globalAlpha=.9;
    const n=18,r0=still?0:now/2400;for(let i=0;i<n;i++){const t=r0+i/n*6.283;ctx.fillRect(Math.round(X+Math.cos(t)*W*.38),Math.round(Y-2+Math.sin(t)*W*.13),i%3?1:2,1);}
    ctx.globalAlpha=1;ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(X,Y-1,W*.3,W*.08,0,0,7);ctx.fill();
    ctx.save();ctx.translate(X,0);ctx.scale(-1,1);ctx.drawImage(c,-W/2,Math.round(Y-H+3),W,H);ctx.restore();
    g21Tag2D(ctx,a,X,Math.round(Y-H+3));G21.n.mini++;G21.last.mini=['2d',W];});
  g21Elites(m).forEach(r=>{const mo=MON[r.mon],c=g21Frame(mo.art,now,still),W=27,H=W*c.height/c.width;let [x,y]=g21RoamPos(r,now);x-=cx;y-=cy;
    if(x<-W||y<-H||x>WS.vw+W||y>WS.vh+H)return;
    const [da,db]=DIRV[r.dir],S=ROAM.sight*TS;ctx.fillStyle=r.mode==='chase'?'rgba(255,90,60,.16)':'rgba(255,230,150,.09)';ctx.beginPath();ctx.moveTo(x+8,y+8);
    ctx.lineTo(x+8+da*S-db*S/2,y+8+db*S-da*S/2);ctx.lineTo(x+8+da*S+db*S/2,y+8+db*S+da*S/2);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x+8,y+14,W*.32,3,0,0,7);ctx.fill();
    ctx.strokeStyle='#ffc83d';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x+8,y+14,W*.42,4.5,0,0,6.283);ctx.stroke();
    ctx.drawImage(c,Math.round(x+8-W/2),Math.round(y+15-H),W,H);
    if(r.mode==='chase'){ctx.fillStyle='#ff5a3a';ctx.fillRect(x+7,y+11-H,2,5);ctx.fillRect(x+7,y+17-H,2,2);}G21.n.elite++;G21.last.elite=['2d',W];});
  ctx.restore();}
function g21Tag2D(ctx,a,X,top){const n=typeof sanctNear==='function'?sanctNear(a):0;
  ctx.fillStyle='#150b17';ctx.fillRect(X-2,top-9,5,9);ctx.fillStyle='#ff4a4a';ctx.fillRect(X-1,top-8,3,5);ctx.fillRect(X-1,top-2,3,1);
  /* v0.22.22 (owner: "Dont need miniboss names above their heads in overworld"): the name is in the popup when you walk up; only the red marker stays */}
HOOK.wrap('worldDraw','guard21','big guardians and elite roamers (2D, after the core pass skipped them)',function(next,...a){const m=WS.m;
  const r=g21Hide(m,()=>next(...a));try{if(g21On()&&m&&!(typeof hdActive==='function'&&hdActive()))g21Draw2D(a[0]||performance.now());}catch(e){G21.err=String(e&&e.message||e);}return r;});
// HD-2D: placed, lit and shadowed like every character (hdChar at an explicit width), the aura and rune ring as ground decals
function g21Char(bt,cv,fx,fy,fz,flip,wantW){const px=HD.px||1,W0=cv._rw||cv.width;let c=cv;
  if(wantW*px>W0){const k=Math.ceil(wantW*px/W0);const key='g21up'+k;c=cv[key];if(!c){c=cv[key]=mkCv(Math.round(W0*k),Math.round((cv._rh||cv.height)*k));const q=c.getContext('2d');q.imageSmoothingEnabled=false;q.drawImage(cv,0,0,c.width,c.height);}}
  return hdChar(bt,c,fx,fy,fz,flip,255,16,wantW/c.width);}
function g21DrawHD(m,now,ts){const B=HD.dyn,BB=HD.dynB,BA=HD.dynA,V=HD.S.V,still=gfxStill(),sp=HD2D.spr.sc;
  g21Minis(m).forEach(a=>{const mo=MON[a.b.mon],c=g21Frame(mo.art,now,still),fx=a.x*TS+8,fz=a.y*TS+12.5,W=g21MiniW(a,c),col=hdRgb(g21Col(a.b.mon)),p=still?.5:.5+.5*Math.sin(ts/520);
    if(Math.abs(fx-HD.cam.x)>460||Math.abs(fz-HD.cam.z)>560)return;
    hdDecal(BA,'glow',hdGlowS(),fx,fz+1,W*1.1,W*.42,col[0]*255,col[1]*255,col[2]*255,(.32+.22*p)*255);
    hdDecal(BB,'ring',hdRing(),fx,fz+1,W*.9,W*.34,col[0]*255,col[1]*255,col[2]*255,200,1.4);
    g21Char(B,c,fx,-sp*V,fz,true,W);const h=HD.chH;hdShadowC(fx,fz+1,1.1);
    hdBill(BA,'glow',hdGlowS(),fx,h*.3,fz-.5,false,W/22,col[0]*255,col[1]*255,col[2]*255,Math.round((.22+.12*p)*255),4);
    hdBill(B,'mkr',hdMark('#ff4a4a'),fx,h+3*V,fz,false,1,255,255,255,255,4);
    const n=0/* v0.22.22: no name above a guardian */,s=a.b.name||'';if(n>0&&s){const lab=hdSpr('gname:'+s,Math.max(24,s.length*5+8),11,(q,w,hh)=>{q.font='bold 8px sans-serif';q.textAlign='center';q.lineWidth=2.5;q.strokeStyle='#0a0614';q.fillStyle='#ffe08a';q.strokeText(s,w/2,8.5);q.fillText(s,w/2,8.5);});
      hdBill(B,'gname:'+s,lab,fx,h+12*V,fz,false,1,255,255,255,Math.round(n*255),4);}
    hdPickAdd(-1,fx,fz,Math.max(h,22*V),Math.max(W*.6,16),a.x,a.y);G21.n.mini++;G21.last.mini=['hd',W,HD.chW];});
  g21Elites(m).forEach(r=>{const mo=MON[r.mon],c=g21Frame(mo.art,now,still);const [x,y]=g21RoamPos(r,now);if(Math.abs(x-HD.cam.x)>420||Math.abs(y-HD.cam.z)>520)return;
    const [da,db]=DIRV[r.dir],S2=ROAM.sight*TS,cx=x+8,cz=y+8,ch=r.mode==='chase';H2P.set([cx,.5,cz,cx+da*S2-db*S2/2,.5,cz+db*S2-da*S2/2,cx+da*S2+db*S2/2,.5,cz+db*S2+da*S2/2,cx,.5,cz]);
    BB.quad(H2P,-1,0,-1,0,255,ch?90:230,ch?60:150,ch?46:26,0,1,0,4);
    const W=G21.w.elite;hdDecal(BB,'ring',hdRing(),cx,y+13,W*.8,W*.3,255,200,61,230,1.4);hdDecal(BA,'glow',hdGlowS(),cx,y+13,W,W*.36,255,200,61,70);
    g21Char(B,c,cx,-sp*V,y+12,false,W);const cw=HD.chW;hdShadowC(cx,y+13);if(ch)hdBill(B,'mkr',hdMark('#ff5a3a'),cx,HD.chH+4*V,y+12,false,.7,255,255,255,255,4);G21.n.elite++;G21.last.elite=['hd',W,cw];});}
HOOK.wrap('hdActors','guard21','big guardians and elite roamers (HD-2D, after the core pass skipped them)',function(next,m,now,ts){
  const r=g21Hide(m,()=>next(m,now,ts));try{if(g21On())g21DrawHD(m,now,ts);}catch(e){G21.err=String(e&&e.message||e);}return r;});
// tests
try{window.__G21={G21,art:G21ART,minis:()=>WS.m?g21Minis(WS.m):[],elites:()=>WS.m?g21Elites(WS.m):[]};}catch(e){}
