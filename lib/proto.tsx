"use client";

import { createContext, useContext } from "react";

import type { SavedResult } from "@/lib/backend";
import { PACKAGE_PRICE, PRODUCTS, type ProductKind } from "@/lib/catalog";
import { detectApp } from "@/lib/externalBrowser";
import { encodeInvite, friendKey, type Friend, type FriendInput } from "@/lib/friends";
import { birthError } from "@/lib/saju";

/**
 * Prototype runtime. The shell at `/` provides a live context. Without it
 * (the default below) a screen renders in its static Figma state and taps are
 * no-ops — kept so each screen still matches its frame in isolation.
 */

// Prices live in the catalog, which server pages share.
export { PACKAGE_PRICE, PRODUCTS, won, type ProductKind } from "@/lib/catalog";
export type Plan = "single" | "package";
export type Relation = "선배" | "동기" | "교수님" | "연인";

export type ProtoState = {
  /** Who sent the invite link this session came through (1-2); null otherwise. */
  inviter: FriendInput | null;
  /** 합격자 명단 — kept on this device until there is a backend. */
  friends: Friend[];
  /** When the 명단 was last opened: friends added after it get NEW. */
  rosterSeenAt: number;
  name: string;
  /** "YYYY.MM.DD", possibly partial while typing. */
  birth: string;
  gender: 0 | 1;
  calendar: 0 | 1;
  leapMonth: boolean;
  /** Selected birth time label, e.g. "오후 2시 30분"; "" when unset. */
  time: string;
  unknownTime: boolean;
  analyzed: boolean;
  loggedIn: boolean;
  agreedTerms: boolean;
  /** Where to land once the 카카오 login (2-4 → 2-5) finishes. */
  afterLogin: string;
  /** Resume a purchase after collecting the visitor's birth information. */
  afterInput: string | null;
  /** The product currently being viewed / bought. */
  product: ProductKind;
  plan: Plan;
  universities: string[];
  relation: Relation;
  /** card = 신용·체크카드 through the NHN KCP window. */
  payMethod: "card" | "kakao" | "toss";
  purchased: Record<ProductKind, boolean>;
  charmRerolls: number;
  /** friendKey of the friend whose 궁합 sheet (4-3) is open. */
  friend: string;
  /* ── With the backend on (lib/backend.ts); unused by the demo ── */
  /** Left for 카카오 login: on return, resume at `afterLogin`. */
  loginPending: boolean;
  /** The logged-in member's server id (from /api/me); null when logged out. */
  account: string | null;
  /** The analysis summary last saved to the server, its id, and whose it is. */
  savedResult: SavedResult | null;
  /** The checkout in progress: one Idempotency-Key per order request. */
  checkout: { request: string; key: string; orderId: string | null } | null;
  /** Back from the PG page (`?checkoutOrder=`): confirm this order; `message` is PortOne's failure text. */
  pendingOrder: { id: string; message: string | null } | null;
  /** The order that holds each owned product, for /open and refunds. */
  orders: Partial<Record<ProductKind, string>>;
};

const example = (name: string, birth: string): FriendInput => ({
  name,
  birth,
  calendar: 0,
  leapMonth: false,
  time: "",
  unknownTime: true,
});

/** The Figma roster: 민지 invited 김연학, the others joined later. */
const EXAMPLE_FRIENDS: Friend[] = [
  { ...example("민지", "2008.11.09"), addedAt: 1 },
  { ...example("서준", "2008.04.14"), addedAt: 5 },
  { ...example("하린", "2008.05.21"), addedAt: 2 },
  { ...example("도윤", "2008.07.27"), addedAt: 3 },
  { ...example("지우", "2008.03.21"), addedAt: 4 },
];

/** What the static frames show. */
export const FIGMA_STATE: ProtoState = {
  inviter: EXAMPLE_FRIENDS[0],
  friends: EXAMPLE_FRIENDS,
  rosterSeenAt: 4,
  name: "김연학",
  birth: "2008.03.15",
  gender: 0,
  calendar: 0,
  leapMonth: false,
  time: "",
  unknownTime: true,
  analyzed: true,
  loggedIn: true,
  agreedTerms: true,
  afterLogin: "9-1",
  afterInput: null,
  product: "compat",
  plan: "single",
  universities: ["연세대학교", "고려대학교", "한양대학교"],
  relation: "선배",
  payMethod: "card",
  purchased: { compat: true, benefactor: true, charm: false },
  charmRerolls: 2,
  friend: friendKey(EXAMPLE_FRIENDS[0]),
  loginPending: false,
  account: null,
  savedResult: null,
  checkout: null,
  pendingOrder: null,
  orders: {},
};

/** A first-time visitor. */
export const INITIAL_STATE: ProtoState = {
  ...FIGMA_STATE,
  inviter: null,
  friends: [],
  rosterSeenAt: 0,
  name: "",
  birth: "",
  unknownTime: false,
  analyzed: false,
  loggedIn: false,
  agreedTerms: false,
  universities: [],
  purchased: { compat: false, benefactor: false, charm: false },
  charmRerolls: 3,
};

export function orderPrice(s: Pick<ProtoState, "product" | "plan">): number {
  return s.plan === "package" ? PACKAGE_PRICE : PRODUCTS[s.product].price;
}

export function orderTitle(s: Pick<ProtoState, "product" | "plan">): string {
  return s.plan === "package" ? "3종 패키지" : PRODUCTS[s.product].single;
}

