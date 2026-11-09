// ===== scale10.js (v0.15.1): battle heroes a little smaller, overworld walkers a little bigger =====
// The owner after 0.15.0: "Sprites of heroes still look a little big in battle, also the small overworld sprites seem to have lost too much
// detail." The rig draws at any scale (art.js rigScale): battle sprites are now drawn at .85 (34x48, about 38 px of figure, level with the
// taller foes), walkers at .8 (sprhd.js, 32x45, about 35 px) instead of .7. Portraits, the Bestiary and the title scene keep the full rig.
// spriteOf (battle) sets a flag for the duration of its call, so every canvas built inside it (idle, poses, hit frames) comes out at .85.
const SC10={battle:.9};/* v0.15.6: .9 (36x50), the middle between the full rig (too tall) and .85 */const HB10={on:0};
{const hc0=heroCanvas;heroCanvas=function(id,walk){if(HB10.on&&HRS.f===1)return rigScale(SC10.battle,()=>hc0.call(this,id,walk));return hc0.apply(this,arguments);};}
{const so0=spriteOf;spriteOf=function(u,walk){const was=HB10.on;HB10.on=1;try{return so0.apply(this,arguments);}finally{HB10.on=was;}};}
