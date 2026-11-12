/**
 * `npm test` — 학과 TOP 3 회귀: 2,484가지 입력의 학과 · 점수가
 * fixtures/top3-baseline.json(fixtures/gen-baseline.mts로 만듦)과 같아야 한다.
 * 대운 · 발음오행 · 십신 같은 근거용 계산이 순위를 바꾸지 못하게 지킨다.
 * 2026-11: 점수 규칙을 바꾸며(오행 비중 · 일간 궁합 5단계 · 분야 보정) 기준을 새로 만들었다.
 * 점수 규칙을 일부러 바꿀 때만 gen-baseline.mts로 다시 만든다.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { analyze } from "./analyze.ts";
import type { Content } from "./content.ts";

const readJson = (name: string) =>
  JSON.parse(readFileSync(new URL(`../../data/${name}`, import.meta.url), "utf8"));
const CONTENT: Content = {
  majors: readJson("majors.json"),
  dayMasters: readJson("day-masters.json"),
  insights: readJson("insights.json"),
  scoring: readJson("scoring.json"),
  fields: readJson("field-elements.json"),
  sipsin: { aptitude: readJson("sipsin-aptitude.json"), majors: readJson("sipsin-majors.json") },
};
const BASELINE: Record<string, Array<[string, number]>> = JSON.parse(
  readFileSync(new URL("./fixtures/top3-baseline.json", import.meta.url), "utf8"),
);

test("학과 TOP 3가 이전과 완전히 같다", () => {
  const keys = Object.keys(BASELINE);
  assert.equal(keys.length, 2484);
  for (const key of keys) {
    const [birth, time] = key.split(" ");
    const unknown = time === "모름";
    const r = analyze(
      { birth, calendar: 0, leapMonth: false, time: unknown ? "" : key.slice(birth.length + 1), unknownTime: unknown },
      CONTENT,
    );
    assert.ok(r.ok, key);
    assert.deepEqual(r.analysis.top.map((p) => [p.major.id, p.display]), BASELINE[key], key);
  }
});

test("같은 입력 = 같은 분석 (근거 문장까지)", () => {
  const input = { birth: "2008.03.15", calendar: 0 as const, leapMonth: false, time: "오후 2시 30분", unknownTime: false };
  assert.deepEqual(analyze(input, CONTENT), analyze(input, CONTENT));
});
