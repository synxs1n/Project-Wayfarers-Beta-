// ===== anim.js (v0.3.2): battle animation poses and effects =====
// Battle first. Every pose fits the old 520ms action window and lands its strike before the hit (IMPACT), so turns are
// no slower at 1x; at higher speeds the recovery is cut short. With reduced motion, poses become simple flashes.
const ANIM_CLS={warrior:'swing',knight:'thrust',monk:'jab',thief:'dash',archer:'bow',druid:'bow',sniper:'crossbow',mage:'cast',archmage:'cast',chronicler:'cast',healer:'channel',bard:'play'};
function animStyle(u){if(u.side!=='p'||u.isComp)return 'foe';const t=TPL[u.id];return (t&&ANIM_CLS[t.cls])||'swing';}
const ease=q=>q<0?0:q>1?1:q*q*(3-2*q);
// returns the sprite offset for this moment of the action; a is ms since the action began
function animPose(u,a,dir,b){if(gfxStill())return {dx:0,dy:0};const sp=META.cfg.speed||1,k=u.actKind,st=animStyle(u);
  const rec=(t0,len)=>1-ease((a-t0)/(len/Math.max(1,sp*.8)));// recovery shrinks at higher speeds
  if(u.actLimit&&Date.now()-u.actLimit<700){const q=a/520;return {dx:0,dy:-Math.round(6*Math.sin(Math.min(1,q)*Math.PI))};}
  if(k==='phys'||(st==='foe'&&k!=='mag'&&k!=='heal'&&k!=='buff'&&k!=='status')){
    if(st==='swing'){if(a<110)return {dx:-Math.round(3*ease(a/110))*dir,dy:-1};if(a<170)return {dx:Math.round(-3+25*ease((a-110)/60))*dir,walk:true};return {dx:Math.round(22*rec(170,350))*dir,walk:a>300&&Math.floor(a/80)%2===0};}
    if(st==='thrust'){if(a<110)return {dx:-Math.round(4*ease(a/110))*dir};if(a<150)return {dx:Math.round(-4+30*ease((a-110)/40))*dir};return {dx:Math.round(26*rec(150,370))*dir};}
    if(st==='jab'){if(a<100)return {dx:Math.round(18*ease(a/100))*dir,walk:true};if(a<300)return {dx:Math.round(18+((Math.floor((a-100)/45)%2)?4:-1))*dir};return {dx:Math.round(18*rec(300,220))*dir};}
    if(st==='dash'){if(a<60)return {dx:-Math.round(2*ease(a/60))*dir};if(a<130)return {dx:Math.round(34*ease((a-60)/70))*dir,walk:true};return {dx:Math.round(34*rec(130,300))*dir,walk:a<260};}
    if(st==='bow'||st==='crossbow'){const kick=st==='crossbow'?3:2,bob=u.id==='kaevan'?Math.round(Math.sin(a/60)*1.5):0;
      if(a<130)return {dx:-Math.round(3*ease(a/130))*dir,dy:bob};if(a<200)return {dx:-Math.round(3+kick*(1-ease((a-130)/70)))*dir,dy:bob};return {dx:-Math.round(3*rec(200,320))*dir,dy:bob};}
    if(st==='play'){return {dx:0,dy:-Math.round(Math.abs(Math.sin(a/90))*2)};}
    if(st==='foe'){if(a<120)return {dx:-Math.round(4*ease(a/120))*dir,dy:1};if(a<170)return {dx:Math.round(-4+28*ease((a-120)/50))*dir};return {dx:Math.round(24*rec(170,350))*dir};}
    return null;}
  // spells, heals, buffs: raise and charge, then settle
  if(st==='channel'||k==='heal')return {dx:0,dy:-Math.round(2*Math.sin(Math.min(1,a/520)*Math.PI))};
  if(st==='play')return {dx:0,dy:-Math.round(Math.abs(Math.sin(a/90))*2)};
  return {dx:Math.round(Math.sin(Math.min(1,a/520)*Math.PI)*2)*dir,dy:-Math.round(3*Math.sin(Math.min(1,a/400)*Math.PI))};}
