// v0.22.26: relic skills are signature moves, not three shared ones (relics25.js R25.skill / elFx / kindFx).
// Asked: "vanguard heals with regen is too common to make a relic skill, these should be super special and unique".
//  1 every relic skill is named for its hero ("Brann's Reckoning"), no two names alike, one move per class (14)
//  2 no relic skill is a copy of any skill in any class kit, and none is the old heal with Regen
//  3 heroes of one class still differ: element and relic kind shape the move (distinct skills over 85% of the roster)
//  4 in a battle every class's move runs without an error: strikes deal damage, Second Dawn raises a fallen ally
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v210a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v210a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'medium',rmotion:false,hints:false,tips:false}}));`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:META,tag:'v210a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;G.stage=4;G.cleared=[1,1,1,1];});await wait(300);
  const a=await ev(()=>{const g=__A.TW.get,R=window.__R25,TPL=g('TPL'),cs=g('classSkills'),ids=R.heroes(),o={n:ids.length,names:{},dupN:[],badN:[],sig:{},copy:[],regen:[],moves:{},err:R.R25.err||''};
    const sig=s=>JSON.stringify([s.k,s.t,s.pw,s.hits||1,(s.fx||[]).map(q=>q[0]).sort(),(s.self||[]).map(q=>q[0]).sort(),(s.allyFx||[]).map(q=>q[0]).sort(),!!s.crit,!!s.execute,!!s.drain,!!s.strip,!!s.pierce,!!s.shieldChip,s.lbParty||0,!!s.revive,!!s.cleanse]);
    const kit={};ids.forEach(id=>cs(TPL[id]).forEach(s=>{if(!s.relic)kit[sig(s)]=s.n;}));
    ids.forEach(id=>{const t=TPL[id],s=R.skill(id);if(o.names[s.n])o.dupN.push(s.n);o.names[s.n]=1;if(s.n.indexOf(t.n+"'s ")!==0)o.badN.push(s.n);const q=sig(s);o.sig[q]=1;if(kit[q])o.copy.push(s.n+' = '+kit[q]);
      if(s.k==='heal'&&(s.fx||[]).length===1&&s.fx[0][0]==='regen')o.regen.push(s.n);o.moves[t.cls]=s.n.slice(t.n.length+3);if(!/Only while /.test(s.d))o.badN.push(s.n+' text');});
    o.ns=Object.keys(o.sig).length;o.nm=Object.keys(o.moves).length;o.ex=[R.skill('brann'),R.skill('lumen'),R.skill('mira')].map(s=>s.n+': '+s.d);delete o.sig;delete o.names;return o;});
  console.log(a.ex.join('\n'));
  chk(`1 ${a.n} relic skills named for their hero, no two alike, ${a.nm} class moves`,(a.n>=90&&!a.dupN.length&&!a.badN.length&&a.nm===14&&!a.err)||JSON.stringify(a).slice(0,600));
  chk(`2 none copies a kit skill, none is a heal with only Regen`,(!a.copy.length&&!a.regen.length)||JSON.stringify([a.copy.slice(0,5),a.regen.slice(0,5)]));
  chk(`3 ${a.ns} distinct skills over ${a.n} heroes`,a.ns>=a.n*.85||a.ns);
  await ev(()=>{const A=__A;A.TW.get('startBattle')({stage:0,kind:'wild'});A.render();});await wait(3200);
  const b=await ev(()=>{const A=__A,g=A.TW.get,B=A.B,R=window.__R25,TPL=g('TPL'),perform=g('perform'),o={ran:0,err:[],dmg:0,rev:0};const seen={};
    R.heroes().forEach(id=>{const t=TPL[id];if(seen[t.cls])return;seen[t.cls]=1;const s=R.skill(id),a=B.front[0];
      try{B.en.forEach(e=>{e.hp=e.S.mhp;e.st={};});B.front.forEach(c=>{c.hp=c.S.mhp;c.st={};});a.mp=a.S.mmp;
        if(s.k==='heal'){const d=B.front[1];if(s.revive)d.hp=0;else d.hp=1;perform(a,s,B.front.slice());if(s.revive){if(d.hp>0)o.rev++;else o.err.push(s.n+' no revive');}else if(d.hp<=1)o.err.push(s.n+' no heal');}
        else{const before=B.en.reduce((n,e)=>n+e.hp,0);let after=before;for(let i=0;i<4&&after>=before;i++){/* a single shot can miss */perform(a,s,s.t==='one'?[B.en[0]]:B.en.slice());after=B.en.reduce((n,e)=>n+Math.max(0,e.hp),0);}if(after<before)o.dmg++;else o.err.push(s.n+' no damage');}
        o.ran++;}catch(e){o.err.push(s.n+' '+e.message);}});return o;});
  chk(`4 in battle: ${b.ran} class moves ran, ${b.dmg} dealt damage, Second Dawn raised a fallen ally (${b.rev})`,(b.ran===14&&!b.err.length&&b.rev===1)||JSON.stringify(b));
  await done(H);})();
