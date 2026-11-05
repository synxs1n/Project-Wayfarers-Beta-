// v0.6.3 New Game+ modifiers (twists.js). Checks: the picker shows only when starting New Game+, nothing is picked by default, at most
// two; the choice is stored in G.ngMods and survives save and load (and an export code); an old save without the field loads with none;
// the save card, the header and Menu > Journey show them; each modifier really changes its rule (measured); layouts fit at 390x844 and
// 933x705; no page errors. Usage: PWHTML=../../out/aurelis3.html node v063wb.js
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:390,h:844,mobile:true});const {ev,wait,page}=H;
// ----- 1. picker, defaults, limit, storage -----
const p=await ev(()=>{const A=__A,o={};A.META.cfg.hints=false;
  // a first journey has no picker
  A.ACT.new();A.V.modal=null;A.render();o.firstPicker=!!document.querySelector('.ngpick');
  ['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk&&A.ACT.storyOk();A.V.modal=null;o.firstMods=A.G.ngMods===undefined;A.saveGame();
  // New Game+: picker shown, none picked
  A.META.cycles=1;A.META.legacy=[];A.ACT.startNG();A.render();o.ngPicker=document.querySelectorAll('.ngpick .ngmod').length;o.none=document.querySelectorAll('.ngpick .ngmod.in').length===0;
  A.ACT.ngMod('brutal');A.ACT.ngMod('iron');A.ACT.ngMod('elites');o.capped=A.V.ngMods.join(',');A.render();o.shownIn=document.querySelectorAll('.ngpick .ngmod.in').length;
  A.ACT.ngMod('brutal');A.ACT.ngMod('elites');o.swapped=A.V.ngMods.join(',');
  A.V.pick=[];(A.V.starterOpts&&A.V.starterOpts.length?A.V.starterOpts:A.STARTERS).slice(0,3).forEach(id=>A.ACT.pickS(id));A.META.slot=1;A.ACT.begin();A.ACT.storyOk&&A.ACT.storyOk();A.V.modal=null;
  o.stored=(A.G.ngMods||[]).join(',');o.cycle=A.G.run.cycle;A.saveGame();
  // save and load
  const raw=JSON.parse(localStorage.getItem(A.TW.get('slotKey')(1)));o.rawMods=(raw.ngMods||[]).join(',');
  A.G=null;A.ACT.slotLoad(1);o.loaded=(A.G&&A.G.ngMods||[]).join(',');
  const code=A.TW.get('exportSave')();o.imported=(A.TW.get('importSave')(code).ngMods||[]).join(',');
  // header and journey
  A.V.modal=null;A.V.screen='world';A.render();const cyc=document.querySelector('.hdr .cyc');o.header=cyc?cyc.textContent:'';
  o.journey=A.TW.get('vJourney')();
  // save cards: slot 1 lists them, slot 0 (first journey) does not
  A.V.modal={type:'slots',mode:'load'};A.render();const rows=[...document.querySelectorAll('#modal .row')];o.card1=rows[1]?rows[1].textContent:'';o.card0=rows[0]?rows[0].textContent:'';
  A.V.modal=null;
  // an old save: no field at all
  const old=JSON.parse(localStorage.getItem(A.TW.get('slotKey')(1)));delete old.ngMods;delete old.ngDown;const g=A.TW.get('unpackG')(old);o.oldMods=A.TW.mods(g).length;o.oldName=A.TW.modNames(g);
  return o;});
console.log(JSON.stringify(Object.assign({},p,{journey:undefined})));
chk('a first journey has no modifier picker and no field',p.firstPicker===false&&p.firstMods===true||JSON.stringify(p));
chk('New Game+ shows the picker with nothing picked',p.ngPicker===5&&p.none===true||JSON.stringify(p));
chk('at most two modifiers',p.capped==='brutal,iron'&&p.shownIn===2&&p.swapped==='iron,elites'||JSON.stringify(p));
chk('the choice is stored on the journey',p.stored==='iron,elites'&&p.cycle===1||JSON.stringify(p));
chk('modifiers persist through save and load (and export codes)',p.rawMods==='iron,elites'&&p.loaded==='iron,elites'&&p.imported==='iron,elites'||JSON.stringify(p));
chk('the header shows NG+ with the modifier count',/NG\+1.*2/.test(p.header)||p.header);
chk('Menu > Journey lists each modifier with its risk and reward',/Ironman/.test(p.journey)&&/Elites everywhere/.test(p.journey)&&/\+40% XP/.test(p.journey)||'missing');
chk('the save card shows them (and not on a save without them)',/Modifiers: Ironman, Elites everywhere/.test(p.card1)&&!/Modifiers/.test(p.card0)||JSON.stringify([p.card0,p.card1]));
chk('an old save loads with no modifiers',p.oldMods===0&&p.oldName===''||JSON.stringify(p));
// ----- 2. each modifier changes its rule -----
const m=await ev(()=>{const A=__A,T=A.TW,get=k=>T.get(k),o={};const G=A.G;const set=L=>{G.ngMods=L;};
  const MON=get('MON'),mk=Object.keys(MON).find(k=>!MON[k].night&&!MON[k].mimic);
  // Foes hit harder, rewards up
  set([]);get('RNG=seeded(9)');const e0=get('makeEnemy')(MON[mk],10);const f0=get('facMul')();set(['brutal']);get('RNG=seeded(9)');const e1=get('makeEnemy')(MON[mk],10);const f1=get('facMul')();
  o.brutal=[e1.S.atk/e0.S.atk,e1.S.mag/e0.S.mag,f1.xp/f0.xp,f1.gold/f0.gold];
  // Cold inns: rest restores half of what is missing
  const inn=L=>{set(L);const c=G.roster[G.party[0]];c.hp=Math.round(c.S.mhp*.2);const before=c.hp;G.gold=99999;get('restAll')(0);return [before,c.hp,c.S.mhp];};
  o.inn=[inn([]),inn(['coldinn'])];set(['coldinn']);o.innGold=get('facMul')().gold/f0.gold;
  // Elites everywhere: a field fight gets one shielded foe with more HP
  const field=L=>{set(L);G.party.forEach(id=>{const c=G.roster[id];c.hp=c.S.mhp;});A.startBattle({stage:0,kind:'field',weather:'clear',seed:777});const r=A.B.en.map(e=>[e.maxShield||0,e.S.mhp,e.name]);A.TW.get('finishBattle')('x');A.V.modal=null;return r;};
  o.elites=[field([]),field(['elites'])];
  // Reactions only: weak hits stop chipping shields, reactions still do, and hit harder
  const chips=L=>{set(L);A.startBattle({stage:0,kind:'field',weather:'clear',seed:778});const e=A.B.en[0];e.maxShield=3;e.shield=3;e.broken=0;get('chipShield')(e,1,'weak');const a=e.shield;get('chipShield')(e,1,'reaction');const b=e.shield;
    e.primed={el:'fire',t:2};const R=get('doReaction')(A.B.front[0],e,'lightning');const r=[a,b,R?R.m:0];A.TW.get('finishBattle')('x');A.V.modal=null;return r;};
  o.react=[chips([]),chips(['react'])];
  // Ironman: a fallen hero stays down through feathers, field revives, tents and revive skills, until the inn
  set(['iron']);G.ngDown=[];G.party.forEach(id=>{const c=G.roster[id];c.hp=c.S.mhp;});A.startBattle({stage:0,kind:'field',weather:'clear',seed:779});
  const h=A.B.front[0],hid=h.id;h.hp=0;get('fallen')(h);o.downList=(G.ngDown||[]).join(',');
  A.perform(A.B.front[1],{id:'t',n:'Raise',k:'revive',pw:.5,t:'dead'},[h]);o.afterSkill=h.hp;o.target=get('allyTargetable')(h);
  A.TW.get('finishBattle')('x');A.V.modal=null;const c=G.roster[hid];G.inv.plume=2;o.feather=get('useItemField')('plume',c);o.plumeLeft=G.inv.plume;o.afterFeather=c.hp;
  get('campRest')();o.afterTent=c.hp;G.gold=99999;get('restAll')(0);o.afterInn=c.hp>0;o.downAfterInn=(G.ngDown||[]).length;
  // without Ironman the feather works
  set([]);c.hp=0;o.plainFeather=get('useItemField')('plume',c)&&c.hp>0;
  set(['iron','elites']);A.saveGame();return o;});
console.log(JSON.stringify(m));
const near=(a,b,t)=>Math.abs(a-b)<=t;
chk('Foes hit harder: +30% attack and magic',near(m.brutal[0],1.3,1e-6)&&near(m.brutal[1],1.3,1e-6)||JSON.stringify(m.brutal));
chk('Foes hit harder: +30% XP and gold',near(m.brutal[2],1.3,1e-6)&&near(m.brutal[3],1.3,1e-6)||JSON.stringify(m.brutal));
chk('Cold inns: a rest restores half of the missing HP (full without it)',m.inn[0][1]===m.inn[0][2]&&near(m.inn[1][1],m.inn[1][0]+(m.inn[1][2]-m.inn[1][0])*.5,1)&&near(m.innGold,1.5,1e-6)||JSON.stringify(m.inn));
chk('Elites everywhere: one foe gets shield pips and +50% HP',m.elites[0].every(e=>e[0]===0)&&m.elites[1].filter(e=>e[0]===2).length===1&&m.elites[1].some((e,i)=>e[0]===2&&near(e[1],m.elites[0][i][1]*1.5,1)&&/^Elite /.test(e[2]))||JSON.stringify(m.elites));
chk('Reactions only: weak hits no longer chip, reactions still do and hit 30% harder',m.react[0][0]===2&&m.react[1][0]===3&&m.react[1][1]<3&&near(m.react[1][2],m.react[0][2]*1.3,1e-9)||JSON.stringify(m.react));
chk('Ironman: the fallen hero is marked and revive skills do not lift them',m.downList.length>0&&m.afterSkill===0&&m.target===false||JSON.stringify(m));
chk('Ironman: feathers and tents do nothing (no feather used up), the inn brings them back',m.feather===false&&m.plumeLeft===2&&m.afterFeather===0&&m.afterTent===0&&m.afterInn===true&&m.downAfterInn===0||JSON.stringify(m));
chk('without Ironman a feather still revives',m.plainFeather===true);
// ----- 3. layouts -----
for(const [w,h] of [[390,844],[933,705]]){
  await page.setViewportSize({width:w,height:h});await wait(150);
  const u=await ev(()=>{const A=__A,o={};const fit=()=>document.scrollingElement.scrollWidth<=innerWidth;
    A.ACT.startNG();A.ACT.ngMod('coldinn');A.ACT.ngMod('react');A.render();o.starter=fit();
    const b=[...document.querySelectorAll('.ngpick .ngmod')];o.btns=b.every(x=>{const r=x.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.height>=40&&x.scrollWidth<=x.clientWidth+1;});
    A.V.screen='world';A.render();o.world=fit();const hd=document.querySelector('.hdr');o.hdr=hd?hd.scrollWidth<=hd.clientWidth+1:false;
    A.V.modal={type:'slots',mode:'load'};A.render();const p=document.querySelector('#modal .panel');o.slots=fit()&&!!p&&p.scrollWidth<=p.clientWidth+1;A.V.modal=null;A.render();return o;});
  await page.screenshot({path:__dirname+'/shots-v053/v063_ng_'+w+'.png'});
  chk(`${w}x${h}: starter picker, header and save cards fit`,u.starter&&u.btns&&u.world&&u.hdr&&u.slots||JSON.stringify(u));
}
await done(H);
})();
