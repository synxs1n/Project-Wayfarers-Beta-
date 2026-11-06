// ===== ambience.js (v0.4.5): ambience beds and window.__AU =====
// A quiet bed under the music, built in code: wind, birds, crickets and the odd owl, waves, drips and rumble underground,
// a town murmur, rain and thunder, cold wind, embers in the Ashen Expanse and a hum in Calamity realms. Settings > Ambience sets the level.
const AMB={L:{},t:0,ctxKey:null,crowd:.5};
function ambBed(name){const g=AU2.g;if(!g)return null;if(AMB.L[name])return AMB.L[name];const c=g.ctx,out=c.createGain();out.gain.value=0;out.connect(g.bus.amb);
  const nz=()=>{const s=c.createBufferSource();s.buffer=au2Noise(c);s.loop=true;s.start(c.currentTime,Math.random()*1.5);return s;};
  const filt=(type,f,q)=>{const x=c.createBiquadFilter();x.type=type;x.frequency.value=f;x.Q.value=q||.7;return x;};
  const lfo=(rate,depth,param,base)=>{const o=c.createOscillator(),k=c.createGain();o.frequency.value=rate;k.gain.value=depth;o.connect(k);k.connect(param);if(base!=null)param.value=base;o.start();return o;};
  const L={out,nodes:[]};const chain=(...n)=>{for(let i=0;i<n.length-1;i++)n[i].connect(n[i+1]);n[n.length-1].connect(out);L.nodes.push(...n);};
  switch(name){
  case 'wind':{const s=nz(),b=filt('bandpass',500,.6),l=filt('lowpass',1500),a=c.createGain();a.gain.value=.6;chain(s,b,l,a);L.nodes.push(lfo(.07,250,b.frequency),lfo(.11,.35,a.gain));break;}
  case 'cold':{const s=nz(),b=filt('bandpass',1500,4),a=c.createGain();a.gain.value=.5;chain(s,b,a);L.nodes.push(lfo(.09,500,b.frequency),lfo(.13,.3,a.gain));break;}
  case 'waves':{const s=nz(),l=filt('lowpass',650),a=c.createGain();a.gain.value=.55;chain(s,l,a);L.nodes.push(lfo(.11,.45,a.gain),lfo(.11,250,l.frequency));break;}
  case 'rumble':{const s=nz(),l=filt('lowpass',110,1.2),a=c.createGain();a.gain.value=1.4;chain(s,l,a);L.nodes.push(lfo(.05,.4,a.gain));break;}
  case 'rain':{const s=nz(),h=filt('highpass',1400),l=filt('lowpass',7000),a=c.createGain();a.gain.value=.45;chain(s,h,l,a);break;}
  case 'crowd':{const s=nz(),b=filt('bandpass',650,1.4),b2=filt('peaking',1200,2),a=c.createGain();a.gain.value=.4;chain(s,b,b2,a);L.mod=a.gain;break;}
  case 'hum':{[55,82.6,110.3].forEach((f,i)=>{const o=c.createOscillator(),k=c.createGain();o.frequency.value=f;o.detune.value=i*7;k.gain.value=.12/(i+1);o.connect(k);k.connect(out);o.start();L.nodes.push(o,k);});
    const s=nz(),b=filt('bandpass',300,3),a=c.createGain();a.gain.value=.25;chain(s,b,a);L.nodes.push(lfo(.04,.15,a.gain));break;}
  case 'embers':{const s=nz(),l=filt('lowpass',300),a=c.createGain();a.gain.value=.35;chain(s,l,a);break;}
  }
  return AMB.L[name]=L;}
function ambSet(name,v){const L=ambBed(name);if(!L)return;const c=AU2.g.ctx,p=L.out.gain;p.cancelScheduledValues(c.currentTime);p.setValueAtTime(p.value,c.currentTime);p.linearRampToValueAtTime(v,c.currentTime+2.5);}
// one-shot sounds
function ambChirp(d,t){const c=AU2.g.ctx,n=2+Math.floor(Math.random()*3),f=2600+Math.random()*1800;for(let i=0;i<n;i++){const o=c.createOscillator(),g=c.createGain(),tt=t+i*(.09+Math.random()*.05);
  o.frequency.setValueAtTime(f,tt);o.frequency.exponentialRampToValueAtTime(f*(1.3+Math.random()*.3),tt+.06);g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.05,tt+.01);g.gain.setTargetAtTime(0,tt+.03,.02);o.connect(g);g.connect(d);o.start(tt);o.stop(tt+.15);}}
function ambCricket(d,t){const c=AU2.g.ctx;for(let i=0;i<3;i++){const o=c.createOscillator(),g=c.createGain(),tt=t+i*.055;o.frequency.value=4300+Math.random()*200;g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.025,tt+.008);g.gain.setTargetAtTime(0,tt+.025,.01);o.connect(g);g.connect(d);o.start(tt);o.stop(tt+.08);}}
function ambOwl(d,t){const c=AU2.g.ctx;[0,.5,.75].forEach((dt,i)=>{const o=c.createOscillator(),g=c.createGain(),tt=t+dt,f=i?370:390;o.frequency.setValueAtTime(f,tt);o.frequency.linearRampToValueAtTime(f*.9,tt+.3);
  g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.06,tt+.05);g.gain.setTargetAtTime(0,tt+.2,.05);o.connect(g);g.connect(d);o.start(tt);o.stop(tt+.5);});}
