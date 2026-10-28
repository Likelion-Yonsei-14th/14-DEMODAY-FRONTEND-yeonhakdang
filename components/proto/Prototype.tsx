"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Dim } from "@/components/layout/BottomSheet";
import { SCREEN_WIDTH, ViewportContext } from "@/components/layout/Screen";
import { DrawerPanel } from "@/components/screens/09-locker/MenuDrawer";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import {
  INITIAL_DEMO,
  INITIAL_STATE,
  PRODUCTS,
  ProtoContext,
  isInAppBrowser,
  preparePurchase,
  type DemoFlags,
  type Proto,
  type ProtoState,
} from "@/lib/proto";
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
function start(): { nav: Nav; state: ProtoState; demo: DemoFlags } {
  const restored = restore();
  if (!firstInAppVisit()) return restored;
  return { ...restored, nav: { stack: [...restored.nav.stack, "9-4"], op: "reset" } };
}

/**
 * Restores the last session (so a refresh keeps your place), honouring an
 * invite link (`?invite=1`) or a #id link.
 */
function restore(): { nav: Nav; state: ProtoState; demo: DemoFlags } {
  let saved: Saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {}
  // No panel sets these any more: a switch left on by an older save would
  // stick, so every session starts with them off.
  const demo = INITIAL_DEMO;
  const params = new URLSearchParams(window.location.search);
  if (params.get("checkout") === "1") {
    const product = params.get("product");
    if (product === "compat" || product === "benefactor" || product === "charm") {
      const entry = preparePurchase(
        { ...INITIAL_STATE, ...saved.state }, product,
        params.get("plan") === "package" ? "package" : "single",
      );
      return { nav: { stack: [PRODUCTS[product].detail, entry.screen], op: "reset" }, state: entry.state, demo };
    }
  }
  if (params.get("invite") === "1") {
    // A friend's invite link starts a fresh session on the invite landing.
    return {
      nav: { stack: ["1-2"], op: "reset" },
      state: { ...INITIAL_STATE, invited: true, inviterName: params.get("from")?.trim().slice(0, 20) || "친구" },
      demo,
    };
  }
  const stack = saved.stack?.filter((id) => SCREEN_IDS.has(id)) ?? [];
  const hash = readHash();
  const state = { ...INITIAL_STATE, ...saved.state };
  if (hash === "7-3b") state.plan = "package";
  if (hash && hash !== stack.at(-1)) {
    const fresh = hash === "1-2" ? { ...INITIAL_STATE, invited: true } : state;
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
  const [toastMsg, setToastMsg] = useState<{ text: string; key: number } | null>(null);

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

  const setDemo = useCallback((patch: Partial<DemoFlags>) => {
    setDemoState((d) => ({ ...d, ...patch }));
  }, []);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const openProduct = useCallback<Proto["openProduct"]>(
    (kind, plan = "single") => {
      update({ product: kind, plan });
      go(PRODUCTS[kind].detail);
    },
    [go, update],
  );

  const beginPurchase = useCallback<Proto["beginPurchase"]>((kind) => {
    const entry = preparePurchase(stateRef.current, kind);
    update(entry.state);
    go(entry.screen);
  }, [go, update]);

  // Free analysis stays public; the locker and purchase entry ask for login.
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
    }),
    [state, update, demo, setDemo, go, replace, back, backTo, reset, toast, openMenu, closeMenu, openProduct, beginPurchase, requireLogin],
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
      if (window.location.hash !== `#${top}` || window.location.search) {
        window.history.replaceState(window.history.state, "", `${window.location.pathname}#${top}`);
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
