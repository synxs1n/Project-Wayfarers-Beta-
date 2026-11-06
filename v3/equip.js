// =================== EQUIPMENT (Beta v0.3.1) ===================
// Menu > Equipment, quick gear pickers, Auto best gear with undo, before/after previews in shops, and an
// "Equip this now?" prompt for new gear. New META.cfg field: autoEquip (off by default).
// ----- gear icons: one small pixel icon per family, tinted by tier; the Stick glows with its Bestiary colour -----
const GICON={blade:[[7,1,2,9],[5,10,6,1],[7,11,2,3]],dagger:[[7,4,2,6],[5,10,6,1],[7,11,2,2]],staff:[[7,3,2,11],[5,1,6,3]],tome:[[3,3,10,10],[4,4,8,1],[4,12,8,1]],
  bow:[[5,1,2,13],[7,2,2,1],[9,4,1,8],[7,13,2,1]],crossbow:[[3,6,10,2],[7,2,2,12],[3,4,1,2],[12,4,1,2]],mail:[[3,3,10,9],[2,3,2,4],[12,3,2,4]],robe:[[4,2,8,12],[3,3,2,6],[11,3,2,6]],
  vest:[[4,3,8,9],[3,3,2,3],[11,3,2,3]],charm:[[6,2,4,2],[5,4,6,7],[7,11,2,2]],
  axe:[[7,2,2,12],[3,2,6,5],[2,3,2,3]],greatsword:[[6,0,4,11],[4,10,8,2],[7,12,2,3]],lance:[[7,0,2,3],[7,3,2,12],[5,7,6,1]],mace:[[7,6,2,9],[4,1,8,5],[3,2,1,3],[12,2,1,3]],
  shortsword:[[7,3,2,7],[5,9,6,1],[7,10,2,3]],longbow:[[4,0,2,16],[6,1,2,1],[8,4,1,9],[6,14,2,1]],knuckles:[[3,5,10,6],[4,3,2,2],[7,3,2,2],[10,3,2,2]],claws:[[3,2,2,10],[7,1,2,11],[11,2,2,10],[3,12,10,2]],
  qstaff:[[7,0,2,16],[5,3,6,1],[5,12,6,1]],lute:[[5,6,6,8],[7,1,2,6],[6,13,4,1]],harp:[[3,2,2,12],[3,2,9,2],[7,4,1,9],[10,4,1,9]],flute:[[1,7,14,2],[4,5,1,2],[7,5,1,2],[10,5,1,2]],
  stick:[[7,1,2,13],[9,4,2,1],[5,8,2,1]]};
const TIERC=['#b8b8c0','#8ac0ff','#7ae89a','#ffcf6a','#e08aff','#ff7a6a'];
function gearFamOf(id){const b=baseIdOf(id);if(b==='w_stick')return 'stick';if(b.startsWith('c_'))return 'charm';return b.split('_')[1];}
function gearIcon(id){const g=gearOf(id);if(!g)return '';const fam=gearFamOf(id),glow=g.stick?g.glow:null,key='gi3:'+baseIdOf(id)+':'+(glow||g.tier)+':'+(g.plus||0);// v0.6.3: one icon per item (icons.js)
  return `<img class="gico" alt="" src="${cvURL(key,()=>{const c=mkCv(16,16),x=c.getContext('2d'),col=glow||TIERC[Math.min(5,g.tier||0)];
    if(glow&&g.stickP&&g.stickP.tier>0){x.fillStyle=glow+'55';x.fillRect(0,0,16,16);}
    drawGearIcon(x,fam,col,g.tier||0,glow,id);
    if(g.plus){x.fillStyle='#ffd04a';for(let i=0;i<g.plus;i++)x.fillRect(12-i*3,13,2,2);}return c;})}">`;}
// ----- stat previews -----
function statsWith(c,sl,id){const eq=Object.assign({},c.eq);eq[sl]=id;return calcStats(Object.assign({},c,{eq}));}
const DSTAT=[['mhp','HP'],['mmp','MP'],['atk','ATK'],['def','DEF'],['mag','MAG'],['res','RES'],['spd','SPD'],['healP','HEAL']];
function deltaHtml(c,id){const g=gearOf(id);if(!g)return '';const a=c.S,b=statsWith(c,g.slot,id),p=[];
  DSTAT.forEach(([k,n])=>{const d=Math.round((b[k]||0)-(a[k]||0));if(d)p.push(`<b class="${d>0?'up':'dn'}">${d>0?'▲':'▼'}${Math.abs(d)} ${n}</b>`);});
  return p.join(' ')||'<small>No change</small>';}
