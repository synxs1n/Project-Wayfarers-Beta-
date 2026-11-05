// =================== Beta v0.5.0 4.3: XP CATCH UP ===================
// A hero below the party's highest level gets XPCU.per more battle XP per level of gap, at most XPCU.max (config.js). A front row hero
// gets the whole bonus, a reserve (benched) hero XPCU.bench of it, the fallen still get nothing, and heroes at the top level get no bonus.
// It replaces the old flat x1.4 for heroes four or more levels behind (the share line in win(), engine.js): that factor is divided back
// out here so the two never stack. The Daily Trial is untouched. The result screen lists the bonus (info.catchup, ui wrapper in p4party.js).
// Pure engine code (no DOM) so the node sims can load it: SIMEXTRA=v3/p4xp.js node pacing.js ...
let XPC=null;
function xpCatchMul(lv,max,front){const gap=Math.max(0,(max|0)-(lv|0));if(!gap)return 1;return 1+Math.min(XPCU.max,XPCU.per*gap)*(front?1:XPCU.bench);}
{const w0=win;win=function(){
  XPC=null;
  try{if(B&&G&&!G.daily&&B.spec&&B.spec.kind!=='daily'){const P=B.front.concat(B.back);XPC={max:Math.max(...P.map(c=>c.lv)),front:B.front.slice(),all:P,rows:[]};}}catch(e){XPC=null;}
  try{return w0.apply(this,arguments);}
  finally{try{if(XPC&&XPC.rows.length&&B&&B.result)B.result.catchup=XPC.rows;}catch(e){}XPC=null;}};}
{const ax0=addXp;addXp=function(c,x){
  if(XPC&&c&&x>0&&XPC.all.includes(c)){
    const front=XPC.front.includes(c),old=c.lv<XPC.max-3?1.4:1,m=xpCatchMul(c.lv,XPC.max,front),base=x/old;
    x=Math.round(base*m);
    if(m>1)XPC.rows.push({id:c.id,name:c.name,pct:Math.round((m-1)*100),xp:Math.max(0,x-Math.round(base)),front});}
  return ax0.apply(this,[c,x].concat([].slice.call(arguments,2)));};}
