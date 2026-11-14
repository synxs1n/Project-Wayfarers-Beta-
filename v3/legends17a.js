// ===== legends17a.js: two new Legendary wayfarers, Joseth Kynmar the Bloodhowl (Blood Summoner) and Dist, Taker of Hearts (Chief Bandit) =====
// The owner's baseline: a Legendary is an upgraded version of a base class with special abilities of its own.
// JOSETH (id jose, class key bloodcaller, Fire / Lightning) is an upgraded Priest. His heals are level with a Priest's (same numbers, same magic
//   and Faith curves); what he adds is party-wide blessings and the pack:
//   - Blood Pact: his summons cost HP, never MP (L17.cost: one pet 12% of max HP, the whole pack 30%, a guardian or a recruited boss 25%, the one
//     call-back a battle 15%; HP never drops under 1). Auto battle never pays below half HP (L17.autoHp).
//   - Three pet slots (G.j17.slots, an optional save field; an empty slot holds his own dog). His dogs Junah (golden retriever, healer), Odin (sable
//     German Shepherd, saboteur) and Zeus (black and white husky, magic) are not tamed pets: they are not in G.tamed, cannot be released and take none
//     of the 8 taming places. A tamed pet can be put in a slot instead; at most one recruited boss among the three.
//   - Whistle calls the next pet of his slots, Call the Pack all that have not been called. They stand BESIDE the Vanguard (extra units in B.front,
//     u.j17 'pet'), he stays on the field. A pack pet fights at L17.pack.pw (.7) power with L17.pack.hp (60%) of a pet's HP for L17.pack.turns (4)
//     of its own turns. Once per battle Whistle calls back one pet that left or fell (L17.pack.backTurns 3 turns).
//   - The dogs have their own turn code (j17DogPick): Junah heals the weakest ally, gives Regen and cleanses; Odin slows, weakens, breaks, steals and
//     strips boons; Zeus casts single and area lightning and stuns. A tamed pet in a slot fights as any summoned pet does (comp.js).
//   - One layer of summons at a time: a guardian (Invoke, as a Priest, paid in HP), a recruited boss (he is a caller: b16Caller) or Cerberus sends
//     the pack home; the pack cannot be called while one of those stands.
//   - Limit I "Cerberus, the Bound Pack" (level 15) and Limit II "Cerberus Stormcrown" (level 30): a boss sized three headed hound that stands in
//     front of the Vanguard without replacing it (u.j17 'cer') for 3 / 4 turns.
//   - Blood Oath: with him in the fight beaten monsters sometimes swear to him (L17.oath: 8% in a field or dungeon fight, 10% a Lesser Scourge from a
//     Scourge, 10% a Sanctum or den guardian as a recruited boss; never a Calamity). One roll at the higher chance with Nikaris along.
//   - Every summon he makes uses the blood summon: he cuts his palm, drops to one knee and slams the palm on the ground; a blood red sigil ring
//     spreads over the floor, smoke bursts and the summon stands in it (bigger for a guardian, a boss and Cerberus). Poses jblood and jslam.
// DIST (id dist, class key chief, Water) is an upgraded Thief:
//   - Light Fingers: every hit he lands has L17.lf.ch (12%) to lift a little gold (at most L17.lf.cap 40% of the fight's own gold) and he is 10%
//     harder to hit.
//   - Cutwater: six hits, each with its own crit and Light Fingers roll. Water Clone: a water double (a palette swapped, see-through copy of his
//     sprite) stands with him for 3 of his turns and repeats every damaging skill at L17.clone.pw (45%; the fallback if it tests high is 35%)
//     with no MP cost, no steal and no gold. Pick Up the Pace: Haste for the Vanguard one turn longer, and each of them acts 20% sooner (L17.pace; the proposal had 30% for 12 MP: tuned after the class comparison, docs/sumbal17.md).
//     Slip Under: cannot be targeted until his next turn (area moves hit for half), +50% crit on his next attack, not two turns running.
//     Toll Toss: costs gold (40 x the realm number) instead of MP. Shakedown strips one boon and always lifts gold.
//   - Limit I Tidecrew Rush (nine hits, every foe at least once) and Limit II Clean Sweep (two waves, twelve hits, a boon off every foe, gold).
//     His crew runs across the field while the hits land (drawn only).
// BOTH: kits of 14 on the roster17 levels (R17.lv), three known at level 10, two marked as the hero's own. Unlock: a redeem code (LEGEND_CODES)
//   OR the special quest, which also posts on the board without a code from a later realm (j17QuestRoll) and unlocks the hero on the account
//   when it is finished: "Three Whistles" (Joseth) and "The Toll on the Water" (Dist). New ids only; no save field is renamed.
// Hook points outside this file: data.js classAttrBuild (the class curves as a named function). Test: tools/chrome/v194a.js.
const L17={
  cost:{pet:.12,pack:.30,guard:.25,back:.15,ward:.08,raise:.06},autoHp:.5,
  pack:{pw:.7,hp:.6,turns:4,backTurns:3,draw:1},// draw: how often a foe's single blow aimed at a pack pet stays on it (1 = like any unit; lower sends it on to a hero)
  cer:[{pw:.6,hp:.4,turns:3},{pw:null,hp:.55,turns:4,heal:.2}],// pw null: the guardian strength (SUM.powM)
  sic:{dmg:1.2},oath:{field:.08,scourge:.10,guard:.10},
  lf:{ch:.12,cap:.4,eva:.1},clone:{pw:.45/* fallback if it tests high: .35 */,turns:3,mp:10},pace:{pull:.2,turns:1},slip:{crit:.5,area:.5},toll:{gold:40},
  crew:{lifts:6},
  anim:{blood:300,kneel:170,slam:260,ring:620,land:560,total:1150},
  q:{dist:{code:1,free:2},jose:{code:2,free:3},ch:.35},
  ids:['jose','dist'],dogs:['junah','odin','zeus']};
// ---------- 1. the two classes ----------
CLS.bloodcaller={n:'Blood Summoner',legend:1,role:'Legendary handler. Heals like a Priest, blesses the whole line and pays in blood to call his three dogs, guardians and Cerberus.',hp:[48,9.6],mp:[24,3.2],atk:[4,.8],def:[6,1.4],mag:[11,2.4],res:[9,2],spd:[8,.7],pref:['fth','vit','spi']};// (the Priest's magic, resistance and speed; 20% more HP, 20% less MP)
CLS.chief={n:'Chief Bandit',legend:1,role:'Legendary thief. Six-hit flurries, a water double that repeats his attacks, a haste for the whole line, and other people\'s gold.',hp:[43,8.8],mp:[16,2.2],atk:[8.8,2.1],def:[5,1.3],mag:[4,.8],res:[5,1.25],spd:[13,1.12],pref:['agi','dex','luk']};// (about 10% more attack, 5% more HP and MP than a Thief; the proposal had 13% and 10%)
DEXLUK.bloodcaller={dex:[3,.5],luk:[5,.7]};DEXLUK.chief={dex:[7,1.1],luk:[7,1.1]};
FTH.bloodcaller=FTH.healer.slice();
classAttrBuild('bloodcaller');classAttrBuild('chief');
CF.bloodcaller=['staff','robe'];CF.chief=['dagger','vest'];
// every per class table: the base class's row unless written here
(function(){const base={bloodcaller:'healer',chief:'thief'},put=(T,k,v)=>{try{if(T&&T[k]==null&&v!=null)T[k]=v;}catch(e){}};
  const tabs=()=>[ANIM_CLS,DL_CLS,CW_CLS,CLASS_DESC,DL_FB_CLS,PQ_TEXT,CLASS_W,CLS_WPN,CLS_KINDS,CLS_ARM,CLASS_ROLE,IC_TOKG,SK12.ult,SK12.gen,SK12.voice,SK12.arts.n,SK12.arts.d,DL_FORCE,ROLE9.wpn,SK12.slotNames,
    typeof CLS_KIND_ALT!=='undefined'?CLS_KIND_ALT:null,typeof ICF!=='undefined'?ICF:null];
  Object.keys(base).forEach(k=>{const b=base[k];let L=[];try{L=tabs();}catch(e){console.error('legends17a tables',e);}
    L.forEach(T=>{if(T&&T[b]!=null)put(T,k,Array.isArray(T[b])?T[b].slice():T[b]);});});
  ROLE9.cls.bloodcaller=['healer','summoner','buffer'];ROLE9.cls.chief=['phys','debuffer','buffer'];
  ROLES.cls.bloodcaller={p:'healer',s:['summoner','buffer']};ROLES.cls.chief={p:'phys',s:['debuffer','buffer']};
  ROLES.ref.bloodcaller='jose';ROLES.ref.chief='dist';ROLES.sk.bloodcaller=[];ROLES.sk.chief=[];
  SK12.ult.bloodcaller=[];SK12.ult.chief=[];if(!SK12.physCls.includes('chief'))SK12.physCls.push('chief');
  SIGW.bloodcaller="Handler's Crook";SIGW.chief='Tollkeeper';
  CLASS_DESC.bloodcaller={role:'Legendary blood summoner',str:'Heals like a Priest, blesses the whole line, calls three pets at once and pays for every summon in HP.',wpn:'Staves and robes'};
  CLASS_DESC.chief={role:'Legendary bandit chief',str:'Many small hits, a water double that repeats them, haste for the line and gold from every pocket.',wpn:'Daggers and vests'};
  DL_FB_CLS.bloodcaller=['my pack','whistle'];DL_FB_CLS.chief=['my crew','take'];
  PQ_TEXT.bloodcaller='{n} lost a dog to {r} once. The other three have not forgotten.';PQ_TEXT.chief='{n} was robbed exactly once, by {r}. He wants it back, with interest.';
  try{[['bloodcaller','healer'],['chief','thief']].forEach(([k,b])=>{CLS_WPN[b].forEach(f=>{if(EF_USERS[f]&&!EF_USERS[f].includes(CLS[k].n))EF_USERS[f].push(CLS[k].n);});const f=ARM_FAM[CLS_ARM[b]];if(EF_USERS[f]&&!EF_USERS[f].includes(CLS[k].n))EF_USERS[f].push(CLS[k].n);});}catch(e){}
})();
TRAITS.bloodpact=['Blood Pact','Legendary: his summons cost HP, never MP; three pets out at once; beaten monsters sometimes swear to him'];
TRAITS.lightfingers=['Light Fingers','Legendary: every hit may lift a little gold, and he is 10% harder to hit'];
SIG.jose={n:'Blood Pact',d:`His summons cost HP, never MP. He keeps three pets and can have all three out at once, beside the Vanguard. With him in the fight beaten monsters sometimes swear to him (${Math.round(L17.oath.field*100)}% in normal fights), and a beaten Scourge or Sanctum guardian sometimes follows as a recruited boss.`};
SIG.dist={n:'Light Fingers',d:`Every hit he lands has a ${Math.round(L17.lf.ch*100)}% chance to lift a little gold (up to ${Math.round(L17.lf.cap*100)}% of the fight's own gold), and he is ${Math.round(L17.lf.eva*100)}% harder to hit.`};
// ---------- 2. the wayfarers ----------
const L17_LOOK={
  jose:{b:'light',hair:'short',hat:'widebrim',back:['cape'],wpn:'staff_crook',sk:2,jose:1,cowl:1,
    pal:{H:'#1c1416',P:'#7a1c24',Q:'#ff8a3a',J:'#2c2830',Y:'#2c2830',K:'#26222a',B:'#3a2420',L:'#3a2a22',M:'#9a9aa8',N:'#5a5a68',G:'#ffe14a',W:'#7a5240',R:'#a8242c',r:'#e0303a',a:'#e8a850',f:'#2a2228',i:'#f2f3f6',o:'#8a1c26'}},
  dist:{b:'light',hair:'short',face:['mask'],wpn:'twindagger',sk:1,dist:1,
    pal:{H:'#18222e',P:'#24507a',Q:'#f0c040',J:'#12202e',Y:'#3ab0d8',K:'#1a2634',B:'#2a2a34',L:'#5a3a22',M:'#cfe2ee',N:'#7a94a8',G:'#f0c040',C:'#4aa8ff',Z:'#bfe6ff',o:'#2f8fb0',i:'#bfe6ff',a:'#f0c040',f:'#a8782a'}}};
RAW.push(['jose','Joseth','bloodcaller',['fire','lightning'],'bloodpact',"Joseth Kynmar, the Bloodhowl. A handler in a wide hat and a dark red coat who pays for every call in his own blood. Three dogs answer his whistle: Junah, Odin and Zeus. Something with three heads answers when he is angry.",'L',L17_LOOK.jose]);
RAW.push(['dist','Dist','chief',['water'],'lightfingers',"Dist, Taker of Hearts. Chief of the Tidecrew, the bandits who work the river crossings. Quick hands, a quicker smile, and a double made of water that hits you again after he does.",'L',L17_LOOK.dist]);
L17.ids.forEach(id=>{const r=RAW.find(x=>x[0]===id);TPL[id]={id,n:r[1],cls:r[2],el:r[3],trait:r[4],bio:r[5],src:r[6],look:r[7]};if(!LEGEND_IDS.includes(id))LEGEND_IDS.push(id);});
TPL.jose.title='Joseth Kynmar, the Bloodhowl';TPL.dist.title='Dist, Taker of Hearts';
// hidden templates (never in RAW, never recruitable; flagged summon and j17hid): the water clone (Dist's sprite on a water palette) and five of his crew for the Limit and the quest
const L17_GANG=(function(){const gp=(o,p)=>Object.assign({b:'light',wpn:'dagger',sk:1,gang:1,pal:Object.assign({H:'#1e2630',P:'#1f3e5c',Q:'#3ab0d8',J:'#101c28',Y:'#2a7a9a',K:'#18222c',B:'#26262e',M:'#b8c8d4',N:'#6a8090',C:'#4aa8ff'},p||{})},o);
  return [gp({hair:'short',hat:'hood',face:['mask']}),gp({hair:'spiky',hat:'goggles',back:['scarf'],sk:3}),gp({hair:'bald',face:['mask'],size:'big',wpn:'twindagger',sk:2}),gp({hair:'bob',hat:'hood',back:['scarf'],size:'small',sk:0}),gp({hair:'mohawk',face:['scar'],wpn:'twindagger',sk:4})];})();
// (made the first time one is needed, j17Hid: a page that never meets them has no such template, so a list of every template is a list of wayfarers)
const L17_HID={dist_wc:()=>Object.assign({},L17_LOOK.dist,{j17wc:1,skin:'#bfe6ff'}),dist_tk:()=>({b:'light',hair:'bald',hat:'widebrim',face:['beard'],wpn:'none',sk:3,gang:1,pal:{H:'#3a2a1e',P:'#4a4438',Q:'#f0c040',J:'#2a2620',Y:'#2a7a9a',K:'#2a2a2e',B:'#2a2420'}})};
L17_GANG.forEach((L,i)=>{L17_HID['dist_c'+i]=()=>L;});
function j17Hid(id){if(!TPL[id]&&L17_HID[id])TPL[id]={id,n:'Dist',cls:'chief',el:['water'],trait:'lightfingers',bio:'',src:'j17',summon:1,j17hid:1,look:L17_HID[id]()};return id;}
// the toll keeper of the quest: one of the crew in a plain coat
// the garments follow the base class (the rig cuts cloth by class key)
{const hc0=heroCls;heroCls=function(L,id){if(L&&L.jose)return 'healer';if(L&&(L.dist||L.gang))return 'thief';return hc0.apply(this,arguments);};}
// signature weapons (engine2.js registerSignatures ran before these two existed). No rival is built for them (rivals.js): a rival is a MON entry, and
// MON feeds the arena and the Daily Trial's seeded pick, which must stay as it is; their personal quest uses the plain bounty beast.
try{L17.ids.forEach(id=>{const t=TPL[id],fam=CF[t.cls][0],base=GEAR['w_'+fam+'_4']||GEAR['w_'+fam+'_3'],o={n:`${t.n}'s ${SIGW[t.cls]}`,slot:'w',tier:4,only:id,fam,el:t.el[0],price:2400,attr:{[CLS[t.cls].pref[0]]:5}};
    ST.forEach(k=>{if(base[k])o[k]=Math.round(base[k]*(base[k]>0?1.08:1));});addGear('u_'+id,o);const g=GEAR['u_'+id];
    try{g.price0=g.price;g.price=Math.round(g.price*ECON.gear);g.__ec=1;}catch(e){}g.relic=1;g.bound=1;});}catch(e){console.error('legends17a gear',e);}
// redeem codes (legends.js: SHA-256 of 'aurelis-legend:' + CODE, upper case, no spaces). The placeholders follow the three older ones:
// JOSETH-PLACEHOLDER and DIST-PLACEHOLDER. Swap a hash to change a code (see the note at the top of legends.js).
LEGEND_CODES['ebf0c909796ecaaa8c9f75eb090e3058c089d35e26fd31573a19a3f8f499a2f2']='jose';
LEGEND_CODES['8d9e36b76f3e04f9ecd4d7ebcfa9590b370db88c8e72daef6aa39fd1ac50f5ee']='dist';
// their own lines (duellines.js): the duel of the quest, its shout at half health, the join, the rival of the personal quest
try{Object.assign(DUEL_LINES,{
 jose:{o:"They like you. I am harder to please.",m:"Blood answers blood!",w:"Good. They were right about you. Four of us, then. Five, on a bad day.",l:"Down, all three. Leave them breathing. Come back when you can stand.",f:"Run if you like. Odin already has your scent.",d:"Not today? The dogs will remember you either way.",r:"You took one of mine once. Look around you. I brought the other three.",rw:"Good dogs. All of you. It is done."},
 dist:{o:"You followed the money. Nobody follows the money.",m:"Two of me now!",w:"You still have your purse. Nobody still has their purse. I am coming with you.",l:"Lighter already? Travel safe. Travel often.",f:"Leaving so soon? You dropped something. No, I have it.",d:"Another day, then. I know which pocket.",r:"Robbed once, by you. I have been adding up the interest ever since.",rw:"Paid in full. Keep the change."}});}catch(e){}
