# Rollback point before Beta v0.5.0

The last build before the v0.5.0 pass is Beta v0.4.6, commit `2c9f47f` on main (the docs commit `7d0f6f8` only added these notes).
To restore the source and notes: `git checkout 2c9f47f -- v3 docs GAME_VERSION`, then `sh build.sh`.
