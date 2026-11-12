import assert from "node:assert/strict";
import { test } from "node:test";
import { commitAnalysisInput } from "./analysisInput.ts";
import type { ProtoState } from "./proto.tsx";
const input = { name: " 새이름 ", birth: "2005.04.10", gender: 1 as const, calendar: 0 as const, leapMonth: false, time: "", unknownTime: true };
const state = { ...input, name: "기존이름", analyzed: true, friends: [], rosterSeenAt: 0, purchased: { compat: true }, orders: { compat: "paid-order" }, paidResults: { compat: { orderId: "paid-order" } } } as unknown as ProtoState;
test("edit completion waits for durable save before returning the UI update", async () => {
  let release!: () => void;
  const waiting = new Promise<void>((r) => { release = r; });
  let completed = false;
  const saving = commitAnalysisInput(state, input, async (profile) => {
    assert.equal(profile.name, "새이름");assert.equal(profile.birth, "2005.04.10");
    assert.equal("purchased" in profile, false);await waiting;
  }).then((patch) => { completed = true;return patch; });
  await Promise.resolve();assert.equal(completed, false);assert.equal(state.name, "기존이름");
  release();const patch = await saving;
  assert.equal(patch.name, "새이름");assert.equal(patch.savedResult, null);
  assert.equal("friends" in patch, false);assert.equal("purchased" in patch, false);assert.equal("orders" in patch, false);
});
test("failed saves leave the prior account profile and purchased results unchanged", async () => {
  await assert.rejects(commitAnalysisInput(state, input, async () => { throw new Error("PROFILE_CONFLICT"); }), /PROFILE_CONFLICT/);
  assert.equal(state.name, "기존이름");assert.equal(state.orders.compat, "paid-order");
});
test("guests can complete input locally without an account writer", async () => {
  assert.equal((await commitAnalysisInput(state, input)).name, "새이름");
});

test("a form initialized from full account state never writes cached privileges back", async () => {
  const patch = await commitAnalysisInput(state, { ...state, name: "수정이름" });
  assert.equal("purchased" in patch, false);assert.equal("paidResults" in patch, false);
  assert.equal("friends" in patch, false);assert.equal("account" in patch, false);
});
