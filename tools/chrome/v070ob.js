// v0.7.x onboarding (v3/onboard.js): where the cards sit, at 390x844, 844x390, 933x705 and 1280x720.
// Battle: a tip card never overlaps a sprite (alpha bounds measured here, as in v063ba, plus the b3Lay boxes), a foe or hero card or
// the commands, and stays inside the battle stage, over random battles (1 to 6 heroes, 1 to 5 foes, flyers, statuses, primes, shields).
// World, shop window, Guides > How it works and the starter screen: the card fits, no text is cut or hidden, two lines of text at most,
// nothing scrolls sideways. No page errors.
// N=<battles per size> (default 6). Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v070ob.js
const {open,chk,done}=require('./pw');const {META,battle,dress,rects}=require('./v063lib');
const N=+process.env.N||6;
const SIZES=[[390,844],[844,390],[933,705],[1280,720]];
// the card's box and whether its text fits (no cut, no hidden overflow) and how many lines it takes
const CARD=()=>{const d=document.getElementById('p2hint');if(!d||!d.classList.contains('show'))return null;const b=d.getBoundingClientRect(),t=d.querySelector('.obt')||d.querySelector('span'),lh=parseFloat(getComputedStyle(t).lineHeight)||15;
  const btn=[...d.querySelectorAll('button')].every(x=>x.scrollWidth<=x.clientWidth+1);
  return {x:b.left,y:b.top,w:b.width,h:b.height,clip:d.scrollWidth>d.clientWidth+1||d.scrollHeight>d.clientHeight+1||!btn,lines:Math.round(t.getBoundingClientRect().height/lh),inView:b.left>=-.5&&b.top>=-.5&&b.right<=innerWidth+.5&&b.bottom<=innerHeight+.5,tip:d.dataset.tip||'',slim:d.classList.contains('slim')};};
