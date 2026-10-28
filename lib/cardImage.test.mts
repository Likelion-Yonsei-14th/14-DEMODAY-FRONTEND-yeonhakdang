/** `npm test` — which font slices a share card needs. */
import assert from "node:assert/strict";
import { test } from "node:test";

import { parseUnicodeRange } from "./cardImage.ts";

test("unicode-range: single code points, ranges and wildcards", () => {
  assert.deepEqual(parseUnicodeRange("U+0041"), [[0x41, 0x41]]);
  assert.deepEqual(parseUnicodeRange("U+AC00-D7A3, U+0020"), [[0xac00, 0xd7a3], [0x20, 0x20]]);
  assert.deepEqual(parseUnicodeRange("U+4??"), [[0x400, 0x4ff]]);
  assert.deepEqual(parseUnicodeRange("u+30-39"), [[0x30, 0x39]]);
});

test("unicode-range: junk parts are skipped, not guessed", () => {
  assert.deepEqual(parseUnicodeRange("bogus, U+0041"), [[0x41, 0x41]]);
  assert.deepEqual(parseUnicodeRange(""), []);
});
