// ===== battleui.js (v0.3.3): battle screen: element badges, unit cards, the unit detail panel =====
// Element badges with a colorblind safe silhouette per element, readable unit cards, lighter foe cards, and a unit detail panel.
// Nothing here changes battle rules or saves. The detail panel is pure view state (B.uDet) and pauses the fight while it is open.
// v0.3.5 2.2: ONE element icon set. Every icon is a different silhouette AND colour (flame, droplet, mountain, tornado, bolt, snowflake, sparkle, crescent),
// so it reads without colour. elShapeCv is the single source: iconURL (ico), iconCv (canvas) and elb (cards) all draw from it. '#'=body 'o'=light mark.
const ELSHAPE={
  fire:['....#....','...##.#..','..###.##.','..#######','.########','.###o####','.##ooo###','..#ooo##.','...###...'],
  water:['....#....','....#....','...###...','...###...','..#####..','.###o###.','.##o#####','.#######.','..#####..'],
  earth:['.........','....#....','...###...','..##o##..','.#######.','.###o###.','#########','#########','.........'],
  wind:['#########','.........','.#######.','.........','..#####..','.........','...###...','.........','....#....'],
  lightning:['....###..','...###...','..###....','.#######.','...###...','..###....','..##.....','.##......','.#.......'],
  ice:['....#....','.#..#..#.','..#.#.#..','...###...','#########','...###...','..#.#.#..','.#..#..#.','....#....'],
  light:['....#....','....#....','...###...','..##o##..','#########','..##o##..','...###...','....#....','....#....'],
  shadow:['...####..','..###....','.###.....','.###...#.','.###.....','.###.....','..###....','...####..','.........']};
const ELNAME2={fire:'Fire (flame)',water:'Water (droplet)',earth:'Earth (mountain)',wind:'Wind (tornado)',lightning:'Lightning (bolt)',ice:'Ice (snowflake)',light:'Light (sparkle)',shadow:'Shadow (crescent)'};
const ELSV={};
// 11x11 canvas: a dark outline around the silhouette, filled in the element colour, with a light inner mark so it reads in greyscale
function elShapeCv(el){if(ELSV[el])return ELSV[el];const S=ELSHAPE[el]||ELSHAPE.earth,c=mkCv(11,11),x=c.getContext('2d'),col=ELC[el]||'#ccc',hi=tint(col,.55);
  for(let y=0;y<9;y++)for(let i=0;i<9;i++){if(S[y][i]==='.')continue;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){x.fillStyle='#150b17';x.fillRect(i+1+a,y+1+b,1,1);}}
  for(let y=0;y<9;y++)for(let i=0;i<9;i++){if(S[y][i]==='.')continue;x.fillStyle=col;x.fillRect(i+1,y+1,1,1);}
  for(let y=0;y<9;y++)for(let i=0;i<9;i++){if(S[y][i]==='o'){x.fillStyle=hi;x.fillRect(i+1,y+1,1,1);}}return ELSV[el]=c;}
function elb(el){return `<img class="elb" src="${cvURL('elb:'+el,()=>elShapeCv(el))}" alt="${esc(ELNAME2[el]||EL[el]||el)}" title="${esc(ELNAME2[el]||EL[el]||el)}">`;}
function elbs(list){return `<span class="elbs">${(list||[]).map(elb).join('')}</span>`;}
function elbNamed(list){return (list||[]).map(el=>`<span class="elbn">${elb(el)} ${esc(EL[el]||el)}</span>`).join(' ');}
// ----- cards -----
function foeKnown(e){return tierOf(bestEntry(e),e.boss)>=2;}
function hpText(u){return `${Math.max(0,Math.ceil(u.hp))}/${u.S.mhp}`;}
function uInfoBtn(u){return `<button class="uinfo" data-act="uInfo" data-arg="${unitRef(u)}" aria-label="Details for ${esc(u.name)}" title="Details">i</button>`;}
// v0.3.5 2.1: the loud primed chip on every foe card, with turns left and a reaction hint while a detonator is being aimed
// v0.6.3: compact (element, "Primed", turns left); while a detonator is aimed it names the reaction it will set off
function primedChip(e){if(!(e.primed&&e.hp>0&&EL[e.primed.el]))return '';const sk=B.mode==='cmd'&&B.pend&&B.pend.sk,hit=detHits(sk,e),R=hit?(detTargets(sk).find(o=>o.e===e)||{}).R:null;
  return `<span class="pchip ${hit?'hit':''}" style="--c:${ELC[e.primed.el]}" title="Primed with ${EL[e.primed.el]} for ${e.primed.t} more turn${e.primed.t===1?'':'s'}. A matching Detonator sets off a reaction.">${ico(e.primed.el)}<b>Primed</b><i>${e.primed.t}t</i>${R?`<u>✸ ${esc(R.n)}</u>`:''}</span>`;}
