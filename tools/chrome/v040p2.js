// v0.4.0 Phase 2 tests: tap to switch, auto settings, Undead and healing, archetype hints, new sprites, Bestiary type section.
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {page,ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(300);
  ['brann','tess'].forEach(id=>{A.G.roster[id]=A.newChar(id,12,0);});A.G.party=['lumen','mira','oren','brann','tess'];
  A.G.roster.lumen.lv=14;A.refresh(A.G.roster.lumen);});
// ---- 2.1 tap to switch
await ev(()=>__A.startBattle({stage:0,kind:'field'}));
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000});await wait(300);
const q1=await ev(()=>({cur:__A.B.cur.id,back:__A.B.back.map(c=>c.id),sw:document.querySelectorAll('#bparty .pc.rs.swapok').length}));
chk('reserve cards are marked as tappable switches',q1.sw>0||JSON.stringify(q1));
{const sel='#bparty .pc.rs.swapok';const b=await page.$(sel);await b.scrollIntoViewIfNeeded();await wait(100);const r=await b.boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);await wait(250);}
const q2=await ev(()=>({ask:!!document.querySelector('#bcmd .swapask'),txt:(document.querySelector('#bcmd .swapask')||{}).innerText||''}));
chk('tapping a reserve hero asks to confirm the switch',q2.ask||JSON.stringify(q2));
await page.click('#bcmd [data-act="swNo"]');await wait(200);
chk('Keep cancels the switch',await ev(()=>!document.querySelector('#bcmd .swapask')&&__A.B.mode==='cmd'));
{const b=await page.$('#bparty .pc.rs.swapok');await b.scrollIntoViewIfNeeded();await wait(100);const r=await b.boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);await wait(250);}
const out=await ev(()=>({cur:__A.B.cur.id,bi:__A.B.swapAsk&&__A.B.swapAsk.bi,back:__A.B.back.map(c=>c.id)}));
await page.click('#bcmd [data-act="swYes"]');await wait(300);
const q3=await ev(()=>({front:__A.B.front.map(c=>c.id),back:__A.B.back.map(c=>c.id),cur:__A.B.cur.id}));
chk('confirming brings the reserve hero in and they act now',(q3.front.includes(out.back[out.bi])&&q3.cur===out.back[out.bi])||JSON.stringify([out,q3]));
chk('the hero who stepped back is now in the reserve',q3.back.includes(out.cur)||JSON.stringify([out,q3]));
await ev(()=>{__A.B.en.forEach(e=>e.hp=0);__A.finishBattle('win');__A.V.modal=null;__A.render();});
// ---- 2.2 auto settings from menu and from battle
await ev(()=>__A.ACT.settings&&__A.ACT.settings());await wait(200);
const hasBtn=await ev(()=>!!document.querySelector('#modal [data-act="autoOpen"]'));
chk('Settings has an Auto battle settings button',hasBtn);
await page.click('#modal [data-act="autoOpen"]');await wait(200);
chk('the auto settings screen opens outside battle',await ev(()=>/Auto battle settings/.test(document.getElementById('modal').innerText)));
await page.click('#modal [data-act="autoCfg"][data-arg=\'["swap",false]\']');await wait(150);
chk('turning switching off is stored in META.cfg.auto',(await ev(()=>__A.META.cfg.auto&&__A.META.cfg.auto.swap))===false);
chk('the sub options for switching hide when it is off',await ev(()=>!document.querySelector('#modal [data-arg=\'["swHealer",true]\']')));
await page.click('#modal [data-act="autoCfg"][data-arg=\'["healAt",70]\']');await wait(100);
chk('heal threshold changes',(await ev(()=>__A.META.cfg.auto.healAt))===70);
await page.click('#modal [data-act="xBack"]');await wait(150);
await ev(()=>{__A.V.modal=null;__A.render();__A.startBattle({stage:0,kind:'field'});});
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000});await wait(200);
await page.click('#bcmd [data-act="autoOpen"]');await wait(200);
chk('the same screen opens inside a battle',await ev(()=>/Auto battle settings/.test(document.getElementById('modal').innerText)));
chk('battle values show the stored choice (heal at 70 selected)',await ev(()=>!!document.querySelector('#modal [data-arg=\'["healAt",70]\'].on')));
await page.click('#modal [data-act="autoReset"]');await wait(100);
chk('reset restores defaults',(await ev(()=>Object.keys(__A.META.cfg.auto||{}).length))===0);
await page.click('#modal [data-act="xBack"]');await wait(200);
chk('closing returns to the fight',await ev(()=>!document.getElementById('modal').innerText.trim()&&__A.V.screen==='battle'));
await ev(()=>{__A.B.en.forEach(e=>e.hp=0);__A.finishBattle('win');__A.V.modal=null;__A.render();});
// ---- 2.3 undead and healing
await ev(()=>{const A=__A;A.G.party=['lumen','mira','oren'];A.startBattle({stage:0,kind:'field',foes:[A.makeEnemy(A.MON.barrowbones,6),A.makeEnemy(A.MON.barrowbones,6),A.makeEnemy(A.MON.gull,6)]});});
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000});
await ev(()=>{const B=__A.B;B.cur=B.front.find(c=>c.id==='lumen');B.menu='root';__A.render();});await wait(200);
await ev(()=>{__A.ACT.cmd('skills');});await wait(150);
await ev(()=>{__A.ACT.sk('mend');});await wait(250);
const t1=await ev(()=>({tg:[...document.querySelectorAll('#bstage .unit.foe.tg')].map(b=>b.getAttribute('aria-label')),hints:[...document.querySelectorAll('#bstage .unit.foe.tg .eff')].map(x=>x.textContent),hint:(document.querySelector('#bcmd .hint')||{}).textContent}));
chk('Mend can target the two undead foes but not the gull',(t1.tg.length===2&&t1.tg.every(x=>/Barrow Bones/.test(x)))||JSON.stringify(t1));
chk('the preview says Damages undead',t1.hints.some(x=>/Damages undead/.test(x))||JSON.stringify(t1));
chk('the hint line explains it',/undead foe/.test(t1.hint||'')||JSON.stringify(t1));
const hp0=await ev(()=>__A.B.en.map(e=>e.hp));
{const b=await page.$('#bstage .unit.foe.tg');const r=await b.boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);await wait(1500);}
const hp1=await ev(()=>({hp:__A.B.en.map(e=>e.hp),log:__A.B.log.slice(-6).join(' | ')}));
chk('the undead foe took healing damage',hp1.hp[0]<hp0[0]||JSON.stringify([hp0,hp1]));
chk('the other undead and the gull were untouched',(hp1.hp[1]===hp0[1]&&hp1.hp[2]===hp0[2])||JSON.stringify([hp0,hp1]));
chk('log mentions the healing light',/healing light/.test(hp1.log)||hp1.log);
// light weakness for every undead
const lw=await ev(()=>{const A=__A;return ['barrowbones','drownedsailor','rimewight','galephantom','ashwraith','eclipsewraith','huskguard'].map(k=>[k,A.effOf('light',A.makeEnemy(A.MON[k],10))>=1.35]);});
chk('every undead is weak to Light',lw.every(x=>x[1])||JSON.stringify(lw));
// AoE heal hurts every undead
await ev(()=>{const B=__A.B;B.en.forEach(e=>{e.hp=e.S.mhp;});B.cur=B.front.find(c=>c.id==='lumen');B.mode='cmd';B.menu='root';B.pend=null;__A.render();});
const hpA=await ev(()=>__A.B.en.map(e=>e.hp));
await ev(()=>{__A.ACT.cmd('skills');__A.ACT.sk('mendall');});await wait(1200);
const hpB=await ev(()=>__A.B.en.map(e=>e.hp));
chk('Mend All burns every undead foe and spares the gull',(hpB[0]<hpA[0]&&hpB[1]<hpA[1]&&hpB[2]===hpA[2])||JSON.stringify([hpA,hpB]));
await ev(()=>{__A.B.en.forEach(e=>e.hp=0);__A.finishBattle('win');__A.V.modal=null;__A.render();});
// ---- 2.4 archetype hints and damage
await ev(()=>{const A=__A;A.G.party=['tess','brann','mira'];A.G.roster.tess=A.newChar('tess',20,0);A.G.roster.brann=A.newChar('brann',20,0);A.startBattle({stage:0,kind:'field',foes:[A.makeEnemy(A.MON.gull,10),A.makeEnemy(A.MON.slaggolem,10)]});});
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:30000});
const ch=await ev(()=>[...document.querySelectorAll('#bparty .aty')].map(x=>x.textContent));
chk('foe cards show their archetype',(ch.includes('Flying')&&ch.includes('Armored'))||JSON.stringify(ch));
const dm=await ev(()=>{const A=__A,B=A.B;const tess=B.front.find(c=>c.id==='tess'),brann=B.front.find(c=>c.id==='brann');const gull=B.en[0],golem=B.en[1];
  const avg=(a,sk,t)=>{let s=0;for(let i=0;i<60;i++)s+=A.calcDamage(a,sk,t).dmg;return s/60;};
  const bow={id:'x',k:'phys',pw:1,dl:'ranged',t:'one'},sword={id:'x',k:'phys',pw:1,dl:'slash',t:'one'},lance={id:'x',k:'phys',pw:1,dl:'piercing',t:'one'};
  return {gR:avg(brann,bow,gull)/avg(brann,sword,gull),aS:avg(brann,sword,golem)/avg(brann,lance,golem)};});
