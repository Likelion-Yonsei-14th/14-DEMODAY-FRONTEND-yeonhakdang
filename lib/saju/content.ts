/**
 * The shapes of the editable content in /data. The rules take content as an
 * argument, so changing a table changes the result without touching code.
 */
import type { Element } from "./elements.ts";
import type { SipsinContent } from "./sipsin.ts";

/** One row of data/majors.csv (converted to data/majors.json at build). */
export type MajorRow = {
  id: string;
  대계열: string;
  중계열: string;
  /** 표준분류 소계열 */
  학과군: string;
  /** Real department names; the first is the one shown big. */
  대표학과: string[];
  주오행: Element;
  보조오행: Element | null;
  근거: string;
};

export type DayMasterType = {
  /** "갑목" */
  name: string;
  /** "甲木" */
  hanja: string;
  /** "개척하는 리더형" */
  type: string;
  /** ResultHero headline, line breaks included. */
  headline: string;
  description: string;
  tags: string[];
};

export type Insights = {
  /** Per element: "목(木)이 강하" — joined with "고 " before the weak part. */
  strong: Record<Element, string>;
  /** Per element: "금(金)이 약해요. …" */
  weak: Record<Element, string>;
  /** When every element is within one of the others. */
  balanced: string;
};

export type Scoring = {
  /** 성향 · 일간 궁합 · 보완; they add up to 1. */
  presenceWeight: number;
  dayMasterWeight: number;
  complementWeight: number;
  /** A major's 오행 비중: 주오행 · 보조오행 · 분야 보정; they add up to 1. */
  mainShare: number;
  subShare: number;
  fieldShare: number;
  /** 0–1 points for each 일간 관계 (see DayMasterRelation in score.ts). */
  dayMasterRelation: Record<"same" | "fed" | "controlled" | "feeder" | "controller", number>;
  /** An element under this share of my 사주 (0.2 = 고르게 나뉜 몫) counts as 부족. */
  deficitBelow: number;
  /** Shown score = displayMin + (displayMax − displayMin) × (total − totalFloor) / (totalCeil − totalFloor), clamped. */
  totalFloor: number;
  totalCeil: number;
  displayMin: number;
  displayMax: number;
  /** TOP N, each from a different 중계열. */
  topCount: number;
};

/** data/field-elements.csv: "대계열/중계열" → 0–3 보정 per 오행. */
export type FieldElements = Record<string, Record<Element, number>>;

export type Content = {
  majors: MajorRow[];
  dayMasters: Record<string, DayMasterType>;
  insights: Insights;
  scoring: Scoring;
  /** 분야(중계열)별 오행 보정. */
  fields: FieldElements;
  /** data/sipsin-aptitude.json + data/sipsin-majors.json: 근거 문장만, 점수에는 안 쓴다. */
  sipsin: SipsinContent;
};
