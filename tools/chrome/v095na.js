// v0.9.5 nudges (prog2.js, results.js, onboard.js; NUDGE in config.js), part 1:
// 1) manual vs auto: the same win pays the same XP and gold as the old build (OLDHTML) by hand and on auto; the rewards screen shows
//    "+52% for playing it yourself" in gold (no "Won mostly on auto" cut note) and an auto win shows the hint instead
// 2) system bonus lines (reaction, shield broken, telegraph guarded, Momentum Surge, tame) pay their share, once each, within the cap;
//    the counters come from the real battle functions (doReaction, chipShield, a Crushing Charge on a guarded hero)
// 3) auto per foe type: locked with "Beat a X by hand N more times to auto it", the toast on Auto, unlock after N hand wins with a
//    toast and a rewards line, scan unlocks, an old save (no G.autoOk) keeps access from the Bestiary, bosses keep their rule
// 4) tip cards: basics for everyone (one line actions: the primed card names a skill), expert cards only once the system was opened
// Usage (from tools/chrome): OLDHTML=<previous build> PWHTML=../../out/aurelis3.html node v095na.js
const {open,chk,done}=require('./pw');const fs=require('fs');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false,tips:true}}));
  (()=>{let s=12345;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();`;
const START=()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();try{clearInterval(__OB.OB.tick);}catch(e){}};
// a fixed fight: two foes of the first monster, frozen (no turns run), every foe beaten, then win() as manual or auto
const FIGHT=async o=>{const A=__A,G=A.G,k=Object.keys(A.MON).filter(k=>!A.MON[k].mimic)[o.mon||0];A.setPause(99999);
  const foes=[0,1].slice(0,o.n||2).map(()=>A.makeEnemy(A.MON[k],o.lv||4));A.startBattle({stage:0,kind:'field',weather:'clear',foes,seed:777});const B=A.B;
  const tot=c=>{let t=c.xp||0;for(let l=1;l<c.lv;l++)t+=Math.round(11*1.15*Math.pow(l,1.55));return t;};const x0={};G.party.forEach(id=>{x0[id]=tot(G.roster[id]);});const g0=G.gold;
  B.tP=10;B.tA=o.auto?10:0;if(o.nz&&B.nz)Object.assign(B.nz,o.nz);if(o.zero&&B.nz)Object.keys(B.nz).forEach(k=>{B.nz[k]=0;});
  B.en.forEach(e=>{e.hp=0;(B.kills=B.kills||[]).push(e);});const mr=Math.random;Math.random=()=>.5;try{A.win();}finally{Math.random=mr;}const m=A.V.modal,i=m&&m.info||{};
  const out={gold:G.gold-g0,xp:G.party.map(id=>tot(G.roster[id])-x0[id]),info:{xp:i.xp,gold:i.gold,manual:i.manual||null,autoCut:i.autoCut||null,nz:i.nz||null,autoNew:i.autoNew||null},name:B.en[0].base,
    html:document.getElementById('modal').innerHTML};
  return out;};
const CLOSE=()=>{const A=__A;A.V.modal=null;if(A.B)A.finishBattle('x');A.V.screen='world';A.render();};
(async()=>{
// ---------- 1) the same totals as the old build ----------
const runPair=async html=>{const H=await open({w:390,h:844,mobile:true,pre:PRE,html,tag:html?'old':'new'});const {ev}=H;await ev(START);
  const man=await ev(FIGHT,{zero:1});await ev(CLOSE);const aut=await ev(FIGHT,{auto:1,zero:1});await ev(CLOSE);await H.browser.close();return {man,aut};};
const OLD=process.env.OLDHTML?fs.readFileSync(process.env.OLDHTML,'utf8'):null;
const nw=await runPair(null);
if(OLD){const od=await runPair(OLD);
  chk(`a hand played win pays the same gold and XP as before (${od.man.gold} gold, ${od.man.xp.join('/')} XP)`,nw.man.gold===od.man.gold&&JSON.stringify(nw.man.xp)===JSON.stringify(od.man.xp)||JSON.stringify({old:[od.man.gold,od.man.xp],now:[nw.man.gold,nw.man.xp]}));
  chk(`an auto win pays the same gold and XP as before (${od.aut.gold} gold, ${od.aut.xp.join('/')} XP)`,nw.aut.gold===od.aut.gold&&JSON.stringify(nw.aut.xp)===JSON.stringify(od.aut.xp)||JSON.stringify({old:[od.aut.gold,od.aut.xp],now:[nw.aut.gold,nw.aut.xp]}));}
else chk('OLDHTML given for the old build comparison','set OLDHTML');
chk('auto pays AUTO_REW of the hand played XP (rounding aside)',Math.abs(nw.aut.info.xp-nw.man.info.xp*.66)<=1.01||JSON.stringify([nw.man.info.xp,nw.aut.info.xp]));
chk('the manual bonus is the gap to the auto level: base x (1/AUTO_REW) = the total',nw.man.info.manual&&nw.man.info.manual.pct===52&&nw.man.info.manual.xp===nw.man.info.xp-Math.round(nw.man.info.xp*.66)||JSON.stringify(nw.man.info));
chk('the rewards screen shows "+52% for playing it yourself" in gold',/rs-bon man"><b>\+52% for playing it yourself<\/b>/.test(nw.man.html)||nw.man.html.slice(0,300));
chk('no "Won mostly on auto" cut note any more',!/Won mostly on auto/.test(nw.man.html+nw.aut.html));
chk('an auto win shows the invitation to play it yourself, and no manual bonus line',/Won on auto/.test(nw.aut.html)&&/Play a fight yourself for \+52%/.test(nw.aut.html)&&!/for playing it yourself/.test(nw.aut.html)||nw.aut.html.slice(0,400));

const H=await open({w:390,h:844,mobile:true,pre:PRE});const {ev,wait,page}=H;await ev(START);
// ---------- 2) system bonuses ----------
let r=await ev(async F=>{const A=__A,N=__NZ,G=A.G;const f=new Function('return '+F)();
  // counters from the real functions
  A.setPause(99999);const k=Object.keys(A.MON).filter(k=>!A.MON[k].mimic)[0];A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k],4),A.makeEnemy(A.MON[k],4)]});const B=A.B,e=B.en[0],h=B.front[0];
  const o={nz0:JSON.stringify(B.nz)};e.primed={el:'fire',t:2};const R=N.doReaction(h,e,'wind');o.react=[!!R,B.nz.react];
  const f2=B.en[1];f2.maxShield=2;f2.shield=2;f2.broken=0;N.chipShield(f2,3);o.brk=B.nz.brk;N.chipShield(f2,3);o.brk2=B.nz.brk;
  h.guard=true;A.perform(e,{id:'b4charge',n:'Crushing Charge',k:'phys',pw:1,t:'one',el:null,hits:1,cost:1,mp:0},[h]);o.guard=[B.nz.tele,B.nz.guard];
  h.guard=false;A.perform(e,{id:'b4charge',n:'Crushing Charge',k:'phys',pw:1,t:'one',el:null,hits:1,cost:1,mp:0},[h]);o.guard2=[B.nz.tele,B.nz.guard];
  A.V.modal=null;A.finishBattle('x');return o;},'0');
chk('a hero reaction counts (doReaction)',r.react[0]===true&&r.react[1]===1||JSON.stringify(r));
chk('a shield breaking counts once (chipShield)',r.brk===1&&r.brk2===1||JSON.stringify(r));
chk('a Crushing Charge on a guarded hero counts, an unguarded one does not',r.guard[0]===1&&r.guard[1]===1&&r.guard2[0]===2&&r.guard2[1]===1||JSON.stringify(r));
// the lines and amounts
const base=await ev(FIGHT,{zero:1});await ev(CLOSE);
const b4=await ev(FIGHT,{nz:{react:2,brk:1,guard:1,surge:1}});await ev(CLOSE);
chk('four systems used: four lines at +5% each (+20%)',b4.info.nz&&b4.info.nz.lines.length===4&&Math.abs(b4.info.nz.pct-.20)<1e-9||JSON.stringify(b4.info.nz));
chk('the bonus pays 20% more gold than the same win without it',Math.abs(b4.gold-base.gold-Math.round(base.gold*.20))<=1||JSON.stringify([base.gold,b4.gold]));
chk('each hero gets 20% more XP from it',b4.xp.every((x,i)=>Math.abs(x-base.xp[i]-Math.round(base.xp[i]*.20))<=1)||JSON.stringify([base.xp,b4.xp]));
chk('the rewards screen lists the lines (Reaction set off, Shield broken, Guarded a telegraphed hit, Momentum Surge reached)',['Reaction set off','Shield broken','Guarded a telegraphed hit','Momentum Surge reached'].every(s=>b4.html.includes(s))&&(b4.html.match(/rs-bon sys/g)||[]).length===4||b4.html.slice(0,500));
chk('a reaction counts once per battle however many',b4.info.nz.lines.filter(l=>l.k==='react').length===1);
// tame on the rewards screen: +6% more, up to the cap
r=await ev(async()=>{const A=__A,G=A.G;const k=Object.keys(A.MON).filter(k=>!A.MON[k].mimic)[0];A.setPause(99999);A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k],4)]});const B=A.B;
  B.tP=10;B.tA=0;Object.assign(B.nz,{react:1,brk:1,guard:1,surge:1});B.en.forEach(e=>{e.hp=0;B.kills.push(e);});A.win();const i=A.V.modal.info;const g0=G.gold,p0=i.nz.pct;
  i.tame={mon:k,name:'Wild Test'};A.render();A.ACT.tame();const g1=G.gold;const h1=document.getElementById('modal').innerHTML;const p1=i.nz.pct;
  // a second tame call pays nothing more
  A.ACT.tame();const g2=G.gold;return {p0,p1,dg:g1-g0,dg2:g2-g1,base:i.nzBase.gold,tame:h1.includes('Creature tamed'),cap:/the most one battle pays/.test(h1),lines:i.nz.lines.length,tamed:i.tamed};});
await ev(CLOSE);
chk('taming adds its line and +5% (20% -> 25%, the cap)',r.tame&&Math.abs(r.p1-.25)<1e-9&&r.lines===5||JSON.stringify(r));
chk('taming pays its share of the battle gold, once',r.dg===Math.round(r.base*.05)&&r.dg2===0||JSON.stringify(r));
chk('at the cap the screen says so',r.cap===true);
r=await ev(async F=>{const A=__A,N=__NZ,S=N.NUDGE.sys,s0=S.react;S.react=.2;const f=new Function('o','return ('+F+')(o)');const x=await f({nz:{react:1,brk:1,guard:1,surge:1}});S.react=s0;return x.info.nz;},FIGHT.toString());
await ev(CLOSE);
chk('the cap holds: +20% + 5% = 25%, the systems past the cap pay nothing',Math.abs(r.pct-.25)<1e-9&&r.lines.length===2&&Math.abs(r.lines[1].p-.05)<1e-9||JSON.stringify(r));
r=await ev(FIGHT,{auto:1,nz:{react:1}});await ev(CLOSE);
chk('auto wins earn the system bonus too',r.info.autoCut&&r.info.nz&&r.info.nz.lines.length===1||JSON.stringify(r.info));

// ---------- 3) auto per foe type ----------
r=await ev(async()=>{const A=__A,N=__NZ,G=A.G;G.autoOk={};A.META.best={};const k=Object.keys(A.MON).filter(k=>!A.MON[k].mimic)[2],nm=A.MON[k].n;A.setPause(99999);
  const o={nm};A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k],4)]});o.lock=!!A.B.autoLock;o.why=N.autoReason();A.render();
  const btn=document.querySelector('[data-act="auto"]');o.btn=btn?btn.textContent:'';o.small=(document.querySelector('.autowhy')||{}).textContent||'';
  A.ACT.auto();o.toast=N.toast;o.auto=A.B.auto;A.V.modal=null;A.finishBattle('x');return o;});
chk(`a new foe type locks auto: "${r.why}"`,r.lock&&r.why===`Beat ${/^[aeiou]/i.test(r.nm)?'an':'a'} ${r.nm} by hand 3 more times to auto it`||JSON.stringify(r));
chk('the Auto button says why',r.btn==='Auto locked'&&r.small===r.why||JSON.stringify(r));
chk('pressing Auto shows the reason in a toast and keeps auto off',/^Auto is locked here: beat /.test(r.toast)&&r.auto===false||JSON.stringify(r));
r=await ev(async()=>{const A=__A,N=__NZ,G=A.G,k=Object.keys(A.MON).filter(k=>!A.MON[k].mimic)[2],nm=A.MON[k].n,out=[];A.setPause(99999);
  for(let i=0;i<3;i++){A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k],4)]});const B=A.B;const why=N.autoReason();B.tP=5;B.tA=0;B.en.forEach(e=>{e.hp=0;B.kills.push(e);});A.win();
    out.push({why,left:N.autoTypeLeft(nm),toast:N.toast,autoNew:A.V.modal.info.autoNew||null,line:/Auto unlocked against/.test(document.getElementById('modal').innerHTML)});A.V.modal=null;A.finishBattle('x');}
  A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k],4)]});const after=N.autoReason();A.V.modal=null;A.finishBattle('x');return {out,after,nm};});
chk('each hand win counts down (3, 2, 1 more)',r.out.map(o=>o.why.match(/by hand (\d)/)[1]).join()==='3,2,1'||JSON.stringify(r.out.map(o=>o.why)));
chk('the third hand win unlocks it: toast and a line on the rewards screen',r.out[2].left===0&&r.out[2].toast===`Auto unlocked against ${r.nm}.`&&r.out[2].autoNew&&r.out[2].autoNew[0]===r.nm&&r.out[2].line&&!r.out[1].line||JSON.stringify(r.out[2]));
chk('the next fight with that foe allows auto',r.after===null||r.after);
r=await ev(async()=>{const A=__A,N=__NZ,G=A.G,k=Object.keys(A.MON).filter(k=>!A.MON[k].mimic)[3],nm=A.MON[k].n;A.setPause(99999);
  // auto wins do not count
  A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k],4)]});let B=A.B;B.tP=5;B.tA=5;B.en.forEach(e=>{e.hp=0;B.kills.push(e);});A.win();const autoLeft=N.autoTypeLeft(nm);A.V.modal=null;A.finishBattle('x');
  A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k],4)]});B=A.B;B.cur=B.front[0];const w0=N.autoReason();N.scan(B.en[0]);const w1=N.autoReason(),t=N.toast;A.V.modal=null;A.finishBattle('x');
  return {autoLeft,w0:!!w0,w1,t,nm};});
chk('an auto win does not count toward the unlock',r.autoLeft===3||JSON.stringify(r));
chk('a scan unlocks that foe type at once, with a toast',r.w0&&r.w1===null&&r.t===`Scanned: auto unlocked against ${r.nm}.`||JSON.stringify(r));
r=await ev(()=>{const A=__A,N=__NZ,k=Object.keys(A.MON).filter(k=>!A.MON[k].mimic)[5],nm=A.MON[k].n;const o=JSON.parse(JSON.stringify(N.packG()));delete o.autoOk;
  A.META.best[nm]={seen:9,kills:7,scan:0,known:{}};const g=N.unpackG(o);A.G=g;const left=N.autoTypeLeft(nm),kept=!!A.G.autoOk&&A.G.autoOk[nm]>=3;
  A.setPause(99999);A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k],4)]});const why=N.autoReason();A.V.modal=null;A.finishBattle('x');
  const k2=Object.keys(A.MON).filter(k=>!A.MON[k].mimic)[6];A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k2],4)]});const why2=N.autoReason();A.V.modal=null;A.finishBattle('x');
  return {left,kept,why,why2};});
chk('an old save (no G.autoOk) keeps auto against foes its Bestiary has beaten 3+ times',r.left===0&&r.kept&&r.why===null||JSON.stringify(r));
chk('a foe the old Bestiary has not beaten enough stays locked',/^Beat /.test(r.why2||'')||JSON.stringify(r));
r=await ev(()=>{const A=__A,N=__NZ,G=A.G;G.bossWon={};A.setPause(99999);A.startBattle({stage:0,kind:'boss',weather:'clear'});const why=N.autoReason();A.V.modal=null;A.finishBattle('x');return why;});
chk('a boss keeps its own rule (win it by hand once first)',r==='Win this fight manually once first'||r);
r=await ev(()=>{const A=__A;A.V.modal={type:'autoset'};A.render();const h=document.getElementById('modal').innerHTML;A.V.modal=null;A.render();return /\+52% XP and gold over auto wins/.test(h)&&/beaten it by hand 3 times/.test(h);});
chk('Auto settings explain the bonus and the unlock',r===true||r);

// ---------- 4) tip cards ----------
r=await ev(()=>{const A=__A,O=__OB,N=__NZ,G=A.G;O.obM().s={};O.obM().u={};A.setPause(99999);
  const k=Object.keys(A.MON).filter(k=>!A.MON[k].mimic)[0];A.startBattle({stage:0,kind:'field',weather:'clear',foes:[A.makeEnemy(A.MON[k],4)]});const B=A.B,e=B.en[0];B.pturns=1;B.mode='cmd';
  const o={};e.primed={el:'fire',t:2};o.primed=N.obEval(O.TIPMAP.primed);
  // a party that knows a wind detonator: the card names the hero and the skill
  const det=A.known(B.front[0]).concat(A.known(B.front[1]||B.front[0]),A.known(B.front[2]||B.front[0])).find(s=>s.role==='det');o.det=det?det.n:null;
  o.shield=(e.maxShield=3,e.shield=3,N.obEval(O.TIPMAP.shield));e.maxShield=0;e.shield=0;
  B.nDet=1;e.reactN='Wildfire';e.reactP='fire';e.reactEl='wind';o.react=N.obEval(O.TIPMAP.react);o.react2=N.obEval(O.TIPMAP.react2);
  A.V.modal={type:'battlelore'};N.obOpened();A.V.modal=null;o.react2b=N.obEval(O.TIPMAP.react2);
  A.finishBattle('x');A.V.screen='world';return o;});
chk(`basic: the primed card is an action with a reason: "${r.primed}"`,/^(Primed with Fire: try .+'s .+ on .+\.|.+ is primed with Fire\. Try a .+ Detonator on it\.)$/.test(r.primed||'')||r.primed);
chk(`basic: the shield card says what to do: "${r.shield}"`,/Hit its weakness or set off a reaction on it to Break it\./.test(r.shield||''));
chk('basic: the first reaction card shows for everyone',!!r.react);
chk(`expert: "Reactions in depth" waits until Lore was opened, then: "${r.react2b}"`,r.react2===null&&/^Wildfire also burns\. .*Lore lists all 28\.$/.test(r.react2b||'')||JSON.stringify(r));
r=await ev(async()=>{const A=__A,O=__OB,N=__NZ,G=A.G,V=A.V;const c=G.roster[G.party[0]];G.gold=999999;G.cleared[0]=true;
  ['w','a'].forEach(sl=>{const f=c.eq[sl]&&A.forgeCost(c.eq[sl]);if(f)Object.keys(f.m).forEach(k=>{G.mats[k]=(G.mats[k]||0)+f.m[k];});});
  const o={};V.modal={type:'smithy'};o.raw=!!O.TIPMAP.temper.t();o.before=N.obEval(O.TIPMAP.temper);V.modal={type:'smithy',tab:'forge'};N.obOpened();V.modal={type:'smithy'};o.after=N.obEval(O.TIPMAP.temper);
  G.won=true;o.ef0=N.obEval(O.TIPMAP.echoforge);V.modal={type:'smithy',tab:'echo'};N.obOpened();o.ef1=N.obEval(O.TIPMAP.echoforge);G.won=false;
  V.modal=null;V.screen='world';const fi=O.facInit();fi.bonus.guild=99999;await new Promise(q=>setTimeout(q,300));o.g0=N.obEval(O.TIPMAP.guild);V.modal={type:'guild'};N.obOpened();V.modal=null;o.g1=N.obEval(O.TIPMAP.guild);fi.bonus.guild=0;
  V.screen='starter';V.ngCycle=1;o.n0=N.obEval(O.TIPMAP.ngplus);V.ngMods=[];A.ACT.ngMod(A.TW&&0||'brutal');o.n1=N.obEval(O.TIPMAP.ngplus);V.ngMods=[];V.ngCycle=0;V.screen='world';
  G.cleared[0]=false;A.render();return o;});
chk('expert: the Tempering card waits until the Tempering tab was opened once',r.raw&&r.before===null&&/^Temper what your best hitter holds first/.test(r.after||'')||JSON.stringify(r));
chk('expert: the Echoforge card waits until the Echoforge tab was opened once',r.ef0===null&&/Echoforge list/.test(r.ef1||'')||JSON.stringify(r));
chk('expert: the guild rank card waits until the Guild Hall was opened once',r.g0===null&&/^New rank with the .+! Each rank adds a perk/.test(r.g1||'')||JSON.stringify(r));
chk('expert: the New Game+ modifiers card waits until a modifier was tried',r.n0===null&&/^Modifiers last this whole cycle/.test(r.n1||'')||JSON.stringify(r));
r=await ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'settings'};A.render();const h=document.getElementById('modal').innerHTML;A.V.modal=null;A.render();return /<b>Tips<\/b>/.test(h)&&/data-act="tipsReset"/.test(h);});
chk('the Tips switch and Reset tips are still in Settings',r===true);
r=await ev(()=>{const O=__OB;return O.TIPS.filter(t=>t.sec==='Battle'&&!t.x).map(t=>t.id);});
chk('basic battle cards have no gate',r.includes('primed')&&r.includes('shield')&&r.includes('react')&&r.includes('weak')||r);
await done(H);})();
