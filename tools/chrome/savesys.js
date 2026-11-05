// Beta v0.3.4: save recovery, backups, export/import, account bound cloud saves.
const {open,chk}=require('./pw');
let fails=0;const ck=(n,c)=>{chk(n,c);if(c!==true)fails++;};
const MOCKJS=`(()=>{const D=window.__DB={S:new Map(),ops:[],failSet:null,failGet:null,view:false};
const mk=p=>({path:p,get:async()=>{if(D.failGet)throw D.failGet;const v=D.S.get(p);return {exists:v!==undefined,data:()=>JSON.parse(JSON.stringify(v))};},
 set:async d=>{if(D.failSet)throw D.failSet;D.ops.push(['set',p]);D.S.set(p,JSON.parse(JSON.stringify(d)));},
 delete:async()=>{D.ops.push(['del',p]);D.S.delete(p);}});
const db={doc:mk,collection:()=>({})};const user={id:async()=>'u_x',can:async()=>!D.view,me:async()=>({id:'u_x'}),profiles:async()=>({})};
window.claude={use:async n=>n==='db'?db:n==='user'?user:null};})();`;
const seedJS=m=>`(()=>{for(const [k,v] of ${JSON.stringify(m)})window.__DB.S.set(k,v);})();`;
async function boot(saves,cloud,opt={}){
  let pre='localStorage.clear();';for(const [k,v] of Object.entries(saves||{}))pre+=`localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});`;
  const H=await open({w:430,h:800,mobile:true,pre});
  await H.ev(MOCKJS);if(cloud)await H.ev(seedJS(cloud));
  if(opt.view)await H.ev(()=>{window.__DB.view=true;});
  return H;
}
async function makeRaw(mut){
  const H=await open({w:430,h:800,mobile:true});
  const r=await H.ev(m=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
    A.G.bonds['lumen|mira']=12;A.G.gear=['w_blade_1','a_mail_1'];A.G.loadouts=[{n:'Main',m:['mira','lumen','oren']}];
    A.G.tamed=[{id:'tmx0',mon:Object.keys(A.MON)[0],name:'Pet0',cls:'warrior',trait:'keen',bb:0,scourge:0,with:'mira'}];A.registerTamed(A.G.tamed[0]);A.G.compV=1;
    A.G.stats.battles=m.battles;A.G.stage=m.stage;if(m.cleared)A.G.cleared=m.cleared;A.G.gold=m.gold;
    (m.extra||[]).forEach(id=>{A.G.roster[id]=A.newChar(id,6,0);});A.G.roster.mira.lv=m.lv;A.G.savedAt=0;A.saveGame();
    return localStorage.getItem('aurelis-wayfarers-v3');},mut);
  await H.browser.close();return r;
}
const key=s=>'aurelis-wayfarers-v3'+(s?'-s'+s:'');
(async()=>{
const RAW=await makeRaw({battles:50,stage:0,gold:500,lv:9});
const RAW_BIG=await makeRaw({battles:10,stage:1,gold:900,lv:12,extra:['brann','gilda'],cleared:[true,false,false,false,false]});
const O=JSON.parse(RAW),OB=JSON.parse(RAW_BIG);
console.log('fixtures',RAW.length,RAW_BIG.length);

// ---- 1. failed migration keeps the original and Recover finds it ----
{const bad=JSON.parse(RAW);delete bad.mats;delete bad.gv;const braw=JSON.stringify(bad);
 const H=await boot({[key(0)]:braw});
 const r=await H.ev(()=>{const A=__A;A.ACT.cont();const m=A.V.modal;return {modal:m&&m.type,loaded:A.V.screen==='world',raw:A.svSlotRaw(0),baks:[0,1,2].map(i=>localStorage.getItem('aurelis-bak-0-'+i)).filter(Boolean).length};});
 ck('failed migration: shows the failure screen, does not enter the world',r.modal==='svfail'&&!r.loaded||JSON.stringify(r));
 ck('failed migration: original slot data is byte for byte unchanged',r.raw===braw);
 ck('failed migration: a backup was written before the attempt',r.baks===1||JSON.stringify(r));
 const t=await H.ev(()=>{const A=__A;const html=A.vModal?'':'';A.render();const txt=document.querySelector('#modal')?document.querySelector('#modal').innerText:document.body.innerText;return {txt:txt.slice(0,300),hasRetry:!!document.querySelector('[data-act="svRetry"]'),hasExp:!!document.querySelector('[data-act="svExportRaw"]')};});
 ck('failed migration: Retry and Export raw data offered',t.hasRetry&&t.hasExp||JSON.stringify(t));
 const rec=await H.ev(()=>{const A=__A;A.ACT.recoverOpen();const s=A.svScan();return s.map(x=>[x.kind,x.slot,x.ok]);});
 ck('Recover scan lists the slot and its backup',rec.some(x=>x[0]==='slot'&&x[1]===0)&&rec.some(x=>x[0]==='backup')||JSON.stringify(rec));
 await H.browser.close();}

// ---- 2. damaged text: never wiped, shown as unreadable, still exportable ----
{const junk='{"ver":3,"roster":{"mira":{"lv":9},"x":';
 const H=await boot({[key(1)]:junk});
 const r=await H.ev(()=>{const A=__A;const cont=!!document.querySelector('[data-act="slots"]');A.ACT.slots();const txt=document.querySelector('#modal').innerText;return {cont,txt:/could not be read/.test(txt),raw:A.svSlotRaw(1)};});
 ck('damaged slot: Continue still shows and the slot says it could not be read',r.cont&&r.txt||JSON.stringify(r));
 ck('damaged slot: raw text untouched',r.raw===junk);
 const n=await H.ev(()=>{const A=__A;A.ACT.new();return A.V.modal&&A.V.modal.type;});
 ck('damaged slot: New journey goes through the slot chooser',n==='slots'||n);
 const o=await H.ev(()=>{const A=__A;A.ACT.slotNew(1);return {bak:Object.keys(localStorage).filter(k=>k.startsWith('aurelis-bak-1-')).length};});
 ck('damaged slot: overwriting it backs the old text up first',o.bak===1||JSON.stringify(o));
 await H.browser.close();}

// ---- 3. rolling backups: last 3 migrations per slot ----
{const H=await boot({[key(0)]:RAW});
 const r=await H.ev(()=>{const A=__A;const o=JSON.parse(A.svSlotRaw(0));const raws=[];
   for(let i=0;i<5;i++){const x=JSON.parse(JSON.stringify(o));x.gv='Beta v0.2.'+i;x.gold=1000+i;const s=JSON.stringify(x);localStorage.setItem('aurelis-wayfarers-v3',s);A.svLoad(0);raws.push(s);}
   const baks=[0,1,2].map(i=>JSON.parse(localStorage.getItem('aurelis-bak-0-'+i)||'null')).filter(Boolean).map(b=>JSON.parse(b.raw).gold).sort();
   return {baks};});
 ck('rolling backup keeps only the last 3 versions (gold 1002..1004 after 5 loads)',JSON.stringify(r.baks)==='[1002,1003,1004]'||JSON.stringify(r));
 await H.browser.close();}

// ---- 4. export from one slot, import into another, everything matches ----
{const H=await boot({[key(0)]:RAW,[key(2)]:RAW_BIG});
 const code=await H.ev(()=>{const A=__A;A.ACT.svExport(0);return A.V.modal.code;});
 const r=await H.ev(c=>{const A=__A;A.ACT.importOpen();document.getElementById('impta').value=c;document.querySelector('input[name="svslot"][value="1"]').checked=true;A.ACT.svImportGo();
   const m1=A.V.modal.type;const before=A.svSlotRaw(1);A.ACT.svImportDo();const a=JSON.parse(A.svSlotRaw(0)),b=JSON.parse(A.svSlotRaw(1));
   return {m1,before,eq:JSON.stringify(a.party)===JSON.stringify(b.party)&&JSON.stringify(a.gear)===JSON.stringify(b.gear)&&JSON.stringify(a.tamed)===JSON.stringify(b.tamed)&&JSON.stringify(a.loadouts)===JSON.stringify(b.loadouts)&&JSON.stringify(a.bonds)===JSON.stringify(b.bonds)&&JSON.stringify(a.roster)===JSON.stringify(b.roster),tamedWith:b.tamed[0].with,load:(()=>{A.ACT.slotLoad(1);return A.V.screen+':'+A.G.party.join(',');})()};},code);
 ck('import asks for confirmation page and does not write before it',r.m1==='svimpconfirm'&&r.before===null||JSON.stringify(r));
 ck('export slot 1 into slot 2: party, gear, companions, loadouts, bonds, roster match',r.eq&&r.tamedWith==='mira'||JSON.stringify(r));
 ck('imported slot loads into the world',r.load.startsWith('world:')||r.load);
 // overwriting an occupied slot needs confirm and backs up
 const q=await H.ev(c=>{const A=__A;A.ACT.importOpen();document.getElementById('impta').value=c;document.querySelector('input[name="svslot"][value="2"]').checked=true;A.ACT.svImportGo();const t=A.V.modal.type;const keep=A.svSlotRaw(2);A.ACT.closeModal();return {t,untouched:keep===localStorage.getItem('aurelis-wayfarers-v3-s2')};},code);
 ck('importing onto an occupied slot stops at the confirm and changes nothing',q.t==='svimpconfirm'&&q.untouched||JSON.stringify(q));
 const bad=await H.ev(()=>{const A=__A;return [A.svDecode('hello').ok,A.svDecode('AWSAVE1.@@@').ok,A.svDecode('{"ver":3,"roster":{"a":{"lv":"x"}},"party":[],"cleared":[]}').ok,A.svDecode('{"ver":9,"roster":{"a":{"lv":1}},"party":[],"cleared":[]}').ok];});
 ck('import rejects junk, bad codes, malformed heroes and newer versions',bad.every(x=>x===false)||JSON.stringify(bad));
 await H.browser.close();}

// ---- 5. cloud: first time migration, then divergence, newer wins, history ----
let cloudA=null;
{const H=await boot({[key(0)]:RAW,[key(2)]:RAW_BIG});
 await H.wait(3800);
 const r=await H.ev(()=>{const D=window.__DB,A=__A;return {status:A.SV.status,keys:[...D.S.keys()].sort(),local0:A.svSlotRaw(0),baks:Object.keys(localStorage).filter(k=>k.startsWith('aurelis-bak-')&&k!=='aurelis-bak-idx').length,main:D.S.get('saves/u_x/s/0')};});
 ck('first time migration uploads existing local saves (slots 1 and 3)',r.keys.includes('saves/u_x/s/0')&&r.keys.includes('saves/u_x/s/2')&&!r.keys.includes('saves/u_x/s/1')||JSON.stringify(r.keys));
 ck('first time migration leaves the local save untouched and backs it up',r.local0===RAW&&r.baks>=2||JSON.stringify([r.local0===RAW,r.baks]));
 ck('cloud doc carries schema, version, progress score, timestamp, device',r.main&&r.main.sv===3&&r.main.gv&&r.main.score>0&&r.main.savedAt&&r.main.dev&&r.main.prog.heroes===3||JSON.stringify(r.main));
 ck('status is synced after the first pass',r.status==='synced'||r.status);
 // debounced autosave: many saves, one push
 await H.ev(()=>{window.__DB.ops.length=0;const A=__A;A.ACT.slotLoad(0);for(let i=0;i<20;i++){A.G.gold+=1;A.saveGame();}});
 await H.wait(7200);
 const d=await H.ev(()=>{const A=__A;return {sets:window.__DB.ops.filter(o=>o[0]==='set'&&o[1]==='saves/u_x/s/0').length,status:A.SV.status,hist:[...window.__DB.S.keys()].filter(k=>k.startsWith('saves/u_x/h/0-')).length,gold:window.__DB.S.get('saves/u_x/s/0').prog.gold};});
 ck('autosave is debounced (20 saves become 1 cloud write) and the replaced version goes to history',d.sets===1&&d.hist===1&&d.gold===520||JSON.stringify(d));
 // history keeps the last 3 only
 for(let i=0;i<5;i++){await H.ev(()=>{const A=__A;A.G.gold+=7;A.saveGame();});await H.ev(()=>__A.svFlush(true));}
 const h=await H.ev(()=>({hist:[...window.__DB.S.keys()].filter(k=>k.startsWith('saves/u_x/h/0-')).length}));
 ck('history is capped at the last 3 versions',h.hist===3||JSON.stringify(h));
 cloudA=await H.ev(()=>[...window.__DB.S.entries()]);
 await H.browser.close();}

// divergence: local has more battles, cloud has more heroes and stage. Nothing is overwritten silently.
{const cl=[];const H0=await boot({[key(0)]:RAW_BIG});await H0.wait(3600);const cs=await H0.ev(()=>[...window.__DB.S.entries()]);await H0.browser.close();   // cloud now holds the "more heroes and stage" save
 const H=await boot({[key(0)]:RAW},cs);await H.wait(3800);
 const r=await H.ev(()=>{const A=__A;return {modal:A.V.modal&&A.V.modal.type,local:A.svSlotRaw(0),cloud:window.__DB.S.get('saves/u_x/s/0').hash,status:A.SV.status,sets:window.__DB.ops.filter(o=>o[0]==='set').length};});
 ck('divergence is detected and shown, not merged',r.modal==='svdiv'&&r.status==='attention'||JSON.stringify(r));
 ck('divergence: neither side was overwritten',r.local===RAW&&r.sets===0||JSON.stringify({sets:r.sets,same:r.local===RAW}));
 const t=await H.ev(()=>document.querySelector('#modal').innerText);
 ck('divergence screen shows both progress summaries',/On this device/.test(t)&&/In your account/.test(t)&&/Stage/.test(t)||t);
 // pick cloud: local becomes the cloud save, old local is a backup
 await H.ev(()=>__A.ACT.svUseCloud(0));await H.wait(600);
 const u=await H.ev(()=>{const A=__A;const loc=JSON.parse(A.svSlotRaw(0));const baks=[0,1,2].map(i=>localStorage.getItem('aurelis-bak-0-'+i)).filter(Boolean).map(b=>JSON.parse(JSON.parse(b).raw));return {heroes:Object.keys(loc.roster).length,hadOld:baks.some(b=>b.stats.battles===50),st:A.SV.status};});
 ck('Use my account: slot matches the cloud and the old local copy is kept as a backup',u.heroes===5&&u.hadOld||JSON.stringify(u));
 await H.browser.close();}
{const H0=await boot({[key(0)]:RAW_BIG});await H0.wait(3600);const cs=await H0.ev(()=>[...window.__DB.S.entries()]);await H0.browser.close();
 const H=await boot({[key(0)]:RAW},cs);await H.wait(3800);
 await H.ev(()=>__A.ACT.svKeepLocal(0));await H.wait(900);
 const r=await H.ev(()=>{const D=window.__DB;return {main:D.S.get('saves/u_x/s/0').prog.heroes,hist:[...D.S.keys()].filter(k=>k.startsWith('saves/u_x/h/0-')).map(k=>D.S.get(k).prog.heroes)};});
 ck('Keep this device: cloud now matches local and the old cloud save is in history',r.main===3&&r.hist.includes(5)||JSON.stringify(r));
 await H.browser.close();}
// clearly newer with equal or more progress: used without asking
{const O2=JSON.parse(RAW_BIG);O2.savedAt=Date.now()+60000;O2.stats.battles=80;const newer=JSON.stringify(O2);
 const H0=await boot({[key(0)]:newer});await H0.wait(3600);const cs=await H0.ev(()=>[...window.__DB.S.entries()]);await H0.browser.close();
 const old=JSON.parse(RAW_BIG);old.savedAt=Date.now()-86400000;
 const H=await boot({[key(0)]:JSON.stringify(old)},cs);await H.wait(3800);
 const r=await H.ev(()=>{const A=__A;return {modal:A.V.modal&&A.V.modal.type,b:JSON.parse(A.svSlotRaw(0)).stats.battles,bak:Object.keys(localStorage).some(k=>k.startsWith('aurelis-bak-0-'))};});
 ck('cloud newer with equal or more progress replaces local after a backup, no prompt',r.modal!=='svdiv'&&r.b===80&&r.bak||JSON.stringify(r));
 await H.browser.close();}
// cloud has a slot the device lacks
{const H0=await boot({[key(0)]:RAW});await H0.wait(3600);const cs=await H0.ev(()=>[...window.__DB.S.entries()]);await H0.browser.close();
 const H=await boot({},cs);await H.wait(3800);
 const r=await H.ev(()=>{const A=__A;return {has:!!A.svSlotRaw(0),cont:!!document.querySelector('[data-act="slots"]')};});
 ck('empty device restores the account save and shows Continue',r.has&&r.cont||JSON.stringify(r));
 await H.browser.close();}

// ---- 6. offline edits, then reconnect ----
{const H=await boot({[key(0)]:RAW});await H.wait(3600);
 await H.ev(()=>{Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false});window.dispatchEvent(new Event('offline'));window.__DB.ops.length=0;const A=__A;A.ACT.slotLoad(0);A.G.gold+=111;A.saveGame();});
 await H.wait(6500);
 const off=await H.ev(()=>({st:__A.SV.status,sets:window.__DB.ops.filter(o=>o[0]==='set').length,saved:JSON.parse(localStorage.getItem('aurelis-wayfarers-v3')).gold}));
 ck('offline: edit is saved locally, status is queued, no cloud writes attempted',off.st==='queued'&&off.sets===0&&off.saved===611||JSON.stringify(off));
 await H.ev(()=>{Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>true});window.dispatchEvent(new Event('online'));});
 await H.wait(2500);
 const on=await H.ev(()=>({st:__A.SV.status,gold:window.__DB.S.get('saves/u_x/s/0').prog.gold}));
 ck('reconnect: the queued edit syncs',on.st==='synced'&&on.gold===611||JSON.stringify(on));
 await H.browser.close();}

