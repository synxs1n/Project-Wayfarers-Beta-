// ===== world3.js (v0.3.1): day and night, the weather tables and rolls =====
// New save fields (defaulted on read): G.clock (0..CLK_LEN), G.wx {realm: steps left}, G.wxSave {realm: weather to restore}.
// The clock moves with steps (+1) and battles (+6), never with real time. Dungeons and the Archive ignore it.
const PH_LOOK={day:{i:'☀',n:'Day'},dusk:{i:'◐',n:'Dusk'},night:{i:'☾',n:'Night'},dawn:{i:'◑',n:'Dawn'}};
function clockPhase(t){t=((t==null?(G&&G.clock)||0:t)%CLK_LEN+CLK_LEN)%CLK_LEN;return (CLK_PH.find(p=>t>=p[1]&&t<p[2])||CLK_PH[0])[0];}
function isNight(){return !!G&&clockPhase()==='night';}
function tickClock(n){if(!G||G.daily)return;const was=clockPhase();G.clock=(((G.clock||0)+n)%CLK_LEN+CLK_LEN)%CLK_LEN;const now=clockPhase();
  if(was!==now&&V.screen==='world'&&WS.m&&WS.m.kind!=='dungeon'){toast(now==='night'?'Night falls. Stranger things prowl the fields.':now==='dawn'?'Dawn breaks.':now==='dusk'?'The sun sets.':'Morning.');}
  if(typeof wkwUpdate==='function')wkwUpdate();}
function setMorning(){if(G){G.clock=0;if(typeof wkwUpdate==='function')wkwUpdate();}}
// ----- night monsters: two of each field's four foes become night variants; every field foe is 10% stronger at night -----
const NIGHT={meadow:[['gustimp','Duskwing Imp'],['cinderpup','Gloam Hound']],coast:[['gull','Moonglass Gull'],['tidewisp','Nightwisp']],cave:[['cavebat','Gloombat'],['ashwraith','Cinder Shade']],
  snow:[['snowharpy','Nightfrost Harpy'],['frostwolf','Moonfang Wolf']],heights:[['thunderhawk','Nightstorm Hawk'],['stormling','Witchlight']],void:[['voidspawn','Abyss Spawn'],['stareater','Blackstar Eater']]};
(function(){Object.keys(NIGHT).forEach(th=>NIGHT[th].forEach(([b,name])=>{const m=MON[b];if(!m)return;const k='n_'+b,el=m.el.length===1&&m.el[0]!=='shadow'?[m.el[0],'shadow']:m.el.slice();
  MON[k]=Object.assign({},m,{n:name,art:k,el,night:1,base:b,hp:+(m.hp*1.05).toFixed(2),spd:+(m.spd*1.05).toFixed(2)});
  MON_DROPS[k]=(MON_DROPS[b]||[]).concat(['dust']);
  // art: the day sprite repainted in moonlit blues with glowing eyes
  MART[k]=g=>{const o=MART[b](g);const pal={};Object.keys(o.pal).forEach(q=>{pal[q]=nightTint(o.pal[q]);});['K','W'].forEach(q=>{if(o.pal[q])pal[q]=o.pal[q];});if(pal.W)pal.W='#d8f0ff';return Object.assign({},o,{pal,glow:(o.glow||'')});};
  if(MEXTRA[b])MEXTRA[k]=(g,p)=>{MEXTRA[b](g,p);Object.keys(p).forEach(q=>{if(!'KW'.includes(q))p[q]=nightTint(p[q]);});};}));})();
function nightTint(hex){const h=String(hex).replace('#','');if(h.length<6)return hex;const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  const R=Math.round(r*.55+20),G2=Math.round(g*.6+25),B2=Math.min(255,Math.round(b*.75+70));return '#'+[R,G2,B2].map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('');}
function nightPool(s){const Z=ZS(s),L=NIGHT[Z.theme]||[];const swap={};L.forEach(([b])=>{swap[b]='n_'+b;});return Z.pool.map(k=>swap[k]||k);}
{const ef0=encounterFoes;encounterFoes=function(spec){
  if(spec&&spec.kind==='field'&&!spec.mimic&&isNight()&&!G.daily){const Z=ZS(spec.stage),save=Z.pool;Z.pool=nightPool(spec.stage);let out;try{out=ef0.apply(this,arguments);}finally{Z.pool=save;}
    out.forEach(e=>{['atk','mag','def','res'].forEach(k=>{e.S[k]*=NIGHT_POW;});e.S.mhp=Math.round(e.S.mhp*NIGHT_POW);e.hp=e.S.mhp;e.night=1;});return out;}
  return ef0.apply(this,arguments);};}
