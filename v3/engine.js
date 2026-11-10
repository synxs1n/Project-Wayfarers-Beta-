// ===== engine.js (base): core state (G, B, V, META), stats, saves, town services, quests, damage, the battle engine and auto battle =====
// =================== CORE ===================
const SAVEKEY='aurelis-wayfarers-v3',METAKEY='aurelis-meta-v1';
let G=null,B=null,V={screen:'title',modal:null,pick:[],shopTab:'supplies',flt:'all',auto:false};
let PAUSE=750,RNG=Math.random;
const rnd=(a,b)=>a+RNG()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(RNG()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=n=>Math.round(n).toLocaleString('en-US');
// Beta v0.3.0: hard cap 50 (heroes already above it in old saves keep their level).
// LV_CAP: in config.js

function battlePaused(){return V.screen==='battle'&&((V.modal&&['settings','menu','pause','feedback','fbcopy','wxinfo','battlelore'].includes(V.modal.type))||!!(B&&B.uDet));}
const later=(f,ms)=>setTimeout(function run(){if(battlePaused())return setTimeout(run,120);f();},ms);
function seeded(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

// ----- meta progress (survives between campaigns) -----
let META={legacy:[],cycles:0,clears:0,best:{},codex:{},archivist:0,legends:{},cfg:{speed:1,enc:'normal',diff:'normal',music:.45,sfx:.6,autoStats:true,autoEquip:false}};
function loadMeta(){try{const s=localStorage.getItem(METAKEY);if(s){const o=JSON.parse(s);META=Object.assign(META,o);META.cfg=Object.assign({speed:1,enc:'normal',diff:'normal',music:.45,sfx:.6,autoStats:true,autoEquip:false},o.cfg||{});}}catch(e){}applyCfg();}
function saveMeta(){try{localStorage.setItem(METAKEY,JSON.stringify(META));}catch(e){}}
function applyCfg(){const sp=META.cfg.speed;if(sp!==1&&sp!==1.5&&sp!==2)META.cfg.speed=sp>2?2:sp>1.2?1.5:1;PAUSE=Math.round(750/(META.cfg.speed||1));}

// ----- campaign helpers -----
const realmOf=s=>G.run.order[s];
const ZS=s=>ZONES[realmOf(s)];
function newRun(cycle){
  const R=seeded(Date.now()&0xffffffff);
  const mids=[1,2,3,4].sort(()=>R()-.5).slice(0,3);
  // v4.8: unseen Scourges and Calamities are likelier to show up: weight 1 + 0.15 per completed journey, capped at 2. Seen ones stay at 1.
  const gp=weightedDraw(GPOOL,4,R),fp=weightedDraw(FPOOL,1,R);
  return {order:[0,...mids,5],bosses:gp,final:fp[0],cycle:cycle||0,seed:Math.floor(R()*1e9)};
}
function bossWeight(k){const b=(META.best||{})[guardianDef(k).n];return b&&b.seen?1:Math.min(2,1+.15*(META.clears||0));}
function weightedDraw(pool,n,R){const p=pool.slice(),out=[];while(out.length<n&&p.length){const w=p.map(bossWeight),tot=w.reduce((a,b)=>a+b,0);let r=R()*tot,i=0;for(;i<p.length-1;i++){if((r-=w[i])<0)break;}out.push(p.splice(i,1)[0]);}return out;}
function bossKeyFor(s){return s<4?G.run.bosses[s]:G.run.final;}

// =================== STATS ===================
function baseAttr(c){
  const t=TPL[c.id],A=(G&&G.daily?CLASS_ATTR_LEGACY:CLASS_ATTR)[t.cls],L=c.lv-1,a={};
  ATTR.forEach(k=>{a[k]=A.b[k]+A.g[k]*L+((c.alloc&&c.alloc[k])||0)*POINT_VAL[k]+(c.vet||0);});
  return a;
}
function calcStats(c){
  const daily=!!(G&&G.daily),t=TPL[c.id],A=(daily?CLASS_ATTR_LEGACY:CLASS_ATTR)[t.cls],L=c.lv-1,tr=natOf(c),NF=natInfo(tr).fx,a=baseAttr(c);
  const gears=EQSL.map(sl=>gearOf(c.eq[sl])).filter(Boolean);
  gears.forEach(g=>{if(g.attr)Object.keys(g.attr).forEach(k=>{if(daily&&k==='fth')return;a[k]=(a[k]||0)+g.attr[k];});});
  if(NF.agi)a.agi*=NF.agi;
  const d=deriveStats(a,L);d.def*=A.defM;d.mp*=A.mpM;
  ['hp','mp','atk','def','mag','res'].forEach(k=>{if(NF[k])d[k]*=NF[k];});
  if(c.id==='vaelith')d.mag*=1+.01*archiveKeys().length;
  if(t.bb){d.hp*=1.12;d.atk*=1.12;d.mag*=1.12;d.def*=1.12;d.res*=1.12;}
  const S={elBoost:{},elRes:{},mastery:t.el.length===1?t.el[0]:null,immune:0,tempo:NF.tempo||1,attr:a};
  gears.forEach(g=>{ST.forEach(q=>{d[q]+=g[q]||0;});if(g.el){S.elBoost[g.el]=.15;S.elRes[g.el]=.15;}if(g.immune)S.immune=1;});
  S.mhp=Math.round(d.hp);S.mmp=Math.round(d.mp);S.atk=d.atk;S.def=d.def;S.mag=d.mag;S.res=d.res;S.spd=d.spd;
  S.crit=.04+a.luk*.003+a.dex*.0015+(NF.crit||0);S.critDmg=1.5+a.dex*.004;
  S.acc=.97+a.dex*.002;S.eva=Math.min(.22,a.agi*.0015+a.luk*.002+(NF.eva||0));
  S.luk=a.luk;S.spi=a.spi;
  S.healM=(NF.heal||1)*(S.mastery==='light'?1+MASTERY.light.heal:1);
  S.healP=(d.mag*.6+a.spi*.9+(a.fth||0)*.5)*S.healM;
  // v0.3.5 weapon perks (WPERK in data.js). Flat numbers are read straight off S by the battle code.
  if(!daily){const wg=gears.find(g=>g.slot==='w'),P=wg&&wg.fam&&WPERK[wg.fam];S.wp=wg&&wg.fam||null;
    if(P){if(P.acc)S.acc+=P.acc;if(P.critDmg)S.critDmg+=P.critDmg;if(P.crit)S.crit+=P.crit;if(P.eva)S.eva=Math.min(.27,S.eva+P.eva);if(P.tempo)S.tempo*=P.tempo;
      ['cleave','heavy','charge','stun','basicStun','pierce','combo','status','bleed','debT','buffT','healUp','spellPow'].forEach(k=>{if(P[k])S[k]=P[k];});}}
  if(!daily)gears.forEach(g=>{if(g.mpEff)S.mpEff=Math.max(S.mpEff||0,g.mpEff);if(g.elDmg)S.elDmg=Math.max(S.elDmg||0,g.elDmg);});
  return S;
}
calcStats=HOOK.def('calcStats',calcStats);// one definition; modules add hooks (hooks.js)
const curseMul=t=>t&&t.st&&t.st.curse?AIL.curseHeal:1;   // v0.4.1 2.2: a Cursed hero receives less healing
function refresh(c){c.S=calcStats(c);c.hp=Math.min(c.hp,c.S.mhp);c.mp=Math.min(c.mp,c.S.mmp);return c;}
function autoAlloc(c){
  const p=CLS[TPL[c.id].cls].pref,w=[.5,.3,.2];
  while(c.pts>0){const r=Math.random();const k=r<w[0]?p[0]:r<w[0]+w[1]?p[1]:p[2];c.alloc[k]=(c.alloc[k]||0)+1;c.pts--;}
}
function respecCost(c){return 40+c.lv*12;}
function bondSkills(c){
  if(!B)return [];const out=[];
  BONDS.forEach(b=>{const other=b.a===c.id?b.b:b.b===c.id?b.a:null;if(!other)return;const lv=bondLv(b.a,b.b);if(lv<2)return;
    const p=B.front.find(x=>x.id===other&&x.hp>0);if(!p)return;
    out.push(Object.assign({cost:1.2,hits:1,mp:18,lv:1},b.tech,{id:'bond:'+bondKey(b.a,b.b),bond:other,role:b.tech.el?'det':undefined,pw:(b.tech.pw||0)*(lv>=3?1.3:1),d:b.tech.d+' (with '+TPL[other].n+')'}));});
  return out;
}
function skillKnown(c,s){return s.lv<=c.lv||!!(c.keep&&c.keep.includes(s.id));}
function known(c){const t=TPL[c.id];return classSkills(t).filter(s=>skillKnown(c,s)).concat(bondSkills(c),c.id==='vaelith'?archiveSkills():[],t.bb?[bondBeastSkill(t)].filter(Boolean):[]);}
// a monster tamed under Beastbond keeps its first monster skill
function bondBeastSkill(t){const m=MON[t.mon]||guardianDef(t.mon);if(!m||!m.sk||!m.sk[0])return null;const x=m.sk[0],buff=x[4]==='buff';
  return {id:'bb_'+t.mon,n:x[0],el:x[1],pw:buff?0:+(x[2]*.9).toFixed(2),t:buff?'self':x[3],k:buff?'status':x[4],fx:x[5]||null,mp:buff?6:Math.round(5+x[2]*4),cost:1,hits:1,lv:1,d:`Its own wild move, kept thanks to Beastbond.`};}
// The Archivist's borrowed moves: the first (signature) skill of every Scourge and Calamity the account has defeated
function archiveKeys(){return GPOOL.concat(FPOOL).filter(k=>((META.best||{})[guardianDef(k).n]||{}).kills>0);}
function archiveSkills(){return archiveKeys().map(k=>{const d=guardianDef(k),x=d.sk[0],buff=x[4]==='buff';
  return {id:'arc_'+k,n:x[0],el:x[1],pw:buff?0:+(x[2]*.85).toFixed(2),t:buff?'self':x[3],k:buff?'status':'mag',fx:x[5]||null,mp:buff?8:Math.round(8+x[2]*5+(x[3]==='all'?4:0)),cost:1.1,hits:1,lv:1,archive:k,
    d:`From the archive: ${d.n}'s signature ${buff?'stance':'move'}, cast from her tome with magic.`};});}
function newChar(id,lv,tier){
  const t=TPL[id],f=CF[t.cls];
  const c={id,name:t.n,el:t.el,side:'p',pace:2,lv:1,xp:0,eq:{w:'w_'+f[0]+'_'+tier,a:'a_'+f[1]+'_'+tier,c:null},hp:1,mp:1,st:{},alloc:{},pts:0,auto:true,lb:0,bt:0};
  c.nat=natRoll(id);c.lv=lv;c.pts=Math.floor(lv/2);if(META.cfg.autoStats!==false)autoAlloc(c);
  c.S=calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;return c;
}
function addXp(c,x){
  const ups=[];c.xp+=x;
  while(c.lv<LV_CAP&&c.xp>=need(c.lv)){
    c.xp-=need(c.lv);const oh=c.S.mhp,om=c.S.mmp;c.lv++;if(c.lv%2===0)c.pts=(c.pts||0)+1;if(c.auto!==false&&META.cfg.autoStats!==false)autoAlloc(c);c.S=calcStats(c);
    c.hp=Math.min(c.S.mhp,c.hp+(c.hp>0?c.S.mhp-oh:0));c.mp=Math.min(c.S.mmp,c.mp+(c.S.mmp-om));
    ups.push({lv:c.lv,learned:classSkills(TPL[c.id]).filter(s=>s.lv===c.lv&&!(c.keep&&c.keep.includes(s.id))).map(s=>s.n)});
  }
  return ups;
}
function partyChars(){return G.party.map(id=>G.roster[id]).filter(Boolean);}
function avgLv(){const p=partyChars();return p.length?Math.round(p.reduce((a,c)=>a+c.lv,0)/p.length):3;}
function gearTier(){return Math.max(0,Math.min(5,G.stage));}

// ----- save / load -----
function packG(){
  const r={};Object.keys(G.roster).forEach(id=>{const c=G.roster[id];r[id]={lv:c.lv,xp:c.xp,eq:c.eq,hp:c.hp,mp:c.mp,alloc:c.alloc,pts:c.pts,auto:c.auto,lb:c.lb||0,lastB:c.lastB,vet:c.vet||0,legacy:c.legacy||0,pace:c.pace||0,ail:c.ail&&Object.keys(c.ail).length?c.ail:undefined,bt:c.bt!=null?c.bt:undefined,keep:c.keep||undefined,nat:c.nat||undefined,nrr:c.nrr||undefined};});
  return Object.assign({},G,{roster:r});
}
// Beta v0.2.0: saves made under the old skill pacing keep every skill the hero had already learned.
function paceMigrate(c){if(c.pace>=2)return;const t=TPL[c.id];if(t){const k=classSkills(t).filter(s=>(s.lv0||s.lv)<=c.lv&&s.lv>c.lv).map(s=>s.id);if(k.length)c.keep=k;}c.pace=2;}
function unpackG(o){
  const g=Object.assign({},o);g.roster={};(o.tamed||[]).forEach(registerTamed);
  Object.keys(o.roster).forEach(id=>{if(!TPL[id])return;const s=o.roster[id];const c=Object.assign({id,name:TPL[id].n,el:TPL[id].el,side:'p',st:{}},s);c.alloc=c.alloc||{};paceMigrate(c);c.S=calcStats(c);c.hp=Math.min(c.hp,c.S.mhp);c.mp=Math.min(c.mp,c.S.mmp);g.roster[id]=c;});
  g.party=g.party.filter(id=>g.roster[id]);g.tamed=g.tamed||[];g.personal=g.personal||{};g.weather=g.weather||{};g.vaults=g.vaults||{};g.gath=g.gath||{};Object.keys(MATS).forEach(k=>{g.mats[k]=g.mats[k]||0;});g.talks=g.talks||[];
  return g;
}
unpackG=HOOK.def('unpackG',unpackG);// one definition; modules add hooks (hooks.js)
const slotKey=s=>SAVEKEY+(s?'-s'+s:'');
function saveGame(){if(!G||G.daily)return false;
  try{G.savedAt=Date.now();localStorage.setItem(slotKey(META.slot||0),JSON.stringify(packG()));return true;}catch(e){return false;}}
function newGame(ids,cycle,legacy){
  G={ver:3,wv:3,dunRev:2,run:newRun(cycle||0),stage:0,cleared:[false,false,false,false,false],gold:400,roster:{},party:[],
     inv:{potion:4,hipotion:0,ether:1,remedy:2,plume:1,elixir:0},mats:{},gath:{},gear:[],won:false,
     pos:null,chests:{},visited:[0],tamed:[],personal:{},weather:{},vaults:{},rare:null,lastTown:0,quests:[],bounties:[],bonds:{},talks:[],kills:{},keys:{},levers:{},seenIntro:{},arena:{},echoes:{},stats:{battles:0,start:Date.now()}};
  Object.keys(MATS).forEach(k=>G.mats[k]=0);
  // v0.4.0 3.9: Legacy heroes take places in the three, so a new journey never starts with more than three heroes.
  const legIds=(legacy||[]).filter(id=>(META.legacy||[]).includes(id)&&TPL[id]).slice(0,2);
  ids.slice(0,Math.max(0,3-legIds.length)).forEach(id=>{G.roster[id]=newChar(id,3,0);G.party.push(id);});
  legIds.forEach(id=>{if(G.roster[id]||!TPL[id])return;const c=newChar(id,5,0);c.legacy=1;c.vet=Math.min(4,META.cycles);c.S=calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;G.roster[id]=c;if(G.party.length<6)G.party.push(id);});
  genQuests(0);
}
newGame=HOOK.def('newGame',newGame);// v0.9.9: one definition; modules add hooks (hooks.js)
// Beta v0.3.0 level scaling. NG+ adds 3 foe levels per cycle (up to +10), so cycles push into the 41-50 range.
// The Calamity rises with an overleveled party: 40, plus 80% of the party's average above 40.
function ngLvOff(){return G&&G.run&&!G.daily?Math.min(10,3*(G.run.cycle||0)):0;}
// battles fought beside the party in this journey; saves from before v0.4.1 estimate it from level
function btOf(c){return c&&c.bt!=null?c.bt:Math.max(0,((c&&c.lv)||3)-3)*5;}
function worldCreep(){return (G&&!G.daily&&G.cleared)?1+CREEP.per*G.cleared.filter(Boolean).length:1;}
function partyHi(){const p=partyChars();return p.length?Math.max(...p.map(c=>c.lv)):3;}
function bossLvFor(s){const base=STAGE_BOSS_LV[s]+ngLvOff();if(!G||!partyChars().length)return base;const hi=partyHi();return Math.min(base+BOSS_LV.cap,Math.max(base,Math.round(base+BOSS_LV.frac*(hi-base))));}
// 3.3: one rule for every echo. base is the echo's own base level.
function echoLvRule(base,hi){return hi<base-ECHO_LV.window?base:hi+ECHO_LV.window;}
function storyEchoLv(s){const base=STAGE_BOSS_LV[s]+ngLvOff()+ECHO_LV.storyAdd;return echoLvRule(base,G&&partyChars().length?partyHi():0);}
// above 40, XP fades for heroes far above the foes they beat (2 levels of grace, -8% per level, never below 25%)
// and hits 3% harder with 3% more HP per party level above 40, so a level 45 team still has a fight on its hands
function overLvMul(){const a=G&&partyChars().length?avgLv():40;return 1+.03*Math.max(0,a-40);}
function xpLvMul(c,flv){if(c.lv<=40)return 1;return clamp(1-.08*(c.lv-flv-2),.25,1);}
function enemyScale(){const d=DIFF[META.cfg.diff]||DIFF.normal,c=1+.12*(G?G.run.cycle:0);return {hp:d.hp*c,pow:d.pow*c,rew:d.rew*(1+.1*(G?G.run.cycle:0))};}

// ----- town services -----
function recruitCost(id){const s=TPL[id].src;if(s[0]==='r')return Math.round((900+300*G.stage)*ECON.rareRecruit);return Math.round((120+120*(+s.slice(1)))*ECON.recruit);}
function rarePool(){return RAW.map(r=>r[0]).filter(id=>{const s=TPL[id].src;return s[0]==='r'&&+s.slice(1)<=G.stage&&!G.roster[id]&&!(typeof challIsPooled==='function'&&challIsPooled(id));});}
function rollRare(ch){if(G.rare&&!G.roster[G.rare])return;G.rare=null;const p=rarePool();if(p.length&&Math.random()<ch)G.rare=p[Math.floor(Math.random()*p.length)];}
function recruit(id,free){
  const cost=free?0:recruitCost(id);if(G.gold<cost)return false;
  G.gold-=cost;const c=newChar(id,Math.max(2,avgLv()-1),gearTier());G.roster[id]=c;
  if(G.party.length<6)G.party.push(id);
  if(G.rare===id)G.rare=null;
  saveGame();return true;
}
recruit=HOOK.def('recruit',recruit);// one definition; modules add hooks (hooks.js)
function innCost(s){const b=ECON.inn.base+ECON.inn.per*G.stage;return s!=null&&G.cleared[s]?Math.round(b/2):b;}
function restAll(s){
  if(G.gold<innCost(s))return false;G.gold-=innCost(s);
  Object.values(G.roster).forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;c.st={};});G.gath={};G.pbuy={};rollRare(s!=null&&G.cleared[s]?.5:.3);saveGame();return true;
}
restAll=HOOK.def('restAll',restAll);// one definition; modules add hooks (hooks.js)
function shopStock(tab){
  const tiers=[Math.min(5,G.stage)];if(G.stage>0)tiers.unshift(G.stage-1);
  if(tab==='weapons'){const cl=new Set(Object.values(G.roster).map(c=>TPL[c.id]&&TPL[c.id].cls).filter(Boolean)),fams=new Set(['blade','staff','bow','dagger']);cl.forEach(k=>(CLS_WPN[k]||[]).forEach(f=>fams.add(f)));return tiers.flatMap(t=>[...fams].filter(f=>GEAR['w_'+f+'_'+t]).map(f=>'w_'+f+'_'+t));}
  if(tab==='armor')return tiers.flatMap(t=>['mail','robe','vest'].map(f=>'a_'+f+'_'+t));
  if(tab==='charms'){const o=['c_vital','c_mana'];if(G.stage>=1){o.push('c_swift','c_clarity');ELK.forEach(k=>o.push('c_'+k));}return o;}
  return [];
}
function itemStock(){return G.stage>=1?['potion','hipotion','ether','remedy','plume']:['potion','ether','remedy','plume'];}
// Beta v0.1.0: Alchemy sells the tonics plus travel gear; the tavern sells sandwiches.
function alchStock(){return itemStock().concat(['holywater','tent']);}
function tavernFood(){return ['porkchop'];}
function equipGear(c,id){const g=gearOf(id);if(!g||!canEquip(c,id))return;const sl=g.slot,old=c.eq[sl];const i=G.gear.indexOf(id);if(i<0)return;G.gear.splice(i,1);if(old)G.gear.push(old);c.eq[sl]=id;refresh(c);saveGame();}
function unequipGear(c,sl){const old=c.eq[sl];if(!old)return;G.gear.push(old);c.eq[sl]=null;refresh(c);saveGame();}
function useItemField(id,c){
  const it=ITEMS[id];if(!G.inv[id])return false;
  if(it.revive){if(c.hp>0)return false;c.hp=Math.round(c.S.mhp*it.revive);}
  else{if(c.hp<=0)return false;let did=false;if(it.heal&&c.hp<c.S.mhp){c.hp=Math.min(c.S.mhp,c.hp+it.heal);did=true;}if(it.mp&&c.mp<c.S.mmp){c.mp=Math.min(c.S.mmp,c.mp+it.mp);did=true;}if(!did)return false;}
  G.inv[id]--;saveGame();return true;
}
// ----- forge -----
function plusOf(id){const m=String(id).match(/\+(\d)$/);return m?+m[1]:0;}
function baseIdOf(id){return String(id).replace(/\+\d$/,'');}
function hasMats(m){return Object.keys(m).every(k=>(G.mats[k]||0)>=m[k]);}
function payMats(m){Object.keys(m).forEach(k=>{G.mats[k]-=m[k];});}
function forge(where,ref){
  // where: 'spare' (index in G.gear) or 'eq' ({cid,slot})
  const id=where==='spare'?G.gear[ref]:G.roster[ref.cid].eq[ref.slot];if(!id)return false;
  const c=forgeCost(id);if(!c||G.gold<c.gold||!hasMats(c.m))return false;
  G.gold-=c.gold;payMats(c.m);
  if(where==='spare')G.gear[ref]=c.next;else{G.roster[ref.cid].eq[ref.slot]=c.next;refresh(G.roster[ref.cid]);}
  saveGame();return c.next;
}
function relicKey(k){if(k==='$rel')return ZS(G.stage).mat;if(k==='$r0')return ZS(1).mat;if(k==='$r1')return ZS(2).mat;if(k==='$r2')return ZS(4).mat;return k;}
function recipeMats(r){const o={};Object.keys(r.m).forEach(k=>{const kk=relicKey(k);o[kk]=(o[kk]||0)+r.m[k];});return o;}
function recipeOpen(r){return r.t<=matTier(G.stage);}
function craft(r){const m=recipeMats(r);if(!recipeOpen(r)||G.gold<r.g||!hasMats(m))return false;if(r.item&&(G.inv[r.item]||0)>=invCap())return false;G.gold-=r.g;payMats(m);if(r.item)G.inv[r.item]=(G.inv[r.item]||0)+1;else G.gear.push(r.id);saveGame();return true;}
function resolveDrop(k,s){const t=matTier(s);if(k==='ore*')return TIERED.ore[t];if(k==='wood*')return TIERED.wood[t];if(k==='herb*')return TIERED.herb[t];return k;}
function smithMatStock(){return matStock().filter(id=>MAT_OF[id].k!=='herb');}
function herbStock(){return matStock().filter(id=>MAT_OF[id].k==='herb');}
function partLeft(id){return Math.max(0,PART_STOCK-((G.pbuy||{})[id]||0));}
function partPrice(id){return Math.round(PART_PRICE[id]*(1+.25*matTier(G.stage)));}
function buyPart(id,n){if(!PART_PRICE[id]||partLeft(id)<n)return false;const c=partPrice(id)*n;if(G.gold<c)return false;G.gold-=c;G.pbuy=G.pbuy||{};G.pbuy[id]=(G.pbuy[id]||0)+n;G.mats[id]=(G.mats[id]||0)+n;saveGame();return true;}
function matStock(){const t=matTier(G.stage);return ['ore','wood','herb'].flatMap(c=>MATCAT.find(x=>x.k===c).ids.filter(id=>id==='bluecap'?true:TIERED[c].indexOf(id)<=t));}
function matSell(id){return MAT_PRICE[id]?Math.max(2,Math.round(MAT_PRICE[id]*.4)):id==='core'?120:MAT_OF[id]&&MAT_OF[id].k==='relic'?20:8;}
function buyMat(id,n){const c=MAT_PRICE[id]*n;if(!matStock().includes(id)||G.gold<c)return false;G.gold-=c;G.mats[id]=(G.mats[id]||0)+n;saveGame();return true;}
function sellMat(id,n){if((G.mats[id]||0)<n)return false;G.mats[id]-=n;G.gold+=matSell(id)*n;saveGame();return true;}

