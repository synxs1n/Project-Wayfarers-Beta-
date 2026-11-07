// ===== chance.js (v0.4.0): chance meetings with wandering wayfarers =====
// Rare optional meetings with a wayfarer from THIS journey's subset (G.sub) who you do not own yet.
//   help      : they need a potion, or they are being ambushed (a real fight, you win and they join)
//   duel      : they challenge the party to a moderate fight (win and they are impressed enough to join)
//   merchant  : a wandering trader with a short story. Hire at a discount, buy a pack (and earn a 20% hiring discount later), or just listen.
// Rules: about 1 in 170 steps after a 30 step quiet gap (average near 200), never twice in a row, 2 per area at most, fields and caves only
// (never dungeon rooms or boss rooms, never the Daily Trial, never while Holy Water is active). Never Legendaries or challenge-only heroes.
// They are free recruits (they do not use the tavern's hiring cap). Nobody is locked out: the same heroes still turn up in taverns and the Guild Hall.
const CE_THEME_EL={meadow:['earth','wind','light'],coast:['water','wind'],cave:['fire','earth','shadow'],snow:['ice','light','water'],heights:['wind','lightning','earth'],void:['shadow','light']};
const CE_TYPES={help:'Wayfarer in need',duel:'Challenge',merchant:'Wandering trader'};
function ceInit(){if(!G)return null;const c=G.ce=G.ce||{};c.st=c.st||0;c.last=c.last||'';c.cnt=c.cnt||{};c.met=c.met||{};c.fr=c.fr||{};c.helped=c.helped||0;c.boost=c.boost||{};c.duels=c.duels||0;c.deals=c.deals||0;return c;}
function cePool(){const sub=(typeof ensureSub==='function'?ensureSub(G):G.sub)||[];
  return sub.filter(id=>{const t=TPL[id];if(!t||t.mon||G.roster[id])return false;const s=t.src||'';if(s==='L'||s==='x'||id==='vaelith'||id==='nikaris')return false;
    if((s[0]==='t'||s[0]==='r')&&+s.slice(1)>G.stage+1)return false;return true;});}
function ceCanHere(m){return !!m&&!G.daily&&!m.archive&&(m.kind==='field'||(m.kind==='dungeon'&&m.cave))&&!(m.kind==='dungeon'&&!m.cave);}
function ceType(m){const ph=m.cave?'day':clockPhase();const night=ph==='night',day=ph==='day'||ph==='dawn';const ce=ceInit();
  const hasPot=(G.inv&&G.inv.potion>0);
  const W={help:40*(night?1.5:1),duel:30*(day?1.4:.8),merchant:30*(day||ph==='dusk'?1.5:.5)};
  if(ce.last)W[ce.last]*=.35;// not the same kind twice in a row either
  const tot=W.help+W.duel+W.merchant;let r=Math.random()*tot,t='help';if((r-=W.help)>=0){t='duel';if((r-=W.duel)>=0)t='merchant';}
  return t;}
function ceStep(){
  if(!G||!WS||!WS.m||V.modal||WS.lock||V.screen!=='world')return;const m=WS.m;if(!ceCanHere(m))return;
  const ex=m.exits.find(e=>e.x===WS.x&&e.y===WS.y);if(ex)return;
  const c=tileAt(m,WS.x,WS.y);if(c==='E'||c==='S'||c==='C'||c==='K')return;
  const ce=ceInit();ce.st++;
  if(ce.st<CE_GAP||G.ward>0||(ce.cnt[m.id]||0)>=CE_AREA_CAP)return;
  if(Math.random()>=CE_ODDS)return;
  const hero=cePick(m);if(!hero)return;
  ceStart(m,hero,ceType(m));}
