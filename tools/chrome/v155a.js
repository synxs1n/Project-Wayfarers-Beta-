// Beta v0.17 damage kinds (v3/dmg11.js, WT_KIND / CLS_KINDS / CLS_KIND_ALT in items.js, DL_FORCE in skills.js): the weapon in hand sets the kind of
// physical skills; every class reaches at most two physical kinds (casters one) through its skills and weapons; the skill list says
// "Blunt with your mace", a fixed skill says "Always Piercing", and a foe's Weak tooltip names the heroes who answer each kind.
// Usage: PWHTML=../../out/aurelis3.html node v155a.js
const {open,chk,done}=require('./pw');const {META,battle}=require('./v063lib');
(async()=>{
const H=await open({w:390,h:844,mobile:true,pre:META('medium')});const {ev,wait}=H;
await battle(H,{heroes:3,foes:2,lv:30});
// 1) the class limit, over every hero, role and weapon family, with the real known() lists, the basic Attack and the Limit Break
const lim=await ev(()=>{const A=__D11,G=A.G,CAST=['mage','healer','bard','archmage','chronicler'],out={};
 const ids=Object.keys(A.TPL).filter(id=>!A.TPL[id].mon&&A.TPL[id].cls&&A.CLS_KINDS[A.TPL[id].cls]);
 ids.forEach(id=>{const t=A.TPL[id],cl=t.cls,o=out[cl]=out[cl]||{kinds:new Set(),list:A.CLS_KINDS[cl]};
  const roles=A.heroRoles({id});roles.forEach(r=>{const c=G.roster[id]=A.newChar(id,99,5);c.role=r;let L=A.known(c);try{L=L.concat([A.limitSkill(c)]);}catch(e){}
   (A.CLS_WPN[cl]||[null]).forEach(f=>{const u={id,side:'p',S:{wp:f}};L.concat([A.atkFor(u)]).forEach(s=>{if(s.k==='phys'){const d=A.deliveryOf(u,s);if(d)o.kinds.add(d);}});});});});
 return Object.entries(out).map(([cl,o])=>({cl,kinds:[...o.kinds].sort(),list:o.list.slice().sort(),cast:CAST.includes(cl)}));});
lim.forEach(r=>chk(`${r.cl}: physical kinds ${r.kinds.join('+')||'none'} (limit ${r.cast?1:2}, class list ${r.list.join('+')})`,r.kinds.length<=(r.cast?1:2)&&r.kinds.every(k=>r.list.includes(k))||JSON.stringify(r)));
// a full party of six can cover slash, blunt, piercing and ranged only by mixing classes: no class covers more than two of the four
const cov=lim.filter(r=>!r.cast||r.kinds.length).map(r=>r.kinds.filter(k=>k!=='magic'));
chk('no class covers more than two of slash, blunt, piercing, ranged',cov.every(k=>k.length<=2)||JSON.stringify(cov));
chk('every one of the four physical kinds is reached by some class',['slash','blunt','piercing','ranged'].every(k=>cov.some(c=>c.includes(k)))||JSON.stringify(cov));
// 2) the weapon sets the kind
const w=await ev(()=>{const A=__D11,d=(id,fam,sid)=>{const u={id,side:'p',S:{wp:fam}};const t=A.TPL[id],s=sid==='attack'?A.ATTACK:A.classSkills(t).find(x=>x.id===sid);return A.deliveryOf(u,s);};
 const war=Object.keys(A.TPL).find(id=>A.TPL[id].cls==='warrior'&&!A.TPL[id].mon),kn=Object.keys(A.TPL).find(id=>A.TPL[id].cls==='knight'&&!A.TPL[id].mon),
  th=Object.keys(A.TPL).find(id=>A.TPL[id].cls==='thief'&&!A.TPL[id].mon),ar=Object.keys(A.TPL).find(id=>A.TPL[id].cls==='archer'&&!A.TPL[id].mon);
 return {blade:d(war,'blade','pstrike'),hammer:d(war,'warhammer','pstrike'),hammerAtk:d(war,'warhammer','attack'),greatTitan:d(war,'greatsword','titan'),
  knMace:d(kn,'mace','lance1'),knBlade:d(kn,'blade','lance1'),knLance:d(kn,'lance','lance1'),knBash:d(kn,'blade','bash'),
  thDagger:d(th,'dagger','flurry'),thStab:d(th,'dagger','stab'),thStabThrown:d(th,'thrown','stab'),thThrown:d(th,'thrown','flurry'),
  arBow:d(ar,'bow','aim'),arPierce:d(ar,'crossbow','pierce'),arNone:d(ar,null,'aim')};});
console.log(JSON.stringify(w));
chk('warrior Power Strike: sword slash, warhammer blunt',w.blade==='slash'&&w.hammer==='blunt'||JSON.stringify(w));
chk('warrior basic Attack follows the warhammer (blunt); a Titan Blow with a greatsword slashes',w.hammerAtk==='blunt'&&w.greatTitan==='slash'||JSON.stringify(w));
chk('knight Lance skill: mace blunt, blade slash, a lance is re-kinded blunt; Shield Bash is always blunt',w.knMace==='blunt'&&w.knBlade==='slash'&&w.knLance==='blunt'&&w.knBash==='blunt'||JSON.stringify(w));
chk('thief: dagger slash on a free skill, Quick Stab always piercing, thrown stars piercing',w.thDagger==='slash'&&w.thStab==='piercing'&&w.thStabThrown==='piercing'&&w.thThrown==='piercing'||JSON.stringify(w));
chk('archer: bow ranged, Piercing Shot piercing with any bow, no weapon falls back to ranged',w.arBow==='ranged'&&w.arPierce==='piercing'&&w.arNone==='ranged'||JSON.stringify(w));
// 3) the display in the skill list, and the foe's Weak tooltip
await ev(()=>{const A=__A,B=A.B,u=B.front[0];u.S.wp='mace';u.mp=u.S.mmp||99;A.ACT.cmd('skills');});await wait(250);
const ui=await ev(()=>{const t=[...document.querySelectorAll('.menu.list .mi small.dk11')].map(x=>x.textContent);return {t,n:document.querySelectorAll('.menu.list .mi').length};});
console.log(JSON.stringify(ui));
chk('the skill list says "Blunt with your mace" under physical skills',ui.t.some(x=>/^Blunt with your mace$/.test(x))||JSON.stringify(ui));
chk('a fixed skill says "Always Blunt" (Shield Bash)',ui.t.some(x=>/^Always Blunt$/.test(x))||JSON.stringify(ui));
const tip=await ev(()=>{const A=__A,B=A.B,e=B.en[0];e.ty=['armored'];B.b9x=B.b9x||{};B.b9x['e:0']=true;let h='';try{A.bestEntry(e).hit=1;h=__D11.foeWeak(e);}catch(x){h='ERR '+x.message;}return h;});
console.log(String(tip).slice(0,400));
chk('a foe Weak tooltip lists "Your answers" by kind (or the foe is not revealed yet)',/Your answers: /.test(tip)||tip===''||'no answers: '+String(tip).slice(0,200));
await done(H);})();
