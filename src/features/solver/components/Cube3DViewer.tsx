import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import * as THREE from "three";
import {
  getMoveAngle,
  getMoveAxis,
  getMoveLayers,
  getStickerRenderPosition,
  STICKER_PLACEMENTS,
  VISUAL_CUBIE_SIZE,
  VISUAL_FACE_COLORS,
  VISUAL_LOGICAL_SCALE,
} from "@/core/cube-visualization";
import type { FaceName, Move } from "@/core/models";

interface Cube3DViewerProps {
  stateString: string;
  moves: Move[];
  appliedMoveCount: number;
}

interface SceneState {
  camera: THREE.PerspectiveCamera;
  cubeRoot: THREE.Group;
  renderer: THREE.WebGLRenderer;
  resizeObserver: ResizeObserver;
  rafId: number;
  animationId?: number;
  renderedState: string;
  renderedMoveCount: number;
}

const STICKER_SIZE = 0.58;
export const CUBE_IDLE_ROTATION_RADIANS_PER_FRAME = 0;

const SYMBOL_COLOR: Record<FaceName, string> = {
  U: VISUAL_FACE_COLORS.U,
  R: VISUAL_FACE_COLORS.R,
  F: VISUAL_FACE_COLORS.F,
  D: VISUAL_FACE_COLORS.D,
  L: VISUAL_FACE_COLORS.L,
  B: VISUAL_FACE_COLORS.B,
};

