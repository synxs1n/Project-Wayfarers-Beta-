// ===== Beta v0.4.1 6.4: richer item and equipment sprites =====
// Gear icons keep their 16x16 silhouettes (GICON) but every part now has a role: metal, grip, accent, cloth, page, string or wood.
// Metal is shaded from the tier colour (highlight on the top-left edge, shadow bottom-right), grips get leather wraps, accents carry the
// tier's gem colour (TIER_GEM), and families add their own details: a gem in a sword's guard, an orb on a staff, a rune on a tome, trims on
// armor. The Tamer's Stick keeps its Bestiary-coloured glow. Consumables get their own icons (bottles, feathers, food, scrolls).
// palettes follow the rarity borders (ITEM_TIERS): common iron, uncommon green steel, rare blue steel, epic violet, legendary gold, mythic crimson
const TIER_METAL=['#b8bcc4','#c4dcc8','#a8c8f0','#ccb0f4','#ffd870','#ff9a8a'];
const TIER_GEM=['#d8a060','#5fcf6a','#4a9bff','#b06aff','#ffc83d','#ff4a3a'];
const TIER_TRIM=['#8a6a4a','#b8d0b8','#d0d8e8','#e0d0ff','#ffe9a0','#ffd25a'];
const GROLE={blade:'mxg',dagger:'mxg',staff:'go',tome:'cxx',bow:'wwsw',crossbow:'wmxx',mail:'mtt',robe:'ctt',vest:'ctt',charm:'xmx',axe:'gmm',greatsword:'mxg',
  lance:'mgx',mace:'gmxx',shortsword:'mxg',longbow:'wwsw',knuckles:'mxxx',claws:'mmmg',qstaff:'gxx',lute:'wgx',harp:'wwss',flute:'wxxx',stick:'gww'};
const GRIP='#6a4026',WOOD='#9a6a3a',STR='#e8e0c8';
function paintPart(x,r,role,col,tier){const [a,b,w,h]=r,gem=TIER_GEM[Math.min(5,tier||0)],trim=TIER_TRIM[Math.min(5,tier||0)];
  const base=role==='m'?col:role==='g'?GRIP:role==='w'?WOOD:role==='s'?STR:role==='c'?shade(col,.62):role==='t'?trim:role==='o'?gem:role==='x'?trim:col;
  x.fillStyle=base;x.fillRect(a,b,w,h);
  if(w*h>=3&&role!=='s'){x.fillStyle=tint(base,.38);if(h>=w)x.fillRect(a,b,1,h);else x.fillRect(a,b,w,1);
    x.fillStyle=shade(base,.62);if(h>=w&&w>1)x.fillRect(a+w-1,b,1,h);else if(w>h&&h>1)x.fillRect(a,b+h-1,w,1);}
  if(role==='g'&&h>=3)for(let y=b+1;y<b+h;y+=2){x.fillStyle=shade(GRIP,.7);x.fillRect(a,y,w,1);}
  if(role==='o'){x.fillStyle=tint(gem,.6);x.fillRect(a+1,b,1,1);}
  return base;}
