/**
 * 대운(大運): 10년마다 바뀌는 큰 운. Pure: the same birth and 성별 always give
 * the same 대운. 학과 TOP 3 점수에는 쓰지 않는다.
 *
 * 성별: lib/proto.tsx의 gender는 정보 입력 폼(InputForm.tsx)의 ["남자", "여자"]
 * 선택 순서 그대로 0 = 남자, 1 = 여자.
 *
 * 보완 기운: 용신 계산이 없어 사주에서 가장 약한 오행을 쓴다 (SUPPORT_BASIS).
 */
import { calculateSaju } from "@fullstackfamily/manseryeok";

import type { SolarBirth } from "./birth.ts";
import { elementLabel, supportOf, type Element, type Support } from "./elements.ts";
import { ganzhiParts, shiftJiazi, stemIsYang } from "./ganzhi.ts";
import type { Saju } from "./pillars.ts";
import { DAEWOON, FOCUS } from "./rules.ts";

/** 0 남자, 1 여자 — the 정보 입력 폼's 성별 order. */
export type Gender = 0 | 1;

export type Day = { year: number; month: number; day: number };

export type DaewoonPeriod = {
  /** 만 나이, inclusive. */
  startAge: number;
  endAge: number;
  /** "병진" / "丙辰" */
  hangul: string;
  hanja: string;
  stemElement: Element;
  branchElement: Element;
  /** Does it back the 보완 기운 (가장 약한 오행)? */
  support: Support;
  /** 연학당이 강조하는 시기에 걸치는지. */
  exam: boolean;
  college: boolean;
};

export type Daewoon = {
  forward: boolean;
  /** 대운수: the age the first 대운 starts. */
  number: number;
  /** Days to the 절입일 (forward) or since it (backward). */
  days: number;
  /** The 절입일 used. */
  termDay: Day;
  /** 절기 시각 표가 없어 언제나 날짜로 센다 (DAEWOON.basis). */
  dateBasis: true;
  /** The 보완 기운 every `support` is judged against. */
  target: Element;
  periods: DaewoonPeriod[];
  /** 만 나이 on FOCUS.exam.date. */
  examAge: number;
  /** Index into `periods`, or null when the first 대운 hasn't started yet. */
  examIndex: number | null;
  collegeIndexes: number[];
};

const DAY_MS = 86_400_000;
const utc = (d: Day) => Date.UTC(d.year, d.month - 1, d.day);
function addDays(d: Day, n: number): Day {
  const t = new Date(utc(d) + n * DAY_MS);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
}
const monthPillarOn = (d: Day) => calculateSaju(d.year, d.month, d.day).monthPillar;

/** 순행: 양년 남자 · 음년 여자. 역행: 음년 남자 · 양년 여자. */
export function isForward(yearStem: string, gender: Gender): boolean {
  return stemIsYang(yearStem) === (gender === 0);
}

/**
 * 절입일 = 만세력 월주가 바뀌는 날. 순행은 생일 뒤 첫 절입일, 역행은 생일이
 * 속한 달(월주)이 시작된 날. 절기 당일에 태어나면 역행 일수는 0.
 */
export function termDistance(birth: Day, forward: boolean): { days: number; termDay: Day } {
  const own = monthPillarOn(birth);
  if (forward) {
    for (let n = 1; n <= 40; n++) {
      const d = addDays(birth, n);
      if (monthPillarOn(d) !== own) return { days: n, termDay: d };
    }
  } else {
    for (let n = 1; n <= 40; n++) {
      if (monthPillarOn(addDays(birth, -n)) !== own) return { days: n - 1, termDay: addDays(birth, -(n - 1)) };
    }
  }
  throw new Error("절입일을 찾지 못했어요");
}

export function daewoonNumber(days: number): number {
  const raw = days / DAEWOON.daysPerYear;
  return Math[DAEWOON.rounding](raw);
}

/** 만 나이 on `on`. */
export function ageOn(birth: Day, on: Day): number {
  const before = on.month < birth.month || (on.month === birth.month && on.day < birth.day);
  return on.year - birth.year - (before ? 1 : 0);
}

export function computeDaewoon(saju: Saju, birth: SolarBirth, gender: Gender, target: Element): Daewoon {
  const forward = isForward(saju.pillars[0].stem.hangul, gender);
  const day: Day = { year: birth.year, month: birth.month, day: birth.day };
  const { days, termDay } = termDistance(day, forward);
  const number = daewoonNumber(days);
  const month = saju.pillars[1].hangul;

  const examAge = ageOn(day, FOCUS.exam.date);
  const periods: DaewoonPeriod[] = Array.from({ length: DAEWOON.count }, (_, i) => {
    const p = ganzhiParts(shiftJiazi(month, forward ? i + 1 : -(i + 1)));
    const startAge = number + i * DAEWOON.span;
    const endAge = startAge + DAEWOON.span - 1;
    return {
      startAge,
      endAge,
      hangul: p.hangul,
      hanja: p.hanja,
      stemElement: p.stemElement,
      branchElement: p.branchElement,
      support: supportOf([p.stemElement, p.branchElement], target),
      exam: examAge >= startAge && examAge <= endAge,
      college: startAge <= FOCUS.college.to && endAge >= FOCUS.college.from,
    };
  });

  const examIndex = periods.findIndex((p) => p.exam);
  return {
    forward,
    number,
    days,
    termDay,
    dateBasis: true,
    target,
    periods,
    examAge,
    examIndex: examIndex < 0 ? null : examIndex,
    collegeIndexes: periods.flatMap((p, i) => (p.college ? [i] : [])),
  };
}

/* ── 문구 ── */

/** "병진(丙辰) 대운 · 화(火)·토(土)" */
export function periodLabel(p: DaewoonPeriod): string {
  return `${p.hangul}(${p.hanja}) 대운 · ${elementLabel(p.stemElement)}·${elementLabel(p.branchElement)}`;
}

/** One line on whether `p` backs the 보완 기운. */
export function supportLine(p: DaewoonPeriod, target: Element): string {
  const t = elementLabel(target);
  if (p.support === "fills") return `부족한 ${t} 기운을 직접 채워 주는 시기예요`;
  if (p.support === "helps") return `부족한 ${t} 기운을 생(生)해 주는 기운이 들어와 힘이 돼요`;
  return `부족한 ${t} 기운을 직접 돕지는 않아요. 내 강점을 살리는 시기예요`;
}

/** How the 대운수 was reached, for the card's 근거. */
export function daewoonBasisLine(d: Daewoon, birth: SolarBirth): string {
  const dir = d.forward ? "다음 절기" : "지난 절기";
  const term = `${d.termDay.month}월 ${d.termDay.day}일`;
  const time = birth.hour === null ? "" : " 출생 시각은 절기 시각 표가 없어 반영하지 않았어요.";
  return `${d.forward ? "순행" : "역행"} · ${dir}(${term})${d.forward ? "까지" : "부터"} ${d.days}일 ÷ ${DAEWOON.daysPerYear} → 대운수 ${d.number} (날짜 기준).${time}`;
}
