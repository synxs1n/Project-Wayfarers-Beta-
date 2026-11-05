// Phase 7: go offline mid play, save, reconnect, verify union sync
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:800,mobile:true});const {ev,wait,ctx,page}=H;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
// make the mock db behave like a real network: every call fails while the browser is offline
await ev(()=>{const base=window.claude.use;window.__ops=[];
  const wrapDoc=(d,p)=>({get:async()=>{if(!navigator.onLine)throw new Error('network');return d.get();},set:async x=>{if(!navigator.onLine)throw new Error('network');window.__ops.push(['set',p]);return d.set(x);},update:async x=>{if(!navigator.onLine)throw new Error('network');return d.update(x);}});
  window.claude.use=async n=>{const o=await base(n);if(n!=='db')return o;return {doc:p=>wrapDoc(o.doc(p),p),collection:c=>o.collection(c)};};});
// online baseline
await ev(()=>{__A.codexSee('lumen',{rec:1,lv:3});return __A.profileSync();});await wait(400);
let r=await ev(()=>({st:__A.PROFILE.status,remote:!!window.__S.get('profile/u_test'),pill:document.getElementById('offl')?.className}));
console.log(JSON.stringify(r));chk('online: profile syncs to the account',r.st==='synced'&&r.remote||JSON.stringify(r));
// ---- go offline mid play ----
await ctx.setOffline(true);await wait(300);
r=await ev(()=>({on:__A.OFF.online,pill:document.getElementById('offl').className,txt:document.getElementById('offl').textContent}));
console.log(JSON.stringify(r));chk('offline indicator appears',!r.on&&/off/.test(r.pill)&&/Offline/.test(r.txt)||JSON.stringify(r));
// play: walk, save, record bestiary + codex, send feedback
const before=await ev(()=>{const A=__A;A.G.gold+=77;A.saveGame();A.codexSee('brann',{rec:1,lv:5});A.META.best['Slime']={seen:1,kills:3,scan:1,known:{fire:1}};A.saveMeta&&A.saveMeta();
  A.profileSync();return {gold:A.G.gold,saved:Object.keys(localStorage).filter(k=>k.startsWith('aurelis-wayfarers-v3')).length};});
await wait(300);
// feedback while offline
await ev(()=>{const A=__A;A.ACT.fbOpen();A.fbDraft().title='Offline report';A.fbDraft().desc='written with no connection';A.ACT.fbSend();});await wait(300);
// a second queued report whose id already exists remotely (as if an earlier attempt half-finished), plus an owner reply on it
await ev(()=>{const A=__A,q=A.META.q;const dup={id:'dupid1',category:'bug',title:'Dup',description:'queued copy',repro:'',name:'',ts:1,context:{},status:'new',response:''};q.fb.push(dup);window.__S.set('feedback/u_test/reports/dupid1',Object.assign({},dup,{status:'fixed',response:'dev reply'}));
  // another device already added bestiary/codex progress remotely
  const p=window.__S.get('profile/u_test');p.codex.sable={seen:5,rec:1,lv:9};p.best['Slime']={seen:2,kills:10,scan:0,known:{ice:1}};p.best['Wolf']={seen:1,kills:1,scan:0,known:{}};window.__S.set('profile/u_test',p);return 1;});
r=await ev(()=>({q:__A.META.q&&{fb:__A.META.q.fb.length,prof:__A.META.q.prof},pend:__A.offPending(),st:__A.PROFILE.status,saveOk:!!localStorage.getItem('aurelis-meta-v1'),txt:document.getElementById('offl').textContent,sent:__A.V.fbSent&&__A.V.fbSent.queued,remoteNewReport:[...window.__S.keys()].filter(k=>k.startsWith('feedback/u_test/reports/')).length}));
console.log(JSON.stringify(r));
chk('offline: feedback and profile are queued, nothing written remotely',r.q.fb>=2&&r.q.prof===1&&r.st==='offline'&&r.sent&&r.remoteNewReport===1||JSON.stringify(r));
chk('offline: saving still works',r.saveOk&&before.saved>=1||JSON.stringify([r,before]));
// ---- reconnect ----
await ctx.setOffline(false);await wait(2500);
r=await ev(()=>{const A=__A,S=window.__S,pr=S.get('profile/u_test'),rep=[...S.keys()].filter(k=>k.startsWith('feedback/u_test/reports/'));
  return {on:A.OFF.online,st:A.PROFILE.status,q:A.META.q,remoteCodex:Object.keys(pr.codex).sort(),remoteSlime:pr.best['Slime'],remoteWolf:!!pr.best['Wolf'],localCodex:Object.keys(A.META.codex).sort(),localSlime:A.META.best['Slime'],localWolf:!!A.META.best['Wolf'],
    reports:rep.length,dup:S.get('feedback/u_test/reports/dupid1'),mine:rep.map(k=>S.get(k).title).sort(),pill:document.getElementById('offl').className};});
console.log(JSON.stringify(r));
chk('reconnect: queue drains and status is synced',r.on&&r.st==='synced'&&!r.q.prof&&r.q.fb.length===0||JSON.stringify([r.on,r.st,r.q]));
chk('union merge: remote has this device and the other device',['brann','lumen','sable'].every(k=>r.remoteCodex.includes(k))&&r.remoteWolf&&r.remoteSlime.kills===10&&!!(r.remoteSlime.known.fire&&r.remoteSlime.known.ice)||JSON.stringify([r.remoteCodex,r.remoteSlime]));
chk('union merge: this device also gained the other device\'s progress',r.localCodex.includes('sable')&&r.localWolf&&r.localSlime.kills===10||JSON.stringify([r.localCodex,r.localSlime]));
chk('feedback: queued report written once, existing report not overwritten',r.reports===2&&r.dup.response==='dev reply'&&r.dup.status==='fixed'&&r.mine.includes('Offline report')||JSON.stringify([r.reports,r.dup,r.mine]));
chk('indicator hides when synced',/hide/.test(r.pill)||r.pill);
await done(H);})();
