// ===== auto39.js (v0.22.39): auto battle uses the right item for the moment, and can be told not to use items =====
// Asked: "Auto never uses mana pots, should also use the appropriate item for the situation more often, like it should use smelling salts
// before pheonix feathers, review for other item use cases that arent coded into auto, make an auto option to turn off item use."
// Before this, auto knew two items: a Healing Draught on itself under 30% HP when it had no heal, and a Phoenix Feather half the time someone
// was down. It never touched Mana Tonic, Sage Brew, Vigor Tonic, Greater Draught, Elixir, Smelling Salts, Remedy, Sacred Ash or a Bandage Roll.
// a39Pick looks before auto's own turn (autoTurn, outermost) and returns [item, target] or nothing:
//  1 someone in the vanguard is down (or in the rearguard, in a hard fight) and this hero has no revive skill to cast: Smelling Salts first,
//    a Phoenix Feather only when there are no Salts
//  2 a vanguard hero is under the potion line (Auto settings, 30%) and this hero cannot heal: the smallest draught that covers most of what is
//    missing (Healing Draught, Vigor Tonic, Greater Draught); an Elixir only against a boss or under 20%
//  3 a healer who cannot pay for a heal while an ally is hurt, or any hero who cannot pay for a single skill in a hard fight: the smallest
//    mana item that covers half the bar (Mana Tonic, Sage Brew, Vigor Tonic)
//  4 a Curse: Sacred Ash. A Wound in a hard fight or under 60% HP: a Bandage Roll. Two passing ailments, or Poison, Burn or Bleed under half
//    HP, when this hero has no cleanse: a Remedy
// A "hard fight" is a boss, more than one foe, or a foe with over twice this hero's max HP and more than half of it left.
// Auto settings has "Use items" (AC.items, on by default): off, auto uses no item at all (the two old cases included).
const A39={err:'',last:null};
try{AUTO_DEF.items=true;}catch(e){}
{const c0=autoCfg;autoCfg=function(){const c=c0.apply(this,arguments);if(c.items===false){c.potion=false;c.reviveItem=false;}return c;};}
function a39Pick(){const a=B&&B.cur;if(!a||a.side!=='p'||a.isComp||a.isSum||!G||!G.inv)return null;const AC=autoCfg();if(AC.items===false)return null;
  const inv=id=>(ITEMS[id]&&G.inv[id])||0,ratio=c=>c.hp/c.S.mhp,fr=B.front.filter(c=>c.hp>0),foes=B.en.filter(e=>e.hp>0);if(!foes.length)return null;
  const kit=known(a),ks=kit.filter(s=>a.mp>=(s.mp||0)),heals=kit.filter(s=>s.k==='heal'&&s.pw>0&&!s.bond),canHeal=heals.some(s=>a.mp>=(s.mp||0));
  const canRev=ks.some(s=>s.k==='revive'||s.revive),canCure=ks.some(s=>s.cleanse);
  const tough=!!B.boss||foes.length>1||foes.some(e=>e.S.mhp>a.S.mhp*2&&e.hp>e.S.mhp*.5);
  // by size: the smallest that does the job, else the largest in the pack
  const sized=(key,need,skip)=>{const L=Object.keys(ITEMS).filter(id=>ITEMS[id][key]&&!ITEMS[id].revive&&!ITEMS[id].travel&&inv(id)&&!(skip&&skip(id))).sort((x,y)=>ITEMS[x][key]-ITEMS[y][key]);
    return L.find(id=>ITEMS[id][key]>=need)||L[L.length-1]||null;};
  // 1 revive
  if(AC.reviveItem!==false&&!(AC.reviveSkill&&canRev)){const d=B.front.find(c=>c.hp<=0)||(tough?B.back.find(c=>c.hp<=0):null);
    if(d){const id=inv('salts')?'salts':inv('plume')?'plume':null;if(id)return [id,d];}}
  // 2 a draught
  const line=(AC.potionAt||30)/100,hurt=fr.filter(c=>ratio(c)<line).sort((x,y)=>ratio(x)-ratio(y))[0];
  if(AC.potion!==false&&hurt&&!canHeal){const need=(hurt.S.mhp-hurt.hp)*.6,big=B.boss||ratio(hurt)<.2;
    const id=sized('heal',need,x=>x==='elixir')||(big&&inv('elixir')?'elixir':null);if(id)return [id,hurt];}
  // 3 mana
  const paid=kit.filter(s=>(s.mp||0)>0&&(s.k==='phys'||s.k==='mag'||s.k==='heal'||s.k==='revive'||s.k==='status')),minC=paid.length?Math.min(...paid.map(s=>s.mp)):0;
  const dry=paid.length&&(a.mp<minC||a.mp<a.S.mmp*.12),healerDry=heals.length&&!canHeal&&fr.some(c=>ratio(c)<(AC.healAt||50)/100);
  if(healerDry||(dry&&tough)){const id=sized('mp',(a.S.mmp-a.mp)*.5,x=>x==='elixir')||(B.boss&&inv('elixir')?'elixir':null);if(id)return [id,a];}
  // 4 cures
  if(AC.cure!==false){const cu=fr.find(c=>c.st&&c.st.curse);if(cu&&inv('ash'))return ['ash',cu];
    const wo=fr.find(c=>c.st&&c.st.wound&&(tough||ratio(c)<.6));if(wo&&inv('bandage'))return ['bandage',wo];
    if(!canCure&&inv('remedy')){const bad=c=>Object.keys(c.st||{}).filter(k=>STS[k]&&STS[k].bad&&!STS[k].hard&&k!=='stun'&&k!=='curse'&&k!=='wound');
      const si=fr.map(c=>({c,b:bad(c)})).filter(o=>o.b.length>=2||(o.b.some(k=>k==='poison'||k==='burn'||k==='bleed')&&ratio(o.c)<.5)).sort((x,y)=>y.b.length-x.b.length)[0];if(si)return ['remedy',si.c];}}
  return null;}
{const at0=autoTurn;autoTurn=function(){try{if(B&&!B.over&&B.mode==='cmd'&&B.auto&&!(typeof SIM_SMART!=='undefined'&&SIM_SMART)&&!(typeof autoLocked==='function'&&autoLocked())){const p=a39Pick();
    if(p){A39.last=p[0];const n=G.inv[p[0]];useItem(p[0],p[1]);if(G.inv[p[0]]<n)return;}}}catch(e){A39.err=String(e&&e.message||e);}
  return at0.apply(this,arguments);};}
HOOK.xform('vModal','auto39','Auto settings: Use items',function(h,m){try{if(!m||m.type!=='autoset'||typeof h!=='string')return h;const on=autoCfg().items!==false;
  const row=`<div class="row"><div class="grow"><b>Use items</b><small>On: Smelling Salts before Phoenix Feathers, the draught that fits the wound, Mana Tonics when a hero runs dry, Sacred Ash, Bandage Rolls and Remedies. Off: auto never spends an item.</small></div><div class="chips"><button class="chip ${on?'on':''}" data-act="autoCfg" data-arg='["items",true]'>On</button><button class="chip ${on?'':'on'}" data-act="autoCfg" data-arg='["items",false]'>Off</button></div></div>`;
  h=h.replace('<h4>Options</h4><div class="rows">','<h4>Options</h4><div class="rows">'+row).replace(/never uses items/,'uses items only as the Use items option below allows');}catch(e){}return h;});
try{window.__A39={A39,pick:a39Pick};}catch(e){}
