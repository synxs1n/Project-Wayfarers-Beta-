// ===== endgame10.js (v0.14.1): the Meridian Breach, the endgame hunting ground =====
// After the Calamity falls (G.won) the Waystone offers The Meridian Breach: a field where every realm bleeds through. Its foes are drawn
// from the pools of every realm you visited, at your strongest hero's level plus two (to the cap of 50), with more HP and power; one
// fight in five has a Breach elite. Every win pays extra gold, and sometimes an Epic or Heroic charm or top-tier materials. Auto battle
// works there as on any field. The map is the Calamity realm's field laid out again from another seed (map id 'x0'); its gates all lead
// back to the last town. Save fields: none new (G.pos may hold 'x0', rebuilt from the journey seed on load).
const BREACH={id:'x0',n:'The Meridian Breach',lvUp:2,hpM:1.3,powM:1.15,eliteCh:.2,goldM:.6,charmCh:.08,matCh:.5};
function breachOpen(){return !!(G&&!G.daily&&G.won);}
function breachPool(){try{const s=new Set();(G.visited||[]).forEach(st=>{const Z=ZS(st);if(Z&&Z.pool)Z.pool.forEach(k=>{if(MON[k])s.add(k);});});if(!s.size)(ZS(4).pool||[]).forEach(k=>s.add(k));return [...s];}catch(e){return ZS(4).pool.slice();}}
HOOK.wrap('getMap','endgame10','the Meridian Breach map',function(next,...a){const id=a[0];if(id!=='x0')return next(...a);if(MAPS.x0)return MAPS.x0;
  const keep=MAPS.f4,seed=G.run.seed;let m;try{delete MAPS.f4;G.run.seed=(seed+424242)>>>0;m=next('f4');}finally{delete MAPS.f4;G.run.seed=seed;if(keep)MAPS.f4=keep;}
  m.id='x0';m.breach=1;m.name=BREACH.n;m.theme='void';const to={m:'t'+Math.max(0,Math.min(4,G.lastTown|0)),g:'next'};
  (m.exits||[]).forEach(e=>{if(e.to)e.to=to;});Object.values(m.gates||{}).forEach(g=>{if(g&&g.to)g.to=to;});
  (m.caves||[]).forEach(c=>{for(let j=-1;j<=0;j++)for(let i=-1;i<=1;i++){const y=c.y+j,x=c.x+i;if(m.t[y]&&'UE'.includes(m.t[y][x]))m.t[y][x]=',';}});m.caves=[];m.fortAt=null;
  MAPS.x0=m;return m;});
{const ln0=locName;locName=function(m){if(m&&m.breach)return BREACH.n;return ln0.apply(this,arguments);};}
HOOK.xform('vModal','endgame10','Breach row on the Waystone',function(h,m){try{if(m&&m.type==='travel'&&breachOpen()){const here=WS.m&&WS.m.id==='x0';
  const row=`<div class="row archrow breachrow"><div><b>✶ ${BREACH.n}</b><small>Where every realm bleeds through. Foes from all the lands you crossed, at your own strength (to level 50), richer purses and rare drops.</small></div><button class="btn sm gold" data-act="toBreach" ${here?'disabled':''}>Go</button></div>`;
  h=h.replace('<div class="rows">','<div class="rows">'+row);}}catch(e){}return h;});
