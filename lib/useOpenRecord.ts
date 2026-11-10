"use client";

import { useEffect, useState } from "react";
import { USE_BACKEND, errorMessage, openSavedResult, type ProductKind } from "@/lib/backend";
import { unlocked, useProto } from "@/lib/proto";

/** Only a real result screen opens the purchased snapshot and records its first view. */
export function useOpenRecord(kind: ProductKind) {
  const { active, state, update } = useProto();
  const orderId = state.orders[kind];
  const needed = Boolean(USE_BACKEND && active && (orderId || state.purchased[kind] || !unlocked(state)));
  const key = `${state.account}/${orderId}/${kind}`;
  const [loaded, setLoaded] = useState("");
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  useEffect(() => {
    if (!needed || !orderId) return;
    let cancelled = false;
    openSavedResult(orderId, kind).then((saved) => {
      if (cancelled) return;
      if (saved.orderId !== orderId || saved.kind !== kind || saved.version !== 1) throw new Error("Invalid saved result");
      update({ paidResults: { ...state.paidResults, [kind]: saved }, ...(kind === "charm" ? { charmRerolls: saved.charmRerolls } : {}) });
      setLoaded(key);
    }).catch((error) => { if (!cancelled) setFailure({ key, message: errorMessage(error) }); });
    return () => { cancelled = true; };
    // The cache changes after this request; it must not open the report a second time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needed, orderId, kind, key, update]);
  return { ready: !needed || loaded === key, error: failure?.key === key ? failure.message : needed && !orderId ? "구매한 결과를 찾지 못했어요. 보관함에서 다시 열어 주세요." : null };
}
