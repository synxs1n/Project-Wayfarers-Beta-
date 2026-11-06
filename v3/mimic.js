// =================== MIMICS (Beta v0.3.1) ===================
// About 1 in 8 ordinary dungeon chests is a mimic, picked from the run seed so it is stable across reloads.
// Never the Beacon Key chest or a vault chest, so a mimic can never block progress; the tile stays a chest either way,
// so dungeon validation is unchanged. Beat it and you get the chest's loot plus a bonus.
// MIMIC_RATE: in config.js
MART.mimic=g=>{g.rect(6,16,28,18,'W');g.rect(6,10,28,7,'L');g.rect(6,16,28,2,'G');g.rect(18,15,4,6,'G');g.rect(19,17,2,2,'K');
  for(let i=0;i<6;i++){g.s(9+i*4,18,'T');g.s(10+i*4,19,'T');}for(let i=0;i<6;i++){g.s(9+i*4,16,'T');}
  g.rect(12,21,16,7,'M');g.ell(14,12,2,1.5,'E');g.ell(26,12,2,1.5,'E');g.rect(4,32,4,4,'W');g.rect(32,32,4,4,'W');
  return {pal:{W:'#8a5a2a',L:'#a8743a',G:'#e0b84a',K:'#2a1a0e',T:'#f4efe0',M:'#7a1a2a',E:'#ff4a4a'}};};
MON.mimic={n:'Mimic',art:'mimic',el:['shadow','earth'],hp:1.6,atk:1.35,def:1.3,mag:.9,res:1.1,spd:.9,mimic:1,
  sk:[['Lid Snap','shadow',1.5,'one','phys',[['bleed',.4]]],['Greedy Gulp','earth',1.1,'one','phys',[['weaken',.4]]],['Gilded Lure','earth',0,'self','buff',[['bulwark',1]]]]};
MON_DROPS.mimic=['core','ore*'];
function chestHash(m,x,y){let h=hashS('mimic:'+(G.run.seed||1)+':'+m.s+':'+x+','+y);h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);h^=h>>>16;return (h>>>0)/4294967296;}
function isMimic(m,x,y){if(!m||m.kind!=='dungeon'||m.archive||m.t[y][x]!=='C')return false;const c=(m.chests||[]).find(q=>q[0]===x&&q[1]===y);if(!c||c[2]==='vault')return false;return chestHash(m,x,y)<MIMIC_RATE;}
{const oc0=openChest;openChest=function(x,y){const m=WS.m,key=m.id+':'+x+','+y;
  if(!G.chests[key]&&isMimic(m,x,y)&&!G.daily){haltInput();
    say(null,'The chest yawns open on its own. Teeth! It\'s a Mimic!',()=>{if(!startBattle({stage:m.s,kind:'dungeon',mimic:{x,y,map:m.id}})){toast('Your party needs rest first.');render();}});return;}
  return oc0.apply(this,arguments);};}
{const ef0=encounterFoes;encounterFoes=function(spec){if(spec&&spec.mimic){const lv=STAGE_LV[spec.stage][1]+2+(typeof ngLvOff==='function'?ngLvOff():0);const e=makeEnemy(MON.mimic,lv,{hpM:1.5,powM:1.1,elite:true,name:'Mimic'});return [e];}return ef0.apply(this,arguments);};}
{const w0=win;win=function(){const sp=B&&B.spec,mm=sp&&sp.mimic;const r=w0.apply(this,arguments);
  if(mm&&G){try{const bonus=150+120*sp.stage;G.gold+=bonus;V.mimicLoot={x:mm.x,y:mm.y,bonus};}catch(e){}}return r;};}
// after the result screen, back on the map: the chest opens normally (its loot), plus the bonus line
{const r0=render;render=function(){if(V.mimicLoot&&!B&&!V.modal&&V.screen==='world'&&WS.m&&!WS.dlg){const L=V.mimicLoot;V.mimicLoot=null;const key=WS.m.id+':'+L.x+','+L.y;
    if(!G.chests[key]){mimicReward(L.x,L.y,L.bonus);}}return r0.apply(this,arguments);};}
// v0.4.1 1.2: a slain mimic and its chest vanish, and it drops a better reward than any ordinary chest (a tier above, plus a charm and gold)
function mimicReward(x,y,bonus){const m=WS.m,key=m.id+':'+x+','+y;G.chests[key]=2;if(typeof sfx==='function')sfx('chest');
  const s=m.s,tier=Math.min(5,s+2),gid=lootBase()+'_'+tier+'+1',cid=pick(['c_vital','c_mana','c_swift','c_clarity','c_'+pick(ELK)]);
  G.gear.push(gid);G.gear.push(cid);rebuildBase();
  if(typeof dropChest==='function')dropChest(m,x,y);saveGame();
  say(null,`The Mimic collapses into splinters and the chest is gone. In the wreckage: ${gearOf(gid).n} (${ITEM_TIERS[gTierIdx(gearOf(gid))].n}), ${gearOf(cid).n} and ${bonus} gold!`);}
// tells: a tiny breathing wiggle every few seconds and a red glint in the keyhole
{const wd0=worldDraw;worldDraw=function(now){wd0(now);try{const m=WS.m;if(!m||m.kind!=='dungeon'||!m.chests)return;const ctx=WS.ctx,cx=Math.round(WS.cam.x),cy=Math.round(WS.cam.y);
  m.chests.forEach(([x,y])=>{if(G.chests[m.id+':'+x+','+y]||!isMimic(m,x,y))return;const px=x*TS-cx,py=y*TS-cy;if(px<-16||py<-16||px>WS.vw||py>WS.vh)return;
    const ph=(now/1000+x*.37)%3.4;if(ph<.35){ctx.fillStyle='rgba(10,6,20,.55)';ctx.fillRect(px+2,py+7,12,1);}
    if(Math.floor(now/700+x)%5===0){ctx.fillStyle='#ff4a4a';ctx.fillRect(px+7,py+8,2,1);}});}catch(e){}};}
// the Bestiary lists Mimics with the dungeon oddities
{const ba0=bestAll;bestAll=function(){const out=ba0();out.push({k:'mimic',d:MON.mimic,zone:-1,odd:1});return out;};}
