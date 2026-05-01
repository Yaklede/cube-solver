import { describe, expect, it, vi } from "vitest";
import { SOLVED_STATE_STRING } from "@/core/cube-state";
import { applyAlgorithm } from "@/core/moves";

vi.mock("rubiks-cube-solver", () => ({
  default: () => ({ cross: ["U"], f2l: [], oll: [], pll: [] }),
  rubiksCubeSolver: () => ({ cross: ["U"], f2l: [], oll: [], pll: [] }),
}));

describe("solver output verification", () => {
  it("does not expose an unverified solver result as a usable solution", async () => {
    const { solveCubeState } = await import("@/core/solver");
    const result = await solveCubeState(applyAlgorithm(SOLVED_STATE_STRING, "R"));

    expect(result.status).toBe("fallback");
    expect(result.moves).toEqual([]);
    expect(result.summary).toContain("앱 검증");
    expect(result.warnings.join(" ")).toContain("검증을 통과하지 못했습니다");
  });
});
