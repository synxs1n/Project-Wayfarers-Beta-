// ===== progression.js (pre-beta): recruit fit, playtime unlocks, Guild Hall challenges, the What next? guide =====
// Tavern offers that complement the party, heroes unlocked by playtime, Guild Hall recruitment challenges, and the "What next?" guide.
// New save fields (all optional, defaulted on read): G.tavRoll, G.chall, G.been.

// ----- roles -----
const CLASS_ROLE={knight:'tank',healer:'healer',bard:'support',warrior:'damage',mage:'damage',archer:'damage',thief:'damage',monk:'damage',chronicler:'damage',sniper:'damage',druid:'support',archmage:'damage'};
const ROLE_LBL={tank:'Tank',healer:'Healer',support:'Support',damage:'Damage'};
// tavern heroes from stage N also turn up early once the journey has seen enough battles
function battlesSoFar(){return (G&&G.stats&&G.stats.battles)||0;}
function tavernUnlocked(id){const s=TPL[id].src;if(s[0]==='s')return true;if(s[0]!=='t')return false;const n=+s.slice(1);return n<=G.stage||battlesSoFar()>=TAV_BATTLES[n];}
function tavernPool(){return RAW.map(r=>r[0]).filter(id=>{const s=TPL[id].src;return (s[0]==='t'||s[0]==='s')&&!G.roster[id]&&!challIsPooled(id)&&tavernUnlocked(id);});}
function partyOf(){return (G.party||[]).map(id=>G.roster[id]).filter(Boolean);}
function heroRoles(id,lv){const S=classSkills(TPL[id]).filter(s=>s.lv<=lv);return {P:S.some(s=>s.role==='primer'),D:S.some(s=>s.role==='det')};}
function partyNeeds(){
  const P=partyOf(),lv=Math.max(5,avgLv()+3),roles={},els={};let pr=false,dt=false;
  P.forEach(c=>{roles[CLASS_ROLE[TPL[c.id].cls]||'damage']=(roles[CLASS_ROLE[TPL[c.id].cls]||'damage']||0)+1;c.el.forEach(e=>{els[e]=1;});const r=known(c);if(r.some(s=>s.role==='primer'))pr=true;if(r.some(s=>s.role==='det'))dt=true;});
  return {roles,els,pr,dt,lv,size:P.length};
}
function recruitFit(id,N){
  N=N||partyNeeds();const t=TPL[id],role=CLASS_ROLE[t.cls]||'damage',why=[];let w=1;
  if(role!=='damage'&&!N.roles[role]){w+=2.5;why.push('Fills: '+ROLE_LBL[role]);}
  else if(role==='damage'&&(N.roles.damage||0)<2){w+=1;why.push('More damage');}
  const fresh=t.el.filter(e=>!N.els[e]);if(fresh.length){w+=fresh.length;why.push('New element: '+fresh.map(e=>EL[e]).join(', '));}
  const R=heroRoles(id,N.lv);
  if(!N.dt&&R.D){w+=2.5;why.push('Brings a ✸ Detonator');}
  if(!N.pr&&R.P){w+=2.5;why.push('Brings a ⟐ Primer');}
  return {w,why};
}
function fitTags(id){return recruitFit(id).why.map(w=>`<em class="fit">${esc(w)}</em>`).join('');}
function nextTavernUnlock(){const b=battlesSoFar();for(let n=1;n<TAV_BATTLES.length;n++){if(n>G.stage&&b<TAV_BATTLES[n])return {n,need:TAV_BATTLES[n]-b};}return null;}
function rerollTavern(){G.tavRoll=(G.tavRoll||0)+1;}
{const ra=restAll;restAll=function(){const r=ra.apply(this,arguments);if(r)rerollTavern();return r;};}