function drawGearIcon(x,fam,col,tier,glow){
  col=TIER_METAL[Math.min(5,tier||0)];
  const P=GICON[fam]||GICON.charm,R=GROLE[fam]||'',g=TIER_GEM[Math.min(5,tier||0)];
  P.forEach(([a,b,w,h])=>{x.fillStyle=OUTC;x.fillRect(a-1,b-1,w+2,h+2);});
  if(fam==='stick'){P.forEach(([a,b,w,h],i)=>{x.fillStyle=i?'#8a5a2a':'#a8784a';x.fillRect(a,b,w,h);x.fillStyle='#c89a6a';x.fillRect(a,b,1,h);});
    if(glow){x.fillStyle=glow;x.fillRect(7,1,2,2);x.fillStyle=tint(glow,.6);x.fillRect(7,1,1,1);}return;}
  P.forEach((r,i)=>paintPart(x,r,R[i]||(i?'x':'m'),col,tier));
  // family details
  const px=(a,b,c)=>{x.fillStyle=c;x.fillRect(a,b,1,1);};
  if(['blade','greatsword','shortsword','dagger'].includes(fam)){const gd=P[1];px(gd[0]+Math.floor(gd[2]/2)-0,gd[1],g);px(P[0][0],P[0][1],tint(col,.7));if(tier>=3)px(P[0][0]+1,P[0][1]+Math.floor(P[0][3]/2),tint(g,.4));}
  if(fam==='tome'){x.fillStyle=g;x.fillRect(7,6,2,4);x.fillStyle=tint(g,.5);x.fillRect(7,6,1,1);}
  if(fam==='mail'||fam==='vest'||fam==='robe'){const r=P[0];x.fillStyle=TIER_TRIM[Math.min(5,tier)];x.fillRect(r[0],r[1]+Math.floor(r[3]/2),r[2],1);px(r[0]+Math.floor(r[2]/2),r[1]+1,g);
    if(fam==='mail')for(let yy=r[1]+2;yy<r[1]+r[3]-1;yy+=2)for(let xx=r[0]+1;xx<r[0]+r[2]-1;xx+=2)px(xx,yy,shade(col,.8));}
  if(fam==='charm'){x.fillStyle=g;x.fillRect(7,6,2,3);px(7,6,tint(g,.6));}
  if(fam==='axe'||fam==='mace'){const h=P[1];px(h[0],h[1],tint(col,.7));px(h[0]+h[2]-1,h[1]+h[3]-1,shade(col,.5));}
  if(fam==='lance'){px(7,0,tint(col,.7));}
  if(fam==='bow'||fam==='longbow'||fam==='crossbow'){px(P[0][0],P[0][1],g);}
  if(fam==='lute'||fam==='harp'){px(8,9,g);}
  if(fam==='knuckles'||fam==='claws'){P.slice(1).forEach(r=>px(r[0],r[1],tint(col,.7)));}
}
// ----- consumables -----
const ITEM_SPR={potion:['bottle','#e04a4a'],hipotion:['bottle','#ff3a6a',1],ether:['bottle','#4a8aff'],sage:['bottle','#7a5aff',1],remedy:['bottle','#5ae07a'],
  elixir:['bottle','#ffd04a',2],vigor:['bottle','#ff9a3a',1],plume:['feather','#ff7a3a'],salts:['pouch','#e0d8b0'],ash:['jar','#d8d0c8'],bandage:['roll','#f0e8d8'],
  porkchop:['food','#c8743a'],holywater:['bottle','#bfe6ff',2],tent:['tent','#7aa04a']};
function drawItemIcon(x,id){const S=ITEM_SPR[id]||(String(id).includes('sand')?['food','#d89a4a']:['pouch','#a8784a']),[k,c,lux]=S;
  const o=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h);},ol=(a,b,w,h)=>o(a-1,b-1,w+2,h+2,OUTC);
  if(k==='bottle'){ol(6,1,4,3);ol(4,4,8,10);o(6,1,4,3,'#a8784a');o(6,1,4,1,'#c89a6a');o(4,4,8,10,'#d8e8f0');o(5,7,6,6,c);o(5,7,6,1,tint(c,.4));o(10,7,1,6,shade(c,.7));o(5,5,1,2,'#ffffff');
    if(lux){o(4,10,8,1,lux>1?'#ffd25a':'#d0d8e8');}}
  else if(k==='feather'){ol(7,1,2,13);o(7,1,2,13,c);o(5,3,2,8,tint(c,.3));o(9,4,2,7,shade(c,.75));o(7,12,2,3,'#f0e0c0');o(8,2,1,10,tint(c,.6));}
  else if(k==='pouch'){ol(4,5,8,9);o(4,5,8,9,c);o(4,5,8,1,tint(c,.4));o(11,6,1,8,shade(c,.7));o(6,3,4,2,shade(c,.8));o(7,7,2,1,'#5a3a22');}
  else if(k==='jar'){ol(5,2,6,2);ol(4,4,8,10);o(5,2,6,2,'#8a6a4a');o(4,4,8,10,c);o(4,4,1,10,tint(c,.5));o(11,4,1,10,shade(c,.7));o(6,8,4,2,'#9a7aff');}
  else if(k==='roll'){ol(3,5,10,6);o(3,5,10,6,c);o(3,5,10,1,'#ffffff');o(3,10,10,1,shade(c,.75));o(10,6,2,4,shade(c,.85));o(6,7,3,2,'#e04a4a');}
  else if(k==='food'){ol(2,9,12,4);ol(3,5,10,4);o(2,9,12,4,'#e0b070');o(3,5,10,4,c);o(3,8,10,1,'#5ac04a');o(3,5,10,1,tint(c,.3));o(2,12,12,1,shade('#e0b070',.7));}
  else if(k==='tent'){ol(2,4,12,10);for(let i=0;i<6;i++)o(7-i,4+i*1.6|0,2+i*2,2,i%2?c:shade(c,.8));o(7,9,2,5,'#2a1a10');}
}
function itemIcon(id){return `<img class="gico iico" alt="" src="${cvURL('ii:'+id,()=>{const c=mkCv(16,16);drawItemIcon(c.getContext('2d'),id);return c;})}">`;}
