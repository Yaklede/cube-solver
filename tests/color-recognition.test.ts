import { describe, expect, it } from "vitest";
import { classifyStickerColor, createDefaultColorProfile, DEFAULT_COLOR_RGB } from "@/core/color-recognition";

describe("color recognition", () => {
  it("classifies calibrated sample colors", () => {
    const profile = createDefaultColorProfile();
    const result = classifyStickerColor(DEFAULT_COLOR_RGB.green, profile);
    expect(result.color).toBe("green");
    expect(result.confidence).toBeGreaterThan(0.3);
  });
});
