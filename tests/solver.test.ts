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
});
