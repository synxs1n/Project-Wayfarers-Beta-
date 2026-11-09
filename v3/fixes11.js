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
