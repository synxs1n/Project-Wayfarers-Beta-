// =================== FACTIONS (Beta v0.4.0, Phase 9) ===================
// Five factions, six ranks each. Reputation = counters you already earn by playing (forging, potions, taming, wins, echoes, Scourges, helping wayfarers)
// plus bonus from missions. Everything is per journey (G.fac, an optional save field). Only the highest rank reached per faction goes in the account
// profile (META.facBest) and it is a title, nothing more. Nothing here is required to finish the game, Legendary heroes never come from factions,
// and the Daily Trial ignores all of it (no counters, no discounts, no bonuses).
const FAC=[
 {id:'guild',n:"Wayfarers' Guild",i:'⚑',col:'#e0b04a',desc:'General work for the road. Wins, marked beasts, cleared Scourges and the wayfarers you help earn its trust.',
  ranks:['Recruit','Wayfarer','Pathfinder','Trailwarden','Captain','Guildmaster'],
  perks:[null,{t:'Inn rooms cost 10% less',k:'inn',v:.10},{t:'Battle gold +5%',k:'gold',v:.05},{t:'A challenge only wayfarer joins you (pick up at the Factions page)',k:'recruit'},{t:'Guildmark Pin, a unique charm',k:'charm',id:'c_fa0'},{t:"Signature: Guildmaster's Seal, a strong unique charm, and the title Guildmaster",k:'sig',id:'c_fb0'}]},
 {id:'smiths',n:"Smiths' Union",i:'⚒',col:'#d8743a',desc:'Forging and tempering. Every forged piece and every temper counts.',
  ranks:['Apprentice','Hammerhand','Journeyman','Foreman','Master Smith','Grandsmith'],
  perks:[null,{t:'Tempering costs 5% less gold',k:'forge',v:.05},{t:'Tempering costs 10% less; 10% of forging gold comes back',k:'forge',v:.10,rebate:.10},{t:'Union stock: Dread Core and ore bundles at the Union counter',k:'stock'},{t:'Anvilmark Charm, a unique charm',k:'charm',id:'c_fa1'},{t:'Signature: Grandsmith\'s Hammerpin, a strong unique charm, and the title Grandsmith',k:'sig',id:'c_fb1'}]},
 {id:'alch',n:"Alchemists' Circle",i:'⚗',col:'#5ac08a',desc:'Potions. Every potion, ether and elixir you brew earns standing.',
  ranks:['Initiate','Brewer','Distiller','Adept','Magister','Archmage of Vials'],
  perks:[null,{t:'8% of brewing gold comes back',k:'rebate',v:.08},{t:'15% of brewing gold comes back',k:'rebate',v:.15},{t:'Circle stock: Elixirs and herb bundles at the Circle counter',k:'stock'},{t:'Vialmark Charm, a unique charm',k:'charm',id:'c_fa2'},{t:'Signature: 15% chance every brew makes one extra, a strong unique charm (Archmage\'s Phial), and the title Archmage of Vials',k:'sig',id:'c_fb2',dbl:.15}]},
 {id:'wardens',n:'Beastwardens',i:'🐾',col:'#8ad04a',desc:'Taming and companions. Every creature that follows you counts.',
  ranks:['Pup','Tracker','Handler','Warden','Beastmaster','Warden of Wilds'],
  perks:[null,{t:'XP +3%',k:'xp',v:.03},{t:'XP +5%',k:'xp',v:.05},{t:'Warden stock: parts bundles at the Warden counter',k:'stock'},{t:'Wildcall Charm, a unique charm',k:'charm',id:'c_fa3'},{t:'Signature: Wild Heart, a strong unique charm, and the title Warden of Wilds',k:'sig',id:'c_fb3'}]},
 {id:'archive',n:'Archivists',i:'📖',col:'#9a8aff',desc:'Knowledge. Echoes beaten, Scourges brought down and every wayfarer you gather get written down.',
  ranks:['Reader','Scribe','Cataloguer','Lorekeeper','Curator','Keeper of the Last Page'],
  perks:[null,{t:'XP +3%',k:'xp',v:.03},{t:'Archive stock: relic bundles at the Archivist counter',k:'stock'},{t:'A challenge only wayfarer joins you (pick up at the Factions page)',k:'recruit'},{t:'Inkmark Charm, a unique charm',k:'charm',id:'c_fa4'},{t:'Signature: The Last Page, a strong unique charm, and the title Keeper of the Last Page',k:'sig',id:'c_fb4'}]},
 {id:'hand',n:'The Steady Hand',i:'✋',col:'#c8a070',desc:'Fights you take yourself. Every battle finished without Auto earns its respect.',
  ranks:['Onlooker','Steady','Sure Hand','Cool Head','Hand of Iron','The Steady Hand'],
  perks:[null,{t:'XP +2%',k:'xp',v:.02},{t:'Battle gold +3%',k:'gold',v:.03},{t:'Inn rooms cost 5% less',k:'inn',v:.05},{t:'Steady Knot, a unique charm',k:'charm',id:'c_fa5'},{t:'Signature: The Steady Hand, a strong unique charm, and the title The Steady Hand',k:'sig',id:'c_fb5'}]}
];
const FACB=Object.fromEntries(FAC.map(f=>[f.id,f]));
// missions: count-based, tracked from the moment you accept. {k} is a counter, n the goal, rep the reward, r the rank needed to see it
const FMIS=[
 ['g1','guild','Clear the roads','Win 10 battles.','wins',10,12,1],['g2','guild','A good week','Win 25 battles.','wins',25,24,1],['g3','guild','Underground work','Win 8 dungeon battles.','dwins',8,20,1],
 ['g4','guild','Marked beasts','Beat 2 bounty beasts.','elite',2,26,2],['g5','guild','Lend a hand','Help or hire a wayfarer you meet on the road.','road',1,22,1],['g6','guild','Veteran company','Win 50 battles.','wins',50,42,3],
 ['s1','smiths','First strike','Temper 2 pieces of gear.','temper',2,12,1],['s2','smiths','Make something','Forge 3 pieces of gear.','forge',3,16,1],['s3','smiths','Union quota','Temper 5 pieces of gear.','temper',5,30,2],
 ['s4','smiths','A full rack','Forge 8 pieces of gear.','forge',8,36,2],['s5','smiths','Heat and patience','Temper 8 pieces of gear.','temper',8,46,3],['s6','smiths','Masterwork run','Forge 12 pieces of gear.','forge',12,52,3],
 ['a1','alch','Warm up the still','Brew 4 potions.','potion',4,12,1],['a2','alch','Stock the shelves','Brew 8 potions.','potion',8,20,1],['a3','alch','A real batch','Brew 15 potions.','potion',15,32,2],['a4','alch','Circle quota','Brew 25 potions.','potion',25,46,3],['a5','alch','The long cook','Brew 40 potions.','potion',40,60,4],
 ['w1','wardens','A new friend','Tame 1 creature.','tame',1,20,1],['w2','wardens','A second one','Tame 2 creatures.','tame',2,30,1],['w3','wardens','A full kennel','Tame 3 creatures.','tame',3,40,2],['w4','wardens','Hunt the marked','Beat 2 bounty beasts.','elite',2,24,1],['w5','wardens','Field work','Win 20 battles.','wins',20,16,1],
 ['r1','archive','The first echo','Beat 1 Echo boss.','echo',1,30,1],['r2','archive','A second page','Beat 2 Echo bosses.','echo',2,46,2],['r3','archive','The Scourge ledger','Bring down 1 Scourge.','scourge',1,30,1],['r4','archive','New faces','Help or hire a wayfarer you meet on the road.','road',1,22,1],['r5','archive','Margin notes','Win 30 battles.','wins',30,24,2],
 ['h1','hand','First on your own','Win 10 battles without Auto.','manual',10,12,1],['h2','hand','Hands on','Win 25 battles without Auto.','manual',25,24,1],['h3','hand','Marked beasts, by hand','Beat 2 bounty beasts.','elite',2,26,2],['h4','hand','Cool head','Win 60 battles without Auto.','manual',60,40,2],['h5','hand','Steady as iron','Win 100 battles without Auto.','manual',100,60,3]
].map(a=>({id:a[0],f:a[1],t:a[2],d:a[3],k:a[4],n:a[5],rep:a[6],r:a[7]}));
// special stock a rank unlocks. [mat or item id, label, price, perk rank, isItem]
const FSTOCK={smiths:[['core','Dread Core',480],['ore*','Ore bundle (3)',160,3],['wood*','Wood bundle (3)',140,3]],alch:[['elixir','Elixir',420,1,1],['herb*','Herb bundle (3)',150,3]],wardens:[['hide','Beast Hide (3)',120,3],['fang','Sharp Fang (3)',120,3],['scale','Tough Scale (3)',120,3]],archive:[['$rel','Realm relic (3)',150,3]]};
// ---------- state ----------
function facInit(){if(!G)return null;const f=G.fac=G.fac||{};f.ctr=f.ctr||{};f.bonus=f.bonus||{};f.acc=f.acc||{};f.done=f.done||{};f.claim=f.claim||{};f.seen=f.seen||{};return f;}
function facCredit(k,n){if(!G||G.daily)return;const f=facInit();f.ctr[k]=(f.ctr[k]||0)+(n||1);facDirty();}
function facDerived(k){if(!G)return 0;
  if(k==='wins')return (G.stats&&G.stats.won)||0;
  if(k==='tame')return (G.tamed||[]).length;
  if(k==='echo')return Object.keys(G.echoes||{}).filter(x=>G.echoes[x]).length;
  if(k==='scourge')return (G.cleared||[]).filter(Boolean).length;
  if(k==='road')return (G.ce&&G.ce.helped)||0;
  if(k==='temper'){let n=0;const cnt=g=>{n+=plusOf(g);};(G.gear||[]).forEach(cnt);Object.values(G.roster||{}).forEach(c=>Object.values(c.eq||{}).forEach(g=>g&&cnt(g)));return n;}
  return 0;}
