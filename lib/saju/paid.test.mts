/** `npm test` — 유료 결과 엔진 (합격 궁합 · 귀인 · 부적). */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { UNIVERSITIES } from "../universities.ts";
import { analyze, type Analysis } from "./analyze.ts";
import type { Content } from "./content.ts";
import { ELEMENTS } from "./elements.ts";
import {
  benefactorResult,
  charmResult,
  compatResult,
  universityCompat,
  yearElement,
  yearStem,
  type BenefactorRelation,
  type PaidContent,
} from "./paid.ts";

const readJson = (name: string) =>
  JSON.parse(readFileSync(new URL(`../../data/${name}`, import.meta.url), "utf8"));

const CONTENT: Content = {
  majors: readJson("majors.json"),
  dayMasters: readJson("day-masters.json"),
  insights: readJson("insights.json"),
  scoring: readJson("scoring.json"),
};

const PAID: PaidContent = { ...readJson("paid.json"), founded: readJson("universities-founded.json").years };

function person(birth: string): Analysis {
  const r = analyze({ birth, calendar: 0, leapMonth: false, time: "", unknownTime: true }, CONTENT);
  assert.ok(r.ok);
  return r.analysis;
}

/** One birth every 3 days through 2008: every 일간 and every 약한 오행 shows up. */
const PEOPLE = Array.from({ length: 120 }, (_, i) => {
  const d = new Date(Date.UTC(2008, 0, 1 + i * 3));
  return person(
    `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`,
  );
});

const RELATIONS: BenefactorRelation[] = ["선배", "동기", "교수님", "연인"];

test("개교 연도의 천간 오행: 1885 을유 → 목, 1905 을사 → 목, 1946 병술 → 화", () => {
  assert.equal(yearStem(1885), "을");
  assert.equal(yearElement(1885), "목");
  assert.equal(yearElement(1905), "목");
  assert.equal(yearElement(1946), "화");
  assert.equal(yearElement(1398), "토"); // 무인
  assert.equal(yearElement(1960), "금"); // 경자
  assert.equal(yearElement(1972), "수"); // 임자
});

test("7-1 목록의 모든 대학에 개교 연도가 있다", () => {
  const missing = [...new Set(UNIVERSITIES.map((u) => u.name))].filter((name) => PAID.founded[name] === undefined);
  assert.deepEqual(missing, []);
});

test("합격 궁합: 점수는 60~98, 내림차순, 같은 입력이면 같은 결과", () => {
  for (const me of PEOPLE) {
    const r = compatResult(me, ["연세대학교", "고려대학교", "한양대학교", "서울대학교"], PAID);
    assert.equal(r.universities.length, 4);
    for (const u of r.universities) {
      assert.ok(u.score >= PAID.university.min && u.score <= PAID.university.max, `${u.name} ${u.score}`);
      assert.ok(u.note.length > 0);
    }
    const scores = r.universities.map((u) => u.score);
    assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
    assert.deepEqual(r, compatResult(me, ["연세대학교", "고려대학교", "한양대학교", "서울대학교"], PAID));
  }
});

test("합격 궁합: 같은 대학 두 캠퍼스는 한 번만, 동점이면 고른 순서", () => {
  const me = PEOPLE[0];
  const r = compatResult(me, ["연세대학교", "연세대학교", "고려대학교"], PAID);
  assert.deepEqual(r.universities.map((u) => u.name).sort(), ["고려대학교", "연세대학교"]);
  // 연세대·고려대는 둘 다 을년(목) 개교: 같은 점수, 고른 순서 그대로.
  assert.equal(r.universities[0].score, r.universities[1].score);
  assert.deepEqual(r.universities.map((u) => u.name), ["연세대학교", "고려대학교"]);
});

