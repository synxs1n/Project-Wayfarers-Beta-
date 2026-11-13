// v0.4.1 1.6: dungeon and cave entrances are never drawn rotated, on every field in every gate orientation (v0.20.6: and all face south)
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
await H.page.waitForFunction(()=>__A.V.screen==='world',{timeout:20000});
const r=await H.ev(()=>{const A=__A,G=A.G;const P=CanvasRenderingContext2D.prototype,rot0=P.rotate;let rotated=0,fields=0,faces={};
  P.rotate=function(a){if(Math.abs(a)>.01)rotated++;return rot0.call(this,a);};
  try{for(let seed=1;seed<=24;seed++){G.run.seed=seed*7919+13;A.resetMaps();
    for(let s=0;s<4;s++){const f=A.getMap('f'+s);fields++;const k=(f.entFace||[0,1]).join(',');faces[k]=(faces[k]||0)+1;
      (f.caves||[]).forEach(c=>{const kk=(c.face||[0,1]).join(',');faces['c'+kk]=(faces['c'+kk]||0)+1;});
      A.placeAt('f'+s,f.entOut?f.entOut[0]:f.ent[0],f.entOut?f.entOut[1]:f.ent[1],'d');A.worldDraw(1000);}}}
  finally{P.rotate=rot0;}
  return {rotated,fields,faces};});
console.log(JSON.stringify(r));
// v0.20.6 (world14.js): every den, lair and shrine faces the camera whatever the gate orientation, so the faces are all south (this used to ask for some that were not)
chk('1.6 fields covered: every entrance faces south in every gate orientation '+JSON.stringify(r.faces),r.fields>=90&&Object.keys(r.faces).every(k=>k.endsWith('0,1')));
chk('1.6 no entrance is drawn rotated',r.rotated===0||JSON.stringify(r));
await done(H);})();