// ----- Guild Hall recruitment challenges -----
// Beta v0.3.1: a bigger pool (four tavern and rare heroes moved here, two of them dual-type) and tougher goals.
const CHALL=[
 {hero:'cass',stage:0,type:'weak',n:6,title:'Read the fight',desc:"Win 6 battles where you hit a foe's weakness at least once. Cass only trains fighters who read a fight before swinging."},
 {hero:'alder',stage:1,type:'deliver',m:{healroot:8,hide:5,$rel:3},title:'Medicine for the road',desc:"Bring 8 Healroot, 5 Beast Hide and 3 of this realm's relic. Alder follows the supplies."},
 {hero:'kit',stage:1,type:'detonate',n:5,title:'Make it go boom',desc:'Set off 5 reactions: prime a foe, then hit it with a matching detonator. Kit loves a big bang.'},
 {hero:'corwin',stage:2,type:'flawless',n:4,title:'Not one fallen',desc:'Win 4 dungeon battles without any hero being knocked out. Corwin respects a careful captain.'},
 {hero:'lark',stage:2,type:'element',n:6,title:'A song in {el}',desc:'Win 6 battles in which your party uses {el} at least once. Lark is writing a ballad about it.'},
 {hero:'rook',stage:2,type:'wins',n:10,title:'Ten fights, no excuses',desc:'Win 10 battles. Rook wants to see you keep going, not get lucky once.'},
 {hero:'vex',stage:2,type:'detonate',n:6,title:'Static and sparks',desc:'Set off 6 reactions. Vex only runs with people who make the air crackle.'},
 {hero:'sorrel',stage:3,type:'bounty',n:2,title:'Trial by fire',desc:'Accept this, then beat 2 bounties from the board. Sorrel wants to see you fight something marked.'},
 {hero:'frey',stage:3,type:'weak',n:8,title:'Find the crack',desc:"Win 8 battles where you hit a foe's weakness. Frey reads ice the same way."},
 {hero:'nyx',stage:3,type:'element',n:6,title:'Cold and dark',desc:'Win 6 battles in which your party uses {el} at least once. Nyx trusts what she has seen with her own eyes.'},
 {hero:'isak',stage:1,type:'wins',n:8,title:'Hold the line',desc:'Win 8 battles. Isak only follows captains who are still standing at the end.'},
 {hero:'lorcan',stage:2,type:'weak',n:7,title:'Stone and light',desc:"Win 7 battles where you hit a foe's weakness. Lorcan believes in finding the seam in anything."},
 {hero:'hollis',stage:3,type:'flawless',n:5,title:'Nobody lost in the dark',desc:'Win 5 dungeon battles without any hero being knocked out. Hollis keeps count of the ones who got home.'},
 {hero:'senna',stage:3,type:'detonate',n:7,title:'A bright idea',desc:'Set off 7 reactions. Senna wants a lot of flash for her trouble.'}
];
const challOf=h=>CHALL.find(c=>c.hero===h);
function challState(h){G.chall=G.chall||{};return G.chall[h]||{state:'open',have:0};}
function challEligible(){return CHALL.filter(c=>c.stage<=G.stage&&TPL[c.hero]&&!G.roster[c.hero]);}
// The board rotates after an inn rest or a stage clear (the same roll the tavern uses). Accepted challenges stay posted.
// Draw weights: dual-type heroes x2, and +50% for every rotation a hero has been left off, so nobody stays hidden for long.
// v0.10.x: Guild recruits are drawn per journey: 5 of the CHALL pool (G.run.gpick), recruit i unlocks once town i has been reached.
// Old saves with no G.run.gpick keep the old board (all recruits, rotating).
const gpickOn=()=>!!(G&&G.run&&Array.isArray(G.run.gpick)&&G.run.gpick.length);
function gpickSeen(i){return !!(G&&((G.visited||[]).includes(i)||(G.stage|0)>=i||(G.been||{})['t'+i]));}
function gpickOpen(h){const i=G.run.gpick.indexOf(h);return i>=0&&gpickSeen(i);}
HOOK.after('newGame','progression','draw the 5 guild recruits for this journey',function(){try{
  if(!G||G.daily||!G.run)return;const R=seeded(((G.run.seed|0)+4242)>>>0),pool=CHALL.map(c=>c.hero).filter(h=>TPL[h]&&!G.roster[h]);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const pick=pool.slice(0,5);const k=pick.findIndex(h=>TPL[h].el.length<2);if(k>0)[pick[0],pick[k]]=[pick[k],pick[0]];// the first one opens in realm 1, before dual types appear
  G.run.gpick=pick;}catch(e){}});
