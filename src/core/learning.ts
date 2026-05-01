import type { Algorithm, AlgorithmFilters, Method } from "@/core/models";

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

export function flattenLessons(methods: Method[]) {
  return methods.flatMap((method) =>
    method.stages.flatMap((stage) =>
      stage.lessons.map((lesson) => ({
        ...lesson,
        methodName: method.name,
        stageName: stage.name,
      })),
    ),
  );
}

export function getMethodById(methods: Method[], id: string): Method | undefined {
  return methods.find((method) => method.id === id);
}
