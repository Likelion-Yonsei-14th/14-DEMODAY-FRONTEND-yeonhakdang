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
import { displayName, unlocked, useProto } from "@/lib/proto";
import { useOpenRecord } from "@/lib/useOpenRecord";
import { useCompatResult } from "@/lib/usePaid";

/** The frame holds 3 대학; each one more (or fewer) adds a card and its gap. */
const FRAME_HEIGHT = 1658;
const CARD_STEP = 114;
/** 이용권: "다른 대학으로 다시 보기" under the share button. */
const RETRY_STEP = 80;
const BAR_TONES = ["bg-brand-secondary", "bg-brand-secondary-light"];

/** Figma: 8-1 합격 궁합 · 결과 (PR-03) (32:1579) — a 1658px-tall frame. */
export function CompatResult() {
  const proto = useProto();
  useOpenRecord("compat");
  const result = useCompatResult();
  const [first] = result.universities;
  const retry = proto.active && unlocked(proto.state);
  const height = FRAME_HEIGHT + (result.universities.length - 3) * CARD_STEP + (retry ? RETRY_STEP : 0);

  return (
    <Screen height={height} bleed contentSized>
      <PaidHero
        height={300}
        badge={`지원 대학 ${result.universities.length}곳 분석`}
        title={`${displayName(proto.state)}님의\n합격 궁합`}
        subtitle={`가장 기운이 맞는 곳은 ${first.name}(${first.score}점)예요`}
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
            caption="내 사주와 학교의 기운(개교 연도의 천간)을 비교했어요"
            className="w-auto"
          />
          {result.universities.map((u, i) => (
            <UniversityRankCard
              key={u.name}
              rank={i + 1}
              name={u.name}
              score={String(u.score)}
              badge={i === 0 ? "최고 궁합" : undefined}
              barClass={BAR_TONES[i] ?? "bg-brand-accent"}
              note={u.note}
            />
          ))}
        </div>

        {/* 월별 합격 기운 타임라인 (32:1651) */}
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[14px] overflow-clip rounded-[16px] border border-line-default bg-surface-default p-[18px]">
          <SectionTitle
            title="월별 합격 기운"
            caption="수능부터 최종 발표까지"
            className="w-auto"
          />
          <MonthlyEnergyChart months={result.months} />
          <div className="relative flex w-[309px] shrink-0 flex-wrap content-start items-start gap-[8px] overflow-clip">
            {result.chips.map((chip) => (
              <Chip key={chip.label} type={chip.primary ? "primary" : undefined} label={chip.label} />
            ))}
          </div>
        </div>

        {/* 11월 주간 기운 (32:1682) */}
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[12px] overflow-clip whitespace-nowrap rounded-[16px] border border-line-default bg-surface-default p-[18px]">
          <SectionTitle title={result.focusTitle} caption={result.focusCaption} className="w-auto" />
          <WeeklyEnergy weeks={result.weeks} />
        </div>

        {/* 연학이 (73:2586) — size M badge */}
        <div className="relative flex shrink-0 items-center gap-[6px] overflow-clip">
          <MascotFaceBadge size={64} className="border-[3px]" />
          <SpeechBubble tail="left" className="shrink-0">
            {result.tip}
          </SpeechBubble>
        </div>

        <Button
          label="합격 궁합 카드 공유하기"
          type="outline"
          onPress={() => proto.go("5-1")}
        />
        {retry && (
          <Button
            label="다른 대학으로 다시 보기"
            type="ghost"
            onPress={() => {
              proto.update({ product: "compat", plan: "single" });
              proto.go("7-1");
            }}
          />
        )}
        <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-tertiary">
          * 결과는 보관함에 저장돼 언제든 다시 볼 수 있어요
        </p>
      </div>

      <BottomNav active="compat" className="absolute left-0" style={{ top: height - 90 }} />
    </Screen>
  );
}
