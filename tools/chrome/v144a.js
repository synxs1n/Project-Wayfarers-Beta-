// v0.15.x sitelook10.js: den mouths, lair fronts and Sanctum shrines draw in both renderers for every realm, with the footprints the map builder made.
// Usage: PWHTML=../../out/aurelis3.html node v144a.js
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1000,h:560});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();});await wait(300);
const R=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),Z=g('ZONES'),out=[],hs=new Set(),ls=new Set();G.stage=4;
 const snap=m=>m.t.map(r=>r.join('')).join('|');
 Z.forEach((z,idx)=>{if(!z.key)return;const o={key:z.key,err:[]};for(const sd of [1,2]){G.run.seed=sd*7919+3;G.run.order[1]=idx;g('resetMaps')();const f=g('getMap')('f1');
  try{const s0=snap(f),i0=g('mapIssues')(f).length;
   const cv0=g('buildMapCanvas')(f,0),cv1=g('buildMapCanvas')(f,1);o.draw=(o.draw!==false)&&cv0.width===f.w*16&&cv1.height===f.h*16;
   o.same=(o.same!==false)&&snap(f)===s0&&g('mapIssues')(f).length===i0;
   (f.caves||[]).forEach(c=>{if(c.kind==='fort'){const [x,y]=c.id==='o1'&&f.fortAt?f.fortAt:[c.x,c.y];o.fort=f.t[y][x]==='E'&&f.t[y][x-1]==='U'&&f.t[y-1][x]==='U';o.lights=g('sncGateLights')(f).length;}else{o.denE=f.t[c.y][c.x]==='E';const sp=g('slDenSprite')(f);o.den=sp.width===64&&sp.height===55;/* worldart13 (v0.20.1 front facing): 64x48 plus a 7 px top face */}});
   if(f.ent){o.entE=f.t[f.ent[1]][f.ent[0]]==='E';const L=f.d8lair;o.mask=!L||L.tiles.every(([x,y])=>f.t[y][x]==='#');const sp=g('slLairSprite')(f);o.lair=sp.width===64&&sp.height===67;/* worldart13 (v0.20.1 front facing): 64x60 plus the top face */ls.add(g('slLairKit')(f).id);}
   o.sheet=!!g('slSaSheet')(f);hs.add(g('slDenSprite')(f).toDataURL().length+':'+z.key);
  }catch(e){o.err.push(e.message);}}
 o.errs=g('SLE').slice();out.push(o);});
 // every kit and every den look is its own picture
 const dens=new Set(Object.keys(g('SL_DEN')).map(k=>g('slDenByKey')(k).toDataURL())),kits=new Set(Object.keys(g('SL_LD')).map(k=>g('slLairByKit')({id:k,...g('SL_LKIT')[k]},false).toDataURL()));
 const lit=g('slLairByKit')({id:'thistle',...g('SL_LKIT').thistle},true).toDataURL()!==g('slLairByKit')({id:'thistle',...g('SL_LKIT').thistle},false).toDataURL();
 return {out,dens:dens.size,kits:kits.size,nd:Object.keys(g('SL_DEN')).length,lit,kitsUsed:[...ls].length};});
console.log(JSON.stringify(R.out.map(o=>[o.key,o.draw,o.same,o.den,o.denE,o.entE,o.mask,o.lair,o.fort,o.lights,o.err.length]).slice(0,17)));
for(const o of R.out){chk(`${o.key}: both frames draw, the map (tiles, mapIssues) is unchanged by drawing, no module errors`,o.draw===true&&o.same===true&&!o.err.length&&!o.errs.length||JSON.stringify(o));
 if(o.den!==undefined)chk(`${o.key}: den mouth 64x55 (64x48 with its top face) on its unchanged E tile`,o.den&&o.denE||JSON.stringify(o));
 if(o.lair!==undefined)chk(`${o.key}: lair front 64x67 (64x60 with its top face), entrance E and every mound tile unchanged`,o.lair&&o.entE&&o.mask||JSON.stringify(o));
 if(o.fort!==undefined)chk(`${o.key}: Sanctum keeps the 3 x 2 U/E footprint, 3 lights`,o.fort&&o.lights===3||JSON.stringify(o));}
