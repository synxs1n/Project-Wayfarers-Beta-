// ===== fxkind11.js (v0.17.7): one effect vocabulary per kind of skill =====
// The owner: "many skills look too similar or their animations don't make sense for the kind of ability... the characters themselves should have
// animations that look appropriate to the move." Before this file the look of a physical hit came from the hero's CLASS (anim.js anPhys/arcSlash:
// every warrior skill the same slash) and a spell from its element alone. Here every skill is classified once (fk11Info) into a kind and gets its own
// effect, hero lunge, and the recoil the target shows:
//   slash   a diagonal arc with an afterimage (area: one wide crescent across the row)        lunge: swing forward
//   blunt   a heavy overhead then a ground shock ring, dust, debris and a screen thump          lunge: rise, then slam (area: a shock wave along the ground)
//   pierce  a straight line with a bright point (area: one line to each foe)                    lunge: coil, then a fast jab
//   ranged  a projectile with a trail (area: arrows falling on every foe)                       lunge: a small kick back
//   multi   the kind repeated with offsets and a x count (hits > 1)
//   magic   by element: a glow at the hand and a delivery that suits the element (fire ball, ice shard, wind gust, lobbed water, ground crack, sky
//           pillar, lightning crackle, gathering void) then the element's shape on the target (anim.js anElem, hdspell.js) and a signature of its own
//   heal    a rising bloom column and petals (revive: a golden pillar)   buff  an upward ring/aura in the status colour   debuff  a downward dark ring
//   song    notes drifting from the bard to each ally and rings         Limit Breaks: every shape 1.5x, a pillar, a stage flash
// Targets recoil by the kind they took: slash a sideways jolt, blunt a squash, pierce a sharp jab back, ranged a hop, magic a flash tint of the element.
// Foes get the same lunges by the kind of their move (from the move's name). Everything is under about 600 ms, counts follow GFX.q.parts, and nothing
// spawns or moves under reduced motion. Effects only: no battle state, no RNG of the battle (Math.random like burstAt). HD-2D: hdspell.js hbsKind
// adds the lights and floor decals; these particles draw on both stages (the HD layer draws them additively). Loads last among the battle modules.
const FK={cur:null,hit:null,mute:0,muteHit:0,sig:{},key:''};
const FK_SONG=/song|hymn|chant|ballad|allegro|tune|aria|anthem|carol|descant|trill|refrain|rondo|symphony|crescendo|finale|requiem|lullaby|drum|dirge|overdrive|cadence|chorus|melody|harmony|serenade|encore|waltz/i;
const FK_COL={slash:'#eaf2ff',blunt:'#ffd9a0',pierce:'#ffffff',ranged:'#f0e0b0',heal:'#8dffa0',buff:'#7affd0',debuff:'#b07ae0',song:'#ffd04a',arcane:'#c8a0ff'};
const FK_PH={slash:/cleave|slash|lash|sweep|scythe|dance|rend|talon|blade|key-lash|swipe|claw|rake|gash/i,blunt:/slam|crush|fist|smash|bash|hammer|stomp|leap|maul|avalanche|pound|wingbeat|hand|piston|ram|trample|charge|crushing/i,
  pierce:/fang|bite|stab|spear|sting|pierce|horn|tusk|beak|dive|starbite|regicide|lance|thorn|needle|pincer|gore|peck|tongue/i,ranged:/spit|shot|hurl|arrow|dart|quill|volley|throw|spore|sling|bolt shot/i};
function fkFoeDl(sk){const n=String(sk&&sk.n||'');if(sk&&sk.dl)return sk.dl;
  for(const k of ['ranged','blunt','pierce','slash']){if(FK_PH[k].test(n))return k==='pierce'?'piercing':k;}return 'slash';}
// the kind of a skill: {k, fx, el, hits, area, one, big, lim, song, dl}. k = slash blunt pierce ranged mag heal buff debuff; fx = the effect key (the element for magic, 'song' for a bard's support)
function fk11Info(a,sk,dl){if(!sk)return null;
  const els=typeof skEls==='function'?skEls(sk):(sk.el?[].concat(sk.el):[]),el=els[0]||null,hits=Math.max(1,sk.hits||1),area=sk.t==='all'||sk.t==='rand'||sk.t==='allyAll';
  let cls=null;try{cls=a&&a.side==='p'&&a.id&&TPL[a.id]?TPL[a.id].cls:null;}catch(e){}
  const I={k:'slash',fx:'slash',el,hits,area,rand:sk.t==='rand',one:!area,big:(sk.pw||0)>=1.8||!!sk.limit,lim:!!sk.limit,song:false,dl:null,a:a||null,n:0,sk,pw:sk.pw||0};
  if(sk.k==='phys'){let d=dl||sk.dl;if(!d){try{d=a&&a.side==='p'?deliveryOf(a,sk):fkFoeDl(sk);}catch(e){}}d=d||'slash';I.dl=d;I.k=d==='piercing'?'pierce':d==='blunt'?'blunt':d==='ranged'?'ranged':'slash';I.fx=I.k;}
  else if(sk.k==='mag'){I.k='mag';I.fx=el||'arcane';}
  else if(sk.k==='heal'||sk.k==='revive'||sk.k==='mpself'){I.k='heal';I.fx='heal';I.revive=sk.k==='revive';}
  else{const foe=sk.t==='one'||sk.t==='all'||sk.t==='rand';I.k=foe?'debuff':'buff';I.fx=I.k;}
  I.song=!!(cls==='bard'&&sk.k!=='phys'||(cls==='bard'||(a&&a.side==='p'&&/bard|song/i.test(String(cls))))&&FK_SONG.test(sk.n||''));
  if(I.song&&(I.k==='heal'||I.k==='buff'||I.k==='debuff'))I.fx='song';
  return I;}
// the info of the action a unit is doing now (recorded by perform below, or worked out from the skill heropose9.js recorded)
function fk11Of(a){if(!a)return null;if(a.fk11&&Math.abs((a.fk11T||0)-(a.actT||0))<80)return a.fk11;
  if(a.actSk&&Math.abs((a.actSkT||0)-(a.actT||0))<80){try{return fk11Info(a,a.actSk,a.actDl);}catch(e){}}return null;}
{const p0=perform;perform=function(a,sk,tgts){const prev=FK.cur;try{const I=fk11Info(a,sk);if(I){I.nt=(tgts||[]).length;a.fk11=I;a.fk11T=Date.now();FK.cur=I;}}catch(e){}
  try{return p0.apply(this,arguments);}finally{FK.cur=prev;}};}
