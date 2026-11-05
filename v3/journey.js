// =================== JOURNEY TAB (Beta v0.2.0) ===================
// New save fields, all defaulted on read: G.stats.steps, G.stats.won, G.stats.fled, G.stats.lost, G.stats.play (ms).
{const ar0=arrive;arrive=function(){if(G&&G.stats)G.stats.steps=(G.stats.steps||0)+1;return ar0.apply(this,arguments);};}
{const fb0=finishBattle;finishBattle=function(how){try{if(G&&G.stats&&!G.daily){const k=how==='win'?'won':how==='fled'?'fled':how==='lose'?'lost':null;if(k)G.stats[k]=(G.stats[k]||0)+1;}}catch(e){}return fb0.apply(this,arguments);};}
// play time: counted in 15 second ticks while the page is visible and a journey is open
setInterval(()=>{try{if(G&&G.stats&&!G.daily&&document.visibilityState==='visible'&&(V.screen==='world'||V.screen==='battle'))G.stats.play=(G.stats.play||0)+15000;}catch(e){}},15000);
function agoText(t){if(!t)return 'not yet this session';const s=Math.round((Date.now()-t)/1000);if(s<10)return 'just now';if(s<60)return s+' seconds ago';const m=Math.round(s/60);if(m<60)return m+' minute'+(m===1?'':'s')+' ago';const h=Math.round(m/60);if(h<48)return h+' hour'+(h===1?'':'s')+' ago';return new Date(t).toLocaleDateString();}
function durText(ms){const m=Math.round(ms/60000);if(m<60)return m+' min';return Math.floor(m/60)+' h '+(m%60)+' min';}
function vJourney(){
  const S=G.stats||{},sc=G.cleared.slice(0,4).filter(Boolean).length,calOpen=sc>=4,just=V.savedT&&Date.now()-V.savedT<4000;
  const row=(b,s)=>`<div class="row"><div class="grow"><b>${b}</b></div><span class="m nums">${s}</span></div>`;
  return `<div class="savebar ${just?'ok':''}"><div class="grow"><b>Slot ${(META.slot||0)+1}</b><small class="nums">${just?'Saved ✓':'Last saved '+esc(agoText(G.savedAt))}</small></div><button class="btn gold" data-act="saveJ">${just?'Saved ✓':'Save now'}</button></div>
    <h4>Progress</h4><div class="rows compact">
      ${row('Scourges defeated',`${sc} of 4`)}
      ${calOpen?row('Calamity',G.cleared[4]?'Defeated':'Waiting at the end of the road'):''}
      ${row('Roster',`${Object.keys(G.roster).length} of ${ensureSub(G).length} wayfarers in this journey`)}
      ${G.run.cycle?row('New Game+',`Cycle ${G.run.cycle}`):''}</div>
    <h4>Time</h4><div class="rows compact">
      ${row('Journey started',G.stats&&S.start?new Date(S.start).toLocaleDateString():'?')}
      ${row('Play time',S.play?durText(S.play):'Counting from now')}
      ${row('Days on the road',Math.max(1,Math.ceil((Date.now()-(S.start||Date.now()))/86400000)))}</div>
    <h4>Battles</h4><div class="rows compact">
      ${row('Fought',fmt(S.battles||0))}
      ${S.won||S.fled||S.lost?row('Won · fled · lost',`${fmt(S.won||0)} · ${fmt(S.fled||0)} · ${fmt(S.lost||0)}`):''}</div>
    <h4>Exploration</h4><div class="rows compact">
      ${row('Steps walked',fmt(S.steps||0))}
      ${row('Places visited',Object.keys(G.been||{}).length||'?')}</div>
    <div class="btnrow"><button class="btn" data-act="exportOpen">Export save</button>${G.won&&!G.legacyChosen?'<button class="btn gold" data-act="pickLegacy">Choose a Legacy</button>':''}${G.won?'<button class="btn" data-act="startNG">Begin New Game+</button>':''}<button class="btn" data-act="toTitle">Quit to title</button></div>
    <p class="note">The game also saves on its own when you rest, travel and finish fights.</p>`;
}
ACT.saveJ=function(){if(saveGame()){V.savedT=Date.now();sfx('chest');toast('Journey saved to slot '+((META.slot||0)+1)+'.');}else toast('Saving is not available here.');render();setTimeout(()=>{if(V.modal&&V.modal.type==='menu'&&V.modal.tab==='system')render();},4100);};
