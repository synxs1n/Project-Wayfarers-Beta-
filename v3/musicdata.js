// ===== musicdata.js (v0.4.5): the score: every track as data, MGAIN levels =====
// Every track here is composed by hand around one motif, the Meridian:  G4q C5q. D5e E5q | D5q B4q C5h  (written in C).
// It is hopeful on the title, warm in towns, heroic in victory and broken in the minor (E4q A4q. B4e C5q | B4q G#4q A4h) in dungeons,
// boss fights and the Calamity, where it is bent again with a flat second.
//
// NOTATION (one string per part, bars split by | which is only for reading):
//   note   = pitch + octave + length, e.g. D5q.  Lengths w h q e s (whole to 16th), '.' dots, several add up (C5hq = 3 beats)
//   chord  = pitches joined by +, e.g. C4+E4+G4h        rest = r + length, e.g. rq        dynamics = pp p mp mf f ff (until changed)
//   a trailing ! accents a note.
// CHORDS: one token per bar (Am, F, G7, Bb, Dsus4 ...); add :beats for shorter ones (Dm:2 G:2). x = no chord.
// ACCOMPANIMENT patterns follow the chords: pad, arp8, arp16, arp68, bass, bassq, bass8, walk, oompah, ost8, ost16, pulse8, stab, drone, pedal
// DRUMS: one character per 16th, repeating: X accent, x hit, o soft, R roll (timpani). Kinds: sn bd cym crash swell shk tri drip timp taiko tom
// A track: {bpm, ts (beats per bar, 6 = 6/8), stretch, tr (semitones), mode, room, swing, resume, stems, intro, form, sec}
const MD_DUR={w:16,h:8,q:4,e:2,s:1},MD_DYN={ppp:.25,pp:.35,p:.5,mp:.62,mf:.75,f:.88,ff:1},MD_PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const MD_QUAL={'':[0,4,7],m:[0,3,7],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],sus4:[0,5,7],sus2:[0,2,7],dim:[0,3,6],aug:[0,4,8],'5':[0,7],add9:[0,4,7,14],madd9:[0,3,7,14]};
// sample ranges (from tools/audio/build_instruments.py); notes outside are folded by octave
const MD_RANGE={strings:[40,88],tremolo:[43,79],pizz:[36,84],cello:[36,67],bass:[28,55],harp:[36,96],flute:[60,96],oboe:[58,88],clarinet:[50,86],horn:[41,77],trumpet:[55,82],
  trombone:[40,70],brass:[41,79],choir:[48,79],organ:[36,84],celesta:[60,96],glock:[72,99],lute:[40,76],fiddle:[55,88],accordion:[48,79],timpani:[38,56],taiko:[40,52],tom:[43,55]};
