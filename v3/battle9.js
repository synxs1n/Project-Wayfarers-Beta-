// ===== battle9.js (v0.12.13): one Summon command, and the command panel's order =====
// "Summon" is one button in the second command row. It covers the hero's pet (comp.js canSummon / ACT.summon) and the Sanctum guardians a
// Priest Invokes or a Monk Spirit Calls (summon8.js sumCan / sumAsk). With one choice it fires at once; with more, a chooser lists the pet
// first, then the guardians (the summons menu from summon8.js). Runs after summon8.js and comp.js in MODS.
function sumChoices(a){const out=[];try{if(typeof canSummon==='function'&&canSummon(a))out.push({k:'pet',n:compOf(a).name,act:'summon',arg:''});}catch(e){}
  try{if(typeof sumCan==='function'&&sumCan(a))sumList().forEach(o=>out.push({k:'guard',n:o.name,act:'sumPick',arg:o.mon,monk:sumClassOf(a)==='monk'}));}catch(e){}return out;}
{const ch0=cmdHtml;cmdHtml=function(){let h=ch0.apply(this,arguments);try{const a=B&&B.cur;if(!a||B.mode!=='cmd')return h;
  if(B.menu==='root'){const C=sumChoices(a);
    // drop the two old buttons, add the one
    h=h.replace(/<button class="mi summon"[^>]*data-act="summon"[^>]*>[\s\S]*?<\/button>/,'').replace(/<button class="mi summon s8"[^>]*data-act="sumAsk"[^>]*>[\s\S]*?<\/button>/,'');
    if(C.length){const one=C.length===1?C[0]:null,lab=one?(one.k==='pet'?`Summon <small>${esc(one.n)}</small>`:(one.monk?'Summon <small>Spirit Call</small>':'Summon <small>Invoke</small>')):`Summon <small>${C.length} choices</small>`;
      const tip=one?(one.k==='pet'?'Your pet fights in this hero\'s place for a few turns':one.monk?'Call a lesser guardian to take your place after two turns of stillness':'Pray for a Sanctum guardian: next turn it takes the field in place of the Vanguard'):'Your pet, or a Sanctum guardian';
      h=h.replace('<div class="menu sec">',`<div class="menu sec"><button class="mi summon b9sum" data-act="sumOne" title="${esc(tip)}">${lab}</button>`);}}
  else if(B.menu==='summons'){const C=sumChoices(a).filter(c=>c.k==='pet');if(C.length){const i=h.indexOf('<div class="menu');const row=`<div class="menu list b9pets">${C.map(c=>`<button class="mi summon" data-act="summon"><span class="n">Pet: ${esc(c.n)}</span><small>Fights in ${esc(a.name)}'s place for a few turns.</small></button>`).join('')}</div>`;
    h=i>=0?h.slice(0,i)+row+h.slice(i):h+row;}}}catch(e){}return h;};}
ACT.sumOne=function(){if(!B||B.mode!=='cmd'||!B.cur)return;const C=sumChoices(B.cur);if(!C.length)return;
  if(C.length===1){const c=C[0];if(c.k==='pet')return ACT.summon();return ACT.sumPick(c.arg);}
  if(C.some(c=>c.k==='guard')){B.menu='summons';render();return;}ACT.summon();};
{const st=document.createElement('style');st.textContent='.battle.b3 .mi.b9sum{overflow:hidden}.battle.b3 .mi.b9sum small{display:block;font-size:.58em;opacity:.8;font-weight:600;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:0}';/* v0.12.13: a long pet name is clipped with an ellipsis on the 344 px cover screen, never pushed out of the button */document.head.appendChild(st);}
