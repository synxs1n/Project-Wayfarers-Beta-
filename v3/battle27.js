// ===== battle27.js (v0.22.27): the battle screen on small phones: the stage first, the commands second, the cards behind one button =====
// Asked (after two mock-ups): "on smaller phone screens we want to maximize the space the battle window takes up. The next most important
// thing is the action menu ... we need a way to look at all the party and enemy info cards that doesn't take up screen space on smaller
// phones, maybe we make it a button on the action menu on smaller screens" and then "I like your mock up, make the changes."
// 0.22.27 was for upright phones only; 0.22.34 widened it to every screen but a short landscape one (see b27Fits below).
//  1 the game's top bar is hidden in a battle (its sound, help and settings buttons move to the foot of the Party & foes sheet)
//  2 the turn order shares one strip with Pause, Auto, Speed and the auto settings (they were a row of the command panel)
//  3 the stage runs edge to edge and is drawn at B27.sc (2.25, was 2; at 2.5 three foes stand on each other and a tap picks the wrong one); it takes all the height the commands do not need
//  4 Momentum, the last log line, the sky chips and the Log button float over the sky at the top of the stage
//  5 Attack, Skills, Items and Guard are four large buttons (two by two); under them one slim row: Party & foes, Scan, Switch, Flee
//  6 the party and foe cards are a sheet that slides over the commands (ACT.b27info): the cards as they were, plus Guide, sound, help, settings
const B27={minLandH:560,portW:176,landCmd:230,sc:2.25,tallMax:300,grow:0,clear:49,lineH:50,off:(()=>{try{return localStorage.getItem('aurelis-b27off')==='1';}catch(e){return false;}})()};/* the stored flag is for the tests of the classic portrait layout */
// 0.22.34 (asked: "lets update the battle menu of the bigger versions of the battle screen a bit like how we did the small one, we want the
// battle window ... to take up the majority of the screen"): the layout is no longer for phones only. Every screen uses it except a short
// landscape one (under B27.minLandH px high: a phone held sideways keeps the classic layout, the stage would be a strip). battleMode says
// 'tall' for them, and the stage scale comes from the screen: upright it aims at B27.portW logical px across (2.25 on a phone, 4.5 on a
// tablet), sideways it is the largest that leaves B27.landCmd px for the turn order and the commands (the classic 320x150 stage at up to 6x).
function b27Land(){try{const w=window.innerWidth/(typeof dsZoom==='function'?dsZoom():1),vh=b3Vh();return w>vh*1.15;}catch(e){return false;}}
function b27Fits(){try{if(B27.off)return false;return !b27Land()||b3Vh()>=B27.minLandH;}catch(e){return false;}}
// battleMode (battle.js) asks b27Fits first.
function b27On(mode){try{return !B27.off&&(mode||battleMode())==='tall'&&b27Fits();}catch(e){return false;}}
// ---- big screens (side48.js, 0.22.48): the card column beside the stage ----
const S48={w:200,minW:600,minH:600,topW:900,rise:120,lineMin:260,/* 0.22.50: minW was 1000 and sideways only; the owner: "when I say big screens I'm also talking about tablet and fold open views". From topW px wide the log line sits in the top strip; narrower, it stays floating over the stage. */off:(()=>{try{return localStorage.getItem('aurelis-s48off')==='1';}catch(e){return false;}})()};
function s48W(){try{return window.innerWidth/(typeof dsZoom==='function'?dsZoom():1);}catch(e){return 0;}}
// 0.22.51: sideways only again (the owner: "for tablets held in long mode rather than wide mode, the screen looked better however it was
// done before, wide mode is fine"). An upright tablet or fold has the phone layout: the full width stage and the Party & foes sheet.
function s48Fits(){try{if(S48.off||typeof b27Land!=='function'||!b27Land())return false;const m=typeof p62Mode==='function'?p62Mode():'auto';/* 0.22.62 Settings > Battle panel */if(m==='popup')return false;return s48W()>=S48.minW&&b3Vh()>=S48.minH;}catch(e){return false;}}
function b27Sc(bat){
  // big screens: the column is not stage
  try{if(bat&&bat.classList.contains('b48')){const w=(bat.clientWidth||window.innerWidth)-S48.w-8+12,vh=b3Vh();if(b27Land())return clamp(Math.floor(Math.min(w/320,(vh-B27.landCmd)/150)*4)/4,2,6);return clamp(Math.floor(w/B27.portW*4)/4,B27.sc,6);}}catch(e){}
  try{const w=(bat.clientWidth||window.innerWidth)+24,vh=b3Vh();
  if(b27Land())return clamp(Math.floor(Math.min(w/320,(vh-B27.landCmd)/150)*4)/4,2,6);return clamp(Math.floor(w/B27.portW*4)/4,B27.sc,6);}catch(e){return B27.sc;}}
