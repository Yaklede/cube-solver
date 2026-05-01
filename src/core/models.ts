export type FaceName = "U" | "R" | "F" | "D" | "L" | "B";

export type StickerColor = "white" | "yellow" | "red" | "orange" | "blue" | "green";

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface CubeSticker {
  id: string;
  face: FaceName;
  index: number;
  color: StickerColor;
  confidence: number;
  rgb?: RgbColor;
  manuallyEdited?: boolean;
}

export interface CubeFace {
  name: FaceName;
  centerColor: StickerColor;
  stickers: CubeSticker[];
}

export interface CubeState {
  faces: Record<FaceName, CubeFace>;
  stateString: string;
  validation: CubeValidationResult;
  updatedAt: string;
}

export interface CubeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  colorCounts: Record<string, number>;
}

export interface ScanSession {
  id: string;
  createdAt: string;
  activeFace: FaceName;
  faceOrder: FaceName[];
  faces: Partial<Record<FaceName, CubeFace>>;
  colorProfileId?: string;
}

export interface ColorSample {
  color: StickerColor;
  rgb: RgbColor;
  lab: LabColor;
}

export interface LabColor {
  l: number;
  a: number;
  b: number;
}

export interface ColorProfile {
  id: string;
  name: string;
  createdAt: string;
  whiteBalance: RgbColor;
  samples: ColorSample[];
}

export interface Move {
  face: FaceName;
  amount: 1 | 2 | -1;
  notation: string;
  koreanInstruction: string;
}

export interface SolverResult {
  id: string;
  stateString: string;
  moves: Move[];
  algorithm: string;
  status: "solved" | "solution" | "fallback" | "invalid";
  summary: string;
  generatedAt: string;
  warnings: string[];
}

export interface Method {
  id: string;
  name: string;
  description: string;
  level: "absolute-beginner" | "beginner" | "intermediate" | "advanced";
  stages: Stage[];
  tags: string[];
}

export interface Stage {
  id: string;
  methodId: string;
  name: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  stageId: string;
  title: string;
  objective: string;
  body: string;
  estimatedMinutes: number;
  requiredAlgorithms: string[];
}

export interface Algorithm {
  id: string;
  methodName: string;
  stageName: string;
  caseName: string;
  difficulty: "easy" | "normal" | "hard";
  notation: string;
  description: string;
  prerequisites: string[];
  resultCondition: string;
  tags: string[];
  alternatives: string[];
  leftHanded: boolean;
  rightHanded: boolean;
  favorite: boolean;
  successCount: number;
  failureCount: number;
  averageTimeMs: number;
  lastPracticedAt?: string;
  casePattern?: string;
}

export interface AlgorithmCase {
  id: string;
  algorithmId: string;
  name: string;
  recognitionPattern: string;
  previewState?: string;
  tags: string[];
}

export interface AlgorithmFilters {
  query?: string;
  methodName?: string;
  stageName?: string;
  difficulty?: Algorithm["difficulty"];
  favoriteOnly?: boolean;
  tags?: string[];
}

export interface AlgorithmProgress {
  algorithmId: string;
  successCount: number;
  failureCount: number;
  averageTimeMs: number;
  bestTimeMs?: number;
  confusedWith: string[];
  lastPracticedAt?: string;
  favorite: boolean;
}

export interface UserProgress {
  completedLessonIds: string[];
  activeLessonIds: string[];
  algorithmProgress: Record<string, AlgorithmProgress>;
  weakAlgorithmIds: string[];
  confusedCaseIds: string[];
  lastStudyDate?: string;
}

export interface PracticeSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  mode: "algorithm" | "oll" | "pll" | "cross" | "solver-recovery";
  targetCaseId?: string;
  cameraVerificationEnabled: boolean;
  results: PracticeResult[];
}

export interface PracticeResult {
  id: string;
  algorithmId: string;
  success: boolean;
  elapsedMs: number;
  startedState?: string;
  endedState?: string;
  verifiedByCamera: boolean;
  createdAt: string;
}

export interface UserSettings {
  language: "ko";
  preferredCrossColor: StickerColor | "color-neutral";
  cameraDeviceId?: string;
  colorProfileId?: string;
  slowPlaybackMs: number;
  showMoveDescriptions: boolean;
  storageVersion: number;
}
