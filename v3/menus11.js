// ===== menus11.js (v0.17.8 menu pass): menu history, tap outside to close, Load another journey, Settings in sections =====
// 1. History. Every change of the view in #modal (a new V.modal, or a menu tab / sub tab / shop section / sheet state change) pushes the view
//    it left (a shallow copy of the modal object plus the scroll position of every scrolled element in the popup) onto MH.stack. Back (the
//    arrow, Esc, the gamepad B, the Android back gesture, and the Back / Done buttons of the sheets and shops) pops the top, shows that view
//    again and restores its scroll. The stack clears when V.modal goes null (the player is back in the world) and when a "must answer" popup
//    shows. It lives only here: never in G, META or a save. With an empty stack every old back rule (modalBack, from:) still applies.
// 2. A tap on the dimmed backdrop (outside the .box) closes every popup and menu at once, with guards (see backdropOk).
// 3. Load another journey: Menu > Journey and Settings > Account and Saves open the title's slot picker (mSlots), a confirm, then slotLoad.
// 4. Settings rows (from every module's settingsBody hook) are re-sliced into titled, collapsible sections.
// Wrapping only: ui.js, nav.js, saves.js, p5settings.js are untouched.
const MH={stack:[],cur:null,popping:null,max:40,down:null};
// popups that must be answered (a story beat, a result, a save conflict, a choice): never pushed, clear the stack, and a backdrop tap does nothing
const M11_MUST=new Set(['story','legendEvt','cev','convergence','result','lose','dailyEnd','recruitAsk','innTalk','rkrest','ngplus','svwait','svdiv','svnewer','svfail','svrestore','svimpconfirm','svdel','svdelhist','startfew','gmig','bossEnergy']);
// transient popups: shown on top of a view, but never a place to come back to
const M11_NOPUSH=new Set([...M11_MUST,'ldRes','equipNow','m11leave','p3need']);
// in a battle only these informational popups close on a backdrop tap (the command prompt, targeting and the result stay put)
const M11_BATTLE_OK=new Set(['battlelore','statInfo','wxinfo','beast','codexEntry','goalguide']);
const M11_SIG=['type','tab','cat','sec','char','id','k','nat','hero','slot','mode','key','sk','cid','sub','item','charms','s','b'];
function m11Sig(m){if(!m)return '';return M11_SIG.map(k=>{const v=m[k];return v==null?'':(typeof v==='object'?'o':String(v));}).join('|')+(m.gear?'|g':'')+(m.ingame?'|ig':'');}
function m11Scroll(){try{const mod=$('modal');if(!mod||!mod.firstElementChild)return [];return [...mod.querySelectorAll('.modal,.modal *')].filter(e=>e.scrollTop>0).map(e=>[pathOf(e,mod),e.scrollTop]);}catch(e){return [];}}
function m11ScrollPut(sc){try{const mod=$('modal');if(!mod||!sc||!sc.length)return;const put=()=>sc.forEach(([p,t])=>{const e=byPath(p,mod);if(e&&Math.abs(e.scrollTop-t)>1)e.scrollTop=t;});put();
  requestAnimationFrame(()=>{put();setTimeout(put,120);});}catch(e){}}
