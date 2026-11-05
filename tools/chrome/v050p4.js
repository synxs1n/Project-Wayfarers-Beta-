// Beta v0.5.0 phase 4: personal quests without a level gate (4.1), Guilds (4.2), XP catch up (4.3), the boss's energy message (4.4)
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
// ---------- 4.1 ----------
const p=await ev(()=>{const A=__A,G=A.G,o={},c=G.roster.mira;
  o.bt=A.PERSONAL_BT;o.realm=A.PERSONAL_REALM;
  // realm 1: never, whatever the battles
  G.stage=0;G.cleared=[false,false,false,false,false];c.bt=60;c.lv=3;
  o.r1=A.personalEligible(c);o.r1txt=A.personalLockText(c);
  A.V.modal={type:'guild',tab:'personal'};A.render();const t1=document.querySelector('#modal').innerHTML;o.r1row=/data-act="personal"/.test(t1)||/Mira:/.test(t1);o.r1note=/open in the second realm/.test(document.querySelector('#modal').innerText);
  A.V.modal={type:'char',id:'mira'};o.sheet1=A.mChar('mira',false).match(/Battles together:[^<]*/)[0];
  // second realm, not enough battles: still hidden
  G.stage=1;c.bt=39;o.r2a=A.personalEligible(c);o.r2atxt=A.personalLockText(c);A.V.modal={type:'guild',tab:'personal'};A.render();o.r2arow=/data-arg="mira"/.test(document.querySelector('#modal').innerHTML);
  // 40 battles at level 3: open (the old rule wanted level 20)
  c.bt=40;o.r2b=A.personalEligible(c);A.render();o.r2brow=/data-act="personal" data-arg="mira"/.test(document.querySelector('#modal').innerHTML);
  o.sheet2=A.mChar('mira',false).match(/Battles together:[^<]*/)[0];
  A.ACT.personal('mira');o.started=G.personal.mira&&G.personal.mira.state;A.render();o.roam=/Rival roaming/.test(document.querySelector('#modal').innerText);
  // a hero with no bt keeps the estimate (level-3)x5
  const l=G.roster.lumen;delete l.bt;l.lv=11;o.est=A.btOf(l);A.saveGame();const raw=JSON.parse(localStorage.getItem('aurelis-wayfarers-v3'));o.savedBt=raw.roster.lumen.bt;
  A.V.modal=null;return o;});
console.log(JSON.stringify(p));
chk('personal quests need 40 battles (config) and the second realm',p.bt===40&&p.realm===1);
chk('in the first realm a quest never opens, even with 60 battles',p.r1===false&&p.r1txt==='Unlocks in the second realm');
chk('in the first realm the Guild Hall shows no quest row, only a note',p.r1row===false&&p.r1note===true);
chk('hero sheet: "Battles together: 60 of 40. Unlocks in the second realm"',/Battles together: 60 of 40\. Unlocks in the second realm/.test(p.sheet1));
chk('second realm with 39 battles: hidden, lock text counts battles',p.r2a===false&&p.r2atxt==='Battles together: 39 of 40'&&p.r2arow===false);
chk('second realm with 40 battles at level 3: no level gate any more',p.r2b===true&&p.r2brow===true&&/ready at the Guild Hall/.test(p.sheet2));
chk('accepting starts it as before',p.started==='active'&&p.roam===true);
chk('a hero with no saved bt keeps the (level-3)x5 estimate',p.est===40&&p.savedBt==null);

// ---------- 4.2 ----------
const g=await ev(()=>{const A=__A,G=A.G,o={};A.V.modal={type:'menu',tab:'factions'};A.render();const m=document.querySelector('#modal');
  o.sub=A.MENU_SUB.factions+'/'+A.MENU_SUB.fmis;o.txt=m.innerText;o.html=m.innerHTML;o.tabLbl=[...m.querySelectorAll('[data-act="menuTab"]')].map(b=>b.textContent);
  A.V.modal={type:'menu',tab:'fmis'};A.render();o.fmis=document.querySelector('#modal').innerText;
  A.V.modal={type:'smithy'};A.render();const sm=document.querySelector('#modal');const fb=sm.querySelector('[data-arg="factions"]');o.strip=fb?fb.textContent:null;
  A.V.modal={type:'guild',tab:'recruit'};A.render();o.hallTab=!!document.querySelector('#modal [data-act="gtab"][data-arg="guilds"]');
  A.ACT.gtab('guilds');const gh=document.querySelector('#modal');o.hallTxt=gh.innerText;o.hallOn=(gh.querySelector('.chip.on')||{}).textContent;o.hallOthers=[...gh.querySelectorAll('[data-act="gtab"]')].length;
  o.steady=A.FACB.hand.n;o.keys=JSON.stringify(Object.keys(JSON.parse(localStorage.getItem('aurelis-wayfarers-v3'))));A.saveGame();o.fac=!!JSON.parse(localStorage.getItem('aurelis-wayfarers-v3')).fac;
  A.toast('No one is left to send, so the faction pays 400+ gold instead.');o.toast=document.getElementById('toast').textContent;
  o.jingle=A.MJINGLE.rank.name;A.V.modal=null;return o;});
