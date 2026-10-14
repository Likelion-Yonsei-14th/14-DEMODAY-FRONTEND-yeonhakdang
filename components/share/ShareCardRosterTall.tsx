"use client";

import Image from "next/image";

import { RankLabel, type RankKind } from "@/components/roster/RankLabel";
import { cn } from "@/lib/cn";
import { displayName, useProto } from "@/lib/proto";

/**
 * Figma: Share Card / 합격자 명단 · 9:16 (27:1048) — authored at its native
 * 360×640 on the artboard, exported at 1080×1920 (3×).
 */
export const SHARE_CARD_ROSTER_TALL = { width: 360, height: 640 };

const ROWS: Array<{ name: string; rank: RankKind; score: string }> = [
  { name: "민지", rank: "수석 동기", score: "92" },
  { name: "서준", rank: "차석", score: "88" },
  { name: "하린", rank: "합격", score: "81" },
  { name: "도윤", rank: "합격", score: "76" },
  { name: "지우", rank: "추가 합격", score: "64" },
];

export function ShareCardRosterTall({
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
        width: SHARE_CARD_ROSTER_TALL.width * scale,
        height: SHARE_CARD_ROSTER_TALL.height * scale,
      }}
    >
      <div
        className="relative overflow-clip bg-bg-base"
        style={{
          width: SHARE_CARD_ROSTER_TALL.width,
          height: SHARE_CARD_ROSTER_TALL.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className="absolute left-0 top-0 h-[210px] w-full bg-brand-secondary" />
        <p className="absolute left-[28px] top-[32px] whitespace-nowrap font-bold text-body-m-14 text-text-inverse">
          연학당
        </p>
        <p className="absolute left-[28px] top-[84px] whitespace-nowrap text-overline-12 text-brand-accent">
          2027 動期 合格者 名單
        </p>
        <div className="absolute left-[28px] top-[106px] whitespace-pre-line font-serif text-h2-22 text-text-inverse">
          {`${owner}님의\n동기 합격자 명단`}
        </div>

        {/* mascot stage (27:1054) — Mascot/연학이 · 날기 */}
        <div className="absolute left-[216px] top-[70px] size-[120px] overflow-clip rounded-full bg-bg-base">
          <Image
            src="/assets/mascot-flying.png"
            alt=""
            width={130}
            height={123.32}
            className="pointer-events-none absolute left-[-5px] top-[6.28px] max-w-none object-cover"
          />
        </div>

        {/* 명단 (27:1057) */}
        <div className="absolute left-[28px] top-[186px] flex flex-col items-start overflow-clip rounded-[16px] border-[1.5px] border-brand-accent bg-surface-default shadow-card">
          {ROWS.map(({ name, rank, score }, i) => (
            <div
              key={name}
              className={cn(
                "relative flex h-[44px] w-[304px] shrink-0 items-center gap-[10px] overflow-clip px-[16px] py-[11px]",
                i > 0 && "border-t border-line-default",
              )}
            >
              <p
                className={cn(
                  "relative shrink-0 whitespace-nowrap text-h3-18",
                  i === 0 ? "text-brand-accent" : "text-text-tertiary",
                )}
              >
                {i + 1}
              </p>
              <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16">
                {name}
              </p>
              <RankLabel rank={rank} />
              <div className="relative h-px min-w-px flex-1" />
              <p className="relative shrink-0 whitespace-nowrap font-serif text-score-28 text-brand-secondary">
                {score}
              </p>
            </div>
          ))}
        </div>

        <p className="absolute left-[28px] top-[486px] whitespace-nowrap text-h3-18">
          내 동기 수석 합격자는 누구?
        </p>
        <p className="absolute left-[28px] top-[516px] whitespace-nowrap text-body-m-14 text-text-secondary">
          너도 합격 확인하고 명단에 들어와!
        </p>
        <div className="absolute left-[28px] top-[556px] flex items-center overflow-clip rounded-full bg-brand-primary px-[16px] py-[10px]">
          <p className="relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-[18px] text-text-inverse">
            링크로 내 학과 찾기 →
          </p>
        </div>

        {/* Decorative sparkles (27:1097, 27:1098) */}
        <p className="absolute left-[320px] top-[500px] whitespace-nowrap text-[14px] leading-[26px] text-brand-accent">
          ✦
        </p>
        <p className="absolute left-[296px] top-[560px] whitespace-nowrap text-[10px] leading-[26px] text-brand-accent">
          ✦
        </p>

        <p className="absolute left-[28px] top-[608px] whitespace-nowrap font-medium text-caption-11 text-text-tertiary">
          * 궁합 점수 기준 석차예요
        </p>
      </div>
    </div>
  );
}
