// ===== bosses10.js (v0.14.x): four more Scourges (realms14: The Hollow Shepherd and The Pale Weaver were cut, the Crow Regent and the Geyser Matron kept for the Corvid Moors and the Ashglass Reach; the roster is now sixteen Scourges and four Calamities) =====
// Data lives where the others' does (foes.js GUARDIANS, art3.js sprites and BIG_ART, realmdata.js BOV, bosstheme.js BTHEME); the Sanctum grows
// to twenty Scourge gates (sanctum.js) and the Riftkeeper counts echoKeys(), so it needs no wiring. This module adds the archetype tags and
// the realm gimmicks (the roster had seven 'sac' gimmicks and no second use of veil, tide or phase2 among the Scourges, so the new four take those).
//   The Crow Regent      wind/shadow, flying    Murder Form (phase2): at half HP it bursts into a murder with a new move set
//   The Geyser Matron    fire/water, jelly      Rising Steam (tide): the vents fill the cavern; Earth dams it
Object.assign(BOSS_TY,{crowregent:['flying'],geysermatron:['jelly']});
Object.assign(BOSS_GIM.def,{
  crowregent:{t:'phase2',n:'Murder Form',warn:.6,at:.5,sk:[['Black Squall','wind',1.3,'all','mag',[['blind',.5]]],['Beak Storm','shadow',1.9,'one','phys',[['bleed',.6]]],['Carrion Call','shadow',1.1,'all','phys',[['weaken',.4]]]],d:'At half HP the Regent bursts into a murder of crows: new moves and its shield back. Save a weakness hit for after',tell:'The Regent\'s coat begins to come apart in black feathers',hit:'The Regent bursts into a murder of crows'},
  geysermatron:{t:'tide',n:'Rising Steam',every:3,max:3,spd:.05,dmg:.08,d:'Steam fills the cavern every few turns: heroes without Water slow down and Water skills hit harder. An Earth skill caps the vents',tell:'The vents begin to shriek',hit:'The steam thickens'}});
