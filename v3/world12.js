// ===== world12.js (v0.18.7): town landmarks, the Echo Rift hall, node spawner checks, wild recruit spacing, realm Scourges, small fixes =====
// Owner's ten requests after v0.18.6 (docs/v0187-world12.md):
//  1 every town has one landmark (LM12): its own silhouette and colour, a 2 x 2 solid footprint ('j' tiles) placed where the entry sees it, drawn in 2D
//    (a depth sorted actor) and in HD-2D (a standing card), named in the town's intro line and read when you face it.
//  2 the phone pad sits under every text box (style.css, end of file)         3 the Echo Rift hall has no solid tile that shows nothing (sanctum.js)
//  4 gathering nodes never share a chest tile and are always reachable (nodeFix, in getMap and after placeNodes; drawAudit.nodes reports it)
//  5 Rift gate colours come from the boss behind the gate (RIFT_COL in realmdata.js, riftGateCol in sanctum.js)   6 no "(relit)" on the Breach
//  7 north and south walk frames have a real stride (art.js)                  8 wild recruit events are spaced, budgeted per realm, dual types come later
//  9 each realm's own Scourge (REALMS boss in realmdata.js; realms14: no alternates any more)               10 echoName() (echocore.js): "Echo Dimmer", never "Echo The Dimmer"
// ---------- 1. landmarks ----------
// Each painter draws on a 56 x 96 card, ground line at y 92, centre x 28, in 4 or fewer animation frames. P is the painter kit.
const LMW=56,LMH=96,LMY=92,LMC=28,LM_OUT='#150b17';
function lmKit(ctx){
  const rc=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
  const row=(c,y,x0,x1)=>{if(x1>x0)rc(c,x0,y,x1-x0,1);};
  const ell=(c,cx,cy,rx,ry)=>{for(let j=-Math.round(ry);j<=Math.round(ry);j++){const w=rx*Math.sqrt(Math.max(0,1-(j*j)/(ry*ry)));row(c,Math.round(cy)+j,Math.round(cx-w),Math.round(cx+w));}};
  const E=(c,cx,cy,rx,ry,hi)=>{ell(LM_OUT,cx,cy,rx+1,ry+1);ell(c,cx,cy,rx,ry);if(hi!==0)ell(tint(c,.22),cx-rx*.22,cy-ry*.28,rx*.62,ry*.55);};
  const fillPoly=(c,pts)=>{ctx.fillStyle=c;const ys=pts.map(p=>p[1]),y0=Math.floor(Math.min(...ys)),y1=Math.ceil(Math.max(...ys));
    for(let y=y0;y<y1;y++){const yy=y+.5,xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=yy&&b[1]>yy)||(b[1]<=yy&&a[1]>yy))xs.push(a[0]+(yy-a[1])/(b[1]-a[1])*(b[0]-a[0]));}
      xs.sort((p,q)=>p-q);for(let i=0;i+1<xs.length;i+=2){const x0=Math.round(xs[i]),x1=Math.round(xs[i+1]);if(x1>x0)ctx.fillRect(x0,y,x1-x0,1);}}};
  const G=(c,pts,nolit)=>{[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]].forEach(([a,b])=>fillPoly(LM_OUT,pts.map(p=>[p[0]+a,p[1]+b])));fillPoly(c,pts);};
  const B=(c,x,y,w,h)=>{rc(LM_OUT,x-1,y-1,w+2,h+2);rc(c,x,y,w,h);rc(tint(c,.3),x,y,w,1);rc(tint(c,.18),x,y,1,h);rc(shade(c,.72),x+w-1,y+1,1,h-1);rc(shade(c,.8),x+1,y+h-1,w-1,1);};
  const L=(c,x0,y0,x1,y1,t)=>{t=t||1;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)rc(c,x0+(x1-x0)*i/n-(t>1?.5*(t-1):0),y0+(y1-y0)*i/n-(t>1?.5*(t-1):0),t,t);};
  const S=(rx)=>{ctx.fillStyle='rgba(8,5,20,.3)';ell('rgba(8,5,20,.3)',LMC,LMY+1,rx||19,3);};
  const A=(a,fn)=>{ctx.globalAlpha=a;fn();ctx.globalAlpha=1;};
  const dots=(c,list)=>list.forEach(([x,y,w,h])=>rc(c,x,y,w||1,h||1));
  return {rc,E,G,B,L,S,A,dots,ell,poly:fillPoly,row};}
