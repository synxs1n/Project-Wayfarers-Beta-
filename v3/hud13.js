// ===== hud13.js (v0.19.7): one ornament language for the battle HUD, and a realm colour grade on the plates =====
// Owner: the Cinzel area banners (titles12) and the gilded modal frames have a voice; the battle HUD plates, the foe cards, the order bar,
// the command menu, the Momentum bar, the chips and the skill tag strips were plainer rectangles. And: a subtle tint per realm on the HUD.
// 1) The language is hud13.css (appended after titles12.css, every rule scoped under html:not(.flat) and overriding battle3.css / ui3.css /
//    battle4.css from outside): hairline gold rules with the modal's bevel (a dark gap, then a dim gold inner rule), the modal filigree at
//    plate scale (--orn-s-*: a 12 px L with diamond ends) on the party, foe and Rearguard groups, the boss plaque and the Momentum gauge,
//    the Cinzel face (--ffan, titles12) for the small-caps labels (NEXT, VANGUARD, FOES, REARGUARD, Momentum, the name in "X's turn") while
//    names, numbers, command words and the log stay in Nunito; one chip shape (3 px corners, a 1 px hairline drawn inside the chip) and
//    12 px symbols on the sky chips, the skill row tags (scope, purpose, delivery), the m12 tag strips, the Weak / Res rows. No padding,
//    min-height or font size of a plate changes, so the planners measure what they measured before (tools/chrome/v179a.js checks every
//    plate against the v0.19.6 heights within 2 px).
// 2) The colour grade: h13Apply reads the realm accent the area banner reads (THEME[theme].dec, titles12; the first saturated swatch, so a
//    white or grey swatch never gives a hue; T12_TINT pulls it toward the kind for a town, den, lair or Sanctum and gives the Breach and the
//    Echo Rift their own) and moves the hue of every Gilded Night base colour H13.k (16%) of the way toward it, at the base's own saturation
//    and lightness: a hue shift, never a saturation jump; the gold tokens are never touched. The results are CSS variables on <html>
//    (--h13a the accent, --h13p1/p2 panels, c1/c2 hero cards, f1/f2 foe cards, k1/k2 chips, o1/o2 and e1/e2 order chips, m the Momentum
//    trough, b1 its plate, r1/r2 the result title bar, h1/h2 the command header, g1 and q1/q2 the groups, l1 the dark end of the strips,
//    n1/n2 the compact foe list, t1 the tag strips); hud13.css reads them with the base colour as the fallback.
//    A battle takes its backdrop's realm (ZS(B.stage).theme; the Breach through brBattle, so a Breach boss fight on a realm backdrop keeps
//    the realm; the Rift through spec.rift / riftkeeper); the arena and the Weekly Trial take no tint; the world takes the map's
//    (t12Info). Applied after every render and showLocation; nothing is set again while the key (look/theme) is unchanged.
const H13={k:.16,key:null,vars:null,
  base:{p1:'#1b1f33',p2:'#111424',c1:'#1f2339',c2:'#141728',f1:'#2a1823',f2:'#180e15',k1:'#1d2a40',k2:'#141d2e',o1:'#24406a',o2:'#132438',e1:'#5a2228',e2:'#2e1016',
    m:'#2a2638',b1:'#0a0c16',r1:'#22273f',r2:'#181b2e',h1:'#1d2136',h2:'#191c30',g1:'#1c223a',q1:'#3c1018',q2:'#1e080e',l1:'#0e101c',n1:'#2c161e',n2:'#160d16',t1:'#2a2438'}};
function h13Hsl(hex){const [r0,g0,b0]=t12Rgb(hex),r=r0/255,g=g0/255,b=b0/255,M=Math.max(r,g,b),m=Math.min(r,g,b),l=(M+m)/2;let h=0,s=0;
  if(M!==m){const d=M-m;s=l>.5?d/(2-M-m):d/(M+m);h=M===r?((g-b)/d+(g<b?6:0)):M===g?((b-r)/d+2):((r-g)/d+4);h*=60;}return [h,s,l];}
function h13Hex(h,s,l){const f=n=>{const k=(n+h/30)%12,a=s*Math.min(l,1-l);return l-a*Math.max(-1,Math.min(k-3,9-k,1));};
  return '#'+[0,8,4].map(n=>Math.round(f(n)*255).toString(16).padStart(2,'0')).join('');}
// the base colour with its hue moved k of the way (the short way round) toward the accent's hue; saturation and lightness as they were
// (and the base's relative luminance: a few steps on the lightness put it back, so text contrast on the plate is what it was)
function h13Lum(hex){const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);},[r,g,b]=t12Rgb(hex);return .2126*f(r)+.7152*f(g)+.0722*f(b);}
function h13Shift(base,acc,k){const [h0,s0,l0]=h13Hsl(base),[ha,sa]=h13Hsl(acc);if(sa<.08)return base;const d=((ha-h0)%360+540)%360-180,h=((h0+d*k)%360+360)%360,Y=h13Lum(base);
  let lo=Math.max(0,l0-.06),hi=Math.min(1,l0+.06),out=h13Hex(h,s0,l0);for(let i=0;i<10;i++){const l=(lo+hi)/2,c=h13Hex(h,s0,l);out=c;if(h13Lum(c)>Y)hi=l;else lo=l;}return out;}
// the realm accent for a look (field, town, den, lair, sanctum, breach, rift) and a THEME key: the banner's source (titles12)
function h13Accent(look,theme){const T=(typeof THEME!=='undefined'&&THEME[theme])||THEME.meadow,dec=T.dec||['#f2c93a','#f6e06a'];
  const sw=[dec[1],dec[0]].concat(dec.slice(2)).find(c=>c&&h13Hsl(c)[1]>=.25)||dec[1]||dec[0]||'#f2c93a',tint=T12_TINT[look];
  return tint?t12Mix(sw,tint,look==='breach'||look==='rift'?.85:.45):sw;}
// what the screen shows now: {look,theme}, null for no tint (arena, the Weekly Trial), undefined to keep the last (menus, title)
function h13Look(){try{
  if(V.screen==='battle'&&B&&B.spec){const sp=B.spec,theme=ZS(B.stage).theme;if(sp.kind==='arena'||sp.kind==='daily')return null;
    if(typeof brBattle==='function'&&brBattle(sp))return {look:'breach',theme};
    if(sp.rift||sp.kind==='riftkeeper')return {look:'rift',theme};return {look:'field',theme};}
  if(V.screen==='world'&&WS&&WS.m){const i=t12Info(WS.m);return {look:i.look,theme:i.theme};}
  }catch(e){}return undefined;}
function h13Apply(){const info=h13Look();if(info===undefined)return;const key=info?info.look+'/'+info.theme:'';if(key===H13.key)return;H13.key=key;
  const st=document.documentElement.style;if(!info){st.removeProperty('--h13a');Object.keys(H13.base).forEach(k=>st.removeProperty('--h13'+k));H13.vars=null;return;}
  const a=h13Accent(info.look,info.theme),v={a};st.setProperty('--h13a',a);Object.keys(H13.base).forEach(k=>{v[k]=h13Shift(H13.base[k],a,H13.k);st.setProperty('--h13'+k,v[k]);});H13.vars=v;}
HOOK.after('render','hud13','realm tint variables on the HUD',function(){try{h13Apply();}catch(e){}});
HOOK.after('showLocation','hud13','realm tint when the map changes',function(){try{h13Apply();}catch(e){}});
