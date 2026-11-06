// v0.7.1 title pass (v0.8.0: the camp became six wayfarers on the road through the realms, see v080wt.js): the HD-2D title (v0.8.9: the overworld walker on the world's sprite grid, no old lineup), the code-drawn wordmark on the title
// and in the header, menu and logo off every face at four sizes (with and without a save), Low tier and reduced motion still,
// Medium animated, and every icon the manifest, the page, Android, Windows and Electron point at exists at the right pixel size.
// Run from tools/chrome: PWHTML=../../out/aurelis3.html node v071t.js
const fs=require('fs'),path=require('path');const {open,chk,done}=require('./pw');
const ROOT=path.join(__dirname,'..','..');
const pngSize=f=>{const b=fs.readFileSync(f);if(b.readUInt32BE(0)!==0x89504e47)return null;return [b.readUInt32BE(16),b.readUInt32BE(20)];};
const SZ=[[390,844,1],[844,390,1],[933,705,1],[1280,720,0]];
const inter=(a,b)=>a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1;
async function title(H){const {ev,wait}=H;await wait(1200);
  return ev(()=>{const A=__A,T=A.T7,r=e=>{const b=e.getBoundingClientRect();return {left:b.left,top:b.top,right:b.right,bottom:b.bottom,w:b.width,h:b.height};};
    const menu=[...document.querySelectorAll('.t7side .btn,.t7side summary')].filter(e=>e.offsetParent).map(e=>({t:(e.textContent||'').trim().slice(0,20),...r(e)}));
    const logo=document.querySelector('.t7wm svg'),hdr=document.querySelector('#hdr .brand .wfm svg');
    return {cv:!!document.getElementById('t7cv'),old:!!document.querySelector('.lineup,#tcv,.tstage'),drawn:T.drawn,faces:T.faces,menu,
      logo:logo?r(logo):null,beta:document.querySelector('.t7beta')?r(document.querySelector('.t7beta')):null,hdr:hdr?r(hdr):null,hdrPolys:hdr?hdr.querySelectorAll('polygon').length:0,
      order:[...document.querySelectorAll('.tmenu .tmain .btn')].map(b=>b.dataset.act).join(','),sw:document.documentElement.scrollWidth,iw:innerWidth,ih:innerHeight,
      cw:document.getElementById('t7cv')?document.getElementById('t7cv').width:0,ccw:document.getElementById('t7cv')?document.getElementById('t7cv').clientWidth:0,dpr:devicePixelRatio,
      font:getComputedStyle(document.querySelector('#hdr .brand b')).fontFamily};});}
