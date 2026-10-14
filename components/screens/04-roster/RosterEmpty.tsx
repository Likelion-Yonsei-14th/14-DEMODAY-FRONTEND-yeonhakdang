"use client";

import { BottomNav } from "@/components/chrome/BottomNav";
import { TopBar } from "@/components/chrome/TopBar";
import { Bottom, Screen } from "@/components/layout/Screen";
import { Mascot } from "@/components/mascot/Mascot";
import { SpeechBubble } from "@/components/mascot/SpeechBubble";
import { RankLabel } from "@/components/roster/RankLabel";
import { Button } from "@/components/ui/Button";
import { NumberedRow } from "@/components/ui/StepNumber";
import { useProto } from "@/lib/proto";

/** Figma: 4-2 합격자 명단 · 빈 명단 (M-09) (26:881) */
export function RosterEmpty() {
  const proto = useProto();
  return (
    <Screen>
      <TopBar type="logo" right="icon-menu" className="absolute left-0 top-[54px]" />

      <Mascot
        pose="sad"
        className="absolute left-[106.5px] top-[175.08px] rounded-[24px] bg-bg-base"
        width={180}
        height={181.475}
      />
      <SpeechBubble tail="bottom-left" className="absolute left-[214px] top-[124px]">
        {"명단이 텅 비었어…\n친구를 불러줄래?"}
      </SpeechBubble>

      <p className="absolute left-[83px] top-[372px] whitespace-nowrap font-serif text-h2-22">
        아직 명단이 비어 있어요
      </p>
      <div className="absolute left-[24px] top-[410px] w-[345px] whitespace-pre-line text-center text-body-m-14 text-text-secondary">
        {"친구가 내 초대 링크로 결과를 보면\n서로의 합격자 명단에 자동 등록돼요."}
      </div>

      {/* how (26:912) */}
      <div className="absolute left-[24px] top-[486px] flex w-[345px] flex-col items-start gap-[12px] overflow-clip rounded-[16px] border border-line-default bg-surface-default px-[20px] py-[18px]">
        <NumberedRow n={1} gap={12} weight="regular">
          내 초대 링크를 카톡·인스타로 공유
        </NumberedRow>
        <NumberedRow n={2} gap={12} weight="regular">
          친구가 링크로 들어와 학과 결과 확인
        </NumberedRow>
        <NumberedRow n={3} gap={12} weight="regular">
          궁합 점수로 석차가 정해져요
        </NumberedRow>
      </div>

      {/* 석차 라벨 미리보기 (26:925) */}
      <div className="absolute left-[76.5px] top-[632px] flex items-start gap-[6px] overflow-clip">
        <RankLabel rank="수석 동기" />
        <RankLabel rank="차석" />
        <RankLabel rank="합격" />
        <RankLabel rank="추가 합격" />
      </div>

      <Bottom from={676} to={762}>
        <Button
          label="친구 초대하고 명단 채우기"
          onPress={() => proto.go("5-2")}
          className="absolute left-[24px] top-[676px] w-[345px]"
        />
      </Bottom>

      <BottomNav active="list" className="absolute left-0 top-[762px]" />
    </Screen>
  );
}