// v0.6.3: the elements this foe is known to be weak to (and resists), from the Bestiary
function foeWeak(e){try{const b=bestEntry(e),kn=Object.keys(b.known||{}).filter(el=>EL[el]),w=kn.filter(el=>effOf(el,e)>1),r=kn.filter(el=>effOf(el,e)<1);
  return (w.length?`<span class="fwk up" title="Weak to ${esc(w.map(el=>EL[el]).join(', '))}">Weak ${w.map(ico).join('')}</span>`:'')+(r.length?`<span class="fwk dn" title="Resists ${esc(r.map(el=>EL[el]).join(', '))}">Res ${r.map(ico).join('')}</span>`:'');}catch(x){return '';}}
// v0.4.0 1.3: shield pips get their own row on the foe card (and their own strip on the stage), never shared with status icons
function shPips(u){if(!u.maxShield||u.hp<=0)return '';let h='';for(let i=0;i<u.maxShield;i++)h+=`<i class="${u.broken?'br':i<u.shield?'on':''}"></i>`;
  return `<span class="spips ${u.broken?'broken':''}" role="img" aria-label="Shield ${u.broken?'broken':u.shield+' of '+u.maxShield}" title="Shield ${u.broken?'broken':u.shield+'/'+u.maxShield}"><b>Shield</b><span class="spp">${h}</span>${u.broken?'<em>BROKEN</em>':''}</span>`;}