// ----- quests & bounties -----
function genQuests(s){
  if(G.quests.some(q=>q.stage===s))return;
  const Z=ZS(s),R=seeded(G.run.seed+s*17),mon=Z.pool[Math.floor(R()*Z.pool.length)],n=5+s;
  G.quests.push({id:'h'+s,stage:s,type:'hunt',mon,n,have:0,state:'open',title:`Cull the ${MON[mon].n}s`,desc:`${Z.town}'s watch wants ${n} ${MON[mon].n}s put down.`,reward:{gold:120+s*160,item:'hipotion'}});
  const mat=Z.mat,m=3+s;
  G.quests.push({id:'g'+s,stage:s,type:'gather',mat,n:m,state:'open',title:`${MATS[mat]} for the smith`,desc:`The smith needs ${m} ${MATS[mat]} to repair the town lamps.`,reward:{gold:80+s*120,gear:true}});
  G.quests.push({id:'v'+s,stage:s,type:'vault',state:'open',title:'The barred hoard',desc:`Old maps mark a vault behind iron bars in the ${Z.dungeon}. Find the lever and bring back what is inside.`,reward:{gold:150+s*150,item:'ether'}});
  if(s===1||s===2){const pool=RAW.filter(r=>r[6][0]==='t'&&+r[6].slice(1)<=s+1&&!G.roster[r[0]]&&!(typeof challIsPooled==='function'&&challIsPooled(r[0]))).map(r=>r[0]);if(pool.length&&!G.quests.some(q=>q.type==='wanderer'))G.quests.push({id:'w'+s,stage:s,type:'wanderer',hero:pool[Math.floor(R()*pool.length)],state:'open',title:'The lost wayfarer',desc:`Someone went into the ${Z.dungeon} and never came out. Find them.`,reward:{}});}
}
genQuests=HOOK.def('genQuests',genQuests);// v0.9.9: one definition; modules add hooks (hooks.js)
function questReady(q){if(q.state!=='active')return false;if(q.type==='hunt')return q.have>=q.n;if(q.type==='gather')return (G.mats[q.mat]||0)>=q.n;if(q.type==='wanderer')return !!q.found;if(q.type==='vault')return !!(G.vaults&&G.vaults[q.stage]);return false;}
function claimQuest(q){
  if(!questReady(q))return null;const out=[];
  if(q.type==='gather')G.mats[q.mat]-=q.n;
  if(q.reward.gold){G.gold+=econG(q.reward.gold);out.push(q.reward.gold+' gold');}
  if(q.reward.item){G.inv[q.reward.item]=(G.inv[q.reward.item]||0)+2;out.push('2 x '+ITEMS[q.reward.item].n);}
  if(q.reward.gear){const gid=lootBase()+'_'+Math.min(5,q.stage+1)+'+1';G.gear.push(gid);out.push(gearOf(gid).n);}
  q.state='claimed';saveGame();return out;
}
function genBounties(s){
  if(G.bounties.some(b=>b.stage===s))return;
  const Z=ZS(s),R=seeded(G.run.seed+s*31+5);
  for(let i=0;i<2;i++){const mon=Z.pool[Math.floor(R()*Z.pool.length)],mod=ELITE_MODS[Math.floor(R()*ELITE_MODS.length)],title=ELITE_TITLES[Math.floor(R()*ELITE_TITLES.length)];
    G.bounties.push({id:'b'+s+i,stage:s,mon,mod:mod.k,name:`${MON[mon].n} ${title}`,lv:STAGE_LV[s][1]+4,state:'open',reward:{gold:250+s*250,mat:3,charm:pick(['c_str','c_int','c_vit','c_spi','c_agi','c_dex','c_luk'])}});}
}