// the 26 landmarks (23 + three for the realms14 towns), one per town (keyed by the town's name): n the name in the intro line, line what the player reads at its foot,
// fr animation frames, lt night light [dx,dy,radius,kind] (dx,dy from the footprint's top left px), col its signature colour (a colour the card is painted with; no two within 30 RGB, v168a)
const LM12=[
 {town:'Larkspur',id:'hollowoak',n:'the Hollow Oak',fr:2,lt:[28,36,22,'lamp'],col:'#3b8a34',
  line:'An oak older than the town stands at the head of the street, its crown wider than the market and a lantern lit in the hollow of its trunk.',
  draw(P,f){const {E,G,B,rc,S,dots}=P;S(22);G('#5a3a22',[[12,92],[17,76],[39,76],[44,92],[34,89],[22,89]]);B('#6a4528',19,44,18,34);rc('#4a2e1a',19,44,3,34);
   E('#1a0e08',28,66,5,9,0);E('#ffb84a',28,70,3,4,0);rc('#fff0a0',27,69,2,2);
   E('#2b6a2a',28,30,25,19);E('#3b8a34',14,36,13,11);E('#3b8a34',43,34,12,12);E('#50a444',22,20,13,9);E('#50a444',38,22,10,8);E('#74c05a',16,24,6,4);E('#74c05a',34,12,6,3);
   dots('#ffe86a',[[10+f*2,52,1,1],[44-f*2,48,1,1],[22,58+f,1,1],[34,60-f,1,1],[40,40+f,1,1]]);}},
 {town:'Port Cerise',id:'lighthouse',n:'the Cerise Light',fr:2,lt:[28,24,30,'gold'],col:'#d0383a',
  line:'A striped lighthouse stands on the rocks at the end of the quay. Its lamp has not gone out once since the beacons began to fail.',
  draw(P,f){const {E,G,B,rc,S,A,poly}=P;S(20);E('#6a6a78',LMC,LMY-2,22,7);E('#80808e',LMC-8,LMY-4,8,4);
   G('#d8d8e0',[[17,86],[39,86],[34,36],[22,36]]);for(let y=36;y<86;y++){const hw=5+(y-36)/50*6,s=Math.floor((y-36)/9)%2;rc(s?'#d8d8e0':'#d0383a',LMC-hw,y,hw*2,1);rc(s?'#a8a8b8':'#8a2028',LMC+hw-3,y,3,1);rc(s?'#f2f2f8':'#e86a6a',LMC-hw,y,2,1);}
   B('#3a3a46',17,31,22,4);rc('#8a8a98',18,27,1,4);rc('#8a8a98',37,27,1,4);rc('#8a8a98',27,27,2,4);
   rc(LM_OUT,21,15,14,16);rc('#fff4b0',22,16,12,14);rc(f?'#ffffff':'#ffe070',24,19,8,8);rc('#7a6a3a',27,16,2,14);
   G('#b02a2a',[[18,15],[28,4],[38,15]]);rc('#e0e0e8',27,2,2,3);B('#3a2a24',25,76,6,10);
   A(.42,()=>poly('#fff0a0',f?[[36,22],[56,12],[56,30]]:[[20,22],[0,12],[0,30]]));}},
 {town:'Kilngate',id:'smelter',n:'the Kilngate Smelter',fr:2,lt:[22,70,26,'fire'],col:'#e8561e',
  line:'The Kilngate smelter squats beside the road, its furnace never cold and its tall chimney the first thing you see through the smoke.',
  draw(P,f){const {E,G,B,rc,S,A}=P;S(22);B('#4c4854',6,58,38,32);for(let y=64;y<88;y+=6)rc('#34303c',7,y,36,1);for(let x=12;x<44;x+=9)rc('#34303c',x,58,1,32);
   rc(LM_OUT,13,66,16,24);rc('#1a0e0a',14,67,14,23);rc('#e8561e',15,72,12,18);rc(f?'#ffd04a':'#ffb030',17,76,8,14);rc('#fff0a8',19,82,4,8);
   B('#7a4a3a',32,10,13,50);for(let y=14;y<58;y+=4)rc('#5a3428',33,y,11,1);rc('#9a6450',33,10,2,50);B('#3a3a44',30,7,17,4);
   rc('#ff7a2a',33,5,9,2);rc('#ffd04a',35,4,5,1);B('#6a6a76',28,50,10,3);
   A(.55,()=>{E('#9a9aa6',38+f*2,0,5,4,0);E('#8a8a96',42-f,-4,4,3,0);});}},
 {town:'Kestrel Hold',id:'falconkeep',n:'the Falcon Keep',fr:2,lt:null,col:'#8e98ae',
  line:'The Falcon Keep rises at the heart of Kestrel Hold, a round tower of slate grey stone, a stone falcon on its crown and a pennant that never lies still.',
  draw(P,f){const {E,G,B,rc,S,dots}=P;S(20);B('#8e98ae',12,34,32,56);rc('#b4bed4',12,34,3,56);rc('#5e667c',41,35,3,55);
   for(let i=0;i<4;i++)B('#8e98ae',12+i*9,26,6,9);rc('#f4faff',12,34,32,2);rc('#f4faff',12,26,6,1);rc('#f4faff',30,26,6,1);
   dots('#2a3450',[[22,48,2,7],[34,48,2,7],[22,64,2,7],[34,64,2,7]]);B('#5a4a42',22,76,12,14);rc('#14101a',24,78,8,12);
   rc('#5a5a6a',27,8,2,18);G(f?'#e8742a':'#f0842e',[[29,9],[44,12+f],[29,17]]);G('#2a2a3a',[[14,26],[17,19],[19,22],[21,26]]);rc('#e8e8f4',15,21,1,1);}},
 {town:'Skyhaven',id:'airmast',n:'the Skyhaven Mooring',fr:2,lt:[28,30,16,'lamp'],col:'#2aa8a0',
  line:'A mooring mast stands over Skyhaven with a striped airship tugging at its rope. It has been docked so long that nobody remembers where it was going.',
  draw(P,f){const {E,G,B,rc,S,L,ell,row}=P;S(18);B('#8a6a4a',23,56,10,34);B('#6a4a2a',14,54,28,4);B('#6a4a2a',20,86,16,4);L('#8a6a4a',14,58,23,86);L('#8a6a4a',42,58,33,86);
   const by=26+f;ell(LM_OUT,28,by,23,19);for(let j=-18;j<=18;j++){const w=22*Math.sqrt(1-(j*j)/324);for(let x=Math.round(28-w);x<Math.round(28+w);x++)rc(Math.floor((x-6)/5)%2?'#fff0d8':'#2aa8a0',x,by+j,1,1);}
   ell('rgba(20,70,80,.28)',32,by+6,17,11);L('#6a4a2a',16,by+14,22,46+f);L('#6a4a2a',40,by+14,34,46+f);B('#7a4a2a',21,44+f,14,7);rc('#ffe08a',24,46+f,3,3);
   rc('#5a5a66',27,6+f,2,8);G('#f0705e',[[30,4+f],[44,7+f],[30,11+f]]);L('#c8b890',28,51+f,28,56);}},
 {town:'Lantern Rest',id:'greatlantern',n:'the Great Lantern',fr:2,lt:[36,34,34,'violet'],col:'#7a50d0',
  line:'Lantern Rest keeps one great lantern on an iron post at the end of its street, violet glass over a flame that burns whatever the weather does.',
  draw(P,f){const {E,G,B,rc,S,A,ell}=P;S(16);B('#5a4a6a',16,76,24,14);B('#3a3048',24,40,5,38);B('#3a3048',24,36,24,4);
   rc('#7a7a8a',44,40,1,8);A(.35+.2*f,()=>ell('#c8a0ff',36,60,17,19));
   rc(LM_OUT,30,46,14,24);rc('#3a3048',31,47,12,22);rc('#7a50d0',32,50,10,16);rc(f?'#fff0c0':'#ffd890',34,53,6,10);rc('#b898ff',32,50,2,16);G('#3a3048',[[29,47],[37,38],[45,47]]);rc('#3a3048',30,70,14,3);
   rc('#d8c8ff',33,31+f,1,1);rc('#d8c8ff',44,40,1,1);}},
 {town:'Brackenford',id:'windmill',n:'the Brackenford Mill',fr:4,lt:null,col:'#c8a858',
  line:'The Brackenford mill turns on the hill above the sheep pens, its sails white against the heath and its stones grinding whatever the wind brings.',
  draw(P,f){const {E,G,B,rc,S,poly,ell}=P;S(20);G('#c8a858',[[13,90],[43,90],[36,40],[20,40]]);for(let y=40;y<90;y++){const hw=8+(y-40)/50*7;rc(((y-40)>>3)%2?'#d8b868':'#c8a858',LMC-hw,y,hw*2,1);rc('#8a7034',LMC+hw-3,y,3,1);}
   for(let y=46;y<88;y+=14){const hw=8+(y-40)/50*7;rc('#7a5a3a',LMC-hw,y,hw*2,2);}B('#5a3a22',24,74,8,16);rc('#14101a',25,76,6,14);B('#e8f0f8',33,52,5,6);rc('#4a3a30',34,54,3,4);
   G('#8a5a3a',[[17,40],[28,26],[39,40]]);rc('#6a4428',28,24,1,4);
   const hy=34,a0=Math.PI/4+f*Math.PI/8;for(let k=0;k<4;k++){const a=a0+k*Math.PI/2,dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx,p0=[LMC+dx*5,hy+dy*5],p1=[LMC+dx*23,hy+dy*23];
    G('#f2ead4',[[p0[0]+nx,p0[1]+ny],[p1[0]+nx,p1[1]+ny],[p1[0]+nx*7,p1[1]+ny*7],[p0[0]+nx*7,p0[1]+ny*7]]);P.L('#6a4a2a',p0[0],p0[1],p1[0],p1[1],2);}
   E('#5a3a1a',LMC,hy,3,3);}},
 {town:'Ciderbrook',id:'ciderpress',n:'the Great Cider Press',fr:1,lt:null,col:'#b0722a',
  line:'In the middle of Ciderbrook stands the great cider press, a barrel as tall as a house beside a timber screw, and the town smells of apples from here to the gates.',
  draw(P,f){const {E,G,B,rc,S,L,dots}=P;S(23);B('#7a4a22',36,22,5,68);B('#7a4a22',48,22,5,68);B('#7a4a22',34,18,21,6);rc('#5a5a66',43,24,3,24);rc('#8a8a98',43,24,1,24);L('#5a3a1a',36,36,52,36,2);B('#9a6a32',37,48,15,5);
   B('#b0722a',4,38,28,50);E('#c88a3a',18,38,14,5);rc('#3a2410',4,50,28,2);rc('#3a2410',4,72,28,2);rc('#5a5a66',4,50,28,1);rc('#5a5a66',4,72,28,1);rc('#d8a050',8,40,2,46);rc('#8a5420',28,40,3,46);rc('#e8a84a',10,60,12,6);rc('#8a5420',12,62,8,2);
   E('#d03a2a',40,86,4,4);E('#e05a3a',47,87,4,4);E('#b82a20',34,88,3,3);E('#d03a2a',51,89,3,3);dots('#4aa04a',[[41,81,3,2],[48,82,3,2]]);}},
 {town:'Kelpwharf',id:'whalearch',n:'the Whalebone Arch',fr:2,lt:null,col:'#e8e0c8',
  line:'Two ribs of a great whale curve over the quay at Kelpwharf and meet like a gate, bleached white; every boat is steered under them for luck.',
  draw(P,f){const {E,G,B,rc,S,dots}=P;S(21);const pts=[];for(let i=0;i<=40;i++){const t=Math.PI*i/40;pts.push([LMC-19+(1-Math.cos(t))*19,LMY-2-Math.sin(t)*72]);}
   [0,1,2].forEach(pass=>pts.forEach((p,i)=>{const e=Math.abs(i-20)/20,r=2+e*3.2;if(pass===0)P.ell(LM_OUT,p[0],p[1],r+1,r+1);else if(pass===1)P.ell('#e8e0c8',p[0],p[1],r,r);else P.ell('#fffaf0',p[0]-1,p[1]-1,Math.max(1,r-2),Math.max(1,r-2));}));
   E('#6a6a78',9,LMY-2,8,5);E('#6a6a78',47,LMY-2,8,5);dots('#4a8a5a',[[8,80,1,8],[10,82,1,6],[46,80,1,8],[48,82,1,6],[44,84,1,4]]);dots('#c8b898',[[9,60,2,2],[46,56,2,2],[28,19,2,2]]);
   dots('#f0f0f8',[[26+f*3,10,3,1],[27+f*3,9,1,1],[29+f*3,9,1,1]]);}},
 {town:'Reedwade',id:'stilthut',n:'the Reedwade Watch Hut',fr:2,lt:[14,50,16,'cyan'],col:'#3a5a58',
  line:'A watch hut on tall stilts leans over Reedwade, hung with teal marsh lanterns that the reeds seem to grow toward at dusk.',
  draw(P,f){const {E,G,B,rc,S,L,A,dots,ell}=P;S(21);ell('rgba(40,90,80,.35)',LMC,LMY,22,4);[12,20,34,42].forEach(x=>B('#3a2a1a',x,58,3,32));L('#4a3a22',12,60,34,88,1);L('#4a3a22',42,60,20,88,1);
   B('#5a4a30',6,54,44,4);B('#3a5a58',10,34,36,20);rc('#5a807c',10,34,3,20);rc('#1e302e',41,35,4,19);for(let y=38;y<54;y+=4)rc('#2a4240',11,y,34,1);
   B('#14101a',24,42,8,12);rc('#ffe090',16,40,6,6);rc(LM_OUT,17,41,4,1);G('#b8a050',[[5,34],[28,14],[51,34]]);for(let i=0;i<5;i++)L('#8a7a38',12+i*8,32,24+(i-2)*3,19,1);
   [8,48].forEach((x,i)=>{rc('#7a7a8a',x,56,1,5);E('#5affd0',x,64+(f&&i?1:0),3,3,0);});L('#8a6a3a',44,56,44,86,1);dots('#3a8a3a',[[4,84,1,6],[8,82,1,8],[50,84,1,6],[53,82,1,8]]);}},
 {town:'Slagburgh',id:'smithstatue',n:'the Smith of Slagburgh',fr:2,lt:[40,12,16,'fire'],col:'#4a8a78',
  line:'The Smith of Slagburgh looms over the square in green weathered copper, a hammer raised over an anvil, and the sparks on its head are real.',
  draw(P,f){const {E,G,B,rc,S,L,A,dots}=P;S(21);B('#5a5662',8,76,40,14);rc('#7a7684',10,80,36,2);B('#4a8a78',17,56,9,22);B('#4a8a78',30,56,9,22);B('#4a4a56',4,54,18,5);rc('#6a6a76',4,54,18,1);
   B('#5a9a86',15,32,26,26);rc('#2a5a4c',20,48,16,10);E('#5a9a86',28,26,6,6);rc('#2a1a10',25,25,6,2);B('#4a8a78',40,30,6,10);B('#4a8a78',43,16,6,16);B('#6a6a76',36,6,18,9);rc('#9a9aa6',36,6,18,1);
   B('#4a8a78',8,36,7,12);rc('#9acab8',16,34,2,22);A(.9,()=>dots(f?'#ffb04a':'#ff7a2a',[[38,4,1,1],[52,8,1,1],[44,3,2,1],[36+f*2,11,1,1]]));}},
 {town:'Lumenmoss',id:'glowcap',n:'the Great Glowcap',fr:2,lt:[28,40,28,'cyan'],col:'#2ac8b8',
  line:'A glowcap the height of a house grows in the middle of Lumenmoss, its cap lit teal from below and spotted with pink; the town needs no lamps.',
  draw(P,f){const {E,G,B,rc,S,A,ell,dots}=P;S(20);A(.22+.12*f,()=>ell('#5affd8',28,48,26,24));
   G('#e8d4e8',[[21,90],[23,60],[33,60],[35,90],[28,86]]);rc('#fff0fc',24,62,2,26);E('#18807a',28,58,20,6,0);E('#2ac8b8',28,44,25,16);E('#58e8d8',20,34,10,6);
   dots('#ff8ac8',[]);E('#ff8ac8',16,44,4,3,0);E('#ff8ac8',36,38,3,2,0);E('#ff8ac8',44,48,3,2,0);E('#ffc8e8',28,30,3,2,0);
   E('#2ac8b8',8,82,7,5);E('#e8d4e8',8,88,2,3,0);E('#2ac8b8',48,84,6,4);rc('#e8d4e8',47,87,2,3);dots('#d8fff8',[[12+f*2,34,1,1],[40-f*2,30,1,1],[24,24+f,1,1]]);}},
 {town:'Whitehearth',id:'frostbeacon',n:'the Frost Beacon',fr:2,lt:[28,18,26,'cyan'],col:'#4a6a98',
  line:'On an ice pillar at the gate of Whitehearth burns the Frost Beacon, a blue flame the cold cannot put out and the watch cannot stop looking at.',
  draw(P,f){const {E,G,B,rc,S,A,ell,dots}=P;S(21);E('#f4faff',LMC,LMY-1,22,5);G('#4a6a98',[[14,90],[19,40],[37,40],[42,90]]);G('#7a9ac8',[[19,40],[28,40],[26,90],[14,90]]);rc('#b8d0f0',22,44,2,30);
   G('#3a5a88',[[8,90],[11,76],[15,90]]);G('#3a5a88',[[41,90],[45,70],[49,90]]);B('#3a4a68',16,34,24,7);rc('#5a6a88',16,34,24,1);
   A(.3,()=>ell('#7ad8ff',28,22,13,16));G('#4ab8f0',[[20,34],[28-f,6],[36,34]]);G('#a8e8ff',[[23,34],[28+f,12],[33,34]]);G('#ffffff',[[26,34],[28,20],[30,34]]);dots('#e8f8ff',[[18,12+f*3,1,1],[38,8,1,1],[30,3+f,1,1]]);}},
 {town:'Hearthholm',id:'icespires',n:'the Hearthholm Spires',fr:2,lt:[28,76,22,'fire'],col:'#dbd1fa',
  line:'Spires of violet ice crowd round the great hearth of Hearthholm, and the fire in their midst makes them glow like a lit window.',
  draw(P,f){const {E,G,B,rc,S,A,ell}=P;S(22);const sp=[[[2,90],[9,38],[17,90],'#9a8ad8'],[[14,90],[24,8],[36,90],'#c8b8f8'],[[30,90],[39,30],[48,90],'#a898e8'],[[8,90],[16,56],[24,90],'#e0d4fc'],[[26,90],[34,52],[42,90],'#b8a8f0']];
   sp.forEach(([a,b,c,col])=>{G(col,[a,b,c]);G(tint(col,.35),[a,b,[b[0],90]]);G(shade(col,.7),[b,c,[b[0],90]]);});
   A(.3+.12*f,()=>ell('#ffa040',28,80,16,10));B('#5a5a66',19,81,18,9);rc('#8a8a98',19,81,18,1);rc('#e8561e',22,76,12,6);rc(f?'#ffd04a':'#ffb030',24,72+f,8,8);rc('#fff0a8',26,76,4,5);}},
 {town:'Windle',id:'belltower',n:'the Windle Bell Tower',fr:2,lt:null,col:'#c8902a',
  line:'The white bell tower of Windle rises over the cliff road, a bronze bell in its open belfry, and when the wind is right you can hear it from the pass.',
  draw(P,f){const {E,G,B,rc,S,dots}=P;S(18);B('#e8e4dc',17,42,22,48);rc('#fffaf0',17,42,3,48);rc('#b4b0a8',36,43,3,47);dots('#6a6a76',[[23,52,2,8],[32,52,2,8],[23,68,2,8],[32,68,2,8]]);
   B('#e8e4dc',17,22,5,20);B('#e8e4dc',34,22,5,20);rc('#1a1420',22,24,12,18);G('#c8902a',[[22+f,26],[34+f,26],[37+f,38],[19+f,38]]);rc('#7a5410',27+f,38,2,4);rc('#f0c860',24+f,28,2,8);
   G('#3a5a6a',[[13,22],[28,5],[43,22]]);rc('#5a7a8a',28,5,1,17);rc('#d8c890',27,2,2,4);E('#fff0d0',28,56,5,5,0);rc('#3a2a20',28,53,1,3);rc('#3a2a20',28,56,3,1);B('#5a4a42',24,78,8,12);rc('#14101a',25,80,6,10);}},
 {town:'Dunemark',id:'marketdome',n:'the Dunemark Market Dome',fr:2,lt:null,col:'#e87a2a',
  line:'A striped dome crowns the market of Dunemark, orange and cream like a sunset, with pennants strung from its finial to every stall in the square.',
  draw(P,f){const {E,G,B,rc,S,ell,L,dots}=P;S(24);ell(LM_OUT,28,52,25,26);for(let j=-25;j<=0;j++){const w=24*Math.sqrt(Math.max(0,1-(j*j)/625));for(let x=Math.round(28-w);x<Math.round(28+w);x++){const s=Math.floor((x-4)/6)%2;rc(s?'#f6e8c8':(j<-16?'#f09a4a':'#e87a2a'),x,52+j,1,1);}}
   rc('#5a3a1a',27,12,2,14);G('#d03a3a',[[29,12],[42,15+f],[29,19]]);B('#e8c890',5,52,46,38);rc('#fff0d0',5,52,46,2);rc('#b89868',48,54,3,36);
   [10,24,38].forEach(x=>{rc('#14101a',x,66,10,24);ell('#14101a',x+5,66,5,5);});rc('#d8b078',6,86,44,4);
   L('#5a3a1a',29,16,6,56);L('#5a3a1a',29,16,50,56);[[14,40,'#d03a3a'],[22,30,'#3a6ad0'],[40,32,'#e8b840'],[46,44,'#3aa860']].forEach(([x,y,c])=>G(c,[[x,y],[x+4,y],[x+2,y+5]]));}},
 {town:'Lanternford',id:'bridgearch',n:'the Lanternford Arch',fr:2,lt:[8,56,18,'lamp'],col:'#a89878',
  line:'An arched stone bridge crosses the ford at Lanternford, a lantern on a post at each end, and the pool under it holds the reflection of the whole town.',
  draw(P,f){const {E,G,B,rc,S,ell,L,A,dots}=P;S(22);ell('#2a5a98',28,84,26,8);ell('#3a78b8',28,83,24,6);ell('#7ab0e0',22,81,8,2);ell('#7ab0e0',36+f*2,85,6,2);
   G('#a89878',[[2,72],[12,56],[44,56],[54,72],[54,80],[2,80]]);G('#cdbd9a',[[4,72],[13,58],[43,58],[52,72]]);ell(LM_OUT,28,80,13,13);for(let j=-12;j<=0;j++){const w=12*Math.sqrt(1-(j*j)/144);rc('#1f3f66',28-w,80+j,w*2,1);}
   for(let x=10;x<46;x+=6)rc('#8a7a5a',x,58,1,5);rc('#e0d4b4',12,56,32,1);rc('#4a4a5a',6,38,3,24);rc('#4a4a5a',47,38,3,24);E('#ffd88a',7,36,4,4,0);E('#ffd88a',48,36,4,4,0);rc('#fff4c0',6,35,2,2);
   dots('#3a8a3a',[[2,84,1,6],[4,82,1,8],[52,84,1,6],[54,82,1,8]]);}},
 {town:'Bellows Hold',id:'headframe',n:'the Bellows Hold Headframe',fr:2,lt:[28,76,20,'fire'],col:'#7a4a2a',
  line:'The winding headframe of the old Ironroot shaft towers over Bellows Hold, an iron wheel spinning at its crown, and the hold still trades on what it hauls up.',
  draw(P,f){const {E,G,B,rc,S,L,ell,dots}=P;S(22);G('#7a4a2a',[[5,90],[12,90],[30,14],[24,14]]);G('#7a4a2a',[[44,90],[51,90],[32,14],[26,14]]);
   L('#5a3a22',12,70,44,70,2);L('#5a3a22',9,50,47,50,2);L('#5a3a22',12,70,30,50,1);L('#5a3a22',44,70,26,50,1);
   ell(LM_OUT,28,14,11,11);ell('#8a8a96',28,14,10,10);ell('#3a3a46',28,14,7,7);ell('#8a8a96',28,14,2,2);for(let k=0;k<4;k++){const a=k*Math.PI/4+f*Math.PI/8;L('#c0c0cc',28-Math.cos(a)*7,14-Math.sin(a)*7,28+Math.cos(a)*7,14+Math.sin(a)*7,1);}
   B('#5a4a3a',14,66,28,24);rc('#0e0a10',22,72,12,18);rc('#ffb04a',26,60,4,4);L('#2a2a34',24,28,24,66);L('#2a2a34',32,28,32,66);dots('#6a6a76',[[10,88,36,1],[10,90,36,1]]);}},
 {town:'Last Ember',id:'monolith',n:'the Last Ember Monolith',fr:2,lt:[28,40,22,'fire'],col:'#1a1620',
  line:'A black monolith stands at the centre of Last Ember with a crack of living red down its face, and the town has been built a respectful distance away.',
  draw(P,f){const {E,G,B,rc,S,A,L,dots}=P;S(19);E('#2a2630',12,88,9,4);E('#2a2630',44,89,8,3);G('#1a1620',[[12,90],[14,22],[22,6],[34,14],[40,26],[38,90]]);G('#34303e',[[14,22],[22,6],[26,18],[24,90],[12,90]]);
   const cr=f?'#ff5a3a':'#e03a2a';L(cr,26,12,24,28,1);L(cr,24,28,30,44,1);L(cr,30,44,25,62,1);L(cr,25,62,28,80,1);L('#ffb04a',24,28,26,34,1);
   dots('#ff7a4a',[[18,40,2,1],[18,48,3,1],[32,34,1,3],[32,52,3,1],[19,64,2,1],[33,70,1,3]]);A(.8,()=>dots('#ff9a4a',[[22+f*3,8,1,1],[33,4+f*2,1,1],[18,14,1,1],[36+f,2,1,1]]));}},
 {town:'Tidegrave',id:'shrinegate',n:'the Tidegrave Shrine Gate',fr:2,lt:null,col:'#1f7a78',
  line:'A shrine gate of weathered teal timber stands knee deep in the shallows at Tidegrave, crusted with barnacles; the drowned are said to come in through it.',
  draw(P,f){const {E,G,B,rc,S,ell,A,dots}=P;S(21);A(.5,()=>{ell('#3a8ab0',28,88,22,4);});
   B('#1f7a78',10,32,7,58);B('#1f7a78',39,32,7,58);rc('#3aa8a0',10,32,2,58);rc('#0f4a48',44,33,2,57);
   G('#14504e',[[1,24],[6,17],[50,17],[55,24],[55,28],[1,28]]);rc('#e8c050',1,24,4,4);rc('#e8c050',51,24,4,4);rc('#2a8a88',6,17,44,1);B('#1f7a78',6,28,44,4);B('#1f7a78',10,44,36,4);B('#e8c050',23,34,10,9);rc('#a07818',27,36,2,5);
   dots('#e8e8d8',[[12,60,1,1],[14,74,1,1],[42,66,1,1],[40,80,1,1],[13,52,1,1]]);dots('#3a8a5a',[[11,80,1,8],[13,82,1,6],[44,80,1,8],[42,82,1,6]]);A(.6,()=>{rc('#a8e8e0',14+f*18,86,8,1);rc('#a8e8e0',36-f*14,89,8,1);});}},
 {town:"Wick's End",id:'observatory',n:"the Wick's End Observatory",fr:2,lt:null,col:'#3a3a78',
  line:"The Observatory of Wick's End is a dome of silver over an indigo drum, its slit open and its long brass glass pointed at a sky that has no stars left in it.",
  draw(P,f){const {E,G,B,rc,S,ell,L,dots}=P;S(21);B('#3a3a78',8,52,40,38);rc('#5a5aa0',8,52,3,38);B('#8a8aa8',5,50,46,5);
   ell(LM_OUT,28,50,22,22);for(let j=-21;j<=0;j++){const w=21*Math.sqrt(Math.max(0,1-(j*j)/441));rc(j<-14?'#e0e6f8':'#c8d0e8',28-w,50+j,w*2,1);rc('#8a92b0',28+w-3,50+j,3,1);}
   rc('#0a0a24',24,28,8,24);G('#9a9ab8',[[30,40],[50,22],[53,27],[33,46]]);rc('#e8f0ff',50,22,3,5);B('#14101a',24,72,10,18);
   dots('#fff6a0',[[14,60],[40,64],[16,78],[44,80],[24+f*8,58]]);dots('#fff6a0',[[12,18,1,1],[8+f,10,1,1],[46,10,1,1],[50-f,18,1,1]]);L('#5a5aa0',8,86,48,86,1);}},
 {town:'Aerie Ruin',id:'shards',n:'the Aerie Shards',fr:4,lt:[28,30,22,'cyan'],col:'#f3efff',
  line:'Over the ruined aerie of Aerie Ruin drift three great shards of the shattered sky, turning slowly above the broken pillars they once rested on.',
  draw(P,f){const {E,G,B,rc,S,A,ell,L}=P;S(21);G('#bcb8d0',[[6,90],[6,76],[10,70],[14,74],[16,90]]);G('#a8a4c0',[[36,90],[36,62],[40,56],[44,62],[46,66],[48,90]]);G('#9894b0',[[20,90],[20,82],[26,78],[32,90]]);
   const bob=[0,2,3,1][f]||0,sh=[[28,14+bob,10,16,'#e8e0ff'],[10,38-bob,7,12,'#c8b8ff'],[44,36+bob,7,11,'#d8d0ff']];
   sh.forEach(([cx,cy,w,h,c])=>{A(.26,()=>ell('#c8b8ff',cx,cy,w+6,h+5));G(c,[[cx,cy-h],[cx+w,cy],[cx,cy+h],[cx-w,cy]]);G(tint(c,.5),[[cx,cy-h],[cx,cy+h],[cx-w,cy]]);G(shade(c,.75),[[cx,cy-h],[cx+w,cy],[cx,cy+h]]);});
   A(.35,()=>{L('#e8e0ff',28,32+bob,24,68,1);L('#e8e0ff',10,48-bob,12,68,1);L('#e8e0ff',44,46+bob,40,58,1);});}},
 {town:'Glarepan',id:'hourglass',n:'the Glarepan Hourglass',fr:2,lt:null,col:'#f0c048',
  line:'A glass hourglass as tall as a house stands in the square at Glarepan, its sand a pale gold that falls in a thin line and has not run out since the salt flat dried.',
  draw(P,f){const {E,G,B,rc,S,A,L,dots}=P;S(21);B('#6a4420',9,10,3,76);B('#6a4420',44,10,3,76);B('#8a5a2a',6,5,44,6);B('#8a5a2a',6,84,44,7);rc('#c8902a',6,5,44,1);
   G('#9ac8e0',[[12,12],[44,12],[30,46],[26,46]]);G('#9ac8e0',[[26,46],[30,46],[44,83],[12,83]]);G('#d8f0fa',[[14,13],[24,13],[26,44]]);G('#d8f0fa',[[26,48],[16,82],[22,82]]);
   G('#f0c048',[[16,22],[40,22],[30,44],[26,44]]);G('#f0c048',[[14,83],[42,83],[34,66],[28,56],[22,66]]);rc('#fff0a8',27,44,2,24);dots('#c87810',[[27,46+f*10,1,2],[28,56+f*8,1,1]]);rc('#fff0c0',19,23,3,1);}},
 // realms14: the three towns of the new Scourge realms
 {town:'Rookhallow',id:'roost',n:'the Rookhallow Roost',fr:2,lt:null,col:'#6a4a78',
  line:'A split dead oak stands at the end of the Rookhallow lane, black with crows from root to crown. Every one of them is looking down the lane toward you.',
  draw(P,f){const {E,G,B,rc,S,L,dots}=P;S(20);E('#6a4a78',16,89,9,3,0);E('#6a4a78',42,90,8,3,0);B('#3a2a34',23,34,10,56);rc('#5a4450',23,34,2,56);rc('#1a1220',29,38,1,50);
   L('#3a2a34',26,56,10,38,3);L('#3a2a34',30,48,46,26,3);L('#3a2a34',26,42,18,20,2);L('#3a2a34',31,62,46,50,2);L('#3a2a34',27,34,32,16,2);
   [[8,36,0],[44,24,1],[17,19,1],[45,48,0],[13,38,1],[31,13,0]].forEach(([x,y,o])=>{const dy=o?f:0;E('#14101c',x,y+dy,3,2);rc('#14101c',x+2,y-2+dy,2,2);rc('#e0b050',x+4,y-1+dy,1,1);rc('#14101c',x-4,y+dy,2,1);});
   dots('#14101c',[[50,10,1,1],[6,14,1,1],[52,36,1,1]]);}},
 {town:'Canewick',id:'canegate',n:'the Canewick Cane Gate',fr:2,lt:[28,36,18,'lamp'],col:'#9ac060',
  line:'Two stands of bamboo as thick as a man lean together over the Canewick road and meet in an arch, a paper lantern hanging from the join. The stalks click softly in no wind at all.',
  draw(P,f){const {E,G,B,rc,S,A,L,dots}=P;S(20);[[8,6],[14,12],[38,12],[44,6]].forEach(([x,t],i)=>{B('#9ac060',x,t,5,90-t);for(let y=t+9;y<88;y+=14)rc('#4a7a2a',x,y,5,1);rc('#b8d880',x,t,1,90-t);});
   L('#9ac060',13,10,28,2,3);L('#9ac060',43,10,28,2,3);G('#5a9a3a',[[4,16],[0,22],[10,20]]);G('#5a9a3a',[[48,18],[54,24],[44,22]]);
   rc('#6a4a2a',27,5,2,10);B('#d0383a',22,15,12,16);rc('#f0b050',23,17,10,12);rc(f?'#fff0a0':'#ffd870',25,19,6,8);rc('#6a4a2a',22,15,12,1);rc('#6a4a2a',22,31,12,1);rc('#c8a060',27,32,2,6);
   A(.3,()=>{E('#ffd870',28,23,14,12);});dots('#e8f4d8',[[12,60,1,1],[44,64,1,1],[9,40+f,1,1]]);}},
 {town:'Pale Harrow',id:'ribarch',n:'the Harrow Ribs',fr:2,lt:null,col:'#b8b4a8',
  line:'The ribs of something very large arch over the main street of Pale Harrow, bleached as flour and tall enough for a cart of hay. Nobody remembers who put them up, and nobody has dared take them down.',
  draw(P,f){const {E,G,B,rc,S,L,dots}=P;S(21);[[6,0],[20,3],[34,6],[46,9]].forEach(([x,d])=>{L('#b8b4a8',x+6,90,x+2+d*.3,48+d,4);L('#b8b4a8',x+2+d*.3,48+d,x+14,22+d,4);L('#b8b4a8',x+14,22+d,x+30,14+d,4);L('#f8f0dc',x+6,90,x+2+d*.3,48+d,1);L('#a8a088',x+16,24+d,x+30,16+d,1);});
   B('#b8b4a8',44,70,10,16);E('#e8e0cc',48,62,7,6,0);rc('#2a241c',45,60,3,3);rc('#2a241c',50,60,3,3);rc('#2a241c',47,65,4,1);rc('#e8e0cc',45,66,8,3);
   dots('#a8a088',[[10,86,2,1],[24,88,3,1],[38,87,2,1]]);dots('#f8f0dc',[[20+f*2,40,1,1],[40-f*2,34,1,1]]);}}
];
const LM_BY_TOWN={};LM12.forEach(l=>{LM_BY_TOWN[l.town]=l;});
const LMC_CACHE={};
// the card of a landmark at animation frame f (cached)
function lmCard(id,f){const L=LM12.find(l=>l.id===id);if(!L)return null;f=((f%L.fr)+L.fr)%L.fr;const key=id+':'+f;let c=LMC_CACHE[key];if(c)return c;
  c=LMC_CACHE[key]=mkCv(LMW,LMH);const x=c.getContext('2d');x.imageSmoothingEnabled=false;try{L.draw(lmKit(x),f);}catch(e){try{wdLog('landmark '+id+': '+e.message);}catch(_){}}return c;}
