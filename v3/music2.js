// ===== music2.js (v0.4.5): music wiring, settings, the Music Room, credits =====
// Picks the right track for wherever the party is and whatever it is fighting, sets the stems, and plays the jingles.
function au2Tr(){let v=0;try{v=typeof bossMusicOff==='function'?bossMusicOff():0;}catch(e){}v=Math.round(v)||0;return ((v+5)%12+12)%12-5;}
function au2Realm(s){try{return typeof realmAt==='function'?realmAt(s):null;}catch(e){return null;}}
function au2IsCalRealm(s){const R=au2Realm(s);return !!(R&&(R.cal||(typeof REALM_CAL!=='undefined'&&REALM_CAL.includes(R.idx))));}
function au2Night(){try{return typeof clockPhase==='function'&&!!G&&clockPhase()==='night';}catch(e){return false;}}
function au2BossLead(){if(!B||!B.en)return null;return B.en.find(e=>e.key&&typeof guardianDef==='function'&&guardianDef(e.key))||null;}
const BATTLE_IDS={battle1:1,battle2:1,elite:1,boss:1,cal1:1,cal2:1,cal3:1,arena:1};
// what should be playing right now: [id, options, stems]
function au2Want(){
  if(AU2.preview)return [AU2.preview.id,AU2.preview.opt,AU2.preview.stems||{}];
  if(V.screen==='title'||V.screen==='starter')return ['title',{},{}];
  if(V.modal&&V.modal.type==='legacy')return ['legacy',{},{}];
  if(V.screen==='battle'&&B){
    if(V.modal&&V.modal.type==='result')return ['victory',{},{}];
    if(V.modal&&V.modal.type==='lose')return ['defeat',{},{}];
    const sp=B.spec||{},tense={tense:(B.front||[]).some(c=>c.S&&c.hp<c.S.mhp*.3)};
    const lead=au2BossLead();
    if(lead){const k=String(lead.key).replace(/^echo_/,'');
      if(typeof FINALS!=='undefined'&&FINALS[k]){const f=lead.hp/Math.max(1,lead.S?lead.S.mhp:1);return [f>.66?'cal1':f>.33?'cal2':'cal3',{},{}];}
      return ['boss',{boss:k,tr:au2Tr()},{phase:!!lead.phaseDone||lead.hp<(lead.S?lead.S.mhp:1)*.5}];}
    if(sp.kind==='arena'||sp.kind==='daily')return ['arena',{},tense];
    if(sp.kind==='elite'||sp.mini||sp.roam||B.en.some(e=>e.elite))return ['elite',{tr:au2Tr()},tense];
    return [(B.stage||0)<=1?'battle1':'battle2',{tr:au2Tr()},tense];}
  if(V.screen==='world'&&WS.m){const m=WS.m;
    if(G&&G.daily)return ['arena',{},{}];
    if(m.archive)return ['archive',{},{}];
    if(m.cave)return [m.fort?'fort':'cave',{tr:au2Tr()},{}];
    if(m.kind==='dungeon')return ['dungeon',{tr:au2Tr()},{chase:!!(m.roam&&m.roam.some(r=>r.mode==='chase'))}];
    if(m.kind==='town')return ['town',{night:au2Night(),tr:au2Tr()},{}];
    const s=m.s,th=m.theme||(typeof ZS==='function'?ZS(s).theme:'meadow');
    return ['field',{theme:th,night:au2Night(),cal:au2IsCalRealm(s),bright:!!(G&&G.cleared&&G.cleared[s]),tr:au2Tr()},{}];}
  return null;}
function au2Sync(force){if(!AU2.on||!AU2.ready||!AU2.g)return;let w=null;try{w=au2Want();}catch(e){return;}if(!w)return;
  const [id,opt,stems]=w;let def;try{def=musicTrack(id,opt);}catch(e){console.warn('music',id,e);return;}if(!def)return;
  // a small room for menus, shops and inns; otherwise the track's own room
  const small=V.modal&&/^(menu|shop|inn|settings|smith|tavern)/.test(V.modal.type||'')&&V.screen==='world';au2Room(small?'room':def.room);
  if(AU2.cur&&AU2.cur.key===def.key){au2StemSet(stems);return;}
  const wasBattle=AU2.cur&&BATTLE_IDS[AU2.cur.id],isBattle=BATTLE_IDS[id];
  if(isBattle&&!wasBattle&&!AU2.preview){au2Stinger();au2Play(id,Object.assign({},opt,{fade:.35,delay:.55,stems}));}
  else if(id==='victory'||id==='defeat')au2Play(id,Object.assign({},opt,{fade:.5,delay:.1,stems}));
  else au2Play(id,Object.assign({},opt,{stems}));}
