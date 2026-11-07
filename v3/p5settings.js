// ===== p5settings.js (v0.5.0): settings, saving indicator and title =====
// 5.1 Master, Music and Sound effects sliders with their own mutes. META.cfg.master (0..1, default 1), .music, .sfx (0..1, as before),
//     .mute (master mute, the top bar button), .muteMusic, .muteSfx. Applied instantly through audioVol / au2Vol, saved with the settings.
// 5.2 cloud sync stays automatic (saves.js svMark: debounced after each save, signed in players with write access only).
//     The debounce comes from SAVE_UI.syncDelay; leaving or hiding the page saves and pushes right away (saves.js svLeave, v0.8.5).
// 5.3 the game is "Wayfarers (Beta)": title screen, tab title, top bar, menu footer, Help, changelog heading and feedback context.
//     Save keys, db paths and ids keep their aurelis names.
// 5.5 a Save button pinned in the main menu header (slot, last saved), and a small save message in a free top corner for every save.
const GAME_TITLE='Wayfarers (Beta)';
function gameTitleVer(){return GAME_TITLE+' '+String(GAME_VERSION).replace(/^Beta\s*/,'');}

// ---------- 5.1 volume ----------
function cfgVol(k,d){const v=META&&META.cfg?META.cfg[k]:null;return typeof v==='number'&&isFinite(v)?Math.max(0,Math.min(1,v)):d;}
function p5Vol(){const c=META.cfg||{},mv=c.mute?0:cfgVol('master',1);
  try{if(AU.ctx&&AU.master){AU.master.gain.value=mv;if(c.muteMusic&&AU.mus)AU.mus.gain.value=0;if(c.muteSfx&&AU.fx)AU.fx.gain.value=0;}}catch(e){}
  try{const g=AU2.g;if(g){g.master.gain.value=mv;if(c.muteMusic)g.bus.music.gain.value=0;if(c.muteSfx){g.bus.sfx.gain.value=0;g.bus.ui.gain.value=0;}}}catch(e){}}
{const a0=audioVol;audioVol=function(){const r=a0.apply(this,arguments);p5Vol();return r;};}
{const a0=au2Vol;au2Vol=function(){const r=a0.apply(this,arguments);p5Vol();return r;};}
const VOLS=[['master','Master','Everything: music, effects and ambience.','mute',1],['music','Music','The soundtrack.','muteMusic',.45],['sfx','Sound effects','Battle, menu and footstep sounds.','muteSfx',.6]];
function volRows(){const c=META.cfg;return VOLS.map(([k,lab,d,mk,def])=>{const v=Math.round(cfgVol(k,def)*100),mu=!!c[mk];
  return `<div class="row volrow"><div class="grow"><b>${lab}</b><small>${d}</small><div class="volc"><input type="range" min="0" max="100" step="1" value="${v}" data-vol="${k}" aria-label="${lab} volume" ${mu?'class="muted"':''}><span class="nums" data-volv="${k}">${v}%</span></div></div><button class="chip ${mu?'on':''}" data-act="p5Mute" data-arg="${mk}" aria-pressed="${mu}">${mu?'Muted':'Mute'}</button></div>`;}).join('');}
HOOK.xform('settingsBody','p5settings','volume sliders replace the sound rows',function(h){try{
  const rows=`<h4 class="volh">Volume</h4>${volRows()}`;let put=false;
  h=h.replace(/<div class="row"><div><b>Sound<\/b>[\s\S]*?<\/div><div class="chips">[\s\S]*?<\/div><\/div>/,()=>{put=true;return '</div><div class="rows">'+rows+'</div><div class="rows">';});
  h=h.replace(/<div class="row"><div><b>Music<\/b><\/div><div class="chips">[\s\S]*?<\/div><\/div>/,'').replace(/<div class="row"><div><b>Sound effects<\/b><\/div><div class="chips">[\s\S]*?<\/div><\/div>/,'');
  if(!put)h=`<div class="rows">${rows}</div>`+h;h=h.replace(/<div class="rows"><\/div>/g,'');}catch(e){}return h;});
