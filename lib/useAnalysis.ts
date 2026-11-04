"use client";

import { useMemo } from "react";

import { FIGMA_STATE, useProto, type ProtoState } from "@/lib/proto";
import { analyzeBirth, personalOf, type Analysis, type Personal } from "@/lib/saju";

function inputOf(s: ProtoState) {
  return {
    birth: s.birth,
    calendar: s.calendar,
    leapMonth: s.leapMonth,
    time: s.time,
    unknownTime: s.unknownTime,
  };
}

/**
 * The 사주 → 학과 result for the entered birth. A screen reached without a
 * valid birth (a deep link, a static frame) shows the Figma example person.
 */
export function useAnalysis(): Analysis {
  const { state } = useProto();
  const { birth, calendar, leapMonth, time, unknownTime } = state;
  return useMemo(() => {
    const own = analyzeBirth({ birth, calendar, leapMonth, time, unknownTime });
    if (own.ok) return own.analysis;
    const example = analyzeBirth(inputOf(FIGMA_STATE));
    if (!example.ok) throw new Error(example.error);
    return example.analysis;
  }, [birth, calendar, leapMonth, time, unknownTime]);
}

/**
 * 대운 · 발음오행 — they need 성별 and 이름, which the 학과 analysis never
 * sees. Computed here on the device; nothing of it is sent anywhere. Falls
 * back to the Figma example person exactly like useAnalysis.
 */
export function usePersonal(): Personal | null {
  const analysis = useAnalysis();
  const { state } = useProto();
  const { birth, calendar, leapMonth, time, unknownTime, gender, name } = state;
  return useMemo(() => {
    const own = { birth, calendar, leapMonth, time, unknownTime };
    if (analyzeBirth(own).ok) return personalOf(analysis, own, gender, name);
    return personalOf(analysis, inputOf(FIGMA_STATE), FIGMA_STATE.gender, FIGMA_STATE.name);
  }, [analysis, birth, calendar, leapMonth, time, unknownTime, gender, name]);
}
