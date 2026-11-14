// ===== items.js (v0.4.0): item data: items, materials, gear, weapon and armor rules, recipes (split out of data.js) =====
// =================== ITEM DATA (items, materials, gear, weapon and armor rules). Split out of data.js ===================
// =================== ITEMS, MATERIALS & GEAR ===================
const ITEMS={
 potion:{n:'Healing Draught',d:'Restores 70 HP',price:30,heal:70},
 hipotion:{n:'Greater Draught',d:'Restores 220 HP',price:110,heal:220,ch:1},
 ether:{n:'Mana Tonic',d:'Restores 30 MP',price:90,mp:30},
 remedy:{n:'Remedy',d:'Cures all ailments',price:45,cure:1},
 plume:{n:'Phoenix Feather',d:'Revives at 50% HP',price:260,revive:.5},
 elixir:{n:'Elixir',d:'Fully restores HP and MP',price:0,heal:9999,mp:9999,craft:1},
 vigor:{n:'Vigor Tonic',d:'Restores 150 HP and 20 MP',price:0,heal:150,mp:20,craft:1},
 sage:{n:'Sage Brew',d:'Restores 70 MP',price:0,mp:70,craft:1},
 // Beta v0.1.0 travel items. `use` says where each works: b battle, d dungeon, w anywhere outside town, f fields and dungeons.
 porkchop:{n:'Pork Chop Sandwich',d:'Escape an ordinary fight, or outside battle return to the dungeon entrance or the last town (not bosses, legend events or the Weekly Trial)',price:60,flee:1,travel:1},
 holywater:{n:'Holy Water',d:'Keeps random battles away for about 150 steps. Scripted fights, bosses and tent ambushes still happen. A new flask resets the count',price:120,ward:150,travel:1},
 tent:{n:'Tent',d:'Rest in a field or dungeon: 60% HP and MP back, KO\'d heroes up at 30%. Monsters may find a camp pitched in tall grass or open floor; a road is safe',price:180,tent:1,travel:1}
};
const MATS={moss:'Verdant Moss',shell:'Brine Shell',ore:'Kiln Ore',shard:'Frost Shard',feather:'Storm Feather',dust:'Void Dust',core:'Dread Core',
 copper:'Copper Ore',iron:'Iron Ore',mythril:'Mythril Ore',oak:'Oak Log',ash:'Elmwood Log',elder:'Elderwood Log',
 healroot:'Healroot',bluecap:'Bluecap',sunpetal:'Sunpetal',starbloom:'Starbloom',
 hide:'Beast Hide',fang:'Sharp Fang',scale:'Tough Scale',ichor:'Wisp Ichor',grit:'Golem Grit'};
// Materials come in families. Ore, wood and herbs come in tiers that follow the journey; parts drop from monsters; realm relics come from each realm's foes.
const MATCAT=[
 {k:'ore',n:'Ore',c:'#9aa4b8',ids:['copper','iron','mythril'],d:'Mined from glinting rocks in fields and dungeons. Slag golems and stone foes drop it too.'},
 {k:'wood',n:'Wood',c:'#b8844a',ids:['oak','ash','elder'],d:'Gathered from fallen logs in the fields.'},
 {k:'herb',n:'Herbs',c:'#6ac870',ids:['healroot','bluecap','sunpetal','starbloom'],d:'Picked from herb patches. Brewed into draughts and tonics.'},
 {k:'part',n:'Monster parts',c:'#e08a5a',ids:['hide','fang','scale','ichor','grit'],d:'Dropped by monsters. Each kind of foe leaves its own part.'},
 {k:'relic',n:'Realm relics',c:'#c89aff',ids:['moss','shell','ore','shard','feather','dust','core'],d:'Unique to each realm. Dread Cores come from Scourges, Calamities and elites.'}];
const MAT_OF={};MATCAT.forEach(c=>c.ids.forEach(id=>{MAT_OF[id]=c;}));
// tier 0 for the first two stages, tier 1 for the middle, tier 2 for the last
const matTier=s=>s<=1?0:s<=3?1:2;
const TIERED={ore:['copper','iron','mythril'],wood:['oak','ash','elder'],herb:['healroot','sunpetal','starbloom']};
// what each monster leaves behind; ore*, wood*, herb* follow the stage tier
const MON_DROPS={mossling:['healroot','ichor'],gustimp:['ichor','oak'],dewtoad:['scale','bluecap'],cinderpup:['hide','fang'],
 crawler:['scale','scale'],gull:['hide','fang'],tidewisp:['ichor','bluecap'],shellguard:['scale','grit'],
 magmaslime:['ichor','ore*'],cavebat:['hide','fang'],ashwraith:['ichor','herb*'],slaggolem:['grit','ore*'],
 frostwolf:['hide','fang'],snowharpy:['hide','bluecap'],yeti:['hide','fang'],iceknight:['grit','ore*'],
 thunderhawk:['fang','hide'],stormling:['ichor','bluecap'],gargoyle:['grit','ore*'],cloudray:['scale','wood*'],
 voidspawn:['ichor','herb*'],eclipsewraith:['ichor','bluecap'],stareater:['fang','hide'],huskguard:['grit','wood*']};