export function Cube3DViewer({ stateString, moves, appliedMoveCount }: Cube3DViewerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<SceneState | null>(null);
  const dragRef = useRef<{ dragging: boolean; pointerId: number | null; x: number; y: number }>({
    dragging: false,
    pointerId: null,
    x: 0,
    y: 0,
  });

  const rotateView = useCallback((deltaX: number, deltaY: number) => {
    const cubeRoot = sceneRef.current?.cubeRoot;
    if (!cubeRoot) return;
    cubeRoot.rotation.y += deltaX;
    cubeRoot.rotation.x = clampRotation(cubeRoot.rotation.x + deltaY);
  }, []);

  const resetView = useCallback(() => {
    const cubeRoot = sceneRef.current?.cubeRoot;
    if (!cubeRoot) return;
    cubeRoot.rotation.set(0, 0, 0);
  }, []);

  const startDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    dragRef.current = {
      dragging: true,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const dragView = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag.dragging || drag.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - drag.x;
      const deltaY = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;
      rotateView(deltaX * 0.008, deltaY * 0.008);
    },
    [rotateView],
  );

  const stopDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId === event.pointerId) {
      dragRef.current.dragging = false;
      dragRef.current.pointerId = null;
    }
  }, []);

  const handleStageKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        rotateView(-0.14, 0);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        rotateView(0.14, 0);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        rotateView(0, -0.14);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        rotateView(0, 0.14);
      }
    },
    [rotateView],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f7f8fa");

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(3.8, 3.3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = "cube-viewer-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const cubeRoot = new THREE.Group();
    scene.add(cubeRoot);
    scene.add(new THREE.AmbientLight("#ffffff", 2.3));
    const keyLight = new THREE.DirectionalLight("#ffffff", 2.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight("#ffffff", 1.1);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    const syncSize = () => {
      const { width, height } = host.getBoundingClientRect();
      const safeWidth = Math.max(1, width);
      const safeHeight = Math.max(1, height);
      camera.aspect = safeWidth / safeHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(safeWidth, safeHeight, false);
    };
    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(host);
    syncSize();

    let rafId = 0;
    const render = () => {
      if (CUBE_IDLE_ROTATION_RADIANS_PER_FRAME !== 0) {
        cubeRoot.rotation.y += CUBE_IDLE_ROTATION_RADIANS_PER_FRAME;
      }
      renderer.render(scene, camera);
      rafId = window.requestAnimationFrame(render);
    };
    rafId = window.requestAnimationFrame(render);

    sceneRef.current = {
      camera,
      cubeRoot,
      renderer,
      resizeObserver,
      rafId,
      renderedState: "",
      renderedMoveCount: 0,
    };
    renderCubeState(cubeRoot, stateString);
    sceneRef.current.renderedState = stateString;
    sceneRef.current.renderedMoveCount = appliedMoveCount;

    return () => {
      const current = sceneRef.current;
      if (current?.animationId) window.cancelAnimationFrame(current.animationId);
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      disposeChildren(cubeRoot);
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const sceneState = sceneRef.current;
    if (!sceneState) return;

    const previousCount = sceneState.renderedMoveCount;
    const previousState = sceneState.renderedState;
    const delta = appliedMoveCount - previousCount;
    if (sceneState.animationId) window.cancelAnimationFrame(sceneState.animationId);

    if (Math.abs(delta) !== 1 || previousState.length !== 54) {
      renderCubeState(sceneState.cubeRoot, stateString);
      sceneState.renderedState = stateString;
      sceneState.renderedMoveCount = appliedMoveCount;
      return;
    }

    const moveIndex = delta > 0 ? previousCount : appliedMoveCount;
    const move = moves[moveIndex];
    if (!move) {
      renderCubeState(sceneState.cubeRoot, stateString);
      sceneState.renderedState = stateString;
      sceneState.renderedMoveCount = appliedMoveCount;
      return;
    }

    animateMove(sceneState, previousState, stateString, move, delta > 0 ? 1 : -1);
    sceneState.renderedState = stateString;
    sceneState.renderedMoveCount = appliedMoveCount;
  }, [appliedMoveCount, moves, stateString]);

  return (
    <section className="cube-viewer" aria-label="현재 풀이 단계 3D 큐브">
      <div className="cube-viewer-header">
        <h3>3D 큐브</h3>
        <span>{formatRenderedMoveStatus(appliedMoveCount, moves.length)}</span>
      </div>
      <div
        ref={hostRef}
        className="cube-viewer-stage"
        data-testid="cube-3d-stage"
        role="img"
        tabIndex={0}
        aria-label="드래그하거나 화살표 키로 3D 큐브 시점 조절"
        onKeyDown={handleStageKeyDown}
        onPointerCancel={stopDrag}
        onPointerDown={startDrag}
        onPointerMove={dragView}
        onPointerUp={stopDrag}
      />
      <div className="cube-viewer-controls" aria-label="3D 큐브 시점 제어">
        <button type="button" className="cube-viewer-control" onClick={() => rotateView(-0.28, 0)} aria-label="왼쪽으로 돌리기">
          <ArrowLeft size={16} />
        </button>
        <button type="button" className="cube-viewer-control" onClick={() => rotateView(0.28, 0)} aria-label="오른쪽으로 돌리기">
          <ArrowRight size={16} />
        </button>
        <button type="button" className="cube-viewer-control" onClick={() => rotateView(0, -0.28)} aria-label="위쪽 면 보기">
          <ArrowUp size={16} />
        </button>
        <button type="button" className="cube-viewer-control" onClick={() => rotateView(0, 0.28)} aria-label="아래쪽 면 보기">
          <ArrowDown size={16} />
        </button>
        <button type="button" className="cube-viewer-control" onClick={resetView} aria-label="시점 초기화">
          <RotateCcw size={16} />
        </button>
      </div>
    </section>
  );
}

export function formatRenderedMoveStatus(appliedMoveCount: number, totalMoveCount: number): string {
  if (totalMoveCount <= 0) return "현재 상태";
  const safeAppliedCount = Math.min(totalMoveCount, Math.max(0, appliedMoveCount));
  if (safeAppliedCount === 0) return `시작 상태 · 0 / ${totalMoveCount}`;
  if (safeAppliedCount === totalMoveCount) return `완료 상태 · ${totalMoveCount} / ${totalMoveCount}`;
  return `${safeAppliedCount}수 반영 · ${safeAppliedCount} / ${totalMoveCount}`;
}

