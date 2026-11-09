// ===== worldzoom10.js (v0.15.3): the HD-2D world a fifth bigger, the people in it the same size on screen =====
// The owner after 0.15.2: characters look right in battle and read well in the overworld, but are still a bit big next to the doors
// and tents. Instead of shrinking the walkers again (that lost detail at .7), the HD-2D camera moves in by WZ10.k, so tiles,
// houses and trees take up more of the screen, and every character card (hero, townsfolk, roamers, legends, the rival's ghost)
// is placed in the world at 1/k of its old size. On screen a character is as tall as before; the door beside him is a fifth taller.
// The cards are also sampled at two texels per art pixel (hdSmall's px), so the smaller card keeps the detail of the HD paint.
// Only the HD-2D view changes. The Flat (2D) view keeps its integer pixel grid and its walker scale from scale10/sprhd.
// v0.15.6: the owner found the zoomed world worse than before ("World resizing may have been a mistake"): k is back to 1. The two-texel
// character sampling stays, it is pure detail.
const WZ10={k:1,px:2};
HD2D.zoom=HD2D.zoom*WZ10.k;
{const hc0=hdChar;hdChar=function(bt,cv,fx,fy,fz,flip,a,fl,sc){
  if(sc!=null)return hc0.apply(this,arguments);
  const p0=HD.px;HD.px=(p0||1)*WZ10.px;
  try{return hc0.call(this,bt,cv,fx,fy,fz,flip,a,fl,HD2D.spr.sc/WZ10.k);}finally{HD.px=p0;}};}
