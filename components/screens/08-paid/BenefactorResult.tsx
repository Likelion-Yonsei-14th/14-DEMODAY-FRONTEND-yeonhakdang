"use client";

import { BottomNav } from "@/components/chrome/BottomNav";
import { StatusBar } from "@/components/chrome/StatusBar";
import { Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { PaidHero, PaidTopBar } from "@/components/paid/PaidSections";
import { HintCheckRow, TimelineRow } from "@/components/paid/Timeline";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { InfoBox } from "@/components/ui/InfoBox";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useProto } from "@/lib/proto";

/** Figma: 8-2 귀인 · 결과 (PR-04) (33:1626) — a 1458px-tall frame. */
export function BenefactorResult() {
  const proto = useProto();
  const { relation } = proto.state;
  return (
    <Screen height={1458}>
      <PaidHero
        height={300}
        badge={`관계 유형 · ${relation}`}
        title={`대학에서 만날\n나의 ${relation} 귀인`}
        subtitle="화(火) 기운이 강한 선배가 내 목(木)을 키워 줘요"
        pose="greet"
        poseInner={{ left: -15, top: 4.18, width: 170, height: 144.221 }}
        stageSize={{ left: 229, top: 86, size: 140 }}
        sparkles={[
          { left: 200, top: 92, size: 14 },
          { left: 372, top: 240, size: 12 },
          { left: 350, top: 272, size: 16 },
        ]}
      />
      <StatusBar theme="light" className="absolute left-0 top-0" />
      <PaidTopBar className="absolute left-0 top-[54px]" />

      {/* content (33:1658) */}
      <div className="flex w-[393px] flex-col items-start gap-[28px] overflow-clip px-[24px] pb-[120px] pt-[24px]">
        {/* 귀인 프로필 (33:1659) */}
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[10px] overflow-clip rounded-[16px] border border-line-default bg-surface-default p-[18px]">
          <div className="relative flex shrink-0 items-center gap-[14px] overflow-clip">
            <div className="relative flex size-[56px] shrink-0 items-center justify-center overflow-clip rounded-full bg-brand-primary-tint">
              <p className="relative shrink-0 whitespace-nowrap font-serif text-h2-22 text-brand-primary">
                火
              </p>
            </div>
            <div className="relative flex shrink-0 flex-col items-start gap-[2px] overflow-clip whitespace-nowrap">
              <p className="relative shrink-0 text-caption-12 text-text-tertiary">
                귀인 유형
              </p>
              <p className="relative shrink-0 text-h3-18">발표왕 리더 선배</p>
            </div>
          </div>
          <p className="relative w-[309px] shrink-0 text-body-m-14 text-text-secondary">
            말이 빠르고 웃음소리가 큰 사람. 조별 과제에서 먼저 손을 들고, 처음 보는
            후배에게도 밥을 사 주는 선배예요.
          </p>
          {/* Pattern/Result/Tag Row (73:2475) */}
          <div className="relative flex w-[309px] shrink-0 flex-wrap content-start items-start gap-[6px] overflow-clip">
            <Chip label="#빨간색 소품" />
            <Chip label="#발표 동아리" />
            <Chip label="#학생회" />
          </div>
        </div>

        {/* 만나는 시기 (33:1674) */}
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[12px] overflow-clip rounded-[16px] border border-line-default bg-surface-default p-[18px]">
          <SectionTitle title="만나는 시기" caption="귀인 운이 열리는 달" className="w-auto" />
          <TimelineRow
            rail="default"
            date="2027.03"
            title="새내기 OT"
            caption="인사만 나눠도 기억에 남아요"
          />
          <TimelineRow
            rail="active"
            date="2027.04"
            badge="최고 시기"
            highlight
            title="첫 조별 과제"
            caption="가장 강하게 연결되는 시기"
          />
          <TimelineRow
            rail="end"
            date="2027.09"
            title="2학기 학회 모집"
            caption="함께하면 진로가 선명해져요"
          />
        </div>

        {/* 알아보는 법 (33:1706) */}
        <div className="relative flex w-full shrink-0 flex-col items-start gap-[12px] overflow-clip rounded-[16px] border border-line-default bg-surface-default p-[18px]">
          <SectionTitle title="이렇게 알아봐요" className="w-auto" />
          <HintCheckRow>첫 만남에 먼저 이름을 불러 주는 사람</HintCheckRow>
          <HintCheckRow>남쪽 강의실·빨간 간판 근처에서 자주 마주쳐요</HintCheckRow>
          <HintCheckRow>“같이 해 볼래?”라는 말을 먼저 꺼내요</HintCheckRow>
        </div>

        <InfoBox tone="warning">
          토(土) 기운이 강한 선배와는 의견이 자주 부딪혀요. 역할을 나누면 괜찮아요.
        </InfoBox>

        {/* 연학이 (73:2593) — size M badge */}
        <div className="relative flex shrink-0 items-center gap-[6px] overflow-clip">
          <MascotFaceBadge size={64} className="border-[3px]" />
          <SpeechBubble tail="left" className="shrink-0">
            {"4월 조별 과제 때\n먼저 손 들어 봐!"}
          </SpeechBubble>
        </div>

        <Button
          label="다른 관계 귀인도 보기"
          type="outline"
          onPress={() => {
            proto.update({ product: "benefactor", plan: "single" });
            proto.go("7-2");
          }}
        />
      </div>

      <BottomNav active="benefactor" className="absolute left-0 top-[1368px]" />
    </Screen>
  );
}
