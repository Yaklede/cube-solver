import type { Algorithm, AlgorithmFilters, Lesson, Method } from "@/core/models";

export interface FlattenedLesson extends Lesson {
  methodId: string;
  methodName: string;
  methodLevel: Method["level"];
  methodTags: string[];
  stageName: string;
  stageDescription: string;
  stageOrder: number;
}

export interface StageSummary {
  id: string;
  methodId: string;
  methodName: string;
  stageName: string;
  description: string;
  lessonCount: number;
  algorithmCount: number;
  estimatedMinutes: number;
  tags: string[];
}

export interface GuidedPracticePlan {
  id: string;
  stageName: string;
  title: string;
  objective: string;
  cameraGoal: string;
  deviceGoal: string;
  checkpoints: string[];
  suggestedAlgorithmIds: string[];
}

export function filterAlgorithms(algorithms: Algorithm[], filters: AlgorithmFilters): Algorithm[] {
  const query = filters.query?.trim().toLowerCase();
  const tagSet = new Set(filters.tags ?? []);

  return algorithms.filter((algorithm) => {
    if (query) {
      const haystack = [
        algorithm.id,
        algorithm.methodName,
        algorithm.stageName,
        algorithm.caseName,
        algorithm.notation,
        algorithm.description,
        ...algorithm.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.methodName && algorithm.methodName !== filters.methodName) return false;
    if (filters.stageName && algorithm.stageName !== filters.stageName) return false;
    if (filters.difficulty && algorithm.difficulty !== filters.difficulty) return false;
    if (filters.favoriteOnly && !algorithm.favorite) return false;
    if (tagSet.size > 0 && !algorithm.tags.some((tag) => tagSet.has(tag))) return false;
    return true;
  });
}

export function flattenLessons(methods: Method[]): FlattenedLesson[] {
  return methods.flatMap((method) =>
    method.stages.flatMap((stage) =>
      stage.lessons.map((lesson) => ({
        ...lesson,
        methodId: method.id,
        methodName: method.name,
        methodLevel: method.level,
        methodTags: method.tags,
        stageName: stage.name,
        stageDescription: stage.description,
        stageOrder: stage.order,
      })),
    ),
  );
}

export function getMethodById(methods: Method[], id: string): Method | undefined {
  return methods.find((method) => method.id === id);
}

export function buildStageSummaries(methods: Method[], algorithms: Algorithm[]): StageSummary[] {
  return methods.flatMap((method) =>
    method.stages.map((stage) => {
      const stageAlgorithms = algorithms.filter((algorithm) => algorithm.methodName === method.name && algorithm.stageName === stage.name);
      const tags = new Set([...method.tags, ...stageAlgorithms.flatMap((algorithm) => algorithm.tags)]);

      return {
        id: stage.id,
        methodId: method.id,
        methodName: method.name,
        stageName: stage.name,
        description: stage.description,
        lessonCount: stage.lessons.length,
        algorithmCount: stageAlgorithms.length,
        estimatedMinutes: stage.lessons.reduce((total, lesson) => total + lesson.estimatedMinutes, 0),
        tags: [...tags],
      };
    }),
  );
}

export function getLessonAlgorithms(lesson: FlattenedLesson | undefined, algorithms: Algorithm[]): Algorithm[] {
  if (!lesson) return [];

  const required = new Set(lesson.requiredAlgorithms);
  if (required.size > 0) {
    return algorithms.filter((algorithm) => required.has(algorithm.id));
  }

  return algorithms.filter((algorithm) => algorithm.methodName === lesson.methodName && algorithm.stageName === lesson.stageName);
}

export function buildGuidedPracticePlans(algorithms: Algorithm[]): GuidedPracticePlan[] {
  const byStage = new Map<string, string[]>();
  algorithms.forEach((algorithm) => {
    const list = byStage.get(algorithm.stageName) ?? [];
    list.push(algorithm.id);
    byStage.set(algorithm.stageName, list);
  });

  return [
    {
      id: "practice-d-cross",
      stageName: "D-Cross",
      title: "D-Cross 계획 훈련",
      objective: "흰색 아래 기준 또는 색상 중립 기준으로 15초 안에 Cross 경로를 말로 설명합니다.",
      cameraGoal: "스캔된 큐브에서 네 개의 Cross 엣지 위치와 뒤집힘 여부를 확인합니다.",
      deviceGoal: "장치 연결 시 Cross 전용 스크램블을 생성하고 사용자는 계획만 수행합니다.",
      checkpoints: ["센터 기준 선택", "엣지 4개 위치 확인", "8수 이하 계획", "수행 후 카메라 검증"],
      suggestedAlgorithmIds: byStage.get("D-Cross") ?? [],
    },
    {
      id: "practice-f2l",
      stageName: "F2L",
      title: "F2L 페어 인식 훈련",
      objective: "코너-엣지 페어를 찾고 오른손/왼손 삽입 중 적합한 경로를 고릅니다.",
      cameraGoal: "카메라가 현재 슬롯과 윗층 페어 위치를 확인한 뒤 케이스 후보를 좁힙니다.",
      deviceGoal: "장치 연결 시 특정 F2L 케이스로 섞고, 성공 후 다음 케이스를 자동 준비합니다.",
      checkpoints: ["페어 위치 확인", "분리/결합 상태 분류", "삽입 방향 선택", "Lookahead 기록"],
      suggestedAlgorithmIds: byStage.get("F2L") ?? [],
    },
    {
      id: "practice-oll",
      stageName: "OLL",
      title: "OLL 케이스 판별 훈련",
      objective: "윗면 패턴을 보고 2-Look 또는 Full OLL 공식을 선택합니다.",
      cameraGoal: "윗면 방향과 옆면 스티커를 인식해 OLL 케이스 후보를 표시합니다.",
      deviceGoal: "장치 연결 시 선택한 OLL 케이스로 섞고 사용자는 공식 수행만 반복합니다.",
      checkpoints: ["윗면 십자가 여부", "패턴 이름 확인", "공식 숨기기", "수행 시간 측정"],
      suggestedAlgorithmIds: byStage.get("OLL") ?? [],
    },
    {
      id: "practice-pll",
      stageName: "PLL",
      title: "PLL 비교 훈련",
      objective: "Aa, Ab, T, J, Y, H, Z 등 헷갈리는 PLL을 구분하고 수행 시간을 기록합니다.",
      cameraGoal: "OLL 완료 상태에서 조각 순열을 읽어 PLL 케이스 후보와 유사 케이스를 표시합니다.",
      deviceGoal: "장치 연결 시 특정 PLL 또는 약점 PLL로 섞고 성공/실패를 자동 기록합니다.",
      checkpoints: ["헤드라이트 확인", "바 위치 확인", "유사 케이스 비교", "평균 수행 시간 갱신"],
      suggestedAlgorithmIds: byStage.get("PLL") ?? [],
    },
  ];
}
