"use client";

import { useEffect, useRef, useState } from "react";

import { BottomSheetHeader, Dim } from "@/components/layout/BottomSheet";
import { Overlay, Screen } from "@/components/layout/Screen";
import { LandingContent } from "@/components/screens/01-landing/Landing";
import { Button } from "@/components/ui/Button";
import { trackInappExternalOpen } from "@/lib/analytics";
import { browserMenuUrl, entryUrl, externalBrowserPlan, openExternalBrowser } from "@/lib/externalBrowser";
import { useProto } from "@/lib/proto";

/** Optional browser guidance; iOS Instagram uses its own external-browser menu. */
export function InAppBrowserSheet() {
  const proto = useProto();
  const url = entryUrl(window.location.href);
  const plan = externalBrowserPlan(navigator.userAgent, url);
  const [manual, setManual] = useState(!plan.href);
  const [status, setStatus] = useState("");
  const cancel = useRef<() => void>(undefined);
  useEffect(() => () => cancel.current?.(), []);
  useEffect(() => {
    const before = new URL(window.location.href);
    const handoff = new URL(browserMenuUrl(before.href, url));
    if (before.href === handoff.href) return;
    window.history.replaceState(window.history.state, "", handoff.href);
    return () => {
      const current = new URL(window.location.href);
      if (current.search !== handoff.search) return;
      current.search = before.search;
      window.history.replaceState(window.history.state, "", current.href);
    };
  }, [url]);

  const openExternal = () => {
    trackInappExternalOpen();
    cancel.current?.();
    if (manual) return;
    cancel.current = openExternalBrowser(plan, {
      onLeft: proto.back,
      onStayed: () => {
        setManual(true);
        setStatus("자동으로 열지 못했어요. 위 안내에 따라 앱 메뉴에서 외부 브라우저로 열어 주세요.");
      },
    });
  };

  return (
    <Screen>
      <LandingContent elementOrder={["목", "화", "토", "금", "수"]} />
      <Overlay>
        <Dim onPress={proto.back} />
        <section role="dialog" aria-modal="true" aria-label="브라우저에서 이어보기"
          className="proto-sheet-in screen-scroll absolute bottom-0 left-0 flex max-h-[90%] w-full flex-col rounded-t-[24px] bg-surface-default pb-[24px] shadow-sheet">
          <BottomSheetHeader title="브라우저에서 이어보기" onClose={proto.back} />
          <div className="flex shrink-0 flex-col gap-[14px] px-[24px] pb-[12px]">
            <p className="text-body-m-14 text-text-secondary">
              앱 안에서는 로그인·이미지 저장·공유가 제한될 수 있어요. 외부 브라우저로 옮기거나 이대로 계속할 수 있어요.
            </p>
            <p className="whitespace-pre-line rounded-[14px] bg-bg-subtle p-[14px] text-body-m-14">
              {plan.guide.text}
            </p>
            {status && <p role="status" className="text-caption-12 font-bold text-brand-secondary">{status}</p>}
            {!manual && <Button label={plan.label} onPress={openExternal} />}
            <Button label="이대로 계속하기" type={manual ? "primary" : "ghost"} size="M" onPress={proto.back} />
          </div>
        </section>
      </Overlay>
    </Screen>
  );
}