// the battle stinger: a timpani roll, a rising cymbal and a low brass hit, so battles never start with a hard cut
function au2Stinger(){const g=AU2.g;if(!g)return;const ctx=g.ctx,t=ctx.currentTime+.02,d=g.bus.music;
  au2Hit(ctx,d,'swell',t,.9);au2Hit(ctx,d,'roll',t+.05,.7);if(AU2.inst.timpani)for(let i=0;i<8;i++)au2Note(ctx,d,'timpani',45,t+i*.05,.1,.3+i*.06);
  if(AU2.inst.brass||AU2.inst.horn){const I=AU2.inst.brass?'brass':'horn';[45,52,57].forEach(m=>au2Note(ctx,d,I,m,t+.45,.35,.8));}au2Hit(ctx,d,'crash',t+.45,.7);}
// jingles from game events
function au2J(id,delay){if(!AU2.on||!AU2.ready)return false;setTimeout(()=>au2Jingle(id),delay||0);return true;}
if(typeof recruit==='function'){const r0=recruit;recruit=function(id,free){const ok=r0.apply(this,arguments);try{if(ok!==false&&V.screen==='world'&&G&&G.roster[id])au2J('recruit',120);}catch(e){}return ok;};}
if(typeof claimQuest==='function'){const c0=claimQuest;claimQuest=function(q){const r=c0.apply(this,arguments);try{if(r&&q&&q.state==='claimed')au2J('quest',80);}catch(e){}return r;};}
if(typeof ACT!=='undefined'&&ACT.facClaim){const f0=ACT.facClaim;ACT.facClaim=function(){const r=f0.apply(this,arguments);au2J('quest',80);return r;};}
{const fb0=finishBattle;finishBattle=function(how){let n0=0;try{n0=G&&G.cleared?Object.keys(G.cleared).filter(k=>G.cleared[k]).length:0;}catch(e){}const r=fb0.apply(this,arguments);
  try{const n1=G&&G.cleared?Object.keys(G.cleared).filter(k=>G.cleared[k]).length:0;if(how==='win'&&n1>n0)au2J('beacon',1400);}catch(e){}return r;};}
// faction ranks are checked once a second
function au2RankWatch(){try{if(!G||G.daily||typeof FAC==='undefined'||typeof facRank!=='function'){AU2.rk=null;return;}const n=FAC.reduce((a,F)=>a+facRank(F.id),0);
  if(AU2.rk&&AU2.rk.g===G&&n>AU2.rk.n)au2J('rank',300);AU2.rk={g:G,n};}catch(e){}}
setInterval(()=>{if(!AU2.on)return;au2Sync();au2RankWatch();},1000);
// render calls musicSync(); in orchestral mode it routes here
musicSync=(function(m0){return function(){if(AU2.on){AU.want=AU.want||'title';if(AU2.ready)au2Sync();return;}return m0.apply(this,arguments);};})(musicSync);
// ---------- settings ----------
const AMB_LV=[[0,'Off'],[.3,'Low'],[.55,'Mid'],[.8,'High']];
function au2SetStyle(st){META.cfg.mstyle=st;saveMeta();
  if(st==='chip'){if(AU2.on){au2Stop(.4);AU2.on=false;try{clearInterval(AU2.timer);}catch(e){}AU2.timer=null;if(typeof ambStop==='function')ambStop();}if(AU.ctx&&AU.want)playMusicClassic(AU.want,true);}
  else{AU2.dead=false;AU.track=null;AU.name=null;if(AU.ctx){if(AU2.g){AU2.on=true;if(!AU2.timer)AU2.timer=setInterval(()=>{au2Tick();if(typeof ambTick==='function')ambTick();},30);au2Sync(true);}else au2Start();}}}
{const sb1=settingsBody;settingsBody=function(){const h=sb1.apply(this,arguments),c=META.cfg,amb=c.amb??.3,st=c.mstyle||'orch';
  const chips=(k,vals,cur)=>`<div class="chips">${vals.map(v=>`<button class="chip ${cur===v[0]?'on':''}" data-act="${k}" data-arg="${v[0]}">${v[1]}</button>`).join('')}</div>`;
  const extra=`<div class="rows"><div class="row"><div><b>Ambience</b><small>Wind, birds, rain, waves and the hum of each place, under the music.</small></div>${chips('ambSet',AMB_LV,amb)}</div>
    <div class="row"><div><b>Music style</b><small>Orchestral is the full soundtrack. Classic chiptune is the original pixel music.</small></div>${chips('mstyleSet',[['orch','Orchestral'],['chip','Classic chiptune']],st)}</div>
    <div class="row"><div><b>Credits</b><small>Who made the instruments and sounds.</small></div><button class="btn sm" data-act="creditsOpen">Credits</button></div></div>`;
  return h+extra;};}