// =================== STATUS ===================
const has=(u,k)=>!!(u.st&&u.st[k]);
const OPP={might:'weaken',weaken:'might',haste:'slow',slow:'haste',bulwark:'break',break:'bulwark'};
function addSt(t,k,src,silent){
  if(t.hp<=0)return false;
  const def=STS[k];
  if(!def){wdLog('unknown status '+k,t);return false;}
  if(OPP[k]&&t.st[OPP[k]]){delete t.st[OPP[k]];if(!silent)log(`${t.name}'s ${STS[OPP[k]].n} is cancelled.`);fx(t,STS[OPP[k]].n+' off','stat');return true;}
  if(t.id==='sylva'&&(k==='root'||k==='slow')){fx(t,'Immune','stat good');return false;}
  if(k==='stun'&&t.boss){if((t.stunCD||0)>0){fx(t,'Resist','stat');return false;}t.stunCD=3;}
  const o={t:def.t,src:src?(src===t?'self':src.name):null};
  if(src&&src.S){if(def.bad&&src.side!==t.side&&src.S.debT)o.t+=src.S.debT;else if(!def.bad&&src.side===t.side&&src.S.buffT)o.t+=src.S.buffT;}
  if(k==='bleed'){const base=src?Math.max(src.S.atk,src.S.mag*.8):20;o.v=Math.max(2,Math.round(base*.28));}
  if(k==='burn'&&B&&WX().burnPlus)o.t+=1;
  t.st[k]=o;
  if(!silent){log(`${t.name} ${def.bad?'is afflicted with':'gains'} ${def.n}.`);}
  fx(t,def.n,def.bad?'stat bad':'stat good');
  return true;
}
addSt=HOOK.def('addSt',addSt);// one definition; modules add hooks (hooks.js)
function tryFx(t,k,ch,src){
  if(t.hp<=0)return;
  let c=ch;
  if(STS[k].bad){
    if(t.boss&&(k==='stun'||k==='root'))c*=.5;if(t.S.immune)c*=.5;
    if(src&&src.S)c*=clamp(1+((src.S.luk||0)-(t.S.spi||0)*.6)*.01,.6,1.4);
  }
  if(src&&src.S&&STS[k].bad){if(k==='stun'&&src.S.stun)c*=src.S.stun;else if(k==='bleed'&&src.S.bleed)c*=src.S.bleed;else if(src.S.status)c*=src.S.status;}
  if(RNG()<c)addSt(t,k,src);
}

// =================== DAMAGE ===================
function skEls(sk){return !sk.el?[]:Array.isArray(sk.el)?sk.el:[sk.el];}
function guarded(t){return t.boss||t.side==='p';}
function effOf(el,t){let m=matchup(el,t.el);if(guarded(t))m=Math.min(m,CAP_GUARDED);return m;}
function bestMult(sk,t,a){const e=skEls(sk);if(!e.length)return 1;let m=Math.max(...e.map(x=>effOf(x,t)));if(a&&a.id==='astra')m=Math.max(m,1);return m;}
function calcDamage(a,sk,t,bonus){
  const phys=sk.k==='phys',els=skEls(sk);
  let A=phys?a.S.atk:a.S.mag,D=phys?t.S.def:t.S.res;
  if(sk.pierce)D*=.5;if(a.S.pierce&&phys)D*=1-a.S.pierce;
  let d=sk.pw*A*(A/(A+D));
  const em=bestMult(sk,t,a);
  if(a.id==='sylva'&&(has(t,'slow')||has(t,'root')))d*=1.25;
  if(a.id==='ember'&&a.kindle)d*=1+.1*a.kindle;
  let aff=1;if(els.some(e=>a.el.includes(e)))aff=1.2;
  if(a.S.mastery&&els.includes(a.S.mastery))aff*=1+MASTERY_BONUS;
  d*=em*aff*rnd(.92,1.08)*(bonus||1);
  if(a.S.wp){if(phys&&a.S.heavy)d*=1+a.S.heavy;if(sk.t==='all'&&a.S.cleave)d*=1+a.S.cleave;if(!phys&&sk.k==='mag'&&a.S.spellPow)d*=1+a.S.spellPow;if(a.S.charge&&phys&&t.lastAct&&t.lastAct>(a.prevAct||0))d*=1+a.S.charge;}
  els.forEach(e=>{if(a.S.elBoost[e])d*=1+a.S.elBoost[e];if(t.S.elRes[e])d*=1-t.S.elRes[e];});
  if(a.S.elDmg&&els.length&&sk.k==='mag')d*=1+a.S.elDmg;
  const W=WX();if(W.el&&els.length)d*=Math.max(...els.map(e=>W.el[e]||1));
  if(has(a,'might'))d*=1.3;if(has(a,'weaken'))d*=.75;if(has(a,'burn'))d*=.85;
  if(has(t,'bulwark'))d*=.7;if(has(t,'break'))d*=1.3;if(t.guard)d*=.5;if(t.broken)d*=BREAK_WIN.bonus;
  if(sk.afflicted&&Object.keys(t.st).some(k=>STS[k].bad))d*=sk.afflicted;
  if(sk.execute&&t.hp<t.S.mhp*sk.execute)d*=2;
  let crit=false;
  if(has(a,'focus')&&sk.k==='phys'){crit=true;delete a.st.focus;}
  else if(RNG()<(a.S.crit||.05)+(sk.crit||0)+(WX().crit||0))crit=true;
  if(crit)d*=(a.S.critDmg||1.5);
  return {dmg:Math.max(1,Math.round(d)),crit,em};
}
calcDamage=HOOK.def('calcDamage',calcDamage);// v0.9.9: one definition; modules add hooks (hooks.js)

// =================== BESTIARY ===================
function bestOf(name){const b=META.best[name]=META.best[name]||{seen:0,kills:0,scan:0,known:{}};return b;}
function knowEl(e,el){bestOf(e.base).known[el]=1;}

// =================== BATTLE ===================
const xpFor=e=>Math.round((1.55*Math.pow(e.lv,1.55)+5)*(e.boss?4:e.elite?3:1)*((typeof G!=='undefined'&&G&&G.daily)?1:ECON.xp));
const goldFor=e=>econG(Math.round((e.lv*4+ri(3,9))*(e.boss?6:e.elite?4:1)));
// v4.7: armor now does more, so foes hit a little harder at the same gear to keep the curve honest
let FOE_POW=1.12;
// v4.7: reactions are no longer free, so Scourges and Calamities carry a little less HP
let BOSS_HP=.9;
function makeEnemy(m,lv,opt){
  opt=opt||{};const sc=enemyScale(),boss=!!opt.boss;
  const fieldM=(!boss&&!opt.elite&&!(G&&G.daily)&&!opt.noField)?1:0;const fSt=Math.max(0,STAGE_LV.findIndex(r=>lv<=r[1])),fSi=fSt<0?4:fSt;const crp=fieldM?1+(worldCreep()-1)*(CREEP.field!=null?CREEP.field:1):worldCreep();const szM=(boss&&!opt.echo&&!opt.noBuff&&G&&!G.daily&&G.party)?Math.max(0,6-G.party.length):0;const spN=(fieldM&&G&&G.party&&G.party.length<3&&fSi<SMALL_PARTY.stages)?G.party.length-1:-1;const spH=spN>=0?SMALL_PARTY.hp[spN]:1,spP=spN>=0?SMALL_PARTY.pow[spN]:1;const hpM=spH*(1+BOSS_SIZE.hp*szM)*crp*m.hp*sc.hp*(opt.hpM||1)*(fieldM?FIELD_FOE.hp[fSi]:1)*(boss&&!opt.echo&&!opt.noBuff?BOSS_BUFF.hp[Math.min(4,opt.stage||0)]:1),pw=spP*(1+BOSS_SIZE.pow*szM)*crp*sc.pow*(opt.powM||1)*(fieldM?FIELD_FOE.pow[fSi]:1)*(boss&&!opt.echo&&!opt.noBuff?BOSS_BUFF.pow[Math.min(4,opt.stage||0)]:1)*(boss?(opt.final?1.5:[1.06,1.2,1.34,1.4][Math.min(3,opt.stage||0)]):1);
  const S={mhp:Math.round((30+12.5*lv)*hpM*(boss?BOSS_HP*(opt.final?2.6:[1.35,1.6,1.9,2.0][Math.min(3,opt.stage||0)]):1)),atk:(9+2.7*lv)*m.atk*pw*FOE_POW,mag:(9+2.7*lv)*m.mag*pw*FOE_POW,def:(6+1.8*lv)*m.def,res:(6+1.8*lv)*m.res,spd:(8+.8*lv)*m.spd,
    crit:.05,critDmg:1.5,mmp:999,elBoost:{},elRes:{},tempo:1,healM:1,immune:0,acc:.95,eva:clamp(.02+.04*(m.spd-1),0,.08),luk:lv*.6,spi:lv*.5};
  const e={side:'e',name:m.n,base:m.n,art:m.art,el:m.el,lv,S,hp:S.mhp,mp:999,st:{},boss,elite:!!opt.elite,mod:opt.mod||null,key:opt.key||null,
    sk:m.sk.map(s=>({id:'e'+s[0],n:s[0],el:s[1],pw:s[2],t:s[3],k:s[4],fx:s[5]||null,mp:0,cost:1,hits:1})),turns:0,next:0,phaseDone:false,phase:m.phase||null,multi:m.multi||1};
  if(boss){e.maxShield=Math.round((opt.final?7:5)*BOSS_PIPS.mult);e.shield=e.maxShield;e.broken=0;}
  if(opt.elite){e.name=opt.name;e.maxShield=3;e.shield=3;e.broken=0;e.multi=2;e.phase={at:.5,say:`${opt.name} howls and fights harder!`,self:[['might',1],['haste',1]]};}
  if(opt.echo){e.name='Echo '+e.name;e.echo=1;}
  return e;
}
makeEnemy=HOOK.def('makeEnemy',makeEnemy);// one definition; modules add hooks (hooks.js)
function encounterFoes(spec){
  // spec: {stage, kind:'field'|'dungeon'|'boss'|'elite'|'arena'|'echoBoss', ...}
  if(spec.kind==='daily'){const w=spec.waveSpecs[(spec.wave||1)-1];return encounterFoes(Object.assign({},w,{stage:spec.stage}));}
  const s=spec.stage,out=[];
  if(spec.kind==='boss'){
    const key=bossKeyFor(s),def=guardianDef(key),final=s===4;
    const olM=final?overLvMul():1;out.push(makeEnemy(def,bossLvFor(s),{boss:true,final,stage:s,key,hpM:olM,powM:olM}));
    if(s>=2&&!final){const Z=ZS(s);out.push(makeEnemy(MON[pick(Z.pool)],STAGE_LV[s][1]-1+ngLvOff()));}
  }else if(spec.kind==='echoBoss'){
    const def=guardianDef(spec.key);out.push(makeEnemy(def,spec.lv,{boss:true,final:!!FINALS[spec.key],stage:3,key:spec.key,hpM:spec.hpM||1.7,powM:spec.powM||1.15}));
  }else if(spec.kind==='elite'){
    const b=spec.bounty,m=MON[b.mon];
    out.push(makeEnemy(m,b.lv,{elite:true,name:b.name,mod:b.mod,hpM:5.2,powM:1.6}));
    const Z=ZS(b.stage);out.push(makeEnemy(MON[pick(Z.pool)],b.lv-2));if(!b.personal)out.push(makeEnemy(MON[pick(Z.pool)],b.lv-3));
  }else{
    const Z=ZS(s),echo=spec.kind==='field'&&G.cleared[s];
    let band=echo?STAGE_LV[Math.min(4,s+1)]:STAGE_LV[s];
    let lo=band[0]+(spec.kind==='dungeon'?1:0)+(echo?2:0)+ngLvOff(),hi=band[1]+(spec.kind==='dungeon'?1:0)+(echo?2:0)+ngLvOff();
    if(spec.kind==='arena'||spec.kind==='daily'){lo=spec.lvs[0];hi=spec.lvs[1];}
    // night variants and mimics stay out of the arena and the Daily Trial (the Trial must stay identical)
    const pool=spec.kind==='arena'||spec.kind==='daily'?Object.keys(MON).filter(k=>!MON[k].night&&!MON[k].mimic):Z.pool;
    const r=RNG(),n=spec.kind==='arena'||spec.kind==='daily'?3:r<.2?1:r<.65?2:3;
    for(let i=0;i<n;i++){const m=MON[pick(pool)];out.push(makeEnemy(m,ri(lo,hi),{echo}));}
  }
  const cnt={};out.forEach(e=>{cnt[e.name]=(cnt[e.name]||0)+1;});
  const seen={};out.forEach(e=>{if(cnt[e.name]>1){seen[e.name]=(seen[e.name]||0)+1;e.name+=' '+String.fromCharCode(64+seen[e.name]);}});
  return out;
}
encounterFoes=HOOK.def('encounterFoes',encounterFoes);// v0.9.9: one definition; modules add hooks (hooks.js)
function allParty(){return B.front.concat(B.back);}
function WX(){return WEATHER[(B&&B.weather)||'clear']||WEATHER.clear;}
function delayOf(u,cost){let d=cost*1000/(18+u.S.spd)*(u.S.tempo||1);if(B&&WX().spd)d/=WX().spd;if(has(u,'slow'))d*=1.5;if(has(u,'haste'))d*=.65;if(has(u,'root'))d*=1.25;return d;}
function fx(u,txt,cls){const now=Date.now();u.fx=(u.fx||[]).filter(f=>now-f.t<4000);u.fx.push({t:now,txt,cls});if(/dmg/.test(cls))u.hitT=now;if(typeof onFx==='function')onFx(u,txt,cls);}
function banner(txt,col){if(!B)return;B.banner={t:Date.now(),txt,col:col||'#ffe3a0'};}

