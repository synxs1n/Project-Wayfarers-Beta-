// v0.14.6 equipbtn10.js: an Equip button beside Sheet on every party card opens Backpack > Equipment at that hero.
const {open,chk,done}=require('./pw');
(async()=>{const H=await open({w:412,h:915,mobile:true});const r=await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal={type:'menu',tab:'party'};A.render();
 const eq=[...document.querySelectorAll('#modal [data-act=eqOpen]')],sh=[...document.querySelectorAll('#modal .swsheet')],o={eq:eq.length,sh:sh.length,party:A.TW.get('G').party.length};
 o.cut=eq.filter(b=>b.scrollWidth>b.clientWidth+1).length;/* v0.14.8: on narrow phones the two buttons stack; either way they sit in the card under the bars, never over them */const cards=[...document.querySelectorAll('#modal .swc')].filter(c=>c.querySelector('.swbtns'));o.sameRow=cards.every(c=>{const m=c.querySelector('.swm').getBoundingClientRect(),b=c.querySelector('.swbtns').getBoundingClientRect(),cr=c.getBoundingClientRect();return b.top>=m.bottom-1&&b.bottom<=cr.bottom+1&&b.left>=cr.left-1&&b.right<=cr.right+1;});const M=document.querySelector('#modal').getBoundingClientRect();o.inside=eq.every(b=>b.getBoundingClientRect().right<=M.right&&b.getBoundingClientRect().left>=M.left)&&document.querySelector('#modal .panel, #modal .box').scrollWidth<=document.querySelector('#modal .panel, #modal .box').clientWidth+1;
 A.ACT.eqOpen('lumen');o.tab=A.V.modal.tab;return o;});await H.wait(300);
 const r2=await H.ev(()=>{const el=document.querySelector('#modal .eqrow[data-hero=lumen]');return {row:!!el,focus:!!el&&el.classList.contains('eqfocus'),rows:document.querySelectorAll('#modal .eqrow[data-hero]').length};});
 console.log(JSON.stringify(r),JSON.stringify(r2));
 chk('every party card has an Equip button with Sheet, inside the card under the bars, not clipped, no sideways scroll',r.eq===r.party&&r.eq===r.sh&&r.cut===0&&r.sameRow&&r.inside||JSON.stringify(r));
 chk('Equip opens Backpack > Equipment with that hero\'s row marked',r.tab==='equip'&&r2.row&&r2.focus&&r2.rows===r.party||JSON.stringify(r2));
 await done(H);})();
