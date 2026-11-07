// ===== qready.js (v0.5.1): quests ready to hand in =====
// When a Notice Board quest or a Guild mission is complete and waiting to be claimed, a toast says so once, the Menu button and the
// Quests menu chip carry a "ready" count, and the quest rows show a "Ready to hand in" tag with where to claim it.
// New optional save field: G.qNote {key: 1} (what has already been announced; a claimed quest drops out of it). Off in the Daily Trial.
function qReadyList(){const out=[];if(!G||G.daily)return out;
  try{(G.quests||[]).forEach(q=>{if(q.state==='active'&&questReady(q))out.push({k:'q:'+q.id,t:q.title,where:'the Notice Board (Menu > Quests)',tab:'quests'});});}catch(e){}
  try{if(typeof FMIS!=='undefined'&&typeof facInit==='function'){const f=facInit();FMIS.forEach(m=>{if(f.acc[m.id]!=null&&!f.done[m.id]&&facProg(m)>=m.n)out.push({k:'m:'+m.id,t:m.t,where:'the Notice Board (Menu > Quests, Guilds)',tab:'factions'});});}}catch(e){}
  return out;}
const qReadyCount=()=>qReadyList().length;
let qrLast=0;
function qReadyCheck(){if(!G||G.daily||B||V.screen!=='world')return;const now=Date.now();if(now-qrLast<400){clearTimeout(qReadyCheck.t);qReadyCheck.t=setTimeout(qReadyCheck,450);return;}qrLast=now;
  const L=qReadyList(),N=G.qNote=G.qNote&&typeof G.qNote==='object'?G.qNote:{},live={};L.forEach(o=>live[o.k]=1);
  Object.keys(N).forEach(k=>{if(!live[k])delete N[k];});
  const fresh=L.filter(o=>!N[o.k]);if(!fresh.length)return;fresh.forEach(o=>N[o.k]=1);
  toast(fresh.length===1?`Quest ready to hand in: ${fresh[0].t}. Claim it at ${fresh[0].where}.`:`${fresh.length} quests are ready to hand in. See Menu > Quests.`);
  // v0.8.2: silent right after a battle (leaving the rewards screen made a noise); the toast still shows
  try{if(typeof sfx==='function'&&!(V.endT&&Date.now()-V.endT<5000))sfx('chest');}catch(e){}}
// the Menu button and the Quests chip carry the count; ready rows get a tag
// v0.9.5: the Quests group chip carries the total; inside the group, the Quests and Guilds tabs carry their own counts
{const mt0=menuTabsHtml;menuTabsHtml=function(grp,tab){let h=mt0.apply(this,arguments);try{const L=qReadyList(),n=L.length;if(n)h=h.replace(/(data-act="menuGrp" data-arg="quests">)Quests(<\/button>)/,`$1Quests <em class="qtag" title="Ready to hand in">${n} ready</em>$2`);
  if(grp&&grp[0]==='quests')['quests','factions'].forEach(t=>{const k=L.filter(o=>o.tab===t).length;if(k)h=h.replace(new RegExp('(data-act="menuTab" data-arg="'+t+'">)([^<]*)(</button>)'),`$1$2 <em class="qtag" title="Ready to hand in">${k}</em>$3`);});}catch(e){}return h;};}
HOOK.after('render','qready','quests ready badge on the menu button',function(){try{qReadyCheck();const n=G&&!G.daily?qReadyCount():0;
  document.querySelectorAll('[data-act="menu"]').forEach(b=>{let t=b.querySelector('.qdot');if(n&&!t){t=document.createElement('em');t.className='qdot';b.appendChild(t);}if(t){if(n){t.textContent=n;t.title=n+' ready to hand in';}else t.remove();}});}catch(e){}});// v0.9.5: the board's rows tag themselves (Ready)
try{const css=document.createElement('style');css.textContent=`.qtag{display:inline-block;font:700 .68rem/1.2 var(--fb,system-ui);font-style:normal;color:#150b17;background:#7affc8;border-radius:8px;padding:1px 6px;margin-left:4px;vertical-align:1px}
  .qdot{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:9px;background:#7affc8;color:#150b17;font:800 .7rem/18px var(--fb,system-ui);font-style:normal;text-align:center;box-shadow:0 0 0 2px #150b17;pointer-events:none}
  [data-act="menu"]{position:relative}`;document.head.appendChild(css);}catch(e){}