function startBattle(spec){
  try{haltInput();}catch(_){}
  if(typeof spec==='number')spec={stage:spec,kind:'field'};
  const chars=partyChars();
  if(!chars.some(c=>c.hp>0))return false;
  const bseed=spec.seed!=null?(spec.seed+(spec.wave||0)*7919)>>>0:(Date.now()^Math.floor(Math.random()*1e9))>>>0;RNG=seeded(bseed);
  const alive=chars.filter(c=>c.hp>0),dead=chars.filter(c=>c.hp<=0);
  const order=alive.concat(dead);
  const front=order.slice(0,3),back=order.slice(3,6);
  chars.forEach(c=>{c.st={};c.guard=false;c.fx=[];c.primed=null;c.kindle=0;c.glacier=0;refresh(c);});
  const en=spec.foes||encounterFoes(spec);
  B={seed:bseed,weather:spec.weather||battleWeather(spec),spec,stage:spec.stage,boss:en.some(e=>e.boss),front,back,en,time:0,log:[],mode:'wait',menu:'root',pend:null,over:false,auto:V.auto,gold:0,cur:null,id:Date.now(),wave:spec.wave||1,mats:{},kills:[]};
  en.forEach(e=>{const b=bestOf(e.base);b.seen++;});
  chars.forEach(c=>{c.next=delayOf(c,1)*(.4+.6*RNG());});
  en.forEach(e=>{e.next=delayOf(e,1)*(.45+.6*RNG());});
  front.forEach(c=>{if(c.hp<=0)return;
    if(c.id==='kael'){c.next=0;c.st.haste={t:STS.haste.t};}
    if(c.id==='zephra')front.forEach(f=>{if(f.hp>0)f.st.haste={t:STS.haste.t};});});
  weatherStart(front,en);
  const lead=en.find(e=>e.boss);
  if(lead&&lead.key&&guardianDef(lead.key)){const bc=bossClass(lead.key);banner(`${bc.toUpperCase()}: ${guardianDef(lead.key).n}`,bc==='Calamity'?'#c89aff':'#ff8a5a');}
  log(lead?(guardianDef(lead.key)||{}).intro||`${lead.name} attacks!`:en.some(e=>e.elite)?`${en[0].name} blocks your path!`:spec.kind==='arena'?`Wave ${B.wave}: the crowd roars!`:(en.length>1?'Foes leap from the shadows!':'A foe leaps out!'));
  G.stats.battles=(G.stats.battles||0)+1;
  V.screen='battle';V.modal=null;
  if(typeof onBattleStart==='function')onBattleStart();
  render();later(advance,PAUSE*1.4);
  return true;
}
startBattle=HOOK.def('startBattle',startBattle);// v0.9.9: one definition; modules add hooks (hooks.js)
function liveUnits(){return B.front.filter(c=>c.hp>0).concat(B.en.filter(e=>e.hp>0));}
function turnOrder(n){
  const arr=liveUnits().map(u=>({u,t:u.next})),out=[];
  for(let i=0;i<n&&arr.length;i++){arr.sort((a,b)=>a.t-b.t||(a.u.side==='p'?-1:1));const f=arr[0];out.push(f.u);f.t+=delayOf(f.u,1);}
  return out;
}
function fallen(u){
  u.st={};u.guard=false;u.primed=null;u.deathT=Date.now();if(u.side==='p')B.kos=(B.kos||0)+1;
  log(`${u.name} falls!`);
  if(u.side!=='p'){const b=bestOf(u.base);b.kills++;B.kills.push(u);return;}
  B.front.forEach(c=>{if(c!==u&&c.hp>0)lbAdd(c,12);});
  if(u.id==='isolde'){log('Tidal Grace: a last wave washes over the line.');B.front.forEach(c=>{if(c.hp>0&&c!==u){const n=Math.round(c.S.mhp*.25);c.hp=Math.min(c.S.mhp,c.hp+n);fx(c,'+'+n,'heal');}});}
  const i=B.front.indexOf(u);if(i<0)return;
  const bi=B.back.findIndex(c=>c.hp>0);if(bi<0)return;
  const r=B.back[bi];B.front[i]=r;B.back[bi]=u;r.next=B.time+delayOf(r,.5);r.enterT=Date.now();
  log(`${r.name} steps in for ${u.name}.`);
}
fallen=HOOK.def('fallen',fallen);// one definition; modules add hooks (hooks.js)
function checkEnd(){
  if(B.over)return true;
  if(B.en.every(e=>e.hp<=0)){B.over=true;later(win,PAUSE);return true;}
  if(allParty().every(c=>c.hp<=0)){B.over=true;later(lose,PAUSE);return true;}
  return false;
}
function hurt(t,d){t.hp=Math.max(0,t.hp-d);if(t.hp<=0)fallen(t);else checkPhase(t);}
function checkPhase(e){
  if(e.side!=='e'||!e.phase||e.phaseDone||e.hp<=0)return;
  const P=e.phase;if(e.hp>e.S.mhp*P.at)return;
  e.phaseDone=true;banner(P.say,'#ff9a6a');log(P.say);
  (P.self||[]).forEach(([k])=>addSt(e,k,e,true));
  (P.selfBad||[]).forEach(([k])=>addSt(e,k,e,true));
  if(P.heal){const n=Math.round(e.S.mhp*P.heal);e.hp=Math.min(e.S.mhp,e.hp+n);fx(e,'+'+n,'heal');}
  if(P.party)B.front.forEach(c=>{if(c.hp>0)(P.party).forEach(([k,ch])=>tryFx(c,k,ch,e));});
  if(P.summon&&B.en.filter(x=>x.hp>0).length<3){const m=MON[P.summon];const s=makeEnemy(m,Math.max(1,e.lv-3));s.next=B.time+300;s.enterT=Date.now();B.en.push(s);log(`${s.name} joins the fight!`);}
  if(P.wardEvery)e.wardEvery=P.wardEvery;
}
checkPhase=HOOK.def('checkPhase',checkPhase);// one definition; modules add hooks (hooks.js)
function advance(){
  const bt=B;
  try{advance0();}
  catch(e){wdLog('advance error: '+(e&&e.message||e),bt&&bt.cur);
    if(B&&!B.over&&B.cur&&B.cur.side==='e'&&B.cur.hp>0)wdForce(B.cur,'advance error: '+(e&&e.message||e));
    else if(B&&!B.over&&B.cur){try{endTurn(B.cur,1);}catch(_){}}}
}
function advance0(){
  if(!B||B.over)return;
  B.nerfAct=null;
  if(checkEnd())return;
  let u=null;liveUnits().forEach(x=>{if(!u||x.next<u.next||(x.next===u.next&&x.side==='p'))u=x;});
  if(!u)return;
  B.cur=u;B.time=u.next;u.guard=false;
  if(u.stunCD)u.stunCD--;
  if(u.broken===2){u.broken=BREAK_WIN.short?0:1;if(BREAK_WIN.short)u.shield=u.maxShield;log(`${u.name} is broken and reeling!`);fx(u,'Reeling','stat bad');B.mode='wait';render();later(()=>endTurn(u,1),PAUSE*.6);return;}
  if(u.broken===1)u.recover=1;
  let dot=0;
  const dm=WX().dot||1;
  if(has(u,'poison')){const d=Math.max(1,Math.round(u.S.mhp*(u.boss?.02:.06)*dm));dot+=d;fx(u,String(d),'dmg poison');log(`${u.name} takes ${d} from poison.`);}
  if(has(u,'burn')){const d=Math.max(1,Math.round(u.S.mhp*(u.boss?.02:.05)*dm));dot+=d;fx(u,String(d),'dmg burn');log(`${u.name} takes ${d} from burns.`);}
  if(has(u,'bleed')){const d=u.st.bleed.v||5;dot+=d;fx(u,String(d),'dmg bleed');log(`${u.name} bleeds for ${d}.`);}
  if(dot){hurt(u,dot);if(u.hp<=0){render();if(checkEnd())return;later(advance,PAUSE*.6);return;}}
  if(has(u,'regen')||u.mod==='regen'){const n=Math.min(u.S.mhp-u.hp,Math.round(u.S.mhp*.08));if(n>0){u.hp+=n;fx(u,'+'+n,'heal');log(`${u.name} regenerates ${n} HP.`);}}
  if(u.wardEvery&&u.turns%u.wardEvery===0&&!has(u,'ward'))addSt(u,'ward',u);
  if(u.mod==='warded'&&u.turns%3===0&&!has(u,'ward'))addSt(u,'ward',u);
  if(has(u,'stun')){delete u.st.stun;log(`${u.name} is stunned and cannot act.`);fx(u,'Stunned','stat bad');B.mode='wait';render();later(()=>endTurn(u,1),PAUSE*.6);return;}
  if(u.side==='p'&&weatherEvent())return;
  if(u.side==='p'){B.pturns=(B.pturns||0)+1;
    u.mp=Math.min(u.S.mmp,u.mp+Math.round(u.S.mmp*.03));
    B.mode='cmd';B.menu='root';B.pend=null;render();
    if(B.auto)later(autoTurn,PAUSE*.6);
  }else{B.mode='enemy';render();const bt=B,tn=u.turns;later(()=>enemyTurn(u),PAUSE*.8);
    clearTimeout(B.wd);B.wd=setTimeout(()=>{if(B===bt&&!B.over&&B.cur===u&&B.mode==='enemy'&&u.turns===tn&&u.hp>0)wdForce(u,'stall: enemy never acted');},PAUSE*.8+WD_MS);}
}
function endTurn(u,cost){
  if(!B)return;
  if(u.hp>0){
    u.next=B.time+delayOf(u,cost);
    if(u.mod==='frenzy'&&u.turns%3===0&&!u.frenzied){u.frenzied=1;u.next=B.time+60;}else u.frenzied=0;
    Object.keys(u.st).forEach(k=>{u.st[k].t--;if(u.st[k].t<=0)delete u.st[k];});
    if(u.S&&u.S.mend&&u.hp>0&&u.hp<u.S.mhp){const n=Math.max(1,Math.round(u.S.mhp*u.S.mend));u.hp=Math.min(u.S.mhp,u.hp+n);fx(u,'+'+n,'heal');}
    if(u.primed){u.primed.t--;if(u.primed.t<=0){u.primed=null;if(u.side==='e'&&u.hp>0)fx(u,'Prime fades','stat');}}
    if(u.recover&&B.cur===u){u.recover=0;u.broken=0;u.shield=u.maxShield;fx(u,'Guard restored','stat');}
  }
  B.mode='wait';B.menu='root';B.pend=null;render();
  if(checkEnd())return;
  later(advance,PAUSE);
}
function doSteal(a,t){
  if(a.side!=='p')return;
  if(t.stolen){log('Nothing left to steal.');return;}
  if(RNG()<.6+(a.S.luk||0)*.01){t.stolen=true;
    const r=RNG();
    if(r<.3){const it=pick(['potion','potion','ether','remedy']);G.inv[it]=Math.min(invCap(),(G.inv[it]||0)+1);log(`${a.name} steals a ${ITEMS[it].n}!`);}
    else if(r<.55){const mt=ZS(B.stage).mat;B.mats[mt]=(B.mats[mt]||0)+1;log(`${a.name} steals ${MATS[mt]}!`);}
    else{const g=Math.round(t.lv*5+ri(5,20));B.gold+=g;log(`${a.name} snatches ${g} gold!`);}
  }else log(`${a.name} fumbles the grab.`);
}
// shield damage on Scourges, Calamities and elites; at zero they Break
function chipShield(t,n,why){
  if(!t.maxShield||t.broken||t.hp<=0)return;
  t.shield=Math.max(0,t.shield-n);
  if(t.shield<=0){t.broken=2;t.recover=0;t.breakT=Date.now();log(`${t.name}'s guard shatters! It takes ${Math.round((BREAK_WIN.bonus-1)*100)}% more damage and loses its next turn.`);fx(t,'BREAK','stat bad');}
}
// detonations take two deliberate steps now, so they hit harder than the old free reactions did
// DET_BONUS: in config.js
function doReaction(a,t,el){
  if(!t.primed||!el)return null;
  const R0=reactFor(t.primed.el,el);if(!R0)return null;const rk=reactKey(t.primed.el,el);t.primed=null;B.nDet=(B.nDet||0)+1;
  const R=Object.assign({},R0,{m:R0.m*DET_BONUS*((WX().react||{})[rk]||1)});
  log(`${R.n}! ${a.name}'s ${EL[el]} detonates the ${EL[R.p]} prime on ${t.name}.`);fx(t,R.n,'react');
  t.reactT=Date.now();t.reactN=R.n;t.reactEl=el;t.reactP=R.p;
  return R;
}
doReaction=HOOK.def('doReaction',doReaction);// one definition; modules add hooks (hooks.js)
function applyReactionAfter(R,a,t,dealt){
  (R.fx||[]).forEach(([k,c])=>tryFx(t,k,c,a));
  if(R.strip)Object.keys(t.st).forEach(k=>{if(!STS[k].bad)delete t.st[k];});
  (R.selfFx||[]).forEach(([k])=>addSt(a,k,a,true));
  if(R.allyFx){const side=a.side==='p'?B.front:B.en;side.forEach(c=>{if(c.hp>0)R.allyFx.forEach(([k])=>addSt(c,k,a,true));});}
  if(R.splash){const foes=(t.side==='e'?B.en:B.front).filter(x=>x!==t&&x.hp>0);foes.forEach(o=>{const d=Math.max(1,Math.round(dealt*R.splash));fx(o,String(d),'dmg');o.fxEl=t.fxEl;o.fxT=Date.now();hurt(o,d);});}
  chipShield(t,3,'reaction');
}
function perform(a,sk,tgts){
  if(B){B.actN=(B.actN||0)+1;a.prevAct=a.lastAct||0;a.lastAct=B.actN;}
  const now=Date.now();a.actT=now;a.actKind=sk.k;a.actEl=skEls(sk)[0]||null;a.actName=sk.id==='attack'?null:sk.n;
  log(sk.id==='attack'?`${a.name} attacks!`:`${a.name} uses ${sk.n}!`);
  const dmgKind=sk.k==='phys'||sk.k==='mag';
  if(dmgKind){
    let dealtAny=0;
    const targets=sk.t==='rand'?[]:tgts;
    const hitList=sk.t==='rand'?Array.from({length:sk.hits||1},()=>null):null;
    const doHit=(t,hits)=>{
      if(t.hp<=0)return;
      // Parthian Shot: Kaevan sometimes wheels away and fires back
      if(t.id==='kaevan'&&a.side==='e'&&a.hp>0&&!has(t,'stun')&&!has(t,'root')&&RNG()<.22){
        fx(t,'Parthian Shot','stat good');log(`Parthian Shot! ${t.name} wheels away and fires back.`);
        const r=calcDamage(t,{id:'parthian',k:'phys',pw:.95,el:'lightning'},a);a.fxEl='lightning';a.fxT=Date.now();fx(a,String(r.dmg),'dmg'+(r.crit?' crit':''));hurt(a,r.dmg);if(a.hp<=0)fallen(a);return;}
      const els=skEls(sk);
      t.fxEl=els[0]||(sk.k==='phys'?'hit':'arcane');t.fxT=Date.now();
      // reactions: only a detonator skill sets off a foe's Primed status, and only with the matching element
      let R=null;
      if(sk.role==='det'&&els.length&&t.primed&&a.side==='p'){const el=els.find(e=>reactFor(t.primed.el,e));if(el)R=doReaction(a,t,el);}
      const bonus=R?R.m:1;
      let tot=0,crit=false,em=1,blocked=false,missed=false;
      if(a.S.combo&&sk.k==='phys'&&(hits>1||sk.id==='attack')&&RNG()<a.S.combo){hits++;}
      for(let h=0;h<hits;h++){
        if(t.hp<=0)break;
        if(sk.k==='phys'){let hit=clamp((a.S.acc||.95)-(t.S.eva||0)-(WX().acc||0),.5,.99);if(has(a,'blind'))hit*=.5;if(RNG()>hit){missed=true;continue;}}
        if(has(t,'ward')){delete t.st.ward;blocked=true;continue;}
        const r=calcDamage(a,sk,t,bonus);tot+=r.dmg;crit=crit||r.crit;em=r.em;
        t.hp=Math.max(0,t.hp-r.dmg);
      }
      if(blocked&&!tot){fx(t,'Blocked','stat good');log(`${t.name}'s Ward blocks the hit.`);return;}
      if(missed&&!tot){fx(t,'Miss','stat miss');log(`${a.name} misses!`);return;}
      dealtAny+=tot;
      fx(t,String(tot),'dmg'+(crit?' crit':'')+(em>1?' weak':em<1?' res':''));if(a.side==='p'&&em>1)B.hitWeak=1;
      log(`${t.name} takes ${tot}${em>1?' (super effective!)':em<1?' (resisted)':''}${crit?' Critical!':''}`);
      if(a.side==='p'&&t.side==='e'&&em!==1)els.forEach(el=>{if(effOf(el,t)!==1)knowEl(t,el);});
      if(t.side==='p'){lbAdd(t,Math.min(30,tot/t.S.mhp*70));}
      if((t.mod==='thorns'||(t.S&&t.S.thorns))&&sk.k==='phys'&&a.hp>0&&a.side!==t.side){const d=Math.max(1,Math.round(tot*(t.mod==='thorns'?.15:t.S.thorns)));fx(a,String(d),'dmg');hurt(a,d);}
      if(a.S.mastery==='shadow'&&els.includes('shadow')&&a.hp>0){const n=Math.round(tot*MASTERY.shadow.drain);a.hp=Math.min(a.S.mhp,a.hp+n);if(n>0)fx(a,'+'+n,'heal');}
      if(t.maxShield&&a.side==='p'&&em>1)chipShield(t,1,'weak');
      if(sk.shieldChip&&t.maxShield&&a.side==='p')chipShield(t,sk.shieldChip,'skill');
      if(sk.drain&&a.hp>0&&tot>0){const n=Math.min(a.S.mhp-a.hp,Math.round(tot*sk.drain));if(n>0){a.hp+=n;fx(a,'+'+n,'heal');}}
      if(sk.strip&&t.hp>0){const gone=Object.keys(t.st).filter(k=>!STS[k].bad);gone.forEach(k=>delete t.st[k]);if(gone.length)log(`${t.name} loses ${gone.map(k=>STS[k].n).join(', ')}.`);}
      if(R)applyReactionAfter(R,a,t,tot);
      else if(sk.role==='primer'&&els.length&&t.hp>0&&a.side==='p'&&t.side==='e'&&!t.primed){t.primed={el:els[0],t:2,by:a.name};t.primeT=Date.now();B.nPrime=(B.nPrime||0)+1;fx(t,'Primed: '+EL[els[0]],'stat prime');try{if(typeof sfx==='function')sfx('prime');}catch(e){}log(`${t.name} is Primed with ${EL[els[0]]}.`);}
      if(t.hp<=0){fallen(t);}
      else{
        checkPhase(t);
        if(t.id==='gorm'&&a.side==='e'&&sk.k==='phys'&&a.hp>0&&RNG()<.35)addSt(a,'burn',t);
        if(t.id==='dagna'&&!t.glacier&&t.hp<t.S.mhp*.4){t.glacier=1;log('Glacier Heart: Dagna hardens!');addSt(t,'ward',t,true);addSt(t,'bulwark',t,true);}
        if(a.id==='nyx'){const boon=Object.keys(t.st).find(k=>!STS[k].bad);if(boon){delete t.st[boon];fx(t,STS[boon].n+' stolen','stat bad');log(`Cold Hands: ${t.name} loses ${STS[boon].n}.`);}}
        if(a.id==='ciro'&&crit){addSt(t,'burn',a,true);tryFx(t,'blind',.75,a);}
        if(sk.id==='attack'&&a.S.basicStun)tryFx(t,'stun',a.S.basicStun,a);
      else if(sk.role==='primer'&&els.length&&t.hp>0&&a.side==='p'&&t.side==='e'&&t.primed&&t.primed.el===els[0]){t.primed.t=2;t.primeT=Date.now();fx(t,'Primed again','stat prime');log(`${t.name} is Primed with ${EL[els[0]]} again.`);}
        (sk.fx||[]).forEach(([k,c])=>tryFx(t,k,c,a));
        if(a.S.mastery&&els.includes(a.S.mastery)){const M=MASTERY[a.S.mastery];tryFx(t,M.st,M.ch,a);}
      }
      if(sk.steal)doSteal(a,t);
    };
    if(hitList){hitList.forEach(()=>{const live=(a.side==='p'?B.en:B.front).filter(x=>x.hp>0);if(live.length)doHit(pick(live),1);});}
    else targets.forEach(t=>doHit(t,sk.hits||1));
    (sk.self||[]).forEach(([k])=>addSt(a,k,a));
    if(sk.allyFx){B.front.forEach(c=>{if(c.hp>0)sk.allyFx.forEach(([k])=>addSt(c,k,a,true));});}
    if(a.id==='ember'&&sk.id!=='attack'&&(a.kindle||0)<5){a.kindle=(a.kindle||0)+1;fx(a,'Kindling '+a.kindle,'stat good');}
    if(a.side==='p'&&dealtAny)lbAdd(a,5);
  }else if(sk.k==='heal'){
    for(const t of tgts){
      if(t.hp<=0){if(sk.revive){t.hp=Math.max(1,Math.round(t.S.mhp*sk.revive));t.st={};fx(t,'Revived','heal');log(`${t.name} rises again!`);}continue;}
      const n=Math.round(sk.pw*(a.S.healP||a.S.mag)*rnd(.95,1.05)*(WX().heal||1)*(1+(a.S.healUp||0))*curseMul(t));const g=Math.min(n,t.S.mhp-t.hp);t.hp+=g;fx(t,'+'+g,'heal');t.healT=Date.now();log(`${t.name} recovers ${g} HP.`);
      if(sk.cleanse){const c=cleanse(t);if(c)log(`${t.name} is cured.`);}
      if(a.id==='isolde')addSt(t,'regen',a,true);
      (sk.fx||[]).forEach(([k])=>addSt(t,k,a,true));}
    if(sk.revive)allParty().forEach(t=>{if(t.hp<=0&&!tgts.includes(t)){t.hp=Math.max(1,Math.round(t.S.mhp*sk.revive));t.st={};fx(t,'Revived','heal');log(`${t.name} rises again!`);}});
  }else if(sk.k==='revive'){
    for(const t of tgts){if(t.hp>0)continue;t.hp=Math.max(1,Math.round(t.S.mhp*sk.pw));t.st={};fx(t,'Revived','heal');t.healT=Date.now();log(`${t.name} rises again!`);}
  }else if(sk.k==='status'){
    for(const t of tgts){if(t.hp<=0)continue;t.buffT=Date.now();(sk.fx||[]).forEach(([k,c])=>{if(STS[k].bad)tryFx(t,k,c,a);else addSt(t,k,a);});
      if(sk.heal){const n=Math.round(t.S.mhp*sk.heal);t.hp=Math.min(t.S.mhp,t.hp+n);fx(t,'+'+n,'heal');}}
  }else if(sk.k==='mpself'){
    const n=Math.round(sk.pw*a.S.mag+a.S.mhp*.1);a.hp=Math.min(a.S.mhp,a.hp+n);const m=Math.round(a.S.mmp*.25);a.mp=Math.min(a.S.mmp,a.mp+m);
    fx(a,'+'+n,'heal');a.healT=Date.now();log(`${a.name} recovers ${n} HP and ${m} MP.`);(sk.fx||[]).forEach(([k])=>addSt(a,k,a,true));
  }else if(sk.k==='buff'){
    a.buffT=Date.now();(sk.fx||[]).forEach(([k])=>addSt(a,k,a));
  }
}
perform=HOOK.def('perform',perform);// v0.9.9: one definition; modules add hooks (hooks.js)
function autoNote(a,move){if(!B||!B.auto||a.side!=='p')return;B.autoLast={id:a.id,who:a.name,move,t:Date.now()};fx(a,move,'stat move');}
function exec(sk,tgts){
  const a=B.cur;a.mp-=Math.round((sk.mp||0)*(1-((a.S&&a.S.mpEff)||0)));if(a.side==='p'&&(sk.k==='phys'||sk.k==='mag')){B.usedEls=B.usedEls||{};skEls(sk).forEach(e=>{B.usedEls[e]=1;});}autoNote(a,sk.limit?'Limit: '+sk.n:sk.id==='attack'?'Attack':sk.n);
  if(sk.limit){a.lb=0;banner(sk.n,sk.limit2?'#fff2a0':ELC[a.el[0]]);if(sk.limit2)B.lim2T={t:Date.now(),el:a.el[0]};}
  if(sk.bond){const p=B.front.find(x=>x.id===sk.bond);if(p){p.next+=delayOf(p,.5);p.actT=Date.now();}banner(sk.n,'#ffd04a');}
  perform(a,sk,tgts);if(sk.lbParty&&a.side==='p')B.front.forEach(c=>{if(c.hp>0&&c!==a)lbAdd(c,sk.lbParty);});let cost=sk.cost||1;
  // Twin Weave: Jaeson's damaging spells are chased by a weaker spell of his other element
  if(a.id==='jaeson'&&sk.k==='mag'&&!sk.limit&&a.hp>0){const els=skEls(sk),other=els.includes('ice')&&!els.includes('lightning')?'lightning':'ice';const live=(sk.t==='all'?B.en:tgts).filter(e=>e.hp>0&&e.side==='e');
    if(live.length){log('Twin Weave!');perform(a,{id:'weave',n:'Twin Weave',k:'mag',pw:+(sk.pw*.3).toFixed(2),t:sk.t==='all'?'all':'one',el:other,hits:1},sk.t==='all'?live:[live[0]]);}}
  if(a.id==='vex'&&sk.t==='one'&&(sk.k==='phys'||sk.k==='mag')&&RNG()<.25){cost=.15;log('Double Time: Vex moves again!');fx(a,'Double Time','stat good');}
  endTurn(a,cost);
}
// Beta v0.2.0: Limit Breaks open at level 15, and only once the party has reached the second town.
// LIMIT_LV: in config.js
function town2Reached(){return !!(G&&(G.daily||G.stage>=1||(G.been&&G.been.t1)||(G.cleared&&G.cleared[0])));}
// Beta v0.3.0: level is the only gate. Limit I from 15, Limit II from 30.
// LIMIT2_LV: in config.js
function limitOpen(c){return !!c&&c.lv>=LIMIT_LV;}
function limitTier(c){return !c?0:c.lv>=LIMIT2_LV?2:c.lv>=LIMIT_LV?1:0;}
function lbAdd(c,n){if(!limitOpen(c)){c.lb=0;return;}c.lb=Math.min(100,(c.lb||0)+n);}
function lbReady(c){return limitOpen(c)&&(c.lb||0)>=100;}
function limitSkill(c){
  const cls=TPL[c.id].cls,tier=limitTier(c),L=tier>=2?(LIMIT2[cls]||LIMIT[cls]):LIMIT[cls],o=Object.assign({id:'limit',limit:1,mp:0,cost:1,hits:1,lv:1},L,{el:(L.k==='phys'||L.k==='mag')?c.el[0]:null});
  if(tier>=2)o.limit2=1;else{const k=LIMIT_I;if(o.pw)o.pw=+(o.pw*k).toFixed(2);if(o.heal)o.heal=+(o.heal*k).toFixed(2);if(o.revive)o.revive=+(o.revive*.75).toFixed(2);}
  o.tierN=tier>=2?'Limit II':'Limit I';return o;
}
// ----- turn watchdog (v0.4.1): an enemy turn that throws or stalls is replaced by a basic attack -----
const WD_MS=4000;
function wdLog(msg,u){
  try{const e={t:Date.now(),msg:String(msg),who:u&&u.name||null,foe:u&&u.id||null,kind:B&&B.kind||null,stage:B&&B.stage,turn:B&&B.cur&&B.cur.name||null,mode:B&&B.mode||null};
    (window.__WD=window.__WD||[]).push(e);if(window.__WD.length>20)window.__WD.shift();
    if(typeof FB!=='undefined'&&FB.events)FB.events.push({t:Date.now(),e:'watchdog: '+e.msg+' ['+(e.who||'?')+' / '+(e.kind||'?')+']'});}catch(_){}
}
function wdForce(u,why){
  wdLog(why,u);
  if(!B||B.over)return;
  try{
    const live=B.front.filter(c=>c.hp>0);
    if(live.length&&u.hp>0){u.st&&Object.keys(u.st).forEach(k=>{if(!STS[k])delete u.st[k];});perform(u,ATTACK,[pick(live)]);}
  }catch(e2){wdLog('fallback attack failed: '+e2.message,u);}
  try{if(B&&!B.over&&B.cur===u){endTurn(u,1);}}catch(e3){wdLog('endTurn failed: '+e3.message,u);if(B&&!B.over){u.next=B.time+10;B.mode='run';try{advance();}catch(_){}}}
}
function enemyTurn(u){
  if(!B||B.over||u.hp<=0)return;
  const bt=B;const tk=setTimeout(()=>{if(B===bt&&!B.over&&B.cur===u&&u.__wd===tk){wdForce(u,'stall: no action in '+WD_MS+'ms');}},WD_MS);u.__wd=tk;
  try{enemyTurn0(u);}catch(e){wdForce(u,'error: '+(e&&e.message||e));}
  finally{clearTimeout(tk);u.__wd=null;}
}

