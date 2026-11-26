// ===== fix52.js (v0.22.52): The barred hoard counts a vault chest that is already open =====
// Reported with a screenshot: two "The barred hoard" quests (first and fifth realm) still said "Vault still sealed" on a journey that had been
// through both dungeons. The quest is ready when G.vaults[stage] is set, and that is only set at the moment the vault chest is opened
// (worldrt.js openChest). On a fresh journey that works in all five dungeons (tested). But the flag and the chest are two records: G.chests
// says which chests are open. A chest opened by an older build, or moved since by the path guard (pathguard.js gives it a new spot and
// copies the open mark), could be open without the flag, and an open chest cannot be opened again, so the quest could never be finished.
// Now the open chest itself counts: if the dungeon's vault chest (at its spot, or the spot it was built on) is marked open in G.chests,
// the vault is taken as opened. Checked when a save is loaded, when a chest is opened and when a vault quest is looked at (once per
// stage and visit to the lists). A vault whose chest has never been opened is still sealed: the lever in the dungeon raises its bars.
const F52={chk:{},n:0};
function f52Vault(s){try{if(!G||G.daily)return false;G.vaults=G.vaults||{};if(G.vaults[s])return true;
    // 0.22.54: only a dungeon with an open chest in it is looked at. getMap builds a dungeon that was never entered (about 110 ms), and this ran on every
    // chest opened anywhere and on every look at a vault quest: the first field chest took 160 ms to open instead of 50 (tools/chrome/v190a.js)
    const pre='d'+s+':';if(!Object.keys(G.chests||{}).some(k=>k.indexOf(pre)===0))return false;
    const m=getMap('d'+s);if(!m||!m.chests)return false;
    for(const c of m.chests){if(c[2]!=='vault')continue;const K=[m.id+':'+c[0]+','+c[1]];if(c.from)K.push(m.id+':'+c.from[0]+','+c.from[1]);
      if(K.some(k=>G.chests&&G.chests[k])){G.vaults[s]=1;F52.n++;return true;}}}catch(e){F52.err=String(e&&e.message||e);}return false;}
function f52Sweep(){try{if(!G||G.daily)return;(G.quests||[]).forEach(q=>{if(q&&q.type==='vault'&&q.state!=='claimed'&&!(G.vaults||{})[q.stage]&&F52.chk[q.stage]!==G.run.seed+':'+Object.keys(G.chests||{}).length){F52.chk[q.stage]=G.run.seed+':'+Object.keys(G.chests||{}).length;f52Vault(q.stage);}});}catch(e){}}
{const q0=questReady;questReady=function(q){try{if(q&&q.type==='vault'&&q.state==='active'&&!(G.vaults||{})[q.stage])f52Sweep();}catch(e){}return q0.apply(this,arguments);};}
HOOK.after('openChest','fix52','a vault chest that is open counts for its quest',function(){try{F52.chk={};f52Sweep();}catch(e){}});
try{window.__F52={F52,vault:f52Vault,sweep:f52Sweep};}catch(e){}
