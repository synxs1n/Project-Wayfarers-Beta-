// ===== npcart9.js: townsfolk and service NPCs: a silhouette and a prop per role, muted two-tone cloth, walk and idle frames =====
// How it hooks in (nothing here edits art.js, art2.js, worldgen.js or the world draw code):
//  - villagerLook(name) is wrapped: the look gets vill:1 (marks it as a townsperson), role (from the name, NPC9.roleOf) and the role's overrides
//    (body, hat, shield, spectacles, fur, size, palette, accent). Race/skin/hair/face/size variety from villagerLook is kept.
//  - heroGridView / weaponFB / raceSide are wrapped: for a look with vill:1 only (never the player, never a hero id) the finished key grid
//    gets the role garments, the prop in the hand (front, back and side), the head/shoulder bob, the arm swing and a lit-left / shaded-right
//    second tone on every garment (keys P Q J K Y and the role cloths). paint() / paintHD() still do the outline.
//  - heroPal is wrapped: villagers get desaturated cloth (docs/art-style.md rule 8) and the keys the role needs.
//  - walkerCanvas is wrapped: frame 3 is the idle B frame (a 1px breathe); a standing NPC from the world (key 'npc:...', frame 0) alternates A and B
//    every 700 ms (frozen on A under gfxStill()). drawSprite is wrapped to drop the old whole-sprite 1px hop of the world draw for those canvases.
// Frames: 0 stand, 1 and 2 stride (front/back), side 0 stand / 1 stride, 3 idle B. Cached through walkerCanvas's imgOf key (look+view+frame).
// No randomness: everything is a function of the name (villagerLook) and the frame.
const NP9={on:false,L:null,view:'front',frame:0,b:false,now:0,cv:null,cb:0};
// role, name pattern, sample name (the sheets and tests use the sample). The first match wins, so the order matters.
const NPC9_ROLES=[
 ['child',/\bchild\b|\bkid\b|lamp-girl|bellows-boy/i,'Child'],
 ['guard',/captain|sentry|gatewarden|weary knight|bridge-keeper|scout|\bguard\b/i,'Captain Rusk'],
 ['innkeeper',/hearth-keeper|innkeep/i,'Hearth-keeper Brann'],
 ['tavern',/cider-wife|tavern|barkeep|brewer/i,'Cider-wife Bel'],
 ['smith',/forgemaster|smelter|foreman|glass-cutter|smith|ember-warden/i,'Forgemaster Hild'],
 ['alchemist',/assayer|alchemist|apothecary/i,'Assayer Mira'],
 ['clerk',/harbormaster|caravan-master|mapmaker|clerk|herald|town crier/i,'Caravan-master Rhee'],
 ['archivist',/scholar|astronomer|star-reader|candle-keeper|archivist/i,'Scholar Pell'],
 ['beastwarden',/trapper|hunter|aerie warden|beastwarden|ranger/i,'Hunter Ilse'],
 ['priest',/priest|\bmonk\b|novice|choir|bell-?ringer|shrine/i,'Tide-priest Ommo'],
 ['pilgrim',/pilgrim/i,'Pilgrim Ansel'],
 ['shopkeeper',/trader|merchant|water-seller|salt-boss|kite-maker|lantern-maker|shopkeep/i,'Market trader'],
 ['shepherd',/shepherd|drover/i,'Shepherd Wyn'],
 ['fisher',/net-mender|fisher|sailor|ferryman|diver|gull-watcher|lighthouse|reed-cutter/i,'Fisher Nan'],
 ['miner',/miner|ice-climber/i,'Miner Dolt'],
 ['picker',/picker|beekeeper|moss-tender/i,'Picker Tam'],
 ['farmer',/farmer|miller|windmiller/i,'Farmer Bess'],
 ['lamplighter',/lamp-keeper|lantern-keeper|\blamp\b/i,'Lamp-keeper Odo'],
 ['elder',/^old |\bold\b|elder/i,'Old Tamsin']];
