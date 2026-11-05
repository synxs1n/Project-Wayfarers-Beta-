#!/bin/sh
# Beta v0.6.3 battle screen pass: the regression tests it must keep green, plus its own tests.
# Run from tools/chrome:  PWHTML=../../out/aurelis3.html sh v063suite.sh [test ...]
# OLDHTML (for v050p2daily) defaults to ../../out/old.html (a build of the commit before this pass).
cd "$(dirname "$0")"
: "${PWHTML:=../../out/aurelis3.html}"; export PWHTML
: "${OLDHTML:=../../out/old.html}"; export OLDHTML
T="$*"; [ -n "$T" ] || T="v053b v058a v059a v060a v061a v062a v050p2bg v050p1d v050p1g v051a v053ua v053ub wide v050p2b v050p2daily v063ba v063bb v063bc v063bd"
for t in $T; do
  if [ ! -f "$t.js" ]; then echo "SKIP $t (missing)"; continue; fi
  out=$(timeout 900 node "$t.js" 2>&1); rc=$?
  n=$(printf '%s\n' "$out" | grep -c '^FAIL ')
  if [ $rc -eq 0 ]; then echo "OK   $t"; else echo "BAD  $t (rc $rc, $n FAIL lines)"; printf '%s\n' "$out" | grep -E '^FAIL |PAGEERR' | head -8; fi
done
