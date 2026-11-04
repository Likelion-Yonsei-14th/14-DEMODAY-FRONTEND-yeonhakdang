/**
 * 천간 · 지지 · 60갑자의 순서와 음양. Pure tables only.
 */
import { BRANCHES, branchElement, branchHanja, type Branch } from "./branches.ts";
import { ELEMENTS, type Element } from "./elements.ts";

export const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const STEMS_HANJA = "甲乙丙丁戊己庚辛壬癸";

function stemIndex(stem: string): number {
  const i = STEMS.indexOf(stem);
  if (i < 0) throw new Error(`Unknown 천간: ${stem}`);
  return i;
}

export const stemHanja = (stem: string) => STEMS_HANJA[stemIndex(stem)];
/** 갑을 목 · 병정 화 · 무기 토 · 경신 금 · 임계 수 */
export const stemElement = (stem: string): Element => ELEMENTS[Math.floor(stemIndex(stem) / 2)];
/** 갑병무경임 양, 을정기신계 음. */
export const stemIsYang = (stem: string) => stemIndex(stem) % 2 === 0;

/** 60갑자: 갑자, 을축, … 계해. */
export const JIAZI: string[] = Array.from({ length: 60 }, (_, i) => STEMS[i % 10] + BRANCHES[i % 12]);

/** `step` places after (negative: before) a 간지 in the 60갑자. */
export function shiftJiazi(hangul: string, step: number): string {
  const i = JIAZI.indexOf(hangul);
  if (i < 0) throw new Error(`Unknown 간지: ${hangul}`);
  return JIAZI[(((i + step) % 60) + 60) % 60];
}

export type GanzhiParts = {
  hangul: string;
  hanja: string;
  stem: string;
  branch: Branch;
  stemElement: Element;
  branchElement: Element;
};

export function ganzhiParts(hangul: string): GanzhiParts {
  const stem = hangul[0];
  const branch = hangul[1] as Branch;
  if (!BRANCHES.includes(branch)) throw new Error(`Unknown 지지: ${hangul}`);
  return {
    hangul,
    hanja: stemHanja(stem) + branchHanja(branch),
    stem,
    branch,
    stemElement: stemElement(stem),
    branchElement: branchElement(branch),
  };
}
