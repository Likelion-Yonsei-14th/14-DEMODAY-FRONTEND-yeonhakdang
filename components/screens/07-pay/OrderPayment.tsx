"use client";

import { useEffect, useState } from "react";

import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Overlay, Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { PriceRow } from "@/components/pay/OrderRows";
import { BottomCta } from "@/components/ui/BottomCta";
import { Button } from "@/components/ui/Button";
import { CheckboxRow } from "@/components/ui/CheckboxRow";
import { HintText } from "@/components/ui/HintText";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
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
function PaySheet({ method, onCancel }: { method: string; onCancel: () => void }) {
  return (
    <div className="absolute inset-0">
      <div className="proto-fade-in absolute inset-0 bg-[#161a23] opacity-55" />
      <div className="proto-sheet-in absolute bottom-0 left-0 flex w-full flex-col items-center gap-[16px] rounded-t-[24px] bg-surface-default px-[24px] pb-[46px] pt-[28px] shadow-sheet">
        <MascotFaceBadge size={64} className="border-[3px]" />
        <div className="flex flex-col items-center gap-[4px]">
          <p className="font-serif text-h2-22">{method} 결제 진행 중</p>
          <p className="text-body-m-14 text-text-secondary">앱에서 결제를 승인하고 있어요…</p>
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
  const [paying, setPaying] = useState(false);

  const price = won(orderPrice(state));
  const isPackage = state.plan === "package";
  const upsell = PACKAGE_PRICE - PRODUCTS[state.product].price;
  const methodName = state.payMethod === "kakao" ? "카카오페이" : "토스페이";

  const { replace, go, setDemo } = proto;
  const payFail = proto.demo.payFail;
  useEffect(() => {
    if (!paying) return;
    const approve = setTimeout(() => {
      if (payFail) {
        // Demo "결제 실패": the PG window declines this one payment.
        setDemo({ payFail: false });
        setPaying(false);
        return go("7-5");
      }
      const bought =
        state.plan === "package"
          ? { compat: true, benefactor: true, charm: true }
          : { ...state.purchased, [state.product]: true };
      update({ purchased: bought, charmRerolls: 3 });
      replace("7-4");
    }, 1800);
    return () => clearTimeout(approve);
  }, [paying, payFail, go, setDemo, replace, update, state.plan, state.product, state.purchased]);

  return (
    <Screen>
      <TopBar title="주문 / 결제" className="absolute left-0 top-[54px]" />

      {/* content (31:1501) */}
      <div className="absolute left-0 top-[106px] flex w-[393px] flex-col items-start gap-[16px] overflow-clip px-[24px] pt-[12px]">
        <p className="relative shrink-0 whitespace-nowrap text-overline-12 text-brand-secondary">
          {stepLabel(state, "7-3")}
        </p>

        {/* 주문 상품 (31:1503) */}
        <div className="relative flex w-[345px] shrink-0 flex-col items-start gap-[12px] overflow-clip rounded-[16px] border border-line-default bg-surface-default px-[18px] py-[16px]">
          <div className="relative flex shrink-0 items-center gap-[12px] overflow-clip">
            <div className="relative flex size-[48px] shrink-0 items-center justify-center overflow-clip rounded-[12px] bg-brand-secondary">
              <p className="relative shrink-0 whitespace-nowrap text-h3-18 text-brand-accent">
                {isPackage ? "三" : PRODUCTS[state.product].glyph}
              </p>
            </div>
            {/* Pattern/Order/Product Summary (74:3148) */}
            <div className="relative flex shrink-0 flex-col items-start gap-[2px] overflow-clip whitespace-nowrap">
              <p className="relative shrink-0 font-bold text-body-l-16">
                {orderTitle(state)}
              </p>
              <p className="relative shrink-0 text-caption-12 text-text-secondary">
                {orderSummary(state)}
              </p>
            </div>
          </div>
          <div className="h-px w-[309px] shrink-0 bg-line-default" />
          <PriceRow label="상품 금액" value={price} />
        </div>

        {/* 패키지 업셀 (31:1514) */}
        <Tap
          onPress={() => update({ plan: isPackage ? "single" : "package" })}
          className="relative flex w-[345px] shrink-0 items-center gap-[10px] overflow-clip whitespace-nowrap rounded-[12px] bg-brand-accent-tint py-[12px] pl-[16px] pr-[12px]"
        >
          <p className="relative shrink-0 text-body-l-input-16 text-brand-accent">✦</p>
          <div className="relative flex min-w-px flex-1 flex-col items-start overflow-clip">
            <p className="relative shrink-0 font-bold text-body-m-14">
              {isPackage ? "3종 패키지로 변경했어요" : `${won(upsell)}만 더 내면 3종 패키지`}
            </p>
            <p className="relative shrink-0 text-caption-12 text-text-secondary">
              {isPackage ? "단건으로 되돌릴 수 있어요" : "귀인 · 부적까지 함께 받아요"}
            </p>
          </div>
          <p className="relative shrink-0 text-[12px] font-bold leading-[18px] text-brand-secondary">
            {isPackage ? "되돌리기" : "변경"}
          </p>
        </Tap>

        <p className="relative shrink-0 whitespace-nowrap text-h3-18">결제 수단</p>

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
          label="[필수] 주문 내용을 확인했고 결제에 동의해요"
          checked={agreed}
          showMore
          onToggle={() => setAgreed(!agreed)}
          onMore={() => proto.toast("주문 약관은 준비 중이에요")}
        />

        <div className="relative flex w-[345px] shrink-0 items-center justify-between overflow-clip whitespace-nowrap pt-[4px] font-bold">
          <p className="relative shrink-0 text-body-l-16">최종 결제 금액</p>
          <p className="relative shrink-0 font-serif text-h2-22 text-brand-primary">
            {price}
          </p>
        </div>
      </div>

      <Bottom from={740}>
        <BottomCta className="absolute left-0 top-[740px]">
          <Button
            label={`${price} 결제하기`}
            disabled={!agreed}
            onPress={() => setPaying(true)}
          />
        </BottomCta>
      </Bottom>

      {paying && (
        <Overlay>
          <PaySheet
            method={methodName}
            onCancel={() => {
              setPaying(false);
              proto.go("7-5");
            }}
          />
        </Overlay>
      )}
    </Screen>
  );
}