function lmFrame(L,now){try{if(L.fr<2||(typeof gfxStill==='function'&&gfxStill()))return 0;}catch(e){return 0;}return Math.floor(now/(L.id==='windmill'?320:L.id==='shards'?420:520))%L.fr;}
// ----- placement: a 2 x 2 footprint ('j' tiles) on open ground where the way in sees it -----
const LM_OPEN='.:,f',LM_WALL='HAZ#YT';
function lmEntries(m){const g=m.gates||{},o=[],add=(a,d)=>{if(a&&a.length>=2)o.push({x:a[0],y:a[1],d:d||null});};
  if(g.prev&&g.prev.arrive)add(g.prev.arrive,g.prev.arrive[2]);else if(g.prev0)add([g.prev0.x+1,g.prev0.y],'r');
  if(g.start&&g.start.arrive)add(g.start.arrive,g.start.arrive[2]);if(g.next&&g.next.arrive)add(g.next.arrive,g.next.arrive[2]);if(m.start)add(m.start);
  if(!o.length){try{add(mapEntry(m));}catch(e){}}return o;}
function lmReach(m){try{const s=mapEntry(m);if(!s)return -1;const R=healReach(m,s,true,true);let n=0;R.forEach(r=>r.forEach(v=>{if(v)n++;}));return n;}catch(e){return -1;}}
function lmSpots(m,L,loose){const g=m.t,H=g.length,W=g[0].length,ent=lmEntries(m),ep=ent[0],dir=ep&&ep.d&&DIRV[ep.d]?DIRV[ep.d]:[1,0],out=[];
  const solidAt2=(x,y)=>x<0||y<0||x>=W||y>=H||SOLID.includes(g[y][x]);
  const keep=[];(m.exits||[]).forEach(e=>keep.push([e.x,e.y,loose?1:2]));Object.values(m.gates||{}).forEach(q=>{if(q&&q.arrive)keep.push([q.arrive[0],q.arrive[1],loose?1:2]);});
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=g[y][x];if(c==='W'||c==='q'||c==='O'||c==='S')keep.push([x,y,loose?1:2]);}
  Object.keys(m.signs||{}).forEach(k=>{const p=k.split(',').map(Number);keep.push([p[0],p[1],1]);});(m.npcs||[]).forEach(n=>keep.push([n.x,n.y,loose?0:1]));
  (m.bld||[]).forEach(b=>{if(b.door){for(let j=0;j<=3;j++)for(let i=-1;i<=1;i++)keep.push([b.door[0]+i,b.door[1]+j,0]);}});
  const lane=m.lane instanceof Set?m.lane:null;
  for(let fy=2;fy<H-4;fy++)for(let fx=2;fx<W-3;fx++){
    let ok=true;for(let j=0;j<2&&ok;j++)for(let i=0;i<2;i++){if(!LM_OPEN.includes(g[fy+j][fx+i])||(lane&&lane.has((fx+i)+','+(fy+j)))){ok=false;break;}}if(!ok)continue;
    if(keep.some(([kx,ky,r])=>kx>=fx-r&&kx<=fx+1+r&&ky>=fy-r&&ky<=fy+1+r))continue;
    let blocked=0,ring=0;for(let j=-1;j<=2;j++)for(let i=-1;i<=2;i++){if(j>=0&&j<=1&&i>=0&&i<=1)continue;ring++;if(solidAt2(fx+i,fy+j))blocked++;}
    let tight=false;for(let i=-1;i<=2;i++)if(solidAt2(fx+i,fy+2))tight=true;for(let j=-1;j<=2;j++)if(solidAt2(fx-1,fy+j)&&solidAt2(fx+2,fy+j))tight=true;if(tight&&!loose)ok=false;if(!ok||blocked>(loose?9:3))continue;
    const cx=fx+1,cy=fy+1;let score=-blocked*.5-(tight?3:0);
    ent.forEach((e,k)=>{const d=Math.hypot(cx-e.x,cy-e.y)||1;let seen=true;for(let t=1;t<d*2;t++){const sx=Math.round(e.x+(cx-e.x)*t/(d*2)),sy=Math.round(e.y+(cy-e.y)*t/(d*2));const c=(g[sy]||[])[sx];if(c&&LM_WALL.includes(c)&&!(sx>=fx&&sx<=fx+1&&sy>=fy&&sy<=fy+1)){seen=false;break;}}
      if(k===0){score+=(seen?10:-30)-Math.abs(d-7)*.6-(d<4?10:0);if(d>0)score+=4*(((cx-e.x)*dir[0]+(cy-e.y)*dir[1])/d);
        // the card (3.5 tiles wide, 5.75 tall) inside the 26 x 10 tile window the camera shows from the entry at 1000 x 560
        const cl=Math.max(0,Math.min(W-26,e.x+.5-13)),ct=Math.max(0,Math.min(H-10,e.y+.5-5)),ov=Math.max(0,cl-(cx-1.75))+Math.max(0,(cx+1.75)-(cl+26))+Math.max(0,ct-(fy+2-5.6))+Math.max(0,(fy+2)-(ct+10));
        const mini=Math.max(0,Math.min(3.4,(cx+1.75)-(cl+22.6)))*Math.max(0,Math.min(2.8,(ct+2.8)-(fy+2-5.6)));// the minimap covers the top right corner of the window
        score+=(ov?-ov*7:24)-mini*1.2-Math.max(0,cx-(cl+19))*.9;}else score+=seen?2:0;});
    if(g[fy][fx]===':')score-=1.5;out.push({fx,fy,score});}
  return out.sort((a,b)=>b.score-a.score);}
