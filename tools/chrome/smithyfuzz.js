const {open,chk,done}=require('./pw');
(async()=>{const h=await open({mobile:true});const {ev,wait}=h;
await ev(()=>{__A.ACT.new();['mira','lumen','oren'].forEach(id=>__A.ACT.pickS(id));__A.ACT.begin();__A.ACT.storyOk();});await wait(300);
await ev(()=>{const G=__A.G;G.gold=9999999;for(const k of Object.keys(G.mats))G.mats[k]=300;G.stage=4;Object.keys(__A.TPL).forEach(id=>{if(!G.roster[id]){try{G.roster[id]=__A.newChar(id,45,5);}catch(e){}}});for(const id of Object.keys(__A.GEAR).filter((x,i)=>i%3===0))G.gear.push(id);});
let seed=12345;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
let hang=null,steps=0,types={};
for(let i=0;i<500&&!hang;i++){
  const r=await Promise.race([ev(([u])=>{const m=__A.V.modal;if(!m||['result','lose','story'].includes(m.type)){__A.V.modal={type:'smithy',tab:['weapons','armor','craft','forge','mats','sell','echo'][Math.floor(u*7)]};__A.render();return 'reopen';}
    const bs=[...document.querySelectorAll('#modal button:not(.mclose):not([disabled])')];if(!bs.length)return 'nob:'+m.type;const b=bs[Math.floor(u*997)%bs.length];b.click();return m.type+':'+(b.dataset.act||'');},[rnd()]),new Promise(r=>setTimeout(()=>r('HANG'),8000))]);
  steps++;if(r==='HANG'){hang='step '+i;break;}types[String(r).split(':')[0]]=(types[String(r).split(':')[0]]||0)+1;
  if(String(r).startsWith('nob')){await ev(()=>{__A.V.modal=null;__A.render();});}
}
console.log('modal types seen',JSON.stringify(types));
chk(`fuzz ${steps} random clicks in smithy flows`,hang?'HANG at '+hang:true);
await done(h);})();