// ----- effects that go with each pose -----
function arcSlash(x,y,dir,col,start){for(let i=0;i<9;i++){const t=-.9+i*.22;part({k:'p',x:x+Math.cos(t)*12*dir,y:y+Math.sin(t)*12,vx:dir*20,vy:0,g:0,t0:start+i*8,life:170,col:i%3?col:'#ffffff',sz:2});}}
function streak(x,y,dir,col,start,n){for(let i=0;i<(n||5);i++)part({k:'p',x:x-dir*(4+i*5),y:y+(Math.random()-.5)*6,vx:-dir*40,vy:0,g:0,t0:start+i*10,life:160,col,sz:1});}
function projectile(x,y,x2,y2,col,start,life,thick){part({k:'shot',x,y,x2,y2,t0:start,life,col,thick});}
function notes(x,y,start){for(let i=0;i<3;i++)part({k:'note',x:x+(i-1)*6,y,t0:start+i*90,life:600,col:['#ffd04a','#8ad0ff','#ff9ad0'][i]});}
function converge(x,y,col,start){for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=16;part({k:'p',x:x+Math.cos(a)*r,y:y+Math.sin(a)*r*.6,vx:-Math.cos(a)*r*5,vy:-Math.sin(a)*r*3,g:0,t0:start,life:180,col,sz:1});}}
{const oa0=onAction;onAction=function(a,now){oa0.apply(this,arguments);try{if(gfxStill())return;const c=centerOf(a);if(!c)return;const b=unitBox(a),dir=a.side==='p'?-1:1,st=animStyle(a),k=a.actKind;
  const tg=B.en.concat(B.front).filter(u=>u!==a&&u.fxT&&Math.abs(u.fxT-a.actT)<60),t0=tg[0]&&centerOf(tg[0]);
  if(a.actLimit&&Date.now()-a.actLimit<200){part({k:'ring',x:c.x,y:b.y-1,t0:now,life:600,col:'#ffd04a',r:26,flat:1});sparkleUp(c.x,c.y,'#ffd04a',now,14);}
  if(k==='phys'||st==='foe'&&(k==='phys'||!k)){
    if(st==='swing')arcSlash(c.x+22*dir,c.y,dir,'#e8e8f0',now+140);
    else if(st==='thrust')streak(c.x+26*dir,c.y,dir,'#f0f0ff',now+120,6);
    else if(st==='jab'){for(let i=0;i<3;i++)part({k:'ring',x:c.x+20*dir,y:c.y-4+i*4,t0:now+110+i*60,life:140,col:'#ffffff',r:5});}
    else if(st==='dash')streak(c.x+10*dir,c.y+4,dir,'#c8c8e0',now+60,8);
    else if((st==='bow'||st==='crossbow')&&t0)projectile(c.x+6*dir,c.y-2,t0.x,t0.y,st==='crossbow'?'#d8d0b0':'#f0e0b0',now+130,Math.max(40,IMPACT-130),st==='crossbow');
    else if(st==='play')notes(c.x,c.y-b.h*.4,now);
    else if(st==='foe'){part({k:'ring',x:c.x,y:c.y,t0:now,life:120,col:'#ff6a6a',r:8});}}
  else if(k==='mag'||k==='status'||k==='buff'){converge(c.x,c.y-4,ELC[a.actEl]||'#c8a0ff',now);if(st==='play')notes(c.x,c.y-b.h*.4,now);}
  else if(k==='heal'){for(let i=0;i<8;i++)part({k:'p',x:c.x+(Math.random()-.5)*10,y:b.y,vx:0,vy:-60-Math.random()*40,g:0,t0:now+i*25,life:380,col:i%2?'#7aff8a':'#ffffff',sz:1});}
}catch(e){}};}
// new particle kinds: arrows/bolts and music notes
{const dp0=drawParts;drawParts=function(ctx,now){try{BV.P.forEach(p=>{if(p.k!=='shot'&&p.k!=='note')return;const t=now-p.t0;if(t<0)return;const q=t/p.life;if(q>=1){p.dead=1;return;}
  if(p.k==='shot'){const x=p.x+(p.x2-p.x)*q,y=p.y+(p.y2-p.y)*q-Math.sin(q*Math.PI)*(p.thick?2:6),dx=p.x2-p.x,dy=p.y2-p.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
    ctx.globalAlpha=1;ctx.fillStyle=p.col;for(let i=0;i<(p.thick?5:7);i++)ctx.fillRect(Math.round(x-ux*i),Math.round(y-uy*i),p.thick?2:1,p.thick?2:1);ctx.fillStyle='#ffffff';ctx.fillRect(Math.round(x),Math.round(y),1,1);}
  else{const y=p.y-q*16,x=p.x+Math.sin(q*6)*3;ctx.globalAlpha=1-q;ctx.fillStyle=p.col;ctx.fillRect(Math.round(x),Math.round(y),2,2);ctx.fillRect(Math.round(x)+1,Math.round(y)-4,1,4);ctx.fillRect(Math.round(x)+2,Math.round(y)-4,2,1);}});
  BV.P=BV.P.filter(p=>!p.dead);}catch(e){}ctx.globalAlpha=1;return dp0.apply(this,arguments);};}
