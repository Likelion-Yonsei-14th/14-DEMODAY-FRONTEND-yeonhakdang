"use client";

import { useMemo } from "react";

import { savedFor } from "@/lib/purchaseSnapshot";
import { FIGMA_STATE, useProto } from "@/lib/proto";
import { PAID_CONTENT, benefactorResult, charmResult, compatResult } from "@/lib/saju";
import { useAnalysis, usePersonal } from "@/lib/useAnalysis";

/**
 * The 유료 결과 for the entered birth and the chosen 대학 / 관계. Like
 * useAnalysis, a screen without them (a deep link, a static frame) shows the
 * Figma example.
 */
export function useCompatResult() {
  const analysis = useAnalysis();
  const personal = usePersonal();
  const state = useProto().state;
  const { universities } = state;
  const stored = savedFor(state.paidResults, state.orders, "compat");
  return useMemo(
    () => stored ?? compatResult(analysis, universities.length ? universities : FIGMA_STATE.universities, PAID_CONTENT, personal),
    [stored, analysis, universities, personal],
  );
}

export function useBenefactorResult() {
  const analysis = useAnalysis();
  const personal = usePersonal();
  const state = useProto().state;
  const { relation } = state;
  const stored = savedFor(state.paidResults, state.orders, "benefactor");
  return useMemo(() => stored ?? benefactorResult(analysis, relation, PAID_CONTENT, personal), [stored, analysis, relation, personal]);
}

/** `charmRerolls` left of 3: each 다시 뽑기 draws the next design. */
export function useCharmResult() {
  const analysis = useAnalysis();
  const personal = usePersonal();
  const state = useProto().state;
  const { charmRerolls } = state;
  const stored = savedFor(state.paidResults, state.orders, "charm");
  return useMemo(() => stored ?? charmResult(analysis, 3 - charmRerolls, PAID_CONTENT, personal), [stored, analysis, charmRerolls, personal]);
}