// the Bestiary lists night variants under their realm
{const ba0=bestAll;bestAll=function(){const out=ba0();const extra=[];ZONES.forEach((Z,zi)=>(NIGHT[Z.theme]||[]).forEach(([b])=>{const k='n_'+b;if(MON[k])extra.push({k,d:MON[k],zone:zi,night:1});}));
  const res=[];out.forEach(o=>{res.push(o);if(!o.g)return;});// keep guardians last
  const fieldOnly=out.filter(o=>!o.g),bosses=out.filter(o=>o.g);return fieldOnly.concat(extra,bosses);};}
// ----- clock ticks -----
{const ar0=arrive;arrive=function(){if(G&&WS.m&&WS.m.kind!=='dungeon')tickClock(1);wxStep();return ar0.apply(this,arguments);};}
{const fb0=finishBattle;finishBattle=function(how){try{if(G&&!G.daily)tickClock(6);}catch(e){}return fb0.apply(this,arguments);};}
{const ra0=restAll;restAll=function(){const r=ra0.apply(this,arguments);if(r)setMorning();return r;};}
{const ct0=campRest;campRest=function(){const r=ct0.apply(this,arguments);tickClock(60);return r;};}
// ----- weather: lasts WX_MIN..WX_MAX steps per realm, follows you between that realm's town and field, mostly clear -----
// shares (out of 100); clear skies 65-75%, the realm's signature weather next, harsh types rare
// ----- v0.4.0 7.2: rare skies. Shares are out of 100 and come out of the clear share; "when" limits a sky to day or night rolls -----
const SUPER_OPP={fire:'water',water:'fire',ice:'fire',wind:'earth',earth:'wind',shadow:'light'};
const SURGE_NAME={earth:['Verdant Surge','Green light floods the roots and the soil hums.'],water:['Tidal Surge','The sea swells and every drop answers.'],fire:['Ember Surge','The ground glows and the air shimmers.'],ice:['Frost Surge','Crystal light chills the world to its bones.'],wind:['Gust Surge','Wild currents sing between the peaks.'],shadow:['Void Surge','The dark leans in and hums.']};
Object.assign(WEATHER,{
 bloodmoon:{n:'Blood Moon',i:'☾',sup:1,when:'night',el:{shadow:1.25,fire:1.1,light:.85},enc:1.1,gold:1.25,xp:1.1,d:'Shadow +25%, Fire +10%, Light -15%. Foes come a little more often, but pay 25% more gold and 10% more XP. Night only.'},
 eclipse:{n:'Solar Eclipse',i:'◐',sup:1,when:'day',el:{light:1.2,shadow:1.2},crit:.04,enc:.85,d:'Light and Shadow +20%. Critical chance +4% for everyone. Fewer encounters. Daytime only.'},
 meteor:{n:'Meteor Shower',i:'☄',sup:1,when:'night',el:{fire:1.15,earth:1.1},mat:.3,core:.06,d:'Fire +15%, Earth +10%. Each foe you beat has a 30% chance to drop an extra realm material and a 6% chance to drop a Dread Core. Night only.'}});
Object.keys(SURGE_NAME).forEach(e=>{const o=SUPER_OPP[e];WEATHER['surge_'+e]={n:SURGE_NAME[e][0],i:'❂',sup:1,surge:e,el:{[e]:1.3,[o]:.9},xp:1.05,d:SURGE_NAME[e][1]+` ${EL[e]} +30%, ${EL[o]} -10%. A little extra XP (+5%).`};});
function superOk(k,ph){const W=WEATHER[k];return !!W&&(!W.when||W.when===ph);}
// the weather table for a realm at a given phase: base shares with the rare skies taken out of the clear share
function wxList(theme,ph){const base=(WX_TABLE[theme]||[['clear',1]]).map(x=>x.slice()),sup=(SUPER_TABLE[theme]||[]).filter(x=>superOk(x[0],ph)),cut=sup.reduce((a,b)=>a+b[1],0);
  const c=base.find(x=>x[0]==='clear');if(c)c[1]-=cut;return base.concat(sup.map(x=>x.slice()));}
