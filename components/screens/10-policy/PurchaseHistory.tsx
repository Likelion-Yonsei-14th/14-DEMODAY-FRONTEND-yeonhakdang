"use client";

import { useEffect, useState } from "react";

import { TopBar } from "@/components/chrome/TopBar";
import { Overlay, Screen, ScreenScroll } from "@/components/layout/Screen";
import { BusinessFooter } from "@/components/policy/BusinessFooter";
import { RefundApplyDialog } from "@/components/policy/RefundApplyDialog";
import { RefundRequestDialog } from "@/components/policy/RefundRequestDialog";
import { Button } from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { USE_BACKEND, errorMessage, getOrders, isListedOrder, isPaid, type Order } from "@/lib/backend";
import { BUSINESS } from "@/lib/business";
import { PACKAGE_NAME } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { PRODUCTS, useProto, won } from "@/lib/proto";

const ORDER_STATUS: Record<Order["status"], string> = {
  CREATED: "결제 대기",
  READY: "결제 대기",
  PENDING: "결제 확인 중",
  PAID: "결제 완료",
  FAILED: "결제 실패",
  CANCELLED: "결제 취소",
  PARTIALLY_REFUNDED: "부분 환불",
  REFUNDED: "환불 완료",
  REVIEW_REQUIRED: "확인 중",
};

const orderName = (code: Order["product_code"]) => (code === "package" ? PACKAGE_NAME : PRODUCTS[code].single);
const orderDate = (iso: string) => new Date(iso).toLocaleDateString("ko-KR");

/** The visitor's orders from the server, each with its own 환불 신청. */
function ServerOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [refunding, setRefunding] = useState<Order | null>(null);

  useEffect(() => {
    // Orders that never reached a payment (abandoned at the PG window) are left out.
    getOrders().then((all) => setOrders(all.filter(isListedOrder)), (e: unknown) => setError(errorMessage(e)));
  }, []);

  if (error) return <InfoBox>{error}</InfoBox>;
  if (!orders) return <p role="status" className="text-body-m-14 text-text-secondary">구매 내역을 불러오고 있어요…</p>;
  if (!orders.length) return <p className="text-body-m-14 text-text-secondary">아직 구매한 상품이 없어요.</p>;
  return (
    <>
      {orders.map((order) => (
        <article key={order.id} className="flex w-full flex-col gap-[8px] rounded-[16px] border border-line-default bg-surface-default p-[16px]">
          <div className="flex justify-between font-bold text-body-l-16">
            <h2>{orderName(order.product_code)}</h2>
            <p>{won(order.amount)}</p>
          </div>
          <p className="text-caption-12 text-text-tertiary">
            {orderDate(order.paid_at ?? order.created_at)} · {ORDER_STATUS[order.status] ?? order.status} · 주문번호 {order.id.slice(0, 8)}
          </p>
          {isPaid(order) && (
            <div className="flex justify-end">
              <Button label="환불 신청" type="outline" size="M" className="h-[36px] w-auto shrink-0 rounded-[10px] px-[14px] [&>p]:text-caption-12" onPress={() => setRefunding(order)} />
            </div>
          )}
        </article>
      ))}
      {refunding && (
        <Overlay>
          <RefundApplyDialog
            orderId={refunding.id}
            title={`${orderName(refunding.product_code)} · ${won(refunding.amount)}`}
            onClose={() => setRefunding(null)}
          />
        </Overlay>
      )}
    </>
  );
}

/** Figma: 10-2 구매 내역 · 환불 신청 (226:3325), 393 × 883.
 * Without the backend the orders are the supplied prototype fixtures.
 */
export function PurchaseHistory() {
  const proto = useProto();
  const [refundOpen, setRefundOpen] = useState(false);

  if (USE_BACKEND && proto.active) {
    return (
      <Screen height={883} fit>
        <TopBar title="구매 내역" />
        <ScreenScroll>
          <div className="flex w-full flex-col items-start gap-[16px] px-[24px] pb-[32px] pt-[16px]">
            <ServerOrders />
            <InfoBox>환불 신청은 접수 후 3영업일 이내 결제 취소로 처리돼요. 문의: <a href={`mailto:${BUSINESS.email}`} className="underline">{BUSINESS.email}</a> · {BUSINESS.phone} (평일 10:00–18:00)</InfoBox>
          </div>
          <BusinessFooter />
        </ScreenScroll>
      </Screen>
    );
  }

  return (
    <Screen height={883} fit>
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
          <InfoBox>환불 신청은 접수 후 3영업일 이내 결제 취소로 처리돼요. 문의: <a href={`mailto:${BUSINESS.email}`} className="underline">{BUSINESS.email}</a> · {BUSINESS.phone} (평일 10:00–18:00)</InfoBox>
        </div>
        <BusinessFooter />
      </ScreenScroll>
      {refundOpen && <Overlay><RefundRequestDialog onClose={() => setRefundOpen(false)} /></Overlay>}
    </Screen>
  );
}
