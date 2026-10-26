/** `npm test` — 친구 궁합 and 석차. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { analyze, type Analysis } from "./analyze.ts";
import { COMPAT_MAX, COMPAT_MIN, compatibility, rankFriends, relationOf } from "./compat.ts";
import type { Content } from "./content.ts";
import type { Element, ElementCounts } from "./elements.ts";

const readJson = (name: string) =>
  JSON.parse(readFileSync(new URL(`../../data/${name}`, import.meta.url), "utf8"));

const CONTENT: Content = {
  majors: readJson("majors.json"),
  dayMasters: readJson("day-masters.json"),
  insights: readJson("insights.json"),
  scoring: readJson("scoring.json"),
};

function person(birth: string): Analysis {
  const r = analyze({ birth, calendar: 0, leapMonth: false, time: "", unknownTime: true }, CONTENT);
  assert.ok(r.ok);
  return r.analysis;
}

/** One birth per day of 2008's first 100 days: every 일간 shows up. */
const PEOPLE = Array.from({ length: 100 }, (_, i) => {
  const d = new Date(Date.UTC(2008, 0, 1 + i));
  return person(
    `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`,
  );
});

test("일간 오행 관계: 상생 · 비화 · 상극", () => {
  assert.equal(relationOf("목", "화"), "feeds");
  assert.equal(relationOf("화", "목"), "fed");
  assert.equal(relationOf("토", "토"), "same");
  assert.equal(relationOf("목", "토"), "controls");
  assert.equal(relationOf("토", "목"), "controlled");
});

test("궁합 점수는 60~98점이고, 두 사람을 바꿔도 같다", () => {
  for (const a of PEOPLE.slice(0, 30)) {
    for (const b of PEOPLE.slice(30, 60)) {
      const ab = compatibility(a, b, "B").score;
      assert.ok(ab >= COMPAT_MIN && ab <= COMPAT_MAX, `${ab}`);
      assert.equal(ab, compatibility(b, a, "A").score);
    }
  }
});

/** Just what compatibility reads: 일간 오행, counts, weakest, 유형. */
function fake(element: Element, counts: ElementCounts, weakest: Element): Analysis {
  return {
    saju: { dayMaster: { element } },
    counts,
    weakest,
    dayMaster: { type: "테스트형" },
  } as unknown as Analysis;
}

test("같은 보완이면 상생 > 비화 > 상극", () => {
  // Nobody holds the other's weakest element: only the 일간 relation counts.
  const counts: ElementCounts = { 목: 3, 화: 3, 토: 2, 금: 0, 수: 0 };
  const me = fake("목", counts, "금");
  const score = (e: Element) => compatibility(me, fake(e, counts, "금"), "친구").score;
  assert.ok(score("화") > score("목"));
  assert.ok(score("목") > score("토"));
  assert.equal(score("화"), score("수"));
  assert.equal(score("토"), score("금"));
});

test("서로 약한 기운을 채워 주면 점수가 오른다", () => {
  const me = fake("목", { 목: 3, 화: 3, 토: 2, 금: 0, 수: 0 }, "금");
  const lacking = fake("화", { 목: 3, 화: 3, 토: 2, 금: 0, 수: 0 }, "금");
  const filling = fake("화", { 목: 0, 화: 3, 토: 2, 금: 3, 수: 0 }, "목");
  assert.ok(compatibility(me, filling, "친구").score > compatibility(me, lacking, "친구").score);
});

test("궁합 설명: 공식 · 이유 세 줄 · 조사", () => {
  const me = PEOPLE.find((p) => p.saju.dayMaster.element === "목");
  const friend = PEOPLE.find((p) => p.saju.dayMaster.element === "화");
  assert.ok(me && friend);
  const c = compatibility(me, friend, "민지");
  assert.equal(c.formula, "木 生 火");
  assert.equal(c.caption, "나무가 불을 살리는 상생");
  assert.equal(c.reasons.length, 3);
  assert.match(c.reasons[0], /^내 목\(木\) 기운이 민지의 화\(火\)를 키워 주는/);
});

test("석차: 점수 내림차순, 동점이면 먼저 등록한 친구, 3위부터 70점 미만은 추가 합격", () => {
  const ranked = rankFriends([
    { id: "c", score: 81, addedAt: 3 },
    { id: "a", score: 90, addedAt: 2 },
    { id: "b", score: 90, addedAt: 1 },
    { id: "d", score: 68, addedAt: 4 },
  ]);
  assert.deepEqual(
    ranked.map((r) => [r.id, r.rank]),
    [
      ["b", "수석 동기"],
      ["a", "차석"],
      ["c", "합격"],
      ["d", "추가 합격"],
    ],
  );
  // 수석 and 차석 stand even under 70.
  assert.deepEqual(
    rankFriends([{ score: 65, addedAt: 1 }, { score: 62, addedAt: 2 }]).map((r) => r.rank),
    ["수석 동기", "차석"],
  );
});
