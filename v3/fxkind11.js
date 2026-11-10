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
// v0.17.10: a foe's delivery from the move itself. foes.js gives a move {n, el, pw, t, k, fx} and no dl, so: an explicit dl, then the words of the name that name a way of striking,
// then what the move does (an area blow tramples; bleed cuts; poison, shadow and lightning stab; earth, ice, stun, break, burn and slow bludgeon; wind slashes)
function fkFoeDl(sk){const n=String(sk&&sk.n||'');if(sk&&sk.dl)return sk.dl;
  for(const k of ['ranged','blunt','pierce','slash']){if(FK_PH[k].test(n))return k==='pierce'?'piercing':k;}
  if(!sk)return 'slash';const st=(sk.fx||[]).map(f=>f[0]),el=[].concat(sk.el||[])[0]||null;
  if(sk.t==='all'||sk.t==='rand')return 'blunt';
  if(st.includes('bleed'))return 'slash';if(st.includes('poison')||st.includes('blind'))return 'piercing';if(st.some(k=>k==='stun'||k==='break'||k==='burn'||k==='slow'||k==='root'))return 'blunt';
  if(el==='earth'||el==='ice'||el==='fire')return 'blunt';if(el==='shadow'||el==='lightning'||el==='light')return 'piercing';return 'slash';}
// the kind of a skill: {k, fx, el, hits, area, one, big, lim, song, dl}. k = slash blunt pierce ranged mag heal buff debuff; fx = the effect key (the element for magic, 'song' for a bard's support)
function fk11Info(a,sk,dl){if(!sk)return null;
  const els=typeof skEls==='function'?skEls(sk):(sk.el?[].concat(sk.el):[]),el=els[0]||null,hits=Math.max(1,sk.hits||1),area=sk.t==='all'||sk.t==='rand'||sk.t==='allyAll';
  let cls=null;try{cls=a&&a.side==='p'&&a.id&&TPL[a.id]?TPL[a.id].cls:null;}catch(e){}
  const I={k:'slash',fx:'slash',el,hits,area,rand:sk.t==='rand',one:!area,big:(sk.pw||0)>=1.8||!!sk.limit,lim:!!sk.limit,song:false,dl:null,a:a||null,n:0,sk,pw:sk.pw||0};
  if(sk.k==='phys'){let d=dl||sk.dl;if(!d){try{d=a&&a.side==='p'?deliveryOf(a,sk):fkFoeDl(sk);}catch(e){}}d=d||'slash';I.dl=d;I.k=d==='piercing'?'pierce':d==='blunt'?'blunt':d==='ranged'?'ranged':'slash';I.fx=I.k;}
  else if(sk.k==='mag'){I.k='mag';I.fx=el||'arcane';}
  else if(sk.k==='heal'||sk.k==='revive'||sk.k==='mpself'){I.k='heal';I.fx='heal';I.revive=sk.k==='revive';}
  else{const foe=sk.t==='one'||sk.t==='all'||sk.t==='rand';I.k=foe?'debuff':'buff';I.fx=I.k;}
  I.sig=fkSigKey(a,sk);I.l2=!!sk.limit2;
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
function fkK(){const sc=(typeof BL!=='undefined'&&BL&&BL.sc)||2;return Math.max(1,Math.min(1.8,3.2/sc));}// 1.6 on a phone stage (scale 2), 1.16 on a desktop one
function fkP(o){o.k='fk';if(o.s==='arc'&&!o.K)o.K=fkK();if(!o.life)o.life=300;fkSig(o.s+(o.gl||'')+(o.col||''));if(typeof hbsOn==='function'&&hbsOn()&&o.add!==0&&/glow|bloom|pillar|burst|shock/.test(o.s))o.add=1;part(o);}
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
    case 'arc':{// a slash stroke along a bowed diagonal (ay = slope, bow = curve): a glow pass, a thick core and a lagging afterimage; thickness follows the stage scale (p.K)
      const L=p.L,dir=p.dir,K=p.K||1,P=u=>[p.x+dir*u*L,p.y+u*L*p.ay-(1-u*u)*p.bow],head=-1+2*fkE(Math.min(1,q*2.4)),fade=q<.45?1:1-(q-.45)/.55;
      for(let pass=0;pass<2;pass++){const lag=pass?0:.2,hu=Math.max(-1,head-lag),tu=Math.max(-1,head-1.15-lag),n=Math.ceil(L*1.7);
        for(let i=0;i<=n;i++){const u=tu+(hu-tu)*i/n,k=i/n,pt=P(u),th=Math.max(1,R((pass?p.th:p.th-1)*K*k*(1-Math.abs(u)*.15)));
          ctx.globalAlpha=fade*(pass?Math.min(1,.2+k*1.1):.3*k);ctx.fillStyle=pass?(k>.82?'#ffffff':p.col):p.col2;ctx.fillRect(R(pt[0]-(pass?0:dir*4)-(th>>1)),R(pt[1]-th/2+(pass?0:2)),th,th);}}
      {// the glow: one soft wide stroke along the same path, additive
        const hu=head,tu=Math.max(-1,head-1.15),n=10,pc=ctx.globalCompositeOperation;ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
        for(let g=0;g<2;g++){ctx.globalAlpha=fade*(g?.5:.2);ctx.strokeStyle=g?'#ffffff':p.col;ctx.lineWidth=Math.max(1,(g?p.th*.55:p.th*2.4)*K);ctx.beginPath();
          for(let i=0;i<=n;i++){const pt=P(tu+(hu-tu)*i/n);i?ctx.lineTo(pt[0],pt[1]):ctx.moveTo(pt[0],pt[1]);}ctx.stroke();}
        ctx.globalCompositeOperation=pc;ctx.lineCap='butt';ctx.lineWidth=1;}
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
    case 'st':fkStDraw(ctx,p,now,t,q);break;
    case 'note':{const y=p.y-q*p.rise,x=p.x+Math.sin(q*6+p.ph)*3+(p.x2!=null?(p.x2-p.x)*fkE(q):0);ctx.globalAlpha=Math.sin(Math.min(1,q*1.2)*Math.PI);ctx.fillStyle=p.col;ctx.fillRect(R(x),R(y),2,2);ctx.fillRect(R(x)+1,R(y)-4,1,4);ctx.fillRect(R(x)+2,R(y)-4,2,1);if(p.two){ctx.fillRect(R(x)+3,R(y)-3,1,3);ctx.fillRect(R(x)+1,R(y)-4,3,1);}break;}
    default:fkDraw2(ctx,p,now,t,q);
  }
  if(p.add)ctx.globalCompositeOperation='source-over';}
{const dp0=drawParts;drawParts=function(ctx,now){const r=dp0.apply(this,arguments);try{const P=BV.P;for(let i=0;i<P.length;i++)if(P[i].k==='fk')fkDraw(ctx,P[i],now);}catch(e){}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.lineWidth=1;return r;};}
// ============================================================================================================================================
// v0.17.10: a shape of its own for every status (STS, plus the boss gimmick marks). One particle, s:'st', sh:<shape>: the apply burst when the status
// lands (about 520 to 760 ms), a lighter loop while it lasts (poison drips, burn embers, a curse sigil, a hex star...) and a tint pulse on a tick.
//   poison bubbles   bleed streaks   burn embers   slow chains   stun stars   blind ink   root roots   weaken droop   break crack   might blades
//   bulwark stones   haste speed (lines + a clock hand)   regen leaves   ward hexplates   taunt mark   focus reticle   curse sigils   wound gash
//   hex hexstar   charge gather   g_tele warn   g_mark target   g_rod rod   g_chill frost   g_air afterimage   g_veil mist   g_mirror panes
//   g_tide waves   g_dark gloom   rk_unmake unmake; the names the player may meet later map too: magup runes, silence bell, evasion afterimage, freeze frost
// ============================================================================================================================================
const FK_SH={poison:'bubbles',bleed:'streaks',burn:'embers',slow:'chains',stun:'stars',blind:'ink',root:'roots',weaken:'droop',break:'crack',might:'blades',bulwark:'stones',haste:'speed',regen:'leaves',ward:'hexplates',taunt:'mark',focus:'reticle',curse:'sigils',wound:'gash',hex:'hexstar',charge:'gather',
  g_tele:'warn',g_mark:'target',g_rod:'rod',g_chill:'frost',g_air:'afterimage',g_veil:'mist',g_mirror:'panes',g_tide:'waves',g_dark:'gloom',rk_unmake:'unmake',magup:'runes',silence:'bell',evasion:'afterimage',freeze:'frost'};
const FK_SHL={bubbles:700,streaks:560,embers:760,chains:700,stars:760,ink:700,roots:760,droop:620,crack:600,blades:640,stones:640,speed:640,leaves:760,hexplates:680,mark:700,reticle:620,sigils:760,gash:640,hexstar:760,gather:880,warn:700,target:760,rod:700,frost:760,afterimage:640,mist:760,panes:640,waves:700,gloom:760,unmake:760,runes:760,bell:700};
// shapes that glow (drawn additively on the lit stage); the rest are drawn as solid pixels
const FK_SHADD=/^(hexplates|speed|leaves|blades|reticle|embers|stars|sigils|hexstar|gather|warn|target|rod|frost|runes|mark|stones)$/;
function fkStKey(txt){try{let t=String(txt||'').trim();if(/ off$|stolen$/.test(t))return null;t=t.replace(/[!.]+$/,'').replace(/\s+\d+$/,'');
    for(const k in STS){if(STS[k].n===t||STS[k].n===t.replace(/^\+/,''))return k;}if(t==='Frozen')return 'g_chill';}catch(e){}return null;}