// the Smithy sells ore and wood, Alchemy sells herbs, up to the tier you have reached
// Beta v0.1.0: the Smithy also sells monster parts, at a premium and only a few of each per inn rest.
// Kept out of MAT_PRICE on purpose, so recipe gold math ignores them and parts stay the gate.
const PART_PRICE={hide:30,fang:32,scale:36,ichor:36,grit:40},PART_STOCK=3;
const GEAR={};
const ARM_K=3.5,FORGE_STEP=.11;// gear16: .11 (was .25), so a piece at +3 (x1.33) stays under the next rarity at +0 in its main stats (test v188a.js)
const WP=[6,14,25,39,57,80],AP=[5,11,18,27,38,52],PRICE=[60,150,380,750,1400,2400];
const WN={blade:['Iron Blade','Steel Brand','Mythril Saber','Dawnsteel Blade','Stormforged Edge','Starcleaver'],
 staff:['Oak Staff','Moonwood Staff','Sage Rod','Tidecaller Staff','Skyglass Scepter','Lodestar Rod'],
 bow:['Hunter Bow','Yew Bow','Falcon Bow','Frostwood Bow','Galewing Bow','Meridian Bow'],
 crossbow:['Light Crossbow','Steel Arbalest','Stormlatch','Rimeshot Arbalest','Thunderlock',"Khan's Arbalest"],
 dagger:['Iron Dirk','Steel Stiletto','Viper Fang','Rime Dagger','Stormglass Kris','Umbra Needle'],
 tome:['Apprentice Primer','Moonleaf Codex','Sage Grimoire','Tidebound Tome','Skyglass Folio','Lodestar Codex'],
 // v0.3.5 weapon lines (6 tiers each)
 axe:['Hatchet','Steel Cleaver','Mythril Waraxe','Dawnsteel Axe','Stormsplitter','Starhewer'],
 greatsword:['Iron Claymore','Steel Zweihander','Mythril Greatblade','Dawnsteel Colossus','Stormbreaker','Starfall Blade'],
 lance:['Iron Pike','Steel Lance','Mythril Spear','Dawnsteel Lance','Stormpiercer','Starpiercer'],
 mace:['Iron Mace','Steel Flail','Mythril Maul','Dawnsteel Morningstar','Thunder Maul','Starhammer'],
 shortsword:['Iron Gladius','Steel Shortblade','Viper Gladius','Rime Shortsword','Stormglass Gladius','Umbra Shortblade'],
 longbow:['Elm Longbow','Yew Warbow','Falcon Warbow','Frostwood Warbow','Galewing Warbow','Meridian Warbow'],
 knuckles:['Leather Wraps','Iron Knuckles','Mythril Cestus','Dawnsteel Fists','Storm Gauntlets','Starfist'],
 claws:['Iron Claws','Steel Talons','Viper Claws','Rime Talons','Storm Rakes','Umbra Claws'],
 qstaff:['Oak Quarterstaff','Elm Quarterstaff','Mythril Bo','Dawnwood Staff','Stormwood Bo','Starwood Staff'],
 lute:['Pine Lute','Maple Lute','Silverstring Lute','Tidesong Lute','Skyglass Lute','Lodestar Lute'],
 harp:['Reed Harp','Silver Harp','Sage Harp','Tidesong Harp','Skyglass Harp','Lodestar Harp'],
 flute:['Antler Flute','Silver Flute','Sage Pipe','Tidesong Flute','Skyglass Flute','Lodestar Flute'],
 // v0.8.2 role weapons (roles.js): each leans a class into its secondary role
 thrown:['Iron Shuriken','Steel Kunai','Viper Stars','Rime Kunai','Storm Shuriken','Umbra Kunai'],
 beads:['Wooden Beads','Jade Beads','Pilgrim Beads','Dawn Rosary','Storm Rosary','Starlit Rosary'],
 wand:['Hazel Wand','Horn Wand','Hexwood Wand','Rime Wand','Stormglass Wand','Void Wand'],
 censer:['Clay Censer','Brass Censer','Silver Censer','Dawn Censer','Storm Censer','Star Censer'],
 warhammer:['Iron Warhammer','Steel Warhammer','Mythril Warhammer','Dawnsteel Warhammer','Storm Warhammer','Star Warhammer'],
 standard:['Rag Standard','Guild Standard','Mythril Standard','Dawn Standard','Storm Standard','Star Standard'],
 lyre:['Pine Lyre','Silver Lyre','Sage Lyre','Tidesong Lyre','Skyglass Lyre','Lodestar Lyre']};
const AN={mail:['Leather Vest','Chain Mail','Mythril Mail','Dawnplate','Stormplate','Starplate'],
 robe:['Linen Robe','Silk Robe','Mage Vestment','Rime Robe','Skyweave Robe','Void Robe'],
 vest:['Hide Jerkin','Scout Garb','Windrunner Garb','Frostrunner Garb','Gale Garb','Twilight Garb']};
