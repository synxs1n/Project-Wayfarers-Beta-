// v0.4.1 4.4: weather is one per realm: fields and towns of a stage share it and the tag shows it
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const r=await ev(()=>{const A=__A,G=A.G,o={};G.weather[0]='rain';
  const f=A.getMap('f0');A.placeAt('f0',3,f.sy||5,'r');o.f=document.getElementById('wkw')?(A.wkwUpdate(),document.getElementById('wkw').innerText):'';
  const [x,y]=A.innSpot(0);A.placeAt('t0',x,y,'d');A.wkwUpdate();o.t=document.getElementById('wkw').innerText;o.w=G.weather[0];
  delete G.weather[0];A.placeAt('t0',x,y,'d');o.rolled=G.weather[0]!=null;return o;});
console.log(JSON.stringify(r));
chk('4.4 the weather in town is the realm weather (rain stays rain)',r.w==='rain'&&/rain/i.test(r.t)&&/rain/i.test(r.f));
chk('4.4 arriving in a town rolls the realm weather if none yet',r.rolled===true);
await done(H);})();
