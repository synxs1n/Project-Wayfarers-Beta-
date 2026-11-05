// =================== ECHOES IN THE WORLD (Beta v0.3.2) ===================
// New optional fields: G.echoStory {stage:1} (story echoes beaten this journey), G.echoShard {key:1} (first shard taken).
// Account: META.echoRift (synced as profile flags.echoRift) opens every Echo in the Rift once a journey's five story echoes fall.
// ----- echo art: the boss repainted as a violet ghost -----
function echoTint(hex){const h=String(hex).replace('#','');if(h.length<6)return hex;const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16),l=(r*.3+g*.5+b*.2);
  return '#'+[l*.55+70,l*.45+40,l*.5+120].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');}
(function(){echoKeys().forEach(k=>{const d=guardianDef(k);if(!d||!MART[d.art])return;const a=d.art,n='echo_'+a;if(MART[n])return;
  MART[n]=g=>{const o=MART[a](g);const pal={};Object.keys(o.pal).forEach(q=>{pal[q]=echoTint(o.pal[q]);});['K'].forEach(q=>{if(o.pal[q])pal[q]=o.pal[q];});return Object.assign({},o,{pal,glow:'#b48aff'});};
  if(MEXTRA[a])MEXTRA[n]=(g,p)=>{MEXTRA[a](g,p);Object.keys(p).forEach(q=>{if(q!=='K')p[q]=echoTint(p[q]);});};
  if(BIG_ART.includes(a))BIG_ART.push(n);});})();
// ----- story echoes in each cleared dungeon -----
function storyEchoUp(s){return !!(G&&!G.daily&&G.cleared&&G.cleared[s]&&!(G.echoStory||{})[s]&&G.run&&(!G.echoReady||G.echoReady[s]));}
// v0.4.3: a story echo waits until you have left the dungeon once after beating its boss (older saves: always ready)
function echoHold(s){if(!G)return;if(!G.echoReady){G.echoReady={};(G.cleared||[]).forEach((c,i)=>{if(c&&i!==s)G.echoReady[i]=1;});}G.echoReady[s]=0;}
{const ld0=leaveDungeon;leaveDungeon=function(s){try{if(G&&G.echoReady&&G.cleared&&G.cleared[s])G.echoReady[s]=1;}catch(e){}return ld0.apply(this,arguments);};}
function askEcho(s){if(!storyEchoUp(s))return;V.modal={type:'echoAsk',s};render();}
function mEchoAsk(m){const s=m.s,k=bossKeyFor(s),d=guardianDef(k),lv=storyEchoLv(s);
  return box(`Echo of ${esc(d.n)}`,`<div class="row"><img class="mimg" src="${monURL('echo_'+d.art)}" alt=""><div class="grow"><p>A violet afterimage of the ${bossClass(k)} you felled still clings to the rune circle. It remembers how it lost.</p>
    <small>Level ${lv}. Tougher than the original, with a new move (<b>Resounding ${esc((d.sk.find(x=>x[4]!=='buff')||d.sk[0])[0])}</b>) and a second turning point near the end. Optional: the way east is already open.</small>
    <small>First win: its Echo Shard, Echo Essence and a Dread Core. Auto is locked until you win it by hand once.</small></div></div>`,
    `<button class="btn" data-act="closeModal">Leave it</button><button class="btn gold" data-act="echoStory" data-arg="${s}">Fight the Echo</button>`);}
{const vm0=vModal;vModal=function(m){if(m&&m.type==='echoAsk')return mEchoAsk(m);return vm0.apply(this,arguments);};}
// ----- which Echoes answer (the Echo Sanctum, sanctum.js, is the place to fight them) -----
function riftKeys(){if(!G)return [];const own=[0,1,2,3,4].filter(s=>(G.echoStory||{})[s]).map(s=>bossKeyFor(s));return META.echoRift?echoKeys():own;}
Object.assign(ACT,{
  echoStory(s){s=+s;V.modal=null;if(!startBattle({stage:s,kind:'storyEcho',key:bossKeyFor(s)})){toast('Your party needs rest first.');render();}},
  riftFight(k){if(!riftKeys().includes(k))return;V.modal=null;if(!startBattle(riftSpec(k))){toast('Your party needs rest first.');render();}}});
