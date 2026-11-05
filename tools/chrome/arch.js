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
const page=await browser.newPage();const errs=[];page.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});
await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
// existing local meta (old format, no codex) with a partial bestiary, to test migration
const oldMeta=JSON.stringify({legacy:[],cycles:1,clears:2,best:{'Mossling':{seen:5,kills:4,scan:1,known:{fire:1}}},cfg:{speed:1,enc:'normal',diff:'normal',music:.45,sfx:.6,autoStats:true}});
const REM=JSON.stringify({v:1,best:{'Gust Imp':{seen:2,kills:1,scan:0,known:{}},'Mossling':{seen:1,kills:9,scan:0,known:{earth:1}}},codex:{mira:{seen:5,rec:1,lv:30}},flags:{}});
fs.writeFileSync('/tmp/claude-0/-home-claude/3e20b335-222a-5034-a09c-ede6c0dc9aa3/scratchpad/chrome/arch_page.html','<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script>if(!sessionStorage.getItem("x")){sessionStorage.setItem("x",1);localStorage.clear();localStorage.setItem("aurelis-meta-v1",'+JSON.stringify(oldMeta)+');}</script>'+MOCK.replace('window.__S=S;','window.__S=S;S.set("profile/u_test",'+REM+');')+fs.readFileSync(__dirname+'/../out/aurelis3.html','utf8')+'</body></html>');
await page.goto('file:///tmp/claude-0/-home-claude/3e20b335-222a-5034-a09c-ede6c0dc9aa3/scratchpad/chrome/arch_page.html',{waitUntil:'load'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));const ev=(f,a)=>page.evaluate(f,a);const shot=async n=>{await wait(350);await page.screenshot({path:__dirname+'/ar_'+n+'.png'});};
// remote profile already has a different entry (another device)
await wait(2500);
console.log('status',await ev(()=>__A.PROFILE.status));
console.log('merged mossling',await ev(()=>JSON.stringify(__A.META.best['Mossling'])),'gust',await ev(()=>!!__A.META.best['Gust Imp']),'codex mira',await ev(()=>JSON.stringify(__A.META.codex.mira)));
console.log('remote after',await ev(()=>JSON.stringify(__S.get('profile/u_test').best['Mossling'])));
await ev(()=>{__A.ACT.new();});await wait(300);await shot('starter');
await ev(()=>{['brann','mira','lumen'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(500);
console.log('codex after starter',await ev(()=>Object.keys(__A.META.codex).length));
// log every scourge & calamity, defeat 5
await ev(()=>{const M=__A.META;__A.GPOOL.concat(__A.FPOOL).forEach((k,i)=>{M.best[__A.guardianDef(k).n]={seen:1,kills:i<5?1:0,scan:0,known:{}};});__A.saveMeta();__A.checkArchive();__A.render();});await wait(400);await shot('letter');
await ev(()=>{__A.ACT.storyOk();__A.ACT.menu();__A.ACT.menuTab('beasts');});await shot('bestiary');
await page.evaluate(()=>{document.querySelector('#modal .panel').scrollTop=99999;});await shot('bestiary2');
await ev(()=>{__A.ACT.beast(__A.FPOOL[0]);});await shot('calamity');
await ev(()=>{__A.ACT.menuTab('codex');});await shot('codex');
await ev(()=>{__A.ACT.codex('mira');});await shot('codexentry');
await ev(()=>{__A.ACT.closeModal();__A.V.modal={type:'travel'};__A.render();});await shot('travel');
await ev(()=>__A.ACT.toArchive());await wait(800);await shot('archive');
await ev(()=>{__A.placeAt('a0',9,6,'u');__A.WS.dir='u';__A.interact();});await wait(400);await shot('vaelith');
await ev(()=>__A.ACT.recruitVaelith());await wait(300);
console.log('roster',await ev(()=>Object.keys(__A.G.roster).join(',')),'archive moves',await ev(()=>__A.archiveSkills().map(s=>s.n).join('|')));
await ev(()=>{__A.ACT.menu();__A.ACT.viewChar('vaelith');});await page.evaluate(()=>{document.querySelector('#modal .panel').scrollTop=99999;});await shot('vchar');
await ev(()=>{__A.V.modal={type:'boss',s:0};__A.render();});await shot('boss');
await ev(()=>{__A.V.modal=null;__A.setPause(300);__A.G.party=['vaelith','brann','mira'];__A.startBattle({stage:0,kind:'field'});});await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000});
await ev(()=>{const B=__A.B;});await wait(300);await shot('battle');
await wait(4000);
console.log('remote flags',await ev(()=>JSON.stringify(__S.get('profile/u_test').flags)),'remote codex keys',await ev(()=>Object.keys(__S.get('profile/u_test').codex).length));
// view-only
await ev(()=>{window.__VIEWONLY=true;__A.PROFILE.status='idle';__A.META.best['Zzz']={seen:1,kills:0,scan:0,known:{}};return __A.profileSync();});await wait(300);
await ev(()=>{__A.V.modal={type:'menu',tab:'codex'};__A.render();});await shot('localnote');
console.log('status2',await ev(()=>__A.PROFILE.status));
console.log('errs',errs.length);await browser.close();})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
