import type { ColorProfile, CubeFace, FaceName, RgbColor, CubeSticker } from "@/core/models";
import { classifyStickerColor, updateColorProfileSample } from "@/core/color-recognition";
import { FACE_COLORS } from "@/core/cube-state";

export const SCAN_GUIDE_RATIO = 0.64;
export const SCAN_CAPTURE_SIZE = 300;
export const LOW_CONFIDENCE_THRESHOLD = 0.55;
export const AUTO_SCAN_MIN_AVERAGE_CONFIDENCE = 0.68;
export const AUTO_SCAN_MAX_LOW_CONFIDENCE_COUNT = 2;
export const AUTO_SCAN_STABLE_FRAMES = 3;
export const AUTO_SCAN_COOLDOWN_MS = 1800;

export interface GuideCrop {
  x: number;
  y: number;
  size: number;
}

export interface FaceReadiness {
  ready: boolean;
  averageConfidence: number;
  minConfidence: number;
  lowConfidenceCount: number;
  centerMatchesExpected: boolean;
  expectedCenterColor: CubeSticker["color"];
  detectedCenterColor: CubeSticker["color"];
  reason: string;
}

export interface CenterCalibratedRecognition {
  face: CubeFace;
  profile: ColorProfile;
  expectedCenterColor: CubeSticker["color"];
  centerSample: RgbColor;
  averageConfidence: number;
}

export function calculateGuideCrop(
  videoWidth: number,
  videoHeight: number,
  elementWidth: number,
  elementHeight: number,
  guideRatio = SCAN_GUIDE_RATIO,
): GuideCrop {
  if (videoWidth <= 0 || videoHeight <= 0 || elementWidth <= 0 || elementHeight <= 0) {
    throw new Error("카메라 영상 크기를 확인할 수 없습니다.");
  }

  const scale = Math.max(elementWidth / videoWidth, elementHeight / videoHeight);
  const renderedWidth = videoWidth * scale;
  const renderedHeight = videoHeight * scale;
  const offsetX = (elementWidth - renderedWidth) / 2;
  const offsetY = (elementHeight - renderedHeight) / 2;
  const guideSize = Math.min(elementWidth, elementHeight) * guideRatio;
  const guideX = (elementWidth - guideSize) / 2;
  const guideY = (elementHeight - guideSize) / 2;

  const sourceX = (guideX - offsetX) / scale;
  const sourceY = (guideY - offsetY) / scale;
  const sourceSize = guideSize / scale;
  const safeSize = Math.min(sourceSize, videoWidth, videoHeight);

  return {
    x: Math.max(0, Math.min(videoWidth - safeSize, Math.round(sourceX))),
    y: Math.max(0, Math.min(videoHeight - safeSize, Math.round(sourceY))),
    size: Math.round(safeSize),
  };
}

export function captureGuideImageData(video: HTMLVideoElement, outputSize = SCAN_CAPTURE_SIZE): ImageData {
  const crop = calculateGuideCrop(video.videoWidth, video.videoHeight, video.clientWidth, video.clientHeight);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("카메라 프레임을 분석할 캔버스를 만들 수 없습니다.");
  }

  context.drawImage(video, crop.x, crop.y, crop.size, crop.size, 0, 0, outputSize, outputSize);
  return context.getImageData(0, 0, outputSize, outputSize);
}

export function recognizeFaceFromSamples(face: FaceName, samples: RgbColor[], profile: ColorProfile): CubeFace {
  if (samples.length !== 9) {
    throw new Error(`큐브 한 면은 9개 색상 샘플이 필요합니다. 현재 ${samples.length}개입니다.`);
  }

  const stickers: CubeSticker[] = samples.map((rgb, index) => {
    const result = classifyStickerColor(rgb, profile);
    return {
      id: `${face}-${index}`,
      face,
      index,
      color: result.color,
      confidence: result.confidence,
      rgb,
    };
  });

  return {
    name: face,
    centerColor: stickers[4].color,
    stickers,
  };
}

export function recognizeFaceWithExpectedCenterCalibration(
  face: FaceName,
  samples: RgbColor[],
  profile: ColorProfile,
): CenterCalibratedRecognition {
  if (samples.length !== 9) {
    throw new Error(`큐브 한 면은 9개 색상 샘플이 필요합니다. 현재 ${samples.length}개입니다.`);
  }

  const expectedCenterColor = FACE_COLORS[face];
  const centerSample = samples[4];
  const nextProfile = updateColorProfileSample(profile, expectedCenterColor, centerSample);
  const recognizedFace = recognizeFaceFromSamples(face, samples, nextProfile);
  const averageConfidence =
    recognizedFace.stickers.reduce((total, sticker) => total + sticker.confidence, 0) / recognizedFace.stickers.length;

  return {
    face: recognizedFace,
    profile: nextProfile,
    expectedCenterColor,
    centerSample,
    averageConfidence,
  };
}

export function getLowConfidenceStickerIndexes(face: CubeFace, threshold = LOW_CONFIDENCE_THRESHOLD): number[] {
  return face.stickers.filter((sticker) => !sticker.manuallyEdited && sticker.confidence < threshold).map((sticker) => sticker.index);
}

export function analyzeFaceReadiness(face: CubeFace): FaceReadiness {
  const confidences = face.stickers.map((sticker) => sticker.confidence);
  const averageConfidence = confidences.reduce((total, confidence) => total + confidence, 0) / confidences.length;
  const minConfidence = Math.min(...confidences);
  const lowConfidenceCount = getLowConfidenceStickerIndexes(face).length;
  const expectedCenterColor = FACE_COLORS[face.name];
  const detectedCenterColor = face.stickers[4]?.color ?? face.centerColor;
  const centerMatchesExpected = detectedCenterColor === expectedCenterColor;
  const ready =
    centerMatchesExpected && averageConfidence >= AUTO_SCAN_MIN_AVERAGE_CONFIDENCE && lowConfidenceCount <= AUTO_SCAN_MAX_LOW_CONFIDENCE_COUNT;

  return {
    ready,
    averageConfidence,
    minConfidence,
    lowConfidenceCount,
    centerMatchesExpected,
    expectedCenterColor,
    detectedCenterColor,
    reason: getReadinessReason(centerMatchesExpected, averageConfidence, lowConfidenceCount),
  };
}

function getReadinessReason(centerMatchesExpected: boolean, averageConfidence: number, lowConfidenceCount: number): string {
  if (!centerMatchesExpected) return "현재 스캔할 면의 센터 색상과 다릅니다.";
  if (averageConfidence < AUTO_SCAN_MIN_AVERAGE_CONFIDENCE) return "색상 신뢰도가 낮아 큐브를 조금 더 밝고 정면으로 맞추세요.";
  if (lowConfidenceCount > AUTO_SCAN_MAX_LOW_CONFIDENCE_COUNT) return "낮은 신뢰도 칸이 많아 재정렬이 필요합니다.";
  return "면이 안정적으로 맞춰졌습니다.";
}