// roster17's table of the two skills a kit gained: for these two the kit comes whole from L17_KIT; the rows name their own two for tools that read it
try{R17.add.jose=['j_whistle','j_pack'];R17.add.dist=['d_clone','d_pace'];}catch(e){}
LEG_Q.jose={title:'Three Whistles',ok:s=>s>=Math.max(L17.q.jose.code,typeof DUAL_HERO_FROM==='number'?DUAL_HERO_FROM:2),ch:.3,desc:s=>`Three dogs have been seen on the roads of ${ZS(s).n}: a golden one that begs, a dark one that steals and a pale-eyed one that howls at storms. They answer to one whistle. Win all three over and the man behind it may show himself.`};
LEG_Q.dist={title:'The Toll on the Water',ok:s=>s>=L17.q.dist.code,ch:.3,desc:s=>`Somebody has put a toll on the river crossing in ${ZS(s).n}, and nobody has seen who collects it. Pay it, catch the hand in your purse, and follow the money to the far bank.`};
// ---------- 3. art ----------
// The dogs are monster art on the 40x40 grid (facing right, paws on row 36, one shared body box so the three read as the same size). The idle frames
// carry no effects; motes, wisps and the howl with its bolt are the cast frame (f.t 'atk'). Cerberus is boss art on the 60x60 grid, drawn with the
// boss toolkit of art3.js (bsh depth shading on four tone ramps, tube bodies, a rim and a glow).
const L17A={};
// ---------- Junah: golden retriever (healer). Stocky, feathered, floppy ear, plume tail up, sleepy smile, a light charm on the collar ----------
L17A.junah=function(g,f){const F=mfr(f),u=F.b?1:0,w=F.b?-1:0;
  const bx=17,by=24,hx=28.5,hy=14+u;
  // plume tail, cream feathers hanging under it
  g.path([[bx-8,by-2],[bx-12,by-6+w],[bx-13.5,by-11+w]],'G',3.6);
  g.poly([[bx-8,by-1],[bx-11.5,by-4+w],[bx-15,by-10+w],[bx-16.5,by-3+w],[bx-12.5,by+1.5]],'C');g.px([[bx-15,by-1+w],[bx-13,by+1],[bx-16,by-5+w],[bx-14,by-3+w]],'c');
  // far legs
  limb(g,bx-5,by+3,bx-7,35,'g',2.8,'g');limb(g,bx+5,by+3,bx+4.5,35,'g',2.8,'g');
  // body and chest
  sph(g,bx,by,10,5.4,'G','g');sph(g,bx+8,by,5,5.8,'G','g');
  // belly and chest feathering (cream), ragged lower edge
  g.ell(bx+10,by+2.5,3,4,'C');g.px([[bx+8,by+6.5],[bx+10,by+7.5],[bx+11,by+6.5],[bx+9,by+8]],'C');
  for(let i=-6;i<=5;i++){g.s(bx+i,by+4.6,'C');g.s(bx+i,by+5.6,i%2?'C':'c');if(i%3===0)g.s(bx+i,by+6.6,'c');}
  // neck
  g.poly([[bx+4.5,by-5],[hx-4,hy-2],[hx+1,hy+5],[bx+11,by+2]],'G');g.poly([[hx-1.5,hy+5],[hx+1.5,hy+5],[bx+12,by+1],[bx+9.5,by]],'C');
  // near legs, feathered at the back
  limb(g,bx-5,by+3,bx-5,36,'G',3.2);limb(g,bx+7.5,by+3,bx+8,36,'G',3.2);g.ell(bx-5.5,by+3,3.4,3.6,'G');
  g.px([[bx-7.5,by+6],[bx-8,by+8],[bx-7.5,by+10],[bx+5.5,by+6],[bx+5,by+8],[bx+5.5,by+10]],'C');
  g.rect(bx-7,36,5,1,'C');g.rect(bx+6,36,5,1,'C');
  // head: blocky skull, broad blunt muzzle
  sph(g,hx,hy,5.6,5,'G','g');
  g.poly([[hx+2.5,hy-1.5],[hx+9,hy-.5],[hx+9.5,hy+3],[hx+3,hy+4.5]],'G');g.poly([[hx+3,hy+2],[hx+9.2,hy+2],[hx+8.5,hy+4.2],[hx+3,hy+5]],'C');
  g.rect(hx+8,hy-1,2,2,'N');
  // smile and tongue
  g.rect(hx+4,hy+4,4,1,'K');g.px([[hx+6,hy+5],[hx+7,hy+5],[hx+6,hy+6]],'T');
  // sleepy eye: a lid line with a soft highlight under the brow
  g.rect(hx+1,hy-1,3,1,'K');g.s(hx+2,hy,'g');g.s(hx+1,hy-2,'C');
  // floppy ear: hangs from the crown past the jaw, deeper red
  g.poly([[hx-4,hy-4.5],[hx-.5,hy-4],[hx+.5,hy+2],[hx-1.5,hy+6.5],[hx-5,hy+5]],'R');g.px([[hx-4,hy+5],[hx-3,hy+6],[hx-2,hy+6]],'r');g.px([[hx-3,hy-3],[hx-2,hy-3]],'G');
  // collar and the light charm (a small sun tag that glows)
  g.path([[hx-4.5,hy+6.5],[hx+1.5,hy+7.5]],'M',1);g.rect(hx+1,hy+8,2,2,'L');g.s(hx+1,hy+8,'W');g.px([[hx,hy+9],[hx+3,hy+8],[hx+2,hy+10]],'l');
  const sp=F.b?[[hx+6,hy+11],[hx-10,hy-5],[bx-2,by-9]]:[[hx+7,hy+10],[hx-11,hy-4],[bx-1,by-10]];
  if(F.atk)sp.forEach((p,i)=>{g.s(p[0],p[1],'L');if(i<2){g.s(p[0]-1,p[1],'l');g.s(p[0]+1,p[1],'l');g.s(p[0],p[1]-1,'l');g.s(p[0],p[1]+1,'l');}});
  return {pal:{G:'#dc8c44',g:'#b0642c',R:'#a8521f',r:'#7e3a16',C:'#f4dfb2',c:'#d2b07e',N:'#9a5a50',K:'#2a1a1c',T:'#e87a8a',M:'#6a8ab0',L:'#fff0a0',l:'#ffd86a',W:'#ffffff'},flat:'KTLlWN'};
};
// ---------- Odin: dark sable long coat shepherd (saboteur). Sloped back, big upright ears, black mask, heavy ruff, low brush tail, dark bandana ----------
L17A.odin=function(g,f){const F=mfr(f),u=F.b?1:0;
  const bx=16,by=24,hx=30,hy=14.5+u;
  // shadow wisps trailing off the tail and feet
  if(F.atk)[[2,23],[1,27],[5,37],[3,31],[36,8],[38,20],[34,25]].forEach(p=>g.s(p[0],p[1],'S'));
  // low brush tail
  g.path([[bx-9,by],[bx-12,by+5],[bx-11.5,by+10]],'D',4.2);g.path([[bx-9.5,by+3],[bx-10.5,by+9]],'t',1.4);
  // far legs (the hind one bent at the hock)
  g.path([[bx-5,by+3],[bx-8.5,by+7],[bx-6,35]],'d',2.6);g.rect(bx-7,35,4,1,'d');limb(g,bx+9,by+3,bx+10,35,'t',2.8,'t');
  // body: tan and grey sides, black saddle sloping down to the croup
  g.poly([[bx-9,by-1],[bx+7,by-6],[bx+11,by-2],[bx+10,by+5],[bx-7,by+5.5],[bx-10,by+3]],'t');
  g.poly([[bx-8,by-.5],[bx+7,by-5],[bx+9,by-2],[bx+8,by+3],[bx-6,by+3.5]],'T');
  g.poly([[bx-9,by-1.5],[bx+7,by-6.5],[bx+10,by-4],[bx+4,by-1.5],[bx-6,by+1]],'D');
  g.px([[bx-4,by+1],[bx-1,by],[bx+2,by-1],[bx+5,by-2],[bx-6,by+3],[bx,by+2],[bx+4,by+1]],'D');g.px([[bx-2,by+3],[bx+2,by+3],[bx+6,by+3],[bx-5,by+2]],'t');
  // near hind leg, bent
  g.path([[bx-6,by+2],[bx-9.5,by+7],[bx-7,36]],'T',3.2);g.ell(bx-6.5,by+2.5,3.2,3.4,'T');g.px([[bx-8,by+2],[bx-6,by+4]],'D');g.rect(bx-8,36,4,1,'t');
  // ruff: a heavy collar of long coat around the neck and chest
  sph(g,bx+9,by-2,5.6,6.4,'T','t');g.poly([[bx+5,by-7],[hx-3,hy+1],[hx+1,hy+4],[bx+13,by-1]],'D');
  g.px([[bx+7,by+3],[bx+9,by+4.5],[bx+11,by+3.5],[bx+12,by+1.5],[bx+6,by+1]],'A');g.px([[bx+8,by+5],[bx+10,by+5.5],[bx+12,by+4]],'t');
  // near foreleg
  limb(g,bx+7.5,by+3,bx+7.5,36,'T',3.4);g.rect(bx+6,36,5,1,'t');g.px([[bx+6.5,by+6],[bx+6.5,by+8]],'t');
  // bandana: dark cloth knotted at the nape, the point over the chest
  g.poly([[hx-5,hy+3.5],[hx+.5,hy+5],[hx-1.5,hy+10.5]],'V');g.path([[hx-5.5,hy+3],[hx-7.5,hy+2]],'V',1.6);g.s(hx-1.5,hy+7,'S');g.px([[hx-3,hy+5]],'v');
  // ears: tall, upright, slightly forward
  g.poly([[hx-.5,hy-3],[hx+2,hy-11],[hx+4,hy-3]],'d');
  g.poly([[hx-4.5,hy-2.5],[hx-3,hy-11.5],[hx+.5,hy-3.5]],'D');g.px([[hx-2.5,hy-7],[hx-2.5,hy-6],[hx-2,hy-5]],'T');
  // head: black mask and long muzzle, tan cheek
  sph(g,hx,hy,4.8,4.4,'D','d');g.px([[hx-3,hy+1],[hx-2,hy+2],[hx-3,hy+2],[hx-1,hy+3]],'T');
  g.poly([[hx+2.5,hy-1.8],[hx+9,hy+.2],[hx+8.8,hy+2.6],[hx+2.5,hy+2.8]],'D');g.poly([[hx+2.5,hy+2.6],[hx+8,hy+2.8],[hx+7,hy+4],[hx+2,hy+4.2]],'d');
  g.rect(hx+8,hy,2,2,'K');
  // the stare: amber eye under a heavy brow
  g.rect(hx+1,hy-2,2,2,'E');g.s(hx+2,hy-1,'K');g.s(hx+1,hy-2,'W');g.px([[hx,hy-3],[hx+1,hy-3],[hx+2,hy-3],[hx+3,hy-2]],'d');
  return {pal:{T:'#a88660',t:'#75614f',A:'#c9b08a',D:'#352c30',d:'#1f191d',V:'#5a3a86',v:'#3a2456',S:'#9a6adf',E:'#ffb43a',K:'#0e0a0e',W:'#ffffff'},flat:'SEKW'};
};
// the husky's head thrown back: skull, ears laid back, white mask, muzzle up at 45 degrees with a black bridge, jaws parted. crown: Limit II
function j17ZHead(g,hx,hy,eye){
  g.poly([[hx-2,hy-2.5],[hx-9,hy-3],[hx-4,hy+2]],'N');g.px([[hx-6,hy-2],[hx-5,hy-1]],'P');
  g.poly([[hx-1,hy-4],[hx-5.5,hy-8],[hx+1.5,hy-5]],'n');
  g.ell(hx,hy,5,4.6,'N');g.ell(hx+2.4,hy+1.4,3.2,3,'W');
  g.poly([[hx+1.5,hy-3],[hx+9.5,hy-9],[hx+11.5,hy-7],[hx+4.5,hy+.5]],'W');g.poly([[hx+.5,hy-3.6],[hx+8.5,hy-9.2],[hx+9.4,hy-8.2],[hx+2,hy-2.4]],'N');
  g.poly([[hx+4.5,hy+1],[hx+10,hy-3.6],[hx+10.8,hy-2.2],[hx+6,hy+3]],'W');
  g.px([[hx+6,hy-.5],[hx+7,hy-1.5],[hx+8,hy-2.5],[hx+9,hy-3.5]],'K');g.px([[hx+7,hy-.6]],'T');
  g.rect(Math.round(hx+10),Math.round(hy-10),2,2,'K');
  g.rect(Math.round(hx+2),Math.round(hy-1),2,1,eye);g.s(Math.round(hx+2),Math.round(hy-2),'N');g.s(Math.round(hx+1),Math.round(hy-1),'K');
}
// ---------- Zeus: black and white husky (magic). Idle: standing, looking ahead like the other two (same body box and ground line), sickle tail over the
// back, white legs, blaze and mask, ice blue eye. No lightning in the idle. The cast frame (f.t 'atk') is the howl: head thrown back, a bolt and sparks ----------
L17A.zeus=function(g,f){const F=mfr(f),u=F.b?1:0,howl=F.atk;
  const bx=17,by=24,hx=28.5,hy=14+u;
  // sickle tail curled up over the back, white underside
  g.path([[bx-9,by-2],[bx-12.5,by-6],[bx-10.5,by-10.5],[bx-6.5,by-9.5]],'N',3.4);g.path([[bx-10.5,by-5.5],[bx-9.5,by-8.5],[bx-7,by-8.5]],'W',1.3);
  // far legs
  limb(g,bx-5,by+3,bx-7,35,'w',2.6,'w');limb(g,bx+5.5,by+3,bx+5,35,'w',2.6,'w');
  // lean body, deep chest, white belly line and blaze
  sph(g,bx-.5,by,10.5,5.2,'N','n');sph(g,bx+8,by-.3,4.8,5.6,'N','n');
  for(let i=-6;i<=5;i++)g.s(bx+i,by+4.2,'W');g.px([[bx-3,by+3.2],[bx,by+3.2],[bx+3,by+3.2]],'W');
  g.ell(bx+10.3,by+2,2.8,4.2,'W');g.px([[bx+9,by+6],[bx+11,by+6]],'w');
  // near legs: black thigh, white from the knee down
  limb(g,bx-5,by+3,bx-5,36,'W',3);limb(g,bx+7.5,by+3,bx+8,36,'W',3);g.ell(bx-5.5,by+2.2,3.3,3.2,'N');g.px([[bx-6,by+6],[bx+6.5,by+5]],'w');
  g.rect(bx-7,36,5,1,'w');g.rect(bx+6,36,5,1,'w');
  if(howl){
    // the cast: neck up, head thrown back, the howl calls the bolt
    g.poly([[bx+4.5,by-5],[bx+6,by-11],[bx+11.5,by-11],[bx+12,by+1]],'N');g.poly([[bx+9,by-8],[bx+12,by-9],[bx+12.5,by+1],[bx+9.5,by]],'W');
    j17ZHead(g,bx+8,by-13,'I');
    bolt(g,36,3,10,2,'Y',1);g.px([[37,16],[38,4],[10,5],[8,9],[33,22],[3,16]],'Y');g.px([[35,6],[9,4]],'Z');
  }else{
    // neck and white throat
    g.poly([[bx+4.5,by-5],[hx-4,hy-1.5],[hx+1,hy+5],[bx+11,by+1.5]],'N');g.poly([[hx-1.5,hy+4.5],[hx+1.5,hy+5],[bx+12,by+1],[bx+9.5,by]],'W');
    // upright ears
    g.poly([[hx-.5,hy-3.5],[hx+1.5,hy-9.5],[hx+3.5,hy-3]],'n');
    g.poly([[hx-4.5,hy-2.5],[hx-3.2,hy-10],[hx,hy-3.5]],'N');g.px([[hx-2.6,hy-6],[hx-2.4,hy-5]],'P');
    // head: black cap, white mask and muzzle, black bridge
    sph(g,hx,hy,5,4.6,'N','n');g.ell(hx+1.6,hy+2,3.4,2.7,'W');
    g.poly([[hx+2.5,hy-1.2],[hx+9,hy+.2],[hx+8.8,hy+3],[hx+2.5,hy+4.4]],'W');g.rect(hx+3,hy-1,5,1,'N');g.px([[hx+4,hy+3],[hx+5,hy+3],[hx+6,hy+3]],'w');
    g.rect(hx+8,hy,2,2,'K');
    // ice blue eye, pale brow spot
    g.rect(hx+1,hy-2,2,2,'I');g.s(hx+2,hy-1,'K');g.s(hx+1,hy-2,'Z');g.s(hx+1,hy-4,'W');g.s(hx+2,hy-4,'W');
  }
  return {pal:{N:'#363440',n:'#1e1c28',W:'#f2f3f6',w:'#b9bdcc',P:'#c88a8a',K:'#0e0a12',T:'#e87a8a',I:'#7fd6ff',Y:'#ffe14a',Z:'#ffffff'},flat:'KTYZI'};
};
// ---------- Cerberus: the limit summon, drawn the way the game's bosses are (art3.js: bsh depth shading on four-key ramps, btube bodies,
// bspike fur, a rim colour and a glow). One heavy hound in a braced stance; three necks fan out of the shoulders so every head sits against open
// background: the husky on top howling, the retriever in the middle with a steady warm stare, the shepherd low, snarling on a mouthful of fire.
// ev 0 = Limit I, the Bound Pack: 0.86 scale, blood red collars joined by chains. ev 1 = Limit II, Stormcrown: full frame, chains snapped,
// a crown of lightning over the pack, a mane of flame, twin tails, arcs between all three heads ----------
function j17Cer(g,f,ev){const F=mfr(f),u=F.b?1:0,s=ev?1:.86,ox=ev?0:3,oy=ev?0:7.7;
  const X=x=>ox+x*s,Y=y=>oy+y*s,P=L=>L.map(p=>[X(p[0]),Y(p[1])]),XB=x=>ox+(x*.84-.4)*s,PB=L=>L.map(p=>[XB(p[0]),Y(p[1])]),R=r=>Array.isArray(r)?r.map(v=>v*s):r*s;
  const HD='abcd',HDD='cddd',HK='efgh',WH='ijkl',GD='mnop',SB='qrst';
  let body=1;const tube=(pts,r,K,o)=>bsh(g,[['t',(body?PB:P)(pts),R(r)]],K,o);
  const flame=(x,y,h,w,lean)=>{lean=lean||0;x=(body?XB:X)(x);y=Y(y);h*=s;w*=s;
    g.poly([[x-w,y],[x-w*.5+lean*.3,y-h*.5],[x-w*.1+lean*.5,y-h*.32],[x+lean,y-h],[x+w*.55+lean*.5,y-h*.4],[x+w,y]],'V');
    g.poly([[x-w*.6,y],[x-w*.1+lean*.4,y-h*.45],[x+lean*.8,y-h*.72],[x+w*.6,y]],'F');g.poly([[x-w*.3,y],[x+lean*.4,y-h*.42],[x+w*.3,y]],'Y');};
  const zig=(pts,t)=>{const Q=P(pts);g.path(Q,'L',t||1);Q.forEach((q,i)=>{if(i&&i<Q.length-1)g.s(q[0],q[1],'Z');});};
  // ---- tails ----
  tube([[10,36],[5,33],[2.5,27],[4.5,21.5]],[2.6,2.2,1.7,1.1],HD);flame(2.6,28,6,2.2,-1);flame(4.6,23,9+u,2.8,1);
  if(ev){tube([[10,39],[4,40.5],[2,35.5]],[2.4,1.9,1.2],HDD);flame(2.2,37,8-u,2.6,-1);}
  // ---- far legs ----
  tube([[19,42],[16,48],[19,54]],[3,2.4,2],HDD);bsh(g,[['e',XB(20),Y(55),3.6*s,1.5*s]],HDD);
  tube([[39,40],[41,47],[40,54]],[3.2,2.6,2.1],HDD);bsh(g,[['e',XB(41.5),Y(55),3.8*s,1.5*s]],HDD);
  // ---- fire along the spine (behind the body) ----
  (ev?[[9,33,9],[13,32,13],[18,31,15],[23,30,14],[28,29,16],[32,27,13]]:[[11,33,6],[16,32,9],[21,31,8],[26,30,10],[30,29,7]]).forEach((m,i)=>flame(m[0],m[1],m[2]+((i+u)%2)*1.5,2.8,(i%2?1:-1)));
  if(ev)[[27,25,12,3,-2],[34,22,13,3,1]].forEach(m=>flame(m[0],m[1],m[2]+u,m[3],m[4]));
  // ---- body: haunch, barrel, deep chest ----
  bsh(g,[['t',PB([[10,38],[18,37.2],[27,35.6],[34,34.5]]),R([5.4,7.2,8.2,9.2])],['e',XB(12.5),Y(40.5),6.6*s,7*s],['e',XB(35),Y(37.5),7.2*s,8.4*s]],HD,{cap:13});
  // muscle lines and hackles
  g.path(PB([[15,35],[17.5,40],[16,45]]),'c',1);g.path(PB([[29,32],[30.5,38],[29,43]]),'c',1);g.px(PB([[21,43],[23,43.6],[25,43.6]]),'d');
  [[13,31.6],[17,30.4],[21,29.4],[25,28.4]].forEach(q=>bsh(g,[['k',XB(q[0]),Y(q[1]+1.5),XB(q[0]-1.5),Y(q[1]-1.6),2.4*s]],HD));
  // ---- near legs: braced wide, claws out ----
  tube([[11.5,44],[7.5,49],[10,54]],[3.6,2.8,2.3],HD);bsh(g,[['e',XB(11.5),Y(55),4.2*s,1.6*s]],HD);
  tube([[31,41],[32,48],[31,54]],[4,3,2.6],HD);bsh(g,[['e',XB(33),Y(55),4.6*s,1.7*s]],HD);
  g.px(PB([[9,56],[11.5,56],[14,56],[30.5,56],[33,56],[35.5,56]]),'W');
  if(ev){flame(9,54,5,1.6,-1);flame(36.5,54,5,1.6,1);}
  body=0;
  // ---- the storm crown (behind the top head) ----
  if(ev){const cx=X(31),cy=Y(6.5);for(let a=-1;a<=1;a+=.08){g.s(cx+a*9,cy+1.6-Math.cos(a*1.5)*1.6,'L');}
    [[-8.5,6,-2],[-4.5,8.5,-1],[0,10.5,0],[4.5,8.5,1],[8.5,6,2]].forEach((q,i)=>{const x0=cx+q[0],h=Math.min(q[1]+((i+u)%2?1:0),cy-1);g.poly([[x0-1.6,cy],[x0+q[2]*.6-.4,cy-h*.5],[x0+q[2]*.4+.9,cy-h*.45],[x0+q[2],cy-h],[x0+1.6,cy]],'L');g.s(x0,cy-1,'Z');g.s(x0+q[2]*.4,cy-h*.5,'Z');});}
  // ---- top head: the husky, howling ----
  tube([[27,30],[28,23],[30.5,16.5]],[4.4,3.8,3.2],HK);tube([[29.7,28],[30.3,23],[31.9,18]],[1.3,1.2,1],WH);
  {const hx=X(33),hy=Y(13)-u;
   bsh(g,[['k',hx-1,hy-3.4,hx-5.6,hy-8.6,3.6]],'gghh');bsh(g,[['k',hx-2.4,hy-.6,hx-9,hy-3.6,4.2]],HK);g.px([[hx-5.6,hy-2.6],[hx-4.6,hy-2]],'T');
   bsh(g,[['e',hx,hy,4.9,4.5]],HK);bsh(g,[['e',hx+2.4,hy+1.5,3.1,2.8]],WH);
   bsh(g,[['p',[[hx+1.4,hy-3],[hx+9.4,hy-9.2],[hx+11.4,hy-7.2],[hx+4.6,hy+.4]]]],WH);g.line(hx+.8,hy-3.6,hx+8.6,hy-9.4,'f');g.line(hx+1.6,hy-3.4,hx+8.2,hy-8.4,'f');
   bsh(g,[['p',[[hx+4.8,hy+1.2],[hx+10,hy-3.4],[hx+10.9,hy-2],[hx+6.2,hy+3.2]]]],WH);
   g.px([[hx+6,hy-.4],[hx+7,hy-1.4],[hx+8,hy-2.4],[hx+9,hy-3.4]],'K');g.s(hx+7,hy-.4,'T');g.px([[hx+9.4,hy-4.6],[hx+8.6,hy-1.2]],'W');
   g.rect(Math.round(hx+10),Math.round(hy-10),2,2,'K');
   g.rect(Math.round(hx+2),Math.round(hy-1),2,1,'I');g.s(Math.round(hx+1),Math.round(hy-1),'K');g.s(Math.round(hx+2),Math.round(hy-2),'f');g.s(Math.round(hx),Math.round(hy-3),'i');
   bolt(g,hx+12.5,hy-13.5+u,ev?7:5,2,'L',1);}
  // ---- middle head: the retriever, level and unhurried, eyes lit ----
  tube([[31,31],[37.5,26.5],[42,23.6]],[4.8,4.2,3.8],GD);g.px(P([[34,33.4],[36,32.4],[38,31],[40,29.6]]),'C');g.px(P([[35,34],[39,31.4]]),'C');
  {const hx=X(44.5),hy=Y(21.4)+u;
   bsh(g,[['e',hx,hy,5.4,4.9]],GD);
   bsh(g,[['p',[[hx+2.4,hy-1.6],[hx+8.8,hy-.6],[hx+9.2,hy+3],[hx+3,hy+4.6]]]],GD);g.poly([[hx+3,hy+2.2],[hx+9,hy+2.2],[hx+8.4,hy+4.2],[hx+3,hy+5]],'C');
   g.rect(Math.round(hx+8),Math.round(hy-1),2,2,'K');g.rect(Math.round(hx+4),Math.round(hy+4),4,1,'K');
   g.rect(Math.round(hx+1),Math.round(hy-2),2,2,'G');g.s(Math.round(hx+2),Math.round(hy-1),'K');g.px([[Math.round(hx),Math.round(hy-3)],[Math.round(hx+1),Math.round(hy-3)],[Math.round(hx+2),Math.round(hy-3)]],'o');
   bsh(g,[['p',[[hx-4.2,hy-4.6],[hx-.4,hy-4],[hx+.6,hy+2],[hx-1.4,hy+6.6],[hx-5.2,hy+5]]]],'yyzz');g.px([[hx-3,hy-3.4],[hx-2,hy-3.4]],'m');}
  // ---- low head: the shepherd, snarling, fire behind the teeth ----
  tube([[32,38.5],[38.5,41],[44.5,43.6]],[4.6,4,3.5],SB);g.px(P([[34,42.8],[36,43.8],[38,44.6],[40,45.4],[42,46.2],[44,46.8],[35,41.4],[37,42.6],[39,43.4],[41,44.2]]),'u');
  {const hx=X(47.5),hy=Y(44);
   // the shepherd's ears: tall and upright with a tan inside, set against the open background under the retriever's jaw
   g.poly([[hx-.4,hy-3],[hx+3.4,hy-12.6],[hx+5.2,hy-3]],'s');g.px([[hx+3,hy-9.6],[hx+3,hy-8.6],[hx+3,hy-7.6],[hx+3,hy-6.6],[hx+2,hy-5.6]],'u');
   g.poly([[hx-5.2,hy-2.4],[hx-2.8,hy-13.8],[hx+1,hy-3.4]],'r');g.poly([[hx-3.6,hy-4],[hx-2.7,hy-10.8],[hx-.8,hy-4.4]],'u');g.px([[hx-3,hy-12.4],[hx-4,hy-8.4],[hx-4.4,hy-6]],'q');
   bsh(g,[['e',hx,hy,5.2,4.6]],SB);g.ell(hx-1.9,hy+1.9,2.5,2.1,'u');g.px([[hx,hy+3.4],[hx-1,hy-3.4],[hx,hy-4],[hx-4,hy],[hx-4,hy+1]],'u');
   g.poly([[hx+2.4,hy+1.6],[hx+9,hy+2],[hx+7.8,hy+6.6],[hx+2.4,hy+5.4]],'K');g.rect(Math.round(hx+3),Math.round(hy+3),4,2,'F');g.rect(Math.round(hx+4),Math.round(hy+3),2,1,'Y');
   bsh(g,[['p',[[hx+2.4,hy-2],[hx+9.6,hy-.6],[hx+9.4,hy+2],[hx+2.4,hy+2.4]]]],SB);g.px([[hx+4,hy],[hx+6,hy+.4]],'t');g.px([[hx+3,hy+1.4],[hx+5,hy+1.6],[hx+7,hy+1.8]],'u');
   bsh(g,[['p',[[hx+2.2,hy+4.8],[hx+8.2,hy+5.8],[hx+7.2,hy+7.4],[hx+2,hy+6.6]]]],'sstt');
   g.px([[hx+8,hy+2.4],[hx+6,hy+2.4],[hx+4,hy+2.4],[hx+7,hy+5],[hx+5,hy+4.6]],'W');g.rect(Math.round(hx+8),Math.round(hy-1),2,2,'K');
   g.rect(Math.round(hx+1),Math.round(hy-2),2,2,'E');g.s(Math.round(hx+2),Math.round(hy-1),'K');g.px([[Math.round(hx),Math.round(hy-4)],[Math.round(hx+1),Math.round(hy-3)],[Math.round(hx+2),Math.round(hy-3)],[Math.round(hx+3),Math.round(hy-2)]],'t');}
  // ---- collars and chains ----
  [[24.2,25.2,31.6,23.2,0,1],[35.4,23.4,39,30.6,1,0],[36,35.4,34.4,43.6,1,0]].forEach(c=>{const Q=P([[c[0],c[1]],[c[2],c[3]]]);g.line(Q[0][0],Q[0][1],Q[1][0],Q[1][1],'R',1);g.line(Q[0][0]+c[4],Q[0][1]+c[5],Q[1][0]+c[4],Q[1][1]+c[5],'R',1);g.s((Q[0][0]+Q[1][0])/2,(Q[0][1]+Q[1][1])/2,'M');});
  const chain=pts=>{const Q=bpath(P(pts),1,1,1.5);Q.forEach((q,i)=>g.s(q.x,q.y,i%2?'M':'N'));};
  if(!ev){chain([[31.6,23.6],[33.6,27],[35.6,24.4]]);chain([[39,30.8],[39.8,34.6],[36.6,35.6]]);}
  else{chain([[31.6,23.6],[33.4,26],[32.8,28.4]]);chain([[39,30.8],[41,33],[40.4,34.8]]);chain([[34.6,43.6],[35.6,47],[34.6,49.6]]);chain([[24.4,25.4],[22.6,27.6],[23,30]]);}
  // ---- lightning between the heads ----
  if(ev){zig([[44,8],[47,10.5],[45,13.5],[47.5,16]],1);zig([[54.5,26.5],[57,29],[55,32],[56.5,35.5]],1);zig([[37,17.5],[40,19],[39,22]],1);g.px([[56,12+u],[57,22-u],[20,6+u],[57,48]],'L');}
  else{zig([[44,9.5],[46.5,12],[45,14.5],[47,16.5]],1);zig([[55,27],[57,30],[55.5,33]],1);}
  // ---- the cast frame: the shepherd's fire leaves his jaws, the retriever's eyes burn, a second bolt answers the howl ----
  if(F.atk){const hx=X(47.5),hy=Y(44),c=v=>Math.min(59,v);g.poly([[hx+8,hy+2.4],[c(hx+12.5),hy+.6],[c(hx+11.5),hy+3.6],[c(hx+13),hy+5.6],[hx+8,hy+6.2]],'F');g.poly([[hx+8,hy+3.2],[c(hx+11),hy+3],[hx+8,hy+5.4]],'Y');g.px([[c(hx+12),hy-1],[c(hx+13),hy+8]],'V');
    const mx=X(44.5),my=Y(21.4);g.rect(Math.round(mx+1),Math.round(my-2),2,2,'Y');bolt(g,X(33)+8,Y(13)-15,ev?8:6,-2,'L',1);g.px([[X(33)+15,Y(13)-6],[X(33)+4,Y(13)-14]],'Z');}
  const pal=Object.assign({},bT4(HD,'#6a2830'),bT4(HK,'#2c2b38'),bT4(WH,'#e6e8f0',{cool:'#3a4a7a'}),bT4(GD,'#d98a44'),bT4(SB,'#4c3e40'),
    {y:'#a8521f',z:'#7e3a16',u:'#a88660',C:'#f4dfb2',V:'#e2481c',F:'#ff8a3a',Y:'#ffd84a',L:'#ffe14a',Z:'#fffbd8',E:'#ff5a2a',G:'#fff0a0',I:'#8fdcff',K:'#0e0a12',W:'#f6f2e6',T:'#e87a8a',M:'#b0b0be',N:'#62626e',R:'#c4262e'});
  return {pal,flat:'VFYLZEGIKWT',glow:ev?'#ffe14a':'#ff8a3a',rim:'#1a0a12'};
}
L17A.cerberus=(g,f)=>j17Cer(g,f,0);L17A.cerberus2=(g,f)=>j17Cer(g,f,1);
MART.junah=L17A.junah;MART.odin=L17A.odin;MART.zeus=L17A.zeus;MART.cerberus=L17A.cerberus;MART.cerberus2=L17A.cerberus2;
['cerberus','cerberus2'].forEach(k=>{if(!BIG_ART.includes(k))BIG_ART.push(k);});
// the dogs and Cerberus as monster data (kept out of MON on purpose: MON feeds the arena, the Daily Trial's seeded picks and the Bestiary total)
const L17_MON={
  junah:{n:'Junah',art:'junah',el:['light'],hp:1.15,atk:.8,def:1,mag:1.2,res:1.2,spd:1,j17:1,role:'healer',d:"Joseth's golden retriever. She heals, and she forgives.",
    sk:[['Sunny Bark','light',1,'one','mag',[['blind',.3]]],['Golden Hour','light',0,'self','buff',[['regen',1]]]]},
  odin:{n:'Odin',art:'odin',el:['shadow'],hp:1,atk:1.15,def:1,mag:.8,res:.9,spd:1.3,j17:1,role:'saboteur',d:"Joseth's sable shepherd. He takes what you were holding.",
    sk:[['Hamstring','shadow',1.1,'one','phys',[['slow',.8],['weaken',.5]]],['Throat Hold','shadow',1.2,'one','phys',[['break',.8]]],['Shadow Stare','shadow',.4,'all','mag',[['blind',.5]]]]},
  zeus:{n:'Zeus',art:'zeus',el:['lightning'],hp:.85,atk:.8,def:.8,mag:1.35,res:1.1,spd:1.15,j17:1,role:'magic',d:"Joseth's husky. He howls and the sky answers.",
    sk:[['Bolt Fang','lightning',1.5,'one','mag'],['Skyhowl','lightning',1,'all','mag',[['stun',.12]]],['Static Coat','lightning',0,'self','buff',[['focus',1],['haste',1]]]]},
  cerberus:{n:'Cerberus, the Bound Pack',art:'cerberus',el:['fire','lightning'],hp:2,atk:1.3,def:1.1,mag:1.3,res:1.1,spd:1.1,j17:1,d:'Three heads on one chain: the pack as it is when Joseth bleeds for it.',
    sk:[['Threefold Bite','fire',1.5,'one','phys',[['burn',.5]]],['Skyhowl','lightning',1,'all','mag',[['stun',.2]]]]},
  cerberus2:{n:'Cerberus Stormcrown',art:'cerberus2',el:['fire','lightning'],hp:2.2,atk:1.4,def:1.15,mag:1.4,res:1.15,spd:1.15,j17:1,d:'The chains are off. A crown of lightning, a mane of fire.',
    sk:[['Threefold Bite','fire',1.5,'one','phys',[['burn',.5]]],['Skyhowl','lightning',1,'all','mag',[['stun',.2]]],['Stormcrown Howl','fire',1.5,'all','mag',[['burn',.6],['stun',.3]]]]}};
