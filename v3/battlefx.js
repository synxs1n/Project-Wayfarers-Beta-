// =================== BATTLE READABILITY (Beta v0.2.0) ===================
// Floating numbers follow battle speed, a scrollable battle log, and tappable status icons with a details popup.
const LOG_MAX=50;
// floating text stays readable: 1.1s at 1x, never shorter than 0.75s even at 2x
function numDur(){return clamp(1.5/(META.cfg.speed||1),.9,1.8);}
// Beta v0.3.1: every floating text stays 1.2-1.8s (scaled by speed, never under 0.9s); reactions, statuses and other
// important lines get +0.6s, and long text gets a little more per letter
function fxDur(f){let d=numDur();if(/react|stat|effx|BREAK/.test(f.cls)||f.txt==='BREAK')d+=.6;const L=String(f.txt).length;if(L>8)d+=Math.min(.7,.04*(L-8));return +d.toFixed(2);}
function banDur(bn){const sp=META.cfg.speed||1;let d=clamp(2.2/sp,1.4,2.4);const L=String(bn.txt).length;if(L>12)d+=Math.min(.8,.04*(L-12));return +d.toFixed(2);}
{const lg0=log;log=function(m){if(!B)return;B.log.push(m);if(B.log.length>LOG_MAX)B.log.splice(0,B.log.length-LOG_MAX);B.logT=Date.now();};}
{const fb0=finishBattle;finishBattle=function(){try{if(B)FB.lastLog=B.log.slice(-10);}catch(e){}return fb0.apply(this,arguments);};}

// ----- status icons -----
// Every unit gets a row of small buttons: ailments and boons (with turns left), its Primed mark, and the weather.
function unitOf(ref){if(!B)return null;const [side,i]=String(ref).split(':');return side==='e'?B.en[+i]:allParty()[+i];}
function unitRef(u){return u.side==='e'?'e:'+B.en.indexOf(u):'p:'+allParty().indexOf(u);}
// Beta v0.3.1: icons in priority order (Primed, Broken, ailments by turns left, boons, weather); with opt.max the rest fold into "+N"
function stItems(u,o){const ref=unitRef(u),L=[];
  if(u.primed&&ELC[u.primed.el])L.push(`<button class="sti prime" style="--c:${ELC[u.primed.el]}" data-act="stInfo" data-arg="${ref}|primed" aria-label="Primed with ${EL[u.primed.el]}">⟐${ico(u.primed.el)}<sub>${u.primed.t||''}</sub></button>`);
  if(u.broken&&u.maxShield)L.push(`<button class="sti bad" style="--c:#ffd04a" data-act="stInfo" data-arg="${ref}|broken" aria-label="Broken">${stSym('broken')}</button>`);
  const ks=Object.keys(u.st||{}).filter(k=>STS[k]).sort((a,b)=>(STS[b].bad?1:0)-(STS[a].bad?1:0)||(u.st[a].t||0)-(u.st[b].t||0));
  ks.forEach(k=>{const d=STS[k],t=u.st[k].t;L.push(`<button class="sti ${d.bad?'bad':'good'}" style="--c:${d.c}" data-act="stInfo" data-arg="${ref}|${k}" aria-label="${esc(d.n)}${t?', '+t+' turns left':''}" title="${esc(d.n)}">${stSym(k)}${t&&t<9?`<sub>${t}</sub>`:''}</button>`);});
  if(!o.noWx&&B.weather&&B.weather!=='clear'){const W=WEATHER[B.weather];L.push(`<button class="sti wx" data-act="stInfo" data-arg="${ref}|weather" aria-label="${esc(W.n)}">${W.i}</button>`);}
  return L;}
