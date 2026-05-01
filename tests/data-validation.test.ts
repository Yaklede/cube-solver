import { describe, expect, it } from "vitest";
import { validateAlgorithms, validateMethods } from "@/core/data-validation";
import { algorithms, methods } from "@/data/catalog";

describe("learning data validation", () => {
  it("accepts the bundled method and algorithm data", () => {
    expect(validateMethods(methods).errors).toEqual([]);
    expect(validateAlgorithms(algorithms).errors).toEqual([]);
  });

  it("detects duplicate algorithm ids", () => {
    const duplicate = [algorithms[0], algorithms[0]];
    const report = validateAlgorithms(duplicate);
    expect(report.valid).toBe(false);
    expect(report.errors.some((error) => error.includes("duplicate algorithm id"))).toBe(true);
  });
});