const j17Mon=k=>L17_MON[k]||null;
// the template of a dog as a unit (like a tamed pet's, engine2.js registerTamed: the class gives the stat curve), made when it is first called
function j17DogTpl(k){const id='j17_'+k;if(!TPL[id]){const m=L17_MON[k];TPL[id]={id,n:m.n,cls:tameClass(m),el:m.el.slice(),trait:tameTrait(m),bio:m.d,src:'tame',look:null,mon:k,art:m.art,j17dog:k,j17hid:1};}return id;}
{const cd0=compDef;compDef=function(o){if(o&&o.mon&&L17_MON[o.mon])return L17_MON[o.mon];return cd0.apply(this,arguments);};}
// the Bestiary lists them once they have been met (the dogs: called or fought in the quest; Cerberus: called)
HOOK.xform('bestAll','legends17a','the dogs and Cerberus, once met',function(out){try{Object.keys(L17_MON).forEach(k=>{const d=L17_MON[k];if((META.best[d.n]||{}).seen&&!out.some(o=>o.k===k))out.push({k,d,g:k.indexOf('cerberus')===0?1:0,zone:0,j17:1});});}catch(e){}return out;});
function j17Seen(k){try{const d=L17_MON[k];if(d&&!(G&&G.daily)){const b=bestOf(d.n);if(!b.seen)b.seen=1;}}catch(e){}}

// ---- hero flair: what the look tables cannot say ----
function j17Has(g,x,y,ks){const k=g.g(x,y);return !!k&&ks.includes(k);}
// Joseth: the hood worn down as a cowl, a collar chain with a whistle, three dog tags on the belt (gold, black, white), a red paw print on the cape
function j17JoseBase(g,view){const has=(x,y,ks)=>j17Has(g,x,y,ks);
  if(view==='side'){g.poly([[12.5,18.2],[14.5,16.4],[18,16.8],[24.5,18],[24,20.4],[18,21.4],[13,21.4]],'Y');g.poly([[12.5,18.5],[10.8,23.5],[14.5,21.4]],'Y');g.px([[14,20],[16,21],[19,20],[22,20],[12,21],[12,22]],'z');g.px([[15,17],[17,17]],'z');
    for(let x=15;x<=23;x++)if(has(x,18,'PpQq'))g.s(x,18,'M');
    if(has(20,19,'PpQq'))g.s(20,19,'M');if(has(20,20,'PpQq')){g.s(20,20,'X');g.s(20,21,'X');g.s(21,21,'X');}
    [[16,'a'],[18,'f'],[20,'i']].forEach(([x,k])=>{if(g.g(x,33)){g.s(x,34,'M');g.s(x,35,k);g.s(x,36,k);}});
    if(has(12,38,'Yz')&&has(13,40,'Yz')){g.px([[12,39],[13,39],[12,40],[11,37],[13,37]],'r');}}
  else if(view==='front'){[[13,17],[14,17],[15,17],[16,17],[23,17],[24,17],[25,17],[26,17]].forEach(q=>g.s(q[0],q[1],'Y'));for(let x=12;x<=27;x++)if(x<18||x>21)g.s(x,18,'Y');g.px([[12,19],[27,19],[13,19],[26,19]],'z');
    for(let x=15;x<=24;x++)if(has(x,19,'PpQq'))g.s(x,19,'M');
    g.s(19,20,'M');g.s(20,20,'M');[[19,21],[20,21],[19,22],[20,22],[20,23]].forEach(p=>g.s(p[0],p[1],'X'));
    [[15,'a'],[17,'f'],[23,'i']].forEach(([x,k])=>{if(g.g(x,33)){g.s(x,34,'M');g.s(x,35,k);g.s(x,36,k);}});}
  else if(view==='back'){g.poly([[14.5,16.5],[25.5,16.5],[25,23],[22,27],[18,27],[15,23]],'Y');g.px([[19,19],[20,20],[19,21],[20,22],[19,23],[20,24],[16,22],[23,22]],'z');
    for(let x=15;x<=24;x++)if(has(x,19,'PpQqYz'))g.s(x,19,'M');
    g.px([[18,30],[19,30],[20,30],[21,30],[18,31],[19,31],[20,31],[21,31],[19,32],[20,32],[17,28],[19,27],[20,27],[22,28]],'r');}}
// Dist: a short, spiky, high ponytail standing up from the crown, a chief's half mantle with a pale wave hem, a wide sash of coins, a coin pouch
function j17DistHair(g,view){let top=8;for(let y=0;y<g.h&&top===8;y++)for(let x=0;x<g.w;x++){const k=g.g(x,y);if(k&&'Hhl'.includes(k)){top=y;break;}}
  // the pineapple top: a tie on the crown and a fan of short stiff leaves standing up from it (8 rows above the crown)
  const R=['......H.......','...H..Hh..H...','...Hh.HH.hH...','.H..HHhHHHl..H','.Hh.HhHHHlH.hH','..HHHhHHHlHHH.','...HhHHHHlHH..','....iooooN....'];
  g.rows(view==='side'?12:13,Math.max(0,top-8),R);}
function j17DistBase(g,view){const has=(x,y,ks)=>j17Has(g,x,y,ks);j17DistHair(g,view);
  if(view==='side'){
    // the chief's mantle: a collar over the shoulders and a half cape down the back to the hip, pale wave hem
    g.rect(14,17,8,1,'o');g.rect(13,18,6,2,'o');for(let y=20;y<=30;y++)g.rect(y>=27?11:12,y,y>=27?5:4,1,'o');
    g.px([[12,21],[12,23],[12,25],[11,28],[11,30],[14,19]],'Y');g.px([[15,22],[15,24],[15,26],[15,28],[15,30]],'J');g.px([[11,31],[13,31],[15,31]],'Y');g.px([[12,32],[14,32]],'i');g.px([[16,17],[19,17]],'i');
    // the wide sash of coins: two rows from the shoulder to the hip
    [[18,20],[19,22],[20,24],[21,26],[22,28]].forEach((q,n)=>{if(has(q[0],q[1],'PpQq')){g.s(q[0],q[1],n%2?'f':'a');if(has(q[0]+1,q[1],'PpQq'))g.s(q[0]+1,q[1],n%2?'a':'f');}});
    if(g.g(17,33)){g.rect(16,34,3,3,'L');g.s(17,34,'a');g.s(17,37,'L');}}
  else if(view==='front'){
    // a capelet on both shoulders, the cape's edges showing behind the arms
    g.rect(11,18,6,3,'o');g.rect(23,18,6,3,'o');g.px([[11,21],[12,21],[13,21],[14,21],[15,21],[24,21],[25,21],[26,21],[27,21],[28,21]],'i');g.px([[12,19],[27,19]],'Y');
    [[16,20],[17,22],[19,24],[20,26],[22,28],[23,30]].forEach((q,n)=>{if(has(q[0],q[1],'PpQqLG')){g.s(q[0],q[1],n%2?'f':'a');if(has(q[0]+1,q[1],'PpQqLG'))g.s(q[0]+1,q[1],n%2?'a':'f');}});
    if(g.g(24,32)){g.rect(24,32,3,3,'L');g.s(25,32,'a');}}
  else if(view==='back'){
    g.poly([[12.5,17.5],[27.5,17.5],[28.5,31.5],[11.5,31.5]],'o');g.line(17,20,16,30,'P');g.line(23,20,24,30,'P');g.line(20,22,20,29,'P');g.px([[13,19],[13,23],[13,27],[18,19],[22,19],[26,21],[26,25]],'Y');
    for(let x=12;x<=27;x++)g.s(x,x%2?31:32,'i');g.rect(15,17,10,1,'i');}}
// effects on the attack poses (side view only; never on the idle frame)
function j17PoseFx(g,L,P){if(!P||!P.frame)return;
  if(L.jose){if(P.pose==='cast')g.px([[37,10],[38,14],[36,18]],'r');return;}
  if(!L.dist)return;
  if(P.pose==='swing')[[29,12,8],[31,17,8],[28,21,9],[31,26,8],[29,30,8],[31,35,7]].forEach((c,n)=>{for(let k=0;k<c[2];k++){const y=c[1]+(n%2?-k*.6:k*.6);g.s(c[0]+k,y,'C');if(k>1&&k<c[2]-1)g.s(c[0]+k,y+1,'C');}g.s(c[0]+c[2],c[1]+(n%2?-c[2]*.6:c[2]*.6),'9');g.s(c[0]+c[2]-1,c[1]+(n%2?-(c[2]-1)*.6:(c[2]-1)*.6),'9');});
  else if(P.pose==='thrust'){for(let x=31;x<=38;x++)g.s(x,24,x%2?'C':'9');g.px([[33,22],[35,26],[37,23]],'C');}
  else if(P.pose==='cheer')[[30,20],[33,26],[30,32]].forEach(c=>{g.px([[c[0],c[1]-2],[c[0]+1,c[1]-1],[c[0]+2,c[1]],[c[0]+1,c[1]+1],[c[0],c[1]+2]],'C');g.px([[c[0]+3,c[1]-2],[c[0]+4,c[1]-1],[c[0]+5,c[1]],[c[0]+4,c[1]+1],[c[0]+3,c[1]+2]],'9');});
  else if(P.pose==='shoot')[[31,18],[34,16],[37,19],[36,23]].forEach(c=>{g.rect(c[0],c[1],2,2,'a');g.s(c[0],c[1],'D');});}
