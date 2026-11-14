// v0.19.x titles12.js: the area title banner. Layout on phones and wide screens (never over the minimap, two lines at most), shown on
// arrival only (not after a battle), no weather and no second Breach line, kind word above the name with no trailing Sanctum/Den/Lair,
// a rule shape per kind, the Breach text without Echoes, the fantasy face loaded for the banner, Victory and modal headings.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v171a.js
const {open,chk,done}=require('./pw');
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'high',rmotion:false,hints:false,hd2d:true}}));`;
const go=(H,id)=>H.ev(id=>{const A=__A,T=A.TW.get;A.G.stage=4;A.G.won=1;A.G.breachLook=1;A.V.modal=null;A.WS.dlg=null;const m=T('getMap')(id);T('placeAt')(id,m.start?m.start[0]:3,m.start?m.start[1]:3,'d');T('showLocation')();A.render();},id);
const ban=H=>H.ev(()=>{const e=document.getElementById('wloc');const r=e.getBoundingClientRect(),n=e.querySelector('.t12n'),mm=document.querySelector('.mmap').getBoundingClientRect(),v=document.querySelector('.wview').getBoundingClientRect();
  const nl=n?Math.round(n.getBoundingClientRect().height/parseFloat(getComputedStyle(n).lineHeight)):0;
  return {on:e.classList.contains('on'),txt:e.textContent,cls:(e.querySelector('.t12b')||{}).className||'',tag:(e.querySelector('.t12t')||{}).dataset?e.querySelector('.t12t').dataset.t:'',lines:nl,x:r.x,w:r.width,r:r.right,l:r.left,top:r.top,bot:r.bottom,mm:{l:mm.left,b:mm.bottom},v:{l:v.left,r:v.right,w:v.width},fs:parseFloat(n?getComputedStyle(n).fontSize:0),ff:n?getComputedStyle(n).fontFamily:'',rule:e.querySelector('.t12r')?getComputedStyle(e.querySelector('.t12r'),'::after').clipPath:''};});
(async()=>{
  for(const [w,h,mob,tag] of [[390,844,true,'phone'],[1000,560,false,'wide']]){
    const H=await open({w,h,mobile:mob,dpr:mob?2:1,pre:META});
    await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(i=>A.ACT.pickS(i));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});
    await H.wait(1200);
    const R={};for(const [n,id] of [['field','f0'],['den','k0'],['lair','d0'],['sanct','o1'],['breach','x0'],['rift','s0'],['town','t0']]){
      try{await go(H,id);await H.wait(350);R[n]=await ban(H);}catch(e){R[n]={err:e.message};}}
    for(const n of ['field','den','lair','sanct','breach','town']){const b=R[n];
      chk(`${tag} ${n}: shown, centred, inside the view, at most two lines (${JSON.stringify(b.txt)} ${Math.round(b.w)}px, ${b.lines} line(s), ${b.fs}px)`,b.on&&b.lines>=1&&b.lines<=2&&b.l>=b.v.l-1&&b.r<=b.v.r+1&&Math.abs((b.l+b.r)/2-(b.v.l+b.v.r)/2)<2);
      chk(`${tag} ${n}: not over the minimap`,b.r<=b.mm.l+1||b.top>=b.mm.b-1||b.l>=0&&b.r<=b.mm.l+1);}
    if(mob)chk(`phone: the banner is wider than the old 190px column (${Math.round(R.field.w)}px) with small letters (${R.field.fs}px)`,R.field.w>240&&R.field.fs<=22);
    chk(`${tag}: kind word above, name without the kind word (${R.den.txt} | ${R.sanct.txt} | ${R.lair.txt})`,R.den.tag==='Den'&&/^Den: [^]*$/.test(R.den.txt)&&R.sanct.tag==='Sanctum'&&!/Sanctum$/.test(R.sanct.txt.replace(/^Sanctum: /,''))&&/^Sanctum: \w+$/.test(R.sanct.txt)&&R.lair.tag==='Lair'&&!/(Den|Lair|Sanctum)$/.test(R.lair.txt));
    chk(`${tag}: rule per kind (${['field','den','lair','sanct','breach','town'].map(n=>R[n].cls.replace('t12b ','')).join(' ')})`,new Set(['field','den','lair','sanct','breach','town'].map(n=>R[n].cls)).size===6);
    chk(`${tag}: Breach is the name alone, no weather suffix on fields (${JSON.stringify(R.breach.txt)}; ${JSON.stringify(R.field.txt)})`,R.breach.txt==='The Meridian Breach'&&!/·/.test(R.field.txt)&&!/strongest/.test(R.breach.txt));
    chk(`${tag}: the fantasy face is the banner font (${R.field.ff})`,/Cinzel Decorative/.test(R.field.ff));
    // arrival only
    const a=await H.ev(async()=>{const A=__A,T=A.TW.get;A.V.modal=null;const e=document.getElementById('wloc');await new Promise(r=>setTimeout(r,2900));
      const off=!e.classList.contains('on');T('onBattleEnd')('win',{kind:'field',stage:0});await new Promise(r=>setTimeout(r,300));const afterBattle=e.classList.contains('on');
      T('showLocation')();await new Promise(r=>setTimeout(r,200));const again=e.classList.contains('on');
      T('placeAt')('f0',3,3,'d');T('showLocation')();await new Promise(r=>setTimeout(r,300));const newMap=e.classList.contains('on');
      await new Promise(r=>setTimeout(r,2900));T('placeAt')('t0',3,3,'d');T('showLocation')();await new Promise(r=>setTimeout(r,300));const back=e.classList.contains('on');
      return {off,afterBattle,again,newMap,back};});
    chk(`${tag}: no banner after a battle ends on the same map, nor on a repeat call; yes on a new map and when returning (${JSON.stringify(a)})`,a.off&&!a.afterBattle&&!a.again&&a.newMap&&a.back);
    // fonts, victory, lose, title sub
    const f=await H.ev(async()=>{await document.fonts.load("700 20px 'Cinzel Decorative'");const A=__A;A.V.screen='battle';A.V.modal={type:'result',info:{xp:12,gold:5,mats:{},drops:[],quests:[],bonds:[],ups:[],learn:[],notes:[]}};A.render();
      const h=document.querySelector('.panel.result h2');const v=getComputedStyle(h).fontFamily;const ok=document.fonts.check("700 20px 'Cinzel Decorative'");
      A.V.modal={type:'lose'};A.render();const l=getComputedStyle(document.querySelector('.panel h2')).fontFamily;
      A.V.modal={type:'settings'};try{A.render();}catch(e){}return {v,l,ok};});
    chk(`${tag}: Victory and the other modal headings use the fantasy face, which is bundled (${f.ok})`,f.ok&&/Cinzel/.test(f.v)&&/Cinzel/.test(f.l));
    const t=await H.ev(()=>({d:__A.TW.get('R12_BREACH_TEXT')}));
    chk(`${tag}: Breach text has no Echoes (${t.d.slice(0,60)}...)`,!/echo/i.test(t.d)&&/fiercest foes/.test(t.d)&&/strongest wayfarers/.test(t.d));
    await H.browser.close();
  }
  const H=await open({w:390,h:844,mobile:true,pre:META});
  const s=await H.ev(()=>{const A=__A;return {f:A.TW.get('FORT_NAMES').join('|'),b:A.TW.get('t12Bare')('Duskhaven Sanctum')+'|'+A.TW.get('t12Bare')('Sanctum')};});
  chk(`Sanctum names carry no kind word (${s.f}; ${s.b})`,!/Sanctum/.test(s.f)&&s.b==='Duskhaven|Sanctum');
  await done(H);
})();
