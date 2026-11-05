// =================== UI: v4 additions ===================
function townS(){return WS.m&&WS.m.kind==='town'?WS.m.s:-1;}
const RELIT_STOCK=[['c_str',420],['c_int',420],['c_vit',420],['c_spi',420],['c_agi',420],['c_dex',480],['c_luk',480],['elixir',650],['plume',220]];
function vPersonal(){
  const list=Object.values(G.roster).filter(c=>!TPL[c.id].mon).sort((a,b)=>b.lv-a.lv);
  return `<p>Every wayfarer has unfinished business. At level ${PERSONAL_LV}, once you have reached the second town, a hero's personal quest opens: accept it and a rival roams the current realm's field. Bring that hero in your six to face it and win their signature item: a weapon, armor or accessory bound to that hero, which changes how they look.</p>
  <div class="rows">${list.map(c=>{const q=G.personal[c.id],t=TPL[c.id],w=gearOf(sigGid(c.id))||gearOf('u_'+c.id);
    const st=!personalEligible(c)&&(!q||q.state==='open')?`<span class="m">${personalLockText(c)}</span>`:!q||q.state==='open'?`<button class="btn sm gold" data-act="personal" data-arg="${c.id}">Accept</button>`:q.state==='active'?'<span class="m">Rival roaming</span>':'<span class="m up">Done</span>';
    return `<div class="row ${personalEligible(c)||(q&&q.state!=='open')?'':'lock'}">${port(c.id)}<div class="grow"><b>${esc(t.n)}: ${esc(w.n)}</b><small>${q&&q.text?esc(q.text)+(q.state==='active'?` It prowls ${esc(ZS(q.stage).n)}.`:''):esc(gearDesc(w))}</small></div>${st}</div>`;}).join('')}</div>`;
}
function mSlots(m){
  const rows=[0,1,2].map(s=>{const o=slotSummary(s);
    const info=o?`Stage ${o.stage+1}, ${o.cleared} of 5 beacons relit${o.cycle?', NG+'+o.cycle:''}. Party level ${o.lv}, ${fmt(o.gold)} gold, ${o.battles} battles.${o.savedAt?' Saved '+new Date(o.savedAt).toLocaleString():''}`:'Empty';
    const btn=m.mode==='load'?`<button class="btn sm gold" data-act="slotLoad" data-arg="${s}" ${o?'':'disabled'}>Load</button>`:`<button class="btn sm ${o?'':'gold'}" data-act="slotNew" data-arg="${s}">${o?'Overwrite':'Start here'}</button>`;
    return `<div class="row"><div class="grow"><b>Slot ${s+1}${(META.slot||0)===s?' <span class="cyc">last used</span>':''}</b><small>${info}</small>${o?`<div class="els">${o.party.slice(0,6).map(id=>TPL[id]?port(id,'sm'):'').join('')}</div>`:''}</div>${btn}${o?`<button class="btn sm" data-act="slotDel" data-arg="${s}" aria-label="Delete slot ${s+1}">✕</button>`:''}</div>`;}).join('');
  return box(m.mode==='load'?'Continue a journey':'Choose a save slot',`<div class="rows">${rows}</div>`,m.mode==='new'?'<button class="btn" data-act="toTitle">Back</button>':'');
}
function mExport(){const code=exportSave();return box('Export save',`<p class="note">Copy this code somewhere safe. Paste it into Import save on any device to carry this journey over.</p><textarea id="expta" readonly rows="6">${esc(code)}</textarea>`,'<button class="btn gold" data-act="copyExport">Copy</button><button class="btn" data-act="closeModal">Close</button>');}
function mImport(){return box('Import save',`<p class="note">Paste a save code. It loads into slot ${(META.slot||0)+1}${slotSummary(META.slot||0)?' and replaces what is there':''}.</p><textarea id="impta" rows="6" placeholder="AWSAVE1...."></textarea>`,'<button class="btn gold" data-act="doImport">Import</button><button class="btn" data-act="closeModal">Cancel</button>');}
// ----- daily trial -----
function mDailyIntro(){
  const P=dailyPlan(dailyKey()),W=WEATHER[P.weather],gd=guardianDef(P.waves[3].key),el=MON[P.waves[2].bounty.mon];
  return box('Daily Trial',`<p>Everyone gets the same six heroes, the same weather and the same four fights today. Fewer turns, fewer knockouts and more HP left means a higher score. Your journey save is untouched.</p>
    <h4>${esc(P.key)}</h4><div class="els">${P.ids.map(id=>port(id,'sm')).join('')}</div>
    <div class="rows"><div class="row"><div><b>${W.i} ${esc(W.n)}</b><small>${esc(W.d)}</small></div></div><div class="row"><div><b>Waves</b><small>Two packs of mixed foes, ${esc(P.waves[2].bounty.name)}, then the Echo of ${esc(gd.n)}.</small></div></div></div>
    <h4>Today's board</h4>${vBoard()}`,'<button class="btn" data-act="closeModal">Not now</button><button class="btn gold" data-act="dailyGo">Start the trial</button>',true);
}
function mDailyEnd(m){
  return box(m.won?'Trial complete':'Trial over',`<p class="story">Score <b class="big">${fmt(m.score)}</b></p><p class="note">${m.turns} hero turns, ${m.kos} knockouts.${m.won?'':' You fell before the end; cleared waves still count.'}</p>
    <h4>Today's board</h4>${vBoard()}${V.lbMsg?`<p class="note">${esc(V.lbMsg)}</p>`:''}`,`<button class="btn gold" data-act="postScore" ${V.lbPosted?'disabled':''}>${V.lbPosted?'Posted':'Post score'}</button><button class="btn" data-act="dailyDone">Done</button>`,true);
}
function vBoard(){
  const L=V.lb;if(!L||L.key!==dailyKey()){lbLoad();return '<p class="note">Loading the board...</p>';}
  if(L.status==='off')return '<p class="note">The shared leaderboard needs the published page on claude.ai. Scores still work here, they just are not posted.</p>';
  if(!L.rows.length)return '<p class="note">Nobody has posted today yet. Be first.</p>';
  return `<ol class="board">${L.rows.map((r,i)=>`<li class="${r.me?'me':''}"><b>${i+1}.</b> <span class="lbn" data-uid="${esc(r.id)}">${esc(r.name)}</span><em>${fmt(r.score)}</em><small>${r.turns} turns${r.kos?', '+r.kos+' KO':''}</small></li>`).join('')}</ol>`;
}
let LB_BUSY=false;
async function capOf(name){try{return typeof window.claude!=='undefined'&&window.claude.use?await window.claude.use(name):null;}catch(e){return null;}}
async function lbLoad(){
  if(LB_BUSY)return;LB_BUSY=true;const key=dailyKey();
  try{
    const db=await capOf('db');if(!db){V.lb={key,status:'off',rows:[]};return;}
    const qs=await db.collection('scores').get();
    const rows=qs.docs.map(d=>({id:d.id,r:((d.data()||{}).days||{})[key]})).filter(x=>x.r&&typeof x.r.score==='number').sort((a,b)=>b.r.score-a.r.score).slice(0,15);
    const user=await capOf('user');let ps={},me=null;
    if(user){try{me=await user.id();}catch(e){}try{if(rows.length)ps=await user.profiles(rows.map(x=>x.id));}catch(e){}}
    V.lb={key,status:'ok',rows:rows.map(x=>({id:x.id,name:(ps[x.id]&&ps[x.id].name)||'A wayfarer',me:x.id===me,score:x.r.score,turns:x.r.turns||0,kos:x.r.kos||0}))};
  }catch(e){V.lb={key,status:'off',rows:[]};}
  finally{LB_BUSY=false;render();}
}
async function lbPost(score,turns,kos){
  const key=dailyKey(),db=await capOf('db'),user=await capOf('user');
  if(!db||!user)return 'The shared leaderboard is not available here.';
  const id=await user.id();if(!id)return 'Sign in on claude.ai to post scores.';
  try{
    const ref=db.doc('scores/'+id),snap=await ref.get(),cur=snap.exists?(snap.data()||{}):{};
    const days={};const cutoff=Date.now()-1000*60*60*24*21;Object.keys(cur.days||{}).forEach(k=>{const d=cur.days[k];if(d&&d.at>cutoff)days[k]=d;});
    if(days[key]&&days[key].score>=score)return `Your best today is still ${fmt(days[key].score)}.`;
    days[key]={score,turns,kos,at:Date.now()};await ref.set({days});return 'Score posted.';
  }catch(e){return e&&e.code==='invalid_argument'?'You can view the board but not post to it (ask the owner for Contributor access).':'Could not post the score right now.';}
}
// ----- actions -----
Object.assign(ACT,{
  pause(){if(V.screen==='battle'){V.modal={type:'pause'};render();}},
  slotLoad(s){META.slot=+s;saveMeta();const o=loadRaw(+s);if(!o)return;try{G=unpackG(o);}catch(e){toast('That save could not be read.');return;}enterWorldFromSave();},
  slotNew(s){META.slot=+s;saveMeta();V.modal=null;render();},
  slotDel(s){try{localStorage.removeItem(slotKey(+s));}catch(e){}toast(`Slot ${+s+1} cleared.`);render();},
  exportOpen(){V.modal={type:'export'};render();},
  importOpen(){V.modal={type:'import'};render();},
  copyExport(){const t=$('expta');if(!t)return;t.select();try{navigator.clipboard.writeText(t.value).then(()=>toast('Save code copied.'),()=>toast('Select the text and copy it.'));}catch(e){toast('Select the text and copy it.');}},
  doImport(){const t=$('impta');const g=t&&importSave(t.value);if(!g){toast('That code did not work. Check it was copied whole.');return;}G=g;saveGame();toast('Journey imported.');enterWorldFromSave();},
  daily(){V.lb=null;V.modal={type:'dailyIntro'};render();},
  dailyGo(){V.lbPosted=false;V.lbMsg='';V.modal=null;V.auto=false;if(!startDaily())toast('Could not start the trial.');},
  async postScore(){const m=V.modal;if(!m||V.lbPosted)return;V.lbMsg='Posting...';render();V.lbMsg=await lbPost(m.score,m.turns,m.kos);V.lbPosted=/posted|still/i.test(V.lbMsg);V.lb=null;render();},
  dailyDone(){V.modal=null;const had=endDaily();BUILT=null;if(had&&G&&WS.m){V.screen='world';render();rebuildBase();showLocation();}else{G=had?G:null;V.screen='title';render();}},
  personal(id){const q=startPersonal(id);if(q)toast(`${q.name} now prowls ${ZS(q.stage).n}.`);render();},
  tame(){const i=V.modal&&V.modal.info;if(!i||!i.tame)return;const o=tameElite(i.tame);if(o){i.tamed=o.name;sfx('chest');}render();},
  untame(){const i=V.modal&&V.modal.info;if(i){i.tame=null;}render();},
  buyRelit(id){const r=RELIT_STOCK.find(x=>x[0]===id);if(!r||G.gold<r[1])return;G.gold-=r[1];if(ITEMS[id])G.inv[id]=(G.inv[id]||0)+1;else G.gear.push(id);saveGame();sfx('buy');render();}
});
// ----- gamepad -----
const PAD={prev:{},rep:0};
function padPoll(now){
  const gps=navigator.getGamepads?navigator.getGamepads():[];const gp=gps&&Array.from(gps).find(Boolean);if(!gp)return;
  const b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed),ax=gp.axes||[];
  const vU=b(12)||ax[1]<-.45,vD=b(13)||ax[1]>.45,hL=b(14)||ax[0]<-.45,hR=b(15)||ax[0]>.45;
  const v=vU?'u':vD?'d':'',h=hL?'l':hR?'r':'';const dir=(v+h)||null;
  const st={A:b(0),B:b(1),X:b(2),Y:b(3),S:b(9)||b(8),LB:b(4),RB:b(5)};const edge=k=>st[k]&&!PAD.prev[k];
  if(!AU.ctx&&(st.A||st.B||dir))audioInit();
  const inWorld=V.screen==='world'&&!V.modal&&!WS.dlg;
  if(WS.padHold){if(dir)st.B=false;else WS.padHold=false;}
  if(inWorld){const pd=dir&&!WS.padHold?dir:null;if(pd!==WS.padDir){WS.padDir=pd;if(pd){inputTouch('pad');WS.target=null;WS.path=null;}}WS.run=st.B||KEYS_DOWN.has('Shift');if(edge('A'))interact();if(edge('S'))ACT.menu();if(edge('Y')&&ACT.map)ACT.map();}
  else{
    if(V.screen==='world'&&WS.dlg&&edge('A'))interact();
    else{
      const moved=dir&&(dir!==PAD.prev.dir||now-PAD.rep>200);
      const sheet=V.modal&&(V.modal.type==='char'||(V.modal.type==='guild'&&V.modal.char))&&!V.modal.gear;
      if(sheet&&(edge('LB')||edge('RB')))ACT.charNav(edge('LB')?-1:1);
      if(moved){PAD.rep=now;if(sheet&&(dir==='l'||dir==='r'))ACT.charNav(dir==='l'?-1:1);else{const d0=dir.length===2?dir[0]:dir;padFocus(d0==='u'||d0==='l'?-1:1);}}
      if(edge('A')){const a=document.activeElement;if(a&&a.matches&&a.matches('input,textarea'))a.focus();else if(a&&a.matches&&a.matches('button,[data-act]'))a.click();else padFocus(1);}
      if(edge('B')){if(V.modal)ACT.xBack();else if(B&&B.uDet)ACT.uClose();else if(B&&B.stPop)ACT.stClose();else if(B&&B.logOpen)ACT.blogT();else if(B&&B.mode==='cmd'&&B.menu!=='root')ACT.back();}
      if((edge('X')||edge('S'))&&V.modal){ACT.xClose();}
      else if(edge('S')&&V.screen==='world')ACT.menu();
    }
  }
  PAD.prev=Object.assign(st,{dir});
}
function padFocus(d){
  const root=V.modal?document.getElementById('modal'):document.getElementById('screen');if(!root)return;
  const all=Array.from(root.querySelectorAll('button:not([disabled]),input:not([disabled]),textarea:not([disabled])')).filter(e=>e.offsetParent!==null&&e.getAttribute('tabindex')!=='-1');
  if(!all.length)return;const i=all.indexOf(document.activeElement);const n=all[(i<0?(d>0?0:all.length-1):(i+d+all.length)%all.length)];n.focus();n.scrollIntoView({block:'nearest'});
}
// ----- touch: joystick pad and tap/drag on the map -----
const TOUCH={joy:null,map:null};
function joyDir(e){
  const j=document.getElementById('joy');if(!j)return null;const r=j.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  let dx=e.clientX-cx,dy=e.clientY-cy;const dist=Math.hypot(dx,dy),max=r.width*.32;
  const k=document.getElementById('knob');if(k){const f=dist>max?max/dist:1;k.style.transform=`translate(${dx*f}px,${dy*f}px)`;}
  if(dist<12)return null;
  // a little hysteresis keeps the direction steady along the diagonals
  return dir8(dx,dy,WS.joyDir);
}
// 8 sectors of 45 degrees, with a little hysteresis so the direction holds steady near a sector edge
const SECT=['r','dr','d','dl','l','ul','u','ur'];
function dir8(dx,dy,cur){let ang=Math.atan2(dy,dx)/(Math.PI/4);let i=((Math.round(ang)%8)+8)%8;
  if(cur){const ci=SECT.indexOf(cur);if(ci>=0){let diff=Math.abs(((ang-ci)%8+8)%8);diff=Math.min(diff,8-diff);if(diff<.62)i=ci;}}
  return SECT[i];}