function addGear(id,o){GEAR[id]=Object.assign({id},o);}
for(let t=0;t<6;t++){
  addGear('w_blade_'+t,{n:WN.blade[t],slot:'w',tier:t,atk:WP[t],price:PRICE[t]});
  // Beta v0.3.1: staves are the efficient caster weapon (spells cost 15% less MP, +10% elemental spell damage); tomes hit harder
  addGear('w_staff_'+t,{n:WN.staff[t],slot:'w',tier:t,mag:WP[t],res:Math.round(WP[t]*.3),mp:Math.round(WP[t]*.8),mpEff:.15,elDmg:.1,price:PRICE[t]});
  addGear('w_tome_'+t,{n:WN.tome[t],slot:'w',tier:t,mag:Math.round(WP[t]*1.45),res:Math.round(WP[t]*.45),mp:Math.round(WP[t]*.3),price:PRICE[t],tome:1});
  addGear('w_bow_'+t,{n:WN.bow[t],slot:'w',tier:t,atk:Math.round(WP[t]*.9),spd:1+t*1.2,price:PRICE[t]});
  addGear('w_dagger_'+t,{n:WN.dagger[t],slot:'w',tier:t,atk:Math.round(WP[t]*.8),spd:2+t*1.8,price:PRICE[t]});
  addGear('w_crossbow_'+t,{n:WN.crossbow[t],slot:'w',tier:t,atk:Math.round(WP[t]*1.05),spd:t*.5,price:PRICE[t]});
  // v0.3.5: the other weapon lines. Same power budget as the sword line, spent differently; the perks live in WPERK below.
  addGear('w_axe_'+t,{n:WN.axe[t],slot:'w',tier:t,atk:Math.round(WP[t]*1.02),price:PRICE[t]});
  addGear('w_greatsword_'+t,{n:WN.greatsword[t],slot:'w',tier:t,atk:Math.round(WP[t]*1.22),spd:-t*.4,price:PRICE[t]});
  addGear('w_lance_'+t,{n:WN.lance[t],slot:'w',tier:t,atk:Math.round(WP[t]*.98),def:Math.round(WP[t]*.12),price:PRICE[t]});
  addGear('w_mace_'+t,{n:WN.mace[t],slot:'w',tier:t,atk:Math.round(WP[t]*.84),mag:Math.round(WP[t]*.5),def:Math.round(WP[t]*.1),res:Math.round(WP[t]*.12),price:PRICE[t]});
  addGear('w_shortsword_'+t,{n:WN.shortsword[t],slot:'w',tier:t,atk:Math.round(WP[t]*.86),spd:1+t*1.2,price:PRICE[t]});
  addGear('w_longbow_'+t,{n:WN.longbow[t],slot:'w',tier:t,atk:Math.round(WP[t]*1.06),spd:t*.3,price:PRICE[t]});
  addGear('w_knuckles_'+t,{n:WN.knuckles[t],slot:'w',tier:t,atk:Math.round(WP[t]*.92),spd:1+t*.8,price:PRICE[t]});
  addGear('w_claws_'+t,{n:WN.claws[t],slot:'w',tier:t,atk:Math.round(WP[t]*.9),spd:1+t*1.1,price:PRICE[t]});
  addGear('w_qstaff_'+t,{n:WN.qstaff[t],slot:'w',tier:t,atk:Math.round(WP[t]*.86),def:Math.round(WP[t]*.2),res:Math.round(WP[t]*.2),price:PRICE[t]});
  addGear('w_lute_'+t,{n:WN.lute[t],slot:'w',tier:t,mag:Math.round(WP[t]*.9),res:Math.round(WP[t]*.3),mp:Math.round(WP[t]*.7),price:PRICE[t]});
  addGear('w_harp_'+t,{n:WN.harp[t],slot:'w',tier:t,mag:Math.round(WP[t]*.86),res:Math.round(WP[t]*.4),mp:Math.round(WP[t]*.8),price:PRICE[t]});
  addGear('w_flute_'+t,{n:WN.flute[t],slot:'w',tier:t,mag:Math.round(WP[t]*.82),res:Math.round(WP[t]*.25),mp:Math.round(WP[t]*.6),spd:1+t*1.2,price:PRICE[t]});
  // v0.8.2 role weapons: the same power budget, spent toward a secondary role (perks in WPERK)
  addGear('w_thrown_'+t,{n:WN.thrown[t],slot:'w',tier:t,atk:Math.round(WP[t]*.8),spd:2+t*1.4,price:PRICE[t]});
  addGear('w_beads_'+t,{n:WN.beads[t],slot:'w',tier:t,atk:Math.round(WP[t]*.7),mag:Math.round(WP[t]*.55),res:Math.round(WP[t]*.2),attr:{fth:1+t},price:PRICE[t]});
  addGear('w_wand_'+t,{n:WN.wand[t],slot:'w',tier:t,mag:Math.round(WP[t]*.95),mp:Math.round(WP[t]*.5),spd:1+t*.6,price:PRICE[t]});
  addGear('w_censer_'+t,{n:WN.censer[t],slot:'w',tier:t,mag:Math.round(WP[t]*.88),res:Math.round(WP[t]*.35),mp:Math.round(WP[t]*.6),price:PRICE[t]});
  addGear('w_warhammer_'+t,{n:WN.warhammer[t],slot:'w',tier:t,atk:Math.round(WP[t]*.98),def:Math.round(WP[t]*.12),price:PRICE[t]});
  addGear('w_standard_'+t,{n:WN.standard[t],slot:'w',tier:t,atk:Math.round(WP[t]*.88),def:Math.round(WP[t]*.15),res:Math.round(WP[t]*.15),price:PRICE[t]});
  addGear('w_lyre_'+t,{n:WN.lyre[t],slot:'w',tier:t,mag:Math.round(WP[t]*1.02),mp:Math.round(WP[t]*.5),res:Math.round(WP[t]*.2),price:PRICE[t]});
  addGear('a_mail_'+t,{n:AN.mail[t],slot:'a',tier:t,def:Math.round(AP[t]*ARM_K),res:Math.round(AP[t]*ARM_K*.4),hp:AP[t]*3,spd:-(1+Math.round(t*.4)),mp:-Math.round(AP[t]*.3),price:Math.round(PRICE[t]*.9)});
  addGear('a_robe_'+t,{n:AN.robe[t],slot:'a',tier:t,res:Math.round(AP[t]*ARM_K),def:Math.round(AP[t]*ARM_K*.45),mag:Math.round(AP[t]*.4),mp:Math.round(AP[t]*1.2),spd:1+Math.round(t*.8),attr:{fth:1+t},price:Math.round(PRICE[t]*.9)});
  addGear('a_vest_'+t,{n:AN.vest[t],slot:'a',tier:t,def:Math.round(AP[t]*ARM_K*.72),res:Math.round(AP[t]*ARM_K*.72),spd:1+t,price:Math.round(PRICE[t]*.9)});
}
addGear('c_vital',{n:'Vital Charm',slot:'c',tier:0,hp:70,price:120});
addGear('c_mana',{n:'Mana Charm',slot:'c',tier:0,mp:35,price:120});
addGear('c_swift',{n:'Swift Charm',slot:'c',tier:1,spd:6,price:220});
addGear('c_clarity',{n:'Clarity Charm',slot:'c',tier:1,immune:1,price:260});
// v0.4.0 5.3: one unique charm per side cave (found nowhere else, never sold in shops)
[['c_cv0','Mossback Charm',{hp:140,def:8}],['c_cv1','Saltwhisper Pearl',{mp:70,mag:10,res:8}],['c_cv2','Coalseam Charm',{atk:14,hp:80}],['c_cv3','Icefang Charm',{def:12,res:12}],['c_cv4','Cometfall Charm',{spd:10,mag:12,atk:8}]].forEach(([id,n,st],i)=>addGear(id,Object.assign({n,slot:'c',tier:3,price:600+i*100,unique:1},st)));
[['c_fa0','Guildmark Pin',{hp:90,atk:8,def:6}],['c_fa1','Anvilmark Charm',{atk:12,def:10}],['c_fa2','Vialmark Charm',{mag:12,res:10,mp:50}],['c_fa3','Wildcall Charm',{spd:10,hp:100,luk:6}],['c_fa4','Inkmark Charm',{mag:14,mp:60,spd:6}],['c_fa5','Steady Knot',{hp:80,def:8,luk:8}]].forEach(([id,n,st],i)=>addGear(id,Object.assign({n,slot:'c',tier:3,price:700+i*100,unique:1},st)));
[['c_fb0',"Guildmaster's Seal",{hp:150,atk:12,def:10,spd:4}],['c_fb1',"Grandsmith's Hammerpin",{atk:18,def:14,hp:60}],['c_fb2',"Archmage's Phial",{mag:18,res:14,mp:80}],['c_fb3','Wild Heart',{spd:14,hp:140,luk:8}],['c_fb4','The Last Page',{mag:20,mp:90,spd:8}],['c_fb5','The Steady Hand',{hp:140,def:12,atk:12,luk:10}]].forEach(([id,n,st],i)=>addGear(id,Object.assign({n,slot:'c',tier:4,price:1400+i*100,unique:1},st)));
addGear('c_fth',{n:'Saint Charm',slot:'c',tier:2,attr:{fth:6},price:400});
// The Tamer's Stick: stats are filled in by gearOf from the account Bestiary (see stickPower)
addGear('w_stick',{n:'Stick: For the Tamer of All',slot:'w',tier:0,atk:4,mag:4,price:0,stick:1});
ELK.forEach(k=>addGear('c_'+k,{n:EL[k]+' Charm',slot:'c',tier:1,el:k,price:220}));
// attribute charms are crafted at Alchemy or found in bounties and chests
[['str','Ogre Charm',6],['int','Sage Charm',6],['vit','Oak Charm',6],['spi','Pilgrim Charm',6],['agi','Gale Charm',6],['dex','Hawk Charm',8],['luk','Clover Charm',8]].forEach(([a,n,v])=>addGear('c_'+a,{n,slot:'c',tier:2,attr:{[a]:v},price:400}));
const SLOTN={w:'Weapon',a:'Armor',c:'Charm'};
// ===== CONFIG: item strength tiers (v0.4.0 3.10). The ONLY place tier names, colours and pip shapes are defined. =====
// Index = the gear tier line (0..5); the last entry is Echoforged. The pip is a different shape per tier so colour is never the only cue.
const ITEM_TIERS=[
 {n:'Common',   c:'#9aa3ad',pip:'●'},
 {n:'Uncommon', c:'#5fcf6a',pip:'◆'},
 {n:'Rare',     c:'#4a9bff',pip:'▲'},
 {n:'Epic',     c:'#b06aff',pip:'■'},
 {n:'Heroic',   c:'#ffc83d',pip:'★'},// v0.10.8: was 'Legendary'; that word belongs to the legend heroes only (ui.js)
 {n:'Mythic',   c:'#ff6a5a',pip:'✦'},
 {n:'Echoforged',c:'#ffd9a0',c2:'#b48aff',pip:'❂'}];
