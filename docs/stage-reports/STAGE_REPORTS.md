# 단계별 작업 결과 보고서

## 1단계

[단계 결과 보고서]

단계 번호: 1
단계 이름: 프로젝트 구조 생성, 기술 스택 확정, 실행 가능한 초기 앱
이번 단계 목표: React/Vite/Tauri/PWA 기반 초기 앱과 하네스 구조를 만든다.
완료한 작업: package scripts, Vite 앱, PWA manifest, Tauri config, CI, 하네스 검증 스크립트를 추가했다.
생성/수정한 파일: `package.json`, `src/app/App.tsx`, `vite.config.ts`, `src-tauri/tauri.conf.json`, `.github/workflows/ci.yml`
핵심 구현 내용: 웹 우선 UI와 플랫폼 패키징 경계를 분리했다.
실행 방법: `npm run dev`
테스트 방법: `npm run validate:harness`
테스트 결과: 내부검증 명령으로 확인한다.
스크린샷 또는 확인 가능한 결과: 홈 화면과 navigation shell.
남은 문제: dependency 설치 후 전체 검증 필요.
다음 단계에서 할 일: 카메라 프리뷰 검증.

## 2단계

[단계 결과 보고서]

단계 번호: 2
단계 이름: 웹캠 또는 카메라 프리뷰 화면
이번 단계 목표: 브라우저 카메라를 표시한다.
완료한 작업: `CameraPreview`와 `requestCameraStream` 경계를 구현했다.
생성/수정한 파일: `src/features/camera/CameraPreview.tsx`, `src/core/camera.ts`
핵심 구현 내용: `mediaDevices.getUserMedia` 오류를 도메인 오류로 래핑한다.
실행 방법: `npm run dev` 후 카메라/스캔 화면.
테스트 방법: `tests/camera.test.ts`
테스트 결과: 권한 실패 예외 처리를 자동 테스트한다.
스크린샷 또는 확인 가능한 결과: 카메라 프레임과 상태 메시지.
남은 문제: 실제 카메라 권한은 브라우저에서 수동 확인해야 한다.
다음 단계에서 할 일: 3x3 스캔 UI 확정.

## 3단계

[단계 결과 보고서]

단계 번호: 3
단계 이름: 3x3 큐브 면 스캔 UI
이번 단계 목표: 중앙 3x3 가이드와 면 편집 UI를 제공한다.
완료한 작업: 오버레이 가이드와 9칸 스티커 편집 UI를 구현했다.
생성/수정한 파일: `src/features/camera/CameraPreview.tsx`, `src/features/scanner/ScannerWorkspace.tsx`, `src/app/styles.css`
핵심 구현 내용: 안정적인 aspect-ratio와 고정 grid로 레이아웃 흔들림을 줄였다.
실행 방법: `npm run dev`
테스트 방법: 수동 QA 체크리스트.
테스트 결과: UI 구조는 빌드 검증에서 확인한다.
스크린샷 또는 확인 가능한 결과: 3x3 overlay와 sticker grid.
남은 문제: 영상 프레임 자동 샘플 연결은 후속 개선.
다음 단계에서 할 일: 색상 보정.

## 4단계

[단계 결과 보고서]

단계 번호: 4
단계 이름: 색상 보정 기능
이번 단계 목표: 조명 변화에 대응 가능한 색상 분류 구조를 만든다.
완료한 작업: 흰색 기준 보정, RGB to Lab 변환, 최근접 색상 분류를 구현했다.
생성/수정한 파일: `src/core/color-recognition.ts`, `tests/color-recognition.test.ts`
핵심 구현 내용: CIE Lab 거리와 confidence 값을 반환한다.
실행 방법: 앱 스캔 화면의 색상 보정 요약 확인.
테스트 방법: `npm run test -- color-recognition`
테스트 결과: 기본 색상 샘플 분류 테스트를 추가했다.
스크린샷 또는 확인 가능한 결과: 색상 팔레트와 보정 요약.
남은 문제: 실제 캡처 샘플 저장 UI는 확장 대상.
다음 단계에서 할 일: 6면 스캔 워크플로우.

## 5단계

[단계 결과 보고서]

