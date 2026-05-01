import { Check, RotateCcw, ScanLine } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildCubeState, createEmptyScanSession, createSolvedFace, FACE_COLORS, FACE_ORDER, updateSticker } from "@/core/cube-state";
import { calibrateColorProfile, createDefaultColorProfile, DEFAULT_COLOR_RGB, sampleNineGrid } from "@/core/color-recognition";
import type { CubeFace, FaceName, RgbColor, StickerColor } from "@/core/models";
import { COLOR_LABEL, getFaceScanGuidance } from "@/core/scan-guidance";
import {
  analyzeFaceReadiness,
  AUTO_SCAN_COOLDOWN_MS,
  AUTO_SCAN_STABLE_FRAMES,
  type CenterCalibratedRecognition,
  captureGuideImageData,
  getLowConfidenceStickerIndexes,
  LOW_CONFIDENCE_THRESHOLD,
  recognizeFaceFromSamples,
  recognizeFaceWithExpectedCenterCalibration,
  shouldUseAutoScanFallback,
  type FaceReadiness,
} from "@/core/scan-frame";
import { CameraPreview } from "@/features/camera/CameraPreview";

const COLORS: StickerColor[] = ["white", "yellow", "red", "orange", "blue", "green"];
const AUTO_SCAN_INTERVAL_MS = 450;

interface StickerDiagnostic {
  index: number;
  rgb: RgbColor;
  beforeColor: StickerColor;
  beforeConfidence: number;
  afterColor: StickerColor;
  afterConfidence: number;
  expectedColor: StickerColor;
}

interface ScanDiagnostic {
  face: FaceName;
  expectedColor: StickerColor;
  capturedAt: string;
  averageConfidence: number;
  readinessReason: string;
  lowConfidenceCount: number;
  mismatchedIndexes: number[];
  stickers: StickerDiagnostic[];
}

interface ScannerWorkspaceProps {
  onOpenSolver?: (stateString: string) => void;
}

interface AutoScanState {
  signature: string;
  stableCount: number;
  appliedSignature: string;
  appliedAt: number;
  failedReadinessCount: number;
  fallbackAppliedAt: number;
}

function createAutoScanState(): AutoScanState {
  return {
    signature: "",
    stableCount: 0,
    appliedSignature: "",
    appliedAt: 0,
    failedReadinessCount: 0,
    fallbackAppliedAt: 0,
  };
}

