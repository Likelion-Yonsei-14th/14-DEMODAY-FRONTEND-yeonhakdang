import { BadgeIcon } from "@/components/ui/BadgeIcon";
import { cn } from "@/lib/cn";

/** Figma: Pattern/List/Check Row (73:2387). */
export function CheckRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex items-center gap-[10px] overflow-clip", className)}
    >
      <BadgeIcon />
      <p className="relative shrink-0 whitespace-nowrap text-body-m-14">{children}</p>
    </div>
  );
}

/** Figma: Pattern/Auth/Benefit List (74:2972) — bordered card of check rows. */
export function BenefitList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-start gap-[12px] overflow-clip rounded-[16px] border border-line-default bg-surface-default px-[18px] py-[16px]",
        className,
      )}
    >
      {items.map((item) => (
        <CheckRow key={item}>{item}</CheckRow>
      ))}
    </div>
  );
}
