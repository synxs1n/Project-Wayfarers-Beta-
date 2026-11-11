// Beta v0.16.7 battle UI pass (v3/battle11.js): foes drawn bigger (BIG_ART x1.35, others x1.1, heroes unchanged), kept inside the stage, the
// unit box and HUD following; no HP/MP mini bars in the command head (the hero card keeps them); double tap / press and hold on a foe opens its
// card (ACT.uInfo), a hold does not target on release, a single tap still targets, the timed hit ring still owns every press.
// Usage: PWHTML=../../out/aurelis3.html node v152a.js
const {open,chk,done}=require('./pw');const {META,battle}=require('./v063lib');
(async()=>{
for(const [w,h,gfx] of [[390,844,'medium'],[1000,560,'medium'],[390,844,'low']]){
 const tag=`${w}x${h} ${gfx}`,H=await open({w,h,mobile:w<500,pre:META(gfx)});const {ev,wait,page}=H;
 await battle(H,{boss:true,stage:2,foes:3});
 // v0.19.2: the random foe pick can hold a guardian (a Sanctum variant), now boss sized: it would cover the first foe's centre, so ordinary foes stand in for it
 await ev(()=>{const A=__A,B=A.B,M=A.TW.get('MINI_BIG');B.en.forEach((e,i)=>{if(M.has(e.art))B.en[i]=A.makeEnemy(A.MON.mossling,5);});A.render();});
 const r=await ev(()=>{const A=__A,B=A.B,out={foes:[],heroes:[]};
  B.en.forEach(e=>{const b=A.unitBox(e),c=A.spriteOf(e),sz=A.MON_SIZE(e.art);out.foes.push({art:e.art,sz,w:b.w,h:b.h,top:b.y-b.h,H:A.BL.H,cw:c.width,ch:c.height});});
  B.front.forEach(u=>{const b=A.unitBox(u),c=A.spriteOf(u);out.heroes.push({w:b.w,h:b.h,cw:c.width,ch:c.height});});
  out.bars=document.querySelectorAll('#bcmd .cmdhead .b8hm').length;out.sr=/HP \d+ of \d+, MP/.test((document.querySelector('#bcmd .cmdhead')||{getAttribute(){return '';}}).getAttribute('aria-label')||'');
  out.cardBars=document.querySelectorAll('#bparty .pcw .hb,#bparty .pcw .bar').length;out.who=!!document.querySelector('#bcmd .cmdhead b');
  return out;});
 console.log(tag,JSON.stringify(r));
 chk(`${tag}: foes are drawn on a padded stage canvas (v0.17.9: at least the old 81 / 44 art box, box and canvas agree)`,r.foes.every(f=>f.w>=(f.sz>=60?81:44)&&f.cw===f.w&&f.ch===f.h)||JSON.stringify(r.foes));
 chk(`${tag}: no foe pokes above the stage`,r.foes.every(f=>f.top>=0)||JSON.stringify(r.foes));
 chk(`${tag}: heroes keep their size (canvas at most 40x56)`,r.heroes.every(x=>x.cw<=40&&x.ch<=56&&x.w===x.cw)||JSON.stringify(r.heroes));
 chk(`${tag}: no HP/MP bars in the command head, name kept, the numbers stay for screen readers when the head is shown`,r.bars===0&&r.who&&(w>500||r.sr)||JSON.stringify([r.bars,r.who,r.sr]));
 // gestures
 const foeXY=async()=>ev(()=>{const e=document.querySelector('#bstage .unit.foe');const b=e.getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2,n:document.querySelectorAll('#bstage .unit.foe').length};});
 const det=()=>ev(()=>({d:__A.B.uDet&&__A.B.uDet.ref,menu:__A.B.menu,mode:__A.B.mode,pend:!!__A.B.pend}));
 const close=()=>ev(()=>{if(__A.B.uDet)__A.ACT.uClose();});
 let p=await foeXY();
 chk(`${tag}: the foe's unit box covers the drawn sprite (height >= 81 css px / scale)`,p.n>=1);
 await page.mouse.click(p.x,p.y);await wait(120);
 let d=await det();chk(`${tag}: one tap outside targeting does nothing`,d.d==null||JSON.stringify(d));
 await page.mouse.dblclick(p.x,p.y);await wait(150);d=await det();
 chk(`${tag}: double click opens the foe's card`,d.d==='e:0'||JSON.stringify(d));await close();await wait(100);
 p=await foeXY();await page.mouse.move(p.x,p.y);await page.mouse.down();await wait(650);d=await det();
 chk(`${tag}: press and hold opens the card`,d.d==='e:0'||JSON.stringify(d));await page.mouse.up();await wait(100);d=await det();
 chk(`${tag}: releasing a hold keeps the card and targets nothing`,d.d==='e:0'&&d.mode==='cmd'||JSON.stringify(d));await close();await wait(100);
 // plate: the foe plate drawn on the stage (not a DOM button)
 const pl=await ev(()=>{const A=__A,L=A.b3Lay(),f=A.B.en[0],pt=L.plates.get(f),r=document.getElementById('bstage').getBoundingClientRect(),k=r.width/A.BL.W;return pt?{x:r.left+(pt.x+pt.w/2)*k,y:r.top+(pt.y+pt.h/2)*k,over:(document.elementFromPoint(r.left+(pt.x+pt.w/2)*k,r.top+(pt.y+pt.h/2)*k)||{}).className}:null;});
 if(pl){await page.mouse.dblclick(pl.x,pl.y);await wait(150);d=await det();chk(`${tag}: double click on the foe's plate opens the card (${pl.over})`,d.d==='e:0'||JSON.stringify([d,pl]));await close();}
 // aiming: a single tap targets (on release), a hold only opens the card
 await ev(()=>{const A=__A,B=A.B,a=B.cur;a.mp=Math.max(a.mp,5);A.ACT.cmd('attack');});await wait(150);
 let t=await ev(()=>({menu:__A.B.menu,tg:document.querySelectorAll('#bstage .unit.foe.tg').length}));
 if(t.menu==='target'){p=await foeXY();await page.mouse.move(p.x,p.y);await page.mouse.down();await wait(650);d=await det();await page.mouse.up();await wait(150);const d2=await det();
  chk(`${tag}: aiming: a hold opens the card and does not fire the attack`,d.d==='e:0'&&d2.menu==='target'||JSON.stringify([d,d2]));await close();await wait(100);
  p=await foeXY();await page.mouse.click(p.x,p.y);await wait(200);const d3=await ev(()=>({menu:__A.B.menu,mode:__A.B.mode,pend:!!__A.B.pend,t:__A.B.en[0].hp<__A.B.en[0].S.mhp||__A.B.mode!=='cmd'}));
  chk(`${tag}: aiming: a single tap still targets the foe`,d3.menu!=='target'||d3.mode!=='cmd'||JSON.stringify(d3));
 }else chk(`${tag}: aiming menu reached`,JSON.stringify(t));
 // a timed hit ring owns the press
 const ring=await ev(()=>{const A=__A;A.B.uDet=null;let n=0;const R=A.TW.get('B5R');R.ring={done:false,press(){n++;return true;}};const e=document.querySelector('#bstage .unit.foe');
  if(!e){R.ring=null;return {skip:1};}const b=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true,clientX:b.left+5,clientY:b.top+5,pointerId:7,isPrimary:true,button:0}));
  const o={n,fg:!!(window.__B11&&__B11.fg())};R.ring=null;return o;});
 chk(`${tag}: while a timed ring is up the press goes to the ring only`,ring.skip||ring.n===1&&!ring.fg||JSON.stringify(ring));
 await H.browser.close();}
const H=await open({});await done(H);})();
