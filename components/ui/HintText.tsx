import { cn } from "@/lib/cn";

/**
 * Figma: Pattern/Guide/Hint Text (73:2891) — a bold line over a muted
 * Caption/11 line. Also used for the payment-method rows (73:2895 · 73:2898).
 */
export function HintText({
  title,
  caption,
  captionTone = "tertiary",
  className,
}: {
  title: string;
  caption: string;
  captionTone?: "tertiary" | "secondary";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col items-start overflow-clip whitespace-nowrap",
        className,
      )}
    >
      <p className="relative shrink-0 font-bold text-body-m-14">{title}</p>
      <p
        className={cn(
          "relative shrink-0 font-medium text-caption-11",
          captionTone === "secondary" ? "text-text-secondary" : "text-text-tertiary",
        )}
      >
        {caption}
      </p>
    </div>
  );
}
