# Debug: solver verification fails after generated formula

Date: 2026-05-02 Asia/Seoul

Symptom: User scanned all six faces, solver generated a long formula (reported 74 moves), but app showed: `솔버가 공식을 생성했지만 앱 검증에서 완성 상태가 되지 않았습니다` and `3D 큐브 시뮬레이터 검증을 통과하지 못했습니다`.

Code path: `src/core/solver.ts` calls external `rubiks-cube-solver`, normalizes the partitioned output, parses moves, then verifies with `applyMoves(stateString, moves)`.

Root cause found: `rubiks-cube-solver` can return lowercase wide moves such as `b`, `bprime`, `dprime`, `d` in OLL/PLL. `normalizeSolverOutput` currently replaces `prime` with `'` but then filters with `/^[URFDLB][2']?$/`, so lowercase wide moves are silently dropped. `parseMove` also only accepts uppercase single-layer moves via `/^([URFDLB])([2']?)$/`. The formula therefore becomes incomplete before verification, causing `applyMoves` to fail even when the solver produced a valid solution.

Reproduction signal: Running the package README example state through `rubiks-cube-solver` returns OLL/PLL tokens containing `b`, `bprime`, `dprime`, `d`. Current app normalization would discard those tokens.

Proposed minimal fix:
1. Extend move model/parser to support lowercase wide moves `u r f d l b`.
2. Update state simulator to rotate both the outer layer and middle layer for wide moves, matching the library behavior.
3. Update 3D animation layer selection to animate both layers for wide moves.
4. Allow lowercase tokens in solver normalization instead of dropping them.
5. Add regression test using the package README example, asserting `solveCubeState` returns `solution` and `applyMoves` reaches solved state.

Related similar pattern: learning data contains `M2` in H Perm, and `parsePlayableMoves` currently ignores unsupported notation. This is separate from the immediate solver failure but should be addressed when expanding notation coverage.