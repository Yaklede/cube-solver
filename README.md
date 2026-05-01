# 웹캠 기반 AI 큐브 풀이 및 학습 트레이너

컴퓨터 또는 모바일 브라우저의 카메라로 3x3 큐브를 6면 스캔하고, 상태 문자열 검증, 준최단 풀이 안내, 큐브 공식 학습을 제공하는 MVP입니다. 핵심 로직은 TypeScript `src/core`에 플랫폼 독립적으로 분리했고, 웹/PWA/Tauri 데스크톱이 같은 UI와 도메인 로직을 공유합니다.

## 주요 기능

- 카메라 프리뷰와 중앙 3x3 스캔 가이드
- 색상 보정 프로필과 9칸 색상 분류 로직
- 6면 스캔 워크플로우와 수동 수정 UI
- 54자 큐브 상태 문자열 생성 및 색상/센터 검증
- `rubiks-cube-solver` 기반 CFOP/Fridrich solver 어댑터
- 한 수 단위 풀이 안내, 한국어 회전 설명, 단계별 3D 큐브 시각화
- 왕초보, 초보, CFOP, D-Cross, F2L, OLL, PLL, Roux, ZZ, Petrus 학습 데이터
- 공식 라이브러리, 검색/필터, 랜덤 테스트/약점 기록 구조
- PWA 모바일 실행과 Tauri macOS/Windows 빌드 설정
- 하네스 검증 스크립트와 CI

## 지원 플랫폼

- Web: Vite + React SPA
- Mobile: PWA 및 반응형 웹
- macOS: Tauri 번들 설정
- Windows: Tauri MSI/NSIS 번들 설정

## 설치 방법

```bash
npm install
```

## 웹 실행 방법

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

## macOS 빌드 방법

Rust와 Tauri prerequisites를 설치한 뒤 실행합니다.

```bash
npm run tauri:build
```

macOS 번들은 `src-tauri/target/release/bundle/` 아래에 생성됩니다.

## Windows 빌드 방법

Windows 환경에서 Rust, WebView2, Tauri prerequisites를 설치한 뒤 실행합니다.

```bash
npm run tauri:build
```

설정된 번들 target은 `msi`, `nsis`입니다.

## 모바일 실행 방법

초기 모바일 전략은 PWA입니다.

```bash
npm run mobile:pwa
```

모바일 브라우저에서 preview URL에 접속한 뒤 홈 화면에 추가합니다. 카메라 스캔은 HTTPS 또는 localhost 환경에서 동작합니다.

## 카메라 권한 설정

브라우저 또는 Tauri 앱에서 카메라 권한을 허용해야 합니다. 권한이 거부되면 앱은 `CameraAccessError`로 안내 메시지를 표시합니다.

## 색상 보정 방법

`src/core/color-recognition.ts`의 색상 프로필은 흰색 기준 보정과 CIE Lab 거리 비교를 사용합니다. MVP UI에서는 기본 프로필을 제공하고, 후속 단계에서 실제 캡처 샘플 저장 UI를 확장합니다.

## 큐브 스캔 방법

1. 카메라/스캔 화면을 엽니다.
2. 큐브 한 면을 중앙 3x3 가이드에 맞춥니다.
3. 인식 또는 수동 수정으로 9칸 색상을 확정합니다.
4. U, R, F, D, L, B 순서로 6면을 저장합니다.
5. 상태 문자열과 검증 결과를 확인합니다.

## 풀이 안내 사용법

풀이 안내 화면에서 54자 상태 문자열을 입력하고 `풀이 생성`을 누릅니다. 결과는 `R`, `U`, `F2`, `R'` 같은 표준 표기와 한국어 설명으로 한 단계씩 표시됩니다. 옆의 3D 큐브는 현재 인식된 상태에서 시작하며 `다음` 또는 `이전`을 누르면 해당 회전이 애니메이션으로 반영됩니다.

## 학습 모드 사용법

학습 모드에서 과정, 레슨, 공식 카드를 탐색합니다. 공식 라이브러리는 케이스 이름, 태그, 단계명으로 검색할 수 있습니다.

## 공식 데이터 추가 방법

`src/data/algorithms.json`에 `Algorithm` 모델 필드를 채워 추가합니다. 코드 수정 없이 새로운 공식 카드와 검색 대상에 반영됩니다.

## 다른 해법 추가 방법

`src/data/methods.json`에 `Method`, `Stage`, `Lesson` 구조를 추가합니다. Roux, ZZ, Petrus처럼 stages를 비워 둘 수 있고, 이후 데이터만 추가하면 UI에 표시됩니다.

## 테스트 실행 방법

```bash
npm run test
npm run validate:all
```

## 알려진 한계

- MVP 색상 인식은 가이드 박스 기반 샘플링/보정 구조이며 완전 자동 큐브 포즈 추정은 포함하지 않습니다.
- solver가 반환하는 wide/slice move는 MVP에서 표준 단일 면 회전으로 변환 가능한 항목만 안내합니다.
- Tauri 네이티브 번들은 플랫폼별 prerequisites가 설치된 환경에서 검증해야 합니다.
- Full OLL/PLL 전체 데이터는 샘플 기반 구조만 포함하고 데이터 확장 대상으로 남겨 둡니다.

## 향후 개선 계획

- Web Worker 기반 솔버 초기화
- 실제 영상 프레임 캡처와 자동 9칸 색상 추출 연결
- OLL/PLL 전체 케이스 데이터 추가
- 카메라 기반 수행 전후 검증 정확도 개선
- PR 외부 검증 자동화와 스크린샷 회귀 테스트 추가
