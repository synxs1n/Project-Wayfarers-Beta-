// Menu pass 12 (v3/menus12.js, menus11.js): (1) the battle command menu remembers its place per hero (submenu, list scroll, last skill);
// (2) Back steps between menus (Party > sheet > Equipment screen), not between tabs, and ends by closing the menu; (3) every skill row (battle list,
// hero sheet, codex and starter previews, "learned" notice) carries target scope, delivery kind with its symbol (for the weapon in hand), element
// and Primer / Detonator tags; (4) the Slash and Pierce symbols are code-drawn curves; (5) no skill text names a role.
// SHOTDIR=dir saves the symbol sheet and a sheet / battle row screenshot. Usage: PWHTML=../../out/aurelis3.html [SHOTDIR=/tmp/x] node v172a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'medium',hints:false,tips:false}}));`;
const START=`(ids)=>{const A=__A;A.ACT.new();ids.forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;}`;
const SH=process.env.SHOTDIR;
(async()=>{
// ---------- 1. history between menus ----------
{const H=await open({w:390,h:560,mobile:true,pre:PRE});const {ev,wait,page}=H;
 await ev(eval(START),['mira','lumen','oren']);await wait(200);
 const st=()=>ev(()=>({t:__A.V.modal&&__A.V.modal.type,tab:__A.V.modal&&__A.V.modal.tab,gear:!!(__A.V.modal&&__A.V.modal.gear),n:window.__M11.MH.stack.length,arrow:!!document.querySelector('#modal .mback')}));
 await ev(()=>{__A.ACT.menu();});await wait(120);
 let s=await st();chk('the Menu opens on Party: nothing behind it, no back arrow',s.t==='menu'&&s.tab==='party'&&s.n===0&&!s.arrow||JSON.stringify(s));
 await ev(()=>{const A=__A;A.ACT.menuTab('items');A.ACT.menuTab('pouch');});await wait(150);
 s=await st();chk('tabs are not history steps: Party > Items > Materials still has an empty history',s.t==='menu'&&s.tab==='pouch'&&s.n===0||JSON.stringify(s));
 await ev(()=>{__A.ACT.viewChar('mira');});await wait(150);
 s=await st();chk('a hero sheet opened from the Menu is one step (the Menu), the arrow shows',s.t==='char'&&s.n===1&&s.arrow||JSON.stringify(s));
 await ev(()=>{__A.ACT.eqOpen('mira');});await wait(150);
 s=await st();chk('the Equipment screen opened from the sheet is the next step',s.t==='menu'&&s.tab==='equip'&&s.n===2&&s.arrow||JSON.stringify(s));
 await ev(()=>{__A.ACT.menuTab('items');});await wait(120);s=await st();chk('a tab tapped inside the Equipment screen is not a step',s.t==='menu'&&s.n===2||JSON.stringify(s));
 await page.keyboard.press('Escape');await wait(200);
 s=await st();chk('Back from the Equipment screen shows the sheet',s.t==='char'&&s.n===1||JSON.stringify(s));
 await page.click('#modal .mback');await wait(250);
 s=await st();chk('Back from the sheet shows the Menu on the tab it was left on (Materials)',s.t==='menu'&&s.tab==='pouch'&&s.n===0||JSON.stringify(s));
 await page.keyboard.press('Escape');await wait(200);
 s=await st();chk('Back from the first menu closes it entirely',s.t==null&&s.n===0||JSON.stringify(s));
 // many tabs, then one Back: out, not through the tabs
 await ev(()=>{const A=__A;A.ACT.menu();['items','pouch','equip','map','items'].forEach(t=>A.ACT.menuTab(t));});await wait(150);
 await page.keyboard.press('Escape');await wait(200);
 s=await st();chk('five tab changes then Back leaves the menu (tabs are remembered, not steps)',s.t==null||JSON.stringify(s));
 // a shop section is not a step either
 await ev(()=>{const A=__A;A.V.modal={type:'smithy',tab:'shop',sec:'weapons'};A.render();});await wait(200);
 s=await st();
 if(s.t==='smithy'){await ev(()=>{__A.ACT.xBack();});await wait(150);s=await st();chk('a shop on a section: Back leaves the shop, not to "All"',s.t==null||JSON.stringify(s));}
 else console.log('(smithy not open here: '+s.t+')');
 // tap outside still closes everything
 await ev(()=>{const A=__A;A.ACT.menu();A.ACT.viewChar('oren');});await wait(200);
 await page.mouse.click(2,2);await wait(200);
 s=await st();chk('tapping outside still closes every level',s.t==null&&s.n===0||JSON.stringify(s));
 await H.browser.close();}

// ---------- 2. tags on every skill row, no role names ----------
{const H=await open({w:430,h:900,mobile:true,pre:PRE});const {ev,wait,page}=H;
 await ev(eval(START),['mira','lumen','oren']);await wait(200);
 const r=await ev(()=>{const A=__A,T=A.TW.get,TPL=T('TPL'),RAW=T('RAW'),G=T('G'),out={rows:0,miss:[],role:[],kindWrong:[],battle:0,bmiss:[],cls:{}};
  const ids=RAW.filter(r=>TPL[r[0]]&&!TPL[r[0]].mon).map(r=>r[0]);const seen={};
  // text: no skill (class list, bond, archive, Limit) names a role
  ids.forEach(id=>{const t=TPL[id];let L=[];try{L=T('classSkills')(t);}catch(e){}
   L.forEach(s=>{if(/\brole\b|\bas an? (healer|debuffer|buffer|tank|support|saboteur|caster|marksman|striker|guardian|summoner)\b/i.test(s.d||''))out.role.push(id+'/'+s.id+': '+s.d);});});
  Object.entries(T('LIMIT')).forEach(([c,L])=>{if(/\brole\b/i.test(L.d||''))out.role.push('limit '+c);});
  // hero sheet rows and battle rows, one hero per class and per single / dual type
  ids.forEach(id=>{const t=TPL[id],k=t.cls+t.el.length;if(seen[k])return;seen[k]=1;
   G.roster[id]=T('newChar')(id,30);const c=G.roster[id];G.party=[id];A.V.sheetTab='skills';A.V.sheetSkF='all';A.V.modal={type:'char',char:id};A.render();
   const u=window.__M12.unit(c),by={};T('classSkills')(t).forEach(s=>by[s.n]=s);
   document.querySelectorAll('#modal .row').forEach(r=>{const b=r.querySelector(':scope>div>b'),s=b&&by[b.textContent.trim()];if(!s)return;out.rows++;
    const tg=r.querySelector('.m12tags');if(!tg){out.miss.push(t.cls+'/'+s.id+' no strip');return;}
    const sc=tg.querySelector('.m12t.sc'),kd=tg.querySelector('.m12t.kind');const p=[];
    if(!sc)p.push('scope');if((s.k==='phys'||s.k==='mag'||s.k==='heal'||s.k==='revive')&&!kd)p.push('kind');
    if(s.k==='phys'&&kd){const d=T('deliveryOf')(c,s);const want={piercing:'Pierce'}[d]||d[0].toUpperCase()+d.slice(1);if(kd.textContent.trim()!==want||!kd.querySelector('img.dli.'+d))out.kindWrong.push(t.cls+'/'+s.id+' '+kd.textContent.trim()+' vs '+d);}
    if(s.k==='mag'&&kd&&!kd.querySelector('img.ico:not(.dli)'))p.push('element');
    if(s.role&&T('skEls')(s).length&&!tg.querySelector('em.role'))p.push('role');
    if(s.combo&&T('skHitsFoe')(s)&&!tg.querySelector('em.role.primer')&&!tg.querySelector('em.role.det'))p.push('combo tags');
    if(/\brole\b/i.test(r.querySelector('small')?r.querySelector('small').textContent:''))p.push('role text');
    if(p.length)out.miss.push(t.cls+'/'+s.id+' '+p.join(','));});
   // the battle list
   try{T('startBattle')({stage:0,kind:'field'});}catch(e){out.bmiss.push('startBattle '+e.message);return;}
   const B=T('B'),a=B.front[0];B.cur=a;B.mode='cmd';B.menu='skills';a.mp=a.S.mmp;const d=document.createElement('div');d.innerHTML=T('cmdHtml')();
   d.querySelectorAll('button[data-act=sk]').forEach(b=>{const s=T('known')(a).find(x=>x.id==b.dataset.arg);out.battle++;const p=[];
    if(!b.querySelector('em.tk,em.m12t.sc'))p.push('scope');if((s.k==='phys'||s.k==='mag')&&!b.querySelector('img.dli,.m12t.kind'))p.push('kind');
    if(s.role&&T('skEls')(s).length&&!b.querySelector('em.role'))p.push('role');if(s.combo&&T('skHitsFoe')(s)&&!b.querySelector('em.role'))p.push('combo tags');
    if(/\brole\b/i.test(b.querySelector('small')?b.querySelector('small').textContent:''))p.push('role text');
    if(p.length)out.bmiss.push(t.cls+'/'+s.id+' '+p.join(','));});
   T('B')&&(()=>{try{G.roster={};}catch(e){}})();T('ACT').xClose&&0;});
  return out;});
 console.log('  sheet rows checked',r.rows,'battle rows checked',r.battle);
 chk('every hero sheet skill row has the strip with a scope, and a kind (heal, magic with its element symbols, physical for the weapon in hand), and no role text ('+r.rows+' rows)',r.miss.length===0||r.miss.slice(0,8).join(' | '));
 chk('the sheet kind is the kind dmg11 resolves for the weapon in hand, with its symbol',r.kindWrong.length===0||r.kindWrong.slice(0,6).join(' | '));
 chk('every battle skill row has scope, kind and Primer / Detonator tags ('+r.battle+' rows)',r.bmiss.length===0||r.bmiss.slice(0,8).join(' | '));
 chk('no skill description, in any list, names a role',r.role.length===0||r.role.slice(0,6).join(' | '));
 // a weapon changes the sheet kind: a mace blunt, a bow ranged for a warrior-type skill that follows the weapon
 await ev(eval(START),['mira','lumen','oren']);await wait(150);
 const w=await ev(()=>{const A=__A,T=A.TW.get,G=T('G');const c=G.roster.oren,s=T('classSkills')(T('TPL').oren).find(x=>x.k==='phys'&&!x.dl&&!(T('DL_FORCE')[T('TPL').oren.cls]||{})[x.id]);if(!s)return {none:1};
   const res={};['mace','blade','lance'].forEach(fam=>{const f=window.__M12.unit({id:'oren',eq:null,S:{wp:fam}});f.S.wp=fam;res[fam]=T('deliveryOf')(f,s);});return {s:s.id,res,html:window.__M12.tags(window.__M12.unit(c),T('TPL').oren.cls,s)};});
 chk('the same skill resolves to different kinds for different weapons (dmg11), and the strip names one',w.none||(w.html.includes('m12t kind')&&Object.keys(w.res).length===3)||JSON.stringify(w));
 // codex, starter preview and the learned notice
 const pv=await ev(()=>{const A=__A,T=A.TW.get;const out={};
  const rows=h=>{const d=document.createElement('div');d.innerHTML=h;const R=[...d.querySelectorAll('.row')].filter(r=>r.querySelector(':scope>div>b')&&r.querySelector('small'));return {n:R.length,strips:R.filter(r=>r.querySelector('.m12tags .m12t.sc')).length};};
  try{out.codex=rows(T('vModal')({type:'codexEntry',id:'mira'}));}catch(e){out.codex='ERR '+e.message;}
  try{out.starter=rows(T('vModal')({type:'starterSheet',id:'mira'}));}catch(e){out.starter='ERR '+e.message;}
  try{const s=T('classSkills')(T('TPL').mira)[1];out.learn=T('learnLine')({hero:'mira',name:'Mira',sk:s});}catch(e){out.learn='ERR '+e.message;}
  return out;});
 chk('the codex entry rows carry the strip',pv.codex&&pv.codex.n>3&&pv.codex.strips>=pv.codex.n-2||JSON.stringify(pv.codex));
 chk('the starter preview rows carry the strip',pv.starter&&pv.starter.n>2&&pv.starter.strips>=pv.starter.n-2||JSON.stringify(pv.starter));
 chk('the "learned" notice names the scope',typeof pv.learn==='string'&&/m12t sc/.test(pv.learn)||String(pv.learn).slice(0,200));
 if(SH){require('fs').mkdirSync(SH,{recursive:true});
  await ev(()=>{const A=__A;A.G.roster.mira.lv=20;A.V.sheetTab='skills';A.V.modal={type:'char',char:'mira'};A.render();});await wait(300);await page.screenshot({path:SH+'/v172a_sheet_skills.png'});}
 await H.browser.close();}

// ---------- 3. the symbols ----------
{const H=await open({w:430,h:700,pre:PRE});const {ev,wait,page}=H;
 await ev(eval(START),['mira','lumen','oren']);await wait(150);
 const s=await ev(()=>{const T=__A.TW.get,o={};['slash','piercing','blunt','ranged','magic','heal'].forEach(d=>{const c=T('dlShapeCv')(d);o[d]=c.width;});
  const px=d=>{const c=T('dlShapeCv')(d),x=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0,l=0;for(let i=3;i<x.length;i+=4)if(x[i]>40){n++;if(x[i-3]+x[i-2]+x[i-1]>500)l++;}return {n:n/(c.width*c.height),l};};
  return {w:o,sl:px('slash'),pi:px('piercing'),ico:T('dlIco')('piercing')+T('dlIco')('slash'),same:T('dlShapeCv')('slash')===T('dlShapeCv')('slash')};});
 chk('Slash and Pierce are drawn at 3x (33px) and the other kinds stay 11px',s.w.slash===33&&s.w.piercing===33&&s.w.blunt===11&&s.w.ranged===11&&s.w.magic===11||JSON.stringify(s.w));
 chk('both symbols draw a shape (neither empty nor full) and are cached',s.sl.n>.12&&s.sl.n<.7&&s.pi.n>.12&&s.pi.n<.7&&s.same||JSON.stringify(s));
 chk('dlIco still gives the <img> with the name',/dli piercing/.test(s.ico)&&/alt="Piercing"/.test(s.ico)&&/dli slash/.test(s.ico));
 await H.browser.close();}

// ---------- 4. battle menu memory per hero: removed after 0.21.0 (battle16.js): every turn opens on the main actions, at the top ----------
{const H=await open({w:390,h:520,mobile:true,pre:PRE});const {ev,wait,page,until}=H;
 await ev(eval(START),['mira','lumen','oren']);await wait(150);
 await ev(()=>{const A=__A,G=A.G;['mira','lumen','oren'].forEach(i=>{G.roster[i].lv=30;});A.TW.get('startBattle')({stage:0,kind:'field'});});
 await until(()=>{const B=__A.TW.get('B');return B&&B.mode==='cmd'&&B.cur&&!B.auto;},0,{timeout:25000});
 const q=await ev(()=>{const A=__A,T=A.TW.get,B=T('B'),ACT=T('ACT'),o={};const fr=B.front,h1=fr[0],h2=fr[1];
  B.auto=false;const go=(a,menu)=>{B.cur=a;B.pturns=(B.pturns||0)+1;B.mode='cmd';B.pend=null;B.swapAsk=null;B.menu=menu||'root';A.render();};
  go(h1);o.fresh=B.menu;
  ACT.cmd('skills');o.h1open=B.menu;
  const ks=T('known')(h1),pick=ks[2];B.pend={sk:pick};B.tgFrom='skills';B.menu='target';A.render();      // h1 picks the third skill (waiting for a target)
  go(h2);o.h2fresh=B.menu;                                   // another hero: root, not h1's Skills
  ACT.cmd('items');o.h2open=B.menu;A.render();
  go(h1);o.h1back=B.menu;o.h1last=(document.querySelector('#bcmd .mi.m12last')||{dataset:{}}).dataset.arg===pick.id;o.pick=pick.id;
  go(h2);o.h2back=B.menu;
  go(h1,'root');ACT.back&&0;o.n1=ks.length;
  return o;});
 chk('a hero with no memory starts at the top menu',q.fresh==='root'&&q.h2fresh==='root'||JSON.stringify(q));
 chk('the first hero\'s Skills place is not shown to the second hero',q.h2fresh==='root');
 chk('coming back to the first hero opens the main actions (no menu memory)',q.h1back==='root'||JSON.stringify(q));
 chk('the second hero\'s turn opens the main actions too',q.h2back==='root'||JSON.stringify(q));
 // scroll per hero: scroll hero 1's list, hero 2's differently, switch back and forth
 const sc=await ev(()=>{const A=__A,T=A.TW.get,B=T('B'),ACT=T('ACT'),h1=B.front[0],h2=B.front[1];
  const go=(a,menu)=>{B.cur=a;B.pturns=(B.pturns||0)+1;B.mode='cmd';B.pend=null;B.swapAsk=null;B.menu=menu||'root';A.render();};
  go(h1);ACT.cmd('skills');return {has:!!(document.querySelector('#bcmd'))};});
 const scrollOf=()=>ev(()=>{const c=document.getElementById('bcmd');for(let e=c;e&&e!==document.body;e=e.parentElement){if(e.scrollHeight>e.clientHeight+2&&/auto|scroll/.test(getComputedStyle(e).overflowY))return {top:e.scrollTop,max:e.scrollHeight-e.clientHeight};}return null;});
 let s1=await scrollOf();
 if(!s1)console.log('(no scrollable command box at this size: scroll memory not checked)');
 else{
  await ev(()=>{const c=document.getElementById('bcmd');for(let e=c;e&&e!==document.body;e=e.parentElement){if(e.scrollHeight>e.clientHeight+2&&/auto|scroll/.test(getComputedStyle(e).overflowY)){e.scrollTop=Math.min(90,e.scrollHeight-e.clientHeight);return;}}});await wait(250);
  const want=(await scrollOf()).top;
  await ev(()=>{const A=__A,T=A.TW.get,B=T('B'),ACT=T('ACT'),h2=B.front[1];B.cur=h2;B.pturns++;B.mode='cmd';B.pend=null;B.menu='root';A.render();ACT.cmd('skills');});await wait(250);
  const other=await scrollOf();
  await ev(()=>{const A=__A,T=A.TW.get,B=T('B'),h1=B.front[0];B.cur=h1;B.pturns++;B.mode='cmd';B.pend=null;B.menu='root';A.render();});await wait(350);
  const back=await scrollOf();
  chk('no scroll memory: the second hero\'s list starts at the top ('+JSON.stringify(other)+'), and the first hero\'s next turn starts at the top too ('+want+' -> '+(back&&back.top)+')',want>20&&other&&other.top<5&&(!back||back.top<5)||JSON.stringify({want,other,back}));}
 // a new fight forgets it
 const nf=await ev(()=>{const A=__A,T=A.TW.get,B=T('B');return Object.keys(window.__M12.M12.mem).length;});
 chk('the per hero notes are still there for the turn in hand ('+nf+' heroes noted)',nf>=2);
 await H.browser.close();}
done({browser:{close:async()=>{}}});
})();
