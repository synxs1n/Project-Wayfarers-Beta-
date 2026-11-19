// v0.22.27: the battle screen on small phones (battle27.js): the stage first, the commands second, the cards behind one button.
//  1 on a 360x640 phone the layout is on: the game's top bar is hidden, the stage is over half the screen and edge to edge
//  2 Attack, Skills, Items and Guard are four large buttons in two rows; Party & foes leads the row under them; nothing runs off the screen
//  3 Pause, Auto, Speed and the auto settings sit in the turn order strip (not in the command panel), each at least 40 px
//  4 the party and foe cards are not on the screen until Party & foes is tapped; the sheet lists every hero and foe and has Close,
//    Guide, Sound, Help and Settings; Close puts it away
//  5 the log line floats on the stage; a 1280x800 screen has the same layout (stage over half the screen, the four commands in one row);
//    a phone held sideways (844x390) keeps the classic layout
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
  chk(`2 four large commands in two rows (${a.prim.map(p=>p.w+'x'+p.h).join(' ')}); then ${a.sec.join(', ')}; the panel ends at ${a.cmd.b} of ${a.vh}`,(a.prim.length===4&&rows===2&&a.prim.every(p=>p.h>=44&&p.w>=140)&&/Party/.test(a.sec[0])&&!a.sec.includes('Guide')&&a.cmd.b<=a.vh&&a.sw<=a.vw)||JSON.stringify(a));
  chk(`3 Pause, Auto, Speed and settings in the turn order strip (${a.ar.map(p=>p.w+'x'+p.h).join(' ')})`,(a.ar.length===4&&a.ar.every(p=>p.h>=40&&p.w>=40&&p.r<=a.vw)&&a.arIn===0)||JSON.stringify(a.ar));
  await ev(()=>{document.querySelector('#bcmd .b27pf').click();});await wait(400);
  const b=await ev(new Function(R+`const o={open:q('.battle.b3').classList.contains('b27open'),sheet:r(q('#bparty')),h:qa('#bparty .pc').filter(vis).length,f:qa('#bparty .fc').filter(vis).length,foes:__A.B.en.filter(e=>e.hp>0).length,party:__A.B.front.length+__A.B.back.length,
    btn:qa('#bparty .b27sh button,#bparty .b27sf button').map(e=>e.textContent.trim())};return o;`));
  await ev(()=>{document.querySelector('#bparty .b27sh button').click();});await wait(400);
  const c=await ev(new Function(R+`return {open:q('.battle.b3').classList.contains('b27open'),cards:qa('#bparty .pc,#bparty .fc').filter(vis).length};`));
  chk(`4 no cards until asked (${a.cards}); the sheet: ${b.h} heroes, ${b.f} foes, ${b.btn.join(' / ')}; Close puts it away`,(a.cards===0&&b.open&&b.h===b.party&&b.f>=b.foes&&b.sheet.b<=a.vh+1&&['Close','Guide','Sound','Help','Settings'].every(k=>b.btn.some(t=>t.indexOf(k)>=0))&&!c.open&&c.cards===0)||JSON.stringify([a.cards,b,c]));
  const lineOn=a.line&&a.line.y>=a.st.y&&a.line.b<=a.st.y+a.st.h*.3;
  // 0.22.34: the layout is for every screen but a short sideways one
  await H.page.setViewportSize({width:1280,height:800});await wait(300);await ev(()=>{window.dispatchEvent(new Event('resize'));__A.render();});await wait(900);
  const d=await ev(new Function(R+`const st=r(q('#bwrap'));return {on:q('.battle.b3').classList.contains('b27'),land:q('.battle.b3').classList.contains('b27land'),st,share:st.w*st.h/(innerWidth*innerHeight),rows:new Set(qa('#bcmd .menu.prim .mi').map(e=>Math.round(e.getBoundingClientRect().top))).size,cards:qa('#bparty .pc').filter(vis).length,cmdB:r(q('#bcmd')).b,vh:innerHeight};`));
  // 0.22.42: a list has room. On the big screen the skill list rises over the stage, in columns, with at least six skills in full view
  await ev(()=>{const B=__A.B;B.front.forEach(c=>{c.lv=30;});const b=document.querySelector('#bcmd [data-arg="skills"]');if(b)b.click();});await wait(600);
  const f=await ev(new Function(R+`const L=qa('#bcmd .menu.list .mi').map(r),bb=r(q('.bbottom'));return {n:L.length,full:L.filter(p=>p.y>=bb.y&&p.b<=innerHeight&&p.h>30).length,cols:new Set(L.map(p=>p.x)).size,bb,vh:innerHeight,list:q('.battle.b3').classList.contains('b3list')};`));
  chk(`6 the skill list on a 1280x800 screen: ${f.n} skills, ${f.full} in full view, ${f.cols} columns, the panel from ${f.bb.y} to ${f.bb.b} of ${f.vh}`,(f.list&&f.n>=2&&f.full>=Math.min(6,f.n)&&(f.n<3||f.cols>=2)&&f.bb.b<=f.vh+1&&f.bb.h>=200&&f.bb.y>=f.vh*.3)||JSON.stringify(f));
  await ev(()=>{const b=document.querySelector('#bcmd .cmdback');if(b)b.click();});await wait(400);
  await H.page.setViewportSize({width:844,height:390});await wait(300);await ev(()=>{window.dispatchEvent(new Event('resize'));__A.render();});await wait(900);
  const e=await ev(new Function(R+`return {on:q('.battle.b3').classList.contains('b27'),ar:qa('#bcmd .autorow').filter(vis).length,hdr:vis(q('#hdr'))};`));
  chk(`5 the log line floats at the top of the stage; at 1280x800 the stage is ${Math.round(d.share*100)}% of the screen with the commands in one row; a sideways phone (844x390) keeps the classic layout`,(lineOn&&d.on&&d.land&&d.share>=.55&&d.rows===1&&d.cards===0&&d.cmdB<=d.vh&&!e.on&&e.ar===1)||JSON.stringify([a.line,a.st,d,e]));
  await done(H);})();
