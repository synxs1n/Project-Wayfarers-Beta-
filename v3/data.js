// ===== data.js (base): GAME_VERSION, elements, the type chart, reactions, statuses, attributes and class growth =====
// =================== VERSION ===================
// The one public version string. Patch (0.1.x) for fixes and balance, minor (0.x.0) for new systems.
// Save keys (aurelis-wayfarers-v3, its slots, aurelis-meta-v1) and db schemas are separate and never follow this.
const GAME_VERSION=typeof APP_VER!=='undefined'?'Beta v'+APP_VER:'Beta v0.4.5';
const CHANGELOG=[
 ['Beta v0.9.7',['Clearer battles: each foe shows its one key weakness (one your party can set up a reaction with, when there is one); tap it for the rest, or turn on Expert battle info in Settings to see everything. Damage types are now Physical, Ranged and Magic (plus Heal against undead), with at most two weaknesses and two resistances shown. Reactions hit harder on screen: a flash, a name banner, a new sound and a camera punch, and the primed badge pulses when your hero can set it off. Cues tell you what to do: Guard! before a telegraphed hit, Interrupt when a foe winds up, Cleanse when a hex stacks.']],
 ['Beta v0.9.6',['Fewer, better fights: random battles are much rarer and fields now have visible roamers (including each realm\'s foe roles) you can choose to fight or sneak up on; fights pay more, so a journey still ends around level 40. Every Scourge and Calamity has its own realm gimmick that it telegraphs a turn ahead (rising tide, lava vents, a lightning rod, a blizzard, broods of adds, a phase change at half health and more) with a clear answer. Tamed companions grow: a second skill after 12 battles and an evolution after 30. New journeys unlock systems realm by realm (reactions and bonds in the second realm, camp and guild missions in the third, the Echoforge in the fourth); saves you already have keep everything.']],
 ['Beta v0.9.5',['Menus simplified: one Notice Board with Quests, Guilds, Bounties and Arena tabs (claimable first), reachable from the board, the Guild Hall and the Menu. Guilds now have three ranks with one line each (nothing you claimed is lost; some perks open sooner). Every gear slot has an Upgrade button that picks the best next step you can afford (equip a spare, buy, forge, temper or Echoforge) with Show all options for tinkerers; the Smithy shows the best upgrade per slot first. Build Party and Equip best come first on the Party and Equipment tabs.']],
 ['Beta v0.9.4',['Momentum is simpler: doing something different fills the gauge, repeating the same move or only attacking drains it. Fill it to get a Surge (heroes deal 15% more and take 10% less); let it run empty and the party is Drained (10% less dealt, 10% more taken) until you mix it up again.']],
 ['Beta v0.9.3',['Battle screen on phones: the action menu has bigger buttons and fills the space under the battle view, with the party and foes below it (scroll down to see them; the commands always show in full on each turn). Phones turned sideways and other short wide screens now get a layout that fits: battle view, log and party on the left, commands with full labels and the foes on the right, nothing cut off. Hero health bars keep their distance from the foes, and heroes in battle are drawn at the same size and pixel look as the foes.']],
 ['Beta v0.9.2',['The Scourge lair is now part of the land: a rock mound of the realm\'s own ground (frozen rock with icicles, basalt with ember cracks, earth and roots, sandstone, wet rock) with a dark cave mouth dug into it, claw gouges, bones, torches, a broken banner of the Scourge and a faint plume of its light; no flat tower or lettering. It still has its own Lair icon on the map and turns gold once relit. Also fixed the HD-2D world lighting: snow fields and other scenes are no longer washed out.']],
 ['Beta v0.9.1',['Title music plays again: the game used to wait for your first tap before starting any sound, and on the title that tap was usually Continue. Sound now starts at launch where the device allows it (the Android and Windows apps after installing the new APK or installer); in a browser the first tap starts it.']],
 ['Beta v0.9.0',['Title screen: the six wayfarers are now drawn like they look in the world, the same size and pixel look as the overworld, so the scene reads as a journey across each realm; every realm has a fuller foreground and the night scenes no longer show a flat dark band.']],
 ['Beta v0.8.9',['Battle screen on the Galaxy Fold: open, the battle view now fills the left side as large as the screen allows, with the foes moving beside the commands when there are few, and no empty space at the bottom. Closed (and other phones), the commands now come right under the battle view with every row on screen, the acting hero\'s HP and MP sit in the command header, and the party cards follow below. The last row is no longer hidden under the phone\'s navigation bar.']],
 ['Beta v0.8.8',['Dungeons now match their battle backdrops: ice caverns with icicles, crystals and frost, volcanic deeps with lava pools and glowing cracks, sea caves with tide pools, root grottos with glowing fungi, crypts, sandstone halls, keeps and astral vaults. Caves get natural cavern walls instead of square rooms. The Scourge lair entrance on the field is now unmistakable: a dark tower with a beacon and the Scourge\'s banner over a skull gate, with its own Lair icon on the map, and it turns gold once the realm is relit.']],
 ['Beta v0.8.7',['Cloud saves between the phone, Windows and the web now keep the newest one: leaving a device saves your progress and uploads it right away, Continue waits a moment for the cloud check (or tap Use this device now), a window left open checks the cloud again when you come back and every minute, and if two devices really differ you choose which to keep (both are kept). Device clocks no longer decide which save is newer. The Windows close fix arrives with the next installer.']],
 ['Beta v0.8.6',['Fog and weather fixed: no more clear boxes around characters in battle (fog banks had hard square edges), and only a hero\'s face is kept clear of weather instead of a whole box. World fog drifts with the ground, darkens at night and thickens with distance. Softer wet floors and heat haze in battle. New title screen: six wayfarers walk together while the realms change behind them (fields, misty forest, snow, desert, volcano, coast, town at dusk, the heights at night), with the compass emblem beside the WAYFARERS wordmark, and all six always fit the window.']],
 ['Beta v0.8.5',['Battle screen fits every phone and the Galaxy Fold open or closed, with no scrolling: Attack, Skills, Items and Guard are always on screen at each turn, the foe list never gets squeezed away, and wide screens put the turn order and party beside the stage. New damage type symbols (slash, blunt, pierce, ranged, magic, heal): foe cards show which damage types each foe is weak to or resists, next to its elements. Fixed the battle start animation showing only the top left corner zoomed in, and foes no longer shift around before the battle starts.']],
 ['Beta v0.8.4',['Secondary roles: every class now has a main role and one or two backup roles, with new skills and gear for them. Bards sing a magic damage song and stronger healing songs, so they can stand in for a mage or healer; Thieves throw stars and kunai that hit flyers; Monks meditate to heal and buff; Warriors can taunt and debuff; Knights rally the party; Mages and Archers hinder foes; Healers bless. New role gear: war hammers, war standards, throwing stars and kunai, prayer beads, wands, censers and lyres, plus six role charms. Build Party counts backup tanks and healers as half a role. Pacing: a bit more encounters and XP and the first Scourges eased, so a first journey ends around level 40 in about 4.5 to 5.5 hours.']],
 ['Beta v0.8.3',['Chests open again: the lid pops with a glint, the open chest stays while you read what you found, then it fades away. The chest and item sounds are softer. The Equipment tab lists only your party (gear your reserves with Equip best: reserves or from their sheet).']],
 ['Beta v0.8.2',['Personal quest rivals whose wayfarer is not in your six now show see through on the map, with a hollow star on the minimap. You can walk through them and they will not fight; talk to one to learn who it waits for (with their portrait). Bring that hero into your party and it stands solid and fights as before. The Quests tab, Guild Hall and What next? say who is needed. Leaving the rewards screen no longer plays a sound (the victory theme is enough).']],
 ['Beta v0.8.1',['Best Party is now Build Party, since it offers several parties. The Training team now takes your lowest level heroes, and only brings a higher one when nobody lower can be the tank or healer (and then the lowest one who can). Areas with flying foes now bring a real ranged attacker, an Archer first: lances and spells only half answer flyers.']],
 ['Beta v0.8.0',['Weather overhaul: rain, storms, snow, blizzards, fog, gales, sandstorms, heat, ashfall, auroras and starfall now come in layers with depth in the world (2D and HD-2D) and in battle: puddles and splashes on wet ground, lightning that lights the scene (gently, never strobing), drifting fog banks that walls hide, settling snow and ash, heat shimmer. Old visuals updated: the Victory crest in the new lettering, a sunlit colosseum for the Arena, and a shaded minimap.']],
 ['Beta v0.7.9',['Wide battle screen (Galaxy Fold open, tablets, desktop): everything now fits without scrolling. Under the stage, the commands sit on top with the foes right below them, and the party sits beside them, Vanguard then Rearguard, one hero per row. Command buttons widen and wrap instead of cutting words, aim tags and foe cards no longer cut off text, and boss fights put the boss bar beside the turn order to save room.']],
 ['Beta v0.7.8',['Every wayfarer now has their own voice when they challenge you on the road: their own opening, a line if you decline, a shout at half health, a line when they lose and join, when you fall and when you run. Bonded heroes in your party answer them, personal quest rivals and the legends get their own lines too, and Guild Hall challengers say their piece.']],
 ['Beta v0.7.7',['Guild missions now count what you already did on this journey, so a mission you have already done can be claimed as soon as you accept it. Detonator hints in the skill list are now just element symbols (hold or hover for the words). No more blue flash when you tap the screen to move.']],
 ['Beta v0.7.6',['Tap to walk: tap a spot you have already explored on the map or minimap and your hero walks there (stops in front of doors and exits, stops on any input or an encounter). Fixed being unable to walk next to the Alchemy door in Hearthholm: bushes, chests and signs hidden behind walls in the HD-2D view still blocked the way. Every map type was swept: nothing invisible blocks you any more, door fronts stay clear, and gaps in building walls are filled.']],
 ['Beta v0.7.5',['Battle: a turn order bar shows who acts next (and where your chosen skill puts you); foes you have studied show what they plan to do next, and they really do it. Detonating a reaction gives the hero back some MP. Swapping a Vanguard hero with a Rearguard hero is free once every 3 turns. A Momentum gauge rewards mixing up your actions (+10% damage, -10% taken in the zone) and overheats if you repeat yourself. Foes now have roles that punish one mistake each: Shieldbearers protect allies until broken, Hexers stack a curse you should cleanse, Chargers wind up a big hit you should Guard, Leeches drain an unguarded Vanguard, Skirmishers punish never swapping. Scourges telegraph a Cataclysm. Timed hits are a new option in Settings (off by default): tap on the ring for +15% damage or 15% less damage taken. Fixed the taming tip flashing on and off over the rewards window.']],
 ['Beta v0.7.4',['New title screen: your wayfarers in their current look around a campfire at dusk on the road to a walled town, lit by the fire, with embers and stars and a new lineup every so often. New Wayfarers wordmark on the title and in the header, and a new compass emblem as the app icon (Android, Windows, browser tab and home screen).']],
 ['Beta v0.7.3',['Tips: each system now explains itself in one short card the first time you really meet it (your first primed foe, first shield, first tame, first Camp Supplies and so on), one at a time, never over faces in battle. Got it closes it, More opens Guides > How it works. What next? lists things you have but have not tried yet. Settings has Tips on or off and Reset tips.']],
 ['Beta v0.7.2',['Pacing: the first realm no longer throws every system at you. Guild missions and Tempering open after the first Scourge falls (a journey that already tempered gear keeps it), the Tamer\'s Stick quest goes up in the second realm, and personal quests open in the third realm. The Rearguard now earns the same XP as the Vanguard, so your six stay about the same level.']],
 ['Beta v0.7.1',['The front three of your party are now the Vanguard (the back three stay the Rearguard). Catch up XP is much bigger for heroes far behind your top wayfarer (+38% at 2 levels, +125% at 5, up to +300% at 10 or more), so swapping heroes in pays off fast. Auto battle and Run are now remembered between plays and updates. Quest lists put quests you can claim first, then active ones. After Best Party, Equip best gear shows as done once used.']],
 ['Beta v0.7.0',['Battle screen rehaul: HP plates, element badges, status rows and damage numbers are laid out so none sit on a face or on each other; the last log line sits under the stage; commands are grouped (Attack, Skills, Items, Guard / Scan, Lore, Switch, Flee / Auto); the active hero is framed in gold and cards are more compact. The battle start flash now covers the whole screen instead of one corner. Detonators: while aiming, the foes they will set off glow with a ring and a tag naming the reaction, and the reaction floats over the foe when it fires.']],
 ['Beta v0.6.9',['Shops and menus reorganised: every shop has Shop and Craft tabs with All plus sections (Alchemy now has its own Charms section), every filter is a dropdown with new options (for one hero, rarity, upgrades only, can afford, cheapest first), and the Menu is grouped as Party, Backpack, Quests, Map, Records, Guides and Settings. Fixed text cut off at the bottom of menus on phones with a browser bar (Fold Tempering).']],
 ['Beta v0.6.8',['World: fortresses stand up as real gatehouses in the HD-2D view; leaves, butterflies, snow and other drifting effects now stay in the world instead of sliding with the screen; nothing hovers over the hero\'s face any more (fixed the white and pink boxes left over in parts of the screen); opened chests disappear; the world map is now a parchment chart with little pictures of each town, field, dungeon, cave and fortress, roads between them and a pin for your party; side fortresses are just called fortresses.']],
 ['Beta v0.6.7',['Capes no longer show on hero sprites (they keep their stats); only weapons and personal quest rewards change how a hero looks. Every item now has its own icon: each weapon, armor and cape changes shape as its tier rises (gems, gold trim, a glint, a glow), every charm has its own pendant, and materials have icons too. The three legendary signature weapons got their names back.']],
 ['Beta v0.6.6',['Daily Trial weekly twist: each week brings one rule change for the trial (this week: Weak spots hurt more), shown on the entry screen and as a chip in its battles; the trial stays the same for everyone on the same day. New Game+ modifiers: when starting a new cycle you may pick up to two (Foes hit harder, Cold inns, Elites everywhere, Reactions only, Ironman), each trading risk for more XP or gold.']],
 ['Beta v0.6.5',['Taming log: Records > Bestiary shows Tamed X of Y, where seen foes roam, and silhouettes for the ones you have not met. Bond goals: hero sheets and a new Bonds page show how many wins side by side until the next campfire talk or joint tech, with a notice when a talk is ready. Make camp (from the third realm, Camp Supplies at Alchemy): rest in the field for a small heal and pick one boon for the next 3 battles, then listen to ready campfire talks.']],
 ['Beta v0.6.4',['Names: heroes outside your party are now your Reserves, and the back three of the party are the Rearguard. The button is now Equip best: reserves.']],
 ['Beta v0.6.3',['Best Party now offers several formations (Balanced, Boss ready, Fresh mix) chosen for role balance over raw level and gear, plus a Training team that brings lagging heroes along with a strong tank and healer. Catch up XP now measures against the highest level hero on your whole roster. New Equip best: at camp fills out heroes outside the party from spare gear without touching the party. Legendary tags are now only for heroes with legend quests (Kaevan, Nikaris, Jaeson); other rare heroes show Epic.']],
 ['Beta v0.6.2',['Characters now belong to the HD-2D world and battle scenes: they take the light around them (sunlight, moonlight, a torch at their side, lava glow, spells), the scene\'s colour grade, fog in the distance and a soft rim light, and stand on a soft shadow instead of a hard dark bar. In the world they are drawn at a size that fits the rooms and streets. Fixed a pale line under the hero and tinted boxes around glows and shadows.']],
 ['Beta v0.6.1',['A clearer victory screen. A beaten foe you can tame now comes first, and pressing Continue without deciding asks whether to tame it or leave it behind. Gold, experience, materials and finds sit in a compact grid, and every hero in the fight shows the experience they gained, their catch up bonus, and any level up with points to spend. Wayfarers met on the road or won in a duel are no longer labelled Legendary; that label is kept for the legendary heroes. The save note no longer sits on the logo while a window is open.']],
 ['Beta v0.6.0',['A simpler title screen: Continue comes first when you have a journey, then New journey and the Daily Trial; Settings and Help sit in a small row, and Import, Recover and Redeem are grouped under Saves and codes. No more export reminder after every update: your saves are kept on your account, and Export is still in the Journey tab. Titles, banners and labels now use clean, smooth lettering instead of the pixel font, so numbers like 5 and S no longer look alike. Choosing a target no longer draws a box: the foes you can pick glow, with their name and a small hint above them.']],
 ['Beta v0.5.9',['A primed foe now shows a small floating element badge with the turns left, in place of the large PRIMED chip and the glowing sphere; tap it for the full explanation, which is also on the foe card. The HD-2D world keeps much more of the screen in focus: the sharp band around your party is wider, the blur is gentler, and the near side of the view stays almost sharp.']],
 ['Beta v0.5.8',['Fix: on the battle stage, a fighter standing in front no longer covers another fighter\'s element badge or HP bar, and falling rain and snow no longer hide them. Bars, shield pips and element badges now always draw on top.']],
 ['Beta v0.5.7',['Fix: heroes, townsfolk and monsters in the HD-2D world no longer look sliced and smeared; they now show with their full detail.']],
 ['Beta v0.5.6',['The world is now a lit diorama on Medium and High graphics: a tilted camera follows your party over maps where walls, cliffs and houses rise from the ground with gabled roofs and lit windows, props stand upright, water sits low and lava glows. Lamps, torches, windows, braziers and crystals light the ground around them, the sun casts soft shadows, fog gathers in the distance, and bloom, a tilt-shift focus band, light shafts and colour grading follow the time of day and the weather. Anything that stands in front of your hero thins out so you never lose sight of them. Settings > HD-2D world turns it off; Low and devices without WebGL keep the classic view.']],
 ['Beta v0.5.5',['Battles take place on lit, dioramic stages: a perspective floor that is sharp where the fighters stand and softens toward the horizon, a blurred background with glowing highlights, torches, braziers, lava and moonlight that light the ground, soft shadows, a colour grade that follows the time of day and the weather, and boss stages with braziers and a glowing rune circle. Every element has its own spell effect with light (fire tongues, shattering ice, a lightning bolt from the sky, a water geyser, earth spikes, a wind funnel, a beam of light, a shadow vortex), and Limit Breaks get a spotlight. Medium keeps the frame rate of before; High lights the fighters too; Low and devices without WebGL keep the classic stage.']],
 ['Beta v0.5.4',['Heroes, townsfolk and monsters are drawn at twice the detail: smoother outlines, six step shading with light from above, rim light, catchlights in the eyes, sheen on hair and metal, folds in cloth and textured fur, plates and feathers on monsters. Heroes stand a little taller. On the Low graphics setting the world and battle views keep their old resolution so slower phones stay smooth.']],
 ['Beta v0.5.3',['A new look for menus and screens: night blue panels with gold borders and corner ornaments, a gold tab strip for the menu groups, a battle command menu with a lit cursor, framed portraits, glossy bars, a framed title screen and a grander Victory screen. Every button and tab is now at least 40 pixels tall on touch screens, text contrast is checked on every main screen, and reduced motion turns the transitions off.']],
 ['Beta v0.5.2',['Fix: on a Galaxy Z Fold opened (and any screen where the map view comes out exactly 300 pixels wide) the map no longer shrinks to a small box after a battle.']],
 ['Beta v0.5.1',['A graphics upgrade: soft light from lamps, windows, torches and spells, shading and depth, water that glints, grass that sways, leaves, dust, birds and critters, a battle camera that pushes in on big hits, richer element effects and victory hops. Settings has a Graphics option (Auto, Low, Medium, High); Auto picks what your device runs smoothly, and reduced motion keeps everything still.',
  'A Quest Board quest or Guild mission that is ready to hand in is announced, and the Menu button and Quests tab show how many are waiting. New skills are listed first on the victory screen. Status symbols sit under the name in the Party menu. Tempering explains close choices and opens faster with a full pack.',
  'The Android app now picks up every update, including fixes that keep the same version number, and never goes back to an older version. The website offers the same.',
  'Fixes: the map view no longer stays small after a battle on foldables and wide phones; a beaten Mimic no longer comes back when its chest had been moved off a path; hints during a battle no longer cover the shield pips on foe cards; townsfolk no longer stand on a path after a town gate was cleared.']],
 ['Beta v0.5.0',['The game is now called Wayfarers (Beta).',
  'Fixes: the tavern no longer runs out of room in an area (four seats, a shuffle and your gold are the only limits); the map view keeps its size after battles on wide phones and when you rotate; stairs, chests, levers, props and townsfolk never stand on a corridor, road or doorway in any map, and old saves tidy themselves when a map loads; the battle menu always has a Back button; every shop screen has a back arrow; the minimap shows in every field, town, dungeon, cave and fortress; the Inn offers a bed for your wayfarers; status effects show as symbols that fit their boxes; Tempering lists what you can temper now first.',
  'Battles stand on solid ground that matches where the fight began, flying foes hover with a shadow, and bosses get their own stages. Touch a roaming foe before it sees you for a Surprise round. Gathering spots sit beside the trees, rocks, grass and water they come from. Town gates have a clear lane. Dungeon entrances look different from realm to realm. The first realm has single type wayfarers and monsters only (bosses and elites aside), and short hints that use your own party (Settings can turn them off, Guides keeps them).',
  'Shops put the best upgrades for your party first and explain close calls. The Smithy can buy, forge and equip the best gear for the whole party in one go, with a plan to confirm and Undo. Best Party reads delivery types, legal weapons and the Bestiary, says why it picked each hero, and can equip them straight away. Party and boss screens show what the team is missing and how ready it is. Holy Water can reapply itself. Items stack to 50. The first boss gives two Pork Chop Sandwiches; in a dungeon, eat two to walk back to town.',
  'Personal quests open after 40 battles together in the second realm, with no level needed. Factions are now Guilds, reachable from the Guild Hall. Heroes below the top level catch up with bonus XP. After a Scourge falls, its lingering energy tells you the Echo waits.',
  'Settings: Master, Music and Sound effect volumes with mutes. Cloud saves sync on their own. Day turns to dusk and weather changes over a few seconds instead of at once. A Save button sits in the menu header, and a small Saving / Saved note shows when the game saves.']],
 ['Beta v0.4.6',['The Android app now updates itself: it downloads each new version in the background and starts it the next time you open the game, or straight away with Restart now. Saves and sign in stay as they are. If a new version ever fails to start, the app goes back to the version it was installed with.']],
 ['Beta v0.4.5',['A full orchestral soundtrack: every track is composed around one theme, the Meridian, with strings, harp, woodwinds, brass, choir, organ and orchestral percussion. Towns and fields change with day and night, every tileset has its own field arrangement, Calamity realms get their own, and a relit realm plays brighter.','Battles, elites, Scourges and the three phase Calamity fight each have their own music. A tension layer comes in when someone is under 30% HP, boss phases add a layer, and roamers chasing you in a dungeon raise the tension too. After a normal battle the field music picks up where it left off.','Jingles for level ups, recruits, quests, faction ranks, items, inn rests and relit beacons.','New sound effects for every weapon family, element, hit, heal, buff, debuff, Limit Break, summon, boss phase and menu, plus quiet footsteps on Mid or High.','Ambience: wind, birds, crickets, waves, rain and thunder, drips, a town murmur, embers and a Calamity hum. Settings > Ambience, quiet by default.','Settings: Music style (Orchestral or Classic chiptune) and Credits. Records > Music Room plays every track you have heard.']],
 ['Beta v0.4.3',['Capes: a fourth equipment slot for every class, sold at the Smithy beside armor and shown on your hero. Boss fights were re-tuned around them.','Before you play on a new version, the game offers to export your saves as a backup.','Fallen heroes earn no XP. Wins mostly on auto pay 66% XP and gold, and auto deals 85% damage. Random battles are a little rarer at every setting and never come within 8 steps of the last one.','After a boss you stay in the dungeon; its Echo appears once you have left and come back. A big boss HP bar runs along the top of boss and miniboss fights. Echoes pay a little more.','Every wayfarer has a rival of their own. Twenty new minibosses, dealt out so a journey rarely meets the same one twice. Travel packs from traders roll their contents.','Tempering lists only what can still be tempered, rarest first. Detonator skills say which primes they set off. The Tamer\'s Stick measures against the Bestiary as listed.','Much easier early game: regular foes are softer in every realm and much softer in the first two, there are no pack tactics in the first two realms, heroes recover more HP after each win early on, the world grows tougher only half as fast in the field, and the first two Scourges hit less hard. You begin with 400 gold, gold drops are up and shop prices down. Auto now deals 85% damage and pays 66%.','Twenty-four starters (three per class, three per element) for many more starting draws. Beat a wayfarer in a duel and they wait for you at the tavern. Accept all and Claim all buttons on the Quest Board, bounties and faction missions. Back to the main menu from Settings. The Inn closes after you rest. Town gates always meet a road with nothing in the way.','Fixes: Space at the Inn no longer puts you straight to bed, and the fortress gatehouse no longer covers your hero. Personal rewards, fortress charms and The Steady Hand charm re-tuned.']],
 ['Beta v0.4.1',['Fix and rebalance pass. Fixes: challenge fights no longer freeze, mimics and props never block paths, shield pips and draw order fixed, indoor maps ignore weather, dungeon entrances and levers placed properly, fewer east exits, map back button, latest input wins, auto settings saved, Records opens on Journey.','Rules: fallen heroes stay down until revived; Poison, Curse and boss Wounds last past the fight; weapon types rebalanced against beast and armored foes; Auto is banned in elite, miniboss and challenge fights and plays simpler; parties can be smaller than six; Lore in the battle menu; weather and time tags always visible; weather now falls in towns too.','Balance: tougher packs, bosses scale toward your party level and grow with every boss defeated, echo levels follow your party, small parties face softer foes, gold and XP trimmed and prices raised.','World: sixteen realms (twelve standard, four Calamity realms), each with its own look, monsters, weather, townsfolk and quests. A living Scourge or Calamity changes its realm until it falls. Visible foes roam the dungeons, side fortresses join the side caves, and most caves and fortresses end in a miniboss. Dusk and dawn look new.','Also: wayfarer challenge wording, start with one to three wayfarers, Gear menu is now Backpack, shop and craft lists sort by rarity with filters, Craft only tag, a dynamic title screen, NPCs with more to say, a sixth faction (The Steady Hand), personal quest rewards in three slots, and new item sprites.']],
 ['Beta v0.4.0',['Bug fixes: tapping or clicking a foe now targets it (touch, mouse, keys, pad), field skills that need a target work, shield pips have their own spot, the party stops walking the moment a battle starts, dungeon stairs never block the route, and Auto reads Start auto or Stop auto.',
  'Battle: tap a rearguard hero to switch, Auto settings live in the menu as well as in battle, Undead take damage from healing, and foes have archetypes (Flying, Armored, Jelly, Swarm, Beast and more) that skills and weapons answer by delivery (Slash, Blunt, Piercing, Ranged, Magic, Heal).',
  'Menus: seven top groups with sub tabs, Forge is the new name for making gear, recipes you can make now come first, purchase animations, Pork Chop Sandwich leads back to the last town, longer dusk and dawn with their own look, starter sheets, Legacy heroes count toward the three starters, and item strength borders with tier pips.',
  'Wayfarers: 64 single type wayfarers (every class in every element), a signature skill for every wayfarer, and a new starter draw of 8 options from a pool of 16.',
  'World: one long winding field between towns, gates facing north, south, east and west with matching landings, a world map screen, and optional side caves with a special reward (a +2 piece of gear, a rare item, a challenge wayfarer or a unique charm). Old journeys keep their old maps.',
  'Dungeons: about twice as big with side branches and dead ends, the lever is far from the entrance and opens the key room, then the key opens the boss door. Required route is about 16 to 20 minutes per main dungeon.',
  'Weather: snow looks frosty on phones, and rare skies appear a few percent of the time: Blood Moon, Solar Eclipse, Meteor Shower and an Elemental Surge for every realm, each with fair effects both sides feel. The Daily Trial never uses them.',
  'Chance encounters: about once per 200 steps on roads and in caves you may meet a wayfarer who needs a potion, is being ambushed, challenges you to a duel, or trades. Helping, winning or hiring brings them into your roster without using the tavern cap, and every wayfarer you meet is logged in the Codex.',
  'Factions: Wayfarers\' Guild, Smiths\' Union, Alchemists\' Circle, Beastwardens and Archivists, six ranks each, missions in Guides and Records, modest perks and a unique charm per faction. Per journey only; your best rank is kept as a title.',
  'Under the hood: all tunable numbers live in config.js, data tables are split into their own files, dead code is gone, and fog is drawn from a cached sprite.']],
 ['Beta v0.3.5',['Wayfarers: wanderers are now called wayfarers everywhere. Each journey draws its own seeded subset of about 30 from a roster of 60+, always including anyone you already own; the Codex still tracks every wayfarer ever seen on your account.',
  'Taverns: at most 4 offers, hiring leaves an empty seat until the next shuffle, shuffles only after an inn rest or a stage clear (with a cooldown shown on screen), each town has its own pool and a limited number of tavern recruits before you move on.',
  'Natures: every wayfarer rolls one nature from a small pool that suits its class and personality. The Guild Hall Nature service rerolls within the pool or lets you pick one.',
  'Type chart revamp: elements no longer resist themselves by default; every element now has real strengths and counters. Primers, detonators and reactions work as before.',
  'Battle clarity: a loud Primed status (pulsing aura, chip with element and turns left, sound, target highlights), one new element icon set used everywhere, a purple Limit Break bar, and a legendary stamp on every Legendary hero.',
  'Starting party: you may begin with one, two or three wayfarers. The game asks you to confirm a smaller start, and you can recruit more in any tavern. Fewer heroes means a harder early game, and big bosses grow tougher for every hero short of six.',
  'Weapons and armor: each class uses 2 or 3 weapon types, each with its own perk (cleave, charge, crush, flurry, long draw, discord, soothe, tempo and more), new Monk knuckle and claw lines and Bard lute, harp and flute lines. Armor is Light, Medium or Heavy and only the matching classes wear it. Gear a hero can no longer use goes to your pack, never deleted, with a message.',
  'World: every town, field and dungeon takes its mood from the Scourge or Calamity at the end of the stage, with no spoilers. New journeys get two fields per town (the dungeon waits in the second), bigger fields with side trails and shortcuts, and bigger dungeons with loops. Journeys started on an older build keep their original map shape.',
  'Map and UI: clear icons and a legend for the Smithy, Alchemy, Inn, Tavern, Guild Hall, quest board, waystone, gates and dungeon entrances; the roster and party screens no longer overlap; the battle rewards Continue button stays in view; town props no longer float.']],
 ['Beta v0.3.4',['Save safety: a save that cannot be read is never replaced or hidden. You get a clear message with Retry and Export, and the raw data stays exactly as it was.',
  'Backups: before a version migration, an overwrite, a cleared slot, an import, a restore or a cloud pull, the old save is copied to a rolling backup (last 3 per slot).',
  'Recover Saves (title screen): finds every save, backup and stray slot on this device and in your account, shows heroes, progress and times, and restores any of them into a slot you pick.',
  'Export and Import: every slot exports as a code or a file, and imports check the save and ask before replacing anything. Use it to move a journey between devices or links.',
  'Account saves: signed in players get cloud saves per slot with the last three versions kept, background sync, a sync icon, Sync in the Journey tab, and a choice when this device and your account differ. Visitors stay local with an Export reminder.',
  'Saving to this device now tells you when it fails instead of failing silently.']],
 ['Beta v0.3.3',['Bug fixes: the party can no longer walk through town buildings, heroes no longer look like they stand on roofs, the Smithy cannot get stuck on a failed redraw, and the battle scene keeps a fixed shape on wide phones instead of stretching.',
  'Battle screen: every hero and foe card shows name, level, element symbols (a distinct shape per element), HP and MP bars with numbers, and a status row that is never covered. Tap or click any unit for a full detail panel.',
  'Equipment: Auto best gear (party) may take from heroes outside the party, Equip best for everyone balances the roster, and the per-hero Auto never takes from anyone. All of them handle companions and show a summary with Undo. "Best for" now lists every party member an item helps, ranked, with stat arrows.',
  'Party tools: team loadouts (8 slots), a Best Party suggestion, field skills (heals, cures, revives outside battle), XP to next level bars, sorting and filters for Party, Roster and Codex, and the Guild Hall no longer handles the party.',
  'Town: the Inn opens on Rest with no scrolling. Bonds and campfire scenes moved to each hero\'s sheet. Tap the weather or day and night tag to see what it does here.',
  'Endgame: the Echo Sanctum, a hall of sixteen Echo gates, replaces the Echo Rift once all five story Echoes are beaten.',
  'Offline: the game is fully self contained and keeps playing and saving with no connection. Bestiary, Codex and report writes queue and sync safely when you are back online.']],
 ['Beta v0.3.2',['Battle text is smaller and floats over the unit it affects, stacked so nothing overlaps, and stays up longer. The top banner is now a thin strip for big moments only.',
  'New skill notices: "<Hero> learned <Skill>!" on the battle results and as a small toast in the world, with a New badge on the hero sheet.',
  'Companions show their exact bonuses, and every monster family adds a small perk (crit, speed, ailment ward, thorns or mending).',
  'Leveling is about 15% slower. Battles won mostly on auto pay 66% XP and gold (drops unchanged). Auto is locked on a boss until you beat that exact fight by hand once.',
  'Echoes reworked: beat a Scourge or the Calamity and an optional Echo of it lingers in its dungeon. Beat all five and every Echo in Aurelis unlocks for your account. The Echo Rift at any waystone opens after the Calamity.',
  'New: Echo Shards and Echo Essence, and six Echoforged weapons at the Smithy.',
  'New: a full map and a minimap with fog of war (Map button, N, or Y on a pad).',
  'Animation pass: swings, thrusts, bow draws, dashes, casts, songs and channels; foe telegraphs; boss phase flourishes; summon entrances. A Motion setting trims it all to simple flashes.']],
 ['Beta v0.3.1',['Fixed: the Arena could not be challenged. Fixed: the Party Sheet button. Menus and the gear picker keep their scroll and focus when you spend a stat point.',
  'Party rows now show portrait, level, class, HP and MP bars with numbers, elements and a KO or status marker. The battle log lists newest first, status icons never overlap, and floating numbers stay up longer.',
  'Auto battle can now switch heroes in and out (with a short cooldown, shown in the banner). Resting at the inn fades out with a rest chime.',
  'Towns: every building has its own roof color, shape and props, with big signs, and the quest board has a marker.',
  'New: an Equipment menu, Auto best gear with undo, an optional Auto equip new gear setting, and Best for tags with an Equip this now? prompt after buying, crafting or winning gear.',
  'New: Tomes for mages, the Faith stat for healers and chroniclers, and descriptions for every stat and class.',
  "New: the Tamer's Stick. It grows stronger with every Bestiary entry and starts to glow; a Guild Hall quest hands it over.",
  'New: day and night. Time moves as you walk and fight; at night some field foes change and all are a bit tougher. The inn sets it to morning, tents pass some time.',
  'Weather now lasts a while, follows you between a realm\'s town and field, and is clear most of the time.',
  'New: Mimics hide in some dungeon chests. Watch for a wiggle and a red glint.',
  'Tamed monsters are now Companions: pair one with each hero for a bonus, and Summon it once per battle for 3 turns. Old saves convert automatically and return their gear.',
  'Guild Hall challenges now rotate after an inn rest or a cleared Scourge, with four new heroes to earn. Accepted challenges stay posted.']],
 ['Beta v0.3.0',['Fixed: dungeons could trap you when the lost wayfarer stood in the only corridor. Every dungeon is now checked when it is built (key before the boss door, lever before the vault, every chest, the stairs), and decor never sits on or beside the way forward. Saves stuck today are freed when you load.',
  'New: a Stuck? button in the menu while you are in a dungeon. It walks the party back to the entrance for free.',
  'Limit Breaks open at level 15 for every hero, with no other condition. Limit I is a lighter version; at level 30 it becomes Limit II, a new and stronger move.',
  'The level cap is 50. A normal journey ends around level 38 to 42; levels past 40 come from New Game+, Nightmare Echoes, the new Eclipse Gauntlet arena tier and the Calamity rematch.',
  'Every class and Legendary hero learns two new skills in the 40s and a level 50 capstone.',
  'New Game+ foes gain 3 levels per cycle. The Calamity and the Nightmare Echoes rise to meet a party above level 40.']],
 ['Beta v0.2.0',['Battles are easier to read: damage numbers by type, a scrollable battle log, and status icons you can tap for details.',
  'Matchups show on every target before you strike (Weak, Neutral, Resists, Immune). Hidden quirks and Scourges stay a mystery until you hit or scan them.',
  'The Bestiary grows with you: Seen, Studied and Mastered entries, plus small permanent perks for hunting the same foe.',
  'Every popup has a back arrow next to the X. Party swapping is now tap one hero, tap another.',
  'The Forge is now Tempering: each upgrade needs ore or logs, a monster part and a realm relic. Buy what you are missing right there.',
  'Skills arrive about every 3 levels. Limit Breaks open at level 15 and personal quests at level 20, both after the second town. Skills you already learned stay learned.',
  'Dungeon entrances sit further from the town gate.',
  'The Journey tab has a pinned Save button, Scourge progress, and new stats including steps walked.']],
 ['Beta v0.1.0',['The Smithy now handles every weapon and armor need: buying, selling, forging, crafting gear, and ore, wood and monster parts.',
  'The Workshop is now Alchemy: potions, tonics, charms, Holy Water and tents, plus herbs and brewing.',
  'New: Pork Chop Sandwich (tavern). A sure escape in ordinary fights, or a quick walk back to a dungeon\'s entrance.',
  'New: Holy Water (Alchemy). Keeps random battles away for about 150 steps.',
  'New: Tent (Alchemy, or craft one). Rest in the wild for 60% HP and MP. Pick your campsite carefully.',
  'Version numbering restarts at Beta v0.1.0. Your saves carry over untouched.']]
];
// =================== ELEMENTS ===================
const EL={fire:'Fire',water:'Water',earth:'Earth',wind:'Wind',lightning:'Lightning',ice:'Ice',light:'Light',shadow:'Shadow'};
const ELK=Object.keys(EL);
const ELC={fire:'#e8553a',water:'#3f8fe0',earth:'#b08a4a',wind:'#5fc9a0',lightning:'#f2c93a',ice:'#8fdcf0',light:'#f6e7a8',shadow:'#9a6ae0'};
// Matchup chart (v0.3.5 revamp): attacker -> {strong: x2, resisted: x0.5}. No immunities.
// Self matchups are no longer automatic. Only Fire, Ice and Shadow resist themselves (flame cannot burn flame, frost cannot chill frost, dark
// cannot darken dark). Water, Earth, Wind and Light take neutral damage from their own element. Lightning is WEAK to itself (it arcs through
// a conductor). Light is the glass element (no resistances) and Earth, Ice and Water are the sturdy ones.
const CHART_DEF={
 fire:{s:['ice','shadow'],r:['fire','water','earth']},
 water:{s:['fire','earth'],r:['ice','shadow']},
 earth:{s:['lightning','fire'],r:['wind','water']},
 wind:{s:['earth','fire'],r:['lightning','ice']},
 lightning:{s:['water','wind','light','lightning'],r:['earth']},
 ice:{s:['wind','water','earth'],r:['ice','fire']},
 light:{s:['shadow','ice'],r:['fire','lightning']},
 shadow:{s:['light','lightning'],r:['shadow','water']}
};
const CHART={};ELK.forEach(a=>{CHART[a]={};ELK.forEach(d=>{CHART[a][d]=CHART_DEF[a].s.includes(d)?2:CHART_DEF[a].r.includes(d)?.5:1;});});
// Dual-type defenders: matchups combine on a soft curve so nothing reaches x4.
// both weak -> x2.5, weak+neutral -> x2, weak+resist -> x1, resist+neutral -> x0.5, both resist -> x0.35
const DUAL_MAP={4:2.5,2:2,1:1,.5:.5,.25:.35};
const CAP_GUARDED=2;   // Scourges, Calamities and heroes never take more than x2 from matchups
function matchup(atkEl,defEls){
  if(!atkEl)return 1;
  const ms=defEls.map(d=>CHART[atkEl][d]);
  if(ms.length===1)return ms[0];
  const p=Math.round(ms[0]*ms[1]*100)/100;
  return DUAL_MAP[p]!==undefined?DUAL_MAP[p]:p;
}
// Reactions: an elemental hit leaves a Mark; a different element on a marked foe triggers a reaction.
const REACT={
 'fire+ice':{n:'Melt',p:'ice',d:'fire',m:1.8},
 'fire+water':{n:'Steam',p:'water',d:'fire',m:1.3,fx:[['blind',.7]]},
 'fire+wind':{n:'Wildfire',p:'fire',d:'wind',m:1.2,fx:[['burn',1]],splash:.35},
 'earth+fire':{n:'Magma',p:'earth',d:'fire',m:1.3,fx:[['break',.8],['burn',.6]]},
 'fire+lightning':{n:'Overload',p:'fire',d:'lightning',m:1.5,splash:.3},
 'fire+light':{n:'Solar Flare',p:'fire',d:'light',m:1.4,fx:[['blind',.5]]},
 'fire+shadow':{n:'Hellflame',p:'shadow',d:'fire',m:1.3,fx:[['weaken',.7],['burn',.5]]},
 'lightning+water':{n:'Conduct',p:'water',d:'lightning',m:1.3,fx:[['stun',.55]]},
 'ice+water':{n:'Freeze',p:'water',d:'ice',m:1.2,fx:[['stun',.45],['slow',.8]]},
 'earth+water':{n:'Mire',p:'water',d:'earth',m:1.15,fx:[['slow',.9],['root',.7]]},
 'water+wind':{n:'Squall',p:'wind',d:'water',m:1.2,fx:[['slow',.4]],splash:.3},
 'light+water':{n:'Purge',p:'light',d:'water',m:1.2,strip:1},
 'shadow+water':{n:'Drown',p:'shadow',d:'water',m:1.3,fx:[['root',.7],['weaken',.5]]},
 'earth+wind':{n:'Sandblast',p:'earth',d:'wind',m:1.2,fx:[['blind',.7]]},
 'earth+lightning':{n:'Grounded',p:'lightning',d:'earth',m:1.3,fx:[['break',.9]]},
 'earth+ice':{n:'Permafrost',p:'ice',d:'earth',m:1.2,fx:[['root',.8],['break',.4]]},
 'earth+light':{n:'Crystalize',p:'earth',d:'light',m:1.3,selfFx:[['ward',1]]},
 'earth+shadow':{n:'Grave',p:'earth',d:'shadow',m:1.3,fx:[['bleed',.8],['root',.5]]},
 'lightning+wind':{n:'Storm Surge',p:'wind',d:'lightning',m:1.3,splash:.45},
 'ice+wind':{n:'Frostbite',p:'wind',d:'ice',m:1.2,fx:[['bleed',.7],['slow',.6]]},
 'light+wind':{n:'Radiant Gale',p:'light',d:'wind',m:1.2,allyFx:[['regen',1]]},
 'shadow+wind':{n:'Nightshear',p:'shadow',d:'wind',m:1.3,fx:[['bleed',.8]]},
 'ice+lightning':{n:'Shatter',p:'ice',d:'lightning',m:1.7},
 'light+lightning':{n:'Judgement',p:'lightning',d:'light',m:1.6},
 'lightning+shadow':{n:'Blackout',p:'lightning',d:'shadow',m:1.3,fx:[['stun',.4],['blind',.4]]},
 'ice+light':{n:'Prism',p:'ice',d:'light',m:1.3,fx:[['blind',.4]],splash:.25},
 'ice+shadow':{n:'Deathchill',p:'shadow',d:'ice',m:1.4,fx:[['slow',.7],['weaken',.4]]},
 'light+shadow':{n:'Eclipse',p:'light',d:'shadow',m:2.0}
};
const reactKey=(a,b)=>[a,b].sort().join('+');
// v4.7: reactions need a PRIMER skill to set them up and a DETONATOR skill to set them off. Each reaction has one primer element and one detonator element.
function reactFor(primed,det){const R=REACT[reactKey(primed,det)];return R&&R.p===primed&&R.d===det?R:null;}
const SKILL_ROLE={annotate:null,edge1:'det',edge2:'primer',titan:'det',lance1:'primer',lance2:'det',judge:'det',s1a:'primer',s1b:'det',s2a:'primer',s2b:'primer',s3a:'det',
 ray1:'primer',ray2:'det',shiv1:'det',shiv2:'primer',assn:'det',arrow1:'primer',arrow2:'det',chi1:'det',chi2:'primer',dragon:'det',tune1:'primer',tune2:'primer',combo:'det'};
