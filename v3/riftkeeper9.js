// ===== riftkeeper9.js (v0.12.13): the Riftkeeper, the ultimate boss at the north end of the Echo Rift =====
// Unlock (account wide): every Rift gate's Echo beaten at least once (META.best['Echo <name>'].kills > 0 for every key in echoKeys()). Its gate
// stands at the north end of the hall's axis (RIFT_HALL.rk), sealed until then ("N of M Echoes beaten"), then lit. Fight: startBattle({kind:'riftkeeper',
// stage:4,lv:60}); no auto (autoBan), no fleeing (a boss). Data: foes.js RIFTKEEPER, art: art3.js rkArt (riftkeeper_<element> swaps the
// lantern colour), gate card and Warden rest in this file, NG+ modifier 'rift' in twists.js.
//   Phase 1 (100 to 66% HP): its element cycles every turn (fire, water, ice, lightning, earth, wind, light, shadow); its skills take that
//     element and it stands Primed with the partner element of the reaction, so a detonator of the CURRENT element reacts (Melt, Shatter...).
//     The intent names the element ("Fire Key-Lash"); the sprite's lantern burns that colour.
//   Phase 2 (66 to 33%): two Echo shades (40% HP copies of two beaten Echoes) join; while one lives and its shield holds it takes 40% less.
//   Phase 3 (33 to 0%): every 3rd turn it telegraphs Unmaking, a 3 turn countdown (chip, swell, intent); on the 3rd turn it lands for
//     150% of each hero's max HP (Guard halves it) unless its shield was broken in the meantime: then it fizzles (the Break itself costs it
//     its next turn). Each telegraph sets its shield to RKC.ward3 pips so the Break is a fair race.
// Rewards, once per account (META.riftkeeper): the charm c_riftkeeper, the title Riftwalker (META.titles.riftwalker), the NG+ modifier Rift.
// Later wins: Echo Essence x RKC.essence. Also here: ACT.riftRest (the Echo Warden's free rest). No Math.random; battle code uses RNG().
// New save fields: none in the game save; account fields META.riftkeeper and META.titles (synced as profile flags.riftkeeper).
const RKC={lv:60,hpM:1.9,powM:1.15,shield:8,ward3:6,every:3,count:3,unmakePct:1.5,wardCut:.4,shadeHp:.4,shadePow:.7,essence:6,elUp:.1,mpUp:.1};
const RK_KEY='__riftkeeper';
const RK_ELS=['fire','water','ice','lightning','earth','wind','light','shadow'];
// the element it stands Primed with while it burns the key: any partner that reacts with it (all pairs exist in REACT)
const RK_PRIME={fire:'ice',water:'lightning',ice:'lightning',lightning:'ice',earth:'lightning',wind:'lightning',light:'shadow',shadow:'light'};
const RK_BASE=['Key-Lash','Doorfall','Lantern Flare'];
const RK_UNMAKE={id:'rkUnmake',n:'Unmaking',k:'mag',pw:9,t:'all',el:'shadow',mp:0,cost:1,hits:1};
// ----- account state -----
function rkBeaten(){try{return echoKeys().filter(k=>{const d=guardianDef(k);return d&&(((META.best||{})[echoName(d)])||{}).kills>0;});}catch(e){return [];}}
rkBeaten=HOOK.def('rkBeaten',rkBeaten);
HOOK.wrap('rkBeaten','riftkeeper9','Echo records read through the journey view (rift9.js withRiftView)',function(next,...a){return withRiftView(()=>next(...a));});
function rkUnlocked(){try{return rkBeaten().length>=echoKeys().length;}catch(e){return false;}}
const rkTitle=()=>!!(META.titles&&META.titles.riftwalker);
// ----- statuses -----
STS.rk_unmake={n:'Unmaking',a:'UNM',bad:1,t:99,c:'#ff4a6a',d:'The Riftkeeper unmakes the party when the count reaches zero: 150% of every hero\'s max HP. Guard halves it. Break its shield before then and it fizzles.'};
ST_SYM.rk_unmake='<circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M5 2.4V5l1.8 1.2" fill="none" stroke="currentColor" stroke-width="1.1"/>';
// ----- the gate in the Echo Rift -----
{const bs0=buildSanctum;buildSanctum=function(){const m=bs0.apply(this,arguments);try{
  m.npcs.push({x:RIFT_HALL.rk[0],y:RIFT_HALL.rk[1],hx:RIFT_HALL.rk[0],hy:RIFT_HALL.rk[1],name:"The Riftkeeper's Gate",line:'',view:'front',face:'r',act:'riftkeeper',portal:1,key:RK_KEY,look:null});}catch(e){}return m;};}
