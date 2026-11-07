// ===== keymap.js: keyboard mapping =====
// One table of actions and their default keys. META.keys holds only the player's overrides ({action:[key,key]}), defaults apply when missing.
// kmIs(e,action) tests a keydown/keyup event, kmLabel(action) gives the text for help lines, kmDir(e) gives 'u'/'d'/'l'/'r' or null.
// KEYDIR (ui.js) is kept in sync by kmRebuild(), and the ui.js handlers read directions through kmDir.
// Settings > Keys (popup type 'keys') lists the actions; Change waits for the next key press, Escape cancels, a key already used elsewhere is moved.
const KM_ACTIONS=[
  ['up','Move up',['ArrowUp','w']],['down','Move down',['ArrowDown','s']],['left','Move left',['ArrowLeft','a']],['right','Move right',['ArrowRight','d']],
  ['run','Run (hold)',['Shift']],['interact','Talk, open, interact',['z','Enter',' ']],['menu','Menu',['m']],['map','Map',['n']],['mute','Mute sound',['k']],['back','Back / close',['Escape']]
];
const KM_DIRS={up:'u',down:'d',left:'l',right:'r'};
const KM_MODS=['Shift','Control','Alt','Meta','CapsLock','AltGraph','Fn','NumLock','ScrollLock','OS','ContextMenu'];
const KM={wait:null};
function kmNorm(k){k=String(k==null?'':k);return k.length===1?k.toLowerCase():k;}
function kmKeys(a){
  let o=null;try{o=META&&META.keys&&META.keys[a];}catch(e){}
  if(Array.isArray(o)){const r=o.filter(k=>typeof k==='string'&&k).map(kmNorm);return r;}
  const d=KM_ACTIONS.find(x=>x[0]===a);return d?d[2].map(kmNorm):[];}
function kmIs(e,a){const k=kmNorm(e&&e.key);return !!k&&kmKeys(a).includes(k);}
function kmDir(e){for(const a in KM_DIRS)if(kmIs(e,a))return KM_DIRS[a];return null;}
function kmHeld(a){try{const ks=kmKeys(a);for(const k of KEYS_DOWN)if(ks.includes(kmNorm(k)))return true;}catch(e){}return false;}
function kmShow(k){return k===' '?'Space':k.length===1?k.toUpperCase():k==='Escape'?'Esc':k.replace(/^Arrow/,'Arrow ');}
function kmLabel(a,n){const ks=kmKeys(a).map(kmShow);return ks.length?(n?ks.slice(0,n):ks).join(' / '):'unset';}
function kmDefault(a){const d=KM_ACTIONS.find(x=>x[0]===a);return d?d[2].map(kmNorm):[];}
function kmIsDefault(a){const c=kmKeys(a),d=kmDefault(a);return c.length===d.length&&c.every((k,i)=>k===d[i]);}
function kmMoveLabel(){const dd=['up','down','left','right'];if(dd.every(kmIsDefault))return 'Arrows or WASD';return dd.map(a=>kmLabel(a,1)).join(' ');}
function kmRebuild(){try{for(const k in KEYDIR)delete KEYDIR[k];for(const a in KM_DIRS)kmKeys(a).forEach(k=>{KEYDIR[k]=KM_DIRS[a];if(k.length===1)KEYDIR[k.toUpperCase()]=KM_DIRS[a];});}catch(e){}}
function kmSave(){kmRebuild();try{saveMeta();}catch(e){}}
function kmSet(a,key){key=kmNorm(key);META.keys=META.keys||{};
  KM_ACTIONS.forEach(x=>{const b=x[0];if(b===a)return;const cur=kmKeys(b);if(cur.includes(key))META.keys[b]=cur.filter(k=>k!==key);});
  META.keys[a]=[key];kmSave();}
function kmReset(){META.keys={};kmSave();}
function kmHasKb(){try{return matchMedia('(pointer:fine)').matches;}catch(e){return true;}}
try{kmRebuild();}catch(e){}

function mKeys(m){
  const rows=KM_ACTIONS.map(([a,lab])=>{const w=KM.wait===a;
    return `<div class="row kmrow"><div class="grow"><b>${lab}</b></div><div class="kmkeys">${w?'<span class="kmwait">Press a key...</span>':kmKeys(a).map(k=>`<kbd class="kmk">${esc(kmShow(k))}</kbd>`).join('')||'<small>unset</small>'}</div><button class="btn sm" data-act="kmChange" data-arg="${a}">${w?'Cancel':'Change'}</button></div>`;}).join('');
  return box('Keys',`<p class="note">Pick an action, press Change, then press the new key. Esc cancels. A key used by another action moves to this one.</p><div class="rows">${rows}</div>`,
    `<button class="btn" data-act="kmReset">Reset to defaults</button><button class="btn gold" data-act="xBack">Done</button>`,true);}
HOOK.before('vModal','keymap','keys popup',function(m){if(m&&m.type==='keys')return HOOK.stop(mKeys(m));});
HOOK.wrap('settingsBody','keymap','Keys row',function(next,...a){const h=next(...a);if(!kmHasKb())return h;
  return h+`<div class="rows"><div class="row"><div class="grow"><b>Keys</b><small>Choose the keyboard keys for moving, the menu, the map and mute.</small></div><button class="btn sm" data-act="kmOpen">Keys</button></div></div>`;});
Object.assign(ACT,{
  kmOpen(){KM.wait=null;V.modal={type:'keys',from:V.modal||null};render();},
  kmChange(a){KM.wait=KM.wait===a?null:a;render();},
  kmReset(){kmReset();KM.wait=null;try{toast('Keys reset to defaults.');}catch(e){}render();}
});
// capture the next key press while a Change is waiting (runs before every other key handler)
window.addEventListener('keydown',e=>{if(!KM.wait)return;
  if(!(V.modal&&V.modal.type==='keys')){KM.wait=null;return;}
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(KM_MODS.includes(e.key)&&e.key!=='Shift'){return;}
  if(e.key==='Shift'&&KM.wait!=='run')return;
  if(e.key==='Escape'){KM.wait=null;render();return;}
  const a=KM.wait;KM.wait=null;kmSet(a,e.key);render();},true);
