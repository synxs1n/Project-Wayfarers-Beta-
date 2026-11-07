// ===== echocore.js (v0.3.2): echo rules: echo forms, shards, essence, Echoforged weapons =====
// Pure rules shared by the game and the sims: echo forms of every Scourge and Calamity, story echo stats, the extra
// phase, Echo Shards and Echo Essence, and the six Echoforged weapons.
// Echo forms are their own Bestiary entries ("Echo <name>"): they never count toward the Archive or the Tamer's Stick.
const ECHO_STORY=(typeof process!=='undefined'&&process.env&&process.env.ECHOCFG)?JSON.parse(process.env.ECHOCFG):{lvAdd:1,hpM:1.3,powM:1.05,hpS:[.95,1.15,.8,1.1,.85]};// a story echo vs its base boss: tuned for ~70% at the base boss's level
function echoKeys(){return GPOOL.concat(FPOOL);}
function echoDef(k){const d=guardianDef(k);if(!d)return null;const dmg=d.sk.filter(s=>s[4]!=='buff'),s0=dmg[0]||d.sk[0];
  const nsk=[`Resounding ${s0[0]}`,s0[1],+(s0[2]*1.2).toFixed(2),'all',s0[4]==='buff'?'mag':s0[4],(s0[5]||[]).concat([['weaken',.35]])];
  return Object.assign({},d,{n:'Echo '+d.n,sk:d.sk.concat([nsk]),echoOf:k,
    phase2:{at:.25,say:`The Echo of ${d.n} fractures and surges!`,self:[['might',1],['haste',1]],heal:.06}});}
// the second phase: fires once below 25% HP, after the boss's own phase
{const cp0=checkPhase;checkPhase=function(e){cp0.apply(this,arguments);try{if(e&&e.phase2&&e.phaseDone&&!e.p2done&&e.hp>0&&e.hp<=e.S.mhp*e.phase2.at){e.p2done=1;const P1=e.phase;e.phase=e.phase2;e.phaseDone=false;cp0(e);e.phase=P1;e.phaseDone=true;}}catch(x){}};}
function makeEcho(k,lv,o){const def=echoDef(k),e=makeEnemy(def,lv,Object.assign({boss:true,key:k,noBuff:1},o));e.echo=1;if(typeof MART!=='undefined'&&MART['echo_'+e.art])e.art='echo_'+e.art;e.echoKey=k;e.phase2=def.phase2;return e;}
// story echo (in the boss's dungeon) and rift echo (post game, the strongest scaling from echoSpec). The Daily Trial's echo is untouched.
HOOK.before('encounterFoes','echocore','story Echo and Rift Echo fights',function(spec){
  if(spec&&spec.kind==='storyEcho'){const s=spec.stage,k=spec.key,final=s===4,lv=(spec.lv||storyEchoLv(s));
    const out=[makeEcho(k,lv,{final,stage:s,hpM:ECHO_STORY.hpM*((ECHO_STORY.hpS||[])[s]||1),powM:ECHO_STORY.powM})];
    if(s>=2&&!final){const Z=ZS(s);out.push(makeEnemy(MON[pick(Z.pool)],STAGE_LV[s][1]+ngLvOff()));}return HOOK.stop(out);}
  if(spec&&spec.kind==='echoBoss'&&spec.rift){return HOOK.stop([makeEcho(spec.key,spec.lv,{final:!!FINALS[spec.key],stage:3,hpM:spec.hpM||1.7,powM:spec.powM||1.15})]);}
  });
function riftSpec(k){return Object.assign(echoSpec(k),{rift:1});}
// ----- shards, essence -----
const ECHO_CAT={k:'echo',n:'Echo relics',c:'#b48aff',ids:[],d:'Left behind by Echoes. Shards are unique to each Echo; Essence comes from all of them. Used at the Smithy\'s Echoforge.'};
(function(){MATS.essence='Echo Essence';ECHO_CAT.ids.push('essence');echoKeys().forEach(k=>{const id='es_'+k;MATS[id]='Shard: '+guardianDef(k).n;ECHO_CAT.ids.push(id);});
  MATCAT.push(ECHO_CAT);ECHO_CAT.ids.forEach(id=>{MAT_OF[id]=ECHO_CAT;});})();
// ----- Echoforged weapons: tier 6 stats x1.18 plus a perk; temperable like any weapon -----
// EF_K: in config.js
const ECHOFORGE={
  blade:{n:'Ruinsong',perk:'+8% crit chance and +20% crit damage',crit:.08,critDmg:.2,sh:['cinderking','bonecolossus','hollowking']},
  dagger:{n:'Nightneedle',perk:'+6% evasion and +10% speed',eva:.06,spdP:.1,sh:['gloomcap','queenmantis','nidhra']},
  bow:{n:'Galestring',perk:'+10% speed and +5% crit chance',spdP:.1,crit:.05,sh:['hoarwyrm','ashwyvern','seraph']},
  crossbow:{n:'Stormlock',perk:'+15% damage to Scourges, Calamities and Echoes',bossDmg:.15,sh:['drake','ironsentinel','dimmer']},
  staff:{n:'Tidelight',perk:'+10% damage with every element',elAll:.1,sh:['siren','thornwarden','seraph']},
  tome:{n:'Starscript',perk:'+15% damage to Primed foes',primeDmg:.15,sh:['ysolde','frostlich','nidhra']}};
// EF_SHARDS, EF_ESS, EF_CORE, EF_GOLD: in config.js
(function(){Object.keys(ECHOFORGE).forEach(f=>{const b=GEAR['w_'+f+'_5'],E=ECHOFORGE[f],o={n:'Echoforged '+E.n,slot:'w',tier:5,price:Math.round(b.price*1.6),ef:f,fam:f,efPerk:E.perk};
  ST.forEach(s=>{if(b[s])o[s]=Math.round(b[s]*(s==='spd'?1:EF_K));});['mpEff','elDmg','tome'].forEach(q=>{if(b[q])o[q]=b[q];});addGear('w_'+f+'_ef',o);});})();
function efCost(f){const m={};ECHOFORGE[f].sh.forEach(k=>{m['es_'+k]=EF_SHARDS;});m.essence=EF_ESS;m.core=EF_CORE;return m;}
function efPerkOf(c){const g=c&&c.eq&&gearOf(c.eq.w);return g&&g.ef?ECHOFORGE[g.ef]:null;}
{const cs0=calcStats;calcStats=function(c){const S=cs0.apply(this,arguments);try{const P=c&&c.side==='p'&&efPerkOf(c);if(P){if(P.crit)S.crit=(S.crit||0)+P.crit;if(P.critDmg)S.critDmg=(S.critDmg||1.5)+P.critDmg;if(P.eva)S.eva=(S.eva||0)+P.eva;if(P.spdP)S.spd*=1+P.spdP;
  if(P.elAll)ELK.forEach(el=>{S.elBoost[el]=(S.elBoost[el]||0)+P.elAll;});if(P.bossDmg)S.bossDmg=P.bossDmg;if(P.primeDmg)S.primeDmg=P.primeDmg;S.efPerk=P.n;}}catch(e){}return S;};}
HOOK.after('calcDamage','echocore','Echoforged boss and primed damage',function(r,a,sk,t){try{if(a&&a.S&&r&&r.dmg>0){let m=1;if(a.S.bossDmg&&t&&t.boss)m*=1+a.S.bossDmg;if(a.S.primeDmg&&t&&t.primed)m*=1+a.S.primeDmg;if(m!==1)r.dmg=Math.round(r.dmg*m);}}catch(e){}});