function ceLine(hero){const t=TPL[hero],cls={warrior:'a fighter',knight:'a knight',mage:'a mage',healer:'a healer',thief:'a rogue',archer:'an archer',monk:'a monk',summoner:'a summoner',bard:'a bard'}[t.cls]||'a wayfarer';return cls;}
function ceStart(m,hero,type){const ce=ceInit(),t=TPL[hero],nm=t.n,zn=ZS(m.s).n,where=m.cave?'deep in the cave':'on the road';
  ce.st=0;ce.last=type;ce.cnt[m.id]=(ce.cnt[m.id]||0)+1;ce.met[hero]=(ce.met[hero]||0)+1;
  try{codexSee(hero);}catch(e){}
  haltInput();let ev;
  if(type==='help'){
    const pot=G.inv&&G.inv.potion>0;const mode=pot&&Math.random()<.5?'potion':'ambush';
    if(mode==='potion')ev={type,mode,hero,title:'A wayfarer in need',text:`${nm}, ${ceLine(hero)}, sits against a rock ${where} in ${zn}, pale, pressing a rag to a bad cut. "Don't suppose you have a potion to spare? I can't pay you. But I can walk with you, if you'll have me."`,
      ch:[{l:'Give a potion',a:'give'},{l:'Walk on',a:'no'}]};
    else ev={type,mode:'ambush',hero,title:'Ambush!',text:`Snarls ahead. ${nm}, ${ceLine(hero)}, has been cornered ${where} in ${zn} by a pack of beasts. "Behind you!" they shout. "Or in front of you, I'm not picky, just help!"`,
      ch:[{l:'Jump in',a:'fight'},{l:'Leave them to it',a:'no'}]};
  }else if(type==='duel'){
    ev={type,hero,title:'A challenge',text:`${nm}, ${ceLine(hero)}, steps into your path ${where} in ${zn} and sizes you up. "You carry yourselves like people who can fight. Prove it. A fair duel, nobody gets hurt badly. Win, and I will be waiting at the tavern. Hire me, if you like."`,
      ch:[{l:'Accept the duel',a:'fight'},{l:'Decline politely',a:'no'}]};
  }else{
    const hire=Math.max(60,Math.round(recruitCost(hero)*.75)),pack=60+40*G.stage;
    ev={type,hero,hire,pack,title:'A wandering trader',text:`A cart creaks ${where} in ${zn}. ${nm}, ${ceLine(hero)} turned peddler, tips a hat. "Tell you a story for free: I once sold a map to a man who then sold it back to me. Twice. Now, business. I can hire on with you for a fair price, or sell you a travel pack and remember your face."`,
      ch:[{l:`Hire ${nm} (${hire}g)`,a:'hire',cost:hire},{l:`Buy a travel pack (${pack}g)`,a:'pack',cost:pack},{l:'Just listen and move on',a:'story'}]};
  }
  V.modal={type:'cev',ev};render();if(typeof sfx==='function')sfx('chime');}
function ceJoin(hero,why){if(G.roster[hero])return '';recruit(hero,true);try{codexSee(hero,{rec:1,lv:G.roster[hero].lv});}catch(e){}
  const ce=ceInit();ce.helped++;if(typeof facCredit==='function')facCredit('road',1);if(typeof sfx==='function')sfx('level');saveGame();
  return `${TPL[hero].n} joins you${G.party.includes(hero)?' and your six':''}. ${why||''}`;}
ACT.cevPick=function(a){
  const m=V.modal;if(!m||m.type!=='cev')return;const ev=m.ev,ch=ev.ch.find(c=>c.a===a);if(!ch)return;const hero=ev.hero,nm=TPL[hero].n;
  const done=(title,text)=>{V.modal={type:'story',title,text,btn:'Onward'};render();};
  if(a==='no'){V.modal=null;toast(ev.type==='help'?`You leave ${nm} behind. They might turn up somewhere else.`:cwDecline(hero));render();return;}
  if(a==='give'){if(!(G.inv.potion>0))return;G.inv.potion--;const t=ceJoin(hero,cwWin(hero,'thanks'));done('A debt repaid',t);return;}
  if(a==='story'){const s=WS.m.s,mt=ZS(s).mat;G.mats[mt]=(G.mats[mt]||0)+2;ceInit();saveGame();done('A story for the road',`${nm} presses 2 ${MATS[mt]} into your hands. "Storytellers eat last. Take them."`);return;}
  if(a==='hire'){if(G.gold<ch.cost)return;G.gold-=ch.cost;ceInit().deals++;const t=ceJoin(hero,'"Pleasure doing business."');done('Hired on',t);return;}
  if(a==='pack'){if(G.gold<ch.cost)return;G.gold-=ch.cost;const got=packContents();const ce=ceInit();ce.fr[hero]=1;ce.deals++;if(typeof facCredit==='function')facCredit('road',1);saveGame();
    done('Pleasure doing business',`You get ${got}. ${nm} grins. "You might find me in a tavern or the Guild Hall one day, if the road allows. If you do, I may knock a fifth off the hiring fee for a friend."`);return;}
  if(a==='fight'){V.modal=null;const s=WS.m.s,k=WS.m.kind==='dungeon'?'dungeon':'field';
    const spec=ev.type==='duel'?{stage:s,kind:'duel',hero,ce:{hero,mode:'duel'},weather:(G.weather||{})[s]||'clear'}:{stage:s,kind:k,ce:{hero,mode:'ambush'}};
    if(!startBattle(spec)){toast('Your party needs rest first.');}render();return;}
};
HOOK.before('vModal','chance','cev popup (chance meetings)',function(m){if(m&&m.type==='cev'){const ev=m.ev;const btns=ev.ch.map((c,i)=>{const off=c.cost!=null&&G.gold<c.cost||c.a==='give'&&!(G.inv.potion>0);return `<button class="btn ${i?'':'gold'}" data-act="cevPick" data-arg="${c.a}" ${off?'disabled':''}>${esc(c.l)}</button>`;}).join('');
  return HOOK.stop(box(esc(ev.title),`<div class="who"><img class="himg" src="${heroURL(ev.hero)}" alt="" style="width:64px;height:64px;float:left;margin:0 10px 6px 0;image-rendering:pixelated"><p>${esc(ev.text)}</p></div><p class="note" style="clear:both">${CE_TYPES[ev.type]}. Optional. Win and ${TPL[ev.hero].n} waits for you at the tavern, ready to hire. Decline and you may still meet them later.</p>`,btns));}
  });
