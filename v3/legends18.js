// ===== legends18.js (after 0.22.3): Nikaris joins the moment his beasts are beaten =====
// The owner: "Nikaris should appear, talk to you and join your roster right after beating his pets." Both roads to him end in a fight against his
// beasts: the trail ("Tracks at the Treeline", legends17b.js: the Pack Mother and two pups) and the code quest ("The Wildcaller's Trial", legends.js:
// the wolf pup, then the young hawk). Before, a won pet fight led to a separate meeting (the trail sent you on to the pup, the hawk and the meeting
// of the code quest; the code quest to a third step, "Find the Wildcaller"). Now the last pet fight ends it: the moment the party wins it,
//  - he joins inside win() (legendJoin: a free place in the six or the reserve, the account unlock, the quest claimed and off the board), so the save
//    made at the end of win() already holds him: nothing can be left half joined;
//  - the rewards screen says so (info.legend);
//  - back on the field he stands beside the party (a legend actor next to the player: both renderers draw it) and his lines play in the field's own
//    dialogue box (say(): tap, click, Z, Enter or Space). The scene is a save field (G.l18meet {kind, i: the line to show, at: the spot}); a reload in the
//    middle replays it from that line (he has already joined).
// A joining legend's seat: win() and finishBattle() rebuild G.party from the fight's Vanguard and rearguard, which dropped a legend who joined inside
// win() into the reserve even with a free seat (Kaevan's duel had this too). G.l18seat holds the id until the battle is over, then he takes the seat.
// Old saves: a trail at its meeting step (tstep 2) or a code quest at "Find the Wildcaller" (step 2) finishes on load the same way (l18Old).
// Test: tools/chrome/v197a.js.
const L18={
  open:{
    trail:'The Pack Mother sinks onto her haunches, panting, and her two pups tumble in behind her. A long, low whistle comes out of the treeline, and all three go still.',
    code:'The young hawk stops fighting the thornvine and lets you lift it free. A long, low whistle comes out of the dark, and the hawk and the wolf pup both turn toward it.'},
  step:'A hunter in a wolf pelt steps out of the trees, quiver on his back, and walks straight past you to his beasts.',
  praise:{
    trail:'"Easy. Easy, Mother. You did well." He looks up at you. "Most people run from her. You stood your ground, and you never once went for the pups."',
    code:'"Easy, both of you." He looks up at you. "Most people try to put a hawk down when it goes for their eyes. You didn\'t. And the pup has trailed you since the road."'},
  off:'"Back to the den. Go on." The beasts melt into the long grass without a sound.',
  join:'"I\'m Nikaris. I\'ve been on your tracks for days, watching how you fight. You\'ll do." He strings his bow. "Wherever you\'re headed, I\'m coming with you."'};
// the lines of the scene: [speaker or null, text]
function l18Lines(kind){const k=kind==='code'?'code':'trail',six=G&&G.party&&G.party.includes('nikaris');
  return [[null,L18.open[k]],[null,L18.step],['Nikaris',L18.praise[k]],['Nikaris',L18.off],['Nikaris',L18.join],
    [null,`${TPL.nikaris.n} joins your roster${six?' and your six':'. Your six is full: he waits in the reserve (Party menu)'}.`]];}
// he joins; the scene waits for the field
function l18Join(kind,info){if(!G||G.roster.nikaris)return false;legendJoin('nikaris',info||{});if(!G.roster.nikaris)return false;
  G.l18meet={kind,i:0};
  if(info)info.legend=`${TPL.nikaris.title} steps out of the trees, calls off his beasts and joins you.`;
  return true;}
// the last fight against his beasts: the trail's own fight, or the hawk of the code quest (the pup fight before it moves the quest on as before)
{const lw0=legendWin;legendWin=function(spec,info){try{if(spec&&spec.hero==='nikaris'&&G&&!G.roster.nikaris){
    const q=G.quests.find(x=>x.type==='legend'&&x.hero==='nikaris'&&x.state!=='claimed');
    if(q&&(spec.l17trail||(spec.step||0)>=1)&&l18Join(spec.l17trail?'trail':'code',info))return;}}catch(e){console.error('legends18 win',e);}
  return lw0.apply(this,arguments);};}
