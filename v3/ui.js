// ===== ui.js (base): render(), screens, battle view, modals (vModal), ACT actions, main loop and input, boot() =====
// =================== UI ===================
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const $=id=>document.getElementById(id);
const ico=k=>`<img class="ico" src="${iconURL(k)}" alt="${EL[k]}">`;
const elChips=arr=>arr.map(k=>`<span class="el" style="--c:${ELC[k]}">${ico(k)}${EL[k]}</span>`).join('');
const bar=(v,m,c)=>`<span class="bar" style="--c:${c}"><i style="width:${m?clamp(v/m*100,0,100):0}%"></i></span>`;
const coin=()=>`<img class="ico coin" src="${coinURL()}" alt="">`;
const sellVal=g=>Math.round((g.price0||g.price)*.4);
const port=(id,cls)=>`<span class="port ${cls||''} ${TPL[id]&&TPL[id].mon?'mon':''}"><img src="${heroURL(id)}" alt="">${typeof ailBadge==='function'&&!/noail/.test(cls||'')?ailBadge(id):''}</span>`;
// v0.3.5 2.4: legendary stamp = gold seal + LEGENDARY banner, used on the sheet, roster card, codex entry and battle detail panel
// v0.6.3: "Legendary" belongs only to the legend heroes with their own legend quests (LEGEND_IDS). Rare tavern visitors (src r*),
// Scourge gifts (g*) and the special Archive hero (x) are tagged "Epic" instead (isEpic, epicTag; styles in party3.js).
const isLeg=id=>!!(TPL[id]&&LEGEND_IDS.includes(id));
const isEpic=id=>!!(TPL[id]&&!isLeg(id)&&!TPL[id].mon&&EPIC_IDS.includes(id));
const epicTag=()=>'<span class="epictag">EPIC</span>';
// dual type marker: a two-tone strip in the two element colours (the purple border is Epic only)
const dualStyle=t=>t&&t.el&&t.el.length?`style="--d1:${ELC[t.el[0]]||'#c8a050'};--d2:${ELC[t.el[t.el.length>1?1:0]]||'#7a8ac0'}"`:'';
const heroTag=id=>isLeg(id)?legSeal(1)+'<span class="legtag">LEGENDARY</span>':isEpic(id)?epicTag():'';
const legSeal=(sm)=>`<span class="legseal ${sm?'sm':''}" role="img" aria-label="Legendary"><svg viewBox="0 0 32 32" width="100%" height="100%" shape-rendering="crispEdges"><path d="M16 1l3 3 4-1 2 4 4 1-1 4 3 3-3 3 1 4-4 1-2 4-4-1-3 3-3-3-4 1-2-4-4-1 1-4-3-3 3-3-1-4 4-1 2-4 4 1z" fill="#150b17"/><path d="M16 3l2.5 2.5 3.5-.8 1.7 3.3 3.5.9-.8 3.5 2.6 2.6-2.6 2.6.8 3.5-3.5.9-1.7 3.3-3.5-.8L16 29l-2.5-2.5-3.5.8-1.7-3.3-3.5-.9.8-3.5L2.9 16l2.6-2.6-.8-3.5 3.5-.9 1.7-3.3 3.5.8z" fill="#f0b848"/><circle cx="16" cy="16" r="9" fill="#a8741a"/><circle cx="16" cy="16" r="7.4" fill="#ffd96a"/><path d="M16 9.5l1.9 4.1 4.4.5-3.3 3 .9 4.4-3.9-2.2-3.9 2.2.9-4.4-3.3-3 4.4-.5z" fill="#8a4be0" stroke="#150b17" stroke-width=".6"/></svg></span>`;
const legBanner=()=>`<span class="legban">★ LEGENDARY ★</span>`;
// v0.3.5 3.2: nature block for the hero sheet, and the pool line for cards/codex
const natPoolText=id=>{const P=natPool(id);if(P.length<2){const k=P[0]||TPL[id].trait;return `Nature: ${esc(natInfo(k).n)}, ${esc(natInfo(k).d)}`;}return `Nature pool: ${P.map(k=>esc(natInfo(k).n)).join(', ')}`;};
function natBlock(id,c){const k=natOf(c),I=natInfo(k),P=natPool(id),legacy=P.indexOf(k)<0;
  return `<span class="trait natb"><b>Nature: ${esc(I.n)}</b>${legacy?' <em class="cyc">Legacy</em>':''}<small>${esc(I.d)}</small>${P.length>1?`<span class="natpool">${P.map(p=>`<i class="${p===k?'cur':''}" title="${esc(natInfo(p).d)}">${esc(natInfo(p).n)}</i>`).join('')}</span><small>Change it at the Guild Hall, Nature tab.</small>`:'<small>Fixed nature.</small>'}</span>`;}
// v0.10.8: Settings > Skill tags (META.cfg.skTags 'sym' = symbols only; Full when missing, as before v0.10.4)
function skTagsFull(){try{return META.cfg.skTags!=='sym';}catch(e){return true;}}
// v0.10.9: what a skill is mainly for, read from its data (k, fx, t, cleanse, summon), never set by hand. One tag per skill.
const PURPOSE={dmg:'Damage',heal:'Heal',buff:'Buff',debuff:'Debuff',cure:'Cure',revive:'Revive',guard:'Guard',taunt:'Taunt',summon:'Summon'};
function skPurpose(s){if(!s)return null;const fx=(s.fx||[]).map(f=>f[0]),bad=k=>typeof STS!=='undefined'&&STS[k]&&STS[k].bad;
  if(s.summon)return 'summon';if(s.k==='revive'||s.t==='dead')return 'revive';if(s.k==='heal')return 'heal';
  if(s.k==='phys'||s.k==='mag')return 'dmg';if(s.cleanse&&!fx.length)return 'cure';
  if(fx.includes('taunt'))return 'taunt';if(fx.some(k=>k==='bulwark'||k==='ward'||k==='guard'))return 'guard';
  if(s.cleanse)return 'cure';if(s.k==='mpself')return 'buff';
  const foe=s.t==='one'||s.t==='all'||s.t==='rand'||s.t==='chain';if(foe&&fx.some(bad))return 'debuff';if(fx.length&&!fx.every(bad))return 'buff';return fx.length?'debuff':null;}
const purposeTag=s=>{const p=skPurpose(s);return p?`<em class="pur ${p}" title="Mainly for: ${PURPOSE[p]}">${PURPOSE[p]}</em>`:'';};
const roleTag=s=>{const r=s.role&&skEls(s).length?`<em class="role ${s.role}" title="${s.role==='primer'?'Primes a foe with its element for 2 turns. A matching Detonator sets off a reaction.':'Sets off a reaction on a foe Primed with a matching element.'}">${skTagsFull()?(s.role==='primer'?'⟐ Primer':'✸ Detonator'):(s.role==='primer'?'⟐':'✸')}</em>`:'';
  // v0.4.0 2.4: every damaging and healing skill shows how it is delivered (Slash, Blunt, Piercing, Ranged, Magic, Heal)
  const d=typeof dlChip==='function'&&(s.k==='phys'||s.k==='mag'||s.k==='heal'||s.k==='revive')?dlChip(s,(B&&B.mode==='cmd'&&B.cur&&TPL[B.cur.id])?TPL[B.cur.id].cls:null):'';return purposeTag(s)+d+r;};
// v0.4.3: a visible note on every detonator: which primed elements it sets off, and the reaction
// v0.4.3: in battle, a detonator shows a hint only when it can set off a foe that is Primed right now
const detLive=s=>{try{if(!s||s.role!=='det'||!B)return '';const els=skEls(s),hit=B.en.filter(e=>e.hp>0&&e.primed&&els.some(x=>reactFor(e.primed.el,x)));if(!hit.length)return '';const R=reactFor(hit[0].primed.el,els.find(x=>reactFor(hit[0].primed.el,x)));return `<small class="detn">✸ Can set off ${esc(R.n)} on ${esc(hit[0].name)}${hit.length>1?` (+${hit.length-1} more)`:''}</small>`;}catch(e){return '';}};
const detNote=s=>{if(!s||s.role!=='det')return '';const els=skEls(s),L=Object.values(REACT_V).filter(R=>els.includes(R.d));if(!L.length)return '';// v0.7.7: symbols only (the owner's call): ✸ then the primed elements it sets off; the words live in the tooltip
  return `<small class="detn sym" title="Sets off: ${L.map(R=>`${EL[R.p]} primed: ${R.n} x${R.m}`).join(', ')}" aria-label="Detonates ${L.map(R=>EL[R.p]).join(', ')}">✸ ${[...new Set(L.map(R=>R.p))].map(p=>ico(p)).join('')}</small>`;};
// v0.3.5 2.1: does the skill being aimed set off this foe's prime?
const detHits=(sk,e)=>!!(sk&&sk.role==='det'&&e&&e.primed&&e.hp>0&&skEls(sk).some(x=>reactFor(e.primed.el,x)));
const matChips=m=>Object.keys(m).filter(k=>m[k]).map(k=>`<span class="matc ${(G.mats[k]||0)>=m[k]?'':'short'}" style="--mc:${(MAT_OF[k]||{}).c||'#c4b28c'}"><i></i>${MATS[k]} <b class="nums">${G.mats[k]||0}/${m[k]}</b></span>`).join(' ');
function toast(m){const t=$('toast');if(!t)return;t.textContent=m;t.className='show';clearTimeout(toast.h);toast.h=setTimeout(()=>{t.className='';},2400);}
// v0.3.5: one line saying what the equipped weapon type does to this skill (empty when it does nothing)
function perkNote(u,s){const S=u&&u.S;if(!S||!S.wp||!WPERK[S.wp])return '';const ph=s.k==='phys',mg=s.k==='mag',bad=(s.fx||[]).some(([k])=>STS[k]&&STS[k].bad),good=(s.fx||[]).some(([k])=>STS[k]&&!STS[k].bad)||s.k==='buff'||s.k==='status',P=[];
  if(S.pierce&&ph)P.push(`ignores ${Math.round(S.pierce*100)}% DEF`);if(S.heavy&&ph)P.push(`+${Math.round(S.heavy*100)}% damage`);if(S.charge&&ph)P.push(`+${Math.round(S.charge*100)}% vs foes that already acted`);
  if(S.cleave&&s.t==='all'&&(ph||mg))P.push(`+${Math.round(S.cleave*100)}% on all foes`);if(S.spellPow&&mg)P.push(`+${Math.round(S.spellPow*100)}% spell power`);
  if(S.combo&&ph&&((s.hits||1)>1||s.id==='attack'))P.push(`${Math.round(S.combo*100)}% extra hit`);if(S.basicStun&&s.id==='attack')P.push(`${Math.round(S.basicStun*100)}% stun`);
  if(S.stun&&(s.fx||[]).some(([k])=>k==='stun'))P.push('stun +50%');if(S.status&&bad)P.push('ailments +25%');if(S.debT&&bad)P.push('+1 turn');if(S.buffT&&good)P.push('+1 turn');if(S.healUp&&s.k==='heal')P.push(`+${Math.round(S.healUp*100)}% healing`);
  return P.length?`<small class="wperk">${esc(WT_NAME[S.wp]||'')}: ${esc(P.join(', '))}</small>`:'';}
function sigLine(id){const s=SIG[id];return s?`<p class="sig"><span class="sigb">Signature</span><b>${esc(s.n)}</b><small>${esc(s.d)}</small></p>`:'';}
function masteryLine(id){const t=TPL[id];if(t.el.length===1){const M=MASTERY[t.el[0]];return `<span class="mast">${M.n}</span> <small>${M.d}</small>`;}const c=COMBO[comboKey(t.el)];return `<span class="mast dual">Dual art: ${c.n}</span> <small>${c.d}</small>`;}
function realmLabel(s){return `${ORD[s]} realm`;}

// ----- screen skeletons -----

// ===== Beta v0.4.1 5.4: the title scene changes on load and on a slow timer =====
const TITLE_THEMES=['meadow','coast','cave','snow','heights','void'],TITLE_WX=[null,null,'rain','snow','fog'],TITLE_EVERY=16000,TITLE_FADE=1200;
const TTS={scene:null,prev:null,t0:0,next:0};
function titlePool(){const o=STARTERS.slice();try{(META.legacy||[]).forEach(id=>{if(TPL[id]&&!o.includes(id))o.push(id);});}catch(e){}return o;}
function titleMake(avoid){const pool=titlePool().slice(),ids=[];while(ids.length<6&&pool.length)ids.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
  let th=TITLE_THEMES[Math.floor(Math.random()*TITLE_THEMES.length)];if(avoid&&TITLE_THEMES.length>1)while(th===avoid.theme)th=TITLE_THEMES[Math.floor(Math.random()*TITLE_THEMES.length)];
  let wx=TITLE_WX[Math.floor(Math.random()*TITLE_WX.length)];if(wx==='snow'&&th!=='snow'&&Math.random()<.5)wx=null;if(wx==='fog'&&typeof WEATHER!=='undefined'&&!WEATHER.fog)wx=null;
  return {ids,theme:th,wx};}
