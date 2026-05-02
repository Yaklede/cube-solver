import { describe, expect, it } from "vitest";
import { SOLVED_STATE_STRING } from "@/core/cube-state";
import { applyMoves, parseAlgorithm } from "@/core/moves";
import {
  buildOrientationGuide,
  formatOrientationInstruction,
  orientMovesForMode,
  orientStateForMode,
} from "@/core/orientation-guide";

describe("solver orientation guide", () => {
  it("uses a white-bottom beginner grip by default", () => {
    const guide = buildOrientationGuide(SOLVED_STATE_STRING);

    expect(guide.map((item) => `${item.label}:${item.colorName}`)).toEqual(["아래:흰색", "앞:초록", "오른쪽:주황"]);
    expect(formatOrientationInstruction(guide)).toBe("흰색 센터를 아래, 초록 센터를 앞, 주황 센터를 오른쪽으로 잡고 첫 수를 시작하세요.");
  });

  it("can build a white-top grip guide from center stickers", () => {
    const guide = buildOrientationGuide(SOLVED_STATE_STRING, "white-top");

    expect(guide.map((item) => `${item.label}:${item.colorName}`)).toEqual(["위:흰색", "앞:초록", "오른쪽:빨강"]);
    expect(formatOrientationInstruction(guide)).toBe("흰색 센터를 위, 초록 센터를 앞, 빨강 센터를 오른쪽으로 잡고 첫 수를 시작하세요.");
  });

  it("rotates the visual state into a white-bottom frame", () => {
    const oriented = orientStateForMode(SOLVED_STATE_STRING, "white-bottom");
    const centers = [4, 13, 22, 31, 40, 49].map((index) => oriented[index]);

    expect(centers).toEqual(["D", "L", "F", "U", "R", "B"]);
  });

  it("presents moves in the selected white-bottom frame", () => {
    const displayed = orientMovesForMode(parseAlgorithm("U R F D L B M E S u r"), "white-bottom");

    expect(displayed.map((move) => move.notation)).toEqual(["D", "L", "F", "U", "R", "B", "M'", "E'", "S", "d", "l"]);
    expect(displayed[0].koreanInstruction).toContain("아랫면");
  });

  it("keeps oriented visual state and displayed moves in sync", () => {
    const state = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01";
    const internalMoves = parseAlgorithm("U R F D L B M E S u r f d l b U' M' E' S'");
    const displayedMoves = orientMovesForMode(internalMoves, "white-bottom");

    expect(orientStateForMode(applyMoves(state, internalMoves), "white-bottom")).toBe(
      applyMoves(orientStateForMode(state, "white-bottom"), displayedMoves),
    );
  });
});