test("합격 궁합: 학교가 내 일간을 생해 주면 극하는 학교보다 점수가 높다", () => {
  // 보완 점수가 끼지 않도록 목·수가 가장 약한 기운도, 두 번째로 약한 기운도 아닌 화 일간.
  const me = PEOPLE.find((p) => {
    const [w1, w2] = [p.weakest, ELEMENTS.filter((e) => e !== p.weakest).sort((a, b) => p.counts[a] - p.counts[b])[0]];
    return p.saju.dayMaster.element === "화" && ![w1, w2].includes("목") && ![w1, w2].includes("수");
  });
  assert.ok(me, "조건에 맞는 화 일간이 있다");
  const fed = universityCompat(me, "연세대학교", PAID); // 1885 을유: 목이 화를 생
  const controlled = universityCompat(me, "한국방송통신대학교", PAID); // 1972 임자: 수가 화를 극
  assert.equal(fed.relation, "fed");
  assert.equal(controlled.relation, "controlled");
  assert.ok(fed.score > controlled.score);
});

test("합격 궁합: 월별 막대(표의 달 수) 중 최고가 하나, 주간 기운에 최고·주의가 하나씩", () => {
  for (const me of PEOPLE) {
    const r = compatResult(me, ["연세대학교"], PAID);
    assert.equal(r.months.length, PAID.season.months.length);
    assert.equal(r.months.filter((m) => m.peak).length, 1);
    for (const m of r.months) assert.ok(m.value >= 50 && m.value <= 98);
    assert.equal(r.weeks.length, 4);
    assert.equal(r.weeks.filter((w) => w.level === "최고").length, 1);
    assert.ok(r.weeks.filter((w) => w.level === "주의").length <= 1);
    assert.equal(r.chips.length, 3);
    assert.match(r.chips[0].label, /^\d+\/\d+ 면접 길일$/);
    assert.match(r.tip, /^\d+월 (첫째|둘째|셋째|넷째) 주가 제일 좋아!\n/);
  }
});

test("귀인: 내 일간을 생해 주는 오행, 관계별 프로필, 시기 3개는 시간순·최고 하나", () => {
  for (const me of PEOPLE) {
    for (const relation of RELATIONS) {
      const r = benefactorResult(me, relation, PAID);
      const dm = me.saju.dayMaster.element;
      assert.equal(ELEMENTS[(ELEMENTS.indexOf(r.element) + 1) % 5], dm);
      assert.equal(r.type, PAID.benefactor.profiles[r.element][relation].type);
      assert.equal(r.timeline.length, 3);
      assert.equal(r.timeline.filter((t) => t.peak).length, 1);
      const dates = r.timeline.map((t) => t.date);
      assert.deepEqual(dates, [...dates].sort());
      assert.ok(r.subtitle.includes(relation));
      assert.ok(r.caution.includes(relation));
    }
  }
});

test("귀인: 관계 조사 — 선배가 · 교수님이 · 선배와는 · 교수님과는", () => {
  const me = PEOPLE[0];
  assert.match(benefactorResult(me, "선배", PAID).subtitle, /선배가 /);
  assert.match(benefactorResult(me, "교수님", PAID).subtitle, /교수님이 /);
  assert.match(benefactorResult(me, "선배", PAID).caution, /선배와는/);
  assert.match(benefactorResult(me, "교수님", PAID).caution, /교수님과는/);
});

test("부적: 가장 약한 오행을 채우고, 다시 뽑기마다 글자가 바뀌며 네 번째 뒤엔 처음으로", () => {
  for (const me of PEOPLE) {
    const draws = [0, 1, 2, 3].map((v) => charmResult(me, v, PAID));
    for (const d of draws) assert.equal(d.element, me.weakest);
    assert.equal(new Set(draws.map((d) => d.art.word)).size, 4);
    assert.deepEqual(charmResult(me, 4, PAID), draws[0]);
    assert.equal(draws[0].art.formula.length, 3);
    assert.equal(draws[0].art.pillar, me.saju.pillars[2].hanja);
  }
});
