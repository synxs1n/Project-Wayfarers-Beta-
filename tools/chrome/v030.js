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
const wait=ms=>new Promise(r=>setTimeout(r,ms));const ev=(f,a)=>page.evaluate(f,a);const shot=async n=>{await wait(350);await page.screenshot({path:__dirname+'/v3_'+n+'.png'});};
const chk=(n,c)=>console.log((c?'PASS ':'FAIL ')+n+(c&&c!==true?' '+c:''));
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
chk('version',await ev(()=>__A.GAME_VERSION==='Beta v0.4.3'));
// limit tiers
const lt=await ev(()=>{const c=__A.G.roster.mira;const r=[];[14,15,29,30,50].forEach(l=>{c.lv=l;const L=__A.limitOpen(c)?__A.limitSkill(c):null;r.push(l+':'+(L?L.tierN+' '+L.n+' '+(L.pw||''):'locked'));});c.lv=3;return r.join(' | ');});
console.log('limits',lt);chk('limit tiers',/14:locked/.test(lt)&&/15:Limit I Starfall 1.82/.test(lt)&&/30:Limit II Meteor Requiem 3.4/.test(lt));
// stage 0 with level 15 works (no town gate)
chk('limit at lv15 in first realm',await ev(()=>{const c=__A.G.roster.mira;c.lv=15;const r=__A.limitOpen(c)&&__A.G.stage===0;c.lv=3;return r;}));
// hero sheet + codex show both tiers
await ev(()=>{__A.G.roster.mira.lv=31;__A.ACT.menu();__A.ACT.viewChar('mira');});await wait(150);
chk('sheet shows Limit I and II',await ev(()=>{const t=document.querySelector('#modal').innerText;return /Limit I: Starfall/.test(t)&&/Limit II: Meteor Requiem/.test(t);}));
await page.evaluate(()=>{const p=document.querySelector('#modal .panel');const h=[...p.querySelectorAll('h4')].find(x=>/limit/i.test(x.textContent));if(h)h.scrollIntoView();});await shot('sheet_limit');
chk('late skills on sheet',await ev(()=>/Cataclysm/.test(document.querySelector('#modal').innerText)));
await ev(()=>{__A.G.roster.mira.lv=3;__A.ACT.xClose();});
// xp cap
chk('cap 50',await ev(()=>{const c=__A.G.roster.lumen;c.lv=49;c.xp=0;__A.addXp(c,1e7);const r=c.lv===50;c.lv=3;c.xp=0;return r;}));
chk('old hero above cap keeps level',await ev(()=>{const c=__A.G.roster.oren;c.lv=55;__A.addXp(c,1e6);const r=c.lv===55;c.lv=3;return r;}));
// dungeon + stuck
await ev(()=>{__A.enterDungeon(0);});await wait(400);
chk('in dungeon',await ev(()=>__A.WS.m.kind==='dungeon'));
await ev(()=>{__A.ACT.menu();});await wait(150);chk('Stuck? button in dungeon menu',await ev(()=>!!document.querySelector('[data-act="stuckAsk"]')));await shot('menu_dungeon');
const far=await ev(()=>{const m=__A.WS.m;let p=null;for(let y=0;y<m.t.length&&!p;y++)for(let x=0;x<m.t[0].length;x++)if(m.t[y][x]==='.'&&Math.abs(x-m.start[0])>15&&__A.dunReachable(m,x,y)){p=[x,y];break;}__A.V.modal=null;__A.placeAt(m.id,p[0],p[1],'d');return p;});
await ev(()=>{__A.ACT.menu();__A.ACT.stuckAsk();});await wait(150);await shot('stuck');
chk('stuck modal has back',await ev(()=>!!document.querySelector('.mnav .mback')&&/entrance/.test(document.querySelector('#modal').innerText)));
await ev(()=>__A.ACT.stuckGo());await wait(900);
chk('stuck returns to entrance',await ev(()=>{const m=__A.WS.m;return __A.WS.x===m.start[0]&&__A.WS.y===m.start[1];}));
// rescue on load into a sealed spot
const res=await ev(()=>{const m=__A.WS.m;let p=null;for(let y=1;y<m.t.length-1&&!p;y++)for(let x=1;x<m.t[0].length-1;x++)if(m.t[y][x]==='#'){p=[x,y];break;}__A.placeAt(m.id,p[0],p[1],'d');return [__A.WS.x,__A.WS.y,m.start[0],m.start[1]].join(',');});
console.log('rescue',res);const rr=res.split(',');chk('sealed spot rescued to entrance',rr[0]===rr[2]&&rr[1]===rr[3]);
// town: no stuck
await ev(()=>{__A.V.modal=null;__A.placeAt('t0',10,10,'d');__A.ACT.menu();});await wait(150);chk('no Stuck? in town',await ev(()=>!document.querySelector('[data-act="stuckAsk"]')));
// help
await ev(()=>{__A.V.modal=null;__A.ACT.fbOpen();});await wait(150);await ev(()=>{__A.V.modal.tab='help';__A.render();});chk('help mentions Stuck',await ev(()=>/Stuck\?/.test(document.querySelector('#modal').innerText)));
// limit II battle visual
await ev(()=>{__A.V.modal=null;const c=__A.G.roster.mira;c.lv=31;c.S=__A.calcStats(c);c.hp=c.S.mhp;c.lb=100;__A.G.party.forEach(id=>{const h=__A.G.roster[id];h.hp=h.S.mhp;});__A.startBattle({stage:0,kind:'field'});});
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:20000}).catch(()=>{});
await ev(()=>{const m=__A.B.front.find(c=>c.id==='mira');__A.B.cur=m;m.lb=100;__A.render();});await wait(150);await shot('limit_btn');
chk('Limit II button',await ev(()=>{const b=document.querySelector('.mi.limit');return b?b.innerText.replace(/\n/g,' '):false;}));
await ev(()=>__A.ACT.cmd('limit'));await wait(250);await shot('limit2');
console.log('errors',errs.length);await browser.close();})();
