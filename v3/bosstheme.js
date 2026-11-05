// Beta v0.3.5 6.1: every stage of a journey takes its look from the Scourge (or Calamity) waiting at the end of it, from the very first town.
// The boss is never named. A theme is a palette lean (towards .mix), roof colours, a ground motif, ambient particles, a faint tint, a music
// shift, and a few hints in the signs and townsfolk. Realm layouts (meadow, coast ...) stay; the boss decides the mood on top of them.
const BTHEME={
 thornwarden:{label:'Overgrown',mix:'#2f5a2a',k:.34,roof:['#4a6a2a','#6a4a2a','#3a5a3a','#7a5a2a'],dec:['#a8486a','#a0d060','#e0c060','#5a2a4a'],motif:'thorn',amb:'spores',tint:'rgba(40,90,40,.06)',mus:-2,
  omen:'Brambles crept over the east fence overnight, and nobody can say who planted them.',npc:['The hedges grow back thicker every time they are cut.','My roses took to biting. I am not joking.']},
 drake:{label:'Storm-tide',mix:'#3a5a78',k:.34,roof:['#3a4a6a','#2a5a7a','#4a5a8a','#2a3a5a'],dec:['#9ad0e8','#ffe870','#ffffff','#5a8ac8'],motif:'tide',amb:'rain',tint:'rgba(40,70,110,.07)',mus:1,
  omen:'The tide has been running in circles for days, and the gulls will not land.',npc:['Thunder, but no clouds. Every evening, same hour.','The weathervane spins one way, then the other, then both.']},
 cinderking:{label:'Ember-forged',mix:'#7a3a1e',k:.36,roof:['#7a2a1a','#5a2a1a','#8a4a1a','#4a3a3a'],dec:['#ff7a2a','#ffd04a','#ff5a3a','#c0a090'],motif:'ember',amb:'embers',tint:'rgba(130,50,20,.07)',mus:-3,
  omen:'Every well runs warm now, and the ground hums at night, low and slow.',npc:['Bread bakes itself on the windowsills these days.','Dig down a spade and the soil is warm as a hearth.']},
 hoarwyrm:{label:'Rime-coiled',mix:'#a8c8e8',k:.40,roof:['#5a7aa8','#7a9ac8','#4a6a98','#8aa8d8'],dec:['#ffffff','#bfe6ff','#8fdcf0','#d8e8ff'],motif:'frost',amb:'snow',tint:'rgba(150,200,255,.08)',mus:2,
  omen:'Frost on the windows in midsummer, spiralled like something coiled.',npc:['Ice forms in the horse troughs even at noon.','The old folk say the cold comes from a long way down.']},
 ysolde:{label:'Static-charged',mix:'#d8c860',k:.30,roof:['#c8a83a','#e0d070','#8a8ac8','#f0e8a0'],dec:['#fff6a0','#ffffff','#c8e0ff','#ffd04a'],motif:'bolt',amb:'sparks',tint:'rgba(255,240,150,.06)',mus:3,
  omen:'Hair stands on end all through town before the weather turns, and the weather turns often.',npc:['Every doorknob shocks me now. Every one.','The hens lay in sparks lately. Do not ask.']},
 bonecolossus:{label:'Ossuary-pale',mix:'#b8b098',k:.38,roof:['#8a8070','#6a6458','#a89e88','#585048'],dec:['#f0ead8','#c8c0a8','#8a8478','#ffffff'],motif:'bone',amb:'dust',tint:'rgba(70,60,45,.08)',mus:-4,
  omen:'The gravediggers say the ground gives up more than they put in. Bigger bones, too.',npc:['My dog keeps bringing home bones. Large ones.','They stopped burying folk on the east side. The ground is full.']},
 queenmantis:{label:'Hive-green',mix:'#a8b830',k:.34,roof:['#7a9a2a','#c8a82a','#5a8a3a','#a8782a'],dec:['#f6e06a','#a8d040','#ffffff','#e0a030'],motif:'comb',amb:'motes',tint:'rgba(150,170,40,.06)',mus:1,
  omen:'Something is humming in the tall grass. Not bees. Bigger.',npc:['Clicking sounds at dusk. Hundreds of little legs, I swear.','Our honey comes out amber and slow, and tastes like pennies.']},
 gloomcap:{label:'Spore-lit',mix:'#6a3a78',k:.36,roof:['#6a3a78','#3a6a5a','#7a4a8a','#2a4a4a'],dec:['#c070e0','#70e0b0','#e0b0ff','#40a080'],motif:'spore',amb:'spores',tint:'rgba(80,40,110,.08)',mus:-1,
  omen:'Pale caps pop up in the cellars overnight, glowing a little. Eat none of them.',npc:['The damp has a smell now. Sweet, and wrong.','Little lights move between the trees after dark.']},
 ironsentinel:{label:'Rust and gear',mix:'#8a8a96',k:.34,roof:['#6a6a7a','#8a5a3a','#5a5a6a','#7a4a3a'],dec:['#c0c0cc','#d09050','#808090','#ffd04a'],motif:'gear',amb:'flecks',tint:'rgba(120,120,140,.06)',mus:0,
  omen:'Something under the hill ticks, steady as a clock, and the ticking has got louder.',npc:['Nobody can set a clock right anymore. They all drift toward the hill.','I found a bolt the size of my fist by the road.']},
 siren:{label:'Pearl and tide',mix:'#78c8c8',k:.34,roof:['#3a9aa8','#e0c8b8','#5ab8b0','#c8a0b8'],dec:['#fff0f0','#a0f0f0','#f0b0c8','#ffffff'],motif:'pearl',amb:'bubbles',tint:'rgba(120,220,230,.07)',mus:2,
  omen:'Sailors swear they hear singing from under the pier. Three have stepped off it.',npc:['A pretty tune, that. Where is it coming from? Where is everyone going?','Wax in your ears, friend. Cheap, and it works.']},
 ashwyvern:{label:'Ash-fall',mix:'#807068',k:.38,roof:['#6a5a52','#9a4a2a','#4a423e','#8a6a4a'],dec:['#c0b8b0','#ff8a3a','#808078','#e0d8d0'],motif:'ash',amb:'ash',tint:'rgba(110,90,80,.08)',mus:-1,
  omen:'Grey flakes fall like snow on warm days, and the washing never stays clean.',npc:['Wings blot the sun on hot afternoons. Too wide for any bird.','Scorched fence posts, and no fire anyone saw.']},
 frostlich:{label:'Grave-cold',mix:'#5a6a98',k:.38,roof:['#3a4a78','#5a4a88','#2a3a5a','#4a5a8a'],dec:['#a8c0f0','#d8e8ff','#8070c0','#ffffff'],motif:'grave',amb:'wisps',tint:'rgba(40,50,100,.10)',mus:-2,
  omen:'The cold here has no wind behind it. It just sits, and watches, and settles on your shoulders.',npc:['Our dead keep their graves tidier than we do. Odd, that.','Candles will not stay lit past the old chapel.']},
 dimmer:{label:'Eclipse-dim',mix:'#2a2a4a',k:.42,roof:['#3a3a5a','#5a4a6a','#2a2a48','#4a4a68'],dec:['#a0a0d0','#e0d890','#605a90','#ffffff'],motif:'eclipse',amb:'dim',tint:'rgba(10,10,40,.14)',mus:-3,
  omen:'The lamps burn lower every evening. We trim the wicks and it makes no difference.',npc:['Colours seem paler than they were last year.','I could swear the sun is a little smaller each day.']},
 nidhra:{label:'Black-ember',mix:'#3a1a28',k:.40,roof:['#4a1a2a','#2a1a2a','#6a2a1a','#3a2a3a'],dec:['#ff5a3a','#ffb04a','#6a2a4a','#c8a0b0'],motif:'scale',amb:'embers',tint:'rgba(70,10,20,.12)',mus:-4,
  omen:'Sunset comes early here, the colour of an ember in a dark fire.',npc:['Something very large flew over last night. It blocked the stars for a minute.','Smoke with no fire behind it. Lately every dusk.']},
 hollowking:{label:'Hollow crown',mix:'#4a2a70',k:.40,roof:['#5a3a8a','#3a2a5a','#6a4a98','#2a1a4a'],dec:['#b080ff','#f6e7a8','#5fc9a0','#ff8ad0'],motif:'crown',amb:'motes',tint:'rgba(70,30,110,.10)',mus:-1,
  omen:'People talk about an empty throne out there. Nobody agrees which direction it is.',npc:['I dreamed I wore a crown made of nothing. It was heavy.','There is a gap in the stars shaped like a seat.']},
 seraph:{label:'Gilded ash',mix:'#e8d8b8',k:.36,roof:['#d8c8a0','#c8a860','#f0e8d0','#a89870'],dec:['#fff6d0','#ffffff','#ffd878','#f0b090'],motif:'feather',amb:'feathers',tint:'rgba(255,230,180,.08)',mus:2,
  omen:'White ash falls on the shrines in the shape of feathers. It is warm to the touch.',npc:['The bells ring by themselves at dawn. Nobody pulls the ropes.','Everything glows a little at the edges lately. It is beautiful, and it frightens me.']}
};
const lerpHex=(a,b,t)=>{const A=hx(a),B=hx(b);return rh(A.map((v,i)=>v+(B[i]-v)*t));};
const lerpArr=(arr,b,t)=>arr.map(c=>lerpHex(c,b,t));
function bossAtStage(s){try{return s<4?G.run.bosses[s]:G.run.final;}catch(e){return null;}}
function themeVariant(realm,key){
  const id=realm+'~'+key;if(THEME[id])return id;
  const B=BTHEME[key],T=THEME[realm],D=DTHEME[realm];if(!B)return realm;
  const V=Object.assign({},T);['g','tg','p','cb','cl'].forEach(k=>{if(T[k])V[k]=lerpArr(T[k],B.mix,B.k*(k==='cb'?.5:k==='cl'?.6:1));});
  V.w=T.w.slice();V.w[0]=lerpHex(T.w[0],B.mix,B.k*.5);V.w[3]=lerpHex(T.w[3],B.mix,B.k*.5);
  V.roof=B.roof.slice();V.dec=B.dec.slice();V.lip=lerpHex(T.lip,B.mix,B.k*.7);
  THEME[id]=V;
  const DV=Object.assign({},D);DV.f=lerpArr(D.f,B.mix,B.k*.55);DV.w=lerpArr(D.w,B.mix,B.k*.5);DV.top=lerpHex(D.top,B.mix,B.k*.35);DTHEME[id]=DV;
  return id;
}
const THM=m=>THEME[m.thv||m.theme];
const DTH=m=>DTHEME[m.thv||m.theme];
function applyBossTheme(m){
  m.thv=m.theme;m.boss_th=null;
  try{if(!G||!G.run||typeof m.s!=='number'||m.archive)return;
    const key=bossAtStage(m.s),B=BTHEME[key];if(!B)return;
    m.thv=themeVariant(m.theme,key);m.motif=B.motif;m.amb=B.amb;m.btint=B.tint;m.bkey=key;
    // hints: signs get an omen on the gate sign, townsfolk get a line each; no names, no mechanics
    if(m.kind==='town'){let i=0;(m.npcs||[]).forEach(n=>{if(n.name==='Gate guard'||i>=B.npc.length)return;if(!n.themed){n.line+=' '+B.npc[i];n.themed=1;i++;}});
      Object.keys(m.signs||{}).forEach(k=>{if(!m.signs[k].includes(B.omen))m.signs[k]+=' '+B.omen;});}
    else if(m.kind==='field'&&m.part!==2){Object.keys(m.signs||{}).forEach(k=>{if(!m.signs[k].includes(B.omen))m.signs[k]+=' '+B.omen;});}
  }catch(e){}
}
{const g0=getMap;getMap=function(id){const had=MAPS[id],m=g0.apply(this,arguments);if(m&&!had)applyBossTheme(m);return m;};}
// ground motifs, painted over grass and floor tiles: a few marks per tile, seeded so they never shimmer
const MOTIF={
 thorn:(f,R)=>{if(R()<.2){const x=2+Math.floor(R()*11),y=3+Math.floor(R()*9);f('#264420',x,y,1,4);f('#264420',x+1,y+1,1,1);f('#264420',x-1,y+2,1,1);if(R()<.4)f('#c05070',x,y-1,1,1);}},
 tide:(f,R)=>{if(R()<.18){const x=Math.floor(R()*10),y=2+Math.floor(R()*11);f('#9ad0e8',x,y,5,1);f('#9ad0e8',x+1,y+1,1,1);if(R()<.3)f('#ffe870',x+3,y-1,1,1);}},
 ember:(f,R)=>{if(R()<.2){const x=1+Math.floor(R()*13),y=1+Math.floor(R()*13);f('#2a1814',x,y,3,1);f('#2a1814',x+1,y+1,1,2);f('#ff8a3a',x+1,y,1,1);}},
 frost:(f,R)=>{if(R()<.22){const x=1+Math.floor(R()*12),y=1+Math.floor(R()*12);f('#ffffff',x,y,4,1);f('#ffffff',x+2,y-1,1,3);f('#bfe6ff',x+1,y+1,1,1);}},
 bolt:(f,R)=>{if(R()<.16){const x=3+Math.floor(R()*9),y=1+Math.floor(R()*9);f('#ffe870',x,y,1,2);f('#ffe870',x+1,y+2,1,2);f('#ffe870',x,y+4,1,2);}},
 bone:(f,R)=>{if(R()<.2){const x=1+Math.floor(R()*11),y=2+Math.floor(R()*11);f('#f0ead8',x,y,4,1);f('#f0ead8',x-1,y-1,1,3);f('#f0ead8',x+4,y-1,1,3);}},
 comb:(f,R)=>{if(R()<.16){const x=2+Math.floor(R()*10),y=2+Math.floor(R()*10);f('#d8b030',x,y,3,1);f('#d8b030',x-1,y+1,1,2);f('#d8b030',x+3,y+1,1,2);f('#d8b030',x,y+3,3,1);}},
 spore:(f,R)=>{if(R()<.22){const x=1+Math.floor(R()*13),y=1+Math.floor(R()*13);f(R()<.5?'#c070e0':'#70e0b0',x,y,1,1);f('#e8d0ff',x+1,y-1,1,1);}},
 gear:(f,R)=>{if(R()<.15){const x=2+Math.floor(R()*10),y=2+Math.floor(R()*10);f('#606070',x,y,3,3);f('#a0a0b0',x+1,y+1,1,1);f('#606070',x-1,y+1,1,1);f('#606070',x+3,y+1,1,1);}},
 pearl:(f,R)=>{if(R()<.18){const x=1+Math.floor(R()*13),y=1+Math.floor(R()*13);f('#fff0f0',x,y,2,2);f('#ffffff',x,y,1,1);if(R()<.4)f('#f0b0c8',x+3,y+2,2,1);}},
 ash:(f,R)=>{if(R()<.26){const x=Math.floor(R()*14),y=Math.floor(R()*14);f('#b0a8a2',x,y,2,1);f('#7a726c',x+1,y+1,1,1);}},
 grave:(f,R)=>{if(R()<.1){const x=4+Math.floor(R()*7),y=3+Math.floor(R()*8);f('#5a6a98',x,y,1,5);f('#5a6a98',x-1,y+1,3,1);}},
 eclipse:(f,R)=>{if(R()<.12){const x=3+Math.floor(R()*9),y=3+Math.floor(R()*9);f('#14143a',x,y,4,4);f('#c8c8f0',x+1,y-1,2,1);f('#c8c8f0',x-1,y+1,1,2);}},
 scale:(f,R)=>{if(R()<.2){const x=1+Math.floor(R()*12),y=1+Math.floor(R()*12);f('#2a0e18',x,y,3,1);f('#2a0e18',x+1,y+1,3,1);f('#8a2a2a',x,y+2,1,1);}},
 crown:(f,R)=>{if(R()<.12){const x=3+Math.floor(R()*9),y=3+Math.floor(R()*9);f('#b080ff',x,y,1,1);f('#b080ff',x+2,y,1,1);f('#b080ff',x+4,y,1,1);f('#b080ff',x,y+1,5,1);}},
 feather:(f,R)=>{if(R()<.18){const x=2+Math.floor(R()*11),y=2+Math.floor(R()*11);f('#fff6d0',x,y,1,4);f('#ffffff',x+1,y+1,1,2);f('#ffd878',x-1,y+2,1,1);}}
};
function motifPaint(f,R,key){const p=MOTIF[key];if(p)p(f,R);}
// ambient layer: lightweight particles per theme, drawn above the map (towns, fields and dungeons)
function themeFX(ctx,m,vw,vh,now){
  const a=m.amb;if(!a)return;
  if(m.btint){ctx.fillStyle=m.btint;ctx.fillRect(0,0,vw,vh);}
  const dot=(x,y,c,w,h)=>{ctx.fillStyle=c;ctx.fillRect(Math.floor(x),Math.floor(y),w||1,h||1);};
  const n=a==='dim'?0:a==='rain'?40:16;
  for(let i=0;i<n;i++){const t=now/1000,sx0=(i*97+13)%vw,sy0=(i*61+7)%vh;
    if(a==='embers'){dot((sx0+Math.sin(t*1.3+i)*6+vw)%vw,(sy0-t*22*(1+i%3*.3)%vh+vh*2)%vh,i%3?'#ff8a3a':'#ffd04a');}
    else if(a==='spores'){dot((sx0+Math.sin(t*.8+i)*8+vw)%vw,(sy0-t*8+vh*3)%vh,i%2?'#c8f0a0':'#d8a0f0');}
    else if(a==='sparks'){if(Math.floor(t*3+i)%5===0)dot((sx0+t*10)%vw,sy0,'#fff6a0',2,1);}
    else if(a==='rain'){dot((sx0+t*28)%vw,(sy0+t*120*(1+i%3*.2))%vh,'rgba(190,220,255,.55)',1,3);}
    else if(a==='snow'){dot((sx0+Math.sin(t+i)*5+vw)%vw,(sy0+t*18*(1+i%3*.4))%vh,'#ffffff');}
    else if(a==='dust'){dot((sx0+t*14*(1+i%2)+vw)%vw,(sy0+Math.sin(t*.6+i)*6+vh)%vh,'rgba(220,210,180,.5)');}
    else if(a==='motes'){dot((sx0+Math.sin(t*.9+i)*10+vw)%vw,(sy0+Math.cos(t*.7+i)*8+vh)%vh,i%2?'rgba(255,240,150,.8)':'rgba(180,255,180,.7)');}
    else if(a==='flecks'){dot((sx0+t*12+vw)%vw,(sy0+Math.sin(t+i)*3+vh)%vh,i%3?'#c0c0cc':'#d09050');}
    else if(a==='bubbles'){dot((sx0+Math.sin(t*1.2+i)*4+vw)%vw,(sy0-t*14*(1+i%2*.4)+vh*3)%vh,'rgba(220,255,255,.7)',2,2);}
    else if(a==='ash'){dot((sx0+t*9+vw)%vw,(sy0+t*12*(1+i%3*.3))%vh,'rgba(190,182,176,.7)',1,1);}
    else if(a==='wisps'){dot((sx0+Math.sin(t*.5+i)*14+vw)%vw,(sy0-t*6+vh*3)%vh,'rgba(170,190,255,.55)',2,1);}
    else if(a==='feathers'){dot((sx0+Math.sin(t*.7+i)*12+vw)%vw,(sy0+t*10*(1+i%3*.3))%vh,i%2?'rgba(255,250,230,.9)':'rgba(255,225,150,.85)',2,1);}
  }
  if(a==='dim'){const g=ctx.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*.25,vw/2,vh/2,Math.max(vw,vh)*.7);g.addColorStop(0,'rgba(0,0,20,0)');g.addColorStop(1,'rgba(0,0,30,.32)');ctx.fillStyle=g;ctx.fillRect(0,0,vw,vh);}
}
function bossMusicOff(){try{const s=WS.m&&typeof WS.m.s==='number'?WS.m.s:B&&B.stage;const k=bossAtStage(s);return (BTHEME[k]||{}).mus||0;}catch(e){return 0;}}
function bossMusicKey(){try{const s=WS.m&&typeof WS.m.s==='number'?WS.m.s:B&&B.stage;return bossAtStage(s)||'';}catch(e){return '';}}