// wiring: the base flair goes on the plain grid (HPW empty: also the bare grid a pose is built from), the pose effects on the finished pose grid
{const hg0=heroGridSide;heroGridSide=function(L,walk,id){const P=HPW,g=hg0.apply(this,arguments);try{if(L&&g){if(!P){if(L.jose)j17JoseBase(g,'side');else if(L.dist)j17DistBase(g,'side');}else j17PoseFx(g,L,P);}}catch(e){}return g;};}
{const hv0=heroGridView;heroGridView=function(L,view,fr,id){const g=hv0.apply(this,arguments);try{if(L&&g&&view!=='side'){if(L.jose)j17JoseBase(g,view);else if(L.dist)j17DistBase(g,view);}}catch(e){}return g;};}
// the water clone's palette: every colour of Dist's sprite moved onto a water ramp by its lightness (a palette swap; the stage draws it see-through)
function j17Water(c){try{const [r,g,b]=hx(c),l=Math.min(1,(.299*r+.587*g+.114*b)/255*1.25+.08);return l<.5?mix('#123a78','#3f9ae8',l*2):mix('#3f9ae8','#e6f6ff',(l-.5)*2);}catch(e){return '#4aa8ff';}}
{const hp0=heroPal;heroPal=function(L,els,id){const p=hp0.apply(this,arguments);try{if(L&&L.j17wc){const o={};Object.keys(p).forEach(k=>{o[k]=typeof p[k]==='string'&&p[k][0]==='#'?j17Water(p[k]):p[k];});return o;}}catch(e){}return p;};}

// ---- the blood summon: two new hero poses (heropose9.js) ----
// jblood: 0 the free hand comes up, cut on the crook's hook; 1 held out palm up, blood running off it
// jslam:  0 dropping to one knee, the hand on its way down; 1 on one knee, the palm flat on the ground
HPT.jblood=[{lean:0},{lean:0}];HPT.jslam=[{crouch:5,lean:0},{crouch:12,lean:0}];
if(!HPO.list.includes('jblood'))HPO.list.push('jblood','jslam');
// the upper body folds forward about the hip row: rows are squeezed (sq) and pushed forward as they rise (sh); returns where a point lands
function j17Bend(g,hip,sh,sq){const W=g.w,src=g.a.slice(),at=(x,y)=>{const d=hip-y;return [x+Math.round(d*sq*sh),hip-Math.round(d*sq)];};
  for(let y=0;y<=hip;y++)for(let x=0;x<W;x++)g.a[y*W+x]=0;
  for(let y=0;y<=hip;y++)for(let x=0;x<W;x++){const k=src[y*W+x];if(!k)continue;const p=at(x,y);if(p[0]>=0&&p[0]<W&&p[1]>=0)g.a[p[1]*W+p[0]]=k;}
  return at;}
{const hp0=hpPose;hpPose=function(c,pose,f,w,fam,a0,L){if(pose!=='jblood'&&pose!=='jslam')return hp0.apply(this,arguments);
  const R=[c.R[0]/HPS_K,c.R[1]/HPS_K],g=c.g;
  if(pose==='jblood'){// the crook stays planted in the near hand; the far hand is the one he bleeds
    c.arm(R[0]*.5-1,R[1]*.6,R[0],R[1]);c.wp(R[0],R[1],a0);c.hand(R[0],R[1]);
    if(!f){c.arm(3,-3,6,-7);c.hand(6,-7);c.px(7,-8,'r');c.px(6,-9,'r');}
    else{c.arm(5,-2,10,-2);c.hand(10,-2);[[10,0],[10.6,2.4],[9.6,5],[10.4,8]].forEach(p=>c.px(p[0],p[1],'r'));c.px(11,-3,'r');}
    return;}
  // the ground line is where the boots stand (the cape, pushed down by the crouch, is cut there)
  let F=0;for(let y=g.h-1;y>=0&&!F;y--)for(let x=0;x<g.w;x++){const k=g.g(x,y);if(k==='B'||k==='b'){F=y;break;}}if(!F)F=hpFeet(g);
  for(let y=F+1;y<g.h;y++)for(let x=0;x<g.w;x++)g.a[y*g.w+x]=0;
  const hip=F-9,hx=20,at=j17Bend(g,hip,f?.5:.25,f?.6:.86),J=at(c.J[0],c.J[1]);c.J[0]=J[0];c.J[1]=J[1];
  const leg=(x,y,w2,h2,k)=>g.rect(x,y,w2,h2,k);
  if(f){// on one knee: the boots are redrawn; the near leg folds forward (thigh level, boot down), the far knee is on the ground with its boot lying back
    for(let y=hip+1;y<=F;y++)for(let x=0;x<g.w;x++){const k=g.g(x,y);if(k&&'BbLKk'.includes(k))g.a[y*g.w+x]=0;}
    leg(hx-4,hip+1,4,5,'k');leg(hx-5,F-3,4,4,'k');leg(hx-12,F-2,7,3,'b');leg(hx-12,F-3,2,1,'b');
    leg(hx-1,hip,9,3,'K');leg(hx-1,hip+2,8,1,'k');leg(hx+5,hip+3,4,F-hip-3,'B');leg(hx+5,hip+3,1,F-hip-3,'b');leg(hx+5,F,7,1,'b');leg(hx+9,F-1,3,1,'B');}
  const gy=(F-c.J[1])/HPS_K;
  // the crook leans back in the far hand, the bleeding hand goes to the ground
  c.arm(-2,2,-3,4);c.wp(-3,4,-112,{free:1});c.hand(-3,4);
  if(!f){c.arm(4,3,8,6);c.hand(8,6);c.px(8.6,8.4,'r');c.px(8.2,10.6,'r');}
  else{c.arm(4,gy*.45,7.5,gy-.8);c.hand(7.5,gy-.4);[[5,gy+.2],[10,gy+.2],[11.6,gy-.6],[4,gy-.6],[9.4,gy-2.2],[12.6,gy+.2]].forEach(p=>c.px(p[0],p[1],'r'));}
  for(let y=F+1;y<g.h;y++)for(let x=0;x<g.w;x++)g.a[y*g.w+x]=0;};}
// ---------- 4. statuses, kits and Limits ----------
try{const pc=v=>Math.round(v*100);
  STS.wclone={n:'Water Clone',a:'CLN',t:L17.clone.turns+1,c:'#4aa8ff',d:`A water double repeats every damaging skill at ${pc(L17.clone.pw)}% power.`};
  STS.slip={n:'Slip Under',a:'SLP',t:2,c:'#8fd0ff',d:`Cannot be picked as a target; area moves hit for half. The next attack has +${pc(L17.slip.crit)}% critical chance.`};
  STS.sic={n:'Sic',a:'SIC',bad:1,t:3,c:'#e0303a',d:`Joseth's summons go for it and deal ${pc(L17.sic.dmg-1)}% more to it.`};
  if(typeof ST_SYM!=='undefined'){ST_SYM.wclone='<path d="M3.4 1.2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2ZM1 9V6.6A2 2 0 0 1 3 4.8h.8A2 2 0 0 1 5.8 6.6V9ZM7 2.4a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM6.4 9V6.4a2.6 2.6 0 0 0-.3-1.1h1.3A1.7 1.7 0 0 1 9 7v2Z"/>';
    ST_SYM.slip='<path d="M1 3.2q2-1.6 4 0t4 0v1.4q-2 1.6-4 0t-4 0ZM1 6.2q2-1.6 4 0t4 0v1.4q-2 1.6-4 0t-4 0Z"/>';
    ST_SYM.sic='<path d="M2.2 1.4 4 3.6 5 .8 6 3.6 7.8 1.4 7.4 5.2 8.8 8.6H1.2L2.6 5.2Z"/>';}
  if(typeof FK_SH!=='undefined'){FK_SH.wclone='afterimage';FK_SH.slip='mist';FK_SH.sic='reticle';}}catch(e){}// (every status has a shape of its own on the stage: fxkind11.js, test v164a)
const j17Pc=v=>Math.round(v*100);
// (a name follows the game's rule for what a skill does to a mark, kits12.js: a Bolt sets one off, a Dart or a Lash leaves one; Dist's dart is the
// River Dart because Pip, the Water Thief, already owns the name Water Dart, and every wayfarer keeps two skills nobody else has)
const L17_KIT={
 jose:[
  {id:'j_mend',n:'Blood Mend',k:'heal',t:'ally',pw:1.6,mp:4,d:'A drop of his own blood closes the wound. Heals one ally.'},
  {id:'j_whistle',n:'Whistle',k:'status',t:'self',j17:'whistle',own:1,d:`Calls the next pet of his three to stand beside the Vanguard for ${L17.pack.turns} turns. Costs ${j17Pc(L17.cost.pet)}% of his max HP, no MP. Once per battle it calls back a pet that left or fell (${j17Pc(L17.cost.back)}% HP, ${L17.pack.backTurns} turns).`},
  {id:'j_bolt',n:'Blood Bolt',k:'mag',pw:1.3,mp:5,el:'fire',role:'det',d:'A bolt of burning blood, thrown hard.'},
  {id:'j_kennel',n:'Kennel Blessing',k:'status',t:'allyAll',mp:12,fx:[['might',1],['regen',1]],rl:'buffer',d:'A hand on every head: Might and Regen for the whole Vanguard, pets included.'},
  {id:'j_lash',n:'Volt Lash',k:'mag',pw:1.4,mp:5,t:'chain',el:'lightning',role:'primer',d:'A whip of lightning that may leap from foe to foe and stays on what it touches.'},
  {id:'j_pack',n:'Call the Pack',k:'status',t:'self',j17:'pack',own:1,d:`Calls every pet of his three that has not been called yet, all at once. Costs ${j17Pc(L17.cost.pack)}% of his max HP, no MP.`},
  {id:'j_purge',n:'Purge',k:'heal',t:'ally',pw:.6,mp:4,cleanse:1,d:'Bleeds the poison out: cures ailments and heals a little.'},
  {id:'j_ward',n:'Bloodward',k:'status',t:'allyAll',mp:10,fx:[['ward',1]],hpc:L17.cost.ward,rl:'buffer',d:`A ring of his blood around the line: Ward on the whole Vanguard (blocks the next hit on each). Also costs ${j17Pc(L17.cost.ward)}% of his max HP.`},
  {id:'j_line',n:'Mend the Line',k:'heal',t:'allyAll',pw:1.1,mp:12,d:'Heals the vanguard, pets included.'},
  {id:'j_sic',n:'Sic',k:'status',t:'one',mp:6,fx:[['break',.85],['sic',1]],rl:'summoner',d:`Points at one foe: likely Breaks it, and for 3 turns his summons go for it and deal ${j17Pc(L17.sic.dmg-1)}% more to it.`},
  {id:'j_raise',n:'Raise in Blood',k:'revive',t:'dead',pw:.4,mp:11,hpc:L17.cost.raise,d:`Revives a fallen ally at 40% HP. Also costs ${j17Pc(L17.cost.raise)}% of his max HP.`},
  {id:'j_pyre',n:'Pyre Chain',k:'mag',pw:.95,mp:10,t:'all',el:['fire','lightning'],role:'primer',d:'A chain of fire and lightning thrown over every foe.'},
  {id:'j_transf',n:'Transfusion',k:'heal',t:'ally',pw:4,mp:18,cost:1.2,d:'Gives one ally what he can spare, and then some. A very strong heal; slow recovery.'},
  {id:'j_storm',n:'Bloodstorm',k:'mag',pw:2.7,mp:20,cost:1.3,el:['fire','lightning'],role:'det',fx:[['stun',.3]],d:'Fire and lightning called down on one foe. May Stun. Slow recovery.'}],
 dist:[
  {id:'d_stab',n:'Quick Stab',k:'phys',pw:1,cost:.6,dl:'piercing',d:'A fast jab. He acts again sooner.'},
  {id:'d_steal',n:'Steal',k:'phys',pw:.6,steal:1,dl:'piercing',d:'A light cut and a lighter hand: takes gold or an item.'},
  {id:'d_dart',n:'River Dart',k:'phys',pw:1.1,mp:3,cost:.8,el:'water',role:'primer',dl:'piercing',d:'A thrown blade with river water on it that clings to the foe.'},
  {id:'d_cut',n:'Cutwater',k:'phys',pw:.3,hits:6,mp:7,d:'Six cuts on one foe, too quick to count. Each can be a critical and each can lift gold.'},
  {id:'d_barn',n:'Barnacle Edge',k:'phys',pw:1.1,mp:5,fx:[['bleed',.85]],d:'A notched blade that leaves a ragged wound. Likely Bleeds.'},
  {id:'d_clone',n:'Water Clone',k:'status',t:'self',mp:L17.clone.mp,fx:[['wclone',1]],j17:'clone',own:1,d:`A double of himself in river water stands with him for ${L17.clone.turns} turns and repeats every damaging skill he uses at ${j17Pc(L17.clone.pw)}% power. It cannot be hit, costs no MP and takes no gold. It ends if he falls or leaves the Vanguard.`},
  {id:'d_pace',n:'Pick Up the Pace',k:'status',t:'allyAll',mp:14,fx:[['haste',1]],j17:'pace',own:1,d:`Haste for the whole Vanguard that lasts a turn longer, and each of them takes the next turn ${j17Pc(L17.pace.pull)}% sooner.`},
  {id:'d_slip',n:'Slip Under',k:'status',t:'self',mp:6,fx:[['slip',1]],j17:'slip',d:`Goes under the surface: until his next turn no foe can pick him as a target (area moves hit for half), and his next attack has +${j17Pc(L17.slip.crit)}% critical chance. Not two turns running.`},
  {id:'d_smoke',n:'Smoke Bomb',k:'status',t:'all',mp:8,fx:[['blind',.7]],d:'River mist and worse. May Blind every foe.'},
  {id:'d_toll',n:'Toll Toss',k:'phys',pw:2.4,pierce:1,dl:'piercing',gold:1,d:`Throws a fistful of coins hard enough to matter: a piercing hit from across the field that ignores half of defense. Costs gold (${L17.toll.gold} x the realm number), no MP.`},
  {id:'d_rip',n:'Riptide Sweep',k:'phys',pw:.95,mp:10,cost:.8,t:'all',el:'water',role:'primer',fx:[['slow',.4]],d:'A low sweep that drags every foe a step with the current. May Slow.'},
  {id:'d_shake',n:'Shakedown',k:'phys',pw:1.4,mp:8,j17:'shake',d:'Turns the foe upside down: strips one boon and always comes away with gold.'},
  {id:'d_under',n:'Undercut',k:'phys',pw:2.6,mp:14,el:'water',role:'det',crit:.25,d:'One cut from below the waterline. High critical chance.'},
  {id:'d_hands',n:'Hundred Hands',k:'phys',pw:.5,hits:12,t:'rand',mp:30,cost:1.3,el:'water',role:'det',crit:.3,d:'Twelve cuts at random foes, every hand in the crew at once. Each a likely critical. Slow recovery.'}]};
const L17_KC={};
function j17KitId(t){if(!t)return null;if(L17_KIT[t.id])return t.id;return t.j17hid?'dist':null;}
function j17Kit(t){const id=j17KitId(t);if(!id)return null;if(L17_KC[id])return L17_KC[id];const cls=TPL[id].cls;
  return L17_KC[id]=L17_KIT[id].map((o,i)=>{const s=Object.assign({cost:1,hits:1,t:'one',mp:0,el:null},o);s.lv=R17.lv[i];s.lv0=s.lv;s.lvR=s.lv;
    try{const d=dlFor(cls,s);if(d&&!s.dl)s.dl=d;}catch(e){}if(s.own)s.d+=` Only ${TPL[id].n} has this skill.`;return s;});}
// registered last, so it answers first: the kit as written (none of the generated class skills, role fills or the cap apply)
HOOK.before('classSkills','legends17a','the two new legends: their kits of 14 as written',function(t){const K=j17Kit(t);if(K)return HOOK.stop(K);});
// skills that are a mechanic (a summon, the clone, the dodge) carry no role power tag
{const sm0=sk12Mult;sk12Mult=function(c,s){if(s&&s.j17&&s.k==='status')return null;return sm0.apply(this,arguments);};}
LIMIT.bloodcaller={n:'Cerberus, the Bound Pack',k:'status',t:'self',j17:'cer',d:`The three become one. Any pets out leave, and Cerberus stands in front of the Vanguard for ${L17.cer[0].turns} turns: Threefold Bite (Fire), Skyhowl (Lightning on every foe, may Stun) and Pack Mend (heals the Vanguard). No HP cost.`};
LIMIT2.bloodcaller={n:'Cerberus Stormcrown',k:'status',t:'self',j17:'cer',d:`The chains come off. Cerberus stands in front of the Vanguard for ${L17.cer[1].turns} turns at a guardian's strength, adds Stormcrown Howl (Fire and Lightning on every foe, Burn, Stun, chips 2 shield pips) and heals the Vanguard ${j17Pc(L17.cer[1].heal)}% when it leaves.`};
LIMIT.chief={n:'Tidecrew Rush',k:'phys',pw:.7,t:'rand',hits:9,fx:[['slow',.3]],j17:'crew',d:'He whistles and the crew runs the length of the field: nine hits, every foe at least once, the rest at random. May Slow.'};
LIMIT2.chief={n:'Clean Sweep',k:'phys',pw:.8,t:'rand',hits:12,shieldChip:2,j17:'crew',d:'Two waves of the crew: twelve hits, every foe at least once. Every foe loses a boon, the crew leaves with gold, and it chips 2 shield pips.'};
// ---------- 5. Joseth in battle: blood costs, the pack, Cerberus ----------
const j17Is=a=>!!(a&&a.id==='jose'&&a.side==='p'&&!a.isComp&&!a.isSum);
const j17Dist=a=>!!(a&&a.id==='dist'&&a.side==='p'&&!a.isComp&&!a.isSum);
function j17S(){if(!B)return null;return B.j17||(B.j17={called:{},back:0,lift:0,lifts:0});}
function j17Pay(a,pct){const d=Math.max(1,Math.round(a.S.mhp*pct)),n=Math.min(d,Math.max(0,a.hp-1));a.hp=Math.max(1,a.hp-d);if(n>0)fx(a,'-'+n+' HP','stat');/* a plain popup: 'stat bad' would play the debuff look on him */log(`${a.name} pays ${n} HP in blood.`);return n;}
// --- the three slots: a tamed pet paired with Joseth sits in slot o.j17s (0..2, an optional field of the pet); an empty slot holds his own dog ---
function j17Norm(g){try{g=g||G;if(!g||!Array.isArray(g.tamed))return;const used={};let boss=0;
  g.tamed.forEach(o=>{if(!o)return;if(o.with!=='jose'){if(o.j17s!=null)delete o.j17s;return;}
    if(o.scourge){if(boss){o.with=null;delete o.j17s;return;}boss=1;}
    if(!(o.j17s>=0&&o.j17s<3)||used[o.j17s]){const f=[0,1,2].find(i=>!used[i]&&!g.tamed.some(x=>x&&x!==o&&x.with==='jose'&&x.j17s===i));if(f==null){o.with=null;delete o.j17s;if(o.scourge)boss=0;return;}o.j17s=f;}
    used[o.j17s]=1;});}catch(e){}}
function j17Slots(g){g=g||G;j17Norm(g);return [0,1,2].map(i=>{const o=((g&&g.tamed)||[]).find(x=>x&&x.with==='jose'&&x.j17s===i&&b16Def(x.mon));return o?{i,o}:{i,dog:L17.dogs[i]};});}
const j17EntName=e=>e.o?e.o.name:L17_MON[e.dog].n;
const j17Out=()=>B?B.front.filter(u=>u&&u.j17==='pet'&&!u.j17gone):[];
const j17CerOut=()=>B?B.front.find(u=>u&&u.j17==='cer'&&!u.j17gone)||null:null;
// what Whistle would do now: {mode:'call'|'back', e, cost} or {why}
function j17WhistleInfo(a){const S=j17S();if(!S||!a)return {why:''};if(G&&G.daily)return {why:'No pets in the Daily Trial.'};
  if(B.sum||B.pray)return {why:'One summon at a time: a guardian holds the field.'};if(j17CerOut())return {why:'One summon at a time: Cerberus holds the field.'};
  const P=j17Slots().filter(e=>!(e.o&&e.o.scourge)),un=P.filter(e=>!S.called[e.i]);
  if(un.length)return {mode:'call',e:un[0],all:un,cost:L17.cost.pet};
  if(!S.back){const out=j17Out(),gone=P.filter(e=>!out.some(u=>u.j17slot===e.i));if(gone.length)return {mode:'back',e:gone[0],all:[],cost:L17.cost.back};return {why:'Every pet is on the field.'};}
  return {why:'Every pet has been called, and the one call-back of this battle is spent.'};}
