/** `npm test` — 유료 결과 엔진 (합격 궁합 · 귀인 · 부적). */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { calculateSaju } from "@fullstackfamily/manseryeok";

import { UNIVERSITIES } from "../universities.ts";
import { analyze, type Analysis } from "./analyze.ts";
import { personalOf } from "./personal.ts";
import { branchRelation, cheoneul, yearBranch, type Branch } from "./branches.ts";
import type { Content } from "./content.ts";
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
  sipsin: { aptitude: readJson("sipsin-aptitude.json"), majors: readJson("sipsin-majors.json") },
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
  const r = compatResult(me, ["건국대학교", "건국대학교", "강남대학교"], PAID);
  // 둘 다 1946 병술년 개교: 같은 간지라 같은 점수, 고른 순서 그대로.
  assert.deepEqual(r.universities.map((u) => u.name), ["건국대학교", "강남대학교"]);
  assert.equal(r.universities[0].score, r.universities[1].score);
});

test("합격 궁합: 학교 기운은 개교 연도 간지 전체 — 연세(을유)와 고려(을사)가 갈린다", () => {
  const yonsei = universityCompat(PEOPLE[0], "연세대학교", PAID);
  const korea = universityCompat(PEOPLE[0], "고려대학교", PAID);
  assert.equal(yonsei.ganzhi, "을유(乙酉)");
  assert.equal(korea.ganzhi, "을사(乙巳)");
  const differs = PEOPLE.some((me) => universityCompat(me, "연세대학교", PAID).score !== universityCompat(me, "고려대학교", PAID).score);
  assert.ok(differs, "같은 천간이어도 지지가 다르면 점수가 갈리는 사람이 있다");
});

test("합격 궁합: 일지와 육합인 학교가 충인 학교보다 지지 점수가 높고, 근거 다섯 줄이 붙는다", () => {
  const me = PEOPLE.find((p) => p.saju.pillars[2].branch.hangul === "자")!;
  assert.ok(me, "일지가 자인 사람이 있다");
  // 축년(1997 정축: 경운대) = 자축 육합, 오년(1918 무오: 중앙대) = 자오 충.
  const harmony = universityCompat(me, "경운대학교", PAID);
  const clash = universityCompat(me, "중앙대학교", PAID);
  assert.equal(harmony.branchRelation, "육합");
  assert.equal(clash.branchRelation, "충");
  assert.match(harmony.note, /육합/);
  assert.match(clash.note, /충/);
  assert.equal(harmony.reasons.length, 5);
  assert.match(harmony.reasons[4], new RegExp(`궁합 ${harmony.score}점`));
});