HOOK.wrap('drawPortal','riftkeeper9',"the Riftkeeper's gate",function(next,ctx,px,py,n,now){
  if(n&&n.key===RK_KEY){const open=rkUnlocked(),f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(px+x,py+y,w,h);},ph=now/900,el=RK_ELS[Math.floor(ph)%8],col=open?ELC[el]:'#6a6a7c',edge=open?'#d4b464':'#5a5a68';
    f('#0e0a16',0,-3,16,19);f(edge,0,-3,16,1);f(edge,0,-3,1,19);f(edge,15,-3,1,19);f(edge,0,15,16,1);f(open?'#2a1f58':'#22202c',2,-1,12,15);f(open?'#4a4390':'#3a3844',2,-1,1,15);
    f(edge,7,-2,2,2);f(edge,3,1,1,10);f(edge,12,1,1,10);
    if(open){ctx.save();ctx.globalAlpha=.25+.2*Math.sin(now/260);ctx.fillStyle=col;ctx.fillRect(px+2,py-1,12,15);ctx.restore();}
    f('#06030e',5,3,6,8);f(col,6,5,4,4);f(open?'#ffffff':'#8a8a98',7,6,2,2);f(edge,5,3,6,1);f(edge,5,10,6,1);f(edge,5,3,1,8);f(edge,10,3,1,8);
    if(!open){f('#0e0a16',6,11,4,3);f('#9a9aa8',7,12,2,2);f('#9a9aa8',7,10,1,2);f('#9a9aa8',8,9,1,1);}
    return;}
  return next(ctx,px,py,n,now);});
function mRiftkeeper(){const d=guardianDef('riftkeeper'),have=rkBeaten().length,all=echoKeys().length,open=rkUnlocked(),first=!META.riftkeeper;
  return box('The Riftkeeper',`<div class="row"><img class="mimg" src="${monURL('riftkeeper')}" alt=""><div class="grow"><b>${esc(d.n)}</b><small>Ultimate boss · Level ${RKC.lv} · no auto · no fleeing${META.riftkeeper?' · beaten':''}</small>
      <small>${open?'The gate stands open. The keeper of every door waits behind it.':`${have} of ${all} Echoes beaten.`}</small></div></div>
    ${open?'':`<p class="note warn">Sealed. Beat every Echo in the Echo Rift at least once (the gates glow once their Echo has answered). ${have} of ${all} Echoes beaten.</p>`}
    <p class="note"><b>Phase 1:</b> its element changes every turn; set off a detonator of that element while it stands Primed. <b>Phase 2:</b> two Echo shades join and shield it while they live. <b>Phase 3:</b> every third turn it readies the Unmaking: guard, or break its shield before the count ends.</p>
    <p class="note">${first?'First win: Riftwalker\'s Key (all elements +10% damage, skills cost 10% more MP), the title Riftwalker, and the New Game+ modifier Rift.':`Each win: Echo Essence x${RKC.essence}.`}${rkTitle()?' You are a <b>Riftwalker</b>.':''}</p>`,
    `<button class="btn" data-act="closeModal">Not yet</button><button class="btn gold" data-act="rkFight" ${open?'':'disabled'}>Challenge</button>`);}
HOOK.before('vModal','riftkeeper9','Riftkeeper gate card, Warden rest',function(m){
  if(m&&m.type==='portal'&&m.key===RK_KEY)return HOOK.stop(mRiftkeeper());
  if(m&&m.type==='rkrest')return HOOK.stop(box('Echo Warden',`<p>"The Rift never tires, but you do. Sit a while by the gates: the Echoes will keep. No charge in here."</p><p class="note">Restores everyone's HP and MP and clears every ailment. Free.</p>${rkTitle()?'<p class="note">The Warden bows to a <b>Riftwalker</b>.</p>':''}`,
    '<button class="btn" data-act="closeModal">Not now</button><button class="btn gold" data-act="riftRest">Rest</button>'));});
