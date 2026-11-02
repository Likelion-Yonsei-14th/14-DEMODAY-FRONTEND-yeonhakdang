/**
 * 지지(子丑寅…) — 띠, 합·충, 천을귀인. Pure: the traditional tables only.
 */
import type { Element } from "./elements.ts";

export type Branch = "자" | "축" | "인" | "묘" | "진" | "사" | "오" | "미" | "신" | "유" | "술" | "해";

export const BRANCHES: Branch[] = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

const HANJA = "子丑寅卯辰巳午未申酉戌亥";
const ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
const ELEMENT: Element[] = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"];

export const branchHanja = (b: Branch) => HANJA[BRANCHES.indexOf(b)];
export const branchAnimal = (b: Branch) => ANIMALS[BRANCHES.indexOf(b)];
export const branchElement = (b: Branch) => ELEMENT[BRANCHES.indexOf(b)];

/** 지지 of a year: 2026 → 오(말띠). */
export function yearBranch(year: number): Branch {
  return BRANCHES[(((year - 4) % 12) + 12) % 12];
}

/** 육합: 자축 · 인해 · 묘술 · 진유 · 사신 · 오미 — index sums to 1 or 13 (mod 12). */
const SIX_HARMONY = (a: number, b: number) => (a + b) % 12 === 1;

/** 삼합: 신자진 · 해묘미 · 인오술 · 사유축 — four apart. */
const THREE_HARMONY = (a: number, b: number) => a !== b && (a - b + 12) % 4 === 0;

export type BranchRelation = "육합" | "삼합" | "같은 지지" | "없음" | "충";

export function branchRelation(a: Branch, b: Branch): BranchRelation {
  const i = BRANCHES.indexOf(a);
  const j = BRANCHES.indexOf(b);
  if (i === j) return "같은 지지";
  if (SIX_HARMONY(i, j)) return "육합";
  if (THREE_HARMONY(i, j)) return "삼합";
  if ((i - j + 12) % 12 === 6) return "충";
  return "없음";
}

/** The branch that 충s `b`: six apart. */
export function clashOf(b: Branch): Branch {
  return BRANCHES[(BRANCHES.indexOf(b) + 6) % 12];
}

/** 천을귀인: 갑무경 축미, 을기 자신, 병정 해유, 신 인오, 임계 사묘. */
const CHEONEUL: Record<string, [Branch, Branch]> = {
  갑: ["축", "미"],
  무: ["축", "미"],
  경: ["축", "미"],
  을: ["자", "신"],
  기: ["자", "신"],
  병: ["해", "유"],
  정: ["해", "유"],
  신: ["인", "오"],
  임: ["사", "묘"],
  계: ["사", "묘"],
};

/** The two 천을귀인 지지 of a 일간 (its 한글 천간, e.g. "갑"). */
export function cheoneul(dayStem: string): [Branch, Branch] {
  const pair = CHEONEUL[dayStem];
  if (!pair) throw new Error(`Unknown 천간: ${dayStem}`);
  return pair;
}
