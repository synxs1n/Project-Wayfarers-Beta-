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
const wait=ms=>new Promise(r=>setTimeout(r,ms));const ev=(f,a)=>page.evaluate(f,a);const shot=async n=>{await wait(350);await page.screenshot({path:__dirname+'/p2_'+n+'.png'});};
const chk=(n,c)=>console.log((c?'PASS ':'FAIL ')+n+(c&&c!==true?' '+c:''));
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
// tomes
chk('tome: mage and healer yes (v0.3.5 rules), blade no for healer, stick always',await ev(()=>__A.canEquip(__A.G.roster.mira,'w_tome_1')&&__A.canEquip(__A.G.roster.lumen,'w_tome_1')&&!__A.canEquip(__A.G.roster.lumen,'w_blade_1')&&__A.canEquip(__A.G.roster.lumen,'w_stick')));
// equipment tab
await ev(()=>{__A.G.gear.push('w_staff_1','w_tome_1','a_robe_1','c_mana','w_blade_1');__A.ACT.menu();__A.ACT.menuTab('equip');});await wait(150);await shot('equip');
chk('equipment tab lists heroes with 4 slots (weapon, armor, charm, cape)',await ev(()=>document.querySelectorAll('.eqrow').length===3&&document.querySelectorAll('.eqs').length===12));
await ev(()=>{document.querySelector('[data-act="eqPick"][data-arg="mira,w"]').click();});await wait(150);await shot('pick');
chk('picker shows upgrades with deltas and back arrow',await ev(()=>{const t=document.querySelector('#modal').innerText;return /MAG/.test(t)&&!!document.querySelector('.mnav .mback')&&document.querySelectorAll('[data-act="eqSet"]').length>=2;}));
chk('picker paging',await ev(()=>{__A.ACT.eqNav('1');return __A.V.modal.char==='lumen'&&!/Mail|Axe|Greatsword|Lance/.test(document.querySelector('#modal .rows').innerText);}));
// auto best gear + undo
await ev(()=>{__A.V.modal={type:'menu',tab:'equip'};__A.render();__A.ACT.autoEqParty();});await wait(150);await shot('auto');
const au=await ev(()=>({n:__A.V.modal.rows.length,txt:document.querySelector('#modal').innerText.slice(0,300).replace(/\n/g,' | '),mira:__A.G.roster.mira.eq.w}));console.log('auto',JSON.stringify(au));
chk('auto best equips something sensible',au.n>0&&/w_(tome|staff)_1/.test(au.mira));
await ev(()=>__A.ACT.autoEqUndo());chk('undo restores',await ev(()=>__A.G.roster.mira.eq.w==='w_staff_0'&&__A.G.gear.includes('w_tome_1')));
// buy prompt
await ev(()=>{__A.G.gold=5000;__A.V.modal={type:'smithy',tab:'weapons'};__A.render();});await wait(100);await shot('shop');
chk('shop rows show best-for tags',await ev(()=>document.querySelectorAll('.best').length>0));
await ev(()=>{document.querySelector('[data-act="buyGear"]').click();});await wait(150);await shot('prompt');
chk('equip-now prompt after buying',await ev(()=>__A.V.modal.type==='equipNow'||document.querySelector('#modal').innerText.includes('Equip this now?')));
await ev(()=>{__A.ACT.eqNowNo();});chk('No returns to the shop',await ev(()=>__A.V.modal&&__A.V.modal.type==='smithy'));
// auto equip toggle
await ev(()=>{__A.META.cfg.autoEquip=true;__A.V.modal=null;const r=__A.G.roster.oren;r.eq.w='w_blade_0';__A.G.gear.push('w_blade_2');__A.queueNewGear(['w_blade_2']);});
chk('auto equip setting equips clear upgrades',await ev(()=>{const r=Object.values(__A.G.roster).some(c=>c.eq.w==='w_blade_2');__A.META.cfg.autoEquip=false;return r;}));
// faith + descriptors
await ev(()=>{__A.V.modal={type:'char',char:'lumen',list:['lumen']};__A.render();});await wait(100);
chk('Faith on the sheet',await ev(()=>/FTH/.test(document.querySelector('#modal').innerText)&&/Priest: Healer|Priest/.test(document.querySelector('#modal').innerText)));
await ev(()=>{document.querySelector('[data-act="statInfo"][data-arg="fth"]').click();});await wait(100);await shot('statinfo');
chk('stat popup',await ev(()=>/Faith/.test(document.querySelector('#modal').innerText)&&/Priest|Healer/.test(document.querySelector('#modal').innerText)));
await ev(()=>__A.ACT.xBack());chk('back to sheet',await ev(()=>__A.V.modal.type==='char'));
// stick quest
await ev(()=>{__A.V.modal={type:'board'};__A.render();});await wait(100);
chk('tamer quest on board',await ev(()=>/Tamer's Stick/.test(document.querySelector('#modal').innerText)));
await ev(()=>{__A.ACT.qAccept('tamer');const B=__A.META.best;['Mossling','Gust Imp','Dewtoad','Cinder Pup','Brine Crawler','Glass Gull'].forEach(n=>{B[n]=B[n]||{seen:1,kills:0,known:{}};B[n].seen=1;});__A.render();});
const sp0=await ev(()=>JSON.stringify(__A.stickPower()));
await ev(()=>{__A.ACT.qClaim('tamer');});await wait(200);await shot('stick_story');
chk('stick granted',await ev(()=>__A.G.gear.includes('w_stick')));
const sp1=await ev(()=>{const B=__A.META.best;Object.keys(__A.MON).forEach(k=>{B[__A.MON[k].n]={seen:1,kills:1,known:{}};});return JSON.stringify(__A.stickPower());});
console.log('stick power',sp0,'->',sp1);chk('stick grows with bestiary',JSON.parse(sp1).pow>JSON.parse(sp0).pow);
await ev(()=>{__A.V.modal=null;__A.equipGear?0:0;const c=__A.G.roster.oren;const i=__A.G.gear.indexOf('w_stick');__A.G.gear.splice(i,1);__A.G.gear.push(c.eq.w);c.eq.w='w_stick';c.S=__A.calcStats(c);__A.ACT.menu();__A.ACT.menuTab('equip');});await wait(150);await shot('equip_stick');
// old save without fth keeps allocations
const old=await ev(()=>{const o=JSON.parse(JSON.stringify(__A.packG()));o.roster.lumen.alloc={spi:3,int:2};const g=__A.unpackG(o);const c=g.roster.lumen;return JSON.stringify({alloc:c.alloc,fth:Math.round(c.S.attr.fth),heal:Math.round(c.S.healP)});});
console.log('old save',old);chk('old save loads with Faith derived',/"fth":[1-9]/.test(old)&&/"spi":3/.test(old));
console.log('errors',errs.length);await browser.close();})();
