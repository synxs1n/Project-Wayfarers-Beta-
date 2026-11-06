# Cleanup baseline (Chrome tests)

Every `tools/chrome/*.js` test that can run here, on the untouched v0.8.0 build (commit 724f8ac) and after the cleanup pass.
Skipped: the ones `docs/v050-checklist.md` lists under "Tests that cannot run here" (gear, saveformats, world6, v040p2, v50, p3, p4,
p5, prog, lever, v030, v043), the other puppeteer/@sparticuz tests (arch, beta, fb, leg, p1, p2, v020), the screenshot, sheet and
perf scripts (`*shots*`, `*sheet*`, `*perf*`), `v053dbg.js` (not a test) and the helpers `pw.js`, `v063lib.js`.
Each run used a copy of the repository (so the static checks read the same sources) and OLDHTML = `git show 724f8ac:index.html`.

Columns: baseline (untouched build), after the dead code step, after the whole pass. A test listed with a note flipped in at least one
run; every flip was rerun on both builds and traced to timing, load or randomness, not to the cleanup.

| test | baseline | after dead code | after all steps | note |
|---|---|---|---|---|
| audio | PASS | PASS | FAIL | peak level of generated music varies per run (cal2 -0.99 dBFS once; -1.34/-1.35 on two reruns of the cleaned build) |
| audioplay | FAIL | PASS | PASS | frame time check (p95 < 34 ms): load dependent |
| collide | PASS | PASS | PASS |  |
| eq | PASS | PASS | PASS |  |
| eq2 | PASS | PASS | PASS |  |
| liveboot-v046 | FAIL | FAIL | FAIL | needs a browser window (ReferenceError: window is not defined): not runnable under node here |
| liveupdate | PASS | PASS | PASS |  |
| nature | PASS | PASS | PASS |  |
| offline | PASS | PASS | PASS |  |
| oldsave | PASS | PASS | PASS |  |
| p4b | FAIL | FAIL | FAIL | xp rows on the party menu and result screen changed in later versions |
| p5b | PASS | PASS | PASS |  |
| roof | PASS | PASS | PASS |  |
| sanct | PASS | PASS | PASS |  |
| savesys | PASS | PASS | PASS |  |
| smithy | PASS | PASS | PASS |  |
| smithy2 | PASS | PASS | PASS |  |
| smithy3 | PASS | PASS | PASS |  |
| smithyfuzz | PASS | PASS | PASS |  |
| smithywalk | PASS | PASS | PASS |  |
| sw | FAIL | FAIL | FAIL | reads tools/out/aurelis3.html, which the build does not write |
| tavern | PASS | PASS | PASS |  |
| ucards | PASS | PASS | PASS |  |
| v040fs | PASS | PASS | PASS |  |
| v040p1 | FAIL (rerun FAIL) | FAIL | FAIL | pip row visibility check fails on the untouched build too |
| v040p3 | FAIL | FAIL | FAIL | Guides list now has "How it works" (test predates v0.7.0) |
| v040p5 | PASS | PASS | PASS |  |
| v040p5b | PASS | PASS | PASS |  |
| v040p6 | PASS | PASS | PASS |  |
| v040p789 | PASS | PASS | PASS |  |
| v041old | PASS | PASS | PASS |  |
| v041p1a | PASS | PASS | PASS |  |
| v041p1b | PASS (rerun PASS) | PASS | FAIL (rerun PASS) | random battle length (moved>5): passed on rerun of the cleaned build |
| v041p1c | PASS | PASS | PASS |  |
| v041p1d | PASS | PASS | PASS |  |
| v041p1e | FAIL | FAIL | FAIL | sign examination check, fails on the untouched build |
| v041p1f | PASS | PASS | PASS |  |
| v041p1g | FAIL | FAIL | FAIL | backdrop theme check, fails on the untouched build |
| v041p1h | PASS | PASS | PASS |  |
| v041p1i | PASS | PASS | PASS |  |
| v041p1j | PASS | PASS | PASS | input timing |
| v041p1k | PASS | PASS | PASS |  |
| v041p2 | PASS | PASS | PASS |  |
| v041p26 | PASS | PASS | PASS |  |
| v041p4 | PASS | PASS | PASS |  |
| v041p44 | PASS | PASS | PASS |  |
| v041p46 | FAIL (rerun PASS) | PASS | PASS | roamer battle check: random (passes on rerun of the untouched build) |
| v041p47 | PASS | PASS | PASS |  |
| v041p5 | FAIL | FAIL | FAIL | duel intro text changed in v0.7.7 (duellines.js) |
| v041p53 | PASS | PASS | PASS |  |
| v041p54 | FAIL | FAIL | FAIL | title lineup checks, fail on the untouched build |
| v041p6 | PASS | PASS | PASS |  |
| v041p64 | PASS | PASS | PASS |  |
| v041p65 | PASS | PASS | PASS |  |
| v041p67 | PASS | PASS | PASS |  |
| v041p6b | FAIL | FAIL | FAIL | personal quest unlock rules changed in v0.5.0/v0.7.2 |
| v043b | PASS | PASS | PASS |  |
| v043c | PASS | PASS | PASS |  |
| v050p1a | PASS | PASS | PASS |  |
| v050p1b | PASS | PASS | PASS |  |
| v050p1c | PASS (rerun FAIL) | FAIL | PASS | map scan depends on Date.now (new journey realm draw): fails on reruns of the untouched build too; with Date.now frozen both builds give identical results |
| v050p1d | PASS | PASS | PASS |  |
| v050p1e | PASS | PASS | PASS |  |
| v050p1f | PASS | PASS | PASS |  |
| v050p1g | PASS | PASS | PASS |  |
| v050p1h | PASS | PASS | PASS |  |
| v050p2b | PASS | PASS | PASS |  |
| v050p2bg | PASS | PASS | PASS |  |
| v050p2daily | PASS | PASS | PASS |  |
| v050p2world | PASS | PASS | PASS |  |
| v050p3a | PASS | PASS | PASS |  |
| v050p3b | PASS | PASS | PASS |  |
| v050p4 | PASS | PASS | PASS |  |
| v050p4b | PASS | PASS | PASS |  |
| v050p5 | FAIL | FAIL | FAIL | title and brand text checks, fail on the untouched build |
| v050p5b | FAIL | FAIL | FAIL | save message overlap checks, fail on the untouched build |
| v050p5c | PASS (rerun FAIL) | FAIL | PASS | weather fade timing: fails on a rerun of the untouched build too |
| v050p6a | PASS (rerun FAIL) | PASS | FAIL (rerun PASS) | Auto graphics steps down under load: fails on a rerun of the untouched build too; passes on rerun of the cleaned build |
| v050p6suite | PASS | PASS | PASS |  |
| v051a | PASS | PASS | PASS |  |
| v051b | PASS | PASS | PASS |  |
| v051c | PASS | PASS | PASS |  |
| v053a | PASS | PASS | PASS |  |
| v053b | PASS | PASS | PASS |  |
| v053s | FAIL | FAIL | FAIL | title lineup squash check, fails on the untouched build |
| v053ua | PASS | PASS | PASS |  |
| v053ub | PASS | PASS | PASS |  |
| v056a | PASS | PASS | PASS |  |
| v058a | PASS | PASS | PASS |  |
| v059a | PASS | PASS | PASS |  |
| v060a | PASS | PASS | PASS |  |
| v061a | PASS | PASS | PASS |  |
| v062a | PASS | PASS | PASS |  |
| v063ba | PASS | PASS | PASS |  |
| v063bb | PASS | PASS | PASS |  |
| v063bc | PASS | PASS | PASS |  |
| v063bd | PASS | PASS | PASS |  |
| v063g | PASS | PASS | PASS |  |
| v063m1 | PASS | PASS | PASS |  |
| v063m2 | PASS | PASS | PASS |  |
| v063pa | PASS | PASS | PASS |  |
| v063pb | PASS | PASS | PASS |  |
| v063s | PASS | PASS | PASS |  |
| v063wa | PASS | PASS | PASS |  |
| v063wb | PASS | PASS | PASS |  |
| v063wo | PASS (rerun PASS) | PASS | FAIL (rerun FAIL) | picks a chest on a journey drawn from Date.now and counts random particles: the two failing runs failed different checks (chest ground once, ambience rects once); 11 further runs of the cleaned build passed |
| v070ia | PASS | PASS | PASS |  |
| v070ib | PASS | PASS | PASS |  |
| v070ic | PASS (rerun PASS) | PASS | FAIL (rerun PASS) | timed guard ring timing: passes on rerun |
| v070m1 | PASS | PASS | PASS |  |
| v070m2 | PASS | PASS | PASS |  |
| v070oa | PASS | PASS | PASS |  |
| v070ob | PASS | PASS | PASS |  |
| v071a | PASS | PASS | PASS |  |
| v071t | FAIL (rerun PASS) | PASS | PASS | checks .github/workflows/release.yml: FAIL in the first baseline run only because the scratch copy lacked .github; PASS on rerun with it |
| v071wa | PASS | PASS | PASS |  |
| v071wb | PASS | PASS | PASS |  |
| v071wt | PASS (rerun PASS) | PASS | FAIL (rerun PASS) | HD-2D tap to walk timing: passes on rerun |
| v072a | PASS | PASS | PASS |  |
| v075a | PASS | PASS | PASS |  |
| v076b | PASS | PASS | PASS |  |
| v077a | PASS | PASS | PASS |  |
| v077d | PASS | PASS | PASS |  |
| v077wa | PASS | PASS | PASS |  |
| v077wb | PASS | PASS | PASS |  |
| wide | PASS | PASS | PASS |  |

Baseline: 110 PASS, 16 FAIL of 126. Determinism: `v050p2daily.js` (old vs new Daily Trial) and `v063wa.js` PASS after every step;
`SEED=4242 node tools/fullsim.js stage1 60`, `SEED=77 ... xp 10` and `SEED=77 ... journey 1` print the same results on the untouched
and the cleaned build (note: in this build every fullsim battle stops after its first turn, "stuck", on both builds; a harness issue that
predates this pass). The v050p1c map scan with Date.now frozen is identical on both builds (2,505 maps).
