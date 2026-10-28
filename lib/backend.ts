/**
 * The 연학당 backend (14-DEMODAY-BACKEND-yeonhakdang, docs/API.md) — the one
 * place that talks to it. Calls are same-origin: next.config rewrites `/api`,
 * `/oauth2` and `/login/oauth2` to BACKEND_ORIGIN, so the session cookie is a
 * first-party cookie and no CORS is involved.
 *
 * Off unless NEXT_PUBLIC_USE_BACKEND=true; the prototype then runs on its own
 * demo data exactly as before.
 */
import type { Analysis } from "./saju/analyze.ts";
import type { Element } from "./saju/elements.ts";

export const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === "true";

/** A full-page visit: Spring keeps the OAuth state in the session. */
export const LOGIN_PATH = "/oauth2/authorization/kakao";

/** Bump when the saju scoring changes, so stored summaries say which engine made them. */
export const ENGINE_VERSION = "frontend-saju-1";

/* ── Types (field names as the server sends them) ─────────────────── */

export type ProductKind = "compat" | "benefactor" | "charm";
export type ProductCode = ProductKind | "package";
export type ConsentItem = "AGE14_SELF_DECLARED" | "TERMS" | "PRIVACY" | "MARKETING";

export type Product = { code: ProductCode; title: string; price: number };
export type Policies = {
  version: string;
  required: ConsentItem[];
  optional: ConsentItem[];
  ageVerification: string;
};
export type Consent = { item: ConsentItem; version: string; accepted: boolean; recorded_at: string };
export type Me = { id: string; policyVersion: string; consents: Consent[] };

export type OrderStatus =
  | "CREATED" | "READY" | "PENDING" | "PAID" | "FAILED" | "CANCELLED"
  | "PARTIALLY_REFUNDED" | "REFUNDED" | "REVIEW_REQUIRED";
export type Order = {
  id: string;
  product_code: ProductCode;
  amount: number;
  status: OrderStatus;
  created_at: string;
  paid_at: string | null;
  currency?: string;
  payment_id?: string;
};
export type LockerItem = {
  order_id: string;
  product_code: ProductKind;
  status: string;
  first_viewed_at: string | null;
  content_version: string | null;
  content_ready: boolean;
};
export type Opened = { content: unknown; contentVersion: string; firstViewedAt: string };

export const REFUND_REASONS = {
  CHANGE_OF_MIND: "단순 변심 (결과를 열기 전)",
  INPUT_ERROR: "입력 정보 오류",
  NOT_PROVIDED: "결과를 받지 못했어요",
  DUPLICATE_PAYMENT: "중복 결제",
  SYSTEM_FAILURE: "시스템 오류로 볼 수 없어요",
  NOT_AS_DESCRIBED: "안내와 다른 결과",
  MINOR_WITHOUT_CONSENT: "미성년자 법정대리인 동의 없음",
} as const;
export type RefundReason = keyof typeof REFUND_REASONS;
export type Refund = {
  id: string;
  order_id: string;
  reason: RefundReason;
  status: string;
  amount: number;
  created_at: string;
  reviewed_at: string | null;
};

export type PayMethod = "card" | "kakao" | "toss";
const PAY_METHOD: Record<PayMethod, "CARD" | "KAKAO" | "TOSS"> = { card: "CARD", kakao: "KAKAO", toss: "TOSS" };

/* ── Errors ───────────────────────────────────────────────────────── */

