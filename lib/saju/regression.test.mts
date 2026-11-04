/**
 * `npm test` — 학과 TOP 3 회귀: 대운 · 발음오행 · 십신을 더하기 전 결과
 * (fixtures/top3-baseline.json, fixtures/gen-baseline.mts로 만듦)와 2,484가지
 * 입력 모두 학과 · 점수까지 같아야 한다. 이미 결과를 공유한 사용자의 순위가
 * 바뀌면 안 된다.
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
