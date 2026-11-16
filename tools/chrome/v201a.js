// capes.js (v0.22.11): capes became boots, light, medium and heavy.
//  1 eighteen boots (three weights x six tiers), each with one clear bonus (light SPD, medium HP, heavy DEF), rising with the tier
//  2 who wears what: a light armor class light boots only, a medium class light or medium, a heavy class any; the reason names it
//  3 the Smithy: the slot and the shelf say Boots, the shelf holds the weights the roster can wear; no "Cape" text on the equipment sheet
//  4 an old save: a mage in an old cape (now medium boots) wears light boots of the same tier and temper after load; a knight keeps them
//  5 every boot icon draws (distinct pictures per weight)
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v201a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v201a ran over 200 s');process.exit(1);},200000).unref();
(async()=>{const H=await open({w:1000,h:700,tag:'v201a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
  const r=await ev(()=>{const g=__A.TW.get,gearOf=g('gearOf'),o={};['l','m','h'].forEach(w=>{const id=w==='l'?'k_bootl_':w==='m'?'k_cape_':'k_booth_';
    o[w]=[0,1,2,3,4,5].map(t=>{const q=gearOf(id+t);return {n:q.n,slot:q.slot,st:['hp','mp','atk','def','mag','res','spd'].filter(k=>q[k]).map(k=>k+q[k])};});});return o;});
  const one=w=>r[w].every(x=>x.slot==='k'&&x.st.length===1);const up=(w,k)=>r[w].every((x,i)=>i===0||+x.st[0].replace(k,'')>+r[w][i-1].st[0].replace(k,''));
  chk(`1 boots: light ${r.l.map(x=>x.st).join(' ')}; medium ${r.m.map(x=>x.st).join(' ')}; heavy ${r.h.map(x=>x.st).join(' ')}`,(one('l')&&one('m')&&one('h')&&r.l[0].st[0].startsWith('spd')&&r.m[0].st[0].startsWith('hp')&&r.h[0].st[0].startsWith('def')&&up('l','spd')&&up('m','hp')&&up('h','def'))||JSON.stringify(r));
  const e=await ev(()=>{const A=__A,g=A.TW.get;['brann','tess'].forEach(id=>{try{g('recruit')(id,true);}catch(e){}});const R=A.G.roster;
    return Object.keys(R).map(id=>({id,cls:g('TPL')[id].cls,l:g('canEquip')(R[id],'k_bootl_1'),m:g('canEquip')(R[id],'k_cape_1'),h:g('canEquip')(R[id],'k_booth_1'),why:g('equipWhy')(R[id],'k_booth_1')}));});
  const want={mage:'100',healer:'100',archer:'110',thief:'110',monk:'110',knight:'111',warrior:'111'};
  chk(`2 who wears what (${e.map(x=>x.id+' '+x.cls+' '+[x.l,x.m,x.h].map(Number).join('')).join(', ')}); "${e[0].why}"`,e.every(x=>!want[x.cls]||want[x.cls]===[x.l,x.m,x.h].map(Number).join(''))&&/boots/.test(e[0].why)||JSON.stringify(e));
  const s=await ev(()=>{const A=__A;A.V.modal={type:'smithy',tab:'shop',sec:'all'};A.render();const t=document.getElementById('modal').textContent;
    A.V.modal={type:'char',id:'oren'};A.render();const c=document.getElementById('modal').textContent;A.V.modal=null;A.render();
    return {boots:/Boots/.test(t),cape:/\bCapes?\b/.test(t)||/\bCape\b/.test(c),sheet:/Boots/.test(c),stock:__A.TW.get('shopStock')('armor').filter(x=>x[0]==='k')};});
  chk(`3 the Smithy and the sheet say Boots, no Cape (stock ${s.stock.join(',')})`,(s.boots&&!s.cape&&s.sheet&&s.stock.some(x=>x.startsWith('k_bootl'))&&s.stock.some(x=>x.startsWith('k_booth')))||JSON.stringify(s));
  const m=await ev(()=>{const A=__A,g=A.TW.get,R=A.G.roster;R.mira.eq.k='k_cape_3+2';R.oren.eq.k='k_cape_2+1';const o=g('bootsMigrate')(A.G);return {mira:R.mira.eq.k,oren:R.oren.eq.k,n:o.length,ok:g('canEquip')(R.mira,R.mira.eq.k)};});
  chk(`4 an old save: the mage's cape is now ${m.mira}, the knight keeps ${m.oren}`,(m.mira==='k_bootl_3+2'&&m.oren==='k_cape_2+1'&&m.ok&&m.n===1)||JSON.stringify(m));
  const ic=await ev(()=>{const g=__A.TW.get,ids=[];['k_bootl_','k_cape_','k_booth_'].forEach(p=>{for(let t=0;t<6;t++)ids.push(p+t);});const out=[];
    ids.forEach(id=>{const h=g('gearIcon')(id);out.push(h.length>40?h.slice(-60):'');});return {n:ids.length,ok:out.filter(Boolean).length,uniq:new Set(out).size};});
  chk(`5 every boot icon draws (${ic.ok}/${ic.n}, ${ic.uniq} different)`,(ic.ok===18&&ic.uniq>=12)||JSON.stringify(ic));
  await done(H);})();
