"use client";

import { Bottom, Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { ListItem } from "@/components/pay/OrderRows";
import { Button } from "@/components/ui/Button";
import { PRODUCTS, orderPrice, orderTitle, useProto, won } from "@/lib/proto";

/** Figma: 7-4 결제 완료 (PAY-03) (31:1557) */
const SPARKLES = [
  { left: 78, top: 140, size: 18, tone: "text-brand-accent" },
  { left: 300, top: 250, size: 14, tone: "text-brand-primary" },
  { left: 60, top: 260, size: 12, tone: "text-brand-primary" },
  { left: 330, top: 200, size: 20, tone: "text-brand-accent" },
  { left: 110, top: 90, size: 10, tone: "text-brand-primary" },
] as const;

export function PaySuccess() {
  const proto = useProto();
  const { state } = proto;
  const orderDetail = () => proto.toast("주문 상세는 준비 중이에요");
  const product = PRODUCTS[state.product];
  const subject = state.plan === "package" ? "3종 패키지를" : `${product.name}을`;
  return (
    <Screen>

      {SPARKLES.map(({ left, top, size, tone }) => (
        <p
          key={`${left}-${top}`}
          className={`absolute whitespace-nowrap leading-[26px] ${tone}`}
          style={{ left, top, fontSize: size }}
        >
          ✦
        </p>
      ))}

      <Mascot
        pose="celebrate"
        className="absolute left-[103.5px] top-[159.46px] rounded-[24px] bg-bg-base"
        width={186}
        height={153.984}
      />
      <SpeechBubble tail="bottom-left" className="absolute left-[232px] top-[84px]">
        {"결제 완료!\n바로 풀어 줄게"}
      </SpeechBubble>

      <p className="absolute left-[93.5px] top-[328px] whitespace-nowrap font-serif text-h1-26">
        결제가 완료됐어요
      </p>
      <p className="absolute left-[46.5px] top-[368px] w-[300px] text-center text-body-m-14 text-text-secondary">
        연학이가 {subject} 풀고 있어요. 결과는 보관함에도 저장돼요.
      </p>

      {/* 주문 정보 (31:1585) */}
      <div className="absolute left-[24px] top-[426px] flex w-[345px] flex-col items-start overflow-clip rounded-[16px] border border-line-default bg-surface-default px-[18px] py-[4px]">
        <ListItem label="주문 번호" value="HS-20261014-0732" onPress={orderDetail} />
        <ListItem label="상품" value={orderTitle(state)} onPress={orderDetail} />
        <ListItem
          label="결제 수단"
          value={state.payMethod === "card" ? "신용·체크카드" : state.payMethod === "kakao" ? "카카오페이" : "토스페이"}
          onPress={orderDetail}
        />
        <ListItem label="결제 금액" value={won(orderPrice(state))} onPress={orderDetail} />
      </div>

      <Bottom from={700}>
        <Button
          label={`${product.name} 결과 보러 가기`}
          onPress={() => proto.reset(product.result)}
          className="absolute left-[24px] top-[700px] w-[345px]"
        />
        <Button
          label="보관함에서 나중에 보기"
          onPress={() => proto.requireLogin("9-1")}
          type="ghost"
          size="M"
          className="absolute left-[86.5px] top-[762px] w-[220px]"
        />
      </Bottom>
    </Screen>
  );
}
