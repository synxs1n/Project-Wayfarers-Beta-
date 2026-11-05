// Phase 4: sort/filter, xp, loadouts, best party, field skills, guild cleanup
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:900,mobile:true});const {ev,wait,shot,page}=H;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(250);
const info=await ev(()=>{__A.V.modal=null;const G=__A.G;const heal=Object.keys(__A.TPL||{}).filter(id=>__A.TPL[id].cls==='healer').slice(0,2);
  ['brann','sable','tess','dorn'].concat(heal).forEach(id=>{if(__A.TPL[id]&&!G.roster[id])G.roster[id]=__A.newChar(id,7,0);});
  G.party=G.party.concat(heal.filter(id=>G.roster[id]&&!G.party.includes(id))).slice(0,6);Object.values(G.roster).forEach(__A.refresh);
  return {party:G.party.slice(),roster:Object.keys(G.roster),heal,town:__A.inTown?__A.inTown():null};});
console.log(JSON.stringify(info));
// party menu renders
await ev(()=>{__A.V.modal={type:'menu',tab:'party'};__A.render();});await wait(150);
const pm=await ev(()=>({xp:document.querySelectorAll('.swc .xpb').length,bar:!!document.querySelector('.ldstrip'),lbar:!!document.querySelector('.lfbar'),btns:[...document.querySelectorAll('.ptools .btn')].map(b=>b.innerText)}));
console.log(JSON.stringify(pm));chk('party menu: xp bars, loadout strip, filters, tools',pm.xp>=3&&pm.bar&&pm.lbar&&pm.btns.length==2||JSON.stringify(pm));
await shot('p4_party');
// sort/filter persist
await ev(()=>{__A.ACT.lSort('roster:name');__A.ACT.lEl('roster:fire');});
const meta=await ev(()=>JSON.parse(localStorage.getItem('aurelis-meta-v1')||'{}').cfg?.lists?.roster);
chk('sort and filter are remembered in the meta save',meta&&meta.s==='name'&&meta.el==='fire'||JSON.stringify(meta));
await ev(()=>{__A.V.modal={type:'menu',tab:'roster'};__A.render();});await wait(100);
const rl=await ev(()=>[...document.querySelectorAll('.grid.mini .mini b')].map(b=>b.innerText));
const fireOnly=await ev(()=>Object.values(__A.G.roster).filter(c=>c.el.includes('fire')).map(c=>c.name).sort((a,b)=>a.localeCompare(b)));
chk('roster fire filter + name sort',JSON.stringify(rl.map(s=>s.replace(' ★','')))===JSON.stringify(fireOnly)||JSON.stringify([rl,fireOnly]));
await shot('p4_roster');
await ev(()=>{__A.ACT.lEl('roster:all');__A.ACT.lSort('roster:hp');__A.ACT.lSort('roster:new');__A.ACT.lCl('roster:legend');});
const noerr=await ev(()=>document.querySelectorAll('.grid.mini .mini').length>=0);
await ev(()=>{__A.ACT.lCl('roster:all');__A.ACT.lSort('roster:def');});
// codex
await ev(()=>{__A.V.modal={type:'menu',tab:'codex'};__A.render();});await wait(100);
const cx=await ev(()=>{__A.ACT.lEl('codex:water');const n=document.querySelectorAll('.btile').length;const unk=document.querySelectorAll('.btile.unk').length;__A.ACT.lEl('codex:all');return {n,unk,all:document.querySelectorAll('.btile').length};});
chk('codex filter narrows and hides unmet tiles',cx.n<cx.all&&cx.unk===0||JSON.stringify(cx));
// loadouts
const ld=await ev(()=>{const A=__A,G=A.G;A.ACT.ldSave(0);const saved=G.party.slice(),eq0=JSON.stringify(G.roster[saved[0]].eq);
  const first=saved[0];G.party=G.party.slice().reverse();A.refresh(G.roster[first]);G.roster[first].eq={w:null,a:null,c:null};
  A.ACT.ldApply(0);return {saved,after:G.party.slice(),eqBack:JSON.stringify(G.roster[first].eq)===eq0,modal:A.V.modal&&A.V.modal.type,town:A.inTown()};});
console.log(JSON.stringify(ld));
chk('loadout restores party order',JSON.stringify(ld.saved)===JSON.stringify(ld.after)||'order');
chk('loadout result shown',ld.modal==='ldRes');
// missing hero: remove one from roster, apply
const ld2=await ev(()=>{const A=__A,G=A.G;const gone=G.party[G.party.length-1];A.ACT.ldSave(1);delete G.roster[gone];G.party=G.party.filter(id=>id!==gone);A.ACT.ldApply(1);const m=A.V.modal;return {n:G.party.length,miss:m.msgs.miss.length,fill:m.msgs.fill.length};});
console.log(JSON.stringify(ld2));chk('missing hero is reported and a replacement fills in',ld2.miss>=1&&ld2.fill>=1||JSON.stringify(ld2));
await ev(()=>__A.ACT.ldDone());
await shot('p4_ldres');
// best party
const bp=await ev(()=>{const A=__A;const p=A.bestParty();A.ACT.bpOpen();const t=A.V.modal.type;A.ACT.bpApply();return {ids:p.ids,info:p.info,t,party:A.G.party.slice()};});
console.log(JSON.stringify(bp));chk('best party: size, healer, applies',bp.ids.length===Math.min(6,Object.keys(await ev(()=>__A.G.roster)).length)&&bp.t==='bp'&&JSON.stringify(bp.party)===JSON.stringify(bp.ids)||JSON.stringify(bp));
// field skills
const fs=await ev(()=>{const A=__A,G=A.G;A.V.modal=null;const h=G.party.map(i=>G.roster[i]).find(c=>A.fsSkills(c).length);if(!h)return {none:1};
  const t=G.roster[G.party.find(i=>i!==h.id)];t.hp=1;h.mp=h.S.mmp;const sk=A.fsSkills(h)[0];const mp0=h.mp;
  A.ACT.fsOpen(h.id);A.ACT.fsPick(sk.id);if(A.V.modal.sk)A.ACT.fsTgt(t.id);
  const dead=G.roster[G.party.find(i=>i!==h.id&&i!==t.id)];dead.hp=0;
  return {who:h.name,sk:sk.n,t:sk.t,hp:t.hp,mhp:t.S.mhp,mp0,mp1:h.mp,cost:sk.mp,html:document.querySelector('.modal')?.innerText.slice(0,160)};});
console.log(JSON.stringify(fs));
if(!fs.none){chk('field heal raises HP and spends MP',(fs.hp>1||fs.t==='allyAll')&&fs.mp1===fs.mp0-fs.cost||JSON.stringify(fs));}
await shot('p4_field');
// guild has no party tab
const gu=await ev(()=>{__A.V.modal={type:'guild',tab:'party'};__A.render();return {txt:document.querySelector('.modal')?.innerText.replace(/\n+/g,' | ').slice(0,260),swc:document.querySelectorAll('.swc').length};});
console.log(JSON.stringify(gu));chk('guild hall has no party fixing',gu.swc===0&&!/Set your six|Party\b/.test(gu.txt.split('|').slice(0,8).join('|'))||JSON.stringify(gu));
// result screen xp
const rs=await ev(()=>{__A.V.modal={type:'result',info:{xp:50,gold:10,mats:{},drops:[],quests:[],bonds:[],ups:[],learn:[],notes:[]}};__A.render();return document.querySelectorAll('.xpres .row').length;});
chk('result screen shows xp rows',rs>=3||rs);
await done(H);})();
