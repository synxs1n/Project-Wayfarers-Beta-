// ===== party3.js (v0.6.3): party systems: Best Party formations, Training team, Equip best at camp =====
// 1. Best Party suggests several formations instead of one: Balanced, Boss ready (Area answer once the boss is down), Fresh mix and a
//    Training team. Role balance (tank, healer, damage, support, Primer, Detonator, deliveries, elements, answers to the area and its boss)
//    outweighs raw level and gear (BP6 in config.js); each pick is explained and placed: the vanguard fights, the rearguard swaps in.
// 2. Training team: under-leveled heroes join behind a strong tank and healer and catch up (XP catch up, p4xp.js, measured against the
//    top level on the whole roster since v0.6.3).
// 4. "Equip best: reserves": auto equip for the heroes not in the party, from spare gear only. Never touches the party's gear or companions.
//    Heroes outside the party are the Reserves; the back three of the party are the Rearguard.
// 3.4 / 3.5 (p3shop.js) are kept: reasons per pick, the threat line, the team check, "Equip best gear for this party" after Apply.
// No save fields. Nothing here runs in the Daily Trial.

// ----- what each hero brings to a formation -----
function p6Role(c){const k=p3Kit(c),t=TPL[c.id],cls=t.cls,sk=classSkills(t).filter(s=>skillKnown(c,s));
  const sup=cls==='bard'||!k.tank&&!k.heal&&sk.some(s=>s.k==='status'&&(s.t==='ally'||s.t==='allyAll'));
  // v0.8.4: secondary roles (roles.js heroRoleSet): a secondary tank or healer counts as half of one, a secondary support as support
  let H=null;try{H=typeof heroRoleSet==='function'?heroRoleSet(c):null;}catch(e){H=null;}
  if(!H||!H.primary)return {k,cls,tank:k.tank,heal:k.heal,sup,dmg:!k.tank&&cls!=='healer'&&cls!=='bard',pr:k.pr,de:k.de,tankH:0,healH:0};
  const P=H.primary,has=H.has||{},sec=r=>P!==r&&has[r];
  const tank=k.tank||P==='tank',heal=k.heal||P==='healer';
  return {k,cls,tank,heal,tankH:!tank&&sec('tank')?.5:0,healH:!heal&&sec('healer')?.5:0,sup:sup||P==='buffer'||sec('buffer'),
    dmg:['phys','magic','ranged'].includes(P)||(P==='debuffer'&&!tank&&!heal),pr:k.pr,de:k.de};}
const p6StepF=(arr,n)=>{const f=Math.floor(n);return p6Step(arr,f)+(n-f)*arr[Math.min(f,arr.length-1)];};
// v0.8.1: how much of what lies ahead flies (seen foes of this area; the whole area pool when nothing is seen yet), 0..1, and a flying boss
function p6Fly(T){try{let n=0,f=0;const pool=T.mons.length?T.mons:(ZS(T.s).pool||[]);pool.forEach(k=>{const d=MON[k];if(!d)return;n++;if(tyOf(d.art).includes('flying'))f++;});
  return {share:n?f/n:0,boss:!!(T.boss&&(T.boss.ty||[]).includes('flying'))};}catch(e){return {share:0,boss:false};}}
// shared context for one Build Party pass: power, roles, threats
function p6Ctx(){const all=Object.values(G.roster),pw={},R={};all.forEach(c=>{pw[c.id]=Math.max(1,loadoutScore(c,c.S));R[c.id]=p6Role(c);});
  const T0=p3Threats();return {all,pw,R,mx:Math.max(1,...Object.values(pw)),T:T0,fly:p6Fly(T0),top:Math.max(1,...all.map(c=>c.lv|0)),size:Math.min(6,all.length)};}