function facCount(k){const f=facInit();return Math.max(f.ctr[k]||0,facDerived(k));}
function facRaw(id){const f=facInit(),C=facCount;
  switch(id){
   case 'guild':return Math.floor(C('wins')/4)+6*C('elite')+15*C('scourge')+10*Object.keys(G.roster||{}).filter(h=>typeof challIsPooled==='function'&&challIsPooled(h)).length+12*C('road');
   case 'smiths':return 5*C('forge')+4*C('temper');
   case 'alch':return 3*C('potion');
   case 'wardens':return 12*C('tame')+Math.floor((G.tamed||[]).reduce((a,t)=>a+(t.lv||0),0)/4);
   case 'hand':return 2*C('manual');
   case 'archive':return 20*C('echo')+15*C('scourge')+2*Object.keys(G.roster||{}).length+8*C('road');}
  return 0;}
function facRep(id){const f=facInit();return facRaw(id)+(f.bonus[id]||0);}
// ranks are read many times per screen (every forge price asks), so they are cached for a moment and dropped whenever standing changes
let FACMEMO={t:0,v:{},g:null};
function facDirty(){FACMEMO.t=0;}
function facRank(id){const now=Date.now();if(now-FACMEMO.t>250||FACMEMO.g!==G){FACMEMO={t:now,v:{},g:G};}if(FACMEMO.v[id]!=null)return FACMEMO.v[id];const r=facRep(id);let k=1;REP_AT.forEach((x,i)=>{if(r>=x)k=i+1;});FACMEMO.v[id]=k;return k;}
function facNeed(id){const r=facRank(id);return r>=6?null:REP_AT[r];}
function facPerks(id,rank){const o=[];FACB[id].perks.forEach((p,i)=>{if(p&&i+1<=rank)o.push(p);});return o;}
function facSum(k){if(!G||G.daily)return 0;let s=0;FAC.forEach(F=>facPerks(F.id,facRank(F.id)).forEach(p=>{if(p.k===k)s=Math.max(s,p.v||0);}));return s;}// same kind of perk from one faction is not stacked across ranks, the best one counts
function facSumAll(k){if(!G||G.daily)return 0;let s=0;FAC.forEach(F=>{let b=0;facPerks(F.id,facRank(F.id)).forEach(p=>{if(p.k===k)b=Math.max(b,p.v||0);});s+=b;});return s;}
function facMul(){return {xp:1+facSumAll('xp'),gold:1+facSumAll('gold')};}
function facBest(){if(!G||G.daily)return;META.facBest=META.facBest||{};let ch=0;FAC.forEach(F=>{const r=facRank(F.id);if(r>(META.facBest[F.id]||0)){META.facBest[F.id]=r;ch=1;}});if(ch){try{saveMeta();profileDirty();}catch(e){}}}
// rank-up notices (checked after fights, claims and when the screen opens)
function facSync(quiet){if(!G||G.daily)return;const f=facInit();FAC.forEach(F=>{const r=facRank(F.id),was=f.seen[F.id]||0;if(!was){f.seen[F.id]=r;return;}// first look just records where an old save stands
  if(r>was){f.seen[F.id]=r;if(!quiet)toast(`${F.n}: rank ${r}, ${F.ranks[r-1]}!`);}});facBest();}
