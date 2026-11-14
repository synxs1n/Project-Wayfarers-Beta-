// ===== bonds9.js (v0.12.0): more bond pairs, more scenes, bond techs, the Bonds screen =====
// Fifteen new bonded pairs (each with a joint tech, a campfire talk and a second talk), three new kinds of scene (a camp talk and an inn
// talk at bond level 2, an after-the-battle talk at level 3 once a Scourge or the Calamity falls with both in the Vanguard), and a
// fuller Bonds screen: every pair, its level, what the next level unlocks, every scene with a Watch button once unlocked.
// Bond levels stay 1 to 3 (BOND_LV). New optional save field G.ctxTalks {key+ctx: 1} (a context scene offered once).
const BONDS9=[
 {a:'pomona',b:'dorn',tech:{n:'Rooted Breath',k:'phys',pw:1.5,t:'one',el:['wind','earth'],fx:[['root',.8]],d:'A gust, then a fist like a falling stone. Roots the foe.'},
  talk:[["Pomona","You breathe like a bellows, Dorn."],["Dorn","A bellows feeds the fire."],["Pomona","A bellows also puts people to sleep. Slower. In through the nose."]],
  talk2:[["Dorn","I slept the whole night. First time since the mines."],["Pomona","Slower breathing. I told you."],["Dorn","You also put a stone on my chest."],["Pomona","That was for me."]],
  talkCamp:[["Dorn","The ground here is good. Flat, dry, no roots."],["Pomona","You check every camp like that."],["Dorn","Someone has to carry the ones who do not."]],
  talkInn:[["Pomona","A real bed. Do not sleep on the floor again."],["Dorn","The floor does not creak."],["Pomona","Dorn."],["Dorn","...The bed, then."]],
  talkBoss:[["Dorn","It is down."],["Pomona","You are bleeding."],["Dorn","It is down, Pomona."],["Pomona","Sit. Now."]]},
 {a:'zia',b:'thane',tech:{n:'Thunderwall',k:'mag',pw:1.6,t:'all',el:['lightning','lightning'],fx:[['stun',.3]],d:'A shield raised into a storm: every foe takes the arc.'},
  talk:[["Zia","Your shield hums when I cast near it."],["Thane","It is iron. It does what iron does."],["Zia","Hold it up. No, higher. Now watch."]],
  talk2:[["Thane","The wall held the whole charge."],["Zia","I told you it would."],["Thane","You told me it might."],["Zia","Same thing, when I say it."]],
  talkCamp:[["Thane","Keep the fire small. Lightning finds tall things."],["Zia","Lightning finds me, Thane. I am the tall thing."]],
  talkInn:[["Zia","You left your shield by the door again."],["Thane","So the storm knows where to knock."]],
  talkBoss:[["Zia","Did you feel that? The whole room went white."],["Thane","I felt my teeth."],["Zia","Worth it."]]},
 {a:'tamsin',b:'borga',tech:{n:'Quarry Trap',k:'phys',pw:1.5,t:'one',el:['earth','earth'],fx:[['root',.9]],d:'A tripwire and a boulder. The foe is held fast.'},
  talk:[["Borga","You dig like a miner."],["Tamsin","I dig like a thief. Miners dig down. I dig under."],["Borga","Same mud on your knees."]],
  talk2:[["Tamsin","How did you lift that?"],["Borga","Legs, not back. Twenty years of ore."],["Tamsin","Teach me and I will teach you to open the paymaster's box."],["Borga","...Legs. Watch."]],
  talkCamp:[["Tamsin","I set three wires round the camp."],["Borga","I walked into two."],["Tamsin","Then they work."]],
  talkInn:[["Borga","The innkeeper counted the spoons when you came in."],["Tamsin","Good. She will count them again when I leave, and feel proud."]],
  talkBoss:[["Borga","Held it right where you said."],["Tamsin","You held it. I just pointed."]]},
 {a:'ashwin',b:'brigid',tech:{n:'Kindling Hymn',k:'phys',pw:1.3,t:'all',el:['fire','fire'],fx:[['burn',.7]],d:'A hymn that sets the arrows alight. Every foe likely Burns.'},
  talk:[["Brigid","Your arrows smell of smoke before you loose them."],["Ashwin","I keep the tips in the coals."],["Brigid","Sing when you draw. The fire listens."]],
  talk2:[["Ashwin","I sang. Badly."],["Brigid","The fire did not mind."],["Ashwin","The archer behind me minded."]],
  talkCamp:[["Brigid","Let me tend the fire tonight."],["Ashwin","You will make it a sermon."],["Brigid","A short one."]],
  talkInn:[["Ashwin","They have a hearth the size of a cart."],["Brigid","Then we are home."]],
  talkBoss:[["Brigid","The ash is still falling."],["Ashwin","Let it. We earned the quiet."]]},
 {a:'brook',b:'rill',tech:{n:'Tide Chorus',k:'mag',pw:1.2,t:'all',el:['water','water'],fx:[['slow',.6]],d:'A rising song and a rain of arrows. Every foe may Slow.'},
  talk:[["Rill","You hum the river song. The one from the weir."],["Brook","You know it?"],["Rill","My mother sang it over the nets."]],
  talk2:[["Brook","Sing the second verse with me."],["Rill","I only know the first."],["Brook","Then we will make the second."]],
  talkCamp:[["Rill","Water near. I can hear it."],["Brook","You can always hear it."],["Rill","It is always there."]],
  talkInn:[["Brook","The inn has a boat on the wall."],["Rill","It has not seen water in years."],["Brook","Neither have you. Bath. Now."]],
  talkBoss:[["Brook","It went under like a stone."],["Rill","Everything does, in the end."]]},
 {a:'skadi',b:'carol',tech:{n:'Winter Carol',k:'phys',pw:1.6,t:'one',el:['ice','ice'],fx:[['slow',.8],['bleed',.4]],d:'A song of the long night and a frozen blade.'},
  talk:[["Carol","You never sing along."],["Skadi","I know the words. That is enough."],["Carol","Say them, then."],["Skadi","...Later."]],
  talk2:[["Skadi","The long night comes, and the snow lies deep..."],["Carol","You know the whole song."],["Skadi","My mother. Every winter."]],
  talkCamp:[["Carol","Sit closer to the fire."],["Skadi","Cold does not bother me."],["Carol","It bothers me watching you."]],
  talkInn:[["Skadi","A warm room. I do not know what to do with it."],["Carol","Sleep in it."]],
  talkBoss:[["Carol","You were humming during the fight."],["Skadi","I was not."],["Carol","The chorus. Twice."]]},
 {a:'gideon',b:'glint',tech:{n:'Daybreak Feint',k:'phys',pw:1.1,hits:3,t:'one',el:['light','light'],fx:[['blind',.6]],d:'A flash of the blade, a flash of the mirror, three cuts. Likely Blinds.'},
  talk:[["Glint","Your armour is very shiny."],["Gideon","I polish it every night."],["Glint","May I borrow it? Just the breastplate. For a trick."],["Gideon","No."]],
  talk2:[["Gideon","You used my breastplate."],["Glint","The light caught it. The guard looked away. Nobody got hurt."],["Gideon","Ask next time."],["Glint","You would say no."],["Gideon","I would say yes."]],
  talkCamp:[["Glint","I polished it for you."],["Gideon","You hid the rations under it."],["Glint","Both can be true."]],
  talkInn:[["Gideon","Pay the innkeeper. Properly."],["Glint","I did."],["Gideon","With your own coin."],["Glint","...Fine."]],
  talkBoss:[["Glint","Did you see it flinch from the light?"],["Gideon","I saw it fall. That is what I watch."]]},
 {a:'ombra',b:'kage',tech:{n:'Dusk Vigil',k:'phys',pw:1.5,t:'one',el:['shadow','shadow'],fx:[['weaken',.7]],d:'A strike from the dark while a prayer holds the light back.'},
  talk:[["Kage","You pray in the dark."],["Ombra","The dark is where prayers are needed."],["Kage","Then pray for me. I live there."]],
  talk2:[["Ombra","You were there when I turned. In the dark."],["Kage","I am always there."],["Ombra","Then I will stop looking over my shoulder."]],
  talkCamp:[["Kage","I will take the watch."],["Ombra","You took it last night."],["Kage","I do not sleep much."],["Ombra","Then I will sit with you."]],
  talkInn:[["Ombra","The room has a window. Leave it open."],["Kage","For the air?"],["Ombra","For you."]],
  talkBoss:[["Kage","It never saw me."],["Ombra","Nothing does. That is the point of you."]]},
 {a:'aella',b:'drift',tech:{n:'Zephyr Step',k:'mag',pw:1.3,t:'rand',hits:3,el:['wind','wind'],fx:[['blind',.3]],d:'Three gusts from nowhere, three cuts from nowhere.'},
  talk:[["Drift","You change the wind."],["Aella","A little."],["Drift","Change it when I run. I want to see how fast I can go."]],
  talk2:[["Aella","You went so fast I lost you."],["Drift","So did I. I was in the next field."],["Aella","Again?"],["Drift","Again."]],
  talkCamp:[["Drift","The smoke leans east."],["Aella","I leaned it. Keeps it out of your eyes."]],
  talkInn:[["Aella","You cannot sit still even in a chair."],["Drift","Chairs are for people who have stopped."]],
  talkBoss:[["Drift","I was behind it before it turned."],["Aella","You were behind it before I finished the spell."]]},
 {a:'deryn',b:'mizu',tech:{n:'Undertow Guard',k:'phys',pw:1.4,t:'one',el:['water','water'],fx:[['weaken',.6]],d:'A shield like a wave and a fist like the pull beneath it.'},
  talk:[["Mizu","Your shield moves like water."],["Deryn","It was made at the tidewall. Water is all it knows."],["Mizu","Then we will get along."]],
  talk2:[["Deryn","Show me the stance again. The one with the heel."],["Mizu","It is not a stance. It is standing."],["Deryn","Show me standing, then."]],
  talkCamp:[["Mizu","Still water tonight."],["Deryn","Still water hides the deepest holes."],["Mizu","Then I will go first."]],
  talkInn:[["Deryn","Hot water. In a tub. I had forgotten."],["Mizu","Do not fall asleep in it."],["Deryn","Too late."]],
  talkBoss:[["Deryn","It pushed. We did not move."],["Mizu","Water never does. It just waits."]]},
 {a:'ignar',b:'nettle',tech:{n:'Hotfoot Charge',k:'phys',pw:1.5,t:'one',el:['fire','fire'],fx:[['burn',.8]],d:'A lance through the flame she lit. Likely Burns.'},
  talk:[["Nettle","Your boots are smoking."],["Ignar","Forge boots. They are supposed to."],["Nettle","Mine are smoking too and they are not supposed to."]],
  talk2:[["Ignar","You lit the grass before I charged."],["Nettle","You said go through the fire."],["Ignar","I said go through the foe."],["Nettle","Same direction."]],
  talkCamp:[["Nettle","I lit the fire."],["Ignar","With what?"],["Nettle","Do not ask."]],
  talkInn:[["Ignar","No fires indoors."],["Nettle","Not even a small one?"],["Ignar","Nettle."]],
  talkBoss:[["Nettle","Still burning."],["Ignar","Let the rain have it."]]},
 {a:'terrin',b:'dell',tech:{n:'Cairn Song',k:'mag',pw:1.2,t:'all',el:['earth','earth'],fx:[['break',.5]],d:'The stones answer a slow drum. Every foe may Break.'},
  talk:[["Dell","Your stones fall in time with my drum."],["Terrin","Stones do not keep time."],["Dell","Then I keep theirs."]],
  talk2:[["Terrin","Play the slow one tonight."],["Dell","The cairn song?"],["Terrin","My people built those. I never knew it had a song."]],
  talkCamp:[["Dell","Every stone round the fire is a drum if you listen."],["Terrin","Then the whole realm is listening."]],
  talkInn:[["Terrin","The floor is stone. Good."],["Dell","You judge every inn by the floor."],["Terrin","Floors do not lie."]],
  talkBoss:[["Dell","It cracked on the fourth beat."],["Terrin","I felt it in the ground before I saw it."]]},
 {a:'noelle',b:'sleet',tech:{n:'Frost Hush',k:'phys',pw:1.3,t:'one',el:['ice','ice'],fx:[['slow',.9]],d:'A blessing of silence and a cold blade. The foe Slows.'},
  talk:[["Sleet","You do not startle."],["Noelle","I grew up in a monastery under snow. Nothing moves there."],["Sleet","I do."],["Noelle","Not loudly."]],
  talk2:[["Noelle","You left a flower by my bed."],["Sleet","It was frozen. I thought you would like it."],["Noelle","I do."]],
  talkCamp:[["Sleet","Quiet night."],["Noelle","You made it quiet. I saw the tracks."]],
  talkInn:[["Noelle","Sleep in the bed, not on the roof."],["Sleet","The roof has a view."],["Noelle","Of what?"],["Sleet","Anyone coming."]],
  talkBoss:[["Sleet","Cold open. It never warmed up."],["Noelle","Rest. Both of you."]]},
 {a:'helia',b:'aria',tech:{n:'Dawn Chorus',k:'phys',pw:1.2,t:'all',el:['light','light'],fx:[['blind',.5]],d:'A chord at sunrise and arrows of morning. Every foe may Blind.'},
  talk:[["Aria","You draw before the sun is up."],["Helia","It is up. You just cannot see it yet."],["Aria","Then sing it up for me."]],
  talk2:[["Helia","Your song came before my arrow and the arrow still landed first."],["Aria","Light is fast."],["Helia","So are you."]],
  talkCamp:[["Aria","Wake me at dawn. I want to sing it in."],["Helia","You say that every night."],["Aria","And you wake me every morning."]],
  talkInn:[["Helia","East window. Good."],["Aria","You picked the room for the window."],["Helia","What else is a room for?"]],
  talkBoss:[["Aria","It could not look at us."],["Helia","Good. Then it never saw the end coming."]]},
 {a:'voss',b:'riff',tech:{n:'Amp Volley',k:'phys',pw:1.3,t:'all',el:['lightning','lightning'],fx:[['stun',.25]],d:'A chord that cracks and arrows that crack with it. Foes may Stun.'},
  talk:[["Riff","Your bowstring sings a G."],["Voss","It sings a bowstring."],["Riff","A G. Tune it up a hair and we are in key."]],
  talk2:[["Voss","It was in key."],["Riff","Told you."],["Voss","The arrow went farther."],["Riff","Did not tell you that. Nice."]],
  talkCamp:[["Riff","Lightning in the hills. Count with me."],["Voss","One, two, th..."],["Riff","Close."]],
  talkInn:[["Voss","No playing after midnight."],["Riff","The innkeeper said it was fine."],["Voss","I am saying it is not."]],
  talkBoss:[["Riff","Did you hear the crack?"],["Voss","I loosed on it."],["Riff","Perfect timing."]]}];