const p6Step=(arr,n)=>{let s=0;for(let i=0;i<n;i++)s+=arr[Math.min(i,arr.length-1)];return s;};
// the formation score: roles first, then answers to what lies ahead, then a little strength
function p6Score(set,X,mode,prev){const T=X.T,R=set.map(c=>X.R[c.id]),K=R.map(r=>r.k),cnt=f=>R.filter(f).length;let v=0;
  set.forEach(c=>{const r=X.pw[c.id]/X.mx;v+=BP6.str*Math.sqrt(r);if(mode!=='train'&&r<BP6.weak)v-=BP6.weakPen*(BP6.weak-r);});
  const half=f=>R.reduce((a,r)=>a+(r[f]||0),0);v+=p6StepF(BP6.role.tank,cnt(r=>r.tank)+half('tankH'))+p6StepF(BP6.role.heal,cnt(r=>r.heal)+half('healH'))+p6Step(BP6.role.sup,cnt(r=>r.sup&&!r.heal))+p6Step(BP6.role.dmg,cnt(r=>r.dmg));
  if(R.some(r=>r.pr))v+=BP6.pr;if(R.some(r=>r.de))v+=BP6.de;
  const cl={};R.forEach(r=>{cl[r.cls]=(cl[r.cls]||0)+1;});Object.values(cl).forEach(n=>{if(n>1)v-=BP6.dup*(n-1);});
  const els=new Set();set.forEach(c=>c.el.forEach(e=>els.add(e)));v+=BP6.el*els.size;
  const dls=new Set();K.forEach(k=>k.dl.forEach(d=>dls.add(d)));['piercing','blunt','ranged','magic'].forEach(d=>{if(dls.has(d))v+=BP6.dl;});
  // v0.8.1: flyers want real ranged attackers (Archers first): a lance or a spell only half answers them, so the plain archetype answer above
  // never brought an Archer in. One ranged hero is worth a lot when the area flies, a second a little more, an Archer a bit on top.
  {const F=X.fly||{share:0},w=F.share+(F.boss&&mode==='boss'?BP6.fly.boss:0);if(w>0){const nr=K.filter(k=>k.dl.has('ranged')).length;
    v+=w*(BP6.fly.one*(nr>=1?1:0)+BP6.fly.two*(nr>=2?1:0))+(R.some(r=>r.cls==='archer'||r.cls==='sniper')?w*BP6.fly.archer:0);}}
  const boss=mode==='boss',area=boss&&!T.boss,tot=Object.values(T.arch).reduce((a,b)=>a+b,0)||1;
  Object.keys(T.arch).forEach(a=>{if(!K.some(k=>p3Answer(k,a)))return;const mul=boss?(T.boss&&T.boss.ty.includes(a)?BP6.boss.arch:area?BP6.boss.area:1):1;v+=BP_AWARE.arch*Math.min(1.5,T.arch[a]/tot*2)*mul;});
  if(T.mons.length){const cov=T.mons.filter(k=>K.some(kit=>p3Beats(kit,MON[k].el))).length/T.mons.length;v+=BP_AWARE.el*cov*(area?BP6.boss.area:1);}
  if(T.boss&&T.boss.el.length&&K.some(k=>p3Beats(k,T.boss.el)))v+=BP_AWARE.el*BP_AWARE.boss*(boss?BP6.boss.el:1);
  const ov=BP6.overlap[mode]||0;if(ov&&prev)prev.forEach(p=>{v-=ov*set.filter(c=>p.includes(c.id)).length;});
  return v;}
// greedy fill, then swap passes; fixed heroes stay in
function p6Search(X,sc,fixed){const all=X.all;let set=(fixed||[]).slice();const lock=new Set(set);
  while(set.length<X.size){let b=null;all.forEach(c=>{if(set.includes(c))return;const s=sc(set.concat(c));if(!b||s>b.s)b={c,s};});if(!b)break;set.push(b.c);}
  for(let pass=0;pass<3;pass++){let imp=false;for(let i=0;i<set.length;i++){if(lock.has(set[i]))continue;let cur=sc(set);
    all.forEach(c=>{if(set.includes(c))return;const t=set.slice();t[i]=c;const v=sc(t);if(v>cur+1e-6){set=t;cur=v;imp=true;}});}if(!imp)break;}
  return set;}
