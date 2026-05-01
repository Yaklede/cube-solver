import type { FaceName, Move } from "@/core/models";

const MOVE_PATTERN = /^([URFDLB])([2']?)$/;

const FACE_INSTRUCTIONS: Record<FaceName, string> = {
  U: "윗면",
  R: "오른쪽 면",
  F: "앞면",
  D: "아랫면",
  L: "왼쪽 면",
  B: "뒷면",
};

interface StickerCoordinate {
  position: [number, number, number];
  normal: [number, number, number];
}

const FACE_START: Record<FaceName, number> = {
  U: 0,
  R: 9,
  F: 18,
  D: 27,
  L: 36,
  B: 45,
};

const FACE_BY_NORMAL = new Map<string, FaceName>([
  ["0,1,0", "U"],
  ["1,0,0", "R"],
  ["0,0,1", "F"],
  ["0,-1,0", "D"],
  ["-1,0,0", "L"],
  ["0,0,-1", "B"],
]);

const MOVE_ANGLE: Record<FaceName, number> = {
  U: -1,
  R: -1,
  F: -1,
  D: 1,
  L: 1,
  B: 1,
};

export function parseMove(notation: string): Move {
  const match = notation.trim().match(MOVE_PATTERN);
  if (!match) {
    throw new Error(`지원하지 않는 회전 표기법입니다: ${notation}`);
  }
  const face = match[1] as FaceName;
  const suffix = match[2];
  const amount = suffix === "2" ? 2 : suffix === "'" ? -1 : 1;
  return {
    face,
    amount,
    notation: `${face}${suffix}`,
    koreanInstruction: getMoveInstruction(`${face}${suffix}`),
  };
}

export function parseAlgorithm(algorithm: string): Move[] {
  if (!algorithm.trim()) return [];
  return algorithm
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parseMove);
}

export function getMoveInstruction(notation: string): string {
  const move = parseMoveWithoutInstruction(notation);
  const faceLabel = FACE_INSTRUCTIONS[move.face];
  if (move.amount === 2) return `${faceLabel}을 180도 돌리세요.`;
  if (move.amount === -1) return `${faceLabel}을 반시계 방향으로 90도 돌리세요.`;
  return `${faceLabel}을 시계 방향으로 90도 돌리세요.`;
}

export function applyAlgorithm(stateString: string, algorithm: string): string {
  return parseAlgorithm(algorithm).reduce((state, move) => applyMove(state, move), stateString);
}

export function applyMoves(stateString: string, moves: Move[]): string {
  return moves.reduce((state, move) => applyMove(state, move), stateString);
}

export function invertAlgorithm(algorithm: string): string {
  return parseAlgorithm(algorithm)
    .toReversed()
    .map((move) => {
      if (move.amount === 2) return move.notation;
      return move.amount === 1 ? `${move.face}'` : move.face;
    })
    .join(" ");
}

function applyMove(stateString: string, move: Move): string {
  const turns = move.amount === 2 ? 2 : move.amount === -1 ? 3 : 1;
  let state = stateString;
  for (let index = 0; index < turns; index += 1) {
    state = applyQuarterTurn(state, move.face);
  }
  return state;
}

function applyQuarterTurn(stateString: string, face: FaceName): string {
  const coordinates = buildCoordinates();
  const lookup = buildCoordinateLookup(coordinates);
  const next = stateString.split("");
  const axisIndex = axisForFace(face);
  const layer = layerForFace(face);
  const angle = MOVE_ANGLE[face];

  coordinates.forEach((coordinate, sourceIndex) => {
    if (coordinate.position[axisIndex] !== layer) return;
    const rotated = {
      position: rotateVector(coordinate.position, axisIndex, angle),
      normal: rotateVector(coordinate.normal, axisIndex, angle),
    };
    const targetIndex = lookup.get(coordinateKey(rotated));
    if (targetIndex === undefined) {
      throw new Error(`회전 매핑을 찾을 수 없습니다: ${face}`);
    }
    next[targetIndex] = stateString[sourceIndex];
  });

  return next.join("");
}

function parseMoveWithoutInstruction(notation: string): Pick<Move, "face" | "amount" | "notation"> {
  const match = notation.trim().match(MOVE_PATTERN);
  if (!match) throw new Error(`지원하지 않는 회전 표기법입니다: ${notation}`);
  const suffix = match[2];
  return {
    face: match[1] as FaceName,
    amount: suffix === "2" ? 2 : suffix === "'" ? -1 : 1,
    notation: `${match[1]}${suffix}`,
  };
}

function axisForFace(face: FaceName): 0 | 1 | 2 {
  if (face === "R" || face === "L") return 0;
  if (face === "U" || face === "D") return 1;
  return 2;
}

function layerForFace(face: FaceName): number {
  return face === "R" || face === "U" || face === "F" ? 1 : -1;
}

function rotateVector(vector: [number, number, number], axis: 0 | 1 | 2, quarterTurns: number): [number, number, number] {
  const [x, y, z] = vector;
  if (axis === 0) return quarterTurns === 1 ? [x, -z, y] : [x, z, -y];
  if (axis === 1) return quarterTurns === 1 ? [z, y, -x] : [-z, y, x];
  return quarterTurns === 1 ? [-y, x, z] : [y, -x, z];
}

function buildCoordinateLookup(coordinates: StickerCoordinate[]): Map<string, number> {
  return new Map(coordinates.map((coordinate, index) => [coordinateKey(coordinate), index]));
}

function coordinateKey(coordinate: StickerCoordinate): string {
  return `${coordinate.position.join(",")}|${coordinate.normal.join(",")}`;
}

function buildCoordinates(): StickerCoordinate[] {
  const coordinates: StickerCoordinate[] = [];
  for (const face of ["U", "R", "F", "D", "L", "B"] as FaceName[]) {
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        coordinates[FACE_START[face] + row * 3 + col] = coordinateForFace(face, row, col);
      }
    }
  }
  return coordinates;
}

function coordinateForFace(face: FaceName, row: number, col: number): StickerCoordinate {
  const x = col - 1;
  const y = 1 - row;
  const z = row - 1;
  const reverseX = 1 - col;
  const reverseZ = 1 - row;
  const normalFace = FACE_BY_NORMAL;
  void normalFace;

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
