// =================== ORCHESTRAL AUDIO ENGINE (v0.4.5) ===================
// A small mixer, sampler and sequencer on top of Web Audio. The classic chiptune engine in audio.js stays as the fallback
// (Settings > Music style > Classic chiptune, or automatically when samples cannot load).
//   buses   : music, ambience, sfx, ui -> master -> compressor -> limiter (peaks kept under -1 dBFS)
//   reverb  : two convolvers that crossfade between four rooms built in code (hall, cathedral, cave, room)
//   sampler : FluidR3_GM instrument sprites in audio/ (every third semitone, pitched between), envelopes, 48 voice cap
//   tracks  : compiled from the score in musicdata.js; intro once, then a seamless loop; stems fade in and out live
//   moves   : 1.2 s crossfades, a battle stinger, field and dungeon tracks resume where they left off, ducking for big moments
const AU2={on:false,ctx:null,g:null,inst:{},loading:{},failed:0,fmt:'ogg',voices:[],cur:null,old:[],pos:{},room:'hall',heard:null,toastOnce:0,lastSync:0};
const AUDIO_BASE='audio/',AUDIO_LIVE='https://synxs1n.github.io/Project-Wayfarers-Beta-/audio/';
// the packed copy first; a live-updated Android build can need an instrument its APK never had, so it falls back to the site
function au2Fetch(f){return fetch(AUDIO_BASE+f).then(r=>{if(r.ok)return r;throw 0;}).catch(()=>fetch(AUDIO_LIVE+f).then(r=>{if(!r.ok)throw new Error(f+' '+r.status);return r;}));}
const VOICE_CAP=48;
// ---------- graph ----------
function au2Graph(ctx){
  const g={ctx},mk=v=>{const n=ctx.createGain();n.gain.value=v;return n;};
  g.master=mk(1);g.comp=ctx.createDynamicsCompressor();g.comp.threshold.value=-18;g.comp.knee.value=12;g.comp.ratio.value=3;g.comp.attack.value=.01;g.comp.release.value=.25;
  g.lim=ctx.createDynamicsCompressor();g.lim.threshold.value=-3;g.lim.knee.value=0;g.lim.ratio.value=20;g.lim.attack.value=.002;g.lim.release.value=.1;
  g.out=mk(.89);// -1 dBFS ceiling after the limiter
  g.master.connect(g.comp);g.comp.connect(g.lim);g.lim.connect(g.out);g.out.connect(ctx.destination);
  g.bus={music:mk(1),amb:mk(1),sfx:mk(1),ui:mk(1)};g.duck=mk(1);g.bus.music.connect(g.duck);g.duck.connect(g.master);['amb','sfx','ui'].forEach(k=>g.bus[k].connect(g.master));
  // reverb: two convolvers, crossfaded when the room changes; every bus sends to the shared reverb input
  g.revIn=mk(1);g.cv=[ctx.createConvolver(),ctx.createConvolver()];g.cvG=[mk(1),mk(0)];g.cvA=0;
  g.cv.forEach((c,i)=>{g.revIn.connect(c);c.connect(g.cvG[i]);g.cvG[i].connect(g.master);});
  g.send={music:mk(.32),amb:mk(.25),sfx:mk(.18),ui:mk(.08)};Object.keys(g.send).forEach(k=>{g.bus[k].connect(g.send[k]);g.send[k].connect(g.revIn);});
  g.cv[0].buffer=au2IR(ctx,'hall');g.room='hall';
  return g;}
// impulse responses built in code: decaying stereo noise, darker as it fades; early reflections for the cave
const ROOMS={hall:{len:2.4,dec:2.8,lp:.35},cathedral:{len:4.2,dec:1.6,lp:.25},cave:{len:3,dec:2.2,lp:.55,er:1},room:{len:.8,dec:5,lp:.3}};
const IR_CACHE=new WeakMap();
function au2IR(ctx,room){let C=IR_CACHE.get(ctx);if(!C){C={};IR_CACHE.set(ctx,C);}if(C[room])return C[room];
  const P=ROOMS[room]||ROOMS.hall,sr=ctx.sampleRate,n=Math.floor(P.len*sr),b=ctx.createBuffer(2,n,sr);let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647*2-1;};
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let lp=0;for(let i=0;i<n;i++){const t=i/sr,env=Math.pow(1-i/n,P.dec)*Math.exp(-t*1.2),k=P.lp+(1-P.lp)*Math.exp(-t*3);lp+=k*(rnd()-lp);d[i]=lp*env*.7;}
    if(P.er)[.031,.057,.089,.13].forEach((s,j)=>{const i=Math.floor(s*sr)+ch*37;if(i<n)d[i]+=.5/(j+1);});}
  return C[room]=b;}
