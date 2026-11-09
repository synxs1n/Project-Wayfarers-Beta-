// ===== anim10.js (v0.14.1): animations that say what the skill did =====
// The owner: "Some animations don't fit their names... Characters should spin when using physical attacks that hit all, add other effects
// like this." 1) A hero's all-foe physical skill spins the sprite through a full turn during the action. 2) Big spells (every-foe or power
// 1.8 and up) get a wide show: rays from the caster, a ring and element flourish on every target (lightning bolts, wind slashes, fire rays,
// water and ice rings) and a screen shake at impact; party-wide heals and buffs put a ring and rising motes on every ally; songs ring
// three times around the bard. Reduced motion keeps the old quiet effects. Runs after heropose9.js (it reads u.actSk recorded there).
const ANIM10={spinMs:[60,420],bigPw:1.8};
function a10Rot(c,deg){const w=c.width,h=c.height,o=document.createElement('canvas');o.width=w;o.height=h;const x=o.getContext('2d');x.imageSmoothingEnabled=false;x.translate(w/2,h/2);x.rotate(deg*Math.PI/180);x.drawImage(c,-w/2,-h/2);return o;}
{const so=spriteOf;spriteOf=function(u,walk){const c=so.apply(this,arguments);try{if(!c||!u||u.side!=='p'||!B||B.wipe||u.hp<=0||u.heroArt||gfxStill())return c;const a=Date.now()-(u.actT||0),sk=u.actSk;
  if(!sk||Math.abs((u.actSkT||0)-u.actT)>80||a<ANIM10.spinMs[0]||a>ANIM10.spinMs[1])return c;if(!(sk.k==='phys'&&(sk.t==='all'||sk.t==='rand')&&sk.id!=='attack'))return c;
  const q=(a-ANIM10.spinMs[0])/(ANIM10.spinMs[1]-ANIM10.spinMs[0]),step=Math.round(q*12)%12;if(!step)return c;return a10Rot(c,step*30);}catch(e){return c;}};}
{const oa0=onAction;onAction=function(a,now){oa0.apply(this,arguments);try{if(!B||gfxStill()||a.side!=='p')return;const sk=a.actSk;if(!sk||Math.abs((a.actSkT||0)-a.actT)>80)return;const c=centerOf(a);if(!c)return;
  const el=skEls(sk)[0]||null,col=(el&&ELC[el])||(sk.k==='heal'?'#7aff8a':'#c8a0ff'),foes=B.en.filter(e=>e.hp>0),allies=B.front.filter(x=>x.hp>0);
  const big=sk.k==='mag'&&(sk.t==='all'||(sk.pw||0)>=ANIM10.bigPw);
  if(big){part({k:'rays',x:c.x,y:c.y-10,t0:now,life:500,col});const tg=sk.t==='all'?foes:foes.filter(e=>e.fxT&&Math.abs(e.fxT-a.actT)<60);
    tg.forEach((e,i)=>{const d=centerOf(e);if(!d)return;part({k:'ring',x:d.x,y:d.y+6,t0:now+IMPACT-40,life:520,col,r:sk.t==='all'?46:34,flat:el==='water'||el==='ice'});
      if(el==='lightning')part({k:'bolt',x:d.x,y:d.y+8,t0:now+IMPACT-60,life:260,col,seed:i*31});else if(el==='wind')part({k:'slash',x:d.x,y:d.y,t0:now+IMPACT-30,life:260,col});
      else if(el==='fire'||el==='light')part({k:'rays',x:d.x,y:d.y,t0:now+IMPACT-20,life:420,col});else part({k:'orb',x:c.x,y:c.y-14,x2:d.x,y2:d.y-8,t0:now+60,life:IMPACT-60,col});});
    BV.shake={t:now+IMPACT,life:sk.t==='all'?240:180,amp:sk.t==='all'?3:2};}
  if((sk.k==='heal'||sk.k==='status')&&(sk.t==='allyAll'||sk.t==='all'&&sk.k==='heal')){allies.forEach(h=>{const d=centerOf(h);if(!d)return;part({k:'ring',x:d.x,y:d.y+8,t0:now+120,life:560,col,r:30,flat:1});
      for(let i=0;i<5;i++)part({k:'p',x:d.x+(Math.random()-.5)*20,y:d.y+10,vx:(Math.random()-.5)*6,vy:-18-Math.random()*22,g:0,t0:now+80+i*40,life:600,col,sz:1});});}
  if(/song|hymn|chant|ballad|allegro|tune/i.test(sk.id+' '+(sk.n||''))){for(let i=0;i<3;i++)part({k:'ring',x:c.x,y:c.y-6,t0:now+i*130,life:520,col,r:40+i*8});}
  if(sk.k==='phys'&&(sk.t==='all'||sk.t==='rand')&&sk.id!=='attack'){part({k:'ring',x:c.x,y:c.y+10,t0:now+60,life:380,col:'#ffffff',r:28,flat:1});foes.forEach(e=>{const d=centerOf(e);if(d)part({k:'slash',x:d.x,y:d.y,t0:now+IMPACT-20,life:220,col:'#ffffff'});});}
}catch(e){}};}
