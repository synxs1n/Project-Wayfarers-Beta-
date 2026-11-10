// Beta v0.17.x foe sprite sweep (v3/battle11.js resample, art3.js touch-ups): every foe and boss art as the battle stage draws it.
// For each art in MART (MON, guardians, finals, echo_ variants, the Riftkeeper and its elements, summons' small art), spriteOf({side:'e',art})
// is the exact canvas drawUnit blits (battle11's resample after the HD paint), read back at its backing bitmap. Checked at render scales 1, 2
// (backing 2 per logical px: the HD paint's own) and 3 (backing 4), on the low and medium tiers:
//  - no exceptions; the unit box (unitBox) is as big as the canvas;
//  - no clipping: no painted pixel (alpha >= 100) on the left, right or top edge of the canvas (the bottom row may hold the feet);
//  - feet: the lowest painted row is within 2 logical px of the canvas bottom, which drawUnit puts on the stage line (flyers hover on purpose and are exempt);
//  - outline present: the silhouette ring is dark, or differs from the body by 12% (a lighter rim glow);
//  - the resample is integer friendly: one art pixel is a whole number of backing pixels (bitmap width / art size is an integer);
//  - the idle exhale frame (bosses) moves the silhouette by at most 2 logical px.
// Usage: PWHTML=../../out/aurelis3.html node v160a.js     (V160_DUMP=file.json writes the per-art numbers)
const {open,chk,done}=require('./pw');const {META,battle}=require('./v063lib');const fs=require('fs');
const AUDIT=()=>{const A=__A,out=[],now=performance.now(),TW=k=>A.TW.get(k);
 const arts=Object.keys(A.MART);
 const fam=TW('monFam');
 const lum=(d,i)=>.3*d[i]+.59*d[i+1]+.11*d[i+2];
 const scan=c=>{const k=c.hd||1,RW=c._rw||c.width,RH=c._rh||c.height,d=c.getContext('2d').getImageData(0,0,RW,RH).data;return {k,RW,RH,d};};
 const bounds=s=>{const {RW,RH,d}=s;let l=RW,t=RH,r=-1,b=-1;for(let y=0;y<RH;y++)for(let x=0;x<RW;x++)if(d[(y*RW+x)*4+3]>=100){if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;}return {l,t,r,b};};
 arts.forEach(art=>{const o={art};try{
  const u={side:'e',art,hp:1,id:art},sz=A.MON_SIZE(art),c=A.spriteOf(u),s=scan(c),{k,RW,RH,d}=s,bb=bounds(s),K=RW/c.width;
  o.sz=sz;o.w=c.width;o.h=c.height;o.K=K;o.apx=RW/(c._s11?c._s11.W:sz);o.box=A.unitBox({side:'e',art,hp:1,id:art}).w;
  let l=0,r=0,t=0,bt=0;for(let x=0;x<RW;x++){if(d[x*4+3]>=100)t++;if(d[((RH-1)*RW+x)*4+3]>=100)bt++;}
  for(let y=0;y<RH;y++){if(d[(y*RW)*4+3]>=100)l++;if(d[(y*RW+RW-1)*4+3]>=100)r++;}
  o.edge={l,r,t,b:bt};o.gap=(RH-1-bb.b)/K;o.fly=fam(art).includes('flying');
  // outline: ring pixels (painted, with a clear 4 neighbour) against the body two pixels in
  let rs=0,rn=0,bs=0,bn=0;const P=(x,y)=>x<0||y<0||x>=RW||y>=RH?0:d[(y*RW+x)*4+3];
  for(let y=0;y<RH;y++)for(let x=0;x<RW;x++){const i=(y*RW+x)*4;if(d[i+3]<200)continue;const e=P(x-1,y)<30||P(x+1,y)<30||P(x,y-1)<30||P(x,y+1)<30;
    if(e){rs+=lum(d,i);rn++;}else if(P(x-2,y)>=200&&P(x+2,y)>=200&&P(x,y-2)>=200&&P(x,y+2)>=200&&P(x-1,y-1)>=200&&P(x+1,y+1)>=200){bs+=lum(d,i);bn++;}}
  o.ring=rn?rs/rn:0;o.body=bn?bs/bn:0;o.rn=rn;
  if(TW('bossHasIdle')(u)){const F=TW('FS11'),was=F.on;F.on=1;let f1;try{f1=TW('bossFrame1')(c);}finally{F.on=was;}const b0=bounds(s),b1=bounds(scan(f1));const lm=c=>{const d=c.getContext('2d').getImageData(0,0,c._rw||c.width,c._rh||c.height).data;let q=0,n=0;for(let i=0;i<d.length;i+=4)if(d[i+3]>200){q+=lum(d,i);n++;}return n?q/n:0;};o.dl=lm(f1)-lm(c);o.pop=Math.max(Math.abs(b0.l-b1.l),Math.abs(b0.r-b1.r),Math.abs(b0.t-b1.t),Math.abs(b0.b-b1.b))/K;}
 }catch(e){o.err=String(e&&e.message||e);}out.push(o);});
 return out;};
