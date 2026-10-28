"use client";

import Image from "next/image";

import { BottomNav } from "@/components/chrome/BottomNav";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { BusinessFooter } from "@/components/policy/BusinessFooter";
import {
  FeatureList,
  PriceBottomCta,
  ProductHero,
  ProductNoticeBox,
  PurchaseOptions,
} from "@/components/product/ProductSections";
import { MascotTipSmall } from "@/components/result/ResultSections";
import { SectionTitle } from "@/components/ui/SectionTitle";

/** Figma: 6-3 부적 · 상품 상세 (29:1541). */
export function ProductCharm() {
  return (
    <Screen height={2281} bleed contentSized>
      <ProductHero
        height={372}
        badge="D-30 합격 기운 충전"
        title={"행운 가득 담은\n배경화면 부적"}
        subtitle="내 오행으로 그린 나만의 합격 기운 배경화면"
        pose="happy"
        poseInner={{ left: 4.41, top: 63.53, width: 141.176, height: 95.468 }}
        poseInnerClassName="rounded-[24px] bg-bg-base"
        sparkles={[
          { left: 190, top: 96, size: 14 },
          { left: 360, top: 230, size: 10 },
          { left: 330, top: 330, size: 16 },
        ]}
      />
      <TopBar
        title="​"
        backIcon="product-icon-back"
        className="absolute left-0 top-[54px]"
      />

      {/* content (29:1577) */}
      <div className="flex min-h-[1431px] w-[393px] shrink-0 flex-col items-start gap-[32px] overflow-clip px-[24px] pb-[200px] pt-[28px]">
        <MascotTipSmall>{"매일 보는 잠금화면에\n합격 기운을 붙여 줄게"}</MascotTipSmall>

        <FeatureList
          rows={[
            {
              icon: "product-icon-image",
              title: "내 오행으로 그린 부적",
              caption: "내 사주에 부족한 기운을 채우는 색과 문양 \n규칙으로 맞춤 생성",
            },
            {
              icon: "product-icon-gift",
              title: "고화질 배경화면 저장",
              caption: "아이폰 잠금화면 비율 그대로 저장돼요",
            },
            {
              icon: "product-icon-refresh",
              title: "마음에 들 때까지 다시 뽑기",
              caption: "최대 3번까지 새로 그릴 수 있어요",
            },
          ]}
        />

        {/* 결과 예시 (29:1609) — three poster previews on navy */}
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[12px] overflow-clip">
          <SectionTitle title="결과 예시" caption="실제 결과는 내 사주로 새로 만들어져요" />
          <div className="relative flex w-full shrink-0 items-start justify-center gap-[14px] overflow-clip rounded-[16px] bg-brand-secondary p-[20px]">
            <div className="relative h-[182px] w-[84px] shrink-0">
              <Image src="/assets/charm-poster-1.png" alt="" fill sizes="84px" className="pointer-events-none rounded-[10px] object-cover" />
            </div>
            {/* The middle poster is flipped in the frame (94:3130). */}
            <div className="relative h-[183px] w-[84px] shrink-0 rotate-180 -scale-y-100">
              <Image src="/assets/charm-poster-2.png" alt="" fill sizes="84px" className="pointer-events-none rounded-[10px] object-cover" />
            </div>
            <div className="relative h-[182px] w-[84px] shrink-0">
              <Image src="/assets/charm-poster-3.png" alt="" fill sizes="84px" className="pointer-events-none rounded-[10px] object-cover" />
            </div>
          </div>
        </div>

        {/* 구매 옵션 (P-02) (74:3594) */}
        <PurchaseOptions
          caption="3종 패키지로 사면 2,000원 아껴요"
          single={{
            title: "부적 단건",
            description: "고화질 저장 + 다시 뽑기 3회",
            price: "990원",
          }}
        />

        <ProductNoticeBox />
      </div>

      <BusinessFooter />
      <div className="h-[171px] shrink-0" />
      <PriceBottomCta
        product="charm"
        className="absolute left-0 top-[2110px]"
      />
      <BottomNav productAssets active="charm" className="absolute left-0 top-[2191px]" />
    </Screen>
  );
}