function challVisible(){if(gpickOn()){G.chall=G.chall||{};const dualOK=typeof p2DualOK==='function'?p2DualOK():true;
  return G.run.gpick.filter(h=>challOf(h)&&!G.roster[h]&&gpickOpen(h)&&(dualOK||TPL[h].el.length<2)).map(h=>challOf(h));}
  const E=challEligible();G.chSeen=G.chSeen||{};const roll=G.tavRoll||0,act=E.filter(c=>challState(c.hero).state==='active');
  const open=E.filter(c=>challState(c.hero).state!=='active');if(open.length<=CHALL_POST)return act.concat(open);
  G.chPost=G.chPost||{};if(G.chPost.roll===roll&&G.chPost.ids&&G.chPost.ids.every(h=>open.some(c=>c.hero===h)))return act.concat(G.chPost.ids.map(h=>challOf(h)));
  const R=seeded((G.run.seed||1)+roll*977+31),pool=open.slice(),pickd=[];
  while(pickd.length<CHALL_POST&&pool.length){const w=pool.map(c=>(TPL[c.hero].el.length>1?2:1)*(1+.5*Math.max(0,roll-(G.chSeen[c.hero]==null?roll-1:G.chSeen[c.hero]))));const tot=w.reduce((a,b)=>a+b,0);let r=R()*tot,k=0;for(;k<pool.length-1;k++){if((r-=w[k])<0)break;}pickd.push(pool.splice(k,1)[0]);}
  pickd.forEach(c=>{G.chSeen[c.hero]=roll;});G.chPost={roll,ids:pickd.map(c=>c.hero)};return act.concat(pickd);}
