// Beta v0.5.1 3.1 (finished): Tempering shows a short tradeoff line when two options are close, like the shops and the Forge
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();try{(window.__A.G.cleared=window.__A.G.cleared||[])[0]=1;}catch(e){}A.V.modal=null;});
const r=await ev(()=>{const A=__A,G=A.G,o={};G.gold=999999;
  // a warrior in the party and several warrior weapons of one tier in the pack: their tempers help the same hero by similar amounts
  G.roster.brann=A.newChar('brann',8,1);G.party[0]='brann';
  const ids=Object.keys(A.GEAR).filter(id=>/^w_(blade|axe|greatsword|lance|mace)_1$/.test(id));o.ids=ids;G.gear.push(...ids);
  ids.forEach(id=>{const c=A.forgeCost(id);if(c)Object.keys(c.m).forEach(k=>G.mats[k]=(G.mats[k]||0)+c.m[k]*2);});
  A.V.modal={type:'smithy',tab:'forge'};A.render();
  const rows=[...document.querySelectorAll('#modal .row.rec')];o.n=rows.length;
  o.lines=rows.map((e,i)=>{const w=e.querySelector('.p3why');return w?{i,t:w.innerText}:null;}).filter(Boolean);
  // a single option has nothing to compare with: no line
  Object.values(G.roster).forEach(c=>{c.eq={};});G.gear=['w_blade_1'];A.render();o.farLines=document.querySelectorAll('#modal .row.rec .p3why').length;
  return o;});
console.log(JSON.stringify(r).slice(0,600));
chk(`Tempering lists ${r.n} pieces`,r.n>=3);
chk('close options get a tradeoff line',r.lines.length>0||JSON.stringify(r.lines));
chk('weapons of different families name their perks',r.lines.some(l=>/Brann: .*(acc|crit|hit-all|phys|stun|foes that)/.test(l.t))||JSON.stringify(r.lines));
chk('the line is on the second row of a close pair and names the hero',r.lines.every(l=>l.i>0&&/^⇄ \w+: .+: .+\. .+: .+\.$/.test(l.t))&&r.lines.some(l=>/^⇄ Brann:/.test(l.t))||JSON.stringify(r.lines));
chk('a single option gets no line',r.farLines===0||r.farLines);
await done(H);})();
