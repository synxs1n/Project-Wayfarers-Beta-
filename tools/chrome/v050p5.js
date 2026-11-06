// Beta v0.5.0 phase 5: volume sliders and mutes (5.1), auto sync (5.2), the name (5.3), Save in the menu and the save message (5.5)
const {open,chk,done}=require('./pw');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev,page}=H;
// ---------- 5.3 title screen ----------
const t=await ev(()=>{const A=__A,s=document.getElementById('screen'),o={};const wm=s.querySelector('svg[aria-label="Wayfarers"]');o.logo=wm?wm.getAttribute('aria-label'):(s.querySelector('.logo')||{}).textContent;o.sub=/\bbeta\b/i.test(s.innerText)?'(Beta)':(s.querySelector('.title .sub')||{}).textContent;/* v0.7.4+: the wordmark is an SVG */o.pre=!!s.querySelector('.title .pre');
  o.ver=(s.querySelector('.title .ver')||{}).textContent;o.doc=document.title;o.hdr=(document.querySelector('#hdr svg[aria-label="Wayfarers"]')?'Wayfarers ':'')+document.getElementById('hdr').innerText;o.body=document.body.innerText;o.gv=A.GAME_VERSION;return o;});
console.log(JSON.stringify({logo:t.logo,sub:t.sub,ver:t.ver,doc:t.doc,hdr:t.hdr}));
chk('title screen reads Wayfarers (Beta), no "Project"',t.logo==='Wayfarers'&&t.sub==='(Beta)'&&!t.pre&&!/Project/.test(t.body));
chk('title version line and browser tab: "Wayfarers (Beta) v..."',t.ver==='Wayfarers (Beta) '+t.gv.replace(/^Beta /,'')&&t.doc===t.ver);
chk('top bar brand is Wayfarers',/^Wayfarers/.test(t.hdr));
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
const n=await ev(()=>{const A=__A,o={};A.V.modal={type:'menu',tab:'help'};A.render();const m=document.querySelector('#modal');o.verf=(m.querySelector('.verf')||{}).textContent;o.help=m.innerText;
  o.fb=A.vFbHelp();o.ctx=A.fbContext();o.old=/Project Aurelis|Aurelis Wayfarers/.test(document.body.innerText+o.fb);A.V.modal=null;return o;});
chk('menu footer reads Wayfarers (Beta) and the version',/^Wayfarers \(Beta\) v\d/.test(n.verf||''));
chk('Help tab names the game',/Wayfarers \(Beta\)/.test(n.help));
chk('changelog heading and version line in Help / Feedback',/<h4>Wayfarers \(Beta\) changelog<\/h4><p class="note">You are playing Wayfarers \(Beta\) v/.test(n.fb));
chk('feedback context carries the name and still the version',n.ctx.game==='Wayfarers (Beta)'&&n.ctx.version===t.gv&&/^Wayfarers \(Beta\) v/.test(n.ctx.title));
chk('no old title in player text',n.old===false);

