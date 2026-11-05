// v0.4.1 5.3: NPC dialogue cycles, hints adapt, lore lands in Guides > Lore
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const r=await ev(()=>{const A=__A,G=A.G,o={};const m=A.getMap('t0');const n=m.npcs.find(n=>n.wander&&n.line)||m.npcs[0];const orig=n.line;
  const seq=[];for(let i=0;i<24;i++)seq.push(A.npcWords(n,m));
  o.first=seq[0]===orig;o.noRepeat=seq.every((t,i)=>i===0||t!==seq[i-1]);o.uniq=new Set(seq).size;
  o.lore=(G.loreHeard||[]).length;
  o.hintLow=A.npcHints(m).some(t=>/revive/.test(t));G.roster[G.party[0]].hp=0;o.hintDead=A.npcHints(m).some(t=>/revive/.test(t));
  G.party.forEach(id=>{G.roster[id].ail={poison:3};});o.hintAil=A.npcHints(m).some(t=>/linger/.test(t));
  A.V.modal={type:'menu',tab:'lore'};A.render();o.tab=document.body.innerText.toLowerCase().includes('heard in the realms');
  const ks=Object.keys(A.BTHEME);o.sp=A.npcPool(n,m,orig).filter(x=>ks.some(k=>x.t.toLowerCase().includes(k))).length;
  return o;});
console.log(JSON.stringify(r));
chk('5.3 first chat is the original line, later ones differ and never repeat back to back',r.first&&r.noRepeat&&r.uniq>=6);
chk('5.3 lore lines are heard and listed in Guides > Lore',r.lore>=1&&r.tab===true);
chk('5.3 hints adapt (revive hint only when someone is down, cure hint with ailments)',r.hintLow===false&&r.hintDead===true&&r.hintAil===true);
chk('5.3 no boss names in any line',r.sp===0);
await done(H);})();
