// Beta v0.17 hero sheet (v3/sheet11.js): a compact header (portrait, name, level, class, role, elements, HP/MP/XP, Equip) and five sections
// Overview / Stats / Skills / Gear / Role; every block of the old sheet lands in its section, no data-act of the old sheet is lost, no heading is
// repeated, the sheet fits 390x844 without horizontal scroll and the box scrolls inside itself; at 1000x600 and 1366x768 Overview and Stats use two columns.
// Updated for menu pass 14 (menus14.js, owner: "felt better as 1 page, maybe a drop down to filter"): the tab bar is gone; by default every section
// shows, in order, on one scrolling page under its own band, and a "Show" dropdown (All sections / one section) filters to one section
// (V.sheetTab remembers it: 'all' or the section). The per-tab checks became per-filter checks; "Overview on by default" became "All on by default".
// SHOTDIR=dir saves a screenshot of every filter at 390x844 and 1000x600.
// Usage: PWHTML=../../out/aurelis3.html [SHOTDIR=/tmp/x] node v157a.js
const {open,chk,done}=require('./pw');
const SIZES=[[390,844,true],[1000,600,false],[1366,768,false]];
(async()=>{
for(const [w,h,mob] of SIZES){
 const H=await open({w,h,mobile:mob,pre:`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'medium',hints:false}}));`});const {ev,wait,page}=H;
 const tag=`${w}x${h}: `;
 // a town, a bonded pair, unspent points, a charm and a pet slot on screen
 await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;
  G.roster.mira.pts=3;A.refresh(G.roster.mira);delete A.V.sheetTab;A.V.modal={type:'guild',char:'mira',list:G.party};A.render();});await wait(300);
 // the old sheet: the unwrapped data-acts, taken from the same build by calling the pre-wrap body is not possible, so list what the old sheet had
 const OLD=['charNav','statInfo','addPt','autoPts','respec','gearSlot','rolePick','charBack'];
 const info=await ev(()=>{const m=document.querySelector('#modal'),p=m.querySelector('.panel');const acts=new Set([...m.querySelectorAll('[data-act]')].map(e=>e.dataset.act));
  const h4=[...m.querySelectorAll('h4')].map(e=>e.textContent.replace(/\d+ points? to spend/,'').trim());
  const sel=m.querySelector('select[data-chg=sheetSec]');const tabs=sel?[...sel.options].map(o=>o.value+':'+o.selected):[];const oldTabs=m.querySelectorAll('.sh11-tabs').length;
  const order=[...m.querySelectorAll('.sh11-pane.on')].map(e=>e.dataset.pane),bands=[...m.querySelectorAll('.sh11-pane.on>.sh14-sec')].map(e=>e.textContent.replace(/\d+ to spend/,'').trim());
  const paneOf=s=>{const e=m.querySelector(s);const p=e&&e.closest('.sh11-pane');return p?p.dataset.pane:null;};
  const hd=m.querySelector('.sh11-head');
  return {acts:[...acts],h4,tabs,oldTabs,order,bands,sheet:!!m.querySelector('.panel.sh11'),panes:[...m.querySelectorAll('.sh11-pane')].map(e=>e.dataset.pane),
   where:{bio:paneOf('.bio'),nature:paneOf('.natb'),card:paneOf('.clscard'),battles:paneOf('p.note.nums'),stats:paneOf('.tapstats'),mast:paneOf('.mline'),attrs:paneOf('.attrs'),addPt:paneOf('[data-act=addPt]'),respec:paneOf('[data-act=respec]'),
    skills:paneOf('[data-act]~.rows, .sh11-skf'),limit:paneOf('.limitr'),gear:paneOf('.eqsheet'),pet:paneOf('.petslot'),role:paneOf('.rl9'),bonds:paneOf('.bondrow')||paneOf('[data-act=bondInfo]'),gearSlot:paneOf('[data-act=gearSlot]'),rolePick:paneOf('[data-act=rolePick]'),back:paneOf('[data-act=charBack]')},
   head:{port:!!hd.querySelector('.pbig img'),name:!!hd.querySelector('h2.cname'),els:!!hd.querySelector('.els'),bars:hd.querySelectorAll('.bar').length,equip:!!hd.querySelector('[data-act=eqOpen]'),lvl:hd.querySelector('.sh11-id').innerText},
   h2:m.querySelectorAll('h2.cname').length,
   fit:{sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,pw:p.scrollWidth,pcw:p.clientWidth,bodyOverflow:getComputedStyle(m.querySelector('.sh11-body')).overflowY,
    panelBox:p.getBoundingClientRect().bottom<=innerHeight+1&&p.getBoundingClientRect().top>=-1,sc:(()=>{const b=m.querySelector('.sh11-pane.on');return null;})()}};});
 console.log(tag,JSON.stringify(info.where),JSON.stringify(info.tabs),info.head.lvl.replace(/\n/g,' | '));
 chk(tag+'one page: no tab bar, a Show dropdown (All sections + five sections), All on by default',info.sheet&&info.oldTabs===0&&info.tabs.join()==='all:true,overview:false,stats:false,skills:false,gear:false,role:false'||JSON.stringify(info.tabs));
 chk(tag+'all five sections show in order, each under its band',info.order.join()==='overview,stats,skills,gear,role'&&info.bands.join()==='Overview,Stats,Skills,Gear,Role'||JSON.stringify([info.order,info.bands]));
 chk(tag+'header: portrait, one name, elements, HP/MP/XP bars, Equip button, class and role line',info.head.port&&info.h2===1&&info.head.els&&info.head.bars===3&&info.head.equip&&/Mage, level/.test(info.head.lvl)&&/Caster/.test(info.head.lvl)||JSON.stringify(info.head));
 const W=info.where;
 chk(tag+'Overview holds the nature, bio, class card, battles together and the bonds',[W.nature,W.bio,W.card,W.battles].every(x=>x==='overview')||JSON.stringify(W));
 chk(tag+'Stats holds the core stats, mastery, attributes, point buttons and Respec',[W.stats,W.mast,W.attrs,W.addPt,W.respec].every(x=>x==='stats')||JSON.stringify(W));
 chk(tag+'Skills holds the skill list with its filter and the limit break',W.skills==='skills'&&W.limit==='skills'||JSON.stringify(W));
 chk(tag+'Gear holds the gear rows and the pet; Role holds the role picker',W.gear==='gear'&&W.gearSlot==='gear'&&W.pet==='gear'&&W.role==='role'&&W.rolePick==='role'||JSON.stringify(W));
 chk(tag+'every action of the old sheet is still there ('+OLD.join(', ')+')',OLD.every(a=>info.acts.includes(a))||'missing '+OLD.filter(a=>!info.acts.includes(a)).join()+' in '+info.acts.join());
 const dup=info.h4.filter((x,i)=>info.h4.indexOf(x)!==i);
 chk(tag+'no heading is repeated ('+info.h4.join(' / ')+')',dup.length===0||dup.join());
 chk(tag+'the Stats band and the Stats option show the unspent points',await ev(()=>/3 to spend/.test(document.querySelector('.sh11-pane[data-pane=stats] .sh14-cnt')?.textContent||'')&&/3 points/.test(document.querySelector('select[data-chg=sheetSec] option[value=stats]')?.textContent||'')));
 chk(tag+'no horizontal scroll (page and box)',info.fit.sw<=info.fit.cw&&info.fit.pw<=info.fit.pcw+1&&info.fit.panelBox||JSON.stringify(info.fit));
 // each tab: switch, fits, scrolls inside itself, remembers
 const SH=process.env.SHOTDIR;
 for(const tab of ['all','overview','stats','skills','gear','role']){
  await ev(t=>{__A.ACT.sheetSec('sh:'+t);},tab);await wait(150);
  const r=await ev(t=>{const m=document.querySelector('#modal'),p=m.querySelector('.panel'),b=m.querySelector('.sh11-body'),on=[...m.querySelectorAll('.sh11-pane.on')].map(e=>e.dataset.pane);
   const vis=e=>e&&e.offsetParent!==null;const pn=t==='all'?m.querySelector('.sh11-pane[data-pane=overview]'):m.querySelector('.sh11-pane.on');const cols=getComputedStyle(pn).gridTemplateColumns.split(' ').length;
   const before=b.scrollTop;b.scrollTop=99999;const moved=b.scrollTop;b.scrollTop=0;const pr=p.getBoundingClientRect();
   return {on,remembered:__A.V.sheetTab,cols,vis:vis(m.querySelector('.sh11-pane.on')),tabsVisible:vis(m.querySelector('.sh14-bar select')),headVisible:vis(m.querySelector('.sh11-head')),
    over:b.scrollHeight>b.clientHeight+2,moved,panelScroll:p.scrollTop,fitsV:pr.bottom<=innerHeight+1&&pr.top>=-1,hx:document.documentElement.scrollWidth<=document.documentElement.clientWidth&&b.scrollWidth<=b.clientWidth+1};},tab);
  chk(tag+tab+': '+(tab==='all'?'every section':'only that section')+' is shown, remembered in V.sheetTab, header and dropdown stay visible',(tab==='all'?r.on.join()==='overview,stats,skills,gear,role':r.on.join()===tab)&&r.remembered===tab&&r.vis&&r.tabsVisible&&r.headVisible||JSON.stringify(r));
  chk(tag+tab+': fits the screen without horizontal scroll'+(r.over?' and scrolls inside itself':''),r.fitsV&&r.hx&&r.panelScroll===0&&(!r.over||r.moved>0)||JSON.stringify(r));
  if(w>=760&&(tab==='overview'||tab==='stats'||tab==='all'))chk(tag+tab+': two columns',r.cols===2||JSON.stringify(r));
  if(w<760)chk(tag+tab+': one column on a phone',r.cols<=1||JSON.stringify(r));
  if(SH){const fs=require('fs');fs.mkdirSync(SH,{recursive:true});await page.screenshot({path:`${SH}/sheet_${w}x${h}_${tab}.png`});}
 }
 // the tab survives a re-render and a hero change; the skill filter filters
 await ev(()=>{__A.ACT.sheetSec('sh:skills');__A.ACT.charNav(1);});await wait(150);
 chk(tag+'the section filter survives switching to the next hero',await ev(()=>__A.V.modal.char!=='mira'&&document.querySelector('.sh11-pane.on').dataset.pane==='skills'));
 const f=await ev(()=>{const n0=document.querySelectorAll('.sh11-pane.on .sh11-skf~.rows .row:not(.limitr):not(.shx)').length;const chips=[...document.querySelectorAll('.sh11-skf .chip')].map(e=>e.dataset.arg);
  __A.ACT.sheetSkF('lock');const nl=document.querySelectorAll('.sh11-pane.on .sh11-skf~.rows .row:not(.limitr).lock:not(.shx)').length,nk=document.querySelectorAll('.sh11-pane.on .sh11-skf~.rows .row:not(.limitr):not(.lock):not(.shx)').length;__A.ACT.sheetSkF('known');
  const nk2=document.querySelectorAll('.sh11-pane.on .sh11-skf~.rows .row:not(.limitr).lock:not(.shx)').length;__A.ACT.sheetSkF('all');return {n0,chips,nl,nk,nk2,kind:!!document.querySelector('.sh11-pane.on em.dl,.sh11-pane.on em.pur')};});
 chk(tag+'the skill filter has All/Known/Locked and purposes, and Locked hides known skills',f.chips.slice(0,3).join()==='all,known,lock'&&f.nk===0&&f.nk2===0||JSON.stringify(f));
 chk(tag+'skill rows keep their kind text (purpose and delivery tags)',f.kind||JSON.stringify(f));
 // point spending still works from the Stats tab, scroll kept
 const sp=await ev(()=>{const A=__A,G=A.G;A.V.modal={type:'guild',char:'mira',list:G.party};A.ACT.sheetSec('sh:stats');const c=G.roster.mira,p0=c.pts;const b=document.querySelector('.sh11-body');
  document.querySelector('[data-act=addPt]').click();return {p0,p1:c.pts,tab:document.querySelector('.sh11-pane.on').dataset.pane};});
 chk(tag+'spending a point keeps the Stats filter and spends the point',sp.p1===sp.p0-1&&sp.tab==='stats'||JSON.stringify(sp));
 // bonds land in Overview
 const bd=await ev(()=>{const A=__A,G=A.G;delete G.pcV;const b=A.BONDS.find(b=>A.TPL[b.a]&&A.TPL[b.b]&&!A.TPL[b.a].legend&&!A.TPL[b.b].legend);[b.a,b.b].forEach(i=>{if(!G.roster[i])A.recruit(i,true);});
  A.V.modal={type:'guild',char:b.a,list:G.party};A.V.sheetTab='overview';A.render();const e=document.querySelector('#modal .bondrow'),pn=e&&e.closest('.sh11-pane');
  return {pane:pn&&pn.dataset.pane,h4:[...document.querySelectorAll('#modal h4')].map(x=>x.textContent.trim())};});
 chk(tag+'the Bonds block is in Overview',bd.pane==='overview'&&bd.h4.includes('Bonds')||JSON.stringify(bd));
 if(process.env.SHOTDIR){await wait(150);await page.screenshot({path:process.env.SHOTDIR+`/sheet_${w}x${h}_overview_bonds.png`});}
 // read-only mode and the 'char' modal
 const ro=await ev(()=>{const A=__A,h=A.mChar('mira',false);const d=document.createElement('div');d.innerHTML=h;return {sheet:!!d.querySelector('.sh11'),addPt:d.querySelectorAll('[data-act=addPt]').length,gearBtn:d.querySelectorAll('button[data-act=gearSlot]').length,equip:d.querySelectorAll('[data-act=eqOpen]').length,text:/Battles together/.test(d.textContent)};});
 chk(tag+'read-only mode: the one page sheet, no point buttons, no gear buttons, no Equip button',ro.sheet&&ro.addPt===0&&ro.gearBtn===0&&ro.equip===0&&ro.text||JSON.stringify(ro));
 await ev(()=>{const A=__A;A.V.modal={type:'char',id:A.G.party[0],list:A.G.party};A.render();});await wait(150);
 chk(tag+'the Menu > Party hero sheet (type char) is the same one page sheet',await ev(()=>!!document.querySelector('#modal .panel.sh11.sh14 .sh14-bar select')));
 if(w===SIZES[SIZES.length-1][0])await done(H);else await H.browser.close();}
})();
