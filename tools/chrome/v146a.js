// v0.15.6 props pass: every world prop (objCanvas kinds in worldgfx.js, obj2 kinds in worldgfx2.js) builds in every base theme without an exception, keeps its
// canvas size (SIZES, recorded on the build before the pass), and is shaded (at least MINC distinct opaque colours, so a flat fill fails). The fence is drawn by
// fenceDraw and the town landmark props by townDecorActors, so those two are checked by painting them onto a canvas.
// Usage: PWHTML=../../out/aurelis3.html node v146a.js
const {open,chk,done}=require('./pw');
const SIZES={"oc:sign:0":"18x18","oc:sign:1":"18x18","oc:waystone:0":"18x30","oc:waystone:1":"18x30","oc:lamp:0":"12x28","oc:lamp:1":"12x28","oc:brazier:0":"16x20","oc:brazier:1":"16x20","oc:barrel:0":"14x16","oc:barrel:1":"14x16","oc:crate:0":"16x15","oc:crate:1":"16x15","oc:hay:0":"18x14","oc:hay:1":"18x14","oc:cart:0":"20x16","oc:cart:1":"20x16","oc:stall:0":"18x26","oc:stall:1":"18x26","oc:stall:2":"18x26","oc:stall:3":"18x26","oc:stall:4":"18x26","oc:stall:5":"18x26","oc:banner:0":"14x32","oc:banner:1":"14x32","oc:banner:2":"14x32","oc:banner:3":"14x32","oc:banner:4":"14x32","oc:banner:5":"14x32","oc:anvil:0":"18x14","oc:anvil:1":"18x14","oc:fountain:0":"34x32","oc:fountain:1":"34x32","oc:grave:0":"14x18","oc:grave:1":"14x18","oc:standing:0":"14x28","oc:standing:1":"14x28","oc:ruinwall:0":"18x24","oc:ruinwall:1":"18x24","oc:pillar:0":"14x30","oc:pillar:1":"14x30","oc:tent:0":"22x20","oc:tent:1":"22x20","oc:tent:2":"22x20","oc:fence:0":"18x16","oc:fence:1":"18x16","oc:tower:0":"24x36","oc:tower:1":"24x36","oc:rock:0":"18x16","oc:rock:1":"18x16","oc:bush:0":"18x16","oc:bush:1":"18x16","oc:chest:0":"18x16","oc:chest:1":"18x16","o2:board:0":"22x24","o2:boat:0":"28x16","o2:boat:1":"28x16","o2:boat:2":"28x16","o2:gate:0":"18x32","o2:keychest:0":"18x16","o2:lever:0":"14x16","o2:lever:1":"14x16","o2:bars:0":"18x24","o2:door:0":"18x24","o2:facade:0":"54x46","o2:cavemouth:0":"40x30","o2:lighthouse:0":"50x98"};
// minimum distinct colours per kind (the build before the pass had 7 to 21 on most of these (3 for the fence); the shaded ones have 16 to 48)
const MINC={barrel:22,crate:14,hay:15,cart:24,stall:40,banner:18,anvil:15,fountain:20,lamp:16,brazier:18,sign:16,waystone:20,grave:18,standing:14,ruinwall:16,pillar:16,tent:26,tower:32,rock:13,board:20,boat:20,gate:20,lighthouse:26};
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false}}));`;
(async()=>{const H=await open({w:430,h:800,mobile:true,pre:PRE});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(250);
const r=await ev(([SIZES,MINC])=>{const g=__A.TW.get,oc=g('objCanvas'),o2=g('obj2'),TH=['meadow','coast','cave','snow','heights','void'],bad=[],low=[],cnt={};let n=0;
  const colours=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,s=new Set();for(let i=0;i<d.length;i+=4)if(d[i+3]>200)s.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);return s.size;};
  TH.forEach(t=>Object.keys(SIZES).forEach(key=>{const [w,kind,vs]=key.split(':'),v=+vs;let c;
    try{c=(w==='oc'?oc:o2)(t,kind,v);}catch(e){bad.push(t+' '+key+' threw '+e.message);return;}
    n++;if(c.width+'x'+c.height!==SIZES[key])bad.push(t+' '+key+' size '+c.width+'x'+c.height+' != '+SIZES[key]);
    const k=MINC[kind];if(k){const q=colours(c);cnt[kind]=Math.min(cnt[kind]||99,q);if(q<k)low.push(t+' '+key+' '+q+'<'+k);}}));
  // the fence: paint a run of three fence tiles and a lone post on a canvas and count the colours
  let fence=0;try{const m={t:['FFF'.split(''),['...']].map(x=>x),w:3,h:2,kind:'field',theme:'meadow'};const tileAt0=g('tileAt');const cv=document.createElement('canvas');cv.width=48;cv.height=16;const ctx=cv.getContext('2d');
    const fm={w:3,h:1,t:[['F','F','F']],kind:'field',theme:'meadow',s:1};try{g('fenceDraw')(ctx,fm,1,0);}catch(e){bad.push('fenceDraw '+e.message);}
    const d=ctx.getImageData(0,0,48,16).data,s=new Set();for(let i=0;i<d.length;i+=4)if(d[i+3]>200)s.add((d[i]<<16)|(d[i+1]<<8)|d[i+2]);fence=s.size;}catch(e){bad.push('fence '+e.message);}
  return {n,bad:bad.slice(0,8),nb:bad.length,low:low.slice(0,8),nl:low.length,cnt,fence};},[SIZES,MINC]);
console.log(JSON.stringify(r.cnt),'fence colours',r.fence);
chk('every prop kind builds in the six base themes without an exception, canvas sizes unchanged ('+r.n+' canvases)',r.nb===0&&r.n>=390?true:JSON.stringify(r.bad));
chk('every shaded prop has at least its minimum of distinct colours (a flat fill fails)',r.nl===0?true:JSON.stringify(r.low));
chk('a fence tile is shaded (>= 6 colours)',r.fence>=6?true:r.fence);
// the town: landmark props, signs and the board paint in every town without an exception
const t=await ev(()=>{const A=__A,T=A.TW.get,gm=T('getMap'),out={bad:[]};['t0','t1','t2'].forEach(id=>{try{const m=gm(id);const cv=document.createElement('canvas');cv.width=480;cv.height=320;const ctx=cv.getContext('2d');
    const f=T('townDecorActors'),ws=T('WS');const so={m:ws.m,ctx:ws.ctx,vw:ws.vw,vh:ws.vh};ws.m=m;ws.ctx=ctx;ws.vw=480;ws.vh=320;const acts=[];try{f(acts,Date.now(),0,0);acts.forEach(x=>x.draw());}finally{ws.m=so.m;ws.ctx=so.ctx;ws.vw=so.vw;ws.vh=so.vh;}
    out[id]=acts.length;}catch(e){out.bad.push(id+' '+e.message);}});return out;});
console.log(JSON.stringify(t));
chk('town landmark props, signs and the board draw without an exception (towns 1-3)',t.bad.length===0?true:JSON.stringify(t.bad));
await done(H);})();
