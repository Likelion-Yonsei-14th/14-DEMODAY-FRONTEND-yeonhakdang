/**
 * 유료 결과 — 합격 궁합(8-1) · 귀인(8-2) · 부적(8-3) — from the free analysis
 * and the tables in data/paid.json. Pure: the same analysis and choices always
 * give the same result, so a result never changes between visits.
 */
import { calculateSaju, getPillarByHangul } from "@fullstackfamily/manseryeok";

import { josa } from "../josa.ts";
import type { Analysis } from "./analyze.ts";
import {
  branchAnimal,
  branchElement,
  branchHanja,
  branchRelation,
  cheoneul,
  clashOf,
  yearBranch,
  type Branch,
  type BranchRelation,
} from "./branches.ts";
import { relationOf, type Relation } from "./compat.ts";
import { ELEMENTS, ELEMENT_HANJA, byStrength, elementLabel, generates, type Element } from "./elements.ts";

export type BenefactorRelation = "선배" | "동기" | "교수님" | "연인";

type Day = { year: number; month: number; day: number };

type Profile = { type: string; description: string; tags: string[]; hints: string[] };

export type PaidContent = {
  energy: Record<Relation | "fillsWeakest" | "displayMin" | "displayMax", number>;
  university: {
    stem: Record<Relation, number>;
    branch: Record<BranchRelation, number>;
    stemWeight: number;
    branchWeight: number;
    complementWeight: number;
    min: number;
    max: number;
    stemNotes: Record<Relation, string>;
    branchNotes: Partial<Record<BranchRelation, string>>;
  };
  season: {
    months: Array<{ year: number; month: number; line: string }>;
    focus: { year: number; month: number; caption: string };
    chips: Array<{ label: string; from: string; to: string; primary?: boolean }>;
  };
  benefactor: {
    /** The first day 만나는 시기 looks from (입학 무렵). */
    from: string;
    profiles: Partial<Record<Branch, Record<BenefactorRelation, Profile>>>;
    events: Array<{ year: number; month: number; title: string; short: string; tip: string }>;
    captions: { first: string; month: string; peak: string };
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

/* ── 간지 ── */

type PillarParts = { stem: Element; branch: Element; branchHangul: Branch };

const pillarParts = (hangul: string): PillarParts => {
  const p = getPillarByHangul(hangul);
  if (!p) throw new Error(`Unknown pillar: ${hangul}`);
  return { stem: p.tiangan.element as Element, branch: p.dizhi.element as Element, branchHangul: p.dizhi.hangul as Branch };
};

/** That day's 월주 and 일주. */
function ganzhi(d: Day): { month: PillarParts; day: PillarParts } {
  const r = calculateSaju(d.year, d.month, d.day);
  return { month: pillarParts(r.monthPillar), day: pillarParts(r.dayPillar) };
}

const chars = (p: PillarParts): Element[] => [p.stem, p.branch];

const STEMS = "갑을병정무기경신임계";
const STEMS_HANJA = "甲乙丙丁戊己庚辛壬癸";

/** 천간 of a year (한글): 1885 → 을. */
export function yearStem(year: number): string {
  return STEMS[(((year - 4) % 10) + 10) % 10];
}

/** 천간 of a year, by its 오행: 갑을 목 · 병정 화 · 무기 토 · 경신 금 · 임계 수. */
export function yearElement(year: number): Element {
  return ELEMENTS[Math.floor(STEMS.indexOf(yearStem(year)) / 2)];
}

/** How much these characters help me, 0~1. */
export function energyOf(list: Element[], me: Pick<Analysis, "weakest" | "saju">, energy: PaidContent["energy"]): number {
  const dm = me.saju.dayMaster.element;
  const points = list.map((e) => (e === me.weakest ? energy.fillsWeakest : energy[relationOf(dm, e)]));
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

const dayKey = (d: Day) => d.year * 10_000 + d.month * 100 + d.day;

/** The best of `items` by `score`; the first one wins a tie. */
function best<T>(items: T[], score: (t: T) => number): T {
  return items.reduce((top, item) => (score(item) > score(top) ? item : top));
}

const ORDINAL = ["첫째", "둘째", "셋째", "넷째", "다섯째"];

const percent = (n: number) => `${Math.round(n * 100)}점`;

/** "목(木)을" / "화(火)가" — the 조사 follows the 한글 name. */
function withJosa(e: Element, pair: "을/를" | "이/가"): string {
  return elementLabel(e) + josa(e, pair).slice(e.length);
}

/** "유(酉)" */
const branchLabel = (b: Branch) => `${b}(${branchHanja(b)})`;

/* ── 합격 궁합 ── */

export type UniversityCompat = {
  name: string;
  founded: number;
  /** "을유(乙酉)" */
  ganzhi: string;
  stemElement: Element;
  branch: Branch;
  stemRelation: Relation;
  branchRelation: BranchRelation;
  score: number;
  /** The card's one line: the 합·충 when there is one, the 천간 관계 otherwise. */
  note: string;
  /** "왜 ○점일까?" */
  reasons: string[];
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

const STEM_TEXT: Record<Relation, string> = {
  fed: "학교 기운이 내 일간을 생(生)해 주는 상생",
  feeds: "내 일간이 학교 기운을 생(生)하는 상생",
  same: "내 일간과 같은 기운(비화)",
  controls: "내 일간이 학교 기운을 극(剋)하는 상극",
  controlled: "학교 기운이 내 일간을 극(剋)하는 상극",
};

const BRANCH_TEXT: Record<BranchRelation, string> = {
  육합: "육합 — 짝을 이뤄 서로 끌어당겨요",
  삼합: "삼합 — 같은 방향으로 힘을 모아요",
  "같은 지지": "같은 지지 — 결이 닮았어요",
  없음: "특별한 합·충이 없어요",
  충: "충 — 서로 부딪히는 자리예요",
};

export function universityCompat(me: Analysis, name: string, content: PaidContent): UniversityCompat {
  const founded = content.founded[name];
  if (founded === undefined) throw new Error(`개교 연도가 없어요: ${name}`);
  const u = content.university;

  const stem = yearStem(founded);
  const stemElement = yearElement(founded);
  const branch = yearBranch(founded);
  const ganzhiText = `${stem}${branch}(${STEMS_HANJA[STEMS.indexOf(stem)]}${branchHanja(branch)})`;

  const dm = me.saju.dayMaster.element;
  const myBranch = me.saju.pillars[2].branch.hangul as Branch;
  const stemRelation = relationOf(dm, stemElement);
  const bRelation = branchRelation(branch, myBranch);

  // 보완: each of the school's two 오행 fills me as much as I lack it.
  const most = me.counts[byStrength(me.counts)[0]];
  const schoolElements = [stemElement, branchElement(branch)];
  const fill = (e: Element) => 1 - me.counts[e] / most;
  const complement = schoolElements.reduce((sum, e) => sum + fill(e), 0) / schoolElements.length;

  const stemPoints = u.stem[stemRelation];
  const branchPoints = u.branch[bRelation];
  const total = u.stemWeight * stemPoints + u.branchWeight * branchPoints + u.complementWeight * complement;
  const score = Math.round(u.min + (u.max - u.min) * total);

  const branchNote = u.branchNotes[bRelation];
  const note = branchNote
    ? branchNote.replace("{uni}", branchLabel(branch)).replace("{me}", branchLabel(myBranch))
    : u.stemNotes[stemRelation].replace("{me}", elementLabel(dm)).replace("{uni}", elementLabel(stemElement));

  const unique = [...new Set(schoolElements)];
  const lacking = unique.filter((e) => fill(e) >= 0.5);
  const plenty = unique.filter((e) => fill(e) < 0.5);
  const list = (es: Element[]) => es.map((e) => elementLabel(e)).join("·");
  const fills = lacking.length ? `내 사주에 적은 ${list(lacking)}${josa(lacking.at(-1)!, "을/를").slice(-1)} 채워 줘요` : "";
  const already = plenty.length ? `${list(plenty)}${josa(plenty.at(-1)!, "은/는").slice(-1)} 이미 많아요` : "";
  const reasons = [
    `학교 기운: ${founded}년 개교 · ${ganzhiText} → 천간 ${elementLabel(stemElement)} · 지지 ${elementLabel(branchElement(branch))}`,
    `천간 ${Math.round(u.stemWeight * 100)}%: ${STEM_TEXT[stemRelation]} → ${percent(stemPoints)}`,
    `지지 ${Math.round(u.branchWeight * 100)}%: 학교 ${branchLabel(branch)}${josa(branch, "과/와").slice(1)} 내 일지 ${branchLabel(myBranch)}, ${BRANCH_TEXT[bRelation]} → ${percent(branchPoints)}`,
    `보완 ${Math.round(u.complementWeight * 100)}%: ${[fills, already].filter(Boolean).join(", ")} → ${percent(complement)}`,
    `종합 ${percent(total)} → 궁합 ${score}점 (${u.min}~${u.max}점으로 환산)`,
  ];

  return { name, founded, ganzhi: ganzhiText, stemElement, branch, stemRelation, branchRelation: bRelation, score, note, reasons };
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
    value: display(energyOf(chars(ganzhi({ ...m, day: 15 }).month), me, energy), energy),
    line: m.line,
    year: m.year,
    month: m.month,
  }));
  const peak = best(months, (m) => m.value);

  const dayScore = (d: Day) => energyOf(chars(ganzhi(d).day), me, energy);
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

/* ── 귀인 (천을귀인) ── */

export type BenefactorResult = {
  /** 대표 귀인 지지 and the other one. */
  branch: Branch;
  other: Branch;
  /** "丑" */
  glyph: string;
  type: string;
  description: string;
  tags: string[];
  hints: string[];
  subtitle: string;
  timeline: Array<{ date: string; title: string; caption: string; peak: boolean }>;
  caution: string;
  tip: string;
};

const fmt = (d: Day) => `${d.year}.${String(d.month).padStart(2, "0")}.${String(d.day).padStart(2, "0")}`;

export function benefactorResult(me: Analysis, relation: BenefactorRelation, content: PaidContent): BenefactorResult {
  const b = content.benefactor;
  const myBranch = me.saju.pillars[2].branch.hangul as Branch;
  const pair = cheoneul(me.saju.dayMaster.hangul);

  // One year of 대학 생활 from `from`: the month each 귀인 지지 rules (its 월지).
  const start = parseDay(b.from);
  const monthsAhead = Array.from({ length: 12 }, (_, i) => {
    const m = start.month - 1 + i;
    return { year: start.year + Math.floor(m / 12), month: (m % 12) + 1 };
  });
  const monthOf = (branch: Branch) =>
    monthsAhead.find((m) => ganzhi({ ...m, day: 15 }).month.branchHangul === branch)!;
  /** The month's first day whose 일진 지지 is `branch` (one comes every 12 days). */
  const firstDayIn = (m: { year: number; month: number }, branch: Branch) =>
    days({ ...m, day: 1 }, { ...m, day: lastDay(m.year, m.month) }).find((d) => ganzhi(d).day.branchHangul === branch)!;

  const months = pair.map((branch) => ({ branch, month: monthOf(branch) }));
  const order = (x: { year: number; month: number }) => x.year * 12 + x.month;
  const byMonth = [...months].sort((x, y) => order(x.month) - order(y.month));
  const harmonious = pair.find((g) => ["육합", "삼합"].includes(branchRelation(g, myBranch)));
  const main = harmonious ?? byMonth[0].branch;
  const other = pair.find((g) => g !== main)!;

  const inGuiMonth = (d: Day) => months.some(({ month }) => month.year === d.year && month.month === d.month);
  const first = days(start, { year: start.year + 1, month: start.month, day: start.day }).find(
    (d) => pair.includes(ganzhi(d).day.branchHangul) && !inGuiMonth(d),
  )!;
  const firstBranch = ganzhi(first).day.branchHangul;

  const eventOf = (d: { year: number; month: number }) => b.events.find((e) => e.year === d.year && e.month === d.month)!;
  const animal = (g: Branch) => branchAnimal(g);
  const rows = [
    { day: first, caption: b.captions.first.replace("{animal}", animal(firstBranch)), peak: false },
    ...months.map(({ branch, month }) => ({
      day: firstDayIn(month, branch),
      caption: branch === main ? b.captions.peak : b.captions.month.replace("{animal}", animal(branch)),
      peak: branch === main,
    })),
  ].sort((x, y) => dayKey(x.day) - dayKey(y.day));

  const profile = b.profiles[main]?.[relation];
  if (!profile) throw new Error(`귀인 프로필이 없어요: ${main} · ${relation}`);
  const peakEvent = eventOf(months.find((m) => m.branch === main)!.month);
  const clash = clashOf(myBranch);

  return {
    branch: main,
    other,
    glyph: branchHanja(main),
    type: profile.type,
    description: profile.description,
    tags: [`#${animal(main)}띠`, ...profile.tags, `#${animal(other)}띠도 귀인`],
    hints: profile.hints,
    subtitle: `천을귀인 ${branchLabel(pair[0])}·${branchLabel(pair[1])} — ${animal(main)}띠 ${josa(relation, "이/가")} 길을 열어 줘요`,
    timeline: rows.map((r) => ({ date: fmt(r.day), title: eventOf(r.day).title, caption: r.caption, peak: r.peak })),
    caution: `내 일지 ${branchLabel(myBranch)}${josa(myBranch, "과/와").slice(1)} 충하는 ${animal(clash)}띠 ${josa(relation, "과/와")}는 의견이 자주 부딪혀요. 역할을 나누면 괜찮아요.`,
    tip: `${peakEvent.month}월 ${peakEvent.short} 때\n${peakEvent.tip}`,
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

/** The element that 생(生)s `e`. */
function feeder(e: Element): Element {
  return ELEMENTS.find((x) => generates(x) === e)!;
}

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

