/** `npm test` — 대운: 순역행, 대운수(날짜 기준), 간지 순서, 강조 구간. */
import assert from "node:assert/strict";
import { test } from "node:test";

import type { SolarBirth } from "./birth.ts";
import { ageOn, computeDaewoon, daewoonBasisLine, daewoonNumber, isForward, termDistance, type Gender } from "./daewoon.ts";
import { JIAZI } from "./ganzhi.ts";
import { computeSaju } from "./pillars.ts";

const birth = (y: number, m: number, d: number, hour: number | null = null, minute = 0): SolarBirth => ({
  year: y,
  month: m,
  day: d,
  hour,
  minute,
});
const daewoon = (b: SolarBirth, g: Gender) => computeDaewoon(computeSaju(b), b, g, "화");
const MALE = 0;
const FEMALE = 1;

test("성별 0 = 남자, 1 = 여자: 양년 남자 · 음년 여자는 순행, 반대는 역행", () => {
  assert.equal(isForward("무", MALE), true); // 양남
  assert.equal(isForward("기", FEMALE), true); // 음녀
  assert.equal(isForward("기", MALE), false); // 음남
  assert.equal(isForward("무", FEMALE), false); // 양녀
});

test("양남 순행: 2008.03.15(무자년) → 다음 절입 4/5까지 21일 → 대운수 7, 병진부터", () => {
  const d = daewoon(birth(2008, 3, 15), MALE);
  assert.equal(d.forward, true);
  assert.equal(d.days, 21);
  assert.deepEqual(d.termDay, { year: 2008, month: 4, day: 5 });
  assert.equal(d.number, 7);
  assert.deepEqual(d.periods.slice(0, 3).map((p) => p.hangul), ["병진", "정사", "무오"]);
  assert.deepEqual(d.periods.map((p) => [p.startAge, p.endAge]).slice(0, 2), [[7, 16], [17, 26]]);
});

test("양녀 역행: 2008.03.15 → 지난 절입 3/6부터 9일 → 대운수 3, 갑인 · 계축 · 임자", () => {
  const d = daewoon(birth(2008, 3, 15), FEMALE);
  assert.equal(d.forward, false);
  assert.equal(d.days, 9);
  assert.equal(d.number, 3);
  assert.deepEqual(d.periods.slice(0, 3).map((p) => p.hangul), ["갑인", "계축", "임자"]);
});

test("음녀 순행 · 음남 역행: 2009.03.15(기축년)", () => {
  const f = daewoon(birth(2009, 3, 15), FEMALE);
  assert.equal(f.forward, true);
  assert.equal(f.number, 7);
  assert.equal(f.periods[0].hangul, "무진");
  const m = daewoon(birth(2009, 3, 15), MALE);
  assert.equal(m.forward, false);
  assert.equal(m.number, 3);
  assert.equal(m.periods[0].hangul, "병인");
});

test("대운은 월주에서 60갑자 순서로 한 칸씩, 10년씩 8개", () => {
  for (const g of [MALE, FEMALE] as const) {
    const d = daewoon(birth(2008, 3, 15), g);
    assert.equal(d.periods.length, 8);
    const step = d.forward ? 1 : -1;
    let i = JIAZI.indexOf("을묘");
    for (const p of d.periods) {
      i = (i + step + 60) % 60;
      assert.equal(p.hangul, JIAZI[i]);
    }
    d.periods.slice(1).forEach((p, k) => assert.equal(p.startAge, d.periods[k].startAge + 10));
  }
});

test("절기 당일 출생: 역행은 0일 → 대운수 0, 순행은 다음 절입까지 한 달", () => {
  // 만세력 월주가 2008-04-05에 을묘 → 병진으로 바뀐다.
  assert.equal(computeSaju(birth(2008, 4, 5)).pillars[1].hangul, "병진");
  const back = daewoon(birth(2008, 4, 5), FEMALE);
  assert.equal(back.days, 0);
  assert.equal(back.number, 0);
  assert.equal(back.periods[0].hangul, "을묘");
  assert.deepEqual([back.periods[0].startAge, back.periods[0].endAge], [0, 9]);
  const fwd = daewoon(birth(2008, 4, 5), MALE);
  assert.equal(fwd.days, 31);
  assert.equal(fwd.number, 10);
});

