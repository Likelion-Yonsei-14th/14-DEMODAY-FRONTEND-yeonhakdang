/**
 * `npm test` — 학과 적합도 점수 (lib/saju/score.ts): 일간 궁합 5단계, 오행 비중,
 * 부족한 기운 보완, 동점 처리, TOP 3 점수가 겹치지 않는지.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { analyze } from "./analyze.ts";
import type { BirthInput } from "./birth.ts";
import type { Content, MajorRow } from "./content.ts";
import { majorShares, pickTop, rankMajors, relationTo, scoreMajor, toDisplay, type MajorScore } from "./score.ts";

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
const S = CONTENT.scoring;

const row = (id: string, 주오행: MajorRow["주오행"], 보조오행: MajorRow["보조오행"], 중계열 = ""): MajorRow => ({
  id, 대계열: "테스트", 중계열, 학과군: "", 대표학과: [`${id}학과`], 주오행, 보조오행, 근거: "",
});
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;

test("일간 궁합은 다섯 관계로 나뉜다 (갑목 기준)", () => {
  assert.equal(relationTo("목", "목"), "same"); // 비겁
  assert.equal(relationTo("목", "화"), "fed"); // 식상
  assert.equal(relationTo("목", "토"), "controlled"); // 재성
  assert.equal(relationTo("목", "수"), "feeder"); // 인성
  assert.equal(relationTo("목", "금"), "controller"); // 관성
  const r = S.dayMasterRelation;
  assert.ok(r.fed > r.same && r.same > r.feeder && r.feeder > r.controlled && r.controlled > r.controller);
});

test("학과의 오행 비중은 합이 1: 주 · 보조 · 분야 보정", () => {
  const fields = { "테스트/공학": { 목: 0, 화: 0, 토: 0, 금: 2, 수: 1 } };
  const withField = majorShares(row("A", "토", "금", "공학"), fields, S);
  const total = [...withField.values()].reduce((n, v) => n + v.share, 0);
  assert.ok(close(total, 1));
  assert.ok(close(withField.get("토")!.share, S.mainShare));
  assert.ok(close(withField.get("금")!.share, S.subShare + (S.fieldShare * 2) / 3));
  assert.deepEqual(withField.get("금")!.roles, ["sub", "field"]);
  // 분야 보정이 없으면 그 몫은 주 · 보조에 나눠진다.
  const plain = majorShares(row("B", "토", "금"), {}, S);
  assert.ok(close(plain.get("토")!.share, S.mainShare / (S.mainShare + S.subShare)));
});

test("똑같이 부족한 기운은 똑같은 보완 점수를 받는다", () => {
  const profile = { counts: { 목: 1, 화: 1, 토: 2, 금: 1, 수: 1 }, dayMaster: "토" as const, seed: "x" };
  const deficitOf = (e: MajorRow["주오행"]) =>
    scoreMajor(row("A", e, null), profile, S).tendencyParts[0].deficit;
  assert.ok(close(deficitOf("목"), deficitOf("화")));
  assert.ok(close(deficitOf("목"), deficitOf("금")));
  assert.ok(close(deficitOf("목"), deficitOf("수")));
  assert.equal(deficitOf("토"), 0);
  // 하나도 없는 기운이 가장 크게 채워진다.
  const none = { ...profile, counts: { 목: 0, 화: 2, 토: 2, 금: 1, 수: 1 } };
  assert.equal(scoreMajor(row("A", "목", null), none, S).complement, 1);
});

test("동점이면 보완이 큰 학과 → 주오행이 일간과 잘 맞는 학과 순", () => {
  // 비겁(토 = 일간)과 식상(금)이 반씩인 두 학과: 원점수가 같다.
  const profile = { counts: { 목: 2, 화: 2, 토: 2, 금: 2, 수: 0 }, dayMaster: "토" as const, seed: "x" };
  const a = row("A", "토", "금");
  const b = row("B", "금", "토");
  const flat = { ...S, mainShare: 0.5, subShare: 0.5, fieldShare: 0 };
  assert.ok(close(scoreMajor(a, profile, flat).total, scoreMajor(b, profile, flat).total));
  // 보완이 같으니 주오행이 식상(금 1.0)인 B가 비겁(토 0.85)인 A보다 앞.
  assert.deepEqual(rankMajors([a, b], profile, flat).map((r) => r.major.id), ["B", "A"]);
});

test("TOP 3 화면 점수는 반올림 뒤에도 서로 다르다", () => {
  const profile = { counts: { 목: 2, 화: 2, 토: 2, 금: 1, 수: 1 }, dayMaster: "목" as const, seed: "x" };
  // 같은 오행 조합, 다른 분야 세 개: 원점수가 완전히 같다.
  const same = ["가", "나", "다"].map((f) => row(f, "화", "토", f));
  const top = pickTop(rankMajors(same, profile, S), 3);
  assert.equal(top.length, 3);
  assert.ok(top[0].display > top[1].display && top[1].display > top[2].display, top.map((t) => t.display).join(","));
});

test("화면 점수는 30~98점 안에서만 움직인다", () => {
  assert.equal(toDisplay(-1, S), S.displayMin);
  assert.equal(toDisplay(2, S), S.displayMax);
  assert.ok(toDisplay(S.totalFloor, S) === 30 && toDisplay(S.totalCeil, S) === 98);
});

const SAMPLES: Array<[string, BirthInput]> = [
  ["2005-03-15 08:30 양력", { birth: "2005.03.15", calendar: 0, leapMonth: false, time: "오전 8시 30분", unknownTime: false }],
  ["2004-11-02 23:10 양력", { birth: "2004.11.02", calendar: 0, leapMonth: false, time: "오후 11시 10분", unknownTime: false }],
  ["2006-07-21 시간모름", { birth: "2006.07.21", calendar: 0, leapMonth: false, time: "", unknownTime: true }],
  ["2003-01-09 14:00 음력", { birth: "2003.01.09", calendar: 1, leapMonth: false, time: "오후 2시 00분", unknownTime: false }],
  ["2005-09-30 05:45 양력", { birth: "2005.09.30", calendar: 0, leapMonth: false, time: "오전 5시 45분", unknownTime: false }],
];

test("샘플 5명: TOP 3 점수가 모두 다르고, 1위와 꼴찌가 20점 이상 차이 난다", () => {
  for (const [label, input] of SAMPLES) {
    const r = analyze(input, CONTENT);
    assert.ok(r.ok, label);
    const [a, b, c] = r.analysis.top.map((t) => t.display);
    assert.ok(a > b && b > c, `${label}: ${a}, ${b}, ${c}`);
    assert.deepEqual(analyze(input, CONTENT), r, `${label}: 같은 입력 = 같은 결과`);
  }
  for (const [label, input] of SAMPLES) {
    const r = analyze(input, CONTENT);
    assert.ok(r.ok);
    const counts = r.analysis.counts;
    const ranked = rankMajors(CONTENT.majors, { counts, dayMaster: r.analysis.saju.dayMaster.element, seed: "x" }, S, CONTENT.fields);
    const gap = ranked[0].display - ranked[ranked.length - 1].display;
    assert.ok(gap >= 20, `${label}: 1위-꼴찌 ${gap}점`);
  }
});

test("1990~2012년 생 전체: TOP 3 화면 점수가 겹치는 사람이 없다", () => {
  for (let y = 1990; y <= 2012; y++) {
    for (let m = 1; m <= 12; m++) {
      for (const time of ["", "오후 11시 40분"]) {
        const birth = `${y}.${String(m).padStart(2, "0")}.15`;
        const r = analyze({ birth, calendar: 0, leapMonth: false, time, unknownTime: time === "" }, CONTENT);
        assert.ok(r.ok, birth);
        const d = r.analysis.top.map((t) => t.display);
        assert.ok(d[0] > d[1] && d[1] > d[2], `${birth} ${time}: ${d}`);
      }
    }
  }
});

/** A ranked row with only what pickTop reads. */
const ranked = (id: string, 대계열: string, total: number) =>
  ({ major: { ...row(id, "화", null, id), 대계열 }, total, display: Math.round(total * 100) }) as unknown as MajorScore;
