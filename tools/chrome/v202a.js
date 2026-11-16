// shields20.js (v0.22.12): shields for Warriors and Knights, with a one-handed weapon.
//  1 six shields (DEF and RES rising with the tier); only Warriors and Knights can take one, and only with a one-handed weapon
//  2 a shield adds its DEF and RES; beside a two-handed weapon it gives nothing
//  3 equipping a two-handed weapon puts the shield back in the pack; a one-handed weapon keeps it
//  4 the sheets: a Knight's equipment shows a Shield slot, a Mage's does not; the Smithy has a Shields section (stock) once a Knight is along
//  5 every shield icon draws
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v202a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v202a ran over 200 s');process.exit(1);},200000).unref();
(async()=>{const H=await open({w:1000,h:700,tag:'v202a'});const {ev}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();
    try{A.TW.get('recruit')('brann',true);}catch(e){}});
  const r=await ev(()=>{const A=__A,g=A.TW.get,R=A.G.roster,gearOf=g('gearOf');
    const tiers=[0,1,2,3,4,5].map(t=>{const q=gearOf('s_shield_'+t);return [q.def,q.res];});
    const who=Object.keys(R).map(id=>[id,g('TPL')[id].cls,g('canEquip')(R[id],'s_shield_1')]);
    const k=R.oren;const w0=k.eq.w;k.eq.w='w_lance_1';const one=g('canEquip')(k,'s_shield_1');k.eq.w='w_standard_1';const two=g('canEquip')(k,'s_shield_1');const why=g('equipWhy')(k,'s_shield_1');k.eq.w=w0;
    return {tiers,who,one,two,why};});
  chk(`1 shields ${JSON.stringify(r.tiers)}; who: ${r.who.map(x=>x[0]+'('+x[1]+') '+x[2]).join(', ')}; lance ${r.one}, standard ${r.two} ("${r.why}")`,
    (r.tiers.every((x,i)=>i===0||(x[0]>r.tiers[i-1][0]&&x[1]>r.tiers[i-1][1]))&&r.who.every(x=>x[2]===['warrior','knight'].includes(x[1]))&&r.one&&!r.two&&/one-handed/.test(r.why))||JSON.stringify(r));
  const s=await ev(()=>{const A=__A,g=A.TW.get,k=A.G.roster.oren,cs=g('calcStats');k.eq.w='w_blade_2';k.eq.s=null;const a=cs(k);k.eq.s='s_shield_2';const b=cs(k);k.eq.w='w_greatsword_2';const c=cs(k);
    k.eq.w='w_blade_2';return {a:[a.def,a.res],b:[b.def,b.res],c:[c.def,c.res]};});
  chk(`2 a shield adds DEF and RES (${s.a} -> ${s.b}); beside a two-handed weapon nothing (${s.c})`,(s.b[0]>s.a[0]&&s.b[1]>s.a[1]&&s.c[0]===s.a[0]&&s.c[1]===s.a[1])||JSON.stringify(s));
  const e=await ev(()=>{const A=__A,g=A.TW.get,k=A.G.roster.oren,G=A.G;k.eq.s='s_shield_2';G.gear.push('w_mace_2','w_standard_2');
    g('equipGear')(k,'w_mace_2');const keep=k.eq.s;g('equipGear')(k,'w_standard_2');const after=k.eq.s,inPack=G.gear.includes('s_shield_2');return {keep,after,inPack,w:k.eq.w};});
  chk(`3 a one-handed weapon keeps the shield (${e.keep}); a two-handed one sends it to the pack (${e.after}, in pack ${e.inPack})`,(e.keep==='s_shield_2'&&!e.after&&e.inPack)||JSON.stringify(e));
  const u=await ev(()=>{const A=__A,sh=id=>{A.V.modal={type:'char',id};A.render();const t=document.getElementById('modal').textContent;A.V.modal=null;A.render();return /Shield/.test(t);};
    const k=sh('oren'),m=sh('mira');A.V.modal={type:'smithy',tab:'shop',sec:'all'};A.render();const t=document.getElementById('modal').textContent;A.V.modal=null;A.render();
    return {k,m,smithy:/Shields/.test(t),stock:A.TW.get('shopStock')('armor').filter(x=>x[0]==='s')};});
  chk(`4 Knight sheet has a Shield slot (${u.k}), Mage sheet not (${u.m}); Smithy Shields section (${u.smithy}, stock ${u.stock})`,(u.k&&!u.m&&u.smithy&&u.stock.length>0)||JSON.stringify(u));
  const ic=await ev(()=>{const g=__A.TW.get;let n=0;for(let t=0;t<6;t++)if(g('gearIcon')('s_shield_'+t).length>40)n++;return n;});
  chk(`5 every shield icon draws (${ic}/6)`,ic===6||ic);
  await done(H);})();