// the Riftkeeper says what the hall is for (was fixes11.js: a vModal xform on the rkrest popup built just above)
HOOK.xform('vModal','riftkeeper9','Riftkeeper warning',function(h,m){try{if(m&&m.type==='rkrest'&&typeof rkUnlocked==='function'&&!rkUnlocked()){const n=rkBeaten().length,t=echoKeys().length;h=h.replace('<p class="note">Restores',`<p>"Break every Echo in this hall (${n} of ${t} so far) and the centre gate will open. Be warned: what waits behind it is stronger than anything you have faced."</p><p class="note">Restores`);}}catch(e){}return h;});
Object.assign(ACT,{
  rkFight(){if(!rkUnlocked()||(G&&G.daily))return;V.modal=null;if(!startBattle({kind:'riftkeeper',stage:4,lv:RKC.lv})){toast('Your party needs rest first.');render();}},
  // the Echo Warden's rest: restAll without the gold (and without refreshing the shops); an Ironman hero who fell stays down until an inn
  riftRest(){if(!G||G.daily||!(WS.m&&WS.m.sanctum))return;V.modal=null;
    Object.values(G.roster).forEach(c=>{if(typeof ironDowned==='function'&&ironDowned(c))return;if(!c.S)refresh(c);c.hp=c.S.mhp;c.mp=c.S.mmp;c.st={};});
    try{sfx('heal');}catch(e){}toast('The Warden\'s light mends the whole party.');saveGame();render();}});
// the Warden's talk opens the rest popup instead of a line of dialogue
{const in0=interact;interact=function(){try{if(V.screen==='world'&&!V.modal&&!WS.lock&&!WS.dlg&&!WS.mv&&WS.m&&WS.m.sanctum&&G&&!G.daily){
  const [fx,fy]=facing(),n=WS.m.npcs.find(q=>q.x===fx&&q.y===fy);
  if(n&&n.name==='Echo Warden'){n.mv=null;n.view=WS.dir==='u'?'front':WS.dir==='d'?'back':'side';n.face=WS.dir==='l'?'r':'l';V.modal={type:'rkrest'};render();return;}}}catch(e){}
  return in0.apply(this,arguments);};}
// ----- the fight -----
function rkOf(){return B&&B.rk&&B.rk.u&&B.rk.u.hp>0?B.rk:null;}
const rkShades=()=>B?B.en.filter(e=>e.shade&&e.hp>0):[];
function rkPhaseOf(u){const r=u.hp/u.S.mhp;return r>2/3?1:r>1/3?2:3;}
HOOK.before('encounterFoes','riftkeeper9','the Riftkeeper fight',function(spec){
  if(spec&&spec.kind==='riftkeeper'){const def=guardianDef('riftkeeper'),e=makeEnemy(def,spec.lv||RKC.lv,{boss:true,final:true,stage:4,key:'riftkeeper',noBuff:1,hpM:RKC.hpM,powM:RKC.powM});
    e.rk=1;e.maxShield=RKC.shield;e.shield=RKC.shield;e.broken=0;return HOOK.stop([e]);}});
// the element of its next turn: its body, its skills (and their names), the sprite's lantern
function rkSetEl(u){const S=B&&B.rk;if(!S||u!==S.u)return;const el=S.phase===1?RK_ELS[u.turns%8]:S.phase===2?'shadow':['light','shadow'][u.turns%2];
  if(S.el===el&&S.at===u.turns)return;const was=S.el;S.el=el;S.at=u.turns;u.el=[el];u.art='riftkeeper_'+el;
  u.sk.forEach((s,i)=>{if(s.k!=='buff'){s.el=el;s.n=EL[el]+' '+(RK_BASE[i]||s.n);}});u._b5p=null;
  if(S.phase===1&&was!==el){u.primed={el:RK_PRIME[el],t:3,by:'the Rift'};u.primeT=Date.now();
    log(`The Riftkeeper's lantern burns ${EL[el]}. It stands Primed with ${EL[RK_PRIME[el]]}: set it off with a ${EL[el]} detonator.`);}}
