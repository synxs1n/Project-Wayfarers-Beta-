// Beta v0.5.0 1.5: every shop screen and sub screen has the back arrow next to the X
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:390,h:844,mobile:true});const {ev}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.gold=9999;});
const r=await ev(()=>{const A=__A,o={miss:[],backBad:[],n:0};
  const has=()=>{const b=document.querySelector('#modal .mnav .mback'),x=document.querySelector('#modal .mnav .mclose');return !!(b&&x&&b.parentNode===x.parentNode);};
  const screens=[];
  ['weapons','armor','craft','forge','mats','sell','echo'].forEach(t=>screens.push({type:'smithy',tab:t}));
  ['weapon','armor','cape','trinket'].forEach(c=>screens.push({type:'smithy',tab:'craft',cat:c}));
  ['shop','relit','craft','herbs','sell','pouch'].forEach(t=>screens.push({type:'workshop',tab:t}));
  ['recruit','nature','personal','bounties','arena'].forEach(t=>screens.push({type:'guild',tab:t}));
  screens.push({type:'tavern'},{type:'inn'},{type:'board'});
  for(const s of screens){A.V.modal=Object.assign({},s);try{A.render();}catch(e){o.miss.push(JSON.stringify(s)+' err '+e.message);continue;}o.n++;
    if(!has()){o.miss.push(JSON.stringify(s));continue;}
    const before=JSON.stringify(A.V.modal);A.ACT.xBack();const after=A.V.modal?JSON.stringify(A.V.modal):'closed';
    if(after===before)o.backBad.push(JSON.stringify(s));}
  // back from a sub tab lands on the first tab, then leaves
  A.V.modal={type:'smithy',tab:'forge'};A.render();A.ACT.xBack();o.toHome=A.V.modal&&A.V.modal.tab;A.ACT.xBack();o.left=A.V.modal===null;
  return o;});
chk(`all ${r.n} shop screens show the back arrow next to the X`,r.miss.length===0||r.miss.join(' '));
chk('the back arrow always does something',r.backBad.length===0||r.backBad.join(' '));
chk('back from Tempering goes to the first Smithy tab',r.toHome==='weapons'||r.toHome);
chk('back from the first tab leaves the shop',r.left===true);
await done(H);})();
