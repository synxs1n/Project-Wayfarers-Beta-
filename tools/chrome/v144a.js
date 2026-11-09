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
   (f.caves||[]).forEach(c=>{if(c.kind==='fort'){const [x,y]=c.id==='o1'&&f.fortAt?f.fortAt:[c.x,c.y];o.fort=f.t[y][x]==='E'&&f.t[y][x-1]==='U'&&f.t[y-1][x]==='U';o.lights=g('sncGateLights')(f).length;}else{o.denE=f.t[c.y][c.x]==='E';const sp=g('slDenSprite')(f);o.den=sp.width===64&&sp.height===48;}});
   if(f.ent){o.entE=f.t[f.ent[1]][f.ent[0]]==='E';const L=f.d8lair;o.mask=!L||L.tiles.every(([x,y])=>f.t[y][x]==='#');const sp=g('slLairSprite')(f);o.lair=sp.width===64&&sp.height===60;ls.add(g('slLairKit')(f).id);}
   o.sheet=!!g('slSaSheet')(f);hs.add(g('slDenSprite')(f).toDataURL().length+':'+z.key);
  }catch(e){o.err.push(e.message);}}
 o.errs=g('SLE').slice();out.push(o);});
 // every kit and every den look is its own picture
 const dens=new Set(Object.keys(g('SL_DEN')).map(k=>g('slDenByKey')(k).toDataURL())),kits=new Set(Object.keys(g('SL_LD')).map(k=>g('slLairByKit')({id:k,...g('SL_LKIT')[k]},false).toDataURL()));
 const lit=g('slLairByKit')({id:'thistle',...g('SL_LKIT').thistle},true).toDataURL()!==g('slLairByKit')({id:'thistle',...g('SL_LKIT').thistle},false).toDataURL();
 return {out,dens:dens.size,kits:kits.size,nd:Object.keys(g('SL_DEN')).length,lit,kitsUsed:[...ls].length};});
console.log(JSON.stringify(R.out.map(o=>[o.key,o.draw,o.same,o.den,o.denE,o.entE,o.mask,o.lair,o.fort,o.lights,o.err.length]).slice(0,17)));
for(const o of R.out){chk(`${o.key}: both frames draw, the map (tiles, mapIssues) is unchanged by drawing, no module errors`,o.draw===true&&o.same===true&&!o.err.length&&!o.errs.length||JSON.stringify(o));
 if(o.den!==undefined)chk(`${o.key}: den mouth 64x48 on its unchanged E tile`,o.den&&o.denE||JSON.stringify(o));
 if(o.lair!==undefined)chk(`${o.key}: lair front 64x60, entrance E and every mound tile unchanged`,o.lair&&o.entE&&o.mask||JSON.stringify(o));
 if(o.fort!==undefined)chk(`${o.key}: Sanctum keeps the 3 x 2 U/E footprint, 3 lights`,o.fort&&o.lights===3||JSON.stringify(o));}
chk('17 realms, 17 distinct den mouths and 17 distinct lair fronts; relit differs',R.dens===R.nd&&R.nd===17&&R.kits===17&&R.lit||JSON.stringify([R.dens,R.kits,R.lit]));
// HD-2D: one field per theme stands the front up (cards or geometry) without exceptions
const HR=await ev(async()=>{const A=__A,g=A.TW.get,G=g('G'),Z=g('ZONES'),o=[];A.META.cfg.gfx='high';A.META.cfg.hd2d=true;A.gfxApply();
 for(const key of ['thistle','strand','deeps','tundra','peaks','starless','ashglass']){const idx=Z.findIndex(z=>z.key===key);G.run.seed=424242;G.run.order[1]=idx;g('resetMaps')();const f=g('getMap')('f1'),r={key};
  for(const [k,t] of [['den',(f.caves||[]).find(c=>c.kind!=='fort')],['lair',f.ent&&{x:f.ent[0],y:f.ent[1]}],['sanct',f.fortAt&&{x:f.fortAt[0],y:f.fortAt[1]}]]){if(!t)continue;
   const fv=k==='den'?(t.face||[0,1]):k==='lair'?(f.entFace||[0,1]):[0,1];g('placeAt')('f1',t.x+fv[0]*2,t.y+fv[1]*2,'u');A.WS.lock=false;await new Promise(q=>setTimeout(q,1100));
   r[k]=!!A.HD.live&&!!A.HD.S&&A.HD.S.m&&A.HD.S.m.id==='f1';if(k==='sanct')r.gate=(A.HD.S.bh||[]).some(q=>q.b&&q.b.k==='gatehouse');if(k==='lair'&&f.d8lair)r.mound=(A.HD.S.bh||[]).some(q=>q.b&&q.b.k==='d8lair');}
  r.errs=g('SLE').length;o.push(r);}
 A.META.cfg.hd2d=false;A.gfxApply();return o;});
console.log(JSON.stringify(HR));
if(HR.some(r=>r.den||r.lair||r.sanct))for(const r of HR){chk(`HD-2D ${r.key}: den, lair and shrine bake and render, no module errors`,(r.den!==false)&&(r.lair!==false)&&(r.sanct!==false)&&r.errs===0&&r.gate!==false&&r.mound!==false||JSON.stringify(r));}
else console.log('note: HD-2D not live (no WebGL); HD checks skipped');
await done(H);})();
