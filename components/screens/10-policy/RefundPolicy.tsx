"use client";

import { TopBar } from "@/components/chrome/TopBar";
import { Screen, ScreenScroll } from "@/components/layout/Screen";
import { BusinessFooter } from "@/components/policy/BusinessFooter";
import { RefundBody } from "@/components/public/PolicyBody";
import { useProto } from "@/lib/proto";

/**
 * Figma: 10-1 환불 정책 (226:3213), 393 × 2219. The text is shared with the
 * server-rendered /refund page.
 */
export function RefundPolicy() {
  const proto = useProto();

  return (
    <Screen height={2219} fit>
      {!proto.active && <div className="h-[54px] shrink-0" />}
      <TopBar title="환불 정책" />
      <ScreenScroll>
        <RefundBody />
        <BusinessFooter />
      </ScreenScroll>
    </Screen>
  );
}
