"use client";

import Image from "next/image";

import { cn } from "@/lib/cn";
import { displayName, useProto } from "@/lib/proto";

/**
 * Figma: Share Card / 학과 결과 · 1:1 (27:1100) — the square crop used for the
 * KakaoTalk link preview. Placed at 260px, which is 0.7222× of a native
 * 360×360 card (24px gutter, Display/32 title, Number/Score 28).
 */
export const SHARE_CARD_MAJOR_SQUARE = { width: 360, height: 360 };

export function ShareCardMajorSquare({
  scale = 1,
  className,
}: {
  scale?: number;
  className?: string;
}) {
  const owner = displayName(useProto().state);
  return (
    <div
      className={cn("relative shrink-0 overflow-clip", className)}
      style={{
        width: SHARE_CARD_MAJOR_SQUARE.width * scale,
        height: SHARE_CARD_MAJOR_SQUARE.height * scale,
      }}
    >
      <div
        className="relative overflow-clip bg-brand-secondary"
        style={{
          width: SHARE_CARD_MAJOR_SQUARE.width,
          height: SHARE_CARD_MAJOR_SQUARE.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className="absolute left-[150px] top-[60px] size-[300px]">
          <Image
            src="/assets/card-ring-square.svg"
            alt=""
            width={300}
            height={300}
            unoptimized
            className="block size-full"
          />
        </div>

        <p className="absolute left-[24px] top-[24px] whitespace-nowrap text-[12px] font-bold leading-[18px] text-text-inverse">
          연학당
        </p>
        <p className="absolute left-[24px] top-[64px] whitespace-nowrap text-overline-12 text-brand-accent">
          {owner}님의 사주 학과
        </p>
        <p className="absolute left-[24px] top-[86px] whitespace-nowrap font-serif text-display-32 text-text-inverse">
          경영학과
        </p>

        <div className="absolute left-[24px] top-[134px] flex items-baseline gap-[4px] overflow-clip whitespace-nowrap">
          <p className="relative shrink-0 text-caption-12 text-brand-accent-tint">적합도</p>
          <p className="relative shrink-0 font-serif text-score-28 text-brand-accent">94</p>
          <p className="relative shrink-0 text-[12px] font-bold leading-[18px] text-brand-accent">
            점
          </p>
        </div>

        <div className="absolute left-[24px] top-[182px] flex items-center rounded-full border border-brand-accent bg-brand-accent-tint px-[10px] py-[4px]">
          <p className="relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-[18px]">
            #개척하는 리더형
          </p>
        </div>

        {/* mascot stage (27:1112) — Mascot/학과 컨셉 · 원형 */}
        <div className="absolute left-[170px] top-[120px] size-[170px] overflow-clip rounded-full bg-bg-base">
          <Image
            src="/assets/major-round.png"
            alt=""
            fill
            sizes="170px"
            className="pointer-events-none scale-[1.1115] object-cover"
          />
        </div>

        <div className="absolute left-[24px] top-[232px] whitespace-pre-line text-caption-12 text-brand-accent-tint">
          {"2위 정치외교학과 89\n3위 언론홍보영상학부 86"}
        </div>
        <p className="absolute left-[24px] top-[322px] whitespace-nowrap font-medium text-caption-11 text-brand-accent-tint">
          너도 내 학과 찾아봐 → 프로필 링크
        </p>
      </div>
    </div>
  );
}
