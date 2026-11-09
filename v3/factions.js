// ===== factions.js (v0.4.0): factions: reputation, ranks, missions and their perks =====
// Six factions (shown as guilds), six standing steps each, shown as five ranks (FAC3 below; three in v0.9.5 to v0.10.x, five again now). Reputation = counters you already earn by playing (forging, potions, taming, wins, echoes, Scourges, helping wayfarers)
// plus bonus from missions. Everything is per journey (G.fac, an optional save field). Only the highest rank reached per faction goes in the account
// profile (META.facBest) and it is a title, nothing more. Nothing here is required to finish the game, Legendary heroes never come from factions,
// and the Daily Trial ignores all of it (no counters, no discounts, no bonuses).
const FAC=[
 {id:'guild',n:"Wayfarers' Guild",i:'⚑',col:'#e0b04a',desc:'General work for the road. Wins, marked beasts, cleared Scourges and the wayfarers you help earn its trust.',
  ranks:['Recruit','Wayfarer','Pathfinder','Trailwarden','Captain','Guildmaster'],
  perks:[{t:'Inn rooms cost 3% less',k:'inn',v:.03},{t:'Inn rooms cost 10% less',k:'inn',v:.10},{t:'Battle gold +5%',k:'gold',v:.05},{t:'A challenge only wayfarer joins you (pick up at the Factions page)',k:'recruit'},{t:'Guildmark Pin, a unique charm',k:'charm',id:'c_fa0'},{t:"Signature: Guildmaster's Seal, a strong unique charm, and the title Guildmaster",k:'sig',id:'c_fb0'}]},
 {id:'smiths',n:"Smiths' Union",i:'⚒',col:'#d8743a',desc:'Forging and tempering. Every forged piece and every temper counts.',
  ranks:['Apprentice','Hammerhand','Journeyman','Foreman','Master Smith','Grandsmith'],
  perks:[{t:'Tempering costs 3% less gold',k:'forge',v:.03},{t:'Tempering costs 5% less gold',k:'forge',v:.05},{t:'Tempering costs 10% less; 10% of forging gold comes back',k:'forge',v:.10,rebate:.10},{t:'Union stock: Dread Core and ore bundles at the Union counter',k:'stock'},{t:'Anvilmark Charm, a unique charm',k:'charm',id:'c_fa1'},{t:'Signature: Grandsmith\'s Hammerpin, a strong unique charm, and the title Grandsmith',k:'sig',id:'c_fb1'}]},
 {id:'alch',n:"Alchemists' Circle",i:'⚗',col:'#5ac08a',desc:'Potions. Every potion, ether and elixir you brew earns standing.',
  ranks:['Initiate','Brewer','Distiller','Adept','Magister','Archmage of Vials'],
  perks:[{t:'4% of brewing gold comes back',k:'rebate',v:.04},{t:'8% of brewing gold comes back',k:'rebate',v:.08},{t:'15% of brewing gold comes back',k:'rebate',v:.15},{t:'Circle stock: Elixirs and herb bundles at the Circle counter',k:'stock'},{t:'Vialmark Charm, a unique charm',k:'charm',id:'c_fa2'},{t:'Signature: 15% chance every brew makes one extra, a strong unique charm (Archmage\'s Phial), and the title Archmage of Vials',k:'sig',id:'c_fb2',dbl:.15}]},
 {id:'wardens',n:'Beastwardens',i:'🐾',col:'#8ad04a',desc:'Taming and companions. Every creature that follows you counts.',
  ranks:['Pup','Tracker','Handler','Warden','Beastmaster','Warden of Wilds'],
  perks:[{t:'XP +1%',k:'xp',v:.01},{t:'XP +3%',k:'xp',v:.03},{t:'XP +5%',k:'xp',v:.05},{t:'Warden stock: parts bundles at the Warden counter',k:'stock'},{t:'Wildcall Charm, a unique charm',k:'charm',id:'c_fa3'},{t:'Signature: Wild Heart, a strong unique charm, and the title Warden of Wilds',k:'sig',id:'c_fb3'}]},
 {id:'archive',n:'Archivists',i:'📖',col:'#9a8aff',desc:'Knowledge. Echoes beaten, Scourges brought down and every wayfarer you gather get written down.',
  ranks:['Reader','Scribe','Cataloguer','Lorekeeper','Curator','Keeper of the Last Page'],
  perks:[{t:'XP +1%',k:'xp',v:.01},{t:'XP +3%',k:'xp',v:.03},{t:'Archive stock: relic bundles at the Archivist counter',k:'stock'},{t:'A challenge only wayfarer joins you (pick up at the Factions page)',k:'recruit'},{t:'Inkmark Charm, a unique charm',k:'charm',id:'c_fa4'},{t:'Signature: The Last Page, a strong unique charm, and the title Keeper of the Last Page',k:'sig',id:'c_fb4'}]},
 {id:'hand',n:'The Steady Hand',i:'✋',col:'#c8a070',desc:'Fights you take yourself. Every battle finished without Auto earns its respect.',
  ranks:['Onlooker','Steady','Sure Hand','Cool Head','Hand of Iron','The Steady Hand'],
  perks:[{t:'XP +1%',k:'xp',v:.01},{t:'XP +2%',k:'xp',v:.02},{t:'Battle gold +3%',k:'gold',v:.03},{t:'Inn rooms cost 5% less',k:'inn',v:.05},{t:'Steady Knot, a unique charm',k:'charm',id:'c_fa5'},{t:'Signature: The Steady Hand, a strong unique charm, and the title The Steady Hand',k:'sig',id:'c_fb5'}]}
];
const FACB=Object.fromEntries(FAC.map(f=>[f.id,f]));
// ---------- five ranks per guild (v0.9.5 had three) ----------
// Standing still climbs the six old steps (facRank, REP_AT, META.facBest, G.fac.seen and the claim keys 'id:step' keep their meaning),
// but the player sees five ranks, one perk step each: steps 1 to 4 are ranks 1 to 4 (0, 40, 110, 230 standing) and steps 5 and 6 are
// rank 5 (400 standing, the old top rank). Rank is always recomputed from standing, so old saves keep all progress; every perk opens at the
// same standing as before or earlier, a claimed charm or recruit stays claimed (same keys). Rank 1 gets a new small perk. Same kind perks merge (the best counts).
const FAC3_STEP=[0,1,2,3,4,5,5];// step -> rank
const facTierOf=step=>FAC3_STEP[Math.max(1,Math.min(6,step|0))];
const FAC3_AT=()=>[0,REP_AT[1],REP_AT[2],REP_AT[3],REP_AT[4]];
const FAC3={
 guild:{n:['Recruit','Wayfarer','Pathfinder','Trailwarden','Guildmaster'],t:['Inn rooms 3% less.','Inn rooms 10% less.','Battle gold +5%.','A challenge only wayfarer joins you.','Two unique charms (Guildmark Pin, Guildmaster\'s Seal) and the title Guildmaster.']},
 smiths:{n:['Apprentice','Hammerhand','Journeyman','Foreman','Grandsmith'],t:['Tempering 3% less.','Tempering 5% less.','Tempering 10% less, and 10% of forging gold back.','The Union counter (Dread Cores, ore and wood).','Two unique charms (Anvilmark Charm, Grandsmith\'s Hammerpin) and the title Grandsmith.']},
 alch:{n:['Initiate','Brewer','Distiller','Adept','Archmage of Vials'],t:['4% of brewing gold back.','8% of brewing gold back.','15% of brewing gold back.','The Circle counter (Elixirs, herb bundles).','A 15% chance of one extra from every brew, two unique charms (Vialmark Charm, Archmage\'s Phial) and the title Archmage of Vials.']},
 wardens:{n:['Pup','Tracker','Handler','Warden','Warden of Wilds'],t:['XP +1%.','XP +3%.','XP +5%.','The Warden counter (parts bundles).','Two unique charms (Wildcall Charm, Wild Heart) and the title Warden of Wilds.']},
 archive:{n:['Reader','Scribe','Cataloguer','Lorekeeper','Keeper of the Last Page'],t:['XP +1%.','XP +3%.','The Archive counter (relic bundles).','A challenge only wayfarer joins you.','Two unique charms (Inkmark Charm, The Last Page) and the title Keeper of the Last Page.']},
 hand:{n:['Onlooker','Steady','Sure Hand','Cool Head','The Steady Hand'],t:['XP +1%.','XP +2%.','Battle gold +3%.','Inn rooms 5% less.','Two unique charms (Steady Knot, The Steady Hand) and the title The Steady Hand.']}};
