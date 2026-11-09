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
HOOK.before('perform','anim','Limit Break pose time',function(a,sk){try{if(a&&sk&&sk.limit){a.actLimit=Date.now();ANX.lim=a.actLimit+1300;}}catch(e){}});
{const cp0=checkPhase;checkPhase=function(e){const was=e&&e.phaseDone,was2=e&&e.p2done;cp0.apply(this,arguments);try{if(e&&e.boss&&((!was&&e.phaseDone)||(!was2&&e.p2done))&&V.screen==='battle'&&!gfxStill()){const c=centerOf(e),now=performance.now();if(!c)return;
  part({k:'rays',x:c.x,y:c.y,t0:now,life:700,col:'#ff9a6a'});part({k:'ring',x:c.x,y:c.y,t0:now,life:600,col:'#ff6a3a',r:48});part({k:'ring',x:c.x,y:c.y,t0:now+120,life:520,col:'#ffffff',r:32});BV.shake={t:now,life:420,amp:3};BV.flash={t:now,life:180,col:'rgba(255,140,90,.3)'};}}catch(x){}};}
// summons: a circle opens on the way in, a puff on the way out
{const sc0=summonComp;summonComp=function(){const a=B&&B.cur;const r=sc0.apply(this,arguments);try{const u=B.front.find(x=>x.isComp&&x.owner===a);if(u&&!gfxStill()){const now=performance.now(),b=unitBox(u),col=ELC[(u.el||[])[0]]||'#ffd04a';
  part({k:'circle',x:b.x,y:b.y-1,t0:now,life:700,col});part({k:'ring',x:b.x,y:b.y-b.h*.5,t0:now+150,life:500,col:'#ffffff',r:30});sparkleUp(b.x,b.y-b.h*.5,col,now+120,16);}}catch(e){}return r;};}
{const cr0=compReturn;compReturn=function(u){let c=null;try{c=centerOf(u);}catch(e){}const r=cr0.apply(this,arguments);try{if(c&&!gfxStill()){const now=performance.now();for(let i=0;i<14;i++){const a=Math.random()*Math.PI*2;part({k:'p',x:c.x,y:c.y,vx:Math.cos(a)*40,vy:Math.sin(a)*30-20,g:0,t0:now,life:420,col:i%2?'#ffffff':'#c8c0d8',sz:2});}}}catch(e){}return r;};}
// reduced motion: no screen shake
{const bf0=battleFrame;battleFrame=function(now){if(gfxStill())BV.shake=null;return bf0.apply(this,arguments);};}
// menus and the map: a short fade when a window first opens (not on every refresh)
HOOK.wrap('render','anim','popup open fade',function(next,...a){const key=V.modal?V.modal.type+':'+(V.modal.tab||''):null;const r=next(...a);try{if(key&&key!==V._animKey&&!gfxStill()){const el=document.querySelector('#modal .modal')||document.querySelector('#modal > *');if(el){el.classList.remove('menter');void el.offsetWidth;el.classList.add('menter');}}V._animKey=key;}catch(e){}return r;});
// ===== v0.12.6: skill looks: element shapes, physical hits, heals, buffs, Limit Breaks, boss telegraph =====
// Each element has its own shape, not only a colour (anElem, drawn by anDraw as particle kind 'an'): fire flame tongues + embers, water a wave arc +
// droplets, ice a fan of shards + a frost ring, lightning a jagged bolt from the sky + sparks, earth rock chunks + dust, wind curved slashes +
// leaves, light a beam + sparkles, shadow a dark burst + wisps sinking. Physical hits follow the attacker's pose: slash arc (swing, dash), pierce
// line (thrust), impact ring and star (jab), a stuck arrow (bow), claws (foes). Heals: rising motes and a soft ring. Buffs: a rising chevron ring,
// debuffs: a sinking one. Limit Breaks: a screen flash (a static tint under reduced motion) and a 1.5x element shape. Everything is under about
// 560 ms, counts follow GFX.q.parts (anN), and nothing spawns under reduced motion (except the Limit tint). Effects only: they use Math.random like
// burstAt does and never touch battle state. HD-2D (hdspell.js) calls anElem with lit=1 for the pieces its own set pieces do not draw.
const ANX={u:null,st:'swing',k:'phys',dir:-1,lim:0,tint:null};
const AN_EL=['fire','water','ice','lightning','earth','wind','light','shadow'];
function anHasShape(el){return AN_EL.includes(el)&&!gfxStill();}
function anN(n){const q=(GFX&&GFX.q&&GFX.q.parts)||280;return Math.max(1,Math.round(n*(q<=140?.7:q>=500?1.25:1)));}
function anP(o){o.k='an';part(o);}
function anBig(){return ANX.lim&&Date.now()<ANX.lim;}
// the eight element shapes at a target: x,y its centre. lit=1 (HD-2D): only the pieces hdspell.js does not draw itself, drawn additively
function anElem(el,x,y,start,big,u,lit){if(gfxStill())return;const R=Math.random,b=u&&unitBox(u),h=b?b.h:24,w=b?Math.min(b.w,40):20,gy=b&&b.gy!=null?b.gy:b?b.y:y+10,L=anBig(),s=(big?1.15:1)*(L?1.5:1),n=k=>anN(k*(L?1.6:1)),l=lit?1:0;
  switch(el){
    case 'fire':{if(!l){const c=n(4);for(let i=0;i<c;i++)anP({s:'flame',x:x+(i-(c-1)/2)*w*.26+(R()-.5)*3,y:gy-1,hm:(h*.7+R()*h*.3)*s,wd:Math.round((4+R()*2)*s),ph:R()*9,t0:start+i*28+R()*40,life:400+R()*100});}
      for(let i=0;i<n(6);i++)part({k:'p',x:x+(R()-.5)*w*.6,y:gy-R()*h*.5,vx:(R()-.5)*14,vy:-34-R()*34,g:-12,t0:start+R()*140,life:380+R()*180,col:R()<.5?'#ffb04a':'#ff5a1a',sz:R()<.3?2:1});break;}
    case 'water':{anP({s:'wave',x,y:gy-h*.15,r:w*.7*s+6,hm:h*.6*s,t0:start,life:430,lit:l});
      for(let i=0;i<n(7);i++){const a=-Math.PI*(.12+.76*R()),v=40+R()*50;part({k:'p',x:x+(R()-.5)*w*.4,y:y-h*.2,vx:Math.cos(a)*v,vy:Math.sin(a)*v*1.2,g:300,t0:start+60+R()*100,life:380+R()*180,col:R()<.5?'#8ad0ff':'#ffffff',sz:R()<.3?2:1});}
      if(!l)part({k:'ring',x,y:gy,t0:start+40,life:380,col:'#8ad0ff',r:16*s,flat:1});break;}
    case 'ice':{const c=n(5);for(let i=0;i<c;i++)anP({s:'shard',x,y:y+h*.2,a:-Math.PI/2+(i-(c-1)/2)*.45+(R()-.5)*.12,len:(11+R()*8)*s,wd:2+(s>1.3?1:0),t0:start+i*16,life:420,lit:l});
      if(!l){part({k:'ring',x,y:gy,t0:start,life:440,col:'#e8faff',r:20*s,flat:1});part({k:'ring',x,y:gy,t0:start+80,life:380,col:'#bfefff',r:13*s,flat:1});}
      for(let i=0;i<n(4);i++)part({k:'p',x:x+(R()-.5)*w,y:y-h*.3+R()*h*.4,vx:(R()-.5)*20,vy:-6-R()*10,g:30,t0:start+R()*160,life:420,col:'#ffffff',sz:1});break;}
    case 'lightning':{if(!l)anP({s:'jag',x,y,t0:start,life:260,seed:R()*1e4,w:s>1.3?3:2});
      for(let i=0;i<n(6);i++){const a=-Math.PI*R(),v=40+R()*40;part({k:'p',x,y:gy-2,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:200,t0:start+(l?60:0),life:240+R()*160,col:R()<.5?'#ffffff':'#fff6a0',sz:1});}
      anP({s:'spk',x:x+(R()-.5)*w*.6,y:y+(R()-.5)*h*.5,t0:start+30,life:200,col:'#fff6a0',lit:l});break;}
    case 'earth':{for(let i=0;i<n(7);i++)anP({s:'rock',x:x+(R()-.5)*w*.5,y:gy-2,vx:(R()-.5)*60,vy:-(70+R()*70),g:380,floor:gy+R()*3,sz:3+(R()<.4?1:0)+(s>1.3?1:0),t0:start+R()*40,life:480+R()*80});
      if(!l)for(let i=0;i<n(3);i++)anP({s:'dust',x:x+(R()-.5)*w,y:gy-1,r1:6+R()*7,t0:start+R()*80,life:420});
      if(!BV.shake||BV.shake.t<start-200)BV.shake={t:start,life:200,amp:2};break;}
    case 'wind':{const c=n(3);for(let i=0;i<c;i++)anP({s:'crv',x:x+(R()-.5)*6,y:y+(i-(c-1)/2)*h*.18,a:(i-(c-1)/2)*.35-.45+(R()-.5)*.2,len:(w*.7+10)*s,bend:(7+R()*3)*(i%2?-1:1),t0:start+i*45,life:340,lit:l});
      for(let i=0;i<n(5);i++)part({k:'p',x,y,vx:26+R()*22,vy:0,swirl:i%2?1:-1,g:0,t0:start+R()*120,life:380+R()*160,col:R()<.5?'#7ae8b8':'#c8f0e0',sz:R()<.3?2:1});break;}
    case 'light':{if(!l)anP({s:'beam',x,y,w:7*s,t0:start,life:400});
      for(let i=0;i<n(6);i++)anP({s:'spk',x:x+(R()-.5)*w,y:y+(R()-.5)*h*.8,t0:start+R()*180,life:260+R()*80,col:i%2?'#ffffff':'#ffe9a0',lit:l});break;}
    case 'shadow':{if(!l)anP({s:'dark',x,y,r:w*.7*s,t0:start,life:400});
      for(let i=0;i<n(5);i++)anP({s:'wisp',x:x+(R()-.5)*w*.7,y:y-h*.2+R()*h*.4,vy:14+R()*14,ph:R()*6,t0:start+R()*120,life:420+R()*120,col:R()<.5?'#3a2a5a':'#9a6ae0'});break;}
    default:}}
