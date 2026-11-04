/** `npm test` — 발음오행: 초성 → 오행, 복성, 한글 아닌 글자, 상생 흐름. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { initialOf, nameElement, nameFlowLine, nameSupportLine } from "./nameElement.ts";

test("쌍자음은 기본 자음으로: ㄲ→ㄱ ㄸ→ㄷ ㅃ→ㅂ ㅆ→ㅅ ㅉ→ㅈ", () => {
  assert.deepEqual(["꿈", "또", "빵", "쌀", "짱"].map(initialOf), ["ㄱ", "ㄷ", "ㅂ", "ㅅ", "ㅈ"]);
  const n = nameElement("김또빵", "목")!;
  assert.deepEqual(n.chars.map((c) => c.element), ["목", "화", "수"]);
  assert.deepEqual(nameElement("꽃", "목")!.chars[0].element, nameElement("곳", "목")!.chars[0].element);
});

test("현대 성명학: ㄱㅋ 목 · ㄴㄷㄹㅌ 화 · ㅇㅎ 토 · ㅅㅈㅊ 금 · ㅁㅂㅍ 수", () => {
  const n = nameElement("가나다라마바사아자차카타파하", "목")!;
  assert.deepEqual(
    n.chars.map((c) => c.element).join(""),
    "목화화화수수금토금금목화수토",
  );
});

test("해례본 기준으로 바꾸면 ㅇㅎ 수 · ㅁㅂㅍ 토", () => {
  const n = nameElement("이하민", "목", "haerye")!;
  assert.deepEqual(n.chars.map((c) => c.element), ["수", "수", "토"]);
  const m = nameElement("이하민", "목")!;
  assert.deepEqual(m.chars.map((c) => c.element), ["토", "토", "수"]);
});

test("외자 이름: 김윤 — 두 글자, 성 1글자, 흐름 한 칸", () => {
  const n = nameElement("김윤", "토")!;
  assert.equal(n.chars.length, 2);
  assert.equal(n.surnameLength, 1);
  assert.deepEqual(n.flow.map((l) => l.kind), ["상극"]); // 목 → 토
  assert.equal(n.support, "fills");
});

test("복성: 남궁민수 · 선우진은 두 글자 성, 두 글자 '선우'는 외자 성", () => {
  assert.equal(nameElement("남궁민수", "목")!.surnameLength, 2);
  assert.equal(nameElement("선우진", "목")!.surnameLength, 2);
  assert.equal(nameElement("황보", "목")!.surnameLength, 1);
  assert.equal(nameElement("김연학", "목")!.surnameLength, 1);
});

test("영문 · 숫자 · 공백은 건너뛰고, 한글이 없으면 null (카드 숨김)", () => {
  const n = nameElement(" Kim 연 학2 ", "목")!;
  assert.deepEqual(n.chars.map((c) => c.char), ["연", "학"]);
  assert.equal(nameElement("John Kim", "목"), null);
  assert.equal(nameElement("", "목"), null);
  assert.equal(nameElement("ㄱㄴ", "목"), null); // 자모만은 음절이 아니다
});

test("오행 개수 · 없는 오행 · 보완 · 흐름", () => {
  const n = nameElement("김연학", "금")!; // 목 토 토
  assert.deepEqual(n.counts, { 목: 1, 화: 0, 토: 2, 금: 0, 수: 0 });
  assert.deepEqual(n.missing, ["화", "금", "수"]);
  assert.equal(n.support, "helps"); // 토가 금을 생
  assert.deepEqual(n.flow.map((l) => l.kind), ["상극", "같음"]);
  assert.match(nameSupportLine(n), /생\(生\)하는/);
  assert.match(nameFlowLine(n), /상생과 상극이 섞여/);

  const flowing = nameElement("고나이", "목")!; // 목 화 토
  assert.deepEqual(flowing.flow.map((l) => l.kind), ["상생", "상생"]);
  assert.match(nameFlowLine(flowing), /상생으로 막힘없이/);
  assert.equal(nameElement("나도", "수")!.support, "none");
});

test("같은 입력 = 같은 결과", () => {
  assert.deepEqual(nameElement("남궁민수", "화"), nameElement("남궁민수", "화"));
});
