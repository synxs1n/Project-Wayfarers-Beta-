// ===== menus14.js (menu pass 14): the hero sheet on one page, crisp tier tags, Next goals under the minimap, a mixed tavern, skills spread over the levels =====
// The owner's five notes after 0.20.0:
// 1) "character sheets felt better as 1 page, maybe have a drop down to filter for certain sections": the tabbed sheet (sheet11.js) becomes one scrolling
//    page again. sheet11 still slices the old sheet into its five panes (its xform runs first); this module's xform (registered last, so outermost) drops
//    the tab bar, shows every pane in order (Overview, Stats, Skills, Gear, Role) under a section band, and puts a compact "Show" dropdown at the top:
//    "All sections" (default) or one section alone. The state is V.sheetTab as before ('all' or a section; a missing or unknown value is All), so a test
//    or a module that sets V.sheetTab='skills' still gets the Skills section. The Prev / Next / Equip header and the skill filter chips (inside Skills)
//    are sheet11's and stay.
// 2) "epic tags are fuzzy": the EPIC / LEGENDARY / Legacy tag next to a hero name inherited the name's text shadow (a 2 px black drop and an 18 px gold glow)
//    at a fractional size (.55rem = 8.8 px, letter spacing 1.056 px), so on a phone the 900 weight letters smeared. The tags are now crisp badges: no
//    inherited shadow, integer px size, line height and letter spacing, a flat fill, grayscale antialiasing (menus3.css, "menus14").
// 3) "lock next goals under minimap": the Next goals panel (goals.js) sits under the minimap, right aligned with it, as wide as the minimap and a half
//    (at most 170 px), in every state (full, two goals, the folded chip). When the full panel would cover the hero or the area banner it shows two goals,
//    then the chip; when even the chip would, it hides until the hero or the banner moves on. It never goes to another corner. (goals.js glSpot and
//    glRender are hook points for this.)
// 4) "tavern gave me 4 water types in my first town, should always be a mix": the tavern draw (tavern2.js tvShuffle) asks tvPickOk for every seat.
//    The rules: level 3, the level 2 rules and the rest of the table can still be filled under them (a small search); level 2, no main element twice at a table of 4 or fewer (at most twice at a bigger one), no class twice, at most two heroes of one role;
//    level 1, the element rule alone; level 0, anyone (a pool too small to mix). The weights (recruitFit: what the party lacks) still decide among those.
// 5) "spread out when wayfarers learn abilities" (0.20.3), then "all abilities are learned too early (right now by lvl 36), should spread learned skills up
//    till level 45" (this pass). The 12 skill kits (skills12.js, kits12.js) keep their order (the old levels sorted: identity skills, the dual art and the
//    signature stay where they sit in it) but the levels are a schedule per kit now: the first one or two skills at the start level (as many as the kit had
//    at level 1, one or two), the next at 4, then an even walk to the LAST class skill at level 45 (M14.spread.end; the cap is 50), the early gaps a little
//    shorter (M14.spread.p, an exponent: 1 is a straight line, above 1 pulls the middle skills earlier). Rules, checked by m14Check: no gap over
//    M14.spread.gap (6), never three learns within M14.spread.win (3) levels, order kept. A 12 skill kit with two at the start comes out near
//    1,1,4,8,12,16,21,26,31,36,41,45. Limit Breaks keep their levels (LIMIT_LV, LIMIT2_LV); bond techs and Archive skills are outside the kit.
//    Old saves: a hero keeps every skill the levels before this pass gave (c.keep), once per save: the optional save field G.m14lv says which levels the
//    save has seen (none: the original table, 1: the 0.20.3 spread to level 42, 2: this one), and a save below 2 is migrated on load (unpackG).
//    The 0.20.3 levels stay on every skill as s.lvP (M14.prev) for that migration.
const M14={spread:{end:45,gap:6,win:3,p:1.5},prev:{end:42,gap:6,win:3},mix:{off:false},sh:[['all','All sections'],['overview','Overview'],['stats','Stats'],['skills','Skills'],['gear','Gear'],['role','Role']]};

