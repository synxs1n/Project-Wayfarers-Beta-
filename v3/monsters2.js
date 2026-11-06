// ===== monsters2.js (v0.4.0): six new foes (Undead, Jelly, Swarm) and their sprites =====
// Register order matters: this file runs after data.js and art.js, so the shared tables exist.
// Add a new monster by copying one block: MON entry, MART sprite, drops, family, and the realm pool at the bottom.

Object.assign(MON,{
 gnatswarm:{n:'Gnat Swarm',art:'gnatswarm',el:['wind'],hp:.7,atk:.85,def:.6,mag:.7,res:.7,spd:1.4,sk:[['Biting Cloud','wind',.9,'all','phys',[['poison',.25]]]]},
 barrowbones:{n:'Barrow Bones',art:'barrowbones',el:['shadow'],hp:.95,atk:1.05,def:.9,mag:.7,res:.8,spd:.85,sk:[['Rusty Cleave','shadow',1.2,'one','phys',[['bleed',.3]]]]},
 drownedsailor:{n:'Drowned Sailor',art:'drownedsailor',el:['water','shadow'],hp:1.1,atk:1.1,def:1,mag:.8,res:.9,spd:.8,sk:[['Hook Drag','water',1.35,'one','phys',[['root',.25]]],['Drowned Dirge','shadow',1,'all','mag',[['slow',.3]]]]},
 brinejelly:{n:'Brine Jelly',art:'brinejelly',el:['water'],hp:1.3,atk:.8,def:1.2,mag:1,res:.9,spd:.7,sk:[['Stinging Wrap','water',1.2,'one','mag',[['poison',.4]]]]},
 rimewight:{n:'Rime Wight',art:'rimewight',el:['ice','shadow'],hp:1.2,atk:.9,def:1,mag:1.25,res:1.1,spd:.8,sk:[['Grave Chill','ice',1.25,'one','mag',[['slow',.4]]],['Frost Shroud','ice',0,'self','buff',[['ward',1]]]]},
 galephantom:{n:'Gale Phantom',art:'galephantom',el:['wind','shadow'],hp:.8,atk:.9,def:.7,mag:1.25,res:1.2,spd:1.25,sk:[['Keening Gale','wind',1,'all','mag',[['blind',.3]]]]}
});
Object.assign(MON_DROPS,{gnatswarm:['ichor','healroot'],barrowbones:['grit','ichor'],drownedsailor:['scale','ichor'],brinejelly:['scale','bluecap'],rimewight:['ichor','bluecap'],galephantom:['ichor','bluecap']});

