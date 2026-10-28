"use client";

import Image from "next/image";

import { cn } from "@/lib/cn";
import { displayName, useProto } from "@/lib/proto";
import { useAnalysis } from "@/lib/useAnalysis";

/**
 * Figma: Share Card / 학과 결과 · 9:16 (27:1011).
 *
 * The frames place this at 216×384, which is exactly 0.6× of a 360×640 card —
 * every value in the export divides cleanly by 0.6 and lands back on the
 * design system scale (Display/32 for 경영학과, Overline/12 for the eyebrow,
 * Chip's own 10/4 padding). So the card is authored at its native 360×640
 * here and scaled by the caller; the 1080×1920 export is the same card at 3×.
 */
export const SHARE_CARD_9_16 = { width: 360, height: 640 };

/** Display/32 fits about 9 글자 across the card; longer names step down. */
export function majorTitleClass(name: string, roomy: number): string {
  return name.length > roomy ? "text-h1-26" : "text-display-32";
}

export function ShareCardMajor({
  scale = 1,
  className,
}: {
  scale?: number;
  className?: string;
}) {
  const owner = displayName(useProto().state);
  const { top, dayMaster } = useAnalysis();
  const first = top[0];
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{
        width: SHARE_CARD_9_16.width * scale,
        height: SHARE_CARD_9_16.height * scale,
      }}
    >
      <div
        className="relative overflow-clip bg-brand-secondary shadow-[0_8px_24px_0_rgba(11,58,122,0.18)]"
        style={{
          width: SHARE_CARD_9_16.width,
          height: SHARE_CARD_9_16.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className="absolute left-[-80px] top-[170px] size-[520px]">
          <Image src="/assets/card-ring.svg" alt="" width={520} height={520} unoptimized className="block size-full" />
        </div>
        <div className="absolute left-[-30px] top-[220px] size-[420px] opacity-45">
          <Image src="/assets/card-halo.png" alt="" width={420} height={420} className="block size-full" />
        </div>

        <p className="absolute left-[28px] top-[32px] whitespace-nowrap font-bold text-body-m-14 text-text-inverse">
          연학당
        </p>
        <p className="absolute left-[264px] top-[34px] whitespace-nowrap text-caption-12 text-brand-accent-tint">
          2027 수험생
        </p>

        <p className="absolute left-[28px] top-[84px] whitespace-nowrap text-overline-12 text-brand-accent">
          {owner}님의 사주 학과
        </p>
        <p className={cn("absolute left-[28px] top-[106px] whitespace-nowrap font-serif text-text-inverse", majorTitleClass(first.major.대표학과[0], 9))}>
          {first.major.대표학과[0]}
        </p>

        <div className="absolute left-[28px] top-[156px] flex items-baseline gap-[4px] overflow-clip whitespace-nowrap">
          <p className="relative shrink-0 text-caption-12 text-brand-accent-tint">적합도</p>
          <p className="relative shrink-0 font-serif text-h2-22 font-black text-brand-accent">{first.display}</p>
          <p className="relative shrink-0 text-[12px] font-bold leading-[18px] text-brand-accent">
            점
          </p>
        </div>

        <div className="absolute left-[28px] top-[204px] flex items-center rounded-full border border-brand-accent bg-brand-accent-tint px-[10px] py-[4px]">
          <p className="relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-[18px]">
            #{dayMaster.name} · {dayMaster.type}
          </p>
        </div>

        {/* Decorative sparkles (27:1028, 27:1029) */}
        <p className="absolute left-[54px] top-[282px] whitespace-nowrap text-[16px] leading-[26px] text-brand-accent">
          ✦
        </p>
        <p className="absolute left-[300px] top-[300px] whitespace-nowrap text-[12px] leading-[26px] text-brand-accent">
          ✦
        </p>

        {/* TOP3 (27:1031) — radius 14 at 0.6× resolves to 23.33 natively. */}
        <div className="absolute left-[28px] top-[484px] flex flex-col items-start gap-[8px] overflow-clip rounded-[23.333px] bg-brand-secondary-dark px-[16px] py-[14px] text-body-m-14 leading-[22px] whitespace-nowrap">
          {top.map((pick, i) => (
            <div
              key={pick.major.id}
              className="relative flex h-[20px] w-[272px] shrink-0 items-center justify-between overflow-clip"
            >
              <div className="relative flex shrink-0 items-start gap-[10px] overflow-clip">
                <p className="relative shrink-0 font-bold text-brand-accent">{i + 1}</p>
                <p className="relative shrink-0 font-medium text-text-inverse">{pick.major.대표학과[0]}</p>
              </div>
              <p className="relative shrink-0 font-bold text-brand-accent-tint">{pick.display}</p>
            </div>
          ))}
        </div>

        <p className="absolute left-[28px] top-[604px] whitespace-nowrap text-caption-12 text-brand-accent-tint">
          너도 사주로 내 학과 찾아봐 → 프로필 링크
        </p>
      </div>
    </div>
  );
}
