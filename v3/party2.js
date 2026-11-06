// =================== PARTY TOOLS (Beta v0.3.3) ===================
// Sorting and filters (remembered in META.cfg.lists), XP bars, team loadouts (G.loadouts, up to 8, optional save field),
// Best Party suggestion, and field skills (heals, cures and revives outside battle).
// Buffs are not offered as field skills: every statuses is cleared when a battle starts, so they could never carry over.
const LOADMAX=8;
// ----- sort and filter state: one record per list, remembered -----
const LSORT_H=[['def','Default'],['name','Name'],['lv','Level'],['cls','Class'],['el','Element'],['hp','HP %'],['new','Recent']],LSORT_C=[['def','Default'],['name','Name'],['lv','Level'],['el','Element']];
function LC(n){const o=META.cfg.lists=META.cfg.lists||{};return o[n]=Object.assign({s:'def',el:'all',cl:'all'},o[n]||{});}
function matchT(n,t,el){const f=LC(n);
  if(f.el==='dual'&&(el||t.el).length<2)return false;
  if(f.el!=='all'&&f.el!=='dual'&&!(el||t.el).includes(f.el))return false;
  if(f.cl==='legend')return t.src==='L';
  if(f.cl!=='all'&&t.cls!==f.cl)return false;return true;}
// v0.6.3: a Show filter on hero lists (lists.*.sh): everyone, in the party, not in it, unspent stat points, hurt or KO
function lshow(n,c){const v=LC(n).sh||'all';if(v==='party')return G.party.includes(c.id);if(v==='bench')return !G.party.includes(c.id);
  if(v==='pts')return (c.pts||0)>0;if(v==='hurt')return c.hp<c.S.mhp||Object.keys(c.st||{}).some(k=>STS[k]&&STS[k].bad);return true;}
const lmatch=(n,c)=>matchT(n,TPL[c.id],c.el)&&lshow(n,c);
function lsort(n,arr,dflt){const f=LC(n),a=arr.slice(),nm=x=>String(x.name||TPL[x.id].n),R=Object.keys(G.roster);
  const ord={name:(x,y)=>nm(x).localeCompare(nm(y)),lv:(x,y)=>y.lv-x.lv||nm(x).localeCompare(nm(y)),cls:(x,y)=>CLS[TPL[x.id].cls].n.localeCompare(CLS[TPL[y.id].cls].n)||y.lv-x.lv,
    el:(x,y)=>ELK.indexOf(x.el[0])-ELK.indexOf(y.el[0])||(x.el[1]?ELK.indexOf(x.el[1]):-1)-(y.el[1]?ELK.indexOf(y.el[1]):-1)||nm(x).localeCompare(nm(y)),
    hp:(x,y)=>(x.hp/x.S.mhp)-(y.hp/y.S.mhp)||nm(x).localeCompare(nm(y)),new:(x,y)=>R.indexOf(y.id)-R.indexOf(x.id)};
  return a.sort(ord[f.s]||dflt);}
// v0.6.3: every filter is a dropdown (ddSel in menus3.js); the actions and the stored record (META.cfg.lists) are unchanged
function filterBar(n,codex){const f=LC(n);
  const cl=Object.keys(CLS).filter(k=>!CLS[k].legend&&(k!=='chronicler'||Object.values(G.roster).some(c=>TPL[c.id].cls==='chronicler')||codex));
  const hasL=codex||Object.values(G.roster).some(c=>TPL[c.id].src==='L');
  return ddBar([ddSel('Sort','lSort',n,codex?LSORT_C:LSORT_H,f.s),
    ddSel('Element','lEl',n,[['all','All elements']].concat(ELK.map(k=>[k,EL[k]]),[['dual','Dual type']]),f.el),
    ddSel('Class','lCl',n,[['all','All classes']].concat(cl.map(k=>[k,CLS[k].n]),hasL?[['legend','★ Legendary']]:[]),f.cl),
    n==='roster'?ddSel('Show','lSh',n,[['all','Everyone'],['party','In the party'],['bench','Reserves'],['pts','Unspent points'],['hurt','Hurt or ailing']],f.sh||'all'):''],'lfbar');}