function stButtons(u,opt){
  if(!B||!u||u.hp<=0)return '';const o=opt||{},L=stItems(u,o);
  if(o.max&&L.length>o.max){const more=L.length-(o.max-1);return L.slice(0,o.max-1).join('')+`<button class="sti more" data-act="stInfo" data-arg="${unitRef(u)}|all" aria-label="${more} more effects">+${more}</button>`;}
  return L.join('');
}
// one icon row per unit on the stage, placed so no row is covered by another row, a sprite's body or the stage edge
function stageTags(){
  if(!B)return '';const W=BL.W,H=BL.H,IW=15,RH=10,placed=[],out=[];
  const units=B.en.filter(e=>e.hp>0).concat(B.front.filter(c=>c.hp>0)).map(u=>({u,b:unitBox(u)})).filter(o=>o.b);
  const bodies=units.map(o=>({x:o.b.x-o.b.w*.3,y:o.b.y-o.b.h*.8,w:o.b.w*.6,h:o.b.h*.75,u:o.u}));
  const hit=(r,q)=>r.x<q.x+q.w&&r.x+r.w>q.x&&r.y<q.y+q.h&&r.y+r.h>q.y;
  units.sort((a,b)=>b.b.y-a.b.y).forEach(({u,b})=>{const n=Math.min(4,stItems(u,{}).length);if(!n)return;const w=n*IW+2;
    const sh=u.maxShield?7:0;/* v0.4.0 1.3: the shield pips own the strip right under the HP bar, tags start below it */const cands=[b.y+7+sh,b.y+17+sh,b.y-b.h-RH+2,b.y-b.h-2*RH+2,b.y-Math.round(b.h/2)];let pos=null;
    for(const y0 of cands){const y=clamp(y0,1,H-RH-1),x=clamp(Math.round(b.x-w/2),1,W-w-1),r={x,y,w,h:RH};
      if(!placed.some(q=>hit(r,q))&&!bodies.some(q=>q.u!==u&&hit(r,q))){pos=r;break;}}
    if(!pos){const y=clamp(b.y+7+sh,1,H-RH-1),x=clamp(Math.round(b.x-w/2),1,W-w-1);pos={x,y,w,h:RH};}
    placed.push(pos);out.push(`<div class="utags ${u.side}" style="left:${pos.x}px;top:${pos.y}px;width:${pos.w}px">${stButtons(u,{max:4})}</div>`);});
  return out.join('');
}
function stPopHtml(){
  const P=B&&B.stPop;if(!P)return '';const u=unitOf(P.ref);if(!u){B.stPop=null;return '';}
  let title='',body='',src='',dur='';
  if(P.k==='all'){title='All effects';body=Object.keys(u.st||{}).filter(k=>STS[k]).map(k=>`<b>${stSym(k,"big")} ${STS[k].n}</b> (${u.st[k].t} turns): ${STS[k].d}`).join('<br>')+(u.primed?`<br><b>Primed: ${EL[u.primed.el]}</b> (${u.primed.t} turns)`:'')||'Nothing.';}
  else   if(P.k==='weather'){const W=WEATHER[B.weather]||WEATHER.clear;title=`${W.i} ${W.n}`;body=W.d;src='The weather over this battlefield.';dur='Lasts the whole fight.';}
  else if(P.k==='primed'){if(!u.primed){B.stPop=null;return '';}const el=u.primed.el,L=Object.keys(REACT).map(k=>REACT[k]).filter(R=>R.p===el);
    title=`⟐ Primed: ${EL[el]}`;body=`A ✸ Detonator of a matching element sets off a reaction: ${L.map(R=>`${EL[R.d]} → ${R.n}`).join(', ')}. A primed foe can't be primed again until this fades or detonates.`;src=u.primed.by?`Primed by ${u.primed.by}.`:'';dur=`Fades after ${u.primed.t} more of its turn${u.primed.t===1?'':'s'}.`;}
  else if(P.k==='broken'){title='Broken';body='Its shield is shattered: it takes 50% more damage and loses its next turn.';dur='Recovers after it reels.';}
  else{const st=(u.st||{})[P.k],d=STS[P.k];if(!st||!d){B.stPop=null;return '';}title=d.n;body=d.d;
    src=st.src?(st.src==='self'?'Self-applied.':`From ${st.src}.`):'';dur=P.k==='ward'?'Until it blocks a hit, or '+st.t+' more turns.':P.k==='focus'?'Until the next attack, or '+st.t+' more turns.':P.k==='stun'?'Skips its next turn.':`${st.t} more turn${st.t===1?'':'s'} (counted on ${esc(u.name)}'s turns).`;
    if(st.v)body+=` About ${st.v} per turn.`;}
  return `<div class="stpop" role="dialog" aria-label="${esc(title)}"><div class="sth"><b>${esc(u.name)}</b><button class="btn sm" data-act="stClose" aria-label="Close">✕</button></div><h5>${STS[P.k]||P.k==='broken'?stSym(P.k,'big')+' ':''}${esc(title)}</h5><p>${body}</p>${src?`<small>${src}</small>`:''}${dur?`<small>${dur}</small>`:''}</div>`;
}
// ----- the battle log panel -----
function blogPanel(){if(!B||!B.logOpen)return '';
  return `<div class="blogp" role="dialog" aria-label="Battle log"><div class="sth"><b>Battle log</b><small class="nums">${B.log.length} entries</small><button class="btn sm" data-act="blogT" aria-label="Close log">✕</button></div><ol reversed>${B.log.slice().reverse().map(l=>`<li class="${/falls!|BREAK|detonates|Quirk/.test(l)?'hi':''}">${esc(l)}</li>`).join('')}</ol></div>`;}
Object.assign(ACT,{
  stInfo(a){if(!B)return;const [ref,k]=String(a).split('|');B.stPop=B.stPop&&B.stPop.ref===ref&&B.stPop.k===k?null:{ref,k};renderBattle();const c=document.querySelector('.stpop [data-act="stClose"]');if(c&&document.activeElement&&document.activeElement.classList&&document.activeElement.classList.contains('sti'))c.focus();},
  stClose(){if(B){B.stPop=null;renderBattle();}},
  blogT(){if(!B)return;B.logOpen=!B.logOpen;renderBattle();if(B.logOpen){const o=document.querySelector('.blogp ol');if(o)o.scrollTop=o.scrollHeight;}}
});
