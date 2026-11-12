// v0.19.7 hud13.js / hud13.css: one ornament language for the battle HUD (hairline gold rules, small corner ornaments, the Cinzel face on
// the small-caps labels, numbers and body text in Nunito) and a realm colour grade (a hue shift of the Gilded Night base, never a
// saturation jump, the gold untouched) on the HUD plates, the Momentum bar, the chips, the result frame and the world bar.
// Checks at 1000x560, 1366x768, 390x844 and 844x390 in two realms, the Breach and the Echo Rift:
//   1. the tint variables follow the realm (meadow vs snow differ; the Breach and the Rift their own), the gold tokens are unchanged, every
//      tinted colour keeps the base's saturation and lightness within a few percent and moves its hue 10 to 20% of the way to the realm hue;
//   2. the labels (NEXT, VANGUARD, FOES, REARGUARD, Momentum, "X's turn") use the Cinzel face; names, numbers and command labels stay in Nunito;
//   3. no plate is taller than before (HEIGHTS, measured on the v0.19.6 build) by more than 2 px; the page never scrolls; no two plates overlap;
//   4. text on the plates keeps at least the contrast it had (CONTRAST, measured on the v0.19.6 build) less 0.15.
// Usage (from tools/chrome): PWHTML=../../out/aurelis3.html node v179a.js [shots DIR] [measure]
//   shots DIR   also writes screenshots of every HUD element into DIR (used for the before/after sheet)
//   measure     prints the HEIGHTS and CONTRAST tables of this build (to refresh the baselines)
const {open,chk,done}=require('./pw');
const {battle}=require('./v063lib');
const fs=require('fs');
const args=process.argv.slice(2),si=args.indexOf('shots'),SHOTS=si>=0?args[si+1]:null,MEASURE=args.includes('measure');
if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
// Medium with the 2D world: the Gilded Night look (Low is the Flat look, where ui3.css and hud13.css do not apply) without the GL stage
const PRE=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',music:0,sfx:0,gfx:'medium',hd2d:false,hints:false,timedHits:false}}));`;
const SIZES=[[1000,560,false,'wide'],[1366,768,false,'desk'],[390,844,true,'port'],[844,390,true,'land']];
const REALMS=['thistle','deeps'];// meadow (the navy moves toward teal), cave (toward violet)
// plate heights on the v0.19.6 build (px), per size tag: an element may be at most 2 px taller than this
const HEIGHTS={
  wide:{order:46,bline:42,b4mo:40,cmdhead:46,prim:45,h3:15,pc:42,rs:40,fc:54,fl:0,wchip:40,fwk:11,sk11:27,wbar:48,resh2:89},
  desk:{order:46,bline:42,b4mo:40,cmdhead:44,prim:43,h3:15,pc:42,rs:40,fc:54,fl:0,wchip:40,fwk:11,sk11:45,wbar:48,resh2:89},
  port:{order:50,bline:42,b4mo:40,cmdhead:45,prim:56,h3:0,pc:65,rs:49,fc:62,fl:40,wchip:46,fwk:11,sk11:27,wbar:71,resh2:89},
  land:{order:46,bline:42,b4mo:40,cmdhead:41,prim:40,h3:15,pc:40,rs:40,fc:53,fl:0,wchip:40,fwk:11,sk11:45,wbar:42,resh2:89}};
// text contrast on the v0.19.6 build (lightest tenth of the pixels behind the text), per pair: the new build must reach this less 0.15
// (the least over the four sizes; fcName and wchip are measured and printed but not gated: the sky chip changes with the rolled weather and
// the foe name probe reads the same odd 1.24 on both builds)
const CONTRAST={pcName:8.04,pcLv:6.38,pcNums:10.35,fcNums:14.83,orderNext:8.8,moLabel:14.25,cmdName:12.6,blog:14.89,wkeys:10.53,fwkUp:12.66};
const SEL={order:'.battle .order',bline:'.battle .bline',b4mo:'#b4mo',cmdhead:'.cmd .who.cmdhead',prim:'.menu.prim .mi',h3:'.pgroup.heroes>h3',pc:'.pgroup.heroes .pc',rs:'.pgroup.rsv .pc.rs',fc:'.pgroup.foes .fc',fl:'.b8fl .fl',
  wchip:'.wchip',fwk:'.fwk',sk11:'.sk11',wbar:'.wbar',resh2:'.panel.result>h2'};
