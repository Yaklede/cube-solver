# 데이터 모델

## CubeState

- `faces`: U/R/F/D/L/B 면별 `CubeFace`
- `stateString`: Kociemba facelet 순서 54자 문자열
- `validation`: 검증 결과
- `updatedAt`: 마지막 갱신 시각

## CubeFace

- `name`: U/R/F/D/L/B
- `centerColor`: 중심 색상
- `stickers`: 9개 `CubeSticker`

## CubeSticker

- `id`, `face`, `index`
- `color`: white/yellow/red/orange/blue/green
- `confidence`: 인식 신뢰도
- `rgb`: 원본 샘플 색상
- `manuallyEdited`: 수동 수정 여부

## ScanSession

- `id`, `createdAt`
- `activeFace`
- `faceOrder`
- `faces`
- `colorProfileId`

## ColorProfile

- `id`, `name`, `createdAt`
- `whiteBalance`
- `samples`: 색상별 RGB/Lab 샘플

## SolverResult

- `id`
- `stateString`
- `moves`
- `algorithm`
- `status`: solved/solution/fallback/invalid
- `summary`
- `warnings`

## Move

- `face`: U/R/F/D/L/B
- `amount`: 1, 2, -1
- `notation`
- `koreanInstruction`

## Method / Stage / Lesson

학습 과정은 `Method`가 `Stage[]`를 가지고, 각 stage가 `Lesson[]`를 가진다. `src/data/methods.json`에 저장한다.

## Algorithm

- `id`
- `methodName`
- `stageName`
- `caseName`
- `difficulty`
- `notation`
- `description`
- `prerequisites`
- `resultCondition`
- `tags`
- `alternatives`
- `leftHanded`, `rightHanded`
- `favorite`
- `successCount`, `failureCount`
- `averageTimeMs`
- `lastPracticedAt`

## AlgorithmCase

- `id`
- `algorithmId`
- `name`
- `recognitionPattern`
- `previewState`
- `tags`

## UserProgress

- `completedLessonIds`
- `activeLessonIds`
- `algorithmProgress`
- `weakAlgorithmIds`
- `confusedCaseIds`
- `lastStudyDate`

## PracticeSession / PracticeResult

연습 세션은 여러 결과를 포함한다. 각 결과는 성공 여부, 소요 시간, 카메라 검증 여부, 시작/종료 상태를 저장한다.

## UserSettings

- 언어
- Cross 선호 색상
- 카메라 장치
- 색상 프로필
- 느린 재생 속도
- 회전 설명 표시 여부
- 저장소 버전
