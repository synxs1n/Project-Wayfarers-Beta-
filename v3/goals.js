// ===== goals.js (v0.9.5): "Next goals": a small list in the world that leads into the story and the deeper systems =====
// Two to four goals at a time: the next story step ("Find the Scourge's lair in Verdane") and up to three system goals picked by
// progress and by what the player has not tried yet ("Set off 3 reactions", "Temper a piece of gear", "Tame a creature", "Make camp",
// "Win a fight without auto"). A goal done pays once (gold by realm, a little XP for the party, sometimes an item) with a toast.
// Shown as a compact panel in the world view (collapsible; it moves to a free corner and never sits over the hero, the stick, the
// A/B buttons, the minimap or the area banner; when no corner is free it shrinks to a small chip) and in Guides > What next?.
// Deterministic: the order of GOALS decides, no random calls. Not in the Daily Trial. Tunables: NUDGE.goals (config.js).
// New optional save field G.goals = {a:[shown ids], d:{id:1 done}, c:{counters}, b:{id: counter when shown}}. A save without it
// (an older journey) marks every goal it has already met as done, silently, so nothing is paid twice or out of the blue.
const GL={el:null,sig:'',tick:null,flash:0};
function glOn(){return !!(typeof NUDGE!=='undefined'&&NUDGE.on&&NUDGE.goals&&NUDGE.goals.on&&typeof G!=='undefined'&&G&&G.run&&!G.daily);}
function glS(){let st=G.goals;if(!st||typeof st!=='object'){st=G.goals={a:[],d:{},c:{},b:{}};glSweep(st);}
  st.a=Array.isArray(st.a)?st.a:[];st.d=st.d||{};st.c=st.c||{};st.b=st.b||{};return st;}