// Limit Breaks get their own pose; bosses flourish on phase changes
{const pf0=perform;perform=function(a,sk){try{if(a&&sk&&sk.limit)a.actLimit=Date.now();}catch(e){}return pf0.apply(this,arguments);};}
{const cp0=checkPhase;checkPhase=function(e){const was=e&&e.phaseDone,was2=e&&e.p2done;cp0.apply(this,arguments);try{if(e&&e.boss&&((!was&&e.phaseDone)||(!was2&&e.p2done))&&V.screen==='battle'&&!gfxStill()){const c=centerOf(e),now=performance.now();if(!c)return;
  part({k:'rays',x:c.x,y:c.y,t0:now,life:700,col:'#ff9a6a'});part({k:'ring',x:c.x,y:c.y,t0:now,life:600,col:'#ff6a3a',r:48});part({k:'ring',x:c.x,y:c.y,t0:now+120,life:520,col:'#ffffff',r:32});BV.shake={t:now,life:420,amp:3};BV.flash={t:now,life:180,col:'rgba(255,140,90,.3)'};}}catch(x){}};}
// summons: a circle opens on the way in, a puff on the way out
{const sc0=summonComp;summonComp=function(){const a=B&&B.cur;const r=sc0.apply(this,arguments);try{const u=B.front.find(x=>x.isComp&&x.owner===a);if(u&&!gfxStill()){const now=performance.now(),b=unitBox(u),col=ELC[(u.el||[])[0]]||'#ffd04a';
  part({k:'circle',x:b.x,y:b.y-1,t0:now,life:700,col});part({k:'ring',x:b.x,y:b.y-b.h*.5,t0:now+150,life:500,col:'#ffffff',r:30});sparkleUp(b.x,b.y-b.h*.5,col,now+120,16);}}catch(e){}return r;};}
{const cr0=compReturn;compReturn=function(u){let c=null;try{c=centerOf(u);}catch(e){}const r=cr0.apply(this,arguments);try{if(c&&!gfxStill()){const now=performance.now();for(let i=0;i<14;i++){const a=Math.random()*Math.PI*2;part({k:'p',x:c.x,y:c.y,vx:Math.cos(a)*40,vy:Math.sin(a)*30-20,g:0,t0:now,life:420,col:i%2?'#ffffff':'#c8c0d8',sz:2});}}}catch(e){}return r;};}
// reduced motion: no screen shake
{const bf0=battleFrame;battleFrame=function(now){if(gfxStill())BV.shake=null;return bf0.apply(this,arguments);};}
// menus and the map: a short fade when a window first opens (not on every refresh)
{const r0=render;render=function(){const key=V.modal?V.modal.type+':'+(V.modal.tab||''):null;const r=r0.apply(this,arguments);try{if(key&&key!==V._animKey&&!gfxStill()){const el=document.querySelector('#modal .modal')||document.querySelector('#modal > *');if(el){el.classList.remove('menter');void el.offsetWidth;el.classList.add('menter');}}V._animKey=key;}catch(e){}return r;};}
