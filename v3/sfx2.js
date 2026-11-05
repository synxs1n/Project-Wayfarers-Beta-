// =================== LAYERED SOUND EFFECTS (v0.4.5) ===================
// Every old sfx(k) name still works. In orchestral mode each one is built from shaped noise, tones and a few samples
// (glockenspiel, celesta, harp, timpani, choir) through the sfx bus and its reverb send. Classic mode keeps the old bleeps.
// Context from the battle hooks picks the weapon family for swings and hits, and the element for spells and impacts.
const SFXC={wt:null,el:null,hitEl:null,react:null,block:0,n:0,t0:0};
function sxG(){return AU2.on&&AU2.g&&AU2.g.ctx.state==='running'?AU2.g:null;}
function sxNoise(d,o){const g=AU2.g,c=g.ctx,t=c.currentTime+(o.t||0),s=c.createBufferSource(),f=c.createBiquadFilter(),G=c.createGain(),dur=o.dur||.2;
  s.buffer=au2Noise(c);s.loop=true;f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f1)f.frequency.exponentialRampToValueAtTime(Math.max(30,o.f1),t+dur);f.Q.value=o.q||1;
  const a=o.a||.004,v=o.v==null?.3:o.v;G.gain.setValueAtTime(0,t);G.gain.linearRampToValueAtTime(v,t+a);if(o.hold)G.gain.setValueAtTime(v,t+a+o.hold);G.gain.setTargetAtTime(0,t+a+(o.hold||0),(dur-a)/3.5);
  s.connect(f);f.connect(G);G.connect(d);s.start(t,Math.random()*1.5);s.stop(t+dur*1.6+(o.hold||0));}
function sxTone(d,o){const c=AU2.g.ctx,t=c.currentTime+(o.t||0),os=c.createOscillator(),G=c.createGain(),dur=o.dur||.2;os.type=o.type||'sine';os.frequency.setValueAtTime(o.f||440,t);
  if(o.f1)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.f1),t+dur);if(o.det)os.detune.value=o.det;const a=o.a||.004,v=o.v==null?.2:o.v;
  let out=G;if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;os.connect(f);f.connect(G);}else os.connect(G);
  G.gain.setValueAtTime(0,t);G.gain.linearRampToValueAtTime(v,t+a);G.gain.setTargetAtTime(0,t+a,(dur-a)/3.5);out.connect(d);os.start(t);os.stop(t+dur*1.6);}
