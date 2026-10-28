/**
 * 학과 적합도: 성향(내 강한 기운·일간을 따라가는가) + 보완(부족한 기운을
 * 채우는가). Every weight comes from data/scoring.json. Pure and stable: ties
 * keep the table's row order.
 */
import {
  byWeakness,
  generates,
  type Element,
  type ElementCounts,
} from "./elements.ts";
import type { MajorRow, Scoring } from "./content.ts";

export type DayMasterRelation = "same" | "fed" | "other";

export type ElementTendency = {
  element: Element;
  /** How many of my characters are this element… */
  count: number;
  /** …against my most common element's count. */
  maxCount: number;
  relation: DayMasterRelation;
  /** 0–1 */
  points: number;
};

export type MajorScore = {
  major: MajorRow;
  /** 0–1 each. */
  tendency: number;
  complement: number;
  total: number;
  /** displayMin–displayMax, rounded. */
  display: number;
  tendencyParts: ElementTendency[];
  /** The element that fills a gap, if any, and which gap. */
  filled: { element: Element; rank: 1 | 2 } | null;
};

export type Profile = {
  counts: ElementCounts;
  dayMaster: Element;
  /** The 사주 글자 ("무자을묘갑인신미"): orders equal scores per person. */
  seed: string;
};

/**
 * FNV-1a, 32-bit. Many rows share a 주/보조 오행 pair and so a score; ordering
 * those by hash(사주 + id) instead of table order lets every row reach the top
 * for someone, while the same 사주 always gets the same order. No randomness.
 */
function tieHash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Totals within this are the same score (float noise aside). */
const TIE_EPSILON = 1e-9;

function relationTo(dayMaster: Element, e: Element): DayMasterRelation {
  if (e === dayMaster) return "same";
  if (e === generates(dayMaster)) return "fed";
  return "other";
}

function tendencyOf(e: Element, profile: Profile, s: Scoring): ElementTendency {
  const maxCount = Math.max(...Object.values(profile.counts));
  const count = profile.counts[e];
  const relation = relationTo(profile.dayMaster, e);
  const presence = maxCount === 0 ? 0 : count / maxCount;
  const day = relation === "same" ? s.sameAsDayMaster : relation === "fed" ? s.fedByDayMaster : 0;
  return {
    element: e,
    count,
    maxCount,
    relation,
    points: s.presenceShare * presence + s.dayMasterShare * day,
  };
}

export function scoreMajor(major: MajorRow, profile: Profile, s: Scoring): MajorScore {
  const main = tendencyOf(major.주오행, profile, s);
  const sub = major.보조오행 ? tendencyOf(major.보조오행, profile, s) : null;
  const tendency = sub
    ? (main.points + s.subElementWeight * sub.points) / (1 + s.subElementWeight)
    : main.points;

  const [weakest, secondWeakest] = byWeakness(profile.counts);
  const own = [major.주오행, major.보조오행].filter((e): e is Element => e !== null);
  const filled = own.includes(weakest)
    ? { element: weakest, rank: 1 as const }
    : own.includes(secondWeakest)
      ? { element: secondWeakest, rank: 2 as const }
      : null;
  const complement = filled ? (filled.rank === 1 ? s.fillsWeakest : s.fillsSecondWeakest) : 0;

  const total = s.tendencyWeight * tendency + s.complementWeight * complement;
  return {
    major,
    tendency,
    complement,
    total,
    display: Math.round(s.displayMin + (s.displayMax - s.displayMin) * total),
    tendencyParts: sub ? [main, sub] : [main],
    filled,
  };
}

/** Every row, best first; equal totals in a per-사주 order (see tieHash). */
export function rankMajors(majors: MajorRow[], profile: Profile, s: Scoring): MajorScore[] {
  return majors
    .map((m, index) => ({
      score: scoreMajor(m, profile, s),
      tie: tieHash(`${profile.seed}|${m.id}`),
      index,
    }))
    .sort((a, b) => {
      const diff = b.score.total - a.score.total;
      if (Math.abs(diff) > TIE_EPSILON) return diff;
      return a.tie - b.tie || a.index - b.index;
    })
    .map(({ score }) => score);
}

/** How many other rows share this row's score. */
export function tiedWith(ranked: MajorScore[], pick: MajorScore): number {
  return ranked.filter((r) => r !== pick && Math.abs(r.total - pick.total) <= TIE_EPSILON).length;
}

/** The top N, no two from the same 중계열. */
export function pickTop(ranked: MajorScore[], count: number): MajorScore[] {
  const seen = new Set<string>();
  const top: MajorScore[] = [];
  for (const s of ranked) {
    if (seen.has(s.major.중계열)) continue;
    seen.add(s.major.중계열);
    top.push(s);
    if (top.length === count) break;
  }
  return top;
}