function mapPoint(e){
  const cv=WS.cv;if(!cv||!WS.m)return null;const r=cv.getBoundingClientRect();
  const cx=Math.round(WS.cam?WS.cam.x:0),cy=Math.round(WS.cam?WS.cam.y:0);
  const px=(e.clientX-r.left)/r.width*WS.vw+cx,py=(e.clientY-r.top)/r.height*WS.vh+cy;
  return {px,py,tx:Math.floor(px/TS),ty:Math.floor(py/TS)};
}
function dragDir(p){const dx=p.px-(WS.px+8),dy=p.py-(WS.py+8);if(Math.hypot(dx,dy)<10)return null;return dir8(dx,dy,WS.touchDir);}
document.addEventListener('pointerdown',e=>{
  if(V.screen!=='world')return;
  const joy=e.target.closest&&e.target.closest('#joy');
  if(joy){e.preventDefault();audioInit();TOUCH.joy=e.pointerId;try{joy.setPointerCapture(e.pointerId);}catch(_){}WS.target=null;WS.path=null;const d=joyDir(e);if(d!==WS.joyDir){WS.joyDir=d;if(d)inputTouch('joy');}joy.classList.add('on');return;}
  if(e.target.id==='wcv'){
    e.preventDefault();audioInit();
    if(WS.dlg){interact();return;}
    if(V.modal||WS.lock)return;
    const p=mapPoint(e);if(!p)return;
    TOUCH.map={id:e.pointerId,t0:performance.now(),x0:e.clientX,y0:e.clientY,p0:p,drag:false};
    try{e.target.setPointerCapture(e.pointerId);}catch(_){}
  }
},{passive:false});
document.addEventListener('pointermove',e=>{
  if(TOUCH.joy===e.pointerId){e.preventDefault();const d=joyDir(e);if(d!==WS.joyDir){WS.joyDir=d;if(d)inputTouch('joy');}return;}
  const M=TOUCH.map;if(M&&M.id===e.pointerId){
    const moved=Math.hypot(e.clientX-M.x0,e.clientY-M.y0);
    if(M.drag||performance.now()-M.t0>220||moved>14){M.drag=true;WS.target=null;const p=mapPoint(e);if(p){const dd=dragDir(p);if(dd!==WS.touchDir){WS.touchDir=dd;if(dd)inputTouch('drag');}}}
  }
},{passive:false});
function endTouch(e){
  if(TOUCH.joy===e.pointerId){TOUCH.joy=null;WS.joyDir=null;const k=document.getElementById('knob');if(k)k.style.transform='';const j=document.getElementById('joy');if(j)j.classList.remove('on');return;}
  const M=TOUCH.map;if(M&&M.id===e.pointerId){
    TOUCH.map=null;const wasDrag=M.drag;WS.touchDir=null;
    if(!wasDrag&&e.type==='pointerup'&&WS.m&&!V.modal&&!WS.dlg){
      const {tx,ty}=M.p0,dist=Math.abs(tx-WS.x)+Math.abs(ty-WS.y);
      if(dist===0){interact();return;}
      if(dist===1){ // tapping right next to you: face it, and use it if there is something there
        const d=tx>WS.x?'r':tx<WS.x?'l':ty>WS.y?'d':'u';WS.dir=d;if(d==='l'||d==='r')WS.face=d;
        const m=WS.m,c=tileAt(m,tx,ty),thing=m.npcs.some(n=>n.x===tx&&n.y===ty)||dynActors(m).some(a=>a.x===tx&&a.y===ty)||m.bld.some(b=>b.door[0]===tx&&b.door[1]===ty)||'SWqCKXlDO|GmNgQPoa'.includes(c);
        if(thing&&!WS.mv){interact();return;}
      }
      WS.target=[tx,ty];WS.path=null;inputTouch('tap');
    }
  }
}
document.addEventListener('pointerup',endTouch);document.addEventListener('pointercancel',endTouch);

