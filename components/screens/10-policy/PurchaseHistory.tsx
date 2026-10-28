"use client";

import { useState } from "react";

import { TopBar } from "@/components/chrome/TopBar";
import { Overlay, Screen, ScreenScroll } from "@/components/layout/Screen";
import { BusinessFooter } from "@/components/policy/BusinessFooter";
import { RefundRequestDialog } from "@/components/policy/RefundRequestDialog";
import { Button } from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

/** Figma: 10-2 구매 내역 · 환불 신청 (226:3325), 393 × 943.
 * Orders are the supplied prototype fixtures; no payment API is connected.
 */
export function PurchaseHistory() {
  const proto = useProto();
  const [refundOpen, setRefundOpen] = useState(false);

  return (
    <Screen height={943} fit>
      {!proto.active && <div className="h-[54px] shrink-0" />}
      <TopBar title="구매 내역" />
      <ScreenScroll>
        <div className="flex w-full flex-col items-start gap-[16px] px-[24px] pb-[32px] pt-[16px]">
          <article className="flex w-full flex-col gap-[8px] rounded-[16px] border border-line-default bg-surface-default p-[16px]">
            <div className="flex justify-between font-bold text-body-l-16"><h1>3종 패키지</h1><p>3,790원</p></div>
            <p className="text-caption-12 text-text-tertiary">2026.10.24 · 카카오페이 · 주문번호 HS-20261024-0118</p>
            {[["합격 궁합", true], ["귀인", false], ["부적", false]].map(([name, opened]) => (
              <div key={String(name)} className="flex items-start justify-between gap-[8px]">
                <p className="text-body-m-14 text-text-secondary">· {name}</p>
                <p className={cn("font-bold text-caption-12", opened ? "text-text-tertiary" : "text-brand-secondary")}>{opened ? "열어봤어요" : "아직 안 열었어요"}</p>
              </div>
            ))}
            <div className="flex items-center justify-between gap-[8px] rounded-[12px] bg-brand-secondary-tint p-[12px]">
              <div className="min-w-0">
                <p className="font-bold text-body-m-14 text-brand-secondary">부분 환불 가능 1,891원</p>
                <p className="font-medium text-caption-11 text-text-secondary">10월 31일까지 · 귀인 + 부적</p>
              </div>
              <Button label="환불 신청" type="outline" size="M" className="h-[36px] w-auto shrink-0 rounded-[10px] px-[14px] [&>p]:text-caption-12" onPress={() => setRefundOpen(true)} />
            </div>
          </article>

          <article className="flex w-full flex-col gap-[8px] rounded-[16px] border border-line-default bg-surface-default p-[16px]">
            <div className="flex justify-between font-bold text-body-l-16"><h2>부적 단건</h2><p>990원</p></div>
            <p className="text-caption-12 text-text-tertiary">2026.10.14 · 토스페이 · 주문번호 HS-20261014-0732</p>
            <p className="text-caption-12 text-text-secondary">결과를 열어봐서 단순 변심 환불은 어려워요. 결과가 안 보이거나 오류가 있다면 고객센터로 알려 주세요.</p>
          </article>
          <InfoBox>환불 신청은 접수 후 3영업일 이내 결제 취소로 처리돼요. 문의: <a href="mailto:emilygylee@yonsei.ac.kr" className="underline">emilygylee@yonsei.ac.kr</a> · [유선 전화번호] (평일 10:00–18:00)</InfoBox>
        </div>
        <BusinessFooter />
      </ScreenScroll>
      {refundOpen && <Overlay><RefundRequestDialog onClose={() => setRefundOpen(false)} /></Overlay>}
    </Screen>
  );
}