function facTier(id){return facTierOf(facRank(id));}
const facTierName=(id,t)=>FAC3[id].n[(t||facTier(id))-1];
// the old steps whose perks a rank holds, and its claimable perks (charms and the recruit), each claimed under its old key
function facTierSteps(t){const o=[];for(let s=1;s<=6;s++)if(FAC3_STEP[s]===t)o.push(s);return o;}
function facTierClaims(id,t){return facTierSteps(t).map(s=>({s,p:FACB[id].perks[s-1],key:id+':'+s})).filter(o=>o.p&&(o.p.k==='charm'||o.p.k==='sig'||o.p.k==='recruit'));}
function facTierNeed(id){const t=facTier(id);return t>=5?null:FAC3_AT()[t];}
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
function facInit(){if(!G)return null;const f=G.fac=G.fac||{};f.ctr=f.ctr||{};f.bonus=f.bonus||{};f.acc=f.acc||{};f.done=f.done||{};f.claim=f.claim||{};f.seen=f.seen||{};f.hand=f.hand||{};return f;}
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
function facPerks(id,rank){const t=facTierOf(rank),o=[];FACB[id].perks.forEach((p,i)=>{if(p&&facTierOf(i+1)<=t)o.push(p);});return o;}// v0.9.5: every perk of the ranks reached
function facSum(k){if(!G||G.daily)return 0;let s=0;FAC.forEach(F=>facPerks(F.id,facRank(F.id)).forEach(p=>{if(p.k===k)s=Math.max(s,p.v||0);}));return s;}// same kind of perk from one faction is not stacked across ranks, the best one counts
function facSumAll(k){if(!G||G.daily)return 0;let s=0;FAC.forEach(F=>{let b=0;facPerks(F.id,facRank(F.id)).forEach(p=>{if(p.k===k)b=Math.max(b,p.v||0);});s+=b;});return s;}
function facMul(){return {xp:1+facSumAll('xp'),gold:1+facSumAll('gold')};}
function facBest(){if(!G||G.daily)return;META.facBest=META.facBest||{};let ch=0;FAC.forEach(F=>{const r=facRank(F.id);if(r>(META.facBest[F.id]||0)){META.facBest[F.id]=r;ch=1;}});if(ch){try{saveMeta();profileDirty();}catch(e){}}}
// rank-up notices (checked after fights, claims and when the screen opens)
function facSync(quiet){if(!G||G.daily)return;const f=facInit();FAC.forEach(F=>{const r=facRank(F.id),was=f.seen[F.id]||0;if(!was){f.seen[F.id]=r;return;}// first look just records where an old save stands
  if(r>was){f.seen[F.id]=r;const t=facTierOf(r);if(!quiet&&t>facTierOf(was))toast(`${F.n}: rank ${t}, ${facTierName(F.id,t)}! ${FAC3[F.id].t[t-1]}`);}});facBest();}
