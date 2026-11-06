// ===== icons.js (v0.6.3): one code-drawn icon per item (gear, consumables, materials) =====
// Every icon is code-drawn on a 16x16 grid of material keys, then painted in one pass: a bevel from the upper left (light on the top and
// left edges of each shape, shadow on the bottom and right), a coloured outline (the darkest tone of the part it touches), and for rare
// pieces an aura ring and sparkles. Shapes change with the tier (not only the palette): tier 0 is plain, every tier adds a part or a new
// silhouette, tier 3+ carries gold trim and a gem, tier 4+ a glint and tier 5 a glow. Signature weapons, Oathmantles and Tokens get their
// own silhouettes per personal reward kind, coloured by the hero's elements with a per-hero variant, so no two heroes share an icon.
// Keys: M metal (tier palette), m darker metal, T trim, G gem, W wood, L leather grip, C/K cloth, P page, B bone, R string, F feather,
// E element glow (flat), S white glint (flat), X dark inset, O orb (gem tone). Lowercase = a darker step of the same material.
// Test: tools/chrome/v063s.js renders every icon and fails on duplicates. Sheet: tools/chrome/v063sheet.js.
const IC_TRIM=['#a8784a','#c8a060','#e0e4ec','#f0c050','#7a9aff','#ffd25a'];
const IC_WOOD=['#9a6a3a','#c8aa78','#7a9a5a','#4a8a9a','#d8e4f0','#4a3466'];
const IC_GRIP=['#6a4026','#5a3a2a','#3a4a6a','#4a2a5a','#2a3a6a','#5a1a2a'];
const IC_CLOTH=['#8a7a5a','#5f9a6a','#4a6ad0','#8a5ad8','#e0b030','#c83a3a'];
const IC_FLAT='SEX';
function icBuf(){return new Array(256).fill('');}
function icSet(b,x,y,k){x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>15||y>15)return;b[y*16+x]=k;}
function icGet(b,x,y){return x<0||y<0||x>15||y>15?'':b[y*16+x];}
function icRect(b,x,y,w,h,k){for(let j=0;j<h;j++)for(let i=0;i<w;i++)icSet(b,x+i,y+j,k);}
function icLine(b,x0,y0,x1,y1,k){let dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,e=dx+dy;for(let n=0;n<64;n++){icSet(b,x0,y0,k);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
function icArt(b,x,y,rows,map){rows.forEach((s,j)=>{for(let i=0;i<s.length;i++){const c=s[i];if(c==='.'||c===' ')continue;icSet(b,x+i,y+j,c==='_'?'':(map&&map[c])||c);}});}
function icDisc(b,cx,cy,r,k){for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=x-cx,dy=y-cy;if(dx*dx+dy*dy<=r*r)icSet(b,x,y,k);}}
// diagonal space for weapons held from the lower left to the upper right: pixel (x,15-x) is s=x, v=0; v>0 is toward the lower right
function icUV(b,k,f){for(let y=0;y<16;y++)for(let x=0;x<16;x++){const s=(x+15-y)/2,v=(x-15+y)/2;const r=f(s,v);if(r)icSet(b,x,y,r===true?k:r);}}
const icAt=(s,v)=>[Math.round(s+v),Math.round(15-(s-v))];
function icPt(b,s,v,k){const [x,y]=icAt(s,v);icSet(b,x,y,k);}
// paint the key grid
function icPaint(x,b,P,o){o=o||{};const flat=(P._flat||'')+IC_FLAT;
  const col=k=>{if(P[k])return P[k];const u=k.toUpperCase();if(u!==k&&P[u])return shade(P[u],.68);return '#ff00ff';};
  const at=(i,j)=>icGet(b,i,j);
  const outl=new Array(256).fill(null);
  for(let j=0;j<16;j++)for(let i=0;i<16;i++){if(at(i,j))continue;const n=[at(i,j-1),at(i-1,j),at(i+1,j),at(i,j+1)].filter(Boolean);
    if(n.length)outl[j*16+i]=mix(shade(col(n[0]),.32),OUTC,.5);}
  if(o.aura){x.globalAlpha=o.auraA||.24;x.fillStyle=o.aura;
    for(let j=0;j<16;j++)for(let i=0;i<16;i++){if(at(i,j)||outl[j*16+i])continue;let near=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(outl[(j+dy)*16+i+dx]&&i+dx>=0&&i+dx<16&&j+dy>=0&&j+dy<16)near=1;if(near)x.fillRect(i,j,1,1);}
    x.globalAlpha=1;}
  for(let j=0;j<16;j++)for(let i=0;i<16;i++){const c=outl[j*16+i];if(c){x.fillStyle=c;x.fillRect(i,j,1,1);}}
  for(let j=0;j<16;j++)for(let i=0;i<16;i++){const k=at(i,j);if(!k)continue;let c=col(k);
    if(!flat.includes(k)){const L=(!at(i,j-1))+(!at(i-1,j)),D=(!at(i,j+1))+(!at(i+1,j));if(L>D)c=tint(c,.36);else if(D>L)c=shade(c,.72);}
    x.fillStyle=c;x.fillRect(i,j,1,1);}
  (o.spark||[]).forEach(([a,c])=>{const s=o.sparkC||'#ffffff';x.fillStyle=s;x.fillRect(a,c,1,1);x.globalAlpha=.6;[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{if(!at(a+dx,c+dy))x.fillRect(a+dx,c+dy,1,1);});x.globalAlpha=1;});
}
// ----- palettes -----
function icPal(t,o){t=Math.max(0,Math.min(5,t|0));o=o||{};const P={M:TIER_METAL[t],G:TIER_GEM[t],T:IC_TRIM[t],W:IC_WOOD[t],L:IC_GRIP[t],C:IC_CLOTH[t],K:shade(IC_CLOTH[t],.7),
  P:'#efe6cc',B:'#ece2c8',R:'#f0ead8',F:'#e8e0d0',E:'#8af0ff',S:'#ffffff',X:'#1a1020',O:TIER_GEM[t]};return Object.assign(P,o);}
// ----- swords -----
// o: p pommel s, pr pommel radius, g guard s, gl guard half width, T tip s, l/r blade half widths (v), tp taper, curve start, cv bend,
// jag teeth, ful fuller key, rk ricasso length, wide widening near the middle (leaf blade)
function icSword(b,o){const g=o.g,T=o.T,tp=o.tp||2,l=o.l||0,r=o.r==null?.5:o.r;
  icUV(b,'M',(s,v)=>{if(s<=g||s>T)return false;let f=Math.min(1,(T-s)*tp);let w=1;if(o.wide)w=1+o.wide*Math.max(0,1-Math.abs(s-(g+(T-g)*.45))/((T-g)*.45));
    let vv=v;if(o.curve!=null&&s>o.curve)vv=v+(s-o.curve)*(s-o.curve)*(o.cv||.05);
    const L=(o.rk&&s<g+o.rk?Math.max(l,.5):l)*w,R=r*w;return vv>=-L*f-.01&&vv<=R*f+.01;});
  if(o.wave)icUV(b,'M',(s,v)=>s>g+.9&&s<T-1&&((Math.floor(s)%2===0&&Math.abs(v+(o.l||0)+.5)<.01)||(Math.floor(s)%2===1&&Math.abs(v-r-.5)<.01)));
  if(o.jag)icUV(b,'M',(s,v)=>s>g+1&&s<T-1.5&&Math.abs(v+l+.5)<.01&&Math.floor(s)%2===0);
  if(o.ful)icUV(b,o.ful,(s,v)=>s>g+.9&&s<T-2&&Math.abs(v)<.01&&icGet(b,...icAt(s,v)));
  icUV(b,o.gk||'T',(s,v)=>Math.abs(s-g)<=.5&&Math.abs(v)<=o.gl+.01);
  icUV(b,o.hk||'L',(s,v)=>s>o.p&&s<g&&v>-.01&&v<.51);
  icUV(b,o.pk||'T',(s,v)=>(s-o.p)*(s-o.p)+v*v<=o.pr*o.pr+.01);}
// ----- hafted weapons: a shaft along v=0 from s0 to s1 -----
function icHaft(b,s0,s1,k){icUV(b,k,(s,v)=>s>=s0&&s<=s1&&v>-.01&&v<.51);}
// ----- weapon families: f(b,t,P) returns paint options -----
const ICF={};
ICF.blade=(b,t)=>{const S=[{p:1,pr:.5,g:3.5,gl:1,T:12.5},{p:1,pr:.75,g:3.5,gl:1.5,T:13,rk:1.5},{p:1,pr:.75,g:4,gl:1.5,T:13.5,curve:7,cv:.035,l:.5,r:.5,tp:1.2},
  {p:1,pr:.75,g:4,gl:2,T:14,l:.5,r:.5,ful:'m'},{p:1,pr:1,g:4,gl:2,T:14,l:.5,r:.5,jag:1,ful:'E'},{p:1,pr:1,g:4.5,gl:2.5,T:14.5,l:.5,r:.5,tp:1.2,ful:'G'}][t];
  icSword(b,S);const o={};
  if(t>=2)icPt(b,S.g,0,'G');
  if(t===3){icPt(b,S.g+.5,-2.5,'T');icPt(b,S.g+.5,2.5,'T');}
  if(t>=4){icPt(b,S.g-1,0,'T');icPt(b,S.p,0,'G');o.spark=[[13,1]];}
  if(t===5){icPt(b,S.g+1,-2,'T');icPt(b,S.g+1,2,'T');o.aura=TIER_GEM[5];o.spark=[[14,1],[9,3]];}
  return o;};
ICF.shortsword=(b,t)=>{const S=[{p:1.5,pr:.5,g:4,gl:1,T:10.5,wide:.9,l:.5,r:.5},{p:1.5,pr:.5,g:4,gl:2,T:11,l:0,r:.5,tp:1},{p:1.5,pr:.75,g:4,gl:1.5,T:11,wide:1,l:.5,r:.5,curve:7,cv:.12},
  {p:1.5,pr:.75,g:4,gl:1.5,T:11.5,l:.5,r:.5,jag:1},{p:1.5,pr:.75,g:4.5,gl:2,T:12,wide:.8,l:.5,r:.5,ful:'E'},{p:1.5,pr:1,g:4.5,gl:2.5,T:12,l:.5,r:1,tp:1,ful:'X'}][t];
  icSword(b,S);const o={};
  if(t===2){icPt(b,S.g,-1.5,'G');icPt(b,S.g,1.5,'G');}
  if(t===3){icPt(b,8,-1.5,'E');icPt(b,10,-1.5,'E');icPt(b,S.g,0,'G');}
  if(t>=4){icPt(b,S.g,0,'G');icPt(b,S.p,0,'G');o.spark=[[11,3]];}
  if(t===5){o.aura='#b06aff';o.spark=[[12,2]];}
  return o;};
ICF.dagger=(b,t)=>{const S=[{p:3,pr:.5,g:5,gl:1,T:10},{p:3,pr:.5,g:5,gl:1.5,T:11.5,l:0,r:0,tp:1},{p:3,pr:.75,g:5,gl:1,T:10.5,curve:6.5,cv:.09,r:.5,l:.5,tp:1.5},
  {p:3,pr:.5,g:5,gl:1.5,T:11,jag:1,r:.5,l:.5,tp:1.2},{p:3,pr:.75,g:5.5,gl:2,T:12,r:.5,l:0,tp:1,wave:1},{p:2.5,pr:.75,g:5,gl:1,T:13,l:0,r:0,tp:1}][t];
  if(t===2)S.bk='B';if(t===3)S.bk='E';
  icSword(b,S);const o={};
  if(t===4){icPt(b,S.g,0,'G');o.spark=[[12,2]];}
  if(t===2)icPt(b,S.g,0,'G');
  if(t===5){icPt(b,S.g,-1.5,'G');icPt(b,S.g,1.5,'G');icUV(b,'X',(s,v)=>s>6&&s<12&&Math.abs(v)<.01);o.aura='#b06aff';o.spark=[[13,2]];}
  return o;};
ICF.greatsword=(b,t)=>{const S=[{p:.5,pr:.5,g:3.5,gl:1.5,T:14,l:.5,r:.5,gw2:1},{p:.5,pr:.75,g:3.5,gl:2,T:14,l:.5,r:.5,gw2:1,rk:2},{p:.5,pr:.75,g:3.5,gl:2,T:14.5,l:.5,r:1,ful:'m',gw2:1},
  {p:.5,pr:1,g:4,gl:2.5,T:14.5,l:1,r:1,tp:.8,ful:'T',gw2:1},{p:.5,pr:1,g:4,gl:2.5,T:15,l:.5,r:1,jag:1,ful:'E',gw2:1},{p:.5,pr:1,g:4,gl:3,T:15,l:1,r:1,tp:.7,ful:'G',gw2:1}][t];
  icSword(b,S);const o={};
  if(t===1){icPt(b,S.g+2,-1,'M');icPt(b,S.g+2,1,'M');}
  if(t>=3)icPt(b,S.g,0,'G');
  if(t>=4){o.spark=[[14,1]];}
  if(t===5){icUV(b,'',(s,v)=>Math.abs(s-9)<.01&&Math.abs(v)<.01);icPt(b,9.5,-.5,'S');o.aura=TIER_GEM[5];}
  return o;};
ICF.axe=(b,t)=>{const top=[11,12,12,12.5,13,13.5][t];icHaft(b,1,top,'W');icHaft(b,1,3.5,'L');const o={};
  const sc=[10,10.5,10.5,11,11,11.5][t],hl=[1.6,2.1,2.1,2.4,2.6,2.6][t],R=[2.2,3,3,3,3.5,3.5][t];
  icUV(b,'M',(s,v)=>{const d=(s-sc)/hl;if(Math.abs(d)>1||v>-.4)return false;const rr=t===1?R:R*Math.sqrt(1-d*d*(t===4?.3:.8));return v>=-rr-.01;});
  if(t===4)icUV(b,'',(s,v)=>Math.abs(s-sc)<.6&&v<-2.4);
  if(t===2)icUV(b,'M',(s,v)=>v>.4&&v<2.1-Math.abs(s-sc)*1.2);
  if(t>=3)icUV(b,'M',(s,v)=>{const d=(s-sc)/(hl*.8);return Math.abs(d)<=1&&v>.4&&v<=(t===5?R:R*.7)*Math.sqrt(1-d*d)+.01;});
  icUV(b,'S',(s,v)=>t>=1&&Math.abs(s-sc)<1.1&&(Math.abs(v+R)<.3||(t>=3&&Math.abs(v-(t===5?R:R*.7))<.3))&&icGet(b,...icAt(s,v))==='M');
  if(t>=2)icPt(b,sc,0,'G');
  if(t>=3)icPt(b,top+.5,0,'T');
  if(t>=4)o.spark=[[13,1]];
  if(t===5){o.aura=TIER_GEM[5];icPt(b,sc,-1,'T');icPt(b,sc,1,'T');}
  return o;};
ICF.mace=(b,t)=>{const o={};
  if(t===1){icHaft(b,1,7,'W');icHaft(b,1,3,'L');[[8,.5],[9,0],[10,.5]].forEach(([s,v])=>icPt(b,s,v,'m'));icDisc(b,12,4,2.2,'M');icPt(b,12,4,'m');icSet(b,12,1,'M');icSet(b,15,4,'M');icSet(b,12,7,'M');icSet(b,9,4,'M');return o;}
  icHaft(b,1,[10,0,11,11,11.5,12][t],'W');icHaft(b,1,3.5,'L');
  if(t===0){icDisc(b,11.5,3.5,2.5,'M');icSet(b,11,3,'S');}
  if(t===2){icUV(b,'M',(s,v)=>Math.abs(s-11)<=1.01&&Math.abs(v)<=2.51);icUV(b,'m',(s,v)=>Math.abs(s-11)<.01&&Math.abs(v)<=2.51);}
  if(t===3){icDisc(b,11.5,3.5,2.3,'M');[[11,0],[14,3],[11,6],[8,3],[14,0],[9,1],[14,6],[9,6]].slice(0,6).forEach(([a,c])=>icSet(b,a+(a>11?0:0),c,'T'));icSet(b,11,3,'G');}
  if(t===4){icUV(b,'M',(s,v)=>Math.abs(s-11.5)<=1.51&&Math.abs(v)<=2.51);icArt(b,10,2,['.E.','EE.','.EE','.E.']);o.spark=[[14,1]];}
  if(t===5){icUV(b,'M',(s,v)=>Math.abs(s-12)<=1.51&&Math.abs(v)<=3.01&&!(Math.abs(s-12)>1&&Math.abs(v)>2.4));icPt(b,12,0,'G');icPt(b,12,-2,'T');icPt(b,12,2,'T');icPt(b,10,0,'T');o.aura=TIER_GEM[5];o.spark=[[14,0]];}
  if(t>=2&&t!==4)icPt(b,9.5,.5,'T');
  return o;};
ICF.lance=(b,t)=>{const o={};const ts=[11,10.5,10.5,10.5,10,10][t];icHaft(b,0,ts,'W');icHaft(b,0,3,'L');
  const tl=[3,4,3.5,4,4.5,5][t],tw=[.6,.9,1.2,.8,.7,1][t];
  icUV(b,'M',(s,v)=>{if(s<ts||s>ts+tl)return false;const f=t===2?Math.sin(Math.PI*(s-ts)/tl)*1.3:(ts+tl-s)/tl;return Math.abs(v)<=tw*f*1.5+.01;});
  if(t===1)icUV(b,'M',(s,v)=>s>=3&&s<=4.5&&Math.abs(v)<=(4.6-s)*1.2+.01);
  if(t===2){icPt(b,ts-.5,1.5,'C');icPt(b,ts-1,2,'C');icPt(b,ts-1.5,2.5,'C');}
  if(t===3)icUV(b,'M',(s,v)=>Math.abs(s-(ts+.5))<=.5&&Math.abs(v)<=2.01);
  if(t===4){icUV(b,'M',(s,v)=>s>=ts&&s<=ts+2.5&&Math.abs(Math.abs(v)-1.5)<.01);icUV(b,'M',(s,v)=>Math.abs(s-ts)<=.5&&Math.abs(v)<=1.51);o.spark=[[14,0]];}
  if(t===5){icUV(b,'T',(s,v)=>Math.abs(s-ts)<=.5&&Math.abs(v)<=2.01);icPt(b,ts,0,'G');icPt(b,ts+2,0,'S');o.aura=TIER_GEM[5];}
  if(t>=3)icPt(b,ts-.5,.5,'T');
  if(t>=2&&t<5)icPt(b,ts,0,'G');
  return o;};
ICF.staff=(b,t)=>{const o={};const top=[11,10.5,10,10,10,10][t];icHaft(b,1,top,'W');
  if(t===0){icDisc(b,12,3,1.9,'W');icSet(b,11,2,'w');icSet(b,13,4,'w');}
  if(t===1){icArt(b,9,0,['..MMM.','.M...M','M.....','M.....','.M....']);icSet(b,13,3,'G');icSet(b,14,1,'S');}
  if(t===2){icArt(b,10,1,['T...T','.GGG.','.GGG.','TGGG.','..T..']);icSet(b,11,2,'S');}
  if(t===3){icArt(b,9,0,['..MMMM','.M...M','.M.G.M','.M..M.','..M...']);icSet(b,12,0,'S');}
  if(t===4){icArt(b,10,0,['...E.','..EEE','.EGGE','.EGE.','..T..','.T.T.']);icSet(b,12,2,'S');o.spark=[[15,0]];}
  if(t===5){icArt(b,9,0,['.TTTT.','T....T','T.GG.T','T.GG.T','T....T','.TTTT.']);icSet(b,11,2,'S');o.aura=TIER_GEM[5];o.spark=[[14,0],[8,1]];}
  if(t>=2)icPt(b,top-.5,.5,'T');
  if(t>=3)icPt(b,3,0,'T');
  return o;};
ICF.qstaff=(b,t)=>{const o={};icHaft(b,.5,14.5,'W');
  const caps=[[1,14],[1,14],[1,1.5,13.5,14],[.5,1.5,13.5,14.5],[.5,1,14,14.5],[.5,1.5,13.5,14.5]][t];
  caps.forEach(s=>{icPt(b,s,0,'M');icPt(b,s,.5,'M');});
  if(t>=1){[5,10].forEach(s=>{icPt(b,s,0,'L');icPt(b,s,.5,'L');icPt(b,s+.5,0,'L');icPt(b,s+.5,.5,'L');});}
  if(t===2)icUV(b,'M',(s,v)=>s>6&&s<9&&v>-.01&&v<.51);
  if(t===3){icPt(b,7.5,-.5,'E');icPt(b,8,1,'E');icPt(b,7.5,.5,'G');}
  if(t===4){icUV(b,'E',(s,v)=>s>3&&s<12&&Math.abs(v-(Math.floor(s)%2?-.5:1))<.01);o.spark=[[15,0]];}
  if(t===5){icPt(b,7.5,.5,'G');icPt(b,7.5,-.5,'T');icPt(b,7.5,1.5,'T');icPt(b,14.5,0,'G');icPt(b,1,0,'G');o.aura=TIER_GEM[5];}
  return o;};
ICF.tome=(b,t,P)=>{const o={};const cov=['#7a4a2a','#3a7a4a','#2a4a8a','#2a5a7a','#3a3a6a','#4a1a2a'][t];P.C=cov;P.K=shade(cov,.7);
  icRect(b,3,2,10,12,'C');icRect(b,3,2,2,12,'K');icRect(b,12,3,1,10,'P');icRect(b,4,13,8,1,'P');
  if(t===0){icRect(b,8,2,1,12,'L');}
  if(t===1){icArt(b,7,5,['..M.','.MM.','MMM.','.M..'.replace('M','W')]);icArt(b,7,5,['..G.','.GG.','GGM.','.M..']);}
  if(t===2){icArt(b,5,2,['T......T'.slice(0,7)]);icSet(b,11,2,'T');icSet(b,11,13,'T');icSet(b,5,13,'T');icArt(b,7,6,['.T.','TGT','.T.']);}
  if(t===3){icArt(b,6,5,['..TT.','.T..T','T.GG.','.T...','..TTT']);}
  if(t===4){icRect(b,5,2,7,1,'T');icRect(b,5,13,7,1,'T');icArt(b,6,5,['.TTT.','TSGGT','TGGGT','.TTT.']);icRect(b,3,7,2,2,'T');o.spark=[[13,1]];}
  if(t===5){icRect(b,5,2,7,1,'T');icRect(b,5,13,7,1,'T');icArt(b,6,4,['..T..','.TGT.','TGSGT','.TGT.','..T..']);icSet(b,6,11,'S');icSet(b,10,11,'S');o.aura=TIER_GEM[5];}
  return o;};
ICF.bow=(b,t)=>{const o={};const ax=y=>Math.round(3+Math.pow((y-7.5)/7.5,2)*5);
  for(let y=0;y<16;y++){const x=ax(y);icSet(b,x,y,'W');icSet(b,x+1,y,'W');}
  for(let y=1;y<15;y++)icSet(b,10,y,'R');icRect(b,3,7,2,2,'L');
  if(t>=1){icSet(b,9,0,'T');icSet(b,9,15,'T');}
  if(t===2){icArt(b,5,0,['FF','.F']);icArt(b,5,14,['.F','FF']);icSet(b,4,3,'F');icSet(b,4,12,'F');}
  if(t===3){icArt(b,2,3,['E','.','.','.','.','.','.','.','.','E']);icSet(b,1,7,'E');icSet(b,1,8,'E');icSet(b,3,8,'G');}
  if(t===4){icArt(b,5,0,['FFF','F..']);icArt(b,5,14,['F..','FFF']);icLine(b,1,8,13,8,'W');icArt(b,13,7,['M.','MM','M.']);icSet(b,1,7,'F');icSet(b,1,9,'F');icSet(b,3,7,'G');o.spark=[[15,8]];}
  if(t===5){icDisc(b,4,7.5,2.2,'T');icRect(b,3,7,2,2,'G');icSet(b,3,7,'S');icSet(b,9,0,'G');icSet(b,9,15,'G');o.aura=TIER_GEM[5];o.spark=[[8,1],[8,14]];}
  return o;};
ICF.longbow=(b,t)=>{const o={};const ax=y=>Math.round(4+Math.pow((y-7.5)/7.5,2)*3);for(let y=0;y<16;y++){const x=ax(y);icSet(b,x,y,'W');if(t>=2||(y>3&&y<12))icSet(b,x+1,y,'W');}
  for(let y=1;y<15;y++)icSet(b,8,y,'R');icRect(b,4,7,2,2,'L');
  if(t>=1){icLine(b,2,8,13,8,'W');icArt(b,13,7,['M.','MM','M.']);icSet(b,2,7,'F');icSet(b,2,9,'F');icSet(b,1,8,'F');icSet(b,8,8,'R');}
  if(t===2){icSet(b,8,0,'F');icSet(b,8,15,'F');icSet(b,9,0,'F');icSet(b,9,15,'F');}
  if(t===3){icSet(b,8,0,'E');icSet(b,8,15,'E');icSet(b,3,3,'E');icSet(b,3,12,'E');icSet(b,4,7,'G');}
  if(t===4){icArt(b,6,0,['FFF','.F.']);icArt(b,6,14,['.F.','FFF']);icSet(b,4,7,'G');icRect(b,1,7,1,3,'F');o.spark=[[15,8]];}
  if(t===5){icDisc(b,4.5,7.5,1.8,'T');icRect(b,4,7,2,2,'G');icSet(b,4,7,'S');icSet(b,13,8,'G');o.aura=TIER_GEM[5];o.spark=[[9,0],[9,15]];}
  return o;};
ICF.crossbow=(b,t)=>{const o={};icRect(b,7,3,2,12,'W');icRect(b,7,12,2,3,'L');
  const pw=[5,6,6,6,7,7][t];icRect(b,8-pw,4,pw*2,1,'M');icSet(b,8-pw,5,'M');icSet(b,7+pw,5,'M');
  icLine(b,9-pw,5,7,8,'R');icLine(b,6+pw,5,8,8,'R');icRect(b,7,1,2,3,'M');icSet(b,7,0,'S');
  if(t===1){icRect(b,6,1,4,1,'M');icSet(b,6,10,'M');icSet(b,9,10,'M');}
  if(t===2){icRect(b,8-pw,6,pw*2,1,'M');icSet(b,8-pw,7,'M');icSet(b,7+pw,7,'M');icSet(b,8,9,'G');}
  if(t===3){icRect(b,7,0,2,1,'E');icSet(b,6,1,'E');icSet(b,9,1,'E');icSet(b,8,9,'G');}
  if(t===4){icArt(b,6,7,['..E.','.EE.','..EE','..E.']);icSet(b,1,3,'T');icSet(b,14,3,'T');o.spark=[[8,0]];}
  if(t===5){icRect(b,8-pw,3,pw*2,1,'T');icSet(b,1,5,'G');icSet(b,14,5,'G');icSet(b,8,9,'G');icRect(b,6,12,4,1,'T');o.aura=TIER_GEM[5];}
  return o;};
const IC_FIST=['..AA.AA.AA.AA.','.AAAAAAAAAAAAA','.AAAAAAAAAAAAA','BBAAAAAAAAAAAA','BBBBBBBBBBBBB.','BBBBBBBBBBBBB.','.BBBBBBBBBBB..','..CCCCCCCCC...','..CCCCCCCCC...'];
ICF.knuckles=(b,t,P,o0,map)=>{const o={};const M=map||[{A:'C',B:'C',C:'K'},{A:'M',B:'L',C:'C'},{A:'M',B:'L',C:'M'},{A:'M',B:'M',C:'T'},{A:'M',B:'M',C:'T'},{A:'M',B:'m',C:'T'}][t];
  icArt(b,1,4,IC_FIST,M);
  [4,7,10].forEach(x=>{icSet(b,x,5,M.A.toLowerCase());icSet(b,x,6,M.A.toLowerCase());});icSet(b,3,7,M.B.toLowerCase());icSet(b,4,7,M.B.toLowerCase());
  if(t===0||map){for(let x=3;x<14;x+=3){icSet(b,x,5,'K');icSet(b,x-1,8,'K');icSet(b,x,9,'K');}}
  
  if(t===2&&!map)[3,6,9,12].forEach(x=>icSet(b,x,3,'M'));
  if(t===3)icSet(b,7,8,'G');
  if(t===4){icArt(b,6,7,['.E.','EE.','.EE']);icArt(b,11,11,['TT','.T']);o.spark=[[14,2]];}
  if(t===5){[3,6,9,12].forEach(x=>icSet(b,x,4,'G'));icSet(b,7,8,'G');icSet(b,8,8,'S');o.aura=TIER_GEM[5];}
  return o;};
ICF.claws=(b,t)=>{const o={};const n=[3,3,3,3,4,4][t],len=[8,9,9,10,10,11][t];
  icRect(b,2,11,12,3,'L');icRect(b,2,11,12,1,'M');
  for(let i=0;i<n;i++){const x0=(n===3?3+i*4:2+i*3.5)|0;for(let k=0;k<len;k++){const y=10-k,cx=x0+Math.round(t>=2?Math.pow(k/len,2)*3:k*.15);icSet(b,cx,y,'M');if(k<len-2+(t===1?1:0))icSet(b,cx+1,y,'M');}}
  if(t===2)[3,7,11].forEach(x=>icSet(b,x+1,10,'G'));
  if(t===3)icRect(b,2,13,12,1,'E');
  if(t===4){icRect(b,2,12,12,1,'T');o.spark=[[14,0]];}
  if(t===5){icRect(b,2,12,12,1,'T');[4,8,11].forEach(x=>icSet(b,x,12,'G'));o.aura=TIER_GEM[5];}
  if(t>=3)icSet(b,8,12,'G');
  return o;};
ICF.lute=(b,t,P)=>{const o={};icDisc(b,6,10,[3.6,3.6,3.8,3.6,3.8,4][t],'W');icDisc(b,6.3,9.7,1.1,'X');
  icUV(b,'w',(s,v)=>s>8.5&&s<13&&v>-.01&&v<.51);icUV(b,'M',(s,v)=>s>=13&&s<14.5&&v>-.51&&v<.51);
  icSet(b,4,12,'m');icSet(b,8,12,'m');
  if(t===1){icSet(b,6,13,'T');icSet(b,2,10,'T');}
  if(t===2){icRect(b,3,13,7,1,'M');icSet(b,6,6,'M');}
  if(t===3){icArt(b,2,12,['E...E','.E.E.']);icSet(b,6,13,'G');}
  if(t===4){icDisc(b,6.3,9.7,1.1,'E');icSet(b,6,10,'G');o.spark=[[15,0]];icSet(b,2,7,'T');icSet(b,10,7,'T');}
  if(t===5){icRect(b,2,10,1,1,'T');icRect(b,10,10,1,1,'T');icSet(b,6,14,'T');icSet(b,6,9,'G');icSet(b,6,10,'S');o.aura=TIER_GEM[5];}
  return o;};
ICF.harp=(b,t)=>{const o={};icLine(b,3,2,3,13,'W');icLine(b,3,2,12,4,'W');icLine(b,12,4,10,13,'W');icLine(b,3,13,10,13,'W');icSet(b,4,13,'W');
  for(let x=5;x<11;x+=2)icLine(b,x,3+((x-3)*2/9|0),x,12,'R');
  if(t===1){icRect(b,2,1,2,2,'M');icSet(b,12,3,'M');}
  if(t===2){icArt(b,12,1,['TT','.T','.T']);icSet(b,3,8,'G');}
  if(t===3){icArt(b,11,2,['EE','E.']);icSet(b,3,8,'G');icRect(b,2,13,2,2,'T');}
  if(t===4){icArt(b,0,0,['.TT.','TGGT','.TT.']);icSet(b,13,4,'T');o.spark=[[14,2]];icSet(b,2,8,'E');}
  if(t===5){icArt(b,1,0,['.T.','TGT','.T.']);icArt(b,11,12,['TT','TG']);icSet(b,3,8,'G');o.aura=TIER_GEM[5];}
  return o;};
ICF.flute=(b,t,P)=>{const o={};
  if(t===2){[0,1,2,3,4,5].forEach(i=>icRect(b,3+i*2,4+i,2,9-i,'W'));icRect(b,3,9,12,1,'L');return o;}
  if(t===3){icArt(b,3,4,['...MMMM...','..MMMMMMM.','.MMXMXMXMM','MMMMMMMMM.','.MMMMMMM..','..MMMM....']);icSet(b,12,5,'G');return o;}
  const k=t===0?'B':'M';icUV(b,k,(s,v)=>s>1&&s<14&&v>-.51&&v<.51);
  [5,7,9,11].forEach(s=>icPt(b,s,0,'X'));
  if(t===0){icPt(b,1.5,-.5,'B');icPt(b,1.5,.5,'B');icPt(b,13.5,.5,'B');}
  if(t===1){icPt(b,13.5,.5,'T');icPt(b,2,.5,'T');}
  if(t===4){icUV(b,'E',(s,v)=>s>1&&s<14&&Math.abs(v+.5)<.01);[5,7,9,11].forEach(s=>icPt(b,s,0,'X'));icPt(b,3,0,'G');o.spark=[[14,1]];}
  if(t===5){icPt(b,13.5,-.5,'T');icPt(b,13.5,1,'T');icPt(b,14,0,'G');icPt(b,3,0,'G');icPt(b,2,-1,'T');o.aura=TIER_GEM[5];}
  return o;};
// ----- v0.8.2 role weapons: throwing stars and kunai, prayer beads, wands, censers, warhammers, war standards, lyres -----
const IC_STAR=['......M......','.....MMM.....','.....MMM.....','....MMMMM....','...MMMMMMM...','.MMMMMMMMMMM.','MMMMMMXMMMMMM','.MMMMMMMMMMM.','...MMMMMMM...','....MMMMM....','.....MMM.....','.....MMM.....','......M......'];
function icKunai(b,mir,s0){const tmp=icBuf();icSword(tmp,{p:s0||2,pr:.9,g:5,gl:.5,T:13,wide:1.1,l:.5,r:.5,tp:1.2});icUV(tmp,'',(s,v)=>Math.abs(s-(s0||2))<.01&&Math.abs(v)<.01);
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const k=tmp[y*16+x];if(k)icSet(b,mir?15-x:x,y,k);}}
ICF.thrown=(b,t)=>{const o={};
  if(t===0){icArt(b,1,1,IC_STAR);}
  if(t===1){icKunai(b,0);icPt(b,8,0,'m');}
  if(t===2){icArt(b,1,1,IC_STAR);icLine(b,3,3,5,5,'M');icLine(b,13,3,11,5,'M');icLine(b,3,13,5,11,'M');icLine(b,13,13,11,11,'M');icSet(b,7,7,'G');}
  if(t===3){icKunai(b,0);icKunai(b,1);icSet(b,7,7,'G');icSet(b,8,8,'E');}
  if(t===4){icArt(b,1,1,IC_STAR);[[5,5],[11,5],[5,11],[11,11]].forEach(([x,y])=>icSet(b,x,y,'T'));icRect(b,6,6,3,3,'T');icSet(b,7,7,'G');icSet(b,7,0,'E');icSet(b,7,14,'E');o.spark=[[14,1]];}
  if(t===5){icKunai(b,0);icKunai(b,1);icRect(b,7,1,2,9,'M');icRect(b,7,0,2,1,'S');icSet(b,7,10,'T');icSet(b,8,10,'T');icRect(b,7,11,2,3,'L');icSet(b,7,7,'G');icSet(b,8,7,'G');o.aura=TIER_GEM[5];}
  return o;};
