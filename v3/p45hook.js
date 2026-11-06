// ===== p45hook.js (v0.5.0): test handles for phases 4 and 5 (added to window.__A) =====
// Beta v0.5.0 phases 4 and 5: test handles, added to window.__A once the shell has made it (end of this script)
queueMicrotask(()=>{try{const A=window.__A;if(!A)return;const X={realmReached,pqShown,pqSheetLine,guildText,xpCatchMul,bossEnergyText,cfgVol,p5Vol,p5Saved,p5Place,p5Anchor,gameTitleVer,trUpdate,trPhW,trEase,trAmbDur,p5FlushNow,
  XPCU,TRANS,SAVE_UI,PERSONAL_BT,PERSONAL_REALM,GAME_TITLE,P5S,TR,
  personalEligible:c=>personalEligible(c),personalLockText:c=>personalLockText(c),vPersonal:()=>vPersonal(),mChar:(a,b)=>mChar(a,b),mGuild:m=>mGuild(m),mResult:i=>mResult(i),mMenu:m=>mMenu(m),
  settingsBody:()=>settingsBody(),vFactions:()=>vFactions(),vFbHelp:()=>vFbHelp(),fbContext:()=>fbContext(),vHeader:()=>vHeader(),svMark:s=>svMark(s),svFlush:m=>svFlush(m),svIcon:()=>svIcon(),
  worldDraw:n=>worldDraw(n),weatherFX:(a,b,c,d,e,f)=>weatherFX(a,b,c,d,e,f),tintFor:t=>tintFor(t),dayFxDraw:(a,b,c,d,e,f,g)=>dayFxDraw(a,b,c,d,e,f,g),phaseProg:()=>phaseProg(),ambSet:(a,b)=>ambSet(a,b),
  addXp:(c,x)=>addXp(c,x),finishBattle:h=>finishBattle(h),saveGame:()=>saveGame(),toast:m=>toast(m),win:()=>win(),clockPhase:t=>clockPhase(t)};
  Object.keys(X).forEach(k=>{try{if(Object.getOwnPropertyDescriptor(A,k)&&!Object.getOwnPropertyDescriptor(A,k).writable)return;A[k]=X[k];}catch(e){}});
  ['FAC','FACB','MENU_SUB','WEATHER','CLK_PH','CLK_LEN','SV','AU','AU2','MJINGLE','WS'].forEach(k=>{if(!(k in A))try{Object.defineProperty(A,k,{get:()=>({FAC,FACB,MENU_SUB,WEATHER,CLK_PH,CLK_LEN,SV,AU,AU2,MJINGLE,WS})[k],configurable:true});}catch(e){}});
}catch(e){}});
