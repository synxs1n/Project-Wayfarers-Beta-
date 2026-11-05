// Beta v0.5.9: 1) the primed marker is a small floating element badge (no big "PRIMED ICE 1T" chip, no sphere, ring or sparks, no
// duplicate chip in the stage status row), tapping still explains it; 2) the HD-2D world keeps the lower part of a portrait view sharp.
const {open,chk,done}=require('./pw');
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'${t}',hints:false}}));`;
(async()=>{
{const H=await open({w:390,h:844,mobile:true,dpr:2,pre:META('medium')});const {ev,wait,page}=H;
 await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.setPause(99999);A.startBattle({stage:0,kind:'field',weather:'clear'});});await wait(1200);
 const r=await ev(async()=>{const A=__A,B=A.B,e=B.en[0];e.primed={el:'ice',t:1,by:'Mira'};A.render();await new Promise(q=>setTimeout(q,400));
   const t=document.querySelector('#bstage .primed'),o={};if(!t)return {none:1};const b=t.getBoundingClientRect(),eb=A.unitBox(e);o.w=Math.round(b.width);o.h=Math.round(b.height);o.text=t.textContent.trim();
   o.dupChip=!!document.querySelector('#bstage .utags .sti.prime');o.stageW=Math.round(document.getElementById('bstage').getBoundingClientRect().width);
   // no glow sphere: the pixels around the foe's body do not change between primed and not primed (canvas only)
   const cv=document.getElementById('bcv'),W=cv._rw||cv.width,k=W/cv.width,ctx=cv.getContext('2d');const grab=()=>{const d=ctx.getImageData(Math.max(0,Math.floor((eb.x-eb.w*.7)*k)),Math.max(0,Math.floor((eb.y-eb.h*1.1)*k)),Math.floor(eb.w*1.4*k),Math.floor(eb.h*1.2*k)).data;let s=0;for(let i=0;i<d.length;i+=4)s+=d[i]+d[i+1]+d[i+2];return s/(d.length/4);};
   await new Promise(q=>requestAnimationFrame(()=>requestAnimationFrame(q)));const lit=grab();e.primed=null;await new Promise(q=>requestAnimationFrame(()=>requestAnimationFrame(q)));const plain=grab();o.glow=Math.round(Math.abs(lit-plain));
   e.primed={el:'ice',t:1,by:'Mira'};A.render();return o;});
 console.log(JSON.stringify(r));
 chk('primed marker is a small badge (at most 28 px, turn count included)',r.w<=28&&r.h<=28||JSON.stringify(r));
 chk('primed marker has no "PRIMED" text, only the turns left',!/PRIMED/i.test(r.text||'')&&/^\d$/.test(r.text||'')||r.text);
 chk('no duplicate primed chip in the stage status row',r.dupChip===false);
 chk('no glow sphere around the primed foe',r.glow<=6||r.glow);
 await page.screenshot({path:__dirname+'/shots-v053/v059_primed.png'});await H.browser.close();}
{const H=await open({w:390,h:844,mobile:true,dpr:2,pre:META('medium')});const {ev,wait,page}=H;
 await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const m=A.getMap('f0'),e=A.mapEntry(m);A.placeAt('f0',e[0]+6,e[1],'d');A.render();});await wait(2500);
 // the focus band: wider sharp band, softer blur, and the near side (below the hero) blurred far less (checked in the shader source and config)
 const r=await ev(()=>({band:__A.HD2D.dof.band,max:__A.HD2D.dof.max,near:/dy<0\.0\?0\.35/.test(document.documentElement.innerHTML)}));
 chk('HD-2D world: wider sharp band and softer blur',r.band>=.2&&r.max<=.75||JSON.stringify(r));
 chk('HD-2D world: the near side is blurred far less than the distance',r.near===true);
 await page.screenshot({path:__dirname+'/shots-v053/v059_world_port.png'});await H.browser.close();}
const H=await open({});await done(H);})();
