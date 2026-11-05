// Beta v0.5.3 UI: 1) text contrast: body text on the key panels (menu tabs, Smithy, Inn, results, the battle command panel and
// cards, the world HUD, the title) is at least 4.5:1 against the pixels actually drawn behind it (screenshot with the text hidden,
// 90% of the background pixels under each line must pass; disabled controls are exempt); 2) keyboard focus is visible on every
// control Tab reaches; 3) reduced motion (the OS setting and the game's own setting) turns the new transitions and entrances off.
// Usage: PWHTML=../../out/aurelis3.html node v053ub.js
const {open,chk,done}=require('./pw');
const lumOf=(r,g,b)=>{const f=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);};return .2126*f(r)+.7152*f(g)+.0722*f(b);};
(async()=>{
const H=await open({w:390,h:844,mobile:true,dpr:1,pre:`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{hints:false,music:0,sfx:0,enc:'off',rmotion:false}}));`});const {ev,wait,page}=H;
// collect the text boxes of every visible text node inside the given roots
const boxes=roots=>ev(roots=>{const out=[];const rs=roots.flatMap(s=>[...document.querySelectorAll(s)]);
  const ok=el=>{for(let e=el;e&&e!==document.body;e=e.parentElement){const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none'||parseFloat(cs.opacity)<.99)return false;if(e.disabled||e.getAttribute('aria-disabled')==='true'||e.classList.contains('lock'))return false;}return true;};
  for(const r of rs){const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const t=n.textContent.trim();if(t.length<2||!/[A-Za-z0-9]/.test(t))continue;const el=n.parentElement;if(!ok(el))continue;
    const cs=getComputedStyle(el);const fs=parseFloat(cs.fontSize);if(fs<10)continue;const m=cs.color.match(/[\d.]+/g).map(Number);if(m.length>3&&m[3]<.99)continue;
    // clip to every scrolling or clipping ancestor and to the viewport; skip lines another layer covers (the save pill, a toast)
    let cl={l:0,t:0,r:innerWidth,b:innerHeight};for(let e=el;e&&e!==document.body;e=e.parentElement){const o=getComputedStyle(e);if(/auto|scroll|hidden|clip/.test(o.overflow+o.overflowY+o.overflowX)){const q=e.getBoundingClientRect();cl={l:Math.max(cl.l,q.left),t:Math.max(cl.t,q.top),r:Math.min(cl.r,q.right),b:Math.min(cl.b,q.bottom)};}}
    const rg=document.createRange();rg.selectNodeContents(n);for(const b0 of rg.getClientRects()){const b={left:Math.max(b0.left,cl.l),top:Math.max(b0.top,cl.t),right:Math.min(b0.right,cl.r),bottom:Math.min(b0.bottom,cl.b)};b.width=b.right-b.left;b.height=b.bottom-b.top;
      if(b.width<4||b.height<b0.height-1)continue;const hit=document.elementFromPoint((b.left+b.right)/2,(b.top+b.bottom)/2);if(!hit||!(hit===el||el.contains(hit)||hit.contains(el)))continue;if([...document.querySelectorAll('#p5save,#svicon,#toast,#p2hint')].some(o=>{const q=o.getBoundingClientRect();return getComputedStyle(o).opacity>0.05&&q.width&&b.left<q.right&&b.right>q.left&&b.top<q.bottom&&b.bottom>q.top;}))continue;
      out.push({t:t.slice(0,24),c:m.slice(0,3),x:Math.max(0,Math.floor(b.left)),y:Math.max(0,Math.floor(b.top)),w:Math.ceil(b.width),h:Math.ceil(b.height),sel:(el.className||el.tagName).toString().slice(0,30)});}}}
  return out;},roots);
// screenshot with all text hidden, read the pixels in the page, and score each box
const score=async(bx)=>{await page.addStyleTag({content:'*{color:transparent!important;text-shadow:none!important;caret-color:transparent!important;-webkit-text-fill-color:transparent!important}#p5save,#svicon,#toast,#p2hint{visibility:hidden!important}',}).then(h=>page.evaluate(e=>e.id='v053hide',h));
  await wait(80);const png=(await page.screenshot()).toString('base64');await ev(()=>{const s=document.getElementById('v053hide');if(s)s.remove();});
  return ev(async({png,bx})=>{const img=new Image();img.src='data:image/png;base64,'+png;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);
    const lum=(r,g,b)=>{const f=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);};return .2126*f(r)+.7152*f(g)+.0722*f(b);};
    return bx.map(b=>{const w=Math.min(b.w,c.width-b.x),h=Math.min(b.h,c.height-b.y);if(w<1||h<1)return null;const d=x.getImageData(b.x,b.y,w,h).data,L=lum(...b.c),rs=[];
      for(let i=0;i<d.length;i+=4){const l=lum(d[i],d[i+1],d[i+2]);rs.push((Math.max(L,l)+.05)/(Math.min(L,l)+.05));}rs.sort((a,b)=>a-b);return Object.assign(b,{ratio:+rs[Math.floor(rs.length*.1)].toFixed(2)});}).filter(Boolean);},{png,bx});};