// ---------- tools ----------
const fkE=q=>q<=0?0:q>=1?1:q*q*(3-2*q);
function fkSig(s){const K=FK.key||'?';(FK.sig[K]=FK.sig[K]||{})[s]=1;}
function fkP(o){o.k='fk';if(!o.life)o.life=300;fkSig(o.s+(o.gl||'')+(o.col||''));if(typeof hbsOn==='function'&&hbsOn()&&o.add!==0&&/glow|bloom|pillar|burst|shock/.test(o.s))o.add=1;part(o);}
function fkDot(x,y,vx,vy,t0,life,col,g,sz){fkSig('dot'+col);part({k:'p',x,y,vx,vy,g:g||0,t0,life,col,sz:sz||1});}
function fkN(n){return typeof anN==='function'?anN(n):n;}
function fkShake(t,life,amp){if(!BV.shake||BV.shake.t<t-250)BV.shake={t,life,amp};}
function fkColOf(I){return (I.el&&ELC[I.el])||FK_COL[I.fx]||FK_COL[I.k]||'#ffffff';}
function fkTargets(a){return B?B.en.concat(B.front).filter(u=>u!==a&&u.fxT&&Math.abs(u.fxT-a.actT)<60):[];}
function fkStag(H,I){return (I.area||I.rand)?Math.min(200,H.i*(I.rand?55:40)):0;}
function fkGy(u,y){const b=u&&unitBox(u);return b&&b.gy!=null?b.gy:b?b.y:y+10;}
// ---------- drawing: particle kind 'fk' ----------
function fkDraw(ctx,p,now){const t=now-p.t0;if(t<0)return;const q=t/p.life;if(q>=1)return;const R=Math.round,s=t/1000;
  if(p.add)ctx.globalCompositeOperation='lighter';
  switch(p.s){
    case 'arc':{// a slash stroke along a bowed diagonal (ay = slope, bow = curve), with a lagging afterimage
      const L=p.L,dir=p.dir,P=u=>[p.x+dir*u*L,p.y+u*L*p.ay-(1-u*u)*p.bow],head=-1+2*fkE(Math.min(1,q*2.4)),fade=q<.45?1:1-(q-.45)/.55;
      for(let pass=0;pass<2;pass++){const lag=pass?0:.2,hu=Math.max(-1,head-lag),tu=Math.max(-1,head-1.15-lag),n=Math.ceil(L*1.7);
        for(let i=0;i<=n;i++){const u=tu+(hu-tu)*i/n,k=i/n,pt=P(u),th=Math.max(1,R((pass?p.th:p.th-1)*k*(1-Math.abs(u)*.15)));
          ctx.globalAlpha=fade*(pass?Math.min(1,.2+k*1.1):.3*k);ctx.fillStyle=pass?(k>.82?'#ffffff':p.col):p.col2;ctx.fillRect(R(pt[0]-(pass?0:dir*4)),R(pt[1]-th/2+(pass?0:2)),th,th);}}
      break;}
    case 'shock':{// ground shock ring, a lagging inner ring and cracks
      const r=p.r*(.2+.8*Math.sqrt(q)),al=1-q;ctx.globalAlpha=al;ctx.strokeStyle=p.col;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.34,0,0,7);ctx.stroke();
      ctx.globalAlpha=al*.8;ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,r*.72,r*.34*.72,0,0,7);ctx.stroke();
      if(!p.noCrack){ctx.globalAlpha=al;ctx.fillStyle='#3a2a20';for(let i=0;i<7;i++){const a=i/7*Math.PI*2+p.seed,L=r*(.55+.3*((i*5)%3)/2);for(let d=r*.2;d<L;d+=1.5)ctx.fillRect(R(p.x+Math.cos(a)*d),R(p.y+Math.sin(a)*d*.34),1,1);}}break;}
    case 'thr':{// a straight thrust line: grows to the target, the tail follows, a bright head, a point flash on arrival
      const hq=fkE(Math.min(1,q/.34)),tq=fkE(Math.max(0,(q-.2)/.5)),al=q<.6?1:1-(q-.6)/.4,hx=p.x+(p.x2-p.x)*hq,hy=p.y+(p.y2-p.y)*hq,tx=p.x+(p.x2-p.x)*tq,ty=p.y+(p.y2-p.y)*tq,n=Math.ceil(Math.hypot(hx-tx,hy-ty));
      for(let i=0;i<=n;i++){const k=n?i/n:1;ctx.globalAlpha=al*(.25+.75*k);ctx.fillStyle=k>.9?'#ffffff':p.col;ctx.fillRect(R(tx+(hx-tx)*k),R(ty+(hy-ty)*k)-(p.th>1&&k>.5?1:0),1,p.th>1&&k>.5?3:1);}
      if(q<.5){ctx.globalAlpha=al;ctx.fillStyle='#ffffff';ctx.fillRect(R(hx)-1,R(hy)-1,3,3);}
      if(q>.3&&q<.75){const r=R(1+4*Math.sin((q-.3)/.45*Math.PI));ctx.globalAlpha=1-q;ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x2)-r,R(p.y2),r*2+1,1);ctx.fillRect(R(p.x2),R(p.y2)-r,1,r*2+1);ctx.fillRect(R(p.x2)-1,R(p.y2)-1,3,3);}break;}
    case 'proj':{// a projectile along a (lobbed) path with a trail; glyph arrow bolt fire shard gust drop stone
      const path=u=>[p.x+(p.x2-p.x)*u,p.y+(p.y2-p.y)*u-Math.sin(u*Math.PI)*p.arc],h=path(q),h2=path(Math.min(1,q+.03)),dx=h2[0]-h[0],dy=h2[1]-h[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
      for(let j=p.trail;j>=1;j--){const u=q-j*.035;if(u<0)continue;const tp=path(u);ctx.globalAlpha=(1-j/(p.trail+1))*.8;ctx.fillStyle=j%2?p.col:p.col2;ctx.fillRect(R(tp[0]),R(tp[1]),p.gl==='fire'||p.gl==='stone'?2:1,p.gl==='fire'||p.gl==='stone'?2:1);}
      ctx.globalAlpha=1;
      if(p.gl==='arrow'||p.gl==='bolt'){const th=p.gl==='bolt'?2:1;ctx.fillStyle=p.col;for(let i=0;i<(p.gl==='bolt'?7:6);i++)ctx.fillRect(R(h[0]-ux*i),R(h[1]-uy*i),th,th);ctx.fillStyle='#ffffff';ctx.fillRect(R(h[0]),R(h[1]),th+1,th+1);ctx.fillStyle='#e8e8f0';ctx.fillRect(R(h[0]-ux*6),R(h[1]-uy*6)-1,1,3);}
      else if(p.gl==='fire'){ctx.fillStyle=p.col2;ctx.fillRect(R(h[0])-2,R(h[1])-2,5,5);ctx.fillStyle=p.col;ctx.fillRect(R(h[0])-1,R(h[1])-1,3,3);ctx.fillStyle='#fff4b0';ctx.fillRect(R(h[0]),R(h[1]),1,1);}
      else if(p.gl==='shard'){ctx.fillStyle=p.col;for(let i=-3;i<=3;i++){const w=3-Math.abs(i);ctx.fillRect(R(h[0]+ux*i),R(h[1]+uy*i)-(w>>1),1,w);}ctx.fillStyle='#ffffff';ctx.fillRect(R(h[0]+ux*3),R(h[1]+uy*3),1,1);}
      else if(p.gl==='gust'){ctx.fillStyle=p.col;for(let i=0;i<3;i++)for(let k=0;k<7;k++){const a=k/7;ctx.globalAlpha=1-a*.7;ctx.fillRect(R(h[0]-ux*k*1.5-uy*(i-1)*3),R(h[1]-uy*k*1.5+ux*(i-1)*3+Math.sin(k+i+t/50)),2,1);}}
      else if(p.gl==='drop'){ctx.fillStyle=p.col2;ctx.fillRect(R(h[0])-1,R(h[1])-1,3,3);ctx.fillStyle=p.col;ctx.fillRect(R(h[0]),R(h[1])-2,1,5);ctx.fillStyle='#ffffff';ctx.fillRect(R(h[0]),R(h[1])-1,1,1);}
      else{ctx.fillStyle=p.col2;ctx.fillRect(R(h[0])-1,R(h[1])-1,3,3);ctx.fillStyle=p.col;ctx.fillRect(R(h[0]),R(h[1])-1,2,2);}break;}
    case 'cnt':{ctx.globalAlpha=q<.7?1:1-(q-.7)/.3;ctx.font='bold 7px monospace';ctx.textAlign='center';const y=p.y-q*7;ctx.lineWidth=2;ctx.strokeStyle='#14061e';ctx.strokeText('x'+p.n,p.x,y);ctx.fillStyle=p.col;ctx.fillText('x'+p.n,p.x,y);ctx.textAlign='start';break;}
    case 'spike':{const up=q<.16?q/.16:q<.62?1:1-(q-.62)/.38,hh=p.h*up,half=p.wd,tx=p.x+p.lean*hh;ctx.globalAlpha=1;
      ctx.fillStyle='#5a4a2a';ctx.beginPath();ctx.moveTo(p.x-half,p.y);ctx.lineTo(tx,p.y-hh);ctx.lineTo(p.x+half,p.y);ctx.closePath();ctx.fill();
      ctx.fillStyle='#b08a4a';ctx.beginPath();ctx.moveTo(p.x-half*.15,p.y);ctx.lineTo(tx,p.y-hh);ctx.lineTo(p.x+half,p.y);ctx.closePath();ctx.fill();ctx.fillStyle='#e0c890';ctx.fillRect(R(tx),R(p.y-hh),1,Math.max(1,R(hh*.25)));break;}
    case 'wcol':{const up=q<.28?q/.28:q<.62?1:1-(q-.62)/.38,hh=p.h*up,wd=p.wd;ctx.globalAlpha=.9;
      for(let i=0;i<hh;i+=2){const k=i/Math.max(1,hh),wv=Math.sin(now/60+i*.6)*1.1,ww=R(wd*(1-k*.3));ctx.fillStyle=k>.86?'#ffffff':k>.5?'#8ad0ff':'#3f8fe0';ctx.fillRect(R(p.x+wv-ww/2),R(p.y-i-2),ww,2);}
      if(hh>5){ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x-wd*.8),R(p.y-hh-2),R(wd*1.6),2);ctx.fillRect(R(p.x-wd*.4),R(p.y-hh-4),R(wd*.8),2);}break;}
    case 'gath':{// motes spiral in to a point, a dark disc swells there
      const e=fkE(q);for(let i=0;i<p.n;i++){const a=i/p.n*6.283+p.seed+e*3.2,r=p.r*(1-e)*(.6+.4*((i*7)%3)/2);ctx.globalAlpha=Math.min(1,q*4)*(1-q*.4);ctx.fillStyle=i%2?'#9a6ae0':'#3a2a5a';ctx.fillRect(R(p.x+Math.cos(a)*r),R(p.y+Math.sin(a)*r*.7),2,2);}
      if(q>.55){const k=(q-.55)/.45,r=p.r*.5*Math.sin(k*Math.PI);ctx.globalAlpha=.6;ctx.fillStyle='#14061e';ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.75,0,0,7);ctx.fill();}break;}
    case 'glow':{const k=q<.7?q/.7:1-(q-.7)/.3,r=p.r*(.5+.5*k);const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,p.col+'ee');g.addColorStop(.5,p.col+'66');g.addColorStop(1,p.col+'00');
      ctx.globalAlpha=Math.min(1,k*1.2);ctx.fillStyle=g;ctx.fillRect(p.x-r,p.y-r,r*2,r*2);ctx.globalAlpha=k;ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x)-1,R(p.y)-1,2,2);break;}
    case 'bloom':{// a soft column of light that rises with petals
      const e=Math.sqrt(Math.min(1,q*1.6)),hh=p.h*e,al=(1-q)*.55;const g=ctx.createLinearGradient(0,p.y,0,p.y-hh);g.addColorStop(0,p.col+'00');g.addColorStop(.35,p.col+'aa');g.addColorStop(1,p.col+'00');
      ctx.globalAlpha=al*1.4;ctx.fillStyle=g;ctx.fillRect(R(p.x-p.w/2),R(p.y-hh),p.w,R(hh));ctx.globalAlpha=1-q;ctx.fillStyle='#ffffff';
      for(let i=0;i<5;i++){const k=((q*1.3+i*.21)%1),px=p.x+Math.sin(i*2.1+q*5)*p.w*.45,py=p.y-k*p.h*1.05;ctx.fillRect(R(px),R(py),1,2);ctx.fillRect(R(px)-1,R(py)+1,3,1);}break;}
    case 'vring':{// a ring that travels up (buff) or down (debuff) the target, with a trailing second ring
      for(let j=0;j<2;j++){const qq=q-j*.14;if(qq<0)continue;const y=p.y0+(p.y1-p.y0)*fkE(qq),al=Math.sin(Math.min(1,qq*1.1)*Math.PI)*(j?.55:1);ctx.globalAlpha=al;ctx.strokeStyle=j?p.col2:p.col;ctx.lineWidth=j?1:2;ctx.beginPath();ctx.ellipse(p.x,y,p.rx,p.rx*.34,0,0,7);ctx.stroke();}
      ctx.fillStyle=p.col;const dd=p.y1<p.y0?-1:1;for(let i=0;i<4;i++){const a=i*1.57+q*4,y=p.y0+(p.y1-p.y0)*fkE(Math.min(1,q*1.1))-dd*(i%2)*3;ctx.globalAlpha=(1-q)*.9;ctx.fillRect(R(p.x+Math.cos(a)*p.rx),R(y+Math.sin(a)*p.rx*.34),1,2);}break;}
    case 'pillar':{const k=q<.2?q/.2:1-(q-.2)/.8,wd=p.w*k;ctx.globalAlpha=k*.5;ctx.fillStyle=p.col;ctx.fillRect(R(p.x-wd),0,R(wd*2),R(p.y));ctx.globalAlpha=k*.8;ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x-wd*.35),0,Math.max(1,R(wd*.7)),R(p.y));
      ctx.globalAlpha=k*.7;ctx.fillStyle=p.col;ctx.beginPath();ctx.ellipse(p.x,p.y,wd*1.6,wd*.5,0,0,7);ctx.fill();break;}
    case 'line':{const e=fkE(Math.min(1,q*2.2)),al=1-q;ctx.fillStyle=p.col;const n=Math.ceil(Math.hypot(p.x2-p.x,p.y2-p.y)*e);for(let i=0;i<n;i+=p.gap?2:1){const k=i/Math.max(1,n);ctx.globalAlpha=al*(.4+.6*(1-Math.abs(k-.5)*1.2));ctx.fillRect(R(p.x+(p.x2-p.x)*e*k),R(p.y+(p.y2-p.y)*e*k+(p.jig?Math.sin(i*.9+t/40)*p.jig:0)),1,1);}break;}
    case 'streak':{ctx.fillStyle=p.col;for(let i=0;i<p.n;i++){const k=((q*1.4+i*.17)%1),y=p.y+(i-(p.n-1)/2)*p.sp;ctx.globalAlpha=(1-q)*(1-k)*.9;const len=6+i%3*3;ctx.fillRect(R(p.x-p.dir*(k*p.len)),R(y),len,1);}break;}
    case 'burst':{const r=R(p.r*Math.sin(Math.min(1,q*2)*Math.PI*.5)),al=1-q;ctx.globalAlpha=al;ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x)-r,R(p.y),r*2+1,1);ctx.fillRect(R(p.x),R(p.y)-r,1,r*2+1);
      ctx.fillStyle=p.col;for(let i=0;i<4;i++){const a=i*1.57+.78;ctx.fillRect(R(p.x+Math.cos(a)*r*.75),R(p.y+Math.sin(a)*r*.75),2,2);}break;}
    case 'dust':{const r=3+(p.r1-3)*Math.sqrt(q);ctx.globalAlpha=(1-q)*.55;ctx.fillStyle='#c8b08a';ctx.beginPath();ctx.ellipse(p.x,p.y-r*.4-q*4,r,r*.55,0,0,7);ctx.fill();break;}
    case 'note':{const y=p.y-q*p.rise,x=p.x+Math.sin(q*6+p.ph)*3+(p.x2!=null?(p.x2-p.x)*fkE(q):0);ctx.globalAlpha=Math.sin(Math.min(1,q*1.2)*Math.PI);ctx.fillStyle=p.col;ctx.fillRect(R(x),R(y),2,2);ctx.fillRect(R(x)+1,R(y)-4,1,4);ctx.fillRect(R(x)+2,R(y)-4,2,1);if(p.two){ctx.fillRect(R(x)+3,R(y)-3,1,3);ctx.fillRect(R(x)+1,R(y)-4,3,1);}break;}
  }
  if(p.add)ctx.globalCompositeOperation='source-over';}
{const dp0=drawParts;drawParts=function(ctx,now){const r=dp0.apply(this,arguments);try{const P=BV.P;for(let i=0;i<P.length;i++)if(P[i].k==='fk')fkDraw(ctx,P[i],now);}catch(e){}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.lineWidth=1;return r;};}
// ---------- the old class-based effects stand down while a kind effect plays ----------
{const f=arcSlash;arcSlash=function(){if(FK.mute)return;return f.apply(this,arguments);};}
{const f=streak;streak=function(){if(FK.mute)return;return f.apply(this,arguments);};}
{const f=projectile;projectile=function(){if(FK.mute)return;return f.apply(this,arguments);};}
{const f=notes;notes=function(){if(FK.mute)return;return f.apply(this,arguments);};}
{const f=converge;converge=function(){if(FK.mute)return;return f.apply(this,arguments);};}
{const ap0=anPhys;anPhys=function(){if(FK.muteHit)return;return ap0.apply(this,arguments);};}
// ---------- the effects on a target when a blow lands ----------
function fkSlash(I,x,y,start,s,h,col,after,dirA){const dir=dirA,L=(10+h*.3)*s;fkP({s:'arc',x,y,dir,L,ay:.85,bow:L*.25,th:4,col:I.lim?'#fff6c8':col,col2:col,t0:start-70,life:290});
  const n=fkN(4);for(let i=0;i<n;i++){const a=Math.random()*6.28;fkDot(x-dir*L*.8,y+L*.7,Math.cos(a)*45,Math.sin(a)*35-10,start+70,200+Math.random()*120,i%2?'#ffffff':col,80);}}
