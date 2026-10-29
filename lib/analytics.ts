/**
 * Google Analytics 4 (gtag.js, loaded by components/analytics/GaTag). Off
 * unless NEXT_PUBLIC_GA_ID is set: then nothing loads and every call here is
 * a no-op.
 *
 * Privacy: events carry screen ids, product kinds and share methods only —
 * never a name, birth date or time, gender, or anything about a friend. The
 * invite link (`?invite=`) encodes the inviter's 이름·생년월일·출생시간, so it
 * is stripped from every address GA is given, and GA only loads once the
 * prototype has dropped it from the URL.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";

export type ShareMethod = "kakao" | "image" | "link" | "instagram_story";

type Params = Record<string, string | number | boolean>;

/** `url` without its invite code; "" for an empty or unparsable one. */
export function stripInvite(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("invite");
    return parsed.toString();
  } catch {
    return "";
  }
}

/** The address still carries an invite code: GA must not load yet. */
export function addressHasInvite(): boolean {
  return new URLSearchParams(window.location.search).has("invite");
}

// gtag.js reads `arguments` objects off the data layer, not plain arrays.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtag(..._args: unknown[]) {
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  w.dataLayer.push(arguments);
}

/** Events sent before gtag is configured, flushed by startGa(). */
const pending: [string, Params][] = [];
let started = false;
let screen: { id: string; name: string } | undefined;

function screenFields(s: { id: string; name: string }): Params {
  const { origin, pathname } = window.location;
  return { page_location: `${origin}${pathname}#${s.id}`, page_title: s.name, screen_id: s.id, screen_name: s.name };
}

/** The prototype has reported its first screen (so the invite is gone from the URL). */
export function screenReported(): boolean {
  return screen !== undefined;
}

/**
 * Before the GA config runs: the page_view it sends reads these instead of
 * the raw address and referrer, and stands for the current screen.
 */
export function primeGa() {
  if (!GA_ID) return;
  gtag("set", {
    page_location: stripInvite(window.location.href),
    page_referrer: stripInvite(document.referrer),
    ...(screen && screenFields(screen)),
  });
}

/** Once the GA config is on the data layer: send what was waiting. */
export function startGa() {
  if (!GA_ID || started) return;
  started = true;
  for (const [name, params] of pending.splice(0)) gtag("event", name, params);
}

function track(name: string, params: Params = {}) {
  if (!GA_ID) return;
  if (started) gtag("event", name, params);
  else pending.push([name, params]);
}

/**
 * A screen change: one page_view per new screen (a repeat of the current one
 * is dropped). Before GA starts only the latest screen is kept — the config's
 * own page_view reports it (see primeGa).
 */
export function trackScreen(id: string, name: string) {
  if (!GA_ID || screen?.id === id) return;
  screen = { id, name };
  if (!started) return;
  const fields = screenFields(screen);
  // Later events (share_click, …) carry the screen they happened on.
  gtag("set", fields);
  gtag("event", "page_view", fields);
}

export const trackAnalysisStart = () => track("analysis_start");
export const trackResultView = (screenId: string) => track("result_view", { screen_id: screenId });
export const trackShareClick = (method: ShareMethod) => track("share_click", { method });
/** Only that an invite was opened — never who sent it. */
export const trackInviteOpen = () => track("invite_open");
export const trackPurchaseClick = (product: string, plan: string) => track("purchase_click", { product, plan });
export const trackLoginClick = () => track("login_click");
export const trackInappExternalOpen = () => track("inapp_external_open");
