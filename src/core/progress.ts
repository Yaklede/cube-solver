import type { PracticeResult, UserProgress } from "@/core/models";

export const PROGRESS_STORAGE_KEY = "cube-solver-progress-v1";

export function createInitialProgress(): UserProgress {
  return {
    completedLessonIds: [],
    activeLessonIds: [],
    algorithmProgress: {},
    weakAlgorithmIds: [],
    confusedCaseIds: [],
  };
}

export function applyPracticeResult(progress: UserProgress, result: PracticeResult): UserProgress {
  const previous = progress.algorithmProgress[result.algorithmId] ?? {
    algorithmId: result.algorithmId,
    successCount: 0,
    failureCount: 0,
    averageTimeMs: 0,
    confusedWith: [],
    favorite: false,
  };
  const totalAttempts = previous.successCount + previous.failureCount;
  const averageTimeMs = totalAttempts === 0 ? result.elapsedMs : Math.round((previous.averageTimeMs * totalAttempts + result.elapsedMs) / (totalAttempts + 1));
  const nextRecord = {
    ...previous,
    successCount: previous.successCount + (result.success ? 1 : 0),
    failureCount: previous.failureCount + (result.success ? 0 : 1),
    averageTimeMs,
    bestTimeMs: result.success ? Math.min(previous.bestTimeMs ?? result.elapsedMs, result.elapsedMs) : previous.bestTimeMs,
    lastPracticedAt: result.createdAt,
  };

  const weakAlgorithmIds = new Set(progress.weakAlgorithmIds);
  if (nextRecord.failureCount > nextRecord.successCount) weakAlgorithmIds.add(result.algorithmId);
  if (nextRecord.successCount >= nextRecord.failureCount) weakAlgorithmIds.delete(result.algorithmId);

  return {
    ...progress,
    algorithmProgress: {
      ...progress.algorithmProgress,
      [result.algorithmId]: nextRecord,
    },
    weakAlgorithmIds: [...weakAlgorithmIds],
    lastStudyDate: result.createdAt,
  };
}

export function loadProgress(storage: Pick<Storage, "getItem">): UserProgress {
  const raw = storage.getItem(PROGRESS_STORAGE_KEY);
  if (!raw) return createInitialProgress();
  try {
    return {
      ...createInitialProgress(),
      ...JSON.parse(raw),
    };
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(storage: Pick<Storage, "setItem">, progress: UserProgress): void {
  storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}
