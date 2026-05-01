import * as rubiksSolverModule from "rubiks-cube-solver";
import { SOLVED_STATE_STRING, validateCubeStateString } from "@/core/cube-state";
import { parseAlgorithm } from "@/core/moves";
import type { SolverResult } from "@/core/models";

type RubiksSolverFunction = (stateString: string, options?: { partitioned?: boolean }) => unknown;

const fridrichSolve = resolveRubiksSolver(rubiksSolverModule);

export async function solveCubeState(stateString: string): Promise<SolverResult> {
  const validation = validateCubeStateString(stateString);
  const generatedAt = new Date().toISOString();
  if (!validation.valid) {
    return {
      id: `solution-${Date.now()}`,
      stateString,
      moves: [],
      algorithm: "",
      status: "invalid",
      summary: "큐브 상태 검증에 실패했습니다. 스캔 값을 수정하거나 다시 스캔하세요.",
      generatedAt,
      warnings: validation.errors,
    };
  }

  if (stateString === SOLVED_STATE_STRING) {
    return {
      id: `solution-${Date.now()}`,
      stateString,
      moves: [],
      algorithm: "",
      status: "solved",
      summary: "이미 맞춰진 큐브입니다.",
      generatedAt,
      warnings: [],
    };
  }

  try {
    const solverState = toFridrichStateString(stateString);
    const rawSolution = fridrichSolve(solverState, { partitioned: true });
    const algorithm = normalizeSolverOutput(rawSolution);
    const moves = parseAlgorithm(algorithm);
    return {
      id: `solution-${Date.now()}`,
      stateString,
      moves,
      algorithm,
      status: "solution",
      summary: `${moves.length}수의 CFOP 기반 풀이를 생성했습니다.`,
      generatedAt,
      warnings: [],
    };
  } catch (error) {
    return {
      id: `solution-${Date.now()}`,
      stateString,
      moves: [],
      algorithm: "",
      status: "fallback",
      summary: "솔버가 현재 상태를 해석하지 못했습니다. 재스캔하거나 수동 수정으로 색상/조각 상태를 다시 확인하세요.",
      generatedAt,
      warnings: [getSolverFailureMessage(error)],
    };
  }
}

function toFridrichStateString(stateString: string): string {
  const slice = (start: number) => stateString.slice(start, start + 9).toLowerCase();
  const up = slice(0);
  const right = slice(9);
  const front = slice(18);
  const down = slice(27);
  const left = slice(36);
  const back = slice(45);
  return [front, right, up, down, left, back].join("");
}

function normalizeSolverOutput(rawSolution: unknown): string {
  const tokens = flattenSolution(rawSolution)
    .join(" ")
    .replaceAll("prime", "'")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => token.replace(/^([FRUDLB])$/, "$1"))
    .filter((token) => /^[URFDLB][2']?$/.test(token));

  if (tokens.length === 0) {
    throw new Error("솔버가 표준 단일 면 회전으로 변환 가능한 공식을 반환하지 않았습니다.");
  }

  return tokens.join(" ");
}

function getSolverFailureMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("faces") || message.includes("undefined")) {
    return "색상 개수는 맞지만 실제 조각 조합 또는 면 방향이 솔버가 해석할 수 없는 상태입니다.";
  }

  return "솔버가 현재 상태를 해석할 수 없습니다. 큐브 방향과 수동 수정 값을 다시 확인하세요.";
}

function resolveRubiksSolver(moduleValue: unknown): RubiksSolverFunction {
  const moduleRecord = moduleValue as Record<string, unknown>;
  const candidates = [
    moduleValue,
    moduleRecord.default,
    moduleRecord.rubiksCubeSolver,
    typeof moduleRecord.default === "object" && moduleRecord.default ? (moduleRecord.default as Record<string, unknown>).default : undefined,
    typeof moduleRecord.default === "object" && moduleRecord.default ? (moduleRecord.default as Record<string, unknown>).rubiksCubeSolver : undefined,
  ];
  const solver = candidates.find((candidate): candidate is RubiksSolverFunction => typeof candidate === "function");
  if (!solver) {
    throw new Error("rubiks-cube-solver 함수 export를 찾을 수 없습니다.");
  }
  return solver;
}

function flattenSolution(rawSolution: unknown): string[] {
  if (typeof rawSolution === "string") return [rawSolution];
  if (!rawSolution || typeof rawSolution !== "object") return [];
  const solution = rawSolution as Record<string, unknown>;
  return ["cross", "f2l", "oll", "pll"].flatMap((key) => {
    const value = solution[key];
    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
    if (typeof value === "string") return [value];
    return [];
  });
}
