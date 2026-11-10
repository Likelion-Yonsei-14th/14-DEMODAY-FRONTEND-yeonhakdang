import assert from "node:assert/strict";
import { test } from "node:test";
import { savedFor, type SavedPaidResult } from "./purchaseSnapshot.ts";
const record = { orderId: "old-order", kind: "compat", version: 1, input: { name: "구매당시" }, result: { universities: [{ name: "구매당시대학", score: 85 }] } } as unknown as SavedPaidResult;
test("paid display resolves the saved report, independent of current analysis inputs", () => {
  const stored = savedFor({ compat: record }, { compat: "old-order" }, "compat");
  assert.equal(stored?.universities[0].name, "구매당시대학");
  assert.equal(stored?.universities[0].score, 85);
});
test("switching historical purchases never displays a different order's cached report", () => {
  assert.equal(savedFor({ compat: record }, { compat: "new-order" }, "compat"), null);
  assert.equal(savedFor({ compat: record }, { charm: "old-order" }, "charm"), null);
  assert.equal(savedFor(undefined, {}, "compat"), null);
});
