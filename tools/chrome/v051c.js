// Beta v0.5.1 follow ups: 1) the world view recovers its size by itself when it was measured during a settling screen (foldables,
// the Android app after a battle) and no resize event follows; 2) new skills lead the battle results; 3) a quest ready to hand in is
// announced and tagged in the menu; 4) status symbols sit under the hero's name in the Party menu.
const {open,chk,done}=require('./pw');
(async()=>{
for(const [w,h] of [[889,671],[844,390],[390,844]]){
  const H=await open({w,h,mobile:true});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(700);
  const good=await ev(()=>{const r=__A.WS.cv.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)];});
  // Galaxy Z Fold 8 open (about 935x705 CSS px): the view is exactly 300 logical pixels wide, the size a new canvas starts at.
  // A plain battle and back used to leave the rebuilt canvas at its default 300x150 because nothing seemed to change.
  {await ev(()=>{__A.startBattle({stage:0,kind:'field'});});await wait(500);await ev(()=>{__A.B.en.forEach(e=>e.hp=0);__A.win();});await wait(400);
   await ev(()=>{const b=document.querySelector('[data-act="resultOk"]');if(b)b.click();});await wait(700);
   const r=await ev(()=>{const c=__A.WS.cv,b=c.getBoundingClientRect();return [Math.round(b.width),Math.round(b.height),c.width,c.height];});
   chk(`${w}x${h}: same size after a plain battle (${r})`,r[0]===good[0]&&r[1]===good[1]||JSON.stringify({good,r}));}
  await ev(()=>{__A.startBattle({stage:0,kind:'field'});});await wait(500);
  await ev(()=>{__A.B.en.forEach(e=>e.hp=0);__A.win();});await wait(400);
  // the screen is still settling when the map comes back: the view's box reads a third of its width and the viewport is short
  await ev(()=>{const g=Element.prototype.getBoundingClientRect;window.__gbr=g;Element.prototype.getBoundingClientRect=function(){const r=g.call(this);if(this.classList&&this.classList.contains('wview'))return {left:r.left,top:r.top,right:r.left+r.width/3,bottom:r.bottom,width:r.width/3,height:r.height,x:r.x,y:r.y};return r;};
    window.__vvh=Object.getOwnPropertyDescriptor(VisualViewport.prototype,'height');Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>260});
    document.querySelector('[data-act="resultOk"]').click();});await wait(300);
  const bad=await ev(()=>{const r=__A.WS.cv.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)];});
  // the screen settles; no resize event comes
  await ev(()=>{Element.prototype.getBoundingClientRect=window.__gbr;delete visualViewport.height;});await wait(1500);
  const after=await ev(()=>{const r=__A.WS.cv.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)];});
  chk(`${w}x${h}: the view was shrunk while the screen settled (${bad} of ${good})`,bad[0]<good[0]||bad[1]<good[1]||'not shrunk, test setup failed');
  chk(`${w}x${h}: it recovers its full size by itself (${after})`,after[0]===good[0]&&after[1]===good[1]||JSON.stringify({good,after}));
  await H.browser.close();}
// Galaxy Z Fold 8 open: sweep the widths around it (about 935x705 CSS px) through a plain battle and back
{const bad=[];let hit=0;for(let w=920;w<=946;w++){const H=await open({w,h:705,mobile:true});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(400);
  const g=await ev(()=>{const r=__A.WS.cv.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),__A.WS.cv.width];});if(g[2]===300)hit++;
  await ev(()=>{__A.startBattle({stage:0,kind:'field'});});await wait(350);await ev(()=>{__A.B.en.forEach(e=>e.hp=0);__A.win();});await wait(300);
  await ev(()=>{const b=document.querySelector('[data-act="resultOk"]');if(b)b.click();});await wait(500);
  const r=await ev(()=>{const c=__A.WS.cv,b=c.getBoundingClientRect();return [Math.round(b.width),Math.round(b.height)];});
  if(r[0]!==g[0]||r[1]!==g[1])bad.push(w+': '+g.slice(0,2)+' -> '+r);await H.browser.close();}
 chk(`Fold 8 widths 920 to 946 (${hit} of them hit the 300 pixel view): same size after a battle`,bad.length===0&&hit>0||(hit?bad.join(' | '):'no width hit 300'));}
