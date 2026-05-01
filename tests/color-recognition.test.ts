import { describe, expect, it } from "vitest";
import { calibrateColorProfile, classifyStickerColor, createDefaultColorProfile, DEFAULT_COLOR_RGB } from "@/core/color-recognition";

describe("color recognition", () => {
  it("classifies calibrated sample colors", () => {
    const profile = createDefaultColorProfile();
    const result = classifyStickerColor(DEFAULT_COLOR_RGB.green, profile);
    expect(result.color).toBe("green");
    expect(result.confidence).toBeGreaterThan(0.3);
  });

  it("uses captured calibration samples for later classification", () => {
    const profile = calibrateColorProfile([
      { color: "white", rgb: { r: 220, g: 220, b: 210 } },
      { color: "yellow", rgb: { r: 210, g: 180, b: 40 } },
      { color: "red", rgb: { r: 180, g: 40, b: 45 } },
      { color: "orange", rgb: { r: 210, g: 110, b: 42 } },
      { color: "blue", rgb: { r: 38, g: 80, b: 150 } },
      { color: "green", rgb: { r: 40, g: 130, b: 80 } },
    ]);

    expect(classifyStickerColor({ r: 40, g: 130, b: 80 }, profile).color).toBe("green");
  });
});
