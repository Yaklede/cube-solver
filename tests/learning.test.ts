import { describe, expect, it } from "vitest";
import { filterAlgorithms, flattenLessons } from "@/core/learning";
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
});
