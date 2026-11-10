// ===== anim10.js (v0.14.1, v0.17.7): animations that say what the skill did =====
// The owner: "Some animations don't fit their names... Characters should spin when using physical attacks that hit all, add other effects
// like this." 1) A hero's all-foe physical skill spins the sprite through a full turn during the action. 2) Big spells (every-foe or power
// 1.8 and up) get a wide show: rays from the caster, a ring and element flourish on every target (lightning bolts, wind slashes, fire rays,
// water and ice rings) and a screen shake at impact; party-wide heals and buffs put a ring and rising motes on every ally; songs ring
// three times around the bard. Reduced motion keeps the old quiet effects. Runs after heropose9.js (it reads u.actSk recorded there).
const ANIM10={spinMs:[60,420],bigPw:1.8};
function a10Rot(c,deg){const w=c.width,h=c.height,o=document.createElement('canvas');o.width=w;o.height=h;const x=o.getContext('2d');x.imageSmoothingEnabled=false;x.translate(w/2,h/2);x.rotate(deg*Math.PI/180);x.drawImage(c,-w/2,-h/2);return o;}
{const so=spriteOf;spriteOf=function(u,walk){const c=so.apply(this,arguments);try{if(!c||!u||u.side!=='p'||!B||B.wipe||u.hp<=0||u.heroArt||gfxStill())return c;const a=Date.now()-(u.actT||0),sk=u.actSk;
  if(!sk||Math.abs((u.actSkT||0)-u.actT)>80||a<ANIM10.spinMs[0]||a>ANIM10.spinMs[1])return c;if(!(sk.k==='phys'&&(sk.t==='all'||sk.t==='rand')&&sk.id!=='attack'))return c;if(typeof fk11Info==='function'){const I=fk11Info(u,sk,u.actDl);if(I&&I.k!=='slash')return c;}
  const q=(a-ANIM10.spinMs[0])/(ANIM10.spinMs[1]-ANIM10.spinMs[0]),step=Math.round(q*12)%12;if(!step)return c;return a10Rot(c,step*30);}catch(e){return c;}};}
// v0.17.7: the big-spell show, the party rings, the song rings and the all-foe slash are drawn per kind by fxkind11.js (fkAct / fk11Hit); only the spin stays here, and only for a slash
