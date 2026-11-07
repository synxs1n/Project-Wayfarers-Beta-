// ===== hooks.js (v0.9.9): one definition per core function, with ordered hook lists (see docs/v099-hooks.md) =====
// The core functions (render, startBattle, finishBattle, win, ...) used to be wrapped 10+ times, one `{const f0=fn;fn=function(){...}}`
// per module. Now each is defined once, right under its base body: `render=HOOK.def('render',render);`, and the modules register
// hooks instead. Every hook names its module and a short purpose; `tools/hooksmap.js` prints the lists (docs/CODEMAP.md).
//   HOOK.before(name,mod,why,fn)  fn(...args) runs before the rest; `return HOOK.stop(v)` skips the rest and returns v
//   HOOK.after(name,mod,why,fn)   fn(r,...args) runs after the rest; r is returned unchanged
//   HOOK.xform(name,mod,why,fn)   r=fn(r,...args): replaces the result (HTML rewriting, a different return value)
//   HOOK.wrap(name,mod,why,fn)    fn(next,...args): a true around hook (try/finally, changed arguments, calling the rest conditionally)
// Order: hooks compose exactly like the wrappers they replace, in registration (load) order: the last registered is the
// outermost. So a later hook's before part runs first and its after part runs last. `this` and the arguments are passed through.
// Hooks may be registered at any time (also at runtime); the composed chain is rebuilt on the next call.
const HOOK=(function(){
  const T={};
  function ent(n){return T[n]||(T[n]={name:n,base:null,list:[],fn:null});}
  function Stop(v){this.v=v;}
  function one(h,g){const f=h.fn;
    if(h.kind==='before')return function(){const s=f.apply(this,arguments);if(s instanceof Stop)return s.v;return g.apply(this,arguments);};
    if(h.kind==='after')return function(){const r=g.apply(this,arguments);f.call(this,r,...arguments);return r;};
    if(h.kind==='xform')return function(){return f.call(this,g.apply(this,arguments),...arguments);};
    return function(){const self=this;return f.call(this,function(){return g.apply(self,arguments);},...arguments);};}
  function chain(e,n){let g=e.base;for(let i=0;i<n;i++)g=one(e.list[i],g);return g;}
  function add(kind,n,mod,why,fn){if(typeof fn!=='function')throw new Error('HOOK '+kind+' '+n+': not a function');const e=ent(n);e.list.push({kind,mod,why,fn});e.fn=null;}
  return {
    def(n,base){const e=ent(n);e.base=base;e.fn=null;const d=function(){return (e.fn||(e.fn=chain(e,e.list.length))).apply(this,arguments);};d.hookName=n;return d;},
    before:(n,m,w,f)=>add('before',n,m,w,f),after:(n,m,w,f)=>add('after',n,m,w,f),
    xform:(n,m,w,f)=>add('xform',n,m,w,f),wrap:(n,m,w,f)=>add('wrap',n,m,w,f),
    stop:v=>new Stop(v),
    // the chain as it stands now (only the hooks registered so far), for old load-time copies such as window.__P2
    snap(n){const e=ent(n),k=e.list.length;let g=null;return function(){return (g||(g=chain(e,k))).apply(this,arguments);};},
    // registration order (index 0 is innermost, next to the base); tools/hooksmap.js turns this into the run order
    list(n){return n?(T[n]?T[n].list.map(h=>({kind:h.kind,mod:h.mod,why:h.why})):[]):Object.keys(T);}
  };
})();