function fkBlunt(I,H,x,y,gy,start,s,w,col){fkP({s:'shock',x,y:gy,r:(16+w*.6)*s,col,seed:Math.random()*6,t0:start,life:430});
  for(let i=0;i<fkN(5);i++)fkP({s:'dust',x:x+(Math.random()-.5)*w,y:gy-1,t0:start+Math.random()*50,life:380,r1:5+Math.random()*6});
  for(let i=0;i<fkN(4);i++){const a=-Math.PI*(.2+.6*Math.random()),v=40+Math.random()*50;fkDot(x,gy-2,Math.cos(a)*v,Math.sin(a)*v,start,330+Math.random()*120,i%2?'#8a6a3a':'#5a4a2a',300,2);}
  fkShake(start,I.area?200:240,I.lim?4:3);if(I.big&&typeof gfxCamPush==='function'&&GFX&&GFX.q&&GFX.q.camera&&typeof HD_CAM!=='undefined')gfxCamPush(x,y,HD_CAM.big);}
function fkPierce(I,H,x,y,start,a,col,th){const ac=a&&centerOf(a)||{x:x+60*(H.u.side==='e'?1:-1),y};const dir=ac.x<x?1:-1;const sx=ac.x+(x<ac.x?-12:12),sy=ac.y;
  fkP({s:'thr',x:sx,y:sy,x2:x+dir*-3,y2:y,th:th||1,col,t0:start-110,life:330});for(let i=0;i<fkN(3);i++)fkDot(x,y,Math.cos(Math.random()*6.28)*40,Math.sin(Math.random()*6.28)*30,start,160+Math.random()*100,'#ffffff',60);}