// ----- rewards: shards, essence, more drops than a normal boss; the account unlock -----
{const w0=win;win=function(){const sp=B&&B.spec;const r=w0.apply(this,arguments);try{if(!sp||G.daily)return r;const story=sp.kind==='storyEcho',rift=sp.kind==='echoBoss'&&sp.rift;if(!story&&!rift)return r;
  const k=sp.key,info=V.modal&&V.modal.info||{},add=(id,n)=>{G.mats[id]=(G.mats[id]||0)+n;info.mats=info.mats||{};info.mats[id]=(info.mats[id]||0)+n;};
  G.echoShard=G.echoShard||{};const first=!G.echoShard[k];if(first||RNG()<.65){add('es_'+k,1);G.echoShard[k]=1;}// v0.4.3: a little richer
  add('essence',first?4:2+(RNG()<.5?1:0));if(first||RNG()<.75)add('core',1);add(ZS(Math.min(4,sp.stage)).mat,3);
  {const g=econG(first?600+sp.stage*200:300+sp.stage*120);G.gold+=g;info.gold=(info.gold||0)+g;}
  info.notes=info.notes||[];
  if(story){G.echoStory=G.echoStory||{};G.echoStory[sp.stage]=1;G.echoes[k]=1;info.notes.push(`The Echo of ${guardianDef(k).n} fades. ${G.won?'It will answer again in the Echo Rift.':'Beat the Calamity and it will answer again in the Echo Rift at any waystone.'}`);
    if([0,1,2,3,4].every(s=>G.echoStory[s])&&!META.echoRift){META.echoRift=1;saveMeta();if(typeof profileDirty==='function')profileDirty();info.notes.push('The Echo Rift tears wide open: every Scourge and Calamity of Aurelis can now be fought in echo form, in this journey and every journey after.');}}
  saveGame();render();}catch(e){}return r;};}
// the account flag rides along with the profile doc (flags is a free-form map; schema stays v:1)
{const po0=profileOf;profileOf=function(meta){const p=po0.apply(this,arguments);p.flags.echoRift=meta.echoRift?1:0;return p;};}
{const ar0=applyRemote;applyRemote=function(r){if(r&&r.flags&&r.flags.echoRift)META.echoRift=1;return ar0.apply(this,arguments);};}
// pork chops, battle backdrop and music treat a story echo like its boss
{const pb0=porkBlocked;porkBlocked=function(){if(B&&B.spec&&B.spec.kind==='storyEcho')return true;return pb0.apply(this,arguments);};}
{const bt0=battleTheme;battleTheme=function(){if(B&&B.spec&&B.spec.kind==='storyEcho')return 'd_'+ZS(B.stage).theme;return bt0.apply(this,arguments);};}
// ----- Bestiary: echo forms are their own entries -----
{const ba0=bestAll;bestAll=function(){const out=ba0();echoKeys().forEach(k=>{const d=echoDef(k);if(d){d.art=MART['echo_'+d.art]?'echo_'+d.art:d.art;out.push({k:'echo_'+k,d,g:1,echo:1});}});return out;};}
{const mb0=mBeast;mBeast=function(m){let h=mb0.apply(this,arguments);if(m&&String(m.k).startsWith('echo_'))h=h.replace('Which one waits where changes each journey.','An Echo: it lingers in its dungeon after you beat the original, and answers in the Echo Rift. Echoes do not count toward the Archive or the Stick.');return h;};}
// ----- the Echoforge (Smithy) -----
function efTabOn(){return !!G&&(G.won||ECHO_CAT.ids.some(id=>(G.mats[id]||0)>0));}
function efBaseIn(f){const re=new RegExp('^w_'+f+'_5(\\+(\\d))?$');let best=-1,id=null;G.gear.forEach((g,i)=>{const m=String(g).match(re);if(m){const p=+(m[2]||0);if(p>best){best=p;id=i;}}});return id==null?null:{i:id,plus:best};}
function vEchoforge(){return `<p class="note">Echoforged weapons: the strongest steel in Aurelis, about ${Math.round((EF_K-1)*100)}% above the best shop weapon, each with its own perk. Each needs ${EF_SHARDS} Shards from three different Echoes, ${EF_ESS} Echo Essence, ${EF_CORE} Dread Cores, ${fmt(EF_GOLD)} gold and a tier 6 weapon of the same kind from your pack (its tempering carries over). Shards only come from Echoes.</p>`+
  Object.keys(ECHOFORGE).map(f=>{const E=ECHOFORGE[f],id='w_'+f+'_ef',g=GEAR[id],b=GEAR['w_'+f+'_5'],m=efCost(f),base=efBaseIn(f),ok=!!base&&hasMats(m)&&G.gold>=EF_GOLD;
    return `<div class="row rec ${ok?'ready':''}">${gearIcon(id)}<div class="grow"><b>${esc(g.n)}</b><small>${gearDesc(g)}. Perk: ${esc(E.perk)}.</small><small>vs ${esc(b.n)}: ${gearDesc(b)}</small>${bestTag(id)}
      <div class="mats">${matChips(m)}<span class="matc gold ${G.gold>=EF_GOLD?'':'short'}"><i></i><b class="nums">${fmt(EF_GOLD)}</b> gold</span><span class="matc ${base?'':'short'}"><i></i>${esc(b.n)}${base&&base.plus?' +'+base.plus:''} <b class="nums">${base?1:0}/1</b></span></div></div>
      <button class="btn sm ${ok?'gold':''}" data-act="efForge" data-arg="${f}" ${ok?'':'disabled'}>Forge</button></div>`;}).join('');}