// ----- XP -----
function xpLine(c,compact){if(c.lv>=LV_CAP)return `<span class="swb xpb"><span class="swbl">XP</span><span class="nums">Max level</span></span>`;
  const n=need(c.lv);return `<span class="swb xpb"><span class="swbl">XP</span>${bar(c.xp,n,'var(--gold)')}<span class="nums">${fmt(c.xp)}/${fmt(n)}${compact?'':` (${fmt(n-c.xp)} to Lv ${c.lv+1})`}</span></span>`;}
const xpMini=c=>c.lv>=LV_CAP?'<span class="xpm"><small>Max</small></span>':`<span class="xpm" title="${fmt(need(c.lv)-c.xp)} XP to Lv ${c.lv+1}">${bar(c.xp,need(c.lv),'var(--gold)')}<small class="nums">${fmt(need(c.lv)-c.xp)} to Lv ${c.lv+1}</small></span>`;
// ----- loadouts -----
const LD=()=>G.loadouts=G.loadouts||[];
function ldCapture(name){const eq={},comp={};G.party.forEach(id=>{const c=G.roster[id];eq[id]=Object.assign({},c.eq);const o=compOf(c);if(o)comp[id]=o.id;});return {name,party:G.party.slice(),eq,comp,t:Date.now()};}
function ldStrip(){const L=LD();return `<div class="ldstrip"><small class="lbl">Loadouts</small>${Array.from({length:LOADMAX},(_,i)=>L[i]?`<button class="chip ld" data-act="ldApply" data-arg="${i}" title="Switch to this loadout">${i+1}. ${esc(L[i].name)}</button>`:'').join('')}<button class="btn sm" data-act="ldMgr">${L.length?'Manage':'Save a loadout'}</button></div>`;}
function itemName(id){const g=gearOf(id);return g?esc(g.n):esc(id);}
function ldApply(i){
  const L=LD()[i];if(!L||G.daily)return;
  let members=L.party.filter(id=>G.roster[id]);const msgs={miss:[],fill:[],move:[]};
  L.party.filter(id=>!G.roster[id]).forEach(id=>msgs.miss.push(`${TPL[id]?esc(TPL[id].n):'A hero'} is not on your roster.`));
  const curSet=new Set(G.party);
  if(members.length<L.party.length){Object.values(G.roster).filter(c=>!members.includes(c.id)).sort((a,b)=>b.lv-a.lv).slice(0,L.party.length-members.length).forEach(c=>{members.push(c.id);msgs.fill.push(`${esc(c.name)} filled an empty place.`);});}
  const changed=members.some(id=>!curSet.has(id))||G.party.some(id=>!members.includes(id));
  if(changed&&!inTown()){V.modal={type:'ldRes',title:'Switch loadout',msgs:{miss:['Changing who is in your six happens in town. Order, gear and companions can change anywhere.'],fill:[],move:[]},snap:null,from:V.modal};render();return;}
  const snap=snapAuto();
  // gear: every member hands their gear back, then each slot is filled from the pack with what the loadout had
  const pack=G.gear.slice();members.forEach(id=>GSLOTS.forEach(sl=>{const c=G.roster[id];if(c.eq[sl]){pack.push(c.eq[sl]);c.eq[sl]=null;}}));
  const worn=id=>Object.values(G.roster).find(c=>!members.includes(c.id)&&GSLOTS.some(sl=>c.eq[sl]===id));
  members.forEach(id=>{const c=G.roster[id],want=L.eq[id];if(!want)return;
    GSLOTS.forEach(sl=>{const it=want[sl];if(!it)return;const k=pack.indexOf(it);
      if(k>=0&&canEquip(c,it)){pack.splice(k,1);c.eq[sl]=it;}
      else{const w=worn(it);msgs.miss.push(`${esc(c.name)}'s ${SLOTN[sl]}, ${itemName(it)}, ${w?'is worn by '+esc(w.name):k>=0?'can no longer be used by '+esc(c.name)+' ('+esc(equipWhy(c,it))+')':'is gone'}.`);
        let best=null,bs=scoreEq(c,c.eq);[...new Set(pack.filter(x=>slotOk(c,sl,x)))].forEach(x=>{const v=scoreEq(c,Object.assign({},c.eq,{[sl]:x}));if(v>bs+.01){bs=v;best=x;}});
        if(best){pack.splice(pack.indexOf(best),1);c.eq[sl]=best;msgs.fill.push(`${esc(c.name)} got ${itemName(best)} instead.`);}}});});
  G.gear=pack;
  // companions
  members.forEach(id=>{const oid=L.comp[id];if(!oid)return;const o=(G.tamed||[]).find(x=>x.id===oid);
    if(!o){msgs.miss.push(`${esc(G.roster[id].name)}'s companion is no longer with you.`);return;}
    if(o.with&&o.with!==id&&G.roster[o.with]&&!members.includes(o.with))msgs.move.push(`${esc(o.name)} came over from ${esc(G.roster[o.with].name)}.`);
    G.tamed.forEach(x=>{if(x.with===id&&x!==o)x.with=null;});o.with=id;});
  G.party=members.slice(0,6);Object.values(G.roster).forEach(refresh);saveGame();sfx('equip');
  V.modal={type:'ldRes',title:`Loadout: ${L.name}`,msgs,snap,from:{type:'menu',tab:'party'}};render();
}
function mLdRes(m){const M=m.msgs||{miss:[],fill:[],move:[]},all=M.miss.length+M.fill.length+M.move.length;
  return box(esc(m.title||'Loadout'),`${m.snap?'<p class="note">Everything is in place.</p>':''}${M.miss.length?`<h4>Could not restore</h4><div class="rows">${M.miss.map(x=>`<div class="row"><small class="dn">${x}</small></div>`).join('')}</div>`:''}
    ${M.fill.length?`<h4>Filled in</h4><div class="rows">${M.fill.map(x=>`<div class="row"><small>${x}</small></div>`).join('')}</div>`:''}${M.move.length?`<div class="rows">${M.move.map(x=>`<div class="row"><small>${x}</small></div>`).join('')}</div>`:''}${all?'':'<p class="note">Restored exactly as saved.</p>'}`,
    `${m.snap?'<button class="btn" data-act="ldUndo">Undo</button>':''}<button class="btn gold" data-act="ldDone">OK</button>`);}
