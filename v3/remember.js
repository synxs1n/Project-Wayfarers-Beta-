// ===== remember.js (v0.7.1): remember Auto and Run =====
// The Auto battle toggle and the Run toggle used to live only in memory (V.auto, WS.run), so they reset on every launch and every update.
// They are now stored in META.cfg (optional new fields autoOn, runOn; the meta key aurelis-meta-v1 is unchanged) and restored on boot.
// Shift still runs while held; letting go returns to the saved Run choice. The Daily Trial still starts with Auto off (it does not change
// the saved choice), and the next normal battle uses the saved choice again.
function remOn(k){try{return !!(META&&META.cfg&&META.cfg[k]);}catch(e){return false;}}
function remSet(k,v){try{META.cfg[k]=!!v;saveMeta();}catch(e){}}
// META is read in boot(), after the modules load, so the saved choices are applied right after it
{const bt0=boot;boot=function(){const r=bt0.apply(this,arguments);try{V.auto=remOn('autoOn');WS.run=remOn('runOn');}catch(e){}return r;};}
{const a0=ACT.auto;ACT.auto=function(){const r=a0.apply(this,arguments);remSet('autoOn',V.auto);return r;};}
{const r0=ACT.runT;ACT.runT=function(){const r=r0.apply(this,arguments);remSet('runOn',WS.run);return r;};}
{const h0=haltInput;haltInput=function(){const r=h0.apply(this,arguments);try{WS.run=remOn('runOn');}catch(e){}return r;};}
window.addEventListener('keyup',e=>{if(e.key==='Shift'&&remOn('runOn'))WS.run=true;});
HOOK.before('startBattle','remember','remembered Auto',function(spec){try{if(!(spec&&spec.kind==='daily')&&!(G&&G.daily))V.auto=remOn('autoOn');}catch(e){}});
