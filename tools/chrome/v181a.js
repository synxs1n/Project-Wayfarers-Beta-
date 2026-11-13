// menu pass 14 (v3/menus14.js), the owner's five notes after 0.20.0:
// 1) the hero sheet is one page again: no tab bar, every section in order (Overview, Stats, Skills, Gear, Role) under its band, a Show dropdown
//    (All sections by default, or one section), the Prev / Next / Equip header and the skill filter chips inside Skills stay (v157a has the details)
// 2) tier tags are crisp: the EPIC tag next to a name (and the card tags) has no text shadow and integer px font size, line height and letter spacing,
//    at dpr 1, 2 and 2.625
// 3) Next goals sits right aligned under the minimap (full, folded chip) at 390x844, 844x390 and 1366x768, at least as wide as the minimap and at most
//    one and a half times, and never over the hero or the area banner
// 4) the tavern mixes: 200 first-town draws, no main element twice when the pool has four or more main elements (never more than two), and a
//    class repeats only when the pool cannot seat four classes under the rules; the same draws with the mix rules off show the old repeats
// 5) learn levels: every hero's 12 skill kit starts at level 1 (two at most), no gap over 6 levels, never three within 3 levels, the last under the cap,
//    the old order kept; an old save keeps what the old levels gave (c.keep) and a new journey is marked (G.m14lv, 2 since 0.20.6: v185a has the level 45 schedule)
// SHOTDIR=dir saves screenshots. Usage: PWHTML=../../out/aurelis3.html [SHOTDIR=/tmp/x] node v181a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'medium',hints:false,tips:false}}));`;
const START=()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();};
const SH=process.env.SHOTDIR;
(async()=>{let last=null;
// ---------- 1 and 2: the sheet and the tag, three pixel ratios ----------
for(const [w,h,mob,dpr] of [[390,844,true,2.625],[390,844,true,2],[1366,768,false,1]]){
 const H=await open({w,h,mobile:mob,dpr,pre:PRE});const {ev,wait,page}=H;const tag=`${w}x${h}@${dpr}: `;
 await ev(START);
 await ev(()=>{const A=__A,G=A.G;A.recruit('sylva',true);G.roster.sylva.pts=2;A.refresh(G.roster.sylva);delete A.V.sheetTab;A.V.modal={type:'guild',char:'sylva',list:G.party.concat('sylva')};A.render();});await wait(300);
 const s=await ev(()=>{const m=document.querySelector('#modal');const sel=m.querySelector('.sh14-bar select[data-chg=sheetSec]');
  return {tabs:m.querySelectorAll('.sh11-tabs').length,sel:sel&&sel.value,on:[...m.querySelectorAll('.sh11-pane.on')].map(e=>e.dataset.pane),
   nav:['charNav','eqOpen'].every(a=>m.querySelector(`[data-act=${a}]`)),chips:!!m.querySelector('.sh11-pane[data-pane=skills] .sh11-skf'),
   order:[...m.querySelectorAll('.sh11-body>section')].map(e=>e.dataset.pane).join()};});
 chk(tag+'one page: no tabs, Show dropdown on All, every section on in order, header buttons and skill chips kept',s.tabs===0&&s.sel==='all'&&s.on.join()==='overview,stats,skills,gear,role'&&s.order===s.on.join()&&s.nav&&s.chips||JSON.stringify(s));
 await page.selectOption('#modal select[data-chg=sheetSec]','gear');await wait(200);
 const g=await ev(()=>({on:[...document.querySelectorAll('#modal .sh11-pane.on')].map(e=>e.dataset.pane),t:__A.V.sheetTab,sel:document.querySelector('#modal select[data-chg=sheetSec]').value}));
 chk(tag+'the dropdown filters to one section and remembers it',g.on.join()==='gear'&&g.t==='gear'&&g.sel==='gear'||JSON.stringify(g));
 await ev(()=>{__A.ACT.sheetSec('sh:all');});await wait(200);
 const t=await ev(()=>{const e=document.querySelector('#modal h2.cname .epictag'),c=getComputedStyle(e);const i=v=>Math.abs(parseFloat(v)-Math.round(parseFloat(v)))<.01;
  const d=document.createElement('div');d.innerHTML='<div class="card hero epic"><span class="epictag">EPIC</span></div><button class="mini leg"><span class="legtag">LEGENDARY</span></button>';document.body.appendChild(d);
  const cs=[...d.querySelectorAll('span')].map(x=>{const k=getComputedStyle(x);return {ts:k.textShadow,fs:k.fontSize,lh:k.lineHeight,ls:k.letterSpacing};});d.remove();
  return {ts:c.textShadow,fs:c.fontSize,lh:c.lineHeight,ls:c.letterSpacing,ints:i(c.fontSize)&&i(c.lineHeight)&&i(c.letterSpacing),cs,cint:cs.every(o=>o.ts==='none'&&i(o.fs)&&i(o.lh)&&i(o.ls))};});
 chk(tag+'EPIC by the name: no text shadow, integer px size, line height and spacing ('+t.fs+'/'+t.lh+', '+t.ls+')',t.ts==='none'&&t.ints||JSON.stringify(t));
 chk(tag+'card EPIC and LEGENDARY tags: the same',t.cint||JSON.stringify(t.cs));
 if(SH){require('fs').mkdirSync(SH,{recursive:true});await (await page.$('#modal .sh11-id')).screenshot({path:`${SH}/v181a_tag_${w}x${h}@${dpr}.png`});await page.screenshot({path:`${SH}/v181a_sheet_${w}x${h}@${dpr}.png`});}
 await H.browser.close();}
// ---------- 3: Next goals under the minimap ----------
for(const [w,h,mob] of [[390,844,true],[844,390,true],[1366,768,false]]){
 const H=await open({w,h,mobile:mob,pre:PRE});const {ev,wait,page}=H;const tag=`${w}x${h}: `;
 await ev(START);await wait(400);
 const ban=await ev(()=>{const M=__M14;M.glRender();const e=document.getElementById('glp'),b=document.querySelector('#wloc.on');if(!b)return {noBanner:1};
  const x=b.getBoundingClientRect(),hid=e.style.display==='none';if(hid)return {hid};const p=e.getBoundingClientRect();return {hid,over:p.left<x.right&&p.right>x.left&&p.top<x.bottom&&p.bottom>x.top};});
 chk(tag+'while the area banner shows, the panel is not over it',ban.noBanner||ban.hid||!ban.over||JSON.stringify(ban));
 await wait(2900);
 const meas=()=>ev(()=>{const M=__M14;M.glRender();const e=document.getElementById('glp'),mm=document.getElementById('mmap').getBoundingClientRect();if(e.style.display==='none')return {hidden:1};
  const p=e.getBoundingClientRect(),hb=M.glHero();return {mode:e.className,dx:Math.round(p.right-mm.right),dy:Math.round(p.top-mm.bottom),w:Math.round(p.width),mw:Math.round(mm.width),
   hero:!!hb&&p.left<hb.r&&p.right>hb.l&&p.top<hb.b&&p.bottom>hb.t};});
 const a=await meas();
 chk(tag+`the full panel is right aligned under the minimap, as wide as it to one and a half times (${a.w} vs ${a.mw}), not over the hero`,!a.hidden&&/full/.test(a.mode)&&Math.abs(a.dx)<=1&&Math.abs(a.dy-6)<=1&&a.w>=a.mw-1&&a.w<=a.mw*1.5+1&&!a.hero||JSON.stringify(a));
 if(SH)await page.screenshot({path:`${SH}/v181a_goals_${w}x${h}.png`});
 await ev(()=>{__A.ACT.goalsT();});await wait(100);const c=await meas();
 chk(tag+'folded, the chip is under the minimap too, as wide as it',!c.hidden&&/chip/.test(c.mode)&&Math.abs(c.dx)<=1&&Math.abs(c.dy-6)<=1&&Math.abs(c.w-c.mw)<=1||JSON.stringify(c));
 if(SH)await page.screenshot({path:`${SH}/v181a_goals_chip_${w}x${h}.png`});
 await ev(()=>{__A.ACT.goalsT();});await wait(100);
 await H.browser.close();}
// ---------- 4 and 5: the tavern and the learn levels ----------
const H=await open({w:390,h:844,pre:PRE});const {ev}=H;last=H;
const tv=await ev(()=>{const A=__A,M=__M14,ST=['brann','mira','sable','tess','oren','lumen','gilda','halden','pomona','taro','zia'],out={};
 const feas=(P,T)=>{const n=P.length;for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)for(let d=b+1;d<n;d++)for(let f=d+1;f<n;f++){const q=[P[a],P[b],P[d],P[f]].map(i=>T[i]);
   if(new Set(q.map(x=>x.el[0])).size===4&&new Set(q.map(x=>x.cls)).size===4){const r={};q.forEach(x=>{const z=M.CLASS_ROLE[x.cls]||'damage';r[z]=(r[z]||0)+1;});if(Math.max(...Object.values(r))<=2)return true;}}return false;};
 for(const off of [true,false]){M.M14.mix.off=off;const s={dupEl:0,dupElAvoidable:0,el3:0,dupCls:0,dupClsAvoidable:0};
  for(let k=0;k<200;k++){let r=(k*2654435761>>>0)||1;const rnd=()=>{r=(r*1664525+1013904223)>>>0;return r/4294967296;};
   A.ACT.new();ST.slice().sort(()=>rnd()-.5).slice(0,3).forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.V.modal=null;
   const G=M.G,T=M.TPL;G.run.seed=1000+k;G.sub=null;M.ensureSub(G);G.tv=null;const P=M.tvPool(),L=M.tvShuffle().sl.filter(Boolean);
   const e={},c={};L.forEach(id=>{e[T[id].el[0]]=(e[T[id].el[0]]||0)+1;c[T[id].cls]=(c[T[id].cls]||0)+1;});const me=Math.max(...Object.values(e)),mc=Math.max(...Object.values(c));
   if(me>1){s.dupEl++;if(new Set(P.map(i=>T[i].el[0])).size>=4)s.dupElAvoidable++;}if(me>2)s.el3++;
   if(mc>1){s.dupCls++;if(feas(P,T))s.dupClsAvoidable++;}}
  out[off?'off':'on']=s;}
 M.M14.mix.off=false;return out;});
console.log('tavern, 200 first-town draws, mix rules off (the old draw) / on:',JSON.stringify(tv));
chk('tavern: with the mix rules off the old draw repeats elements (the sim sees the bug)',tv.off.dupEl>40||JSON.stringify(tv.off));
chk(`tavern: no main element twice when the pool has four or more (${tv.on.dupEl} repeats, all from 3-element pools), never three`,tv.on.dupElAvoidable===0&&tv.on.el3===0||JSON.stringify(tv.on));
chk(`tavern: a class repeats only when the pool cannot seat four classes (${tv.on.dupCls} of 200)`,tv.on.dupClsAvoidable===0||JSON.stringify(tv.on));
const kt=await ev(()=>{const S=__S12,T=S.TPL,M=__M14,bad=[];let n=0,maxGap=0;Object.keys(T).forEach(id=>{const t=T[id];if(t.mon||!S.CLS[t.cls])return;n++;const k=S.kit(t).slice().sort((a,b)=>a.lv-b.lv),L=k.map(s=>s.lv);
  const gap=Math.max(...L.slice(1).map((x,i)=>x-L[i])),win=Math.max(...L.map(x=>L.filter(y=>y>=x&&y<=x+2).length)),ord=k.every((s,i)=>!i||s.lv12>=k[i-1].lv12);maxGap=Math.max(maxGap,gap);
  if(L[0]!==1||L.filter(x=>x===1).length>2||gap>6||win>2||L[L.length-1]>=50||!ord)bad.push(id+':'+L.join(','));});
 // an old save: the first hero (in TPL order) with a skill the new levels delay, at the old level of that skill: it stays known (c.keep), and so
 // does everything else the old levels gave at that level
 let dl=null;for(const id of Object.keys(T)){const t=T[id];if(t.mon||!S.CLS[t.cls]||t.src==='L'||t.src==='x')continue;const s=S.kit(t).find(x=>x.lv12!=null&&x.lv>x.lv12);if(s){dl={id,sk:s.id,n:s.n,old:s.lv12,lv:s.lv};break;}}
 const A=__A;A.ACT.new();['brann','mira','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();const G=M.G;let kept=0,kn=0,old=0,has=false,g={};
 if(dl){const h=A.TW.get('newChar')(dl.id,dl.old);h.lv=dl.old;delete h.keep;g={roster:{[dl.id]:h}};
  kept=M.keep(g);const kit=S.kit(T[dl.id]);kn=kit.filter(s=>s.lv<=dl.old||(h.keep||[]).includes(s.id)).length;old=kit.filter(s=>s.lv12<=dl.old).length;has=(h.keep||[]).includes(dl.sk);}
 return {n,bad,maxGap,dl,kept,has,kn,old,flag:g.m14lv,newFlag:G.m14lv};});
console.log('kits:',JSON.stringify(kt));
chk(`learn levels: ${kt.n} kits start at 1, no gap over 6 (largest ${kt.maxGap}), never three within 3 levels, last under the cap, order kept`,kt.bad.length===0||kt.bad.slice(0,6).join(' | '));
chk('an old save keeps every skill the old levels gave'+(kt.dl?` (${kt.dl.id} at level ${kt.dl.old} keeps ${kt.dl.n}, now level ${kt.dl.lv})`:'')+'; new journeys are marked 2 (v185a: the levels of this pass, G.m14lv 1 saves are migrated again)',!!kt.dl&&kt.has&&kt.kept>0&&kt.kn===kt.old&&kt.flag===2&&kt.newFlag===2||JSON.stringify(kt));
await done(last);})();