ACT.p5Mute=function(k){if(!['mute','muteMusic','muteSfx'].includes(k))return;META.cfg[k]=!META.cfg[k];saveMeta();audioVol();render();};
let volSaveT=null;
document.addEventListener('input',e=>{const el=e.target,k=el&&el.dataset&&el.dataset.vol;if(!k||!VOLS.some(v=>v[0]===k))return;
  META.cfg[k]=Math.max(0,Math.min(100,+el.value||0))/100;try{audioVol();}catch(x){}
  const lab=document.querySelector(`[data-volv="${k}"]`);if(lab)lab.textContent=Math.round(META.cfg[k]*100)+'%';
  clearTimeout(volSaveT);volSaveT=setTimeout(()=>{try{saveMeta();}catch(x){}},400);});
document.addEventListener('change',e=>{const k=e.target&&e.target.dataset&&e.target.dataset.vol;if(k){clearTimeout(volSaveT);try{saveMeta();}catch(x){}}});

// ---------- 5.2 cloud sync ----------
// v0.8.5: the debounce (SAVE_UI.syncDelay, now 2 s, at most SAVE_UI.syncMax) and the push on leaving live in saves.js (svMark, svLeave).
// Leaving saves the journey first where it is safe, and a push already in flight gets a second one chained after it.
function p5FlushNow(){try{svLeave('hide');}catch(e){}}

// ---------- 5.3 the name ----------
try{document.title=gameTitleVer();}catch(e){}
{const b0=buildScreen;buildScreen=function(){const r=b0.apply(this,arguments);try{if(V.screen==='title'){const s=$('screen');
  const pre=s.querySelector('.title .pre');if(pre)pre.remove();const lg=s.querySelector('.title .logo');if(lg)lg.textContent='Wayfarers';
  const sub=s.querySelector('.title .sub');if(sub)sub.textContent='(Beta)';const ver=s.querySelector('.title .ver');if(ver)ver.textContent=gameTitleVer();}}catch(e){}return r;};}
{const h0=vHeader;vHeader=function(){return String(h0.apply(this,arguments)).replace('<div class="brand"><b>Aurelis</b>','<div class="brand"><b>Wayfarers</b>');};}
{const f0=vFbHelp;vFbHelp=function(){return String(f0.apply(this,arguments)).replace(/<h4>Version<\/h4><p class="note">You are playing [^.<]*?(Beta v[\d.]+)\./,`<h4>${GAME_TITLE} changelog</h4><p class="note">You are playing ${esc(gameTitleVer())}.`);};}
{const c0=fbContext;fbContext=function(){const o=c0.apply(this,arguments);try{if(o&&typeof o==='object'){o.game=GAME_TITLE;o.title=gameTitleVer();}}catch(e){}return o;};}
{const c0=fbCopy;fbCopy=function(text){const a=[].slice.call(arguments);if(typeof text==='string')a[0]=text.replace(/^Aurelis Wayfarers:/,GAME_TITLE+':');return c0.apply(this,a);};}

// ---------- 5.5 Save in the menu, the save message, the cloud chip ----------
const P5S={el:null,t1:null,t2:null,t3:null,shownAt:0,state:'',retry:false};
function p5SaveLabel(){const slot=(META.slot||0)+1,just=V.savedT&&Date.now()-V.savedT<4000;return {slot,when:just?'Saved ✓':G&&G.savedAt?'Saved '+agoText(G.savedAt):'Not saved yet',just};}
function p5SavePin(){if(!G||G.daily)return '';const L=p5SaveLabel();
  return `<span class="savepin"><button class="btn sm ${L.just?'gold':''}" data-act="p5Save" aria-label="Save now to slot ${L.slot}">💾 Save</button><small class="nums">Slot ${L.slot} · ${esc(L.when)}</small></span>`;}
{const mm0=mMenu;mMenu=function(m){let h=String(mm0.apply(this,arguments));try{
  h=h.replace('<h2>Menu</h2>',`<h2 class="menuh">Menu ${p5SavePin()}</h2>`);
  h=h.replace(/<span class="verf">[^<]*<\/span>/,`<span class="verf">${esc(gameTitleVer())}</span>`);
  if((m&&m.tab)==='help'){const k=h.indexOf('<p class="note">Stuck, confused');if(k>=0)h=h.slice(0,k)+`<p class="note"><b>${GAME_TITLE}</b>, ${esc(String(GAME_VERSION).replace(/^Beta\s*/,''))}. The changelog is in Help / Feedback.</p>`+h.slice(k);}}catch(e){}return h;};}