// a legend who joins inside a battle keeps the free seat (see the header)
{const lj0=legendJoin;legendJoin=function(id,info){const had=!!(G&&G.roster[id]);const r=lj0.apply(this,arguments);
  try{if(!had&&G&&G.roster[id]&&B&&info)G.l18seat=id;}catch(e){}return r;};}
function l18Seat(){try{const id=G&&G.l18seat;if(!id)return;if(G.roster[id]&&!G.party.includes(id)&&G.party.length<6)G.party.push(id);if(!B)delete G.l18seat;saveGame();}catch(e){}}
HOOK.after('win','legends18','a legend who joined in this fight takes a free seat',function(){l18Seat();});
HOOK.after('finishBattle','legends18','a legend who joined in this fight takes a free seat',function(){l18Seat();});
// old saves: a trail at its meeting, or a code quest at "Find the Wildcaller": he joins now
function l18Old(){try{if(!G||G.daily||B||G.roster.nikaris)return false;const q=(G.quests||[]).find(x=>x.type==='legend'&&x.hero==='nikaris'&&x.state!=='claimed');if(!q)return false;
  const trail=typeof l17Trail==='function'&&l17Trail(q);if(trail?(q.tstep||0)>=2:(q.step||0)>=2){if(l18Join(trail?'trail':'code',null)){saveGame();return true;}}}catch(e){console.error('legends18 old save',e);}return false;}
// where he stands: a free tile next to the player, the side the player faces first
function l18Spot(){const m=WS.m,x=WS.x,y=WS.y,f=WS.dir||'r',D={l:[-1,0],r:[1,0],u:[0,-1],d:[0,1]},L=[D[f]||D.r,D.r,D.l,D.d,D.u,[1,1],[-1,1],[1,-1],[-1,-1]];
  for(const [dx,dy] of L){const tx=x+dx,ty=y+dy;try{if(ty<0||tx<0||!m.t[ty]||tx>=m.t[ty].length)continue;if(!solidAt(m,tx,ty))return {m:m.id,x:tx,y:ty};}catch(e){}}
  return {m:m.id,x:x+1,y};}
HOOK.xform('dynActors','legends18','Nikaris stands beside the party while he talks',function(out,m){try{const S=G&&G.l18meet,at=S&&S.at;
  if(at&&m&&m.id===at.m&&!B&&Array.isArray(out))out.push({type:'legend',l18:1,x:at.x,y:at.y,q:{type:'legend',hero:'nikaris',state:'claimed',stage:m.s,l18:1}});}catch(e){}return out;});
HOOK.before('actorTalk','legends18','talking to him again picks the scene up',function(a){if(a&&a.l18){l18Say();return HOOK.stop();}});
// the scene: one line at a time in the field's dialogue box, his portrait on his lines
function l18Say(){const S=G&&G.l18meet;if(!S)return;const L=l18Lines(S.kind),i=Math.max(0,Math.min(L.length-1,S.i||0));
  say(L[i][0],L[i][1],()=>{const T=G&&G.l18meet;if(!T)return;T.i=i+1;if(T.i>=L.length)l18Done();else{saveGame();l18Say();}});
  if(WS.dlg&&L[i][0]){WS.dlg.por='nikaris';try{if(typeof renderWorldUI==='function')renderWorldUI();}catch(e){}}}
function l18Done(){if(!G||!G.l18meet)return;delete G.l18meet;saveGame();try{sfx('level');}catch(e){}render();}
HOOK.after('render','legends18','Nikaris steps out on the field',function(){try{
  if(!G||G.daily||B||V.screen!=='world'||!WS.m||V.modal||WS.lock)return;
  if(!G.l18meet&&l18Old())return render();
  const S=G.l18meet;if(!S||WS.dlg)return;
  if(!S.at||S.at.m!==WS.m.id){S.at=l18Spot();saveGame();}
  if(S.at.x<WS.x)WS.face='l';else if(S.at.x>WS.x)WS.face='r';
  setTimeout(()=>{try{if(G&&G.l18meet&&!WS.dlg&&!V.modal&&!B&&V.screen==='world')l18Say();}catch(e){}},0);}catch(e){console.error('legends18 scene',e);}});
// tests
try{window.__L18={L18,lines:k=>l18Lines(k),join:(k,i)=>l18Join(k,i),old:()=>l18Old(),say:()=>l18Say(),spot:()=>l18Spot(),get G(){return G;},get B(){return B;},get V(){return V;},get WS(){return WS;}};}catch(e){}
