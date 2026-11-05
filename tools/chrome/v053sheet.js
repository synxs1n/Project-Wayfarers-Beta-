// v0.5.3 sprites: sprite sheets and in-game shots, written to tools/chrome/shots-v053s/ (not committed). TAG=before|after picks the file prefix.
// heroes_*.png: every hero side stand, side walk, front 0/1/2, back 0/1 at 3x. mons_*.png: every monster art (normal, guardians, variants).
// villagers, portraits (party menu), town, field, battle (tall and wide), codex and bestiary tiles, title lineup.
// Usage: PWHTML=../../out/aurelis3.html TAG=after node v053sheet.js
const {open,chk,done}=require('./pw');const fs=require('fs');const OUT=__dirname+'/shots-v053s';fs.mkdirSync(OUT,{recursive:true});
const TAG=process.env.TAG||'after';
const PRE=`(()=>{let s=7;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'high',rmotion:true,hints:false}}));`;
(async()=>{
  const H=await open({w:1400,h:900,dpr:1,pre:PRE});const {page,ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.clock=100;A.render();});await wait(300);
  // sheets drawn into a page canvas, then screenshotted
  const sheet=async(name,fnSrc,arg)=>{
    const n=await ev(([src,arg])=>{const A=__A;const old=document.getElementById('sheet');if(old)old.remove();
      const items=(new Function('A','arg',src))(A,arg); // [{c,label}] rows: [[...]]
      const SC=arg&&arg.sc||3,pad=6,rows=items;let W=0,Hh=0;
      rows.forEach(r=>{let w=0,h=0;r.forEach(o=>{w+=o.c.width*SC+pad;h=Math.max(h,o.c.height*SC+12);});W=Math.max(W,w);Hh+=h+pad;});
      const cv=document.createElement('canvas');cv.id='sheet';cv.width=W+pad;cv.height=Hh+pad;cv.style.cssText='position:fixed;left:0;top:0;z-index:99999;background:#2a2f3a';
      const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#3a4250';x.fillRect(0,0,cv.width,cv.height);
      let y=pad;rows.forEach(r=>{let xx=pad,h=0;r.forEach(o=>{x.fillStyle='#46505f';x.fillRect(xx,y,o.c.width*SC,o.c.height*SC);x.drawImage(o.c,xx,y,o.c.width*SC,o.c.height*SC);
        if(o.label){x.fillStyle='#fff';x.font='10px sans-serif';x.fillText(o.label,xx,y+o.c.height*SC+10);}xx+=o.c.width*SC+pad;h=Math.max(h,o.c.height*SC+12);});y+=h+pad;});
      document.body.appendChild(cv);return [cv.width,cv.height];},[fnSrc,arg]);
    await page.setViewportSize({width:Math.min(4000,n[0]),height:Math.min(4000,n[1])});await wait(100);
    await page.screenshot({path:`${OUT}/${TAG}_${name}.png`,clip:{x:0,y:0,width:Math.min(4000,n[0]),height:Math.min(4000,n[1])}});
    await ev(()=>document.getElementById('sheet').remove());
  };
  const nh=await ev(()=>Object.keys(__A.TPL).filter(id=>!__A.TPL[id].mon).length);
  // heroes, three per row: side stand, side walk, front 0, front 1, back 0
  const heroGrid=`const ids=Object.keys(A.TPL).filter(id=>!A.TPL[id].mon).slice(arg.a,arg.b);const rows=[];let r=[];ids.forEach((id,i)=>{const t=A.TPL[id],L=A.heroLook(id);
    r.push({c:A.heroCanvas(id,false),label:id},{c:A.heroCanvas(id,true)},{c:A.walkerCanvas('sh'+id,L,t.el,id,'front',0)},{c:A.walkerCanvas('sh'+id,L,t.el,id,'front',1)},{c:A.walkerCanvas('sh'+id,L,t.el,id,'back',0)});
    if(r.length>=15){rows.push(r);r=[];}});if(r.length)rows.push(r);return rows;`;
  for(let a=0,k=0;a<nh;a+=24,k++)await sheet('heroes'+k,heroGrid,{a,b:a+24,sc:3});
  // a close look at 6 heroes at 6x
  await sheet('heroes_zoom',`return [['brann','mira','sable','tess','oren','lumen'].map(id=>({c:A.heroCanvas(id,false),label:id})),['kael','pip','wren','gilda','vex','nyx'].filter(id=>A.TPL[id]).map(id=>{const t=A.TPL[id];return {c:A.walkerCanvas('z'+id,A.heroLook(id),t.el,id,'front',0),label:id};})];`,{sc:6});
  await sheet('mons_zoom',`return [['mossling','cinderpup','frostwolf','iceknight','gargoyle'].map(k=>({c:A.monCanvas(k),label:k})),['drake','cinderking','seraph'].map(k=>({c:A.monCanvas(k),label:k}))];`,{sc:5});
  // monsters
  const monGrid=`const ks=Object.keys(A.MART).filter(k=>arg.big?A.MON_SIZE(k)>40:A.MON_SIZE(k)<=40).filter(k=>arg.v?/_|echo/.test(k):!/_|echo/.test(k));const rows=[];let r=[];ks.slice(0,arg.max||999).forEach(k=>{r.push({c:A.monCanvas(k),label:k});if(r.length>=arg.per){rows.push(r);r=[];}});if(r.length)rows.push(r);return rows;`;
  await sheet('mons',monGrid,{per:10,sc:3});
  await sheet('mons_big',monGrid,{per:8,sc:2,big:1});
  await sheet('mons_variants',monGrid,{per:12,sc:2,v:1,max:48});
  await sheet('villagers',`const m=A.getMap('t0');return [(m.npcs||[]).filter(n=>n.look&&!n.portal).map((n,i)=>({c:A.walkerCanvas('vs'+i,n.look,['light'],null,'front',0),label:n.name})).concat((m.npcs||[]).filter(n=>n.look&&!n.portal).map((n,i)=>({c:A.walkerCanvas('vs'+i,n.look,['light'],null,'side',0)})))];`,{sc:4});
  await H.browser.close();
  // in-game shots at phone size, 2x device pixels so the sprite detail shows
  const H2=await open({w:390,h:844,mobile:true,dpr:2,pre:PRE});{const {page,ev,wait}=H2;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.clock=100;
    ['brann','sable','tess'].forEach(id=>{A.G.roster[id]=A.newChar(id,5,0);A.G.party.push(id);});A.render();});await wait(600);
  await page.screenshot({path:`${OUT}/${TAG}_town.png`});
  await ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'party'};A.render();});await wait(400);await page.screenshot({path:`${OUT}/${TAG}_party.png`});
  await ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'codex'};A.render();});await wait(400);await page.screenshot({path:`${OUT}/${TAG}_codex.png`});
  await ev(()=>{const A=__A;A.V.modal={type:'menu',tab:'beasts'};A.render();});await wait(400);await page.screenshot({path:`${OUT}/${TAG}_bestiary.png`});
  await ev(()=>{const A=__A;A.V.modal=null;A.render();const foes=['gull','mossling','cavebat','frostwolf','yeti'].map(k=>A.makeEnemy(A.MON[k],5));A.startBattle({stage:0,kind:'field',weather:'clear',foes});});
  await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});await wait(600);
  await page.screenshot({path:`${OUT}/${TAG}_battle_tall.png`});
  await page.setViewportSize({width:932,height:430});await ev(()=>{__A.layoutBattle&&__A.layoutBattle();});await wait(600);
  await page.screenshot({path:`${OUT}/${TAG}_battle_wide.png`});
  await ev(()=>{__A.finishBattle('x');__A.V.modal=null;__A.render();});
  await page.setViewportSize({width:844,height:390});await wait(300);
  await ev(()=>{const A=__A,G=A.G;const m=A.getMap('f0');let best=null;for(let y=2;y<m.h-2&&!best;y++)for(let x=Math.floor(m.w/2);x<m.w-2;x++){if(A.tileAt(m,x,y)===','&&!A.solidAt(m,x,y)){best=[x,y];break;}}if(!best)best=[5,5];A.placeAt('f0',best[0],best[1],'d');A.render();});
  await wait(500);await page.screenshot({path:`${OUT}/${TAG}_field_land.png`});
  await page.setViewportSize({width:390,height:844});await ev(()=>{const A=__A;A.V.screen='title';A.V.modal=null;A.render();});await wait(600);await page.screenshot({path:`${OUT}/${TAG}_title.png`});}
  chk('sheets and shots written',fs.readdirSync(OUT).filter(f=>f.startsWith(TAG+'_')).length>=12||fs.readdirSync(OUT).join(','));
  await done(H2);
})();
