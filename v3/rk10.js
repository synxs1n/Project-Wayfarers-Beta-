// ===== rk10.js (v0.15.1): the Echo Warden IS the Riftkeeper =====
// The owner: "echo warden IS the rift keeper, he should be called that (Riftkeeper) in both forms, then when you beat everyone he transforms
// and becomes someone you have to fight. Have him disappear when the last gate unlocks, when you enter you have a cut scene where he takes on
// the powers of the rifts and becomes the Riftkeeper before battle starts. He returns after to where he was before with his new look but you
// can rematch him at any time by using that gate." Also: "Echo rift bosses set to level 55."
// - The hall's keeper is named Riftkeeper in both forms (rest popup, gate card, dialogue).
// - Rift Echo fights (riftSpec) are level 55.
// - Once every Echo is beaten and he has not yet been fought (META.riftkeeper unset), the keeper leaves his spot; the gate is lit; entering
//   it plays a short scene (the keeper takes on the rifts' power) and the fight starts. After the first win he stands at his spot again with
//   a new look (rift-lit robe, key staff) and still offers the free rest; the gate stays open for a rematch (the usual card and Challenge).
// No save fields: everything keys off META.riftkeeper and rkUnlocked().
const RK10={name:'Riftkeeper',look2:null};
{const rs0=riftSpec;riftSpec=function(k){const s=rs0.apply(this,arguments);try{s.lv=55;}catch(e){}return s;};}
function rk10Vanished(){try{return rkUnlocked()&&!META.riftkeeper;}catch(e){return false;}}
// the keeper's new look after the fight: a hooded robe woven with rift light and a key staff (villagerLook fields the rig understands)
function rk10Look2(){if(RK10.look2)return RK10.look2;try{const L=Object.assign({},villagerLook('Echo Warden'));L.hat='hood';L.wpn='staff_sun';L.back=['cape'];L.cc='#4a2a8a';L.hc='#e8e0ff';L.face=(L.face||[]).filter(f=>f!=='eyepatch');RK10.look2=L;}catch(e){RK10.look2=villagerLook('Echo Warden');}return RK10.look2;}
{const bs0=buildSanctum;buildSanctum=function(){const m=bs0.apply(this,arguments);try{const n=m.npcs.find(q=>q.name==='Echo Warden');if(n){n.name=RK10.name;n.isRK=1;n.hx=n.x;n.hy=n.y;
  n.line='Every Scourge and Calamity you broke is still ringing in here. Stand before a gate and press A to challenge its Echo. I keep these doors; one day they may keep me. This hall is safe, and the way out is the south door.';}}catch(e){}return m;};}
// he is gone from his spot while the challenge waits; back, in his new look, once beaten
HOOK.before('worldDraw','rk10','the keeper leaves and returns',function(){try{const m=WS.m;if(!m||!m.sanctum)return;const n=m.npcs.find(q=>q.isRK);if(!n)return;const gone=rk10Vanished();
  if(gone&&!n.hidden){n.hidden=1;n._x=n.x;n._y=n.y;n.x=-99;n.y=-99;}else if(!gone&&n.hidden){n.hidden=0;n.x=n.hx;n.y=n.hy;}
  if(!gone&&META.riftkeeper&&!n.look2){n.look2=1;n.look=rk10Look2();n.line='"You broke every door and then you broke me. The Rift still calls me its keeper; I answer to you now. Rest here whenever you like, and the middle gate stands open if you want to try me again."';}}catch(e){}});
// the rest popup and the gate card carry the name
HOOK.xform('vModal','rk10','Riftkeeper naming',function(h,m){try{if(m&&m.type==='rkrest'){h=h.replace('<h2>Echo Warden</h2>','<h2>Riftkeeper</h2>');if(META.riftkeeper)h=h.replace('"The Rift never tires, but you do.','"Beaten or not, I keep this hall. The Rift never tires, but you do.');}
  if(m&&m.type==='portal'&&m.key===RK_KEY){if(rk10Vanished())h=h.replace('The gate stands open. The keeper of every door waits behind it.','The keeper is gone from his post. The gate stands open, and the Rift is pouring through it.');
    if(META.riftkeeper)h=h.replace('<button class="btn gold" data-act="rkFight"','<button class="btn gold" data-act="rkFight" title="A rematch; the keeper waits behind the gate again"').replace('Challenge</button>','Rematch</button>');}}catch(e){}return h;});
{const in0=interact;interact=function(){try{const m=WS.m;if(V.screen==='world'&&!V.modal&&!WS.lock&&!WS.dlg&&!WS.mv&&m&&m.sanctum&&G&&!G.daily){const [fx,fy]=facing(),n=m.npcs.find(q=>q.x===fx&&q.y===fy&&q.isRK);
  if(n){n.name='Echo Warden';try{return in0.apply(this,arguments);}finally{n.name=RK10.name;}}}}catch(e){}return in0.apply(this,arguments);};}// riftkeeper9 keys the rest popup on the old name
// the first challenge: a short scene, then the fight
{const rf0=ACT.rkFight;ACT.rkFight=function(){try{if(rkUnlocked()&&!META.riftkeeper&&G&&!G.daily&&!V._rkScene){V.modal=null;haltInput();V._rkScene=1;
  const L=[['Riftkeeper','You opened every door. Do you know what waits when nothing is left behind them?'],['Riftkeeper','The Rift does not end. It wants a keeper. It has had one for a very long time.'],[null,'Light pours out of twenty gates at once and gathers in the figure standing in the middle of the hall. His lantern burns every colour in turn.'],['Riftkeeper','I kept the doors. Now the doors keep me. Come, Riftwalker: one last Echo, and it is mine.']];
  const step=i=>{if(i>=L.length){V._rkScene=0;return rf0.apply(this,arguments);}say(L[i][0],L[i][1],()=>step(i+1));};step(0);render();return;}}catch(e){V._rkScene=0;}return rf0.apply(this,arguments);};}
