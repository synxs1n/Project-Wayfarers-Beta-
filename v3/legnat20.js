// ===== legnat20.js (v0.22.10): every Legendary has a locked nature of their own, apart from the signature =====
// Owner: "Legendaries' natures are the same as their signatures. Give each a locked special nature that is different from the signature.
// Keep the signatures as they are." Before: a Legendary's nature was the template's trait (parthian, beastbond, twinweave, bloodpact,
// lightfingers), which is the signature's own name and text and has no stats (natInfo falls back to TRAITS, fx {}): the hero sheet said
// "Nature: Parthian Shot" above "Signature: Parthian Shot". Now each one has a nature of their own (LN20), in the same shape as the class
// natures (natures6.js: a role it leans into, rl, lifting that role's skills, and a few stat keys) but with no stat cut, and it is locked
// (a pool of one: no reroll at the Guild Hall). The signature (SIG, TRAITS, TPL.trait and everything that reads them) is unchanged.
// It is stored on the hero as c.nat like any nature (old saves get it on their next stat calc). The Daily Trial keeps template traits (natOf).
const LN20={
 kaevan:{k:'l20steppe',n:'Steppe Rider',sub:'Legendary',rl:'ranged',d:'+8% agility, +10% critical damage, actions take 3% less time. Ranged skills +14% power.',fx:{agi:1.08,critDmg:.1,tempo:.97}},
 nikaris:{k:'l20packwise',n:'Packwise',sub:'Legendary',rl:'debuffer',d:'+8% max HP, +6% accuracy, actions take 4% less time. Debuff skills +14% power.',fx:{hp:1.08,acc:.06,tempo:.96}},
 jaeson:{k:'l20stormglass',n:'Stormglass',sub:'Legendary',rl:'magic',d:'+8% magic, +8% resistance, actions take 3% less time. Magic skills +14% power.',fx:{mag:1.08,res:1.08,tempo:.97}},
 jose:{k:'l20ironblood',n:'Iron Blood',sub:'Legendary',rl:'healer',d:'+12% max HP, +8% healing. Healing skills +14% power.',fx:{hp:1.12,heal:1.08}},
 dist:{k:'l20rivercat',n:'Rivercat',sub:'Legendary',rl:'phys',d:'+8% attack, +5% critical chance, actions take 3% less time. Physical skills +14% power.',fx:{atk:1.08,crit:.05,tempo:.97}}};
try{Object.keys(LN20).forEach(id=>{const o=LN20[id];NATURES[o.k]={n:o.n,sub:o.sub,rl:o.rl,d:o.d,fx:o.fx,legend:id};});}catch(e){}
const LN20S={off:0,LN20};
const ln20Of=id=>LN20[id]?LN20[id].k:null;
// the pool: the Legendary's own nature only (locked)
{const np0=natPool;natPool=function(id){const k=ln20Of(id);if(k&&!(G&&G.daily))return [k];return np0.apply(this,arguments);};}
// every Legendary carries it (new heroes, codes, old saves): set before the stats are read
HOOK.before('calcStats','legnat20','a Legendary carries their own nature',function(c){try{const k=c&&ln20Of(c.id);if(k&&!LN20S.off&&c.nat!==k&&!(G&&G.daily))c.nat=k;}catch(e){}});
// the hero sheet says it is locked and Legendary
{const nb0=natBlock;natBlock=function(id,c){const r=nb0.apply(this,arguments);try{if(ln20Of(id)&&!(G&&G.daily))return r.replace('<small>Fixed nature.</small>','<small>Legendary nature, locked. Separate from the signature.</small>');}catch(e){}return r;};}
try{window.__LN20=LN20S;}catch(e){}