// layoutBattle asks before it measures: marks the battle and returns the stage scale (0 = the layout's own)
function b27Mark(bat,mode){
  // big screens first (b48, and whether the log line goes in the top strip), so the stage scale below is the one beside the column
  try{const big=b27On(mode)&&s48Fits();bat.classList.toggle('b48',big);bat.style.setProperty('--b48w',S48.w+'px');bat.style.setProperty('--b48rise',S48.rise+'px');S48.live=big;S48.top=big&&s48W()>=S48.topW;B27.noLine=S48.top;}catch(e){}
  try{const on=b27On(mode);B27.live=on;bat.classList.toggle('m-tall',mode==='tall');bat.classList.toggle('b27',on);bat.classList.toggle('b27land',on&&b27Land());if(!on)bat.classList.remove('b27open');return on?b27Sc(bat):0;}catch(e){return 0;}}
// slotsFor (battle.js): on a short stage the units stand a little lower, so the tags over the highest hero stay clear of the floating line.
// b8TallPlan (battle3.js): nothing is kept back for the party cards under the stage, and the log line no longer sits there.
HOOK.xform('cmdHtml','battle27','small phones: the Party & foes button leads the second row',function(h){try{const bat=document.querySelector('.battle.b3');if(!bat||!bat.classList.contains('b27'))return h;
  if(bat.classList.contains('b48'))return h;/* big screens (0.22.48): no Party & foes command, the cards are on screen */
  return String(h).replace('<div class="menu sec">','<div class="menu sec"><button class="mi b27pf" data-act="b27info" title="Every hero and foe: health, mana, statuses, weaknesses">☰ Party &amp; foes</button>');}catch(e){return h;}});