// ----- player commands -----
function canSwap(){return B&&B.mode==='cmd'&&!has(B.cur,'root')&&B.back.some(c=>c.hp>0);}
function doSwap(bi){
  const out=B.cur,slot=B.front.indexOf(out),inn=B.back[bi];if(inn)autoNote(out,'Switch to '+inn.name);
  if(slot<0||!inn||inn.hp<=0||has(out,'root'))return false;
  B.front[slot]=inn;B.back[bi]=out;
  out.st={};out.guard=false;out.kindle=0;out.primed=null;
  inn.next=B.time;out.next=B.time+delayOf(out,.5);B.cur=inn;B.menu='root';inn.enterT=Date.now();
  log(`${out.name} falls back. ${inn.name} takes the field!`);
  render();
  if(B.auto)later(autoTurn,PAUSE*.6);
  return true;
}
function scan(t){
  const a=B.cur,b=bestOf(t.base);b.scan=1;ELK.forEach(el=>{if(effOf(el,t)!==1)b.known[el]=1;});
  a.actT=Date.now();a.actKind='scan';
  // Beta v0.2.0: matchups are always on screen, so a scan reads the deeper layer: exact HP and stats, quirks, and a boss's turning point.
  const q=t.q?quirkText(t.q):'';
  log(`Scan: ${t.name}, level ${t.lv}. HP ${t.hp}/${t.S.mhp}. ATK ${Math.round(t.S.atk)}, DEF ${Math.round(t.S.def)}, MAG ${Math.round(t.S.mag)}, RES ${Math.round(t.S.res)}, SPD ${Math.round(t.S.spd)}.`);
  log(q?`Quirk: ${t.name} ${q}.`:t.boss?`${t.name} has no quirks, only its shield.`:`${t.name} has no hidden quirks.`);
  if(t.phase&&!t.phaseDone)log(`It changes at ${Math.round(t.phase.at*100)}% HP.`);
  if(typeof profileDirty==='function')try{profileDirty();}catch(x){}
  fx(t,'Scanned','stat');endTurn(a,.5);
}
scan=HOOK.def('scan',scan);// one definition; modules add hooks (hooks.js)
function useItem(id,t){
  const it=ITEMS[id],a=B.cur;autoNote(a,it.n+(t&&t!==a?' on '+t.name:''));
  if(!G.inv[id])return;
  if(it.revive){if(t.hp>0)return;t.hp=Math.max(1,Math.round(t.S.mhp*it.revive));t.st={};fx(t,'Revived','heal');log(`${a.name} uses ${it.n}. ${t.name} rises!`);}
  else{if(t.hp<=0)return;
    if(it.heal){const n=Math.min(Math.round(it.heal*curseMul(t)),t.S.mhp-t.hp);t.hp+=n;fx(t,'+'+n,'heal');log(`${a.name} uses ${it.n}. ${t.name} recovers ${n} HP.`);}
    if(it.mp){const n=Math.min(it.mp,t.S.mmp-t.mp);t.mp+=n;fx(t,'+'+n+' MP',it.heal?'stat good':'heal');log(`${a.name} uses ${it.n}. ${t.name} recovers ${n} MP.`);}
    if(it.cure){cleanse(t);fx(t,'Cured','heal');log(`${a.name} uses ${it.n}. ${t.name} is cured.`);}
  }
  t.healT=Date.now();G.inv[id]--;a.actT=Date.now();a.actKind='item';endTurn(a,.8);
}
function guard(){const a=B.cur;autoNote(a,'Guard');a.guard=true;a.buffT=Date.now();log(`${a.name} braces behind a guard.`);fx(a,'Guard','stat good');endTurn(a,.6);}
function flee(){
  if(B.boss||B.spec.kind==='elite'||B.spec.kind==='arena'||B.spec.kind==='daily'){log('There is no fleeing from this fight!');B.menu='root';render();return;}
  if(has(B.cur,'root')){log(`${B.cur.name} is rooted and cannot run!`);B.menu='root';render();return;}
  if(RNG()<.65){B.over=true;log('You escape!');render();later(()=>finishBattle('fled'),PAUSE);}
  else{log('Could not get away!');endTurn(B.cur,1);}
}

