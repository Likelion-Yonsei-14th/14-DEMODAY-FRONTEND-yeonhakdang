import { cn } from "@/lib/cn";

/** Figma: Card/Compat Type — kind=Good (17:204) | Clash (17:211). */
export function CardCompatType({
  kind,
  title,
  description,
  className,
}: {
  kind: "good" | "clash";
  title: string;
  description: string;
  className?: string;
}) {
  const isClash = kind === "clash";
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 items-start gap-[12px] rounded-[14px] px-[16px] py-[14px]",
        isClash ? "bg-brand-primary-tint" : "bg-brand-secondary-tint",
        className,
      )}
    >
      <div className="relative flex size-[36px] shrink-0 items-center justify-center overflow-clip rounded-[10px] bg-surface-default">
        <p
          className={cn(
            "relative shrink-0 whitespace-nowrap font-bold text-body-l-16",
            isClash ? "text-brand-primary" : "text-brand-secondary",
          )}
        >
          {isClash ? "△" : "◎"}
        </p>
      </div>
      <div className="relative flex min-w-px flex-1 flex-col items-start gap-[2px] overflow-clip">
        <p
          className={cn(
            "relative shrink-0 whitespace-nowrap text-[12px] font-bold leading-[18px]",
            isClash ? "text-brand-primary" : "text-brand-secondary",
          )}
        >
          {isClash ? "부딪히는 유형" : "잘 맞는 유형"}
        </p>
        <p className="relative shrink-0 whitespace-nowrap font-bold text-body-m-14">
          {title}
        </p>
        <p className="relative w-full shrink-0 text-caption-12 text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}
