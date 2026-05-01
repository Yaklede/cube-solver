import fridrichSolve from "rubiks-cube-solver";
import { SOLVED_STATE_STRING, validateCubeStateString } from "@/core/cube-state";
import { parseAlgorithm } from "@/core/moves";
import type { SolverResult } from "@/core/models";

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
      moves: parseAlgorithm("R U R' U'"),
      algorithm: "R U R' U'",
      status: "fallback",
      summary: "솔버가 현재 상태를 해석하지 못했습니다. 재스캔 후 복구용 짧은 기본 알고리즘을 제안합니다.",
      generatedAt,
      warnings: [error instanceof Error ? error.message : "알 수 없는 솔버 오류"],
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
