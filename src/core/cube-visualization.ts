import type { FaceName, Move } from "@/core/models";

export interface StickerPlacement {
  index: number;
  face: FaceName;
  position: [number, number, number];
  normal: [number, number, number];
}

export const VISUAL_CUBIE_SIZE = 0.62;
export const VISUAL_LOGICAL_SCALE = 0.72;
export const VISUAL_STICKER_SURFACE_OFFSET = VISUAL_CUBIE_SIZE / 2 + 0.018;

const FACE_START: Record<FaceName, number> = {
  U: 0,
  R: 9,
  F: 18,
  D: 27,
  L: 36,
  B: 45,
};

const FACE_TURN_SIGN: Record<FaceName, number> = {
  U: -1,
  R: -1,
  F: -1,
  D: 1,
  L: 1,
  B: 1,
};

export const VISUAL_FACE_COLORS: Record<FaceName, string> = {
  U: "#f8fafc",
  R: "#dc2626",
  F: "#16a34a",
  D: "#facc15",
  L: "#fb923c",
  B: "#2563eb",
};

export const VISUAL_FACE_LABELS: Record<FaceName, string> = {
  U: "흰색",
  R: "빨강",
  F: "초록",
  D: "노랑",
  L: "주황",
  B: "파랑",
};

export const STICKER_PLACEMENTS: StickerPlacement[] = buildStickerPlacements();

export function getMoveAxis(face: FaceName): 0 | 1 | 2 {
  if (face === "R" || face === "L") return 0;
  if (face === "U" || face === "D") return 1;
  return 2;
}

export function getMoveLayer(face: FaceName): number {
  return face === "R" || face === "U" || face === "F" ? 1 : -1;
}

export function getMoveAngle(move: Move, direction: 1 | -1 = 1): number {
  const amount = move.amount === 2 ? 2 : move.amount === -1 ? -1 : 1;
  return FACE_TURN_SIGN[move.face] * amount * direction * (Math.PI / 2);
}

export function getStickerRenderPosition(placement: StickerPlacement): [number, number, number] {
  return [
    placement.position[0] * VISUAL_LOGICAL_SCALE + placement.normal[0] * VISUAL_STICKER_SURFACE_OFFSET,
    placement.position[1] * VISUAL_LOGICAL_SCALE + placement.normal[1] * VISUAL_STICKER_SURFACE_OFFSET,
    placement.position[2] * VISUAL_LOGICAL_SCALE + placement.normal[2] * VISUAL_STICKER_SURFACE_OFFSET,
  ];
}

function buildStickerPlacements(): StickerPlacement[] {
  const placements: StickerPlacement[] = [];
  for (const face of ["U", "R", "F", "D", "L", "B"] as FaceName[]) {
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        const index = FACE_START[face] + row * 3 + col;
        placements[index] = {
          index,
          face,
          ...coordinateForFace(face, row, col),
        };
      }
    }
  }
  return placements;
}

function coordinateForFace(face: FaceName, row: number, col: number): Pick<StickerPlacement, "position" | "normal"> {
  const x = col - 1;
  const y = 1 - row;
  const z = row - 1;
  const reverseX = 1 - col;
  const reverseZ = 1 - row;

  switch (face) {
    case "U":
      return { position: [x, 1, z], normal: [0, 1, 0] };
    case "D":
      return { position: [x, -1, reverseZ], normal: [0, -1, 0] };
    case "F":
      return { position: [x, y, 1], normal: [0, 0, 1] };
    case "B":
      return { position: [reverseX, y, -1], normal: [0, 0, -1] };
    case "R":
      return { position: [1, y, reverseX], normal: [1, 0, 0] };
    case "L":
      return { position: [-1, y, x], normal: [-1, 0, 0] };
  }
}
