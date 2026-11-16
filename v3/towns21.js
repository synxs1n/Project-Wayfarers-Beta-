// ===== towns21.js (v0.22.15): buildings in a town tell each other apart, flat roofed towns get real rooftops =====
// Owner: "all the buildings always look near identical in a town, theming is good but we want some character and uniqueness to each
// town" and "some houses are missing rooftops".
// What was wrong (whole-town captures of ten towns, HD-2D):
//  1 A family (towns14.js TF14) paints every building from one recipe. Its role colours (F.r: inn, tavern, smithy, guild, workshop)
//    sit close together in most families (lake: four dark teals; drift: four browns), and the thatch pattern ignores them altogether
//    (timber: every roof the same gold). Only chalet read as a town of different buildings.
//  2 The flat roofed families (hd 'keep': mesa, cloud, obsidian) had a single plain quad for the top face in HD-2D, in the theme's
//    stone colour: from the tilted camera a blank grey slab, which reads as a house with its roof missing.
// Now:
//  1 Each building is painted from its own variant of the family (t21Var): a service building's roof takes its sign's colour
//    (T21.role: inn blue, tavern red, smithy iron, alchemy green, guild purple, the hues of SVC_LOOK set a little further apart) mixed into the family's own roof tone, thatch
//    included; houses take one of the family's roof colours by position with a lighter or darker cast, a wall tone a shade off their
//    neighbours' and shutters of another colour. The realm's material, shapes and silhouette are untouched, so the theme holds.
//    In HD-2D the roof pitch also differs a little by role (hdRoofProf): the inn and guild sit taller, the smithy lower.
//  2 hdKeepTop (hd2d.js, a hook since this version): a parapet rim in the wall's colour, a roof field in the building's own roof
//    colour, courses across it, and a roof hatch or a canvas awning by position. Keeps and towers outside a family (the walled
//    keep's great hall) get the same roof in a slate tone of the theme's stone. T21.off restores the old look.
const T21={off:false,mixSvc:.62,n:{top:0,var:0},role:{inn:'#2f62c0',tavern:'#b83a26',smithy:'#4a4a56',workshop:'#2f8a4a',guild:'#7a2a8a'}};
const t21H=b=>((b.x*73856093)^(b.y*19349663)^((b.w||1)*83492791))>>>0;
const T21_RI={inn:0,tavern:1,smithy:2,guild:3,chapel:3,workshop:4};
// the roof colour of one building
function t21Roof(F,b){const k=b.k,h=t21H(b),r=F.r||['#8a5a3a'];
  if(T21_RI[k]!=null){const sv=T21.role[k]||null;if(!sv)return r[T21_RI[k]%r.length];/* the family's mean roof tone carries the theme, the role's hue tells the buildings apart */let base=r[0];for(let i=1;i<r.length;i++)base=mix(base,r[i],1/(i+1));return mix(base,sv,T21.mixSvc);}
  const base=r[h%r.length],v=(h>>3)%3;return v===0?base:v===1?tint(base,.14):shade(base,.86);}
const T21V=new WeakMap();
function t21Var(F,b){let M=T21V.get(F);if(!M){M=new Map();T21V.set(F,M);}const key=b.k+':'+b.x+','+b.y+','+b.w;let V=M.get(key);if(V)return V;
  const roof=t21Roof(F,b),h=t21H(b),house=T21_RI[b.k]==null;V=Object.create(F);V.r=[roof];
  if(F.roofO&&F.roofO.pat==='thatch'){const t=mix(F.roofO.t||'#d4ae5a',roof,.42);V.roofO=Object.assign({},F.roofO,{t,t2:tint(t,.3),ridge:shade(t,.55)});}
  if(house){const w=(h>>5)%3,adj=c=>w===0?c:w===1?mix(c,'#fff2d8',.1):shade(c,.92);
    if(F.wall&&Array.isArray(F.wall.c))V.wall=Object.assign({},F.wall,{c:F.wall.c.map(adj)});if(Array.isArray(F.w))V.w=F.w.map(adj);
    if(F.winO&&F.winO.shut&&F.r&&F.r.length>1)V.winO=Object.assign({},F.winO,{shut:F.r[(h>>7)%F.r.length]});}
  M.set(key,V);T21.n.var++;return V;}
{const p0=t14Paint;t14Paint=function(ctx,m,b,F){if(T21.off||!F||!b)return p0.apply(this,arguments);let V=F;try{V=t21Var(F,b);}catch(e){V=F;}return p0.call(this,ctx,m,b,V);};}
const t21Fam=(m,b)=>{const F=m&&m.sty&&typeof TF14!=='undefined'&&TF14[m.sty];return F&&b&&TST14[b.k]&&!T14.off&&!T21.off?F:null;};
HOOK.xform('hdRoofProf','towns21','the roof pitch differs a little by the building\'s role',function(r,m,b){const F=t21Fam(m,b);if(!F)return r;
  const k=b.k,h=t21H(b);return r*(k==='inn'||k==='guild'?1.14:k==='smithy'?.9:k==='house'?[.9,1,1.1][(h>>9)%3]:1);});
