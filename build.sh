#!/bin/sh
# Builds the game from v3/ and refreshes the files GitHub Pages serves.
set -e
mkdir -p out
V=$(head -1 RELEASE_VERSION | sed 's/^v//')
echo "const APP_VER=\"$V\";" > v3/appver.js
echo "{\"version\":\"$V\"}" > version.json
python3 v3build.py
cp out/aurelis3.html index.html
cp out/sw.js sw.js
