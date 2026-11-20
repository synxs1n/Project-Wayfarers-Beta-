// v0.22.49 (act49.js, skills.js, items.js, side48.js): the action menu's numbers and tags.
//  1 a skill row says "Power N" (not "Pow"), and no row carries a sub role tag (battle list and hero sheet)
//  2 the Attack button shows a damage kind and an estimate (no element: 0.22.50)
//  3 a tap on a foe makes it the foe the numbers are for: a single target skill's estimate is the damage against that foe (it differs
//    between two unlike foes), a skill that hits all foes keeps the average; the list says whom the numbers are for
//  4 thieves: Throwing Stars, Kunai Volley, the Dart and the Fan are Ranged
//  5 shields: a Knight starts with one; without it the shield skills are not in the battle list and the sheet says "Needs a shield"; with a
//    two-handed weapon the shield slot says why it is empty
//  7 the skill boxes are the same on a big screen and on a phone, and short (0.22.50)
//  6 the Guard glow is drawn (a visible shadow) when the cue asks for it
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v228a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v228a ran over 240 s');process.exit(1);},240000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:2,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false,goals:false}}));`;
(async()=>{const H=await open({w:1280,h:800,mobile:false,pre:META,tag:'v228a'});const {ev,wait}=H;
  await ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;const G=A.G;window.__o0=JSON.stringify(G.roster.oren.eq);
    Object.values(G.roster).forEach(c=>{c.lv=30;c.S=g('calcStats')(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});G.stage=1;G.cleared=[1,0,0,0,0];});
  // 4 and 5 before any battle
  const t=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,TPL=g('TPL'),cs=g('classSkills'),dl=g('deliveryOf'),o={};
    const th=Object.keys(TPL).filter(id=>TPL[id].cls==='thief'&&!TPL[id].mon);o.thrown=[];o.bad=[];th.forEach(id=>{const u={id,side:'p',S:{wp:'dagger'}};cs(TPL[id]).forEach(s=>{if(/Stars|Kunai|Dart|Fan$/.test(s.n)&&s.k==='phys'){const k=dl(u,s);o.thrown.push(s.n+':'+k);if(k!=='ranged')o.bad.push(id+' '+s.n+' '+k);}});});o.kinds=g('CLS_KINDS').thief.join(',');
    const c=G.roster.oren;o.start=window.__o0;const known=g('known'),nm=()=>known(c).map(s=>s.n);o.with=nm().filter(n=>/Shield (Bash|Brand|Throw|Ally)/.test(n)).length;
    const sh=c.eq.s;c.eq.s=null;c.S=g('calcStats')(c);o.without=nm().filter(n=>/Shield (Bash|Brand|Throw|Ally)/.test(n)).length;o.kept=nm().length;
    A.V.modal={type:'char',id:'oren'};A.render();const txt=document.getElementById('modal').innerText;o.note=(txt.match(/Needs a shield/g)||[]).length;
    const w0=c.eq.w,two=Object.keys(g('GEAR')).find(id=>{const x=g('GEAR')[id];return x.slot==='w'&&g('canEquip')(c,id)&&!window.__SH20.one(c,id);});c.eq.w=two;c.S=g('calcStats')(c);A.render();o.two=two;o.slot=/No shield: two-handed weapon/.test(document.getElementById('modal').innerText);
    c.eq.w=w0;c.eq.s=sh;c.S=g('calcStats')(c);A.V.modal=null;A.render();return o;});
  chk(`4 thieves throw Ranged again: ${[...new Set(t.thrown)].slice(0,6).join(', ')} (${t.bad.length} not ranged); the class reaches ${t.kinds}`,t.thrown.length>8&&!t.bad.length&&/ranged/.test(t.kinds)||JSON.stringify(t.bad.slice(0,6)));
  chk(`5 a Knight starts with a shield (${t.start}); the four shield skills are known with it (${t.with}) and gone without (${t.without}, ${t.kept} skills left), the sheet says "Needs a shield" ${t.note} times; with ${t.two} the slot says why it is empty (${t.slot})`,
    /s_shield_/.test(t.start)&&t.with===4&&t.without===0&&t.kept>=4&&t.note>=3&&t.slot||JSON.stringify(t));/* the sheet lists one of the four in a second place without the tag */
  await ev(()=>{const A=__A;A.TW.get('startBattle')({stage:1,kind:'wild'});const B=A.B;while(B.en.length<2)B.en.push(Object.assign({},B.en[0],{st:{},name:'Twin',S:Object.assign({},B.en[0].S)}));B.en[1].S=Object.assign({},B.en[1].S,{def:Math.round(B.en[1].S.def*3)+40,res:Math.round(B.en[1].S.res*3)+40});A.render();});
  for(let i=0;i<80;i++){await wait(300);if(await ev(()=>{const B=__A.B;return !!(B&&B.cur&&B.cur.side==='p'&&B.mode==='cmd'&&B.menu==='root'&&document.querySelector('#bcmd [data-arg="skills"]'));}))break;}await wait(300);
  const at=await ev(()=>{const b=document.querySelector('#bcmd [data-arg="attack"]');return {txt:b.innerText.replace(/\s+/g,' ').trim(),ico:b.querySelectorAll('.a49a img').length,est:(b.querySelector('.a49a b')||{}).textContent||''};});
  chk(`2 the Attack button: "${at.txt}" (${at.ico} icon)`,/^Attack/.test(at.txt)&&!/No element/.test(at.txt)&&/Slash|Blunt|Piercing|Ranged|Magic/.test(at.txt)&&/^~\d+/.test(at.est)&&at.ico>=1||JSON.stringify(at));
  await ev(()=>{const B=__A.B;B.cur=B.front.find(c=>c.id==='mira')||B.cur;B.menu='root';B.mode='cmd';__A.TW.get('renderBattle')();document.querySelector('#bcmd [data-arg="skills"]').click();});await wait(500);
  const rows=()=>ev(()=>[...document.querySelectorAll('#bcmd .menu.list .mi')].map(m=>({n:m.querySelector('.n').childNodes[1]?m.querySelector('.n').textContent:'',id:m.dataset.arg,est:(m.querySelector('.sk11e')||{}).textContent||'',strip:(m.querySelector('.sk11s')||{}).textContent||'',all:m.textContent})));
  const r0=await rows(),vs0=await ev(()=>(document.querySelector('.a49vs')||{}).textContent||'');
  chk(`1 the rows say Power (${r0.filter(r=>/Power \d+/.test(r.strip)).length} of ${r0.length}) and none says Pow, Sub or Off x (${r0.filter(r=>/Pow \d|Sub x|Off x/.test(r.all)).length})`,r0.length>3&&r0.some(r=>/Power \d+/.test(r.strip))&&!r0.some(r=>/Pow \d|Sub x|Off x/.test(r.all))||JSON.stringify(r0.map(r=>r.strip)));
  const pick=async i=>{await ev(i=>{const f=document.querySelectorAll('#bparty .fc');(f[i]||document.querySelectorAll('#bstage .unit.foe')[i]).click();},i);await wait(400);return {rows:await rows(),vs:await ev(()=>(document.querySelector('.a49vs')||{}).textContent||''),f:await ev(()=>__A.B.a49f),menu:await ev(()=>__A.B.menu),mark:await ev(()=>document.querySelectorAll('.a49f').length)};};
  const a=await pick(0),b=await pick(1);
  const sk=await ev(()=>{const g=__A.TW.get,B=__A.B;return g('known')(B.cur).filter(s=>s.k==='mag'||s.k==='phys').map(s=>({id:s.id,t:s.t||'one'}));});
  const one=sk.filter(s=>s.t==='one').map(s=>s.id),all=sk.filter(s=>s.t==='all').map(s=>s.id),est=(R,id)=>(R.rows.find(r=>r.id===id)||{}).est;
  chk(`3 before a tap: "${vs0.slice(0,40)}"; after a tap on foe 1 then foe 2 (focus ${a.f}, ${b.f}; still the list: ${b.menu}; ${b.mark} marked): single target ${one[0]} ${est(a,one[0])} then ${est(b,one[0])}, all foes ${all[0]} ${est(a,all[0])} then ${est(b,all[0])}; the line: "${b.vs.slice(0,36)}"`,
    /average/.test(vs0)&&a.f===0&&b.f===1&&b.menu==='skills'&&b.mark>=1&&one.length>0&&one.every(id=>est(a,id)!==est(b,id))&&(all.length===0||all.every(id=>est(a,id)===est(b,id)&&/each/.test(est(a,id))))&&/Numbers against/.test(b.vs)||JSON.stringify([vs0,a.f,b.f,one.map(id=>[est(a,id),est(b,id)]),all.map(id=>[est(a,id),est(b,id)]),b.vs]));
  const bx=await ev(()=>{const m=[...document.querySelectorAll('#bcmd .menu.list .mi')].map(e=>e.getBoundingClientRect());return {n:m.length,h:Math.max(...m.map(x=>x.height)),cols:new Set(m.map(x=>Math.round(x.x))).size};});
  chk(`7 the skill boxes at 1280x800: ${bx.n} in ${bx.cols} columns, the tallest ${Math.round(bx.h)} px`,bx.n>3&&bx.cols>=3&&bx.h<=125||JSON.stringify(bx));
  // 6 the glow
  const gl=await ev(()=>{const A=__A,g=A.TW.get,B=A.B;g('b9Cue=function(){return {k:"guard",glow:"guard",txt:"Guard!",tip:"test"};}');B.menu='root';g('renderBattle')();const b=document.querySelector('#bcmd [data-arg="guard"]'),cs=getComputedStyle(b);return {cls:b.className,txt:b.textContent,sh:cs.boxShadow,bc:cs.borderTopColor,an:cs.animationName};});
  chk(`6 the Guard button glows on its cue ("${gl.txt}", border ${gl.bc}, animation ${gl.an})`,/b9glow/.test(gl.cls)&&/Guard!/.test(gl.txt)&&/255, 20[0-9], 74|rgb\(255, 208, 74\)/.test(gl.bc)&&gl.sh&&gl.sh!=='none'&&gl.sh.split('rgb').length>=3&&gl.an==='b9glow'||JSON.stringify(gl));
  await H.browser.close();
  const P=await open({w:390,h:844,mobile:true,pre:META,tag:'v228a'});
  await P.ev(()=>{const A=__A,g=A.TW.get;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;Object.values(A.G.roster).forEach(c=>{c.lv=30;c.S=g('calcStats')(c);c.hp=c.S.mhp;c.mp=c.S.mmp;});A.G.stage=1;A.G.cleared=[1,0,0,0,0];g('startBattle')({stage:1,kind:'wild'});A.render();});
  for(let i=0;i<80;i++){await P.wait(300);if(await P.ev(()=>{const B=__A.B;return !!(B&&B.cur&&B.cur.side==='p'&&B.mode==='cmd'&&B.menu==='root'&&document.querySelector('#bcmd [data-arg="skills"]'));}))break;}
  await P.ev(()=>document.querySelector('#bcmd [data-arg="skills"]').click());await P.wait(700);
  const ph=await P.ev(()=>{const L=[...document.querySelectorAll('#bcmd .menu.list .mi')],m=L.map(e=>e.getBoundingClientRect()),c=document.getElementById('bcmd').getBoundingClientRect();return {n:m.length,h:Math.max(...m.map(x=>x.height)),inView:m.filter(x=>x.top>=c.top&&x.bottom<=innerHeight+1).length,parts:['.n','small','.sk11e','.sk11c'].every(s=>{const e=L[0].querySelector(s);return e&&e.getBoundingClientRect().width>2;}),sx:document.documentElement.scrollWidth>innerWidth+1};});
  chk(`7 a phone (390x844) shows the same boxes: ${ph.n} skills, the tallest ${Math.round(ph.h)} px, ${ph.inView} in view at once, name, text, estimate and cost on each`,ph.n>3&&ph.h<=125&&ph.inView>=5&&ph.parts&&!ph.sx||JSON.stringify(ph));
  await done(P);})();
