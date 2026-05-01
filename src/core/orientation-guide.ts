import { VISUAL_FACE_COLORS, VISUAL_FACE_LABELS } from "@/core/cube-visualization";
import type { FaceName } from "@/core/models";

interface OrientationTarget {
  face: FaceName;
  label: string;
}

export interface OrientationGuideItem {
  face: FaceName;
  label: string;
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

const PRIMARY_TARGETS: OrientationTarget[] = [
  { face: "U", label: "위" },
  { face: "F", label: "앞" },
  { face: "R", label: "오른쪽" },
];

export function buildOrientationGuide(stateString: string): OrientationGuideItem[] {
  return PRIMARY_TARGETS.map((target) => {
    const symbol = normalizeSymbol(stateString[CENTER_INDEX[target.face]], target.face);
    return {
      face: target.face,
      label: target.label,
      symbol,
      colorName: VISUAL_FACE_LABELS[symbol],
      colorHex: VISUAL_FACE_COLORS[symbol],
    };
  });
}

export function formatOrientationInstruction(items: OrientationGuideItem[]): string {
  const byFace = new Map(items.map((item) => [item.face, item]));
  const top = byFace.get("U");
  const front = byFace.get("F");
  const right = byFace.get("R");
  if (!top || !front || !right) return "3D 큐브와 같은 방향으로 실제 큐브를 잡고 첫 수를 시작하세요.";
  return `${top.colorName} 센터를 위, ${front.colorName} 센터를 앞, ${right.colorName} 센터를 오른쪽으로 잡고 첫 수를 시작하세요.`;
}

function normalizeSymbol(value: string | undefined, fallback: FaceName): FaceName {
  return value === "U" || value === "R" || value === "F" || value === "D" || value === "L" || value === "B" ? value : fallback;
}
