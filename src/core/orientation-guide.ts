import { getMoveInstruction } from "@/core/moves";
import { STICKER_PLACEMENTS, VISUAL_FACE_COLORS, VISUAL_FACE_LABELS } from "@/core/cube-visualization";
import type { FaceName, Move, MoveFace, SliceMoveFace, WideMoveFace } from "@/core/models";

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
    { face: "L", label: "오른쪽", position: "right" },
  ],
  "white-top": [
    { face: "U", label: "위", position: "top" },
    { face: "F", label: "앞", position: "front" },
    { face: "R", label: "오른쪽", position: "right" },
  ],
};

const WHITE_BOTTOM_FACE_MAP: Record<FaceName, FaceName> = {
  U: "D",
  R: "L",
  F: "F",
  D: "U",
  L: "R",
  B: "B",
};

const WHITE_BOTTOM_WIDE_FACE_MAP: Record<WideMoveFace, WideMoveFace> = {
  u: "d",
  r: "l",
  f: "f",
  d: "u",
  l: "r",
  b: "b",
};

const WHITE_BOTTOM_SLICE_FACE_MAP: Record<SliceMoveFace, SliceMoveFace> = {
  M: "M",
  E: "E",
  S: "S",
};

const WHITE_BOTTOM_INVERTED_SLICE_FACES = new Set<SliceMoveFace>(["M", "E"]);
const STICKER_PLACEMENT_LOOKUP = new Map(STICKER_PLACEMENTS.map((placement) => [coordinateKey(placement.position, placement.normal), placement.index]));

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

export function orientStateForMode(stateString: string, mode: OrientationMode): string {
  if (mode !== "white-bottom" || stateString.length !== 54) return stateString;
  const next = stateString.split("");
  for (const placement of STICKER_PLACEMENTS) {
    const targetPosition = rotateWhiteBottomVector(placement.position);
    const targetNormal = rotateWhiteBottomVector(placement.normal);
    const targetIndex = STICKER_PLACEMENT_LOOKUP.get(coordinateKey(targetPosition, targetNormal));
    if (targetIndex !== undefined) {
      next[targetIndex] = stateString[placement.index];
    }
  }
  return next.join("");
}

export function orientMovesForMode(moves: Move[], mode: OrientationMode): Move[] {
  if (mode !== "white-bottom") return moves;
  return moves.map((move) => {
    const face = orientMoveFaceForWhiteBottom(move.face);
    const amount = shouldInvertWhiteBottomAmount(move.face) ? invertMoveAmount(move.amount) : move.amount;
    const notation = `${face}${amount === 2 ? "2" : amount === -1 ? "'" : ""}`;
    return {
      face,
      amount,
      notation,
      koreanInstruction: getMoveInstruction(notation),
    };
  });
}

function normalizeSymbol(value: string | undefined, fallback: FaceName): FaceName {
  return value === "U" || value === "R" || value === "F" || value === "D" || value === "L" || value === "B" ? value : fallback;
}

function orientMoveFaceForWhiteBottom(face: MoveFace): MoveFace {
  if (isSliceMoveFace(face)) return WHITE_BOTTOM_SLICE_FACE_MAP[face];
  if (isWideMoveFace(face)) return WHITE_BOTTOM_WIDE_FACE_MAP[face];
  return WHITE_BOTTOM_FACE_MAP[face];
}

function shouldInvertWhiteBottomAmount(face: MoveFace): boolean {
  return isSliceMoveFace(face) && WHITE_BOTTOM_INVERTED_SLICE_FACES.has(face);
}

function invertMoveAmount(amount: Move["amount"]): Move["amount"] {
  if (amount === 2) return 2;
  return amount === 1 ? -1 : 1;
}

function isSliceMoveFace(face: MoveFace): face is SliceMoveFace {
  return face === "M" || face === "E" || face === "S";
}

function isWideMoveFace(face: MoveFace): face is WideMoveFace {
  return face === face.toLowerCase();
}

function rotateWhiteBottomVector(vector: [number, number, number]): [number, number, number] {
  return [-vector[0], -vector[1], vector[2]];
}

function coordinateKey(position: [number, number, number], normal: [number, number, number]): string {
  return `${position.join(",")}|${normal.join(",")}`;
}
