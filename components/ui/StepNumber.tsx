import { cn } from "@/lib/cn";

/** Figma: Pattern/Badge/Step Number (72:2250) — 22px tinted numeral badge. */
export function StepNumber({ n, className }: { n: number; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex size-[22px] shrink-0 items-center justify-center overflow-clip rounded-full bg-brand-secondary-tint",
        className,
      )}
    >
      <p className="relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-[18px] text-brand-secondary">
        {n}
      </p>
    </div>
  );
}

/**
 * Figma: Pattern/List/Numbered Row — 랜딩 (73:2370, 10px gap) and
 * 빈 명단 (73:2423, 12px gap).
 */
export function NumberedRow({
  n,
  gap = 10,
  weight = "medium",
  children,
  className,
}: {
  n: number;
  gap?: 10 | 12;
  weight?: "medium" | "regular";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center overflow-clip",
        gap === 12 ? "gap-[12px]" : "gap-[10px]",
        className,
      )}
    >
      <StepNumber n={n} />
      <p
        className={cn(
          "relative shrink-0 whitespace-nowrap text-body-m-14",
          weight === "medium" && "font-medium",
        )}
      >
        {children}
      </p>
    </div>
  );
}
