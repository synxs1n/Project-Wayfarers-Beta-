// Beta v0.6.3 (4): the battle screen layout. On a portrait phone (390x844) everything needed to act is on screen without scrolling: the
// active hero's HP, MP and limit, the commands, the foes' HP (on the stage plates) and the log ticker; commands are grouped (Attack, Skills,
// Items, Guard first; Scan, Lore, Switch, Flee next); the active hero is marked; nothing is repeated (the command header carries no bars or
// status icons, a card leaves out the effects its unit shows in full on the stage); the readability rules hold (status symbols, shield pips,
// primed badge, element icons, the pinned Back, the auto lock reason); tap targets are 40 px or more; no sideways scroll at any size.
// Fails on v0.6.2 (no grouped commands, the log over the stage, the header repeating MP and effects), passes now.
const {open,chk,done}=require('./pw');const {META,battle,dress}=require('./v063lib');
(async()=>{for(const [w,h] of [[390,844],[844,390],[933,705],[1280,800]]){const H=await open({w,h,mobile:w<1000,pre:META('medium')});const tag=w+'x'+h;
  await battle(H,{heroes:3,foes:3,seed:41,lv:22});await dress(H,{seed:42,maxSt:3,prime:.6,shield:.6});await H.wait(400);
  const r=await H.ev(()=>{const A=__A,B=A.B,a=B.cur,vis=e=>{if(!e)return false;const q=e.getBoundingClientRect();return q.width>0&&q.height>0&&q.top>=-1&&q.bottom<=innerHeight+1&&q.left>=-1&&q.right<=innerWidth+1;};
    const ac=[...document.querySelectorAll('#bparty .pc.turn')],acb=ac[0]&&ac[0].querySelectorAll('.ucr');
    const prim=[...document.querySelectorAll('#bcmd .menu.prim .mi')].map(e=>e.dataset.arg),sec=[...document.querySelectorAll('#bcmd .menu.sec .mi')].map(e=>e.dataset.arg||e.dataset.act);
    const taps=[...document.querySelectorAll('#bcmd .mi,#bcmd .btn,#bline .blogbtn,#border .wchip,#bparty .pc,#bparty .fc')].filter(e=>e.getBoundingClientRect().width>0).map(e=>[e.className.split(' ')[0]+(e.dataset.arg?':'+e.dataset.arg:''),Math.round(e.getBoundingClientRect().height)]).filter(x=>x[1]<40);
    const head=document.querySelector('#bcmd .cmdhead'),blog=document.getElementById('blog'),wr=document.getElementById('bwrap').getBoundingClientRect(),bl=blog&&blog.getBoundingClientRect();
    // a foe whose statuses the stage shows in full has no status icons on its card
    const dup=!(A.b3Lay&&A.stItems)?['(no stage layout)']:B.en.filter(e=>e.hp>0&&A.stItems(e,{noPrime:true,noWx:true}).length&&(()=>{const o=A.b3Lay().tags.get(e);return o&&o.max>=A.stItems(e,{noPrime:true,noWx:true}).length;})()).filter(e=>{const c=document.querySelectorAll('#bparty .fcw')[B.en.indexOf(e)];return c&&c.querySelector('.ptags .sti');}).map(e=>e.name);
    return {mode:A.BL.mode,cur:a&&a.name,acName:ac[0]&&ac[0].textContent.includes(a.name),acBars:acb?acb.length:0,acVis:vis(ac[0]),prim,sec,primVis:[...document.querySelectorAll('#bcmd .menu.prim .mi')].every(vis),secVis:[...document.querySelectorAll('#bcmd .menu.sec .mi')].every(vis),
      back:vis(document.querySelector('#bcmd [data-act="back"]')),logVis:vis(document.querySelector('#bline .blogbtn')),logOff:!!bl&&bl.top>=wr.bottom-1,stageVis:vis(document.getElementById('bwrap')),
      headBars:head?head.querySelectorAll('.bar,.sti').length:-1,taps,dup,docW:document.documentElement.scrollWidth,vw:innerWidth,
      sym:!!document.querySelector('#bstage .sti svg.stsym,#bparty .sti svg.stsym'),pips:[...document.querySelectorAll('#bparty .spips')].length,prime:document.querySelectorAll('#bstage .primed').length,elb:document.querySelectorAll('#bparty .elb').length,
      shields:B.en.filter(e=>e.hp>0&&e.maxShield).length,primed:B.en.filter(e=>e.hp>0&&e.primed).length};});
  chk(`${tag}: no sideways scroll`,r.docW<=r.vw+1||r.docW);
  chk(`${tag}: commands grouped: Attack, Skills, Items, Guard, then Scan, Lore, Switch, Flee`,r.prim.join()==='attack,skills,items,guard'&&['scan','lore','swap','flee'].every(k=>r.sec.includes(k))||JSON.stringify([r.prim,r.sec]));
  chk(`${tag}: ${r.cur}'s card is marked as the active hero and shows its bars (${r.acBars})`,r.acName&&r.acBars>=2||JSON.stringify(r));
  chk(`${tag}: the command header repeats no bars or status icons`,r.headBars===0||r.headBars);
  chk(`${tag}: the log ticker sits under the stage, not on it`,r.logOff===true);
  chk(`${tag}: tap targets are 40 px or more`,r.taps.length===0||JSON.stringify(r.taps));
  chk(`${tag}: cards leave out what the stage shows in full`,r.dup.length===0||r.dup.join());
  chk(`${tag}: readability rules: status symbols, element icons, shield pips, primed badges`,r.sym&&r.elb>0&&r.pips===r.shields&&r.prime===r.primed||JSON.stringify({sym:r.sym,elb:r.elb,pips:r.pips,sh:r.shields,pr:r.prime,primed:r.primed}));
  if(w===390)chk(`${tag}: without scrolling: the stage, the log button, the active hero's card, every command and Back`,r.stageVis&&r.logVis&&r.acVis&&r.primVis&&r.secVis&&r.back||JSON.stringify({st:r.stageVis,log:r.logVis,ac:r.acVis,p:r.primVis,s:r.secVis,b:r.back}));
  else chk(`${tag}: without scrolling: the stage, the log button, the main commands and Back`,r.stageVis&&r.logVis&&r.primVis&&r.back||JSON.stringify({st:r.stageVis,log:r.logVis,p:r.primVis,b:r.back}));
  // the log opens over the stage and closes again
  const lg=await H.ev(()=>{__A.ACT.blogT();const o=!!document.querySelector('.blogp');__A.ACT.blogT();return o&&!document.querySelector('.blogp');});
  chk(`${tag}: the Log button opens and closes the battle log`,lg===true);
  await H.browser.close();}
// the auto lock reason still shows (a boss fight not won by hand yet)
{const H=await open({w:390,h:844,mobile:true,pre:META('medium')});await battle(H,{heroes:3,boss:1,stage:1,seed:3});const t=await H.ev(()=>{const e=document.querySelector('#bcmd .autowhy');return e?e.textContent:'';});
  chk(`390x844 boss: the auto lock reason shows ("${t}")`,t.length>4);await H.browser.close();}
const H=await open({});await done(H);})();
