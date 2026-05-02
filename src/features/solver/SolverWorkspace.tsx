import { ChevronLeft, ChevronRight, Play, ScanLine } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { SOLVED_STATE_STRING } from "@/core/cube-state";
import { applyMoves } from "@/core/moves";
import {
  buildOrientationGuide,
  formatOrientationInstruction,
  orientMovesForMode,
  orientStateForMode,
  type OrientationMode,
} from "@/core/orientation-guide";
import { solveCubeState } from "@/core/solver";
import type { SolverResult } from "@/core/models";

const Cube3DViewer = lazy(() =>
  import("@/features/solver/components/Cube3DViewer").then((module) => ({ default: module.Cube3DViewer })),
);

interface SolverWorkspaceProps {
  initialStateString?: string;
  onOpenScanner?: (stateString?: string) => void;
}

export function SolverWorkspace({ initialStateString = SOLVED_STATE_STRING, onOpenScanner }: SolverWorkspaceProps) {
  const [stateString, setStateString] = useState(SOLVED_STATE_STRING);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [solveMode, setSolveMode] = useState<"normal" | "recovery">("normal");
  const [orientationMode, setOrientationMode] = useState<OrientationMode>("white-bottom");

  useEffect(() => {
    setStateString(initialStateString);
    setResult(null);
    setActiveStep(0);
    setSolveMode("normal");
  }, [initialStateString]);

  async function solve(mode: "normal" | "recovery" = "normal") {
    setBusy(true);
    const next = await solveCubeState(stateString.trim());
    setResult(mode === "recovery" ? { ...next, summary: `복구 경로: ${next.summary}` } : next);
    setActiveStep(0);
    setSolveMode(mode);
    setBusy(false);
  }

  const displayedMoves = useMemo(() => (result ? orientMovesForMode(result.moves, orientationMode) : []), [orientationMode, result]);
  const visualStateString = useMemo(() => {
    const baseState = orientStateForMode(result?.stateString ?? stateString.trim(), orientationMode);
    if (!result) return baseState;
    return applyMoves(baseState, displayedMoves.slice(0, activeStep));
  }, [activeStep, displayedMoves, orientationMode, result, stateString]);
  const activeMove = activeStep < displayedMoves.length ? displayedMoves[activeStep] : undefined;
  const hasMoves = displayedMoves.length > 0;
  const isComplete = result ? hasMoves && activeStep >= displayedMoves.length : false;
  const needsScanEdit = result?.status === "fallback" || result?.status === "invalid";
  const stepLabel = result?.status === "solved" ? "완료" : !result || !hasMoves ? "확인 필요" : isComplete ? "완료" : `${activeStep + 1}`;
  const orientationGuide = useMemo(() => buildOrientationGuide(result?.stateString ?? stateString.trim(), orientationMode), [orientationMode, result, stateString]);
  const orientationInstruction = useMemo(() => formatOrientationInstruction(orientationGuide), [orientationGuide]);

  return (
    <section className="panel solver-panel">
      <div className="panel-header">
        <div>
          <h2>풀이 안내</h2>
          <p>스캔된 상태 문자열을 솔버에 전달하고 사용자가 따라 할 수 있는 한 수 단위로 안내합니다.</p>
        </div>
        <div className="button-row">
          <button className="button primary" onClick={() => solve("normal")} disabled={busy}>
            <Play size={16} />
            {busy ? "계산 중" : "풀이 생성"}
          </button>
          <button className="button secondary" onClick={() => onOpenScanner?.(stateString.trim())}>
            <ScanLine size={16} />
            스캔/수정 열기
          </button>
        </div>
      </div>

      <label className="field">
        <span>{solveMode === "recovery" ? "복구할 현재 상태 문자열" : "큐브 상태 문자열"}</span>
        <textarea value={stateString} onChange={(event) => setStateString(event.target.value)} rows={3} />
      </label>
      <div className="start-reference-control">
        <span>풀이 시작 기준</span>
        <div className="start-reference-options" role="group" aria-label="풀이 시작 기준 선택">
          <button
            type="button"
            className={orientationMode === "white-bottom" ? "active" : ""}
            onClick={() => setOrientationMode("white-bottom")}
          >
            흰색 아래
          </button>
          <button
            type="button"
            className={orientationMode === "white-top" ? "active" : ""}
            onClick={() => setOrientationMode("white-top")}
          >
            흰색 위
          </button>
        </div>
      </div>
      <div className="button-row solver-actions">
        <button className="button secondary" onClick={() => solve("recovery")} disabled={busy}>
          실수 후 복구 풀이
        </button>
      </div>

      {result ? (
        <div className="solution-layout">
          <div className="solution-step">
            <span className="step-count">
              {stepLabel} / {displayedMoves.length}
            </span>
            <strong>{activeMove?.notation ?? (result.status === "solved" ? "완료" : "확인 필요")}</strong>
            <p>{activeMove?.koreanInstruction ?? result.summary}</p>
            {result.warnings.map((warning) => (
              <p className="warning" key={warning}>
                {warning}
              </p>
            ))}
            {needsScanEdit ? (
              <div className="button-row solution-repair-actions">
                <button className="button primary" onClick={() => onOpenScanner?.(result.stateString)}>
                  <ScanLine size={16} />
                  기존 스캔 불러와 수정
                </button>
              </div>
            ) : null}
            <div className="orientation-guide" aria-label="풀이 시작 기준">
              <strong>시작 기준</strong>
              <p>{orientationInstruction}</p>
              <div className="orientation-guide-list">
                {orientationGuide.map((item) => (
                  <span key={item.face}>
                    <span className="orientation-swatch" style={{ backgroundColor: item.colorHex }} aria-hidden="true" />
                    {item.label}: {item.colorName}
                  </span>
                ))}
              </div>
            </div>
            <div className="button-row">
              <button className="button secondary" onClick={() => setActiveStep((value) => Math.max(0, value - 1))} disabled={activeStep === 0}>
                <ChevronLeft size={16} />
                이전
              </button>
              <button
                className="button secondary"
                onClick={() => setActiveStep((value) => Math.min(displayedMoves.length, value + 1))}
                disabled={!hasMoves || isComplete}
              >
                다음
                <ChevronRight size={16} />
              </button>
              <button className="button secondary" onClick={() => setActiveStep(0)}>
                처음부터
              </button>
            </div>
          </div>

          <Suspense fallback={<div className="cube-viewer cube-viewer-loading">3D 큐브 준비 중</div>}>
            <Cube3DViewer
              appliedMoveCount={activeStep}
              moves={displayedMoves}
              stateString={visualStateString}
            />
          </Suspense>

          {hasMoves ? (
            <ol className="move-list">
              {displayedMoves.map((move, index) => (
                <li key={`${move.notation}-${index}`} className={index === activeStep ? "active" : ""}>
                  <button onClick={() => setActiveStep(index)}>
                    <span>{move.notation}</span>
                    <small>{move.koreanInstruction}</small>
                  </button>
                </li>
              ))}
              <li className={isComplete ? "active" : ""}>
                <button onClick={() => setActiveStep(displayedMoves.length)}>
                  <span>완료</span>
                  <small>모든 회전을 반영한 상태</small>
                </button>
              </li>
            </ol>
          ) : (
            <div className="move-list-empty" role="status">
              <strong>공식 없음</strong>
              <small>상태 검증, 시작 기준, 스캔 방향을 먼저 확인하세요.</small>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
