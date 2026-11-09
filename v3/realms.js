// ===== realms.js (v0.4.1): sixteen realms, boss overlays, Calamity realms, realm weighting =====
// Data first: every realm is one entry in REALMS below, every boss overlay one entry in BOV, every Calamity effect one entry in CAL_FX.
// New journeys (G.run.rv===2) draw 4 of the 12 standard realms and 1 of the 4 Calamity realms from the run seed, and draw their bosses
// independently, so any Scourge can sit in any standard realm and any Calamity in any Calamity realm. Older journeys keep the six
// original realms (ZONES 0 to 5) exactly as they were.
// A realm reuses one of the six tilesets (meadow, coast, cave, snow, heights, void) for its layout rules and adds its own identity:
// a palette lean, roofs and decorations, a ground motif, ambient particles, its own monster mix (with realm variants), weather table,
// townsfolk, quests and a music shift. The boss overlay sits on top while the boss lives and lifts when it falls.

// ---------- realm monster variants: a base sprite repainted toward a colour, with its own name and elements ----------
const MONV=[
 // id, base, name, elements, colour
 ['v_bramblepup','cinderpup','Bramble Pup',['earth'],'#5a8a3a'],['v_sunimp','gustimp','Sunflick Imp',['light','wind'],'#f0c040'],
 ['v_bogtoad','dewtoad','Bog Toad',['water','shadow'],'#3a5a3a'],['v_marshwisp','tidewisp','Marsh Wisp',['water','shadow'],'#5a7a6a'],
 ['v_glowslime','magmaslime','Glowcap Slime',['earth','light'],'#5ad0b0'],['v_emberbat','cavebat','Ember Bat',['fire','shadow'],'#c0502a'],
 ['v_rimewolf','frostwolf','Rime Stalker',['ice','shadow'],'#4a5a8a'],['v_galeharpy','snowharpy','Gale Harpy',['wind','lightning'],'#a8a0e0'],
 ['v_sunhawk','thunderhawk','Sun Hawk',['fire','wind'],'#e8a040'],['v_dunegolem','slaggolem','Dune Golem',['earth','wind'],'#d8b070'],
 ['v_lakeray','cloudray','Lake Ray',['water'],'#4a90c0'],['v_ironling','stormling','Ironling',['lightning','earth'],'#8a8a9a'],
 ['v_reedcrawler','crawler','Reed Crawler',['earth','water'],'#7a8a4a'],['v_moorgull','gull','Moor Gull',['wind','shadow'],'#6a6a7a'],
 ['v_orchardimp','gustimp','Orchard Sprite',['earth','light'],'#c0d060'],['v_quarryknight','iceknight','Quarry Knight',['earth'],'#8a7a6a'],
 // Calamity realm natives
 ['v_ashspawn','voidspawn','Ash Spawn',['fire','shadow'],'#8a4a3a'],['v_drownwatch','huskguard','Drowned Watcher',['water','shadow'],'#3a6a7a'],
 ['v_starwraith','eclipsewraith','Starless Wraith',['shadow'],'#2a2a5a'],['v_skyshard','gargoyle','Sky Shard',['light','lightning'],'#d8e0ff'],
 ['v_tidecrown','shellguard','Crownshell',['water','light'],'#5ab0c0'],['v_cindereater','stareater','Cinder Eater',['fire'],'#c0602a'],
 ['v_galeghost','cloudray','Shatterwind Ray',['wind','light'],'#e0e0ff'],['v_ashhusk','huskguard','Ashen Husk',['fire','shadow'],'#6a4a40']
];
function recol(hex,to,k){if(!/^#[0-9a-f]{6}$/i.test(String(hex)))return hex;return lerpHex(hex,to,k);}
function makeMonVariant(id,base,name,els,col,extra){const m=MON[base];if(!m||MON[id])return;
  const map={};m.el.forEach((e,i)=>{map[e]=els[Math.min(i,els.length-1)];});
  MON[id]=Object.assign({},m,{n:name,art:id,el:els.slice(),base,variant:1},extra||{},{sk:(m.sk||[]).map(s=>{const c=s.slice();if(map[c[1]])c[1]=map[c[1]];return c;})});
  if(typeof MON_DROPS!=='undefined')MON_DROPS[id]=(MON_DROPS[base]||[]).slice();
  if(typeof MON_TY!=='undefined'&&MON_TY[base])MON_TY[id]=MON_TY[base].slice();
  if(typeof FAM_OF!=='undefined'&&FAM_OF[base])FAM_OF[id]=FAM_OF[base];
  MART[id]=g=>{const o=MART[m.art](g);const pal={};Object.keys(o.pal).forEach(q=>{pal[q]='KEW'.includes(q)?o.pal[q]:recol(o.pal[q],col,.5);});return Object.assign({},o,{pal});};
  if(MEXTRA[m.art])MEXTRA[id]=(g,p)=>{MEXTRA[m.art](g,p);Object.keys(p).forEach(q=>{if(!'KEW'.includes(q))p[q]=recol(p[q],col,.5);});};}
MONV.forEach(([id,b,n,e,c])=>makeMonVariant(id,b,n,e,c));

Object.keys(BOV).forEach(k=>{const [id,b,n,e,c]=BOV[k].mon;makeMonVariant(id,b,n,e,c,{ov:k});});
// ---------- helpers ----------
const isRv2=()=>!!(G&&G.run&&G.run.rv===2&&!G.daily);
function realmAt(s){const Z=ZS(s);return Z&&Z.idx>=REALM_BASE?Z:null;}
function bovAt(s){if(!isRv2()||G.cleared[s])return null;const k=bossAtStage(s);return BOV[k]?Object.assign({key:k},BOV[k]):null;}
function calFxAt(s){if(!isRv2()||s!==4||G.cleared[4])return null;const k=bossAtStage(4);return CAL_FX[k]?Object.assign({key:k},CAL_FX[k]):null;}
// pools are plain arrays (other code swaps them for night battles), so they are re-synced whenever the journey or a boss changes
function syncPools(){if(!G||!G.run)return;REALMS.forEach(R=>{let p=R.pool0.slice();const s=G.run.order?G.run.order.indexOf(R.idx):-1;
  if(isRv2()&&s>=0){const o=bovAt(s);if(o)p[p.length-1]=o.mon[0];}R.pool=p;});}

// ---------- new journeys draw the realms (seeded) ----------
// v0.11.1: a journey started from now on lays its fields out by thirds (lay3On); older journeys keep their maps
function lay3On(){try{return !!(G&&G.run&&G.run.lay3);}catch(e){return false;}}
{const nr0=newRun;newRun=function(cycle){const r=nr0.apply(this,arguments);try{const R=seeded((r.seed^0x5eed)>>>0);
  // v0.11.9: the realms rise in fantasy: realm 1 from the grounded tier, realm 2 from tiers 1-2, realm 3 from tiers 2-3, realm 4 from the wildest tier
  const TIER={thistle:1,orchard:1,strand:1,lakes:1,mire:2,grotto:2,tundra:2,peaks:2,deeps:3,mines:3,glacier:3,mesa:3},want=[[1],[1,2],[2,3],[3]],std=[],used=new Set();
  want.forEach(ts=>{let pool=REALM_STD.filter(i=>!used.has(i)&&ts.includes(TIER[REALMS[i-REALM_BASE].key]||2));if(!pool.length)pool=REALM_STD.filter(i=>!used.has(i));const pick=pool[Math.floor(R()*pool.length)];used.add(pick);std.push(pick);});
  const cal=REALM_CAL[Math.floor(R()*REALM_CAL.length)];r.order=std.concat([cal]);r.rv=2;r.lay3=1;/* v0.11.1: sites by thirds of the route (worldgen.js, sites.js) */}catch(e){}return r;};}

// ---------- look: realm palette under the boss overlay; the overlay lifts when the boss falls ----------
function realmVariant(theme,R){const id=theme+'@'+R.key;if(THEME[id])return id;const B=R.lean,T=THEME[theme],D=DTHEME[theme];
  const V=Object.assign({},T);['g','tg','p','cb','cl'].forEach(k=>{if(T[k])V[k]=lerpArr(T[k],B.mix,B.k*(k==='cb'?.5:k==='cl'?.6:1));});
  V.w=T.w.slice();V.w[0]=lerpHex(T.w[0],B.mix,B.k*.5);V.w[3]=lerpHex(T.w[3],B.mix,B.k*.5);V.roof=B.roof.slice();V.dec=B.dec.slice();V.lip=lerpHex(T.lip,B.mix,B.k*.7);THEME[id]=V;
  const DV=Object.assign({},D);DV.f=lerpArr(D.f,B.mix,B.k*.55);DV.w=lerpArr(D.w,B.mix,B.k*.5);DV.top=lerpHex(D.top,B.mix,B.k*.35);DTHEME[id]=DV;return id;}
{const ab0=applyBossTheme;applyBossTheme=function(m){
  try{if(m&&m.kind==='town'){(m.npcs||[]).forEach(n=>{if(n.line0==null)n.line0=n.line;});if(!m.signs0&&m.signs)m.signs0=Object.assign({},m.signs);}}catch(e){}
  const cleared=!!(G&&G.cleared&&typeof m.s==='number'&&G.cleared[m.s]&&!m.archive);
  if(!cleared)ab0.apply(this,arguments);else{m.thv=m.theme;m.motif=null;m.amb=null;m.btint=null;m.bkey=null;
    (m.npcs||[]).forEach(n=>{if(n.line0!=null){n.line=n.line0;n.themed=0;}});if(m.signs0)m.signs=Object.assign({},m.signs0);}
  try{const R=typeof m.s==='number'&&!m.archive&&G&&G.run?realmAt(m.s):null;if(R&&THEME[m.theme]&&DTHEME[m.theme]){const base=realmVariant(m.theme,R);
    m.thv=(!cleared&&m.bkey)?themeVariant(base,m.bkey):base;if(cleared||!m.bkey){m.motif=R.lean.motif;m.amb=R.lean.amb;m.btint=R.lean.tint;}}}catch(e){}};}
// boss down: the overlay lifts from every map of that realm, and the realm says so
function liftOverlay(s){try{Object.values(MAPS).forEach(m=>{if(m&&m.s===s&&!m.archive)applyBossTheme(m);});syncPools();}catch(e){}}
HOOK.wrap('finishBattle','realms','overlay lifts on a first clear',function(next,...a){const how=a[0];const sp=B&&B.spec,s=sp&&sp.stage,c0=B?B.clr0:true;const r=next(...a);
  try{if(G&&!G.daily&&c0===false&&typeof s==='number'&&G.cleared[s]){liftOverlay(s);const k=bossAtStage(s),d=guardianDef(k);
    toast(`${ZS(s).n} breathes easier. The pall over the realm lifts.${d?` ${d.n}'s Echo waits in the Echo Sanctum.`:''}`);}}catch(e){}return r;});

// ---------- weather: realm tables, overlay bias (clear always the largest single share) ----------
function realmWxList(s){const Z=ZS(s),R=realmAt(s);const L=wxList(R&&isRv2()?R.wxk:Z.theme,clockPhase()).map(x=>x.slice());const o=bovAt(s);
  if(o&&o.wx){const e=L.find(x=>x[0]===o.wx[0]);if(e)e[1]+=o.wx[1];else L.push([o.wx[0],o.wx[1]]);}
  const c=L.find(x=>x[0]==='clear');if(c){const mx=Math.max(...L.filter(x=>x[0]!=='clear').map(x=>x[1]),0);if(c[1]<=mx)c[1]=mx+1;}return L;}
{const rw0=rollWeather;rollWeather=function(s,avoid){if(!isRv2()||!realmAt(s))return rw0.apply(this,arguments);const L=realmWxList(s),tot=L.reduce((a,b)=>a+b[1],0);let w='clear';
  for(let k=0;k<4;k++){let r=Math.random()*tot;for(const [n,c] of L){if((r-=c)<0){w=n;break;}}if(w!==avoid||w==='clear')break;}
  G.weather[s]=w;G.wx=G.wx||{};G.wx[s]=WX_MIN+Math.floor(Math.random()*(WX_MAX-WX_MIN));return w;};}

// ---------- battles: synced pools, Calamity effects ----------
HOOK.wrap('startBattle','realms','sync pools, Calamity effects, stage cleared flag',function(next,...a){const spec=a[0];syncPools();const c0=!!(G&&G.cleared&&spec&&G.cleared[spec.stage]);const r=next(...a);try{if(r!==false&&B)B.clr0=c0;if(r!==false&&B&&spec&&!G.daily){const f=calFxAt(spec.stage);if(f&&spec.kind!=='arena'){B.calfx=f;
  if(f.spd)B.front.concat(B.back,B.en).forEach(u=>{if(u&&u.S)u.S.spd=Math.round(u.S.spd*f.spd);});log(`${f.n}: ${f.d.split('.')[0]}.`);}}}catch(e){}return r;});
HOOK.after('calcDamage','realms','Calamity element multipliers and burn',function(r,a,sk,t){try{const f=B&&B.calfx;if(f&&r&&r.dmg&&sk){const els=skEls(sk);let m=1;els.forEach(e=>{if(f.el[e])m=Math.max(m===1?0:m,f.el[e]);});if(els.length&&m&&m!==1)r.dmg=Math.max(1,Math.round(r.dmg*m));
  if(f.burn&&a&&a.side==='e'&&t&&t.side==='p'&&els.includes('fire')&&t.hp>0&&!(t.st&&t.st.burn)&&RNG()<f.burn&&!(t.S&&t.S.immune))try{addSt(t,'burn',a);}catch(_){}}}catch(e){}});
HOOK.wrap('genQuests','realms','realm quests (pools, rival)',function(next,...a){let s=a[0];syncPools();const had=G.quests.some(q=>q.stage===s);next(...a);if(had)return;try{const R=realmAt(s);if(!R||!isRv2())return;
  const add=(q,i)=>{if(q.type==='gather')G.quests.push({id:'rq'+s+i,stage:s,type:'gather',mat:q.mat,n:q.n,state:'open',title:q.t,desc:q.d,reward:{gold:200+s*180,item:'ether'}});
    else if(MON[q.mon])G.quests.push({id:'rq'+s+i,stage:s,type:'hunt',mon:q.mon,n:4+s,have:0,state:'open',title:q.t,desc:q.d,reward:{gold:160+s*170,item:'hipotion'}});};
  (R.quests||[R.quest]).filter(Boolean).forEach(add);
  const o=bovAt(s);if(o&&MON[o.mon[0]])G.quests.push({id:'oq'+s,stage:s,type:'hunt',mon:o.mon[0],n:3+s,have:0,state:'open',title:`Strange ${MON[o.mon[0]].n}s`,desc:`${ZS(s).town} has seen ${MON[o.mon[0]].n}s on the roads since the trouble began. Thin them out.`,reward:{gold:220+s*200,item:'remedy'}});}catch(e){}});
{const gb0=genBounties;genBounties=function(s){syncPools();return gb0.apply(this,arguments);};}

// ---------- realm weighting (4.3): chance meetings and taverns lean toward the realm's and the overlay's elements ----------
function realmEls(s){const R=realmAt(s),o=bovAt(s);const a=R&&isRv2()?R.els.concat(R.favor||[]):(CE_THEME_EL[ZS(s).theme]||[]);return {base:a,ov:o?o.el:[]};}
function cePick(m){const P=cePool();if(!P.length)return null;const ce=ceInit(),E=realmEls(m.s);
  const w=P.map(id=>{const t=TPL[id];let x=1;if((t.el||[]).some(e=>E.base.includes(e)))x*=2.5;if((t.el||[]).some(e=>E.ov.includes(e)))x*=1.5;x/=1+(ce.met[id]||0);return x;});
  const tot=w.reduce((a,b)=>a+b,0);let r=Math.random()*tot,k=0;for(;k<P.length-1;k++){if((r-=w[k])<0)break;}return P[k];}
if(typeof recruitFit==='function'){const rf0=recruitFit;recruitFit=function(id,N){const o=rf0.apply(this,arguments);try{if(o&&isRv2()&&WS.m&&typeof WS.m.s==='number'){const E=realmEls(WS.m.s),t=TPL[id];
  if((t.el||[]).some(e=>E.base.includes(e)))o.w*=1.4;if((t.el||[]).some(e=>E.ov.includes(e)))o.w*=1.25;}}catch(e){}return o;};}

// ---------- music: the realm shifts the key; the boss part goes when the boss falls ----------
{const mo0=bossMusicOff;bossMusicOff=function(){let v=0;try{const s=WS.m&&typeof WS.m.s==='number'?WS.m.s:B&&B.stage;const R=typeof s==='number'?realmAt(s):null;
  v=(G&&G.cleared&&G.cleared[s])?0:mo0();if(R&&isRv2())v+=R.mus||0;}catch(e){}return v;};}

// ---------- Guides, NPC talk and the Bestiary ----------
function overlayGuide(){if(!G||!G.run||G.daily)return '';const s=WS.m&&typeof WS.m.s==='number'?WS.m.s:G.stage;if(typeof s!=='number')return '';
  const R=realmAt(s),o=bovAt(s),f=calFxAt(s);if(!R&&!o)return '';
  return `<h4>${esc(ZS(s).n)}</h4>${R&&isRv2()?`<p class="note">${esc(R.intro.split('. ')[0])}.</p>`:''}${o?`<p class="note"><b>The realm is uneasy.</b> ${esc(o.guide)} It lifts when the realm's master falls.</p>`:G.cleared[s]?'<p class="note">The realm is at peace. Its master has fallen.</p>':''}${f?`<p class="note"><b>${esc(f.n)}.</b> ${esc(f.d)}</p>`:''}`;}
{const nl0=npcLore;npcLore=function(m){const L=nl0.apply(this,arguments);try{const o=bovAt(m.s|0);if(!o)return G&&G.cleared&&G.cleared[m.s|0]?[]:L;return L.concat([o.say]);}catch(e){return L;}};}
{const ba0=bestAll;bestAll=function(){const out=ba0();try{const have=new Set(out.map(o=>o.k));Object.keys(BOV).forEach(k=>{const id=BOV[k].mon[0];if(MON[id]&&!have.has(id))out.push({k:id,d:MON[id],odd:1});});}catch(e){}return out;};}
// keep pools right after a load or a new journey
HOOK.before('getMap','realms','sync pools before a new map',function(id){if(!MAPS[id])syncPools();});
// the opening story frames whichever realm the journey starts in
const REALM_OPENING='The Meridian Light that keeps the sky of Aurelis bright has begun to gutter. One by one the beacons are going dark, and a Scourge sits at the end of every road. You and your companions set out to light them again.';
{const bg0=ACT.begin;ACT.begin=function(){const r=bg0.apply(this,arguments);try{if(V.modal&&V.modal.type==='story'&&isRv2()&&V.modal.text===ZS(0).intro)V.modal.text=REALM_OPENING+' '+ZS(0).intro;}catch(e){}return r;};}