function au2Room(room){const g=AU2.g;if(!g||g.room===room)return;const c=g.ctx,t=c.currentTime,nx=1-g.cvA;
  try{g.cv[nx].buffer=au2IR(c,room);}catch(e){return;}g.cvG[nx].gain.cancelScheduledValues(t);g.cvG[g.cvA].gain.cancelScheduledValues(t);
  g.cvG[nx].gain.setValueAtTime(g.cvG[nx].gain.value,t);g.cvG[nx].gain.linearRampToValueAtTime(1,t+1.2);g.cvG[g.cvA].gain.setValueAtTime(g.cvG[g.cvA].gain.value,t);g.cvG[g.cvA].gain.linearRampToValueAtTime(0,t+1.2);g.cvA=nx;g.room=room;}
// ---------- instruments ----------
// per instrument: attack, release, pan, reverb-ish character, and the gain the score is balanced against
const INSTP={strings:{a:.09,r:.45,pan:-.15},tremolo:{a:.06,r:.35,pan:.1},pizz:{a:.002,r:.15,pan:.2},cello:{a:.07,r:.35,pan:.25},bass:{a:.05,r:.3,pan:.1},
  harp:{a:.002,r:.9,pan:-.35},flute:{a:.04,r:.2,pan:.3},oboe:{a:.03,r:.2,pan:.2},clarinet:{a:.03,r:.2,pan:-.2},horn:{a:.06,r:.35,pan:-.3},trumpet:{a:.02,r:.2,pan:.35},
  trombone:{a:.03,r:.25,pan:.3},brass:{a:.03,r:.3,pan:0},choir:{a:.18,r:.6,pan:0},organ:{a:.05,r:.5,pan:0},celesta:{a:.002,r:.7,pan:.25},glock:{a:.001,r:.8,pan:.15},
  lute:{a:.002,r:.5,pan:-.25},fiddle:{a:.03,r:.25,pan:.3},accordion:{a:.04,r:.25,pan:-.1},timpani:{a:.002,r:1.2,pan:0},taiko:{a:.002,r:.9,pan:0},tom:{a:.002,r:.6,pan:0}};
const CORE_INST=['strings','harp','flute','horn','timpani','choir'];
let INST_MAN=null;
function au2Fmt(){try{const a=document.createElement('audio');return a.canPlayType('audio/ogg; codecs="vorbis"')?'ogg':'mp3';}catch(e){return 'mp3';}}
async function au2Man(){if(INST_MAN)return INST_MAN;const r=await au2Fetch('inst.json');return INST_MAN=await r.json();}
async function au2Load(name,ctx){ctx=ctx||AU2.ctx;if(AU2.inst[name])return AU2.inst[name];if(AU2.loading[name])return AU2.loading[name];
  return AU2.loading[name]=(async()=>{const man=await au2Man(),M=man[name];if(!M)throw new Error('no instrument '+name);
    const r=await au2Fetch(name+'.'+AU2.fmt);const ab=await r.arrayBuffer();
    const buf=await new Promise((ok,no)=>{try{const p=ctx.decodeAudioData(ab,ok,no);if(p&&p.then)p.then(ok,no);}catch(e){no(e);}});
    // mp3 adds a little encoder delay: find where the first note really starts and shift every slot by it
    const d=buf.getChannelData(0),sr=buf.sampleRate;let off=0;const lim=Math.min(d.length,Math.floor(sr*.2));let pk=0;for(let i=0;i<lim;i++)pk=Math.max(pk,Math.abs(d[i]));
    for(let i=0;i<lim;i++){if(Math.abs(d[i])>pk*.05){off=Math.max(0,i-16)/sr;break;}}
    return AU2.inst[name]={buf,notes:M.notes,slot:M.slot,loop:M.loop,off};})().catch(e=>{AU2.failed++;delete AU2.loading[name];throw e;});}