단계 번호: 5
단계 이름: 큐브 6면 스캔 워크플로우
이번 단계 목표: U/R/F/D/L/B 순서로 면 데이터를 저장한다.
완료한 작업: ScanSession, face tabs, 현재 면 저장, 초기화를 구현했다.
생성/수정한 파일: `src/core/cube-state.ts`, `src/features/scanner/ScannerWorkspace.tsx`
핵심 구현 내용: 각 면은 `CubeFace`로 저장되고 전체 상태로 합성된다.
실행 방법: 카메라/스캔 화면에서 면별 저장.
테스트 방법: `tests/cube-state.test.ts`
테스트 결과: solved face 기반 문자열 생성 테스트를 추가했다.
스크린샷 또는 확인 가능한 결과: 완료된 면에 check icon 표시.
남은 문제: 자동 스캔 확정 버튼은 후속.
다음 단계에서 할 일: 상태 문자열 생성과 검증.

## 6단계

[단계 결과 보고서]

단계 번호: 6
단계 이름: 큐브 상태 문자열 생성 및 검증
이번 단계 목표: 54자 문자열과 기본 검증을 제공한다.
완료한 작업: `createCubeStateString`, `validateCubeStateString`, validation UI를 구현했다.
생성/수정한 파일: `src/core/cube-state.ts`, `tests/cube-state.test.ts`
핵심 구현 내용: 길이, 허용 기호, 각 색상 9개, 중심 색상 고유성을 검사한다.
실행 방법: 스캔 화면 상태 문자열 확인.
테스트 방법: `npm run test -- cube-state`
테스트 결과: 정상/비정상 상태 테스트를 추가했다.
스크린샷 또는 확인 가능한 결과: 검증 통과/검증 필요 메시지.
남은 문제: full cubie solvability 검증은 solver 오류 처리에 위임.
다음 단계에서 할 일: solver 연동.

## 7단계

[단계 결과 보고서]

단계 번호: 7
단계 이름: 큐브 풀이 알고리즘 연동
이번 단계 목표: 검증된 상태를 solver에 전달한다.
완료한 작업: `rubiks-cube-solver` adapter와 fallback 결과를 구현했다.
생성/수정한 파일: `src/core/solver.ts`, `package.json`
핵심 구현 내용: CFOP/Fridrich solver를 사용하고 실패 시 재스캔 안내를 반환한다.
실행 방법: 풀이 안내 화면에서 `풀이 생성`.
테스트 방법: 빌드와 parser 테스트.
테스트 결과: solver는 integration 영역으로 유지하고 parser를 자동 테스트한다.
스크린샷 또는 확인 가능한 결과: solution summary.
남은 문제: solver 초기화를 Web Worker로 옮기는 작업.
다음 단계에서 할 일: 단계별 풀이 안내 UI.

## 8단계

[단계 결과 보고서]

단계 번호: 8
단계 이름: 단계별 풀이 안내 UI
이번 단계 목표: 한 번에 한 수씩 안내한다.
완료한 작업: 이전/다음/처음부터 컨트롤과 move list를 구현했다.
생성/수정한 파일: `src/features/solver/SolverWorkspace.tsx`
핵심 구현 내용: `Move.koreanInstruction`으로 표준 표기와 한국어 설명을 함께 표시한다.
실행 방법: 풀이 안내 화면.
테스트 방법: `tests/moves.test.ts`
테스트 결과: 표기 파싱과 inverse simulation을 검증한다.
스크린샷 또는 확인 가능한 결과: 큰 회전 표기와 설명.
남은 문제: 실수 후 재인식 복구 경로는 후속.
다음 단계에서 할 일: 왕초보/초보 학습.

## 9단계

[단계 결과 보고서]

단계 번호: 9
단계 이름: 왕초보/초보 학습 모드
이번 단계 목표: 기본 과정과 레슨 데이터를 제공한다.
완료한 작업: 왕초보/초보 Method, Stage, Lesson 샘플을 추가했다.
생성/수정한 파일: `src/data/methods.json`, `src/features/learning/LearningWorkspace.tsx`
핵심 구현 내용: 데이터 기반 레슨 리스트를 렌더링한다.
실행 방법: 학습 모드 화면.
테스트 방법: `tests/learning.test.ts`
테스트 결과: 필수 과정 로딩을 검증한다.
스크린샷 또는 확인 가능한 결과: 왕초보/초보 과정 카드.
남은 문제: 전체 본문 콘텐츠 확장.
다음 단계에서 할 일: CFOP 학습.

## 10단계

