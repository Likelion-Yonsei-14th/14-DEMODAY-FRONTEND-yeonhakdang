/**
 * 유료 결과 — 합격 궁합(8-1) · 귀인(8-2) · 부적(8-3) — from the free analysis
 * and the tables in data/paid.json. Pure: the same analysis and choices always
 * give the same result, so a result never changes between visits.
 */
import { calculateSaju, getPillarByHangul } from "@fullstackfamily/manseryeok";

import { josa } from "../josa.ts";
import type { Analysis } from "./analyze.ts";
import { relationOf, type Relation } from "./compat.ts";
import { ELEMENTS, ELEMENT_HANJA, byWeakness, elementLabel, generates, type Element } from "./elements.ts";

export type BenefactorRelation = "선배" | "동기" | "교수님" | "연인";

type Day = { year: number; month: number; day: number };

export type PaidContent = {
  energy: Record<Relation | "fillsWeakest" | "displayMin" | "displayMax", number>;
  university: {
    relation: Record<Relation, number>;
    fillsWeakest: number;
    fillsSecondWeakest: number;
    relationWeight: number;
    complementWeight: number;
    min: number;
    max: number;
    notes: Record<Relation, string>;
  };
  season: {
    months: Array<{ year: number; month: number; line: string }>;
    focus: { year: number; month: number; caption: string };
    chips: Array<{ label: string; from: string; to: string; primary?: boolean }>;
  };
  benefactor: {
    profiles: Record<Element, Record<BenefactorRelation, { type: string; description: string; tags: string[]; hints: string[] }>>;
    events: Array<{ year: number; month: number; title: string; caption: string; short: string; tip: string }>;
    peakCaption: string;
  };
  charm: {
    words: string[];
    elements: Record<
      Element,
      { title: string; tags: string[]; colors: string; pattern: string; bg: string; paper: string; ink: string; accent: string }
    >;
  };
  /** 대학 이름 → 개교 연도 (data/universities-founded.json). */
  founded: Record<string, number>;
};

/* ── 간지 → 오행 ── */

const pillarElements = (hangul: string): { stem: Element; branch: Element; hanja: string } => {
  const p = getPillarByHangul(hangul);
  if (!p) throw new Error(`Unknown pillar: ${hangul}`);
  return { stem: p.tiangan.element as Element, branch: p.dizhi.element as Element, hanja: p.combined.hanja };
};

/** That day's 월주 and 일주 as 오행 (stem, branch). */
function ganzhi(d: Day): { month: Element[]; day: Element[] } {
  const r = calculateSaju(d.year, d.month, d.day);
  const month = pillarElements(r.monthPillar);
  const day = pillarElements(r.dayPillar);
  return { month: [month.stem, month.branch], day: [day.stem, day.branch] };
}

/** 천간 of a year, by its 오행: 갑을 목 · 병정 화 · 무기 토 · 경신 금 · 임계 수. */
export function yearElement(year: number): Element {
  const stem = (((year - 4) % 10) + 10) % 10;
  return ELEMENTS[Math.floor(stem / 2)];
}

const STEMS = "갑을병정무기경신임계";

/** "을유년"-style 천간 for a year (the 천간 only: "을"). */
export function yearStem(year: number): string {
  return STEMS[(((year - 4) % 10) + 10) % 10];
}

/** How much these characters help me, 0~1. */
export function energyOf(chars: Element[], me: Pick<Analysis, "weakest" | "saju">, energy: PaidContent["energy"]): number {
  const dm = me.saju.dayMaster.element;
  const points = chars.map((e) => (e === me.weakest ? energy.fillsWeakest : energy[relationOf(dm, e)]));
  return points.reduce((a, b) => a + b, 0) / points.length;
}

function display(value: number, energy: PaidContent["energy"]): number {
  return Math.round(energy.displayMin + (energy.displayMax - energy.displayMin) * value);
}

function days(from: Day, to: Day): Day[] {
  const out: Day[] = [];
  const end = Date.UTC(to.year, to.month - 1, to.day);
  for (let t = Date.UTC(from.year, from.month - 1, from.day); t <= end; t += 86_400_000) {
    const d = new Date(t);
    out.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() });
  }
  return out;
}

