import { describe, expect, it } from "vitest";
import { SOLVED_STATE_STRING } from "@/core/cube-state";
import { applyAlgorithm, applyMoves, invertAlgorithm, parseAlgorithm, parseMove } from "@/core/moves";

describe("move parser and simulator", () => {
  it("parses standard rotation notation", () => {
    expect(parseMove("R").amount).toBe(1);
    expect(parseMove("U'").amount).toBe(-1);
    expect(parseMove("F2").amount).toBe(2);
    expect(parseMove("M2").amount).toBe(2);
  });

  it("parses and applies lowercase wide moves", () => {
    const move = parseMove("d'");
    expect(move.face).toBe("d");
    expect(move.amount).toBe(-1);
    expect(move.koreanInstruction).toContain("두 층");

    const moved = applyAlgorithm(SOLVED_STATE_STRING, "d");
    expect(moved).not.toBe(SOLVED_STATE_STRING);
    expect(applyAlgorithm(moved, "d'")).toBe(SOLVED_STATE_STRING);
    expect(applyAlgorithm(SOLVED_STATE_STRING, "b2 b2")).toBe(SOLVED_STATE_STRING);
  });

  it("parses and applies slice moves", () => {
    const move = parseMove("M2");
    expect(move.face).toBe("M");
    expect(move.koreanInstruction).toContain("가운데층");

    const moved = applyAlgorithm(SOLVED_STATE_STRING, "M");
    expect(moved).not.toBe(SOLVED_STATE_STRING);
    expect(applyAlgorithm(moved, "M'")).toBe(SOLVED_STATE_STRING);
    expect(applyAlgorithm(SOLVED_STATE_STRING, "M2 M2 E E' S S'")).toBe(SOLVED_STATE_STRING);
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