const glC=(k)=>((G.goals&&G.goals.c&&G.goals.c[k])|0);
function glAdd(k,n){if(!glOn()||!(n>0))return;const st=glS();st.c[k]=(st.c[k]|0)+n;}
const glBattles=()=>((G.stats&&G.stats.battles)|0);
const glKnows=role=>partyOf().some(c=>{try{return known(c).some(s=>s.role===role);}catch(e){return false;}});
const glPc=s=>typeof pcUnlocked!=='function'||pcUnlocked(s);// v0.9.6 depth unlocks by realm (pacing.js): no goal points at a system that is not open yet
const glTop=()=>Math.max(1,...partyOf().map(c=>c.lv|0));
// counter goals: done when the counter grew by n since the goal was shown
const glCnt=(k,n)=>({k,n,done:st=>glC(k)-((st.b[k+'@'])|0)>=n,prog:st=>Math.min(n,glC(k)-((st.b[k+'@'])|0))});
// ----- the system goals, in the order they are offered -----
const GOALS=[
 {id:'weak',t:'Hit a foe on its weak spot',sub:()=>'Aim where the target tag says Weak: the hit deals more and cracks shields.',ok:()=>true,...glCnt('weak',1)},
 {id:'manual',t:'Win a fight without auto',sub:()=>`A fight you play yourself pays +${manualBonusPct()}% XP and gold.`,ok:()=>glC('autoWin')>=1,...glCnt('manWin',1)},
 {id:'react',t:'Set off 3 reactions',sub:()=>'Prime a foe with one element, then hit it with a Detonator of another.',ok:()=>glPc('reactions')&&glKnows('primer')&&glKnows('det'),...glCnt('react',3),item:'ether'},
 {id:'scan',t:'Scan a foe in battle',sub:()=>'Scan shows its stats and quirk, and opens auto against that kind of foe.',ok:()=>glBattles()>=2,...glCnt('scan',1)},
 {id:'quest',t:'Take a quest from the Notice Board',sub:()=>'Notice Board > Quests, in town: gold and items for hunts and errands.',ok:()=>(G.quests||[]).length>0,done:()=>(G.quests||[]).some(q=>q.state&&q.state!=='open')},
 {id:'switch',t:'Switch in a Rearguard hero',sub:()=>'On a Vanguard hero\'s turn, Switch brings a fresh hero in who acts at once.',ok:()=>(G.party||[]).length>3,...glCnt('swap',1)},
 {id:'brk',t:"Break a foe's shield",sub:()=>'Hit a shielded elite or boss on its weakness, or with a reaction.',ok:()=>(G.stage|0)>=1||glTop()>=7,...glCnt('brk',1),item:'remedy'},
 {id:'tame',t:'Tame a creature',sub:()=>'Beat a bounty beast, then choose Tame it on the rewards screen.',ok:()=>glPc('taming')&&(G.stage|0)>=1||glTop()>=8,
  done:()=>(G.tamed||[]).length>0||Object.keys(G.tameLog||{}).length>0,item:'potion'},
 {id:'bounty',t:'Beat a bounty',sub:()=>'Notice Board > Bounties: accept one, then find the beast on the map.',ok:()=>glTop()>=5&&(G.bounties||[]).some(b=>b.state==='open'||b.state==='active'),...glCnt('bounty',1)},
 {id:'guard',t:'Guard against a big hit',sub:()=>'When a foe winds up or gathers power, Guard the hero it aims at.',ok:()=>glC('tele')>=1,...glCnt('guard',1),item:'potion'},
 {id:'surge',t:'Reach a Momentum Surge',sub:()=>'Mix different moves: the Momentum bar fills and your heroes surge.',ok:()=>glBattles()>=8,...glCnt('surge',1)},
 {id:'comp',t:'Pair a companion with a hero',sub:()=>'Party > Companions: a stat bonus and a Summon in battle.',ok:()=>glPc('taming')&&(G.tamed||[]).length>0,done:()=>(G.tamed||[]).some(o=>o.with)},
 {id:'temper',t:'Temper a piece of gear',sub:()=>'Smithy > Tempering: +1 for parts and gold.',ok:()=>glPc('gear')&&(typeof pcTemperOpen!=='function'||pcTemperOpen()),done:()=>typeof pcHasTempered==='function'&&pcHasTempered()},
 {id:'guildm',t:'Take on a guild mission',sub:()=>'Notice Board > Guilds: missions raise your rank and its perks sooner.',ok:()=>glPc('guilds')&&(typeof pcGuildOpen==='function'?pcGuildOpen():typeof pcFirstBoss!=='function'||pcFirstBoss()),
  done:()=>{try{const f=facInit();return Object.keys(f.acc||{}).length+Object.keys(f.done||{}).length>0;}catch(e){return false;}}},
 {id:'camp',t:'Make camp in the field',sub:()=>'Camp Supplies from Alchemy; Make camp from the Party tab.',ok:()=>glPc('camp')&&(G.stage|0)>=(typeof CAMP!=='undefined'?CAMP.fromStage:2),done:()=>glC('camp')>0,item:'campkit'}];
const GLMAP={};GOALS.forEach(g=>{GLMAP[g.id]=g;});
// ----- the story goal: head out, find the lair, beat its Scourge (the Calamity in the last realm) -----
function glStoryDef(s,k){const Z=ZS(s),foe=s<4?'Scourge':'Calamity';
  if(k==='a')return {id:'st'+s+'a',t:`Head out into ${Z.n}`,sub:'Leave town by its gate and explore.'};
  if(k==='b')return {id:'st'+s+'b',t:`Find the ${foe}'s lair in ${Z.n}`,sub:`The ${Z.dungeon}: its entrance hides off the road. Look for glowing stairs.`};
  return {id:'st'+s+'c',t:`Defeat the ${foe} in the ${Z.dungeon}`,sub:'Check readiness in Guides > What next? first.'};}
function glStory(){const s=G.stage|0;if(G.won||s>4)return null;const been=G.been||{},fk=(typeof worldV2==='function'&&worldV2()&&!worldV3()?'g':'f')+s,cl=!!(G.cleared||[])[s];
  return glStoryDef(s,!been[fk]&&!been['d'+s]&&!cl?'a':!been['d'+s]&&!cl?'b':'c');}
function glStoryDone(id){const m=/^st(\d)([abc])$/.exec(id);if(!m)return false;const s=+m[1],k=m[2],been=G.been||{};
  if((G.cleared||[])[s]||(G.stage|0)>s||G.won)return true;if(k==='c')return false;if(k==='b')return !!been['d'+s];
  const fk=(typeof worldV2==='function'&&worldV2()&&!worldV3()?'g':'f')+s;return !!(been[fk]||been['d'+s]);}