function rkChip(u,S){if(S.count>0)u.st.rk_unmake={t:S.count};else delete u.st.rk_unmake;}
function rkEnter(u,S,ph){S.phase=ph;const now=Date.now();
  if(ph===2){u.primed=null;u.shield=u.maxShield;u.broken=0;u.recover=0;banner('PHASE 2: THE ECHOES ANSWER','#c89aff');
    const live=B.en.filter(e=>e.hp>0).length,pool=rkBeaten().map(k=>[RNG(),k]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);const names=[];
    for(let i=0;i<pool.length&&i<2&&live+names.length<3;i++){const k=pool[i],sp=echoSpec(k);
      const s=makeEcho(k,Math.min(RKC.lv,sp.lv),{final:!!FINALS[k],stage:3,hpM:(sp.hpM||1.7)*RKC.shadeHp,powM:(sp.powM||1.15)*RKC.shadePow});
      s.name='Shade of '+guardianDef(k).n;s.shade=1;s.boss=false;s.maxShield=3;s.shield=3;s.broken=0;s.next=B.time+300+i*200;s.enterT=now;B.en.push(s);names.push(s.name);S.shadeN++;}
    log(`The Riftkeeper opens two doors: ${names.join(' and ')||'no one'} step${names.length===1?'s':''} through. While a shade lives its Break shield takes ${Math.round(RKC.wardCut*100)}% off every hit.`);}
  else if(ph===3){u.primed=null;S.count=0;S.t3=0;banner('PHASE 3: THE UNMAKING','#ff4a6a');
    log(`The Riftkeeper's lantern flares. Every ${RKC.every}rd turn it readies the Unmaking: Guard, or break its shield before the count ends.`);}
}
// keeps phase, element, countdown chip and sprite in step with the state (after every turn of the boss and every hit on it)
function rkSync(){const S=rkOf();if(!S||B.over)return;const u=S.u,ph=rkPhaseOf(u);
  if(ph>S.phase)rkEnter(u,S,ph);rkSetEl(u);rkChip(u,S);}
HOOK.after('checkPhase','riftkeeper9','keeper phase sync',function(r,e){try{if(e&&B&&B.rk&&e===B.rk.u)rkSync();}catch(x){}});
{const et0=endTurn;endTurn=function(u){const r=et0.apply(this,arguments);try{if(B&&B.rk&&u===B.rk.u&&!B.over){if(u.primed&&B.rk.phase!==1)u.primed=null;B.rk.at=-1;rkSync();}}catch(e){}return r;};}
// the boss's turn: a countdown ticks; the third tick lands the Unmaking instead of a move; every 3rd phase 3 turn it begins a new one
function rkTurnStart(u){const S=B.rk;rkSync();if(S.phase!==3)return false;S.t3++;
  if(S.count>0){S.count--;if(S.count>0){rkChip(u,S);return false;}
    u.turns++;u.actT=Date.now();u.actKind='mag';u.actEl='shadow';u.actName='Unmaking';delete u.st.rk_unmake;S.lands++;
    banner('UNMAKING','#ff4a6a');log('The Riftkeeper unmakes the party!');const hs=B.front.filter(c=>c.hp>0);
    hs.forEach(c=>{const d=Math.max(1,Math.round(c.S.mhp*RKC.unmakePct*(c.guard?.5:1)));c.fxEl='shadow';c.fxT=Date.now();c.hitT=c.fxT;fx(c,String(d),'dmg');log(`${c.name} takes ${d}${c.guard?' (guarded)':''}.`);hurt(c,d);});
    endTurn(u,1);return true;}
  if(S.t3%RKC.every===0){S.count=RKC.count;S.tells++;u.shield=Math.min(u.maxShield,RKC.ward3);u.broken=0;u.recover=0;fx(u,'Unmaking','stat bad');banner('UNMAKING IN '+RKC.count,'#ff4a6a');
    log(`The Riftkeeper raises the lantern: the Unmaking lands in ${RKC.count} of its turns. Break its shield (${u.shield} pips) before then, or Guard.`);rkChip(u,S);}
  return false;}
HOOK.wrap('enemyTurn0','riftkeeper9','Riftkeeper turn',function(next,u){try{if(B&&!B.over&&B.rk&&u===B.rk.u&&u.hp>0&&rkTurnStart(u))return;}catch(e){try{wdLog('riftkeeper: '+(e&&e.message||e),u);}catch(_){}}
  return next(u);});
