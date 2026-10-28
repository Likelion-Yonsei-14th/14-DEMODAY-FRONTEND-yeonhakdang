"use client";

import { useMemo } from "react";

import { FIGMA_STATE, useProto, type ProtoState } from "@/lib/proto";
import { analyzeBirth, type Analysis } from "@/lib/saju";

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