function glDef(id){if(GLMAP[id])return GLMAP[id];const m=/^st(\d)([abc])$/.exec(id);if(!m)return null;try{return glStoryDef(+m[1],m[2]);}catch(e){return {id,t:'Story step',sub:''};}}
function glDone(id,st){try{if(/^st/.test(id))return glStoryDone(id);const g=GLMAP[id];return !!(g&&g.done(st));}catch(e){return false;}}
// an older journey: everything already met counts as done, without pay
function glSweep(st){try{GOALS.forEach(g=>{if(!g.k&&glDone(g.id,st))st.d[g.id]=1;});}catch(e){}}
// ----- rewards -----
function glReward(id){const s=Math.min(4,G.stage|0),N=NUDGE.goals,g=GLMAP[id]||{};return {gold:N.gold[s]||N.gold[N.gold.length-1]||0,xp:N.xp||0,item:g.item&&ITEMS[g.item]?g.item:null};}
function glRewardText(R){return `+${fmt(R.gold)} gold, XP${R.item?', '+ITEMS[R.item].n:''}`;}
function glPay(id){const st=glS();if(st.d[id])return null;st.d[id]=1;const R=glReward(id);
  G.gold+=R.gold;partyOf().forEach(c=>{try{addXp(c,Math.max(1,Math.round(need(c.lv)*R.xp)));}catch(e){}});
  if(R.item)G.inv[R.item]=Math.min(invCap(),(G.inv[R.item]||0)+1);
  try{const L=learnScanAll();if(L.length&&typeof lnQueue==='function')lnQueue(L);}catch(e){}
  return R;}
// ----- the shown list: finish what is done, then fill up to NUDGE.goals.max -----
function glCheck(pay){if(!glOn())return [];const st=glS(),paid=[];
  st.a=st.a.filter(id=>{if(st.d[id])return false;if(!glDone(id,st))return true;if(pay!==false){const d=glDef(id),R=glPay(id);if(R)paid.push([d?d.t:id,R]);}else st.d[id]=1;return false;});
  const S=glStory();if(S&&!st.a.some(id=>/^st/.test(id))){if(st.d[S.id]||glDone(S.id,st))st.d[S.id]=st.d[S.id]||1;else st.a.unshift(S.id);}
  const max=Math.max(2,NUDGE.goals.max|0);
  for(const g of GOALS){if(st.a.length>=max)break;if(st.d[g.id]||st.a.includes(g.id))continue;let ok=false;try{ok=g.ok();}catch(e){}if(!ok)continue;
    if(!g.k&&glDone(g.id,st)){st.d[g.id]=1;continue;}// already done before it was ever shown: nothing to lead into
    if(g.k)st.b[g.k+'@']=glC(g.k);st.a.push(g.id);}
  if(paid.length){GL.flash=Date.now();const t=paid.map(([n,R])=>`Goal done: ${n}. ${glRewardText(R)}.`).join(' ');try{toast(t);}catch(e){}try{sfx('chest');}catch(e){}}
  return paid;}
function glList(){if(!glOn())return [];const st=glS();return st.a.map(id=>{const d=glDef(id);if(!d)return null;const g=GLMAP[id];let p='';try{if(g&&g.k&&g.n>1)p=`${g.prog(st)}/${g.n}`;}catch(e){}
  return {id,t:d.t,sub:typeof d.sub==='function'?d.sub():d.sub,p,R:glReward(id),story:/^st/.test(id)};}).filter(Boolean);}