const ITEM_TIER_OF={potion:0,remedy:0,porkchop:0,ether:1,hipotion:1,vigor:1,sage:1,tent:1,holywater:2,plume:3,elixir:3};// v0.10.8: Elixir was tier 4 ('Legendary'), a chest staple // consumables
const STN={hp:'HP',mp:'MP',atk:'ATK',def:'DEF',mag:'MAG',res:'RES',spd:'SPD'};
// Tempered gear carries a +N suffix: each level adds FORGE_STEP (11%) to its stats.
function gearOf(id){
  if(!id)return null;if(id==='w_stick')return stickGear();const m=String(id).match(/^(.*)\+(\d)$/);
  if(!m)return GEAR[id]||null;
  const base=GEAR[m[1]];if(!base)return null;const n=+m[2],o=Object.assign({},base,{id,base:m[1],plus:n,n:base.n+' +'+n});
  ST.forEach(s=>{if(base[s])o[s]=Math.round(base[s]*(1+FORGE_STEP*n));});
  if(base.attr){o.attr={};Object.keys(base.attr).forEach(k=>{o.attr[k]=base.attr[k]+n*2;});}
  o.price=Math.round(base.price*(1+.4*n));return o;
}
// ----- the Tamer's Stick (Beta v0.3.1) -----
// Power follows the account Bestiary: p = logged/total on a gentle curve, from a twig (4) to just above a Starcleaver.
const STICK_TIERS=[[0,'Plain','#b8a888'],[.2,'Green','#6ad070'],[.45,'Blue','#5aa0ff'],[.7,'Purple','#c07aff'],[.95,'Gold','#ffd04a']];
// v0.4.3: the Stick always measures against the Bestiary as it is listed (every realm, variant and boss entry), so new creatures never shrink it unfairly
function stickCount(){try{if(typeof bestAll==='function'){const L=bestAll(),B=META.best||{},seen=new Set();let n=0,all=0;L.forEach(o=>{const nm=o.d&&o.d.n;if(!nm||seen.has(nm))return;seen.add(nm);all++;if((B[nm]||{}).seen)n++;});if(all)return {n,all};}}catch(e){}
  try{const all=Object.keys(MON).length+GPOOL.length+FPOOL.length;const B=META.best||{};let n=0;Object.keys(MON).forEach(k=>{if((B[MON[k].n]||{}).seen)n++;});GPOOL.concat(FPOOL).forEach(k=>{const d=guardianDef(k);if(d&&(B[d.n]||{}).seen)n++;});return {n,all};}catch(e){return {n:0,all:40};}}
