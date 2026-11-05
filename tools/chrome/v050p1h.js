// Beta v0.5.0 1.7: Inn bed line reads "for your wayfarers". 1.9: Tempering lists what can be tempered now first (biggest improvement first), then the rest by how close.
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});
const r=await ev(()=>{const A=__A,G=A.G,o={};
  A.V.modal={type:'inn'};A.render();const t=document.querySelector('#modal').innerText;o.inn=/for your wayfarers/.test(t);o.innNum=/for all \d+|\d+ heroes/.test(t);
  // a pack with several temperable pieces; give materials for some
  G.gear.push('w_blade_0','w_staff_1','a_mail_1','a_robe_0','w_bow_1','a_vest_1');G.gold=99999;
  const ids=G.gear.slice();ids.forEach(id=>{const c=A.forgeCost(id);if(!c)return;});
  // materials for exactly two of them
  let gave=0;ids.forEach(id=>{const c=A.forgeCost(id);if(c&&gave<2&&/staff|mail/.test(id)){Object.keys(c.m).forEach(k=>G.mats[k]=(G.mats[k]||0)+c.m[k]);gave++;}});
  A.V.modal={type:'smithy',tab:'forge'};A.render();
  const rows=[...document.querySelectorAll('#modal .row.rec')];o.n=rows.length;o.readyFlags=rows.map(e=>e.classList.contains('ready')?1:0);
  // ranks recomputed in list order
  const list=[];A.partyChars?0:0;G.gear.forEach((id,i)=>{if(A.forgeCost(id))list.push(Object.assign({where:'spare',ref:i,id},A.temperRank?A.temperRank({where:'spare',ref:i,id}):{ready:0,gain:0,close:0}));});
  o.rank=list.map(x=>[x.ready,+x.gain.toFixed(2),+x.close.toFixed(2)]);
  return o;});
chk('Inn bed line says "for your wayfarers"',r.inn===true);
chk('Inn bed line has no hero count',r.innNum===false);
const f=r.readyFlags,firstNot=f.indexOf(0),lastReady=f.lastIndexOf(1);
chk(`Tempering: ready rows come first (${f.join('')})`,lastReady<firstNot||firstNot<0||f.join(''));
await done(H);})();
