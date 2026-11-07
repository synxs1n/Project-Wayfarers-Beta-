// ===== chain5.js (v0.10.4): Chain targeting, planned foe targets (the telegraph names who), the Guard cue and reward =====
// Chain (skills with t:'chain'): the player picks one foe; perform then rolls CHAIN.leap for a leap to another live foe not yet hit,
// again after each leap, up to CHAIN.max foes. Auto battle treats it as a single target skill (the leaps still roll).
// Planned targets: foePlan (battle5.js) decides a foe's move a turn ahead; now it also decides who it aims at, from the same seeded
// stream, with the engine's own rule (a Taunt, else the weakest 30% of the time, else anyone; pack focus). enemyTurn0 keeps its own
// roll (the RNG sequence does not move), and the perform hook redirects a single target hit to the planned hero when they still
// stand and no Taunt took over. The intent tag on the stage and the hero's card show the aim.
// Guard: the cue (battle5 b9Cue) also glows when the acting hero is the planned target of a hit worth G5.heavy of their HP, or of two
// foes, before they act again. A hero who guards a hit aimed at them gets their next turn sooner (G5.quick).
const B9_STAGE_WEAK=false;
function c5Single(sk){return !sk||!sk.t||sk.t==='one'||sk.t==='chain';}
// ----- Chain -----
HOOK.before('perform','chain5','Chain leaps',function(a,sk,tgts){try{if(!B||!sk||sk.t!=='chain'||!tgts||tgts.length!==1||!a)return;const first=tgts[0];
  const foesOf=a.side==='p'?B.en:B.front;const live=foesOf.filter(e=>e.hp>0&&e!==first);let n=0;
  while(live.length&&tgts.length<(CHAIN.max||4)&&RNG()<(CHAIN.leap||.5)){const i=Math.floor(RNG()*live.length);tgts.push(live.splice(i,1)[0]);n++;}
  if(n)log(`${sk.n} leaps to ${n} more foe${n>1?'s':''}!`);}catch(e){}});
