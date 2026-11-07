import assert from "node:assert/strict";
import { test } from "node:test";
import { requiresMember, visibleScreen } from "./memberAccess.ts";

test("guest access to every roster or sharing screen renders login instead of the feature", () => {
  for (const screen of ["4-1", "4-2", "4-3", "5-1", "5-2", "5-3", "5-4"]) {
    assert.equal(requiresMember(screen), true);
    assert.equal(visibleScreen(screen, false), "2-4");
  }
});

test("a logged-in member can resume the exact roster or share destination", () => {
  for (const screen of ["4-1", "4-2", "4-3", "5-1", "5-2", "5-3", "5-4"]) {
    assert.equal(visibleScreen(screen, true), screen);
  }
});

test("landing, personal input and free analysis remain available to guests", () => {
  for (const screen of ["1-1", "1-2", "2-1", "2-4", "2-5", "3-1", "3-2", "3-3", "3-4", "10-1"]) {
    assert.equal(requiresMember(screen), false);
    assert.equal(visibleScreen(screen, false), screen);
  }
});
