const fs=require('fs');
const DIR=__dirname+'/'+(process.env.V3DIR||'v3')+'/';
const src=['config.js','hooks.js','data.js','heroes.js','skills.js','items.js','foes.js','zones.js','art.js','engine.js','engine2.js','insight.js','monsters2.js','archetype.js','sigskills.js','economy.js','npc2.js','capes.js'].filter(f=>fs.existsSync(DIR+f)).map(f=>fs.readFileSync(DIR+f,'utf8')).join('\n')+(process.env.SIMEXTRA?'\n'+process.env.SIMEXTRA.split(',').map(f=>fs.readFileSync(f.startsWith('/')?f:__dirname+'/'+f,'utf8')).join('\n'):'');
let q=[];
global.setTimeout=(f)=>{q.push(f);return 1;};
global.localStorage={getItem:()=>null,setItem:()=>{}};
const A=(new Function('setTimeout',src+`
function render(){}
return {lastInfo:null,tyOf:typeof tyOf!=='undefined'?tyOf:null,ARCH:typeof ARCH!=='undefined'?ARCH:null,BOSS_TY:typeof BOSS_TY!=='undefined'?BOSS_TY:null,MON_TY:typeof MON_TY!=='undefined'?MON_TY:null,dlFor:typeof dlFor!=='undefined'?dlFor:null,WT_DL:typeof WT_DL!=='undefined'?WT_DL:null,CLS_WPN:typeof CLS_WPN!=='undefined'?CLS_WPN:null,classSkills,deliveryOf:typeof deliveryOf!=='undefined'?deliveryOf:null,archMult:typeof archMult!=='undefined'?archMult:null,effInfo,effOf,calcDamage,matchup,skEls,ATTACK,fx,exec:(s,t)=>exec(s,t),known,LEGEND_IDS:typeof LEGEND_IDS!=="undefined"?LEGEND_IDS:null,makeEnemy,GPOOL,FPOOL,newRun,guardianDef,archiveSkills,get G(){return G},set G(v){G=v},get B(){return B},V,META,newGame,newChar,startBattle,advance,autoTurn,autoTurnSmart:typeof autoTurnSmart==='function'?autoTurnSmart:autoTurn,AUTO_NERF:typeof AUTO_NERF!=='undefined'?AUTO_NERF:null,known,TPL,RAW,ZONES,MON,GUARDIANS,FINALS,STAGE_BOSS_LV,STAGE_LV,setPause:p=>{PAUSE=p},setSmart:v=>{if(typeof SIM_SMART!=='undefined')SIM_SMART=v},finishBattle,classSkills,calcStats,calcDamage,bossLvFor:typeof bossLvFor==="function"?bossLvFor:null,echoLv:typeof echoLv==="function"?echoLv:null,worldCreep:typeof worldCreep==='function'?worldCreep:null,storyEchoLv:typeof storyEchoLv==='function'?storyEchoLv:null,echoLvRule:typeof echoLvRule==='function'?echoLvRule:null,echoSpec:typeof echoSpec==="function"?echoSpec:null,dailyPlan,ASR:typeof AUTO_SWAP_RULES!=="undefined"?AUTO_SWAP_RULES:{},ZS,bondLv,encounterFoes,matchup,recruit,refresh,GEAR,rollWeather,WEATHER,startPersonal,tameElite,dailyPlan,startDaily,endDaily,get META(){return META}};`))(global.setTimeout);
A.setPause(0);
function run(spec){
  q=[];A.setSmart(!process.env.AUTONERF);A.V.auto=true;if(!process.env.KEEPBEST)A.META.best={};if(!A.startBattle(spec))return null;
  let it=0;
  while(it++<400000){
    if(A.V.modal&&(A.V.modal.type==='result'||A.V.modal.type==='lose'))break;
    if(!q.length){if(A.B&&A.B.mode==='cmd')(process.env.AUTONERF?A.autoTurn:A.autoTurnSmart)();else if(A.B&&!A.B.over)A.advance();if(!q.length)break;}
    q.shift()();
  }
  const res=A.V.modal?.type==='result'?'win':A.V.modal?.type==='lose'?'lose':'stuck';
  const t=A.B?A.B.time:0;const primes=A.B?A.B.nPrime||0:0,reacts=A.B?A.B.nDet||0:0,lg=A.B?A.B.log.slice():[],breaks=A.B?A.B.log.filter(l=>/guard shatters/.test(l)).length:0;
  const info=A.V.modal&&A.V.modal.info;A.lastInfo=info;A.V.modal=null;if(A.B)A.finishBattle('x');
  return {res,t,reacts,breaks,primes,log:lg};
}
function party(ids,lv,tier){A.newGame(ids.slice(0,3));const G=A.G;G.roster={};G.party=[];ids.forEach(id=>{const c=G.roster[id]=A.newChar(id,lv,tier);if(process.env.CAPES!=='off'&&A.GEAR['k_cape_'+Math.min(5,tier)]){c.eq.k='k_cape_'+Math.min(5,tier);c.S=A.calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;}G.party.push(id);});}
module.exports={A,run,party,Q:()=>q,resetQ:()=>{q=[];},setQ:v=>{q=v;}};
