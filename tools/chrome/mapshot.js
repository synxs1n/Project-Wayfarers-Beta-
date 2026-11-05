const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:900,h:600,mobile:false,out:'/tmp'});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();});
await H.wait(500);
const r=await H.ev(()=>{const A=__A;A.seenOf(A.WS.m).fill(255);A.MAPCV.dirty=1;A.drawMini();const k=A.mapMarks(A.WS.m).map(o=>o.k+(o.svc?':'+o.svc:'')).join(',');A.ACT.map();return k;});
console.log(r);await H.wait(500);await H.page.screenshot({path:'/tmp/map_full.png'});
const n=await H.ev(()=>document.querySelectorAll('canvas.lgi').length);chk('legend icons drawn',n>=6||n);
await H.ev(()=>{__A.ACT.map();});await H.wait(300);await H.page.screenshot({path:'/tmp/map_mini.png'});
await done(H);})();
