// ===== comp3.js (v0.9.5): companions grow: a second skill and an evolution from the battles they win beside their hero =====
// Each companion counts the battles it wins while its hero is in the six (o.bt, an optional save field; old saves start at 0).
// At TAME.skillAt it learns a second skill (by family, in its own element). At TAME.evoAt it evolves: a new name, a bigger bonus for its
// hero and a recoloured sprite (the monster's palette pulled toward the family colour, the realm variants' repaint; no new art files).
// Progress shows in Menu > Companions, on the hero sheet and in Records > Bestiary > Taming log ("evolves after 12 more battles").
// Not in the Daily Trial (it has no companions). TAME: in config.js.
function compBt(o){return (o&&o.bt)|0;}
function compStage(o){const b=compBt(o);return b>=TAME.evoAt?2:b>=TAME.skillAt?1:0;}
function compEvoArt(art,f){const key='ev_'+art;try{if(!MART[art])return art;if(!MART[key]){const col=TAME.col[f]||'#ffd04a',k=TAME.k;
    MART[key]=g=>{const o=MART[art](g),pal={};Object.keys(o.pal).forEach(q=>{pal[q]='KEW'.includes(q)?o.pal[q]:recol(o.pal[q],col,k);});return Object.assign({},o,{pal});};
    if(MEXTRA[art])MEXTRA[key]=(g,p)=>{MEXTRA[art](g,p);Object.keys(p).forEach(q=>{if(!'KEW'.includes(q))p[q]=recol(p[q],col,k);});};
    if(BIG_ART.includes(art)&&!BIG_ART.includes(key))BIG_ART.push(key);}return key;}catch(e){return art;}}
function compSkill2(o,d){const f=compFamily(o),t=TAME.sk[f]||TAME.sk.beast,el=(d&&d.el&&d.el[0])||'earth';return [t[0],el,t[1],t[2],t[3],t[4]];}
function compEvoName(o,d){return (TAME.pre[compFamily(o)]||'Elder')+' '+((d&&d.n)||'');}
// the companion as it is now: its second skill and its evolved name and look join the monster's own data
{const cd0=compDef;compDef=function(o){const d=cd0.apply(this,arguments);try{const st=compStage(o);if(!d||!st)return d;const e=Object.assign({},d);
  e.sk=(d.sk||[]).concat([compSkill2(o,d)]);if(st>=2){e.n=compEvoName(o,d);e.art=compEvoArt(d.art,compFamily(o));e.evo=1;}return e;}catch(x){return d;}};}
{const cb0=compBonus;compBonus=function(o){return cb0.apply(this,arguments)+(compStage(o)>=2?TAME.evoBonus:0);};}
{const rt0=registerTamed;registerTamed=function(o){const r=rt0.apply(this,arguments);try{if(o&&TPL[o.id]&&compStage(o)>=2){const d=compDef(o);if(d&&d.art)TPL[o.id].art=d.art;}}catch(e){}return r;};}
// what comes next, in one line
function compNext(o){const b=compBt(o),d0=MON[o.mon]||guardianDef(o.mon),s2=compSkill2(o,d0)[0],evo=compEvoName(o,d0),pl=n=>n+' more battle'+(n===1?'':'s');
  if(b<TAME.skillAt)return `Learns ${s2} after ${pl(TAME.skillAt-b)}, evolves after ${pl(TAME.evoAt-b)}`;
  if(b<TAME.evoAt)return `Knows ${s2}. Evolves into ${evo} after ${pl(TAME.evoAt-b)}`;return `Fully grown: ${evo}, with ${s2}`;}
function compProgHtml(o){const b=compBt(o),st=compStage(o),goal=st===0?TAME.skillAt:TAME.evoAt,p=Math.min(100,Math.round(100*b/TAME.evoAt));
  return `<span class="c3prog"><b>Bond ${st}</b> · ${b} battle${b===1?'':'s'} won together · ${esc(compNext(o))}<i class="c3bar" aria-hidden="true"><i style="width:${p}%"></i></i></span>`;}
{const bt0=compBonusText;compBonusText=function(o){const h=bt0.apply(this,arguments);try{return h+`</small><small class="c3line">${compProgHtml(o)}`;}catch(e){return h;}};}
// counting: every won battle with its hero anywhere in the six
HOOK.wrap('win','comp3','companion growth (second skill, evolution)',function(next,...a){let ids=null;try{if(B&&G&&!G.daily&&(G.tamed||[]).length)ids=allParty().map(u=>u&&u.isComp&&u.owner?u.owner.id:u&&u.id).filter(Boolean);}catch(e){}
  const r=next(...a);
  try{if(ids)(G.tamed||[]).forEach(o=>{if(!o.with||!ids.includes(o.with))return;const s0=compStage(o),d0=MON[o.mon]||guardianDef(o.mon);o.bt=compBt(o)+1;const s1=compStage(o);
    if(s1>s0){if(s1===1)toast(`${o.name} learned ${compSkill2(o,d0)[0]}!`);else{toast(`${o.name} evolves into ${compEvoName(o,d0)}!`);if(TPL[o.id]){const d=compDef(o);if(d)TPL[o.id].art=d.art;}}
      if(G.roster[o.with])refresh(G.roster[o.with]);}});}catch(e){}return r;});
// Taming log: the companions you have and how far each has grown
if(typeof vTameLog==='function'){const tl0=vTameLog;vTameLog=function(){const h=tl0.apply(this,arguments);try{const L=G&&G.tamed||[];if(!L.length)return h;
  const rows=L.map(o=>{const d=compDef(o);return `<div class="row comprow"><img class="mimg" src="${monURL(d.art)}" alt=""><div class="grow"><b>${esc(o.name)}</b> <small>${esc(d.n)}</small><small>${compProgHtml(o)}</small></div></div>`;}).join('');
  return `<h4>Your pets</h4><div class="rows c3log">${rows}</div>`+h;}catch(e){return h;}};}
try{const css=document.createElement('style');css.textContent=`.c3prog{display:block;line-height:1.3}.c3bar{display:block;height:4px;margin-top:3px;background:rgba(255,255,255,.12);border-radius:2px;overflow:hidden;max-width:220px}.c3bar>i{display:block;height:100%;background:#ffd04a}`;document.head.appendChild(css);}catch(e){}
try{window.__C3={compBt,compStage,compNext,compEvoArt,compSkill2,compEvoName,get TAME(){return TAME;}};}catch(e){}
