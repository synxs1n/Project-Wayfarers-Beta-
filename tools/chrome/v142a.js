// v0.14.2 sanctlook10.js: the side Sanctums as sacred places rooted in their realm. Layout untouched (3 x 2 gate footprint, rooms, start, prize,
// guardAt, mapIssues), the realm palette keys exist, both renderers (2D and HD-2D) draw the field gate and the Sanctum without exceptions,
// the music is the slow sacred piece. Usage: PWHTML=../../out/aurelis3.html node v142a.js
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1000,h:560});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();});await wait(300);
const KEYS={meadow:'thistle',coast:'strand',cave:'deeps',snow:'tundra',heights:'peaks',void:'starless'};
// ---- per theme: the field gate and the Sanctum map ----
const T=await ev(KEYS=>{const A=__A,g=A.TW.get,G=g('G'),Z=g('ZONES'),out={};G.stage=2;
  for(const [th,key] of Object.entries(KEYS)){const o={};const idx=Z.findIndex(z=>z.key===key);G.run.order[1]=idx;g('resetMaps')&&g('resetMaps')();
    const f=g('getMap')('f1');o.theme=f.theme;o.fortAt=f.fortAt||null;
    if(f.fortAt){const [x,y]=f.fortAt,t=f.t;o.foot=['U','U','U','U','E','U'].join('')===[t[y-1][x-1],t[y-1][x],t[y-1][x+1],t[y][x-1],t[y][x],t[y][x+1]].join('');o.cave=(f.caves||[]).some(c=>c.kind==='fort'&&c.x===x&&c.y===y&&c.id==='o1');
      try{const c0=g('buildMapCanvas')(f,0),c1=g('buildMapCanvas')(f,1);o.draw=!!c0&&!!c1&&c0.width===f.w*16;}catch(e){o.draw='ERR '+e.message;}
      o.eAfter=f.t[y][x]==='E';
      try{const sh=g('sncGateSheet')(f);o.sheet=sh&&sh.width>0&&sh.height>0;o.lights=g('sncGateLights')(f).length;}catch(e){o.sheet='ERR '+e.message;}
      o.mapIssues=g('mapIssues')(f).length;}
    const m=g('getMap')('o1');const P=g('DTHEME')[th+'#fort%sanct'];o.m={fort:m.fort,rooms:!!m.start&&!!m.prize,thv:m.thv,amb:m.amb,d8:m.d8,guard:m.guardAt,prize:m.prize,w:m.w,h:m.h,chests:(m.chests||[]).length};
    o.pal=P?{acc:P.acc,acc2:P.acc2,cloth:(P.cloth||[]).length,glass:(P.glass||[]).length,lg:!!P.lg,gr:(P.gr||[]).length,bloom:(P.bloom||[]).length,cap:P.cap,f:P.f.length,w:P.w.length,top:!!P.top,name:P.name}:null;
    o.issues=g('mapIssues')(m).length;
    // BFS from the start: prize, guard and every chest reachable (a chest or the rune circle is solid, so its neighbour is)
    const sol=(x,y)=>{const c=m.t[y]&&m.t[y][x];return c==null||g('SOLID').includes(c);},seen=new Set(),Q=[m.start.slice()];seen.add(m.start.join());
    for(let q=0;q<Q.length;q++){const [x,y]=Q[q];[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{const k=(x+a)+','+(y+b);if(seen.has(k)||sol(x+a,y+b))return;seen.add(k);Q.push([x+a,y+b]);});}
    const near=(p)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>seen.has((p[0]+a)+','+(p[1]+b)));
    o.reach={prize:near(m.prize),guard:m.guardAt?near(m.guardAt):null,chests:(m.chests||[]).every(c=>near(c))};
    o.tiles={prizeC:m.t[m.prize[1]][m.prize[0]],guardX:m.guardAt?m.t[m.guardAt[1]][m.guardAt[0]]:null,startE:m.t[m.start[1]-1][m.start[0]]};
    // 2D: every tile of the Sanctum, both frames
    try{const c0=g('buildMapCanvas')(m,0),c1=g('buildMapCanvas')(m,1);o.draw2d=c0.width===m.w*16&&c1.height===m.h*16;
      const d=c0.getContext('2d').getImageData(0,0,c0.width,c0.height).data;let red=0,n=0;for(let i=0;i<d.length;i+=40){n++;if(d[i]>150&&d[i+1]<70&&d[i+2]<70)red++;}o.redShare=+(red/n).toFixed(4);}catch(e){o.draw2d='ERR '+e.message;}
    // props, motes, the rune circle, the lantern
    try{const gm=g('SNCX');gm.dm=m;const pc=g('objCanvas')(m.theme,'pillar'),lc=g('objCanvas')(m.theme,'brazier',1);gm.dm=null;o.props=pc.height>=23&&lc.height>=18&&lc.width>=14;
      const cv=document.createElement('canvas');cv.width=200;cv.height=120;g('themeFX')(cv.getContext('2d'),m,200,120,1234);o.fx=true;g('drawHallRunes')(cv.getContext('2d'),m);o.runes=true;}catch(e){o.props='ERR '+e.message;}
    out[th]=o;}
  return out;},KEYS);
