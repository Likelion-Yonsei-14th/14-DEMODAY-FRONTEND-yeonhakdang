import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";
import { purchasedDestination } from "./purchaseAccess.ts";
import type { ProtoState } from "./proto.tsx";
import type { Proto } from "./proto.tsx";
import type { PurchaseSnapshot } from "./purchaseSnapshot.ts";

const compiled = ts.transpileModule(fs.readFileSync("lib/checkout.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function setup(failSave = false, owned = false, libraryFailure = false) {
  const events: string[] = [];
  let snapshot: PurchaseSnapshot | null = null;
  const keys: string[] = [];
  const patches: Partial<ProtoState>[] = [];
  const backend = {
    ApiError: class extends Error {},
    getLibrary: async () => {
      if (libraryFailure) throw new Error("library unavailable");
      return { accountId: "member-1", items: owned ? [{ product_code: "compat", order_id: "previous", status: "ACTIVE" }] : [], orders: [] };
    },
    ownedFromLocker: (items: { product_code: string }[]) => ({ purchased: { compat: items.length > 0, benefactor: false, charm: false }, orders: items.length ? { compat: "previous" } : {} }),
    getPolicies: async () => ({ version: "test" }),
    resultSummary: () => ({}), reusableResult: () => "result-1",
    orderRequest: () => ({ product: "package", universities: ["연세대학교"], relation: "선배" }),
    newIdempotencyKey: () => `key-${keys.length + 1}`,
    createOrder: async (key: string) => { keys.push(key); events.push("order"); return { id: `order-${key}` }; },
    checkoutAction: () => "reuse",
    savePurchaseSnapshot: async (_id: string, value: PurchaseSnapshot) => { events.push("snapshot"); if (failSave) throw new Error("snapshot unavailable"); snapshot = value; },
    prepareOrder: async () => { events.push("prepare"); return {}; },
    payAppPaymentUrl: () => "https://payment.example/fixture",
  };
  const catalog = { PACKAGE_PRICE: 3790, PRODUCTS: { compat: { price: 2900 }, benefactor: { price: 1900 }, charm: { price: 1000 } } };
  const engine = {
    analyzeBirth: () => ({ ok: true, analysis: {} }), personalOf: () => ({}), PAID_CONTENT: {},
    compatResult: () => ({ universities: [{ name: "연세대학교", score: 85 }] }),
    benefactorResult: () => ({ type: "saved" }), charmResult: (_a: unknown, variant: number) => ({ art: { variant } }),
  };
  const context = { exports: {} as { syncLocker: (update: (patch: Partial<ProtoState>) => void, account: string, selected?: ProtoState["orders"]) => Promise<unknown>; checkout: (proto: Proto, phone: string) => Promise<unknown> }, require: (name: string) => name === "@/lib/backend" ? backend : name.includes("purchaseAccess") ? { purchasedDestination } : name.includes("catalog") ? catalog : engine, window: { location: { assign: () => events.push("navigate") } } };
  vm.runInNewContext(compiled, context);
  const state = { account: "member-1", product: "compat", plan: "single", orders: {}, name: "구매당시이름", birth: "2005.03.15", gender: 0, calendar: 0, leapMonth: false, time: "", unknownTime: true, relation: "선배", universities: ["연세대학교"], payMethod: "card", checkout: null } as unknown as Proto["state"];
  const proto = { state, update: () => {}, saveNow: (patch: Partial<Proto["state"]>) => { Object.assign(state, patch); } } as unknown as Proto;
  return { events, keys, proto, backend, catalog, patches, sync: (account: string) => context.exports.syncLocker((patch) => patches.push(patch), account), run: () => context.exports.checkout(proto, "01000000000"), snapshot: () => snapshot };
}
test("payment opens only after the purchase input, reports and all charm variants are saved", async () => {
  const s = setup();await s.run();
  assert.deepEqual(s.events, ["order", "snapshot", "prepare", "navigate"]);
  const saved = s.snapshot()!;
  assert.equal(saved.input.name, "구매당시이름");
  assert.equal(saved.results.compat?.universities[0].name, "연세대학교");
  assert.deepEqual(Array.from(saved.charmVariants, (v) => v.art.variant), [0, 1, 2, 3]);
});
test("snapshot failure prevents payment preparation and navigation, and retains the order for retry", async () => {
  const s = setup(true);await assert.rejects(s.run(), /snapshot unavailable/);
  assert.deepEqual(s.events, ["order", "snapshot"]);
  assert.ok(s.proto.state.checkout?.orderId);
});
test("changing purchase input uses a fresh order key instead of replacing a frozen snapshot", async () => {
  const s = setup();await s.run();s.proto.state.name = "다른이름";await s.run();
  assert.notEqual(s.keys[0], s.keys[1]);
});

test("a fresh browser with a previous purchase opens its saved result without creating a charge", async () => {
  const s = setup(false, true);
  assert.equal((await s.run() as { screen: string }).screen, "8-1");
  assert.deepEqual(s.events, []);
});
test("unavailable purchase history blocks a new charge", async () => {
  const s = setup(false, false, true);
  await assert.rejects(s.run(), /library unavailable/);
  assert.deepEqual(s.events, []);
});

test("library from another authenticated account is rejected before ownership is updated", async () => {
  const s = setup(false, true);
  await assert.rejects(s.sync("other-account"));
  assert.deepEqual(s.patches, []);
});
test("ownership refresh does not erase exact purchased report content", async () => {
  const s = setup(false, true);await s.sync("member-1");
  assert.equal(s.patches.length, 1);
  assert.equal("paidResults" in s.patches[0], false);
  assert.equal(s.patches[0].purchased?.compat, true);
});

test("switching Kakao Pay to Toss Pay creates a new order instead of reopening the Kakao URL", async () => {
  const s = setup();
  s.proto.state.payMethod = "kakao";await s.run();
  s.proto.state.payMethod = "toss";await s.run();
  assert.notEqual(s.keys[0], s.keys[1]);
});
test("retrying the same payment method reuses the existing order key", async () => {
  const s = setup();s.proto.state.payMethod = "toss";
  await s.run();await s.run();
  assert.equal(s.keys[0], s.keys[1]);
});

test("a price update does not reuse an older below-minimum charm order", async () => {
  const s = setup();s.proto.state.product = "charm";
  s.catalog.PRODUCTS.charm.price = 990;await s.run();
  s.catalog.PRODUCTS.charm.price = 1000;await s.run();
  assert.notEqual(s.keys[0], s.keys[1]);
});
