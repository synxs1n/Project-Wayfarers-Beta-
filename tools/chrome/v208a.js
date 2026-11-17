// v0.22.22: the owner's notes on guardians, chests, items and the gold menu text.
//  1 no name is drawn above a guardian on the map (the red marker stays)
//  2 a Sanctum guardian's rune circle, right in front of the prize chest, is floor once the guardian is beaten (it stayed solid)
//  3 every item can turn up: Smelling Salts and Holy Water in chests and as battle drops, brews and Camp Supplies in later chests
//  4 a chest's gear: now and then (CHEST_UP) one rarity above the open one, never tempered, never Echoforged; otherwise as before
//  5 the key chest keeps its own look while it opens and the Beacon Key rises out of it (the opening is marked as a key chest)
//  6 dark text on gold (gold buttons, the selected chip) has no text shadow
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v208a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v208a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:1000,h:600,pre:META,tag:'v208a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(300);
  const a=await ev(()=>{const g=__A.TW.get,src=String(g('g21Tag2D'))+String(g('g21DrawHD'));return {text2d:/fillText/.test(String(g('g21Tag2D'))),hd:/const n=0/.test(String(g('g21DrawHD'))),marker:/ff4a4a/.test(src)};});
  chk('1 no name above a guardian: the 2D tag draws no text, the HD-2D label is off, the red marker stays',(!a.text2d&&a.hd&&a.marker)||JSON.stringify(a));
  const b=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),m=A.getMap('o0'),[gx,gy]=m.guardAt,[px,py]=m.prize,o={front:gx===px&&gy===py+1};G.miniDone=G.miniDone||{};delete G.miniDone[m.id];
    o.before=[m.t[gy][gx],A.tileAt(m,gx,gy),A.solidAt(m,gx,gy)];G.miniDone[m.id]=1;o.after=[A.tileAt(m,gx,gy),A.solidAt(m,gx,gy)];const p=g('findPath')(m,gx,gy+2,gx,gy);o.path=p?p.length:-1;delete G.miniDone[m.id];return o;});
  chk(`2 the rune circle in front of the Sanctum chest: ${b.before.join(' / ')} while the guardian stands, ${b.after.join(' / ')} once it is beaten`,(b.front&&b.before[0]==='X'&&b.before[2]===true&&b.after[0]==='.'&&b.after[1]===false)||JSON.stringify(b));
  const c=await ev(()=>{const g=__A.TW.get,I=g('ITEMS'),C=g('CHEST_ITEMS'),M=g('DROP_MIX');const all=new Set([0,1,2,3,4].flatMap(s=>C(s)));
    return {c0:['salts','holywater'].every(k=>C(0).includes(k)),c1:['sage','vigor'].every(k=>C(1).includes(k)&&!C(0).includes(k)),c3:C(3).includes('elixir')&&!C(2).includes('elixir'),kit:!I.campkit||C(2).includes('campkit'),
      mix:['salts','holywater','plume','remedy','bandage','ash','tent'].every(k=>M[k]>0&&I[k]),known:[...all].every(k=>I[k]),never:Object.keys(I).filter(k=>!all.has(k)&&!M[k])};});
  chk(`3 items: salts and Holy Water in every chest pool and in the battle drops, brews from the second realm, an Elixir from the fourth; still from neither chest nor drop: ${c.never.join(', ')||'none'}`,(c.c0&&c.c1&&c.c3&&c.kit&&c.mix&&c.known&&c.never.every(k=>k==='porkchop'))||JSON.stringify(c));
  const d=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),mr=Math.random,o={};G.stage=1;G.cleared=[1];const cap=g('rarCap')();o.cap=cap;try{Math.random=()=>.001;const u=g('chestGear')(2,true);o.up=[u.up,u.gid,g('gTierIdx')(g('gearOf')(u.gid))];
      Math.random=()=>.5;const n=g('chestGear')(2,true);o.no=[n.up,n.gid];G.daily=1;Math.random=()=>.001;o.daily=g('chestGear')(2,false).up;G.daily=0;}finally{Math.random=mr;G.daily=0;}o.p=g('CHEST_UP');return o;});
  chk(`4 chest gear at rarity cap ${d.cap}: a lucky roll gives ${d.up[1]} (rarity ${d.up[2]}), an ordinary one ${d.no[1]}; the chance is ${d.p}`,(d.up[0]===true&&d.up[2]===d.cap+1&&!/\+|_ef/.test(d.up[1])&&d.no[0]===false&&/_2\+1$/.test(d.no[1])&&d.daily===false&&d.p>0&&d.p<=.06)||JSON.stringify(d));
  const e=await ev(()=>{const A=__A,g=A.TW.get,m=A.getMap('d0');let k=null;m.t.forEach((r,y)=>r.forEach((ch,x)=>{if(ch==='K')k=[x,y];}));if(!k)return {k:null};A.placeAt('d0',...A.mapEntry(m),'d');A.V.modal=null;
    g('openChest')(k[0],k[1]);const o=Object.values(window.__WFXO)[0]||{};const kc=g('wfxKeyChestOpen')(),ks=g('wfxKeySprite')();const px=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;return n;};
    return {k,key:o.key,got:!!A.G.keys.d0,chest:px(kc),sprite:px(ks),size:[ks.width,ks.height]};});
  chk(`5 the key chest: its opening is a key chest's (${e.key}), the open chest sprite has ${e.chest} px and the Beacon Key ${e.sprite} px (${e.size&&e.size.join(' x ')}), the key is yours`,(e.k&&e.key===true&&e.got&&e.chest>100&&e.sprite>40)||JSON.stringify(e));
  const f=await ev(()=>{const A=__A;A.V.modal={type:'smithy',tab:'shop'};A.render();const sh=q=>{const el=document.querySelector(q);return el?getComputedStyle(el).textShadow:'missing';};const host=document.querySelector('#modal .rows')||document.querySelector('#modal'),t=document.createElement('button');t.className='btn gold';t.id='v208gold';t.textContent='Confirm';host.appendChild(t);const o={chip:sh('#modal .chip.on'),btn:sh('#v208gold')};t.remove();A.V.modal=null;A.render();return o;});
  chk(`6 text on gold: the selected chip's text shadow is ${f.chip}, a gold button's ${f.btn}`,(f.chip==='none'&&f.btn==='none')||JSON.stringify(f));
  await done(H);})();
