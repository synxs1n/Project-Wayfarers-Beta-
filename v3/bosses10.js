// ===== bosses10.js (v0.14.x): four more Scourges, so the roster is twenty Scourges and five Calamities (25 bosses) =====
// Data lives where the others' does (foes.js GUARDIANS, art3.js sprites and BIG_ART, realmdata.js BOV, bosstheme.js BTHEME); the Sanctum grows
// to twenty Scourge gates (sanctum.js) and the Riftkeeper counts echoKeys(), so it needs no wiring. This module adds the archetype tags and
// the realm gimmicks (the roster had seven 'sac' gimmicks and no second use of veil, tide or phase2 among the Scourges, so the new four take those).
//   The Hollow Shepherd  earth/light, plant     Fold Mist (veil): it hides in a pasture fog until a Scan or a Light skill reveals it
//   The Pale Weaver      ice/lightning, beast   Web Snare (slot): two Vanguard spots are webbed and rooted
//   The Crow Regent      wind/shadow, flying    Murder Form (phase2): at half HP it bursts into a murder with a new move set
//   The Geyser Matron    fire/water, jelly      Rising Steam (tide): the vents fill the cavern; Earth dams it
Object.assign(BOSS_TY,{hollowshepherd:['plant'],paleweaver:['beast'],crowregent:['flying'],geysermatron:['jelly']});
Object.assign(BOSS_GIM.def,{
  hollowshepherd:{t:'veil',n:'Fold Mist',every:5,cut:.45,d:'Every few turns a pasture fog rolls over the Shepherd and it takes far less damage, until a Scan or a Light skill burns the fog off',tell:'Lantern fog gathers around the Shepherd',hit:'The Shepherd vanishes into the fold of fog'},
  paleweaver:{t:'slot',n:'Web Snare',n2:2,pct:.1,el:'ice',st:'root',d:'Silk drops on two Vanguard spots on its next turn; Guard halves the hit and stops the root, or swap a sturdier hero in',tell:'Silk threads drop toward {who}',hit:'Webs snap tight around {who}'},
  crowregent:{t:'phase2',n:'Murder Form',warn:.6,at:.5,sk:[['Black Squall','wind',1.3,'all','mag',[['blind',.5]]],['Beak Storm','shadow',1.9,'one','phys',[['bleed',.6]]],['Carrion Call','shadow',1.1,'all','phys',[['weaken',.4]]]],d:'At half HP the Regent bursts into a murder of crows: new moves and its shield back. Save a weakness hit for after',tell:'The Regent\'s coat begins to come apart in black feathers',hit:'The Regent bursts into a murder of crows'},
  geysermatron:{t:'tide',n:'Rising Steam',every:3,max:3,spd:.05,dmg:.08,d:'Steam fills the cavern every few turns: heroes without Water slow down and Water skills hit harder. An Earth skill caps the vents',tell:'The vents begin to shriek',hit:'The steam thickens'}});
