// ===== side48.js (v0.22.48): big screens: the party and foe cards are always on, in a slim column beside the stage =====
// Asked (after three rounds of mock-ups, the owner picked "A2", the slimmest): the older side column of cards back on big screens, 200 px
// wide, with the card's info stacked (the HP bar over the MP bar, the numbers inside the bars, the Limit gauge a thin gold line), so the
// battle window stays big; and "move the bar with the weather and action history all the way to the top next to the turn order".
// Phones and small windows are untouched (battle27.js as it was). On a screen at least S48.minW wide and S48.minH high, in the b27 layout:
//  1 the battle grid gets a second column (S48.w px). #bparty (the cards the Party & foes sheet shows) is laid over it: Vanguard, reserves,
//    Foes. The stage and the commands keep the first column; layoutBattle measures the narrower stage by itself (b27Mark runs first).
//  2 the cards are restyled by CSS only (battleui.js markup): portrait, name, level, element; HP over MP with label and numbers inside
//    the bar; the Limit gauge a 3 px line; status tags under the card. No info button: a tap on a card opens the details (ACT.tgtA / tgtE
//    do that whenever no target is being picked).
//  3 the floating line (sky chips, Momentum, last log line, Log, the ☰ sheet button) leaves the stage and sits in the top strip between
//    the turn order and Pause / Auto / Speed. Nothing floats over the stage, so the units are not pushed down to clear it (B27.noLine).
//  5 a list (skills, items) stays in the box under the stage, one skill per row with all its info along the row (see the CSS)
//  4 the wide "☰ Party & foes" command is gone here (the cards are on screen); the ☰ on the top strip still opens the sheet for the
//    full cards, Guide, sound, help and settings.
// Off switch for tests: the stored flag aurelis-s48off (pw.js CLASSIC).
const S48={w:200,minW:600,minH:600,topW:900,lineMin:260,/* 0.22.50: minW was 1000 and sideways only; the owner: "when I say big screens I'm also talking about tablet and fold open views". From topW px wide the log line sits in the top strip; narrower, it stays floating over the stage. */off:(()=>{try{return localStorage.getItem('aurelis-s48off')==='1';}catch(e){return false;}})()};
function s48W(){try{return window.innerWidth/(typeof dsZoom==='function'?dsZoom():1);}catch(e){return 0;}}
function s48Fits(){try{if(S48.off)return false;return s48W()>=S48.minW&&b3Vh()>=S48.minH;}catch(e){return false;}}
{const m0=b27Mark;b27Mark=function(bat,mode){let on=false;try{on=b27On(mode)&&s48Fits();bat.classList.toggle('b48',on);bat.style.setProperty('--b48w',S48.w+'px');S48.live=on;S48.top=on&&s48W()>=S48.topW;B27.noLine=S48.top;}catch(e){}return m0.apply(this,arguments);};}
// the stage scale: the column is not stage
{const s0=b27Sc;b27Sc=function(bat){try{if(bat&&bat.classList.contains('b48')){const w=(bat.clientWidth||window.innerWidth)-S48.w-8+12,vh=b3Vh();if(b27Land())return clamp(Math.floor(Math.min(w/320,(vh-B27.landCmd)/150)*4)/4,2,6);return clamp(Math.floor(w/B27.portW*4)/4,B27.sc,6);}}catch(e){}return s0.apply(this,arguments);};}
HOOK.xform('cmdHtml','side48','big screens: no Party & foes command (the cards are on screen)',function(h){try{const bat=document.querySelector('.battle.b3');if(!bat||!bat.classList.contains('b48'))return h;
  return String(h).replace(/<button class="mi b27pf"[^>]*>[^<]*<\/button>/,'');}catch(e){return h;}});
