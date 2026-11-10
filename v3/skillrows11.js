// ===== skillrows11.js (v0.17.9): skill numbers are part of the row =====
// Owner: "Skill numbers should not just pop up when you enter screen, they should be a permanent part of each ability in the skill list."
// Cause: the battle Skills row drew its damage estimate as <span class="num dmg">. ".num" is the FLOATING damage number (style.css .num
// { position:absolute; animation: rise 1s ... }), so every estimate popped in, floated up and faded out to opacity 0 about a second after the
// menu opened, which is the number that "pops up" and then is gone. The hero sheet Skills tab never showed a number (MP or "Lv N" only).
// Here both lists get one fixed strip, rendered with the row: estimate (battle) or power, hits, kind, MP. No .num class, no animation, no timer.
// The tooltips and descriptions stay as extra detail.
function sr11Kind(s){return s.k==='phys'?'Physical':s.k==='mag'?'Magic':s.k==='heal'?'Heal':s.k==='revive'?'Revive':s.k==='status'?((s.t==='ally'||s.t==='allyAll'||s.t==='self'||s.t==='dead')?'Buff':'Debuff'):'';}
function sr11Pw(s){return s.pw?Math.round(s.pw*100):0;}
// est: the live estimate ('~96', '~96 each') or '' ; lock: 'Lv 12' on the sheet's locked rows
function sr11Strip(s,est,lock){const lim=!!s.limit;
  const hits=s.hits>1?`<i class="sk11h" title="Hits">x${s.hits}</i>`:'',pw=sr11Pw(s),kind=sr11Kind(s);
  const head=est?`<b class="sk11e" title="Estimated ${s.k==='heal'||s.k==='revive'?'healing':'damage'} now">${est}</b>`:pw?`<b class="sk11e" title="Power">Pow ${pw}</b>`:`<b class="sk11e sk11k">${kind||'Skill'}</b>`;
  const sub=[est&&pw?`<i class="sk11p" title="Power">Pow ${pw}</i>`:'',hits,(est||pw)&&kind?`<i class="sk11k">${kind}</i>`:'',lim?`<i class="sk11c" title="Limit gauge, no MP">Limit</i>`:`<i class="sk11c" title="MP cost">${s.mp} MP</i>`].filter(Boolean).join('');
  return `<span class="m sk11">${lock?`<i class="sk11l">${lock}</i>`:''}${head}<span class="sk11s">${sub}</span></span>`;
}
// battle list: replace the .m span of every skill button (the filter chips of skillfilt9.js ran inside and already removed hidden rows)
{const ch0=cmdHtml;cmdHtml=function(){let h=ch0.apply(this,arguments);try{const a=B&&B.cur;if(a&&B.mode==='cmd'&&B.menu==='root'&&h.includes('class="mi limit')){const LS=limitSkill(a),re=/(<button class="mi limit[^"]*" data-act="cmd" data-arg="limit">[\s\S]*?)<span class="m">Ready<\/span>/;let est='';try{est=skNum(a,LS)||'';}catch(e){}h=h.replace(re,(m,p1)=>p1+sr11Strip(LS,est,''));}
  if(!a||B.mode!=='cmd'||B.menu!=='skills')return h;
  known(a).forEach(s=>{const re=new RegExp(`(<button class="mi [^"]*" data-act="sk" data-arg="${s.id}"[^>]*>[\\s\\S]*?)<span class="m">(?:<span class="num [^"]*">[^<]*<\\/span> )?[^<]*<\\/span>`);
    if(!re.test(h))return;let est='';try{est=skNum(a,s)||'';}catch(e){}h=h.replace(re,(m,p1)=>p1+sr11Strip(s,est,''));});}catch(e){}return h;};}
// hero sheet: rows are matched by skill name, after sheet11.js built the tabs
{const mc0=mChar;mChar=function(id,edit){const h=mc0.apply(this,arguments);try{
  const c=G.roster[id],t=TPL[id];if(!c||!t)return h;const list=classSkills(t).concat(id==='vaelith'&&typeof archiveSkills==='function'?archiveSkills():[]),by={};list.forEach(s=>{by[s.n]=s;});
  const tp=document.createElement('template');tp.innerHTML=h;let n=0;
  const cls=t.cls,LM={};[LIMIT[cls],LIMIT2[cls]||LIMIT[cls]].forEach((L,i)=>{if(!L)return;const o=Object.assign({limit:1,mp:0,hits:1},L);if(i===0&&o.pw)o.pw=+(o.pw*(typeof LIMIT_I==='number'?LIMIT_I:.7)).toFixed(2);LM[(i?'Limit II: ':'Limit I: ')+L.n]=o;});
  tp.content.querySelectorAll('.row').forEach(r=>{const b=r.querySelector(':scope>div>b'),m=r.querySelector(':scope>span.m');if(!b||!m||m.classList.contains('sk11'))return;
    const nm=b.textContent.trim(),isL=r.classList.contains('limitr'),s=isL?LM[nm]:by[nm];if(!s)return;const lock=isL?r.classList.contains('lock'):!skillKnown(c,s);
    const w=document.createElement('template');w.innerHTML=sr11Strip(s,'',lock?(isL?(m.textContent.trim()||'Locked'):'Lv '+s.lv):'');r.replaceChild(w.content.firstChild,m);n++;});
  return n?tp.innerHTML:h;}catch(e){return h;}};}
{const st=document.createElement('style');st.textContent=
 '.mi .m.sk11,.row .m.sk11{display:flex;flex-direction:column;align-items:flex-end;gap:1px;text-align:right;white-space:nowrap;line-height:1.15}'+
 '.m.sk11 .sk11e{font-size:.78rem;font-weight:800;color:#ffd8a0;animation:none;opacity:1;transform:none;position:static}.m.sk11 .sk11e.sk11k{color:#b8c8dc;font-weight:700}'+
 '.mi .m.sk11 .sk11e{color:#ffd8a0}.m.sk11 .sk11s{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;font-size:.64rem;color:#a8d4ff}.m.sk11 .sk11s i,.m.sk11 .sk11l{font-style:normal}'+
 '.m.sk11 .sk11k{color:#c8d4e8}.m.sk11 .sk11l{font-size:.66rem;color:#e8c070;font-weight:700}.m.sk11 *{animation:none!important}';
 document.head.appendChild(st);}
