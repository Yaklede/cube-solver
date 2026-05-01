import { Camera, CameraOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { requestCameraStream } from "@/core/camera";

interface CameraPreviewProps {
  showGuide?: boolean;
  onReady?: (video: HTMLVideoElement) => void;
}

export function CameraPreview({ showGuide = true, onReady }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "error">("idle");
  const [message, setMessage] = useState("카메라를 준비하고 있습니다.");

  useEffect(() => {
    let stream: MediaStream | undefined;
    requestCameraStream(navigator.mediaDevices)
      .then((nextStream) => {
        stream = nextStream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = nextStream;
        video.onloadedmetadata = () => {
          video.play().catch(() => undefined);
          setStatus("ready");
          setMessage("카메라 프리뷰가 활성화되었습니다.");
          onReady?.(video);
        };
      })
      .catch((error: Error) => {
        setStatus("error");
        setMessage(error.message);
      });

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onReady]);

  return (
    <section className="camera-frame" aria-label="카메라 프리뷰">
      <video ref={videoRef} className="camera-video" playsInline muted />
      {showGuide ? <CubeScanGuide /> : null}
      <div className={`camera-status camera-status-${status}`}>
        {status === "error" ? <CameraOff size={18} /> : <Camera size={18} />}
        <span>{message}</span>
      </div>
    </section>
  );
}

export function CubeScanGuide() {
  return (
    <div className="scan-guide" aria-hidden="true">
      {Array.from({ length: 9 }, (_, index) => (
        <div key={index} className="scan-guide-cell" />
      ))}
    </div>
  );
}
