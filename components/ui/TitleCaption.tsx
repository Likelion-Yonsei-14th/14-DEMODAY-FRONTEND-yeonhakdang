import { cn } from "@/lib/cn";

/** Figma: Pattern/Text/Title + Caption (74:3086). */
export function TitleCaption({
  title,
  caption,
  muted = false,
  className,
}: {
  title: string;
  caption?: string;
  /** Pending rows render the title in tertiary text with no caption. */
  muted?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col items-start gap-[2px] overflow-clip whitespace-nowrap",
        className,
      )}
    >
      <p
        className={cn(
          "relative shrink-0 text-body-m-14",
          muted ? "text-text-tertiary" : "font-bold",
        )}
      >
        {title}
      </p>
      {caption && (
        <p className="relative shrink-0 text-caption-12 text-text-secondary">
          {caption}
        </p>
      )}
    </div>
  );
}