const LM_TOWNS=false;
// place the landmark of a fresh town; the footprint must lose nothing but its own four tiles from the reach (no pocket, no blocked door or gate)
function lmPlace(m){if(!m||m.kind!=='town'||m.archive||m.lm!==undefined||typeof m.s!=='number')return;m.lm=null;
  if(!LM_TOWNS)return;/* 0.21.7: the owner asked for towns without landmarks (the Breach islands keep theirs) */
  let Z;try{Z=ZS(m.s);}catch(e){return;}const L=Z&&LM_BY_TOWN[Z.town];if(!L||!m.t)return;
  const pa=()=>{try{return typeof pathAssets==='function'?pathAssets(m).length:0;}catch(e){return 0;}},pa0=pa(),before=lmReach(m),iss0=(()=>{try{return mapIssues(m).length;}catch(e){return 0;}})(),spots=lmSpots(m,L,1).slice(0,80);
  for(const sp of spots){const sv=[];for(let j=0;j<2;j++)for(let i=0;i<2;i++){sv.push(m.t[sp.fy+j][sp.fx+i]);m.t[sp.fy+j][sp.fx+i]='j';}
    const after=lmReach(m),iss=(()=>{try{return mapIssues(m).length;}catch(e){return 0;}})();
    if(before<0||(after>=before-4&&iss<=iss0&&pa()<=pa0)){m.lm={id:L.id,town:L.town,x:sp.fx,y:sp.fy,w:2,h:2};m.tl=null;return;}
    for(let j=0;j<2;j++)for(let i=0;i<2;i++)m.t[sp.fy+j][sp.fx+i]=sv[j*2+i];}
}
queueMicrotask(()=>{try{HOOK.wrap('getMap','world12','a landmark for every new town (after the exit pass)',function(next,...a){const id=a[0],fresh=typeof id==='string'&&id[0]==='t'&&!MAPS[id];const m=next(...a);
  try{if(fresh&&m&&m.kind==='town'&&!(G&&G.daily)){lmPlace(m);}}catch(e){try{wdLog('landmark '+id+': '+e.message);}catch(_){}}return m;});}catch(e){}});
