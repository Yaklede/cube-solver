declare module "rubiks-cube-solver" {
  export interface FridrichSolution {
    cross?: string[];
    f2l?: string[];
    oll?: string;
    pll?: string;
  }

  export default function solve(cubeState: string, options?: { partitioned?: boolean }): string | FridrichSolution;
}