function fkRain(x,y,start,col,gl){for(let j=0;j<3;j++){const ox=(j-1)*7;fkP({s:'proj',gl,x:x+ox,y:y-64,x2:x+ox,y2:y+3,arc:0,trail:2,col,col2:'#8a7a5a',t0:start-110+j*45,life:130});}}
function fkImpactArrow(x,y,dir,start,col){fkP({s:'burst',x,y,r:3,col,t0:start,life:220});if(typeof anP==='function')anP({s:'stuck',x,y,dir,t0:start,life:440});}
// the hit on one target (called from burstAt below)
function fk11Hit(I,H,x,y,start,big){const u=H.u,b=unitBox(u),h=b?b.h:24,w=b?Math.min(b.w,40):20,gy=b&&b.gy!=null?b.gy:y+10,s=(I.lim?1.5:1)*(I.big?1.12:1),a=I.a,col=fkColOf(I),ac=a&&centerOf(a);
  const dirA=a&&ac?(ac.x>x?-1:1):(H.u.side==='e'?-1:1);// the attacker's travel direction (-1 = leftwards)
  FK.key=I.fx;
  const one=(ox,oy,t0,n)=>{
    if(I.k==='slash')fkSlash(I,x+ox,y+oy,t0,s,h,col,1,dirA);
    else if(I.k==='blunt')fkBlunt(I,H,x+ox,y+oy,gy+oy,t0,s,w,col);
    else if(I.k==='pierce')fkPierce(I,H,x+ox,y+oy,t0,a,col,I.big?2:1);
    else if(I.k==='ranged'){if(I.area)fkRain(x+ox,y+oy,t0,col,I.a&&typeof animStyle==='function'&&animStyle(I.a)==='crossbow'?'bolt':'arrow');fkImpactArrow(x+ox,y+oy,dirA,t0,col);}};
  const st=fkStag(H,I);
  if(I.k==='slash'||I.k==='blunt'||I.k==='pierce'||I.k==='ranged'){
    const n=I.rand?1:Math.min(5,I.hits);
    if(I.el&&ELC[I.el]){const ec=ELC[I.el];for(let i=0;i<fkN(5);i++){const ang=Math.random()*6.28;fkDot(x,y,Math.cos(ang)*50,Math.sin(ang)*40-20,start+st+80,260+Math.random()*160,i%2?ec:'#ffffff',60);}fkP({s:'burst',x,y,r:5*s,col:ec,t0:start+st+60,life:260});}
    for(let j=0;j<n;j++){const ox=n>1?((j%2)?3:-3)*Math.min(2,j)+(j-(n-1)/2)*2:0,oy=n>1?(j%3-1)*3:0;one(ox,oy,start+st+j*68,j);}
    if(n>1)fkP({s:'cnt',n:I.hits,x:x+8,y:y-h*.55,col:'#ffe08a',t0:start+st+n*68-30,life:520});
  }
  if(typeof hbsKind==='function')hbsKind(I.k==='mag'?'mag':I.k,x,y,gy,start+st,{big:I.big,w,col,el:I.el});
  if(I.k==='mag')fkMagHit(I,H,x,y,gy,start+st,s,h,w);}
