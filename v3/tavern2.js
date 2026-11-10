// ===== tavern2.js (v0.3.5): the per-journey roster (G.sub) and tavern tables (G.tv) =====
// G.sub  = the wayfarers that exist in this journey (about 28 to 32), drawn once from the journey seed and saved with the run.
// G.tv   = tavern state { sl: the 4 table slots (id or null once hired), sh: shuffles so far, at: battle count at the last shuffle, ev: a rest or stage clear
//          happened since, n: {stage: tavern recruits made in that area, kept for records only} }. Old saves have neither field and get safe defaults on first read.
// SUB_MIN, SUB_SPAN: in config.js
const POOL_IDS=()=>RAW.filter(r=>r[6]!=='L'&&r[6]!=='x'&&TPL[r[0]]).map(r=>r[0]);
function subReq(set,must){must=must||[]; // returns the list of unmet guarantees as [label, candidate test]
  const ids=[...set],cl={},el={};let pr=0,dt=0,du=0,ch=0,early=0;
  ids.forEach(id=>{const t=TPL[id];cl[t.cls]=(cl[t.cls]||0)+1;t.el.forEach(e=>el[e]=(el[e]||0)+1);const R=heroRoles(id,40);if(R.P)pr++;if(R.D)dt++;if(t.el.length>1)du++;if(challIsPooled(id))ch++;
    if((t.src==='s'||t.src==='t0')&&!must.includes(id))early++;});
  const need=[];
  Object.keys(NAT_CLASS).forEach(k=>{if((cl[k]||0)<3)need.push(id=>TPL[id].cls===k);});
  ELK.forEach(e=>{if((el[e]||0)<3)need.push(id=>TPL[id].el.includes(e));});
  if(pr<4)need.push(id=>heroRoles(id,40).P);if(dt<4)need.push(id=>heroRoles(id,40).D);
  if(du<6)need.push(id=>TPL[id].el.length>1);if(ch<5)need.push(id=>challIsPooled(id));if(early<4)need.push(id=>{const s=TPL[id].src;return (s==='s'||s==='t0')&&!must.includes(id);});
  return need;
}
function genSub(seed,must,att){
  const all=POOL_IDS(),R=seeded(hashS('sub:'+seed+':'+(att||0))),target=SUB_MIN+Math.floor(R()*SUB_SPAN);
  const set=new Set(must.filter(id=>TPL[id]&&all.includes(id)));GIFTS.forEach(id=>{if(TPL[id])set.add(id);});
  const pick=a=>a[Math.floor(R()*a.length)];
  for(let guard=0;guard<80;guard++){const need=subReq(set,must);if(!need.length)break;
    const cand=all.filter(id=>!set.has(id));if(!cand.length)break;
    const f=need[0],c1=cand.filter(f);if(!c1.length){need.shift();continue;}
    // prefer a candidate that also satisfies other unmet guarantees
    const sc=c1.map(id=>need.reduce((a,g)=>a+(g(id)?1:0),0)),best=Math.max(...sc);set.add(pick(c1.filter((id,i)=>sc[i]===best||R()<.15)));}
  while(set.size<target){const cand=all.filter(id=>!set.has(id));if(!cand.length)break;set.add(pick(cand));}
  return [...set];
}
const subOK=(ids,must)=>subReq(new Set(ids),must).length===0;
function ensureSub(g){
  g=g||G;if(!g)return [];if(Array.isArray(g.sub)&&g.sub.length)return g.sub;
  const owned=Object.keys(g.roster||{}).filter(id=>TPL[id]&&!TPL[id].mon),seed=(g.run&&g.run.seed)||0;
  let sub=null;for(let a=0;a<12&&!sub;a++){const s=genSub(seed,owned,a);if(subOK(s,owned)||a===11)sub=s;}
  // everything already owned is always in; an old save with a big roster keeps the whole roster
  owned.forEach(id=>{if(!sub.includes(id)&&POOL_IDS().includes(id))sub.push(id);});
  return g.sub=sub;
}
const inSub=id=>{const t=TPL[id];if(!t)return false;if(t.src==='L'||t.src==='x'||t.mon)return true;return !G||ensureSub(G).includes(id);};
// ----- hooks -----
HOOK.after('newGame','tavern2','journey roster and tavern reset',function(){try{G.sub=null;ensureSub(G);G.tv=null;}catch(e){}});
HOOK.after('unpackG','tavern2','journey roster subset',function(g){try{ensureSub(g);}catch(e){}});
HOOK.after('recruit','tavern2','recruit joins the subset',function(r,id){try{if(r&&G.sub&&!G.sub.includes(id)&&!(TPL[id]&&(TPL[id].src==='L'||TPL[id].src==='x')))G.sub.push(id);}catch(e){}});
// challenge board and rare visitors only draw from the subset
{const ce=challEligible;challEligible=function(){return ce.apply(this,arguments).filter(c=>inSub(c.hero));};}
{const rp=rarePool;rarePool=function(){return rp.apply(this,arguments).filter(inSub);};}
// ----- tavern -----
function tvInit(){if(!G.tv||typeof G.tv!=='object')G.tv={sl:null,sh:0,at:0,ev:false,n:{}};const t=G.tv;t.n=t.n||{};return t;}
// v0.5.0: no per area recruit cap. tvLeft stays for old callers and always reports room.
function tvLeft(){return Infinity;}
function tvEvent(){tvInit().ev=true;}
HOOK.after('restAll','tavern2','tavern event after a rest',function(r){if(r)try{tvEvent();}catch(e){}});
HOOK.wrap('finishBattle','tavern2','tavern event on a stage clear',function(next,...a){const was=G&&G.cleared?G.cleared.filter(Boolean).length:0;const r=next(...a);try{if(G&&G.cleared&&G.cleared.filter(Boolean).length>was)tvEvent();}catch(e){}return r;});
// the pool for this town: subset wayfarers with a tavern source that have arrived by this area, not owned, not on the Guild board
const ceBoosted=id=>!!(G&&G.ce&&G.ce.boost&&G.ce.boost[id]);
function tvPool(){return tavernPool().filter(id=>inSub(id)||ceBoosted(id));}
function tvSince(){return battlesSoFar()-(tvInit().at||0);}
function tvDue(){const t=tvInit();return !t.sl||(t.ev&&tvSince()>=TV_CD);}
function tvShuffle(){
  const t=tvInit(),pool=tvPool(),N=partyNeeds();t.sh=(t.sh||0)+1;
  const R=seeded(hashS((G.run.seed||0)+':tv:'+t.sh+':'+G.stage)),left=pool.slice(),out=[];
  while(out.length<TV_SLOTS&&left.length){const w=left.map(id=>recruitFit(id,N).w*(ceBoosted(id)?3:1)),tot=w.reduce((a,b)=>a+b,0);let r=R()*tot,i=0;for(;i<left.length-1;i++){if((r-=w[i])<0)break;}out.push(left.splice(i,1)[0]);}
  t.sl=out;t.at=battlesSoFar();t.ev=false;G.tavRoll=(G.tavRoll||0)+1;try{out.forEach(id=>typeof codexSee==='function'&&codexSee(id));}catch(e){}return t;}
