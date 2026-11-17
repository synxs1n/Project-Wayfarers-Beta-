// ===== stats22.js (v0.22.17): mana that matters; spending many stat points at once =====
// Owner: "mana is not scarce enough, skills should cost more generally as you unlock more powerful skills. we want it to feel like mana pots
// are useful/needed (but not too needed) throughout the game."
// Before: a skill's MP cost was a flat number written with the skill, the party got 12% of max MP back after every win and 3% a turn, and
// max MP grows with every level, so by the second realm casters ended most fights full.
// Now:
//  1 A skill costs more the later it is learned: x (1 + MANA22.k x (learn level - 1) / 40), so a level 1 skill costs what it did, a level 21
//    skill 30% more and a level 41+ skill 60% more (MANA22.k .6). Costs of 0 (the basic attack, Limit Breaks) stay 0. The old number is kept
//    on the skill as mp0. Done once per skill, as the last classSkills hook, so it sees the final learn levels (roster17.js).
//  2 MP back after a win: 8% of max (MANA.win in config.js, was 12%). The 3% a turn stays.
//  3 The Mana Tonic restores 40 MP (was 30) and the Sage Brew 90 (was 70), so a potion is a real answer.
// The stat side of this version (what each attribute does, 2 points a level) is in data.js (deriveStats, ATK_W) and engine.js (autoAlloc,
// statMigrate). Here only the sheet's "+5" button: with 2 points a level a hero taken off automatic has many points to place.
const MANA22={k:.6,span:40,off:false};
function mana22Cost(mp,lv){if(!(mp>0))return mp;return Math.max(1,Math.round(mp*(1+MANA22.k*Math.min(1,Math.max(0,((lv||1)-1)/MANA22.span)))));}
HOOK.xform('classSkills','stats22','a skill costs more MP the later it is learned',function(L){try{if(MANA22.off||!L)return L;L.forEach(s=>{if(s&&!s._mp22&&s.mp>0){s._mp22=1;s.mp0=s.mp;s.mp=mana22Cost(s.mp,s.lv);}});}catch(e){}return L;});
try{ITEMS.ether.mp=40;ITEMS.ether.d='Restores 40 MP';ITEMS.sage.mp=90;ITEMS.sage.d='Restores 90 MP';}catch(e){}
// the sheet: a +5 beside each +
ACT.addPt5=function(k){const c=G&&G.roster[V.modal&&V.modal.char];if(!c||!(c.pts>0)||!ATTR.includes(k))return;const n=Math.min(5,c.pts);c.alloc[k]=(c.alloc[k]||0)+n;c.pts-=n;refresh(c);saveGame();render();};
HOOK.xform('mChar','stats22','a +5 button beside each attribute\'s +',function(h,id,edit){try{if(!edit||typeof h!=='string')return h;const c=G&&G.roster[id];if(!c)return h;
  h=h.replace(/(<h4>Attributes[\s\S]*?<\/h4>)/,'$1<p class="note s22cap">Two points a level. In one attribute, points count fully up to the hero\'s level ('+c.lv+') and half beyond it.</p>');
  return h.replace(/<button class="btn sm" data-act="addPt" data-arg="(\w+)"([^>]*)>\+<\/button>/g,(m,k,rest)=>c.pts<5?m:m+`<button class="btn sm ap5" data-act="addPt5" data-arg="${k}" aria-label="Add five points">+5</button>`);}catch(e){return h;}});
try{window.__S22={MANA22,cost:mana22Cost};}catch(e){}
