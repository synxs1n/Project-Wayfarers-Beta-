// v0.9.5 nudges, part 2: the "Next goals" panel (goals.js)
// 1) the panel shows 2 to 4 goals in the world: the story step first, then system goals; collapsible; also in Guides > What next?
// 2) a goal done pays once (gold, XP, an item for some) with a toast; the story moves on ("Find the Scourge's lair in <realm>")
// 3) an old save (no G.goals) marks what it already did as done without paying; nothing in the Daily Trial
// 4) at 390x844, 412x812, 844x390 and 933x705, with the hero walked to every part of the view: the panel stays inside the view and
//    never covers the hero, the stick, the A/B buttons or the minimap (boxes measured here, not taken from goals.js); no page errors
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v095nb.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false,tips:false}}));`;
const START=()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();};
const SIZES=[[390,844,true],[412,812,true],[844,390,true],[933,705,false]];
(async()=>{
const H=await open({w:390,h:844,mobile:true,pre:PRE});const {ev,wait}=H;await ev(START);await wait(500);
// ---------- 1) the panel ----------
let r=await ev(()=>{const A=__A,L=__GL,G=A.G;L.glCheck();L.glRender();const e=document.getElementById('glp');
  return {n:L.glList().length,ids:L.glList().map(g=>g.id),shown:!!e&&e.style.display!=='none'&&e.offsetWidth>0,items:e?[...e.querySelectorAll('.gll li')].map(li=>li.textContent):[],head:e?(e.querySelector('.glhead')||{}).textContent:'',g:G.goals};});
console.log(JSON.stringify(r));
chk('the panel shows in the world with 2 to 4 goals',r.shown&&r.n>=2&&r.n<=4||JSON.stringify(r));
chk('the story step comes first',/^st0a$/.test(r.ids[0])&&/^Head out into /.test(r.items[0]||'')||JSON.stringify(r));
chk('system goals lead into depth (the first is "Hit a foe on its weak spot")',r.ids.includes('weak')&&r.items.some(t=>/Hit a foe on its weak spot/.test(t))||JSON.stringify(r));
chk('saved in the optional field G.goals',Array.isArray(r.g.a)&&typeof r.g.d==='object'||JSON.stringify(r.g));
r=await ev(async()=>{const A=__A,L=__GL;A.ACT.goalsT();await new Promise(q=>setTimeout(q,50));const e=document.getElementById('glp');const a={chip:e.classList.contains('chip'),items:e.querySelectorAll('.gll li').length,min:A.META.cfg.goalsMin};
  A.ACT.goalsT();await new Promise(q=>setTimeout(q,50));a.back=!e.classList.contains('chip')&&e.querySelectorAll('.gll li').length>0;return a;});
chk('the header folds it to a small chip and back (remembered in META.cfg.goalsMin)',r.chip&&r.items===0&&r.min===true&&r.back||JSON.stringify(r));
r=await ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'next'};A.render();const h=document.getElementById('modal').innerHTML;A.V.modal=null;A.render();return {sec:/<h4>Next goals<\/h4>/.test(h),rew:/Reward: \+\d+ gold, XP/.test(h),weak:/Hit a foe on its weak spot/.test(h)};});
chk('Guides > What next? lists the same goals with their rewards',r.sec&&r.rew&&r.weak||JSON.stringify(r));
r=await ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'party'};A.render();const e=document.getElementById('glp');const hid=!e||e.style.display==='none';A.V.modal=null;A.render();return hid;});
chk('the panel hides while a window is open',r===true);

// v0.9.6 depth unlocks (pacing.js pcUnlocked): no goal points at a system before it opens on this journey
r=await ev(()=>{const L=__GL,G=__A.G,f=id=>L.GOALS.find(x=>x.id===id);const s0=G.stage,c0=G.cleared.slice();const a={pcV:G.pcV,r0:f("react").ok(),c0:f("camp").ok(),m0:f("guildm").ok(),t0:f("temper").ok()};
  G.stage=2;G.cleared=[true,true,false,false,false];a.c2=f("camp").ok();a.m2=f("guildm").ok();a.t2=f("temper").ok();G.stage=s0;G.cleared=c0;return a;});
chk("first realm of a new journey: no reactions, temper, camp or guild mission goal; camp and guild missions from the third realm",r.pcV===1&&!r.r0&&!r.c0&&!r.m0&&!r.t0&&r.c2&&r.m2&&r.t2||JSON.stringify(r));
// ---------- 2) done pays once ----------
r=await ev(()=>{const A=__A,L=__GL,G=A.G,N=__NZ;const g0=G.gold,x0=G.party.map(id=>G.roster[id].xp+'/'+G.roster[id].lv),i0=G.inv.remedy||0;
  // the weak spot goal: a win where a hero hit a weakness
  A.setPause(99999);const k=Object.keys(A.MON).filter(k=>!A.MON[k].mimic)[0];A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k],3)]});const B=A.B;B.hitWeak=1;B.tP=4;B.tA=0;
  B.en.forEach(e=>{e.hp=0;B.kills.push(e);});A.win();const gWin=G.gold;A.V.modal=null;A.finishBattle('x');A.V.screen='world';A.render();
  const R=L.glReward('weak');const paid=G.gold-gWin,toast=N.toast,done=!!G.goals.d.weak,still=L.glList().some(g=>g.id==='weak');
  const g1=G.gold;L.glCheck();L.glCheck();const again=G.gold-g1;const x1=G.party.map(id=>G.roster[id].xp+'/'+G.roster[id].lv);
  return {R,paid,toast,done,still,again,xpChanged:JSON.stringify(x0)!==JSON.stringify(x1),ids:L.glList().map(g=>g.id)};});
chk(`a done goal pays its reward (+${r.R.gold} gold and XP) with a toast`,r.paid===r.R.gold&&/^Goal done: Hit a foe on its weak spot\. \+\d+ gold, XP\./.test(r.toast)&&r.xpChanged||JSON.stringify(r));
chk('it pays once and leaves the list, a new goal takes its place',r.done&&!r.still&&r.again===0&&r.ids.length>=2||JSON.stringify(r));
r=await ev(()=>{const A=__A,L=__GL,G=A.G,N=__NZ;const g0=G.gold;G.been=G.been||{};G.been['f0']=1;L.glCheck();const paid=G.gold-g0,toast=N.toast,list=L.glList();
  const R0=L.glReward('st0a');return {paid,R0,toast,first:list[0]&&list[0].t,id:list[0]&&list[0].id,realm:A.ZS(0).n};});
chk(`the story moves on: "${r.first}"`,r.id==='st0b'&&r.first===`Find the Scourge's lair in ${r.realm}`&&r.paid===r.R0.gold&&/Goal done: Head out into/.test(r.toast)||JSON.stringify(r));
r=await ev(()=>{const A=__A,L=__GL,G=A.G;const st=G.goals;st.a=st.a.filter(id=>id!=='react');st.a.push('react');st.b['react@']=st.c.react|0;
  const before=L.glList().find(g=>g.id==='react');st.c.react=(st.c.react|0)+2;L.glRender();const mid=L.glList().find(g=>g.id==='react'),txt=(document.querySelector('#glp [data-goal="react"]')||{}).textContent||'';
  const g0=G.gold,e0=G.inv.ether||0;st.c.react+=1;L.glCheck();return {p0:before.p,p1:mid.p,txt,paid:G.gold-g0,ether:(G.inv.ether||0)-e0,done:!!st.d.react};});
