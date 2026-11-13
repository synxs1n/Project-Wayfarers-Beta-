// ===== bosses9.js (v0.13.7): the Scourges and Calamity added in 0.13.7 and the Ashglass Reach they opened (realms14: the Ashglass Reach is now the salt-flat Scourge realm of the Geyser Matron; The Locust Choir, Ironmaw Tortoise and the Hollow Sun were cut) =====
// The definitions are data: foes.js (GUARDIANS: locustchoir, ironmaw, candlemoth, brinehag; FINALS: hollowsun), art3.js (sprites, BIG_ART),
// realmdata.js (REALMS ashglass with cal:1, BOV overlays, CAL_FX), bosstheme.js (BTHEME), lore9.js (LORE_REALM.ashglass). GPOOL, FPOOL,
// echoKeys() (Echoes, shards, the Sanctum gates, the Riftkeeper's "every Echo" count) and REALM_CAL are all derived from those tables, so a new
// journey draws them with no further wiring. This module adds what lives in tables owned by other modules: the archetype tags, the boss
// gimmicks, the realm's native foes, its dungeon and ground look. Older saves keep their drawn order (G.run.order, bosses, final).
Object.assign(BOSS_TY,{candlemoth:['flying'],brinehag:[]});
// gimmicks (battle4.js reads BOSS_GIM.def[key]; the types are the existing ones)
Object.assign(BOSS_GIM.def,{
  candlemoth:{t:'rod',n:'Drawn to the Flame',pct:.18,arc:.3,el:'fire',d:'It marks the hero who burns brightest; it dives on them next turn and the fire splashes to their neighbours. Swap them out to douse it',tell:'Every flame in the room leans toward {who}',hit:'The Moth dives into {who}'},
  brinehag:{t:'sac',n:'Call the Drowned',fx:'summon',mon:'drownedsailor',brk:1,thr:.08,d:'She whistles up a drowned sailor from the brine; Break her shield or hit her hard before her next turn to stop the call',tell:'Her seaweed hair writhes; something answers from the water',hit:'A drowned sailor claws out of the brine',stop:'The call dies in her throat'}});
// the realm's own foes (the overlay foes o_<boss> come from BOV in realms.js)
makeMonVariant('v_saltcrawler','crawler','Salt Crawler',['earth','light'],'#e8e0d0');
makeMonVariant('v_glasswisp','tidewisp','Glass Wisp',['light','fire'],'#bfe8f0');
// dungeon walls and the ground look of a new journey in the Ashglass Reach
if(typeof D8_REALM!=='undefined')D8_REALM.ashglass=['sand',0];
if(typeof LOOK9!=='undefined')LOOK9.ashglass={n:'salt flat',tree:'dead',trunk:'#6a5e54',pal:{g:['#e8e0d0','#d8cfbc','#f4eee0','#bfb4a0'],tg:['#c8bca4','#e0d6c0','#fff8e8'],p:['#d0c0a8','#b8a68c','#e0d2bc']},lip:'#f4eee0',dens:{R:.06,T:.03}};