function titleScene(){if(!TTS.scene){TTS.scene=titleMake();TTS.t0=0;}return TTS.scene;}
function titleAdvance(now){TTS.prev=TTS.scene;TTS.scene=titleMake(TTS.prev);TTS.t0=now;TTS.next=now+TITLE_EVERY;
  const L=document.querySelector('.lineup');if(!L)return;const rm=typeof reducedMotion==='function'&&reducedMotion();
  const swap=()=>{L.innerHTML=TTS.scene.ids.map((id,i)=>`<img src="${heroURL(id)}" style="--d:${i*.17}s" alt="">`).join('');L.style.opacity=1;};
  if(rm){swap();TTS.prev=null;}else{L.style.transition='opacity '+(TITLE_FADE/2)+'ms';L.style.opacity=0;setTimeout(swap,TITLE_FADE/2);}}
function titleDraw(ctx,W,H,now){
  if(!TTS.next)TTS.next=now+TITLE_EVERY;if(now>=TTS.next&&!document.hidden)titleAdvance(now);
  const sc=TTS.scene,rm=typeof reducedMotion==='function'&&reducedMotion();
  const paint=(s,a)=>{ctx.globalAlpha=a;ctx.drawImage(bgStatic(s.theme,W,H),0,0);if(!rm)bgAnim(ctx,s.theme,W,H,now);if(s.wx&&typeof weatherFX==='function')weatherFX(ctx,s.wx,W,H,rm?0:now,false);ctx.globalAlpha=1;};
  const k=TTS.prev?Math.min(1,(now-TTS.t0)/TITLE_FADE):1;
  if(TTS.prev&&k<1&&!rm){paint(TTS.prev,1);paint(sc,k);}else{TTS.prev=null;paint(sc,1);}
}
let BUILT=null;
function buildScreen(){
  const s=V.screen,scr=$('screen');BUILT=s;scr.className='screen s-'+s;
  if(s==='title'){
    const leg=(META.legacy||[]).filter(id=>TPL[id]);
    scr.innerHTML=`<section class="title"><div class="tstage"><canvas id="tcv"></canvas><div class="lineup">${titleScene().ids.map((id,i)=>`<img src="${heroURL(id)}" style="--d:${i*.17}s" alt="">`).join('')}</div></div>
      <p class="pre">Project</p><h1 class="logo">Aurelis</h1><p class="sub">Wayfarers</p>
      <p class="tagline">${RAW.length} wayfarers. Five realms per journey, drawn from sixteen. Twelve Scourges, four Calamities. Every run is different.</p><p class="ver">${esc(GAME_VERSION)}</p>
      ${(()=>{/* v0.6.0: Continue first when there are saves, then New Journey and the Daily Trial; Settings and Help in a small row; save tools grouped */
        const has=[0,1,2].some(s=>slotState(s)!=='empty'),nj=META.cycles?'New Journey (NG+ '+META.cycles+')':'New Journey';
        return `<div class="tmenu"><div class="tmain">${has?'<button class="btn gold tbig" data-act="slots">Continue</button>':''}<button class="btn ${has?'':'gold tbig'}" data-act="new">${nj}</button><button class="btn daily" data-act="daily">Daily Trial</button></div>
        <div class="tmore"><button class="btn sm" data-act="settings">Settings</button><button class="btn sm" data-act="fbOpen">Help / Feedback</button></div>
        <details class="ttools"><summary>Saves and codes</summary><div class="tmore"><button class="btn sm" data-act="importOpen">Import save</button><button class="btn sm" data-act="recoverOpen">Recover saves</button><button class="btn sm" data-act="redeemOpen">Redeem code</button></div></details></div>`;})()}${svTitleNote()}
      ${leg.length?`<div class="legacy"><h3>Legacy heroes</h3><p class="note">Bring up to two of them on each new journey. They join at level 5 with veteran stats.</p><div class="els">${leg.map(id=>port(id,'sm')+`<b>${TPL[id].n}</b>`).join(' ')}</div></div>`:''}
      <ul class="pitch"><li>Each journey: five realms, four Scourges drawn from twelve, and one of four Calamities at the end.</li><li>Mark a foe with one element, hit it with another: Melt, Conduct, Eclipse and 53 more reactions.</li><li>Break a Scourge's or Calamity's shield by hitting its weaknesses, then pile on.</li><li>Bonds, Limit Breaks, bounties, an arena, tempering and a legacy hero you keep forever.</li></ul></section>`;
  }else if(s==='starter'){scr.innerHTML='<div id="starterBox"></div>';}
  else if(s==='world'){
    scr.innerHTML=`<div class="world"><div class="wview"><canvas id="wcv"></canvas><div id="wloc" class="wloc"></div><div id="wdlg"></div></div>
      <div class="wbar"><div class="wkeys">${kmMoveLabel()} to walk, ${kmLabel('run')} to run. ${kmLabel('interact',1)} to talk or open. ${kmLabel('menu')} for menu, ${kmLabel('map')} for the map. Click the map to walk there.</div><div class="btnrow"><span id="wkw"></span><button class="btn sm ${WS.run?'gold':''}" data-act="runT" id="runb">Run</button><button class="btn sm" data-act="map" aria-label="Open the map (${kmLabel('map')})">Map</button><button class="btn sm" data-act="menu">Menu</button></div></div>
      <div class="pad" id="pad"><div class="joy" id="joy" aria-label="Movement stick"><i class="ja u">▲</i><i class="ja d">▼</i><i class="ja l">◀</i><i class="ja r">▶</i><span class="knob" id="knob"></span></div>
      <div class="abtns"><button class="abtn b" data-act="runT" aria-label="Run">B</button><button class="abtn" data-act="talk" aria-label="Talk">A</button></div></div></div>`;
    WS.cv=$('wcv');WS.ctx=WS.cv.getContext('2d');worldSizeCanvas();
  }else if(s==='battle'){
    // v0.6.3: the last log line and the Log button live in a ticker under the stage (nothing of the HUD sits on the scene's corners any more)
    scr.innerHTML=`<section class="battle b3"><div class="bossbar" id="bbossbar"></div><div class="order" id="border"></div>
      <div class="bwrap" id="bwrap"><canvas id="bcv"></canvas><div class="bstage" id="bstage"></div><div class="bban" id="bban"></div><div id="bover"></div></div>
      <div class="bline" id="bline"><div class="blog" id="blog"></div><button class="blogbtn" data-act="blogT" aria-label="Open the battle log">📜 Log</button></div>
      <div class="bbottom"><div class="cmd" id="bcmd"></div><div class="bparty" id="bparty"></div></div></section>`;
    layoutBattle();
  }
}

