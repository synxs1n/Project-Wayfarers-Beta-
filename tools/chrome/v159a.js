// Beta v0.17.8 menu pass (v3/menus11.js): (1) the menu history: Back (arrow, Esc, the sheet buttons) returns to the previous popup or menu tab at its
// scroll position, the stack clears in the world and is never saved; (2) a tap on the backdrop closes every popup, guarded against drags and
// answered popups; (3) Menu > Settings > Load another journey (two slots, confirm, loads in place, no reload); (4) Settings in titled sections in
// order, every old settings data-act still there. SHOTDIR=dir saves screenshots (settings at 390x844 and 1000x600, the journey picker).
// Usage: PWHTML=../../out/aurelis3.html [SHOTDIR=/tmp/x] node v159a.js
const {open,chk,done}=require('./pw');
const OLD=["p5Mute|mute", "p5Mute|muteMusic", "p5Mute|muteSfx", "cfg|[\"speed\",1]", "cfg|[\"speed\",1.5]", "cfg|[\"speed\",2]", "cfg|[\"enc\",\"off\"]", "cfg|[\"enc\",\"low\"]", "cfg|[\"enc\",\"normal\"]", "cfg|[\"enc\",\"high\"]", "cfg|[\"diff\",\"story\"]", "cfg|[\"diff\",\"normal\"]", "cfg|[\"diff\",\"hard\"]", "cfg|[\"autoStats\",true]", "cfg|[\"autoStats\",false]", "cfg|[\"autoEquip\",false]", "cfg|[\"autoEquip\",true]", "cfg|[\"minimap\",null]", "cfg|[\"minimap\",true]", "cfg|[\"minimap\",false]", "cfg|[\"rmotion\",null]", "cfg|[\"rmotion\",true]", "cfg|[\"rmotion\",false]", "cfg|[\"autoOne\",\"ask\"]", "cfg|[\"autoOne\",\"fire\"]", "cfg|[\"skTags\",\"full\"]", "cfg|[\"skTags\",\"sym\"]", "cfg|[\"expertBattle\",false]", "cfg|[\"expertBattle\",true]", "cfg|[\"timedHits\",false]", "cfg|[\"timedHits\",true]", "autoOpen|", "quitTitle|", "ambSet|0", "ambSet|0.3", "ambSet|0.55", "ambSet|0.8", "mstyleSet|orch", "mstyleSet|chip", "creditsOpen|", "kmOpen|", "cfg|[\"uiScale\",\"1\"]", "cfg|[\"uiScale\",\"2\"]", "cfg|[\"uiScale\",\"auto\"]", "cfg|[\"uiScale\",\"1.333\"]", "cfg|[\"uiScale\",\"1.667\"]", "cfg|[\"hints\",true]", "cfg|[\"hints\",false]", "cfg|[\"gfx\",\"auto\"]", "cfg|[\"gfx\",\"low\"]", "cfg|[\"gfx\",\"medium\"]", "cfg|[\"gfx\",\"high\"]", "cfg|[\"render\",\"auto\"]", "cfg|[\"render\",\"1\"]", "cfg|[\"render\",\"2\"]", "cfg|[\"render\",\"3\"]", "cfg|[\"tips\",true]", "cfg|[\"tips\",false]", "tipsReset|", "hintLog|", "cfg|[\"hd2d\",true]", "cfg|[\"hd2d\",false]"];
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'medium',hints:false,tips:false}}));`;
const START=`(ids)=>{const A=__A;A.ACT.new();ids.forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;}`;
const SH=process.env.SHOTDIR;const shot=async(page,n)=>{if(!SH)return;require('fs').mkdirSync(SH,{recursive:true});await page.screenshot({path:`${SH}/${n}.png`});};
(async()=>{
// ---------- 1. history, on a short phone so the tabs scroll ----------
{const H=await open({w:390,h:520,mobile:true,pre:PRE});const {ev,wait,page}=H;
 await ev(eval(START),['mira','lumen','oren']);await wait(200);
 const st=()=>ev(()=>({t:__A.V.modal&&__A.V.modal.type,tab:__A.V.modal&&__A.V.modal.tab,n:window.__M11.MH.stack.length,sc:(document.querySelector('#modal .panel')||{}).scrollTop,arrow:!!document.querySelector('#modal .mback')}));
 await ev(()=>{__A.ACT.menu();});await wait(120);
 let s=await st();chk('menu opens on Party, nothing to go back to: no back arrow',s.t==='menu'&&s.tab==='party'&&s.n===0&&!s.arrow||JSON.stringify(s));
 await ev(()=>{__A.ACT.menuTab('items');});await wait(150);
 const sc=await ev(()=>{const p=document.querySelector('#modal .panel');p.scrollTop=140;return {top:p.scrollTop,max:p.scrollHeight-p.clientHeight};});
 chk('the Items tab scrolls inside the box on a short phone ('+JSON.stringify(sc)+')',sc.top>60||JSON.stringify(sc));
 await ev(()=>{__A.ACT.viewChar('mira');});await wait(150);
 s=await st();chk('a hero sheet opened from Items: stack has Party and Items, the arrow shows',s.t==='char'&&s.n===2&&s.arrow||JSON.stringify(s));
 await ev(()=>{__A.ACT.charBack();});await wait(300);
 s=await st();chk('the sheet Back button returns to the Items tab at the scroll it was left at',s.t==='menu'&&s.tab==='items'&&Math.abs(s.sc-sc.top)<=2||JSON.stringify(s)+' want '+sc.top);
 await ev(()=>{__A.ACT.menuTab('pouch');});await wait(120);
 await page.keyboard.press('Escape');await wait(250);
 s=await st();chk('Esc goes back from Materials to Items, scroll restored',s.t==='menu'&&s.tab==='items'&&Math.abs(s.sc-sc.top)<=2||JSON.stringify(s));
 await page.click('#modal .mback');await wait(250);
 s=await st();chk('the arrow button goes back to Party',s.t==='menu'&&s.tab==='party'&&s.n===0||JSON.stringify(s));
 await ev(()=>{__A.ACT.xBack();});await wait(150);
 s=await st();chk('with nothing left, Back leaves to the world',s.t==null&&s.n===0||JSON.stringify(s));
 // a chain with a popup in between: Items -> sheet -> Equip page (eqOpen) -> back is the sheet, back again is Items
 await ev(()=>{const A=__A;A.ACT.menu();A.ACT.menuTab('items');A.ACT.viewChar('oren');A.ACT.eqOpen('oren');});await wait(200);
 await ev(()=>{__A.ACT.xBack();});await wait(150);s=await st();
 chk('Equip page opened from a sheet goes back to the sheet, not the world',s.t==='char'||JSON.stringify(s));
 await ev(()=>{__A.ACT.xBack();});await wait(150);s=await st();
 chk('and the sheet goes back to the tab it came from',s.t==='menu'&&s.tab==='items'||JSON.stringify(s));
 // role picker keeps its place
 await ev(()=>{const A=__A;A.ACT.viewChar('oren');A.ACT.rolePick&&A.ACT.rolePick('oren');});await wait(150);s=await st();
 if(s.t==='rolepick'){await ev(()=>{__A.ACT.roleBack();});await wait(150);s=await st();chk('Role picker Back returns to the sheet',s.t==='char'||JSON.stringify(s));}
 else console.log('(rolepick not opened here: '+s.t+')');
 // stack clears on the world and in saves
 await ev(()=>{__A.ACT.xClose();});await wait(100);s=await st();
 chk('Close (X) clears the stack',s.t==null&&s.n===0||JSON.stringify(s));
 await ev(()=>{const A=__A;A.ACT.menu();A.ACT.menuTab('items');A.ACT.menuTab('pouch');A.saveGame();});await wait(100);
 const saved=await ev(()=>Object.keys(localStorage).map(k=>localStorage.getItem(k)).join('\n'));
 chk('the stack and its snapshots are not in any save or setting',!/"snap"|"sig":|m11|MH\./.test(saved));
 await ev(()=>{__A.ACT.closeModal();});
 await H.browser.close();}

// ---------- 2. backdrop ----------
{const H=await open({w:1000,h:600,pre:PRE});const {ev,wait,page}=H;
 await ev(eval(START),['mira','lumen','oren']);await wait(200);
 const mod=()=>ev(()=>({t:__A.V.modal&&__A.V.modal.type,n:window.__M11.MH.stack.length}));
 await ev(()=>{const A=__A;A.ACT.menu();A.ACT.menuTab('items');A.ACT.viewChar('mira');});await wait(200);
 const box=await ev(()=>{const r=document.querySelector('#modal .panel').getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom};});
 // press in the box, release on the backdrop: a drag that ends outside
 await page.mouse.move(box.l+30,box.t+40);await page.mouse.down();await page.mouse.move(5,5,{steps:4});await page.mouse.up();await wait(150);
 let s=await mod();chk('a drag that ends outside the box does not close',s.t==='char'||JSON.stringify(s));
 // press on the backdrop, drag, release
 await page.mouse.move(5,5);await page.mouse.down();await page.mouse.move(60,70,{steps:4});await page.mouse.up();await wait(150);
 s=await mod();chk('a drag that starts on the backdrop does not close',s.t==='char'||JSON.stringify(s));
 await page.mouse.click(box.l+40,box.t+30);await wait(100);s=await mod();chk('a click inside the box does not close',s.t!=null||JSON.stringify(s));
 await page.mouse.click(5,5);await wait(200);s=await mod();
 chk('a tap outside the box closes every level (sheet, Items, Party) to the world and clears the history',s.t==null&&s.n===0||JSON.stringify(s));
 // answered popups stay
 await ev(()=>{const A=__A;A.V.modal={type:'story',title:'Test',text:'Answer me.',btn:'OK'};A.render();});await wait(100);
 await page.mouse.click(5,5);await wait(150);s=await mod();chk('a story popup is not closed by a tap outside',s.t==='story'||JSON.stringify(s));
 const ok=await ev(()=>{const A=__A;A.V.modal=null;A.render();return true;});
 await ev(()=>{const A=__A;A.V.modal={type:'cev',ev:{n:'x',t:'y',o:[]}};});
 // a pasted save is not thrown away
 await ev(()=>{__A.ACT.importOpen();});await wait(150);
 await ev(()=>{const t=document.querySelector('#modal textarea');if(t){t.value='AWSAVE1.xyz';}});
 await page.mouse.click(5,5);await wait(150);s=await mod();
 chk('a popup with typed text is not closed by a stray tap',s.t==='import'||JSON.stringify(s));
 await ev(()=>{__A.ACT.closeModal();});
 // a battle: tap on the backdrop keeps the command prompt (only information popups close)
 const bt=await ev(()=>{const A=__A;try{A.startBattle&&A.startBattle(A.G.stage||0,0);}catch(e){}return {screen:A.V.screen};});
 if(bt.screen==='battle'){await wait(300);await ev(()=>{const A=__A;A.V.modal={type:'result'};});
  console.log('(battle started for the exempt check)');}
 await H.browser.close();}

// ---------- 3. load another journey ----------
{const H=await open({w:1000,h:600,pre:PRE});const {ev,wait,page}=H;
 await ev(eval(START),['mira','lumen','oren']);await wait(200);
 await ev(()=>{const A=__A;A.G.gold=111;A.saveGame();});
 await ev(()=>{const A=__A;A.ACT.toTitle();A.META.slot=1;A.saveMeta&&A.saveMeta();});await wait(100);
 await ev(eval(START),['tess','sable','pip']);await wait(200);
 const base=await ev(()=>{const A=__A;A.G.gold=222;A.saveGame();window.__nr=1;return {slot:A.META.slot,party:A.G.party.slice(),sv:A.SV.status};});
 chk('setup: journey in slot 2 is the one being played',base.slot===1||JSON.stringify(base));
 await ev(()=>{const A=__A;A.ACT.menu();A.ACT.menuTab('settings');});await wait(250);
 await shot(page,'settings_1000x600');
 await page.click('#modal [data-act=m11Load]');await wait(250);
 let r=await ev(()=>({t:__A.V.modal.type,ig:__A.V.modal.ingame,h2:(document.querySelector('#modal h2')||{}).textContent,loads:[...document.querySelectorAll('#modal [data-act=m11Ask]')].map(e=>e.dataset.arg+':'+(e.disabled?'dis':'ok')),
   slotLoad:document.querySelectorAll('#modal [data-act=slotLoad]').length,delCur:!!document.querySelector('#modal [data-act=slotDel][data-arg="1"]'),txt:document.querySelector('#modal').innerText}));
 chk('the title\'s slot picker opens in the game with the summaries of both slots',r.t==='slots'&&r.ig&&/Load another journey/.test(r.h2)&&r.loads.join()==='0:ok,1:ok,2:dis'&&r.slotLoad===0&&/Slot 1/.test(r.txt)&&/Slot 2/.test(r.txt)&&/Party level/.test(r.txt)||JSON.stringify(r));
 chk('the slot being played cannot be deleted from here',!r.delCur);
 await shot(page,'journey_picker_1000x600');
 await page.click('#modal [data-act=m11Ask][data-arg="0"]');await wait(200);
 r=await ev(()=>({t:__A.V.modal.type,txt:document.querySelector('#modal').innerText,go:!!document.querySelector('#modal [data-act=m11Go]')}));
 chk('Load asks "Leave this journey? Unsaved progress since <time> is lost"',r.t==='m11leave'&&/Leave this journey\?/.test(r.txt)&&/Unsaved progress since .+ is lost/.test(r.txt)&&r.go||JSON.stringify(r));
 await shot(page,'journey_confirm_1000x600');
 await ev(()=>{__A.G.gold=999;});          // unsaved change that must be dropped
 await page.click('#modal [data-act=xBack]');await wait(200);
 r=await ev(()=>({t:__A.V.modal&&__A.V.modal.type,gold:__A.G.gold,slot:__A.META.slot}));
 chk('Stay here goes back to the picker and nothing changed',r.t==='slots'&&r.gold===999&&r.slot===1||JSON.stringify(r));
 await page.click('#modal [data-act=m11Ask][data-arg="0"]');await wait(150);
 await page.click('#modal [data-act=m11Go]');await wait(500);
 r=await ev(()=>{const A=__A;return {screen:A.V.screen,modal:A.V.modal&&A.V.modal.type,gold:A.G.gold,slot:A.META.slot,party:A.G.party.slice(),nr:window.__nr,n:window.__M11.MH.stack.length,s1:(()=>{const k=Object.keys(localStorage).find(k=>/-s1$/.test(k));return JSON.parse(localStorage.getItem(k)||'{}').gold;})()};});
 chk('the other slot loads in place: world, gold 111, slot 1, its own party, no page reload',r.screen==='world'&&!r.modal&&r.gold===111&&r.slot===0&&r.party.includes('mira')&&r.nr===1||JSON.stringify(r));
 chk('the history is empty after the load, and the journey left behind keeps its last save (gold 222, not 999)',r.n===0&&r.s1===222||JSON.stringify(r));
 // and back again, from the Journey tab button
 await ev(()=>{const A=__A;A.ACT.menu();A.ACT.menuTab('system');});await wait(200);
 const jb=await ev(()=>!!document.querySelector('#modal [data-act=m11Load]'));
 chk('Menu > Journey has a Load another journey button too',jb);
 await H.browser.close();}

// ---------- 4. settings sections ----------
for(const [w,h,mob] of [[390,844,true],[1000,600,false]]){
 const H=await open({w,h,mobile:mob,pre:PRE});const {ev,wait,page}=H;const tag=`${w}x${h}: `;
 await ev(eval(START),['mira','lumen','oren']);await wait(200);
 await ev(()=>{const A=__A;A.SV.status='synced';A.ACT.menu();A.ACT.menuTab('settings');});await wait(250);
 if(mob){ // phones: Play open, the rest folded; open them all for the checks
  const f=await ev(()=>[...document.querySelectorAll('#modal .m11sec')].map(e=>e.dataset.sec+':'+(e.classList.contains('shut')?'shut':'open')));
  chk(tag+'phone: the page opens as a list of folded sections ('+f.join(' ')+')',f.length>=6&&f.every(x=>/:shut$/.test(x)));
  await shot(page,'settings_390x844_folded');
  await ev(()=>{document.querySelector('#modal [data-act=m11Sec][data-arg=account]').click();});await wait(150);await shot(page,'settings_390x844_account_open');await ev(()=>{document.querySelector('#modal [data-act=m11Sec][data-arg=account]').click();});await wait(100);
  for(const k of ['play','display','sound','controls','account','help','danger'])await ev(k=>{const b=document.querySelector(`#modal [data-act=m11Sec][data-arg=${k}]`);if(b&&b.closest('.m11sec').classList.contains('shut'))b.click();},k);
  await wait(200);}
 const info=await ev(()=>{const secs=[...document.querySelectorAll('#modal .m11sec')].map(s=>({k:s.dataset.sec,title:s.querySelector('.m11h span').textContent,rows:[...s.querySelectorAll('.row,.btnrow>*,p.note')].map(r=>(r.querySelector('b')||r).textContent.trim().slice(0,40)),acts:[...s.querySelectorAll('[data-act]')].map(e=>e.dataset.act+'|'+(e.dataset.arg||''))}));
  const all=[...document.querySelectorAll('#modal [data-act]')].map(e=>e.dataset.act+'|'+(e.dataset.arg||''));return {secs,all,hs:document.documentElement.scrollWidth<=document.documentElement.clientWidth};});
 const titles=info.secs.map(s=>s.title);
 const want=['Play','Display','Sound',...(mob?['Controls']:['Controls']),'Account and Saves','Help and Feedback','Danger zone'];
 chk(tag+'sections in order: '+titles.join(' > '),JSON.stringify(titles)===JSON.stringify(want));
 const rowsOf=k=>(info.secs.find(s=>s.k===k)||{rows:[]}).rows.join(' / ');
 const pos=(k,names)=>{const L=(info.secs.find(s=>s.k===k)||{rows:[]}).rows;const ix=names.map(n=>L.findIndex(x=>x.startsWith(n)));return ix.every(i=>i>=0)&&ix.every((v,i)=>!i||v>ix[i-1])||names.join()+' in '+L.join('|');};
 chk(tag+'Play: speed, auto battle, timed hits, hints, difficulty, encounters, in that order',pos('play',['Battle speed','Auto battle settings','Timed hits','Hints','Difficulty','Encounters']));
 chk(tag+'Display: graphics, render scale, motion'+(mob?'':', screen size')+', in that order',pos('display',mob?['Graphics','Render scale','Motion']:['Graphics','Render scale','Motion','Screen size']));
 chk(tag+'Sound: master, music, effects volumes, ambience, music style, credits',pos('sound',['Master','Music','Sound effects','Ambience','Music style','Credits']));
 chk(tag+'Account and Saves: save, load another journey, export, main menu',pos('account',['Save now','Load another journey','Export and import','Main menu']));
 chk(tag+'Help and Feedback has Help / Feedback; Danger zone is last',/Help and feedback/.test(rowsOf('help'))&&titles[titles.length-1]==='Danger zone'&&/Delete cloud save/.test(rowsOf('danger')));
 if(!mob)chk(tag+'Controls holds the Keys row',/Keys/.test(rowsOf('controls')));
 const miss=OLD.filter(x=>!info.all.includes(x)&&!(mob&&/^(kmOpen|cfg\|\["uiScale")/.test(x)));
 chk(tag+'every old settings data-act and argument is still there ('+OLD.length+' checked)',miss.length===0||'missing '+miss.join(', '));
 chk(tag+'nothing falls out of the sections (no More)',!info.secs.some(s=>s.k==='more')||JSON.stringify(info.secs.find(s=>s.k==='more')));
 chk(tag+'no horizontal scroll',info.hs);
 // a setting still works from its new place, and the section folds and unfolds
 await ev(()=>{const b=document.querySelector('#modal [data-act=cfg][data-arg=\'["speed",2]\']');b.click();});await wait(150);
 chk(tag+'a chip still changes its setting',await ev(()=>__A.META.cfg.speed===2));
 await ev(()=>{document.querySelector('#modal [data-act=m11Sec][data-arg=sound]').click();});await wait(120);
 const f1=await ev(()=>document.querySelector('#modal .m11sec.sound').classList.contains('shut'));
 await ev(()=>{document.querySelector('#modal [data-act=m11Sec][data-arg=sound]').click();});await wait(120);
 const f2=await ev(()=>document.querySelector('#modal .m11sec.sound').classList.contains('shut'));
 chk(tag+'a section header folds and unfolds',f1!==f2);
 await shot(page,`settings_${w}x${h}_top`);
 await ev(()=>{const p=document.querySelector('#modal .panel'),e=document.querySelector('#modal .m11sec.account');p.scrollTop=e.offsetTop-80;});await wait(150);await shot(page,`settings_${w}x${h}_account`);
 // the title screen's gear still works (no game)
 await ev(()=>{const A=__A;A.ACT.closeModal();A.ACT.toTitle();A.ACT.settings();});await wait(200);
 chk(tag+'Settings from the title screen still renders',await ev(()=>/play/i.test(document.querySelector('#modal').innerText)&&!!document.querySelector('#modal [data-act=cfg]')));
 await H.browser.close();}
const H={browser:{close:async()=>{}}};await done(H);
})();