// placement: the vanguard is who fights (tank, healer, the best damage dealer for this formation); the rearguard swaps in when
// someone falls or tires, so it holds the backup healer and tank first
function p6Place(set,X,mode,train){const R=c=>X.R[c.id],by=(a,b)=>X.pw[b.id]-X.pw[a.id],rest=set.slice().sort(by),front=[],take=c=>{if(!c)return;rest.splice(rest.indexOf(c),1);front.push(c);};
  const T=X.T,tr=new Set(train||[]);
  if(mode==='train'){take(rest.find(c=>R(c).tank&&!tr.has(c)));take(rest.find(c=>R(c).heal&&!tr.has(c)));take(rest.find(c=>tr.has(c)));}
  else{take(rest.find(c=>R(c).tank));take(rest.find(c=>R(c).heal&&!R(c).tank)||rest.find(c=>R(c).heal));
    const dm=rest.filter(c=>R(c).dmg),ans=c=>(T.boss&&T.boss.el.length&&p3Beats(R(c).k,T.boss.el)?2:0)+Object.keys(T.arch).filter(a=>p3Answer(R(c).k,a)).length*.5;
    take(mode==='boss'&&dm.length?dm.slice().sort((a,b)=>ans(b)-ans(a)||by(a,b))[0]:dm[0]);}
  while(front.length<3&&rest.length)take(rest[0]);
  const back=rest.sort((a,b)=>(mode==='train'?(tr.has(b)?1:0)-(tr.has(a)?1:0):0)||(R(b).heal?1:0)-(R(a).heal?1:0)||(R(b).tank?1:0)-(R(a).tank?1:0)||by(a,b));
  return front.concat(back);}
// reasons: the 3.4 answers first, then the hero's role in this formation
function p6Why(set,X,mode,train){const base=p3Reasons(set,X.T),out={},tr=new Set((train||[]).map(c=>c.id)),seen={tank:0,heal:0};
  set.forEach((c,i)=>{const r=X.R[c.id],L=(base[c.id]||[]).filter(t=>t!=='strong with the gear you own');
    if(r.tank&&seen.tank++&&!L.includes('tank'))L.push(i<3?'second tank':'backup tank for the swap');
    if(r.heal&&seen.heal++&&!L.includes('healer'))L.push(i<3?'second healer':'backup healer for the swap');
    if(!L.length)L.push(r.sup?'support: buffs and wards the vanguard':r.dmg?'damage dealer':'steady all rounder');
    if(tr.has(c.id)){const gap=X.top-c.lv,pct=Math.round((xpCatchMul(c.lv,X.top,i<3)-1)*100);L.unshift(`training: Lv ${c.lv}, ${gap} behind your top wayfarer, +${pct}% catch up XP`);}
    else if(mode==='train'&&(r.tank||r.heal)&&i<3)L.push('keeps the trainees safe');
    out[c.id]=L.slice(0,3);});
  return out;}
function p6Info(set,X){const R=set.map(c=>X.R[c.id]),els=new Set();set.forEach(c=>c.el.forEach(e=>els.add(e)));
  return {els:els.size,heal:R.filter(r=>r.heal).length,tank:R.filter(r=>r.tank).length,pr:R.filter(r=>r.pr).length,de:R.filter(r=>r.de).length,sup:R.filter(r=>r.sup).length,dmg:R.filter(r=>r.dmg).length,
    lv:set.length?Math.round(set.reduce((a,c)=>a+c.lv,0)/set.length):0,pw:set.reduce((a,c)=>a+X.pw[c.id],0)};}
