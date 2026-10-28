/**
 * 입력 → 사주 → 오행 → 학과 TOP N → "왜 이 학과인지" 근거. One pure function:
 * the same input and content always give the same result.
 */
import { resolveBirth, type BirthInput } from "./birth.ts";
import type { Content, DayMasterType } from "./content.ts";
import {
  ELEMENTS,
  ELEMENT_HANJA,
  byStrength,
  byWeakness,
  elementLabel,
  type Element,
  type ElementCounts,
} from "./elements.ts";
import { PILLAR_LABELS, computeSaju, countElements, type Saju } from "./pillars.ts";
import { pickTop, rankMajors, tiedWith, type MajorScore } from "./score.ts";

export type ReasonStep = {
  title: string;
  lines: string[];
};

export type Analysis = {
  saju: Saju;
  counts: ElementCounts;
  /** 6 or 8 */
  charCount: number;
  strongest: Element;
  weakest: Element;
  dayMaster: DayMasterType;
  /** Tags for the type card: the day master's own plus the strongest count. */
  tags: string[];
  /** The 오행 분포 해설. */
  insight: string;
  top: MajorScore[];
  /** "왜 이 학과일까?" for the first pick. */
  reasons: ReasonStep[];
};

export type AnalysisResult = { ok: true; analysis: Analysis } | { ok: false; error: string };

const RELATION_TEXT = {
  same: "내 일간과 같은 기운",
  fed: "내 일간이 생(生)해 주는 기운 — 재능을 펼치는 방향",
  other: "내 일간과 직접 이어지지는 않는 기운",
} as const;

/** 은/는 after the element's 한글 name. */
const TOPIC: Record<Element, string> = { 목: "은", 화: "는", 토: "는", 금: "은", 수: "는" };

function percent(n: number): string {
  return `${Math.round(n * 100)}점`;
}

function insightFor(counts: ElementCounts, content: Content): string {
  const [strong] = byStrength(counts);
  const [weak] = byWeakness(counts);
  if (counts[strong] - counts[weak] <= 1) return content.insights.balanced;
  return `${content.insights.strong[strong]}고 ${content.insights.weak[weak]}`;
}

function reasonsFor(
  saju: Saju,
  counts: ElementCounts,
  charCount: number,
  pick: MajorScore,
  ties: number,
  content: Content,
): ReasonStep[] {
  const s = content.scoring;
  const strengthOrder = byStrength(counts);
  const weaknessOrder = byWeakness(counts);
  const dm = saju.dayMaster;

  const step1: ReasonStep = {
    title: `1. 내 사주 ${charCount}글자`,
    lines: [
      ...saju.pillars.map(
        (p) =>
          `${PILLAR_LABELS[p.key]} ${p.hangul}(${p.hanja}) — ${elementLabel(p.stem.element)} · ${elementLabel(p.branch.element)}`,
      ),
      ...(saju.pillars.length < 4 ? ["태어난 시간을 몰라 시주를 뺀 여섯 글자로 봤어요."] : []),
      ...(saju.timeCorrected && saju.correctedTime
        ? [
            `서울 기준 시간 보정 적용: ${saju.correctedTime.hour}시 ${String(saju.correctedTime.minute).padStart(2, "0")}분으로 계산했어요.`,
          ]
        : []),
      `일간(태어난 날의 천간)은 ${dm.hangul}${dm.element}(${dm.hanja}${ELEMENT_HANJA[dm.element]})이에요.`,
    ],
  };

  const step2: ReasonStep = {
    title: "2. 오행 세기",
    lines: [
      ELEMENTS.map((e) => `${e} ${counts[e]}`).join(" · "),
      `가장 강한 기운: ${elementLabel(strengthOrder[0])} ${counts[strengthOrder[0]]}개`,
      `가장 약한 기운: ${elementLabel(weaknessOrder[0])} ${counts[weaknessOrder[0]]}개, 다음으로 약한 기운: ${elementLabel(weaknessOrder[1])} ${counts[weaknessOrder[1]]}개`,
    ],
  };

  const tendencyLines = pick.tendencyParts.map((t, i) => {
    const role = i === 0 ? "주 오행" : "보조 오행";
    return `${role} ${elementLabel(t.element)}: 내 사주에 ${t.count}개(가장 많은 기운 ${t.maxCount}개 대비), ${RELATION_TEXT[t.relation]} → ${percent(t.points)}`;
  });
  const step3: ReasonStep = {
    title: "3. 점수 계산",
    lines: [
      `성향 ${Math.round(s.tendencyWeight * 100)}% — 내 기운을 따라가는가`,
      ...tendencyLines.map((l) => `· ${l}`),
      `보완 ${Math.round(s.complementWeight * 100)}% — 부족한 기운을 채우는가`,
      pick.filled
        ? `· ${elementLabel(pick.filled.element)}${TOPIC[pick.filled.element]} 내 사주에서 ${pick.filled.rank === 1 ? "가장" : "두 번째로"} 약한 기운이라 채워 줘요 → ${percent(pick.complement)}`
        : "· 내 사주에서 약한 기운을 직접 채우지는 않아요 → 0점",
      `종합 ${percent(pick.total)} → 적합도 ${pick.display}점 (${s.displayMin}~${s.displayMax}점으로 환산)`,
      ...(ties > 0
        ? [`같은 점수의 학과군이 ${ties}개 더 있어요. 이럴 땐 내 사주 글자로 순서를 정해, 같은 사주면 언제나 같은 학과가 나와요.`]
        : []),
    ],
  };

  const step4: ReasonStep = {
    title: "4. 그래서 이 학과",
    lines: [
      `${pick.major.대표학과[0]} (${pick.major.대계열} · ${pick.major.중계열} · ${pick.major.학과군})`,
      pick.major.근거,
      ...(pick.major.대표학과.length > 1 ? [`비슷한 학과: ${pick.major.대표학과.slice(1).join(", ")}`] : []),
    ],
  };

  return [step1, step2, step3, step4];
}

export function analyze(input: BirthInput, content: Content): AnalysisResult {
  const birth = resolveBirth(input);
  if (!birth.ok) return { ok: false, error: birth.error ?? "생년월일을 끝까지 입력해 주세요" };

  const saju = computeSaju(birth.solar);
  const counts = countElements(saju);
  const charCount = saju.pillars.length * 2;
  const [strongest] = byStrength(counts);
  const [weakest] = byWeakness(counts);

  const dayMaster = content.dayMasters[saju.dayMaster.hangul];
  if (!dayMaster) return { ok: false, error: `일간 유형 문구가 없어요: ${saju.dayMaster.hangul}` };

  const seed = saju.pillars.map((p) => p.hangul).join("");
  const ranked = rankMajors(content.majors, { counts, dayMaster: saju.dayMaster.element, seed }, content.scoring);
  const top = pickTop(ranked, content.scoring.topCount);
  if (top.length === 0) return { ok: false, error: "학과 표가 비어 있어요" };

  return {
    ok: true,
    analysis: {
      saju,
      counts,
      charCount,
      strongest,
      weakest,
      dayMaster,
      tags: [...dayMaster.tags, `#${elementLabel(strongest)}기운 ${counts[strongest]}개`],
      insight: insightFor(counts, content),
      top,
      reasons: reasonsFor(saju, counts, charCount, top[0], tiedWith(ranked, top[0]), content),
    },
  };
}
