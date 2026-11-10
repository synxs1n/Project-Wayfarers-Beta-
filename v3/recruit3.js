// ===== recruit3.js (v0.10.2): a wayfarer met in the wild asks where to stand =====
// When a hero joins outside town (a fortress cell, a chance meeting, a claimed challenge) and the six are full, they used to go
// straight to the reserves with a toast. Now a popup follows the message: the hero's class and elements, a View sheet button (the
// full sheet, back comes here), one Swap button per party member (that hero steps out to the reserves, right here in the wild) and
// Keep in reserves. State: G.pendRecruit (optional save field, cleared when answered), so a reload still asks.
HOOK.wrap('recruit','recruit3','ask where a wild recruit stands',function(next,...args){const [id,free]=args;const was=G&&G.party&&G.party.includes(id);const ok=next(...args);
  try{if(ok&&free&&G&&!G.daily&&!was&&!G.party.includes(id)&&G.roster[id])G.pendRecruit=id;}catch(e){}return ok;});
function r3Ask(){try{if(!G||!G.pendRecruit||V.screen!=='world'||V.modal||(typeof WS!=='undefined'&&(WS.dlg||WS.lock)))return false;
  if(!G.roster[G.pendRecruit]){G.pendRecruit=null;return false;}V.modal={type:'recruitAsk',hero:G.pendRecruit};return true;}catch(e){return false;}}
HOOK.after('render','recruit3','ask where a wild recruit stands',function(){try{if(r3Ask()){if(typeof later==='function')later(render,0);else setTimeout(render,0);}}catch(e){}});
function mRecruitAsk(m){const id=m.hero,t=TPL[id],c=G.roster[id],cls=CLS[t.cls]||{n:t.cls,role:''};
  const rows=G.party.map((pid,i)=>{const p=G.roster[pid];if(!p)return '';return `<div class="row"><div class="pbig">${port(pid,'sm')}</div><div class="grow"><b>${esc(p.name)}</b><small>Lv ${p.lv} ${esc((CLS[TPL[pid].cls]||{}).n||'')} <span style="white-space:nowrap">${((p.el||TPL[pid].el)||[]).map(ico).join('')}</span><br>${i<3?'Vanguard':'Rearguard'}</small></div><button class="btn sm" data-act="recruitSwap" data-arg="${i}">Swap in</button></div>`;}).join('');
  return box(`${esc(t.n)} joins you`,`<div class="bdet"><div class="bimg">${port(id,'big')}</div><div class="grow"><div class="els">${elChips(t.el)}</div><p class="note"><b>${esc(cls.n)}, level ${c.lv}.</b> ${esc(cls.role||'')}</p><p class="note">Your six are full. ${esc(t.n)} can take someone's place now, or wait in the reserves.</p><div class="btnrow"><button class="btn" data-act="recruitSheet">View sheet</button></div></div></div><div class="rows">${rows}</div>`,
    `<button class="btn gold" data-act="recruitKeep">Keep in reserves</button>`);}
HOOK.before('vModal','recruit3','wild recruit popup',function(m){if(m&&m.type==='recruitAsk')return HOOK.stop(mRecruitAsk(m));});
Object.assign(ACT,{
  recruitSheet(){const m=V.modal;if(!m||m.type!=='recruitAsk')return;V.modal={type:'char',char:m.hero,gear:null,list:[m.hero],recruitAsk:m.hero};render();},
  recruitSwap(a){const m=V.modal;if(!m||m.type!=='recruitAsk')return;const i=+a,id=m.hero,out=G.party[i];if(!G.roster[id]||out==null)return;
    G.party[i]=id;G.pendRecruit=null;try{if(typeof calcStats==='function'){const c=G.roster[id];c.S=calcStats(c);}}catch(e){}saveGame();V.modal=null;
    toast(`${TPL[id].n} steps in for ${G.roster[out]?G.roster[out].name:'a hero'}.`);if(typeof sfx==='function')sfx('level');render();},
  recruitKeep(){const m=V.modal;if(m&&m.type==='recruitAsk'){G.pendRecruit=null;saveGame();}V.modal=null;render();}});
HOOK.before('modalBack','recruit3','recruit prompt popup goes back to the ask',function(m){if(m&&m.type==='char'&&m.recruitAsk&&!m.gear)return HOOK.stop(()=>{V.modal={type:'recruitAsk',hero:m.recruitAsk};});});
// the toast for a reserve recruit no longer says to visit town first
