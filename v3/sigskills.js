// ===== v0.4.0 4.3: every wayfarer has a signature skill, and same-class heroes of different elements play differently =====
// How it works (all data driven, nothing here changes combat rules):
//  1. SIG_NAMES gives each of the 88 regular wayfarers a hand-named, hand-described signature skill (id sg_<hero>).
//  2. The skill's mechanics come from SIG_T (two templates per class) and SIG_FOE / SIG_ALLY (one rider per element). Template = element order index % 2;
//     dual types get both elements' riders, so no two heroes of a class share a mechanic. Nature (trait) nudges cost, power, MP or crit a little.
//  3. SIG_SWAP: one generic skill per class takes the hero's element rider and an element adjective (Searing Rend, Frostbitten Bash...). The id stays the same.
// Legendaries and special wayfarers (src L or x) keep their own kits and are skipped. Tune numbers in SIG_T. Report: sigReport().
const SIG_EL=['fire','water','ice','shadow','wind','earth','light','lightning'];
const SIG_FOE={fire:[['burn',.7]],water:[['weaken',.6]],ice:[['slow',.7]],shadow:[['poison',.75]],wind:[['blind',.6]],earth:[['root',.55]],light:[['break',.6]],lightning:[['stun',.35]]};
const SIG_ALLY={fire:[['might',1]],water:[['regen',1]],ice:[['ward',1]],shadow:[['focus',1]],wind:[['haste',1]],earth:[['bulwark',1]],light:[['regen',1],['ward',1]],lightning:[['might',1],['haste',1]]};
const SIG_ADJ={fire:'Searing',water:'Tidal',ice:'Frostbitten',shadow:'Gloom',wind:'Gale',earth:'Stone',light:'Radiant',lightning:'Shocking'};
// rider: 'foe' puts the element's status on foes, 'ally' on allies
const SIG_T={
  warrior:[{k:'phys',t:'one',pw:2,mp:9,cost:1.1,rider:'foe'},{k:'phys',t:'all',pw:.85,mp:12,rider:'foe'}],
  knight:[{k:'status',t:'ally',mp:7,rider:'ally'},{k:'phys',t:'one',pw:1.7,mp:8,rider:'foe'}],
  mage:[{k:'mag',t:'one',pw:2.3,mp:12,cost:1.1,rider:'foe'},{k:'mag',t:'all',pw:1.1,mp:15,rider:'foe'}],
  healer:[{k:'heal',t:'ally',pw:1.9,mp:10,rider:'ally'},{k:'heal',t:'allyAll',pw:.8,mp:14,rider:'ally'}],
  thief:[{k:'phys',t:'one',pw:1.5,mp:5,cost:.7,rider:'foe'},{k:'status',t:'all',mp:9,rider:'foe'}],
  archer:[{k:'phys',t:'one',pw:1.9,mp:8,rider:'foe'},{k:'phys',t:'all',pw:.95,mp:10,rider:'foe'}],
  monk:[{k:'phys',t:'one',pw:.62,hits:3,mp:9,rider:'foe'},{k:'phys',t:'one',pw:2.3,mp:10,cost:1.1,rider:'foe'}],
  bard:[{k:'status',t:'allyAll',mp:11,rider:'ally'},{k:'status',t:'all',mp:10,rider:'foe'}]
};
// the generic skill that takes the element flavour, per class
const SIG_SWAP={warrior:'rend',knight:'bash',thief:'dart',archer:'barb',monk:'stunb',bard:'dis',healer:'renew',mage:'hex'};
const SIG_NAMES={
 brann:['Forgebreaker','Brings the hammer down like it owes him money.'],kael:['Thunderclap Rush','Charges in on a clap of thunder.'],cass:['Gale Cleaver','A cut that arrives with the wind behind it.'],rook:['Gravecut','A shadow blade for a fight he would rather skip.'],
 dagna:['Glacier Hammer','Cold iron, falling slowly and then all at once.'],borga:['Quarry Smash','A rock breaking swing from a former miner.'],kessa:['Stormtide Sweep','Brine and lightning on the same arc.'],solenne:['Dawnbrand','A blade lit from the inside.'],
 tarn:['Undertow','Drags the foe off balance and under.'],skadi:['Rimereaver','A reaving stroke that frosts the wound.'],gideon:['Vigil Blade','Strikes where the dark gathers.'],
 mira:['Tidecall','A wave called up from the shallows.'],fenn:['Hoarfrost Lance','A needle of winter.'],vael:['Umbral Collapse','The shadow folds in on itself.'],sorrel:['Cinder Bloom','Fire that opens like a flower.'],
 astra:['Eclipse Verse','Light and dark, line by line.'],ember:['Kindle Storm','Sparks breed sparks.'],zia:['Chain Spark','Lightning that cannot decide who it likes.'],cyrene:['Rime Gale','A whiteout in one breath.'],
 terrin:['Cairn Fall','The stones answer, slowly.'],aella:['Weather Turn','Changes the sky\'s mind.'],lucan:['Constellation','Stars sketched into a strike.'],
 sable:['Hush Step','A step no one hears. The poison does the talking.'],pip:['Dockside Dip','Quick hands, wet hands.'],kit:['Spark Pocket','Lifts a charge and returns it with interest.'],vex:['Second Wind Slash','Strikes, strikes again, and was never there.'],
 nyx:['Frost Fingers','Cold hands in every pocket.'],tamsin:['Tumble Strike','Rolls the ground out from under a foe.'],nettle:['Hotfoot','Leaves a burn and a rumor.'],lysa:['Undertow Snare','A loop of dark water.'],
 drift:['Breezeway','Slips between two heartbeats.'],sleet:['Cold Open','A first strike that sticks.'],glint:['Magpie Flash','Dazzles, then pockets the evidence.'],
 tess:['Courier\'s Shot','Delivers the first arrow on time.'],wren:['Stonefletch','An arrow fletched from fieldstone.'],frey:['Icicle Volley','A hundred small winters.'],sylva:['Bogbolt','Bolts that sink into the mire.'],
 ciro:['Sunspear Arrow','A morning in one shaft.'],ashwin:['Cinderstorm','A rain of embers.'],voss:['Skyfork','Lightning chooses the arrow.'],skerry:['Squall Line','Arrows on the crosswind.'],
 rill:['Weir Shot','Strikes like a net drawn tight.'],corvin:['Rookfall','From where the light does not reach.'],helia:['Daybreak Barrage','The sun, a heartbeat early.'],
 oren:['Gatekeeper\'s Stand','Holds the line, then the ground.'],halden:['Frostwall','A wall of cold.'],corwin:['Beacon Ward','A light on the road, kept lit.'],deryn:['Tidewall','Takes the wave and returns it.'],
 ignar:['Forge Vow','A promise sealed in heat.'],isak:['Brinefrost Guard','Salt and ice, both stubborn.'],lorcan:['Hallowed Bastion','Holy ground, held.'],maelis:['Ashen Oath','Embers under a black banner.'],
 thane:['Stormward','Calls the lightning to the shield.'],galen:['Pass Gale','Moves the door out of the way.'],vesper:['Last Watch','The tower still stands.'],
 lumen:['Lampglow','A stubborn little light.'],pomona:['Orchard Breeze','Fruit, flower and fresh air.'],alder:['Rootwell','Mending from below.'],marisol:['Spring Tide','A heal that rises.'],
 isolde:['Tideward Grace','Washes harm away.'],brigid:['Hearthflame','A warm room in the middle of a battle.'],verbena:['Greenlight Blessing','The garden at dusk.'],hollis:['Whisper Mend','A mend you were not told about.'],
 noelle:['Winter\'s Mercy','A cold hand and a steady one.'],ione:['Static Benediction','A blessing that crackles.'],ombra:['Gravetender\'s Rite','Apologies and medicine.'],
 gilda:['Tavern Anthem','Everyone knows the chorus.'],lark:['Morning Trill','The wind learns the tune.'],zephra:['Tailwind Ballad','A song with somewhere to be.'],brook:['Babbling Refrain','A tune that runs.'],
 dell:['Hollow Drum','Played on the earth itself.'],riff:['Overdrive','Turned up past safe.'],mourne:['Dirge of Dust','A song for later.'],cadence:['Wildfire Cadence','Tempo, tempo, tempo.'],
 prisma:['Spectrum Aria','Every color, one note.'],carol:['Frostfair Carol','Skates on a frozen pond.'],aria:['Cathedral Descant','The roof is gone. The echo stayed.'],
 taro:['Thunder Palm','A palm that rings.'],shen:['Still Frost','Stillness, sharpened.'],jun:['Kiln Fist','Fired in the monastery oven.'],gorm:['Lava Knuckle','Molten and stubborn.'],
 dorn:['Boulder Stance','Becomes the rock, then throws it.'],hana:['Petal Gale','A strike like falling blossom.'],kori:['Frozen Brook Strike','Cold water, steady.'],senna:['Sky Rite','Lightning, blessed.'],
 mizu:['Ripple Wave','Ripples first, then the wave.'],kage:['Silent Technique','Silence is a skill.'],kiyo:['Dawn Bow','He bows, then he hits.']
};
const SIG_NUDGE={swift:'cost',fleet:'cost',tempo:'cost',nimble:'cost',berserk:'pw',fierce:'pw',brave:'pw',arcane:'pwm',wise:'pwm',focused:'pwm',sturdy:'mp',hardy:'mp',bulwark:'mp',calm:'mp',mender:'heal',devout:'heal',keen:'crit',sharp:'crit',lucky:'crit'};
const SIG_ST_N={burn:'Burn',weaken:'Weaken',slow:'Slow',poison:'Poison',blind:'Blind',root:'Root',break:'Break',stun:'Stun',might:'Might',regen:'Regen',ward:'Ward',focus:'Focus',haste:'Haste',bulwark:'Bulwark'};
const SIG_FOE_V={burn:'burns',weaken:'weakens',slow:'slows',poison:'poisons',blind:'blinds',root:'roots',break:'breaks guard',stun:'may stun'};
const sigFoeTxt=fx=>fx.map(f=>SIG_FOE_V[f[0]]||f[0]).join(' and ');
function sigElIdx(t){return Math.max(0,SIG_EL.indexOf(t.el[0]));}
function sigBuild(t){
  const nm=SIG_NAMES[t.id];if(!nm||!SIG_T[t.cls])return null;
  const ei=sigElIdx(t),tp=SIG_T[t.cls][ei%2],dual=t.el.length>1,els=t.el;
  const rider=(tp.rider==='ally'?SIG_ALLY:SIG_FOE),fx=[];
  els.forEach(e=>(rider[e]||[]).forEach(f=>{if(!fx.some(x=>x[0]===f[0]))fx.push(f.slice());}));
  const s={id:'sg_'+t.id,n:nm[0],k:tp.k,t:tp.t,mp:tp.mp+(dual?2:0)+(tp.rider==='ally'&&fx.length>1?3:0),cost:tp.cost||1,hits:tp.hits||1,pw:tp.pw||0,el:null,sig:1,lv:6+((ei*2+(ei%2)*3+(dual?2:0)+(t.id.length%3))%9)};
  if(tp.k==='phys'||tp.k==='mag')s.el=dual?els.slice():els[0];
  // nature nudges
  const nu=SIG_NUDGE[t.trait];
  if(nu==='cost')s.cost=Math.max(.5,+(s.cost-.15).toFixed(2));if(nu==='pw'&&s.pw&&s.k==='phys')s.pw=+(s.pw*1.08).toFixed(2);if(nu==='pwm'&&s.pw&&(s.k==='mag'||s.k==='heal'))s.pw=+(s.pw*1.08).toFixed(2);
  if(nu==='mp')s.mp=Math.max(0,s.mp-1);if(nu==='heal'&&s.k==='heal')s.pw=+(s.pw*1.1).toFixed(2);if(nu==='crit'&&(s.k==='phys'||s.k==='mag'))s.crit=.1;
  if(fx.length)s.fx=fx;
  // description: the hand written line plus what it does, built from the numbers so it never drifts
  const who=s.t==='all'?'every foe':s.t==='one'?'one foe':s.t==='ally'?'one ally':'the front line',parts=[];
  const stTxt=tp.rider==='ally'?(fx||[]).map(f=>SIG_ST_N[f[0]]).join(' and '):sigFoeTxt(fx||[]);
  if(s.k==='phys'||s.k==='mag')parts.push((s.hits>1?`${s.hits} quick hits on ${who}`:`Hits ${who}`)+(stTxt?`; ${stTxt}.`:'.'));
  else if(s.k==='heal')parts.push(`Heals ${who}${stTxt?` and grants ${stTxt}`:''}.`);
  else if(tp.rider==='ally')parts.push(`Grants ${stTxt} to ${who}.`);
  else parts.push(`${stTxt?stTxt[0].toUpperCase()+stTxt.slice(1):'Hampers'} ${who}.`);
  s.d=nm[1]+' '+parts.join(' ');s.lv0=s.lv;return s;
}
// replace the class's flavour skill with an element version
function sigFlavour(L,t){
  const id=SIG_SWAP[t.cls],s=L.find(x=>x.id===id);if(!s)return;const e=t.el[0],adj=SIG_ADJ[e];if(!adj||s.sigFl)return;
  const ally=SIG_T[t.cls]&&SIG_T[t.cls][0].rider==='ally'&&(t.cls==='healer'),rd=(ally?SIG_ALLY:SIG_FOE)[e];if(!rd)return;
  s.sigFl=1;s.n=adj+' '+s.n;s.fx=rd.map(f=>f.slice());
  const txt=ally?rd.map(f=>SIG_ST_N[f[0]]).join(' and '):sigFoeTxt(rd);
  s.d=(s.k==='phys'||s.k==='mag'?`${EL[e]} tinged. `:'')+(ally?`Gives ${txt}.`:txt[0].toUpperCase()+txt.slice(1)+'.')+(s.t==='all'?' Hits every foe.':'');
}
{const cs1=classSkills;classSkills=function(t){const L=cs1.apply(this,arguments);
  if(!L||L._sg||!t||t.src==='L'||t.src==='x'||t.mon||!SIG_NAMES[t.id])return L;L._sg=1;
  try{sigFlavour(L,t);const s=sigBuild(t);if(s){const d=typeof dlFor==='function'?dlFor(t.cls,s):null;if(d)s.dl=d;L.push(s);L.sort((a,b)=>a.lv-b.lv||(a.lv0||a.lv)-(b.lv0||b.lv));}}catch(e){}
  return L;};}
