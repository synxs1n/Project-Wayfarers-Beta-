// v0.22.29: the main menu on phones (menus29.js).
//  1 360x640: the menu fills the screen; a 46 px bar names the section, shows gold and Close; no page scroll sideways
//  2 the section bar is at the bottom with Party, Backpack, Quests, Map, More (each at least 44 px); More lists Records, Guides, Settings, Save
//  3 sub tabs are one row (Party has five), the open one is in view; quest filters are one row
//  4 Party: the six heroes' cards are all on screen above the bar
//  5 Backpack: Show and Sort share a row; tapping More > Settings opens Settings and the bar marks More
//  6 a 1000x700 screen keeps the classic menu (no m29 class, the sections at the top)
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v213a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v213a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
const R=`const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:Math.round(b.left),y:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height),b:Math.round(b.bottom),r:Math.round(b.right)};},vis=e=>{if(!e)return false;const b=e.getBoundingClientRect();return b.width>2&&b.height>2&&getComputedStyle(e).display!=='none';},q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];`;
(async()=>{const H=await open({w:360,h:640,mobile:true,pre:META,tag:'v213a'});const {ev,wait}=H;
  await ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;['brann','tess','sable'].forEach(id=>{G.roster[id]=g('newChar')(id,3,0);G.party.push(id);});A.render();});await wait(900);
  await ev(()=>{__A.ACT.menuTab('party');});await wait(500);
  const a=await ev(new Function(R+`const pn=q('#modal .panel'),o={on:pn.classList.contains('m29'),pn:r(pn),h:r(q('.panel>.menuh')),t:(q('.m29t')||{}).textContent,gold:vis(q('.m29g')),x:r(q('.panel .mclose')),vw:innerWidth,vh:innerHeight,sw:document.documentElement.scrollWidth,err:window.__M29.M29.err||''};
    o.nav=qa('.panel>.mgrp .chip').filter(vis).map(e=>Object.assign(r(e),{t:e.textContent.trim()}));o.sub=qa('.panel>.msub .chip').map(r);o.subOn=r(q('.panel>.msub .chip.on'));o.cards=qa('.swlist .swc').map(r);o.top=document.elementFromPoint(o.x.x+20,o.x.y+20)===q('.panel .mclose');return o;`));
  chk(`1 the menu fills the screen (${a.pn.w}x${a.pn.h}); bar "${a.t}", gold, Close on top`,(a.on&&a.pn.w===a.vw&&a.pn.h===a.vh&&a.h.y<=2&&a.h.h<=48&&a.t==='Party'&&a.gold&&a.top&&a.sw<=a.vw&&!a.err)||JSON.stringify(a).slice(0,700));
  chk(`2 the section bar at the bottom: ${a.nav.map(n=>n.t).join(', ')}`,(a.nav.length===5&&a.nav.every(n=>n.h>=44&&n.b<=a.vh&&n.y>=a.vh-70)&&a.nav.map(n=>n.t).join()==='Party,Backpack,Quests,Map,More')||JSON.stringify(a.nav));
  const rows=[...new Set(a.sub.map(s=>s.y))].length;
  chk(`3 ${a.sub.length} sub tabs in one row, the open one in view`,(a.sub.length===5&&rows===1&&a.subOn.x>=0&&a.subOn.r<=a.vw)||JSON.stringify([a.sub,a.subOn]));
  chk(`4 Party: ${a.cards.length} hero cards, all above the bar (the last ends at ${Math.max(...a.cards.map(c=>c.b))})`,(a.cards.length===6&&a.cards.every(c=>c.y>=90&&c.b<=a.vh-58&&c.r<=a.vw))||JSON.stringify(a.cards));
  await ev(()=>{__A.ACT.menuTab('quests');});await wait(400);
  const b=await ev(new Function(R+`return {f:qa('.panel .nbsec .chip').map(r)};`));
  await ev(()=>{__A.ACT.menuTab('items');});await wait(400);
  const c=await ev(new Function(R+`const o={dd:qa('.panel .ddbar .dd').map(r)};q('.panel>.mgrp .m29mb').click();return o;`));await wait(400);
  const d=await ev(new Function(R+`const o={more:qa('.m29more button').map(e=>e.textContent.trim())};const s=qa('.m29more button').find(e=>/Settings/.test(e.textContent));if(s)s.click();return o;`));await wait(500);
  const e=await ev(new Function(R+`return {tab:__A.V.modal&&__A.V.modal.tab,t:(q('.m29t')||{}).textContent,moreOn:q('.panel>.mgrp .m29mb').classList.contains('on'),sheet:!!q('.m29more')};`));
  chk(`3b ${b.f.length} quest filters in one row`,(b.f.length>=5&&new Set(b.f.map(x=>x.y)).size===1)||JSON.stringify(b.f));
  chk(`5 Show and Sort share a row; More lists ${d.more.join(' / ')}; Settings opens with More marked`,(c.dd.length===2&&c.dd[0].y===c.dd[1].y&&d.more.length===4&&/Records/.test(d.more[0])&&/Save/.test(d.more[3])&&e.tab==='settings'&&e.t==='Settings'&&e.moreOn&&!e.sheet)||JSON.stringify([c,d,e]));
  await H.page.setViewportSize({width:1000,height:700});await wait(300);await ev(()=>{window.dispatchEvent(new Event('resize'));__A.ACT.menuTab('party');});await wait(600);
  const f=await ev(new Function(R+`const pn=q('#modal .panel');return {on:pn.classList.contains('m29'),grp:r(q('.panel>.mgrp')),n:qa('.panel>.mgrp .chip').filter(vis).length};`));
  chk(`6 a 1000x700 screen keeps the classic menu (${f.n} sections at the top)`,(!f.on&&f.n===7&&f.grp.y<300)||JSON.stringify(f));
  await done(H);})();
