"use client";

import { createContext, useContext } from "react";

import { PACKAGE_PRICE, PRODUCTS, type ProductKind } from "@/lib/catalog";
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
  /** The product currently being viewed / bought. */
  product: ProductKind;
  plan: Plan;
  universities: string[];
  relation: Relation;
  payMethod: "kakao" | "toss";
  purchased: Record<ProductKind, boolean>;
  charmRerolls: number;
  /** friendKey of the friend whose 궁합 sheet (4-3) is open. */
  friend: string;
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
  product: "compat",
  plan: "single",
  universities: ["연세대학교", "고려대학교", "한양대학교"],
  relation: "선배",
  payMethod: "kakao",
  purchased: { compat: true, benefactor: true, charm: false },
  charmRerolls: 2,
  friend: friendKey(EXAMPLE_FRIENDS[0]),
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
  if (s.plan === "package") return ["7-1", "7-2", "7-3"];
  if (s.product === "compat") return ["7-1", "7-3"];
  if (s.product === "benefactor") return ["7-2", "7-3"];
  return ["7-3"];
}

export function stepLabel(s: Pick<ProtoState, "product" | "plan">, screen: string): string {
  const steps = purchaseSteps(s);
  const title = s.plan === "package" ? "3종 패키지" : PRODUCTS[s.product].name;
  return `${title} · ${steps.indexOf(screen) + 1} / ${steps.length}`;
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
 */
export function inviteUrl(s: ProtoState): string {
  const self = selfAsFriend(s);
  return birthError(self)
    ? window.location.origin
    : `${window.location.origin}/?invite=${encodeInvite(self)}`;
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
  requireLogin: noop,
};

export const ProtoContext = createContext<Proto>(STATIC_PROTO);

export function useProto(): Proto {
  return useContext(ProtoContext);
}