[단계 결과 보고서]

단계 번호: 10
단계 이름: CFOP 학습 모드
이번 단계 목표: CFOP 구조를 D-Cross/F2L/OLL/PLL로 나눈다.
완료한 작업: CFOP method와 4개 stage를 추가했다.
생성/수정한 파일: `src/data/methods.json`
핵심 구현 내용: `Method.stages`로 세부 단계가 확장 가능하다.
실행 방법: 학습 모드.
테스트 방법: 학습 데이터 로딩 테스트.
테스트 결과: CFOP method 존재를 검증한다.
스크린샷 또는 확인 가능한 결과: CFOP 과정 표시.
남은 문제: stage별 전용 drill UI 고도화.
다음 단계에서 할 일: D-Cross/F2L/OLL/PLL 세부 학습.

## 11단계

[단계 결과 보고서]

단계 번호: 11
단계 이름: D-Cross, F2L, OLL, PLL 세부 학습 화면
이번 단계 목표: 세부 과정별 레슨과 공식 연결 구조를 만든다.
완료한 작업: Cross 계획, F2L 삽입, 2-Look OLL, 2-Look PLL 레슨을 연결했다.
생성/수정한 파일: `src/data/methods.json`, `src/data/algorithms.json`
핵심 구현 내용: lessons의 `requiredAlgorithms`로 공식 카드와 연결된다.
실행 방법: 학습 모드에서 레슨 트랙 확인.
테스트 방법: `tests/learning.test.ts`
테스트 결과: lessons flattening 테스트.
스크린샷 또는 확인 가능한 결과: 레슨 트랙.
남은 문제: 자동 케이스 인식은 후속.
다음 단계에서 할 일: 공식 라이브러리.

## 12단계

[단계 결과 보고서]

단계 번호: 12
단계 이름: 공식 라이브러리 및 공식 카드
이번 단계 목표: 공식 데이터와 검색 가능한 카드 UI를 제공한다.
완료한 작업: Algorithm 모델과 sample algorithms, 검색/필터 UI를 구현했다.
생성/수정한 파일: `src/core/models.ts`, `src/core/learning.ts`, `src/features/learning/LearningWorkspace.tsx`, `src/data/algorithms.json`
핵심 구현 내용: query, stage, difficulty, favorite, tags 필터 구조.
실행 방법: 학습 모드 하단 공식 라이브러리.
테스트 방법: 공식 검색/필터 테스트.
테스트 결과: Sune/PLL 필터를 검증한다.
스크린샷 또는 확인 가능한 결과: 공식 카드.
남은 문제: 공식 숨기기/애니메이션 UI 고도화.
다음 단계에서 할 일: 랜덤 테스트/약점 복습.

## 13단계

[단계 결과 보고서]

단계 번호: 13
단계 이름: 랜덤 테스트 및 약점 복습 기능
이번 단계 목표: 연습 결과를 저장하고 약점 공식을 계산한다.
완료한 작업: ProgressWorkspace와 `applyPracticeResult`를 구현했다.
생성/수정한 파일: `src/core/progress.ts`, `src/features/progress/ProgressWorkspace.tsx`, `tests/progress.test.ts`
핵심 구현 내용: 실패가 성공보다 많으면 약점 공식에 포함한다.
실행 방법: 랜덤 테스트/기록 화면.
테스트 방법: 사용자 진도 저장 테스트.
테스트 결과: 성공/실패/저장 로직 테스트.
스크린샷 또는 확인 가능한 결과: 기록 table.
남은 문제: 실제 랜덤 케이스 출제 연결.
다음 단계에서 할 일: 다른 해법.

## 14단계

[단계 결과 보고서]

단계 번호: 14
단계 이름: 다른 큐브 해법 학습 기능
이번 단계 목표: Beginner Method, CFOP, Roux, ZZ, Petrus 확장 구조를 제공한다.
완료한 작업: Roux, ZZ, Petrus method 데이터를 추가했다.
생성/수정한 파일: `src/data/methods.json`
핵심 구현 내용: stages를 데이터로 추가하면 코드 변경 없이 학습 트랙에 표시된다.
실행 방법: 학습 모드.
테스트 방법: 학습 데이터 로딩 테스트.
테스트 결과: method names 검증.
스크린샷 또는 확인 가능한 결과: 다른 해법 카드.
남은 문제: Roux/ZZ/Petrus 상세 레슨 데이터 확장.
다음 단계에서 할 일: 사용자 진도 저장.

