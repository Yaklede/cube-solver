import { describe, expect, it } from "vitest";
import { classifyStickerColor, createDefaultColorProfile, DEFAULT_COLOR_RGB } from "@/core/color-recognition";
import {
  analyzeFaceReadiness,
  calculateGuideCrop,
  getLowConfidenceStickerIndexes,
  recognizeFaceFromSamples,
  recognizeFaceWithExpectedCenterCalibration,
} from "@/core/scan-frame";

describe("scan frame helpers", () => {
  it("calculates a centered square crop for cover-fitted video", () => {
    const crop = calculateGuideCrop(1920, 1080, 800, 500);
    expect(crop.size).toBeGreaterThan(680);
    expect(crop.size).toBeLessThan(700);
    expect(crop.x).toBeGreaterThan(500);
    expect(crop.y).toBeGreaterThan(180);
  });

  it("recognizes a face from nine rgb samples", () => {
    const profile = createDefaultColorProfile();
    const samples = Array.from({ length: 9 }, () => DEFAULT_COLOR_RGB.green);
    const face = recognizeFaceFromSamples("F", samples, profile);
    expect(face.stickers).toHaveLength(9);
    expect(face.centerColor).toBe("green");
    expect(face.stickers.every((sticker) => sticker.color === "green")).toBe(true);
  });

  it("returns low confidence stickers that still need review", () => {
    const profile = createDefaultColorProfile();
    const face = recognizeFaceFromSamples("F", Array.from({ length: 9 }, () => DEFAULT_COLOR_RGB.green), profile);
    face.stickers[1] = { ...face.stickers[1], confidence: 0.4 };
    face.stickers[2] = { ...face.stickers[2], confidence: 0.4, manuallyEdited: true };
    expect(getLowConfidenceStickerIndexes(face)).toEqual([1]);
  });

  it("marks a face ready only when the expected center matches", () => {
    const profile = createDefaultColorProfile();
    const readyFace = recognizeFaceFromSamples("F", Array.from({ length: 9 }, () => DEFAULT_COLOR_RGB.green), profile);
    expect(analyzeFaceReadiness(readyFace).ready).toBe(true);

    const wrongCenterFace = recognizeFaceFromSamples("F", Array.from({ length: 9 }, () => DEFAULT_COLOR_RGB.red), profile);
    expect(analyzeFaceReadiness(wrongCenterFace).ready).toBe(false);
    expect(analyzeFaceReadiness(wrongCenterFace).centerMatchesExpected).toBe(false);
  });

  it("uses the expected center sticker to adapt recognition for the active face", () => {
    const profile = createDefaultColorProfile();
    const centerSample = { r: 190, g: 64, b: 34 };
    const samples = [
      { r: 232, g: 110, b: 36 },
      DEFAULT_COLOR_RGB.red,
      DEFAULT_COLOR_RGB.white,
      DEFAULT_COLOR_RGB.yellow,
      centerSample,
      DEFAULT_COLOR_RGB.blue,
      DEFAULT_COLOR_RGB.green,
      DEFAULT_COLOR_RGB.red,
      DEFAULT_COLOR_RGB.white,
    ];

    const result = recognizeFaceWithExpectedCenterCalibration("R", samples, profile);

    expect(result.expectedCenterColor).toBe("red");
    expect(result.face.centerColor).toBe("red");
    expect(result.face.stickers[4].color).toBe("red");
    expect(classifyStickerColor(centerSample, result.profile).color).toBe("red");
    expect(result.averageConfidence).toBeGreaterThan(0.4);
  });
});
