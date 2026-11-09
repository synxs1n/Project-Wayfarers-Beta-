// ===== realms.js (v0.4.1): sixteen realms, boss overlays, Calamity realms, realm weighting =====
// Data first: every realm is one entry in REALMS below, every boss overlay one entry in BOV, every Calamity effect one entry in CAL_FX.
// New journeys (G.run.rv===2) draw 4 of the 12 standard realms and 1 of the 4 Calamity realms from the run seed, and draw their bosses
// independently, so any Scourge can sit in any standard realm and any Calamity in any Calamity realm. Older journeys keep the six
// original realms (ZONES 0 to 5) exactly as they were.
// A realm reuses one of the six tilesets (meadow, coast, cave, snow, heights, void) for its layout rules and adds its own identity:
// a palette lean, roofs and decorations, a ground motif, ambient particles, its own monster mix (with realm variants), weather table,
// townsfolk, quests and a music shift. The boss overlay sits on top while the boss lives and lifts when it falls.

// ---------- v0.13 variant shapes (docs/art-style.md rule 7: a variant is not a recolour) ----------
// A variant names a flourish from SHP: a small function (g, F, a, pal) drawn over the base art AFTER its frame, so it follows idle A/B, atk and hit.
// F = the frame (art.js mfr), a = the anchors the base drawing returns (head, body, tail positions), pal = the palette, where a flourish may add keys.
// MONV entries take the name as their 6th field; the variants made elsewhere (o_ overlay, mb_ mini, n_ night) are named in SHAPE_OF by id.
// Ids, names, elements and drops are untouched: only the drawing differs.
const SHP={
 // Bramble Pup: leaf collar and a leaf fan where the flame was
 leaffan(g,F,a,p){p.M='#6fb04a';p.m='#3f7a32';clr(g,Math.round(a.tx-5),Math.round(a.ty-14),13,13);
  [[-5,-8],[-1,-11],[3,-8]].forEach(([dx,dy])=>{g.poly([[a.tx,a.ty],[a.tx+dx-1,a.ty+dy+2],[a.tx+dx+.5,a.ty+dy],[a.tx+dx+2,a.ty+dy+3]],'M');g.line(a.tx,a.ty,a.tx+dx,a.ty+dy+1,'m');});
  for(let k=0;k<5;k++){const t=k/4,x=a.bx+4+(a.hx-3-a.bx-4)*t,y=a.by-5+(a.hy+3-a.by+5)*t;g.poly([[x,y],[x+3,y+1],[x+1.5,y+5]],'M');g.s(x+1,y+1,'m');}},
 // Gloam Hound: bat ears, a spiked ruff, violet eyes
 hound(g,F,a,p){p.q='#2a2038';p.E='#b080ff';g.poly([[a.hx-4.5,a.hy-11],[a.hx-3.5,a.hy-17],[a.hx-.5,a.hy-11.5]],'q');
  for(let k=0;k<4;k++){const t=k/3,x=a.bx+4+(a.hx-3-a.bx-4)*t,y=a.by-5+(a.hy+1-a.by+5)*t;g.poly([[x+1,y+2],[x-3,y-3],[x+3,y+.5]],'q');}},
 // Kingsfire Hound: a gold crown between the ears
 crown(g,F,a,p){p.G='#f0c050';p.g='#b88a28';g.rect(Math.round(a.hx-3),Math.round(a.hy-7),8,2,'G');g.rect(Math.round(a.hx-3),Math.round(a.hy-5),8,1,'g');
  [[-3,-10],[0,-11],[3,-10],[-1.5,-9],[1.5,-9]].forEach(([x,y])=>g.rect(Math.round(a.hx+x),Math.round(a.hy+y),1,Math.round(-y-7)+1,'G'));g.s(Math.round(a.hx),Math.round(a.hy-6),'R');},
 // Pyreclaw, Kennelmaster: a spiked iron collar and a chain
 collar(g,F,a,p){p.N='#8a8ea0';p.n='#4a4e60';g.path([[a.hx-4,a.hy+4],[a.hx+2,a.hy+7]],'N',2.4);g.px([[a.hx-3,a.hy+2],[a.hx-1,a.hy+3],[a.hx+1,a.hy+4],[a.hx+3,a.hy+5]],'W');g.path([[a.hx-1,a.hy+7],[a.hx-2,a.hy+13]],'n',1);g.rect(Math.round(a.hx-3),Math.round(a.hy+13),3,2,'N');},
 // Rime Stalker: a tall ice horn on the brow and crystals on the tail
 icehorn(g,F,a,p){g.poly([[a.hx+1,a.hy-4],[a.hx+3.5,a.hy-14],[a.hx+5.5,a.hy-4]],'c');g.poly([[a.hx+1.6,a.hy-4.4],[a.hx+3.2,a.hy-12],[a.hx+3.8,a.hy-4.4]],'C');
  [[-11,1,-5],[-13,4,-6]].forEach(([dx,dy,h])=>g.poly([[a.bx+dx-1.5,a.by+dy+1.5],[a.bx+dx-2+(h<-5?-1:0),a.by+dy+h],[a.bx+dx+1.5,a.by+dy+1.5]],'c'));},
 // Moonfang Wolf: a crescent on the brow and one long fang
 moonfang(g,F,a,p){p.Y='#fff0a0';g.ell(a.hx+1.5,a.hy-8,3.4,3.4,'Y');g.ell(a.hx+3.2,a.hy-8.8,2.7,2.7,0);g.rect(Math.round(a.hx+7),Math.round(a.hy+4),1,3,'W');},
 // Hoarfang Wolf: curled ram horns
 ramhorns(g,F,a,p){p.H='#f0e8d4';p.h='#a89c84';g.ell(a.hx-5.5,a.hy-6,3.6,3.6,'h');g.ell(a.hx-6,a.hy-6.4,2.2,2.2,0);g.ell(a.hx-6.4,a.hy-7,1.2,1.2,'H');g.rect(Math.round(a.hx-4),Math.round(a.hy-4),3,2,'h');g.px([[a.hx-8,a.hy-8],[a.hx-7,a.hy-9]],'H');},
 // Frostmother: icicle antlers and an icicle beard
 antlers(g,F,a,p){g.path([[a.hx,a.hy-5],[a.hx-1,a.hy-11],[a.hx+1,a.hy-16]],'C',2);g.path([[a.hx-1,a.hy-11],[a.hx-5,a.hy-13]],'C',1.5);g.path([[a.hx,a.hy-8],[a.hx+4,a.hy-11]],'C',1.5);g.path([[a.hx+1,a.hy-14],[a.hx+4,a.hy-16]],'c',1);
  [[0,7],[2,8],[4,7]].forEach(([x,y])=>g.poly([[a.hx+x-1,a.hy+y-3],[a.hx+x+1.4,a.hy+y-3],[a.hx+x+.2,a.hy+y+3]],'C'));},
 // Bog Toad: cattail reeds growing from the back
 reeds(g,F,a,p){p.S='#4a7a3a';p.q='#6a4a2a';[[-6,10],[-1,8]].forEach(([dx,h])=>{const x=Math.round(a.bx+dx),y=Math.round(a.by-a.bh+2);g.line(x,y,x,y-h,'S');g.ell(x+.5,y-h-1,1.3,2.8,'q');g.poly([[x,y-3],[x+4,y-8],[x+1,y-3]],'S');});},
 // Gloomspore Toad: glowing mushroom caps on the back
 capback(g,F,a,p){p.U='#a07ae0';p.u='#6a4aa8';[[-5,0,3.4],[3,1,2.6]].forEach(([dx,dy,r])=>{const x=a.bx+dx,y=a.by-a.bh+dy;g.rect(Math.round(x),Math.round(y-3),2,4,'W');g.ell(x+1,y-4.5,r,r*.7,'u');g.ell(x+.4,y-5,r*.75,r*.5,'U');g.px([[x-1,y-5],[x+2,y-4]],'W');});},
 // Mire Queen: a crown of lily petals
 lilycrown(g,F,a,p){p.P='#f08ab8';p.G='#f0c050';[-4,-2,0,2,4].forEach((o,n)=>{const x=a.hx-1.5+o,y=a.hy-10-(n%2?0:1);g.poly([[x-1.5,y+3.2],[x+.2,y-2],[x+1.8,y+3.2]],'P');});g.rect(Math.round(a.hx-4),Math.round(a.hy-8),5,1,'G');g.s(Math.round(a.hx-2),Math.round(a.hy-12),'G');},
 // Reed Crawler: reeds standing on the shell
 reedback(g,F,a,p){p.S='#6a9a3a';p.q='#6a4a2a';[[-8,9],[-5,12],[-2,8]].forEach(([dx,h])=>{const x=Math.round(a.bx+dx),y=Math.round(a.by-4);g.line(x,y,x+(h>10?-1:0),y-h,'S');g.poly([[x,y-4],[x+4,y-9],[x+1,y-4]],'S');if(h>10)g.ell(x-.5,y-h-1,1.2,2.4,'q');});},
 // Stormtide Crawler: a tall dorsal fin with a lightning mark
 tidefin(g,F,a,p){p.F='#4aa8ff';p.f='#2a6ab8';p.Y='#ffe14a';g.poly([[a.bx-9,a.by-4],[a.bx-7,a.by-12],[a.bx-4,a.by-6],[a.bx-2,a.by-14],[a.bx+1,a.by-6]],'f');g.poly([[a.bx-8,a.by-4],[a.bx-7,a.by-10],[a.bx-4.5,a.by-5.5]],'F');g.px([[a.bx-3,a.by-11],[a.bx-2,a.by-9],[a.bx-3,a.by-8]],'Y');},
 // Brine Hag: seaweed hair and barnacles
 seaweed(g,F,a,p){p.S='#2f7a5a';p.s='#1f5a40';g.path([[a.bx-3,a.by-5],[a.bx-8,a.by-9],[a.bx-12,a.by-5],[a.bx-13,a.by+1]],'S',2);g.path([[a.bx,a.by-5],[a.bx-4,a.by-11],[a.bx-9,a.by-11]],'s',1.6);g.px([[a.bx-6,a.by-2],[a.bx-2,a.by-1],[a.bx+3,a.by-3]],'W');},
 // Crownshell: a coral crown over the shell
 coralcrown(g,F,a,p){p.P='#f08a7a';p.p='#b8584c';p.G='#f0c050';[-9,-5,-1,3,7].forEach((o,n)=>{const x=a.cx+o,top=a.cy-10.8*Math.sqrt(1-Math.min(1,(o/13.5)**2)),h=[5,8,6,9,6][n];g.poly([[x-2,top+2.5],[x,top-h],[x+2,top+2.5]],'p');g.poly([[x-1.4,top+2.5],[x-.4,top-h+1],[x+.6,top+2.5]],'P');});g.ell(a.cx-1,a.cy-12.5,1.8,1.8,'W');},
 // Old Shellking: two curved tusks
 tusks(g,F,a,p){p.T='#f2ecd6';p.t='#b8b098';g.poly([[a.hx+2.5,a.hy+2.5],[a.hx+9,a.hy-4.5],[a.hx+6.5,a.hy+4.5]],'T');g.poly([[a.hx+3,a.hy+3.2],[a.hx+8,a.hy-3],[a.hx+6,a.hy+3.6]],'t');g.poly([[a.hx-1,a.hy+3],[a.hx+2,a.hy-3],[a.hx+3,a.hy+3.5]],'T');},
 // Glowcap Slime: glowing mushroom caps instead of a crater
 glowcaps(g,F,a,p){p.U='#8affd8';p.u='#3ab898';[[-5,1.5,4],[3,-1,3.2],[9,4,2.2]].forEach(([dx,dy,r])=>{const x=a.cx+dx,y=a.ty+dy;g.rect(Math.round(x),Math.round(y-2),2,3,'W');g.ell(x+1,y-3,r,r*.7,'u');g.ell(x+.4,y-3.6,r*.75,r*.5,'U');g.px([[x-1,y-3],[x+2,y-4]],'W');});},
 // Sunscorch Ooze: rays all round the crown
 sunflare(g,F,a,p){p.Y='#ffe08a';p.C='#ffb040';for(let k=0;k<7;k++){const t=-2.75+k*.4,x=a.cx+Math.cos(t)*(a.w+.5),y=a.cy+Math.sin(t)*(a.h+.5),ox=Math.cos(t),oy=Math.sin(t);g.poly([[x-oy*1.3,y+ox*1.3],[x+ox*5.5,y+oy*5.5],[x+oy*1.3,y-ox*1.3]],k%2?'C':'Y');}},
 // Thornbound Creeper: thorn spikes round the dome
 thorns(g,F,a,p){p.q='#3a2a1a';p.k='#c8a860';for(let k=0;k<6;k++){const t=-2.7+k*.45,x=a.x+Math.cos(t)*(a.w-1),y=a.y+Math.sin(t)*(a.h-1),ox=Math.cos(t),oy=Math.sin(t);g.poly([[x-oy*1.4,y+ox*1.4],[x+ox*5.5,y+oy*5.5],[x+oy*1.4,y-ox*1.4]],'q');g.s(Math.round(x+ox*4.6),Math.round(y+oy*4.6),'k');}},
 // Rootmother: roots creeping out at the feet and a branch crown
 roots(g,F,a,p){p.q='#5a3a22';p.S='#3f7f32';g.path([[a.x-6,35],[a.x-12,36.5],[a.x-16,35]],'q',2.2);g.path([[a.x+6,35],[a.x+12,36.5],[a.x+16,35]],'q',2.2);g.path([[a.x-3,36],[a.x-5,38]],'q',1.5);
  g.path([[a.sx-1,a.sy],[a.sx-5,a.sy-7],[a.sx-7,a.sy-8]],'q',1.6);g.path([[a.sx+1,a.sy],[a.sx+5,a.sy-6],[a.sx+7,a.sy-8]],'q',1.6);g.px([[a.sx-7,a.sy-9],[a.sx+7,a.sy-9]],'S');},
 // Mantis Brood: two small scythes on the front of the ring
 blades(g,F,a,p){p.V='#c8e04a';p.v='#6a8a20';[-1,1].forEach(d=>{const x=a.cx+a.rx-1,y=a.cy+d*3;g.path([[x,y],[x+3,y+d*-3],[x+6,y+d*-2],[x+6,y+d*1]],'V',1.4);g.s(Math.round(x+6),Math.round(y+d),'v');});}
};
const SHAPE_OF={o_thornwarden:'thorns',mb_rootmother:'roots',o_drake:'tidefin',mb_brinehag:'seaweed',o_cinderking:'crown',mb_pyreclaw:'collar',n_cinderpup:'hound',
  o_hoarwyrm:'ramhorns',mb_frostmother:'antlers',n_frostwolf:'moonfang',o_gloomcap:'capback',mb_mirequeen:'lilycrown',mb_shellking:'tusks',mb_sunscorch:'sunflare',o_queenmantis:'blades'};
