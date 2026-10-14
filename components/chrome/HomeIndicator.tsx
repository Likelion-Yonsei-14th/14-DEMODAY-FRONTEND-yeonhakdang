import { cn } from "@/lib/cn";

/** Figma: Home Indicator (16:199) — 393×34. */
export function HomeIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-[34px] w-full shrink-0", className)}>
      <div className="absolute bottom-[8px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-[3px] bg-text-primary" />
    </div>
  );
}