chk('a counted goal shows its progress ("Set off 3 reactions 2/3")',r.p0==='0/3'&&r.p1==='2/3'&&/Set off 3 reactions\s*2\/3/.test(r.txt)||JSON.stringify(r));
chk('it pays with its item (an Ether) when done',r.done&&r.paid>0&&r.ether===1||JSON.stringify(r));

// ---------- 3) old save, Daily Trial ----------
r=await ev(()=>{const A=__A,L=__GL,G=A.G;delete G.goals;G.tamed=[{id:'tq',mon:'mossling',name:'Wild Mossling',with:G.party[0]}];G.stage=1;G.cleared[0]=true;
  const g0=G.gold;L.glCheck();const st=G.goals;return {paid:G.gold-g0,tame:!!st.d.tame,comp:!!st.d.comp,shown:L.glList().map(g=>g.id)};});
chk('an old save (no G.goals): goals it already met count as done, with no pay',r.paid===0&&r.tame&&r.comp&&!r.shown.includes('tame')||JSON.stringify(r));
r=await ev(async()=>{const A=__A,L=__GL;A.ACT.dailyGo();for(let i=0;i<60&&!(A.B);i++)await new Promise(q=>setTimeout(q,50));const on=L.glOn(),list=L.glList().length;
  const e=document.getElementById('glp');const vis=!!e&&e.style.display!=='none'&&e.offsetWidth>0;return {daily:!!A.G.daily,on,list,vis};});