HOOK.after('renderBattle','side48','big screens: place the card column and the top line',function(r,stageOnly){try{if(stageOnly||!B)return;
  const bat=document.querySelector('.battle.b3'),bo=document.getElementById('border'),bl=document.getElementById('bline'),wrap=document.getElementById('bwrap');if(!bat||!bo||!bl||!wrap)return;
  if(!bat.classList.contains('b48')){bat.classList.remove('b48top');return;}
  bat.style.setProperty('--b48t',wrap.offsetTop+'px');
  // the command box keeps the root menu's height while a list is open (the list scrolls inside it)
  try{const bc=document.getElementById('bcmd');if(bc&&!bat.classList.contains('b3list')&&bc.offsetHeight>80)bat.style.setProperty('--b48ch',bc.offsetHeight+'px');}catch(e){}
  // the line between the last turn token and the Pause / Auto / Speed buttons
  const ocs=bo.querySelector('.ocs'),ar=bo.querySelector('.autorow'),last=ocs&&[...ocs.children].filter(e=>e.offsetWidth>0).pop();
  const L=last?last.offsetLeft+last.offsetWidth+10:bo.offsetLeft+8,R=ar?ar.offsetLeft-8:bo.offsetLeft+bo.offsetWidth-8,ok=!!S48.top&&R-L>=S48.lineMin;
  bat.classList.toggle('b48top',ok);if(ok){bat.style.setProperty('--b48ll',L+'px');bat.style.setProperty('--b48lw',(R-L)+'px');bat.style.setProperty('--b48lt',(bo.offsetTop+Math.max(0,Math.round((bo.offsetHeight-40)/2)))+'px');}
}catch(e){S48.err=String(e&&e.message||e);}});
{const st=document.createElement('style');st.id='s48css';const T='.battle.b3.m-tall.b27',S=T+'.b48',P=S+':not(.b27open) .bbottom';st.textContent=`
${S}{grid-template-columns:minmax(0,1fr) var(--b48w,200px);grid-template-areas:"boss boss" "order order" "stage side" "line side" "bot side";column-gap:8px}
${S} .bwrap{margin-right:0;width:calc(100% + 12px)}
${S}.b48top>.bline{left:var(--b48ll);right:auto;width:var(--b48lw);top:var(--b48lt);background:rgba(8,13,26,.6)}
${S}.b48top>.bline .blog p{-webkit-line-clamp:2}
${S} .bban{top:14px}
/* 5 a list (skills, items, the swap list) stays in the command box under the stage: it covers neither the battle nor the cards (0.22.42 raised
   it over the stage). The turn line, Back and the filters share one row; under them the skills are boxes side by side (0.22.49: the owner
   prefers "the more boxy style with skills next to each other" to 0.22.48's one line rows), each with everything it showed before (name,
   target, purpose, kind, role, text, weapon line, what it is strong against, estimate, power, cost) in three short lines. The box keeps the height the root menu had (--b48ch) and the list scrolls inside. */
${S}.b48top.b3list .bbottom .cmd{display:flex;flex-wrap:wrap;align-items:center;align-content:flex-start;gap:4px 8px;position:static;margin:0;width:auto;height:var(--b48ch,154px);max-height:var(--b48ch,154px);overflow:hidden;padding:5px 8px 6px;background:linear-gradient(#171c3a,#10142a);border:1px solid rgba(217,180,106,.35);border-radius:8px;box-shadow:none;z-index:auto;box-sizing:border-box}
${S}.b48top.b3list .cmd>.who.cmdhead{order:1;flex:0 0 auto;padding:0;min-height:0;gap:8px}
${S}.b48top.b3list .cmd>.who.cmdhead .port{display:none}
${S}.b48top.b3list .cmd>.chips{order:2;flex:1 1 200px;margin:0;display:flex;flex-wrap:nowrap;gap:4px;overflow-x:auto;scrollbar-width:none}
${S}.b48top.b3list .cmd>.a49vs{order:2;flex:0 1 auto;padding:0;font-size:.64rem;max-width:330px;line-height:1.15}
${S}.b48top.b3list .cmd>.menu.list{order:3;flex:1 1 100%;min-height:0;align-self:stretch;height:calc(var(--b48ch,154px) - 52px);display:grid;grid-template-columns:repeat(auto-fill,minmax(236px,1fr));grid-auto-rows:min-content;gap:4px 5px;align-content:start;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;padding-right:2px}
${S}.b48top.b3list .cmd>:not(.who):not(.chips):not(.menu):not(.a49vs){order:4;flex:1 1 100%}
/* a screen with the card column but too narrow for the line in the top strip (an opened fold, a tablet held upright): the list is the
   rising panel of the phones, kept to the stage's side so the cards stay in view; the floating line keeps to the stage too */
${S}:not(.b48top).b3list .bbottom .cmd{left:4px;right:calc(var(--b48w,200px) + 24px);border:2px solid #33466f;border-bottom:0;border-radius:10px 10px 0 0}
${S}:not(.b48top)>.bline{right:calc(var(--b48w,200px) + 8px)}
/* 0.22.50: the boxes are the same on every screen (the owner: "the skills should be presented in a clean similar way on every screen size").
   On a phone the list is still the panel that rises over the stage (battle27.js), with one or two boxes across. */
${T}.b3list .menu.list{display:grid;grid-template-columns:repeat(auto-fill,minmax(236px,1fr));grid-auto-rows:min-content;gap:4px 5px;align-content:start}
${T}.b3list .cmd>.a49vs{font-size:.66rem;line-height:1.2}
/* a skill is a box: name and tags with the estimate at their right; the text; then the weapon line and what it is strong against, with Power,
   kind and cost at their right. Everything the tall card showed, in three short lines. */
${T}.b3list .menu.list .mi{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1px 8px;align-items:center;align-content:start;width:100%;height:100%;min-height:0;padding:4px 8px 4px 18px;margin:0;text-align:left}
${T}.b3list .menu.list .mi>.n{grid-area:1/1;display:flex;flex-wrap:wrap;align-items:center;gap:2px 0;font-size:.86rem;line-height:1.15;min-width:0}
${T}.b3list .menu.list .mi>.m{display:contents}
${T}.b3list .menu.list .mi>.m .sk11e{grid-area:1/2;justify-self:end;white-space:nowrap}
${T}.b3list .menu.list .mi>.m .sk11l{grid-area:1/2;justify-self:end}
${T}.b3list .menu.list .mi>small{grid-area:2/1/3/3;margin:0;font-size:.7rem;line-height:1.2}
${T}.b3list .menu.list .mi>small.dk11{grid-area:4/1/5/3;justify-self:start;max-width:56%;opacity:.75;font-size:.64rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
${T}.b3list .menu.list .mi>.effs{grid-area:4/1/5/3;justify-self:end;margin:0;display:flex;flex-wrap:nowrap;gap:2px;max-width:44%;overflow:hidden}
${T}.b3list .menu.list .mi>.m .sk11s{grid-area:3/1/4/3;justify-self:start;justify-content:flex-start;gap:6px;flex-wrap:nowrap;white-space:nowrap}
${T}.b3list .menu.list .mi>.effs:empty{display:none}
${P} .bparty{display:flex;flex-direction:column;gap:12px;position:absolute;right:0;top:var(--b48t,64px);bottom:0;width:var(--b48w,200px);overflow-y:auto;overscroll-behavior:contain;padding:8px 0 4px;box-sizing:border-box;scrollbar-width:thin}
${P} .b8fl{display:none}
${P} .b3pty{display:flex;flex-direction:column;gap:12px;order:1}
${P} .pgroup{display:block;position:relative;border:1px solid rgba(217,180,106,.4);border-radius:6px;background:rgba(10,14,30,.72);padding:10px 4px 4px;margin:0}
${P} .pgroup.foes{order:2;border-color:rgba(200,80,90,.55);background:rgba(30,12,22,.72)}
${P} .pgroup>h3{display:block;position:absolute;left:8px;top:-8px;margin:0;padding:1px 6px;font-size:.56rem;letter-spacing:.14em;line-height:1.3;background:#0c1022;border:1px solid rgba(217,180,106,.4);border-radius:3px}
${P} .pgroup.foes>h3{background:#1c0c16;border-color:rgba(200,80,90,.55)}
${P} .pgroup .pcs,${P} .pgroup .fcs{display:grid;grid-template-columns:minmax(0,1fr);gap:4px}
${P} .pcw{display:block;position:relative;min-width:0}
${P} .uinfo{display:none}
${P} .pc,${P} .fc{display:grid;grid-template-columns:32px minmax(0,1fr);gap:0 6px;align-items:center;width:100%;min-height:0;padding:3px 5px;text-align:left}
${P} .pc .port{display:block;width:32px;height:32px;min-width:0;margin:0}
${P} .pc .port img{width:100%;height:100%;display:block}
${P} .fc .fci{width:30px;height:30px;object-fit:contain;justify-self:center}
${P} .pm{display:grid;grid-template-columns:minmax(0,1fr);gap:2px;min-width:0}
${P} .uct{display:flex;align-items:baseline;gap:4px;padding:0;min-width:0;font-size:.8rem;line-height:1.1}
${P} .uct b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
${P} .uct .ucl{font-size:.56rem;flex:none;opacity:.85}
${P} .uct .elbs{margin-left:auto;display:flex;gap:1px;flex:none}
${P} .uct .elb{width:12px;height:12px}
${P} .ucr{display:block;position:relative;height:11px;min-height:0}
${P} .ucr>i{position:absolute;left:3px;top:0;z-index:1;font:800 8px/11px system-ui,sans-serif;font-style:normal;color:rgba(255,255,255,.82);text-shadow:0 1px 0 #000}
${P} .ucr .bar{display:block;width:100%;height:11px;margin:0}
${P} .ucr em.nums{position:absolute;right:3px;top:0;z-index:1;font:800 9px/11px system-ui,sans-serif;font-style:normal;color:#fff;text-shadow:0 1px 0 #000,0 0 2px #000;min-width:0;width:auto}
${P} .ucr:has(.lbar){height:3px}
${P} .ucr:has(.lbar)>i,${P} .ucr:has(.lbar) em.nums{display:none}
${P} .ucr .lbar{display:block;width:100%;height:3px;margin:0;border:0}
${P} .ucc{display:none}
${P} .ptags{display:flex;flex-wrap:wrap;gap:2px 3px;padding:2px 2px 0;font-size:.56rem}
${P} .ptags:empty{display:none}
`;document.head.appendChild(st);}
try{window.__S48={S48,fits:s48Fits};}catch(e){}