function stickPower(){const {n,all}=stickCount(),p=Math.min(1,n/all),k=Math.pow(p,1.5),top=Math.round(WP[5]*1.12);let ti=0;STICK_TIERS.forEach((t,i)=>{if(p>=t[0])ti=i;});
  const nx=STICK_TIERS[ti+1];return {n,all,p,pow:Math.round(4+(top-4)*k),tier:ti,name:STICK_TIERS[ti][1],col:STICK_TIERS[ti][2],next:nx?Math.ceil(nx[0]*all):null,nextName:nx?nx[1]:null};}
function stickGear(){const P=stickPower();return {id:'w_stick',n:'Stick: For the Tamer of All',slot:'w',tier:Math.min(5,Math.floor(P.p*6)),atk:P.pow,mag:P.pow,spd:Math.round(P.p*6),price:0,stick:1,glow:P.col,stickP:P};}
function gearDesc(id){const g=typeof id==='string'?gearOf(id):id;if(!g)return '';const p=[];ST.forEach(s=>{if(g[s])p.push((g[s]>0?'+':'')+Math.round(g[s])+' '+STN[s]);});if(g.slot==='w'&&g.fam&&WT_NAME[g.fam])p.unshift(WT_NAME[g.fam]);if(g.slot==='a'&&g.weight)p.unshift(ARM_NAME[g.weight]);if(g.fam&&WPERK[g.fam]&&g.fam!=='staff')p.push(WPERK[g.fam].p);if(g.attr)Object.keys(g.attr).forEach(k=>p.push('+'+g.attr[k]+' '+k.toUpperCase()));if(g.el)p.push('+15% '+EL[g.el]+' damage, 15% less taken');if(g.immune)p.push('Halves ailment chance');if(g.mpEff)p.push(WPERK.staff.p);if(g.stick){const P=g.stickP;p.push(`${P.name} glow: ${P.n}/${P.all} Bestiary entries`+(P.next?`, grows again at ${P.next}`:', fully grown'));}return p.join(', ');}
gearDesc=HOOK.def('gearDesc',gearDesc);
// ----- v0.3.5 weapon types, weapon perks and armor weights -----
Object.keys(GEAR).forEach(id=>{let m=id.match(/^w_([a-z]+)_\d$/);if(m){GEAR[id].fam=m[1];GEAR[id].wt=m[1];}m=id.match(/^a_(mail|robe|vest)_\d$/);if(m){GEAR[id].fam=m[1];GEAR[id].weight={mail:'heavy',vest:'medium',robe:'light'}[m[1]];}});
const WT_NAME={blade:'Sword',axe:'Axe',greatsword:'Greatsword',lance:'Lance',mace:'Mace',staff:'Staff',tome:'Tome',dagger:'Dagger',shortsword:'Short sword',bow:'Bow',longbow:'Longbow',crossbow:'Crossbow',knuckles:'Knuckles',claws:'Claws',qstaff:'Quarterstaff',lute:'Lute',harp:'Harp',flute:'Flute',thrown:'Throwing stars',beads:'Prayer beads',wand:'Wand',censer:'Censer',warhammer:'Warhammer',standard:'War standard',lyre:'Lyre'};
// which weapon types a class may wield, and which armor weight it may wear
const CLS_WPN={warrior:['blade','axe','greatsword','warhammer'],knight:['blade','lance','mace','standard'],mage:['staff','tome','wand'],healer:['staff','tome','mace','censer'],thief:['dagger','shortsword','thrown'],archer:['bow','longbow','crossbow'],monk:['knuckles','claws','qstaff','beads'],bard:['lute','harp','flute','lyre'],
  sniper:['crossbow','bow'],druid:['bow','longbow'],archmage:['staff','tome'],chronicler:['tome','staff']};
