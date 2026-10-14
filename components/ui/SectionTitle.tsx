import { cn } from "@/lib/cn";

/** Figma: Pattern/Section Title (74:3161) — H3 heading + caption. */
export function SectionTitle({
  title,
  caption,
  className,
}: {
  title: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 flex-col items-start gap-[4px] overflow-clip",
        className,
      )}
    >
      <p className="relative shrink-0 text-h3-18">{title}</p>
      {caption && (
        <p className="relative shrink-0 text-caption-12 text-text-secondary">
          {caption}
        </p>
      )}
    </div>
  );
}
