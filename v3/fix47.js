// ===== fix47.js (v0.22.47): the Solar Eclipse sky, Accept all takes every notice, tier colours =====
// 1 Solar Eclipse (asked: "replace the floating shadow visuals for the eclipse weather event with a more appropriate graphical effect").
//   world3.js drew a black disc with a corona at a fixed spot of the canvas. In battle that was a dark ball hanging in front of the scenery,
//   beside the backdrop's own sun; on the map the weather layer is tiled (worldrt.js wfxTiled), so the disc repeated across the ground like
//   drifting shadows. An eclipse is a change of LIGHT, so now it is drawn as one: a deep dusk over everything, a breathing band of corona
//   gold falling from the top of the sky in battle, a breathing rim of the same gold around the view on the map, and slow motes of gold light rising. Nothing
//   is drawn at a fixed spot of the map, so tiling shows no seams or repeats.
// 2 Accept all (asked: "process every available quest in the list; verify that all tier 2 missions are captured"). A guild shows the
//   missions already taken plus two new ones (factions.js facMissionList), so one Accept all took those two and the next two (often the
//   tier 2 ones) only showed up afterwards, still open. Accept all now repeats until no open notice is left: F47.pass.
// 3 Tier colours: Heroic is ember orange; Echoforged is the violet of the Echoes (see items.js).
const F47={off:false,motes:34,pass:40,last:0};
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
// ---------- 2 Accept all: until nothing open is left ----------
['nbAcceptAll','facAcceptAll'].forEach(k=>{const a0=ACT[k];if(typeof a0!=='function')return;
  ACT[k]=function(){if(F47.off)return a0.apply(this,arguments);
    const open=()=>{try{return facMisAll().filter(m=>facMisState(m)==='open').length;}catch(e){return 0;}},mis=()=>{try{return Object.keys(facInit().acc||{}).length;}catch(e){return 0;}};
    const taken=()=>mis()+(G.quests||[]).filter(q=>q.state==='active').length+(G.bounties||[]).filter(b=>b.state==='active').length;
    const n0=taken(),t0=toast,r0=render,other=[];let r;
    // one toast and one redraw for the whole press (a toast that is not the count, such as a goal met by the press, is shown after it)
    try{toast=function(x){if(!/^Accepted \d+ /.test(String(x)))other.push(x);};render=function(){};
      r=a0.apply(this,arguments);for(let i=0;i<F47.pass&&open()>0;i++){const b=mis();a0.apply(this,arguments);if(mis()===b)break;}
    }finally{toast=t0;render=r0;}
    const n=taken()-n0;F47.last=n;F47.left=open();
    if(n>0)toast(k==='facAcceptAll'?`Accepted ${n} mission${n>1?'s':''}.`:`Accepted ${n} notice${n>1?'s':''}.`);other.forEach(x=>{try{toast(x);}catch(e){}});
    render();return r;};});
try{window.__F47=F47;}catch(e){}