function m11Track(before){
  const m=V.modal;
  if(!m){MH.stack.length=0;MH.cur=null;return;}
  if(M11_MUST.has(m.type)){MH.stack.length=0;MH.cur={sig:m11Sig(m),snap:null,scroll:[]};return;}
  const sig=m11Sig(m),c=MH.cur;
  if(!before&&c&&c.obj===m){c.sig=sig;c.snap=Object.assign({},m);return;}   // the same popup, normalised while it rendered (menus3 m3Norm moves a legacy tab to tab + sec): not a new view
  const sc=before&&c?m11Scroll():(c?c.scroll:[]);   // before the html is built the DOM still shows the view we are leaving
  if(c&&c.sig!==sig&&!MH.popping&&c.snap&&!M11_NOPUSH.has(c.snap.type)){
    const top=MH.stack[MH.stack.length-1];
    if(!(top&&top.sig===c.sig)){MH.stack.push({sig:c.sig,snap:c.snap,scroll:sc||[]});if(MH.stack.length>MH.max)MH.stack.shift();}}
  MH.cur={sig,snap:Object.assign({},m),obj:m,scroll:c&&c.sig===sig?sc:[]};
}
HOOK.before('render','menus11','history: note the view change before the popup html is built (the back arrow needs the stack)',function(){try{m11Track(true);}catch(e){}});
HOOK.after('render','menus11','history: a hook inside render may have opened a popup; restore the scroll of a view we went back to',function(){try{m11Track(false);if(MH.popping){const sc=MH.popping.scroll;MH.popping=null;m11ScrollPut(sc);}}catch(e){}});
function m11Pop(){
  let e=MH.stack.pop();const cs=MH.cur&&MH.cur.sig;
  while(e&&e.sig===cs)e=MH.stack.pop();
  if(!e)return false;
  V.swapSel=null;MH.popping=e;V.modal=Object.assign({},e.snap);
  if(V.modal.type==='menu'&&V.modal.tab){V.lastMenuTab=V.modal.tab;try{(V.menuSub=V.menuSub||{})[menuGroupOf(V.modal.tab)[0]]=V.modal.tab;}catch(x){}}
  try{if(typeof sfx==='function')sfx('blip');}catch(x){}
  try{render();}finally{MH.popping=null;}
  return true;
}
function m11CanPop(){return !!(V.modal&&MH.stack.length&&!M11_MUST.has(V.modal.type));}
HOOK.before('modalBack','menus11','back goes through the history',function(m){if(m&&m===V.modal&&m11CanPop())return HOOK.stop(()=>{});});
{const xb0=ACT.xBack;ACT.xBack=function(){if(m11CanPop()&&m11Pop())return;return xb0.apply(this,arguments);};}
// every in-view "Back" goes through the history while there is one
['charBack','menuBack','roleBack','bondsBack','natBack','fsBack','gearBack','obBack'].forEach(k=>{const f=ACT[k];if(typeof f!=='function')return;
  ACT[k]=function(){if(m11CanPop()&&m11Pop()){if(k==='obBack')V.obPrev=null;return;}return f.apply(this,arguments);};});

// ---------- 2. tap outside to close everything ----------
function backdropOk(){
  const m=V.modal;if(!m||M11_MUST.has(m.type))return false;
  if(V.screen==='battle'&&!M11_BATTLE_OK.has(m.type))return false;
  if(typeof KM!=='undefined'&&KM.wait)return false;
  const mod=$('modal');if(mod){const t=[...mod.querySelectorAll('textarea,input[type=text],input[type=search],input:not([type])')].find(x=>String(x.value||'').trim());if(t)return false;}   // an unsent draft or a pasted save
  return true;
}
document.addEventListener('pointerdown',e=>{const t=e.target;MH.down=t&&t.classList&&t.classList.contains('modal')&&t.parentNode&&t.parentNode.id==='modal'?{t,x:e.clientX,y:e.clientY,at:performance.now(),sx:t.scrollTop}:null;},true);
document.addEventListener('click',e=>{
  const t=e.target,d=MH.down;MH.down=null;
  if(!t||!t.classList||!t.classList.contains('modal')||!t.parentNode||t.parentNode.id!=='modal')return;
  if(!d||d.t!==t)return;                                   // the press began inside the box (a drag that ended outside)
  if(e.detail===0&&!(e.pointerType))return;                // a synthetic click (keyboard Enter on a button)
  if(Math.hypot((e.clientX||0)-d.x,(e.clientY||0)-d.y)>10||Math.abs(t.scrollTop-d.sx)>2)return;   // a drag or a scroll
  if(!backdropOk())return;
  e.preventDefault();e.stopPropagation();
  V.swapSel=null;V.obPrev=null;V.modal=null;render();
},true);
// the Android back gesture (Capacitor): back through the history, else the battle sub menu, else the old default (history back or leave the app)
setTimeout(()=>{try{const C=window.Capacitor,P=C&&C.Plugins&&C.Plugins.App;if(P&&P.addListener&&(!C.isPluginAvailable||C.isPluginAvailable('App'))){
  P.addListener('backButton',ev=>{try{
    if(V.modal){ACT.xBack();return;}
    if(V.screen==='battle'&&B&&B.mode==='cmd'&&B.menu!=='root'){ACT.back();return;}
    if(V.screen==='battle'&&B&&B.uDet){ACT.uClose();return;}
    if(ev&&ev.canGoBack)window.history.back();else if(P.exitApp)P.exitApp();}catch(e){}});}}catch(e){}},0);

// ---------- 3. Load another journey ----------
ACT.m11Load=function(){if(!G||V.screen==='title'||B)return;V.modal={type:'slots',mode:'load',ingame:1};render();};
function m11Time(t){if(!t)return 'this journey was started';const d=new Date(t),n=new Date();return d.toDateString()===n.toDateString()?d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):d.toLocaleString();}
ACT.m11Ask=function(s){s=+s;if(!svSlotRaw(s)){toast('No saved journey in that slot.');return;}V.modal={type:'m11leave',slot:s};render();};
ACT.m11Go=function(s){s=+s;
  V.modal=null;try{B=null;V.gearQueue=[];V.swapSel=null;if(typeof WS!=='undefined'){WS.held=[];WS.target=null;WS.path=null;}}catch(e){}
  render();ACT.slotLoad(s);};