// the service kinds an NPC can carry in its act field map onto the same roles
const NPC9_ACT={innkeeper:'innkeeper',inn:'innkeeper',smith:'smith',smithy:'smith',alchemist:'alchemist',apothecary:'alchemist',clerk:'clerk',guild:'clerk',tavern:'tavern',
  tavernkeeper:'tavern',archivist:'archivist',beastwarden:'beastwarden',guard:'guard',gate:'guard',priest:'priest',shrine:'priest',shop:'shopkeeper',child:'child',elder:'elder'};
function npcRoleOf(name,act){const s=String(name||'');for(const r of NPC9_ROLES)if(r[1].test(s))return r[0];return act&&NPC9_ACT[act]||null;}
// role overrides on the look: b body, hat, sh shield, wpn (real weapons only for the guard), glasses, fur, size, pal (muted cloth), ac accent (flat key X)
const NPC9_RD={
 child:{size:'small',head:1,pal:{P:'#8a7a6a',Q:'#d8cdb4',J:'#7a8a6a'},ac:'#d8a050'},
 guard:{b:'heavy',hat:'helm',wpn:'spear',sh:'kite',face:[],pal:{M:'#9ca2b2',N:'#5a6276',P:'#566074',Q:'#d8bc68',K:'#3c3a4c',Z:'#8a4a48',J:'#566074'},ac:'#e0c060'},
 innkeeper:{b:'light',hat:null,pal:{P:'#7e6c5a',Q:'#d4c8ac',K:'#4a4038',J:'#7e6c5a'},ac:'#d8b050',prop:'tray'},
 tavern:{b:'light',hat:null,pal:{P:'#667a68',Q:'#d4c8ac',K:'#46403a',J:'#667a68'},ac:'#e0a040',prop:'mug'},
 smith:{b:'light',hat:null,size:'big',pal:{P:'#5c5046',Q:'#8a7a68',K:'#38302c',J:'#5c5046'},ac:'#e8802c',prop:'hammer'},
 alchemist:{b:'robe',hat:'goggles',pal:{P:'#4e6a64',Q:'#a8b8a0',J:'#4e6a64',K:'#34403c'},ac:'#58d8b8',prop:'vial'},
 clerk:{b:'light',hat:null,pal:{P:'#59627a',Q:'#d4d0c0',K:'#3a3c4c',J:'#59627a'},ac:'#b8483c',prop:'ledger'},
 archivist:{b:'robe',hat:null,glasses:1,pal:{P:'#6c5c78',Q:'#c8bc98',J:'#6c5c78',K:'#3c3444'},ac:'#d8b858',prop:'book'},
 beastwarden:{b:'light',hat:null,fur:1,pal:{P:'#675c44',Q:'#b8a478',K:'#3e3a2c',J:'#675c44'},ac:'#b8884a',prop:'leash'},
 priest:{b:'robe',hat:'mitre',pal:{P:'#c6beae',Q:'#a89664',J:'#c6beae',K:'#807868'},ac:'#ffd878',prop:'censer'},
 pilgrim:{b:'light',hat:'hood',back:['pack'],pal:{P:'#7a7060',Q:'#c0b494',J:'#6a6254',Y:'#6a6254',K:'#444036'},ac:'#c8a060',prop:'pilgrim'},
 shopkeeper:{b:'light',hat:null,pal:{P:'#6e5c78',Q:'#d0c4a4',K:'#403a44',J:'#6e5c78'},ac:'#e0b840',prop:'bag'},
 shepherd:{b:'light',hat:'beret',pal:{P:'#767654',Q:'#d0c8a0',K:'#463e30',J:'#767654'},ac:'#e8e4d0',prop:'crook'},
 fisher:{b:'light',hat:'widebrim',pal:{P:'#4e6676',Q:'#b8c0b4',K:'#364048',J:'#4e6676'},ac:'#d8584a',prop:'rod'},
 miner:{b:'light',hat:'helm',pal:{P:'#675e54',Q:'#a89878',K:'#38342e',J:'#675e54'},ac:'#ffd04a',prop:'pick'},
 picker:{b:'light',hat:'widebrim',pal:{P:'#7a6c4c',Q:'#d4c498',K:'#443c2c',J:'#7a6c4c'},ac:'#c8483c',prop:'basket'},
 farmer:{b:'light',hat:'widebrim',pal:{P:'#6a7a52',Q:'#d0c49c',K:'#44402c',J:'#6a7a52'},ac:'#d8b050',prop:'hoe'},
 lamplighter:{b:'light',hat:null,pal:{P:'#6a5e58',Q:'#c8bca0',K:'#3c3630',J:'#6a5e58'},ac:'#ffd878',prop:'lantern'},
 elder:{b:'robe',hat:null,back:[],pal:{P:'#766a62',Q:'#b8aa90',J:'#766a62',K:'#403a38',H:'#c4c8d0'},ac:'#b8a070',prop:'cane'}
};
function npcLookFix(L,name){
  L.vill=1;const role=npcRoleOf(name);if(role)L.role=role;const d=role&&NPC9_RD[role];
  if(d){
    ['b','hat','sh','wpn','glasses','fur','size','back','face'].forEach(k=>{if(k in d)L[k]=d[k];});
    L.pal=Object.assign({},L.pal,d.pal||{});L.ac=d.ac;if(d.prop)L.prop=d.prop;if(d.head)L.bigHead=1;
    if(role==='elder'){L.pal.H=d.pal.H;L.stoop=1;}
    if(role==='smith'&&L.hair==='long')L.hair='bob';
  }
  return L;
}
{const vl0=villagerLook;villagerLook=function(name){return npcLookFix(vl0.apply(this,arguments),name);};}
// desaturate (rule 8): cloth keys lose 38% of their colour, hair and skin keep theirs; every key a role needs is set here
function npcMute(c,t){const v=hx(c),l=v[0]*.3+v[1]*.59+v[2]*.11;return rh(v.map(x=>x+(l-x)*t));}
{const hp0=heroPal;heroPal=function(L,els,id){const p=hp0.apply(this,arguments);if(!L||!L.vill||id)return p;
  const d=L.role&&NPC9_RD[L.role];
  if(!d)['P','Q','J','Y','Z','K'].forEach(k=>{if(p[k])p[k]=npcMute(p[k],.5);});
  p.p=mix(shade(p.P,.76),'#2c1458',.12);p.q=mix(shade(p.Q,.78),'#2c1458',.1);p.j=mix(shade(p.J,.76),'#2c1458',.12);p.k=mix(shade(p.K,.74),'#2c1458',.12);p.z=mix(shade(p.Y,.76),'#2c1458',.12);
  p.f='#7a5a3a';p.g='#4a3626';p.i='#e4dcc6';p.n='#2a2830';p.o='#a8483c';p.s='#c4a070';p.t='#6a4a30';p['6']=mix(shade(p.i,.78),'#2c1458',.1);p['7']=mix(shade(p.g,.78),'#2c1458',.1);p['8']=mix(shade(p.f,.78),'#2c1458',.1);
  p.F='#a89070';p.X=L.ac||p.X;
  return p;};}
