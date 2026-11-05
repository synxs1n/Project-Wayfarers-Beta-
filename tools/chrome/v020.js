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
const wait=ms=>new Promise(r=>setTimeout(r,ms));const ev=(f,a)=>page.evaluate(f,a);const shot=async n=>{await wait(350);await page.screenshot({path:__dirname+'/v2_'+n+'.png'});};
const chk=(n,c)=>console.log((c?'PASS ':'FAIL ')+n+(c&&c!==true?' '+c:''));
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
chk('version format',await ev(()=>/^Beta v0\.\d+\.\d+$/.test(__A.GAME_VERSION)));
// ---- old-save skill migration ----
const mig=await ev(()=>{const c={id:'mira',lv:8,pace:0};__A.paceMigrate(c);const S=__A.classSkills(__A.TPL.mira);const kn=S.filter(s=>__A.skillKnown(c,s)).map(s=>s.n);const oldKn=S.filter(s=>s.lv0<=8).map(s=>s.n);return JSON.stringify({keep:c.keep,same:oldKn.every(n=>kn.includes(n)),kn});});
console.log('migration',mig);chk('old save keeps learned skills',JSON.parse(mig).same);
// ---- limit gating ----
chk('limit locked at start',await ev(()=>!__A.limitOpen(__A.G.roster.mira)));
// ---- battle UI ----
await ev(()=>{__A.G.party.forEach(id=>{const c=__A.G.roster[id];c.hp=c.S.mhp;});__A.startBattle({stage:0,kind:'field'});});
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:20000}).catch(()=>{});
await ev(()=>{const B=__A.B;const m=B.front.find(c=>c.id==='mira');if(m){B.cur=m;m.mp=m.S.mmp;}__A.ACT.cmd('skills');});await wait(200);await shot('skills');
chk('skill list shows matchup chips',await ev(()=>document.querySelectorAll('.effs .ef').length>0));
// pick an elemental single-target skill and enter target mode
const tgt=await ev(()=>{const a=__A.B.cur;const s=__A.known(a).find(x=>x.el&&x.t==='one'&&(x.k==='mag'||x.k==='phys')&&a.mp>=x.mp);if(!s)return 'none';__A.ACT.sk(s.id);return s.n;});await wait(200);await shot('target');
console.log('target skill',tgt);chk('target badges',await ev(()=>{const t=[...document.querySelectorAll('.unit .eff')].map(x=>x.textContent);return t.length?t.join('|'):false;}));
await ev(()=>{__A.B.menu='root';__A.B.pend=null;__A.render();});
// status icon + popup
await ev(()=>{const e=__A.B.en[0];e.st.poison={t:3,src:'Mira'};e.primed={el:'water',t:2,by:'Mira'};__A.render();});await wait(100);
chk('enemy status buttons',await ev(()=>document.querySelectorAll('.utags .sti').length>=2));
await ev(()=>{document.querySelector('.utags .sti').click();});await wait(150);await shot('stpop');
chk('status popup',await ev(()=>{const p=document.querySelector('.stpop');return p?p.innerText.replace(/\n/g,' / '):false;}));
await ev(()=>__A.ACT.stClose());
// log
await ev(()=>{for(let i=0;i<70;i++)__A.B.log.push('filler '+i);});await ev(()=>{__A.ACT.blogT();});await wait(150);await shot('log');
chk('log capped',await ev(()=>{__A.log('one more');return __A.B.log.length<=50;}));
chk('log panel',await ev(()=>!!document.querySelector('.blogp li')));
await ev(()=>__A.ACT.blogT());
chk('fb context battle log',await ev(()=>{const c=__A.fbContext();return Array.isArray(c.battleLog)&&c.battleLog.length===10;}));
// damage numbers present after a hit
await ev(()=>{const a=__A.B.cur;__A.ACT.cmd('attack');});await wait(80);await ev(()=>{const e=__A.B.en.find(x=>x.hp>0);__A.ACT.tgtE(String(__A.B.en.indexOf(e)));});await wait(400);await shot('hit');
await ev(()=>{const e=__A.B.en.find(x=>x.hp>0);__A.B.cur=__A.B.front[0];__A.fx(e,'123','dmg crit weak');__A.fx(e,'Miss','stat miss');__A.render();});
chk('damage number',await page.waitForFunction(()=>document.querySelectorAll('.num,.fx2').length>0,{timeout:4000}).then(()=>true).catch(()=>false));
await shot('nums');await ev(()=>{__A.B.over=true;__A.finishBattle('fled');});await wait(200);
// effectiveness logic: quirk hidden until hit
const q=await ev(()=>{__A.META.best={};const m=__A.MON.mossling;const e=__A.makeEnemy(m,5);e.side='e';e.base=m.n;const st={k:'status',t:'one',fx:[['poison',.9]]};const r1=__A.effInfo(st,e,null);__A.META.best[m.n]={seen:1,kills:0,known:{},hit:1};const r2=__A.effInfo(st,e,null);
  const sh=__A.MON.shellguard,e2=__A.makeEnemy(sh,5);e2.base=sh.n;const sk={k:'mag',t:'one',el:'lightning',pw:1};const a=__A.effInfo(sk,e2,null);__A.META.best[sh.n]={seen:1,hit:1,known:{}};const b=__A.effInfo(sk,e2,null);
  return JSON.stringify([r1,r2,a,b]);});
