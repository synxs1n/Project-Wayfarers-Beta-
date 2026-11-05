// v0.6.3 art pass: capes no longer drawn on heroes; the weapon and the personal reward still change the look; every item icon is unique.
// Run from tools/chrome: PWHTML=../../out/aurelis3.html node v063s.js
const {open,chk,done}=require('./pw');
(async()=>{
const H=await open({w:430,h:880,mobile:true});const {ev,wait,page}=H;
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.stage=3;A.G.gold=99999;});
await page.waitForFunction(()=>__A.V.screen==='world',{timeout:20000});
// ----- 1. capes -----
const cape=await ev(()=>{const A=__A,G=A.G,out={};
  const pic=(id,walk)=>A.heroCanvas(id,walk).toDataURL();
  const walker=(id,view,f)=>A.walkerCanvas('t:'+Math.random(),A.heroLook(id),A.TPL[id].el,id,view,f).toDataURL();
  const snap=id=>({side:pic(id),walk:pic(id,true),front:walker(id,'front',0),back:walker(id,'back',0),wside:walker(id,'side',1),key:A.lookKey(id)});
  ['mira','lumen','oren'].forEach(id=>{const c=G.roster[id];c.eq.k=null;const a=snap(id);
    const per={};[0,3,5].forEach(t=>{c.eq.k='k_cape_'+t;const b=snap(id);per[t]=Object.keys(a).every(k=>a[k]===b[k]);});
    c.eq.k='k_cape_4+2';const tm=snap(id);per.tempered=Object.keys(a).every(k=>a[k]===tm[k]);
    c.eq.k=null;out[id]=per;});
  // shop armor never changes the look either
  {const c=G.roster.mira,a0=c.eq.a;c.eq.a='a_robe_0';const x=pic('mira');c.eq.a='a_robe_5';const y=pic('mira');c.eq.a=a0;out.armor=x===y;}
  // an old save with a cape equipped (unpacked from the packed form) looks like the hero without one
  {const c=G.roster.oren;c.eq.k=null;const a=pic('oren');c.eq.k='k_cape_5';const P=JSON.parse(JSON.stringify(A.packG()));const U=A.unpackG(P);const keep=A.G;A.G=U;
    const b=A.heroCanvas('oren').toDataURL(),k=A.lookKey('oren'),hasCape=!!(U.roster.oren.eq||{}).k;A.G=keep;c.eq.k=null;out.oldSave={same:a===b,key:k,hasCape};}
  // the battle sprite and the portrait use the same cache key with or without a cape
  {const c=G.roster.lumen;c.eq.k=null;const u1=A.heroURL('lumen');c.eq.k='k_cape_2';const u2=A.heroURL('lumen');c.eq.k=null;out.url=u1===u2;}
  return out;});
['mira','lumen','oren'].forEach(id=>chk(`capes: ${id} looks the same with a tier 0, 3 or 5 cape (side, walk, world front, back and side frames)`,cape[id][0]&&cape[id][3]&&cape[id][5]||JSON.stringify(cape[id])));
chk('capes: a tempered cape changes nothing either',['mira','lumen','oren'].every(id=>cape[id].tempered)||JSON.stringify(cape));
chk('capes: shop armor (tier 0 vs tier 5 robe) does not change the sprite',cape.armor===true);
chk('capes: an old save with a cape equipped keeps the cape (stats) but draws no cape',cape.oldSave.same&&cape.oldSave.hasCape&&cape.oldSave.key===''||JSON.stringify(cape.oldSave));
chk('capes: the portrait cache key does not split by cape',cape.url===true);
// ----- 2. weapon and personal reward looks stay -----
const look=await ev(()=>{const A=__A,G=A.G,out={};const pic=id=>A.heroCanvas(id).toDataURL();
  const add=id=>{if(!G.roster[id])G.roster[id]=A.newChar(id,20,3);return G.roster[id];};
  {const c=add('mira'),w0=c.eq.w,a=pic('mira'),k0=A.lookKey('mira');c.eq.w='u_mira';const b=pic('mira'),k1=A.lookKey('mira');c.eq.w=w0;out.weapon={changed:a!==b,key:k0!==k1};}
  {const c=add('brann'),a0=c.eq.a,a=pic('brann');c.eq.a='ua_brann';const b=pic('brann'),k1=A.lookKey('brann');c.eq.k='k_cape_5';const b2=pic('brann');c.eq.k=null;c.eq.a=a0;out.oath={changed:a!==b,key:k1.includes('ua_brann'),capeSame:b===b2};}
  {const c=add('tess'),c0=c.eq.c,a=pic('tess');c.eq.c='uc_tess';const b=pic('tess');c.eq.c=c0;out.token={changed:a!==b};}
  // a hero's own cape from the base look stays (Brann wears one in his look data)
  out.baseCape=(A.TPL.brann.look.back||[]).includes('cape')&&(A.heroLook('brann').back||[]).includes('cape');
  return out;});
