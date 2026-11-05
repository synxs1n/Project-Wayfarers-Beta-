// Beta v0.5.3 UI: at every target size (360x740, 390x844, 844x390, 933x705 Galaxy Z Fold open, 1280x800) no main menu tab, shop
// screen, the title, the world HUD or the battle panels scrolls sideways; the Party menu's 3+3 grid (front line and reserve) fits
// one view of the open panel (all six cards visible at one scroll position, as before this pass); the main buttons and command items stay at least 40 px tall on touch screens.
// Usage: PWHTML=../../out/aurelis3.html node v053ua.js
const {open,chk,done}=require('./pw');
const SIZES=[[360,740,true],[390,844,true],[844,390,true],[933,705,true],[1280,800,false]];
const TABS=['party','roster','loadouts','comp','equip','items','next','lore','types','fmis','help','system','beasts','codex','factions','quests','map','settings'];
const SHOPS=[];['weapons','armor','craft','forge','mats','sell','echo'].forEach(t=>SHOPS.push({type:'smithy',tab:t}));
['weapon','armor','cape','trinket'].forEach(c=>SHOPS.push({type:'smithy',tab:'craft',cat:c}));
['shop','relit','craft','herbs','sell','pouch'].forEach(t=>SHOPS.push({type:'workshop',tab:t}));
['recruit','nature','personal','bounties','arena'].forEach(t=>SHOPS.push({type:'guild',tab:t}));
SHOPS.push({type:'tavern'},{type:'inn'},{type:'board'});
(async()=>{let H;for(const [w,h,mobile] of SIZES){
  H=await open({w,h,mobile,pre:`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{hints:false,music:0,sfx:0,enc:'off'}}));`});const {ev,wait}=H;const tag=w+'x'+h;
  const over=()=>ev(()=>{const de=document.documentElement,o=[];if(de.scrollWidth>innerWidth+1)o.push('page '+de.scrollWidth);
    const b=document.querySelector('#modal .box');if(b){if(b.scrollWidth>b.clientWidth+1)o.push('panel '+b.scrollWidth+'>'+b.clientWidth);const r=b.getBoundingClientRect();if(r.right>innerWidth+1||r.left<-1)o.push('panel edge '+Math.round(r.left)+'..'+Math.round(r.right));}
    return o.join(', ');});
  await wait(300);let bad=[];
  {const o=await over();if(o)bad.push('title: '+o);}
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.gold=9999;
    ['brann','sable','tess'].forEach(id=>{if(!A.G.roster[id]){A.G.roster[id]=A.newChar(id,3,0);A.G.party.push(id);}});A.render();});await wait(400);
  {const o=await over();if(o)bad.push('world: '+o);}
  for(const t of TABS){const e=await ev(t=>{try{__A.V.modal={type:'menu',tab:t};__A.render();return '';}catch(e){return e.message;}},t);if(e){bad.push(t+' error '+e);continue;}const o=await over();if(o)bad.push('menu '+t+': '+o);}
  for(const s of SHOPS){const e=await ev(s=>{try{__A.V.modal=Object.assign({},s);__A.render();return '';}catch(e){return e.message;}},s);if(e){bad.push(JSON.stringify(s)+' error '+e);continue;}const o=await over();if(o)bad.push(JSON.stringify(s)+': '+o);}
  chk(`${tag}: no sideways scroll on the title, world, ${TABS.length} menu tabs and ${SHOPS.length} shop screens`,bad.length===0||bad.slice(0,6).join(' | '));
  // Party menu: front line and reserve (3+3) inside the open panel without scrolling it
  const fit=await ev(()=>{__A.V.modal={type:'menu',tab:'party'};__A.render();const b=document.querySelector('#modal .box');b.scrollTop=0;const g=[...b.querySelectorAll('.swlist.g3')];if(g.length<2)return 'grids '+g.length;
    const br=b.getBoundingClientRect(),last=g[1].getBoundingClientRect(),cards=g[0].querySelectorAll('.swc').length+g[1].querySelectorAll('.swc').length;
    const h4=[...b.querySelectorAll('h4')].find(x=>/front/i.test(x.textContent))||g[0],top=h4.getBoundingClientRect().top,vis=Math.min(br.bottom,innerHeight)-Math.max(br.top,0);
    const row=[...g[0].querySelectorAll('.swc')].map(c=>Math.round(c.getBoundingClientRect().top)),row2=[...g[1].querySelectorAll('.swc')].map(c=>Math.round(c.getBoundingClientRect().top));
    return {cards,block:Math.round(last.bottom-top),view:Math.round(vis),rows:new Set(row).size===1&&new Set(row2).size===1,atTop:last.bottom<=Math.min(br.bottom,innerHeight)+1,fits:last.bottom-top<=vis};});
  const needFit=true;
  chk(`${tag}: Party menu 3+3 grid fits one view, three per row (${JSON.stringify(fit)})`,!needFit||(fit&&fit.cards===6&&fit.fits&&fit.rows)||JSON.stringify(fit));
  // touch targets
  if(mobile){const small=await ev(async()=>{const A=__A,o=[];const meas=(sel,where)=>document.querySelectorAll(sel).forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.height&&r.height<39.5)o.push(where+' '+(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,14)+' '+Math.round(r.height));});
    A.V.modal=null;A.render();meas('.wbar .btn,.abtn,.hdr .btn','world');
    A.V.modal={type:'menu',tab:'party'};A.render();await new Promise(r=>setTimeout(r,450));meas('#modal .mclose,#modal .mback,#modal .chips.mgrp .chip,#modal .chips.msub .chip,#modal .ptools .btn','menu');
    A.V.modal={type:'smithy',tab:'weapons'};A.render();await new Promise(r=>setTimeout(r,450));meas('#modal .mclose,#modal .mback','smithy');
    A.V.modal=null;A.render();A.startBattle({stage:0,kind:'field'});await new Promise(r=>setTimeout(r,700));meas('#bcmd .mi,#bcmd .btnrow .btn','battle');
    A.B.en.forEach(e=>e.hp=0);A.win();await new Promise(r=>setTimeout(r,900));meas('#modal .btn.gold','results');
    return o;});
    chk(`${tag}: touch targets at least 40 px tall`,small.length===0||small.slice(0,8).join(', '));
    const bt=await ev(()=>{const o=[];const de=document.documentElement;if(de.scrollWidth>innerWidth+1)o.push('page '+de.scrollWidth);return o.join(',');});
    chk(`${tag}: battle and results do not scroll sideways`,bt===''||bt);}
  await H.browser.close();}
  await done(H);})();
