# Debug: solver cannot find solution for accurately scanned state

Date: 2026-05-02 Asia/Seoul

User-provided app state string: `RFLFUDUDFUBDRRLRLFLRRLFUDUBFBURDUBDUBLBRLDDFRFUDBBBLFL`.

Observed validation: length 54, each symbol U/R/F/D/L/B appears exactly 9 times, centers are U/R/F/D/L/B in app order. The external `rubiks-cube-solver` returns a partitioned solution, so the scanned state is not rejected by the library.

Root cause: the returned PLL contains slice notation: `M2 D M2 D2 M2 D M2 Dprime`. The app's solver normalization and move parser only supported face moves plus lowercase wide moves (`URFDLBurfdlb`), so `M2` tokens were dropped before simulation. The remaining partial algorithm could not solve the cube, causing fallback even though the solver found a real solution.

Fix applied: add `SliceMoveFace` support for `M/E/S`, preserve those tokens in solver normalization, simulate slice moves on the middle layer with standard turn signs, and animate the same middle layer in the 3D cube viewer.

Regression tests:
- `tests/moves.test.ts`: parses and applies `M/E/S` slice moves.
- `tests/solver.test.ts`: the user-provided scanned state now returns `solution` and `applyMoves` reaches `SOLVED_STATE_STRING`.
- `tests/cube-visualization.test.ts`: slice moves map to the middle 3D layer.

Similar pattern scan: `src/data/algorithms.json` contains H Perm with `M2`; the parser expansion now lets learning playback parse that notation instead of skipping it.

Validation: targeted Vitest files passed; `npm run validate:all` passed with 17 files and 66 tests.