function animateMove(sceneState: SceneState, previousState: string, targetState: string, move: Move, direction: 1 | -1) {
  renderCubeState(sceneState.cubeRoot, previousState);

  const pivot = new THREE.Group();
  sceneState.cubeRoot.add(pivot);
  const axis = getMoveAxis(move.face);
  const layers = getMoveLayers(move.face);
  const movingObjects = [...sceneState.cubeRoot.children].filter((child) => {
    const logicalPosition = child.userData.logicalPosition as [number, number, number] | undefined;
    return logicalPosition ? layers.includes(logicalPosition[axis]) : false;
  });
  for (const object of movingObjects) {
    pivot.attach(object);
  }

  const angle = getMoveAngle(move, direction);
  const startedAt = performance.now();
  const duration = 320;

  const tick = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = easeOutCubic(progress);
    pivot.rotation.set(0, 0, 0);
    if (axis === 0) pivot.rotation.x = angle * eased;
    if (axis === 1) pivot.rotation.y = angle * eased;
    if (axis === 2) pivot.rotation.z = angle * eased;

    if (progress < 1) {
      sceneState.animationId = window.requestAnimationFrame(tick);
      return;
    }

    renderCubeState(sceneState.cubeRoot, targetState);
    sceneState.animationId = undefined;
  };

  sceneState.animationId = window.requestAnimationFrame(tick);
}

function renderCubeState(root: THREE.Group, stateString: string) {
  disposeChildren(root);
  root.clear();
  addCubies(root);
  addStickers(root, stateString);
}

function addCubies(root: THREE.Group) {
  const geometry = new THREE.BoxGeometry(VISUAL_CUBIE_SIZE, VISUAL_CUBIE_SIZE, VISUAL_CUBIE_SIZE);
  const material = new THREE.MeshStandardMaterial({ color: "#111827", roughness: 0.74, metalness: 0.02 });

  for (const x of [-1, 0, 1]) {
    for (const y of [-1, 0, 1]) {
      for (const z of [-1, 0, 1]) {
        const cubie = new THREE.Mesh(geometry, material);
        cubie.position.set(x * VISUAL_LOGICAL_SCALE, y * VISUAL_LOGICAL_SCALE, z * VISUAL_LOGICAL_SCALE);
        cubie.userData.logicalPosition = [x, y, z];
        root.add(cubie);
      }
    }
  }
}

function addStickers(root: THREE.Group, stateString: string) {
  const geometry = new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE);
  for (const placement of STICKER_PLACEMENTS) {
    const symbol = stateString[placement.index] as FaceName | undefined;
    const material = new THREE.MeshStandardMaterial({
      color: SYMBOL_COLOR[symbol as FaceName] ?? "#9ca3af",
      roughness: 0.52,
      metalness: 0.01,
      side: THREE.DoubleSide,
    });
    const sticker = new THREE.Mesh(geometry, material);
    const normal = new THREE.Vector3(...placement.normal);
    sticker.position.set(...getStickerRenderPosition(placement));
    sticker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    sticker.userData.logicalPosition = placement.position;
    root.add(sticker);
  }
}

function disposeChildren(root: THREE.Object3D) {
  const disposedGeometries = new Set<THREE.BufferGeometry>();
  const disposedMaterials = new Set<THREE.Material>();
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry && !disposedGeometries.has(mesh.geometry)) {
      disposedGeometries.add(mesh.geometry);
      mesh.geometry.dispose();
    }
    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((item) => {
        if (disposedMaterials.has(item)) return;
        disposedMaterials.add(item);
        item.dispose();
      });
    } else if (material && !disposedMaterials.has(material)) {
      disposedMaterials.add(material);
      material.dispose();
    }
  });
}

function easeOutCubic(value: number): number {
  return 1 - (1 - value) ** 3;
}

function clampRotation(value: number): number {
  const limit = Math.PI / 2.4;
  return Math.max(-limit, Math.min(limit, value));
}
