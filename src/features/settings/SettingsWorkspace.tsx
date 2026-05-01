import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import type { StickerColor, UserSettings } from "@/core/models";
import { createDefaultSettings, loadSettings, saveSettings } from "@/core/settings";

export function SettingsWorkspace() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (typeof window === "undefined") return createDefaultSettings();
    return loadSettings(window.localStorage);
  });

  useEffect(() => {
    saveSettings(window.localStorage, settings);
  }, [settings]);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>설정</h2>
          <p>카메라 장치, Cross 색상, 느린 재생 속도, 플랫폼별 권한 처리를 관리합니다.</p>
        </div>
        <Settings size={22} />
      </div>
      <div className="settings-list">
        <label className="field inline">
          <span>Cross 색상</span>
          <select
            value={settings.preferredCrossColor}
            onChange={(event) =>
              setSettings((previous) => ({
                ...previous,
                preferredCrossColor: event.target.value as StickerColor | "color-neutral",
              }))
            }
          >
            <option value="white">흰색 Cross</option>
            <option value="color-neutral">색상 중립</option>
          </select>
        </label>
        <label className="field inline">
          <span>느린 재생</span>
          <input
            type="number"
            value={settings.slowPlaybackMs}
            min={200}
            step={100}
            onChange={(event) =>
              setSettings((previous) => ({
                ...previous,
                slowPlaybackMs: Number(event.target.value),
              }))
            }
          />
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={settings.showMoveDescriptions}
            onChange={(event) =>
              setSettings((previous) => ({
                ...previous,
                showMoveDescriptions: event.target.checked,
              }))
            }
          />
          <span>회전 설명을 한국어로 함께 표시</span>
        </label>
        <p className="muted">설정은 이 브라우저에 자동 저장됩니다.</p>
      </div>
    </section>
  );
}
