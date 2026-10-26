import { cn } from "@/lib/cn";

/**
 * Figma: Chip — type=Tint (14:82) | Gold (14:88) | Outline (14:84) |
 * Primary (14:86).
 */
export type ChipType = "tint" | "gold" | "outline" | "primary";

const STYLES: Record<ChipType, { pill: string; text: string }> = {
  tint: { pill: "bg-brand-secondary-tint", text: "text-brand-secondary" },
  gold: {
    pill: "border border-brand-accent bg-brand-accent-tint",
    text: "text-text-primary",
  },
  outline: { pill: "border border-line-strong", text: "text-text-secondary" },
  primary: { pill: "bg-brand-primary", text: "text-text-inverse" },
};

export function Chip({
  label,
  type = "tint",
  className,
}: {
  label: string;
  type?: ChipType;
  className?: string;
}) {
  const { pill, text } = STYLES[type];
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center rounded-full px-[10px] py-[4px]",
        pill,
        className,
      )}
    >
      <p
        className={cn(
          "relative min-w-0 truncate text-[12px] font-bold leading-[18px]",
          text,
        )}
      >
        {label}
      </p>
    </div>
  );
}
