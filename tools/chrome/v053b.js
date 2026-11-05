// v0.5.3 HD-2D battle stage (hdstage.js, hdspell.js): GL on Medium and High, the old 2D stage on Low, without WebGL and after a lost
// context; every backdrop builds and draws on the GL stage with units on the ground plane; the GL canvas has the DOM layer's box at every
// layout size; tags and pips stay on top and HUD pixels stay unlit; spells spawn their set pieces and lights; reduced motion spawns none.
// Usage: PWHTML=../../out/aurelis3.html node v053b.js
const {open,chk,done}=require('./pw');
const cfg=(t,rm)=>`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,autoStats:true,autoEquip:false,gfx:'${t}',rmotion:${!!rm},hints:false}}));`;
const NOGL=`(()=>{const gc=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,o){if(/webgl/.test(t))return null;return gc.call(this,t,o);};})();`;
async function boot(o){const H=await open(o);const errs=[];H.page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});H.errs=errs;
  await H.ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.render();});await H.wait(300);return H;}
async function fight(H,sp){await H.ev(sp=>{const A=__A;A.V.modal=null;Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;c.mp=c.S.mmp;});const s=Object.assign({stage:0,kind:'field',weather:'clear'},sp||{});
  if(s.foes)s.foes=s.foes.map(id=>A.makeEnemy(A.MON[id],5));A.startBattle(s);},sp);
  await H.page.waitForFunction(()=>__A.B&&__A.B.mode==='cmd',{timeout:25000}).catch(()=>{});
  await H.ev(()=>{const B=__A.B;B.en.concat(B.front).forEach(u=>{u.S.mhp=u.hp=99999;});});await H.wait(300);}
const state=H=>H.ev(()=>{const A=__A,HB=A.HB,gl=document.getElementById('bgl'),bc=document.getElementById('bcv');const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)];};
  return {on:HB.on,why:HB.why,err:HB.err,tier:A.GFX.tier,glShown:!!gl&&gl.style.display==='block'&&!!gl.parentNode&&gl.parentNode.id==='bwrap',bcOp:bc&&bc.style.opacity,glBox:r(gl),bcBox:r(bc),stBox:r(document.getElementById('bstage')),glPx:gl?[gl.width,gl.height]:null,frames:HB.frames,glUnder:!!gl&&gl.nextSibling===bc};});
