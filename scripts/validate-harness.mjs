import fs from "node:fs";

const requiredFiles = [
  "AGENTS.md",
  "README.md",
  "ARCHITECTURE.md",
  "DEVELOPMENT_PLAN.md",
  "TEST_PLAN.md",
  "BUILD_GUIDE.md",
  "USER_GUIDE.md",
  "DATA_MODEL.md",
  "docs/agent-harness/README.md",
  "docs/agent-harness/validation.md",
  "docs/stage-reports/STAGE_REPORTS.md",
  ".github/workflows/ci.yml",
];

const errors = requiredFiles.filter((file) => !fs.existsSync(file)).map((file) => `Missing harness file: ${file}`);

const report = fs.existsSync("docs/stage-reports/STAGE_REPORTS.md") ? fs.readFileSync("docs/stage-reports/STAGE_REPORTS.md", "utf8") : "";
for (let step = 1; step <= 20; step += 1) {
  if (!report.includes(`단계 번호: ${step}`)) errors.push(`Missing stage report: ${step}`);
}

const architecture = fs.existsSync("ARCHITECTURE.md") ? fs.readFileSync("ARCHITECTURE.md", "utf8") : "";
for (const section of ["요구사항 재정의", "기술 스택 후보 비교", "최종 기술 스택", "전체 아키텍처", "위험 요소"]) {
  if (!architecture.includes(section)) errors.push(`Missing architecture section: ${section}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("harness validation passed");