// ----- render -----
// v5.0: every popup gets a close X that stays pinned to the top corner while the panel scrolls
function pathOf(e,root){const p=[];while(e&&e!==root){const par=e.parentNode;p.unshift([...par.children].indexOf(e));e=par;}return p;}
function byPath(p,root){let e=root;for(const i of p){e=e&&e.children[i];}return e||null;}
function render(){
  if(!$('screen'))return;
  const fresh=BUILT!==V.screen;if(fresh)buildScreen();
  $('hdr').innerHTML=vHeader();
  // v0.5.0 1.2: size the world view again once the header for this screen is in place (it was sized against the battle header), and once more after layout settles
  if(fresh&&(V.screen==='world'||V.screen==='battle')){try{if(scrollY||scrollX)window.scrollTo(0,0);}catch(e){}}
  if(fresh&&V.screen==='world'){worldSizeCanvas();requestAnimationFrame(()=>{if(V.screen==='world')worldSizeCanvas();});}
  if(V.screen==='starter')$('starterBox').innerHTML=vStarter();
  if(V.screen==='world')renderWorldUI();
  if(V.screen==='battle'&&B)renderBattle();
  const m=V.modal,mod=$('modal');
  const html=m?withClose(vModal(m)):'';
  // Beta v0.3.1: only touch the DOM when the markup really changed, and keep scroll and focus when the same popup re-renders
  // (spending stat points, picking gear, buying). The old check compared against the browser's re-serialized HTML,
  // which never matched, so every render rebuilt the popup and jumped it back to the top.
  if(html!==V._mHtml||!m){
    const key=m?[m.type,m.char||'',m.tab||'',m.k||'',m.gear?'g':''].join('|'):'',same=key&&key===V._mKey;
    const sc=same?[...mod.querySelectorAll('.panel,.panel *')].filter(e=>e.scrollTop>0).map(e=>[pathOf(e,mod),e.scrollTop]):[];
    const fa=document.activeElement,fk=same&&fa&&mod.contains(fa)&&fa.dataset?[fa.dataset.act,fa.dataset.arg]:null;
    mod.innerHTML=html;V._mHtml=html;V._mKey=key;
    sc.forEach(([p,t])=>{const e=byPath(p,mod);if(e)e.scrollTop=t;});
    if(fk&&fk[0]){const e=[...mod.querySelectorAll('[data-act]')].find(x=>x.dataset.act===fk[0]&&(x.dataset.arg||'')===(fk[1]||''));if(e&&!e.disabled)e.focus({preventScroll:true});}
  }
  document.body.classList.toggle('noscroll',!!m);
  musicSync();
}
render=HOOK.def('render',render);// v0.9.9: one definition; modules add hooks (hooks.js, docs/v099-hooks.md)
function musicSync(){
  if(V.screen==='title'||V.screen==='starter')return playMusic('title');
  if(V.screen==='battle'&&B){if(V.modal&&V.modal.type==='result')return playMusic('victory');return playMusic(B.boss||B.en.some(e=>e.elite)?'boss':'battle');}
  if(V.screen==='world'&&WS.m)playMusic(musicFor());
}
function muteBtn(){return `<button class="btn sm" data-act="mute" aria-label="${META.cfg.mute?'Unmute':'Mute'}" title="${META.cfg.mute?'Unmute':'Mute'} (${kmLabel('mute')})">${META.cfg.mute?'🔇':'🔊'}</button>`;}
function vHeader(){
  if(V.screen==='title'||V.screen==='starter'||!G)return `<div class="hdr"><div class="brand"><b>Aurelis</b></div><div class="btnrow">${muteBtn()}<button class="btn sm" data-act="fbOpen" aria-label="Help and feedback">?</button><button class="btn sm" data-act="settings" aria-label="Settings">⚙</button></div></div>`;
  const loc=V.screen==='battle'&&B?(B.spec.kind==='arena'?'The Arena':ZS(B.stage).n):WS.m?locName(WS.m):'';
  const cyc=G.run.cycle?`<span class="cyc">NG+${G.run.cycle}</span>`:'';
  return `<div class="hdr"><div class="brand"><b>Aurelis</b><small>${esc(loc)}</small>${cyc}</div><div class="btnrow"><div class="wallet">${coin()}<b>${fmt(G.gold)}</b></div>${muteBtn()}<button class="btn sm" data-act="fbOpen" aria-label="Help and feedback">?</button><button class="btn sm" data-act="settings" aria-label="Settings">⚙</button></div></div>`;
}
function wkwUpdate(){
  const wk=$('wkw');if(!wk||!G)return;const m=WS.m,indoor=typeof mapIndoor==='function'?mapIndoor(m):!!m&&(m.kind==='dungeon'||m.archive);
  // v0.4.1 2.8: the weather tag is always there: the realm's sky (Clear included) outdoors, "Indoors" in dungeons, caves, sanctums and the Archive
  let w=m&&!indoor?(G.weather[m.s]||'clear'):null;if(w&&!WEATHER[w])w='clear';  // v0.5.0 1.6: an unknown sky shows as clear instead of breaking the HUD
  let html=indoor?`<button class="wchip" data-act="wxInfo" data-arg="indoors" title="Weather and time of day do not reach in here">⌂ Indoors</button>`:w?`<button class="wchip" data-act="wxInfo" data-arg="weather" title="${esc(WEATHER[w].d)}">${WEATHER[w].i} ${esc(WEATHER[w].n)}</button>`:'';
  if(G.ward>0)html+=`<span class="wchip hwchip" title="Holy Water: no random battles">✧ Ward <b class="nums">${G.ward}</b></span>`;
  if(wk.innerHTML!==html)wk.innerHTML=html;
}
function renderWorldUI(){
  const d=$('wdlg');if(!d)return;
  d.innerHTML=WS.dlg?`<button class="dlg" data-act="talk">${WS.dlg.name?`<b>${esc(WS.dlg.name)}</b>`:''}<span>${esc(WS.dlg.text)}</span><i>▼</i></button>`:'';
  const rb=$('runb');if(rb)rb.className='btn sm '+(WS.run?'gold':'');
  wkwUpdate();
}
function vStarter(){
  const n=V.pick.length,cyc=V.ngCycle||0,leg=(META.legacy||[]).filter(id=>TPL[id]);
  return `<section class="stack"><div class="panel"><h2>Choose your first ${starterSlots()===3?'three':starterSlots()===1?'one':'two'} <small>(or fewer)</small></h2><p>${starterSlots()<3?`Your legacy heroes fill ${3-starterSlots()} of the 3 places, so you pick ${starterSlots()} more. A journey never begins with more than three.`:`Eight wayfarers answer the lamp-keepers' call, each of a different element and class.`} Each holds one element and its Mastery. Rarer heroes with two elements will cross your path later.</p>
    ${cyc?`<p class="note">New Game+ cycle ${cyc}: foes are ${cyc*12}% tougher and rewards ${cyc*10}% richer.</p>`:''}</div>
    ${leg.length?`<div class="panel"><h3>Bring your legacy (up to 2)</h3><p class="note">Legacy heroes join at level 5 with veteran stats. Pick ${Math.min(2,leg.length)===1?'whether to bring them':'one or two'}.</p><div class="grid mini">${leg.map(id=>`<button class="mini ${(V.legacyPick||[]).includes(id)?'in':''}" data-act="pickLeg" data-arg="${id}"><img src="${heroURL(id)}" alt=""><b>${TPL[id].n}</b><small>${CLS[TPL[id].cls].n}</small><span class="els">${TPL[id].el.map(ico).join('')}</span></button>`).join('')}</div></div>`:''}
    <div class="grid cards">${((V.starterOpts&&V.starterOpts.length)?V.starterOpts:STARTERS).map(id=>`<div class="cardwrap">${heroCard(id,V.pick.includes(id),'pickS')}<button class="btn sm sheetb" data-act="sheetS" data-arg="${id}" aria-label="Open ${esc(TPL[id].n)}'s full sheet">Full sheet</button></div>`).join('')}</div>
    <div class="btnrow"><button class="btn" data-act="toTitle">Back</button><button class="btn gold" data-act="begin" ${n>=1&&n<=starterSlots()?'':'disabled'}>Begin with ${n+3-starterSlots()}/3</button></div></section>`;
}
function heroCard(id,sel,act,extra){
  const t=TPL[id],cls=CLS[t.cls],dual=t.el.length>1;
  return `<${act?'button':'div'} class="card hero elstrip ${sel?'sel':''} ${dual?'dual':''} ${isLeg(id)?'leg':isEpic(id)?'epic':''}" ${dualStyle(t)} ${act?`data-act="${act}" data-arg="${id}"`:''}>
    ${heroTag(id)}${port(id,'big')}<div class="info"><b>${t.n}</b><small>${cls.n}</small><div class="els">${elChips(t.el)}</div>
    <span class="trait" title="Each journey rolls one of these natures">${natPoolText(id)}</span></div>
    <p class="bio">${esc(t.bio)}</p><p class="mline">${masteryLine(id)}</p>${sigLine(id)}${extra||''}</${act?'button':'div'}>`;
}

// ----- battle view (DOM half: overlay, menus, party) -----
function renderBattle(stageOnly){
  const now=Date.now();
  if(!stageOnly){// v0.7.0: the turn forecast with foe intents (battle5.js)
    const Wt=WEATHER[B.weather||'clear'];$('border').innerHTML=`${b5OrderHtml()}<span class="osky">${battleSkyTags()}${B.spec.kind==='daily'?`<span class="wchip d">Daily · wave ${B.wave}/${B.spec.waves} · ${B.pturns||0} turns</span>`:''}</span>`;}
  const pend=B.mode==='cmd'&&B.menu==='target'&&B.pend;
  let h='';
  B.en.forEach((e,i)=>{
    const b=unitBox(e);if(!b)return;const dead=e.hp<=0,tg=targetable(e);
    if(dead&&now-(e.deathT||0)>1500)return;
    h+=`<button class="unit foe ${tg?'tg':''} ${e.primed&&!dead?'isprimed':''} ${tg&&detHits(pend&&pend.sk,e)?'dethit':''}" style="--pc:${e.primed&&ELC[e.primed.el]||'#fff'};left:${b.x-b.w/2}px;top:${b.y-b.h}px;width:${b.w}px;height:${b.h+8}px" data-act="tgtE" data-arg="${i}" ${tg?'':'tabindex="-1"'} aria-label="${esc(e.name)}${dead?' (defeated)':''}">
      </button>`;
  });
  B.front.forEach((c,i)=>{
    const b=unitBox(c);const tg=targetable(c);
    h+=`<button class="unit ally ${tg?'tg':''}" style="left:${b.x-b.w/2}px;top:${b.y-b.h}px;width:${b.w}px;height:${b.h}px" data-act="tgtA" data-arg="${allParty().indexOf(c)}" ${tg?'':'tabindex="-1"'} aria-label="${esc(c.name)}"></button>`;
  });
  h+=stageTags();
  $('bstage').style.setProperty('--nd',numDur()+'s');
  $('bstage').innerHTML=h;
  const bb=$('bban');if(bb){const bn=B.banner;const bd=bn?banDur(bn):0;bb.innerHTML=bn&&now-bn.t<bd*1000?`<span style="--c:${bn.col};animation-delay:-${now-bn.t}ms;animation-duration:${bd}s">${esc(bn.txt)}</span>`:'';}
  if(stageOnly)return;
  {const last=B.log[B.log.length-1]||'',el=$('blog');if(el&&el.dataset.l!==String(B.log.length)+last){el.dataset.l=String(B.log.length)+last;el.innerHTML=last&&!B.logOpen?`<p class="last flash">${esc(last)}</p>`:'';}}
  {const ov=$('bover');if(ov)ov.innerHTML=blogPanel()+stPopHtml()+uDetHtml();}
  $('bparty').innerHTML=foeCards()+`<div class="b3pty"><div class="pgroup heroes"><h3>Vanguard</h3><div class="pcs">${B.front.map(c=>pcard(c,false)).join('')}</div></div>${B.back.length?`<div class="pgroup rsv"><h3>Rearguard</h3><div class="pcs">${B.back.map(c=>pcard(c,true)).join('')}</div></div>`:''}</div>`;
  $('bcmd').innerHTML=cmdHtml();
  fitBattle();
}
renderBattle=HOOK.def('renderBattle',renderBattle);// v0.9.9: one definition; modules add hooks (hooks.js)
function fxDelay(f){return /poison|burn|bleed|heal|good/.test(f.cls)?0:IMPACT;}
function animating(){if(!B)return false;const now=Date.now();return B.en.concat(B.front,B.back).some(u=>(u.fx||[]).some(f=>now-f.t<fxDur(f)*1000+100+IMPACT)||now-(u.deathT||0)<1500)||(B.banner&&now-B.banner.t<banDur(B.banner)*1000+100);}
function allyTargetable(c){
  if(!(B.mode==='cmd'&&B.menu==='target'&&B.pend))return false;
  if(B.pend.item){const it=ITEMS[B.pend.item];return it.revive?c.hp<=0:c.hp>0;}
  const s=B.pend.sk;if(!s)return false;return s.t==='dead'?c.hp<=0:s.t==='ally'?c.hp>0:false;
}
// both Limit tiers with their unlock levels; lv null for the Codex (no hero level to compare against)
function limitRows(cls,lv){const L1=LIMIT[cls],L2=LIMIT2[cls]||LIMIT[cls],row=(tier,L,at,note)=>{const open=lv!=null&&lv>=at;return `<div class="row limitr ${tier===2?'l2':''} ${lv!=null&&!open?'lock':''}"><div class="grow"><b>Limit ${tier===2?'II':'I'}: ${esc(L.n)}</b><small>${esc(L.d)}${note}</small></div><span class="m">${lv!=null&&open?(lv>=LIMIT2_LV&&tier===1?'Upgraded':'Ready'):'Lv '+at}</span></div>`;};
  return `<div class="rows">${row(1,L1,LIMIT_LV,' About 70% of full power.')}${row(2,L2,LIMIT2_LV,' Replaces Limit I in place: same gauge.')}</div><p class="note">The gauge fills as this hero deals and takes damage, and when allies fall.</p>`;}
// pcard and pcard0 live in battleui.js (Beta v0.3.3)
function autoPanel(){const L=B.autoLast;
  return `<div class="autop"><div class="autoline">${L?`${port(L.id)}<div><b>${esc(L.who)}</b><span>${esc(L.move)}</span></div>`:'<div><b>Auto battle</b><span>Your heroes choose their own moves.</span></div>'}</div>
    <div class="btnrow"><button class="btn gold" data-act="auto" aria-pressed="true">■ Stop auto</button><button class="btn" data-act="speed">Speed ${META.cfg.speed}x</button><button class="btn sm" data-act="autoOpen" aria-label="Auto battle settings" title="Auto battle settings">⚙ Auto settings</button></div></div>`;}
function cmdHtml(){
  if(B&&B.auto&&!B.over)return autoPanel();
  const auto=`<button class="btn sm" data-act="pause">Pause</button>${autoBtnHtml()}<button class="btn sm" data-act="speed">Speed ${META.cfg.speed}x</button><button class="btn sm" data-act="autoOpen" aria-label="Auto battle settings" title="Auto battle settings">⚙</button>`;
  if(B.over)return `<p class="hint">The fight is over.</p>`;
  if(B.mode!=='cmd')return `<p class="hint">${B.cur&&B.mode==='enemy'?esc(B.cur.name)+' acts.':'...'}</p><div class="btnrow">${auto}</div>`;
  const a=B.cur,ks=known(a);let body='';
  // v0.4.0 2.1: a tap on a reserve card asks to switch; this is the confirm step (it costs the current hero's action)
  if(B.swapAsk&&B.swapAsk.by===a.id&&B.back[B.swapAsk.bi]&&B.back[B.swapAsk.bi].hp>0){const inn=B.back[B.swapAsk.bi];
    return `<div class="who">${port(a.id)}<div><b>${esc(a.name)}</b><small>${CLS[TPL[a.id].cls].n}, ${a.mp} MP</small></div></div><div class="swapask" role="alertdialog" aria-label="Confirm switch"><p class="hint"><b>Switch ${esc(a.name)} out for ${esc(inn.name)}?</b> ${esc(inn.name)} acts right away. ${esc(a.name)} spends this turn falling back, and loses ailments, buffs and mark.</p><div class="btnrow"><button class="btn gold" data-act="swYes">Switch</button><button class="btn" data-act="swNo">Keep ${esc(a.name)}</button></div></div>`;}
  B.swapAsk=null;
  // v0.5.0 1.4: Back is pinned in the command header at every level (greyed at the top level), one step up each tap
  const atTop=B.menu==='root',backB=`<button class="btn sm cmdback" data-act="back" ${atTop?'disabled aria-disabled="true" title="Already at the top of the menu"':'title="Back (Esc)"'}>← Back</button>`;
  const who=`<div class="who cmdhead">${port(a.id)}<div><b>${esc(a.name)}<em class="turnl">'s turn</em></b><small><span class="cls">${CLS[TPL[a.id].cls].n}</span>${B.menu==='skills'?` <span class="nums mpn">${a.mp}/${a.S.mmp} MP</span>`:''}</small></div>${backB}</div>`;
  if(B.menu==='root'){
    const sw=canSwap(),rooted=has(a,'root'),lbOk=lbReady(a),L=LIMIT[TPL[a.id].cls],noFlee=B.boss||B.spec.kind==='elite'||B.spec.kind==='arena'||B.spec.kind==='daily';
    const bonds=ks.filter(s=>s.bond);
    body=`${lbOk?(()=>{const LS=limitSkill(a);return `<button class="mi limit ${LS.limit2?'l2':''}" data-act="cmd" data-arg="limit"><span class="n">${LS.tierN}: ${esc(LS.n)}</span><span class="m">Ready</span><small>${esc(LS.d)}${LS.limit2?'':' (Limit I: about 70% power.)'}</small></button>`;})():''}
      <div class="menu prim"><button class="mi" data-act="cmd" data-arg="attack" title="${esc(DL_NAME[deliveryOf(a,atkFor(a))]||'')}">Attack</button><button class="mi" data-act="cmd" data-arg="skills">Skills${bonds.length?' <em class="bondtag">Bond</em>':''}</button>
      <button class="mi" data-act="cmd" data-arg="items">Items</button><button class="mi" data-act="cmd" data-arg="guard">Guard</button></div>
      <div class="menu sec">${canSummon(a)?`<button class="mi summon" data-act="summon" title="Your pet fights in this hero's place for a few turns">Summon ${esc(compOf(a).name)}</button>`:''}<button class="mi" data-act="cmd" data-arg="scan" title="Read a foe's exact stats and hidden quirks. Costs half a turn.">Scan</button><button class="mi" data-act="cmd" data-arg="guide" title="A short guide to the battle system. Read only, pauses the fight.">Guide</button>
      <button class="mi" data-act="cmd" data-arg="swap" ${sw?'':'disabled'} title="${rooted?'Rooted: cannot switch out':'Swap this hero for a rearguard hero'}">${rooted?'Rooted':'Switch'}</button>
      <button class="mi" data-act="cmd" data-arg="flee" ${noFlee?'disabled':''}>Flee</button></div><div class="btnrow autorow">${auto}</div>`;
  }else if(B.menu==='skills'){
    body=`<div class="menu list">${ks.map(s=>`<button class="mi ${skTgt(s).cls} ${s.combo?'combo':''} ${s.bond?'bond':''}" data-act="sk" data-arg="${s.id}" ${a.mp<s.mp?'disabled':''}><span class="n">${dlIco(deliveryOf(a,s))}${skEls(s).map(ico).join('')}${esc(s.n)}${skTgtLabel(s)}${s.combo?' <em class="c">Dual art</em>':''}${s.bond?' <em class="b">Bond</em>':''}${roleTag(s)}</span><span class="m">${(n=>n?`<span class="num ${s.k==='phys'||s.k==='mag'?'dmg':'heal'}">${n}</span> `:'')(skNum(a,s))}${s.mp} MP</span><small>${stDesc(s.d)}</small>${perkNote(a,s)}${effChips(s,a)}</button>`).join('')}</div>`;
  }else if(B.menu==='items'){
    body=`<div class="menu list">${Object.keys(ITEMS).filter(id=>!ITEMS[id].ward&&!ITEMS[id].tent&&(!ITEMS[id].craft||(G.inv[id]||0)>0)&&(!ITEMS[id].flee||(G.inv[id]||0)>0)).map(id=>`<button class="mi" data-act="item" data-arg="${id}" ${(G.inv[id]||0)>0&&!(ITEMS[id].flee&&porkBlocked())?'':'disabled'}><span class="n">${itemIcon(id)} ${ITEMS[id].n}</span><span class="m">x${G.inv[id]||0}</span><small>${ITEMS[id].d}</small></button>`).join('')}</div>`;
  }else if(B.menu==='target'){
    const one=(B.pend.sk&&(B.pend.sk.t==='one'||B.pend.sk.t==='chain'))||B.pend.scan;
    body=`<p class="hint">${B.pend.scan?'Tap a foe to scan.':one?'Tap a foe.':(B.pend.sk&&(B.pend.sk.k==='heal'||B.pend.sk.k==='revive')&&B.en.some(e=>healsUndead(B.pend.sk,e)))?'Tap a hero, or an undead foe to burn it with healing light.':'Tap a hero.'}</p>`;
  }else if(B.menu==='swap'){
    body=`<p class="hint">Who takes ${esc(a.name)}'s place? They act right away. ${esc(a.name)}'s ailments, buffs and mark are cleared.</p><div class="menu list">${B.back.map((c,i)=>`<button class="mi" data-act="sw" data-arg="${i}" ${c.hp>0?'':'disabled'}><span class="n">${port(c.id,'sm')}${esc(c.name)}</span><span class="m">${c.hp}/${c.S.mhp}</span><small>Lv ${c.lv} ${CLS[TPL[c.id].cls].n} ${c.el.map(ico).join('')}</small></button>`).join('')}</div>`;
  }
  return who+body;
}

