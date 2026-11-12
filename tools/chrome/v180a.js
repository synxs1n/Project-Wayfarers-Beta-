// fixes14.js / fixes14.css: the owner's four notes after the 0.19.7 to 0.20.0 passes. At 390x844, 1000x560 and 700x930 (the tablet layout of
// the owner's screenshot: the stage on top, the foe cards two to a row under the command panel):
//   1. the Momentum gauge shows its bar at every fill level and state (0, 8, 50, 100, Surge, Drained): the bar has height, sits inside the gauge
//      and inside the visible log strip, the fill is the fill level of its width, and "Momentum" and its state share one line;
//   2. with a Detonator aimed at Primed foes (statuses on every foe, at the normal text size and at 20 px text), the Primed chip is one small
//      line that covers neither the name nor the HP of its card, and a tap anywhere on a foe card (the chip and the status row included)
//      lands on the card; a real tap on the chip targets that foe;
//   3. battle menu memory: a hero who used an item opens the next turn on the main actions; a hero who used a skill opens on Skills;
//   4. the victory screen's "learned" lines stay inside the panel (no horizontal overflow, the name never squeezed under 60 px).
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v180a.js [shots DIR]
const {open,chk,done}=require('./pw');
const {battle,META,dress}=require('./v063lib');
const fs=require('fs');
const args=process.argv.slice(2),si=args.indexOf('shots'),SHOTS=si>=0?args[si+1]:null;if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const SIZES=[[390,844,true,'port'],[1000,560,false,'wide'],[700,930,true,'tab']];
const PRE=META('medium',{hd2d:false,timedHits:false});
// aim the current hero's first Detonator at foes primed with an element it sets off (B.pend set, the target menu open)
const AIM=fsz=>{const A=__A,B=A.B;if(fsz)document.documentElement.style.fontSize=fsz;const a=B.cur,ks=A.known(a),s=ks.find(x=>x.role==='det');if(!s)return 'no detonator';
  const els=A.TW.get('skEls')(s),rf=A.TW.get('reactFor');let pel=null;for(const p of Object.keys(A.EL))if(els.some(d=>rf(p,d))){pel=p;break;}
  B.en.forEach(e=>{e.primed={el:pel,t:2,by:'Mira'};});a.mp=999;A.ACT.cmd('skills');A.ACT.sk(s.id);A.render();return B.menu;};
// play turns (other heroes guard) until hero id's command turn; returns the menu it opens on
const UNTIL=async id=>{const A=__A,B=A.B;A.setPause(60);
  for(let i=0;i<600;i++){await new Promise(q=>setTimeout(q,40));if(B.over)return 'over';
    if(B.mode==='cmd'&&B.cur&&B.cur.side==='p'){if(B.cur.id===id){A.setPause(99999);A.render();return B.menu;}A.ACT.cmd('guard');}}
  A.setPause(99999);return 'timeout';};
