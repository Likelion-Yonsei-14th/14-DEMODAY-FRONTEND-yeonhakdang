"use client";

import dynamic from "next/dynamic";

/**
 * The prototype reads the window size, URL hash and session on first render,
 * so it only ever renders in the browser.
 */
export const ProtoLoader = dynamic(
  () => import("@/components/proto/Prototype").then((m) => m.Prototype),
  { ssr: false, loading: () => <div className="fixed inset-0 bg-bg-base" /> },
);
