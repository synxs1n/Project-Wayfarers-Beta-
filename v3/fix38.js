// ===== fix38.js (v0.22.38): a hero's own relic comes first in every upgrade suggestion =====
// Reported: "Best upgrade for slot keeps suggesting one regular equipment and then suggesting the relic for that same character right after I
// equip it's suggestion, should just show me the one that's better first".
// Suggestions are ranked by where a piece ENDS (p3Ult: its score at max temper). A shop piece's end at +3 could rank over the hero's relic,
// which cannot be tempered; bought at +0 it was weaker than the relic today, so the next suggestion was the relic, and with the relic on the
// shop piece's +3 chain came back. A personal relic is meant to be the best piece for its hero (relics25.js), so:
//  1 a hero's own relic ranks above everything for that hero (p3Ult), in the per slot view and in Upgrade whole party
//  2 while a hero wears their own relic nothing is suggested for that slot (upgOpts)
function f38Own(c,id){try{const g=id&&gearOf(id);return !!(g&&g.relic&&c&&g.only===c.id);}catch(e){return false;}}
{const u0=p3Ult;p3Ult=function(c,sl,id){return f38Own(c,id)?1e9:u0.apply(this,arguments);};}
{const o0=upgOpts;upgOpts=function(c,sl){try{if(c&&c.eq&&f38Own(c,c.eq[sl]))return [];}catch(e){}return o0.apply(this,arguments);};}
try{window.__F38={own:f38Own};}catch(e){}
