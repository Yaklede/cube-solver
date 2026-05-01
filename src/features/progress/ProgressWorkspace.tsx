import { TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { applyPracticeResult, createInitialProgress, loadProgress, saveProgress } from "@/core/progress";
import type { PracticeResult } from "@/core/models";

export function ProgressWorkspace() {
  const [progress, setProgress] = useState(() => {
    if (typeof window === "undefined") return createInitialProgress();
    return loadProgress(window.localStorage);
  });
  const latest = useMemo(() => Object.values(progress.algorithmProgress).toSorted((a, b) => (b.lastPracticedAt ?? "").localeCompare(a.lastPracticedAt ?? "")), [progress]);

  useEffect(() => {
    saveProgress(window.localStorage, progress);
  }, [progress]);

  function recordSample(success: boolean) {
    const result: PracticeResult = {
      id: `practice-${Date.now()}`,
      algorithmId: "alg-oll-sune",
      success,
      elapsedMs: success ? 3200 : 5800,
      verifiedByCamera: true,
      createdAt: new Date().toISOString(),
    };
    setProgress((previous) => applyPracticeResult(previous, result));
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>랜덤 테스트와 기록</h2>
          <p>카메라 검증 흐름의 결과를 성공/실패/평균 시간/약점 공식으로 누적합니다.</p>
        </div>
        <TimerReset size={22} />
      </div>
      <div className="button-row">
        <button className="button primary" onClick={() => recordSample(true)}>
          성공 기록
        </button>
        <button className="button secondary" onClick={() => recordSample(false)}>
          실패 기록
        </button>
      </div>
      <div className="records-table" role="table" aria-label="연습 기록">
        <div className="records-row header" role="row">
          <span>공식</span>
          <span>성공</span>
          <span>실패</span>
          <span>평균</span>
        </div>
        {latest.map((item) => (
          <div className="records-row" role="row" key={item.algorithmId}>
            <span>{item.algorithmId}</span>
            <span>{item.successCount}</span>
            <span>{item.failureCount}</span>
            <span>{(item.averageTimeMs / 1000).toFixed(1)}초</span>
          </div>
        ))}
      </div>
      <p className="muted">약점 공식: {progress.weakAlgorithmIds.length ? progress.weakAlgorithmIds.join(", ") : "없음"}</p>
      <p className="muted">기록은 이 브라우저에 자동 저장됩니다.</p>
    </section>
  );
}