// how good a loadout is for this hero's job: class weights over the derived stats
const CLASS_W={warrior:{atk:1,def:.4,mhp:.06,spd:.4},knight:{def:1,res:.6,mhp:.08,atk:.4},mage:{mag:1,res:.3,mmp:.06,spd:.3},healer:{healP:1,mag:.3,res:.4,mmp:.08},
  thief:{atk:.8,spd:1.2,def:.2},archer:{atk:1,spd:.6,def:.2},monk:{atk:1,spd:.5,def:.4,mhp:.04},bard:{mag:.6,spd:.8,res:.4,mhp:.04,healP:.4},
  sniper:{atk:1,spd:.6},druid:{atk:1,spd:.6,healP:.2},archmage:{mag:1,spd:.3,mmp:.05},chronicler:{mag:.8,healP:.4,res:.3}};
function loadoutScore(c,S){const W=CLASS_W[TPL[c.id].cls]||{atk:1,mag:1};let v=0;Object.keys(W).forEach(k=>{v+=(S[k]||0)*W[k];});
  v+=((S.crit||0)*100)*.5;Object.keys(S.elBoost||{}).forEach(el=>{if(c.el.includes(el))v+=4+c.lv*.15;});if(S.immune)v+=3;return v;}
function gainFor(c,id){const g=gearOf(id);if(!g||!canEquip(c,id))return null;const a=loadoutScore(c,c.S),b=loadoutScore(c,statsWith(c,g.slot,id));return {d:b-a,pct:a>0?(b-a)/a:0};}
// heroes who can use an item, best upgrade first
let FITC=null;// per-render cache: shop rows ask about the same item for every hero, which was O(items x roster x stats)
function fitsFor(id){if(FITC&&FITC[id])return FITC[id];const r=Object.values(G.roster).map(c=>({c,g:gainFor(c,id)})).filter(o=>o.g).sort((x,y)=>y.g.d-x.g.d||G.party.indexOf(y.c.id)-G.party.indexOf(x.c.id));if(FITC)FITC[id]=r;return r;}
{const r0=render;render=function(){FITC={};try{return r0.apply(this,arguments);}finally{FITC=null;}};}
// ----- auto best gear -----
// ----- the Equipment tab -----
function vEquipTab(){const L=G.party.concat(Object.keys(G.roster).filter(id=>!G.party.includes(id)).sort((a,b)=>G.roster[b].lv-G.roster[a].lv));V.charList=L.slice();
  return `<p class="note">Every hero's weapon, armor and charm at a glance. Tap a slot to change it; works anywhere outside battle.</p>
  <div class="btnrow"><button class="btn gold" data-act="autoEqParty" title="Party first. May take gear and companions from heroes outside the party.">Auto best gear: party</button><button class="btn" data-act="autoEqAll" title="Balances the whole roster, still favouring the party.">Equip best for everyone</button></div><p class="note"><small>The per-hero Auto button only uses your pack and free companions. It never takes from another hero.</small></p>
  <div class="eqlist">${L.map((id,i)=>{const c=G.roster[id];return `${i===G.party.length&&i?'<h4>Roster</h4>':i===0?'<h4>Party</h4>':''}<div class="eqrow">${port(id)}<div class="grow"><b>${esc(c.name)}</b><small>Lv ${c.lv} ${CLS[TPL[id].cls].n}</small>${xpMini(c)}
    <div class="eqslots">${EQSL.map(sl=>{const g=gearOf(c.eq[sl]);return `<button class="eqs" data-act="eqPick" data-arg="${id},${sl}">${g?gearIcon(c.eq[sl]):'<span class="gico empty"></span>'}<span><small>${SLOTN[sl]}</small>${g?esc(g.n):'Empty'}</span></button>`;}).join('')}</div></div>
    <button class="btn sm" data-act="autoEqOne" data-arg="${id}" title="Equip the best spare gear for ${esc(c.name)}">Auto</button></div>`;}).join('')}</div>`;}