// ---- report (used by the tests and the design notes) ----
function sigReport(){
  const ids=Object.keys(SIG_NAMES).filter(id=>TPL[id]),rows=ids.map(id=>{const s=classSkills(TPL[id]).find(x=>x.id==='sg_'+id);return {id,cls:TPL[id].cls,el:TPL[id].el.join('/'),s};});
  const names={},mech={},dups=[];
  rows.forEach(r=>{if(!r.s){dups.push(r.id+': missing');return;}
    (names[r.s.n]=names[r.s.n]||[]).push(r.id);
    const key=[r.cls,r.s.k,r.s.pw,r.s.t,r.s.hits,JSON.stringify(r.s.fx||[]),JSON.stringify(r.s.el)].join('|');(mech[key]=mech[key]||[]).push(r.id);});
  Object.keys(names).forEach(n=>{if(names[n].length>1)dups.push('name '+n+': '+names[n]);});Object.keys(mech).forEach(k=>{if(mech[k].length>1)dups.push('mechanics '+mech[k]);});
  // names must also not collide with any generic skill name
  const gen=new Set();Object.keys(TPL).forEach(id=>{if(SIG_NAMES[id])return;classSkills(TPL[id]).forEach(s=>gen.add(s.n));});
  rows.forEach(r=>{if(r.s&&gen.has(r.s.n))dups.push('collides with a generic skill: '+r.s.n);});
  return {count:rows.filter(r=>r.s).length,heroes:ids.length,dups};
}
