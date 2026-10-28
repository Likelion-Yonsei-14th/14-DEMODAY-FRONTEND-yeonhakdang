/** `npm test` — the backend client against the examples in the backend's docs/API.md. */
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import {
  ApiError,
  checkoutReturn,
  confirmation,
  createOrder,
  errorMessage,
  getMe,
  getOrders,
  getRefund,
  hasRequiredConsents,
  includesCharm,
  isListedOrder,
  isPayable,
  onUnauthorized,
  orderRequest,
  ownedFromLocker,
  priceMismatches,
  resetCsrf,
  resultSummary,
  reusableResult,
  saveConsents,
  type LockerItem,
  type OrderStatus,
} from "./backend.ts";

type Sent = { url: string; init: RequestInit };
type Reply = { status: number; body?: unknown };

/** A fake server: replies in order, records what was sent. */
function serve(...replies: Reply[]): Sent[] {
  const sent: Sent[] = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    sent.push({ url, init });
    const reply = replies.shift();
    if (!reply) throw new TypeError("network down");
    const text = reply.body === undefined ? "" : JSON.stringify(reply.body);
    return new Response(text || null, { status: reply.status });
  }) as typeof fetch;
  return sent;
}

const header = (s: Sent, name: string) => (s.init.headers as Record<string, string>)[name];
const CSRF = { status: 200, body: { headerName: "X-CSRF-TOKEN", token: "t1" } };

beforeEach(() => resetCsrf());

test("a change fetches the CSRF token first and sends it with cookies", async () => {
  const sent = serve(CSRF, { status: 200 });
  await saveConsents("2026-10-29-draft", { age14: true, terms: true, privacy: true, marketing: false });
  assert.deepEqual(sent.map((s) => s.url), ["/api/csrf", "/api/me/consents"]);
  assert.equal(header(sent[1], "X-CSRF-TOKEN"), "t1");
  assert.equal(sent[1].init.credentials, "include");
  assert.deepEqual(JSON.parse(String(sent[1].init.body)), {
    version: "2026-10-29-draft", age14: true, terms: true, privacy: true, marketing: false,
  });
});

test("a stale CSRF token (403) is refreshed and the call retried once", async () => {
  const sent = serve(CSRF, { status: 403, body: { code: "FORBIDDEN" } }, { status: 200, body: { headerName: "X-CSRF-TOKEN", token: "t2" } }, { status: 200 });
  await saveConsents("v", { age14: true, terms: true, privacy: true, marketing: true });
  assert.equal(header(sent[3], "X-CSRF-TOKEN"), "t2");
});

test("orders carry the Idempotency-Key and come back as the server priced them", async () => {
  const order = { id: "00000000-0000-0000-0000-000000000002", product_code: "package", amount: 3790, currency: "KRW", status: "CREATED", payment_id: "yhd-00000000-0000-0000-0000-000000000002", paid_at: null };
  const sent = serve(CSRF, { status: 200, body: order });
  const request = orderRequest({ resultId: "r", product: "compat", plan: "package", universities: ["연세대학교"], relation: "선배", policyVersion: "v" });
  assert.deepEqual(await createOrder("checkout_abc", request), order);
  assert.equal(header(sent[1], "Idempotency-Key"), "checkout_abc");
});

test("server errors become ApiError with the server's code; a dead network is NETWORK_ERROR", async () => {
  serve(CSRF, { status: 409, body: { code: "REQUIRED_CONSENT" } });
  await assert.rejects(saveConsents("v", { age14: true, terms: true, privacy: true, marketing: false }), (e: unknown) =>
    e instanceof ApiError && e.status === 409 && e.code === "REQUIRED_CONSENT");
  serve();
  await assert.rejects(getMe(), (e: unknown) => e instanceof ApiError && e.code === "NETWORK_ERROR");
});

test("/me is null when logged out; a missing refund is null", async () => {
  serve({ status: 401, body: { code: "UNAUTHENTICATED" } }, { status: 200 });
  assert.equal(await getMe(), null);
  assert.equal(await getRefund("o"), null);
});

test("error messages: known codes get their sentence, others the general one", () => {
  assert.match(errorMessage(new ApiError(409, "CONTENT_PENDING")), /준비/);
  assert.equal(errorMessage(new ApiError(500, "SOMETHING_NEW")), errorMessage(new Error("x")));
});

test("the result summary sends only element counts and the top majors", () => {
  const major = (id: string, display: number) => ({ major: { id }, display });
  const summary = resultSummary({
    counts: { 목: 2, 화: 2, 토: 2, 금: 1, 수: 1 },
    top: [major("H01", 92), major("H02", 85), major("H03", 80), major("H04", 70)],
  } as unknown as Parameters<typeof resultSummary>[0]);
  assert.deepEqual(summary.counts, { wood: 2, fire: 2, earth: 2, metal: 1, water: 1 });
  assert.deepEqual(summary.top, [{ id: "H01", score: 92 }, { id: "H02", score: 85 }, { id: "H03", score: 80 }]);
  assert.match(summary.engineVersion, /^frontend-/);
});

test("order requests carry universities and relation only where the product uses them", () => {
  const base = { resultId: "r", universities: ["연세대학교"], relation: "선배", policyVersion: "v" };
  const compat = orderRequest({ ...base, product: "compat", plan: "single" });
  assert.deepEqual([compat.product, compat.universities, compat.relation], ["compat", ["연세대학교"], ""]);
  const benefactor = orderRequest({ ...base, product: "benefactor", plan: "single" });
  assert.deepEqual([benefactor.universities, benefactor.relation], [[], "선배"]);
  const charm = orderRequest({ ...base, product: "charm", plan: "single" });
  assert.deepEqual([charm.universities, charm.relation], [[], ""]);
  const pack = orderRequest({ ...base, product: "charm", plan: "package" });
  assert.deepEqual([pack.product, pack.universities, pack.relation], ["package", ["연세대학교"], "선배"]);
  assert.equal(pack.orderConsent && pack.refundConsent, true);
});