function parseDay(iso: string): Day {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

function lastDay(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** The best of `items` by `score`; the first one wins a tie. */
function best<T>(items: T[], score: (t: T) => number): T {
  return items.reduce((top, item) => (score(item) > score(top) ? item : top));
}

const ORDINAL = ["첫째", "둘째", "셋째", "넷째", "다섯째"];

/* ── 합격 궁합 ── */

export type UniversityCompat = {
  name: string;
  founded: number;
  element: Element;
  relation: Relation;
  score: number;
  note: string;
};

export type WeekLevel = "최고" | "좋음" | "보통" | "주의";

export type CompatResult = {
  universities: UniversityCompat[];
  months: Array<{ label: string; value: number; peak: boolean }>;
  weeks: Array<{ label: string; level: WeekLevel }>;
  focusTitle: string;
  focusCaption: string;
  chips: Array<{ label: string; primary: boolean }>;
  /** 연학이 말풍선. */
  tip: string;
};

export function universityCompat(me: Analysis, name: string, content: PaidContent): UniversityCompat {
  const founded = content.founded[name];
  if (founded === undefined) throw new Error(`개교 연도가 없어요: ${name}`);
  const u = content.university;
  const element = yearElement(founded);
  const dm = me.saju.dayMaster.element;
  const relation = relationOf(dm, element);
  const [weakest, second] = byWeakness(me.counts);
  const complement = element === weakest ? u.fillsWeakest : element === second ? u.fillsSecondWeakest : 0;
  const total = u.relationWeight * u.relation[relation] + u.complementWeight * complement;
  const score = Math.round(u.min + (u.max - u.min) * total);
  const note = u.notes[relation].replace("{me}", elementLabel(dm)).replace("{uni}", elementLabel(element));
  return { name, founded, element, relation, score, note };
}

export function compatResult(me: Analysis, universities: string[], content: PaidContent): CompatResult {
  const names = [...new Set(universities)];
  const ranked = names
    .map((name, i) => ({ c: universityCompat(me, name, content), i }))
    .sort((a, b) => b.c.score - a.c.score || a.i - b.i)
    .map(({ c }) => c);

  const { energy, season } = content;
  const months = season.months.map((m) => ({
    label: `${m.month}월`,
    value: display(energyOf(ganzhi({ ...m, day: 15 }).month, me, energy), energy),
    line: m.line,
    year: m.year,
    month: m.month,
  }));
  const peak = best(months, (m) => m.value);

  const dayScore = (d: Day) => energyOf(ganzhi(d).day, me, energy);
  /** Weeks 1~4 of a month: 1–7, 8–14, 15–21, 22–end. */
  const weeksOf = (year: number, month: number) =>
    [1, 8, 15, 22].map((start, i) => {
      const end = i === 3 ? lastDay(year, month) : start + 6;
      const span = days({ year, month, day: start }, { year, month, day: end });
      return span.reduce((sum, d) => sum + dayScore(d), 0) / span.length;
    });

  const { focus } = season;
  const focusWeeks = weeksOf(focus.year, focus.month);
  const top = focusWeeks.indexOf(Math.max(...focusWeeks));
  const low = focusWeeks.lastIndexOf(Math.min(...focusWeeks));
  const median = [...focusWeeks].sort((a, b) => a - b)[1];
  const weeks = focusWeeks.map((v, i) => ({
    label: `${i + 1}주`,
    level: (i === top ? "최고" : i === low ? "주의" : v > median ? "좋음" : "보통") as WeekLevel,
  }));

  const chips = season.chips.map((chip) => {
    const day = best(days(parseDay(chip.from), parseDay(chip.to)), dayScore);
    return { label: `${day.month}/${day.day} ${chip.label}`, primary: chip.primary === true };
  });

  const peakWeeks = weeksOf(peak.year, peak.month);
  const peakWeek = peakWeeks.indexOf(Math.max(...peakWeeks));

  return {
    universities: ranked,
    months: months.map((m) => ({ label: m.label, value: m.value, peak: m === peak })),
    weeks,
    focusTitle: `${focus.month}월 주간 기운`,
    focusCaption: focus.caption,
    chips,
    tip: `${peak.month}월 ${ORDINAL[peakWeek]} 주가 제일 좋아!\n${peak.line}`,
  };
}

/* ── 귀인 ── */

export type BenefactorResult = {
  element: Element;
  type: string;
  description: string;
  tags: string[];
  hints: string[];
  subtitle: string;
  timeline: Array<{ date: string; title: string; caption: string; peak: boolean }>;
  caution: string;
  tip: string;
};

/** The element that 생(生)s `e` — its 인성. */
function feeder(e: Element): Element {
  return ELEMENTS.find((x) => generates(x) === e)!;
}

/** The element that 극(剋)s `e`. */
function controller(e: Element): Element {
  return ELEMENTS.find((x) => relationOf(x, e) === "controls")!;
}

/** "목(木)을" / "화(火)를" — the 조사 follows the 한글 name. */
function withJosa(e: Element, pair: "을/를" | "이/가"): string {
  return elementLabel(e) + josa(e, pair).slice(e.length);
}

export function benefactorResult(me: Analysis, relation: BenefactorRelation, content: PaidContent): BenefactorResult {
  const dm = me.saju.dayMaster.element;
  const element = feeder(dm);
  const profile = content.benefactor.profiles[element][relation];
  const { energy } = content;

  const scored = content.benefactor.events.map((ev, i) => {
    const chars = ganzhi({ year: ev.year, month: ev.month, day: 15 }).month;
    const hits = chars.filter((c) => c === element).length;
    return { ev, i, score: hits + energyOf(chars, me, energy) / 10 };
  });
  const picked = [...scored].sort((a, b) => b.score - a.score || a.i - b.i).slice(0, 3).sort((a, b) => a.i - b.i);
  const peak = best(picked, (p) => p.score);

  const caution = controller(dm);
  return {
    element,
    type: profile.type,
    description: profile.description,
    tags: profile.tags,
    hints: profile.hints,
    subtitle: `${elementLabel(element)} 기운이 강한 ${josa(relation, "이/가")} 내 ${withJosa(dm, "을/를")} 키워 줘요`,
    timeline: picked.map((p) => ({
      date: `${p.ev.year}.${String(p.ev.month).padStart(2, "0")}`,
      title: p.ev.title,
      caption: p === peak ? content.benefactor.peakCaption : p.ev.caption,
      peak: p === peak,
    })),
    caution: `${elementLabel(caution)} 기운이 강한 ${josa(relation, "과/와")}는 의견이 자주 부딪혀요. 역할을 나누면 괜찮아요.`,
    tip: `${peak.ev.month}월 ${peak.ev.short} 때\n${peak.ev.tip}`,
  };
}

/* ── 부적 ── */

export type CharmResult = {
  element: Element;
  title: string;
  tags: string[];
  description: string;
  /** What the art draws. */
  art: {
    word: string;
    /** "土生金": what feeds the element the charm fills. */
    formula: string;
    /** 일주 한자, under the seal. */
    pillar: string;
    variant: number;
    bg: string;
    paper: string;
    ink: string;
    accent: string;
  };
};

/** `variant` counts 다시 뽑기 used (0 = the first draw). */
export function charmResult(me: Analysis, variant: number, content: PaidContent): CharmResult {
  const element = me.weakest;
  const e = content.charm.elements[element];
  const { words } = content.charm;
  const v = ((variant % words.length) + words.length) % words.length;
  const strong = me.strongest;
  return {
    element,
    title: e.title,
    tags: e.tags,
    description: `${withJosa(strong, "이/가")} 강한 사주에 부족한 ${elementLabel(element)}의 ${josa(e.colors, "과/와")} ${e.pattern} 문양을 담았어요. 시험 전날 잠금화면으로 설정해 두세요.`,
    art: {
      word: words[v],
      formula: `${ELEMENT_HANJA[feeder(element)]}生${ELEMENT_HANJA[element]}`,
      pillar: me.saju.pillars[2].hanja,
      variant: v,
      bg: e.bg,
      paper: e.paper,
      ink: e.ink,
      accent: e.accent,
    },
  };
}
