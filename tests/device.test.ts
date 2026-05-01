import { describe, expect, it } from "vitest";
import { DEVICE_PRACTICE_PLANS, createDeviceCommandPreview } from "@/core/device";

describe("device practice contract", () => {
  it("covers full solve, full scramble, and CFOP drill modes", () => {
    expect(DEVICE_PRACTICE_PLANS.map((plan) => plan.mode)).toEqual(["full-solve", "full-scramble", "d-cross", "f2l", "oll", "pll"]);
  });

  it("creates a confirmation-gated command preview for practice cases", () => {
    const ollPlan = DEVICE_PRACTICE_PLANS.find((plan) => plan.mode === "oll");
    expect(ollPlan).toBeDefined();

    const preview = createDeviceCommandPreview(ollPlan!, {
      targetCaseId: "alg-oll-sune",
      notation: "R U R' U R U2 R'",
    });

    expect(preview).toMatchObject({
      type: "setup-practice-case",
      mode: "oll",
      targetStage: "OLL",
      targetCaseId: "alg-oll-sune",
      requiresCameraCheck: true,
      requiresUserConfirmation: true,
      holdReference: {
        up: "U",
        front: "F",
        right: "R",
      },
    });
    expect(preview.safetyChecklist.length).toBeGreaterThan(0);
  });

  it("uses solve command type only for the full solve mode", () => {
    const fullSolvePlan = DEVICE_PRACTICE_PLANS.find((plan) => plan.mode === "full-solve");
    const fullScramblePlan = DEVICE_PRACTICE_PLANS.find((plan) => plan.mode === "full-scramble");

    expect(createDeviceCommandPreview(fullSolvePlan!).type).toBe("solve");
    expect(createDeviceCommandPreview(fullScramblePlan!).type).toBe("scramble");
  });
});
