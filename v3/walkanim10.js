// ===== walkanim10.js: retired (kept as an empty module so v3build.py's MODS order stays the same) =====
// v0.15.8 post-processed the finished walker canvas (front/back: body sway and bob; v0.16.7: a one pixel bob on the side stride frame). The sway split the
// figure at the hip row and left a one pixel transparent line across the body, and the side bob lifted the whole figure, so the feet row moved. The walk now
// lives in the rig itself (art.js): rigSide / hLegsSide / hTorsoSide for the side view, rigFB / hLegsFront / hTorsoFront for front and back (robes swing
// the hem and show a lifted and a planted boot; every other body already strode with its legs and arms). No wrapper is installed here any more.