// magic: the signature on top of the element's own shape (anim.js anElem / hdspell.js hbsHit)
function fkMagHit(I,H,x,y,gy,start,s,h,w){const el=I.fx,col=ELC[el]||FK_COL.arcane,hd=typeof hbsOn==='function'&&hbsOn(),R=Math.random;FK.key=el;
  switch(el){
    case 'fire':fkP({s:'glow',x,y,r:(16+w*.5)*s,col:'#ff8a3a',t0:start,life:360});if(I.big)fkP({s:'shock',x,y:gy,r:26*s,col:'#ff8a3a',noCrack:1,seed:0,t0:start+30,life:380});break;
    case 'water':if(!hd)fkP({s:'wcol',x,y:gy,h:(h*.95+10)*s,wd:Math.round(5*s),t0:start,life:480});fkP({s:'shock',x,y:gy,r:(14+w*.4)*s,col:'#8ad0ff',noCrack:1,seed:0,t0:start+40,life:380});break;
    case 'earth':if(!hd){const n=I.big?5:3;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.55;fkP({s:'spike',x:x+Math.sin(a)*w*.5,y:gy-Math.cos(a)*2+(i%2),h:(h*.55+R()*8)*s,wd:3+(i%2)+(I.big?1:0),lean:a*.25,t0:start+i*28,life:520});}}break;
    case 'wind':for(let i=0;i<2;i++)fkP({s:'arc',x:x+(i?5:-5),y:y+(i?7:-6),dir:i?1:-1,L:(w*.6+8)*s,ay:.1,bow:-6,th:3,col:'#c8f0e0',col2:'#5fc9a0',t0:start-30+i*50,life:300});break;
    case 'lightning':fkP({s:'burst',x,y,r:7*s,col:'#fff6a0',t0:start,life:240});if(I.big)fkP({s:'pillar',x,y,w:5*s,col:'#fff6a0',t0:start+90,life:260});break;
    case 'ice':fkP({s:'burst',x,y:y-h*.2,r:6*s,col:'#bfefff',t0:start+80,life:300});break;
    case 'light':fkP({s:'pillar',x,y:gy,w:(I.big?7:5)*s,col:'#ffe9a0',t0:start-40,life:420});break;
    case 'shadow':fkP({s:'gath',x,y,r:(w*.9+6)*s,n:10,seed:R()*6,t0:start-IMPACT+20,life:IMPACT+160});break;
    default:fkP({s:'glow',x,y,r:(14+w*.4)*s,col:'#c8a0ff',t0:start,life:320});}
  if(I.big&&el!=='earth')fkShake(start,I.area?220:180,2);}
// ---------- hits: replace the class look of a physical blow, add the signature to a spell ----------
{const b0=burstAt;burstAt=function(x,y,el,start,big){const H=FK.hit;
  if(!H||!H.I||H.sup||gfxStill())return b0.apply(this,arguments);
  const I=H.I;let r;
  if(I.k==='phys'||I.k==='slash'||I.k==='blunt'||I.k==='pierce'||I.k==='ranged'){FK.muteHit++;try{r=b0.call(this,x,y,'hit',start+fkStag(H,I),big);}finally{FK.muteHit--;}}
  else r=b0.apply(this,arguments);
  try{fk11Hit(I,H,x,y,start,big);}catch(e){}return r;};}
// the hit state: which action's blow this popup is (damage popups of the current perform; heals and status popups of a support skill)
{const o0=onFx;onFx=function(u,txt,cls){const I=FK.cur;let set=false;
  try{if(I&&u&&B&&V.screen==='battle'){
    if(/dmg/.test(cls)&&!/poison|burn|bleed/.test(cls)){u.fk11r={k:I.k,el:I.el,fx:I.fx,t:Date.now(),lim:I.lim};FK.hit={u,I,i:I.n++};set=true;}
    else if(cls==='heal'||/good|bad/.test(cls||'')){FK.hit={u,I,i:I.n++,sup:1,txt};set=true;}}}catch(e){}
  try{return o0.apply(this,arguments);}finally{if(set)FK.hit=null;}};}
