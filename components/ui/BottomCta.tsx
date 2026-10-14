import { cn } from "@/lib/cn";

/**
 * Figma: Pattern/Bottom CTA (73:2709) — 393×112 dock with a hairline top
 * border; the button sits 12px from the top and 24px from each side.
 */
export function BottomCta({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-[112px] w-full shrink-0 overflow-clip bg-bg-base",
        className,
      )}
    >
      <div className="absolute left-0 top-0 h-px w-full bg-line-default" />
      <div className="absolute left-[24px] right-[24px] top-[12px] flex flex-col gap-[8px]">
        {children}
      </div>
    </div>
  );
}