function fkStDraw(ctx,p,now,t,q){const R=Math.round,TAU=Math.PI*2,x=p.x,gy=p.y,h=p.h,w=p.w,cy=gy-h*.5,col=p.col,s=t/1000,sd=p.seed||0,lg=p.lg?.55:1,dir=p.dir||1,
    env=Math.sin(Math.min(1,q)*Math.PI),out=q<.65?1:1-(q-.65)/.35,ease=Math.min(1,q*3);
  const A=a=>{ctx.globalAlpha=Math.max(0,Math.min(1,a));},px=(a,b,c,d,f)=>{if(f)ctx.fillStyle=f;ctx.fillRect(R(a),R(b),c||1,d||1);},ln=(x0,y0,x1,y1,f,wd)=>{ctx.strokeStyle=f;ctx.lineWidth=wd||1;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();};
  const hex=(cx,cyy,r,rot)=>{ctx.beginPath();for(let i=0;i<6;i++){const a=rot+i/6*TAU;i?ctx.lineTo(cx+Math.cos(a)*r,cyy+Math.sin(a)*r):ctx.moveTo(cx+Math.cos(a)*r,cyy+Math.sin(a)*r);}ctx.closePath();};
  const star4=(cx,cyy,r,f)=>{ctx.fillStyle=f;ctx.fillRect(R(cx-r),R(cyy),r*2+1,1);ctx.fillRect(R(cx),R(cyy-r),1,r*2+1);};
  const ell=(cx,cyy,rx,ry,f,st)=>{ctx.beginPath();ctx.ellipse(cx,cyy,Math.max(.5,rx),Math.max(.5,ry),0,0,7);if(st){ctx.strokeStyle=f;ctx.lineWidth=1;ctx.stroke();}else{ctx.fillStyle=f;ctx.fill();}};
  const hd=gy-h;// the top of the head
  switch(p.sh){
    case 'hexplates':{// six hexagon plates snap onto the body one after another, then glow out
      for(let i=0;i<6;i++){const sp=Math.min(1,Math.max(0,(q-i*.06)/.2));if(sp<=0)continue;const a=i/6*TAU-1.57,sc=2.4-1.4*fkE(sp),px0=x+Math.cos(a)*w*1.2,py0=cy+Math.sin(a)*h*.5,r=5*sc;
        ctx.fillStyle=col;hex(px0,py0,r,.5);A(out*.55);ctx.fill();A(out);ctx.strokeStyle=sp<1?'#ffffff':'#fff6c8';ctx.lineWidth=1.6;hex(px0,py0,r,.5);ctx.stroke();hex(px0,py0,r*.55,.5);A(out*.7);ctx.strokeStyle=col;ctx.stroke();
        if(sp>=1&&(q-i*.06)/.2<1.3){A(out);ctx.fillStyle='#ffffff';hex(px0,py0,r,.5);ctx.fill();}}
      A(out*.5);ell(x,cy,w*1.2,h*.5,col,1);break;}
    case 'speed':{// speed lines trailing behind, and a clock hand that sweeps a full turn
      for(let i=0;i<6;i++){const k=((q*1.6+i*.19)%1),yy=gy-h*(.12+i*.15),len=5+(i%3)*4;A((1-k)*out);px(x+dir*(w*.4+k*22),yy,len,1,i%2?'#ffffff':col);}
      const r=Math.max(6,h*.27),cx=x,cc=cy-h*.1,a1=-1.57+fkE(Math.min(1,q/.8))*TAU;A(out*.9);ell(cx,cc,r,r,col,1);for(let i=0;i<12;i++){const a=i/12*TAU;px(cx+Math.cos(a)*r,cc+Math.sin(a)*r,1,1,'#ffffff');}
      A(out);ln(cx,cc,cx+Math.cos(a1)*r*.85,cc+Math.sin(a1)*r*.85,'#ffffff',1.5);A(out*.4);ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cc,r*.7,-1.57,a1);ctx.stroke();break;}
    case 'leaves':{// leaves and petals spiral up the body
      const n=Math.round(9*lg);for(let i=0;i<n;i++){const k=((q*1.25+i/n)%1),a=s*4.2+i*.9,rr=w*(.75+.3*Math.sin(i)),yy=gy-k*h*1.15,xx=x+Math.cos(a)*rr;A(Math.sin(k*Math.PI)*out);const f=i%3===0?'#ffb0d0':i%3===1?col:'#c8ffc0';px(xx,yy,2,1,f);px(xx+(Math.sin(a)>0?1:-1),yy+1,1,1,f);}
      A(out*.3);ell(x,gy-1,w*.9,2.5,col,1);break;}
    case 'blades':{// bright blade glints rise up the body and flash a star at the tip
      for(let i=0;i<5;i++){const k=Math.min(1,Math.max(0,(q-i*.07)/.6)),bx=x+(i-2)*w*.38,by=gy-k*h*1.05;if(k<=0||k>=1)continue;A(Math.sin(k*Math.PI)*out);px(bx,by,1,6,'#ffffff');px(bx-1,by+5,3,1,col);px(bx,by-1,1,1,'#ffffff');px(bx,by+6,1,2,col);if(k>.78)star4(bx,by-1,2,'#ffffff');}
      A(out*.3);ell(x,gy-1,w*.9,2.5,col,1);break;}
    case 'stones':{// stone plates slide in from both sides and lock onto the body
      for(let i=0;i<6;i++){const sp=Math.min(1,Math.max(0,(q-i*.07)/.22)),side=i%2?1:-1,row=(i>>1),xx=x+side*(w*.78+ (1-fkE(sp))*12),yy=gy-h*(.2+row*.27);if(sp<=0)continue;
        A(out);px(xx-2,yy-3,5,6,'#6a7a98');px(xx-2,yy-3,5,1,'#a8b8d0');px(xx-2,yy+2,5,1,'#3a4660');px(xx,yy-1,1,3,'#4a5670');if(sp>=1&&sp<1.2){px(xx-2,yy-3,5,6,'#ffffff');}}
      A(out*.5);px(x-w*.2,gy-h*1.02,w*.4,1,col);break;}
    case 'mark':{// a bright mark over the head: rays, an exclamation, a shout on each side
      const pr=1+.14*Math.sin(s*14),yy=hd-7-Math.sin(Math.min(1,q*2)*Math.PI)*3,r=6*pr*lg;A(out);for(let i=0;i<8;i++){const a=i/8*TAU+s*.8,l=(i%2?r*.6:r);ln(x+Math.cos(a)*3,yy+Math.sin(a)*3,x+Math.cos(a)*(3+l),yy+Math.sin(a)*(3+l),i%2?col:'#ffffff',1);}
      ell(x,yy,4,4,col);px(x-.5,yy-3,2,4,'#ffffff');px(x-.5,yy+2,2,1,'#ffffff');A(out*(1-q)*.9);ctx.strokeStyle=col;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,cy-h*.2,w*.9+q*8,-.9,.9);ctx.stroke();ctx.beginPath();ctx.arc(x,cy-h*.2,w*.9+q*8,Math.PI-.9,Math.PI+.9);ctx.stroke();break;}
    case 'reticle':{// a reticle closes in on the hero, then flashes
      const r=w*2*(1-fkE(Math.min(1,q/.6)))+w*.55,c2=cy-h*.1;A(out);ell(x,c2,r,r,col,1);for(let i=0;i<4;i++){const a=i*1.5708;ln(x+Math.cos(a)*(r-3),c2+Math.sin(a)*(r-3),x+Math.cos(a)*(r+3),c2+Math.sin(a)*(r+3),'#ffffff',1);}
      if(q>.55){A((1-q)*2.2);star4(x,c2,Math.round(5+q*5),'#ffffff');px(x-1,c2-1,3,3,col);}break;}
    case 'sigils':{// a spinning purple sigil circle on the floor and a rune that rises
      A(out*.85*lg);ctx.strokeStyle=col;ctx.lineWidth=1;ell(x,gy-1,w*1.35,4,col,1);ell(x,gy-1,w*.85,2.6,'#e0b0ff',1);
      for(let i=0;i<6;i++){const a=s*2+i/6*TAU;px(x+Math.cos(a)*w*1.1,gy-1+Math.sin(a)*3.2,2,1,i%2?'#ffffff':col);}
      const k=(q*1.4)%1,yy=gy-k*h*1.1;A(Math.sin(k*Math.PI)*out);ctx.strokeStyle='#e0b0ff';ell(x,yy,3,3,'#e0b0ff',1);ln(x-3,yy,x+3,yy,col);ln(x,yy-3,x,yy+3,col);break;}
    case 'hexstar':{// a hexagram turns above the head; stacks show as pips
      const yy=hd-8,r=6*lg+1,a0=s*2.6;A(out);ctx.strokeStyle=col;ctx.lineWidth=1;for(let j=0;j<2;j++){ctx.beginPath();for(let i=0;i<3;i++){const a=a0+j*Math.PI/3*1+i/3*TAU+(j?Math.PI/3:0);i?ctx.lineTo(x+Math.cos(a)*r,yy+Math.sin(a)*r):ctx.moveTo(x+Math.cos(a)*r,yy+Math.sin(a)*r);}ctx.closePath();ctx.stroke();}
      px(x,yy,1,1,'#ffffff');for(let i=0;i<(p.v||1);i++)px(x-(p.v||1)+i*2,yy+r+2,1,1,'#ffffff');A(out*.4);ell(x,cy,w*.9,h*.5,col,1);break;}
    case 'gather':{// power gathers: motes stream in, a ring shrinks on the floor, the body glows; bosses are bigger
      const B2=p.big?1.6:1,n=Math.round(12*lg);for(let i=0;i<n;i++){const k=((q*1.5+i/n)%1),a=i*2.4+s*3,rr=(1-k)*(w*1.8+10)*B2;A(k*.9*out);px(x+Math.cos(a)*rr,cy+Math.sin(a)*rr*.7,2,2,i%2?col:'#ffffff');}
      const gr=(w*1.8+6)*B2*(1-fkE((q*1.4)%1)*.7);A(out*.8);ell(x,gy-1,gr,gr*.32,col,1);const g=ctx.createRadialGradient(x,cy,1,x,cy,h*.7*B2);g.addColorStop(0,col+'88');g.addColorStop(1,col+'00');A(out*(.4+.4*Math.sin(s*9)));ctx.fillStyle=g;ctx.fillRect(x-h,cy-h,h*2,h*2);break;}
    case 'warn':{// a warning triangle with an exclamation mark pops over the head
      const yy=hd-9-Math.min(1,q*4)*2,sc=.6+.5*fkE(Math.min(1,q*3)),r=6*sc;A(out);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,yy-r);ctx.lineTo(x+r,yy+r*.8);ctx.lineTo(x-r,yy+r*.8);ctx.closePath();ctx.globalAlpha*=.85;ctx.fill();A(out);ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.stroke();
      px(x-.5,yy-r*.4,1.5,r*.8,'#3a1a08');px(x-.5,yy+r*.55,1.5,1.5,'#3a1a08');A(out*(1-q));ell(x,yy,r*(1+q*2),r*(1+q*2),col,1);break;}
    case 'target':{// a red target ring on the floor that tightens
      const r=w*1.5*(1.5-.5*fkE(Math.min(1,q/.5)));A(out);ell(x,gy-1,r,r*.34,col,1);ell(x,gy-1,r*.55,r*.19,'#ffffff',1);for(let i=0;i<4;i++){const a=i*1.5708+s*.6;px(x+Math.cos(a)*r,gy-1+Math.sin(a)*r*.34,2,1,col);px(x+Math.cos(a)*r*1.2,gy-1+Math.sin(a)*r*.34*1.2,1,1,'#ffffff');}A(out*.3);ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,gy-1,r*.55,r*.19,0,0,7);ctx.fill();break;}
    case 'rod':{// a lightning rod rises over the head and crackles
      const hh=Math.min(1,q*4)*14,yy=hd-1;A(out);px(x,yy-hh,1,hh,'#8a8a9a');px(x-1,yy-hh,3,1,'#ffe04a');const Rr=mulberry(Math.floor(sd+t/50));for(let i=0;i<3;i++){let ax=x,ay=yy-hh;A(out*.9);ctx.strokeStyle=i?col:'#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ax,ay);for(let j=0;j<4;j++){ax+=(Rr()-.5)*10;ay+=3+Rr()*3;ctx.lineTo(ax,ay);}ctx.stroke();}break;}
    case 'frost':{// frost creeps up from the feet
      const k=fkE(Math.min(1,q/.6));A(out*.45);ctx.fillStyle='#bfefff';ctx.beginPath();ctx.ellipse(x,gy-1,w*(.6+.5*k),3,0,0,7);ctx.fill();
      const n=Math.round(9*lg);for(let i=0;i<n;i++){const sx=x+(i/(n-1)-.5)*w*1.6,L=(h*.6)*k*(.4+.6*((i*5)%4)/3);A(out);for(let j=0;j<L;j+=2){const xx=sx+Math.sin(j*.8+i)*1.2;px(xx,gy-1-j,1,2,j>L-3?'#ffffff':(i%2?'#bfefff':'#7ac8f0'));}}
      for(let i=0;i<4;i++){A(out*.8);const a=s*1.3+i*1.6;px(x+Math.cos(a)*w*.9,gy-h*(.2+.2*i),1,1,'#ffffff');}break;}
    case 'afterimage':{// ghost copies of the figure slide out and back
      let img=null;try{img=p.u&&spriteOf(p.u);}catch(e){}
      if(img){const dx0=R(x-img.width/2),dy0=R(gy-img.height+1);for(let i=3;i>=1;i--){const off=Math.sin(Math.min(1,q)*Math.PI)*i*5;A(out*.28/i*1.6);ctx.globalCompositeOperation='lighter';if(p.u.side==='p'){ctx.save();ctx.translate(dx0+off*dir+img.width,dy0);ctx.scale(-1,1);ctx.drawImage(img,0,0);ctx.restore();}else ctx.drawImage(img,dx0+off*dir,dy0);}ctx.globalCompositeOperation='source-over';}
      for(let i=0;i<4;i++){const k=((q*1.3+i*.25)%1);A((1-k)*out);px(x+dir*(w*.5+k*14),gy-h*(.2+i*.2),5,1,col);}break;}
    case 'mist':{// pale mist bands drift across the body
      for(let i=0;i<5;i++){const k=((q*.9+i*.2)%1),yy=gy-h*(.1+i*.2);A(Math.sin(k*Math.PI)*out*.55);ctx.fillStyle=col;const ww=w*1.5+6;ctx.fillRect(R(x-ww+(k*2-1)*8*dir),R(yy),R(ww*2),2);ctx.globalAlpha*=.6;ctx.fillRect(R(x-ww*.6-(k*2-1)*6*dir),R(yy+2),R(ww*1.2),1);}break;}
    case 'panes':{// mirror panes flash around the body and a glint sweeps over them
      for(let i=0;i<3;i++){const a=i/3*TAU+.4,xx=x+Math.cos(a)*w*1.05,yy=cy+Math.sin(a)*h*.4,r=4+i;A(out*.85);ctx.fillStyle=col;ctx.globalAlpha*=.4;ctx.beginPath();ctx.moveTo(xx,yy-r);ctx.lineTo(xx+r*.7,yy);ctx.lineTo(xx,yy+r);ctx.lineTo(xx-r*.7,yy);ctx.closePath();ctx.fill();A(out);ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.stroke();
        const g=((q*1.8+i*.3)%1);if(g<.3)px(xx-r*.7+g*r*4,yy-r+g*r*2,1,3,'#ffffff');}break;}
    case 'waves':{// waves rise from the floor to the waist
      for(let j=0;j<3;j++){const lvl=Math.min(1,q*2.4-j*.15)*h*(.25+j*.14);A(out*(.8-j*.15));ctx.strokeStyle=j?'#8ad0ff':col;ctx.lineWidth=1.4;ctx.beginPath();for(let i=-8;i<=8;i++){const xx=x+i*w*.12,yy=gy-lvl+Math.sin(s*7+i*.9+j)*1.5;i===-8?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);}ctx.stroke();}
      for(let i=0;i<5;i++){const k=((q*1.5+i*.2)%1);A((1-k)*out);px(x+(i-2)*w*.4,gy-k*h*.7,1,1,'#ffffff');}break;}
    case 'gloom':{// darkness drips down over the figure with a pair of pale eyes
      const k=fkE(Math.min(1,q/.5));A(out*.5*k);ctx.fillStyle='#14081e';ctx.fillRect(R(x-w*1.1),R(hd-4),R(w*2.2),R(h*k+4));for(let i=0;i<5;i++){A(out*.8);const L=(h*.5+(i%3)*6)*k;px(x+(i-2)*w*.4,hd,2,L,'#2a1a3e');}
      if(q>.3){A(out*.9);px(x-3,hd+h*.2,2,1,'#d8c8ff');px(x+2,hd+h*.2,2,1,'#d8c8ff');}break;}
    case 'unmake':{// the figure comes apart into drifting squares while a ring counts down
      const r=(w*2+8)*(1-fkE(Math.min(1,q/.8)));A(out);ell(x,cy,r,r,col,1);for(let i=0;i<14;i++){const k=((q*1.2+i/14)%1),a=i*2.4,rr=w*.6+k*w*1.4;A((1-k)*out);px(x+Math.cos(a)*rr,cy+Math.sin(a)*rr*h/(w*2+1)-k*6,2,2,i%3?col:'#ffffff');}break;}
    case 'bubbles':{// bubbles wobble up out of the body, drops fall from it
      const n=Math.round(7*lg);for(let i=0;i<n;i++){const k=((q*1.3+i/n)%1),bx=x+Math.sin(s*3+i*2)*w*.7,by=gy-h*.2-k*h*.9,r=1+(i%3);A(Math.sin(k*Math.PI)*out);ell(bx,by,r,r,col,1);px(bx-r*.4,by-r*.4,1,1,'#ffffff');}
      for(let i=0;i<3;i++){const k=((q*1.5+i*.33)%1);A((1-k)*out);px(x+(i-1)*w*.5,cy+h*.1+k*h*.45,1,2,i%2?'#7a3aa0':col);}A(out*.25);ell(x,cy,w*.8,h*.5,col);break;}
    case 'streaks':{// red slash streaks, then drips
      for(let i=0;i<4;i++){const sp=Math.min(1,Math.max(0,(q-i*.08)/.25));if(sp<=0)continue;const xx=x-w*.7+i*w*.5,yy=cy-h*.3,L=h*.55*sp;A((1-Math.max(0,(q-.5)*1.6))*out);ln(xx,yy,xx+L*.55,yy+L,i%2?col:'#ffb0b0',i%2?2:1);}
      for(let i=0;i<4;i++){const k=((q*1.4+i*.25)%1);A((1-k)*out);px(x-w*.7+i*w*.5+4,cy+k*h*.5,1,2,col);}break;}
    case 'embers':{// embers rise and flicker, small tongues lick at the feet
      const n=Math.round(10*lg);for(let i=0;i<n;i++){const k=((q*1.2+i/n)%1),xx=x+Math.sin(s*5+i*1.7)*w*.8,yy=gy-k*h*1.15;A(Math.sin(k*Math.PI)*out*(Math.floor(s*14+i)%2?1:.6));px(xx,yy,k<.5?2:1,k<.5?2:1,i%3===0?'#ffe08a':i%3===1?'#ff8a3a':'#ff5a1a');}
      for(let i=0;i<3;i++){A(out*.7*lg);const fh=3+Math.abs(Math.sin(s*12+i*2))*4;px(x+(i-1)*w*.5,gy-fh,2,fh,i===1?'#ffb04a':'#ff6a1a');}A(out*.25);ell(x,gy-2,w*.9,3,'#ff6a1a');break;}
    case 'chains':{// chains drop onto the legs and drag
      const k=fkE(Math.min(1,q/.35));A(out);for(const sd2 of [-1,1]){const cx=x+sd2*w*.7;for(let j=0;j<6;j++){const yy=gy-h*.9+ (h*.8)*k*(j/5);px(cx,yy,j%2?1:2,j%2?2:1,'#c8c8d8');px(cx+(j%2?1:0),yy+1,1,1,'#6a6a7a');}}
      for(let i=0;i<10;i++){const a=i/10*TAU+Math.sin(s*3)*.15;A(out*k);const xx=x+Math.cos(a)*w*.9,yy=gy-3+Math.sin(a)*3;px(xx,yy,2,1,i%2?'#c8c8d8':'#7a7a8a');}A(out*k);ell(x+w*.9,gy-1,2.5,2,'#4a4a58');break;}
    case 'stars':{// stars circle the head
      for(let i=0;i<3;i++){const a=s*6+i/3*TAU,xx=x+Math.cos(a)*(w*.6+2),yy=hd-3+Math.sin(a)*3;A(out*(Math.sin(a)>0?1:.55));star4(xx,yy,2,col);px(xx,yy,1,1,'#ffffff');}
      A(out*(1-q)*.8);star4(x,hd+3,Math.round(7*(1-q)),'#ffffff');break;}
    case 'ink':{// an ink splash over the eyes, with drips
      const sp=fkE(Math.min(1,q/.2)),r=6*sp,yy=hd+h*.18;A(out);ctx.fillStyle='#14141c';ctx.beginPath();for(let i=0;i<9;i++){const a=i/9*TAU,rr=r*(.7+.5*((i*7)%3)/2);i?ctx.lineTo(x+Math.cos(a)*rr,yy+Math.sin(a)*rr):ctx.moveTo(x+Math.cos(a)*rr,yy+Math.sin(a)*rr);}ctx.closePath();ctx.fill();px(x-2,yy-2,2,1,'#6a6a7a');
      for(let i=0;i<3;i++)px(x+(i-1)*3,yy+r*.6,1,Math.min(14,(q*40-i*3)),'#14141c');for(let i=0;i<5;i++){const a=i*1.3+sd;A((1-q)*out);px(x+Math.cos(a)*(r+q*10),yy+Math.sin(a)*(r+q*8),1,1,'#14141c');}break;}
    case 'roots':{// roots creep up from the ground
      const n=Math.round(6*lg);for(let i=0;i<n;i++){const L=h*.7*fkE(Math.min(1,q/.55))*(.5+.5*((i*3)%4)/3),bx=x+(i/(n-1)-.5)*w*1.7;A(out);for(let j=0;j<L;j++){const xx=bx+Math.sin(j*.45+i*1.3)*2.2;px(xx,gy-1-j,1,1,j%3?'#8a5a2a':'#5a3a1a');}if(L>6){px(bx+Math.sin(L*.45+i*1.3)*2.2-1,gy-1-L,3,1,'#7aa04a');}}
      A(out*.5);ell(x,gy-1,w*1.1,3,'#5a3a1a');break;}
    case 'droop':{// a sword above the head droops down; a minus sign
      const yy=hd-5,a=-1.5708+fkE(Math.min(1,q/.6))*1.9;A(out);ln(x,yy+6,x+Math.cos(a)*9,yy+6+Math.sin(a)*9,'#e8e8f0',1.4);ln(x,yy+6,x+Math.cos(a)*9,yy+6+Math.sin(a)*9,col,.6);ln(x+Math.cos(a+1.57)*3,yy+6+Math.sin(a+1.57)*3,x-Math.cos(a+1.57)*3,yy+6-Math.sin(a+1.57)*3,'#c8a048',1.2);
      for(let i=0;i<3;i++){const k=((q*1.3+i*.3)%1);A((1-k)*out);px(x+(i-1)*w*.6,hd+k*h*.6,3,1,col);px(x+(i-1)*w*.6+1,hd+k*h*.6+1,1,1,col);}break;}
    case 'crack':{// the guard cracks: lines race out from a point, shards fall
      const k=fkE(Math.min(1,q/.3)),c2=[x,cy-h*.05];A(out);for(let i=0;i<5;i++){const a=i/5*TAU+sd;let ax=c2[0],ay=c2[1];ctx.strokeStyle=i%2?col:'#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ax,ay);for(let j=0;j<4;j++){ax+=Math.cos(a+(j%2?.5:-.5))*4*k*(h/40+.5);ay+=Math.sin(a+(j%2?.5:-.5))*4*k*(h/40+.5);ctx.lineTo(ax,ay);}ctx.stroke();}
      if(q<.18){A((1-q/.18)*.8);star4(c2[0],c2[1],5,'#ffffff');}for(let i=0;i<5;i++){const kk=Math.max(0,q-.25-i*.04)/.5;if(kk<=0||kk>1)continue;A((1-kk)*out);px(x+(i-2)*w*.4,cy+kk*kk*h*.6,2,2,i%2?col:'#e8d8c0');}break;}
    case 'gash':{// a deep wound opens across the body and is stitched with ticks
      const k=fkE(Math.min(1,q/.3)),x0=x-w*.5,y0=cy-h*.35,x1=x+w*.5,y1=cy+h*.3;A(out);ln(x0,y0,x0+(x1-x0)*k,y0+(y1-y0)*k,'#2a0808',3);ln(x0,y0,x0+(x1-x0)*k,y0+(y1-y0)*k,col,1.4);
      if(q>.3)for(let i=0;i<4;i++){const f=(i+.5)/4,xx=x0+(x1-x0)*f,yy=y0+(y1-y0)*f;ln(xx-2,yy-2,xx+2,yy+2,'#f0d8c0',1);}for(let i=0;i<3;i++){const kk=((q*1.4+i*.3)%1);A((1-kk)*out);px(x0+(x1-x0)*(.3+i*.2),y0+(y1-y0)*(.3+i*.2)+kk*h*.4,1,2,col);}break;}
    case 'runes':{// runes orbit the body
      for(let i=0;i<4;i++){const a=s*3.5+i/4*TAU,xx=x+Math.cos(a)*(w*1.0+2),yy=cy+Math.sin(a)*h*.28-Math.sin(a*.5)*2;A(out*(Math.sin(a)>0?1:.6));ctx.fillStyle=col;ctx.fillRect(R(xx)-1,R(yy)-2,3,5);px(xx,yy-1,1,3,'#ffffff');px(xx-1,yy,3,1,'#ffffff');}A(out*.3);ell(x,cy,w*1.0+2,h*.28,col,1);break;}
    case 'bell':{// a bell with a slash through it: muted
      const yy=hd-6,sw=Math.sin(s*14)*(1-q)*2;A(out);ctx.fillStyle='#c8a048';ctx.beginPath();ctx.moveTo(x-4+sw,yy+3);ctx.quadraticCurveTo(x+sw,yy-6,x+4+sw,yy+3);ctx.lineTo(x+5+sw,yy+4);ctx.lineTo(x-5+sw,yy+4);ctx.closePath();ctx.fill();px(x+sw,yy+5,1,1,'#ffffff');ln(x-6,yy-4,x+6,yy+6,col,1.6);break;}
  }
}