// support effects: replace anim.js's one-size chevrons for the skill kinds they were made for
{const af0=anFxText;anFxText=function(u,txt,cls){const I=FK.cur;
  if(!I||gfxStill()||!B||V.screen!=='battle'||!u)return af0.apply(this,arguments);
  if(cls==='heal'&&I.k==='heal'){af0.apply(this,arguments);try{fkHeal(I,u,{i:Math.max(0,I.n-1)});}catch(e){}return;}
  if(/(good|bad)/.test(cls||'')&&(I.k==='buff'||I.k==='debuff'||I.song)&&!/^(Telegraph|BREAK|Reeling|Stunned|Blocked|Miss)$/.test(String(txt))){try{fkAura(I,u,{i:Math.max(0,I.n-1)},/good/.test(cls),txt);}catch(e){}return;}
  return af0.apply(this,arguments);};}
function fkStatusCol(txt,good){try{const k=Object.keys(STS).find(k=>STS[k].n===txt||STS[k].n===String(txt).replace(/^\+/,''));if(k&&STS[k].c)return STS[k].c;}catch(e){}return good?'#7affd0':'#b07ae0';}
function fkHeal(I,u,H){const c=centerOf(u),b=unitBox(u);if(!c||!b)return;const now=performance.now(),st=H.i*70,gy=b.gy!=null?b.gy:b.y,col=I.revive?'#ffe9a0':'#8dffa0';FK.key=I.revive?'revive':'heal';
  fkP({s:'bloom',x:c.x,y:gy,w:Math.min(b.w,40)*.8+4,h:b.h*(I.revive?1.5:1.15),col,t0:now+st,life:I.revive?520:480});
  if(I.revive){fkP({s:'pillar',x:c.x,y:gy,w:6,col:'#ffe9a0',t0:now+st,life:420});fkP({s:'shock',x:c.x,y:gy,r:26,col:'#ffe9a0',noCrack:1,seed:0,t0:now+st+60,life:420});}
  if(I.song)fkNotes(c.x,c.y-b.h*.3,now+st,2,H.i);
  if(typeof hbsKind==='function')hbsKind('heal',c.x,c.y,gy,now+st,{w:Math.min(b.w,40)});}
function fkAura(I,u,H,good,txt){const c=centerOf(u),b=unitBox(u);if(!c||!b)return;if(u._fkA&&performance.now()-u._fkA<260)return;u._fkA=performance.now();
  const now=performance.now(),st=good?H.i*60:0,gy=b.gy!=null?b.gy:b.y,col=I.song?'#ffd04a':fkStatusCol(txt,good),w=Math.min(b.w,40)*.5+4;FK.key=I.song?'song':good?'buff':'debuff';
  if(good){fkP({s:'vring',x:c.x,y0:gy,y1:gy-b.h*.95,rx:w,col,col2:'#ffffff',t0:now+st+40,life:520});fkP({s:'bloom',x:c.x,y:gy,w:w*1.4,h:b.h*.9,col,t0:now+st+40,life:420});}
  else{fkP({s:'vring',x:c.x,y0:gy-b.h*.95,y1:gy,rx:w,col:'#b07ae0',col2:'#3a2a5a',t0:now+IMPACT+st,life:520});
    for(let i=0;i<fkN(4);i++)fkDot(c.x+(Math.random()-.5)*w*1.4,gy-b.h*(.5+Math.random()*.4),0,20+Math.random()*14,now+IMPACT+st+i*35,420,i%2?'#3a2a5a':'#9a6ae0',30);}
  if(I.song)fkNotes(c.x,c.y-b.h*.3,now+st,2,H.i);
  if(typeof hbsKind==='function')hbsKind(I.song?'song':good?'buff':'debuff',c.x,c.y,gy,now+(good?st+40:IMPACT),{w:Math.min(b.w,40)});}
function fkNotes(x,y,t0,n,k){const C=['#ffd04a','#8ad0ff','#ff9ad0','#b8ffb0'];for(let i=0;i<n;i++)fkP({s:'note',x:x+(i-n/2)*7,y,rise:18+i*5,ph:i*1.7+k,two:i%2,col:C[(i+k)%4],t0:t0+i*90,life:620});}
// ---------- what the attacker does (a glow at the hand, the delivery of the spell, the wide shapes of an all-foe attack) ----------
function fkHandPos(a,c,b,dir){return {x:c.x+dir*Math.round(b.w*.36),y:c.y-Math.round(b.h*.3)};}
function fkAct(a,I,now){const c=centerOf(a),b=unitBox(a);if(!c||!b)return;const dir=a.side==='p'?-1:1,tg=fkTargets(a),hand=fkHandPos(a,c,b,dir),s=I.lim?1.5:1,col=fkColOf(I),R=Math.random,gy=b.gy!=null?b.gy:b.y;FK.key=I.fx;
  const farthest=tg.reduce((m,t)=>{const d=centerOf(t);return d&&Math.abs(d.x-c.x)>Math.abs(m-c.x)?d.x:m;},c.x);
  if(I.lim){fkP({s:'pillar',x:c.x,y:gy,w:9,col:I.k==='heal'||I.k==='buff'?'#bfffc8':'#ffe9a0',t0:now,life:480});fkP({s:'shock',x:c.x,y:gy,r:34,col:'#ffd04a',noCrack:1,seed:0,t0:now+60,life:480});
    if(!BV.flash||BV.flash.t<now-200)BV.flash={t:now,life:240,col:'rgba(255,240,190,.4)'};fkShake(now,260,3);}
  if(I.k==='slash'){fkP({s:'arc',x:hand.x+dir*8,y:c.y-b.h*.1,dir,L:11*s,ay:.9,bow:3,th:3,col:'#eaf2ff',col2:'#9ab8e0',t0:now+IMPACT-120,life:200});
    if(I.area&&tg.length>1){const mx=tg.reduce((m,t)=>m+(centerOf(t)||c).x,0)/tg.length,my=tg.reduce((m,t)=>m+(centerOf(t)||c).y,0)/tg.length,sp=Math.abs(farthest-c.x);
      fkP({s:'arc',x:(mx+c.x)/2,y:my,dir,L:Math.max(24,sp*.55),ay:.14,bow:-10,th:5,col:I.lim?'#fff6c8':'#eaf2ff',col2:col,t0:now+IMPACT-130,life:340});}}
  else if(I.k==='blunt'){for(let i=0;i<fkN(4);i++)fkDot(c.x+dir*8+(R()-.5)*8,gy-2,(R()-.5)*30,-14-R()*10,now+IMPACT-60,260,'#c8b08a',30);
    if(I.area&&tg.length>0){fkP({s:'shock',x:c.x+dir*14,y:gy,r:Math.abs(farthest-c.x)+16,col:I.lim?'#ffd04a':'#ffd9a0',seed:0,noCrack:1,t0:now+IMPACT-70,life:430});}}
  else if(I.k==='pierce'){fkP({s:'streak',x:c.x-dir*4,y:c.y,dir,n:4,sp:4,len:22,col:'#e8e8ff',t0:now+100,life:260});}
  else if(I.k==='ranged'){if(!I.area)tg.forEach(t=>{const d=centerOf(t);if(d)fkP({s:'proj',gl:typeof animStyle==='function'&&animStyle(a)==='crossbow'?'bolt':'arrow',x:hand.x,y:hand.y+4,x2:d.x,y2:d.y,arc:6,trail:5,col,col2:'#8a7a5a',t0:now+120,life:Math.max(50,IMPACT-120)});});
    for(let i=0;i<fkN(3);i++)fkDot(hand.x+dir*3,hand.y+4,dir*(20+R()*20),(R()-.5)*14,now+110,140,'#fff6d0',0);}
  else if(I.k==='mag')fkCast(a,I,now,hand,tg,col,dir,s);
  else if(I.k==='heal'){fkP({s:'glow',x:hand.x,y:hand.y,r:12,col:'#8dffa0',t0:now,life:IMPACT+160});for(let i=0;i<fkN(6);i++)fkDot(hand.x+(R()-.5)*14,hand.y+6+R()*6,0,-22-R()*20,now+i*28,420,i%2?'#bfffc8':'#ffffff',0);}
  else if(I.k==='buff'){fkP({s:'glow',x:hand.x,y:hand.y-2,r:12,col:I.song?'#ffd04a':'#7affd0',t0:now,life:IMPACT+160});for(let i=0;i<fkN(5);i++)fkDot(hand.x+(R()-.5)*10,hand.y,(R()-.5)*8,-30-R()*24,now+60+i*30,420,'#fff6a0',0);}
  else if(I.k==='debuff'){fkP({s:'gath',x:hand.x,y:hand.y,r:15,n:7,seed:R()*6,t0:now,life:IMPACT-10});
    tg.forEach(t=>{const d=centerOf(t);if(d)fkP({s:'line',x:hand.x,y:hand.y,x2:d.x,y2:d.y,col:'#9a6ae0',gap:1,jig:1.2,t0:now+IMPACT-90,life:240});});}
  if(I.song){fkNotes(c.x,c.y-b.h*.45,now,3,0);for(let i=0;i<3;i++)part({k:'ring',x:c.x,y:gy,t0:now+i*120,life:480,col:i%2?'#ffffff':'#ffd04a',r:26+i*8,flat:1});}
  if(I.k==='mag'&&I.big&&I.area)fkShake(now+IMPACT,240,3);else if(I.k==='mag'&&I.big)fkShake(now+IMPACT,180,2);}