test("절기 전날 출생: 순행 1일 → 0, 역행 29일 → 10 (9.67 반올림)", () => {
  assert.equal(computeSaju(birth(2008, 4, 4)).pillars[1].hangul, "을묘");
  const fwd = daewoon(birth(2008, 4, 4), MALE);
  assert.equal(fwd.days, 1);
  assert.equal(fwd.number, 0);
  const back = daewoon(birth(2008, 4, 4), FEMALE);
  assert.equal(back.days, 29);
  assert.equal(back.number, 10);
});

test("대운수 반올림 경계: 나머지 1은 버리고 2는 올린다", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 28, 29, 30].map(daewoonNumber), [0, 0, 1, 1, 1, 2, 2, 9, 10, 10]);
  assert.equal(termDistance({ year: 2008, month: 3, day: 15 }, true).days, 21);
});

test("시간을 몰라도 같은 대운: 언제나 날짜 기준이고, 시간을 알면 반영 안 했다고 적는다", () => {
  const noTime = daewoon(birth(2008, 3, 15), MALE);
  const withTime = daewoon(birth(2008, 3, 15, 14, 30), MALE);
  assert.deepEqual(withTime.periods, noTime.periods);
  assert.equal(noTime.dateBasis, true);
  assert.match(daewoonBasisLine(noTime, birth(2008, 3, 15)), /날짜 기준/);
  assert.doesNotMatch(daewoonBasisLine(noTime, birth(2008, 3, 15)), /출생 시각/);
  assert.match(daewoonBasisLine(withTime, birth(2008, 3, 15, 14, 30)), /출생 시각은 절기 시각 표가 없어/);
});

test("강조 구간: 2026-11-19 입시 만 나이와 19~24세 대학 시절", () => {
  assert.equal(ageOn({ year: 2008, month: 3, day: 15 }, { year: 2026, month: 11, day: 19 }), 18);
  assert.equal(ageOn({ year: 2007, month: 11, day: 20 }, { year: 2026, month: 11, day: 19 }), 18);
  assert.equal(ageOn({ year: 2007, month: 11, day: 19 }, { year: 2026, month: 11, day: 19 }), 19);

  const m = daewoon(birth(2008, 3, 15), MALE); // 7~16, 17~26 …
  assert.equal(m.examAge, 18);
  assert.equal(m.examIndex, 1);
  assert.deepEqual(m.collegeIndexes, [1]);
  const f = daewoon(birth(2008, 3, 15), FEMALE); // 3~12, 13~22, 23~32
  assert.deepEqual(f.collegeIndexes, [1, 2]);
  assert.deepEqual(f.periods.map((p) => p.exam), [false, true, false, false, false, false, false, false]);
});

test("보완 기운을 채우면 fills, 생해 주면 helps", () => {
  const d = computeDaewoon(computeSaju(birth(2008, 3, 15)), birth(2008, 3, 15), MALE, "토");
  // 병진: 화(토를 생) · 토
  assert.equal(d.periods[0].support, "fills");
  const w = computeDaewoon(computeSaju(birth(2008, 3, 15)), birth(2008, 3, 15), MALE, "금");
  // 병진: 화 · 토(금을 생) → helps
  assert.equal(w.periods[0].support, "helps");
  const n = computeDaewoon(computeSaju(birth(2008, 3, 15)), birth(2008, 3, 15), MALE, "목");
  // 병진: 화 · 토 — 목도, 목을 생하는 수도 없다
  assert.equal(n.periods[0].support, "none");
});

test("같은 입력 = 같은 대운", () => {
  assert.deepEqual(daewoon(birth(2007, 8, 7, 23, 40), FEMALE), daewoon(birth(2007, 8, 7, 23, 40), FEMALE));
});
