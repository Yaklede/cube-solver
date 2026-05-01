export class CameraAccessError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "CameraAccessError";
  }
}

export async function requestCameraStream(
  mediaDevices: MediaDevices | undefined,
  constraints: MediaStreamConstraints = { video: { facingMode: "environment" }, audio: false },
): Promise<MediaStream> {
  if (!mediaDevices?.getUserMedia) {
    throw new CameraAccessError("이 환경에서는 카메라 API를 사용할 수 없습니다.");
  }

  try {
    return await mediaDevices.getUserMedia(constraints);
  } catch (error) {
    throw new CameraAccessError("카메라 권한을 확인하거나 다른 카메라 장치를 선택하세요.", error);
  }
}
