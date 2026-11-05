#!/bin/sh
# Builds the game from v3/ and refreshes the files GitHub Pages serves.
set -e
mkdir -p out
V=$(head -1 GAME_VERSION)
echo "const APP_VER=\"$V\";" > v3/appver.js
# version.json (version and build ID) is written by v3build.py
python3 v3build.py
cp out/aurelis3.html index.html
cp out/sw.js sw.js