console.log('quirk effinfo',q);chk('quirk ? then revealed',/"\?"/.test(q)&&/Immune/.test(q)&&/Resists/.test(q));
// bestiary tiers/perks
chk('tiers',await ev(()=>{const t=[__A.tierOf({seen:1,kills:3},0),__A.tierOf({seen:1,kills:10},0),__A.tierOf({seen:1,kills:25,scan:1},0),__A.tierOf({seen:1,kills:1},1)];return t.join(',')==='1,2,3,2'?t.join(','):false;}));
await ev(()=>{__A.META.best['Mossling']={seen:5,kills:27,scan:1,known:{}};__A.ACT.menu();__A.ACT.menuTab('beasts');});await wait(150);await shot('bestiary');
await ev(()=>__A.ACT.beast('mossling'));await wait(150);await shot('beast');
chk('back arrow on beast',await ev(()=>!!document.querySelector('.mnav .mback')));
await ev(()=>__A.ACT.xBack());chk('back goes to bestiary tab',await ev(()=>__A.V.modal&&__A.V.modal.type==='menu'&&__A.V.modal.tab==='beasts'));
chk('no back arrow on top menu',await ev(()=>!document.querySelector('.mnav .mback')));
// party swap (in town)
await ev(()=>{__A.ACT.menuTab('party');});await wait(100);await shot('party');
const before=await ev(()=>__A.G.party.join(','));
await ev(()=>{__A.ACT.swapTap('p:0');});chk('highlight',await ev(()=>!!document.querySelector('.swc.sel')));await shot('party_sel');
await ev(()=>{__A.ACT.swapTap('p:2');});const after=await ev(()=>__A.G.party.join(','));
console.log('swap',before,'->',after);chk('swap positions',before.split(',')[0]===after.split(',')[2]&&before.split(',')[2]===after.split(',')[0]);
await ev(()=>{__A.ACT.swapTap('p:0');__A.ACT.swapTap('p:0');});chk('tap again unhighlights',await ev(()=>!__A.V.swapSel));
chk('no arrows',await ev(()=>!document.querySelector('[data-act="pmove"]')));
// tempering
await ev(()=>{__A.V.modal={type:'smithy',tab:'forge'};__A.G.gold=3000;__A.render();});await wait(150);await shot('temper');
chk('tempering tab',await ev(()=>document.querySelector('#modal').innerText.includes('Tempering')&&document.querySelectorAll('[data-act="temperBuy"]').length>0));
const tb=await ev(()=>{const id=__A.G.roster[__A.G.party[0]].eq.w;const c=__A.forgeCost(id);const g0=__A.G.gold;document.querySelector('[data-act="temperBuy"]').click();return JSON.stringify({m:c.m,spent:g0-__A.G.gold,mats:Object.keys(c.m).map(k=>k+':'+(__A.G.mats[k]||0))});});
console.log('temper buy',tb);
// journey
await ev(()=>{__A.V.modal=null;__A.ACT.menu();__A.ACT.menuTab('system');});await wait(150);await shot('journey');
chk('journey shows scourges and steps',await ev(()=>{const t=document.querySelector('#modal').innerText;return /Scourges defeated/.test(t)&&/Steps walked/.test(t)&&!/Calamity/i.test(t.split(/progress/i)[1].split(/\ntime\n/i)[0]);}));
await ev(()=>__A.ACT.saveJ());await wait(100);chk('save confirm',await ev(()=>document.querySelector('.savebar').innerText.includes('Saved')));
await page.evaluate(()=>{document.querySelector('#modal .panel').scrollTop=9999;});await shot('journey2');
chk('savebar sticky visible',await ev(()=>{const r=document.querySelector('.savebar').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}));
// steps counting
const st=await ev(()=>{const s0=__A.G.stats.steps||0;__A.arrive();__A.arrive();return (__A.G.stats.steps||0)-s0;});chk('steps count',st===2);
// old save load: strip new fields
const old=await ev(()=>{const o=JSON.parse(JSON.stringify(__A.packG()));delete o.stats.steps;Object.values(o.roster).forEach(r=>{delete r.pace;delete r.keep;r.lv=9;});const g=__A.unpackG(o);return JSON.stringify(Object.values(g.roster).map(c=>[c.id,c.pace,(c.keep||[]).length]));});
console.log('old save',old);chk('old save loads',old.length>5);
console.log('errors',errs.length);await browser.close();})();
