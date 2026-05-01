import fs from "node:fs";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const tauriConfig = JSON.parse(fs.readFileSync("src-tauri/tauri.conf.json", "utf8"));
const requiredScripts = ["dev", "build", "test", "validate:all", "tauri:build", "mobile:pwa"];
const errors = [];

for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) errors.push(`Missing package script: ${script}`);
}

for (const target of ["dmg", "msi", "nsis"]) {
  if (!tauriConfig.bundle?.targets?.includes(target)) errors.push(`Missing Tauri bundle target: ${target}`);
}

if (!fs.existsSync("public/manifest.webmanifest")) errors.push("Missing PWA manifest");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("build script validation passed");
