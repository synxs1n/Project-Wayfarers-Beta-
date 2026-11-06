// ===== audio.js (base): the chiptune audio fallback, AU, sfx() and playMusic() =====
// Everything is synthesized: pulse lead, triangle bass, noise drums. Tracks are generated from a seed per mood and realm.
const AU={ctx:null,master:null,mus:null,fx:null,track:null,name:null,step:0,nextT:0,timer:null,noise:null};
function audioInit(){
  if(AU.ctx)return;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{AU.ctx=new AC();}catch(e){return;}
  AU.master=AU.ctx.createGain();const comp=AU.ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;AU.master.connect(comp);comp.connect(AU.ctx.destination);
  AU.mus=AU.ctx.createGain();AU.mus.connect(AU.master);AU.fx=AU.ctx.createGain();AU.fx.connect(AU.master);
  const n=AU.ctx.createBuffer(1,AU.ctx.sampleRate*.5,AU.ctx.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=n;
  audioVol();
  AU.timer=setInterval(schedule,40);
  if(AU.want)playMusic(AU.want,true);
}
function audioVol(){if(!AU.ctx)return;const m=META.cfg.mute?0:1;AU.mus.gain.value=(META.cfg.music??.45)*1.8*m;AU.fx.gain.value=(META.cfg.sfx??.6)*1.4*m;}
const MIDI=n=>440*Math.pow(2,(n-69)/12);
const SCALES={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],harm:[0,2,3,5,7,8,11],mixo:[0,2,4,5,7,9,10]};
const MOODS={
 title:{bpm:84,sc:'major',prog:[0,4,5,3],lead:'square',dr:0,feel:.5},
 town:{bpm:98,sc:'major',prog:[0,3,4,0,5,3,4,4],lead:'square',dr:1,feel:.6},
 field:{bpm:124,sc:'mixo',prog:[0,6,3,0],lead:'square',dr:2,feel:.75},
 dungeon:{bpm:86,sc:'dorian',prog:[0,0,3,4],lead:'triangle',dr:0,feel:.35,low:1},
 battle:{bpm:152,sc:'minor',prog:[0,5,2,6],lead:'square',dr:3,feel:.85,drive:1},
 boss:{bpm:164,sc:'harm',prog:[0,5,3,4],lead:'sawtooth',dr:3,feel:.9,drive:1},
 archive:{bpm:66,sc:'harm',prog:[0,5,3,4,0,3,5,4],lead:'triangle',dr:0,feel:.4,low:1},
 victory:{bpm:140,sc:'major',prog:[0,3,4,0],lead:'square',dr:1,feel:.8,once:1}
};
const THEME_ROOT={meadow:60,coast:62,cave:57,snow:64,heights:65,void:59,arena:62};
function buildTrack(name){
  const theme=G&&WS.m?WS.m.theme:(G&&B?ZS(B.stage).theme:'meadow'),M=MOODS[name]||MOODS.field;
  const R=mulberry(hashS(name+theme+(typeof bossMusicKey==='function'?bossMusicKey():''))),S=SCALES[M.sc],root=(THEME_ROOT[theme]||60)-(M.low?12:0)+(typeof bossMusicOff==='function'?bossMusicOff():0);
  const bars=M.prog.length*2,steps=bars*8,mel=[],bass=[],drum=[];
  const deg=(d,oct)=>root+S[((d%7)+7)%7]+12*(Math.floor(d/7)+(oct||0));
  const rhythms=[[1,0,1,1,1,0,1,0],[1,0,0,1,1,0,1,1],[1,1,1,0,1,0,0,0],[1,0,1,0,1,1,1,0],[1,0,0,0,1,0,1,0]];
  const phrase=[];let cur=R()*4|0;
  for(let b=0;b<M.prog.length;b++){const ch=M.prog[b],rh=rhythms[Math.floor(R()*rhythms.length)];
    for(let s=0;s<8;s++){if(!rh[s]||R()>M.feel+.15){phrase.push(null);continue;}
      if(s===0||s===4){const tones=[ch,ch+2,ch+4];cur=tones[Math.floor(R()*3)];}else cur+=Math.floor(R()*3)-1;
      cur=clamp(cur,-2,9);phrase.push(deg(cur,1));}}
  // A A' : second pass varies the last bar
  for(let i=0;i<steps;i++){const p=phrase[i%phrase.length];mel.push(i>=phrase.length&&i>=steps-8&&p!==null?p+(R()<.5?2:0):p);}
  for(let b=0;b<bars;b++){const ch=M.prog[b%M.prog.length];for(let s=0;s<8;s++){const r=deg(ch,-1);
    bass.push(M.drive?[r,r,r+12,r,r,r+7,r+12,r][s]:s===0?r:s===4?deg(ch+4,-1):s===6&&R()<.4?r+12:null);
    let d=0;if(M.dr>=1&&s%2===0)d|=4;if(M.dr>=2&&(s===0||s===4))d|=1;if(M.dr>=2&&(s===2||s===6))d|=2;if(M.dr>=3&&s===3&&R()<.5)d|=1;if(M.dr>=3)d|=4;drum.push(d);}}
  return {name,bpm:M.bpm,lead:M.lead,mel,bass,drum,steps,once:M.once};
}
function playMusic(name,force){
  AU.want=name;if(!AU.ctx)return;if(!force&&AU.name===name&&AU.track)return;
  AU.name=name;AU.track=buildTrack(name);AU.step=0;AU.nextT=AU.ctx.currentTime+.08;
}
function tone(type,f,t,dur,vol,dest,slide){
  const o=AU.ctx.createOscillator(),g=AU.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  o.connect(g);g.connect(dest||AU.mus);o.start(t);o.stop(t+dur+.02);
}
function noiseHit(t,dur,vol,hp,dest){
  const s=AU.ctx.createBufferSource(),g=AU.ctx.createGain(),f=AU.ctx.createBiquadFilter();s.buffer=AU.noise;f.type='highpass';f.frequency.value=hp;
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0005,t+dur);s.connect(f);f.connect(g);g.connect(dest||AU.mus);s.start(t);s.stop(t+dur+.02);
}
function schedule(){
  if(!AU.ctx||!AU.track)return;
  if(AU.ctx.state==='suspended')return;
  const T=AU.track,sp=60/T.bpm/2;
  while(AU.nextT<AU.ctx.currentTime+.18){
    const i=AU.step%T.steps,t=AU.nextT;
    if(T.mel[i]!=null){let len=1;while(len<4&&T.mel[(i+len)%T.steps]==null)len++;tone(T.lead,MIDI(T.mel[i]),t,sp*len*.92,T.lead==='sawtooth'?.07:.1);}
    if(T.bass[i]!=null)tone('triangle',MIDI(T.bass[i]),t,sp*.9,.22);
    const d=T.drum[i];if(d&1)tone('sine',120,t,.12,.35,null,40);if(d&2)noiseHit(t,.09,.18,1200);if(d&4)noiseHit(t,.03,.05,7000);
    AU.step++;AU.nextT+=sp;
    if(T.once&&AU.step>=T.steps){AU.track=null;AU.name=null;break;}
  }
}
function sfx(k){
  if(!AU.ctx||AU.ctx.state==='suspended')return;const t=AU.ctx.currentTime,D=AU.fx;
  switch(k){
  case 'step':break;
  case 'blip':tone('square',880,t,.04,.08,D);break;
  case 'door':noiseHit(t,.12,.2,400,D);tone('triangle',180,t,.12,.2,D,120);break;
  case 'chest':[0,4,7].forEach((n,i)=>tone('triangle',MIDI(76+n),t+i*.07,.1,.045,D));break;// v0.8.3: softer
  case 'lever':tone('square',220,t,.08,.12,D,110);noiseHit(t+.06,.2,.2,300,D);break;
  case 'encounter':for(let i=0;i<6;i++)tone('square',MIDI(84-i*3),t+i*.04,.06,.1,D);break;
  case 'swing':noiseHit(t,.08,.14,2500,D);break;
  case 'cast':tone('triangle',MIDI(76),t,.18,.12,D,MIDI(88));tone('sine',MIDI(83),t+.05,.15,.06,D);break;
  case 'heal':[0,4,7,11].forEach((n,i)=>tone('triangle',MIDI(79+n),t+i*.05,.16,.1,D));break;
  case 'rest':[[67,0],[72,.22],[76,.44],[79,.66],[84,.95]].forEach(([n,d])=>tone('triangle',MIDI(n),t+d,.34,.09,D));tone('sine',MIDI(55),t,.9,.05,D);break;
  case 'hit':noiseHit(t,.07,.22,800,D);tone('square',140,t,.06,.1,D,70);break;
  case 'weak':noiseHit(t,.09,.25,600,D);tone('square',300,t,.1,.12,D,90);break;
  case 'crit':noiseHit(t,.14,.3,500,D);tone('sawtooth',400,t,.15,.12,D,60);break;
  case 'react':[0,7,12,19].forEach((n,i)=>tone('square',MIDI(67+n),t+i*.035,.12,.09,D));noiseHit(t,.2,.18,1500,D);break;
  case 'break':noiseHit(t,.35,.35,300,D);[19,12,7,0].forEach((n,i)=>tone('square',MIDI(72+n),t+i*.05,.1,.1,D));break;
  case 'ko':tone('square',MIDI(60),t,.3,.1,D,MIDI(36));break;
  case 'win':[0,0,0,4,7,12].forEach((n,i)=>tone('square',MIDI(72+n),t+i*.11,i===5?.5:.1,.1,D));break;
  case 'lose':[7,5,3,0].forEach((n,i)=>tone('triangle',MIDI(60+n),t+i*.22,.3,.14,D));break;
  case 'level':[0,4,7,12,16].forEach((n,i)=>tone('square',MIDI(76+n),t+i*.06,.14,.09,D));break;
  case 'buy':tone('square',MIDI(91),t,.04,.07,D);tone('square',MIDI(96),t+.05,.1,.08,D);tone('triangle',MIDI(103),t+.1,.2,.06,D);break; // v0.4.0 3.4: a three note coin clink
  case 'limit':for(let i=0;i<10;i++)tone('square',MIDI(60+i*2),t+i*.03,.08,.08,D);break;
  case 'archivist':{ // the Archivist's sting: a falling harmonic-minor line, a hush, then a rising gold chord
    [83,79,75,71,67].forEach((n,i)=>tone('triangle',MIDI(n),t+i*.13,.32,.12,D));
    [71,75,78,83].forEach((n,i)=>tone('square',MIDI(n),t+.8+i*.06,1.1-i*.1,.06,D));
    tone('sine',MIDI(47),t+.8,1.4,.16,D);noiseHit(t+.8,.5,.05,4000,D);break;}
  case 'prime':[0,7,12].forEach((n,i)=>tone('triangle',MIDI(79+n),t+i*.07,.16,.1,D));tone('sine',MIDI(91),t+.2,.3,.07,D,MIDI(96));break; // v0.3.5: a rising shimmer when a foe is primed
  case 'deny':tone('square',150,t,.12,.1,D);break;
  }
}
