import { describe, expect, it } from "vitest";
import { getFaceScanGuidance, getNextScanFace } from "@/core/scan-guidance";

describe("scan guidance", () => {
  it("returns the next scan face in the fixed scan order", () => {
    expect(getNextScanFace("U")).toBe("R");
    expect(getNextScanFace("R")).toBe("F");
    expect(getNextScanFace("B")).toBeUndefined();
  });

  it("describes the expected center color for a face", () => {
    const guidance = getFaceScanGuidance("L");
    expect(guidance.expectedCenterColor).toBe("orange");
    expect(guidance.expectedCenterLabel).toBe("주황");
    expect(guidance.nextFace).toBe("B");
  });
});