function foeCards(){
  const now=Date.now(),L=B.en.map((e,i)=>({e,i})).filter(({e})=>!(e.hp<=0&&now-(e.deathT||0)>1500));
  if(!L.length)return '';
  return `<div class="pgroup foes"><h3>Foes</h3><div class="fcs">${L.map(({e,i})=>{const tg=targetable(e),dead=e.hp<=0,kn=foeKnown(e),pct=Math.max(0,Math.ceil(e.hp/e.S.mhp*100));
    const art=e.heroArt?heroURL(e.heroArt):monURL(e.art);
    // v0.6.3: effects the stage already shows in full are not repeated here (b3OnStage); the reaction a detonator sets off always is
    const tags=dead?'':(b3OnStage(e,'prim')&&!detHits(B.pend&&B.pend.sk,e)?'':primedChip(e))+foeWeak(e)+(b3OnStage(e,'tags')?'':stButtons(e,{max:BL.mode==='tall'?3:5,noWx:true,noPrime:true}))+(BL.mode==='tall'||BL.mode==='wide'?'':archChips(e));
    return `<div class="pcw fcw ${tags?'hastags':''}"><button class="fc ${tg?'tg':''} ${dead?'ko':''} ${e.primed&&!dead?'isprimed':''} ${tg&&detHits(B.pend&&B.pend.sk,e)?'dethit':''}" style="--pc:${e.primed&&ELC[e.primed.el]||'#fff'}" data-x="1 ${B.mode==='cmd'&&B.menu==='target'&&!tg?'':''}" data-act="tgtE" data-arg="${i}" ${tg?'':'tabindex="-1"'} aria-label="${esc(e.name)}, level ${e.lv}">
      <img class="fci" src="${art}" alt=""><span class="pm"><span class="uct"><b>${esc(e.name)}${e.elite?' ★':''}</b><span class="ucl">Lv ${e.lv}</span>${elbs(e.el)}</span>
      <span class="ucr"><i>HP</i>${bar(e.hp,e.S.mhp,'#e8504a')}<em class="nums">${dead?'KO':kn?hpText(e):pct+'%'}</em></span>${shPips(e)}</span></button>${uInfoBtn(e)}
      <div class="ptags">${tags}</div></div>`;}).join('')}</div></div>`;
}
function pcard0(c,rs,turn,tg,lb){
  const lim=!rs&&limitOpen(c),ko=c.hp<=0;
  const sw=rs&&!ko&&B.mode==='cmd'&&!B.pend&&!B.auto&&canSwap();
  return `<button class="pc ${rs?'rs':''} ${turn?'turn':''} ${ko?'ko':''} ${tg?'tg':''} ${sw?'swapok':''}" data-act="tgtA" data-arg="${allParty().indexOf(c)}" ${tg||sw?'':'tabindex="-1"'} aria-label="${esc(c.name)}, level ${c.lv}${sw?'. Tap to switch in':''}" ${sw?'title="Tap to switch in"':''}>
    ${port(c.id)}<span class="pm"><span class="uct"><b>${esc(c.name)}</b><span class="ucl">Lv ${c.lv}</span>${elbs(c.el)}</span>
    <span class="ucr"><i>HP</i>${bar(c.hp,c.S.mhp,'var(--hp)')}<em class="nums">${Math.max(0,c.hp)}/${c.S.mhp}</em></span>
    ${rs?'':`<span class="ucr"><i>MP</i>${bar(c.mp,c.S.mmp,'var(--mp)')}<em class="nums mpn">${c.mp}/${c.S.mmp}</em></span>`}
    ${lim?`<span class="ucr"><i>LB</i><span class="lbar ${lb>=100?'full':''}"><i style="width:${lb}%"></i></span><em class="nums">${Math.round(lb)}%</em></span>`:''}
    <small class="ucc">${esc(CLS[TPL[c.id].cls].n)}</small></span></button>`;
}
function pcard(c,rs){
  const turn=B.mode==='cmd'&&B.cur===c,tg=allyTargetable(c),lb=c.lb||0;
  const tags=rs?'':c.hp>0?(b3OnStage(c,'tags')?'':stButtons(c,{max:BL.mode==='tall'?3:6,noWx:true})):'<span class="swko">KO</span>';
  return `<div class="pcw ${tags?'hastags':''}">`+pcard0(c,rs,turn,tg,lb)+uInfoBtn(c)+`<div class="ptags">${tags}</div></div>`;
}
// ----- unit detail panel -----
const DSTATS=[['mhp','HP'],['mmp','MP'],['atk','ATK'],['def','DEF'],['mag','MAG'],['res','RES'],['spd','SPD']];
function uDetHtml(){
  const P=B&&B.uDet;if(!P)return '';const u=unitOf(P.ref);if(!u){B.uDet=null;return '';}
  const foe=u.side==='e',b=foe?bestEntry(u):null,tier=foe?tierOf(b,u.boss):3,exact=!foe||tier>=2;
  const art=foe?(u.heroArt?heroURL(u.heroArt):monURL(u.art)):heroURL(u.id);
  const tn=['Unseen','Seen','Studied','Mastered'][tier];
  const stats=DSTATS.filter(([k])=>!(foe&&k==='mmp')).map(([k,n])=>`<span><i>${n}</i><b>${exact?Math.round(u.S[k]||0):'???'}</b></span>`).join('')+`<span><i>CRIT</i><b>${exact?Math.round((u.S.crit||0)*100)+'%':'???'}</b></span>`;
  const sts=Object.keys(u.st||{}).filter(k=>STS[k]);
  const buffs=sts.filter(k=>!STS[k].bad),debs=sts.filter(k=>STS[k].bad);
  const stRow=k=>{const s=u.st[k];return `<div class="udst"><b class="${STS[k].bad?'dn':'up'}">${esc(STS[k].n)}</b>${s.t&&s.t<99?` <span class="nums">${s.t} turn${s.t===1?'':'s'} left</span>`:''}<small>${esc(STS[k].d)}${s.src?(s.src==='self'?' Self-applied.':' From '+esc(s.src)+'.'):''}</small></div>`;};
  let know='';
  if(foe){
    const kn=Object.keys(b.known||{}).filter(el=>EL[el]);
    know=`<h4>From the Bestiary</h4><p class="note">${tn}${b.kills?`, ${b.kills} defeated`:''}. ${tier<2?(u.boss?'Win once or scan it to learn its stats and skills.':'Defeat it 10 times or scan it to learn its stats and skills.'):'Stats and skills are known.'}</p>`
      +(kn.length?`<div class="udk">${kn.map(el=>{const m=effOf(el,u),w=m>1?['Weak','up']:m<1?(m===0?['Immune','im']:['Resists','dn']):['Neutral','nt'];return `<span class="udk1">${elb(el)} <b class="${w[1]}">${w[0]}</b></span>`;}).join('')}</div>`:'<p class="note">No elements learned yet. Hit it or scan it.</p>')
      +((b.hit||b.scan)&&u.q?`<p class="note">Quirk: ${esc(quirkText(u.q))}.</p>`:(!(b.hit||b.scan)&&u.q?'<p class="note">Quirk: not discovered yet.</p>':''))
      +(tier>=2&&u.sk&&u.sk.length?`<p class="note">Skills: ${u.sk.map(s=>esc(s.n)).join(', ')}.</p>`:'')
      +(u.phase&&!u.phaseDone&&b.scan?`<p class="note">Changes at ${Math.round(u.phase.at*100)}% HP.</p>`:'');
  }
  const pr=u.primed&&EL[u.primed.el]?`<div class="udst"><b class="up">${elb(u.primed.el)} Primed: ${EL[u.primed.el]}</b> <span class="nums">${u.primed.t} turn${u.primed.t===1?'':'s'} left</span><small>${u.primed.by?'Primed by '+esc(u.primed.by)+'. ':''}A matching Detonator sets off a reaction.</small></div>`:'';
  const brk=u.maxShield?`<div class="udst"><b>Shield ${u.broken?'broken':u.shield+'/'+u.maxShield}</b><small>${u.broken?'It takes 50% more damage and loses its next turn.':'Hit its weaknesses to chip the shield. At zero it breaks.'}</small></div>`:'';
  const wx=B.weather&&B.weather!=='clear'?`<div class="udst"><b>${WEATHER[B.weather].i} ${esc(WEATHER[B.weather].n)}</b><small>${esc(WEATHER[B.weather].d)}</small></div>`:'';
  return `<div class="udet" role="dialog" aria-label="${esc(u.name)} details"><div class="udbox">
    ${!foe&&isLeg(u.id)?`<div class="legstrip sm">${legSeal(1)}${legBanner()}${legSeal(1)}</div>`:''}<div class="udh ${!foe&&isLeg(u.id)?'legud':''}"><img class="udi" src="${art}" alt=""><div class="grow"><h3>${esc(u.name)}</h3><div>Lv ${u.lv}${foe?'':' '+esc(CLS[TPL[u.id].cls].n)}${u.elite?' · Elite':''}${u.echo?' · Echo':''}${u.boss?' · '+esc(bossClass(u.key||'')||'Boss'):''}</div><div class="elbl">${elbNamed(u.el)}</div></div><button class="btn sm" data-act="uClose" aria-label="Close details">✕</button></div>
    <div class="udbars"><div class="ucr"><i>HP</i>${bar(u.hp,u.S.mhp,foe?'#e8504a':'var(--hp)')}<em class="nums">${exact||!foe?hpText(u):Math.max(0,Math.ceil(u.hp/u.S.mhp*100))+'%'}</em></div>${foe?'':`<div class="ucr"><i>MP</i>${bar(u.mp,u.S.mmp,'var(--mp)')}<em class="nums">${u.mp}/${u.S.mmp}</em></div>`}${!foe&&limitOpen(u)?`<div class="ucr"><i>LB</i><span class="lbar ${(u.lb||0)>=100?'full':''}"><i style="width:${u.lb||0}%"></i></span><em class="nums">${Math.round(u.lb||0)}%</em></div>`:''}</div>
    <div class="udstats">${stats}</div>
    <h4>Effects</h4>${pr}${brk}${debs.map(stRow).join('')}${buffs.map(stRow).join('')}${!pr&&!brk&&!sts.length?'<p class="note">No buffs, debuffs or ailments.</p>':''}${wx}
    ${know}
    <div class="btnrow"><button class="btn gold" data-act="uClose">Back to the fight</button></div></div></div>`;
}
{const tE=ACT.tgtE,tA=ACT.tgtA;
  Object.assign(ACT,{
    // outside of target mode a tap on a unit opens its details; during targeting it still picks the target
    tgtE(i){if(B&&!(B.mode==='cmd'&&B.pend&&B.pend.sk&&(B.pend.sk.t==='one'||healsUndead(B.pend.sk,B.en[+i]))))return ACT.uInfo('e:'+i);return tE.apply(this,arguments);},
    tgtA(i){
      // v0.4.0 2.1: outside of targeting, a tap on a living reserve hero offers to switch them in
      if(B&&B.mode==='cmd'&&!B.pend&&!B.auto){const c=allParty()[+i],bi=B.back.indexOf(c);if(c&&bi>=0&&c.hp>0&&canSwap()){B.swapAsk={bi,by:B.cur.id};B.menu='root';render();const y=document.querySelector('#bcmd [data-act="swYes"]');if(y)y.focus();return;}}
      if(B&&!(B.mode==='cmd'&&B.pend&&(B.pend.item||(B.pend.sk&&(B.pend.sk.t==='ally'||B.pend.sk.t==='dead')))))return ACT.uInfo('p:'+i);return tA.apply(this,arguments);},
    swYes(){if(!B||B.mode!=='cmd'||!B.swapAsk)return;const bi=B.swapAsk.bi;B.swapAsk=null;if(doSwap(bi)===false)render();},
    swNo(){if(B){B.swapAsk=null;render();}},
    uInfo(ref){if(!B)return;B.uDet=B.uDet&&B.uDet.ref===ref?null:{ref};B.stPop=null;renderBattle();const c=document.querySelector('.udet [data-act="uClose"]');if(c&&B.uDet)c.focus();},
    uClose(){if(B){B.uDet=null;renderBattle();}}});}