// spell cast: element-specific tell at the hand, then the delivery
function fkCast(a,I,now,hand,tg,col,dir,s){const el=I.fx,R=Math.random,hx=hand.x,hy=hand.y,C=el==='arcane'?'#c8a0ff':ELC[el]||'#c8a0ff';
  fkP({s:'glow',x:hx,y:hy,r:(12+(I.big?5:0))*s,col:C,t0:now,life:IMPACT+150});
  const tell=(f)=>{for(let i=0;i<fkN(6);i++)f(i);};
  switch(el){
    case 'fire':tell(i=>fkDot(hx+(R()-.5)*8,hy+3,(R()-.5)*8,-26-R()*22,now+i*24,360,i%2?'#ffb04a':'#ff5a1a',-10));break;
    case 'water':tell(i=>{const a=i/6*6.283;fkDot(hx+Math.cos(a)*7,hy+Math.sin(a)*4,-Math.cos(a)*10,-Math.sin(a)*6-8,now+i*20,300,i%2?'#8ad0ff':'#ffffff',120);});break;
    case 'earth':tell(i=>fkDot(hx+(R()-.5)*14,hy+14+R()*4,0,-18-R()*14,now+i*26,360,i%2?'#b08a4a':'#5a4a2a',-6,2));break;
    case 'wind':tell(i=>{const a=i/6*6.283+R();fkDot(hx+Math.cos(a)*9,hy+Math.sin(a)*5,-Math.sin(a)*34,Math.cos(a)*18,now+i*20,320,i%2?'#c8f0e0':'#5fc9a0',0);});break;
    case 'lightning':for(let i=0;i<3;i++)fkP({s:'line',x:hx+(R()-.5)*4,y:hy,x2:hx+(R()-.5)*22,y2:hy+(R()-.5)*18,col:'#fff6a0',jig:2,t0:now+i*55,life:130});break;
    case 'ice':tell(i=>fkDot(hx+(R()-.5)*14,hy+(R()-.5)*10,0,3,now+i*28,420,i%2?'#ffffff':'#bfefff',0));break;
    case 'light':tell(i=>{const a=i/6*6.283;fkDot(hx+Math.cos(a)*12,hy+Math.sin(a)*8,-Math.cos(a)*40,-Math.sin(a)*26,now+i*18,260,i%2?'#ffffff':'#ffe9a0',0);});break;
    case 'shadow':fkP({s:'gath',x:hx,y:hy,r:16,n:8,seed:R()*6,t0:now,life:IMPACT});break;
    default:tell(i=>{const a=i/6*6.283;fkDot(hx+Math.cos(a)*10,hy+Math.sin(a)*6,-Math.cos(a)*30,-Math.sin(a)*18,now+i*20,240,'#c8a0ff',0);});}
  // delivery per target
  tg.forEach((t,i)=>{const d=centerOf(t);if(!d)return;const L=Math.max(60,IMPACT-50);
    if(el==='fire')fkP({s:'proj',gl:'fire',x:hx,y:hy,x2:d.x,y2:d.y,arc:10,trail:6,col:'#ffb04a',col2:'#ff5a1a',t0:now+50+i*20,life:L});
    else if(el==='ice')fkP({s:'proj',gl:'shard',x:hx,y:hy,x2:d.x,y2:d.y,arc:2,trail:4,col:'#bfefff',col2:'#6ab8e0',t0:now+60+i*20,life:L});
    else if(el==='wind')fkP({s:'proj',gl:'gust',x:hx,y:hy,x2:d.x,y2:d.y,arc:0,trail:0,col:'#c8f0e0',col2:'#5fc9a0',t0:now+60+i*20,life:L});
    else if(el==='water')fkP({s:'proj',gl:'drop',x:hx,y:hy,x2:d.x,y2:d.y,arc:22,trail:3,col:'#3f8fe0',col2:'#8ad0ff',t0:now+60+i*20,life:L});
    else if(el==='earth'){const g0=gy0(a);fkP({s:'line',x:hx-dir*2,y:g0,x2:d.x,y2:fkGy(t,d.y),col:'#b08a4a',jig:1.5,t0:now+60,life:IMPACT+80});}
    else if(el==='light')fkP({s:'line',x:hx,y:hy,x2:hx,y2:2,col:'#fff6c8',t0:now+50,life:260});
    else if(el==='shadow')fkP({s:'line',x:hx,y:hy,x2:d.x,y2:d.y,col:'#6a3aa0',gap:1,jig:2,t0:now+70,life:IMPACT});
    else if(el==='arcane')fkP({s:'proj',gl:'stone',x:hx,y:hy,x2:d.x,y2:d.y,arc:8,trail:5,col:'#ffffff',col2:'#c8a0ff',t0:now+50+i*20,life:L});
  });
  function gy0(u){const b=unitBox(u);return b&&b.gy!=null?b.gy:b?b.y:hy+20;}}
{const oa0=onAction;onAction=function(a,now){let I=null;try{I=fk11Of(a);if(gfxStill()||!B||V.screen!=='battle'||!a||a.hp<=0)I=null;}catch(e){I=null;}
  if(!I)return oa0.apply(this,arguments);
  const n0=BV.P.length;FK.mute++;try{oa0.apply(this,arguments);}finally{FK.mute--;}
  try{if(I.k==='mag'&&I.fx!=='arcane')BV.P=BV.P.filter((p,i)=>i<n0||p.k!=='orb');// the plain orb from battle.js: the element has its own delivery now
    fkAct(a,I,now);}catch(e){}};}