const MASTERY_BONUS=0.2;
const MASTERY={
 fire:{n:'Pyre Mastery',st:'burn',ch:.25,d:'Fire skills deal 20% more and may Burn.'},
 water:{n:'Tide Mastery',st:'weaken',ch:.25,d:'Water skills deal 20% more and may Weaken.'},
 earth:{n:'Stone Mastery',st:'break',ch:.25,d:'Earth skills deal 20% more and may Break armor.'},
 wind:{n:'Gale Mastery',st:'bleed',ch:.25,d:'Wind skills deal 20% more and may cause Bleed.'},
 lightning:{n:'Storm Mastery',st:'stun',ch:.12,d:'Lightning skills deal 20% more and may Stun.'},
 ice:{n:'Frost Mastery',st:'slow',ch:.25,d:'Ice skills deal 20% more and may Slow.'},
 light:{n:'Dawn Mastery',st:'blind',ch:.22,heal:.2,d:'Light skills deal 20% more and may Blind. Healing is 20% stronger.'},
 shadow:{n:'Dusk Mastery',st:'poison',ch:.22,drain:.15,d:'Shadow skills deal 20% more, may Poison, and drain 15% of damage as HP.'}
};
const STS={
 poison:{n:'Poison',a:'PSN',bad:1,t:4,c:'#b07ae0',d:'Loses 6% of max HP each turn.'},
 bleed:{n:'Bleed',a:'BLD',bad:1,t:3,c:'#e04848',d:'Takes damage each turn based on the attacker.'},
 burn:{n:'Burn',a:'BRN',bad:1,t:3,c:'#ff8a3a',d:'Loses 5% of max HP each turn and deals 15% less.'},
 slow:{n:'Slow',a:'SLW',bad:1,t:3,c:'#7aa8d8',d:'Turns come 50% slower.'},
 stun:{n:'Stun',a:'STN',bad:1,t:1,c:'#f2c93a',d:'Loses its next turn.'},
 blind:{n:'Blind',a:'BLN',bad:1,t:3,c:'#9a9aaa',d:'Physical attacks hit half as often.'},
 root:{n:'Root',a:'RT',bad:1,t:3,c:'#a07a42',d:'Cannot switch out or flee. Turns come 25% slower.'},
 weaken:{n:'Weaken',a:'WK',bad:1,t:3,c:'#d07a8a',d:'Deals 25% less damage.'},
 break:{n:'Break',a:'BRK',bad:1,t:3,c:'#d8a050',d:'Takes 30% more damage.'},
 might:{n:'Might',a:'MGT',t:3,c:'#ff7a5a',d:'Deals 30% more damage.'},
 bulwark:{n:'Bulwark',a:'BLW',t:3,c:'#7ab0ff',d:'Takes 30% less damage.'},
 haste:{n:'Haste',a:'HST',t:3,c:'#7affd0',d:'Turns come 35% faster.'},
 regen:{n:'Regen',a:'RGN',t:4,c:'#7aff8a',d:'Recovers 8% of max HP each turn.'},
 ward:{n:'Ward',a:'WRD',t:6,c:'#f6e7a8',d:'Blocks the next hit completely.'},
 taunt:{n:'Taunt',a:'TNT',t:3,c:'#ff5a5a',d:'Foes must aim single attacks at this hero.'},
 focus:{n:'Focus',a:'FCS',t:5,c:'#ffd23d',d:'The next attack is a guaranteed critical.'}
};
const CLS={
 warrior:{n:'Warrior',role:'Heavy melee. High HP and attack, hits groups, draws fire.',hp:[52,11],mp:[10,1.6],atk:[10,2.4],def:[8,1.9],mag:[3,.6],res:[4,1],spd:[8,.75],pref:['str','vit','dex']},
 knight:{n:'Knight',role:'Tank. Taunts, wards allies and raises party defense.',hp:[60,12.5],mp:[10,1.7],atk:[8,1.9],def:[11,2.4],mag:[3,.7],res:[7,1.5],spd:[6,.6],pref:['vit','spi','str']},
 mage:{n:'Mage',role:'Elemental caster. Big spells, hastes allies, fragile body.',hp:[36,7],mp:[28,3.8],atk:[4,.8],def:[4,1],mag:[12,2.7],res:[8,1.9],spd:[8,.75],pref:['int','spi','agi']},
 healer:{n:'Healer',role:'Heals, cleanses, grants Regen and revives.',hp:[40,8],mp:[30,4],atk:[4,.8],def:[5,1.2],mag:[11,2.4],res:[9,2],spd:[8,.7],pref:['fth','spi','vit']},
 thief:{n:'Thief',role:'Fastest class. Steals, poisons and blinds.',hp:[40,8.5],mp:[14,2],atk:[8,1.9],def:[5,1.3],mag:[4,.8],res:[5,1.2],spd:[13,1.1],pref:['agi','dex','luk']},
 archer:{n:'Archer',role:'Ranged damage. Bleeds, roots and pierces armor.',hp:[42,8.5],mp:[16,2.2],atk:[9,2.1],def:[5,1.3],mag:[4,.8],res:[5,1.3],spd:[11,.95],pref:['dex','agi','str']},
 monk:{n:'Monk',role:'Bare-fisted bruiser. Multi-hits, stuns, self-sustains.',hp:[50,10.5],mp:[14,2],atk:[10,2.3],def:[6,1.5],mag:[5,1],res:[6,1.4],spd:[10,.9],pref:['str','agi','vit']},
sniper:{n:'Steppe Sniper',legend:1,role:'Legendary horse archer. Crossbow bolts of shadow and storm, and he shoots back when struck.',hp:[46,9.2],mp:[16,2.3],atk:[10,2.35],def:[6,1.5],mag:[4,.8],res:[6,1.4],spd:[11,1],pref:['dex','agi','str']},
 druid:{n:'Druid',legend:1,role:'Legendary beast warden. Longbow, a wolf and a hawk at his call, and a way with wild things.',hp:[46,9.2],mp:[20,2.8],atk:[9,2.3],def:[6,1.4],mag:[7,1.5],res:[7,1.6],spd:[11,.95],pref:['dex','spi','agi']},
 archmage:{n:'Archmage',legend:1,role:'Legendary spellweaver. Ice and lightning, two spells a turn, cheap to cast.',hp:[40,8],mp:[30,4],atk:[4,.8],def:[5,1.15],mag:[12,2.6],res:[9,2],spd:[9,.8],pref:['int','spi','agi']},
 chronicler:{n:'Chronicler',role:'Archive caster. Wields the signature moves of every Scourge and Calamity you have defeated.',hp:[42,8.4],mp:[30,4.1],atk:[6,1.3],def:[6,1.5],mag:[13,2.8],res:[10,2.15],spd:[9,.85],pref:['int','fth','spi']},
 bard:{n:'Bard',role:'Support. Party heals, buffs, Haste and enemy debuffs.',hp:[38,7.5],mp:[24,3.3],atk:[5,1.1],def:[5,1.2],mag:[9,2],res:[8,1.8],spd:[9,.85],pref:['spi','luk','int']}
};
// =================== ATTRIBUTES ===================
const ATTR=['str','int','vit','spi','fth','agi','dex','luk'];
const ATTRN={str:['Strength','Physical attack, a little defense'],int:['Intellect','Magic attack, a little MP and resistance'],vit:['Vitality','Max HP and defense'],spi:['Spirit','MP, resistance, healing power, ailment resistance'],fth:['Faith','Healing and revives first, a little magic damage and resistance'],agi:['Agility','Turn speed and evasion'],dex:['Dexterity','Accuracy, critical damage, some physical attack'],luk:['Luck','Critical chance, ailment chance, evasion, steals and drops']};
const DEXLUK={sniper:{dex:[8,1.25],luk:[5,.7]},druid:{dex:[7,1.1],luk:[6,.9]},archmage:{dex:[3,.5],luk:[4,.6]},chronicler:{dex:[4,.6],luk:[5,.7]},warrior:{dex:[4,.6],luk:[3,.4]},knight:{dex:[3,.5],luk:[3,.4]},mage:{dex:[3,.5],luk:[4,.6]},healer:{dex:[3,.5],luk:[5,.7]},thief:{dex:[7,1.1],luk:[7,1.1]},archer:{dex:[8,1.2],luk:[5,.7]},monk:{dex:[6,.9],luk:[4,.6]},bard:{dex:[5,.7],luk:[7,1]}};
// derived stat formulas (shared by heroes and the stat sheet)
function deriveStats(a,L){const f=a.fth||0;
  return {hp:20+a.vit*6+L*3,mp:4+a.spi*2.5+a.int+f*.6,atk:a.str*2+a.dex*.4,mag:a.int*2+f*1.2,def:a.vit*1.2+a.str*.3,res:a.spi*1.2+a.int*.3+f*.3,spd:4+a.agi};
}
// Class attribute curves are solved from the old stat curves so the balance carries over.
// CLASS_ATTR_LEGACY keeps the pre-Faith curves: the Daily Trial uses them so its heroes stay exactly as they were.
const CLASS_ATTR={},CLASS_ATTR_LEGACY={},GROWTH_KEEP=.82;
const POINT_VAL={str:1,int:1,vit:1,spi:1,fth:1,agi:.6,dex:1,luk:1};
// Beta v0.3.1 Faith: [base, growth]. Healers and Chroniclers scale mostly on it, Knights and Monks a little.
// Their Intellect is lowered by 0.6 per Faith point so MAG stays where it was; healing goes up (Faith adds 0.5 heal power per point on top of MAG).
const FTH={healer:[3,.9],chronicler:[3,.8],knight:[1,.3],monk:[1,.25]};
Object.keys(CLS).forEach(k=>{
  const c=CLS[k],dl=DEXLUK[k],at=i=>{
    const dex=dl.dex[0]+dl.dex[1]*i,luk=dl.luk[0]+dl.luk[1]*i,atk=c.atk[0]+c.atk[1]*i,mag=c.mag[0]+c.mag[1]*i,hp=c.hp[0]+c.hp[1]*i,res=c.res[0]+c.res[1]*i,spd=c.spd[0]+c.spd[1]*i;
    const int=mag/2,str=(atk-.4*dex)/2,vit=(hp-20-3*i)/6,spi=(res-.3*int)/1.2,agi=spd-4;
    return {str,int,vit,spi,agi,dex,luk};};
  // 18% of natural growth is handed to the player as free stat points instead
  const a0=at(0),a1=at(1),b={},g={};ATTR.forEach(s=>{if(s==='fth')return;b[s]=a0[s];g[s]=(a1[s]-a0[s])*GROWTH_KEEP;});
  CLASS_ATTR_LEGACY[k]={b:Object.assign({},b,{fth:0}),g:Object.assign({},g,{fth:0})};
  const F=FTH[k]||[0,0];b.fth=F[0];g.fth=F[1]*GROWTH_KEEP;b.int-=.6*b.fth;g.int-=.6*g.fth;
  const a15={};ATTR.forEach(s=>{if(s==='fth')return;a15[s]=a0[s]+(a1[s]-a0[s])*15;});a15.fth=0;const d15=deriveStats(a15,15);
  Object.assign(CLASS_ATTR_LEGACY[k],{defM:(c.def[0]+c.def[1]*15)/d15.def,mpM:(c.mp[0]+c.mp[1]*15)/d15.mp});
  CLASS_ATTR[k]={b,g,defM:(c.def[0]+c.def[1]*15)/d15.def,mpM:(c.mp[0]+c.mp[1]*15)/d15.mp};
});
const ST=['hp','mp','atk','def','mag','res','spd'];
const EQSL=['w','a','c','k'];// v0.4.3: weapon, armor, charm, cape
const CF={sniper:['crossbow','vest'],druid:['bow','vest'],archmage:['staff','robe'],chronicler:['tome','robe'],warrior:['blade','mail'],knight:['blade','mail'],monk:['knuckles','vest'],mage:['staff','robe'],healer:['staff','robe'],bard:['lute','robe'],archer:['bow','vest'],thief:['dagger','vest']};
const TRAITS={
 swift:['Swift','+10% agility'],sturdy:['Sturdy','+12% max HP'],arcane:['Arcane','+12% magic, +10% MP'],keen:['Keen','+8% critical chance'],
 parthian:['Parthian Shot','Legendary: when attacked, sometimes dodges and fires straight back'],beastbond:['Beastbond','Legendary: tames monsters more often, and they come back stronger'],twinweave:['Twin Weave','Legendary: every spell is followed by a second spell of his other element at 30% power; spells cost about 30% less MP'],
 bulwark:['Stalwart','+10% defense and resistance'],berserk:['Berserker','+10% attack'],mender:['Mender','+15% healing'],tempo:['Tempo','Actions take 8% less time']
};