ICF.beads=(b,t,P)=>{const o={};const n=[10,12,12,14,14,16][t],r=[4.6,4.6,5,5,5.4,5.4][t],cy=[7,7,6.5,6.5,6.5,6.5][t];
  for(let i=0;i<n;i++){const a=Math.PI/2+i*2*Math.PI/n;icSet(b,8+Math.cos(a)*r,cy+Math.sin(a)*r,t>=2&&i%3===0?'G':i%2?'w':'W');}
  icSet(b,8,cy+r+1,'M');
  if(t===0)icLine(b,8,13,8,15,'C');
  if(t===1){icLine(b,8,13,8,15,'C');icSet(b,7,15,'C');icSet(b,9,15,'C');icSet(b,8,13,'T');}
  if(t===2){icRect(b,7,12,3,2,'M');icLine(b,7,14,6,15,'C');icLine(b,9,14,10,15,'C');}
  if(t===3){icRect(b,7,12,3,3,'T');icSet(b,8,13,'G');icSet(b,8,15,'C');icDisc(b,8,6.5,1.5,'');for(let i=0;i<6;i++){const a=i*Math.PI/3;icSet(b,8+Math.cos(a)*2.2,6.5+Math.sin(a)*2.2,'m');}}
  if(t===4){icArt(b,6,12,['.TTT.','TGEGT','.TTT.']);icSet(b,8,15,'C');o.spark=[[14,1]];}
  if(t===5){icArt(b,6,12,['.TTT.','TGSGT','TGGGT','.TTT.']);icSet(b,8,0,'T');o.aura=TIER_GEM[5];o.spark=[[14,2]];}
  return o;};