chk('17 realms, 17 distinct den mouths and 17 distinct lair fronts; relit differs',R.dens===R.nd&&R.nd===17&&R.kits===17&&R.lit||JSON.stringify([R.dens,R.kits,R.lit]));
// depth pass: no entrance is a flat fill. Every den and lair sprite has many tones, is lit from the upper left (the upper left half is brighter than the lower right
// half) and has a darker foot; the ground carries a cast shadow row under a den mouth, a lair front and the Sanctum shrine (drawTile differs with and without it)
const DP=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),Z=g('ZONES');
 const st=cv=>{const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data,set=new Set;let ul=0,nu=0,lr=0,nl=0,foot=0,nf=0,mid=0,nm=0;for(let y=0;y<cv.height;y++)for(let X=0;X<cv.width;X++){const i=(y*cv.width+X)*4;if(d[i+3]<200)continue;set.add(d[i]+','+d[i+1]+','+d[i+2]);const l=d[i]*.3+d[i+1]*.59+d[i+2]*.11;
  if(X/cv.width+y/cv.height<1){ul+=l;nu++;}else{lr+=l;nl++;}if(y===cv.height-1){foot+=l;nf++;}else if(y===cv.height-8){mid+=l;nm++;}}return {tones:set.size,lit:+(ul/Math.max(1,nu)/(lr/Math.max(1,nl))).toFixed(2),foot:nf&&nm?foot/nf/(mid/nm):9};};
 const bad=[];Object.keys(g('SL_DEN')).forEach(k=>{const r=st(g('slDenByKey')(k));if(r.tones<200||r.lit<1.05||r.foot>1.5)bad.push('den '+k+JSON.stringify(r));});
 Object.keys(g('SL_LD')).forEach(k=>{const r=st(g('slLairByKit')({id:k,...g('SL_LKIT')[k]},false));if(r.tones<200||r.lit<1.05||r.foot>1.5)bad.push('lair '+k+JSON.stringify(r));});
 // the cast shadow on the ground: tile (cx..cx, cy) for a den and a lair without a mound, the foot of the Sanctum, the flank of a lair mound
 const tileDiff=(f,x,y)=>{const mk=()=>{const cv=document.createElement('canvas');cv.width=cv.height=16;const c=cv.getContext('2d');c.translate(-x*16,-y*16);g('drawTile')(c,f,x,y,0);return c.getImageData(0,0,16,16).data;};
  const a=mk();g('SLX').noAO=1;const b=mk();g('SLX').noAO=0;let n=0;for(let i=0;i<a.length;i+=4)if(a[i]<b[i]-3)n++;return n;};
 const sh={den:0,lair:0,sanct:0,mound:0,n:0};G.stage=4;
 ['thistle','deeps','tundra','ashen'].forEach(key=>{const idx=Z.findIndex(z=>z.key===key);if(idx<0)return;G.run.seed=424242;G.run.order[1]=idx;g('resetMaps')();let f=g('getMap')('f1');
  let c=(f.caves||[]).find(q=>q.kind!=='fort');for(let sd=1;!c&&sd<40;sd++){G.run.seed=424242+sd*977;g('resetMaps')();f=g('getMap')('f1');c=(f.caves||[]).find(q=>q.kind!=='fort');}
  if(c){sh.den=Math.max(sh.den,tileDiff(f,c.x,c.y));sh.n++;}
  if(f.ent){if(f.d8lair){const L=f.d8lair;L.tiles.forEach(([x,y])=>{[[1,0],[0,1],[-1,0],[0,-1]].forEach(([a,b])=>{if(!L.mask.has((x+a)+','+(y+b)))sh.mound=Math.max(sh.mound,tileDiff(f,x+a,y+b));});});}else sh.lair=Math.max(sh.lair,tileDiff(f,f.ent[0],f.ent[1]));}
  if(f.fortAt)sh.sanct=Math.max(sh.sanct,tileDiff(f,f.fortAt[0],f.fortAt[1]+1));});
 return {bad,sh,err:g('SLE').slice()};});
