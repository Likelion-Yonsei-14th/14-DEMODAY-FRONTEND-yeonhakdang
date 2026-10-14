import { cn } from "@/lib/cn";

export type TrustStat = { value: string; label: string };

/**
 * Figma: Pattern/Landing/Trust Stats (74:3330) — bordered card of
 * Pattern/Landing/Trust Stat (74:3126) columns.
 */
export function TrustStats({
  stats,
  className,
}: {
  stats: TrustStat[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full items-start overflow-clip rounded-[14px] border border-line-default bg-surface-default py-[14px] whitespace-nowrap",
        className,
      )}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative flex min-w-px flex-1 flex-col items-center gap-[2px] overflow-clip"
        >
          <p className="relative shrink-0 font-serif text-[16px] font-black leading-[24px] tracking-[-0.064px] text-brand-secondary">
            {stat.value}
          </p>
          <p className="relative shrink-0 text-caption-12 text-text-secondary">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