// ---------- hooks that feed the counters ----------
{const au=autoTurn;autoTurn=function(){const r=au.apply(this,arguments);try{if(B&&B.auto)B.autoUsed=1;}catch(e){}return r;};}
HOOK.wrap('finishBattle','factions','faction credit',function(next,...a){const how=a[0];const sp=B&&B.spec,manual=!!(B&&!B.autoUsed&&!B.auto);const r=next(...a);try{if(G&&!G.daily&&how==='win'&&sp){const k=sp.kind;if(k==='dungeon')facCredit('dwins');if(k==='elite')facCredit('elite');}if(G&&!G.daily&&how==='win'){facCredit('wins');if(manual)facCredit('manual');}facSync();}catch(e){}return r;});
{const fg=forge;forge=function(){const r=fg.apply(this,arguments);try{if(r&&!G.daily)facCredit('temper');}catch(e){}return r;};}
{const cr=craft;craft=function(rcp){const g0=G.gold,r=cr.apply(this,arguments);try{if(r&&!G.daily){const spent=g0-G.gold;
  if(rcp.item){facCredit('potion');const rb=facSumAll('rebate');if(rb>0&&spent>0){const back=Math.round(spent*rb);if(back>0){G.gold+=back;toast(`Circle rebate: ${back} gold back.`);}}
    const dbl=facTier('alch')>=5?.15:0;if(dbl&&Math.random()<dbl&&(G.inv[rcp.item]||0)<invCap()){G.inv[rcp.item]++;toast('The Archmage\'s touch: one extra!');}}
  else{facCredit('forge');const rb=facSmithRebate();if(rb>0&&spent>0){const back=Math.round(spent*rb);if(back>0){G.gold+=back;toast(`Union rebate: ${back} gold back.`);}}}}}catch(e){}return r;};}
{const rt=registerTamed;registerTamed=function(o){const r=rt.apply(this,arguments);try{if(G&&!G.daily&&o&&!o._fc){o._fc=1;facCredit('tame');}}catch(e){}return r;};}
{const fc=forgeCost;forgeCost=function(){const c=fc.apply(this,arguments);try{if(c&&G&&!G.daily){const d=facSmithDisc();if(d>0)c.gold=Math.max(1,Math.round(c.gold*(1-d)));}}catch(e){}return c;};}
{const ic=innCost;innCost=function(){let c=ic.apply(this,arguments);try{if(G&&!G.daily){const d=facSum('inn');if(d>0)c=Math.max(1,Math.round(c*(1-d)));}}catch(e){}return c;};}
function facSmithDisc(){let b=0;facPerks('smiths',facRank('smiths')).forEach(p=>{if(p.k==='forge')b=Math.max(b,p.v);});return b;}
function facSmithRebate(){let b=0;facPerks('smiths',facRank('smiths')).forEach(p=>{if(p.rebate)b=Math.max(b,p.rebate);});return b;}
// ---------- missions ----------
function facMissionList(id){const f=facInit(),t=facTier(id),pool=FMIS.filter(m=>m.f===id&&facTierOf(m.r)<=t&&!f.done[m.id]);
  const acc=pool.filter(m=>f.acc[m.id]!=null),rest=pool.filter(m=>f.acc[m.id]==null);if(rest.length<=2)return acc.concat(rest);
  const R=seeded(hashS((G.run.seed||1)+':fm:'+id+':'+(G.tavRoll||0))),left=rest.slice(),pk=[];while(pk.length<2&&left.length){pk.push(left.splice(Math.floor(R()*left.length),1)[0]);}return acc.concat(pk);}