function au2LoadAll(list){return Promise.all(list.map(n=>au2Load(n).catch(()=>null)));}
// play one sampled note. dest is a node; t start time; dur seconds held; vel 0..1
function au2Note(ctx,dest,name,midi,t,dur,vel,opt){const I=AU2.inst[name];if(!I||!isFinite(midi))return null;const P=INSTP[name]||{a:.02,r:.3};
  let k=0,best=1e9;for(let i=0;i<I.notes.length;i++){const dd=Math.abs(I.notes[i]-midi);if(dd<best){best=dd;k=i;}}
  const src=ctx.createBufferSource(),g=ctx.createGain(),start=I.off+k*I.slot;src.buffer=I.buf;src.playbackRate.value=Math.pow(2,(midi-I.notes[k])/12);
  const a=(opt&&opt.a)||P.a,r=(opt&&opt.r)||P.r,v=Math.max(0,Math.min(1,vel))*.9;
  if(I.loop&&dur>I.loop[0]*.8){src.loop=true;src.loopStart=start+I.loop[0];src.loopEnd=start+I.loop[1];}
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);const end=t+Math.max(dur,a+.01);g.gain.setValueAtTime(v,end);g.gain.setTargetAtTime(0,end,r/3);
  src.connect(g);g.connect(dest);src.start(t,start);const stopAt=I.loop&&src.loop?end+r*1.5:Math.min(end+r*1.5,t+I.slot/src.playbackRate.value);src.stop(stopAt);
  if(ctx===AU2.ctx){const vo={src,g,t,end:stopAt,v};AU2.voices.push(vo);src.onended=()=>{const i=AU2.voices.indexOf(vo);if(i>=0)AU2.voices.splice(i,1);};
    if(AU2.voices.length>VOICE_CAP){const now=ctx.currentTime;let w=-1,wv=1e9;AU2.voices.forEach((x,i)=>{const s=x.v*(x.end>now?1:0)+(now-x.t)*-.01;if(s<wv){wv=s;w=i;}});
      const x=AU2.voices[w];if(x){try{x.g.gain.cancelScheduledValues(now);x.g.gain.setTargetAtTime(0,now,.02);x.src.stop(now+.1);}catch(e){}AU2.voices.splice(w,1);}}}
  return src;}
// ---------- synthesized orchestral percussion (the soundfont has no snare, cymbals or bass drum) ----------
const NOISE_CACHE=new WeakMap();
function au2Noise(ctx){let b=NOISE_CACHE.get(ctx);if(b)return b;const n=ctx.sampleRate*2;b=ctx.createBuffer(1,n,ctx.sampleRate);const d=b.getChannelData(0);let s=3;for(let i=0;i<n;i++){s=(s*16807)%2147483647;d[i]=s/2147483647*2-1;}NOISE_CACHE.set(ctx,b);return b;}
function au2Hit(ctx,dest,kind,t,vel){vel=vel==null?.8:vel;const N=au2Noise(ctx),mk=()=>ctx.createGain();
  const nz=(dur,type,f,q,v,a)=>{const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=mk();s.buffer=N;s.loop=true;fl.type=type;fl.frequency.value=f;fl.Q.value=q||.7;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+(a||.002));g.gain.setTargetAtTime(0,t+(a||.002),dur/4);s.connect(fl);fl.connect(g);g.connect(dest);s.start(t,Math.random()*1.5);s.stop(t+(a||0)+dur*1.6);};
  const tone=(f0,f1,dur,v,type)=>{const o=ctx.createOscillator(),g=mk();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.003);g.gain.setTargetAtTime(0,t+.003,dur/4);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur*1.6);};
  switch(kind){
  case 'sn':nz(.16,'bandpass',1900,.8,.55*vel);nz(.08,'highpass',5000,.7,.25*vel);tone(220,160,.08,.25*vel,'triangle');break;
  case 'sng':nz(.07,'bandpass',2100,.9,.18*vel);break;// ghost note
  case 'roll':for(let i=0;i<12;i++){const tt=t+i*.045,vv=vel*(.25+.55*i/11);const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=mk();s.buffer=N;fl.type='bandpass';fl.frequency.value=2000;g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.4*vv,tt+.002);g.gain.setTargetAtTime(0,tt+.002,.03);s.connect(fl);fl.connect(g);g.connect(dest);s.start(tt,Math.random());s.stop(tt+.15);}break;
  case 'bd':tone(95,42,.4,.9*vel);nz(.06,'lowpass',400,.7,.35*vel);break;
  case 'cym':nz(1.8,'highpass',5200,.5,.32*vel);nz(.9,'bandpass',8000,1.2,.15*vel);break;
  case 'crash':nz(2.4,'highpass',3800,.5,.45*vel,.004);nz(.3,'bandpass',600,.8,.2*vel);break;
  case 'swell':nz(.4,'highpass',4000,.5,.3*vel,1.6);break;// a cymbal swell rising into the downbeat that follows
  case 'shk':nz(.05,'highpass',7000,.7,.12*vel,.01);break;
  case 'drip':tone(1400+Math.random()*700,500,.08,.12*vel);break;
  case 'tri':tone(5200,5200,.9,.06*vel,'sine');tone(7800,7800,.6,.03*vel,'sine');break;
  }}
