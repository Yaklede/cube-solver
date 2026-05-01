import type { FaceName } from "@/core/models";

export type DevicePracticeMode = "full-solve" | "full-scramble" | "d-cross" | "f2l" | "oll" | "pll";

export type DeviceCommandType = "solve" | "scramble" | "setup-practice-case";

export interface DevicePracticePlan {
  id: string;
  mode: DevicePracticeMode;
  title: string;
  description: string;
  targetStages: string[];
  learnerAction: string;
  deviceAction: string;
  requiredCameraCheckpoints: string[];
  safetyNotes: string[];
}

export interface DeviceCommandPreview {
  type: DeviceCommandType;
  mode: DevicePracticeMode;
  targetStage?: string;
  targetCaseId?: string;
  notation?: string;
  holdReference: {
    up: FaceName;
    front: FaceName;
    right: FaceName;
  };
  requiresCameraCheck: boolean;
  requiresUserConfirmation: boolean;
  safetyChecklist: string[];
}

export const DEVICE_PRACTICE_PLANS: DevicePracticePlan[] = [
  {
    id: "device-full-solve",
    mode: "full-solve",
    title: "전체 맞춤 보조",
    description: "사용자가 현재 상태를 카메라로 검증하면 장치가 전체 풀이 수순을 대신 수행하는 장기 확장 모드입니다.",
    targetStages: ["Solver"],
    learnerAction: "큐브를 장치에 올리기 전 카메라로 6면 상태를 확인하고 시작 기준을 선택합니다.",
    deviceAction: "검증된 풀이 수순을 회전 명령으로 변환해 전체 큐브를 맞춥니다.",
    requiredCameraCheckpoints: ["6면 색상 수량 검증", "센터 방향 검증", "첫 수 시작 기준 검증", "완료 상태 재검증"],
    safetyNotes: ["모터 동작 전 손을 떼야 합니다.", "큐브 고정 상태를 확인해야 합니다.", "풀이 중 강제 정지 버튼이 필요합니다."],
  },
  {
    id: "device-full-scramble",
    mode: "full-scramble",
    title: "전체 스크램블",
    description: "일반 연습용으로 표준 스크램블을 생성하고 장치가 대신 섞어주는 모드입니다.",
    targetStages: ["Scramble"],
    learnerAction: "스크램블 이후 카메라로 상태를 확인하고 직접 풀이를 시작합니다.",
    deviceAction: "표준 회전 표기법으로 생성된 스크램블을 장치 회전 명령으로 변환합니다.",
    requiredCameraCheckpoints: ["스크램블 수행 전 완료 상태 확인", "스크램블 후 유효 상태 확인"],
    safetyNotes: ["스크램블 길이 제한이 필요합니다.", "장치와 UI의 회전 기준을 동일하게 유지해야 합니다."],
  },
  {
    id: "device-d-cross",
    mode: "d-cross",
    title: "D-Cross 전용 섞기",
    description: "Cross 계획 연습을 위해 네 개의 Cross 엣지가 추적 가능한 상태를 준비합니다.",
    targetStages: ["D-Cross"],
    learnerAction: "15초 인스펙션으로 엣지 위치를 말하고 직접 Cross를 수행합니다.",
    deviceAction: "Cross 연습용 상태로 섞고, 성공 후 다음 난이도 상태를 준비합니다.",
    requiredCameraCheckpoints: ["Cross 엣지 위치 확인", "색상 중립 옵션 확인", "Cross 완료 검증"],
    safetyNotes: ["연습 난이도별 스크램블 세트를 분리해야 합니다."],
  },
  {
    id: "device-f2l",
    mode: "f2l",
    title: "F2L 케이스 생성",
    description: "특정 코너-엣지 페어 케이스를 반복 연습할 수 있게 큐브를 준비합니다.",
    targetStages: ["F2L"],
    learnerAction: "페어를 찾고 쉬운 삽입/빠른 삽입 중 하나를 선택해 수행합니다.",
    deviceAction: "선택한 F2L 케이스로 섞고 슬롯 성공 여부를 카메라 검증으로 넘깁니다.",
    requiredCameraCheckpoints: ["페어 위치 확인", "목표 슬롯 확인", "수행 후 슬롯 해결 검증"],
    safetyNotes: ["특정 케이스 생성은 큐브 상태 유효성 검증을 반드시 거쳐야 합니다."],
  },
  {
    id: "device-oll",
    mode: "oll",
    title: "OLL 케이스 생성",
    description: "2-Look OLL 또는 Full OLL 케이스를 선택해 반복 출제합니다.",
    targetStages: ["OLL"],
    learnerAction: "윗면 패턴을 보고 공식을 떠올린 뒤 수행 시간을 기록합니다.",
    deviceAction: "선택한 OLL 케이스로 섞고 사용자가 수행한 뒤 윗면 완성 여부를 검증합니다.",
    requiredCameraCheckpoints: ["OLL 케이스 확인", "윗면 색상 완성 검증"],
    safetyNotes: ["케이스 생성 후 사용자가 실제 패턴을 확인할 시간을 제공해야 합니다."],
  },
  {
    id: "device-pll",
    mode: "pll",
    title: "PLL 케이스 생성",
    description: "Aa, Ab, T, J, Y, H, Z 등 헷갈리는 PLL 케이스를 반복 출제합니다.",
    targetStages: ["PLL"],
    learnerAction: "헤드라이트와 바 위치를 확인하고 맞는 PLL 공식을 수행합니다.",
    deviceAction: "선택한 PLL 케이스로 섞고, 수행 후 완성 상태와 시간을 기록합니다.",
    requiredCameraCheckpoints: ["OLL 완료 상태 확인", "PLL 케이스 확인", "큐브 완료 검증"],
    safetyNotes: ["완료 상태가 아니면 다음 케이스로 자동 전환하지 않습니다."],
  },
];

export function createDeviceCommandPreview(
  plan: DevicePracticePlan,
  options: {
    targetCaseId?: string;
    notation?: string;
    holdReference?: DeviceCommandPreview["holdReference"];
  } = {},
): DeviceCommandPreview {
  const isSolve = plan.mode === "full-solve";
  const isScramble = plan.mode === "full-scramble";

  return {
    type: isSolve ? "solve" : isScramble ? "scramble" : "setup-practice-case",
    mode: plan.mode,
    targetStage: plan.targetStages[0],
    targetCaseId: options.targetCaseId,
    notation: options.notation,
    holdReference: options.holdReference ?? {
      up: "U",
      front: "F",
      right: "R",
    },
    requiresCameraCheck: true,
    requiresUserConfirmation: true,
    safetyChecklist: plan.safetyNotes,
  };
}
