// v0.17.1 walk pass (art.js rigSide / rigFB, walkanim10.js retired): every hero's stride is visible in every view, at the battle scale (1) and the overworld walker scale (.8).
// For every hero in TPL: frames differ pairwise within a view (front 0-2, back 0-2, side 0-1), the lowest painted row is the same in every frame (the feet row),
// both boots have pixels in every frame (front and back: one in each half; side: boot cells spread over at least 5 columns), the palette has a boot colour
// (heroPal used to leave B undefined for some heroes when the hash shifted negative, so their boots vanished), and no frame throws. walkerCanvas is no longer
// post-processed (the old hip split left a transparent row across the body).
// Usage: PWHTML=../../out/aurelis3.html node v154a.js
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:900,h:700});const {ev}=H;
const r=await ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();
 const FR=[['front',0],['front',1],['front',2],['back',0],['back',1],['back',2],['side',0],['side',1]],ids=Object.keys(A.TPL).filter(id=>!A.TPL[id].mon);
 const errs=[],same=[],feet=[],boots=[],nopal=[],canvasBad=[];let n=0;
 const BK={robe:'Bb',light:'Bb',heavy:'MN',monk:'Sew'};
 ids.forEach(id=>{const T=A.TPL[id],L=T.look,bk=BK[L.b]||'Bb';
  try{const p=g('heroPalD')(g('heroPal')(L,T.el,id));if(!p.B||!p.b)nopal.push(id);}catch(e){errs.push(id+' pal '+e.message);}
  [1,.8].forEach(f=>{const rows=[],imgs={};
   FR.forEach(([v,fr])=>{try{const gr=g('rigScale')(f,()=>g('heroGridView')(L,v,fr,id));n++;const W=gr.w,Hh=gr.h;let low=-1;for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const k=gr.a[y*W+x];if(k&&bk.includes(k))low=y;}rows.push(low);/* the feet row: the lowest boot cell (a staff or a hem may reach lower or higher) */
     (imgs[v]=imgs[v]||[]).push(gr.a.join(','));
     const c=W/2;let lo=0,hi=0,minx=99,maxx=-1;for(let y=Math.max(0,low-Math.round(7*f));y<=low;y++)for(let x=0;x<W;x++){const k=gr.a[y*W+x];if(k&&bk.includes(k)){if(x<c)lo++;else hi++;if(x<minx)minx=x;if(x>maxx)maxx=x;}}
     if(v==='side'){if(lo+hi<4||maxx-minx+1<Math.round(5*f))boots.push(id+'@'+f+' '+v+fr+' cells '+(lo+hi)+' span '+(maxx-minx+1));}
     else if(lo<1||hi<1)boots.push(id+'@'+f+' '+v+fr+' '+lo+'/'+hi);
    }catch(e){errs.push(id+'@'+f+' '+v+fr+' '+e.message);}});
   if(rows.some(x=>x!==rows[0]))feet.push(id+'@'+f+' '+rows.join(','));
   Object.keys(imgs).forEach(v=>{const a=imgs[v];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]===a[j])same.push(id+'@'+f+' '+v+i+'='+v+j);});});
  try{FR.forEach(([v,fr])=>{const c=g('walkerCanvas')('v154:'+id,L,T.el,id,v,fr);if(!c||!c.width)canvasBad.push(id+v+fr);});}catch(e){errs.push(id+' canvas '+e.message);}
 });
 return {n,heroes:ids.length,errs:errs.slice(0,6),ne:errs.length,same:same.slice(0,6),ns:same.length,feet:feet.slice(0,6),nf:feet.length,boots:boots.slice(0,6),nb:boots.length,nopal,canvasBad:canvasBad.slice(0,4)};});
console.log(JSON.stringify(r));
chk('every hero builds all 8 frames at scales 1 and .8 without an exception ('+r.heroes+' heroes, '+r.n+' grids)',r.ne===0&&r.canvasBad.length===0||JSON.stringify([r.errs,r.canvasBad]));
chk('frames differ pairwise within a view (front 0-2, back 0-2, side 0-1)',r.ns===0||r.ns+' '+JSON.stringify(r.same));
chk('the lowest boot row (the feet row) is the same in all 8 frames of a hero',r.nf===0||r.nf+' '+JSON.stringify(r.feet));
chk('both boots have pixels in every frame',r.nb===0||r.nb+' '+JSON.stringify(r.boots));
chk('every hero palette has boot colours (B and b)',r.nopal.length===0||JSON.stringify(r.nopal));
await done(H);})();
