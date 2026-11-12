"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { verifyUnlockCode } from "@/app/actions/unlock";

import { Dim } from "@/components/layout/BottomSheet";
import { SCREEN_WIDTH, ViewportContext } from "@/components/layout/Screen";
import { RosterLoginGate } from "@/components/screens/04-roster/RosterLoginGate";
import { DrawerPanel } from "@/components/screens/09-locker/MenuDrawer";
import { Toast } from "@/components/ui/Toast";
import { trackInviteOpen, trackPurchaseClick, trackResultView, trackScreen } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { analysisProfile, profileToRestore, ProfileWriter, registerProfileFlush, flushAnalysisProfile } from "@/lib/analysisProfile";
import { freshAnalysis } from "@/lib/analysisSession";
import {
  ApiError,
  LOGIN_PATH,
  USE_BACKEND,
  checkoutReturn,
  confirmation,
  errorMessage,
  getMe,
  getInvitation,
  acceptInvitation,
  getAccountRoster,
  getAnalysisProfile,
  saveAnalysisProfile,
  getPolicies,
  getProducts,
  hasRequiredConsents,
  onUnauthorized,
  priceMismatches,
} from "@/lib/backend";
import { ownedScreen, purchasedDestination } from "@/lib/purchaseAccess";
import { PACKAGE_PRICE } from "@/lib/catalog";
import { confirmOrder, syncLocker } from "@/lib/checkout";
import { captureEntryUrl } from "@/lib/externalBrowser";
import { addFriend, decodeInvite, friendKey, invitationId, mergeRoster } from "@/lib/friends";
import {
  INITIAL_DEMO,
  INITIAL_STATE,
  PRODUCTS,
  ProtoContext,
  FIGMA_STATE,
  isInAppBrowser,
  preparePurchase,
  rosterScreen,
  purchaseSteps,
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
/** The free 학과 결과 screens. */
const RESULTS = new Set(["3-3", "3-4"]);
const MEMBER_ROSTER_SCREENS = new Set(["4-1", "4-2", "4-3", "5-2"]);

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
/** How the visit began, for GA: an invite link, or 구매하기 on a public page. */
type Entry = { kind: "invite" } | { kind: "purchase"; product: string; plan: string };
type Start = {
  nav: Nav;
  state: ProtoState;
  demo: DemoFlags;
  /** A toast to raise on load. */
  notice?: string;
  entry?: Entry;
};

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
  // Before restore() clears ?invite= / ?checkout=: 9-4 hands this address on.
  let tab: Storage | undefined;
  try {
    tab = sessionStorage;
  } catch {}
  captureEntryUrl(window.location.href, tab);
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
      return {
        nav: { stack: [PRODUCTS[product].detail, entry.screen], op: "reset" },
        state: entry.state,
        demo,
        entry: { kind: "purchase", product, plan },
      };
    }
  }
  const pendingInviteId = invitationId(params.get("inviteId"));
  if (params.has("inviteId") && !pendingInviteId) {
    window.history.replaceState(null, "", window.location.pathname);
    return { nav: { stack: state.analyzed ? ["3-4"] : ["1-1"], op: "reset" }, state: { ...state, pendingInviteId: null }, demo, notice: "사용할 수 없는 초대 링크예요." };
  }
  if (pendingInviteId) {
    window.history.replaceState(null, "", window.location.pathname);
    return { nav: { stack: state.analyzed ? ["3-4"] : ["1-1"], op: "reset" }, state: { ...state, pendingInviteId }, demo, entry: { kind: "invite" } };
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
          state: { ...state, inviter, friends: addFriend(state.friends, inviter, Date.now()) },
          demo,
          notice: `${inviter.name}님이 합격자 명단에 등록됐어요`,
          entry: { kind: "invite" },
        };
      }
      // Otherwise a fresh session on the invite landing.
      return { nav: { stack: ["1-2"], op: "reset" }, state: { ...INITIAL_STATE, inviter }, demo, entry: { kind: "invite" } };
    }
  }
  if (hash && hash !== stack.at(-1)) {
    const fresh = hash === "1-2" ? { ...INITIAL_STATE, inviter: FIGMA_STATE.inviter } : state;
    if (hash === "7-3b") fresh.plan = "package";
    return { nav: { stack: [hash], op: "reset" }, state: fresh, demo };
  }
  return { nav: { stack: stack.length ? stack : ["1-1"], op: "reset" }, state, demo };
}

