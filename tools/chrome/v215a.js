// v0.22.31: the shops on phones (shops31.js).
//  1 360x640 Smithy: the shop fills the screen; a 46 px bar with its name and gold; Back and Close on top; no sideways page scroll
//  2 its four tabs are a bar at the bottom (each at least 44 px); the sections are one row
//  3 Best upgrade for each slot: Upgrade whole party is first; each card is at most 130 px tall (they were up to 297) and its button is on screen
//  4 tapping the Forge tab opens it; Alchemy and the Guild hall get the same frame; the Tavern (no tabs) has no bar
//  5 a 1000x700 screen keeps the classic shop
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v215a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v215a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
const R=`const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:Math.round(b.left),y:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height),b:Math.round(b.bottom),r:Math.round(b.right)};},vis=e=>{if(!e)return false;const b=e.getBoundingClientRect();return b.width>2&&b.height>2&&getComputedStyle(e).display!=='none';},q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];`;
(async()=>{const H=await open({w:360,h:640,mobile:true,pre:META,tag:'v215a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.gold=4280;A.render();});await wait(900);
  const openS=async(t,tab)=>{await ev(([t,tab])=>{__A.V.modal={type:t,tab};__A.render();},[t,tab]);await wait(450);};
  await openS('smithy','shop');
  const a=await ev(new Function(R+`const pn=q('#modal .panel'),o={on:pn.classList.contains('s31'),pn:r(pn),h:r(q('#modal .panel>h2')),t:(q('#modal .panel>h2')||{}).textContent,x:r(q('.panel .mclose')),bk:r(q('.panel .mback')),vw:innerWidth,vh:innerHeight,sw:document.documentElement.scrollWidth,err:window.__S31.S31.err||''};
    o.top=document.elementFromPoint(o.x.x+20,o.x.y+20)===q('.panel .mclose')&&document.elementFromPoint(o.bk.x+20,o.bk.y+20)===q('.panel .mback');
    o.nav=qa('.panel .stabs .chip').filter(vis).map(e=>Object.assign(r(e),{t:e.textContent.trim()}));o.sec=qa('.panel .ssec .chip').map(r);
    const ub=q('.panel .upgbest');o.first=ub&&[...ub.children].filter(vis).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top).map(e=>e.className.split(' ')[0]||e.tagName).slice(0,3);
    o.cards=qa('.panel .upgbest .rows>.row').map(e=>Object.assign(r(e),{btn:r(e.querySelector('.btn'))}));return o;`));
  chk(`1 the Smithy fills the screen (${a.pn.w}x${a.pn.h}); bar "${String(a.t).trim().slice(0,24)}"; Back and Close on top`,(a.on&&a.pn.w===a.vw&&a.pn.h===a.vh&&a.h.y<=2&&a.h.h<=48&&/Smithy/.test(a.t)&&/4,280/.test(a.t)&&a.top&&a.sw<=a.vw&&!a.err)||JSON.stringify(a).slice(0,600));
  chk(`2 the tabs at the bottom: ${a.nav.map(n=>n.t).join(', ')}; ${a.sec.length} sections in one row`,(a.nav.length===4&&a.nav.every(n=>n.h>=44&&n.b<=a.vh&&n.y>=a.vh-70&&n.r<=a.vw)&&a.sec.length>=5&&new Set(a.sec.map(s=>s.y)).size===1)||JSON.stringify([a.nav,a.sec]));
  chk(`3 Upgrade whole party first (${a.first}); ${a.cards.length} cards, tallest ${Math.max(...a.cards.map(c=>c.h))} px, buttons on screen`,(a.first&&a.first[1]==='btnrow'&&a.cards.length>=2&&a.cards.every(c=>c.h<=130&&c.btn&&c.btn.r<=a.vw&&c.btn.w>=40))||JSON.stringify([a.first,a.cards]));
  await ev(()=>{document.querySelector('.panel .stabs .chip[data-arg="craft"]').click();});await wait(450);
  const b=await ev(new Function(R+`return {tab:__A.V.modal.tab,on:q('.panel .stabs .chip.on').textContent.trim(),s31:q('#modal .panel').classList.contains('s31')};`));
  const fr={};for(const [t,tab] of [['workshop','shop'],['guild','quests'],['tavern','hire']]){await openS(t,tab);fr[t]=await ev(new Function(R+`const pn=q('#modal .panel');return {s31:pn.classList.contains('s31'),full:r(pn).h===innerHeight,nav:qa('.panel .stabs .chip').filter(vis).length,nt:pn.classList.contains('s31nt')};`));}
  chk(`4 Forge opens from the bar; Alchemy (${fr.workshop.nav} tabs) and the Guild hall (${fr.guild.nav}) share the frame; the Tavern has no bar`,(b.tab==='craft'&&b.on==='Forge'&&b.s31&&fr.workshop.s31&&fr.workshop.full&&fr.workshop.nav===4&&fr.guild.s31&&fr.guild.nav>=4&&fr.tavern.s31&&fr.tavern.nt&&fr.tavern.nav===0)||JSON.stringify([b,fr]));
  await H.page.setViewportSize({width:1000,height:700});await wait(300);await ev(()=>{window.dispatchEvent(new Event('resize'));});await openS('smithy','shop');
  const c=await ev(new Function(R+`const pn=q('#modal .panel');return {s31:pn.classList.contains('s31'),nav:r(q('.panel .stabs'))};`));
  chk(`5 a 1000x700 screen keeps the classic shop (tabs at y ${c.nav&&c.nav.y})`,(!c.s31&&c.nav.y<300)||JSON.stringify(c));
  await done(H);})();