// ----- v4.5: crafting stations (Smithy and Alchemy since Beta v0.1.0), materials pouch, party helpers -----
function inTown(){return V.screen==='world'&&WS.m&&WS.m.kind==='town';}
function vPouch(only){
  return MATCAT.filter(c=>!only||only.includes(c.k)).map(c=>{const ids=c.ids.filter(id=>(G.mats[id]||0)>0||c.k!=='relic'||id===ZS(G.stage).mat||id==='core');
    return `<div class="pouch"><div class="ph" style="--mc:${c.c}"><i></i><b>${c.n}</b><small>${c.d}</small></div><div class="mats">${ids.map(id=>`<span class="matc ${(G.mats[id]||0)?'':'zero'}" style="--mc:${c.c}"><i></i>${MATS[id]} <b class="nums">${G.mats[id]||0}</b></span>`).join('')}</div></div>`;}).join('');
}
function recipeName(r){return r.item?ITEMS[r.item].n:gearOf(r.id).n;}
function recipeDesc(r){if(r.item)return ITEMS[r.item].d+".";const g=gearOf(r.id);return `${SLOTN[g.slot]}. ${gearDesc(g)}.`;}
// Shared recipe list for both stations. cats limits the chips to that station's categories.
// v0.4.0 3.3: what you can make right now comes first, biggest upgrade for your active party first; the rest follow by how close you are.
function recipeReady(r){return G.gold>=r.g&&hasMats(recipeMats(r))&&!(r.item&&(G.inv[r.item]||0)>=9);}
function recipeGain(r){if(r.item||!r.id)return [0,0];const L=gainersFor(r.id);return [L.length?L[0].g.pct:0,L.reduce((a,o)=>a+o.g.pct,0)];}
function recipeClose(r){const mm=recipeMats(r),ks=Object.keys(mm);let n=0,t=0;ks.forEach(k=>{t++;n+=Math.min(1,(G.mats[k]||0)/mm[k]);});if(r.g){t++;n+=Math.min(1,G.gold/r.g);}return t?n/t:1;}
function recipeOrder(list){const A=list.map(r=>({r,ok:recipeReady(r),g:recipeGain(r),c:recipeClose(r)}));
  A.sort((a,b)=>(b.ok-a.ok)||(a.ok?(b.g[0]-a.g[0]||b.g[1]-a.g[1]||b.r.t-a.r.t):(b.c-a.c||b.g[0]-a.g[0])));return A.map(o=>o.r);}