ACT.toBreach=function(){if(!breachOpen())return;V.modal=null;fadeTo(()=>{const m=getMap('x0');const g=m.gates&&m.gates.start&&m.gates.start.arrive,x=g?g[0]:2,y=g?g[1]:(m.sy||2),f=g&&g[2]||'r';placeAt('x0',x,y,f);showLocation();saveGame();});render();};
HOOK.before('encounterFoes','endgame10','Breach fights',function(spec){try{const m=WS.m;if(!spec||!m||!m.breach||spec.kind!=='field'||spec.roam)return;spec.breach=1;
  const pool=breachPool(),hi=Math.min(LV_CAP,partyHi()+BREACH.lvUp),lo=Math.max(1,hi-3),n=RNG()<.5?3:4,out=[];
  for(let i=0;i<n;i++){const k=pick(pool),mo=MON[k],lv=ri(lo,hi);if(i===0&&RNG()<BREACH.eliteCh)out.push(makeEnemy(mo,lv,{elite:true,name:'Breach '+mo.n,mod:pick(ELITE_MODS).k,hpM:3.2,powM:1.35}));else out.push(makeEnemy(mo,lv,{hpM:BREACH.hpM,powM:BREACH.powM}));}
  const cnt={};out.forEach(e=>{cnt[e.name]=(cnt[e.name]||0)+1;});const seen={};out.forEach(e=>{if(cnt[e.name]>1){seen[e.name]=(seen[e.name]||0)+1;e.name+=' '+String.fromCharCode(64+seen[e.name]);}});
  return HOOK.stop(out);}catch(e){}});
// roamers in the Breach come from every realm too, at the party's level
{const rs0=roamSpawn;roamSpawn=function(m){const out=rs0.apply(this,arguments);try{if(m&&m.breach&&out&&!m._bro){m._bro=1;const pool=breachPool();out.forEach((r,i)=>{const k=pool[(hashS('br'+i+m.id)+((G.run&&G.run.seed)||0))%pool.length];r.mon=k;r.name=r.elite?`${MON[k].n} ${r.name.split(' ').slice(-1)[0]}`:MON[k].n;});}}catch(e){}return out;};}
HOOK.wrap('encounterFoes','endgame10','Breach roamer level',function(next,...a){const spec=a[0];const out=next(...a);try{const m=WS.m;if(spec&&spec.roam&&m&&m.breach){const hi=Math.min(LV_CAP,partyHi()+BREACH.lvUp);out.forEach(e=>{const lv=Math.max(1,hi-(e.elite?0:2));if(e.lv<lv){const k=lv/e.lv;e.lv=lv;e.S.mhp=Math.round(e.S.mhp*k*BREACH.hpM);e.hp=e.S.mhp;e.S.atk*=k*BREACH.powM;e.S.mag*=k*BREACH.powM;e.S.def*=k;e.S.res*=k;}});spec.breach=1;}}catch(e){}return out;});
HOOK.after('win','endgame10','Breach purse',function(){try{const sp=B&&B.spec;if(!sp||!sp.breach||!G||G.daily)return;const info=(B&&B.result)||(V.modal&&V.modal.info)||{};info.notes=info.notes||[];const got=[];
  const g=Math.round((info.gold||0)*BREACH.goldM)+Math.round(20+partyHi()*3);G.gold+=g;info.gold=(info.gold||0)+g;got.push(`${fmt(g)} gold more`);
  if(Math.random()<BREACH.matCh){const mt=pick(['mythril','elder','starbloom','core','grit','ichor']);G.mats[mt]=(G.mats[mt]||0)+1;got.push(`1 ${MATS[mt]}`);}
  if(Math.random()<BREACH.charmCh&&typeof CH9_EPIC!=='undefined'){const id=pick(Math.random()<.35?CH9_HEROIC:CH9_EPIC);G.gear.push(id);got.push(gearOf(id).n);}
  info.notes.push(`The Breach gives up its hoard: ${got.join(', ')}.`);}catch(e){}});
// the first time the Calamity falls, the Waystone's new door is announced
HOOK.after('win','endgame10','Breach opens',function(){try{if(G&&G.won&&!G.breachSeen){const info=(B&&B.result)||(V.modal&&V.modal.info);if(info&&B.spec&&B.spec.kind==='boss'){G.breachSeen=1;info.notes=info.notes||[];info.notes.push(`${BREACH.n} has opened: every Waystone can take you there, where the foes of every realm you crossed wait at your own strength.`);}}}catch(e){}});
