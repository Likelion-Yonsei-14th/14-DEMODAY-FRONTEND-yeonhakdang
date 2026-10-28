"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Dim } from "@/components/layout/BottomSheet";
import { SCREEN_WIDTH, ViewportContext } from "@/components/layout/Screen";
import { DrawerPanel } from "@/components/screens/09-locker/MenuDrawer";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import {
  ApiError,
  LOGIN_PATH,
  USE_BACKEND,
  checkoutReturn,
  confirmation,
  errorMessage,
  getMe,
  getPolicies,
  getProducts,
  hasRequiredConsents,
  onUnauthorized,
  priceMismatches,
} from "@/lib/backend";
import { PACKAGE_PRICE } from "@/lib/catalog";
import { confirmOrder, syncLocker } from "@/lib/checkout";
import { addFriend, decodeInvite, friendKey } from "@/lib/friends";
import {
  INITIAL_DEMO,
  INITIAL_STATE,
  PRODUCTS,
  ProtoContext,
  FIGMA_STATE,
  isInAppBrowser,
  preparePurchase,
  selfAsFriend,
  type DemoFlags,
  type Proto,
  type ProtoState,
} from "@/lib/proto";
import { analyzeBirth } from "@/lib/saju";
import { ALL_SCREENS as SCREENS } from "@/lib/screens";

const SCREEN_IDS = new Set(SCREENS.map((s) => s.id));
/** Screens that are a bottom sheet over another screen: they animate themselves. */
const SHEETS = new Set(["2-5", "4-3", "9-4", "9-5"]);

type Op = "push" | "pop" | "replace" | "reset";
type Nav = { stack: string[]; op: Op; from?: string };

/** Bump the version whenever the saved shape changes: old saves are dropped. */
const STORAGE_KEY = "yeonhak-proto-v2";
/** Per tab: the in-app browser notice (9-4) opens once, not on every refresh. */
const INAPP_SEEN_KEY = "yeonhak-inapp-seen";
/** Up to this width the app fills the screen; wider, it is a centred column… */
const MOBILE_MAX_WIDTH = 480;
/** …this wide. */
const DESKTOP_APP_WIDTH = 430;

/** The #id in the URL; an unknown one is the 404 frame. */
function readHash(): string | undefined {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return undefined;
  return SCREEN_IDS.has(id) ? id : "9-3";
}

type Saved = { stack?: string[]; state?: ProtoState; demo?: DemoFlags };
type Start = { nav: Nav; state: ProtoState; demo: DemoFlags; /** A toast to raise on load. */ notice?: string };

/** Opened inside 카카오톡 / 인스타그램: the 9-4 notice, once per tab. */
function firstInAppVisit(): boolean {
  if (!isInAppBrowser()) return false;
  try {
    if (sessionStorage.getItem(INAPP_SEEN_KEY)) return false;
    sessionStorage.setItem(INAPP_SEEN_KEY, "1");
  } catch {}
  return true;
}

/** The restored session, with the in-app notice laid over it when due. */
function start(): Start {
  const restored = restore();
  if (!firstInAppVisit()) return restored;
  return { ...restored, nav: { stack: [...restored.nav.stack, "9-4"], op: "reset" } };
}

/**
 * Restores the last session (so a refresh keeps your place), honouring an
 * invite link (`?invite=<code>`) or a #id link.
 */
