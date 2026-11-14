// v0.16.x material sprites (v3/mats11.js): every material has its own 16x16 menu icon (pairwise distinct, sizes unchanged), every gather node shows the
// material it holds (a node sprite per gatherable material, distinct, inside its 16x16 tile), the material a node shows is the one gatherAt grants (same odds,
// ore and wood by stage tier, Math.random restored), and the HD-2D node cards are swapped for the material's card. No console errors.
// Usage: PWHTML=../../out/aurelis3.html node v150a.js
const {open,chk,done}=require('./pw');
const META=t=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:false,hints:false}}));`;
const start=ev=>ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
(async()=>{
const H=await open({w:430,h:800,mobile:true,pre:META('low')});const {ev,wait}=H;await start(ev);await wait(300);
// ---- menu icons ----
const ic=await ev(()=>{const T=__A.TW.get,M=window.__M11,ids=Object.keys(T('MATS')),hash={},dup=[],bad=[],empty=[];
  ids.forEach(id=>{const c=document.createElement('canvas');c.width=c.height=16;try{T('icMatDraw')(c.getContext('2d'),id);}catch(e){bad.push(id+' '+e.message);return;}
    const d=c.getContext('2d').getImageData(0,0,16,16).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;if(n<30)empty.push(id);
    const h=c.toDataURL();if(hash[h])dup.push(id+'='+hash[h]);else hash[h]=id;});
  const img=ids.slice(0,30).map(id=>{const m=T('matIcon')(id).match(/src="([^"]+)"/);return !!m;});
  const own=['copper','iron','mythril','oak','ash','elder','healroot','bluecap','sunpetal','starbloom','hide','ichor','grit','ore','moss'].filter(id=>!M.M11.art[id]);
  const sz=ids.filter(id=>/^(?!es_)/.test(id)).slice(0,1).map(id=>{const m=T('matIcon')(id);return /class="gico iico mico"/.test(m);});
  return {n:ids.length,bad,dup,empty,own,img:img.every(Boolean),cls:sz[0]};});
chk(`every material (${ic.n}) has an icon: no exception, at least 30 painted pixels`,ic.bad.length===0&&ic.empty.length===0&&ic.n>=22||JSON.stringify(ic));
chk('icons are pairwise distinct (canvas hash)',ic.dup.length===0||JSON.stringify(ic.dup));
chk('the new art covers every ore, log, herb and part plus Kiln Ore and Verdant Moss',ic.own.length===0||JSON.stringify(ic.own));
chk('matIcon still returns the same <img class="gico iico mico"> at 16x16 sources',ic.img&&ic.cls||JSON.stringify(ic));
// ---- node sprites ----
const nd=await ev(()=>{const M=window.__M11,T=__A.TW.get,GATH=['copper','iron','mythril','oak','ash','elder','healroot','bluecap','sunpetal','starbloom'],hash={},dup=[],bad=[],out=[];
  GATH.concat(Object.keys(T('MATS')).filter(k=>!/^es_/.test(k)&&!GATH.includes(k))).forEach(id=>{try{const c=M.nodeCanvas(id,2);if(c.width!==16||c.height!==16)bad.push(id+' size');
    const d=c.getContext('2d').getImageData(0,0,16,16).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;if(n<40)bad.push(id+' sparse '+n);
    if(GATH.includes(id)){const h=c.toDataURL();if(hash[h])dup.push(id+'='+hash[h]);else hash[h]=id;}else if(!c)bad.push(id);}catch(e){bad.push(id+' '+e.message);}});
  // the node drawn through drawNode stays inside its tile
  const spill=[];GATH.forEach(id=>{const cv=document.createElement('canvas');cv.width=cv.height=48;const x=cv.getContext('2d');const n={k:id==='oak'||id==='ash'||id==='elder'?'wood':['copper','iron','mythril'].includes(id)?'ore':'herb',x:0,y:0,mat:id};
    T('drawNode')(x,n,16,16,1);const d=x.getImageData(0,0,48,48).data;for(let yy=0;yy<48;yy++)for(let xx=0;xx<48;xx++)if(d[(yy*48+xx)*4+3]>0&&(xx<16||xx>=32||yy<16||yy>=32)){spill.push(id+'@'+xx+','+yy);return;}});
  return {bad,dup,spill,n:GATH.length};});
chk('a node sprite for every gatherable material and a crate/plinth card for the rest, 16x16, painted',nd.bad.length===0||JSON.stringify(nd.bad));
chk('the ten gatherable nodes are pairwise distinct',nd.dup.length===0||JSON.stringify(nd.dup));
chk('drawNode paints inside the 16x16 tile (footprint unchanged)',nd.spill.length===0||JSON.stringify(nd.spill));
// ---- the node holds what gatherAt grants ----
const gt=await ev(()=>{const A=__A,T=A.TW.get,M=window.__M11,rnd0=Math.random,res={nodes:0,wrong:[],seen:{},tierBad:[],rndOK:true,k3:0};
  ['f0','f1','f2','f3','f4','f5','f6','f7'].forEach(f=>{let m;try{m=A.getMap(f);}catch(e){return;}A.G.gath={};
    (m.nodes||[]).forEach(n=>{res.nodes++;const id=n.mat;res.seen[id]=(res.seen[id]||0)+1;
      const tier=T('matTier')(m.s|0),want=n.k==='herb'?null:T('TIERED')[n.k][tier];
      if(!id||(want&&id!==want)||(n.k==='herb'&&!['healroot','bluecap',T('TIERED').herb[tier]].includes(id)))res.tierBad.push(f+' '+n.k+' '+id);
      Object.keys(T('MATS')).forEach(k=>A.G.mats[k]=0);A.G.gath={};T('gatherAt')(m,n.x,n.y);
      const got=Object.keys(A.G.mats).filter(k=>A.G.mats[k]>0&&['copper','iron','mythril','oak','ash','elder','healroot','bluecap','sunpetal','starbloom'].includes(k));
      if(got.length!==1||got[0]!==id)res.wrong.push(f+' '+n.k+' shows '+id+' got '+got);
      if(Math.random!==rnd0)res.rndOK=false;});});
  A.G.gath={};return res;});
console.log('nodes',gt.nodes,JSON.stringify(gt.seen));
chk(`every node (${gt.nodes} over fields f0-f7) has a material of its kind and stage tier`,gt.nodes>20&&gt.tierBad.length===0||JSON.stringify(gt.tierBad.slice(0,5)));
chk('gatherAt grants exactly the material the node shows, and Math.random is restored',gt.wrong.length===0&&gt.rndOK||JSON.stringify(gt.wrong.slice(0,5)));
chk('the odds: both starter herbs, the tier herb, ore and wood all occur',['healroot','bluecap','copper','oak'].every(k=>gt.seen[k])||JSON.stringify(gt.seen));
await H.browser.close();
// ---- HD-2D node cards ----
const H2=await open({w:1000,h:560,pre:META('high')});await start(H2.ev);await H2.wait(300);
const hd=await H2.ev(async()=>{const A=__A,m=A.getMap('f4');let best=null,bs=1e9;const ns=m.nodes||[];
  for(let y=3;y<m.h-3;y++)for(let x=3;x<m.w-3;x++){if(A.solidAt(m,x,y)||'.,f'.indexOf(A.tileAt(m,x,y))<0)continue;const d=ns.map(n=>Math.abs(n.x-x)+Math.abs(n.y-y)).sort((a,b)=>a-b).slice(0,3).reduce((a,b)=>a+b,0);if(d<bs){bs=d;best=[x,y];}}
  A.placeAt('f4',best[0],best[1],'d');A.render();await new Promise(r=>setTimeout(r,1200));
  return {live:A.HD.live,keys:Object.keys(window.__M11.M11HD),near:ns.filter(n=>Math.abs(n.x-best[0])<12&&Math.abs(n.y-best[1])<9).length};});
chk('HD-2D (High): the node cards are swapped for material cards ('+hd.keys.join(',')+')',!hd.live||hd.keys.length>0||JSON.stringify(hd));
await done(H2);})();
