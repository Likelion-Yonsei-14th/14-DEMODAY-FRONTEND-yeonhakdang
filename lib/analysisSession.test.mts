import assert from "node:assert/strict";
import { test } from "node:test";
import { freshAnalysis } from "./analysisSession.ts";
import type { ProtoState } from "./proto";

function fixture(): ProtoState {
  return {
    name: "김연학", birth: "2008.03.15", gender: 1, calendar: 1,
    leapMonth: true, time: "오후 2시 30분", unknownTime: true, analyzed: true,
    loggedIn: true, agreedTerms: true, paidResults: {}, account: "member-1", analysisOwner: "member-1", afterLogin: "3-4", afterInput: "7-3",
    inviter: null, pendingInviteId: null, friends: [], rosterSeenAt: 17, friend: "previous-friend",
    product: "compat", plan: "single", universities: ["연세대학교"], relation: "선배", payMethod: "card",
    purchased: { compat: true, benefactor: false, charm: false }, charmRerolls: 2,
    loginPending: true, savedResult: { id: "result-1", summary: "old-summary", account: "member-1" },
    checkout: { request: "payment-request", key: "payment-key", orderId: "order-1" },
    pendingOrder: { id: "order-1", message: null }, orders: { compat: "order-1" }, unlockCode: "code-1",
  };
}

test("a new analysis clears personal input and derived summary but preserves account and purchases", () => {
  const original = fixture();
  const fresh = freshAnalysis(original);
  assert.equal(fresh.name, ""); assert.equal(fresh.birth, ""); assert.equal(fresh.time, "");
  assert.equal(fresh.analysisOwner, "member-1"); assert.equal(fresh.analyzed, false); assert.equal(fresh.savedResult, null);
  assert.equal(fresh.calendar, 0); assert.equal(fresh.leapMonth, false); assert.equal(fresh.unknownTime, false);
  assert.equal(fresh.loggedIn, true); assert.equal(fresh.account, "member-1"); assert.equal(fresh.agreedTerms, true);
  assert.deepEqual(fresh.purchased, original.purchased); assert.deepEqual(fresh.orders, original.orders);
  assert.deepEqual(fresh.checkout, original.checkout); assert.deepEqual(fresh.pendingOrder, original.pendingOrder);
  assert.equal(fresh.charmRerolls, 2); assert.equal(fresh.unlockCode, "code-1");
  assert.equal(original.name, "김연학"); assert.equal(original.analyzed, true);
});

test("starting again as a guest never creates a logged-in identity", () => {
  const fresh = freshAnalysis({ ...fixture(), loggedIn: false, agreedTerms: false, account: null });
  assert.equal(fresh.loggedIn, false); assert.equal(fresh.agreedTerms, false); assert.equal(fresh.account, null);
  assert.equal(fresh.analysisOwner, null); assert.equal(fresh.afterLogin, "2-1"); assert.equal(fresh.afterInput, null); assert.equal(fresh.loginPending, false);
});

test("a different person's analysis does not inherit the previous person's invitation or friends", () => {
  const person = { name: "친구", birth: "2007.04.12", calendar: 0 as const, leapMonth: false, time: "", unknownTime: true };
  const fresh = freshAnalysis({ ...fixture(), account: null, inviter: person, friends: [{ ...person, addedAt: 1 }] });
  assert.equal(fresh.inviter, null); assert.deepEqual(fresh.friends, []);
  assert.equal(fresh.rosterSeenAt, 0); assert.equal(fresh.friend, "");
});

test("reanalysis retains account roster membership and its read marker", () => {
  const member = { name: "동기", birth: "2007.04.12", calendar: 0 as const, leapMonth: false, time: "", unknownTime: true, memberId: "peer-account", addedAt: 1 };
  const fresh = freshAnalysis({ ...fixture(), friends: [member] });
  assert.deepEqual(fresh.friends, [member]); assert.equal(fresh.rosterSeenAt, 17);
});