// ---------- 5.1 volume ----------
const v=await ev(async()=>{const A=__A,o={};try{__AU.audioInit();}catch(e){}await new Promise(r=>setTimeout(r,300));
  A.V.modal={type:'menu',tab:'settings'};A.render();const m=document.querySelector('#modal');
  o.sliders=[...m.querySelectorAll('input[type=range][data-vol]')].map(i=>i.dataset.vol+':'+i.value);o.oldChips=/data-arg='\["music",/.test(m.innerHTML)||/data-arg='\["sfx",/.test(m.innerHTML)||/data-arg='\["mute",/.test(m.innerHTML);
  o.mutes=[...m.querySelectorAll('[data-act="p5Mute"]')].map(b=>b.dataset.arg);o.hasCtx=!!A.AU.ctx;
  const set=(k,val)=>{const i=m.querySelector(`input[data-vol="${k}"]`);i.value=val;i.dispatchEvent(new Event('input',{bubbles:true}));};
  set('master',40);set('music',70);set('sfx',20);o.cfg=[A.META.cfg.master,A.META.cfg.music,A.META.cfg.sfx];o.lbl=m.querySelector('[data-volv="master"]').textContent;
  if(A.AU.ctx){o.aumaster=+A.AU.master.gain.value.toFixed(3);o.aumus=+A.AU.mus.gain.value.toFixed(3);}
  if(A.AU2.g){o.g=+A.AU2.g.master.gain.value.toFixed(3);o.gm=+A.AU2.g.bus.music.gain.value.toFixed(3);}
  A.ACT.p5Mute('muteMusic');o.mm=A.META.cfg.muteMusic;if(A.AU.ctx)o.aumusMuted=A.AU.mus.gain.value;if(A.AU2.g)o.gmMuted=A.AU2.g.bus.music.gain.value;if(A.AU.ctx)o.aufxStill=A.AU.fx.gain.value>0;
  A.ACT.p5Mute('muteSfx');if(A.AU.ctx)o.aufxMuted=A.AU.fx.gain.value;if(A.AU2.g)o.gsMuted=A.AU2.g.bus.sfx.gain.value+A.AU2.g.bus.ui.gain.value;
  A.ACT.p5Mute('mute');if(A.AU.ctx)o.masterMuted=A.AU.master.gain.value;if(A.AU2.g)o.gMasterMuted=A.AU2.g.master.gain.value;
  A.ACT.p5Mute('mute');A.ACT.p5Mute('muteMusic');A.ACT.p5Mute('muteSfx');if(A.AU.ctx)o.back=+A.AU.master.gain.value.toFixed(3);
  await new Promise(r=>setTimeout(r,600));o.meta=JSON.parse(localStorage.getItem('aurelis-meta-v1')).cfg;A.V.modal=null;return o;});
console.log(JSON.stringify(v));
chk('Settings has Master, Music and Sound effects sliders, the old chips are gone',v.sliders.join(',')==='master:100,music:45,sfx:60'&&!v.oldChips);
chk('each slider has its mute toggle',v.mutes.join(',')==='mute,muteMusic,muteSfx');
chk('sliders apply instantly',JSON.stringify(v.cfg)==='[0.4,0.7,0.2]'&&v.lbl==='40%');
chk('audio context available for the gain checks',v.hasCtx===true);
if(v.hasCtx){chk('master sets AU.master, music bus follows the slider',v.aumaster===.4&&Math.abs(v.aumus-.7*1.8)<.01);
  chk('music mute silences music only, sfx mute the effects, master mute everything',v.aumusMuted===0&&v.aufxStill&&v.aufxMuted===0&&v.masterMuted===0&&v.back===.4);}
if(v.g!=null)chk('orchestra master bus follows Master (AU2.g.master)',v.g===.4&&v.gMasterMuted===0&&v.gmMuted===0&&v.gsMuted===0);
chk('volumes and mutes are saved in the settings',v.meta.master===.4&&v.meta.music===.7&&v.meta.sfx===.2&&v.meta.mute===false&&v.meta.muteMusic===false);

// ---------- 5.5 the Save button in the menu ----------
const s=await ev(async()=>{const A=__A,o={tabs:{}};const tabs=['party','roster','loadouts','equip','items','next','lore','help','system','beasts','codex','factions','quests','map','settings'];
  for(const tb of tabs){A.V.modal={type:'menu',tab:tb};A.render();const b=document.querySelector('#modal .savepin [data-act="p5Save"]');o.tabs[tb]=!!b;if(b){const r=b.getBoundingClientRect();o.tabs[tb]=r.top>=0&&r.bottom<=innerHeight;}}
  A.V.modal={type:'menu',tab:'roster'};A.render();const box=document.querySelector('#modal .box');box.scrollTop=9999;await new Promise(r=>setTimeout(r,50));
  const b=document.querySelector('#modal [data-act="p5Save"]').getBoundingClientRect();o.afterScroll=b.top>=0&&b.bottom<=innerHeight;
  o.pin=document.querySelector('#modal .savepin').innerText;A.G.savedAt=0;const t0=Date.now();
  document.querySelector('#modal [data-act="p5Save"]').click();o.saved=A.G.savedAt>=t0;o.msg1=document.getElementById('p5save').textContent;
  await new Promise(r=>setTimeout(r,500));o.msg2=document.getElementById('p5save').textContent;o.pin2=document.querySelector('#modal .savepin').innerText;
  A.V.modal={type:'menu',tab:'system'};A.render();o.journey=!!document.querySelector('#modal [data-act="saveJ"]')&&!!document.querySelector('#modal [data-act="svSyncNow"]');
  A.V.modal=null;A.render();return o;});
console.log(JSON.stringify(s));
chk('Save button pinned in the menu header on every tab, visible without scrolling',Object.values(s.tabs).every(x=>x===true)&&s.afterScroll===true);
chk('it shows the slot and the last saved time',/Slot 1 ·/.test(s.pin));
chk('tapping it saves, with a clear confirmation',s.saved&&s.msg1==='Saving…'&&s.msg2==='Saved to slot 1'&&/Saved ✓/.test(s.pin2));
chk('the Journey tab keeps its Save and Sync buttons',s.journey===true);

// ---------- 5.5 the autosave message ----------
const a=await ev(async()=>{const A=__A,o={},e=()=>document.getElementById('p5save');const sl=ms=>new Promise(r=>setTimeout(r,ms));
  await sl(3500);o.gone=!e().classList.contains('on');
  A.saveGame();o.s1=e().textContent;o.on1=e().classList.contains('on');o.pe=getComputedStyle(e()).pointerEvents;o.focus=document.activeElement===e()||e().contains(document.activeElement);
  await sl(450);o.s2=e().textContent;A.saveGame();A.saveGame();o.s3=e().textContent;// a burst shares the message
  await sl(A.SAVE_UI.hold+A.SAVE_UI.fade+300);o.faded=!e().classList.contains('on');
  // failure: a clear error with Retry, and Retry works once storage is back
  const si=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(String(k).startsWith('aurelis-wayfarers-v3'))throw new Error('full');return si.apply(this,arguments);};
  await sl(10);A.P5S.shownAt=0;const ok=A.saveGame();o.failOk=ok;o.err=e().textContent;o.errCls=e().className;const rb=e().querySelector('[data-act="p5Retry"]');o.retryPe=rb?getComputedStyle(rb).pointerEvents:null;
  Storage.prototype.setItem=si;if(rb)rb.click();await sl(450);o.afterRetry=e().textContent;
  // in battle: shows, input still free
  A.startBattle({stage:0,kind:'field',weather:'clear'});A.render();await sl(50);A.P5S.shownAt=0;A.saveGame();o.battleMsg=e().textContent;o.battleMode=A.B&&A.B.mode;
  const r=e().getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);o.under=hit!==e()&&!e().contains(hit);
  A.finishBattle('x');A.V.modal=null;
  // reduced motion: no fade animation
  A.META.cfg.rmotion=true;A.P5S.shownAt=0;A.saveGame();o.rm=e().classList.contains('rm')&&getComputedStyle(e()).transitionDuration==='0s';A.META.cfg.rmotion=null;
  return o;});
