/**
 * 오행(목·화·토·금·수) and how they relate. Pure: no data files, no React.
 * Imports in lib/saju carry their .ts extension so `node --test` runs them as-is.
 */

export type Element = "목" | "화" | "토" | "금" | "수";

/** The 상생 order. Also the tie-break order wherever two elements are equal. */
export const ELEMENTS: Element[] = ["목", "화", "토", "금", "수"];

export const ELEMENT_HANJA: Record<Element, string> = {
  목: "木",
  화: "火",
  토: "土",
  금: "金",
  수: "水",
};

export function isElement(value: string): value is Element {
  return (ELEMENTS as string[]).includes(value);
}

/** "목(木)" */
export function elementLabel(e: Element): string {
  return `${e}(${ELEMENT_HANJA[e]})`;
}

/** 상생: 목→화→토→금→수→목 — the element `e` feeds. */
export function generates(e: Element): Element {
  return ELEMENTS[(ELEMENTS.indexOf(e) + 1) % ELEMENTS.length];
}

export type ElementCounts = Record<Element, number>;

export function emptyCounts(): ElementCounts {
  return { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
}

/** Strongest first; equal counts keep the 상생 order. */
export function byStrength(counts: ElementCounts): Element[] {
  return [...ELEMENTS].sort((a, b) => counts[b] - counts[a]);
}

/** Weakest first; equal counts keep the 상생 order. */
export function byWeakness(counts: ElementCounts): Element[] {
  return [...ELEMENTS].sort((a, b) => counts[a] - counts[b]);
}