function mLdMgr(m){const L=LD();
  return box('Team loadouts',`<p class="note">Each slot remembers who is in your six, their order, gear and companions. Tap a slot name in the Party menu to switch. If something is missing you will be told what could not be restored.</p><div class="rows">${Array.from({length:LOADMAX},(_,i)=>{const o=L[i];
    return `<div class="row ldrow"><b class="nums">${i+1}</b><div class="grow">${o?`<input class="lname" data-i="${i}" maxlength="16" value="${esc(o.name)}" aria-label="Loadout ${i+1} name"><div class="ldp">${o.party.map(id=>G.roster[id]?port(id,'sm'):'<span class="port sm"></span>').join('')}</div>`:'<small>Empty</small>'}</div>
      <div class="ldb">${o?`<button class="btn sm gold" data-act="ldApply" data-arg="${i}">Load</button><button class="btn sm" data-act="ldSave" data-arg="${i}">Overwrite</button><button class="btn sm" data-act="ldDel" data-arg="${i}">Delete</button>`:`<button class="btn sm gold" data-act="ldSave" data-arg="${i}">Save here</button>`}</div></div>`;}).join('')}</div>`,
    '<button class="btn gold" data-act="xBack">Done</button>');}
// ----- best party -----
const healer=c=>classSkills(TPL[c.id]).some(s=>(s.k==='heal'||s.k==='revive')&&skillKnown(c,s));
// ----- field skills -----
function fsSkills(c){return classSkills(TPL[c.id]).filter(s=>skillKnown(c,s)&&(s.k==='heal'||s.k==='revive'));}
const fsNeedsTgt=s=>s.t==='ally'||s.t==='dead';
function fsEffect(s,t){if(s.k==='revive'||s.t==='dead')return t.hp<=0;if(t.hp<=0)return !!s.revive&&s.t!=='ally';return t.hp<t.S.mhp||!!(s.cleanse&&Object.keys(t.st||{}).some(k=>STS[k]&&STS[k].bad));}
function fsCast(cid,sid,tid){const c=G.roster[cid],s=c&&fsSkills(c).find(x=>x.id===sid);if(!c||!s||c.hp<=0||c.mp<(s.mp||0))return;
  const T=(s.t==='allyAll'?G.party.map(id=>G.roster[id]).filter(Boolean):[G.roster[tid]]).filter(Boolean),eff=T.filter(t=>fsEffect(s,t));
  if(!eff.length){const why=s.t==='dead'||s.k==='revive'?'Nobody is knocked out.':'Nobody needs that right now.';toast(why);if(V.modal&&V.modal.type==='field')V.modal.msg=why;return;}
  const out=[];c.mp-=(s.mp||0);
  eff.forEach(t=>{
    if(t.hp<=0){t.hp=Math.max(1,Math.round(t.S.mhp*(s.k==='revive'?s.pw:s.revive)));t.st={};out.push(`${t.name} rises`);return;}
    const n=Math.round(s.pw*(c.S.healP||c.S.mag)*(.95+Math.random()*.1)),g=Math.min(n,t.S.mhp-t.hp);t.hp+=g;if(s.cleanse)cleanse(t);out.push(`${t.name} +${g}`);});
  if(s.revive&&s.t==='allyAll')G.party.forEach(id=>{const t=G.roster[id];if(t&&t.hp<=0&&!eff.includes(t)){t.hp=Math.max(1,Math.round(t.S.mhp*s.revive));t.st={};out.push(`${t.name} rises`);}});
  Object.values(G.roster).forEach(refresh);saveGame();sfx('blip');const msg=`${c.name} casts ${s.n}: ${out.join(', ')}.`;toast(msg);if(V.modal&&V.modal.type==='field')V.modal.msg=msg;}