const ov=(a,b,t)=>a.x<b.x+b.w-t&&a.x+a.w-t>b.x&&a.y<b.y+b.h-t&&a.y+a.h-t>b.y;
(async()=>{
for(const [w,h] of SIZES){const tag=w+'x'+h;const H=await open({w,h,mobile:w<1000,pre:META('medium',{tips:true})});const {ev,wait}=H;
  // ---------- battle ----------
  let bad=[],n=0,lines=0,out=0,slim=0;
  const kinds=['primed','shield','status','types','react','weak'];
  for(let i=0;i<N;i++){const seed=300+i*41+w,R=(k=>()=>((k=Math.imul(k^k>>>15,2246822507)+0x6D2B79F5>>>0)%1e6)/1e6)(seed);
    const opt={seed,heroes:1+Math.floor(R()*6),foes:1+Math.floor(R()*5),stage:0};opt.fly=Math.floor(R()*Math.min(2,opt.foes+1));
    const r0=await battle(H,opt);if(r0.mode!=='cmd'){console.log('  skip',JSON.stringify(opt),r0.mode);continue;}
    await dress(H,{seed:seed+1,maxSt:3,fx:1,prime:0,shield:0});
    const kind=kinds[i%kinds.length];
    const c=await ev(async k=>{const A=__A,O=__OB,B=A.B,e=B.en.find(x=>x.hp>0);clearInterval(O.OB.tick);O.obM().s={};O.OB.q=[];if(O.OB.cur)O.obClose();
      // long names make the longest cards
      e.name=e.name.length<16?e.name+' the Elder':e.name;
      if(k==='primed')e.primed={el:'fire',t:2,by:'Mira'};if(k==='shield'){e.maxShield=4;e.shield=4;}if(k==='status')B.front[0].st.poison={t:3};if(k==='types')e.ty=['armored'];if(k==='react'){B.nDet=1;e.reactN='Overload';}if(k==='weak')B.hitWeak=1;
      A.render();await new Promise(q=>setTimeout(q,60));
      // show exactly this moment's card (other moments of the dressing are marked seen first)
      O.TIPS.forEach(t=>{if(t.id!==k)O.obM().s[t.id]=1;});O.OB.last=0;O.obTick();await new Promise(q=>setTimeout(q,80));A.render();await new Promise(q=>setTimeout(q,80));
      return O.OB.cur;},kind);
    const card=await ev(CARD);if(!card||c!==kind){bad.push(`#${i} ${kind}: no card (${c})`);continue;}n++;
    const R1=await rects(H);
    const dom=await ev(()=>{const q=s=>[...document.querySelectorAll(s)].map(e=>{const b=e.getBoundingClientRect();return {x:b.left,y:b.top,w:b.width,h:b.height,n:s};}).filter(b=>b.w&&b.h);
      const wr=document.getElementById('bwrap').getBoundingClientRect(),lr=document.getElementById('bline').getBoundingClientRect();return {line:{x:lr.left,y:lr.top,w:lr.width,h:lr.height},cards:q('#bparty .fc').concat(q('#bparty .pc'),q('#bcmd .mi'),q('#bcmd .cmdback')),wrap:{x:wr.left,y:wr.top,w:wr.width,h:wr.height}};});
    const L=await ev(()=>{const O=__OB,L=O.b3Lay(true),st=document.getElementById('bstage').getBoundingClientRect(),k=st.width/L.W;return L.bodies.map(o=>({x:st.left+o.r.x*k,y:st.top+o.r.y*k,w:o.r.w*k,h:o.r.h*k,n:o.u.name}));});
    const hits=R1.bodies.filter(b=>ov(card,b,.5)).map(b=>'sprite '+b.n).concat(L.filter(b=>ov(card,b,.5)).map(b=>'body box '+b.n),dom.cards.filter(b=>ov(card,b,.5)).map(b=>b.n));
    const U={x:Math.min(dom.wrap.x,dom.line.x),y:dom.wrap.y,w:Math.max(dom.wrap.x+dom.wrap.w,dom.line.x+dom.line.w)-Math.min(dom.wrap.x,dom.line.x),h:dom.line.y+dom.line.h-dom.wrap.y};// the stage and the log line under it
    const inStage=card.x>=U.x-1&&card.y>=U.y-1&&card.x+card.w<=U.x+U.w+1&&card.y+card.h<=U.y+U.h+1;if(card.slim)slim++;
    if(hits.length||card.clip||!card.inView)bad.push(`#${i} ${kind} ${JSON.stringify(opt)}: ${hits.join(', ')}${card.clip?' text cut':''}${card.inView?'':' off screen'}`);
    if(!inStage)out++;if(card.lines>2)lines++;
    if(i===0||card.slim)await H.shot('v070ob_battle_'+tag+(card.slim?'_slim':''));
    await ev(()=>{const A=__A;__OB.obClose();A.finishBattle('x');A.V.modal=null;A.V.screen='world';});}
  bad.forEach(b=>console.log('  ',tag,b));
  chk(`${tag}: battle tip cards (${n}) never cover a sprite, a foe or hero card or the commands, and nothing is cut`,n>0&&bad.length===0||`${bad.length} bad`);
  chk(`${tag}: battle tip cards sit on the battle stage (${slim} slim over the log line)`,out===0||`${out} outside`);
  chk(`${tag}: battle tip cards take two lines of text at most`,lines===0||`${lines} longer`);
  // ---------- world ----------
  let r=await ev(async()=>{const A=__A,O=__OB;O.obM().s={};O.TIPS.forEach(t=>{if(t.id!=='camp')O.obM().s[t.id]=1;});A.V.modal=null;A.V.screen='world';A.B=null;A.G.inv.campkit=2;A.render();O.OB.last=0;O.obTick();await new Promise(q=>setTimeout(q,300));return O.OB.cur;});
  let c=await ev(CARD);
  chk(`${tag}: world card fits, nothing cut, two lines at most`,r==='camp'&&c&&c.inView&&!c.clip&&c.lines<=2||JSON.stringify([r,c]));
  if(c)await H.shot('v070ob_world_'+tag);
  await ev(()=>__A.ACT.tipOk());
  // ---------- inside a shop window ----------
  r=await ev(async()=>{const A=__A,O=__OB,G=A.G;delete O.obM().s.temper;G.gold=999999;G.party.forEach(id=>{const c=G.roster[id];['w','a'].forEach(sl=>{const f=c.eq[sl]&&O.forgeCost(c.eq[sl]);if(f)Object.keys(f.m).forEach(k=>{G.mats[k]=(G.mats[k]||0)+f.m[k];});});});
    A.V.modal={type:'smithy'};A.render();O.OB.last=0;O.obTick();A.render();await new Promise(q=>setTimeout(q,350));
    const d=document.getElementById('p2hint'),p=document.querySelector('#modal .panel.box');if(!d||!p)return {none:1,cur:O.OB.cur};const b=d.getBoundingClientRect(),pb=p.getBoundingClientRect();
    return {cur:O.OB.cur,inside:p.contains(d),fits:b.left>=pb.left-.5&&b.right<=pb.right+.5,side:p.scrollWidth>p.clientWidth+1,vis:pb.bottom<=innerHeight+.5&&pb.top>=-.5};});
  c=await ev(CARD);
  chk(`${tag}: in a shop the card sits inside the window, fits, nothing cut, no sideways scroll`,r.cur==='temper'&&r.inside&&r.fits&&!r.side&&r.vis&&c&&!c.clip&&c.lines<=2||JSON.stringify([r,c]));
  if(c)await H.shot('v070ob_shop_'+tag);
  await ev(()=>{__A.ACT.tipOk();__A.V.modal=null;__A.render();});
  // ---------- Guides > How it works, every system met ----------
  r=await ev(async()=>{const A=__A,O=__OB;O.TIPS.forEach(t=>{O.obM().s[t.id]=1;});A.V.modal={type:'menu',tab:'sysg',obAt:'react'};A.render();document.querySelectorAll('#modal details.obgi').forEach(d=>d.open=true);await new Promise(q=>setTimeout(q,100));
    const p=document.querySelector('#modal .panel.box'),pb=p.getBoundingClientRect();const cut=[...p.querySelectorAll('.obgi,.obgi summary,.obgi .note,.obgi .btn')].filter(e=>e.scrollWidth>e.clientWidth+1).length;
    const out=[...p.querySelectorAll('.obgi')].filter(e=>{const b=e.getBoundingClientRect();return b.left<pb.left-.5||b.right>pb.right+.5;}).length;
    const n=p.querySelectorAll('.obgi').length;p.scrollTop=p.scrollHeight;await new Promise(q=>setTimeout(q,50));const last=[...p.querySelectorAll('.btnrow')].pop().getBoundingClientRect();
    const res={n,cut,out,side:p.scrollWidth>p.clientWidth+1,vis:pb.bottom<=innerHeight+.5&&pb.top>=-.5,end:last.bottom<=innerHeight+.5};A.V.modal=null;A.render();return res;});
  chk(`${tag}: Guides > How it works lists every system (${r.n}), nothing cut, the end can be reached`,r.n===await ev(()=>__OB.TIPS.length)&&!r.cut&&!r.out&&!r.side&&r.vis&&r.end||JSON.stringify(r));
  // ---------- starter screen (New Game+) ----------
  r=await ev(async()=>{const A=__A,O=__OB;delete O.obM().s.ngplus;const g=A.G;A.V.screen='starter';A.V.ngCycle=1;A.V.pick=A.V.pick||[];A.render();O.OB.last=0;O.obTick();A.render();await new Promise(q=>setTimeout(q,300));
    const d=document.getElementById('p2hint'),pk=document.querySelector('.ngpick');return {cur:O.OB.cur,before:!!(d&&pk&&d.nextElementSibling===pk)};});
  c=await ev(CARD);
  chk(`${tag}: on the New Game+ starter screen the card sits above the modifiers, fits, nothing cut`,r.cur==='ngplus'&&r.before&&c&&!c.clip&&c.lines<=2||JSON.stringify([r,c]));
  if(c)await H.shot('v070ob_starter_'+tag);
  await H.browser.close();}
const H=await open({});await done(H);})();