const MD_ACC={pad:1,drone:1,pedal:1,arp8:1,arp16:1,arp68:1,bass:1,bassq:1,bass8:1,walk:1,ost8:1,ost16:1,pulse8:1,oompah:1,stab:1};
function mdPitch(s){const m=/^([A-G])([#b]?)(\d)$/.exec(s);if(!m)throw new Error('bad pitch '+s);return 12*(+m[3]+1)+MD_PC[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);}
function mdDur(s){let t=0,i=0;while(i<s.length){const d0=MD_DUR[s[i]];if(!d0)throw new Error('bad length '+s);let d=d0;i++;if(s[i]==='.'){d*=1.5;i++;}t+=d;}return t;}
function mdMel(str){let tk=0,v=.8;const ev=[];
  str.trim().split(/\s+/).forEach(tok=>{if(!tok||tok==='|')return;if(MD_DYN[tok]!=null){v=MD_DYN[tok];return;}
    const m=/^((?:[A-G][#b]?\d\+?)+|r)([whqes.]+)(!?)$/.exec(tok);if(!m)throw new Error('bad token '+tok);const d=mdDur(m[2]);
    if(m[1]!=='r')ev.push({tk,ps:m[1].split('+').filter(Boolean).map(mdPitch),d,v:Math.min(1,v*(m[3]?1.15:1))});tk+=d;});
  return {ev,len:tk};}
function mdChords(str,barLen){let t=0;const out=[];
  str.trim().split(/\s+/).forEach(tok=>{if(!tok||tok==='|')return;const m=/^([A-G][#b]?|x)(maj7|madd9|add9|sus4|sus2|dim|aug|m7|m|7|5)?(?::(\d+(?:\.\d+)?))?$/.exec(tok);
    if(!m)throw new Error('bad chord '+tok);const d=m[3]?Math.round(+m[3]*4):barLen;
    if(m[1]!=='x'){const r=(MD_PC[m[1][0]]+(m[1][1]==='#'?1:m[1][1]==='b'?-1:0)+12)%12;out.push({t0:t,t1:t+d,r,iv:MD_QUAL[m[2]||'']});}t+=d;});
  return {list:out,len:t};}
// accompaniment from one chord span. o = octave of the root, bar = ticks per bar, rel = tick inside the section
function mdAcc(kind,ch,o,opt,bar){const b=12*(o+1)+ch.r,iv=ch.iv,T=iv.map(i=>b+i),out=[],v=opt.v||.5,add=(tk,m,d,vv)=>out.push({tk,ps:[m],d,v:vv==null?v:vv});
  const L=[b,b+iv[1],b+iv[2],b+12,b+12+iv[1],b+12+iv[2]],span=ch.t1-ch.t0;
  const steps=(st,seq,d)=>{let k=0;for(let t=ch.t0;t<ch.t1;t+=st,k++)add(t,seq(k,t),Math.min(d||st,ch.t1-t+st));};
  switch(kind){
  case 'pad':T.forEach(m=>add(ch.t0,m,span));if(opt.top)add(ch.t0,b+12,span);if(opt.add)opt.add.forEach(a=>add(ch.t0,b+a,span,v*.7));break;
  case 'drone':add(ch.t0,b,span);add(ch.t0,b+7,span);break;
  case 'pedal':add(ch.t0,b,span);break;
  case 'arp8':steps(2,k=>L[[0,1,2,3,4,3,2,1][k%8]],6);break;
  case 'arp16':steps(1,k=>L[[0,1,2,3,4,5,4,3][k%8]],4);break;
  case 'arp68':steps(2,k=>L[[0,2,3,4,3,2][k%6]],5);break;
  case 'bass':steps(8,k=>k%2&&opt.alt?b+7:b,8);break;
  case 'bassq':steps(4,k=>k%2&&opt.alt?b+7:b,4);break;
  case 'bass8':steps(2,k=>[b,b,b+12,b,b,b+7,b+12,b][k%8],2);break;
  case 'walk':steps(4,k=>[b,b+iv[1],b+iv[2],b+iv[1]][k%4],4);break;
  case 'ost8':steps(2,k=>[b,b+7,b+12,b+7][k%4],2);break;
  case 'ost16':steps(1,k=>b+[0,0,7,0,12,0,7,0][k%8],1);break;
  case 'pulse8':for(let t=ch.t0;t<ch.t1;t+=2)T.forEach(m=>add(t,m+12,2,v*(t%4===0?1:.75)));break;
  case 'oompah':for(let t=ch.t0;t<ch.t1;t+=4){const beat=Math.floor((t%bar)/4);if(beat===0||(bar===16&&beat===2))add(t,b,4);else T.forEach(m=>add(t,m+12,2,v*.7));}break;
  case 'stab':{const rh=(opt.rh||'x.......').replace(/\|/g,'');for(let t=ch.t0;t<ch.t1;t++){const c=rh[t%rh.length];if(c==='x'||c==='X')T.forEach(m=>add(t,m+12,opt.d||2,v*(c==='X'?1.15:1)));}break;}
  }
  return out;}
// compile one section to events (ticks relative to the section start)
function mdSection(S,trk){const bar=trk.ts===6||trk.ts===3?12:16,str=trk.stretch||1,src=str!==1?16:bar,len=Math.round(S.bars*src*str),ev=[];
  const chs=S.ch?mdChords(S.ch,src):{list:[],len:0};
  // chords repeat across the section if written shorter
  const chList=[];if(chs.len)for(let off=0;off<len;off+=Math.round(chs.len*str))chs.list.forEach(c=>{const t0=off+Math.round(c.t0*str),t1=Math.min(len,off+Math.round(c.t1*str));if(t0<len)chList.push({t0,t1,r:c.r,iv:c.iv});});
  const push=(i,e,st,vs,o)=>e.ps.forEach(m=>ev.push({tk:e.tk,i,m:m+12*o,d:e.d,v:Math.min(1,e.v*vs),st}));
  (S.p||[]).forEach(P=>{const [i,what,opt0]=P,opt=opt0||{},st=opt.st||null,vs=opt.v==null?1:opt.v;
    if(opt.only&&opt.only.indexOf(trk._night?'n':'d')<0)return;
    if(MD_ACC[what]){// an accompaniment pattern name
      chList.forEach(c=>{if(opt.from!=null&&c.t0<opt.from*src*str)return;if(opt.to!=null&&c.t0>=opt.to*src*str)return;
        mdAcc(what,c,opt.o==null?3:opt.o,Object.assign({},opt,{v:(opt.v==null?.5:opt.v)}),bar).forEach(e=>{if(e.tk<len)push(i,e,st,1,0);});});
      return;}
    const M=mdMel(what),ml=Math.round(M.len*str);if(!ml)return;const from=Math.round((opt.from||0)*src*str);
    for(let off=from;off<len;off+=ml){M.ev.forEach(e=>{const tk=off+Math.round(e.tk*str);if(tk<len&&(opt.to==null||tk<opt.to*src*str))push(i,{tk,ps:e.ps,d:Math.max(1,Math.round(e.d*str)),v:e.v},st,vs,opt.o||0);});if(opt.once)break;}});
  // drums
  Object.keys(S.dr||{}).forEach(k0=>{const k=k0.replace(/[0-9]+$/,'');let pat=S.dr[k0],st=null,vs=1;if(Array.isArray(pat)){st=pat[1]&&pat[1].st||null;vs=pat[1]&&pat[1].v||1;pat=pat[0];}if(!pat)return;pat=pat.replace(/[\s|]/g,'');if(!pat)return;
    for(let t=0;t<len;t++){const c=pat[t%pat.length];if(c==='.'||c==='-')continue;const v=(c==='X'?1:c==='x'?.8:c==='o'?.45:.7)*vs;
      if(k==='timp'){const cc=chList.find(q=>q.t0<=t&&t<q.t1)||{r:9};const m=40+((cc.r-4+12)%12);
        if(c==='R'){for(let j=0;j<8;j++)ev.push({tk:t,off:j/4,i:'timpani',m,d:1,v:.25+.5*j/7,st});}else ev.push({tk:t,i:'timpani',m,d:4,v,st});}
      else if(k==='taiko')ev.push({tk:t,i:'taiko',m:c==='X'?40:46,d:4,v,st});
      else if(k==='tom')ev.push({tk:t,i:'tom',m:[55,49,43][t%3],d:2,v,st});
      else ev.push({tk:t,i:k==='sn'&&c==='o'?'sng':k,drum:true,v,st});}});
  return {ev,len};}
// pitch maps: turn the major material minor (and darker) relative to the track's tonic
const MD_MODES={minor:{4:3,9:8,11:10},phryg:{2:1,4:3,9:8,11:10},flat2:{2:1}};
function mdCompile(trk){const mode=trk.mode?MD_MODES[trk.mode]:null,ton=trk.tonic||0,tr=trk.tr||0,inst={};
  const fix=e=>{if(e.drum){inst.x=1;return e;}if(e.i==='taiko'||e.i==='tom'){inst[e.i]=1;return e;}let m=e.m;if(mode){const rel=((m-ton)%12+12)%12;if(mode[rel]!=null)m+=mode[rel]-rel;}m+=tr;
    if(e.i==='timpani'){while(m<38)m+=12;while(m>53)m-=12;}
    const R=MD_RANGE[e.i];if(R&&e.i!=='timpani'){while(m<R[0]-2)m+=12;while(m>R[1]+3)m-=12;}e.m=m;inst[e.i]=1;return e;};
  const sect=ids=>{let tk=0;const ev=[];(ids||[]).forEach(id=>{const S=trk.sec[id];if(!S)throw new Error('no section '+id);const c=mdSection(S,trk);c.ev.forEach(e=>{e.tk+=tk;ev.push(fix(e));});tk+=c.len;});
    ev.forEach(e=>{if(e.off){const w=Math.floor(e.off);e.tk+=w;e.off-=w;}});return {ev,len:tk};};
  const intro=sect(trk.intro?[].concat(trk.intro):[]),loop=sect(trk.form);delete inst.x;
  return {bpm:trk.bpm,swing:trk.swing||0,once:!!trk.once,intro,loop,room:trk.room||'hall',stems:trk.stems||[],resume:!!trk.resume,inst:Object.keys(inst),gain:trk.gain||1,name:trk.name};}
// ---------------- the melodies ----------------
const MER='G4q C5q. D5e E5q | D5q B4q C5h';// the Meridian
const MER_MINOR='E4q A4q. B4e C5q | B4q G#4q A4h | E4q A4q. B4e D5q | C5q B4q G#4h | F4q A4q. B4e C5q | D5q. C5e B4h | C5q B4q A4q G#4q | E4w';
const MER_MINOR_CH='Am | E:2 Am:2 | Dm | Am:2 E:2 | F | Dm:2 E:2 | Am:2 E:2 | E';
// Title
const TI_A='G4q C5q. D5e E5q | D5q B4q C5h | A4q C5q. D5e F5q | E5q C5q D5h | G4q C5q. D5e E5q | G5q E5q A5h | G5q. F5e E5q D5q | C5w';
const TI_A_CH='C | G:2 C:2 | F | Am:2 G:2 | C | Em:2 F:2 | Dm:2 G:2 | C';
const TI_B='E5h. F5q | G5h C6h | B5q. A5e G5h | A5w | F5h. G5q | A5h D6h | C6q B5q A5q B5q | G5w';
const TI_B_CH='Am | C | Em | F | Dm | F:2 Dm:2 | Am:2 G:2 | G';
const TI_B_CT='C5w | E5w | B4w | C5w | A4w | A4h F4h | E4h D4h | D4w';
const TI_C='E5h D5h | C5h G4h | A4h B4h | C5w | E5h F5h | G5h A5h | G5q F5q E5q D5q | D5w';
const TI_C_CH='C | C | F:2 G:2 | C | Am | F | Dm:2 G:2 | G';
// Towns
const TO_A='G4q C5q. D5e E5q | F5q E5q D5q C5q | D5q B4q G4h | E5q D5q C5h | A4q C5e B4e A4q E5q | F5q. E5e D5q C5q | D5q E5q F5q B4q | C5h. rq';
const TO_A_CH='C | F:2 C:2 | G | C | Am | F | Dm:2 G:2 | C';
const TO_B='A5q. G5e F5q A5q | G5h E5h | F5q. E5e D5q F5q | E5h C5h | D5e E5e F5e G5e A5q F5q | G5q E5q C5h | D5q F5q E5q D5q | D5h B4h';
const TO_B_CH='F | C | Dm | Am | F | C | Dm:2 G:2 | G';
const TO_CT='E4h F4h | A4h G4h | B4h D5h | G4w | C5h E5h | A4h C5h | A4h B4h | E4w';
// Fields: one adventuring melody shared by every tileset
const FI_A='E4q G4q C5q. D5e | E5h D5q C5q | A4q C5q F5q. E5e | D5w | E4q G4q C5q. D5e | E5h G5q E5q | F5q E5q D5q B4q | C5w';
const FI_A_CH='C | Em:2 Am:2 | F | G | C | Am | Dm:2 G:2 | C';
const FI_A_CT='G4w | G4h A4h | A4h C5h | B4w | G4w | A4h C5h | A4h B4h | G4w';
const FI_B='A5q. G5e E5h | F5q E5q D5h | G5q. F5e D5h | E5q D5q C5h | A4e B4e C5e D5e E5q A5q | G5h. E5q | F5q A5q G5q. F5e | E5h D5h';
const FI_B_CH='Am | Dm | G | C | F | C | Dm | G';
const FI_B_CT='C5w | A4w | B4w | G4w | A4w | G4w | A4w | B4w';
const FI_C='D5h. F5q | D5q C5q Bb4h | A4h. C5q | G4w | D5h. F5q | A5q G5q F5h | G5h. F5e E5e | D5q B4q G4h';
const FI_C_CH='Dm | Bb | F | C | Dm | F | C | G';
// Dungeon, cave, fortress, archive (written in A minor)
const DU_A='A3h. C4q | B3h E3h | F3h. A3q | G#3w | A3q C4q E4q D4q | F4h D4h | C4q B3q A3q B3q | G#3w';
const DU_A_CH='Am | E | F | E | Am | Dm | Am:2 E:2 | E';
const DU_B='E5w | F5h E5h | D5w | E5w | C5h B4h | A4h D5h | B4h C5h | B4w';
const DU_B_CH='Am | Dm | Dm | E | Am | Dm | E:2 Am:2 | E';
const CV_A='E5h. rq | rw | B4h. A4q | G4w | E5h. rq | rw | C5h B4h | A4w';
const CV_A_CH='Am | Am | Em | Em | Am | Am | F:2 E:2 | Am';
const CV_B='A4h C5h | E5w | D5h C5h | B4w | A4h C5h | F5w | E5h D5h | E5w';
const CV_B_CH='Am | Am | Dm | E | Am | F | Dm:2 E:2 | E';
const FO_A='A3q. A3e C4q A3q | E4h. D4q | C4q. B3e A3q G3q | A3w | A3q. A3e C4q E4q | F4h. E4q | D4q C4q B3q G#3q | A3w';
const FO_A_CH='Am | Am | Am:2 G:2 | Am | Am | F | Dm:2 E:2 | Am';
const FO_B='C4q. C4e E4q G4q | F4h E4h | D4q. D4e F4q A4q | G4w | E4q. E4e G4q C5q | B4h A4h | G#4q A4q B4q G#4q | E4w';
const FO_B_CH='C | F:2 C:2 | Dm | G | C | E:2 Am:2 | E | E';
const AR_A='E5w | F5h E5h | D5w | E5w | A5h G5h | G5h F5h | F5h E5h | E5w';
const AR_A_CH='Am | Dm:2 Am:2 | Dm | E | Am:2 C:2 | Em:2 Dm:2 | Dm:2 Am:2 | E';
const AR_B='E4q A4q. B4e C5q | B4q G#4q A4h | C5q E5q. F5e E5q | D5q B4q C5h | E4q A4q. B4e C5q | D5q F5q. E5e D5q | C5q B4q A4q G#4q | A4w';
const AR_B_CH='Am | E:2 Am:2 | Am | G:2 Am:2 | Am | Dm | Am:2 E:2 | Am';
// Battles
const B1_I='E4s F4s G#4s A4s B4s C5s D5s E5s F5s E5s D5s C5s B4s C5s D5s E5s';
const B1_A='A4q. B4e C5q E5q | D5q. C5e B4q G4q | A4q. B4e C5q D5q | E5w | F5q. E5e D5q C5q | D5q. C5e B4q A4q | G#4q B4q E5q D5q | C5h B4h';
const B1_A_CH='Am | G | Am | C | F | G | E | Am:2 E:2';
const B1_B='E5q E5e E5e F5q E5q | D5h C5h | D5q D5e D5e E5q D5q | C5h B4h | C5q. D5e E5q A5q | G5q. F5e E5q D5q | C5q B4q A4q G#4q | B4w';
const B1_B_CH='C | G:2 Am:2 | Dm | Am:2 E:2 | Am | G | Am:2 E:2 | E';
const B1_C='E4q A4q. B4e C5q | B4q G#4q A4h | F4q A4q. B4e D5q | C5q B4q A4h | A4e B4e C5e D5e E5e F5e G#5e A5e | B5h. A5q | G#5q F5q E5q D5q | E5w';
const B1_C_CH='Am | E:2 Am:2 | Dm | E:2 Am:2 | F:2 E:2 | E | E | E';
const B2_I='E3e E3e E3e E3e G3e G3e A3e B3e | C4e C4e C4e C4e B3e A3e B3e D#4e';
const B2_A='E4q. F#4e G4q B4q | A4q. G4e F#4q D4q | E4e F#4e G4e A4e B4q E5q | D5h B4h | C5q. B4e A4q G4q | A4q. G4e F#4q E4q | D#4q F#4q B4q A4q | G4h F#4h';
const B2_A_CH='Em | D | Em | G | C | D | B | Em:2 B:2';
const B2_B='B4q B4e B4e C5q B4q | A4h G4h | A4q A4e A4e B4q A4q | G4h F#4h | G4q. A4e B4q E5q | D5q. C5e B4q A4q | G4q F#4q E4q D#4q | E4h F#4h';
const B2_B_CH='Em | Am:2 Em:2 | D | Em:2 B:2 | Em | D | Em:2 B:2 | Em:2 B:2';
const B2_C='B3q E4q. F#4e G4q | F#4q D#4q E4h | B3q E4q. F#4e A4q | G4q F#4q E4h | C4q E4q G4q C5q | B4h. A4q | G4q A4q B4q C5q | B4w';
const B2_C_CH='Em | B:2 Em:2 | Am | Em | C | G:2 D:2 | C | B';
const BO_A='A4h. C5q | B4q. A4e G#4h | A4h. E5q | D5w | C5h. D5q | E5q. D5e C5h | B4q C5q D5q B4q | E5w';
const BO_A_CH='Am | E | Am | Dm | F | C | G:2 E:2 | E';
const BO_B='E5q. F5e E5q C5q | D5q. E5e D5q B4q | C5q. D5e C5q A4q | B4h G#4h | A4e B4e C5e D5e E5q A5q | G5q. F5e E5q D5q | C5q B4q A4q G#4q | A4w';
const BO_B_CH='Am | G | F | E | Am | C:2 G:2 | Am:2 E:2 | Am';
const C1_A='E4q A4q. Bb4e C5q | Bb4q G#4q A4h | E4q A4q. Bb4e D5q | C5q Bb4q G#4h | F4q A4q. Bb4e C5q | D5q. C5e Bb4h | A4q G#4q F4q E4q | E4w';
const C1_A_CH='Am | E:2 Am:2 | Dm | Am:2 E:2 | F | Bb:2 E:2 | Am:2 Dm:2 | E';
const C1_B='A4h A4h | Bb4h A4h | G#4h G#4h | A4w | C5h C5h | D5h C5h | Bb4h Bb4h | A4w';
const C1_B_CH='Am | Bb | E | Am | F | Bb:2 F:2 | Gm | Am';
const C2_A='A4q. A4e Bb4q A4q | G#4q. F4e E4h | A4q. A4e C5q Bb4q | A4w | D5q. D5e E5q D5q | C5q. Bb4e A4h | Bb4q A4q G#4q F4q | E4w';
const C2_A_CH='Am | E | F | Am | Dm | F:2 Dm:2 | Bb:2 E:2 | E';
const C3_D='A4e Bb4e C5e D5e E5e F5e G#5e A5e | Bb5h. A5q | G#5q F5q E5q D5q | E5w | A4e Bb4e C5e D5e E5e F5e G#5e A5e | C6h. Bb5q | A5q G#5q F5q D5q | E5w';
const C3_D_CH='F:2 E:2 | Bb | E | E | Dm:2 E:2 | F | Dm | E';
const AN_A='D5q A4q D5q. E5e | F#5h E5h | D5q B4q G4q. A4e | B4h A4h | G4q B4q D5q G5q | F#5q. E5e D5q B4q | C#5q E5q A5q G5q | F#5h E5h';
const AN_A_CH='D | D:2 A:2 | G | Em:2 D:2 | G | D:2 Bm:2 | A | D:2 A:2';
const AN_B='B4q. C#5e D5q F#5q | E5h A4h | G4q. A4e B4q D5q | C#5h A4h | B4q. C#5e D5q G5q | F#5q E5q D5q B4q | C#5q D5q E5q C#5q | D5w';
const AN_B_CH='Bm | A | G | A | G | D:2 G:2 | A | D';
const AN_C='A4q D5q. E5e F#5q | E5q C#5q D5h | B4q D5q. E5e G5q | F#5q D5q E5h | A4q D5q. E5e F#5q | A5q F#5q B5h | A5q. G5e F#5q E5q | D5w';
const AN_C_CH='D | A:2 D:2 | G | D:2 A:2 | D | F#m:2 Bm:2 | Em:2 A:2 | D';
const VI_I='G4e C5e D5e E5e G5q. E5e | C6w';
const VI_A='E5q D5e C5e D5q G4q | C5q E5q G5h | F5q E5e D5e E5q C5q | D5w | E5q D5e C5e D5q G4q | C5q E5q A5h | G5q F5q E5q D5q | C5w';
const VI_A_CH='C | C | F:2 C:2 | G | C | C:2 F:2 | Dm:2 G:2 | C';
const VI_B='A4q C5q F5q. E5e | D5q C5q D5h | G4q B4q E5q. D5e | C5q B4q C5h | A4q C5q F5q. A5e | G5q E5q C5h | D5q E5q F5q B4q | C5w';
const VI_B_CH='F | Dm | Em:2 G:2 | Am:2 C:2 | F | C | Dm:2 G:2 | C';
const LG_A='G4h C5q. D5e | E5w | D5h B4h | C5w | A4h C5q. D5e | F5w | E5q D5q C5q B4q | C5w';
const LG_A_CH='C | Am | G | C | F | Dm | G | C';
const LG_B='E4h F4h | G4w | A4h G4h | E4w | F4h G4h | A4h. B4q | C5h B4h | G4w';
const LG_B_CH='Am | C | F:2 C:2 | C | Dm | F | C:2 G:2 | G';
// ---------------- percussion patterns ----------------
const DR_MARCH='X..xx.x.x..x.xx.',DR_BAT_BD='x.....x.x.......',DR_BAT_SN='....x.......x..o',DR_TAIKO='X...x...X...x.x.',DR_8='x.x.x.x.x.x.x.x.',DR_SHK='x.o.x.o.x.o.x.o.';
const SEC_START=(bars,b)=>'X'+'.'.repeat(bars*b-1);// one crash at the top of a section
// ---------------- tracks ----------------
const MTRACK={};
MTRACK.title=o=>({name:'Title: The Meridian',bpm:76,tr:2,room:'hall',intro:'I',form:['A','B','A2','C'],sec:{
  I:{bars:4,ch:'C | Am | F | G',p:[['harp','arp16',{o:3,v:.55}],['strings','pad',{o:4,v:.22}],['bass','pedal',{o:2,v:.35,from:2}]],dr:{swell:'...............'+'.'.repeat(32)+'x'+'.'.repeat(15)}},
  A:{bars:8,ch:TI_A_CH,p:[['horn',TI_A,{o:-1,v:.9}],['harp','arp16',{o:3,v:.42}],['strings','pad',{o:4,v:.3}],['bass','bass',{o:2,v:.45}]],dr:{timp:'o...............'}},
  B:{bars:8,ch:TI_B_CH,p:[['strings',TI_B,{v:.85}],['horn',TI_B_CT,{o:-1,v:.55}],['harp','arp8',{o:3,v:.4}],['cello','bass',{o:2,v:.5}]],dr:{timp:'x.......o.......',cym:SEC_START(8,16)}},
  A2:{bars:8,ch:TI_A_CH,p:[['horn',TI_A,{o:-1,v:1}],['strings',TI_A,{v:.7}],['trumpet',TI_A,{o:-1,v:.45,from:4}],['choir','pad',{o:4,v:.35}],['harp','arp16',{o:3,v:.4}],['bass','bass',{o:2,v:.55}]],dr:{timp:'x.......x...o...',crash:SEC_START(8,16)}},
  C:{bars:8,ch:TI_C_CH,p:[['flute',TI_C,{v:.75}],['harp','arp8',{o:3,v:.45}],['strings','pad',{o:4,v:.22}]],dr:{tri:'x...............................'}}}});
MTRACK.town=o=>o.night?{name:'Town (night): Lanterns',bpm:80,tr:5,room:'hall',resume:1,form:['A','B','A2'],sec:{
  A:{bars:8,ch:TO_A_CH,p:[['celesta',TO_A,{v:.75}],['harp','arp8',{o:3,v:.4}],['strings','pad',{o:4,v:.2}],['bass','pedal',{o:2,v:.3}]]},
  B:{bars:8,ch:TO_B_CH,p:[['clarinet',TO_B,{o:-1,v:.7}],['harp','arp8',{o:3,v:.38}],['strings','pad',{o:4,v:.22}],['bass','pedal',{o:2,v:.3}]]},
  A2:{bars:8,ch:TO_A_CH,p:[['flute',TO_A,{v:.6}],['celesta',TO_CT,{o:1,v:.45}],['harp','arp8',{o:3,v:.35}],['strings','pad',{o:4,v:.22}]],dr:{tri:'x'+'.'.repeat(63)}}}}
 :{name:'Town (day): Hearth and Market',bpm:104,tr:5,swing:.25,room:'hall',resume:1,form:['A','B','A2','B2'],sec:{
  A:{bars:8,ch:TO_A_CH,p:[['flute',TO_A,{v:.8}],['lute','oompah',{o:2,v:.5}],['pizz','walk',{o:2,v:.45}],['strings','pad',{o:4,v:.16}]],dr:{shk:DR_SHK}},
  B:{bars:8,ch:TO_B_CH,p:[['oboe',TO_B,{v:.75}],['lute','arp8',{o:3,v:.45}],['pizz','bassq',{o:2,v:.5,alt:1}],['strings','pad',{o:4,v:.18}]],dr:{shk:DR_SHK,tri:'x...............'}},
  A2:{bars:8,ch:TO_A_CH,p:[['fiddle',TO_A,{v:.75}],['flute',TO_CT,{o:1,v:.45}],['lute','oompah',{o:2,v:.5}],['pizz','walk',{o:2,v:.45}],['strings','pad',{o:4,v:.18}]],dr:{shk:DR_SHK,sn:'........o.......'}},
  B2:{bars:8,ch:TO_B_CH,p:[['strings',TO_B,{v:.7}],['flute',TO_B,{o:0,v:.45,from:4}],['lute','arp8',{o:3,v:.45}],['pizz','bassq',{o:2,v:.5,alt:1}]],dr:{shk:DR_SHK,timp:'o.......o.......'}}}};
// one field arrangement per tileset; night thins it, Calamity realms darken it, a relit realm fills it out
const FIELD_ARR={
 meadow:{n:'Meadow',bpm:112,lead:'flute',lead2:'strings',lead3:'oboe',bridge:'clarinet',pad:'strings',arp:['harp','arp8',3],acc:['pizz','arp8',3],bass:['bass','bass',2],dr:{timp:'o...............'},dr2:{timp:'x.......o.......',sn:'o.......o...o...'}},
 coast:{n:'Coast',bpm:138,ts:6,stretch:1.5,tr:2,lead:'clarinet',lead2:'flute',lead3:'oboe',bridge:'flute',pad:'strings',arp:['harp','arp68',3],acc:['harp','arp68',4],bass:['cello','bass',2],dr:{shk:'x.o.o.x.o.o.'},dr2:{shk:'x.o.o.x.o.o.',timp:'o...........'}},
 cave:{n:'Under-hills',bpm:96,tr:-3,lo:1,lead:'cello',lead2:'clarinet',lead3:'horn',bridge:'clarinet',pad:'strings',arp:['pizz','ost8',3],acc:['pizz','walk',2],bass:['bass','bass',2],dr:{taiko:'o.......o.......'},dr2:{taiko:'x.......o...o...',tom:'..........o.o...'}},
 snow:{n:'Snowfields',bpm:84,tr:4,lead:'celesta',lead2:'strings',lead3:'flute',bridge:'celesta',pad:'tremolo',arp:['harp','arp8',4],acc:['glock','arp8',5],bass:['bass','pedal',2],sparse:1,dr:{tri:'x...............'},dr2:{tri:'x.......'}},
 heights:{n:'Heights',bpm:116,tr:5,lead:'horn',lead2:'brass',lead3:'trumpet',bridge:'horn',lo:1,pad:'strings',arp:['strings','pulse8',3],acc:['harp','arp8',3],bass:['bass','bass8',2],dr:{taiko:'X.......x...x...',timp:'x.......'},dr2:{taiko:DR_TAIKO,timp:'x.......x...o...',crash:SEC_START(8,16)}},
 void:{n:'The Void',bpm:92,tr:-1,mode:'phryg',lead:'strings',lead2:'choir',lead3:'clarinet',bridge:'oboe',pad:'tremolo',padAdd:[1,13],arp:['harp','arp8',3],acc:['celesta','arp8',4],bass:['bass','drone',2],dr:{taiko:'o...............'},dr2:{taiko:'x.......o.......'}}};
MTRACK.field=o=>{const th=FIELD_ARR[o.theme]?o.theme:'meadow',A=Object.assign({},FIELD_ARR[th]);let name='Field: '+A.n;
  if(o.cal){name='Field: Calamity Realm';Object.assign(A,{bpm:100,ts:4,stretch:1,mode:'minor',lead:'trombone',lead2:'horn',lead3:'brass',bridge:'choir',pad:'choir',lo:1,arp:['strings','ost8',3],acc:['harp','arp8',3],bass:['bass','drone',2],dr:{taiko:'X.......x.......'},dr2:{taiko:DR_TAIKO,timp:'x.......'}});if(th==='void')A.mode='phryg';}
  if(o.bright&&(A.mode==='phryg'))A.mode='minor';
  const sp=A.sparse,n=o.night,lo=A.lo?-1:0,bpm=Math.round(A.bpm*(n?.86:1)*(o.bright?1.03:1)),pv=n?.75:1,dr=n?{}:A.dr,dr2=n?{}:A.dr2;
  if(n)name+=' (night)';if(o.bright)name+=' (relit)';
  const pad=['strings'===A.pad||A.pad==='tremolo'||A.pad==='choir'?A.pad:'strings','pad',{o:4,v:(sp?.18:.22)*pv,add:A.padAdd}];
  const bright=o.bright?[['glock',FI_A_CT,{o:1,v:.35}],['strings','pad',{o:5,v:.12}]]:[],brightB=o.bright?[['celesta',FI_B_CT,{o:1,v:.3}]]:[];
  const A1={bars:8,ch:FI_A_CH,p:[[n&&!o.cal?(th==='snow'?'celesta':'clarinet'):A.lead,FI_A,{o:lo,v:.85*pv}],pad,[A.arp[0],A.arp[1],{o:A.arp[2],v:.4*pv}],n?['bass','pedal',{o:2,v:.3}]:[A.bass[0],A.bass[1],{o:A.bass[2],v:.42}]].concat(bright),dr};
  const B1={bars:8,ch:FI_B_CH,p:[[A.lead2,FI_B,{o:A.lead2==='brass'||A.lead2==='horn'||A.lead2==='choir'?-1:0,v:.8*pv}],[A.lead3==='trumpet'?'horn':A.pad==='choir'?'horn':'strings',FI_B_CT,{o:-1,v:.4*pv}],
    [A.acc[0],A.acc[1],{o:A.acc[2],v:.38*pv}],n?['bass','pedal',{o:2,v:.3}]:[A.bass[0],A.bass[1],{o:A.bass[2],v:.42}]].concat(brightB),dr:n?{}:Object.assign({},dr2,{crash:undefined})};
  const A2={bars:8,ch:FI_A_CH,p:[[A.lead3,FI_A,{o:A.lead3==='flute'||A.lead3==='trumpet'?0:lo,v:.85*pv}],[A.lead==='celesta'?'glock':A.lead,FI_A_CT,{o:A.lead==='celesta'?1:lo+(A.lead==='cello'?0:0),v:.45*pv}],pad,
    [A.arp[0],A.arp[0]==='strings'?'pulse8':(A.ts===6?'arp68':'arp16'),{o:A.arp[2],v:.36*pv}],n?['bass','pedal',{o:2,v:.3}]:[A.bass[0],A.bass[1],{o:A.bass[2],v:.45}]].concat(bright),dr:dr2};
  const C1={bars:8,ch:FI_C_CH,p:[[A.bridge,FI_C,{o:A.bridge==='choir'||A.bridge==='horn'?-1:0,v:.7*pv}],[A.arp[0]==='strings'?'harp':A.arp[0],A.ts===6?'arp68':'arp8',{o:3,v:.38*pv}],['strings','pad',{o:4,v:.2*pv}],['bass','pedal',{o:2,v:.3}]],dr:{swell:'.'.repeat(16*7)+'x'}};
  return {name,bpm,ts:A.ts||4,stretch:A.stretch,tr:(A.tr||0)+(o.tr||0),mode:A.mode,tonic:0,room:'hall',resume:1,form:n?['A','B','A2']:['A','B','A2','C'],sec:{A:A1,B:B1,A2,C:C1}};};
MTRACK.dungeon=o=>({name:'Dungeon: Below the Beacon',bpm:80,tr:o.tr||0,tonic:9,room:'cave',resume:1,stems:['chase'],form:['A','B','A2','C'],sec:{
  A:{bars:8,ch:DU_A_CH,p:[['cello',DU_A,{v:.8}],['harp','arp8',{o:3,v:.38}],['bass','pedal',{o:2,v:.4}],['strings','pad',{o:3,v:.14}],['tremolo','ost16',{o:4,v:.22,st:'chase'}]],dr:{taiko:'o...............',timp:'........o.......',bd2:[DR_8,{st:'chase',v:.5}]}},
  B:{bars:8,ch:DU_B_CH,p:[['oboe',DU_B,{v:.62}],['tremolo','pad',{o:4,v:.2}],['pizz','ost8',{o:3,v:.42}],['bass','pedal',{o:2,v:.4}],['tremolo','ost16',{o:4,v:.22,st:'chase'}]],dr:{taiko:'o.......o.......',sn2:['o.o.o.o.o.o.o.o.',{st:'chase',v:.6}]}},
  A2:{bars:8,ch:DU_A_CH,p:[['cello',DU_A,{v:.8}],['clarinet',DU_A,{o:1,v:.45,from:4}],['pizz','ost8',{o:3,v:.4}],['bass','pedal',{o:2,v:.4}],['tremolo','ost16',{o:4,v:.22,st:'chase'}]],dr:{taiko:'o.......',bd2:[DR_8,{st:'chase',v:.5}]}},
  C:{bars:8,ch:MER_MINOR_CH,p:[['horn',MER_MINOR,{v:.6}],['harp','arp8',{o:3,v:.35}],['strings','pad',{o:3,v:.18}],['bass','pedal',{o:2,v:.4}],['tremolo','ost16',{o:4,v:.22,st:'chase'}]],dr:{timp:'o.......o.......',taiko2:[DR_8,{st:'chase',v:.6}]}}}});
MTRACK.cave=o=>({name:'Side Cave: Dripstone',bpm:70,tr:o.tr||0,tonic:9,room:'cave',resume:1,form:['A','B','A2'],sec:{
  A:{bars:8,ch:CV_A_CH,p:[['celesta',CV_A,{v:.7}],['strings','pad',{o:3,v:.16}],['bass','pedal',{o:2,v:.3}]],dr:{drip:'x......o...x.......o....x....o..'}},
  B:{bars:8,ch:CV_B_CH,p:[['flute',CV_B,{v:.5}],['harp','arp8',{o:3,v:.3}],['strings','pad',{o:3,v:.16}],['bass','pedal',{o:2,v:.3}]],dr:{drip:'...x.......o.......x..o.........'}},
  A2:{bars:8,ch:CV_A_CH,p:[['harp',CV_A,{v:.6}],['celesta',CV_A,{o:1,v:.35,from:4}],['choir','pad',{o:4,v:.12}],['bass','pedal',{o:2,v:.3}]],dr:{drip:'x.......o.....x.........o.......',tom:'o'+'.'.repeat(63)}}}});
MTRACK.fort=o=>({name:'Fortress: Iron Muster',bpm:108,tr:(o.tr||0)-2,tonic:9,room:'hall',resume:1,form:['A','B','A2','B2'],sec:{
  A:{bars:8,ch:FO_A_CH,p:[['trombone',FO_A,{v:.85}],['horn',FO_A,{v:.5}],['strings','pulse8',{o:3,v:.3}],['bass','bassq',{o:2,v:.45}]],dr:{sn:DR_MARCH,bd:'x.......x.......',timp:'x...............'}},
  B:{bars:8,ch:FO_B_CH,p:[['horn',FO_B,{v:.85}],['trombone','pad',{o:3,v:.28}],['strings','pulse8',{o:3,v:.3}],['bass','bassq',{o:2,v:.45}]],dr:{sn:DR_MARCH,bd:'x.......x.......',timp:'x.......o.......'}},
  A2:{bars:8,ch:FO_A_CH,p:[['trombone',FO_A,{v:.85}],['trumpet',FO_A,{o:1,v:.55}],['strings','ost16',{o:3,v:.3}],['bass','bassq',{o:2,v:.5}]],dr:{sn:DR_MARCH,bd:'x.......x...x...',timp:'x.......x.......',crash:SEC_START(8,16)}},
  B2:{bars:8,ch:FO_B_CH,p:[['brass',FO_B,{v:.85}],['trumpet',FO_B,{o:1,v:.4,from:4}],['strings','ost16',{o:3,v:.3}],['bass','bassq',{o:2,v:.5}]],dr:{sn:DR_MARCH,bd:'x.......x...x...',timp:'x...x...x...x...'}}}});
MTRACK.archive=o=>({name:'The Archive: Ink and Starlight',bpm:60,tr:2,tonic:9,room:'cathedral',form:['A','B','A2'],sec:{
  A:{bars:8,ch:AR_A_CH,p:[['organ',AR_A,{v:.6}],['choir','pad',{o:4,v:.3}],['organ','pedal',{o:2,v:.3}]]},
  B:{bars:8,ch:AR_B_CH,p:[['choir',AR_B,{v:.7}],['celesta','arp8',{o:4,v:.3}],['organ','pad',{o:3,v:.18}],['organ','pedal',{o:2,v:.3}]],dr:{tri:'x'+'.'.repeat(31)}},
  A2:{bars:8,ch:AR_A_CH,p:[['strings',AR_A,{v:.65}],['choir','pad',{o:4,v:.32}],['harp','arp8',{o:3,v:.3}],['organ','pedal',{o:2,v:.3}]]}}});
// battles: a tense layer fades in when anyone in the party is under 30% HP
const TENSE=[['tremolo','pad',{o:5,v:.22,st:'tense'}]],TENSE_DR={bd2:['X..x............',{st:'tense',v:.7}],sn2:['oooooooooooooooo',{st:'tense',v:.35}]};
const withDr=(a,b)=>Object.assign({},a,b);
MTRACK.battle1=o=>({name:'Battle I: Steel on the Road',bpm:150,tr:o.tr||0,tonic:9,room:'hall',stems:['tense'],intro:'I',form:['A','B','C','A','B'],sec:{
  I:{bars:2,ch:'Am | E',p:[['brass','stab',{o:3,v:.7,rh:'X..X..X.X.......'}],['strings',B1_I,{from:1,v:.75}],['bass','pedal',{o:2,v:.5}]],dr:{timp:'X..x..x.x.......R...R...R...R...',crash:'X'+'.'.repeat(31)}},
  A:{bars:8,ch:B1_A_CH,p:[['strings',B1_A,{v:.85}],['trumpet',B1_A,{v:.45,from:4}],['strings','ost16',{o:3,v:.32}],['bass','bass8',{o:2,v:.42}],['horn','stab',{o:3,v:.42,rh:'x..x..x.....x...'}]].concat(TENSE),dr:withDr({bd:DR_BAT_BD,sn:DR_BAT_SN,timp:'x.......x.......',crash:SEC_START(8,16)},TENSE_DR)},
  B:{bars:8,ch:B1_B_CH,p:[['brass',B1_B,{v:.85}],['strings','ost16',{o:3,v:.32}],['bass','bass8',{o:2,v:.42}],['horn','G4w | B4h C5h | A4w | C5h B4h | C5w | B4w | C5h B4h | G#4w',{o:-1,v:.35}]].concat(TENSE),dr:withDr({bd:DR_BAT_BD,sn:'....x.......x.x.',timp:'x...x...x...x...'},TENSE_DR)},
  C:{bars:8,ch:B1_C_CH,p:[['horn',B1_C,{o:-1,v:.85}],['strings',B1_C,{v:.5,from:4}],['tremolo','pad',{o:4,v:.22}],['bass','bass8',{o:2,v:.42}]].concat(TENSE),dr:withDr({timp:'x..x..x.x..x..x.',bd:'x...............',swell:'.'.repeat(16*7)+'x'},TENSE_DR)}}});
MTRACK.battle2=o=>({name:'Battle II: The Long Front',bpm:158,tr:o.tr||0,tonic:4,room:'hall',stems:['tense'],intro:'I',form:['A','B','C','A','B'],sec:{
  I:{bars:2,ch:'Em | C:2 B:2',p:[['brass',B2_I,{v:.8}],['strings',B2_I,{o:1,v:.5}],['bass','pedal',{o:2,v:.5}]],dr:{taiko:'X...X...X.X.X...',timp:'.'.repeat(24)+'R...R...',crash:'X'+'.'.repeat(31)}},
  A:{bars:8,ch:B2_A_CH,p:[['strings',B2_A,{o:1,v:.85}],['trumpet',B2_A,{v:.45}],['strings','ost16',{o:3,v:.3}],['bass','bass8',{o:2,v:.42}],['brass','stab',{o:3,v:.38,rh:'X.....X...X.....'}]].concat(TENSE),dr:withDr({bd:'x.....x.x.....x.',sn:'....x.......x...',taiko:'x.......x.......',crash:SEC_START(8,16)},TENSE_DR)},
  B:{bars:8,ch:B2_B_CH,p:[['horn',B2_B,{v:.8}],['strings',B2_B,{o:1,v:.45,from:4}],['strings','ost16',{o:3,v:.3}],['bass','bass8',{o:2,v:.42}]].concat(TENSE),dr:withDr({bd:'x.....x.x.......',sn:'....x.......x.xx',timp:'x.......x.......'},TENSE_DR)},
  C:{bars:8,ch:B2_C_CH,p:[['horn',B2_C,{v:.85}],['trombone',B2_C,{o:-1,v:.5}],['strings','pulse8',{o:3,v:.32}],['bass','bassq',{o:2,v:.45}]].concat(TENSE),dr:withDr({taiko:DR_TAIKO,timp:'x...............',cym:'.'.repeat(16*3)+'x'+'.'.repeat(15)},TENSE_DR)}}});
MTRACK.elite=o=>({name:'Elite: Teeth in the Tall Grass',bpm:166,tr:(o.tr||0)+1,tonic:9,mode:'flat2',room:'hall',stems:['tense'],intro:'I',form:['A','B','C','A','B'],sec:{
  I:{bars:2,ch:'Am | Bb:2 E:2',p:[['brass','stab',{o:3,v:.8,rh:'X.X.X...X.X.X...'}],['strings',B1_I,{from:1,v:.8}]],dr:{taiko:'X.X.X...X.X.X...',timp:'.'.repeat(16)+'R...R...R...R...',crash:'X'+'.'.repeat(31)}},
  A:{bars:8,ch:B1_A_CH,p:[['brass',B1_A,{v:.85}],['strings',B1_A,{o:1,v:.5}],['strings','ost16',{o:3,v:.34}],['bass','bass8',{o:2,v:.45}],['choir','pad',{o:4,v:.2}]].concat(TENSE),dr:withDr({taiko:DR_8,bd:'x..x..x.x..x..x.',sn:'....X.......X...',crash:SEC_START(4,16)},TENSE_DR)},
  B:{bars:8,ch:B1_B_CH,p:[['strings',B1_B,{v:.85}],['trumpet',B1_B,{v:.45,from:4}],['strings','ost16',{o:3,v:.34}],['bass','bass8',{o:2,v:.45}],['horn','stab',{o:3,v:.45,rh:'X..X..X.X..X..X.'}]].concat(TENSE),dr:withDr({taiko:DR_8,sn:'....X.......X.XX',timp:'x...x...x...x...'},TENSE_DR)},
  C:{bars:8,ch:B1_C_CH,p:[['horn',B1_C,{o:-1,v:.85}],['trombone',B1_C,{o:-1,v:.45}],['tremolo','pad',{o:4,v:.25}],['bass','bass8',{o:2,v:.45}]].concat(TENSE),dr:withDr({timp:'x.x.x.x.x..x..x.',taiko:'X.......X...X...',swell:'.'.repeat(16*7)+'x'},TENSE_DR)}}});
// Scourge boss: one theme, each Scourge opens with its own two bars and plays in its own key
const BOSS_INTROS=[
 {bars:2,ch:'Am | E',p:[['brass','stab',{o:2,v:.9,rh:'X.....X.X.......'}],['bass','pedal',{o:2,v:.6}]],dr:{timp:'X.....X.X.......R...R...R...R...',crash:'X'+'.'.repeat(31)}},
 {bars:2,ch:'Am | E',p:[['choir','A4w | G#4w',{v:.85}],['strings','pad',{o:3,v:.3}]],dr:{taiko:'X.x.X.x.X.x.X.x.',swell:'.'.repeat(31)+'x'}},
 {bars:2,ch:'Am | E',p:[['strings','A3s B3s C4s D4s E4s F4s G#4s A4s B4s C5s D5s E5s F5s G#5s A5s B5s | E5s F5s E5s D5s C5s B4s A4s G#4s A4s B4s C5s D5s E5s D5s C5s B4s',{v:.8}],['bass','pedal',{o:2,v:.5}]],dr:{timp:'x.......x.......R...R...R...R...'}},
 {bars:2,ch:'Am | E',p:[['horn','E4h. A4q | G#4w',{v:.9}],['trombone','A3h. E3q | E3w',{v:.6}]],dr:{bd:'X.......X.......X...X...X.X.X.X.',crash:'.'.repeat(16)+'X'}}];
MTRACK.boss=o=>{const h=hashS(String(o.boss||'x'))>>>0;return {name:'Scourge: Beast-Lords of the Beacons',bpm:144,tr:o.tr||0,tonic:9,room:'hall',stems:['phase'],intro:'I',form:['A','B','C','A','B'],sec:{
  I:BOSS_INTROS[h%BOSS_INTROS.length],
  A:{bars:8,ch:BO_A_CH,p:[['brass',BO_A,{v:.9}],['choir','pad',{o:4,v:.32}],['strings','ost16',{o:3,v:.32}],['bass','bass8',{o:2,v:.45}],['choir',BO_A,{v:.5,st:'phase'}]],dr:{taiko:DR_TAIKO,timp:'x.......x.......',crash:SEC_START(8,16),bd2:[DR_8,{st:'phase',v:.6}],cym2:['X'+'.'.repeat(63),{st:'phase',v:.6}]}},
  B:{bars:8,ch:BO_B_CH,p:[['strings',BO_B,{v:.85}],['horn','E4w | D4w | C4w | B3w | C4w | E4h D4h | C4h B3h | A3w',{v:.5}],['strings','ost16',{o:3,v:.3}],['bass','bass8',{o:2,v:.45}],['choir','pad',{o:4,v:.3,st:'phase'}]],dr:{taiko:'X...x...X...x...',sn:'....x.......x...',bd2:[DR_8,{st:'phase',v:.6}]}},
  C:{bars:8,ch:MER_MINOR_CH,p:[['choir',MER_MINOR,{v:.85}],['brass','pad',{o:3,v:.3}],['strings','arp16',{o:3,v:.3}],['bass','bass',{o:2,v:.5}],['trumpet',MER_MINOR,{o:1,v:.4,st:'phase'}]],dr:{timp:'x...R...x...R...',swell:'.'.repeat(16*7)+'x',taiko2:[DR_8,{st:'phase',v:.6}]}}}};};
// the Calamity: three tracks, one per phase of the fight, each more desperate than the last
MTRACK.cal1=o=>({name:'Calamity I: The Meridian, Unmade',bpm:92,tr:o.tr||0,tonic:9,room:'cathedral',form:['A','B','A2'],sec:{
  A:{bars:8,ch:C1_A_CH,p:[['organ',C1_A,{v:.7}],['choir','pad',{o:4,v:.35}],['organ','pedal',{o:2,v:.4}],['strings','pad',{o:3,v:.2,add:[1]}]],dr:{taiko:'X...............',timp:'........x.......'}},
  B:{bars:8,ch:C1_B_CH,p:[['choir',C1_B,{v:.8}],['organ','pad',{o:3,v:.3}],['bass','drone',{o:2,v:.4}]],dr:{taiko:'X.......x.......',swell:'.'.repeat(16*7)+'x'}},
  A2:{bars:8,ch:C1_A_CH,p:[['brass',C1_A,{v:.8}],['organ',C1_A,{o:1,v:.4}],['choir','pad',{o:4,v:.38}],['organ','pedal',{o:2,v:.4}]],dr:{taiko:DR_TAIKO,timp:'x.......x.......',crash:SEC_START(8,16)}}}});
MTRACK.cal2=o=>({name:'Calamity II: World-Eater',bpm:132,tr:o.tr||0,tonic:9,room:'cathedral',intro:'I',form:['A','B','A2','B2'],sec:{
  I:{bars:1,ch:'Am',p:[['brass','stab',{o:2,v:1,rh:'X...X...X.X.X...'}]],dr:{taiko:'X...X...X.X.X...',crash:'X'}},
  A:{bars:8,ch:C2_A_CH,p:[['brass',C2_A,{v:.9}],['strings','ost16',{o:3,v:.34}],['choir','pad',{o:4,v:.35}],['bass','bass8',{o:2,v:.45}]],dr:{taiko:DR_TAIKO,bd:'x.....x.x.......',sn:'....x.......x...',crash:SEC_START(8,16)}},
  B:{bars:8,ch:C1_A_CH,p:[['choir',C1_A,{v:.85}],['trombone',C1_A,{o:-1,v:.55}],['organ','pad',{o:3,v:.28}],['strings','ost16',{o:3,v:.3}],['bass','bass8',{o:2,v:.45}]],dr:{taiko:'X...x...X...x.x.',timp:'x.......R...R...'}},
  A2:{bars:8,ch:C2_A_CH,p:[['brass',C2_A,{v:.9}],['strings',C2_A,{o:1,v:.55}],['choir','pad',{o:4,v:.38}],['bass','bass8',{o:2,v:.45}]],dr:{taiko:DR_8,bd:'x.....x.x.......',sn:'....x.......x.xx',crash:SEC_START(8,16)}},
  B2:{bars:8,ch:C1_A_CH,p:[['organ',C1_A,{v:.75}],['choir',C1_A,{v:.7}],['brass','pad',{o:3,v:.3}],['strings','ost16',{o:3,v:.3}],['bass','bass8',{o:2,v:.45}]],dr:{taiko:DR_TAIKO,timp:'x...x...R...R...',swell:'.'.repeat(16*7)+'x'}}}});
MTRACK.cal3=o=>({name:'Calamity III: Last Light',bpm:150,tr:(o.tr||0)+1,tonic:9,room:'cathedral',intro:'I',form:['A','B','D','A2','B'],sec:{
  I:{bars:1,ch:'Am',p:[['choir','A4+C5+E5w',{v:1}],['organ','pedal',{o:2,v:.5}]],dr:{taiko:'X.X.X.X.XXXXXXXX',crash:'X'}},
  A:{bars:8,ch:C2_A_CH,p:[['brass',C2_A,{v:.95}],['choir',C2_A,{v:.6}],['strings','ost16',{o:3,v:.36}],['organ','pedal',{o:2,v:.4}],['bass','bass8',{o:2,v:.45}]],dr:{taiko:DR_8,bd:'x..x..x.x..x..x.',sn:'....X.......X...',crash:SEC_START(4,16)}},
  B:{bars:8,ch:C1_A_CH,p:[['choir',C1_A,{v:.95}],['trumpet',C1_A,{v:.55}],['organ','pad',{o:3,v:.3}],['strings','ost16',{o:3,v:.34}],['bass','bass8',{o:2,v:.45}]],dr:{taiko:DR_TAIKO,timp:'x.x.x.x.R...R...',cym:'X'+'.'.repeat(31)}},
  D:{bars:8,ch:C3_D_CH,p:[['strings',C3_D,{v:.9}],['horn',C3_D,{o:-1,v:.55}],['choir','pad',{o:4,v:.38}],['bass','bass8',{o:2,v:.45}]],dr:{timp:'x..x..x.x..x..x.',taiko:DR_8,swell:'.'.repeat(16*7)+'x'}},
  A2:{bars:8,ch:C2_A_CH,p:[['brass',C2_A,{v:1}],['strings',C2_A,{o:1,v:.6}],['organ',C2_A,{v:.4}],['choir','pad',{o:4,v:.4}],['bass','bass8',{o:2,v:.45}]],dr:{taiko:DR_8,bd:'x..x..x.x..x..x.',sn:'....X.......X.XX',crash:SEC_START(4,16)}}}});
MTRACK.arena=o=>({name:'Arena and Daily Trial: Colours Raised',bpm:136,tr:0,tonic:2,room:'hall',intro:'I',form:['A','B','A2','C','B2'],sec:{
  I:{bars:2,ch:'D | A',p:[['brass','stab',{o:3,v:.85,rh:'X.X.X...X...X...'}]],dr:{sn:'X.X.X...X...XXXX',crash:'X'+'.'.repeat(31)}},
  A:{bars:8,ch:AN_A_CH,p:[['trumpet',AN_A,{v:.85}],['strings','pulse8',{o:3,v:.3}],['bass','bass8',{o:2,v:.42}]],dr:{bd:'x...x...x...x...',sn:'....x.......x...',shk:'x.x.x.x.x.x.x.x.',crash:SEC_START(8,16)}},
  B:{bars:8,ch:AN_B_CH,p:[['strings',AN_B,{v:.85}],['horn','D4w | C#4w | B3w | C#4w | D4w | D4h B3h | C#4w | D4w',{v:.45}],['strings','pulse8',{o:3,v:.28}],['bass','bass8',{o:2,v:.42}]],dr:{bd:'x...x...x...x...',sn:'....x.......x.x.',shk:'x.x.x.x.x.x.x.x.'}},
  A2:{bars:8,ch:AN_A_CH,p:[['trumpet',AN_A,{v:.85}],['strings',AN_A,{o:1,v:.5}],['brass','stab',{o:3,v:.4,rh:'x.....x.....x...'}],['bass','bass8',{o:2,v:.42}]],dr:{bd:'x...x...x...x...',sn:'....x.......x...',shk:DR_8,timp:'x.......x.......'}},
  C:{bars:8,ch:AN_C_CH,p:[['brass',AN_C,{v:.9}],['strings','ost16',{o:3,v:.3}],['bass','bass8',{o:2,v:.42}]],dr:{timp:'x...x...x...x...',sn:'x..x..x.x.x.x...',crash:SEC_START(8,16)}},
  B2:{bars:8,ch:AN_B_CH,p:[['strings',AN_B,{v:.85}],['trumpet',AN_B,{v:.45,from:4}],['strings','pulse8',{o:3,v:.3}],['bass','bass8',{o:2,v:.42}]],dr:{bd:'x...x...x...x...',sn:'....x.......x.xx',shk:'x.x.x.x.x.x.x.x.'}}}});
MTRACK.victory=o=>({name:'Victory: Banners Up',bpm:112,tr:2,room:'hall',intro:'I',form:['A','B'],sec:{
  I:{bars:2,ch:'C:2 G:2 | C',p:[['trumpet',VI_I,{v:.95}],['horn','stab',{o:3,v:.6,rh:'X.......X.....x.'}],['strings','pad',{o:4,v:.3,from:1}],['bass','pedal',{o:2,v:.5}]],dr:{timp:'x.......R...R...X',crash:'.'.repeat(16)+'X'}},
  A:{bars:8,ch:VI_A_CH,p:[['flute',VI_A,{v:.75}],['pizz','oompah',{o:2,v:.45}],['harp','arp8',{o:3,v:.35}],['strings','pad',{o:4,v:.15}]],dr:{tri:'x'+'.'.repeat(31)}},
  B:{bars:8,ch:VI_B_CH,p:[['oboe',VI_B,{v:.7}],['harp','arp8',{o:3,v:.38}],['pizz','walk',{o:2,v:.42}],['strings','pad',{o:4,v:.15}]],dr:{shk:'x...x...x...x...'}}}});
MTRACK.defeat=o=>({name:'Defeat: Embers Out',bpm:66,tonic:9,room:'hall',once:1,form:['A'],sec:{
  A:{bars:5,ch:'Am | F | E | Am | Am',p:[['strings','E5h D5h | C5h B4q A4q | G#4w | A4w',{v:.7,once:1}],['cello','pad',{o:2,v:.35,to:4}],['oboe','rw | rw | rw | E5h. C5q | A4w',{v:.5,once:1}]],dr:{timp:'x'+'.'.repeat(47)+'o'}}}});
MTRACK.legacy=o=>({name:'Legacy: The Long Way Home',bpm:60,tr:0,room:'cathedral',form:['A','B','A2'],sec:{
  A:{bars:8,ch:LG_A_CH,p:[['oboe',LG_A,{v:.7}],['harp','arp8',{o:3,v:.38}],['strings','pad',{o:4,v:.18}]]},
  B:{bars:8,ch:LG_B_CH,p:[['cello',LG_B,{v:.75}],['strings','pad',{o:4,v:.2}],['harp','arp8',{o:3,v:.32}]]},
  A2:{bars:8,ch:LG_A_CH,p:[['strings',LG_A,{v:.8}],['horn','E4w | E4w | D4w | E4w | F4w | F4w | D4w | E4w',{v:.4}],['choir','pad',{o:4,v:.25}],['harp','arp8',{o:3,v:.32}],['bass','pedal',{o:2,v:.35}]],dr:{swell:'.'.repeat(16*7)+'x'}}}});
// jingles: short, once, played over the music with a dip
const MJINGLE={
 level:{name:'Level up',bpm:132,sec:{A:{bars:1,ch:'C',p:[['trumpet','G4s C5s E5s G5e. C6h. re',{v:.9}],['glock','re re C6q E6q G6q',{v:.6}],['strings','pad',{o:4,v:.3}]],dr:{crash:'.....X'}}}},
 recruit:{name:'New recruit',bpm:100,sec:{A:{bars:1,ch:'C',p:[['horn','G3e C4e. D4s E4h. re',{v:.85}],['harp','arp16',{o:3,v:.45}]]}}},
 quest:{name:'Quest complete',bpm:120,sec:{A:{bars:1,ch:'F:2 C:2',p:[['flute','A5e G5e F5q E5e G5e C6q',{v:.8}],['glock','rh C6h',{v:.5}],['strings','pad',{o:4,v:.25}]]}}},
 rank:{name:'Faction rank up',bpm:116,sec:{A:{bars:1,ch:'G:2 C:2',p:[['brass','D5e G4e B4e D5e E5h',{v:.85}],['strings','pad',{o:4,v:.3}]],dr:{timp:'x.......x',cym:'........x'}}}},
 item:{name:'Item get',bpm:120,sec:{A:{bars:1,ch:'C',p:[['glock','E6s G6s C7e. rq. rh',{v:.7}],['celesta','re C6e. rq. rh',{v:.4}]]}}},
 inn:{name:'Inn rest',bpm:84,sec:{A:{bars:2,ch:'C | F:2 C:2',p:[['harp','G4q C5q E5q D5q | C5w',{v:.6}],['celesta','rw | G5h E5h',{v:.4}],['strings','pad',{o:4,v:.2}]]}}},
 beacon:{name:'Beacon relit',bpm:84,sec:{A:{bars:2,ch:'C | G:2 C:2',p:[['choir',MER,{v:.85}],['brass',MER,{o:-1,v:.55}],['strings','pad',{o:4,v:.3}],['harp','arp16',{o:3,v:.35}]],dr:{timp:'R...R...........',crash:'.'.repeat(16)+'X'}}}}};
// per-track gain, set from the loudness test so every track sits within about 3 dB (tools/chrome/audio.js prints new values)
const MGAIN={"title":1,"town":1.04,"dungeon":1.09,"cave":1.62,"fort":0.94,"archive":1.3,"battle1":0.99,"battle2":0.92,"elite":0.55,"boss":0.9,"cal1":1,"cal2":0.87,"cal3":0.6,"arena":1.09,"victory":1.05,"legacy":1.15,"field_meadow":0.99,"field_coast":1,"field_cave":0.98,"field_snow":1.15,"field_heights":0.97,"field_void":0.96,"field_cal":0.88,
  level:1.5,recruit:1.2,quest:1.25,rank:1.5,item:2.5,inn:1.8,beacon:1};
const MCACHE={};
function musicTrack(id,opt){opt=opt||{};const key=[id,opt.theme||'',opt.night?1:0,opt.cal?1:0,opt.bright?1:0,opt.tr||0,opt.boss||''].join('|');if(MCACHE[key])return MCACHE[key];
  let raw=null;if(MTRACK[id])raw=MTRACK[id](opt);else if(MJINGLE[id])raw=Object.assign({form:['A'],once:1,room:'hall'},MJINGLE[id]);if(!raw)return null;
  if(opt.night)raw._night=1;const c=mdCompile(raw);c.key=key;c.id=id;c.gain=(opt.cal&&id==='field'?MGAIN.field_cal:MGAIN[id+(opt.theme?'_'+opt.theme:'')]||MGAIN[id]||1)*(raw.gain||1)*(opt.night?(opt.theme==='snow'?1.55:1.2):1);
  if(c.loop.len===0&&!c.once)c.once=true;return MCACHE[key]=c;}
// the Music Room list: id, the options that select it, and whether it is open from the start
const MUSIC_ROOM=[
 ['title',{},1],['town',{},1],['town_n',{night:1},1],['field_meadow',{theme:'meadow'},1],['field_coast',{theme:'coast'}],['field_cave',{theme:'cave'}],['field_snow',{theme:'snow'}],['field_heights',{theme:'heights'}],['field_void',{theme:'void'}],
 ['field_night',{theme:'meadow',night:1}],['field_cal',{theme:'void',cal:1}],['dungeon',{}],['cave',{}],['fort',{}],['archive',{}],['battle1',{},0,'tense'],['battle2',{},0,'tense'],['elite',{},0,'tense'],['boss',{boss:'x'},0,'phase'],
 ['cal1',{}],['cal2',{}],['cal3',{}],['arena',{}],['victory',{}],['defeat',{}],['legacy',{}],
 ['level',{},0,0,1],['recruit',{},0,0,1],['quest',{},0,0,1],['rank',{},0,0,1],['item',{},0,0,1],['inn',{},0,0,1],['beacon',{},0,0,1]];
function musicRoomId(r){return r[0].replace(/_n$/,'').replace(/^field_.*/,'field');}
