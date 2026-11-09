// ===== fixes10.js (v0.14.1): field actors on open ground, Den and Sanctum minibosses wait at the end, rarer eye patches =====
// 1) Bounty beasts, legend challengers and quest wanderers placed on a field could land on a tile the Sanctum gatehouse or a den mouth
//    later covered, so they stood inside a wall where nobody could talk to them. dynActors now moves any actor on a solid tile, or
//    within one tile of a site mouth, exit or dungeon door, to the nearest open spot. Talking to a legend challenger always answers.
// 2) The owner: "Get rid of chest to activate boss fight in dens, the miniboss or duel opponent should be waiting at the end of the den
//    like scourges in dungeons do." The miniboss stands at the end (the Sanctum's rune circle, or the tile before a Den's prize chest),
//    drawn like a bounty beast with a red marker; walk into it or face it and press A to be asked to fight. The prize chest will not
//    open while it stands. Saves: G.miniDone as before.
// 3) Eye patches went to 23 of 92 heroes; now about one in five of those keeps it, the rest swap it for a pouch or satchel, and a third
//    of the scarves and earrings go too, so each piece stays a distinguishing mark.
function f10Bad(m,x,y){try{const c=m.t[y]&&m.t[y][x];if(c==null||SOLID.includes(c))return true;if((m.caves||[]).some(s=>Math.abs(s.x-x)<=1&&Math.abs(s.y-y)<=1))return true;
  if(m.ent&&Math.abs(m.ent[0]-x)<=1&&Math.abs(m.ent[1]-y)<=2)return true;if((m.exits||[]).some(e=>Math.abs(e.x-x)<=1&&Math.abs(e.y-y)<=1))return true;}catch(e){}return false;}
function miniPending(m){try{return !!(m&&m.cave&&G&&!G.daily&&siteHasMini(m.id)&&!(G.miniDone&&G.miniDone[m.id]));}catch(e){return false;}}
function miniSpot(m){if(m._ms!==undefined)return m._ms;let p=null;try{if(m.fort&&m.guardAt)p=m.guardAt.slice();else if(m.prize){const [px,py]=m.prize;
  const c=[[px,py+1],[px,py-1],[px-1,py],[px+1,py],[px,py+2],[px-1,py+1],[px+1,py+1],[px,py-2]].find(([x,y])=>m.t[y]&&m.t[y][x]&&!SOLID.includes(m.t[y][x]));p=c||null;}}catch(e){}return m._ms=p;}
{const da0=dynActors;dynActors=function(m){const out=da0.apply(this,arguments);try{if(!m||!m.t)return out;
  out.forEach(a=>{if(a.mini||!f10Bad(m,a.x,a.y))return;const free=(m.free||[]).filter(p=>!f10Bad(m,p[0],p[1])&&!out.some(o=>o!==a&&o.x===p[0]&&o.y===p[1]));if(!free.length)return;
    let best=null,bd=1e9;free.forEach(p=>{const d=Math.abs(p[0]-a.x)+Math.abs(p[1]-a.y);if(d<bd){bd=d;best=p;}});if(best){a.x=best[0];a.y=best[1];}});
  if(miniPending(m)){const p=miniSpot(m);if(p){const mb=m._gd||(m._gd=miniFor(m));out.push({type:'elite',mini:1,x:p[0],y:p[1],b:{mon:mb.mon,name:mb.name,mod:mb.mod,mini:m.id,lv:STAGE_LV[m.s][1]+SITES.miniLv+ngLvOff()}});}}}catch(e){}return out;};}
{const sg0=sanctGuard;sanctGuard=function(m){return null;};}// the actor above stands in for the old standing guard
{const at0=actorTalk;actorTalk=function(a){if(a&&a.mini){V.modal={type:'miniask',id:a.b.mini,b:a.b};render();return;}
  if(a&&a.type==='legend'&&a.q&&!['kaevan','nikaris','jaeson'].includes(a.q.hero)){const t=TPL[a.q.hero];say(t?t.n:'Wayfarer',`"Not yet. Come back when you have what this road asks of you." (A legend's challenge: see Quests for what it wants.)`);return;}
  return at0.apply(this,arguments);};}
HOOK.before('vModal','fixes10','miniboss ask',function(m){if(!m||m.type!=='miniask')return;const b=m.b||{},mo=MON[b.mon]||{},md=(typeof ELITE_MODS!=='undefined'?ELITE_MODS:[]).find(x=>x.k===b.mod),here=WS.m;
  return HOOK.stop(box(esc(b.name||mo.n||'Guardian'),`<div class="bossv"><img src="${monURL(mo.art)}" alt=""></div><div class="els">${elChips(mo.el||[])}</div><p>${here&&here.fort?'It stands on the rune circle of the keep\'s hall, between you and the prize.':'It waits at the back of the den, between you and the prize.'}</p><p class="note">Level ${b.lv||'?'}, with a pack. ${md?`<b>${md.n}:</b> ${md.d}`:''} No auto battle. Win and the chest is yours, plus a Dread Core, gold and materials.</p>`,
    `<button class="btn" data-act="closeModal">Not yet</button><button class="btn gold" data-act="miniGo">Fight</button>`));});
ACT.miniGo=function(){const m=WS.m;if(!m||!miniPending(m))return;const mb=m._gd||(m._gd=miniFor(m));V.modal=null;haltInput();startBattle({stage:m.s,kind:'mini',mini:{id:m.id,mon:mb.mon,name:mb.name,mod:mb.mod}});};
{const ab0=askBoss;askBoss=function(){const m=WS.m;if(m&&m.cave){if(miniPending(m)){const a=dynActors(m).find(x=>x.mini);if(a)return actorTalk(a);}return;}return ab0.apply(this,arguments);};}
{const oc0=openChest;openChest=function(x,y){try{const m=WS.m;if(m&&miniPending(m)&&m.prize&&m.prize[0]===x&&m.prize[1]===y){const mb=m._gd||(m._gd=miniFor(m));say(null,`${mb.name} stands between you and the prize. Beat it first.`);return;}}catch(e){}return oc0.apply(this,arguments);};}
// ---- accessories ----
{const ao0=accOf;accOf=function(id){const o=ao0.apply(this,arguments);try{if(o&&o.acc&&!o._f10){o._f10=1;const h=hashS(String(id)+'acc10'),L=(TPL[id]&&TPL[id].look)||{};
  if(o.acc.includes('eyepatch')&&h%5!==0){o.acc=o.acc.filter(a=>a!=='eyepatch');if(!o.acc.length)o.acc.push(L.b==='monk'?'satchel':'pouch');}
  if(o.acc.includes('earrings')&&(h>>>3)%3===0&&o.acc.length>1)o.acc=o.acc.filter(a=>a!=='earrings');
  if(o.acc.includes('scarf')&&(h>>>5)%3===0&&o.acc.length>1)o.acc=o.acc.filter(a=>a!=='scarf');}}catch(e){}return o;};}
