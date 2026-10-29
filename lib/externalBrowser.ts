/**
 * 9-4 "Safari로 열기": hands the page that was first opened in this tab over
 * from a 카카오톡 / 인스타그램 in-app browser to the phone's own browser.
 * Pure apart from `captureEntryUrl` / `entryUrl` / `openExternalBrowser`, so
 * `npm test` can run it under node.
 */

export type Os = "ios" | "android" | "other";
export type InApp = "kakao" | "instagram" | "none";

export type ExternalPlan = {
  os: Os;
  app: InApp;
  /** Where the button navigates; null means there is no scheme to try, only the guide. */
  href: string | null;
  label: string;
  /** The 방법 box: its icon glyph and the manual steps. */
  guide: { icon: string; text: string };
};

export function detectOs(ua: string): Os {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

/** Same test as `isInAppBrowser` in lib/proto; 페이스북 is treated as 인스타그램 (same Meta webview). */
export function detectApp(ua: string): InApp {
  if (/KAKAOTALK/i.test(ua)) return "kakao";
  if (/Instagram|FBAN|FBAV/i.test(ua)) return "instagram";
  return "none";
}

const GUIDE = {
  kakaoAndroid: { icon: "⋮", text: "오른쪽 아래 ⋮ → 다른 브라우저로 열기" },
  kakaoIos: { icon: "⋯", text: "오른쪽 아래 메뉴 → Safari로 열기" },
  instagram: { icon: "⋯", text: "오른쪽 위 ⋯ → 외부 브라우저에서 열기" },
  other: { icon: "⋯", text: "오른쪽 위 ⋯ 메뉴 → ‘다른 브라우저로 열기’" },
};

/** Chrome on Android; S.browser_fallback_url covers phones without it. */
function chromeIntent(url: string): string {
  const u = new URL(url);
  // The fragment can't ride in the intent path (# starts the Intent part); the fallback keeps it.
  return (
    `intent://${u.host}${u.pathname}${u.search}` +
    `#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`
  );
}

export function externalBrowserPlan(ua: string, url: string): ExternalPlan {
  const os = detectOs(ua);
  const app = detectApp(ua);
  const label = os === "ios" ? "Safari로 열기" : "브라우저로 열기";
  if (app === "kakao") {
    return {
      os,
      app,
      href: `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`,
      label,
      guide: os === "android" ? GUIDE.kakaoAndroid : GUIDE.kakaoIos,
    };
  }
  if (app === "instagram") {
    // iOS: `x-safari-https://…` is an undocumented Safari scheme. It works in
    // some 인스타그램 / iOS versions and silently does nothing in others, so
    // openExternalBrowser watches for the page staying visible and falls back
    // to the manual guide.
    const href = os === "android" ? chromeIntent(url) : os === "ios" ? `x-safari-${url}` : null;
    return { os, app, href, label, guide: GUIDE.instagram };
  }
  return { os, app, href: null, label, guide: GUIDE.other };
}

/** Per tab: the address this tab was first opened at, before Prototype clears its query. */
const ENTRY_URL_KEY = "yeonhak-entry-url";
/** Back from the PG page: replaying these in another browser would confirm the order again. */
const CHECKOUT_RETURN_PARAMS = ["checkoutOrder", "code", "message"];

let entry: string | undefined;

type Storage = Pick<globalThis.Storage, "getItem" | "setItem">;

function withoutCheckoutReturn(href: string): string {
  const u = new URL(href);
  if (!u.searchParams.has("checkoutOrder")) return href;
  for (const key of CHECKOUT_RETURN_PARAMS) u.searchParams.delete(key);
  return u.toString();
}

/**
 * Keeps the address this tab was opened at. A load with a query (an invite or
 * 구매하기 link) replaces it; a bare one — the refresh after Prototype cleared
 * the query — keeps the saved one, so the invite survives. Call before
 * anything rewrites the URL.
 */
export function captureEntryUrl(href: string, storage?: Storage): void {
  const current = withoutCheckoutReturn(href);
  let saved: string | null | undefined;
  try {
    saved = storage?.getItem(ENTRY_URL_KEY);
  } catch {}
  entry = new URL(current).search ? current : (saved ?? current);
  try {
    storage?.setItem(ENTRY_URL_KEY, entry);
  } catch {}
}

/** The captured address, or the current one when nothing was captured. */
export function entryUrl(fallback: string): string {
  return entry ?? fallback;
}

/** Only for tests. */
export function resetEntryUrl(): void {
  entry = undefined;
}

/** How long a page that is still visible counts as "the jump failed". */
export const LEAVE_TIMEOUT_MS = 1500;

/**
 * Tries `plan.href`. If the page goes hidden within LEAVE_TIMEOUT_MS the other
 * browser opened (`onLeft`); if it is still visible, nothing happened
 * (`onStayed`) and the user needs the manual steps. Returns a cancel.
 */
export function openExternalBrowser(
  plan: ExternalPlan,
  on: { onLeft: () => void; onStayed: () => void },
): () => void {
  if (!plan.href) {
    on.onStayed();
    return () => {};
  }
  const onVisibility = () => {
    if (document.visibilityState !== "hidden") return;
    cancel();
    on.onLeft();
  };
  const timer = setTimeout(() => {
    cancel();
    if (document.visibilityState === "visible") on.onStayed();
    else on.onLeft();
  }, LEAVE_TIMEOUT_MS);
  function cancel() {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibility);
  }
  document.addEventListener("visibilitychange", onVisibility);
  window.location.href = plan.href;
  return cancel;
}
