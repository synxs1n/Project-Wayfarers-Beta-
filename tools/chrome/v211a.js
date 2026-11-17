// v0.22.27: the battle screen on small phones (battle27.js): the stage first, the commands second, the cards behind one button.
//  1 on a 360x640 phone the layout is on: the game's top bar is hidden, the stage is over half the screen and edge to edge
//  2 Attack, Skills, Items and Guard are four large buttons in two rows; Party & foes leads the row under them; nothing runs off the screen
//  3 Pause, Auto, Speed and the auto settings sit in the turn order strip (not in the command panel), each at least 40 px
//  4 the party and foe cards are not on the screen until Party & foes is tapped; the sheet lists every hero and foe and has Close,
//    Guide, Sound, Help and Settings; Close puts it away
//  5 the log line floats on the stage; a wide screen (900x700) keeps the old layout (no b27 class, cards on screen)
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v211a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v211a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
const start=async(H)=>{await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.TW.get('startBattle')({stage:0,kind:'wild'});A.render();});
  for(let i=0;i<40;i++){await H.wait(400);if(await H.ev(()=>{const B=__A.B;return !!(B&&B.cur&&B.cur.side==='p'&&B.mode==='cmd'&&document.querySelector('#bcmd .menu.prim'));}))break;}await H.wait(600);};
(async()=>{const H=await open({w:360,h:640,mobile:true,pre:META,tag:'v211a'});const {ev,wait}=H;await start(H);
  const R=`const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:Math.round(b.left),y:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height),b:Math.round(b.bottom),r:Math.round(b.right)};},vis=e=>{if(!e)return false;const b=e.getBoundingClientRect();return b.width>2&&b.height>2&&getComputedStyle(e).display!=='none';},q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];`;
  const a=await ev(new Function(R+`const bat=q('.battle.b3'),o={on:bat.classList.contains('b27'),hdr:vis(q('#hdr')),st:r(q('#bwrap')),vh:innerHeight,vw:innerWidth,err:window.__B27.B27.err||''};
    o.prim=qa('#bcmd .menu.prim .mi').map(r);o.sec=qa('#bcmd .menu.sec .mi').filter(vis).map(e=>e.textContent.trim());o.cmd=r(q('#bcmd'));o.ar=qa('#border .autorow button').map(r);o.arIn=qa('#bcmd .autorow').filter(vis).length;
    o.cards=qa('#bparty .pc,#bparty .fc').filter(vis).length;o.line=r(q('#bline'));o.sw=document.documentElement.scrollWidth;return o;`));
  chk(`1 small phone: layout on, top bar hidden, stage ${a.st&&a.st.w}x${a.st&&a.st.h} of ${a.vw}x${a.vh}`,(a.on&&!a.hdr&&a.st.h>=a.vh*.5&&a.st.w>=a.vw-12&&!a.err)||JSON.stringify(a));
  const rows=[...new Set(a.prim.map(p=>p.y))].length;
  chk(`2 four large commands in two rows (${a.prim.map(p=>p.w+'x'+p.h).join(' ')}); then ${a.sec.join(', ')}; the panel ends at ${a.cmd.b} of ${a.vh}`,(a.prim.length===4&&rows===2&&a.prim.every(p=>p.h>=46&&p.w>=140)&&/Party/.test(a.sec[0])&&!a.sec.includes('Guide')&&a.cmd.b<=a.vh&&a.sw<=a.vw)||JSON.stringify(a));
  chk(`3 Pause, Auto, Speed and settings in the turn order strip (${a.ar.map(p=>p.w+'x'+p.h).join(' ')})`,(a.ar.length===4&&a.ar.every(p=>p.h>=40&&p.w>=40&&p.r<=a.vw)&&a.arIn===0)||JSON.stringify(a.ar));
  await ev(()=>{document.querySelector('#bcmd .b27pf').click();});await wait(400);
  const b=await ev(new Function(R+`const o={open:q('.battle.b3').classList.contains('b27open'),sheet:r(q('#bparty')),h:qa('#bparty .pc').filter(vis).length,f:qa('#bparty .fc').filter(vis).length,foes:__A.B.en.filter(e=>e.hp>0).length,party:__A.B.front.length+__A.B.back.length,
    btn:qa('#bparty .b27sh button,#bparty .b27sf button').map(e=>e.textContent.trim())};return o;`));
  await ev(()=>{document.querySelector('#bparty .b27sh button').click();});await wait(400);
  const c=await ev(new Function(R+`return {open:q('.battle.b3').classList.contains('b27open'),cards:qa('#bparty .pc,#bparty .fc').filter(vis).length};`));
  chk(`4 no cards until asked (${a.cards}); the sheet: ${b.h} heroes, ${b.f} foes, ${b.btn.join(' / ')}; Close puts it away`,(a.cards===0&&b.open&&b.h===b.party&&b.f>=b.foes&&b.sheet.b<=a.vh+1&&['Close','Guide','Sound','Help','Settings'].every(k=>b.btn.some(t=>t.indexOf(k)>=0))&&!c.open&&c.cards===0)||JSON.stringify([a.cards,b,c]));
  const lineOn=a.line&&a.line.y>=a.st.y&&a.line.b<=a.st.y+a.st.h*.3;
  await H.page.setViewportSize({width:900,height:700});await wait(300);await ev(()=>{window.dispatchEvent(new Event('resize'));__A.render();});await wait(900);
  const d=await ev(new Function(R+`return {on:q('.battle.b3').classList.contains('b27'),cards:qa('#bparty .pc').filter(vis).length,ar:qa('#bcmd .autorow').filter(vis).length,hdr:vis(q('#hdr'))};`));
  chk(`5 the log line floats at the top of the stage; a 900x700 screen keeps the old layout (${d.cards} hero cards on screen)`,(lineOn&&!d.on&&d.cards>=3&&d.ar===1&&d.hdr)||JSON.stringify([a.line,a.st,d]));
  await done(H);})();