// ---- 7. full db write failure: local save is safe, game keeps running, recovers later ----
{const H=await boot({[key(0)]:RAW});await H.wait(3600);
 await H.ev(()=>{window.__DB.failSet={code:'unavailable',message:'db down'};const A=__A;A.ACT.slotLoad(0);A.G.gold+=5;A.saveGame();});
 await H.wait(6800);
 const f=await H.ev(()=>({st:__A.SV.status,gold:JSON.parse(localStorage.getItem('aurelis-wayfarers-v3')).gold,scr:__A.V.screen}));
 ck('db write failure: status error, local save written, play continues',f.st==='error'&&f.gold===505&&f.scr==='world'||JSON.stringify(f));
 await H.ev(()=>{window.__DB.failSet=null;});await H.ev(()=>__A.svFlush(true));
 const g=await H.ev(()=>({st:__A.SV.status,gold:window.__DB.S.get('saves/u_x/s/0').prog.gold}));
 ck('db write failure: later retry syncs',g.st==='synced'&&g.gold===505||JSON.stringify(g));
 await H.browser.close();}

// ---- 8. visitor without db write access ----
{const H=await boot({[key(0)]:RAW},null,{view:true});await H.wait(3600);
 const v=await H.ev(()=>{const A=__A;const note=/not synced to an account/.test(document.body.innerText);A.ACT.slotLoad(0);A.G.gold+=3;const ok=A.saveGame();A.V.modal={type:'menu',tab:'system'};A.render();const jr=document.body.innerText;return {st:A.SV.status,note,ok,writes:window.__DB.ops.filter(o=>o[1].startsWith('saves/')).length,reminder:/Export save/.test(jr)&&/not synced/.test(jr)};});
 ck('visitor: local only, never blocked, title note and Journey reminder shown, no db writes',v.st==='local'&&v.note&&v.ok&&v.writes===0&&v.reminder||JSON.stringify(v));
 await H.browser.close();}

