# 빌드 가이드

## 공통 요구사항

- Node.js 22 이상
- npm 10 이상
- macOS/Windows 네이티브 빌드 시 Rust와 Tauri prerequisites

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

## Windows 네이티브 앱

Windows 환경에서 실행한다.

```bash
npm run tauri:build
```

bundle target에 `msi`, `nsis`가 포함되어 있다.

## 모바일/PWA

```bash
npm run mobile:pwa
```

PWA manifest와 service worker는 `public/`에 있다. 모바일 카메라는 HTTPS 또는 localhost에서 권한 허용이 필요하다.

## 내부 검증

```bash
npm run validate:all
```