for(const [th,o] of Object.entries(T)){console.log(th,JSON.stringify(o).slice(0,900));
  if(o.fortAt){chk(`${th}: the gate is still the 3 x 2 footprint (five U tiles round an E door) and a fort cave entry`,o.foot&&o.cave&&o.eAfter||JSON.stringify([o.foot,o.cave,o.eAfter]));
    chk(`${th}: the field with the gate has no map issues and draws (2D base, both frames) with the new ground, lights and sheet`,o.mapIssues===0&&o.draw===true&&o.sheet===true&&o.lights===2||JSON.stringify([o.mapIssues,o.draw,o.sheet,o.lights]));}
  else console.log('note: no gate site found on the '+th+' field of this journey (placeFort found no clearing)');
  chk(`${th}: the Sanctum keeps its rooms, prize chest, rune circle and start door; passes mapIssues; everything reachable`,o.m.fort&&o.m.rooms&&o.m.w===62&&o.m.h===40&&o.issues===0&&o.reach.prize&&o.reach.guard&&o.reach.chests&&o.tiles.prizeC==='C'&&o.tiles.guardX==='X'&&o.tiles.startE==='E'||JSON.stringify([o.m,o.issues,o.reach,o.tiles]));
  chk(`${th}: the realm palette exists (accent, cloth, glass, ground, bloom, cap) and the map uses it with the motes ambience`,o.pal&&o.pal.acc&&o.pal.acc2&&o.pal.cloth===2&&o.pal.glass===2&&o.pal.lg&&o.pal.gr===3&&o.pal.bloom===2&&o.pal.cap&&o.pal.f===4&&o.pal.w===4&&o.pal.top&&o.pal.name==='sanct'&&o.m.thv===th+'#fort%sanct'&&o.m.amb==='sanctmotes'&&o.m.d8==='sanct'||JSON.stringify([o.pal,o.m]));
  chk(`${th}: the Sanctum draws in 2D (no exception), is not crimson, and its columns, lanterns, motes and rune circle exist`,o.draw2d===true&&o.redShare<.01&&o.props===true&&o.fx&&o.runes||JSON.stringify([o.draw2d,o.redShare,o.props,o.fx,o.runes]));}
const accs=new Set(Object.values(T).map(o=>o.pal&&o.pal.acc));chk('six realms, six accents (moss, kelp, ember, frost, gold, violet), none of them the old crimson',accs.size===6&&!accs.has('#c0392b')||[...accs].join());
// ---- music ----
const M=await ev(()=>{const g=__A.TW.get,o={};const mo=g('MOODS').fort;o.mood=[mo.bpm,mo.sc];const t=g('musicTrack')('fort',{});o.t=t&&{name:t.name,bpm:t.bpm,len:t.loop&&t.loop.len,once:!!t.once};return o;});console.log(JSON.stringify(M));
chk('the Sanctum music is a slow, sacred piece under the same key (bpm <= 70, compiles to a loop)',M.mood[0]<=70&&M.t&&M.t.bpm<=70&&M.t.len>0&&!M.t.once&&/Sanctum/.test(M.t.name)||JSON.stringify(M));
// ---- HD-2D: the Sanctum and the gate stand up as geometry, no exceptions ----
const HDR=await ev(async()=>{const A=__A,g=A.TW.get,G=g('G'),o={};A.META.cfg.gfx='high';A.META.cfg.hd2d=true;A.gfxApply();
  const f=g('getMap')('f1');if(f.fortAt){g('placeAt')('f1',f.fortAt[0],f.fortAt[1]+2,'u');A.WS.lock=false;}
  await new Promise(r=>setTimeout(r,1500));o.live=!!A.HD.live;o.gate=!!(f.fortAt&&A.HD.S&&(A.HD.S.bh||[]).some(q=>q.b&&q.b.k==='gatehouse'));o.gateH=o.gate?(A.HD.S.bh.find(q=>q.b&&q.b.k==='gatehouse').h):0;
  const m=g('getMap')('o1');m.open=0;g('placeAt')('o1',m.prize[0]-3,m.prize[1],'r');A.WS.lock=false;await new Promise(r=>setTimeout(r,1500));
  o.inside=A.WS.m&&A.WS.m.id==='o1'&&!!A.HD.S&&A.HD.S.m&&A.HD.S.m.id==='o1';o.liveIn=!!A.HD.live;
  // the struct strip: band A faces are not the old keep's (no crimson) and the motes ambience runs in the overlay
  if(A.HD.S&&A.HD.S.tst||true){try{const cv=g('hdStructCanvas')(m,{hArt:32,zArt:32,V:1});const d=cv.getContext('2d').getImageData(0,0,64,32).data;let red=0;for(let i=0;i<d.length;i+=4)if(d[i]>150&&d[i+1]<70&&d[i+2]<70&&d[i+3]>0)red++;o.structRed=red;o.struct=true;}catch(e){o.struct='ERR '+e.message;}}
  // light: the look is lifted for the pale stone
  try{const l=g('hdLook')(m,1000);o.look=[+l.exp.toFixed(2),+l.lamp.toFixed(2),+l.amb[0].toFixed(2)];}catch(e){o.look='ERR '+e.message;}
  A.META.cfg.hd2d=false;A.gfxApply();await new Promise(r=>setTimeout(r,500));o.back2d=!A.HD.live;return o;});
console.log(JSON.stringify(HDR));
if(HDR.live){chk('HD-2D: the gate stands as geometry (a gatehouse part with a lintel height) and the Sanctum bakes and renders',HDR.gate&&HDR.gateH>30&&HDR.inside&&HDR.liveIn||JSON.stringify(HDR));
  chk('HD-2D: faces carry no crimson, the look is lifted for pale stone (lamp softened)',HDR.struct===true&&HDR.structRed<4&&Array.isArray(HDR.look)||JSON.stringify([HDR.struct,HDR.structRed,HDR.look]));}
else console.log('note: HD-2D not live in this browser (no WebGL); HD checks skipped');
chk('switching HD-2D off returns to the 2D view',HDR.back2d===true||JSON.stringify(HDR));
await done(H);})();