ICF.wand=(b,t,P)=>{const o={};const hk=['W','B','W','M','T','X'][t],top=[10,10,9.5,9.5,9.5,9][t];icHaft(b,2,top,hk);icHaft(b,2,4,'L');
  const [tx,ty]=icAt(top+1.5,0);
  if(t===0){icDisc(b,tx,ty,1.3,'W');icSet(b,tx,ty,'w');}
  if(t===1){icArt(b,tx-1,ty-1,['BBB','XBX','.B.']);icSet(b,tx+1,ty-2,'B');}
  if(t===2){[[5,.5],[7,0],[9,.5]].forEach(([s2,v])=>icPt(b,s2,v,'w'));icArt(b,tx-1,ty-1,['M.M','.G.','M.M']);}
  if(t===3){icArt(b,tx-1,ty-2,['..E','.EE','EEE','.E.']);icSet(b,tx,ty,'S');}
  if(t===4){icDisc(b,tx,ty,1.6,'G');icSet(b,tx,ty-1,'S');icArt(b,tx-3,ty-3,['E..','.E.']);icSet(b,tx+2,ty+2,'E');o.spark=[[15,0]];}
  if(t===5){icArt(b,tx-2,ty-2,['.TTT.','T...T','T.G.T','T...T','.TTT.']);icSet(b,tx,ty,'G');o.aura='#b06aff';o.spark=[[14,0]];}
  if(t>=2)icPt(b,4.5,.5,'T');
  return o;};