// physical hits (a hit with no element), shaped by the attacker's pose
function anPhys(x,y,start,big,u){const R=Math.random,b=u&&unitBox(u),h=b?b.h:24,s=(big?1.15:1)*(anBig()?1.4:1),st=ANX.st,dir=ANX.dir||-1,sp=anN(4);
  const spark=()=>{for(let i=0;i<sp;i++)part({k:'p',x,y,vx:Math.cos(R()*6.3)*50,vy:Math.sin(R()*6.3)*40,g:80,t0:start,life:200+R()*120,col:i%2?'#ffffff':'#ffe08a',sz:1});};
  if(st==='thrust'){anP({s:'pierce',x,y,dir,len:34*s,t0:start-60,life:220});spark();}
  else if(st==='jab'){anP({s:'star',x,y,r:18*s,t0:start,life:240});part({k:'ring',x,y,t0:start,life:260,col:'#ffffff',r:18*s});spark();}
  else if(st==='bow'||st==='crossbow'){anP({s:'stuck',x,y,dir,t0:start,life:440});spark();}
  else if(st==='foe'){const m=Math.min(1.6,Math.max(.9,h/34));anP({s:'claw',x,y,dir,len:h*.75*m,t0:start,life:280});}
  else if(st==='dash'){anP({s:'slashc',x,y,dir,a:-.7,len:20*s,bend:5,t0:start-30,life:200});anP({s:'slashc',x,y,dir,a:.7,len:18*s,bend:5,t0:start+40,life:200});}
  else{anP({s:'slashc',x,y,dir,a:-.6,len:(22+h*.3)*s,bend:8*s,t0:start-40,life:240});spark();}}
