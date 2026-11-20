// v0.22.48 (side48.js): big screens keep the party and foe cards on screen in a slim column; the log line sits in the top strip.
//  1 1280x800: the column is S48.w px wide beside the stage, every hero and foe has a card in it, nothing overlaps the stage or the commands,
//    the stage is at least 1000 px wide and most of the screen's height; a hero card stacks HP over MP with the numbers inside the bars
//  2 the line (sky, Momentum, log, Log, ☰) is inside the top strip, between the turn order and Pause / Auto / Speed; nothing floats on the stage
//  3 no "Party & foes" command; a tap on a hero card opens that hero's details; the ☰ on the strip still opens the full sheet
//  6 an opened fold (673x841) has the column as well (0.22.50)
//  4 a phone (390x844) and a narrow window (560x760) keep the layout they had: no column, the Party & foes command is there
//  5 an open skill list stays in the command box under the stage (it covers neither the stage nor the cards), the skills as boxes side by side with all their info (0.22.49)
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v227a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v227a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:2,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false,goals:false}}));`;
const R=`const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {x:Math.round(b.left),y:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height),b:Math.round(b.bottom),r:Math.round(b.right)};},q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],vis=e=>{const b=e.getBoundingClientRect();return b.width>2&&b.height>2&&getComputedStyle(e).display!=='none';};`;
const boot=async(w,h,mobile)=>{const H=await open({w,h,mobile,pre:META,tag:'v227a'});
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;Object.values(A.G.roster).forEach(c=>{c.lv=30;c.S=A.TW.get('calcStats')(c);c.hp=Math.round(c.S.mhp*.7);c.mp=c.S.mmp;});A.G.stage=1;A.G.cleared=[1,0,0,0,0];A.TW.get('startBattle')({stage:1,kind:'wild'});A.render();});
  for(let i=0;i<60;i++){await H.wait(300);if(await H.ev(()=>{const B=__A.B;return !!(B&&B.cur&&B.cur.side==='p'&&B.mode==='cmd'&&document.querySelector('#bcmd [data-arg="skills"]'));}))break;}await H.wait(400);return H;};
const snap=new Function(R+`const bat=q('.battle.b3'),hp=qa('#bparty .pc').filter(vis),fc=qa('#bparty .fc').filter(vis),st=r(q('#bwrap')),cmd=r(q('#bcmd')),bo=r(q('#border')),bl=r(q('#bline')),ar=r(q('#border .autorow')),tok=qa('#border .ocs>*').filter(vis).map(r),B=__A.B;
  const cards=hp.concat(fc).map(r),c0=hp[0],u=c0?[...c0.querySelectorAll('.ucr')].map(r):[],n0=c0?r(c0.querySelector('.ucr em.nums')):null,b0=c0?r(c0.querySelector('.ucr .bar')):null;
  return {on:bat.classList.contains('b48'),top:bat.classList.contains('b48top'),heroes:hp.length,foes:fc.length,party:B.front.length,en:B.en.filter(e=>e.hp>0).length,st,cmd,bo,bl,ar,tokR:Math.max(...tok.map(t=>t.r)),cards,minX:Math.min(...cards.map(c=>c.x),9999),maxW:Math.max(...cards.map(c=>c.w),0),lastB:Math.max(...cards.map(c=>c.b),0),u,n0,b0,pf:!!q('#bcmd .b27pf'),info:qa('#bparty .uinfo').filter(vis).length,vw:innerWidth,vh:innerHeight};`);
(async()=>{let H=await boot(1280,800,false);const {ev,wait}=H;
  const a=await ev(snap);
  chk(`1 1280x800: column on (${a.on}), ${a.heroes} hero cards for ${a.party} heroes and ${a.foes} foe cards for ${a.en} foes, cards from x ${a.minX} (stage ends at ${a.st.r}), up to ${a.maxW} px wide, the last one ends at ${a.lastB} of ${a.vh}; stage ${a.st.w} x ${a.st.h}`,
    a.on&&a.heroes===a.party&&a.foes===a.en&&a.minX>=a.st.r&&a.minX>=a.cmd.r&&a.maxW<=200&&a.maxW>=150&&a.lastB<=a.vh&&a.st.w>=1000&&a.st.h>=a.vh*.6||JSON.stringify(a));
  chk(`1 a hero card: HP over MP (${a.u.map(x=>x.y).join(', ')}), the number inside the bar (${a.n0&&a.n0.x}..${a.n0&&a.n0.r} in ${a.b0&&a.b0.x}..${a.b0&&a.b0.r}), no info buttons (${a.info})`,
    a.u.length>=2&&a.u[1].y>a.u[0].y&&a.n0&&a.b0&&a.n0.x>=a.b0.x&&a.n0.r<=a.b0.r+1&&a.info===0||JSON.stringify([a.u,a.n0,a.b0,a.info]));
  chk(`2 the line is in the top strip (${a.bl.y}..${a.bl.b} in ${a.bo.y}..${a.bo.b}), after the turn order (${a.tokR} < ${a.bl.x}) and before Pause (${a.bl.r} < ${a.ar.x}); the stage starts under it (${a.st.y})`,
    a.top&&a.bl.y>=a.bo.y-2&&a.bl.b<=a.bo.b+2&&a.bl.x>=a.tokR&&a.bl.r<=a.ar.x&&a.bl.b<=a.st.y+2&&a.bl.w>=260||JSON.stringify([a.bl,a.bo,a.ar,a.tokR]));
  await ev(()=>{document.querySelector('#bparty .pc').click();});await wait(400);
  const d=await ev(()=>({det:!!(__A.B.uDet),txt:(document.querySelector('.udet,.uinfo-card,#budet')||{innerText:''}).innerText.slice(0,40)}));
  await ev(()=>{const B=__A.B;B.uDet=null;__A.TW.get('renderBattle')();document.querySelector('#bline .b27i').click();});await wait(400);
  const s=await ev(new Function(R+`const bat=q('.battle.b3');const o={open:bat.classList.contains('b27open'),btn:qa('#bparty .b27sf .btn').length};q('#bparty [data-act="b27info"]').click();return o;`));await wait(300);
  chk(`3 no Party & foes command (${a.pf}); a tap on a hero card opens the details (${d.det}); the strip's ☰ opens the sheet (${s.open}, ${s.btn} buttons at its foot)`,!a.pf&&d.det&&s.open&&s.btn>=3||JSON.stringify([a.pf,d,s]));
  await ev(()=>{const b=document.querySelector('#bcmd [data-arg="skills"]');if(b)b.click();});await wait(700);
  const l=await ev(new Function(R+`const c=r(q('#bcmd')),st=r(q('#bwrap')),cards=qa('#bparty .pc,#bparty .fc').filter(vis).map(r),mi=qa('#bcmd .menu.list .mi').map(r),ls=r(q('#bcmd .menu.list')),m0=q('#bcmd .menu.list .mi');
    return {list:q('.battle.b3').classList.contains('b3list'),c,st,minX:Math.min(...cards.map(x=>x.x)),n:mi.length,cols:new Set(mi.map(m=>m.x)).size,inView:mi.filter(m=>m.y>=ls.y-1&&m.b<=ls.b+6).length,rowH:mi[0]&&mi[0].h,vh:innerHeight,
      parts:['.n','small','.m .sk11e','.m .sk11c'].map(s=>{const e=m0.querySelector(s);return !!e&&vis(e);}),scroll:q('#bcmd .menu.list').scrollHeight>ls.h+2};`));
  chk(`5 an open skill list stays in the box under the stage (${l.c.y}..${l.c.b}, the stage ends at ${l.st.b}) and left of the cards (${l.c.r} <= ${l.minX}): ${l.n} skills as boxes in ${l.cols} columns, a box is ${l.rowH} px high, ${l.inView} in full view at once, the rest by scrolling (${l.scroll}); a row shows name and tags, text, estimate and cost`,
    l.list&&l.n>1&&l.cols>=3&&l.c.y>=l.st.b-2&&l.c.b<=l.vh&&l.c.r<=l.minX&&l.rowH<=120&&l.inView>=Math.min(l.cols,l.n)-1&&l.parts.every(Boolean)||JSON.stringify(l));
  await H.browser.close();
  H=await boot(390,844,true);const p=await H.ev(snap);await H.browser.close();
  // 0.22.50: an opened fold or an upright tablet has the column too; the line floats over the stage's side, the list rises on that side
  H=await boot(673,841,true);const fo=await H.ev(snap);await H.ev(()=>{const b=document.querySelector('#bcmd [data-arg="skills"]');if(b)b.click();});await H.wait(700);
  const fl=await H.ev(new Function(R+`const c=r(q('#bcmd')),cards=qa('#bparty .pc,#bparty .fc').filter(vis).map(r),mi=qa('#bcmd .menu.list .mi').map(r);return {c,minX:Math.min(...cards.map(x=>x.x)),n:mi.length,h:mi[0]&&mi[0].h};`));await H.browser.close();
  chk(`6 an opened fold (673x841): column on (${fo.on}), ${fo.heroes+fo.foes} cards right of the stage (${fo.minX} >= ${fo.st.r}), the line stays over the stage (${fo.bl.x}..${fo.bl.r}), not in the strip (${fo.top}); the skill list rises left of the cards (${fl.c.r} <= ${fl.minX}), ${fl.n} boxes about ${fl.h} px high`,
    fo.on&&!fo.top&&fo.heroes===fo.party&&fo.foes===fo.en&&fo.minX>=fo.st.r&&fo.bl.r<=fo.minX&&fo.st.w>=400&&fl.c.r<=fl.minX&&fl.n>1&&fl.h<=110||JSON.stringify([fo.on,fo.top,fo.st,fo.bl,fo.minX,fl]));
  H=await boot(560,760,true);const w=await H.ev(snap);
  chk(`4 a phone keeps its layout (column ${p.on}, Party & foes ${p.pf}, stage ${p.st.w} wide of ${p.vw}); so does a 560x760 window (column ${w.on}, Party & foes ${w.pf})`,!p.on&&p.pf&&p.st.w>=p.vw-12&&!w.on&&w.pf||JSON.stringify([p.on,p.pf,p.st,w.on,w.pf]));
  await done(H);})();