function rollWeather(s,avoid){const L=wxList(ZS(s).theme,clockPhase());const tot=L.reduce((a,b)=>a+b[1],0);let w='clear';
  for(let k=0;k<4;k++){let r=Math.random()*tot;for(const [n,c] of L){if((r-=c)<0){w=n;break;}}if(w!==avoid||w==='clear')break;}
  G.weather[s]=w;G.wx=G.wx||{};G.wx[s]=WX_MIN+Math.floor(Math.random()*(WX_MAX-WX_MIN));return w;}
function superGuide(){const ph=k=>WEATHER[k].when?` <i>(${WEATHER[k].when} only)</i>`:'';
  const rows=Object.keys(WEATHER).filter(k=>WEATHER[k].sup&&!WEATHER[k].surge).concat(['surge_fire']).map(k=>{const W=WEATHER[k];return `<div class="row"><div><b>${W.i} ${k==='surge_fire'?'Elemental Surge (one per realm)':W.n}</b>${k==='surge_fire'?'':ph(k)}<small>${k==='surge_fire'?'Each realm has its own: Verdant (Meadow, Earth), Tidal (Coast, Water), Ember (Caves, Fire), Frost (Frostmere, Ice), Gust (Heights, Wind), Void (Void, Shadow). That element +30%, its opposite -10%, +5% XP.':W.d}</small></div></div>`;}).join('');
  return `<h4>Rare skies</h4><p class="note">A few percent of weather rolls turn into one of these (clear skies stay the majority). They last as long as any weather, bring a strong visual, and every effect cuts both ways, so foes feel them too. Some only come at night or by day, and they end when that part of the day does. The Daily Trial never uses them.</p><div class="rows compact">${rows}</div>`;}
function wxStep(){if(!G||G.daily||!WS.m||WS.m.archive)return;const s=WS.m.s;G.wx=G.wx||{};if(G.weather[s]==null){rollWeather(s);return;}
  if(G.wx[s]==null)G.wx[s]=WX_MIN;if((G.wxSave||{})[s]!=null)return;// forced weather holds still
  if(WEATHER[G.weather[s]]&&WEATHER[G.weather[s]].when&&!superOk(G.weather[s],clockPhase()))G.wx[s]=0;else G.wx[s]--;if(G.wx[s]<=0){const old=G.weather[s],w=rollWeather(s,old);if(w!==old&&WS.m.kind==='field'){toast(WEATHER[w].sup?`A rare sky: ${WEATHER[w].n}!`:`The weather turns: ${WEATHER[w].n}.`);if(typeof showLocation==='function')showLocation();}}}
// entering a map no longer rerolls (worldrt.js only rolls when a realm has no weather yet)
// forced weather holds still
{const pa0=placeAt;placeAt=function(mid,x,y,f){const m0=G&&G.weather?Object.assign({},G.weather):null;const r=pa0.apply(this,arguments);
  try{const m=WS.m;if(!m||!G)return r;const s=m.s;G.wxSave=G.wxSave||{};const forced=m.kind==='field'&&typeof legendQ==='function'&&legendQ(m).some(q=>q.hero==='jaeson');
    if(forced&&G.wxSave[s]==null){G.wxSave[s]=m0&&m0[s]!=null&&m0[s]!=='storm'?m0[s]:(m0&&m0[s])||'clear';G.weather[s]='storm';}
    else if(!forced&&G.wxSave[s]!=null&&m.kind==='field'){G.weather[s]=G.wxSave[s];delete G.wxSave[s];}}catch(e){}return r;};}
// ----- HUD chip and the tint -----
{const wu0=wkwUpdate;wkwUpdate=function(){wu0();const wk=$('wkw');if(!wk||!G||!WS.m||WS.m.kind==='dungeon')return;const P=PH_LOOK[clockPhase()];
  const html=`<button class="wchip ph ${clockPhase()}" data-act="wxInfo" data-arg="time" title="Time of day (moves as you walk and fight)">${P.i} ${P.n}</button>`;if(!wk.innerHTML.includes('wchip ph '+clockPhase()))wk.insertAdjacentHTML('afterbegin',html);};}