chk('nothing in the Daily Trial',r.daily&&!r.on&&r.list===0&&!r.vis||JSON.stringify(r));


// ---------- 4) layout at four sizes, hero walked over the view ----------
for(const [w,h,mob] of SIZES){const S=await open({w,h,mobile:mob,pre:PRE,tag:'s'+w});await S.ev(START);await S.wait(600);
  // walk the hero (teleport) over a grid of spots in a field, measure after each
  const res=await S.ev(async()=>{const A=__A,L=__GL,WS=A.WS,out={n:0,bad:[],modes:{},outside:0,hidden:0};
    try{A.ACT.storyOk&&0;}catch(e){}
    const m=WS.m,TS=16,box=e=>{if(!e)return null;const b=e.getBoundingClientRect();return b.width&&b.height?b:null;},hit=(a,b)=>a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    const vis=e=>e&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden';
    for(let fy=.1;fy<=.9;fy+=.2)for(let fx=.1;fx<=.9;fx+=.2){const tx=Math.floor(m.w*fx),ty=Math.floor(m.h*fy);WS.px=tx*TS;WS.py=ty*TS;WS.cam=null;A.worldDraw2(performance.now());
      await new Promise(q=>setTimeout(q,420));A.worldDraw2(performance.now());L.glRender();
      const e=document.getElementById('glp');if(!e||e.style.display==='none'){out.hidden++;continue;}out.n++;const P=box(e);out.modes[e.className]=(out.modes[e.className]||0)+1;
      // the hero, measured here: his tile on the canvas through the camera, as drawn (16 px wide, about 26 px tall from the head)
      const cv=WS.cv.getBoundingClientRect(),k=cv.width/WS.vw,hx=cv.left+(WS.px+8-WS.cam.x)*k,hy=cv.top+(WS.py+8-WS.cam.y)*k;
      const hero={left:hx-8*k,right:hx+8*k,top:hy-18*k,bottom:hy+8*k};
      const wv=box(document.querySelector('.wview'));if(P.left<wv.left-1||P.right>wv.right+1||P.top<wv.top-1||P.bottom>wv.bottom+1)out.outside++;
      const visHero=hero.right>cv.left&&hero.left<cv.right&&hero.bottom>cv.top&&hero.top<cv.bottom;
      if(visHero&&hit(P,hero))out.bad.push('hero@'+tx+','+ty);
      ['#joy','.pad .abtns','#mmap'].forEach(s=>{const el=document.querySelector(s);if(vis(el)&&hit(P,box(el)))out.bad.push(s+'@'+tx+','+ty);});
      // nothing inside is cut
      [...e.querySelectorAll('span,b,em,button')].forEach(x=>{if(x.scrollWidth>x.clientWidth+2&&getComputedStyle(x).overflow!=='visible')out.bad.push('cut:'+x.textContent.slice(0,20));});}
    return out;});
  console.log(w+'x'+h,JSON.stringify(res));
  chk(`${w}x${h}: the panel shows at every hero spot (${res.n} of 25, ${JSON.stringify(res.modes)})`,res.n===25||JSON.stringify(res));
  chk(`${w}x${h}: inside the view, never over the hero, the stick, A/B or the minimap`,res.outside===0&&res.bad.length===0||JSON.stringify(res));
  await S.browser.close();}
await done(H);})();
