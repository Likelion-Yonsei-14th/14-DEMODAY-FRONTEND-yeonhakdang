"use client";

import { BottomNav } from "@/components/chrome/BottomNav";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import {
  FeatureList,
  LockNotice,
  PriceBottomCta,
  ProductHero,
  ProductNoticeBox,
  PurchaseOptions,
} from "@/components/product/ProductSections";
import { MascotTipSmall } from "@/components/result/ResultSections";
import { Chip } from "@/components/ui/Chip";
import { SectionTitle } from "@/components/ui/SectionTitle";

/** Figma: 6-2 귀인 · 상품 상세 (29:1386) — a 1656px-tall frame. */
export function ProductBenefactor() {
  return (
    <Screen height={1656} bleed>
      <ProductHero
        height={372}
        badge="새내기 인간관계 미리보기"
        title={"앞으로 만나게될\n나의 귀인은?"}
        subtitle="관계별 잘 맞는 사람과 만나는 시기"
        price={{ price: "1,900원", unit: "단건" }}
        pose="threeQuarter"
        poseInner={{ left: -13.24, top: -1.99, width: 176.471, height: 160.991 }}
        sparkles={[
          { left: 190, top: 96, size: 14 },
          { left: 360, top: 230, size: 10 },
          { left: 330, top: 330, size: 16 },
        ]}
      />
      <TopBar
        title="​"
        backIcon="icon-back-light"
        className="absolute left-0 top-[54px]"
      />

      {/* content (29:1422) */}
      <div className="flex w-[393px] flex-col items-start gap-[32px] overflow-clip px-[24px] pb-[200px] pt-[28px]">
        <MascotTipSmall>{"네 대학 생활을 바꿀\n사람을 미리 알려줄게"}</MascotTipSmall>

        <FeatureList
          rows={[
            {
              icon: "icon-user",
              title: "관계 유형별 귀인",
              caption:
                "선배 · 동기 · 교수님 · 연인, 원하는 관계를 골라요\n대학교 밖에서 찾아 오는 인연도 포함 이에요",
            },
            {
              icon: "icon-calendar",
              title: "만나는 시기",
              caption: "귀인 운이 열리는 달과 장소 힌트",
              width: 300,
            },
            {
              icon: "icon-sparkle-22",
              title: "알아보는 법",
              caption: "귀인의 오행 특징과 첫인상 키워드",
              width: 300,
            },
          ]}
        />

        {/* 결과 예시 (29:1454) */}
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[12px] overflow-clip">
          <SectionTitle title="결과 예시" caption="실제 결과는 내 사주로 새로 만들어져요" />
          <div className="relative flex w-full shrink-0 flex-col items-start gap-[8px] overflow-clip rounded-[16px] border border-line-default bg-surface-default px-[20px] pb-[16px] pt-[14px]">
            <Chip label="선배 귀인" />
            <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16">
              화(火) 기운의 발표왕 선배
            </p>
            <p className="relative w-[305px] shrink-0 text-body-m-14 text-text-secondary">
              2027년 4월, 첫 조별 과제에서 만나요. 말이 빠르고 웃음이 큰 사람이라면…
            </p>
            {/* The locked tail is blurred behind the notice. */}
            <p className="relative w-[305px] shrink-0 text-body-m-14 text-text-secondary blur-[3px]">
              이 선배와 함께하면 내 리더십이 두 배로 커지고, 2학년 때 학회 활동으로
              이어져요.
            </p>
            <div className="h-[36px] w-[10px] shrink-0" />
            <LockNotice className="absolute left-[77px] top-[181px]" />
          </div>
        </div>

        {/* 구매 옵션 (P-02) (74:3567) */}
        <PurchaseOptions
          caption="3종 패키지로 사면 2,000원 아껴요"
          single={{
            title: "귀인 단건",
            description: "관계 유형 1개 선택",
            price: "1,900원",
          }}
        />

        <ProductNoticeBox />
      </div>

      <PriceBottomCta
        product="benefactor"
        className="absolute left-0 top-[1485px]"
      />
      <BottomNav active="benefactor" className="absolute left-0 top-[1566px]" />
    </Screen>
  );
}