function restore(): Start {
  let saved: Saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {}
  // No panel sets these any more: a switch left on by an older save would
  // stick, so every session starts with them off.
  const demo = INITIAL_DEMO;
  const stack = saved.stack?.filter((id) => SCREEN_IDS.has(id)) ?? [];
  const hash = readHash();
  const state = { ...INITIAL_STATE, ...saved.state };
  const params = new URLSearchParams(window.location.search);
  // Back from the PG page: the server confirms the order (see Prototype).
  const returned = checkoutReturn(window.location.search);
  if (USE_BACKEND && returned) {
    window.history.replaceState(null, "", window.location.pathname);
    const pay = state.plan === "package" ? "7-3b" : "7-3";
    return { nav: { stack: [pay], op: "reset" }, state: { ...state, pendingOrder: returned }, demo };
  }
  // 구매하기 on a public page (`/?checkout=1&product=…&plan=…`): straight into
  // that product's purchase, past its detail screen.
  if (params.get("checkout") === "1") {
    window.history.replaceState(null, "", window.location.pathname);
    const product = params.get("product");
    if (product === "compat" || product === "benefactor" || product === "charm") {
      const plan = params.get("plan") === "package" ? "package" : "single";
      const entry = preparePurchase(state, product, plan);
      return { nav: { stack: [PRODUCTS[product].detail, entry.screen], op: "reset" }, state: entry.state, demo };
    }
  }
  if (params.has("invite")) {
    window.history.replaceState(null, "", window.location.pathname);
    // A broken or old (`?invite=1`) link falls through to the usual start.
    const inviter = decodeInvite(params.get("invite"));
    const self = selfAsFriend(state);
    if (inviter && friendKey(inviter) !== friendKey(self)) {
      // Already analyzed: keep my result, just put the inviter on my 명단.
      if (state.analyzed && analyzeBirth(self).ok) {
        return {
          nav: { stack: ["4-1"], op: "reset" },
          state: { ...state, friends: addFriend(state.friends, inviter, Date.now()) },
          demo,
          notice: `${inviter.name}님이 합격자 명단에 등록됐어요`,
        };
      }
      // Otherwise a fresh session on the invite landing.
      return { nav: { stack: ["1-2"], op: "reset" }, state: { ...INITIAL_STATE, inviter }, demo };
    }
  }
  if (hash && hash !== stack.at(-1)) {
    const fresh = hash === "1-2" ? { ...INITIAL_STATE, inviter: FIGMA_STATE.inviter } : state;
    if (hash === "7-3b") fresh.plan = "package";
    return { nav: { stack: [hash], op: "reset" }, state: fresh, demo };
  }
  return { nav: { stack: stack.length ? stack : ["1-1"], op: "reset" }, state, demo };
}

/** The iPhone notch / home bar insets, read off a probe styled with env(). */
function readSafeArea(probe: HTMLElement | null): { top: number; bottom: number } {
  if (!probe) return { top: 0, bottom: 0 };
  const style = getComputedStyle(probe);
  return { top: parseFloat(style.paddingTop) || 0, bottom: parseFloat(style.paddingBottom) || 0 };
}

