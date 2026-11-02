/** `npm test` — 이용권 code matching. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { MAX_CODE_LENGTH, matchesCode, normalizeCode, parseCodes } from "./unlock.ts";

test("UNLOCK_CODES: comma-separated, blanks dropped, normalised", () => {
  assert.deepEqual(parseCodes(" team-2026 , judge 7Q,,"), ["TEAM2026", "JUDGE7Q"]);
  assert.deepEqual(parseCodes(undefined), []);
  assert.deepEqual(parseCodes(""), []);
});

test("spaces, dashes and case don't count", () => {
  assert.equal(normalizeCode(" ab-cd 12 "), "ABCD12");
  const codes = parseCodes("YHD-OPEN-2026");
  assert.ok(matchesCode("yhd open 2026", codes));
  assert.ok(matchesCode("YHDOPEN2026", codes));
});

test("wrong, empty, prefix and overlong codes never match", () => {
  const codes = parseCodes("YHDOPEN2026,SECOND");
  assert.ok(!matchesCode("YHDOPEN", codes));
  assert.ok(!matchesCode("YHDOPEN20266", codes));
  assert.ok(!matchesCode("", codes));
  assert.ok(!matchesCode("   ", codes));
  assert.ok(!matchesCode("A".repeat(MAX_CODE_LENGTH + 1), parseCodes("A".repeat(MAX_CODE_LENGTH + 1))));
  assert.ok(matchesCode("second", codes));
});

test("no codes configured: nothing opens", () => {
  assert.ok(!matchesCode("ANYTHING", []));
});
