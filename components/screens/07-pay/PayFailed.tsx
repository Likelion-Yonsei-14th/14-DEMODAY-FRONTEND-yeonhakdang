"use client";

import { HomeIndicator } from "@/components/chrome/HomeIndicator";
import { StatusBar } from "@/components/chrome/StatusBar";
import { Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { PriceRow } from "@/components/pay/OrderRows";
import { Button } from "@/components/ui/Button";
import { InfoBox } from "@/components/ui/InfoBox";
import { PRODUCTS, useProto } from "@/lib/proto";

/** Figma: 7-5 결제 실패 · 취소 (PAY-04) (31:1625) */
export function PayFailed() {
  const proto = useProto();
  return (
    <Screen>
      <StatusBar className="absolute left-0 top-0" />

      <Mascot
        pose="surprised"
        className="absolute left-[101.5px] top-[145.45px] rounded-[24px] bg-bg-base"
        width={190}
        height={212.582}
      />
      <SpeechBubble tail="bottom-left" className="absolute left-[236px] top-[116px]">
        {"어라? 결제가\n끝나지 않았어!"}
      </SpeechBubble>

      <p className="absolute left-[93.5px] top-[388px] whitespace-nowrap font-serif text-h1-26">
        결제가 취소됐어요
      </p>
      <div className="absolute left-[24px] top-[430px] w-[345px] whitespace-pre-line text-center text-body-m-14 text-text-secondary">
        {"결제창이 닫혔거나 승인이 거절됐어요.\n돈은 빠져나가지 않았으니 안심하세요."}
      </div>

      <InfoBox tone="warning" className="absolute left-[24px] top-[496px] w-[345px]">
        계속 실패하면 다른 결제 수단을 선택해 보세요
      </InfoBox>

      {/* 주문 상태 (31:1652) */}
      <div className="absolute left-[24px] top-[556px] flex w-[345px] flex-col items-start gap-[12px] overflow-clip rounded-[16px] border border-line-default bg-surface-default px-[18px] py-[16px]">
        <PriceRow label="주문 번호" value="HS-20261014-0732" />
        <PriceRow label="주문 상태" value="결제 취소" emphasis />
      </div>

      <Button
        label="다시 결제하기"
        onPress={() => proto.backTo("7-3")}
        className="absolute left-[24px] top-[700px] w-[345px]"
      />
      <Button
        label="상품 상세로 돌아가기"
        onPress={() => proto.backTo(PRODUCTS[proto.state.product].detail)}
        type="ghost"
        size="M"
        className="absolute left-[86.5px] top-[762px] w-[220px]"
      />

      <HomeIndicator className="absolute left-0 top-[818px]" />
    </Screen>
  );
}
