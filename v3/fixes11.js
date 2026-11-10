// ===== fixes11.js (v0.16.1): small fixes from the owner's seventh batch =====
// 1. The Training team (party3.js p6Train) is the heroes three or more levels below the roster's top plus the anchors a team needs; it no
//    longer fills its remaining slots with the next lowest levels (heroes a level or two behind, who merely have levels left). The free
//    slots go to the strongest of the rest. XP catch up is untouched.
// 2. After an arena fight (win or loss) the results screen returns to the Guild Hall's arena page instead of the town street.
// 3. (zones.js) the Eclipse Gauntlet recommends level 50, the cap, not 52.
{const t0=p6Train;p6Train=function(X,jit){const r=t0.apply(this,arguments);try{if(!r)return r;const gap=(BP6&&BP6.train&&BP6.train.gap)||3,keep=r.set.filter(c=>r.anchors.includes(c)||X.top-c.lv>=gap);
  if(keep.length===r.set.length)return r;const rest=X.all.filter(c=>!keep.includes(c)).sort((a,b)=>X.pw[b.id]-X.pw[a.id]);const set=keep.concat(rest.slice(0,X.size-keep.length));
  return {set:set.sort((a,b)=>a.lv-b.lv),trainees:set.filter(c=>!r.anchors.includes(c)&&X.top-c.lv>=gap),anchors:r.anchors.concat(rest.slice(0,X.size-keep.length))};}catch(e){return r;}};}
HOOK.before('finishBattle','fixes11','remember an arena fight',function(){try{if(B&&B.spec&&B.spec.kind==='arena')V.arenaBack=1;}catch(e){}});
{const ok0=ACT.resultOk;ACT.resultOk=function(){const back=V.arenaBack;V.arenaBack=0;const r=ok0.apply(this,arguments);try{if(back&&!V.modal&&V.screen!=='battle'){V.modal={type:'guild',tab:'arena'};render();}}catch(e){}return r;};}
// ----- v0.16.5: one reaction marker, not three -----
// A reaction showed a "✸ Melt!" banner (battle3 section 9), a floating "Melt! +N MP" effect text (engine fx + battle4) and the target tag's
// reaction preview at once. The banner now carries the MP line and the floating text is dropped while the banner shows; the target tag
// stays (it is a preview before the hit, not a notice).
{const dr0=doReaction;doReaction=function(a,t,el){const R=dr0.apply(this,arguments);try{if(R&&t&&t.fx&&B&&B.b9rx&&Date.now()-B.b9rx.t0<B9.banMs){for(let i=t.fx.length-1;i>=0;i--){const f=t.fx[i];if(f.cls==='react'){if(f.b4mp)B.b9rx.mp=f.b4mp;t.fx.splice(i,1);break;}}}}catch(e){}return R;};}
{const rx0=b9RxHtml;b9RxHtml=function(){let h=rx0.apply(this,arguments);try{const ev=B&&B.b9rx;if(ev&&ev.mp&&h)h=h.replace('!</b>',`!</b><small class="b9mp">+${ev.mp} MP</small>`);}catch(e){}return h;};}
{const bb0=b9BanBox;b9BanBox=function(ev){if(!ev||!ev.mp)return bb0.apply(this,arguments);const n0=ev.n;ev.n=n0+' +'+ev.mp+' MP';try{return bb0.call(this,ev);}finally{ev.n=n0;}};}// the box is measured with the MP text, so nothing is cut (v095b)
try{const st=document.createElement('style');st.textContent='.bstage .b9ban .b9mp{display:inline;font-size:.78em;opacity:.95;color:#8ad0ff;margin-left:.35em;font-weight:800}';document.head.appendChild(st);}catch(e){}
// ----- v0.16.5: a won rift gate always lights -----
// Gates glow from META.best['Echo '+name].kills, which engine.js counts per unit base name. An Echo that changes form (phase 2) or dies
// as another unit left the record on the other name, so its gate stayed dark. A rift win now marks the gate's own Echo record too.
HOOK.after('win','fixes11','rift gate kill record',function(){try{const sp=B&&B.spec;if(!sp||sp.kind!=='echoBoss'||!sp.rift||!sp.key)return;const d=guardianDef(sp.key);if(!d)return;const b=bestOf('Echo '+d.n);if(!(b.kills>0))b.kills=1;if(typeof saveMeta==='function')saveMeta();}catch(e){}});
// ----- v0.16.7: Echo Rift gates glow per journey -----
// drawPortal, rift9's glow, mPortal and rkBeaten all read META.best['Echo '+name].kills (account wide). The owner wants the hall to reflect
// this journey: a rift win records G.riftWon[key]=1, and while those functions run META.best is swapped for a view in which each Echo's
// kills come from G.riftWon. The account record is still kept for the Codex. Old journeys start dark until the gates are won again.
function riftView(){const v=Object.assign({},META.best||{});try{echoKeys().forEach(k=>{const d=guardianDef(k);if(!d)return;const w=!!(G&&G.riftWon&&G.riftWon[k]);v['Echo '+d.n]=Object.assign({},v['Echo '+d.n]||{},{kills:w?1:0});});}catch(e){}return v;}
function withRiftView(fn){const b0=META.best;try{META.best=riftView();return fn();}finally{META.best=b0;}}
{const dp0=drawPortal;drawPortal=function(){const a=arguments;return withRiftView(()=>dp0.apply(this,a));};}
{const mp0=mPortal;mPortal=function(){const a=arguments;return withRiftView(()=>mp0.apply(this,a));};}
{const rb0=rkBeaten;rkBeaten=function(){const a=arguments;return withRiftView(()=>rb0.apply(this,a));};}
HOOK.after('win','fixes11','rift win per journey',function(){try{const sp=B&&B.spec;if(!sp||sp.kind!=='echoBoss'||!sp.rift||!sp.key||!G)return;G.riftWon=G.riftWon||{};G.riftWon[sp.key]=1;}catch(e){}});
// the Riftkeeper says what the hall is for
HOOK.xform('vModal','fixes11','Riftkeeper warning',function(h,m){try{if(m&&m.type==='rkrest'&&typeof rkUnlocked==='function'&&!rkUnlocked()){const n=rkBeaten().length,t=echoKeys().length;h=h.replace('<p class="note">Restores',`<p>"Break every Echo in this hall (${n} of ${t} so far) and the centre gate will open. Be warned: what waits behind it is stronger than anything you have faced."</p><p class="note">Restores`);}}catch(e){}return h;});
// ----- v0.16.7: the "Guard against a big hit" goal counts any Guard made while a foe telegraphs -----
// prog2 counted it only when a foe's Crushing Charge or Cataclysm landed on a guarding hero. Bosses with their own wind ups never
// counted, so the goal sat in the list at the end of the game. Guarding while any living foe has a charge or telegraph up counts now.
{const g0=guard;guard=function(){try{if(B&&B.nz&&B.cur&&B.cur.side==='p'&&(B.en||[]).some(e=>e.hp>0&&e.st&&(e.st.charge||e.st.g_tele))){B.nz.guard++;if(!B.nz.tele)B.nz.tele=1;}}catch(e){}return g0.apply(this,arguments);};}
