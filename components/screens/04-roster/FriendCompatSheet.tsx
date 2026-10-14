"use client";

import { BottomNav } from "@/components/chrome/BottomNav";
import { TopBar } from "@/components/chrome/TopBar";
import { BottomSheet, BottomSheetHeader, Dim } from "@/components/layout/BottomSheet";
import { Anchored, Overlay, Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { ElementCompare } from "@/components/roster/ElementCompare";
import { RankLabel } from "@/components/roster/RankLabel";
import { ROSTER_FRIENDS } from "@/components/roster/RosterSections";
import { RosterContent } from "@/components/screens/04-roster/RosterFive";
import { BulletRow } from "@/components/ui/BulletRow";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

/** True when the last syllable ends in a final consonant (받침). */
function hasBatchim(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0;
}

/** Figma: 4-3 친구 상세 궁합 · 바텀시트 (M-07) (26:961) */
export function FriendCompatSheet() {
  const proto = useProto();
  // The frame is 민지's sheet; the prototype opens whichever row was tapped.
  const friend =
    ROSTER_FRIENDS.find((f) => f.name === proto.state.friend) ?? ROSTER_FRIENDS[0];
  const { name, score, rank } = friend;
  return (
    <Screen>
      <TopBar type="logo" right="icon-menu" />
      <RosterContent />
      <BottomNav active="list" className="absolute left-0 top-[762px]" />

      <Overlay>
        <Dim />
        <Anchored from={196}>
          <BottomSheet top={274}>
            <BottomSheetHeader title={`${name}님과의 궁합`} />

            {/* body (26:1045) */}
            <div className="relative flex w-full shrink-0 flex-col items-start gap-[16px] overflow-clip px-[24px] pb-[12px]">
              <div className="relative flex shrink-0 items-end gap-[10px] overflow-clip">
                <p className="relative shrink-0 whitespace-nowrap font-serif text-score-48 text-brand-secondary">
                  {score}
                </p>
                <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16 text-brand-secondary">
                  점
                </p>
                <RankLabel rank={rank} />
              </div>

              <Chip label="관계 유형 · 함께 성장하는 동기" />

              {/* 오행 비교 (26:1053) */}
              <div className="relative flex w-full shrink-0 items-center justify-between overflow-clip whitespace-nowrap rounded-[16px] bg-bg-subtle px-[16px] py-[14px]">
                <ElementCompare element="목" caption="나 · 갑목" />
                <div className="relative flex shrink-0 flex-col items-center gap-[2px] overflow-clip">
                  <p className="relative shrink-0 text-h3-18 text-brand-primary">木 生 火</p>
                  <p className="relative shrink-0 text-caption-12 text-text-secondary">
                    나무가 불을 살리는 상생
                  </p>
                </div>
                <ElementCompare element="화" caption={`${name} · 병화`} />
              </div>

              {/* 이유 (26:1067) */}
              <div className="relative flex shrink-0 flex-col items-start gap-[10px] overflow-clip">
                <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16">
                  왜 {score}점일까?
                </p>
                <BulletRow>내 목(木) 기운이 {name}의 화(火)를 키워 주는 상생 관계예요.</BulletRow>
                <BulletRow>{name}의 표현력이 나의 추진력에 날개를 달아 줘요.</BulletRow>
                <BulletRow>팀플에서는 내가 방향을, {name}{hasBatchim(name) ? "이" : "가"} 발표를 맡으면 최고!</BulletRow>
              </div>
            </div>

            <div className="relative flex shrink-0 flex-col items-start overflow-clip px-[24px] pb-[46px] pt-[8px]">
              <Button label="확인" onPress={proto.back} className="w-[345px]" />
            </div>
          </BottomSheet>

          {/* 연학이 peeking over the sheet (14:50 · size L) */}
          <MascotFaceBadge
            size={96}
            className={cn(
              "absolute left-[24px] top-[196px] border-[3px]",
              proto.active && "proto-sheet-in",
            )}
          />
        </Anchored>
      </Overlay>
    </Screen>
  );
}
