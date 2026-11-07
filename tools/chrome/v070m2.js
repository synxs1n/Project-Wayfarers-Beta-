// Beta v0.7.0 battle mechanics (battle4.js), part 2: the screen. At 390x844, 844x390, 933x705 and 1280x720: the Momentum gauge sits in
// the log ticker under the stage (inside the viewport, off the stage, off the log text and the Log button, 40 px tall, its state shown),
// the switch menu with the free swap (who steps back, then who comes in) fits without sideways scroll or clipped text and keeps 40 px
// tap targets, and a few seconds of auto battle against every foe role raise no page error.
// Usage: PWHTML=../../out/aurelis3.html node v070m2.js
const {open,chk,done}=require('./pw');const {AUTO_OK}=require('./v063lib');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:2,enc:'off',music:0,sfx:0,gfx:'medium',hints:false}}));`;
let H;
(async()=>{for(const [w,h] of [[390,844],[844,390],[933,705],[1280,720]]){const tag=w+'x'+h;
  H=await open({w,h,mobile:w<1000,pre:PRE});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;
    ['brann','sable','gilda'].forEach(id=>{if(A.TPL[id]&&!G.party.includes(id))A.recruit(id,true);});
    G.party.forEach(id=>{const c=G.roster[id];c.lv=20;A.refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});
    const foes=['shellguard','ashwraith','yeti'].map(k=>A.makeEnemy(A.MON[k],16));
    A.setPause(999999);A.startBattle({stage:1,kind:'field',weather:'clear',foes});const B=A.B;B.cur=B.front[0];B.mode='cmd';B.menu='root';B.front.concat(B.back,B.en).forEach(u=>{u.enterT=0;});A.render();});
  await wait(400);
  const g=await ev(async()=>{const A=__A,B=A.B,o={};const R=e=>{if(!e)return null;const q=e.getBoundingClientRect();return {l:q.left,t:q.top,r:q.right,b:q.bottom,w:q.width,h:q.height};};
    const hit=(a,b)=>a&&b&&a.l<b.r-.5&&a.r>b.l+.5&&a.t<b.b-.5&&a.b>b.t+.5;
    const S=A.B4.mo(),M=A.B4.cfg.mo,cls={};for(const [m,st] of [[50,''],[M.max,'full'],[0,'empty']]){S.m=m;S.full=st==='full'?1:0;S.empty=st==='empty'?1:0;A.render();await new Promise(r=>setTimeout(r,30));const el=document.getElementById('b4mo');cls[A.B4.moState()]=el?el.className:'none';}
    S.m=50;S.full=0;S.empty=0;B.log.push('Free swap: Mira falls back and Brann steps in. Oren keeps the turn, and this line is long enough to be cut.');A.render();await new Promise(r=>setTimeout(r,60));
    const mo=document.getElementById('b4mo'),line=document.getElementById('bline'),blog=document.querySelector('#blog p')||document.getElementById('blog'),btn=document.querySelector('#bline .blogbtn'),stage=document.getElementById('bwrap');
    o.cls=cls;o.in=mo&&line.contains(mo);o.mo=R(mo);o.line=R(line);o.vw=innerWidth;o.vh=innerHeight;o.docW=document.documentElement.scrollWidth;
    o.offStage=!hit(R(mo),R(stage));o.offLog=!hit(R(mo),R(blog));o.offBtn=!hit(R(mo),R(btn));o.inLine=o.mo&&o.line&&o.mo.t>=o.line.t-1&&o.mo.b<=o.line.b+1&&o.mo.l>=o.line.l-1&&o.mo.r<=o.line.r+1;
    o.fit=mo&&[...mo.querySelectorAll('.b4mt b,.b4mt em')].every(e=>e.getBoundingClientRect().right<=mo.getBoundingClientRect().right+.5);o.label=mo&&mo.getAttribute('aria-label');
    o.lineH=R(line).h;
    // tap the gauge: its explanation goes to the log
    mo.click();await new Promise(r=>setTimeout(r,30));o.tap=(B.log[B.log.length-1]||'').startsWith('Momentum');
    // the switch menu with a free swap ready
    A.ACT.cmd('swap');await new Promise(r=>setTimeout(r,60));const cmd=document.getElementById('bcmd'),rows=[...cmd.querySelectorAll('.b4o')],list=[...cmd.querySelectorAll('[data-act="sw"]')];
    o.rows=rows.length;o.list=list.length;o.docW2=document.documentElement.scrollWidth;
    o.small=rows.concat(list).filter(e=>e.getBoundingClientRect().height<40).map(e=>e.textContent);
    o.clip=rows.filter(e=>{const n=e.querySelector('.n');return e.scrollWidth>e.clientWidth+1||(n&&n.getBoundingClientRect().right>e.getBoundingClientRect().right+.5);}).map(e=>e.textContent);
    o.out=rows.concat(list).filter(e=>{const q=e.getBoundingClientRect();return q.left<-1||q.right>innerWidth+1;}).map(e=>e.textContent);
    A.ACT.b4out(1);await new Promise(r=>setTimeout(r,30));o.hint=(cmd.querySelector('.hint')||{}).textContent||'';A.ACT.back();
    return o;});
  chk(`${tag}: the gauge shows each state (${JSON.stringify(g.cls)})`,g.cls.build==='b4mo build'&&g.cls.full==='b4mo full'&&g.cls.empty==='b4mo empty'||JSON.stringify(g.cls));
  chk(`${tag}: the gauge sits in the log ticker under the stage`,g.in&&g.inLine&&g.offStage||JSON.stringify({in:g.in,inLine:g.inLine,off:g.offStage,mo:g.mo,line:g.line}));
  chk(`${tag}: the gauge is inside the screen and 40 px tall (${g.mo&&Math.round(g.mo.h)})`,g.mo&&g.mo.l>=-1&&g.mo.r<=g.vw+1&&g.mo.t>=-1&&g.mo.b<=g.vh+1&&g.mo.h>=40||JSON.stringify(g.mo));
  chk(`${tag}: the gauge covers neither the log text nor the Log button`,g.offLog&&g.offBtn||JSON.stringify({log:g.offLog,btn:g.offBtn}));
  chk(`${tag}: the gauge text fits, and it has a spoken label`,g.fit&&/^Momentum \d/.test(g.label||'')||JSON.stringify({fit:g.fit,l:g.label}));
  chk(`${tag}: the ticker keeps its height (${Math.round(g.lineH)} px)`,g.lineH<=46||g.lineH);
  chk(`${tag}: tapping the gauge explains it`,g.tap===true);
  chk(`${tag}: no sideways scroll`,g.docW<=g.vw+1&&g.docW2<=g.vw+1||[g.docW,g.docW2]);
  chk(`${tag}: the switch menu offers who steps back (${g.rows}) and who comes in (${g.list})`,g.rows===3&&g.list===3||JSON.stringify(g));
  chk(`${tag}: switch menu buttons are 40 px or more, inside the screen, text not clipped`,!g.small.length&&!g.out.length&&!g.clip.length||JSON.stringify({s:g.small,o:g.out,c:g.clip}));
  chk(`${tag}: picking another hero explains the free swap`,/Free swap/.test(g.hint)&&/keeps this turn/.test(g.hint)||g.hint);
  // a few seconds of auto battle against the roles (and a boss with its Cataclysm on the widest screen)
  // v0.9.9: these foe types count as beaten by hand (Auto per foe type, v0.9.8, would leave Auto locked), and the fight is watched until it
  // has moved on (more than 3 log lines) or 20 s pass, instead of a fixed 3 or 5 s that a busy machine could spend on two turns
  const a=await ev(async([big,ok])=>{const A=__A;let B=A.B;(0,eval)('('+ok+')')();A.setPause(30);B.mode='cmd';B.menu='root';A.V.auto=false;B.auto=false;A.ACT.auto();await new Promise(r=>setTimeout(r,big?5000:3000));
    for(const t0=performance.now();performance.now()-t0<20000&&A.B&&!A.B.over&&A.B.log.length<=3;)await new Promise(r=>setTimeout(r,50));const o={log:A.B?A.B.log.length:0,over:A.B?A.B.over:true};
    return o;},[w===1280,AUTO_OK.toString()]);
  chk(`${tag}: auto battle runs against the roles (${a.log} log lines)`,a.log>3||a.over||JSON.stringify(a));
  await H.browser.close();}
  await done({browser:{close:async()=>{}}});})();