// ----- drawing: 2D (a depth sorted actor), HD-2D (a standing card), night light, reading it, the audits -----
const lmBox=m=>{const L=m&&m.lm&&LM12.find(q=>q.id===m.lm.id);return L?{L,x:(m.lm.x+1)*TS,y:(m.lm.y+2)*TS}:null;};// x centre, y bottom of the footprint (px)
HOOK.after('townDecorActors','world12','the town landmark in the 2D depth sort',function(r,actors,now,cx,cy){try{const m=WS.m,ctx=WS.ctx,o=lmBox(m);if(!o||!ctx||m.kind!=='town')return;
  const px=o.x-LMC-cx,py=o.y-2-LMY-cy;if(px<-LMW||py<-LMH||px>WS.vw+LMW||py>WS.vh+LMH)return;
  actors.push({y:o.y-1,deco:'landmark',draw:()=>{const c=lmCard(o.L.id,lmFrame(o.L,now));if(c)ctx.drawImage(c,Math.round(px),Math.round(py));}});}catch(e){}});
HOOK.after('hdActors','world12','the town landmark in HD-2D',function(r,m,now,ts){try{const o=lmBox(m);if(!o||m.kind!=='town')return r;const V=HD.S.V,B=HD.dyn,BB=HD.dynB,f=lmFrame(o.L,ts),c=lmCard(o.L.id,f);if(!c)return r;
  hdDecal(BB,'blob2',hdBlob2(),o.x,o.y-2,46,13,8,5,20,150);hdBill(B,'lm12:'+o.L.id+':'+f,c,o.x,-1*V,o.y+2,false,1,255,255,255,255,2);}catch(e){HD.lmErr=String(e&&e.message||e);}return r;});
