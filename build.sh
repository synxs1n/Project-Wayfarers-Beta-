#!/bin/sh
# Builds the game from v3/ and refreshes the files GitHub Pages serves.
set -e
mkdir -p out
python3 v3build.py
cp out/aurelis3.html index.html
cp out/sw.js sw.js
