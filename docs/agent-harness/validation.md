# 검증 하네스 상세

## `scripts/validate-architecture.mjs`

- `src/core`가 `src/features` 또는 `src/app`을 import하지 않는지 검사한다.
- 필수 디렉터리가 존재하는지 검사한다.

## `scripts/validate-harness.mjs`

- README, ARCHITECTURE, TEST_PLAN, BUILD_GUIDE, USER_GUIDE, DATA_MODEL 존재 여부를 검사한다.
- `docs/stage-reports/STAGE_REPORTS.md`에 1-20단계 보고서가 있는지 검사한다.
- 아키텍처 문서에 요구사항 재정의, 기술 비교, 최종 스택, 위험 요소가 있는지 검사한다.

## `scripts/validate-build-scripts.mjs`

- 웹, 테스트, Tauri, PWA 실행 스크립트를 검사한다.
- Tauri bundle target에 macOS/Windows 산출물이 있는지 검사한다.
- PWA manifest 존재 여부를 검사한다.

## CI

GitHub Actions는 `npm ci` 후 `npm run validate:all`을 실행한다. PR은 이 검증이 외부검증의 1차 기준이다.
