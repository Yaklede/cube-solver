import type { Algorithm, Method } from "@/core/models";
import methodsData from "@/data/methods.json";
import algorithmsData from "@/data/algorithms.json";

export const methods = methodsData as Method[];
export const algorithms = algorithmsData as Algorithm[];

export const dataExtensionGuides = {
  fullOll: "Add Full OLL cases to src/data/algorithms.json with stageName='OLL' and tags including 'full-oll'.",
  fullPll: "Add Full PLL cases to src/data/algorithms.json with stageName='PLL' and tags including 'full-pll'.",
};
