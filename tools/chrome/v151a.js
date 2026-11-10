// v0.16.x echo11.js: the Echoforge pass. Every class weapon family and armour weight has a recipe; every Echoforged piece beats the tier 5 shop piece of its
// kind at +3 by >= 12% in its main stats; a hero's relic beats the Echoforged piece of its kind; gold > the tier 5 shop price; old '_ef+N' saves read as plain
// Echoforged; the anvil draws in 2D and HD-2D without exceptions and emits a light.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html [SHOTDIR=/dir] node v151a.js
const {open,chk,done}=require('./pw');
const SHOTS=process.env.SHOTDIR||'/tmp';
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false}}));`;
const setup=()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();const G=A.G;G.won=true;G.echoStory={0:1,1:1,2:1,3:1,4:1};G.cleared=[1,1,1,1,1];G.stage=4;A.V.modal=null;};
(async()=>{
const H=await open({w:1000,h:560,out:SHOTS,pre:META('low')});const {ev,wait}=H;
await ev(setup);await wait(200);
// ---- data ----
const r=await ev(()=>{const A=__A,T=A.TW.get,o={},E=T('ECHO11'),EFG=T('ECHOFORGE'),ARM=T('ECHOARM'),G=A.G;
  const fams=new Set();Object.values(T('CLS_WPN')).forEach(l=>l.forEach(f=>fams.add(f)));
  o.missingW=[...fams].filter(f=>!EFG[f]||!A.GEAR['w_'+f+'_ef']);
  const armF=new Set(Object.values(T('CLS_ARM')).map(w=>T('ARM_FAM')[w]));o.missingA=[...armF].filter(f=>!ARM[f]||!A.GEAR['a_'+f+'_ef']);
  o.nW=Object.keys(EFG).length;o.nA=Object.keys(ARM).length;
  const ST=['hp','mp','atk','def','mag','res','spd'];o.weak=[];o.gold=[];o.noShard=[];o.relicBad=[];o.noPerk=[];
  const all=[...Object.keys(EFG).map(f=>['w',f]),...Object.keys(ARM).map(f=>['a',f])];
  all.forEach(([sl,f])=>{const ef=A.gearOf(sl+'_'+f+'_ef'),shop=A.gearOf(sl+'_'+f+'_5+3'),base=A.GEAR[sl+'_'+f+'_5'];
    ST.forEach(s=>{if(shop[s]>0){const k=ef[s]/shop[s];if(!(k>=1.12))o.weak.push(sl+f+' '+s+' '+ef[s]+'/'+shop[s]);}});
    const gold=T('efGold')(f);if(!(gold>=base.price*1.55))o.gold.push(f+' '+gold+'/'+base.price);
    const m=T('efCost')(f);if(Object.keys(m).filter(k=>k.startsWith('es_')).length!==3)o.noShard.push(f);
    if(!ef.efPerk)o.noPerk.push(f);
    if(A.forgeCost&&T('forgeCost')(sl+'_'+f+'_ef')!==null)o.noShard.push('temperable '+f);});
  // relics: every hero's weapon and armour relic against the Echoforged piece of its kind
  Object.keys(A.GEAR).forEach(id=>{const g=A.GEAR[id];if(!g.relic||!g.only||(g.slot!=='w'&&g.slot!=='a'))return;const tp=T('TPL')[g.only];if(!tp)return;const rg=A.gearOf(id);
    const f=g.slot==='w'?T('CF')[tp.cls][0]:T('ARM_FAM')[T('CLS_ARM')[tp.cls]||'medium'];const ef=A.gearOf((g.slot==='w'?'w_':'a_')+f+'_ef');if(!ef)return;
    ST.forEach(s=>{if(ef[s]>0&&!(rg[s]>ef[s]))o.relicBad.push(id+' '+s+' '+rg[s]+' vs '+ef[s]);});o.nRel=(o.nRel||0)+1;});
  // sword example
  o.sword={shop5:A.gearOf('w_blade_5').atk,shop3:A.gearOf('w_blade_5+3').atk,ef:A.gearOf('w_blade_ef').atk,efOld:A.gearOf('w_blade_ef+2').atk,price:A.GEAR.w_blade_5.price,gold:T('efGold')('blade')};
  const kn=Object.keys(A.GEAR).find(id=>A.GEAR[id].relic&&A.GEAR[id].slot==='w'&&T('CF')[T('TPL')[A.GEAR[id].only].cls][0]==='blade');o.sword.relic=kn&&A.gearOf(kn).atk;o.sword.relicId=kn;
  o.efOld=A.gearOf('w_staff_ef+3').id;o.tempOld=T('forgeCost')('w_blade_ef+2');
  // forging: weapon and armour end to end
  G.gold=99999;const out={};['blade','mail','lyre'].forEach(f=>{const sl=ARM[f]?'a':'w';G.gear.push(sl+'_'+f+'_5+2');const m=T('efCost')(f);Object.keys(m).forEach(k=>G.mats[k]=(G.mats[k]||0)+m[k]);
    if(f==='blade'){const m0=T('efCost')('axe');G.gear.push('w_axe_5');Object.keys(m0).forEach(k=>G.mats[k]=(G.mats[k]||0)+m0[k]);A.ACT.efForge('axe');}const g0=G.gold;A.ACT.efForge(f);out[f]={has:G.gear.includes(sl+'_'+f+'_ef'),spent:g0-G.gold,exp:T('efGold')(f),baseGone:!G.gear.includes(sl+'_'+f+'_5+2')};});o.forge=out;
  // perks do not throw: equip every Echoforged piece on a hero and recompute
  o.perkErr=[];const c=G.roster[G.party[0]];[...Object.keys(EFG).map(f=>['w',f]),...Object.keys(ARM).map(f=>['a',f])].forEach(([sl,f])=>{try{c.eq[sl]=sl+'_'+f+'_ef';const S=A.calcStats(c);if(!(S.atk>0))o.perkErr.push(f);}catch(e){o.perkErr.push(f+':'+e.message);}});
  return o;});
console.log(JSON.stringify(r,null,1).slice(0,3000));
chk('every weapon family a class uses has an Echoforged recipe ('+r.nW+' weapons)',r.missingW.length===0&&r.nW>=25||JSON.stringify(r.missingW));
chk('every armour weight has one ('+r.nA+')',r.missingA.length===0&&r.nA===3||JSON.stringify(r.missingA));
chk('each Echoforged piece beats its tier 5 +3 shop piece by >= 12% in every main stat',r.weak.length===0||JSON.stringify(r.weak.slice(0,6)));
chk('sword: relic > Echoforged > shop +3 (atk '+r.sword.relic+' > '+r.sword.ef+' > '+r.sword.shop3+')',r.sword.relic>r.sword.ef&&r.sword.ef>=r.sword.shop3*1.12||JSON.stringify(r.sword));
chk('every hero relic beats the Echoforged piece of its kind in every stat ('+r.nRel+' relics)',r.relicBad.length===0&&r.nRel>=12||JSON.stringify(r.relicBad.slice(0,6)));
chk('gold is >= 1.55x the tier 5 shop price, three shards, a perk, and nothing is temperable',r.gold.length===0&&r.noShard.length===0&&r.noPerk.length===0||JSON.stringify([r.gold,r.noShard,r.noPerk]));
chk("an old save's 'w_staff_ef+3' reads as plain Echoforged and 'w_blade_ef+2' has the same ATK",r.efOld==='w_staff_ef'&&r.sword.efOld===r.sword.ef&&r.tempOld===null||JSON.stringify([r.efOld,r.sword.efOld,r.tempOld]));
chk('forging a sword, mail and lyre: the gold taken is the shown gold, the base piece is used up',['blade','mail','lyre'].every(f=>r.forge[f].has&&r.forge[f].spent===r.forge[f].exp&&r.forge[f].baseGone)||JSON.stringify(r.forge));
chk('every Echoforged piece computes stats without an exception',r.perkErr.length===0||JSON.stringify(r.perkErr));
// ---- the anvil in 2D ----
const view=async(h,tag)=>{
  await h.ev(()=>{const A=__A;A.V.modal=null;A.getMap('s0');A.placeAt('s0',16,16,'u');A.WS.lock=false;A.WS.dir='u';A.V.screen='world';A.render();});await h.wait(4200);
  const x=await h.ev(()=>{const A=__A,m=A.WS.m,n=m.npcs.find(q=>q.forge),L=(m.lights||[]).concat(m.tl||[]).filter(l=>Math.abs(l[0]-n.x*16)<48&&Math.abs(l[1]-n.y*16)<48&&l[3]==='violet');
    return {pos:[n.x,n.y],lights:L.length,hd:!!(A.HD&&A.HD.live),hdErr:A.HD&&A.HD.forgeErr||null,trig:n.act==='portal'&&n.portal===1&&n.key==='__forge'};});
  await h.shot(tag);return x;};
const pg=await ev(()=>{const A=__A,o={};A.getMap('s0');A.placeAt('s0',16,15,'u');A.WS.lock=false;A.G.gold=99999;A.V.modal={type:'smithy',tab:'echo'};A.render();const t=document.querySelector('#modal').innerText;o.page={rows:document.querySelectorAll('#modal .row.rec').length,gold:new RegExp(A.TW.get('efGold')('blade').toLocaleString('en-US')).test(t),sec:/weapons/i.test(t)&&/armor/i.test(t),lute:/Dissonance/.test(t),knell:/Knellplate/.test(t),vs:/at max temper \(\+3\)/.test(t)};return o;});
chk('the Echoforge page (in the Echo Rift) lists every piece in two sections with the gold and the +3 comparison',pg.page.rows>=28&&pg.page.gold&&pg.page.sec&&pg.page.lute&&pg.page.knell&&pg.page.vs||JSON.stringify(pg));
const a2=await view(H,'forge_2d_1000x560');console.log(JSON.stringify(a2));
chk('2D: the anvil stands at tile 16,14 (v0.17.1: the middle of the Echo Rift) with the same trigger and emits violet light',a2.pos[0]===16&&a2.pos[1]===14&&a2.trig&&a2.lights>=1||JSON.stringify(a2));
const ia=await ev(()=>{const A=__A;A.V.modal=null;A.placeAt('s0',16,15,'u');A.WS.lock=false;A.WS.dir='u';A.interact();/* v0.17.1: the forge stands at (16,14) */return A.V.modal&&A.V.modal.type;});
chk('standing south of the anvil and pressing interact opens the Echoforge',ia==='smithy'||ia);
// draw it at several phases, with the glow, to prove no exception on a bare canvas
const dr=await ev(()=>{const E=window.__ECHO11,errs=[];const c=document.createElement('canvas');c.width=E.FG.cw;c.height=E.FG.ch;const x=c.getContext('2d');
  for(let i=0;i<24;i++){try{x.clearRect(0,0,c.width,c.height);E.forgeDraw(x,E.FG.ox,E.FG.oy,i/24,{});E.forgeDraw(x,E.FG.ox,E.FG.oy,i/24,{floor:1,glow:1});}catch(e){errs.push(e.message);}}
  const d=x.getImageData(0,0,c.width,c.height).data;let px=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)px++;return {errs,px};});
chk('forgeDraw: 24 phases, no exception, pixels drawn',dr.errs.length===0&&dr.px>500||JSON.stringify(dr));
// ---- the anvil in HD-2D, two sizes ----
for(const [w,h,tag] of [[1000,560,'1000x560'],[390,844,'390x844']]){
  const D=await open({w,h,out:SHOTS,mobile:w<500,pre:META('high'),tag:'hd'+w});
  await D.ev(setup);await D.wait(300);
  const hx=await view(D,'forge_hd_'+tag);console.log(tag,JSON.stringify(hx));
  chk('HD-2D '+tag+': the anvil draws without an exception'+(hx.hd?'':' (HD not live in this browser: skipped)'),!hx.hdErr&&hx.lights>=1||JSON.stringify(hx));
  await D.browser.close();
  const F=await open({w,h,out:SHOTS,mobile:w<500,pre:META('low'),tag:'f'+w});
  await F.ev(setup);await F.wait(300);await view(F,'forge_2d_'+tag);await F.browser.close();
}
await done(H);
})();
