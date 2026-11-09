// ===== portrait10.js (v0.15.5): party portraits are a front-view bust, not a crop of the side sprite =====
// The owner after 0.15.4: "Some faces on the sprites look weird since the resizing, coloring can be off too." The .port boxes (party
// cards, battle cards, the command head) showed the side-view walker enlarged 2.3x and cropped by CSS to where the head used to be.
// Since the six-head rig (0.14.9) the head is bigger and sits lower, so the crop cut the face at the chin and showed one huge side eye
// in the iris colour. A portrait is now its own canvas: the full-size front-view walker (the 'big:' key skips the .8 walker scale),
// cropped to a square round the head and shoulders (hat included) and drawn into the box edge to edge. The image is cached per hero
// and look (gear changes the look key), the HD paint is kept at its own detail, nothing else about the sprites changes.
const PT10={size:24,top:1};
function portraitCanvas(id){const t=TPL[id],L=heroLook(id);if(!t||!L||t.mon)return null;
  const c=walkerCanvas('big:pt10:'+id+lookKey(id),L,t.el,id,'front',0);if(!c||!c.width)return null;
  const k=(c._rw||c.width)/c.width,W=c._rw||c.width,H=c._rh||c.height;let d;try{d=c.getContext('2d').getImageData(0,0,W,H).data;}catch(e){return null;}
  // the head: the first rows with paint; its centre from the widest of the first 6 painted rows (a hat brim or hair counts)
  let top=-1,cx=0;for(let y=0;y<H&&top<0;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>40){top=y;break;}
  if(top<0)return null;let best=0;for(let y=top;y<Math.min(H,top+8*k);y++){let x0=-1,x1=-1;for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>40){if(x0<0)x0=x;x1=x;}if(x1-x0>best){best=x1-x0;cx=(x0+x1)/2;}}
  const S=PT10.size*k,sx=Math.round(Math.max(0,Math.min(W-S,cx-S/2))),sy=Math.round(Math.max(0,top-PT10.top*k));
  const o=mkCv(S,S),x=o.getContext('2d');x.imageSmoothingEnabled=false;const hh=Math.min(S,H-sy);x.drawImage(c,sx/k,sy/k,S/k,hh/k,0,0,S,hh);/* an HD canvas's drawImage takes source coordinates in logical px (sprhd.js) */return o;}
function portraitURL(id){try{if(TPL[id]&&TPL[id].mon)return heroURL(id);return cvURL('pt10:'+id+lookKey(id),()=>portraitCanvas(id)||heroCanvas(id));}catch(e){return heroURL(id);}}
