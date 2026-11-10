// ===== rift9.js (v0.12.13): the Echo Rift: Echoforge inside the Rift only, gates that show their state, Calamity gates apart =====
// The Echoforge (echo gear from Echo Shards) is no longer a Smithy tab in town: an Echoforge anvil stands in the Sanctum hall. A beaten
// gate glows in its element colour (the whole arch, not a pip); a Calamity gate is a taller pointed arch in crimson and gold on the south
// row, clearly another kind of door. No save fields.
const RIFT_FORGE_KEY='__forge';
{const ef0=efTabOn;efTabOn=function(){try{return !!(WS.m&&WS.m.sanctum)&&ef0.apply(this,arguments);}catch(e){return false;}};}
{const bs0=buildSanctum;buildSanctum=function(){const m=bs0.apply(this,arguments);try{
  m.npcs.push({x:19,y:7,hx:19,hy:7,name:'Echoforge'/* v0.17.0: off the centre line, the bigger forge stood between the hall and the Riftkeeper's gate at (13,4) */,line:'',view:'front',face:'r',act:'portal',portal:1,forge:1,key:RIFT_FORGE_KEY,look:null});}catch(e){}return m;};}
// the anvil opens the Smithy's Echoforge page; the Warden's rest is wired by riftkeeper9.js (ACT.riftRest)
HOOK.before('vModal','rift9','Echoforge anvil in the Rift',function(m){if(m&&m.type==='portal'&&m.key===RIFT_FORGE_KEY){const mm={type:'smithy',tab:'echo',from:null};V.modal=mm;return HOOK.stop(mShop(mm));}});
// drawing: the anvil, the won glow, the Calamity arch
{const dp0=drawPortal;drawPortal=function(ctx,px,py,n,now){
  if(n.key===RIFT_FORGE_KEY)return;/* v0.16.x: the Echoforge landmark is drawn by echo11.js (forgeDraw, 2D and HD-2D) */
  const d=guardianDef(n.key),open=riftKeys().includes(n.key),won=!!d&&(((META.best||{})['Echo '+d.n])||{}).kills>0,col=(d&&typeof ELC!=='undefined'&&ELC[d.el[0]])||'#b48aff';
  if(n.cal){// a taller pointed arch, crimson with a gold edge, drawn under the gate
    const f=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(px+x,py+y,w,h);};const e=open?'#ffd04a':'#6a5a30';
    f('#2a0608',-2,-9,20,27);for(let i=0;i<5;i++){f('#2a0608',6-i*2+1,-11-i*-1,2+i*4,1);}f(e,-2,-9,1,27);f(e,17,-9,1,27);f(e,-2,17,20,1);f(e,5,-13,6,1);f(e,3,-12,2,1);f(e,11,-12,2,1);f(e,1,-11,2,1);f(e,13,-11,2,1);f(e,-1,-10,2,1);f(e,15,-10,2,1);
    if(open){ctx.fillStyle='rgba(255,60,60,.10)';ctx.fillRect(px-2,py-9,20,27);}}
  dp0.apply(this,arguments);
  if(won){const p=.6+.4*Math.sin(now/420+n.x);ctx.save();ctx.globalAlpha=.28*p;ctx.fillStyle=col;ctx.fillRect(px-1,py-4,18,21);ctx.globalAlpha=.9;ctx.fillStyle=col;ctx.fillRect(px+1,py-3,14,1);ctx.fillRect(px+1,py+14,14,1);ctx.fillRect(px+1,py-3,1,18);ctx.fillRect(px+14,py-3,1,18);ctx.restore();}};}
// the gate card says it plainly
{const mp0=mPortal;mPortal=function(m){let h=mp0.apply(this,arguments);try{const d=guardianDef(m.key);const won=d&&(((META.best||{})['Echo '+d.n])||{}).kills>0;if(won)h=h.replace('<p class="note">','<p class="note up"><b>Beaten.</b> Its gate glows; fight it again for Essence and a chance at its Shard.</p><p class="note">');}catch(e){}return h;};}
// the map legend marker for the anvil
{const mm0=mapMarks;mapMarks=function(m){const o=mm0.apply(this,arguments);try{if(m&&m.sanctum)o.forEach(q=>{const n=m.npcs.find(x=>x.portal&&x.x===q.x&&x.y===q.y);if(n&&n.forge)q.k='svc';});}catch(e){}return o;};}
