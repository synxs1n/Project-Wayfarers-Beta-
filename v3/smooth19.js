// ===== smooth19.js (v0.22.8): a smoother battle screen =====
// Owner: "Lot of frame drops on the battle screen, needs to be way smoother".
// Measured (headless Chrome, 1366x768, Medium, six heroes): every render() on the wide battle screen took 95 to 155 ms, and render() runs on
// every turn. Most of it was the stage fit (battle3.js b3WideSc): it tries the stacked and column arrangements at several widths and asks
// b8HAt for the height of the command panel, the foes and the party column at each one, 19 questions a render. Each answer appends a hidden
// copy, reads its height and removes it, so every question was its own full page layout (fix18 only merged repeats of the same question).
// Section 1 lays out every copy b3WideSc will ask for side by side and reads them all in one layout; b8HAt then answers from that batch.
// The copies, their parent, their styles and the numbers are the same as before (S19.off runs the old path, test v198a compares the two).
const S19={off:false,pre:null,memo:null,n:{batch:0,reuse:0,copies:0,hit:0,miss:0}};
// ----- 1. the wide stage fit reads its hidden copies in one layout -----
// the (kind, width) pairs b3WideSc asks for, in the same arithmetic it uses (stacked, column, and the short screen's commands on the right)
function s19Pairs(bat,vh){const W=bat.clientWidth,out=[],add=(k,w)=>out.push([k,Math.round(w)]);
  const L0=(W-B8.col)*1.42/2.42;add('cmd',L0);add('foes',L0);add('pty',W-B8.col-L0);
  [...new Set(B8.R.concat([Math.round((W-B8.col)/2.42)]))].filter(R=>W-B8.col-R>=B8.minL).forEach(R=>{const L=W-B8.col-R;add('cmd',L);add('pty',R);add('foes',L);add('foes',R);});
  const padB=parseFloat(getComputedStyle(document.body).paddingBottom)||0,avail=vh-b3DocTop(bat)-padB-2;
  if(avail<B8.crH)B8.Rc.forEach(R=>{const L=W-B8.col-R;if(L<WIDE_W*B8.min+8)return;add('cmd',R);add('pty',L);add('foes',L);add('foes',R);});
  const seen=new Set();return out.filter(p=>{const k=p[0]+'@'+p[1];if(seen.has(k))return false;seen.add(k);return true;});}
// one hidden copy, made exactly as b8HAt makes it (null when b8HAt would not make one)
function s19Copy(kind,w,bat){
  if(kind==='cmd'){const cmd=document.getElementById('bcmd');if(!(cmd&&cmd.parentNode&&!(B.mode==='cmd'&&B.menu!=='root')&&!B.swapAsk))return null;
    const c=cmd.cloneNode(true);c.removeAttribute('id');
    c.style.cssText='position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;width:'+w+'px;height:auto;max-height:none;overflow:visible;grid-row:auto;grid-column:auto';
    return {c,par:cmd.parentNode,tags:false};}
  const src=bat.querySelector(kind==='foes'?'#bparty .pgroup.foes':'#bparty .b3pty');if(!src)return null;
  const c=src.cloneNode(true);c.style.cssText+=';position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;width:'+w+'px;height:auto;max-height:none;margin:0;grid-row:auto;grid-column:auto;display:'+(kind==='foes'?'flex':'grid');
  c.querySelectorAll('.fcs,.pcs,.pgroup').forEach(f=>{f.style.maxHeight='none';f.style.overflow='visible';f.style.gridAutoRows='auto';f.style.flex='none';});
  return {c,par:src.parentNode,tags:true};}
// lays out every copy at once: the raw heights by 'kind@width' (the command panel's top level estimate is b8CmdEst's, cached per battle)
function s19Batch(bat,vh){const pairs=s19Pairs(bat,vh),M=new Map(),C=[];
  pairs.forEach(([k,w])=>{const o=s19Copy(k,w,bat);if(o){o.k=k;o.w=w;C.push(o);}else if(k==='cmd')C.push({k,w,c:null});});
  // b8CmdEst first (its own copies, one layout, then cached for the battle state), so the batch below is the only other layout
  const ce={};pairs.forEach(([k,w])=>{if(k==='cmd')ce[w]=b8CmdEst(w);});
  const live=C.filter(o=>o.c);live.forEach(o=>o.par.appendChild(o.c));S19.n.copies+=live.length;
  try{// the party and foe copies wrap a hero's tags when they overflow (b8HAt's step): clear, read every copy, then set
    live.forEach(o=>{if(o.tags)o.c.querySelectorAll('.tagwrap').forEach(x=>x.classList.remove('tagwrap'));});
    const wrapT=[];live.forEach(o=>{if(o.tags)o.c.querySelectorAll('.pcw.hastags>.ptags').forEach(t=>{if(t.scrollWidth>t.clientWidth+1)wrapT.push(t);});});
    wrapT.forEach(t=>t.parentNode.classList.add('tagwrap'));
    C.forEach(o=>{let h=o.k==='cmd'?ce[o.w]:0;if(o.c)h=Math.max(h,o.c.offsetHeight);M.set(o.k+'@'+o.w,h);});}
  finally{live.forEach(o=>o.c.remove());}
  S19.n.batch++;return M;}
// a render can fit the stage more than once in the same task (fitBattle after layoutBattle): an identical question set (same panels, same
// markup, same classes and widths) is answered from the batch already made in this task, as fix18 did for single questions
function s19Key(bat,vh){const q=s=>{const e=bat.querySelector(s);return e?e.className+'#'+e.innerHTML:'-';},c=document.getElementById('bcmd');
  return [B.id||0,bat.clientWidth,Math.round(vh*100),bat.className,B.mode,B.menu,B.swapAsk?1:0,B.auto?1:0,B.over?1:0,c?c.className+'#'+c.innerHTML:'-',q('#bparty .pgroup.foes'),q('#bparty .b3pty')].join('|');}
function s19Memo(){if(!S19.memo){S19.memo=new Map();const done=()=>{S19.memo=null;};try{queueMicrotask(done);}catch(e){Promise.resolve().then(done);}}return S19.memo;}
{const ws0=b3WideSc;b3WideSc=function(w,vh,wrap,bat){if(S19.off||!B||!bat)return ws0.apply(this,arguments);
  try{bat.classList.toggle('b8short',vh<B8.shortH);/* as b3WideSc does first: the copies are measured in the same state */
    const k=s19Key(bat,vh),Mm=s19Memo();let M=Mm.get(k);if(M)S19.n.reuse++;else{M=s19Batch(bat,vh);Mm.set(k,M);}
    S19.pre={M,tight:bat.classList.contains('b8tight')};}catch(e){S19.pre=null;}
  try{return ws0.apply(this,arguments);}finally{S19.pre=null;}};}
// b8HAt answers from the batch while the compaction state is the one it was measured in (b3WideSc may compact the cards and ask again)
{const h0=b8HAt;b8HAt=function(kind,w){const P=S19.pre;if(S19.off||!P||!B)return h0.apply(this,arguments);
  try{const bat=document.querySelector('.battle.b3');w=Math.round(w);const tight=!!(bat&&bat.classList.contains('b8tight'));const h=P.M.get(kind+'@'+w);
    if(h==null||tight!==P.tight){S19.n.miss++;return h0.apply(this,arguments);}
    const key=kind+'@'+w+(tight?'t':'');B._b8h=B._b8h||{};S19.n.hit++;return B._b8h[key]=Math.max(B._b8h[key]||0,h);}catch(e){return h0.apply(this,arguments);}};}
