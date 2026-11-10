// ===== skillfilt9.js (v0.13.5): filter chips over the battle Skills list =====
// A hero with six or more skills gets a chip row over the list: All, Damage, Heal, Buff, Debuff, Prime, Detonate and the damage kinds
// (Slash, Blunt, Piercing, Ranged, Magic). Only chips that match at least one skill show. The pick is kept for the battle (V.skF, not
// saved) and shared by every hero, so a healer-minded player can leave "Heal" on. Runs after battle9.js in MODS.
const SKF=[['all','All'],['dmg','Damage'],['heal','Heal'],['buff','Buff'],['debuff','Debuff'],['prime','Prime'],['det','Detonate'],['slash','Slash'],['blunt','Blunt'],['piercing','Piercing'],['ranged','Ranged'],['magic','Magic']];
function skTags(a,s){const T=new Set(['all']);try{
  if(s.k==='phys'||s.k==='mag')T.add('dmg');if(s.k==='heal'||s.k==='revive')T.add('heal');
  const fx=s.fx||[];const good=fx.some(f=>STS[f[0]]&&!STS[f[0]].bad),bad=fx.some(f=>STS[f[0]]&&STS[f[0]].bad);
  if(s.k==='status'){if(s.t==='ally'||s.t==='allyAll'||s.t==='self'||good&&!bad)T.add('buff');else T.add('debuff');}else{if(bad)T.add('debuff');if(good&&(s.t==='ally'||s.t==='allyAll'||s.t==='self'))T.add('buff');}
  if(s.role==='primer'||s.primer||s.prime)T.add('prime');if(s.role==='det'||s.det||s.detonator)T.add('det');
  if(s.k==='phys'||s.k==='mag'){const d=deliveryOf(a,s);if(d)T.add(d);}}catch(e){}return T;}
HOOK.xform('cmdHtml','skillfilt9','skill filter chips',function(h){try{const a=B&&B.cur;if(!a||B.mode!=='cmd'||B.menu!=='skills')return h;
  const ks=known(a);if(ks.length<6)return h;const tags=ks.map(s=>skTags(a,s));const avail=SKF.filter(([k])=>k==='all'||tags.some(T=>T.has(k)));if(avail.length<3)return h;
  let f=V.skF||'all';if(!avail.some(([k])=>k===f))f=V.skF='all';
  const chips=`<div class="chips skf" role="tablist" aria-label="Skill filters">${avail.map(([k,l])=>`<button role="tab" aria-selected="${k===f}" class="chip sm ${k===f?'on':''}" data-act="skF" data-arg="${k}">${l}</button>`).join('')}</div>`;
  if(f!=='all'){ks.forEach((s,i)=>{if(tags[i].has(f))return;h=h.replace(new RegExp(`<button class="mi [^"]*" data-act="sk" data-arg="${s.id}"[^>]*>[\\s\\S]*?<\\/button>`),'');});if(!h.includes('data-act="sk"'))h=h.replace('<div class="menu list">','<div class="menu list"><p class="hint">No skill matches this filter.</p>');}
  const i=h.indexOf('<div class="menu list">');return i>=0?h.slice(0,i)+chips+h.slice(i):h;}catch(e){}return h;});
ACT.skF=function(k){V.skF=String(k||'all');render();};
{const st=document.createElement('style');st.textContent='.battle .chips.skf{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 6px}.battle .chips.skf .chip.sm{font-size:.7em;padding:3px 8px}';document.head.appendChild(st);}