ACT.b27info=function(){if(!B)return;B._b27=!B._b27;renderBattle();};
HOOK.after('renderBattle','battle27','small phones: top strip, floating log line and the Party & foes sheet',function(r,stageOnly){try{if(stageOnly||!B)return;
  const bat=document.querySelector('.battle.b3'),bo=document.getElementById('border'),bl=document.getElementById('bline'),bc=document.getElementById('bcmd'),bp=document.getElementById('bparty'),wrap=document.getElementById('bwrap');if(!bat||!bo||!bl||!bc||!bp||!wrap)return;
  const on=bat.classList.contains('b27');
  bl.querySelectorAll('.osky,.b27i').forEach(x=>x.remove());
  if(!on){bat.classList.remove('b27open');return;}
  if(B.over)B._b27=0;
  // 2 the auto row joins the turn order
  const ar=bc.querySelector('.autorow');if(ar){ar.querySelectorAll('button').forEach(b=>{const a=b.dataset.act,t=(b.textContent||'').trim();if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',t);
      if(a==='pause')b.textContent=/resume|play/i.test(t)?'▶':'❚❚';else if(a==='speed')b.textContent=t.replace(/speed\s*/i,'');else if(a==='auto')b.innerHTML=/lock/i.test(t)?'Auto<small>locked</small>':t.replace(/^auto\s*:?\s*/i,'Auto ').trim();});bo.appendChild(ar);}
  // 4 the sky chips and a small Party & foes button (always there, also while foes act) sit on the floating line
  const os=bo.querySelector('.osky');if(os)bl.insertBefore(os,bl.firstChild);
  const ib=document.createElement('button');ib.className='blogbtn b27i';ib.dataset.act='b27info';ib.setAttribute('aria-label','Party and foes');ib.textContent='☰';bl.appendChild(ib);
  bat.style.setProperty('--b27t',(wrap.offsetTop+8)+'px');
  // 6 the sheet
  bat.classList.toggle('b27open',!!B._b27);
  let sh=bat.querySelector(':scope>.b27shade');if(!sh){sh=document.createElement('div');sh.className='b27shade';sh.dataset.act='b27info';bat.appendChild(sh);}
  if(B._b27){const root=B.mode==='cmd'&&B.menu==='root'&&!B.auto;
    bp.insertAdjacentHTML('afterbegin','<div class="b27sh"><b>Party &amp; foes</b><button class="btn sm" data-act="b27info" aria-label="Close">✕ Close</button></div>');
    bp.insertAdjacentHTML('beforeend',`<div class="b27sf">${root?'<button class="btn sm" data-act="cmd" data-arg="guide">Guide</button>':''}<button class="btn sm" data-act="mute" aria-label="Sound">🔊 Sound</button><button class="btn sm" data-act="fbOpen" aria-label="Help and feedback">? Help</button><button class="btn sm" data-act="settings" aria-label="Settings">⚙ Settings</button></div>`);}
}catch(e){B27.err=String(e&&e.message||e);}});
// the styles: battle3.css, section B
// a turned tablet or a resized window mid battle: the stage scale changes with the screen, so the stage is fitted again from scratch (the
// resize pass of battle3.js only refits the classic wide layout; without this the stage kept a default 85 logical px, v211a)
{let t=0;window.addEventListener('resize',()=>{try{if(!B27.live||typeof V==='undefined'||V.screen!=='battle'||!B)return;clearTimeout(t);t=setTimeout(()=>{try{if(V.screen!=='battle'||!B)return;BL.fitH=0;B._b8fit=0;B._b8vh=0;layoutBattle();renderBattle();}catch(e){}},60);}catch(e){}});}
// While a panel floats over the stage (a list, or the Party & foes sheet) the GL backdrop is drawn every frame. hbFrame skips a frame that is
// the same as the last, and the canvas does not keep its picture (no preserveDrawingBuffer): when the browser composes the stage again under
// the new panel it has nothing to show, and the backdrop went black (0.22.42, seen on phones on a first turn).
HOOK.after('renderBattle','battle27','is a panel floating over the stage',function(r,stageOnly){try{if(stageOnly)return;const bat=document.querySelector('.battle.b3');B27.cover=!!(bat&&bat.classList.contains('b27')&&(bat.classList.contains('b3list')||bat.classList.contains('b27open')));
  const bc=document.getElementById('bcmd'),k=bat&&bat.classList.contains('b3list')?(B.menu||'')+'|'+(B.cur&&B.cur.id||''):'';if(bc&&k&&bc._b27k!==k){bc.scrollTop=0;const z=()=>{try{if(bc._b27k===k)bc.scrollTop=0;}catch(e){}};requestAnimationFrame(()=>{z();requestAnimationFrame(z);});/* the focus on the first entry scrolls the panel a row down; a newly opened list starts at its top */}if(bc)bc._b27k=k;if(typeof HB!=='undefined')HB.redraw=1;}catch(e){}});
HOOK.before('battleFrame','battle27','keep the backdrop drawn under a floating panel',function(){try{if(B27.cover&&typeof HB!=='undefined')HB.redraw=1;}catch(e){}});
try{window.__B27={B27,on:b27On};}catch(e){}