function sxSmp(d,inst,m,o){const c=AU2.g.ctx;if(!AU2.inst[inst]){au2Load(inst).catch(()=>{});return false;}au2Note(c,d,inst,m,c.currentTime+((o&&o.t)||0),(o&&o.dur)||.3,(o&&o.v)||.6);return true;}
function sxCrackle(d,t0,n,dur,v){for(let i=0;i<n;i++)sxNoise(d,{t:t0+Math.random()*dur,dur:.02+Math.random()*.02,type:'highpass',f:2500+Math.random()*3000,v:v*(.5+Math.random()*.5)});}
function sxPings(d,t0,n,lo,hi,v){for(let i=0;i<n;i++)sxTone(d,{t:t0+i*.025+Math.random()*.02,f:lo+Math.random()*(hi-lo),dur:.25+Math.random()*.3,v:v*(1-i/n*.5)});}
const WT_FAM={blade:'blade',shortsword:'blade',dagger:'blade',greatsword:'heavy',axe:'heavy',mace:'blunt',qstaff:'blunt',lance:'spear',bow:'bow',longbow:'bow',crossbow:'xbow',knuckles:'fist',claws:'fist',staff:'light',tome:'light',lute:'lute',harp:'harpw',flute:'flutew'};
// ---------- the pieces ----------
const SXE={// element cast (c) and impact (i)
 fire:{c:d=>{sxNoise(d,{type:'lowpass',f:300,f1:2200,dur:.45,v:.3,a:.2});sxCrackle(d,.05,8,.4,.12);},i:d=>{sxNoise(d,{type:'lowpass',f:1800,f1:300,dur:.5,v:.45});sxCrackle(d,0,14,.6,.16);sxTone(d,{f:110,f1:50,dur:.3,v:.25});}},
 water:{c:d=>{for(let i=0;i<5;i++)sxTone(d,{t:i*.06,f:500+i*120,f1:900+i*150,dur:.08,v:.12});},i:d=>{sxNoise(d,{type:'bandpass',f:3000,f1:500,dur:.5,v:.4,q:.8});sxTone(d,{f:300,f1:120,dur:.18,v:.22});sxNoise(d,{t:.08,type:'highpass',f:4000,dur:.3,v:.12});}},
 ice:{c:d=>{sxPings(d,0,5,2400,4200,.06);sxNoise(d,{type:'highpass',f:6000,dur:.4,v:.08,a:.2});},i:d=>{sxPings(d,0,9,2800,6400,.09);sxNoise(d,{type:'highpass',f:3500,dur:.25,v:.28});sxTone(d,{f:180,f1:90,dur:.15,v:.15});}},
 lightning:{c:d=>{sxTone(d,{type:'sawtooth',f:62,dur:.4,v:.09,lp:900});sxNoise(d,{type:'highpass',f:5000,dur:.3,v:.06,a:.15});},i:d=>{sxNoise(d,{type:'highpass',f:2500,dur:.12,v:.55,a:.001});sxTone(d,{type:'sawtooth',f:90,f1:60,dur:.25,v:.14,lp:2000});sxNoise(d,{t:.05,type:'lowpass',f:500,dur:.6,v:.18});}},
 earth:{c:d=>{sxNoise(d,{type:'lowpass',f:160,dur:.6,v:.4,a:.2});},i:d=>{sxNoise(d,{type:'lowpass',f:600,f1:120,dur:.45,v:.5});sxTone(d,{f:70,f1:38,dur:.45,v:.4});sxCrackle(d,.02,10,.3,.1);}},
 wind:{c:d=>{sxNoise(d,{type:'bandpass',f:400,f1:1800,dur:.5,v:.25,q:2,a:.2});},i:d=>{sxNoise(d,{type:'bandpass',f:2000,f1:500,dur:.55,v:.35,q:1.5});sxNoise(d,{t:.1,type:'bandpass',f:900,f1:2400,dur:.4,v:.15,q:3});}},
 light:{c:d=>{[84,88,91,96].forEach((m,i)=>sxSmp(d,'celesta',m,{t:i*.05,v:.4,dur:.3})||sxTone(d,{t:i*.05,f:MIDI(m),dur:.3,v:.07}));},i:d=>{[88,91,96,100].forEach((m,i)=>sxSmp(d,'glock',m,{t:i*.03,v:.45,dur:.4})||sxTone(d,{t:i*.03,f:MIDI(m),dur:.4,v:.07}));sxNoise(d,{type:'highpass',f:6000,dur:.4,v:.12});}},
 shadow:{c:d=>{sxNoise(d,{type:'bandpass',f:500,dur:.45,v:.3,a:.38,q:.7});sxTone(d,{f:55,dur:.6,v:.22,a:.2,det:12});},i:d=>{sxNoise(d,{type:'lowpass',f:800,dur:.4,v:.35,a:.25});sxTone(d,{f:49,f1:40,dur:.7,v:.3});sxTone(d,{t:.02,f:73,f1:52,dur:.5,v:.12,det:-20});}},
 arcane:{c:d=>{sxTone(d,{f:600,f1:1400,dur:.3,v:.12});sxTone(d,{t:.05,f:900,f1:2000,dur:.25,v:.06});},i:d=>{sxNoise(d,{type:'bandpass',f:1500,f1:600,dur:.25,v:.3});sxTone(d,{f:700,f1:300,dur:.2,v:.12});}}};
