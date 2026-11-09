// v0.13.4 arena9.js: the arena is entered only from the Guild Hall, pays a tiered rare purse, the Pit Masters guild, the Guild shop section.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1280,h:800});const r=await H.ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();const G=g('G'),o={};
 G.cleared=[1,1,1,1,1];G.stage=4;G.gold=5000;
 A.V.modal={type:'menu',tab:'qarena'};A.render();o.menuEnter=document.querySelectorAll('#modal [data-act=arena]').length;o.menuNote=/Enter from the Guild Hall/.test(document.querySelector('#modal').innerText);
 A.V.modal={type:'guild',tab:'arena'};A.render();o.hallEnter=document.querySelectorAll('#modal [data-act=arena]:not([disabled])').length;o.purse=/Mythril Ore/.test(document.querySelector('#modal').innerText);
 A.V.modal={type:'guild',tab:'guilds'};A.render();const m=document.querySelector('#modal');o.cards=m.querySelectorAll('.facc').length;o.shop=!!m.querySelector('.gshop');o.shopRows=m.querySelectorAll('.gshop .row').length;o.shopBefore=m.innerHTML.indexOf('gshop')<m.innerHTML.indexOf('Ranks and perks');
 o.pit=!!g('FACB').pit&&g('FAC3').pit.n.length===5&&!!A.GEAR.c_fa6&&!!A.GEAR.c_fb6&&g('FSTOCK').pit.length===3;
 G.arena=[3,2,0,0,0];g('facDirty')();o.rep=g('facRep')('pit');o.tier=g('facTier')('pit');o.wins=g('facCount')('arena');o.hi=g('facCount')('arenaHi');
 // the win purse: a fake arena result through the win hook
 const B={spec:{kind:'arena',tier:2},result:{gold:0,notes:[]}};A.TW.set?A.TW.set('B',B):null;
 return o;});console.log(JSON.stringify(r));
  chk('the Menu\'s Arena tab has no Enter buttons and says to enter from the Guild Hall',r.menuEnter===0&&r.menuNote);
  chk('the Guild Hall arena tab lists five enterable tiers with their rare purse',r.hallEnter===5&&r.purse);
  chk('seven guilds, the Pit Masters among them, with charms and a counter',r.cards===7&&r.pit);
  chk('the Guild shop section sits before Ranks and perks with a row per counter (5 guilds have one)',r.shop&&r.shopRows===5&&r.shopBefore||JSON.stringify([r.shop,r.shopRows,r.shopBefore]));
  chk('arena standing: 3 Bronze + 2 Silver wins = 24 + 28 = 52, rank 2; counters 5 wins, 2 high',r.rep===52&&r.tier===2&&r.wins===5&&r.hi===2||JSON.stringify([r.rep,r.tier,r.wins,r.hi]));
  await done(H);})();
