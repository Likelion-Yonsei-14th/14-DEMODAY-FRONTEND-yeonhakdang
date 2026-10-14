"use client";

import Image from "next/image";

import { Mascot, type MascotPose } from "@/components/mascot/Mascot";
import { MascotFaceBadge } from "@/components/mascot/MascotFaceBadge";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Tap } from "@/components/ui/Tap";
import { cn } from "@/lib/cn";
import { useProto } from "@/lib/proto";

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
        {/* The frame draws every bar at 284.83 of 313. */}
        <div
          className={cn("absolute left-0 top-0 h-[8px] rounded-[4px]", barClass)}
          style={{ width: 284.83 }}
        />
      </div>
      <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-secondary">
        {note}
      </p>
    </div>
  );
}

/**
 * Figma: chart (32:1655) — a 309×170 bar chart whose bars, labels and values
 * are absolutely placed, so their coordinates are carried over verbatim.
 */
export type MonthBar = {
  month: string;
  value: string;
  /** Bar box */
  left: number;
  top: number;
  height: number;
  /** Label and value x positions, and the value's y */
  labelLeft: number;
  valueLeft: number;
  valueTop: number;
  peak?: boolean;
};

export const MONTH_BARS: MonthBar[] = [
  { month: "10월", value: "62", left: 14, top: 55, height: 81, labelLeft: 18.5, valueLeft: 23.5, valueTop: 37 },
  { month: "11월", value: "78", left: 75, top: 35, height: 101, labelLeft: 79.5, valueLeft: 84.5, valueTop: 17 },
  { month: "12월", value: "92", left: 136, top: 16, height: 120, labelLeft: 140.5, valueLeft: 145.5, valueTop: -2, peak: true },
  { month: "1월", value: "70", left: 197, top: 45, height: 91, labelLeft: 205, valueLeft: 206.5, valueTop: 27 },
  { month: "2월", value: "84", left: 258, top: 27, height: 109, labelLeft: 266, valueLeft: 267.5, valueTop: 9 },
];

export function MonthlyEnergyChart() {
  return (
    <div className="relative h-[170px] w-[309px] shrink-0 overflow-clip">
      {[10, 46, 82, 118].map((top) => (
        <div
          key={top}
          className="absolute left-0 h-px w-[309px] bg-line-default"
          style={{ top }}
        />
      ))}
      {MONTH_BARS.map((bar) => (
        <div key={bar.month}>
          <div
            className={cn(
              "absolute w-[34px] rounded-t-[8px]",
              bar.peak ? "bg-brand-primary" : "bg-brand-secondary-light opacity-85",
            )}
            style={{ left: bar.left, top: bar.top, height: bar.height }}
          />
          <p
            className={cn(
              "absolute top-[144px] whitespace-nowrap text-caption-12",
              bar.peak ? "text-brand-primary" : "text-text-secondary",
            )}
            style={{ left: bar.labelLeft }}
          >
            {bar.month}
          </p>
          <p
            className={cn(
              "absolute whitespace-nowrap text-[12px] font-bold leading-[18px]",
              bar.peak ? "text-brand-primary" : "text-text-secondary",
            )}
            style={{ left: bar.valueLeft, top: bar.valueTop }}
          >
            {bar.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Figma: 11월 주간 기운 tiles (32:1687…). */
export const WEEK_TILES = [
  { week: "1주", level: "보통", tile: "bg-bg-subtle", text: "text-text-secondary" },
  {
    week: "2주",
    level: "좋음",
    tile: "bg-brand-secondary-tint",
    text: "text-brand-secondary",
  },
  { week: "3주", level: "최고", tile: "bg-brand-primary", text: "text-text-inverse" },
  {
    week: "4주",
    level: "주의",
    tile: "bg-brand-accent-tint",
    text: "text-text-primary",
  },
];

export function WeeklyEnergy() {
  return (
    <div className="relative flex w-[309px] shrink-0 items-start gap-[8px] overflow-clip">
      {WEEK_TILES.map(({ week, level, tile, text }) => (
        <div
          key={week}
          className={cn(
            "relative flex min-w-px flex-1 flex-col items-center gap-[2px] overflow-clip rounded-[12px] py-[12px]",
            tile,
            text,
          )}
        >
          <p className="relative shrink-0 text-caption-12">{week}</p>
          <p className="relative shrink-0 font-bold text-body-m-14">{level}</p>
        </div>
      ))}
    </div>
  );
}