const ARTS_RULE = { artsMax: 2, artsSecondMargin: 0.01 };

test("예체능은 TOP 3에 최대 2개", () => {
  const list = [ranked("A1", "예체능계열", 0.9), ranked("A2", "예체능계열", 0.89), ranked("A3", "예체능계열", 0.88)];
  const top = pickTop(list, 3, ARTS_RULE);
  assert.deepEqual(top.map((t) => t.major.id), ["A1", "A2"]);
  const withRest = pickTop([...list, ranked("H1", "인문사회계열", 0.5)], 3, ARTS_RULE);
  assert.deepEqual(withRest.map((t) => t.major.id), ["A1", "A2", "H1"]);
});

test("2번째 예체능은 남은 비예체능보다 artsSecondMargin 이상 앞설 때만 들어간다", () => {
  const close2 = [ranked("A1", "예체능계열", 0.9), ranked("A2", "예체능계열", 0.805), ranked("H1", "인문사회계열", 0.8), ranked("H2", "인문사회계열", 0.7)];
  assert.deepEqual(pickTop(close2, 3, ARTS_RULE).map((t) => t.major.id), ["A1", "H1", "H2"]);
  const clear = [ranked("A1", "예체능계열", 0.9), ranked("A2", "예체능계열", 0.85), ranked("H1", "인문사회계열", 0.8), ranked("H2", "인문사회계열", 0.7)];
  assert.deepEqual(pickTop(clear, 3, ARTS_RULE).map((t) => t.major.id), ["A1", "A2", "H1"]);
});
