import { describe, expect, it } from "vitest";
import { calibrateColorProfile, classifyStickerColor, createDefaultColorProfile, DEFAULT_COLOR_RGB, updateColorProfileSample } from "@/core/color-recognition";

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

  it("separates red and orange samples under warm lighting", () => {
    const profile = createDefaultColorProfile();

    expect(classifyStickerColor({ r: 212, g: 58, b: 42 }, profile).color).toBe("red");
    expect(classifyStickerColor({ r: 218, g: 96, b: 35 }, profile).color).toBe("orange");
  });

  it("keeps red and orange separation after calibration", () => {
    const profile = calibrateColorProfile([
      { color: "white", rgb: { r: 230, g: 224, b: 214 } },
      { color: "yellow", rgb: { r: 224, g: 188, b: 45 } },
      { color: "red", rgb: { r: 180, g: 45, b: 42 } },
      { color: "orange", rgb: { r: 215, g: 98, b: 36 } },
      { color: "blue", rgb: { r: 38, g: 80, b: 150 } },
      { color: "green", rgb: { r: 40, g: 130, b: 80 } },
    ]);

    expect(classifyStickerColor({ r: 184, g: 48, b: 44 }, profile).color).toBe("red");
    expect(classifyStickerColor({ r: 210, g: 92, b: 34 }, profile).color).toBe("orange");
  });

  it("uses chromaticity to keep dim colors recognizable", () => {
    const profile = createDefaultColorProfile();

    expect(classifyStickerColor({ r: 126, g: 28, b: 30 }, profile).color).toBe("red");
    expect(classifyStickerColor({ r: 30, g: 82, b: 52 }, profile).color).toBe("green");
    expect(classifyStickerColor({ r: 28, g: 58, b: 112 }, profile).color).toBe("blue");
  });

  it("updates a single color sample without losing the rest of the profile", () => {
    const profile = updateColorProfileSample(createDefaultColorProfile(), "orange", { r: 194, g: 74, b: 24 });

    expect(classifyStickerColor({ r: 194, g: 74, b: 24 }, profile).color).toBe("orange");
    expect(classifyStickerColor(DEFAULT_COLOR_RGB.blue, profile).color).toBe("blue");
  });
});