// v0.3.5 3.2 NATURES. TRAITS above is the display table for the legendary/old ids; NATURES is the effect table every non-Daily calc reads.
// fx: multipliers (agi hp mp atk def mag res heal) and additive crit/eva, tempo = action time multiplier. Old saves have no c.nat and keep TPL.trait.
const NATURES={
 swift:{n:'Swift',d:'+10% agility',fx:{agi:1.1}},sturdy:{n:'Sturdy',d:'+12% max HP',fx:{hp:1.12}},arcane:{n:'Arcane',d:'+12% magic, +10% MP',fx:{mag:1.12,mp:1.1}},
 keen:{n:'Keen',d:'+8% critical chance',fx:{crit:.08}},bulwark:{n:'Stalwart',d:'+10% defense and resistance',fx:{def:1.1,res:1.1}},berserk:{n:'Berserker',d:'+10% attack',fx:{atk:1.1}},
 mender:{n:'Mender',d:'+15% healing',fx:{heal:1.15}},tempo:{n:'Tempo',d:'Actions take 8% less time',fx:{tempo:.92}},
 brave:{n:'Brave',d:'+6% attack, +6% max HP',fx:{atk:1.06,hp:1.06}},hardy:{n:'Hardy',d:'+8% defense, +6% max HP',fx:{def:1.08,hp:1.06}},
 calm:{n:'Calm',d:'+12% resistance, +6% MP',fx:{res:1.12,mp:1.06}},focused:{n:'Focused',d:'+10% MP, +6% magic',fx:{mp:1.1,mag:1.06}},
 wise:{n:'Wise',d:'+8% magic, +8% resistance',fx:{mag:1.08,res:1.08}},nimble:{n:'Nimble',d:'+6% agility, +4% evasion',fx:{agi:1.06,eva:.04}},
 lucky:{n:'Lucky',d:'+5% critical chance, +4% evasion',fx:{crit:.05,eva:.04}},devout:{n:'Devout',d:'+10% healing, +8% resistance',fx:{heal:1.1,res:1.08}},
 fierce:{n:'Fierce',d:'+5% critical chance, +6% attack',fx:{crit:.05,atk:1.06}},sharp:{n:'Sharp',d:'+6% critical chance, +6% agility',fx:{crit:.06,agi:1.06}},
 fleet:{n:'Fleet',d:'+5% agility, actions take 4% less time',fx:{agi:1.05,tempo:.96}}
};
const NAT_CLASS={warrior:['brave','fierce','hardy','berserk','swift'],knight:['bulwark','hardy','sturdy','calm','brave'],mage:['arcane','focused','wise','keen','calm'],
 healer:['mender','devout','wise','calm','sturdy'],thief:['swift','keen','nimble','lucky','fleet'],archer:['keen','sharp','nimble','lucky','swift'],
 monk:['berserk','fierce','tempo','nimble','hardy'],bard:['tempo','focused','lucky','wise','swift']};
const natHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
// each template's pool: its original trait plus 2 to 4 class-fit natures (3 to 5 total), picked by a stable hash of the hero id
function natPool(id){const t=TPL[id];if(!t)return [];if(!NAT_CLASS[t.cls]||t.src==='L'||t.src==='x'||t.mon||!NATURES[t.trait])return [t.trait];
  if(t._pool)return t._pool;const cp=NAT_CLASS[t.cls],h=natHash(id),r=h%cp.length,rot=cp.slice(r).concat(cp.slice(0,r)).filter(k=>k!==t.trait),n=2+(h>>>5)%3;
  return t._pool=[t.trait].concat(rot.slice(0,n));}
const natOf=c=>{const t=TPL[c.id];if(!t)return 'keen';return (G&&G.daily)?t.trait:(c.nat&&NATURES[c.nat]?c.nat:t.trait);};
const natInfo=k=>NATURES[k]||(typeof TRAITS!=='undefined'&&TRAITS[k]?{n:TRAITS[k][0],d:TRAITS[k][1],fx:{}}:{n:'Unknown',d:'',fx:{}});
// rolled once per journey from a stable seed, so a restored or re-opened save shows the same nature
function natRoll(id){const P=natPool(id);if(P.length<2)return P[0];const seed=(typeof G!=='undefined'&&G&&G.run&&G.run.seed)||0;return P[natHash(id+':'+seed)%P.length];}