// v0.17: WEAPON-DRIVEN DAMAGE KIND (dmg11.js). A physical skill with no fixed kind (DL_FORCE in skills.js, or a `dl` on the skill) and the basic
// Attack take their kind from the weapon in hand. WT_KIND is the natural kind of each weapon family; CLS_KINDS lists the physical kinds a class
// may reach at all (at most two; casters one, plus magic), and CLS_KIND_ALT re-kinds the families that class wields outside its list.
// A class with no weapon in hand (or in the Daily Trial) uses the first kind of its list.
const WT_KIND={blade:'slash',axe:'slash',greatsword:'slash',shortsword:'slash',dagger:'slash',claws:'slash',
  mace:'blunt',warhammer:'blunt',staff:'blunt',qstaff:'blunt',knuckles:'blunt',beads:'blunt',wand:'blunt',censer:'blunt',tome:'blunt',
  lance:'piercing',standard:'piercing',
  bow:'ranged',longbow:'ranged',crossbow:'ranged',thrown:'ranged',lute:'ranged',harp:'ranged',flute:'ranged',lyre:'ranged'};
const CLS_KINDS={warrior:['slash','blunt'],knight:['slash','blunt'],monk:['blunt','slash'],archer:['ranged','piercing'],thief:['slash','piercing'],
  mage:['blunt'],healer:['blunt'],bard:['ranged'],sniper:['ranged','piercing'],druid:['ranged','slash'],archmage:['blunt'],chronicler:['blunt']};
const CLS_KIND_ALT={knight:{lance:'blunt',standard:'blunt'},thief:{thrown:'piercing'}};
const CLS_ARM={warrior:'heavy',knight:'heavy',mage:'light',healer:'light',bard:'light',chronicler:'light',archmage:'light',thief:'medium',archer:'medium',monk:'medium',sniper:'medium',druid:'medium'};
const ARM_NAME={light:'Light armor',medium:'Medium armor',heavy:'Heavy armor'};
const ARM_FAM={heavy:'mail',medium:'vest',light:'robe'};
// perks: s = short text for skill rows, p = full text for items. Numbers are read by calcStats (stat parts) and the battle engine (the rest).
const WPERK={
 blade:{p:'Balanced: +4% accuracy, +8% critical damage',s:'Sword: +8% crit damage',acc:.04,critDmg:.08},
 axe:{p:'Cleave: +12% damage with attacks that hit every foe',s:'Axe: +12% when it hits all foes',cleave:.12},
 greatsword:{p:'Heavy: +12% physical damage, actions take 6% longer',s:'Greatsword: +12% physical damage',heavy:.12,tempo:1.06},
 lance:{p:'Charge: +22% damage to foes that have already acted since your last turn',s:'Lance: +22% vs foes that already acted',charge:.22},
 mace:{p:'Crush: stun chances are 50% higher, and basic attacks have a 10% chance to stun',s:'Mace: stuns land 50% more often',stun:1.5,basicStun:.10},
 staff:{p:'Focus: spells cost 15% less MP, +10% elemental spell damage',s:'Staff: spells cost 15% less MP'},
 tome:{p:'Scholar: +10% spell damage',s:'Tome: +10% spell damage',spellPow:.10},
 dagger:{p:'Keen: +6% critical chance',s:'Dagger: +6% crit chance',crit:.06},
 shortsword:{p:'Parry: +5% evasion, +4% critical chance',s:'Short sword: +5% evasion',eva:.05,crit:.04},
 bow:{p:"Piercing: ignores 10% of the target's defense",s:'Bow: ignores 10% DEF',pierce:.10},
 longbow:{p:"Long draw: ignores 16% of the target's defense, but actions take 4% longer",s:'Longbow: ignores 16% DEF',pierce:.16,tempo:1.04},
 crossbow:{p:"Bolt: ignores 8% of the target's defense, +15% critical damage",s:'Crossbow: ignores 8% DEF, +15% crit damage',pierce:.08,critDmg:.15},
 knuckles:{p:'Flurry: multi-hit skills and basic attacks have a 30% chance of one extra hit',s:'Knuckles: 30% chance of an extra hit',combo:.30},
 claws:{p:'Rend: +50% bleed chance, +25% ailment chance, +4% critical chance',s:'Claws: ailments land 25% more often',status:1.25,bleed:1.5,crit:.04},
 qstaff:{p:'Reach: +5% accuracy, +6% evasion',s:'Quarterstaff: +5% accuracy',acc:.05,eva:.06},
 lute:{p:'Discord: debuffs land 25% more often and last 1 turn longer',s:'Lute: debuffs +25% chance, +1 turn',status:1.25,debT:1},
 harp:{p:'Soothe: +10% healing, buffs last 1 turn longer',s:'Harp: +10% healing, buffs +1 turn',healUp:.10,buffT:1},
 flute:{p:'Tempo: actions take 5% less time, buffs last 1 turn longer',s:'Flute: faster actions, buffs +1 turn',tempo:.95,buffT:1},
 // v0.8.2 role weapons
 thrown:{p:'Thrown: basic attacks are Ranged (flying foes cannot weave away), +5% critical chance',s:'Throwing stars: Ranged attacks, +5% crit',crit:.05},
 beads:{p:'Prayer: +15% healing, buffs you give last 1 turn longer',s:'Prayer beads: +15% healing, buffs +1 turn',healUp:.15,buffT:1},
 wand:{p:'Hex: debuffs land 30% more often and last 1 turn longer',s:'Wand: debuffs +30% chance, +1 turn',status:1.3,debT:1},
 censer:{p:'Incense: buffs you give last 1 turn longer, +5% healing',s:'Censer: buffs +1 turn, +5% healing',buffT:1,healUp:.05},
 warhammer:{p:'Sunder: debuffs land 25% more often and last 1 turn longer',s:'Warhammer: debuffs +25% chance, +1 turn',status:1.25,debT:1},
 standard:{p:'Rally: buffs you give last 1 turn longer, +4% accuracy',s:'War standard: buffs +1 turn',buffT:1,acc:.04},
 lyre:{p:'Resonance: +10% spell damage',s:'Lyre: +10% spell damage',spellPow:.10}};