// ----- duel foes -----
function duelFoes(spec){const s=spec.stage,lv=STAGE_LV[s][1],t=TPL[spec.hero],el=(t.el||['light'])[0],out=[];
  const tpl={n:t.n,art:'frostwolf',el:t.el||[el],hp:1,atk:1.1,def:1,mag:1.1,res:1,spd:1.1,
    sk:[[`${EL[el]} Strike`,el,1.15,'one','phys'],[`${EL[el]} Burst`,el,.85,'all','mag'],['Steady Guard',el,0,'self','buff',[['bulwark',1]]]]};
  if(!MON.frostwolf)tpl.art=Object.keys(MON)[0];
  const e=makeEnemy(tpl,lv,{elite:true,name:t.n,hpM:2.2+.25*s,powM:1.0+.04*s});e.heroArt=spec.hero;e.multi=1;e.phase={at:.5,say:`${t.n} grins and digs in.`,self:[['might',1]]};out.push(e);
  const pm=ZS(s).pool||[];const mk=pm.length?pm[0]:Object.keys(MON)[0];
  for(let i=0;i<2;i++){const k=pm[(i+1)%Math.max(1,pm.length)]||mk;if(MON[k]){const h=makeEnemy(MON[k],Math.max(2,lv-3));h.name=`${t.n}'s ${MON[k].n}`;out.push(h);}}
  return out;}
HOOK.before('encounterFoes','chance','duel foes',function(spec){if(spec.kind==='duel')return HOOK.stop(duelFoes(spec));});
{const cw=typeof challengeWin==='function'?challengeWin:null;if(cw)challengeWin=function(spec,info){const r=cw.apply(this,arguments);try{
  if(spec&&spec.ce&&!G.roster[spec.ce.hero]){const mode=spec.ce.mode,h=spec.ce.hero;
    if(mode==='duel'){const ce=ceInit();ce.duels++;ce.boost[h]=1;saveGame();info.legendKind='duel';info.legend=cwWin(h,'duel')+' '+cwPick(['Find me at the tavern when you want me. I will be waiting.','You won fair. I will keep a seat warm at the tavern.','Next tavern you walk into, look for me.'],h+':tail');}
    else{info.legendKind='wayfarer';info.legend=ceJoin(h,cwWin(h,'thanks'));}}}catch(e){}return r;};}
// ----- the hiring discount for traders you bought from -----
{const rc=recruitCost;recruitCost=function(id){let c=rc.apply(this,arguments);try{if(G&&G.ce&&G.ce.fr&&G.ce.fr[id])c=Math.round(c*.8);}catch(e){}return c;};}
// ----- steps -----
{const ar=arrive;arrive=function(){const r=ar.apply(this,arguments);try{ceStep();}catch(e){}return r;};}

// v0.4.3: travel packs roll their contents: three picks from a stage-weighted table, sometimes a rare extra
const PACK_TABLE=[['potion',3,0],['hipotion',2,1],['ether',3,0],['remedy',2,0],['salts',2,0],['ash',1,1],['bandage',1,2],['plume',1,1],['tent',1,0],['holywater',1,1],['vigor',1,2],['sage',1,2],['elixir',.3,3]];
function packContents(){const s=G.stage|0,L=PACK_TABLE.filter(r=>ITEMS[r[0]]&&r[2]<=s+1),got={};
  const roll=()=>{const tot=L.reduce((a,b)=>a+b[1],0);let r=Math.random()*tot;for(const x of L){if((r-=x[1])<0)return x[0];}return L[0][0];};
  const n=3+(Math.random()<.25?1:0);for(let i=0;i<n;i++){const k=roll();got[k]=(got[k]||0)+1;}
  const parts=[];Object.keys(got).forEach(k=>{const add=Math.min(got[k],invCap()-(G.inv[k]||0));if(add>0){G.inv[k]=(G.inv[k]||0)+add;}parts.push(`${got[k]>1?got[k]+' x ':'a '}${ITEMS[k].n}`);});
  if(Math.random()<.2){const m=ZS(s).mat;G.mats[m]=(G.mats[m]||0)+2;parts.push(`2 ${MATS[m]}`);}
  return parts.length>1?parts.slice(0,-1).join(', ')+' and '+parts[parts.length-1]:parts[0];}
