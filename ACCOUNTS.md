# Accounts and cloud saves

The game already has cloud saves (per slot, last three versions kept, sync icon). `v3/cloud.js` connects them to Firebase (email and password sign in). It stays off until `FB_CFG` in `v3/fbconfig.js` is filled in.

## One-time setup (Firebase, free tier)
1. console.firebase.google.com > Add project. Skip Analytics.
2. Build > Authentication > Get started > turn on Email/Password.
3. Build > Firestore Database > Create database (production mode, any US region).
4. Firestore > Rules tab: paste the contents of `firestore.rules`, Publish.
5. Project settings (gear) > General > Your apps > Web (</>) > register app. Copy the `firebaseConfig` block.
6. Authentication > Settings > Authorized domains > add `synxs1n.github.io`.
7. Put the config in `v3/fbconfig.js` as `const FB_CFG={...};`, run `sh build.sh`, bump `RELEASE_VERSION`, push.

The config values are public by design. The rules are what keep each player's data private.