// why a skill of these two cannot be used now (null: it can)
function j17Block(a,s){try{if(!s||!a||!B)return null;
  if(s.j17==='whistle'){const I=j17WhistleInfo(a);return I.mode?null:I.why;}
  if(s.j17==='pack'){const I=j17WhistleInfo(a);return I.mode==='call'?null:(I.why||'Every pet has been called.');}
  if(s.j17==='slip'&&has(a,'slip'))return 'Not two turns running.';
  if(s.gold){const c=j17Toll();if((G.gold||0)<c)return `Needs ${c} gold.`;}
  }catch(e){}return null;}
const j17Toll=()=>L17.toll.gold*(((B&&B.stage)|0)+1);
// --- a pack unit ---
function j17Unit(a,e,turns,k){const dog=e.dog,id=dog?j17DogTpl(dog):e.o.id;if(!dog&&!TPL[id])registerTamed(e.o);const d=dog?L17_MON[dog]:compDef(e.o);
  const u=newChar(id,a.lv,gearTier());u.isComp=1;u.j17='pet';u.j17slot=e.i;u.j17dog=dog||null;u.owner=a;u.compTurns=turns;u.name=j17EntName(e);u.lb=0;
  u.S.mhp=Math.max(1,Math.round(u.S.mhp*L17.pack.hp));u.hp=u.S.mhp;u.S.atk*=L17.pack.pw;u.S.mag*=L17.pack.pw;if(u.S.healP)u.S.healP*=L17.pack.pw;
  u.msk=(d.sk||[]).map(s=>({id:'c'+s[0],n:s[0],el:s[1],pw:+(s[2]*1.05).toFixed(2),t:s[3]==='all'?'all':s[3]==='self'?'self':'one',k:s[4]==='buff'?'buff':s[4],fx:s[5]||null,mp:0,cost:1,hits:1}));
  u.next=B.time+delayOf(u,.45+.12*(k||0));u.enterT=0;u.j17in=Date.now()+j17Land();u.j17t0=Date.now();
  B.front.push(u);if(dog)j17Seen(dog);return u;}
function j17Call(a,list,turns){const S=j17S(),us=list.map((e,k)=>{S.called[e.i]=1;return j17Unit(a,e,turns,k);});j17Anim(a,us,false);return us;}
function j17Whistle(a){const I=j17WhistleInfo(a);if(!I.mode)return;j17Pay(a,I.cost);const back=I.mode==='back';if(back)j17S().back=1;
  const u=j17Call(a,[I.e],back?L17.pack.backTurns:L17.pack.turns)[0];banner(`${u.name}!`,'#e0303a');
  log(back?`${a.name} whistles ${u.name} back for ${u.compTurns} turns.`:`${a.name} whistles: ${u.name} stands beside the Vanguard for ${u.compTurns} turns.`);}
function j17CallPack(a){const I=j17WhistleInfo(a);if(I.mode!=='call')return;j17Pay(a,L17.cost.pack);const us=j17Call(a,I.all,L17.pack.turns);
  banner('The pack!','#e0303a');log(`${a.name} calls the pack: ${us.map(u=>u.name).join(', ')} for ${L17.pack.turns} turns.`);}
// leaving: marked gone at once, taken out of the Vanguard at the next safe point (never while a loop walks B.front)
function j17Leave(u,why){if(!u||u.j17gone)return;u.j17gone=1;u.hp=0;u.st={};u.j17out=Date.now();u.deathT=u.deathT||Date.now();
  if(u.j17==='cer'){const C=L17.cer[u.j17two?1:0];if(why!=='ko'&&C.heal&&B)B.front.forEach(c=>{if(c.hp>0&&!c.j17){const n=Math.min(c.S.mhp-c.hp,Math.round(c.S.mhp*C.heal));if(n>0){c.hp+=n;fx(c,'+'+n,'heal');}}});
    log(why==='ko'?`${u.name} is driven off.`:`${u.name} lies down and is gone.`);}
  else if(why!=='silent')log(why==='ko'?`${u.name} is driven off.`:why==='layer'?`${u.name} goes home.`:`${u.name} trots back to ${u.owner?u.owner.name:'Joseth'}.`);}
function j17Sweep(){if(!B)return;for(let i=B.front.length-1;i>=0;i--)if(B.front[i]&&B.front[i].j17&&B.front[i].j17gone)B.front.splice(i,1);
  for(let i=B.back.length-1;i>=0;i--)if(B.back[i]&&B.back[i].j17)B.back.splice(i,1);}
function j17PackHome(why){j17Out().forEach(u=>j17Leave(u,why||'layer'));}
function j17AllHome(){if(!B)return;B.front.concat(B.back).forEach(u=>{if(u&&u.j17&&!u.j17gone)j17Leave(u,'silent');});j17Sweep();}
// every turn: the pack follows its handler (he fell, left the Vanguard, or no hero is left standing), and gone units leave the list
function j17Tick(){if(!B||!B.j17&&!B.front.some(u=>u&&u.j17))return;
  const L=B.front.filter(u=>u&&u.j17&&!u.j17gone);
  if(L.length){const noHero=!B.front.concat(B.back).some(c=>c&&!c.j17&&c.hp>0);
    L.forEach(u=>{const a=u.owner;if(noHero||!a||a.hp<=0||!B.front.includes(a))j17Leave(u,noHero?'silent':'home');});}
  j17Sweep();}
// --- the dogs' own turns ---
// (the dogs' own numbers sit about 22% under the proposal's (Warm Nuzzle 1.3, Bolt Fang 1.5, Hamstring 1.1 ...): tuned after the class comparison,
// docs/sumbal17.md; the pack's power, HP, stay and costs are the owner's and are not touched)
const L17_DOG={
  junah:{nuzzle:{id:'jd_nuzzle',n:'Warm Nuzzle',k:'heal',t:'ally',pw:1},hour:{id:'jd_hour',n:'Golden Hour',k:'status',t:'allyAll',fx:[['regen',1]],heal:.06},fetch:{id:'jd_fetch',n:'Fetch',k:'heal',t:'ally',pw:.5,cleanse:1},
    bark:{id:'jd_bark',n:'Sunny Bark',k:'mag',t:'one',pw:.9,el:'light',fx:[['blind',.3]]}},
  odin:{ham:{id:'jd_ham',n:'Hamstring',k:'phys',t:'one',pw:.9,el:'shadow',fx:[['slow',.8],['weaken',.5]]},snatch:{id:'jd_snatch',n:'Snatch',k:'phys',t:'one',pw:.6,steal:1},
    hold:{id:'jd_hold',n:'Throat Hold',k:'phys',t:'one',pw:.95,el:'shadow',fx:[['break',.8]],j17strip:1},stare:{id:'jd_stare',n:'Shadow Stare',k:'status',t:'all',fx:[['blind',.5]]}},
  zeus:{fang:{id:'jd_fang',n:'Bolt Fang',k:'mag',t:'one',pw:1.15,el:'lightning'},howl:{id:'jd_howl',n:'Skyhowl',k:'mag',t:'all',pw:.75,el:'lightning',fx:[['stun',.12]]},
    coat:{id:'jd_coat',n:'Static Coat',k:'buff',t:'self',fx:[['focus',1],['haste',1]]},head:{id:'jd_head',n:'Thunderhead',k:'mag',t:'all',pw:.9,el:['fire','lightning'],fx:[['burn',.3]]}}};
Object.keys(L17_DOG).forEach(d=>Object.values(L17_DOG[d]).forEach(s=>{s.mp=0;s.cost=1;s.hits=s.hits||1;if(!s.el)s.el=null;}));
const j17Sic=foes=>foes.find(e=>has(e,'sic'))||null;
// returns [skill, targets]
function j17DogPick(u,foes){const K=L17_DOG[u.j17dog],fr=B.front.filter(c=>c.hp>0&&!c.j17gone),ratio=c=>c.hp/c.S.mhp,sic=j17Sic(foes),n=u.turns||0;
  const tough=x=>foes.slice().sort((p,q)=>q.hp-p.hp)[0],weak=sk=>sic||foes.slice().sort((x,y)=>effOf(skEls(sk)[0],y)-effOf(skEls(sk)[0],x)||x.hp-y.hp)[0];
  if(u.j17dog==='junah'){const low=fr.slice().sort((x,y)=>ratio(x)-ratio(y))[0],sick=fr.filter(c=>Object.keys(c.st).some(k=>STS[k]&&STS[k].bad&&k!=='stun')).sort((x,y)=>ratio(x)-ratio(y))[0];
    const hurt=fr.filter(c=>ratio(c)<.75).length;
    if(low&&ratio(low)<.5)return [K.nuzzle,[low]];
    if(sick)return [K.fetch,[sick]];
    if(fr.some(c=>!has(c,'regen'))&&(hurt>=2||n===1))return [K.hour,fr];
    if(low&&ratio(low)<.8)return [K.nuzzle,[low]];
    return [K.bark,[weak(K.bark)]];}
  if(u.j17dog==='odin'){const t=sic||tough(),boon=foes.find(e=>Object.keys(e.st).some(k=>STS[k]&&!STS[k].bad));
    if(boon)return [K.hold,[boon]];
    if(!has(t,'slow')&&!has(t,'weaken'))return [K.ham,[t]];
    if(!has(t,'break'))return [K.hold,[t]];
    if(foes.length>1&&foes.filter(e=>!has(e,'blind')).length>=2&&RNG()<.6)return [K.stare,foes];
    const rob=foes.find(e=>!e.stolen);if(rob&&RNG()<.6)return [K.snatch,[rob]];
    return [RNG()<.5?K.ham:K.hold,[t]];}
  // Zeus
  if(!u.j17head&&foes.length>1&&n>=2){u.j17head=1;return [K.head,foes];}
  if(n===1&&!has(u,'focus'))return [K.coat,[u]];
  if(foes.length>1&&RNG()<.6)return [K.howl,foes];
  return [K.fang,[weak(K.fang)]];}
function j17PetPick(u,foes){const sic=j17Sic(foes),buffs=u.msk.filter(s=>s.k==='buff'&&!(s.fx||[]).every(([k])=>has(u,k))),dmg=u.msk.filter(s=>s.k!=='buff');let sk;
  if(buffs.length&&RNG()<.2)sk=buffs[0];else if(dmg.length)sk=dmg.find(s=>s.t==='all'&&foes.length>1&&RNG()<.6)||pick(dmg);else sk=ATTACK;
  return [sk,sk.t==='self'?[u]:sk.t==='all'?foes:[sic||foes.slice().sort((x,y)=>effOf(sk.el,y)-effOf(sk.el,x)||x.hp-y.hp)[0]]];}
function j17CerPick(u,foes){const two=u.j17two,fr=B.front.filter(c=>c.hp>0&&!c.j17gone),avg=fr.reduce((q,c)=>q+c.hp/c.S.mhp,0)/Math.max(1,fr.length),n=u.turns||0,sic=j17Sic(foes);
  const K=u.j17k||(u.j17k={bite:{id:'jc_bite',n:'Threefold Bite',k:'phys',t:'one',pw:1.5,el:'fire',fx:[['burn',.5]],mp:0,cost:1,hits:1},howl:{id:'jc_howl',n:'Skyhowl',k:'mag',t:'all',pw:1,el:'lightning',fx:[['stun',.2]],mp:0,cost:1,hits:1},
    mend:{id:'jc_mend',n:'Pack Mend',k:'status',t:'allyAll',fx:[['regen',1]],heal:.15,mp:0,cost:1,hits:1,el:null},crown:{id:'jc_crown',n:'Stormcrown Howl',k:'mag',t:'all',pw:1.5,el:['fire','lightning'],fx:[['burn',.6],['stun',.3]],shieldChip:2,mp:0,cost:1,hits:1}});
  if(two&&n===1)return [K.crown,foes];
  if(avg<.6&&!u.j17mend){u.j17mend=1;return [K.mend,fr];}
  if(foes.length>1&&RNG()<.55)return [K.howl,foes];
  return [K.bite,[sic||foes.slice().sort((x,y)=>y.hp-x.hp)[0]]];}
function j17Turn(u){if(!B||B.over)return;const foes=B.en.filter(e=>e.hp>0);if(!foes.length||u.j17gone||u.hp<=0){advance();return;}
  u.turns=(u.turns||0)+1;B.cur=u;
  if(has(u,'stun')){delete u.st.stun;log(`${u.name} is stunned and cannot act.`);fx(u,'Stunned','stat bad');}
  else{let P;try{P=u.j17==='cer'?j17CerPick(u,foes):u.j17dog?j17DogPick(u,foes):j17PetPick(u,foes);}catch(e){console.error('legends17a pet turn',e);P=[ATTACK,[foes[0]]];}
    if(!P||!P[0]||!P[1]||!P[1].length||!P[1][0])P=[ATTACK,[foes[0]]];
    perform(u,P[0],P[1]);
    if(P[0].j17strip&&P[1][0]&&P[1][0].hp>0){const t=P[1][0],b=Object.keys(t.st).find(k=>STS[k]&&!STS[k].bad);if(b){delete t.st[b];fx(t,STS[b].n+' off','stat bad');log(`${u.name} tears ${STS[b].n} off ${t.name}.`);}}}
  if(u.j17==='cer')u.turnsLeft--;else u.compTurns--;
  if((u.j17==='cer'?u.turnsLeft:u.compTurns)<=0&&u.hp>0&&!u.j17gone){j17Leave(u,'done');B.mode='wait';render();if(checkEnd())return;later(advance,PAUSE*.8);return;}
  endTurn(u,1);}
// Sic: Joseth's summons hit the marked foe harder; a summon never fills a Limit gauge or lifts gold
HOOK.after('calcDamage','legends17a','Sic, Slip Under on area moves',function(r,a,sk,t){try{if(!r||!r.dmg||!B)return;
  if(t&&t.side==='e'&&has(t,'sic')&&a&&a.side==='p'&&(a.j17||a.isComp||a.isSum))r.dmg=Math.max(1,Math.round(r.dmg*L17.sic.dmg));
  if(t&&t.side==='p'&&has(t,'slip'))r.dmg=Math.max(1,Math.round(r.dmg*L17.slip.area));}catch(e){}});
// --- Cerberus ---
function j17Cerberus(a,two){j17PackHome('layer');{const old=j17CerOut();if(old)j17Leave(old,'layer');}const C=L17.cer[two?1:0],key=two?'cerberus2':'cerberus',d=L17_MON[key];
  const heroes=B.front.filter(c=>c.hp>0&&!c.isComp&&!c.isSum&&!c.j17),lv=Math.max(1,Math.round(heroes.reduce((q,c)=>q+c.lv,0)/Math.max(1,heroes.length)));
  const u=makeEnemy(d,lv,{elite:true,name:d.n,noField:1,noBuff:1,hpM:1,powM:C.pw==null?SUM.powM:C.pw});
  u.side='p';u.isComp=1;u.j17='cer';u.j17two=two?1:0;u.id='sum_j17'+key;u.base=d.n;u.name=d.n;u.lb=0;u.owner=a;u.phase=null;u.multi=1;u.turnsLeft=C.turns;u.maxShield=0;u.shield=0;
  try{const f=a.S&&a.S.attr&&a.S.attr.fth||0;if(f>0){const k=1+f*ROLE9.fthSum;u.S.atk*=k;u.S.mag*=k;}}catch(e){}
  const pool=heroes.reduce((q,c)=>q+c.S.mhp,0);u.S.mhp=Math.max(1,Math.round(pool*SUM.hpK*C.hp));u.hp=u.S.mhp;u.S.mmp=999;u.mp=999;
  TPL[u.id]={id:u.id,n:d.n,cls:'warrior',el:d.el.slice(),trait:'brave',bio:d.d,src:'sum',look:null,mon:key,art:d.art,summon:1,j17hid:1};
  u.msk=[];u.next=B.time+delayOf(u,.4);u.enterT=0;u.j17in=Date.now()+j17Land();u.j17t0=Date.now();B.front.push(u);j17Seen(key);
  j17Anim(a,[u],true);log(`${a.name} opens his hand over the ground. ${d.n} stands in front of the Vanguard for ${C.turns} turns.`);return u;}
// --- the turn order: the pack and Cerberus act on their own speed; they never reach comp.js or summon8.js ---
{const ad0=advance;advance=function(){try{if(B&&!B.over)j17Tick();}catch(e){console.error('legends17a tick',e);}
  if(B&&!B.over){
    // the blood summon plays out before the next unit moves (not in sims or tests that run the clock fast)
    if(B.j17hold&&PAUSE>=300){const w=B.j17hold-Date.now();if(w>40&&w<2000&&(B.j17holdN=(B.j17holdN||0)+1)<6){later(advance,Math.min(w,700));return;}B.j17hold=0;B.j17holdN=0;}
    let u=null;liveUnits().forEach(x=>{if(!u||x.next<u.next||(x.next===u.next&&x.side==='p'))u=x;});
    if(u&&u.j17){if(checkEnd())return;B.cur=u;B.time=u.next;B.mode='enemy';render();later(()=>j17Turn(u),PAUSE*.8);return;}}
  return ad0.apply(this,arguments);};}
HOOK.before('fallen','legends17a','a pack pet or Cerberus is driven off instead of falling (runs before comp.js and summon8.js)',function(u){if(u&&u.j17){fx(u,'Driven off','stat bad');j17Leave(u,'ko');return HOOK.stop();}});
['win','finishBattle'].forEach(n=>HOOK.before(n,'legends17a','the pack goes home before the fight ends (results and saves only see heroes)',function(){try{j17AllHome();}catch(e){}}));
{const ls0=lose;lose=function(){try{j17AllHome();}catch(e){}return ls0.apply(this,arguments);};}
HOOK.after('startBattle','legends17a','fresh battle',function(r){try{if(r!==false&&B){B.j17=null;B.j17jose=allParty().some(c=>c.id==='jose')?1:0;}}catch(e){}});
// one layer of summons: any guardian or recruited boss that takes the field sends the pack and Cerberus home first
HOOK.before('sumFire','legends17a','one summon layer: the pack goes home',function(){try{if(B){j17PackHome('layer');const c=j17CerOut();if(c)j17Leave(c,'layer');j17Sweep();}}catch(e){}});
{const bf0=b16BossFire;b16BossFire=function(a,o){try{if(B){j17PackHome('layer');const c=j17CerOut();if(c)j17Leave(c,'layer');j17Sweep();}}catch(e){}const u=bf0.apply(this,arguments);try{if(j17Is(a)&&u)j17Anim(a,[u],true);}catch(e){}return u;};}
// a pack unit is never swapped out, never fills a gauge, never takes a rearguard's place
if(typeof b4CanOut==='function'){const co0=b4CanOut;b4CanOut=function(c){if(c&&c.j17)return false;return co0.apply(this,arguments);};}
// --- Joseth as a caller of guardians and recruited bosses (paid in HP) ---
{const sc0=sumClassOf;sumClassOf=function(a){try{if(j17Is(a)&&B)return 'priest';}catch(e){}return sc0.apply(this,arguments);};}
{const bc0=b16Caller;b16Caller=function(a){try{if(a&&a.id==='jose'&&TPL.jose&&!TPL.jose.mon)return true;}catch(e){}return bc0.apply(this,arguments);};}
{const sn0=sumCan;sumCan=function(a){if(!j17Is(a))return sn0.apply(this,arguments);if(j17CerOut())return false;const m=a.mp;a.mp=1e9;try{return sn0.apply(this,arguments);}finally{a.mp=m;}};}
{const sp0=sumPray;sumPray=function(a,mon){if(!j17Is(a))return sp0.apply(this,arguments);if(!sumCan(a))return false;const c=sumCost(a);a.mp+=c;const hp0=a.hp;j17Pay(a,L17.cost.guard);
  const r=sp0.apply(this,arguments);if(!r){a.mp-=c;a.hp=hp0;}return r;};}
