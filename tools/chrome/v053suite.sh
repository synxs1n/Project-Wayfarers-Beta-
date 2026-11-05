#!/bin/sh
# Beta v0.5.3 UI: the regression tests the UI pass must keep green, plus the v053u checks. Run from tools/chrome.
# Usage: PWHTML=../../out/aurelis3.html sh v053suite.sh
cd "$(dirname "$0")"
: "${PWHTML:=../../out/aurelis3.html}";export PWHTML
fail=0
for t in v050p1d v050p1e v050p1g v050p5c v051a v051c wide v050p1b v050p3a v050p3b v050p4 v050p5 v043c v053ua v053ub; do
  [ -f $t.js ] || continue
  if node $t.js > /tmp/v053suite_$t.log 2>&1; then echo "ok   $t"; else echo "FAIL $t ($(grep -c '^FAIL' /tmp/v053suite_$t.log) fails, log /tmp/v053suite_$t.log)"; fail=1; fi
done
exit $fail
