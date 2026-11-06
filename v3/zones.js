// ===== zones.js (v0.4.0): zone data: realms, campaign stages, stage levels, quests and bounties (split out of data.js) =====
// =================== ZONE DATA (realms, campaign, quests and bounties). Split out of data.js ===================
// =================== REALMS & CAMPAIGN ===================
// A campaign is 5 stages: Verdane first, three of the four middle realms in random order, the Hollow Star last.
const STAGE_LV=[[2,7],[8,14],[15,22],[23,30],[31,38]];
const STAGE_BOSS_LV=[8,16,24,32,40];
const ORD=['first','second','third','fourth','last'];
const ZONES=[
 {n:'Verdane Meadows',town:'Hollowmere',theme:'meadow',mat:'moss',dungeon:'Verdane Barrow',pool:['mossling','gustimp','dewtoad','cinderpup'],
  intro:'The Meridian Light that keeps the sky of Aurelis bright has begun to gutter. In Hollowmere the lamp-keepers say the beacon in the old barrow beyond Verdane Meadows has gone dark, and a Scourge sealed the eastern gate. You and two companions set out with torches and borrowed swords.',
  win:'The Scourge falls. In the barrow the beacon coughs, then catches, and the seal on the eastern gate cracks open. A gold thread of light points onward.',
  npc:[['Lamp-keeper Odo','The barrow lies somewhere in Verdane Meadows. Find its door, beat what lives inside, and the east gate seal will break.'],['Farmer Bess','Stick to the dirt road if you want a quiet walk. The tall grass is where the critters hide.'],['Old Tamsin','Single-element folk master their one gift. Those born with two get strange, mixed arts instead. Rare as hen\'s teeth, they are.'],['Child','You can only swap heroes in from your roster while you are in town. My brother tried it in the field and got eaten. Sort of.']]},
 {n:'Saltglass Coast',town:'Port Cerise',theme:'coast',mat:'shell',dungeon:'Drowned Grotto',pool:['crawler','gull','tidewisp','shellguard'],
  intro:'Port Cerise sits where the road meets the Saltglass Coast. The harbor lamps are out and the tide runs the wrong way. Past the glass dunes, the beacon sleeps in a drowned grotto.',
  win:'The grotto drains with a sigh. The beacon blooms underwater, and the coastal gate swings open.',
  npc:[['Harbormaster Quill','The grotto mouth is out on the dunes. Bring someone who throws sparks. Water hates lightning.'],['Net-mender Ama','Mark a foe with water, then hit it with lightning. They call that Conduct. Very rude to the fish.'],['Sailor Brin','A rare wayfarer sometimes drinks at the Flagon. Two elements at once, they say. Costs a fortune.'],['Gull-watcher','Glass Gulls go blind-diving at your eyes. Keep a Remedy handy.']]},
 {n:'Emberdeep Caverns',town:'Ashgate',theme:'cave',mat:'ore',dungeon:'Emberdeep Forge',pool:['magmaslime','cavebat','ashwraith','slaggolem'],
  intro:"Ashgate is a city carved inside the mountain, and its forges have been cold for a week. Miners talk of a voice in the deep forge, slow and patient and hungry.",
  win:'The deep forge roars back to life and the beacon flares in its heart. The cavern gate grinds open.',
  npc:[['Forgemaster Hild','Water drowns flame and wind wears down stone. Mark with one, finish with the other.'],['Miner Dolt','Burn is nasty. Slows your swing and eats your skin. Healers can Purify it.'],['Ash-sweeper','Bats down there go for the eyes. Blind archers miss a lot, funny that.'],['Scholar Pell','Ward blocks a whole hit, no matter how big. Save it for a Scourge\'s big swing.']]},
 {n:'Frostmere Pass',town:'Kestrel Hold',theme:'snow',mat:'shard',dungeon:'Frostmere Ice Halls',pool:['frostwolf','snowharpy','yeti','iceknight'],
  intro:'Kestrel Hold has kept the pass against the snow for three hundred years, but lately the snow has started keeping them. The beacon is buried in the Ice Halls above the pass.',
  win:'The Ice Halls ring like a bell. The beacon steams and sings, and the pass gate thaws open.',
  npc:[['Captain Rusk','Scourges and Calamities crack when you keep hitting their weak spots. Watch the shield pips. When they break, so does the beast.'],['Hunter Ilse','Wolves bleed you, Yetis stun you. Bring Remedies or a healer who can Purify.'],['Old Sentry','A Taunt on a sturdy knight saves lives. Let the big ones hit the big ones.'],['Novice','Fire melts ice. Everybody knows that. Fire on a frozen foe? That\'s a Melt. Nearly double.']]},
 {n:'Stormcrown Heights',town:'Skyhaven',theme:'heights',mat:'feather',dungeon:'Storm Spire',pool:['thunderhawk','stormling','gargoyle','cloudray'],
  intro:'Skyhaven is a town of floating islands, rope bridges and windmills. Its beacon burns wrong at the top of the Storm Spire: pale, edged in violet.',
  win:'Lightning drains from the spire and the beacon steadies. The sky bridges lower into place.',
  npc:[['Bellringer Moss','The Spire was a temple once. Now the storm lives in it.'],['Windmiller','Skyshapers turn your feet to stone. Rooted heroes cannot switch out, so plan ahead.'],['Pilgrim','Earth grounds lightning. Old wisdom, still true.'],['Kite-maker','Storms ride the wind. Mark with wind, strike with lightning, and watch it jump between them.']]},
 {n:'The Hollow Star',town:'Lantern Rest',theme:'void',mat:'dust',dungeon:'Hollow Star Sanctum',pool:['voidspawn','eclipsewraith','stareater','huskguard'],
  intro:'Lantern Rest is a camp of tents and lanterns at the foot of the road to the Hollow Star, where the sky has gone out entirely. Whatever waits in the sanctum has been drinking the light for a very long time.',
  win:'The darkness unravels and the stolen light pours out. Across Aurelis every beacon blazes at once, and the Meridian returns, steady and gold.',
  npc:[['Lantern-keeper Sol','Whatever sits in the sanctum, it is no mere Scourge. They call it a Calamity. Bring your best six.'],['Weary Knight','Might cancels Weaken, if you are quick.'],['Mapmaker','I saw a star fall up once. Then it fell down. Then it ate a man.'],['Child','Are you the ones who lit the beacons? Mum says you might be.']]}
];
const GIFT_LINE=['Kael, the orc who has been following you for two days, finally says yes.','Sylva steps out of the reeds, mud to the knees, and asks to come along.','Gorm cracks his knuckles, laughs, and falls in beside you.','Dagna shoulders her hammer and joins your muster.','Astra, born of the eclipse, steps out of the fading dark and joins you.'];

