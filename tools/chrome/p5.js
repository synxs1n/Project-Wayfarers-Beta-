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
const P=__dirname+'/p5_page.html';
async function open(html,pre){const page=await browser.newPage();const errs=[];page.on('pageerror',e=>{errs.push(e.message);console.log('PAGEERR',e.message);});
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script>localStorage.clear();'+(pre?'const PRE='+JSON.stringify(pre)+';Object.keys(PRE).forEach(k=>localStorage.setItem(k,PRE[k]));':'')+'</script>'+MOCK+html+'</body></html>');
  await page.goto('file://'+P,{waitUntil:'load'});page.errs=errs;return page;}
let pg=await open(fs.readFileSync(__dirname+'/../out/aurelis.html','utf8'));
const old=await pg.evaluate(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();const G=A.G;G.cleared[0]=true;G.cleared[1]=true;G.stage=2;
  G.roster.mira.lv=20;G.roster.mira.S=A.calcStats(G.roster.mira);G.echoes={drake:1};delete G.skSeen;delete G.skNew;A.saveGame();const ls={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);ls[k]=localStorage.getItem(k);}return {ls,ver:A.GAME_VERSION,b:G.run.bosses.slice(0,2)};});
console.log('old',old.ver,old.b.join(','));await pg.close();
pg=await open(fs.readFileSync(__dirname+'/../out/aurelis3.html','utf8'),old.ls);
const r=await pg.evaluate(async()=>{const A=__A;A.ACT.cont();await new Promise(r=>setTimeout(r,800));const G=A.G;
  return {screen:A.V.screen,ver:A.GAME_VERSION,won:Object.keys(G.bossWon||{}),echo0:A.storyEchoUp(0),echo2:A.storyEchoUp(2),toasts:document.querySelectorAll('#lnq .lnn').length,ttxt:[...document.querySelectorAll('#lnq .lnn')].map(x=>x.innerText).join('|'),modal:A.V.modal&&A.V.modal.type,skSeen:Object.keys(G.skSeen||{}).length,exp:Object.keys(G.explored||{}).length,lv:G.roster.mira.lv};});
console.log('loaded',JSON.stringify(r));
chk('v0.3.1 save loads into the world',r.screen==='world');
chk('cleared Scourges count as won by hand (auto allowed)',r.won.length===2);
chk('story echoes wait in both cleared dungeons, not the next one',r.echo0&&!r.echo2);
chk('no flood of old skills announced as new',r.toasts===0&&r.skSeen>=3);
chk('map starts revealing from the loaded spot',r.exp>=1);
chk('no page errors',!pg.errs.length);
await browser.close();})();