const FAM_MAT_V35={axe:['ore','fang'],greatsword:['ore','scale'],lance:['ore','hide'],mace:['ore','grit'],shortsword:['ore','fang'],longbow:['wood','hide'],knuckles:['ore','hide'],claws:['ore','fang'],qstaff:['wood','grit'],lute:['wood','ichor'],harp:['wood','ichor'],flute:['wood','bluecap'],thrown:['ore','fang'],beads:['wood','grit'],wand:['wood','ichor'],censer:['ore','ichor'],warhammer:['ore','grit'],standard:['ore','hide'],lyre:['wood','ichor']};
// loot: a random weapon or armor base (w_axe, a_mail ...) that somebody in the current roster can actually use
function lootBase(rnd){const R=rnd||(()=>Math.random()),cls=new Set();try{Object.values(G.roster).forEach(c=>{if(TPL[c.id])cls.add(TPL[c.id].cls);});}catch(e){}
  const w=new Set(),a=new Set();(cls.size?[...cls]:Object.keys(CLS_WPN)).forEach(k=>{(CLS_WPN[k]||[]).forEach(f=>w.add('w_'+f));a.add('a_'+ARM_FAM[CLS_ARM[k]||'medium']);});
  const W=[...w].filter(x=>GEAR[x+'_0']),A=[...a];const l=R()<.62?W:A;return l[Math.floor(R()*l.length)];}
function canEquip(c,id){const g=gearOf(id);if(!g||!c)return false;const t=TPL[c.id];if(!t)return false;
  if(g.only)return g.only===c.id;           // signature weapons: their owner only, whatever the type
  if(g.stick)return true;                    // the Tamer's Stick fits anyone
  if(g.slot==='w'){const allowed=CLS_WPN[t.cls]||null;return !allowed||!g.fam||allowed.includes(g.fam);}
  if(g.slot==='a'){const w=g.weight;return !w||(CLS_ARM[t.cls]||'medium')===w;}
  return true;}
