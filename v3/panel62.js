// ===== panel62.js (v0.22.62): the battle card column: foes first, groups that fold, a column that scrolls, and a choice of column or sheet =====
// Asked (a tablet screenshot): "Weaknesses not fitting enemy cards, also they looked squished, maybe add ability to scroll, as well as collapse
// groups, let's also bring in the option to have it be like the small screen with a popup or the bar on the right."
// What was wrong: the column (side48.js) is a flex column that scrolls, but its groups were allowed to shrink, so with six heroes and two foes
// every group was squeezed to fit and the last card's weakness row fell out of its frame. Now (styles: battle3.css, section D):
//  1 groups keep their own height and the column scrolls; a fade at the foot says there is more below
//  2 Foes lead the column (read every turn), then the Vanguard, then the Rearguard
//  3 a tap on a group's heading folds it to slim rows (portrait, name, a thin HP line) and back. The Rearguard starts folded. Kept in
//    META.cfg.bfold ({foes,heroes,rsv}: 1 folded, 0 open)
//  4 Settings > Battle panel: Side bar (the column wherever it fits: sideways screens from S48.minW x S48.minH, as before) or Popup (never
//    the column: the full width stage and the Party & foes sheet, as on a phone). META.cfg.bpanel ('popup' or unset); read by s48Fits.
//    A column forced onto smaller sideways screens was tried and dropped: under 560 px high they have the older wide layout, which has none.
//  5 a foe's name takes two lines before it is cut, and its weakness and resistance chips wrap inside the card
const P62={def:{foes:0,heroes:0,rsv:1},keys:['foes','heroes','rsv']};
function p62Mode(){try{const m=META.cfg.bpanel;return m==='popup'?'popup':'auto';}catch(e){return 'auto';}}
function p62Fold(k){try{const f=META.cfg.bfold;if(f&&(f[k]===0||f[k]===1))return f[k]===1;}catch(e){}return !!P62.def[k];}
ACT.p62tog=function(k){try{if(P62.keys.indexOf(k)<0)return;const f=Object.assign({},META.cfg.bfold||{});f[k]=p62Fold(k)?0:1;META.cfg.bfold=f;saveMeta();if(B)renderBattle();}catch(e){P62.err=String(e&&e.message||e);}};
function p62More(){try{const bp=document.getElementById('bparty'),bat=document.querySelector('.battle.b3');if(!bp||!bat)return;const on=bat.classList.contains('b48')&&!bat.classList.contains('b27open');
  bp.classList.toggle('p62more',on&&bp.scrollHeight-bp.scrollTop-bp.clientHeight>2);if(!bp._p62){bp._p62=1;bp.addEventListener('scroll',p62More,{passive:true});}}catch(e){}}
HOOK.after('renderBattle','panel62','card column: folded groups and the more-below fade',function(r,stageOnly){try{if(stageOnly||!B)return;
  const bat=document.querySelector('.battle.b3'),bp=document.getElementById('bparty');if(!bat||!bp)return;const on=bat.classList.contains('b48')&&!bat.classList.contains('b27open');
  bp.querySelectorAll('.pgroup').forEach(g=>{const k=g.classList.contains('foes')?'foes':g.classList.contains('rsv')?'rsv':'heroes',h=g.querySelector('h3'),fold=on&&p62Fold(k);
    g.classList.toggle('p62c',fold);if(!h)return;
    if(on){h.dataset.act='p62tog';h.dataset.arg=k;h.setAttribute('role','button');h.setAttribute('aria-expanded',fold?'false':'true');h.title=fold?'Show the full cards':'Fold to slim rows';if(!h.querySelector('.p62a'))h.insertAdjacentHTML('beforeend','<i class="p62a"></i>');}
    else{delete h.dataset.act;delete h.dataset.arg;h.removeAttribute('role');h.removeAttribute('aria-expanded');h.removeAttribute('title');}});
  p62More();}catch(e){P62.err=String(e&&e.message||e);}});
try{window.addEventListener('resize',p62More);}catch(e){}
// Settings > Battle panel
function p62Row(){try{const cur=p62Mode(),lab=[['auto','Side bar'],['popup','Popup']];
  const chips=lab.map(([k,t])=>`<button class="chip ${cur===k?'on':''}" data-act="cfg" data-arg='["bpanel","${k}"]'>${t}</button>`).join('');
  return `<div class="rows p62rows"><div class="row"><div><b>Battle panel</b><small>Where the party and foe cards sit in battle. Side bar keeps them beside the stage on a tablet or computer held sideways (a phone always uses the popup). Popup gives the stage the full width and opens the cards from the Party &amp; foes button.</small></div><div class="chips">${chips}</div></div></div>`;}catch(e){return '';}}
HOOK.xform('settingsBody','panel62','Battle panel row after Render scale',function(h){try{const row=p62Row();const m=/<div class="rows rsrows">[\s\S]*?<\/div><\/div><\/div>/.exec(h);
  if(m)return h.slice(0,m.index+m[0].length)+row+h.slice(m.index+m[0].length);return h+row;}catch(e){return h;}});
try{window.__P62={P62,mode:p62Mode,fold:p62Fold};}catch(e){}
