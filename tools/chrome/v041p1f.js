// v0.4.1 1.5: dungeons, caves, the Archive and the Echo Sanctum ignore clouds, weather and day/night tint (pixel identical at any hour / weather)
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
await H.page.waitForFunction(()=>__A.V.screen==='world',{timeout:20000});
const r=await H.ev(()=>{const A=__A,G=A.G,WS=A.WS;const out=[];
  let cave=null;for(let q=0;q<4&&!cave;q++){const f=A.getMap('f'+q);cave=(f.caves||[])[0];}
  const ids=['d0','a0','s0'].concat(cave?[cave.id]:[]);
  for(const id of ids){
    let m;try{m=A.getMap(id);}catch(e){out.push({id,err:String(e)});continue;}
    const st=m.start||[3,3];A.placeAt(id,st[0],st[1]+1,'d');A.V.modal=null;
    const shots=[];
    for(const [clock,wx] of [[A.CLK_LEN*0.30,'clear'],[A.CLK_LEN*0.93,'rain'],[A.CLK_LEN*0.70,'storm'],[A.CLK_LEN*0.02,'fog']]){
      G.clock=clock;G.weather=G.weather||{};for(let s=0;s<6;s++)G.weather[s]=wx;WS.cam=null;
      A.worldDraw(1000);{const u=WS.cv.toDataURL();let h=0;for(let i=0;i<u.length;i++)h=(h*31+u.charCodeAt(i))|0;shots.push(u.length+':'+h);}}
    out.push({id,kind:m.kind,cave:!!m.cave,same:shots.every(s=>s===shots[0])});}
  return out;});
console.log(JSON.stringify(r));
r.forEach(o=>chk('1.5 '+o.id+' ('+o.kind+') looks the same at any hour and weather',o.same===true||JSON.stringify(o)));
await done(H);})();