// v0.7.7: progress counts everything done on this journey, also before the mission was accepted (the owner's call); acc only marks it taken
// v0.10.x: missions taken from now on are handed in at a Guild Hall (any town's); older ones (no hand flag) still claim anywhere
function facAtHall(){return !!(V&&V.modal&&V.modal.type==='guild');}
function facCanHand(id){const f=facInit();return !f.hand[id]||facAtHall();}
function facProg(m){return Math.max(0,Math.min(m.n,facCount(m.k)));}
ACT.facAccept=function(id){const m=FMIS.find(x=>x.id===id);if(!m||!G||G.daily)return;const f=facInit();if(f.acc[id]!=null)return;f.acc[id]=facCount(m.k);f.hand[id]='guild';saveGame();toast(`Mission taken: ${m.t}.`);render();};
ACT.facClaim=function(id){const m=FMIS.find(x=>x.id===id);if(!m)return;const f=facInit();if(f.acc[id]==null||f.done[id]||facProg(m)<m.n)return;if(!facCanHand(id)){toast('Hand in at any Guild Hall.');return;}f.done[id]=1;f.bonus[m.f]=(f.bonus[m.f]||0)+m.rep;facDirty();const g=Math.round(m.rep*7*(1+.25*G.stage));G.gold+=g;facSync();saveGame();sfx('chest');toast(`${m.t} done: +${m.rep} standing, ${g} gold.`);render();};
ACT.facPerk=function(a){const [id,rk]=String(a).split(':'),r=+rk,F=FACB[id];if(!F||!G||G.daily)return;const f=facInit(),key=id+':'+r,t=facTierOf(r);if(f.claim[key]||facTier(id)<t)return;const p=F.perks[r-1];if(!p)return;
  // v0.9.5: one Claim per rank hands over every charm of that rank not yet claimed (the old keys are marked, so old saves stay claimed)
  if(p.k==='charm'||p.k==='sig'){const got=[];facTierClaims(id,t).forEach(o=>{if((o.p.k==='charm'||o.p.k==='sig')&&!f.claim[o.key]){G.gear.push(o.p.id);f.claim[o.key]=1;got.push(gearOf(o.p.id).n);}});toast(`${got.join(' and ')} added to your gear.`);}
  else if(p.k==='recruit'){const pool=(typeof caveRecruitPool==='function'?caveRecruitPool(Math.min(4,G.stage+1)):[]);if(pool.length){const h=pool[hashS((G.run.seed||1)+key)%pool.length];recruit(h,true);try{codexSee(h,{rec:1,lv:G.roster[h].lv});}catch(e){}f.claim[key]=1;toast(`${TPL[h].n} joins you, sent by ${F.n}.`);}
    else{G.gold+=400+200*G.stage;f.claim[key]=1;toast('No one is left to send, so the faction pays 400+ gold instead.');}}
  saveGame();sfx('level');render();};
