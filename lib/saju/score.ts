/**
 * 학과 적합도 = 성향(내 강한 기운을 따라가는가) + 일간 궁합(내 일간과 어울리는가)
 * + 보완(부족한 기운을 채우는가). 학과의 기운은 주오행 · 보조오행 · 분야(중계열)
 * 보정을 섞은 "오행 비중"으로 본다. Every weight comes from data/scoring.json
 * and data/field-elements.csv. Pure and stable: no randomness.
 */
import { ELEMENTS, controls, feederOf, generates, type Element, type ElementCounts } from "./elements.ts";
import type { FieldElements, MajorRow, Scoring } from "./content.ts";

/** How an element sits against my 일간 (사주 용어는 괄호). */
export type DayMasterRelation =
  /** 같은 기운 (비겁) */
  | "same"
  /** 일간이 생(生)해 주는 기운 (식상) */
  | "fed"
  /** 일간이 극(剋)하는 기운 (재성) */
  | "controlled"
  /** 일간을 생해 주는 기운 (인성) */
  | "feeder"
  /** 일간을 극하는 기운 (관성) */
  | "controller";

export type ElementTendency = {
  element: Element;
  /** 0–1: this element's share of the major's 기운. */
  share: number;
  /** Where the share came from. */
  roles: Array<"main" | "sub" | "field">;
  /** How many of my characters are this element… */
  count: number;
  /** …out of all my characters (8, or 6 without a birth time). */
  ratio: number;
  /** My most common element's count. */
  maxCount: number;
  /** 0–1: count against maxCount. */
  presence: number;
  relation: DayMasterRelation;
  /** 0–1: data/scoring.json dayMasterRelation[relation]. */
  dayPoints: number;
  /** 0–1: how far below scoring.deficitBelow my ratio is (1 = I have none). */
  deficit: number;
};

export type MajorScore = {
  major: MajorRow;
  /** 0–1 each. */
  tendency: number;
  dayMaster: number;
  complement: number;
  /** 0–1 */
  total: number;
  /** displayMin–displayMax, rounded; TOP N never share one (see pickTop). */
  display: number;
  /** Every element the major carries, biggest share first. */
  tendencyParts: ElementTendency[];
  /** The major's elements that fill a gap in my 사주, biggest gap first. */
  filled: Array<{ element: Element; deficit: number }>;
};

export type Profile = {
  counts: ElementCounts;
  dayMaster: Element;
  /** The 사주 글자 ("무자을묘갑인신미"): last-resort order for equal scores. */
  seed: string;
};

/**
 * FNV-1a, 32-bit. Only reached when two rows tie on total, 보완 and 일간 궁합:
 * orders them by hash(사주 + id) so the same 사주 always gets the same order.
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

export function relationTo(dayMaster: Element, e: Element): DayMasterRelation {
  if (e === dayMaster) return "same";
  if (e === generates(dayMaster)) return "fed";
  if (e === controls(dayMaster)) return "controlled";
  if (e === feederOf(dayMaster)) return "feeder";
  return "controller";
}

/** The major's 오행 비중 (sums to 1): 주 · 보조 · 분야 보정, unused parts folded into the rest. */
export function majorShares(major: MajorRow, fields: FieldElements, s: Scoring) {
  const shares = new Map<Element, { share: number; roles: ElementTendency["roles"] }>();
  const add = (e: Element, amount: number, role: ElementTendency["roles"][number]) => {
    if (amount <= 0) return;
    const cur = shares.get(e) ?? { share: 0, roles: [] };
    cur.share += amount;
    if (!cur.roles.includes(role)) cur.roles.push(role);
    shares.set(e, cur);
  };
  const boost = fields[`${major.대계열}/${major.중계열}`];
  const boostSum = boost ? ELEMENTS.reduce((n, e) => n + boost[e], 0) : 0;
  const used = s.mainShare + (major.보조오행 ? s.subShare : 0) + (boostSum > 0 ? s.fieldShare : 0);

  add(major.주오행, s.mainShare / used, "main");
  if (major.보조오행) add(major.보조오행, s.subShare / used, "sub");
  if (boost && boostSum > 0) for (const e of ELEMENTS) add(e, ((s.fieldShare / used) * boost[e]) / boostSum, "field");
  return shares;
}

