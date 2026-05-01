# Work Plan: Cube Trainer Reinforcement

Session date: 2026-05-02 Asia/Seoul

## Domains
- PM: scope/priorities and phased rollout.
- Frontend: richer learning dashboard, lesson detail, drill cards, practice workflow UI.
- Native/mobile: Tauri/macOS/Windows camera readiness, native camera QA checklist.
- Architecture/backend/device: future Arduino/device command contract for solving and case scrambles.
- QA: tests, build, browser verification.

## P0: immediate MVP reinforcement
1. Learning UX upgrade
   - Add stage dashboard, selected lesson detail, guided drills, camera/hardware readiness panel.
   - Make D-Cross/F2L/OLL/PLL practice targets explicit.
   - Acceptance: user can see what to practice, why, expected camera/device flow, and related algorithms.
2. Native camera readiness documentation/config
   - Document native app camera test flow and permission risks.
   - Add platform readiness guidance in product docs.
3. Device expansion contract v0
   - Define future device capabilities: solve, scramble full cube, scramble OLL/PLL/F2L/D-Cross cases, guide personalized learning.
   - Keep browser UI independent from hardware transport.

## P1: next slice
- Add hardware adapter interface in core and mock device panel.
- Add case scramble recipes to data.
- Add camera-verified lesson practice session flow.

## P2: later
- Native mobile packaging beyond PWA.
- Real serial/BLE/WebUSB or Tauri plugin transport.
- Hardware safety calibration and emergency stop.

## API/Data contracts
- Learning remains data-driven through Method/Stage/Lesson/Algorithm.
- Device command contract should be transport-agnostic: mode, targetCaseId, targetStage, moves, safety flags.
- Practice session links camera verification and hardware scramble request by case/stage.