// ---------- spawning: the apply burst, the loops that linger, the tick pulse ----------
function fkStatCol(key){try{return STS[key]&&STS[key].c||'#ffffff';}catch(e){return '#ffffff';}}
function fkStatus(u,key,good,txt,o){o=o||{};const sh=FK_SH[key];if(!sh||!u||gfxStill())return false;const c=centerOf(u),b=unitBox(u);if(!c||!b)return false;
  const T=performance.now();u._fkS=u._fkS||{};if(!o.lg&&T-(u._fkS[key]||0)<300)return true;u._fkS[key]=T;
  let st=T+(o.lg?0:good?40:IMPACT)+(o.i||0)*50;if(!o.lg){const q=Math.max(st,u._fkQ||0);st=q;u._fkQ=q+90;}
  const gy=b.gy!=null?b.gy:b.y,w=Math.max(6,Math.min(b.w,40)*.5),col=fkStatCol(key),hd=typeof hbsOn==='function'&&hbsOn();FK.key='st_'+key;
  const sp={s:'st',gl:sh,sh,x:b.x,y:gy,w,h:Math.max(14,b.h),col,u,dir:u.side==='p'?1:-1,seed:Math.random()*1000,v:u.st&&u.st[key]&&u.st[key].v||0,big:!!u.boss,lg:o.lg?1:0,t0:st,life:Math.round((FK_SHL[sh]||680)*(o.lg?1.1:1)*(o.life||1))};
  if(hd&&FK_SHADD.test(sh))sp.add=1;else sp.add=0;fkP(sp);
  if(!o.lg&&typeof hbsStatus==='function')hbsStatus(key,sh,b.x,c.y,gy,st,{w,good,big:!!u.boss});
  return true;}
// statuses that stay on screen as a quiet loop while they last (one live loop per unit and status, 6 at most on the stage)
const FK_LINGER={poison:1,burn:1,bleed:1,charge:1,curse:1,hex:1,stun:1,root:1,wound:1,g_tele:1,g_mark:1,g_rod:1,g_chill:1,g_veil:1,g_tide:1,g_dark:1,g_air:1,g_mirror:1,rk_unmake:1,taunt:1};
function fkLinger(now){if(!B||B.over||gfxStill()||V.screen!=='battle')return;let live=0;const P=BV.P;for(let i=0;i<P.length;i++)if(P[i].k==='fk'&&P[i].s==='st'&&P[i].lg&&now-P[i].t0<P[i].life)live++;if(live>=6)return;
  const all=B.en.concat(B.front);for(let i=0;i<all.length&&live<6;i++){const u=all[i];if(!u||u.hp<=0||!u.st)continue;const keys=Object.keys(u.st);let n=0;
    for(let j=0;j<keys.length&&n<2;j++){const k=keys[j];if(!FK_LINGER[k]||!FK_SH[k])continue;n++;u._fkL=u._fkL||{};if(now-(u._fkL[k]||0)<(k==='charge'?800:1500))continue;u._fkL[k]=now+((i*131+j*53)%400);
      try{fkStatus(u,k,!STS[k].bad,STS[k].n,{lg:1});live++;}catch(e){}}}}