// ---------- hooks that feed the counters ----------
{const au=autoTurn;autoTurn=function(){const r=au.apply(this,arguments);try{if(B&&B.auto)B.autoUsed=1;}catch(e){}return r;};}
{const fb=finishBattle;finishBattle=function(how){const sp=B&&B.spec,manual=!!(B&&!B.autoUsed&&!B.auto);const r=fb.apply(this,arguments);try{if(G&&!G.daily&&how==='win'&&sp){const k=sp.kind;if(k==='dungeon')facCredit('dwins');if(k==='elite')facCredit('elite');}if(G&&!G.daily&&how==='win'){facCredit('wins');if(manual)facCredit('manual');}facSync();}catch(e){}return r;};}
{const fg=forge;forge=function(){const r=fg.apply(this,arguments);try{if(r&&!G.daily)facCredit('temper');}catch(e){}return r;};}
{const cr=craft;craft=function(rcp){const g0=G.gold,r=cr.apply(this,arguments);try{if(r&&!G.daily){const spent=g0-G.gold;
  if(rcp.item){facCredit('potion');const rb=facSumAll('rebate');if(rb>0&&spent>0){const back=Math.round(spent*rb);if(back>0){G.gold+=back;toast(`Circle rebate: ${back} gold back.`);}}
    const dbl=facRank('alch')>=6?.15:0;if(dbl&&Math.random()<dbl&&(G.inv[rcp.item]||0)<invCap()){G.inv[rcp.item]++;toast('The Archmage\'s touch: one extra!');}}
  else{facCredit('forge');const rb=facSmithRebate();if(rb>0&&spent>0){const back=Math.round(spent*rb);if(back>0){G.gold+=back;toast(`Union rebate: ${back} gold back.`);}}}}}catch(e){}return r;};}
{const rt=registerTamed;registerTamed=function(o){const r=rt.apply(this,arguments);try{if(G&&!G.daily&&o&&!o._fc){o._fc=1;facCredit('tame');}}catch(e){}return r;};}
{const fc=forgeCost;forgeCost=function(){const c=fc.apply(this,arguments);try{if(c&&G&&!G.daily){const d=facSmithDisc();if(d>0)c.gold=Math.max(1,Math.round(c.gold*(1-d)));}}catch(e){}return c;};}
{const ic=innCost;innCost=function(){let c=ic.apply(this,arguments);try{if(G&&!G.daily){const d=facSum('inn');if(d>0)c=Math.max(1,Math.round(c*(1-d)));}}catch(e){}return c;};}
function facSmithDisc(){const r=facRank('smiths');let b=0;FACB.smiths.perks.slice(0,r).forEach(p=>{if(p&&p.k==='forge')b=Math.max(b,p.v);});return b;}
function facSmithRebate(){const r=facRank('smiths');let b=0;FACB.smiths.perks.slice(0,r).forEach(p=>{if(p&&p.rebate)b=Math.max(b,p.rebate);});return b;}
// ---------- missions ----------
function facMissionList(id){const f=facInit(),r=facRank(id),pool=FMIS.filter(m=>m.f===id&&m.r<=r&&!f.done[m.id]);
  const acc=pool.filter(m=>f.acc[m.id]!=null),rest=pool.filter(m=>f.acc[m.id]==null);if(rest.length<=2)return acc.concat(rest);
  const R=seeded(hashS((G.run.seed||1)+':fm:'+id+':'+(G.tavRoll||0))),left=rest.slice(),pk=[];while(pk.length<2&&left.length){pk.push(left.splice(Math.floor(R()*left.length),1)[0]);}return acc.concat(pk);}
