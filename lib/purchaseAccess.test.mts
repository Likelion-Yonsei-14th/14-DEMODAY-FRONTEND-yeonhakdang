import assert from "node:assert/strict";
import { test } from "node:test";
import { ownedScreen, purchasedDestination } from "./purchaseAccess.ts";
const purchased = { compat: true, benefactor: false, charm: true };
test("product links, login returns and checkout hashes open purchased results", () => {
  const state = { product: "compat" as const, plan: "single", purchased };
  for (const screen of ["6-1", "7-1", "7-3"]) assert.equal(ownedScreen(screen, state), "8-1");
  assert.equal(ownedScreen("6-2", state), "6-2");
  assert.equal(ownedScreen("6-3", state), "8-3");
  assert.equal(ownedScreen("7-4", state), "7-4");
});
test("package entry opens locker only when every included product is owned", () => {
  assert.equal(purchasedDestination("compat", "package", purchased), null);
  assert.equal(ownedScreen("6-1", { product: "compat", plan: "package", purchased }), "6-1");
  assert.equal(purchasedDestination("compat", "package", { compat: true, benefactor: true, charm: true }), "9-1");
});
