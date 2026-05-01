import { FACE_COLORS, FACE_ORDER } from "@/core/cube-state";
import type { FaceName, StickerColor } from "@/core/models";

export const COLOR_LABEL: Record<StickerColor, string> = {
  white: "흰색",
  yellow: "노랑",
  red: "빨강",
  orange: "주황",
  blue: "파랑",
  green: "초록",
};

export interface FaceScanGuidance {
  face: FaceName;
  expectedCenterColor: StickerColor;
  expectedCenterLabel: string;
  currentInstruction: string;
  nextFace?: FaceName;
  nextInstruction: string;
}

const FACE_INSTRUCTION: Record<FaceName, string> = {
  U: "흰색 센터를 카메라로 향하게 놓고 초록 센터가 아래쪽에 오게 잡으세요.",
  R: "시작 기준에서 큐브를 왼쪽으로 90도 굴려 빨강 센터를 카메라로 향하게 하세요. 흰색 센터는 위쪽입니다.",
  F: "시작 기준으로 돌아와 초록 센터를 카메라로 향하게 하세요. 흰색 센터는 위쪽입니다.",
  D: "노랑 센터를 카메라로 향하게 하세요. 초록 센터가 위쪽에 오도록 뒤집습니다.",
  L: "시작 기준에서 큐브를 오른쪽으로 90도 굴려 주황 센터를 카메라로 향하게 하세요. 흰색 센터는 위쪽입니다.",
  B: "시작 기준에서 큐브를 180도 돌려 파랑 센터를 카메라로 향하게 하세요. 흰색 센터는 위쪽입니다.",
};

export function getNextScanFace(face: FaceName): FaceName | undefined {
  const index = FACE_ORDER.indexOf(face);
  return FACE_ORDER[index + 1];
}

export function getFaceScanGuidance(face: FaceName): FaceScanGuidance {
  const nextFace = getNextScanFace(face);
  const expectedCenterColor = FACE_COLORS[face];
  return {
    face,
    expectedCenterColor,
    expectedCenterLabel: COLOR_LABEL[expectedCenterColor],
    currentInstruction: FACE_INSTRUCTION[face],
    nextFace,
    nextInstruction: nextFace ? `${face} 저장 후 ${nextFace} 면으로 이동합니다. ${FACE_INSTRUCTION[nextFace]}` : "마지막 면입니다. 저장 후 상태 문자열 검증으로 이동하세요.",
  };
}
