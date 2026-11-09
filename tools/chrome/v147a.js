// v0.15.9 side-view heroes (art.js rigSide): a three-quarter profile (brow, nose, lip, chin, near eye with sclera and catchlight, far eye hinted, ear), broader
// shoulders with the far side of the chest shaded, hats that keep their shape. Every hero id in TPL builds a battle canvas and a side walker without an exception
// at rig scales 1, .9 and .8; the canvas size is unchanged; the sprite is at least 12 logical px wide across the shoulders; the head region has enough distinct
// colours including the skin tone and (unless a full helm hides the face) an iris colour.
// Usage: PWHTML=../../out/aurelis3.html node v147a.js
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:900,h:700});const {ev}=H;
const r=await ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();
 const ids=Object.keys(A.TPL),errs=[],size=[],narrow=[],lowc=[],noskin=[],noiris=[],walkBad=[];
 const SK=['#f6d1b0','#efc29a','#d9a074','#b07850','#7e4e30','#5a3620'],IR=['#3a5aa0','#6a4428','#2e7058','#7a5a2a','#5a3a8a','#2a6a8a'];
 const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),near=(p,c,t)=>Math.abs(p[0]-c[0])+Math.abs(p[1]-c[1])+Math.abs(p[2]-c[2])<=t;
 let minC=999,minW=99;
 ids.forEach(id=>{const T=A.TPL[id],L=T.look;
  [1,.9,.8].forEach(f=>{try{const gr=g('rigScale')(f,()=>g('heroGridView')(L,'side',0,id));
    if(gr.w!==(f===1?40:Math.round(40*f))||gr.h!==(f===1?56:Math.round(56*f)))size.push(id+'@'+f+':'+gr.w+'x'+gr.h);
    if(f===1){let w=0;for(let y=19;y<=23;y++){let a=-1,b=-1;for(let x=0;x<gr.w;x++)if(gr.a[y*gr.w+x]){if(a<0)a=x;b=x;}w=Math.max(w,b-a+1);}const need=L.size==='small'?10:12;/* small heroes have rows cut out (art2.js) and a narrower torso */if(L.size!=='small'&&w<minW)minW=w;if(w<need)narrow.push(id+':'+w);}
  }catch(e){errs.push(id+'@'+f+' '+e.message);}});
  try{const HB=g('HB10');HB.on=1;const c=g('heroCanvas')(id);HB.on=0;const W=c._rw||c.width,Hh=c._rh||c.height;
   const sc=document.createElement('canvas');sc.width=W;sc.height=Hh;const x=sc.getContext('2d');x.drawImage(c,0,0,c.width,c.height,0,0,W,Hh);
   const all=x.getImageData(0,0,W,Hh).data;let bt=Hh,bb=0;for(let yy=0;yy<Hh;yy++)for(let xx=0;xx<W;xx++)if(all[(yy*W+xx)*4+3]>40){if(yy<bt)bt=yy;bb=yy;}/* the head is the top third of the painted rows (small heroes sit lower in the canvas) */
   const x0=0,x1=W,y0=bt,y1=bt+Math.round((bb-bt+1)*.34),d=x.getImageData(x0,y0,x1-x0,y1-y0).data,seen=new Set();let skin=0,iris=0;
   const sk=rgb(SK[L.sk||0]),ir=IR.map(rgb).concat([rgb(L.pal&&L.pal.E||'#1a1020')]);
   for(let i=0;i<d.length;i+=4){if(d[i+3]<200)continue;const p=[d[i],d[i+1],d[i+2]];seen.add(p.join(','));if(near(p,sk,60))skin++;if(ir.some(q=>near(p,q,45)))iris++;}
   const full=L.hat==='greathelm';
   if(seen.size<minC)minC=seen.size;if(seen.size<14)lowc.push(id+':'+seen.size);
   if(!full&&!(L.skin)&&skin<3)noskin.push(id+':'+skin);if(!full&&iris<2)noiris.push(id+':'+iris);
  }catch(e){errs.push(id+' battle '+e.message);}
  try{[0,1].forEach(fr=>{const wc=g('walkerCanvas')('npc:t',L,T.el,id,'side',fr);if(!wc||!wc.width)walkBad.push(id);});}catch(e){errs.push(id+' walker '+e.message);}
 });
 return {n:ids.length,errs,size,narrow,lowc,noskin,noiris,walkBad,minC,minW};});
console.log(JSON.stringify(r));
chk('every hero builds the side grid, battle canvas and side walker without an exception at scales 1, .9, .8 ('+r.n+' heroes)',r.errs.length===0&&r.walkBad.length===0||JSON.stringify([r.errs.slice(0,4),r.walkBad]));
chk('the rig canvas size is unchanged (40x56, 36x50 at .9, 32x45 at .8)',r.size.length===0||JSON.stringify(r.size.slice(0,4)));
chk('the sprite is at least 12 logical px wide across the shoulders at scale 1 (10 for the small size; min '+r.minW+')',r.narrow.length===0||JSON.stringify(r.narrow));
chk('the head region has at least 14 distinct colours (min '+r.minC+')',r.lowc.length===0||JSON.stringify(r.lowc));
chk('the head shows the skin tone',r.noskin.length===0||JSON.stringify(r.noskin));
chk('the head shows an iris colour (full helms excepted)',r.noiris.length===0||JSON.stringify(r.noiris));
await done(H);})();
