import { describe, expect, it, vi } from "vitest";
import { CameraAccessError, requestCameraStream } from "@/core/camera";

describe("camera access", () => {
  it("throws a domain error when media devices are unavailable", async () => {
    await expect(requestCameraStream(undefined)).rejects.toBeInstanceOf(CameraAccessError);
  });

  it("wraps getUserMedia failures", async () => {
    const mediaDevices = {
      getUserMedia: vi.fn().mockRejectedValue(new Error("denied")),
    } as unknown as MediaDevices;
    await expect(requestCameraStream(mediaDevices)).rejects.toBeInstanceOf(CameraAccessError);
  });
});
