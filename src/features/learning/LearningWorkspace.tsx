import { BookOpen, Camera, Clock, Cpu, Layers, PlugZap, Search, Star, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DEVICE_PRACTICE_PLANS, createDeviceCommandPreview } from "@/core/device";
import { buildGuidedPracticePlans, buildStageSummaries, filterAlgorithms, flattenLessons, getLessonAlgorithms } from "@/core/learning";
import type { FlattenedLesson } from "@/core/learning";
import type { Algorithm, Method } from "@/core/models";
import { parseMove } from "@/core/moves";
import { algorithms, methods } from "@/data/catalog";

export function LearningWorkspace() {
  const [query, setQuery] = useState("");
  const [stageName, setStageName] = useState("");
  const lessons = useMemo(() => flattenLessons(methods), []);
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id ?? "");
  const filteredAlgorithms = useMemo(() => filterAlgorithms(algorithms, { query, stageName: stageName || undefined }), [query, stageName]);
  const stageSummaries = useMemo(() => buildStageSummaries(methods, algorithms), []);
  const guidedPracticePlans = useMemo(() => buildGuidedPracticePlans(algorithms), []);
  const selectedLesson = useMemo(() => lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0], [lessons, selectedLessonId]);
  const selectedLessonAlgorithms = useMemo(() => getLessonAlgorithms(selectedLesson, algorithms), [selectedLesson]);
  const lessonChecklist = useMemo(() => buildLessonChecklist(selectedLesson, selectedLessonAlgorithms), [selectedLesson, selectedLessonAlgorithms]);
  const devicePlanRows = useMemo(
    () => DEVICE_PRACTICE_PLANS.map((plan) => ({ ...plan, preview: createDeviceCommandPreview(plan) })),
    [],
  );
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
          {methods.map((method) => {
            const firstLesson = lessons.find((lesson) => lesson.methodId === method.id);
            const isActive = selectedLesson?.methodId === method.id;

            return (
              <button
                key={method.id}
                type="button"
                className={`method-row ${isActive ? "active" : ""}`}
                onClick={() => firstLesson && setSelectedLessonId(firstLesson.id)}
                disabled={!firstLesson}
              >
                <div>
                  <span className="eyebrow">{getLevelLabel(method.level)}</span>
                  <h3>{method.name}</h3>
                  <p>{method.description}</p>
                </div>
                <strong>{method.stages.length} stages</strong>
              </button>
            );
          })}
        </div>
        <div className="stage-summary-grid" aria-label="학습 단계 요약">
          {stageSummaries.map((summary) => (
            <article key={summary.id} className="stage-summary-card">
              <span>{summary.methodName}</span>
              <strong>{summary.stageName}</strong>
              <p>{summary.description}</p>
              <div className="summary-metrics">
                <span>{summary.lessonCount} 레슨</span>
                <span>{summary.algorithmCount} 공식</span>
                <span>{summary.estimatedMinutes}분</span>
              </div>
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
        {selectedLesson && (
          <article className="lesson-detail-card">
            <span className="eyebrow">
              {selectedLesson.methodName} / {selectedLesson.stageName}
            </span>
            <h3>{selectedLesson.title}</h3>
            <p>{selectedLesson.objective}</p>
            <div className="lesson-body">{selectedLesson.body}</div>
            <div className="summary-metrics">
              <span>{selectedLesson.estimatedMinutes}분</span>
              <span>{selectedLessonAlgorithms.length} 관련 공식</span>
              <span>{selectedLesson.stageDescription}</span>
            </div>
            <ol className="learning-checklist">
              {lessonChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            {selectedLessonAlgorithms.length > 0 && (
              <div className="related-algorithms">
                {selectedLessonAlgorithms.map((algorithm) => (
                  <span key={algorithm.id}>{algorithm.caseName}</span>
                ))}
              </div>
            )}
          </article>
        )}
        <div className="lesson-list compact">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              className={`lesson-row ${selectedLesson?.id === lesson.id ? "active" : ""}`}
              onClick={() => setSelectedLessonId(lesson.id)}
            >
              <span>
                {lesson.methodName} / {lesson.stageName}
              </span>
              <strong>{lesson.title}</strong>
              <p>{lesson.objective}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <div className="panel-header">
          <div>
            <h2>실전 훈련 플래너</h2>
            <p>카메라 검증과 향후 장치 스크램블을 같은 훈련 단계로 묶어 D-Cross, F2L, OLL, PLL을 반복 연습합니다.</p>
          </div>
          <Target size={22} />
        </div>
        <div className="practice-plan-grid">
          {guidedPracticePlans.map((plan) => (
            <article key={plan.id} className="practice-plan-card">
              <div className="practice-plan-heading">
                <span>{plan.stageName}</span>
                <strong>{plan.title}</strong>
              </div>
              <p>{plan.objective}</p>
              <div className="practice-columns">
                <div>
                  <Camera size={16} />
                  <span>카메라 검증</span>
                  <p>{plan.cameraGoal}</p>
                </div>
                <div>
                  <PlugZap size={16} />
                  <span>장치 확장</span>
                  <p>{plan.deviceGoal}</p>
                </div>
              </div>
              <ol className="checkpoint-list">
                {plan.checkpoints.map((checkpoint) => (
                  <li key={checkpoint}>{checkpoint}</li>
                ))}
              </ol>
              <div className="related-algorithms">
                {(plan.suggestedAlgorithmIds.length > 0 ? plan.suggestedAlgorithmIds : ["데이터 추가 대기"]).map((algorithmId) => (
                  <span key={algorithmId}>{getAlgorithmLabel(algorithmId)}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <div className="panel-header">
          <div>
            <h2>네이티브 앱과 장치 연동 준비</h2>
            <p>Tauri 데스크톱 앱은 현재 웹 스캐너와 핵심 로직을 공유하고, 하드웨어 연동은 명령 계약을 먼저 고정해 확장합니다.</p>
          </div>
          <Cpu size={22} />
        </div>
        <div className="native-device-grid">
          <article className="capability-card">
            <Layers size={18} />
            <strong>공통 실행 구조</strong>
            <p>웹, PWA, macOS/Windows Tauri 앱이 같은 React UI와 `src/core` 큐브 로직을 사용합니다.</p>
          </article>
          <article className="capability-card">
            <Camera size={18} />
            <strong>실기기 카메라 기준</strong>
            <p>네이티브 앱에서도 카메라 권한을 허용하면 동일한 6면 스캔, 색상 보정, 풀이 안내 흐름을 실행합니다.</p>
          </article>
          <article className="capability-card">
            <PlugZap size={18} />
            <strong>장치 명령 계약</strong>
            <p>Arduino류 장치는 Web Serial 또는 Tauri 플러그인으로 연결하고, 앱은 검증된 command preview만 전달합니다.</p>
          </article>
        </div>
        <div className="device-plan-list">
          {devicePlanRows.map((plan) => (
            <article key={plan.id} className="device-plan-row">
              <div>
                <span>{plan.mode}</span>
                <strong>{plan.title}</strong>
                <p>{plan.description}</p>
              </div>
              <code>{plan.preview.type}</code>
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

function buildLessonChecklist(lesson: FlattenedLesson | undefined, lessonAlgorithms: Algorithm[]): string[] {
  if (!lesson) return [];

  const checklist = ["목표와 기준 색을 말로 설명하기", "카메라로 현재 큐브 상태를 확인하기"];
  if (lessonAlgorithms.length > 0) checklist.push("관련 공식 카드를 숨긴 상태로 3회 이상 반복하기");
  checklist.push("성공/실패와 수행 시간을 기록하기");
  return checklist;
}

function getLevelLabel(level: Method["level"]): string {
  const labels: Record<Method["level"], string> = {
    "absolute-beginner": "왕초보",
    beginner: "초보",
    intermediate: "중급",
    advanced: "고급",
  };
  return labels[level];
}

function getAlgorithmLabel(algorithmId: string): string {
  return algorithms.find((algorithm) => algorithm.id === algorithmId)?.caseName ?? algorithmId;
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
