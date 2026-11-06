const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const LIVE = 'https://synxs1n.github.io/Project-Wayfarers-Beta-/';
// Chrome-like user agent: Google refuses sign in from anything that says "Electron".
const UA = app.userAgentFallback.replace(/\s*Electron\/\S+/i, '').replace(/\s*wayfarers\/\S+/i, '').replace(/\s*Wayfarers\/\S+/i, '');
function local(w) { w.loadFile(path.join(__dirname, '..', 'index.html')); }
function create() {
  const w = new BrowserWindow({
    width: 1280, height: 800, minWidth: 640, minHeight: 480,
    backgroundColor: '#150b17', autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'icons', 'icon-512.png'),
    webPreferences: { contextIsolation: true, sandbox: true, autoplayPolicy: 'no-user-gesture-required' }
  });
  w.setMenuBarVisibility(false);
  w.webContents.setUserAgent(UA);
  // Google / Firebase sign in opens a popup. Let those open in-app, send everything else to the browser.
  w.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\/(accounts\.google\.com|[a-z0-9-]+\.firebaseapp\.com|synxs1n\.github\.io)\//.test(url)) {
      return { action: 'allow', overrideBrowserWindowOptions: { width: 520, height: 700, autoHideMenuBar: true, parent: w } };
    }
    shell.openExternal(url); return { action: 'deny' };
  });
  w.webContents.on('did-create-window', (c) => c.webContents.setUserAgent(UA));
  // Live site first, so updates arrive on their own. Fall back to the bundled copy when offline.
  let fell = false;
  w.webContents.on('did-fail-load', (e, code, d, url, main) => { if (main && !fell && url.startsWith(LIVE)) { fell = true; local(w); } });
  // v0.8.5: before the window closes, let the game save and upload the journey (window.svBeforeClose, at most 4 s).
  let closing = false;
  w.on('close', (e) => {
    if (closing) return;
    e.preventDefault(); closing = true;
    const ask = w.webContents.executeJavaScript('typeof window.svBeforeClose==="function"?window.svBeforeClose().then(()=>1,()=>0):0', true).catch(() => 0);
    Promise.race([ask, new Promise((r) => setTimeout(r, 4000))]).then(() => { if (!w.isDestroyed()) w.destroy(); });
  });
  w.loadURL(LIVE, { userAgent: UA });
}
app.whenReady().then(() => { create(); app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) create(); }); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