HOOK.after('scanLights','world12','night light of a landmark',function(r,m){try{const o=lmBox(m);if(o&&o.L.lt&&m.tl)m.tl.push([o.x-LMC+o.L.lt[0],o.y-2-LMY+o.L.lt[1],o.L.lt[2],o.L.lt[3]]);}catch(e){}});
const lmCap=s=>s.charAt(0).toUpperCase()+s.slice(1);
HOOK.before('interact','world12','facing a landmark reads its line',function(){try{if(V.screen!=='world'||V.modal||WS.lock||WS.dlg||WS.mv)return;const m=WS.m,[fx,fy]=facing();
  if(m&&m.lm&&tileAt(m,fx,fy)==='j'){const L=LM12.find(q=>q.id===m.lm.id);if(L)return HOOK.stop(say(lmCap(L.n),L.line));}}catch(e){}});
HOOK.xform('drawAudit','world12','landmark footprints draw; nodes are checked',function(out,m){try{if(!out)return out;out.hidden=out.hidden.filter(h=>!(h.c==='j'&&m.lm));out.nodes=nodeIssues(m);}catch(e){}return out;});
// the name in the town's description lines: the realm's intro and the Waystone list
if(LM_TOWNS)ZONES.forEach(z=>{const L=LM_BY_TOWN[z.town];if(L&&z.intro&&!z.lmNote){z.lmNote=1;z.intro+=` You will know ${z.town} by ${L.n}, in plain sight from the gate.`;}});
HOOK.xform('vModal','world12','the landmark on each Waystone row',function(h,m){try{if(LM_TOWNS&&m&&m.type==='travel'&&typeof h==='string'&&G&&G.visited)G.visited.forEach(s=>{const Z=ZS(s),L=Z&&LM_BY_TOWN[Z.town];if(!L)return;
  const a=`<b>${esc(Z.town)}</b><small>`,i=h.indexOf(a);if(i<0)return;const j=h.indexOf('</small>',i);if(j>0)h=h.slice(0,j)+' · '+esc(lmCap(L.n))+h.slice(j);});}catch(e){}return h;});
