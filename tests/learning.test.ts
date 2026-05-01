import { describe, expect, it } from "vitest";
import { buildGuidedPracticePlans, buildStageSummaries, filterAlgorithms, flattenLessons, getLessonAlgorithms } from "@/core/learning";
import { algorithms, methods } from "@/data/catalog";

describe("learning data", () => {
  it("loads curriculum data with required methods", () => {
    const methodNames = methods.map((method) => method.name);
    expect(methodNames).toContain("왕초보 과정");
    expect(methodNames).toContain("초보 과정");
    expect(methodNames).toContain("CFOP");
    expect(methodNames).toContain("Roux");
    expect(flattenLessons(methods).length).toBeGreaterThan(0);
  });

  it("filters algorithms by query and stage", () => {
    expect(filterAlgorithms(algorithms, { query: "sune" }).map((item) => item.id)).toContain("alg-oll-sune");
    expect(filterAlgorithms(algorithms, { stageName: "PLL" }).every((item) => item.stageName === "PLL")).toBe(true);
  });

  it("summarizes stages with lesson minutes and algorithm counts", () => {
    const summaries = buildStageSummaries(methods, algorithms);
    const ollSummary = summaries.find((summary) => summary.stageName === "OLL");

    expect(ollSummary).toMatchObject({
      methodName: "CFOP",
      lessonCount: 1,
      algorithmCount: 1,
      estimatedMinutes: 20,
    });
  });

  it("connects selected lessons to required algorithm cards", () => {
    const lesson = flattenLessons(methods).find((item) => item.id === "two-look-pll");

    expect(getLessonAlgorithms(lesson, algorithms).map((algorithm) => algorithm.id)).toEqual(["alg-pll-t-perm", "alg-pll-h-perm"]);
  });

  it("builds camera and future device practice plans for core CFOP stages", () => {
    const plans = buildGuidedPracticePlans(algorithms);

    expect(plans.map((plan) => plan.stageName)).toEqual(["D-Cross", "F2L", "OLL", "PLL"]);
    expect(plans.find((plan) => plan.stageName === "OLL")?.cameraGoal).toContain("OLL");
    expect(plans.find((plan) => plan.stageName === "F2L")?.deviceGoal).toContain("F2L");
  });
});
