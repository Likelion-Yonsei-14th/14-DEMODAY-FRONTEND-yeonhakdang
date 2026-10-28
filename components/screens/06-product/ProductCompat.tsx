"use client";

import { BottomNav } from "@/components/chrome/BottomNav";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { BusinessFooter } from "@/components/policy/BusinessFooter";
import {
  ExampleScoreRow,
  FeatureList,
  LockNotice,
  PriceBottomCta,
  ProductHero,
  ProductNoticeBox,
  PurchaseOptions,
} from "@/components/product/ProductSections";
import { MascotTipSmall } from "@/components/result/ResultSections";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PACKAGE_PRICE, SINGLES_TOTAL, won } from "@/lib/catalog";

/** Figma: 6-1 합격 궁합 · 상품 상세 (29:1220). */
export function ProductCompat() {
  return (
    <Screen height={2258} bleed contentSized>
      <ProductHero
        height={372}
        badge="원서 접수 전 필수"
        title={"지원한 대학과 나,\n합격 궁합은?"}
        subtitle="대학별 합격 기운 지수와 주 단위 타임라인"
        pose="flying"
        poseInner={{ left: -4.41, top: 8.34, width: 158.824, height: 150.663 }}
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

      {/* content (29:1256) */}
      <div className="flex min-h-[1408px] w-[393px] shrink-0 flex-col items-start gap-[32px] overflow-clip px-[24px] pb-[200px] pt-[28px]">
        <MascotTipSmall>
          {"원서 쓰기 전에\n기운 좋은 대학을 골라줄게!"}
        </MascotTipSmall>

        <FeatureList
          rows={[
            {
              icon: "product-icon-crown",
              title: "대학별 합격 기운 지수",
              caption: "지원 대학 최대 6곳, 내 사주와 학교 기운을 비교해요",
            },
            {
              icon: "product-icon-calendar",
              title: "월·주 단위 합격 기운 타임라인",
              caption: "원서 접수부터 발표까지 기운이 오르는 시기",
            },
            {
              icon: "icon-sparkle-22",
              title: "면접·논술 길일 추천",
              caption: "실력이 가장 잘 나오는 날을 골라 드려요",
            },
          ]}
        />

        {/* 결과 예시 (29:1288) */}
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[12px] overflow-clip">
          <SectionTitle title="결과 예시" caption="실제 결과는 내 사주로 새로 만들어져요" />
          <div className="relative flex w-full shrink-0 flex-col items-start overflow-clip rounded-[16px] border border-line-default bg-surface-default px-[20px] pb-[16px] pt-[14px]">
            <ExampleScoreRow label="연세대학교" score="91" />
            <ExampleScoreRow label="고려대학교" score="84" />
            <ExampleScoreRow label="성균관대학교" score="78" />
            <ExampleScoreRow label="한양대학교" score="75" />
            <LockNotice className="absolute left-[77px] top-[159px]" />
          </div>
        </div>

        <PurchaseOptions
          caption={`3종 패키지로 사면 ${won(SINGLES_TOTAL - PACKAGE_PRICE)} 아껴요`}
          single={{
            title: "합격 궁합 단건",
            description: "대학 최대 6곳 · 타임라인 포함",
            price: "2,900원",
          }}
        />
        <ProductNoticeBox />
      </div>

      <BusinessFooter />
      <div className="h-[171px] shrink-0" />
      <PriceBottomCta
        product="compat"
        className="absolute left-0 top-[2087px]"
      />
      <BottomNav productAssets active="compat" className="absolute left-0 top-[2168px]" />
    </Screen>
  );
}
