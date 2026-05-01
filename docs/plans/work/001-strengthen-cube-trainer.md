# Cube Trainer 단계적 강화 계획

> 얕은 학습 경험을 실전형 학습 플로우로 확장하고, 네이티브 인식/향후 하드웨어 제어까지 같은 공유 코어 위에 올린다.

**Status**: Active
**Created**: 2026-05-02
**Owner**: pm

## Goal
기존 React/Vite/TypeScript + Tauri + PWA 구조를 유지하면서 다음 3단계를 순차적으로 구현 가능한 작업 단위로 분해한다.

1. 학습 섹션을 데이터 열람형에서 상호작용형 연습/개인화 학습형으로 확장
2. Tauri 네이티브 앱에서 실제 카메라 인식과 풀이 플로우를 안정적으로 동작
3. 향후 Arduino 유사 하드웨어 연동으로 solve/scramble/practice 자동화를 지원

## Context
- 현재 학습 화면은 `src/features/learning/LearningWorkspace.tsx`에서 메서드/레슨/알고리즘 목록과 단순 재생만 제공한다.
- 현재 스캐너는 웹 카메라 API 기반이며 `src/features/scanner/ScannerWorkspace.tsx`, `src/features/camera/CameraPreview.tsx`, `src/core/color-recognition.ts`를 사용한다.
- 네이티브 경계는 `src-tauri/src/lib.rs`에 아직 명령/이벤트가 없다.
- 진도/설정 저장은 `src/core/progress.ts`, `src/core/settings.ts`와 브라우저 `localStorage` 중심이다.

## Constraints
- `.agents/` SSOT 소스는 수정하지 않는다.
- 공유 코어(`src/core`)를 우선 유지하고 플랫폼별 구현은 얇게 둔다.
- 단계별 커밋이 가능하도록 작업은 독립적이고 검증 가능해야 한다.
- 기존 웹/PWA 동작을 유지하면서 Tauri 네이티브 기능을 추가한다.

## Tasks

| # | Task | Agent | Priority | Status | Dependencies |
|---|------|-------|----------|--------|--------------|
| 1 | 학습/연습 도메인 계약 정의: lesson state, practice queue, recommendation, native bridge, hardware queue 모델을 `src/core` 기준으로 명세한다. | backend | P0 | PARTIAL | — |
| 2 | 학습 MVP 확장: `LearningWorkspace`를 레슨 상세, 알고리즘 드릴, 숨김 테스트, 오답 기록, 추천 복습 진입점이 있는 플로우로 재구성한다. | frontend | P0 | PARTIAL | 1 |
| 3 | 진도 저장소 리팩터링: `localStorage` 중심 저장을 학습/연습 세션, 약점 케이스, 추천 큐를 저장할 수 있는 저장 어댑터 구조로 일반화한다. | backend | P0 | TODO | 1 |
| 4 | 네이티브 카메라 브리지 구축: Tauri 명령/이벤트 경계와 권한/장치 선택/프레임 캡처 계약을 추가하고 웹 스캐너가 이를 선택적으로 사용하게 한다. | backend | P0 | TODO | 1 |
| 5 | 네이티브 스캔 UX 통합: 스캐너 화면에 장치 상태, 권한 상태, 네이티브 캡처 fallback, 실패 복구를 추가한다. | frontend | P0 | TODO | 4 |
| 6 | 실전 풀이 검증 MVP: 스캔 결과에서 풀이 진입, 단계별 확인, 카메라 재검증, 실패 시 복구 루프를 정의하고 연결한다. | frontend | P1 | TODO | 4, 5 |
| 7 | 개인화 추천 엔진 1차: `UserProgress`와 `PracticeResult`를 기반으로 weak cases, spaced review, OLL/PLL/F2L/D-Cross 추천 큐를 생성한다. | backend | P1 | TODO | 2, 3 |
| 8 | 연습 모드 확장: `ProgressWorkspace`를 랜덤 테스트가 아니라 연습 세션 허브로 바꾸고 stage/case별 세션 시작과 결과 기록을 지원한다. | frontend | P1 | TODO | 3, 7 |
| 9 | 하드웨어 제어 계약/시뮬레이션: solve/scramble/practice 명령 큐, 디바이스 capability, ACK/timeout/error 모델을 정의하고 mock transport를 추가한다. | backend | P1 | TODO | 1 |
| 10 | 하드웨어 준비 UI: 설정/연습 화면에 디바이스 연결 상태, 명령 큐 상태, 향후 자동 solve/scramble 진입점을 추가한다. | frontend | P2 | TODO | 9 |
| 11 | 데이터 확장: `src/data/methods.json`, `src/data/algorithms.json`를 richer lesson/practice metadata에 맞게 증설하고 검증 규칙을 보강한다. | backend | P2 | TODO | 1, 2, 7 |
| 12 | 검증 및 단계별 커밋 운영: 각 P0/P1 묶음마다 테스트, 빌드, Tauri 실행 확인, 커밋 기준을 문서화하고 적용한다. | qa | P0 | PARTIAL | 2, 3, 4, 5 |

## MVP Slice
첫 구현 슬라이스는 `학습 고도화 + 저장 구조 정비`다.

- 범위: Tasks 1, 2, 3, 12
- 이유: 현재 코드베이스에서 가장 빠르게 사용자 가치가 나오고, 이후 네이티브/하드웨어 단계가 재사용할 학습 상태/연습 결과 모델을 먼저 안정화할 수 있다.
- 완료 기준:
  - 학습 화면에서 레슨 상세 보기, 알고리즘 드릴 시작, 오답/성공 기록, 약점 복습 진입이 가능하다.
  - 진도 저장이 lesson completion + case stats + recommendation queue까지 유지된다.
  - 이 슬라이스만으로도 독립 커밋과 검증이 가능하다.

## Done When
- [ ] P0 작업이 기존 웹/PWA 흐름을 깨지 않고 분리된 커밋 단위로 정의되었다.
- [ ] 학습/연습과 네이티브/하드웨어 경계 계약이 문서화되었다.
- [ ] MVP-first 구현 순서가 명확하고 의존성이 최소화되었다.
- [ ] 각 작업에 테스트 가능한 acceptance criteria가 있다.

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-02 | 학습 고도화를 MVP 1순위로 둔다 | 현재 가장 얕은 영역이며 네이티브/하드웨어보다 위험이 낮고 재사용 모델을 만든다 |
| 2026-05-02 | 네이티브 카메라와 하드웨어는 계약 우선으로 자른다 | 현재 Tauri 명령 경계가 없어서 바로 구현하면 재작업 비용이 크다 |
| 2026-05-02 | 공유 코어 우선, 플랫폼 어댑터 후행 원칙을 유지한다 | 웹/PWA/Tauri/향후 하드웨어에 동일한 도메인 모델을 재사용하기 위해서다 |

## Progress Notes
- [2026-05-02] Plan created
- [2026-05-02] 1차 구현으로 `src/core/learning.ts` 요약/훈련 플랜 유틸, `src/core/device.ts` 장치 명령 preview 계약, 학습 화면의 레슨 상세/훈련 플래너/네이티브 장치 패널을 추가했다.
