// ===== menus12.js (menu pass 12): battle menu memory per hero, one tag strip on every skill row, new Slash and Pierce symbols, no role names in skill text =====
// The owner's five requests:
// 1) Battle menu memory is tied to the hero. The command menu remembers, for each hero of the fight, the submenu they were in (Skills or Items), the scroll of
//    that list and the last skill (or item) they picked; a hero's turn opens at that place. Per fight (M12.mem is dropped when B.id changes), never saved.
//    (The menu history Back rule of the same pass lives in menus11.js: it steps between menus, not between the tabs of one.)
// 2) One tag strip for every skill row, from one builder (m12Tags): target scope (Single / All / Self / Ally / Allies ...), the delivery kind of a physical
//    skill with its symbol (Slash / Blunt / Pierce / Ranged, through dmg11.js for the hero's own weapon when the skill follows it; on a class overview
//    with no hero, every kind the class can reach), the element symbols of a magic skill, and the Primer / Detonator tags (a dual art is both).
//    The battle list already drew most of it, so there the builder only adds what a row is missing; the hero sheet's Skills tab, the codex and
//    starter previews and the "learned" notices got the strip from here (before, the sheet knew no scope and no kind in town: dlChip had no hero to ask).
// 3) Slash and Piercing symbols redrawn in code (battle3.js dlShapeCv is a hook point now): a curved blade and a spear tip, drawn at 3x and shown smooth.
// 4) The role of a skill is never written into its description ("Healer role." came from roles.js; this module also scrubs any left in a list).
const M12={mem:{},bid:null,cv:{}};
// ---------- tag strip ----------
const M12_SC={one:['Single','One foe','fo'],all:['All','Every foe','fo'],rand:['Random','Random foes','fo'],chain:['Chain','Jumps from foe to foe','fo'],ally:['Ally','One ally','al'],allyAll:['Allies','Every ally','al'],self:['Self','The caster','al'],dead:['Fallen','A fallen ally','al']};
const M12_KN={slash:'Slash',blunt:'Blunt',piercing:'Pierce',ranged:'Ranged',magic:'Magic',heal:'Heal'};
// the unit dmg11.js asks about for a roster hero: the family of the weapon in hand
function m12Unit(c){try{if(!c||!c.id||!TPL[c.id])return null;const g=c.eq&&c.eq.w&&canEquip(c,c.eq.w)?gearOf(c.eq.w):null;return {id:c.id,side:'p',S:{wp:g&&g.fam||(c.S&&c.S.wp)||null}};}catch(e){return null;}}
// the delivery kinds a skill shows: [] for status skills; with a hero the one kind it deals now, with only a class every kind it can reach
function m12Kinds(u,cls,s){if(!s)return [];if(s.k==='mag')return ['magic'];if(s.k==='heal'||s.k==='revive')return ['heal'];if(s.k!=='phys')return [];
  try{if(u){const d=deliveryOf(u,s);if(d)return [d];}}catch(e){}
  try{if(cls&&CLS_KINDS[cls]){const f=d11Forced(cls,s);return f?[f]:CLS_KINDS[cls].slice();}}catch(e){}
  return s.dl?[s.dl]:[];}
function m12Scope(s){const o=M12_SC[s&&s.t];return o?`<em class="m12t sc ${o[2]}" title="Targets: ${o[1]}">${o[0]}</em>`:'';}
function m12Kind(u,cls,s){const ks=m12Kinds(u,cls,s);if(!ks.length)return '';const names=ks.map(k=>M12_KN[k]||k).join(' / '),els=skEls(s);
  const tip=s.k==='phys'?(s.dl||(cls&&d11Forced(cls,s))?`${names}: this skill always deals ${names.toLowerCase()} damage.`:u?`${names} with your weapon: a physical skill deals the kind of the weapon in hand.`:`Follows your weapon: ${names}.`):s.k==='mag'?'Magic: not stopped by armor.':'Healing.';
  return `<em class="m12t kind ${ks[0]}" title="${esc(tip)}">${ks.map(k=>dlIco(k)).join('')}${s.k==='mag'?els.map(ico).join(''):''}${esc(names)}</em>`;}
