// ===== starter.js (v0.4.0): starter hero sheets and the starter draw =====
// ===== v0.4.0 3.8: starter hero sheets (and, in later phases, the starter draw rules) =====
// The sheet shows a hero as they would begin: level 3, no nature bonus, no gear beyond the class kit.
// It reads the same tables the game does, so it never drifts from the real numbers.
// STARTER_LV: in config.js
// ===== v0.4.0 4.4: the starter draw =====
// STARTERS (heroes.js) is the pool of 24 single type wayfarers: 3 per element, 3 per class (v0.4.3; was 16). A new journey shows 8 of them, drawn from a seed:
// all 8 elements different and all 8 classes different. The pool is a 2-regular bipartite graph (class - element), so a perfect matching always exists;
// the draw walks the classes in a seeded order and backtracks, so it cannot fail. Tune: change STARTERS (src 's' rows in data.js).
function starterDraw(seed){
  const R=seeded((seed>>>0)||1),pool=STARTERS.map(id=>TPL[id]),classes=[...new Set(pool.map(t=>t.cls))];
  for(let i=classes.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[classes[i],classes[j]]=[classes[j],classes[i]];}
  const usedEl=new Set(),out=[];
  const go=k=>{if(k===classes.length)return true;const opts=pool.filter(t=>t.cls===classes[k]&&!usedEl.has(t.el[0]));
    for(let i=opts.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]];}
    for(const t of opts){usedEl.add(t.el[0]);out.push(t.id);if(go(k+1))return true;out.pop();usedEl.delete(t.el[0]);}return false;};
  go(0);
  // show them in a steady order (by class, then element) so the screen does not shuffle every redraw
  const ORDER=['warrior','knight','mage','healer','thief','archer','monk','bard'];
  return out.sort((a,b)=>ORDER.indexOf(TPL[a].cls)-ORDER.indexOf(TPL[b].cls));
}
// How many starter picks are left once Legacy heroes have taken their places (never more than 3 heroes in total).
function starterSlots(){const L=((V&&V.legacyPick)||[]).filter(id=>TPL[id]&&(META.legacy||[]).includes(id)).slice(0,2).length;return Math.max(1,3-L);}
function starterPreview(id){
  const t=TPL[id],c=newChar(id,STARTER_LV,0);c.nat=null;c.S=calcStats(c);return c;
}
function mStarterSheet(m){
  const id=m.id,t=TPL[id];if(!t)return '';
  const c=starterPreview(id),S=c.S,cls=CLS[t.cls];
  const wpn=(CLS_WPN[t.cls]||[]).map(k=>WT_NAME[k]||k),arm=CLS_ARM[t.cls]||'medium';
  const sk=classSkills(t).filter(s=>s.k!=='limit');
  const row=s=>`<div class="row"><div class="grow"><b>${esc(s.n)}</b> ${s.sig?'<em class="sigb">Signature</em>':''} ${typeof dlChip==='function'?dlChip(s,t.cls):''}<small>${s.lv>STARTER_LV?`Learned at level ${s.lv}. `:''}${s.mp?s.mp+' MP. ':''}${esc(s.d||'')}</small></div></div>`;
  const now=sk.filter(s=>s.lv<=STARTER_LV),later=sk.filter(s=>s.lv>STARTER_LV).sort((a,b)=>a.lv-b.lv);
  const stat=(k,l)=>`<span>${l} <b>${Math.round(S[k])}</b></span>`;
  const picked=(V.pick||[]).includes(id),full=(V.pick||[]).length>=starterSlots();
  return box(esc(t.n),`<div class="bdet"><div class="bimg">${port(id,'big')}</div><div class="grow"><div class="els">${elChips(t.el)}</div><p class="note"><b>${esc(cls.n)}.</b> ${esc(cls.role)}</p><p class="bio">${esc(t.bio)}</p><p class="mline">${masteryLine(id)}</p>${sigLine(id)}</div></div>
    <h4>Stats at level ${STARTER_LV}</h4><div class="stats">${stat('mhp','HP')}${stat('mmp','MP')}${stat('atk','ATK')}${stat('def','DEF')}${stat('mag','MAG')}${stat('res','RES')}${stat('spd','SPD')}</div>
    <h4>Gear</h4><div class="rows compact"><div class="row"><b>Weapons</b><span>${wpn.join(', ')}</span></div><div class="row"><b>Armor</b><span>${arm[0].toUpperCase()+arm.slice(1)}</span></div><div class="row"><b>Nature</b><span>${natPoolText(id)}</span></div></div>
    <h4>Skills at the start</h4><div class="rows compact">${now.map(row).join('')||'<p class="note">None yet.</p>'}</div>
    ${later.length?`<h4>Learned later</h4><div class="rows compact">${later.map(row).join('')}</div>`:''}`,
    `<button class="btn" data-act="closeModal">Back</button><button class="btn gold" data-act="sheetPick" data-arg="${id}" ${!picked&&full?'disabled':''}>${picked?'Remove from my three':full?'Your three are full':'Choose '+esc(t.n)}</button>`,true);
}
HOOK.before('vModal','starter','starterSheet popup',function(m){if(m&&m.type==='starterSheet')return HOOK.stop(mStarterSheet(m));});
Object.assign(ACT,{
  sheetS(id){if(!TPL[id])return;V.modal={type:'starterSheet',id};render();},
  sheetPick(id){ACT.pickS(id);V.modal=null;render();}
});