// ----- auto battle -----
// Beta v0.3.1: auto battle can bring in a reserve hero when it clearly helps. Only the acting hero can step back, at most
// once every 3 party turns, and a hero who just came in stays at least 3 turns.
// AUTO_SWAP_CD: in config.js
// v0.4.0 2.2: every auto battle choice the player can tune. The defaults reproduce the earlier fixed behaviour exactly.
const AUTO_DEF={swap:true,swHealer:true,swDet:true,swHurt:true,swWeak:true,healAt:50,cure:true,reviveSkill:true,potion:true,potionAt:30,reviveItem:true,buff:true,debuff:true,mp:'normal',limit:'always',focus:'smart'};
// v0.4.1 1.11: auto battle settings live in the save (G.auto, optional); a save without them takes this device's last settings the first time they are read
function autoCfg(){if(G&&!G.auto)G.auto=Object.assign({},(META&&META.cfg&&META.cfg.auto)||{});const c=(G&&G.auto)||(META&&META.cfg&&META.cfg.auto)||{};return Object.assign({},AUTO_DEF,c);}
function autoRule(k){const c=autoCfg();return !!c.swap&&!!c[{healer:'swHealer',detonator:'swDet',hurt:'swHurt',weakness:'swWeak'}[k]];}
function autoSwitchPick(a){
  if(!B.auto||has(a,'root')||a.side!=='p')return null;const bench=B.back.filter(c=>c.hp>0&&c.hp>c.S.mhp*.45);if(!bench.length)return null;
  const turns=B.pturns||0;if(turns-(B.autoSwapT==null?-99:B.autoSwapT)<AUTO_SWAP_CD)return null;if(turns-(a.swapInT==null?-99:a.swapInT)<AUTO_SWAP_CD)return null;
  const ratio=c=>c.hp/c.S.mhp,fr=B.front.filter(c=>c.hp>0),foes=B.en.filter(e=>e.hp>0);
  const canHeal=c=>known(c).some(s=>s.k==='heal'&&!s.bond&&c.mp>=(s.mp||0));
  const detFor=(c,e)=>known(c).some(s=>s.role==='det'&&c.mp>=(s.mp||0)&&e.primed&&skEls(s).some(x=>reactFor(e.primed.el,x)));
  const weakHit=(c)=>known(c).some(s=>(s.k==='phys'||s.k==='mag')&&c.mp>=(s.mp||0)&&skEls(s).some(el=>foes.some(e=>effOf(el,e)>1)));
  const bad=c=>Object.keys(c.st).filter(k=>STS[k].bad&&k!=='stun').length;
  // 1. the line is hurting and nobody up front can heal
  const avg=fr.reduce((q,c)=>q+ratio(c),0)/Math.max(1,fr.length);
  if(autoRule('healer')&&(avg<.5||fr.some(c=>ratio(c)<.3))&&!fr.some(canHeal)){const h=bench.filter(canHeal).sort((x,y)=>ratio(y)-ratio(x))[0];if(h)return {inn:h,why:'healer'};}
  // 2. a foe is Primed, nobody up front can set it off, and a reserve hero can
  const pr=foes.filter(e=>e.primed);if(autoRule('detonator')&&pr.length&&!fr.some(c=>pr.some(e=>detFor(c,e)))&&!canHeal(a)){const d=bench.find(c=>pr.some(e=>detFor(c,e)));if(d)return {inn:d,why:'detonator'};}
  // 3. this hero is beaten up or covered in ailments
  if(autoRule('hurt')&&(ratio(a)<.25||bad(a)>=2)&&!canHeal(a)){const h=bench.sort((x,y)=>ratio(y)-ratio(x))[0];if(h&&ratio(h)>.6)return {inn:h,why:ratio(a)<.25?'hurt':'debuffed'};}
  // 4. foes are weak to something only the reserve can hit with
  if(autoRule('weakness')&&!weakHit(a)&&!canHeal(a)&&!fr.filter(c=>c!==a).some(weakHit)){const w=bench.find(weakHit);if(w&&RNG()<.7)return {inn:w,why:'weakness'};}
  return null;
}
function autoSwap(o){const a=B.cur,why={healer:'brings in a healer',detonator:'brings in a detonator',hurt:'falls back hurt',debuffed:'shakes off ailments',weakness:'swaps to hit a weakness'}[o.why]||'switches';
  B.autoSwapT=B.pturns||0;o.inn.swapInT=B.pturns||0;B.autoSwaps=(B.autoSwaps||0)+1;
  const r=doSwap(B.back.indexOf(o.inn));if(r){autoNote(a,`Switch: ${o.inn.name} in`);log(`Auto: ${a.name} ${why}.`);}return r;}
