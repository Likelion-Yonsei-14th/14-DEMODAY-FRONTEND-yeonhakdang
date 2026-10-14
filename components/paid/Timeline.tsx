import Image from "next/image";

import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/cn";

/**
 * Figma: Pattern/Timeline/Rail (73:2868) + Item (74:3040).
 * The rail ships as three exports: a plain 14×60 segment, the highlighted one,
 * and a 14×14 end cap for the last row.
 */
export type TimelineRail = "default" | "active" | "end";

const RAILS: Record<TimelineRail, { src: string; height: number }> = {
  default: { src: "/assets/timeline-rail.svg", height: 60 },
  active: { src: "/assets/timeline-rail-active.svg", height: 60 },
  end: { src: "/assets/timeline-rail-end.svg", height: 14 },
};

export function TimelineRow({
  rail,
  date,
  title,
  caption,
  badge,
  highlight = false,
}: {
  rail: TimelineRail;
  date: string;
  title: string;
  caption: string;
  badge?: string;
  highlight?: boolean;
}) {
  const { src, height } = RAILS[rail];
  return (
    <div className="relative flex shrink-0 items-start gap-[14px] overflow-clip">
      <div className="relative w-[14px] shrink-0" style={{ height }}>
        <Image src={src} alt="" width={14} height={height} unoptimized className="block size-full" />
      </div>
      <div className="relative flex shrink-0 flex-col items-start gap-[2px] overflow-clip">
        <div className="relative flex shrink-0 items-center gap-[8px] overflow-clip">
          <p
            className={cn(
              "relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-[18px]",
              highlight ? "text-brand-primary" : "text-text-tertiary",
            )}
          >
            {date}
          </p>
          {badge && <Chip type="primary" label={badge} />}
        </div>
        <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14">
          {title}
        </p>
        <p className="relative shrink-0 whitespace-nowrap text-caption-12 text-text-secondary">
          {caption}
        </p>
      </div>
    </div>
  );
}

/** Figma: Pattern/List/Check Row — 알아보는 법 variant (73:2453). */
export function HintCheckRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex shrink-0 items-center gap-[10px] overflow-clip">
      <BadgeIcon icon="icon-check-13" size={20} glyphSize={13} />
      <p className="relative w-[270px] shrink-0 text-body-m-14">{children}</p>
    </div>
  );
}
