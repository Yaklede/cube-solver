# Plan: Auto Scan Lock After Recognition

Date: 2026-05-02 Asia/Seoul

User issue: automatic cube face recognition is useful, but after a face is automatically recognized, waiting in front of the camera can make the captured state become undone/overwritten.

Relevant code paths discovered via Serena pattern search:
- `src/features/scanner/ScannerWorkspace.tsx`
  - `AutoScanState` currently stores `signature`, `stableCount`, `appliedSignature`, `appliedAt`, `failedReadinessCount`, `fallbackAppliedAt`.
  - Auto loop samples camera, recognizes `nextFace`, analyzes readiness, then calls `applyRecognitionFromSamples(...)` when stable or fallback conditions are met.
  - `applyRecognitionFromSamples` writes directly to `session.faces[activeFace]`.
  - `saveFace` advances `activeFace`; manual sticker edits also write to the same active face.
- `src/core/scan-frame.ts`
  - Auto thresholds: min average confidence 0.68, max low confidence count 2, stable frames 3, cooldown 1800ms, fallback failures 5.
  - fallback can apply after repeated non-ready frames if center matches expected.

Primary hypothesis:
- Auto recognition continues to run after a face has already been captured for the current active face.
- Since only `appliedSignature` + cooldown gate exists, later camera jitter, fallback, or a new signature can overwrite the same face.
- Manual edits are not protected from subsequent auto overwrites.

Plan summary:
1. Add per-face capture lock state after successful auto/manual recognition.
2. Do not overwrite locked faces unless user explicitly taps re-recognize / unlock / rescan current face.
3. Pause auto loop or ignore auto apply while the active face is locked.
4. Reset lock only when active face changes, user clears the face, or user explicitly requests re-recognition.
5. Add regression tests around auto state policy and scanner UX copy.

Implementation status:
- Added `shouldLockAutoScanRecognition` with a higher confidence gate than basic auto readiness.
- `ScannerWorkspace` now stores per-face locked/review hold state and stops the auto loop while the active face has a hold.
- Strong captures lock the face; marginal/fallback captures enter review hold so they cannot keep drifting.
- Manual sticker edits and explicit face save create a locked hold. Explicit re-recognition releases the hold only after a camera frame is captured.