chk('weapon: a signature weapon still changes the sprite and the cache key',look.weapon.changed&&look.weapon.key||JSON.stringify(look.weapon));
chk('personal reward: the Oathmantle look is kept (and a cape on top adds nothing)',look.oath.changed&&look.oath.key&&look.oath.capeSame||JSON.stringify(look.oath));
chk('personal reward: the Token look is kept',look.token.changed===true);
chk("a hero's own cape from the base look stays",look.baseCape===true);
// ----- 3. icons -----
const ic=await ev(async()=>{const A=__A;const src=h=>{const m=/src="([^"]+)"/.exec(h||'');return m?m[1]:'';};
  const L=[];Object.keys(A.GEAR).forEach(id=>{const g=A.GEAR[id];L.push({id,kind:'gear',fam:/^[wak]_([a-z]+)_\d$/.test(id)?id.split('_')[1]:null,tier:g.tier||0,u:src(A.gearIcon(id))});});
  Object.keys(A.ITEMS).forEach(id=>L.push({id,kind:'item',u:src(A.itemIcon(id))}));
  Object.keys(A.MATS).forEach(id=>L.push({id,kind:'mat',u:src(A.matIcon(id))}));
  const load=u=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=16;c.height=16;const x=c.getContext('2d');x.drawImage(i,0,0);r(x.getImageData(0,0,16,16).data);};i.onerror=()=>r(null);i.src=u;});
  for(const d of L)d.px=await load(d.u);
  const bad=L.filter(d=>!d.px||d.px.every((v,i)=>i%4!==3||v===0)).map(d=>d.id);
  const diff=(a,b)=>{let n=0;for(let i=0;i<1024;i+=4){if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])+Math.abs(a[i+3]-b[i+3])>24)n++;}return n;};
  const mask=(a,b)=>{let n=0;for(let i=3;i<1024;i+=4)if((a[i]>128)!==(b[i]>128))n++;return n;};
  let same=[],close=[],minD=999,minPair='';
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){if(!L[i].px||!L[j].px)continue;const d=diff(L[i].px,L[j].px);if(d<minD){minD=d;minPair=L[i].id+' / '+L[j].id;}if(d===0)same.push(L[i].id+'='+L[j].id);else if(d<8)close.push(L[i].id+'~'+L[j].id+':'+d);}
  // tier variants of one family must differ in shape, not only in colour
  const fams={};L.filter(d=>d.fam).forEach(d=>{(fams[d.fam]=fams[d.fam]||[]).push(d);});const flat=[];let fmin=999;
  Object.keys(fams).forEach(f=>{const a=fams[f];for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const m=mask(a[i].px,a[j].px);fmin=Math.min(fmin,m);if(m<4)flat.push(a[i].id+'/'+a[j].id+':'+m);}});
  // rarer is more ornate: more colours on average at tier 5 than tier 0, and never fewer tier by tier on average
  const cols=p=>{const s=new Set();for(let i=0;i<1024;i+=4)if(p[i+3]>0)s.add(p[i]+','+p[i+1]+','+p[i+2]+','+p[i+3]);return s.size;};
  const byT=[0,1,2,3,4,5].map(t=>{const a=L.filter(d=>d.fam&&d.tier===t);return a.reduce((s,d)=>s+cols(d.px),0)/a.length;});
  // personal rewards differ from the shop piece of the same family
  const sig=[];L.filter(d=>/^u[ac]?_/.test(d.id)).forEach(d=>{const g=A.GEAR[d.id];const base=g.slot==='w'?'w_'+g.fam+'_4':g.slot==='a'?'a_'+g.fam+'_4':null;const b=base&&L.find(x=>x.id===base);if(b){const m=mask(d.px,b.px);if(m<6)sig.push(d.id+':'+m);}});
  // echoforged icons differ from the mythic shop piece
  const ef=L.filter(d=>/_ef$/.test(d.id)).map(d=>{const b=L.find(x=>x.id===d.id.replace('_ef','_5'));return b?diff(d.px,b.px):0;});
  return {n:L.length,gear:L.filter(d=>d.kind==='gear').length,items:L.filter(d=>d.kind==='item').length,mats:L.filter(d=>d.kind==='mat').length,bad,same,close,minD,minPair,flat,fmin,byT,sig,ef,urls:new Set(L.map(d=>d.u)).size};});