function ambThunder(d,t){const c=AU2.g.ctx;au2Hit(c,d,'crash',t,.25);const s=c.createBufferSource(),l=c.createBiquadFilter(),g=c.createGain();s.buffer=au2Noise(c);s.loop=true;l.type='lowpass';l.frequency.value=180;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.9,t+.15);g.gain.setTargetAtTime(0,t+.4,.9);s.connect(l);l.connect(g);g.connect(d);s.start(t);s.stop(t+4.5);}
function ambCrackle(d,t){const c=AU2.g.ctx;for(let i=0;i<4;i++){const s=c.createBufferSource(),h=c.createBiquadFilter(),g=c.createGain(),tt=t+Math.random()*.3;s.buffer=au2Noise(c);h.type='highpass';h.frequency.value=2000+Math.random()*3000;
  g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.06+Math.random()*.06,tt+.002);g.gain.setTargetAtTime(0,tt+.003,.006);s.connect(h);h.connect(g);g.connect(d);s.start(tt,Math.random());s.stop(tt+.05);}}
// what this place should sound like: bed levels and event rates (per second)
function ambWant(){const o={beds:{},ev:{}};if(!AU2.on||(META.cfg.amb??.3)<=0)return o;if(V.screen!=='world'&&V.screen!=='battle')return o;const m=WS.m;if(!m||(G&&G.daily&&V.screen==='battle'))return o;
  const b=o.beds,e=o.ev,night=au2Night(),wx=G&&G.weather&&m.kind!=='dungeon'&&!m.cave?G.weather[m.s]:null;let R=null;try{R=au2Realm(m.s);}catch(x){}
  if(m.archive){b.hum=.35;b.rumble=.2;}
  else if(m.kind==='dungeon'||m.cave){b.rumble=.6;e.drip=m.cave?.5:.3;if(au2IsCalRealm(m.s))b.hum=.4;}
  else{const th=m.theme||'meadow';b.wind=m.kind==='town'?.2:th==='heights'?.8:.45;
    if(m.kind==='town')b.crowd=night?.12:.45;
    if(th==='coast')b.waves=m.kind==='town'?.4:.7;if(th==='snow'){b.cold=.55;b.wind=.25;}if(th==='void')b.hum=.4;
    if(th!=='snow'&&th!=='void'){if(night){e.cricket=.9;e.owl=.025;}else e.bird=th==='cave'?.08:.25;}
    if(au2IsCalRealm(m.s)){b.hum=.5;e.bird=0;}
    if(R&&(R.key==='ashen'||(R.lean&&/ash|embers/.test(R.lean.amb||'')))){b.embers=.4;e.ember=.6;e.bird=0;}}
  if(wx==='rain'||wx==='storm'){b.rain=wx==='storm'?.85:.55;e.bird=0;if(wx==='storm')e.thunder=.06;}
  if(wx==='snow'||wx==='blizzard'){b.cold=wx==='blizzard'?.9:.5;e.bird=0;}if(wx==='gale')b.wind=1;if(wx==='sand')b.wind=.8;if(wx==='ashfall'||wx==='heat'){b.embers=.35;e.ember=(e.ember||0)+.3;}
  if(V.screen==='battle'){Object.keys(b).forEach(k=>b[k]*=.5);Object.keys(e).forEach(k=>e[k]*=.4);}
  if(V.modal&&V.modal.type==='menu'&&V.modal.tab==='music'){Object.keys(b).forEach(k=>b[k]=0);o.ev={};}
  return o;}
function ambTick(){const now=performance.now();if(now-AMB.t<200)return;const dt=(now-AMB.t)/1000;AMB.t=now;if(!AU2.on||!AU2.g||AU2.g.ctx.state!=='running')return;
  let W;try{W=ambWant();}catch(e){return;}const key=JSON.stringify(W.beds);
  if(key!==AMB.ctxKey){AMB.ctxKey=key;['wind','cold','waves','rumble','rain','crowd','hum','embers'].forEach(n=>{const v=W.beds[n]||0;if(v>0||AMB.L[n])ambSet(n,v);});}
  const L=AMB.L.crowd;if(L&&L.mod){AMB.crowd=Math.max(.15,Math.min(.8,AMB.crowd+(Math.random()-.5)*.25));L.mod.setTargetAtTime(AMB.crowd,AU2.g.ctx.currentTime,.4);}
  const d=AU2.g.bus.amb,t=AU2.g.ctx.currentTime+.02,E=W.ev,roll=r=>r&&Math.random()<r*dt;
  if(roll(E.bird))ambChirp(d,t);if(roll(E.cricket))ambCricket(d,t);if(roll(E.owl))ambOwl(d,t);if(roll(E.drip))au2Hit(AU2.g.ctx,d,'drip',t,.6);if(roll(E.thunder))ambThunder(d,t);if(roll(E.ember))ambCrackle(d,t);}
function ambStop(){Object.keys(AMB.L).forEach(n=>{try{ambSet(n,0);}catch(e){}});AMB.ctxKey=null;}
// handles for the Chrome audio test (tools/chrome/audio.js); the game itself never reads this
window.__AU={get AU(){return AU;},get AU2(){return AU2;},get SFXC(){return SFXC;},get AMB(){return AMB;},get V(){return V;},audioInit:()=>audioInit(),au2Render:(a,b,c)=>au2Render(a,b,c),musicTrack:(a,b)=>musicTrack(a,b),
  au2Jingle:a=>au2Jingle(a),au2SetStyle:a=>au2SetStyle(a),au2Want:()=>au2Want(),sfx:k=>sfx(k),render:()=>render()};