function m12Role(s){if(!s)return '';const w=skTagsFull(),el=skEls(s).length;
  if(s.role&&el){const p=s.role==='primer';return `<em class="role ${s.role}" title="${p?'Primes a foe with its element for 2 turns. A matching Detonator sets off a reaction.':'Sets off a reaction on a foe Primed with a matching element.'}">${w?(p?'⟐ Primer':'✸ Detonator'):(p?'⟐':'✸')}</em>`;}
  if(s.combo&&(typeof skHitsFoe!=='function'||skHitsFoe(s)))return `<em class="role primer" title="Primes a foe with both of its elements.">${w?'⟐ Primer':'⟐'}</em><em class="role det" title="Sets off the reaction of each of its elements on a Primed foe.">${w?'✸ Detonator':'✸'}</em>`;
  return '';}
// only: the parts to draw (default all three)
function m12Tags(u,cls,s,only){const o=only||['tgt','kind','role'];return `<span class="m12tags">${o.includes('tgt')?m12Scope(s):''}${o.includes('kind')?m12Kind(u,cls,s):''}${o.includes('role')?m12Role(s):''}</span>`;}
// the battle list: add only what a row lacks, and mark the skill this hero used last
HOOK.xform('cmdHtml','menus12','battle skill rows: a missing scope, kind or Primer / Detonator tag is added; the last used skill is marked',function(h){try{
  const a=B&&B.cur;if(!a||B.mode!=='cmd'||B.menu!=='skills'||typeof h!=='string')return h;
  const cls=TPL[a.id]&&TPL[a.id].cls,mm=B&&M12.bid===B.id&&M12.mem[a.id];
  known(a).forEach(s=>{const id=String(s.id).replace(/[^\w-]/g,'');
    const re=new RegExp(`(<button class="mi [^"]*" data-act="sk" data-arg="${id}"[^>]*>\\s*<span class="n">)([\\s\\S]*?)(</span>)`);
    h=h.replace(re,(m0,p1,body,p3)=>{const only=[];if(!/class="tk"/.test(body))only.push('tgt');
      if(!/class="ico dli |class="dl /.test(body)&&m12Kinds(a,cls,s).length)only.push('kind');if(!/class="role /.test(body)&&(s.role||s.combo))only.push('role');
      return only.length?p1+body+m12Tags(a,cls,s,only)+p3:m0;});
    if(mm&&mm.sk===s.id)h=h.replace(new RegExp(`(<button class="mi [^"]*)(" data-act="sk" data-arg="${id}")`),'$1 m12last$2');});
  return h;}catch(e){return h;}});
// rows outside the battle (hero sheet, codex and starter previews): matched by skill name, the strip goes right after the name
function m12Rows(h,id,c){try{
  const t=TPL[id];if(!t||typeof h!=='string')return h;const u=c?m12Unit(c):null,cls=t.cls;
  const list=classSkills(t).concat(id==='vaelith'&&typeof archiveSkills==='function'?archiveSkills():[]),by={};list.forEach(s=>{by[s.n]=s;});
  [LIMIT[cls],LIMIT2[cls]||LIMIT[cls]].forEach((L,i)=>{if(!L)return;by[(i?'Limit II: ':'Limit I: ')+L.n]=Object.assign({limit:1,mp:0,hits:1},L);});
  const tp=document.createElement('template');tp.innerHTML=h;let n=0;
  tp.content.querySelectorAll('.row').forEach(r=>{if(r.querySelector('.m12tags'))return;const b=r.querySelector(':scope>div>b');if(!b)return;
    const nm=b.textContent.trim(),s=by[nm];if(!s)return;
    r.querySelectorAll(':scope>div>em.role,:scope>div>em.dl,:scope>div>em.tk').forEach(e=>e.remove());
    b.insertAdjacentHTML('afterend',m12Tags(u,cls,s));n++;});
  return n?tp.innerHTML:h;}catch(e){return h;}}
HOOK.xform('mChar','menus12','skill rows on the hero sheet: scope, kind (for the weapon in hand), Primer / Detonator',function(h,id){try{const c=G&&G.roster[id];return c?m12Rows(h,id,c):h;}catch(e){return h;}});
HOOK.xform('vModal','menus12','skill rows of the codex and starter previews',function(h,m){try{if(m&&(m.type==='codexEntry'||m.type==='starterSheet')&&m.id)return m12Rows(h,m.id,null);}catch(e){}return h;});
HOOK.xform('learnLine','menus12','the "learned" notice names the scope and the kind',function(h,o){try{const c=G&&o&&G.roster[o.hero],t=c&&TPL[c.id];if(!t||!o.sk||typeof h!=='string')return h;
  return h.replace(/<\/span>$/,m12Tags(m12Unit(c),t.cls,o.sk,['tgt','kind'])+'</span>');}catch(e){return h;}});

// ---------- no role names in skill text ----------
const M12_ROLE_RE=/\s*\b(?:(?:main|sub|off|secondary|primary|healer|support|saboteur|caster|marksman|striker|guardian|summoner|tank|buffer|debuffer)\s+)role\b\.?|\s+as an? (?:healer|support|saboteur|caster|marksman|striker|guardian|summoner|tank|buffer|debuffer)\b/gi;
function m12Clean(L){try{(L||[]).forEach(s=>{if(s&&typeof s.d==='string'&&!s._m12&&M12_ROLE_RE.test(s.d)){M12_ROLE_RE.lastIndex=0;s.d=s.d.replace(M12_ROLE_RE,'').replace(/\s{2,}/g,' ').trim();}M12_ROLE_RE.lastIndex=0;if(s)s._m12=1;});}catch(e){}return L;}
HOOK.xform('classSkills','menus12','skill descriptions never name a role',function(L){return m12Clean(L);});

// ---------- Slash and Pierce symbols ----------
// 11 x 11 logical pixels like the others, drawn at 3x with a dark outline, a body colour and a light facet; CSS keeps these two smooth (battle3.css)
function m12Draw(d){const K=3,c=mkCv(11*K,11*K),x=c.getContext('2d'),col=DLC[d]||'#ccc',hi=tint(col,.62),ln='#150b17';x.scale(K,K);x.lineJoin='round';x.lineCap='round';
  const out=(w)=>{x.strokeStyle=ln;x.lineWidth=w;x.stroke();};
  if(d==='piercing'){ // a spear tip: a slim leaf head on a short shaft, the left half lit
    x.beginPath();x.moveTo(5.5,.5);x.bezierCurveTo(7.6,2.2,8.4,3.6,8.1,5.1);x.lineTo(6.5,6.3);x.lineTo(4.5,6.3);x.lineTo(2.9,5.1);x.bezierCurveTo(2.6,3.6,3.4,2.2,5.5,.5);x.closePath();out(1.9);x.fillStyle=col;x.fill();
    x.beginPath();x.moveTo(5.5,1.1);x.bezierCurveTo(3.9,2.5,3.4,3.7,3.6,4.9);x.lineTo(5.5,5.7);x.closePath();x.fillStyle=hi;x.fill();
    x.beginPath();x.moveTo(5.5,6.2);x.lineTo(5.5,10.3);out(2.6);x.strokeStyle=col;x.lineWidth=1.1;x.stroke();
  }else{ // a curved blade: a crescent from the hilt (low left) to a sharp tip (high right)
    x.beginPath();x.moveTo(1.8,9.2);x.bezierCurveTo(1.2,4.6,4.6,1.5,10.2,.8);x.bezierCurveTo(7.2,2.6,5.2,5.4,4.2,8.4);x.closePath();out(1.9);x.fillStyle=col;x.fill();
    x.beginPath();x.moveTo(2.6,8);x.bezierCurveTo(2.6,5.2,4.8,3.1,8.4,1.7);x.bezierCurveTo(5.8,3.6,4.4,5.8,3.7,7.8);x.closePath();x.fillStyle=hi;x.fill();
    x.beginPath();x.moveTo(.9,10.1);x.lineTo(3.1,7.9);out(2.7);x.strokeStyle='#b8873a';x.lineWidth=1.2;x.stroke();
    x.beginPath();x.moveTo(1.9,6.9);x.lineTo(4.5,9.5);out(2.3);x.strokeStyle='#e8c070';x.lineWidth=.9;x.stroke();}
  return c;}
HOOK.before('dlShapeCv','menus12','Slash and Piercing drawn as curves',function(d){if(d!=='slash'&&d!=='piercing')return;try{return HOOK.stop(M12.cv[d]||(M12.cv[d]=m12Draw(d)));}catch(e){}});

// ---------- battle menu memory, per hero ----------
function m12Mem(a){if(M12.bid!==B.id){M12.bid=B.id;M12.mem={};}return M12.mem[a.id]||(M12.mem[a.id]={menu:'root',sk:null,item:null,sc:{}});}
// (renderBattle, not cmdHtml: battle3.js builds the command html for every hero to measure it, and that must not touch the memory)
HOOK.before('renderBattle','menus12','battle menu memory: a turn opens at the hero\'s own remembered submenu; the place is noted on every render',function(stageOnly){try{if(stageOnly)return;
  const a=B&&B.cur;if(!B||B.mode!=='cmd'||!a||a.side==='e'||B.over||B.auto)return;const mm=m12Mem(a),key=a.id+'#'+(B.pturns||0);
  if(B.m12key!==key){B.m12key=key;
    if(B.menu==='root'&&!B.pend&&!B.swapAsk&&((mm.menu==='skills'&&known(a).length)||mm.menu==='items'))B.menu=mm.menu;}
  if(B.swapAsk)return;let m=B.menu;
  if(m==='target'){m=B.tgFrom&&B.tgFrom!=='target'?B.tgFrom:'root';if(B.pend&&B.pend.sk&&B.pend.sk.id)mm.sk=B.pend.sk.id;if(B.pend&&B.pend.item)mm.item=B.pend.item;}
  if(m==='root'||m==='skills'||m==='items')mm.menu=m;}catch(e){}});
// the scrolled box of the command list: #bcmd itself or the box around it (the portrait layout scrolls .bbottom)
function m12Scroller(){try{const c=document.getElementById('bcmd');if(!c)return null;for(let e=c;e&&e!==document.body;e=e.parentElement){if(e.scrollHeight>e.clientHeight+2&&/auto|scroll/.test(getComputedStyle(e).overflowY))return e;}}catch(x){}return null;}
function m12Put(){try{if(!B||B.mode!=='cmd'||B.pend||B.swapAsk||!B.cur||(B.menu!=='skills'&&B.menu!=='items'))return;const mm=m12Mem(B.cur),el=m12Scroller();if(!el)return;
  const want=mm.sc[B.menu];
  if(want>1){if(el.scrollTop<2)el.scrollTop=want;}
  else if(want==null){const id=B.menu==='skills'?mm.sk:mm.item;if(id){const b=document.querySelector(`#bcmd [data-act="${B.menu==='skills'?'sk':'item'}"][data-arg="${id}"]`);if(b){const r=b.getBoundingClientRect(),q=el.getBoundingClientRect();if(r.bottom>q.bottom||r.top<q.top)el.scrollTop+=r.top-q.top-8;}}}}catch(e){}}
HOOK.after('renderBattle','menus12','battle menu memory: put the remembered scroll back (after the layout hooks)',function(r,stageOnly){if(stageOnly)return;m12Put();requestAnimationFrame(m12Put);});
document.addEventListener('scroll',e=>{try{if(!B||B.mode!=='cmd'||B.pend||B.swapAsk||!B.cur||(B.menu!=='skills'&&B.menu!=='items'))return;const t=e.target,c=document.getElementById('bcmd');
  if(!c||!t||t===document||!(t===c||(t.contains&&t.contains(c))||c.contains(t)))return;if(t.scrollTop>=0)m12Mem(B.cur).sc[B.menu]=t.scrollTop;}catch(x){}},true);
try{window.__M12={M12,tags:m12Tags,unit:m12Unit,kinds:m12Kinds,clean:m12Clean,draw:m12Draw};}catch(e){}