// v0.4.3: a big boss HP bar across the top of the battle screen (Scourges, Calamities, Echoes, minibosses)
function bossBarHtml(){if(!B||!B.en)return '';const b=B.en.find(e=>e.boss&&e.hp>0)||B.en.find(e=>e.elite&&e.hp>0&&B.spec&&(B.spec.mini||B.spec.kind==='elite'));if(!b)return '';
  const p=Math.max(0,Math.min(100,b.hp/b.S.mhp*100)),sh=b.maxShield?`<span class="bbsh">${'◆'.repeat(Math.max(0,b.shield||0))}${'◇'.repeat(Math.max(0,b.maxShield-(b.shield||0)))}</span>`:'';
  return `<div class="bbn"><b>${esc(b.name)}</b> <small>Lv ${b.lv}</small>${sh}<span class="nums">${Math.ceil(b.hp)} / ${b.S.mhp}</span></div><div class="bbbar"><i style="width:${p.toFixed(1)}%"></i></div>`;}
{const rb0=renderBattle;renderBattle=function(){const r=rb0.apply(this,arguments);try{const el=document.getElementById('bbossbar');if(el){const h=bossBarHtml();if(el.innerHTML!==h)el.innerHTML=h;el.style.display=h?'':'none';const bt=el.closest('.battle');if(bt)bt.classList.toggle('hasboss',!!h);}}catch(e){}return r;};}