ACT.facBuy=function(a){const [id,i]=String(a).split(':'),S=(FSTOCK[id]||[])[+i];if(!S||!G||G.daily)return;const need=S[3]||4,item=S[4];if(facTier(id)<facTierOf(FACB[id].perks.findIndex(p=>p&&p.k==='stock')+1))return;
  if(G.gold<S[2])return;let key=S[0];if(!item){key=S[0]==='$rel'?ZS(G.stage).mat:resolveDrop(S[0],G.stage);}
  if(item&&(G.inv[key]||0)>=invCap()){toast('You carry the most of those already.');return;}
  G.gold-=S[2];if(item)G.inv[key]=(G.inv[key]||0)+1;else{const q=/\(3\)/.test(S[1])?3:1;if(S[0]==='hide'||S[0]==='fang'||S[0]==='scale'||S[0]==='$rel'||/bundle/.test(S[1]))G.mats[key]=(G.mats[key]||0)+3;else G.mats[key]=(G.mats[key]||0)+q;}
  saveGame();sfx('chest');toast(`Bought ${S[1]}.`);render();};
// ---------- screens ----------
// five ranks, one line each. The missions are a list of their own on the Notice Board's Guilds tab (board in menus3.js).
function facBar(id){const t=facTier(id),rep=facRep(id),nx=facTierNeed(id),lo=FAC3_AT()[t-1];const pc=nx==null?100:Math.max(0,Math.min(100,Math.round((rep-lo)/(nx-lo)*100)));
  return `<div class="facbar"><i style="width:${pc}%;background:${FACB[id].col}"></i></div>`;}
function facMisState(m){const f=facInit(),acc=f.acc[m.id]!=null,pr=facProg(m);return f.done[m.id]?'done':acc?(pr>=m.n?'ready':'active'):'open';}
function facMisRow(m){const f=facInit(),acc=f.acc[m.id]!=null,pr=facProg(m),ready=acc&&pr>=m.n,F=FACB[m.f];
  const away=ready&&!facCanHand(m.id),btn=ready?(away?`<button class="btn sm gold" disabled title="Hand in at any Guild Hall">Claim</button>`:`<button class="btn sm gold" data-act="facClaim" data-arg="${m.id}">Claim</button>`):acc?`<span class="m nums">${pr}/${m.n}</span>`:`<button class="btn sm ${pr>=m.n?'gold':''}" data-act="facAccept" data-arg="${m.id}">Accept</button>`;
  return `<div class="row facm"><div class="grow"><b>${esc(m.t)}</b>${ready?' <em class="qtag">Ready</em>':''} <small class="facg" style="--fc:${F.col}">${F.i} ${esc(F.n)}</small><small>${esc(m.d)} Reward: +${m.rep} standing and gold.${away?' Hand in at any Guild Hall.':''}${!ready?` Progress ${pr}/${m.n}${!acc&&pr>=m.n?', done already: accept to claim':''}.`:''}</small></div>${btn}</div>`;}
