"use client";

import { useMemo } from "react";

import { FIGMA_STATE, useProto } from "@/lib/proto";
import { PAID_CONTENT, benefactorResult, charmResult, compatResult } from "@/lib/saju";
import { useAnalysis } from "@/lib/useAnalysis";

/**
 * The 유료 결과 for the entered birth and the chosen 대학 / 관계. Like
 * useAnalysis, a screen without them (a deep link, a static frame) shows the
 * Figma example.
 */
export function useCompatResult() {
  const analysis = useAnalysis();
  const { universities } = useProto().state;
  return useMemo(
    () => compatResult(analysis, universities.length ? universities : FIGMA_STATE.universities, PAID_CONTENT),
    [analysis, universities],
  );
}

export function useBenefactorResult() {
  const analysis = useAnalysis();
  const { relation } = useProto().state;
  return useMemo(() => benefactorResult(analysis, relation, PAID_CONTENT), [analysis, relation]);
}

/** `charmRerolls` left of 3: each 다시 뽑기 draws the next design. */
export function useCharmResult() {
  const analysis = useAnalysis();
  const { charmRerolls } = useProto().state;
  return useMemo(() => charmResult(analysis, 3 - charmRerolls, PAID_CONTENT), [analysis, charmRerolls]);
}