console.log(JSON.stringify({sub:g.sub,tabs:g.tabLbl,strip:g.strip,hallOn:g.hallOn,steady:g.steady,toast:g.toast}));
// v0.6.3: the missions tab moved to Quests and reads Guild missions
chk('Records and Quests tabs read Guilds',g.sub==='Guilds/Guild missions'&&g.tabLbl.includes('Guilds')&&!g.tabLbl.includes('Factions'));
chk('no "faction" left in the Guilds pages',!/faction/i.test(g.txt)&&!/faction/i.test(g.fmis)&&/guild/i.test(g.txt));
chk('tab ids and save keys unchanged (data-arg factions, G.fac)',/data-arg="factions"/.test(g.html)||g.strip!==null);
chk('the shop rank strip button says Guilds and still opens the factions tab',g.strip==='Guilds');
chk('the Steady Hand is the Steady Hand Guild',g.steady==='The Steady Hand Guild'&&/The Steady Hand Guild/i.test(g.txt));
chk('Guild Hall has a Guilds tab with ranks and missions',g.hallTab&&g.hallOn==='Guilds'&&/Missions|Perks/.test(g.hallTxt)&&/Wayfarers. Guild/i.test(g.hallTxt)&&g.hallOthers>=5);// v0.6.3: five hall tabs (Personal quests and Bounties are sections of Quests)
chk('the save still writes G.fac',g.fac===true);
chk('toasts and the Music Room say guild',g.toast==='No one is left to send, so the guild pays 400+ gold instead.'&&g.jingle==='Guild rank up');

// ---------- 4.3 ----------
const x=await ev(()=>{const A=__A,G=A.G,o={};const m=A.xpCatchMul;
  o.mul=[m(10,10,true),m(9,10,true),m(7,10,true),m(5,10,true),m(1,10,true),m(8,10,false),m(1,10,false)].map(v=>+v.toFixed(3));
  // a real win: party front mira 12, lumen 9, oren 12; reserve brann 6
  G.stage=0;G.roster.brann=A.newChar('brann',6,0);G.party=['mira','lumen','oren','brann'];['mira','oren'].forEach(id=>{G.roster[id].lv=12;G.roster[id].xp=0;});G.roster.lumen.lv=9;G.roster.lumen.xp=0;G.roster.brann.xp=0;
  Object.values(G.roster).forEach(c=>{c.S=A.calcStats(c);c.hp=c.S.mhp;});
  A.startBattle({stage:0,kind:'field',weather:'clear'});const B=A.B;const xp0={};B.front.concat(B.back).forEach(c=>xp0[c.id]=c.xp);
  A.win();const info=A.V.modal.info;o.rows=info.catchup;o.txp=info.xp;
  const html=A.mResult(info);o.line=[...html.matchAll(/<b>([^<]+)<\/b>(?:<em[^>]*>[^<]*<\/em>)?<span class="rs-cu"[^>]*>\+(\d+)% catch up/g)].map(m=>m[1]+' +'+m[2]+'%').join(', ');// v0.6.1: catch up shows on each hero's row
  o.gain={};B.front.concat(B.back).forEach(c=>o.gain[c.id]=c.xp-xp0[c.id]);
  A.V.modal=null;A.finishBattle('win');A.V.modal=null;return o;});
console.log(JSON.stringify(x));
chk('catch up: +10% per level, +50% cap, top level none, reserve half',JSON.stringify(x.mul)==='[1,1.1,1.3,1.5,1.5,1.1,1.25]');
chk('the result lists who got it, not the top heroes',Array.isArray(x.rows)&&x.rows.some(r=>r.id==='lumen'&&r.pct===30)&&x.rows.some(r=>r.id==='brann'&&r.pct===25)&&!x.rows.some(r=>r.id==='mira'||r.id==='oren'));
chk('the result screen shows a Catch up line',/Lumen \+30%/.test(x.line||'')&&/Brann \+25%/.test(x.line||''));
chk('XP really moves: lumen (3 behind) gets 1.3x the top hero',x.gain.mira>0&&Math.abs(x.gain.lumen/x.gain.mira-1.3)<.03);

// ---------- 4.4 ----------
const b=await ev(async()=>{const A=__A,G=A.G,o={msgs:[],toasts:[]};A.setPause&&A.setPause(0);
  for(let s=0;s<5;s++){G.stage=s;G.cleared=[0,1,2,3,4].map(i=>i<s);A.V.modal=null;A.startBattle({stage:s,kind:'boss'});A.win();
    // Continue on the result, then the story page, like a player
    let guard=0;while(A.V.modal&&(A.V.modal.type==='result'||A.V.modal.type==='story')&&guard++<4){if(A.V.modal.type==='result')A.ACT.resultOk();else A.ACT.storyOk();}
    A.render();o.t0=1;
    // new gear popups come first, the energy message right after
    let g2=0;while(A.V.modal&&A.V.modal.type==='equipNow'&&g2++<6){A.V.modal=null;A.render();}const m=A.V.modal;o.toasts.push(document.getElementById('toast').textContent);
    o.msgs.push({s,type:m&&m.type,txt:document.querySelector('#modal').innerText.slice(0,400)});A.V.modal=null;A.render();}
  return o;});
console.log(JSON.stringify(b).slice(0,1600));
chk('every base boss (realms 1 to 4) leaves the energy message',b.msgs.slice(0,4).every(m=>m.type==='bossEnergy'&&/energy lingers here/.test(m.txt)&&/Echo/.test(m.txt)));
chk('the Calamity carries it on the Legacy choice',b.msgs[4].type==='legacy'&&/energy lingers here/.test(b.msgs[4].txt));
chk('the realm notice from the earlier build still shows',b.toasts.slice(0,4).every(t=>/breathes easier|beacon is lit/.test(t)));
await done(H);})();