console.log(`icons ${ic.n} (gear ${ic.gear}, items ${ic.items}, materials ${ic.mats}), distinct images ${ic.urls}, closest pair ${ic.minD} px (${ic.minPair}), closest tier variants ${ic.fmin} px of shape`);
console.log('colours per icon by tier',ic.byT.map(v=>v.toFixed(1)).join(' '));
chk('icons: every gear, item and material icon draws something',ic.bad.length===0||ic.bad.join(' '));
chk('icons: no two different items render identically',ic.same.length===0||ic.same.slice(0,20).join(' '));
chk('icons: every pair differs in at least 8 pixels',ic.close.length===0||ic.close.slice(0,20).join(' '));
chk('icons: tier variants of a family differ in shape (4+ pixels of silhouette)',ic.flat.length===0||ic.flat.slice(0,80).join(' '));
chk('icons: rarer gear is more ornate (more colours at tier 5 than tier 0, rising overall)',ic.byT[5]>ic.byT[0]+3&&ic.byT[4]>ic.byT[1]||ic.byT.join(','));
chk('icons: signature weapons and Oathmantles have their own silhouettes (6+ pixels from the tier 4 shop piece)',ic.sig.length===0||ic.sig.slice(0,20).join(' '));
chk('icons: Echoforged pieces differ from the mythic shop piece',ic.ef.length===6&&ic.ef.every(d=>d>=20)||JSON.stringify(ic.ef));
// tempered pips still show and the Stick still glows
const misc=await ev(()=>{const A=__A,src=h=>(/src="([^"]+)"/.exec(h)||[])[1];return {plus:src(A.gearIcon('w_blade_2'))!==src(A.gearIcon('w_blade_2+2')),stick:!!src(A.gearIcon('w_stick')),frame:/gframe/.test(A.gearIcon('u_mira'))};});
chk('icons: tempered gear keeps its +N pips, the Stick has an icon, icons sit in the tier frame',misc.plus&&misc.stick&&misc.frame||JSON.stringify(misc));
// the shop and the equipment menu render with the new icons and no errors
await ev(()=>{__A.V.modal={type:'smithy',tab:'weapons'};__A.render();});await wait(200);
const shopIcons=await ev(()=>document.querySelectorAll('#modal img.gico').length);
chk('icons: the Smithy shows gear icons',shopIcons>3||shopIcons);
await done(H);
})();
