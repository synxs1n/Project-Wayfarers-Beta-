// Beta v0.4.3: each item on the list. Old behaviour noted per check (these fail on v0.4.1).
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const r=await ev(async()=>{const A=__A,G=A.G,o={};
  o.ver=A.GAME_VERSION;
  // dead heroes get no XP (old: 60% share)
  A.startBattle({stage:0,kind:'field',weather:'clear'});const dead=A.B.front[1];dead.hp=0;const x0=dead.xp,lv0=dead.lv,live=A.B.front[0],y0=live.xp;A.B.en.forEach(e=>e.hp=0);A.win();
  o.deadXp=dead.xp===x0&&dead.lv===lv0;o.liveXp=live.xp!==y0||live.lv>1;A.V.modal=null;A.finishBattle('win');G.roster[dead.id].hp=1;
  // travel packs vary (old: always 2 potions and an ether)
  const seen=new Set();for(let i=0;i<20;i++){G.inv={};seen.add(A.packContents());}o.packs=seen.size;
  // rivals: one per hero, all names different (old: a random realm beast)
  const ids=A.RAW.map(r=>r[0]).filter(id=>!A.TPL[id].mon);const rn=ids.map(id=>A.MON['rv_'+id]&&A.MON['rv_'+id].n);o.rivals=rn.every(Boolean)&&new Set(rn).size===ids.length;
  // minibosses: a journey deals designs without repeats (old: the same few realm beasts)
  G.miniPick={};const mins=[];for(let i=0;i<12;i++)mins.push(A.miniFor({id:'k'+i,s:i%5}).name);o.miniUniq=new Set(mins).size===12;
  // auto pays 60% (old 75%), encounter rates lower, 8 steps minimum
  o.autoRew=A.AUTO_REW;o.enc=JSON.stringify(A.ENC_RATE);o.minSteps=A.ENC_MIN_STEPS;
  // detonator notes
  const det=A.classSkills(A.TPL.mira).concat(A.classSkills(A.TPL.brann)).find(s=>s&&s.role==='det');A.startBattle({stage:1,kind:'field',weather:'clear'});const e=A.B.en[0];o.detNone=A.detLive(det)==='';const rx=Object.values(A.REACT).find(R=>A.skEls(det).includes(R.d));e.primed={el:rx.p,t:2};o.detNote=/Can set off/.test(A.detLive(det));A.finishBattle('x');
  // stick measured against the bestiary list
  const sc=A.stickCount();o.stickAll=sc.all;o.bestAll=new Set(A.bestAll().map(q=>q.d&&q.d.n)).size;
  // capes: a fourth slot, sold with armor, adds stats, shows on the hero, saves, auto-equip uses it
  const stock=A.shopStock('armor');o.capeShop=stock.some(id=>/^k_cape_/.test(id));
  const c=G.roster[G.party[0]];const hp0=A.calcStats(c).mhp,k0=A.lookKey(c.id),b0=JSON.stringify(A.heroLook(c.id));G.gear.push('k_cape_1');c.eq.k='k_cape_1';c.S=A.calcStats(c);o.capeHp=c.S.mhp>hp0;o.capeLook=A.lookKey(c.id)===k0&&JSON.stringify(A.heroLook(c.id))===b0;// v0.6.3: capes no longer show on the hero
  o.capeSave=A.packG().roster[c.id].eq.k==='k_cape_1';c.eq.k=null;A.ACT.autoEqParty&&A.ACT.autoEqParty();o.capeAuto=G.party.some(id=>G.roster[id].eq.k);A.V.modal=null;
  // tempering lists only temperable gear, highest rarity first
  G.gear.push('w_blade_0','w_blade_3','a_mail_2+3');A.V.modal={type:'smithy',tab:'temper'};const h=A.vTemper();o.temperFull=!/a_mail_2\+3|Fully tempered/.test(h);
  const order=[...h.matchAll(/class="row rec tr[^"]*" style="--tc:([^;]+)/g)].length;o.temperRows=order;
  return o;});
console.log(JSON.stringify(r));
chk('version is Beta v0.4.3',r.ver==='Beta v0.4.3');
chk('fallen heroes earn no XP, the living still do',r.deadXp&&r.liveXp);
chk('travel packs roll different contents',r.packs>=8);
chk('every hero has a rival of their own with a unique name',r.rivals===true);
chk('a journey never repeats a miniboss design (first 12 sites)',r.miniUniq===true);
chk('auto pays 66%, encounters rarer, 8 steps between battles',r.autoRew===.66&&r.enc==='{"off":0,"low":0.05,"normal":0.095,"high":0.14}'&&r.minSteps===8);
chk('a detonator hints only when a foe is primed for it right now',r.detNone===true&&r.detNote===true);
chk("the Tamer's Stick counts against the Bestiary list",r.stickAll===r.bestAll);
chk('capes: sold, add stats, not drawn on the hero (v0.6.3), save, auto-equip fills them',r.capeShop&&r.capeHp&&r.capeLook&&r.capeSave&&r.capeAuto);
chk('tempering hides fully tempered gear',r.temperFull===true);
// boss: you stay in the dungeon, the echo waits until you have left, and a big boss bar is shown
const b=await ev(async()=>{const A=__A,G=A.G,o={};const d=A.getMap('d0');A.placeAt('d0',d.bossAt[0],d.bossAt[1]+1,'u');A.V.screen='world';
  A.startBattle({stage:0,kind:'boss'});A.render();const bb=document.getElementById('bbossbar');o.bar=!!bb&&/Lv/.test(bb.innerHTML)&&bb.querySelector('.bbbar i')!=null;
  A.B.en.forEach(e=>e.hp=0);A.win();A.V.modal=null;A.finishBattle('win');o.stay=A.WS.m.id==='d0';o.echoHidden=!A.storyEchoUp(0);
  A.leaveDungeon(0);o.echoAfter=A.storyEchoUp(0);return o;});
console.log(JSON.stringify(b));
chk('after a boss you stay in the dungeon (old: carried out)',b.stay===true);
chk('the story echo waits until you leave the dungeon',b.echoHidden&&b.echoAfter);
chk('a big boss HP bar runs across the top of the battle screen',b.bar===true);
// Inn: the Space press that opens it does not also make you sleep
const n=await ev(async()=>{const A=__A,G=A.G,o={};A.V.modal=null;A.V.screen='world';const [x,y]=A.innSpot(0);A.placeAt('t0',x,y,'u');A.render();const g0=G.gold,c0=G.clock;
  window.dispatchEvent(new KeyboardEvent('keydown',{key:' '}));await new Promise(q=>setTimeout(q,60));
  const btn=document.querySelector('#modal [data-act="rest"]');o.open=A.V.modal&&A.V.modal.type;o.focused=document.activeElement===btn;
  // the browser turns the Space keyup on a focused button into a click
  window.dispatchEvent(new KeyboardEvent('keyup',{key:' '}));if(btn)btn.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:0}));await new Promise(q=>setTimeout(q,60));
  o.slept=G.gold!==g0;o.still=A.V.modal&&A.V.modal.type;return o;});
console.log(JSON.stringify(n));
chk('pressing Space at the Inn opens it without sleeping',n.open==='inn'&&n.slept===false&&n.still==='inn');
await done(H);})();