// the training team (v0.8.1, the owner's rule): the lowest levels on the roster, full stop. The only exception is a role nobody that low
// can fill (a tank, a healer): then the lowest level hero who has that role comes along. Everyone below the top by BP6.train.gap trains.
function p6Train(X,jit){if(X.size<3)return null;const R=c=>X.R[c.id],lvk=jit?c=>c.lv+jit.amp*p6Noise(c.id,'train'+jit.n,jit.a):c=>c.lv,asc=X.all.slice().sort((a,b)=>lvk(a)-lvk(b)||X.pw[b.id]-X.pw[a.id]);
  if(!asc.some(c=>X.top-c.lv>=BP6.train.gap))return null;
  let set=asc.slice(0,X.size);const anchors=[];
  ['tank','heal'].forEach(role=>{if(set.some(c=>R(c)[role]))return;const fill=asc.find(c=>R(c)[role]&&!set.includes(c));if(!fill)return;
    // drop the highest level hero who is not the only holder of a role the team already has
    const drop=set.slice().reverse().find(c=>!anchors.includes(c)&&!['tank','heal'].some(r=>R(c)[r]&&set.filter(x=>R(x)[r]).length===1));
    if(!drop)return;set=set.filter(c=>c!==drop).concat(fill);anchors.push(fill);});
  const trainees=set.filter(c=>!anchors.includes(c)&&X.top-c.lv>=BP6.train.gap);if(!trainees.length)return null;
  return {set:set.sort((a,b)=>a.lv-b.lv),trainees,anchors};}
const P6_NAMES={bal:'Balanced',boss:'Boss ready',area:'Area answer',mix:'Fresh mix',rot:'Rotation',train:'Training team'};
function p6Summary(o,X,first){const T=X.T,nm=c=>esc(c.name);
  if(o.key==='bal')return 'One of every role first (tank, healer, damage, support, Primer and Detonator), every delivery and a spread of elements. Level and gear only settle ties.'+(X.shuf&&X.shuf.bal?' (Another take: near-best heroes trade places.)':'');
  if(o.key==='boss'){const els=T.boss.el.length?ELK.filter(e=>matchup(e,T.boss.el)>1).map(e=>EL[e]):[];
    return `Built to bring down ${p3BossName(T.boss)}${els.length?`: ${els.slice(0,3).join(', ')} attacks hit it hard`:''}${T.boss.ty.length?`, with answers to its ${T.boss.ty.map(a=>ARCH[a].n.toLowerCase()).join(' and ')} side`:''}. The answer sits in the vanguard.`;}
  if(o.key==='area'){const a=Object.keys(T.arch).filter(k=>T.mons.some(m=>tyOf(MON[m].art).includes(k)));
    return a.length?`Built for ${esc(ZS(T.s).n)}: answers to the ${a.map(k=>ARCH_PL[k]).join(', ')} here and their elements.`:`Built for ${esc(ZS(T.s).n)}. Little is known about its monsters yet: every fight fills the Bestiary and sharpens this pick.`;}
  if(o.key==='mix'){const sh=o.set.filter(c=>first.includes(c.id)).length;return `Different faces in the same roles, so more of your wayfarers see battle and grow. Shares ${sh} of 6 with Balanced.${(X.shuf&&X.shuf.mix)?' (Another take.)':''}`;}
  if(o.key==='rot')return 'The same roles again with the heroes the other formations left in reserve, so everyone keeps up.';
  if(o.key==='train')return `Your lowest levels train together: ${o.trainees.map(c=>`${nm(c)} (Lv ${c.lv})`).join(', ')}${o.anchors.length?`, with ${o.anchors.map(c=>`${nm(c)} (Lv ${c.lv})`).join(' and ')} along to fill a role nobody lower can`:''}. Catch up XP is measured against your top wayfarer (Lv ${X.top}): the further behind, the more XP, up to +${Math.round(XPCU.max*100)}% in the vanguard and +${Math.round(XPCU.max*XPCU.bench*100)}% in the rearguard.`;
  return '';}
