/**
 * `npm test` — runs on Node's own test runner (no extra packages).
 * Known answers pin the 만세력 results; the rest checks the rules behave.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { analyze } from "./analyze.ts";
import { birthError, parseTimeLabel, resolveBirth, type BirthInput } from "./birth.ts";
import type { Content, MajorRow } from "./content.ts";
import { computeSaju, countElements } from "./pillars.ts";
import { pickTop, rankMajors, scoreMajor } from "./score.ts";

const readJson = (name: string) =>
  JSON.parse(readFileSync(new URL(`../../data/${name}`, import.meta.url), "utf8"));

const CONTENT: Content = {
  majors: readJson("majors.json"),
  dayMasters: readJson("day-masters.json"),
  insights: readJson("insights.json"),
  scoring: readJson("scoring.json"),
};

const input = (patch: Partial<BirthInput> = {}): BirthInput => ({
  birth: "2008.03.15",
  calendar: 0,
  leapMonth: false,
  time: "오후 2시 30분",
  unknownTime: false,
  ...patch,
});

test("시간 라벨을 24시간제로 읽는다", () => {
  assert.deepEqual(parseTimeLabel("오후 2시 30분"), { hour: 14, minute: 30 });
  assert.deepEqual(parseTimeLabel("오전 12시 00분"), { hour: 0, minute: 0 });
  assert.deepEqual(parseTimeLabel("오후 12시 30분"), { hour: 12, minute: 30 });
  assert.equal(parseTimeLabel("2시"), undefined);
});

test("2008.03.15 14:30 → 무자 · 을묘 · 갑인 · 신미 (서울 보정 13:58)", () => {
  const r = resolveBirth(input());
  assert.ok(r.ok);
  const saju = computeSaju(r.solar);
  assert.deepEqual(saju.pillars.map((p) => p.hangul), ["무자", "을묘", "갑인", "신미"]);
  assert.equal(saju.dayMaster.hangul, "갑");
  assert.equal(saju.dayMaster.element, "목");
  assert.deepEqual(saju.correctedTime, { hour: 13, minute: 58 });
  // 무(토) 자(수) 을(목) 묘(목) 갑(목) 인(목) 신(금) 미(토)
  assert.deepEqual(countElements(saju), { 목: 4, 화: 0, 토: 2, 금: 1, 수: 1 });
});

test("시간을 모르면 여섯 글자", () => {
  const r = resolveBirth(input({ unknownTime: true }));
  assert.ok(r.ok);
  const saju = computeSaju(r.solar);
  assert.equal(saju.pillars.length, 3);
  assert.equal(Object.values(countElements(saju)).reduce((a, b) => a + b, 0), 6);
});

test("음력은 양력으로 바꿔 계산한다 (음력 2008.02.08 = 양력 2008.03.15)", () => {
  const r = resolveBirth(input({ birth: "2008.02.08", calendar: 1 }));
  assert.ok(r.ok);
  assert.deepEqual([r.solar.year, r.solar.month, r.solar.day], [2008, 3, 15]);
});

test("입력 오류 문구", () => {
  assert.equal(birthError(input({ birth: "2008.02.30" })), "존재하지 않는 날짜예요. 다시 확인해 주세요");
  assert.equal(birthError(input({ birth: "2008.02.30", calendar: 1 })), "존재하지 않는 음력 날짜예요. 다시 확인해 주세요");
  assert.equal(birthError(input({ birth: "2008.04.10", calendar: 1, leapMonth: true })), "2008년 음력 4월에는 윤달이 없어요");
  assert.equal(birthError(input({ birth: "1899.01.01" })), "1900~2020년 사이의 날짜로 입력해 주세요");
  assert.equal(birthError(input({ birth: "2020.04.10", calendar: 1, leapMonth: true })), undefined);
  assert.equal(birthError(input({ birth: "2008.03" })), undefined);
});

test("같은 입력이면 항상 같은 결과", () => {
  const a = analyze(input(), CONTENT);
  const b = analyze(input(), CONTENT);
  assert.deepEqual(a, b);
});

test("TOP 3는 서로 다른 중계열, 점수는 60~99", () => {
  const r = analyze(input(), CONTENT);
  assert.ok(r.ok);
  const { top } = r.analysis;
  assert.equal(top.length, 3);
  assert.equal(new Set(top.map((t) => t.major.중계열)).size, 3);
  for (const t of top) assert.ok(t.display >= 60 && t.display <= 99, `${t.display}`);
  assert.ok(top[0].total >= top[1].total && top[1].total >= top[2].total);
  assert.equal(r.analysis.reasons.length, 4);
});

test("점수 규칙: 일간과 같은 오행, 가장 약한 오행을 채우면 가산", () => {
  const s = CONTENT.scoring;
  const profile = { counts: { 목: 4, 화: 0, 토: 2, 금: 1, 수: 1 }, dayMaster: "목" as const, seed: "무자을묘갑인신미" };
  const row = (주오행: MajorRow["주오행"], 보조오행: MajorRow["보조오행"] = null): MajorRow => ({
    id: "T", 대계열: "", 중계열: "", 학과군: "", 대표학과: ["테스트학과"], 주오행, 보조오행, 근거: "",
  });
  // 목: 4/4 present + same as 일간 → tendency 1, no complement → 0.7
  assert.equal(scoreMajor(row("목"), profile, s).total, 0.7);
  // 화: absent but fed by 갑목 (0.5 × 0.5) and fills the weakest → 0.7×0.25 + 0.3×1
  assert.equal(scoreMajor(row("화"), profile, s).total, 0.7 * 0.25 + 0.3);
  // Ties: a fixed order per 사주 — the same 사주 always gives the same order…
  const tied = ["A", "B", "C", "D", "E", "F"].map((id) => ({ ...row("금"), id }));
  const order = (seed: string) => rankMajors(tied, { ...profile, seed }, s).map((r) => r.major.id).join("");
  assert.equal(order("무자을묘갑인신미"), order("무자을묘갑인신미"));
  // …while different 사주 put different rows first.
  const firsts = new Set(["갑자", "을축", "병인", "정묘", "무진", "기사", "경오", "신미"].map((seed) => order(seed)[0]));
  assert.ok(firsts.size > 1, `tie order should vary by 사주, got ${[...firsts]}`);
  assert.equal(pickTop(rankMajors(tied, profile, s), 3).length, 1, "same 중계열 picked once");
});

test("학과 표를 바꾸면 결과가 바뀐다", () => {
  const onlyMusic: Content = {
    ...CONTENT,
    majors: CONTENT.majors.filter((m) => m.중계열 === "음악"),
  };
  const r = analyze(input(), onlyMusic);
  assert.ok(r.ok);
  assert.equal(r.analysis.top[0].major.중계열, "음악");
});