// ---------- 4. gathering nodes: never on a chest or a prop, always reachable (mapheal's strict reach) ----------
// placeNodes picked tiles from the field's free list or a flood of the dungeon before the chests and props went down, so a herb could land on a
// chest tile or in a pocket. nodeIssues(m) lists them ({x,y,k,why}: 'chest', 'solid', 'unreachable'); nodeFix(m) moves each to the nearest open reachable tile
// (4 or more steps from the other nodes, off exits, gates, chests and signs) or drops it. Runs after placeNodes and again once the map is healed.
function nodeReach(m){try{const s=mapEntry(m);return s?healReach(m,s,true,true):null;}catch(e){return null;}}
function nodeBad(m,n,R){const c=(m.t[n.y]||[])[n.x];if(c==null)return 'solid';if((m.chests||[]).some(q=>q[0]===n.x&&q[1]===n.y)||c==='C'||c==='c'||c==='K')return 'chest';
  if(SOLID.includes(c)&&c!=='c')return 'solid';if(R&&!(R[n.y]&&R[n.y][n.x]))return 'unreachable';return '';}
function nodeIssues(m){const out=[];if(!m||!m.t||!m.nodes||!m.nodes.length||m.archive||m.sanctum)return out;const R=nodeReach(m);m.nodes.forEach(n=>{const why=nodeBad(m,n,R);if(why)out.push({x:n.x,y:n.y,k:n.k,why});});return out;}
function nodeFix(m){if(!m||!m.t||!m.nodes||!m.nodes.length||m.archive||m.sanctum)return [];const R=nodeReach(m);if(!R)return [];const log=[],W=m.t[0].length,H=m.t.length,okc=m.kind==='dungeon'?'.':'.,';
  const keep=[];(m.exits||[]).forEach(e=>keep.push([e.x,e.y]));Object.values(m.gates||{}).forEach(q=>{if(q&&q.arrive)keep.push(q.arrive);});Object.keys(m.signs||{}).forEach(k=>keep.push(k.split(',').map(Number)));
  const free=(x,y,self)=>{if(x<2||y<2||x>=W-2||y>=H-2)return false;const c=m.t[y][x];if(!okc.includes(c)||!R[y][x])return false;if(keep.some(p=>p[0]===x&&p[1]===y))return false;
    if((m.chests||[]).some(q=>q[0]===x&&q[1]===y))return false;return !m.nodes.some(o=>o!==self&&Math.abs(o.x-x)+Math.abs(o.y-y)<4);};
  const bad=m.nodes.filter(n=>nodeBad(m,n,R));if(!bad.length)return log;
  bad.forEach(n=>{let to=null;for(let r=1;r<=14&&!to;r++)for(let dy=-r;dy<=r&&!to;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(free(n.x+dx,n.y+dy,n)){to=[n.x+dx,n.y+dy];break;}}
    log.push({x:n.x,y:n.y,why:nodeBad(m,n,R),to});if(to){n.x=to[0];n.y=to[1];}else n.drop=1;});
  m.nodes=m.nodes.filter(n=>!n.drop);return log;}