ACT.p5Save=function(){if(!G||G.daily){toast('Saving is not available here.');return;}P5S.manual=1;let ok=false;try{ok=saveGame();}finally{P5S.manual=0;}
  if(ok){V.savedT=Date.now();try{sfx('chest');}catch(e){}}render();setTimeout(()=>{if(V.modal&&V.modal.type==='menu')render();},4100);};
ACT.p5Retry=function(){ACT.p5Save();};
// the message box: fixed, pointer events off (only Retry takes taps), never focused, never re-renders the game
function p5El(){if(P5S.el&&document.body.contains(P5S.el))return P5S.el;const e=document.createElement('div');e.id='p5save';e.setAttribute('role','status');e.setAttribute('aria-live','polite');document.body.appendChild(e);
  const st=document.createElement('style');st.textContent=`#p5save{position:fixed;left:8px;top:8px;z-index:250;display:flex;gap:6px;align-items:center;font:12px/1 "Nunito",monospace;color:#f2e6c8;background:rgba(14,10,6,.82);border:2px solid #000;padding:4px 7px;pointer-events:none;opacity:0;transition:opacity .45s;white-space:nowrap;max-width:60vw}
#p5save.on{opacity:.95}#p5save.err{color:#ffb070;border-color:#5a1a0a}#p5save.ok{color:#a8ffb8}#p5save button{pointer-events:auto;font:inherit;color:#150b17;background:#ffd04a;border:2px solid #000;padding:2px 6px;cursor:pointer}
#p5save.rm{transition:none}#svicon{transition:none}
.savepin{display:inline-flex;align-items:center;gap:6px;margin-left:10px;vertical-align:middle;font-size:.8rem}.savepin small{font:400 .72rem/1.1 var(--fb,sans-serif);opacity:.85;white-space:nowrap}
.volrow .volc{display:flex;align-items:center;gap:8px;margin-top:4px}.volrow input[type=range]{flex:1;min-width:120px;accent-color:#ffd04a}.volrow input.muted{opacity:.45}.volrow .nums{min-width:3.2em;text-align:right}.volh{margin:6px 0 2px}`;
  document.head.appendChild(st);P5S.el=e;return e;}
// where it may sit: a top corner of the game view that misses the minimap, weather and time chips, the location banner, pads and battle bars
const P5_AVOID='#bbossbar,.wbar .btn,#mmap,.mmap,.wchip,#wkw,#wloc.on,.joy,#joy,.abtns,.pad .abtn,.bossbar,.bbar,.skytags,.btags,.wxtag,.blog,.blogbtn,.unit,.order,.cmd,.bcmds,#hdr .btnrow,.mclose,.lnn';
const P5_MODAL='#modal .panel',P5_MODAL2='#modal button,#modal input,#modal h2,#modal .chips,#modal select,#modal textarea';
function p5Anchor(){const vis=e=>e&&e.getBoundingClientRect().width>0;let a=$('wcv');if(!(V.screen==='world'&&vis(a))){a=document.querySelector('#screen canvas');if(!vis(a))a=$('screen');}
  return a?a.getBoundingClientRect():{left:0,top:0,right:innerWidth,bottom:innerHeight,width:innerWidth,height:innerHeight};}
