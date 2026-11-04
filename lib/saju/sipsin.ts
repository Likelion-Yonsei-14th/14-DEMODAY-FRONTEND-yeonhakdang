/**
 * 십신(十神): 일간과 다른 글자의 관계(오행 생극 + 음양)로 본 적성. Pure.
 * 학과 TOP 3 점수에는 쓰지 않고, 이미 고른 학과의 근거 문장만 만든다.
 *
 * 지장간 · 월지 가중치 계산이 lib/saju에 없어서 그룹 세기는 글자 개수로 센다
 * (SIPSIN_WEIGHT). 지지 음양은 rules.ts의 BRANCH_YIN_YANG(기본: 용 · 정기 기준).
 */
import { josa } from "../josa.ts";
import { BRANCHES, type Branch } from "./branches.ts";
import { controls, generates, type Element } from "./elements.ts";
import { stemIsYang } from "./ganzhi.ts";
import { PILLAR_LABELS, type PillarKey, type Saju } from "./pillars.ts";
import { BRANCH_YANG, BRANCH_YIN_YANG, SIPSIN_STRONG_MIN, SIPSIN_WEIGHT, type BranchYinYangScheme } from "./rules.ts";
import type { MajorScore } from "./score.ts";

export type Sipsin = "비견" | "겁재" | "식신" | "상관" | "편재" | "정재" | "편관" | "정관" | "편인" | "정인";
export type SipsinGroup = "비겁" | "식상" | "재성" | "관성" | "인성";

export const SIPSIN_GROUPS: SipsinGroup[] = ["비겁", "식상", "재성", "관성", "인성"];

/** [같은 음양, 다른 음양] per group. */
const BY_GROUP: Record<SipsinGroup, [Sipsin, Sipsin]> = {
  비겁: ["비견", "겁재"],
  식상: ["식신", "상관"],
  재성: ["편재", "정재"],
  관성: ["편관", "정관"],
  인성: ["편인", "정인"],
};

export function groupOf(s: Sipsin): SipsinGroup {
  return SIPSIN_GROUPS.find((g) => BY_GROUP[g].includes(s))!;
}

/** 같은 오행 비겁 · 내가 생 식상 · 내가 극 재성 · 나를 극 관성 · 나를 생 인성. */
export function groupFor(dayMaster: Element, other: Element): SipsinGroup {
  if (other === dayMaster) return "비겁";
  if (generates(dayMaster) === other) return "식상";
  if (controls(dayMaster) === other) return "재성";
  if (controls(other) === dayMaster) return "관성";
  return "인성";
}

export function sipsinOf(dm: { element: Element; yang: boolean }, other: { element: Element; yang: boolean }): Sipsin {
  const [same, diff] = BY_GROUP[groupFor(dm.element, other.element)];
  return dm.yang === other.yang ? same : diff;
}

export const branchIsYang = (b: Branch, scheme: BranchYinYangScheme = BRANCH_YIN_YANG) =>
  BRANCH_YANG[scheme][BRANCHES.indexOf(b)];

export type SipsinChar = {
  pillar: PillarKey;
  position: "천간" | "지지";
  hangul: string;
  hanja: string;
  sipsin: Sipsin;
  group: SipsinGroup;
};

export type SipsinProfile = {
  /** 일간을 뺀 7글자 (시주가 없으면 5글자). */
  chars: SipsinChar[];
  /** 그룹 세기 (SIPSIN_WEIGHT로 센 값). */
  groups: Record<SipsinGroup, number>;
  /** Strongest first; ties keep SIPSIN_GROUPS order. */
  order: SipsinGroup[];
};