// a tick of poison, burn or bleed: a loop pulse and a tint on the sprite
{const o0=onFx;onFx=function(u,txt,cls){const r=o0.apply(this,arguments);try{if(u&&B&&V.screen==='battle'&&!gfxStill()&&/dmg (poison|burn|bleed)/.test(cls||'')){const k=String(cls).split(' ')[1];
  u._fkTint={col:k==='poison'?'#8a3ad0':k==='burn'?'#ff7a2a':'#e03030',t0:Date.now(),life:320,a:.75};fkStatus(u,k,false,txt,{lg:1,life:.8});}}catch(e){}return r;};}
// ---------- a real tint pass on the sprite (element hits, ticks, knock-outs): BV.tint is the hook drawUnit already reads, so both renderers take it ----------
const FKT=new WeakMap();
function fkTintImg(img,col,lv){if(!img||!img.width)return img;let m=FKT.get(img);if(!m){m={};try{FKT.set(img,m);}catch(e){return img;}}const key=col+lv;if(m[key])return m[key];
  let o;try{o=img.hd&&typeof hdCv==='function'?hdCv(img.width,img.height,img.hd):mkCv(img.width,img.height);const x=o.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-atop';x.globalAlpha=Math.min(.9,lv*.2);x.fillStyle=col;x.fillRect(0,0,img.width+1,img.height+1);
    x.globalAlpha=Math.min(.6,lv*.1);x.fillStyle='#ffffff';x.fillRect(0,0,img.width+1,img.height+1);}catch(e){return img;}
  return m[key]=o;}
function fkTintOf(u,r,T){let t=null;if(r&&r.tint&&r.ta>.05)t={col:r.tint,lv:Math.max(1,Math.min(4,Math.ceil(r.ta*4)))};
  const k=u._fkTint;if(!t&&k){const e=1-(T-k.t0)/k.life;if(e>0)t={col:k.col,lv:Math.max(1,Math.min(4,Math.ceil(e*k.a*4)))};else u._fkTint=null;}return t;}
// ---------- the knock-out of a foe by the kind of the blow that felled it ----------
function fkKOState(u,T){if(gfxStill()||u.side!=='e'||u.hp>0||!u.deathT)return null;const d=T-u.deathT-IMPACT;if(d<=0||d>=700)return null;const R=u.fk11r;if(!R||Math.abs(R.t-u.deathT)>1800)return null;return {d,q:d/700,R};}
function fkKOSpawn(u,b,ko){if(u._fkKo===u.deathT)return;u._fkKo=u.deathT;const R=ko.R,gy=b.gy!=null?b.gy:b.y,cy=gy-b.h*.5,now=performance.now()+IMPACT,Rd=Math.random,el=R.k==='mag'?R.fx:null,back=u.side==='e'?-1:1;FK.key='ko_'+(el||R.k);
  const dots=(n,f)=>{for(let i=0;i<fkN(n);i++)f(i);};
  if(el==='fire')dots(10,i=>fkDot(b.x+(Rd()-.5)*b.w*.7,cy+(Rd()-.5)*b.h*.5,(Rd()-.5)*14,-18-Rd()*26,now+i*30,520,i%2?'#ffb04a':'#ff5a1a',-14));
  else if(el==='ice')dots(12,i=>fkDot(b.x+(Rd()-.5)*b.w*.8,cy+(Rd()-.5)*b.h*.7,(Rd()-.5)*40,-10-Rd()*20,now+i*20,520,i%2?'#ffffff':'#bfefff',260,2));
  else if(el==='lightning'){fkP({s:'burst',x:b.x,y:cy,r:9,col:'#fff6a0',t0:now,life:260});dots(8,i=>fkDot(b.x,cy,Math.cos(i)*50,Math.sin(i)*40-10,now,300,i%2?'#ffffff':'#fff6a0',80));}
  else if(el==='water')dots(10,i=>fkDot(b.x+(Rd()-.5)*b.w*.6,cy,(Rd()-.5)*50,-30-Rd()*30,now+i*18,480,i%2?'#8ad0ff':'#ffffff',300));
  else if(el==='earth'){fkP({s:'dust',x:b.x,y:gy-1,r1:12,t0:now,life:420});dots(7,i=>fkDot(b.x+(Rd()-.5)*b.w*.7,gy-3,(Rd()-.5)*40,-20-Rd()*20,now+i*20,460,i%2?'#8a6a3a':'#5a4a2a',300,2));}
  else if(el==='wind')dots(8,i=>fkDot(b.x+(Rd()-.5)*b.w*.5,cy+(Rd()-.5)*b.h*.5,back*(40+Rd()*40),-6-Rd()*10,now+i*24,520,i%2?'#c8f0e0':'#5fc9a0',0));
  else if(el==='light'){fkP({s:'glow',x:b.x,y:cy,r:22,col:'#fff6c8',t0:now,life:480});dots(9,i=>fkDot(b.x+(Rd()-.5)*b.w*.6,cy+(Rd()-.5)*b.h*.5,0,-16-Rd()*18,now+i*34,560,i%2?'#ffffff':'#ffe9a0',-6));}
  else if(el==='shadow')dots(10,i=>fkDot(b.x+(Rd()-.5)*b.w*.6,cy+(Rd()-.5)*b.h*.6,(Rd()-.5)*8,-14-Rd()*18,now+i*30,640,i%2?'#3a2a5a':'#9a6ae0',-8));
  else if(R.k==='slash')fkP({s:'arc',x:b.x,y:cy,dir:-back,L:14,ay:.9,bow:3,th:3,col:'#ffffff',col2:'#ffd0d0',t0:now-60,life:260});
  else if(R.k==='blunt'){fkP({s:'shock',x:b.x,y:gy,r:22,col:'#ffd9a0',seed:1,t0:now,life:380});fkP({s:'dust',x:b.x,y:gy-1,r1:10,t0:now,life:400});}
  else if(R.k==='pierce')fkP({s:'streak',x:b.x,y:cy,dir:back,n:3,sp:4,len:20,col:'#ffffff',t0:now,life:300});
  else dots(5,i=>fkDot(b.x,cy,back*(20+Rd()*20),-12-Rd()*16,now,360,'#fff6d0',200));}
// the drawing parameters of a knock-out: [dx, dy, sx, sy, rot, tint, tintLevel, clipGround, split]
function fkKOParams(ko,b){const q=ko.q,e=fkE(q),R=ko.R,back=-1,el=R.k==='mag'?R.fx:null;let o={dx:0,dy:0,sx:1,sy:1,rot:0,tint:null,lv:0,clip:0,split:0};
  if(el==='fire'){o.tint='#1a0a05';o.lv=Math.min(4,1+Math.floor(q*4));o.sy=1-.12*e;}
  else if(el==='ice'){o.tint='#cfefff';o.lv=Math.min(4,2+Math.floor(q*3));o.dx=(Math.floor(q*40)%2?1:-1)*(1-q)*1.5;}
  else if(el==='lightning'){o.tint=Math.floor(q*18)%2?'#ffffff':'#202030';o.lv=3;o.dx=(Math.floor(q*30)%2?2:-2)*(1-q);}
  else if(el==='water'){o.tint='#3f8fe0';o.lv=Math.min(4,1+Math.floor(q*4));o.sy=1-.7*e;o.sx=1+.45*e;}
  else if(el==='earth'){o.tint='#7a5a30';o.lv=2;o.dy=b.h*.9*e;o.clip=1;}
  else if(el==='wind'){o.dx=back*34*e;o.sx=1+.2*e;}
  else if(el==='light'){o.tint='#ffffff';o.lv=Math.min(4,2+Math.floor(q*3));o.dy=-8*e;}
  else if(el==='shadow'){o.tint='#2a1048';o.lv=Math.min(4,1+Math.floor(q*4));o.sy=1+.35*e;o.sx=1-.4*e;}
  else if(R.k==='slash'){o.split=1;}
  else if(R.k==='blunt'){o.sy=1-.78*fkE(Math.min(1,q*1.6));o.sx=1+.4*fkE(Math.min(1,q*1.6));}
  else if(R.k==='pierce'){o.dx=back*30*e;o.rot=back*.5*e;}
  else if(R.k==='ranged'){o.rot=back*1.3*e;o.dy=b.h*.12*e;}
  return o;}

// ---------- the old class-based effects stand down while a kind effect plays ----------
{const f=arcSlash;arcSlash=function(){if(FK.mute)return;return f.apply(this,arguments);};}
{const f=streak;streak=function(){if(FK.mute)return;return f.apply(this,arguments);};}
{const f=projectile;projectile=function(){if(FK.mute)return;return f.apply(this,arguments);};}
{const f=notes;notes=function(){if(FK.mute)return;return f.apply(this,arguments);};}
{const f=converge;converge=function(){if(FK.mute)return;return f.apply(this,arguments);};}
{const ap0=anPhys;anPhys=function(){if(FK.muteHit)return;return ap0.apply(this,arguments);};}
// ---------- the effects on a target when a blow lands ----------
function fkSlash(I,x,y,start,s,h,col,after,dirA){const dir=dirA,L=(10+h*.3)*s*(1+(fkK()-1)*.4);fkP({s:'arc',x,y,dir,L,ay:.85,bow:L*.25,th:4,col:I.lim?'#fff6c8':col,col2:col,t0:start-70,life:290});
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
    const nh=I.rand?1:Math.max(1,H.hits||I.hits),n=Math.min(5,nh);
    if(I.el&&ELC[I.el]){const ec=ELC[I.el];for(let i=0;i<fkN(5);i++){const ang=Math.random()*6.28;fkDot(x,y,Math.cos(ang)*50,Math.sin(ang)*40-20,start+st+80,260+Math.random()*160,i%2?ec:'#ffffff',60);}fkP({s:'burst',x,y,r:5*s,col:ec,t0:start+st+60,life:260});}
    for(let j=0;j<n;j++){const ox=n>1?((j%2)?3:-3)*Math.min(2,j)+(j-(n-1)/2)*2:0,oy=n>1?(j%3-1)*3:0;one(ox,oy,start+st+j*68,j);}
    if(nh>1)fkP({s:'cnt',n:nh,x:x+8,y:y-h*.55,col:'#ffe08a',t0:start+st+n*68-30,life:520});
  }
  if(typeof hbsKind==='function')hbsKind(I.k==='mag'?'mag':I.k,x,y,gy,start+st,{big:I.big,w,col,el:I.el});
  if(I.k==='mag')fkMagHit(I,H,x,y,gy,start+st,s,h,w);
  try{fkSigHit(I,H,x,y,gy,start+st,w,h);}catch(e){}
  fkFeel(I,H,x,y,start+st);}
// timing and feel: a hit-stop (40 to 60 ms) and a camera punch tuned to the kind, only on blows that are big, critical or a Limit Break
const FK_CAM={slash:[1.03,260],blunt:[1.06,340],pierce:[1.045,220],ranged:[1.02,200],fire:[1.04,320],water:[1.03,300],earth:[1.055,360],wind:[1.03,260],lightning:[1.05,200],ice:[1.035,300],light:[1.04,340],shadow:[1.04,320],arcane:[1.035,280]};
function fkFeel(I,H,x,y,t0){if(gfxStill()||!(I.big||I.lim||H.crit))return;const kind=I.k==='mag'?I.fx:I.k;
  if(I.n<=1||I.lim||H.crit||H.i===0){const d=I.lim?60:I.k==='blunt'?56:I.k==='mag'?(I.area?54:50):I.k==='pierce'?40:44;fkHitStop(t0,H.crit?Math.max(d,52):d);}
  const cam=FK_CAM[kind];if(cam&&H.i===0&&typeof gfxCamPush==='function'&&!I.lim)gfxCamPush(x,y,[1+(cam[0]-1)*(I.big?1:.6),cam[1]]);}
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
// how many blows really landed on each target (combo extra hits, an elite's multi, misses and Wards included): the engine calls calcDamage once per landed blow
{const cd0=calcDamage;calcDamage=function(a,sk,t){const r=cd0.apply(this,arguments);try{const I=FK.cur;if(I&&a===I.a&&t&&sk&&I.sk&&sk.id===I.sk.id){(I.cd||(I.cd=new Map())).set(t,(I.cd.get(t)||0)+1);}}catch(e){}return r;};}
// the hit state: which action's blow this popup is (damage popups of the current perform; heals and status popups of a support skill)
{const o0=onFx;onFx=function(u,txt,cls){const I=FK.cur;let set=false;
  try{if(I&&u&&B&&V.screen==='battle'){
    if(/dmg/.test(cls)&&!/poison|burn|bleed/.test(cls)){const nh=Math.max(1,(I.cd&&I.cd.get(u))||I.hits||1);I.landed=Math.max(I.landed||0,nh);u.fk11r={k:I.k,el:I.el,fx:I.fx,t:Date.now(),lim:I.lim};FK.hit={u,I,i:I.n++,hits:nh,crit:/crit/.test(cls)};set=true;}
    else if(cls==='heal'||/good|bad/.test(cls||'')){FK.hit={u,I,i:I.n++,sup:1,txt};set=true;}}}catch(e){}
  try{return o0.apply(this,arguments);}finally{if(set)FK.hit=null;}};}