ICF.censer=(b,t,P)=>{const o={};const cy=[9,9,9.5,9,9,9.5][t],r=[3,3.2,3.4,3.5,3.6,3.8][t];
  icLine(b,8,0,8,Math.round(cy-r-1),'m');[1,3].forEach(y=>icSet(b,7,y,'M'));
  icDisc(b,8,cy,r,'M');icRect(b,8-Math.round(r),Math.round(cy)-1,Math.round(r)*2+1,1,'m');
  [[7,Math.round(cy)+1],[9,Math.round(cy)+1]].forEach(([x,y])=>icSet(b,x,y,'X'));
  if(t>=1)icRect(b,6,Math.round(cy+r)+1,5,1,'M');
  if(t===2){icSet(b,3,Math.round(cy),'M');icSet(b,13,Math.round(cy),'M');icSet(b,3,Math.round(cy)-1,'M');icSet(b,13,Math.round(cy)-1,'M');}
  if(t===3){icArt(b,6,Math.round(cy-r)-1,['.TTT.','TTGTT']);}
  if(t===4){icArt(b,11,1,['.E','E.','.E','E.']);icArt(b,3,2,['E.','.E','E.']);icSet(b,8,Math.round(cy),'G');o.spark=[[14,0]];}
  if(t===5){icArt(b,5,Math.round(cy-r)-1,['.TTTTT.','TTTGTTT']);icArt(b,11,1,['.S','E.','.E']);icSet(b,3,Math.round(cy),'T');icSet(b,13,Math.round(cy),'T');o.aura=TIER_GEM[5];}
  return o;};