export function sipsinProfile(saju: Saju, scheme: BranchYinYangScheme = BRANCH_YIN_YANG): SipsinProfile {
  const dmStem = saju.dayMaster;
  const dm = { element: dmStem.element, yang: stemIsYang(dmStem.hangul) };
  const chars: SipsinChar[] = [];
  for (const p of saju.pillars) {
    if (p.key !== "day") {
      const s = sipsinOf(dm, { element: p.stem.element, yang: stemIsYang(p.stem.hangul) });
      chars.push({ pillar: p.key, position: "천간", hangul: p.stem.hangul, hanja: p.stem.hanja, sipsin: s, group: groupOf(s) });
    }
    const s = sipsinOf(dm, { element: p.branch.element, yang: branchIsYang(p.branch.hangul as Branch, scheme) });
    chars.push({ pillar: p.key, position: "지지", hangul: p.branch.hangul, hanja: p.branch.hanja, sipsin: s, group: groupOf(s) });
  }
  const groups: Record<SipsinGroup, number> = { 비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0 };
  for (const c of chars) groups[c.group] += c.position === "천간" ? SIPSIN_WEIGHT.stem : SIPSIN_WEIGHT.branch;
  const order = [...SIPSIN_GROUPS].sort((a, b) => groups[b] - groups[a]);
  return { chars, groups, order };
}

/* ── 학과 근거 ── */

/** data/sipsin-aptitude.json */
export type SipsinAptitude = Record<
  SipsinGroup,
  {
    /** "표현력·창의성" */
    trait: string;
    /** "식상(食傷)" */
    label: string;
    /** "{group} 강해 {trait} 돋보여서" — strong (≥ SIPSIN_STRONG_MIN) */
    strong: string;
    /** fewer than that, but present */
    present: string;
  }
> & { _note?: string };

/** data/sipsin-majors.json: "대계열/중계열" (or just "대계열") → groups, best first. */
export type SipsinMajorMap = { byMiddle: Record<string, SipsinGroup[]>; byLarge: Record<string, SipsinGroup[]> };

export type SipsinContent = { aptitude: SipsinAptitude; majors: SipsinMajorMap };

export function groupsForMajor(pick: MajorScore, map: SipsinMajorMap): SipsinGroup[] {
  return map.byMiddle[`${pick.major.대계열}/${pick.major.중계열}`] ?? map.byLarge[pick.major.대계열] ?? [];
}

export type MajorAptitude = { group: SipsinGroup; count: number; matched: boolean; sentence: string };

/**
 * The 학과's 계열 groups, the strongest of them in my 사주. When none of them
 * appear at all, falls back to my strongest group overall (matched: false).
 */
export function majorAptitude(pick: MajorScore, profile: SipsinProfile, content: SipsinContent): MajorAptitude {
  const candidates = groupsForMajor(pick, content.majors);
  const best = candidates.reduce<SipsinGroup | null>(
    (top, g) => (top === null || profile.groups[g] > profile.groups[top] ? g : top),
    null,
  );
  const matched = best !== null && profile.groups[best] > 0;
  const group = matched ? best : profile.order[0];
  const count = profile.groups[group];
  const a = content.aptitude[group];
  const major = pick.major.대표학과[0];
  const lead = (count >= SIPSIN_STRONG_MIN ? a.strong : a.present).replace("{group}", group);
  const sentence = matched
    ? `${lead} ${josa(major, "과/와")} 잘 맞아요`
    : `${lead} ${major}에서도 그 힘을 살릴 수 있어요`;
  return { group, count, matched, sentence };
}

/** "5. 십신으로 본 적성" lines. */
export function sipsinReasonLines(profile: SipsinProfile, aptitude: MajorAptitude, content: SipsinContent): string[] {
  const byPillar = (key: PillarKey) =>
    profile.chars
      .filter((c) => c.pillar === key)
      .map((c) => `${c.hangul}(${c.hanja}) ${c.sipsin}`)
      .join(" · ");
  const pillars = (["year", "month", "day", "hour"] as PillarKey[]).filter((k) => profile.chars.some((c) => c.pillar === k));
  return [
    ...pillars.map((k) => `${PILLAR_LABELS[k]}: ${byPillar(k)}`),
    SIPSIN_GROUPS.map((g) => `${g} ${profile.groups[g]}`).join(" · ") + " (일간을 뺀 글자 수, 지장간 가중치 없음)",
    `${content.aptitude[aptitude.group].label}: ${content.aptitude[aptitude.group].trait}`,
    aptitude.sentence,
  ];
}
