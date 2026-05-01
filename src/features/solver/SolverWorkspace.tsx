import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState } from "react";
import { SOLVED_STATE_STRING } from "@/core/cube-state";
import { solveCubeState } from "@/core/solver";
import type { SolverResult } from "@/core/models";

export function SolverWorkspace() {
  const [stateString, setStateString] = useState(SOLVED_STATE_STRING);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [busy, setBusy] = useState(false);

  async function solve() {
    setBusy(true);
    const next = await solveCubeState(stateString.trim());
    setResult(next);
    setActiveStep(0);
    setBusy(false);
  }

  const activeMove = result?.moves[activeStep];

  return (
    <section className="panel solver-panel">
      <div className="panel-header">
        <div>
          <h2>풀이 안내</h2>
          <p>스캔된 상태 문자열을 솔버에 전달하고 사용자가 따라 할 수 있는 한 수 단위로 안내합니다.</p>
        </div>
        <button className="button primary" onClick={solve} disabled={busy}>
          <Play size={16} />
          {busy ? "계산 중" : "풀이 생성"}
        </button>
      </div>

      <label className="field">
        <span>큐브 상태 문자열</span>
        <textarea value={stateString} onChange={(event) => setStateString(event.target.value)} rows={3} />
      </label>

      {result ? (
        <div className="solution-layout">
          <div className="solution-step">
            <span className="step-count">
              {result.moves.length === 0 ? 0 : activeStep + 1} / {result.moves.length}
            </span>
            <strong>{activeMove?.notation ?? "완료"}</strong>
            <p>{activeMove?.koreanInstruction ?? result.summary}</p>
            {result.warnings.map((warning) => (
              <p className="warning" key={warning}>
                {warning}
              </p>
            ))}
            <div className="button-row">
              <button className="button secondary" onClick={() => setActiveStep((value) => Math.max(0, value - 1))}>
                <ChevronLeft size={16} />
                이전
              </button>
              <button className="button secondary" onClick={() => setActiveStep((value) => Math.min(result.moves.length - 1, value + 1))}>
                다음
                <ChevronRight size={16} />
              </button>
              <button className="button secondary" onClick={() => setActiveStep(0)}>
                처음부터
              </button>
            </div>
          </div>

          <ol className="move-list">
            {result.moves.map((move, index) => (
              <li key={`${move.notation}-${index}`} className={index === activeStep ? "active" : ""}>
                <button onClick={() => setActiveStep(index)}>
                  <span>{move.notation}</span>
                  <small>{move.koreanInstruction}</small>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
