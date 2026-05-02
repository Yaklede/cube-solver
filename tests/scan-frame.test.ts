import { describe, expect, it } from "vitest";
import { classifyStickerColor, createDefaultColorProfile, DEFAULT_COLOR_RGB } from "@/core/color-recognition";
import {
  analyzeGuideFrameQuality,
  analyzeFaceReadiness,
  calculateGuideCrop,
  getLowConfidenceStickerIndexes,
  recognizeFaceFromSamples,
  recognizeFaceWithExpectedCenterCalibration,
  shouldLockAutoScanRecognition,
  shouldUseAutoScanFallback,
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

  it("rejects a blank white frame before it can be used as a white cube face", () => {
    const profile = createDefaultColorProfile();
    const blankFrame = createFrame(90, (x, y) => ({ r: 245, g: 245, b: 242 }));
    const frameQuality = analyzeGuideFrameQuality(blankFrame);
    const whiteFace = recognizeFaceFromSamples("U", Array.from({ length: 9 }, () => DEFAULT_COLOR_RGB.white), profile);
    const readiness = analyzeFaceReadiness(whiteFace, frameQuality);

    expect(frameQuality.cubePresent).toBe(false);
    expect(readiness.centerMatchesExpected).toBe(true);
    expect(readiness.ready).toBe(false);
    expect(shouldUseAutoScanFallback(readiness, 5, 3000, 0)).toBe(false);
    expect(shouldLockAutoScanRecognition(readiness, whiteFace)).toBe(false);
  });

  it("accepts a white face when cube grid separators are visible", () => {
    const profile = createDefaultColorProfile();
    const cubeFrame = createFrame(90, (x, y) => {
      const nearSeparator = [30, 60].some((line) => Math.abs(x - line) <= 2 || Math.abs(y - line) <= 2);
      return nearSeparator ? { r: 24, g: 24, b: 24 } : { r: 242, g: 241, b: 238 };
    });
    const frameQuality = analyzeGuideFrameQuality(cubeFrame);
    const whiteFace = recognizeFaceFromSamples("U", Array.from({ length: 9 }, () => DEFAULT_COLOR_RGB.white), profile);
    const readiness = analyzeFaceReadiness(whiteFace, frameQuality);

    expect(frameQuality.cubePresent).toBe(true);
    expect(readiness.ready).toBe(true);
  });

  it("uses manual recognition fallback after repeated alignment failures only for the expected center", () => {
    const profile = createDefaultColorProfile();
    const lowConfidenceFace = recognizeFaceFromSamples("F", Array.from({ length: 9 }, () => DEFAULT_COLOR_RGB.green), profile);
    lowConfidenceFace.stickers = lowConfidenceFace.stickers.map((sticker, index) =>
      index === 4 ? sticker : { ...sticker, confidence: 0.2 },
    );
    const readiness = analyzeFaceReadiness(lowConfidenceFace);

    expect(readiness.ready).toBe(false);
    expect(readiness.centerMatchesExpected).toBe(true);
    expect(shouldUseAutoScanFallback(readiness, 4, 3000, 0)).toBe(false);
    expect(shouldUseAutoScanFallback(readiness, 5, 3000, 0)).toBe(true);

    const wrongCenterFace = recognizeFaceFromSamples("F", Array.from({ length: 9 }, () => DEFAULT_COLOR_RGB.red), profile);
    expect(shouldUseAutoScanFallback(analyzeFaceReadiness(wrongCenterFace), 5, 3000, 0)).toBe(false);
  });

  it("locks auto recognition only when the color confidence is strong enough", () => {
    const profile = createDefaultColorProfile();
    const lockedFace = recognizeFaceFromSamples("F", Array.from({ length: 9 }, () => DEFAULT_COLOR_RGB.green), profile);
    const lockedReadiness = analyzeFaceReadiness(lockedFace);
    expect(lockedReadiness.ready).toBe(true);
    expect(shouldLockAutoScanRecognition(lockedReadiness, lockedFace)).toBe(true);

    const marginalFace = {
      ...lockedFace,
      stickers: lockedFace.stickers.map((sticker) => ({ ...sticker, confidence: 0.7 })),
    };
    const marginalReadiness = analyzeFaceReadiness(marginalFace);
    expect(marginalReadiness.ready).toBe(true);
    expect(shouldLockAutoScanRecognition(marginalReadiness, marginalFace)).toBe(false);

    const lowConfidenceFace = {
      ...lockedFace,
      stickers: lockedFace.stickers.map((sticker, index) => (index < 2 ? { ...sticker, confidence: 0.4 } : sticker)),
    };
    const lowConfidenceReadiness = analyzeFaceReadiness(lowConfidenceFace);
    expect(lowConfidenceReadiness.ready).toBe(true);
    expect(shouldLockAutoScanRecognition(lowConfidenceReadiness, lowConfidenceFace)).toBe(false);
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
    expect(result.calibrationApplied).toBe(true);
    expect(result.face.centerColor).toBe("red");
    expect(result.face.stickers[4].color).toBe("red");
    expect(classifyStickerColor(centerSample, result.profile).color).toBe("red");
    expect(result.averageConfidence).toBeGreaterThan(0.4);
  });

  it("skips center calibration when a center logo or glare reads as another color", () => {
    const profile = createDefaultColorProfile();
    const logoLikeCenterSample = { r: 63, g: 129, b: 201 };
    const samples = Array.from({ length: 9 }, () => DEFAULT_COLOR_RGB.white);
    samples[4] = logoLikeCenterSample;

    const result = recognizeFaceWithExpectedCenterCalibration("U", samples, profile);

    expect(result.centerDetectedColor).toBe("blue");
    expect(result.calibrationApplied).toBe(false);
    expect(result.face.centerColor).toBe("white");
    expect(result.face.stickers[4].color).toBe("white");
    expect(classifyStickerColor(logoLikeCenterSample, result.profile).color).toBe("blue");
  });
});

function createFrame(size: number, colorAt: (x: number, y: number) => { r: number; g: number; b: number }): ImageData {
  const data = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      const color = colorAt(x, y);
      data[offset] = color.r;
      data[offset + 1] = color.g;
      data[offset + 2] = color.b;
      data[offset + 3] = 255;
    }
  }
  return { data, width: size, height: size } as ImageData;
}
