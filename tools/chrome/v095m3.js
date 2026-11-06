// Beta v0.9.5 menus, item 3: one Upgrade button per gear slot. For every party hero and slot, at several purses and material stocks,
// the step the Upgrade button offers is checked against a brute force that really performs every single next step on a copy of the
// journey (equip a spare, buy, forge, temper the worn piece with or without buying missing materials, Echoforge) and measures the
// hero's gear score: the pick must be the best gain the player can pay for (the cheaper on a tie). Then the button is pressed and gold,
// materials and the equipped piece must match what the brute force got for that step. Also: away from town only the pack counts,
// Show all options opens the full lists (and comes back), the hero sheet and the Smithy carry the buttons, Upgrade whole party stays.
// Usage: PWHTML=../../out/aurelis3.html node v095m3.js
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{hints:false,music:0,sfx:0,enc:'off'}}));`});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;G.stage=1;G.cleared[0]=1;
  ['brann','sable'].forEach(id=>{if(!G.roster[id]){G.roster[id]=A.newChar(id,8,0);G.party.push(id);}});Object.values(G.roster).forEach(c=>{c.lv=Math.max(c.lv,8);A.TW.get('refresh')(c);});A.render();});
// the brute force and the checks run in the page
await ev(()=>{const A=__A,T=k=>A.TW.get(k);
  window.__BF={
    snap(){return JSON.stringify(A.G);},
    restore(s){const o=JSON.parse(s),G=A.G;Object.keys(G).forEach(k=>delete G[k]);Object.assign(G,o);Object.values(G.roster).forEach(c=>T('refresh')(c));},
    score(c){return T('loadoutScore')(c,c.S);},
    // every single next step for one hero and slot, performed for real; town: whether shops count
    steps(cid,sl,town){const G=A.G,c0=G.roster[cid],S0=this.snap(),out=[],slotOk=(c,id)=>{const g=T('gearOf')(id);return !!g&&g.slot===sl&&T('canEquip')(c,id)&&(!g.only||g.only===c.id);};
      const run=(k,id,f)=>{const c=G.roster[cid],b=this.score(c),g0=G.gold,m0=Object.assign({},G.mats);let ok=false;try{ok=f(c);}catch(e){ok=false;}
        if(ok){const c1=G.roster[cid];T('refresh')(c1);const used={};Object.keys(m0).concat(Object.keys(G.mats)).forEach(m=>{const d=(m0[m]||0)-(G.mats[m]||0);if(d)used[m]=d;});
          out.push({k,id,gain:this.score(c1)-b,spent:g0-G.gold,used,matN:Object.values(used).filter(v=>v>0).reduce((a,v)=>a+v,0),eq:c1.eq[sl],gold:G.gold,mats:JSON.stringify(Object.fromEntries(Object.entries(G.mats).filter(([,v])=>v))),gear:G.gear.slice().sort().join()});}
        this.restore(S0);};
      [...new Set(G.gear)].filter(id=>slotOk(c0,id)).forEach(id=>run('pack',id,c=>{T('equipGear')(c,id);return c.eq[sl]===id;}));
      if(town){
        const shop=[...new Set(T('shopStock')('weapons').concat(T('shopStock')('armor'),T('shopStock')('charms')))].filter(id=>A.GEAR[id]&&slotOk(c0,id));
        shop.forEach(id=>run('buy',id,c=>{const p=A.GEAR[id].price;if(G.gold<p)return false;G.gold-=p;G.gear.push(id);T('equipGear')(c,id);return c.eq[sl]===id;}));
        T('RECIPES').forEach((r,i)=>{if(!r.id||!T('recipeOpen')(r)||!slotOk(c0,r.id))return;run('forge',r.id,c=>{if(!T('craft')(r))return false;T('equipGear')(c,r.id);return c.eq[sl]===r.id;});});
        const cw=G.roster[cid];if(cw.eq[sl]&&T('forgeCost')(cw.eq[sl]))run('temper',T('forgeCost')(cw.eq[sl]).next,c=>{const fc=T('forgeCost')(c.eq[sl]);if(!T('hasMats')(fc.m)){const P=T('buyPlan')(fc.m);if(!P.ok||!P.any||G.gold<P.gold+fc.gold)return false;if(!T('doBuyPlan')(P))return false;}return !!T('forge')('eq',{cid,slot:sl});});
        if(sl==='w')Object.keys(T('ECHOFORGE')).forEach(f=>{const c2=G.roster[cid],worn=c2.eq.w&&T('baseIdOf')(c2.eq.w)==='w_'+f+'_5';if(!T('efBaseIn')(f)&&!worn)return;
          run('ef','w_'+f+'_ef',c=>{if(!T('efBaseIn')(f)||(worn&&T('plusOf')(c.eq.w)>T('efBaseIn')(f).plus))T('unequipGear')(c,'w');const n=G.gear.length;A.ACT.efForge(f);A.V.modal=null;const id=G.gear.find(x=>String(x).startsWith('w_'+f+'_ef'));if(!id)return false;T('equipGear')(c,id);return c.eq.w===id;});});}
      const K=['pack','buy','forge','temper','ef'];
      return out.filter(o=>o.gain>.01).sort((a,b)=>(b.gain-a.gain)||(a.spent-b.spent)||(a.matN-b.matN)||(K.indexOf(a.k)-K.indexOf(b.k)));},
    // the Upgrade pick against the brute force, then press it and compare the outcome
    check(cid,sl,press){const G=A.G;this.restore(this.snap());// both sides start from the same plain copy of the journey
      const eq0=G.roster[cid].eq[sl],town=A.inTown(),bf=this.steps(cid,sl,town),c=G.roster[cid],u=window.__P3.upgBest(c,sl).best,o={cid,sl,town,n:bf.length,eq0,eq1:c.eq[sl]};
      const best=bf[0]||null;o.bf=best&&{k:best.k,id:best.id,gain:+best.gain.toFixed(4),spent:best.spent};o.up=u&&{k:u.k,id:u.id,gain:+u.d.toFixed(4),gold:u.gold};
      const mine=u&&bf.find(x=>x.k===u.k&&(x.id===u.id||(u.k==='ef'&&String(u.id).startsWith(x.id))));
      // same: nothing on both sides, or the picked step really gains what it says, as much as the best, for no more gold
      o.same=!best&&!u||!!(best&&mine&&Math.abs(mine.gain-u.d)<1e-6&&Math.abs(mine.gain-best.gain)<1e-6&&mine.spent<=best.spent);
      if(u&&!o.same)o.alt=bf.slice(0,4).map(x=>x.k+':'+x.id+':'+x.gain.toFixed(3)+':'+x.spent);
      if(press&&u){A.V.modal={type:'upg',cid,sl};A.render();const b=document.querySelector('#modal [data-act="upgDo"]');o.btn=!!b;
        const exp=bf.find(x=>x.k===u.k&&(x.id===u.id||(u.k==='ef'&&String(x.id).startsWith('w_')))&&Math.abs(x.gain-u.d)<1e-6);
        if(b)b.click();const c1=G.roster[cid];
        o.after={eq:c1.eq[sl],gold:G.gold,mats:JSON.stringify(Object.fromEntries(Object.entries(G.mats).filter(([,v])=>v))),gear:G.gear.slice().sort().join()};
        o.match=!!exp&&exp.eq===o.after.eq&&exp.gold===o.after.gold&&exp.mats===o.after.mats&&exp.gear===o.after.gear;if(!o.match)o.exp=exp&&{eq:exp.eq,gold:exp.gold,mats:exp.mats};}
      return o;}};});
const setup=(gold,rich,extra)=>ev(([gold,rich,extra])=>{const A=__A,G=A.G;G.gold=gold;Object.keys(G.mats).forEach(k=>G.mats[k]=0);G.pbuy={};
  if(rich)['copper','iron','oak','ash','fang','hide','ichor','scale','grit','bluecap','healroot',A.TW.get('ZS')(G.stage).mat].forEach(k=>G.mats[k]=rich);
  G.gear=['w_blade_0','w_staff_0','a_mail_0','a_robe_0','k_cape_0','c_vital'].concat(extra||[]);
  Object.values(G.roster).forEach(c=>{c.eq={w:null,a:null,c:null,k:null};});
  const P=G.party.map(id=>G.roster[id]);P[0].eq.w='w_blade_0';P[1].eq.a='a_robe_0';P[2].eq.k='k_cape_0';Object.values(G.roster).forEach(c=>A.TW.get('refresh')(c));A.V.modal=null;A.render();},[gold,rich,extra]);
const res=[];const fails=[];
for(const [gold,rich,label] of [[60,0,'poor, no materials'],[400,0,'some gold'],[400,3,'some gold and materials'],[5000,6,'rich'],[200000,9,'very rich']]){
  await setup(gold,rich);
  const party=await ev(()=>__A.G.party.slice());
  for(const cid of party)for(const sl of ['w','a','c','k']){const r=await ev(([cid,sl])=>window.__BF.check(cid,sl,false),[cid,sl]);res.push(r);if(!r.same)fails.push(label+' '+JSON.stringify(r));}
}
console.log('compared',res.length,'hero slots;',res.filter(r=>r.up).length,'with a step; kinds',JSON.stringify(res.filter(r=>r.up).reduce((o,r)=>(o[r.up.k]=(o[r.up.k]||0)+1,o),{})));
chk('Upgrade picks the brute force best step for every hero and slot (5 purses)',fails.length===0||fails.slice(0,4).join('\n'));
// temper with materials bought on the spot, and an Echoforge case
// a hero already in the best weapon the town has (forged +1): tempering it to +2 is the best step; only the realm relic is in the pack,
// so the Smithy's ore and parts are bought on the spot
await setup(200000,0);
const tb=await ev(()=>{const A=__A,G=A.G,T=k=>A.TW.get(k),o={};
  for(const cid of G.party){const c=G.roster[cid],w=T('shopStock')('weapons').filter(id=>T('canEquip')(c,id)).sort((a,b)=>A.GEAR[b].tier-A.GEAR[a].tier)[0];if(!w)continue;
    c.eq.w=w+'+1';T('refresh')(c);const fc=T('forgeCost')(c.eq.w);if(!fc)continue;const rel=T('ZS')(G.stage).mat;G.mats[rel]=(fc.m[rel]||0);
    const t=window.__P3.upgOpts(c,'w').find(x=>x.k==='temper');o.cid=cid;o.t=t&&{ok:t.ok,buy:!!t.buy,gold:t.gold,base:fc.gold};break;}
  o.r=o.cid&&window.__BF.check(o.cid,'w',true);return o;});
console.log(JSON.stringify(tb));
chk('temper buys the missing ore and parts from the Smithy as part of the step',tb.t&&tb.t.ok&&tb.t.buy&&tb.t.gold>tb.t.base||JSON.stringify(tb));
chk('tempering is the pick there, matches the brute force and the outcome',tb.r&&tb.r.up&&tb.r.up.k==='temper'&&tb.r.same&&tb.r.match||JSON.stringify(tb.r));
await ev(()=>{const A=__A,G=A.G,f=Object.keys(A.TW.get('ECHOFORGE'))[0];G.gear.push('w_'+f+'_5');const m=A.TW.get('efCost')(f);Object.keys(m).forEach(k=>G.mats[k]=(G.mats[k]||0)+m[k]);window.__EF=f;});
const ef=await ev(()=>{const A=__A,G=A.G,f=window.__EF,o={};const c=G.party.map(id=>G.roster[id]).find(c=>A.TW.get('canEquip')(c,'w_'+f+'_ef'));o.cid=c&&c.id;
  if(!c)return o;o.opt=window.__P3.upgOpts(c,'w').some(x=>x.k==='ef'&&x.ok);o.r=window.__BF.check(c.id,'w',true);return o;});
console.log(JSON.stringify(ef));
chk('Echoforge is one of the steps and the pick matches the brute force',ef.cid&&ef.opt&&ef.r.same||JSON.stringify(ef));
// press the button: gold, materials and gear match the brute force for that step
const presses=[];
for(const [gold,rich] of [[400,3],[5000,6],[200000,9]]){await setup(gold,rich);
  const party=await ev(()=>__A.G.party.slice());
  for(const cid of party.slice(0,3))for(const sl of ['w','a','k']){await setup(gold,rich);const r=await ev(([cid,sl])=>window.__BF.check(cid,sl,true),[cid,sl]);if(r.up)presses.push(r);}}
console.log('pressed',presses.length,'kinds',JSON.stringify(presses.reduce((o,r)=>(o[r.up.k]=(o[r.up.k]||0)+1,o),{})));
const badP=presses.filter(r=>!r.same||!r.btn||!r.match);
chk('pressing Upgrade does that step: gold, materials and gear as the brute force',presses.length>=6&&badP.length===0||JSON.stringify(badP.slice(0,3)));
chk('the pressed steps cover buying and forging (tempering and Echoforge above)',['buy','forge'].every(k=>presses.some(r=>r.up.k===k))||JSON.stringify(presses.map(r=>r.up.k)));
// away from town: only the pack counts
await setup(200000,9);
const far=await ev(()=>{const A=__A,G=A.G,m=A.WS.m,k=m.kind;m.kind='field';const o={town:A.inTown(),bad:[]};
  for(const cid of G.party)for(const sl of ['w','a','c','k']){const r=window.__BF.check(cid,sl,false);if(!r.same)o.bad.push(r);const b=window.__P3.upgBest(G.roster[cid],sl).best;if(b&&b.k!=='pack')o.bad.push('not pack '+b.k);}
  const c=G.roster[G.party[1]];A.V.modal={type:'upg',cid:c.id,sl:'w'};A.render();o.note=/happen in town/.test(document.querySelector('#modal').innerText);
  A.ACT.upgAll();o.all=A.V.modal.type;A.ACT.xBack();o.back=A.V.modal.type;m.kind=k;A.V.modal=null;return o;});
chk('away from town: only spares in the pack, with a note',!far.town&&far.bad.length===0&&far.note||JSON.stringify(far));
chk('away from town: Show all options opens the gear picker and comes back',far.all==='eqPick'&&far.back==='upg'||JSON.stringify(far));
// Show all options in town, the hero sheet, the Smithy
await setup(5000,6);
const ui=await ev(()=>{const A=__A,G=A.G,o={};const c=G.roster[G.party[0]];
  A.V.modal={type:'char',char:c.id,list:G.party.slice()};A.render();o.sheet=document.querySelectorAll('#modal .upgslot [data-act="upgOpen"]').length;
  document.querySelector('#modal .upgslot [data-act="upgOpen"]').click();o.pop=A.V.modal.type;o.ba=!!document.querySelector('#modal .upgba');o.cost=/gold|Free/.test((document.querySelector('#modal .upgcard')||{}).innerText||'');
  A.ACT.upgAll();o.all=A.V.modal.type+':'+A.V.modal.tab;o.full=document.querySelectorAll('#modal [data-act="buyGear"],#modal [data-act="forge"],#modal [data-act="craftR"]').length;
  for(let i=0;i<4&&A.V.modal&&A.V.modal.type!=='upg';i++)A.ACT.xBack();o.back=A.V.modal&&A.V.modal.type;A.ACT.xBack();o.back2=A.V.modal&&A.V.modal.type;
  const t=G.roster[G.party[0]];A.V.modal={type:'upg',cid:t.id,sl:'w'};A.render();A.ACT.upgAll();o.temperTo=A.V.modal.type+':'+A.V.modal.tab;
  A.V.modal={type:'smithy'};A.render();o.smith=document.querySelectorAll('#modal .upgbest [data-act="upgDo"]').length;o.whole=!!document.querySelector('#modal .upgbest [data-act="p3Smith"]');
  o.first=(()=>{const b=document.querySelector('#modal .upgbest'),f=document.querySelector('#modal .shopf');return !!b&&!!f&&!!(b.compareDocumentPosition(f)&Node.DOCUMENT_POSITION_FOLLOWING);})();
  A.V.modal={type:'smithy',tab:'craft'};A.render();o.wholeForge=/Upgrade whole party/.test(document.querySelector('#modal').innerText);
  A.V.modal={type:'workshop',tab:'shop',sec:'charm'};A.render();o.alch=!!document.querySelector('#modal .upgbest');
  const d=G.daily;G.daily=1;A.V.modal={type:'char',char:c.id};A.render();o.daily=document.querySelectorAll('#modal [data-act="upgOpen"]').length;A.V.modal={type:'smithy'};A.render();o.dailyS=document.querySelectorAll('#modal .upgbest').length;G.daily=d;A.V.modal=null;A.render();return o;});
console.log(JSON.stringify(ui));
chk('hero sheet: an Upgrade button on each of the four slots',ui.sheet===4||JSON.stringify(ui));
chk('Upgrade shows the step with before/after stats and the cost',ui.pop==='upg'&&ui.ba&&ui.cost||JSON.stringify(ui));
chk('Show all options opens the full Smithy lists and back returns to Upgrade',/^(smithy|workshop):/.test(ui.all)&&ui.full>0&&ui.back==='upg'||JSON.stringify(ui));
chk('Smithy: best step per slot first, Upgrade whole party kept (Shop and Forge)',ui.smith>0&&ui.whole&&ui.first&&ui.wholeForge||JSON.stringify(ui));
chk('Alchemy charms show the best charm step first',ui.alch||JSON.stringify(ui));
chk('Daily Trial: no Upgrade buttons',ui.daily===0&&ui.dailyS===0||JSON.stringify(ui));
await done(H);})();