// v0.8.x shuffle: pressing the selected Balanced or Fresh mix chip again asks for another take. P.shuf[key] counts the presses; counter 0
// is exactly the plain suggestion. Counter n>0 re-runs the search with a small, seeded per hero jitter (so near-best heroes trade places,
// deterministic for a given counter) and skips every six already shown by this key (P.hist) and the six it must differ from (avoid).
const P6_SHUF={bal:.55,mix:.9};
function p6Noise(id,k,a){let h=2166136261;const t=id+'|'+k+'|'+a;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return (h>>>0)/4294967296-.5;}
const p6Key=set=>set.map(c=>c.id).sort().join();
function p6Variant(X,key,n,sc,hist,avoid){const seen=new Set((avoid||[]).concat(hist.slice(0,1)));let set=null;
  for(let k=1;k<=n;k++){
    if(hist[k]){seen.add(hist[k]);continue;}
    let got=null;
    for(let a=0;a<14&&!got;a++){const amp=P6_SHUF[key]*(1+a*.25),sj=s=>sc(s)+s.reduce((v,c)=>v+amp*p6Noise(c.id,key+k,a),0),t=p6Search(X,sj);if(t.length&&!seen.has(p6Key(t)))got=t;}
    if(!got){// jitter found nothing new: the best unseen one hero swap of the plain suggestion
      const base=p6Search(X,sc);let b=null;for(let i=0;i<base.length;i++)X.all.forEach(c=>{if(base.includes(c))return;const t=base.slice();t[i]=c;if(seen.has(p6Key(t)))return;const v=sc(t);if(!b||v>b.v)b={t,v};});
      got=b?b.t:null;}
    if(!got){hist.length=1;seen.clear();(avoid||[]).forEach(x=>seen.add(x));seen.add(hist[0]);return null;}// nothing else exists
    hist[k]=p6Key(got);seen.add(hist[k]);set=got;}
  return set||(hist[n]?hist[n].split(',').map(id=>G.roster[id]):null);}
function bestParty(shuf,hist0){const keep=P3C;if(!P3C)P3C={why:{},kit:{}};
  try{const X=p6Ctx(),opts=[],sets=[];
    const add=(key,set,extra)=>{if(!set||!set.length)return;const ids0=set.map(c=>c.id).sort().join();
      const same=opts.find(o=>o.set.map(c=>c.id).sort().join()===ids0);if(same&&key!=='train'){same.also=(same.also||[]).concat(P6_NAMES[key]);return;}
      const mode=key==='area'?'boss':key,placed=p6Place(set,X,mode,extra&&extra.trainees),o=Object.assign({key,name:P6_NAMES[key],set:placed},extra||{});
      o.ids=placed.map(c=>c.id);o.why=p6Why(placed,X,mode,o.trainees);o.info=p6Info(placed,X);opts.push(o);sets.push(o.ids);};
    shuf=shuf||{};X.shuf=shuf;const hist=hist0||{};
    const vary=(key,sc,avoid)=>{const n=shuf[key]|0,h=hist[key]=hist[key]||[];if(!h.length)h[0]=p6Key(p6Search(X,sc));
      if(n<1)return p6Search(X,sc);const v=p6Variant(X,key,n,sc,h,avoid);if(v)return v;shuf[key]=0;return p6Search(X,sc);};// no other six exists: back to the plain one
    add('bal',vary('bal',s=>p6Score(s,X,'bal')));
    const bk=X.T.boss?'boss':'area';add(bk,p6Search(X,s=>p6Score(s,X,'boss',sets.slice(0,1))));
    add('mix',vary('mix',s=>p6Score(s,X,'mix',sets.slice(0,1)),[sets[0].slice().sort().join()]));
    let tr=p6Train(X);const tn=shuf.train|0,th=hist.train=hist.train||[];if(tr&&!th.length)th[0]=p6Key(tr.set);
    if(tr&&tn>0){// Training team shuffle: the same rule (lowest levels plus a tank and healer anchor) with a seeded level jitter, skipping sixes already shown
      const seen=new Set(th.slice(0,tn));let got=null;for(let a=0;a<14&&!got;a++){const t=p6Train(X,{n:tn,a,amp:1.5+a*.75});if(t&&!seen.has(p6Key(t.set)))got=t;}
      if(got){th[tn]=p6Key(got.set);tr=got;}else{th.length=1;shuf.train=0;}}
    if(tr)add('train',tr.set,{trainees:tr.trainees,anchors:tr.anchors});
    // fewer than three different sixes (Boss ready matched Balanced, nobody to train): a Rotation gives the heroes who sat out a turn
    if(opts.length<3&&X.all.length>X.size)add('rot',p6Search(X,s=>p6Score(s,X,'rot',sets.slice())));
    const first=opts[0]?opts[0].ids:[];opts.forEach(o=>{o.sum=p6Summary(o,X,first);o.rel=opts[0]&&opts[0].info.pw?Math.round(o.info.pw/opts[0].info.pw*100):100;delete o.set;});
    const P={opts,pick:0,T:X.T,top:X.top,noTrain:!tr,shuf,hist};return p6Sel(P,0);}
  finally{P3C=keep;}}
