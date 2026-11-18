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
{const m0=battleMode;battleMode=function(){return b27Fits()?'tall':m0.apply(this,arguments);};}
function b27On(mode){try{return !B27.off&&(mode||battleMode())==='tall'&&b27Fits();}catch(e){return false;}}
function b27Sc(bat){try{const w=(bat.clientWidth||window.innerWidth)+24,vh=b3Vh();
  if(b27Land())return clamp(Math.floor(Math.min(w/320,(vh-B27.landCmd)/150)*4)/4,2,6);return clamp(Math.floor(w/B27.portW*4)/4,B27.sc,6);}catch(e){return B27.sc;}}
// layoutBattle asks before it measures: marks the battle and returns the stage scale (0 = the layout's own)
function b27Mark(bat,mode){try{const on=b27On(mode);B27.live=on;bat.classList.toggle('m-tall',mode==='tall');bat.classList.toggle('b27',on);bat.classList.toggle('b27land',on&&b27Land());if(!on)bat.classList.remove('b27open');return on?b27Sc(bat):0;}catch(e){return 0;}}
// on a short stage the units stand a little lower, so the tags over the highest hero stay clear of the floating line (B27.clear logical px)
{const s0=slotsFor;slotsFor=function(){const r=s0.apply(this,arguments);try{if(B27.live&&BL.mode==='tall'&&BL.H){const lo=Math.min(.62,(B27.clear+B27.lineH/(BL.sc||2.25))/BL.H);if(lo>.48)return r.map(([x,y])=>[x,+(lo+(y-.48)/.49*(.97-lo)).toFixed(4)]);}}catch(e){}return r;};}
// the room under the stage: nothing is kept back for the party cards, the log line no longer sits under the stage
{const p0=b8TallPlan;b8TallPlan=function(bat,room){if(!bat||!bat.classList.contains('b27'))return p0.apply(this,arguments);
  const pk=B8.peek,g=B8.tallGrow,mx=B8.tallMax;let add=0;try{const bl=document.getElementById('bline');add=(bl?bl.offsetHeight:40)+(parseFloat(getComputedStyle(bat).rowGap)||5);}catch(e){}
  B8.peek=0;B8.tallGrow=B27.grow;B8.tallMax=B27.tallMax;try{return p0.call(this,bat,room+add);}finally{B8.peek=pk;B8.tallGrow=g;B8.tallMax=mx;}};}
