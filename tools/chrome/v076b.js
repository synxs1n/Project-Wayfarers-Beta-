// Beta v0.7.6: the wide battle layout (Galaxy Z Fold open 933x705, tablets, desktops). Under the stage: the commands with the foes right
// under them in one column, the party (Vanguard, then the Rearguard one hero per row) in the other; both columns stretch over the width;
// the whole screen fits the viewport (no page scroll), the turn order, sky chips, Momentum and the log strip stay on screen; the stage stays
// at least 210 px tall at 933x705. No button or card text is cut (only names may end in an ellipsis) in every command menu state, also at
// 390x844 and 844x390 (which keep their own layouts).
// Fails on Beta v0.7.5 (933x705: the page is 860+ px tall, three columns, the Rearguard two across, "Attack", "Start auto" and "Speed 1x"
// overflow their buttons), passes now.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v076b.js [shots]   (shots: screenshots into shots-v076b/)
const {open,chk,done}=require('./pw');const {META,battle,dress,aim,rects,overlaps}=require('./v063lib');
const SHOTS=process.argv.includes('shots'),fs=require('fs'),DIR=__dirname+'/shots-v076b';if(SHOTS)fs.mkdirSync(DIR,{recursive:true});
const WIDE=[[933,705],[1024,768],[1280,720],[1280,800]],SMALL=[[390,844],[844,390]];
// parties (heroes incl. the rearguard) and foes; b = a boss fight (boss bar, the auto lock reason)
const CASES=[[3,1],[4,3],[5,5],[6,5],[6,2],[3,4],[6,'b']];
// what a page shows: overflowing text, the panel boxes, the document size
const MEASURE=()=>{const out={bad:[]},vis=e=>{const q=e.getBoundingClientRect();return q.width>0&&q.height>0;};
  // names may end in an ellipsis; nothing else may be cut
  const NAME='.uct b,.cmdhead b,.bbn b,.b4o .n,.blog p,.detf';
  document.querySelectorAll('.battle *').forEach(e=>{if(e.closest('#bstage')||e.closest('#bover')||!vis(e)||/^(IMG|CANVAS|svg)$/i.test(e.tagName))return;
    const txt=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()),btn=e.tagName==='BUTTON';if(!txt&&!btn&&!e.classList.contains('ptags'))return;
    if(e.classList.contains('port')||e.classList.contains('oc'))return;
    const cs=getComputedStyle(e),overX=e.scrollWidth>e.clientWidth+1,overY=btn&&e.scrollHeight>e.clientHeight+2&&cs.overflowY!=='visible';
    if(!overX&&!overY)return;if(overX&&!overY&&e.matches(NAME)&&cs.textOverflow==='ellipsis')return;
    out.bad.push((e.className||e.tagName)+' "'+e.textContent.trim().replace(/\s+/g,' ').slice(0,24)+'" '+e.scrollWidth+'/'+e.clientWidth+(overY?' h'+e.scrollHeight+'/'+e.clientHeight:''));});
  // a button label inside a button: the button's own box must hold it
  document.querySelectorAll('#bcmd button,#bline button,#border button,#bparty button').forEach(b=>{if(!vis(b))return;const q=b.getBoundingClientRect();
    b.querySelectorAll('span,b,em,small').forEach(s=>{if(!vis(s)||s.matches(NAME)||s.closest('.ptags'))return;const r=s.getBoundingClientRect();if(r.right>q.right+1.5||r.left<q.left-1.5)out.bad.push('label out of its button: "'+s.textContent.trim().slice(0,20)+'"');});});
  const R=s=>{const e=typeof s==='string'?document.querySelector(s):s;if(!e||!vis(e))return null;const q=e.getBoundingClientRect();return {l:q.left,t:q.top,r:q.right,b:q.bottom,w:q.width,h:q.height};};
  out.canSwap=(()=>{const B=__A.B,a=B.cur;return B.mode==='cmd'&&!B.pend&&!B.auto&&a&&!(a.st&&a.st.root)&&B.back.some(c=>c.hp>0);})();out.docH=document.documentElement.scrollHeight;out.docW=document.documentElement.scrollWidth;out.vw=innerWidth;out.vh=innerHeight;out.mode=__A.BL.mode;out.menu=__A.B.menu;
  out.bat=R('.battle');out.stage=R('#bwrap');out.order=R('#border');out.line=R('#bline');out.mo=R('#bline .b4mo');out.logb=R('#bline .blogbtn');out.sky=[...document.querySelectorAll('#border .wchip')].map(R).filter(Boolean);
  out.cmd=R('#bcmd');out.foes=R('#bparty .pgroup.foes');out.heroes=R('#bparty .pgroup.heroes');out.rsv=R('#bparty .pgroup.rsv');out.pty=R('#bparty .b3pty');
  out.rrows=[...document.querySelectorAll('#bparty .pgroup.rsv .pcw')].map(R).filter(Boolean);out.vrows=[...document.querySelectorAll('#bparty .pgroup.heroes .pcw')].map(R).filter(Boolean);
  out.rdash=[...document.querySelectorAll('#bparty .pgroup.rsv .pc.rs.swapok')].every(e=>getComputedStyle(e).outlineStyle==='dashed');out.rswap=document.querySelectorAll('#bparty .pgroup.rsv .pc.rs.swapok').length;
  out.rlv=[...document.querySelectorAll('#bparty .pgroup.rsv .pc.rs')].every(e=>{const l=e.querySelector('.ucl'),h=e.querySelector('.ucr .bar'),n=e.querySelector('.ucr .nums');return l&&vis(l)&&h&&vis(h)&&n&&vis(n);});
  out.taps=[...document.querySelectorAll('#bcmd .mi,#bcmd .btn,#bline .blogbtn,#bline .b4mo,#border .wchip,#bparty .pc,#bparty .fc')].filter(vis).map(e=>Math.round(e.getBoundingClientRect().height)).filter(h=>h<40).length;
  out.prim=[...document.querySelectorAll('#bcmd .menu.prim .mi,#bcmd .autorow .btn')].every(e=>{const q=e.getBoundingClientRect();return q.top>=-1&&q.bottom<=innerHeight+1;});
  out.inner=['#bparty .b3pty','#bparty .pgroup.foes>.fcs','#bcmd'].map(q=>document.querySelector(q)).filter(e=>e&&vis(e)&&e.scrollHeight>e.clientHeight+2).map(e=>(e.id||e.className)+' '+e.scrollHeight+'/'+e.clientHeight);
  out.fsz=Math.min(...[...document.querySelectorAll('#bcmd .mi,#bcmd .btn,#bparty .uct b,#bparty .nums')].filter(vis).map(e=>parseFloat(getComputedStyle(e).fontSize)));
  return out;};