test("consent counts only the latest answer for the current version", () => {
  const policies = { version: "v2", required: ["AGE14_SELF_DECLARED", "TERMS", "PRIVACY"] as const };
  const at = (item: string, version: string, accepted: boolean) => ({ item, version, accepted, recorded_at: "" });
  const all = (version: string, accepted = true) => ["AGE14_SELF_DECLARED", "TERMS", "PRIVACY"].map((i) => at(i, version, accepted));
  type Consents = Parameters<typeof hasRequiredConsents>[0]["consents"];
  const check = (consents: ReturnType<typeof at>[]) =>
    hasRequiredConsents({ consents: consents as Consents }, { ...policies, required: [...policies.required] });
  assert.equal(check(all("v2")), true);
  assert.equal(check(all("v1")), false);
  assert.equal(check([...all("v2"), at("TERMS", "v2", false)]), false);
});

test("the locker gives owned products and the newest order holding each", () => {
  const item = (order_id: string, product_code: LockerItem["product_code"], status = "ACTIVE"): LockerItem =>
    ({ order_id, product_code, status, first_viewed_at: null, content_version: null, content_ready: false });
  const { purchased, orders } = ownedFromLocker([item("new", "compat"), item("old", "compat"), item("p", "charm", "REFUND_PENDING")]);
  assert.deepEqual(purchased, { compat: true, benefactor: false, charm: false });
  assert.deepEqual(orders, { compat: "new" });
});

test("price mismatches name the products the server prices differently", () => {
  const shown = { compat: 2900, benefactor: 1900, charm: 990, package: 3790 };
  assert.deepEqual(priceMismatches([{ code: "compat", title: "", price: 2900 }], shown), []);
  assert.deepEqual(priceMismatches([{ code: "charm", title: "", price: 1100 }], shown), ["charm: 화면 990원 · 서버 1100원"]);
});

test("any 401 tells the app the session is gone", async () => {
  let calls = 0;
  onUnauthorized(() => calls++);
  serve({ status: 401, body: { code: "UNAUTHENTICATED" } }, { status: 401, body: { code: "ACCOUNT_INACTIVE" } });
  await assert.rejects(getOrders(), (e: unknown) => e instanceof ApiError && e.status === 401);
  assert.equal(await getMe(), null);
  assert.equal(calls, 2);
  onUnauthorized(null);
});

test("a confirmed order is paid, failed, or still pending — never pending shown as failed", () => {
  const of = (status: OrderStatus) => confirmation({ status });
  assert.equal(of("PAID"), "paid");
  assert.equal(of("PARTIALLY_REFUNDED"), "paid");
  assert.equal(of("FAILED"), "failed");
  assert.equal(of("CANCELLED"), "failed");
  for (const status of ["PENDING", "REVIEW_REQUIRED", "READY", "CREATED"] as const) assert.equal(of(status), "pending");
});

test("only CREATED, READY and FAILED orders can go back to the PG window", () => {
  const payable = (["CREATED", "READY", "FAILED", "PENDING", "PAID", "CANCELLED", "REFUNDED"] as const).filter((status) => isPayable({ status }));
  assert.deepEqual(payable, ["CREATED", "READY", "FAILED"]);
});

test("구매 내역 lists orders where money moved or may have", () => {
  const listed = (["CREATED", "READY", "FAILED", "CANCELLED", "PENDING", "PAID", "PARTIALLY_REFUNDED", "REFUNDED", "REVIEW_REQUIRED"] as const)
    .filter((status) => isListedOrder({ status }));
  assert.deepEqual(listed, ["PENDING", "PAID", "PARTIALLY_REFUNDED", "REFUNDED", "REVIEW_REQUIRED"]);
});

test("a saved result id is reused only for the same account and the same analysis", () => {
  const saved = { summary: "s", id: "r1", account: "me" };
  assert.equal(reusableResult(saved, "s", "me"), "r1");
  assert.equal(reusableResult(saved, "s", "someone-else"), null);
  assert.equal(reusableResult(saved, "changed", "me"), null);
  assert.equal(reusableResult(saved, "s", null), null);
  assert.equal(reusableResult(null, "s", "me"), null);
});

test("the PG return carries the order, and PortOne's message only when it failed", () => {
  assert.deepEqual(checkoutReturn("?checkoutOrder=o1&paymentId=yhd-o1"), { id: "o1", message: null });
  assert.deepEqual(checkoutReturn("?checkoutOrder=o1&code=FAILURE_TYPE_PG&message=%EC%B7%A8%EC%86%8C"), { id: "o1", message: "취소" });
  assert.deepEqual(checkoutReturn("?checkoutOrder=o1&code=FAILURE_TYPE_PG"), { id: "o1", message: "결제가 완료되지 않았어요." });
  assert.equal(checkoutReturn("?invite=abc"), null);
});

test("부적 다시 뽑기 restarts with orders that include the charm", () => {
  assert.deepEqual((["charm", "package", "compat", "benefactor"] as const).map((product_code) => includesCharm({ product_code })), [true, true, false, false]);
});

test("refund-only error codes the spec table leaves out still get a sentence", () => {
  assert.match(errorMessage(new ApiError(409, "ORDER_NOT_PAID")), /결제가 끝난/);
  assert.match(errorMessage(new ApiError(409, "NOTHING_TO_REFUND")), /남아 있지 않아요/);
});
