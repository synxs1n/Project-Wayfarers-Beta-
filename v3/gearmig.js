// ===== gearmig.js (v0.3.5): gear migration for old saves (per class weapon types and armor weights) =====
// Beta v0.3.5: gear migration. Weapon types and armor weights are now per class, so an old save can hold gear its owner can no longer use.
// Illegal pieces go back to the pack (never deleted), the best legal piece takes their place, and a hero with nothing legal is reissued a plain
// piece of their class's default family at the same tier. Safe to run on every load: it does nothing when every hero is already legal.
function gearMigrate(g){
  g=g||G;if(!g||g.daily||!g.roster)return [];
  const out=[],G0=G;G=g;
  try{
    const chars=Object.values(g.roster).filter(c=>c&&c.eq&&TPL[c.id]);
    const order=c=>(g.party.indexOf(c.id)<0?99:g.party.indexOf(c.id));chars.sort((a,b)=>order(a)-order(b));
    const lost=[];
    chars.forEach(c=>['w','a'].forEach(sl=>{const id=c.eq[sl];if(!id||canEquip(c,id))return;c.eq[sl]=null;g.gear.push(id);lost.push([c,sl,id]);}));
    lost.forEach(([c,sl,id])=>{
      const old=gearOf(id),pool=[...new Set(g.gear.filter(x=>{const q=gearOf(x);return q&&q.slot===sl&&canEquip(c,x)&&(!q.only||q.only===c.id);}))];
      let best=null,bs=-1e9;pool.forEach(x=>{const v=scoreEq(c,Object.assign({},c.eq,{[sl]:x}));if(v>bs){bs=v;best=x;}});
      let how='';
      if(best){g.gear.splice(g.gear.indexOf(best),1);c.eq[sl]=best;how=`now uses ${gearOf(best).n}`;}
      else{const cf=CF[TPL[c.id].cls]||CF.warrior,fam=cf[sl==='w'?0:1],nid=(sl==='w'?'w_':'a_')+fam+'_'+Math.min(5,old.tier||0);
        if(GEAR[nid]){c.eq[sl]=nid;how=`was issued ${GEAR[nid].n}`;}else how='has nothing equipped';}
      out.push({who:c.name,id:c.id,slot:sl,old:old.n,why:equipWhy(c,id),how});
    });
    if(out.length)Object.values(g.roster).forEach(refresh);
  }finally{G=G0;}
  return out;
}
{const e0=enterWorldFromSave;enterWorldFromSave=function(){const r=e0.apply(this,arguments);try{const mv=gearMigrate(G);if(mv.length){G.gmig=(G.gmig||0)+1;saveGame();V.modal={type:'gmig',moves:mv};render();}}catch(err){console.error(err);}return r;};}
function mGearMig(m){const L=m.moves||[];
  return box('Gear reshuffled',`<p class="note">Weapons and armor now follow class rules. Nothing was deleted: anything a hero can no longer use is back in your pack.</p><div class="rows">${L.map(x=>`<div class="row"><div class="grow"><b>${esc(x.who)}</b><small>${esc(x.old)} moved to your pack. ${esc(x.why||'')} ${esc(x.who)} ${esc(x.how)}.</small></div></div>`).join('')}</div>`,
    `<button class="btn gold" data-act="gmigOk">OK</button>`);}
HOOK.before('vModal','gearmig','gmig popup (old gear)',function(m){if(m&&m.type==='gmig')return HOOK.stop(mGearMig(m));});
ACT.gmigOk=function(){V.modal=null;render();};