function tintFor(t){// smooth colour by clock position
  const k=(a,b,p)=>a+(b-a)*p,ph=clockPhase(t);t=((t%CLK_LEN)+CLK_LEN)%CLK_LEN;
  if(ph==='day')return null;
  const PH=p=>CLK_PH.find(x=>x[0]===p);
  if(ph==='dusk')return null;// v0.4.1 4.5: dusk and dawn are graded in daylight.js, not washed
  if(ph==='night')return [20,26,72,.46];
  return null;}
{const wd0=worldDraw;worldDraw=function(now){wd0(now);try{const m=WS.m;if(!m||m.kind==='dungeon'||m.archive||!G)return;const T=tintFor(G.clock||0);if(!T)return;const ctx=WS.ctx,cx=Math.round(WS.cam.x),cy=Math.round(WS.cam.y);
  ctx.fillStyle=`rgba(${T[0]|0},${T[1]|0},${T[2]|0},${T[3].toFixed(3)})`;ctx.fillRect(0,0,WS.vw,WS.vh);
  if(T[3]>.2){ctx.save();ctx.globalCompositeOperation='lighter';(m.lights||[]).forEach(L=>{const x=L[0]-cx,y=L[1]-cy,r=(L[2]||18)*1.6;if(x<-r||y<-r||x>WS.vw+r||y>WS.vh+r)return;const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(255,200,120,${.35*T[3]/.46})`);g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);});ctx.restore();}}catch(e){}};}

// ----- rare sky visuals -----
{const wf0=weatherFX;weatherFX=function(ctx,w,W,H,now,battle){const Wx=WEATHER[w];if(!Wx||!Wx.sup)return wf0.apply(this,arguments);const t=now/1000;
  if(w==='bloodmoon'){ctx.fillStyle='rgba(130,10,24,.28)';ctx.fillRect(0,0,W,H);const mx=Math.floor(W*.78),my=Math.floor(H*.16);const g=ctx.createRadialGradient(mx,my,2,mx,my,30);g.addColorStop(0,'rgba(255,90,70,.55)');g.addColorStop(1,'rgba(255,60,40,0)');ctx.fillStyle=g;ctx.fillRect(mx-30,my-30,60,60);ctx.fillStyle='#d8403a';ctx.fillRect(mx-5,my-5,10,10);ctx.fillStyle='#f06a58';ctx.fillRect(mx-3,my-4,4,3);
    ctx.fillStyle='rgba(255,120,110,.5)';for(let i=0;i<10;i++){const x=Math.floor((i*61+t*8)%W),y=Math.floor(H-((t*10+i*37)%H));ctx.fillRect(x,y,1,1);}}
  else if(w==='eclipse'){ctx.fillStyle='rgba(10,10,30,.28)';ctx.fillRect(0,0,W,H);const mx=Math.floor(W*.5),my=Math.floor(H*.16);const g=ctx.createRadialGradient(mx,my,5,mx,my,34+Math.sin(t*2)*3);g.addColorStop(0,'rgba(255,240,200,.0)');g.addColorStop(.45,'rgba(255,230,160,.65)');g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.fillRect(mx-40,my-40,80,80);ctx.fillStyle='#0a0a14';ctx.beginPath();ctx.arc(mx,my,8,0,7);ctx.fill();}
  else if(w==='meteor'){ctx.fillStyle='rgba(10,10,40,.12)';ctx.fillRect(0,0,W,H);for(let i=0;i<7;i++){const p=((t*.45+i*.17)%1),x=Math.floor(((i*89)%W)+p*70-30),y=Math.floor(p*H*.8-10);ctx.globalAlpha=Math.max(0,1-p*.9);ctx.fillStyle='#fff1b8';ctx.fillRect(x,y,2,2);ctx.fillStyle='#ff9a3a';for(let k=1;k<7;k++){ctx.fillRect(x-k*2,y-k*2+1,2,1);}ctx.globalAlpha=1;}}
  else if(Wx.surge){const C={earth:'90,220,90',water:'80,170,255',fire:'255,120,50',ice:'170,230,255',wind:'220,255,230',shadow:'170,90,255'}[Wx.surge];ctx.fillStyle=`rgba(${C},.07)`;ctx.fillRect(0,0,W,H);
    for(let i=0;i<30;i++){const p=((t*.18+i*.071)%1),x=Math.floor((i*47+Math.sin(t+i)*8)%W),y=Math.floor(H-p*H);ctx.globalAlpha=Math.sin(p*3.14);ctx.fillStyle=`rgb(${C})`;ctx.fillRect(x,y,i%4===0?2:1,i%4===0?2:1);}ctx.globalAlpha=1;
    const pulse=(Math.sin(t*1.6)+1)/2;ctx.strokeStyle=`rgba(${C},${(.12+pulse*.14).toFixed(2)})`;ctx.lineWidth=2;ctx.strokeRect(1,1,W-2,H-2);}
};}