function p5Rects(sel){return [...document.querySelectorAll(sel)].filter(e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0;}).map(e=>e.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0);}
function p5Avoid(){return p5Rects(P5_AVOID);}
const p5Hit=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
function p5Place(){const e=p5El(),ic=document.getElementById('svicon'),A=p5Anchor(),w=Math.max(e.offsetWidth||0,64),h=e.offsetHeight||24,iw=ic&&!ic.classList.contains('hide')?(ic.offsetWidth||24)+4:0,W=innerWidth,Hh=innerHeight;
  const modal=!!(V.modal&&document.querySelector('#modal .panel'));const top=Math.max(4,A.top+6),cands=[];
  if(modal){cands.push([4,4],[W-4-w-iw,4],[4,Hh-4-h],[W-4-w-iw,Hh-4-h]);}
  for(let dy=0;dy<=168;dy+=28){cands.push([A.left+6,top+dy]);cands.push([A.right-6-w-iw,top+dy]);}
  if(!modal)cands.push([4,4],[W-4-w-iw,4]);
  const fits=av=>cands.find(([x,y])=>{const r={left:x,top:y,right:x+w+iw,bottom:y+h};return r.left>=0&&r.right<=W&&r.top>=0&&r.bottom<=Hh&&!av.some(b=>p5Hit(r,b));});
  const hard=p5Avoid();let pos=fits(modal?hard.concat(p5Rects(P5_MODAL)):hard)||(modal?fits(hard.concat(p5Rects(P5_MODAL2))):null)||cands[0];
  if(ic){ic.style.left=Math.round(pos[0])+'px';ic.style.top=Math.round(pos[1])+'px';ic.style.bottom='auto';}
  e.style.left=Math.round(pos[0]+iw)+'px';e.style.top=Math.round(pos[1])+'px';P5S.pos=pos;}
function p5Msg(state){const e=p5El(),rm=typeof reducedMotion==='function'&&reducedMotion();e.classList.toggle('rm',!!rm);
  clearTimeout(P5S.t2);clearTimeout(P5S.t3);P5S.state=state;
  const slot=(META.slot||0)+1;
  if(state==='saving'){e.className='on'+(rm?' rm':'');e.textContent='Saving…';}
  else if(state==='saved'){e.className='on ok'+(rm?' rm':'');e.textContent=P5S.manualShown?`Saved to slot ${slot}`:'Saved';}
  else{e.className='on err'+(rm?' rm':'');e.innerHTML='Could not save <button type="button" data-act="p5Retry">Retry</button>';}
  p5Place();
  if(state!=='saving')P5S.t2=setTimeout(()=>{e.classList.remove('on');P5S.t3=setTimeout(()=>{if(!e.classList.contains('on'))P5S.state='';},SAVE_UI.fade);},state==='err'?SAVE_UI.hold*3:SAVE_UI.hold);}
function p5Saved(ok,manual){const now=Date.now();P5S.manualShown=!!manual;
  if(!ok){clearTimeout(P5S.t1);p5Msg('err');P5S.shownAt=now;return;}
  if(!manual&&P5S.state&&P5S.state!=='err'&&now-P5S.shownAt<SAVE_UI.minGap+SAVE_UI.hold){if(P5S.state==='saved')p5Msg('saved');return;}// a burst of autosaves shares one message
  P5S.shownAt=now;p5Msg('saving');clearTimeout(P5S.t1);P5S.t1=setTimeout(()=>p5Msg('saved'),SAVE_UI.saving);}
{const sg=saveGame;saveGame=function(){const r=sg.apply(this,arguments);try{if(G&&!G.daily&&document.body)p5Saved(!!r,!!P5S.manual);}catch(e){}return r;};}
// the cloud chip (saves.js #svicon) moves out of the bottom left corner, where it sat on the movement pad, to sit beside the message
{const i0=svIcon;svIcon=function(){const r=i0.apply(this,arguments);try{const n=performance.now();if(P5S.state||n-(P5S.placed||0)>400){P5S.placed=n;p5Place();}}catch(e){}return r;};}
window.addEventListener('resize',()=>{try{p5Place();}catch(e){}});