test("합격 궁합: 같은 대학 목록이어도 사람마다 순위가 다양하다", () => {
  const list = ["서울대학교", "연세대학교", "고려대학교", "성균관대학교", "한양대학교", "중앙대학교"];
  const rankings = new Set(PEOPLE.map((me) => compatResult(me, list, PAID).universities.map((u) => u.name).join(",")));
  assert.ok(rankings.size >= 10, `순위 종류 ${rankings.size}`);
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

test("천을귀인 표와 합·충", () => {
  assert.deepEqual(cheoneul("갑"), ["축", "미"]);
  assert.deepEqual(cheoneul("신"), ["인", "오"]);
  assert.deepEqual(cheoneul("계"), ["사", "묘"]);
  assert.equal(branchRelation("자", "축"), "육합");
  assert.equal(branchRelation("인", "해"), "육합");
  assert.equal(branchRelation("신", "진"), "삼합");
  assert.equal(branchRelation("자", "오"), "충");
  assert.equal(branchRelation("묘", "묘"), "같은 지지");
  assert.equal(branchRelation("자", "인"), "없음");
  assert.equal(yearBranch(2026), "오");
  assert.equal(yearBranch(1885), "유");
});

test("귀인: 천을귀인 지지, 관계별 프로필, 날짜 3개는 시간순·최고 하나·모두 귀인 지지의 날", () => {
  for (const me of PEOPLE) {
    const pair = cheoneul(me.saju.dayMaster.hangul);
    for (const relation of RELATIONS) {
      const r = benefactorResult(me, relation, PAID);
      assert.ok(pair.includes(r.branch) && pair.includes(r.other) && r.branch !== r.other);
      assert.equal(r.type, PAID.benefactor.profiles[r.branch]![relation].type);
      assert.equal(r.timeline.length, 3);
      assert.equal(r.timeline.filter((t) => t.peak).length, 1);
      const dates = r.timeline.map((t) => t.date);
      assert.equal(new Set(dates).size, 3);
      assert.deepEqual(dates, [...dates].sort());
      for (const date of dates) {
        const [y, m, d] = date.split(".").map(Number);
        const dayBranch = calculateSaju(y, m, d).dayPillar[1];
        assert.ok(pair.includes(dayBranch as never), `${date} ${dayBranch}`);
      }
      assert.ok(r.subtitle.includes(relation));
      assert.ok(r.caution.includes(relation));
    }
  }
});

test("귀인: 일지와 합이 되는 귀인이 대표, 주의할 사람은 일지와 충하는 띠", () => {
  // 갑 일간 → 축·미. 일지 자면 자축 육합이라 축(소)이 대표, 충은 오(말).
  const me = PEOPLE.find((p) => p.saju.dayMaster.hangul === "갑" && p.saju.pillars[2].branch.hangul === "자");
  if (me) {
    const r = benefactorResult(me, "선배", PAID);
    assert.equal(r.branch, "축");
    assert.match(r.caution, /말띠/);
  }
  for (const p of PEOPLE) {
    const r = benefactorResult(p, "동기", PAID);
    const mine = p.saju.pillars[2].branch.hangul as Branch;
    const harmonious = cheoneul(p.saju.dayMaster.hangul).filter((g) => ["육합", "삼합"].includes(branchRelation(g, mine)));
    if (harmonious.length) assert.equal(r.branch, harmonious[0]);
  }
});

test("귀인 프로필 표: 천을귀인이 될 수 있는 지지 10개 × 관계 4개", () => {
  const branches = [...new Set(["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"].flatMap((s) => cheoneul(s)))];
  assert.equal(branches.length, 10);
  for (const b of branches) for (const relation of RELATIONS) assert.ok(PAID.benefactor.profiles[b]?.[relation], `${b} ${relation}`);
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

test("합격 궁합 근거: 보완 줄은 채워 주는 기운과 이미 많은 기운을 함께 말한다", () => {
  for (const me of PEOPLE.slice(0, 30)) {
    const line = universityCompat(me, "연세대학교", PAID).reasons[3];
    assert.match(line, /^보완 25%: .+ → \d+점$/);
    assert.ok(!line.includes(": ,") && !line.includes(",  →"));
  }
});

/* ── 대운 · 발음오행을 더했을 때 ── */

const withPersonal = (birth: string, gender: 0 | 1, name: string) => {
  const me = person(birth);
  const p = personalOf(me, { birth, calendar: 0, leapMonth: false, time: "", unknownTime: true }, gender, name);
  assert.ok(p);
  return { me, p };
};

test("대운 · 이름을 넘겨도 점수 · 부적 기운 · 귀인은 그대로, 문장만 더해진다", () => {
  for (const birth of ["2008.03.15", "2007.08.07", "2009.11.30"]) {
    const { me, p } = withPersonal(birth, 0, "김연학");
    const unis = ["서울대학교", "연세대학교", "고려대학교"].filter((u) => u in PAID.founded);
    const before = compatResult(me, unis, PAID);
    const after = compatResult(me, unis, PAID, p);
    assert.equal(before.daewoon, undefined);
    assert.match(after.daewoon!, /2027학년도 입시\(만 \d+세\)/);
    assert.deepEqual({ ...after, daewoon: undefined }, { ...before, daewoon: undefined });

    const b0 = benefactorResult(me, "선배", PAID);
    const b1 = benefactorResult(me, "선배", PAID, p);
    assert.equal(b1.branch, b0.branch);
    assert.ok(b1.description.startsWith(b0.description));
    assert.match(b1.description, /대학 시절\(만 19~24세\)/);

    const c0 = charmResult(me, 0, PAID);
    const c1 = charmResult(me, 0, PAID, p);
    assert.equal(c1.element, c0.element);
    assert.deepEqual(c1.art, c0.art);
    assert.equal(c1.tags.length, c0.tags.length + 1);
    assert.match(c1.description, /이름/);
  }
});

test("부적: 이름에 없는 약한 오행이면 '이름에도 없는', 있으면 '이름에 담긴'", () => {
  const { me, p } = withPersonal("2008.03.15", 0, "김연학"); // 화 0개 → 가장 약함, 이름 목·토·토
  assert.equal(me.weakest, "화");
  assert.match(charmResult(me, 0, PAID, p).description, /이름에도 화\(火\) 기운이 없어/);
  const { p: q } = withPersonal("2008.03.15", 0, "나도");
  assert.match(charmResult(me, 0, PAID, q).description, /이름에 담긴 화\(火\)/);
  assert.equal(personalOf(me, { birth: "2008.03.15", calendar: 0, leapMonth: false, time: "", unknownTime: true }, 0, "  ")!.name, null);
});