// the intent: the element in the move's name, and the Unmaking when it lands next turn (the boss is always "known": its moves are the lesson)
{const fp0=foePlan;foePlan=function(u){const p=fp0.apply(this,arguments);try{const S=B&&B.rk;if(S&&u===S.u&&u.hp>0){rkSetEl(u);if(S.phase===3&&S.count===1)return Object.assign({},p,{sk:RK_UNMAKE,cat:'big'});
    if(p&&p.sk&&p.sk.id==='attack'){const sk=u.sk[0];return Object.assign({},p,{sk,cat:typeof b5Cat==='function'?b5Cat(sk):p.cat});}}}catch(e){}return p;};
  if(fp0.__b4)foePlan.__b4=1;}
{const bk0=b5Knows;b5Knows=function(u){try{if(u&&u.rk)return true;}catch(e){}return bk0.apply(this,arguments);};}
// no generic boss Cataclysm on top of the Unmaking; the swell while it counts down
{const br0=b4Role;b4Role=function(u){if(u&&u.rk)return null;return br0.apply(this,arguments);};}
{const bt0=bossTele;bossTele=function(u){try{if(B&&B.rk&&u===B.rk.u&&u.hp>0&&B.rk.count>0)return true;}catch(e){}return bt0.apply(this,arguments);};}
// a Break during the countdown: it fizzles (and the Break itself costs it its next turn)
{const cs0=chipShield;chipShield=function(t,n,why){const r=cs0.apply(this,arguments);try{const S=B&&B.rk;if(S&&t===S.u&&t.broken&&S.count>0){S.count=0;S.fizz++;delete t.st.rk_unmake;banner('THE UNMAKING FIZZLES','#7affc8');fx(t,'Fizzles','stat good');
  log('The shield shatters and the Unmaking fizzles! The Riftkeeper reels and loses its next turn.');}}catch(e){}return r;};}
// the Break shield of phase 2: while a shade lives and the shield holds, hits on it are cut
HOOK.after('calcDamage','riftkeeper9','phase 2 shield while shades live',function(r,a,sk,t){try{const S=B&&B.rk;if(S&&r&&r.dmg>0&&a&&a.side==='p'&&t===S.u&&S.phase===2&&!t.broken&&rkShades().length)r.dmg=Math.max(1,Math.round(r.dmg*(1-RKC.wardCut)));}catch(e){}});
// shades are no Echo kills; when the keeper falls its shades unravel with it
HOOK.wrap('fallen','riftkeeper9','shades are no Echo kills',function(next,...args){const u=args[0];const sh=u&&u.shade&&u.base?bestOf(u.base):null,k0=sh?sh.kills:0;const r=next(...args);
  try{if(sh)sh.kills=k0;if(u&&B&&B.rk&&u===B.rk.u)B.en.forEach(e=>{if(e.shade&&e.hp>0){e.hp=0;e.st={};e.deathT=Date.now();log(`${e.name} unravels.`);}});}catch(e){}return r;});
// no auto, no pork chops, the Rift's own music
{const ab0=autoBan;autoBan=function(spec){const r=ab0.apply(this,arguments);if(r)return r;if(spec&&spec.kind==='riftkeeper'&&G&&!G.daily)return 'No auto against the Riftkeeper';return null;};}
{const pb0=porkBlocked;porkBlocked=function(){if(B&&B.spec&&B.spec.kind==='riftkeeper')return true;return pb0.apply(this,arguments);};}
HOOK.wrap('battleTheme','riftkeeper9','Riftkeeper backdrop',function(next){if(B&&B.spec&&B.spec.kind==='riftkeeper')return 'd_'+ZS(4).theme;return next();});
HOOK.after('startBattle','riftkeeper9','Riftkeeper fight state',function(r){try{if(r===false||!B||!B.spec||B.spec.kind!=='riftkeeper')return;const u=B.en.find(e=>e.rk);if(!u)return;
  B.rk={u,phase:1,el:null,at:-1,count:0,t3:0,shadeN:0,tells:0,lands:0,fizz:0};B.auto=false;rkSetEl(u);rkChip(u,B.rk);
  log(`Phase 1: its element changes every turn. Phase 2 brings two Echo shades; phase 3 the Unmaking.`);render();}catch(e){}});
