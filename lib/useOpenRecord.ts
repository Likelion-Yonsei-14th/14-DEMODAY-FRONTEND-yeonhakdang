"use client";

import { useEffect } from "react";

import { ApiError, USE_BACKEND, errorMessage, openProduct, type ProductKind } from "@/lib/backend";
import { useProto } from "@/lib/proto";

/**
 * A paid result (8-1 · 8-2 · 8-3) is on screen: tell the server, which records
 * the first view (the point after which 단순 변심 refunds end). The screen
 * itself is still drawn by the app; the server's content is not used yet.
 * Never call this ahead of time (prefetch, preload): only on a real open.
 */
export function useOpenRecord(kind: ProductKind) {
  const { active, state, toast, back } = useProto();
  const orderId = state.orders[kind];
  useEffect(() => {
    if (!USE_BACKEND || !active || !orderId) return;
    openProduct(orderId, kind).catch((error: unknown) => {
      toast(errorMessage(error));
      // Refunded or under review: this result is no longer the visitor's to see.
      if (error instanceof ApiError && (error.code === "ENTITLEMENT_NOT_ACTIVE" || error.code === "ORDER_NOT_ACCESSIBLE")) back();
    });
  }, [active, orderId, kind, toast, back]);
}