(async()=>{
 const rows=[];
 for(const [gfx,render] of [['low','1'],['low','2'],['medium','1'],['medium','2'],['medium','3']]){
  const tag=`${gfx} px${render}`,H=await open({w:1000,h:600,pre:META(gfx,{render})});
  await battle(H,{boss:true,stage:2,foes:2});
  const K=await H.ev(()=>{const c=document.getElementById('bcv');return c&&c._ss||0;});
  const r=await H.ev(AUDIT);rows.push({tag,K,r});
  const bad=(f)=>r.filter(f).map(o=>o.art+(o.err?'('+o.err+')':'')).slice(0,12).join(',');
  const n=r.length;console.log(tag,'layer K',K,n,'arts');
  chk(`${tag}: ${n} arts, no exceptions`,r.every(o=>!o.err)&&n>=250||bad(o=>o.err));
  chk(`${tag}: no clipping (no painted pixel on the left, right or top canvas edge)`,r.every(o=>o.err||!(o.edge.l||o.edge.r||o.edge.t))||bad(o=>o.edge&&(o.edge.l||o.edge.r||o.edge.t)));
  chk(`${tag}: feet row within 2 px of the stage line (flyers exempt)`,r.every(o=>o.err||o.fly||(o.gap>=0&&o.gap<=2))||bad(o=>!o.err&&!o.fly&&!(o.gap>=0&&o.gap<=2)));
  chk(`${tag}: outline present (the silhouette ring is darker, or deliberately lighter as a rim glow, than the body)`,r.every(o=>o.err||!o.rn||Math.abs(o.ring-o.body)>=o.body*.12||o.ring<80)||bad(o=>!o.err&&o.rn&&!(Math.abs(o.ring-o.body)>=o.body*.12||o.ring<80)));
  chk(`${tag}: unit box as big as the canvas`,r.every(o=>o.err||o.box===o.w)||bad(o=>!o.err&&o.box!==o.w));
  chk(`${tag}: integer friendly resample (an art pixel is a whole number of backing pixels)`,r.every(o=>o.err||Math.abs(o.apx-Math.round(o.apx))<.02)||bad(o=>!o.err&&Math.abs(o.apx-Math.round(o.apx))>=.02));
  chk(`${tag}: idle exhale moves the silhouette by at most 2 px (art frame B poses, which the guardians' base art animates, are exempt)`,r.every(o=>o.err||o.pop==null||o.pop<=2||/^(echo_)?drake$|^mb_|hollowking/.test(o.art))||bad(o=>o.pop>2&&!/^(echo_)?drake$|^mb_|hollowking/.test(o.art)));
  chk(`${tag}: idle exhale frame is at most 16 luma brighter (no flash; the Hollow Sun flame frame is exempt)`,r.every(o=>o.err||o.dl==null||o.dl<=16||/hollowsun/.test(o.art))||bad(o=>o.dl>16&&!/hollowsun/.test(o.art)));
  await H.browser.close();}
 if(process.env.V160_DUMP)fs.writeFileSync(process.env.V160_DUMP,JSON.stringify(rows));
 const H=await open({});await done(H);})();