const SXW={// weapon swing (s) and hit (h)
 blade:{s:d=>sxNoise(d,{type:'bandpass',f:3500,f1:900,dur:.16,v:.3,q:1.4,a:.04}),h:(d,k)=>{sxNoise(d,{type:'highpass',f:3000,dur:.08,v:.4*k,a:.001});sxTone(d,{type:'triangle',f:1900,dur:.18,v:.05*k});sxTone(d,{f:130,f1:60,dur:.12,v:.3*k});}},
 heavy:{s:d=>sxNoise(d,{type:'bandpass',f:1800,f1:350,dur:.3,v:.35,q:1.2,a:.08}),h:(d,k)=>{sxNoise(d,{type:'lowpass',f:2200,f1:400,dur:.2,v:.5*k,a:.001});sxTone(d,{f:95,f1:42,dur:.25,v:.45*k});}},
 blunt:{s:d=>sxNoise(d,{type:'bandpass',f:1200,f1:400,dur:.22,v:.3,q:1,a:.06}),h:(d,k)=>{sxNoise(d,{type:'lowpass',f:900,dur:.12,v:.55*k,a:.001});sxTone(d,{f:85,f1:40,dur:.22,v:.5*k});}},
 spear:{s:d=>{sxNoise(d,{type:'bandpass',f:900,f1:2800,dur:.14,v:.3,q:2,a:.1});},h:(d,k)=>{sxNoise(d,{type:'bandpass',f:2500,dur:.06,v:.45*k,a:.001,q:2});sxTone(d,{f:160,f1:70,dur:.12,v:.3*k});}},
 bow:{s:d=>{sxTone(d,{type:'triangle',f:190,f1:150,dur:.18,v:.22});sxNoise(d,{t:.02,type:'bandpass',f:5000,f1:2500,dur:.25,v:.12,q:3});},h:(d,k)=>{sxNoise(d,{type:'bandpass',f:700,dur:.05,v:.45*k,a:.001});sxTone(d,{f:240,f1:110,dur:.08,v:.25*k});}},
 xbow:{s:d=>{sxNoise(d,{type:'highpass',f:3000,dur:.03,v:.35,a:.001});sxTone(d,{t:.02,type:'triangle',f:260,f1:160,dur:.1,v:.22});sxNoise(d,{t:.03,type:'bandpass',f:4500,f1:2000,dur:.18,v:.1,q:3});},h:(d,k)=>{sxNoise(d,{type:'bandpass',f:600,dur:.05,v:.5*k,a:.001});sxTone(d,{f:200,f1:90,dur:.1,v:.3*k});}},
 fist:{s:d=>sxNoise(d,{type:'bandpass',f:1500,f1:700,dur:.09,v:.25,q:1,a:.02}),h:(d,k)=>{sxNoise(d,{type:'lowpass',f:1200,dur:.07,v:.5*k,a:.001});sxTone(d,{f:120,f1:60,dur:.1,v:.35*k});}},
 light:{s:d=>sxNoise(d,{type:'bandpass',f:2000,f1:800,dur:.14,v:.22,q:1,a:.04}),h:(d,k)=>{sxNoise(d,{type:'lowpass',f:1400,dur:.08,v:.4*k,a:.001});sxTone(d,{f:140,f1:70,dur:.1,v:.25*k});}},
 lute:{s:d=>{sxSmp(d,'lute',57+Math.floor(Math.random()*3)*5,{v:.55,dur:.4})||sxNoise(d,{type:'bandpass',f:1500,dur:.1,v:.2});},h:(d,k)=>SXW.blunt.h(d,k)},
 harpw:{s:d=>{[60,64,67,72].forEach((m,i)=>sxSmp(d,'harp',m,{t:i*.03,v:.4,dur:.4}));},h:(d,k)=>SXW.light.h(d,k)},
 flutew:{s:d=>{sxSmp(d,'flute',79+Math.floor(Math.random()*3)*2,{v:.4,dur:.15})||sxTone(d,{f:1200,dur:.12,v:.1});},h:(d,k)=>SXW.light.h(d,k)},
 foe:{s:d=>sxNoise(d,{type:'bandpass',f:1300,f1:500,dur:.2,v:.28,q:1.2,a:.05}),h:(d,k)=>{sxNoise(d,{type:'lowpass',f:1600,f1:500,dur:.12,v:.45*k,a:.001});sxTone(d,{f:110,f1:55,dur:.16,v:.35*k});}}};
function sxStep(d){if((META.cfg.sfx??.6)<.55)return;const m=WS.m;if(!m)return;let ch='';try{ch=tileAt(m,WS.x,WS.y);}catch(e){}
  let k='grass';if(m.kind==='dungeon'||m.cave||m.archive)k='stone';else if(m.inside||m.kind==='inn'||m.kind==='house')k='wood';else if(m.kind==='town')k=ch===','?'grass':'stone';else{const th=m.theme;k=th==='snow'?'snow':th==='coast'&&ch!==','?'sand':ch===','?'grass':'stone';}
  const v=.07;switch(k){case 'grass':sxNoise(d,{type:'bandpass',f:2500,dur:.07,v,q:.8,a:.01});break;case 'stone':sxNoise(d,{type:'bandpass',f:900,dur:.05,v:v*1.1,q:1.5,a:.002});sxTone(d,{f:180,f1:120,dur:.04,v:v*.6});break;
    case 'wood':sxNoise(d,{type:'lowpass',f:700,dur:.06,v:v*1.3,a:.002});sxTone(d,{f:150,f1:110,dur:.06,v:v});break;case 'snow':sxNoise(d,{type:'lowpass',f:1600,dur:.12,v:v*1.2,a:.03});break;case 'sand':sxNoise(d,{type:'bandpass',f:1800,dur:.1,v:v*.9,q:.6,a:.03});break;}}