export function ScannerWorkspace({ onOpenSolver }: ScannerWorkspaceProps) {
  const [session, setSession] = useState(() => createEmptyScanSession());
  const [selectedColor, setSelectedColor] = useState<StickerColor>("white");
  const [selectedCalibrationColor, setSelectedCalibrationColor] = useState<StickerColor>("white");
  const [cameraVideo, setCameraVideo] = useState<HTMLVideoElement | null>(null);
  const [scanMessage, setScanMessage] = useState("카메라 인식 전입니다. 수동 수정 또는 샘플 저장을 사용할 수 있습니다.");
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [autoReadiness, setAutoReadiness] = useState<FaceReadiness | null>(null);
  const [calibrationSamples, setCalibrationSamples] = useState<Partial<Record<StickerColor, RgbColor>>>({});
  const [colorProfile, setColorProfile] = useState(() => createDefaultColorProfile());
  const [scanDiagnostics, setScanDiagnostics] = useState<Partial<Record<FaceName, ScanDiagnostic>>>({});
  const autoScanStateRef = useRef<AutoScanState>(createAutoScanState());
  const cubeState = useMemo(() => buildCubeState(session.faces), [session.faces]);
  const activeFace = session.activeFace;
  const currentFace = session.faces[activeFace] ?? createSolvedFace(activeFace);
  const scanGuidance = useMemo(() => getFaceScanGuidance(activeFace), [activeFace]);
  const lowConfidenceIndexes = useMemo(() => getLowConfidenceStickerIndexes(currentFace), [currentFace]);
  const rememberCamera = useCallback((video: HTMLVideoElement) => setCameraVideo(video), []);
  const guideStatus = autoReadiness?.ready ? "ready" : autoReadiness ? "aligning" : "idle";
  const guideLabel = autoReadiness?.ready ? "자동 인식 준비" : autoReadiness?.reason;

  const applyRecognitionFromSamples = useCallback(
    (samples: RgbColor[], beforeFace: CubeFace, readiness: FaceReadiness, action: string) => {
      const result = recognizeFaceWithExpectedCenterCalibration(activeFace, samples, colorProfile);
      const nextFace = result.face;
      const diagnostic = createScanDiagnostic(activeFace, samples, beforeFace, readiness, nextFace, result.averageConfidence);
      if (result.calibrationApplied) {
        setColorProfile(result.profile);
        setCalibrationSamples((previous) => ({
          ...previous,
          [result.expectedCenterColor]: result.centerSample,
        }));
      }
      setSession((previous) => ({
        ...previous,
        faces: {
          ...previous.faces,
          [activeFace]: nextFace,
        },
      }));
      setScanDiagnostics((previous) => ({
        ...previous,
        [activeFace]: diagnostic,
      }));
      setScanMessage(getCenterCalibrationMessage(activeFace, result, action));
      return result;
    },
    [activeFace, colorProfile],
  );

  useEffect(() => {
    autoScanStateRef.current = createAutoScanState();
    if (!autoScanEnabled || !cameraVideo) {
      setAutoReadiness(null);
      return;
    }

    const intervalId = window.setInterval(() => {
      try {
        const imageData = captureGuideImageData(cameraVideo);
        const samples = sampleNineGrid(imageData);
        const nextFace = recognizeFaceFromSamples(activeFace, samples, colorProfile);
        const readiness = analyzeFaceReadiness(nextFace);
        setAutoReadiness(readiness);

        if (!readiness.ready) {
          const state = autoScanStateRef.current;
          state.signature = "";
          state.stableCount = 0;
          state.failedReadinessCount += 1;
          const now = Date.now();
          if (shouldUseAutoScanFallback(readiness, state.failedReadinessCount, now, state.fallbackAppliedAt)) {
            const result = applyRecognitionFromSamples(samples, nextFace, readiness, "자동 안정화 fallback으로 인식했습니다");
            state.fallbackAppliedAt = now;
            state.failedReadinessCount = 0;
            state.appliedSignature = getFaceSignature(result.face);
            state.appliedAt = now;
          }
          return;
        }

        const signature = getFaceSignature(nextFace);
        const state = autoScanStateRef.current;
        state.failedReadinessCount = 0;
        if (state.signature === signature) {
          state.stableCount += 1;
        } else {
          state.signature = signature;
          state.stableCount = 1;
        }

        const now = Date.now();
        const canApply =
          state.stableCount >= AUTO_SCAN_STABLE_FRAMES &&
          state.appliedSignature !== signature &&
          now - state.appliedAt >= AUTO_SCAN_COOLDOWN_MS;

        if (!canApply) return;

        const result = applyRecognitionFromSamples(samples, nextFace, readiness, "자동 인식되었습니다");
        state.appliedSignature = signature;
        state.appliedAt = now;
      } catch {
        setAutoReadiness(null);
        autoScanStateRef.current = createAutoScanState();
      }
    }, AUTO_SCAN_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [activeFace, applyRecognitionFromSamples, autoScanEnabled, cameraVideo, colorProfile]);

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
      const beforeFace = recognizeFaceFromSamples(activeFace, samples, colorProfile);
      const readiness = analyzeFaceReadiness(beforeFace);
      applyRecognitionFromSamples(samples, beforeFace, readiness, "인식했습니다");
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
    setScanDiagnostics({});
    setScanMessage("기본 색상 프로필로 되돌렸습니다.");
  }

  return (
    <div className="workspace-grid">
      <div className="scanner-camera-column">
        <CameraPreview guideStatus={guideStatus} guideLabel={guideLabel} onReady={rememberCamera} />
        <div className="camera-action-bar" aria-label="카메라 빠른 인식">
          <div className="camera-action-summary">
            <strong>
              {activeFace} / {scanGuidance.expectedCenterLabel} 센터
            </strong>
            <span>{autoScanEnabled ? guideLabel ?? "카메라 프레임 확인 중" : "자동 인식 꺼짐"}</span>
          </div>
          <div className="camera-action-buttons">
            <button className="button primary" onClick={recognizeCurrentFace}>
              <ScanLine size={16} />
              인식
            </button>
            <button className="button secondary" onClick={() => saveFace(currentFace)}>
              현재 면 저장
            </button>
            <label className="auto-scan-toggle compact">
              <input type="checkbox" checked={autoScanEnabled} onChange={(event) => setAutoScanEnabled(event.target.checked)} />
              <span>자동</span>
            </label>
          </div>
          <p className="scan-feedback compact">{scanMessage}</p>
        </div>
      </div>
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
                className={`sticker sticker-${sticker.color} ${lowConfidenceIndexes.includes(sticker.index) ? "low-confidence" : ""}`}
                onClick={() => editSticker(sticker.index)}
                aria-label={`${activeFace} ${sticker.index + 1}번 칸 ${COLOR_LABEL[sticker.color]}`}
              >
                {sticker.index === 4 ? activeFace : ""}
                <span className="sticker-confidence">{Math.round(sticker.confidence * 100)}</span>
              </button>
            ))}
          </div>

          <div className="stack">
            <div className="scan-guidance-card">
              <div className="scan-guidance-row">
                <span>현재 면</span>
                <strong>
                  {activeFace} / {scanGuidance.expectedCenterLabel} 센터
                </strong>
              </div>
              <p>{scanGuidance.currentInstruction}</p>
              <AutoScanReadiness readiness={autoReadiness} enabled={autoScanEnabled} />
              <div className="scan-guidance-row">
                <span>다음</span>
                <strong>{scanGuidance.nextFace ?? "검증"}</strong>
              </div>
              <p>{scanGuidance.nextInstruction}</p>
            </div>

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
              <p>카메라 인식 시 현재 면의 센터 색상은 보정값으로 자동 누적됩니다.</p>
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

            <button className="button secondary" onClick={fillWithSolvedSample}>
              샘플 면 저장
            </button>
            <ReviewNotice indexes={lowConfidenceIndexes} />
          </div>
        </div>

        <ScanDiagnosticPanel diagnostics={scanDiagnostics} activeFace={activeFace} />

        <div className="state-output">
          <h3>상태 문자열</h3>
          <code>{cubeState.stateString}</code>
          <ValidationSummary valid={cubeState.validation.valid} errors={cubeState.validation.errors} warnings={cubeState.validation.warnings} />
          <button className="button primary state-action" onClick={() => onOpenSolver?.(cubeState.stateString)} disabled={!cubeState.validation.valid}>
            풀이 안내로 보내기
          </button>
        </div>
      </section>
    </div>
  );
}

