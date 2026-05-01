# 에이전트 하네스

이 저장소의 하네스는 에이전트가 작업을 읽고, 실행하고, 검증하고, PR 단위로 정리할 수 있도록 만든 구조다.

## 원칙

- `AGENTS.md`는 목차이고, 세부 지식은 버전 관리되는 문서에 둔다.
- 도메인 로직은 `src/core`에 두고 UI와 분리한다.
- 모든 단계는 결과 보고서를 남긴다.
- 구조 규칙은 문서만이 아니라 `scripts/` 검증으로 강제한다.
- PR 전 내부검증은 `npm run validate:all` 하나로 재현 가능해야 한다.

## 검증 명령

```bash
npm run lint:architecture
npm run test
npm run validate:harness
npm run validate:build-scripts
npm run build
```

## PR 흐름

1. 내부검증
2. PR 생성
3. GitHub Actions 외부검증
4. 리뷰 피드백 반영
5. merge

## 참고

Harness Engineering: https://openai.com/ko-KR/index/harness-engineering/