// ----- modals -----
function box(title,body,btns,wide){return `<div class="modal"><div class="panel box ${wide?'wide':''}"><h2>${title}</h2>${body}<div class="btnrow">${btns||'<button class="btn" data-act="closeModal">Close</button>'}</div></div></div>`;}
function tabs(list,cur,act){return `<div class="chips">${list.map(t=>`<button class="chip ${cur===t[0]?'on':''}" data-act="${act}" data-arg="${t[0]}">${t[1]}</button>`).join('')}</div>`;}
function vModal(m){
  switch(m.type){
  case 'story':return `<div class="modal"><div class="panel box scroll"><h2>${esc(m.title)}</h2><p class="story">${esc(m.text)}</p><div class="btnrow"><button class="btn gold" data-act="storyOk">${esc(m.btn||'Continue')}</button></div></div></div>`;
  case 'talk':{const t=m.lines[m.i];return `<div class="modal"><div class="panel box scroll"><h3>Campfire</h3><div class="talk">${port(heroIdByName(t[0]),'big')}<div><b>${esc(t[0])}</b><p class="story">${esc(t[1])}</p></div></div><div class="btnrow"><button class="btn gold" data-act="talkNext">${m.i<m.lines.length-1?'Next':'Close'}</button></div></div></div>`;}
  case 'result':return mResult(m.info);
  case 'lose':return box('The party falls',`<p>Darkness closes in. You wake at the inn in ${esc(ZS(G.lastTown||0).town)}, a tenth lighter in the purse.</p>`,'<button class="btn gold" data-act="loseOk">Carry on</button>');
  case 'boss':return mBoss(m.s);
  case 'elite':{const b=m.b,mo=MON[b.mon],md=ELITE_MODS.find(x=>x.k===b.mod);if(b.personal)return box(esc(b.name),`<div class="bossv"><img src="${monURL(mo.art)}" alt=""></div><div class="els">${elChips(mo.el)}</div><p class="story">${esc(b.text)}</p><p class="note">Level ${b.lv}, with a pack. ${md?`<b>${md.n}:</b> ${md.d}`:''} Reward: ${gearOf('u_'+b.personal).n}.</p>`,`<button class="btn" data-act="closeModal">Not yet</button><button class="btn gold" data-act="fightElite">Fight</button>`);return box(esc(b.name),`<div class="bossv"><img src="${monURL(mo.art)}" alt=""></div><div class="els">${elChips(mo.el)}</div><p>A marked monster from the guild's bounty board. ${md?`<b>${md.n}:</b> ${md.d}`:''}</p><p class="note">Level ${b.lv}, with a pack mate. Elites carry a Break shield. Reward: ${fmt(b.reward.gold)} gold, ${gearOf(b.reward.charm).n}, ${b.reward.mat} materials.</p>`,`<button class="btn" data-act="closeModal">Leave it</button><button class="btn gold" data-act="fightElite">Fight</button>`);}
  case 'inn':return mInn();
  case 'tavern':return mTavern();
  case 'smithy':return mShop(m);
  case 'startfew':return box(`Start with only ${m.n} wayfarer${m.n>1?'s':''}?`,'<p>You can recruit more in taverns.</p><p class="note">Fewer heroes means a harder start, and every fight is shared out among fewer of you.</p>','<button class="btn" data-act="closeModal">Go back</button><button class="btn gold" data-act="beginGo">Start</button>');
  case 'workshop':return mWorkshop(m);
  case 'beast':return mBeast(m);
  case 'feedback':return mFeedback(m);
  case 'archivist':return mArchivist();
  case 'legendEvt':return mLegendEvt(m);
  case 'convergence':return mConvergence();
  case 'codexEntry':return mCodex(m.id);
  case 'fbcopy':return mFbCopy(m);
  case 'guild':return m.char?mChar(m.char,true):mGuild(m);
  case 'char':return mChar(m.char||m.id,true);
  case 'board':return mBoard();
  case 'travel':return box('Waystone',`<p>The stone hums. Touch it to travel to any town you have visited this journey.</p><div class="rows">${G.visited.slice().sort().map(s=>`<div class="row"><div><b>${esc(ZS(s).town)}</b><small>${esc(ZS(s).n)}, ${realmLabel(s)}${G.cleared[s]?' (relit)':''}</small></div><button class="btn sm" data-act="travel" data-arg="${s}" ${WS.m&&WS.m.id==='t'+s?'disabled':''}>Go</button></div>`).join('')}${typeof riftRow==='function'?riftRow():''}${META.archivist?`<div class="row archrow"><div><b>✦ The Archive</b><small>A hidden library outside the world. Vaelith Ashgrave waits there.</small></div><button class="btn sm gold" data-act="toArchive" ${WS.m&&WS.m.archive?'disabled':''}>Go</button></div>`:''}</div>`);
  case 'menu':return mMenu(m);
  case 'settings':return mSettings();
  case 'legacy':return mLegacy();
  case 'pause':return box('Paused','<p>The fight waits for you.</p>','<button class="btn gold" data-act="closeModal">Resume</button><button class="btn" data-act="settings">Settings</button><button class="btn" data-act="fbOpen">Help / Feedback</button>');
  case 'slots':return mSlots(m);
  case 'export':return mExport();
  case 'import':return mImport();
  case 'dailyEnd':return mDailyEnd(m);
  case 'dailyIntro':return mDailyIntro();
  case 'ngplus':return box('The Meridian returns',`<p class="story">Aurelis is bright again. ${esc(TPL[m.id].n)} will walk with you into every journey from now on.</p><p class="note">Start New Game+ now, or stay to explore: the arena, the Echoes in each dungeon, the Echo Rift at any waystone and any bounties you left are still waiting.</p>`,`<button class="btn" data-act="closeModal">Stay and explore</button><button class="btn gold" data-act="startNG">Begin New Game+</button>`);
  case 'useitem':return box(ITEMS[m.id].n,`<p class="note">${ITEMS[m.id].d}. Carrying ${G.inv[m.id]||0}.</p>${m.last?`<p class="note" role="status"><b>${esc(m.last)}</b></p>`:''}<div class="rows">${partyChars().map(c=>`<div class="row">${port(c.id)}<div class="grow"><b>${esc(c.name)}</b>${ITEMS[m.id].mp&&!ITEMS[m.id].heal&&!ITEMS[m.id].revive?bar(c.mp,c.S.mmp,'var(--mp)'):bar(c.hp,c.S.mhp,'var(--hp)')}<small>${c.hp}/${c.S.mhp} HP, ${c.mp}/${c.S.mmp} MP</small></div><button class="btn sm" data-act="useOn" data-arg="${c.id}">Use</button></div>`).join('')}</div>`,'<button class="btn" data-act="menu">Back</button>');
  }
  return '';
}
vModal=HOOK.def('vModal',vModal);// v0.9.9: one definition; modules add hooks (hooks.js)
function heroIdByName(n){const r=RAW.find(r=>r[1]===n);return r?r[0]:STARTERS[0];}
function mBoss(s){
  const def=guardianDef(bossKeyFor(s)),final=s===4;
  return box(esc(def.n),`<div class="bossv"><img src="${monURL(def.art)}" alt=""></div><div class="els">${elChips(def.el)}</div><p>${esc(def.intro)}</p>
    <p class="bclass ${bossClass(bossKeyFor(s)).toLowerCase()}">${bossClass(bossKeyFor(s))}</p><p class="note">${BOSS_CLASS_D[bossClass(bossKeyFor(s))]} ${final?'It waits at the end of the journey':'It guards the beacon of the '+esc(ZS(s).dungeon)}. Level ${bossLvFor(s)}${bossLvFor(s)>STAGE_BOSS_LV[s]+ngLvOff()?` (base ${STAGE_BOSS_LV[s]+ngLvOff()}, raised by your strongest hero)`:''}${G.run.cycle?', NG+'+G.run.cycle:''}. It carries a ${final?7:5}-pip Break shield: weaknesses and reactions chip it. There is no running. Your party: average level ${avgLv()}.</p>`,
    `<button class="btn" data-act="closeModal">Not yet</button><button class="btn gold" data-act="fightBoss" data-arg="${s}">Fight</button>`);
}
function gearDiff(c,id){const g=gearOf(id),o=gearOf(c.eq[g.slot])||{},p=[];ST.forEach(s=>{const d=Math.round((g[s]||0)-(o[s]||0));if(d)p.push(`<b class="${d>0?'up':'dn'}">${d>0?'+':''}${d} ${STN[s]}</b>`);});
  ATTR.forEach(k=>{const d=((g.attr||{})[k]||0)-((o.attr||{})[k]||0);if(d)p.push(`<b class="${d>0?'up':'dn'}">${d>0?'+':''}${d} ${k.toUpperCase()}</b>`);});
  if(g.el&&o.el!==g.el)p.push(`<b class="up">${EL[g.el]} ward</b>`);if(g.immune&&!o.immune)p.push('<b class="up">Clarity</b>');return p.join(' ')||'<span class="mute">no change</span>';}
