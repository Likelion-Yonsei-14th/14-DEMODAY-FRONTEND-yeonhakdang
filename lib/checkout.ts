"use client";

/**
 * 결제 with the backend on: result summary → server order → PayApp page →
 * server confirmation. Only `completeOrder` decides 결제 완료; neither the SDK
 * nor the return URL is trusted with that.
 */

import {
  completeOrder,
  confirmation,
  createOrder,
  getLocker,
  getPolicies,
  includesCharm,
  checkoutAction,
  newIdempotencyKey,
  orderRequest,
  ownedFromLocker,
  prepareOrder,
  payAppPaymentUrl,
  resultSummary,
  reusableResult,
  saveResult,
  savePurchaseSnapshot,
  type Order,
} from "@/lib/backend";
import type { Proto, ProtoState } from "@/lib/proto";
import { analyzeBirth, personalOf, PAID_CONTENT, compatResult, benefactorResult, charmResult } from "@/lib/saju";

type Update = (patch: Partial<ProtoState>) => void;

/**
 * How a checkout ended. `pending` means the server could not call it either
 * way yet (PG settling, operator review): never 결제 실패, never pay again.
 */
export type CheckoutOutcome =
  | { kind: "paid" }
  | { kind: "pending" }
  | { kind: "failed"; message?: string }
  | { kind: "redirected" };

/** The saved summary's id, saving it first when it is new to the server or to this account. */
async function resultId(state: ProtoState, update: Update): Promise<string> {
  const analysis = analyzeBirth(state);
  if (!analysis.ok) throw new Error(analysis.error);
  const summary = JSON.stringify(resultSummary(analysis.analysis));
  const reused = reusableResult(state.savedResult, summary, state.account);
  if (reused) return reused;
  const { id } = await saveResult(JSON.parse(summary));
  if (state.account) update({ savedResult: { summary, id, account: state.account } });
  return id;
}

/** Refreshes 보유 상품 from the server's locker. */
export async function syncLocker(update: Update) {
  update({ ...ownedFromLocker(await getLocker()), paidResults: {} });
}

/** Server confirmation, then the locker, so 7-4 shows what was really bought. */
export async function confirmOrder(orderId: string, update: Update): Promise<Order> {
  const order = await completeOrder(orderId);
  const result = confirmation(order);
  // Paid, or dead (cancelled orders cannot be paid again): the next checkout is a new order.
  if (result !== "pending") update({ checkout: null });
  if (result === "paid") {
    if (includesCharm(order)) update({ charmRerolls: 3 });
    await syncLocker(update);
  }
  return order;
}

export async function checkout(proto: Pick<Proto, "state" | "update" | "saveNow">, phone: string): Promise<CheckoutOutcome> {
  const { state, update } = proto;
  const { version } = await getPolicies();
  const request = orderRequest({ ...state, resultId: await resultId(state, update), policyVersion: version });
  const fingerprint = JSON.stringify({ request, input: { name: state.name, birth: state.birth, gender: state.gender, calendar: state.calendar, leapMonth: state.leapMonth, time: state.time, unknownTime: state.unknownTime }, snapshotVersion: 1 });
  // Keep the key while the order is the same, so a retry or refresh reuses it…
  let key = state.checkout?.request === fingerprint ? state.checkout.key : newIdempotencyKey();
  let order = await createOrder(key, request);
  const action = checkoutAction(order);
  if (action === "pending") return { kind: "pending" };
  if (action === "paid") {
    await syncLocker(update);
    return { kind: "paid" };
  }
  // A terminal cancelled/refunded order needs a fresh request key.
  if (action === "new") {
    key = newIdempotencyKey();
    order = await createOrder(key, request);
  }
  proto.saveNow({ checkout: { request: fingerprint, key, orderId: order.id } });
  // Freeze the report before opening a payment page. A failed save prevents payment.
  const analyzed = analyzeBirth(state);
  if (!analyzed.ok) throw new Error(analyzed.error);
  const analysis = analyzed.analysis;
  const personal = personalOf(analysis, state, state.gender, state.name);
  const { name, birth, gender, calendar, leapMonth, time, unknownTime } = state;
  const kinds = request.product === "package" ? ["compat", "benefactor", "charm"] : [request.product];
  const variants = kinds.includes("charm") ? [0, 1, 2, 3].map((n) => charmResult(analysis, n, PAID_CONTENT, personal)) : [];
  await savePurchaseSnapshot(order.id, {
    version: 1, input: { name, birth, gender, calendar, leapMonth, time, unknownTime },
    universities: request.universities, relation: request.relation,
    results: {
      ...(kinds.includes("compat") ? { compat: compatResult(analysis, request.universities, PAID_CONTENT, personal) } : {}),
      ...(kinds.includes("benefactor") ? { benefactor: benefactorResult(analysis, state.relation, PAID_CONTENT, personal) } : {}),
      ...(variants.length ? { charm: variants[0] } : {}),
    }, charmVariants: variants,
  });
  const payload = await prepareOrder(order.id, state.payMethod, phone);
  const url = payAppPaymentUrl(payload);
  window.location.assign(url);
  return { kind: "redirected" };
}