function challIsPooled(id){return CHALL.some(c=>c.hero===id);}
function challText(c,st){return (s=>s.replace(/\{el\}/g,st&&st.el?EL[st.el]:'an element of your choice'))(c.title)+'|'+(s=>s.replace(/\{el\}/g,st&&st.el?EL[st.el]:'one element your party uses'))(c.desc);}
function challMats(c,st){const o={};Object.keys(c.m||{}).forEach(k=>{const kk=k==='$rel'?(st&&st.rel)||ZS(G.stage).mat:k;o[kk]=(o[kk]||0)+c.m[k];});return o;}
function challReady(c,st){if(st.state!=='active')return false;if(c.type==='deliver')return hasMats(challMats(c,st));return (st.have||0)>=c.n;}
function challengeWin(spec,info){
  if(!G||G.daily||!G.chall)return;
  CHALL.forEach(c=>{const st=G.chall[c.hero];if(!st||st.state!=='active'||c.type==='deliver')return;
    let inc=0;
    if(c.type==='weak'&&B.hitWeak)inc=1;
    if(c.type==='detonate')inc=B.nDet||0;
    if(c.type==='flawless'&&spec.kind==='dungeon'&&!(B.kos>0))inc=1;
    if(c.type==='element'&&st.el&&B.usedEls&&B.usedEls[st.el])inc=1;
    if(c.type==='bounty'&&spec.kind==='elite'&&spec.bounty&&!spec.bounty.personal)inc=1;
    if(c.type==='wins')inc=1;
    if(!inc)return;const before=st.have||0;st.have=Math.min(c.n,before+inc);
    if(st.have>=c.n&&before<c.n)info.quests.push(`${TPL[c.hero].n}'s challenge is complete. Visit a Guild Hall.`);});
}
function vChallenges(){
  const L=challVisible(),done=CHALL.filter(c=>G.roster[c.hero]).length;
  return `<p>Some wayfarers won't sit in a tavern. They want to see what you can do first. Take a challenge, complete it anywhere, then come back to any Guild Hall and they join you.</p>
    ${L.length?`<div class="rows">${L.map(c=>{const st=challState(c.hero),[title,desc]=challText(c,st).split('|'),ready=challReady(c,st),t=TPL[c.hero];
      const prog=st.state!=='active'?'':c.type==='deliver'?`<div class="mats">${matChips(challMats(c,st))}</div>`:`<small class="nums">${st.have||0} / ${c.n}</small>`;
      return `<div class="row chrow ${ready?'ready':''}">${port(c.hero)}<div class="grow"><b>${esc(title)}</b><small>${esc(t.n)}, ${CLS[t.cls].n} · ${t.el.map(e=>EL[e]).join('/')}</small><small>${esc(desc)}</small>${prog}</div>
        ${st.state==='open'?`<button class="btn sm" data-act="chAccept" data-arg="${c.hero}">Accept</button>`:ready?`<button class="btn sm gold" data-act="chClaim" data-arg="${c.hero}">${c.type==='deliver'?'Deliver':'Recruit'}</button>`:'<span class="m">Active</span>'}</div>`;}).join('')}</div>`:'<p class="note">No challenges posted yet. More appear as your journey goes on.</p>'}
    ${gpickOn()?G.run.gpick.map((h,i)=>({h,i})).filter(o=>!G.roster[o.h]&&!gpickSeen(o.i)).map(o=>`<div class="row chrow locked"><div class="grow"><b>Locked recruit</b><small>Unlocks in realm ${o.i+1}</small></div><span class="m">Locked</span></div>`).join(''):''}
    <p class="note">${gpickOn()?`${done} of ${G.run.gpick.length} recruits of this journey have joined you.`:`${done} of ${CHALL.length} challenge recruits have joined you this journey. Each board posts a few challenges at a time and rotates after an inn rest or a cleared Scourge; accepted ones stay up until you finish them, and every challenge comes around again.`}</p>`;
}
// ----- remember which maps the player has been to (for hints that must not spoil) -----
HOOK.after('placeAt','progression','places been',function(r,mid){try{G.been=G.been||{};G.been[mid]=1;}catch(e){}});
HOOK.wrap('finishBattle','progression','tavern reroll on a stage clear',function(next,...a){const how=a[0];const was=G&&G.cleared?G.cleared.filter(Boolean).length:0;const r=next(...a);try{if(G&&G.cleared&&G.cleared.filter(Boolean).length>was)rerollTavern();}catch(e){}return r;});

