// ===== stuck.js (v0.3.0): the Stuck? rescue back to a dungeon's entrance =====
// Dungeon maps are rebuilt from the run seed on every load, so the generator fix (fixDungeon) already frees old saves.
// On top of that: if the party lands somewhere it can't walk back to the entrance from, it is moved to the entrance,
// and the menu offers a free "Stuck?" return to the entrance while in any dungeon.
function dunReachable(m,x,y){
  const H=m.t.length,W=m.t[0].length,S=m.t.map(r=>r.map(()=>false)),Q=[m.start.slice()];S[m.start[1]][m.start[0]]=true;
  for(let q=0;q<Q.length;q++){const [cx,cy]=Q[q];if(cx===x&&cy===y)return true;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H||S[ny][nx])continue;if(solidAt(m,nx,ny)&&!(nx===x&&ny===y))continue;S[ny][nx]=true;Q.push([nx,ny]);}}
  return false;}
HOOK.wrap('placeAt','stuck','Stuck? return point',function(next,...a){let mid=a[0],x=a[1],y=a[2],f=a[3];const r=next(...a);
  try{const m=WS.m;if(m&&m.kind==='dungeon'&&m.start&&!(WS.x===m.start[0]&&WS.y===m.start[1])&&(solidAt(m,WS.x,WS.y)||!dunReachable(m,WS.x,WS.y))){
    next(mid,m.start[0],m.start[1],'d');setTimeout(()=>toast('The way back was blocked, so the party found its way to the entrance.'),300);}}catch(e){}
  return r;});
function canStuck(){return V.screen==='world'&&WS.m&&WS.m.kind==='dungeon'&&!WS.lock&&!B;}
Object.assign(ACT,{
  stuckAsk(){if(!canStuck())return;V.modal={type:'stuck',from:V.modal};render();},
  stuckGo(){if(!canStuck())return;const m=WS.m;V.modal=null;render();fadeTo(()=>{placeAt(m.id,m.start[0],m.start[1],'d');showLocation();saveGame();toast('Back at the entrance. Nothing was lost.');});}
});
HOOK.before('vModal','stuck','Stuck? popup',function(m){if(m&&m.type==='stuck')return HOOK.stop(box('Stuck?',`<p>If something blocks your way, the party can walk back to the entrance of ${esc(WS.m&&WS.m.archive?'the Archive':ZS(WS.m.s).dungeon)} for free. Keys, levers, chests and everything you carry stay as they are.</p>`,'<button class="btn gold" data-act="stuckGo">Return to the entrance</button><button class="btn" data-act="xBack">Cancel</button>'));});
