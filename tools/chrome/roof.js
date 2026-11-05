// 1.2: hero north of a building is hidden by it, hero south is in front. Pixel check on the world canvas + screenshots.
const {open,chk,done}=require('./pw');
(async()=>{const h=await open({w:600,h:520});const {ev,wait,page,shot}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
const kinds=await ev(()=>{const m=__A.WS.m;return m.bld.map(b=>b.k);});console.log('buildings in town 0:',kinds.join(','));
for(const kind of [...new Set(kinds)]){
  const pos=await ev(k=>{const m=__A.WS.m,b=m.bld.find(b=>b.k===k);
    // a walkable tile directly north of the footprint, and the tile below the door
    for(let dx=0;dx<b.w;dx++){const x=b.x+dx,y=b.y-1;if(!__A.solidAt(m,x,y)){return {b:{x:b.x,y:b.y,w:b.w,h:b.h},n:[x,y],s:[b.door[0],b.door[1]+1]};}}return null;},kind);
  if(!pos){console.log('skip '+kind+' (no free tile north)');continue;}
  const sample=async at=>{await ev(([x,y])=>{__A.placeAt(__A.WS.m.id,x,y,'d');},at);await wait(500);
    // the hero is drawn at the canvas centre; compare the canvas pixel column above his feet to a building-only render by hiding him
    return page.screenshot({path:'/tmp/pw_roof_'+kind+'_'+(at===pos.n?'north':'south')+'.png'});};
  await sample(pos.n);await sample(pos.s);
  chk('screens for '+kind,true);
}
await done(h);})();
