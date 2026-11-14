// ===== early17.js: a gentle start in the grass of the first field (owner playtest: "early game enemies are a bit too tough and high
// level for a party of 3"; docs/early17.md has the numbers) =====
// Only the first field of the first realm of a first journey (stage 0, G.run.cycle 0, not the Daily Trial). The field is cut in three bands by
// walking distance from the gate the party enters by (mapEntry) to the far gate:
//   near (the first third)   random grass fights: foes of level 1 to 2 (never above the party's lowest level), one or two of them, a little softer
//                            (E17.band[0]); no night power. Roamers that live here are never elite and are a few levels lower (E17.roam[0]).
//   middle (the next third)  a step up: level 2 to 4 (at most one above the party's lowest level), three foes less often (E17.band[1]); roamers a
//                            little lower, never elite (E17.roam[1]).
//   far (the last third)     exactly as before, and so is everything else: bounties, dens, the Mimic, duels, the dungeon and the Scourge.
// Once the first Scourge has fallen the field's random fights are the stronger "echo" fights they always were (the ramp is over).
// Nothing is saved and nothing is shown: an old save still on its first field gets the same bands from its own map.
// A fight started with spec.e17 (0 near, 1 middle, 2 far) uses that band instead of the party's place: the sims (tools/fullsim.js) and tests use it.
// E17.off=1 switches the whole module off (tests compare with it).
const E17={off:0,cut:[1/3,2/3],
  // lv: foe level range; over: how far above the party's lowest level the top of the range may go; max: most foes; solo: chance a pair becomes
  // one foe; trim: chance a pack of three loses one; hp, pow: multipliers on HP and on ATK and MAG; night: keep the night power (world3.js)
  band:[{lv:[2,3],over:0,max:2,solo:.25,trim:1,hp:1,pow:1,night:0},
        {lv:[3,5],over:1,max:3,solo:0,trim:.5,hp:1,pow:1,night:1}],
  // roamers by the band their home tile is in: lv = the lead's level (company one below; ROAM.lvUp over the top of the range elsewhere: 9),
  // elite: may it be an elite, mates: most company
  roam:[{lv:4,elite:0,mates:1},{lv:6,elite:0,mates:1}],
  n:{near:0,mid:0,roam:0},last:null,err:[]};
function e17Err(w,e){try{if(E17.err.length<20)E17.err.push(w+': '+(e&&e.message||e));}catch(_){}}
// the journey the ramp is for (roamers keep their softening after the Scourge falls: their fights never were echo fights)
function e17Run(){return !E17.off&&!!G&&!G.daily&&!!G.run&&!(G.run.cycle>0);}
function e17On(){return e17Run()&&!(G.cleared&&G.cleared[0]);}
function e17Field(m){return !!(m&&m.kind==='field'&&(m.s|0)===0&&!m.cave&&!m.breach&&m.t&&m.t.length);}
// walking distance of every tile from the entrance (4-way flood over what is not solid), and the distance of the far gate
function e17Dist(m){const c=m.__e17;if(c&&c.t===m.t)return c;const H=m.t.length,W=m.t[0].length,D=new Int16Array(W*H).fill(-1),st=mapEntry(m);let far=0,end=0;
  if(st&&st[0]>=0&&st[1]>=0&&st[0]<W&&st[1]<H){const q=[st[0]+st[1]*W];D[q[0]]=0;
    for(let i=0;i<q.length;i++){const p=q[i],x=p%W,y=(p-x)/W,d=D[p];if(d>far)far=d;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const k=nx+ny*W;if(D[k]>=0||SOLID.includes(m.t[ny][nx]))continue;D[k]=d+1;q.push(k);}}
    // the far end: the gate out to the next town (or, on an old two part world, the way on to the second field), else the farthest tile
    const g=m.gates&&m.gates.end&&m.gates.end.arrive,ex=(m.exits||[]).filter(e=>e.to&&e.to.m!=='t'+(m.s|0)&&e.x>=0&&e.y>=0&&e.x<W&&e.y<H);
    if(g&&g[0]>=0&&g[1]>=0&&g[0]<W&&g[1]<H&&D[g[0]+g[1]*W]>0)end=D[g[0]+g[1]*W];
    else ex.forEach(e=>{const d=D[e.x+e.y*W];if(d>end)end=d;});}
  const r={t:m.t,W,H,D,end:end>8?end:far};try{Object.defineProperty(m,'__e17',{value:r,writable:true,configurable:true,enumerable:false});}catch(e){m.__e17=r;}return r;}
// 0..1 along the field (null where the walk does not reach); an old two part world counts its first stretch as the first half
function e17Frac(m,x,y){if(!e17Field(m))return null;const c=e17Dist(m);if(!(c.end>0)||x<0||y<0||x>=c.W||y>=c.H)return null;let d=c.D[x+y*c.W];
  if(d<0){for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=c.W||ny>=c.H)continue;const q=c.D[nx+ny*c.W];if(q>=0&&(d<0||q<d))d=q+1;}}
  if(d<0)return null;let f=Math.min(1,d/c.end);if(m.part===1)f*=.5;else if(m.part===2&&MAPS['g'+(m.s|0)])f=.5+.5*f;return f;}