function mChar(id,edit){
  const c=G.roster[id];if(!c)return '';
  const t=TPL[id],cls=CLS[t.cls],S=c.S,m=V.modal;
  if(edit&&m.gear){
    const cnt={};G.gear.filter(g=>gearOf(g)&&gearOf(g).slot===m.gear&&(!gearOf(g).only||gearOf(g).only===id)&&canEquip(c,g)).forEach(g=>{cnt[g]=(cnt[g]||0)+1;});
    return box(`${SLOTN[m.gear]} for ${esc(c.name)}`,`<p class="note">Equipped: ${c.eq[m.gear]?gearOf(c.eq[m.gear]).n:'nothing'}</p>
      <div class="rows">${Object.keys(cnt).map(g=>`<div class="row"><div><b>${gearOf(g).n}</b> x${cnt[g]}<small>${gearDesc(g)}</small><small>${gearDiff(c,g)}</small></div><button class="btn sm" data-act="equip" data-arg="${g}">Equip</button></div>`).join('')||'<p class="note">No spare gear for this slot. Buy some at the smithy or find it in chests.</p>'}</div>`,
      `${c.eq[m.gear]?`<button class="btn sm" data-act="unequip" data-arg="${m.gear}">Unequip</button>`:''}<button class="btn" data-act="gearBack">Done</button>`);
  }
  const slots=[0,1,2,3,4,5].map(i=>{const oc=G.roster[G.party[i]];return `<button class="btn sm ${G.party[i]===id?'gold':''}" data-act="assign" data-arg="${i}">${i<3?'Vanguard':'Rearguard'} ${i%3+1}${oc?': '+esc(oc.name):''}</button>`;}).join('');
  const A=S.attr,attrRows=ATTR.map(k=>`<div class="arow"><button class="stb an" data-act="statInfo" data-arg="${k}" aria-label="What is ${ATTRN[k][0]}?"><b>${k.toUpperCase()}</b> <small>${ATTRN[k][0]}</small></button><b>${Math.round(A[k])}</b>${c.alloc[k]?`<small class="up">+${c.alloc[k]}</small>`:'<small></small>'}${edit?`<button class="btn sm" data-act="addPt" data-arg="${k}" ${c.pts>0?'':'disabled'} aria-label="Add a point to ${ATTRN[k][0]}">+</button>`:''}</div>`).join('');
  const L=LIMIT[t.cls],bonds=BONDS.filter(b=>b.a===id||b.b===id);
  const LST=(m.list||[]).filter(x=>G.roster[x]),li=LST.indexOf(id),nav=LST.length>1&&li>=0?`<div class="cnav"><button class="btn sm" data-act="charNav" data-arg="-1" aria-label="Previous hero">‹ Prev</button><small class="nums">${li+1} / ${LST.length}</small><button class="btn sm" data-act="charNav" data-arg="1" aria-label="Next hero">Next ›</button></div>`:'';
  return `<div class="modal"><div class="panel box wide charsheet ${isLeg(id)?'legsheet':''}">${nav}
    ${isLeg(id)?`<div class="legstrip">${legSeal()}${legBanner()}${legSeal()}</div>`:''}<div class="mh"><div class="pbig"><img src="${heroURL(id)}" alt=""></div><div class="grow"><h2 class="cname">${esc(c.name)}${c.legacy?' <span class="cyc">Legacy</span>':''}${isEpic(id)?' '+epicTag():''}</h2>${t.title?`<small class="ltitle">${esc(t.title)}</small>`:''}<small>${cls.n}, level ${c.lv}</small><div class="els">${elChips(t.el)}</div>
      ${natBlock(id,c)}<p class="bio">${esc(t.bio)}</p><p class="note nums">Battles together: ${btOf(c)} of ${PERSONAL_BT}</p>${classCard(t.cls)}<p class="mline">${masteryLine(id)}</p>${sigLine(id)}</div></div>
    <div class="xp">${c.lv>=LV_CAP?`<small>Level ${c.lv}: the cap. Nothing left to learn from XP, but every fight still pays.</small>`:`<small>XP ${fmt(c.xp)} / ${fmt(need(c.lv))}</small>${bar(c.xp,need(c.lv),'var(--gold)')}`}</div>
    <div class="stats tapstats">${[['hp',`${c.hp}/${S.mhp}`],['mp',`${c.mp}/${S.mmp}`],['atk',Math.round(S.atk)],['def',Math.round(S.def)],['mag',Math.round(S.mag)],['res',Math.round(S.res)],['spd',Math.round(S.spd)],['crit',Math.round(S.crit*100)+'%'],['eva',Math.round(S.eva*100)+'%'],['healP',Math.round(S.healP)]].map(([k,v])=>`<button class="stb" data-act="statInfo" data-arg="${k}" aria-label="What is ${STAT_INFO[k][0]}?">${STAT_INFO[k][0]} <b>${v}</b></button>`).join('')}</div>
    <h4>Attributes ${c.pts?`<span class="pts">${c.pts} point${c.pts>1?'s':''} to spend</span>`:''}</h4><div class="attrs">${attrRows}</div>
    ${edit?`<div class="btnrow"><button class="btn sm ${c.auto!==false?'gold':''}" data-act="autoPts">Auto-spend ${c.auto!==false?'on':'off'}</button><button class="btn sm" data-act="seal" title="Copy a code that describes this hero, for future co-op raids">Copy hero seal</button><button class="btn sm" data-act="respec" ${G.gold>=respecCost(c)&&Object.keys(c.alloc).length?'':'disabled'}>Respec for ${respecCost(c)} gold</button></div>`:''}
    <h4>Equipment</h4><div class="eq">${EQSL.map(sl=>edit?`<button class="btn sm" data-act="gearSlot" data-arg="${sl}"><small>${SLOTN[sl]}</small> ${c.eq[sl]?gearOf(c.eq[sl]).n:'Empty'}</button>`:`<span class="eqv"><small>${SLOTN[sl]}</small> ${c.eq[sl]?gearOf(c.eq[sl]).n:'Empty'}</span>`).join('')}</div>
    <p class="note">${G.party.includes(id)?'In your six.':'On the roster.'} Change your party from Menu > Party.</p>${G.party.includes(id)&&fsSkills(c).length&&!G.daily?`<div class="btnrow"><button class="btn sm gold" data-act="fsOpen" data-arg="${id}">Field skills</button></div>`:''}
    <h4>Limit Break</h4>${limitRows(t.cls,c.lv)}
    <h4>Skills</h4><p class="note">⟐ Primers mark a foe with their element for 2 turns. ✸ Detonators set off a reaction on a foe primed with a matching element. Other elemental skills just hit.</p><div class="rows">${classSkills(t).concat(id==='vaelith'?archiveSkills():[]).map(s=>`<div class="row ${!skillKnown(c,s)?'lock':''} ${s.combo?'combo':''} ${s.archive?'arcrow':''}"><div><b>${skEls(s).map(ico).join('')}${esc(s.n)}</b>${roleTag(s)}<small>${esc(s.d)}</small>${perkNote(c,s)}</div><span class="m">${!skillKnown(c,s)?'Lv '+s.lv:s.mp+' MP'}</span></div>`).join('')}</div>
    ${bondSheet(id)}
    <div class="btnrow"><button class="btn gold" data-act="${m.type==='guild'?'charBack':'menuBack'}">Back</button></div></div></div>`;
}
// v0.4.0 3.1: seven top groups, with sub tabs where a group holds more than one page. Tab ids are unchanged so every old link still lands.
// v0.6.3: regrouped so each group holds one kind of page: Quests has the guild missions, Backpack has Materials, Records has Lore
// (the story so far), Guides keeps only the how-to pages. Ids are unchanged; 'pouch' is new (Materials, was the end of Items).
const MENU_GROUPS=[['party','Party',['party','roster','loadouts','comp']],['gear','Backpack',['equip','items','pouch']],['quests','Quests',['quests','fmis']],['map','Map',['map']],['records','Records',['system','lore','beasts','codex','factions']],['guides','Guides',['next','types','help']],['settings','Settings',['settings']]];
const MENU_SUB={pouch:'Materials',party:'Party',roster:'Roster',loadouts:'Loadouts',comp:'Pets',equip:'Equipment',items:'Items',next:'What next?',lore:'Lore',types:'Foe types',help:'Help',beasts:'Bestiary',codex:'Codex',factions:'Factions',fmis:'Factions',system:'Journey',quests:'Quests',map:'Map',settings:'Settings'};
function menuGroupOf(tab){return MENU_GROUPS.find(g=>g[2].includes(tab))||MENU_GROUPS[0];}
function menuTabsHtml(grp,tab){const top=`<div class="chips mgrp" role="tablist">${MENU_GROUPS.map(g=>`<button role="tab" aria-selected="${g===grp}" class="chip ${g===grp?'on':''}" data-act="menuGrp" data-arg="${g[0]}">${g[1]}</button>`).join('')}</div>`;
  const subs=grp[2].filter(t=>MENU_SUB[t]);return top+(subs.length>1?`<div class="chips msub" role="tablist">${subs.map(t=>`<button role="tab" aria-selected="${t===tab}" class="chip sm ${t===tab?'on':''}" data-act="menuTab" data-arg="${t}">${MENU_SUB[t]}</button>`).join('')}</div>`:'');}
function mMenu(m){
  const tab=m.tab||'party';
  const grp=menuGroupOf(tab);
  let body='';
  if(tab==='map'){const mm=WS.m;if(!mm)body='<p class="note">No area map yet.</p>';else{const L=typeof mapMarks==='function'?mapMarks(mm):[],lbl=mm.cave?mm.name:mm.archive?(mm.hub||'the Archive'):mm.kind==='town'?ZS(mm.s).town:mm.kind==='field'?ZS(mm.s).n:ZS(mm.s).dungeon;
    setTimeout(()=>{try{drawFullMap();document.querySelectorAll('canvas.lgi').forEach(c=>{const x=c.getContext('2d');x.imageSmoothingEnabled=false;mapIcoDraw(x,c.dataset.ico,10,10,16);});}catch(e){}},0);
    body=`<div class="btnrow"><button class="btn gold" data-act="mapWorld">World map</button><button class="btn" data-act="miniT">Minimap: ${miniOn()?'on':'off'}</button></div><h4>${esc(lbl)}</h4><canvas id="fmap" class="fmap" data-act="fmTap" aria-label="Map of ${esc(lbl)}"></canvas><p class="note fmnote" id="fmnote" aria-live="polite"></p><div class="maplegend"><span><b style="color:#fff">➤</b> You</span>${legendKeys(L).map(k=>MAPICO_NAME[k]?`<span><canvas class="lgi" data-ico="${k}" width="20" height="20"></canvas> ${MAPICO_NAME[k]}</span>`:`<span><b style="color:${MK[k][0]}">${MK[k][1]}</b> ${MKN[k]}</span>`).join('')}</div><p class="note">Only places your party has seen are drawn. Tap a place you have been to and the party walks there.</p>`;}}
  if(tab==='party'){body=vSwap('menu');
    // outside town swaps are blocked, except the wild recruit swap (G.pendRecruit, v0.10.2)
    try{if(G&&!G.daily&&!inTown())body+=G.pendRecruit&&G.roster[G.pendRecruit]?`<p class="note">${esc(G.roster[G.pendRecruit].name)} has just joined you, so they can be swapped in now. Other heroes can only be switched out in town.</p>`:'<p class="note">You must be in town to switch party members out.</p>';}catch(e){}}
  if(tab==='equip')body=vEquipTab();
  if(tab==='comp')body=vCompanions();
  if(tab==='roster'){const town=inTown(),list=lsort('roster',Object.values(G.roster).filter(c=>lmatch('roster',c)),(a,b)=>(G.party.includes(b.id)-G.party.includes(a.id))||b.lv-a.lv||a.name.localeCompare(b.name));V.charList=list.map(c=>c.id);
    const chips=filterBar('roster');
    body=`<p class="note">${Object.keys(G.roster).length} of ${ensureSub(G).length} wayfarers in this journey. Tap a hero to equip gear and spend stat points${town?', or to put them in your six':''}.${town?'':' Swapping roster heroes into your six happens in town.'}</p>${chips}<div class="grid mini">${list.map(c=>`<button class="mini elstrip ${G.party.includes(c.id)?'in':''} ${c.el.length>1?'dual':''} ${isLeg(c.id)?'leg':''}" ${dualStyle(TPL[c.id])} data-act="viewChar" data-arg="${c.id}">${isLeg(c.id)?legSeal(1)+'<span class="legtag">LEGENDARY</span>':''}<img src="${heroURL(c.id)}" alt=""><span class="miniail">${typeof ailBadge==='function'?ailBadge(c.id):''}</span><b>${esc(c.name)}${c.legacy?' ★':''}</b><small>Lv ${c.lv} ${CLS[TPL[c.id].cls].n}</small>${xpMini(c)}<span class="els">${c.el.map(ico).join('')}${G.party.includes(c.id)?'<em class="pts">In party</em>':''}</span></button>`).join('')}</div>`;}
  if(tab==='items'){const f=LC('items'),sh=f.sh||'all',kind=id=>{const o=ITEMS[id];return o.travel?'travel':(o.heal||o.mp||o.cure||o.revive)?'battle':'other';};
    let ids=Object.keys(ITEMS).filter(id=>!ITEMS[id].craft||(G.inv[id]||0)>0).filter(id=>sh==='all'||(sh==='own'?(G.inv[id]||0)>0:kind(id)===sh));
    const ord={name:(a,b)=>ITEMS[a].n.localeCompare(ITEMS[b].n),count:(a,b)=>(G.inv[b]||0)-(G.inv[a]||0)||ITEMS[a].n.localeCompare(ITEMS[b].n),rar:(a,b)=>iTierIdx(b)-iTierIdx(a)||ITEMS[a].n.localeCompare(ITEMS[b].n)}[f.s]||((a,b)=>iTierIdx(b)-iTierIdx(a)||ITEMS[a].n.localeCompare(ITEMS[b].n));/* Default: rarity then name, same rule as the shops; the Pork Chop Sandwich is pinned first below */ids=ids.slice().sort(ord);/* Pork Chop Sandwiches always lead the backpack, whatever the sort */ids=ids.filter(id=>id==='porkchop').concat(ids.filter(id=>id!=='porkchop'));
    body=ddBar([ddSel('Show','lSh','items',[['all','All items'],['own','Carrying'],['battle','Healing and cures'],['travel','Travel gear']],sh),ddSel('Sort','lSort','items',[['def','Default'],['name','Name'],['count','Most carried'],['rar','Rarest first']],f.s)],'lfbar')
      +(ids.length?`<div class="rows">${ids.map(id=>`<div class="row tr" style="${tierVars(iTierIdx(id))}"><div><b>${itemIcon(id)} ${ITEMS[id].n}</b> ${itemChip(id)} x${G.inv[id]||0}<small>${ITEMS[id].d}</small>${ITEMS[id].travel&&(G.inv[id]||0)>0&&travelWhyNot(id)?`<small class="warn">${esc(travelWhyNot(id))}</small>`:''}</div>${ITEMS[id].cure?'<span class="m">Battle only</span>':ITEMS[id].travel?`<button class="btn sm" data-act="useTravel" data-arg="${id}" ${(G.inv[id]||0)>0&&!travelWhyNot(id)?'':'disabled'} title="${esc(travelWhyNot(id))}">Use</button>`:`<button class="btn sm" data-act="useItem" data-arg="${id}" ${(G.inv[id]||0)>0?'':'disabled'}>Use</button>`}</div>`).join('')}</div>`:'<p class="note empty">No items match. Try Show: All items.</p>')+'<p class="note">Materials have their own tab: Backpack, Materials.</p>';}
  if(tab==='pouch')body=`<p class="note">Herbs, ore, logs, monster parts and relics. Alchemy and the Smithy turn them into gear and brews.</p>${vPouch()}`;
  if(tab==='next')body=vNext();
  if(tab==='beasts')body=vBestiary();
  if(tab==='codex')body=vCodex();
  if(tab==='lore')body=vLore();
  if(tab==='system')body=vJourney();
  if(tab==='factions'&&typeof vFactions==='function')body=vFactions();
  if(tab==='fmis'&&typeof vFacMissions==='function')body=vFacMissions();
  if(tab==='loadouts')body=(typeof ldStrip==='function'?`<p class="note">Loadouts remember who is in your six, their order, gear and pets. Tap one to switch${inTown()?'':' (switching your six happens in town)'}.</p>${ldStrip()}<div class="btnrow"><button class="btn gold" data-act="ldMgr">Manage loadouts</button></div>`:'');
  if(tab==='types'&&typeof vTypes==='function')body=vTypes();
  if(tab==='help')body=`<p class="note">Stuck, confused or found a bug? Everything here is also in the other Guides tabs: What next? points at your next goal, Lore tells the story so far, and Foe types explains who is weak to what.</p><div class="btnrow"><button class="btn gold" data-act="fbOpen">Help / Feedback</button></div>`;
  if(tab==='settings')body=settingsBody();
  if(typeof nbMenuBody==='function'){const nb=nbMenuBody(m);if(nb!=null)body=nb;}// v0.9.5: Quests, Guilds, Bounties, Arena are the Notice Board (menus3.js)
  return box('Menu',menuTabsHtml(grp,tab)+body,`<span class="verf">${esc(GAME_VERSION)}</span>${canStuck()?'<button class="btn" data-act="stuckAsk" title="Return to the dungeon entrance for free">Stuck?</button>':''}<button class="btn" data-act="fbOpen">Help / Feedback</button><button class="btn gold" data-act="closeModal">Close</button>`,true);
}
function bestAll(){
  const out=[];ZONES.forEach((Z,zi)=>Z.pool.forEach(k=>out.push({k,d:MON[k],zone:zi})));
  GPOOL.concat(FPOOL).forEach(k=>out.push({k,d:guardianDef(k),g:1}));return out;}
