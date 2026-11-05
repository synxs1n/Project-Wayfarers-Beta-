const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:430,h:800,mobile:true,out:'/tmp'});
const r=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
 const out={};const ids=Object.keys(A.TPL).filter(id=>!A.TPL[id].mon);
 out.pools=ids.map(id=>[id,A.natPool(id).length]);
 out.badPool=ids.filter(id=>{const P=A.natPool(id);const t=A.TPL[id];return !P.includes(t.trait)||P.some(k=>A.natInfo(k).n==='Unknown');});
 out.sizes=ids.filter(id=>A.TPL[id].src!=='L'&&A.TPL[id].src!=='x').map(id=>A.natPool(id).length);
 out.rolls=A.G.party.map(id=>[id,A.G.roster[id].nat,A.natPool(id).includes(A.G.roster[id].nat)]);
 // old save: no nat -> template trait
 const c=A.G.roster.mira;const keep=c.nat;delete c.nat;out.oldNat=A.natOf(c);out.oldTrait=A.TPL.mira.trait;c.nat=keep;
 // reroll prices scale
 c.lv=10;c.nrr=0;const p0=A.natRerollCost(c);c.nrr=2;const p2=A.natRerollCost(c);c.lv=30;c.nrr=0;const pl=A.natRerollCost(c);out.prices=[p0,p2,pl,A.natChooseCost(c)];
 // effect: hardy raises def over bulwark-less baseline
 c.lv=10;c.nat='sturdy';A.refresh(c);const h1=c.S.mhp;c.nat='brave';A.refresh(c);const a1=c.S.atk;c.nat='arcane';A.refresh(c);const m1=c.S.mag;c.nat='sturdy';A.refresh(c);const m0=c.S.mag;c.nat='wise';A.refresh(c);out.eff=[h1,a1,m0,c.S.mag];
 // service: reroll and choose
 A.G.gold=99999;A.V.modal={type:'guild',tab:'nature',nat:'oren'};A.render();const before=A.G.roster.oren.nat,g0=A.G.gold;A.ACT.natReroll();out.rr=[before,A.G.roster.oren.nat,g0-A.G.gold,A.G.roster.oren.nrr];
 const P=A.natPool('oren');const tgt=P.find(k=>k!==A.G.roster.oren.nat);const g1=A.G.gold;A.ACT.natChoose(tgt);out.ch=[tgt===A.G.roster.oren.nat,g1-A.G.gold];
 A.G.gold=5;const n0=A.G.roster.oren.nat;A.ACT.natReroll();out.poor=n0===A.G.roster.oren.nat;
 // pack/unpack keeps nat
 const pk=A.packG();out.packNat=pk.roster.oren.nat===A.G.roster.oren.nat&&pk.roster.oren.nrr===A.G.roster.oren.nrr;
 out.html=document.querySelector('.panel')?document.querySelector('.panel').innerText.slice(0,200):'';
 return out;});
console.log(JSON.stringify(r).slice(0,1500));
chk('every hero pool contains its original trait, all natures exist',r.badPool.length===0||JSON.stringify(r.badPool));
chk('class wayfarer pools are 3 to 5',r.sizes.every(n=>n>=3&&n<=5)||JSON.stringify(r.sizes));
chk('party rolled natures lie in their pool',r.rolls.every(x=>x[2])||JSON.stringify(r.rolls));
chk('old save without nat keeps its trait',r.oldNat===r.oldTrait||JSON.stringify([r.oldNat,r.oldTrait]));
chk('reroll price scales with rerolls and level',r.prices[1]>r.prices[0]&&r.prices[2]>r.prices[0]||JSON.stringify(r.prices));
chk('nature effects apply',r.eff[0]>0&&r.eff[3]>r.eff[2]||JSON.stringify(r.eff));
chk('reroll changes nature and charges gold',r.rr[1]!==r.rr[0]&&r.rr[2]>0&&r.rr[3]===1||JSON.stringify(r.rr));
chk('choose sets the picked nature',r.ch[0]&&r.ch[1]>0||JSON.stringify(r.ch));
chk('cannot buy without gold',r.poor===true||'changed');
chk('nature persists in save pack',r.packNat===true||'lost');
await done(H);})();
