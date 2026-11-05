// v0.3.5 Phase 5: weapon types, armor weights, perks, migration (including a real save from the v0.3.2 baseline build).
const fs=require('fs');const {open,chk,done}=require('./pw');
const OLD=fs.readFileSync(__dirname+'/../out/aurelis.html','utf8');
(async()=>{
// ---- old save from baseline
const H0=await open({w:430,h:800,mobile:true,html:OLD});
const base=await H0.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
  A.G.party.forEach(id=>{A.G.roster[id].eq.w='w_staff_1';A.G.roster[id].eq.a='a_mail_1';});A.G.gear=['w_blade_1','w_bow_0','a_robe_1','a_vest_0','w_dagger_1'];A.G.gold=555;A.saveGame();
  const k=Object.keys(localStorage).find(x=>x.startsWith('aurelis-wayfarers-v3'));return {key:k,save:localStorage.getItem(k),meta:localStorage.getItem('aurelis-meta-v1'),n:A.G.gear.length};});
await H0.browser.close();
const H=await open({w:430,h:800,mobile:true,pre:`localStorage.clear();localStorage.setItem(${JSON.stringify(base.key)},${JSON.stringify(base.save)});localStorage.setItem('aurelis-meta-v1',${JSON.stringify(base.meta)});`});
const r=await H.ev(()=>{const A=__A;const o={};A.ACT.cont();o.modal=A.V.modal&&A.V.modal.type;o.moves=(A.V.modal&&A.V.modal.moves||[]).length;
  const bad=[];A.G.party.forEach(id=>{const c=A.G.roster[id];['w','a'].forEach(sl=>{if(c.eq[sl]&&!A.canEquip(c,c.eq[sl]))bad.push(id+':'+sl);if(!c.eq[sl])bad.push(id+':empty'+sl);});});o.bad=bad;
  o.cls=A.G.party.map(id=>A.TPL[id].cls);o.gearN=A.G.gear.length;o.eq=A.G.party.map(id=>JSON.stringify(A.G.roster[id].eq));
  o.text=document.body.innerText.includes('Gear reshuffled');
  // second load: nothing more to move
  o.again=A.gearMigrate(A.G).length;
  // loadout referring to illegal gear
  return o;});
console.log(JSON.stringify(r));
chk('old save loads and shows a migration message',r.modal==='gmig'&&r.moves>0&&r.text||JSON.stringify(r));
chk('after migration every worn piece is legal and no slot is empty',r.bad.length===0||JSON.stringify(r.bad));
chk('nothing deleted: pack + worn count only grows',r.gearN>=base.n||JSON.stringify([r.gearN,base.n]));
chk('migration is idempotent',r.again===0);
// ---- rules and perks on a fresh game
const r2=await H.ev(()=>{const A=__A;const o={};const cls=Object.keys(A.CLS_WPN);
  o.fam=cls.map(k=>[k,A.CLS_WPN[k].length,A.CLS_WPN[k].every(f=>[0,1,2,3,4,5].every(t=>!!A.GEAR['w_'+f+'_'+t]))]);
  o.six=Object.keys(A.GEAR).filter(k=>/^w_(axe|greatsword|lance|mace|shortsword|longbow|knuckles|claws|qstaff|lute|harp|flute)_\d$/.test(k)).length;
  const mk=(id)=>({id,lv:10,eq:{}});const W=(id,g)=>A.canEquip(mk(id),g);
  const w=Object.keys(A.TPL).find(i=>A.TPL[i].cls==='warrior'&&!A.TPL[i].mon),m=Object.keys(A.TPL).find(i=>A.TPL[i].cls==='mage'&&!A.TPL[i].mon),mk2=Object.keys(A.TPL).find(i=>A.TPL[i].cls==='monk'&&!A.TPL[i].mon),b=Object.keys(A.TPL).find(i=>A.TPL[i].cls==='bard'&&!A.TPL[i].mon);
  o.rules=[W(w,'w_axe_2'),W(w,'w_greatsword_2'),!W(w,'w_staff_2'),!W(w,'a_robe_2'),W(w,'a_mail_2'),W(m,'a_robe_2'),!W(m,'a_mail_2'),!W(m,'w_blade_2'),W(mk2,'w_knuckles_3'),W(mk2,'w_qstaff_3'),!W(mk2,'w_blade_3'),W(b,'w_harp_1'),!W(b,'w_staff_1'),!W(mk2,'a_mail_1'),W(mk2,'a_vest_1')];
  
  // perks reach the stats
  const c={id:w,name:'T',lv:20,xp:0,eq:{w:'w_greatsword_3',a:'a_mail_3'},alloc:{},pts:0};const S1=A.calcStats(c);c.eq.w='w_blade_3';const S2=A.calcStats(c);
  o.heavy=[S1.heavy,S2.heavy,S2.critDmg>S1.critDmg-.0001];
  const l={id:mk2,name:'K',lv:20,xp:0,eq:{w:'w_knuckles_3',a:'a_vest_3'},alloc:{},pts:0};o.combo=A.calcStats(l).combo;
  const lt={id:b,name:'B',lv:20,xp:0,eq:{w:'w_harp_3',a:'a_robe_3'},alloc:{},pts:0};const St=A.calcStats(lt);o.harp=[St.healUp,St.buffT];
  // armor stats: light is faster, heavy slower
  o.armor=[A.GEAR.a_mail_3.spd,A.GEAR.a_vest_3.spd,A.GEAR.a_robe_3.spd,A.GEAR.a_mail_3.weight,A.GEAR.a_robe_3.weight,A.GEAR.a_vest_3.weight];
  o.desc=[A.gearDesc?A.gearDesc('w_lance_2'):'',A.gearDesc?A.gearDesc('a_mail_2'):''];
  A.G.stage=1;const cl=new Set(Object.values(A.G.roster).map(c=>A.TPL[c.id].cls));o.shop=A.shopStock('weapons').length;
  o.loot=new Set(Array.from({length:60},()=>A.lootBase())).size;
  return o;});
console.log(JSON.stringify(r2));
chk('every class has 2 or 3 weapon types, all 6 tiers exist',r2.fam.every(x=>x[1]>=2&&x[1]<=3&&x[2])||JSON.stringify(r2.fam));
chk('12 new weapon lines x 6 tiers',r2.six===72||r2.six);
chk('equip rules by class and weight',r2.rules.every(Boolean)||JSON.stringify(r2.rules));
chk('perks reach stats',r2.heavy[0]>0&&!r2.heavy[1]&&r2.combo>0&&r2.harp[0]>0&&r2.harp[1]===1||JSON.stringify([r2.heavy,r2.combo,r2.harp]));
chk('armor weights tagged, light faster than heavy',r2.armor[3]==='heavy'&&r2.armor[4]==='light'&&r2.armor[5]==='medium'&&r2.armor[2]>r2.armor[0]||JSON.stringify(r2.armor));
chk('item text shows type and weight',/Lance/.test(r2.desc[0])&&/Heavy armor/.test(r2.desc[1])||JSON.stringify(r2.desc));
chk('shop stocks more than the old four lines',r2.shop>=8||r2.shop);
chk('loot picks several kinds',r2.loot>=3||r2.loot);
await done(H);})();
