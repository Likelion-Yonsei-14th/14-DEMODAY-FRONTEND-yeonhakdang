/**
 * The shapes of the editable content in /data. The rules take content as an
 * argument, so changing a table changes the result without touching code.
 */
import type { Element } from "./elements.ts";

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
  /** 성향 vs 보완; they add up to 1. */
  tendencyWeight: number;
  complementWeight: number;
  /** Inside 성향: how much the major's element is present vs. its 일간 relation. */
  presenceShare: number;
  dayMasterShare: number;
  /** 일간 관계 points. */
  sameAsDayMaster: number;
  fedByDayMaster: number;
  /** A 보조 오행 counts this much of a 주 오행 in 성향. */
  subElementWeight: number;
  /** 보완 points for filling the weakest / second-weakest element. */
  fillsWeakest: number;
  fillsSecondWeakest: number;
  /** Shown score = displayMin + (displayMax − displayMin) × total. */
  displayMin: number;
  displayMax: number;
  /** TOP N, each from a different 중계열. */
  topCount: number;
};

export type Content = {
  majors: MajorRow[];
  dayMasters: Record<string, DayMasterType>;
  insights: Insights;
  scoring: Scoring;
};
