"use client";

import { BottomNav } from "@/components/chrome/BottomNav";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen, ScreenScroll } from "@/components/layout/Screen";
import { CardType } from "@/components/result/CardType";
import { ElementDistribution } from "@/components/result/ElementDistribution";
import {
  MajorTypeMatch,
  MoreFromYeonhak,
  ResultActions,
  ResultHero,
  Top3Majors,
} from "@/components/result/ResultSections";
import { WhyThisMajor } from "@/components/result/WhyThisMajor";
import { Toast } from "@/components/ui/Toast";
import { useProto } from "@/lib/proto";
import { useAnalysis } from "@/lib/useAnalysis";

/**
 * The 학과 결과 content (25:670). Figma draws this as one tall frame for
 * 3-3 and clips it to the viewport for 3-4; here it is a single scrollable
 * column shared by both.
 */
export function MajorResultContent({
  heroMascot,
}: {
  heroMascot?: { left: number; top: number; width: number; height: number };
} = {}) {
  const { dayMaster, tags, counts, charCount, insight } = useAnalysis();
  return (
    <div className="flex w-[393px] flex-col items-start gap-[32px] px-[24px] pb-[130px] pt-[8px]">
      <ResultHero mascot={heroMascot} />
      <CardType
        title={`${dayMaster.name}(${dayMaster.hanja})\n${dayMaster.type}`}
        description={dayMaster.description}
        tags={tags}
      />
      <div className="flex w-full flex-col gap-[12px]">
        <Top3Majors />
        <WhyThisMajor />
      </div>
      <ElementDistribution counts={counts} charCount={charCount} insight={insight} />
      <MajorTypeMatch />
      <ResultActions />
      <MoreFromYeonhak />
      <p className="relative w-[345px] shrink-0 text-caption-12 text-text-tertiary">
        사주 결과는 진로 탐색을 위한 참고용 콘텐츠예요. 실제 입시 결과를 보장하지
        않아요.
      </p>
    </div>
  );
}

/**
 * Figma: 3-3 학과 결과 · 내 학과 (전체 스크롤) (25:457)
 * The same content as 3-4, drawn at its full 2990px height with the nav
 * pinned to the bottom of the artboard.
 */
export function MajorResultFull() {
  return (
    <Screen height={2990}>
      <TopBar type="logo" right="icon-menu" />
      <MajorResultContent />
      <BottomNav active="major" className="absolute left-0 top-[2900px]" />
    </Screen>
  );
}

/** Figma: 3-4 학과 결과 · 첫 화면 (초대 친구 명단 자동 등록 토스트) (25:667) */
export function MajorResultFirstView() {
  // The prototype raises this toast itself when the analysis finishes.
  const { active } = useProto();
  return (
    <Screen fit>
      <TopBar type="logo" right="icon-menu" />
      <ScreenScroll>
        <MajorResultContent />
      </ScreenScroll>
      <BottomNav active="major" />
      {!active && (
        <Toast
          className="absolute left-[42.5px] top-[700px]"
          text="민지님과 서로의 합격자 명단에 등록됐어요"
        />
      )}
    </Screen>
  );
}