const H=await open({w:390,h:844,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await wait(500);
// 2) learned skills first on the result screen
const r2=await ev(()=>{const A=__A;A.V.modal={type:'result',info:{xp:10,gold:5,mats:{},drops:[],ups:[{name:'Mira',lv:4,pts:1}],gift:null,story:null,gear:null,bonds:[],quests:['x'],learn:[{name:'Mira',sk:{n:'Firebolt',k:'dmg',el:['fire']}}]}};try{A.render();}catch(e){return 'err '+e.message;}
  const p=document.querySelector('#modal .panel');if(!p)return 'no panel';const hs=[...p.querySelectorAll('h4')].map(h=>h.textContent);const nl=p.innerHTML.indexOf('New skills'),xp=p.innerHTML.indexOf('Experience');return {hs,first:nl>=0&&nl<xp};});
chk('battle results: New skills is the first section',r2&&r2.first===true||JSON.stringify(r2));
// 3) a quest ready to hand in
const r3=await ev(async()=>{const A=__A,G=A.G,o={};A.V.modal=null;for(let s=0;s<=G.stage;s++)A.genQuests(s);const q=G.quests.find(q=>q.type==='hunt')||G.quests.find(q=>q.type==='gather');if(!q)return 'no quest';
  q.state='active';if(q.type==='hunt')q.have=q.n;else G.mats[q.mat]=q.n;A.V.screen='world';A.render();await new Promise(r=>setTimeout(r,600));
  o.toast=[...document.querySelectorAll('.toast,#toast,[class*=toast]')].map(e=>e.textContent).join(' | ');o.dot=!!document.querySelector('[data-act="menu"] .qdot');
  A.V.modal={type:'menu',tab:'quests'};A.render();o.chip=/Quests\s*\d+ ready/.test(document.querySelector('#modal .mgrp').textContent);o.rowTag=!!document.querySelector('#modal .row .qtag');
  A.V.modal=null;A.render();await new Promise(r=>setTimeout(r,600));const t2=[...document.querySelectorAll('.toast,#toast,[class*=toast]')].map(e=>e.textContent).join(' | ');o.once=(t2.match(/Quest ready to hand in/g)||[]).length<=1;
  return o;});
chk('quest ready: a toast says so',/Quest ready to hand in/.test(r3.toast||'')||JSON.stringify(r3));
chk('quest ready: the Menu button carries a count',r3.dot===true);
chk('quest ready: the Quests chip says how many are ready',r3.chip===true);
chk('quest ready: the quest row is tagged',r3.rowTag===true);
chk('quest ready: announced once',r3.once===true);
// 4) status symbols under the name in the Party menu
const r4=await ev(()=>{const A=__A,G=A.G,c=G.roster[G.party[0]];c.ail={poison:1,curse:1};A.V.modal={type:'menu',tab:'party'};A.render();
  const card=document.querySelector('#modal .swc .swm');if(!card)return 'no card';const nm=card.querySelector('.swn b').getBoundingClientRect(),row=card.querySelector('.swstrow');if(!row)return 'no symbol row';
  const rr=row.getBoundingClientRect();return {below:rr.top>=nm.bottom-1,syms:row.querySelectorAll('svg.stsym').length,portDots:card.querySelectorAll('.port .ailrow').length};});
chk('Party menu: status symbols sit below the name',r4&&r4.below===true||JSON.stringify(r4));
chk('Party menu: one symbol per ailment, none doubled on the portrait',r4&&r4.syms===2&&r4.portDots===0||JSON.stringify(r4));
await done(H);})();
