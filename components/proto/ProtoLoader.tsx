"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

/**
 * The prototype reads the window size, URL hash and session on first render,
 * so it only ever renders in the browser.
 */
const ClientPrototype = dynamic(
  () => import("@/components/proto/Prototype").then((m) => m.Prototype),
  { ssr: false, loading: () => <div className="fixed inset-0 bg-bg-base" /> },
);

const subscribe = () => () => {};
export function ProtoLoader({ children }: { children: React.ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return hydrated ? <ClientPrototype /> : children;
}
