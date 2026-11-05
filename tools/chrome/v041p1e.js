// v0.4.1 1.4: signs, props and board labels are y-sorted: a sign never draws over a character
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});
await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
await H.page.waitForFunction(()=>__A.V.screen==='world',{timeout:20000});
const r=await H.ev(()=>{const A=__A,WS=A.WS,m=WS.m;const res={checked:0,bad:[]};
  const inter=(a,b)=>a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3];
  const ctx=WS.ctx;const fr0=ctx.fillRect.bind(ctx),di0=ctx.drawImage.bind(ctx);
  const doors=m.bld.map(b=>({k:b.k,d:b.door}));
  // every service door in this town, plus the front of the quest board
  const spots=doors.map(d=>({what:d.k,x:d.d[0],y:d.d[1]}));
  m.t.forEach((row,y)=>row.forEach((c,x)=>{if(c==='q')spots.push({what:'board',x,y:y+1});}));
  spots.forEach(sp=>{WS.x=sp.x;WS.y=sp.y;WS.px=sp.x*16;WS.py=sp.y*16;WS.cam=null;WS.mv=null;
    const ev=[];let n=0;
    ctx.fillRect=function(x,y,w,h){if(ctx.fillStyle==='#5a3a1e'&&w>20&&h===13)ev.push({t:'sign',i:n,r:[x,y,w,h]});n++;return fr0(x,y,w,h);};
    ctx.drawImage=function(img,x,y,w,h){const iw=w||img.width,ih=h||img.height;if(iw<=40&&ih<=48&&iw>=8)ev.push({t:'char',i:n,r:[x,y,iw,ih]});n++;return di0.apply(ctx,arguments);};
    try{A.worldDraw(performance.now());}finally{ctx.fillRect=fr0;ctx.drawImage=di0;}
    // a sign over a character: sign drawn after a character it overlaps
    ev.filter(e=>e.t==='sign').forEach(s=>{res.checked++;ev.filter(c=>c.t==='char'&&c.i<s.i&&inter(c.r,s.r)).forEach(c=>res.bad.push(sp.what+' sign over a sprite at '+sp.x+','+sp.y));});});
  return res;});
console.log(JSON.stringify(r).slice(0,400));
chk('1.4 signs were examined',r.checked>3);
chk('1.4 no sign draws over a character',r.bad.length===0||JSON.stringify(r.bad).slice(0,300));
await done(H);})();
