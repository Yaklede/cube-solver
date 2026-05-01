# 빌드 가이드

## 공통 요구사항

- Node.js 22 이상
- npm 10 이상
- macOS/Windows 네이티브 빌드 시 Rust 1.85 이상과 Tauri prerequisites

Rust가 오래된 stable에 고정되어 있으면 Tauri 의존성의 `edition2024` 패키지를 파싱하지 못한다. 로컬 빌드 전 다음 명령으로 최신 stable을 맞춘다.

```bash
rustup update stable
rustc --version
cargo --version
```

## 설치

```bash
npm install
```

## 개발 서버

```bash
npm run dev
```

## 웹 빌드

```bash
npm run build
```

결과물은 `dist/`에 생성된다.

## 웹 프리뷰

```bash
npm run preview
```

## macOS 네이티브 앱

```bash
npm run tauri:build
```

`src-tauri/tauri.conf.json`의 bundle target에 `app`, `dmg`가 포함되어 있다.
검증된 macOS 산출물은 다음 경로에 생성된다.

- `src-tauri/target/release/bundle/macos/Cube Solver Trainer.app`
- `src-tauri/target/release/bundle/dmg/Cube Solver Trainer_0.1.0_aarch64.dmg`

## Windows 네이티브 앱

Windows 환경에서 실행한다.

```bash
npm run tauri:build
```

bundle target에 `msi`, `nsis`가 포함되어 있다.
Windows 실빌드는 `.github/workflows/desktop-build.yml`의 `windows-latest` runner에서 재현한다.

## 모바일/PWA

```bash
npm run mobile:pwa
```

PWA manifest와 service worker는 `public/`에 있다. 모바일 카메라는 HTTPS 또는 localhost에서 권한 허용이 필요하다.

## 내부 검증

```bash
npm run validate:all
```

## 데스크톱 CI 검증

GitHub Actions에서 수동 실행 또는 PR 변경 시 다음 workflow를 실행한다.

```text
.github/workflows/desktop-build.yml
```

이 workflow는 `macos-latest`, `windows-latest`에서 `npm ci`, `npm run validate:build-scripts`를 실행한 뒤 플랫폼별 번들을 생성한다.

- macOS CI: `npm run tauri:build:macos-ci` (`.app`)
- Windows CI: `npm run tauri:build:windows-ci` (`.msi`, `.exe`)

DMG 패키징은 macOS 로컬 검증 대상이다. GitHub hosted macOS runner에서는 DMG 생성 스크립트가 환경 차이로 실패할 수 있어 CI에서는 `.app` 번들 생성을 외부검증 기준으로 둔다.