// ===== Beta v0.4.1 6.2: shops and the smithy list the rarest first, with filters that remember =====
const SHOPF=()=>{const o=META.cfg.shopF=META.cfg.shopF||{};return Object.assign({sort:'rarity',show:'all'},o);};
function shopFSet(k,v){META.cfg.shopF=Object.assign(SHOPF(),{[k]:v});try{saveMeta();}catch(e){}}
function shopFBar(){const f=SHOPF(),ch=(k,v,t)=>`<button class="chip ${f[k]===v?'on':''}" data-act="shopF" data-arg="${k}:${v}">${t}</button>`;
  return `<div class="lfbar shopf"><div class="chips"><small class="lbl">Sort</small>${ch('sort','rarity','Rarest first')}${ch('sort','ready','Ready first')}</div><div class="chips"><small class="lbl">Show</small>${ch('show','all','All')}${ch('show','usable','Fits my party')}${ch('show','afford','Can afford or craft')}</div></div>`;}
const rarityOf=o=>{const g=o.id?gearOf(o.id):null;return g?gTierIdx(g):(o.item?iTierIdx(o.item):0);};
function shopSortIds(ids){const f=SHOPF(),P=G.party.map(h=>G.roster[h]).filter(Boolean);let a=ids.slice();
  if(f.show==='usable')a=a.filter(id=>P.some(c=>canEquip(c,id)));
  if(f.show==='afford')a=a.filter(id=>G.gold>=GEAR[id].price);
  return a.sort((x,y)=>gTierIdx(GEAR[y])-gTierIdx(GEAR[x])||GEAR[y].price-GEAR[x].price||GEAR[x].n.localeCompare(GEAR[y].n));}