// ----- "What next?" -----
function nodesLeft(mid){const m=MAPS[mid]||(G.been&&G.been[mid]?getMap(mid):null);if(!m)return 0;return (m.nodes||[]).filter(n=>!(G.gath||{})[mid+':'+n.x+','+n.y]).length;}
function chestsLeft(mid){const m=MAPS[mid]||(G.been&&G.been[mid]?getMap(mid):null);if(!m||!m.chests)return 0;return m.chests.filter(([x,y])=>!G.chests[mid+':'+x+','+y]).length;}
function upgradeSpare(c){return EQSL.some(sl=>{const cur=gearOf(c.eq[sl]);return G.gear.some(g=>{const x=gearOf(g);if(!x||x.slot!==sl||(x.only&&x.only!==c.id))return false;if(!cur)return true;return (x.tier||0)+(x.plus||0)*.5>(cur.tier||0)+(cur.plus||0)*.5;});});}
function vNext(){
  const s=G.stage,Z=ZS(s),been=G.been||{},items=[];
  const add=(ok,text,sub)=>items.push(`<div class="row nxt ${ok?'done':''}"><span class="nxi">${ok?'✓':'•'}</span><div class="grow"><b>${text}</b>${sub?`<small>${sub}</small>`:''}</div></div>`);
  // story
  if(!G.cleared[s]){if(!been[(worldV2()&&!worldV3()?'g':'f')+s])add(false,`Head out into ${esc(Z.n)}`,worldV3()?`Take the ${SIDE_NAME[worldPlan()[s].tn]} gate out of town.`:'The road east from town.');
    else if(!been['d'+s])add(false,`Find the ${esc(Z.dungeon)}`,`Its entrance is hidden somewhere off the road in ${esc(Z.n)}. Look for glowing stairs.`);
    else add(false,`Take on the ${s<4?bossClass(bossKeyFor(s)):'Calamity'} in the ${esc(Z.dungeon)}`,'See the readiness check below first.');}
  else add(true,`${esc(Z.dungeon)} relit`,s<4?`The ${gateDirWord(s,'field')} gate is open.`:'The journey is complete. Echoes linger in each dungeon, and the Echo Rift opens at every waystone.');
  // quests and bounties
  const qa=G.quests.filter(q=>q.state==='active'&&q.stage<=s),qo=G.quests.filter(q=>q.state==='open'&&q.stage<=s&&G.visited.includes(q.stage));
  qa.forEach(q=>add(false,`Quest: ${esc(q.title)}`,questReady(q)?'Ready to claim at a quest board.':q.type==='legend'?legendProg(q):''));
  if(qo.length)add(false,`${qo.length} quest${qo.length>1?'s':''} waiting on the board`,qo.slice(0,3).map(q=>esc(q.title)).join(', '));
  const ba=G.bounties.filter(b=>b.state==='active'),bo=G.bounties.filter(b=>b.state==='open'&&b.stage<=s);
  ba.forEach(b=>add(false,`Bounty: ${esc(b.name)}`,`Roaming ${esc(ZS(b.stage).n)}. Beat it to claim it${G.tamed.length<8?' and maybe tame it':''}.`));
  Object.values(G.personal||{}).filter(q=>q&&q.state==='active'&&TPL[q.personal]).forEach(q=>add(false,`Rival: ${esc(q.name)}`,`${esc(TPL[q.personal].n)}'s personal quest, roaming ${esc(ZS(q.stage).n)}. `+(typeof rivalNeed==='function'&&rivalNeed(q)?`<b class="rgneed">${esc(rivalNeedShort(q))}.</b>`:`${esc(TPL[q.personal].n)} is in your party: face it.`)));
  if(bo.length)add(false,`${bo.length} bount${bo.length>1?'ies':'y'} posted at the Guild Hall`,'Elite monsters with gold, a stat charm and materials.');
  // exploring
  (worldV3()?[['f'+s,Z.n],['d'+s,Z.dungeon],['k'+s,typeof CAVE_NAMES!=='undefined'?CAVE_NAMES[s]:'Den']]:[['g'+s,Z.n+' (first field)'],['f'+s,worldV2()?Z.n+' (deeper fields)':Z.n],['d'+s,Z.dungeon]]).forEach(([mid,n])=>{if(!been[mid])return;const nl=nodesLeft(mid),cl=chestsLeft(mid);if(nl)add(false,`${nl} gathering spot${nl>1?'s':''} left in ${esc(n)}`,'Herbs, ore and logs. They regrow when you rest at an inn.');if(cl)add(false,`${cl} unopened chest${cl>1?'s':''} in ${esc(n)}`,'');});
  if(been['d'+s]&&worldV3()&&!G.cleared[s]){const dm=MAPS['d'+s],pulled=dm&&(G.levers||{})['d'+s],haveKey=(G.keys||{})['d'+s];
    if(!pulled&&!haveKey)add(false,`Find the lever in the ${esc(Z.dungeon)}`,'It is far from the entrance, down a side passage. It raises the bars on the key room.');
    else if(pulled&&!haveKey)add(false,`Fetch the key from the barred key room`,'The lever has raised the bars. The key opens the boss door.');}
  if(been['d'+s]&&!(G.vaults||{})[s])add(false,`The barred vault in the ${esc(Z.dungeon)}`,worldV3()?'The same lever raises its bars.':'Somewhere a lever raises the bars.');
  // recruits
  const offers=tavernOffers(),aff=offers.filter(id=>G.gold>=recruitCost(id));
  if(offers.length)add(false,`${offers.length} wayfarer${offers.length>1?'s':''} for hire at the tavern`,aff.length?`You can afford ${aff.length}. Best fit: ${esc(TPL[offers.slice().sort((a,b)=>recruitFit(b).w-recruitFit(a).w)[0]].n)}.`:'Save up gold to hire one.');
  if(G.rare&&!G.roster[G.rare])add(false,'A rare wayfarer is at the tavern','They may not stay long.');
  const ch=challVisible();ch.forEach(c=>{const st=challState(c.hero);add(false,`Guild challenge: ${esc(challText(c,st).split('|')[0])}`,st.state==='open'?`Accept it to recruit ${esc(TPL[c.hero].n)}.`:challReady(c,st)?'Complete! Claim it at a Guild Hall.':c.type==='deliver'?'Gather the materials, then deliver.':`${st.have||0} / ${c.n}`);});
  const nu=nextTavernUnlock();if(nu)add(false,'New faces are on the road',`About ${nu.need} more battle${nu.need>1?'s':''} until more wayfarers reach the taverns.`);
  // party upkeep
  const P=partyOf(),pts=Object.values(G.roster).filter(c=>c.pts>0),spare=P.filter(upgradeSpare);
  if(pts.length)add(false,`${pts.length} hero${pts.length>1?'es have':' has'} unspent stat points`,pts.slice(0,4).map(c=>esc(c.name)).join(', ')+'. Open them from Party or Roster.');
  if(spare.length)add(false,'Better gear is sitting in your pack',spare.slice(0,4).map(c=>esc(c.name)).join(', ')+' could equip an upgrade.');
  const canR=RECIPES.filter(r=>recipeOpen(r)&&G.gold>=r.g&&hasMats(recipeMats(r))&&!(r.item&&(G.inv[r.item]||0)>=invCap()));
  const cS=canR.filter(r=>SMITH_CATS.includes(r.cat)).length,cA=canR.length-cS;
  if(cS)add(false,`${cS} weapon or armor recipe${cS>1?'s':''} you can Forge right now`,'At the Smithy.');
  if(cA)add(false,`${cA} potion, charm or tent recipe${cA>1?'s':''} you can craft right now`,'At Alchemy.');
  const forgeable=P.flatMap(c=>EQSL.map(sl=>c.eq[sl]).filter(Boolean)).filter(id=>{const f=forgeCost(id);return f&&G.gold>=f.gold&&hasMats(f.m);}).length;
  if(forgeable)add(false,`${forgeable} equipped item${forgeable>1?'s':''} can be tempered`,'In the Smithy\'s Tempering tab.');
  const pe=P.filter(c=>personalEligible(c)&&!(G.personal||{})[c.id]);if(pe.length)add(false,'Personal quests available',pe.slice(0,3).map(c=>esc(c.name)).join(', ')+'. Start them at the Guild Hall.');
  if(G.tamed.length<8&&bo.length+ba.length)add(false,`Taming: ${G.tamed.length} of 8`,'Beaten elite bounties can be tamed.');
  const cl=G.cleared.filter(Boolean).length,ar=ARENA.map((A,i)=>({A,i})).filter(o=>o.A.min<=cl&&!G.arena[o.i]);if(ar.length)add(false,`Arena: ${esc(ar[0].A.n)} is open`,`Suggested party level ${ar[0].A.rec}.`);
  // readiness for the boss of this stage
  let ready='';
  if(!G.cleared[s]){const key=bossKeyFor(s),blv=bossLvFor(s),alv=avgLv(),N=partyNeeds();
    const tiers=P.map(c=>{const w=gearOf(c.eq.w),a=gearOf(c.eq.a);return ((w?w.tier+(w.plus||0)*.4:0)+(a?a.tier+(a.plus||0)*.4:0))/2;}),tier=tiers.reduce((a,b)=>a+b,0)/Math.max(1,tiers.length),want=Math.min(5,s);
    const heal=P.some(c=>known(c).some(k=>k.k==='heal'));const pots=(G.inv.potion||0)+(G.inv.hipotion||0),plumes=G.inv.plume||0,rem=G.inv.remedy||0;
    const seen=((META.best||{})[guardianDef(key).n]||{}).seen;const bname=seen?esc(guardianDef(key).n):`the ${s<4?bossClass(key):'Calamity'}`;
    const line=(ok,t,sub)=>`<div class="row rdy ${ok?'ok':'warn'}"><span class="nxi">${ok?'✓':'⚠'}</span><div class="grow"><b>${t}</b>${sub?`<small>${sub}</small>`:''}</div></div>`;
    ready=`<h4>Readiness: ${bname}</h4><p class="note">Suggestions only. You can fight whenever you like.</p><div class="rows compact">
      ${line(alv>=blv-1,`Party level ${alv} vs boss level ${blv}`,alv>=blv-1?'You are in range.':`About ${blv-1-alv} more level${blv-1-alv>1?'s':''} would help. Fight in the tall grass or the dungeon.`)}
      ${line(tier>=want-.3,`Gear tier ${(tier+1).toFixed(1)} (this realm's shops sell tier ${want+1})`,tier>=want-.3?'Your gear keeps up with this realm.':'Check the Smithy for upgrades, Forge pieces there, or temper what you have.')}
      ${line(heal,heal?'A healer is in your six':'No healer in your six',heal?'':'Bring a Healer, a Bard or anyone with a heal skill.')}
      ${line(N.pr&&N.dt,`Reactions: ${N.pr?'⟐ Primer ✓':'⟐ Primer missing'} · ${N.dt?'✸ Detonator ✓':'✸ Detonator missing'}`,N.pr&&N.dt?'You can set off reactions, which also chip its Break shield.':'The tavern and Guild challenges favor heroes who fill the gap.')}
      ${line(pots>=5&&plumes>=1&&rem>=1,`Supplies: ${pots} healing draughts, ${plumes} Phoenix Feather${plumes===1?'':'s'}, ${rem} Remed${rem===1?'y':'ies'}`,pots>=5&&plumes>=1&&rem>=1?'Well stocked.':'Aim for 5+ draughts, a Phoenix Feather and a Remedy, all at Alchemy. Rest at the inn before the fight.')}
      ${(()=>{const tn=G.inv.tent||0,hw=G.inv.holywater||0,pc=G.inv.porkchop||0,ok=tn+pc>0;return line(ok,`Travel kit: ${tn} tent${tn===1?'':'s'}, ${hw} Holy Water, ${pc} Pork Chop Sandwich${pc===1?'':'es'}`,ok?'A tent patches you up mid-dungeon; a sandwich gets you out.':'A tent or a Pork Chop Sandwich makes the walk to the boss safer. Tents and Holy Water at Alchemy, sandwiches at the tavern.');})()}
      ${line(P.every(c=>c.hp>c.S.mhp*.7),P.every(c=>c.hp>c.S.mhp*.7)?'Party is rested':'Some heroes are hurt',P.every(c=>c.hp>c.S.mhp*.7)?'':'Rest at an inn first.')}
    </div>`;}
  return `<p class="note">Everything you can do right now in ${esc(Z.n)}. It updates as you play.</p><div class="rows compact">${items.join('')||'<p class="note">Nothing pressing. Explore, or push on.</p>'}</div>${ready}`;
}
Object.assign(ACT,{
  chAccept(h){const c=challOf(h);if(!c)return;G.chall=G.chall||{};const st={state:'active',have:0};
    if(c.type==='element'){const els={};partyOf().forEach(x=>x.el.forEach(e=>{els[e]=(els[e]||0)+1;}));const L=Object.keys(els).sort((a,b)=>els[b]-els[a]||a.localeCompare(b));st.el=L[0]||'fire';}
    if(c.type==='deliver')st.rel=ZS(G.stage).mat;
    G.chall[h]=st;codexSee(h);saveGame();toast('Challenge accepted: '+challText(c,st).split('|')[0]);render();},
  chClaim(h){const c=challOf(h),st=challState(h);if(!c||!challReady(c,st))return;if(c.type==='deliver')payMats(challMats(c,st));st.state='done';
    if(!G.roster[h]){recruit(h,true);}saveGame();sfx('level');toast(TPL[h].n+' joins your roster!'+(G.party.includes(h)?'':' Add them to your six from the menu in town.'));render();}
});
