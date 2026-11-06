// Beta v0.6.3 (3): aiming a detonator shows who it sets off and which reaction, and the reaction floats over the detonated foe.
// The owner: "when targeting a detonator show clearly who it can detonate on and what reaction it will set off, also have that reaction
// float through as part of the effect list that comes over the head of the one detonated". Foe A is primed with an element the skill
// detonates, foe B with one it does not, foe C is not primed. Checks the stage tags, the canvas glow, the foe cards, the skill list, then
// fires the skill at A and checks the floating reaction text (name and both element icons, over A). Fails on v0.6.2, passes now.
const {open,chk,done}=require('./pw');const {META,battle}=require('./v063lib');
(async()=>{for(const [w,h] of [[390,844],[844,390],[933,705],[1280,800]]){const H=await open({w,h,mobile:w<1000,pre:META('medium')});const tag=w+'x'+h;
  await battle(H,{heroes:3,foes:3,seed:5,lv:22});
  const s=await H.ev(()=>{const A=__A,B=A.B;const m=B.front.find(c=>c.hp>0&&A.known(c).some(s=>s.role==='det'&&s.t==='one'));if(!m)return {err:'no detonator'};B.cur=m;
    const sk=A.known(m).find(s=>s.role==='det'&&s.t==='one'),els=A.skEls(sk),R=Object.keys(A.REACT).map(k=>A.REACT[k]).find(R=>els.includes(R.d)),other=['fire','ice','water','lightning','earth','wind','light','shadow'].find(p=>!els.some(d=>{const q=A.REACT[[p,d].sort().join('+')];return q&&q.p===p&&q.d===d;}));
    B.en[0].primed={el:R.p,t:2,by:'Mira'};B.en[1].primed={el:other,t:2,by:'Mira'};B.en[2].primed=null;m.mp=m.S.mmp;A.render();
    return {sk:sk.id,n:sk.n,R:R.n,p:R.p,d:R.d,a:B.en[0].name,b:B.en[1].name,c:B.en[2].name};});
  if(s.err){chk(tag+': setup',s.err);await H.browser.close();continue;}
  // the skill list names the foe it sets off, the reaction and both element icons
  const L=await H.ev(s=>{const A=__A;A.ACT.cmd('skills');const b=document.querySelector(`#bcmd [data-act="sk"][data-arg="${s.sk}"]`);if(!b)return {err:'no skill button'};const f=[...b.querySelectorAll('.detf')];
    return {n:f.length,txt:f.map(e=>e.title||'').join(' | '),words:f.map(e=>e.textContent.replace(/[✸\s]/g,'')).join(''),icons:f.map(e=>e.querySelectorAll('.ico').length)};},s);
  chk(`${tag}: the skill list shows "${s.n}" sets off ${s.R} on ${s.a}: symbols only, names in the tooltip (v0.7.7) (${L.txt||L.err})`,L.n===1&&L.txt.includes(s.R)&&L.txt.includes(s.a)&&!L.txt.includes(s.b)&&L.icons[0]===1&&L.words===''||JSON.stringify(L));
  // aim it: tags on the stage, glow on the canvas, the foe cards
  const T=await H.ev(s=>{const A=__A,B=A.B;A.ACT.sk(s.sk);const tags=[...document.querySelectorAll('#bstage .b3tg')],det=tags.filter(e=>e.classList.contains('det'));
    const g=typeof A.detTargets==='function'?A.detTargets(B.pend&&B.pend.sk).map(o=>o.e.name):[];
    const cards=[...document.querySelectorAll('#bparty .fc.dethit')].map(e=>e.getAttribute('aria-label')),chip=[...document.querySelectorAll('#bparty .pchip.hit')].map(e=>e.textContent);
    return {menu:B.menu,tags:tags.length,det:det.map(e=>({t:e.textContent,ico:e.querySelectorAll('.eff.rx .ico').length})),glow:g,cards,chip};},s);
  chk(`${tag}: aiming shows a reaction tag on ${s.a} only: ${JSON.stringify(T.det)}`,T.menu==='target'&&T.det.length===1&&T.det[0].t.includes(s.R)&&T.det[0].ico===2||JSON.stringify(T));
  chk(`${tag}: the other targets get a plain tag (name and effectiveness)`,T.tags>=2||JSON.stringify(T));
  chk(`${tag}: ${s.a} glows as a detonation target on the stage, the others do not`,T.glow.length===1&&T.glow[0]===s.a||JSON.stringify(T.glow));
  chk(`${tag}: its card is marked and names the reaction`,T.cards.length===1&&T.cards[0].startsWith(s.a)&&T.chip.length===1&&T.chip[0].includes(s.R)||JSON.stringify({c:T.cards,ch:T.chip}));
  // set it off: the reaction floats over the foe with both icons
  const F=await H.ev(async s=>{const A=__A,B=A.B,e=B.en[0];A.setPause(60);e.hp=e.S.mhp;A.ACT.tgtE(0);let t=0,el=null;
    while(t<4000){await new Promise(q=>setTimeout(q,50));t+=50;el=[...document.querySelectorAll('#bstage .fx2.react')].find(x=>x.textContent.includes(s.R));if(el)break;}
    A.setPause(99999);if(!el)return {err:'no reaction text',log:B.log.slice(-3)};const r=el.getBoundingClientRect(),u=A.unitBox(e),st=document.getElementById('bstage').getBoundingClientRect(),sc=A.BL.sc;
    const cx=st.left+u.x*sc,top=st.top+(u.y-u.h)*sc;return {txt:el.textContent,ico:el.querySelectorAll('.ico').length,dx:Math.round(r.left+r.width/2-cx),dy:Math.round(r.bottom-top),w:u.w*sc,h:u.h*sc};},s);
  chk(`${tag}: "${F.txt||F.err}" floats with both element icons`,!F.err&&F.txt.includes(s.R)&&F.ico===2||JSON.stringify(F));
  chk(`${tag}: it floats at ${s.a}'s head (offset ${F.dx}, ${F.dy} px)`,!F.err&&Math.abs(F.dx)<=F.w&&F.dy<=F.h*.6&&F.dy>-F.h*1.6||JSON.stringify(F));
  await H.browser.close();}
const H=await open({});await done(H);})();
