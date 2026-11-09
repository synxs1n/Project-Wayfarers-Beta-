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
try{const st=document.createElement('style');st.textContent='.bstage .b9ban .b9mp{display:block;font-size:.72em;opacity:.9;color:#8ad0ff;line-height:1.1}';document.head.appendChild(st);}catch(e){}
// ----- v0.16.5: a won rift gate always lights -----
// Gates glow from META.best['Echo '+name].kills, which engine.js counts per unit base name. An Echo that changes form (phase 2) or dies
// as another unit left the record on the other name, so its gate stayed dark. A rift win now marks the gate's own Echo record too.
HOOK.after('win','fixes11','rift gate kill record',function(){try{const sp=B&&B.spec;if(!sp||sp.kind!=='echoBoss'||!sp.rift||!sp.key)return;const d=guardianDef(sp.key);if(!d)return;const b=bestOf('Echo '+d.n);if(!(b.kills>0))b.kills=1;if(typeof saveMeta==='function')saveMeta();}catch(e){}});
