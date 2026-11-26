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
// S48, s48W and s48Fits are in battle27.js: b27Mark marks the battle b48 and b27Sc sizes the stage beside the column there, and the
// Party & foes command is left out there too. What stays here is the placing after each render (a hook that runs after those of the
// modules loaded in between); the styles are section C of battle3.css.
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
// the styles: battle3.css, section C
try{window.__S48={S48,fits:s48Fits};}catch(e){}
