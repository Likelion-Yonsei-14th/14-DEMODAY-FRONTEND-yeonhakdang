"use client";

import Image from "next/image";

import { RankLabel, type RankKind } from "@/components/roster/RankLabel";
import { cn } from "@/lib/cn";
import { displayName, useProto } from "@/lib/proto";

/**
 * Figma: Share Card / 합격자 명단 · 1:1 (27:1117).
 *
 * Placed at 309.6px in the frames, which is 0.86× of a 360×360 card — every
 * value divides cleanly (24px gutter, Caption/12 eyebrow, Heading/H3 title),
 * so the card is authored at native size and scaled by the caller.
 */
export const SHARE_CARD_1_1 = { width: 360, height: 360 };

const ROWS: Array<{ name: string; rank: RankKind; score: string }> = [
  { name: "민지", rank: "수석 동기", score: "92" },
  { name: "서준", rank: "차석", score: "88" },
  { name: "하린", rank: "합격", score: "81" },
];

export function ShareCardRoster({
  scale = 1,
  className,
}: {
  scale?: number;
  className?: string;
}) {
  const owner = displayName(useProto().state);
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{
        width: SHARE_CARD_1_1.width * scale,
        height: SHARE_CARD_1_1.height * scale,
      }}
    >
      <div
        className="relative overflow-clip bg-bg-base shadow-[0_8px_24px_0_rgba(11,58,122,0.18)]"
        style={{
          width: SHARE_CARD_1_1.width,
          height: SHARE_CARD_1_1.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className="absolute left-0 top-0 h-[112px] w-full bg-brand-secondary" />
        <p className="absolute left-[24px] top-[24px] whitespace-nowrap text-overline-12 text-brand-accent">
          2027 動期 合格者 名單
        </p>
        <p className="absolute left-[24px] top-[46px] whitespace-nowrap text-h3-18 text-text-inverse">
          {owner}님의 동기 명단
        </p>

        {/* mascot stage (27:1122) */}
        <div className="absolute left-[256px] top-[14px] size-[84px] overflow-clip rounded-[48.837px] bg-bg-base">
          <Image
            src="/assets/mascot-flying.png"
            alt=""
            width={90}
            height={85.376}
            className="pointer-events-none absolute left-[-3px] top-[5.349px] max-w-none object-cover"
          />
        </div>

        {/* 석차 표 (27:1125) */}
        <div className="absolute left-[24px] top-[96px] flex flex-col items-start overflow-clip rounded-[16.279px] border-[1.5px] border-brand-accent bg-surface-default">
          {ROWS.map(({ name, rank, score }) => (
            <div
              key={name}
              className="relative flex h-[40px] w-[312px] shrink-0 items-center gap-[10px] overflow-clip px-[14px] py-[9px]"
            >
              <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14">
                {name}
              </p>
              <RankLabel rank={rank} />
              <div className="relative h-px min-w-px flex-1" />
              <p className="relative shrink-0 whitespace-nowrap text-h3-18 text-brand-secondary">
                {score}
              </p>
            </div>
          ))}
        </div>

        <p className="absolute left-[24px] top-[262px] whitespace-nowrap font-bold text-body-l-16">
          내 동기 수석 합격자는 누구?
        </p>
        <p className="absolute left-[24px] top-[290px] whitespace-nowrap text-caption-12 text-brand-primary">
          너도 합격 확인해봐 → 링크
        </p>
        <p className="absolute left-[24px] top-[322px] whitespace-nowrap font-medium text-caption-11 text-text-tertiary">
          외 2명 · 궁합 점수 기준 석차
        </p>
      </div>
    </div>
  );
}
