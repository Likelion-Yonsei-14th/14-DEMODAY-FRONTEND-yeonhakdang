"use client";

import { BottomNav } from "@/components/chrome/BottomNav";
import { StatusBar } from "@/components/chrome/StatusBar";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { MascotTipSmall } from "@/components/result/ResultSections";
import {
  RosterHeader,
  RosterInviteCard,
  RosterList,
  RosterListHeader,
} from "@/components/roster/RosterSections";

/**
 * The 합격자 명단 content (26:752). 4-3 lays a bottom sheet over the same
 * composition, so it is shared.
 */
export function RosterContent() {
  return (
    <div className="flex w-[393px] flex-col items-start gap-[20px] px-[24px] pb-[120px] pt-[8px]">
      <RosterHeader
        stats={[
          { label: "동기", value: "5명" },
          { label: "평균 궁합", value: "81점" },
          { label: "수석", value: "민지" },
        ]}
      />
      <MascotTipSmall>{"수석 동기는 민지야!\n둘이 궁합이 92점이래"}</MascotTipSmall>
      <RosterListHeader />
      <RosterList />
      <RosterInviteCard />
    </div>
  );
}

/**
 * Figma: 4-1 합격자 명단 · 친구 5명 (26:732)
 * A 1205px-tall frame: the content runs long and the nav sits at the bottom
 * of the artboard (y=1115).
 */
export function RosterFive() {
  return (
    <Screen height={1205}>
      <StatusBar />
      <TopBar type="logo" right="icon-menu" />
      <RosterContent />
      <BottomNav active="list" className="absolute left-0 top-[1115px]" />
    </Screen>
  );
}
