"use client";

import Image from "next/image";

import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { CardFriendRow } from "@/components/roster/CardFriendRow";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { displayName, useProto } from "@/lib/proto";
import { useRoster } from "@/lib/useRoster";

/** Figma: Pattern/Roster/Stat (73:2632) — dark pill with a highlighted value. */
export function RosterStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative flex shrink-0 items-center gap-[6px] overflow-clip whitespace-nowrap rounded-full bg-brand-secondary-dark px-[12px] py-[7px] text-[12px] leading-[18px]">
      <p className="relative shrink-0 text-text-inverse">{label}</p>
      <p className="relative max-w-[80px] shrink-0 truncate font-bold text-brand-accent-tint">{value}</p>
    </div>
  );
}

/** Figma: Pattern/Roster/Header (74:3471) — 345×196 navy masthead. */
export function RosterHeader({
  stats,
  className,
}: {
  stats: Array<{ label: string; value: string }>;
  className?: string;
}) {
  const { state } = useProto();
  return (
    <div
      className={cn(
        "relative h-[196px] w-[345px] shrink-0 overflow-clip rounded-[20px] bg-brand-secondary",
        className,
      )}
    >
      <div className="absolute left-[170px] top-[-40px] size-[260px]">
        <Image
          src="/assets/roster-ring.svg"
          alt=""
          width={260}
          height={260}
          unoptimized
          className="block size-full"
        />
      </div>
      <div className="absolute left-[210px] top-0 size-[180px] opacity-45">
        <Image
          src="/assets/roster-halo.png"
          alt=""
          width={180}
          height={180}
          className="block size-full"
        />
      </div>
      <p className="absolute left-[22px] top-[22px] whitespace-nowrap text-overline-12 text-brand-accent">
        2027 動期 合格者 名單
      </p>
      <div className="absolute left-[22px] top-[44px] whitespace-pre-line font-serif text-h2-22 text-text-inverse">
        {`${displayName(state)}님의\n동기 합격자 명단`}
      </div>
      <div className="absolute left-[22px] top-[136px] flex items-start gap-[8px] overflow-clip">
        {stats.map((stat) => (
          <RosterStat key={stat.label} {...stat} />
        ))}
      </div>
      <MascotFaceBadge
        size={64}
        className="absolute left-[262px] top-[30px] border-[3px]"
      />
    </div>
  );
}

/** Figma: Pattern/Roster/List Header (72:2197). */
export function RosterListHeader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 items-center justify-between overflow-clip whitespace-nowrap",
        className,
      )}
    >
      <p className="relative shrink-0 text-h3-18">석차</p>
      <p className="relative shrink-0 text-caption-12 text-text-tertiary">
        궁합 점수순 · 동점이면 먼저 등록한 친구
      </p>
    </div>
  );
}

/** Figma: Pattern/Roster/List (74:2746) — 궁합 점수 내림차순. */
export function RosterList({ seenAt, className }: { seenAt?: number; className?: string }) {
  const proto = useProto();
  const { entries } = useRoster(seenAt);
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[10px] overflow-clip",
        className,
      )}
    >
      {entries.map((entry) => (
        <CardFriendRow
          key={entry.key}
          initial={entry.initial}
          name={entry.name}
          rank={entry.rank}
          sub={entry.sub}
          score={String(entry.score)}
          showNew={entry.isNew}
          onPress={() => {
            proto.update({ friend: entry.key });
            proto.go("4-3");
          }}
        />
      ))}
    </div>
  );
}

/** Figma: Pattern/Roster/Invite Card (74:3021). */
export function RosterInviteCard({ className }: { className?: string }) {
  const proto = useProto();
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[12px] overflow-clip rounded-[18px] bg-brand-accent-tint px-[20px] py-[18px]",
        className,
      )}
    >
      <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16">
        친구를 더 부르면 석차가 바뀌어요
      </p>
      <p className="relative w-[305px] shrink-0 text-body-m-14 text-text-secondary">
        내 링크로 들어온 친구가 결과를 보면 친구 명단에 내가 올라가요. 친구 링크를 받으면 내 명단에도 추가돼요.
      </p>
      <Button
        label="친구 초대하기"
        size="M"
        onPress={() => proto.go("5-2")}
        className="w-[305px]"
      />
    </div>
  );
}
