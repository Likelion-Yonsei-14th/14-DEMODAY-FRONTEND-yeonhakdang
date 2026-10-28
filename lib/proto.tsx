"use client";

import { createContext, useContext } from "react";

/**
 * Prototype runtime. The shell at `/` provides a live context. Without it
 * (the default below) a screen renders in its static Figma state and taps are
 * no-ops — kept so each screen still matches its frame in isolation.
 */

export type ProductKind = "compat" | "benefactor" | "charm";
export type Plan = "single" | "package";
export type Relation = "선배" | "동기" | "교수님" | "연인";

export type ProtoState = {
  /** Entered through a friend's invite link (1-2). */
  invited: boolean;
  inviterName: string;
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
  payMethod: "card" | "kakao" | "toss";
  purchased: Record<ProductKind, boolean>;
  charmRerolls: number;
  /** Friend whose 궁합 sheet (4-3) is open. */
  friend: string;
};

/** What the static frames show. */
export const FIGMA_STATE: ProtoState = {
  invited: true,
  inviterName: "친구",
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
  friend: "민지",
};

/** A first-time visitor. */
export const INITIAL_STATE: ProtoState = {
  ...FIGMA_STATE,
  invited: false,
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

export const PRODUCTS: Record<
  ProductKind,
  {
    name: string;
    single: string;
    price: number;
    glyph: string;
    detail: string;
    result: string;
  }
> = {
  compat: { name: "합격 궁합", single: "합격 궁합 단건", price: 2900, glyph: "合", detail: "6-1", result: "8-1" },
  benefactor: { name: "귀인", single: "귀인 단건", price: 1900, glyph: "貴", detail: "6-2", result: "8-2" },
  charm: { name: "부적", single: "부적 단건", price: 990, glyph: "符", detail: "6-3", result: "8-3" },
};

export const PACKAGE_PRICE = 3790;

export function won(n: number): string {
  return `${n.toLocaleString("ko-KR")}원`;
}

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

/** Public product pages and the app enter the same purchase flow. */
export function preparePurchase(state: ProtoState, product: ProductKind, plan = state.plan) {
  const next = purchaseSteps({ product, plan })[0];
  const hasProfile = state.name.trim().length >= 2 && /^\d{4}\.\d{2}\.\d{2}$/.test(state.birth)
    && (state.unknownTime || Boolean(state.time));
  const target = hasProfile ? next : "2-1";
  return {
    state: { ...state, product, plan, afterInput: hasProfile ? null : next, afterLogin: target },
    screen: state.loggedIn && state.agreedTerms ? target : "2-4",
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

/** 4-1 for a friend who came through an invite, otherwise the empty roster. */
export function rosterScreen(proto: Pick<Proto, "state" | "demo">): string {
  return proto.state.invited && !proto.demo.emptyRoster ? "4-1" : "4-2";
}

/** The link a friend receives: it opens the invite landing (1-2). */
export function inviteUrl(name = "친구"): string {
  const url = new URL("/", process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("공유 주소 설정을 확인해 주세요.");
  url.searchParams.set("invite", "1");
  url.searchParams.set("from", name.trim().slice(0, 20) || "친구");
  return url.href;
}

/** 카카오톡 / 인스타그램 / 페이스북 in-app browsers. */
export function isInAppBrowser(): boolean {
  return /KAKAOTALK|Instagram|FBAN|FBAV/i.test(navigator.userAgent);
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
  /** Preserve the selected product through login and any missing profile input. */
  beginPurchase: (kind: ProductKind) => void;
  /** Go to `target`, routing through 카카오 login first if needed. */
  requireLogin: (target: string) => void;
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
};

export const ProtoContext = createContext<Proto>(STATIC_PROTO);

export function useProto(): Proto {
  return useContext(ProtoContext);
}
