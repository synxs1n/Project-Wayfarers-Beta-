// ===== walkanim10.js (v0.15.8): a visible walk when heading north or south =====
// The owner after 0.15.7: "when walking south or north, there is no walking animation anymore." The six-head rig's front and back
// stride frames only move the feet a pixel, and under a robe or a long coat that is invisible. The side view swings arms and legs,
// so it reads. This wraps walkerCanvas (outermost, so it sees the finished frame at any scale): for the front and back views, stride
// frames 1 and 2 get the classic three-frame feel: the body above the hips sways one pixel (left on frame 1, right on frame 2) and
// the whole figure bobs up one pixel. Frame 0 (standing) and frame 3 (idle breathe, npcart9) are untouched, the canvas size is the
// same, so anchoring in both views and the HD atlas are unaffected. HD canvases (sprhd) are rebuilt as HD canvases at the same detail.
const WA10={sway:1,bob:1,hip:.6};
{const wc0=walkerCanvas;walkerCanvas=function(key,L,els,id,view,frame){const c=wc0.apply(this,arguments);
  try{if(!c||!c.width||(id&&TPL[id]&&TPL[id].mon))return c;
    // v0.16.7: the side stride frame bobs up a pixel too, so a hero whose side stride is subtle no longer glides left or right
    if(view==='side'){if(frame!==1)return c;const ck='wa10s:'+(typeof key==='string'?key:'')+':'+c.width+'x'+c.height;if(IMG[ck])return IMG[ck];const k=c.hd||1,W=c.width,H=c.height,o=k>1?hdCv(W,H,k):mkCv(W,H),x=o.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(c,0,0,W,H,0,-WA10.bob,W,H);return IMG[ck]=o;}
    if((view!=='front'&&view!=='back')||(frame!==1&&frame!==2))return c;
    const ck='wa10:'+(typeof key==='string'?key:'')+':'+view+':'+frame+':'+c.width+'x'+c.height;if(IMG[ck])return IMG[ck];
    const k=c.hd||1,W=c.width,H=c.height,o=k>1?hdCv(W,H,k):mkCv(W,H),x=o.getContext('2d');x.imageSmoothingEnabled=false;
    const hip=Math.round(H*WA10.hip),dx=(frame===1?-1:1)*WA10.sway,dy=-WA10.bob;
    // sprhd's drawImage takes source coordinates in logical px for an HD canvas
    x.drawImage(c,0,hip,W,H-hip,0,hip,W,H-hip);           // legs and feet as the rig drew them (they already stride)
    x.drawImage(c,0,0,W,hip,dx,dy,W,hip);                 // the body sways and bobs
    return IMG[ck]=o;}catch(e){return c;}};}
