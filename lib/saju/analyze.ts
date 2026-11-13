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
import { majorAptitude, sipsinProfile, sipsinReasonLines, type MajorAptitude, type SipsinProfile } from "./sipsin.ts";

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
  /** 십신 그룹 세기 (근거용; TOP 3 순위에는 쓰지 않는다). */
  sipsin: SipsinProfile;
  /** One 십신 근거 per `top` pick, same order. */
  aptitudes: MajorAptitude[];
  /** "왜 이 학과일까?" for the first pick. */
  reasons: ReasonStep[];
};

export type AnalysisResult = { ok: true; analysis: Analysis } | { ok: false; error: string };

const RELATION_TEXT = {
  same: "내 일간과 같은 기운(비겁)",
  fed: "내 일간이 생(生)해 주는 기운(식상) — 재능을 펼치는 방향",
  controlled: "내 일간이 다스리는 기운(재성) — 성과를 만드는 방향",
  feeder: "내 일간을 생해 주는 기운(인성) — 배우고 도움받는 방향",
  controller: "내 일간을 다스리는 기운(관성) — 규칙과 긴장이 따르는 방향",
} as const;

const ROLE_TEXT = { main: "주 오행", sub: "보조 오행", field: "분야 보정" } as const;

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
  sipsin: SipsinProfile,
  aptitude: MajorAptitude,
): ReasonStep[] {
  const s = content.scoring;
  const strengthOrder = byStrength(counts);
  const weakest = ELEMENTS.filter((e) => counts[e] === Math.min(...ELEMENTS.map((x) => counts[x])));
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
      weakest.length > 1
        ? `가장 약한 기운: ${weakest.map(elementLabel).join(" · ")} 각 ${counts[weakest[0]]}개 (똑같이 부족해요)`
        : `가장 약한 기운: ${elementLabel(weakest[0])} ${counts[weakest[0]]}개`,
    ],
  };

  const parts = pick.tendencyParts;
  const shareText = (t: (typeof parts)[number]) =>
    `${elementLabel(t.element)} ${Math.round(t.share * 100)}%(${t.roles.map((r) => ROLE_TEXT[r]).join("+")})`;
  const step3: ReasonStep = {
    title: "3. 점수 계산",
    lines: [
      `이 학과의 기운: ${parts.map(shareText).join(" · ")}`,
      `성향 ${Math.round(s.presenceWeight * 100)}% — 내 강한 기운을 따라가는가 → ${percent(pick.tendency)}`,
      ...parts.map(
        (t) =>
          `· ${elementLabel(t.element)}: 내 사주의 ${Math.round(t.ratio * 100)}%(${t.count}개, 가장 많은 기운 ${t.maxCount}개 대비 ${percent(t.presence)})`,
      ),
      `일간 궁합 ${Math.round(s.dayMasterWeight * 100)}% — 내 일간(${dm.hangul}${dm.element})에 어울리는가 → ${percent(pick.dayMaster)}`,
      ...parts.map((t) => `· ${elementLabel(t.element)}: ${RELATION_TEXT[t.relation]} → ${percent(t.dayPoints)}`),
      `보완 ${Math.round(s.complementWeight * 100)}% — 부족한 기운을 채우는가 → ${percent(pick.complement)}`,
      ...(pick.filled.length > 0
        ? pick.filled.map(
            (f) =>
              `· ${elementLabel(f.element)}${TOPIC[f.element]} 내 사주에 ${counts[f.element] === 0 ? "없어서" : `${Math.round((counts[f.element] / charCount) * 100)}%뿐이라`}(고르게 나누면 ${Math.round(s.deficitBelow * 100)}%) 채워 줘요 → ${percent(f.deficit)}`,
          )
        : [`· 이 학과의 기운은 내 사주에 이미 ${Math.round(s.deficitBelow * 100)}% 이상 있어 따로 채우지는 않아요 → 0점`]),
      `종합 ${percent(pick.total)} → 적합도 ${pick.display}점 (${s.displayMin}~${s.displayMax}점으로 환산)`,
      ...(ties > 0
        ? [
            `같은 점수의 학과군이 ${ties}개 더 있어요. 이럴 땐 부족한 기운을 더 채우는 학과, 주 오행이 일간과 더 잘 맞는 학과 순으로 정하고, 그래도 같으면 내 사주 글자로 순서를 정해 같은 사주면 언제나 같은 학과가 나와요.`,
          ]
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

  const step5: ReasonStep = {
    title: "5. 십신으로 본 적성",
    lines: sipsinReasonLines(sipsin, aptitude, content.sipsin),
  };

  return [step1, step2, step3, step4, step5];
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
  const ranked = rankMajors(content.majors, { counts, dayMaster: saju.dayMaster.element, seed }, content.scoring, content.fields);
  const top = pickTop(ranked, content.scoring.topCount, content.scoring);
  if (top.length === 0) return { ok: false, error: "학과 표가 비어 있어요" };

  // 순위가 정해진 뒤에 근거만 붙인다: 십신은 TOP 3 점수에 들어가지 않는다.
  const sipsin = sipsinProfile(saju);
  const aptitudes = top.map((pick) => majorAptitude(pick, sipsin, content.sipsin));

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
      sipsin,
      aptitudes,
      reasons: reasonsFor(saju, counts, charCount, top[0], tiedWith(ranked, top[0]), content, sipsin, aptitudes[0]),
    },
  };
}