console.log(JSON.stringify(a));
chk('an autosave shows "Saving…" then "Saved"',a.s1==='Saving…'&&a.on1&&a.s2==='Saved');
chk('the message never takes taps or focus',a.pe==='none'&&a.focus===false&&a.under===true);
chk('a burst of autosaves shares one message, then it fades',a.s3==='Saved'&&a.faded===true&&a.gone===true);
chk('a failed save shows a clear error with Retry, and Retry saves',a.failOk===false&&/Could not save/.test(a.err)&&/err/.test(a.errCls)&&a.retryPe==='auto'&&/Saved/.test(a.afterRetry));
chk('it shows during battle without blocking',/Saving|Saved/.test(a.battleMsg)&&!!a.battleMode);
chk('reduced motion: no fade animation',a.rm===true);
await H.browser.close();

// ---------- 5.2 auto sync: signed in with write access ----------
{const H2=await open({w:430,h:880,mobile:true});
 const r=await H2.ev(async()=>{const A=__A,o={};const sl=ms=>new Promise(r=>setTimeout(r,ms));A.SAVE_UI.syncDelay=400;
  A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;
  for(let i=0;i<40&&!(A.SV.db&&A.SV.status!=='syncing'&&!A.SV.busy);i++)await sl(150);
  o.st0=A.SV.status;const n0=[...window.__S.keys()].filter(k=>/^saves\/u_test\/s\/0$/.test(k)).length;
  A.G.gold=12345;A.saveGame();o.dirty=!!A.SV.dirty[0];o.icon=(document.getElementById('svicon')||{}).className;
  await sl(1400);o.st1=A.SV.status;const d=window.__S.get('saves/u_test/s/0');o.pushed=!!d;o.hashOk=d&&d.hash===A.svHash(localStorage.getItem('aurelis-wayfarers-v3'));
  // hiding the page pushes a pending save at once
  A.SAVE_UI.syncDelay=60000;A.G.gold=222;A.saveGame();A.p5FlushNow();await sl(900);const d2=window.__S.get('saves/u_test/s/0');o.hidePush=d2&&d2.hash===A.svHash(localStorage.getItem('aurelis-wayfarers-v3'));
  A.V.modal={type:'menu',tab:'system'};A.render();o.sync=!!document.querySelector('#modal [data-act="svSyncNow"]:not([disabled])');A.V.modal=null;return o;});
 console.log(JSON.stringify(r));
 chk('signed in with write access: a save syncs on its own after the debounce',r.dirty&&r.pushed&&r.hashOk&&r.st1==='synced');
 chk('leaving or hiding the page pushes a pending save right away',r.hidePush===true);
 chk('Sync now stays',r.sync===true);
 await H2.browser.close();}
// ---------- 5.2 visitors: local only with the Export reminder ----------
{const H3=await open({w:430,h:880,mobile:true,pre:'localStorage.clear();window.__VIEWONLY=true;'});
 const r=await H3.ev(async()=>{const A=__A,o={};const sl=ms=>new Promise(r=>setTimeout(r,ms));A.SAVE_UI.syncDelay=300;await sl(3500);o.st=A.SV.status;o.note=/Export save/.test(document.body.innerText);
  A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.saveGame();await sl(1200);
  o.cloud=[...window.__S.keys()].some(k=>/^saves\//.test(k));o.st2=A.SV.status;A.V.modal={type:'menu',tab:'system'};A.render();o.remind=/not synced to an account/.test(document.querySelector('#modal').innerText);A.V.modal=null;return o;});
 console.log(JSON.stringify(r));
 chk('visitors without write access stay local, never upload, and see the Export reminder',r.st==='local'&&r.st2==='local'&&r.cloud===false&&r.note&&r.remind);
 await H3.browser.close();}
await done(H);})().catch(e=>{console.log('ERR',e);process.exit(1);});