function mEquipPick(m){const c=G.roster[m.char];if(!c)return '';const sl=m.slot,cur=c.eq[sl];
  const ids=[...new Set(G.gear.filter(id=>{const g=gearOf(id);return g&&g.slot===sl&&(!g.only||g.only===c.id);}))];
  const ok0=ids.filter(id=>canEquip(c,id)).sort((a,b)=>(gainFor(c,b).d)-(gainFor(c,a).d)),no=ids.filter(id=>!canEquip(c,id));
  // v0.6.3: dropdown filters, remembered in META.cfg.lists.eqpick (sh: all or upg, rg: a rarity)
  const ef=LC('eqpick'),esh=ef.sh||'all',erg=ef.rg||'all',ok=ok0.filter(id=>(esh!=='upg'||gainFor(c,id).d>0.01)&&(erg==='all'||String(gTierIdx(gearOf(id)))===erg));
  const ebar=ok0.length>1&&typeof ddBar==='function'?ddBar([ddSel('Show','lSh','eqpick',[['all','Everything that fits'],['upg','Upgrades only']],esh),ddSel('Rarity','lRg','eqpick',[['all','Any rarity']].concat(ITEM_TIERS.map((t,i)=>[String(i),esc(t.n)])),erg)],'lfbar'):'';
  const LST=(m.list||[]).filter(x=>G.roster[x]),li=LST.indexOf(c.id);
  return box(`${SLOTN[sl]}: ${esc(c.name)}`,`${LST.length>1?`<div class="cnav"><button class="btn sm" data-act="eqNav" data-arg="-1" aria-label="Previous hero">‹ Prev</button><small class="nums">${li+1} / ${LST.length}</small><button class="btn sm" data-act="eqNav" data-arg="1" aria-label="Next hero">Next ›</button></div>`:''}
    <div class="chips">${EQSL.map(s=>`<button class="chip ${s===sl?'on':''}" data-act="eqSlot" data-arg="${s}">${SLOTN[s]}</button>`).join('')}</div>
    <div class="row eqcur">${cur?gearIcon(cur):''}<div class="grow"><small>Equipped</small><b>${cur?esc(gearOf(cur).n):'Nothing'}</b>${cur?tierChip(gearOf(cur)):''}<small>${cur?gearDesc(cur):''}</small></div>${cur?`<button class="btn sm" data-act="eqOff">Unequip</button>`:''}</div>
    ${ebar}<div class="rows">${ok.map(id=>{const n=G.gear.filter(x=>x===id).length,gg=gainFor(c,id);return `<div class="row tr ${gg.d>0.01?'upg':''}" style="${tierVars(gTierIdx(gearOf(id)),gearOf(id))}">${gearIcon(id)}<div class="grow"><b>${esc(gearOf(id).n)}</b> ${tierChip(gearOf(id))}${n>1?` <small>x${n}</small>`:''}<small>${gearDesc(id)}</small><small>${vsMark(c,id)} ${deltaHtml(c,id)}</small></div><button class="btn sm ${gg.d>0.01?'gold':''}" data-act="eqSet" data-arg="${id}">Equip</button></div>`;}).join('')||(ok0.length?'<p class="note empty">Nothing matches the filters.</p>':'<p class="note empty">No spare gear for this slot. The Smithy and Alchemy sell more.</p>')}
    ${no.length?`<p class="note">${no.length} item${no.length>1?'s':''} in your pack can't be used by a ${CLS[TPL[c.id].cls].n} (tomes are for Mages, Archmages and Chroniclers).</p>`:''}</div>`,
    `<button class="btn" data-act="autoEqOne" data-arg="${c.id}">Auto best gear</button><button class="btn gold" data-act="xBack">Done</button>`,true);}
// ----- "Equip this now?" for bought, crafted, won and found gear -----
function queueNewGear(ids,now){if(!G||G.daily)return;ids=ids.filter(id=>gearOf(id)&&!gearOf(id).stick);if(!ids.length)return;
  if(META.cfg.autoEquip){const msgs=[];ids.forEach(id=>{const f=gainersFor(id)[0]||fitsFor(id)[0];if(f&&f.g.pct>=.03&&G.gear.includes(id)){const old=f.c.eq[gearOf(id).slot];equipGear(f.c,id);msgs.push(`${f.c.name} equipped ${gearOf(id).n}`+(old?` (was ${gearOf(old).n})`:''));}});
    if(msgs.length){saveGame();toast('Auto equip: '+msgs.join('; ')+'.');}return;}
  const want=ids.filter(id=>fitsFor(id).length);if(!want.length)return;
  // bought or crafted: ask right away, then go back to the shop; won or found: ask once you're back in the world
  if(now){V.modal={type:'equipNow',id:want[0],rest:want.slice(1),from:V.modal};render();return;}
  V.gearQueue=(V.gearQueue||[]).concat(want.filter(id=>fitsFor(id).some(o=>o.g.d>0.01)));}
