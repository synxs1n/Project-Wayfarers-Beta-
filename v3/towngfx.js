// ===== towngfx.js (v0.3.1): the town look: service roofs, signs, landmarks, the quest board mark =====
// Every service has a fixed roof colour, a landmark prop by the door and a big labelled sign, in every town layout.
// The quest board gets a label and a pulsing "!" when something new or finished is waiting.
const SVC_LOOK={
  inn:{roof:'#3a5aa8',label:'INN',col:'#7aa0ff'},
  tavern:{roof:'#a83a2a',label:'TAVERN',col:'#ff9a6a'},
  smithy:{roof:'#4a4a56',label:'SMITHY',col:'#d0d0e0'},
  workshop:{roof:'#2f8a4a',label:'ALCHEMY',col:'#7ae89a'},
  guild:{roof:'#6a3aa0',label:'GUILD HALL',col:'#d0a8ff'}};
// tiny pixel icons, [x,y,w,h,colour] on a 10x10 grid
const SVC_ICON={
  inn:[[1,5,8,3,'#e8e8f8'],[1,4,3,2,'#ffffff'],[1,8,1,2,'#6a4a2a'],[8,8,1,2,'#6a4a2a'],[4,4,5,1,'#7aa0ff']],
  tavern:[[2,3,5,6,'#e0a030'],[2,2,5,2,'#ffffff'],[7,4,2,3,'#c08020'],[3,5,1,3,'#f6d070']],
  smithy:[[1,6,8,2,'#8a8a9a'],[3,4,4,2,'#a8a8b8'],[4,8,2,2,'#6a6a7a'],[6,1,1,4,'#c8c8d8']],
  workshop:[[4,1,2,2,'#c8c8d0'],[3,3,4,1,'#9a9aa8'],[2,4,6,5,'#3aa860'],[3,5,2,1,'#b8f0c8'],[2,9,6,1,'#2a7a40']],
  guild:[[2,1,1,9,'#5a3a1a'],[3,1,5,4,'#a82a2a'],[4,2,2,2,'#f0c050'],[3,5,3,1,'#a82a2a']]};
{const db0=drawBuilding;drawBuilding=function(ctx,m,b){const L=SVC_LOOK[b.k],T=THM(m);
  if(!L)return db0.apply(this,arguments);
  // swap the theme's roof pick for the service colour for this one draw
  const saved=T.roof,rk=T.roofKind;T.roof=[L.roof,L.roof,L.roof,L.roof];if(rk==='thatch')T.roofKind='tile';try{db0.apply(this,arguments);}finally{T.roof=saved;T.roofKind=rk;}
  const x0=b.x*TS,y0=b.y*TS,w=b.w*TS,h=b.h*TS,f=(c,x,y,ww,hh)=>{ctx.fillStyle=c;ctx.fillRect(x0+x,y0+y,ww,hh);},dx=(b.door[0]-b.x)*TS,dy=h-16;
  if(b.k==='smithy'){// a fat forge chimney with an ember glow
    const cx=4;f(OUTC,cx-1,-20,12,16);f('#3a3a42',cx,-19,10,15);f('#52525e',cx,-19,3,15);f('#26262e',cx+7,-19,3,15);f('#5a5a66',cx,-19,10,2);f('#7a7a88',cx,-19,10,1);f('#2e2e36',cx,-12,10,1);f('#2e2e36',cx,-6,10,1);f('#ff7a2a',cx+2,-21,6,2);f('#ffd04a',cx+3,-22,4,1);f('#fff0a8',cx+4,-22,2,1);}
  if(b.k==='inn'){f('#3a2a1a',dx-2,dy-6,20,1);}
};}
// v0.4.1 1.4: props, signs and the quest board label are now y-sorted actors (base = the building's front edge / the board tile), so
// a character standing in a doorway or in front of a board is always drawn over them; nothing paints on top of characters.
function townDecorActors(actors,now,cx,cy){
  const m=WS.m,ctx=WS.ctx;if(!m||!ctx||m.kind!=='town')return;
  m.bld.forEach(b=>{const L=SVC_LOOK[b.k];if(!L)return;const x0=b.x*TS-cx,y0=b.y*TS-cy,w=b.w*TS,h=b.h*TS,dx=(b.door[0]-b.x)*TS;
    if(x0>WS.vw+40||y0>WS.vh+40||x0+w<-40||y0+h<-40)return;
    actors.push({y:(b.y+b.h-1)*TS+.25,deco:'building:'+b.k,draw:()=>{
    const f=(c,x,y,ww,hh)=>{ctx.fillStyle=c;ctx.fillRect(x0+x,y0+y,ww,hh);};
    // landmark prop on the wall beside the door (inside the footprint, so it never covers the hero)
    const px=dx+18<=w-14?dx+18:dx-16,py=h-14;
    // v0.3.5: a soft ground shadow under the landmark prop so it reads as standing on the paving, hard against the wall base
    if(b.k!=='guild')f('rgba(0,0,0,.30)',px-2,py+11,16,3);
    if(b.k==='smithy'){f(OUTC,px-1,py+3,14,9);f('#5a5a66',px,py+4,12,3);f('#8e8e9e',px,py+4,12,1);f('#3c3c46',px+8,py+5,4,2);f('#7a7a88',px+3,py+7,6,2);f('#a8a8b8',px+3,py+7,6,1);f('#4a4a54',px+4,py+9,4,3);f('#32323c',px+7,py+9,1,3);f('#e8e8f6',px+1,py+4,2,1);const g=Math.floor(now/180)%2;f(g?'#ffb04a':'#ff7a2a',px+5,py+2,2,2);}
    if(b.k==='workshop'){f(OUTC,px-1,py+3,13,10);f('#3a3a42',px,py+4,11,8);f('#52525e',px,py+4,2,8);f('#26262e',px+9,py+4,2,8);f('#2f8a4a',px+1,py+4,9,3);f('#5ad07a',px+1,py+4,5,1);f('#1e6a34',px+1,py+6,9,1);f('#c8c8d0',px,py+4,11,1);for(let i=0;i<3;i++){const t=(now/600+i*.33)%1;f('#9affb8',px+2+i*3,py+3-Math.round(t*8),2,2);}}
    if(b.k==='tavern'){f(OUTC,px-1,py+1,11,12);f('#8a5a2a',px,py+2,9,10);f('#b0804a',px,py+2,2,10);f('#5e3a1a',px+7,py+2,2,10);f('#5a3a1a',px,py+4,9,1);f('#5a3a1a',px,py+9,9,1);f('#9aa0aa',px,py+4,9,1);f('#6a7078',px+7,py+4,2,1);f('#9aa0aa',px,py+9,9,1);f('#d0a068',px,py+2,9,1);f('#e0a030',px+3,py-4,4,5);f('#f6d070',px+3,py-3,1,4);f('#b07818',px+6,py-3,1,4);f('#ffffff',px+3,py-4,4,1);f('rgba(0,0,0,.2)',px+9,py+3,1,9);}
    if(b.k==='inn'){f(OUTC,px-1,py-9,4,13);f('#2a2a34',px,py-8,2,12);f('#6a6a7a',px,py-8,1,12);f('#1a1a22',px+1,py-8,1,12);f('#4a4a58',px-1,py-9,4,2);f('#6a6a7a',px-1,py-9,4,1);const p=.6+.4*Math.sin(now/300);ctx.fillStyle=`rgba(255,216,112,${p})`;ctx.fillRect(x0+px-2,y0+py-6,6,5);ctx.fillStyle=`rgba(255,250,214,${p})`;ctx.fillRect(x0+px-1,y0+py-5,2,2);ctx.fillStyle='rgba(120,70,10,.55)';ctx.fillRect(x0+px+2,y0+py-4,2,3);}
    if(b.k==='guild'){const s=Math.sin(now/400);[[w/2-14,Math.round(s)],[w/2+8,-Math.round(s)]].forEach(([bx,o])=>{f(OUTC,bx-1,-15+o,8,12);f('#a82a2a',bx,-14+o,6,9);f('#c84444',bx,-14+o,2,9);f('#6e1818',bx+4,-14+o,2,9);f('#f0c050',bx,-14+o,6,1);f('#8a1c1c',bx+3,-10+o,1,5);});f('#f0c050',w/2-12,-12,2,2);f('#f0c050',w/2+10,-12,2,2);f('#fff0a0',w/2-12,-12,1,1);f('#fff0a0',w/2+10,-12,1,1);}
    // the sign: a plank with an icon and a label, centred over the door
    ctx.font='bold 8px "Trebuchet MS",Verdana,sans-serif';const tw=Math.ceil(ctx.measureText(L.label).width),sw=tw+18,sh=13,sx=Math.round(x0+dx+8-sw/2),sy=Math.round(y0+h-34);
    ctx.fillStyle='rgba(10,6,24,.3)';ctx.fillRect(sx+1,sy+sh+1,sw,2);ctx.fillStyle='#150b17';ctx.fillRect(sx-1,sy-1,sw+2,sh+2);ctx.fillStyle='#5a3a1e';ctx.fillRect(sx,sy,sw,sh);ctx.fillStyle='#7a5228';ctx.fillRect(sx,sy,sw,2);ctx.fillStyle='#9a6a38';ctx.fillRect(sx,sy,sw,1);ctx.fillStyle='#8a5e30';ctx.fillRect(sx,sy,1,sh);ctx.fillStyle='#3e2612';ctx.fillRect(sx+sw-1,sy+1,1,sh-1);ctx.fillRect(sx,sy+sh-1,sw,1);ctx.fillStyle='#e8d8b0';ctx.fillRect(sx+1,sy+2,1,1);ctx.fillRect(sx+sw-2,sy+2,1,1);
    (SVC_ICON[b.k]||[]).forEach(([a,bb,ww,hh,c])=>{ctx.fillStyle=c;ctx.fillRect(sx+3+Math.round(a*.9),sy+2+Math.round(bb*.9),Math.max(1,Math.round(ww*.9)),Math.max(1,Math.round(hh*.9)));});
    ctx.fillStyle='#000';ctx.fillText(L.label,sx+14+1,sy+10);ctx.fillStyle=L.col;ctx.fillText(L.label,sx+14,sy+9);}});});
  // quest board: label, plus a pulsing marker when there is something new or ready to hand in
  if(!m._qb){m._qb=[];for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(m.t[y][x]==='q')m._qb.push([x,y]);}
  for(const [x,y] of m._qb){const px=x*TS-cx,py=y*TS-cy;if(px<-40||py<-40||px>WS.vw+40||py>WS.vh+40)continue;
    actors.push({y:y*TS+.25,deco:'board',draw:()=>{
    const st=boardState();ctx.font='bold 7px "Trebuchet MS",Verdana,sans-serif';const lab='QUESTS',tw=Math.ceil(ctx.measureText(lab).width);
    ctx.fillStyle='#150b17';ctx.fillRect(px+8-tw/2-3,py+17,tw+6,10);ctx.fillStyle='#e8c070';ctx.fillText(lab,px+8-tw/2,py+25);
    if(st){const bob=Math.round(Math.sin(now/220)*2),p=.55+.45*Math.sin(now/180),col=st==='ready'?'#7aff8a':'#ffd04a';
      ctx.fillStyle=`rgba(255,240,160,${.25*p})`;ctx.beginPath();ctx.arc(px+8,py-14+bob,10,0,7);ctx.fill();
      ctx.fillStyle='#150b17';ctx.fillRect(px+5,py-24+bob,7,14);ctx.fillStyle=col;ctx.fillRect(px+6,py-23+bob,5,8);ctx.fillRect(px+6,py-13+bob,5,2);}}});}
}
// 'ready' if a quest can be handed in, 'new' if the board has posts you haven't taken, else null
function boardState(){if(!G)return null;try{if(G.quests.some(q=>q.state==='active'&&typeof questReady==='function'&&questReady(q)))return 'ready';if(G.quests.some(q=>q.state==='open'&&q.stage<=G.stage&&q.type!=='legend'))return 'new';}catch(e){}return null;}

townDecorActors=HOOK.def('townDecorActors',townDecorActors);// v0.18.7: world12.js stands each town's landmark in the depth sort (2D only; HD-2D bakes only 'building:' and 'board' decor)
