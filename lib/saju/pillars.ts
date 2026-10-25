/**
 * 사주 8글자 (6 without a birth time) from a 양력 birth, and their 오행.
 * Thin over @fullstackfamily/manseryeok (≥ 1.0.8: earlier versions had 월주
 * and 지지 오행 bugs). Pure.
 */
import { calculateSaju, getPillarByHangul } from "@fullstackfamily/manseryeok";

import { emptyCounts, type Element, type ElementCounts } from "./elements.ts";
import type { SolarBirth } from "./birth.ts";

export type PillarKey = "year" | "month" | "day" | "hour";

export const PILLAR_LABELS: Record<PillarKey, string> = {
  year: "년주",
  month: "월주",
  day: "일주",
  hour: "시주",
};

export type Char = { hangul: string; hanja: string; element: Element };

export type Pillar = {
  key: PillarKey;
  /** "갑인" */
  hangul: string;
  /** "甲寅" */
  hanja: string;
  /** 천간 */
  stem: Char;
  /** 지지 */
  branch: Char;
};

export type Saju = {
  /** 년 · 월 · 일 · 시 order; 시주 missing when the time is unknown. */
  pillars: Pillar[];
  /** 일간: the 천간 of 일주. */
  dayMaster: Char;
  /** 서울 경도 기준 시간 보정이 들어갔는지 (시간을 알 때만). */
  timeCorrected: boolean;
  correctedTime?: { hour: number; minute: number };
};

function toPillar(key: PillarKey, hangul: string): Pillar {
  const p = getPillarByHangul(hangul);
  if (!p) throw new Error(`Unknown pillar: ${hangul}`);
  return {
    key,
    hangul,
    hanja: p.combined.hanja,
    stem: { hangul: p.tiangan.hangul, hanja: p.tiangan.hanja, element: p.tiangan.element as Element },
    branch: { hangul: p.dizhi.hangul, hanja: p.dizhi.hanja, element: p.dizhi.element as Element },
  };
}

/**
 * 23시대 출생은 라이브러리 계산 그대로: 날짜는 그날, 시주는 그날의 자시.
 * (야자시·통자시로 바꾸려면 여기만 고치면 된다.)
 */
export function computeSaju(birth: SolarBirth): Saju {
  const r =
    birth.hour === null
      ? calculateSaju(birth.year, birth.month, birth.day)
      : calculateSaju(birth.year, birth.month, birth.day, birth.hour, birth.minute);

  const pillars = [
    toPillar("year", r.yearPillar),
    toPillar("month", r.monthPillar),
    toPillar("day", r.dayPillar),
  ];
  if (r.hourPillar) pillars.push(toPillar("hour", r.hourPillar));

  return {
    pillars,
    dayMaster: pillars[2].stem,
    timeCorrected: r.isTimeCorrected,
    correctedTime: r.correctedTime,
  };
}

/** Each of the 8 (or 6) characters counts once. */
export function countElements(saju: Saju): ElementCounts {
  const counts = emptyCounts();
  for (const p of saju.pillars) {
    counts[p.stem.element] += 1;
    counts[p.branch.element] += 1;
  }
  return counts;
}
