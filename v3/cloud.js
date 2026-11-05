// =================== ACCOUNTS OUTSIDE CLAUDE.AI (Firebase) ===================
// The cloud save system (saves.js, account.js) talks to window.claude.use('db'|'user'). On claude.ai that is provided by the host.
// Everywhere else (GitHub Pages, the Android app, the Windows app) this file provides the same two capabilities from Firebase
// Auth (email and password) and Firestore. With FB_CFG null nothing here runs and the game stays local only.
(function(){
if(typeof window.claude!=='undefined'||!FB_CFG)return;
const VER='10.12.2',BASE='https://www.gstatic.com/firebasejs/'+VER+'/';
let FB=null,auth=null,fs=null,ready=null,cur=null,authKnown=false;
const loadJs=u=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=u;s.onload=res;s.onerror=()=>rej(new Error('load '+u));document.head.appendChild(s);});
function boot(){
  if(ready)return ready;
  ready=(async()=>{
    if(navigator.onLine===false)return null;
    try{
      await loadJs(BASE+'firebase-app-compat.js');await Promise.all([loadJs(BASE+'firebase-auth-compat.js'),loadJs(BASE+'firebase-firestore-compat.js')]);
      FB=window.firebase;FB.initializeApp(FB_CFG);auth=FB.auth();fs=FB.firestore();
      try{await auth.setPersistence(FB.auth.Auth.Persistence.LOCAL);}catch(e){try{await auth.setPersistence(FB.auth.Auth.Persistence.SESSION);}catch(e2){try{await auth.setPersistence(FB.auth.Auth.Persistence.NONE);}catch(e3){}}}
      await new Promise(r=>{const off=auth.onAuthStateChanged(u=>{cur=u;authKnown=true;off();r();});setTimeout(r,6000);});
      auth.onAuthStateChanged(u=>{const was=cur&&cur.uid;cur=u;if((u&&u.uid)!==was)afterAuth();else uiRefresh();});
      return FB;
    }catch(e){ready=null;return null;}
  })();
  return ready;
}
// ----- db wrapper: the small subset of the claude.ai db API the game uses -----
function wrapSnap(s){return {exists:s.exists,id:s.id,data:()=>s.data()};}
function docRef(path){const r=fs.doc(path);return {get:async()=>wrapSnap(await r.get()),set:(d)=>r.set(d),update:(d)=>r.update(d),delete:()=>r.delete()};}
function colRef(path,q){const c=q||fs.collection(path);return {
  get:async()=>{const s=await c.get();return {docs:s.docs.map(wrapSnap),size:s.size};},
  orderBy:(f,d)=>colRef(path,c.orderBy(f,d)),limit:n=>colRef(path,c.limit(n))};}