// after-the-battle lines for the original pairs
const BONDS9_BOSS={'brann+gilda':[["Gilda","That one goes in the song."],["Brann","Leave out the part where I fell."],["Gilda","That is the best part."]],'halden+oren':[["Oren","It is down."],["Halden","Your feet held."],["Oren","Heels in."]],
 'tess+wren':[["Tess","I hit it first."],["Wren","You hit it second. The crow was first."],["Tess","The crow does not count."]],'pip+sable':[["Pip","It had a purse!"],["Sable","Had."]],'corwin+lumen':[["Lumen","Nobody fell."],["Corwin","Nobody fell. Say it again."],["Lumen","Nobody fell."]],
 'kael+taro':[["Taro","Did you see the second hit?"],["Kael","I saw the sixth."]],'fenn+frey':[["Frey","Cold work."],["Fenn","The best kind."]],'marisol+mira':[["Mira","Breathe."],["Marisol","I am breathing."],["Mira","Slower."]],'jun+shen':[["Shen","Your form slipped at the end."],["Jun","It won."],["Shen","Both are true."]],
 'rook+vael':[["Vael","It is quiet."],["Rook","It is always quiet after."],["Vael","I meant you."]],'lark+zephra':[["Zephra","One more verse."],["Lark","It is dead, Zephra."],["Zephra","The verse is for us."]],'alder+sylva':[["Sylva","The hawk is back."],["Alder","Then it is over."]],
 'cass+kit':[["Kit","I was not scared."],["Cass","I was."],["Kit","...Me too."]],'ember+sorrel':[["Sorrel","Did we burn the floor?"],["Ember","We burned the ceiling."]],'brann+dagna':[["Dagna","Slow iron."],["Brann","Then all at once."]],'isolde+lumen':[["Isolde","Still light."],["Lumen","Always."]],
 'nyx+sable':[["Nyx","Pockets?"],["Sable","Empty. It was a monster, Nyx."],["Nyx","Monsters have pockets."]],'astra+vael':[["Vael","Half light."],["Astra","Half dark. Whole win."]],'ciro+jun':[["Jun","The sun came up in the middle of the fight."],["Ciro","That was me."]]};