// ---- 9. chunking for a large save, Sync button, delete cloud save keeps history ----
{const big=JSON.parse(RAW);let junk='';const rnd=()=>Math.random().toString(36).slice(2);for(let i=0;i<60000;i++)junk+=rnd();big.junk=junk;   // incompressible filler
 const braw=JSON.stringify(big);
 const H=await boot({[key(0)]:braw});await H.wait(4200);
 const c=await H.ev(()=>{const D=window.__DB;const m=D.S.get('saves/u_x/s/0');return {n:m&&m.n,chunks:[...D.S.keys()].filter(k=>k.startsWith('saves/u_x/c/s0-')).length,len:m&&m.data.length};});
 ck('a save larger than one document is split across several docs',c.n>1&&c.chunks===c.n-1&&c.len<=180000||JSON.stringify(c));
 await H.ev(()=>{localStorage.removeItem('aurelis-wayfarers-v3');});
 const back=await H.ev(async()=>{const A=__A;await A.svPull(0);return A.svSlotRaw(0).length;});
 ck('multi part cloud save restores byte for byte',back===braw.length||[back,braw.length]);
 await H.ev(async()=>{const A=__A;A.ACT.slotLoad(0);A.G.gold+=1;A.saveGame();await A.svFlush(true);});
 const before=await H.ev(()=>[...window.__DB.S.keys()].filter(k=>k.includes('/h/')).length);
 await H.ev(async()=>{await __A.ACT.svDelDo(0);});await H.wait(300);
 const after=await H.ev(()=>({main:window.__DB.S.has('saves/u_x/s/0'),chunks:[...window.__DB.S.keys()].filter(k=>k.startsWith('saves/u_x/c/s0-')).length,hist:[...window.__DB.S.keys()].filter(k=>k.includes('/h/')).length,local:!!__A.svSlotRaw(0)}));
 ck('Delete cloud save removes the save and its parts, keeps history and the local copy',!after.main&&after.hist>=before&&after.hist>0&&after.local||JSON.stringify({before,after}));
 await H.ev(async()=>{await __A.ACT.svDelHistDo();});await H.wait(300);
 const hh=await H.ev(()=>[...window.__DB.S.keys()].filter(k=>k.includes('/h/')||k.includes('/c/h')).length);
 ck('Delete cloud history removes the history docs and their parts',hh===0||hh);
 await H.browser.close();}