// why a hero can't use an item, for messages
function equipWhy(c,id){const g=gearOf(id),t=TPL[c.id];if(!g||!t)return '';if(g.slot==='w')return `${CLS[t.cls].n}s use ${(CLS_WPN[t.cls]||[]).map(f=>WT_NAME[f]||f).join(', ')}.`;if(g.slot==='a')return `${CLS[t.cls].n}s wear ${ARM_NAME[CLS_ARM[t.cls]||'medium'].toLowerCase()}.`;return '';}
// Recipes. Gear (Smithy) recipes make a shop item already tempered to +1 (or +2 late on), so crafting beats buying if you gather.
const RECIPES=[];
(function(){
  const R=(o)=>RECIPES.push(o);
  // potions
  R({cat:'potion',item:'potion',m:{healroot:2},g:0,t:0});
  R({cat:'potion',item:'ether',m:{bluecap:2},g:5,t:0});
  R({cat:'potion',item:'remedy',m:{healroot:1,bluecap:1},g:5,t:0});
  R({cat:'potion',item:'hipotion',m:{healroot:2,sunpetal:1},g:10,t:1});
  R({cat:'potion',item:'vigor',m:{sunpetal:1,bluecap:1,ichor:1},g:20,t:1});
  R({cat:'potion',item:'sage',m:{bluecap:3,ichor:1},g:20,t:1});
  R({cat:'potion',item:'plume',m:{sunpetal:2,$rel:1,ichor:1},g:40,t:1});
  R({cat:'potion',item:'elixir',m:{starbloom:2,core:1,dust:1},g:80,t:2});
  // travel gear (Alchemy). Store tent is 180; hide 2 + oak 3 (42 gold of logs) + 70 gold sits near it, and the hide is the gate.
  R({cat:'item',item:'tent',m:{oak:3,hide:2},g:70,t:0});
  // weapons and armor, per tier. Metal gear wants ore, wooden gear wants logs, every piece wants a monster part.
  const FAM_MAT=FAM_MAT_V35;
  const ORE=['copper','iron','mythril'],WOOD=['oak','ash','elder'],REL=['$r0','$r1','$r2'];
  const gt=[[0,1],[2,3],[4,5]];
  // v4.7: gold is set so gold + store-bought ore/wood/herbs costs about 1.15x the smithy's plain item (1.7x for the +2 pieces).
  // That sits between buying it (1.0x) and buying then forging it (1.6x / 2.8x), and the monster parts are the real gate.
  const R0=R;const Rg=(o)=>{const price=GEAR[o.id.split('+')[0]].price,plus=+o.id.split('+')[1];let buy=0;Object.keys(o.m).forEach(k=>{if(MAT_PRICE[k])buy+=MAT_PRICE[k]*o.m[k];});
    o.g=Math.max(Math.round(price*.15),Math.round(price*(plus>=2?1.7:1.15)-buy));R0(o);};
  gt.forEach((tiers,T)=>tiers.forEach((tier,j)=>{
    const n=2+j+T,plus=T===2&&j===1?2:1,g=Math.round(PRICE[tier]*.35);
    const rel=j?{[REL[T]]:1}:{};
    Rg({cat:'weapon',id:`w_blade_${tier}+${plus}`,m:Object.assign({[ORE[T]]:n+1,fang:2},rel),g,t:T,tier});
    Rg({cat:'weapon',id:`w_dagger_${tier}+${plus}`,m:Object.assign({[ORE[T]]:n,fang:1,hide:1},rel),g,t:T,tier});
    Rg({cat:'weapon',id:`w_staff_${tier}+${plus}`,m:Object.assign({[WOOD[T]]:n+1,ichor:2},rel),g,t:T,tier});
    Rg({cat:'weapon',id:`w_tome_${tier}+${plus}`,m:Object.assign({[WOOD[T]]:n,ichor:2,bluecap:1},rel),g,t:T,tier});
    Rg({cat:'weapon',id:`w_bow_${tier}+${plus}`,m:Object.assign({[WOOD[T]]:n+1,hide:1,fang:1},rel),g,t:T,tier});
    Object.keys(FAM_MAT).forEach(f=>{const [raw,part]=FAM_MAT[f],base=raw==='ore'?ORE[T]:WOOD[T];Rg({cat:'weapon',id:`w_${f}_${tier}+${plus}`,m:Object.assign({[base]:n+1,[part]:part==='bluecap'?1:2},rel),g,t:T,tier});});
    Rg({cat:'armor',id:`a_mail_${tier}+${plus}`,m:Object.assign({[ORE[T]]:n+1,scale:2},rel),g,t:T,tier});
    Rg({cat:'armor',id:`a_robe_${tier}+${plus}`,m:Object.assign({[WOOD[T]]:1,ichor:2,bluecap:n},rel),g,t:T,tier});
    Rg({cat:'armor',id:`a_vest_${tier}+${plus}`,m:Object.assign({hide:n+1,scale:1},rel),g,t:T,tier});
  }));
  // charms
  R({cat:'charm',id:'c_vital',m:{healroot:3,hide:2},g:40,t:0});
  R({cat:'charm',id:'c_mana',m:{bluecap:3,ichor:2},g:40,t:0});
  R({cat:'charm',id:'c_swift',m:{$rel:2,fang:2,ash:1},g:90,t:1});
  R({cat:'charm',id:'c_clarity',m:{sunpetal:2,$rel:2,grit:1},g:90,t:1});
  [['c_str',{$rel:3,fang:3,iron:2}],['c_int',{$rel:3,ichor:3,bluecap:2}],['c_vit',{$rel:3,hide:3,grit:1}],['c_spi',{$rel:3,sunpetal:2}],
   ['c_agi',{$rel:3,fang:2,ash:1}],['c_dex',{$rel:3,scale:2,ash:2}],['c_luk',{$rel:2,healroot:4,core:1}]].forEach(([id,m])=>R({cat:'charm',id,m,g:200,t:1}));
})();
const RCAT=[['potion','Potions'],['weapon','Weapons'],['armor','Armor'],['charm','Charms'],['item','Travel']];
// which crafting station owns which recipe category
const SMITH_CATS=['weapon','armor'],ALCH_CATS=['potion','charm','item'];
