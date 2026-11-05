// Final: an older save (companions, bond progress, no loadouts, no new meta fields) loads in v0.3.3 with everything intact
const {open,chk,done}=require('./pw');
(async()=>{
const A1=await open({w:430,h:800,mobile:true});
const blob=await A1.ev(()=>{const A=__A,G=A.G;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
  const B=A.BONDS[0];[B.a,B.b].forEach(id=>{if(!A.G.roster[id])A.G.roster[id]=A.newChar(id,6,0);});A.G.bonds[A.bondKey(B.a,B.b)]=12;A.G.talks=[{k:A.bondKey(B.a,B.b),lv:1}];
  const mons=Object.keys(A.MON).slice(0,2);A.G.tamed=mons.map((m,i)=>{const o={id:'tmx'+i,mon:m,name:'Pet'+i,cls:'warrior',trait:'keen',bb:0,scourge:0,with:i?'oren':'mira'};A.registerTamed(o);return o;});
  A.G.gear=['w_blade_1','a_mail_1','c_fth'];A.G.roster.mira.eq={w:'w_staff_1',a:null,c:null};A.saveGame();
  const k=Object.keys(localStorage).find(x=>x.startsWith('aurelis-wayfarers-v3'));const o=JSON.parse(localStorage.getItem(k));
  delete o.loadouts;delete o.echoStory;delete o.clock;delete o.wx;return {key:k,save:JSON.stringify(o),bonds:JSON.stringify(A.G.bonds),w:JSON.stringify(A.G.tamed.map(t=>t.with))};});
await A1.browser.close();
console.log('old save keys stripped, bytes',blob.save.length);
const H=await open({w:430,h:800,mobile:true,pre:`localStorage.clear();localStorage.setItem(${JSON.stringify(blob.key)},${JSON.stringify(blob.save)});localStorage.setItem('aurelis-meta-v1',JSON.stringify({legacy:[],cycles:0,clears:0,best:{Slime:{seen:1,kills:2,scan:0,known:{}}},codex:{},archivist:0,legends:{},cfg:{speed:1,enc:'normal',diff:'normal',music:.45,sfx:.6,autoStats:true,autoEquip:false}}));`});
const r=await H.ev(()=>{const A=__A;A.ACT.cont();const G=A.G;return {ok:!!G,party:G.party.slice(),bonds:JSON.stringify(G.bonds),talks:G.talks.length,w:JSON.stringify(G.tamed.map(t=>t.with)),loadouts:G.loadouts===undefined?'undef':G.loadouts.length,lists:A.LC('roster').s,best:A.META.best.Slime.kills,gear:G.gear.slice(),miraEq:JSON.stringify(G.roster.mira.eq)};});
console.log(JSON.stringify(r));
chk('old save loads',r.ok&&r.party.length>=3||JSON.stringify(r));
chk('bond progress and pending talk carry over untouched',r.bonds===blob.bonds&&r.talks===1||JSON.stringify([r.bonds,blob.bonds]));
chk('companion assignments carry over',r.w===blob.w||JSON.stringify([r.w,blob.w]));
chk('new fields default safely (loadouts, sort/filter, queue)',(r.loadouts==='undef'||r.loadouts===0)&&r.lists==='def'||JSON.stringify(r));
// use every new surface on the loaded old save
const u=await H.ev(()=>{const A=__A;const out={};A.V.modal={type:'menu',tab:'party'};A.render();out.party=document.querySelectorAll('.swc').length;
  A.V.modal={type:'menu',tab:'roster'};A.render();out.roster=document.querySelectorAll('.grid.mini .mini').length;A.V.modal={type:'menu',tab:'codex'};A.render();out.codex=document.querySelectorAll('.btile').length;
  A.V.modal={type:'menu',tab:'equip'};A.render();out.equip=document.querySelectorAll('.eqrow').length;A.ACT.autoEqParty();out.auto=A.V.modal.type;A.ACT.autoEqUndo();
  A.ACT.ldSave(0);out.ld=A.G.loadouts.length;const hid=A.BONDS[0].a;A.V.charList=[hid];A.V.modal={type:'char',char:hid,list:[hid]};A.render();out.bond=document.querySelectorAll('[data-act="bondTalk"]').length;
  A.V.modal={type:'inn'};A.render();out.inn=!!document.querySelector('[data-act="rest"]');return out;});
console.log(JSON.stringify(u));
chk('every new screen renders on the old save',u.party>=3&&u.roster>=3&&u.codex>0&&u.equip>=3&&u.auto==='autoEq'&&u.ld===1&&u.bond>=1&&u.inn||JSON.stringify(u));
await done(H);})();