(function(){BONDS9.forEach(b=>{if(!BONDS.some(x=>bondKey(x.a,x.b)===bondKey(b.a,b.b)))BONDS.push(b);});const BB={};Object.keys(BONDS9_BOSS).forEach(k=>{const [x,y]=k.split('+');BB[bondKey(x,y)]=BONDS9_BOSS[k];});BONDS.forEach(b=>{BONDMAP[bondKey(b.a,b.b)]=b;const bb=BB[bondKey(b.a,b.b)];if(bb&&!b.talkBoss)b.talkBoss=bb;});})();
// ----- scenes: the camp and inn talks at level 2, the after-the-battle talk at level 3 -----
{const bs0=bondScenes;bondScenes=function(b){const S=bs0.apply(this,arguments);if(b.talkCamp)S.push({lv:2,ctx:'camp',lines:b.talkCamp,n:'Camp talk'});if(b.talkInn)S.push({lv:2,ctx:'inn',lines:b.talkInn,n:'Inn talk'});if(b.talkBoss)S.push({lv:3,ctx:'boss',lines:b.talkBoss,n:'After the battle'});return S;};}
const ctxArg=(k,ctx)=>k+':'+(ctx==='boss'?3:2)+':'+ctx;
function ctxOffer(ctx,pairs){if(!G||G.daily)return;G.ctxTalks=G.ctxTalks||{};G.talks=G.talks||[];let n=0;
  pairs.forEach(b=>{const k=bondKey(b.a,b.b),sc=bondScenes(b).find(s=>s.ctx===ctx);if(!sc||bondLv(b.a,b.b)<sc.lv||G.ctxTalks[k+'|'+ctx])return;G.ctxTalks[k+'|'+ctx]=1;G.talks.push({k,lv:sc.lv,ctx});n++;});return n;}