ICF.warhammer=(b,t)=>{const o={};const top=[11,11.5,11.5,12,12,12.5][t];icHaft(b,1,top,'W');icHaft(b,1,3.5,'L');
  const hs=[10,10.5,10.5,11,11,11][t],hw=[1,1.2,1.5,1.5,1.5,1.8][t],face=[2,2.5,2.5,3,3,3][t],spk=[1.5,2,2.5,3,3,3.5][t];
  icUV(b,'M',(s,v)=>Math.abs(s-hs)<=hw+.01&&v<=0.01&&v>=-face-.01);
  icUV(b,'M',(s,v)=>v>0&&v<=spk+.01&&Math.abs(s-hs)<=hw*(1-v/(spk+1))+.01);
  icUV(b,'m',(s,v)=>Math.abs(v+face)<.01&&Math.abs(s-hs)<=hw+.01);
  if(t>=2)icPt(b,hs,0,'G');
  if(t>=3)icPt(b,top+.5,0,'T');
  if(t===3)icPt(b,hs,-1,'T');
  if(t>=4){icUV(b,'E',(s,v)=>Math.abs(s-hs)<.01&&v<-.9&&v>-face+.5);o.spark=[[14,1]];}
  if(t===5){icPt(b,hs+hw,-1,'T');icPt(b,hs-hw,-1,'T');o.aura=TIER_GEM[5];}
  return o;};
