"use client";

import { BottomNav } from "@/components/chrome/BottomNav";
import { Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import {
  MonthlyEnergyChart,
  PaidHero,
  PaidTopBar,
  UniversityRankCard,
  WeeklyEnergy,
} from "@/components/paid/PaidSections";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { displayName, useProto } from "@/lib/proto";
import { useOpenRecord } from "@/lib/useOpenRecord";

/** Figma: 8-1 합격 궁합 · 결과 (PR-03) (32:1579) — a 1658px-tall frame. */
export function CompatResult() {
  const proto = useProto();
  useOpenRecord("compat");
  return (
    <Screen height={1658} bleed>
      <PaidHero
        height={300}
        badge="지원 대학 3곳 분석"
        title={`${displayName(proto.state)}님의\n합격 궁합`}
        subtitle="가장 기운이 맞는 곳은 연세대학교(91점)예요"
        pose="celebrate"
        poseInner={{ left: -5, top: 24.22, width: 150, height: 124.18 }}
        stageSize={{ left: 229, top: 86, size: 140 }}
        sparkles={[
          { left: 200, top: 92, size: 14 },
          { left: 372, top: 230, size: 12 },
          { left: 350, top: 270, size: 16 },
        ]}
      />
      <PaidTopBar className="absolute left-0 top-[54px]" />

      {/* content (32:1611) */}
      <div className="flex w-[393px] flex-col items-start gap-[28px] overflow-clip px-[24px] pb-[120px] pt-[24px]">
        {/* 대학별 궁합 (32:1612) */}
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[10px] overflow-clip">
          <SectionTitle
            title="대학별 합격 궁합"
            caption="내 사주와 학교의 기운(설립 연도·상징)을 비교했어요"
            className="w-auto"
          />
          <UniversityRankCard
            rank={1}
            name="연세대학교"
            score="91"
            badge="최고 궁합"
            barClass="bg-brand-secondary"
            note="목(木) 생 화(火) · 서로 키워 주는 상생"
          />
          <UniversityRankCard
            rank={2}
            name="고려대학교"
            score="84"
            barClass="bg-brand-secondary-light"
            note="목(木)·목(木) · 같은 기운이 힘을 모아요"
          />
          <UniversityRankCard
            rank={3}
            name="한양대학교"
            score="75"
            barClass="bg-brand-accent"
            note="목(木) 극 토(土) · 노력으로 넘는 궁합"
          />
        </div>

        {/* 월별 합격 기운 타임라인 (32:1651) */}
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[14px] overflow-clip rounded-[16px] border border-line-default bg-surface-default p-[18px]">
          <SectionTitle
            title="월별 합격 기운"
            caption="원서 접수부터 최종 발표까지"
            className="w-auto"
          />
          <MonthlyEnergyChart />
          <div className="relative flex w-[309px] shrink-0 flex-wrap content-start items-start gap-[8px] overflow-clip">
            <Chip label="11/14 면접 길일" />
            <Chip type="primary" label="12/12 발표 기운 최고" />
            <Chip label="2/3 추가 합격 기운" />
          </div>
        </div>

        {/* 11월 주간 기운 (32:1682) */}
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[12px] overflow-clip whitespace-nowrap rounded-[16px] border border-line-default bg-surface-default p-[18px]">
          <SectionTitle
            title="11월 주간 기운"
            caption="수능·면접이 몰린 달은 주 단위로 봐요"
            className="w-auto"
          />
          <WeeklyEnergy />
        </div>

        {/* 연학이 (73:2586) — size M badge */}
        <div className="relative flex shrink-0 items-center gap-[6px] overflow-clip">
          <MascotFaceBadge size={64} className="border-[3px]" />
          <SpeechBubble tail="left" className="shrink-0">
            {"12월 둘째 주가 제일 좋아!\n그날 발표 확인하자"}
          </SpeechBubble>
        </div>

        <Button
          label="합격 궁합 카드 공유하기"
          type="outline"
          onPress={() => proto.go("5-1")}
        />
        <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-tertiary">
          * 결과는 보관함에 저장돼 언제든 다시 볼 수 있어요
        </p>
      </div>

      <BottomNav active="compat" className="absolute left-0 top-[1568px]" />
    </Screen>
  );
}
