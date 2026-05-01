import { Check, RotateCcw, ScanLine } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { buildCubeState, createEmptyScanSession, createSolvedFace, FACE_ORDER, updateSticker } from "@/core/cube-state";
import { calibrateColorProfile, createDefaultColorProfile, DEFAULT_COLOR_RGB, sampleNineGrid } from "@/core/color-recognition";
import type { CubeFace, FaceName, RgbColor, StickerColor } from "@/core/models";
import { captureGuideImageData, recognizeFaceFromSamples } from "@/core/scan-frame";
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
  const [selectedCalibrationColor, setSelectedCalibrationColor] = useState<StickerColor>("white");
  const [cameraVideo, setCameraVideo] = useState<HTMLVideoElement | null>(null);
  const [scanMessage, setScanMessage] = useState("카메라 인식 전입니다. 수동 수정 또는 샘플 저장을 사용할 수 있습니다.");
  const [calibrationSamples, setCalibrationSamples] = useState<Partial<Record<StickerColor, RgbColor>>>({});
  const [colorProfile, setColorProfile] = useState(() => createDefaultColorProfile());
  const cubeState = useMemo(() => buildCubeState(session.faces), [session.faces]);
  const activeFace = session.activeFace;
  const currentFace = session.faces[activeFace] ?? createSolvedFace(activeFace);
  const rememberCamera = useCallback((video: HTMLVideoElement) => setCameraVideo(video), []);

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

  function recognizeCurrentFace() {
    if (!cameraVideo) {
      setScanMessage("카메라가 아직 준비되지 않았습니다.");
      return;
    }

    try {
      const imageData = captureGuideImageData(cameraVideo);
      const samples = sampleNineGrid(imageData);
      const nextFace = recognizeFaceFromSamples(activeFace, samples, colorProfile);
      const averageConfidence =
        nextFace.stickers.reduce((total, sticker) => total + sticker.confidence, 0) / nextFace.stickers.length;
      setSession((previous) => ({
        ...previous,
        faces: {
          ...previous.faces,
          [activeFace]: nextFace,
        },
      }));
      setScanMessage(`${activeFace} 면을 인식했습니다. 평균 신뢰도 ${Math.round(averageConfidence * 100)}%입니다.`);
    } catch (error) {
      setScanMessage(error instanceof Error ? error.message : "카메라 프레임 인식에 실패했습니다.");
    }
  }

  function captureCalibrationSample() {
    if (!cameraVideo) {
      setScanMessage("카메라가 아직 준비되지 않았습니다.");
      return;
    }

    try {
      const imageData = captureGuideImageData(cameraVideo);
      const centerSample = sampleNineGrid(imageData)[4];
      setCalibrationSamples((previous) => {
        const nextSamples = {
          ...previous,
          [selectedCalibrationColor]: centerSample,
        };
        setColorProfile(buildColorProfile(nextSamples));
        return nextSamples;
      });
      setScanMessage(`${COLOR_LABEL[selectedCalibrationColor]} 기준 색상을 저장했습니다.`);
    } catch (error) {
      setScanMessage(error instanceof Error ? error.message : "색상 보정 샘플 캡처에 실패했습니다.");
    }
  }

  function resetCalibration() {
    setCalibrationSamples({});
    setColorProfile(createDefaultColorProfile());
    setScanMessage("기본 색상 프로필로 되돌렸습니다.");
  }

  return (
    <div className="workspace-grid">
      <CameraPreview onReady={rememberCamera} />
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
                <span className="sticker-confidence">{Math.round(sticker.confidence * 100)}</span>
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
              <p>
                {Object.keys(calibrationSamples).length} / {COLORS.length}개 기준 색상을 저장했습니다.
              </p>
              <div className="calibration-controls">
                <select value={selectedCalibrationColor} onChange={(event) => setSelectedCalibrationColor(event.target.value as StickerColor)} aria-label="보정할 기준 색상">
                  {COLORS.map((color) => (
                    <option key={color} value={color}>
                      {COLOR_LABEL[color]}
                    </option>
                  ))}
                </select>
                <button className="button secondary" onClick={captureCalibrationSample}>
                  기준 색상 캡처
                </button>
                <button className="button secondary" onClick={resetCalibration}>
                  기본값
                </button>
              </div>
              <div className="calibration-swatches" aria-label="저장된 보정 색상">
                {COLORS.map((color) => (
                  <span key={color} className={`calibration-chip ${calibrationSamples[color] ? "captured" : ""}`}>
                    <span className={`swatch swatch-${color}`} />
                    <span>{COLOR_LABEL[color]}</span>
                    <span className="rgb-readout">{formatRgb(calibrationSamples[color])}</span>
                  </span>
                ))}
              </div>
            </div>

            <button className="button primary" onClick={() => saveFace(currentFace)}>
              현재 면 저장
            </button>
            <button className="button secondary" onClick={recognizeCurrentFace}>
              <ScanLine size={16} />
              카메라에서 인식
            </button>
            <button className="button secondary" onClick={fillWithSolvedSample}>
              샘플 면 저장
            </button>
            <p className="scan-feedback">{scanMessage}</p>
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

function buildColorProfile(samples: Partial<Record<StickerColor, RgbColor>>) {
  return calibrateColorProfile(
    COLORS.map((color) => ({
      color,
      rgb: samples[color] ?? DEFAULT_COLOR_RGB[color],
    })),
  );
}

function formatRgb(rgb?: RgbColor): string {
  if (!rgb) return "미저장";
  return `${rgb.r},${rgb.g},${rgb.b}`;
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
