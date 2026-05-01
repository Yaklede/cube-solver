# Architecture Recommendation: Cube Solver Trainer

## Problem

Build a browser-first 3x3 cube solver and learning trainer that can later ship as macOS/Windows desktop apps and mobile-installable app, while preserving a shared core logic layer.

## Constraints and Quality Attributes

- Flutter is excluded.
- Camera access and manual correction are mandatory.
- Core cube logic must be platform-independent and testable.
- Curriculum and algorithms must be data-extensible.
- Desktop packaging must include macOS and Windows.
- The repository should be optimized for agent readability and repeatable validation.

## Options

1. React/Vite + Tauri + PWA
2. React/Vite + Electron
3. React Native/Expo + web + desktop wrapper
4. Next.js + Tauri

## Tradeoff Comparison

React/Vite + Tauri + PWA has the best balance for camera handling, web delivery, lightweight desktop packaging, and fast test feedback. Electron improves desktop maturity but costs more memory and bundle size. React Native/Expo is stronger for native mobile but weakens shared desktop/web implementation. Next.js adds server-side structure that is not needed for the MVP.

## Recommendation

Use React/Vite/TypeScript for the shared UI, Tauri for macOS/Windows packaging, and PWA for the initial mobile app form. Keep cube state, solver, color recognition, learning, and progress logic in `src/core`.

## Risks

- Solver notation conversion can drop wide/slice moves in the MVP.
- Camera color recognition is lighting-sensitive.
- Tauri native builds require platform prerequisites.
- Full OLL/PLL data volume is large.

## Assumptions

- MVP may use guided 3x3 scanning and manual correction.
- PWA is acceptable as the initial mobile execution path.
- Full native mobile can be added later without changing the domain layer.

## Validation Steps

- `npm run lint:architecture`
- `npm run test`
- `npm run validate:harness`
- `npm run validate:build-scripts`
- `npm run build`