const pairsIn=ids=>BONDS.filter(b=>ids.includes(b.a)&&ids.includes(b.b));
// readyTalks and the talk argument know the context scenes
{const rt0=readyTalks;readyTalks=function(){const all=G.talks||[],ctx=all.filter(t=>t.ctx);G.talks=all.filter(t=>!t.ctx);let out;try{out=rt0.apply(this,arguments);}finally{G.talks=all;}
  ctx.forEach(t=>{const b=BONDMAP[t.k];if(!b||!G.roster[b.a]||!G.roster[b.b])return;const a=ctxArg(t.k,t.ctx);if(!out.some(o=>o.arg===a))out.push({arg:a,b});});return out;};}
{const bt0=ACT.bondTalk;ACT.bondTalk=function(a){const P=String(a).split(':');if(P.length<3)return bt0.apply(this,arguments);const [k,,ctx]=P,b=BONDMAP[k];if(!b||!G.roster[b.a]||!G.roster[b.b])return;
  const sc=bondScenes(b).find(s=>s.ctx===ctx);if(!sc||bondLv(b.a,b.b)<sc.lv)return;G.talks=(G.talks||[]).filter(t=>!(t.k===k&&t.ctx===ctx));G.ctxTalks=G.ctxTalks||{};G.ctxTalks[k+'|'+ctx]=1;saveGame();V.modal={type:'talk',lines:sc.lines,i:0,from:V.modal};render();};}