// ----- counters from battles and actions -----
HOOK.after('win','goals','goal counters from the fight',function(){try{if(glOn()&&B&&B.result&&!B.result.glCount&&B.spec&&B.spec.kind!=='daily'){B.result.glCount=1;const z=B.nz||{};
    glAdd('react',z.react|0);glAdd('brk',z.brk|0);glAdd('guard',z.guard|0);glAdd('surge',z.surge?1:0);glAdd('tele',z.tele|0);glAdd('weak',B.hitWeak?1:0);glAdd('swap',(B.b4swN|0)>0?1:0);
    glAdd(autoRewardMul()===1?'manWin':'autoWin',1);if(B.spec.kind==='elite'&&B.spec.bounty&&!B.spec.bounty.personal)glAdd('bounty',1);}}catch(e){}});
{const sc0=scan;scan=function(){const r=sc0.apply(this,arguments);try{if(B&&B.spec&&B.spec.kind!=='daily')glAdd('scan',1);}catch(e){}return r;};}
if(typeof campMake==='function'){const cm0=campMake;campMake=function(){const r=cm0.apply(this,arguments);try{if(r&&typeof r!=='string')glAdd('camp',1);}catch(e){}return r;};}
HOOK.after('finishBattle','goals','Next goals panel',function(){try{glCheck();glRender();}catch(e){}});
HOOK.after('newGame','goals','goals start empty',function(){try{if(G&&!G.daily)G.goals={a:[],d:{},c:{},b:{}};}catch(e){}});

// ----- the panel in the world view -----
function glMin(){try{return !!(META.cfg&&META.cfg.goalsMin);}catch(e){return false;}}
ACT.goalsT=function(){META.cfg.goalsMin=!glMin();saveMeta();GL.sig='';glRender();};
ACT.goalsMore=function(){V.modal={type:'menu',tab:'next'};render();};
const glR=e=>{if(!e)return null;const b=e.getBoundingClientRect();return b.width&&b.height?{l:b.left,t:b.top,r:b.right,b:b.bottom}:null;};
// the hero on screen: the HD-2D box when that view is live, else the 2D camera; padded, and never smaller than a tile or two
function glHero(){const cv=WS.cv,R=cv&&cv.getBoundingClientRect();if(!R||!R.width)return null;let box=null;
  try{if(typeof HD!=='undefined'&&HD.live&&typeof HW!=='undefined'&&HW.b&&(HW.b[2]-HW.b[0])>0){const B_=HW.b,x0=(B_[0]+1)/2*R.width,x1=(B_[2]+1)/2*R.width,y1=(1-B_[1])/2*R.height,y0=(1-B_[3])/2*R.height;
    box={l:R.left+Math.min(x0,x1),r:R.left+Math.max(x0,x1),t:R.top+Math.min(y0,y1),b:R.top+Math.max(y0,y1)};}}catch(e){}
  if(!box&&WS.cam&&WS.vw){const k=R.width/WS.vw,x=(WS.px+8-WS.cam.x)*k,y=(WS.py+8-WS.cam.y)*k;box={l:R.left+x-8*k,r:R.left+x+8*k,t:R.top+y-18*k,b:R.top+y+9*k};}
  if(!box)return null;const p=Math.max(14,(R.width/(WS.vw||R.width))*12);return {l:box.l-p,r:box.r+p,t:box.t-p*1.4,b:box.b+p};}