function useViewport(probe: HTMLElement | null) {
  const [size, setSize] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
    safe: { top: 0, bottom: 0 },
  }));
  useEffect(() => {
    const onResize = () => {
      // Ignore the on-screen keyboard squeezing the viewport (Android).
      const el = document.activeElement;
      if (el instanceof HTMLInputElement && window.innerHeight < size.h) return;
      setSize({ w: window.innerWidth, h: window.innerHeight, safe: readSafeArea(probe) });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [size.h, probe]);
  return size;
}

export function Prototype() {
  const [initial] = useState(start);
  const [nav, setNav] = useState<Nav>(initial.nav);
  const [state, setState] = useState<ProtoState>(initial.state);
  const [demo, setDemoState] = useState<DemoFlags>(initial.demo);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; key: number } | null>(() =>
    initial.notice ? { text: initial.notice, key: 0 } : null,
  );

  // Callbacks read the latest values through refs so they can stay stable.
  const stateRef = useRef(state);
  const navRef = useRef(nav);
  const menuRef = useRef(menuOpen);
  useEffect(() => {
    stateRef.current = state;
    navRef.current = nav;
    menuRef.current = menuOpen;
  });

  const top = nav.stack[nav.stack.length - 1];

  const update = useCallback((patch: Partial<ProtoState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  // Every navigation closes the drawer: a new screen never inherits it.
  const go = useCallback((id: string, opts?: { pop?: number }) => {
    setMenuOpen(false);
    setNav((n) => {
      const keep = Math.max(0, n.stack.length - (opts?.pop ?? 0));
      return { stack: [...n.stack.slice(0, keep), id], op: "push", from: n.stack.at(-1) };
    });
  }, []);

  const replace = useCallback((id: string) => {
    setMenuOpen(false);
    setNav((n) => ({ stack: [...n.stack.slice(0, -1), id], op: "replace", from: n.stack.at(-1) }));
  }, []);

  const back = useCallback(() => {
    setNav((n) =>
      n.stack.length > 1
        ? { stack: n.stack.slice(0, -1), op: "pop", from: n.stack.at(-1) }
        : n,
    );
  }, []);

  const backTo = useCallback((id: string) => {
    setMenuOpen(false);
    setNav((n) => {
      const i = n.stack.lastIndexOf(id);
      return i >= 0
        ? { stack: n.stack.slice(0, i + 1), op: "pop", from: n.stack.at(-1) }
        : { stack: [...n.stack.slice(0, -1), id], op: "replace", from: n.stack.at(-1) };
    });
  }, []);

  const reset = useCallback((id: string, patch?: Partial<ProtoState>) => {
    setMenuOpen(false);
    if (patch) setState((s) => ({ ...s, ...patch }));
    setNav((n) => ({ stack: [id], op: "reset", from: n.stack.at(-1) }));
  }, []);

  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toast = useCallback((text: string) => {
    clearTimeout(toastTimer.current);
    setToastMsg({ text, key: Date.now() });
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  // A notice raised on load (an invite opened after my analysis) times out too.
  useEffect(() => {
    if (initial.notice) toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, [initial.notice]);

  const setDemo = useCallback((patch: Partial<DemoFlags>) => {
    setDemoState((d) => ({ ...d, ...patch }));
  }, []);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Before leaving the page (카카오, PG window): the mirror effect below would
  // run too late, so merge the patch and write the saved session right away.
  const saveNow = useCallback((patch: Partial<ProtoState>) => {
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stack: navRef.current.stack, state: next, demo: INITIAL_DEMO }));
    } catch {}
  }, []);

  const login = useCallback(() => {
    saveNow({ loginPending: true });
    window.location.assign(LOGIN_PATH);
  }, [saveNow]);

  // Any call that finds the session gone (expired, logged out elsewhere) logs this tab out.
  useEffect(() => {
    if (!USE_BACKEND) return;
    onUnauthorized(() => update({ loggedIn: false, agreedTerms: false, account: null }));
    return () => onUnauthorized(null);
  }, [update]);

  // With the backend on, the server's session decides 로그인 · 약관 · 보유 상품.
  // It also finishes what sent the visitor away: 카카오 login (which always
  // returns to #9-1) and a mobile PG page (which returns with ?checkoutOrder=).
  useEffect(() => {
    if (!USE_BACKEND) return;
    let cancelled = false;
    const confirm = async (orderId: string) => {
      // A 502 is "PortOne did not answer", not "failed": ask again a few times.
      for (let attempt = 0; ; attempt++) {
        try {
          return await confirmOrder(orderId, update);
        } catch (error) {
          if (!(error instanceof ApiError && error.status === 502) || attempt === 2) throw error;
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    };
    (async () => {
      const s = stateRef.current;
      try {
        const me = await getMe();
        if (cancelled) return;
        if (!me) {
          update({ loggedIn: false, agreedTerms: false, loginPending: false, account: null, purchased: { compat: false, benefactor: false, charm: false }, orders: {} });
          if (s.loginPending) toast("로그인하지 못했어요. 다시 시도해 주세요.");
          if (s.pendingOrder) {
            update({ pendingOrder: null });
            toast("로그인이 풀려서 결제를 확인하지 못했어요. 구매 내역에서 확인해 주세요.");
          }
          return;
        }
        const agreed = hasRequiredConsents(me, await getPolicies());
        update({ loggedIn: true, agreedTerms: agreed, loginPending: false, account: me.id });
        await syncLocker(update);
        if (cancelled) return;
        if (s.pendingOrder) {
          update({ pendingOrder: null });
          const result = confirmation(await confirm(s.pendingOrder.id));
          if (cancelled) return;
          if (result === "paid") return replace("7-4");
          if (result === "pending") {
            // Money may have moved: show the order, never 결제 실패.
            toast("결제를 확인하고 있어요. 구매 내역에서 상태를 확인해 주세요.");
            return replace("10-2");
          }
          if (s.pendingOrder.message) toast(s.pendingOrder.message);
          replace("7-5");
        } else if (s.loginPending) {
          if (!agreed) return replace("2-5");
          if (s.afterLogin !== navRef.current.stack.at(-1)) replace(s.afterLogin);
          toast("카카오로 로그인했어요");
        }
      } catch (error) {
        if (!cancelled) toast(errorMessage(error));
      }
    })();
    // Prices on screen come from the catalog; the server's are what it charges.
    if (process.env.NODE_ENV !== "production") {
      const shown = { ...Object.fromEntries(Object.entries(PRODUCTS).map(([k, p]) => [k, p.price])), package: PACKAGE_PRICE };
      getProducts()
        .then((server) => {
          const off = priceMismatches(server, shown as Parameters<typeof priceMismatches>[1]);
          if (off.length) console.warn(`[연학당] 화면 가격과 서버 가격이 달라요 — ${off.join(", ")}`);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [update, replace, toast]);

  const openProduct = useCallback<Proto["openProduct"]>(
    (kind, plan = "single") => {
      update({ product: kind, plan });
      go(PRODUCTS[kind].detail);
    },
    [go, update],
  );

  const beginPurchase = useCallback<Proto["beginPurchase"]>(
    (kind) => {
      const entry = preparePurchase(stateRef.current, kind);
      update(entry.state);
      go(entry.screen);
    },
    [go, update],
  );

  // The free analysis needs no login; the 보관함 and 구매 ask for 카카오.
  const requireLogin = useCallback(
    (target: string) => {
      if (stateRef.current.loggedIn) return go(target);
      update({ afterLogin: target });
      go("2-4");
    },
    [go, update],
  );

  const proto = useMemo<Proto>(
    () => ({
      active: true,
      state,
      update,
      demo,
      setDemo,
      go,
      replace,
      back,
      backTo,
      reset,
      toast,
      openMenu,
      closeMenu,
      openProduct,
      beginPurchase,
      requireLogin,
      login,
      saveNow,
    }),
    [state, update, demo, setDemo, go, replace, back, backTo, reset, toast, openMenu, closeMenu, openProduct, beginPurchase, requireLogin, login, saveNow],
  );

  // Browser / gesture back pops the prototype stack: a sentinel history entry
  // is re-armed after every in-app pop.
  useEffect(() => {
    if (!window.history.state?.yeonhakProto) {
      window.history.pushState({ yeonhakProto: true }, "", window.location.href);
    }
    const onPop = () => {
      if (menuRef.current) setMenuOpen(false);
      else if (navRef.current.stack.length > 1) back();
      else return; // At the root: let the browser leave the prototype.
      window.history.pushState({ yeonhakProto: true }, "", window.location.href);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [back]);

  // Mirror the place into the URL hash and local storage. The hash is written
  // later and re-checked: on first load and on browser back, Next's router
  // rewrites the URL to its own canonical "/" some time after this effect.
  useEffect(() => {
    const mirror = () => {
      if (window.location.hash !== `#${top}`) {
        window.history.replaceState(window.history.state, "", `#${top}`);
      }
    };
    const timers = [0, 150, 400, 1000].map((ms) => setTimeout(mirror, ms));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stack: nav.stack, state, demo }));
    } catch {}
    return () => timers.forEach(clearTimeout);
  }, [nav.stack, state, demo, top]);

  const [probe, setProbe] = useState<HTMLDivElement | null>(null);
  const { w, h, safe } = useViewport(probe);
  // Fill a phone edge to edge; on a wider screen, a phone-width column.
  const width = w <= MOBILE_MAX_WIDTH ? w : DESKTOP_APP_WIDTH;
  const scale = width / SCREEN_WIDTH;
  const viewport = useMemo(
    () => ({ height: h / scale, safeTop: safe.top / scale, safeBottom: safe.bottom / scale }),
    [h, scale, safe.top, safe.bottom],
  );

  const current = SCREENS.find((s) => s.id === top) ?? SCREENS[0];
  const { Component } = current;

  const enter =
    SHEETS.has(top) && nav.op === "push"
      ? ""
      : nav.op === "pop" && nav.from && SHEETS.has(nav.from)
        ? ""
        : nav.op === "push"
          ? "proto-push"
          : nav.op === "pop"
            ? "proto-pop"
            : nav.op === "replace" || nav.from
              ? "proto-fade"
              : "";

  return (
    <div
      className={cn(
        "proto-root fixed inset-0 flex justify-center",
        w <= MOBILE_MAX_WIDTH ? "bg-bg-base" : "bg-bg-subtle",
      )}
    >
      <div
        ref={setProbe}
        aria-hidden
        className="pointer-events-none invisible fixed"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      />
      <div className="relative shrink-0 overflow-hidden bg-bg-base" style={{ width, height: h }}>
        <div
          className="absolute left-0 top-0 overflow-hidden"
          style={{
            width: SCREEN_WIDTH,
            height: viewport.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <ViewportContext.Provider value={viewport}>
            <ProtoContext.Provider value={proto}>
              <div key={`${nav.stack.length}-${top}`} className={cn("absolute inset-0", enter)}>
                <Component />
              </div>

              {menuOpen && (
                <div className="absolute inset-0">
                  <Dim onPress={closeMenu} />
                  <DrawerPanel onClose={closeMenu} />
                </div>
              )}

              {toastMsg && (
                <div
                  key={toastMsg.key}
                  className="proto-toast-in pointer-events-none absolute left-0 flex w-full justify-center"
                  // Where the frames place it: 178px above the home indicator.
                  style={{ bottom: 178 + viewport.safeBottom }}
                >
                  <Toast text={toastMsg.text} />
                </div>
              )}
            </ProtoContext.Provider>
          </ViewportContext.Provider>
        </div>
      </div>
    </div>
  );
}