Object.assign(MART,{
 gnatswarm(g){
  // a drifting cloud: a loose ring of specks with a few bigger bodies and wings
  let s=7;const r=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};
  for(let i=0;i<46;i++){const a=r()*6.283,d=Math.sqrt(r())*13;g.s(20+Math.cos(a)*d*1.15,20+Math.sin(a)*d*.9,i%7===0?'W':'B');}
  [[14,15],[24,13],[19,22],[27,24],[12,26],[21,29],[30,17]].forEach(([x,y])=>{g.rect(x,y,2,2,'K');g.px([[x-1,y-1],[x+2,y-1]],'W');g.s(x,y,'E');});
  return {pal:{B:'#6a6a4a',K:'#2a2418',W:'#e8e4c8',E:'#ff6a4a'},flat:'WEK'};
 },
 barrowbones(g){
  g.ell(20,8,6,6,'B');g.rect(16,11,9,5,'B');g.rect(17,7,3,3,'K');g.rect(22,7,3,3,'K');g.px([[18,8],[23,8]],'E');
  g.rect(19,11,3,2,'K');g.px([[17,15],[19,15],[21,15],[23,15]],'K');
  g.rect(19,17,3,10,'b');for(let y=18;y<=25;y+=2){g.rect(14,y,13,1,'B');g.px([[14,y+1],[26,y+1]],'B');}
  g.rect(16,27,9,3,'B');g.rect(16,30,2,8,'B');g.rect(23,30,2,8,'B');g.rect(14,37,5,2,'b');g.rect(22,37,5,2,'b');
  g.line(14,19,9,27,'B',2);g.ell(7,28,5,6,'S');g.ell(7,28,2,2,'M');g.rect(6,23,3,1,'M');
  g.line(27,19,31,23,'B',2);g.rect(31,9,2,14,'R');g.rect(30,23,4,2,'S');g.px([[32,8]],'R');
  return {pal:{B:'#d8d0b0',b:'#a09878',K:'#1a1020',E:'#7aff9a',S:'#6a4a2a',M:'#b0a070',R:'#9a8a7a'},flat:'EK'};
 },
 drownedsailor(g){
  g.ell(20,10,6,6,'B');g.poly([[13,9],[27,9],[24,3],[16,3]],'H');g.rect(12,8,17,2,'H');g.rect(12,9,17,1,'h');
  g.rect(17,10,3,2,'K');g.rect(22,10,3,2,'K');g.px([[18,10],[23,10]],'E');g.line(18,15,23,15,'K');
  g.ell(20,23,8,9,'C');g.rect(13,28,15,5,'C');g.rect(16,33,3,6,'D');g.rect(22,33,3,6,'D');g.rect(14,38,5,2,'K');g.rect(21,38,5,2,'K');
  g.line(13,17,8,27,'B',2);g.line(28,17,33,23,'B',2);g.path([[33,23],[35,14],[32,10]],'S',2);g.px([[31,9],[30,10]],'S');
  g.px([[16,20],[24,22],[19,27],[26,29],[14,24]],'N');g.path([[17,17],[15,24],[18,31]],'W');g.path([[24,17],[26,25],[23,31]],'W');
  return {pal:{B:'#8aa89a',H:'#3a4a5a',h:'#c8b060',K:'#101a20',E:'#9affe8',C:'#3a5a6a',D:'#2a3a48',S:'#9a9aa8',N:'#d8d4b8',W:'#3a8a4a'},flat:'EKN'};
 },
 brinejelly(g){
  g.ell(20,27,14,10,'B');g.ell(20,22,11,6,'b');g.ell(15,19,4,2,'L');g.ell(26,30,3,2,'b');
  g.rect(15,25,3,4,'K');g.rect(23,25,3,4,'K');g.px([[16,26],[24,26]],'E');g.line(17,32,24,32,'K');
  [[10,28],[29,26],[20,35],[24,20],[12,33]].forEach(([x,y])=>{g.ell(x,y,1.6,1.6,'L');});
  g.path([[8,34],[6,38]],'B',2);g.path([[32,33],[35,38]],'B',2);g.path([[20,36],[20,39]],'B',2);
  return {pal:{B:'#4aa8b8',b:'#2f7f94',L:'#c8f4ff',K:'#10242c',E:'#e8ffff'},flat:'LEK'};
 },
 rimewight(g){
  g.poly([[20,10],[30,14],[33,38],[26,34],[20,39],[14,34],[7,38],[10,14]],'B');g.poly([[12,22],[9,34],[15,30]],'b');g.poly([[28,22],[31,34],[25,30]],'b');
  g.ell(20,12,6,6,'K');g.rect(17,11,3,2,'E');g.rect(22,11,3,2,'E');
  g.poly([[13,8],[14,1],[17,6],[20,0],[23,6],[26,1],[27,8]],'C');
  g.line(8,18,4,28,'b',2);g.line(32,18,36,28,'b',2);g.px([[3,29],[4,30],[36,29],[37,30]],'C');
  g.path([[20,16],[20,34]],'b');g.px([[16,24],[24,26],[20,30],[12,30],[28,32]],'C');
  return {pal:{B:'#6a86b0',b:'#46608a',K:'#0c1424',E:'#aaf4ff',C:'#d4f0ff'},flat:'EKC'};
 },
 galephantom(g){
  g.poly([[20,6],[28,10],[30,20],[27,28],[31,38],[22,32],[18,39],[14,31],[8,36],[11,26],[10,16],[13,9]],'B');
  g.poly([[14,18],[10,28],[16,24]],'b');g.poly([[26,18],[30,28],[24,24]],'b');
  g.ell(20,14,5,5,'K');g.rect(17,13,2,2,'E');g.rect(22,13,2,2,'E');g.line(18,19,23,19,'K');
  g.path([[4,12],[10,10],[8,15]],'W');g.path([[36,20],[31,18],[33,24]],'W');g.path([[3,26],[9,28]],'W');g.path([[37,32],[32,31]],'W');
  return {pal:{B:'#7a7aa8',b:'#54547e',K:'#0e0e22',E:'#c8a8ff',W:'#cfe8ff'},flat:'EKW'};
 }
});

// companion families for taming
if(typeof FAM_OF!=='undefined')Object.assign(FAM_OF,{gnatswarm:'flyer',barrowbones:'spirit',drownedsailor:'spirit',brinejelly:'ooze',rimewight:'spirit',galephantom:'spirit'});

// realm pools: Undead where the story puts them (a barrow, a harbor, a mountain pass, the high wind), a Jelly and a Swarm among the living
ZONES[0].pool.push('gnatswarm','barrowbones');
ZONES[1].pool.push('drownedsailor','brinejelly');
ZONES[3].pool.push('rimewight');
ZONES[4].pool.push('galephantom');
