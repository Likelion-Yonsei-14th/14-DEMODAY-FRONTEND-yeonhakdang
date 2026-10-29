"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";

import { GA_ID, addressHasInvite, primeGa, screenReported, startGa } from "@/lib/analytics";

/** How long `/` waits for the prototype's first screen before loading GA anyway. */
const SCREEN_WAIT_MS = 3000;
/** An address that keeps its invite code this long never loads GA. */
const INVITE_GIVE_UP_MS = 10000;

/**
 * Loads GA (see lib/analytics) only once the address is safe to read: the
 * prototype drops `?invite=` on its first render, and on `/` GA also waits
 * for that first screen so the initial page_view is the screen itself.
 */
export function GaTag() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    const since = Date.now();
    const timer = setInterval(() => {
      const waited = Date.now() - since;
      if (addressHasInvite()) {
        if (waited > INVITE_GIVE_UP_MS) clearInterval(timer);
        return;
      }
      if (window.location.pathname === "/" && !screenReported() && waited < SCREEN_WAIT_MS) return;
      clearInterval(timer);
      primeGa();
      setReady(true);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // GoogleAnalytics' inline config runs in its own (child) effect, before this one.
  useEffect(() => {
    if (ready) startGa();
  }, [ready]);

  return ready ? <GoogleAnalytics gaId={GA_ID} /> : null;
}