// support effects: replace anim.js's one-size chevrons for the skill kinds they were made for
{const af0=anFxText;anFxText=function(u,txt,cls){const I=FK.cur;
  if(gfxStill()||!B||V.screen!=='battle'||!u)return af0.apply(this,arguments);
  if(I&&cls==='heal'&&I.k==='heal'){af0.apply(this,arguments);try{fkHeal(I,u,{i:Math.max(0,I.n-1)});}catch(e){}return;}
  if(/(good|bad)/.test(cls||'')){// a status lands: its own shape, whoever dealt it (a bleed from a bow, a Ward from a Limit Break)
    const key=fkStKey(txt);if(key){try{if(fkStatus(u,key,/good/.test(cls),txt,{i:I?Math.max(0,I.n-1):0}))return;}catch(e){}}
    if(I&&(I.k==='buff'||I.k==='debuff'||I.song)&&!/^(Telegraph|BREAK|Reeling|Stunned|Blocked|Miss)$/.test(String(txt))){try{fkAura(I,u,{i:Math.max(0,I.n-1)},/good/.test(cls),txt);}catch(e){}return;}}
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
// v0.17.10: a hero's hand is the one heropose9.js measured for the pose it strikes (the orb of a cast, the weapon grip, else the rest hand from the grid's '!' marker),
// mapped through the sprite's size and flip; a foe or a hero without a pose frame keeps the old estimate
function fkHandPos(a,c,b,dir,I,frame){try{if(a&&a.side==='p'&&!a.heroArt&&!a.isComp&&typeof heroHand==='function'&&typeof spriteOf==='function'){
    const st=typeof animStyle==='function'?animStyle(a):'swing',pose=I&&typeof heroPoseFor==='function'?heroPoseFor(I.sk,I.dl,st):null,H=heroHand(a.id,pose||'rest',frame||0,false);
    if(H&&H.w){const img=spriteOf(a),w=img.width,h=img.height;return {x:b.x-w/2+(1-H.x/H.w)*w,y:b.y-h+1+H.y/H.h*h,m:1};}}}catch(e){}
  return {x:c.x+dir*Math.round(b.w*.36),y:c.y-Math.round(b.h*.3)};}
function fkAct(a,I,now){const c=centerOf(a),b=unitBox(a);if(!c||!b)return;const dir=a.side==='p'?-1:1,tg=fkTargets(a),hand=fkHandPos(a,c,b,dir,I,0),hand1=fkHandPos(a,c,b,dir,I,1),s=I.lim?1.5:1,col=fkColOf(I),R=Math.random,gy=b.gy!=null?b.gy:b.y;FK.key=I.fx;
  const farthest=tg.reduce((m,t)=>{const d=centerOf(t);return d&&Math.abs(d.x-c.x)>Math.abs(m-c.x)?d.x:m;},c.x);
  if(I.lim){fkP({s:'pillar',x:c.x,y:gy,w:9,col:I.k==='heal'||I.k==='buff'?'#bfffc8':'#ffe9a0',t0:now,life:480});fkP({s:'shock',x:c.x,y:gy,r:34,col:'#ffd04a',noCrack:1,seed:0,t0:now+60,life:480});
    if(!BV.flash||BV.flash.t<now-200)BV.flash={t:now,life:240,col:'rgba(255,240,190,.4)'};fkShake(now,260,3);}
  if(I.k==='slash'){fkP({s:'arc',x:hand.x+dir*8,y:c.y-b.h*.1,dir,L:11*s,ay:.9,bow:3,th:3,col:'#eaf2ff',col2:'#9ab8e0',t0:now+IMPACT-120,life:200});
    if(I.area&&tg.length>1){const mx=tg.reduce((m,t)=>m+(centerOf(t)||c).x,0)/tg.length,my=tg.reduce((m,t)=>m+(centerOf(t)||c).y,0)/tg.length,sp=Math.abs(farthest-c.x);
      fkP({s:'arc',x:(mx+c.x)/2,y:my,dir,L:Math.max(24,sp*.55),ay:.14,bow:-10,th:5,col:I.lim?'#fff6c8':'#eaf2ff',col2:col,t0:now+IMPACT-130,life:340});}}
  else if(I.k==='blunt'){for(let i=0;i<fkN(4);i++)fkDot(c.x+dir*8+(R()-.5)*8,gy-2,(R()-.5)*30,-14-R()*10,now+IMPACT-60,260,'#c8b08a',30);
    if(I.area&&tg.length>0){fkP({s:'shock',x:c.x+dir*14,y:gy,r:Math.abs(farthest-c.x)+16,col:I.lim?'#ffd04a':'#ffd9a0',seed:0,noCrack:1,t0:now+IMPACT-70,life:430});}}
  else if(I.k==='pierce'){fkP({s:'streak',x:c.x-dir*4,y:c.y,dir,n:4,sp:4,len:22,col:'#e8e8ff',t0:now+100,life:260});}
  else if(I.k==='ranged'){if(!I.area)tg.forEach(t=>{const d=centerOf(t);if(d)fkP({s:'proj',gl:typeof animStyle==='function'&&animStyle(a)==='crossbow'?'bolt':'arrow',x:hand1.x,y:hand1.y,x2:d.x,y2:d.y,arc:6,trail:5,col,col2:'#8a7a5a',t0:now+120,life:Math.max(50,IMPACT-120)});});
    for(let i=0;i<fkN(3);i++)fkDot(hand.x+dir*3,hand.y+4,dir*(20+R()*20),(R()-.5)*14,now+110,140,'#fff6d0',0);}
  else if(I.k==='mag')fkCast(a,I,now,hand,tg,col,dir,s,hand1);
  else if(I.k==='heal'){fkP({s:'glow',x:hand.x,y:hand.y,r:12,col:'#8dffa0',t0:now,life:IMPACT+160});for(let i=0;i<fkN(6);i++)fkDot(hand.x+(R()-.5)*14,hand.y+6+R()*6,0,-22-R()*20,now+i*28,420,i%2?'#bfffc8':'#ffffff',0);}
  else if(I.k==='buff'){fkP({s:'glow',x:hand.x,y:hand.y-2,r:12,col:I.song?'#ffd04a':'#7affd0',t0:now,life:IMPACT+160});for(let i=0;i<fkN(5);i++)fkDot(hand.x+(R()-.5)*10,hand.y,(R()-.5)*8,-30-R()*24,now+60+i*30,420,'#fff6a0',0);}
  else if(I.k==='debuff'){fkP({s:'gath',x:hand.x,y:hand.y,r:15,n:7,seed:R()*6,t0:now,life:IMPACT-10});
    tg.forEach(t=>{const d=centerOf(t);if(d)fkP({s:'line',x:hand.x,y:hand.y,x2:d.x,y2:d.y,col:'#9a6ae0',gap:1,jig:1.2,t0:now+IMPACT-90,life:240});});}
  try{fkSigAct(I,a,tg,now,c,b,gy,dir);if(I.sig&&typeof hbsFx==='function')hbsFx({x:c.x,y:c.y,gy,start:now,col:I.sig==='sg'?(I.el&&ELC[I.el])||col:col,r:I.lim?96:70,int:I.lim?1.5:1.1,life:760,decal:[Math.max(22,b.w*.8),.7,.25]});}catch(e){}
  if(I.song){fkNotes(c.x,c.y-b.h*.45,now,3,0);for(let i=0;i<3;i++)part({k:'ring',x:c.x,y:gy,t0:now+i*120,life:480,col:i%2?'#ffffff':'#ffd04a',r:26+i*8,flat:1});}
  if(I.k==='mag'&&I.big&&I.area)fkShake(now+IMPACT,240,3);else if(I.k==='mag'&&I.big)fkShake(now+IMPACT,180,2);}
// spell cast: element-specific tell at the hand, then the delivery
function fkCast(a,I,now,hand,tg,col,dir,s,hand1){const el=I.fx,R=Math.random,hx=hand.x,hy=hand.y,H1=hand1||hand,C=el==='arcane'?'#c8a0ff':ELC[el]||'#c8a0ff';
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
    if(el==='fire')fkP({s:'proj',gl:'fire',x:H1.x,y:H1.y,x2:d.x,y2:d.y,arc:10,trail:6,col:'#ffb04a',col2:'#ff5a1a',t0:now+50+i*20,life:L});
    else if(el==='ice')fkP({s:'proj',gl:'shard',x:H1.x,y:H1.y,x2:d.x,y2:d.y,arc:2,trail:4,col:'#bfefff',col2:'#6ab8e0',t0:now+60+i*20,life:L});
    else if(el==='wind')fkP({s:'proj',gl:'gust',x:H1.x,y:H1.y,x2:d.x,y2:d.y,arc:0,trail:0,col:'#c8f0e0',col2:'#5fc9a0',t0:now+60+i*20,life:L});
    else if(el==='water')fkP({s:'proj',gl:'drop',x:H1.x,y:H1.y,x2:d.x,y2:d.y,arc:22,trail:3,col:'#3f8fe0',col2:'#8ad0ff',t0:now+60+i*20,life:L});
    else if(el==='earth'){const g0=gy0(a);fkP({s:'line',x:H1.x-dir*2,y:g0,x2:d.x,y2:fkGy(t,d.y),col:'#b08a4a',jig:1.5,t0:now+60,life:IMPACT+80});}
    else if(el==='light')fkP({s:'line',x:H1.x,y:H1.y,x2:H1.x,y2:2,col:'#fff6c8',t0:now+50,life:260});
    else if(el==='shadow')fkP({s:'line',x:H1.x,y:H1.y,x2:d.x,y2:d.y,col:'#6a3aa0',gap:1,jig:2,t0:now+70,life:IMPACT});
    else if(el==='arcane')fkP({s:'proj',gl:'stone',x:H1.x,y:H1.y,x2:d.x,y2:d.y,arc:8,trail:5,col:'#ffffff',col2:'#c8a0ff',t0:now+50+i*20,life:L});
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
  const nh=Math.max(I.hits,I.landed||0);if(o&&nh>1&&!I.rand&&I.k!=='ranged'&&a>150){const beat=Math.floor((a-150)/62);if(beat<Math.min(6,nh)&&beat%2===0)o.dx+=3;}
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
// ---------- drawUnit: the recoil, the tint pass and the knock-out ----------
{const du0=drawUnit;drawUnit=function(ctx,u,b,now,tgMode){const T=Date.now(),r=fk11Recoil(u,b,T),ko=u.hp<=0?fkKOState(u,T):null,tn=fkTintOf(u,r,T);
  if(!r&&!ko&&!tn)return du0.apply(this,arguments);
  const gy=b.gy!=null?b.gy:b.y,args=arguments,self=this,bt=BV.tint;let K=null,tl=tn;
  if(ko){try{fkKOSpawn(u,b,ko);}catch(e){}K=fkKOParams(ko,b);if(K.tint)tl={col:K.tint,lv:K.lv};}
  if(tl)BV.tint=img=>fkTintImg(bt?bt(img):img,tl.col,tl.lv);
  ctx.save();
  try{
    const o=K||r||{};if(K&&K.clip){ctx.beginPath();ctx.rect(b.x-80,gy-220,160,222);ctx.clip();}// the ground line stays put while the body sinks
    ctx.translate(b.x+(o.dx||0),gy+(o.dy||0));if(o.rot)ctx.rotate(o.rot);ctx.scale(o.sx||1,o.sy||1);ctx.translate(-b.x,-gy);
    if(K&&K.split){const W=b.w+20,H=b.h+20,cy=gy-b.h*.5,s=ko.q*9;
      ctx.save();ctx.beginPath();ctx.moveTo(b.x-W,cy-H*.35);ctx.lineTo(b.x+W,cy+H*.35);ctx.lineTo(b.x+W,gy-H*2);ctx.lineTo(b.x-W,gy-H*2);ctx.closePath();ctx.clip();ctx.translate(-s*.7,-s*.5);ctx.rotate(-ko.q*.12);du0.apply(self,args);ctx.restore();
      ctx.save();ctx.beginPath();ctx.moveTo(b.x-W,cy-H*.35);ctx.lineTo(b.x+W,cy+H*.35);ctx.lineTo(b.x+W,gy+H);ctx.lineTo(b.x-W,gy+H);ctx.closePath();ctx.clip();ctx.translate(s*.7,s*.4);ctx.rotate(ko.q*.1);du0.apply(self,args);ctx.restore();}
    else du0.apply(self,args);
  }finally{BV.tint=bt;ctx.restore();}};}
// ---------- hit-stop and the status loops ride the frame ----------
{const bf0=battleFrame;battleFrame=function(now){try{if(FK.stop&&now>=FK.stop.t0&&now<FK.stop.t0+FK.stop.d&&!gfxStill()&&B&&V.screen==='battle')return;if(FK.stop&&now>=FK.stop.t0+FK.stop.d)FK.stop=null;fkLinger(now);}catch(e){}return bf0.apply(this,arguments);};}
function fkHitStop(t0,d){if(gfxStill()||(META.cfg&&META.cfg.hitstop===false))return;if(!FK.stop||FK.stop.t0+FK.stop.d<t0)FK.stop={t0,d};}

// ============================================================================================================================================
// v0.17.10: signatures. Every Limit Break (Limit I and II), the signature skill of each wayfarer (sg_*) and the named moves of the bosses get a touch of their own
// on top of the kind effect. Each is under about 900 ms and nothing is spawned under reduced motion (the entry points check gfxStill()).
//   Limit: warrior triple arc + ground fissure, knight shield wall, mage constellation + star fall, healer dawn sweep, thief cuts + dash, archer volley from the sky,
//   monk fist flurry + afterimages, sniper stampede + bolts, druid claws + leaves, archmage singularity, chronicler flying pages, bard stave of light
//   sg_*: a seal on the floor whose points are the hero's own (3 to 8 from the id), in the element's colour, again small at each target
//   bosses: windup / gather (floor rune, the line to its mark), Cataclysm, Crushing Charge, Siphon, Flanking Strike, realm gimmick telegraph and release by type, named moves by their kind of word
// ============================================================================================================================================
function fkSigKey(a,sk){if(!sk||!a)return null;
  if(sk.limit){let cls=null;try{cls=TPL[a.id].cls;}catch(e){}return 'lim_'+(cls||'x');}
  if(/^sg_/.test(sk.id||''))return 'sg';
  if(a.side==='e'){if(/^b4(cata|charge|siphon|flank)$/.test(sk.id||''))return sk.id;if(a.boss&&/^e/.test(sk.id||''))return 'bossmove';}
  return null;}
function fkHash(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
// drawn shapes of the signatures (called from fkDraw's default branch)
function fkDraw2(ctx,p,now,t,q){const R=Math.round,TAU=Math.PI*2,A=a=>{ctx.globalAlpha=Math.max(0,Math.min(1,a));},out=q<.6?1:1-(q-.6)/.4,K=p.K||1;
  switch(p.s){
    case 'seal':{// a spinning seal on the floor: two rings, an n pointed star, ticks
      const r=p.r*(.4+.6*fkE(Math.min(1,q*3))),rot=p.rot+t/260*(p.n%2?1:-1),ry=.34;A(out*.9);ctx.strokeStyle=p.col;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*ry,0,0,7);ctx.stroke();ctx.beginPath();ctx.ellipse(p.x,p.y,r*.72,r*.72*ry,0,0,7);ctx.stroke();
      ctx.beginPath();for(let i=0;i<=p.n;i++){const a=rot+((i*Math.floor(p.n/2)+0)%p.n)/p.n*TAU;const px=p.x+Math.cos(a)*r*.72,py=p.y+Math.sin(a)*r*.72*ry;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
      for(let i=0;i<p.n;i++){const a=rot+i/p.n*TAU;A(out);ctx.fillStyle=i%2?'#ffffff':p.col;ctx.fillRect(R(p.x+Math.cos(a)*r)-1,R(p.y+Math.sin(a)*r*ry),2,1);}A(out*.18);ctx.fillStyle=p.col;ctx.beginPath();ctx.ellipse(p.x,p.y,r*.72,r*.72*ry,0,0,7);ctx.fill();break;}
    case 'fiss':{// a crack runs along the ground, glowing, with a dark rim and debris
      const g=fkE(Math.min(1,q/.4)),x2=p.x+(p.x2-p.x)*g,n=Math.max(2,Math.abs(x2-p.x)/3),Rr=mulberry(Math.floor(p.seed*1e3)),pts=[];for(let i=0;i<=n;i++){pts.push([p.x+(x2-p.x)*i/n,p.y+(Rr()-.5)*3+(i%2?1:-1)]);}
      const al=q<.5?1:1-(q-.5)/.5;for(const [lw,c,a2] of [[5,'#3a2a20',.9],[3,p.col,.9],[1,'#ffffff',1]]){A(al*a2);ctx.strokeStyle=c;ctx.lineWidth=lw*Math.min(1.5,K);ctx.beginPath();pts.forEach((pt,i)=>i?ctx.lineTo(pt[0],pt[1]):ctx.moveTo(pt[0],pt[1]));ctx.stroke();}
      A(al*.5);ctx.fillStyle=p.col;ctx.fillRect(R(p.x),R(p.y-8*g),R(x2-p.x)||1,2);break;}
    case 'shield':{// a big shield forms in front of the party and shines
      const sc=.5+.5*fkE(Math.min(1,q*2.5)),hh=p.h*sc,ww=hh*.62,x=p.x,y=p.y-hh*.05;A(out);ctx.fillStyle=p.col;ctx.globalAlpha*=.35;ctx.beginPath();ctx.moveTo(x-ww/2,y-hh);ctx.lineTo(x+ww/2,y-hh);ctx.lineTo(x+ww/2,y-hh*.4);ctx.quadraticCurveTo(x+ww/2,y-hh*.1,x,y);ctx.quadraticCurveTo(x-ww/2,y-hh*.1,x-ww/2,y-hh*.4);ctx.closePath();ctx.fill();
      A(out);ctx.strokeStyle='#ffffff';ctx.lineWidth=1.4;ctx.stroke();ctx.strokeStyle=p.col;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-hh*.9);ctx.lineTo(x,y-hh*.12);ctx.moveTo(x-ww*.34,y-hh*.62);ctx.lineTo(x+ww*.34,y-hh*.62);ctx.stroke();
      const g=((q*1.6)%1);A(out*(1-g)*.8);ctx.fillStyle='#ffffff';ctx.fillRect(R(x-ww/2+g*ww),R(y-hh),2,R(hh*.6));break;}
    case 'fall':{// a star falls on a diagonal, then flashes where it lands
      const u=fkE(Math.min(1,q/.7)),x=p.x0+(p.x-p.x0)*u,y=p.y0+(p.y-p.y0)*u;if(q<.75){for(let i=0;i<7;i++){const uu=Math.max(0,u-i*.04);A((1-i/7)*.8);ctx.fillStyle=i%2?p.col:'#ffffff';ctx.fillRect(R(p.x0+(p.x-p.x0)*uu)-(i<2?1:0),R(p.y0+(p.y-p.y0)*uu)-(i<2?1:0),i<2?3:1,i<2?3:1);}
        A(1);ctx.fillStyle='#ffffff';ctx.fillRect(R(x)-2,R(y),5,1);ctx.fillRect(R(x),R(y)-2,1,5);ctx.fillStyle=p.col;ctx.fillRect(R(x)-1,R(y)-1,3,3);}
      else{const k=(q-.75)/.25,r=R(2+7*k);A(1-k);ctx.fillStyle='#ffffff';ctx.fillRect(R(p.x)-r,R(p.y),r*2+1,1);ctx.fillRect(R(p.x),R(p.y)-r,1,r*2+1);ctx.fillStyle=p.col;ctx.fillRect(R(p.x)-r*.6,R(p.y)-r*.6,2,2);ctx.fillRect(R(p.x)+r*.6,R(p.y)+r*.6,2,2);}break;}
    case 'dawn':{// a band of dawn light sweeps across the party and a sun rises behind it
      const u=fkE(Math.min(1,q/.75)),bx=p.x0+(p.x1-p.x0)*u,bw=46;A(out*.9);const g=ctx.createLinearGradient(bx-bw,0,bx+bw,0);g.addColorStop(0,p.col+'00');g.addColorStop(.5,p.col+'bb');g.addColorStop(1,p.col+'00');ctx.fillStyle=g;ctx.fillRect(R(bx-bw),R(p.y0),bw*2,R(p.y1-p.y0));
      A(out*.7);ctx.fillStyle='#ffffff';ctx.fillRect(R(bx)-1,R(p.y0),2,R(p.y1-p.y0));const sr=14*fkE(Math.min(1,q*2.2));A(out*.55);ctx.fillStyle='#fff0b0';ctx.beginPath();ctx.arc(p.cx,p.y1,sr,Math.PI,0);ctx.fill();
      for(let i=0;i<9;i++){const a=Math.PI+(i+.5)/9*Math.PI;A(out*.4);ctx.strokeStyle='#ffe9a0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.cx+Math.cos(a)*(sr+2),p.y1+Math.sin(a)*(sr+2));ctx.lineTo(p.cx+Math.cos(a)*(sr+14+q*16),p.y1+Math.sin(a)*(sr+14+q*16));ctx.stroke();}break;}
    case 'cuts':{// a flurry of thin cuts from every angle
      const Rr=mulberry(Math.floor(p.seed*1e3));for(let i=0;i<p.n;i++){const a0=i/p.n*.7,k=(q-a0)/.22,ang=Rr()*Math.PI,ox=(Rr()-.5)*14,oy=(Rr()-.5)*12,L=9+Rr()*8;if(k<0||k>1)continue;const e=fkE(Math.min(1,k*2.2)),dx=Math.cos(ang)*L,dy=Math.sin(ang)*L*.7;
        A(1-k);ctx.strokeStyle=p.col;ctx.lineWidth=2*Math.min(1.4,K);ctx.beginPath();ctx.moveTo(p.x+ox-dx,p.y+oy-dy);ctx.lineTo(p.x+ox-dx+dx*2*e,p.y+oy-dy+dy*2*e);ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.stroke();}break;}
    case 'sing':{// a dark point gathers, swells white, and throws lightning out in every direction
      const r=p.r,core=r*.35*(q<.5?fkE(q/.5):1-fkE((q-.5)/.5)*.4);A(out*.8);ctx.fillStyle='#10081c';ctx.beginPath();ctx.arc(p.x,p.y,core,0,7);ctx.fill();A(out);ctx.strokeStyle='#bfefff';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(p.x,p.y,core+1,0,7);ctx.stroke();
      if(q>.3){const Rr=mulberry(Math.floor(p.seed*1e3+t/45));for(let i=0;i<7;i++){const a=i/7*TAU+p.seed;let x=p.x,y=p.y;ctx.strokeStyle=i%2?'#fff6a0':'#bfefff';ctx.lineWidth=1;A(out*.9);ctx.beginPath();ctx.moveTo(x,y);const L=r*(.9+Rr()*.8);for(let s2=1;s2<=5;s2++){const rr=L*s2/5;x=p.x+Math.cos(a)*rr+(Rr()-.5)*5;y=p.y+Math.sin(a)*rr*.8+(Rr()-.5)*5;ctx.lineTo(x,y);}ctx.stroke();}}
      for(let i=0;i<10;i++){const k=((q*1.3+i/10)%1),a=i*2.4;A(k*out);ctx.fillStyle=i%2?'#ffffff':'#8ad0ff';ctx.fillRect(R(p.x+Math.cos(a)*r*(1-k)),R(p.y+Math.sin(a)*r*(1-k)*.8),2,2);}break;}
    case 'pages':{// pages orbit the hero then fly at the foes
      for(let i=0;i<p.n;i++){const k=Math.min(1,Math.max(0,(q-.35-i*.04)/.4)),a=t/140+i/p.n*TAU,ox=Math.cos(a)*(10+i),oy=Math.sin(a)*5-4;const fx=p.x+ox+(p.x2-p.x-ox)*fkE(k),fy=p.y+oy+(p.y2-p.y-oy)*fkE(k);if(k>=1)continue;A(out);ctx.fillStyle='#f4ecd8';ctx.fillRect(R(fx)-2,R(fy)-3,5,6);ctx.fillStyle=p.col;ctx.fillRect(R(fx)-1,R(fy)-2,3,1);ctx.fillRect(R(fx)-1,R(fy),3,1);ctx.fillStyle='#8a6a3a';ctx.fillRect(R(fx)-2,R(fy)-3,1,6);}
      if(q>.75){const k=(q-.75)/.25;A(1-k);ctx.fillStyle=p.col;for(let i=0;i<8;i++){const a=i/8*TAU;ctx.fillRect(R(p.x2+Math.cos(a)*k*14),R(p.y2+Math.sin(a)*k*10),2,1);}}break;}
    case 'stave':{// five lines of light run out over the party, notes ride along them
      const g=fkE(Math.min(1,q/.4)),x2=p.x+(p.x2-p.x)*g;for(let i=0;i<5;i++){A(out*.85);ctx.fillStyle=i%2?p.col:'#fff6c8';ctx.fillRect(R(Math.min(p.x,x2)),R(p.y+(i-2)*3),R(Math.abs(x2-p.x))||1,1);}
      for(let i=0;i<6;i++){const k=((q*1.2+i/6)%1),nx=p.x+(p.x2-p.x)*k,ny=p.y+((i*7)%5-2)*3;if(Math.abs(nx-p.x)>Math.abs(x2-p.x))continue;A(Math.sin(k*Math.PI)*out);ctx.fillStyle='#ffffff';ctx.fillRect(R(nx),R(ny)-1,3,3);ctx.fillStyle=p.col;ctx.fillRect(R(nx)+2,R(ny)-6,1,6);}
      if(q>.7){const k=(q-.7)/.3;A(1-k);ctx.strokeStyle='#ffd04a';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x2,p.y,8+k*18,5+k*10,0,0,7);ctx.stroke();}break;}
    case 'zap':{// a jagged bolt from the top of the stage to a point
      if(Math.floor(t/45)%5===4)break;const Rr=mulberry(Math.floor(p.seed*1e3+t/45));let x=p.x+(Rr()-.5)*24,y=0;const pts=[[x,y]];while(y<p.y){y+=4+Rr()*5;x+=(Rr()-.5)*8;x+=(p.x-x)*.3;pts.push([x,Math.min(y,p.y)]);}
      for(const [lw,c] of [[3,p.col],[1.2,'#ffffff']]){A(out);ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();pts.forEach((pt,i)=>i?ctx.lineTo(pt[0],pt[1]):ctx.moveTo(pt[0],pt[1]));ctx.stroke();}break;}
    case 'ringw':{// a wide ring wave from a point (sound, a hit)
      const r=p.r*Math.sqrt(q);A((1-q)*.9);ctx.strokeStyle=p.col;ctx.lineWidth=p.lw||1.5;ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*(p.sq||.5),0,0,7);ctx.stroke();A((1-q)*.5);ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,r*.82,r*.82*(p.sq||.5),0,0,7);ctx.stroke();break;}
  }
}
// a status-style shape on a unit without a status behind it (gimmick telegraphs, signatures)
function fkShape(u,sh,col,o){o=o||{};if(!u||gfxStill())return;const c=centerOf(u),b=unitBox(u);if(!c||!b)return;const gy=b.gy!=null?b.gy:b.y,hd=typeof hbsOn==='function'&&hbsOn();
  fkP({s:'st',gl:sh,sh,x:b.x,y:gy,w:Math.max(6,Math.min(b.w,40)*.5),h:Math.max(14,b.h),col,u,dir:u.side==='p'?1:-1,seed:Math.random()*1000,v:o.v||0,big:o.big?1:0,lg:0,t0:o.t0||performance.now(),life:o.life||FK_SHL[sh]||680,add:hd&&FK_SHADD.test(sh)?1:0});
  if(typeof hbsStatus==='function')hbsStatus(null,sh,b.x,c.y,gy,o.t0||performance.now(),{w:b.w*.5,col,big:o.big});}
function fkTc(tg){return (tg||[]).map(t=>{const d=centerOf(t),bb=unitBox(t);return d&&bb?{x:d.x,y:d.y,gy:bb.gy!=null?bb.gy:bb.y,h:bb.h,w:bb.w,u:t}:null;}).filter(Boolean);}
// ---------- at the start of the action ----------
function fkSigAct(I,a,tg,now,c,b,gy,dir){const k=I.sig;if(!k)return;const R=Math.random,col=fkColOf(I),L2=I.l2?1.3:1,tc=fkTc(tg),n=tc.length,W=(typeof BL!=='undefined'&&BL.W)||200,H=(typeof BL!=='undefined'&&BL.H)||160;FK.key='sig_'+k;
  const mx=n?tc.reduce((s,t)=>s+t.x,0)/n:c.x+dir*50,my=n?tc.reduce((s,t)=>s+t.y,0)/n:c.y,far=n?tc.reduce((m,t)=>Math.abs(t.x-c.x)>Math.abs(m-c.x)?t.x:m,tc[0].x):c.x+dir*60;
  const E=(f)=>{try{f();}catch(e){}};
  if(k==='lim_warrior'){for(let i=0;i<3;i++)fkP({s:'arc',x:mx+(i-1)*6,y:my+(i-1)*7,dir:dir,L:24*L2,ay:[.9,-.55,.15][i],bow:[6,-5,2][i],th:4,col:'#fff6c8',col2:col,t0:now+IMPACT-120+i*85,life:300});
    fkP({s:'fiss',x:c.x+dir*14,y:gy,x2:far,col:'#ffd04a',seed:R(),K:fkK(),t0:now+IMPACT+130,life:560});fkShake(now+IMPACT+130,300,4);}
  else if(k==='lim_knight'){fkP({s:'shield',x:c.x+dir*16,y:gy,h:b.h*1.25*L2,col:'#bfe0ff',t0:now,life:700});tc.forEach((t,i)=>fkP({s:'pillar',x:t.x,y:t.gy,w:5,col:'#bfe0ff',t0:now+IMPACT+i*70,life:380}));
    for(let i=0;i<2;i++)fkP({s:'ringw',x:c.x,y:gy,r:70*L2+i*20,col:'#bfe0ff',t0:now+180+i*110,life:520});}
  else if(k==='lim_mage'){const top=[];for(let i=0;i<6;i++)top.push([c.x+dir*(8+i*(Math.abs(mx-c.x)+30)/5)+(R()-.5)*8,3+R()*26]);for(let i=0;i<5;i++)fkP({s:'line',x:top[i][0],y:top[i][1],x2:top[i+1][0],y2:top[i+1][1],col:'#fff6c8',t0:now+i*40,life:360});
    top.forEach((p,i)=>fkP({s:'burst',x:p[0],y:p[1],r:3,col:col,t0:now+i*40,life:260}));}
  else if(k==='lim_healer'){const xs=[c.x].concat(tc.map(t=>t.x));const lo=Math.min(...xs)-30,hi=Math.max(...xs)+30;fkP({s:'dawn',x0:lo,x1:hi,y0:2,y1:gy+4,cx:(lo+hi)/2,col:'#ffe08a',t0:now,life:880});
    for(let i=0;i<fkN(8);i++)fkDot(lo+(hi-lo)*R(),gy-R()*b.h*1.4,0,-12-R()*14,now+120+i*50,600,i%2?'#fff6c8':'#ffd0e0',-4);}
  else if(k==='lim_thief'){fkP({s:'st',gl:'afterimage',sh:'afterimage',x:c.x,y:gy,w:15,h:b.h,col:'#8a7aa8',u:a,dir,seed:0,t0:now,life:560,add:0});fkP({s:'streak',x:c.x,y:c.y,dir,n:5,sp:4,len:30,col:'#aab0c8',t0:now+60,life:340});}
  else if(k==='lim_archer'){tc.slice(0,4).forEach((t,i)=>{for(let j=0;j<fkN(5);j++)fkP({s:'proj',gl:'arrow',x:t.x-26+R()*30,y:-6,x2:t.x+(R()-.5)*14,y2:t.y+(R()-.3)*t.h*.5,arc:0,trail:3,col,col2:'#8a7a5a',t0:now+IMPACT-160+j*48+i*18,life:130});});
    if(!BV.flash||BV.flash.t<now-300)BV.flash={t:now+60,life:260,col:'rgba(20,30,60,.28)'};}
  else if(k==='lim_monk'){fkP({s:'st',gl:'afterimage',sh:'afterimage',x:c.x,y:gy,w:15,h:b.h,col:'#ffd9a0',u:a,dir,seed:0,t0:now+60,life:620,add:0});}
  else if(k==='lim_sniper'){const span=Math.abs(far-c.x)+30;for(let i=0;i<5;i++)fkP({s:'streak',x:c.x,y:gy-5-i*4,dir:-dir,n:2,sp:3,len:span*.5,col:i%2?'#e8e0c8':'#ffe08a',t0:now+40+i*30,life:420});
    for(let i=0;i<fkN(8);i++)fkP({s:'dust',x:c.x+dir*(8+i*span/8),y:gy-1,r1:7,t0:now+IMPACT-80+i*40,life:400});tc.forEach((t,i)=>fkP({s:'zap',x:t.x,y:t.gy-t.h*.4,col:'#fff6a0',seed:R(),t0:now+IMPACT+60+i*60,life:240}));}
  else if(k==='lim_druid'){fkP({s:'ringw',x:c.x,y:gy,r:46,col:'#8aff90',sq:.34,t0:now+60,life:520});for(let i=0;i<fkN(8);i++){const ag=R()*6.28;fkDot(c.x+Math.cos(ag)*18,gy-4,Math.cos(ag)*-14,-24-R()*18,now+i*40,560,i%2?'#8aff90':'#c8ffc0',-2);}}
  else if(k==='lim_archmage'){fkP({s:'sing',x:mx,y:my,r:34*L2,seed:R(),col:'#bfefff',t0:now+40,life:900});tc.forEach((t,i)=>fkP({s:'line',x:mx,y:my,x2:t.x,y2:t.y,col:'#fff6a0',jig:2,t0:now+IMPACT+120+i*40,life:260}));fkShake(now+IMPACT+120,260,3);}
  else if(k==='lim_chronicler'){fkP({s:'pages',x:c.x,y:c.y-8,x2:mx,y2:my,n:fkN(7),col:'#c8a0ff',t0:now,life:860});fkP({s:'seal',x:c.x,y:gy,r:22,n:8,rot:0,col:'#c8a0ff',t0:now,life:760});}
  else if(k==='lim_bard'){const xs=[c.x].concat(tc.map(t=>t.x));const far2=xs.reduce((m,x)=>Math.abs(x-c.x)>Math.abs(m-c.x)?x:m,c.x);fkP({s:'stave',x:c.x+dir*(-6),y:c.y-4,x2:far2+(far2===c.x?-dir*50:0),col:'#ffd04a',t0:now,life:880});fkNotes(c.x,c.y-b.h*.4,now+60,3,2);}
  else if(k==='sg'){const h=fkHash(a.id),np=3+h%6,ec=(I.el&&ELC[I.el])||col;fkP({s:'seal',x:c.x,y:gy,r:20,n:np,rot:(h%628)/100,col:ec,t0:now,life:640});for(let i=0;i<np;i++){const ag=i/np*6.283+(h%7);fkDot(c.x+Math.cos(ag)*14,gy-3+Math.sin(ag)*5,0,-18-(i%3)*6,now+60+i*24,420,i%2?'#ffffff':ec,-4);}}
  else if(k==='b4cata'){BV.flash={t:now,life:360,col:'rgba(255,70,40,.32)'};for(let i=0;i<3;i++)fkP({s:'ringw',x:c.x,y:gy,r:48+i*44,col:'#ff6a3a',lw:2,t0:now+IMPACT-60+i*100,life:520});fkShake(now+IMPACT,380,5);}
  else if(k==='b4charge'){fkP({s:'streak',x:c.x,y:c.y,dir:-dir,n:4,sp:5,len:34,col:'#ffb04a',t0:now+60,life:300});tc.forEach(t=>fkP({s:'line',x:c.x,y:c.y,x2:t.x,y2:t.y,col:'#ff8a4a',t0:now,life:230}));}
  else if(k==='b4siphon'){tc.forEach((t,i)=>{fkP({s:'proj',gl:'stone',x:t.x,y:t.y,x2:c.x,y2:c.y,arc:-8,trail:6,col:'#e060c0',col2:'#6a2a80',t0:now+IMPACT-60+i*50,life:300});fkP({s:'line',x:t.x,y:t.y,x2:c.x,y2:c.y,col:'#9a4aa0',gap:1,jig:1.5,t0:now+IMPACT-60+i*50,life:300});});}
  else if(k==='b4flank'){fkP({s:'st',gl:'afterimage',sh:'afterimage',x:c.x,y:gy,w:15,h:b.h,col:'#a090c0',u:a,dir:-dir,seed:0,t0:now,life:520,add:0});}
  else if(k==='bossmove')fkBossAct(I,a,tc,c,b,gy,now,dir,col);}
// ---------- on each target when the blow lands ----------
function fkSigHit(I,H,x,y,gy,start,w,h){const k=I.sig;if(!k)return;const R=Math.random,col=fkColOf(I),L2=I.l2?1.3:1,a=I.a;FK.key='sig_'+k;
  if(k==='lim_warrior'){fkP({s:'shock',x,y:gy,r:24*L2,col:'#ffd04a',noCrack:1,seed:0,t0:start+120,life:420});}
  else if(k==='lim_mage'){for(let i=0;i<fkN(3);i++)fkP({s:'fall',x:x+(i-1)*7,y:y+(i%2)*4,x0:x-34+i*5,y0:y-84,col,t0:start-210+i*70,life:380});}
  else if(k==='lim_thief')fkP({s:'cuts',x,y,n:fkN(Math.round(8*L2)),seed:R(),col:'#ffffff',K:fkK(),t0:start-70,life:560});
  else if(k==='lim_monk'){const n=fkN(9);for(let i=0;i<n;i++)fkP({s:'burst',x:x+(R()-.5)*16,y:y+(R()-.5)*14,r:4,col:'#ffd9a0',t0:start+i*46,life:200});fkP({s:'shock',x,y:gy,r:26,col:'#ffd9a0',noCrack:1,seed:0,t0:start+n*46,life:380});}
  else if(k==='lim_druid'){for(let i=0;i<3;i++)fkP({s:'arc',x,y:y+(i-1)*4,dir:1,L:12,ay:.9,bow:2,th:2,col:'#d8ffc0',col2:'#5fc060',t0:start-40+i*45,life:260});}
  else if(k==='lim_sniper')fkP({s:'pillar',x,y:gy,w:6,col:'#fff6a0',t0:start,life:300});
  else if(k==='lim_archmage'){fkP({s:'st',gl:'frost',sh:'frost',x,y:gy,w:Math.min(w,40)*.5,h,col:'#bfefff',u:H.u,dir:1,seed:R()*100,t0:start+30,life:600,add:0});}
  else if(k==='lim_chronicler')fkP({s:'seal',x,y:gy,r:14,n:8,rot:R()*6,col:'#c8a0ff',t0:start,life:480});
  else if(k==='sg'){const hh=fkHash(a&&a.id||'x'),np=3+hh%6;fkP({s:'seal',x,y:gy,r:13,n:np,rot:(hh%628)/100,col:(I.el&&ELC[I.el])||col,t0:start,life:520});}
  else if(k==='b4cata'){fkP({s:'pillar',x,y:gy,w:6,col:'#ff8a4a',t0:start+H.i*40,life:360});fkP({s:'shock',x,y:gy,r:26,col:'#ff6a3a',noCrack:1,seed:0,t0:start+H.i*40,life:420});}
  else if(k==='b4flank'){fkP({s:'arc',x,y:y-4,dir:-1,L:16,ay:-.7,bow:4,th:3,col:'#ffffff',col2:'#a090c0',t0:start-40,life:260});}
  else if(k==='bossmove')fkBossHit(I,H,x,y,gy,start,w,h,col);}
// ---------- the named moves of bosses, by the kind of word in the name and the move's own element ----------
function fkBossKind(sk){const n=String(sk&&sk.n||'');
  if(/song|chorus|dirge|lull|lure|wail|screech|pitch|omen|chant|hymn/i.test(n))return 'sound';
  if(/storm|surge|thunder|arc |discharge|bolt|judge|flash/i.test(n))return 'bolt';
  if(/gale|wind|dust|cloud|breath|whiteout|downdraft|sweep|swarm|wing/i.test(n))return 'sweep';
  if(/erupt|magma|molten|boil|cinder|ember|scald|wax|steam|lava/i.test(n))return 'erupt';
  if(/frost|glacial|hail|chill|soul|rime|shroud|ice/i.test(n))return 'frost';
  if(/tide|drown|undertow|rain|brine|mother/i.test(n))return 'tide';
  if(/spore|puff|drip|mold|poison|gnaw|biting|gulp|curse|hex|gaze|grave|veil|void|penumbra/i.test(n))return 'cloud';
  return sk&&(sk.t==='all')?'wave':'mark';}
function fkBossAct(I,a,tc,c,b,gy,now,dir,col){const sk=I.sk,bk=fkBossKind(sk),R=Math.random,ec=(I.el&&ELC[I.el])||col;FK.key='boss_'+bk;I.bk=bk;
  fkP({s:'seal',x:c.x,y:gy,r:Math.max(24,b.w*.55),n:3+fkHash(sk.n)%6,rot:(fkHash(sk.n)%628)/100,col:ec,t0:now,life:IMPACT+420});// the tell: the move's own seal under the boss
  if(bk==='sound'){for(let i=0;i<3;i++)fkP({s:'ringw',x:c.x+dir*8,y:c.y-b.h*.15,r:50+i*26,col:ec,sq:.8,t0:now+IMPACT-100+i*90,life:480});}
  else if(bk==='sweep'){for(let i=0;i<5;i++)fkP({s:'streak',x:c.x,y:gy-6-i*6,dir:-dir,n:2,sp:3,len:70,col:i%2?'#ffffff':ec,t0:now+IMPACT-90+i*26,life:420});}
  else if(bk==='bolt'){tc.forEach((t,i)=>fkP({s:'zap',x:t.x,y:t.gy-t.h*.4,col:'#fff6a0',seed:R(),t0:now+IMPACT+i*50,life:260}));}
  else if(bk==='erupt'){tc.forEach((t,i)=>{fkP({s:'pillar',x:t.x,y:t.gy,w:6,col:ec,t0:now+IMPACT+i*60,life:380});fkP({s:'shock',x:t.x,y:t.gy,r:28,col:ec,noCrack:1,seed:0,t0:now+IMPACT+i*60,life:420});});}
  else if(bk==='frost'){tc.forEach((t,i)=>fkP({s:'st',gl:'frost',sh:'frost',x:t.x,y:t.gy,w:Math.min(t.w,40)*.5,h:t.h,col:'#bfefff',u:t.u,dir:1,seed:R()*100,t0:now+IMPACT+i*50,life:620,add:0}));}
  else if(bk==='tide'){tc.forEach((t,i)=>fkP({s:'st',gl:'waves',sh:'waves',x:t.x,y:t.gy,w:Math.min(t.w,40)*.5,h:t.h,col:ec,u:t.u,dir:1,seed:0,t0:now+IMPACT+i*50,life:640,add:0}));}
  else if(bk==='cloud'){for(let i=0;i<fkN(10);i++)fkDot(c.x+dir*8,c.y,dir*(30+R()*70),(R()-.5)*20,now+IMPACT-80+i*22,560,i%2?ec:'#3a2a5a',0,2);}
  else if(bk==='wave'){fkP({s:'ringw',x:c.x,y:gy,r:100,col:ec,sq:.3,lw:2,t0:now+IMPACT-60,life:520});}
}
function fkBossHit(I,H,x,y,gy,start,w,h,col){const bk=I.bk;if(bk==='erupt'||bk==='bolt'||bk==='frost'||bk==='tide')return;
  if(bk==='sound')fkP({s:'ringw',x,y,r:26,col:(I.el&&ELC[I.el])||col,sq:.8,t0:start,life:360});
  else if(bk==='cloud')for(let i=0;i<fkN(5);i++)fkDot(x+(Math.random()-.5)*w,y+(Math.random()-.5)*h*.5,0,-8-Math.random()*8,start+i*30,520,i%2?col:'#3a2a5a',0,2);}
// ---------- the telegraph and the release of a realm gimmick, by type ----------
function fkGimTell(u,P,D){if(gfxStill()||!P||!D)return;const ec=(D.el&&ELC[D.el])||'#ffb04a',now=performance.now()+IMPACT,hero=i=>B.front[i],R=Math.random;FK.key='gim_'+P.t;
  if(P.t==='slot')(P.slots||[]).forEach((i,j)=>{const h=hero(i);if(h)fkShape(h,'target',ec,{t0:now+j*70,life:800});});
  else if(P.t==='rod'){const h=B.front.find(x=>x&&x.id===P.id);if(h){fkShape(h,'rod','#ffe04a',{t0:now,life:900});const c=centerOf(h);fkP({s:'streak',x:c.x,y:5,dir:1,n:3,sp:3,len:40,col:'#9a9ab8',t0:now,life:600});}}
  else if(P.t==='chill')B.front.forEach((h,j)=>{if(h&&h.hp>0)fkShape(h,'mist','#9ad8ff',{t0:now+j*60,life:800});});
  else if(P.t==='tide'||P.t==='dark')B.front.forEach((h,j)=>{if(h&&h.hp>0)fkShape(h,P.t==='tide'?'waves':'gloom',P.t==='tide'?'#4aa8ff':'#8a7aa8',{t0:now+j*60,life:760});});
  else if(P.t==='mirror')fkShape(u,'panes','#7ae0ff',{t0:now,life:760,big:1});
  else if(P.t==='veil')fkShape(u,'mist','#b0c8e0',{t0:now,life:800,big:1});
  else if(P.t==='wing')fkShape(u,'afterimage','#d0e0ff',{t0:now,life:700,big:1});
  else fkShape(u,'gather',ec,{t0:now,life:880,big:1});}
function fkGimLand(u,P,D){if(gfxStill()||!P||!D)return;const ec=(D.el&&ELC[D.el])||'#ff9a5a',now=performance.now(),R=Math.random;FK.key='gimland_'+P.t;
  const at=(h,f)=>{const c=centerOf(h),b=unitBox(h);if(c&&b)f(c,b,b.gy!=null?b.gy:b.y);};
  if(P.t==='slot'){(P.slots||[]).forEach((i,j)=>{const h=B.front[i];if(h)at(h,(c,b,gy)=>{fkP({s:'pillar',x:c.x,y:gy,w:6,col:ec,t0:now+j*70,life:380});fkP({s:'shock',x:c.x,y:gy,r:26,col:ec,noCrack:1,seed:0,t0:now+j*70,life:420});if(D.st==='root')fkShape(h,'roots','#a07a42',{t0:now+j*70+80});});});fkShake(now,260,3);}
  else if(P.t==='rod'){const h=B.front.find(x=>x&&x.id===P.id);if(h){const i=B.front.indexOf(h);at(h,(c,b,gy)=>fkP({s:'zap',x:c.x,y:c.y,col:'#ffe04a',seed:R(),t0:now,life:300}));[i-1,i+1].forEach((j,k)=>{const n=B.front[j];if(n&&n.hp>0)at(n,(c)=>fkP({s:'zap',x:c.x,y:c.y,col:'#fff6a0',seed:R(),t0:now+120,life:240}));});BV.flash={t:now,life:200,col:'rgba(255,240,120,.3)'};fkShake(now,240,3);}}
  else if(P.t==='chill'){for(let i=0;i<5;i++)fkP({s:'streak',x:BL.W*.15,y:BL.H*.3+i*14,dir:-1,n:2,sp:3,len:120,col:i%2?'#ffffff':'#9ad8ff',t0:now+i*30,life:520});B.front.forEach((h,j)=>{if(h&&h.hp>0)fkShape(h,'frost','#bfefff',{t0:now+120+j*50});});}
  else if(P.t==='tide'||P.t==='dark'){BV.flash={t:now,life:420,col:P.t==='tide'?'rgba(40,110,220,.28)':'rgba(10,0,30,.5)'};B.front.forEach((h,j)=>{if(h&&h.hp>0)fkShape(h,P.t==='tide'?'waves':'gloom',P.t==='tide'?'#4aa8ff':'#8a7aa8',{t0:now+j*50});});}
  else if(P.t==='sac'){const fx=D.fx;if(fx==='heal')fkShape(u,'leaves','#7aff8a',{t0:now,big:1});else if(fx==='buff')fkShape(u,'hexplates','#f6e7a8',{t0:now,big:1});else if(fx==='spores')B.front.forEach((h,j)=>{if(h&&h.hp>0)fkShape(h,'bubbles','#b07ae0',{t0:now+j*60});});else{const c=centerOf(u),b=unitBox(u);if(c&&b)fkP({s:'seal',x:c.x,y:b.gy!=null?b.gy:b.y,r:34,n:6,rot:0,col:ec,t0:now,life:620});}fkShake(now,220,3);}
  else if(P.t==='mirror')fkShape(u,'panes','#7ae0ff',{t0:now,big:1});
  else if(P.t==='veil')fkShape(u,'mist','#b0c8e0',{t0:now,big:1});
  else if(P.t==='wing')fkShape(u,'afterimage','#d0e0ff',{t0:now,big:1});}
{const gl0=typeof b4GimLand==='function'?b4GimLand:null;if(gl0){b4GimLand=function(u){const S=B&&B.b4g,P=S&&S.pend,D=S&&S.D;const r=gl0.apply(this,arguments);try{if(P&&D&&B&&!B.over)fkGimLand(u,P,D);}catch(e){}return r;};}}
{const ge0=typeof b4GimExpire==='function'?b4GimExpire:null;if(ge0){b4GimExpire=function(u){const S=B&&B.b4g,A=S&&S.act;const r=ge0.apply(this,arguments);try{if(A&&A.t==='air'&&!gfxStill()){const now=performance.now(),ec=(S.D.el&&ELC[S.D.el])||'#d0e0ff';FK.key='gimland_dive';(A.slots||[]).forEach((i,j)=>{const h=B.front[i];if(h&&h.hp>0){const c=centerOf(h),b=unitBox(h);if(c&&b){fkP({s:'shock',x:c.x,y:b.gy!=null?b.gy:b.y,r:28,col:ec,noCrack:1,seed:0,t0:now+j*70,life:420});fkP({s:'streak',x:c.x,y:4,dir:1,n:3,sp:3,len:40,col:ec,t0:now+j*70,life:300});}}});}}catch(e){}return r;};}}
// the boss telegraphs and windups ride the status popup
{const o1=onFx;onFx=function(u,txt,cls){const r=o1.apply(this,arguments);try{if(u&&B&&V.screen==='battle'&&!gfxStill()&&u.side==='e'&&/stat bad/.test(cls||'')){
  if(txt==='Telegraph'&&B.b4g&&u===B.b4g.u)fkGimTell(u,B.b4g.pend,B.b4g.D);
  else if(/^(Winding up|Gathering power)!?$/.test(String(txt))){const c=centerOf(u),b=unitBox(u),now=performance.now(),gy=b&&(b.gy!=null?b.gy:b.y);FK.key='tell_'+(/Wind/.test(txt)?'windup':'gather');
    if(c&&b){fkP({s:'seal',x:c.x,y:gy,r:Math.max(30,b.w*.75),n:/Wind/.test(txt)?4:8,rot:0,col:'#ff8a3a',t0:now,life:880});
      if(/Wind/.test(txt)&&u.b4slot!=null&&B.front[u.b4slot]){const t=centerOf(B.front[u.b4slot]);if(t)fkP({s:'line',x:c.x,y:c.y,x2:t.x,y2:t.y,col:'#ff5a3a',gap:1,t0:now+200,life:600});}
      else if(!/Wind/.test(txt)){fkShake(now,500,2);if(!BV.flash||BV.flash.t<now-400)BV.flash={t:now,life:520,col:'rgba(40,0,10,.3)'};}}}}}catch(e){}return r;};}

// ---------- for the tests and the audit ----------
function fk11Rows(list){return list.map(r=>{const I=fk11Info(r.a,r.sk);return {id:r.sk.id,k:I.k,fx:I.fx,el:I.el,dl:I.dl,hits:I.hits,area:I.area,lim:I.lim,song:I.song};});}