chk('ranged does about 1.9x what slash does to a flyer (1.5 vs 0.8)',(dm.gR>1.6&&dm.gR<2.2)||JSON.stringify(dm));
chk('slash does about half of what piercing does to armor (0.55 vs 1.15)',(dm.aS>.38&&dm.aS<.58)||JSON.stringify(dm));
await ev(()=>{const B=__A.B;B.cur=B.front.find(c=>c.id==='tess');B.menu='root';B.mode='cmd';__A.render();__A.ACT.cmd('skills');});await wait(200);
const sk=await ev(()=>[...document.querySelectorAll('#bcmd .mi')].map(b=>b.innerText.replace(/\s+/g,' ')).slice(0,4));
chk('skill rows carry a delivery chip',sk.some(t=>/ranged/i.test(t))||JSON.stringify(sk));
await ev(()=>{__A.ACT.sk('aim');});await wait(250);
const pv=await ev(()=>[...document.querySelectorAll('#bstage .unit.foe.tg .eff')].map(x=>x.textContent));
chk('the preview shows ▲ Ranged on the flyer and ▼ on the armored foe',(pv.some(x=>/▲ Ranged/.test(x))&&pv.some(x=>/▼ Ranged/.test(x)))||JSON.stringify(pv));
await ev(()=>{__A.B.en.forEach(e=>e.hp=0);__A.finishBattle('win');__A.V.modal=null;__A.render();});
// ---- sprites and Bestiary
const px=await page.evaluate(()=>new Promise(res=>{const keys=['gnatswarm','barrowbones','drownedsailor','brinejelly','rimewight','galephantom'];const o={};let n=0;
  keys.forEach(k=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let on=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)on++;o[k]=on;if(++n===keys.length)res(o);};im.onerror=()=>{o[k]=-1;if(++n===keys.length)res(o);};im.src=__A.monURL(__A.MON[k].art);});}));
chk('all six new sprites render non blank',Object.values(px).every(v=>v>200)||JSON.stringify(px));
await ev(()=>{__A.V.modal={type:'beast',k:'barrowbones'};__A.render();});await wait(300);
const bb=await ev(()=>document.getElementById('modal').innerText);
chk('Bestiary entry for Barrow Bones shows its Undead type',/type/i.test(bb)&&/undead/i.test(bb)||bb.slice(0,300));
await ev(()=>{__A.V.modal={type:'beast',k:'bonecolossus'};__A.render();});await wait(300);
const bb2=await ev(()=>document.getElementById('modal').innerText);
chk('an unseen Scourge hides its type',/\? Land a hit/.test(bb2)||bb2.slice(0,400));
await H.shot('v040_p2');
await done(H);
})();
