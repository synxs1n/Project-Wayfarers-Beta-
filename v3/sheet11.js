// ===== sheet11.js (v0.17.x): the hero sheet as a tabbed sheet =====
// The hero sheet (mChar, shown in the 'guild' modal with a char and in the 'char' modal) had grown into one long column. This module wraps mChar
// LAST (after roles9, learn, comp, p3shop, p4party, v063prog added their blocks) and re-slices the finished html: it parses the string, moves the
// existing nodes (so every data-act, every xform-added block and every inner html stays as the other modules made it) into a compact header,
// a tab bar and five panes, and returns the new string. Nothing is regenerated except the header bars, tab bar and skill filter.
//   header : portrait (front bust), name, level + class + role, element icons, HP / MP / XP bars, Equip button
//   Overview: nature, bio, class card, party note | battles together, bonds
//   Stats   : core stat buttons, mastery | attributes with point spending (Auto-spend, Respec)
//   Skills  : signature, field skills, skills with a filter (known, locked, purpose), limit break
//   Gear    : the gear rows (tap a row in the Guild Hall to change it), the pet
//   Role    : the role picker row (roles9.js)
// A heading this module does not know lands at the end of Overview, so a block another module adds is never dropped.
// V.sheetTab remembers the last tab, V.sheetSkF the skill filter. No save fields.
const SH11_TABS=[['overview','Overview'],['stats','Stats'],['skills','Skills'],['gear','Gear'],['role','Role']];
const SH11_H4={'role':'role','attributes':'stats','equipment':'gear','pet':'gear','charms':'gear','limit break':'skills','skills':'skills','bonds':'overview'};
{const st=document.createElement('style');st.textContent=`
.panel.sh11{display:flex;flex-direction:column;overflow:hidden;padding-bottom:12px}
.sh11>.cnav{flex:none;margin-bottom:4px}
.sh11>.legstrip{flex:none}
.sh11-head{flex:none;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:2px 10px;align-items:center;padding-bottom:6px}
.sh11-head .pbig.sh11-port{width:62px;height:62px;grid-row:1}
.sh11-head .pbig.sh11-port img{width:100%;height:100%;object-fit:cover;object-position:50% 20%}
.sh11-id{min-width:0}
.sh11-id h2.cname{margin:0;font-size:1.15rem;line-height:1.15;overflow-wrap:anywhere}
.sh11-id small{display:block}
.sh11-id .els{margin-top:2px}.sh11-id .els .el{font-size:.7rem}
.sh11-act{grid-column:3;grid-row:1;align-self:start}
.sh11-bars{grid-column:1/-1;grid-row:2;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.sh11-bars>div{min-width:0}.sh11-bars small{display:block;font-size:.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sh11-bars .bar{margin-top:1px;height:7px}
.sh11-tabs{flex:none;flex-wrap:nowrap;gap:4px;margin:0 0 6px}
.sh11-tabs .chip{flex:1 1 0;min-width:0;padding:7px 2px;text-align:center;font-size:.8rem}
.sh11-tabs .chip .cnt{font:700 11px/1 var(--fb);margin-left:3px;opacity:.9}
.sh11-body{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:0 2px 22px;overscroll-behavior:contain}
.sh11-body>*,.sh11-col>*{min-width:0}
.sh11-pane{display:none}.sh11-pane.on{display:block}
.sh11-col h4:first-child{margin-top:4px}
.sh11-col{display:block;min-width:0}
.sh11-empty{margin:8px 0}.sh11-col>p.note{text-align:left}
.sh11-skf{margin:4px 0 8px;gap:4px}.sh11-skf .chip{font-size:.74rem;padding:4px 8px}
.sh11 .row.shx{display:none}
.sh11 .eqsheet .eqsrow{min-width:0}.sh11 .attrs{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.sh11 .stats.tapstats{grid-template-columns:repeat(auto-fill,minmax(96px,1fr))}
.sh11-body .btnrow:last-child{margin-top:12px}
@media (min-width:760px){
 .panel.sh11.box.wide{max-width:min(980px,100%)}
 .sh11-pane.on.cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 22px;align-items:start}
 .sh11-head{grid-template-columns:auto minmax(0,1fr) minmax(220px,1.1fr) auto}
 .sh11-head .pbig.sh11-port{grid-row:1}
 .sh11-bars{grid-column:3;grid-row:1;grid-template-columns:1fr;gap:3px}
 .sh11-act{grid-column:4}
}
@media (max-height:640px){.sh11-head .pbig.sh11-port{width:48px;height:48px}.sh11>.cnav{margin-bottom:0}}
`;document.head.appendChild(st);}
function sh11Tab(){const k=V&&V.sheetTab;return SH11_TABS.some(t=>t[0]===k)?k:'overview';}
function sh11Build(h,id,edit){
  if(typeof h!=='string'||typeof document==='undefined'||h.indexOf('charsheet')<0)return h;
  const c=G&&G.roster[id];if(!c)return h;
  const tp=document.createElement('template');tp.innerHTML=h;
  const wrap=tp.content.firstElementChild,panel=wrap&&wrap.querySelector(':scope>.panel.charsheet');if(!panel)return h;
  const mh=panel.querySelector(':scope>.mh'),grow=mh&&mh.querySelector(':scope>.grow');if(!mh||!grow)return h;
  const ch=[...panel.children],head=ch.indexOf(mh);
  const nav=panel.querySelector(':scope>.cnav'),leg=panel.querySelector(':scope>.legstrip');
  const q=(r,s)=>r.querySelector(':scope>'+s);
  const name=q(grow,'h2.cname'),title=q(grow,'small.ltitle'),lvl=[...grow.children].find(e=>e.tagName==='SMALL'&&!e.className),els=q(grow,'.els');
  const nat=q(grow,'.natb'),bio=q(grow,'p.bio'),bt=q(grow,'p.note.nums'),card=q(grow,'.clscard'),mline=q(grow,'p.mline'),sig=q(grow,'p.sig');
  const xp=q(panel,'.xp'),stats=q(panel,'.stats.tapstats');
  // after the header: group by h4
  const P={overview:[[],[]],stats:[[],[]],skills:[[]],gear:[[]],role:[[]]};let footer=null,cur=null,curTab=null;
  const put=(tab,col,n)=>{if(n)P[tab][col].push(n);};
  ch.slice(head+1).forEach(n=>{
    if(n===xp||n===stats)return;
    if(n.matches('.btnrow')&&n.querySelector('[data-act=charBack],[data-act=menuBack]')){footer=n;return;}
    if(n.tagName==='H4'){const k=n.textContent.replace(/\d+ points? to spend/,'').trim().toLowerCase();curTab=SH11_H4[k]||(/charm|gear/.test(k)?'gear':'overview');cur=k;
      put(curTab,curTab==='overview'?1:curTab==='stats'?1:0,n);return;}
    if(n.matches('p.note')&&/^(In your six|On the roster)/.test(n.textContent)){put('overview',0,n);return;}
    if(n.querySelector&&n.querySelector('[data-act=fsOpen]')){P.skills[0].unshift(n);return;}
    put(curTab||'overview',(curTab||'overview')==='overview'||curTab==='stats'?1:0,n);});
  // Skills before Limit Break inside the Skills pane
  const sk=P.skills[0],li=sk.findIndex(n=>n.tagName==='H4'&&/^limit/i.test(n.textContent));
  if(li>=0){const si=sk.findIndex(n=>n.tagName==='H4'&&/^skills/i.test(n.textContent));
    if(si>li){const lim=sk.slice(li,si),rest=sk.slice(si);const pre=sk.slice(0,li);P.skills[0]=pre.concat(rest,lim);}}
  const mk=(h4,txt)=>{const e=document.createElement(h4?'h4':'div');if(txt)e.textContent=txt;return e;};
  // Overview
  P.overview[0]=[nat,bio,card].filter(Boolean).concat(P.overview[0]);
  if(bt)P.overview[1].unshift(bt);
  // Stats
  if(stats){P.stats[0].push(mk(1,'Core stats'),stats);}
  if(mline){P.stats[0].push(mk(1,'Mastery'),mline);}
  // Skills: signature first
  if(sig)P.skills[0].unshift(sig);
  // skill filter over the rows of the Skills section
  const skH=P.skills[0].find(n=>n.tagName==='H4'&&/^skills/i.test(n.textContent)),rowsEl=skH&&P.skills[0].find(n=>n.matches&&n.matches('.rows')&&n.compareDocumentPosition(skH)&2);
  if(rowsEl){const rows=[...rowsEl.children].filter(r=>r.classList.contains('row')),pur={};
    rows.forEach(r=>{const e=r.querySelector('em.pur');r._p=e?[...e.classList].filter(x=>x!=='pur')[0]:'';if(r._p&&!pur[r._p])pur[r._p]=e.textContent.trim();});
    const nK=rows.filter(r=>!r.classList.contains('lock')).length;
    const F=[['all','All '+rows.length],['known','Known '+nK],['lock','Locked '+(rows.length-nK)]].concat(Object.keys(pur).map(k=>['p:'+k,pur[k]]));
    let f=V.sheetSkF||'all';if(!F.some(x=>x[0]===f))f='all';
    rows.forEach(r=>{const lock=r.classList.contains('lock'),ok=f==='all'||(f==='known'&&!lock)||(f==='lock'&&lock)||(f.slice(0,2)==='p:'&&r._p===f.slice(2));if(!ok)r.classList.add('shx');});
    const fb=document.createElement('div');fb.className='chips sh11-skf';fb.setAttribute('role','group');fb.setAttribute('aria-label','Filter skills');
    fb.innerHTML=F.map(x=>`<button class="chip sm ${x[0]===f?'on':''}" data-act="sheetSkF" data-arg="${x[0]}">${esc(x[1])}</button>`).join('');
    P.skills[0].splice(P.skills[0].indexOf(skH)+1,0,fb);}
  // Role
  if(!P.role[0].length){const p=mk(0);p.className='note sh11-empty';p.textContent='No role to choose here.';P.role[0].push(p);}
  // header
  const S=c.S,t=TPL[id];let role='';try{role=ROLES.names[heroMain(c)]||'';}catch(e){}
  const hd=document.createElement('div');hd.className='sh11-head';
  const port=document.createElement('div');port.className='pbig sh11-port';const img=document.createElement('img');img.alt='';try{img.src=(typeof portraitURL==='function'?portraitURL(id):heroURL(id));}catch(e){img.src=heroURL(id);}port.appendChild(img);
  const idb=document.createElement('div');idb.className='sh11-id';
  if(name)idb.appendChild(name);if(title)idb.appendChild(title);
  const lv=document.createElement('small');lv.textContent=(lvl?lvl.textContent:'')+(role?' · '+role:'');idb.appendChild(lv);
  if(els)idb.appendChild(els);
  hd.appendChild(port);hd.appendChild(idb);
  const bars=document.createElement('div');bars.className='sh11-bars';
  const xpTxt=c.lv>=LV_CAP?'XP: level cap':`XP ${fmt(c.xp)} / ${fmt(need(c.lv))}`;
  bars.innerHTML=`<div><small class="nums">HP ${c.hp}/${S.mhp}</small>${bar(c.hp,S.mhp,'var(--hp)')}</div><div><small class="nums">MP ${c.mp}/${S.mmp}</small>${bar(c.mp,S.mmp,'var(--mp)')}</div><div><small class="nums">${xpTxt}</small>${c.lv>=LV_CAP?bar(1,1,'var(--gold)'):bar(c.xp,need(c.lv),'var(--gold)')}</div>`;
  hd.appendChild(bars);
  if(edit){const a=document.createElement('div');a.className='sh11-act';a.innerHTML=`<button class="btn sm" data-act="eqOpen" data-arg="${id}" aria-label="Equip ${esc(c.name)}" title="Open the Equipment page at ${esc(c.name)}">Equip</button>`;hd.appendChild(a);}
  // tab bar + panes
  const cur0=sh11Tab(),tabs=document.createElement('div');tabs.className='chips sh11-tabs';tabs.setAttribute('role','tablist');
  tabs.innerHTML=SH11_TABS.map(([k,l])=>`<button role="tab" aria-selected="${k===cur0}" class="chip ${k===cur0?'on':''}" data-act="sheetTab" data-arg="${k}">${l}${k==='stats'&&c.pts>0?`<span class="cnt" title="${c.pts} point${c.pts>1?'s':''} to spend">${c.pts}</span>`:''}</button>`).join('');
  const body=document.createElement('div');body.className='sh11-body';
  SH11_TABS.forEach(([k])=>{const sec=document.createElement('section');sec.className='sh11-pane'+(k===cur0?' on':'')+(P[k].length>1?' cols':'');sec.dataset.pane=k;sec.setAttribute('role','tabpanel');
    P[k].forEach(col=>{const d=document.createElement('div');d.className='sh11-col';col.forEach(n=>d.appendChild(n));sec.appendChild(d);});body.appendChild(sec);});
  if(footer)body.appendChild(footer);
  // rebuild the panel
  const keep=[];if(nav)keep.push(nav);if(leg)keep.push(leg);
  const mnav=panel.querySelector(':scope>.mnav');
  panel.textContent='';if(mnav)panel.appendChild(mnav);keep.forEach(n=>panel.appendChild(n));panel.appendChild(hd);panel.appendChild(tabs);panel.appendChild(body);
  panel.classList.add('sh11');
  return tp.innerHTML;}
HOOK.xform('mChar','sheet11','hero sheet tabs',function(h,id,edit){try{return sh11Build(h,id,edit);}catch(e){return h;}});
Object.assign(ACT,{
  sheetTab(k){if(!SH11_TABS.some(t=>t[0]===k))return;V.sheetTab=k;render();const b=document.querySelector('#modal .sh11-body');if(b)b.scrollTop=0;},
  sheetSkF(k){V.sheetSkF=String(k||'all');render();}});
{const cn0=ACT.charNav;ACT.charNav=function(){const r=cn0.apply(this,arguments);try{const b=document.querySelector('#modal .sh11-body');if(b)b.scrollTop=0;}catch(e){}return r;};}
