const chromium=require('@sparticuz/chromium').default||require('@sparticuz/chromium');
const puppeteer=require('puppeteer-core');const fs=require('fs');
const MOCK=`<script>(()=>{const S=new Map();const mk=(p,d)=>({id:p.split('/').pop(),exists:!!d,data:()=>d?JSON.parse(JSON.stringify(d)):undefined,metadata:{}});
const q=(cp,o)=>({orderBy:(f,dir)=>q(cp,Object.assign({},o,{f,dir})),limit:n=>q(cp,Object.assign({},o,{n})),where:()=>q(cp,o),
 get:async()=>{let docs=[...S.entries()].filter(([k])=>k.startsWith(cp+'/')&&k.slice(cp.length+1).split('/').length===1).map(([k,v])=>mk(k,v));
  if(o.f)docs.sort((a,b)=>(a.data()[o.f]-b.data()[o.f])*(o.dir==='desc'?-1:1));if(o.n)docs=docs.slice(0,o.n);return {docs,size:docs.length,empty:!docs.length};},
 doc:id=>D(cp+'/'+id)});
const D=p=>({id:p.split('/').pop(),path:p,get:async()=>mk(p,S.get(p)),set:async d=>{if(window.__VIEWONLY)throw {code:'invalid_argument'};S.set(p,JSON.parse(JSON.stringify(d)));},update:async d=>{if(!S.has(p))throw {code:'invalid_argument'};S.set(p,Object.assign(S.get(p),d));},collection:c=>q(p+'/'+c,{})});
const db={doc:D,collection:p=>q(p,{})};window.__S=S;
const user={me:async()=>({id:'u_test',name:'Tess Tester',isOwner:true,canEdit:true}),id:async()=>'u_test',isOwner:async()=>true,can:async()=>window.__VIEWONLY?false:true,profiles:async()=>({})};
window.claude={use:async n=>n==='db'?db:n==='user'?user:null};})();</script>`;


(async()=>{const browser=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:'shell'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));const chk=(n,c)=>console.log((c?'PASS ':'FAIL ')+n+(c&&c!==true?' '+c:''));
const P=__dirname+'/p3_page.html';
async function open(html,pre){const page=await browser.newPage();const errs=[];page.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script>localStorage.clear();'+(pre?'const PRE='+JSON.stringify(pre)+';Object.keys(PRE).forEach(k=>localStorage.setItem(k,PRE[k]));':'')+'</script>'+MOCK+html+'</body></html>');
  await page.goto('file://'+P,{waitUntil:'load'});page.errs=errs;return page;}
// ---------- 1) an old v0.3.0 save with two tames in the party ----------
const oldHtml=fs.readFileSync(__dirname+'/../out/aurelis_v030.html','utf8').replace('window.__A={','window.__A={tameElite,');
let pg=await open(oldHtml);
const old=await pg.evaluate(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
  const a=A.tameElite({mon:'gustimp',name:'Gust Imp Pip'}),b=A.tameElite({mon:'cinderpup',name:'Cinder Pup Ember'});A.saveGame();
  const ls={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);ls[k]=localStorage.getItem(k);}
  return {ls,party:A.G.party.slice(),gear:A.G.gear.length,tameEq:A.G.roster[a.id].eq,ver:A.GAME_VERSION};});
console.log('old save',old.ver,'party',old.party.join(','),'pack',old.gear,'tame eq',JSON.stringify(old.tameEq));
await pg.close();
pg=await open(fs.readFileSync(__dirname+'/../out/aurelis3.html','utf8'),old.ls);
const mig=await pg.evaluate(()=>{const A=__A;A.ACT.cont();const G=A.G;return {party:G.party.slice(),roster:Object.keys(G.roster),tamed:G.tamed.map(o=>o.name+'>'+o.with),compV:G.compV,gear:G.gear.length,
  bonus:G.party.map(id=>A.calcStats(G.roster[id]).comp||'-'),screen:A.V.screen};});
console.log('migrated',JSON.stringify(mig));
chk('old save loads into the world',mig.screen==='world');
chk('tames left the roster and party',mig.party.length===3&&!mig.roster.some(id=>id.startsWith('tm')));
chk('both became companions paired to heroes',mig.tamed.length===2&&mig.tamed.every(t=>!/>null$/.test(t))&&mig.compV===1);
chk('their gear went back to the pack',mig.gear>=old.gear);
chk('paired heroes get the bonus',mig.bonus.filter(x=>x!=='-').length===2);
// ---------- 2) summon in battle ----------
await pg.evaluate(()=>{const A=__A;A.V.modal=null;A.setPause(5);A.G.party.forEach(id=>{const h=A.G.roster[id];h.hp=h.S.mhp;});A.startBattle({stage:0,kind:'field'});});
await pg.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:20000}).catch(()=>{});
const sm=await pg.evaluate(async()=>{const A=__A,B=A.B;const h=B.front.find(c=>A.compOf(c));B.cur=h;A.render();const btn=!!document.querySelector('[data-act="summon"]')||/Summon/.test(document.getElementById('bcmd').innerText);
  A.summonComp();B.auto=true;A.V.auto=true;const out={btn,summoned:!!(B.summoned&&B.summoned[h.id]),front:B.front.map(u=>u.name+(u.isComp?'*':''))};
  for(let i=0;i<2000&&A.B&&!A.B.over;i++){if(A.B.mode==='cmd'&&A.B.cur&&A.B.cur.side==='p')A.autoTurn();await new Promise(r=>setTimeout(r,10));}
  out.state=A.B?{mode:A.B.mode,cur:A.B.cur&&A.B.cur.name,time:A.B.time,units:A.B.front.concat(A.B.en).map(u=>u.name+':'+u.hp+':'+(u.next|0)+(u.hidden?'h':''))}:null;const L=JSON.stringify(A.B?A.B.log:'')+document.body.innerText;out.logSum=/summons/.test(L);out.ret=/returns to|steps back in/.test(L);out.over=!A.B||A.B.over;out.after=A.B?A.B.front.map(u=>u.name+(u.isComp?'*':'')):[];out.roster=Object.keys(A.G.roster).length;return out;});
