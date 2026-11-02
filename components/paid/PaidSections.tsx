"use client";

import Image from "next/image";

import { Mascot, type MascotPose } from "@/components/mascot/Mascot";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";
import type { WeekLevel } from "@/lib/saju/paid";

/**
 * Figma: hero (32:1591 · 33:1638) — the navy masthead on the paid results,
 * with the logo top bar drawn in white on top of it.
 */
export function PaidHero({
  height,
  badge,
  title,
  subtitle,
  pose,
  poseInner,
  stageSize,
  sparkles,
  className,
}: {
  height: number;
  badge: string;
  title: string;
  subtitle: string;
  pose: MascotPose;
  poseInner: { left: number; top: number; width: number; height: number };
  stageSize: { left: number; top: number; size: number };
  sparkles: Array<{ left: number; top: number; size: number }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full shrink-0 overflow-clip bg-brand-secondary",
        className,
      )}
      style={{ height }}
    >
      <div className="absolute left-[170px] top-[-30px] size-[340px]">
        <Image src="/assets/paid-hero-ring.svg" alt="" width={340} height={340} unoptimized className="block size-full" />
      </div>

      <div
        className="absolute overflow-clip rounded-full bg-bg-base"
        style={{
          left: stageSize.left,
          top: stageSize.top,
          width: stageSize.size,
          height: stageSize.size,
        }}
      >
        <Mascot
          pose={pose}
          className="absolute rounded-[24px] bg-bg-base"
          width={poseInner.width}
          height={poseInner.height}
          style={{ left: poseInner.left, top: poseInner.top }}
        />
      </div>

      <Chip type="gold" label={badge} className="absolute left-[24px] top-[112px]" />
      <div className="absolute left-[24px] top-[152px] whitespace-pre-line font-serif text-h1-26 text-text-inverse">
        {title}
      </div>
      <p className="absolute left-[24px] top-[228px] w-[345px] text-body-m-14 text-brand-accent-tint">
        {subtitle}
      </p>

      {sparkles.map(({ left, top, size }) => (
        <p
          key={`${left}-${top}`}
          className="absolute whitespace-nowrap leading-[26px] text-brand-accent"
          style={{ left, top, fontSize: size }}
        >
          ✦
        </p>
      ))}
    </div>
  );
}

/** Figma: Top Bar · Logo drawn over the navy hero (32:1603) — white wordmark. */
export function PaidTopBar({ className }: { className?: string }) {
  const { openMenu } = useProto();
  return (
    <div
      className={cn(
        "relative flex h-[52px] w-full shrink-0 items-center gap-[4px] px-[12px]",
        className,
      )}
    >
      <div className="relative flex min-w-px flex-1 items-center gap-[8px] overflow-clip pl-[8px]">
        <MascotFaceBadge size={32} className="border-2" />
        <p className="whitespace-nowrap font-serif text-[18px] font-black leading-[26px] tracking-[-0.108px] text-text-inverse">
          연학당
        </p>
      </div>
      <Tap
        label="메뉴"
        onPress={openMenu}
        className="relative flex size-[44px] shrink-0 items-center justify-center overflow-clip rounded-full"
      >
        <Icon name="icon-menu-light" />
      </Tap>
    </div>
  );
}

/** Figma: Pattern/University/Score (73:2440). */
export function UniversityScore({ score }: { score: string }) {
  return (
    <div className="relative flex shrink-0 items-baseline gap-[2px] overflow-clip whitespace-nowrap text-brand-secondary">
      <p className="relative shrink-0 font-serif text-score-28">{score}</p>
      <p className="relative shrink-0 text-[12px] font-bold leading-[18px]">점</p>
    </div>
  );
}

/**
 * Figma: Pattern/University/Rank Card (75:3197) + Rank Row (75:3176) +
 * Score Bar (73:2799). Rank 1 carries the 2px navy border and gold numeral.
 */
