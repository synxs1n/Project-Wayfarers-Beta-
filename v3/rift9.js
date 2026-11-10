// ===== rift9.js (v0.12.13): the Echo Rift: Echoforge inside the Rift only, gates that show their state, Calamity gates apart =====
// The Echoforge (echo gear from Echo Shards) is no longer a Smithy tab in town: an Echoforge anvil stands in the middle of the Echo Rift. A beaten
// gate glows in its element colour (the whole arch, not a pip); a Calamity gate is a taller pointed arch in crimson and gold in the ring round the forge
// (v0.17.1), clearly another kind of door. No save fields.
const RIFT_FORGE_KEY='__forge';
{const ef0=efTabOn;efTabOn=function(){try{return !!(WS.m&&WS.m.sanctum)&&ef0.apply(this,arguments);}catch(e){return false;}};}
{const bs0=buildSanctum;buildSanctum=function(){const m=bs0.apply(this,arguments);try{
  m.npcs.push({x:RIFT_HALL.forge[0],y:RIFT_HALL.forge[1],hx:RIFT_HALL.forge[0],hy:RIFT_HALL.forge[1],name:'Echoforge'/* v0.17.1: back in the middle of the (larger) hall, ringed by the Calamity gates */,line:'',view:'front',face:'r',act:'portal',portal:1,forge:1,key:RIFT_FORGE_KEY,look:null});}catch(e){}return m;};}
// the anvil opens the Smithy's Echoforge page; the Warden's rest is wired by riftkeeper9.js (ACT.riftRest)
HOOK.before('vModal','rift9','Echoforge anvil in the Rift',function(m){if(m&&m.type==='portal'&&m.key===RIFT_FORGE_KEY){const mm={type:'smithy',tab:'echo',from:null};V.modal=mm;return HOOK.stop(mShop(mm));}});
// drawing: the anvil, the won glow, the Calamity arch
HOOK.wrap('drawPortal','rift9','anvil, won glow, Calamity arch',function(next,ctx,px,py,n,now){
  if(n.key===RIFT_FORGE_KEY)return;/* v0.16.x: the Echoforge landmark is drawn by echo11.js (forgeDraw, 2D and HD-2D) */
  const d=guardianDef(n.key),open=riftKeys().includes(n.key),won=!!d&&(((META.best||{})['Echo '+d.n])||{}).kills>0,col=(d&&typeof ELC!=='undefined'&&ELC[d.el[0]])||'#b48aff';
  if(n.cal){// a taller pointed arch, crimson with a gold edge, drawn under the gate
    const f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(px+x,py+y,w,h);};const e=open?'#ffd04a':'#6a5a30';
    f('#2a0608',-2,-9,20,27);for(let i=0;i<5;i++){f('#2a0608',6-i*2+1,-11-i*-1,2+i*4,1);}f(e,-2,-9,1,27);f(e,17,-9,1,27);f(e,-2,17,20,1);f(e,5,-13,6,1);f(e,3,-12,2,1);f(e,11,-12,2,1);f(e,1,-11,2,1);f(e,13,-11,2,1);f(e,-1,-10,2,1);f(e,15,-10,2,1);
    if(open){ctx.fillStyle='rgba(255,60,60,.10)';ctx.fillRect(px-2,py-9,20,27);}}
  next(ctx,px,py,n,now);
  if(won){const p=.6+.4*Math.sin(now/420+n.x);ctx.save();ctx.globalAlpha=.28*p;ctx.fillStyle=col;ctx.fillRect(px-1,py-4,18,21);ctx.globalAlpha=.9;ctx.fillStyle=col;ctx.fillRect(px+1,py-3,14,1);ctx.fillRect(px+1,py+14,14,1);ctx.fillRect(px+1,py-3,1,18);ctx.fillRect(px+14,py-3,1,18);ctx.restore();}});