function e17BandAt(m,x,y){const f=e17Frac(m,x,y);return f==null?2:f<E17.cut[0]?0:f<E17.cut[1]?1:2;}
// the band of a fight: 2 = leave it alone
function e17Band(spec){if(!spec||(spec.stage|0)!==0||spec.mimic||spec.foes)return 2;
  if(spec.roam){if(!e17Run())return 2;if(typeof spec.e17==='number')return spec.e17|0;const m=MAPS[spec.roam.mid];if(!e17Field(m))return 2;const r=(m.roam||[]).find(q=>q.i===spec.roam.i);return r?e17BandAt(m,r.hx,r.hy):2;}
  if(spec.kind!=='field'||!e17On())return 2;if(typeof spec.e17==='number')return spec.e17|0;
  const m=WS.m;return e17Field(m)?e17BandAt(m,WS.x,WS.y):2;}
function e17Lo(){try{const p=partyChars();return p.length?Math.min(...p.map(c=>c.lv)):3;}catch(e){return 3;}}
function e17Names(out){out.forEach(e=>{if(!e.elite&&!e.boss&&e.base&&e.name!==e.base&&e.name.slice(0,e.base.length+1)===e.base+' '&&e.name.length===e.base.length+2)e.name=e.base;});
  const cnt={};out.forEach(e=>{cnt[e.name]=(cnt[e.name]||0)+1;});const seen={};out.forEach(e=>{if(cnt[e.name]>1){seen[e.name]=(seen[e.name]||0)+1;e.name+=' '+String.fromCharCode(64+seen[e.name]);}});}
// Loaded last, so this sits outside every other encounterFoes hook: the level range of stage 1 is narrowed while the others build the fight
// (the roamer hook reads the same range), then the pack is trimmed.
HOOK.wrap('encounterFoes','early17','gentle grass and roamers near the entrance of the first field',function(next,...a){const spec=a[0];let b=2;
  try{b=e17Band(spec);}catch(e){e17Err('band',e);}
  const ro=!!(spec&&spec.roam),T=b<2?(ro?E17.roam[b]:E17.band[b]):null;if(!T)return next(...a);
  const row=STAGE_LV[0],sv=[row[0],row[1]];let lo,hi;
  if(ro){hi=lo=Math.max(1,T.lv-ROAM.lvUp);}else{hi=Math.max(1,Math.min(T.lv[1],e17Lo()+(T.over||0)));lo=Math.min(hi,T.lv[0]);}
  let out;try{row[0]=lo;row[1]=hi;out=next(...a);}finally{row[0]=sv[0];row[1]=sv[1];}
  try{if(!Array.isArray(out)||!out.length)return out;
    if(ro){if(out.length>1+T.mates)out.length=1+T.mates;E17.n.roam++;}
    else{if(out.length>T.max)out.length=T.max;if(out.length===3&&RNG()<T.trim)out.length=2;if(out.length===2&&RNG()<T.solo)out.length=1;
      out.forEach(e=>{const nm=(e.night&&!T.night)?1/NIGHT_POW:1,h=T.hp*nm,p=T.pow*nm;
        if(h!==1){e.S.mhp=Math.max(1,Math.round(e.S.mhp*h));e.hp=e.S.mhp;}if(p!==1){e.S.atk*=p;e.S.mag*=p;}if(nm!==1){e.S.def*=nm;e.S.res*=nm;}});
      E17.n[b?'mid':'near']++;}
    e17Names(out);out.forEach(e=>{e.e17=b+1;});E17.last={b,lo,hi,n:out.length,roam:ro};}catch(e){e17Err('foes',e);}
  return out;});
// roamers whose home is in the near or middle band are never elite (the fight above lowers their level)
HOOK.xform('roamSpawn','early17','no elite roamers near the entrance of the first field',function(out,m){
  try{if(!out||!out.length||!e17Run()||!e17Field(m))return out;
    out.forEach(r=>{if(!r.elite)return;const T=E17.roam[e17BandAt(m,r.hx,r.hy)];if(T&&!T.elite){r.elite=false;r.mod=null;r.name=MON[r.mon].n;r.e17=1;}});}catch(e){e17Err('roam',e);}
  return out;});
// tests and sims
E17.api={on:e17On,run:e17Run,field:e17Field,dist:e17Dist,frac:e17Frac,bandAt:e17BandAt,band:e17Band,lo:e17Lo,foes:(spec,seed)=>{const r0=RNG;if(seed!=null)RNG=seeded(seed>>>0);try{return encounterFoes(spec);}finally{RNG=r0;}},isNight:()=>isNight(),NIGHT_POW,ROAM};
try{window.__E17=E17;}catch(e){}