ACT.ambSet=function(v){META.cfg.amb=+v;saveMeta();audioVol();render();};
ACT.mstyleSet=function(v){au2SetStyle(v==='chip'?'chip':'orch');render();};
const CREDITS_TEXT=`Music and sound
All music is composed for Aurelis around one theme, the Meridian. Every effect and the ambience are synthesized in the game.

Instruments: FluidR3_GM General MIDI soundfont by Frank Wen (MIT license), as rendered to per-note audio by Benjamin Gleitzman in midi-js-soundfonts (github.com/gleitz/midi-js-soundfonts, published under Creative Commons Attribution 3.0). Notes were trimmed, resampled and packed into sprites for the game.

Classic chiptune mode uses the original Aurelis synth engine.`;
ACT.creditsOpen=function(){V.modal={type:'story',title:'Credits',text:CREDITS_TEXT};render();};
// ---------- the Music Room (Records) ----------
try{const rec=MENU_GROUPS.find(g=>g[0]==='records');if(rec&&!rec[2].includes('music'))rec[2].push('music');MENU_SUB.music='Music Room';}catch(e){}
function mrOpen(r){return !!(r[2]||(META.heard||{})[r[0]]);}
function mrName(r){try{return musicTrack(r[4]?r[0]:musicRoomId(r),r[1]).name||r[0];}catch(e){return r[0];}}
function vMusicRoom(){const P=AU2.preview,orch=AU2.on;
  const rows=MUSIC_ROOM.map((r,i)=>{const open=mrOpen(r),playing=P&&P.i===i;
    return `<div class="row ${open?'':'lock'}"><div><b>${open?esc(mrName(r)):'???'}</b><small>${open?(r[4]?'Jingle':r[3]?'Loops. Stem: '+(r[3]==='tense'?'tension layer':'boss phase layer'):'Loops'):'Hear it in your travels to unlock it.'}</small></div>
      <div class="btnrow">${open?`<button class="btn sm ${playing?'gold':''}" data-act="mrPlay" data-arg="${i}">${playing?'Playing':'Play'}</button>${r[3]&&playing?`<button class="btn sm" data-act="mrStem" data-arg="${i}">${P.stems&&P.stems[r[3]]?'Layer on':'Layer off'}</button>`:''}`:''}</div></div>`;}).join('');
  return `<p class="note">Every track and jingle you have heard on this account. Title, town and the first field are open from the start.${orch?'':' Switch Music style to Orchestral in Settings to listen here.'}</p>
    <div class="btnrow"><button class="btn sm" data-act="mrStop">Stop</button></div><div class="rows compact">${rows}</div>`;}
ACT.mrPlay=function(i){i=+i;const r=MUSIC_ROOM[i];if(!r||!AU2.on)return;audioInit();if(r[4]){au2Jingle(r[0]);return;}
  AU2.preview={i,id:musicRoomId(r),opt:r[1],stems:{}};au2Sync(true);render();};
ACT.mrStem=function(i){const P=AU2.preview,r=MUSIC_ROOM[+i];if(!P||!r||!r[3])return;P.stems=P.stems||{};P.stems[r[3]]=!P.stems[r[3]];au2Sync(true);render();};
ACT.mrStop=function(){AU2.preview=null;au2Stop(.6);render();setTimeout(()=>au2Sync(true),700);};
{const mm0=mMenu;mMenu=function(m){const tab=m&&m.tab;if(tab!=='music'){if(AU2.preview){AU2.preview=null;setTimeout(()=>au2Sync(true),0);}return mm0.apply(this,arguments);}
  const html=mm0.apply(this,arguments),grp=menuGroupOf('music'),tabs=menuTabsHtml(grp,'music'),k=html.indexOf(tabs);return k<0?html:html.slice(0,k+tabs.length)+vMusicRoom()+html.slice(k+tabs.length);};}
// the Music Room unlocks: remember the field arrangement heard as its own entry
{const h0=au2Heard;au2Heard=function(id){h0(id);try{const C=AU2.cur;if(C&&C.id==='field'&&!AU2.preview){const k=C.key.split('|');if(k[3]==='1')h0('field_cal');else if(k[2]==='1')h0('field_night');else h0('field_'+k[1]);}
  if(C&&C.id==='town'&&C.key.split('|')[2]==='1')h0('town_n');}catch(e){}};}
// the modal router may not know 'story' everywhere; it does in this build (used by the violet letter), so Credits uses it
