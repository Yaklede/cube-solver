import { describe, expect, it } from "vitest";
import {
  getMoveAngle,
  getMoveAxis,
  getMoveLayer,
  getMoveLayers,
  getStickerRenderPosition,
  STICKER_PLACEMENTS,
  VISUAL_CUBIE_SIZE,
  VISUAL_FACE_COLORS,
  VISUAL_LOGICAL_SCALE,
} from "@/core/cube-visualization";
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

  it("maps wide turns to outer and middle 3D layers", () => {
    expect(getMoveAxis("d")).toBe(1);
    expect(getMoveLayers("D")).toEqual([-1]);
    expect(getMoveLayers("d")).toEqual([-1, 0]);
    expect(getMoveLayers("b")).toEqual([-1, 0]);
  });

  it("maps slice turns to the middle 3D layer", () => {
    expect(getMoveAxis("M")).toBe(0);
    expect(getMoveAxis("E")).toBe(1);
    expect(getMoveAxis("S")).toBe(2);
    expect(getMoveLayers("M")).toEqual([0]);
    expect(getMoveLayer("E")).toBe(0);
  });

  it("derives clockwise, inverse, and double turn animation angles", () => {
    expect(getMoveAngle(parseMove("R"))).toBeCloseTo(-Math.PI / 2);
    expect(getMoveAngle(parseMove("R'"))).toBeCloseTo(Math.PI / 2);
    expect(getMoveAngle(parseMove("U2"))).toBeCloseTo(-Math.PI);
    expect(getMoveAngle(parseMove("M2"))).toBeCloseTo(Math.PI);
  });

  it("defines stable colors for all cube faces", () => {
    expect(Object.keys(VISUAL_FACE_COLORS).sort()).toEqual(["B", "D", "F", "L", "R", "U"]);
  });

  it("places stickers outside the cubie surface", () => {
    for (const placement of STICKER_PLACEMENTS) {
      const position = getStickerRenderPosition(placement);
      const cubieCenter = placement.position.map((value) => value * VISUAL_LOGICAL_SCALE);
      const offsetFromCenter =
        (position[0] - cubieCenter[0]) * placement.normal[0] +
        (position[1] - cubieCenter[1]) * placement.normal[1] +
        (position[2] - cubieCenter[2]) * placement.normal[2];

      expect(offsetFromCenter).toBeGreaterThan(VISUAL_CUBIE_SIZE / 2);
    }
  });
});