HOOK.after('placeNodes','world12','a node never lands on a chest, a prop or an unreachable tile',function(r,m){try{m.nodeFixed=nodeFix(m);}catch(e){}});
HOOK.wrap('getMap','world12','nodes checked again once the map is healed',function(next,...a){const had=!!MAPS[a[0]];const m=next(...a);try{if(!had&&m&&m.nodes&&m.nodes.length){const l=nodeFix(m);if(l.length)m.nodeFixed=(m.nodeFixed||[]).concat(l);}}catch(e){}return m;});
// ---------- 6. the Breach is not a "relit" field ----------
HOOK.after('showLocation','world12','no (relit) on the Meridian Breach',function(){try{const m=WS.m;if(m&&m.breach&&WS.locN){WS.locN=WS.locN.replace(' (relit)','');if(typeof vHeader==='function'&&document.getElementById('hdr'))document.getElementById('hdr').innerHTML=vHeader();}}catch(e){}});
// ---------- 9. each realm's own Scourge ----------
// REALMS carry boss (the realm's own Scourge, a Calamity in the Calamity realms) and, until realms14, alt (the ones that stood in on a New Game+; the realms have none now, the variety comes from the realm draw in party12.js; the first element of
// each is one of the realm's elements). A first journey (cycle 0) always meets the realm's own; from the second a New Game+ draws between them, unseen first.
// Old journeys keep the bosses they were drawn with; G.run.rb marks the new rule. No boss repeats within a journey.
function realmBossFor(realmIdx,cycle,R,used){const Rm=REALMS[realmIdx-REALM_BASE];if(!Rm||!Rm.boss)return null;let c=[Rm.boss].concat(Rm.alt||[]).filter(k=>guardianDef(k)&&!used.includes(k));if(!c.length)c=[Rm.boss];
  if(!cycle||c.length<2)return c[0];const w=c.map(bossWeight),tot=w.reduce((a,b)=>a+b,0);let r=R()*tot,i=0;for(;i<c.length-1;i++){if((r-=w[i])<0)break;}return c[i];}
HOOK.xform('newRun','world12','each realm brings its own Scourge (a Calamity in its Calamity realm)',function(r,cycle){try{if(!r||r.rv!==2||!r.order)return r;const R=seeded((r.seed^0x9b055)>>>0),used=[],bs=[];
  for(let i=0;i<4;i++){const k=realmBossFor(r.order[i],r.cycle||cycle||0,R,used);if(!k)return r;used.push(k);bs.push(k);}
  const f=realmBossFor(r.order[4],r.cycle||cycle||0,R,used);if(!f)return r;r.bosses=bs;r.final=f;r.rb=1;}catch(e){}return r;});
// ---------- 8. wild recruit events: spaced, budgeted per realm, dual types later ----------
// A wild recruit event is a chance meeting that starts (help, duel, trader), a Den or cave prize that is a wayfarer and a keep's cells. Each needs WREC.minSteps steps
// and WREC.minBattles battles since the last one, at most WREC.perRealm per realm and WREC.total per journey; the cave and keep prizes fall back to a charm when blocked
// (as they already do with an empty pool). Dual type wayfarers are weighted by the realm (WREC.dual): a roll for a dual type is re-drawn that share of the time.
function wrState(){if(!G)return null;const c=G.wrec=G.wrec||{st:0,bt:0,n:{},tot:0,last:-1};c.n=c.n||{};return c;}
function wrAllow(s){try{const c=wrState();if(!c||G.daily)return true;if(c.tot>=WREC.total)return false;if((c.n[s]||0)>=(WREC.perRealm[s]!=null?WREC.perRealm[s]:2))return false;return c.tot===0?c.st>=WREC.firstSteps:(c.st>=WREC.minSteps&&c.bt>=WREC.minBattles);}catch(e){return true;}}
function wrNote(s,kind){try{const c=wrState();if(!c||G.daily)return;c.st=0;c.bt=0;c.tot++;c.n[s]=(c.n[s]||0)+1;c.last=s;c.kinds=c.kinds||[];c.kinds.push(kind);}catch(e){}}
const wrDual=id=>{try{return ((TPL[id]||{}).el||[]).length>=2;}catch(e){return false;}};
const wrDualW=s=>WREC.dual[Math.max(0,Math.min(WREC.dual.length-1,s|0))];
HOOK.after('arrive','world12','steps since the last wild recruit event',function(){try{const c=wrState();if(c&&V.screen==='world'&&WS.m&&!G.daily&&(WS.m.kind==='field'||WS.m.kind==='dungeon'))c.st++;}catch(e){}});
HOOK.before('finishBattle','world12','battles since the last wild recruit event',function(){try{const c=wrState();if(c&&!G.daily&&B&&B.spec&&B.spec.kind!=='arena')c.bt++;}catch(e){}});
HOOK.before('ceStep','world12','chance meetings wait for the spacing and the realm budget',function(){try{const m=WS&&WS.m;if(m&&typeof m.s==='number'&&!wrAllow(m.s))return HOOK.stop();}catch(e){}});
HOOK.after('ceStart','world12','a chance meeting counts as a wild recruit event',function(r,m){try{if(m&&typeof m.s==='number')wrNote(m.s,'ce');}catch(e){}});
HOOK.wrap('cePick','world12','dual type wayfarers turn up in the later realms',function(next,m){let h=next(m);try{if(!h||!m||typeof m.s!=='number')return h;for(let t=0;t<8&&h&&wrDual(h)&&Math.random()>wrDualW(m.s);t++)h=next(m);}catch(e){}return h;});
const WR={gate:0};
HOOK.wrap('caveReward','world12','a cave prize that is a wayfarer follows the spacing',function(next,s){const prev=WR.gate;WR.gate=1;try{const kind=(typeof caveKind==='function'?caveKind(s):null),r=next(s);try{if(kind==='recruit'&&G.caveWon&&G.caveWon[s]==='recruit')wrNote(s,'cave');}catch(e){}return r;}finally{WR.gate=prev;}});
HOOK.wrap('fortReward','world12','the keep cells follow the spacing',function(next,s){const prev=WR.gate;WR.gate=1;try{const r=next(s);try{if(G.fortWon&&G.fortWon[s]==='recruit')wrNote(s,'fort');}catch(e){}return r;}finally{WR.gate=prev;}});
HOOK.xform('caveRecruitPool','world12','spacing and dual types for cave and keep recruits',function(pool,s){try{if(!WR.gate||!G||G.daily)return pool;if(!wrAllow(s))return [];
  const solo=pool.filter(h=>!wrDual(h));return solo.length&&hashS(G.run.seed+'dual'+s)%100>=wrDualW(s)*100?solo:pool;}catch(e){return pool;}});