function vBestiary(){
  const all=bestAll(),seen=all.filter(o=>(META.best[o.d.n]||{}).seen).length;
  const tile=o=>{const b=META.best[o.d.n]||{};if(!b.seen)return `<div class="btile unk"><img src="${monURL(o.d.art)}" alt=""><b>???</b><span class="els"></span></div>`;
    const t=tierOf(b,o.g),nm=nextMilestone(b,o.g),pk=perkOf(o.d.n,o.g);
    return `<button class="btile ${o.g?(FINALS[o.k]?'g cal':'g'):''} t${t}" data-act="beast" data-arg="${o.k}"><img src="${monURL(o.d.art)}" alt=""><b>${esc(o.d.n)}</b>${o.echo?'<em class="echot">Echo</em>':''}<span class="els">${o.d.el.map(ico).join('')}</span><span class="tier t${t}">${TIER_N[t]}${pk.lv?' '+'★'.repeat(pk.lv):''}</span><small class="nums mile">${esc(nm.perk.replace(' for a mastery perk','').replace(' for the next mastery perk',''))}</small></button>`;};
  const groups=ZONES.map((Z,zi)=>({n:Z.n,list:all.filter(o=>o.zone===zi)})).concat([{n:'Dungeon oddities',list:all.filter(o=>o.odd)},{n:'Scourges',list:all.filter(o=>o.g&&!o.echo&&!FINALS[o.k])},{n:'Calamities',list:all.filter(o=>o.g&&!o.echo&&FINALS[o.k])},{n:'Echoes',list:all.filter(o=>o.echo)}]).filter(G0=>G0.list.length);
  // v0.6.3: dropdown filters (lists.beasts: sh what to show, rg which region)
  const bf=LC('beasts'),bsh=bf.sh||'all',brg=bf.rg||'all',bOk=o=>{const b=META.best[o.d.n]||{},t=b.seen?tierOf(b,o.g):-1;return bsh==='all'||(bsh==='seen'?b.seen:bsh==='unseen'?!b.seen:bsh==='learn'?b.seen&&t<3:t===3);};
  const shown=groups.map((G0,i)=>Object.assign({},G0,{i,list:G0.list.filter(bOk)})).filter(G0=>(brg==='all'||String(G0.i)===brg)&&G0.list.length);
  const bbar=ddBar([ddSel('Show','lSh','beasts',[['all','Every creature'],['seen','Seen'],['unseen','Not seen yet'],['learn','Not mastered'],['mast','Mastered']],bsh),ddSel('Region','lRg','beasts',[['all','Every region']].concat(groups.map((G0,i)=>[String(i),esc(G0.n)])),brg)],'lfbar');
  const ap=archiveProgress(),mast=all.filter(o=>tierOf(META.best[o.d.n],o.g)===3).length;
  return `<p class="note">${seen} of ${all.length} creatures seen, ${mast} mastered.</p>${bbar}<details class="m3how"><summary>How the Bestiary works</summary><p class="note">Every entry starts at <b>Seen</b>. Kills or a scan make it <b>Studied</b> (exact stats, skills, drops, quirks); more kills plus a scan make it <b>Mastered</b> (drop odds, and a Scourge's or Calamity's turning point and pattern). Kill milestones (${PERK_KILLS.join(', ')}; ${PERK_KILLS_BOSS.join(', ')} for Scourges and Calamities) earn small permanent perks against that foe. Tied to your account across journeys and devices.</p></details>${syncNote()}<p class="note archp">${META.archivist?'✦ Every Scourge and Calamity is logged. The Archive is open: touch any waystone to visit it.':`<b class="nums">${ap.n}/${ap.of}</b> Scourges and Calamities logged. Log them all and someone will want to meet you.`}</p>
    ${shown.map(G0=>{const full=groups[G0.i].list,n=full.filter(o=>(META.best[o.d.n]||{}).seen).length;return `<h4>${esc(G0.n)} <span class="cnt nums">${n}/${full.length}</span></h4><div class="btiles">${G0.list.map(tile).join('')}</div>`;}).join('')||'<p class="note empty">No creatures match. Try Show: Every creature.</p>'}`;
}
function beastLv(o){if(o.g)return null;let lv=20;if(G&&G.run&&G.run.order){const s=G.run.order.indexOf(o.zone);if(s>=0)lv=Math.round((STAGE_LV[s][0]+STAGE_LV[s][1])/2);}return lv;}
function mBeast(m){
  const o=bestAll().find(x=>x.k===m.k);if(!o)return '';const d=o.d,b=META.best[d.n]||{seen:0,kills:0,known:{}};
  const T=tierOf(b,o.g),nm=nextMilestone(b,o.g),pk=perkOf(d.n,o.g),rev=!!(b.hit||b.scan);
  const weak=ELK.filter(el=>matchup(el,d.el)>1),res=ELK.filter(el=>matchup(el,d.el)<1),show=el=>!o.g||rev||(b.known||{})[el];
  const q=o.g?null:quirkDef(o.k);
  const drops=MON_DROPS[o.k]?[...new Set(MON_DROPS[o.k].map(x=>x==='ore*'?'Ore':x==='wood*'?'Wood':x==='herb*'?'Herbs':MATS[x]))]:[];
  const where=o.g?`<b class="bclass ${bossClass(o.k).toLowerCase()}">${bossClass(o.k)}</b> ${BOSS_CLASS_D[bossClass(o.k)]} Which one waits where changes each journey.`:o.odd?'Hides among ordinary dungeon chests. Watch for a chest that breathes.':`Roams ${esc(ZONES[o.zone].n)}${o.night?' at night':''}.`;
  const skl=(d.sk||[]).filter(x=>Array.isArray(x));
  const lv=beastLv(o);let st='';
  if(o.g&&G&&G.run){const bs=(G.run.bosses||[]).indexOf(o.k),sg=bs>=0?bs:(G.run.final===o.k?4:-1);if(sg>=0){const base=STAGE_BOSS_LV[sg]+ngLvOff(),cur=bossLvFor(sg);st=`<p class="note nums">Level ${cur}${cur>base?` (base ${base}, raised by your strongest hero)`:''} this journey.</p>`;}else st=`<p class="note nums">Not waiting anywhere on this journey.</p>`;}
  if(T>=2&&!o.g){const e=makeEnemy(d,lv);st=`<div class="stats"><span>HP <b>${e.S.mhp}</b></span><span>ATK <b>${Math.round(e.S.atk)}</b></span><span>DEF <b>${Math.round(e.S.def)}</b></span><span>MAG <b>${Math.round(e.S.mag)}</b></span><span>RES <b>${Math.round(e.S.res)}</b></span><span>SPD <b>${Math.round(e.S.spd)}</b></span></div><p class="note">At level ${lv}, on your current difficulty.</p>`;}
  const lock=(need,what)=>`<p class="note lockl">${what} at <b>${TIER_N[need]}</b>.</p>`;
  const skillLine=x=>`<div class="row"><div class="grow"><b>${x[1]?ico(x[1]):''}${esc(x[0])}</b><small>${x[4]==='buff'?'Buffs itself':x[3]==='all'?'Hits your whole vanguard':'Hits one hero'}${x[4]==='phys'?', physical':x[4]==='mag'?', magic':''}${x[2]&&x[4]!=='buff'?`, power ${x[2]}`:''}${x[5]?'. May inflict '+x[5].map(f=>STS[f[0]].n).join(', '):''}.</small></div></div>`;
  return box(esc(d.n),`<div class="bdet"><div class="bimg"><img src="${monURL(d.art)}" alt=""></div><div class="grow"><div class="els">${elChips(d.el)}</div><p class="note">${where}</p><p class="nums"><b class="tier t${T}">${TIER_N[T]}</b> · Defeated ${b.kills||0}${b.scan?' · Scanned':''}</p>${nm.tier?`<small class="nums">${esc(nm.tier)}</small>`:''}</div></div>
    <h4>Mastery perks</h4><p class="note nums">${pk.lv?`Rank ${pk.lv}: +${Math.round(pk.dmg*100)}% damage against it${pk.drop?`, +${Math.round(pk.drop*100)}% drop chance`:''}. `:'None yet. '}${esc(nm.perk)}. Perks are off in the Daily Trial.</p>
    <h4>Matchups</h4><div class="rows compact"><div class="row"><b>Weak to</b><span>${weak.map(el=>show(el)?ico(el)+' '+EL[el]:'?').join(', ')||'Nothing'}</span></div><div class="row"><b>Resists</b><span>${res.map(el=>show(el)?ico(el)+' '+EL[el]:'?').join(', ')||'Nothing'}</span></div>
      ${o.g?'':`<div class="row"><b>Quirks</b><span>${T>=2||rev?(q?esc(quirkText(q)):'None'):'? Land a hit or scan one'}</span></div>`}
      ${(()=>{const kw=weak.filter(show);if(!kw.length)return '';const L=Object.values(REACT_V).filter(R=>kw.includes(R.d)).slice(0,4);return L.length?`<div class="row"><b>Best combos</b><span>${L.map(R=>`⟐${ico(R.p)} then ✸${ico(R.d)} ${R.n}`).join('<br>')}</span></div>`:'';})()}</div>
    ${o.g?'':`<h4>Stats</h4>${T>=2?st:lock(2,'Exact stats and HP')}`}
    <h4>Skills</h4>${T>=2?`<div class="rows compact">${skl.map(skillLine).join('')}</div>`:lock(2,'The full skill list')}
    ${o.g?`<h4>Turning point and pattern</h4>${T>=3?`<p>${d.phase?`At ${Math.round(d.phase.at*100)}% HP: ${esc(d.phase.say)}${d.phase.summon?' It calls for help.':''}${d.phase.heal?` It heals ${Math.round(d.phase.heal*100)}%.`:''}`:'No turning point.'} It has a Break shield: hit its weaknesses and detonate reactions to crack it, then pile on while it reels.</p>`:lock(3,'Its turning point and attack pattern')}`:''}
    ${drops.length?`<h4>Drops</h4>${T>=2?`<p>${drops.join(', ')}, plus the local realm relic${T>=3?`. Odds per kill: about ${Math.round(55*(1+pk.drop))}% for a part or raw material, 38% for the realm relic; elite versions also drop a Dread Core.`:'.'}</p>`:lock(2,'The drop table')}`:o.g?`<h4>Drops</h4><p>${T>=2?'Two Dread Cores per win, plus gear and gold.':'?'}</p>`:''}`,'<button class="btn gold" data-act="menuTab" data-arg="beasts">Back</button>');
}
function vLore(){
  const head=`<tr><th></th>${ELK.map(d=>`<th>${ico(d)}</th>`).join('')}</tr>`;
  const rows=ELK.map(a=>`<tr><th>${ico(a)}</th>${ELK.map(d=>{const v=CHART[a][d];return `<td class="${v>1?'s':v<1?'r':''}">${v>1?'2':v<1?'½':''}</td>`;}).join('')}</tr>`).join('');
  const reacts=ELK.map(p=>{const L=Object.values(REACT_V).filter(R=>R.p===p);if(!L.length)return '';return `<div class="row"><div class="grow"><b>${ico(p)} Prime with ${EL[p]}</b>${L.map(R=>`<small>✸ ${ico(R.d)} ${EL[R.d]} detonator: <b>${R.n}</b>, x${R.m} damage${R.splash?', splashes nearby foes':''}${R.fx?', may '+R.fx.map(f=>STS[f[0]].n).join(' or '):''}${R.strip?', strips boons':''}${R.selfFx?', grants Ward':''}${R.allyFx?', Regen for your line':''}.</small>`).join('')}</div></div>`;}).join('');
  const sts=Object.keys(STS).map(k=>`<div class="row"><i class="tag sttag ${STS[k].bad?'bad':'good'}" style="--c:${STS[k].c}">${stSym(k)}</i><div class="grow"><b>${STS[k].n}</b><small>${STS[k].d}</small></div></div>`).join('');
  const heard=(G&&G.loreHeard||[]);const lh=heard.length?`<h4>Heard in the realms</h4><div class="rows compact">${heard.map(x=>`<div class="row"><div class="grow"><small>${esc(ZS(x.s).n)}</small><b>${esc(x.t)}</b></div></div>`).join('')}</div>`:`<h4>Heard in the realms</h4><p class="note">Townsfolk drop hints about what waits in each realm. What you hear is written down here.</p>`;
  return (typeof overlayGuide==='function'?overlayGuide():'')+lh+`<h4>Element chart</h4><p class="note">Rows attack, columns defend. 2 means double damage, ½ means half. No element is immune to anything. Against two-element foes the matchups combine on a soft curve: two weaknesses deal x2.5 (never x4), a weakness plus a resist cancels out. Scourges, Calamities and heroes never take more than x2.</p>
    <div class="chartw"><table class="chart">${head}${rows}</table></div>
    <h4>Reactions</h4><p class="note">Reactions take two steps. A ⟐ Primer skill Primes a foe with its element for 2 of the foe's turns; a primed foe can't be primed again until it fades or detonates. Then a ✸ Detonator skill of the matching element sets it off. Plain elemental hits never react. Detonations hit 30% harder than the old free reactions and chip three pips off Break shields. Each skill's tag is shown in its description.</p><div class="rows compact">${reacts}</div>
    <h4>Mastery and dual types</h4><p class="note">Single-element heroes get +20% on their element and a chance to inflict its ailment. Dual-element heroes skip Mastery but cover two elements, learn a dual art and can set up reactions alone.</p>
    <h4>Weather</h4><p class="note">Each realm has its own weather. It lasts a good while as you walk, follows you between that realm's town and field, and is clear most of the time. Battles in the field use it. Dungeons are indoors and always calm.</p><div class="rows compact">${WX_BASE.map(k=>`<div class="row"><div><b>${WEATHER[k].i} ${WEATHER[k].n}</b><small>${WEATHER[k].d}</small></div></div>`).join('')}</div>${typeof superGuide==='function'?superGuide():''}
    <h4>Ailments and boons</h4><div class="rows compact">${sts}</div>`;
}
function mSettings(){return box('Settings',settingsBody());}
function settingsBody(){
  const c=META.cfg,opt=(k,vals,lab)=>`<div class="row"><div><b>${lab}</b></div><div class="chips">${vals.map(v=>`<button class="chip ${c[k]===v[0]?'on':''}" data-act="cfg" data-arg='${JSON.stringify([k,v[0]])}'>${v[1]}</button>`).join('')}</div></div>`;
  return `<div class="rows"><div class="row"><div><b>Sound</b><small>Mutes music and effects everywhere. The 🔊 button in the top bar does the same on any screen.</small></div><div class="chips"><button class="chip ${c.mute?'':'on'}" data-act="cfg" data-arg='["mute",false]'>On</button><button class="chip ${c.mute?'on':''}" data-act="cfg" data-arg='["mute",true]'>Muted</button></div></div>${opt('speed',[[1,'1x'],[1.5,'1.5x'],[2,'2x']],'Battle speed')}${opt('enc',[['off','Off'],['low','Low'],['normal','Normal'],['high','High']],'Encounters')}${opt('diff',[['story','Story'],['normal','Normal'],['hard','Hard']],'Difficulty')}
    ${opt('music',[[0,'Off'],[.25,'Low'],[.45,'Mid'],[.7,'High']],'Music')}${opt('sfx',[[0,'Off'],[.3,'Low'],[.6,'Mid'],[.9,'High']],'Sound effects')}${opt('autoStats',[[true,'Auto'],[false,'Manual']],'New stat points')}${opt('autoEquip',[[false,'Ask me'],[true,'Auto equip']],'New gear')}${opt('minimap',[[null,'Auto'],[true,'On'],[false,'Off']],'Minimap')}${opt('rmotion',[[null,'Follow device'],[true,'Reduced'],[false,'Full']],'Motion')}</div>
    <div class="btnrow"><button class="btn" data-act="autoOpen">Auto battle settings</button></div><p class="note">Encounters Off still lets Scourges, Calamities, elites and the arena fight you. Hard raises foe power 18% and rewards 25%.</p>`;
}
settingsBody=HOOK.def('settingsBody',settingsBody);// v0.9.9: one definition; modules add hooks (hooks.js)
function mLegacy(){
  const ids=Object.keys(G.roster).filter(id=>!(META.legacy||[]).includes(id)&&!TPL[id].mon);
  return box('Choose a Legacy',`<p class="story">The Meridian burns again. One of your wayfarers will carry this journey into every journey after it: they join each new game at level 5 with veteran stats.</p><div class="grid mini">${ids.map(id=>{const c=G.roster[id];return `<button class="mini" data-act="legacy" data-arg="${id}"><img src="${heroURL(id)}" alt=""><b>${esc(c.name)}</b><small>Lv ${c.lv} ${CLS[TPL[id].cls].n}</small><span class="els">${c.el.map(ico).join('')}</span></button>`;}).join('')}</div>`,'<button class="btn" data-act="closeModal">Decide later</button>',true);
}