// ---------- 1. the hero sheet on one page ----------
function m14Sec(){const k=V&&V.sheetTab;return M14.sh.some(x=>x[0]===k)?k:'all';}
function m14Sheet(h,id){
  if(typeof h!=='string'||h.indexOf('sh11-body')<0||typeof document==='undefined')return h;
  const c=G&&G.roster[id];if(!c)return h;
  const tp=document.createElement('template');tp.innerHTML=h;const panel=tp.content.querySelector('.panel.sh11');if(!panel)return h;
  const tabs=panel.querySelector(':scope>.sh11-tabs'),body=panel.querySelector(':scope>.sh11-body');if(!body)return h;
  const cur=m14Sec(),pts=c.pts|0;
  const opts=M14.sh.map(([k,l])=>[k,k==='stats'&&pts>0?`${l} (${pts} point${pts>1?'s':''} to spend)`:l]);
  const bar=document.createElement('div');bar.className='sh14-bar';
  bar.innerHTML=ddSel('Show','sheetSec','sh',opts,cur,'sh14-dd')+(pts>0&&cur!=='stats'&&cur!=='all'?`<button class="chip sm sh14-pts" data-act="sheetSec" data-arg="sh:stats" title="Points to spend in Stats">${pts} to spend</button>`:'');
  if(tabs)tabs.replaceWith(bar);else body.before(bar);
  body.querySelectorAll(':scope>.sh11-pane').forEach(p=>{const k=p.dataset.pane,lbl=(M14.sh.find(x=>x[0]===k)||[k,k])[1];
    p.classList.toggle('on',cur==='all'||cur===k);p.removeAttribute('role');p.setAttribute('aria-label',lbl);
    const band=document.createElement('div');band.className='sh14-sec';band.setAttribute('role','heading');band.setAttribute('aria-level','3');band.textContent=lbl;
    if(k==='stats'&&pts>0){const b=document.createElement('em');b.className='sh14-cnt';b.textContent=pts+' to spend';band.appendChild(b);}
    p.insertBefore(band,p.firstChild);
    // the list heading inside Skills says "Skill list" under the Skills band (one SKILLS per section)
    if(k==='skills')p.querySelectorAll('h4').forEach(e=>{if(/^skills$/i.test(e.textContent.trim()))e.textContent='Skill list';});});
  panel.classList.add('sh14');panel.classList.toggle('sh14-all',cur==='all');
  return tp.innerHTML;}
HOOK.xform('mChar','menus14','the hero sheet on one page with a section dropdown (outside sheet11 tabs)',function(h,id){try{return m14Sheet(h,id);}catch(e){return h;}});
ACT.sheetSec=function(a){const k=String(a||'').replace(/^sh:/,'');if(!M14.sh.some(x=>x[0]===k))return;V.sheetTab=k;render();
  try{const b=document.querySelector('#modal .sh11-body');if(b)b.scrollTop=0;}catch(e){}};

