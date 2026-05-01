import type { UserSettings } from "@/core/models";

export const SETTINGS_STORAGE_KEY = "cube-solver-settings-v1";

export function createDefaultSettings(): UserSettings {
  return {
    language: "ko",
    preferredCrossColor: "white",
    slowPlaybackMs: 900,
    showMoveDescriptions: true,
    storageVersion: 1,
  };
}

export function loadSettings(storage: Pick<Storage, "getItem">): UserSettings {
  const raw = storage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) return createDefaultSettings();
  try {
    return {
      ...createDefaultSettings(),
      ...JSON.parse(raw),
    };
  } catch {
    return createDefaultSettings();
  }
}

export function saveSettings(storage: Pick<Storage, "setItem">, settings: UserSettings): void {
  storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