function tvSlots(){const t=tvInit();if(tvDue())tvShuffle();
  // a slot whose hero joined by another route (a challenge, a gift) becomes an empty seat too
  t.sl=t.sl.map(id=>id&&!G.roster[id]?id:null);
  // v0.4.3: beating a wayfarer in a duel earns a seat: they wait in the tavern (any town) until you hire them
  try{const b=Object.keys((G.ce&&G.ce.boost)||{}).filter(id=>TPL[id]&&!G.roster[id]);
    b.forEach(id=>{if(t.sl.includes(id))return;const k=t.sl.findIndex(x=>!x||G.roster[x]||!ceBoosted(x));if(t.sl.length<TV_SLOTS)t.sl.push(id);else if(k>=0)t.sl[k]=id;});}catch(e){}return t.sl;}
// what the tavern screen and the "What next?" guide see: the heroes sitting at the tables right now
function tavernOffers(){return tvSlots().filter(Boolean);}
function tvNextText(){const t=tvInit(),c=Math.max(0,TV_CD-tvSince());
  if(t.ev&&c<=0)return 'Next shuffle: the next time you walk in.';
  if(t.ev)return `Next shuffle: after ${c} more battle${c>1?'s':''} (you have already rested or cleared a stage).`;
  return `Next shuffle: after you rest at an inn or clear a stage, and at least ${TV_CD} battles since the last one${c>0?` (${c} to go)`:''}.`;}
function tavernLater(){const mine=tvPool().length;const later=RAW.filter(r=>(r[6][0]==='t')&&inSub(r[0])&&!G.roster[r[0]]&&!challIsPooled(r[0])&&!tavernUnlocked(r[0])).length;return later;}
HOOK.wrap('recruit','tavern2','recruit count per stage',function(next,...args){const [id,free]=args;const was=!G.roster[id],r=next(...args);try{if(r&&was&&!free&&TPL[id].src[0]!=='r'){const t=tvInit();t.n[G.stage]=(t.n[G.stage]||0)+1;const i=t.sl?t.sl.indexOf(id):-1;if(i>=0)t.sl[i]=null;}}catch(e){}return r;});
// v0.5.0: gold is the only thing that can stop a hire (recruit() checks it)
const hireOK=id=>!!TPL[id];

