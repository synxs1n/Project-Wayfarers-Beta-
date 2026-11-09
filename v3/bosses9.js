// ===== bosses9.js (v0.13.7): four new Scourges and the fifth Calamity, with the realm they open =====
// The definitions are data: foes.js (GUARDIANS: locustchoir, ironmaw, candlemoth, brinehag; FINALS: hollowsun), art3.js (sprites, BIG_ART),
// realmdata.js (REALMS ashglass with cal:1, BOV overlays, CAL_FX), bosstheme.js (BTHEME), lore9.js (LORE_REALM.ashglass). GPOOL, FPOOL,
// echoKeys() (Echoes, shards, the Sanctum gates, the Riftkeeper's "every Echo" count) and REALM_CAL are all derived from those tables, so a new
// journey draws them with no further wiring. This module adds what lives in tables owned by other modules: the archetype tags, the boss
// gimmicks, the realm's native foes, its dungeon and ground look. Older saves keep their drawn order (G.run.order, bosses, final).
Object.assign(BOSS_TY,{locustchoir:['swarm'],ironmaw:['armored'],candlemoth:['flying'],brinehag:[],hollowsun:[]});
// gimmicks (battle4.js reads BOSS_GIM.def[key]; the types are the existing ones)
Object.assign(BOSS_GIM.def,{
  locustchoir:{t:'sac',n:'Brood Cloud',fx:'summon',mon:'gnatswarm',thr:.07,d:'A cloud of larvae gathers over the swarm; burst it with enough damage (wide area skills shred swarms) before its next turn or it hatches',tell:'The hum drops to one long, held note',hit:'The cloud hatches into a fresh swarm',stop:'The cloud scatters'},
  ironmaw:{t:'sac',n:'Shell Lock',fx:'buff',buff:['bulwark','might'],els:['lightning','ice'],thr:.08,d:'Its iron plates grind shut; a Lightning or Ice hit or heavy damage cracks the seal, or it gains Bulwark and Might',tell:'The Tortoise\'s plates grind shut',hit:'The Tortoise locks its shell',stop:'The plates crack open'},
  candlemoth:{t:'rod',n:'Drawn to the Flame',pct:.18,arc:.3,el:'fire',d:'It marks the hero who burns brightest; it dives on them next turn and the fire splashes to their neighbours. Swap them out to douse it',tell:'Every flame in the room leans toward {who}',hit:'The Moth dives into {who}'},
  brinehag:{t:'sac',n:'Call the Drowned',fx:'summon',mon:'drownedsailor',brk:1,thr:.08,d:'She whistles up a drowned sailor from the brine; Break her shield or hit her hard before her next turn to stop the call',tell:'Her seaweed hair writhes; something answers from the water',hit:'A drowned sailor claws out of the brine',stop:'The call dies in her throat'},
  hollowsun:{t:'mirror',n:'Corona Ring',every:4,kinds:['mag','phys'],cut:.4,refl:.1,d:'Every few turns a ring of fire turns aside one kind of hit for a round (spells first, then weapons) and splashes part of it back. Use the other kind',tell:'The ring around the Hollow Sun brightens',hit:'A corona ignites around the Hollow Sun'}});
// the realm's own foes (the overlay foes o_<boss> come from BOV in realms.js)
makeMonVariant('v_saltcrawler','crawler','Salt Crawler',['earth','light'],'#e8e0d0');
makeMonVariant('v_glasswisp','tidewisp','Glass Wisp',['light','fire'],'#bfe8f0');
// dungeon walls and the ground look of a new journey in the Ashglass Reach
if(typeof D8_REALM!=='undefined')D8_REALM.ashglass=['sand',0];
if(typeof LOOK9!=='undefined')LOOK9.ashglass={n:'salt flat',tree:'dead',trunk:'#6a5e54',pal:{g:['#e8e0d0','#d8cfbc','#f4eee0','#bfb4a0'],tg:['#c8bca4','#e0d6c0','#fff8e8'],p:['#d0c0a8','#b8a68c','#e0d2bc']},lip:'#f4eee0',dens:{R:.06,T:.03}};