const PAIRS={pcName:['.pgroup.heroes .pc','.pgroup.heroes .pc .uct b'],pcLv:['.pgroup.heroes .pc','.pgroup.heroes .pc .ucl'],pcNums:['.pgroup.heroes .pc','.pgroup.heroes .pc .ucr .nums'],
  fcName:['.pgroup.foes .fc','.pgroup.foes .fc .uct b'],fcNums:['.pgroup.foes .fc','.pgroup.foes .fc .nums'],orderNext:['.battle .order','.battle .order .ocs>small'],moLabel:['#b4mo','#b4mo .b4mt b'],
  cmdName:['.cmd .who.cmdhead','.cmd .who.cmdhead b'],primLabel:['.menu.prim .mi','.menu.prim .mi .n'],blog:['.battle .bline','.battle .bline .blog p'],
  wkeys:['.wbar','.wbar .wkeys'],wchip:['.wchip','.wchip'],fwkUp:['.fwk.up','.fwk.up']};
const lum=(r,g,b)=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(r)+.7152*f(g)+.0722*f(b);};
const ratio=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
// the lightest tenth of a PNG clip's pixels (luminance), from a raw screenshot buffer decoded in the page
async function bgLum(H,rect){if(!rect||rect.w<2||rect.h<2)return null;
  const vp=H.page.viewportSize(),x=Math.max(0,rect.x),y=Math.max(0,rect.y),w=Math.min(rect.x+rect.w,vp.width)-x,h=Math.min(rect.y+rect.h,vp.height)-y;if(w<2||h<2)return null;
  let buf;try{buf=await H.page.screenshot({clip:{x,y,width:w,height:h}});}catch(e){return null;}
  return H.ev(async b64=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);
    const d=x.getImageData(0,0,c.width,c.height).data,L=[];const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};
    for(let i=0;i<d.length;i+=4)L.push(.2126*f(d[i])+.7152*f(d[i+1])+.0722*f(d[i+2]));L.sort((a,b)=>a-b);return L[Math.floor(L.length*.9)];},buf.toString('base64'));}
async function contrast(H,scope){const out={};
  for(const [k,[ps,ts]] of Object.entries(PAIRS)){const r=await H.ev(([ps,ts])=>{const p=document.querySelector(ps);if(!p)return null;const t=p.matches(ts)?p:document.querySelector(ts);if(!t)return null;
      const b=t.getBoundingClientRect();if(b.width<2||b.height<2)return null;const c=getComputedStyle(t).color.match(/[\d.]+/g).map(Number);
      return {x:Math.floor(b.left),y:Math.floor(b.top),w:Math.ceil(b.width),h:Math.ceil(b.height),c};},[ps,ts]);
    if(!r)continue;
    await H.ev(()=>document.body.classList.add('h13probe'));const L=await bgLum(H,r);await H.ev(()=>document.body.classList.remove('h13probe'));
    if(L==null)continue;out[k]=+ratio(lum(r.c[0],r.c[1],r.c[2]),L).toFixed(2);}
  return out;}
const PROBE=`const s=document.createElement('style');s.textContent='body.h13probe .battle *,body.h13probe .wbar *,body.h13probe .modal *{color:transparent!important;text-shadow:none!important;-webkit-text-fill-color:transparent!important}body.h13probe img,body.h13probe .ico,body.h13probe .elb,body.h13probe .bar,body.h13probe .b4bar,body.h13probe .lbar{visibility:hidden!important}';document.head.appendChild(s);`;
// a screenshot plus the boxes of the HUD elements in it (for the before/after sheet, tools/chrome/v179sheet.py)
const BOXES={order:'.battle .order',bline:'.battle .bline',cmdhead:'.cmd .who.cmdhead',cmd:'.battle .cmd',heroes:'.pgroup.heroes',rsv:'.pgroup.rsv',foes:'.pgroup.foes',fl:'.b8fl',skills:'.menu.list',wbar:'.wbar',result:'.panel.result',resh2:'.panel.result>h2',bossbar:'.battle .bossbar'};
async function shot(H,name){if(!SHOTS)return;await H.page.screenshot({path:`${SHOTS}/${name}.png`});
  const bx=await H.ev(S=>{const o={};for(const [k,s] of Object.entries(S)){const e=[...document.querySelectorAll(s)].find(e=>e.getBoundingClientRect().height>0);if(e){const r=e.getBoundingClientRect();o[k]=[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)];}}return o;},BOXES);
  fs.writeFileSync(`${SHOTS}/${name}.json`,JSON.stringify(bx));}