function eqNowNext(m){const r=(m&&m.rest||[]).filter(id=>G.gear.includes(id));V.modal=r.length?{type:'equipNow',id:r[0],rest:r.slice(1),from:m.from}:(m&&m.from)||null;render();}
// ----- hooks: watch the pack for new gear -----
function gearDiffIds(before){const c={};before.forEach(id=>{c[id]=(c[id]||0)+1;});const out=[];G.gear.forEach(id=>{if(c[id])c[id]--;else out.push(id);});return out;}
function watchGear(fn,now){return function(){const b=G?G.gear.slice():[];const r=fn.apply(this,arguments);try{if(G)queueNewGear(gearDiffIds(b),now);}catch(e){}return r;};}
['buyGear','craftR','buyRelit'].forEach(k=>{if(ACT[k])ACT[k]=watchGear(ACT[k],true);});['qClaim','chClaim'].forEach(k=>{if(ACT[k])ACT[k]=watchGear(ACT[k]);});
{const w0=win;win=watchGear(w0);}
{const oc=typeof openChest==='function'?openChest:null;if(oc)openChest=watchGear(oc);}
{const cq=claimQuest;claimQuest=watchGear(cq);}
{const r0=render;render=function(){if(G&&!G.daily&&!V.modal&&V.screen==='world'&&!B&&V.gearQueue&&V.gearQueue.length&&!WS.dlg){const id=V.gearQueue.shift();if(G.gear.includes(id))V.modal={type:'equipNow',id};}return r0.apply(this,arguments);};}
{const vm0=vModal;vModal=function(m){if(m){if(m.type==='eqPick')return mEquipPick(m);if(m.type==='autoEq')return mAutoEq(m);if(m.type==='equipNow')return mEquipNow(m);}return vm0.apply(this,arguments);};}
Object.assign(ACT,{
  eqPick(a){const [id,sl]=a.split(',');V.modal={type:'eqPick',char:id,slot:sl,list:(V.charList||[]).slice(),from:V.modal};render();},
  eqSlot(sl){V.modal.slot=sl;render();},
  eqNav(d){const m=V.modal,L=(m.list||[]).filter(x=>G.roster[x]);if(L.length<2)return;const i=L.indexOf(m.char);m.char=L[((i<0?0:i)+(+d)+L.length)%L.length];sfx('blip');render();},
  eqSet(id){const c=G.roster[V.modal.char];equipGear(c,id);saveGame();sfx('equip');render();},
  eqOff(){const c=G.roster[V.modal.char];unequipGear(c,V.modal.slot);saveGame();render();},
  autoEqUndo(){const m=V.modal;undoAuto(m.snap);toast('Gear changes undone.');V.modal=m.from||null;render();},
  cmpT(id){V.cmp=V.cmp===id?null:id;render();},
  eqNowOn(cid){const m=V.modal,id=m.id,c=G.roster[cid];if(c&&G.gear.includes(id)){equipGear(c,id);saveGame();toast(`${c.name} equipped ${gearOf(id).n}.`);sfx('equip');}eqNowNext(m);},
  eqNowNo(){eqNowNext(V.modal);}
});
// ----- the Tamer's Stick quest (Beta v0.3.1): on the first town's board in every journey until claimed -----
// STICK_Q: in config.js
{const gq0=genQuests;genQuests=function(s){const r=gq0.apply(this,arguments);try{if(!G.quests.some(q=>q.id==='tamer')&&!G.gear.includes('w_stick')&&!Object.values(G.roster).some(c=>c.eq.w==='w_stick'))
  G.quests.push({id:'tamer',stage:0,type:'tamer',n:STICK_Q,state:'open',title:"The Tamer's Stick",desc:`Old Wren the beast tamer swears her walking stick grows with what its owner knows about monsters. Log ${STICK_Q} creatures in your Bestiary and she will give it to you.`,reward:{}});}catch(e){}return r;};}
{const qr0=questReady;questReady=function(q){if(q&&q.type==='tamer')return q.state==='active'&&stickCount().n>=q.n;return qr0.apply(this,arguments);};}
{const cq0=claimQuest;claimQuest=function(q){if(q&&q.type==='tamer'){if(!questReady(q))return null;G.gear.push('w_stick');q.state='claimed';saveGame();
  setTimeout(()=>{V.modal={type:'story',title:"The Tamer's Stick",text:`Wren presses a plain wooden stick into your hands. "Looks like nothing, eh? It feeds on knowing. Every creature you log in your Bestiary makes it stronger, and when you know them all it will rival any blade." Any hero can wield it. Right now it is at ${stickPower().pow} power, with ${stickPower().n} of ${stickPower().all} creatures logged. Its glow goes from plain to green, blue, purple and finally gold as it grows.`,btn:'Thanks, Wren'};render();},50);
  return ["The Tamer's Stick"];}return cq0.apply(this,arguments);};}
// glow under a hero holding a grown Stick, in battle and in the world
function stickGlowOf(c){if(!c||!c.eq||c.eq.w!=='w_stick')return null;const P=stickPower();return P.tier>0?P.col:null;}
{const wd0=worldDraw;worldDraw=function(now){wd0(now);try{const m=WS.m;if(!m||!G)return;const lead=G.roster[G.party[0]],col=stickGlowOf(lead);if(!col)return;const ctx=WS.ctx,cx=Math.round(WS.cam.x),cy=Math.round(WS.cam.y),p=.5+.5*Math.sin(now/260);
  ctx.save();ctx.globalAlpha=.25+.25*p;ctx.strokeStyle=col;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(Math.round(WS.px)+8-cx,Math.round(WS.py)+15-cy,8+p*2,3+p,0,0,7);ctx.stroke();ctx.restore();}catch(e){}};}
