import { describe, expect, it } from "vitest";
import { createDefaultSettings, loadSettings, saveSettings } from "@/core/settings";

describe("settings persistence", () => {
  it("saves and loads user settings", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    };
    const settings = createDefaultSettings();
    settings.preferredCrossColor = "color-neutral";
    settings.slowPlaybackMs = 1200;

    saveSettings(storage, settings);

    expect(loadSettings(storage).preferredCrossColor).toBe("color-neutral");
    expect(loadSettings(storage).slowPlaybackMs).toBe(1200);
  });
});