/** `{ code }` from the server; status 0 / NETWORK_ERROR when it never answered. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string) {
    super(code);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "서버에 연결하지 못했어요. 네트워크를 확인하고 다시 시도해 주세요.",
  UNAUTHENTICATED: "로그인이 필요해요.",
  ACCOUNT_INACTIVE: "사용할 수 없는 계정이에요. 고객센터로 문의해 주세요.",
  FORBIDDEN: "요청이 만료됐어요. 다시 시도해 주세요.",
  NOT_FOUND: "찾을 수 없는 주문이에요.",
  INVALID_REQUEST: "입력한 내용을 다시 확인해 주세요.",
  REQUIRED_CONSENT: "약관 동의가 필요해요.",
  PURCHASE_CONSENT_REQUIRED: "주문 및 환불 제한 안내에 동의해 주세요.",
  IDEMPOTENCY_CONFLICT: "주문 내용이 바뀌었어요. 다시 결제해 주세요.",
  ORDER_NOT_PAYABLE: "이미 처리된 주문이에요. 구매 내역을 확인해 주세요.",
  CONTENT_PENDING: "결과를 준비하고 있어요. 잠시 후 다시 열어 주세요.",
  ENTITLEMENT_NOT_ACTIVE: "환불 처리 중이거나 이용할 수 없는 상품이에요.",
  ORDER_NOT_ACCESSIBLE: "결제 확인 중인 주문이에요. 잠시 후 다시 시도해 주세요.",
  REFUND_WINDOW_EXPIRED: "환불 가능 기간(결제일부터 7일)이 지났어요. 고객센터로 문의해 주세요.",
  ALREADY_VIEWED: "이미 열어본 결과는 단순 변심 환불이 어려워요.",
  PROVIDER_REVIEW_REQUIRED: "결제사 확인이 필요해요. 고객센터에서 확인 후 안내드릴게요.",
  REFUND_ALREADY_PROCESSED_OR_UNKNOWN: "이미 처리 중인 환불이에요. 고객센터에서 확인 후 안내드릴게요.",
  ORDER_NOT_PAID: "결제가 끝난 주문만 환불을 신청할 수 있어요.",
  NOTHING_TO_REFUND: "환불할 수 있는 상품이 남아 있지 않아요.",
  REQUEST_TOO_LARGE: "요청이 너무 커요.",
  PORTONE_UNAVAILABLE: "결제사 응답이 늦어요. 결제 결과를 다시 확인할게요.",
  INVALID_PROVIDER_PAYMENT_TIME: "결제 시각을 확인하지 못했어요. 결제 결과를 다시 확인할게요.",
  PAID_CONTENT_NOT_READY: "유료 결과를 준비하고 있어요. 곧 결제를 열게요.",
  CHANNEL_NOT_CONFIGURED: "이 결제 수단은 준비 중이에요. 다른 수단을 골라 주세요.",
  PORTONE_NOT_CONFIGURED: "결제 준비 중이에요. 잠시 후 다시 시도해 주세요.",
  INTERNAL_ERROR: "일시적인 오류가 생겼어요. 잠시 후 다시 시도해 주세요.",
};

/** A sentence for the toast, whatever was thrown. */
export function errorMessage(error: unknown): string {
  const code = error instanceof ApiError ? error.code : "INTERNAL_ERROR";
  return MESSAGES[code] ?? MESSAGES.INTERNAL_ERROR;
}

/* ── Transport ────────────────────────────────────────────────────── */

let csrfToken: string | null = null;
let unauthorized: (() => void) | null = null;

/** The token rotates on login, logout and session expiry: drop it then. */
export function resetCsrf() {
  csrfToken = null;
}

/** Called whenever the server says the session is gone (401), from any call. */
export function onUnauthorized(listener: (() => void) | null) {
  unauthorized = listener;
}

async function send(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(path, { ...init, credentials: "include", cache: "no-store" });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR");
  }
}

async function refreshCsrf(): Promise<string> {
  const response = await send("/api/csrf", { method: "GET" });
  if (!response.ok) throw new ApiError(response.status, "INTERNAL_ERROR");
  const body = (await response.json()) as { token: string };
  csrfToken = body.token;
  return body.token;
}

type Call = { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown; headers?: Record<string, string> };