function p6Sel(P,j){const o=P.opts[j]||P.opts[0];if(!o)return Object.assign(P,{ids:[],why:{},info:{els:0,heal:0,tank:0,pr:0,de:0,sup:0,dmg:0}});P.pick=P.opts.indexOf(o);P.ids=o.ids;P.why=o.why;P.info=o.info;P.key=o.key;return P;}
function mBestParty(m){const P=m.plan,o=P.opts[P.pick]||{},cur=new Set(G.party),same=P.ids.length===G.party.length&&P.ids.every(id=>cur.has(id)),I=P.info,T=P.T||p3Threats(),W=P.why||{};
  const row=(id,i)=>{const c=G.roster[id];return `<div class="row ${cur.has(id)?'':'upg'}">${port(id,'sm')}<div class="grow"><b>${esc(c.name)}</b> <small>Lv ${c.lv} ${CLS[TPL[id].cls].n}</small><span class="els">${c.el.map(ico).join('')}</span><small class="p3bpwhy">${esc(c.name)}: ${(W[id]||[]).join('; ')}</small></div><small>${cur.has(id)?(G.party.indexOf(id)<3)===(i<3)?'Keeps place':i<3?'<span class="up">To the front</span>':'To rearguard':'<span class="up">Joins</span>'}</small></div>`;};
  const chips=`<div class="chips bp6f" role="group" aria-label="Formations">${P.opts.map((x,j)=>`<button class="chip ${j===P.pick?'on':''}" data-act="bpPick" data-arg="${j}" aria-pressed="${j===P.pick}">${x.name}</button>`).join('')}</div>`;
  const out=G.party.filter(id=>!P.ids.includes(id));
  return box('Build party',`<p class="note">Formations built on role balance first (tank, healer, damage, support, Primer, Detonator, every delivery and element) and on what your Bestiary knows about the road ahead. Level and gear count, but only a little. Pick one:</p>${chips}
    <p class="note bp6hint"><small>Press the selected formation again for another take.</small></p>
    ${P.noTrain?`<p class="note"><small>Training team: nobody is ${BP6.train.gap} or more levels behind your top wayfarer right now.</small></p>`:''}
    <p class="note bp6sum"><b>${esc(o.name||'')}.</b> ${o.sum||''}${o.also?` <small>(${o.also.join(' and ')} would pick the same six.)</small>`:''}</p>${p3ThreatLine(T)}
    <p class="note nums">Average Lv ${I.lv} · Power ${o.rel||100}% of Balanced · Tanks ${I.tank} · Healers ${I.heal} · Damage ${I.dmg} · Support ${I.sup} · Primers ${I.pr} · Detonators ${I.de} · Elements ${I.els}/8</p>
    <h4>Vanguard <small>(fights)</small></h4><div class="rows">${P.ids.slice(0,3).map(row).join('')}</div>
    ${P.ids.length>3?`<h4>Rearguard <small>(swaps in when someone falls or tires)</small></h4><div class="rows">${P.ids.slice(3).map((id,i)=>row(id,i+3)).join('')}</div>`:''}
    ${out.length?`<p class="note">Going to the reserves: ${out.map(id=>esc(G.roster[id].name)).join(', ')}.</p>`:''}
    ${same&&P.ids.every((id,i)=>G.party[i]===id)?'<p class="note">This is already your party, in this order.</p>':''}${!same&&!inTown()?'<p class="note warn">Changing who is in your six happens in town. You can apply it there.</p>':''}${p3GapsHtml(P.ids,T,false)}`,
    `<button class="btn gold" data-act="bpApply" ${!same&&!inTown()?'disabled':''}>Apply ${esc(o.name||'')}</button><button class="btn" data-act="xBack">Cancel</button>`);}
{const bo0=ACT.bpOpen;ACT.bpOpen=function(){if(!G||G.daily)return;return bo0.apply(this,arguments);};}
{const sw0=ACT.p3Swap;ACT.p3Swap=function(){const m=V.modal,key=m&&m.type==='bp'&&m.plan?m.plan.key:null;const r=sw0.apply(this,arguments);
  try{const n=V.modal;if(key&&n&&n.type==='bp'&&n.plan&&n.plan.opts){const j=n.plan.opts.findIndex(o=>o.key===key);if(j>=0){p6Sel(n.plan,j);render();}}}catch(e){}return r;};}

