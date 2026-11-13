// roster pass 14 (v3/menus14.js item 1, v3/roster14.js items 2 and 3), the owner's three notes after 0.20.5:
// 1) learn levels: all 92 kits spread so the last class skill comes at level 45 (the first one or two at the start level, no gap over 6, never three
//    within 3 levels, the old order kept, Limit Breaks still at 15 and 30); a save already moved to the 0.20.3 levels (G.m14lv 1) and one from before
//    it keep every skill the levels it saw gave (c.keep), once (G.m14lv 2); a new journey is marked 2
// 2) permanent recruits (META.legacy): beating the game opens a choose any number list (several in one victory, a cycle counted once, more later from
//    Menu > Journey, no cap); every one is offered on the starter screen of every later journey; the three heroes rule is the old one (a permanent
//    recruit takes one of the three places, up to two); the pool goes to the cloud profile (flags.legacy sorted, a union, cycles the larger); old picks stay
// 3) the starter pool: 500 draws, each exactly 16 wayfarers, two of each of the 8 elements (the first element) and two of each of the 8 classes, never a
//    Legendary, never a permanent recruit, every hero of the 88 turns up and none is far over its share; the screen shows the sixteen grouped by class
// SHOTDIR=dir saves screenshots. Usage: PWHTML=../../out/aurelis3.html [SHOTDIR=/tmp/x] node v185a.js
const {open,chk,done}=require('./pw');
const PRE=(meta)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify(Object.assign({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'medium',hints:false,tips:false}},${JSON.stringify(meta||{})})));`;
const SH=process.env.SHOTDIR;
(async()=>{let last=null;
// ---------- 1: learn levels ----------
{const H=await open({w:390,h:844,pre:PRE()});const {ev}=H;last=H;
 const kt=await ev(()=>{const S=__S12,T=S.TPL,M=__M14,A=__A,bad=[],lasts={},gaps={};let n=0,limits=null;
  Object.keys(T).forEach(id=>{const t=T[id];if(t.mon||!S.CLS[t.cls])return;n++;const k=S.kit(t).slice().sort((a,b)=>a.lv-b.lv),L=k.map(s=>s.lv);
   const ord=k.every((s,i)=>!i||s.lv12>=k[i-1].lv12);const probs=M.check(L);if(!ord)probs.push('order');if(k.length!==12)probs.push('count '+k.length);
   const last=L[L.length-1],gap=Math.max(...L.slice(1).map((x,i)=>x-L[i]));lasts[last]=(lasts[last]||0)+1;gaps[gap]=(gaps[gap]||0)+1;if(probs.length)bad.push(id+':'+probs.join('/')+':'+L.join(','));});
  const ex=S.kit(T.brann).slice().sort((a,b)=>a.lv-b.lv).map(s=>s.lv);
  // old saves: the first hero with a skill the new levels delay past the 0.20.3 and the original levels
  let dl=null;for(const id of Object.keys(T)){const t=T[id];if(t.mon||!S.CLS[t.cls]||t.src==='L'||t.src==='x')continue;const s=S.kit(t).find(x=>x.lvP!=null&&x.lvP<x.lv&&x.lv12<x.lv&&x.lvP-x.lv12>=1);if(s){dl={id,sk:s.id,n:s.n,p:s.lvP,o:s.lv12,lv:s.lv};break;}}
  const mk=(lv,flag)=>{const h=A.TW.get('newChar')(dl.id,lv);h.lv=lv;delete h.keep;const g={roster:{[dl.id]:h}};if(flag!=null)g.m14lv=flag;return g;};
  const g0=mk(dl.p,null),r0=M.keep(g0),g1=mk(dl.p,1),r1=M.keep(g1),gp=mk(dl.o,1),rp=M.keep(gp),g2=mk(dl.p,2),r2=M.keep(g2),go=mk(dl.o,null),ro=M.keep(go);
  const has=(g,id)=>(g.roster[dl.id].keep||[]).includes(id);
  A.ACT.new();['brann','mira','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();
  return {n,bad,lasts,gaps,ex,dl,r:[r0,r1,rp,r2,ro],f:[g0.m14lv,g1.m14lv,gp.m14lv,g2.m14lv,go.m14lv],
   keepOrig:has(g0,dl.sk),keepP:has(g1,dl.sk),keepPold:has(gp,dl.sk),noKeep2:!g2.roster[dl.id].keep,keepOld:has(go,dl.sk),newFlag:M.G.m14lv,LIM:[A.TW.get('LIMIT_LV'),A.TW.get('LIMIT2_LV')]};});
 console.log('kits:',JSON.stringify(kt));
 chk(`learn levels: ${kt.n} kits, each 12 skills, first one or two at level 1, last at 45 (${JSON.stringify(kt.lasts)}), largest gap ${JSON.stringify(kt.gaps)} (<= 6), never three within 3 levels, order kept`,kt.n===92&&kt.bad.length===0&&Object.keys(kt.lasts).join()==='45'||kt.bad.slice(0,6).join(' | '));
 chk('Limit Breaks keep their levels (15 and 30)',kt.LIM[0]===15&&kt.LIM[1]===30||JSON.stringify(kt.LIM));
 chk(`a save from before the 0.20.3 spread keeps what the original levels gave (${kt.dl&&kt.dl.id}: ${kt.dl&&kt.dl.n} at ${kt.dl&&kt.dl.o}, now ${kt.dl&&kt.dl.lv}), a save moved to the 0.20.3 levels keeps what those gave (it had it at ${kt.dl&&kt.dl.p}, one at ${kt.dl&&kt.dl.o} did not); each is marked 2, a marked save is left alone`,
  !!kt.dl&&kt.keepOld&&kt.keepP&&!kt.keepPold&&kt.r[3]===0&&kt.noKeep2&&kt.f.every(x=>x===2)&&kt.r[0]>0&&kt.r[1]>0||JSON.stringify(kt));
 chk('a new journey is marked 2',kt.newFlag===2||kt.newFlag);
 await H.browser.close();}
// ---------- 3: the draw ----------
{const H=await open({w:390,h:844,pre:PRE()});const {ev}=H;last=H;
 const r=await ev(()=>{const R=__RO14,TPL=__A.TW.get('TPL'),LEG=__A.TW.get('LEGEND_IDS'),pool=R.pool(),cnt={},bad=[],C=R.classes(),E=Object.keys(__A.TW.get('EL'));let leg=0,notBase=0,sameAsLast=0,prev=null;
  for(let k=0;k<500;k++){const d=R.draw(1000003*k+17),c={},e={};d.forEach(id=>{cnt[id]=(cnt[id]||0)+1;c[TPL[id].cls]=(c[TPL[id].cls]||0)+1;e[TPL[id].el[0]]=(e[TPL[id].el[0]]||0)+1;if(LEG.includes(id))leg++;if(!C.includes(TPL[id].cls))notBase++;});
   if(d.length!==16||new Set(d).size!==16||C.some(x=>c[x]!==2)||E.some(x=>e[x]!==2)||Object.keys(c).length!==8||Object.keys(e).length!==8)bad.push(k);
   if(prev&&prev.join()===d.join())sameAsLast++;prev=d;}
  const f=pool.map(id=>cnt[id]||0),mean=500*16/pool.length;
  // the same seed gives the same sixteen; a permanent recruit is left out of the draw
  const a=R.draw(99).join(),b=R.draw(99).join();__A.META.legacy=[R.draw(5)[0]];const ex=R.draw(5);const out=!ex.includes(__A.META.legacy[0]);__A.META.legacy=[];
  const sorted=(()=>{const d=R.draw(7);return d.every((id,i)=>!i||C.indexOf(TPL[d[i-1]].cls)<=C.indexOf(TPL[id].cls));})();
  return {pool:pool.length,bad:bad.length,leg,notBase,sameAsLast,never:f.filter(x=>!x).length,min:Math.min(...f),max:Math.max(...f),mean,same:a===b,out,sorted,classes:C};});
 console.log('draw 500:',JSON.stringify(r));
 chk(`500 draws: every one has exactly 16 wayfarers, 2 of each of 8 elements and 2 of each of 8 classes (${r.classes.join(', ')})`,r.bad===0&&r.classes.length===8||r.bad);
 chk(`the draw uses the whole roster of ${r.pool} non-legend wayfarers of the 8 classes: none of the draws has a Legendary or a hero of another class`,r.pool===88&&r.leg===0&&r.notBase===0||JSON.stringify(r));
 chk(`spread: every hero turns up (min ${r.min}), none over 1.5x its share (max ${r.max}, share ${r.mean.toFixed(1)}), no two draws alike`,r.never===0&&r.max<=r.mean*1.5&&r.min>=r.mean*.5&&r.sameAsLast===0||JSON.stringify(r));
 chk('a seed gives the same sixteen, grouped by class; a permanent recruit is never drawn into them',r.same&&r.sorted&&r.out||JSON.stringify(r));
 await H.browser.close();}
// ---------- 2 and 3: the starter screen, at two sizes ----------
for(const [w,h,mob] of [[390,844,true],[1000,560,false]]){
 const H=await open({w,h,mobile:mob,pre:PRE({legacy:['brann','sylva'],cycles:2})});const {ev,wait,page}=H;last=H;const tag=`${w}x${h}: `;
 await ev(()=>{__A.ACT.new();});await wait(400);
 const s=await ev(()=>{const q=s=>document.querySelectorAll(s),A=__A,TPL=A.TW.get('TPL');const grid=document.querySelector('.ro14base ~ .grid.cards'),cards=[...grid.querySelectorAll('.card.hero')].map(c=>c.dataset.arg),
   heads=[...grid.querySelectorAll('.ro14cls')].map(e=>e.textContent.trim().split(' ')[0]),perm=[...q('.ro14perm [data-act=pickLeg]')].map(b=>b.dataset.arg);
  return {perm,permHead:!!document.querySelector('.ro14perm h3'),base:!!document.querySelector('.ro14base'),n:cards.length,heads,strip:q('.ro14bal .ro14chip').length+q('.ro14bal .el').length,slots:A.starterSlots(),begin:document.querySelector('[data-act=begin]').textContent,
   sw:document.documentElement.scrollWidth,iw:innerWidth,opts:A.V.starterOpts.length,inBase:cards.some(id=>['brann','sylva'].includes(id)),ng:(()=>{const n=document.querySelector('.ngpick'),g=document.querySelector('.ro14base ~ .grid.cards');return !!n&&!!g&&n.querySelectorAll('.ngmod').length>0&&!!(n.compareDocumentPosition(g)&Node.DOCUMENT_POSITION_FOLLOWING);})()};});
 chk(tag+'"Your permanent recruits" lists both earlier picks, the pool has its own section with 16 cards under 8 class headings and a balance strip, and the New Game+ modifier picker (twists.js) still lands before the sixteen',s.perm.join()==='brann,sylva'&&s.permHead&&s.base&&s.n===16&&s.heads.length===8&&s.strip===16&&s.opts===16&&!s.inBase&&s.ng||JSON.stringify(s));
 chk(tag+'the starting rule is the old one: the last pick is ready (one of three places), two picks left, Begin shows x/3, the page does not scroll sideways',s.slots===2&&/Begin with 1\/3/.test(s.begin)&&s.sw<=s.iw+1||JSON.stringify(s));
 const t=await ev(()=>{const A=__A;A.V.legacyPick=[];A.V.pick=[];A.ACT.pickLeg('brann');const one=A.starterSlots();A.ACT.pickLeg('sylva');const two=A.starterSlots();A.ACT.pickS(A.V.starterOpts[0]);A.ACT.pickS(A.V.starterOpts[3]);const full=A.V.pick.length;
   A.ACT.pickLeg('sylva');A.ACT.pickLeg('brann');return {one,two,full,none:A.starterSlots()};});
 chk(tag+'one permanent recruit leaves two picks, two leave one (a second pick is refused), none leave three',t.one===2&&t.two===1&&t.full===1&&t.none===3||JSON.stringify(t));
 if(SH){require('fs').mkdirSync(SH,{recursive:true});await ev(()=>{__A.V.pick=[];__A.ACT.pickLeg('brann');__A.ACT.pickLeg('sylva');__A.ACT.pickLeg('sylva');});await wait(200);await page.screenshot({path:`${SH}/v185a_starter_${w}x${h}.png`});
  await page.screenshot({path:`${SH}/v185a_starter_full_${w}x${h}.png`,fullPage:true});}
 await H.browser.close();}
// ---------- 2: beating the game ----------
{const H=await open({w:390,h:844,pre:PRE({legacy:['brann'],cycles:1})});const {ev,wait,page}=H;last=H;
 await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;['sylva','tess','gorm','dagna'].forEach(i=>A.recruit(i,true));A.G.won=true;A.V.modal={type:'legacy'};A.render();});await wait(300);
 const m=await ev(()=>{const A=__A;const cards=[...document.querySelectorAll('#modal [data-act=legToggle]')].map(b=>b.dataset.arg);return {cards,conf:document.querySelector('#modal [data-act=legConfirm]').disabled,all:!!document.querySelector('#modal [data-act=legAll]'),title:document.querySelector('#modal h2').textContent};});
 chk('victory: a list of the journey\'s wayfarers, none of them already permanent, nothing to confirm until one is ticked',m.cards.length>=6&&!m.cards.includes('brann')&&m.conf&&m.all&&/permanent/i.test(m.title)||JSON.stringify(m));
 if(SH)await page.screenshot({path:`${SH}/v185a_victory_390x844.png`});
 await ev(()=>{const A=__A;A.ACT.legToggle('sylva');A.ACT.legToggle('tess');A.ACT.legToggle('gorm');A.ACT.legToggle('tess');});await wait(100);
 const c1=await ev(()=>({on:[...document.querySelectorAll('#modal .mini.in')].map(b=>b.dataset.arg),txt:document.querySelector('#modal [data-act=legConfirm]').textContent}));
 chk('ticking is a toggle: two of three ticks stay',c1.on.join()==='sylva,gorm'&&/Add 2/.test(c1.txt)||JSON.stringify(c1));
 await ev(()=>{__A.ACT.legConfirm();});await wait(200);
 const c2=await ev(()=>{const A=__A;return {leg:A.META.legacy.slice(),cyc:A.META.cycles,ch:!!A.G.legacyChosen,modal:A.V.modal&&A.V.modal.type,txt:(document.querySelector('#modal .story')||{}).textContent||'',stored:JSON.parse(localStorage.getItem('aurelis-meta-v1')).legacy};});
 chk('Add: both ticked heroes join the pool together with the old pick, one victory counts one cycle, the card names them, it is stored with META',c2.leg.join()==='brann,sylva,gorm'&&c2.cyc===2&&c2.ch&&c2.modal==='ngplus'&&/Sylva and Gorm are now permanent recruits/.test(c2.txt)&&c2.stored.join()==='brann,sylva,gorm'||JSON.stringify(c2));
 // more later from Menu > Journey, as many as there are: no cap, no second cycle
 const j=await ev(()=>{const A=__A;A.V.modal=null;A.V.modal={type:'menu',tab:'system'};try{A.render();}catch(e){}const h=A.TW.get('vJourney')();return /data-act="pickLegacy">Add permanent recruits/.test(h);});
 chk('Menu > Journey keeps an "Add permanent recruits" button after the first choice',j===true||j);
 const d=await ev(()=>{const A=__A;A.ACT.pickLegacy();const ids=Object.keys(A.G.roster).filter(i=>!A.META.legacy.includes(i));ids.forEach(i=>A.ACT.legToggle(i));A.ACT.legConfirm();
   const n1=A.META.legacy.length;A.ACT.pickLegacy();const left=document.querySelectorAll('#modal [data-act=legToggle]').length;
   // many more: synthetic pool entries all accepted
   const all=Object.keys(A.TW.get('TPL')).filter(i=>!A.TW.get('TPL')[i].mon).slice(0,40);const before=A.META.legacy.length,c0=A.META.cycles;const added=__RO14.add(all);
   return {n1,left,added,total:A.META.legacy.length,before,cyc:A.META.cycles===c0};});
 chk(`no cap: the rest of the journey's wayfarers join at once (${d.n1} in the pool, nothing left to add: ${d.left}), and 40 more can follow (${d.total}), the cycle counted once`,d.left===0&&d.total>=30&&d.cyc||JSON.stringify(d));
 await H.browser.close();}
