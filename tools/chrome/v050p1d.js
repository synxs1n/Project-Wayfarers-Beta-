// Beta v0.5.0 1.4: the battle Back button is visible at every level of the command menu, and steps back one level
const {open,chk,done}=require('./pw');
(async()=>{for(const [w,h] of [[390,844],[844,390]]){
const H=await open({w,h,mobile:true});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.inv.potion=9;A.G.inv.ether=9;A.startBattle({stage:0,kind:'field'});});await wait(900);
const r=await ev(async()=>{const A=__A,B=()=>A.B,o={};const wt=ms=>new Promise(q=>setTimeout(q,ms));
  for(let i=0;i<40&&B().mode!=='cmd';i++)await wt(150);
  const vis=()=>{const b=document.querySelector('#bcmd [data-act="back"]');if(!b)return 'missing';const r=b.getBoundingClientRect(),c=document.getElementById('bcmd').getBoundingClientRect();
    const onScreen=r.width>0&&r.top>=0&&r.bottom<=innerHeight+1&&r.top>=c.top-1;return onScreen?true:'offscreen '+Math.round(r.top)+'/'+innerHeight;};
  o.root=vis();o.rootDisabled=document.querySelector('#bcmd [data-act="back"]').disabled;
  A.ACT.cmd('skills');document.getElementById('bcmd').scrollTop=9999;window.scrollTo(0,9999);await wt(50);o.skills=vis();
  const s=A.known(B().cur).find(x=>['one','ally'].includes(x.t)&&B().cur.mp>=x.mp);o.sks=A.known(B().cur).map(x=>x.t).join();if(s){A.ACT.sk(s.id);o.target=vis();A.ACT.back();o.fromTarget=B().menu;}
  A.ACT.back();o.toRoot=B().menu;
  A.ACT.cmd('items');window.scrollTo(0,9999);await wt(50);o.items=vis();A.ACT.item('potion');o.itemTarget=vis();A.ACT.back();o.itemBack=B().menu;A.ACT.back();
  A.ACT.cmd('attack');o.attack=vis();A.ACT.back();o.attackBack=B().menu;
  if(A.B.back&&A.B.back.length){A.ACT.cmd('swap');o.swap=vis();A.ACT.back();}
  return o;});
const tag=w+'x'+h;
['root','skills','target','items','itemTarget','attack'].forEach(k=>chk(`${tag}: Back visible on ${k}`,r[k]===true||r[k]));
chk(`${tag}: Back greyed at the top level`,r.rootDisabled===true);
chk(`${tag}: Back from a skill target returns to Skills`,r.fromTarget==='skills'||r.fromTarget);
chk(`${tag}: Back from Skills returns to the top`,r.toRoot==='root');
chk(`${tag}: Back from an item target returns to Items`,r.itemBack==='items'||r.itemBack);
chk(`${tag}: Back from an attack target returns to the top`,r.attackBack==='root');
await H.browser.close();}
const H=await open({});await done(H);})();