function mField(m){const P=G.party.map(id=>G.roster[id]).filter(Boolean),casters=P.filter(c=>fsSkills(c).length);
  if(!casters.length)return box('Field skills','<p class="note">Nobody in your party knows a healing or reviving skill yet. Healers, Bards and a few others learn them as they level.</p>','<button class="btn gold" data-act="xBack">Back</button>');
  const c=G.roster[m.hero]&&casters.includes(G.roster[m.hero])?G.roster[m.hero]:casters[0],sk=fsSkills(c),cur=sk.find(s=>s.id===m.sk);
  return box('Field skills',`<p class="note">Heals, cures and revives cost MP. Buffs are not offered here: they fade when the next fight begins.</p>
    <div class="chips">${casters.map(h=>`<button class="chip ${h.id===c.id?'on':''}" data-act="fsHero" data-arg="${h.id}">${esc(h.name)}</button>`).join('')}</div>
    <div class="row">${port(c.id,'sm')}<div class="grow"><b>${esc(c.name)}</b><span class="swb"><span class="swbl">MP</span>${bar(c.mp,c.S.mmp,'var(--mp)')}<span class="nums">${c.mp}/${c.S.mmp}</span></span></div></div>
    ${m.msg?`<p class="fsmsg" role="status">${esc(m.msg)}</p>`:''}
    ${cur&&fsNeedsTgt(cur)?`<div class="fstgt"><h4>${esc(cur.n)} on whom? <small class="nums">${cur.mp||0} MP</small></h4><div class="rows">${P.map(t=>{const can=fsEffect(cur,t),why=t.hp<=0?(cur.k==='revive'||cur.t==='dead'||cur.revive?'':'Knocked out'):(cur.t==='dead'||cur.k==='revive'?'Not knocked out':!can?'Already full':'');return `<div class="row ${t.hp<=0?'ko':''}">${port(t.id,'sm')}<div class="grow"><b>${esc(t.name)}</b>${t.hp<=0?' <em class="swko">KO</em>':''}<span class="swb"><span class="swbl">HP</span>${bar(t.hp,t.S.mhp,'var(--hp)')}<span class="nums">${t.hp}/${t.S.mhp}</span></span>${can?'':`<small>${why||'No effect right now'}</small>`}</div><button class="btn sm ${can?'gold':''}" data-act="fsTgt" data-arg="${t.id}" ${can?'':'disabled'}>Cast</button></div>`;}).join('')}</div><div class="btnrow"><button class="btn" data-act="fsBack">Back to skills</button></div></div>`
      :`<div class="rows">${sk.map(s=>{const ok=c.hp>0&&c.mp>=(s.mp||0);return `<div class="row"><div class="grow"><b>${skEls(s).map(ico).join('')}${esc(s.n)}</b> <small class="nums">${s.mp||0} MP</small><small>${esc(s.d)}</small></div><button class="btn sm" data-act="fsPick" data-arg="${s.id}" ${ok?'':'disabled'}>${fsNeedsTgt(s)?'Choose target':'Cast'}</button></div>`;}).join('')}</div>
      <div class="rows">${P.map(t=>`<div class="row ${t.hp<=0?'ko':''}">${port(t.id,'sm')}<div class="grow"><b>${esc(t.name)}</b><span class="swb"><span class="swbl">HP</span>${bar(t.hp,t.S.mhp,'var(--hp)')}<span class="nums">${t.hp}/${t.S.mhp}</span></span></div></div>`).join('')}</div>`}`,
    '<button class="btn gold" data-act="xBack">Done</button>');}
