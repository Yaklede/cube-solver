# Work Session

Started: 2026-05-02T00:00:00+09:00

User request summary:
- Stepwise reinforcement after MVP.
- Learning section is too shallow; needs richer content and interactions beyond simple text.
- Need real native app path where camera recognition and solving works.
- Future Arduino-like device connection should solve cube or scramble for OLL/PLL/F2L/D-Cross practice, with guided personalized learning.

Domains: PM, frontend, mobile/native desktop, architecture/backend/device integration, QA.

Runtime vendor: Codex-style runtime detected via apply_patch tool.

## 2026-05-02 Solver Verification Debug

- User request: continue fixing the cube solver verification issue where a generated 74-move solution fails app-side simulation despite successful face scan.
- Diagnosis: `rubiks-cube-solver` emits lowercase wide moves such as `b` and `dprime`, but the app normalization/parser/simulator only accepted uppercase single-layer moves, causing dropped moves and failed verification.
- Implementation: added `MoveFace`/`WideMoveFace` support, preserved lowercase solver tokens, rotated outer+middle layers for wide moves, and animated both 3D layers.
- Verification: targeted Vitest files passed, `npm run validate:all` passed, and in-app browser reload showed `Cube Solver Trainer` at `http://localhost:5173/`.