// ----- actions -----
function assignSlot(id,slot){const p=[];for(let i=0;i<6;i++)p.push(G.party[i]||null);const cur=p.indexOf(id),prev=p[slot];if(cur>=0)p[cur]=prev;p[slot]=id;G.party=p.filter(Boolean);}
function enterWorldFromSave(){
  const p=G.pos||{m:'t0',x:6,y:6,f:'r'};resetMaps();V.screen='world';V.modal=null;render();
  try{placeAt(p.m,p.x,p.y,p.f);}catch(e){const [ix,iy]=innSpot(G.lastTown||0);placeAt('t'+(G.lastTown||0),ix,iy,'d');}
  if(solidAt(WS.m,WS.x,WS.y)){const lt=G.lastTown||0,[ix,iy]=innSpot(lt);placeAt('t'+lt,ix,iy,'d');}showLocation();render();
}
const ACT={
  new(){V.screen='starter';V.pick=[];V.starterSeed=(Math.random()*4294967296)>>>0;V.starterOpts=starterDraw(V.starterSeed);V.ngCycle=META.cycles||0;V.legacyPick=(META.legacy||[]).filter(id=>TPL[id]).slice(-1);if([0,1,2].some(s=>slotState(s)!=='empty')){V.modal={type:'slots',mode:'new'};}render();},
  pickLeg(id){const L=V.legacyPick=V.legacyPick||[];const i=L.indexOf(id);if(i>=0)L.splice(i,1);else{L.push(id);if(L.length>2)L.shift();}while(V.pick.length>starterSlots())V.pick.pop();render();},
  slots(){V.modal={type:'slots',mode:'load'};render();},
  toTitle(){V.screen='title';V.modal=null;B=null;render();},
  beginGo(){V.modal=null;V.confirmFew=1;try{ACT.begin();}finally{V.confirmFew=0;}},
  pickS(id){const i=V.pick.indexOf(id);if(i>=0)V.pick.splice(i,1);else if(V.pick.length<starterSlots())V.pick.push(id);render();},
  begin(){if(V.pick.length<1||V.pick.length>starterSlots())return;const tot=V.pick.length+3-starterSlots();if(tot<3&&!V.confirmFew){V.modal={type:'startfew',n:tot};render();return;}newGame(V.pick,V.ngCycle||0,V.legacyPick||[]);if(G&&G.run)G.run.sseed=V.starterSeed||0;resetMaps();V.screen='world';render();const [x,y]=innSpot(0);placeAt('t0',x,y,'r');showLocation();saveGame();V.modal={type:'story',title:ZS(0).town,text:ZS(0).intro,btn:'Begin'};render();},
  settings(){V.modal={type:'settings'};render();},
  mute(){META.cfg.mute=!META.cfg.mute;saveMeta();audioVol();toast(META.cfg.mute?'Sound muted.':'Sound on.');render();},
  cfg(a){const [k,v]=JSON.parse(a);META.cfg[k]=v;saveMeta();applyCfg();audioVol();render();},
  menu(){if(V.screen!=='world')return;if(V.modal&&V.modal.type==='menu'){V.modal=null;}else{V.lastMenuTab='party';V.modal={type:'menu',tab:'party'};}render();},
  menuTab(t){V.lastMenuTab=t;(V.menuSub=V.menuSub||{})[menuGroupOf(t)[0]]=t;V.modal={type:'menu',tab:t};render();},
  menuGrp(g){const G0=MENU_GROUPS.find(x=>x[0]===g)||MENU_GROUPS[0];const t=g==='records'?null:(V.menuSub||{})[G0[0]];ACT.menuTab(t&&G0[2].includes(t)?t:G0[2][0]);},/* v0.4.1 1.12: Records always opens on Journey */
  menuParty(){V.modal={type:'menu',tab:'party'};render();},
  menuBack(){V.modal={type:'menu',tab:V.lastMenuTab||'party'};render();},
  beast(k){V.modal={type:'beast',k};render();},
  pmove(a){const [i,d]=a.split(',').map(Number),j=i+d,p=G.party;if(j<0||j>=p.length)return;[p[i],p[j]]=[p[j],p[i]];saveGame();sfx('blip');render();},
  assignM(i){if(!inTown())return;assignSlot(V.modal.id,+i);saveGame();sfx('blip');render();},
  unassignM(){if(!inTown())return;if(G.party.length>1){G.party=G.party.filter(x=>x!==V.modal.id);saveGame();}render();},
  viewChar(id){V.modal={type:'char',char:id,gear:null,list:(V.charList||[]).slice()};render();},
  charNav(d){const m=V.modal;if(!m)return;const L=(m.list||[]).filter(x=>G.roster[x]);if(L.length<2)return;const i=L.indexOf(m.char);m.char=L[((i<0?0:i)+(+d)+L.length)%L.length];m.gear=null;if(typeof sfx==='function')sfx('blip');render();const p=document.querySelector('#modal .panel');if(p)p.scrollTop=0;},
  xClose(){const m=V.modal;if(!m)return;const t=m.type;
    if(t==='result')return ACT.resultOk();if(t==='story')return ACT.storyOk();if(t==='lose')return ACT.loseOk();
    if(t==='feedback')return ACT.fbClose();if(t==='fbcopy')return ACT.fbCopyBack();if(t==='dailyEnd')return ACT.dailyDone();
    if(t==='talk'){V.modal=m.from||null;render();return;}
    V.modal=null;render();},
  useItem(id){V.modal={type:'useitem',id};render();},
  useOn(cid){const id=V.modal.id,c=G.roster[cid],h0=c?c.hp:0,m0=c?c.mp:0;
    if(useItemField(id,c)){const dh=c.hp-h0,dm=c.mp-m0,parts=[];if(h0<=0&&c.hp>0)parts.push('revived');if(dh>0)parts.push('+'+dh+' HP');if(dm>0)parts.push('+'+dm+' MP');
      const msg=`${TPL[cid].n}: ${parts.join(', ')||'cured'} (${ITEMS[id].n}).`;toast(msg);if(V.modal&&V.modal.id===id)V.modal.last=msg;sfx('heal');}// the amount and the hero, for HP and MP items alike
    else toast('That would have no effect.');render();},
  talk(){interact();},
  runT(){WS.run=!WS.run;render();},
  save(){toast(saveGame()?'Journey saved.':'Saving is not available here.');},
  rest(){if(restAll(townS())){toast('Everyone is rested and healed.');sfx('heal');if(V.modal&&V.modal.type==='inn')V.modal=null;}else toast('Not enough gold for a room.');render();},// v0.4.3: the Inn closes after a rest
  
  closeModal(){V.modal=null;render();},
  flt(k){V.flt=k;render();},
  openChar(id){V.modal={type:'guild',char:id,gear:null,tab:'party',list:(V.charList||[]).slice()};render();},
  charBack(){V.modal={type:'guild',tab:'recruit'};render();},
  gearSlot(sl){V.modal.gear=sl;render();},
  gearBack(){V.modal.gear=null;render();},
  equip(gid){equipGear(G.roster[V.modal.char],gid);V.modal.gear=null;render();},
  unequip(sl){unequipGear(G.roster[V.modal.char],sl);V.modal.gear=null;render();},
  assign(i){assignSlot(V.modal.char,+i);saveGame();render();},
  unassign(){if(G.party.length>1){G.party=G.party.filter(x=>x!==V.modal.char);saveGame();}render();},
  addPt(k){const c=G.roster[V.modal.char];if(!c||c.pts<=0)return;c.alloc[k]=(c.alloc[k]||0)+1;c.pts--;refresh(c);saveGame();render();},
  autoPts(){const c=G.roster[V.modal.char];c.auto=c.auto===false;if(c.auto!==false)autoAlloc(c);refresh(c);saveGame();render();},
  respec(){const c=G.roster[V.modal.char],cost=respecCost(c);if(G.gold<cost)return;G.gold-=cost;c.pts+=Object.values(c.alloc).reduce((a,b)=>a+b,0);c.alloc={};c.auto=false;refresh(c);saveGame();toast('Points refunded. Spend them as you like.');render();},
  seal(){const c=G.roster[V.modal.char],code=heroSeal(c);try{navigator.clipboard.writeText(code).then(()=>toast('Hero seal copied. Co-op raids will use these.'),()=>toast(code.slice(0,40)+'...'));}catch(e){toast('Seal: '+code.slice(0,40)+'...');}},
  hire(id){if(!hireOK(id))return;if(recruit(id,false)){toast(TPL[id].n+' joins your roster. Add them to your six from the menu while in town.');sfx('buy');}else toast('Not enough gold.');render();},
  buyItem(id){const it=ITEMS[id];if(G.gold>=it.price&&(G.inv[id]||0)<invCap()){G.gold-=it.price;G.inv[id]=(G.inv[id]||0)+1;saveGame();sfx('buy');}render();},
  buyGear(id){const g=GEAR[id];if(G.gold>=g.price){G.gold-=g.price;G.gear.push(id);saveGame();sfx('buy');toast('Bought '+g.n+'.');}render();},
  sell(id){const i=G.gear.indexOf(id);if(i>=0){G.gear.splice(i,1);G.gold+=sellVal(gearOf(id));saveGame();sfx('buy');}render();},
  craft(i){const r=RECIPES[+i];if(craft(r)){toast((r.item?'Crafted: ':'Forged: ')+(r.item?ITEMS[r.item].n:gearOf(r.id).n));sfx('chest');}else sfx('deny');render();},
  qAccept(id){const q=G.quests.find(q=>q.id===id);if(q){q.state='active';saveGame();toast('Quest accepted: '+q.title);}render();},
  qClaim(id){const q=G.quests.find(q=>q.id===id);if(!q)return;if(q.type==='wanderer'){q.state='claimed';G.gold+=200+q.stage*150;toast(`The town thanks you: ${200+q.stage*150} gold.`);saveGame();render();return;}const r=claimQuest(q);if(r){toast('Reward: '+r.join(', '));sfx('chest');}render();},
  bounty(id){const b=G.bounties.find(b=>b.id===id);if(b){b.state='active';saveGame();toast(`${b.name} now roams ${ZS(b.stage).n}.`);}render();},
  fightElite(){const b=V.modal.b;V.modal=null;if(!startBattle({stage:b.stage,kind:'elite',bounty:b})){toast('Your party needs rest first.');render();}},
  arena(i){const A=ARENA[+i];if(!A)return;V.modal=null;if(!startBattle({stage:Math.min(G.stage,4),kind:'arena',tier:+i,waves:A.waves,lvs:A.lvs.slice()})){toast('Your party needs rest first.');render();}},
  echo(k){V.modal=null;if(!startBattle(echoSpec(k))){toast('Your party needs rest first.');render();}},
  travel(s){travelTo(+s);},
  fightBoss(s){V.modal=null;if(!startBattle({stage:+s,kind:'boss'})){toast('Your party needs rest first.');render();}},
  pickLegacy(){V.modal={type:'legacy'};render();},
  legacy(id){chooseLegacy(id);G.legacyChosen=id;V.modal={type:'ngplus',id};saveGame();render();},
  startNG(){V.modal=null;V.screen='starter';V.pick=[];V.ngCycle=Math.max(1,META.cycles||0);V.legacyPick=(META.legacy||[]).filter(id=>TPL[id]).slice(-1);render();},
  auto(){V.auto=!V.auto;if(B){B.auto=V.auto;if(B.auto&&B.mode==='cmd')later(autoTurn,200);}render();},
  speed(){const s=[1,1.5,2],i=(s.indexOf(META.cfg.speed)+1)%3;META.cfg.speed=s[i<0?0:i];saveMeta();applyCfg();render();},
  cmd(a){if(!B||B.mode!=='cmd')return;
    if(a==='attack')return chooseSkill(ATTACK);
    if(a==='limit'){if(!lbReady(B.cur))return;sfx('limit');return chooseSkill(limitSkill(B.cur));}
    if(a==='guide'||a==='lore'){V.modal={type:a==='lore'?'battlelore':'battleguide'};render();return;}if(a==='guard')return guard();if(a==='flee')return flee();
    if(a==='scan'){const lv=B.en.filter(e=>e.hp>0);if(lv.length===1)return scan(lv[0]);B.pend={scan:1,sk:{t:'one'}};B.tgFrom='root';B.menu='target';render();return;}
    if(a==='swap'&&!canSwap())return;
    B.menu=a;render();},
  back(){if(B){B.menu=B.menu==='target'&&B.tgFrom&&B.tgFrom!=='target'?B.tgFrom:'root';B.tgFrom=null;B.pend=null;render();}},
  sk(id){if(!B||B.mode!=='cmd')return;const s=known(B.cur).find(x=>x.id===id);if(!s||B.cur.mp<s.mp)return;chooseSkill(s);},
  item(id){if(!B||B.mode!=='cmd'||!(G.inv[id]>0))return;{const it=ITEMS[id],ok=allParty().filter(c=>it.revive?c.hp<=0:c.hp>0);if(ok.length===1){B.pend=null;useItem(id,ok[0]);return;}}B.pend={item:id};B.tgFrom='items';B.menu='target';render();},
  tgtE(i){if(!B||B.mode!=='cmd'||!B.pend||!B.pend.sk)return;const e=B.en[+i];if(!e||e.hp<=0)return;if(B.pend.sk.t!=='one'&&B.pend.sk.t!=='chain'&&!(typeof healsUndead==='function'&&healsUndead(B.pend.sk,e)))return;if(B.pend.scan){B.pend=null;return scan(e);}exec(B.pend.sk,[e]);},
  tgtA(i){if(!B||B.mode!=='cmd'||!B.pend)return;const c=allParty()[+i];if(!c)return;
    if(B.pend.item){const it=ITEMS[B.pend.item];if(it.revive?c.hp<=0:c.hp>0)useItem(B.pend.item,c);return;}
    const s=B.pend.sk;if(!s)return;if(s.t==='ally'&&c.hp>0)exec(s,[c]);else if(s.t==='dead'&&c.hp<=0)exec(s,[c]);},
  sw(i){if(!B||B.mode!=='cmd')return;if(doSwap(+i)===false)render();},
  resultOk(){const i=V.modal.info;/* v0.8.2: no sound on leaving the rewards (the victory theme is enough) */if(i.story){V.modal={type:'story',title:i.story.title,text:i.story.text,btn:G.won&&B&&B.stage===4?'The light returns':'Continue',after:'finish'};render();}else{V.modal=null;finishBattle('win');}},
  storyOk(){const m=V.modal;V.modal=null;if(m&&m.after==='finish')finishBattle('win');else render();},
  loseOk(){V.modal=null;finishBattle('lose');}
};
function chooseSkill(sk){
  const t=sk.t;
  if(t==='all'||t==='rand')return exec(sk,B.en.filter(e=>e.hp>0));
  if(t==='self')return exec(sk,[B.cur]);
  if(t==='allyAll')return exec(sk,B.front.filter(c=>c.hp>0));
  // v0.9.x: exactly one valid target means no choice to make: act at once (never when more than one is valid)
  // v0.11.8: Settings > Single target skills: "Fire at once" (META.cfg.autoOne==='fire') skips the target step when only one target is valid; "Ask" always asks; Fire at once is the default (the old behaviour)
  const fire=META.cfg.autoOne!=='ask';/* default Fire at once: the game always fired with one foe left */
  if(t==='one'||t==='chain'){const lv=B.en.filter(e=>e.hp>0);if(fire&&lv.length===1)return exec(sk,[lv[0]]);}
  else if(t==='ally'||t==='dead'){
    const mine=allParty().filter(c=>t==='dead'?c.hp<=0:c.hp>0),und=B.en.filter(e=>typeof healsUndead==='function'&&healsUndead(sk,e));
    if(fire&&mine.length===1&&!und.length)return exec(sk,[mine[0]]);}
  B.pend={sk};B.tgFrom=B.menu==='target'?'root':B.menu;B.menu='target';render();
}