function ScanDiagnosticPanel({ diagnostics, activeFace }: { diagnostics: Partial<Record<FaceName, ScanDiagnostic>>; activeFace: FaceName }) {
  const diagnostic = diagnostics[activeFace];
  const capturedFaces = FACE_ORDER.filter((face) => diagnostics[face]);
  const diagnosticJson = JSON.stringify(
    {
      activeFace,
      capturedFaces,
      diagnostics,
    },
    null,
    2,
  );

  async function copyDiagnostic() {
    await navigator.clipboard.writeText(diagnosticJson);
  }

  return (
    <section className="scan-diagnostics" aria-label="스캔 진단 데이터">
      <div className="scan-diagnostics-header">
        <div>
          <h3>스캔 진단</h3>
          <p>정렬된 큐브 한 면을 수동 인식하면 9칸 원본 RGB, 보정 전/후 분류, 신뢰도가 기록됩니다.</p>
        </div>
        <button className="button secondary" onClick={copyDiagnostic} disabled={capturedFaces.length === 0}>
          진단 JSON 복사
        </button>
      </div>

      <div className="diagnostic-face-list" aria-label="진단 완료 면">
        {FACE_ORDER.map((face) => (
          <span key={face} className={diagnostics[face] ? "diagnostic-face captured" : "diagnostic-face"}>
            {face}
          </span>
        ))}
      </div>

      {diagnostic ? (
        <>
          <div className="diagnostic-summary">
            <span>면 {diagnostic.face}</span>
            <span>기대 색상 {COLOR_LABEL[diagnostic.expectedColor]}</span>
            <span>평균 신뢰도 {Math.round(diagnostic.averageConfidence * 100)}%</span>
            <span>불일치 {diagnostic.mismatchedIndexes.length}칸</span>
            <span>낮은 신뢰도 {diagnostic.lowConfidenceCount}칸</span>
          </div>
          <p className={diagnostic.mismatchedIndexes.length > 0 ? "diagnostic-reason warning" : "diagnostic-reason"}>
            {diagnostic.readinessReason}
            {diagnostic.mismatchedIndexes.length > 0 ? ` 불일치 칸: ${diagnostic.mismatchedIndexes.map((index) => index + 1).join(", ")}` : ""}
          </p>
          <div className="diagnostic-grid" role="table" aria-label={`${diagnostic.face} 면 색상 진단`}>
            <div className="diagnostic-row diagnostic-heading" role="row">
              <span>칸</span>
              <span>RGB</span>
              <span>보정 전</span>
              <span>보정 후</span>
              <span>기대</span>
            </div>
            {diagnostic.stickers.map((sticker) => (
              <div key={sticker.index} className={sticker.afterColor === sticker.expectedColor ? "diagnostic-row" : "diagnostic-row mismatch"} role="row">
                <span>{sticker.index + 1}</span>
                <span>{formatRgb(sticker.rgb)}</span>
                <span>
                  {COLOR_LABEL[sticker.beforeColor]} {Math.round(sticker.beforeConfidence * 100)}%
                </span>
                <span>
                  {COLOR_LABEL[sticker.afterColor]} {Math.round(sticker.afterConfidence * 100)}%
                </span>
                <span>{COLOR_LABEL[sticker.expectedColor]}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="diagnostic-empty">아직 {activeFace} 면 진단 데이터가 없습니다. 자동 인식을 끄고 카메라에서 인식을 누르세요.</p>
      )}
    </section>
  );
}

function ReviewNotice({ indexes }: { indexes: number[] }) {
  if (indexes.length === 0) {
    return <p className="review-notice">신뢰도 {Math.round(LOW_CONFIDENCE_THRESHOLD * 100)}% 미만 칸이 없습니다.</p>;
  }

  return (
    <p className="review-notice warning">
      낮은 신뢰도 칸: {indexes.map((index) => index + 1).join(", ")}. 다시 인식하거나 팔레트로 해당 칸을 수정하세요.
    </p>
  );
}

function AutoScanReadiness({ readiness, enabled }: { readiness: FaceReadiness | null; enabled: boolean }) {
  if (!enabled) return <p className="auto-scan-status">자동 인식이 꺼져 있습니다.</p>;
  if (!readiness) return <p className="auto-scan-status">카메라 프레임을 확인하고 있습니다.</p>;

  return (
    <p className={readiness.ready ? "auto-scan-status ready" : "auto-scan-status"}>
      {readiness.reason} 평균 신뢰도 {Math.round(readiness.averageConfidence * 100)}%, 낮은 신뢰도 {readiness.lowConfidenceCount}칸
    </p>
  );
}

function getFaceSignature(face: CubeFace): string {
  return face.stickers.map((sticker) => sticker.color).join("-");
}

function getCenterCalibrationMessage(face: FaceName, result: CenterCalibratedRecognition, action: string): string {
  const confidence = Math.round(result.averageConfidence * 100);
  if (result.calibrationApplied) {
    return `${face} 면을 ${action}. ${COLOR_LABEL[result.expectedCenterColor]} 센터 보정을 반영했고 평균 신뢰도는 ${confidence}%입니다.`;
  }

  return `${face} 면을 ${action}. 센터 샘플이 ${COLOR_LABEL[result.centerDetectedColor]}처럼 보여 보정은 건너뛰고 센터 색상만 ${COLOR_LABEL[result.expectedCenterColor]}로 고정했습니다. 평균 신뢰도는 ${confidence}%입니다.`;
}

function createScanDiagnostic(
  face: FaceName,
  samples: RgbColor[],
  beforeFace: CubeFace,
  readiness: FaceReadiness,
  afterFace: CubeFace,
  averageConfidence: number,
): ScanDiagnostic {
  const expectedColor = FACE_COLORS[face];
  const stickers = samples.map((rgb, index): StickerDiagnostic => {
    const beforeSticker = beforeFace.stickers[index];
    const afterSticker = afterFace.stickers[index];
    return {
      index,
      rgb,
      beforeColor: beforeSticker.color,
      beforeConfidence: beforeSticker.confidence,
      afterColor: afterSticker.color,
      afterConfidence: afterSticker.confidence,
      expectedColor,
    };
  });

  return {
    face,
    expectedColor,
    capturedAt: new Date().toISOString(),
    averageConfidence,
    readinessReason: readiness.reason,
    lowConfidenceCount: readiness.lowConfidenceCount,
    mismatchedIndexes: stickers.filter((sticker) => sticker.afterColor !== expectedColor).map((sticker) => sticker.index),
    stickers,
  };
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