// ---------- tracks ----------
// compiled by musicdata.js into {bpm,bar,intro:{len,ev},loop:{len,ev},room,stems:[...]}; ev = {tk,i,m,d,v,st}
function au2TrackNodes(ctx,dest,T){const n={g:ctx.createGain(),stem:{},inst:{}};n.g.gain.value=0;n.g.connect(dest);
  (T.stems||[]).forEach(s=>{const g=ctx.createGain();g.gain.value=0;g.connect(n.g);n.stem[s]=g;});return n;}
function au2InstOut(ctx,N,inst,st){const key=inst+'|'+(st||'');if(N.inst[key])return N.inst[key];const p=ctx.createStereoPanner?ctx.createStereoPanner():ctx.createGain();if(p.pan)p.pan.value=(INSTP[inst]||{}).pan||0;
  p.connect(st&&N.stem[st]?N.stem[st]:N.g);return N.inst[key]=p;}
function au2Sched(ctx,T,N,ev,t){const sec=60/T.bpm/4;// one tick is a 16th
  const P=au2InstOut(ctx,N,ev.i,ev.st);if(ev.off)t+=ev.off*sec;if(ev.drum){au2Hit(ctx,P,ev.i,t,ev.v);return;}au2Note(ctx,P,ev.i,ev.m,t,ev.d*sec*.98,ev.v);}
// live playback: a look-ahead scheduler walks intro, then loop forever
function au2Play(id,opt){opt=opt||{};const g=AU2.g;if(!g)return;const def=typeof musicTrack==='function'?musicTrack(id,opt):null;if(!def)return;
  const ctx=g.ctx,now=ctx.currentTime,fade=opt.fade!=null?opt.fade:1.2;
  if(AU2.cur&&AU2.cur.key===def.key){au2StemSet(opt.stems||{});return;}
  // remember where an area track was, so it can pick up there again
  if(AU2.cur){const C=AU2.cur;if(C.resume)AU2.pos[C.key]=au2Beat(C,now);au2Fade(C,now,fade);AU2.old.push(C);}
  const N=au2TrackNodes(ctx,g.bus.music,def),C={id,key:def.key,T:def,N,resume:!!def.resume};
  const need=def.inst||[];const missing=need.filter(n=>!AU2.inst[n]);
  C.waitFor=missing.length?au2LoadAll(missing):null;
  const startAt=now+(opt.delay||.05)+(missing.length?.0:0);
  let from=0;if(def.resume&&AU2.pos[def.key]!=null&&!opt.restart){from=Math.ceil(AU2.pos[def.key]);if(def.once||from>def.intro.len+def.loop.len*50)from=0;}
  C.t0=startAt-from*60/def.bpm/4;C.next=from;C.started=false;
  N.g.gain.setValueAtTime(0,now);N.g.gain.linearRampToValueAtTime(def.gain||1,startAt+fade);
  au2StemSet(opt.stems||{},C);if(def.room)au2Room(def.room);
  AU2.cur=C;if(C.waitFor)C.waitFor.then(()=>{C.waitFor=null;const n2=ctx.currentTime+.05;C.t0=n2-C.next*60/def.bpm/4;});
  au2Heard(id);}
