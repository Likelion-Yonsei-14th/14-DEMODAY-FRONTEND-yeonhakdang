"use client";

import { useEffect, useState } from "react";

import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Overlay, Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { BusinessFooter } from "@/components/policy/BusinessFooter";
import { InfoBox } from "@/components/ui/InfoBox";
import { PriceRow } from "@/components/pay/OrderRows";
import { BottomCta } from "@/components/ui/BottomCta";
import { Button } from "@/components/ui/Button";
import { CheckboxRow } from "@/components/ui/CheckboxRow";
import { HintText } from "@/components/ui/HintText";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { openPolicy } from "@/lib/business";
import { SINGLES_TOTAL } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import {
  PACKAGE_PRICE,
  PRODUCTS,
  orderPrice,
  orderTitle,
  stepLabel,
  useProto,
  won,
  type ProtoState,
} from "@/lib/proto";

/** Figma: 결제 수단 rows (31:1521 · 31:1528). */
function PayMethod({
  brand,
  brandClass,
  brandTextClass,
  title,
  caption,
  selected = false,
  onPress,
}: {
  brand: string;
  brandClass: string;
  brandTextClass: string;
  title: string;
  caption: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Tap
      onPress={onPress}
      className={cn(
        "relative flex w-[345px] shrink-0 items-center gap-[12px] overflow-clip rounded-[14px] px-[16px] py-[14px] transition-colors",
        selected
          ? "border-2 border-brand-secondary bg-brand-secondary-tint"
          : "border border-line-default bg-surface-default",
      )}
    >
      <Icon name={selected ? "radio-on" : "radio-off-pay"} size={22} />
      <div
        className={cn(
          "relative flex shrink-0 items-start overflow-clip rounded-[6px] px-[8px] py-[4px]",
          brandClass,
        )}
      >
        <p
          className={cn(
            "relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-[18px]",
            brandTextClass,
          )}
        >
          {brand}
        </p>
      </div>
      <HintText title={title} caption={caption} />
    </Tap>
  );
}

/** What the order is for, under the product name (74:3148). */
function orderSummary(s: ProtoState): string {
  if (s.plan === "package") return "합격 궁합 + 귀인 + 부적";
  if (s.product === "compat") return s.universities.join(" · ") || "지원 대학 미선택";
  if (s.product === "benefactor") return `${s.relation} 귀인 · 관계 유형 1개`;
  return "고화질 저장 + 다시 뽑기 3회";
}

/**
 * Stand-in for the 카카오페이 / 토스 checkout window. It approves after a
 * moment; 결제 취소 inside it is how the prototype reaches 7-5.
 */
function PaySheet({ method, order, onCancel }: { method: string; order: ProtoState; onCancel: () => void }) {
  return (
    <div className="absolute inset-0">
      <div className="proto-fade-in absolute inset-0 bg-[#161a23] opacity-55" />
      <div className="proto-sheet-in absolute bottom-0 left-0 flex w-full flex-col items-center gap-[16px] rounded-t-[24px] bg-surface-default px-[24px] pb-[46px] pt-[28px] shadow-sheet">
        <MascotFaceBadge size={64} className="border-[3px]" />
        <div className="flex flex-col items-center gap-[4px]">
          <p className="font-serif text-h2-22">{method} 결제 진행 중</p>
          <p className="text-body-m-14 text-text-secondary">앱에서 결제를 승인하고 있어요…</p>
          <p className="font-bold text-body-l-16">{orderTitle(order)} · {won(orderPrice(order))}</p>
        </div>
        <div className="proto-spinner size-[28px] rounded-full border-[3px] border-brand-secondary-tint border-t-brand-secondary" />
        <Button label="결제 취소" type="ghost" size="M" onPress={onCancel} className="w-[200px]" />
      </div>
    </div>
  );
}