// ----- planned targets -----
function c5PlanTarget(u,p){try{if(!B||!p||!p.sk||!c5Single(p.sk)||p.sk.t==='self')return null;const live=B.front.filter(c=>c.hp>0);if(!live.length)return null;
  const i=Math.max(0,B.en.indexOf(u)),rand=seeded((B.seed^Math.imul(i+1,0x9E3779B1)^Math.imul(p.n,0x85EBCA77)^Math.imul(B.wave||1,0xC2B2AE35)^0x5bd1e995)>>>0);rand();
  const taunt=live.filter(c=>has(c,'taunt'));if(taunt.length)return taunt[0];
  const low=live.slice().sort((a,b)=>a.hp/a.S.mhp-b.hp/b.S.mhp)[0];
  const packed=!u.boss&&!u.elite&&!(G&&G.daily)&&(B.stage||0)>=(PACK.fromStage||0)&&B.en.filter(e=>e.hp>0&&!e.boss&&!e.elite).length>1;
  if(packed&&B.packT&&B.packT.hp>0&&live.includes(B.packT)&&rand()<PACK.focus)return B.packT;
  return rand()<.3?low:live[Math.floor(rand()*live.length)];}catch(e){return null;}}
{const fp0=foePlan;foePlan=function(u){const p=fp0.apply(this,arguments);try{if(p&&!p.c5){p.c5=1;p.tgt=c5PlanTarget(u,p);}}catch(e){}return p;};}
// the plan a foe is acting on (enemyTurn0 reads foePlan first thing, then bumps u.turns)
{const et0=enemyTurn0;enemyTurn0=function(u){try{if(u&&u.side==='e')u._c5used=foePlan(u);}catch(e){}return et0.apply(this,arguments);};}
HOOK.before('perform','chain5','aim at the planned hero',function(a,sk,tgts){try{if(!B||!a||a.side!=='e'||!tgts||tgts.length!==1)return;const p=a._c5used;if(!p||!p.tgt||p.n!==a.turns)return;
  const same=p.sk===sk||(sk&&p.sk&&sk.id===p.sk.id)||(sk&&sk.id==='attack'&&p.sk===ATTACK);if(!same||!c5Single(sk))return;
  const t=p.tgt,cur=tgts[0];if(!cur||cur.side!=='p')return;if(has(cur,'taunt')&&!has(t,'taunt'))return;if(t.hp<=0||!B.front.includes(t))return;
  tgts[0]=t;
  // the reward: a guard that caught the planned hit makes the hero quick
  if(t.guard&&(sk.k==='phys'||sk.k==='mag')){t.c5q=1;fx(t,'Braced!','stat good');}}catch(e){}});
{const en0=endTurn;endTurn=function(u,cost){try{if(u&&u.c5q&&u.side==='p'){u.c5q=0;cost=(cost==null?1:cost)*(G5.quick||.7);log(`${u.name} shrugs off the blow and moves quickly.`);}}catch(e){}return en0.call(this,u,cost);};}
// ----- the cue -----
function c5Est(u,sk,t){try{const r0=RNG;RNG=()=>.5;try{const r=calcDamage(u,sk,t);return (r&&r.dmg||0)*(sk.hits||1);}finally{RNG=r0;}}catch(e){return 0;}}
function c5Aim(a){const out=[];if(!B||!a)return out;B.en.forEach(u=>{if(u.hp<=0)return;const p=foePlan(u);if(!p||p.tgt!==a||!p.sk||!(p.sk.k==='phys'||p.sk.k==='mag'))return;out.push({u,sk:p.sk,dmg:c5Est(u,p.sk,a)});});return out;}
{const cue0=b9Cue;b9Cue=function(){const r=cue0.apply(this,arguments);if(r)return r;try{const a=B&&B.cur;if(!a||a.side!=='p'||B.mode!=='cmd'||a.guard)return r;const aims=c5Aim(a);if(!aims.length)return r;
    let ord=null;const before=u=>{ord=ord||b5Order(12);for(let i=1;i<ord.length;i++){const x=ord[i].u;if(x===a)return false;if(x===u)return true;}return false;};
    const soon=aims.filter(o=>before(o.u));if(!soon.length)return r;const tot=soon.reduce((q,o)=>q+o.dmg,0),heavy=tot>=a.hp*(G5.heavy||.3)||soon.length>=2;if(!heavy)return r;
    const who=soon.map(o=>o.u.name).join(' and ');return {k:'guard',u:soon[0].u,glow:'guard',txt:`Guard! ${who} aim${soon.length>1?'':'s'} at ${a.name}`,tip:`${who} ${soon.length>1?'are':'is'} about to hit ${a.name} for about ${Math.round(tot)} before ${a.name} acts again. Guard halves it, and a guarded hit makes ${a.name} quick.`};}catch(e){return r;}};}
// ----- the telegraph on screen: the intent tag names the hero, the hero's card shows who aims at them -----
function c5Short(n){try{return shortName(n);}catch(e){return n;}}
HOOK.after('renderBattle','chain5','planned targets on the intent tags and the party cards',function(){try{if(!B||V.screen!=='battle')return;
  const aimAt=new Map();B.en.forEach(u=>{if(u.hp<=0)return;const p=foePlan(u);if(!p||!p.tgt||p.tgt.hp<=0)return;aimAt.set(p.tgt,(aimAt.get(p.tgt)||[]).concat([u]));
    const tag=document.querySelector(`.b5it[data-u="${unitRef(u)}"]`);if(tag&&!tag.querySelector('.c5aim')){const s=document.createElement('i');s.className='c5aim';s.textContent='→ '+c5Short(p.tgt.name);tag.appendChild(s);tag.title=(tag.title||'')+` Aims at ${p.tgt.name}.`;}});
  const party=allParty();aimAt.forEach((foes,c)=>{const i=party.indexOf(c);if(i<0)return;const card=document.querySelector(`#bparty [data-act="tgtA"][data-arg="${i}"], #bparty .pc[data-arg="${i}"]`);if(!card||card.querySelector('.c5tgt'))return;
    const s=document.createElement('span');s.className='c5tgt';s.title=`${foes.map(f=>f.name).join(' and ')} aim${foes.length>1?'':'s'} at ${c.name}`;s.textContent='⚔'+(foes.length>1?foes.length:'');card.appendChild(s);});}catch(e){}});
