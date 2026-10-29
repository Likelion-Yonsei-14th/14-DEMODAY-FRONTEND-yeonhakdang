/** `npm test` — 7-1 지원 대학 검색: the catalogue and how a query ranks it. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { UNIVERSITIES, searchUniversities } from "./universities.ts";

const names = (q: string, limit?: number) => searchUniversities(q, limit).map((u) => u.name);

test("catalogue: nationwide, one row per campus, no duplicates", () => {
  assert.ok(UNIVERSITIES.length >= 200, `${UNIVERSITIES.length}곳`);
  const keys = UNIVERSITIES.map((u) => `${u.name}|${u.campus}`);
  assert.equal(new Set(keys).size, keys.length);
  const regions = new Set(UNIVERSITIES.map((u) => u.campus.split(" ")[0]));
  for (const r of ["서울", "경기", "인천", "강원", "대전", "세종", "충남", "충북", "전북", "광주", "전남", "대구", "경북", "부산", "울산", "경남", "제주"]) {
    assert.ok(regions.has(r), r);
  }
});

test("'성균' is still the 7-1 frame: both 성균관 campuses, then 성결 on its shared 성", () => {
  const hits = searchUniversities("성균");
  assert.deepEqual(
    hits.map((u) => [u.name, u.match, u.rest]),
    [
      ["성균관대학교", "성균", "관대학교"],
      ["성균관대학교", "성균", "관대학교"],
      ["성결대학교", "성", "결대학교"],
    ],
  );
});

test("nicknames and the official 국립 names", () => {
  assert.deepEqual(names("연대", 2), ["연세대학교", "연세대학교"]);
  assert.equal(names("이화여대")[0], "이화여자대학교");
  assert.equal(names("카이스트")[0], "한국과학기술원");
  assert.equal(names("kaist")[0], "한국과학기술원");
  assert.equal(names("한예종")[0], "한국예술종합학교");
  assert.equal(names("국립부경")[0], "부경대학교");
  assert.equal(names("외대")[0], "한국외국어대학교");
});

test("a word inside the name is found and highlighted in place", () => {
  const [hit] = searchUniversities("외국어");
  assert.deepEqual([hit.before, hit.match, hit.rest], ["한국", "외국어", "대학교"]);
});

test("the name comes before the campus: '부산' lists 부산* schools, then schools in 부산", () => {
  const hits = searchUniversities("부산", 50);
  const firstByCampus = hits.findIndex((u) => !u.name.startsWith("부산"));
  assert.ok(firstByCampus > 0);
  assert.ok(hits.slice(0, firstByCampus).every((u) => u.name.startsWith("부산")));
  assert.ok(hits.some((u) => u.name === "동아대학교"));
});

test("spaces don't count, an empty query lists nothing, and limit holds", () => {
  assert.equal(names("서울 대")[0], "서울대학교");
  assert.deepEqual(searchUniversities("  "), []);
  assert.equal(searchUniversities("대", 5).length, 5);
});
