import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";
import type { Proto } from "./proto.tsx";
import type { PurchaseSnapshot } from "./purchaseSnapshot.ts";

const compiled = ts.transpileModule(fs.readFileSync("lib/checkout.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
function setup(failSave = false) {
  const events: string[] = [];
  let snapshot: PurchaseSnapshot | null = null;
  const keys: string[] = [];
  const backend = {
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
  const engine = {
    analyzeBirth: () => ({ ok: true, analysis: {} }), personalOf: () => ({}), PAID_CONTENT: {},
    compatResult: () => ({ universities: [{ name: "연세대학교", score: 85 }] }),
    benefactorResult: () => ({ type: "saved" }), charmResult: (_a: unknown, variant: number) => ({ art: { variant } }),
  };
  const context = { exports: {} as { checkout: (proto: Proto, phone: string) => Promise<unknown> }, require: (name: string) => name === "@/lib/backend" ? backend : engine, window: { location: { assign: () => events.push("navigate") } } };
  vm.runInNewContext(compiled, context);
  const state = { name: "구매당시이름", birth: "2005.03.15", gender: 0, calendar: 0, leapMonth: false, time: "", unknownTime: true, relation: "선배", universities: ["연세대학교"], payMethod: "card", checkout: null } as unknown as Proto["state"];
  const proto = { state, update: () => {}, saveNow: (patch: Partial<Proto["state"]>) => { Object.assign(state, patch); } } as unknown as Proto;
  return { events, keys, proto, run: () => context.exports.checkout(proto, "01000000000"), snapshot: () => snapshot };
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
