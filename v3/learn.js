// ===== learn.js (v0.3.2): new skill notices =====
// G.skSeen {hero: [skill ids already announced]} and G.skNew {hero: [skill ids not viewed yet]} are new optional fields.
// A hero seen for the first time (old save, new recruit) is recorded silently, so nothing old is announced as new.
function skIdsOf(c){try{return known(c).map(s=>s.id||s.n);}catch(e){return [];}}
function skById(c,id){return known(c).find(s=>(s.id||s.n)===id);}
function learnScan(c){if(!G||G.daily||!c||!TPL[c.id])return [];G.skSeen=G.skSeen||{};G.skNew=G.skNew||{};const now=skIdsOf(c);
  if(!G.skSeen[c.id]){G.skSeen[c.id]=now;return [];}
  const seen=new Set(G.skSeen[c.id]),add=now.filter(id=>!seen.has(id));if(!add.length)return [];
  G.skSeen[c.id]=G.skSeen[c.id].concat(add);G.skNew[c.id]=(G.skNew[c.id]||[]).concat(add.filter(id=>!(G.skNew[c.id]||[]).includes(id)));
  return add.map(id=>({hero:c.id,name:c.name,sk:skById(c,id)})).filter(o=>o.sk);}
function learnScanAll(){if(!G)return [];return Object.values(G.roster).flatMap(learnScan);}
function learnTag(s){const els=skEls(s);return `${els.map(ico).join('')}${roleTag(s)}`;}
function learnLine(o){return `<b>${esc(o.name)} learned ${esc(o.sk.n)}!</b> <span class="lrn">${learnTag(o.sk)}</span>`;}
// heroes already on the roster are recorded when a save loads or a journey starts
{const up0=unpackG;unpackG=function(){const g=up0.apply(this,arguments);try{const G0=G;G=g;Object.values(g.roster).forEach(c=>{g.skSeen=g.skSeen||{};if(!g.skSeen[c.id])learnScan(c);});G=G0;}catch(e){}return g;};}
// battle results: one line per new skill, under the level ups
HOOK.after('win','learn','new skills on the result',function(){try{const L=learnScanAll();if(L.length&&V.modal&&V.modal.info){V.modal.info.learn=(V.modal.info.learn||[]).concat(L);render();}else if(L.length)lnQueue(L);}catch(e){}});
// outside battle (Archive moves, quest XP, recruits growing into skills): a small queued notice, tap to dismiss, never blocks
const LNQ=[];let lnT=null;
function lnQueue(L){L.forEach(o=>LNQ.push(o));lnShow();}
function lnShow(){let el=document.getElementById('lnq');if(!el){el=document.createElement('div');el.id='lnq';el.setAttribute('role','status');document.body.appendChild(el);
    el.addEventListener('click',e=>{const b=e.target.closest('.lnn');if(b){b.remove();clearTimeout(lnT);lnT=null;lnShow();}});}
  if(el.children.length||!LNQ.length)return;const o=LNQ.shift();const d=document.createElement('button');d.className='lnn';d.innerHTML=learnLine(o)+'<small>Tap to dismiss</small>';el.appendChild(d);
  if(typeof sfx==='function')sfx('blip');lnT=setTimeout(()=>{d.remove();lnT=null;lnShow();},4200);}
let lnLast=0;
HOOK.after('render','learn','queue new skill notices',function(){try{const now=Date.now();if(G&&!B&&!G.daily&&now-lnLast>400&&!(V.modal&&V.modal.type==='result')){lnLast=now;const L=learnScanAll();if(L.length)lnQueue(L);}
  if(!(V.modal&&(V.modal.type==='char'||(V.modal.type==='guild'&&V.modal.char))))V._skShown={};}catch(e){}});
// the hero sheet: "New" badges until the sheet has been opened
{const mc0=mChar;mChar=function(id,edit){V._skShown=V._skShown||{};if(G&&G.skNew&&G.skNew[id]&&G.skNew[id].length&&!V._skShown[id]){V._skShown[id]=G.skNew[id].slice();delete G.skNew[id];}
  let h=mc0.apply(this,arguments);const ids=V._skShown[id];if(!ids||!ids.length||!G.roster[id])return h;const c=G.roster[id],i=h.indexOf('<h4>Skills</h4>');if(i<0)return h;
  let tail=h.slice(i);ids.forEach(sid=>{const s=skById(c,sid);if(!s)return;const k=esc(s.n)+'</b>';const j=tail.indexOf(k);if(j>=0)tail=tail.slice(0,j)+esc(s.n)+' <em class="newb">New</em></b>'+tail.slice(j+k.length);});return h.slice(0,i)+tail;};}
