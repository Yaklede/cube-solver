import { BookOpen, Clock, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { filterAlgorithms, flattenLessons } from "@/core/learning";
import type { Algorithm, Method } from "@/core/models";
import methodsData from "@/data/methods.json";
import algorithmsData from "@/data/algorithms.json";

const methods = methodsData as Method[];
const algorithms = algorithmsData as Algorithm[];

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
            <article key={algorithm.id} className="algorithm-card">
              <div className="algorithm-card-header">
                <strong>{algorithm.caseName}</strong>
                <button aria-label="즐겨찾기">
                  <Star size={16} />
                </button>
              </div>
              <code>{algorithm.notation}</code>
              <p>{algorithm.description}</p>
              <div className="tag-row">
                {algorithm.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
