"use client";

import { useEffect, useRef, useState } from "react";
import { INITIAL_DEMO, INITIAL_STATE, ProtoContext, useProto, type Plan, type ProductKind, type ProtoState } from "@/lib/proto";

/** Server-renderable pages reuse the app's components and carry choices into its flow. */
export function PublicPage({ children, product }: { children: React.ReactNode; product?: ProductKind }) {
  const defaults = useProto();
  const [state, setState] = useState<ProtoState>({ ...INITIAL_STATE, ...(product ? { product } : {}) });
  const current = useRef(state);
  const [message, setMessage] = useState("");
  const update = (patch: Partial<ProtoState>) => {
    current.current = { ...current.current, ...patch };
    setState(current.current);
  };
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("plan") === "package") {
      current.current = { ...current.current, plan: "package" };
      setState(current.current);
    }
  }, []);
  const go = (id: string) => {
    try {
      const saved = JSON.parse(localStorage.getItem("yeonhak-proto-v2") || "{}");
      const next = { ...INITIAL_STATE, ...saved.state, product: current.current.product, plan: current.current.plan };
      localStorage.setItem("yeonhak-proto-v2", JSON.stringify({ state: next, stack: [id], demo: INITIAL_DEMO }));
    } catch { /* Navigation still works if storage is blocked. */ }
    window.location.assign(`/#${id}`);
  };
  const openProduct = (kind: ProductKind, plan: Plan = "single") => {
    const slug = { compat: "compat", benefactor: "gwiin", charm: "bujeok" }[kind];
    window.location.assign(`/products/${slug}${plan === "package" ? "?plan=package" : ""}`);
  };
  const beginPurchase = (kind: ProductKind) => {
    const params = new URLSearchParams({ checkout: "1", product: kind, plan: current.current.plan });
    window.location.assign(`/?${params}`);
  };
  return (
    <ProtoContext.Provider value={{ ...defaults, active: true, state, update, go, replace: go, back: () => window.location.assign("/"), backTo: go, openMenu: () => go("9-5"), openProduct, beginPurchase, requireLogin: go, toast: setMessage }}>
      <div className="public-page">
        {children}
        {message && <div role="status" className="fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-text-primary p-4 text-caption-12 text-text-inverse" onClick={() => setMessage("")}>{message}</div>}
      </div>
    </ProtoContext.Provider>
  );
}
