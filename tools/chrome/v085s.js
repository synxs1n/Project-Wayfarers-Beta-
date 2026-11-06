// Beta v0.8.5 save sync between devices (docs/v085-sync.md), part 1: the owner's report.
// Two devices (browser contexts, each with its own localStorage) share one cloud held in node (syncmock.js).
//   1. A plays and leaves (hidden, then the app is killed 1.2 s later): the unsaved progress reaches the cloud.
//   2. B opens and taps Continue at once: it waits for the cloud check and opens A's latest save.
//   3. B left open on the title picks up A's newer save within 60 s.
//   4. B with a journey open sees "A newer save from <device>" and Load it opens it.
//   5. Both changed: B is asked, Keep this one uploads B's and keeps A's in the cloud history; A then gets B's.
// Run: cd tools/chrome && PWHTML=../../out/aurelis3.html node v085s.js
const {chromium}=require('playwright');
const {chk}=require('./pw');
const {store,device,NEWGAME,idle}=require('./syncmock');
const K='saves/u_dev/s/0';
(async()=>{
const st=store(),browser=await chromium.launch();let fails=0;const ck=(n,c)=>{chk(n,c);if(c!==true)fails++;};
const devs=[];const dev=async(t,o)=>{const d=await device(st,browser,t,o);devs.push(d);return d;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const gold=H=>H.ev(()=>{const r=localStorage.getItem('aurelis-wayfarers-v3');return r?JSON.parse(r).gold:null;});
const cloud=()=>st.get(K);

// ---- 0. A starts a journey; B (empty) opens once and restores it ----
const A=await dev('A');await idle(A);
await A.ev(NEWGAME);await A.ev(()=>{__A.G.gold=500;__A.saveGame();});
ck('A: first save syncs within the 2 s debounce',await idle(A)&&cloud()&&cloud().prog.gold===500||JSON.stringify(cloud()&&cloud().prog));
const B=await dev('B');await idle(B);
ck('B: an empty device restores the account save',await gold(B)===500);
await B.page.close();

// ---- 1. A plays (progress only in memory: steps, gold), goes to the background and is killed 1.2 s later ----
await A.ev(()=>{const G=__A.G;G.gold=777;G.stats.battles=(G.stats.battles||0)+3;G.stats.steps=(G.stats.steps||0)+40;});
const t0=Date.now();await A.ev(()=>window.__vis('hidden'));
for(let i=0;i<12&&!(cloud().prog.gold===777);i++)await wait(100);
const tPush=Date.now()-t0;await A.page.close();
ck('A leaving: the current journey is saved and pushed at once (no 6 s debounce)',cloud().prog.gold===777&&tPush<1200||JSON.stringify({tPush,g:cloud().prog.gold}));
ck('A leaving: the replaced cloud version went to history',!!st.get('saves/u_dev/h/0-0'));

// ---- 2. B opens and taps Continue right away ----
await B.reopen();
const tap=await B.ev(()=>{__A.ACT.slotLoad(0);return {modal:__A.V.modal&&__A.V.modal.type,first:__SV85.SV.firstDone,screen:__A.V.screen};});
ck('B: Continue before the first cloud check shows "Checking cloud saves" instead of opening the old copy',tap.modal==='svwait'&&tap.screen==='title'||JSON.stringify(tap));
for(let i=0;i<60;i++){if(await B.ev(()=>__A.V.screen==='world'))break;await wait(100);}
const b2=await B.ev(()=>({screen:__A.V.screen,gold:__A.G&&__A.G.gold,modal:__A.V.modal&&__A.V.modal.type,hold:JSON.stringify(__SV85.SV.hold)}));
ck('B: Continue opens A\'s latest save (gold 777), no prompt, nothing held',b2.screen==='world'&&b2.gold===777&&!b2.modal&&!/"0":"/.test(b2.hold)||JSON.stringify(b2));
await idle(B);
ck('B: opening it did not push anything older over the cloud',cloud().prog.gold===777);

// ---- 3. B quits to the title and is left open; A comes back, plays on and leaves ----
await B.ev(()=>__A.ACT.quitTitle());await idle(B);
await A.reopen();await idle(A);
await A.ev(()=>__A.ACT.slotLoad(0));await wait(300);
const a3=await A.ev(()=>({screen:__A.V.screen,gold:__A.G&&__A.G.gold}));
ck('A reopened: its slot followed the cloud (B quit and saved), it opens at gold 777',a3.screen==='world'&&a3.gold===777||JSON.stringify(a3));
await A.ev(()=>{__A.G.gold=999;__A.saveGame();window.__vis('hidden');});await wait(800);
ck('A: newer save (999) in the cloud',cloud().prog.gold===999);
const t3=Date.now();let got=false;
while(Date.now()-t3<64000){if(await gold(B)===999){got=true;break;}await wait(1000);}
const t3s=Math.round((Date.now()-t3)/1000);
ck('B left open on the title picks up A\'s newer save within 60 s ('+t3s+' s)',got);
ck('B: title still shows Continue, no prompt',await B.ev(()=>!!document.querySelector('[data-act="slots"]')&&!__A.V.modal));

// ---- 4. B opens the journey; A plays on; B comes back to the window and is asked ----
await B.ev(()=>__A.ACT.slotLoad(0));await wait(300);
await A.ev(()=>{window.__vis('visible');__A.G.gold=1234;__A.G.stats.battles+=5;window.__vis('hidden');});await wait(800);
ck('A: 1234 in the cloud',cloud().prog.gold===1234);
await B.ev(()=>window.dispatchEvent(new Event('focus')));
for(let i=0;i<30;i++){if(await B.ev(()=>__A.V.modal&&__A.V.modal.type==='svnewer'))break;await wait(100);}
const p4=await B.ev(()=>({modal:__A.V.modal&&__A.V.modal.type,txt:(document.querySelector('#modal')||{}).innerText||'',gold:__A.G.gold,dev:__SV85.svDev().label}));
const devA=await A.ev(()=>__SV85.svDev().label);
ck('B with a journey open: prompt "A newer save from <device>, <time> exists" with Load it / Keep this one',p4.modal==='svnewer'&&/A newer save from/.test(p4.txt)&&p4.txt.includes(devA)&&/Load it/.test(p4.txt)&&/Keep this one/.test(p4.txt)||JSON.stringify(p4).slice(0,600));
await B.ev(()=>{__A.G.gold+=1;__A.saveGame();});await wait(2600);   // an autosave while the prompt waits must not upload over the newer save
ck('B: autosaves while the prompt waits do not overwrite the newer cloud save',cloud().prog.gold===1234);
await B.ev(()=>__A.ACT.svNewerLoad());
for(let i=0;i<40;i++){if(await B.ev(()=>__A.G&&__A.G.gold===1234&&!__A.V.modal))break;await wait(100);}
const l4=await B.ev(()=>({gold:__A.G.gold,screen:__A.V.screen,modal:__A.V.modal&&__A.V.modal.type,bak:[0,1,2].map(i=>localStorage.getItem('aurelis-bak-0-'+i)).filter(Boolean).map(b=>JSON.parse(JSON.parse(b).raw).gold)}));
ck('Load it: B now plays A\'s save (1234)',l4.gold===1234&&l4.screen==='world'&&!l4.modal||JSON.stringify(l4));
ck('Load it: B\'s own journey (1000) is kept in a backup',l4.bak.includes(1000)||JSON.stringify(l4.bak));
await idle(B);

// ---- 5. both change: A pushes 2000, B (journey open) saves 5000 before it noticed ----
await A.ev(()=>{window.__vis('visible');__A.G.gold=2000;__A.G.stats.battles+=2;window.__vis('hidden');});await wait(800);
ck('A: 2000 in the cloud',cloud().prog.gold===2000);
await B.ev(()=>{__A.G.gold=5000;__A.G.stats.steps=(__A.G.stats.steps||0)+99;__A.saveGame();});
for(let i=0;i<40;i++){if(await B.ev(()=>__A.V.modal&&__A.V.modal.type==='svnewer'))break;await wait(100);}
const p5=await B.ev(()=>({modal:__A.V.modal&&__A.V.modal.type,txt:(document.querySelector('#modal')||{}).innerText||''}));
ck('both changed: B is asked instead of silently diverging',p5.modal==='svnewer'&&/from/.test(p5.txt)||JSON.stringify(p5).slice(0,400));
ck('both changed: nothing was overwritten while asking',cloud().prog.gold===2000);
await B.ev(()=>__A.ACT.svNewerKeep());await wait(1200);
const hist=[0,1,2].map(i=>st.get('saves/u_dev/h/0-'+i)).filter(Boolean).map(h=>h.prog.gold);
ck('Keep this one: B\'s save (5000) is in the cloud',cloud().prog.gold===5000);
ck('Keep this one: A\'s save (2000) is kept in the cloud history',hist.includes(2000)||JSON.stringify(hist));
ck('history holds the last three versions',hist.length===3||JSON.stringify(hist));
await A.page.close();await A.reopen();await idle(A);
ck('A reopened: its slot now holds B\'s chosen save',await gold(A)===5000);
const aBak=await A.ev(()=>[0,1,2].map(i=>localStorage.getItem('aurelis-bak-0-'+i)).filter(Boolean).map(b=>JSON.parse(JSON.parse(b).raw).gold));
ck('A: its own 2000 save is in a local backup too',aBak.includes(2000)||JSON.stringify(aBak));

const errs=devs.reduce((a,d)=>a.concat(d.errs),[]);
ck('no page errors',errs.length===0||errs.join(' | '));
await browser.close();console.log(fails?'FAILS '+fails:'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('ERR',e);process.exit(1);});