function recipeList(list){const f=SHOPF(),P=G.party.map(h=>G.roster[h]).filter(Boolean);let a=list.slice();
  if(f.show==='usable')a=a.filter(r=>!r.id||P.some(c=>canEquip(c,r.id)));
  if(f.show==='afford')a=a.filter(r=>recipeReady(r));
  if(f.sort==='ready')return recipeOrder(a);
  return a.sort((x,y)=>rarityOf(y)-rarityOf(x)||String(recipeName(x)).localeCompare(String(recipeName(y))));}
function vRecipes(cat,cats,blurb){
  const all=RECIPES.filter(r=>r.cat===cat),open=all.filter(recipeOpen),locked=all.length-open.length;
  return `<div class="chips">${RCAT.filter(([k])=>cats.includes(k)).map(([k,n])=>`<button class="chip ${cat===k?'on':''}" data-act="wcat" data-arg="${k}">${n}</button>`).join('')}</div>
      <p class="note">${blurb}</p>${shopFBar()}
      <div class="rows">${recipeList(open).map(r=>{const mm=recipeMats(r),ok=recipeReady(r),have=r.item?`Carrying ${G.inv[r.item]||0}.`:`Owned spare: ${G.gear.filter(x=>x===r.id).length}.`;
        const rg=r.id?gearOf(r.id):null,rt=rg?gTierIdx(rg):iTierIdx(r.item);
        return `<div class="row rec tr ${ok?'ready':''}" style="${tierVars(rt,rg)}">${rg?gearIcon(r.id):''}<div class="grow"><b>${recipeName(r)}</b> ${rg?tierChip(rg):itemChip(r.item)}${rg?`<small>${vsParty(r.id)}</small>`:''}<small>${recipeDesc(r)} ${have}</small>${r.id?bestTag(r.id)+cmpPanel(r.id):''}<div class="mats">${matChips(mm)}${r.g?`<span class="matc gold ${G.gold>=r.g?'':'short'}"><i></i><b class="nums">${fmt(r.g)}</b> gold</span>`:''}</div></div><button class="btn sm ${ok?'gold':''}" data-act="craftR" data-arg="${RECIPES.indexOf(r)}" ${ok?'':'disabled'}>${r.item?'Craft':'Forge'}</button></div>`;}).join('')}</div>
      ${locked?`<p class="note">${locked} more recipe${locked>1?'s unlock':' unlocks'} here as you push into later realms.</p>`:''}`;
}
function matBuyRow(id,p,left){const lim=left==null?9:left;return `<div class="row"><div class="grow"><b><span class="dot" style="--mc:${MAT_OF[id].c}"></span>${MATS[id]}</b><small class="nums">${MAT_OF[id].n}. You have ${G.mats[id]||0}.${left!=null?` ${left} left until you next rest at an inn.`:''}</small></div><div class="btnrow tight"><button class="btn sm" data-act="${left!=null?'buyPart':'buyMat'}" data-arg="${id},1" ${G.gold>=p&&lim>=1?'':'disabled'}><span class="nums">${p}</span></button>${left==null?`<button class="btn sm" data-act="buyMat" data-arg="${id},5" ${G.gold>=p*5?'':'disabled'}>x5 <span class="nums">${p*5}</span></button>`:''}</div></div>`;}
function matSellRows(kinds){const ids=Object.keys(MATS).filter(id=>(G.mats[id]||0)>0&&kinds.includes(MAT_OF[id].k));
  return ids.map(id=>`<div class="row"><div class="grow"><b><span class="dot" style="--mc:${MAT_OF[id].c}"></span>${MATS[id]}</b><small class="nums">You have ${G.mats[id]}. ${matSell(id)} gold each.</small></div><div class="btnrow tight"><button class="btn sm" data-act="sellMat" data-arg="${id},1">Sell 1</button>${G.mats[id]>=5?`<button class="btn sm" data-act="sellMat" data-arg="${id},5">Sell 5</button>`:''}</div></div>`).join('')||'<p class="note">Nothing of that kind in your pouch.</p>';}
