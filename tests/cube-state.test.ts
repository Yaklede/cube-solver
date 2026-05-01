import { describe, expect, it } from "vitest";
import { buildCubeState, createScanSessionFromStateString, createSolvedFace, FACE_ORDER, SOLVED_STATE_STRING, validateCubeStateString } from "@/core/cube-state";

describe("cube state", () => {
  it("generates a 54-character state string from six faces", () => {
    const faces = Object.fromEntries(FACE_ORDER.map((face) => [face, createSolvedFace(face)]));
    const state = buildCubeState(faces);
    expect(state.stateString).toBe(SOLVED_STATE_STRING);
    expect(state.stateString).toHaveLength(54);
  });

  it("validates exactly nine stickers for each color", () => {
    const validation = validateCubeStateString(SOLVED_STATE_STRING);
    expect(validation.valid).toBe(true);
    expect(validation.colorCounts.U).toBe(9);
    expect(validation.colorCounts.R).toBe(9);
  });

  it("detects malformed cube states", () => {
    const validation = validateCubeStateString("U".repeat(54));
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((error) => error.includes("R 색상"))).toBe(true);
    expect(validation.errors.some((error) => error.includes("중심 색상"))).toBe(true);
  });

  it("rebuilds an editable scan session from a state string", () => {
    const session = createScanSessionFromStateString(SOLVED_STATE_STRING, "F");
    const state = buildCubeState(session.faces);

    expect(session.activeFace).toBe("F");
    expect(FACE_ORDER.every((face) => session.faces[face]?.stickers.length === 9)).toBe(true);
    expect(session.faces.U?.stickers[0]).toMatchObject({ color: "white", confidence: 1, manuallyEdited: true });
    expect(session.faces.F?.centerColor).toBe("green");
    expect(state.stateString).toBe(SOLVED_STATE_STRING);
  });
});