function facProg(m){const f=facInit();return Math.max(0,Math.min(m.n,facCount(m.k)-(f.acc[m.id]||0)));}
ACT.facAccept=function(id){const m=FMIS.find(x=>x.id===id);if(!m||!G||G.daily)return;const f=facInit();if(f.acc[id]!=null)return;f.acc[id]=facCount(m.k);saveGame();toast(`Mission taken: ${m.t}.`);render();};
ACT.facClaim=function(id){const m=FMIS.find(x=>x.id===id);if(!m)return;const f=facInit();if(f.acc[id]==null||f.done[id]||facProg(m)<m.n)return;f.done[id]=1;f.bonus[m.f]=(f.bonus[m.f]||0)+m.rep;facDirty();const g=Math.round(m.rep*7*(1+.25*G.stage));G.gold+=g;facSync();saveGame();sfx('chest');toast(`${m.t} done: +${m.rep} standing, ${g} gold.`);render();};
ACT.facPerk=function(a){const [id,rk]=String(a).split(':'),r=+rk,F=FACB[id];if(!F||!G||G.daily)return;const f=facInit(),key=id+':'+r;if(f.claim[key]||facRank(id)<r)return;const p=F.perks[r-1];if(!p)return;
  if(p.k==='charm'||p.k==='sig'){G.gear.push(p.id);f.claim[key]=1;toast(`${gearOf(p.id).n} added to your gear.`);}
  else if(p.k==='recruit'){const pool=(typeof caveRecruitPool==='function'?caveRecruitPool(Math.min(4,G.stage+1)):[]);if(pool.length){const h=pool[hashS((G.run.seed||1)+key)%pool.length];recruit(h,true);try{codexSee(h,{rec:1,lv:G.roster[h].lv});}catch(e){}f.claim[key]=1;toast(`${TPL[h].n} joins you, sent by ${F.n}.`);}
    else{G.gold+=400+200*G.stage;f.claim[key]=1;toast('No one is left to send, so the faction pays 400+ gold instead.');}}
  saveGame();sfx('level');render();};
