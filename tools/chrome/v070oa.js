// v0.7.x onboarding (v3/onboard.js): every system explains itself once, at its real first moment.
// 1) each system's moment: the card's condition is off before the moment and on at it (28 systems, world, windows, battle, starter)
// 2) a card fires once at its moment and never again (Got it, the moment again, a reload of META)
// 3) the queue shows one card at a time, the next after a short gap; a moment that passed leaves the queue unseen
// 4) Tips off shows none (first realm hints too); Reset tips brings them back; an old save with hints off starts with tips off
// 5) More opens Guides > How it works at that system, Back returns to the window it came from; What next? lists "Not tried yet"
// 6) Settings has Tips and Reset tips; no card in a boss's first turn; none in the Daily Trial; no page errors
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v070oa.js
const {open,chk,done}=require('./pw');const {battle}=require('./v063lib');
const PRE=x=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:Object.assign({speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false,tips:true},${JSON.stringify(x||{})})}));`;
const START=()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();clearInterval(__OB.OB.tick);};
// fire one tick now (no gap), return the card on screen
const TICK=()=>{const O=__OB;O.OB.last=0;O.obTick();const d=document.getElementById('p2hint');return {cur:O.OB.cur,vis:document.querySelectorAll('#p2hint.show').length,txt:d&&d.classList.contains('show')?d.textContent:'',q:O.OB.q.slice()};};
(async()=>{
const H=await open({w:390,h:844,mobile:true,pre:PRE()});const {ev,wait,page}=H;
await ev(START);
// ---------- 1) moments: world and windows ----------
const W=await ev(()=>{const A=__A,O=__OB,G=A.G,V=A.V,out={};const T=id=>!!O.TIPMAP[id].t();
  const world=()=>{V.modal=null;V.screen='world';};world();
  const ex=Object.keys(A.TPL).filter(id=>!G.roster[id]&&!A.TPL[id].mon&&!A.TPL[id].legend&&A.TPL[id].src);
  const case_=(id,setup,undo)=>{world();const before=T(id);setup();const at=T(id);out[id]=[before,at];if(undo)undo();world();};
  case_('camp',()=>{G.inv.campkit=1;},()=>{G.inv.campkit=0;});
  case_('comp',()=>{G.tamed.push({id:'tq1',mon:'mossling',name:'Wild Mossling',bb:1});},()=>{G.tamed.pop();});
  case_('charm',()=>{G.gear.push('c_fa0');},()=>{G.gear.pop();});
  const b=O.BONDS.find(b=>!A.TPL[b.a].legend&&!A.TPL[b.b].legend);
  case_('bond',()=>{[b.a,b.b].forEach(id=>{if(!G.roster[id])A.recruit(id,true);});G.bonds=G.bonds||{};G.bonds[O.bondKey(b.a,b.b)]=1;},()=>{G.bonds[O.bondKey(b.a,b.b)]=0;});
  // the bond pair joined the party; trim back to the starting three for the next cases
  G.party=G.party.slice(0,3);
  out.reservesNow=[T('reserves')];// the bond pair now sits outside the six: that is the reserves moment
  const c=G.roster[G.party[0]];
  case_('personal',()=>{c.lv=25;c.bt=60;G.stage=1;},()=>{c.lv=3;c.bt=0;G.stage=0;A.refresh(c);});
  // windows (the condition reads V.modal; nothing is drawn here)
  const win=(id,m,setup,undo)=>{world();const before=T(id);if(setup)setup();V.modal=m;const at=T(id);V.modal=null;const off=T(id);out[id]=[before,at,off];if(undo)undo();};
  win('bounty',{type:'guild'},()=>{G.bounties.push({state:'open',name:'Test',stage:0,mon:'mossling'});},()=>{G.bounties.pop();});
  win('arena',{type:'guild'},()=>{G.cleared[0]=true;},()=>{G.cleared[0]=false;});
  win('temper',{type:'smithy'},()=>{G.gold=999999;const id=c.eq.w,f=O.forgeCost(id);if(f)Object.keys(f.m).forEach(k=>{G.mats[k]=(G.mats[k]||0)+f.m[k];});});
  win('craft',{type:'workshop'},()=>{const r=O.RECIPES.find(r=>O.recipeOpen(r)&&!['weapon','armor'].includes(r.cat));const m=O.recipeMats(r);Object.keys(m).forEach(k=>{G.mats[k]=(G.mats[k]||0)+m[k];});});
  {world();V.modal={type:'workshop'};const b0=!!O.TIPMAP.camp.t();G.stage=2;const at=!!O.TIPMAP.camp.t();V.modal=null;const off=!!O.TIPMAP.camp.t();G.stage=0;out.camp2=[b0,at,off];}// Alchemy sells Camp Supplies from the third realm
  win('echoforge',{type:'smithy'},()=>{G.won=true;},()=>{G.won=false;});
  win('legend',{type:'board'},()=>{G.quests.push({id:'lq',type:'legend',state:'open',stage:0,title:'L'});},()=>{G.quests.pop();});
  win('stick',{type:'board'},()=>{if(!G.quests.some(q=>q.type==='tamer'))G.quests.push({id:'tamer',type:'tamer',n:6,state:'open',stage:0,title:'S'});});
  win('bestparty',{type:'menu',tab:'party'});
  win('tame',{type:'result',info:{tame:{mon:'mossling',name:'Wild Mossling'}}});
  {world();const before=T('ngplus');const s0=V.screen;V.screen='starter';V.ngCycle=1;const at=T('ngplus');V.ngCycle=0;const off=T('ngplus');V.screen=s0;out.ngplus=[before,at,off];}
  world();return out;});
const expect={camp:[false,true],comp:[false,true],charm:[false,true],bond:[false,true],guild:[false,true],personal:[false,true],
  bounty:[false,true,false],arena:[false,true,false],temper:[false,true,false],craft:[false,true,false],echoforge:[false,true,false],legend:[false,true,false],stick:[false,true,false],bestparty:[false,true,false],tame:[false,true,false],ngplus:[false,true,false],camp2:[false,true,false],reservesNow:[true]};
W.guild=await ev(async()=>{const O=__OB,T=()=>!!O.TIPMAP.guild.t();const b=T();O.facInit().bonus.guild=99999;await new Promise(q=>setTimeout(q,300));const a=T();O.facInit().bonus.guild=0;await new Promise(q=>setTimeout(q,300));return [b,a];});
for(const k of Object.keys(expect))chk(`moment ${k}: off before, on at the moment${expect[k].length>2?', off when the window closes':''}`,JSON.stringify(W[k])===JSON.stringify(expect[k])||JSON.stringify(W[k]));
// ---------- 1) moments: battle ----------
await battle(H,{seed:5,heroes:5,foes:2});
const Bm=await ev(()=>{const A=__A,O=__OB,B=A.B,G=A.G,out={};const T=id=>!!O.TIPMAP[id].t();const e=B.en[0],h=B.cur;
  const c=(id,set,undo)=>{const before=T(id);set();const at=T(id);out[id]=[before,at];if(undo)undo();};
  c('weak',()=>{B.hitWeak=1;},()=>{B.hitWeak=0;});
  e.ty=[];B.en.forEach(x=>{x._ty=x.ty;x.ty=[];});c('types',()=>{e.ty=['flying'];},()=>{B.en.forEach(x=>{x.ty=x._ty;});});
  c('deliver',()=>{A.fx(e,'▲ Ranged!','stat effx up');},()=>{e.fx=[];});
  c('shield',()=>{e.maxShield=3;e.shield=3;},()=>{e.maxShield=0;e.shield=0;});
  c('primed',()=>{e.primed={el:'fire',t:2,by:'Mira'};},()=>{e.primed=null;});
  c('react',()=>{B.nDet=1;e.reactN='Melt';},()=>{B.nDet=0;e.reactN=null;});
  c('status',()=>{h.st.poison={t:2};},()=>{delete h.st.poison;});
  const lv=h.lv;c('limit',()=>{h.lv=40;h.lb=100;},()=>{h.lv=lv;h.lb=0;});
  const hp=h.hp;c('switch',()=>{h.hp=1;},()=>{h.hp=hp;});
  c('scan',()=>{e.elite=true;},()=>{e.elite=false;});
  c('summon',()=>{G.tamed.push({id:'tq2',mon:'mossling',name:'Wild Mossling',bb:1,with:h.id});},()=>{G.tamed.pop();});
  c('echo',()=>{e._n=e.name;e.name='Echo Thornwarden';},()=>{e.name=e._n;});
  // a window over the battle hides battle moments
  B.hitWeak=1;A.V.modal={type:'menu',tab:'next'};out.underMenu=T('weak');A.V.modal=null;B.hitWeak=0;
  return out;});
for(const k of ['weak','types','deliver','shield','primed','react','status','limit','switch','scan','summon','echo'])chk(`battle moment ${k}: off before, on at the moment`,JSON.stringify(Bm[k])==='[false,true]'||JSON.stringify(Bm[k]));
chk('battle moments wait while a window is open over the fight',Bm.underMenu===false||Bm.underMenu);
await ev(()=>{const A=__A;A.finishBattle('x');A.V.modal=null;A.V.screen='world';A.B=null;});
await ev(()=>{const A=__A;A.setPause&&A.setPause(300);});await ev(()=>{__A.V.modal=null;__A.V.screen='world';__A.render();});

// ---------- 2) fires once ----------
let r=await ev(()=>{__A.G.inv.campkit=1;return null;});
r=await ev(TICK);
chk(`the camp card shows at its moment: "${r.txt.slice(0,60)}"`,r.cur==='camp'&&r.vis===1&&/Camp Supplies/.test(r.txt)&&/Got it/.test(r.txt)&&/More/.test(r.txt)||JSON.stringify(r));
const fit=await ev(()=>{const d=document.getElementById('p2hint'),b=d.getBoundingClientRect(),t=d.querySelector('.obt'),lh=parseFloat(getComputedStyle(t).lineHeight)||15;
  return {w:Math.round(b.width),tw:Math.round(t.getBoundingClientRect().width),th:Math.round(t.getBoundingClientRect().height),lh,fs:getComputedStyle(t).fontSize,inView:b.left>=0&&b.top>=0&&b.right<=innerWidth&&b.bottom<=innerHeight,clip:d.scrollWidth>d.clientWidth+1||d.scrollHeight>d.clientHeight+1,lines:Math.round(t.getBoundingClientRect().height/lh)};});
chk('the card fits the screen, nothing cut, two lines of text at most',fit.inView&&!fit.clip&&fit.lines<=2||JSON.stringify(fit));
await ev(()=>{document.querySelector('#p2hint [data-act=tipOk]').click();});
r=await ev(()=>{const t=(()=>{const O=__OB;O.OB.last=0;O.obTick();return O.OB.cur;})();__A.G.inv.campkit=3;const t2=(()=>{const O=__OB;O.OB.last=0;O.obTick();return O.OB.cur;})();return {t,t2,seen:!!__OB.obM().s.camp,vis:document.querySelectorAll('#p2hint.show').length};});
chk('Got it closes it and it never fires again (same moment twice more)',!r.t&&!r.t2&&r.seen&&r.vis===0||JSON.stringify(r));
r=await ev(()=>JSON.parse(localStorage.getItem('aurelis-meta-v1')).tips);
chk('seen state is saved in META.tips (optional new field)',r&&r.s&&r.s.camp===1||JSON.stringify(r));

// ---------- 3) queue ----------
r=await ev(()=>{const A=__A,G=A.G;G.tamed.push({id:'tq3',mon:'mossling',name:'Wild Mossling',bb:1});G.gear.push('c_fa0');const a=(()=>{const O=__OB;O.OB.last=0;O.obTick();const d=document.getElementById('p2hint');return {cur:O.OB.cur,vis:document.querySelectorAll('#p2hint.show').length,q:O.OB.q.slice()};})();return a;});
chk(`two moments at once: one card (${r.cur}), the other waits (${r.q})`,r.vis===1&&r.cur==='comp'&&r.q.join()==='charm'||JSON.stringify(r));
r=await ev(()=>{__OB.obTick();return __OB.OB.cur;});chk('while a card shows, no second card replaces it',r==='comp'||r);
r=await ev(()=>{__A.ACT.tipOk();__OB.obTick();return {cur:__OB.OB.cur,vis:document.querySelectorAll('#p2hint.show').length};});
chk('after Got it the next waits a short gap',!r.cur&&r.vis===0||JSON.stringify(r));
await wait(1300);r=await ev(()=>{__OB.obTick();return {cur:__OB.OB.cur,vis:document.querySelectorAll('#p2hint.show').length};});
chk('then the queued card shows, alone',r.cur==='charm'&&r.vis===1||JSON.stringify(r));
await ev(()=>{__A.ACT.tipOk();});
// a moment that passes leaves the queue unseen and comes back next time
r=await ev(()=>{const A=__A,O=__OB,G=A.G;G.inv.campkit=0;O.OB.cur=null;
  // fake: a world moment queued behind a card, then gone before its turn
  O.OB.q=['reserves'];const keep=G.party.slice();G.party=Object.keys(G.roster).slice(0,6);O.OB.last=Date.now();O.obTick();const q1=O.OB.q.slice();G.party=keep;O.OB.last=0;return {q1,seen:!!O.obM().s.reserves};});
chk('a moment that passed leaves the queue, not marked seen',r.q1.length===0&&!r.seen||JSON.stringify(r));
await ev(()=>{const O=__OB;O.OB.last=0;O.obTick();__A.ACT.tipOk();});// the reserves card now (the bond pair waits outside the six)

// ---------- 4) Tips off, reset, old saves ----------
r=await ev(()=>{const A=__A;A.ACT.cfg('["tips",false]');A.ACT.tipsReset&&0;const O=__OB;O.obM().s={};A.G.inv.campkit=1;O.OB.last=0;O.obTick();const a=O.OB.cur;
  const h=A.META.cfg.hints;A.META.cfg.hints=true;const el=__P2.P2&&0;return {a,vis:document.querySelectorAll('#p2hint.show').length};});
chk('Tips off: no card at a moment',!r.a&&r.vis===0||JSON.stringify(r));
r=await ev(async()=>{const A=__A;A.META.cfg.hints=true;A.G.stage=0;__P2.hintFire('world');await new Promise(q=>setTimeout(q,1700));const v=document.getElementById('p2hint').classList.contains('show');A.META.cfg.hints=false;return v;});
chk('Tips off also keeps the first realm hints away',r===false||r);
r=await ev(()=>{const A=__A,O=__OB,G=A.G;G.tamed=G.tamed.filter(o=>o.id!=='tq3');G.gear=G.gear.filter(id=>id!=='c_fa0');G.party=Object.keys(G.roster).slice(0,6);O.obM().s={camp:1,comp:1};A.ACT.tipsReset();const after=Object.keys(O.obM().s).length;O.OB.last=0;O.obTick();return {after,on:O.tipsOn(),cur:O.OB.cur};});
chk('Reset tips turns tips on and the cards come back',r.after===0&&r.on&&r.cur==='camp'||JSON.stringify(r));
await ev(()=>{__A.ACT.tipOk();});
r=await ev(()=>{const c=__A.META.cfg,t=c.tips,h=c.hints;delete c.tips;c.hints=false;const a=__OB.tipsOn();c.hints=true;const b=__OB.tipsOn();c.tips=t;c.hints=h;return [a,b];});
chk('an old save with hints off starts with tips off; with hints on, tips on',r[0]===false&&r[1]===true||JSON.stringify(r));

// ---------- 5) More, Back, What next? ----------
r=await ev(async()=>{const A=__A,O=__OB;delete O.obM().s.temper;A.G.gold=999999;A.G.party.forEach(id=>{const c=A.G.roster[id];['w','a'].forEach(sl=>{const f=c.eq[sl]&&O.forgeCost(c.eq[sl]);if(f)Object.keys(f.m).forEach(k=>{A.G.mats[k]=(A.G.mats[k]||0)+f.m[k];});});});A.V.modal={type:'smithy'};A.render();O.OB.last=0;O.obTick();window.__dbg=JSON.stringify({q:O.OB.q,cur:O.OB.cur,t:O.TIPMAP.temper.t(),p2:O.P2.hint,hT:!!O.P2.hintT,seen:O.obM().s});const cur=O.OB.cur,inl=document.querySelector('#modal #p2hint.show.inl')!==null;
  document.querySelector('#p2hint [data-act=tipMore]').click();await new Promise(q=>setTimeout(q,150));const m=A.V.modal;const at=document.querySelector('#obg-'+cur);
  const res={dbg:window.__dbg,cur,inl,tab:m&&m.tab,open:!!(at&&at.open),sub:[...document.querySelectorAll('#modal .msub .chip')].map(x=>x.textContent.trim())};
  A.ACT.closeModal();res.back=A.V.modal&&A.V.modal.type;A.V.modal=null;A.render();return res;});
chk(`a card in a shop sits inside the shop window (${r.cur})`,r.inl===true||JSON.stringify(r));
chk('More opens Guides > How it works at that system',r.tab==='sysg'&&r.open&&r.sub.includes('How it works')||JSON.stringify(r));
chk('closing it returns to the shop it came from',r.back==='smithy'||JSON.stringify(r));
r=await ev(()=>{const A=__A,G=A.G;G.inv.campkit=3;G.camp=null;A.V.modal={type:'menu',tab:'next'};A.render();const h=document.getElementById('modal').innerHTML;A.V.modal=null;A.render();return {camp:/You have 3 Camp Supplies: Make camp from the Party tab/.test(h),sec:/Not tried yet/.test(h)};});
chk('What next? lists a system met but never used: "You have 3 Camp Supplies: Make camp from the Party tab"',r.camp&&r.sec||JSON.stringify(r));
r=await ev(()=>{const A=__A;A.G.camp={b:'whet',left:3,at:1};A.V.modal={type:'menu',tab:'next'};A.render();const h=document.getElementById('modal').innerHTML;A.V.modal=null;A.G.camp=null;A.render();return /Camp Supplies: Make camp/.test(h);});
chk('once camp has been made, that line goes',r===false||r);

// ---------- 6) Settings, boss first turn, Daily Trial ----------
r=await ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'settings'};A.render();const h=document.getElementById('modal').innerHTML;A.V.modal=null;A.render();return {tips:/<b>Tips<\/b>/.test(h),reset:/data-act="tipsReset"/.test(h),hints:/<b>Hints<\/b>/.test(h)};});
chk('Settings has Tips (on by default) and Reset tips, next to Hints',r.tips&&r.reset&&r.hints||JSON.stringify(r));
await battle(H,{seed:9,heroes:3,boss:true,stage:1});
r=await ev(()=>{const A=__A,O=__OB,B=A.B,e=B.en.find(x=>x.boss);delete O.obM().s.primed;e.primed={el:'fire',t:2};e.turns=0;O.OB.last=0;O.obTick();const a={hold:O.obBossHold(),cur:O.OB.cur};
  e.turns=1;B.pturns=2;O.OB.last=0;O.obTick();a.after=O.OB.cur;A.ACT.tipOk();return a;});
chk('no card during a boss\'s first turn; it shows once the boss has acted',r.hold&&!r.cur&&r.after&&r.after!=='none'||JSON.stringify(r));
await ev(()=>{const A=__A;A.finishBattle('x');A.V.modal=null;A.V.screen='world';});
r=await ev(async()=>{const A=__A,O=__OB;O.obM().s={};A.ACT.dailyGo();for(let i=0;i<100&&!(A.B&&A.B.mode==='cmd');i++)await new Promise(q=>setTimeout(q,60));
  const B=A.B;if(!B)return 'no trial';B.hitWeak=1;B.en[0].primed={el:'fire',t:2};B.en[0].maxShield=3;O.OB.last=0;O.obTick();return {daily:!!A.G.daily,cur:O.OB.cur,q:O.OB.q.length,vis:document.querySelectorAll('#p2hint.show').length};});
chk('the Daily Trial shows no cards',r.daily&&!r.cur&&r.q===0&&r.vis===0||JSON.stringify(r));
await done(H);})();