// ----- 4. Equip best: reserves (heroes outside the party, spare gear only) -----
const P6_CAMP='Reserves';
function autoCamp(){if(!G||G.daily)return;const party=G.party.slice(),camp=Object.keys(G.roster).filter(id=>!party.includes(id));
  if(!camp.length){toast('No reserves: every wayfarer you have is in your party.');return;}
  const snap=snapAuto(),before={};Object.values(G.roster).forEach(c=>{before[c.id]={eq:Object.assign({},c.eq),comp:(compOf(c)||{}).id||null,pw:loadoutScore(c,c.S)};});
  // gear: the pack plus what the reserves already wear; the party is neither planned for nor taken from
  applyGear(planGear(camp,[],true));Object.values(G.roster).forEach(refresh);
  // companions: only ones not walking with a party member
  const free=(G.tamed||[]).filter(o=>!o.with||!party.includes(o.with)),pairs=[];
  free.forEach(o=>camp.forEach(id=>pairs.push({o,id,g:compGainFor(o,G.roster[id])})));
  const dO=new Set(),dC=new Set(),map=new Map();pairs.sort((a,b)=>b.g-a.g).forEach(p=>{if(p.g<=.01||dO.has(p.o.id)||dC.has(p.id))return;dO.add(p.o.id);dC.add(p.id);map.set(p.o.id,p.id);});
  free.forEach(o=>{if(map.has(o.id))o.with=map.get(o.id);else if(o.with&&camp.includes(o.with))o.with=null;});
  Object.values(G.roster).forEach(refresh);
  const rows=[];Object.values(G.roster).forEach(c=>{const b=before[c.id],ch=[];
    GSLOTS.forEach(sl=>{if((b.eq[sl]||null)!==(c.eq[sl]||null))ch.push({sl,from:b.eq[sl]||null,to:c.eq[sl]||null});});
    const nc=(compOf(c)||{}).id||null;if(ch.length||nc!==b.comp)rows.push({id:c.id,name:c.name,inParty:party.includes(c.id),ch,comp:nc!==b.comp?{from:b.comp,to:nc}:null,pw0:b.pw,pw1:loadoutScore(c,c.S)});});
  saveGame();sfx('equip');V.modal={type:'autoEq',rows,snap,mode:'camp',from:V.modal};render();}
{const ma0=mAutoEq;mAutoEq=function(m){let h=ma0.apply(this,arguments);if(typeof h!=='string')return h;h=h.split('<small>(roster)</small>').join('<small>(reserve)</small>');
  if(m&&m.mode==='camp'){h=h.replace(/<h2>[^<]*<\/h2>/,`<h2>Equip best: ${P6_CAMP.toLowerCase()}</h2><p class="note p6camp">Only spare gear from your pack and what your reserves already wear. Your party's gear and companions were not touched.</p>`);
    if(!(m.rows||[]).length)h=h.replace(/<p>Everyone already[^<]*<\/p>/,'<p>Every reserve already has the best spare gear for their class.</p>');}
  return h;};}
{const ve0=vEquipTab;vEquipTab=function(){let h=ve0.apply(this,arguments);try{if(!G||G.daily||typeof h!=='string')return h;
  h=h.replace('<h4>Roster</h4>',`<h4>${P6_CAMP}</h4>`);
  const camp=Object.keys(G.roster).some(id=>!G.party.includes(id));
  h=h.replace(/(<button class="btn" data-act="autoEqAll"[^>]*>[^<]*<\/button>)/,`$1<button class="btn" data-act="autoEqCamp" ${camp?'':'disabled'} title="Your reserves (heroes not in your party) get the best spare gear from the pack. Never takes anything from your party.">Equip best: reserves</button>`);}catch(e){}return h;};}