ACT.facBuy=function(a){const [id,i]=String(a).split(':'),S=(FSTOCK[id]||[])[+i];if(!S||!G||G.daily)return;const need=S[3]||4,item=S[4];if(facRank(id)<(FACB[id].perks.findIndex(p=>p&&p.k==='stock')+1))return;
  if(G.gold<S[2])return;let key=S[0];if(!item){key=S[0]==='$rel'?ZS(G.stage).mat:resolveDrop(S[0],G.stage);}
  if(item&&(G.inv[key]||0)>=invCap()){toast('You carry the most of those already.');return;}
  G.gold-=S[2];if(item)G.inv[key]=(G.inv[key]||0)+1;else{const q=/\(3\)/.test(S[1])?3:1;if(S[0]==='hide'||S[0]==='fang'||S[0]==='scale'||S[0]==='$rel'||/bundle/.test(S[1]))G.mats[key]=(G.mats[key]||0)+3;else G.mats[key]=(G.mats[key]||0)+q;}
  saveGame();sfx('chest');toast(`Bought ${S[1]}.`);render();};
// ---------- screens ----------
function facBar(id){const r=facRank(id),rep=facRep(id),nx=facNeed(id),lo=REP_AT[r-1];const pc=nx==null?100:Math.round((rep-lo)/(nx-lo)*100);
  return `<div class="facbar" style="height:8px;background:#222;border-radius:4px;overflow:hidden;margin:4px 0"><i style="display:block;height:8px;width:${pc}%;background:${FACB[id].col}"></i></div>`;}
function facMisRow(m){const f=facInit(),acc=f.acc[m.id]!=null,pr=facProg(m),ready=acc&&pr>=m.n;
  const btn=ready?`<button class="btn sm gold" data-act="facClaim" data-arg="${m.id}">Claim</button>`:acc?`<span class="m">${pr}/${m.n}</span>`:`<button class="btn sm" data-act="facAccept" data-arg="${m.id}">Accept</button>`;
  return `<div class="row"><div><b>${esc(m.t)}</b><small>${esc(m.d)} Reward: +${m.rep} standing and gold.${acc&&!ready?` Progress ${pr}/${m.n}.`:''}</small></div>${btn}</div>`;}