chk('every den and lair sprite is shaded: 200+ tones, upper left brighter than lower right, no bright foot (contact band)',!DP.bad.length||JSON.stringify(DP.bad));
chk('a cast shadow row on the ground under a den mouth, the Sanctum shrine and (a lair or its mound) in the ground tiles',DP.sh.den>=20&&DP.sh.sanct>=20&&(DP.sh.lair>=20||DP.sh.mound>=20)&&!DP.err.length||JSON.stringify(DP));
// HD-2D: one field per theme stands the front up (cards or geometry) without exceptions
const HR=await ev(async()=>{const A=__A,g=A.TW.get,G=g('G'),Z=g('ZONES'),o=[];A.META.cfg.gfx='high';A.META.cfg.hd2d=true;A.gfxApply();
 for(const key of ['thistle','strand','deeps','tundra','peaks','starless','ashglass']){const idx=Z.findIndex(z=>z.key===key);G.run.seed=424242;G.run.order[1]=idx;g('resetMaps')();const f=g('getMap')('f1'),r={key};
  for(const [k,t] of [['den',(f.caves||[]).find(c=>c.kind!=='fort')],['lair',f.ent&&{x:f.ent[0],y:f.ent[1]}],['sanct',f.fortAt&&{x:f.fortAt[0],y:f.fortAt[1]}]]){if(!t)continue;
   const fv=k==='den'?(t.face||[0,1]):k==='lair'?(f.entFace||[0,1]):[0,1];g('placeAt')('f1',t.x+fv[0]*2,t.y+fv[1]*2,'u');A.WS.lock=false;await new Promise(q=>setTimeout(q,1100));
   r[k]=!!A.HD.live&&!!A.HD.S&&A.HD.S.m&&A.HD.S.m.id==='f1';if((k==='den'||k==='lair')&&r[k]){// the card never thins out round the hero (x-ray flag 8 cleared on the entrance quads)
    try{const mk=g('mkCv'),bk=g('hdBakeCards')(f,A.HD.S,mk(f.w*16,f.h*16),mk(f.w*16,f.h*16)),sz=t.x*16+8,zz=(t.y+1)*16+.5;let near=0,xr=0;
     if(bk&&bk.bt&&bk.bt.b)bk.bt.b.forEach(bt=>{if(!bt)return;for(let q=0;q<bt.n;q++){const x=bt.f[q*4*7],z=bt.f[q*4*7+2];if(Math.abs(z-zz)<.6&&Math.abs(x-sz)<30){near++;if(bt.b[q*4*28+27]&8)xr++;}}});r['xr'+k]=xr===0?1:near+':'+xr;}catch(e){r['xr'+k]='err '+e.message;}}if(k==='sanct')r.gate=(A.HD.S.bh||[]).some(q=>q.b&&q.b.k==='gatehouse');if(k==='lair'&&f.d8lair)r.mound=(A.HD.S.bh||[]).some(q=>q.b&&q.b.k==='d8lair');}
  r.errs=g('SLE').length;o.push(r);}
 A.META.cfg.hd2d=false;A.gfxApply();return o;});
console.log(JSON.stringify(HR));
if(HR.some(r=>r.den||r.lair||r.sanct))for(const r of HR){chk(`HD-2D ${r.key}: den, lair and shrine bake and render, no module errors`,(r.den!==false)&&(r.lair!==false)&&(r.sanct!==false)&&r.errs===0&&r.gate!==false&&r.mound!==false&&(r.xrden===undefined||r.xrden===1)&&(r.xrlair===undefined||r.xrlair===1)||JSON.stringify(r));}
else console.log('note: HD-2D not live (no WebGL); HD checks skipped');
await done(H);})();