// =================== QUESTS & BOUNTIES ===================
const ELITE_TITLES=['the Old','the Scarred','Ironhide','the Hungry','Bloodmoon','the Unbroken','Grimtooth','the Roamer','Stormborn','the Patient'];
const ELITE_MODS=[
 {k:'regen',n:'Regenerating',d:'Heals 8% each turn.'},
 {k:'thorns',n:'Thorned',d:'Physical attackers take 15% of the damage back.'},
 {k:'frenzy',n:'Frenzied',d:'Acts twice every third turn.'},
 {k:'warded',n:'Warded',d:'Gains a Ward every few turns.'}
];
const ARENA=[
 {n:'Bronze Pit',min:1,waves:3,lvs:[9,12],rec:12,reward:{gold:400,mat:2}},
 {n:'Silver Ring',min:2,waves:3,lvs:[17,20],rec:20,reward:{gold:900,mat:3,charm:1}},
 {n:'Golden Coliseum',min:3,waves:4,lvs:[27,30],rec:30,reward:{gold:1800,mat:4,charm:1}},
 {n:'Champion of Aurelis',min:5,waves:5,lvs:[45,48],rec:48,reward:{gold:5000,mat:6,charm:1,core:2}},
 {n:'Eclipse Gauntlet',min:5,waves:5,lvs:[50,54],rec:52,reward:{gold:8000,mat:8,charm:1,core:3}}
];
// Nightmare Echoes: 50 for Scourges and 56 for Calamities, or the party's average +5 / +8 if that is higher (Beta v0.3.0)
// Scourge echoes hit harder than before (Beta v0.3.0): 2.0x HP and 1.3x power; Calamity echoes keep 1.7x and 1.15x
function echoSpec(k){return {stage:4,kind:'echoBoss',key:k,lv:echoLv(k),hpM:FINALS[k]?1.7:2,powM:FINALS[k]?1.15:1.3};}
function echoLv(k){return echoLvRule(FINALS[k]?ECHO_LV.sanctumFinal:ECHO_LV.sanctum,G&&partyChars().length?partyHi():0);}