ACT.efForge=function(f){if(!ECHOFORGE[f])return;const m=efCost(f),base=efBaseIn(f);if(!base||!hasMats(m)||G.gold<EF_GOLD){sfx('deny');return;}
  G.gold-=EF_GOLD;payMats(m);G.gear.splice(base.i,1);const id='w_'+f+'_ef'+(base.plus?'+'+base.plus:'');G.gear.push(id);saveGame();sfx('chest');toast('Forged: '+gearOf(id).n);render();if(typeof queueNewGear==='function')queueNewGear([id],true);};
// a recognizable look: violet frame and a spark on the icon
{const gi0=gearIcon;gearIcon=function(id){const g=gearOf(id);if(!g||!g.ef)return gi0.apply(this,arguments);const key='gie:'+g.ef+':'+(g.plus||0);
  return `<img class="gico ef" alt="" src="${cvURL(key,()=>{const c=mkCv(16,16),x=c.getContext('2d');x.fillStyle='#2a1640';x.fillRect(0,0,16,16);x.fillStyle='#b48aff';x.fillRect(0,0,16,1);x.fillRect(0,15,16,1);x.fillRect(0,0,1,16);x.fillRect(15,0,1,16);
    const fam=gearFamOf(id);(GICON[fam]||GICON.charm).forEach(([a,b,w,h])=>{x.fillStyle='#1a0a2a';x.fillRect(a-1,b-1,w+2,h+2);});(GICON[fam]||GICON.charm).forEach(([a,b,w,h],i)=>{x.fillStyle=i?'#8a5ad0':'#e0c8ff';x.fillRect(a,b,w,h);});
    x.fillStyle='#fff';x.fillRect(12,2,1,3);x.fillRect(11,3,3,1);if(g.plus){x.fillStyle='#ffd04a';for(let i=0;i<g.plus;i++)x.fillRect(12-i*3,13,2,2);}return c;})}">`;};}
// gear text mentions the perk
{const gd0=gearDesc;gearDesc=function(id){let s=gd0.apply(this,arguments);try{const g=typeof id==='string'?gearOf(id):id;if(g&&g.ef&&g.efPerk)s+=(s?', ':'')+g.efPerk;}catch(e){}return s;};}
