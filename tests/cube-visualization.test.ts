import { describe, expect, it } from "vitest";
import { getMoveAngle, getMoveAxis, getMoveLayer, STICKER_PLACEMENTS, VISUAL_FACE_COLORS } from "@/core/cube-visualization";
import { parseMove } from "@/core/moves";
import type { FaceName } from "@/core/models";

describe("cube visualization mapping", () => {
  it("creates one placement for every sticker", () => {
    const counts = STICKER_PLACEMENTS.reduce<Record<FaceName, number>>(
      (accumulator, placement) => {
        accumulator[placement.face] += 1;
        return accumulator;
      },
      { U: 0, R: 0, F: 0, D: 0, L: 0, B: 0 },
    );

    expect(STICKER_PLACEMENTS).toHaveLength(54);
    expect(new Set(STICKER_PLACEMENTS.map((placement) => placement.index)).size).toBe(54);
    expect(counts).toEqual({ U: 9, R: 9, F: 9, D: 9, L: 9, B: 9 });
  });

  it("maps standard turns to the expected 3D axis and layer", () => {
    expect(getMoveAxis("R")).toBe(0);
    expect(getMoveAxis("U")).toBe(1);
    expect(getMoveAxis("F")).toBe(2);
    expect(getMoveLayer("R")).toBe(1);
    expect(getMoveLayer("B")).toBe(-1);
  });

  it("derives clockwise, inverse, and double turn animation angles", () => {
    expect(getMoveAngle(parseMove("R"))).toBeCloseTo(-Math.PI / 2);
    expect(getMoveAngle(parseMove("R'"))).toBeCloseTo(Math.PI / 2);
    expect(getMoveAngle(parseMove("U2"))).toBeCloseTo(-Math.PI);
  });

  it("defines stable colors for all cube faces", () => {
    expect(Object.keys(VISUAL_FACE_COLORS).sort()).toEqual(["B", "D", "F", "L", "R", "U"]);
  });
});
