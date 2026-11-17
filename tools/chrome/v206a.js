// v0.22.17: the owner's gear, stat, mana and roof notes.
//  1 boots lean by weight: light MAG and MP, medium SPD and HP, heavy DEF and HP; a medium armor class gains more from medium boots than
//    from light boots of the same tier, a caster gains from light boots, a heavy class most from heavy boots
//  2 charms are the Smithy's: its Shop, Forge and Sell tabs have a Charms section with rows, Alchemy has none
//  3 Upgrade whole party plans boots and charms, tempers what a hero already wears (src temper) and Confirm does it
//  4 every planned step and every "Best upgrade for each slot" row that costs something shows its materials and gold as chips
//  5 stats: 2 points a level (a new hero, a level up, an old save's hero is owed the difference once), points beyond the hero's level in one
//    attribute count half, Strength gives HP, Faith healing received, a bow class takes more attack from Dexterity than a Warrior does
//  6 mana: a skill learned late costs more than written (mp0), a level 1 skill the same; 8% MP back after a win; the Mana Tonic gives 40
//  8 (v0.22.19) no 3% floor: a step worth less than 3% is on the Upgrade lists
//  7 HD-2D: every roofed building of a town gets a closed roof under its textured one
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v206a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v206a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:1000,h:640,pre:META,tag:'v206a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(300);
  const a=await ev(()=>{const A=__A,g=A.TW.get,TPL=g('TPL'),gearOf=g('gearOf'),st=id=>['hp','mp','atk','def','mag','res','spd'].filter(k=>gearOf(id)[k]).join('+'),o={l:st('k_bootl_2'),m:st('k_cape_2'),h:st('k_booth_2'),cls:{}};
    const one=cls=>Object.keys(TPL).find(id=>!TPL[id].mon&&TPL[id].cls===cls);['thief','archer','monk','mage','healer','warrior','knight'].forEach(cls=>{const id=one(cls);if(!id)return;const c=g('newChar')(id,12,1);c.eq.k=null;c.S=g('calcStats')(c);
      const d=x=>{const q=g('gainFor')(c,x);return q?+q.d.toFixed(2):null;};o.cls[cls]={l:d('k_bootl_2'),m:d('k_cape_2'),h:d('k_booth_2')};});return o;});
  const C=a.cls,med=['thief','archer','monk'].every(k=>C[k]&&C[k].m>C[k].l&&C[k].h===null),cast=['mage','healer'].every(k=>C[k]&&C[k].l>0&&C[k].m===null),hv=['warrior','knight'].every(k=>C[k]&&C[k].h>C[k].m&&C[k].h>C[k].l);
  chk(`1 boots: light ${a.l}, medium ${a.m}, heavy ${a.h}; medium wearers gain more from medium than light, casters gain from light, heavy wearers most from heavy`,(a.l==='mp+mag'&&a.m==='hp+spd'&&a.h==='hp+def'&&med&&cast&&hv)||JSON.stringify(a));
  const b=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),M=window.__M3,o={};G.gold=90000;G.stage=1;G.cleared=[1];Object.keys(g('MATS')).concat(Object.keys(G.mats)).forEach(k=>{G.mats[k]=99;});/* every material: a realm's relic and parts differ by journey */G.gear.push('c_mana');
    o.shop=M.m3Secs('smithy','shop').map(x=>x[0]);o.craft=M.m3Secs('smithy','craft').map(x=>x[0]);o.sell=M.m3Secs('smithy','sell').map(x=>x[0]);o.alch=M.m3Secs('workshop','shop').map(x=>x[0]).concat(M.m3Secs('workshop','craft').map(x=>x[0]),M.m3Secs('workshop','sell').map(x=>x[0]));
    A.V.modal={type:'smithy',tab:'shop',sec:'charms'};A.render();o.rows=document.querySelectorAll('#modal .shoprow [data-act=buyGear]').length;o.sec=A.V.modal.sec;
    A.V.modal={type:'smithy',tab:'sell',sec:'charms'};A.render();o.sellRow=/Mana/.test(document.querySelector('#modal').innerText);
    A.V.modal={type:'workshop',tab:'shop'};A.render();o.alchTxt=/Charm/.test(document.querySelector('#modal .chips, #modal').innerText.split('\n').slice(0,12).join(' '));A.V.modal=null;return o;});
  chk(`2 the Smithy has Charms in Shop (${b.rows} rows), Forge and Sell; Alchemy has none`,(b.shop.includes('charms')&&b.craft.includes('charm')&&b.sell.includes('charms')&&b.rows>=3&&b.sec==='charms'&&b.sellRow&&!b.alch.includes('charm'))||JSON.stringify(b));
  const c=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),o={};const P=g('partyChars')(),top=sl=>{const L=g('shopStock')(sl==='w'?'weapons':'armor');return L;};
    // oren already wears the best mail the shop has, untempered: the plan has to temper it where it sits
    const mail=g('shopStock')('armor').filter(id=>/^a_mail_/.test(id)).sort().pop();G.roster.oren.eq.a=mail;g('refresh')(G.roster.oren);o.mail=mail;
    A.V.modal={type:'smithy',tab:'shop'};A.ACT.p3Smith();const pl=A.V.modal.plan;o.slots=[...new Set(pl.picks.map(p=>p.sl))].sort().join('');o.src=[...new Set(pl.picks.map(p=>p.src))].sort().join(',');
    o.temper=pl.picks.filter(p=>p.src==='temper').map(p=>p.cid+':'+p.sl+':'+p.id);A.render();const M=document.querySelector('#modal');o.rows=M.querySelectorAll('.p3pl').length;o.matRows=M.querySelectorAll('.p3pl .p3mats').length;o.chips=M.querySelectorAll('.p3pl .p3mats .matc').length;
    o.vague=/materials you own/.test(M.innerText);A.ACT.p3SmithGo();o.after=G.roster.oren.eq.a;o.boots=P.filter(c=>c.eq.k).length;o.charms=P.filter(c=>c.eq.c).length;o.modal=A.V.modal&&A.V.modal.type;
    G.gold=90000;A.V.modal={type:'smithy',tab:'shop'};A.render();const U=document.querySelector('#modal .upgbest');o.best=U?U.querySelectorAll('.row').length:0;o.bestMats=U?U.querySelectorAll('.row .p3mats').length:0;A.V.modal=null;return o;});
  chk(`3 Upgrade whole party: slots ${c.slots}, ways ${c.src}; the worn ${c.mail} is tempered in place (${c.temper.join(' ')||'none'} -> ${c.after}); ${c.boots} wear boots, ${c.charms} a charm`,(/a/.test(c.slots)&&/k/.test(c.slots)&&/c/.test(c.slots)&&c.temper.some(t=>t.startsWith('oren:a:'))&&/\+\d$/.test(c.after)&&c.boots===3&&c.charms===3&&c.modal==='autoEq')||JSON.stringify(c));
  chk(`4 materials shown: ${c.matRows} of ${c.rows} planned steps carry chips (${c.chips}), no "materials you own"; ${c.bestMats} of ${c.best} best-per-slot rows carry their cost`,(c.rows>0&&c.matRows===c.rows&&c.chips>c.rows&&!c.vague)||JSON.stringify(c));
  const d=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),TPL=g('TPL'),o={};const sum=c=>Object.values(c.alloc).reduce((x,y)=>x+y,0)+(c.pts||0);const one=cls=>Object.keys(TPL).find(id=>!TPL[id].mon&&TPL[id].cls===cls);
    const w=g('newChar')(one('warrior'),11,0);o.new11=sum(w);const p0=sum(w);w.xp=0;g('addXp')(w,g('need')(w.lv)+1);o.up=sum(w)-p0;o.lv=w.lv;
    const old={lv:10,alloc:{str:3,vit:2},pts:0,auto:false,id:one('warrior')};o.owed=g('statMigrate')(old);o.again=g('statMigrate')(old);o.oldPts=old.pts;
    const m=g('newChar')(one('mage'),10,0);m.auto=false;m.alloc={};m.pts=0;m.eq={w:null,a:null,c:null};const S0=g('calcStats')(m);m.alloc={str:5};const S1=g('calcStats')(m);o.strHp=S1.mhp-S0.mhp;m.alloc={fth:10};o.healIn=+(g('calcStats')(m).healIn||0).toFixed(3);
    m.alloc={int:10};const i10=g('calcStats')(m).mag-S0.mag;m.alloc={int:20};const i20=g('calcStats')(m).mag-S0.mag;o.cap=[+i10.toFixed(1),+i20.toFixed(1)];
    const dx=cls=>{const c=g('newChar')(one(cls),10,0);c.alloc={};c.pts=0;c.eq={w:null,a:null,c:null};const x=g('calcStats')(c).atk;c.alloc={dex:5};return +(g('calcStats')(c).atk-x).toFixed(2);};o.dexA=dx('archer');o.dexW=dx('warrior');return o;});
  chk(`5 stats: a level 11 hero has ${d.new11} points, a level up gives ${d.up}, an old level 10 hero with 5 is owed ${d.owed} once; 5 STR is ${d.strHp} HP on a mage, 10 FTH ${d.healIn} healing received; 10 INT +${d.cap[0]} MAG and 20 INT +${d.cap[1]} at level 10; 5 DEX is +${d.dexA} ATK on an Archer, +${d.dexW} on a Warrior`,
    (d.new11===20&&d.up===2&&d.owed===13&&d.again===0&&d.oldPts===13&&d.strHp>=4&&d.strHp<=6&&d.healIn===.04&&d.cap[0]>15&&Math.abs(d.cap[1]/d.cap[0]-1.5)<.03&&d.dexA>=4.5&&d.dexW<=2.6&&d.dexA>d.dexW*1.8)/* a nature scales HP, MAG and ATK by a few percent, so the sizes are bands and the half rate is a ratio */||JSON.stringify(d));
  const e=await ev(()=>{const A=__A,g=A.TW.get,TPL=g('TPL'),o={late:0,lateUp:0,first:0,firstSame:0,bad:[]};Object.keys(TPL).forEach(id=>{if(TPL[id].mon)return;g('classSkills')(TPL[id]).forEach(s=>{if(!(s.mp0>0))return;if(s.lv>=21){o.late++;if(s.mp>s.mp0)o.lateUp++;else o.bad.push(id+':'+s.id);}if(s.lv<=1){o.first++;if(s.mp===s.mp0)o.firstSame++;}});});
    o.win=g('MANA').win;o.tonic=g('ITEMS').ether.mp;o.c41=window.__S22.cost(20,41);o.c1=window.__S22.cost(20,1);return o;});
  chk(`6 mana: ${e.lateUp} of ${e.late} skills learned at 21 or later cost more than written, ${e.firstSame} of ${e.first} level 1 skills the same (20 MP at 41: ${e.c41}); ${e.win*100}% MP after a win; the Mana Tonic ${e.tonic}`,(e.late>40&&e.lateUp>=e.late*.98&&/* a few legend skills are copies of an early skill moved to a late level: they keep its cost */e.first>10&&e.firstSame===e.first&&e.c41===32&&e.c1===20&&e.win===.08&&e.tonic===40)||JSON.stringify(e));
  // 8 (v0.22.19) no minimum gain: a step worth under 3% is offered by the per slot Upgrade
  const h=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),o={min:g('SMITH_PLAN').minPct,small:[],opts:0,all:0};G.gold=90000;
    g('partyChars')().forEach(c=>{c.eq.c='c_mana';c.eq.k=null;g('refresh')(c);['c','k'].forEach(sl=>{const O=g('upgOpts')(c,sl),R=g('upgBest')(c,sl);o.opts+=O.length;o.all+=R.all.length;R.all.forEach(x=>{if(x.pct>0&&x.pct<.03)o.small.push(c.id+':'+sl+':'+(x.pct*100).toFixed(1));});});});o.n=o.small.length;o.small=o.small.slice(0,4);return o;});
  chk(`8 no 3% floor: ${h.n} steps under 3% are on the Upgrade lists (${h.small.join(', ')})`,(h.min===0&&h.n>0&&h.all===h.opts)||JSON.stringify(h));/* every option that is a gain is listed */
  await ev(()=>{const A=__A,g=A.TW.get;g('HD').roofUnder=0;const m=A.getMap('t0');try{g('hdFreeMap')();}catch(x){}A.placeAt('t0',...A.mapEntry(m),'d');A.V.modal=null;A.render();});await wait(2500);
  const f=await ev(()=>{const g=__A.TW.get,m=__A.getMap('t0'),HD=g('HD');return {n:HD.roofUnder||0,roofed:m.bld.filter(b=>g('hdBldKind')(m,b)==='roof').length,live:!!HD.live,sty:m.sty};});
  chk(`7 a ${f.sty} town in HD-2D: ${f.n} closed roofs laid for ${f.roofed} roofed buildings`,(f.live&&(f.roofed===0||f.n>=f.roofed))||JSON.stringify(f));
  await done(H);})();