const DB={doc:docRef,collection:colRef};
const USER={id:async()=>cur?cur.uid:null,can:async()=>!!cur,me:async()=>({id:cur.uid,name:cur.displayName||(cur.email||'').split('@')[0],isOwner:false}),profiles:async()=>({})};
window.claude={use:async name=>{
  if(name!=='db'&&name!=='user')return null;
  const f=await boot();if(!f||!authKnown)return null;
  if(!cur)return name==='user'?USER:null;
  return name==='db'?DB:USER;
}};
// ----- react to sign in and out -----
function afterAuth(){
  try{SV.db=null;SV.uid=null;SV.status=cur?'syncing':'local';PROFILE.status='idle';}catch(e){}
  try{svIcon();}catch(e){}
  try{if(cur){svInit();profileSync();}else{svRefreshTitle();}}catch(e){}
  uiRefresh();
}
// ----- sign in panel -----
const MSG={'auth/invalid-credential':'That email and password do not match.','auth/wrong-password':'That email and password do not match.','auth/user-not-found':'That email and password do not match.','auth/email-already-in-use':'An account with that email already exists. Try signing in.','auth/weak-password':'Use a password with at least 6 characters.','auth/invalid-email':'That email address does not look right.','auth/network-request-failed':'No connection. Try again when you are online.','auth/popup-closed-by-user':'Google sign in was closed before it finished.','auth/cancelled-popup-request':'Google sign in was cancelled.','auth/popup-blocked':'Your browser blocked the Google window. Allow popups for this site and try again.','auth/operation-not-supported-in-this-environment':'Google sign in does not work in this app. Use email and password.','auth/unauthorized-domain':'Google sign in is not set up for this address.','auth/account-exists-with-different-credential':'That email already has an account with a different sign in method.','auth/too-many-requests':'Too many tries. Wait a minute and try again.'};
// web uses a popup; the Android app uses the native Google plugin; hidden in the Windows app (file://)
const NATIVE=!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()&&window.Capacitor.Plugins&&window.Capacitor.Plugins.FirebaseAuthentication);
const GOOGLE_OK=NATIVE||(/^https?:$/.test(location.protocol)&&!window.Capacitor&&!/Electron/i.test(navigator.userAgent));
let panel=null;
function css(){if(document.getElementById('fbcss'))return;const s=document.createElement('style');s.id='fbcss';s.textContent='#fbpanel{position:fixed;inset:0;z-index:300;background:rgba(8,4,14,.78);display:flex;align-items:center;justify-content:center;padding:16px}#fbpanel .box{width:min(380px,100%);background:#1c1230;border:3px solid var(--gold,#f0b54a);padding:16px;color:var(--text,#f8edd2);box-shadow:0 0 0 3px #000}#fbpanel h3{margin:0 0 8px}#fbpanel input{width:100%;box-sizing:border-box;margin:4px 0 8px;padding:9px;font:inherit;background:#0e0818;color:inherit;border:2px solid #6a4a22}#fbpanel .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}#fbpanel small{display:block;margin-top:8px;color:var(--mute,#d8c8a2)}#fbpanel .err{color:#ffb070;min-height:1.2em}#fbpanel .ok{color:#a8ffb8}';document.head.appendChild(s);}
function close(){if(panel){panel.remove();panel=null;}}
function setMsg(t,ok){const m=panel&&panel.querySelector('.msg');if(m){m.textContent=t||'';m.className='msg '+(ok?'ok':'err');}}
async function act(kind){
  const em=kind==='g'?'':panel.querySelector('#fbem').value.trim(),pw=kind==='g'?'':panel.querySelector('#fbpw').value;
  try{
    setMsg('Working...',true);
    if(kind==='in')await auth.signInWithEmailAndPassword(em,pw);
    else if(kind==='g'&&NATIVE){const P=window.Capacitor.Plugins.FirebaseAuthentication;const r=await P.signInWithGoogle();const tok=r&&r.credential&&r.credential.idToken;if(!tok)throw {code:'auth/popup-closed-by-user'};await auth.signInWithCredential(FB.auth.GoogleAuthProvider.credential(tok));}
    else if(kind==='g'){const pr=new FB.auth.GoogleAuthProvider();pr.setCustomParameters({prompt:'select_account'});await auth.signInWithPopup(pr);}
    else if(kind==='up')await auth.createUserWithEmailAndPassword(em,pw);
    else if(kind==='reset'){if(!em){setMsg('Type your email first.');return;}await auth.sendPasswordResetEmail(em);setMsg('Reset email sent. Check your inbox.',true);return;}
    close();try{toast('Signed in. Your saves now sync to your account.');}catch(e){}
  }catch(e){setMsg(MSG[e&&e.code]||('Could not sign in ('+((e&&e.code)||'error')+').'));}
}
async function open(){
  css();close();
  panel=document.createElement('div');panel.id='fbpanel';
  const f=await boot();
  const box=document.createElement('div');box.className='box';panel.appendChild(box);
  if(!f){box.innerHTML='<h3>Account</h3><p>Accounts need an internet connection. Your saves still work on this device.</p><div class="row"><button class="btn" id="fbx">Close</button></div>';}
  else if(cur){box.innerHTML='<h3>Account</h3><p>Signed in as <b></b>.<br>Your saves sync to this account, so you can pick up on any device.</p><div class="row"><button class="btn" id="fbso">Sign out</button><button class="btn" id="fbx">Close</button></div><small>Signing out keeps the saves on this device.</small>';box.querySelector('b').textContent=cur.email||'';}
  else{box.innerHTML='<h3>Account</h3><p>Sign in so your saves follow you to every device.</p>'+(GOOGLE_OK?'<div class="row"><button class="btn gold" id="fbg">Continue with Google</button></div><small>or use email</small>':'')+'<label>Email<input id="fbem" type="email" autocomplete="email"></label><label>Password<input id="fbpw" type="password" autocomplete="current-password"></label><div class="msg err"></div><div class="row"><button class="btn gold" id="fbin">Sign in</button><button class="btn" id="fbup">Create account</button><button class="btn sm" id="fbrs">Forgot password</button><button class="btn sm" id="fbx">Close</button></div><small>You can play without an account. Saves then stay on this device only.</small>';}
  document.body.appendChild(panel);
  const on=(id,fn)=>{const b=panel.querySelector('#'+id);if(b)b.onclick=fn;};
  on('fbx',close);on('fbg',()=>act('g'));on('fbin',()=>act('in'));on('fbup',()=>act('up'));on('fbrs',()=>act('reset'));on('fbso',async()=>{await auth.signOut();close();});
  panel.addEventListener('click',e=>{if(e.target===panel)close();});
  const pw=panel.querySelector('#fbpw');if(pw)pw.addEventListener('keydown',e=>{if(e.key==='Enter')act('in');});
}
window.fbAccountUI=open;
// ----- entry points in the existing UI -----
function btn(){return `<p class="note"><button class="btn sm" onclick="window.fbAccountUI()">${cur?'Account: '+esc((cur.email||'').slice(0,28)):'Sign in or create account'}</button></p>`;}
function uiRefresh(){try{svRefreshTitle();}catch(e){}}
try{const t0=svTitleNote;svTitleNote=function(){return t0.apply(this,arguments)+btn();};
    const j0=svJourneyRow;svJourneyRow=function(){return j0.apply(this,arguments)+btn();};}catch(e){}
setTimeout(boot,300);
})();
