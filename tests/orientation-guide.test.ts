import { describe, expect, it } from "vitest";
import { SOLVED_STATE_STRING } from "@/core/cube-state";
import { buildOrientationGuide, formatOrientationInstruction } from "@/core/orientation-guide";

describe("solver orientation guide", () => {
  it("builds a start grip guide from center stickers", () => {
    const guide = buildOrientationGuide(SOLVED_STATE_STRING);

    expect(guide.map((item) => `${item.label}:${item.colorName}`)).toEqual(["위:흰색", "앞:초록", "오른쪽:빨강"]);
    expect(formatOrientationInstruction(guide)).toBe("흰색 센터를 위, 초록 센터를 앞, 빨강 센터를 오른쪽으로 잡고 첫 수를 시작하세요.");
  });
});
