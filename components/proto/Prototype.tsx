"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Dim } from "@/components/layout/BottomSheet";
import { DemoPanel } from "@/components/proto/DemoPanel";
import { DrawerPanel } from "@/components/screens/09-locker/MenuDrawer";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import {
  INITIAL_DEMO,
  INITIAL_STATE,
  PRODUCTS,
  ProtoContext,
  isInAppBrowser,
  type DemoFlags,
  type Proto,
  type ProtoState,
} from "@/lib/proto";
import { ALL_SCREENS as SCREENS, SECTIONS } from "@/lib/screens";

const SCREEN_IDS = new Set(SCREENS.map((s) => s.id));
/** Screens that are a bottom sheet over another screen: they animate themselves. */
const SHEETS = new Set(["2-5", "4-3", "9-4", "9-5"]);

type Op = "push" | "pop" | "replace" | "reset";
type Nav = { stack: string[]; op: Op; from?: string };

/** Bump the version whenever the saved shape changes: old saves are dropped. */
const STORAGE_KEY = "yeonhak-proto-v2";
/** Per tab: the in-app browser notice (9-4) opens once, not on every refresh. */
const INAPP_SEEN_KEY = "yeonhak-inapp-seen";
const DESKTOP_MIN_WIDTH = 900;
/** Three status-bar taps within this window open the demo panel. */
const TRIPLE_TAP_MS = 3000;

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
  const demo = { ...INITIAL_DEMO, ...saved.demo };
  if (new URLSearchParams(window.location.search).has("invite")) {
    // A friend's invite link starts a fresh session on the invite landing.
    window.history.replaceState(null, "", window.location.pathname);
    return {
      nav: { stack: ["1-2"], op: "reset" },
      state: { ...INITIAL_STATE, invited: true },
      demo,
    };
  }
  const stack = saved.stack?.filter((id) => SCREEN_IDS.has(id)) ?? [];
  const hash = readHash();
  const state = { ...INITIAL_STATE, ...saved.state };
  if (hash && hash !== stack.at(-1)) {
    const fresh = hash === "1-2" ? { ...INITIAL_STATE, invited: true } : state;
    return { nav: { stack: [hash], op: "reset" }, state: fresh, demo };
  }
  return { nav: { stack: stack.length ? stack : ["1-1"], op: "reset" }, state, demo };
}

