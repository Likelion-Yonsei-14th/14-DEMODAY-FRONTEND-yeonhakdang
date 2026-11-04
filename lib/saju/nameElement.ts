/**
 * 발음오행: 이름 글자의 초성 → 오행. Pure, and runs only on the device — the
 * 이름 never goes to the server or GA.
 *
 * 기본은 현대 성명학 관행(ㅇㅎ = 토, ㅁㅂㅍ = 수). 훈민정음 해례본은 그 반대
 * (ㅇㅎ = 수, ㅁㅂㅍ = 토)라서, rules.ts의 NAME_SCHEME으로 바꿀 수 있다.
 */
import { ELEMENTS, elementLabel, emptyCounts, generates, controls, supportOf, type Element, type ElementCounts, type Support } from "./elements.ts";
import { josa } from "../josa.ts";
import { COMPOUND_SURNAMES, COMPOUND_SURNAME_MIN_LENGTH, INITIAL_ELEMENT, NAME_SCHEME, type NameScheme } from "./rules.ts";

/** 유니코드 한글 음절의 19개 초성 순서. */
const INITIALS = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
/** 쌍자음 → 기본 자음. */
const BASE: Record<string, string> = { ㄲ: "ㄱ", ㄸ: "ㄷ", ㅃ: "ㅂ", ㅆ: "ㅅ", ㅉ: "ㅈ" };

/** The 초성 of a 한글 음절 (쌍자음은 기본 자음으로), or null for anything else. */
export function initialOf(char: string): string | null {
  const code = char.charCodeAt(0) - 0xac00;
  if (char.length !== 1 || code < 0 || code > 11171) return null;
  const initial = INITIALS[Math.floor(code / 588)];
  return BASE[initial] ?? initial;
}

export type NameChar = { char: string; initial: string; element: Element };

export type FlowLink = { from: NameChar; to: NameChar; kind: "상생" | "상극" | "같음" };

export type NameElement = {
  chars: NameChar[];
  /** 성 글자 수 (1, or 2 for 복성). */
  surnameLength: number;
  counts: ElementCounts;
  /** 이름에 없는 오행. */
  missing: Element[];
  target: Element;
  /** Does the name back the 보완 기운? */
  support: Support;
  /** 이웃한 두 글자마다, 성 → 이름 순서. */
  flow: FlowLink[];
};

function linkKind(a: Element, b: Element): FlowLink["kind"] {
  if (a === b) return "같음";
  if (generates(a) === b || generates(b) === a) return "상생";
  if (controls(a) === b || controls(b) === a) return "상극";
  return "같음"; // unreachable: two 오행 always 생 or 극
}

/**
 * Null when the name has no 한글 글자 (the card hides). 영문 · 숫자 · 공백은
 * 건너뛴다.
 */
export function nameElement(name: string, target: Element, scheme: NameScheme = NAME_SCHEME): NameElement | null {
  const table = INITIAL_ELEMENT[scheme];
  const chars: NameChar[] = [];
  for (const char of [...name]) {
    const initial = initialOf(char);
    if (initial) chars.push({ char, initial, element: table[initial] });
  }
  if (chars.length === 0) return null;

  const hangul = chars.map((c) => c.char).join("");
  const surnameLength =
    hangul.length >= COMPOUND_SURNAME_MIN_LENGTH && COMPOUND_SURNAMES.includes(hangul.slice(0, 2)) ? 2 : 1;

  const counts = emptyCounts();
  for (const c of chars) counts[c.element] += 1;
  const elements = chars.map((c) => c.element);

  return {
    chars,
    surnameLength,
    counts,
    missing: ELEMENTS.filter((e) => counts[e] === 0),
    target,
    support: supportOf(elements, target),
    flow: chars.slice(1).map((to, i) => ({ from: chars[i], to, kind: linkKind(chars[i].element, to.element) })),
  };
}

/* ── 문구 ── */

/** "이름이 부족한 수(水)를 채워 줘요" — the 보완 한 줄. */
export function nameSupportLine(n: NameElement): string {
  const t = elementLabel(n.target);
  if (n.support === "fills") return `이름이 사주에 부족한 ${t} 기운을 채워 줘요`;
  if (n.support === "helps") return `이름에 ${t}${josa(n.target, "을/를").slice(1)} 생(生)하는 기운이 있어 부족한 기운을 거들어요`;
  return `이름에는 부족한 ${t} 기운이 없어요. 다른 방법으로 채워 보세요`;
}

/** "상생으로 막힘없이 이어져요" — the 흐름 한 줄. */
export function nameFlowLine(n: NameElement): string {
  if (n.flow.length === 0) return "외자라 흐름 대신 글자 하나의 기운으로 봐요";
  const kinds = n.flow.map((l) => l.kind);
  if (kinds.every((k) => k === "상생")) return "성에서 이름까지 상생으로 막힘없이 이어져요";
  if (kinds.every((k) => k !== "상극")) return "성에서 이름까지 부딪힘 없이 이어져요";
  if (kinds.every((k) => k === "상극")) return "글자끼리 서로 견제해요. 긴장감이 집중력이 되기도 해요";
  return "상생과 상극이 섞여 있어, 밀고 당기며 균형을 잡아요";
}
