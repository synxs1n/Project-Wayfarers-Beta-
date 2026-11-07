const {open,chk,done}=require('./pw');
(async()=>{
for(const [name,w,h] of [['phone 390x700',390,700],['small 360x560',360,560]]){
const H=await open({w,h,mobile:true});const {ev,wait,shot}=H;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(250);
const b=await ev(()=>{const A=__A,G=A.G,B=A.BONDS[0];[B.a,B.b].forEach(id=>{if(!G.roster[id])G.roster[id]=A.newChar(id,5,0);});const k=A.bondKey(B.a,B.b);G.bonds[k]=11;G.talks=[{k,lv:1}];
  A.V.modal={type:'inn'};A.render();return {a:B.a,b:B.b,k};});
await wait(150);
const inn=await ev(()=>{const m=document.querySelector('#modal .panel'),r=document.querySelector('#modal [data-act="rest"]');const pr=m.getBoundingClientRect(),rr=r.getBoundingClientRect();
  return {focus:document.activeElement===r,restTop:Math.round(rr.top-pr.top),fits:m.scrollHeight<=m.clientHeight+2,scroll:m.scrollHeight+'/'+m.clientHeight,hasBonds:/Bonds|fights side by side|Campfire/i.test(m.innerText),txt:m.innerText.replace(/\n+/g,' | ')};});
console.log(name,JSON.stringify(inn));
chk(name+': Rest is focused and near the top',inn.focus&&inn.restTop<140||JSON.stringify(inn));
chk(name+': Inn needs no scrolling',inn.fits||inn.scroll);
chk(name+': no bonds or campfire text in the Inn',!inn.hasBonds||inn.txt);
await shot('p5_inn_'+w);
// hero sheet bonds. v0.9.9: since v0.9.5 a new journey (G.pcV) opens bonds in the second realm (pacing.js PACE.at.bonds): in the first
// realm the sheet shows no bond scene button; with the first realm cleared it does, and the scene flow is checked as before
const gate=await ev(()=>{const A=__A,G=A.G,id=A.BONDS[0].a;A.V.charList=[id];A.V.modal={type:'char',char:id,list:[id]};A.render();
  const r={pcV:G.pcV,at:window.__P95.PACE.at.bonds,btn:document.querySelectorAll('[data-act="bondTalk"]').length};
  if(!G.cleared)G.cleared=[];for(let i=0;i<r.at;i++)G.cleared[i]=true;r.open=window.__P95.pcUnlocked('bonds');return r;});
console.log('bond gate',JSON.stringify(gate));
chk(name+': first realm of a new journey: no bond scene on the hero sheet; bonds open once realm '+(gate.at+1)+' is reached',gate.pcV&&gate.at>=1&&gate.btn===0&&gate.open||JSON.stringify(gate));
const hs=await ev(()=>{const A=__A;A.V.modal={type:'char',id:A.G.roster[A.G.party[0]]?A.G.party[0]:null};return 1;});
const sheet=await ev(()=>{const A=__A,G=A.G,id=A.BONDS[0].a;A.V.charList=[id];A.V.modal={type:'char',char:id,list:[id]};A.render();const t=document.body.innerText;
  const btn=[...document.querySelectorAll('[data-act="bondTalk"]')].map(x=>x.innerText);return {btn,bar:document.querySelectorAll('.bondrow .bar').length,id};});
console.log(JSON.stringify(sheet));
chk(name+': hero sheet shows bond with scene button (new)',sheet.btn.some(x=>/new/i.test(x))&&sheet.bar>=1||JSON.stringify(sheet));
const w2=await ev(()=>{const A=__A,G=A.G;const before=JSON.stringify(G.bonds);document.querySelector('[data-act="bondTalk"]:not([disabled])').click();const m=A.V.modal;const ok=m&&m.type==='talk';
  const left=G.talks.length;A.ACT.talkNext();while(A.V.modal&&A.V.modal.type==='talk')A.ACT.talkNext();return {ok,left,back:A.V.modal&&A.V.modal.type,bondsSame:JSON.stringify(G.bonds)===before};});
console.log(JSON.stringify(w2));
chk(name+': scene plays, pending cleared, returns to the sheet, bond progress untouched',w2.ok&&w2.left===0&&w2.back==='char'&&w2.bondsSame||JSON.stringify(w2));
await H.browser.close();}
// weather + time popups
{const H=await open({w:430,h:800,mobile:true});const {ev,wait,shot}=H;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(250);
const t=await ev(()=>{const A=__A;A.G.clock=700;A.wkwUpdate&&A.wkwUpdate();const c=document.querySelector('.wchip.ph');if(!c)return {none:1};c.click();return {txt:document.querySelector('#modal .panel').innerText.replace(/\n+/g,' | ').slice(0,300),tag:c.tagName};});
console.log(JSON.stringify(t));chk('time tag opens a popup with effects',!t.none&&/Night/.test(t.txt)&&/stronger/.test(t.txt)||JSON.stringify(t));await shot('p5_time');
const w=await ev(()=>{const A=__A,G=A.G;A.ACT.closeModal();const s=A.WS.m.s;A.WS.m.kind==='field'||0;return {kind:A.WS.m.kind,s};});
const wx=await ev(()=>{const A=__A,G=A.G;A.V.modal=null;const m=A.WS.m,sv=m.kind;m.kind='field';G.weather[m.s]='rain';G.wx={[m.s]:120};A.render();A.wkwUpdate();const c=document.querySelector('button.wchip[data-arg="weather"]');const r=c?(c.click(),document.querySelector('#modal .panel').innerText.replace(/\n+/g,' | ').slice(0,360)):null;m.kind=sv;return r;});
console.log(wx);chk('weather tag opens a popup with elements and duration',wx&&/Boosts/.test(wx)&&/Weakens/.test(wx)&&/steps/.test(wx)||wx);await shot('p5_weather');
await done(H);}
})();