(async()=>{
  for(const [w,h,mob,tag] of SIZES.filter(x=>!process.env.V180ONLY||x[3]===process.env.V180ONLY)){
    const H=await open({w,h,mobile:mob,pre:PRE,tag:'v180a_'+tag});const {ev,wait}=H;
    await battle(H,{heroes:6,foes:2,seed:5,lv:20});
    // ---- 1. Momentum ----
    for(const m of [0,8,50,100,'F','E']){
      const r=await ev(m=>{const A=__A,S=A.TW.get('b4MoS')();if(m==='F'){S.m=100;S.full=1;S.empty=0;}else if(m==='E'){S.m=0;S.empty=1;S.full=0;}else{S.m=m;S.full=0;S.empty=0;}A.render();
        const mo=document.getElementById('b4mo');if(!mo)return null;const R=e=>e.getBoundingClientRect(),g=R(mo),b=R(mo.querySelector('.b4bar')),v=R(mo.querySelector('.b4bar i.v')),bl=R(document.querySelector('.battle .bline')),t=R(mo.querySelector('.b4mt')),lb=R(mo.querySelector('.b4mt b'));
        return {cls:mo.className,bh:b.height,bw:b.width,vw:v.width,inMo:b.top>=g.top&&b.bottom<=g.bottom-1&&b.left>=g.left&&b.right<=g.right,inLine:b.top>=bl.top&&b.bottom<=bl.bottom,tH:t.height,lH:lb.height,moH:g.height};},m);
      const want=m==='F'?100:m==='E'?0:m;
      chk(`${tag} Momentum ${m}: the gauge is drawn`,!!r||'no #b4mo');if(!r)continue;
      chk(`${tag} Momentum ${m}: the bar has its height and width (${r.bh.toFixed(1)} x ${r.bw.toFixed(1)})`,r.bh>=5&&r.bw>=60||JSON.stringify(r));
      chk(`${tag} Momentum ${m}: the bar sits inside the gauge and inside the visible log strip`,r.inMo&&r.inLine||JSON.stringify(r));
      chk(`${tag} Momentum ${m}: the fill is ${want}% of the bar (${(100*r.vw/r.bw).toFixed(1)}%)`,Math.abs(100*r.vw/r.bw-want)<=2||JSON.stringify(r));
      chk(`${tag} Momentum ${m}: the label is one line (${r.tH.toFixed(1)} px, the word ${r.lH.toFixed(1)} px), the gauge ${r.moH.toFixed(1)} px`,r.tH<=r.lH*1.6+1&&r.moH<=42||JSON.stringify(r));
    }
    if(SHOTS){const b=await ev(()=>{const r=document.getElementById('b4mo').getBoundingClientRect();return [r.left,r.top,r.width,r.height];});await H.page.screenshot({path:`${SHOTS}/v180a_${tag}_momentum_surge.png`,clip:{x:b[0]-4,y:b[1]-4,width:b[2]+8,height:b[3]+8}});}
    // ---- 2. Primed chip and taps on the foe cards ----
    await dress(H,{seed:3,maxSt:9,prime:0,shield:1});
    for(const fsz of [null,'20px']){
      const menu=await ev(AIM,fsz);chk(`${tag} ${fsz||'16px'}: a Detonator is aimed`,menu==='target'||menu);
      await ev(()=>{const g=document.querySelector('.pgroup.foes');if(g)g.scrollIntoView({block:'center'});});await wait(150);
      const r=await ev(()=>[...document.querySelectorAll('.pgroup.foes .fcw')].map(wr=>{const fc=wr.querySelector('.fc'),ch=wr.querySelector('.pchip'),fr=fc.getBoundingClientRect();if(!ch)return {nochip:1};
        const ov=(a,b)=>a&&b&&!(a.right<=b.left+.5||b.right<=a.left+.5||a.bottom<=b.top+.5||b.bottom<=a.top+.5),cr=ch.getBoundingClientRect(),nm=fc.querySelector('.uct b'),hp=fc.querySelector('.ucr'),ui=wr.querySelector('.uinfo');
        const ur=ui?ui.getBoundingClientRect():null;let n=0,ok=0;const miss=[];
        for(let fy=.1;fy<.96;fy+=.12)for(let fx=.05;fx<.97;fx+=.1){const x=fr.left+fr.width*fx,y=fr.top+fr.height*fy;if(y<0||y>innerHeight-1)continue;if(ur&&x>=ur.left-2&&x<=ur.right+2&&y>=ur.top-2&&y<=ur.bottom+2)continue;
          // the visible part of the card only (a group that scrolls may clip the bottom card)
          const e=document.elementFromPoint(x,y);if(!e||!wr.contains(e)&&!fc.contains(e))continue;n++;if(e.closest('.fc')===fc)ok++;else miss.push(e.className||e.tagName);}
        return {h:cr.height,cw:cr.width,fw:fr.width,inCard:cr.left>=fr.left-.5&&cr.right<=fr.right+.5&&cr.bottom<=fr.bottom+.5,onName:!!ov(cr,nm&&nm.getBoundingClientRect()),onHp:!!ov(cr,hp&&hp.getBoundingClientRect()),n,ok,miss:miss.slice(0,3)};}));
      r.forEach((o,i)=>{const k=`${tag} ${fsz||'16px'} foe ${i}`;if(o.nochip)return chk(`${k}: the Primed chip shows on the card`,'no chip');
        chk(`${k}: the Primed chip is one small line (${o.h.toFixed(1)} px tall, ${o.cw.toFixed(0)} of ${o.fw.toFixed(0)} px)`,o.h<=20&&o.inCard||JSON.stringify(o));
        chk(`${k}: the chip covers neither the name nor the HP`,!o.onName&&!o.onHp||JSON.stringify(o));
        chk(`${k}: a tap anywhere on the card lands on the card (${o.ok}/${o.n})`,o.n>=10&&o.ok===o.n||JSON.stringify(o));});
      if(SHOTS){const b=await ev(()=>{const r=document.querySelector('.pgroup.foes').getBoundingClientRect();return [r.left,r.top,r.width,r.height];});await H.page.screenshot({path:`${SHOTS}/v180a_${tag}_foes_${fsz||'16px'}.png`,clip:{x:Math.max(0,b[0]-4),y:Math.max(0,b[1]-4),width:Math.min(w,b[2]+8),height:Math.min(h-Math.max(0,b[1]-4),b[3]+8)}});}
      await ev(()=>{document.documentElement.style.fontSize='';__A.ACT.back();__A.ACT.back();__A.render();});
    }
    // a real tap on the chip of the first foe picks it
    {await ev(AIM,null);await ev(()=>{const g=document.querySelector('.pgroup.foes');if(g)g.scrollIntoView({block:'center'});});await wait(150);
      const p=await ev(()=>{const c=document.querySelector('.pgroup.foes .fcw .pchip');if(!c)return null;const r=c.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];});
      const before=await ev(()=>__A.B.en[0].hp);
      if(p){if(mob)await H.page.touchscreen.tap(p[0],p[1]);else await H.page.mouse.click(p[0],p[1]);}await wait(250);
      const r=await ev(()=>{const B=__A.B;return {menu:B.menu,mode:B.mode,pend:!!B.pend};});
      chk(`${tag}: a tap on the Primed chip targets the foe (menu ${r.menu}, mode ${r.mode}; hp ${before})`,!!p&&!(r.mode==='cmd'&&r.menu==='target')||JSON.stringify(r));}
    // ---- 3. battle menu memory after an item / a skill ----
    await battle(H,{heroes:3,foes:2,seed:7,lv:20});
    const mem=await ev(async UNTILs=>{const UNTIL=(0,eval)('('+UNTILs+')'),A=__A,B=A.B,G=A.G;B.en.forEach(e=>{e.S.mhp=e.hp=99999;e.S.atk=1;e.S.mag=1;});G.inv.potion=9;A.setPause(60);
      const a=B.cur,id=a.id,out={hero:a.name};A.ACT.cmd('items');A.render();A.ACT.item('potion');if(B.menu==='target'){const i=A.TW.get('allParty')().indexOf(a);A.ACT.tgtA(i);}
      out.item=await UNTIL(id);
      if(B.cur.id!==id)return out;A.setPause(60);const s=A.known(B.cur).find(x=>x.t==='one'&&x.k!=='heal'&&!x.limit);A.ACT.cmd('skills');A.render();B.cur.mp=999;A.ACT.sk(s.id);if(B.menu==='target')A.ACT.tgtE(0);
      out.skill=await UNTIL(id);out.sk=s.n;return out;},UNTIL.toString());
    chk(`${tag}: after an item, ${mem.hero}'s next turn opens on the main actions (${mem.item})`,mem.item==='root'||JSON.stringify(mem));
    chk(`${tag}: after a skill (${mem.sk}), the next turn opens on Skills (${mem.skill})`,mem.skill==='skills'||JSON.stringify(mem));
    // ---- 4. victory screen, learned skills ----
    await battle(H,{heroes:4,foes:2,seed:5,lv:20});
    const v=await ev(async()=>{const A=__A,G=A.G,B=A.B;G.skSeen=G.skSeen||{};G.party.forEach(id=>{const ids=A.known(G.roster[id]).map(x=>x.id||x.n);G.skSeen[id]=ids.slice(0,Math.max(0,ids.length-2));});// the last two skills of each hero count as new
      B.en.forEach(e=>e.hp=0);A.setPause(0);A.TW.get('win')();A.render();await new Promise(q=>setTimeout(q,400));
      const p=document.querySelector('.panel.result'),lt=p&&p.querySelector('.learntop');if(!lt)return {err:(A.V.modal&&A.V.modal.type)+' learn:'+JSON.stringify((A.V.modal.info.learn||[]).length)+' seen:'+JSON.stringify(Object.values(G.skSeen||{}).map(x=>x.length))+' party:'+G.party.join()};const L=lt.getBoundingClientRect(),bad=[];let minB=1e9;
      lt.querySelectorAll('.learnr').forEach(r=>{const q=r.getBoundingClientRect();if(q.right>L.right+.5)bad.push('row');r.querySelectorAll('*').forEach(e=>{const x=e.getBoundingClientRect();if(x.width&&x.right>q.right+.5)bad.push((e.className||e.tagName)+' '+Math.round(x.right-q.right)+'px');});
        const b=r.querySelector(':scope>b');if(b)minB=Math.min(minB,b.getBoundingClientRect().width);});
      return {n:lt.querySelectorAll('.learnr').length,bad:bad.slice(0,6),minB,sw:p.scrollWidth,cw:p.clientWidth};});
    chk(`${tag}: the victory screen lists new skills`,!!v&&v.n>0||JSON.stringify(v));
    if(v&&v.n){chk(`${tag}: every learned line stays inside the panel`,v.bad.length===0&&v.sw<=v.cw+1||JSON.stringify(v));
      chk(`${tag}: the "X learned Y!" text keeps its width (${Math.round(v.minB)} px at the least)`,v.minB>=60||JSON.stringify(v));}
    if(SHOTS){await ev(()=>{const e=document.querySelector('.learntop');if(e)e.scrollIntoView({block:'start'});});await wait(200);await H.page.screenshot({path:`${SHOTS}/v180a_${tag}_victory.png`});}
    await H.browser.close();
  }
  done({browser:{close:async()=>{}}});
})();
