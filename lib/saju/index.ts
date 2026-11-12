/**
 * The app's entry to the 사주 → 학과 rules, wired to the editable tables in
 * /data. Tests import the rule modules directly with their own content.
 */
import dayMasters from "@/data/day-masters.json";
import fields from "@/data/field-elements.json";
import insights from "@/data/insights.json";
import majors from "@/data/majors.json";
import paid from "@/data/paid.json";
import scoring from "@/data/scoring.json";
import founded from "@/data/universities-founded.json";
import sipsinAptitude from "@/data/sipsin-aptitude.json";
import sipsinMajors from "@/data/sipsin-majors.json";

import { analyze, type AnalysisResult } from "./analyze.ts";
import type { BirthInput } from "./birth.ts";
import type { Content } from "./content.ts";
import type { PaidContent } from "./paid.ts";

export const CONTENT = {
  majors,
  dayMasters,
  insights,
  scoring,
  fields,
  sipsin: { aptitude: sipsinAptitude, majors: sipsinMajors },
} as Content;

/** The 유료 결과 tables: lib/saju/paid.ts takes them as an argument too. */
export const PAID_CONTENT = { ...paid, founded: founded.years } as unknown as PaidContent;

export function analyzeBirth(input: BirthInput): AnalysisResult {
  return analyze(input, CONTENT);
}

export { birthError, type BirthInput } from "./birth.ts";
export { personalOf, type Personal } from "./personal.ts";
export { periodLabel, supportLine, daewoonBasisLine, type Daewoon, type DaewoonPeriod } from "./daewoon.ts";
export { nameFlowLine, nameSupportLine, type NameElement } from "./nameElement.ts";
export { FOCUS, SUPPORT_BASIS } from "./rules.ts";
export type { Analysis, ReasonStep } from "./analyze.ts";
export type { MajorScore } from "./score.ts";
export { ELEMENTS, ELEMENT_HANJA, elementLabel, type Element } from "./elements.ts";
export { PILLAR_LABELS } from "./pillars.ts";
export { compatibility, rankFriends, type Compat, type Rank } from "./compat.ts";
export {
  benefactorResult,
  charmResult,
  compatResult,
  type BenefactorRelation,
  type BenefactorResult,
  type CharmResult,
  type CompatResult,
} from "./paid.ts";