function sxJ(id,alt){if(!au2Jingle(id)&&alt)alt();}
// the new effects; anything not handled here falls through to the classic one
function sfx2(k){const g=sxG();if(!g)return false;const now=performance.now();if(now-SFXC.t0>100){SFXC.t0=now;SFXC.n=0;}if(++SFXC.n>16&&k!=='level'&&k!=='limit')return true;
  const D=g.bus.sfx,U=g.bus.ui,fam=SFXC.wt&&WT_FAM[SFXC.wt]||'foe',W=SXW[fam]||SXW.foe;
  switch(k){
  case 'step':sxStep(D);return true;
  case 'blip':sxTone(U,{f:1250,f1:1100,dur:.05,v:.12});sxNoise(U,{type:'highpass',f:6000,dur:.02,v:.05});return true;
  case 'open':sxNoise(U,{type:'bandpass',f:700,f1:2200,dur:.16,v:.12,q:1.2,a:.06});sxTone(U,{t:.04,f:880,dur:.08,v:.07});return true;
  case 'close':sxNoise(U,{type:'bandpass',f:2000,f1:600,dur:.14,v:.1,q:1.2,a:.04});return true;
  case 'confirm':sxTone(U,{f:880,dur:.07,v:.1});sxTone(U,{t:.06,f:1320,dur:.12,v:.1});return true;
  case 'cancel':sxTone(U,{f:880,dur:.07,v:.09});sxTone(U,{t:.06,f:660,dur:.12,v:.09});return true;
  case 'deny':sxTone(U,{type:'triangle',f:180,dur:.09,v:.2,lp:900});sxTone(U,{t:.1,type:'triangle',f:150,dur:.14,v:.2,lp:900});return true;
  case 'door':sxNoise(D,{type:'lowpass',f:420,dur:.25,v:.3,a:.02});sxTone(D,{f:150,f1:95,dur:.2,v:.22});sxNoise(D,{t:.18,type:'lowpass',f:900,dur:.06,v:.25,a:.002});return true;
  case 'chest':sxNoise(D,{type:'bandpass',f:380,f1:520,dur:.35,v:.18,q:4,a:.08});sxNoise(D,{t:.3,type:'lowpass',f:800,dur:.08,v:.3,a:.002});setTimeout(()=>sxJ('item',()=>{}),340);return true;
  case 'lever':sxNoise(D,{type:'bandpass',f:1800,dur:.05,v:.3,a:.001,q:3});sxTone(D,{t:.05,type:'triangle',f:240,f1:120,dur:.15,v:.2});sxNoise(D,{t:.12,type:'lowpass',f:500,dur:.5,v:.25,a:.05});return true;
  case 'waystone':sxPings(D,0,6,1800,3600,.05);sxTone(D,{f:110,dur:1.2,v:.12,a:.3});[72,76,79,84].forEach((m,i)=>sxSmp(D,'celesta',m,{t:.1+i*.08,v:.35,dur:.5}));return true;
  case 'encounter':{sxNoise(D,{type:'bandpass',f:400,f1:5000,dur:.35,v:.3,q:1.5,a:.3});sxPings(D,.34,8,2500,6000,.08);sxNoise(D,{t:.34,type:'highpass',f:3000,dur:.3,v:.3,a:.001});sxTone(D,{t:.34,f:80,f1:40,dur:.4,v:.3});return true;}
  case 'swing':W.s(D);return true;
  case 'cast':{const E=SXE[SFXC.el]||SXE.arcane;E.c(D);return true;}
  case 'hit':case 'weak':case 'crit':{if(SFXC.block&&k==='hit'){SFXC.block=0;sxNoise(D,{type:'lowpass',f:500,dur:.1,v:.4,a:.002});sxTone(D,{f:140,f1:110,dur:.1,v:.25});return true;}
    const el=SFXC.hitEl&&SXE[SFXC.hitEl]&&SFXC.hitEl!=='arcane'?SXE[SFXC.hitEl]:null,K=k==='hit'?1:k==='weak'?1.25:1.45;
    if(el)el.i(D);if(!el||fam!=='light')W.h(D,el?K*.6:K);
    if(k==='weak'){sxTone(D,{f:1500,f1:2200,dur:.12,v:.08});sxNoise(D,{type:'bandpass',f:3200,dur:.1,v:.2,q:2});}
    if(k==='crit'){sxTone(D,{f:60,f1:32,dur:.6,v:.5});sxNoise(D,{type:'lowpass',f:3000,f1:200,dur:.5,v:.35,a:.001});au2Duck(.35,.25);}return true;}
  case 'react':{const r=SFXC.react||{};const a=SXE[r.a]||SXE.arcane,b=SXE[r.b]||SXE.arcane;a.i(D);setTimeout(()=>{if(sxG())b.i(D);},60);
    sxNoise(D,{t:.08,type:'lowpass',f:4000,f1:300,dur:.7,v:.4,a:.002});sxTone(D,{t:.08,f:70,f1:35,dur:.7,v:.4});return true;}
  case 'break':sxPings(D,0,12,2000,7000,.1);sxNoise(D,{type:'highpass',f:2500,dur:.4,v:.4,a:.001});sxTone(D,{f:90,f1:40,dur:.4,v:.35});return true;
  case 'heal':if(performance.now()-(SFXC.skipHeal||0)<40)return true;[79,83,86,91].forEach((m,i)=>sxSmp(D,'celesta',m,{t:i*.06,v:.35,dur:.4})||sxTone(D,{t:i*.06,f:MIDI(m),dur:.35,v:.06}));sxTone(D,{f:500,f1:1000,dur:.6,v:.05,a:.2});return true;
  case 'buff':sxTone(D,{f:660,f1:990,dur:.3,v:.07,a:.05});sxTone(D,{t:.08,f:990,f1:1320,dur:.3,v:.06,a:.05});return true;
  case 'debuff':sxTone(D,{f:520,f1:300,dur:.4,v:.09});sxTone(D,{f:740,f1:420,dur:.4,v:.07});return true;
  case 'prime':sxSmp(D,'glock',84,{v:.55,dur:.3})||sxTone(D,{f:1047,dur:.2,v:.1});sxSmp(D,'glock',91,{t:.09,v:.6,dur:.5})||sxTone(D,{t:.09,f:1568,dur:.3,v:.1});sxTone(D,{t:.18,f:2093,f1:2637,dur:.35,v:.05});return true;
  case 'ko':sxTone(D,{type:'triangle',f:330,f1:80,dur:.6,v:.15,lp:1200});sxNoise(D,{t:.4,type:'lowpass',f:400,dur:.2,v:.3,a:.002});sxTone(D,{t:.4,f:70,f1:40,dur:.25,v:.3});return true;
  case 'revive':sxSmp(D,'choir',72,{v:.5,dur:.8});sxSmp(D,'choir',76,{v:.4,dur:.8});[84,88,91,96].forEach((m,i)=>sxSmp(D,'celesta',m,{t:.2+i*.06,v:.35,dur:.4}));sxTone(D,{f:300,f1:900,dur:.8,v:.06,a:.4});return true;
  case 'limit':{sxNoise(D,{type:'highpass',f:400,f1:6000,dur:1,v:.3,a:.9});sxTone(D,{type:'sawtooth',f:110,f1:440,dur:1,v:.06,a:.9,lp:2500});au2Duck(.55,1.2);
    setTimeout(()=>{if(!sxG())return;au2Hit(g.ctx,D,'crash',g.ctx.currentTime,.9);sxTone(D,{f:65,f1:30,dur:.8,v:.55});sxNoise(D,{type:'lowpass',f:2500,f1:200,dur:.5,v:.4,a:.001});},950);return true;}
  case 'summon':au2Duck(.5,1.2);au2Hit(g.ctx,D,'swell',g.ctx.currentTime,.8);[48,55,60,64,67,72,76,79].forEach((m,i)=>sxSmp(D,'harp',m,{t:.05+i*.04,v:.45,dur:.6}));
    setTimeout(()=>{if(!sxG())return;sxTone(D,{f:60,f1:35,dur:.8,v:.5});au2Hit(g.ctx,D,'crash',g.ctx.currentTime,.6);},420);return true;
  case 'unsummon':[79,76,72,67,64,60].forEach((m,i)=>sxSmp(D,'harp',m,{t:i*.04,v:.35,dur:.5}));sxNoise(D,{type:'bandpass',f:2000,f1:500,dur:.4,v:.12,q:1});return true;
  case 'phase':au2Duck(.6,1.2);sxTone(D,{f:50,f1:28,dur:1.4,v:.6});au2Hit(g.ctx,D,'crash',g.ctx.currentTime,1);sxSmp(D,'timpani',40,{v:1,dur:1})||null;sxNoise(D,{type:'lowpass',f:1200,f1:100,dur:1,v:.4,a:.002});return true;
  case 'level':sxJ('level',()=>sxPings(U,0,5,1500,3000,.08));return true;
  case 'rest':sxJ('inn',()=>sxTone(U,{f:660,dur:.5,v:.08}));return true;
  case 'buy':[96,100,103].forEach((m,i)=>sxSmp(U,'glock',m,{t:i*.05,v:.4,dur:.25})||sxTone(U,{t:i*.05,f:MIDI(m),dur:.15,v:.07}));sxNoise(U,{type:'highpass',f:7000,dur:.08,v:.06});return true;
  case 'equip':sxNoise(D,{type:'bandpass',f:2500,dur:.08,v:.2,q:2,a:.002});sxTone(D,{t:.03,type:'triangle',f:1800,dur:.15,v:.04});sxNoise(D,{t:.05,type:'lowpass',f:900,dur:.1,v:.15});return true;
  case 'chime':sxSmp(U,'glock',88,{v:.5,dur:.5})||sxTone(U,{f:1320,dur:.4,v:.08});return true;
  case 'win':sxSmp(D,'brass',60,{v:.6,dur:.5});sxSmp(D,'brass',64,{v:.5,dur:.5});sxSmp(D,'brass',67,{v:.5,dur:.5});return true;
  case 'lose':[64,62,60,57].forEach((m,i)=>sxSmp(D,'strings',m,{t:i*.22,v:.45,dur:.3}));return true;
  case 'archivist':[83,79,75,71,67].forEach((m,i)=>sxSmp(D,'celesta',m,{t:i*.13,v:.5,dur:.4}));[59,63,66,71].forEach(m=>sxSmp(D,'choir',m,{t:.8,v:.45,dur:1.2}));sxTone(D,{t:.8,f:MIDI(47),dur:1.4,v:.14});au2Duck(.45,1.6);return true;
  }
  return false;}
