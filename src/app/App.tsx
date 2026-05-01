import { BookOpen, Camera, GraduationCap, Home, ScanLine, Settings, Trophy } from "lucide-react";
import { useState } from "react";
import { ScannerWorkspace } from "@/features/scanner/ScannerWorkspace";
import { SolverWorkspace } from "@/features/solver/SolverWorkspace";
import { LearningWorkspace } from "@/features/learning/LearningWorkspace";
import { ProgressWorkspace } from "@/features/progress/ProgressWorkspace";
import { SettingsWorkspace } from "@/features/settings/SettingsWorkspace";

type Screen = "home" | "scan" | "solver" | "learning" | "progress" | "settings";

const NAV_ITEMS: Array<{ id: Screen; label: string; icon: typeof Home }> = [
  { id: "home", label: "홈", icon: Home },
  { id: "scan", label: "카메라/스캔", icon: Camera },
  { id: "solver", label: "풀이 안내", icon: ScanLine },
  { id: "learning", label: "학습 모드", icon: GraduationCap },
  { id: "progress", label: "랜덤 테스트/기록", icon: Trophy },
  { id: "settings", label: "설정", icon: Settings },
];

export function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [scannedStateString, setScannedStateString] = useState<string | undefined>();

  function openSolverWithState(stateString: string) {
    setScannedStateString(stateString);
    setScreen("solver");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <strong>Cube Trainer</strong>
            <span>AI solver</span>
          </div>
        </div>
        <nav aria-label="주요 화면">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={screen === item.id ? "nav-item active" : "nav-item"} onClick={() => setScreen(item.id)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="main-area">
        {screen === "home" ? <HomeScreen onNavigate={setScreen} /> : null}
        {screen === "scan" ? <ScannerWorkspace onOpenSolver={openSolverWithState} /> : null}
        {screen === "solver" ? <SolverWorkspace initialStateString={scannedStateString} /> : null}
        {screen === "learning" ? <LearningWorkspace /> : null}
        {screen === "progress" ? <ProgressWorkspace /> : null}
        {screen === "settings" ? <SettingsWorkspace /> : null}
      </main>
    </div>
  );
}

function HomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="home-grid">
      <section className="panel intro-panel">
        <div>
          <h1>웹캠 기반 AI 큐브 풀이 및 학습 트레이너</h1>
          <p>
            카메라로 3x3 큐브를 6면 스캔하고, 상태 검증과 준최단 풀이 안내, 왕초보부터 CFOP까지의 공식 학습을 한 앱에서 진행합니다.
          </p>
        </div>
        <div className="button-row">
          <button className="button primary" onClick={() => onNavigate("scan")}>
            <Camera size={16} />
            스캔 시작
          </button>
          <button className="button secondary" onClick={() => onNavigate("learning")}>
            <BookOpen size={16} />
            학습 열기
          </button>
        </div>
      </section>

      <section className="panel checklist-panel">
        <h2>1차 완료 기준</h2>
        <div className="checklist">
          {[
            "웹 실행",
            "카메라 프리뷰",
            "3x3 스캔 UI",
            "색상 보정 구조",
            "6면 스캔 데이터",
            "상태 검증",
            "풀이 안내",
            "학습 과정",
            "공식 라이브러리",
            "진도 저장",
            "Tauri macOS/Windows 설정",
            "PWA 모바일 실행",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
