// ===== holy9.js (v0.13.5): healing light burns the undead harder than a plain skill =====
// The owner: healing on undead should beat a normal skill most of the time. Before, a heal dealt 75% of its amount (60% for party-wide
// heals, power capped at 2.2). Now: 135% (party-wide 100%), the cap is 3.2, a revive counts as a strong heal, and an undead foe weak to
// Light takes the Light multiplier from the chart on top. Same hooks and labels as archetype.js (the preview still says "Damages undead").
const HOLY9={one:1.35,aoe:1.0,cap:3.2};
{const hh0=holyHit;holyHit=function(a,sk,t,mult){try{if(!t||t.hp<=0)return 0;
    const m=(mult===HEAL_HURT_AOE?HOLY9.aoe:HOLY9.one)*(mult/(mult===HEAL_HURT_AOE?HEAL_HURT_AOE:HEAL_HURT)||1);
    const pw=Math.min(sk.k==='revive'?Math.max(1.6,(sk.pw||.4)*3):(sk.pw||1),HOLY9.cap);
    let light=1;try{const w=(t.weak||t.wk||[]);if(Array.isArray(w)&&w.includes('light'))light=1.3;else if(typeof CHART!=='undefined'&&t.el&&t.el.length){const v=Math.max(...t.el.map(e=>(CHART.light||{})[e]||1));if(v>1)light=Math.min(1.5,v);}}catch(e){}
    let n=Math.round(pw*(a.S.healP||a.S.mag)*rnd(.95,1.05)*(1+(a.S.healUp||0))*m*light);
    if(t.boss)n=Math.round(n*clamp(1,ARCH_BOSS_CLAMP[0],ARCH_BOSS_CLAMP[1]));
    if(t.broken)n=Math.round(n*1.5);if(t.guard)n=Math.round(n*.5);if(has(t,'bulwark'))n=Math.round(n*.7);
    t.fxEl='light';t.fxT=Date.now();t.hp=Math.max(0,t.hp-n);
    fx(t,String(n),'dmg weak');log(`${t.name} takes ${n} from the healing light!`);
    try{knowEl(t,'light');if(t.maxShield&&a.side==='p')chipShield(t,1,'weak');}catch(x){}
    if(t.hp<=0)fallen(t);else checkPhase(t);return n;}catch(e){return hh0.apply(this,arguments);}};}