function au2Beat(C,now){return Math.max(0,(now-C.t0)*C.T.bpm/60*4);}
function au2Fade(C,now,fade){C.stopAt=now+fade+.1;C.N.g.gain.cancelScheduledValues(now);C.N.g.gain.setValueAtTime(C.N.g.gain.value,now);C.N.g.gain.linearRampToValueAtTime(0,now+fade);
  setTimeout(()=>{try{C.N.g.disconnect();}catch(e){}},(fade+3)*1000);}
function au2Stop(fade){const g=AU2.g;if(!g||!AU2.cur)return;const now=g.ctx.currentTime,C=AU2.cur;if(C.resume)AU2.pos[C.key]=au2Beat(C,now);au2Fade(C,now,fade==null?1:fade);AU2.old.push(C);AU2.cur=null;}
function au2StemSet(map,C){C=C||AU2.cur;if(!C||!map)return;const now=AU2.ctx.currentTime;C.stems=C.stems||{};Object.keys(map).forEach(s=>{if(!C.N.stem[s])return;const on=!!map[s];if(C.stems[s]===on)return;C.stems[s]=on;
  const gn=C.N.stem[s].gain;gn.cancelScheduledValues(now);gn.setValueAtTime(gn.value,now);gn.linearRampToValueAtTime(on?1:0,now+(on?1.5:2.5));});}
function au2Tick(){const g=AU2.g;if(!g||g.ctx.state!=='running')return;const ctx=g.ctx,now=ctx.currentTime,ahead=now+.25;
  AU2.old=AU2.old.filter(C=>C.stopAt>now);
  [AU2.cur].concat(AU2.old).forEach(C=>{if(!C||C.waitFor)return;const T=C.T,sec=60/T.bpm/4;const lim=C.stopAt||1e9;
    while(true){const t=C.t0+C.next*sec;if(t>ahead||t>lim)break;
      // which part of the track is this tick in?
      const tk=Math.floor(C.next);let sect,rel;if(tk<T.intro.len){sect=T.intro;rel=tk;}else{sect=T.loop;rel=(tk-T.intro.len)%T.loop.len;}
      if(!sect.byTick){sect.byTick={};sect.ev.forEach(e=>{(sect.byTick[e.tk]=sect.byTick[e.tk]||[]).push(e);});}
      const L=sect.byTick[rel];if(L&&t>=now-.05)L.forEach(e=>{const sw=T.swing&&e.tk%4===2?T.swing*sec:0;try{au2Sched(ctx,T,C.N,e,t+sw);}catch(err){}});
      C.next++;if(T.once&&C.next>=T.intro.len+T.loop.len){C.stopAt=t+3;break;}}});}
// ducking: music dips for big moments
function au2Duck(depth,hold){const g=AU2.g;if(!g)return;const now=g.ctx.currentTime,d=g.duck.gain;d.cancelScheduledValues(now);d.setValueAtTime(d.value,now);d.linearRampToValueAtTime(1-(depth||.45),now+.06);d.setValueAtTime(1-(depth||.45),now+(hold||.6));d.linearRampToValueAtTime(1,now+(hold||.6)+.8);}
// jingles: compiled like tracks, played once on the music bus while the current track dips under them
function au2Jingle(id){const g=AU2.g;if(!g||!AU2.ready)return false;const J=musicTrack(id);if(!J)return false;const ctx=g.ctx,now=ctx.currentTime;
  const go=()=>{const t0=ctx.currentTime+.04,sec=60/J.bpm/4,N=au2TrackNodes(ctx,g.bus.ui,J);N.g.gain.value=(J.gain||1)*1.1;
    J.loop.ev.forEach(e=>au2Sched(ctx,J,N,e,t0+e.tk*sec));const dur=J.loop.len*sec;au2Duck(.6,Math.max(.4,dur-.6));setTimeout(()=>{try{N.g.disconnect();}catch(e){}},(dur+4)*1000);au2Heard(id);};
  const miss=J.inst.filter(n=>!AU2.inst[n]);if(miss.length)au2LoadAll(miss).then(go);else go();return true;}
