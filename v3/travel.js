// =================== TRAVEL ITEMS (Beta v0.1.0) ===================
// Pork Chop Sandwich, Holy Water and Tent. New save fields (defaulted on read): G.ward (steps left), G.pbuy (parts bought since last rest).
// The Daily Trial swaps in its own fixed inventory, so none of these can reach it; the checks below block them anyway.
const TENT_HEAL=.6,TENT_REVIVE=.3,AMBUSH_RATE={field:.3,dungeon:.45},AMBUSH_POW=1.15;

// ----- battle: Pork Chop Sandwich -----
function porkBlocked(){if(!B)return true;const k=B.spec.kind;return !!(B.boss||G.daily||k==='boss'||k==='echoBoss'||k==='legend'||k==='daily'||k==='arena');}
function porkFlee(){
  if(!B||B.over||B.mode!=='cmd')return;const a=B.cur;
  if(!(G.inv.porkchop>0))return;
  if(porkBlocked()){log('No sandwich will get you out of this fight!');B.menu='root';render();return;}
  G.inv.porkchop--;if(typeof autoNote==='function')autoNote(a,ITEMS.porkchop.n);
  B.over=true;log(`${a.name} hurls a Pork Chop Sandwich. The foes go for the sandwich and the party slips away!`);render();
  later(()=>finishBattle('fled'),PAUSE);
}
{const it0=ACT.item;ACT.item=function(id){const o=ITEMS[id];if(o&&(o.ward||o.tent))return;if(o&&o.flee)return porkFlee();return it0.apply(this,arguments);};}

// ----- tent ambush: the area's normal pool, a little stronger -----
{const ef0=encounterFoes;encounterFoes=function(spec){const out=ef0.apply(this,arguments);
  if(spec&&spec.ambush)out.forEach(e=>{['atk','mag','def','res','mhp'].forEach(k=>{e.S[k]=k==='mhp'?Math.round(e.S[k]*AMBUSH_POW):e.S[k]*AMBUSH_POW;});e.hp=e.S.mhp;});
  return out;};}
{const sb0=startBattle;startBattle=function(spec){const r=sb0.apply(this,arguments);if(r!==false&&B&&spec&&spec.ambush){banner('Ambush!','#ff8a5a');log('Monsters fall on your camp!');}return r;};}

// ----- outside battle -----
function nearBoss(m){return m.kind==='dungeon'&&m.bossAt&&!G.cleared[m.s]&&Math.abs(WS.x-m.bossAt[0])<6&&Math.abs(WS.y-m.bossAt[1])<6;}
function travelWhyNot(id){
  const o=ITEMS[id],m=WS.m;
  if(!(G.inv[id]>0))return 'You have none.';
  if(B||V.screen!=='world'||!m)return 'Use it out in the world.';
  if(G.daily)return 'Not during the Daily Trial.';
  if(WS.lock||WS.dlg)return 'Not right now.';
  if(o.flee&&m.safe)return 'No sandwich will carry you out of here. Leave the old way.';
  if(o.tent){
    if(m.kind==='town')return 'No camping in town. The inn is cheaper and better.';
    if(m.safe)return 'The Archive is no place to pitch a tent.';
    if(nearBoss(m))return 'Too close to the guardian to sleep.';
  }
  return '';
}
function campRest(){
  partyChars().forEach(c=>{
    if(c.hp<=0){c.hp=Math.max(1,Math.round(c.S.mhp*TENT_REVIVE));c.st={};}
    else c.hp=Math.min(c.S.mhp,c.hp+Math.round(c.S.mhp*TENT_HEAL));
    c.mp=Math.min(c.S.mmp,c.mp+Math.round(c.S.mmp*TENT_HEAL));
  });
}
function useTravel(id){
  const why=travelWhyNot(id);if(why){toast(why);sfx('deny');return false;}
  const o=ITEMS[id],m=WS.m;G.inv[id]--;
  if(o.ward){const had=G.ward>0;G.ward=o.ward;saveGame();V.modal=null;render();wkwUpdate();toast(had?`The ward is renewed: ${o.ward} steps.`:`A holy hush settles over the party. No random battles for ${o.ward} steps.`);sfx('heal');return true;}
  if(o.flee){V.modal=null;saveGame();render();
    if(m.kind==='dungeon'){toast('You follow the smell of pork chops back to the entrance.');
      fadeTo(()=>{const d=getMap(m.id);placeAt(m.id,d.start[0],d.start[1],'d');showLocation();saveGame();});return true;}
    // v0.4.0 3.6: anywhere else, the smell leads back to the last town you visited, right in front of its Inn
    const lt=G.lastTown||0;toast(`You follow the smell of pork chops back to the inn in ${ZS(lt).town}.`);
    fadeTo(()=>{const [ix,iy]=innSpot(lt);placeAt('t'+lt,ix,iy,'d');showLocation();saveGame();});return true;}
  if(o.tent){
    // The rest always completes first; only then does the tile decide whether anything finds the camp.
    campRest();saveGame();V.modal=null;render();sfx('heal');
    const danger=encTile(m,WS.x,WS.y),rate=AMBUSH_RATE[m.kind]||0;
    if(danger&&Math.random()<rate){
      toast('You wake to rustling. Ambush!');haltInput();WS.lock=true;WS.flash=performance.now();sfx('encounter');
      later(()=>{WS.lock=false;startBattle({stage:m.s,kind:m.kind==='dungeon'?'dungeon':'field',ambush:true});},700);
    }else toast(danger?'You rest, and nothing finds the camp. Lucky.':'You rest undisturbed. Roads are safe ground.');
    return true;
  }
  return false;
}
ACT.useTravel=function(id){useTravel(id);};
