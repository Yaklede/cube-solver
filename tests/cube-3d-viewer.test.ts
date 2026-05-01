import { describe, expect, it } from "vitest";
import {
  CUBE_IDLE_ROTATION_RADIANS_PER_FRAME,
  formatRenderedMoveStatus,
} from "@/features/solver/components/Cube3DViewer";

describe("3D cube viewer status", () => {
  it("keeps the cube still while idle", () => {
    expect(CUBE_IDLE_ROTATION_RADIANS_PER_FRAME).toBe(0);
  });

  it("labels the rendered cube state by applied move count instead of a separate formula", () => {
    expect(formatRenderedMoveStatus(0, 0)).toBe("현재 상태");
    expect(formatRenderedMoveStatus(0, 49)).toBe("시작 상태 · 0 / 49");
    expect(formatRenderedMoveStatus(1, 49)).toBe("1수 반영 · 1 / 49");
    expect(formatRenderedMoveStatus(49, 49)).toBe("완료 상태 · 49 / 49");
  });
});
