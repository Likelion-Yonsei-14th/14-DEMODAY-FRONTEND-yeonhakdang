"use client";

import { useEffect, useState } from "react";

import { BottomNav } from "@/components/chrome/BottomNav";
import { TopBar } from "@/components/chrome/TopBar";
import { Screen } from "@/components/layout/Screen";
import { MascotTipSmall } from "@/components/result/ResultSections";
import {
  RosterHeader,
  RosterInviteCard,
  RosterList,
  RosterListHeader,
} from "@/components/roster/RosterSections";
import { josa } from "@/lib/josa";
import { useProto } from "@/lib/proto";
import { useRoster } from "@/lib/useRoster";

/** The frame shows 5 friends; each row more or less moves the nav by this. */
const FRAME_FRIENDS = 5;
const ROW_PITCH = 84;

/**
 * The 합격자 명단 content (26:752). 4-3 lays a bottom sheet over the same
 * composition, so it is shared.
 */
export function RosterContent({ seenAt }: { seenAt?: number }) {
  const { entries, average } = useRoster(seenAt);
  const top = entries[0];
  return (
    <div className="flex w-[393px] flex-col items-start gap-[20px] px-[24px] pb-[120px] pt-[8px]">
      <RosterHeader
        stats={[
          { label: "동기", value: `${entries.length}명` },
          { label: "평균 궁합", value: `${average}점` },
          { label: "수석", value: top?.name ?? "-" },
        ]}
      />
      {top && (
        <MascotTipSmall>
          {`수석 동기는 ${josa(top.name, "이야/야")}!\n둘이 궁합이 ${top.score}점이래`}
        </MascotTipSmall>
      )}
      <RosterListHeader />
      <RosterList seenAt={seenAt} />
      <RosterInviteCard />
    </div>
  );
}

/**
 * Figma: 4-1 합격자 명단 · 친구 5명 (26:732)
 * A 1205px-tall frame for 5 friends: the content runs long and the nav sits at
 * the bottom of the artboard (y=1115). Other counts grow or shrink it by a row.
 */
export function RosterFive() {
  const proto = useProto();
  const { entries } = useRoster();
  // NEW stays on for this visit; the next visit counts from now.
  const [seenAt] = useState(proto.state.rosterSeenAt);
  const { active, update } = proto;
  useEffect(() => {
    if (active) update({ rosterSeenAt: Date.now() });
  }, [active, update]);

  const height = 1205 + (entries.length - FRAME_FRIENDS) * ROW_PITCH;
  return (
    <Screen height={height}>
      <TopBar type="logo" right="icon-menu" />
      <RosterContent seenAt={seenAt} />
      <BottomNav active="list" className="absolute left-0" style={{ top: height - 90 }} />
    </Screen>
  );
}