const sfxClassic=sfx;
sfx=function(k){try{if(AU2.on&&sfx2(k))return;}catch(e){}if(!AU2.on)return sfxClassic.apply(this,arguments);};
// ---------- context hooks ----------
if(typeof onAction==='function'){const oa0=onAction;onAction=function(a,now){try{SFXC.wt=a&&a.side==='p'&&a.eq?(gearOf(a.eq.w)||{}).wt||null:null;SFXC.el=a&&(a.actEl||null);}catch(e){}return oa0.apply(this,arguments);};}
if(typeof onFx==='function'){const of0=onFx;onFx=function(u,txt,cls){try{if(u)SFXC.hitEl=u.fxEl||null;if(cls==='react'&&u)SFXC.react={a:u.reactEl,b:u.reactP};if(/resist|immune|block|guard|null/i.test(String(txt)))SFXC.block=1;
    if(txt==='Revived'){sfx('revive');SFXC.skipHeal=performance.now();}else if(/good/.test(cls||''))sfx('buff');else if(/bad/.test(cls||''))sfx('debuff');}catch(e){}
  return of0.apply(this,arguments);};}
if(typeof checkPhase==='function'){const cp0=checkPhase;checkPhase=function(e){const was=e&&e.phaseDone;const r=cp0.apply(this,arguments);try{if(e&&!was&&e.phaseDone)sfx('phase');}catch(x){}return r;};}
if(typeof summonComp==='function'){const sc0=summonComp;summonComp=function(){const n0=B&&B.summoned?Object.keys(B.summoned).length:0;const r=sc0.apply(this,arguments);try{if(B&&B.summoned&&Object.keys(B.summoned).length>n0)sfx('summon');}catch(e){}return r;};}
// companions leaving the field, and menus opening and closing, are checked as the screen renders
{let lastComp=0,lastModal=null;const ms0=musicSync;musicSync=function(){try{if(AU2.on){const nc=B&&B.front?B.front.filter(u=>u.isComp&&u.hp>0).length:0;if(nc<lastComp)sfx('unsummon');lastComp=nc;
    const mt=V.modal&&V.modal.type||null;if(mt!==lastModal){if(mt==='menu'&&!lastModal)sfx('open');else if(!mt&&lastModal==='menu')sfx('close');lastModal=mt;}}}catch(e){}return ms0.apply(this,arguments);};}
