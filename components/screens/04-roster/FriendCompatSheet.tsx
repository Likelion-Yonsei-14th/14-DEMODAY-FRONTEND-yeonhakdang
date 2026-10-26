"use client";

import { BottomNav } from "@/components/chrome/BottomNav";
import { TopBar } from "@/components/chrome/TopBar";
import { BottomSheet, BottomSheetHeader, Dim } from "@/components/layout/BottomSheet";
import { Anchored, Overlay, Screen } from "@/components/layout/Screen";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { ElementCompare } from "@/components/roster/ElementCompare";
import { RankLabel } from "@/components/roster/RankLabel";
import { RosterContent } from "@/components/screens/04-roster/RosterFive";
import { BulletRow } from "@/components/ui/BulletRow";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";
import { useAnalysis } from "@/lib/useAnalysis";
import { useRoster } from "@/lib/useRoster";

/** Figma: 4-3 친구 상세 궁합 · 바텀시트 (M-07) (26:961) */
export function FriendCompatSheet() {
  const proto = useProto();
  const me = useAnalysis();
  const { entries } = useRoster();
  // The frame is 민지's sheet; the prototype opens whichever row was tapped.
  const friend = entries.find((e) => e.key === proto.state.friend) ?? entries[0];
  if (!friend) return null;
  const { name, score, rank, compat, analysis } = friend;
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

              <Chip label={`관계 유형 · ${compat.kind}`} />

              {/* 오행 비교 (26:1053) */}
              <div className="relative flex w-full shrink-0 items-center justify-between overflow-clip whitespace-nowrap rounded-[16px] bg-bg-subtle px-[16px] py-[14px]">
                <ElementCompare
                  element={me.saju.dayMaster.element}
                  caption={`나 · ${me.dayMaster.name}`}
                />
                <div className="relative flex shrink-0 flex-col items-center gap-[2px] overflow-clip">
                  <p className="relative shrink-0 text-h3-18 text-brand-primary">{compat.formula}</p>
                  <p className="relative shrink-0 text-caption-12 text-text-secondary">
                    {compat.caption}
                  </p>
                </div>
                <ElementCompare
                  element={analysis.saju.dayMaster.element}
                  caption={`${name} · ${analysis.dayMaster.name}`}
                />
              </div>

              {/* 이유 (26:1067) */}
              <div className="relative flex shrink-0 flex-col items-start gap-[10px] overflow-clip">
                <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16">
                  왜 {score}점일까?
                </p>
                {compat.reasons.map((reason) => (
                  <BulletRow key={reason}>{reason}</BulletRow>
                ))}
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