HOOK.after('sumFire','legends17a','the blood summon for his guardian',function(r,a){try{if(r&&j17Is(a)&&B&&B.sum)j17Anim(a,[B.sum.u],true);}catch(e){}});
// his own pets go through Whistle; a recruited boss in a slot has its own command
{const cs0=canSummon;canSummon=function(a){if(a&&a.id==='jose')return false;return cs0.apply(this,arguments);};}
{const co0=compOf;compOf=function(c){if(c&&c.id==='jose'&&G&&!c.isComp){const L=(G.tamed||[]).filter(o=>o&&o.with==='jose');return L.sort((x,y)=>(x.j17s||0)-(y.j17s||0))[0]||null;}return co0.apply(this,arguments);};}
function j17BossEnt(a){try{if(!j17Is(a)||!B||!G||G.daily)return null;const e=j17Slots().find(e=>e.o&&e.o.scourge);return e&&b16Def(e.o.mon)?e:null;}catch(e){return null;}}
function j17BossWhy(a){if((B.summoned||{})[a.id])return 'Already called this battle.';if(B.sum||B.pray)return 'One summon at a time.';if(j17CerOut())return 'One summon at a time: Cerberus holds the field.';return null;}
ACT.j17Boss=function(){const a=B&&B.cur,e=a&&B.mode==='cmd'&&j17BossEnt(a);if(!e||j17BossWhy(a))return;if(!TPL[e.o.id])registerTamed(e.o);j17Pay(a,L17.cost.guard);b16BossFire(a,e.o);};
// --- the skills in hand: blood costs, summons, and the greyed rows ---
{const sk0=ACT.sk;ACT.sk=function(id){try{if(B&&B.mode==='cmd'&&B.cur){const s=known(B.cur).find(x=>x.id===id),why=s&&j17Block(B.cur,s);if(why){toast(why);return;}}}catch(e){}return sk0.apply(this,arguments);};}
HOOK.xform('cmdHtml','legends17a','greyed rows with the reason, the boss command, HP for MP in his summons menu',function(h){try{const a=B&&B.cur;if(!a||typeof h!=='string'||B.mode!=='cmd')return h;
  if(B.menu==='skills'&&(a.id==='jose'||a.id==='dist'))known(a).forEach(s=>{if(!(s.j17||s.gold||s.hpc))return;const why=j17Block(a,s),re=new RegExp(`(<button class="mi [^"]*" data-act="sk" data-arg="${s.id}")([^>]*>)`);
    h=h.replace(re,(m,p,q)=>p+(why&&!/ disabled/.test(q)?` disabled aria-disabled="true" title="${esc(why)}"`:'')+q);
    const cost=s.j17==='whistle'?(()=>{const I=j17WhistleInfo(a);return I.mode?j17Pc(I.cost)+'% HP':'';})():s.j17==='pack'?j17Pc(L17.cost.pack)+'% HP':s.gold?j17Toll()+' gold':'';
    if(cost)h=h.replace(new RegExp(`(data-act="sk" data-arg="${s.id}"[^>]*>(?:(?!</button>)[\\s\\S])*?)(<i class="sk11c"[^>]*>)?0 MP`),(m,p,q)=>p+(q?'<i class="sk11c" title="Cost">':'')+cost);
    if(s.j17==='whistle'||s.j17==='pack')h=h.replace(new RegExp(`(data-act="sk" data-arg="${s.id}"[^>]*>(?:(?!</button>)[\\s\\S])*?<b class="sk11e[^"]*">)Buff(</b>)`),'$1Summon$2');
    if(why)h=h.replace(new RegExp(`(data-act="sk" data-arg="${s.id}"[\\s\\S]*?<small>)`),`$1<b class="j17why">${esc(why)}</b> `);});
  if(B.menu==='root'&&j17Is(a)){const e=j17BossEnt(a);if(e&&!B.swapAsk){const why=j17BossWhy(a);
      h=h.replace('<div class="menu sec">',`<div class="menu sec"><button class="mi summon b9sum j17boss" data-act="j17Boss" ${why?'disabled aria-disabled="true"':''} title="${esc(why||`${e.o.name} takes the whole Vanguard's place. Costs ${j17Pc(L17.cost.guard)}% of his max HP.`)}">Summon ${esc(e.o.name)} <small>${j17Pc(L17.cost.guard)}% HP</small></button>`);}}
  if(j17Is(a)&&B.menu==='summons')h=h.replace(/Costs \d+ MP\./,`Costs ${j17Pc(L17.cost.guard)}% of his max HP, no MP.`);
  if(j17Is(a)&&B.menu==='root')h=h.replace(/(<button class="mi summon s8"[^>]*>Invoke)(<\/button>)/,`$1 <small>${j17Pc(L17.cost.guard)}% HP</small>$2`);
  }catch(e){console.error('legends17a cmd',e);}return h;});
// auto battle: a summoner who summons, never below half HP (the plain auto and the careful one)
function j17AutoJose(a){try{if(L17.simOff||!j17Is(a)||!B||B.over||B.mode!=='cmd')return false;const au=L17.auto;L17.auto=0;let ks;try{ks=known(a);}finally{L17.auto=au;}/* (his own list, not the one the auto is shown) */
  const foes=B.en.filter(e=>e.hp>0);if(!foes.length)return false;
  const tough=B.boss||foes.length>1||foes.some(e=>e.elite),after=c=>(a.hp-a.S.mhp*c)/a.S.mhp>=L17.autoHp;if(!tough)return false;
  const I=j17WhistleInfo(a);if(!I.mode)return false;const pack=ks.find(s=>s.j17==='pack'),wh=ks.find(s=>s.j17==='whistle');
  if(I.mode==='call'&&pack&&I.all.length>1&&after(L17.cost.pack)){exec(pack,[a]);return true;}
  if(wh&&after(I.cost)&&(I.mode==='call'||B.boss)){exec(wh,[a]);return true;}}catch(e){console.error('legends17a auto',e);}return false;}
{const as0=autoTurnSmart;autoTurnSmart=function(){if(B&&!B.over&&B.mode==='cmd'&&B.auto){const a=B.cur;if(a&&a.id==='jose'&&j17AutoJose(a))return;}
  L17.auto=(L17.auto||0)+1;try{return as0.apply(this,arguments);}finally{L17.auto--;}};}
{const at0=autoTurn;autoTurn=function(){if(B&&!B.over&&B.mode==='cmd'&&B.auto&&!SIM_SMART){const a=B.cur;if(a&&a.id==='jose'&&RNG()<.5&&j17AutoJose(a))return;}
  L17.auto=(L17.auto||0)+1;try{return at0.apply(this,arguments);}finally{L17.auto--;}};}
// while the auto chooses: nothing it cannot pay for, and it never spends gold or HP it should keep
{const kn0=known;known=function(c){const L=kn0.apply(this,arguments);try{if(L17.auto>0&&c&&B&&(c.id==='jose'||c.id==='dist'))return L.filter(s=>!(s.j17==='whistle'||s.j17==='pack'||s.gold)&&!j17Block(c,s)&&!(s.hpc&&(c.hp-c.S.mhp*s.hpc)/c.S.mhp<L17.autoHp));}catch(e){}return L;};}
// ---------- 6. Dist in battle, and the one perform hook both heroes share ----------
const j17BattleGold=()=>{try{return B.en.reduce((q,e)=>q+goldFor(e),0);}catch(e){return 0;}};
function j17Lift(a,t,sure){const S=j17S();if(!S||!t)return 0;const g=Math.max(1,Math.round((t.lv||1)*(sure?1:.8)+ri(sure?3:1,sure?8:4)));
  if(!sure){const cap=Math.round(j17BattleGold()*L17.lf.cap);if(S.lift>=cap)return 0;S.lift+=g;}
  B.gold+=g;S.lifts++;S.gold=(S.gold||0)+g;return g;}
HOOK.after('calcDamage','legends17a','Light Fingers: every real hit of his may lift gold',function(r,a,sk,t){try{
  if(!r||!(r.dmg>0)||!B||!j17Dist(a)||!t||t.side!=='e'||!(L17.perf>0)||RNG!==L17.rng||L17.echo||(sk&&(sk.j17c||sk.id==='b4est'))||(G&&G.daily))return;
  if(RNG()<L17.lf.ch){const g=j17Lift(a,t,false);if(g){L17.lfN=(L17.lfN||0)+g;}}}catch(e){}});
HOOK.after('calcStats','legends17a','Light Fingers: harder to hit',function(S,c){try{if(S&&c&&c.id==='dist'&&!(G&&G.daily))S.eva=Math.min(.32,(S.eva||0)+L17.lf.eva);}catch(e){}});
// Slip Under: +crit on the attack that follows it
HOOK.wrap('calcDamage','legends17a','Slip Under: the next attack is likelier to crit',function(next,...args){const a=args[0];if(!a||!a.S||!a.st||!a.st.slip||!j17Dist(a))return next(...args);
  const c0=a.S.crit;a.S.crit=(c0||.05)+L17.slip.crit;try{return next(...args);}finally{a.S.crit=c0;}});
// the crew: every foe once, then the rest at random; Limit II strips a boon from each foe, lifts gold and chips shields once
function j17Crew(next,a,sk){const live=B.en.filter(e=>e.hp>0),two=!!sk.limit2,S=j17S(),N=sk.hits||1;S.crewT={t:Date.now(),two};
  const base=Object.assign({},sk,{j17:null,j17c:1,shieldChip:0});
  const r=next(a,Object.assign({},base,{t:'one',hits:1}),live.slice(0,N));
  const rest=N-Math.min(N,live.length),left=B.en.filter(e=>e.hp>0);
  if(rest>0&&left.length){const lg=log;log=function(m){if(typeof m==='string'&&/ uses /.test(m))return;return lg.apply(this,arguments);};
    try{next(a,Object.assign({},base,{t:'rand',hits:rest}),left);}finally{log=lg;}}
  if(two){let n=0;B.en.forEach(e=>{if(e.hp<=0)return;const b=Object.keys(e.st).find(k=>STS[k]&&!STS[k].bad);if(b){delete e.st[b];fx(e,STS[b].n+' off','stat bad');n++;}if(e.maxShield)chipShield(e,2,'skill');});
    let g=0;const pool=B.en.filter(e=>e.hp>0).concat(B.en);for(let i=0;i<Math.min(L17.crew.lifts,N)&&pool.length;i++)g+=j17Lift(a,pool[i%pool.length],true);
    if(g){fx(a,'+'+g+' gold','stat good');log(`The crew leaves with ${g} gold${n?` and ${n} boon${n>1?'s':''}`:''}.`);}}
  return r;}
HOOK.wrap('perform','legends17a','blood costs, Whistle, the pack and Cerberus; the Water Clone, Pick Up the Pace, Slip Under, the crew',function(next,a,sk,tgts){
  if(!B||!a||!sk)return next(a,sk,tgts);
  // a foe that picked a hero who went under: the blow goes to someone else, or nowhere
  if(a.side==='e'){try{if(tgts&&tgts.length===1&&tgts[0]&&tgts[0].side==='p'&&has(tgts[0],'slip')&&sk.t!=='all'&&sk.t!=='self'){const t=tgts[0],o=B.front.filter(c=>c.hp>0&&c!==t&&!has(c,'slip')&&!c.j17gone);
      fx(t,'Slips under','stat good');if(o.length){log(`${t.name} is not there. ${a.name} turns on someone else.`);tgts=[pick(o)];}
      else{log(`${a.name} strikes at the water where ${t.name} was.`);a.actT=Date.now();a.actKind=sk.k;return;}}
      if(tgts&&tgts.length===1&&tgts[0]&&tgts[0].j17==='pet'&&L17.pack.draw<1&&sk.t!=='all'&&sk.t!=='self'&&RNG()>=L17.pack.draw){const hs=B.front.filter(c=>c.hp>0&&!c.j17&&!has(c,'slip'));if(hs.length){const tn=hs.filter(c=>has(c,'taunt'));tgts=[tn.length?tn[0]:pick(hs)];}}}catch(e){}
    return next(a,sk,tgts);}
  if(a.side!=='p'||a.isComp||a.isSum||!(a.id==='jose'||a.id==='dist'))return next(a,sk,tgts);
  const r0=L17.rng;L17.perf=(L17.perf||0)+1;L17.rng=RNG;
  try{
    if(sk.hpc&&j17Is(a))j17Pay(a,sk.hpc);
    if(sk.gold&&!sk.j17echo){const c=Math.min(G.gold||0,j17Toll());G.gold-=c;fx(a,'-'+c+' gold','stat');log(`${a.name} throws ${c} gold.`);}
    if(sk.j17==='crew')return j17Crew(next,a,sk);
    L17.lfN=0;const hpE=()=>B.en.reduce((q,e)=>q+Math.max(0,e.hp),0),h0=hpE();
    const r=next(a,sk,tgts);const h1=hpE();
    if(sk.j17==='whistle')j17Whistle(a);
    else if(sk.j17==='pack')j17CallPack(a);
    else if(sk.j17==='cer'){j17Cerberus(a,!!sk.limit2);}
    else if(sk.j17==='pace'){(tgts||[]).forEach(t=>{if(!t||t.hp<=0)return;if(t.st.haste)t.st.haste.t+=L17.pace.turns;if(t!==a&&t.next>B.time)t.next=B.time+(t.next-B.time)*(1-L17.pace.pull);else if(t===a)a.j17pull=1;fx(t,'Quicker','stat good');});}
    else if(sk.j17==='slip'){if(a.st.slip)a.st.slip.t=STS.slip.t;}
    else if(sk.j17==='clone'){j17S().cloneT=Date.now();}
    else if(sk.j17==='shake'){const t=(tgts||[])[0];if(t){if(t.hp>0){const b=Object.keys(t.st).find(k=>STS[k]&&!STS[k].bad);if(b){delete t.st[b];fx(t,STS[b].n+' off','stat bad');log(`${t.name} loses ${STS[b].n}.`);}}
        const g=j17Lift(a,t,true);if(g)log(`${a.name} shakes ${g} gold out of ${t.name}.`);}}
    if(L17.lfN>0&&j17Dist(a)){fx(a,'+'+L17.lfN+' gold','stat good');log(`Light Fingers: ${a.name} lifts ${L17.lfN} gold.`);L17.lfN=0;}
    // the Water Clone repeats a damaging skill (never a Limit, never its own echo)
    if(j17Dist(a)&&has(a,'wclone')&&(sk.k==='phys'||sk.k==='mag')&&!sk.limit&&!sk.j17echo&&a.hp>0&&sk.pw>0){
      const live=B.en.filter(e=>e.hp>0);let tg=sk.t==='all'||sk.t==='rand'?live:(tgts||[]).filter(t=>t&&t.hp>0&&t.side==='e');if(!tg.length&&live.length)tg=[pick(live)];
      if(tg.length){const e2=Object.assign({},sk,{n:sk.n+' (Water Clone)',pw:+(sk.pw*L17.clone.pw).toFixed(3),steal:0,strip:0,fx:null,self:null,allyFx:null,shieldChip:0,drain:0,role:undefined,gold:0,j17:null,j17echo:1,mp:0});
        const S=j17S();S.echoT=Date.now();S.echoN=(S.echoN||0)+1;const t0=a.actT,n0=a.actName;L17.echo=1;try{next(a,e2,tg);}finally{L17.echo=0;a.actT=t0;a.actName=n0;}S.mainD=h0-h1;S.echoD=h1-hpE();}}
    return r;
  }finally{L17.perf--;L17.rng=r0;}});
// Pick Up the Pace on himself: his own next turn comes sooner too (his delay is set when the turn ends)
{const et0=endTurn;endTurn=function(u,cost){const pull=u&&u.j17pull;if(pull)u.j17pull=0;const t0=B?B.time:0;const r=et0.apply(this,arguments);try{if(pull&&B&&u.hp>0&&u.next>t0)u.next=t0+(u.next-t0)*(1-L17.pace.pull);}catch(e){}return r;};}
// the clone goes when he falls or leaves the Vanguard (a swap clears statuses already)
HOOK.before('fallen','legends17a','the Water Clone falls apart with him',function(u){try{if(u&&u.id==='dist'&&u.st)delete u.st.wclone;}catch(e){}});
// ---------- 7. the stage: where the pack stands, the blood summon, the clone, the crew ----------
const J17V={fx:[],puff:[],last:null,frame:-1,alpha:new WeakMap(),pos:{pet:[[.62,.645],[.545,.79],[.6,.955]],cer:[.545,.9],cerT:[.585,.77]}};// shares of the stage (x, feet y); cerT: the tall (portrait) stage
function j17Fast(){try{return PAUSE<300||(typeof gfxStill==='function'&&gfxStill());}catch(e){return false;}}
function j17Land(){return j17Fast()?0:L17.anim.blood+L17.anim.kneel+330;}
// the summon starts: the poses on him, the ring from his palm, the smoke where each summon lands
function j17Anim(a,units,big){const now=Date.now();a.j17anim={t:now,big:!!big};a.actT=now-600;a.actKind=null;a._act=a.actT;a._fkTint=null;// (the generic cast pose, hop, ring and tint are not used)
  if(!j17Fast()&&B){B.j17hold=now+L17.anim.total;B.j17holdN=0;}
  J17V.fx.push({t:now,a,units:(units||[]).slice(),big:!!big,box:J17V.last&&J17V.last.a===a?J17V.last.b:null,bid:B&&B.id});if(J17V.fx.length>6)J17V.fx.shift();
  try{if(typeof sfx==='function')sfx('level');}catch(e){}}
// [pose, frame] at d ms into the summon
function j17AnimPose(d){const A=L17.anim;if(d<A.blood*.45)return ['jblood',0];if(d<A.blood)return ['jblood',1];if(d<A.blood+A.kneel)return ['jslam',0];return ['jslam',1];}
function j17AlphaCv(c,al){let o=J17V.alpha.get(c);if(o&&o.al===al)return o.c;const k=c.hd||1,RW=c._rw||Math.round(c.width*k),RH=c._rh||Math.round(c.height*k);let n;
  if(c.hd&&typeof hdCv==='function')n=hdCv(c.width,c.height,k);else n=mkCv(c.width,c.height);const x=n.getContext('2d');x.save();x.setTransform(1,0,0,1,0,0);x.globalAlpha=al;(x._hdDI||x.drawImage).call(x,c,0,0,RW,RH,0,0,RW,RH);x.restore();
  J17V.alpha.set(c,{al,c:n});return n;}
function j17MonFrame(u){const art=TPL[u.id]&&TPL[u.id].art;if(!art||!MART[art])return null;const a=Date.now()-(u.actT||0),t=u.actKind&&a>=60&&a<420?'atk':'idle',i=t==='idle'&&!(typeof gfxStill==='function'&&gfxStill())?Math.floor(performance.now()/700+(u.j17slot||0)*.5)%2:0;
  return imgOf('j17m:'+art+'#'+t+i,()=>monCanvas(art,{t,i}));}
HOOK.xform('spriteOf','legends17a','the blood summon poses, the dogs\' frames, the water clone and the dodge',function(c,u,walk){try{if(!u||u.side!=='p')return c;
  if(u.j17){const f=j17MonFrame(u);return f||c;}
  if(u.id==='jose'&&u.hp>0&&!u.isComp){const A=u.j17anim;if(A){const d=Date.now()-A.t;if(d>=0&&d<L17.anim.total){const P=j17AnimPose(d);return b8Small(heroPoseImg('jose',P[0],P[1],false));}}
    if(B&&B.pray&&B.pray.by===u)return b8Small(heroPoseImg('jose','jblood',1,false));}
  if(u.j17clone)return j17AlphaCv(c,.8);
  if(u.id==='dist'&&u.hp>0&&u.st&&u.st.slip&&!u.isComp)return j17AlphaCv(c,.4);}catch(e){}return c;});
HOOK.before('unitBox','legends17a','the pack beside the Vanguard, Cerberus in front of it',function(u){try{if(!u||!u.j17||!B||!BL)return;const W=BL.W,H=BL.H,c=spriteOf(u);
  const tall=W<260,p=u.j17==='cer'?(tall?J17V.pos.cerT:J17V.pos.cer):J17V.pos.pet[u.j17slot||0];let x=Math.round((tall?p[0]+.02:p[0])*W),y=Math.round(Math.min(H-2,p[1]*H));
  if(u.j17==='cer')x=Math.max(Math.round(c.width*.5)+1,x);
  return HOOK.stop({x,y,w:c.width,h:c.height,i:3+(u.j17slot||0)});}catch(e){}});
// --- drawing ---
function j17Ell(ctx,x,y,rx,ry,col,al,lw){ctx.globalAlpha=al;ctx.strokeStyle=col;ctx.lineWidth=lw||1;ctx.beginPath();ctx.ellipse(Math.round(x),Math.round(y),Math.max(.5,rx),Math.max(.5,ry),0,0,7);ctx.stroke();}
// the sigil: a ring that spreads from the palm, a second ring inside it, three joined marks (one for each of the three) and glyph ticks, all in blood red
function j17Sigil(ctx,x,y,R,p,al,now){const sq=.34,r=R*(1-Math.pow(1-p,2.2)),e=Math.min(1,p*1.6);if(r<1)return;ctx.save();
  ctx.globalAlpha=al*.3;ctx.fillStyle='#5a0c14';ctx.beginPath();ctx.ellipse(x,y,r,r*sq,0,0,7);ctx.fill();
  j17Ell(ctx,x,y,r,r*sq,'#c4262e',al,2);j17Ell(ctx,x,y,r*.94,r*.94*sq,'#ff6a5a',al*.8,1);j17Ell(ctx,x,y,r*.6,r*.6*sq,'#c4262e',al*.9,1);
  const rot=now/900,P=[0,1,2].map(i=>{const a=rot+i*Math.PI*2/3;return [x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6*sq];});
  ctx.globalAlpha=al*.9*e;ctx.strokeStyle='#e0303a';ctx.lineWidth=1;ctx.beginPath();P.forEach((q,i)=>{if(i)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1]);});ctx.closePath();ctx.stroke();
  ctx.fillStyle='#ff8a6a';P.forEach(q=>{ctx.fillRect(Math.round(q[0])-1,Math.round(q[1])-1,3,2);});
  ctx.fillStyle='#c4262e';for(let i=0;i<12;i++){const a=-rot*.6+i*Math.PI/6,rr=r*.78;ctx.globalAlpha=al*e*(i%2?.9:.6);ctx.fillRect(Math.round(x+Math.cos(a)*rr)-(i%3?0:1),Math.round(y+Math.sin(a)*rr*sq),i%3?1:3,1);}
  ctx.restore();}
function j17UnitGround(u){try{const b=unitBox(u);if(!b)return null;return {x:b.x,y:b.gy!=null?b.gy:b.y,w:b.w,h:b.h,s:b._ch15||1};}catch(e){return null;}}
// under the units: the rings (called once a frame, before the first unit is drawn)
function j17DrawGround(ctx,now){const T=Date.now(),A=L17.anim,slam=A.blood+A.kneel;J17V.fx=J17V.fx.filter(f=>T-f.t<A.total+500&&B&&f.bid===B.id);
  J17V.fx.forEach(f=>{const d=T-f.t,g=j17UnitGround(f.a)||(f.box?{x:f.box.x,y:f.box.gy!=null?f.box.gy:f.box.y,s:f.box._ch15||1}:null);if(!g||d<slam)return;
    const p=Math.min(1,(d-slam)/A.ring),out=d>A.total?Math.max(0,1-(d-A.total)/500):1,px=g.x-15*g.s,R=(f.big?74:46);
    j17Sigil(ctx,px,g.y+1,R,p,out,now);
    if(d>=j17Land()-120)f.units.forEach(u=>{const q=j17UnitGround(u);if(!q)return;const pp=Math.min(1,(d-(j17Land()-120))/420);j17Sigil(ctx,q.x,q.y+1,Math.max(12,Math.min(q.w,70)*(f.big?.5:.42)),pp,out*.9,now+500);});});
  ctx.globalAlpha=1;}
// over the units: the smoke each summon stands in, the puff a pet leaves, the crew of the Limit
function j17Smoke(ctx,x,y,w,h,p,seed,red){const n=10;for(let i=0;i<n;i++){const a=(i*2.399+seed)%6.283,rr=(.25+.75*((i*37+seed*11)%10)/10),ox=Math.cos(a)*w*.42*rr*(.5+p),oy=-h*.12-Math.abs(Math.sin(a))*h*.5*rr*(.4+p*.9)-p*6,r=(3+((i*13)%5))*(1+p*1.6)*(w>50?1.5:1);
    ctx.globalAlpha=Math.max(0,(1-p)*(1-p)*.9);ctx.fillStyle=i%3===0?(red?'#a85a5a':'#b0a8b4'):i%3===1?'#e8e2e6':'#cfc4c8';ctx.beginPath();ctx.arc(Math.round(x+ox),Math.round(y+oy),r,0,7);ctx.fill();}
  ctx.globalAlpha=1;}
function j17DrawOver(ctx,now){if(!B)return;const T=Date.now(),land=j17Land();
  J17V.fx.forEach(f=>{const d=T-f.t-land+90;if(d<0||d>620)return;f.units.forEach((u,i)=>{const q=j17UnitGround(u);if(q)j17Smoke(ctx,q.x,q.y,q.w*q.s*.9,q.h*q.s*.8,d/620,i*3+1,true);});});
  J17V.puff=J17V.puff.filter(p=>T-p.t<420&&B&&p.bid===B.id);J17V.puff.forEach(p=>j17Smoke(ctx,p.x,p.y,p.w,p.h,(T-p.t)/420,p.seed,false));
  const S=B.j17,C=S&&S.crewT;if(C){const d=T-C.t,len=C.two?1850:1300;if(d>len)S.crewT=null;else j17DrawCrew(ctx,d,C.two);}}
// the crew crossing the field: from behind the party through every foe and off the far side, speed streaks behind them
function j17DrawCrew(ctx,d,two){const W=BL.W,H=BL.H,runs=two?[[0,.5,0],[80,.66,1],[160,.82,2],[50,.94,3],[130,.58,4],[620,.54,2],[690,.7,0],[760,.86,4],[650,.98,1]]:[[0,.52,0],[90,.68,1],[180,.84,2],[50,.96,3],[140,.6,4]];
  runs.forEach(([t0,fy,k],n)=>{const p=(d-t0)/760;if(p<0||p>1)return;const img=b8Small(heroPoseImg(j17Hid('dist_c'+k),'thrust',Math.floor(d/90+n)%2,true)),x=Math.round(W+24-(W+70)*p),y=Math.round(fy*H);
    ctx.globalAlpha=.85;ctx.fillStyle='rgba(74,168,255,.75)';[[6,-20,14],[10,-13,16],[5,-7,12]].forEach(r=>{ctx.fillRect(x+r[0],y+r[1],r[2],1);});ctx.fillStyle='rgba(220,244,255,.9)';[[6,-20],[10,-13],[5,-7]].forEach(r=>ctx.fillRect(x+r[0],y+r[1],3,1));
    if(two&&n%2){ctx.fillStyle='#f0c040';[[18,-24],[24,-12],[14,-4]].forEach(r=>ctx.fillRect(x+r[0]+Math.floor(d/60)%3,y+r[1],2,2));}
    ctx.globalAlpha=1;ctx.save();ctx.translate(x+img.width/2,y-img.height+1);ctx.scale(-1,1);ctx.drawImage(img,0,0);ctx.restore();});ctx.globalAlpha=1;}
// a hero drawn by hand (Joseth kneeling where he stood while his guardian takes the field)
function j17DrawGhost(ctx,f){const d=Date.now()-f.t;if(d<0||d>=L17.anim.total||!f.box)return;const P=j17AnimPose(d),img=b8Small(heroPoseImg('jose',P[0],P[1],false)),b=f.box,s=b._ch15||1,gy=b.gy!=null?b.gy:b.y;
  ctx.save();ctx.globalAlpha=d>L17.anim.total-200?Math.max(0,(L17.anim.total-d)/200):1;ctx.translate(b.x,gy);ctx.scale(s,s);ctx.translate(-b.x,-gy);ctx.translate(Math.round(b.x-img.width/2)+img.width,Math.round(b.y-img.height+1));ctx.scale(-1,1);ctx.drawImage(img,0,0);ctx.restore();ctx.globalAlpha=1;}
HOOK.wrap('drawUnit','legends17a','the sigil under the units, a summon hidden until its smoke, the water clone behind Dist',function(next,ctx,u,b,now,tg){
  try{if(J17V.frame!==now){J17V.frame=now;j17DrawGround(ctx,now);J17V.fx.forEach(f=>{if(B&&!B.front.includes(f.a))j17DrawGhost(ctx,f);});}}catch(e){}
  try{if(u&&u.j17){if(u.j17gone){if(!u.j17puff&&b){u.j17puff=1;J17V.puff.push({t:Date.now(),x:b.x,y:b.gy!=null?b.gy:b.y,w:b.w*.8,h:b.h*.7,seed:(u.j17slot||0)*5+2,bid:B.id});}return;}
      if(u.j17in&&Date.now()<u.j17in)return;}
    if(u&&u.id==='jose'&&!u.isComp&&b)J17V.last={a:u,b:Object.assign({},b)};
    if(u&&u.id==='dist'&&!u.isComp&&u.hp>0&&u.st&&u.st.wclone&&b&&!u.j17clone){const g=Object.create(u);g.id=j17Hid('dist_wc');g.j17clone=1;g.st={};g.fx=[];g.lb=0;g.guard=false;
      const b2=Object.assign({},b,{x:b.x+Math.round(9*(b._ch15||1)),y:b.y-3});if(b2.gy!=null)b2.gy=b.gy-3;next(ctx,g,b2,now,false);}}catch(e){}
  const r=next(ctx,u,b,now,tg);
  try{if(u&&u.id==='dist'&&u.hp>0&&u.st&&u.st.slip&&b){const gy=b.gy!=null?b.gy:b.y,k=Math.floor(now/160)%3;ctx.fillStyle='rgba(140,210,255,.8)';ctx.fillRect(b.x-9-k,gy,18+k*2,1);ctx.fillRect(b.x-5+k,gy+2,10,1);}}catch(e){}
  return r;});
HOOK.after('drawParts','legends17a','summon smoke and the crew over the units',function(r,ctx,now){try{j17DrawOver(ctx,now);}catch(e){}});
{const uh0=unitHud;unitHud=function(ctx,u){if(u&&(u.j17clone||(u.j17&&(u.j17gone||(u.j17in&&Date.now()<u.j17in)))))return;return uh0.apply(this,arguments);};}
try{['junah','odin','zeus','cerberus','cerberus2'].forEach(k=>MFRAME.add(k));}catch(e){}
// the party panel: a pack pet or Cerberus gets the short card (one line, like a rearguard card), its own picture and its role
{const pc0=pcard0;pcard0=function(c,rs,turn,tg,lb){if(!c||!c.j17)return pc0.apply(this,arguments);let h=pc0.call(this,c,true,turn,tg,lb);
  const role=c.j17==='cer'?'Limit summon':c.j17dog?{junah:'Healer',odin:'Saboteur',zeus:'Magic'}[c.j17dog]:'Pet';
  return h.replace('class="pc rs','class="pc rs j17pc').replace(' swapok','').replace(' title="Tap to switch in"','').replace('. Tap to switch in','').replace(/<small class="ucc">[^<]*<\/small>/,`<small class="ucc">${role} · ${c.j17==='cer'?c.turnsLeft:c.compTurns} turn${(c.j17==='cer'?c.turnsLeft:c.compTurns)===1?'':'s'}</small>`);};}
try{const st=document.createElement('style');st.textContent='.battle .pc.j17pc .port{overflow:hidden}.battle .pc.j17pc .port img{width:100%!important;height:100%!important;max-width:none!important;object-fit:contain!important;object-position:50% 50%!important;transform:none!important;margin:0!important;position:static!important;inset:auto!important}';document.head.appendChild(st);}catch(e){}
// ---------- 8. menus: the three slots, and every note that lists who can call a recruited boss ----------
const j17Known=()=>{try{return !!(G&&G.roster&&G.roster.jose)||legendOn('jose');}catch(e){return false;}};
// "Nikaris, a Priest or a Monk" gains Joseth once the player knows him (a locked legend is never named)
function j17Names(h){if(typeof h!=='string'||!j17Known())return h;
  return h.replace(/Only Nikaris, a Priest or a Monk/g,'Only Nikaris, Joseth, a Priest or a Monk').replace(/Nikaris, Priest or Monk/g,'Nikaris, Joseth, Priest or Monk').replace(/It needs Nikaris, a Priest or a Monk/g,'It needs Nikaris, Joseth, a Priest or a Monk')
    .replace(/it needs a Priest or Nikaris to Invoke it/g,'it needs a Priest, Nikaris or Joseth to Invoke it').replace(/answers a Priest, Nikaris, or a Monk/g,'answers a Priest, Nikaris, Joseth, or a Monk').replace(/With Nikaris in the fight a beaten Scourge may ask to join/g,'With Nikaris or Joseth in the fight a beaten Scourge may ask to join');}
HOOK.xform('cmdHtml','legends17a','Joseth among the callers in the greyed Summon note',function(h){return j17Names(h);});
{const bt0=compBonusText;compBonusText=function(o){let h=bt0.apply(this,arguments);try{h=j17Names(h);if(o&&o.with==='jose')h=h.replace(/Summon once per battle \(\d+ turns\)/,o.scourge?`Summon once per battle (${COMP_TURNS+1} turns, ${j17Pc(L17.cost.guard)}% of his HP)`:`Whistle or Call the Pack (${L17.pack.turns} turns beside the Vanguard)`);}catch(e){}return h;};}
if(typeof r17Callers==='function'){const rc0=r17Callers;r17Callers=function(){const C=rc0.apply(this,arguments);try{const j=G.roster&&G.roster.jose;if(j&&!C.full.includes(j)){C.full=C.full.concat(j).sort((a,b)=>C.inSix(b)-C.inSix(a)||b.lv-a.lv);}}catch(e){}return C;};}
function j17SlotRow(e,edit){const d=e.o?compDef(e.o):L17_MON[e.dog],boss=e.o&&e.o.scourge,role=e.dog?{healer:'Healer: heals the weakest ally, gives Regen, cleanses',saboteur:'Saboteur: slows, weakens, breaks, steals, strips boons',magic:'Magic: single and area lightning, stuns'}[d.role]:(d.sk||[]).map(s=>esc(s[0])).join(', ');
  const who=boss?`<b>Joseth</b>: Summon, once per battle (${COMP_TURNS+1} turns in the whole Vanguard's place, ${j17Pc(L17.cost.guard)}% of his max HP)`:`<b>Joseth</b>: Whistle or Call the Pack (${L17.pack.turns} turns beside the Vanguard, ${j17Pc(L17.cost.pet)}% of his max HP, or ${j17Pc(L17.cost.pack)}% for all three)`;
  return `<div class="row comprow j17slot"><img class="mimg" src="${monURL(d.art)}" alt=""><div class="grow"><b>${esc(j17EntName(e))}</b>${e.dog?' <em class="cyc">His own</em>':boss?' <em class="cyc legb">Recruited boss</em>':''}<small>Slot ${e.i+1} · ${(d.el||[]).map(ico).join('')} ${role}</small><small class="r17who">Who can call it: ${who}.</small></div>${edit?`<button class="btn sm" data-act="j17SlotPick" data-arg="${e.i}">Change</button>`:''}</div>`;}
function j17PackHtml(edit){return `<h4 class="r17h j17h">Joseth's pack <small>3</small></h4><p class="note">Joseth keeps three pets and can have all three out at once, beside the Vanguard (they fight at ${j17Pc(L17.pack.pw)}% power with ${j17Pc(L17.pack.hp)}% of a pet's HP). His own dogs fill every slot you leave to them; a tamed pet can take a slot instead, at most one recruited boss among the three. One summon at a time: a guardian, a recruited boss or Cerberus sends the pack home.</p><div class="rows">${j17Slots().map(e=>j17SlotRow(e,edit)).join('')}</div>`;}
{const vc0=vCompanions;vCompanions=function(){let h=vc0.apply(this,arguments);try{h=j17Names(h);if(G&&!G.daily&&G.roster&&G.roster.jose){
    h=h.replace(/<b>Joseth<\/b>: Summon, once per battle \(\d+ turns, in Joseth's place\)/g,`<b>Joseth</b>: Whistle or Call the Pack (${L17.pack.turns} turns beside the Vanguard)`);
    const i=h.indexOf('<h4 class="r17h">');h=i>=0?h.slice(0,i)+j17PackHtml(true)+h.slice(i):h+j17PackHtml(true);}}catch(e){console.error('legends17a summons',e);}return h;};}
function j17Put(o,i){if(!o)return;(G.tamed||[]).forEach(x=>{if(x&&x!==o&&x.with==='jose'&&(x.j17s===i||(o.scourge&&x.scourge))){x.with=null;delete x.j17s;}});o.with='jose';o.j17s=i;}
function j17FreeSlot(o){const S=j17Slots();const b=o&&o.scourge&&S.find(e=>e.o&&e.o.scourge);if(b)return b.i;const d=S.find(e=>e.dog);return d?d.i:0;}
function mJ17Slot(m){const i=m.slot|0,S=j17Slots(),cur=S[i],dog=L17_MON[L17.dogs[i]];
  const rows=[`<div class="row comprow"><img class="mimg" src="${monURL(dog.art)}" alt=""><div class="grow"><b>${esc(dog.n)}</b> <em class="cyc">His own</em><small>${esc(dog.d)}</small></div><button class="btn sm ${cur.dog?'gold':''}" data-act="j17SlotSet" data-arg="${i},dog">${cur.dog?'In this slot':'Use'}</button></div>`]
    .concat((G.tamed||[]).filter(o=>o&&b16Def(o.mon)).map(o=>{const d=compDef(o),h=o.with&&G.roster[o.with],mine=cur.o===o,other=o.with==='jose'&&!mine;
      return `<div class="row comprow"><img class="mimg" src="${monURL(d.art)}" alt=""><div class="grow"><b>${esc(o.name)}</b>${o.scourge?' <em class="cyc legb">Recruited boss</em>':''}<small>${(d.el||[]).map(ico).join('')} ${esc(d.n)}</small><small>${mine?'In this slot':other?`In slot ${o.j17s+1} (moves here)`:h?`With ${esc(h.name)} (moves here)`:'Free'}</small></div><button class="btn sm ${mine?'gold':''}" data-act="j17SlotSet" data-arg="${i},${o.id}">${mine?'In this slot':'Use'}</button></div>`;}));
  return box(`Joseth's pack: slot ${i+1}`,`<p class="note">His own dog, or one of your tamed pets. At most one recruited boss among the three slots (a second one takes the first one's place).</p><div class="rows">${rows.join('')}</div>`,'<button class="btn gold" data-act="xBack">Done</button>');}
HOOK.before('vModal','legends17a','the pack slot chooser and the quest scenes',function(m){if(m&&m.type==='j17slot')return HOOK.stop(mJ17Slot(m));if(m&&m.type==='j17evt')return HOOK.stop(mJ17Evt(m));});
HOOK.wrap('modalBack','legends17a','the slot chooser goes back to where it was opened',function(next,m){if(m&&m.type==='j17slot'&&m.from&&m.from.type)return ()=>{V.modal=m.from;};return next(m);});
Object.assign(ACT,{
  j17SlotPick(i){if(!G||!G.roster.jose)return;V.modal={type:'j17slot',slot:+i||0,from:V.modal};render();},
  j17SlotSet(a){const [i,id]=String(a).split(','),k=+i||0;if(!G||!G.roster.jose)return;
    if(id==='dog')(G.tamed||[]).forEach(x=>{if(x&&x.with==='jose'&&x.j17s===k){x.with=null;delete x.j17s;}});else j17Put((G.tamed||[]).find(x=>x&&x.id===id),k);
    j17Norm(G);Object.values(G.roster).forEach(refresh);saveGame();try{sfx('blip');}catch(e){}render();}});
// the ordinary pairing popups: pairing a pet with Joseth puts it in a slot (and never throws his other pets out)
{const cs0=ACT.compSet;ACT.compSet=function(hid){try{if(hid==='jose'&&V.modal&&V.modal.id){const o=(G.tamed||[]).find(x=>x.id===V.modal.id);if(o){if(o.with!=='jose')j17Put(o,j17FreeSlot(o));j17Norm(G);Object.values(G.roster).forEach(refresh);saveGame();try{sfx('blip');}catch(e){}render();return;}}}catch(e){}
  const r=cs0.apply(this,arguments);try{j17Norm(G);}catch(e){}return r;};}
{const ps0=ACT.petSet;ACT.petSet=function(a){try{const [hid,pid]=String(a).split(',');if(hid==='jose'&&pid){const o=(G.tamed||[]).find(x=>x.id===pid);if(o){if(o.with!=='jose')j17Put(o,j17FreeSlot(o));j17Norm(G);Object.values(G.roster).forEach(refresh);saveGame();try{sfx('blip');}catch(e){}render();return;}}}catch(e){}
  const r=ps0.apply(this,arguments);try{j17Norm(G);}catch(e){}return r;};}
HOOK.after('unpackG','legends17a','old saves: slot marks follow the pairings',function(g){try{j17Norm(g);}catch(e){}});
HOOK.xform('mChar','legends17a','the pack on his hero sheet',function(h,id,edit){try{if(id!=='jose'||!G||G.daily||!G.roster.jose)return j17Names(h);const a=h.indexOf('<h4>Pet</h4>');
  if(a>=0){let b=h.indexOf('<h4',a+12);const sec=h.indexOf('</div></section>',a);if(sec>=0&&(b<0||sec<b))b=sec;if(b>a)h=h.slice(0,a)+j17PackHtml(!!edit)+h.slice(b);}}catch(e){}return j17Names(h);});
try{const st=document.createElement('style');st.textContent='.j17why{color:#ffc9a8;font-weight:600}.battle .mi.j17boss small{opacity:.8;margin-left:.3em}.j17h{margin-top:.2em}.j17evt .pbig img{image-rendering:pixelated}';document.head.appendChild(st);}catch(e){}

// ---------- 9. Blood Oath: with Joseth in the fight, beaten monsters sometimes swear to him ----------
HOOK.after('win','legends17a','Blood Oath: a beaten monster, Scourge or guardian may swear to Joseth',function(){try{const info=B&&B.result,spec=B&&B.spec;
  if(!info||!spec||!G||G.daily||info.tame||(G.tamed||[]).length>=8||!B.j17jose||!G.roster.jose)return;const nik=B.front.concat(B.back).some(c=>c&&c.id==='nikaris'),R=Math.random;let t=null;
  // (with Nikaris along his own, higher roll for monsters and Scourges has already been made: no second roll)
  if(!nik&&(spec.kind==='field'||spec.kind==='dungeon')&&!spec.mini&&R()<L17.oath.field){const pool=B.en.filter(e=>MON[e.art]&&!e.elite&&!e.boss);if(pool.length){const e=pool[Math.floor(R()*pool.length)];t={mon:e.art,name:'Wild '+MON[e.art].n};}}
  else if(!nik&&spec.kind==='boss'&&!B.en.find(e=>e.boss&&FINALS[e.key])&&R()<L17.oath.scourge){const bk=bossKeyFor(B.stage);t={mon:bk,name:'Lesser '+guardianDef(bk).n,scourge:1};}
  else if(spec.mini&&typeof spec.mini==='object'&&MON[spec.mini.mon]&&R()<L17.oath.guard){t={mon:spec.mini.mon,name:'Lesser '+String(spec.mini.name||MON[spec.mini.mon].n).split(',')[0],scourge:1};}
  if(t){t.j17=1;info.tame=t;info.notes=info.notes||[];info.notes.push(`Blood Oath: ${t.name} offers to swear to Joseth.`);render();}}catch(e){console.error('legends17a oath',e);}});
{const te0=tameElite;tameElite=function(t){const o=te0.apply(this,arguments);try{if(o&&t&&t.j17){o.oath=1;if(TPL[o.id])TPL[o.id].bio=`Sworn to Joseth in blood. A ${compDef(o).n} that follows the pack now.`;j17Norm(G);}}catch(e){}return o;};}
{const rt0=registerTamed;registerTamed=function(o){const r=rt0.apply(this,arguments);try{if(o&&o.oath&&TPL[o.id])TPL[o.id].bio=`Sworn to Joseth in blood. A ${compDef(o).n} that follows the pack now.`;}catch(e){}return r;};}
// ---------- 10. the two quests: "Three Whistles" and "The Toll on the Water" ----------
// A legend quest (legends.js: G.quests type 'legend', q.step) posts on the Notice Board. With the redeem code it posts as the older legends' quests
// do (legendRoll: from LEG_Q.ok, 30% a realm, for sure after one miss). Without a code it posts on its own from a later realm (L17.q.<id>.free,
// 0 based: Dist from the third realm, Joseth from the fourth; L17.q.ch a realm, for sure after one miss), so every player can earn the hero.
// Finishing it unlocks the hero on the account (META.legends), as the code does.
// Three Whistles: 0 Junah wants a Potion from your pack; 1 Odin has your purse (a fight, the purse comes back); 2 Zeus howls up a storm (a fight);
//   3 Joseth and all three dogs (the duel). The Toll on the Water: 0 the toll keeper takes a little gold whatever you answer; 1 the Runner
//   (corner him: three blows that hurt before his fourth turn, or he is over the wall and you try again); 2 Dist and two of his crew.
const j17Q=id=>((G&&G.quests)||[]).find(q=>q.type==='legend'&&q.hero===id)||null;
function j17QuestRoll(s){try{if(!G||G.daily||s==null)return;G.legRoll=G.legRoll||{};G.legMiss=G.legMiss||{};
  try{if(typeof legendRoll==='function')legendRoll(s);}catch(e){}
  L17.ids.forEach(id=>{if(G.roster[id]||j17Q(id)||legendOn(id))return;const Q=L17.q[id];if(s<Q.free)return;const k=id+':f'+s;if(G.legRoll[k])return;G.legRoll[k]=1;
    if(Math.random()>=L17.q.ch&&!(G.legMiss[id+'f']>=1)&&s<4){G.legMiss[id+'f']=(G.legMiss[id+'f']||0)+1;return;}
    const L=LEG_Q[id];G.quests.push({id:'L'+id,stage:s,type:'legend',hero:id,state:'open',step:0,title:L.title,desc:L.desc(s),reward:{gold:0}});});}catch(e){console.error('legends17a quest roll',e);}}
HOOK.after('genQuests','legends17a','the two legend quests can post without a code',function(r,s){j17QuestRoll(s);});
HOOK.before('nbBody','legends17a','the board checks for a legend quest of this realm (old saves, a code redeemed mid realm)',function(){try{if(G&&!G.daily)j17QuestRoll(G.stage);}catch(e){}});
{const lp0=legendProg;legendProg=function(q){try{if(q&&L17.ids.includes(q.hero)&&q.state!=='claimed'){const n=ZS(q.stage).n,st=q.step||0;
    return (q.hero==='jose'?['Find the golden dog','Find the dark dog that took your purse','Find the dog that howls at the storm','Find the man with the whistle']:['Find the toll keeper at the crossing','Corner the Runner','Follow the money to the far bank'])[st]+' in '+n;}}catch(e){}return lp0.apply(this,arguments);};}
// who stands on the field for the step (the actor itself comes from legends.js dynActors)
HOOK.wrap('walkerCanvas','legends17a','the quest actors: a dog, the toll keeper, the Runner',function(next,key,L,els,id,view,frame){try{
  if(key==='leg:jose'){const q=j17Q('jose'),st=q?(q.step||0):3;if(st<3){const art=L17.dogs[st];return imgOf('j17w:'+art,()=>monCanvas(art));}}
  else if(key==='leg:dist'){const q=j17Q('dist'),st=q?(q.step||0):2,k=st===0?'dist_tk':st===1?'dist_c1':null;if(k)return next('leg:'+k,TPL[j17Hid(k)].look,['water'],k,view,frame);}}catch(e){}
  return next(key,L,els,id,view,frame);});
HOOK.after('placeAt','legends17a','Zeus howls up a storm',function(){try{const m=WS.m;if(m&&m.kind==='field'&&legendQ(m).some(q=>q.hero==='jose'&&(q.step||0)===2))G.weather[m.s]='storm';}catch(e){}});
function j17Toll0(){return Math.min(G.gold||0,Math.max(10,Math.min(60,Math.round((G.gold||0)*.03))));}
function j17Talk(q){const id=q.hero,st=q.step||0;let m;
  if(id==='jose'){
    if(st===0)m={img:monURL('junah'),title:'A golden dog',text:'A golden retriever sits in the road with a torn glove in her mouth and the most patient eyes you have ever seen. She drops the glove, looks at your pack, looks at you, and waits.',
      note:(G.inv.potion||0)>0?'She wants something from your pack. A Potion would do.':'She wants something from your pack. Come back with a Potion.',btns:[['closeModal','Not yet'],['j17Give','Share a Potion',(G.inv.potion||0)>0]]};
    else if(st===1)m={img:monURL('odin'),title:'A dark dog',text:`Something brushes your hip. A sable shepherd is already ten paces off with your purse in his teeth${q.purse?` (${q.purse} gold)`:''}, watching you over his shoulder. The golden one at your heel sighs.`,fight:1,btns:[['closeModal','Not yet'],['j17Fight','Take it back',true]]};
    else if(st===2)m={img:monURL('zeus'),title:'A pale-eyed dog',text:'On the rise a black and white husky throws his head back and howls. The clouds answer. He will not stop for you, and the storm is getting closer.',fight:1,btns:[['closeModal','Not yet'],['j17Fight','Shout him down',true]]};
    else m={img:heroURL('jose'),title:TPL.jose.title,text:'One whistle, three notes. The dogs leave you without a look back and sit down around a man in a wide hat and a dark red coat. "They like you," he says, and bites his thumb until it bleeds. "I am harder to please. Show me you can stand in front of all four of us."',fight:1,btns:[['closeModal','Not yet'],['j17Fight','Stand against the pack',true]]};
  }else{
    if(st===0){const c=j17Toll0();m={img:heroURL(j17Hid('dist_tk')),title:'The toll keeper',text:`A man in a wide hat sits on a barrel where the road meets the water. "Toll," he says, without looking up. "For the crossing. For the upkeep of the crossing. For my time explaining the toll."`,
      note:`Whatever you answer, it costs you ${c} gold.`,btns:[['j17TollPay','Pay the toll',true],['j17TollNo','Refuse',true]]};}
    else if(st===1)m={img:heroURL(j17Hid('dist_c1')),title:'The Runner',text:'Your purse is lighter than the toll explains. A wiry figure in river colours is counting your coins on a wall, one foot already over it. Three good blows before he is over, or he is gone until tomorrow.',
      note:'Land three blows that hurt before his fourth turn. If he gets away, you can try again.',fight:1,btns:[['closeModal','Not yet'],['j17Fight','Corner him',true]]};
    else m={img:heroURL('dist'),title:TPL.dist.title,text:'On the far bank a man with his hair tied up like a pineapple top is weighing your purse in one hand. Two of his crew lean on their knives. "You followed the money. Nobody follows the money." He smiles, and there are suddenly two of him. "Come and take it back, then."',fight:1,btns:[['closeModal','Not yet'],['j17Fight','Take it back',true]]};
  }
  V.modal=Object.assign({type:'j17evt',hero:id,step:st},m);render();}
function mJ17Evt(m){return box(esc(m.title),`<div class="mh j17evt"><div class="pbig leg"><img src="${m.img}" alt=""></div><div class="grow"><p class="story">${esc(m.text)}</p>${m.note?`<p class="note">${esc(m.note)}</p>`:''}${m.fight?'<p class="note">This is a tough fight. Rest first.</p>':''}</div></div>`,
  (m.btns||[]).map((b,i)=>`<button class="btn ${i===m.btns.length-1&&b[0]!=='closeModal'?'gold':''}" data-act="${b[0]}" ${b[2]===false?'disabled':''}>${esc(b[1])}</button>`).join(''),true);}
HOOK.before('actorTalk','legends17a','the two new legends\' quest scenes (registered last: answers before the older legend hooks)',function(a){if(a&&a.type==='legend'&&a.q&&L17.ids.includes(a.q.hero))return HOOK.stop(j17Talk(a.q));});
function j17Step(q,n,text,title){q.step=n;saveGame();V.modal={type:'story',title:title||q.title,text,btn:'Onward'};try{sfx('quest');}catch(e){}render();}
Object.assign(ACT,{
  j17Give(){const q=j17Q('jose');if(!q||(q.step||0)!==0||!((G.inv.potion||0)>0))return;G.inv.potion--;
    j17Step(q,1,'She takes the Potion as gently as an egg, carries it three steps, puts it down, and comes back to lean on your leg. You have been chosen. Somewhere behind you, a purse string is being chewed through.');
    try{const c=Math.min(G.gold||0,Math.max(5,Math.min(80,Math.round((G.gold||0)*.05))));G.gold-=c;q.purse=c;saveGame();}catch(e){}},
  j17TollPay(){const q=j17Q('dist');if(!q||(q.step||0)!==0)return;const c=j17Toll0();G.gold-=c;q.toll=(q.toll||0)+c;j17Step(q,1,`You pay ${c} gold. "Pleasure," says the toll keeper. Twenty paces on you notice that your purse is lighter than ${c} gold explains.`);},
  j17TollNo(){const q=j17Q('dist');if(!q||(q.step||0)!==0)return;const c=j17Toll0();G.gold-=c;q.toll=(q.toll||0)+c;j17Step(q,1,`"Suit yourself," says the toll keeper, and shakes your hand warmly. Twenty paces on you notice that you are ${c} gold lighter, and that it was a very warm handshake.`);},
  j17Fight(){const m=V.modal,q=m&&j17Q(m.hero);if(!q)return;V.modal=null;if(!startBattle({stage:q.stage,kind:'legend',hero:m.hero,step:q.step||0})){toast('Your party needs rest first.');render();}}});
// --- the fights ---
const L17_FOE={
  jose:{n:'Joseth Kynmar',art:'odin',el:['fire','lightning'],hp:1.1,atk:.8,def:1,mag:1.25,res:1.1,spd:1.05,sk:[['Blood Bolt','fire',1.3,'one','mag',[['burn',.3]]],['Pyre Chain','lightning',.85,'all','mag'],['Kennel Blessing','fire',0,'self','buff',[['might',1],['regen',1]]]]},
  dist:{n:'Dist',art:'gull',el:['water'],hp:1.05,atk:1.25,def:.95,mag:.8,res:.95,spd:1.4,sk:[['Cutwater','water',.55,'one','phys'],['Riptide Sweep','water',.85,'all','phys',[['slow',.4]]],['Pick Up the Pace','water',0,'self','buff',[['haste',1]]]]},
  cutter:{n:'Tidecrew Cutter',art:'gull',el:['water'],hp:1,atk:1.1,def:.9,mag:.7,res:.9,spd:1.25,sk:[['Quick Stab','water',1.1,'one','phys'],['Smoke Bomb','water',.3,'all','mag',[['blind',.4]]]]},
  runner:{n:'Tidecrew Runner',art:'gull',el:['water'],hp:1,atk:.9,def:.9,mag:.7,res:.9,spd:1.5,sk:[['Quick Stab','water',1,'one','phys'],['Smoke Bomb','water',.3,'all','mag',[['blind',.4]]]]}};
function j17Foes(spec){const s=spec.stage,lv=STAGE_LV[s][1]+1,st=spec.step||0,out=[],plain=e=>{e.maxShield=0;e.shield=0;e.phase=null;e.multi=1;return e;};
  if(spec.hero==='jose'){
    if(st===1){const e=makeEnemy(L17_MON.odin,Math.max(2,lv-2),{elite:true,name:'Odin',hpM:2.6+.2*s,powM:1.05});e.phase={at:.5,say:'Odin drops low and circles.',self:[['haste',1]]};out.push(e);}
    else if(st===2){const e=makeEnemy(L17_MON.zeus,Math.max(2,lv-2),{elite:true,name:'Zeus',hpM:2.6+.2*s,powM:1.05});e.phase={at:.5,say:'Zeus howls, and the sky splits.',self:[['might',1]]};out.push(e);}
    else{const e=makeEnemy(L17_FOE.jose,lv,{elite:true,name:'Joseth Kynmar',hpM:3.4+.3*s,powM:1.2+.05*s});e.heroArt='jose';e.multi=1;e.phase={at:.5,say:'Joseth bites his thumb. The pack closes in!',self:[['might',1],['haste',1]]};out.push(e);
      L17.dogs.forEach(k=>{const d=makeEnemy(L17_MON[k],Math.max(2,lv-3),{hpM:1.1});out.push(d);});}
  }else{
    if(st===1){const e=plain(makeEnemy(L17_FOE.runner,Math.max(2,lv-1),{elite:true,name:'Tidecrew Runner',hpM:9,powM:.75}));e.heroArt=j17Hid('dist_c1');e.S.eva=.18;e.j17run=1;out.push(e);}
    else{const e=makeEnemy(L17_FOE.dist,lv,{elite:true,name:'Dist',hpM:3.8+.3*s,powM:1.2+.05*s});e.heroArt='dist';e.phase={at:.5,say:'Dist laughs, and a second Dist steps out of the river.',self:[['haste',1],['might',1]]};out.push(e);
      [0,4].forEach((k,i)=>{const c=makeEnemy(L17_FOE.cutter,Math.max(2,lv-3),{hpM:1.2});c.heroArt=j17Hid('dist_c'+k);c.name+=' '+'AB'[i];out.push(c);});}
  }
  return out;}
HOOK.before('encounterFoes','legends17a','the fights of the two legend quests',function(spec){if(spec&&spec.kind==='legend'&&L17.ids.includes(spec.hero))return HOOK.stop(j17Foes(spec));});
// the Runner: three blows that hurt and he is cornered; his fourth turn and he is gone (no loss, the step stays)
HOOK.after('startBattle','legends17a','the Runner\'s rules',function(r){try{if(r!==false&&B){const e=B.en.find(x=>x.j17run);B.j17q=e?{e,n:0,hp:e.hp}:null;if(e)log('Corner him: three blows that hurt before his fourth turn.');}}catch(e){}});
HOOK.after('perform','legends17a','the Runner counts the blows',function(r,a){try{const Q=B&&B.j17q;if(!Q||!a||a.side!=='p'||B.over)return;const e=Q.e;if(e.hp<Q.hp){Q.hp=e.hp;Q.n++;if(e.hp>0){fx(e,Q.n+' of 3','stat');if(Q.n>=3){log(`${e.name} is cornered and throws the purse down.`);fx(e,'Cornered','stat bad');e.hp=0;fallen(e);}}}}catch(e){}});
HOOK.before('enemyTurn0','legends17a','the Runner gets away on his fourth turn',function(u){try{const Q=B&&B.j17q;if(Q&&u===Q.e&&u.hp>0&&(u.turns||0)>=3&&!B.over){B.over=true;log(`${u.name} is over the wall and gone. He will be back at the same corner.`);fx(u,'Gone','stat');render();later(()=>{try{finishBattle('fled');toast('He got away. Find him again and corner him faster.');}catch(e){}},PAUSE);return HOOK.stop();}}catch(e){}});
function j17Join(id,info){if(!G||G.roster[id])return;const q=j17Q(id);
  const c=newChar(id,Math.max(3,avgLv()),gearTier());G.roster[id]=c;if(G.party.length<6)G.party.push(id);
  G.quests.forEach(x=>{if(x.type==='legend'&&x.hero===id)x.state='claimed';});
  let back=0;if(q&&id==='dist'&&q.toll){back=q.toll;G.gold+=back;}
  META.legends=META.legends||{};META.legends[id]=1;try{saveMeta();codexSee(id,{rec:1,lv:c.lv});profileDirty();}catch(e){}saveGame();
  const line=id==='jose'?'"Good. They were right about you." He wipes his thumb on his coat. "Four of us, then. Five, on a bad day."':`"You still have your purse. Nobody still has their purse." He tosses it back${back?` (${back} gold)`:''}. "I am coming with you."`;
  if(B&&info)L17.join=id;// (win() and finishBattle() rebuild the six from the fight: he is added after them, see the hook below)
  if(info)info.legend=`${TPL[id].title} joins you. ${line}`;else V.modal={type:'story',title:TPL[id].title,text:`${line}\n\n${TPL[id].n} joins your roster${G.party.includes(id)?' and your six':''}.`,btn:'Welcome aboard'};
  try{sfx('level');}catch(e){}}
{const lw0=legendWin;legendWin=function(spec,info){if(!spec||!L17.ids.includes(spec.hero))return lw0.apply(this,arguments);const q=j17Q(spec.hero),st=spec.step||0;if(!q)return;info.legendKind=null;
  if(spec.hero==='jose'){
    if(st===1){q.step=2;const g=q.purse||0;if(g)G.gold+=g;info.legend=`Odin drops your purse at your feet${g?` (${g} gold, all of it)`:''} and falls in beside the golden one as if he had always been there. On the high ground, something starts to howl.`;}
    else if(st===2){q.step=3;info.legend='Zeus stops mid howl, sneezes, and trots down to sniff your hand. The storm loses interest. Three dogs now, and all three are looking past you, at the road.';}
    else if(st===3)j17Join('jose',info);}
  else{
    if(st===1){q.step=2;info.legend='The Runner throws down a purse that is not yours and points across the water with his chin. "He has yours. He always has yours."';}
    else if(st===2)j17Join('dist',info);}};}

HOOK.after('finishBattle','legends17a','a legend who joined at the end of his duel takes a free place in the six',function(){try{const id=L17.join;L17.join=null;if(id&&G&&G.roster[id]&&!G.party.includes(id)&&G.party.length<6){G.party.push(id);saveGame();}}catch(e){}});

// ---------- tests ----------
try{window.__L17={L17,MON:L17_MON,KIT:L17_KIT,V:J17V,slots:()=>j17Slots(),norm:()=>j17Norm(G),whistleInfo:a=>j17WhistleInfo(a),block:(a,s)=>j17Block(a,s),out:()=>j17Out(),cer:()=>j17CerOut(),toll:()=>j17Toll(),questRoll:s=>j17QuestRoll(s),quest:id=>j17Q(id),talk:q=>j17Talk(q),
  foes:spec=>j17Foes(spec),join:(id,info)=>j17Join(id,info),hid:id=>j17Hid(id),turn:u=>j17Turn(u),leave:(u,w)=>j17Leave(u,w),tick:()=>j17Tick(),bossEnt:a=>j17BossEnt(a),auto:a=>j17AutoJose(a),packHtml:e=>j17PackHtml(e),is:a=>j17Is(a),animPose:d=>j17AnimPose(d),land:()=>j17Land(),names:h=>j17Names(h),kit:id=>classSkills(TPL[id]),dogPick:(u,f)=>j17DogPick(u,f),get G(){return G;},get B(){return B;}};}catch(e){}
