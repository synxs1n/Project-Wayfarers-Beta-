// ===== voidsky10.js (v0.14.3): the void realms' sky is a starfield, not grey cloud =====
// The owner (Ashen Expanse on a phone): "Stars not filling entire map, some space shows a background that looks kind of like clouds." In the
// HD-2D view the world past the map's edge is a flat skirt lost in the daylight fog colour, so above a void field the horizon read as pale
// grey cloud. In a dark realm (THEME.dark / stars) the fog is now the void's own deep colour and thicker, so the skirt sinks into the same
// star-dark as the deep tiles, and the 2D overlay sprinkles stars over the sky band above the map. No save fields.
HOOK.after('hdLook','voidsky10','void fog',function(o,m,now){try{const dun=typeof mapIndoor==='function'?mapIndoor(m):m.kind==='dungeon';if(dun)return o;const T=THM(m);
  if(T&&(T.stars||T.dark)){const C=T.cl&&T.cl[1]?hdRgb(T.cl[1]):[.05,.04,.1];for(let i=0;i<3;i++)o.fog[i]=C[i]*.9;o.fogA=Math.max(o.fogA,.62);o.fogS=Math.min(o.fogS,1);}}catch(e){}});
// 2D and HD overlay: stars in the sky band above the map's top edge (the camera shows it on tall phone screens)
HOOK.after('worldDraw','voidsky10','stars over the void sky band',function(){try{const m=WS.m,ctx=WS.ctx;if(!m||m.kind==='dungeon'||!ctx)return;const T=THM(m);if(!T||!T.stars)return;
  const vw=WS.vw,vh=WS.vh,cy=WS.cam?WS.cam.y:0;const top=Math.min(vh,Math.max(0,Math.round(-cy)));if(top<4)return;
  const still=typeof gfxStill==='function'&&gfxStill(),t=still?0:performance.now()/1000;ctx.save();ctx.setTransform(1,0,0,1,0,0);
  for(let i=0;i<70;i++){const h1=hashS('vs'+i),x=(h1%997)/997*vw,y=((h1>>>10)%883)/883*top,tw=.45+.55*Math.abs(Math.sin(t*(.6+(i%5)*.2)+i));ctx.globalAlpha=tw*.9;ctx.fillStyle=i%7===0?'#b48aff':'#f6f0ff';ctx.fillRect(Math.round(x),Math.round(y),i%9===0?2:1,i%9===0?2:1);}
  ctx.restore();}catch(e){}});