(async()=>{
  // ---- Medium and High: the GL stage ----
  for(const t of ['medium','high']){const H=await boot({w:390,h:844,mobile:true,dpr:2,pre:cfg(t)});await fight(H,{bg:{th:'meadow',k:'field',g:'grass'},foes:['gull','mossling','frostwolf']});
    const s=await state(H),full=t==='high';
    chk(`${t}: GL stage on (${full?'full: units through GL, the 2D canvas hidden':'under: the 2D unit canvas visible on top'}) (${s.why||'ok'} ${s.glPx})`,s.on&&s.glShown&&s.bcOp===(full?'0':'')&&s.glUnder===true&&!s.err||JSON.stringify(s));
    chk(`${t}: the GL canvas has the 2D canvas's box`,JSON.stringify(s.glBox)===JSON.stringify(s.bcBox)||JSON.stringify(s));
    // a GL frame actually draws: read it back right after a frame, check it is not black and the HUD pixels (bars) stay unlit
    const px=await H.ev(()=>{const A=__A,HB=A.HB,gl=HB.gl,BL=A.BL;HB.redraw=true;A.battleFrame(performance.now());const w=HB.cv.width,h=HB.cv.height,buf=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,buf);
      let lit=0;for(let i=0;i<buf.length;i+=4*97)if(buf[i]+buf[i+1]+buf[i+2]>60)lit++;
      // HUD pixels: alpha 254 in the unit layer
      const bc=document.getElementById('bcv'),d=bc.getContext('2d').getImageData(0,0,bc.width,bc.height).data;let hud=0,bad=0,worst=0;
      for(let y=0;y<bc.height;y++)for(let x=0;x<bc.width;x++){const i=(y*bc.width+x)*4;if(d[i+3]!==254)continue;hud++;const gx=Math.floor((x+.5)/BL.W*w),gy=h-1-Math.floor((y+.5)/BL.H*h),j=(gy*w+gx)*4;
        const df=Math.max(Math.abs(buf[j]-d[i]),Math.abs(buf[j+1]-d[i+1]),Math.abs(buf[j+2]-d[i+2]));worst=Math.max(worst,df);if(df>40)bad++;}
      return {lit,n:Math.floor(buf.length/(4*97)),hud,bad,worst};});
    chk(`${t}: the GL frame has a lit stage (${px.lit}/${px.n} samples)`,px.lit>px.n*.8||JSON.stringify(px));
    if(full)chk(`${t}: bars and pips stay unlit on the GL stage (${px.hud} HUD px, ${px.bad} off by more than 40, worst ${px.worst})`,px.hud>50&&px.bad<=px.hud*.08||JSON.stringify(px));
    // tags and pips: the DOM unit layer stays on top of the GL canvas and gets the taps
    await H.ev(()=>{const B=__A.B;B.en[0].st=Object.assign(B.en[0].st||{},{poison:{t:3,v:1}});B.front[0].st=Object.assign(B.front[0].st||{},{regen:{t:3,v:1}});__A.render();});await H.wait(300);
    const tg=await H.ev(()=>{const gl=document.getElementById('bgl'),st=document.getElementById('bstage'),cs=getComputedStyle(gl);const out={pe:cs.pointerEvents,zg:+cs.zIndex,zs:+getComputedStyle(st).zIndex};
      const u=document.querySelector('#bstage .unit.foe');if(u){const b=u.getBoundingClientRect(),e=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);out.unitHit=!!e&&(e===u||u.contains(e));}
      const tag=document.querySelector('#bstage .utags');if(tag){const b=tag.getBoundingClientRect(),e=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);out.tagHit=!!e&&(tag.contains(e)||e===tag);}else out.tagHit=false;return out;});
    chk(`${t}: tags, pips and tap targets sit above the GL canvas`,tg.pe==='none'&&!(tg.zg>=tg.zs)&&tg.unitHit===true&&tg.tagHit!==false||JSON.stringify(tg));
    // spells: every element spawns its set piece and a light; a cast adds a floor circle
    const sp=await H.ev(()=>new Promise(res=>{const A=__A,B=A.B,a=B.front[0],e=B.en[0],out={};const els=['fire','ice','lightning','water','earth','wind','light','shadow'];let i=0;
      const step=()=>{if(i>=els.length){res(out);return;}const el=els[i++];A.BV.P.length=0;A.HB.L.length=0;A.HB.D.length=0;const T=Date.now();a.actT=T;a.actKind='mag';a.actEl=el;e.fxT=T;e.fxEl=el;
        A.battleFrame(performance.now());A.onFx(e,'99','dmg weak');out[el]={hb:A.BV.P.filter(p=>p.hb).length,L:A.HB.L.length,D:A.HB.D.length,on:A.HB.on};setTimeout(()=>{A.battleFrame(performance.now());out[el].after=A.HB.err||'';step();},120);};step();}));
    const miss=Object.entries(sp).filter(([k,v])=>!(v.hb>0&&v.L>=2&&v.on&&!v.after)).map(([k,v])=>k+':'+JSON.stringify(v));
    chk(`${t}: all 8 element spells draw their set piece with lights`,miss.length===0||miss.join(' '));
    const pe=await H.ev(()=>({cap:__A.GFX.q.parts,n:__A.BV.P.length}));chk(`${t}: particles stay under the tier cap (${pe.n}/${pe.cap})`,pe.n<=pe.cap);
    if(t==='medium'){
      // every backdrop builds and draws on the GL stage, every unit's feet (or a flyer's shadow) on the ground plane
      for(const [w,h] of [[390,844],[932,430]]){await H.page.setViewportSize({width:w,height:h});await H.wait(300);
        const r=await H.ev(()=>{const A=__A,P=__P2,keys=Object.keys(P.BG),bad=[];let n=0;
          for(const k of keys){A.V.modal=null;Object.values(A.G.roster).forEach(c=>{c.hp=c.S.mhp;});const foes=['gull','mossling','cavebat','frostwolf','yeti'].map(id=>A.makeEnemy(P.MON[id],5));
            const sp={stage:0,kind:'field',foes,weather:'clear'};if(k.startsWith('f:'))sp.bg={th:k.split(':')[1],k:'field',g:k.split(':')[2]};else if(k.startsWith('c_'))sp.bg={th:k.slice(2),k:'cave'};else if(k.startsWith('d_'))sp.bg={th:k.slice(2),k:'dungeon'};
            if(A.startBattle(sp)!==true){bad.push(k+' no start');continue;}
            try{A.HB.bake=null;const B=A.B;A.battleFrame(performance.now());A.battleFrame(performance.now()+16);
              // draw the requested key even for the base keys and boss and arena, which the live battle would not pick from a field spec
              const K=A.HB.bake;if(!A.HB.on||A.HB.err)bad.push(k+' GL off '+A.HB.why+' '+A.HB.err);
              const H=A.BL.H,gy=P.bgGY(H);B.en.concat(B.front).forEach(u=>{const b=P.unitBox(u);const foot=b.gy!=null?b.gy:b.y;if(foot<gy+2||foot>H-1)bad.push(`${k} ${u.name} foot ${foot} off [${gy},${H}]`);if(P.p2Flying(u)&&!(b.hov>0&&b.y<foot))bad.push(k+' flyer');});
              if(K&&K.gy!==gy)bad.push(k+' GL ground line '+K.gy+' vs '+gy);n++;}catch(e){bad.push(k+' '+e.message);}
            try{A.finishBattle('x');}catch(e){}A.V.modal=null;}
          // the keys a field spec cannot reach: draw them through the bake directly
          ['meadow','coast','cave','snow','heights','void','arena','boss_meadow','boss_coast','boss_cave','boss_snow','boss_heights','boss_void'].forEach(k=>{try{if(!P.BG[k])return;A.startBattle({stage:0,kind:'field',weather:'clear'});const bt=A.HB;
            bt.bake=null;bt.force=k;try{A.battleFrame(performance.now());}finally{bt.force=null;}if(!bt.on||bt.err||!bt.bake||bt.bake.key!==k)bad.push(k+' direct GL off');A.finishBattle('x');A.V.modal=null;}catch(e){bad.push(k+' '+e.message);}});
          return {n,keys:keys.length,bad};});
        chk(`GL stage at ${w}x${h}: ${r.n}/${r.keys} backdrops build and draw, units on the ground plane`,r.bad.length===0&&r.n===r.keys||r.bad.slice(0,6).join(' | '));}
      await H.page.setViewportSize({width:390,height:844});await H.wait(200);
      // a lost context falls back to the 2D stage; a restored one comes back
      await fight(H,{bg:{th:'cave',k:'cave'}});
      const lost=await H.ev(()=>new Promise(res=>{const A=__A,ext=A.HB.gl.getExtension('WEBGL_lose_context');if(!ext){res('no ext');return;}ext.loseContext();
        setTimeout(()=>{A.battleFrame(performance.now());const gl=document.getElementById('bgl'),bc=document.getElementById('bcv');const a={on:A.HB.on,lost:A.HB.lost,shown:gl.style.display,op:bc.style.opacity};
          // the 2D canvas has its backdrop again (opaque pixels at the top)
          a.opaque=bc.getContext('2d').getImageData(2,2,1,1).data[3];ext.restoreContext();setTimeout(()=>{A.battleFrame(performance.now());A.battleFrame(performance.now()+16);res(Object.assign(a,{back:A.HB.on,err:A.HB.err}));},300);},200);}));
      chk('lost context: 2D stage with its backdrop, GL back after restore',lost.on===false&&lost.lost===true&&lost.shown==='none'&&lost.op===''&&lost.opaque===255&&lost.back===true&&!lost.err||JSON.stringify(lost));}
    chk(`${t}: no console errors`,H.errs.length===0||H.errs.slice(0,3).join(' | '));
    await H.browser.close();}
  // ---- Low and no WebGL: the old 2D stage ----
  for(const [name,pre] of [['low',cfg('low')],['no WebGL (medium)',NOGL+cfg('medium')],['no WebGL (high)',NOGL+cfg('high')]]){const H=await boot({w:390,h:844,mobile:true,dpr:2,pre});await fight(H,{bg:{th:'meadow',k:'field',g:'grass'}});
    const s=await state(H);const d=await H.ev(()=>{const bc=document.getElementById('bcv');const g=bc.getContext('2d').getImageData(0,0,bc.width,bc.height).data;let op=0;for(let i=3;i<g.length;i+=4)if(g[i]===255)op++;return {op,all:g.length/4,glStage:__A.BV.glStage};});
    chk(`${name}: the 2D stage draws everything (GL ${s.on?'on':'off'}, ${d.op}/${d.all} opaque px)`,!s.on&&!s.glShown&&s.bcOp!=='0'&&d.op===d.all||JSON.stringify([s,d]));
    const sp=await H.ev(()=>new Promise(res=>{const A=__A,B=A.B,e=B.en[0];e.fxEl='fire';A.onFx(e,'9','dmg weak');setTimeout(()=>res({hb:A.BV.P.filter(p=>p.hb).length,L:A.HB.L.length}),250);}));
    chk(`${name}: no HD set pieces or lights on the 2D stage`,sp.hb===0&&sp.L===0||JSON.stringify(sp));
    chk(`${name}: no console errors`,H.errs.length===0||H.errs.slice(0,3).join(' | '));await H.browser.close();}
  // ---- reduced motion: the GL stage draws still frames, no set pieces, no camera ----
  {const H=await boot({w:390,h:844,mobile:true,dpr:2,pre:cfg('high',true)});await fight(H,{bg:{th:'meadow',k:'field',g:'grass'}});
    const r=await H.ev(()=>new Promise(res=>{const A=__A,B=A.B,e=B.en[0];e.fxEl='lightning';A.onFx(e,'9','dmg crit');setTimeout(()=>{A.battleFrame(performance.now());res({on:A.HB.on,hb:A.BV.P.filter(p=>p.hb).length,L:A.HB.L.length,D:A.HB.D.length,cam:document.getElementById('bgl').style.transform||''});},300);}));
    chk('reduced motion: GL stage on, no set pieces, lights, circles or camera push',r.on&&r.hb===0&&r.L===0&&r.D===0&&!r.cam||JSON.stringify(r));await H.browser.close();}
  // ---- layout sizes: the GL canvas lines up with the DOM layer and the 2D canvas ----
  for(const [w,h] of [[390,844],[844,390],[933,705],[1280,800]]){const H=await boot({w,h,mobile:w<900,dpr:2,pre:cfg('medium')});await fight(H,{bg:{th:'snow',k:'field',g:'snow'}});
    const s=await state(H);const ok=s.on&&JSON.stringify(s.glBox)===JSON.stringify(s.bcBox)&&s.stBox&&Math.abs(s.stBox[0]-s.glBox[0])<=1&&Math.abs(s.stBox[1]-s.glBox[1])<=1&&Math.abs(s.stBox[2]-s.glBox[2])<=1&&Math.abs(s.stBox[3]-s.glBox[3])<=1;
    const fit=await H.ev(()=>{const gl=document.getElementById('bgl').getBoundingClientRect();return [...document.querySelectorAll('#bstage .unit')].every(u=>{const b=u.getBoundingClientRect();return b.left>=gl.left-2&&b.right<=gl.right+2&&b.top>=gl.top-12&&b.bottom<=gl.bottom+12;});});
    chk(`${w}x${h}: GL canvas ${s.glBox} = 2D canvas = unit layer, units inside`,ok&&fit||JSON.stringify(s));
    chk(`${w}x${h}: no console errors`,H.errs.length===0||H.errs.slice(0,3).join(' | '));await H.browser.close();}
  await done({browser:{close:async()=>{}}});
})();
