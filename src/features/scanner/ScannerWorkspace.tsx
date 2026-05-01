import { Check, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { buildCubeState, createEmptyScanSession, createSolvedFace, FACE_ORDER, updateSticker } from "@/core/cube-state";
import { createDefaultColorProfile } from "@/core/color-recognition";
import type { CubeFace, FaceName, StickerColor } from "@/core/models";
import { CameraPreview } from "@/features/camera/CameraPreview";

const COLORS: StickerColor[] = ["white", "yellow", "red", "orange", "blue", "green"];

const COLOR_LABEL: Record<StickerColor, string> = {
  white: "흰색",
  yellow: "노랑",
  red: "빨강",
  orange: "주황",
  blue: "파랑",
  green: "초록",
};

export function ScannerWorkspace() {
  const [session, setSession] = useState(() => createEmptyScanSession());
  const [selectedColor, setSelectedColor] = useState<StickerColor>("white");
  const colorProfile = useMemo(() => createDefaultColorProfile(), []);
  const cubeState = useMemo(() => buildCubeState(session.faces), [session.faces]);
  const activeFace = session.activeFace;
  const currentFace = session.faces[activeFace] ?? createSolvedFace(activeFace);

  function saveFace(face: CubeFace) {
    const currentIndex = FACE_ORDER.indexOf(activeFace);
    const nextFace = FACE_ORDER[Math.min(currentIndex + 1, FACE_ORDER.length - 1)];
    setSession((previous) => ({
      ...previous,
      activeFace: nextFace,
      faces: {
        ...previous.faces,
        [activeFace]: face,
      },
    }));
  }

  function setActiveFace(face: FaceName) {
    setSession((previous) => ({ ...previous, activeFace: face }));
  }

  function fillWithSolvedSample() {
    saveFace(createSolvedFace(activeFace));
  }

  function editSticker(index: number) {
    const nextFace = updateSticker(currentFace, index, selectedColor);
    setSession((previous) => ({
      ...previous,
      faces: {
        ...previous.faces,
        [activeFace]: nextFace,
      },
    }));
  }

  return (
    <div className="workspace-grid">
      <CameraPreview />
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>6면 스캔</h2>
            <p>가이드에 한 면을 맞춘 뒤 9칸 색상을 확인하고 필요하면 수동 수정합니다.</p>
          </div>
          <button className="button secondary" onClick={() => setSession(createEmptyScanSession())}>
            <RotateCcw size={16} />
            초기화
          </button>
        </div>

        <div className="face-tabs" role="tablist" aria-label="스캔할 면 선택">
          {FACE_ORDER.map((face) => (
            <button key={face} className={face === activeFace ? "tab active" : "tab"} onClick={() => setActiveFace(face)}>
              {face}
              {session.faces[face] ? <Check size={14} /> : null}
            </button>
          ))}
        </div>

        <div className="scanner-layout">
          <div className="cube-face-editor" aria-label={`${activeFace} 면 수동 수정`}>
            {currentFace.stickers.map((sticker) => (
              <button
                key={sticker.id}
                className={`sticker sticker-${sticker.color}`}
                onClick={() => editSticker(sticker.index)}
                aria-label={`${activeFace} ${sticker.index + 1}번 칸 ${COLOR_LABEL[sticker.color]}`}
              >
                {sticker.index === 4 ? activeFace : ""}
              </button>
            ))}
          </div>

          <div className="stack">
            <div>
              <h3>색상 팔레트</h3>
              <div className="palette">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={`swatch swatch-${color} ${selectedColor === color ? "active" : ""}`}
                    onClick={() => setSelectedColor(color)}
                    aria-label={COLOR_LABEL[color]}
                  />
                ))}
              </div>
            </div>

            <div className="calibration-summary">
              <h3>색상 보정</h3>
              <p>{colorProfile.samples.length}개 기준 색상과 흰색 기준 보정값을 사용합니다.</p>
            </div>

            <button className="button primary" onClick={() => saveFace(currentFace)}>
              현재 면 저장
            </button>
            <button className="button secondary" onClick={fillWithSolvedSample}>
              샘플 면 저장
            </button>
          </div>
        </div>

        <div className="state-output">
          <h3>상태 문자열</h3>
          <code>{cubeState.stateString}</code>
          <ValidationSummary valid={cubeState.validation.valid} errors={cubeState.validation.errors} warnings={cubeState.validation.warnings} />
        </div>
      </section>
    </div>
  );
}

function ValidationSummary({ valid, errors, warnings }: { valid: boolean; errors: string[]; warnings: string[] }) {
  return (
    <div className={valid ? "validation valid" : "validation invalid"}>
      <strong>{valid ? "검증 통과" : "검증 필요"}</strong>
      {[...errors, ...warnings].map((message) => (
        <span key={message}>{message}</span>
      ))}
    </div>
  );
}