HOOK.before('vModal','menus11','Leave this journey? confirm',function(m){if(!m||m.type!=='m11leave')return;
  const o=slotSummary(m.slot),cur=(META.slot||0),same=m.slot===cur;
  const sum=o?`Stage ${o.stage+1}, ${o.cleared} of 5 beacons relit${o.cycle?', NG+'+o.cycle:''}. Party level ${o.lv}, ${fmt(o.gold)} gold.${o.savedAt?' Saved '+esc(new Date(o.savedAt).toLocaleString())+'.':''}`:'';
  return HOOK.stop(box(same?'Reload this journey?':'Leave this journey?',
    `<p><b>Unsaved progress since ${esc(m11Time(G&&G.savedAt))} is lost.</b></p><p class="note">${same?'Slot '+(cur+1)+' goes back to its last save.':'Loads slot '+(m.slot+1)+' in place of slot '+(cur+1)+'. Nothing in slot '+(cur+1)+' is erased; use Save first if you want to keep what you have done since.'}</p>${sum?`<div class="row"><div class="grow"><b>Slot ${m.slot+1}</b><small>${sum}</small></div></div>`:''}`,
    `<button class="btn" data-act="xBack">Stay here</button><button class="btn gold" data-act="m11Go" data-arg="${m.slot}">${same?'Reload':'Load slot '+(m.slot+1)}</button>`));});
HOOK.xform('vModal','menus11','the slot picker, opened from a journey: Load asks first, the open slot cannot be deleted',function(h,m){
  if(!m||m.type!=='slots'||!m.ingame||typeof h!=='string')return h;const cur=META.slot||0;
  h=h.replace('Continue a journey','Load another journey').replace(/data-act="slotLoad"/g,'data-act="m11Ask"').replace(new RegExp(`<button class="btn sm" data-act="slotDel" data-arg="${cur}"[^>]*>[^<]*</button>`),'');
  h=h.replace('<div class="rows">',`<p class="note">You are playing slot ${cur+1}. Pick another journey to load; you are asked before anything is left.</p><div class="rows">`);
  return h;});
{const sj0=svJourneyRow;svJourneyRow=function(){let h=sj0.apply(this,arguments);try{if(!B)h=h.replace('<button class="btn sm" data-act="recoverOpen">Recover Saves</button>','<button class="btn sm" data-act="recoverOpen">Recover Saves</button><button class="btn sm" data-act="m11Load">Load another journey</button>');}catch(e){}return h;};}

// ---------- 4. Settings in sections ----------
// Rank of every row the other modules add, keyed by what is in the row. Unknown rows land in "More" so nothing is lost.
const M11_SECS=[['play','Play'],['display','Display'],['sound','Sound'],['controls','Controls'],['account','Account and Saves'],['help','Help and Feedback'],['more','More'],['danger','Danger zone']];
const M11_RANK=[ // [section, order, test on the row's html]
 ['play',0,/"speed",/],['play',1,/data-act="autoOpen"/],['play',2,/"timedHits",/],['play',3,/"autoOne",/],['play',4,/"expertBattle",/],['play',5,/"skTags",/],['play',6,/"hints",/],['play',7,/"tips",/],['play',8,/"diff",/],['play',9,/"enc",/],['play',10,/"autoStats",/],['play',11,/"autoEquip",/],['play',12,/Encounters Off still lets/],
 ['display',0,/"gfx",/],['display',1,/"render",/],['display',2,/"hd2d",/],['display',3,/"textSize",|"tsize",/],['display',4,/"rmotion",/],['display',5,/"uiScale",/],['display',6,/"minimap",/],
 ['sound',0,/data-vol="master"/],['sound',1,/data-vol="music"/],['sound',2,/data-vol="sfx"/],['sound',3,/data-act="ambSet"/],['sound',4,/data-act="mstyleSet"/],['sound',5,/data-act="creditsOpen"/],
 ['controls',0,/data-act="kmOpen"/],
 ['account',5,/data-act="quitTitle"/]];