(async()=>{
  const states=async(H,tag,isWide,c)=>{const S=[['root',null]];const r0=await H.ev(()=>({back:__A.B.back.filter(c=>c.hp>0).length}));
    S.push(['skills',H=>H.ev(()=>__A.ACT.cmd('skills'))],['items',H=>H.ev(()=>__A.ACT.cmd('items'))],['target',H=>aim(H)]);if(r0.back)S.push(['switch',H=>H.ev(()=>__A.ACT.cmd('swap'))]);
    S.push(['speed 1.5x',H=>H.ev(()=>{__A.META.cfg.speed=1.5;__A.render();})],['auto',H=>H.ev(()=>{__A.B.auto=true;__A.render();})]);
    for(const [st,go] of S){
      if(go){await H.ev(()=>{const B=__A.B;B.auto=false;__A.META.cfg.speed=1;B.pend=null;B.menu='root';__A.render();});await go(H);}
      await H.wait(350);const m=await H.ev(MEASURE);const t=`${tag} ${st}`;
      chk(`${t}: no text cut off on buttons, cards or labels`,m.bad.length===0||m.bad.slice(0,6).join(' | '));
      chk(`${t}: no sideways scroll`,m.docW<=m.vw+1||m.docW);
      if(!isWide){chk(`${t}: tap targets 40 px or more`,m.taps===0||m.taps);continue;}
      chk(`${t}: the page does not scroll (document ${m.docH} <= ${m.vh})`,m.docH<=m.vh);
      chk(`${t}: turn order, sky chips, stage, Momentum and the log strip on screen`,[m.order,m.stage,m.line,m.mo,m.logb].every(q=>q&&q.t>=-1&&q.b<=m.vh+1)&&m.sky.length>0&&m.sky.every(q=>q.b<=m.vh+1)||JSON.stringify({o:m.order,s:m.stage,l:m.line}));
      if(!['skills','items','switch'].includes(st))chk(`${t}: nothing has to scroll inside its panel either`,m.inner.length===0||m.inner.join(' | '));
      chk(`${t}: tap targets 40 px or more; fonts ${m.fsz.toFixed(1)} px`,m.taps===0&&m.fsz>=10.5||m.taps+' small, font '+m.fsz);
      if(m.foes)chk(`${t}: the foes sit right under the commands, in the same column`,m.foes.t>=m.cmd.b-1&&m.foes.t-m.cmd.b<16&&Math.abs(m.foes.l-m.cmd.l)<3&&Math.abs(m.foes.w-m.cmd.w)<3||JSON.stringify({cmd:m.cmd,foes:m.foes}));
      else chk(`${t}: the foes hide only while a list menu takes the column`,['skills','items','switch'].includes(st)||'no foes panel');
      const pc=m.pty||m.heroes;
      chk(`${t}: the party column is beside the commands: Vanguard, then the Rearguard`,pc&&m.heroes&&pc.l>=m.cmd.r&&m.heroes.l>=m.cmd.r&&(!m.rsv||m.rsv.t>=m.heroes.b-1&&Math.abs(m.rsv.l-m.heroes.l)<3)||JSON.stringify({cmd:m.cmd,h:m.heroes,r:m.rsv}));
      const span=(pc.r-m.cmd.l)/m.bat.w,share=[m.cmd.w/m.bat.w,pc.w/m.bat.w];
      chk(`${t}: the two columns span the width (${(span*100).toFixed(0)}%; ${share.map(x=>(x*100).toFixed(0)+'%').join(' / ')})`,span>.97&&share.every(x=>x>.33&&x<.66));
      chk(`${t}: Vanguard rows one per line, full width`,m.vrows.length>=1&&m.vrows.every((q,i)=>Math.abs(q.l-m.vrows[0].l)<2&&q.w>m.heroes.w*.9&&(!i||q.t>=m.vrows[i-1].b-1)));
      if(m.rsv)chk(`${t}: Rearguard rows stacked one per line like the Vanguard, with level, HP bar and value`,m.rrows.every((q,i)=>Math.abs(q.l-m.rrows[0].l)<2&&q.w>m.rsv.w*.9&&(!i||q.t>=m.rrows[i-1].b-1))&&m.rlv||JSON.stringify({rows:m.rrows,lv:m.rlv}));
      if(st==='root'){chk(`${t}: every main command and the auto row on screen`,m.prim===true);
        if(m.rsv&&m.canSwap)chk(`${t}: the Rearguard keeps its dashed tap-to-switch frame (${m.rswap} rows)`,m.rswap>0&&m.rdash);
        if(m.vw===933)chk(`${t}: the stage stays at least 210 px tall (${Math.round(m.stage.h)})`,m.stage.h>=209.5);}
    }};
  for(const [w,h] of WIDE.concat(SMALL)){const isWide=WIDE.some(x=>x[0]===w&&x[1]===h);
    for(const [he,fo] of (isWide?CASES:[[6,5],[3,2],[6,'b']])){const H=await open({w,h,mobile:w<1000,pre:META('medium')});const tag=`${w}x${h} ${he}h/${fo}${fo==='b'?'oss':'f'}`;
      const b=await battle(H,fo==='b'?{heroes:he,boss:1,stage:1,seed:7+he,lv:22}:{heroes:he,foes:fo,seed:11*he+fo,lv:22});await dress(H,{seed:he*3+(+fo||9),maxSt:2,prime:.5,shield:.5});await H.wait(300);
      if(b.mode!=='cmd'){chk(`${tag}: battle ready`,'mode '+b.mode);await H.browser.close();continue;}
      const mode=await H.ev(()=>__A.BL.mode);if(isWide)chk(`${tag}: wide layout`,mode==='wide'||mode);
      if(SHOTS&&(he===6||w===933))await H.page.screenshot({path:`${DIR}/v076b_${w}x${h}_${he}h${fo}.png`});
      await states(H,tag,isWide);await H.browser.close();}}
  // aim tags: aim a plain, a primer and a detonator one-target skill at the foes (a boss fight with an elite name and a broken shield, and a
  // field fight with primed foes); every target tag's text fits its box (no glyph cut), the box sits inside the stage and off every sprite.
  // "wide text" repeats it with the tag text drawn wider than the layout measured (as with a device's own font or text scaling).
  for(const [w,h] of WIDE.concat(SMALL))for(const wideTxt of [false,true])for(const boss of [true,false]){
    const H=await open({w,h,mobile:w<1000,pre:META('medium')});const tag=`${w}x${h} aim ${boss?'boss':'field'}${wideTxt?' (wide text)':''}`;
    await battle(H,boss?{heroes:4,boss:1,foes:3,stage:1,seed:5,lv:22}:{heroes:4,foes:5,seed:9,lv:22});await dress(H,{seed:3,maxSt:2,prime:.7,shield:.6});
    if(wideTxt)await H.page.addStyleTag({content:'.bstage .b3tg *{letter-spacing:.7px}'});
    await H.ev(()=>{const A=__A,B=A.B;B.en.forEach((e,i)=>{if(i===0){e.elite=true;if(!e.boss)e.name='The Gallow';e.maxShield=e.maxShield||4;e.broken=true;}});A.render();});
    const sks=await H.ev(()=>{const A=__A,all=Object.keys(A.TPL).flatMap(id=>{try{return A.classSkills(A.TPL[id]);}catch(e){return [];}}).filter(s=>s&&s.t==='one'&&s.k!=='heal'&&s.k!=='revive');
      const pick=r=>all.find(s=>r?s.role===r:!s.role);return ['', 'primer','det'].map(pick).filter(Boolean).map(s=>s.id);});
    for(const id of sks){
      const r=await H.ev(id=>{const A=__A,B=A.B,all=Object.keys(A.TPL).flatMap(k=>{try{return A.classSkills(A.TPL[k]);}catch(e){return [];}}),sk=all.find(s=>s.id===id);
        B.pend=null;B.menu='root';A.render();B.pend={sk};B.menu='target';A.render();A.render();
        const st=document.getElementById('bstage').getBoundingClientRect(),bad=[];let n=0;
        document.querySelectorAll('#bstage .b3tg').forEach(t=>{n++;const R=t.getBoundingClientRect(),k=R.width/t.offsetWidth;
          if(R.left<st.left-.5||R.top<st.top-.5||R.right>st.right+.5||R.bottom>st.bottom+.5)bad.push('outside the stage: '+t.textContent);
          if(t.scrollWidth>t.clientWidth+1||t.scrollHeight>t.clientHeight+1)bad.push('overflow '+t.textContent+' '+t.scrollWidth+'/'+t.clientWidth);
          let hh=0;[...t.children].forEach(c=>{const q=c.getBoundingClientRect();hh+=q.height;if(q.left<R.left-.3*k||q.right>R.right+.3*k)bad.push('cut: "'+c.textContent+'" '+(q.width/k).toFixed(1)+' > '+(R.width/k).toFixed(1));});
          if(hh>R.height+.5*k)bad.push('cut height: '+t.textContent);});
        return {n,bad,foes:B.en.filter(e=>e.hp>0&&A.targetable?A.targetable(e):e.hp>0).length,sk:sk.n+(sk.role?' ('+sk.role+')':'')};},id);
      chk(`${tag} ${r.sk}: ${r.n} target tags, every text fits its tag inside the stage`,r.n>0&&r.bad.length===0||(r.n?r.bad.slice(0,4).join(' | '):'no tags'));
      const R=await rects(H),ov=overlaps(R).filter(x=>/b3tg/.test(x));
      chk(`${tag} ${r.sk}: target tags off every sprite and label`,ov.length===0||ov.slice(0,4).join(' | '));
      const m=await H.ev(MEASURE);chk(`${tag} ${r.sk}: no card or button text cut`,m.bad.length===0||m.bad.slice(0,5).join(' | '));}
    await H.browser.close();}
  const H=await open({});await done(H);})();
