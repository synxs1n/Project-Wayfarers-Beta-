// Beta v0.8.5 save sync between devices (docs/v085-sync.md), part 2: clocks, offline, races, lifecycle events.
//   1. Clock skew of +10 min on one device and -10 min on the other: the older save never wins (synced devices and fresh ones).
//   2. Offline, then online: the progress still syncs, nothing is pushed while offline.
//   3. A push in flight when the player leaves: a second push is chained, the latest progress lands.
//   4. A stale push (decided on an old cloud copy) is refused by the atomic write; the newer cloud save stays.
//   5. Saves every second never leave the cloud more than 30 s behind.
//   6. Android: document 'pause' and the Capacitor App plugin 'pause' push; Windows app: svBeforeClose saves and pushes.
//   7. A db without txn (claude.ai): the same flows still work.
// Run: cd tools/chrome && PWHTML=../../out/aurelis3.html node v085s2.js
const {chromium}=require('playwright');
const {chk}=require('./pw');
const {store,device,NEWGAME,idle}=require('./syncmock');
const K='saves/u_dev/s/0',MIN=60000;
(async()=>{
const browser=await chromium.launch();let fails=0;const ck=(n,c)=>{chk(n,c);if(c!==true)fails++;};
const devs=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
const gold=H=>H.ev(()=>{const r=localStorage.getItem('aurelis-wayfarers-v3');return r?JSON.parse(r).gold:null;});
const until=async(f,ms)=>{const t=Date.now();while(Date.now()-t<ms){if(await f())return true;await wait(100);}return false;};

// ---- 1a. synced devices: P runs 10 min fast, Q runs 10 min slow ----
{const st=store();const dev=async(t,o)=>{const d=await device(st,browser,t,o);devs.push(d);return d;};
 const P=await dev('P',{skew:10*MIN});await idle(P);await P.ev(NEWGAME);await P.ev(()=>{__A.G.gold=600;__A.saveGame();});await idle(P);
 const v1=await P.ev(()=>localStorage.getItem('aurelis-wayfarers-v3'));await P.page.close();
 const Q=await dev('Q',{skew:-10*MIN});await idle(Q);
 ck('skew: Q restores P\'s save',await gold(Q)===600);
 await Q.ev(()=>__A.ACT.slotLoad(0));await wait(300);
 await Q.ev(()=>{__A.G.gold=3333;__A.G.stats.battles+=2;__A.saveGame();window.__vis('hidden');});await wait(900);
 const c=st.get(K);
 ck('skew: Q\'s newer save is in the cloud although its clock says it is 20 min older than P\'s',c.prog.gold===3333&&c.savedAt<JSON.parse(v1).savedAt||JSON.stringify({g:c.prog.gold,q:c.savedAt,p:JSON.parse(v1).savedAt}));
 await P.reopen();
 await P.ev(()=>__A.ACT.slotLoad(0));
 await until(()=>P.ev(()=>__A.V.screen==='world'),8000);
 ck('skew: P (clock 10 min fast) opens Q\'s newer save, its own older one does not win',await P.ev(()=>__A.G.gold)===3333);
 await idle(P);ck('skew: the cloud still holds Q\'s save',st.get(K).prog.gold===3333);
 await Q.ev(()=>window.__vis('visible'));await idle(Q);
 ck('skew: Q learned its clock offset (+10 min) from the server time of its own write on its next check',await Q.ev(()=>Math.abs(__SV85.SV.skew-600000)<5000)||await Q.ev(()=>__SV85.SV.skew));
 await P.page.close();await Q.page.close();
 // ---- 1b. a fresh device (never synced) with an older local save and a clock 10 min fast: the newer cloud save wins ----
 const R=await dev('R',{skew:10*MIN,seed:{'aurelis-wayfarers-v3':v1}});await idle(R);
 ck('skew, nothing known: R (fast clock, older local save, less progress) takes the cloud save instead of pushing',await gold(R)===3333&&st.get(K).prog.gold===3333||JSON.stringify({r:await gold(R),c:st.get(K).prog.gold}));
 ck('skew, nothing known: R\'s old copy is backed up',await R.ev(()=>[0,1,2].some(i=>{const b=localStorage.getItem('aurelis-bak-0-'+i);return b&&JSON.parse(JSON.parse(b).raw).gold===600;})));
 await R.page.close();
 // ---- 1c. a fresh device with a slow clock holding MORE progress than the cloud: it is uploaded, the cloud copy goes to history ----
 const more=JSON.parse(v1);more.gold=9000;more.stats.battles=(st.get(K).prog.battles||0)+20;more.stats.play=(more.stats.play||0)+3600000;more.savedAt=Date.now()-10*MIN-60000;
 const S=await dev('S',{skew:-10*MIN,seed:{'aurelis-wayfarers-v3':JSON.stringify(more)}});await idle(S);
 const h=[0,1,2].map(i=>st.get('saves/u_dev/h/0-'+i)).filter(Boolean).map(x=>x.prog.gold);
 ck('skew, nothing known: S (slow clock, more progress) is not beaten by the older cloud save',st.get(K).prog.gold===9000||JSON.stringify(st.get(K).prog));
 ck('skew: the replaced cloud save is in history',h.includes(3333)||JSON.stringify(h));
 await S.page.close();}

// ---- 2..6 on one cloud ----
{const st=store();const dev=async(t,o)=>{const d=await device(st,browser,t,o);devs.push(d);return d;};
 const capJs=`window.Capacitor={isNativePlatform:()=>false,isPluginAvailable:n=>n==='App',Plugins:{App:{L:{},addListener(n,f){(this.L[n]=this.L[n]||[]).push(f);return {remove(){}};}}}};`;
 const A=await dev('A',{prejs:capJs});await idle(A);await A.ev(NEWGAME);await A.ev(()=>{__A.G.gold=100;__A.saveGame();});await idle(A);
 // 2. offline
 await A.ev(()=>window.__net(false));const n0=st.ops.length;
 await A.ev(()=>{__A.G.gold=4444;__A.saveGame();window.__vis('hidden');});await wait(2600);
 const off=await A.ev(()=>({st:__SV85.SV.status,dirty:!!__SV85.SV.dirty[0],local:JSON.parse(localStorage.getItem('aurelis-wayfarers-v3')).gold}));
 ck('offline: saved on the device, queued, no cloud writes',off.st==='queued'&&off.dirty&&off.local===4444&&!st.ops.slice(n0).some(o=>o[1]==='txn'||o[1]==='set')||JSON.stringify(off));
 await A.ev(()=>{window.__vis('visible');window.__net(true);});
 ck('online again: the offline progress syncs',await until(()=>st.get(K).prog.gold===4444,4000));
 await idle(A);
 // 3. a push in flight, then the player leaves with newer progress
 st.delay=350;
 await A.ev(()=>{__A.G.gold=150;__A.saveGame();});
 await until(()=>A.ev(()=>__SV85.SV.busy),4000);
 await A.ev(()=>{__A.G.gold=200;window.__vis('hidden');});
 const chained=await until(()=>st.get(K).prog.gold===200,8000);
 ck('a push in flight when leaving: a second push is chained and the latest progress (200) lands',chained||st.get(K).prog.gold);
 st.delay=0;await A.ev(()=>window.__vis('visible'));await idle(A);
 // 4. a stale push is refused
 const stale=st.get(K);
 const B=await dev('B');await idle(B);await B.ev(()=>__A.ACT.slotLoad(0));await wait(300);
 await B.ev(()=>{__A.G.gold=7777;__A.G.stats.battles+=1;__A.saveGame();window.__vis('hidden');});await wait(900);
 ck('B pushed 7777',st.get(K).prog.gold===7777);
 const r4=await A.ev(async c=>{try{await __SV85.svPush(0,'stale test',c);return 'pushed';}catch(e){return e&&e.code;}},stale);
 ck('a push decided on an old cloud copy is refused (atomic write), the newer save stays',r4==='changed'&&st.get(K).prog.gold===7777||JSON.stringify({r4,g:st.get(K).prog.gold}));
 await A.ev(()=>{__A.G.gold+=1;__A.saveGame();});
 ck('A (journey open) is asked about B\'s save rather than overwriting it',await until(()=>A.ev(()=>__A.V.modal&&__A.V.modal.type==='svnewer'),5000)&&st.get(K).prog.gold===7777);
 await A.ev(()=>__A.ACT.svNewerLoad());await until(()=>A.ev(()=>__A.G.gold===7777&&!__A.V.modal),5000);
 ck('A loads B\'s save',await A.ev(()=>__A.G.gold)===7777);
 await B.page.close();await idle(A);
 // 5. a save every second for 31 s: at least one push before 30 s
 const p0=st.ops.filter(o=>o[0]==='A'&&o[1]==='txn').length;const t5=Date.now();let first=0;
 for(let i=0;i<31;i++){await A.ev(i=>{__A.G.gold=8000+i;__A.saveGame();},i);await wait(1000);if(!first&&st.ops.filter(o=>o[0]==='A'&&o[1]==='txn').length>p0)first=Math.round((Date.now()-t5)/1000);}
 ck('saves every second still reach the cloud within 30 s (first push after '+first+' s)',first>0&&first<=31);
 await idle(A);
 // 6. Android pause (document event and the App plugin), Windows close
 await A.ev(()=>{__A.G.gold=8888;document.dispatchEvent(new Event('pause'));});
 ck('Android: document "pause" saves and pushes',await until(()=>st.get(K).prog.gold===8888,3000));
 await idle(A);
 await A.ev(()=>{__A.G.gold=8899;(window.Capacitor.Plugins.App.L.pause||[]).forEach(f=>f());});
 ck('Android: the Capacitor App plugin "pause" saves and pushes',await until(()=>st.get(K).prog.gold===8899,3000));
 await idle(A);
 const r6=await A.ev(async()=>{__A.G.gold=9100;const t=Date.now();await window.svBeforeClose();return Date.now()-t;});
 ck('Windows app close: svBeforeClose saves, pushes and returns once it landed ('+r6+' ms)',st.get(K).prog.gold===9100&&r6<3500);
 // in a battle: the slot keeps the pre-battle save, leaving still pushes what is stored
 await idle(A);
 const pre=await A.ev(()=>JSON.parse(localStorage.getItem('aurelis-wayfarers-v3')).gold);
 await A.ev(()=>{__A.startBattle({stage:0,kind:'field'});});await wait(300);
 await A.ev(()=>{__A.G.gold=12345;window.__vis('hidden');});await wait(800);
 const b6=await A.ev(()=>({screen:__A.V.screen,local:JSON.parse(localStorage.getItem('aurelis-wayfarers-v3')).gold}));
 ck('leaving in a battle does not save the mid battle state (pre-battle save kept)',b6.screen==='battle'&&b6.local===pre&&st.get(K).prog.gold===pre||JSON.stringify(b6));
 await A.ev(()=>{window.__vis('visible');});await A.page.close();}

// ---- 7. a db without txn (the claude.ai host) ----
{const st=store();const dev=async(t,o)=>{const d=await device(st,browser,t,o);devs.push(d);return d;};
 const A=await dev('A7',{noTxn:true});await idle(A);await A.ev(NEWGAME);await A.ev(()=>{__A.G.gold=300;__A.saveGame();});await idle(A);
 const B=await dev('B7',{noTxn:true});await idle(B);ck('no txn: B restores',await gold(B)===300);await B.page.close();
 await A.ev(()=>{__A.G.gold=301;window.__vis('hidden');});await wait(900);
 ck('no txn: leaving pushes',st.get(K).prog.gold===301&&!!st.get('saves/u_dev/h/0-0'));
 await B.reopen();await B.ev(()=>__A.ACT.slotLoad(0));await until(()=>B.ev(()=>__A.V.screen==='world'),8000);
 ck('no txn: B taps Continue at once and gets 301',await B.ev(()=>__A.G.gold)===301);
 await A.page.close();await B.page.close();}

const errs=devs.reduce((a,d)=>a.concat(d.errs),[]);
ck('no page errors',errs.length===0||errs.join(' | '));
await browser.close();console.log(fails?'FAILS '+fails:'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',e);process.exit(1);});