## 15단계

[단계 결과 보고서]

단계 번호: 15
단계 이름: 사용자 진도 및 연습 기록 저장
이번 단계 목표: 진도와 공식별 통계를 저장 가능한 구조로 만든다.
완료한 작업: UserProgress, AlgorithmProgress, localStorage helper를 구현했다.
생성/수정한 파일: `src/core/models.ts`, `src/core/progress.ts`
핵심 구현 내용: storage boundary를 주입받아 테스트 가능하게 만들었다.
실행 방법: 랜덤 테스트/기록 화면.
테스트 방법: `tests/progress.test.ts`
테스트 결과: save/load 테스트.
스크린샷 또는 확인 가능한 결과: 기록 누적.
남은 문제: UI에서 실제 localStorage 연결.
다음 단계에서 할 일: 웹 빌드.

## 16단계

[단계 결과 보고서]

단계 번호: 16
단계 이름: 웹 빌드 결과
이번 단계 목표: production web build를 만든다.
완료한 작업: `npm run build` 스크립트와 Vite 설정을 추가했다.
생성/수정한 파일: `package.json`, `vite.config.ts`
핵심 구현 내용: TypeScript build 후 Vite build.
실행 방법: `npm run build`
테스트 방법: `npm run validate:all`
테스트 결과: 내부검증에서 실행한다.
스크린샷 또는 확인 가능한 결과: `dist/` output.
남은 문제: dependency 설치 후 실제 빌드 검증.
다음 단계에서 할 일: macOS 앱 설정.

## 17단계

[단계 결과 보고서]

