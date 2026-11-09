// v0.14.0 (art helper 6): townsfolk and service NPC art (v3/npcart9.js): every NPC of the first three towns paints in every view and frame without
// exceptions at the walker size, every role maps to a prop, idle B differs from idle A, the player's hero walkers are untouched, and the world draws
// a standing NPC alternating A and B (frozen under gfxStill).
// Usage: PWHTML=../../out/aurelis3.html node v140a.js
const {open,chk,done}=require('./pw');
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'low',hints:false}}));`;
// hash of the hero walkers (mira, lumen, oren; front 0-2, back 0-2, side 0-1) measured on the build without npcart9.js
// 0.14.6: the hero sprites were redrawn (art.js, art2.js), so the expected hash of mira, lumen and oren walkers was re-taken (the check still means: npcart9.js changes no hero pixel)
const HERO_BASE=process.env.HERO_BASE||'794b69de';
(async()=>{const H=await open({w:430,h:800,mobile:true,pre:PRE});const {ev,wait}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(250);
const VIEWS=[['front',0],['front',1],['front',2],['front',3],['back',0],['back',1],['back',2],['side',0],['side',1],['side',3]];
// 1. every NPC of the first three towns
let r=await ev(VIEWS=>{const T=__A.TW.get,gm=T('getMap'),wc=T('walkerCanvas'),bad=[],roles={};let n=0,npcs=0,sizes={};
  ['t0','t1','t2'].forEach(id=>{const m=gm(id);m.npcs.forEach(o=>{if(o.portal||!o.look)return;npcs++;const role=o.look.role||'-';roles[role]=(roles[role]||0)+1;
    VIEWS.forEach(([v,f])=>{try{const c=wc('v140:'+o.name+id,o.look,['light'],null,v,f);n++;sizes[v+c.width+'x'+c.height]=1;if(!c.width||!c.height)bad.push(o.name+' '+v+f+' empty');}catch(e){bad.push(o.name+' '+v+f+' '+e.message);}});});});
  return {npcs,n,bad:bad.slice(0,6),nb:bad.length,roles,sizes:Object.keys(sizes)};},VIEWS);
console.log(JSON.stringify(r));
chk('every NPC of towns 1-3 paints in every view and frame without exceptions ('+r.npcs+' NPCs, '+r.n+' canvases)',r.nb===0&&r.npcs>=12?true:JSON.stringify(r.bad));
chk('the canvases keep one size per view (front/back share, side the same)',r.sizes.length<=3?true:JSON.stringify(r.sizes));
// 2. roles
r=await ev(()=>{const T=__A.TW.get,N=T('NPC9'),vl=T('villagerLook'),bad=[],out={};
  N.roles.forEach(o=>{const L=vl(o.name);out[o.role]=L.prop||(L.wpn!=='none'?L.wpn:'-');
    if(L.role!==o.role)bad.push(o.name+' role '+L.role);
    const ok=L.prop?typeof N.props[L.prop]==='function':(o.role==='guard'?L.wpn==='spear'&&L.sh==='kite'&&L.hat==='helm':o.role==='child'?L.size==='small'&&L.bigHead:false);
    if(!ok)bad.push(o.name+' no prop');});
  const act=['innkeeper','smith','alchemist','clerk','tavern','archivist','beastwarden','guard'].filter(k=>!N.act[k]);
  return {out,bad,act,roles:N.roles.length};});
console.log(JSON.stringify(r.out));
chk('every role (innkeeper smith alchemist clerk tavern archivist beastwarden guard priest shop child elder fisher farmer shepherd ...) maps to a prop ('+r.roles+' roles)',r.bad.length===0&&r.roles>=19?true:JSON.stringify(r.bad));
chk('the act kinds of service NPCs map to roles',r.act.length===0?true:JSON.stringify(r.act));
// 3. idle B differs from idle A for every role, in every view
r=await ev(()=>{const T=__A.TW.get,N=T('NPC9'),vl=T('villagerLook'),wc=T('walkerCanvas'),same=[];
  N.roles.forEach(o=>{const L=vl(o.name);['front','back','side'].forEach(v=>{const a=wc('v140i:'+o.name,L,['light'],null,v,0).toDataURL(),b=wc('v140i:'+o.name,L,['light'],null,v,3).toDataURL();if(a===b)same.push(o.role+' '+v);
    if(v!=='back'){const s1=wc('v140i:'+o.name,L,['light'],null,v,1).toDataURL();if(s1===a)same.push(o.role+' '+v+' walk=stand');}});});
  return same;});
chk('idle B differs from idle A and the stride differs from standing (every role, every view)',r.length===0?true:JSON.stringify(r.slice(0,8)));
// 4. player hero walkers unchanged
const hh=await ev(()=>{const T=__A.TW.get,TPL=T('TPL'),wc=T('walkerCanvas');let s='';
  ['mira','lumen','oren'].forEach(id=>{const t=TPL[id];[['front',0],['front',1],['front',2],['back',0],['back',1],['back',2],['side',0],['side',1]].forEach(([v,f])=>{s+=wc('hero:'+id,t.look,t.el,id,v,f).toDataURL();});});
  let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return {h:(h>>>0).toString(16),vill:!!TPL.mira.look.vill};});
console.log('hero hash',hh.h);
chk('hero looks are never villagers',!hh.vill);
if(HERO_BASE)chk('the player hero walker canvases are byte-identical to the build without npcart9.js',hh.h===HERO_BASE?true:hh.h+' vs '+HERO_BASE);
// 5. the world draws a standing NPC alternating A and B, frozen under gfxStill
r=await ev(()=>{const T=__A.TW.get,m=T('WS').m,wc=T('walkerCanvas'),n=m.npcs.find(o=>!o.portal&&o.look&&o.look.vill);if(!n)return {none:1};
  const key='npc:'+n.name+m.id,L=n.look,v=n.view||'front';n.mv=null;
  const NP=T('NP9'),A=wc(key,L,['light'],null,v,3).toDataURL();let A0=null;for(let t=0;t<2&&A0===null;t++){NP.now=1000+t*700;const u=wc(key,L,['light'],null,v,0).toDataURL();if(u!==A)A0=u;}
  const got=new Set();for(let t=0;t<4;t++){const now=1000+t*700;NP.now=now;try{got.add(wc(key,L,['light'],null,v,0).toDataURL()===A?'B':'A');}catch(e){got.add('x'+e.message);}}
  return {none:0,got:[...got],differ:A0!==null};});
chk('a standing NPC in the world alternates idle A and B over time',r.none?'no npc':(r.got.length===2&&r.differ?true:JSON.stringify(r)));
done(H);})();