// ---------- offline render (tests and the Music Room loop check) ----------
async function au2Render(id,seconds,opt){opt=opt||{};const sr=opt.sr||32000,ctx=new OfflineAudioContext(2,Math.ceil(seconds*sr),sr);const g=au2Graph(ctx);
  const def=musicTrack(id,opt);if(!def)return null;await au2LoadAll(def.inst||[]);if(def.room)g.cv[0].buffer=au2IR(ctx,def.room);
  const N=au2TrackNodes(ctx,g.bus.music,def);N.g.gain.value=def.gain||1;Object.keys(N.stem).forEach(s=>{N.stem[s].gain.value=(opt.stems||{})[s]?1:0;});
  const sec=60/def.bpm/4,total=Math.floor(seconds/sec);for(let k=0;k<total;k++){const t=k*sec;let sect,rel;if(k<def.intro.len){sect=def.intro;rel=k;}else{if(def.once&&k>=def.intro.len+def.loop.len)break;sect=def.loop;rel=(k-def.intro.len)%def.loop.len;}
    if(!sect.byTick){sect.byTick={};sect.ev.forEach(e=>{(sect.byTick[e.tk]=sect.byTick[e.tk]||[]).push(e);});}
    (sect.byTick[rel]||[]).forEach(e=>{const sw=def.swing&&e.tk%4===2?def.swing*sec:0;au2Sched(ctx,def,N,e,t+sw);});}
  return {buf:await ctx.startRendering(),def};}
// ---------- what has been heard (for the Music Room) ----------
function au2Heard(id){try{META.heard=META.heard||{};if(!META.heard[id]){META.heard[id]=1;saveMeta();}}catch(e){}}
// ---------- start, style, lifecycle ----------
function au2StyleOn(){return (META.cfg.mstyle||'orch')==='orch'&&!AU2.dead;}
function au2Vol(){const g=AU2.g;if(!g)return;const m=META.cfg.mute?0:1;g.bus.music.gain.value=(META.cfg.music??.45)*1.6*m;g.bus.sfx.gain.value=(META.cfg.sfx??.6)*1.3*m;g.bus.ui.gain.value=(META.cfg.sfx??.6)*1.1*m;g.bus.amb.gain.value=(META.cfg.amb??.3)*1.5*m;}
function au2Start(){if(AU2.g||!AU.ctx||!au2StyleOn())return;AU.track=null;AU2.ctx=AU.ctx;AU2.fmt=au2Fmt();AU2.g=au2Graph(AU.ctx);au2Vol();
  // keep the chiptune buses silent while the orchestra plays (classic sfx still route through AU.fx for anything not overridden)
  AU2.on=true;const t0=performance.now();
  au2LoadAll(CORE_INST).then(()=>{if(AU2.failed>=3||!Object.keys(AU2.inst).length){au2Fail('Could not load the orchestra samples, so the classic chiptune music is playing.');return;}
    if(performance.now()-t0>25000&&!AU2.cur){au2Fail('This device is slow to load the orchestra, so the classic chiptune music is playing.');return;}
    AU2.ready=true;au2Sync(true);
    // after a while, fetch every other instrument file (without decoding it) so the service worker has the whole orchestra for offline play
    setTimeout(()=>{au2Man().then(man=>Object.keys(man).forEach((n,i)=>{if(!AU2.inst[n])setTimeout(()=>fetch(AUDIO_BASE+n+'.'+AU2.fmt).catch(()=>{}),i*400);})).catch(()=>{});},20000);});
  AU2.timer=setInterval(()=>{au2Tick();if(typeof ambTick==='function')ambTick();},30);}
function au2Fail(msg){AU2.dead=true;AU2.on=false;try{clearInterval(AU2.timer);}catch(e){}try{AU2.g.out.disconnect();}catch(e){}AU2.g=null;if(!AU2.toastOnce){AU2.toastOnce=1;try{toast(msg);}catch(e){}}if(AU.want)playMusicClassic(AU.want,true);}
document.addEventListener('visibilitychange',()=>{const c=AU.ctx;if(!c)return;try{if(document.hidden)c.suspend();else c.resume();}catch(e){}});
// ---------- hooks into the old API ----------
const playMusicClassic=playMusic;
audioInit=(function(i0){return function(){i0.apply(this,arguments);try{au2Start();}catch(e){}};})(audioInit);
playMusic=function(name,force){AU.want=name;if(AU2.on){if(AU2.ready)au2Sync();return;}return playMusicClassic.apply(this,arguments);};
audioVol=(function(v0){return function(){v0.apply(this,arguments);try{au2Vol();}catch(e){}};})(audioVol);
// classic music keeps scheduling only when the orchestra is off
schedule=(function(s0){return function(){if(AU2.on)return;return s0.apply(this,arguments);};})(schedule);