// the gate card says it plainly
HOOK.xform('mPortal','rift9','the gate card says it is beaten',function(h,m){try{const d=guardianDef(m.key);const won=d&&(((META.best||{})['Echo '+d.n])||{}).kills>0;if(won)h=h.replace('<p class="note">','<p class="note up"><b>Beaten.</b> Its gate glows; fight it again for Essence and a chance at its Shard.</p><p class="note">');}catch(e){}return h;});
// ----- (was fixes11.js) Echo Rift rules. These must be registered after the rift9 glow/card hooks above: they wrap them in the journey view -----
// ----- v0.16.5: a won rift gate always lights -----
// Gates glow from META.best['Echo '+name].kills, which engine.js counts per unit base name. An Echo that changes form (phase 2) or dies
// as another unit left the record on the other name, so its gate stayed dark. A rift win now marks the gate's own Echo record too.
HOOK.after('win','rift9','rift gate kill record',function(){try{const sp=B&&B.spec;if(!sp||sp.kind!=='echoBoss'||!sp.rift||!sp.key)return;const d=guardianDef(sp.key);if(!d)return;const b=bestOf('Echo '+d.n);if(!(b.kills>0))b.kills=1;if(typeof saveMeta==='function')saveMeta();}catch(e){}});
// ----- v0.16.7: Echo Rift gates glow per journey -----
// drawPortal, rift9's glow, mPortal and rkBeaten all read META.best['Echo '+name].kills (account wide). The owner wants the hall to reflect
// this journey: a rift win records G.riftWon[key]=1, and while those functions run META.best is swapped for a view in which each Echo's
// kills come from G.riftWon. The account record is still kept for the Codex. Old journeys start dark until the gates are won again.
function riftView(){const v=Object.assign({},META.best||{});try{echoKeys().forEach(k=>{const d=guardianDef(k);if(!d)return;const w=!!(G&&G.riftWon&&G.riftWon[k]);v['Echo '+d.n]=Object.assign({},v['Echo '+d.n]||{},{kills:w?1:0});});}catch(e){}return v;}
function withRiftView(fn){const b0=META.best;try{META.best=riftView();return fn();}finally{META.best=b0;}}
HOOK.wrap('drawPortal','rift9','gate card reads the journey view of the Echo records',function(next,...a){return withRiftView(()=>next(...a));});
HOOK.wrap('mPortal','rift9','gate card reads the journey view of the Echo records',function(next,...a){return withRiftView(()=>next(...a));});
HOOK.after('win','rift9','rift win per journey',function(){try{const sp=B&&B.spec;if(!sp||sp.kind!=='echoBoss'||!sp.rift||!sp.key||!G)return;G.riftWon=G.riftWon||{};G.riftWon[sp.key]=1;}catch(e){}});
// ----- v0.17.8: everything in an Echo Rift fight is level 55 -----
// The Echo itself is made at the rift level (rk10: 55), but anything it summons mid fight was made at its own level minus three
// (battle4 summon) or at the stage level. In a rift fight every foe made while the battle runs takes the rift level.
HOOK.wrap('makeEnemy','rift9','rift boss level',function(next,mo,lv,o){try{const sp=B&&B.spec;if(sp&&sp.kind==='echoBoss'&&sp.rift&&sp.lv>0)lv=sp.lv;}catch(e){}return next(mo,lv,o);});
// ----- v0.17.8: an Echo fights alone -----
// Some Echoes summon help mid fight (battle4 summon gimmick, boss skills). In the Echo Rift only the Echo itself stands: any foe without
// the echo flag that joins the fight is removed on the next turn-order pass.
HOOK.before('turnOrder','rift9','an Echo fights alone',function(){try{const sp=B&&B.spec;if(sp&&sp.kind==='echoBoss'&&sp.rift&&B.en&&B.en.some(e=>!e.echo))B.en=B.en.filter(e=>e.echo);}catch(e){}});
// the map legend marker for the anvil
HOOK.after('mapMarks','rift9','the anvil legend marker',function(o,m){try{if(m&&m.sanctum)o.forEach(q=>{const n=m.npcs.find(x=>x.portal&&x.x===q.x&&x.y===q.y);if(n&&n.forge)q.k='svc';});}catch(e){}});
