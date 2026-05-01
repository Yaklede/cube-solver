import { describe, expect, it } from "vitest";
import { SOLVED_STATE_STRING } from "@/core/cube-state";
import { applyAlgorithm } from "@/core/moves";
import { solveCubeState } from "@/core/solver";

describe("cube solver integration", () => {
  it("returns a library solution instead of the fallback for a simple scramble", async () => {
    const result = await solveCubeState(applyAlgorithm(SOLVED_STATE_STRING, "R"));

    expect(result.status).toBe("solution");
    expect(result.moves.length).toBeGreaterThan(0);
    expect(result.warnings).toEqual([]);
  });

  it("does not expose raw solver exceptions for impossible-but-count-balanced states", async () => {
    const impossibleState = `R${SOLVED_STATE_STRING.slice(1, 9)}U${SOLVED_STATE_STRING.slice(10)}`;
    const result = await solveCubeState(impossibleState);

    expect(result.status).toBe("fallback");
    expect(result.moves).toEqual([]);
    expect(result.warnings.join(" ")).not.toContain("Cannot read properties");
    expect(result.warnings.join(" ")).toContain("솔버가 해석할 수 없는 상태");
  });
});