ICF.standard=(b,t,P)=>{const o={};const cl=['#8a7a5a','#c84a3a','#4a6ad0','#e0b030','#5aa0d0','#8a3ad0'][t];P.C=cl;P.K=shade(cl,.7);
  icRect(b,4,2,1,14,'W');icRect(b,4,13,1,3,'L');icArt(b,3,0,['.M.','MMM']);
  const F=[['CCCCCCC','CCCCCC.','CCCCC..','CCCC...','CCC....'],
    ['CCCCCCCC','CCCCCCCC','CCCCCCCC','CCCCCCC.','CCCCCC..'],
    ['CCCCCCCCC','CCCCCCCCC','CCCCCCCCC','CCCC.CCCC','CCC...CCC'],
    ['CCCCCCCCC','CCCCCCCCC','CCCCCCCCC','CCCCCCCCC','CCCCCCCCC','C.C.C.C.C'],
    ['CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCC..CCCC'],
    ['CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','C.CC..CC.C']][t];
  icArt(b,5,2,F);icRect(b,5,2,F[0].length,1,'K');
  if(t===1)icSet(b,8,4,'T');
  if(t===2){icArt(b,8,3,['.T.','TGT','.T.']);}
  if(t===3){icArt(b,8,3,['TTT','TGT','.T.']);icRect(b,5,2,9,1,'T');}
  if(t===4){icArt(b,8,3,['.E.','EE.','.EE','.E.']);icRect(b,5,2,10,1,'T');icSet(b,4,0,'S');o.spark=[[15,1]];}
  if(t===5){icArt(b,7,3,['..T..','.TGT.','TGSGT','.TGT.']);icRect(b,5,2,10,1,'T');icSet(b,3,1,'G');icSet(b,5,1,'G');o.aura=TIER_GEM[5];}
  return o;};
