import type { Algorithm, Method } from "@/core/models";

export interface ValidationReport {
  valid: boolean;
  errors: string[];
}

const REQUIRED_ALGORITHM_FIELDS: Array<keyof Algorithm> = [
  "id",
  "methodName",
  "stageName",
  "caseName",
  "difficulty",
  "notation",
  "description",
  "prerequisites",
  "resultCondition",
  "tags",
  "alternatives",
  "leftHanded",
  "rightHanded",
  "favorite",
  "successCount",
  "failureCount",
  "averageTimeMs",
];

export function validateAlgorithms(algorithms: Algorithm[]): ValidationReport {
  const errors: string[] = [];
  const ids = new Set<string>();

  algorithms.forEach((algorithm, index) => {
    for (const field of REQUIRED_ALGORITHM_FIELDS) {
      if (algorithm[field] === undefined) errors.push(`algorithms[${index}] missing ${field}`);
    }
    if (ids.has(algorithm.id)) errors.push(`duplicate algorithm id: ${algorithm.id}`);
    ids.add(algorithm.id);
    if (!Array.isArray(algorithm.tags)) errors.push(`${algorithm.id} tags must be an array`);
    if (!Array.isArray(algorithm.alternatives)) errors.push(`${algorithm.id} alternatives must be an array`);
    if (!algorithm.notation.trim()) errors.push(`${algorithm.id} notation is empty`);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateMethods(methods: Method[]): ValidationReport {
  const errors: string[] = [];
  const methodIds = new Set<string>();
  const lessonIds = new Set<string>();

  methods.forEach((method, methodIndex) => {
    if (!method.id) errors.push(`methods[${methodIndex}] missing id`);
    if (!method.name) errors.push(`methods[${methodIndex}] missing name`);
    if (methodIds.has(method.id)) errors.push(`duplicate method id: ${method.id}`);
    methodIds.add(method.id);
    method.stages.forEach((stage, stageIndex) => {
      if (stage.methodId !== method.id) errors.push(`${stage.id} methodId must match ${method.id}`);
      stage.lessons.forEach((lesson, lessonIndex) => {
        if (lesson.stageId !== stage.id) errors.push(`${lesson.id} stageId must match ${stage.id}`);
        if (lessonIds.has(lesson.id)) errors.push(`duplicate lesson id: ${lesson.id}`);
        lessonIds.add(lesson.id);
        if (!lesson.title) errors.push(`methods[${methodIndex}].stages[${stageIndex}].lessons[${lessonIndex}] missing title`);
      });
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
