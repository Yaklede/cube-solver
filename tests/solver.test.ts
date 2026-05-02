import { describe, expect, it } from "vitest";
import { SOLVED_STATE_STRING } from "@/core/cube-state";
import { applyAlgorithm, applyMoves } from "@/core/moves";
import { solveCubeState } from "@/core/solver";

const README_EXAMPLE_APP_STATE = "DBBBURRFBRUDRRUDDLFLULFBDDRLLFFDRUBFRLUDLUBRFLUBFBFUDL";

describe("cube solver integration", () => {
  it("returns a library solution instead of the fallback for a simple scramble", async () => {
    const result = await solveCubeState(applyAlgorithm(SOLVED_STATE_STRING, "R"));

    expect(result.status).toBe("solution");
    expect(result.moves.length).toBeGreaterThan(0);
    expect(result.warnings).toEqual([]);
    expect(applyMoves(result.stateString, result.moves)).toBe(SOLVED_STATE_STRING);
  });

  it("does not expose raw solver exceptions for impossible-but-count-balanced states", async () => {
    const impossibleState = `R${SOLVED_STATE_STRING.slice(1, 9)}U${SOLVED_STATE_STRING.slice(10)}`;
    const result = await solveCubeState(impossibleState);

    expect(result.status).toBe("fallback");
    expect(result.moves).toEqual([]);
    expect(result.warnings.join(" ")).not.toContain("Cannot read properties");
    expect(result.warnings.join(" ")).toContain("솔버가 해석할 수 없는 상태");
  });

  it("rejects malformed scanned strings before invoking the solver", async () => {
    const reportedState = "DUUUUUDUUURRRRRRLBLBFFDFFDFUFLBDDDDBFLLLDLRRLRBBFBBFULD";
    const result = await solveCubeState(reportedState);

    expect(result.status).toBe("invalid");
    expect(result.moves).toEqual([]);
    expect(result.warnings).toContain("큐브 상태 문자열은 54자여야 합니다.");
  });

  it("keeps solver wide moves when verifying longer library solutions", async () => {
    const result = await solveCubeState(README_EXAMPLE_APP_STATE);

    expect(result.status).toBe("solution");
    expect(result.moves.some((move) => move.face === move.face.toLowerCase())).toBe(true);
    expect(result.warnings).toEqual([]);
    expect(applyMoves(result.stateString, result.moves)).toBe(SOLVED_STATE_STRING);
  });
});