// the flat roof: rim, field, courses, a hatch or an awning
HOOK.wrap('hdKeepTop','towns21','a real roof on flat roofed buildings',function(next,bt,m,b,x0,x1,zb,zf,yk,V){const F=t21Fam(m,b);if(T21.off||(T14&&T14.off))return next(bt,m,b,x0,x1,zb,zf,yk,V);
  try{const h=t21H(b),st=(THM(m).stone||[])[2]||'#a8a4a0',wall=F?((F.w&&F.w[0])||'#b0a898'):st,rc=F?mix(t21Roof(F,b),wall,.22):mix(st,'#46527a',.5),Q=(c,ax,az,bx,bz,y,k)=>{const v=hdRgb(c).map(q=>Math.round(q*(k||235)));H2P.set([ax,y,az,bx,y,az,bx,y,bz,ax,y,bz]);bt.quad(H2P,-1,0,-1,0,v[0],v[1],v[2],255,0,1,0,8);};
    const e=.35*V,in0=2.5,fx0=x0+in0,fx1=x1-in0,fz0=zb+in0,fz1=zf-in0;
    Q(tint(wall,.18),x0,zb,x1,zf,yk);Q(shade(wall,.72),fx0-.6,fz0-.6,fx1+.6,fz1+.6,yk+e*.5);Q(rc,fx0,fz0,fx1,fz1,yk+e);
    for(let z=fz0+3;z<fz1-1;z+=4)Q(shade(rc,.74),fx0,z,fx1,z+.7,yk+e*1.4);Q(tint(rc,.22),fx0,fz0,fx1,fz0+1.2,yk+e*1.5);
    const w=fx1-fx0,d=fz1-fz0;
    if(h%2===0&&w>20&&d>14){const hx0=fx0+w*.62,hz0=fz0+d*.3;Q('#3a2a1e',hx0-.8,hz0-.8,hx0+8.8,hz0+7.8,yk+e*2);Q('#8a5a34',hx0,hz0,hx0+8,hz0+7,yk+e*2.6);Q('#b98248',hx0,hz0,hx0+8,hz0+1.4,yk+e*3);Q('#5a3820',hx0+3.6,hz0,hx0+4.4,hz0+7,yk+e*3);}
    else if(w>20&&d>14){const ax=fx0+w*.12,az=fz0+d*.28,ac=(typeof SVC_LOOK!=='undefined'&&SVC_LOOK[b.k])?SVC_LOOK[b.k].roof:(F?F.r[(h>>4)%F.r.length]:'#a83a2a');
      for(let i=0;i<5;i++)Q(i%2?'#f1eee4':ac,ax+i*2.6,az,ax+i*2.6+2.6,az+9,yk+e*2.4+i*.01);Q('#3a2a1e',ax-.5,az+9,ax+13.5,az+9.8,yk+e*2.2);}
    T21.n.top++;}catch(err){T21.err=String(err&&err.message||err);return next(bt,m,b,x0,x1,zb,zf,yk,V);}});
// tests
try{window.__T21={T21,roof:(sty,b)=>t21Roof(TF14[sty],b),fams:()=>Object.keys(TF14),keep:()=>Object.keys(TF14).filter(k=>TF14[k].hd==='keep')};}catch(e){}
