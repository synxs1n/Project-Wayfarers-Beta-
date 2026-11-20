// ===== act49.js (v0.22.49): the action menu's numbers and tags =====
// Asked (one message):
//  1 "rework the look of the power rating of skills, maybe should fit in full Power word. Have it fit cleanly and clearly": the strip says
//    "Power 150" in a small framed tag (it was "Pow 150" between the other words), in battle and on the hero sheet.
//  2 "we should be able to tap on different enemies and the numbers change to reflect what they would do against that enemy specifically, if
//    aoe, shows average damage": with the command menu or a list open, a tap on a foe (on the stage or its card) makes it the foe the
//    estimates are worked out against (B.a49f). Single target skills and the basic Attack show the number against that foe; skills that hit
//    several foes show the average over the foes alive. Until a foe is tapped the number is the average, as before. A line in the list says
//    which it is.
//  3 "Regular attacks should show their element, damage type and damage numbers in the action menu": the Attack button carries them.
//  4 "Guard button stopped glowing when it's good time to guard": the glow of battle5.js was still set, but the newer menu looks (the HD
//    theme, battle27.js) draw their own border and shadow over it. It is drawn with more weight here.
//  5 "Sub role percent changes should only be a rule behind the scenes": the "Sub x80%" / "Off x50%" tag is gone from every skill row. The
//    rule itself (skills12.js sk12Mult) is unchanged.
//  6 "Shield equip slots should show when you can't equip a shield because the character is using a 2 handed weapon. (Skills like shield
//    throw should only be there when a shield is attached)": the slot texts are in ui.js, equip.js and p3shop.js. A skill done WITH the shield
//    (S49.need: Shield Bash, Shield Brand, Shield Throw, Shield Ally) is only known in battle while a shield is worn; the hero sheet marks
//    it "Needs a shield". So that no Knight starts without half a kit, a Knight is handed a plain shield (new heroes, and once for saves).
const S49={need:{knight:{bash:1,sburst:1,javelin:1,r_cover:1}},off:false};
// ---------- 5 no sub role tag ----------
try{sk12Tag=function(){return '';};}catch(e){}
// ---------- 1 Power ----------
{const s0=sr11Strip;sr11Strip=function(){let h=s0.apply(this,arguments);try{h=String(h).replace(/<i class="sk11p" title="Power">Pow (\d+)<\/i>/,'<i class="sk11p" title="Power">Power $1</i>').replace(/(<b class="sk11e" title="Power">)Pow (\d+)(<\/b>)/,'$1Power $2$3');}catch(e){}return h;};}
// ---------- 2 the foe the numbers are for ----------
function a49Foe(){try{if(!B||B.a49f==null)return null;const e=B.en[B.a49f];return e&&e.hp>0?e:null;}catch(e){return null;}}
const a49One=s=>!!s&&(s.k==='phys'||s.k==='mag')&&(!s.t||s.t==='one'||s.t==='chain');
{const n0=skNum;skNum=function(a,s){try{const e=a49One(s)&&a&&a.side==='p'?a49Foe():null;if(e){const r0=RNG,foc=a.st&&a.st.focus;let d=0;try{RNG=()=>.5;d=calcDamage(a,s,e).dmg;}finally{RNG=r0;if(foc&&a.st&&!a.st.focus)a.st.focus=foc;}return '~'+Math.round(d*(s.hits||1));}}catch(e){}return n0.apply(this,arguments);};}
{const t0=ACT.tgtE;ACT.tgtE=function(i){try{if(!S49.off&&B&&B.mode==='cmd'&&!B.pend&&B.cur&&B.cur.side==='p'&&!B.auto&&B.en[+i]&&B.en[+i].hp>0&&(B.menu==='skills'||B.menu==='root')){B.a49f=+i;if(B.menu==='skills'){renderBattle();return;}}}catch(e){}return t0.apply(this,arguments);};}
// ---------- 3 the Attack button, and the line that says whom the numbers are for ----------
HOOK.xform('cmdHtml','act49','Attack shows element, kind and estimate; the list names the foe the numbers are for',function(h){try{const a=B&&B.cur;if(!a||B.mode!=='cmd'||a.side!=='p')return h;h=String(h);
  if(B.menu==='root'){const sk=atkFor(a),k=deliveryOf(a,sk),els=typeof skEls==='function'?skEls(sk):[].concat(sk.el||[]);let est='';try{est=skNum(a,sk)||'';}catch(e){}
    const info=`<span class="a49a">${els.length?els.map(e=>ico(e)).join(''):'<i class="a49ne" title="A basic attack has no element">No element</i>'}${k?dlIco(k)+`<i>${esc(DL_NAME[k]||k)}</i>`:''}${est?`<b>${est}</b>`:''}</span>`;
    h=h.replace(/(<button class="mi[^"]*" data-act="cmd" data-arg="attack"[^>]*>)Attack(<\/button>)/,(m,p,q)=>p+'<span class="a49n">Attack</span>'+info+q);}
  if(B.menu==='skills'){const e=a49Foe(),n=(B.en||[]).filter(x=>x.hp>0).length,txt=e?`Numbers against <b>${esc(e.name)}</b>`:n>1?'Numbers: the average of the foes. Tap a foe to see it for that one.':'';
    if(txt)h=h.replace('<div class="menu list">',`<div class="a49vs">${txt}${e&&n>1?' <small>(a skill that hits several shows their average)</small>':''}</div><div class="menu list">`);}
}catch(e){S49.err=String(e&&e.message||e);}return h;});
HOOK.after('renderBattle','act49','mark the foe the numbers are for',function(){try{const i=a49Foe()?B.a49f:-1;document.querySelectorAll('#bstage .unit.foe,#bparty .fc').forEach(el=>{const on=i>=0&&(el.dataset.arg===String(i)||el.dataset.arg==='e:'+i)&&B&&B.mode==='cmd'&&!B.pend&&B.cur&&B.cur.side==='p';el.classList.toggle('a49f',!!on);});}catch(e){}});
// ---------- 6 shield skills need the shield ----------
function s49Needs(c,s){try{const t=c&&TPL[c.id],N=t&&S49.need[t.cls];return !!(N&&s&&N[s.id]&&!s.relic);}catch(e){return false;}}
function s49Has(c){try{const r=(G&&G.roster&&G.roster[c.id])||c;return !!(r&&r.eq&&r.eq.s&&(typeof sh20Ok!=='function'||sh20Ok(r)));}catch(e){return true;}}
{const k0=known;known=function(c){const L=k0.apply(this,arguments);try{if(S49.off||!c||c.side==='e'||!TPL[c.id]||!S49.need[TPL[c.id].cls]||s49Has(c))return L;return L.filter(s=>!s49Needs(c,s));}catch(e){return L;}};}
HOOK.xform('mChar','act49','hero sheet: a shield skill says it needs a shield',function(h,id){try{const c=G&&G.roster[id],t=c&&TPL[id];if(!c||!t||!S49.need[t.cls]||s49Has(c)||typeof h!=='string')return h;
  classSkills(t).forEach(s=>{if(s49Needs(c,s))h=h.split(`<b>${esc(s.n)}</b>`).join(`<b>${esc(s.n)}</b> <em class="qtag a49sh" title="Only while a shield is worn (a shield needs a one-handed weapon)">Needs a shield</em>`);});}catch(e){}return h;});
// a Knight starts with a plain shield; a save from before gets one once
function s49Give(c,tier){try{const t=TPL[c.id];if(!t||t.cls!=='knight'||!c.eq||c.eq.s)return false;if(typeof sh20OneHand==='function'&&!sh20OneHand(c))return false;const id='s_shield_'+Math.max(0,Math.min(5,tier|0));if(!gearOf(id))return false;c.eq.s=id;return true;}catch(e){return false;}}
{const n0=newChar;newChar=function(id,lv,tier){const c=n0.apply(this,arguments);try{if(!S49.off&&s49Give(c,tier)){c.S=calcStats(c);c.hp=c.S.mhp;c.mp=c.S.mmp;}}catch(e){}return c;};}
HOOK.after('unpackG','act49','old saves: a Knight without a shield is handed a plain one, once',function(g){try{if(!g||g.daily||g.s49sh||!g.roster)return;g.s49sh=1;Object.values(g.roster).forEach(c=>{s49Give(c,0);});}catch(e){}});
HOOK.after('newGame','act49','new journeys need no shield hand out',function(){try{if(G)G.s49sh=1;}catch(e){}});
{const st=document.createElement('style');st.id='a49css';st.textContent=`
.m.sk11 .sk11s .sk11p{display:inline-block;padding:0 5px;border:1px solid rgba(255,216,160,.5);border-radius:4px;background:rgba(255,216,160,.1);color:#ffe2b0;font-weight:800;line-height:1.35;white-space:nowrap}
.battle.b3 .cmd .menu .mi[data-arg="attack"]{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.a49a{display:inline-flex;align-items:center;gap:4px;margin-left:auto;font-size:.68rem;font-weight:700;color:#cfd8f0;white-space:nowrap}
.a49a .ico{width:14px;height:14px}.a49a i{font-style:normal}.a49a b{color:#ffd8a0;font-size:.8rem;margin-left:3px}
.a49vs{font-size:.7rem;color:#cfd8f0;padding:1px 4px 3px;line-height:1.25}.a49vs b{color:#ffd8a0}.a49vs small{opacity:.75}
#bstage .unit.foe.a49f::after{content:"";position:absolute;left:50%;bottom:-3px;width:26px;height:6px;margin-left:-13px;border-radius:50%;border:1px solid #ffd8a0;box-shadow:0 0 5px #ffd8a0;pointer-events:none}
#bparty .fc.a49f{box-shadow:0 0 0 2px #ffd8a0}
.a49sh{font-size:.62rem}
.battle.b3 .cmd .menu .mi.b9glow{border-color:#ffd04a!important;box-shadow:0 0 0 2px rgba(255,208,74,.85),0 0 16px rgba(255,190,60,.75),inset 0 0 12px rgba(255,208,74,.22)!important;animation:b9glow 1.2s ease-in-out infinite}
.battle.b3 .cmd .menu .mi.b9glow.cl{border-color:#8ff0c0!important;box-shadow:0 0 0 2px rgba(143,240,192,.8),0 0 16px rgba(120,230,170,.65),inset 0 0 12px rgba(143,240,192,.2)!important}
@keyframes b9glow{0%,100%{filter:none}50%{filter:brightness(1.3)}}
html.rm .battle.b3 .cmd .menu .mi.b9glow{animation:none}
@media (prefers-reduced-motion:reduce){.battle.b3 .cmd .menu .mi.b9glow{animation:none}}
`;document.head.appendChild(st);}
try{window.__S49=S49;}catch(e){}
