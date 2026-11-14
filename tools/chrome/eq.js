// Phase 3: auto equip party / all / one, companions, undo, Best for
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:1000,h:800,mobile:false});const {ev,wait,shot}=H;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(250);
const info=await ev(()=>{__A.V.modal=null;const G=__A.G;['brann','sable','tess'].forEach(id=>{G.roster[id]=__A.newChar(id,8,0);});
  const ks=Object.keys(__A.GEAR);const by=(f)=>ks.filter(f);
  return {n:ks.length,sample:ks.slice(0,12),party:G.party.slice(),roster:Object.keys(G.roster)};});
console.log(JSON.stringify(info));
// scenario: brann (roster, not party) wears the best gear; pack has junk. Two companions: one free, one on tess.
const setup=await ev(()=>{const G=__A.G,GEAR=__A.GEAR,ks=Object.keys(GEAR).filter(k=>!GEAR[k].stick);
  const top=(slot,pred)=>ks.filter(k=>GEAR[k].slot===slot&&(!pred||pred(GEAR[k]))).sort((a,b)=>(GEAR[b].tier||0)-(GEAR[a].tier||0))[0];
  const w=top('w',g=>!g.tome),a=top('a'),c=top('c');
  G.gear=[];Object.values(G.roster).forEach(h=>{h.eq={w:null,a:null,c:null};});
  /* v0.18.7: reserves keep no gear, so the best pieces start in the pack instead of on brann */const b=G.roster.brann;b.eq={};
  const low=ks.filter(k=>GEAR[k].slot==='w'&&!GEAR[k].tome&&(GEAR[k].tier||0)<=1).slice(0,3);G.gear=low.concat([w,a,c]);
  Object.values(G.roster).forEach(__A.refresh);
  G.tamed=G.tamed||[];
  const mk=(id,mon,cls)=>({id,mon,name:'T'+id,cls,trait:'keen',bb:0,scourge:0,with:null});
  return {w,a,c,low};});
console.log(JSON.stringify(setup));
// snapshot helper
const snap=()=>ev(()=>JSON.stringify({gear:__A.G.gear.slice().sort(),eq:Object.fromEntries(Object.values(__A.G.roster).map(c=>[c.id,c.eq])),w:(__A.G.tamed||[]).map(o=>o.with)}));
const s0=await snap();
// party auto should take brann's gear
await ev(()=>__A.ACT.autoEqParty());await wait(200);
const r1=await ev(()=>{const G=__A.G;return {brann:G.roster.brann.eq,party:G.party.map(id=>G.roster[id].eq),modal:__A.V.modal&&__A.V.modal.type,html:document.querySelector('.modal')?.innerText.slice(0,300)};});
console.log(JSON.stringify(r1));
const partyHas=r1.party.some(e=>e.w===setup.w||e.a===setup.a||e.c===setup.c);
chk('party auto takes the top gear from the pack (v0.18.7: reserves keep no gear)',partyHas||'party got none of the top gear');
chk('summary modal shown',r1.modal==='autoEq');
await shot('eq_party');
await ev(()=>__A.ACT.autoEqUndo());await wait(100);
chk('undo restores pack, equipment and companions exactly',(await snap())===s0||'mismatch');
// individual auto must never take from another hero
await ev(()=>__A.ACT.autoEqOne('mira'));await wait(100);
const r2=await ev(()=>({brann:__A.G.roster.brann.eq}));
chk('individual auto leaves a reserve bare (v0.18.7)',Object.values(r2.brann).every(x=>!x)||JSON.stringify(r2.brann));
await ev(()=>__A.ACT.autoEqUndo());
// all-roster auto: nobody with a class-usable slot stays empty if gear exists
await ev(()=>{const G=__A.G,ks=Object.keys(__A.GEAR).filter(k=>!__A.GEAR[k].stick&&!__A.GEAR[k].only);G.gear=G.gear.concat(ks.filter(k=>__A.GEAR[k].slot==='a').slice(0,8),ks.filter(k=>__A.GEAR[k].slot==='c').slice(0,8));});
await ev(()=>__A.ACT.autoEqAll());await wait(200);
const r3=await ev(()=>{const G=__A.G;return Object.values(G.roster).filter(c=>G.party.includes(c.id)).map(c=>[c.id,!!c.eq.w,!!c.eq.a,!!c.eq.c]);});
console.log(JSON.stringify(r3));
chk('all auto (now the party only) fills armor and charm for every party hero',r3.every(r=>r[2]&&r[3])||JSON.stringify(r3));
// invariants: no item duplicated beyond what existed
const inv=await ev(()=>{const G=__A.G,all=G.gear.slice();Object.values(G.roster).forEach(c=>['w','a','c'].forEach(s=>{if(c.eq[s])all.push(c.eq[s]);}));return all.length;});
console.log('items total',inv);
await ev(()=>__A.ACT.autoEqUndo());
// Best for
const bf=await ev(()=>{const id=__A.G.gear[0];return {id,html:__A.bestTag?__A.bestTag(id):'nobtag'};});
console.log(JSON.stringify(bf).slice(0,400));
// equipment tab renders
await ev(()=>{__A.V.modal={type:'menu',tab:'equip'};__A.render();});await wait(200);
const tab=await ev(()=>document.body.innerText.includes('Equip Best'));
chk('equipment tab shows the Equip Best button (v0.10.2: one button, party only)',tab||'missing');

// companions: two free companions, party auto should attach them to party heroes; undo detaches
const cs=await ev(()=>{const G=__A.G;const mons=Object.keys(__A.MON||{}).slice(0,2);if(!__A.registerTamed)return {skip:1};
  G.tamed=[];mons.forEach((m,i)=>{const o={id:'tmx'+i,mon:m,name:'Pet'+i,cls:'warrior',trait:'keen',bb:i?1:0,scourge:0,with:null};__A.registerTamed(o);G.tamed.push(o);});
  const s0=JSON.stringify(G.tamed.map(o=>o.with));__A.ACT.autoEqParty();const s1=G.tamed.map(o=>o.with);/* gear16: Equip Best pressed in the Menu closes it; its Undo is then on Backpack > Equipment (ACT.g16Undo) */if(__A.V.modal&&__A.V.modal.type==='autoEq')__A.ACT.autoEqUndo();else __A.ACT.g16Undo();const s2=JSON.stringify(G.tamed.map(o=>o.with));
  return {s0,s1,s2,party:G.party.slice()};});
console.log(JSON.stringify(cs));
if(!cs.skip){chk('party auto assigns companions to party heroes',cs.s1.every(w=>cs.party.includes(w))&&cs.s1.every(Boolean)||JSON.stringify(cs));
 chk('undo restores companion assignment',cs.s0===cs.s2||'mismatch');}
done(H);
})();
