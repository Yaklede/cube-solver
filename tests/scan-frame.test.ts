import { describe, expect, it } from "vitest";
import { createDefaultColorProfile, DEFAULT_COLOR_RGB } from "@/core/color-recognition";
import { calculateGuideCrop, getLowConfidenceStickerIndexes, recognizeFaceFromSamples } from "@/core/scan-frame";

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
});
