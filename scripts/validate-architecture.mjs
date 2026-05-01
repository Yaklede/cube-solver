import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const coreDir = path.join(root, "src/core");
const errors = [];

function readFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return readFiles(fullPath);
    return fullPath.endsWith(".ts") || fullPath.endsWith(".tsx") ? [fullPath] : [];
  });
}

for (const file of readFiles(coreDir)) {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("@/features") || content.includes("@/app")) {
    errors.push(`Core layer must not import UI layers: ${path.relative(root, file)}`);
  }
}

const requiredDirs = ["src/core", "src/features", "src/data", "tests", "scripts", "docs"];
for (const dir of requiredDirs) {
  if (!fs.existsSync(path.join(root, dir))) errors.push(`Missing required directory: ${dir}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("architecture validation passed");
