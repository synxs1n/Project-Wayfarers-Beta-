// ===== fix47.js (v0.22.47): the Solar Eclipse sky, guild missions unlock as they are completed, tier colours =====
// 1 Solar Eclipse (asked: "replace the floating shadow visuals for the eclipse weather event with a more appropriate graphical effect").
//   world3.js drew a black disc with a corona at a fixed spot of the canvas. In battle that was a dark ball hanging in front of the scenery,
//   beside the backdrop's own sun; on the map the weather layer is tiled (worldrt.js wfxTiled), so the disc repeated across the ground like
//   drifting shadows. An eclipse is a change of LIGHT, so now it is drawn as one: a deep dusk over everything, a breathing band of corona
//   gold falling from the top of the sky in battle, a breathing rim of the same gold around the view on the map, and slow motes of gold light rising. Nothing
//   is drawn at a fixed spot of the map, so tiling shows no seams or repeats.
// 2 Accept all and the guild lists: a guild has two missions out at a time and posts a new one when one is handed in (see below).
// 3 Tier colours: Heroic is ember orange; Echoforged is the violet of the Echoes (see items.js).
const F47={off:false,motes:34,slots:2};
function f47Eclipse(ctx,W,H,now,battle){const t=now/1000;ctx.save();
  ctx.fillStyle='rgba(16,10,44,.36)';ctx.fillRect(0,0,W,H);// the dusk
  if(battle){const br=.5+.5*Math.sin(t*.9),g=ctx.createRadialGradient(W*.5,-H*.2,H*.05,W*.5,-H*.2,H*(1.0+.06*br));
    g.addColorStop(0,`rgba(255,226,160,${(.34+.08*br).toFixed(3)})`);g.addColorStop(.45,`rgba(255,190,110,${(.13+.04*br).toFixed(3)})`);g.addColorStop(1,'rgba(255,180,100,0)');
    ctx.globalCompositeOperation='lighter';ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
    const v=ctx.createRadialGradient(W*.5,H*.45,Math.min(W,H)*.35,W*.5,H*.45,Math.max(W,H)*.75);v.addColorStop(0,'rgba(6,4,22,0)');v.addColorStop(1,'rgba(6,4,22,.42)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);}
  // motes of corona light, rising; each one wraps inside the canvas, so a tiled layer repeats cleanly
  const n=F47.motes;for(let i=0;i<n;i++){const sp=.035+((i*37)%11)*.004,p=((t*sp+i*.137)%1),x=((i*71+Math.sin(t*.6+i*1.7)*6)%W+W)%W,y=H-p*H,tw=.5+.5*Math.sin(t*2.2+i*2.1),a=Math.sin(p*Math.PI)*(.35+.5*tw);
    ctx.globalAlpha=Math.max(0,Math.min(1,a));ctx.fillStyle=i%5===0?'#fff3cc':'#ffcf7a';const s=i%7===0?2:1;ctx.fillRect(Math.floor(x),Math.floor(y),s,s);}
  ctx.restore();}
{const wf0=weatherFX;weatherFX=function(ctx,w,W,H,now,battle){if(w==='eclipse'&&!F47.off){try{f47Eclipse(ctx,W,H,now||0,!!battle);return;}catch(e){F47.err=String(e&&e.message||e);}}return wf0.apply(this,arguments);};}
// weather7.js draws the rare skies through the function it kept at load (W7.old), tiled over the map: give it the new eclipse too
try{if(typeof W7!=='undefined'&&typeof W7.old==='function'){const o0=W7.old;W7.old=function(ctx,w,W,H,now,battle){if(w==='eclipse'&&!F47.off){try{f47Eclipse(ctx,W,H,now||0,!!battle);return;}catch(e){F47.err=String(e&&e.message||e);}}return o0.apply(this,arguments);};}}catch(e){}
// on the map the corona shows as a breathing rim of gold light around the view (it belongs to the view, not to the scrolling layer)
try{if(typeof w7Legacy==='function'){const l0=w7Legacy;w7Legacy=function(ctx,w,k,V,now){const r=l0.apply(this,arguments);try{if(w==='eclipse'&&!F47.off&&V&&V.air&&V.mode!=='bt'&&typeof surgeGlow==='function')surgeGlow(ctx,'255,196,110',V.W,V.H,(.16+(Math.sin(now/1000*.9)+1)/2*.12)*k);}catch(e){}return r;};}}catch(e){}
// ---------- 2 Accept all takes what is on show, and nothing new slides in behind it ----------
// A guild listed the missions already taken plus two new ones (factions.js facMissionList). So the moment the two on show were accepted, two
// more took their place: after Accept all there were open missions again, as if the press had missed them (often the tier 2 ones), and
// pressing on took the guild's whole list. The owner's rule: new missions unlock as missions are completed. A guild now has F47.slots (2)
// missions out at a time, taken ones included: a new one is posted when one is handed in. Accept all accepts every notice on show.
function f47Open(L){try{const f=facInit(),acc=L.filter(m=>f.acc[m.id]!=null),rest=L.filter(m=>f.acc[m.id]==null);return acc.concat(rest.slice(0,Math.max(0,F47.slots-acc.length)));}catch(e){return L;}}
{const ml0=facMissionList;facMissionList=function(id){const L=ml0.apply(this,arguments);return F47.off?L:f47Open(L);};}
try{window.__F47=F47;}catch(e){}
