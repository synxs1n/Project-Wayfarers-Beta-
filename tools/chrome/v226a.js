// v0.22.47 (fix47.js): Accept all takes every notice, the Solar Eclipse is a change of light, tier colours.
//  1 guild missions: with every guild at a high rank, one press of Accept all (Notices) leaves no open mission, and every mission of the
//    guild's tiers (tier 2 and up included) that is not done is accepted; the same for the Guilds tab's own Accept all on a fresh state
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
    const run=act=>{const f=facInit();f.acc={};const P=pool(),shown=all().filter(m=>st(m)==='open').length,t2=P.filter(m=>tierOf(m.r)>=2).length;A.V.modal={type:'board',tab:'all',sec:'all'};A.ACT[act]();const f2=facInit();
      return {pool:P.length,shown,t2,acc:P.filter(m=>f2.acc[m.id]!=null).length,t2acc:P.filter(m=>tierOf(m.r)>=2&&f2.acc[m.id]!=null).length,open:all().filter(m=>st(m)==='open').length,toast:(document.body.innerText.match(/Accepted \d+ (notice|mission)s?/)||[''])[0]};};
    o.nb=run('nbAcceptAll');o.fac=run('facAcceptAll');A.V.modal=null;return o;});
  for(const k of ['nb','fac']){const r=a[k];chk(`1 ${k==='nb'?'Notices':'Guilds'} Accept all: ${r.shown} missions were on show, ${r.pool} were available (${r.t2} of tier 2 or higher); after one press ${r.acc} are accepted (${r.t2acc} of the higher tiers), ${r.open} still open ("${r.toast}")`,r.pool>r.shown&&r.t2>0&&r.acc===r.pool&&r.t2acc===r.t2&&r.open===0||JSON.stringify(r));}
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
