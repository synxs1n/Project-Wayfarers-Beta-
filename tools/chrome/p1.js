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
const P='/tmp/claude-0/-home-claude/3e20b335-222a-5034-a09c-ede6c0dc9aa3/scratchpad/chrome/leg_page.html';
fs.writeFileSync(P,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><script>localStorage.clear();</script>'+MOCK+fs.readFileSync(__dirname+'/../out/aurelis3.html','utf8')+'</body></html>');
await page.goto('file://'+P,{waitUntil:'load'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));const ev=(f,a)=>page.evaluate(f,a);const shot=async n=>{await wait(350);await page.screenshot({path:__dirname+'/p1_'+n+'.png'});};
const chk=(n,c)=>console.log((c?'PASS ':'FAIL ')+n+(c&&c!==true?' '+c:''));
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
// 1.1 arena: every tier opens a battle
const ar=await ev(async()=>{const out=[];__A.G.cleared=[true,true,true,true,true];__A.G.stage=4;
  for(let i=0;i<__A.ARENA.length;i++){__A.G.party.forEach(id=>{const c=__A.G.roster[id];c.hp=c.S.mhp;});__A.V.modal={type:'guild',tab:'arena'};__A.render();
    const b=[...document.querySelectorAll('[data-act="arena"]')][i];if(!b||b.disabled){out.push(i+':disabled');continue;}b.click();
    out.push(i+':'+(__A.B&&__A.B.spec.kind==='arena'&&__A.B.en.length?'ok '+__A.B.en.map(e=>e.lv).join('/'):'FAIL'));if(__A.B){__A.B.over=true;__A.finishBattle('fled');}}
  __A.G.cleared=[false,false,false,false,false];__A.G.stage=0;return out.join(' ');});
console.log('arena',ar);chk('every arena tier starts',!/FAIL|disabled/.test(ar));
// 1.2 sheet buttons (menu and guild), paging list intact
await ev(()=>{__A.V.modal=null;__A.ACT.menu();__A.ACT.menuTab('party');});await wait(150);
let bb=await (await page.$('.swsheet')).boundingBox();await page.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);await wait(200);
chk('menu Sheet opens sheet with list',await ev(()=>__A.V.modal.type==='char'&&__A.V.modal.list.length===3));
// v0.3.3 removed party handling from the Guild Hall: check the tab is gone instead
chk('guild has no party tab (v0.3.3)',await ev(()=>{__A.V.modal={type:'guild',tab:'party'};__A.render();return !document.querySelector('.swsheet')&&!/Set your six/.test(document.querySelector('#modal').innerText);}));
// 1.3 scroll preserved while spending points
await ev(()=>{const c=__A.G.roster.mira;c.pts=5;__A.V.modal={type:'char',char:'mira',list:['mira','lumen','oren']};__A.render();});await wait(150);
const sc=await ev(()=>{const p=document.querySelector('#modal .panel');p.scrollTop=300;const s0=p.scrollTop;document.querySelector('[data-act="addPt"]').click();const p2=document.querySelector('#modal .panel');return s0+'->'+p2.scrollTop;});
console.log('scroll',sc);chk('scroll kept after a stat point',sc.split('->')[0]===sc.split('->')[1]&&sc.split('->')[0]!=='0');
// 1.4 no "equip at the Guild Hall" anywhere in the built page
chk('no guild-equip text',await ev(()=>!/[Ee]quip[^.]{0,40}Guild Hall|Guild Hall[^.]{0,30}[Ee]quip|change your party at the Guild/.test(document.documentElement.innerHTML)));
// 1.7 inn fade
await ev(()=>{__A.V.modal={type:'inn'};__A.G.gold=999;__A.G.roster.mira.hp=1;__A.render();});
await ev(()=>__A.ACT.rest());await wait(150);chk('fade on',await ev(()=>document.getElementById('fadeov').classList.contains('on')));
await wait(1500);chk('fade off and rested',await ev(()=>!document.getElementById('fadeov').classList.contains('on')&&__A.G.roster.mira.hp===__A.G.roster.mira.S.mhp));
// 1.8 + 1.9 battle: log order, icon rows don't overlap or leave the stage
await ev(()=>{__A.V.modal=null;['brann','sable','tess'].forEach(id=>{__A.G.roster[id]=__A.newChar(id,5,0);__A.G.party.push(id);});__A.startBattle({stage:0,kind:'field'});});
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:20000}).catch(()=>{});
const ov=await ev(()=>{const B=__A.B;while(B.en.length<5){const e=__A.makeEnemy(__A.MON.mossling,4);e.next=999999;B.en.push(e);}
  const S=['poison','burn','slow','might','regen','haste','weaken','bulwark'];B.en.concat(B.front).forEach(u=>{S.forEach(k=>u.st[k]={t:3,src:'x'});u.primed={el:'fire',t:2};});__A.render();
  const st=document.getElementById('bstage').getBoundingClientRect(),rows=[...document.querySelectorAll('.utags')].map(e=>e.getBoundingClientRect());let bad=0,out=0;
  rows.forEach((a,i)=>{if(a.left<st.left-1||a.right>st.right+1||a.top<st.top-1||a.bottom>st.bottom+1)out++;rows.forEach((b,j)=>{if(j>i&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)bad++;});});
  const cmd=document.getElementById('bcmd').getBoundingClientRect();const under=rows.filter(r=>r.bottom>cmd.top).length;
  return JSON.stringify({rows:rows.length,overlap:bad,outside:out,underPanel:under});});
console.log('icons',ov);const O=JSON.parse(ov);chk('8 icon rows, none overlapping or outside',O.rows===8&&!O.overlap&&!O.outside&&!O.underPanel);
await shot('icons');
const lo=await ev(()=>{__A.log('first test line');__A.log('newest test line');__A.ACT.blogT();const L=[...document.querySelectorAll('.blogp li')].map(x=>x.textContent);__A.ACT.blogT();return L.slice(0,2).join(' | ');});
console.log('log',lo);chk('log newest first',/^newest test line/.test(lo));
// 1.10 durations
chk('min durations',await ev(()=>{__A.META.cfg.speed=2;const a=__A.fxDur({txt:'12',cls:'dmg'}),b=__A.fxDur({txt:'Melt',cls:'react'}),c=__A.banDur({txt:'Meteor Requiem'});__A.META.cfg.speed=1;const d=__A.fxDur({txt:'12',cls:'dmg'});return a>=1.2&&b>a&&c>=1.4&&d>=1.3&&d<=2.6?`2x ${a}s, react ${b}s, banner ${c}s, 1x ${d}s`:false;}));
// 1.11 auto switching picks a healer when the line is hurt
const sw=await ev(()=>{const B=__A.B;B.auto=true;B.front.forEach(c=>{c.hp=Math.round(c.S.mhp*.25);c.st={};});B.back.forEach(c=>{c.hp=c.S.mhp;});
  const heal=B.back.find(c=>__A.known(c).some(s=>s.k==='heal'));if(!heal){const l=__A.G.roster.lumen;}B.pturns=10;B.autoSwapT=null;const a=B.front.find(c=>!__A.known(c).some(s=>s.k==='heal'));if(!a)return 'no non-healer';a.swapInT=null;
  const r=__A.autoSwitchPick(a);return r?r.inn.name+' ('+r.why+')':'none';});
console.log('auto switch',sw);
await ev(()=>{__A.B.over=true;__A.finishBattle('fled');});
console.log('errors',errs.length);await browser.close();})();