function m11Rank(html){html=html.replace(/&quot;/g,'"');for(const r of M11_RANK)if(r[2].test(html))return r;return ['more',0,null];}
function m11Shut(key,idx){const s=V.m11Shut||{};if(key in s)return !!s[key];return innerWidth<=600;}   // phones: every section folded, so the page reads as a list of seven categories
ACT.m11Sec=function(k){const idx=M11_SECS.findIndex(x=>x[0]===k);V.m11Shut=V.m11Shut||{};V.m11Shut[k]=!m11Shut(k,idx<0?0:idx);render();};
function m11Gen(){ // rows this pass adds, using acts that already exist
  const out={account:[],help:[],danger:[],controls:[]};
  if(G&&V.screen!=='title'){
    const slot=(META.slot||0);
    if(!G.daily){
      out.account.push([0,`<div class="row"><div class="grow"><b>Save now</b><small>Slot ${slot+1}. ${G.savedAt?'Last saved '+esc(agoText(G.savedAt))+'.':'Not saved yet.'} The game also saves as you play.</small></div><button class="btn sm" data-act="p5Save">💾 Save</button></div>`]);
      if(!B)out.account.push([1,`<div class="row"><div class="grow"><b>Load another journey</b><small>Pick a different save slot and play it without going back to the title.</small></div><button class="btn sm gold" data-act="m11Load">Load another journey</button></div>`]);
      out.account.push([2,`<div class="row"><div class="grow"><b>Export and import</b><small>A copy of your journey to keep, or to move to another device.</small></div><div class="chips"><button class="chip" data-act="exportOpen">Export save</button><button class="chip" data-act="importOpen">Import save</button><button class="chip" data-act="recoverOpen">Recover Saves</button></div></div>`]);
      try{if(SV&&SV.status&&SV.status!=='local')out.account.push([3,`<div class="row"><div class="grow"><b>Cloud sync</b><small>${esc(SV_TXT[SV.status]||'')}. ${SV.last?'Last sync '+esc(agoText(SV.last))+'.':'Waiting for the first sync.'}</small></div><button class="btn sm" data-act="svSyncNow">${SV_ICON[SV.status]||'☁'} Sync</button></div>`]);}catch(e){}
      try{if(SV&&SV.status&&SV.status!=='local')out.danger.push([0,`<div class="row"><div class="grow"><b>Delete cloud save</b><small>Removes slot ${slot+1} from your account. This device keeps its copy. You are asked to confirm.</small></div><button class="btn sm" data-act="svDelAsk" data-arg="${slot}">Delete cloud save</button></div>`]);}catch(e){}
    }
  }
  out.help.push([0,`<div class="row"><div class="grow"><b>Help and feedback</b><small>Report a bug, send an idea, read the changelog or check your sent reports.</small></div><button class="btn sm" data-act="fbOpen">Help / Feedback</button></div>`]);
  out.help.push([1,`<div class="row"><div class="grow"><b>Guides</b><small>What next, foe types and how the systems work.</small></div><button class="btn sm" data-act="menuGrp" data-arg="guides">Guides</button></div>`]);
  try{if(!kmHasKb())out.controls.push([1,`<div class="row"><div class="grow"><b>Touch</b><small>Drag the pad or tap the ground to walk, tap people and doors to use them. The keyboard Keys row shows up on computers.</small></div></div>`]);}catch(e){}
  return out;}
HOOK.xform('settingsBody','menus11','titled sections in order of convenience: Play, Display, Sound, Controls, Account and Saves, Help and Feedback, Danger zone',function(h){
  try{
    const t=document.createElement('template');t.innerHTML=h;const items=[];
    [...t.content.childNodes].forEach(n=>{
      if(n.nodeType===3){if(n.textContent.trim())items.push(n.textContent);return;}
      if(n.nodeType!==1)return;
      if(n.classList.contains('rows')){[...n.children].forEach(c=>{if(c.tagName==='H4'&&c.classList.contains('volh'))return;items.push(c);});}
      else items.push(n);});
    const secs={};M11_SECS.forEach(([k])=>secs[k]=[]);
    items.forEach((n,i)=>{const html=typeof n==='string'?n:n.outerHTML,r=m11Rank(html);secs[r[0]].push([r[1],i,html]);});
    const gen=m11Gen();Object.keys(gen).forEach(k=>gen[k].forEach(([o,html])=>secs[k].push([o,1e6+secs[k].length,html])));
    const out=[];let idx=0;
    M11_SECS.forEach(([k,title])=>{const L=secs[k].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(!L.length)return;
      const shut=m11Shut(k,idx++);
      out.push(`<section class="m11sec ${k} ${shut?'shut':''}" data-sec="${k}"><button class="m11h" data-act="m11Sec" data-arg="${k}" aria-expanded="${!shut}"><span>${title}</span><i aria-hidden="true">${shut?'▸':'▾'}</i></button><div class="m11b"><div class="rows">${L.map(x=>x[2]).join('')}</div></div></section>`);});
    return out.join('');
  }catch(e){return h;}});

try{window.__M11={MH,sig:m11Sig,must:M11_MUST,battleOk:M11_BATTLE_OK,secs:M11_SECS,pop:m11Pop};}catch(e){}
