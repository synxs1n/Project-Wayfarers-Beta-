// legnat20.js: every Legendary has a locked nature of their own, apart from the signature.
//  1 each Legendary (Kaevan, Nikaris, Jace, Joseth, Dist) gets a nature that is not their signature: its own name, not the trait id, not the
//    signature's name, with stats; the pool is that one nature (locked), five different natures
//  2 the nature counts: stats with it differ from stats with no nature, by its own numbers
//  3 the signature is unchanged: TPL.trait, SIG and TRAITS as before
//  4 old saves (a Legendary with no c.nat or the old trait) get it on load; the Guild Hall Nature tab does not list Legendaries
//  5 the hero sheet shows "Nature: <name>", "Legendary nature, locked" and the signature separately
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v200a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v200a ran over 200 s');process.exit(1);},200000).unref();
(async()=>{const H=await open({w:1000,h:700,tag:'v200a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
  const ids=['kaevan','nikaris','jaeson','jose','dist'];
  const r=await ev(ids=>{const A=__A,g=A.TW.get,TPL=g('TPL'),SIG=g('SIG'),TRAITS=g('TRAITS'),NAT=g('NATURES'),natPool=g('natPool'),natOf=g('natOf'),natInfo=g('natInfo');
    return ids.map(id=>{const t=TPL[id];A.TW.get('recruit')(id,true);const c=A.G.roster[id];const k=natOf(c),I=natInfo(k),P=natPool(id);
      const sigN=(SIG[id]||{}).n||'',trN=(TRAITS[t.trait]||[])[0]||'';
      // 2: stats with and without the nature
      const keep=c.nat;const S1=g('calcStats')(c);const fx=I.fx||{};
      return {id,k,n:I.n,trait:t.trait,sigN,trN,pool:P,fx,hasFx:Object.keys(fx).length>0,rl:I.rl,
        own:k!==t.trait&&I.n!==sigN&&I.n!==trN&&!!NAT[k]&&P.length===1&&P[0]===k,
        S1:{hp:S1.mhp,atk:S1.atk,mag:S1.mag,def:S1.def,res:S1.res,agi:S1.agi}};});},ids);
  const names=new Set(r.map(x=>x.n));
  chk(`1 every Legendary has their own locked nature, not the signature (${r.map(x=>x.id+': '+x.n+' vs '+x.sigN).join('; ')})`,(r.every(x=>x.own&&x.hasFx&&x.rl)&&names.size===5)||JSON.stringify(r));
  // 2: the stat keys of the nature move the stats (compare with the template trait, which has no stats)
  const d=await ev(ids=>{const A=__A,g=A.TW.get;return ids.map(id=>{const c=A.G.roster[id],k=c.nat;const a=g('calcStats')(c);
    const L=window.__LN20;L.off=1;const tr=g('TPL')[id].trait;c.nat=tr;let b;try{b=g('calcStats')(c);}finally{L.off=0;c.nat=k;}
    const fx=g('natInfo')(k).fx,o={};if(fx.hp)o.hp=[a.mhp,b.mhp];if(fx.atk)o.atk=[a.atk,b.atk];if(fx.mag)o.mag=[a.mag,b.mag];if(fx.def)o.def=[a.def,b.def];if(fx.res)o.res=[a.res,b.res];if(fx.agi)o.spd=[a.spd,b.spd];
    return {id,o,ok:Object.values(o).every(([x,y])=>x>y)};});},ids);
  chk(`2 the nature's stats count (${d.map(x=>x.id+' '+Object.entries(x.o).map(([k,v])=>k+' '+v[1]+'>'+v[0]).join(',')).join('; ')})`,d.every(x=>x.ok&&Object.keys(x.o).length)||JSON.stringify(d));
  chk(`3 the signatures are unchanged (${r.map(x=>x.trait+' / '+x.sigN).join(', ')})`,r.every(x=>['parthian','beastbond','twinweave','bloodpact','lightfingers'].includes(x.trait)&&x.sigN)||JSON.stringify(r));
  // 4: an old save
  const o=await ev(()=>{const A=__A,g=A.TW.get;const c=A.G.roster.kaevan;delete c.nat;g('calcStats')(c);const a=c.nat;c.nat='parthian';A.TW.get('refresh')(c);const b=c.nat;
    A.V.modal={type:'guild',tab:'nature'};A.render();const html=document.getElementById('modal').innerHTML;A.V.modal=null;A.render();
    return {a,b,listed:['Kaevan','Nikaris','Joseth','Dist'].filter(n=>new RegExp('<b>'+n+'</b>').test(html))};});
  chk(`4 an old save's Legendary gets the nature on the next stat calc (${o.a}, ${o.b}); the Nature tab lists no Legendary (${o.listed.join(',')||'none'})`,(o.a==='l20steppe'&&o.b==='l20steppe'&&!o.listed.length)||JSON.stringify(o));
  // 5: the hero sheet
  const s=await ev(()=>{const A=__A;A.V.modal={type:'char',id:'kaevan'};A.render();const t=(document.getElementById('modal')||{}).textContent||'';A.V.modal=null;A.render();return t;});
  chk(`5 the hero sheet: "Nature: Steppe Rider", locked, and the signature Parthian Shot apart`,(/Nature: Steppe Rider/.test(s)&&/Legendary nature, locked/.test(s)&&/Parthian Shot/.test(s)&&!/Nature: Parthian/.test(s))||s.slice(0,400));
  await done(H);})();