// ----- rewards -----
HOOK.wrap('win','riftkeeper9','Riftkeeper rewards',function(next,...a){const sp=B&&B.spec;const r=next(...a);try{if(!sp||sp.kind!=='riftkeeper'||G.daily)return r;
  const info=V.modal&&V.modal.info||{};info.notes=info.notes||[];const first=!META.riftkeeper;
  if(first){META.riftkeeper=1;META.titles=META.titles||{};META.titles.riftwalker='Riftwalker';G.gear.push('c_riftkeeper');info.gear='c_riftkeeper';
    info.notes.push("The Riftkeeper lays down its key. You carry Riftwalker's Key now: all elements +10% damage, skills cost 10% more MP.");
    info.notes.push('Title earned: Riftwalker.');info.notes.push('New Game+ modifier unlocked: Rift (foes cycle elements every 3 turns, +35% XP and gold).');}
  else{G.mats.essence=(G.mats.essence||0)+RKC.essence;info.mats=info.mats||{};info.mats.essence=(info.mats.essence||0)+RKC.essence;info.notes.push(`The Rift gives up ${RKC.essence} Echo Essence.`);}
  try{saveMeta();if(typeof profileDirty==='function')profileDirty();}catch(e){}saveGame();render();}catch(e){}return r;});
{const po0=profileOf;profileOf=function(meta){const p=po0.apply(this,arguments);p.flags.riftkeeper=meta.riftkeeper?1:0;return p;};}
{const ar0=applyRemote;applyRemote=function(rm){if(rm&&rm.flags&&rm.flags.riftkeeper){META.riftkeeper=1;META.titles=META.titles||{};META.titles.riftwalker='Riftwalker';}return ar0.apply(this,arguments);};}
// ----- the charm: Riftwalker's Key -----
addGear('c_riftkeeper',{n:"Riftwalker's Key",slot:'c',tier:5,hp:100,price:1500,unique:1,rk:1});
IC_CHARM.c_riftkeeper={body:'seal',G:'#2a1f58',gly:'star',gk:'E',E:'#c9a8ff',cord:'chain',rim:'T',aura:1};
HOOK.after('calcStats','riftkeeper9','Riftwalker key perks',function(S,c){try{if(c&&c.eq&&c.eq.c==='c_riftkeeper'&&!(G&&G.daily)){ELK.forEach(el=>{S.elBoost[el]=(S.elBoost[el]||0)+RKC.elUp;});S.mpEff=(S.mpEff||0)-RKC.mpUp;}}catch(e){}});
HOOK.xform('gearDesc','riftkeeper9','Riftwalker key text',function(h,id){try{const g=typeof id==='string'?gearOf(id):id;if(g&&g.rk)h+=(h?', ':'')+`+${Math.round(RKC.elUp*100)}% damage with every element, skills cost ${Math.round(RKC.mpUp*100)}% more MP`;}catch(e){}return h;});
// ----- tests -----
window.__RK={RKC,rkSync:()=>rkSync(),unlocked:()=>rkUnlocked(),beaten:()=>rkBeaten().length,get S(){return B&&B.rk;},turnStart:u=>rkTurnStart(u),shades:()=>rkShades(),intent:u=>b5Intent(u),turn:u=>enemyTurn0(u),idle:(k,n)=>{const c=monCanvas(k);return {w:c.width,h:c.height,diff:bossIdle(c,0,0,760)!==bossIdle(c,0,760,760),c0:bossIdle(c,0,0,760).toDataURL(),c1:bossIdle(c,0,760,760).toDataURL()};},hurtB:d=>{hurt(B.rk.u,d);},guard:()=>guard(),end:()=>checkEnd(),dmg:(a,sk,t)=>calcDamage(a,sk,t),react:(p,d)=>!!reactFor(p,d),chip:n=>chipShield(B.rk.u,n,'test'),mk:k=>{const sp=echoSpec(k);return makeEcho(k,56,{final:!!FINALS[k],stage:3,hpM:sp.hpM,powM:sp.powM}).S.mhp;}};