/**
 * The extra-info steps before 결제 (7-3) — the screens number them
 * "1 / 2" and "2 / 2", so 지원 대학 / 관계 유형 come before payment.
 */
export function purchaseSteps(s: Pick<ProtoState, "product" | "plan">): string[] {
  if (s.plan === "package") return ["7-1", "7-2", "7-3b"];
  if (s.product === "compat") return ["7-1", "7-3"];
  if (s.product === "benefactor") return ["7-2", "7-3"];
  return ["7-3"];
}

export function stepLabel(s: Pick<ProtoState, "product" | "plan">, screen: string): string {
  const steps = purchaseSteps(s);
  const title = s.plan === "package" ? "3종 패키지" : PRODUCTS[s.product].name;
  const current = screen === "7-3" && s.plan === "package" ? "7-3b" : screen;
  return `${title} · ${steps.indexOf(current) + 1} / ${steps.length}`;
}

/**
 * Where 구매하기 leads, from the app or a public product page: through 카카오
 * login and, when birth info is missing, 정보 입력 — then on into the steps.
 */
export function preparePurchase(state: ProtoState, product: ProductKind, plan = state.plan) {
  const next = purchaseSteps({ product, plan })[0];
  const hasProfile = state.name.trim() !== "" && !birthError(selfAsFriend(state));
  const target = hasProfile ? next : "2-1";
  return {
    state: { ...state, product, plan, afterInput: hasProfile ? null : next, afterLogin: target },
    // Logged in without 약관 (backend on): straight to the sheet, not 카카오 again.
    screen: !state.loggedIn ? "2-4" : state.agreedTerms ? target : "2-5",
  };
}

/**
 * Switches that force the failure / empty branches. Nothing turns them on in
 * the app (they stay off); `slowAnalysis` and `payFail` are one-shot: the
 * branch they force consumes them, so a retry then succeeds.
 */
export type DemoFlags = {
  slowAnalysis: boolean;
  payFail: boolean;
  emptyRoster: boolean;
};

export const INITIAL_DEMO: DemoFlags = {
  slowAnalysis: false,
  payFail: false,
  emptyRoster: false,
};

/** 4-1 once the 명단 has anyone on it, otherwise the empty roster. */
export function rosterScreen(proto: Pick<Proto, "state" | "demo">): string {
  return proto.state.friends.length > 0 && !proto.demo.emptyRoster ? "4-1" : "4-2";
}

/** Me, as a friend's 명단 would hold me. */
export function selfAsFriend(s: ProtoState): FriendInput {
  const { birth, calendar, leapMonth, time, unknownTime } = s;
  return { name: displayName(s), birth, calendar, leapMonth, time, unknownTime };
}

/**
 * The link a friend receives: it opens the invite landing (1-2) with me as
 * the inviter. Without a valid birth yet, it is a plain link to the app.
 * NEXT_PUBLIC_SITE_URL pins the deployed address; otherwise this origin.
 */
export function inviteUrl(s: ProtoState): string {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || window.location.origin;
  const self = selfAsFriend(s);
  return birthError(self) ? origin : `${origin}/?invite=${encodeInvite(self)}`;
}

/** 카카오톡 / 인스타그램 / 페이스북 in-app browsers. */
export function isInAppBrowser(): boolean {
  return detectApp(navigator.userAgent) !== "none";
}

export function displayName(s: Pick<ProtoState, "name">): string {
  return s.name.trim() || "김연학";
}

export type Proto = {
  /** True only inside the prototype shell. */
  active: boolean;
  state: ProtoState;
  update: (patch: Partial<ProtoState>) => void;
  demo: DemoFlags;
  setDemo: (patch: Partial<DemoFlags>) => void;
  /** Push a screen. `pop` drops that many entries first. */
  go: (id: string, opts?: { pop?: number }) => void;
  replace: (id: string) => void;
  back: () => void;
  /** Pop back to the most recent `id` in the stack, or replace with it. */
  backTo: (id: string) => void;
  /** Clear the stack and start at `id`. */
  reset: (id: string, patch?: Partial<ProtoState>) => void;
  toast: (text: string) => void;
  openMenu: () => void;
  closeMenu: () => void;
  /** Open a product's detail page with the single plan selected. */
  openProduct: (kind: ProductKind, plan?: Plan) => void;
  /** Start buying `kind`, keeping it through login and any missing 정보 입력. */
  beginPurchase: (kind: ProductKind) => void;
  /** Go to `target`, routing through 카카오 login first if needed. */
  requireLogin: (target: string) => void;
  /** With the backend on: leave for the real 카카오 login, resuming at `afterLogin`. */
  login: () => void;
  /** Merge `patch` and write the saved session now, before the page is left (PG window). */
  saveNow: (patch: Partial<ProtoState>) => void;
};

const noop = () => {};

const STATIC_PROTO: Proto = {
  active: false,
  state: FIGMA_STATE,
  update: noop,
  demo: INITIAL_DEMO,
  setDemo: noop,
  go: noop,
  replace: noop,
  back: noop,
  backTo: noop,
  reset: noop,
  toast: noop,
  openMenu: noop,
  closeMenu: noop,
  openProduct: noop,
  beginPurchase: noop,
  requireLogin: noop,
  login: noop,
  saveNow: noop,
};

export const ProtoContext = createContext<Proto>(STATIC_PROTO);

export function useProto(): Proto {
  return useContext(ProtoContext);
}