export function UniversityRankCard({
  rank,
  name,
  score,
  barClass,
  note,
  badge,
}: {
  rank: number;
  name: string;
  score: string;
  barClass: string;
  note: string;
  badge?: string;
}) {
  const isFirst = rank === 1;
  return (
    <div
      className={cn(
        "relative flex w-[345px] shrink-0 flex-col items-start gap-[10px] overflow-clip rounded-[16px] bg-surface-default p-[16px]",
        isFirst
          ? "border-2 border-brand-secondary"
          : "border border-line-default",
      )}
    >
      <div className="relative flex w-[313px] shrink-0 items-center gap-[8px] overflow-clip">
        <p
          className={cn(
            "relative shrink-0 whitespace-nowrap text-h3-18",
            isFirst ? "text-brand-accent" : "text-text-tertiary",
          )}
        >
          {rank}
        </p>
        <p className="relative shrink-0 whitespace-nowrap font-bold text-body-l-16">
          {name}
        </p>
        {badge && <Chip type="gold" label={badge} />}
        <div className="relative h-px min-w-px flex-1" />
        <UniversityScore score={score} />
      </div>
      <div className="relative h-[8px] w-[313px] shrink-0 overflow-clip rounded-[4px] bg-bg-subtle">
        {/* The frame's 284.83 of 313 is its 91점: the bar is the score's share of 313. */}
        <div
          className={cn("absolute left-0 top-0 h-[8px] rounded-[4px]", barClass)}
          style={{ width: (313 * Number(score)) / 100 }}
        />
      </div>
      <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-secondary">
        {note}
      </p>
    </div>
  );
}

/**
 * Figma: chart (32:1655) — a 309×170 bar chart. Bars are 34 wide, standing
 * on y=136 and spread evenly between 14px margins (61px apart for the
 * frame's 5 months). 1점 is 1.2px of bar, so even 100점 leaves its value
 * label inside the chart (the frame drew 92점 at 120px).
 */
const BAR_X = 14;
const BAR_WIDTH = 34;
const BAR_BASE = 136;
const PX_PER_POINT = 1.2;

export function MonthlyEnergyChart({ months }: { months: Array<{ label: string; value: number; peak: boolean }> }) {
  return (
    <div className="relative h-[170px] w-[309px] shrink-0 overflow-clip">
      {[10, 46, 82, 118].map((top) => (
        <div
          key={top}
          className="absolute left-0 h-px w-[309px] bg-line-default"
          style={{ top }}
        />
      ))}
      {months.map((bar, i) => {
        const step = months.length > 1 ? (309 - 2 * BAR_X - BAR_WIDTH) / (months.length - 1) : 0;
        const height = Math.round(bar.value * PX_PER_POINT);
        const left = BAR_X + i * step;
        const tone = bar.peak ? "text-brand-primary" : "text-text-secondary";
        return (
          <div key={bar.label}>
            <div
              className={cn(
                "absolute rounded-t-[8px]",
                bar.peak ? "bg-brand-primary" : "bg-brand-secondary-light opacity-85",
              )}
              style={{ left, top: BAR_BASE - height, width: BAR_WIDTH, height }}
            />
            <p
              className={cn("absolute top-[144px] w-[54px] text-center text-caption-12", tone)}
              style={{ left: left - 10 }}
            >
              {bar.label}
            </p>
            <p
              className={cn("absolute w-[54px] text-center text-[12px] font-bold leading-[18px]", tone)}
              style={{ left: left - 10, top: BAR_BASE - height - 18 }}
            >
              {bar.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Figma: 11월 주간 기운 tiles (32:1687…) — one look per level. */
const WEEK_LOOK: Record<WeekLevel, { tile: string; text: string }> = {
  보통: { tile: "bg-bg-subtle", text: "text-text-secondary" },
  좋음: { tile: "bg-brand-secondary-tint", text: "text-brand-secondary" },
  최고: { tile: "bg-brand-primary", text: "text-text-inverse" },
  주의: { tile: "bg-brand-accent-tint", text: "text-text-primary" },
};

export function WeeklyEnergy({ weeks }: { weeks: Array<{ label: string; level: WeekLevel }> }) {
  return (
    <div className="relative flex w-[309px] shrink-0 items-start gap-[8px] overflow-clip">
      {weeks.map(({ label, level }) => (
        <div
          key={label}
          className={cn(
            "relative flex min-w-px flex-1 flex-col items-center gap-[2px] overflow-clip rounded-[12px] py-[12px]",
            WEEK_LOOK[level].tile,
            WEEK_LOOK[level].text,
          )}
        >
          <p className="relative shrink-0 text-caption-12">{label}</p>
          <p className="relative shrink-0 font-bold text-body-m-14">{level}</p>
        </div>
      ))}
    </div>
  );
}
