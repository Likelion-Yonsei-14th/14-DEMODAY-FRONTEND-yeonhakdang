import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";

/** Figma: Pattern/Form/Step Progress (74:4163) — overline label + progress bar. */
export function StepProgress({
  label,
  value,
  className,
}: {
  label: string;
  /** 0–1 */
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-start gap-[8px] overflow-clip",
        className,
      )}
    >
      <p className="relative shrink-0 whitespace-nowrap text-overline-12 text-brand-secondary">
        {label}
      </p>
      <ProgressBar value={value} className="shrink-0" />
    </div>
  );
}