// summons: a pillar and a shock ring where the guardian lands
{const sc0=summonComp;summonComp=function(){const r=sc0.apply(this,arguments);try{const a=B&&B.cur,u=B.front.find(x=>x.isComp&&x.owner===a)||B.front.find(x=>x.isSummon);if(u&&!gfxStill()){const b=unitBox(u),now=performance.now(),gy=b.gy!=null?b.gy:b.y;FK.key='summon';
  fkP({s:'pillar',x:b.x,y:gy,w:10,col:'#ffe9a0',t0:now,life:520});fkP({s:'shock',x:b.x,y:gy,r:34,col:'#ffe9a0',noCrack:1,seed:0,t0:now+140,life:460});fkShake(now+140,200,2);if(typeof hbsKind==='function')hbsKind('summon',b.x,b.y-b.h*.5,gy,now,{w:b.w,big:1});}}catch(e){}return r;};}
// ---------- the lunge of the attacker, by kind ----------
function fkLunge(I,a,reach,sp){const rec=(t0,len)=>1-fkE((a-t0)/(len/Math.max(1,sp*.8))),R=Math.round;let o=null;
  if(I.k==='slash'){if(a<110)o={dx:-R(3*fkE(a/110)),dy:-1};else if(a<170)o={dx:R(-3+(reach+3)*fkE((a-110)/60)),dy:R(-2+4*fkE((a-110)/60)),walk:true};else o={dx:R(reach*rec(170,350)),dy:R(2*rec(170,350))};}
  else if(I.k==='blunt'){const r2=reach*.7;if(a<130)o={dx:-R(2*fkE(a/130)),dy:-R(6*fkE(a/130))};else if(a<175)o={dx:R(-2+(r2+2)*fkE((a-130)/45)),dy:R(-6+8*fkE((a-130)/45))};else if(a<270)o={dx:R(r2),dy:1};else o={dx:R(r2*rec(270,330)),dy:R(rec(270,330))};}
  else if(I.k==='pierce'){if(a<115)o={dx:-R(6*fkE(a/115)),dy:0};else if(a<150)o={dx:R(-6+(reach+10)*fkE((a-115)/35)),dy:0};else o={dx:R((reach+4)*rec(150,370)),dy:0};}
  else if(I.k==='ranged'){if(a<140)o={dx:-R(2*fkE(a/140)),dy:0};else if(a<190)o={dx:-R(2+3*fkE((a-140)/50)),dy:0};else o={dx:-R(5*rec(190,330)),dy:0};}
  if(o&&I.hits>1&&!I.rand&&I.k!=='ranged'&&a>150){const beat=Math.floor((a-150)/62);if(beat<Math.min(6,I.hits)&&beat%2===0)o.dx+=3;}
  return o;}
{const ap0=animPose;animPose=function(u,a,dir,b){const r=ap0.apply(this,arguments);try{if(gfxStill()||!u||u.hp<=0)return r;if(u.actLimit&&Date.now()-u.actLimit<700)return r;
  const I=fk11Of(u);if(!I||(I.k!=='slash'&&I.k!=='blunt'&&I.k!=='pierce'&&I.k!=='ranged'))return r;
  const o=fkLunge(I,a,u.side==='e'?26:24,META.cfg.speed||1);if(!o)return r;return {dx:o.dx*dir,dy:o.dy,walk:o.walk};}catch(e){}return r;};}
// ---------- what a target does when a blow lands, by kind ----------
function fk11Recoil(u,b,T){if(gfxStill()||!u||u.hp<=0||!u.fk11r||(B&&B.wipe))return null;const R=u.fk11r,h=(T||Date.now())-(u.hitT||0)-IMPACT;if(!u.hitT||Math.abs(R.t-u.hitT)>90||h<0||h>340)return null;
  const back=u.side==='e'?-1:1,e=Math.max(0,1-h/320),o={dx:0,dy:0,sx:1,sy:1,rot:0,tint:null,k:R.k};
  if(R.k==='slash'){o.dx=back*7*e;o.dy=-1.5*e;o.rot=back*.07*e;}
  else if(R.k==='blunt'){const sq=h<90?h/90:Math.max(0,1-(h-90)/200);o.sy=1-.26*sq;o.sx=1+.17*sq;o.dy=sq*1.5;}
  else if(R.k==='pierce'){const pk=h<45?h/45:Math.pow(Math.max(0,1-(h-45)/215),2);o.dx=back*11*pk;o.rot=-back*.05*pk;}
  else if(R.k==='ranged'){o.dx=back*3*e;o.dy=-3*Math.sin(Math.min(1,h/320)*Math.PI);}
  else if(R.k==='mag'){o.dx=(Math.floor(h/32)%2?1:-1)*e*1.2;o.tint=(R.el&&ELC[R.el])||'#c8a0ff';o.ta=Math.max(0,1-h/260);}
  else return null;
  if(R.lim){o.dx*=1.4;o.dy*=1.4;}return o;}
{const du0=drawUnit;drawUnit=function(ctx,u,b,now,tgMode){const r=fk11Recoil(u,b,Date.now());if(!r)return du0.apply(this,arguments);
  const gy=b.gy!=null?b.gy:b.y;ctx.save();ctx.translate(b.x+r.dx,gy+r.dy);if(r.rot)ctx.rotate(r.rot);ctx.scale(r.sx,r.sy);ctx.translate(-b.x,-gy);
  if(r.tint&&r.ta>.05){try{ctx.filter='drop-shadow(0px 0px 2px '+r.tint+') brightness('+(1+.5*r.ta).toFixed(2)+')';}catch(e){}}
  try{return du0.apply(this,arguments);}finally{ctx.filter='none';ctx.restore();}};}
// ---------- for the tests and the audit ----------
function fk11Rows(list){return list.map(r=>{const I=fk11Info(r.a,r.sk);return {id:r.sk.id,k:I.k,fx:I.fx,el:I.el,dl:I.dl,hits:I.hits,area:I.area,lim:I.lim,song:I.song};});}
