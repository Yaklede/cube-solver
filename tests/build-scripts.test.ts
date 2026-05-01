import { describe, expect, it } from "vitest";
import packageJson from "../package.json";
import tauriConfig from "../src-tauri/tauri.conf.json";

describe("platform build scripts", () => {
  it("documents required web and platform scripts", () => {
    expect(packageJson.scripts.dev).toContain("vite");
    expect(packageJson.scripts.build).toContain("vite build");
    expect(packageJson.scripts["tauri:build"]).toBe("tauri build");
    expect(packageJson.scripts["mobile:pwa"]).toContain("preview");
  });

  it("configures native desktop bundle targets", () => {
    expect(tauriConfig.bundle.targets).toContain("dmg");
    expect(tauriConfig.bundle.targets).toContain("msi");
    expect(tauriConfig.bundle.targets).toContain("nsis");
  });
});