ICF.lyre=(b,t,P)=>{const o={};const w=[3,3,4,4,4,5][t];
  icLine(b,8-w,2,8-w+1,11,'W');icLine(b,8+w,2,8+w-1,11,'W');icRect(b,8-w+1,11,2*w-1,2,'W');icRect(b,8-w,3,2*w+1,1,'M');
  for(let x=8-w+2;x<=8+w-2;x+=2)icLine(b,x,4,x,10,'R');
  icSet(b,8-w-1,1,'W');icSet(b,8+w+1,1,'W');
  if(t===1){icSet(b,8-w-1,0,'T');icSet(b,8+w+1,0,'T');}
  if(t===2){icRect(b,7,13,3,1,'M');icSet(b,8,12,'G');}
  if(t===3){icArt(b,8-w-2,0,['E']);icArt(b,8+w+2,0,['E']);icSet(b,8,12,'G');icRect(b,6,13,5,1,'T');}
  if(t===4){icRect(b,8-w,3,2*w+1,1,'T');icSet(b,8,3,'G');icArt(b,6,13,['.EEE.','..E..']);o.spark=[[15,0]];}
  if(t===5){icRect(b,8-w,3,2*w+1,1,'T');icSet(b,8,3,'G');icSet(b,8,12,'S');icArt(b,5,13,['TTTTTTT','..TGT..']);o.aura=TIER_GEM[5];}
  return o;};
ICF.stick=(b,t,P,o0)=>{const o={};icHaft(b,1.5,13.5,'W');icPt(b,9,-1,'W');icPt(b,9.5,-1.5,'W');icPt(b,6,1,'W');icPt(b,6.5,1.5,'w');icPt(b,4,0,'w');
  if(o0.glow){P.E=o0.glow;icPt(b,13.5,0,'E');icPt(b,14,.5,'E');icPt(b,10,-2,'E');o.aura=o0.glowTier>0?o0.glow:null;o.spark=o0.glowTier>1?[[15,0]]:null;}
  return o;};
// ----- armor (upright) -----
ICF.mail=(b,t)=>{const o={};
  const body=['.MMM....MMM.','MMMMM..MMMMM','MMMMMMMMMMMM','MMMMMMMMMMMM','.MMMMMMMMMM.','.MMMMMMMMMM.','.MMMMMMMMMM.','..MMMMMMMM..','..MMMMMMMM..','...MMMMMM...'];
  icArt(b,2,3,body,t===0?{M:'L'}:null);
  if(t===0){icRect(b,7,5,2,7,'l');[[5,6],[10,6],[5,9],[10,9]].forEach(([a,c])=>icSet(b,a,c,'T'));}
  if(t===1){for(let y=5;y<12;y+=2)for(let x=4;x<12;x+=2)icSet(b,x+(y%4===1?1:0),y,'m');icRect(b,4,11,8,1,'L');}
  if(t===2){icRect(b,3,7,10,1,'m');icRect(b,4,10,8,1,'m');icArt(b,7,5,['GG']);icRect(b,4,12,8,1,'L');}
  if(t>=3){icArt(b,0,2,['.TTT','TTTTT','TTTT','.TT']);icArt(b,11,2,['TTT.','TTTTT','.TTTT','..TT'.padStart(5,'.')]);}
  if(t===3){icArt(b,6,6,['.TT.','TGGT','.TT.']);icRect(b,4,11,8,1,'T');}
  if(t===4){icArt(b,6,5,['..E.','.EE.','..EE','.E..']);icRect(b,4,11,8,1,'T');icSet(b,8,11,'G');o.spark=[[15,1]];}
  if(t===5){icArt(b,5,5,['..T..','.TGT.','TGSGT','.TGT.','..T..']);icRect(b,4,11,8,1,'T');icSet(b,1,3,'G');icSet(b,14,3,'G');o.aura=TIER_GEM[5];}
  return o;};
ICF.robe=(b,t,P)=>{const o={};const cl=['#c8b890','#a8d8a8','#4a6ad0','#9ad0e8','#d8e4f8','#2a1a3a'][t];P.C=cl;P.K=shade(cl,.72);
  icArt(b,3,1,['..CCCCCC..','.CCC..CCC.','CCCCKKCCCC','CC.CCCC.CC','CC.CCCC.CC','C..CCCC..C','...CCCC...','..CCCCCC..','..CCCCCC..','.CCCCCCCC.','.CCCCCCCC.','CCCCCCCCCC','CCCCCCCCCC']);
  if(t===0)icRect(b,6,7,4,1,'L');
  if(t===1){icRect(b,6,7,4,1,'T');icRect(b,7,8,1,5,'K');}
  if(t===2){icRect(b,6,7,4,1,'T');icRect(b,7,8,2,6,'T');icSet(b,7,7,'G');}
  if(t===3){icRect(b,6,7,4,1,'T');icArt(b,5,10,['E.EE.E','.E..E.']);icSet(b,7,3,'G');}
  if(t===4){icRect(b,6,7,4,1,'T');icRect(b,3,13,10,1,'T');icArt(b,7,9,['.E','EE','E.']);icSet(b,7,7,'G');icSet(b,8,7,'G');o.spark=[[14,1]];}
  if(t===5){icRect(b,6,7,4,1,'T');icRect(b,3,13,10,1,'T');[[5,10],[9,11],[7,12],[10,9]].forEach(([a,c])=>icSet(b,a,c,'S'));icSet(b,7,7,'G');icSet(b,8,7,'G');icArt(b,5,1,['TT..TT']);o.aura=TIER_GEM[5];}
  return o;};