async function api<T>(path: string, { method = "GET", body, headers = {} }: Call = {}, retried = false): Promise<T> {
  const mutating = method !== "GET";
  const token = mutating ? (csrfToken ?? (await refreshCsrf())) : null;
  const response = await send(`/api${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { "X-CSRF-TOKEN": token } : {}),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const code = await response.json().then((e: { code?: string }) => e.code, () => undefined);
    // A stale CSRF token is a bare 403: fetch a fresh one and try once more.
    if (response.status === 403 && mutating && !retried) {
      csrfToken = null;
      return api<T>(path, { method, body, headers }, true);
    }
    if (response.status === 401) {
      csrfToken = null;
      unauthorized?.();
    }
    throw new ApiError(response.status, code ?? (response.status >= 500 ? "INTERNAL_ERROR" : "INVALID_REQUEST"));
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/* ── Endpoints ────────────────────────────────────────────────────── */

export const getProducts = () => api<Product[]>("/products");
export const getPolicies = () => api<Policies>("/policies");

/** null when nobody is logged in. */
export async function getMe(): Promise<Me | null> {
  try {
    return await api<Me>("/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export type ConsentAnswers = { age14: boolean; terms: boolean; privacy: boolean; marketing: boolean };
export const saveConsents = (version: string, answers: ConsentAnswers) =>
  api<void>("/me/consents", { method: "POST", body: { version, ...answers } });

export async function logout() {
  await api<void>("/logout", { method: "POST" });
  csrfToken = null;
}

export async function withdraw() {
  await api<void>("/me", { method: "DELETE" });
  csrfToken = null;
}

export type ResultSummary = {
  engineVersion: string;
  counts: Record<"wood" | "fire" | "earth" | "metal" | "water", number>;
  top: { id: string; score: number }[];
};

const ELEMENT_KEY: Record<Element, keyof ResultSummary["counts"]> = { 목: "wood", 화: "fire", 토: "earth", 금: "metal", 수: "water" };

/** What the server keeps of an analysis: no name, birth, time or gender. */
export function resultSummary(analysis: Pick<Analysis, "counts" | "top">): ResultSummary {
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const [element, n] of Object.entries(analysis.counts) as [Element, number][]) counts[ELEMENT_KEY[element]] = n;
  return {
    engineVersion: ENGINE_VERSION,
    counts,
    top: analysis.top.slice(0, 3).map((m) => ({ id: m.major.id, score: m.display })),
  };
}

export const saveResult = (summary: ResultSummary) =>
  api<{ id: string; provenance: string }>("/results", { method: "POST", body: summary });

export type OrderRequest = {
  resultId: string;
  product: ProductCode;
  universities: string[];
  relation: string;
  policyVersion: string;
  orderConsent: boolean;
  refundConsent: boolean;
};

/** 궁합·패키지 carry the universities, 귀인·패키지 the relation; the rest send them empty. */
export function orderRequest(o: {
  resultId: string;
  product: ProductKind;
  plan: "single" | "package";
  universities: string[];
  relation: string;
  policyVersion: string;
}): OrderRequest {
  const product: ProductCode = o.plan === "package" ? "package" : o.product;
  return {
    resultId: o.resultId,
    product,
    universities: product === "compat" || product === "package" ? o.universities : [],
    relation: product === "benefactor" || product === "package" ? o.relation : "",
    policyVersion: o.policyVersion,
    orderConsent: true,
    refundConsent: true,
  };
}

export function newIdempotencyKey(): string {
  return `checkout_${crypto.randomUUID()}`;
}

/** Same key + same body → the same order, so a retry or refresh never buys twice. */
export const createOrder = (key: string, request: OrderRequest) =>
  api<Order>("/orders", { method: "POST", body: request, headers: { "Idempotency-Key": key } });

export const getOrders = () => api<Order[]>("/orders");
export const getOrder = (id: string) => api<Order>(`/orders/${id}`);

/** The PortOne SDK request object, built and priced by the server. */
export const prepareOrder = (id: string, method: PayMethod) =>
  api<Record<string, unknown>>(`/orders/${id}/prepare`, { method: "POST", body: { method: PAY_METHOD[method] } });

/** The server re-reads the payment from PortOne; only this decides 결제 완료. */
export const completeOrder = (id: string) => api<Order>(`/orders/${id}/complete`, { method: "POST" });

export const getLocker = () => api<LockerItem[]>("/locker");

/** Records the first view: call only when the result is actually shown. */
export const openProduct = (orderId: string, kind: ProductKind) =>
  api<Opened>(`/orders/${orderId}/products/${kind}/open`, { method: "POST" });

export const requestRefund = (orderId: string, reason: RefundReason) =>
  api<Refund>(`/orders/${orderId}/refunds`, { method: "POST", body: { reason } });

/** The latest refund request, or null when there is none. */
export async function getRefund(orderId: string): Promise<Refund | null> {
  try {
    return (await api<Refund | undefined>(`/orders/${orderId}/refunds`)) ?? null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/* ── Derived state ────────────────────────────────────────────────── */

/** Every 필수 item's latest answer for the current version is yes. */
export function hasRequiredConsents(me: Pick<Me, "consents">, policies: Pick<Policies, "version" | "required">): boolean {
  return policies.required.every((item) => {
    const answers = me.consents.filter((c) => c.item === item && c.version === policies.version);
    return answers.at(-1)?.accepted === true;
  });
}

/** Which products the locker holds, and the order each came with. */
export function ownedFromLocker(items: LockerItem[]): {
  purchased: Record<ProductKind, boolean>;
  orders: Partial<Record<ProductKind, string>>;
} {
  const purchased = { compat: false, benefactor: false, charm: false };
  const orders: Partial<Record<ProductKind, string>> = {};
  for (const item of items) {
    if (item.status !== "ACTIVE") continue;
    purchased[item.product_code] = true;
    // Newest first: keep the latest order for a product bought twice.
    orders[item.product_code] ??= item.order_id;
  }
  return { purchased, orders };
}

/** Prices the screens show that the server disagrees with (the server's charge wins). */
export function priceMismatches(server: Product[], shown: Record<ProductCode, number>): string[] {
  return server
    .filter((p) => p.code in shown && shown[p.code] !== p.price)
    .map((p) => `${p.code}: 화면 ${shown[p.code]}원 · 서버 ${p.price}원`);
}

export function isPaid(order: Pick<Order, "status">): boolean {
  return order.status === "PAID" || order.status === "PARTIALLY_REFUNDED";
}

/** The server still lets this order go to the PG window (`/prepare`). */
export function isPayable(order: Pick<Order, "status">): boolean {
  return order.status === "CREATED" || order.status === "READY" || order.status === "FAILED";
}

/**
 * What a confirmed order means for the visitor. `pending` is not a failure:
 * the money may have moved (PG still settling, or held for an operator check),
 * so it must never be shown as 결제 실패 or invite a second payment.
 */
export function confirmation(order: Pick<Order, "status">): "paid" | "pending" | "failed" {
  if (isPaid(order)) return "paid";
  if (order.status === "FAILED" || order.status === "CANCELLED") return "failed";
  return "pending";
}

/** Orders worth listing in 구매 내역: ones where money moved or may have. */
export function isListedOrder(order: Pick<Order, "status">): boolean {
  return !isPayable(order) && order.status !== "CANCELLED";
}

/** The charm's 다시 뽑기 count starts over with every order that includes it. */
export function includesCharm(order: Pick<Order, "product_code">): boolean {
  return order.product_code === "charm" || order.product_code === "package";
}

export type SavedResult = { summary: string; id: string; account: string };

/** A saved result id is reused only for the same account and the same analysis. */
export function reusableResult(saved: SavedResult | null, summary: string, account: string | null): string | null {
  return saved && account && saved.account === account && saved.summary === summary ? saved.id : null;
}

/**
 * The query a mobile PG page returns with: `?checkoutOrder=` from the server's
 * redirectUrl, plus PortOne's own `code` / `message` when the payment failed.
 */
export function checkoutReturn(search: string): { id: string; message: string | null } | null {
  const params = new URLSearchParams(search);
  const id = params.get("checkoutOrder");
  if (!id) return null;
  return { id, message: params.get("code") ? params.get("message") || "결제가 완료되지 않았어요." : null };
}
