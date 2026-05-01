# 데스크톱 빌드 QA 체크리스트

## 목적

macOS와 Windows에서 동일한 웹 UI와 핵심 로직을 Tauri 네이티브 앱으로 패키징할 수 있는지 확인한다.

## 공통 사전 조건

- Node.js 22 이상
- npm 10 이상
- Rust 1.85 이상
- `rustup update stable` 실행
- `npm ci` 완료

## macOS 로컬 검증

1. `rustc --version`과 `cargo --version`이 1.85 이상인지 확인한다.
2. `npm run tauri:build`를 실행한다.
3. 다음 산출물이 생성되는지 확인한다.
   - `src-tauri/target/release/bundle/macos/Cube Solver Trainer.app`
   - `src-tauri/target/release/bundle/dmg/Cube Solver Trainer_0.1.0_aarch64.dmg`
4. 앱 실행 후 카메라 권한 프롬프트가 표시되는지 확인한다.
5. 카메라 권한 거부 시 앱이 예외 없이 안내 상태를 표시하는지 확인한다.

## Windows CI 검증

1. GitHub Actions에서 `desktop-build` workflow를 실행한다.
2. `tauri-windows-latest` job이 성공하는지 확인한다.
3. artifact에 `.msi` 또는 `.exe` 번들이 포함되는지 확인한다.
4. Windows 실기기에서 설치 후 카메라 권한과 화면 레이아웃을 확인한다.

## GitHub Actions 검증 기준

- macOS runner는 `npm run tauri:build:macos-ci`로 `.app` 번들을 생성한다.
- Windows runner는 `npm run tauri:build:windows-ci`로 `.msi`, `.exe` 설치 번들을 생성한다.
- macOS DMG는 로컬 검증에서 확인한다. Hosted runner에서는 DMG packaging helper가 환경 차이로 실패할 수 있어 CI 필수 산출물에서 제외한다.

## 현재 로컬 검증 결과

- 실행일: 2026-05-01
- 환경: macOS arm64, Rust 1.95.0, Cargo 1.95.0, Node.js 22
- 명령: `npm run tauri:build`
- 결과: 성공
- 산출물:
  - `src-tauri/target/release/bundle/macos/Cube Solver Trainer.app`
  - `src-tauri/target/release/bundle/dmg/Cube Solver Trainer_0.1.0_aarch64.dmg`

## 알려진 주의사항

- Rust 1.76.0에서는 `serde_spanned` 등 최신 Tauri 의존성이 `edition2024`를 요구해 빌드가 실패한다.
- Tauri 아이콘 파일이 없으면 `tauri::generate_context!()` 단계에서 빌드가 실패한다.
- Windows 번들 생성은 macOS 로컬에서 직접 검증할 수 없으므로 GitHub Actions `windows-latest` runner로 외부 검증한다.