/** Figma: 7-3 주문 · 결제 수단 선택 (PAY-01·02) (31:1481) */
export function OrderPayment() {
  const proto = useProto();
  const { state, update } = proto;
  const [agreed, setAgreed] = useState(!proto.active);
  const [refundAgreed, setRefundAgreed] = useState(!proto.active);
  const [payment, setPayment] = useState<ProtoState | null>(null);
  const paying = payment !== null;

  const price = won(orderPrice(state));
  const isPackage = state.plan === "package";
  const upsell = PACKAGE_PRICE - PRODUCTS[state.product].price;
  const methodName = state.payMethod === "card" ? "NHN KCP 신용·체크카드" : state.payMethod === "kakao" ? "카카오페이" : "토스페이";

  const { replace, go, setDemo } = proto;
  const payFail = proto.demo.payFail;
  useEffect(() => {
    if (!payment) return;
    const approve = setTimeout(() => {
      if (payFail) {
        // Demo "결제 실패": the PG window declines this one payment.
        setDemo({ payFail: false });
        setPayment(null);
        return go("7-5");
      }
      const bought =
        payment.plan === "package"
          ? { compat: true, benefactor: true, charm: true }
          : { ...payment.purchased, [payment.product]: true };
      update({ purchased: bought, charmRerolls: 3 });
      replace("7-4");
    }, 1800);
    return () => clearTimeout(approve);
  }, [payment, payFail, go, setDemo, replace, update]);

  return (
    <Screen height={1372} bleed contentSized>
      <TopBar title="주문 / 결제" className="absolute left-0 top-[54px]" />

      {/* content (31:1501) */}
      <div className="relative mt-[106px] flex min-h-[831px] w-[393px] shrink-0 flex-col items-start gap-[16px] overflow-clip px-[24px] pt-[12px]">
        <p className="relative shrink-0 whitespace-nowrap text-overline-12 text-brand-secondary">
          {stepLabel(state, "7-3")}
        </p>

        {/* 주문 상품 (31:1503) */}
        <div className="relative flex w-[345px] shrink-0 flex-col items-start gap-[12px] overflow-clip rounded-[16px] border border-line-default bg-surface-default px-[18px] py-[16px]">
          <div className="relative flex w-full shrink-0 items-center gap-[12px]">
            <div className="relative flex size-[48px] shrink-0 items-center justify-center overflow-clip rounded-[12px] bg-brand-secondary">
              <p className="relative shrink-0 whitespace-nowrap text-h3-18 text-brand-accent">
                {PRODUCTS[state.product].glyph}
              </p>
            </div>
            {/* Pattern/Order/Product Summary (74:3148) */}
            <div className="relative flex min-w-0 flex-1 flex-col items-start gap-[2px]">
              <p className="relative shrink-0 font-bold text-body-l-16">
                {orderTitle(state)}
              </p>
              <p className="relative w-full break-keep text-caption-12 text-text-secondary">
                {orderSummary(state)}
              </p>
            </div>
          </div>
          <div className="h-px w-[309px] shrink-0 bg-line-default" />
          <PriceRow label="상품 금액" value={price} />
        </div>

        {/* 패키지 업셀 (31:1514) */}
        <Tap
          onPress={() => {
            update({ plan: isPackage ? "single" : "package" });
            setAgreed(false);
            setRefundAgreed(false);
            proto.replace(isPackage ? "7-3" : "7-3b");
          }}
          className="relative flex w-[345px] shrink-0 items-center gap-[10px] overflow-clip whitespace-nowrap rounded-[12px] bg-brand-accent-tint py-[12px] pl-[16px] pr-[12px]"
        >
          <p className="relative shrink-0 text-body-l-input-16 text-brand-accent">✦</p>
          <div className="relative flex min-w-px flex-1 flex-col items-start overflow-clip">
            <p className="relative shrink-0 font-bold text-body-m-14">
              {isPackage ? `3종 패키지 적용됨 · ${won(SINGLES_TOTAL - PACKAGE_PRICE)} 할인` : `${won(upsell)}만 더 내면 3종 패키지`}
            </p>
            <p className="relative shrink-0 text-caption-12 text-text-secondary">
              {isPackage ? `단건 합계 ${won(SINGLES_TOTAL)} → ${won(PACKAGE_PRICE)}` :`${Object.entries(PRODUCTS).filter(([kind]) => kind !== state.product).map(([, product]) => product.name).join(" · ")}까지 함께 받아요`}
            </p>
          </div>
          <p className="relative shrink-0 text-[12px] font-bold leading-[18px] text-brand-secondary">
            {isPackage ? "해제" : "변경"}
          </p>
        </Tap>

        <p className="relative shrink-0 whitespace-nowrap text-h3-18">결제 수단</p>

        <PayMethod
          brand="CARD"
          brandClass="bg-black"
          brandTextClass="text-text-inverse"
          title="신용·체크카드"
          caption="모든 카드사 · NHN KCP 결제창"
          selected={state.payMethod === "card"}
          onPress={() => update({ payMethod: "card" })}
        />
        <PayMethod
          brand="pay"
          brandClass="bg-system-kakao"
          brandTextClass="text-system-kakao-text"
          title="카카오페이"
          caption="카카오톡에서 바로 결제"
          selected={state.payMethod === "kakao"}
          onPress={() => update({ payMethod: "kakao" })}
        />
        <PayMethod
          brand="toss"
          brandClass="bg-brand-secondary"
          brandTextClass="text-text-inverse"
          title="토스페이"
          caption="토스 앱으로 간편 결제"
          selected={state.payMethod === "toss"}
          onPress={() => update({ payMethod: "toss" })}
        />

        <CheckboxRow
          label="[필수] 주문 내용 확인 및 결제 동의"
          checked={agreed}
          showMore
          onToggle={() => setAgreed(!agreed)}
          onMore={() => openPolicy("/terms")}
        />

        <CheckboxRow
          label="[필수] 열람 후 환불 제한 안내 확인 · 동의"
          checked={refundAgreed}
          showMore
          onToggle={() => setRefundAgreed(!refundAgreed)}
          onMore={() => openPolicy("/refund")}
        />
        <InfoBox tone="warning" className="w-full">
          결과를 열람하면 디지털 콘텐츠 특성상 단순 변심 환불이 제한돼요. 만 19세 미만은 법정대리인(부모님) 동의 후 결제해 주세요. 동의 없는 결제는 본인 또는 법정대리인이 취소할 수 있어요.
        </InfoBox>

        <div className="relative flex w-[345px] shrink-0 items-center justify-between overflow-clip whitespace-nowrap pt-[4px] font-bold">
          <p className="relative shrink-0 text-body-l-16">최종 결제 금액</p>
          <p className="relative shrink-0 font-serif text-h2-22 text-brand-primary">
            {price}
          </p>
        </div>
      </div>

      <BusinessFooter className="mt-4" />
      <div className="h-[112px] shrink-0" />
      <Bottom from={1260} to={1338}>
        <BottomCta className="absolute left-0 top-[1260px]">
          <Button
            label={`${price} 결제하기`}
            disabled={!agreed || !refundAgreed || paying}
            onPress={() => {
              if (!state.loggedIn) return proto.requireLogin(isPackage ? "7-3b" : "7-3");
              if ((isPackage || state.product === "compat") && state.universities.length === 0) {
                proto.toast("합격 궁합을 볼 대학을 먼저 골라 주세요");
                return proto.go("7-1");
              }
              setPayment({ ...state });
            }}
          />
        </BottomCta>
      </Bottom>

      {payment && (
        <Overlay>
          <PaySheet
            method={methodName}
            order={payment}
            onCancel={() => {
              setPayment(null);
              proto.go("7-5");
            }}
          />
        </Overlay>
      )}
    </Screen>
  );
}
