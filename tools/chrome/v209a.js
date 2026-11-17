// v0.22.25: personal relics reworked (relics25.js) and readable damage numbers.
//  1 every wayfarer has one relic; five kinds (weapon, armor, charm, boots, shield), no kind over 45% of the roster, shields only for
//    Warriors and Knights, the Legendary wayfarers keep a weapon
//  2 a relic is named "X's ..." without the word Relic, is of the Legendary rarity (index 7), bound to its hero, wearable by them only
//  3 best in slot: worn by its hero at the fifth realm it beats the best shop piece of its slot at +3 for that hero
//  4 the bonuses apply while it is worn (a stat the class's bonus touches moves) and are named in the item text
//  5 the skill: known only while the relic is worn, listed in the item text, the class kit itself still 14
//  6 damage numbers: the text face (Nunito), not the pixel face, and larger than before (8 logical px on a phone, was 6.5)
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v209a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v209a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:META,tag:'v209a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;G.stage=4;G.cleared=[1,1,1,1];});await wait(300);
  const a=await ev(()=>{const g=__A.TW.get,R=window.__R25,TPL=g('TPL'),ids=R.heroes(),cnt={},bad=[];ids.forEach(id=>{const k=R.kind(id);cnt[k]=(cnt[k]||0)+1;if(k==='s'&&!['warrior','knight'].includes(TPL[id].cls))bad.push(id+' shield');
      const leg=TPL[id].legend||g('CLS')[TPL[id].cls].legend;if(leg&&k!=='w')bad.push(id+' legend '+k);const q=g('gearOf')(R.gid(id));if(!q)bad.push(id+' no gear');});return {n:ids.length,cnt,bad,err:R.R25.err||null};});
  const top=Math.max(...Object.values(a.cnt))/a.n;
  chk(`1 ${a.n} wayfarers, one relic each: ${Object.keys(a.cnt).sort().map(k=>k+' '+a.cnt[k]).join(', ')}`,(a.n>=90&&Object.keys(a.cnt).length===5&&top<=.45&&!a.bad.length&&!a.err)||JSON.stringify(a));
  const b=await ev(()=>{const A=__A,g=A.TW.get,G=g('G'),R=window.__R25,TPL=g('TPL'),bad=[],out={n:0,best:0,perk:0,skill:0,txt:0};const mv=['crit','critDmg','acc','eva','pierce','spellPow','healUp','mpEff','tempo','mhp','def'];
    R.heroes().forEach(id=>{try{const gid=R.gid(id),q=g('gearOf')(gid),t=TPL[id];if(!G.roster[id])G.roster[id]=g('newChar')(id,30,3);const c=G.roster[id];out.n++;
        if(/Relic/.test(q.n)||q.n.indexOf(t.n+"'s ")!==0)bad.push(id+' name '+q.n);if(g('gTierIdx')(q)!==7||g('ITEM_TIERS')[7].n!=='Legendary')bad.push(id+' rarity');if(q.only!==id||!q.relic)bad.push(id+' not bound');
        const other=Object.keys(G.roster).find(o=>o!==id);if(other&&g('canEquip')(G.roster[other],gid))bad.push(id+' wearable by '+other);
        const S0=g('calcStats')(c),k0=g('classSkills')(t).filter(s=>g('skillKnown')(c,s)).map(s=>s.id);if(k0.some(s=>/^relic_/.test(s)))bad.push(id+' skill without the relic');
        // the best shop piece of the slot at +3 for this hero
        const sl=q.slot,stock=g('shopStock')(sl==='w'?'weapons':sl==='c'?'charms':'armor').filter(x=>g('gearOf')(x)&&g('gearOf')(x).slot===sl&&g('canEquip')(c,x));let bestShop=0;stock.forEach(x=>{const top3=g('gearOf')(x+'+3')?x+'+3':x;bestShop=Math.max(bestShop,g('loadoutScore')(c,g('statsWith')(c,sl,top3)));});
        if(!g('canEquip')(c,gid)){if(sl!=='s')bad.push(id+' cannot wear '+gid);return;}
        const sc=g('loadoutScore')(c,g('statsWith')(c,sl,gid));if(sc>=bestShop)out.best++;else bad.push(id+' '+gid+' '+sc.toFixed(1)+' under the shop '+bestShop.toFixed(1));
        G.gear.push(gid);g('equipGear')(c,gid);const S1=g('calcStats')(c),k1=g('classSkills')(t).filter(s=>g('skillKnown')(c,s)).map(s=>s.id);
        if(mv.some(k=>Math.abs((S1[k]||0)-(S0[k]||0))>1e-6))out.perk++;else bad.push(id+' no bonus');if(k1.includes('relic_'+id)&&k1.length===k0.length+1)out.skill++;else bad.push(id+' skill '+k0.length+'>'+k1.length);
        const d=g('gearDesc')(q);if(/grants the skill Awakened /.test(d))out.txt++;else bad.push(id+' text');}catch(e){bad.push(id+' '+e.message);}});
    const kit=g('classSkills')(TPL.mira).filter(s=>!s.relic).length;return Object.assign(out,{bad,kit});});
  chk(`2 ${b.n} relics named "X's ...", Legendary, bound to their hero`,!b.bad.some(x=>/name|rarity|not bound|wearable/.test(x))||JSON.stringify(b.bad.filter(x=>/name|rarity|bound|wearable/.test(x)).slice(0,5)));
  chk(`3 best in slot: ${b.best} relics at or over the best shop piece of their slot at +3 for their hero`,(b.best>=b.n-4&&!b.bad.some(x=>/under the shop|cannot wear/.test(x)))||JSON.stringify(b.bad.filter(x=>/under|cannot/.test(x)).slice(0,5)));
  chk(`4 the class bonus applies while worn (${b.perk} of ${b.n}) and is in the item text (${b.txt})`,(b.perk>=b.n-4&&b.txt>=b.n-4&&!b.bad.some(x=>/no bonus|text/.test(x)))||JSON.stringify(b.bad.filter(x=>/bonus|text/.test(x)).slice(0,5)));
  chk(`5 the relic's skill is known only while it is worn (${b.skill} of ${b.n}); a class kit is still ${b.kit}`,(b.skill>=b.n-4&&b.kit===14&&!b.bad.some(x=>/skill/.test(x)))||JSON.stringify(b.bad.filter(x=>/skill/.test(x)).slice(0,5)));
  await ev(()=>{const A=__A;A.TW.get('startBattle')({stage:0,kind:'wild'});A.render();});await wait(3200);
  const c=await ev(async()=>{const A=__A,B=A.B,fx=A.TW.get('fx');fx(B.en.find(x=>x.hp>0),'128','dmg');A.render();await new Promise(r=>setTimeout(r,450));const el=document.querySelector('.fxlayer .fx2.b3fx');if(!el)return {none:1};const cs=getComputedStyle(el);return {font:cs.fontFamily,w:cs.fontWeight,size:A.TW.get('fxSize')(),px:parseFloat(cs.fontSize)};});
  chk(`6 damage numbers: ${c.font} ${c.w}, ${c.size} logical px (${c.px} px on screen)`,(!c.none&&/Nunito/.test(c.font)&&!/Pixelify/.test(c.font)&&+c.w>=800&&c.size>=8)||JSON.stringify(c));
  await done(H);})();
