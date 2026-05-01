# 개발 계획

## 제품 목표

웹캠 기반 큐브 인식, 상태 검증, 풀이 안내, 공식 학습과 연습 기록을 하나의 웹 우선 앱으로 제공한다. 초기 완료 기준은 동작 가능한 MVP와 확장 가능한 하네스다.

## 구현 순서

1. 저장소 하네스와 문서 맵 구성
2. React/Vite 앱과 PWA 기본 구조
3. 플랫폼 독립 도메인 모델
4. 카메라 프리뷰와 스캔 UI
5. 색상 보정과 수동 수정
6. 상태 문자열/검증/회전 시뮬레이션
7. `cubejs` 솔버 연동
8. 학습 데이터와 공식 카드
9. 진도/연습 기록 저장
10. Tauri macOS/Windows 설정
11. 테스트, 빌드, 문서, CI

## 하네스 최적화

- `scripts/validate-architecture.mjs`: core가 UI를 import하지 않는지 검증
- `scripts/validate-harness.mjs`: 필수 문서와 20단계 보고서 검증
- `scripts/validate-build-scripts.mjs`: 웹/데스크톱/모바일 빌드 스크립트 검증
- `.github/workflows/ci.yml`: PR과 main push에서 전체 내부 검증 실행
- `docs/stage-reports/STAGE_REPORTS.md`: 단계별 완료 상태 기록

## 검증 흐름

1. 내부검증: `npm run validate:all`
2. PR: 브랜치 push 후 PR 생성
3. 외부검증: GitHub Actions 및 리뷰 피드백 확인
4. merge: 외부검증 통과 후 main 병합

현재 작업에서는 내부검증과 PR 생성을 시도한다. 외부검증과 merge는 원격 권한과 CI 결과에 따라 진행한다.
