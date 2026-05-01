import { describe, expect, it } from "vitest";
import { SOLVED_STATE_STRING } from "@/core/cube-state";
import { applyAlgorithm, applyMoves, invertAlgorithm, parseAlgorithm, parseMove } from "@/core/moves";

describe("move parser and simulator", () => {
  it("parses standard rotation notation", () => {
    expect(parseMove("R").amount).toBe(1);
    expect(parseMove("U'").amount).toBe(-1);
    expect(parseMove("F2").amount).toBe(2);
    expect(() => parseMove("M2")).toThrow();
  });

  it("applies an algorithm and its inverse", () => {
    const algorithm = "R U R' U'";
    const scrambled = applyAlgorithm(SOLVED_STATE_STRING, algorithm);
    const restored = applyAlgorithm(scrambled, invertAlgorithm(algorithm));
    expect(restored).toBe(SOLVED_STATE_STRING);
  });

  it("returns to the same state after four quarter turns", () => {
    expect(applyAlgorithm(SOLVED_STATE_STRING, "R R R R")).toBe(SOLVED_STATE_STRING);
  });

  it("parses multi-move algorithms", () => {
    expect(parseAlgorithm("R U R' U'")).toHaveLength(4);
  });

  it("applies a parsed move array", () => {
    const algorithm = "R U R' U'";
    expect(applyMoves(SOLVED_STATE_STRING, parseAlgorithm(algorithm))).toBe(applyAlgorithm(SOLVED_STATE_STRING, algorithm));
  });
});
