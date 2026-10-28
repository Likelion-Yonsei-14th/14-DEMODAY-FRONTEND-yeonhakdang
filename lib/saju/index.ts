/**
 * The app's entry to the 사주 → 학과 rules, wired to the editable tables in
 * /data. Tests import the rule modules directly with their own content.
 */
import dayMasters from "@/data/day-masters.json";
import insights from "@/data/insights.json";
import majors from "@/data/majors.json";
import scoring from "@/data/scoring.json";

import { analyze, type AnalysisResult } from "./analyze.ts";
import type { BirthInput } from "./birth.ts";
import type { Content } from "./content.ts";

export const CONTENT = { majors, dayMasters, insights, scoring } as Content;

export function analyzeBirth(input: BirthInput): AnalysisResult {
  return analyze(input, CONTENT);
}

export { birthError, type BirthInput } from "./birth.ts";
export type { Analysis, ReasonStep } from "./analyze.ts";
export type { MajorScore } from "./score.ts";
export { ELEMENTS, ELEMENT_HANJA, elementLabel, type Element } from "./elements.ts";
export { PILLAR_LABELS } from "./pillars.ts";
export { compatibility, rankFriends, type Compat, type Rank } from "./compat.ts";