// ----- wiring -----
{const vm0=vModal;vModal=function(m){if(m){if(m.type==='ldRes')return mLdRes(m);if(m.type==='ldMgr')return mLdMgr(m);if(m.type==='bp')return mBestParty(m);if(m.type==='field')return mField(m);}return vm0.apply(this,arguments);};}
const lstore=(n,k,v)=>{LC(n)[k]=v;saveMeta();render();};
Object.assign(ACT,{
  lSort(a){const [n,v]=a.split(':');lstore(n,'s',v);},lEl(a){const [n,v]=a.split(':');lstore(n,'el',v);},lCl(a){const [n,v]=a.split(':');lstore(n,'cl',v);},lSh(a){const [n,v]=a.split(':');lstore(n,'sh',v);},lRg(a){const [n,v]=a.split(':');lstore(n,'rg',v);},
  ldMgr(){V.modal={type:'ldMgr',from:V.modal};render();},
  ldSave(i){i=+i;const L=LD();if(i<0||i>=LOADMAX)return;const nm=L[i]?L[i].name:'Loadout '+(i+1);L[i]=ldCapture(nm);for(let k=0;k<L.length;k++)if(!L[k])L[k]=ldCapture('Loadout '+(k+1));saveGame();toast('Loadout saved.');render();},
  ldDel(i){i=+i;const L=LD();if(L[i]){L[i]=null;while(L.length&&!L[L.length-1])L.pop();saveGame();render();}},
  ldApply(i){ldApply(+i);},
  ldUndo(){const m=V.modal;if(m&&m.snap){undoAuto(m.snap);toast('Loadout change undone.');}V.modal=m&&m.from||null;render();},
  ldDone(){const m=V.modal;V.modal=m&&m.from||null;render();},
  bpOpen(){V.modal={type:'bp',plan:bestParty(),from:V.modal};render();},
  bpApply(){const m=V.modal,P=m.plan;if(!P)return;const cur=new Set(G.party),same=P.ids.length===G.party.length&&P.ids.every(id=>cur.has(id));if(!same&&!inTown())return;
    const snap=snapAuto();G.party=P.ids.filter(id=>G.roster[id]).slice(0,6);saveGame();sfx('equip');V.modal={type:'ldRes',title:'Best party applied',msgs:{miss:[],fill:[],move:[]},snap,from:{type:'menu',tab:'party'}};render();},
  fsOpen(id){if(G.daily||B)return;V.modal={type:'field',hero:typeof id==='string'?id:null,sk:null,from:V.modal};render();},
  fsHero(id){V.modal.hero=id;V.modal.sk=null;V.modal.msg=null;render();},
  fsBack(){V.modal.sk=null;render();},
  fsPick(sid){const m=V.modal,c=G.roster[m.hero]||G.party.map(i=>G.roster[i]).find(h=>h&&fsSkills(h).length),s=c&&fsSkills(c).find(x=>x.id===sid);if(!s)return;
    if(fsNeedsTgt(s)){m.hero=c.id;m.sk=sid;m.msg=null;render();const f=document.querySelector('#modal .fstgt');if(f)f.scrollIntoView({block:'start'});}else{fsCast(c.id,sid);render();}},
  fsTgt(tid){const m=V.modal;if(m.sk)fsCast(m.hero||G.party.find(i=>fsSkills(G.roster[i]).length),m.sk,tid);render();}
});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.classList&&t.classList.contains('lname')&&G&&!G.daily){const i=+t.dataset.i,L=LD();if(L[i]){L[i].name=String(t.value).trim().slice(0,16)||('Loadout '+(i+1));saveGame();}}});