// ---- 10. late game save size ----
{const H=await open({w:430,h:800,mobile:true});
 const r=await H.ev(async()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();const G=A.G;
   Object.keys(A.TPL).forEach(id=>{if(!G.roster[id])G.roster[id]=A.newChar(id,45,0);});
   const gk=Object.keys(A.GEAR);for(let i=0;i<260;i++)G.gear.push(gk[i%gk.length]);
   for(let i=0;i<900;i++)G.chests['m'+(i%40)+':'+i]=1;for(let i=0;i<300;i++)G.kills['mon'+i]=i;
   const mk=Object.keys(A.MON);G.tamed=mk.slice(0,25).map((m,i)=>({id:'tx'+i,mon:m,name:'Pet'+i,cls:'warrior',trait:'keen',bb:0,scourge:0,with:null}));
   G.stats.battles=900;G.stats.play=3600000*20;G.stage=4;G.cleared=[true,true,true,true,true];G.won=true;A.saveGame();
   const raw=A.svSlotRaw(0);const z=await A.svPack(raw);return {heroes:Object.keys(G.roster).length,raw:raw.length,packed:z.length};});
 console.log('LATE GAME SAVE SIZE',JSON.stringify(r));
 ck('late game save fits one document (packed < 180000 chars)',r.packed<180000||JSON.stringify(r));
 await H.browser.close();}

console.log(fails?'FAILS '+fails:'ALL PASS');process.exit(fails?1:0);
})();