HOOK.xform('cmdHtml','battle27','small phones: the Party & foes button leads the second row',function(h){try{const bat=document.querySelector('.battle.b3');if(!bat||!bat.classList.contains('b27'))return h;
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
{const st=document.createElement('style');st.id='b27css';st.textContent=`
body:has(.battle.b3.b27) #hdr{display:none}
.battle.b3.m-tall.b27{position:relative}
.battle.b3.m-tall.b27 .order{display:flex;align-items:center;gap:6px}
.battle.b3.m-tall.b27 .order .ocs{flex:1 1 auto;min-width:0;overflow:hidden}
.battle.b3.m-tall.b27 .order .ocs>small{display:none}
.battle.b3.m-tall.b27 .order .autorow{display:flex;flex:none;gap:4px;margin:0 0 0 auto;padding:0;width:auto}
.battle.b3.m-tall.b27 .order .autorow .btn{flex:none;min-width:40px;width:auto;min-height:40px;padding:0 7px;font-size:.74rem;line-height:1.05}
.battle.b3.m-tall.b27 .order .autorow .btn small{display:block;font-size:.56rem;opacity:.8}
.battle.b3.m-tall.b27 .cmd .autorow{display:none}
.battle.b3.m-tall.b27 .bwrap{margin-left:-12px;margin-right:-12px;width:calc(100% + 24px);max-width:none}
.battle.b3.m-tall.b27>.bline{grid-area:auto;position:absolute;left:-4px;right:-4px;top:var(--b27t,62px);z-index:6;min-height:40px;padding:0 0 0 3px;gap:4px;background:rgba(8,13,26,.88);border:1px solid rgba(217,180,106,.28);border-radius:8px;overflow:hidden}
.battle.b3.m-tall.b27>.bline .osky{display:flex;flex:none;gap:2px;align-items:center}
.battle.b3.m-tall.b27>.bline .osky .wchip .wxn{display:none}
.battle.b3.m-tall.b27 .order{padding-top:2px;padding-bottom:2px;min-height:44px}
.battle.b3.m-tall.b27>.bline .osky .wchip{min-width:28px;width:28px;height:34px;min-height:34px;padding:0}
.battle.b3.m-tall.b27>.bline .osky .wchip.d{width:auto;padding:0 4px;font-size:.62rem}
.battle.b3.m-tall.b27>.bline .b4mo{min-height:40px;margin:0;min-width:74px;max-width:74px;padding:3px 5px}
.battle.b3.m-tall.b27>.bline .b4mo .b4mt b{font-size:.5rem;letter-spacing:0}
.battle.b3.m-tall.b27>.bline .blog p{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:.74rem;line-height:1.15}
.battle.b3.m-tall.b27>.bline .blogbtn{min-height:40px;min-width:40px;padding:0 6px;font-size:.72rem;border-radius:0}
.battle.b3.m-tall.b27>.bline .blogbtn.b27i{font-size:1rem;border-left:1px solid rgba(217,180,106,.28)}
.battle.b3.m-tall.b27 .cmd .menu.prim{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.battle.b3.m-tall.b27 .cmd .menu.prim .mi{min-height:48px;font-size:1.06rem}
.battle.b3.m-tall.b27 .cmd .menu.sec{display:flex;flex-wrap:wrap;gap:5px}
.battle.b3.m-tall.b27 .cmd .menu.sec .mi{flex:1 1 56px;min-width:0;min-height:40px}
.battle.b3.m-tall.b27 .cmd .menu.sec .mi.b27pf{order:-1;flex:1.7 1 118px;white-space:nowrap;border-color:#a48bff;background:linear-gradient(#34296a,#231c4b);color:#fff}
.battle.b3.m-tall.b27 .cmd .menu.sec .mi[data-arg="guide"]{display:none}
.battle.b3.m-tall.b27 .bbottom .pgroup,.battle.b3.m-tall.b27 .bbottom .b8fl,.battle.b3.m-tall.b27 .bbottom .b3pty{display:none}
.battle.b3.m-tall.b27 .bban{top:54px}
.battle.b3.m-tall.b27 .cmd{padding-top:5px;padding-bottom:6px}
.battle.b3.m-tall.b27 .who.cmdhead{padding:0 0 3px}
.battle.b3.m-tall.b27 .cmd .menu.prim{gap:5px}
.battle.b3.m-tall.b27 .cmd .menu.prim .mi{min-height:44px}
.battle.b3.m-tall.b27 .who.cmdhead .cmdback{min-height:34px;height:34px;padding-top:0;padding-bottom:0}
.battle.b3.m-tall.b27 .who.cmdhead{min-height:0}
@media (min-width:700px){
.battle.b3.m-tall.b27 .cmd .menu.prim{grid-template-columns:repeat(4,minmax(0,1fr))}
.battle.b3.m-tall.b27 .cmd .menu.prim .mi{min-height:52px}
.battle.b3.m-tall.b27 .cmd .menu.sec .mi.b27pf{flex:1 1 160px}
.battle.b3.m-tall.b27.b27open .bbottom .bparty{left:auto;top:0;bottom:0;width:min(440px,92%);max-height:none;border-top:0;border-left:2px solid #a48bff;border-radius:16px 0 0 16px}
}
.battle.b3 .b27shade{display:none}
.battle.b3.m-tall.b27.b27open .b27shade{display:block;position:fixed;inset:0;z-index:69;background:rgba(4,7,15,.55)}
.battle.b3.m-tall.b27.b27open .bbottom .bparty{display:flex;flex-direction:column;gap:8px;position:fixed;left:0;right:0;bottom:0;max-height:78%;overflow-y:auto;overscroll-behavior:contain;z-index:70;box-sizing:border-box;background:#0f1930;border-top:2px solid #a48bff;border-radius:16px 16px 0 0;padding:10px 12px calc(12px + env(safe-area-inset-bottom,0px))}
.battle.b3.m-tall.b27.b27open .bbottom .b3pty{display:flex;flex-direction:column;gap:8px;order:1}
.battle.b3.m-tall.b27.b27open .bbottom .pgroup{display:block;order:2}
.battle.b3.m-tall.b27.b27open .bbottom .pgroup>h3{display:block;margin:0 0 4px}
.battle.b3.m-tall.b27.b27open .bbottom .pgroup.heroes .pcs,.battle.b3.m-tall.b27.b27open .bbottom .pgroup.rsv .pcs{grid-template-columns:minmax(0,1fr)}
.battle.b3.m-tall.b27.b27open .bbottom .fcs{grid-template-columns:minmax(0,1fr)}
.b27sh{order:0;display:flex;align-items:center;justify-content:space-between;font-size:1rem}
.b27sf{order:3;display:flex;flex-wrap:wrap;gap:6px}
.b27sf .btn{flex:1 1 70px;min-height:40px}
`;document.head.appendChild(st);}
try{window.__B27={B27,on:b27On};}catch(e){}
