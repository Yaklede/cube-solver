import { VISUAL_FACE_COLORS, VISUAL_FACE_LABELS } from "@/core/cube-visualization";
import type { FaceName } from "@/core/models";

interface OrientationTarget {
  face: FaceName;
  label: string;
  position: "top" | "bottom" | "front" | "right";
}

export type OrientationMode = "white-bottom" | "white-top";

export interface OrientationGuideItem {
  face: FaceName;
  label: string;
  position: OrientationTarget["position"];
  symbol: FaceName;
  colorName: string;
  colorHex: string;
}

const CENTER_INDEX: Record<FaceName, number> = {
  U: 4,
  R: 13,
  F: 22,
  D: 31,
  L: 40,
  B: 49,
};

const PRIMARY_TARGETS: Record<OrientationMode, OrientationTarget[]> = {
  "white-bottom": [
    { face: "U", label: "아래", position: "bottom" },
    { face: "F", label: "앞", position: "front" },
    { face: "R", label: "오른쪽", position: "right" },
  ],
  "white-top": [
    { face: "U", label: "위", position: "top" },
    { face: "F", label: "앞", position: "front" },
    { face: "R", label: "오른쪽", position: "right" },
  ],
};

export function buildOrientationGuide(stateString: string, mode: OrientationMode = "white-bottom"): OrientationGuideItem[] {
  return PRIMARY_TARGETS[mode].map((target) => {
    const symbol = normalizeSymbol(stateString[CENTER_INDEX[target.face]], target.face);
    return {
      face: target.face,
      label: target.label,
      position: target.position,
      symbol,
      colorName: VISUAL_FACE_LABELS[symbol],
      colorHex: VISUAL_FACE_COLORS[symbol],
    };
  });
}

export function formatOrientationInstruction(items: OrientationGuideItem[]): string {
  const vertical = items.find((item) => item.position === "top" || item.position === "bottom");
  const front = items.find((item) => item.position === "front");
  const right = items.find((item) => item.position === "right");
  if (!vertical || !front || !right) return "3D 큐브와 같은 방향으로 실제 큐브를 잡고 첫 수를 시작하세요.";
  return `${vertical.colorName} 센터를 ${vertical.label}, ${front.colorName} 센터를 앞, ${right.colorName} 센터를 오른쪽으로 잡고 첫 수를 시작하세요.`;
}

function normalizeSymbol(value: string | undefined, fallback: FaceName): FaceName {
  return value === "U" || value === "R" || value === "F" || value === "D" || value === "L" || value === "B" ? value : fallback;
}
