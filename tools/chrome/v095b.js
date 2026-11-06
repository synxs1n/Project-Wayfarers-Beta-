// Beta v0.9.5 battle clarity (owner approved): the simple battle layer, the damage groups, the reaction moment, intent cues.
// 1 weak:   by default each foe shows ONE key weakness on its card and its stage tag, and it is a reaction setup for this party whenever
//           one of its known weaknesses is (random battles, and a built case: a foe primed with an element a hero detonates);
// 2 expert: the Settings toggle "Expert battle info" (META.cfg.expertBattle, off when missing) shows the capped chips (at most two weak,
//           two resist, strongest first) on every card; a tap on the key chip and the i panel show them too;
// 3 groups: damage types read as Physical / Ranged / Magic (and Heal for the Undead), one symbol each; the type line in the i panel and
//           on Scan ("Flying: ranged hits hard.");
// 4 react:  a real detonation: one flash (under 120 ms, both element colours, none under reduced motion), one "✸ Name!" banner clear of
//           every face and of the turn bar, one 'reaction' sound, a camera punch on the target (2D canvas on Low, the GL stage on High),
//           B.nReact counted; the primed badge pulses when the acting hero holds a matching detonator;
// 5 cue:    a telegraphed hit at the acting hero: Guard glows, the header says "Guard!", the foe's stage tag reads "Guard!"; a foe
//           winding up at another hero: "Interrupt: stun or strip buffs"; a stacked Hex: the cleanse is hinted (Items or Skills glows);
// 6 fit:    nothing overflows (page, text, stage labels against labels and sprites) at 344x882, 390x844, 412x812, 705x455, 844x390,
//           933x615, 933x705, 1280x720, simple and expert, with the cues showing. No page errors anywhere.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v095b.js [weak|expert|groups|react|cue|fit]
const {open,chk,done}=require('./pw');const {META,battle,dress,rects,overlaps}=require('./v063lib');const {scene}=require('./v095lib');
const ONLY=process.argv.find(a=>['weak','expert','groups','react','cue','fit'].includes(a));
const SIZES=[[344,882],[390,844],[412,812],[705,455],[844,390],[933,615],[933,705],[1280,720]];
// learn every element weakness of every foe (as hitting with them would)
const LEARN=()=>{const A=__A,B=A.B,M=A.META.best;B.en.forEach(e=>{const b=M[e.base]=M[e.base]||{};b.seen=1;b.hit=1;b.known=b.known||{};Object.keys(A.EL).forEach(el=>{try{if(A.effOf(el,e)!==1)b.known[el]=1;}catch(x){}});});A.render();};
(async()=>{
  // ---------- 1: one key weakness, a reaction setup when there is one ----------
  if(!ONLY||ONLY==='weak'){let n=0,one=0,stg=0,stgN=0,rxBad=[],cases=0;
    for(const [w,h] of [[390,844],[933,705]]){const H=await open({w,h,mobile:w<1000,pre:META('medium')});
      for(let i=0;i<8;i++){const r0=await battle(H,{seed:300+i*17+w,heroes:2+i%5,foes:1+i%5,lv:i%2?22:8});if(r0.mode!=='cmd')continue;
        await H.ev(LEARN);await dress(H,{seed:i+9,maxSt:2,prime:.5,shield:0});await H.wait(150);
        const r=await H.ev(()=>{const A=__A,B=A.B,X=A.B9,out=[];B.en.forEach((e,j)=>{if(e.hp<=0)return;const W=X.weak(e),k=X.key(e);
          const best=Math.max(0,...W.w.filter(x=>x.k==='el').map(x=>X.rx(e,x.id).s));
          const card=[...document.querySelectorAll('#bparty .pgroup.foes .fcw')].find(c=>c.querySelector(`[data-arg="e:${j}"]`));
          const chips=card?[...card.querySelectorAll('.fwk img')].length:-1,stage=document.querySelector(`#bstage .b9wk[data-u="e:${j}"]`);
          out.push({n:e.name,weak:W.w.length,k:k&&(k.k+':'+k.id),ks:k?k.s:0,best,chips,keyBtn:card?card.querySelectorAll('.fwk.b9key').length:0,stage:stage?stage.dataset.k:null,full:card?card.querySelectorAll('.fwk.dn').length:0});});return out;});
        r.forEach(f=>{n++;if(!f.weak){if(f.chips===0)one++;return;}if(f.keyBtn===1&&f.chips===1&&f.full===0&&f.k)one++;stgN++;if(f.stage===f.k)stg++;if(f.ks!==f.best)rxBad.push(`${f.n}: key ${f.k} s${f.ks}, best s${f.best}`);});}
      // the built case: a foe weak to an element one of the heroes detonates with, primed with the matching primer element
      const b=await H.ev(async()=>{const A=__A,B=A.B,X=A.B9,P=X.party();for(const e of B.en){if(e.hp<=0)continue;const W=X.weak(e).w.filter(x=>x.k==='el');
          for(const x of W){if(!P.dt.has(x.id))continue;const p=Object.keys(A.EL).find(p=>X.reactFor(p,x.id));if(!p)continue;e.primed={el:p,t:2,by:'Mira'};A.render();await new Promise(q=>setTimeout(q,80));
            const k=X.key(e),j=B.en.indexOf(e),card=document.querySelector(`#bparty .fcw [data-arg="e:${j}"].b9key`),st=document.querySelector(`#bstage .b9wk[data-u="e:${j}"]`);
            return {k:k&&k.k+':'+k.id,s:k&&k.s,want:'el:'+x.id,card:card&&card.dataset.k,cardRx:!!(card&&card.classList.contains('rx')),stage:st&&st.dataset.k,stRx:!!(st&&st.classList.contains('rx'))};}}return null;});
      if(b){cases++;chk(`${w}x${h}: a foe primed for a detonator the party holds shows that element as its key weakness, marked as a reaction (${JSON.stringify(b)})`,b.k===b.want&&b.s===3&&b.card===b.want&&b.cardRx&&(b.stage==null||b.stage===b.want&&b.stRx));}
      await H.browser.close();}
    chk(`one key weakness per foe on its card (${one} of ${n} foes; none for a foe with nothing known)`,n>10&&one===n);
    chk(`the stage tag shows the same key weakness (${stg} of ${stgN})`,stgN>0&&stg>=stgN*.9);
    chk('the key weakness is a reaction setup whenever one of the known weaknesses is',rxBad.length===0||rxBad.slice(0,4).join(' | '));
    chk('the built reaction case ran',cases>0);}
  // ---------- 2: Expert battle info ----------
  if(!ONLY||ONLY==='expert'){const H=await open({w:933,h:705,pre:META('medium')});await scene(H,{heroes:4,foes:4});
    const r=await H.ev(()=>{const A=__A,B=A.B,X=A.B9,cards=()=>[...document.querySelectorAll('#bparty .pgroup.foes .fcw')].map(c=>({up:[...c.querySelectorAll('.fwk.up img')].length,dn:[...c.querySelectorAll('.fwk.dn img')].length,key:c.querySelectorAll('.fwk.b9key').length}));
      delete A.META.cfg.expertBattle;A.render();const out={def:X.expert(),simple:cards()};A.V.modal={type:'settings'};A.render();const row=[...document.querySelectorAll('.row.b9set')];out.row=row.length&&row[0].textContent.includes('Expert battle info');
      const on=row[0]&&row[0].querySelector('[data-arg=\'["expertBattle",true]\']');if(on)on.click();out.cfg=A.META.cfg.expertBattle;A.V.modal=null;A.render();out.expert=cards();
      // the strongest first: each card's chips are the two highest (lowest) multipliers
      out.order=B.en.filter(e=>e.hp>0).every(e=>{const W=X.weak(e);return W.w.slice(0,2).every((x,i)=>i===0||x.m<=W.w[i-1].m)&&W.r.slice(0,2).every((x,i)=>i===0||x.m>=W.r[i-1].m);});
      out.heroLv=[...document.querySelectorAll('#bparty .pgroup.heroes .pc .ucl')].filter(e=>e.getBoundingClientRect().width>0).length;
      A.META.cfg.expertBattle=false;A.render();out.heroLvSimple=[...document.querySelectorAll('#bparty .pgroup.heroes .pc .ucl')].filter(e=>e.getBoundingClientRect().width>0).length;
      // a tap on the key chip expands that card; the i panel shows the chips and the type line
      const kb=document.querySelector('#bparty .fwk.b9key');const arg=kb&&kb.dataset.arg;if(kb)kb.click();const card=kb&&[...document.querySelectorAll('#bparty .fcw')].find(c=>c.querySelector(`.fc[data-arg="${arg.split(':')[1]}"]`));
      out.tap=card?{up:card.querySelectorAll('.fwk.up img').length,dn:card.querySelectorAll('.fwk.dn img').length,less:!!card.querySelector('.b9less')}:null;
      A.ACT.uInfo(arg);const p=document.querySelector('.udet');out.panel=p?{up:p.querySelectorAll('.b9chips .fwk.up img').length,dn:p.querySelectorAll('.b9chips .fwk.dn img').length,ty:(p.querySelector('.b9ty')||{}).textContent||''}:null;A.ACT.uClose();
      return out;});
    chk(`Expert battle info is off when the setting is missing (${r.def})`,r.def===false);
    chk('Settings has the "Expert battle info" row and it turns the setting on',r.row&&r.cfg===true);
    chk(`simple: one key chip per card, no resist chips (${JSON.stringify(r.simple)})`,r.simple.every(c=>c.up<=1&&c.dn===0&&c.key<=1));
    chk(`expert: the chips are capped at two weak and two resist per foe (${JSON.stringify(r.expert)})`,r.expert.every(c=>c.up<=2&&c.dn<=2&&c.key===0)&&r.expert.some(c=>c.up+c.dn>1));
    chk('expert: strongest multipliers first',r.order);
    chk(`hero cards: level shown in expert (${r.heroLv}), hidden in simple (${r.heroLvSimple})`,r.heroLv>0&&r.heroLvSimple===0);
    chk(`a tap on the key chip shows that card's chips with a way back (${JSON.stringify(r.tap)})`,!!r.tap&&r.tap.up+r.tap.dn>=1&&r.tap.up<=2&&r.tap.dn<=2&&r.tap.less);
    chk(`the i panel shows the capped chips (${JSON.stringify(r.panel)})`,!!r.panel&&r.panel.up+r.panel.dn>=1&&r.panel.up<=2&&r.panel.dn<=2);
    await H.browser.close();}
  // ---------- 3: damage groups and the type line ----------
  if(!ONLY||ONLY==='groups'){const H=await open({w:390,h:844,mobile:true,pre:META('medium',{expertBattle:true})});await battle(H,{heroes:3,foes:3,seed:5,lv:22});
    const r=await H.ev(()=>{const A=__A,B=A.B,X=A.B9,M=A.META.best,out={};const [a,u,f]=B.en;a.ty=['armored'];u.ty=['undead'];f.ty=['flying'];
      [a,u,f].forEach(e=>{const b=M[e.base]=M[e.base]||{};b.known={};delete b.hit;delete b.scan;});A.render();
      const alts=i=>{const c=document.querySelectorAll('#bparty .pgroup.foes .fcw')[i];return c?{up:[...c.querySelectorAll('.fwk.up img.dli')].map(x=>x.alt),dn:[...c.querySelectorAll('.fwk.dn img.dli')].map(x=>x.alt)}:null;};
      out.hidden=alts(0);[a,u,f].forEach(e=>{M[e.base].hit=1;});A.render();out.arm=alts(0);out.und=alts(1);out.fly=alts(2);
      out.all=[...document.querySelectorAll('#bparty .fwk img.dli')].map(x=>x.alt);out.lines=[a,u,f].map(e=>X.typeLine(e));
      A.ACT.uInfo('e:2');out.panel=((document.querySelector('.udet .b9ty')||{}).textContent||'');A.ACT.uClose();
      const n0=B.log.length;const mb=A.META.best[f.base];delete mb.hit;delete mb.scan;A.TW.get('scan')(f);out.scan=B.log.slice(n0);return out;});
    chk(`hidden until the foe type is hit or scanned (${JSON.stringify(r.hidden)})`,!!r.hidden&&!r.hidden.up.length&&!r.hidden.dn.length);
    chk(`armored: weak to Magic, resists Ranged and Physical (${JSON.stringify(r.arm)})`,!!r.arm&&r.arm.up.join()==='Magic'&&r.arm.dn.join()==='Ranged,Physical');
    chk(`undead: weak to Heal (${JSON.stringify(r.und)})`,!!r.und&&r.und.up.includes('Heal'));
    chk(`flying: weak to Ranged (${JSON.stringify(r.fly)})`,!!r.fly&&r.fly.up.includes('Ranged'));
    chk(`only the group symbols on the cards (${[...new Set(r.all)].join(',')})`,r.all.length>0&&r.all.every(x=>['Physical','Ranged','Magic','Heal'].includes(x)));
    chk(`one plain type line ("${r.lines[2]}")`,r.lines[2]==='Flying: ranged hits hard.'&&r.lines.every(l=>/^[A-Z][a-z]+: [^.]+\.$/.test(l)));
    chk(`the i panel carries it ("${r.panel}")`,r.panel==='Flying: ranged hits hard.');
    chk(`Scan logs it (${JSON.stringify(r.scan)})`,r.scan.includes('Flying: ranged hits hard.'));
    await H.browser.close();}
  // ---------- 4: the reaction moment ----------
  if(!ONLY||ONLY==='react')for(const [tier,rm,w,h] of (process.env.RT?JSON.parse(process.env.RT):[['medium',false,390,844],['low',false,933,705],['high',false,844,390],['medium',true,390,844]])){
    const H=await open({w,h,mobile:w<1000,pre:META(tier,rm?{rmotion:true}:{})}),tag=`${w}x${h} ${tier}${rm?' reduced motion':''}`;
    await scene(H,{heroes:4,foes:3});
    const r=await H.ev(async()=>{const A=__A,B=A.B,X=A.B9;let a=B.cur;const e=B.en[0],P=e.primed;if(!P)return {err:'no prime'};
      let s=A.known(a).find(x=>x.role==='det'&&A.skEls(x).some(d=>X.reactFor(P.el,d)));
      // the acting hero may not hold the matching detonator: give the prime one this hero has
      if(!s){s=A.known(a).find(x=>x.role==='det'&&A.skEls(x).length);if(!s)return {err:'no det'};const d=A.skEls(s)[0];const p=Object.keys(A.EL).find(p=>X.reactFor(p,d));e.primed={el:p,t:2,by:'Mira'};}
      a.mp=Math.max(a.mp,s.mp);A.render();await new Promise(q=>setTimeout(q,60));
      const out={pulse:!!document.querySelector('#bstage .primed.pmin.b9rdy'),pulseCard:!!document.querySelector('#bparty .pchip.b9rdy')};
      // no pulse when the acting hero has no MP for it
      const mp=a.mp;a.mp=0;A.render();out.noPulse=!document.querySelector('#bstage .primed.pmin.b9rdy');a.mp=mp;A.render();
      const seen={fl:new Set(),ban:new Set(),flDur:[],banBad:[],banN:0,cam:0,camGL:0,pk:0};const n0=B.nReact||0,s0=X.nSnd;
      const ord=document.getElementById('border').getBoundingClientRect();
      const look=()=>{document.querySelectorAll('#bstage .b9fl').forEach(f=>{seen.fl.add(f.dataset.id);seen.flDur.push(parseFloat(f.style.animationDuration));});
        document.querySelectorAll('#bstage .b9ban').forEach(b=>{seen.ban.add(b.dataset.id);seen.banN++;const q=b.getBoundingClientRect(),st=document.getElementById('bstage').getBoundingClientRect(),sc=A.BL.sc,L=A.b3Lay();
          const R={x:st.left+parseFloat(b.style.left)*sc,y:st.top+parseFloat(b.style.top)*sc,w:parseFloat(b.style.width)*sc,h:parseFloat(b.style.height)*sc},hit=(p,o)=>p.x<o.x+o.w-.5&&p.x+p.w-.5>o.x&&p.y<o.y+o.h-.5&&p.y+p.h-.5>o.y;
          L.bodies.forEach(o=>{if(o.u.hp<=0&&o.u.side==='e')return;const f=o.face,F={x:st.left+f.x*sc,y:st.top+f.y*sc,w:f.w*sc,h:f.h*sc};if(hit(R,F))seen.banBad.push('face '+o.u.name);});
          if(hit(R,{x:ord.left,y:ord.top,w:ord.width,h:ord.height}))seen.banBad.push('turn bar');if(R.y<st.top-1||R.x<st.left-1||R.x+R.w>st.right+1||R.y+R.h>st.bottom+1)seen.banBad.push('outside the stage');
          if(b.scrollWidth>b.clientWidth+1)seen.banBad.push('text cut');});
        const cv=document.getElementById('bcv'),gl=document.getElementById('bgl');const zs=t=>{const m=/scale\(([\d.]+)\)/.exec(t||'');return m?+m[1]:1;};if(zs(cv.style.transform)>1.003)seen.cam++;if(gl&&zs(gl.style.transform)>1.003)seen.camGL++;if(X.CAM.pk)seen.pk++;};
      const mo=new MutationObserver(()=>{document.querySelectorAll('#bstage .b9fl').forEach(f=>{seen.fl.add(f.dataset.id);seen.flDur.push(parseFloat(f.style.animationDuration));});});mo.observe(document.getElementById('bstage'),{childList:true,subtree:true});
      A.setPause(0);B.en.forEach(x=>{x.next=99999;});B.front.concat(B.back).forEach(x=>{if(x!==a)x.next=99999;});
      A.ACT.cmd('skills');A.ACT.sk(s.id);if(B.menu==='target')A.ACT.tgtE(0);
      const t0=performance.now();while(performance.now()-t0<1500){look();await new Promise(q=>requestAnimationFrame(q));}mo.disconnect();
      Object.assign(out,{n:(B.nReact||0)-n0,snd:X.nSnd-s0,fl:seen.fl.size,ban:seen.ban.size,banN:seen.banN,flDur:Math.max(0,...seen.flDur),banBad:[...new Set(seen.banBad)],cam:seen.cam,camGL:seen.camGL,pk:seen.pk,gl:!!document.getElementById('bgl')&&A.BV.glStage,ev:X.cfg.ev.slice(-3)});return out;});
    if(r.err){chk(`${tag}: reaction set up`,r.err);await H.browser.close();continue;}
    chk(`${tag}: the primed badge pulses when the acting hero holds the matching detonator (stage ${r.pulse}, card ${r.pulseCard}), not without the MP`,r.pulse&&r.noPulse);
    chk(`${tag}: one reaction counted in B.nReact (${r.n})`,r.n===1);
    chk(`${tag}: one reaction sound (${r.snd})`,r.snd===1);
    if(rm)chk(`${tag}: no flash under reduced motion (${r.fl}), no camera punch (${r.cam})`,r.fl===0&&r.cam===0);
    else{chk(`${tag}: one flash (${r.fl}), under 120 ms (${r.flDur} ms)`,r.fl===1&&r.flDur>0&&r.flDur<120);
      chk(`${tag}: a camera punch on the target (2D canvas frames ${r.cam}, GL stage frames ${r.camGL}, punch frames ${r.pk}, GL ${r.gl})`,r.cam>0&&(!r.gl||r.camGL>0));}
    chk(`${tag}: one banner (${r.ban}, ${r.banN} frames), clear of every face, the turn bar and the stage edge, text whole`,r.ban===1&&r.banN>3&&r.banBad.length===0||JSON.stringify(r.banBad));
    if(process.argv.includes('shots'))await H.page.screenshot({path:`${__dirname}/shots-v095b/react_${tier}${rm?'_rm':''}_${w}x${h}.png`});
    await H.browser.close();}
  // ---------- 5: intent cues ----------
  if(!ONLY||ONLY==='cue')for(const [w,h] of [[344,882],[933,615]]){const H=await open({w,h,mobile:w<1000,pre:META('medium')}),tag=`${w}x${h}`;
    await scene(H,{heroes:3,foes:3});
    const r=await H.ev(()=>{const A=__A,B=A.B,X=A.B9,a=B.cur,ch=B.en[1],hx=B.en[2],out={};const g=()=>{A.render();const gb=document.querySelector('#bcmd .mi[data-arg="guard"]'),cue=document.querySelector('#bcmd .b9cue');
        return {glow:[...document.querySelectorAll('#bcmd .mi.b9glow')].map(e=>e.dataset.arg),guardTxt:gb&&gb.textContent.trim(),cue:cue&&cue.textContent,cls:cue&&cue.className,tel:[...document.querySelectorAll('#bstage .b5it.b9tel')].map(e=>e.textContent)};};
      out.guard=g();
      // the charge aims at another hero: no Guard for this one, the interrupt hint instead
      const other=B.front.find(c=>c!==a&&c.hp>0);ch.b4slot=B.front.indexOf(other);out.int=g();
      // nothing winding up, a stacked Hex and a Remedy in the bag: the cleanse
      delete ch.st.charge;A.G.inv.remedy=Math.max(1,A.G.inv.remedy||0);const sk0=A.known(a).filter(s=>s.cleanse);sk0.forEach(s=>{s._mp=s.mp;s.mp=9999;});out.hex=g();sk0.forEach(s=>{s.mp=s._mp;});
      // nothing at all
      B.front.forEach(c=>{if(c.st)delete c.st.hex;});out.none=g();return out;});
    chk(`${tag}: a Crushing Charge at the acting hero: Guard glows and reads "Guard!", the header says so (${JSON.stringify(r.guard)})`,r.guard.glow.join()==='guard'&&r.guard.guardTxt==='Guard!'&&/^Guard! /.test(r.guard.cue||''));
    chk(`${tag}: the foe's stage tag reads "Guard!"`,r.guard.tel.length===1&&/Guard!/.test(r.guard.tel[0]));
    chk(`${tag}: the charge at another hero: "Interrupt: stun or strip buffs", no Guard glow (${JSON.stringify(r.int)})`,r.int.cue==='Interrupt: stun or strip buffs'&&!r.int.glow.includes('guard'));
    chk(`${tag}: a stacked Hex: the cleanse is hinted on Items (${JSON.stringify(r.hex)})`,/^Hex 2 on /.test(r.hex.cue||'')&&r.hex.glow.join()==='items');
    chk(`${tag}: no cue and no glow otherwise (${JSON.stringify(r.none)})`,!r.none.cue&&!r.none.glow.length&&r.none.guardTxt==='Guard');
    await H.browser.close();}
  // ---------- 6: nothing overflows ----------
  if(!ONLY||ONLY==='fit')for(const [w,h] of SIZES)for(const ex of [false,true]){const H=await open({w,h,mobile:w<1000,pre:META('medium')}),tag=`${w}x${h} ${ex?'expert':'simple'}`;
    for(const [he,fo,seed] of [[4,3,5],[6,5,11]]){await scene(H,{heroes:he,foes:fo,seed,expert:ex});
      const m=await H.ev(()=>{const out={bad:[]},vis=e=>{const q=e.getBoundingClientRect();return q.width>0&&q.height>0;};const NAME='.uct b,.cmdhead b,.bbn b,.b4o .n,.blog p,.detf,.fl .n';
        document.querySelectorAll('.battle *').forEach(e=>{if(e.closest('#bstage')||e.closest('#bover')||!vis(e)||/^(IMG|CANVAS|svg)$/i.test(e.tagName))return;const txt=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()),btn=e.tagName==='BUTTON';if(!txt&&!btn)return;
          const cs=getComputedStyle(e),overX=e.scrollWidth>e.clientWidth+1,overY=btn&&e.scrollHeight>e.clientHeight+2&&cs.overflowY!=='visible';if(!overX&&!overY)return;if(overX&&!overY&&e.matches(NAME)&&cs.textOverflow==='ellipsis')return;
          out.bad.push((e.className||e.tagName)+' "'+e.textContent.trim().slice(0,24)+'" '+e.scrollWidth+'/'+e.clientWidth);});
        out.docH=document.documentElement.scrollHeight;out.docW=document.documentElement.scrollWidth;out.vw=innerWidth;out.vh=innerHeight;
        const sh=e=>{if(!e)return false;const q=e.getBoundingClientRect();return q.top>=-1&&q.bottom<=innerHeight+1&&q.left>=-1&&q.right<=innerWidth+1;};
        out.prim=[...document.querySelectorAll('#bcmd .menu.prim .mi')].every(sh);out.cue=sh(document.querySelector('#bcmd .b9cue'));
        const hd=document.querySelector('#bcmd .cmdhead'),cu=document.querySelector('#bcmd .b9cue');out.head=hd?Math.round(hd.getBoundingClientRect().height):0;if(cu){cu.style.display='none';out.head0=Math.round(hd.getBoundingClientRect().height);cu.style.display='';}return out;});
      const r=await rects(H),o=overlaps(r);
      chk(`${tag} ${he}h/${fo}f: no page scroll (${m.docW}x${m.docH} in ${m.vw}x${m.vh})`,m.docH<=m.vh+1&&m.docW<=m.vw+1);
      chk(`${tag} ${he}h/${fo}f: no text cut`,m.bad.length===0||m.bad.slice(0,4).join(' | '));
      chk(`${tag} ${he}h/${fo}f: the main commands and the cue on screen, the cue adds no height to the header (${m.head} px, ${m.head0} px without it)`,m.prim&&m.cue&&m.head<=m.head0+1);
      chk(`${tag} ${he}h/${fo}f: no stage label (key weakness and "Guard!" tags included) on another label or a sprite`,o.length===0||o.slice(0,4).join(' | '));}
    await H.browser.close();}
  const H=await open({});await done(H);})();
