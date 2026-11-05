// v0.4.1 1.5b: dungeon, cave and boss battle backdrops are indoors: no clouds / sky motion at any time of day
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(100000);});
const res={};
for(const stage of [0,1,2,3]) for(const kind of ['dungeon','field']){
  const r=await H.ev((p)=>{const A=__A;A.V.modal=null;A.G.stage=p.stage;if(A.B){A.B.over=true;A.B=null;}
    if(!A.startBattle({stage:p.stage,kind:p.kind,weather:'clear'}))return {err:'nostart'};
    const cv=document.getElementById('bcv');const band=t=>{A.B.en.forEach(e=>{e.hp=e.hp});A.battleFrame(t);const c=cv.getContext('2d');const d=c.getImageData(0,0,cv.width,Math.floor(cv.height*.2)).data;let h=0;for(let i=0;i<d.length;i+=4)h=(h*31+d[i]+d[i+1]*3+d[i+2]*7)|0;return h;};
    const a=band(1000),b=band(9000),c=band(15000);return {theme:A.battleTheme(),same:a===b&&b===c};},{stage,kind});
  res[stage+kind]=r;}
console.log(JSON.stringify(res));
for(const [k,r] of Object.entries(res)){if(r.err)continue;
  if(k.endsWith('dungeon'))chk('1.5b '+k+' ('+r.theme+') backdrop is still (no sky motion)',r.same||JSON.stringify(r));}
chk('1.5b meadow field backdrop still animates (sanity)',res['0field'].same===false||JSON.stringify(res['0field']));
await done(H);})();