function judge(tag,t,save){
  chk(`${tag}: the title scene canvas is up and the old lineup and backdrop are gone`,t.cv&&!t.old||JSON.stringify({cv:t.cv,old:t.old}));
  chk(`${tag}: all six heroes drawn (v0.8.0: the party on the road)`,t.drawn.length===6||t.drawn.length);
  const bad=t.drawn.filter(d=>!(d.wsc>0&&d.rw===Math.max(2,Math.round(d.lw*d.wsc/2)*2)&&Number.isInteger(d.k)&&d.k>=1&&d.w===d.rw*d.k&&d.h===d.rh*d.k));
  chk(`${tag}: heroes drawn as the overworld sprite at a whole scale (v0.8.9)`,bad.length===0||JSON.stringify(bad[0]));
  chk(`${tag}: wordmark on the title and in the header`,!!(t.logo&&t.logo.w>120&&t.hdr&&t.hdr.h>=14&&t.hdrPolys>20)||JSON.stringify({logo:t.logo,hdr:t.hdr}));
  chk(`${tag}: no blackletter in the header`,!/Jacquard/.test(t.font)||t.font);
  const hits=[];t.faces.forEach(f=>{t.menu.forEach(m=>{if(inter(f,m))hits.push(m.t+' over '+f.id);});[['logo',t.logo],['beta',t.beta]].forEach(([n,b])=>{if(b&&inter(f,b))hits.push(n+' over '+f.id);});});
  chk(`${tag}: menu and logo clear of every face (${t.faces.length} faces, ${t.menu.length} controls)`,t.faces.length===6&&hits.length===0||hits.slice(0,4).join(' | ')||t.faces.length);
  chk(`${tag}: no sideways scroll`,t.sw<=t.iw+1||t.sw+'>'+t.iw);
  const first=t.menu[0];chk(`${tag}: the first menu button is on screen`,!!first&&first.bottom<=t.ih||JSON.stringify(first));
  if(save)chk(`${tag}: Continue first, then New journey and the Daily Trial`,t.order==='slots,new,daily'||t.order);
  else chk(`${tag}: New journey first without a save`,t.order==='new,daily'||t.order);
}
const hash=H=>H.ev(()=>{const c=document.getElementById('t7cv'),x=c.getContext('2d'),d=x.getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=97)h=(h*31+d[i])>>>0;return h;});
(async()=>{
  for(const [w,h,m] of SZ){const H=await open({w,h,mobile:!!m,dpr:m?2:1});const {ev,wait}=H,tag=`${w}x${h}`;
    judge(tag,await title(H),false);
    await ev(()=>{const A=__A;A.ACT.new();['oren','mira','lumen'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;A.saveGame();A.render();});await wait(600);
    const hw=await ev(()=>{const s=document.querySelector('#hdr .brand .wfm svg');return s?s.getBoundingClientRect().height:0;});
    chk(`${tag}: world header shows the small wordmark`,hw>=14&&hw<=30||hw);
    await ev(()=>{const A=__A;A.META.cfg.hints=false;A.V.screen='title';A.G=null;A.V.modal=null;A.render();});
    judge(tag+' with a save',await title(H),true);
    if(w===390){// Medium animates; Low and reduced motion hold still
      const f0=await ev(()=>__A.T7.frames),h0=await hash(H);await wait(700);const f1=await ev(()=>__A.T7.frames),h1=await hash(H);
      chk('medium: the scene animates (walking party, scrolling realm)',f1>f0+5&&h1!==h0||JSON.stringify({f0,f1,same:h0===h1}));
      await ev(()=>{const A=__A;A.META.cfg.gfx='low';A.gfxApply();});await wait(400);
      const l=await ev(()=>({f:__A.T7.frames,cw:document.getElementById('t7cv').width,ccw:document.getElementById('t7cv').clientWidth,still:__A.T7.still}));const lh0=await hash(H);await wait(800);
      const l2=await ev(()=>__A.T7.frames),lh1=await hash(H);
      chk('low: one still frame, no redraws',l.still===true&&l2===l.f&&lh0===lh1||JSON.stringify({l,l2,same:lh0===lh1}));
      chk('low: drawn at 1x (cheap)',l.cw===l.ccw||l.cw+' vs '+l.ccw);
      const ld=await ev(()=>__A.T7.drawn);chk('low: still the overworld sprites',ld.length===6&&ld.every(d=>d.wsc>0&&d.rw===Math.max(2,Math.round(d.lw*d.wsc/2)*2))||JSON.stringify(ld[0]));
      await ev(()=>{const A=__A;A.META.cfg.gfx='medium';A.META.cfg.rmotion=true;A.gfxApply();});await wait(400);
      const r0=await ev(()=>__A.T7.frames);await wait(700);const r1=await ev(()=>__A.T7.frames);
      chk('reduced motion: still',r1===r0||r1-r0);
      await ev(()=>{const A=__A;A.META.cfg.rmotion=false;});}
    await H.browser.close();}
  // ----- icons -----
  const exists=f=>fs.existsSync(path.join(ROOT,f));
  const man=JSON.parse(fs.readFileSync(path.join(ROOT,'manifest.webmanifest'),'utf8'));
  const mb=man.icons.filter(i=>{if(!exists(i.src))return true;if(i.type==='image/png'){const s=pngSize(path.join(ROOT,i.src)),[w,h]=i.sizes.split('x').map(Number);return !s||s[0]!==w||s[1]!==h;}return false;});
  chk(`manifest: all ${man.icons.length} icons exist at their stated size`,mb.length===0||JSON.stringify(mb));
  chk('manifest: a maskable icon',man.icons.some(i=>/maskable/.test(i.purpose||''))||'none');
  const shell=fs.readFileSync(path.join(ROOT,'v3','shell.html'),'utf8'),links=[...shell.matchAll(/<link rel="(icon|apple-touch-icon)"([^>]*)href="([^"]+)"/g)];
  const lb=links.filter(([,,a,f])=>{if(!exists(f))return true;const m=/sizes="(\d+)x(\d+)"/.exec(a);if(m){const s=pngSize(path.join(ROOT,f));return !s||s[0]!=+m[1]||s[1]!=+m[2];}return false;});
  chk(`page: favicon and Apple touch icon links resolve (${links.length})`,links.length>=3&&lb.length===0||JSON.stringify(lb.map(l=>l[3])));
  const out=fs.readFileSync(path.join(ROOT,'out','aurelis3.html'),'utf8');chk('built page carries the new icon links',/apple-touch-icon\.png/.test(out)&&/favicon-32\.png/.test(out)||'missing');
  const D={mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4},ab=[];
  for(const [d,k] of Object.entries(D))for(const [n,base] of [['ic_launcher',48],['ic_launcher_round',48],['ic_launcher_foreground',108]]){const f=path.join(ROOT,'android-res','mipmap-'+d,n+'.png'),s=fs.existsSync(f)&&pngSize(f),e=Math.round(base*k);if(!s||s[0]!==e||s[1]!==e)ab.push(d+'/'+n+' '+(s?s.join('x'):'missing'));}
  chk('android: launcher, round and adaptive foreground icons at every density',ab.length===0||ab.join(', '));
  const ax=['mipmap-anydpi-v26/ic_launcher.xml','mipmap-anydpi-v26/ic_launcher_round.xml'].map(f=>fs.readFileSync(path.join(ROOT,'android-res',f),'utf8'));
  const col=fs.readFileSync(path.join(ROOT,'android-res','values','ic_launcher_background.xml'),'utf8');
  chk('android: adaptive icon xml points at the foreground and the background colour',ax.every(x=>/@mipmap\/ic_launcher_foreground/.test(x)&&/@color\/ic_launcher_background/.test(x))&&/name="ic_launcher_background">#[0-9A-Fa-f]{6}</.test(col)||'bad xml');
  const pk=JSON.parse(fs.readFileSync(path.join(ROOT,'package.json'),'utf8')),wi=pk.build.win.icon,ib=exists(wi)&&fs.readFileSync(path.join(ROOT,wi));
  let icoOk=false;if(ib&&ib.readUInt16LE(2)===1){const n=ib.readUInt16LE(4),sz=[];for(let i=0;i<n;i++){const o=6+16*i,w=ib[o]||256,len=ib.readUInt32LE(o+8),off=ib.readUInt32LE(o+12),p=ib.slice(off,off+len);const s=p.readUInt32BE(0)===0x89504e47?[p.readUInt32BE(16),p.readUInt32BE(20)]:null;if(s&&s[0]===w&&s[1]===w)sz.push(w);}icoOk=sz.includes(256)&&sz.includes(16)&&sz.length===n?sz.join(','):false;}
  chk(`windows: ${wi} is an .ico with 16 to 256 px images`,!!icoOk||'bad ico');
  const em=fs.readFileSync(path.join(ROOT,'electron','main.js'),'utf8'),ep=/icon: path\.join\(__dirname, '\.\.', '([^']+)', '([^']+)'\)/.exec(em);
  chk('electron: the window icon exists',!!ep&&exists(ep[1]+'/'+ep[2])&&pngSize(path.join(ROOT,ep[1],ep[2]))[0]>=256||'missing');
  const yml=fs.readFileSync(path.join(ROOT,'.github','workflows','release.yml'),'utf8');
  chk('release workflow: copies icons/ and android-res/, both present',/cp -r icons www\/icons/.test(yml)&&/cp -r android-res\/\* \$R\//.test(yml)&&exists('icons')&&exists('android-res')||'workflow paths changed');
  await done({browser:{close:async()=>{}}});})();