function useViewport() {
  const [size, setSize] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));
  useEffect(() => {
    const onResize = () => {
      // Ignore the on-screen keyboard squeezing the viewport (Android).
      const el = document.activeElement;
      if (el instanceof HTMLInputElement && window.innerHeight < size.h) return;
      setSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [size.h]);
  return size;
}

export function Prototype() {
  const [initial] = useState(start);
  const [nav, setNav] = useState<Nav>(initial.nav);
  const [state, setState] = useState<ProtoState>(initial.state);
  const [demo, setDemoState] = useState<DemoFlags>(initial.demo);
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
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

  // The status bar reports every tap; three in a row open the panel.
  const taps = useRef<number[]>([]);
  const openDemo = useCallback(() => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < TRIPLE_TAP_MS), now];
    if (taps.current.length < 3) return;
    taps.current = [];
    setDemoOpen(true);
  }, []);

  const restart = useCallback(
    (invited: boolean) => {
      setDemoOpen(false);
      reset(invited ? "1-2" : "1-1", { ...INITIAL_STATE, invited });
    },
    [reset],
  );

  const show = useCallback(
    (id: string) => {
      setDemoOpen(false);
      go(id);
    },
    [go],
  );

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const openProduct = useCallback<Proto["openProduct"]>(
    (kind, plan = "single") => {
      update({ product: kind, plan });
      go(PRODUCTS[kind].detail);
    },
    [go, update],
  );

  // Per the flow: no login to use the service; only the 보관함 asks for 카카오.
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
      openDemo,
      go,
      replace,
      back,
      backTo,
      reset,
      toast,
      openMenu,
      closeMenu,
      openProduct,
      requireLogin,
    }),
    [state, update, demo, setDemo, openDemo, go, replace, back, backTo, reset, toast, openMenu, closeMenu, openProduct, requireLogin],
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
  // a tick later: on first load and on browser back, Next's router rewrites
  // the URL to its own canonical "/" after this effect.
  useEffect(() => {
    const mirror = setTimeout(() =>
      window.history.replaceState(window.history.state, "", `#${top}`),
    );
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stack: nav.stack, state, demo }));
    } catch {}
    return () => clearTimeout(mirror);
  }, [nav.stack, state, demo, top]);

  const { w, h } = useViewport();
  const desktop = w >= DESKTOP_MIN_WIDTH;
  const scale = desktop ? Math.min(1, (h - 48) / 852) : Math.min(w / 393, h / 852);

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

  const device = (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-bg-base",
        desktop && "rounded-[44px] shadow-[0_24px_80px_rgba(22,26,35,0.28)] ring-[10px] ring-[#161a23]",
      )}
      style={{ width: 393 * scale, height: 852 * scale }}
    >
      <div
        className="absolute left-0 top-0 h-[852px] w-[393px] overflow-hidden"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
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

          {demoOpen && (
            <div className="absolute inset-0">
              <Dim onPress={() => setDemoOpen(false)} />
              <div className="proto-sheet-in absolute bottom-0 left-0 w-full rounded-t-[24px] bg-bg-base px-[24px] pb-[40px] pt-[20px] shadow-sheet">
                <div className="mb-[12px] flex items-center justify-between">
                  <p className="font-serif text-h3-18">데모 패널</p>
                  <button
                    type="button"
                    onClick={() => setDemoOpen(false)}
                    className="proto-tap text-caption-12 text-text-tertiary"
                  >
                    닫기
                  </button>
                </div>
                <DemoPanel demo={demo} onDemo={setDemo} onRestart={restart} onShow={show} />
              </div>
            </div>
          )}

          {toastMsg && (
            <div
              key={toastMsg.key}
              className="proto-toast-in pointer-events-none absolute left-0 top-[640px] flex w-full justify-center"
            >
              <Toast text={toastMsg.text} />
            </div>
          )}
        </ProtoContext.Provider>
      </div>
    </div>
  );

  if (!desktop) {
    return (
      <div className="proto-root fixed inset-0 flex items-center justify-center bg-bg-base">
        {device}
      </div>
    );
  }

  return (
    <div className="proto-root fixed inset-0 flex items-center justify-center gap-[56px] bg-bg-subtle">
      <aside className="flex h-[min(852px,calc(100vh-48px))] w-[280px] flex-col gap-[16px]">
        <div>
          <p className="text-overline-12 text-brand-secondary">PROTOTYPE · 393×852</p>
          <h1 className="mt-[4px] font-serif text-h2-22">연학당 프로토타입</h1>
          <p className="mt-[6px] text-caption-12 text-text-secondary">
            화면 속 버튼을 눌러 유저 플로우대로 이동해요. 휴대폰에서는 화면에 꽉 차게
            보이고, 상태바를 세 번 탭하면 데모 패널이 열려요.
          </p>
        </div>
        <DemoPanel demo={demo} onDemo={setDemo} onRestart={restart} onShow={show} />
        <nav className="screen-scroll min-h-px flex-1 rounded-[16px] border border-line-default bg-surface-default py-[8px]">
          {SECTIONS.map((section) => {
            const screens = section.screens.filter((s) => SCREEN_IDS.has(s.id));
            if (!screens.length) return null;
            return (
              <div key={section.id} className="px-[8px] pb-[6px]">
                <p className="px-[8px] pb-[2px] pt-[8px] text-caption-11 font-bold text-text-tertiary">
                  {section.name}
                </p>
                {screens.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => reset(s.id)}
                    className={cn(
                      "block w-full truncate rounded-[8px] px-[8px] py-[5px] text-left text-caption-12",
                      s.id === top
                        ? "bg-brand-secondary-tint font-bold text-brand-secondary"
                        : "text-text-secondary hover:bg-bg-subtle",
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>
      {device}
    </div>
  );
}