function facRankRows(F){const f=facInit(),t=facTier(F.id),D=FAC3[F.id],at=FAC3_AT();
  return D.n.map((nm,i)=>{const rk=i+1,on=t>=rk,C=facTierClaims(F.id,rk),open=C.filter(o=>!f.claim[o.key]);
    const act=!on?`<span class="m nums">${fmt(at[i])}</span>`:C.length?(open.length?`<button class="btn sm gold" data-act="facPerk" data-arg="${open[0].key}">Claim</button>`:'<span class="m up">Claimed</span>'):'<span class="m up">Active</span>';
    return `<div class="row ${on?'':'lock'}"><div class="grow"><b>${rk}. ${esc(nm)}</b><small>${esc(D.t[i])}</small></div>${act}</div>`;}).join('');}
function vFactions(){if(!G)return '';facSync(true);const best=META.facBest||{};
  const tt=FAC.filter(F=>facTierOf(best[F.id]||1)>=5).map(F=>FAC3[F.id].n[4]);
  return `${tt.length?`<p class="note"><b>Account titles:</b> ${tt.map(esc).join(', ')}</p>`:''}<p class="note">Each guild has five ranks, one perk step each. Standing comes from what you already do on the road, and missions add more. Ranks and perks belong to this journey; the top rank you reach is kept on your account as a title. Nothing here is needed to finish the game.</p>`+FAC.map(F=>{
    const t=facTier(F.id),rep=facRep(F.id),nx=facTierNeed(F.id),si=F.perks.findIndex(p=>p&&p.k==='stock')+1;
    const stock=si&&t>=facTierOf(si)?`<details class="facstock"><summary>Counter stock</summary><div class="rows compact">${(FSTOCK[F.id]||[]).map((S,i)=>`<div class="row"><div class="grow"><b>${esc(S[1])}</b></div><button class="btn sm" data-act="facBuy" data-arg="${F.id}:${i}" ${G.gold<S[2]?'disabled':''}>${fmt(S[2])}g</button></div>`).join('')}</div></details>`:'';
    return `<div class="facc" style="--fc:${F.col}"><h4>${F.i} ${esc(F.n)} <small class="m">Rank ${t}: ${esc(facTierName(F.id,t))}</small></h4><small>${esc(F.desc)}</small>${facBar(F.id)}<small class="nums">${nx==null?`${fmt(rep)} standing. Top rank.`:`${fmt(rep)} / ${fmt(nx)} standing for ${esc(facTierName(F.id,t+1))}`}</small>
      <div class="rows compact facr">${facRankRows(F)}</div>${stock}</div>`;}).join('');}
// every posted mission, ready to claim first, then under way, then open; sec: all, ready, active, open
function facMisAll(){return FAC.flatMap(F=>facMissionList(F.id));}
function vFacMissions(sec){if(!G)return '';facSync(true);sec=sec||'all';const o={ready:0,active:1,open:2};
  const L=facMisAll().filter(m=>sec==='all'||facMisState(m)===sec).sort((a,b)=>o[facMisState(a)]-o[facMisState(b)]);
  return `<p class="note">Missions rotate after an inn rest. Accepted ones stay until done, and everything you did before accepting counts.</p>${L.length?`<div class="rows">${L.map(facMisRow).join('')}</div>`:`<p class="note empty">${{ready:'No mission is ready to claim yet.',active:'No missions under way.',open:'No new missions posted. Rank up for more.'}[sec]||'No missions posted yet. Rank up for more.'}</p>`}`;}
// rank strip on the matching shop screens
HOOK.xform('vModal','factions','faction rank row on the shop popups',function(h,m){try{const map={smithy:'smiths',workshop:'alch',beast:'wardens',archivist:'archive'};const id=m&&map[m.type];
  if(id&&G&&!G.daily&&typeof h==='string'){const F=FACB[id],t=facTier(id);const strip=`<p class="note facrank" style="border-left:3px solid ${F.col};padding-left:6px">${F.i} ${esc(F.n)}: ${esc(facTierName(id,t))}. ${esc(FAC3[id].t[t-1])} <button class="btn sm" data-act="menuTab" data-arg="factions">Guilds</button></p>`;
    const k=h.indexOf('</h2>');if(k>0)return h.slice(0,k+5)+strip+h.slice(k+5);}}catch(e){}return h;});
