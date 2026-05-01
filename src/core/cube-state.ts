import type { CubeFace, CubeState, CubeSticker, CubeValidationResult, FaceName, ScanSession, StickerColor } from "@/core/models";

export const FACE_ORDER: FaceName[] = ["U", "R", "F", "D", "L", "B"];

export const SOLVED_STATE_STRING = "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";

export const FACE_COLORS: Record<FaceName, StickerColor> = {
  U: "white",
  R: "red",
  F: "green",
  D: "yellow",
  L: "orange",
  B: "blue",
};

export const COLOR_TO_FACE: Record<StickerColor, FaceName> = {
  white: "U",
  red: "R",
  green: "F",
  yellow: "D",
  orange: "L",
  blue: "B",
};

export function createSolvedFace(face: FaceName): CubeFace {
  const color = FACE_COLORS[face];
  return {
    name: face,
    centerColor: color,
    stickers: Array.from({ length: 9 }, (_, index) => ({
      id: `${face}-${index}`,
      face,
      index,
      color,
      confidence: 1,
    })),
  };
}

export function createEmptyScanSession(): ScanSession {
  return {
    id: `scan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    activeFace: "U",
    faceOrder: FACE_ORDER,
    faces: {},
  };
}

export function createCubeStateString(faces: Partial<Record<FaceName, CubeFace>>): string {
  return FACE_ORDER.map((face) => {
    const cubeFace = faces[face];
    if (!cubeFace || cubeFace.stickers.length !== 9) return "?".repeat(9);
    return cubeFace.stickers.map((sticker) => COLOR_TO_FACE[sticker.color] ?? "?").join("");
  }).join("");
}

export function validateCubeStateString(stateString: string): CubeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const colorCounts: Record<string, number> = {};

  for (const symbol of stateString) {
    colorCounts[symbol] = (colorCounts[symbol] ?? 0) + 1;
  }

  if (stateString.length !== 54) {
    errors.push("큐브 상태 문자열은 54자여야 합니다.");
  }

  const allowed = new Set<FaceName>(FACE_ORDER);
  for (const symbol of stateString) {
    if (!allowed.has(symbol as FaceName)) {
      errors.push(`알 수 없는 면 기호가 있습니다: ${symbol}`);
      break;
    }
  }

  for (const face of FACE_ORDER) {
    if ((colorCounts[face] ?? 0) !== 9) {
      errors.push(`${face} 색상은 정확히 9개여야 합니다. 현재 ${colorCounts[face] ?? 0}개입니다.`);
    }
  }

  const centers = [4, 13, 22, 31, 40, 49].map((index) => stateString[index]);
  if (new Set(centers).size !== 6) {
    errors.push("6개 중심 색상이 모두 달라야 합니다.");
  }

  if (stateString === SOLVED_STATE_STRING) {
    warnings.push("이미 맞춰진 큐브 상태입니다.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    colorCounts,
  };
}

export function buildCubeState(faces: Partial<Record<FaceName, CubeFace>>): CubeState {
  const completeFaces = FACE_ORDER.reduce(
    (acc, face) => {
      acc[face] = faces[face] ?? createSolvedFace(face);
      return acc;
    },
    {} as Record<FaceName, CubeFace>,
  );
  const stateString = createCubeStateString(completeFaces);
  return {
    faces: completeFaces,
    stateString,
    validation: validateCubeStateString(stateString),
    updatedAt: new Date().toISOString(),
  };
}

export function updateSticker(face: CubeFace, index: number, color: StickerColor): CubeFace {
  return {
    ...face,
    centerColor: index === 4 ? color : face.centerColor,
    stickers: face.stickers.map((sticker): CubeSticker => {
      if (sticker.index !== index) return sticker;
      return {
        ...sticker,
        color,
        confidence: 1,
        manuallyEdited: true,
      };
    }),
  };
}