function vSmithMats(){
  return `<h4>Ore and wood</h4><p class="note">Stock grows as you reach later realms.</p><div class="rows">${smithMatStock().map(id=>matBuyRow(id,MAT_PRICE[id])).join('')}</div>
    <h4>Monster parts</h4><p class="note">The smith keeps a few parts behind the counter, at a steep price and only ${PART_STOCK} of each per inn rest. Hunting is still the way to get them in bulk.</p><div class="rows">${Object.keys(PART_PRICE).map(id=>matBuyRow(id,partPrice(id),partLeft(id))).join('')}</div>
    <h4>Sell</h4><div class="rows">${matSellRows(['ore','wood','part','relic'])}</div>`;
}
function mWorkshop(m){
  // Beta v0.1.0: the green-flask house is Alchemy (internal key stays 'workshop').
  const tab=m.tab||'shop',cat=ALCH_CATS.includes(m.cat)?m.cat:'potion';
  const T=[['shop','Shop'],['craft','Brew &amp; craft'],['herbs','Herbs'],['sell','Sell'],['pouch','Pouch']];if(G.cleared[townS()])T.splice(1,0,['relit','Festival wares']);let body='';
  if(tab==='shop'){
    const it=alchStock().slice().sort((a,b)=>iTierIdx(b)-iTierIdx(a)||ITEMS[b].price-ITEMS[a].price).map(id=>{const o=ITEMS[id];return `<div class="row tr" style="${tierVars(iTierIdx(id))}"><div><b>${itemIcon(id)} ${o.n}</b> ${itemChip(id)}<small>${o.d}. Carrying ${G.inv[id]||0}.</small></div><button class="btn sm" data-act="buyItem" data-arg="${id}" ${G.gold>=o.price&&(G.inv[id]||0)<9?'':'disabled'}>${o.price}</button></div>`;}).join('');
    const ch=shopSortIds(shopStock('charms')).map(id=>{const g=GEAR[id];return `<div class="row shoprow tr" style="${tierVars(gTierIdx(g),g)}">${gearIcon(id)}<div class="grow"><b>${g.n}</b> ${tierChip(g)}<small>${vsParty(id)}</small><small>${gearDesc(g)}. Spares owned: ${G.gear.filter(x=>x===id).length}.</small>${bestTag(id)}${cmpPanel(id)}</div><button class="btn sm" data-act="buyGear" data-arg="${id}" ${G.gold>=g.price?'':'disabled'}>${g.price}</button></div>`;}).join('');
    body=`<h4>Potions, tonics and travel gear</h4><div class="rows">${it}</div><h4>Charms</h4><div class="rows">${ch}</div>`;
  }else if(tab==='craft'){
    body=vRecipes(cat,ALCH_CATS,cat==='potion'?'Brew draughts from herbs you pick in the fields. Cheaper than buying, and some brews are Alchemy-only.':cat==='charm'?'Charms need monster parts and your realm\'s relic.':'Stitch your own tent from logs and hide.');
  }else if(tab==='relit'){
    body=`<p class="note">The beacon is lit and the alchemist is in a generous mood: rare stock, only in relit towns.</p><div class="rows">`+RELIT_STOCK.map(([id,price])=>{const isItem=!!ITEMS[id],n=isItem?ITEMS[id].n:gearOf(id).n,d=isItem?ITEMS[id].d:gearDesc(id);return `<div class="row"><div><b>${n}</b><small>${d}${isItem?'. Carrying '+(G.inv[id]||0):''}</small></div><button class="btn sm" data-act="buyRelit" data-arg="${id}" ${G.gold>=price?'':'disabled'}>${fmt(price)}</button></div>`;}).join('')+'</div>';
  }else if(tab==='herbs'){
    body=`<p class="note">Fresh herbs for brewing. Stock grows as you reach later realms.</p><div class="rows">${herbStock().map(id=>matBuyRow(id,MAT_PRICE[id])).join('')}</div><h4>Sell herbs</h4><div class="rows">${matSellRows(['herb'])}</div>`;
  }else if(tab==='sell'){
    const cnt={};G.gear.forEach(g=>{const o=gearOf(g);if(o&&o.slot==='c')cnt[g]=(cnt[g]||0)+1;});
    body=`<div class="rows">${Object.keys(cnt).map(id=>{const g=gearOf(id);return `<div class="row tr" style="${tierVars(gTierIdx(g),g)}">${gearIcon(id)}<div class="grow"><b>${g.n}</b> ${tierChip(g)} x${cnt[id]}<small>Charm. ${gearDesc(g)}</small></div><button class="btn sm" data-act="sell" data-arg="${id}">Sell ${sellVal(g)}</button></div>`;}).join('')||'<p class="note">No spare charms. Weapons and armor sell at the Smithy.</p>'}</div><h4>Herbs</h4><div class="rows">${matSellRows(['herb'])}</div>`;
  }else body=vPouch();
  return box('Alchemy',tabs(T,tab,'tab')+body,'<button class="btn" data-act="closeModal">Leave</button>',true);
}
Object.assign(ACT,{
  wcat(k){V.modal.cat=k;render();},
  shopF(a){const [k,v]=a.split(':');shopFSet(k,v);render();},
  craftR(i){const r=RECIPES[+i];if(craft(r)){toast((r.item?'Crafted: ':'Forged: ')+recipeName(r)+(r.item?'':'. Equip it from the menu.'));sfx('chest');}else sfx('deny');render();},
  buyMat(a){const [id,n]=a.split(',');if(buyMat(id,+n)){sfx('buy');}else sfx('deny');render();},
  buyPart(a){const [id,n]=a.split(',');if(buyPart(id,+n)){sfx('buy');}else sfx('deny');render();},
  sellMat(a){const [id,n]=a.split(',');if(sellMat(id,+n))sfx('buy');render();}
});

// v5.0: swipe left/right on a hero sheet to page through the list
{let SW=null;const st=(x,y,t)=>{const p=t.closest&&t.closest('.charsheet');SW=p?{x,y,t:performance.now()}:null;},en=(x,y)=>{if(!SW)return;const dx=x-SW.x,dy=y-SW.y,dt=performance.now()-SW.t;SW=null;if(Math.abs(dx)>70&&Math.abs(dy)<55&&dt<800)ACT.charNav(dx<0?1:-1);};
 document.addEventListener('touchstart',e=>{const t=e.changedTouches[0];st(t.clientX,t.clientY,e.target);},{passive:true});
 document.addEventListener('touchend',e=>{const t=e.changedTouches[0];en(t.clientX,t.clientY);},{passive:true});
 document.addEventListener('mousedown',e=>st(e.clientX,e.clientY,e.target));document.addEventListener('mouseup',e=>en(e.clientX,e.clientY));}