// v0.4.1 2.5: auto fights at AUTO_NERF.power of normal strength (damage it deals), never in the Daily Trial
HOOK.after('calcDamage','engine','pack frenzy, auto nerf on the acting hero',function(r,a){try{if(r&&r.dmg&&B&&a&&a.side==='e'&&!a.boss&&!a.elite&&!(G&&G.daily)&&(B.stage||0)>=(PACK.fromStage||0)){const n=B.en.filter(e=>e.hp>0&&!e.boss&&!e.elite).length-1;if(n>0)r.dmg=Math.max(1,Math.round(r.dmg*(1+Math.min(PACK.maxFrenzy,PACK.frenzy*n))));}if(r&&r.dmg&&B&&B.nerfAct&&B.nerfAct===a&&!(G&&G.daily)&&AUTO_NERF.power<1)r.dmg=Math.max(1,Math.round(r.dmg*AUTO_NERF.power));}catch(e){}});
// v0.4.1 2.5: auto is a simple fighter now. It heals below AUTO_NERF.healAt percent, otherwise attacks the first foe in line, sometimes with a
// plain damage skill. It never swaps, never uses items or Limit Breaks, never primes or detonates, and ignores weaknesses and buffs.
// The old careful brain stays as autoTurnSmart: it is the "competent manual play" yardstick in the balance sims.
let SIM_SMART=false;// test hook: sims use the full brain as the "competent manual" proxy
function autoTurn(){
  if(!B||B.over||B.mode!=='cmd'||!B.auto)return;
  if(SIM_SMART)return autoTurnSmart();
  if(G&&G.daily&&AUTO_NERF.dailySmart)return autoTurnSmart();
  const a=B.cur,foes=B.en.filter(e=>e.hp>0),fr=B.front.filter(c=>c.hp>0);if(!foes.length)return;
  B.nerfAct=a;
  // v0.4.1 2.5 retune: on AUTO_NERF.smart of its turns auto thinks like a careful player; the rest are simple swings
  if(AUTO_NERF.smart&&RNG()<AUTO_NERF.smart)return autoTurnSmart();
  const AC=autoCfg(),ratio=c=>c.hp/c.S.mhp;
  if(AUTO_NERF.limit&&lbReady(a)&&AC.limit!=='never'&&RNG()<AUTO_NERF.limit){const L=limitSkill(a);return chooseTargets(L,fr,foes,a);}
  if(AUTO_NERF.det){const opts=[];known(a).filter(s=>s.role==='det'&&a.mp>=(s.mp||0)).forEach(s=>foes.forEach(e=>{if(e.primed&&skEls(s).some(x=>reactFor(e.primed.el,x)))opts.push([s,e]);}));if(opts.length&&RNG()<AUTO_NERF.det){const [s,e]=opts[0];return exec(s,s.t==='all'?foes:[e]);}}
  const ks=known(a).filter(s=>a.mp>=(s.mp||0)&&(AC.mp!=='save'||!(s.mp>0)||s.k==='heal'||a.mp-s.mp>=a.S.mmp*.25));
  const hurt=fr.filter(c=>ratio(c)<AUTO_NERF.healAt/100).sort((x,y)=>ratio(x)-ratio(y));
  const heals=ks.filter(s=>s.k==='heal'&&!s.bond&&!s.cleanse);
  if(hurt.length&&heals.length){
    const all=heals.find(s=>s.t==='allyAll'),one=heals.filter(s=>s.t==='ally').sort((x,y)=>y.pw-x.pw);
    if(all&&(hurt.length>=2||!one.length))return exec(all,fr);
    if(one.length)return exec(one[0],[hurt[0]]);
  }
  const dmg=ks.filter(s=>(s.k==='phys'||s.k==='mag')&&!s.role&&!s.steal&&!s.limit&&!s.limit2&&s.t!=='self');
  // v0.4.1 2.5 (retuned, ban list lifted): with AUTO_NERF.aware odds auto reads the type chart and finishes weak foes; otherwise it swings at the first foe
  const eff=(s,e)=>{try{return effOf(s.el||(skEls(s)||[])[0]||a.el[0],e);}catch(_){return 1;}};
  const aware=RNG()<AUTO_NERF.aware;
  const best=s=>foes.slice().sort((x,y)=>(eff(s,y)-eff(s,x))||(x.hp/x.S.mhp-y.hp/y.S.mhp))[0];
  const tgt=s=>aware?best(s):RNG()<AUTO_NERF.spread?pick(foes):foes[0];
  if(AUTO_NERF.potion&&ratio(a)<.3&&G.inv&&G.inv.potion>0&&!heals.length&&RNG()<AUTO_NERF.potion)return useItem('potion',a);
  if(dmg.length&&RNG()<AUTO_NERF.skillChance){let s;
    if(aware){const sc=x=>(x.pw||1)*(x.t==='all'||x.t==='rand'?Math.min(foes.length,3)*.7:Math.max(...foes.map(e=>eff(x,e))));s=dmg.slice().sort((x,y)=>sc(y)-sc(x))[0];}else s=pick(dmg);
    return s.t==='all'||s.t==='rand'?exec(s,foes):exec(s,[tgt(s)]);}
  return exec(ATTACK,[tgt(ATTACK)]);
}
function autoTurnSmart(){
  if(!B||B.over||B.mode!=='cmd'||!B.auto)return;
  const AC=autoCfg();
  const a=B.cur,foes=B.en.filter(e=>e.hp>0),fr=B.front.filter(c=>c.hp>0);
  // 'save' mode keeps a quarter of the MP bar back for heals and reactions, and otherwise leans on free attacks
  const ks=known(a).filter(s=>a.mp>=(s.mp||0)&&(AC.mp!=='save'||!(s.mp>0)||s.k==='heal'||s.k==='revive'||s.role==='det'||a.mp-s.mp>=a.S.mmp*.25));
  const ratio=c=>c.hp/c.S.mhp;
  const ail=c=>Object.keys(c.st).filter(k=>STS[k].bad&&k!=='stun').length;
  if(lbReady(a)&&AC.limit!=='never'&&(AC.limit!=='boss'||B.boss)){const L=limitSkill(a);return chooseTargets(L,fr,foes,a);}
  const bench=B.back.filter(c=>c.hp>0).sort((x,y)=>ratio(y)-ratio(x));
  const heals=ks.filter(s=>s.k==='heal'&&!s.bond);
  {const sw=autoSwitchPick(a);if(sw)return autoSwap(sw);}
  const hurtL=fr.filter(c=>ratio(c)<AC.healAt/100).sort((x,y)=>ratio(x)-ratio(y));
  if(hurtL.length&&heals.length){
    const all=heals.find(s=>s.t==='allyAll'),one=heals.filter(s=>s.t==='ally'&&!s.cleanse).sort((x,y)=>y.pw-x.pw);
    if(all&&(hurtL.length>=2||!one.length))return exec(all,fr);
    if(one.length){const s=ratio(hurtL[0])<.3?one[0]:one[one.length-1];return exec(s,[hurtL[0]]);}
  }
  const sick=fr.filter(c=>ail(c)>=1).sort((x,y)=>ail(y)-ail(x));
  const pur=ks.find(s=>s.cleanse&&s.t==='ally');
  if(AC.cure&&sick.length&&pur&&(ail(sick[0])>=2||RNG()<.4))return exec(pur,[sick[0]]);
  const dead=allParty().filter(c=>c.hp<=0),rev=ks.find(s=>s.k==='revive');
  if(AC.reviveSkill&&dead.length&&rev&&RNG()<.85)return exec(rev,[dead[0]]);
  if(AC.potion&&ratio(a)<AC.potionAt/100&&G.inv.potion>0&&!heals.length)return useItem('potion',a);
  if(AC.reviveItem&&dead.length&&G.inv.plume>0&&!(AC.reviveSkill&&rev)&&RNG()<.5)return useItem('plume',dead[0]);
  // auto-battle: set off a primed foe when this hero holds the matching detonator
  {const opts=[];ks.filter(s=>s.role==='det').forEach(s=>foes.forEach(e=>{if(e.primed&&skEls(s).some(x=>reactFor(e.primed.el,x)))opts.push([s,e]);}));
   if(opts.length){opts.sort((x,y)=>y[1].hp-x[1].hp);const [s,e]=opts[0];return exec(s,s.t==='all'?foes:[e]);}}
  const tough=B.boss||foes.length>1;
  for(const s of ks.filter(s=>AC.buff&&s.k==='status'&&s.fx&&!STS[s.fx[0][0]].bad)){
    const tg=s.t==='self'?[a]:s.t==='ally'?[fr.slice().sort((x,y)=>(y.S.atk+y.S.mag)-(x.S.atk+x.S.mag)).find(c=>!has(c,s.fx[0][0]))].filter(Boolean):fr;
    if(!tg.length)continue;
    if(tg.some(c=>!has(c,s.fx[0][0]))&&tough&&RNG()<.3)return exec(s,tg);
  }
  for(const s of ks.filter(s=>AC.debuff&&s.k==='status'&&s.fx&&STS[s.fx[0][0]].bad)){
    const tg=s.t==='all'?foes:[foes.slice().sort((x,y)=>y.hp-x.hp)[0]];
    if(tg.some(e=>!has(e,s.fx[0][0]))&&tough&&RNG()<.28)return exec(s,tg);
  }
  let best=null,bs=1.15,bt=null;
  const reactBonus=(s,e)=>{const els=skEls(s);if(!els.length)return 1;if(s.role==='det'&&e.primed){const el=els.find(x=>reactFor(e.primed.el,x));return el?REACT[reactKey(e.primed.el,el)].m*(e.maxShield?1.15:1):1;}if(s.role==='primer'&&!e.primed&&B.front.some(c=>c!==B.cur&&c.hp>0&&known(c).some(k=>k.role==='det'&&skEls(k).some(x=>reactFor(els[0],x)))))return 1.12;return 1;};
  for(const s of ks){
    if(!(s.k==='phys'||s.k==='mag'))continue;
    if(s.steal&&(RNG()>.2||foes.every(e=>e.stolen)))continue;
    const els=skEls(s);let stab=els.some(e=>a.el.includes(e))?1.2:1;if(a.S.mastery&&els.includes(a.S.mastery))stab*=1.2;
    const fxv=(s.fx||[]).reduce((q,[k,c])=>q+c*.25,0);
    if(s.t==='all'){
      let sum=0;foes.forEach(e=>{sum+=s.pw*bestMult(s,e,a)*reactBonus(s,e);});
      const sc=(sum*stab*.95+fxv*foes.length)/(s.cost||1)-(s.mp||0)*.1;if(sc>bs){bs=sc;best=s;bt=foes;}
    }else{
      const t=foes.slice().sort(AC.focus==='low'?(x,y)=>x.hp-y.hp:AC.focus==='high'?(x,y)=>y.hp-x.hp:(x,y)=>bestMult(s,y,a)*reactBonus(s,y)-bestMult(s,x,a)*reactBonus(s,x)||x.hp-y.hp)[0];
      const sc=(s.pw*(s.hits||1)*bestMult(s,t,a)*reactBonus(s,t)*stab+fxv)/(s.cost||1)-(s.mp||0)*.1;if(sc>bs){bs=sc;best=s;bt=[t];}
    }
  }
  if(best)return exec(best,bt);
  return exec(ATTACK,[foes.slice().sort((x,y)=>x.hp-y.hp)[0]]);
}
function chooseTargets(sk,fr,foes,a){
  if(sk.t==='all'||sk.t==='rand')return exec(sk,foes);
  if(sk.t==='allyAll')return exec(sk,fr);
  if(sk.t==='self')return exec(sk,[a]);
  return exec(sk,[foes.slice().sort((x,y)=>x.hp-y.hp)[0]]);
}

