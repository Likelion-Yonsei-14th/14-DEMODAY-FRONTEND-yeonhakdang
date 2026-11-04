/** `npm test` — 십신: 10가지 관계, 지지 음양, 그룹 세기, 학과 근거 문장. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { analyze } from "./analyze.ts";
import type { BirthInput } from "./birth.ts";
import type { Content, MajorRow } from "./content.ts";
import { stemElement, stemIsYang } from "./ganzhi.ts";
import { computeSaju } from "./pillars.ts";
import type { MajorScore } from "./score.ts";
import { branchIsYang, groupsForMajor, majorAptitude, sipsinOf, sipsinProfile, type SipsinContent } from "./sipsin.ts";

const readJson = (name: string) =>
  JSON.parse(readFileSync(new URL(`../../data/${name}`, import.meta.url), "utf8"));
const SIPSIN: SipsinContent = { aptitude: readJson("sipsin-aptitude.json"), majors: readJson("sipsin-majors.json") };
const CONTENT: Content = {
  majors: readJson("majors.json"),
  dayMasters: readJson("day-masters.json"),
  insights: readJson("insights.json"),
  scoring: readJson("scoring.json"),
  sipsin: SIPSIN,
};

const stem = (s: string) => ({ element: stemElement(s), yang: stemIsYang(s) });

test("갑목 일간 기준 천간 10가지 십신", () => {
  const dm = stem("갑");
  const got = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"].map((s) => sipsinOf(dm, stem(s)));
  assert.deepEqual(got, ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"]);
});

test("음간(정화) 일간도 같은 규칙: 같은 음양이면 편 · 다르면 정", () => {
  const dm = stem("정");
  const got = ["정", "병", "기", "무", "신", "경", "계", "임", "을", "갑"].map((s) => sipsinOf(dm, stem(s)));
  assert.deepEqual(got, ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"]);
});

test("지지 음양: 용(정기) 기준은 子·午 음, 巳·亥 양 — 체 기준과 반대", () => {
  assert.equal(branchIsYang("자"), false);
  assert.equal(branchIsYang("오"), false);
  assert.equal(branchIsYang("사"), true);
  assert.equal(branchIsYang("해"), true);
  assert.equal(branchIsYang("자", "che"), true);
  assert.equal(branchIsYang("사", "che"), false);
  // 갑목에게 子(수): 용 기준 음 → 정인, 체 기준 양 → 편인
  assert.equal(sipsinOf(stem("갑"), { element: "수", yang: branchIsYang("자") }), "정인");
  assert.equal(sipsinOf(stem("갑"), { element: "수", yang: branchIsYang("자", "che") }), "편인");
});

test("6글자 사주(시주 없음): 일간 빼고 5글자", () => {
  const saju = computeSaju({ year: 2008, month: 3, day: 15, hour: null, minute: 0 }); // 무자 을묘 갑인
  const p = sipsinProfile(saju);
  assert.deepEqual(
    p.chars.map((c) => `${c.hangul}${c.sipsin}`),
    ["무편재", "자정인", "을겁재", "묘겁재", "인비견"],
  );
  assert.deepEqual(p.groups, { 비겁: 3, 식상: 0, 재성: 1, 관성: 0, 인성: 1 });
  assert.equal(p.order[0], "비겁");
});

test("8글자 사주: 시주까지 7글자", () => {
  const saju = computeSaju({ year: 2008, month: 3, day: 15, hour: 14, minute: 30 }); // + 신미
  const p = sipsinProfile(saju);
  assert.equal(p.chars.length, 7);
  assert.deepEqual(p.chars.slice(-2).map((c) => c.sipsin), ["정관", "정재"]);
});

test("학과마다 계열 → 십신 그룹이 정해져 있다", () => {
  for (const m of CONTENT.majors) {
    const pick = { major: m } as MajorScore;
    assert.ok(groupsForMajor(pick, SIPSIN.majors).length > 0, `${m.대계열}/${m.중계열}`);
  }
});

const pickOf = (patch: Partial<MajorRow>) =>
  ({ major: { ...CONTENT.majors[0], ...patch, 대표학과: ["광고홍보학과"] } }) as MajorScore;

test("근거 문장: 계열 그룹이 강하면 '강해 … 잘 맞아요', 없으면 내 가장 강한 그룹으로", () => {
  const profile = {
    chars: [],
    groups: { 비겁: 3, 식상: 2, 재성: 0, 관성: 0, 인성: 1 },
    order: ["비겁", "식상", "인성", "재성", "관성"] as const,
  } as unknown as ReturnType<typeof sipsinProfile>;

  const art = majorAptitude(pickOf({ 대계열: "예체능계열", 중계열: "응용예술" }), profile, SIPSIN);
  assert.equal(art.group, "식상");
  assert.equal(art.matched, true);
  assert.equal(art.sentence, "식상이 강해 표현력이 돋보여서 광고홍보학과와 잘 맞아요");

  const law = majorAptitude(pickOf({ 대계열: "인문사회계열", 중계열: "법학" }), profile, SIPSIN);
  assert.equal(law.group, "인성"); // 관성 0, 인성 1
  assert.match(law.sentence, /^인성이 있어/);

  const biz = majorAptitude(pickOf({ 대계열: "인문사회계열", 중계열: "경영·경제" }), profile, SIPSIN);
  assert.equal(biz.matched, false); // 재성 · 관성 모두 0
  assert.equal(biz.group, "비겁");
  assert.match(biz.sentence, /에서도 그 힘을 살릴 수 있어요$/);
});

const input = (patch: Partial<BirthInput> = {}): BirthInput => ({
  birth: "2008.03.15",
  calendar: 0,
  leapMonth: false,
  time: "",
  unknownTime: true,
  ...patch,
});

test("analyze: TOP 3마다 근거 한 줄, '왜 이 학과일까?' 5단계", () => {
  const r = analyze(input(), CONTENT);
  assert.ok(r.ok);
  assert.equal(r.analysis.aptitudes.length, r.analysis.top.length);
  r.analysis.aptitudes.forEach((a, i) => assert.ok(a.sentence.includes(r.analysis.top[i].major.대표학과[0])));
  const step5 = r.analysis.reasons[4];
  assert.equal(step5.title, "5. 십신으로 본 적성");
  assert.ok(step5.lines.includes(r.analysis.aptitudes[0].sentence));
  assert.ok(step5.lines.some((l) => l.includes("지장간 가중치 없음")));
});

test("같은 입력 = 같은 십신", () => {
  const saju = computeSaju({ year: 1999, month: 12, day: 31, hour: 23, minute: 50 });
  assert.deepEqual(sipsinProfile(saju), sipsinProfile(saju));
});