Object.assign(ACT,{bpPick(j){const m=V.modal;if(!m||m.type!=='bp'||!m.plan||!m.plan.opts)return;j=+j||0;const P=m.plan,o=P.opts[j];
    // the chip that is already selected: Balanced, Fresh mix and Training team give another take (P.shuf counter), the rest stay as they are
    if(o&&j===P.pick&&(o.key==='bal'||o.key==='mix'||o.key==='train')){const shuf=Object.assign({},P.shuf),hist=Object.assign({},P.hist);shuf[o.key]=(shuf[o.key]|0)+1;
      if(o.key==='bal'){shuf.mix=0;delete hist.mix;}// Fresh mix is built against Balanced: start it over
      const N=bestParty(shuf,hist),k=N.opts.findIndex(x=>x.key===o.key);if(k>=0){p6Sel(N,k);m.plan=N;}sfx('blip');render();return;}
    p6Sel(P,j);sfx('blip');render();},autoEqCamp(){autoCamp();}});

// ----- styles: the Epic tag (ui.js isEpic/epicTag) and the formation chips -----
try{const st=document.createElement('style');st.textContent=`.card.hero.epic,button.mini.epic,.btile.epic{position:relative;border-color:#b06aff;box-shadow:inset 0 0 0 2px #d2a8ff,0 0 8px rgba(176,106,255,.45);overflow:visible}
.card.hero.epic>.epictag,button.mini.epic>.epictag,.btile.epic>.epictag{position:absolute;left:6px;top:-9px;z-index:3;padding:0 6px;font:900 .52rem/1.3 var(--fb);letter-spacing:.12em;color:#140a1e;background:linear-gradient(180deg,#e2c4ff,#a868f0);border:2px solid #140a1e}
.cname .epictag{display:inline-block;vertical-align:middle;padding:0 6px;font:900 .55rem/1.4 var(--fb);letter-spacing:.12em;color:#140a1e;background:linear-gradient(180deg,#e2c4ff,#a868f0);border:2px solid #140a1e}
.bp6f{margin:.4em 0}.bp6sum{margin:.3em 0}`;document.head.appendChild(st);}catch(e){}

// ----- test hook (our own object; window.__A is not touched) -----
window.__P6={bestParty:()=>bestParty(),autoCamp,p6Sel,isLeg:id=>isLeg(id),isEpic:id=>isEpic(id),heroTag:id=>heroTag(id),get BP6(){return BP6;},
  role:id=>{const keep=P3C;P3C={why:{},kit:{}};try{const r=p6Role(G.roster[id]);return {tank:r.tank,heal:r.heal,sup:r.sup,dmg:r.dmg,pr:r.pr,de:r.de,cls:r.cls};}finally{P3C=keep;}}};
