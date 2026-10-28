"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/**
 * The prototype reads the window size, URL hash and session on first render,
 * so it only ever renders in the browser.
 */
const Prototype = dynamic(
  () => import("@/components/proto/Prototype").then((m) => m.Prototype),
  { ssr: false, loading: () => <div className="proto-cover fixed inset-0 bg-bg-base" /> },
);

/**
 * `children` is the server-rendered public content of `/` (소개, 가격, 사업자
 * 정보): it is in the HTML for crawlers, PG 심사 and no-JS visitors. Once the
 * app takes over it steps aside — the app's landing shows the same footer and
 * prices.
 */
export function ProtoLoader({ children }: { children: React.ReactNode }) {
  // false in the server HTML and while hydrating, true from then on.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);

  return (
    <>
      <div className={hydrated ? "hidden" : "flex flex-1 flex-col"}>{children}</div>
      <Prototype />
    </>
  );
}
