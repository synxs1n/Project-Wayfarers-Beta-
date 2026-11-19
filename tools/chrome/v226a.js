// v0.22.47 (fix47.js): guild missions unlock as they are completed, the Solar Eclipse is a change of light, tier colours.
//  1 guild missions: a guild has two out at a time. Accept all (Notices, and the Guilds tab's own) takes every mission on show and no new
//    one slides in behind it; handing one in posts one new mission; tier 2 missions on show are taken like the rest
//  2 the eclipse draws no dark disc: over a white canvas no pixel is darker than the dusk itself, on the map layer and in battle; on the
//    map nothing is tied to a spot (the layer is tiled), and the weather layer of the map (weather7.js) uses the new drawing
//  3 Heroic is ember orange and Echoforged the violet of the Echoes; no two tiers share a colour
// Usage (from tools/chrome): PWHTML=<abs path to out/aurelis3.html> node v226a.js
const {open,chk,done}=require('./pw');
setTimeout(()=>{console.log('FAIL watchdog: v226a ran over 200 s');process.exit(1);},200000).unref();
const META=`localStorage.clear();localStorage.setItem('aurelis-meta-v1',JSON.stringify({cfg:{speed:1,enc:'off',diff:'normal',music:0,sfx:0,gfx:'low',rmotion:false,hints:false,tips:false,goals:false}}));`;
(async()=>{const H=await open({w:390,h:844,mobile:true,pre:META,tag:'v226a'});const {ev,wait}=H;
  await ev(()=>{const A=__A;A.ACT.new();['mira','lumen','oren'].forEach(id=>A.ACT.pickS(id));A.ACT.begin();A.ACT.storyOk();A.V.modal=null;});await wait(300);
  const a=await ev(()=>{const A=__A,g=A.TW.get,G=A.G,o={};G.stage=3;G.cleared=[1,1,1,0,0];delete G.pcV;
    g('facRank=function(){return 5;}');// every guild at a high rank: all tiers open
    const FAC=g('FAC'),FMIS=g('FMIS'),facInit=g('facInit'),tierOf=g('facTierOf'),tier=g('facTier'),all=g('facMisAll'),st=g('facMisState');
    const pool=()=>{const f=facInit();return FMIS.filter(m=>FAC.some(F=>F.id===m.f)&&tierOf(m.r)<=tier(m.f)&&!f.done[m.id]);};
    const run=act=>{const f=facInit();f.acc={};f.done={};const P=pool().length,shown=all().filter(m=>st(m)==='open'),per=FAC.map(F=>g('facMissionList')(F.id).length);A.V.modal={type:'board',tab:'all',sec:'all'};A.ACT[act]();const f2=facInit();
      const r={guilds:FAC.length,pool:P,shown:shown.length,per:Math.max(...per),took:shown.filter(m=>f2.acc[m.id]!=null).length,acc:Object.keys(f2.acc).length,open:all().filter(m=>st(m)==='open').length};
      // hand one in: one new mission is posted for that guild
      const m=shown[0];f2.done[m.id]=1;delete f2.acc[m.id];const L=g('facMissionList')(m.f);r.afterDone=L.length;r.newOpen=L.filter(x=>st(x)==='open').length;
      // tier 2 and up: when one is on show, Accept all takes it
      f2.acc={};f2.done={};FMIS.filter(x=>tierOf(x.r)<2).forEach(x=>{f2.done[x.id]=1;});const hi=all().filter(x=>st(x)==='open');r.hi=hi.length;r.hiT2=hi.filter(x=>tierOf(x.r)>=2).length;A.ACT[act]();const f3=facInit();r.hiTook=hi.filter(x=>f3.acc[x.id]!=null).length;r.hiOpen=all().filter(x=>st(x)==='open').length;f3.done={};f3.acc={};
      return r;};
    o.nb=run('nbAcceptAll');o.fac=run('facAcceptAll');A.V.modal=null;return o;});
  for(const k of ['nb','fac']){const r=a[k];chk(`1 ${k==='nb'?'Notices':'Guilds'} Accept all: ${r.shown} missions on show (${r.per} a guild at most, ${r.pool} in the guilds' lists); one press takes all ${r.took} and no new one slides in (${r.open} open, ${r.acc} taken); handing one in posts ${r.newOpen} new one; with only tier 2 and up left, ${r.hi} on show (${r.hiT2} of tier 2 or higher), all ${r.hiTook} taken, ${r.hiOpen} open`,
    r.shown>0&&r.per<=2&&r.pool>r.shown&&r.took===r.shown&&r.open===0&&r.acc===r.shown&&r.afterDone===2&&r.newOpen===1&&r.hi>0&&r.hiT2===r.hi&&r.hiTook===r.hi&&r.hiOpen===0||JSON.stringify(r));}
  const b=await ev(()=>{const A=__A,g=A.TW.get,o={};const fx=g('weatherFX'),W7=g('W7');
    const scan=(f,battle)=>{const c=document.createElement('canvas');c.width=320;c.height=200;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,320,200);f(x,'eclipse',320,200,4000,battle);const d=x.getImageData(0,0,320,200).data;let min=255,dark=0;const rows=[];
      for(let y=0;y<200;y++){let s=0;for(let px=0;px<320;px++){const i=(y*320+px)*4,l=(d[i]*.3+d[i+1]*.5+d[i+2]*.2);s+=l;if(l<min)min=l;if(l<60)dark++;}rows.push(s/320);}
      const cols=[];for(let px=0;px<320;px+=40){let s=0;for(let y=0;y<200;y++){const i=(y*320+px)*4;s+=d[i]*.3+d[i+1]*.5+d[i+2]*.2;}cols.push(s/200);}
      return {min:Math.round(min),dark,spreadX:Math.round(Math.max(...cols)-Math.min(...cols)),top:Math.round(rows[4]),bottom:Math.round(rows[190])};};
    o.map=scan(fx,false);o.bat=scan(fx,true);o.w7=W7&&typeof W7.old==='function'?scan(W7.old,false):null;return o;});
  chk(`2 eclipse on the map layer: darkest pixel ${b.map.min} of 255 over white (${b.map.dark} near black), even from side to side (${b.map.spreadX}); in battle: darkest ${b.bat.min}, the sky's top lighter than the ground (${b.bat.top} vs ${b.bat.bottom}); the map's weather layer the same (${b.w7&&b.w7.dark} near black)`,
    b.map.dark===0&&b.map.min>90&&b.map.spreadX<12&&b.bat.dark===0&&b.bat.top>b.bat.bottom+4&&b.w7&&b.w7.dark===0||JSON.stringify(b));
  const c=await ev(()=>{const T=__A.TW.get('ITEM_TIERS');return T.map(t=>t.n+':'+t.c);});
  const cols=c.map(x=>x.split(':')[1]);
  chk(`3 tiers: ${c.join(', ')}`,c[4]==='Heroic:#ff9838'&&/^Echoforged:#c9a6ff$/.test(c[6])&&new Set(cols).size===cols.length||JSON.stringify(c));
  await done(H);})();