// ----- end of battle -----
function finishBattle(how){
  if(!B)return;
  allParty().forEach(c=>{c.st={};c.guard=false;c.primed=null;});
  G.party=B.front.concat(B.back).map(c=>c.id);
  const spec=B.spec;
  B=null;saveGame();saveMeta();
  try{haltInput();}catch(_){}
  V.screen='world';
  if(typeof onBattleEnd==='function')onBattleEnd(how,spec);
  render();
}
finishBattle=HOOK.def('finishBattle',finishBattle);// v0.9.9: one definition; modules add hooks (hooks.js)
function nextWave(){
  B.wave++;const spec=Object.assign({},B.spec,{wave:B.wave});
  const foes=encounterFoes(spec);B.en=foes;if(B.spec.kind==='daily')B.spec.wave=B.wave;foes.forEach(e=>{e.next=B.time+delayOf(e,1)*(.4+.5*RNG());e.enterT=Date.now();bestOf(e.base).seen++;});
  B.over=false;banner(`Wave ${B.wave}`,'#ffd04a');log(`Wave ${B.wave} of ${B.spec.waves}!`);render();later(advance,PAUSE*1.4);
}
function win(){
  if(!B)return;
  if((B.spec.kind==='arena'||B.spec.kind==='daily')&&B.wave<B.spec.waves){nextWave();return;}
  if(B.spec.kind==='daily'){dailyWin();return;}
  const s=B.stage,sc=enemyScale(),info={xp:0,gold:B.gold,drops:[],mats:Object.assign({},B.mats),ups:[],gift:null,story:null,gear:null,bonds:[],quests:[]};
  let txp=0;const luck=1+partyChars().reduce((q,c)=>q+(c.S.luk||0),0)/partyChars().length*.006;
  B.en.forEach(e=>{txp+=xpFor(e);info.gold+=goldFor(e);
    const mt=e.boss||e.elite?'core':(ZS(s).mat);
    if(e.boss||e.elite)info.mats.core=(info.mats.core||0)+(e.boss?2:1);
    if(RNG()<DROP.realm*luck*(e.echo?2:1))info.mats[ZS(s).mat]=(info.mats[ZS(s).mat]||0)+1;
    const dl=MON_DROPS[e.art];if(dl&&RNG()<DROP.part*luck*perkDropMul(e)){const k=resolveDrop(dl[Math.floor(RNG()*dl.length)],s);info.mats[k]=(info.mats[k]||0)+1;}
    if(e.boss||e.elite){['ore*','wood*','herb*'].forEach(k=>{const kk=resolveDrop(k,s);info.mats[kk]=(info.mats[kk]||0)+(e.boss?2:1);});}
    {const Wx=WEATHER[B.weather]||{};if(Wx.mat&&!e.boss&&RNG()<Wx.mat)info.mats[ZS(s).mat]=(info.mats[ZS(s).mat]||0)+1;if(Wx.core&&!e.boss&&RNG()<Wx.core)info.mats.core=(info.mats.core||0)+1;}
    if(RNG()<DROP.potion*luck)info.drops.push('potion');
    if(RNG()<DROP.ether*luck)info.drops.push('ether');
    {const rs=DROP_MIX,rt=rs.remedy+rs.bandage+rs.ash+rs.tent,rr=RNG()/(DROP.remedy*luck*rt/rs.remedy);if(rr<1){let q=rr*rt,k='remedy';for(const n of ['remedy','bandage','ash','tent']){if((q-=rs[n])<0){k=n;break;}}info.drops.push(k);}}// v0.12: same single roll as before (remedy keeps its rate); the roll's own position picks remedy, bandage, ash or tent (no extra RNG call)
    if(G.stage>=1&&RNG()<DROP.hipotion*luck)info.drops.push('hipotion');
    // quest progress
    G.quests.forEach(q=>{if(q.state==='active'&&q.type==='hunt'&&MON[q.mon]&&MON[q.mon].n===e.base){q.have=Math.min(q.n,(q.have||0)+1);if(q.have===q.n)info.quests.push(q.title);}});
  });
  const am=typeof autoRewardMul==='function'?autoRewardMul():1;if(am<1)info.autoCut=am;
  txp=Math.round(txp*sc.rew*am);info.gold=Math.round(info.gold*sc.rew*am);info.xp=txp;
  {const Wx=WEATHER[B.weather]||{},Fm=typeof facMul==='function'?facMul():{xp:1,gold:1};const xm=(Wx.xp||1)*Fm.xp,gm=(Wx.gold||1)*Fm.gold;if(xm!==1||gm!==1){txp=Math.round(txp*xm);info.xp=txp;info.gold=Math.round(info.gold*gm);}}
  const party=allParty(),maxLv=Math.max(...party.map(c=>c.lv));
  party.forEach(c=>{
    if(!G.daily&&B.front.includes(c))c.bt=btOf(c)+1;
    if(!G.daily&&(B.front.includes(c)||B.back.includes(c)))c.lastB=(G.stats&&G.stats.battles)||0;// v0.11.8: when this hero last fought (Fresh mix favours those who have not, party3.js)
    let share=(B.front.includes(c)&&c.hp>0)?1:(typeof XP_REAR==='number'?XP_REAR:.6);// v0.7.2: XP_REAR (config.js)if(c.lv<maxLv-3)share*=1.4;if(c.hp<=0)share=0;// v0.4.3: the fallen earn no XP
    const flv=B.en.reduce((q,e)=>q+e.lv,0)/Math.max(1,B.en.length);
    const ups=share>0?addXp(c,Math.round(txp*share*xpLvMul(c,flv))):[];
    if(ups.length)info.ups.push({name:c.name,lv:c.lv,learned:ups.flatMap(u=>u.learned),pts:c.pts});
    if(c.hp>0)c.hp=Math.min(c.S.mhp,c.hp+Math.round(c.S.mhp*([.25,.2,.15,.12,.12][s]||.1)));// v0.4.3: more recovery after a win in the first two realms   // v0.4.1 2.1: a KO'd hero stays KO'd after the fight (items, field skills, tents and the inn bring heroes back)
    c.mp=Math.min(c.S.mmp,c.mp+Math.round(c.S.mmp*.12));
  });
  // bonds grow between partners who finish a fight side by side
  const fr=partyChars().filter(c=>!c.isComp);/* v0.17.1: bonds grow for every pair in the party, rearguard included, not only the vanguard still standing */
  for(let i=0;i<fr.length;i++)for(let j=i+1;j<fr.length;j++){const k=bondKey(fr[i].id,fr[j].id);if(!BONDMAP[k])continue;const before=bondLv(fr[i].id,fr[j].id);G.bonds[k]=(G.bonds[k]||0)+1;const after=bondLv(fr[i].id,fr[j].id);
    if(after>before){info.bonds.push({a:fr[i].name,b:fr[j].name,lv:after});if(after===1||after===3)G.talks.push({k,lv:after});}}
  G.gold+=info.gold;info.drops.forEach(d=>{G.inv[d]=Math.min(invCap(),(G.inv[d]||0)+1);});
  Object.keys(info.mats).forEach(k=>{G.mats[k]=(G.mats[k]||0)+info.mats[k];});
  const spec=B.spec;
  if(spec.kind==='elite'&&spec.bounty.personal){personalDone(spec.bounty,info);}
  else if(spec.kind==='elite'){spec.bounty.state='done';if(G.tamed.length<8)info.tame={mon:spec.bounty.mon,name:spec.bounty.name};G.gold+=econG(spec.bounty.reward.gold);G.gear.push(spec.bounty.reward.charm);G.mats[ZS(s).mat]=(G.mats[ZS(s).mat]||0)+spec.bounty.reward.mat;info.gold+=econG(spec.bounty.reward.gold);info.gear=spec.bounty.reward.charm;info.bounty=spec.bounty.name;rollRare(.5);}
  if(spec.kind==='arena'){const A=ARENA[spec.tier];G.gold+=econG(A.reward.gold);info.gold+=econG(A.reward.gold);const mt=ZS(Math.min(G.stage,4)).mat;G.mats[mt]=(G.mats[mt]||0)+A.reward.mat;if(A.reward.charm){const ch=pick(['c_str','c_int','c_vit','c_spi','c_agi','c_dex','c_luk']);G.gear.push(ch);info.gear=ch;}if(A.reward.core)G.mats.core+=A.reward.core;G.arena[spec.tier]=(G.arena[spec.tier]||0)+1;info.arena=A.n;}
  // Beastbond: with Nikaris along, beaten monsters sometimes ask to join; Scourges sometimes leave a lesser whelp
  if(allParty().some(c=>c.id==='nikaris')&&G.tamed.length<8){
    if(spec.kind==='elite'&&info.tame)info.tame.bb=1;
    else if((spec.kind==='field'||spec.kind==='dungeon')&&RNG()<.1){const pool=B.en.filter(e=>MON[e.art]&&!e.elite);if(pool.length){const e=pick(pool);info.tame={mon:e.art,name:'Wild '+MON[e.art].n,bb:1};}}
    else if(spec.kind==='boss'&&!B.en.find(e=>e.boss&&FINALS[e.key])&&RNG()<.15){const bk=bossKeyFor(s);info.tame={mon:bk,name:'Lesser '+guardianDef(bk).n,bb:1,scourge:1};}}
  if(spec.kind==='legend'&&typeof legendWin==='function')legendWin(spec,info);
  if(typeof challengeWin==='function')challengeWin(spec,info);
  if(spec.kind==='echoBoss'&&!(spec.rift&&G.echoes[spec.key])){G.echoes[spec.key]=1;const gid=lootBase()+'_5+3';G.gear.push(gid);info.gear=gid;}
  if(spec.kind==='boss'){
    const tier=Math.min(5,s+1),fam=lootBase();
    const gid=fam+'_'+tier;G.gear.push(gid);info.gear=gid;
    if(!G.cleared[s]){
      G.cleared[s]=true;info.story={title:ZS(s).dungeon+' cleared',text:ZS(s).win};
      if(s<4){G.stage=Math.max(G.stage,s+1);genQuests(G.stage);}else{G.won=true;META.clears=(META.clears||0)+1;}
      const gid2=GIFTS[s];if(gid2&&!G.roster[gid2]){recruit(gid2,true);info.gift=gid2;info.story.text+=' '+GIFT_LINE[s];}
      if(s>=1)rollRare(.6);
    }
  }
  G.party=B.front.concat(B.back).map(c=>c.id);
  saveMeta();
  B.result=info;V.modal={type:'result',info};
  B.over=true;saveGame();render();
}
win=HOOK.def('win',win);// v0.9.9: one definition; modules add hooks (hooks.js)
function lose(){
  if(!B)return;
  if(B.spec.kind==='daily'){dailyLose();return;}
  G.gold=Math.floor(G.gold*.9);
  allParty().forEach(c=>{c.hp=Math.max(1,Math.round(c.S.mhp*.3));c.st={};c.guard=false;});
  G.party=B.front.concat(B.back).map(c=>c.id);
  B.wipe=1;saveGame();// v0.10.0: the heroes are revived in the state at once (no softlock); the battle view keeps them down until "Carry on" (B.wipe)
  V.modal={type:'lose'};render();
}
function bondLv(a,b){const p=G.bonds[bondKey(a,b)]||0;return p>=BOND_LV[2]?3:p>=BOND_LV[1]?2:p>=BOND_LV[0]?1:0;}
// campaign end: one hero becomes a permanent Legacy
function chooseLegacy(id){if(!META.legacy.includes(id))META.legacy.push(id);META.cycles=(META.cycles||0)+1;saveMeta();}
// ----- multiplayer groundwork -----
// A Hero Seal is a portable, versioned snapshot of one hero. A future co-op lobby takes two seals per player
// (3 players x 2 heroes), rebuilds them and runs the battle on a shared seed (the unused sealToChar reader was removed in the cleanup pass).
function playerUid(){if(!META.uid){META.uid=Math.random().toString(36).slice(2,10);saveMeta();}return META.uid;}
function heroSeal(c){const o={v:1,id:c.id,lv:c.lv,alloc:c.alloc,eq:c.eq,vet:c.vet||0,owner:playerUid()};return 'AWS1.'+btoa(JSON.stringify(o));}
