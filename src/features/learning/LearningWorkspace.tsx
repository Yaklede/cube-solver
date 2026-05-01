import { BookOpen, Clock, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { filterAlgorithms, flattenLessons } from "@/core/learning";
import type { Algorithm, Method } from "@/core/models";
import { parseMove } from "@/core/moves";
import { algorithms, methods } from "@/data/catalog";

export function LearningWorkspace() {
  const [query, setQuery] = useState("");
  const [stageName, setStageName] = useState("");
  const filteredAlgorithms = useMemo(() => filterAlgorithms(algorithms, { query, stageName: stageName || undefined }), [query, stageName]);
  const lessons = useMemo(() => flattenLessons(methods), []);
  const stages = [...new Set(algorithms.map((algorithm) => algorithm.stageName))];

  return (
    <div className="learning-grid">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>학습 모드</h2>
            <p>왕초보, 초보, CFOP, D-Cross, F2L, OLL, PLL 및 대안 해법을 데이터 기반으로 제공합니다.</p>
          </div>
          <BookOpen size={22} />
        </div>
        <div className="method-list">
          {methods.map((method) => (
            <article key={method.id} className="method-row">
              <div>
                <h3>{method.name}</h3>
                <p>{method.description}</p>
              </div>
              <span>{method.stages.length} stages</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>레슨 트랙</h2>
            <p>완료, 진행 중, 미시작 상태를 저장할 수 있는 레슨 단위 구조입니다.</p>
          </div>
          <Clock size={22} />
        </div>
        <div className="lesson-list">
          {lessons.map((lesson) => (
            <article key={lesson.id} className="lesson-row">
              <span>{lesson.methodName} / {lesson.stageName}</span>
              <strong>{lesson.title}</strong>
              <p>{lesson.objective}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <div className="panel-header">
          <div>
            <h2>공식 라이브러리</h2>
            <p>공식 카드, 숨기기, 즐겨찾기, 랜덤 테스트, 약점 복습을 위한 검색 가능한 데이터입니다.</p>
          </div>
        </div>
        <div className="filters">
          <label className="search-field">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="케이스, 공식, 태그 검색" />
          </label>
          <select value={stageName} onChange={(event) => setStageName(event.target.value)} aria-label="단계 필터">
            <option value="">전체 단계</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>
        <div className="algorithm-grid">
          {filteredAlgorithms.map((algorithm) => (
            <AlgorithmCard key={algorithm.id} algorithm={algorithm} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AlgorithmCard({ algorithm }: { algorithm: Algorithm }) {
  const [hidden, setHidden] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [playbackMs, setPlaybackMs] = useState(900);
  const playableMoves = useMemo(() => parsePlayableMoves(algorithm.notation), [algorithm.notation]);
  const activeMove = playableMoves[activeStep];

  useEffect(() => {
    if (!playing) return;
    if (activeStep >= playableMoves.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setActiveStep((step) => step + 1), playbackMs);
    return () => window.clearTimeout(timer);
  }, [activeStep, playableMoves.length, playbackMs, playing]);

  function startPlayback() {
    if (playableMoves.length === 0) return;
    setActiveStep((step) => (step >= playableMoves.length - 1 ? 0 : step));
    setPlaying(true);
  }

  return (
    <article className={`algorithm-card ${playing ? "playing" : ""}`}>
      <div className="algorithm-card-header">
        <strong>{algorithm.caseName}</strong>
        <button aria-label="즐겨찾기">
          <Star size={16} />
        </button>
      </div>
      <code>{hidden ? "공식 숨김" : algorithm.notation}</code>
      <p>{algorithm.description}</p>
      <div className="algorithm-player">
        <div className="move-step">
          <strong>{activeMove?.notation ?? "-"}</strong>
          <span>{activeMove?.koreanInstruction ?? "재생 가능한 표준 회전이 없습니다."}</span>
        </div>
        <div className="playback-controls">
          <button className="button secondary" onClick={() => setHidden((value) => !value)}>
            {hidden ? "다시 보기" : "숨기기"}
          </button>
          <button className="button secondary" onClick={startPlayback} disabled={playableMoves.length === 0}>
            재생
          </button>
          <button className="button secondary" onClick={() => setPlaying(false)}>
            정지
          </button>
        </div>
        <label className="range-field">
          <span>느리게</span>
          <input type="range" min={300} max={1800} step={100} value={playbackMs} onChange={(event) => setPlaybackMs(Number(event.target.value))} />
          <span>{playbackMs}ms</span>
        </label>
      </div>
      <div className="tag-row">
        {algorithm.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}

function parsePlayableMoves(notation: string) {
  return notation
    .split(/\s+/)
    .map((token) => {
      try {
        return parseMove(token);
      } catch {
        return null;
      }
    })
    .filter((move) => move !== null);
}