// ---------- 2: the cloud profile ----------
{const H=await open({w:390,h:844,pre:PRE({legacy:['tess','brann'],cycles:1})});const {ev}=H;last=H;
 const p=await ev(()=>{const A=__A,P=A.TW.get('profileOf'),AR=A.TW.get('applyRemote'),SP=A.TW.get('sameProfile');
  const mine=P(A.META);const sortedOk=mine.flags.legacy.join()==='brann,tess'&&mine.flags.cycles===1;
  AR({flags:{legacy:['sylva','tess','nope'],cycles:3}});const merged=A.META.legacy.slice(),cyc=A.META.cycles;
  const a=P({legacy:['b','a'],cycles:1,best:{},codex:{}}),b=P({legacy:['a','b'],cycles:1,best:{},codex:{}});
  const prof=P(A.META);AR(JSON.parse(JSON.stringify(prof)));const again=A.META.legacy.slice();
  return {sortedOk,merged,cyc,same:SP(a,b),stable:SP(prof,P(A.META)),again};});
 chk('profile: flags.legacy is a sorted list and flags.cycles the count; a remote list is merged as a union (unknown ids dropped), the larger cycle count wins',p.sortedOk&&p.merged.join()==='tess,brann,sylva'&&p.cyc===3||JSON.stringify(p));
 chk('profile: two devices with the same recruits in another order write the same document, and merging your own profile changes nothing',p.same&&p.stable&&p.again.join()==='tess,brann,sylva'||JSON.stringify(p));
 await H.browser.close();}
await done(last);})();