function parentOf(id: string, s: ProtoState): string | null {
  const steps = purchaseSteps(s);
  const i = steps.indexOf(id === "7-3" && s.plan === "package" ? "7-3b" : id);
  if (i > 0) return steps[i - 1];
  if (i === 0) return PRODUCTS[s.product].detail;
  return null;
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

  // GA: how the visit began, once (the ref survives Strict Mode's re-run).
  const entrySent = useRef(false);
  useEffect(() => {
    const entry = initial.entry;
    if (entrySent.current) return;
    entrySent.current = true;
    if (entry?.kind === "invite") trackInviteOpen();
    if (entry?.kind === "purchase") trackPurchaseClick(entry.product, entry.plan);
  }, [initial.entry]);

  // GA: a page_view per screen (lib/analytics drops repeats) and result_view
  // on stepping into the free result.
  const lastTop = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (lastTop.current === top) return;
    const from = lastTop.current;
    lastTop.current = top;
    trackScreen(top, SCREENS.find((s) => s.id === top)?.name ?? top);
    if (RESULTS.has(top) && !(from && RESULTS.has(from))) trackResultView(top);
  }, [top]);

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
    setNav((n) => {
      if (n.stack.length > 1) return { stack: n.stack.slice(0, -1), op: "pop", from: n.stack.at(-1) };
      const parent = parentOf(n.stack[0], stateRef.current);
      return parent ? { stack: [parent], op: "pop", from: n.stack[0] } : n;
    });
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

  const restartAnalysis = useCallback(() => {
    saveNow(freshAnalysis(stateRef.current));
    setMenuOpen(false);
    // Keep the landing behind the fresh input form so back has a real destination.
    setNav((n) => ({ stack: ["1-1", "2-1"], op: "reset", from: n.stack.at(-1) }));
  }, [saveNow]);

  const [accountReady, setAccountReady] = useState(!USE_BACKEND);
  const [accountLoadError, setAccountLoadError] = useState(false);
  const profileSource = useRef(state);
  const profileWriter = useRef<ProfileWriter | null>(null);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [profileReady, setProfileReady] = useState<string | null>(null);

  const login = useCallback(() => {
    saveNow({ loginPending: true });
    window.location.assign(LOGIN_PATH);
  }, [saveNow]);

  // A 이용권 code is checked again on every start: one taken out of UNLOCK_CODES
  // locks this device again. A failed check (offline, server down) keeps it open.
  useEffect(() => {
    const code = stateRef.current.unlockCode;
    if (!code) return;
    let cancelled = false;
    verifyUnlockCode(code)
      .then((ok) => {
        if (cancelled || ok) return;
        update({ unlockCode: null });
        toast("이용권 기간이 끝나 유료 결과가 다시 잠겼어요");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [update, toast]);

  // Any call that finds the session gone (expired, logged out elsewhere) logs this tab out.
  useEffect(() => {
    if (!USE_BACKEND) return;
    onUnauthorized(() => update({ loggedIn: false, agreedTerms: false, account: null, analysisOwner: stateRef.current.analysisOwner ?? stateRef.current.account, purchased: { compat: false, benefactor: false, charm: false }, orders: {}, paidResults: {} }));
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
          setAccountReady(true);
          update({ loggedIn: false, agreedTerms: false, loginPending: false, account: null, analysisOwner: s.analysisOwner ?? s.account, purchased: { compat: false, benefactor: false, charm: false }, orders: {} });
          if (s.loginPending) toast("로그인하지 못했어요. 다시 시도해 주세요.");
          if (s.pendingOrder) {
            update({ pendingOrder: null });
            toast("로그인이 풀려서 결제를 확인하지 못했어요. 구매 내역에서 확인해 주세요.");
          }
          return;
        }
        const agreed = hasRequiredConsents(me, await getPolicies());
        profileSource.current = stateRef.current;
        update({ loggedIn: true, agreedTerms: agreed, loginPending: false, account: me.id, ...(s.account !== me.id ? { paidResults: {} } : {}) });
        const library = await syncLocker((patch) => { if (!cancelled) update(patch); }, me.id, s.account === me.id ? s.orders : {});
        if (cancelled) return;
        if (s.pendingOrder) {
          const result = confirmation(await confirm(s.pendingOrder.id));
          if (cancelled) return;
          update({ pendingOrder: null });
          setAccountReady(true);
          if (result === "paid") return replace("7-4");
          if (result === "pending") {
            // Money may have moved: show the order, never 결제 실패.
            toast("결제를 확인하고 있어요. 구매 내역에서 상태를 확인해 주세요.");
            return replace("10-2");
          }
          if (s.pendingOrder.message) toast(s.pendingOrder.message);
          replace("7-5");
        } else {
          setAccountReady(true);
          if (!s.loginPending) return;
          if (!agreed) return replace("2-5");
          const target = ownedScreen(s.afterLogin, { ...s, purchased: library.purchased });
          if (target !== navRef.current.stack.at(-1)) replace(target);
          toast("카카오로 로그인했어요");
        }
      } catch (error) {
        if (!cancelled) { setAccountReady(false); setAccountLoadError(true); toast(errorMessage(error)); }
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

  // Hydrate once per authenticated account, before any local snapshot can be uploaded.
  useEffect(() => {
    if (!USE_BACKEND || !accountReady || !state.loggedIn || !state.agreedTerms || !state.account) return;
    const account = state.account;
    let cancelled = false;
    let writer: ProfileWriter | null = null;
    Promise.all([getAnalysisProfile(), getAccountRoster()]).then(([remote, roster]) => {
      if (cancelled) return;
      if (remote.accountId !== account || roster.accountId !== account) throw new ApiError(409, "PROFILE_ACCOUNT_CHANGED");
      const local = profileSource.current;
      const restored = profileToRestore(local, remote);
      writer = new ProfileWriter(remote, saveAnalysisProfile);
      profileWriter.current = writer;
      registerProfileFlush((profile) => {
        return profile ? writer!.commit(profile) : writer!.flush();
      });
      if (restored) {
        // Keep an invitation opened in this tab while restoring the account roster.
        const incoming = stateRef.current.inviter;
        const legacy = incoming ? addFriend(restored.friends, incoming, Date.now()) : restored.friends;
        const friends = mergeRoster(legacy, roster.friends);
        update({ ...restored, friends, analysisOwner: account, savedResult: null, friend: "" });
        if (restored.analyzed && stateRef.current.pendingInviteId && ["1-1", "1-2"].includes(navRef.current.stack.at(-1)!)) replace("4-1");
        else if (restored.analyzed && !local.analyzed && navRef.current.stack.at(-1) === "2-1") replace("3-4");
      } else if ((local.analysisOwner ?? local.account) && (local.analysisOwner ?? local.account) !== account) {
        update({ ...freshAnalysis({ ...stateRef.current, account }), friends: mergeRoster([], roster.friends) });
      }
      if (!restored && (!(local.analysisOwner ?? local.account) || (local.analysisOwner ?? local.account) === account)) update({ friends: mergeRoster(local.friends, roster.friends) });
      setProfileReady(account);
    }).catch((error) => {
      if (!cancelled) {
        setProfileLoadError(account);
        toast(`계정 정보를 불러오지 못했어요. ${errorMessage(error)}`);
      }
    });
    return () => {
      cancelled = true;
      writer?.stop();
      profileWriter.current = null;
      registerProfileFlush(null);
      setProfileReady(null);
    };
  }, [accountReady, state.account, state.loggedIn, state.agreedTerms, update, replace, toast]);

  useEffect(() => {
    if (!profileReady || profileReady !== state.account || !state.loggedIn || !state.analyzed || !state.name.trim() || state.name.length > 10 || !analyzeBirth(state).ok) return;
    const writer = profileWriter.current;
    if (!writer) return;
    writer.enqueue(analysisProfile(state));
    void writer.flush().catch((error) => toast(`계정 정보 저장에 실패했어요. ${errorMessage(error)}`));
  }, [state, profileReady, toast]);

  const [invitationReady, setInvitationReady] = useState<string | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  useEffect(() => {
    const token = state.pendingInviteId;
    if (!USE_BACKEND || !token) return;
    let cancelled = false;
    getInvitation(token).then((inviter) => {
      if (cancelled) return;
      const current = stateRef.current;
      const self = friendKey(inviter) === friendKey(selfAsFriend(current));
      const shared = { ...inviter, invitationId: token };
      update({ inviter: self ? null : shared, ...(current.analyzed && !self ? { friends: addFriend(current.friends, shared, Date.now()) } : {}) });
      setInvitationReady(token);
      if (initial.entry?.kind === "invite") replace(current.analyzed ? "4-1" : "1-2");
    }).catch((error) => {
      if (cancelled) return;
      setInvitationError(token);
      toast(error instanceof ApiError && error.status === 404 ? "사용할 수 없는 초대 링크예요." : errorMessage(error));
    });
    return () => { cancelled = true; };
  }, [state.pendingInviteId, initial.entry, update, replace, toast]);

  // Account friendships have their own server records and never overwrite the analysis snapshot.
  useEffect(() => {
    if (!USE_BACKEND || !profileReady || profileReady !== state.account || !state.loggedIn) return;
    let cancelled = false;
    let running = false;
    const refresh = async () => {
      if (running || document.visibilityState === "hidden") return;
      running = true;
      try {
        const roster = await getAccountRoster();
        if (!cancelled && roster.accountId === stateRef.current.account) {
          const friends = mergeRoster(stateRef.current.friends, roster.friends);
          if (JSON.stringify(friends) !== JSON.stringify(stateRef.current.friends)) update({ friends });
        }
      } catch { /* The visible roster is retained while offline; the next refresh retries. */ }
      finally { running = false; }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    const focus = () => void refresh();
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    return () => { cancelled = true; clearInterval(timer); window.removeEventListener("focus", focus); document.removeEventListener("visibilitychange", focus); };
  }, [profileReady, state.account, state.loggedIn, update]);

  // Existing tabs pick up purchases made in another tab or device when revisited.
  useEffect(() => {
    if (!USE_BACKEND || !accountReady || !state.account || !state.loggedIn) return;
    let cancelled = false;
    let running = false;
    const account = state.account;
    const refresh = async () => {
      if (running || document.visibilityState === "hidden") return;
      running = true;
      try {
        await syncLocker((patch) => {
          if (!cancelled && stateRef.current.account === account) update(patch);
        }, account, stateRef.current.orders);
      } catch { /* Retain the last verified ownership; checkout always checks again. */ }
      finally { running = false; }
    };
    const timer = setInterval(() => void refresh(), 15000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { cancelled = true; clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [accountReady, state.account, state.loggedIn, update]);

  const acceptedInvite = useRef<string | null>(null);
  const [inviteRetry, setInviteRetry] = useState(0);
  useEffect(() => {
    const token = state.pendingInviteId;
    if (!token || invitationReady !== token || profileReady !== state.account || !state.loggedIn || !state.agreedTerms || !state.analyzed || !analyzeBirth(state).ok) return;
    const requestKey = `${state.account}/${token}`;
    if (acceptedInvite.current === requestKey) return;
    acceptedInvite.current = requestKey;
    let cancelled = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      try {
        await flushAnalysisProfile(analysisProfile(stateRef.current));
        const result = await acceptInvitation(token);
        if (cancelled || result.accountId !== stateRef.current.account) return;
        update({ pendingInviteId: null, friends: mergeRoster(stateRef.current.friends, result.friends) });
        toast(result.connected ? "서로의 동기 합격자 명단에 등록됐어요" : "내 초대 링크예요");
      } catch (error) {
        if (!cancelled) {
          acceptedInvite.current = null;
          toast(errorMessage(error));
          if (error instanceof ApiError && error.status === 404) update({ pendingInviteId: null });
          else if (!(error instanceof ApiError) || error.status === 0 || error.status >= 500)
            retry = setTimeout(() => setInviteRetry((attempt) => attempt + 1), 5000);
        }
      }
    })();
    return () => { cancelled = true; clearTimeout(retry); if (acceptedInvite.current === requestKey) acceptedInvite.current = null; };
    // Saving or roster refresh changes state while this same acceptance is in flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.pendingInviteId, invitationReady, profileReady, state.account, state.loggedIn, state.agreedTerms, state.analyzed, inviteRetry, update, toast]);

  const openProduct = useCallback<Proto["openProduct"]>(
    (kind, plan = "single") => {
      update({ product: kind, plan });
      go(purchasedDestination(kind, plan, stateRef.current.purchased) ?? PRODUCTS[kind].detail);
    },
    [go, update],
  );

  const beginPurchase = useCallback<Proto["beginPurchase"]>(
    (kind) => {
      const entry = preparePurchase(stateRef.current, kind);
      trackPurchaseClick(kind, entry.state.plan);
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
      restartAnalysis,
      toast,
      openMenu,
      closeMenu,
      openProduct,
      beginPurchase,
      requireLogin,
      login,
      saveNow,
    }),
    [state, update, demo, setDemo, go, replace, back, backTo, reset, restartAnalysis, toast, openMenu, closeMenu, openProduct, beginPurchase, requireLogin, login, saveNow],
  );

  // Browser / gesture back pops the prototype stack: a sentinel history entry
  // is re-armed after every in-app pop.
  useEffect(() => {
    if (!window.history.state?.yeonhakProto) {
      window.history.pushState({ yeonhakProto: true }, "", window.location.href);
    }
    const onPop = () => {
      if (menuRef.current) setMenuOpen(false);
      else if (navRef.current.stack.length > 1 || parentOf(navRef.current.stack[0], stateRef.current)) back();
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
      // The app's external-browser menu uses this URL. Do not send the notice
      // itself into Safari and show the same browser notice there again.
      const hash = top === "9-4" ? "#1-1" : `#${top}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(window.history.state, "", hash);
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

  const renderedScreen = top === "4-1" || top === "4-2" ? rosterScreen({ state, demo }) : ownedScreen(top, state);
  const current = SCREENS.find((s) => s.id === renderedScreen) ?? SCREENS[0];
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
                {MEMBER_ROSTER_SCREENS.has(top) && !state.loggedIn ? <RosterLoginGate target={top} /> : <Component key={["2-1", "2-2", "2-3"].includes(top) ? `${state.account ?? "guest"}/${profileReady ?? "pending"}` : top} />}
              </div>

              {menuOpen && (
                <div className="absolute inset-0">
                  <Dim onPress={closeMenu} />
                  <DrawerPanel onClose={closeMenu} />
                </div>
              )}

              {USE_BACKEND && state.pendingInviteId && invitationReady !== state.pendingInviteId && (
                <div role="status" className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg-base px-6 text-center">
                  <p>{invitationError === state.pendingInviteId ? "초대 링크를 확인하지 못했어요" : "초대 정보를 확인하고 있어요…"}</p>
                  {invitationError === state.pendingInviteId && <>
                    <button type="button" onClick={() => window.location.reload()} className="rounded-[14px] bg-brand-primary px-6 py-3 text-text-inverse">다시 확인하기</button>
                    <button type="button" onClick={() => { update({ pendingInviteId: null, inviter: null }); replace(state.analyzed ? "3-4" : "1-1"); }}>초대 없이 계속하기</button>
                  </>}
                </div>
              )}
              {!accountReady && (
                <div role="status" className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg-base px-6 text-center">
                  <p>{accountLoadError ? "구매 정보를 확인하지 못했어요" : "로그인과 구매 정보를 확인하고 있어요…"}</p>
                  {accountLoadError && <button type="button" onClick={() => window.location.reload()} className="rounded-[14px] bg-brand-primary px-6 py-3 text-text-inverse">다시 불러오기</button>}
                </div>
              )}
              {USE_BACKEND && state.loggedIn && state.agreedTerms && state.account && profileReady !== state.account && (
                <div role="status" className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg-base px-6 text-center">
                  <p className="text-body-l-16">{profileLoadError === state.account ? "계정 정보를 불러오지 못했어요" : "저장된 계정 정보를 불러오고 있어요…"}</p>
                  {profileLoadError === state.account ? (
                    <>
                      <p className="text-body-m-14 text-text-secondary">기존 정보가 덮어써지지 않도록 기다리고 있어요.</p>
                      <button type="button" onClick={() => window.location.reload()} className="rounded-[14px] bg-brand-primary px-6 py-3 text-text-inverse">다시 불러오기</button>
                    </>
                  ) : <div className="proto-spinner size-6 rounded-full border-[3px] border-line-default border-t-text-secondary" />}
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
