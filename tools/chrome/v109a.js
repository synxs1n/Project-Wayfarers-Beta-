// v0.10.9: order-free reactions (28 pairs, the same whichever element is primed), purpose tags derived from skill data, travel field skills.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:1280,h:800});
  const r=await H.ev(()=>{const g=__A.TW.get,REACT=g('REACT'),rf=g('reactFor'),ELK=g('ELK');let pairs=0,sym=0,miss=[];
    ELK.forEach(a=>ELK.forEach(b=>{if(a===b)return;const x=rf(a,b),y=rf(b,a);if(!x)miss.push(a+'>'+b);if(x&&y&&x.n===y.n&&x.m===y.m&&JSON.stringify(x.fx||[])===JSON.stringify(y.fx||[]))sym++;pairs++;}));
    const same=ELK.every(a=>!rf(a,a));return {n:Object.keys(REACT).length,pairs,sym,miss,same,grave:[rf('earth','shadow').n,rf('shadow','earth').n],
      rk:g('reactKey')('water','fire')===g('reactKey')('fire','water'),rain:(g('WEATHER').rain.react||{})[g('reactKey')('water','fire')]};});
  chk(`28 reactions (${r.n})`,r.n===28||r.n);
  chk(`every prime reacts with every other element, both orders give the same reaction (${r.sym}/${r.pairs}, missing ${r.miss.join(',')})`,r.pairs===56&&r.sym===56&&!r.miss.length||JSON.stringify(r));
  chk('an element never reacts with itself',r.same);
  chk(`Grave from earth+shadow either way (${r.grave})`,r.grave[0]==='Grave'&&r.grave[1]==='Grave');
  chk(`rain boosts Steam whichever is primed (${r.rain})`,r.rk&&r.rain>1);
  // purpose tags: read from the data
  const p=await H.ev(()=>{const g=__A.TW.get,P=g('skPurpose');return {
    dmg:P({k:'phys',t:'one'}),heal:P({k:'heal',t:'ally'}),rev:P({k:'revive',t:'dead'}),cure:P({k:'status',t:'ally',cleanse:1}),
    taunt:P({k:'status',t:'self',fx:[['taunt',1],['bulwark',1]]}),guard:P({k:'status',t:'ally',fx:[['ward',1]]}),buff:P({k:'status',t:'allyAll',fx:[['haste',1]]}),
    debuff:P({k:'status',t:'all',fx:[['slow',.6]]}),sum:P({k:'status',summon:1}),tag:g('roleTag')({k:'heal',t:'ally',id:'x'})};});
  chk(`purpose tags from k, fx and t: ${JSON.stringify(p).slice(0,200)}`,p.dmg==='dmg'&&p.heal==='heal'&&p.rev==='revive'&&p.cure==='cure'&&p.taunt==='taunt'&&p.guard==='guard'&&p.buff==='buff'&&p.debuff==='debuff'&&p.sum==='summon'&&/em class="pur heal"/.test(p.tag));
  // the battle skill list shows the tag
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.startBattle({stage:0,kind:'field'});});
  await H.page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
  const L=await H.ev(()=>{__A.ACT.cmd('skills');return document.querySelectorAll('#bcmd [data-act="sk"] em.pur').length;});
  chk(`skill list rows carry a purpose tag (${L})`,L>=1);
  // field skills: a level 12 thief learns Haste and Shadowstep, a priest Ward, a bard Marching Song
  const f=await H.ev(()=>{const A=__A,g=A.TW.get,G=g('G');A.TW.get('B=null');const out={};const T=g('TPL');
    const pick=cls=>Object.keys(G.roster).find(id=>T[id].cls===cls)||Object.keys(T).find(id=>T[id].cls===cls&&!T[id].legend&&!T[id].mon);
    const thief=pick('thief');if(!G.roster[thief])g('recruit')(thief);const c=G.roster[thief];c.lv=12;c.mp=99;c.S.mmp=99;
    out.sk=g('fsSkills')(c).map(s=>s.id);const ms0=g('stepMs')();g('fsCast')(thief,'fld_haste');out.haste=G.fsx.haste;out.fast=g('stepMs')()<ms0;
    g('fsCast')(thief,'fld_shadow');out.shadow=G.fsx.shadow;const m={t:[['.']],w:9,h:9};out.unseen=g('roamSees')(m,{x:0,y:0,dir:'r',mode:'patrol'},1,0)===false;
    out.mpPaid=c.mp<99;return out;});
  chk(`thief at 12 learns Haste and Shadowstep (${f.sk})`,f.sk.includes('fld_haste')&&f.sk.includes('fld_shadow')||JSON.stringify(f));
  chk(`Haste speeds up steps, Shadowstep hides you from patrols, MP is paid (${JSON.stringify(f)})`,f.haste>0&&f.fast&&f.shadow>0&&f.unseen&&f.mpPaid);
  await done(H);})();