// offers: camp (campMake), the inn (a paid rest), a Scourge or Calamity down with both in the Vanguard
if(typeof campMake==='function'){const cm0=campMake;campMake=function(){const r=cm0.apply(this,arguments);try{if(r&&typeof r!=='string')ctxOffer('camp',pairsIn(G.party));}catch(e){}return r;};}
{const r0=ACT.rest;ACT.rest=function(){const g0=G&&G.gold;const r=r0.apply(this,arguments);try{if(G&&G.gold<g0){const n=ctxOffer('inn',pairsIn(G.party));if(n&&typeof readyTalks==='function'&&!(V.modal&&V.modal.type==='innTalk')){const T=readyTalks();if(T.length){V.modal={type:'innTalk',T};render();}}}}catch(e){}return r;};}
HOOK.after('win','bonds9','after-the-battle talks',function(){try{const sp=B&&B.spec;if(!sp||G.daily)return;if(!(sp.kind==='boss'||sp.boss||(B.en||[]).some(e=>e.boss&&!e.mini)))return;
  const ids=(B.front||[]).filter(c=>c&&c.hp>0&&!c.isComp).map(c=>c.id);const n=ctxOffer('boss',pairsIn(ids));if(n){const info=V.modal&&V.modal.info;if(info){info.notes=info.notes||[];info.notes.push(`${n} bond talk${n>1?'s are':' is'} ready: open Bonds from the Party tab.`);}}}catch(e){}});
