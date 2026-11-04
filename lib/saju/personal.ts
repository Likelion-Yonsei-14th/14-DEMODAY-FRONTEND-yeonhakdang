/**
 * 성별 · 이름이 있어야 보이는 결과(대운 · 발음오행). Pure, and computed on the
 * device only: the 이름 · 성별 · 생년월일 · 시간 never leave it (the server
 * keeps only resultSummary, GA only the event names).
 *
 * 학과 TOP 3는 analyze()가 이미 정했고, 여기 결과는 그 순위에 쓰지 않는다.
 */
import type { Analysis } from "./analyze.ts";
import { resolveBirth, type BirthInput, type SolarBirth } from "./birth.ts";
import { computeDaewoon, type Daewoon, type Gender } from "./daewoon.ts";
import type { Element } from "./elements.ts";
import { nameElement, type NameElement } from "./nameElement.ts";

export type Personal = {
  birth: SolarBirth;
  /** 보완 기운: 용신 대신 가장 약한 오행 (rules.ts SUPPORT_BASIS). */
  target: Element;
  daewoon: Daewoon;
  /** Null when no 이름 was typed or it has no 한글 글자: the card hides. */
  name: NameElement | null;
};

export function personalOf(
  analysis: Pick<Analysis, "saju" | "weakest">,
  input: BirthInput,
  gender: Gender,
  name: string,
): Personal | null {
  const birth = resolveBirth(input);
  if (!birth.ok) return null;
  const target = analysis.weakest;
  return {
    birth: birth.solar,
    target,
    daewoon: computeDaewoon(analysis.saju, birth.solar, gender, target),
    name: name.trim() ? nameElement(name, target) : null,
  };
}
