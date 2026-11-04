/**
 * 학파마다 갈리는 기준을 한곳에 모았다. 여기 값을 바꾸면 대운 · 발음오행 ·
 * 십신 계산이 함께 바뀐다. 표로 정리한 설명은 docs/SAJU_RULES.md.
 * (학과 TOP 3 점수는 data/scoring.json이 따로 정하며, 여기 값은 쓰지 않는다.)
 */
import type { Element } from "./elements.ts";

/**
 * 용신(用神) 대신 쓰는 기운. lib/saju에는 용신(억부·조후) 계산이 없어서,
 * "사주에서 가장 약한 오행"(개수가 같으면 상생 순서 목→화→토→금→수에서 앞선 것)을
 * 보완 기운으로 쓴다. 결과 문구에도 이 사실을 적는다.
 */
export const SUPPORT_BASIS = {
  kind: "weakest" as const,
  label: "가장 약한 오행",
  /** 결과 문구에 붙이는 설명. */
  note: "연학당은 용신 대신 사주에서 가장 약한 오행을 보완 기운으로 봐요.",
};

/* ── 대운 ── */

export const DAEWOON = {
  /** 절기까지 3일 = 1년. */
  daysPerYear: 3,
  /**
   * 나머지 처리: "round"는 나머지 1 → 버림, 2 → 올림(÷3 반올림).
   * "floor" / "ceil"로 바꿀 수 있다.
   */
  rounding: "round" as "round" | "floor" | "ceil",
  /** 보여 줄 대운 수와 한 대운의 길이(년). */
  count: 8,
  span: 10,
  /**
   * 절입 기준. 라이브러리의 절기 시각 표는 2020~2030년만 있어서, 만세력 월주가
   * 바뀌는 날을 절입일로 본다(날짜 기준). 화면의 월주와 항상 맞는다.
   */
  basis: "date" as const,
};

/** 연학당이 강조하는 두 시기. 나이는 만 나이. */
export const FOCUS = {
  exam: { label: "2027학년도 입시", short: "입시", date: { year: 2026, month: 11, day: 19 } },
  college: { label: "대학 시절", short: "대학", from: 19, to: 24 },
};

/* ── 발음오행 ── */

export type NameScheme = "modern" | "haerye";

/** 기본 자음 → 오행. 쌍자음은 기본 자음으로 읽는다. */
export const INITIAL_ELEMENT: Record<NameScheme, Record<string, Element>> = {
  /** 현대 성명학 관행: ㅇㅎ = 토, ㅁㅂㅍ = 수. */
  modern: {
    ㄱ: "목", ㅋ: "목",
    ㄴ: "화", ㄷ: "화", ㄹ: "화", ㅌ: "화",
    ㅇ: "토", ㅎ: "토",
    ㅅ: "금", ㅈ: "금", ㅊ: "금",
    ㅁ: "수", ㅂ: "수", ㅍ: "수",
  },
  /** 훈민정음 해례본: ㅇㅎ = 수(목구멍소리), ㅁㅂㅍ = 토(입술소리). */
  haerye: {
    ㄱ: "목", ㅋ: "목",
    ㄴ: "화", ㄷ: "화", ㄹ: "화", ㅌ: "화",
    ㅇ: "수", ㅎ: "수",
    ㅅ: "금", ㅈ: "금", ㅊ: "금",
    ㅁ: "토", ㅂ: "토", ㅍ: "토",
  },
};

export const NAME_SCHEME: NameScheme = "modern";

/** 두 글자 성. 이름이 이 글자 수 이상일 때만 복성으로 본다("선우"는 2글자면 외자 성 + 외자 이름). */
export const COMPOUND_SURNAMES = ["남궁", "선우", "황보", "제갈", "사공", "독고", "서문", "동방", "어금", "망절", "소봉"];
export const COMPOUND_SURNAME_MIN_LENGTH = 3;

/* ── 십신 ── */

export type BranchYinYangScheme = "yong" | "che";

/**
 * 지지 음양 (자축인묘진사오미신유술해 순서, true = 양).
 * - yong(용, 지장간 정기 기준): 子·午 음, 巳·亥 양 — 십신에 흔히 쓰는 기준
 * - che(체, 순서 기준): 홀짝 순서 그대로 子·午 양, 巳·亥 음
 */
export const BRANCH_YANG: Record<BranchYinYangScheme, boolean[]> = {
  yong: [false, false, true, false, true, true, false, false, true, false, true, true],
  che: [true, false, true, false, true, false, true, false, true, false, true, false],
};

export const BRANCH_YIN_YANG: BranchYinYangScheme = "yong";

/** 십신 그룹을 셀 때 한 글자의 무게. 지장간 · 월지 가중치가 없어 글자마다 1. */
export const SIPSIN_WEIGHT = { stem: 1, branch: 1 };

/** 이만큼 있으면 "강하다"고 말한다. */
export const SIPSIN_STRONG_MIN = 2;
