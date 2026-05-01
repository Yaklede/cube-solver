import { Settings } from "lucide-react";

export function SettingsWorkspace() {
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
          <select defaultValue="white">
            <option value="white">흰색 Cross</option>
            <option value="color-neutral">색상 중립</option>
          </select>
        </label>
        <label className="field inline">
          <span>느린 재생</span>
          <input type="number" defaultValue={900} min={200} step={100} />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" defaultChecked />
          <span>회전 설명을 한국어로 함께 표시</span>
        </label>
      </div>
    </section>
  );
}
