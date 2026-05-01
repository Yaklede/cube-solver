import { describe, expect, it } from "vitest";
import { applyPracticeResult, createInitialProgress, loadProgress, saveProgress } from "@/core/progress";
import type { PracticeResult } from "@/core/models";

describe("progress persistence", () => {
  it("updates success and failure counts", () => {
    const result: PracticeResult = {
      id: "result-1",
      algorithmId: "alg-oll-sune",
      success: false,
      elapsedMs: 4200,
      verifiedByCamera: true,
      createdAt: "2026-05-01T00:00:00.000Z",
    };
    const progress = applyPracticeResult(createInitialProgress(), result);
    expect(progress.algorithmProgress["alg-oll-sune"].failureCount).toBe(1);
    expect(progress.weakAlgorithmIds).toContain("alg-oll-sune");
  });

  it("saves and loads progress through storage", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    };
    const progress = createInitialProgress();
    progress.completedLessonIds.push("cube-structure");
    saveProgress(storage, progress);
    expect(loadProgress(storage).completedLessonIds).toContain("cube-structure");
  });
});