단계 번호: 17
단계 이름: macOS 네이티브 앱 빌드 설정
이번 단계 목표: macOS 데스크톱 번들 구조를 포함한다.
완료한 작업: Tauri v2 config와 Cargo files를 추가했다.
생성/수정한 파일: `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `src-tauri/src/main.rs`
핵심 구현 내용: `app`, `dmg` target을 설정했다.
실행 방법: `npm run tauri:build`
테스트 방법: `tests/build-scripts.test.ts`
테스트 결과: target 존재를 검증한다.
스크린샷 또는 확인 가능한 결과: Tauri config.
남은 문제: macOS runner에서 실제 bundle 검증.
다음 단계에서 할 일: Windows 앱 설정.

## 18단계

[단계 결과 보고서]

단계 번호: 18
단계 이름: Windows 네이티브 앱 빌드 설정
이번 단계 목표: Windows installer target을 포함한다.
완료한 작업: Tauri bundle target에 `msi`, `nsis`를 추가했다.
생성/수정한 파일: `src-tauri/tauri.conf.json`
핵심 구현 내용: 같은 frontendDist를 Windows 번들에 사용한다.
실행 방법: Windows에서 `npm run tauri:build`
테스트 방법: `tests/build-scripts.test.ts`
테스트 결과: msi/nsis target 검증.
스크린샷 또는 확인 가능한 결과: Tauri config.
남은 문제: Windows runner에서 실제 installer 검증.
다음 단계에서 할 일: 모바일 실행 환경.

## 19단계

[단계 결과 보고서]

단계 번호: 19
단계 이름: 모바일 앱 또는 모바일 실행 환경 설정
이번 단계 목표: 초기 모바일 실행 방식을 제공한다.
완료한 작업: PWA manifest, service worker, responsive layout, `mobile:pwa` script를 추가했다.
생성/수정한 파일: `public/manifest.webmanifest`, `public/sw.js`, `src/app/styles.css`, `package.json`
핵심 구현 내용: 모바일 브라우저에서 standalone 설치 가능한 앱 형태.
실행 방법: `npm run mobile:pwa`
테스트 방법: 수동 모바일 QA.
테스트 결과: 빌드 스크립트 검증에 포함.
스크린샷 또는 확인 가능한 결과: manifest와 mobile layout.
남은 문제: 네이티브 iOS/Android 패키징은 후속 확장.
다음 단계에서 할 일: 최종 테스트/문서화.

## 20단계

[단계 결과 보고서]

단계 번호: 20
단계 이름: 최종 테스트, 문서화, 배포 가이드
이번 단계 목표: 문서와 내부검증 루프를 완성한다.
완료한 작업: README, ARCHITECTURE, DATA_MODEL, TEST_PLAN, BUILD_GUIDE, USER_GUIDE, harness docs를 추가했다.
생성/수정한 파일: `README.md`, `ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`, `TEST_PLAN.md`, `BUILD_GUIDE.md`, `USER_GUIDE.md`, `DATA_MODEL.md`, `docs/agent-harness/*`
핵심 구현 내용: 실행/빌드/테스트/사용법/하네스 검증을 문서화했다.
실행 방법: README와 BUILD_GUIDE 참고.
테스트 방법: `npm run validate:all`
테스트 결과: 내부검증 완료 후 커밋한다.
스크린샷 또는 확인 가능한 결과: 문서와 CI.
남은 문제: 외부검증은 PR 생성 후 GitHub Actions에서 확인.
다음 단계에서 할 일: PR 외부검증과 merge.

## 21단계

[단계 결과 보고서]

단계 번호: 21
단계 이름: 풀이 단계별 3D 큐브 시각화
이번 단계 목표: 인식된 큐브 상태를 3D로 표시하고 풀이 단계 이동에 맞춰 큐브가 회전하도록 한다.
완료한 작업: Three.js 기반 3D 큐브 뷰어, 단계별 상태 계산, 이전/다음 회전 애니메이션, solver export 호환 보강, 회귀 테스트를 추가했다.
생성/수정한 파일: `src/features/solver/components/Cube3DViewer.tsx`, `src/features/solver/SolverWorkspace.tsx`, `src/core/cube-visualization.ts`, `src/core/moves.ts`, `src/core/solver.ts`, `src/app/styles.css`, `tests/cube-visualization.test.ts`, `tests/moves.test.ts`, `tests/solver.test.ts`, `package.json`, `package-lock.json`, `.gitignore`, `README.md`, `USER_GUIDE.md`, `TEST_PLAN.md`, `TASK.md`
핵심 구현 내용: 현재 상태 문자열에 적용된 move 수만큼 `applyMoves`로 3D 표시 상태를 계산하고, 한 단계 차이는 회전 레이어 pivot 애니메이션으로 표시한다. 3D 뷰어는 lazy load로 분리해 초기 번들 부담을 줄였다.
실행 방법: `npm run dev` 후 풀이 안내 화면에서 상태 문자열을 입력하고 `풀이 생성`을 누른다.
테스트 방법: `npm run test -- tests/solver.test.ts tests/moves.test.ts tests/cube-visualization.test.ts`, `npm run build`, 브라우저 수동 확인.
테스트 결과: 단위 테스트 3개 파일 10개 테스트 통과, production build 통과, 브라우저에서 49수 솔루션과 3D 단계 전환 확인.
스크린샷 또는 확인 가능한 결과: in-app browser에서 `다음` 클릭 후 단계가 `2 / 49`로 변경되고, 3D 캔버스 하단 영역 픽셀 diff `20885 / 67620` 확인.
남은 문제: 3D chunk가 512.74 kB라 장기적으로 Three.js 세부 chunk 분리 또는 경량 렌더링 전략을 검토할 수 있다.
다음 단계에서 할 일: 전체 내부검증, PR 외부검증, merge.

## 25단계

[단계 결과 보고서]

단계 번호: 25
단계 이름: 솔버 실패 시 기존 스캔 수정 흐름
이번 단계 목표: 솔버가 상태를 해석하지 못했을 때 전체 6면 재스캔 없이 마지막 스캔 데이터를 다시 열어 수정할 수 있게 한다.
완료한 작업: 앱 상위 상태에 마지막 스캔 세션을 보관하고, 솔버 실패/검증 필요 상태에서 기존 스캔을 불러오는 버튼을 추가했다. 상태 문자열만 있는 경우에도 편집 가능한 스캔 세션으로 복원하는 변환 함수를 추가했다.
생성/수정한 파일: `src/app/App.tsx`, `src/features/scanner/ScannerWorkspace.tsx`, `src/features/solver/SolverWorkspace.tsx`, `src/core/cube-state.ts`, `src/app/styles.css`, `tests/cube-state.test.ts`, `TASK.md`, `README.md`, `USER_GUIDE.md`
핵심 구현 내용: `ScannerWorkspace`가 `initialSession` 또는 `initialStateString`으로 시작할 수 있게 하고, `onSessionChange`로 마지막 스캔 세션을 `App`에 동기화한다. `SolverWorkspace`는 fallback/invalid 결과에서 `기존 스캔 불러와 수정`을 제공하며, 스캐너는 적재된 면 수를 안내한다.
실행 방법: `npm run dev` 후 스캔 완료 상태에서 풀이 안내로 이동하고, 솔버 실패/검증 필요 화면에서 `기존 스캔 불러와 수정`을 누른다.
테스트 방법: `npm run test -- tests/cube-state.test.ts tests/solver.test.ts tests/solver-verification.test.ts`, `npm run build`, in-app browser 수동 확인.
테스트 결과: 대상 단위 테스트 3개 파일 8개 테스트 통과, production build 통과.
스크린샷 또는 확인 가능한 결과: in-app browser에서 검증 필요 상태에 `기존 스캔 불러와 수정` 버튼이 표시되고, 클릭 시 스캐너에 `기존 스캔을 불러왔습니다.` 안내와 6면 적재 상태가 표시된다.
남은 문제: 실제 카메라 입력에서 사용자가 어느 면을 고쳐야 하는지 자동 추천하는 기능은 후속 개선 대상이다.
다음 단계에서 할 일: 전체 내부검증, PR 외부검증, merge.

## 26단계

[단계 결과 보고서]

단계 번호: 26
단계 이름: 학습 대시보드와 네이티브/장치 확장 초안
이번 단계 목표: 단순 문구 중심 학습 화면을 실제 훈련 흐름으로 보강하고, 네이티브 카메라 운영 기준과 향후 Arduino류 장치 연동 계약을 준비한다.
완료한 작업: 레슨 상세, 단계 요약, 관련 공식 연결, D-Cross/F2L/OLL/PLL 실전 훈련 플래너, 네이티브/장치 확장 패널을 학습 화면에 추가했다. 장치 연동 도메인 계약과 단위 테스트, 장치 연동 로드맵, 네이티브 카메라 QA 시나리오를 추가했다.
생성/수정한 파일: `src/features/learning/LearningWorkspace.tsx`, `src/core/learning.ts`, `src/core/device.ts`, `src/core/models.ts`, `src/app/styles.css`, `tests/learning.test.ts`, `tests/device.test.ts`, `docs/device-integration-roadmap.md`, `docs/desktop-build-qa.md`, `docs/plans/work/001-strengthen-cube-trainer.md`, `TASK.md`
핵심 구현 내용: 학습 데이터를 `FlattenedLesson`, `StageSummary`, `GuidedPracticePlan`으로 조회할 수 있게 확장하고, 장치 명령은 실제 전송 전 `DeviceCommandPreview`로 안전 확인을 거치도록 설계했다.
실행 방법: `npm run dev` 후 학습 모드 화면에서 과정, 레슨, 훈련 플래너, 네이티브/장치 확장 패널을 확인한다.
테스트 방법: `npm run test -- tests/learning.test.ts tests/device.test.ts`, `npm run validate:all`
테스트 결과: 대상 단위 테스트 2개 파일 8개 테스트 통과, 전체 검증 17개 파일 57개 테스트 통과, production build 통과.
스크린샷 또는 확인 가능한 결과: in-app browser에서 학습 모드, 실전 훈련 플래너, 네이티브 앱과 장치 연동 준비, OLL 케이스 생성이 렌더링되고 console error 0건을 확인했다.
남은 문제: 실제 네이티브 앱 카메라 실기기 QA와 mock 장치 transport 구현은 다음 단계 대상이다.
다음 단계에서 할 일: 네이티브 카메라 실기기 확인, mock transport/설정 UI 설계, PR 외부검증.

## 27단계

[단계 결과 보고서]

단계 번호: 27
단계 이름: 모바일 반응형 보강과 쿠팡 하드웨어 구매 목록
이번 단계 목표: 좁은 화면에서 앱 좌측/카드가 잘리지 않도록 반응형을 보강하고, 향후 Arduino류 큐브 장치 개발에 필요한 쿠팡 기준 구매 목록을 정리한다.
완료한 작업: 전역 overflow 방지, shell/main/panel `min-width: 0`, 모바일 padding, 카메라 액션 버튼, calibration controls, records table, 3D viewer, start reference control의 모바일 단일 컬럼 처리를 추가했다. 쿠팡 검색 기준으로 Arduino Uno/Mega, NEMA17/42각 스텝모터, A4988/DRV8825/TMC2209, RAMPS/CNC shield, 전원, 리미트/비상정지 스위치 구매 기준을 문서화했다.
생성/수정한 파일: `src/app/styles.css`, `docs/hardware-purchase-list-coupang.md`, `TASK.md`
핵심 구현 내용: 모바일에서 가로 스크롤이 페이지 전체에 생기지 않도록 레이아웃 최소 폭을 풀고, 실제 overflow가 필요한 records/diagnostic 영역은 내부 스크롤로 제한했다. 하드웨어 구매는 1축 proof-of-concept와 6축 cube robot 확장 묶음으로 분리했다.
실행 방법: `npm run dev` 후 폭이 좁은 in-app browser 또는 모바일 브라우저에서 홈/학습/스캔/풀이 화면을 확인한다.
테스트 방법: `npm run validate:all`, in-app browser 좁은 폭 수동 확인
테스트 결과: 전체 검증 17개 파일 57개 테스트 통과, production build 통과. in-app browser에서 홈/학습 화면 렌더링과 console error 0건을 확인했다.
스크린샷 또는 확인 가능한 결과: 좁은 폭에서 브랜드와 홈 카드가 좌측 잘림 없이 보이고, 학습 화면의 과정 카드와 플래너가 단일 컬럼으로 렌더링된다.
남은 문제: 실제 iOS/Android 브라우저에서 카메라 권한과 safe-area inset까지 추가 QA가 필요하다.
다음 단계에서 할 일: 네이티브 카메라 실기기 확인, mock serial transport 구현, PR 외부검증.

## 24단계

[단계 결과 보고서]

단계 번호: 24
단계 이름: 솔버 해석 실패/3D 수동 제어/카메라 스캔 UX 개선
이번 단계 목표: 솔버 원문 에러 노출을 막고, 3D 큐브를 사용자가 직접 돌려볼 수 있게 하며, 카메라 인식 버튼을 프리뷰 근처에 배치하고 자동 인식 fallback을 제공한다.
완료한 작업: 외부 솔버 예외를 사용자 친화 문구로 변환하고 fallback 시 임의 공식을 진행하지 않도록 했다. 3D 큐브에 드래그, 화살표 키, 시점 제어 버튼을 추가했다. 자동 인식이 5회 안정화되지 않으면 센터 색상이 맞는 경우 수동 인식 fallback을 자동 실행한다. 카메라 빠른 인식/저장/자동 토글 바를 프리뷰 바로 아래에 추가했다.
생성/수정한 파일: `src/core/solver.ts`, `src/core/scan-frame.ts`, `src/features/solver/SolverWorkspace.tsx`, `src/features/solver/components/Cube3DViewer.tsx`, `src/features/scanner/ScannerWorkspace.tsx`, `src/app/styles.css`, `tests/solver.test.ts`, `tests/cube-3d-viewer.test.ts`, `tests/scan-frame.test.ts`, `TASK.md`, `README.md`, `USER_GUIDE.md`
핵심 구현 내용: `Cannot read properties of undefined (reading 'faces')`를 raw warning으로 노출하지 않고, 물리적으로 해석 불가한 큐브 상태 안내로 치환한다. 3D 뷰어는 idle 회전 없이 직접 시점 조절만 수행한다. 스캐너는 실패 카운트를 추적해 5회 후 fallback recognition을 적용한다.
실행 방법: `npm run dev` 후 풀이 안내 화면에서 상태 문자열을 입력하거나 카메라/스캔 화면에서 프리뷰 아래 빠른 인식 버튼을 사용한다.
테스트 방법: `npm run test -- tests/solver.test.ts tests/cube-3d-viewer.test.ts tests/scan-frame.test.ts`, `npm run validate:all`, in-app browser 수동 확인.
테스트 결과: 대상 단위 테스트 3개 파일 11개 테스트 통과, 전체 검증 15개 파일 47개 테스트 통과, production build 통과.
스크린샷 또는 확인 가능한 결과: in-app browser에서 impossible state 입력 시 raw error가 사라지고 `확인 필요 / 0`, sanitized warning, disabled `다음`을 확인했다. 3D 오른쪽 제어 버튼 클릭 후 screenshot base64가 변경됐고, 카메라 화면에 `카메라 빠른 인식` 영역이 프리뷰 바로 아래 표시됐다.
남은 문제: 실제 카메라 환경에서 fallback 빈도와 오인식률은 추가 실측이 필요하다.
다음 단계에서 할 일: PR 외부검증, merge.

## 23단계

[단계 결과 보고서]

단계 번호: 23
단계 이름: 3D 큐브 idle 정지와 단계 표기 동기화
이번 단계 목표: 3D 큐브가 가만히 있을 때 자동 회전하지 않게 하고, 풀이 공식과 3D 패널의 단계 표기가 서로 다른 공식처럼 보이지 않게 한다.
완료한 작업: idle 회전 속도를 0으로 고정하고, 3D 패널 헤더를 `B2 대기` 같은 공식 표기에서 `시작 상태 · 0 / 49`, `1수 반영 · 1 / 49` 형태로 변경했다.
생성/수정한 파일: `src/features/solver/components/Cube3DViewer.tsx`, `src/features/solver/SolverWorkspace.tsx`, `tests/cube-3d-viewer.test.ts`, `TASK.md`, `README.md`, `USER_GUIDE.md`
핵심 구현 내용: 3D 렌더 루프에서 자동 Y축 회전을 제거하고, 3D 상태는 적용된 move count만 표시하도록 분리했다.
실행 방법: `npm run dev` 후 풀이 안내 화면에서 상태 문자열을 입력하고 `풀이 생성`을 누른다.
테스트 방법: `npm run test -- tests/cube-3d-viewer.test.ts tests/cube-visualization.test.ts`, `npm run build`, in-app browser 수동 확인.
테스트 결과: 대상 단위 테스트 2개 파일 7개 테스트 통과, production build 통과, 브라우저에서 `다음` 후 `1수 반영 · 1 / 49` 표시 확인.
스크린샷 또는 확인 가능한 결과: in-app browser에서 0.9초 간격 전체 화면 스크린샷 base64가 동일해 idle 회전이 없음을 확인했다.
남은 문제: 3D chunk 크기 경고는 기존과 동일하게 후속 최적화 대상이다.
다음 단계에서 할 일: 전체 내부검증, PR 외부검증, merge.

## 22단계

[단계 결과 보고서]

단계 번호: 22
단계 이름: 3D 큐브 색상 표시와 풀이 시작 기준 보강
이번 단계 목표: 현재 인식된 큐브 색상이 3D 큐브에 실제로 보이도록 하고, 사용자가 풀이 첫 수를 시작할 기준 방향을 알 수 있게 한다.
완료한 작업: 3D 스티커 렌더링 위치를 큐브 표면 밖으로 보정하고, 상태 문자열의 센터 색상 기반 시작 기준 안내를 풀이 패널에 추가했다.
생성/수정한 파일: `src/core/cube-visualization.ts`, `src/core/orientation-guide.ts`, `src/features/solver/components/Cube3DViewer.tsx`, `src/features/solver/SolverWorkspace.tsx`, `src/app/styles.css`, `tests/cube-visualization.test.ts`, `tests/orientation-guide.test.ts`, `TASK.md`, `README.md`, `USER_GUIDE.md`
핵심 구현 내용: 스티커 평면이 cubie 내부에 묻히지 않도록 공통 렌더 좌표 계산을 만들고, `U`, `F`, `R` 센터 색상으로 "위/앞/오른쪽" 시작 기준을 표시한다.
실행 방법: `npm run dev` 후 풀이 안내 화면에서 상태 문자열을 입력하고 `풀이 생성`을 누른다.
테스트 방법: `npm run test -- tests/cube-visualization.test.ts tests/orientation-guide.test.ts`, `npm run build`, in-app browser 수동 확인.
테스트 결과: 대상 단위 테스트 2개 파일 6개 테스트 통과, production build 통과, 브라우저에서 3D 색상과 시작 기준 안내 확인.
스크린샷 또는 확인 가능한 결과: 현재 테스트 상태 문자열에서 3D 큐브의 주황/파랑/초록/빨강/흰색 스티커가 보이며, 3D 영역 색상 픽셀 검증에서 saturated 62743개를 확인했다.
남은 문제: 3D chunk 크기는 여전히 500 kB 이상이라 후속 최적화 대상이다.
다음 단계에서 할 일: 전체 내부검증, PR 외부검증, merge.