// ----- the Bonds screen: every pair, level, next unlock, scenes -----
function bondNext(b){const k=bondKey(b.a,b.b),p=(G.bonds||{})[k]||0,lv=bondLv(b.a,b.b);
  if(lv>=3)return 'Bond maxed: every talk and the joint tech are yours.';const at=BOND_LV[lv],what=lv===0?'the campfire talk':lv===1?`the joint tech ${b.tech.n}${b.talkCamp||b.talkInn?', camp and inn talks':''}`:`a stronger ${b.tech.n}${b.talk2?', the second talk':''}${b.talkBoss?', an after-the-battle talk':''}`;
  return `Level ${lv+1} at ${at} wins together (${p}/${at}): ${what}.`;}
function vBondsAll(){const L=BONDS.map(b=>{const k=bondKey(b.a,b.b),here=!!(G.roster[b.a]&&G.roster[b.b]);return {b,k,here,lv:here?bondLv(b.a,b.b):0,pend:(G.talks||[]).filter(t=>t.k===k).length};})
    .sort((x,y)=>(y.here-x.here)||(y.pend-x.pend)||(y.lv-x.lv)||TPL[x.b.a].n.localeCompare(TPL[y.b.a].n));
  const waiting=L.filter(o=>!o.here).length;// only bonds you can work on are listed (both heroes recruited)
  const rows=L.filter(o=>o.here).map(o=>{const b=o.b,S=bondScenes(b);if(!o.here){const one=G.roster[b.a]||G.roster[b.b];return `<div class="row bondrow lock"><span class="bdports">${port(b.a,'sm noail')}${port(b.b,'sm noail')}</span><div class="grow"><b>${esc(TPL[b.a].n)} and ${esc(TPL[b.b].n)}</b><small>${one?`Recruit ${esc(TPL[G.roster[b.a]?b.b:b.a].n)} to open this bond.`:'Both are still out there.'}</small><small class="nums">Tech: ${esc(b.tech.n)}</small></div></div>`;}
    const sc=S.map(s=>{const open=o.lv>=s.lv,pend=(G.talks||[]).some(t=>t.k===o.k&&(s.ctx?t.ctx===s.ctx:!t.ctx&&(t.lv===s.lv||(t.lv>=3&&s.lv===1&&!b.talk2))));const arg=s.ctx?ctxArg(o.k,s.ctx):o.k+':'+s.lv;
      return `<span class="bsc ${open?'on':''} ${pend?'new':''}">${open?`<button class="btn sm ${pend?'gold':''}" data-act="bondTalk" data-arg="${arg}">${esc(s.n)}${pend?' ●':''}</button>`:`<small title="Bond level ${s.lv}">${esc(s.n)} · Lv ${s.lv}</small>`}</span>`;}).join('');
    return `<div class="row bondrow bdall"><span class="bdports">${port(b.a,'sm noail')}${port(b.b,'sm noail')}</span><div class="grow"><b>${esc(TPL[b.a].n)} and ${esc(TPL[b.b].n)}</b> <small class="nums">Level ${o.lv}</small><small>${esc(bondNext(b))}</small>${(()=>{try{const g=bondGoal(o.k);return g&&!g.done?`<small class="bgoal nums">${esc(g.text)}</small>${bar(g.p,g.at,'var(--gold)')}`:'';}catch(e){return '';}})()}<small class="nums">Tech: ${esc(b.tech.n)}: ${esc(b.tech.d)}</small><div class="bscs">${sc}</div></div></div>`;}).join('');
  return `<p class="note">${BOND_HOW} Camp and inn talks open at level 2, the after-the-battle talk at level 3 (after a Scourge or the Calamity falls with both in the Vanguard).</p><div class="rows">${rows}</div>${waiting?`<p class="note">${waiting} more bond${waiting>1?'s':''} wait${waiting>1?'':'s'} with wayfarers you have not met.</p>`:''}`;}
{const vb0=vBonds;vBonds=function(){try{if(typeof pcUnlocked==='function'&&!pcUnlocked('bonds'))return vb0.apply(this,arguments);/* pacing.js: the lock note until bonds open */return vBondsAll();}catch(e){return vb0.apply(this,arguments);}};}
{const st=document.createElement('style');st.textContent='.bscs{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px}.bsc small{opacity:.6}.bondrow.lock{opacity:.7}';document.head.appendChild(st);}