// the same flourish over a night variant (world3.js builds those before this file loads): wrap its drawing and keep the frame flag
function shapeWrap(id,name){const f0=MART[id],sh=SHP[name];if(!f0||!sh||f0.shaped)return;
  const w=(g,f)=>{const o=f0(g,f);if(o&&o.a){const pal=Object.assign({},o.pal);sh(g,mfr(f),o.a,pal);return Object.assign({},o,{pal});}return o;};w.fr=f0.fr||(MON[id]&&MART[MON[id].base]&&MART[MON[id].base].fr);w.shaped=1;MART[id]=w;}

// ---------- realm monster variants: a base sprite repainted toward a colour, with its own name and elements ----------
const MONV=[
 // id, base, name, elements, colour, shape (a flourish of SHP, drawn over the base art: see above; only for variants of the redrawn foe arts so far)
 ['v_bramblepup','cinderpup','Bramble Pup',['earth'],'#5a8a3a','leaffan'],['v_sunimp','gustimp','Sunflick Imp',['light','wind'],'#f0c040'],
 ['v_bogtoad','dewtoad','Bog Toad',['water','shadow'],'#3a5a3a','reeds'],['v_marshwisp','tidewisp','Marsh Wisp',['water','shadow'],'#5a7a6a'],
 ['v_glowslime','magmaslime','Glowcap Slime',['earth','light'],'#5ad0b0','glowcaps'],['v_emberbat','cavebat','Ember Bat',['fire','shadow'],'#c0502a'],
 ['v_rimewolf','frostwolf','Rime Stalker',['ice','shadow'],'#4a5a8a','icehorn'],['v_galeharpy','snowharpy','Gale Harpy',['wind','lightning'],'#a8a0e0'],
 ['v_sunhawk','thunderhawk','Sun Hawk',['fire','wind'],'#e8a040'],['v_dunegolem','slaggolem','Dune Golem',['earth','wind'],'#d8b070'],
 ['v_lakeray','cloudray','Lake Ray',['water'],'#4a90c0'],['v_ironling','stormling','Ironling',['lightning','earth'],'#8a8a9a'],
 ['v_reedcrawler','crawler','Reed Crawler',['earth','water'],'#7a8a4a','reedback'],['v_moorgull','gull','Moor Gull',['wind','shadow'],'#6a6a7a'],
 ['v_orchardimp','gustimp','Orchard Sprite',['earth','light'],'#c0d060'],['v_quarryknight','iceknight','Quarry Knight',['earth'],'#8a7a6a'],
 // Calamity realm natives
 ['v_ashspawn','voidspawn','Ash Spawn',['fire','shadow'],'#8a4a3a'],['v_drownwatch','huskguard','Drowned Watcher',['water','shadow'],'#3a6a7a'],
 ['v_starwraith','eclipsewraith','Starless Wraith',['shadow'],'#2a2a5a'],['v_skyshard','gargoyle','Sky Shard',['light','lightning'],'#d8e0ff'],
 ['v_tidecrown','shellguard','Crownshell',['water','light'],'#5ab0c0','coralcrown'],['v_cindereater','stareater','Cinder Eater',['fire'],'#c0602a'],
 ['v_galeghost','cloudray','Shatterwind Ray',['wind','light'],'#e0e0ff'],['v_ashhusk','huskguard','Ashen Husk',['fire','shadow'],'#6a4a40']
];
function recol(hex,to,k){if(!/^#[0-9a-f]{6}$/i.test(String(hex)))return hex;return lerpHex(hex,to,k);}
function makeMonVariant(id,base,name,els,col,extra,shape){const m=MON[base];if(!m||MON[id])return;
  const map={};m.el.forEach((e,i)=>{map[e]=els[Math.min(i,els.length-1)];});
  MON[id]=Object.assign({},m,{n:name,art:id,el:els.slice(),base,variant:1},extra||{},{sk:(m.sk||[]).map(s=>{const c=s.slice();if(map[c[1]])c[1]=map[c[1]];return c;})});
  if(typeof MON_DROPS!=='undefined')MON_DROPS[id]=(MON_DROPS[base]||[]).slice();
  if(typeof MON_TY!=='undefined'&&MON_TY[base])MON_TY[id]=MON_TY[base].slice();
  if(typeof FAM_OF!=='undefined'&&FAM_OF[base])FAM_OF[id]=FAM_OF[base];
  const sh=SHP[shape||SHAPE_OF[id]];
  MART[id]=(g,f)=>{const o=MART[m.art](g,f);const p0=Object.assign({},o.pal);if(sh&&o.a)sh(g,mfr(f),o.a,p0);const pal={};Object.keys(p0).forEach(q=>{pal[q]='KEW'.includes(q)||!(q in o.pal)?p0[q]:recol(p0[q],col,.5);});return Object.assign({},o,{pal});};
  MART[id].fr=MART[m.art].fr;// frames follow the base art (art.js frame API)
  if(MEXTRA[m.art])MEXTRA[id]=(g,p)=>{MEXTRA[m.art](g,p);Object.keys(p).forEach(q=>{if(!'KEW'.includes(q))p[q]=recol(p[q],col,.5);});};}
MONV.forEach(([id,b,n,e,c,sh])=>makeMonVariant(id,b,n,e,c,undefined,sh));
['n_cinderpup','n_frostwolf'].forEach(id=>shapeWrap(id,SHAPE_OF[id]));

Object.keys(BOV).forEach(k=>{const [id,b,n,e,c]=BOV[k].mon;makeMonVariant(id,b,n,e,c,{ov:k});});
// ---------- helpers ----------
const isRv2=()=>!!(G&&G.run&&G.run.rv===2&&!G.daily);
function realmAt(s){const Z=ZS(s);return Z&&Z.idx>=REALM_BASE?Z:null;}
function bovAt(s){if(!isRv2()||G.cleared[s])return null;const k=bossAtStage(s);return BOV[k]?Object.assign({key:k},BOV[k]):null;}
function calFxAt(s){if(!isRv2()||s!==4||G.cleared[4])return null;const k=bossAtStage(4);return CAL_FX[k]?Object.assign({key:k},CAL_FX[k]):null;}
// pools are plain arrays (other code swaps them for night battles), so they are re-synced whenever the journey or a boss changes
function syncPools(){if(!G||!G.run)return;REALMS.forEach(R=>{let p=R.pool0.slice();const s=G.run.order?G.run.order.indexOf(R.idx):-1;
  if(isRv2()&&s>=0){const o=bovAt(s);if(o)p[p.length-1]=o.mon[0];}R.pool=p;});}

// ---------- new journeys draw the realms (seeded) ----------
// v0.11.1: a journey started from now on lays its fields out by thirds (lay3On); older journeys keep their maps
function lay3On(){try{return !!(G&&G.run&&G.run.lay3);}catch(e){return false;}}
{const nr0=newRun;newRun=function(cycle){const r=nr0.apply(this,arguments);try{const R=seeded((r.seed^0x5eed)>>>0);
  // v0.11.9: the realms rise in fantasy: realm 1 from the grounded tier, realm 2 from tiers 1-2, realm 3 from tiers 2-3, realm 4 from the wildest tier
  const TIER={thistle:1,orchard:1,strand:1,lakes:1,mire:2,grotto:2,tundra:2,peaks:2,deeps:3,mines:3,glacier:3,mesa:3},want=[[1],[1,2],[2,3],[3]],std=[],used=new Set();
  want.forEach(ts=>{let pool=REALM_STD.filter(i=>!used.has(i)&&ts.includes(TIER[REALMS[i-REALM_BASE].key]||2));if(!pool.length)pool=REALM_STD.filter(i=>!used.has(i));const pick=pool[Math.floor(R()*pool.length)];used.add(pick);std.push(pick);});
  const cal=REALM_CAL[Math.floor(R()*REALM_CAL.length)];r.order=std.concat([cal]);r.rv=2;r.lay3=1;/* v0.11.1: sites by thirds of the route (worldgen.js, sites.js) */}catch(e){}return r;};}

// ---------- look: realm palette under the boss overlay; the overlay lifts when the boss falls ----------
function realmVariant(theme,R){const id=theme+'@'+R.key;if(THEME[id])return id;const B=R.lean,T=THEME[theme],D=DTHEME[theme];
  const V=Object.assign({},T);['g','tg','p','cb','cl'].forEach(k=>{if(T[k])V[k]=lerpArr(T[k],B.mix,B.k*(k==='cb'?.5:k==='cl'?.6:1));});
  V.w=T.w.slice();V.w[0]=lerpHex(T.w[0],B.mix,B.k*.5);V.w[3]=lerpHex(T.w[3],B.mix,B.k*.5);V.roof=B.roof.slice();V.dec=B.dec.slice();V.lip=lerpHex(T.lip,B.mix,B.k*.7);THEME[id]=V;
  const DV=Object.assign({},D);DV.f=lerpArr(D.f,B.mix,B.k*.55);DV.w=lerpArr(D.w,B.mix,B.k*.5);DV.top=lerpHex(D.top,B.mix,B.k*.35);DTHEME[id]=DV;return id;}
{const ab0=applyBossTheme;applyBossTheme=function(m){
  try{if(m&&m.kind==='town'){(m.npcs||[]).forEach(n=>{if(n.line0==null)n.line0=n.line;});if(!m.signs0&&m.signs)m.signs0=Object.assign({},m.signs);}}catch(e){}
  const cleared=!!(G&&G.cleared&&typeof m.s==='number'&&G.cleared[m.s]&&!m.archive);
  if(!cleared)ab0.apply(this,arguments);else{m.thv=m.theme;m.motif=null;m.amb=null;m.btint=null;m.bkey=null;
    (m.npcs||[]).forEach(n=>{if(n.line0!=null){n.line=n.line0;n.themed=0;}});if(m.signs0)m.signs=Object.assign({},m.signs0);}
  try{const R=typeof m.s==='number'&&!m.archive&&G&&G.run?realmAt(m.s):null;if(R&&THEME[m.theme]&&DTHEME[m.theme]){const base=realmVariant(m.theme,R);
    m.thv=(!cleared&&m.bkey)?themeVariant(base,m.bkey):base;if(cleared||!m.bkey){m.motif=R.lean.motif;m.amb=R.lean.amb;m.btint=R.lean.tint;}}}catch(e){}};}
// boss down: the overlay lifts from every map of that realm, and the realm says so
function liftOverlay(s){try{Object.values(MAPS).forEach(m=>{if(m&&m.s===s&&!m.archive)applyBossTheme(m);});syncPools();}catch(e){}}
HOOK.wrap('finishBattle','realms','overlay lifts on a first clear',function(next,...a){const how=a[0];const sp=B&&B.spec,s=sp&&sp.stage,c0=B?B.clr0:true;const r=next(...a);
  try{if(G&&!G.daily&&c0===false&&typeof s==='number'&&G.cleared[s]){liftOverlay(s);const k=bossAtStage(s),d=guardianDef(k);
    toast(`${ZS(s).n} breathes easier. The pall over the realm lifts.${d?` ${d.n}'s Echo waits in the Echo Sanctum.`:''}`);}}catch(e){}return r;});

// ---------- weather: realm tables, overlay bias (clear always the largest single share) ----------
function realmWxList(s){const Z=ZS(s),R=realmAt(s);const L=wxList(R&&isRv2()?R.wxk:Z.theme,clockPhase()).map(x=>x.slice());const o=bovAt(s);
  if(o&&o.wx){const e=L.find(x=>x[0]===o.wx[0]);if(e)e[1]+=o.wx[1];else L.push([o.wx[0],o.wx[1]]);}
  const c=L.find(x=>x[0]==='clear');if(c){const mx=Math.max(...L.filter(x=>x[0]!=='clear').map(x=>x[1]),0);if(c[1]<=mx)c[1]=mx+1;}return L;}
{const rw0=rollWeather;rollWeather=function(s,avoid){if(!isRv2()||!realmAt(s))return rw0.apply(this,arguments);const L=realmWxList(s),tot=L.reduce((a,b)=>a+b[1],0);let w='clear';
  for(let k=0;k<4;k++){let r=Math.random()*tot;for(const [n,c] of L){if((r-=c)<0){w=n;break;}}if(w!==avoid||w==='clear')break;}
  G.weather[s]=w;G.wx=G.wx||{};G.wx[s]=WX_MIN+Math.floor(Math.random()*(WX_MAX-WX_MIN));return w;};}

// ---------- battles: synced pools, Calamity effects ----------
HOOK.wrap('startBattle','realms','sync pools, Calamity effects, stage cleared flag',function(next,...a){const spec=a[0];syncPools();const c0=!!(G&&G.cleared&&spec&&G.cleared[spec.stage]);const r=next(...a);try{if(r!==false&&B)B.clr0=c0;if(r!==false&&B&&spec&&!G.daily){const f=calFxAt(spec.stage);if(f&&spec.kind!=='arena'){B.calfx=f;
  if(f.spd)B.front.concat(B.back,B.en).forEach(u=>{if(u&&u.S)u.S.spd=Math.round(u.S.spd*f.spd);});log(`${f.n}: ${f.d.split('.')[0]}.`);}}}catch(e){}return r;});
HOOK.after('calcDamage','realms','Calamity element multipliers and burn',function(r,a,sk,t){try{const f=B&&B.calfx;if(f&&r&&r.dmg&&sk){const els=skEls(sk);let m=1;els.forEach(e=>{if(f.el[e])m=Math.max(m===1?0:m,f.el[e]);});if(els.length&&m&&m!==1)r.dmg=Math.max(1,Math.round(r.dmg*m));
  if(f.burn&&a&&a.side==='e'&&t&&t.side==='p'&&els.includes('fire')&&t.hp>0&&!(t.st&&t.st.burn)&&RNG()<f.burn&&!(t.S&&t.S.immune))try{addSt(t,'burn',a);}catch(_){}}}catch(e){}});
HOOK.wrap('genQuests','realms','realm quests (pools, rival)',function(next,...a){let s=a[0];syncPools();const had=G.quests.some(q=>q.stage===s);next(...a);if(had)return;try{const R=realmAt(s);if(!R||!isRv2())return;
  const add=(q,i)=>{if(q.type==='gather')G.quests.push({id:'rq'+s+i,stage:s,type:'gather',mat:q.mat,n:q.n,state:'open',title:q.t,desc:q.d,reward:{gold:200+s*180,item:'ether'}});
    else if(MON[q.mon])G.quests.push({id:'rq'+s+i,stage:s,type:'hunt',mon:q.mon,n:4+s,have:0,state:'open',title:q.t,desc:q.d,reward:{gold:160+s*170,item:'hipotion'}});};
  (R.quests||[R.quest]).filter(Boolean).forEach(add);
  const o=bovAt(s);if(o&&MON[o.mon[0]])G.quests.push({id:'oq'+s,stage:s,type:'hunt',mon:o.mon[0],n:3+s,have:0,state:'open',title:`Strange ${MON[o.mon[0]].n}s`,desc:`${ZS(s).town} has seen ${MON[o.mon[0]].n}s on the roads since the trouble began. Thin them out.`,reward:{gold:220+s*200,item:'remedy'}});}catch(e){}});
{const gb0=genBounties;genBounties=function(s){syncPools();return gb0.apply(this,arguments);};}

// ---------- realm weighting (4.3): chance meetings and taverns lean toward the realm's and the overlay's elements ----------
function realmEls(s){const R=realmAt(s),o=bovAt(s);const a=R&&isRv2()?R.els.concat(R.favor||[]):(CE_THEME_EL[ZS(s).theme]||[]);return {base:a,ov:o?o.el:[]};}
function cePick(m){const P=cePool();if(!P.length)return null;const ce=ceInit(),E=realmEls(m.s);
  const w=P.map(id=>{const t=TPL[id];let x=1;if((t.el||[]).some(e=>E.base.includes(e)))x*=2.5;if((t.el||[]).some(e=>E.ov.includes(e)))x*=1.5;x/=1+(ce.met[id]||0);return x;});
  const tot=w.reduce((a,b)=>a+b,0);let r=Math.random()*tot,k=0;for(;k<P.length-1;k++){if((r-=w[k])<0)break;}return P[k];}
if(typeof recruitFit==='function'){const rf0=recruitFit;recruitFit=function(id,N){const o=rf0.apply(this,arguments);try{if(o&&isRv2()&&WS.m&&typeof WS.m.s==='number'){const E=realmEls(WS.m.s),t=TPL[id];
  if((t.el||[]).some(e=>E.base.includes(e)))o.w*=1.4;if((t.el||[]).some(e=>E.ov.includes(e)))o.w*=1.25;}}catch(e){}return o;};}

// ---------- music: the realm shifts the key; the boss part goes when the boss falls ----------
{const mo0=bossMusicOff;bossMusicOff=function(){let v=0;try{const s=WS.m&&typeof WS.m.s==='number'?WS.m.s:B&&B.stage;const R=typeof s==='number'?realmAt(s):null;
  v=(G&&G.cleared&&G.cleared[s])?0:mo0();if(R&&isRv2())v+=R.mus||0;}catch(e){}return v;};}

// ---------- Guides, NPC talk and the Bestiary ----------
function overlayGuide(){if(!G||!G.run||G.daily)return '';const s=WS.m&&typeof WS.m.s==='number'?WS.m.s:G.stage;if(typeof s!=='number')return '';
  const R=realmAt(s),o=bovAt(s),f=calFxAt(s);if(!R&&!o)return '';
  return `<h4>${esc(ZS(s).n)}</h4>${R&&isRv2()?`<p class="note">${esc(R.intro.split('. ')[0])}.</p>`:''}${o?`<p class="note"><b>The realm is uneasy.</b> ${esc(o.guide)} It lifts when the realm's master falls.</p>`:G.cleared[s]?'<p class="note">The realm is at peace. Its master has fallen.</p>':''}${f?`<p class="note"><b>${esc(f.n)}.</b> ${esc(f.d)}</p>`:''}`;}
{const nl0=npcLore;npcLore=function(m){const L=nl0.apply(this,arguments);try{const o=bovAt(m.s|0);if(!o)return G&&G.cleared&&G.cleared[m.s|0]?[]:L;return L.concat([o.say]);}catch(e){return L;}};}
{const ba0=bestAll;bestAll=function(){const out=ba0();try{const have=new Set(out.map(o=>o.k));Object.keys(BOV).forEach(k=>{const id=BOV[k].mon[0];if(MON[id]&&!have.has(id))out.push({k:id,d:MON[id],odd:1});});}catch(e){}return out;};}
// keep pools right after a load or a new journey
HOOK.before('getMap','realms','sync pools before a new map',function(id){if(!MAPS[id])syncPools();});
// the opening story frames whichever realm the journey starts in
const REALM_OPENING='The Meridian Light that keeps the sky of Aurelis bright has begun to gutter. One by one the beacons are going dark, and a Scourge sits at the end of every road. You and your companions set out to light them again.';
{const bg0=ACT.begin;ACT.begin=function(){const r=bg0.apply(this,arguments);try{if(V.modal&&V.modal.type==='story'&&isRv2()&&V.modal.text===ZS(0).intro)V.modal.text=REALM_OPENING+' '+ZS(0).intro;}catch(e){}return r;};}