// ---------- 3. Next goals under the minimap ----------
const m14Rect=s=>{const e=document.querySelector(s);if(!e)return null;const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden')return null;const b=e.getBoundingClientRect();return b.width&&b.height?b:null;};
// the anchor: the minimap's box, else the top right corner of the canvas
function m14Anchor(){const mm=m14Rect('#mmap');if(mm)return {r:mm.right,b:mm.bottom,w:mm.width};const cv=WS.cv&&WS.cv.getBoundingClientRect();return cv&&cv.width?{r:cv.right-8,b:cv.top+8,w:112}:null;}
// the panel's spot (relative to the view) for a w x h box, right aligned under the anchor
function m14Spot(wv,w){const W=wv.getBoundingClientRect(),A=m14Anchor();if(!A||!W.width)return null;return {x:Math.round(A.r-w-W.left-wv.clientLeft),y:Math.round(A.b+6-W.top-wv.clientTop)};}
// what it must not cover: the hero and the area banner while it shows
function m14Obs(){const o=[];try{const h=glHero();if(h)o.push(h);}catch(e){}const b=document.querySelector('#wloc.on')&&m14Rect('#wloc');if(b)o.push({l:b.left-4,t:b.top-4,r:b.right+4,b:b.bottom+4});return o;}
function m14Hits(wv,at,w,h){const W=wv.getBoundingClientRect();return glHit(W.left+wv.clientLeft+at.x,W.top+wv.clientTop+at.y,w,h,m14Obs());}
// the width the CSS gives the panel (and its measuring copy): the minimap's and a half (at most 170 px), but never past the hero standing in the middle
// of the view (a narrow phone: the panel stops short of the hero's box), and never narrower than the minimap. Worked out once per view and minimap size.
function m14Width(wv,A){const cv=WS.cv&&WS.cv.getBoundingClientRect();if(!cv||!cv.width)return Math.round(Math.max(A.w,Math.min(170,A.w*1.5)));
  let half=56;try{const h=glHero();if(h)half=Math.max(24,(h.r-h.l)/2);}catch(e){}const room=A.r-(cv.left+cv.width/2+half)-6;
  return Math.round(Math.max(A.w,Math.min(170,A.w*1.5,room)));}
HOOK.before('glRender','menus14','panel width from the minimap',function(){try{const wv=document.querySelector('.wview'),A=wv&&m14Anchor();if(!A)return;
  const key=Math.round(wv.getBoundingClientRect().width)+'x'+Math.round(A.w)+'@'+Math.round(A.r);if(M14.wk===key)return;M14.wk=key;
  wv.style.setProperty('--m14w',m14Width(wv,A)+'px');wv.style.setProperty('--m14c',Math.round(A.w)+'px');GL.ms={};}catch(e){}});
// glRender tries full, two, chip and takes the first mode glSpot finds room for: here the only room is under the minimap
HOOK.xform('glSpot','menus14','the panel only goes under the minimap',function(r,wv,w,h){try{const at=m14Spot(wv,w);if(!at)return r;return m14Hits(wv,at,w,h)?null:at;}catch(e){return r;}});
// after it is drawn: the spot is always the one under the minimap (also when no mode fit); hidden while even the chip would cover the hero or banner
HOOK.after('glRender','menus14','the panel stays under the minimap',function(){try{const e=document.getElementById('glp');if(!e||e.style.display==='none')return;const wv=e.parentNode;
  const at=m14Spot(wv,e.offsetWidth);if(!at)return;if(e.style.left!==at.x+'px')e.style.left=at.x+'px';if(e.style.top!==at.y+'px')e.style.top=at.y+'px';GL.pos=at;
  e.classList.add('m14');if(m14Hits(wv,at,e.offsetWidth,e.offsetHeight))e.style.display='none';}catch(e){}});

// ---------- 4. a mixed tavern ----------
const m14Role=id=>CLASS_ROLE[TPL[id].cls]||'damage';
function m14Mix(out,id,lv){if(lv<=0)return true;const t=TPL[id];if(!t)return true;const O=out.filter(o=>TPL[o]),e=t.el[0];
  if(O.filter(o=>TPL[o].el[0]===e).length>=(TV_SLOTS<=4?1:2))return false;
  if(lv>=2){if(O.some(o=>TPL[o].cls===t.cls))return false;const r=m14Role(id);if(O.filter(o=>m14Role(o)===r).length>=2)return false;}
  return true;}
// level 3: the strict rules, and the rest of the table can still be filled under them from the heroes left (a small search: the pool is about 8)
function m14Fill(out,left,need){if(need<=0)return true;for(const id of left){if(out.includes(id)||!m14Mix(out,id,2))continue;if(m14Fill(out.concat(id),left.filter(x=>x!==id),need-1))return true;}return false;}
function m14Pick(out,id,lv,left){if(lv<3)return m14Mix(out,id,lv);if(!m14Mix(out,id,2))return false;
  const L=(left||[]).filter(x=>x!==id&&!out.includes(x)),need=Math.min(TV_SLOTS-out.length-1,L.length);return m14Fill(out.concat(id),L,need);}
HOOK.xform('tvPickOk','menus14','tavern tables mix elements, classes and roles',function(ok,out,id,lv,left){try{return ok&&(M14.mix.off||m14Pick(out,id,lv,left));}catch(e){return ok;}});

// ---------- 5. learn levels spread over the level range ----------
// the levels before this pass (0.20.3): the old levels where they fit, no gap over S.gap, never three within S.win levels, never past S.end
function m14LevelsP(old){const S=M14.prev,end=Math.min(LV_CAP-1,S.end),L=[];
  old.forEach((o,i)=>{let v=i?Math.min(o,L[i-1]+S.gap):o;if(i)v=Math.max(v,L[i-1]);if(i>=2)v=Math.max(v,L[i-2]+S.win);L.push(Math.min(v,end));});return L;}
// the schedule for a kit of old.length skills (the old levels, sorted): k at the start level (1 or 2: as many as the kit had at level 1), then 4 and an
// even walk to S.end; one pass of repairs keeps the gap and window rules whatever the rounding did
function m14Levels(old){const S=M14.spread,end=Math.min(LV_CAP-1,S.end),n=old.length,L=[];
  const k=Math.max(1,Math.min(2,old.filter(o=>o<=1).length)),m=n-k;
  for(let i=0;i<n;i++){if(i<k){L.push(1);continue;}const j=i-k,x=m>1?j/(m-1):1;L.push(Math.round(4+(end-4)*Math.pow(x,S.p||1)));}
  for(let i=1;i<n;i++){if(L[i]<L[i-1])L[i]=L[i-1];if(L[i]-L[i-1]>S.gap)L[i]=L[i-1]+S.gap;if(i>=2&&L[i]<L[i-2]+S.win)L[i]=L[i-2]+S.win;}
  L[n-1]=Math.min(end,Math.max(L[n-1],end));for(let i=n-2;i>=0&&L[n-1]-L[i]>S.gap*(n-1-i);i--)L[i]=L[n-1]-S.gap*(n-1-i);
  return L;}
// the rules a kit's levels must meet (the sim and the test use it): the first one or two at the start level, the last at the end, no long gap, never
// three within the window, no level over the cap
function m14Check(L){const S=M14.spread,bad=[];L=L.slice().sort((a,b)=>a-b);
  if(L[0]!==1||L.filter(x=>x===1).length>2)bad.push('start');if(L[L.length-1]!==Math.min(LV_CAP-1,S.end))bad.push('end');
  if(Math.max(...L.slice(1).map((x,i)=>x-L[i]))>S.gap)bad.push('gap');
  for(let i=2;i<L.length;i++)if(L[i]-L[i-2]<S.win){bad.push('window');break;}
  return bad;}
HOOK.xform('classSkills','menus14','learn levels: a schedule to level 45 per kit (order kept); the 0.20.3 levels stay as lvP',function(L,t){
  if(!L||!t||t.mon||!CLS[t.cls]||L._m14||L.length<3)return L;L._m14=1;
  try{const S=L.slice().sort((a,b)=>(a.lv12!=null?a.lv12:a.lv)-(b.lv12!=null?b.lv12:b.lv)||(a.lv0||a.lv)-(b.lv0||b.lv));
    const old=S.map(s=>s.lv12!=null?s.lv12:s.lv),lv=m14Levels(old),pv=m14LevelsP(old);
    S.forEach((s,i)=>{if(s.lv12==null)s.lv12=s.lv;s.lvP=pv[i];s.lv=lv[i];});}catch(e){}
  return L;});
// a save from before this spread: what a hero knew under the levels it had seen stays known (G.m14lv: none = the original table, 1 = the 0.20.3 spread, 2 = this one)
function m14Keep(g){if(!g||g.m14lv>=2||g.daily)return 0;let n=0;const was=g.m14lv===1?'lvP':'lv12';
  Object.keys(g.roster||{}).forEach(id=>{const c=g.roster[id],t=TPL[id];if(!c||!t||t.mon||!CLS[t.cls])return;
    classSkills(t).forEach(s=>{if(s[was]!=null&&s[was]<=c.lv&&s.lv>c.lv&&!(c.keep&&c.keep.includes(s.id))){c.keep=(c.keep||[]).concat(s.id);n++;}});});
  g.m14lv=2;return n;}
HOOK.after('unpackG','menus14','old saves keep the skills the old learn levels gave',function(r,g){try{m14Keep(g);}catch(e){}});
HOOK.after('newGame','menus14','a new journey uses the spread levels',function(){try{if(G)G.m14lv=2;}catch(e){}});

// tests
try{window.__M14={M14,levels:m14Levels,prev:m14LevelsP,check:m14Check,mix:m14Mix,keep:m14Keep,spot:m14Spot,sec:m14Sec,get tvShuffle(){return tvShuffle;},get ensureSub(){return ensureSub;},get tvPool(){return tvPool;},
  get TPL(){return TPL;},get CLASS_ROLE(){return CLASS_ROLE;},get G(){return G;},get V(){return V;},get GL(){return GL;},get glRender(){return glRender;},get glHero(){return glHero;},
  kit:t=>classSkills(t)};}catch(e){}