// ---------- grid helpers (logical coordinates, like g.s: the grid adds its own offset) ----------
const NPC9_SH={P:'p',Q:'q',J:'j',K:'k',Y:'z',i:'6',g:'7',f:'8'};
// move a block (x0..x1, y0..y1) by (dx,dy); only non-empty cells land, vacated cells go empty. fill: copy the edge row left behind
function npcShift(g,x0,x1,y0,y1,dx,dy,fill){
  const W=g.w,ox=g.ox,oy=g.oy,A=g.a,t=[];
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=(y+oy)*W+x+ox;if(x+ox<0||x+ox>=W||y+oy<0||y+oy>=g.h)continue;t.push([x,y,A[i]]);A[i]=0;}
  t.forEach(([x,y,k])=>{if(!k)return;const nx=x+dx+ox,ny=y+dy+oy;if(nx>=0&&ny>=0&&nx<W&&ny<g.h)A[ny*W+nx]=k;});
  if(fill){t.forEach(([x,y,k])=>{if(!k)return;const edge=dy<0?y===y1:dy>0?y===y0:false;if(!edge)return;const nx=x+ox,ny=y+oy;if(!A[ny*W+nx])A[ny*W+nx]=k;});}
}
// 2-tone: lit left, shaded right. The cut sits at 58% of the width of each key's own extent
function npcSplit(g){
  const W=g.w,H=g.h,A=g.a;
  Object.keys(NPC9_SH).forEach(k=>{let x0=1e9,x1=-1,n=0;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(A[y*W+x]===k){if(x<x0)x0=x;if(x>x1)x1=x;n++;}
    if(n<4||x1-x0<2)return;const cut=x0+Math.ceil((x1-x0+1)*.58),s=NPC9_SH[k];
    for(let y=0;y<H;y++)for(let x=cut;x<=x1;x++)if(A[y*W+x]===k)A[y*W+x]=s;});
}
// a drawing surface in the hand's own frame: origin at the hand's top-left pixel, x grows outward (away from the body), y grows downward
function npcHand(g,view,sw){
  const m=view==='front'?-1:1,ax=view==='front'?11:view==='back'?28:26,ay=view==='side'?29:32,X=x=>ax+m*x,Y=y=>ay+y+sw;
  return {s:(x,y,k)=>g.s(X(x),Y(y),k),
    r:(x,y,w,h,k)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)g.s(X(x+i),Y(y+j),k);},
    l:(x0,y0,x1,y1,k)=>g.line(X(x0),Y(y0),X(x1),Y(y1),k),
    e:(cx,cy,rx,ry,k)=>g.ell(X(cx)+.5,Y(cy)+.5,rx,ry,k),
    p:(L,k)=>L.forEach(q=>g.s(X(q[0]),Y(q[1]),k))};
}
const NPC9_PROP={
 tray(h){h.r(-2,-2,8,1,'M');h.r(-1,-1,6,1,'N');h.r(0,-6,3,4,'f');h.r(0,-7,3,1,'i');h.p([[3,-5],[4,-4],[3,-3]],'f');h.r(4,-4,2,2,'X');},
 hammer(h){h.r(0,-9,2,17,'W');h.r(-3,-15,7,6,'M');h.r(-3,-15,7,1,'N');h.r(-3,-10,7,1,'N');h.p([[4,-14],[4,-13]],'X');},
 vial(h){h.r(-1,-6,4,5,'X');h.r(0,-8,2,2,'w');h.s(0,-9,'f');h.s(1,-9,'f');h.s(-1,-5,'w');h.r(-1,-1,4,1,'M');},
 ledger(h){h.r(-2,-7,7,8,'g');h.r(-2,-7,7,1,'7');h.r(5,-6,1,6,'i');h.r(-1,-5,4,1,'X');h.l(2,-8,6,-17,'i');h.p([[4,-14],[5,-13],[5,-15],[6,-16],[3,-12]],'i');h.s(2,-8,'n');},
 mug(h){h.r(-1,-6,5,6,'f');h.r(-1,-7,5,2,'i');h.p([[4,-4],[5,-4],[5,-3],[5,-2],[4,-1]],'f');h.r(0,-4,1,3,'8');h.s(1,-8,'i');},
 book(h){h.r(-3,-9,8,9,'g');h.r(-3,-9,8,1,'7');h.r(-2,-8,6,7,'i');h.l(1,-8,1,-2,'6');h.s(-3,-4,'X');h.s(5,-4,'X');h.r(4,-1,1,4,'o');},
 leash(h){h.l(0,2,4,9,'f');h.s(0,1,'f');h.s(1,2,'f');},
 bag(h){h.e(1,6,3.8,4.2,'f');h.r(-1,1,5,2,'g');h.r(-2,3,7,1,'X');h.p([[0,6],[2,7],[1,5],[3,5]],'X');h.p([[1,0],[2,0],[0,0]],'X');},
 censer(h){h.l(1,1,1,7,'M');h.r(-1,7,5,3,'X');h.r(-1,7,5,1,'N');h.r(0,10,3,1,'N');h.p([[3,3],[4,1],[3,-1],[4,-3]],'i');},
 cane(h){h.l(1,-3,1,12,'W');h.r(0,-4,3,1,'W');h.p([[3,-3]],'W');},
 rod(h){h.l(1,0,8,-20,'W');h.l(8,-20,10,-5,'i');h.r(9,-5,2,2,'X');h.r(-1,5,4,4,'f');h.r(-1,5,4,1,'g');},
 hoe(h){h.l(1,-10,1,11,'W');h.r(-1,-11,5,2,'N');h.r(-1,-11,5,1,'M');h.r(2,-9,2,2,'N');},
 basket(h){h.r(-2,2,7,5,'f');h.r(-2,2,7,1,'g');h.p([[-1,4],[1,5],[3,4],[0,6]],'8');h.p([[-1,1],[0,0],[1,-1],[2,-1],[3,0],[4,1]],'W');h.p([[0,1],[2,0],[3,1]],'X');},
 crook(h){h.l(1,-18,1,11,'W');h.p([[1,-19],[2,-20],[3,-20],[4,-19],[4,-18],[3,-17]],'W');},
 pick(h){h.l(1,-10,1,10,'W');h.r(-1,-11,10,2,'N');h.r(-1,-11,10,1,'M');h.p([[9,-9],[10,-8],[10,-7]],'N');},
 lantern(h){h.p([[0,3],[2,3],[1,2]],'M');h.l(1,1,1,2,'M');h.r(-1,4,5,1,'M');h.r(-1,5,5,6,'N');h.r(0,6,3,4,'D');h.r(-1,11,5,1,'M');},
 pilgrim(h){h.l(1,-19,1,11,'W');h.e(2,-11,1.6,2.1,'f');h.p([[1,-12],[2,-9]],'8');h.s(2,-14,'o');}
};
// ---------- the shapes on the body (base coordinates, before the bob), per view ----------
function npcGarb(g,L,view){
  const r=L.role,F=view==='front',B=view==='back',S=view==='side';
  if(L.bigHead){
    // children: a head one pixel taller (a forehead row is repeated) and two wider (two columns inside the head are repeated)
    npcShift(g,0,39,0,13,0,-1,true);
    const W=g.w,A=g.a,cL=S?19:18,cR=S?22:21;
    for(let y=7;y<=16;y++){const row=y*W,out=[];
      for(let x=0;x<W;x++){out.push(A[row+x]);if(x===cL||x===cR)out.push(A[row+x]);}
      for(let x=0;x<W;x++)A[row+x]=out[x+1]||0;}
  }
  if(r==='innkeeper'||r==='tavern'||r==='shopkeeper'){
    if(F){if(r!=='tavern')g.rect(16,20,8,5,'i');g.rect(15,r==='tavern'?27:28,10,r==='tavern'?7:9,'i');if(r!=='tavern')g.rect(15,36,10,1,'X');
      if(r==='innkeeper')g.px([[26,24],[27,25],[26,26],[27,27]],'X');
      if(r==='tavern'){g.rect(10,22,3,2,'i');g.rect(27,22,3,2,'i');}}
    else if(B){g.rect(15,27,10,1,'i');g.px([[19,28],[20,29],[21,29]],'i');}
    else{g.rect(22,27,4,10,'i');g.rect(22,36,4,1,'X');}
  }
  if(r==='smith'){
    if(F){g.rect(15,20,10,16,'g');g.px([[18,24],[21,28],[17,31],[20,33]],'n');g.rect(10,22,3,9,'S');g.rect(27,22,3,9,'S');g.px([[11,26],[28,27]],'n');}
    else if(B){g.rect(15,19,10,1,'g');g.line(15,20,24,30,'g');g.line(24,20,15,30,'g');g.rect(10,22,3,9,'S');g.rect(27,22,3,9,'S');}
    else{g.rect(21,20,4,16,'g');g.px([[23,26],[22,31]],'n');}
  }
  if(r==='alchemist'){
    if(F){g.rect(19,18,2,29,'Q');g.line(14,19,25,30,'g');g.px([[16,22],[19,25],[22,28]],'X');g.px([[15,29],[16,29]],'X');}
    else if(B){g.rect(19,18,2,29,'Q');g.rect(15,18,10,1,'Q');}
    else{g.rect(21,18,3,29,'Q');g.px([[22,24],[23,27]],'X');}
  }
  if(r==='clerk'){
    if(F){g.path([[15,19],[25,30]],'o',2);g.px([[24,31],[23,32]],'o');g.px([[22,27],[23,27]],'g');}
    else if(B){g.path([[25,19],[15,30]],'o',2);}
    else{g.path([[18,19],[24,30]],'o',2);}
  }
  if(r==='archivist'){
    if(F){g.rect(19,18,2,29,'g');g.px([[18,28],[21,28],[19,47],[20,47]],'X');}
    else if(B||S){g.rect(B?19:21,18,2,29,'g');}
  }
  if(r==='beastwarden'){
    if(F||B){g.rect(11,19,3,3,'f');g.rect(26,19,3,3,'f');g.rect(15,19,1,9,'f');g.rect(24,19,1,9,'f');}
    else g.rect(22,19,1,8,'f');
  }
  if(r==='priest'){
    if(F){g.rect(17,18,1,29,'Q');g.rect(22,18,1,29,'Q');g.rect(12,46,16,1,'Q');}
    else if(B){g.rect(15,18,10,1,'Q');g.rect(19,19,2,28,'Q');g.rect(12,46,16,1,'Q');}
    else{g.rect(21,18,2,29,'Q');g.rect(14,46,12,1,'Q');}
  }
  if(r==='farmer'||r==='picker'){
    if(F){g.rect(16,19,1,8,'f');g.rect(23,19,1,8,'f');g.rect(16,26,8,7,'f');g.px([[16,26],[23,26]],'G');}
    else if(B){g.line(15,19,24,29,'f');g.line(24,19,15,29,'f');}
    else{g.rect(22,19,1,8,'f');g.rect(20,26,5,7,'f');}
  }
  if(r==='fisher'){
    if(F){g.rect(14,20,12,7,'f');g.px([[16,22],[19,22],[22,22]],'g');g.rect(14,44,5,8,'g');g.rect(21,44,5,8,'g');}
    else if(B){g.rect(14,20,12,7,'f');g.rect(14,44,5,8,'g');g.rect(21,44,5,8,'g');}
    else{g.rect(19,20,6,7,'f');g.rect(19,44,6,8,'g');}
  }
  if(r==='miner'){
    if(F||B){g.rect(19,6,2,2,'D');g.rect(14,20,12,1,'f');g.rect(13,30,14,1,'f');g.px([[16,21],[23,21],[16,22],[23,22]],'n');}
    else{g.rect(25,7,2,2,'D');g.rect(17,20,8,1,'f');g.px([[22,22],[22,24]],'n');}
  }
  if(r==='shepherd'){
    if(F)g.rect(15,18,10,2,'i');else if(B)g.rect(14,18,12,2,'i');else g.rect(17,18,8,2,'i');
  }
  if(r==='lamplighter'){if(F)g.rect(15,29,10,1,'g');}
  if(r==='pilgrim'){if(F)g.line(15,19,25,29,'f');}
  if(r==='elder'&&F)g.px([[17,34],[22,34]],'i');
}
function npcPups(g,view){
  // the beastwarden's pup, on the ground beside the walker (the leash runs to it): faces the walker, a mirrored sprite in the back view
  const R=[".....t..","t...sss.","tsssssns","ssssss..","t.t.t.t.","t.t.t.t."],x0=view==='front'?1:31,y0=46,flip=view==='back';
  R.forEach((r,j)=>{for(let i=0;i<8;i++){const c=r[flip?7-i:i];if(c!=='.')g.s(x0+i,y0+j,c);}});
}
// ---------- the whole pass ----------
function npcFinish(g,L,view){
  if(!L.vill)return;
  const f=NP9.frame,b=NP9.b,front=view==='front',back=view==='back',side=view==='side',role=L.role,prop=NPC9_PROP[L.prop];
  npcGarb(g,L,view);
  // hat extras that depend on the role (after the hat so they sit on top)
  // body bob: stride frames sit one pixel low (head and shoulders), idle B lifts head and shoulders by one pixel
  const stride=side?f>0:f>0;
  if(stride)npcShift(g,0,39,0,22,0,1,false);
  if(b)npcShift(g,0,39,0,19,0,-1,true);
  // elders stoop: head and shoulders drop two pixels (and lean forward in the side view)
  if(L.stoop){npcShift(g,0,39,0,17,side?1:0,2,false);}
  // arm swing: the prop arm and the other arm go opposite ways
  let sw=0,sw2=0;
  if(f===1){sw=-1;sw2=1;}else if(f===2){sw=1;sw2=-1;}else if(side&&f>0){sw=-1;}
  if(b){sw=0;}
  const dyb=stride?1:0;
  if(!side){if(sw)npcShift(g,front?8:26,front?13:31,20+dyb,35+dyb,0,sw,true);if(sw2)npcShift(g,front?26:8,front?31:13,20+dyb,35+dyb,0,sw2,true);}
  else if(sw)npcShift(g,20,28,21+dyb,32+dyb,0,sw,true);
  if(prop&&!(L.wpn&&L.wpn!=='none')){prop(npcHand(g,view,sw+dyb+(L.stoop?1:0)+(b?-1:0)));}
  if(role==='beastwarden')npcPups(g,view);
  npcSplit(g);
}
// frame bookkeeping around the grid builders. Only looks with vill and no hero id are touched.
{const hv0=heroGridView;heroGridView=function(L,view,frame,id){
  if(!L||!L.vill||id)return hv0.apply(this,arguments);
  const b=frame===3,saved=[NP9.on,NP9.L,NP9.view,NP9.frame,NP9.b];NP9.on=true;NP9.L=L;NP9.view=view;NP9.frame=b?0:frame;NP9.b=b;
  try{return hv0.call(this,L,view,NP9.frame,id);}finally{NP9.on=saved[0];NP9.L=saved[1];NP9.view=saved[2];NP9.frame=saved[3];NP9.b=saved[4];}};}
{const wf0=weaponFB;weaponFB=function(g,L,view){wf0.apply(this,arguments);if(NP9.on&&L&&L.vill&&view!=='side')npcFinish(g,L,view);};}
{const rs0=raceSide;raceSide=function(g,L){rs0.apply(this,arguments);if(NP9.on&&L&&L.vill&&NP9.view==='side')npcFinish(g,L,'side');};}
// ---------- idle B in the world ----------
function npcBob(n,now){return Math.floor(now/700+n.hx)%2;}
function npcOf(key){try{const m=WS&&WS.m;if(!m||!m.npcs)return null;return m.npcs.find(n=>key==='npc:'+n.name+m.id)||null;}catch(e){return null;}}
{const wc0=walkerCanvas;walkerCanvas=function(key,L,els,id,view,frame){
  NP9.cv=null;
  if(frame!==0||id||typeof key!=='string'||key.slice(0,4)!=='npc:'||!L||!L.vill)return wc0.apply(this,arguments);
  const n=npcOf(key);if(!n||(n.mv&&(NP9.now||performance.now())-n.mv.t0<420))return wc0.apply(this,arguments);
  const still=typeof gfxStill==='function'&&gfxStill(),now=NP9.now||performance.now(),ph=npcBob(n,now);
  const c=wc0.call(this,key,L,els,id,view,still?0:ph?3:0);
  NP9.cv=c;NP9.cb=ph;return c;};}
{const ds0=drawSprite;drawSprite=function(ctx,c,fx,fy,flip,squash){if(NP9.cv&&c===NP9.cv){fy+=NP9.cb;NP9.cv=null;}return ds0.call(this,ctx,c,fx,fy,flip,squash);};}
HOOK.before('worldDraw','npcart9','record the world clock for the idle frames',function(now){NP9.now=now;});
{const ha0=hdActors;hdActors=function(m,now,ts){NP9.now=now;return ha0.apply(this,arguments);};}
const NPC9={roles:NPC9_ROLES.map(r=>({role:r[0],name:r[2]})),roleOf:npcRoleOf,props:NPC9_PROP,rd:NPC9_RD,act:NPC9_ACT};