ICF.vest=(b,t,P)=>{const o={};const cl=['#9a7a4a','#5a7a4a','#5aa08a','#a0c8e0','#e0c870','#4a3a6a'][t];P.C=cl;P.K=shade(cl,.72);
  icArt(b,3,2,['.CC....CC.','CCCC..CCCC','CCCCCCCCCC','.CCCCCCCC.','.CCCCCCCC.','.CCCCCCCC.','.CCCCCCCC.','.CCCCCCCC.','.CCCCCCCC.','..CCCCCC..']);
  icRect(b,7,4,2,8,'K');
  if(t===0){icSet(b,5,7,'L');icSet(b,10,7,'L');icRect(b,4,10,8,1,'L');}
  if(t===1){icRect(b,4,9,8,1,'L');icSet(b,8,9,'M');icRect(b,4,5,2,3,'K');}
  if(t===2){icArt(b,1,3,['F..','FF.','.F.']);icArt(b,12,3,['..F','.FF','.F.']);icRect(b,4,9,8,1,'L');icSet(b,8,9,'G');}
  if(t===3){icRect(b,4,9,8,1,'T');icArt(b,4,5,['E....E','.E..E.']);icSet(b,8,9,'G');}
  if(t===4){icArt(b,0,2,['FF..','.FFF','..F.']);icArt(b,12,2,['..FF','FFF.','.F..']);icRect(b,4,9,8,1,'T');icSet(b,8,9,'G');o.spark=[[14,0]];}
  if(t===5){icArt(b,5,5,['S....','...S.','.S...']);icRect(b,4,9,8,1,'T');icSet(b,8,9,'G');icSet(b,7,9,'G');icArt(b,3,12,['..T..TT..T'.slice(0,10)]);o.aura=TIER_GEM[5];}
  return o;};
// ----- capes -----
ICF.cape=(b,t,P)=>{const o={};P.C=CAPE_COL[t];P.K=shade(CAPE_COL[t],.7);
  const shape=[['....CC....','...CCCC...','..CCCCCC..','..CCCCCC..','.CCCCCCCC.','.CCCCCCCC.','.CCCCCCCC.','CCCCCCCCCC','CCCCCCCCCC','CC.CC.CC.C'],
    ['..CCCCCC..','.CCCCCCCC.','.CCCCCCCC.','.CCCCCCCC.','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','.CCCCCCCC.'],
    ['...KKKK...','..KCCCCK..','..CCCCCC..','.CCCCCCCC.','.CCCCCCCC.','.CCCCCCCC.','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','C.CC.CC.CC'],
    ['..CCCCCC..','.CCCCCCCC.','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','.CC.CC.CC.'],
    ['.TTTTTTTT.','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','TTTTTTTTTT'],
    ['.TTTTTTTT.','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','CCCCCCCCCC','TCTCTCTCTC']][t];
  icArt(b,3,2,shape);
  for(let y=5;y<2+shape.length;y++){icSet(b,6,y,'K');icSet(b,9,y,'K');}
  if(t===0){icSet(b,8,3,'L');}
  if(t===1){icRect(b,5,3,6,1,'K');icSet(b,8,3,'M');}
  if(t===2){icSet(b,7,3,'G');icSet(b,8,3,'G');}
  if(t===3){icRect(b,3,4,10,1,'T');icSet(b,8,4,'G');icSet(b,7,4,'G');}
  if(t===4){icSet(b,5,3,'G');icSet(b,10,3,'G');icArt(b,6,7,['.TT.','TTTT','.TT.']);o.spark=[[14,2]];}
  if(t===5){icSet(b,5,3,'G');icSet(b,10,3,'G');[[5,7],[10,9],[7,11],[8,6]].forEach(([a,c])=>icSet(b,a,c,'S'));o.aura=TIER_GEM[5];}
  return o;};
// ----- silhouette extras: pixels each tier adds outside the family shape (only where the grid is empty), so tiers differ in shape -----
const IC_SIL={
 tome:[[],[[13,6,'M'],[13,7,'M'],[13,8,'M'],[13,9,'M']],[[2,1,'T'],[13,1,'T'],[2,14,'T'],[13,14,'T']],[[9,14,'G'],[9,15,'G'],[10,14,'G'],[10,15,'G']],
   [[7,0,'E'],[8,0,'E'],[7,1,'E'],[8,1,'E'],[13,7,'T'],[13,8,'T']],[[2,1,'G'],[13,1,'G'],[2,14,'G'],[13,14,'G'],[7,1,'T'],[8,1,'T'],[9,14,'T'],[9,15,'T']]],
 bow:[[],[[10,0,'T'],[10,15,'T'],[2,7,'L'],[2,8,'L']]],
 crossbow:[[],[],[],[[1,3,'E'],[14,3,'E'],[7,15,'E'],[8,15,'E']]],
 greatsword:[[],[],[],[],[[4,15,'T'],[5,15,'T'],[0,10,'T'],[0,11,'T']]],
 longbow:[[],[],[],[],[],[[3,0,'G'],[3,15,'G'],[2,1,'G'],[2,14,'G']]],
 knuckles:[[[4,13,'K'],[5,14,'K'],[9,13,'K'],[9,14,'K']],[[0,6,'M'],[0,7,'M'],[0,8,'M'],[0,9,'M']],[],[[2,11,'T'],[2,12,'T'],[1,11,'T'],[1,12,'T']],
   [[12,11,'T'],[12,12,'T'],[13,11,'T'],[13,10,'T']],[[4,3,'G'],[7,3,'G'],[10,3,'G'],[13,3,'G']]],
 qstaff:[[],[],[[5,8,'M'],[7,10,'M'],[8,5,'M'],[10,7,'M']],[],[],[[3,10,'T'],[5,12,'T'],[10,3,'T'],[12,5,'T']]],
 lute:[[],[[12,0,'T'],[11,1,'T'],[15,3,'T'],[14,4,'T']]],
 flute:[[],[[1,11,'T'],[2,12,'T'],[13,2,'T'],[14,3,'T']],[],[],[[10,6,'C'],[10,7,'C'],[11,8,'C'],[9,8,'C']]],
 mail:[[],[[5,13,'m'],[6,13,'m'],[7,13,'m'],[8,13,'m'],[9,13,'m'],[10,13,'m']],[],[],[[0,1,'T'],[1,1,'T'],[14,1,'T'],[15,1,'T']],
   [[4,13,'T'],[5,13,'T'],[6,13,'T'],[7,13,'T'],[8,13,'T'],[9,13,'T'],[10,13,'T'],[11,13,'T']]],
 robe:[[],[[3,7,'C'],[3,8,'C'],[12,7,'C'],[12,8,'C']],[[2,5,'C'],[2,6,'C'],[13,5,'C'],[13,6,'C']],[[4,1,'E'],[11,1,'E'],[3,2,'E'],[12,2,'E']],
   [[2,13,'T'],[13,13,'T'],[2,14,'T'],[13,14,'T'],[1,14,'T'],[14,14,'T']],[[4,14,'T'],[7,14,'T'],[8,14,'T'],[11,14,'T'],[1,9,'S'],[14,11,'S']]],
 vest:[[],[[6,2,'L'],[9,2,'L'],[12,9,'L'],[12,10,'L']],[],[[4,1,'E'],[11,1,'E'],[3,1,'E'],[12,1,'E']]]};
function icSil(b,fam,t){((IC_SIL[fam]||[])[t]||[]).forEach(([x,y,k])=>{if(!icGet(b,x,y))icSet(b,x,y,k);});}