function vFactions(){if(!G)return '';facSync(true);const f=facInit(),best=META.facBest||{};
  const tt=FAC.filter(F=>(META.facBest||{})[F.id]>=6).map(F=>F.ranks[5]);return `${tt.length?`<p class="note"><b>Account titles:</b> ${tt.map(esc).join(', ')}</p>`:''}<p class="note">Six factions track what you already do on the road. Their standing and perks belong to this journey only. Nothing here is needed to finish the game. Only the best rank you reach is kept on your account, as a title.</p>`+FAC.map(F=>{
    const r=facRank(F.id),rep=facRep(F.id),nx=facNeed(F.id),perks=F.perks.map((p,i)=>{if(!p)return '';const rk=i+1,on=r>=rk,key=F.id+':'+rk;
      let act='';if(on&&(p.k==='charm'||p.k==='recruit'||p.k==='sig')){act=f.claim[key]?'<span class="m up">Claimed</span>':`<button class="btn sm gold" data-act="facPerk" data-arg="${key}">Claim</button>`;}
      return `<div class="row ${on?'':'lock'}"><div><b>Rank ${rk}: ${esc(F.ranks[i])}</b><small>${esc(p.t)}${on&&!act?'':''}</small></div>${on?(act||'<span class="m up">Active</span>'):'<span class="m">Locked</span>'}</div>`;}).join('');
    const si=F.perks.findIndex(p=>p&&p.k==='stock')+1,stock=si&&r>=si?`<h5>Counter stock</h5><div class="rows compact">${(FSTOCK[F.id]||[]).map((S,i)=>`<div class="row"><div><b>${esc(S[1])}</b></div><button class="btn sm" data-act="facBuy" data-arg="${F.id}:${i}" ${G.gold<S[2]?'disabled':''}>${fmt(S[2])}g</button></div>`).join('')}</div>`:'';
    const ms=facMissionList(F.id).map(facMisRow).join('');
    return `<div class="panel-sub facc" style="border-left:4px solid ${F.col};padding:6px 10px;margin:8px 0;background:rgba(255,255,255,.03)"><h4>${F.i} ${esc(F.n)} <small class="m">${esc(F.ranks[r-1])}${best[F.id]>r?' (best: '+esc(F.ranks[best[F.id]-1])+')':''}</small></h4><small>${esc(F.desc)}</small>${facBar(F.id)}<small>${nx==null?`${rep} standing. Top rank.`:`${rep} / ${nx} standing for ${esc(F.ranks[r])}`}</small>
      <details><summary>Perks (${F.perks.filter((p,i)=>p&&r>=i+1).length}/5)</summary><div class="rows compact">${perks}</div></details>${stock}${ms?`<h5>Missions</h5><div class="rows compact">${ms}</div>`:''}</div>`;}).join('');}
function vFacMissions(){if(!G)return '';facSync(true);
  return `<p class="note">Missions the factions have posted for you right now. They rotate after an inn rest, like the Guild Hall board. Accepted ones stay until done. Standing from any source also counts toward ranks on the Factions page in Records.</p>`+FAC.map(F=>{const ms=facMissionList(F.id);return `<h4>${F.i} ${esc(F.n)} <small class="m">${esc(F.ranks[facRank(F.id)-1])}</small></h4><div class="rows compact">${ms.length?ms.map(facMisRow).join(''):'<div class="row"><small>Nothing posted. Rank up to see more.</small></div>'}</div>`;}).join('');}
// rank strip on the matching shop screens
{const vm0=vModal;vModal=function(m){const h=vm0.apply(this,arguments);try{const map={smithy:'smiths',workshop:'alch',board:'guild',beast:'wardens',archivist:'archive'};const id=m&&map[m.type];
  if(id&&G&&!G.daily&&typeof h==='string'){const F=FACB[id],r=facRank(id),pk=facPerks(id,r).slice(-1)[0];const strip=`<p class="note facrank" style="border-left:3px solid ${F.col};padding-left:6px">${F.i} ${esc(F.n)}: ${esc(F.ranks[r-1])}${pk?'. '+esc(pk.t):''} <button class="btn sm" data-act="menuTab" data-arg="factions">Factions</button></p>`;
    const k=h.indexOf('</h2>');if(k>0)return h.slice(0,k+5)+strip+h.slice(k+5);}}catch(e){}return h;};}