// ----- loop & input -----
let LAST=0;
function loop(){
  const now=performance.now();
  try{padPoll(now);}catch(e){}
  if(V.screen==='world'&&WS.cv){worldTick(now-LAST,now);worldDraw(now);
    const l=$('wloc');if(l){const on=WS.locT&&Date.now()-WS.locT<2600;const txt=on?WS.locN:'';if(l.textContent!==txt)l.textContent=txt;l.className='wloc'+(on?' on':'');}}
  if(V.screen==='battle'&&B)battleFrame(now);
  if(V.screen==='title'){const cv=$('tcv');if(cv){const box=cv.parentElement.clientWidth,sc=box>=720?3:2,W=Math.floor(box/sc),H=Math.floor(260/sc);if(cv.width!==W){cv.width=W;cv.height=H;cv.style.width=W*sc+'px';cv.style.height=H*sc+'px';}const ctx=cv.getContext('2d');titleDraw(ctx,W,H,now);}}
  LAST=now;requestAnimationFrame(loop);
}
const KEYDIR={ArrowUp:'u',ArrowDown:'d',ArrowLeft:'l',ArrowRight:'r',w:'u',s:'d',a:'l',d:'r',W:'u',S:'d',A:'l',D:'r'};
function boot(){
  loadMeta();applyCfg();
  const unlock=()=>{audioInit();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume();};
  // v0.9.1: start the audio at launch so the title music plays where the system allows it (the Windows app, the Android app, browsers
  // the player often uses); elsewhere the context waits suspended and the first tap resumes it. It used to wait for the first tap, which
  // on the title is usually Continue, so the menu music was never heard.
  try{setTimeout(()=>{try{audioInit();if(AU.ctx&&AU.ctx.state==='suspended')AU.ctx.resume().catch(()=>{});}catch(e){}},300);}catch(e){}
  document.addEventListener('pointerdown',unlock);document.addEventListener('keydown',unlock);
  document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t||t.disabled)return;if(t.classList.contains('unit'))return;if(V._press&&Date.now()-V._press.t<350&&V._press.act===t.dataset.act&&V._press.arg===(t.dataset.arg||''))return;const f=ACT[t.dataset.act];if(f){e.preventDefault();f(t.dataset.arg,t);}});
  // Beta v0.3.1: if a re-render swaps the button out between press and release, the browser drops the click.
  // Catch that case on release and run the action for the button now under the finger.
  {let P=null;document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('[data-act]');P=t&&!t.classList.contains('unit')?{el:t,act:t.dataset.act,arg:t.dataset.arg||'',x:e.clientX,y:e.clientY}:null;},true);
   document.addEventListener('pointerup',e=>{const p=P;P=null;if(!p||p.el.isConnected||Math.hypot(e.clientX-p.x,e.clientY-p.y)>14)return;const t=document.elementFromPoint(e.clientX,e.clientY),n=t&&t.closest('[data-act]');
     if(n&&n.dataset.act===p.act&&(n.dataset.arg||'')===p.arg&&!n.disabled&&ACT[p.act]){V._press={t:Date.now(),act:p.act,arg:p.arg};ACT[p.act](p.arg,n);}},true);}
  // battle overlay buttons re-render often, so they take the press on pointerdown
  document.addEventListener('pointerdown',e=>{const t=e.target.closest('.unit.tg[data-act]');if(!t)return;e.preventDefault();const f=ACT[t.dataset.act];if(f)f(t.dataset.arg,t);});
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('unit')&&e.target.classList.contains('tg')){e.preventDefault();ACT[e.target.dataset.act](e.target.dataset.arg);}});
  window.addEventListener('keydown',e=>{
    if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&!(e.key==='Escape'&&e.target.tagName==='SELECT'))return;
    if(kmIs(e,'run'))WS.run=true;
    if(kmIs(e,'mute')&&!(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))){ACT.mute();return;}
    if(kmIs(e,'back')&&V.modal){e.preventDefault();ACT.xBack();return;}
    if(kmIs(e,'back')&&!V.modal&&V.screen==='battle'&&B&&B.mode==='cmd'&&B.menu!=='root'){e.preventDefault();ACT.back();return;}
    if(kmIs(e,'back')&&!V.modal&&V.screen==='battle'&&B&&B.uDet){e.preventDefault();ACT.uClose();return;}
    if(V.modal&&(V.modal.type==='char'||(V.modal.type==='guild'&&V.modal.char))&&!V.modal.gear&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();ACT.charNav(e.key==='ArrowLeft'?-1:1);return;}
    if(V.screen!=='world')return;
    const d=kmDir(e);
    if(d&&!V.modal){e.preventDefault();if(WS.swallow&&WS.swallow.has(e.key))return;if(!WS.held.includes(d)){WS.held.push(d);inputTouch('kb');WS.target=null;WS.path=null;}return;}
    if(kmIs(e,'interact')&&!V.modal){e.preventDefault();interact();return;}
    if(kmIs(e,'menu')||(kmIs(e,'back')&&!V.modal)){ACT.menu();}
  });
  window.addEventListener('keyup',e=>{KEYS_DOWN.delete(e.key);if(WS.swallow)WS.swallow.delete(e.key);if(kmIs(e,'run'))WS.run=false;const d=kmDir(e);if(d)WS.held=WS.held.filter(x=>x!==d);});
  window.addEventListener('keydown',e=>{KEYS_DOWN.add(e.key);},true);
  window.addEventListener('blur',()=>{WS.held=[];WS.padDir=null;WS.joyDir=null;KEYS_DOWN.clear();WS.swallow=null;});
  window.addEventListener('resize',()=>{if(V.screen==='world')worldSizeCanvas();if(V.screen==='battle'){layoutBattle();render();}});
  if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>{if(V.screen==='world')worldSizeCanvas();});
  // v0.5.0 1.2: header or toolbar height changes (a chip wraps, a banner appears) also resize the view
  if(window.ResizeObserver){try{const ro=new ResizeObserver(()=>{if(V.screen==='world')worldSizeCanvas();});ro.observe($('hdr'));}catch(e){}}
  render();requestAnimationFrame(loop);
  setInterval(()=>{if(V.screen==='battle'&&B&&animating())renderBattle(true);},110);
}
