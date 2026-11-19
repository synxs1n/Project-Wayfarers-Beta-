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
//  4 the wide "☰ Party & foes" command is gone here (the cards are on screen); the ☰ on the top strip still opens the sheet for the
//    full cards, Guide, sound, help and settings.
// Off switch for tests: the stored flag aurelis-s48off (pw.js CLASSIC).
const S48={w:200,minW:1000,minH:600,lineMin:260,off:(()=>{try{return localStorage.getItem('aurelis-s48off')==='1';}catch(e){return false;}})()};
function s48Fits(){try{if(S48.off||typeof b27Land!=='function'||!b27Land())return false;const z=typeof dsZoom==='function'?dsZoom():1;return window.innerWidth/z>=S48.minW&&b3Vh()>=S48.minH;}catch(e){return false;}}
{const m0=b27Mark;b27Mark=function(bat,mode){let on=false;try{on=b27On(mode)&&s48Fits();bat.classList.toggle('b48',on);bat.style.setProperty('--b48w',S48.w+'px');S48.live=on;B27.noLine=on;}catch(e){}return m0.apply(this,arguments);};}
// the stage scale: the column is not stage
{const s0=b27Sc;b27Sc=function(bat){try{if(bat&&bat.classList.contains('b48')&&b27Land()){const w=(bat.clientWidth||window.innerWidth)-S48.w-8+12,vh=b3Vh();return clamp(Math.floor(Math.min(w/320,(vh-B27.landCmd)/150)*4)/4,2,6);}}catch(e){}return s0.apply(this,arguments);};}
HOOK.xform('cmdHtml','side48','big screens: no Party & foes command (the cards are on screen)',function(h){try{const bat=document.querySelector('.battle.b3');if(!bat||!bat.classList.contains('b48'))return h;
  return String(h).replace(/<button class="mi b27pf"[^>]*>[^<]*<\/button>/,'');}catch(e){return h;}});
HOOK.after('renderBattle','side48','big screens: place the card column and the top line',function(r,stageOnly){try{if(stageOnly||!B)return;
  const bat=document.querySelector('.battle.b3'),bo=document.getElementById('border'),bl=document.getElementById('bline'),wrap=document.getElementById('bwrap');if(!bat||!bo||!bl||!wrap)return;
  if(!bat.classList.contains('b48')){bat.classList.remove('b48top');return;}
  bat.style.setProperty('--b48t',wrap.offsetTop+'px');
  // the line between the last turn token and the Pause / Auto / Speed buttons
  const ocs=bo.querySelector('.ocs'),ar=bo.querySelector('.autorow'),last=ocs&&[...ocs.children].filter(e=>e.offsetWidth>0).pop();
  const L=last?last.offsetLeft+last.offsetWidth+10:bo.offsetLeft+8,R=ar?ar.offsetLeft-8:bo.offsetLeft+bo.offsetWidth-8,ok=R-L>=S48.lineMin;
  bat.classList.toggle('b48top',ok);if(ok){bat.style.setProperty('--b48ll',L+'px');bat.style.setProperty('--b48lw',(R-L)+'px');bat.style.setProperty('--b48lt',(bo.offsetTop+Math.max(0,Math.round((bo.offsetHeight-40)/2)))+'px');}
}catch(e){S48.err=String(e&&e.message||e);}});
{const st=document.createElement('style');st.id='s48css';const S='.battle.b3.m-tall.b27.b48',P=S+':not(.b27open) .bbottom';st.textContent=`
${S}{grid-template-columns:minmax(0,1fr) var(--b48w,200px);grid-template-areas:"boss boss" "order order" "stage side" "line side" "bot side";column-gap:8px}
${S} .bwrap{margin-right:0;width:calc(100% + 12px)}
${S}.b48top>.bline{left:var(--b48ll);right:auto;width:var(--b48lw);top:var(--b48lt);background:rgba(8,13,26,.6)}
${S}.b48top>.bline .blog p{-webkit-line-clamp:2}
${S} .bban{top:14px}
/* an open list (skills, items, the swap list) rises over the stage only: the card column stays in view (the owner: "it shouldn't cover the cards on the big screen") */
${S}.b3list .bbottom .cmd{left:4px;right:calc(var(--b48w,200px) + 24px);border:2px solid #33466f;border-bottom:0;border-radius:10px 10px 0 0}
@media (min-width:700px){${S}.b3list .menu.list{grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}}
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