async function heights(H){return H.ev(S=>{const o={};for(const [k,s] of Object.entries(S)){const e=[...document.querySelectorAll(s)].find(e=>e.getBoundingClientRect().height>0);o[k]=e?Math.round(e.getBoundingClientRect().height):0;}return o;},SEL);}
function hsl(hex){const n=parseInt(hex.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255,M=Math.max(r,g,b),m=Math.min(r,g,b),l=(M+m)/2;let h=0,s=0;if(M!==m){const d=M-m;s=l>.5?d/(2-M-m):d/(M+m);h=M===r?((g-b)/d+(g<b?6:0)):M===g?((b-r)/d+2):((r-g)/d+4);h*=60;}return [h,s,l];}
const fontOf=f=>/cinzel/i.test(f)?'cinzel':/nunito/i.test(f)?'nunito':f;
(async()=>{
  const all={heights:{},contrast:{}};
  for(const [w,h,mob,tag] of SIZES){
    const H=await open({w,h,mobile:mob,pre:PRE,tag:'v179a_'+tag});const {ev,wait}=H;
    await ev(PROBE);
    let first=null;
    for(const realm of REALMS){
      await battle(H,{heroes:6,foes:3,seed:5,lv:20});
      const rv=await ev(k=>{const A=__A,G=A.G,B=A.B,zi=Object.fromEntries(A.ZONES.map((z,i)=>[z.key,i]));G.run.order[0]=zi[k];B.spec.breach=0;B.spec.rift=0;
        // every foe type known, so the Weak / Res rows show (as in v095lib)
        const M=A.META.best=A.META.best||{};B.en.forEach(e=>{const b=M[e.base]=M[e.base]||{};b.seen=1;b.hit=1;b.scan=1;b.kills=b.kills||0;b.known=b.known||{};Object.keys(A.EL).forEach(el=>{try{if(A.effOf(el,e)!==1)b.known[el]=1;}catch(x){}});});
        A.render();
        const cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim();return {theme:A.ZS(0).theme,a:v('--h13a'),p1:v('--h13p1'),c1:v('--h13c1'),f1:v('--h13f1'),k1:v('--h13k1'),gold:v('--ui-gold'),goldHi:v('--ui-gold-hi'),line:v('--ui-line')};},realm);
      await wait(300);await H.settle(()=>document.querySelector('.battle .order')&&document.querySelector('.battle .order').getBoundingClientRect().height);
      const hasH13=!!rv.a;
      if(hasH13){
        chk(`${tag} ${realm}: the tint follows the realm (${rv.theme}: ${rv.a})`,/^#[0-9a-f]{6}$/i.test(rv.a)||JSON.stringify(rv));
        chk(`${tag} ${realm}: the gold tokens are untouched`,rv.gold==='#d9b46a'&&rv.goldHi==='#f6dfa0'||JSON.stringify(rv));
        // hue shift only: saturation of the base within 4% and its lightness within 7% (the shift keeps the base's relative luminance, which moves the HSL lightness a little), the hue 10 to 20% of the way to the accent
        const base={p1:'#1b1f33',c1:'#1f2339',f1:'#2a1823',k1:'#1d2a40'},bad=[];
        for(const k of Object.keys(base)){const [h0,s0,l0]=hsl(base[k]),[h1,s1,l1]=hsl(rv[k]),[ha]=hsl(rv.a);let d=((ha-h0)%360+540)%360-180,got=((h1-h0)%360+540)%360-180;
          const frac=Math.abs(d)<1?0:got/d;if(Math.abs(s1-s0)>.04||Math.abs(l1-l0)>.07||(Math.abs(d)>=1&&(frac<.09||frac>.21)))bad.push(`${k} ${base[k]}->${rv[k]} s ${s0.toFixed(2)}->${s1.toFixed(2)} l ${l0.toFixed(2)}->${l1.toFixed(2)} hue ${frac.toFixed(2)} of ${d.toFixed(0)}`);}
        chk(`${tag} ${realm}: the tint is a hue shift of 10 to 20% at the base's saturation and lightness`,!bad.length||bad.join('; '));
        if(first&&first.theme!==rv.theme)chk(`${tag}: the two realms give two tints (${first.a} vs ${rv.a})`,first.a!==rv.a&&first.c1!==rv.c1||JSON.stringify([first,rv]));
        if(!first)first=rv;
      }
      // fonts
      const F=await ev(()=>{const g=s=>{const e=document.querySelector(s);return e?getComputedStyle(e).fontFamily:'';};
        return {next:g('.battle .order .ocs>small'),van:g('.pgroup.heroes>h3'),foes:g('.pgroup.foes>h3'),rsv:g('.pgroup.rsv>h3'),mo:g('#b4mo .b4mt b'),who:g('.cmd .who.cmdhead b'),turnl:g('.cmd .who.cmdhead .turnl'),
          name:g('.pgroup.heroes .pc .uct b'),nums:g('.pgroup.heroes .pc .nums'),cmd:g('.menu.prim .mi .n')||g('.menu.prim .mi'),fname:g('.pgroup.foes .fc .uct b'),blog:g('.battle .bline .blog p')};});
      if(hasH13){
        chk(`${tag} ${realm}: NEXT, VANGUARD, FOES, REARGUARD, Momentum and the turn name use the Cinzel face`,['next','van','foes','rsv','mo','who'].every(k=>!F[k]||fontOf(F[k])==='cinzel')||JSON.stringify(F));
        chk(`${tag} ${realm}: names, numbers, "'s turn", command labels and the log stay in Nunito`,['name','nums','cmd','fname','blog','turnl'].every(k=>!F[k]||fontOf(F[k])==='nunito')||JSON.stringify(F));
      }
      // heights of the plates (root menu), then the skill list (tag strips)
      const hr=await heights(H);
      const C1=await contrast(H,'battle');// at the root menu: a list menu hides the foes panel on wide screens and the layout moves
      await ev(()=>{const A=__A;A.ACT.cmd('skills');A.render();});await wait(200);
      const hs=await heights(H);hr.sk11=hs.sk11;
      await ev(()=>{const A=__A;A.ACT.back();A.render();});await wait(150);
      all.heights[tag+'/'+realm]=hr;all.contrast[tag+'/'+realm]=C1;
      const tall=Object.entries(HEIGHTS[tag]).filter(([k,v])=>v&&hr[k]&&hr[k]>v+2).map(([k,v])=>`${k} ${hr[k]} (was ${v})`);
      chk(`${tag} ${realm}: no plate grew by more than 2 px ${JSON.stringify(hr)}`,!tall.length||tall.join(', '));
      const low=Object.entries(CONTRAST).filter(([k,v])=>C1[k]!=null&&C1[k]<v-.15).map(([k,v])=>`${k} ${C1[k]} (was ${v})`);
      chk(`${tag} ${realm}: text on the plates keeps its contrast ${JSON.stringify(C1)}`,!low.length||low.join(', '));
      // the page never scrolls and no two plates overlap
      const ov=await ev(()=>{const de=document.documentElement,o={scroll:de.scrollHeight>innerHeight+1||de.scrollWidth>innerWidth+1,hits:[]};
        // a plate's visible box: its rect clipped by every scrolling ancestor and the viewport (cards scrolled out of a panel do not count)
        const vis=e=>{let r=e.getBoundingClientRect(),b={left:r.left,top:r.top,right:r.right,bottom:r.bottom};for(let p=e.parentElement;p;p=p.parentElement){const o=getComputedStyle(p).overflowY;if(o==='auto'||o==='scroll'||o==='hidden'){const q=p.getBoundingClientRect();b.left=Math.max(b.left,q.left);b.top=Math.max(b.top,q.top);b.right=Math.min(b.right,q.right);b.bottom=Math.min(b.bottom,q.bottom);}}
          b.left=Math.max(b.left,0);b.top=Math.max(b.top,0);b.right=Math.min(b.right,innerWidth);b.bottom=Math.min(b.bottom,innerHeight);b.width=b.right-b.left;b.height=b.bottom-b.top;return b;};
        const L=[...document.querySelectorAll('.battle .order,.battle .bwrap,.battle .bline,.battle .cmd,.battle .pc,.battle .fc,.battle .b8fl .fl,.battle .bossbar')].map(e=>({e,r:vis(e)})).filter(x=>x.r.width>0&&x.r.height>0);
        for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(a.e.contains(b.e)||b.e.contains(a.e))continue;
          const x=Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left),y=Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top);if(x>1&&y>1)o.hits.push(a.e.className.split(' ')[0]+'x'+b.e.className.split(' ')[0]+' '+Math.round(x)+'x'+Math.round(y));}
        return o;});
      chk(`${tag} ${realm}: the page does not scroll and no two plates overlap`,!ov.scroll&&!ov.hits.length||JSON.stringify(ov));
      if(SHOTS){await shot(H,`${tag}_${realm}_battle`);
        await ev(()=>{const A=__A;A.ACT.cmd('skills');A.render();});await wait(200);await shot(H,`${tag}_${realm}_skills`);
        await ev(()=>{const A=__A;A.ACT.back();A.render();});await wait(150);}
      // the result screen
      await ev(()=>{const A=__A;A.B.en.forEach(e=>e.hp=0);try{A.win();}catch(e){}A.render();});await wait(400);
      const rh=await heights(H);if(rh.resh2)chk(`${tag} ${realm}: the result title keeps its height (${rh.resh2})`,rh.resh2<=HEIGHTS[tag].resh2+2||rh.resh2);
      await shot(H,`${tag}_${realm}_result`);
      await ev(()=>{__A.V.modal=null;try{__A.finishBattle('win');}catch(e){}__A.render();});await wait(200);
      // the world bar of this realm
      const wv=await ev(([k,F])=>{const A=__A,G=A.G,zi=Object.fromEntries(A.ZONES.map((z,i)=>[z.key,i]));G.run.order[1]=zi[k];G.cleared[1]=0;A.resetMaps();G.clock=150;G.weather[1]='clear';const m=A.getMap('f1');A.V.modal=null;A.WS.dlg=null;
        A.placeAt(m.id,m.ent[0]+m.entFace[0]*3,m.ent[1]+m.entFace[1]*3,'u');A.WS.cam=null;A.render();const cs=getComputedStyle(document.documentElement);return {theme:m.theme,a:cs.getPropertyValue('--h13a').trim(),wbar:!!document.querySelector('.wbar')};},[realm]);
      await wait(400);
      if(hasH13)chk(`${tag} ${realm}: the world bar follows the map's realm (${wv.theme}: ${wv.a})`,/^#[0-9a-f]{6}$/i.test(wv.a)&&wv.a===rv.a||JSON.stringify([wv,rv.a]));
      const wh=await heights(H);all.heights[tag+'/'+realm].wbar=wh.wbar;chk(`${tag} ${realm}: the world bar keeps its height (${wh.wbar})`,!wh.wbar||wh.wbar<=HEIGHTS[tag].wbar+2||wh.wbar);
      const C2=await contrast(H,'world');Object.assign(all.contrast[tag+'/'+realm],{wkeys:C2.wkeys});
      if(C2.wkeys!=null)chk(`${tag} ${realm}: the world bar text keeps its contrast (${C2.wkeys})`,C2.wkeys>=CONTRAST.wkeys-.15||C2.wkeys);
      await shot(H,`${tag}_${realm}_world`);
    }
    // the Breach and the Echo Rift take their own tint (wide only)
    if(tag==='wide'){
      for(const [flag,name] of [['breach','Breach'],['rift','Echo Rift']]){
        await battle(H,{heroes:6,foes:3,seed:5,lv:20});
        const rv=await ev(f=>{const A=__A;A.B.spec[f]=1;if(f==='breach')A.B.spec.breach=1;A.render();const cs=getComputedStyle(document.documentElement);return {a:cs.getPropertyValue('--h13a').trim(),c1:cs.getPropertyValue('--h13c1').trim()};},flag);
        await wait(300);
        if(rv.a){chk(`wide: the ${name} has its own tint (${rv.a}), not the realm's (${first&&first.a})`,rv.a&&first&&rv.a!==first.a||JSON.stringify([rv,first]));
          await shot(H,`wide_${flag}_battle`);}
        await ev(()=>{__A.B.over=true;try{__A.finishBattle('fled');}catch(e){}});
      }
    }
    await H.browser.close();
  }
  if(MEASURE){console.log('HEIGHTS '+JSON.stringify(all.heights));console.log('CONTRAST '+JSON.stringify(all.contrast));}
  await done({browser:{close(){}}});
})();