function anHit(x,y,el,start,big,u){if(el==='hit')anPhys(x,y,start,big,u);else if(AN_EL.includes(el))anElem(el,x,y,start,big,u,0);}
// drawing
function anDraw(ctx,p,now){const t=now-p.t0;if(t<0)return;const q=t/p.life;if(q>=1)return;const R=Math.round,s=t/1000;
  if(p.lit)ctx.globalCompositeOperation='lighter';
  switch(p.s){
    case 'flame':{const hh=p.hm*Math.sin(Math.min(1,q*1.6)*Math.PI*.5)*(1-q*.55),n=Math.max(2,R(hh/2));
      for(let i=0;i<n;i++){const k=i/n,wv=Math.sin(now/55+p.ph+i*.7)*1.5*k,wd=Math.max(1,R((1-k)*p.wd*(1-q*.4)));ctx.globalAlpha=(1-q*q)*(1-k*.4);
        ctx.fillStyle=k<.25?'#fff4b0':k<.55?'#ffb04a':k<.8?'#ff6a1a':'#c83a1a';ctx.fillRect(R(p.x+wv-wd/2),R(p.y-i*2-2),wd,2);}break;}
    case 'wave':{const r=p.r*(.45+.55*Math.sqrt(q)),hh=p.hm*(.35+.65*Math.sin(Math.min(1,q*1.5)*Math.PI*.5));ctx.globalAlpha=(1-q)*.95;
      for(let i=-R(r);i<=R(r);i++){const k=i/r,y=p.y-Math.sqrt(Math.max(0,1-k*k))*hh;ctx.fillStyle='#3f8fe0';ctx.fillRect(R(p.x+i),R(y)+2,1,2);ctx.fillStyle=Math.abs(k)<.55?'#ffffff':'#8ad0ff';ctx.fillRect(R(p.x+i),R(y),1,2);}break;}
    case 'shard':{const g=Math.min(1,q/.25),L=p.len*g,sh=q>.7,ca=Math.cos(p.a),sa=Math.sin(p.a),px=-sa,py=ca;ctx.globalAlpha=sh?Math.max(0,1-(q-.7)/.3):1;
      const tri=(k,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(p.x+px*p.wd*k,p.y+py*p.wd*k);ctx.lineTo(p.x+ca*L+(sh?(q-.7)*8:0),p.y+sa*L+(sh?(q-.7)*30:0));ctx.lineTo(p.x-px*p.wd*k,p.y-py*p.wd*k);ctx.closePath();ctx.fill();};
      tri(1,'#4a9ac8');tri(.5,'#bfefff');ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x+ca*L),R(p.y+sa*L),1,1);break;}
    case 'jag':{if(Math.floor(t/40)%4===3)break;const Rr=mulberry(Math.floor(p.seed+t/40));let x=p.x+(Rr()-.5)*14,y=0;const pts=[[x,y]];
      while(y<p.y){y+=4+Rr()*4;x+=(Rr()-.5)*8;x+=(p.x-x)*.3;pts.push([R(x),R(Math.min(y,p.y))]);}
      ctx.globalAlpha=1-q*.5;ctx.lineCap='butt';[[p.w+2,'#c8a020'],[p.w+1,'#fff6a0'],[Math.max(1,p.w-1),'#ffffff']].forEach(([lw,c])=>{ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.stroke();});
      const fk=pts[Math.floor(pts.length*.5)];if(fk){ctx.strokeStyle='#fff6a0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(fk[0],fk[1]);ctx.lineTo(fk[0]+(Rr()-.5)*24,fk[1]+8+Rr()*8);ctx.stroke();}break;}
    case 'rock':{const x=p.x+p.vx*s;let y=p.y+p.vy*s+.5*p.g*s*s;if(y>p.floor)y=p.floor-Math.abs(Math.sin(s*14))*2*(1-q);ctx.globalAlpha=1-q*q*q;ctx.fillStyle='#5a4a2a';ctx.fillRect(R(x),R(y),p.sz,p.sz);ctx.fillStyle='#b08a4a';ctx.fillRect(R(x),R(y),Math.max(1,p.sz-1),Math.max(1,p.sz-1));break;}
    case 'dust':{const r=3+(p.r1-3)*Math.sqrt(q);ctx.globalAlpha=(1-q)*.6;ctx.fillStyle='#c8b08a';ctx.beginPath();ctx.ellipse(p.x,p.y-r*.4-q*4,r,r*.55,0,0,7);ctx.fill();break;}
    case 'crv':{const ca=Math.cos(p.a),sa=Math.sin(p.a),u=Math.min(1,q*1.5),L=p.len;
      for(let j=0;j<16;j++){const v=u-j*.025;if(v<0)break;const al=(1-j/16)*(1-Math.max(0,q-.6)/.4),lx=(v*2-1)*L,ly=-Math.sin(v*Math.PI)*p.bend;ctx.globalAlpha=al;ctx.fillStyle=j<2?'#ffffff':j<9?'#c8f0e0':'#5fc9a0';
        ctx.fillRect(R(p.x+lx*ca-ly*sa),R(p.y+lx*sa+ly*ca),j<9?3:2,j<9?2:1);}break;}
    case 'beam':{const k=q<.2?q/.2:1-(q-.2)/.8,wd=p.w*k;[[wd,.22,'#ffc850'],[wd*.6,.4,'#fff0c0'],[Math.max(1,wd*.22),.8,'#ffffff']].forEach(([ww,a,c])=>{ctx.globalAlpha=a*k;ctx.fillStyle=c;ctx.fillRect(R(p.x-ww/2),0,Math.max(1,R(ww)),R(p.y));});
      ctx.globalAlpha=k*.8;ctx.fillStyle='#fff6d0';ctx.beginPath();ctx.ellipse(p.x,p.y,wd*1.1,wd*.4,0,0,7);ctx.fill();break;}
    case 'spk':{const r=Math.round(1+3*Math.sin(q*Math.PI)),x=R(p.x),y=R(p.y);ctx.globalAlpha=1-q;ctx.fillStyle=p.col;ctx.fillRect(x-r,y,r*2+1,1);ctx.fillRect(x,y-r,1,r*2+1);if(r>2){ctx.fillStyle='#ffffff';ctx.fillRect(x-1,y-1,3,3);}break;}
    case 'dark':{const k=Math.sin(Math.min(1,q*1.2)*Math.PI*.5),r=p.r*(.3+.7*k);ctx.globalAlpha=(1-q)*.6;ctx.fillStyle='#14061e';ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.8,0,0,7);ctx.fill();
      ctx.globalAlpha=(1-q)*.9;ctx.strokeStyle='#a070e0';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.8,0,0,7);ctx.stroke();break;}
    case 'wisp':{const y=p.y+p.vy*s,x=p.x+Math.sin(s*6+p.ph)*3;ctx.globalAlpha=Math.min(1,q*5)*(1-q)*.9;ctx.fillStyle=p.col;ctx.fillRect(R(x),R(y),2,3);ctx.fillRect(R(x)+1,R(y)-2,1,2);ctx.globalAlpha*=.5;ctx.fillRect(R(x)-1,R(y)-4,1,2);break;}
    case 'slashc':{const rv=Math.min(1,q*2.6),ca=Math.cos(p.a),sa=Math.sin(p.a);
      for(let pass=0;pass<2;pass++)for(let u=Math.max(0,rv-.55);u<=rv;u+=1/(p.len*1.3)){const k=(u-Math.max(0,rv-.55))/.55,lx=(u*2-1)*p.len*p.dir,ly=-Math.sin(u*Math.PI)*p.bend,th=Math.max(1,R((pass?3:5)*Math.sin(u*Math.PI)));
        ctx.globalAlpha=(q<.5?1:1-(q-.5)/.5)*Math.min(1,.3+k);ctx.fillStyle=pass?'#ffffff':'#9ab8e0';ctx.fillRect(R(p.x+lx*ca-ly*sa),R(p.y+lx*sa+ly*ca)-(th>>1),1,th);}break;}
    case 'pierce':{const hd=-p.len+p.len*2*Math.min(1,q*1.8),al=q<.55?1:1-(q-.55)/.45;ctx.fillStyle='#ffffff';
      for(let i=0;i<22;i++){const px=p.x+(hd-i)*p.dir;ctx.globalAlpha=al*(1-i/22);ctx.fillRect(R(px),R(p.y)-1,1,i<4?3:2);}
      ctx.globalAlpha=al*.5;ctx.fillStyle='#c8d8ff';ctx.fillRect(R(p.x+(hd-6)*p.dir),R(p.y)+2,10,1);
      if(q>.25&&q<.6){const r=R(2+3*Math.sin((q-.25)/.35*Math.PI));ctx.globalAlpha=1-q;ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x)-r,R(p.y),r*2+1,1);ctx.fillRect(R(p.x),R(p.y)-r,1,r*2+1);}break;}
    case 'star':{const r1=p.r*Math.sqrt(Math.min(1,q*1.6)),r0=r1*.35;ctx.globalAlpha=1-q;for(let i=0;i<8;i++){const a=i*Math.PI/4+.2,len=i%2?r1*.65:r1;ctx.fillStyle=i%2?'#ffe08a':'#ffffff';
      for(let r=r0;r<len;r+=1.5)ctx.fillRect(R(p.x+Math.cos(a)*r),R(p.y+Math.sin(a)*r),1,1);}break;}
    case 'stuck':{const jig=R(Math.sin(t/30)*(1-q)*1.2),al=q<.6?1:1-(q-.6)/.4;ctx.globalAlpha=al;ctx.fillStyle='#d8c8a0';for(let i=0;i<8;i++)ctx.fillRect(R(p.x-p.dir*i),R(p.y)+jig,1,1);
      ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x),R(p.y)+jig,1,1);ctx.fillStyle='#e8e8f0';ctx.fillRect(R(p.x-p.dir*8),R(p.y)+jig-1,1,3);ctx.fillRect(R(p.x-p.dir*7),R(p.y)+jig-1,1,1);ctx.fillRect(R(p.x-p.dir*7),R(p.y)+jig+1,1,1);break;}
    case 'claw':{const rv=Math.min(1,q*2.4),al=q<.5?1:1-(q-.5)/.5;for(let c=0;c<3;c++){const ox=(c-1)*5*p.dir,m=Math.max(0,Math.min(1,rv*1.4-c*.18));ctx.globalAlpha=al;
      for(let i=0;i<p.len*m;i++){const k=i/p.len;ctx.fillStyle=k<.15?'#ffffff':'#ff9a8a';ctx.fillRect(R(p.x+ox-p.dir*(p.len*.35)+p.dir*i*.7),R(p.y-p.len*.5+i),2,k>.7?1:2);}}break;}
    case 'chev':{const al=Math.min(1,q*6)*(1-q),dy=p.d*q*14;for(let i=0;i<p.n;i++){const a=i/p.n*Math.PI*2+q*.9,sn=Math.sin(a),cx=R(p.x+Math.cos(a)*p.rx),cy=R(p.y+sn*p.ry+dy);ctx.globalAlpha=al*(sn>0?.85:1);ctx.fillStyle=p.col;
      const dd=p.d<0?1:-1;// buff (d<0): the chevron points up
      ctx.fillRect(cx-2,cy+dd*1,1,1);ctx.fillRect(cx-1,cy,1,1);ctx.fillRect(cx,cy-dd*1,1,1);ctx.fillRect(cx+1,cy,1,1);ctx.fillRect(cx+2,cy+dd*1,1,1);
      ctx.globalAlpha*=.5;ctx.fillRect(cx-2,cy+dd*2,1,1);ctx.fillRect(cx-1,cy+dd*1,1,1);ctx.fillRect(cx,cy,1,1);ctx.fillRect(cx+1,cy+dd*1,1,1);ctx.fillRect(cx+2,cy+dd*2,1,1);}break;}
    case 'mote':{const x=p.x+Math.sin(s*5+p.ph)*2,y=p.y-p.vy*s;ctx.globalAlpha=Math.min(1,q*4)*(1-q);ctx.fillStyle=p.col;ctx.fillRect(R(x),R(y)-1,1,3);ctx.fillRect(R(x)-1,R(y),3,1);break;}
    case 'soft':{const r=p.r*(.5+.5*Math.sqrt(q));ctx.globalAlpha=(1-q)*.3;ctx.fillStyle=p.col;ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.35,0,0,7);ctx.fill();break;}}
  if(p.lit)ctx.globalCompositeOperation='source-over';}
{const dp0=drawParts;drawParts=function(ctx,now){const r=dp0.apply(this,arguments);try{const P=BV.P;for(let i=0;i<P.length;i++)if(P[i].k==='an')anDraw(ctx,P[i],now);
  if(ANX.tint&&now<ANX.tint.until){ctx.globalAlpha=.16;ctx.fillStyle=ANX.tint.col;ctx.fillRect(-4,-4,BL.W+8,BL.H+8);}}catch(e){}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';return r;};}
// hits: the element or physical shape lands with the damage number (HD-2D draws the element shapes itself, through hdspell.js)
{const ba1=burstAt;burstAt=function(x,y,el,start,big){const r=ba1.apply(this,arguments);try{if(!gfxStill()&&!(el!=='hit'&&typeof hbsOn==='function'&&hbsOn()))anHit(x,y,el,start,big,ANX.u);}catch(e){}return r;};}
// heals, buffs and debuffs ride on the popup text; ANX.u tells burstAt which unit the hit is on
{const of1=onFx;onFx=function(u,txt,cls){ANX.u=u;try{return of1.apply(this,arguments);}finally{ANX.u=null;try{anFxText(u,txt,cls);}catch(e){}}};}
function anFxText(u,txt,cls){if(!B||V.screen!=='battle'||!u||gfxStill())return;const c=centerOf(u),b=unitBox(u);if(!c||!b)return;const R=Math.random,now=performance.now(),lit=typeof hbsOn==='function'&&hbsOn()?1:0;
  if(cls==='heal'){const gy=b.gy!=null?b.gy:b.y;for(let i=0;i<anN(7);i++)anP({s:'mote',x:c.x+(R()-.5)*b.w*.5,y:gy-R()*b.h*.4,vy:26+R()*22,ph:R()*6,t0:now+i*32,life:420+R()*120,col:i%2?'#9affb0':'#ffffff',lit});
    anP({s:'soft',x:c.x,y:gy,r:Math.min(b.w,40)*.7+6,col:'#7aff8a',t0:now,life:480,lit});part({k:'ring',x:c.x,y:gy,t0:now+40,life:420,col:'#bfffc8',r:Math.min(b.w,40)*.5+6,flat:1});return;}
  const g=/good/.test(cls||''),bd=/bad/.test(cls||'')&&!/^(Telegraph|BREAK|Reeling|Stunned)$/.test(String(txt));if(!g&&!bd)return;if(u._anChev&&now-u._anChev<300)return;u._anChev=now;
  anP({s:'chev',x:c.x,y:g?c.y+b.h*.28:c.y-b.h*.2,rx:Math.min(b.w,40)*.5+3,ry:4,n:anN(5),d:g?-1:1,col:g?'#7affd0':'#d07a8a',t0:now+(g?60:IMPACT),life:520,lit});}
// Limit Breaks: a screen flash (a static tint under reduced motion) and a golden pillar at the hero; the hits are 1.5x (ANX.lim, set in perform)
{const oa2=onAction;onAction=function(a,now){oa2.apply(this,arguments);try{ANX.st=animStyle(a);ANX.k=a.actKind;ANX.dir=a.side==='p'?-1:1;
  if(a.actLimit&&Date.now()-a.actLimit<250){const first=a._anLimT!==a.actLimit;a._anLimT=a.actLimit;if(first){
    if(gfxStill())ANX.tint={until:now+520,col:'#ffe9a0'};
    else{BV.flash={t:now,life:280,col:'rgba(255,236,170,.5)'};const c=centerOf(a);if(c)anP({s:'beam',x:c.x,y:c.y,w:10,t0:now,life:480});}}}}catch(e){}};}
// a foe winding up (Charger or boss telegraph): drawUnit swells it a little and pulses a glow
function bossTele(u){try{return !!(B&&u&&u.side==='e'&&u.hp>0&&(has(u,'charge')||(B.b4g&&B.b4g.u===u&&B.b4g.pend)));}catch(e){return false;}}