/** total → displayMin–displayMax, the same formula for everyone. */
export function toDisplay(total: number, s: Scoring): number {
  const t = Math.min(1, Math.max(0, (total - s.totalFloor) / (s.totalCeil - s.totalFloor)));
  return Math.round(s.displayMin + (s.displayMax - s.displayMin) * t);
}

export function scoreMajor(major: MajorRow, profile: Profile, s: Scoring, fields: FieldElements = {}): MajorScore {
  const chars = ELEMENTS.reduce((n, e) => n + profile.counts[e], 0);
  const maxCount = Math.max(...Object.values(profile.counts));

  const tendencyParts: ElementTendency[] = [...majorShares(major, fields, s)]
    .map(([element, { share, roles }]) => {
      const count = profile.counts[element];
      const ratio = chars === 0 ? 0 : count / chars;
      const relation = relationTo(profile.dayMaster, element);
      return {
        element,
        share,
        roles,
        count,
        ratio,
        maxCount,
        presence: maxCount === 0 ? 0 : count / maxCount,
        relation,
        dayPoints: s.dayMasterRelation[relation],
        deficit: Math.min(1, Math.max(0, (s.deficitBelow - ratio) / s.deficitBelow)),
      };
    })
    .sort((a, b) => b.share - a.share || ELEMENTS.indexOf(a.element) - ELEMENTS.indexOf(b.element));

  const sum = (f: (t: ElementTendency) => number) => tendencyParts.reduce((n, t) => n + t.share * f(t), 0);
  const tendency = sum((t) => t.presence);
  const dayMaster = sum((t) => t.dayPoints);
  const complement = sum((t) => t.deficit);
  const total = s.presenceWeight * tendency + s.dayMasterWeight * dayMaster + s.complementWeight * complement;

  return {
    major,
    tendency,
    dayMaster,
    complement,
    total,
    display: toDisplay(total, s),
    tendencyParts,
    filled: tendencyParts
      .filter((t) => t.deficit > 0)
      .sort((a, b) => b.deficit - a.deficit || b.share - a.share)
      .map((t) => ({ element: t.element, deficit: t.deficit })),
  };
}

/**
 * Every row, best first. Equal totals: more 보완 first, then the 주오행 that
 * suits my 일간 better, then a fixed per-사주 order (see tieHash).
 */
export function rankMajors(
  majors: MajorRow[],
  profile: Profile,
  s: Scoring,
  fields: FieldElements = {},
): MajorScore[] {
  return majors
    .map((m, index) => {
      const score = scoreMajor(m, profile, s, fields);
      return {
        score,
        mainDay: s.dayMasterRelation[relationTo(profile.dayMaster, m.주오행)],
        tie: tieHash(`${profile.seed}|${m.id}`),
        index,
      };
    })
    .sort((a, b) => {
      const diff = b.score.total - a.score.total;
      if (Math.abs(diff) > TIE_EPSILON) return diff;
      const fill = b.score.complement - a.score.complement;
      if (Math.abs(fill) > TIE_EPSILON) return fill;
      if (a.mainDay !== b.mainDay) return b.mainDay - a.mainDay;
      return a.tie - b.tie || a.index - b.index;
    })
    .map(({ score }) => score);
}

/** How many other rows share this row's score. */
export function tiedWith(ranked: MajorScore[], pick: MajorScore): number {
  return ranked.filter((r) => r !== pick && Math.abs(r.total - pick.total) <= TIE_EPSILON).length;
}

/**
 * The top N, no two from the same 중계열, and no two with the same shown
 * score: a pick that rounds to (or above) the one before it shows one point
 * less, so 1위 > 2위 > 3위 always reads as such.
 */
export function pickTop(ranked: MajorScore[], count: number): MajorScore[] {
  const seen = new Set<string>();
  const top: MajorScore[] = [];
  for (const s of ranked) {
    if (seen.has(s.major.중계열)) continue;
    seen.add(s.major.중계열);
    const prev = top[top.length - 1];
    top.push(prev && s.display >= prev.display ? { ...s, display: prev.display - 1 } : s);
    if (top.length === count) break;
  }
  return top;
}
