// Phase 1 (v0.3.4): load a save from each earlier build format in the current build and confirm it is intact.
// A = real save written by the v0.3.2 baseline build (out/aurelis.html). B..E are hand-aged shapes of that save.
const fs=require('fs');const {open,chk,done}=require('./pw');
const OLD=fs.readFileSync(__dirname+'/../out/aurelis.html','utf8');
(async()=>{
const H0=await open({w:430,h:800,mobile:true,html:OLD});
const base=await H0.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();
  A.G.bonds[['lumen','mira'].sort().join('|')]=12;
  const mons=Object.keys(A.MON).slice(0,2);A.G.tamed=mons.map((m,i)=>{const o={id:'tmx'+i,mon:m,name:'Pet'+i,cls:'warrior',trait:'keen',bb:0,scourge:0,with:i?'oren':'mira'};return o;});
  A.G.gear=['w_blade_1','a_mail_1'];A.G.roster.mira.lv=9;A.G.gold=777;A.G.stats.battles=42;A.saveGame();
  const k=Object.keys(localStorage).find(x=>x.startsWith('aurelis-wayfarers-v3'));return {key:k,save:localStorage.getItem(k),ver:A.GAME_VERSION,meta:localStorage.getItem('aurelis-meta-v1')};});
await H0.browser.close();
console.log('baseline wrote',base.ver,'save bytes',base.save.length);
const A0=JSON.parse(base.save);
const fm={};
fm['A v0.3.2 real']=A0;
{const o=JSON.parse(base.save);delete o.compV;o.tamed.forEach(t=>{delete t.with;});fm['B pre-companion flag (v0.3.0)']=o;}
{const o=JSON.parse(base.save);delete o.compV;o.tamed.forEach(t=>{delete t.with;o.roster[t.id]=JSON.parse(JSON.stringify(o.roster.mira));});o.party=o.party.concat(['tmx0']);fm['C tames as party members (v0.2.x)']=o;}
{const o=JSON.parse(base.save);Object.values(o.roster).forEach(c=>{delete c.pace;delete c.keep;delete c.lb;delete c.vet;delete c.legacy;if(c.alloc)delete c.alloc.fth;});delete o.skSeen;delete o.bossWon;fm['D pre-Faith, pre-pacing hero (v0.2.x)']=o;}
{const o=JSON.parse(base.save);['tamed','talks','weather','vaults','gath','personal','bonds','bossWon','skSeen','compV'].forEach(k=>delete o[k]);o.mats={};fm['E ancient, missing optional fields']=o;}
fm['F ver stripped']=(()=>{const o=JSON.parse(base.save);delete o.ver;return o;})();
const res={};
for(const [name,o] of Object.entries(fm)){
  const H=await open({w:430,h:800,mobile:true,pre:`localStorage.clear();localStorage.setItem(${JSON.stringify(base.key)},${JSON.stringify(JSON.stringify(o))});localStorage.setItem('aurelis-meta-v1',${JSON.stringify(base.meta)});`});
  const r=await H.ev(()=>{const A=__A;const out={err:null};try{A.ACT.cont();}catch(e){out.err=String(e&&e.message||e);}
    const G=A.G;out.loaded=!!G&&A.V.screen==='world';if(G){out.party=G.party.length;out.roster=Object.keys(G.roster).length;out.gold=G.gold;out.bonds=JSON.stringify(G.bonds||{});out.tamed=(G.tamed||[]).length;out.withs=JSON.stringify((G.tamed||[]).map(t=>t.with||null));}
    out.slotStill=!!localStorage.getItem(Object.keys(localStorage).find(x=>x.startsWith('aurelis-wayfarers-v3'))||'');out.toast=(document.querySelector('.toast')||{}).textContent||'';return out;});
  res[name]=r;console.log(name,JSON.stringify(r));
  const exp=name.startsWith('E')?{gold:777}:{gold:777};
  chk(name+': loads into the world',r.loaded||JSON.stringify(r));
  chk(name+': gold and roster intact',r.gold===777&&r.roster>=3||JSON.stringify(r));
  if(!name.startsWith('E')&&!name.startsWith('F'))chk(name+': bond progress intact',r.bonds===JSON.stringify(A0.bonds)||JSON.stringify([r.bonds,A0.bonds]));
  await H.browser.close();
}
const failed=Object.entries(res).filter(([n,r])=>!r.loaded).map(([n])=>n);
console.log('FORMATS THAT FAIL TO LOAD:',failed.length?failed.join(' | '):'none');
process.exit(0);
})();