const check=async(name,roots)=>{await wait(500);const bx=await boxes(roots);const r=await score(bx);const bad=r.filter(b=>b.ratio<4.5);
  chk(`contrast ${name}: ${r.length} text lines, all at least 4.5:1 (lowest ${r.length?Math.min(...r.map(b=>b.ratio)):'-'})`,r.length>0&&bad.length===0||(r.length?bad.slice(0,6).map(b=>`"${b.t}" ${b.ratio} (${b.sel})`).join(' | '):'no text found'));};
await wait(400);
await check('title',['.title']);
await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.G.gold=9999;A.render();});
await check('world HUD',['.wbar','.hdr']);
for(const t of ['party','equip','items','quests','settings'])await ev(t=>{__A.V.modal={type:'menu',tab:t};__A.render();},t).then(()=>check('menu '+t,['#modal .panel']));
for(const s of [{type:'smithy',tab:'weapons'},{type:'smithy',tab:'forge'},{type:'inn'},{type:'workshop',tab:'shop'},{type:'guild',tab:'recruit'},{type:'tavern'},{type:'board'}])
  await ev(s=>{__A.V.modal=s;__A.render();},s).then(()=>check(s.type+(s.tab?' '+s.tab:''),['#modal .panel']));
await ev(()=>{__A.V.modal=null;__A.render();__A.startBattle({stage:0,kind:'field'});});await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
await check('battle command panel and cards',['#bcmd','#bparty','#border']);
await ev(()=>{__A.B.en.forEach(e=>e.hp=0);__A.win();});await wait(700);await check('results',['#modal .panel']);
await ev(()=>{const b=document.querySelector('[data-act="resultOk"]');if(b)b.click();});await wait(300);
// 2) focus visible: Tab through the menu and a shop; every focused control shows an outline (or a ring) that it lacks without focus
const foc=async(name,setup)=>{await ev(setup);await wait(350);const r=await page.evaluate(()=>{document.activeElement&&document.activeElement.blur&&document.activeElement.blur();return 1;});
  const seen=[],bad=[];for(let i=0;i<24;i++){await page.keyboard.press('Tab');const o=await ev(()=>{const e=document.activeElement;if(!e||e===document.body)return null;const cs=getComputedStyle(e),r=e.getBoundingClientRect();
      return {n:(e.textContent||e.getAttribute('aria-label')||e.tagName).trim().slice(0,16),ow:(parseFloat(cs.outlineWidth)||0)*(e.offsetWidth?r.width/e.offsetWidth:1),os:cs.outlineStyle,bs:cs.boxShadow,vis:r.width>0&&r.height>0,fv:e.matches(':focus-visible')};});
    if(!o||!o.vis)continue;seen.push(o.n);if(!(o.fv&&((o.os!=='none'&&o.ow>=1.9)||/rgb/.test(o.bs)&&o.bs!=='none')))bad.push(o.n+' '+o.os+' '+o.ow);}
  chk(`focus visible ${name}: ${seen.length} Tab stops, each shows a ring`,seen.length>3&&bad.length===0||(seen.length>3?bad.slice(0,5).join(' | '):'only '+seen.length+' stops'));};
await foc('menu',()=>{__A.V.modal={type:'menu',tab:'party'};__A.render();});
await foc('smithy',()=>{__A.V.modal={type:'smithy',tab:'weapons'};__A.render();});
await foc('battle',()=>{__A.V.modal=null;__A.render();__A.startBattle({stage:0,kind:'field'});});
await page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
// 3) reduced motion
const motion=()=>ev(()=>{const q=s=>document.querySelector(s),o={};const cs=s=>{const e=q(s);return e?getComputedStyle(e):null;};
  for(const s of ['#bcmd .mi','#bcmd .btn','.pc','#border .oc'])o[s]=cs(s)?cs(s).transitionDuration:'n/a';
  __A.V.modal={type:'menu',tab:'party'};__A.render();const p=cs('#modal .panel'),m=cs('#modal .modal');o.panelAnim=p?p.animationName:'n/a';o.modalAnim=m?m.animationName:'n/a';o.chip=cs('#modal .chip')?cs('#modal .chip').transitionDuration:'n/a';
  __A.V.modal=null;__A.render();return o;});
const moving=o=>Object.entries(o).filter(([k,v])=>/Anim/.test(k)?v!=='none':v!=='n/a'&&v.split(',').some(x=>parseFloat(x)>0)).map(([k,v])=>k+'='+v);
const m0=await motion();
chk(`motion on by default (sanity): ${JSON.stringify(m0)}`,moving(m0).length>=3||JSON.stringify(m0));
await page.emulateMedia({reducedMotion:'reduce'});await ev(()=>{__A.render();});await wait(100);
const m1=await motion();chk('OS reduced motion: no transitions or entrances',moving(m1).length===0||moving(m1).join(', '));
await page.emulateMedia({reducedMotion:'no-preference'});await ev(()=>{document.documentElement.classList.add('rm');__A.render();});await wait(100);
const m2=await motion();chk('game setting reduced motion (html.rm): no transitions or entrances',moving(m2).length===0||moving(m2).join(', '));
await done(H);})();