function glObstacles(){const out=[],add=(e,pad)=>{const r=glR(e);if(r)out.push({l:r.l-pad,t:r.t-pad,r:r.r+pad,b:r.b+pad});};
  const h=glHero();if(h)out.push(h);
  ['#joy','.pad .abtns','#mmap','#wloc','#wdlg .dlg','#wkw'].forEach(s=>document.querySelectorAll(s).forEach(e=>{if(getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'&&(s!=='#wloc'||e.classList.contains('on')||e.textContent.trim()))add(e,6);}));
  const hn=document.getElementById('p2hint');if(hn&&hn.classList.contains('show')&&!hn.classList.contains('inl'))add(hn,6);
  return out;}
const glHit=(x,y,w,h,obs)=>obs.some(o=>x<o.r&&x+w>o.l&&y<o.b&&y+h>o.t);
function glHtml(L,mode,auto){const n=L.length;
  if(mode==='chip')return `<button class="glhead" data-act="${auto?'goalsMore':'goalsT'}" aria-expanded="false" aria-label="Show next goals"><b>Goals</b><span class="gln">${n}</span><i>▸</i></button>`;
  const show=mode==='two'?L.slice(0,2):L;
  return `<button class="glhead" data-act="goalsT" aria-expanded="true" aria-label="Hide next goals"><b>Next goals</b><i>▾</i></button><ul class="gll">${show.map(g=>`<li class="${g.story?'st':''}" data-goal="${g.id}" title="${esc(g.sub||'')}"><span>${esc(g.t)}</span>${g.p?`<em>${g.p}</em>`:''}</li>`).join('')}</ul>${show.length<n?`<button class="glmore" data-act="goalsMore">+${n-show.length} more</button>`:''}`;}
function glEl(){const wv=document.querySelector('.wview');if(!wv)return null;let e=GL.el;if(!e||!e.isConnected||e.parentNode!==wv){e=document.getElementById('glp');if(!e){e=document.createElement('div');e.id='glp';e.setAttribute('role','region');e.setAttribute('aria-label','Next goals');}wv.appendChild(e);GL.el=e;GL.sig='';}return e;}
// the size of the panel in each mode, measured once per content in a hidden copy (so the panel itself is not rewritten to try modes)
function glSize(wv,L,mode){const key=mode+'|'+L.map(g=>g.id+g.p).join(',')+'|'+Math.round(wv.getBoundingClientRect().width);GL.ms=GL.ms||{};if(GL.ms[key])return GL.ms[key];
  let m=document.getElementById('glpm');if(!m){m=document.createElement('div');m.id='glpm';m.setAttribute('aria-hidden','true');}if(m.parentNode!==wv)wv.appendChild(m);
  m.className='gl '+mode;m.innerHTML=glHtml(L,mode);const s={w:m.offsetWidth,h:m.offsetHeight};m.innerHTML='';
  if(Object.keys(GL.ms).length>40)GL.ms={};GL.ms[key]=s;return s;}
// a free spot for a w x h box in the view: where it is now if still free, then the corners (bottom first: the save note lives top left), then along the sides
function glSpot(wv,w,h,obs,cur){const W=wv.getBoundingClientRect(),cv=WS.cv&&WS.cv.getBoundingClientRect();if(!W.width)return null;
  const A=cv&&cv.width?cv:W,m=8,xs=[A.left+m,A.right-m-w],ys=[A.bottom-m-h,A.top+m+34,A.top+m];
  const cands=[];if(cur)cands.push([W.left+cur.x,W.top+cur.y]);
  [[0,0],[0,1],[1,0],[1,1],[0,2],[1,2]].forEach(([i,j])=>cands.push([xs[i],ys[j]]));
  for(let y=A.top+m;y+h<=A.bottom-m;y+=12){cands.push([xs[0],y]);cands.push([xs[1],y]);}
  for(const [x,y] of cands){if(x<A.left-0.5||y<A.top-0.5||x+w>A.right+0.5||y+h>A.bottom+0.5)continue;if(!glHit(x,y,w,h,obs))return {x:Math.round(x-W.left),y:Math.round(y-W.top)};}
  return null;}
function glRender(){try{const e0=document.getElementById('glp');
  const off=!glOn()||V.screen!=='world'||!!B||!!V.modal||!!WS.dlg||!WS.cv;
  if(off){if(e0)e0.style.display='none';return;}
  const L=glList();const e=glEl();if(!e)return;if(!L.length){e.style.display='none';return;}e.style.display='';
  const wv=e.parentNode,obs=glObstacles(),user=glMin(),want=user?['chip']:['full','two','chip'];
  const cur=GL.pos&&GL.sig&&e.style.left?GL.pos:null;let mode=want[want.length-1],at=null;
  for(const md of want){const s=glSize(wv,L,md);const sameMode=GL.sig&&GL.sig.split('|')[0]===md;at=glSpot(wv,s.w,s.h,obs,sameMode?cur:null);if(at){mode=md;break;}}
  if(!at)at={x:8,y:42};// nowhere free (a tiny view): the chip under the save note, top left
  const sig=mode+'|'+(mode==='chip'&&!user?'a':'')+'|'+L.map(g=>g.id+g.p).join(',');
  if(GL.sig!==sig){e.innerHTML=glHtml(L,mode,mode==='chip'&&!user);GL.sig=sig;}
  e.className='gl '+mode+(Date.now()-GL.flash<3000?' flash':'');
  e.style.left=at.x+'px';e.style.top=at.y+'px';GL.pos=at;}catch(err){}}
HOOK.after('render','goals','Next goals panel',function(){try{if(V.screen==='world'&&!B){glCheck();}glRender();}catch(e){}});
GL.tick=setInterval(()=>{try{if(V.screen==='world'&&!B)glRender();}catch(e){}},350);
// the corner save note keeps clear of the panel
if(typeof p5Avoid==='function'){const pa2=p5Avoid;p5Avoid=function(){const r=pa2.apply(this,arguments);try{const d=document.getElementById('glp');if(d&&d.style.display!=='none'){const b=d.getBoundingClientRect();if(b.width)r.push(b);}}catch(e){}return r;};}

// ----- Guides > What next?: the same goals with their rewards -----
{const vn0=vNext;vNext=function(){let h=vn0.apply(this,arguments);try{if(glOn()){glCheck();const L=glList();if(L.length){
  const sec=`<h4>Next goals</h4><div class="rows compact glnext">${L.map(g=>`<div class="row nxt"><span class="nxi">${g.story?'★':'•'}</span><div class="grow"><b>${esc(g.t)}${g.p?` <em class="glp">${g.p}</em>`:''}</b><small>${esc(g.sub||'')} Reward: ${esc(glRewardText(g.R))}.</small></div></div>`).join('')}</div>`;
  h=sec+h;}}}catch(e){}return h;};}

try{const css=document.createElement('style');css.textContent=`
.gl{position:absolute;z-index:4;max-width:min(250px,48%);min-width:0;background:rgba(14,12,26,.82);border:1px solid rgba(217,180,106,.6);border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,.45);color:#f4ead2;font-size:11.5px;line-height:1.25;padding:4px 7px 5px;pointer-events:auto}
.gl.chip{padding:2px 4px}.gl .glhead{all:unset;cursor:pointer;display:flex;gap:6px;align-items:center;min-height:26px;width:100%;box-sizing:border-box;font-size:11.5px}.gl .glhead b{color:#ffd04a;letter-spacing:.03em}
.gl .glhead i{font-style:normal;margin-left:auto;opacity:.8}.gl .gln{background:#ffd04a;color:#1a1424;border-radius:9px;padding:0 6px;font-weight:800;font-size:10.5px}
.gl .gll{list-style:none;margin:2px 0 0;padding:0;display:grid;gap:3px}.gl .gll li{display:flex;gap:6px;align-items:baseline;padding-left:10px;position:relative;overflow-wrap:anywhere}
.gl .gll li:before{content:'•';position:absolute;left:0;color:#ffd04a}.gl .gll li.st:before{content:'★'}.gl .gll li span{flex:1 1 auto;min-width:0}.gl .gll li em{font-style:normal;color:#9ad0ff;font-weight:700;flex:0 0 auto}
.gl .glmore{all:unset;cursor:pointer;font-size:10.5px;color:#9ad0ff;margin-top:2px;display:block}
.gl.flash{animation:glf 1.2s ease 2}@keyframes glf{50%{box-shadow:0 0 14px rgba(255,208,74,.8)}}@media (prefers-reduced-motion:reduce){.gl.flash{animation:none}}
.glnext em.glp{font-style:normal;color:#9ad0ff}#glpm{visibility:hidden;left:0;top:0;pointer-events:none;z-index:-1}`;document.head.appendChild(css);}catch(e){}
try{window.__GL={GL,GOALS,glS,glCheck,glList,glRender,glSpot,glHero,glObstacles,glStory,glReward,glOn,get G(){return G},get V(){return V},get B(){return B},get WS(){return WS},get META(){return META}};}catch(e){}
// test hook for the other v0.9.5 nudges (separate from __A, so no getter there is touched)
try{window.__NZ={get NUDGE(){return NUDGE},get AUTO_REW(){return AUTO_REW},autoReason:()=>autoReason(),autoOkMap:()=>autoOkMap(),autoTypeLeft:n=>autoTypeLeft(n),manualBonusPct:()=>manualBonusPct(),
  autoRewardMul:()=>autoRewardMul(),scan:t=>scan(t),doReaction:(a,t,el)=>doReaction(a,t,el),chipShield:(t,n)=>chipShield(t,n),makeEnemy:(m,l,o)=>makeEnemy(m,l,o),packG:()=>packG(),unpackG:o=>unpackG(o),
  obEval:t=>obEval(t),obOpened:()=>obOpened(),obPrimedTip:e=>obPrimedTip(e),get toast(){const t=document.getElementById('toast');return t?t.textContent:'';}};}catch(e){}
