import { FiveElement, type ElementKey } from "@/components/saju/FiveElement";
import { cn } from "@/lib/cn";

/** Figma: Pattern/Roster/Element Compare (74:3242) — chip + "이름 · 천간" caption. */
export function ElementCompare({
  element,
  caption,
  className,
}: {
  element: ElementKey;
  caption: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col items-center gap-[6px] overflow-clip whitespace-nowrap",
        className,
      )}
    >
      <FiveElement element={element} active size={52} />
      <p className="relative max-w-[96px] shrink-0 truncate text-[12px] font-bold leading-[18px]">
        {caption}
      </p>
    </div>
  );
}
