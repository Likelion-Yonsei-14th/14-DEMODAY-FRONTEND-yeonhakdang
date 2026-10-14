import { cn } from "@/lib/cn";

/** Figma: Progress Bar (15:158) — 8px track, brand-secondary fill. */
export function ProgressBar({
  value,
  className,
}: {
  /** 0–1 */
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-[8px] w-full overflow-clip rounded-[4px] bg-brand-secondary-tint",
        className,
      )}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-[4px] bg-brand-secondary"
        style={{ width: `${Math.min(Math.max(value, 0), 1) * 100}%` }}
      />
    </div>
  );
}