console.log('summon',JSON.stringify(sm));
chk('Summon button shows, the companion takes the slot',sm.btn&&sm.summoned&&sm.front.some(x=>x.endsWith('*')));
chk('battle ends with only real heroes in the line',sm.over&&!sm.after.some(x=>x.endsWith('*')));
await pg.close();
// ---------- 3) everything else on a fresh game ----------
pg=await open(fs.readFileSync(__dirname+'/../out/aurelis3.html','utf8'));
await pg.evaluate(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();});
const ch=await pg.evaluate(()=>{const A=__A,G=A.G;G.stage=3;const E=A.challEligible().map(c=>c.hero);const seen={},first=A.challVisible().map(c=>c.hero),same=A.challVisible().map(c=>c.hero).join()===first.join();
  let gap={},last={},maxGap={};E.forEach(h=>{last[h]=0;maxGap[h]=0;});
  for(let i=1;i<=200;i++){A.rerollTavern();const v=A.challVisible().map(c=>c.hero);v.forEach(h=>{seen[h]=(seen[h]||0)+1;maxGap[h]=Math.max(maxGap[h],i-last[h]);last[h]=i;});}
  // accept one, then rotate: it must stay
  const h=A.challVisible()[0].hero;G.chall=G.chall||{};G.chall[h]={state:'active',have:0};let stays=true;for(let i=0;i<10;i++){A.rerollTavern();const v=A.challVisible();if(!v.some(c=>c.hero===h))stays=false;if(v.length!==4)stays=false;}
  const legend=A.CHALL.filter(c=>A.TPL[c.hero].src==='L'||A.TPL[c.hero].src==='x').length;
  const tav=A.tavernPool().filter(id=>A.CHALL.some(c=>c.hero===id));
  return {E,first,same,seen,maxGap,stays,legend,tav,dual:E.filter(h=>A.TPL[h].el.length>1)};});
console.log('challenges',JSON.stringify(ch));
chk('board shows 3 open and holds steady within a roll',ch.first.length===3&&ch.same);
chk('every eligible hero comes around (max wait in rotations)',ch.E.every(h=>ch.seen[h]>0)&&JSON.stringify(ch.maxGap));
chk('accepted challenge stays posted through rotations',ch.stays);
chk('no legendaries in the pool, pooled heroes out of the tavern',ch.legend===0&&ch.tav.length===0);
// clock and night
const ck=await pg.evaluate(()=>{const A=__A,G=A.G;G.stage=0;G.clock=0;const p0=A.clockPhase();A.tickClock(400);const p1=A.clockPhase();
  let nightN=0,tot=0,pow=[];for(let i=0;i<40;i++){const f=A.encounterFoes({stage:0,kind:'field'});f.forEach(e=>{tot++;if(/^n_/.test(e.key||e.k||e.mon||'')||e.night)nightN++;});}
  const nv=A.encounterFoes({stage:0,kind:'field'}).map(e=>e.name).join(',');G.clock=0;const dv=A.encounterFoes({stage:0,kind:'field'}).map(e=>e.name).join(',');
  A.tickClock(400);A.restAll();const morning=G.clock;const c0=G.clock;A.campRest&&A.campRest();
  return {p0,p1,nightN,tot,nv,dv,morning,camp:G.clock-c0};});
console.log('clock',JSON.stringify(ck));
chk('clock: day then night after 400 steps',ck.p0==='day'&&ck.p1==='night');
chk('night foes are flagged night variants',ck.nightN===ck.tot);
chk('inn sets morning',ck.morning===0);
// weather persists
const wx=await pg.evaluate(()=>{const A=__A,G=A.G;A.placeAt('f0',A.getMap('f0').sx||5,A.getMap('f0').sy||5);G.weather[0]=null;A.wxStep();const w0=G.weather[0],n0=G.wx[0];let changes=0,prev=w0;
  for(let i=0;i<3000;i++){A.wxStep();if(G.weather[0]!==prev){changes++;prev=G.weather[0];}}return {w0,n0,changes};});
console.log('weather',JSON.stringify(wx));
chk('weather holds for hundreds of steps',wx.n0>=300&&wx.changes<=10);
// mimics
const mm=await pg.evaluate(()=>{const A=__A,G=A.G;let ch=0,mi=0,vault=0;for(let seed=1;seed<=40;seed++){G.run.seed=seed*7919;A.resetMaps();for(let s=0;s<5;s++){const m=A.getMap('d'+s);(m.chests||[]).forEach(c=>{if(c[2]==='vault'){vault++;if(A.isMimic(m,c[0],c[1]))mi+=1000;return;}ch++;if(A.isMimic(m,c[0],c[1]))mi++;});}}
  return {ch,mi,vault,best:A.bestAll().some(o=>o.k==='mimic')};});
console.log('mimics',JSON.stringify(mm),'rate',(mm.mi/mm.ch*100).toFixed(1)+'%');
chk('mimic rate within 10-15% and never a vault chest',mm.mi/mm.ch>=.1&&mm.mi/mm.ch<=.15);
chk('mimic in the Bestiary',mm.best);
chk('no page errors',!pg.errs.length);
await browser.close();})();
