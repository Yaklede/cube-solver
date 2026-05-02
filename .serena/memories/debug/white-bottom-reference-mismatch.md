# Debug: white-bottom solver reference displayed as white-top

Date: 2026-05-02 Asia/Seoul

Symptom: User selected/generated a solve with the white face as the bottom reference, but the displayed solution still used the white-top reference.

Root cause: `orientationMode` in `SolverWorkspace` only changed the grip guide text. The solver result moves and 3D visual state were still rendered directly in the solver's internal coordinate frame where `U`/white is up. The white-bottom guide also listed `R`/red as the right side while keeping `F`/green in front; that is not a valid physical cube orientation. With white down and green front, `L`/orange is on the right.

Fix applied: `orientation-guide.ts` now has a white-bottom presentation transform. It rotates visual state by 180 degrees around the front/back axis, maps displayed moves into that frame (`U<->D`, `R<->L`, wide moves likewise, `M/E` direction inverted), and keeps 3D state application in sync with displayed moves. `SolverWorkspace` now renders `displayedMoves` and an oriented visual state instead of showing the raw internal solver moves for white-bottom mode.

Regression tests: `tests/orientation-guide.test.ts` now verifies the corrected white-bottom grip (`white bottom / green front / orange right`), oriented solved centers, displayed move mapping, and state/move transform equivalence.

Validation: targeted orientation/solver/move/visualization tests passed; `npm run validate:all` passed with 17 files and 69 tests.